import { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Send,
  X,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { ADMIN_EMAILS } from "../utils/adminCheck";
import {
  enablePushNotifications,
  getNotificationPermission,
  getSavedNotifications,
  listenForNotifications,
  markNotificationsRead,
  sendBroadcastNotification,
} from "../utils/notifications";

const emptyMessage = {
  title: "",
  body: "",
  category: "notice",
  url: "/",
};

const categoryLabels = {
  message: "Message",
  notice: "Notice",
  incident: "Incident",
  "order-update": "Order update",
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState(getNotificationPermission);
  const [user, setUser] = useState(auth.currentUser);
  const [message, setMessage] = useState(emptyMessage);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase());
  const unreadCount = notifications.filter((item) => !item.read).length;

  const refreshNotifications = async () => {
    try {
      setNotifications(await getSavedNotifications());
    } catch (error) {
      console.error("Could not load saved notifications:", error);
      setFeedback("Could not load notification history on this device.");
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    const refresh = () => refreshNotifications();
    const handleWorkerMessage = (event) => {
      if (event.data?.type === "zyvar:notification-opened") {
        refreshNotifications();
      }
    };
    window.addEventListener("zyvar:notification", refresh);
    window.addEventListener("zyvar:notification-permission", refresh);
    navigator.serviceWorker?.addEventListener("message", handleWorkerMessage);
    refresh();

    return () => {
      unsubscribeAuth();
      window.removeEventListener("zyvar:notification", refresh);
      window.removeEventListener("zyvar:notification-permission", refresh);
      navigator.serviceWorker?.removeEventListener("message", handleWorkerMessage);
    };
  }, []);

  useEffect(() => {
    let stopListening = () => {};
    listenForNotifications((notification) => {
      setNotifications((previous) => [
        notification,
        ...previous.filter((item) => item.id !== notification.id),
      ]);
    })
      .then((unsubscribe) => {
        stopListening = unsubscribe;
      })
      .catch((error) => console.error("Notification listener failed:", error));

    const updatePermission = () => setPermission(getNotificationPermission());
    window.addEventListener("zyvar:notification-permission", updatePermission);
    return () => {
      stopListening();
      window.removeEventListener("zyvar:notification-permission", updatePermission);
    };
  }, [permission]);

  const markRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true })),
      );
    } catch (error) {
      console.error("Could not mark notifications as read:", error);
      setFeedback("Could not update notification status.");
    }
  };

  const enableNotifications = async () => {
    setBusy(true);
    setFeedback("");
    try {
      await enablePushNotifications();
      setPermission(getNotificationPermission());
      setFeedback("Notifications are enabled on this device.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      await sendBroadcastNotification(message);
      setFeedback("Notification sent to all subscribed devices.");
      setMessage(emptyMessage);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          refreshNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-[#C6922B] hover:text-[#C6922B]"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C6922B] px-1 text-[9px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-full z-[11000] mt-3 max-h-[min(80vh,42rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-[#C6922B]/25 bg-[#0B0B0B]/95 p-4 text-white shadow-2xl backdrop-blur-2xl sm:w-[25rem]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Notifications</h2>
              <p className="mt-1 text-xs text-gray-400">
                Important updates for your device
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markRead}
                  aria-label="Mark all notifications as read"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {permission !== "granted" && (
            <div className="mb-4 rounded-xl border border-[#C6922B]/20 bg-[#C6922B]/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E3BB68]">
                <BellRing size={16} />
                {permission === "denied"
                  ? "Notifications are blocked"
                  : permission === "unsupported"
                    ? "Notifications unavailable"
                    : "Enable device notifications"}
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-300">
                {permission === "denied"
                  ? "Allow notifications for this site in your browser or device settings."
                  : permission === "unsupported"
                    ? "Use a supported browser and secure connection to receive push alerts."
                    : "Receive notices and order updates even when Zyvar is not open."}
              </p>
              {permission === "default" && (
                <button
                  type="button"
                  onClick={enableNotifications}
                  disabled={busy}
                  className="mt-3 rounded-lg bg-[#C6922B] px-3 py-2 text-xs font-bold text-black disabled:opacity-60"
                >
                  {busy ? "Enabling…" : "Enable notifications"}
                </button>
              )}
            </div>
          )}

          {feedback && (
            <p role="status" className="mb-3 rounded-lg bg-white/5 p-2 text-xs text-gray-200">
              {feedback}
            </p>
          )}

          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="rounded-xl border border-white/10 p-4 text-center text-sm text-gray-400">
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (
                      notification.url?.startsWith("/") &&
                      !notification.url.startsWith("//")
                    ) {
                      navigate(notification.url);
                    }
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition hover:border-[#C6922B]/40 ${
                    notification.read
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-[#C6922B]/20 bg-[#C6922B]/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{notification.title}</span>
                    <span className="shrink-0 text-[10px] text-[#D4AF37]">
                      {categoryLabels[notification.category] || "Message"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-300">{notification.body}</p>
                  <time className="mt-2 block text-[10px] text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </button>
              ))
            )}
          </div>

          {isAdmin && (
            <form onSubmit={sendMessage} className="mt-5 border-t border-white/10 pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Send size={15} className="text-[#C6922B]" />
                Send to all subscribed devices
              </h3>
              <select
                value={message.category}
                onChange={(event) =>
                  setMessage((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }))
                }
                className="mb-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-xs text-white outline-none focus:border-[#C6922B]"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                value={message.title}
                onChange={(event) =>
                  setMessage((previous) => ({ ...previous, title: event.target.value }))
                }
                required
                maxLength={80}
                placeholder="Title"
                className="mb-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-500 focus:border-[#C6922B]"
              />
              <textarea
                value={message.body}
                onChange={(event) =>
                  setMessage((previous) => ({ ...previous, body: event.target.value }))
                }
                required
                maxLength={240}
                rows={3}
                placeholder="Write an important update…"
                className="w-full resize-y rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-500 focus:border-[#C6922B]"
              />
              <input
                value={message.url}
                onChange={(event) =>
                  setMessage((previous) => ({ ...previous, url: event.target.value }))
                }
                maxLength={200}
                placeholder="In-app link (optional)"
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-500 focus:border-[#C6922B]"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-3 w-full rounded-lg bg-[#C6922B] px-3 py-2.5 text-xs font-bold text-black transition hover:bg-[#ddb451] disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send notification"}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
