import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

function isAppInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallAppBanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isAppInstalled);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const isIos =
    /iPhone|iPad|iPod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  useEffect(() => {
    const capturePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const markInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!installPrompt) {
      setShowIosHelp(true);
      return;
    }

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-[#C6922B]/20 bg-gradient-to-r from-[#C6922B]/10 via-white/[0.03] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C6922B]/15 text-[#D4AF37]">
            <Smartphone size={23} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">Take ZYVAR with you</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-gray-400 sm:text-sm">
              Install the app for a faster experience and timely order updates.
              New versions can be installed from the in-app update prompt.
            </p>
            {showIosHelp && (
              <p className="mt-3 text-xs leading-5 text-[#E3BB68]">
                {isIos
                  ? "On iPhone or iPad, tap Share in Safari, then choose “Add to Home Screen”."
                  : "Open your browser menu and choose Install app or Add to Home Screen if available."}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={install}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C6922B] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#ddb451]"
        >
          <Download size={17} />
          {installPrompt ? "Install app" : isIos ? "Add to Home Screen" : "Get the app"}
        </button>
      </div>
    </section>
  );
}
