import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaPlus, FaCamera, FaUpload, FaTimes, FaMagic, FaImage, FaEraser, FaCrown, FaCheck,
} from "react-icons/fa";
import {
  urlToBlob, limitImageSize, removeBackground, blobToFile,
} from "../../utils/imageTools";
import { renderZyvarTemplate } from "../../utils/zyvarTemplate";
import { analyzeProductName } from "../../utils/productAI";

/* ------------------------------------------------------------------------
   CAMERA — take an instant picture
------------------------------------------------------------------------ */
export function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fallbackRef = useRef(null);
  const [error, setError] = useState("");
  const [facing, setFacing] = useState("environment");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Live camera isn't supported in this browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch {
        setError("Camera permission was denied or no camera was found.");
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#101010] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <FaCamera className="text-[#C6922B]" /> Take a photo
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-amber-400 text-sm mb-5">{error}</p>
            <button
              type="button"
              onClick={() => fallbackRef.current?.click()}
              className="px-5 py-3 rounded-xl bg-[#C6922B] text-black font-bold"
            >
              Open phone camera
            </button>
            <input
              ref={fallbackRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onCapture(e.target.files[0])}
            />
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3]">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                type="button"
                onClick={() => {
                  setReady(false);
                  setFacing((f) => (f === "environment" ? "user" : "environment"));
                }}
                className="px-4 py-3 rounded-xl bg-white/10 text-sm"
              >
                Flip
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={capture}
                className="w-16 h-16 rounded-full bg-white border-4 border-[#C6922B] disabled:opacity-40"
                aria-label="Capture photo"
              />
              <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl bg-white/10 text-sm">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   ADD TILE — "+" with Upload / Take photo
------------------------------------------------------------------------ */
export function ImageAddTile({ sizeClass = "w-28 h-28", disabled, busy, onPick }) {
  const [open, setOpen] = useState(false);
  const [camera, setCamera] = useState(false);
  const fileRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((o) => !o)}
        className={`${sizeClass} rounded-2xl border border-dashed border-white/20 bg-black/30 flex items-center justify-center hover:border-[#C6922B] transition disabled:opacity-60`}
        aria-label="Add image"
      >
        {busy ? (
          <div className="w-5 h-5 border-2 border-[#C6922B] border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaPlus className="text-[#C6922B] text-xl" />
        )}
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-52 rounded-2xl border border-white/10 bg-[#141414] shadow-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
            className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-white/5"
          >
            <FaUpload className="text-[#C6922B]" /> Upload from device
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCamera(true);
            }}
            className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-white/5 border-t border-white/5"
          >
            <FaCamera className="text-[#C6922B]" /> Take a photo
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (files.length) onPick(files);
        }}
      />

      {camera && (
        <CameraModal
          onClose={() => setCamera(false)}
          onCapture={(file) => {
            setCamera(false);
            onPick([file]);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------
   ONLINE SUGGESTIONS — pictures AI found for the product name
------------------------------------------------------------------------ */
export function OnlineImageSuggestions({ images, onSelect, disabled }) {
  const [broken, setBroken] = useState({});
  if (!images || images.status === "idle") return null;

  if (images.status === "loading") {
    return (
      <p className="mb-4 text-xs text-gray-400 animate-pulse flex items-center gap-2">
        <FaMagic /> AI is looking for this product’s picture online…
      </p>
    );
  }

  const list = (images.list || []).filter((i) => !broken[i.proxyUrl]);
  if (images.status === "error" || !list.length) {
    return (
      <p className="mb-4 text-xs text-gray-500">
        {images.status === "error" && images.message
          ? `${images.message} `
          : "No online picture found automatically — "}
        Upload or take your own photo below.
      </p>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-[#C6922B]/30 bg-[#C6922B]/5 p-4">
      <p className="text-sm text-[#C6922B] font-bold mb-1 flex items-center gap-2">
        <FaMagic /> Found online for this product
      </p>
      <p className="text-xs text-gray-400 mb-3">
        Tap a picture to choose how to use it. Only use pictures you have the right to sell with.
      </p>
      <div className="flex flex-wrap gap-3">
        {list.map((img) => (
          <button
            type="button"
            key={img.proxyUrl}
            disabled={disabled}
            onClick={() => onSelect(img.proxyUrl)}
            title={img.source}
            className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-white hover:border-[#C6922B] transition disabled:opacity-50"
          >
            <img
              src={img.proxyUrl}
              alt={img.title || "product"}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={() => setBroken((b) => ({ ...b, [img.proxyUrl]: true }))}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   PROCESS MODAL — Raw  |  Erase background  |  Zyvar template
------------------------------------------------------------------------ */
const MODES = [
  { id: "raw", label: "Raw picture", hint: "Upload as it is", icon: FaImage },
  { id: "erase", label: "Erase background", hint: "Transparent cut-out", icon: FaEraser },
  { id: "template", label: "Zyvar template", hint: "Branded poster", icon: FaCrown },
];

export function ImageProcessModal({
  sources,
  name = "",
  benefits = [],
  storeName = "",
  applyLabel = "Use this image",
  onApply,
  onClose,
}) {
  const [mode, setMode] = useState("raw");
  const [eraseForTemplate, setEraseForTemplate] = useState(true);
  const [tplBenefits, setTplBenefits] = useState(["", "", ""].map((_, i) => benefits[i] || ""));
  const [originals, setOriginals] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [benefitsError, setBenefitsError] = useState("");
  const [applying, setApplying] = useState(false);

  const cutouts = useRef(new Map());
  const token = useRef(0);
  const triedBenefits = useRef(false);

  // LOAD SOURCES
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blobs = await Promise.all(
          sources.map(async (s) => limitImageSize(s.file ? s.file : await urlToBlob(s.url)))
        );
        if (!cancelled) setOriginals(blobs);
      } catch {
        if (!cancelled) {
          setError("Could not load this image. Try another one or upload your own.");
          setBusy(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IF NO BENEFITS YET, ASK AI FOR SHORT ONES (used by the template)
  useEffect(() => {
    if (triedBenefits.current || tplBenefits.some(Boolean) || !name.trim()) return;
    triedBenefits.current = true;
    analyzeProductName({ name, categories: [] })
      .then((d) => d.benefits?.length && setTplBenefits(["", "", ""].map((_, i) => d.benefits[i] || "")))
      .catch((requestError) => {
        setBenefitsError(requestError.message || "Could not generate product benefits.");
      });
  }, [name, tplBenefits]);

  const getCutout = useCallback(
    async (index, onProg) => {
      if (cutouts.current.has(index)) return cutouts.current.get(index);
      const out = await removeBackground(originals[index], onProg);
      cutouts.current.set(index, out);
      return out;
    },
    [originals]
  );

  const produce = useCallback(
    async (index, onProg) => {
      if (mode === "raw") return originals[index];
      if (mode === "erase") return getCutout(index, onProg);
      const base = eraseForTemplate ? await getCutout(index, onProg) : originals[index];
      return renderZyvarTemplate(base, {
        name,
        benefits: tplBenefits,
        storeName,
      });
    },
    [mode, originals, getCutout, eraseForTemplate, name, tplBenefits, storeName]
  );

  // LIVE PREVIEW (first image)
  useEffect(() => {
    if (!originals) return undefined;
    const my = ++token.current;

    const delay = mode === "template" ? 350 : 0; // debounce typing in benefits
    const t = setTimeout(async () => {
      setBusy(true);
      setError("");
      setProgress(0);
      try {
        const blob = await produce(0, (p) => my === token.current && setProgress(p));
        if (my !== token.current) return;
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
      } catch {
        if (my === token.current) {
          setError(
            mode === "raw"
              ? "Could not show the image."
              : "Background removal failed (the AI model needs internet). Try “Raw picture”."
          );
        }
      } finally {
        if (my === token.current) setBusy(false);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [originals, produce, mode]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleApply = async () => {
    try {
      setApplying(true);
      const files = [];
      for (let i = 0; i < originals.length; i += 1) {
        const blob = await produce(i);
        files.push(blobToFile(blob, `zyvar-${mode}-${Date.now()}-${i}`));
      }
      onApply(files);
    } catch {
      setError("Could not process the image. Try “Raw picture”.");
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-[#101010] border border-white/10 p-5 md:p-7 my-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-xl">
            How should we use this picture?
            {sources.length > 1 && (
              <span className="ml-2 text-sm text-gray-400 font-normal">({sources.length} images)</span>
            )}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {MODES.map(({ id, label, hint, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setMode(id)}
              className={`rounded-2xl border p-3 md:p-4 text-left transition ${
                mode === id
                  ? "border-[#C6922B] bg-[#C6922B]/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <Icon className={mode === id ? "text-[#C6922B]" : "text-gray-400"} />
              <p className="font-bold text-sm mt-2">{label}</p>
              <p className="text-[11px] text-gray-400">{hint}</p>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* PREVIEW */}
          <div
            className="relative rounded-2xl border border-white/10 aspect-square overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: "#1c1c1c",
              backgroundImage:
                "linear-gradient(45deg,#262626 25%,transparent 25%),linear-gradient(-45deg,#262626 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#262626 75%),linear-gradient(-45deg,transparent 75%,#262626 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
            }}
          >
            {previewUrl && !error && (
              <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
            )}
            {busy && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 text-sm">
                <div className="w-8 h-8 border-2 border-[#C6922B] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-300">
                  {mode === "raw" ? "Loading…" : progress > 0 && progress < 1
                    ? `Working… ${Math.round(progress * 100)}%`
                    : "Working… (first time downloads the AI model)"}
                </span>
              </div>
            )}
            {error && <p className="px-6 text-center text-amber-400 text-sm">{error}</p>}
          </div>

          {/* TEMPLATE SETTINGS */}
          <div className="text-sm">
            {mode === "raw" && (
              <p className="text-gray-400 leading-relaxed">
                The picture is uploaded exactly as it is (very large photos are only resized).
              </p>
            )}
            {mode === "erase" && (
              <p className="text-gray-400 leading-relaxed">
                The background is removed in your browser and the product is saved as a transparent PNG.
              </p>
            )}
            {mode === "template" && (
              <div className="space-y-4">
                <p className="text-gray-400 leading-relaxed">
                  Product picture, name{storeName ? ", store name" : ""} and the benefits below are
                  placed on the black &amp; gold ZYVAR poster automatically.
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eraseForTemplate}
                    onChange={(e) => setEraseForTemplate(e.target.checked)}
                    className="accent-[#C6922B] w-4 h-4"
                  />
                  <span className="text-gray-300">Erase background first (recommended)</span>
                </label>

                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Benefits shown with ✔
                  </p>
                  <div className="space-y-2">
                    {tplBenefits.map((b, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={40}
                        value={b}
                        placeholder={`Short benefit ${i + 1}${i === 2 ? " (optional)" : ""}`}
                        onChange={(e) =>
                          setTplBenefits((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                      />
                    ))}
                  </div>
                </div>

                {storeName && (
                  <p className="text-xs text-gray-500">
                    Store name on poster: <span className="text-[#C6922B]">{storeName}</span>
                  </p>
                )}
                {benefitsError && (
                  <p className="text-xs text-amber-400">
                    {benefitsError} You can enter the benefits manually.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-white/10 text-gray-300">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={busy || applying || !!error || !originals}
            className="px-6 py-3 rounded-xl bg-[#C6922B] text-black font-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheck size={12} /> {applying ? "Processing…" : applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
