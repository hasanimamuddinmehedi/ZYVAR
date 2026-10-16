import { useCallback, useEffect, useRef, useState } from "react";
import { FaMagic, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import {
  analyzeProductName,
  suggestProductPrice,
  findProductImages,
} from "../../utils/productAI";
import { confirmAlert } from "../../utils/alerts";

/**
 * Sits under the Product Name input (upload + edit pages, admin + partner).
 *
 *  - checks the product name (and offers a better one)
 *  - picks the best category, or creates a new one
 *  - writes the description
 *  - researches a price and finds product pictures online
 *
 * Results that other fields need (benefits, price, images) are pushed to the
 * parent through onMeta so PriceSuggestion / image tools can use them.
 *
 * auto=true  -> runs by itself shortly after the name is typed and only fills
 *               EMPTY category / description (never overwrites the seller).
 * auto=false -> runs when the seller presses the button (edit page).
 */
export default function ProductAIAssistant({
  name,
  onNameChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  categories,
  onNewCategory,
  onMeta,
  auto = false,
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [catNote, setCatNote] = useState(null);

  const runId = useRef(0);
  const lastAnalyzed = useRef("");
  const latest = useRef({});
  const cb = useRef({});

  // keep the latest props available to async callbacks
  useEffect(() => {
    latest.current = { category, description, categories };
    cb.current = { onCategoryChange, onDescriptionChange, onNewCategory, onMeta };
  });

  const run = useCallback(
    async (targetName, { force = false } = {}) => {
      const clean = targetName.trim();
      if (clean.length < 3) return;

      const id = ++runId.current;
      lastAnalyzed.current = clean.toLowerCase();
      setStatus("loading");
      setError("");

      cb.current.onMeta?.({ price: { status: "idle" }, images: { status: "idle" } });

      try {
        const { category: curCat, description: curDesc, categories: cats } = latest.current;

        const data = await analyzeProductName({
          name: clean,
          categories: cats,
          description: curDesc,
        });
        if (id !== runId.current) return;

        setResult(data);
        setStatus("done");

        // CATEGORY
        let pickedCategory = curCat;
        if (data.category?.name) {
          if (data.category.isNew) cb.current.onNewCategory?.(data.category.name);
          if (force || !curCat) {
            cb.current.onCategoryChange(data.category.name);
            pickedCategory = data.category.name;
            setCatNote({ name: data.category.name, isNew: data.category.isNew });
          }
        }

        // DESCRIPTION
        if (data.description && (force || !curDesc.trim())) {
          cb.current.onDescriptionChange(data.description);
        }

        cb.current.onMeta?.({ benefits: data.benefits || [] });

        // PRICE + IMAGES run in the background (they research the web)
        cb.current.onMeta?.({ price: { status: "loading" }, images: { status: "loading" } });

        suggestProductPrice({ name: clean, category: pickedCategory })
          .then((p) => id === runId.current && cb.current.onMeta?.({ price: { status: "done", ...p } }))
          .catch((e) =>
            id === runId.current &&
            cb.current.onMeta?.({ price: { status: "error", message: e.message } })
          );

        findProductImages({ name: clean })
          .then((r) => id === runId.current && cb.current.onMeta?.({ images: { status: "done", list: r.images || [] } }))
          .catch((e) =>
            id === runId.current &&
            cb.current.onMeta?.({ images: { status: "error", message: e.message, list: [] } })
          );
      } catch (e) {
        if (id !== runId.current) return;
        setStatus("error");
        setError(e.message || "AI is unavailable right now.");
        cb.current.onMeta?.({ price: { status: "idle" }, images: { status: "idle" } });
      }
    },
    []
  );

  // AUTO MODE — debounce after typing stops
  useEffect(() => {
    if (!auto) return undefined;
    const clean = name.trim();
    if (clean.length < 3 || clean.toLowerCase() === lastAnalyzed.current) return undefined;

    const t = setTimeout(() => run(clean), 1600);
    return () => clearTimeout(t);
  }, [name, auto, run]);

  const handleManual = async () => {
    if (latest.current.description.trim()) {
      const res = await confirmAlert(
        "Let AI rewrite?",
        "AI will replace the current category and description with new suggestions."
      );
      if (!res.isConfirmed) return;
    }
    run(name, { force: true });
  };

  const applySuggestedName = () => {
    const suggested = result?.nameCheck?.suggestedName;
    if (!suggested) return;
    lastAnalyzed.current = suggested.trim().toLowerCase();
    onNameChange(suggested);
    setResult((r) => r && { ...r, nameCheck: { ...r.nameCheck, ok: true, issues: [] } });
  };

  const nc = result?.nameCheck;
  const loading = status === "loading";

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleManual}
          disabled={loading || name.trim().length < 3}
          className="px-4 py-2 rounded-xl border border-[#C6922B]/40 bg-[#C6922B]/10 text-[#C6922B] text-sm font-bold flex items-center gap-2 hover:bg-[#C6922B]/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaMagic size={12} />
          {loading ? "AI is working…" : auto ? "Re-run AI" : "AI Check & Autofill"}
        </button>

        {auto && status === "idle" && (
          <span className="text-xs text-gray-500">
            Type the product name — AI will check it and fill category, description and price.
          </span>
        )}
        {loading && <span className="text-xs text-gray-400 animate-pulse">Checking name, category and description…</span>}
      </div>

      {status === "error" && (
        <p className="text-xs text-amber-400">
          {error} You can keep filling the form manually.
        </p>
      )}

      {nc && status !== "loading" && (
        nc.ok ? (
          <p className="text-sm text-emerald-400 flex items-center gap-2">
            <FaCheckCircle /> Product name looks good{nc.score ? ` (${nc.score}/100)` : ""}.
          </p>
        ) : (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <p className="text-amber-400 font-bold flex items-center gap-2 mb-2">
              <FaExclamationTriangle /> Name could be better
            </p>
            <ul className="text-gray-300 list-disc pl-5 space-y-1 mb-3">
              {nc.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            {nc.suggestedName && nc.suggestedName.toLowerCase() !== name.trim().toLowerCase() && (
              <button
                type="button"
                onClick={applySuggestedName}
                className="px-4 py-2 rounded-xl bg-[#C6922B] text-black font-bold text-sm"
              >
                Use “{nc.suggestedName}”
              </button>
            )}
          </div>
        )
      )}

      {catNote && status !== "loading" && (
        <p className="text-xs text-gray-400">
          AI {catNote.isNew ? "created a new category" : "selected the category"}{" "}
          <span className="text-[#C6922B] font-bold">{catNote.name}</span>. You can change it below.
        </p>
      )}
    </div>
  );
}
