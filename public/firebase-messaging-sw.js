importScripts(
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js",
);

const config = new URL(self.location.href).searchParams.get("config");
if (config) {
  firebase.initializeApp(JSON.parse(atob(config)));
  const messaging = firebase.messaging();

  function saveNotification(notification) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("zyvar-notifications", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("notifications", { keyPath: "id" });
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction("notifications", "readwrite");
        const store = transaction.objectStore("notifications");
        store.put(notification);
        const all = store.getAll();
        all.onsuccess = () => {
          all.result
            .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
            .slice(50)
            .forEach((item) => store.delete(item.id));
        };
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
      };
    });
  }

  messaging.onBackgroundMessage(async (payload) => {
    const data = payload.data || {};
    const notification = {
      id: data.id || payload.messageId || String(Date.now()),
      title: data.title || "ZYVAR update",
      body: data.body || "",
      category: data.category || "message",
      url: data.url || "/",
      createdAt: data.createdAt || new Date().toISOString(),
      read: false,
    };

    await saveNotification(notification);
    await self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      tag: notification.id,
      data: { notification, url: notification.url },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const path = event.notification.data?.url;
  const target = path?.startsWith("/") && !path.startsWith("//") ? path : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      async (clients) => {
        const client = clients.find(
          (item) => new URL(item.url).origin === self.location.origin,
        );
        if (client) {
          await client.navigate(target);
          await client.focus();
          client.postMessage({
            type: "zyvar:notification-opened",
            notification: event.notification.data?.notification,
          });
          return;
        }
        await self.clients.openWindow(target);
      },
    ),
  );
});
