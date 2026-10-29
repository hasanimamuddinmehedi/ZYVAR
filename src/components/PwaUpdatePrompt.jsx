import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export default function PwaUpdatePrompt() {
  const [available, setAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const showPrompt = () => setAvailable(true);
    window.addEventListener("zyvar:pwa-update", showPrompt);
    return () => window.removeEventListener("zyvar:pwa-update", showPrompt);
  }, []);

  if (!available) return null;

  const updateApp = async () => {
    setUpdating(true);
    setUpdateError("");
    try {
      if (typeof window.zyvarApplyPwaUpdate !== "function") {
        throw new Error("The app update service is unavailable. Reload the page and try again.");
      }
      await window.zyvarApplyPwaUpdate();
    } catch (error) {
      console.error("Could not update the Zyvar app:", error);
      setUpdateError(error.message);
      setUpdating(false);
    }
  };

  return (
    <aside
      role="status"
      className="fixed inset-x-3 top-20 z-[11000] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-[#C6922B]/30 bg-[#101010]/95 p-4 text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6922B]/15 text-[#C6922B]">
        <RefreshCw size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">A Zyvar update is ready</p>
        <p className="mt-1 text-xs text-gray-400">Update now to get the latest version.</p>
        {updateError && <p role="alert" className="mt-1 text-xs text-red-300">{updateError}</p>}
      </div>
      <button
        type="button"
        onClick={updateApp}
        disabled={updating}
        className="shrink-0 rounded-lg bg-[#C6922B] px-3 py-2 text-xs font-bold text-black disabled:opacity-60"
      >
        {updating ? "Updating…" : "Update"}
      </button>
      <button
        type="button"
        onClick={() => setAvailable(false)}
        aria-label="Dismiss update notice"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
      >
        <X size={16} />
      </button>
    </aside>
  );
}
