import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import app, { firebaseConfig } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

const API_BASE =
  import.meta.env.VITE_NOTIFICATION_API_URL ||
  "https://zyvar-email-server.onrender.com/api/notifications";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FEED_DB = "zyvar-notifications";
const FEED_STORE = "notifications";
const foregroundSubscribers = new Set();
let foregroundListenerPromise;

function openFeed() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FEED_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(FEED_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizeNotification(data = {}) {
  return {
    id: data.id || data.messageId || `${Date.now()}-${Math.random()}`,
    title: data.title || "ZYVAR update",
    body: data.body || "",
    category: data.category || "message",
    url: data.url || "/",
    createdAt: data.createdAt || new Date().toISOString(),
    read: Boolean(data.read),
  };
}

export async function saveNotification(data) {
  const notification = normalizeNotification(data);
  const database = await openFeed();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(FEED_STORE, "readwrite");
    const store = transaction.objectStore(FEED_STORE);
    store.put(notification);
    const allRequest = store.getAll();
    allRequest.onsuccess = () => {
      allRequest.result
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(50)
        .forEach((item) => store.delete(item.id));
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();
  window.dispatchEvent(new CustomEvent("zyvar:notification", { detail: notification }));
  return notification;
}

export async function getSavedNotifications() {
  const database = await openFeed();
  const notifications = await new Promise((resolve, reject) => {
    const request = database
      .transaction(FEED_STORE, "readonly")
      .objectStore(FEED_STORE)
      .getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return notifications.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export async function markNotificationsRead() {
  const database = await openFeed();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(FEED_STORE, "readwrite");
    const store = transaction.objectStore(FEED_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      request.result.forEach((item) => store.put({ ...item, read: true }));
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function getMessagingInstance() {
  if (!(await isSupported())) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  return getMessaging(app);
}

async function getFirebaseMessagingWorker() {
  const encodedConfig = btoa(JSON.stringify(firebaseConfig));
  const workerUrl = new URL("/firebase-messaging-sw.js", window.location.origin);
  workerUrl.searchParams.set("config", encodedConfig);
  const registration = await navigator.serviceWorker.register(workerUrl, {
    scope: "/notification-worker/",
  });

  const worker = registration.installing || registration.waiting;
  if (worker && worker.state !== "activated") {
    await new Promise((resolve, reject) => {
      const handleStateChange = () => {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", handleStateChange);
          resolve();
        } else if (worker.state === "redundant") {
          worker.removeEventListener("statechange", handleStateChange);
          reject(new Error("Could not start the notification service worker."));
        }
      };
      worker.addEventListener("statechange", handleStateChange);
      handleStateChange();
    });
  }
  return registration;
}

export async function enablePushNotifications() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  if (!VAPID_KEY) {
    throw new Error("Push notifications need VITE_FIREBASE_VAPID_KEY configured.");
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    throw new Error(
      "Notifications are blocked. Allow them in your browser or device settings, then try again.",
    );
  }

  const [messaging, serviceWorkerRegistration] = await Promise.all([
    getMessagingInstance(),
    getFirebaseMessagingWorker(),
  ]);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration,
  });
  if (!token) {
    throw new Error("Could not register this device for notifications.");
  }

  const response = await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Could not enable push notifications.");
  }

  window.dispatchEvent(new Event("zyvar:notification-permission"));
  return messaging;
}

export async function listenForNotifications(onNotification) {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    !(await isSupported())
  ) {
    return () => {};
  }

  foregroundSubscribers.add(onNotification);
  if (!foregroundListenerPromise) {
    foregroundListenerPromise = getMessagingInstance().then((messaging) =>
      onMessage(messaging, async (payload) => {
        const notification = await saveNotification(payload.data || {});
        foregroundSubscribers.forEach((subscriber) => subscriber(notification));
        new Notification(notification.title, {
          body: notification.body,
          icon: "/android-chrome-192x192.png",
          data: { url: notification.url },
        });
      }),
    );
  }

  try {
    await foregroundListenerPromise;
  } catch (error) {
    foregroundSubscribers.delete(onNotification);
    foregroundListenerPromise = undefined;
    throw error;
  }

  return () => foregroundSubscribers.delete(onNotification);
}

export async function sendBroadcastNotification(message) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in with an admin account to send a notice.");

  const response = await fetch(`${API_BASE}/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify(message),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not send this notification.");
  }
  return result;
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function isPushConfigured() {
  return Boolean(VAPID_KEY);
}
