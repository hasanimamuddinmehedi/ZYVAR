import { FaMagic } from "react-icons/fa";

const CONF = { high: "High confidence", medium: "Medium confidence", low: "Rough estimate" };

/** Shown under the Price input. `price` is aiMeta.price from the assistant. */
export default function PriceSuggestion({ price, onApply }) {
  if (!price || price.status === "idle") return null;

  if (price.status === "loading") {
    return (
      <p className="mt-3 text-xs text-gray-400 animate-pulse flex items-center gap-2">
        <FaMagic /> AI is researching a reasonable price online…
      </p>
    );
  }

  if (price.status === "error") {
    return (
      <p className="mt-3 text-xs text-gray-500">
        {price.message || "Price suggestion unavailable right now."} Enter a price manually.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#C6922B]/30 bg-[#C6922B]/5 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
            <FaMagic /> AI suggested price
          </p>
          <p className="text-2xl font-black text-[#C6922B]">
            ৳{price.suggested}
            <span className="ml-2 text-xs font-normal text-gray-400">
              range ৳{price.min} – ৳{price.max}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onApply(price.suggested)}
          className="px-4 py-2 rounded-xl bg-[#C6922B] text-black font-bold"
        >
          Use ৳{price.suggested}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
        {CONF[price.confidence] || CONF.low}
        {price.searched ? " · based on online research" : " · no online prices found"}
        {price.reasoning ? ` — ${price.reasoning}` : ""}
      </p>

      {price.sources?.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Sources:{" "}
          {price.sources.map((s, i) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="text-[#C6922B] hover:underline">
              {new URL(s.url).hostname.replace(/^www\./, "")}
              {i < price.sources.length - 1 ? ", " : ""}
            </a>
          ))}
        </p>
      )}
      <p className="mt-2 text-[11px] text-gray-600">Only a guide — you decide the final price.</p>
    </div>
  );
}
