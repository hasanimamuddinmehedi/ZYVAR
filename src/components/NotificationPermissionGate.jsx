import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import {
  enablePushNotifications,
  getNotificationPermission,
  isPushConfigured,
} from "../utils/notifications";

export default function NotificationPermissionGate() {
  const [permission, setPermission] = useState(getNotificationPermission);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const syncPermission = () => setPermission(getNotificationPermission());
    window.addEventListener("zyvar:notification-permission", syncPermission);
    return () =>
      window.removeEventListener("zyvar:notification-permission", syncPermission);
  }, []);

  if (permission !== "default" || !isPushConfigured()) return null;

  const requestPermission = async () => {
    setRequesting(true);
    setError("");
    try {
      await enablePushNotifications();
      setPermission(getNotificationPermission());
    } catch (requestError) {
      setError(requestError.message);
      setPermission(getNotificationPermission());
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-permission-title"
        className="w-full max-w-md rounded-3xl border border-[#C6922B]/30 bg-[#101010] p-6 text-white shadow-2xl sm:p-8"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C6922B]/15 text-[#C6922B]">
          <BellRing size={24} />
        </div>
        <h2 id="notification-permission-title" className="text-xl font-bold">
          Stay updated with ZYVAR
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Allow notifications for important notices, incidents, and order updates.
          Your browser will ask you to approve them.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={requestPermission}
          disabled={requesting}
          className="mt-6 w-full rounded-xl bg-[#C6922B] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#ddb451] disabled:opacity-60"
        >
          {requesting ? "Enabling…" : "Enable notifications"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">
          You can change this permission any time in your browser or device settings.
        </p>
      </section>
    </div>
  );
}
