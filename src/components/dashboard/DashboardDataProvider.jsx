import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { DashboardDataContext } from "./DashboardDataContext";

const ADMIN_COLLECTIONS = [
  { collection: "orders", label: "Order", path: "/admin/orders", type: "order" },
  { collection: "products", label: "Product", path: "/admin/products", type: "product" },
  { collection: "users", label: "Customer", path: "/admin/users", type: "customer" },
  { collection: "partners", label: "Partner", path: "/admin/users", type: "partner" },
  { collection: "partnerApplications", label: "Partner application", path: "/admin/partner-applications", type: "application" },
  { collection: "partnerCoupons", label: "Partner coupon", path: "/admin/partner-coupons", type: "coupon" },
  { collection: "productRequests", label: "Product request", path: "/admin/product-requests", type: "request" },
  { collection: "reviews", label: "Review", path: "/admin/reviews", type: "review" },
];

const PARTNER_SECTIONS = [
  { collection: "products", label: "Product", path: "/partner-dashboard/products", type: "product" },
  { collection: "orders", label: "Order", path: "/partner-dashboard/orders", type: "order" },
  { collection: "reviews", label: "Review", path: "/partner-dashboard/reviews", type: "review" },
];

const sensitiveField = /password|token|secret|credential/i;

function searchableText(value, depth = 0) {
  if (depth > 3 || value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((item) => searchableText(item, depth + 1)).join(" ");
  if (typeof value !== "object") return "";
  return Object.entries(value)
    .filter(([key]) => !sensitiveField.test(key))
    .map(([, item]) => searchableText(item, depth + 1))
    .join(" ");
}

function timestampValue(value) {
  if (value?.toMillis) return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function recordFromDocument(definition, snapshot) {
  const data = snapshot.data();
  const name = data.name || data.title || data.businessName || data.displayName || data.email || snapshot.id;
  const updatedAt = data.updatedAt || data.createdAt || data.timestamp || null;
  const state = `${data.status || ""}:${timestampValue(updatedAt)}`;
  return {
    key: `${definition.collection}:${snapshot.id}`,
    id: snapshot.id,
    collection: definition.collection,
    label: `${definition.label}: ${name}`,
    subtitle: `ID ${snapshot.id}`,
    path: definition.path,
    type: definition.type,
    searchText: `${name} ${snapshot.id} ${searchableText(data)}`.toLowerCase(),
    updatedAt,
    notificationId: `${definition.collection}:${snapshot.id}:${state}`,
  };
}

function relativeTime(value) {
  const elapsed = Date.now() - timestampValue(value);
  if (!elapsed || elapsed < 0) return "Recently updated";
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function DashboardDataProvider({ role, children }) {
  const [records, setRecords] = useState([]);
  const [errors, setErrors] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`zyvar-${role}-notification-reads`) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Unable to load dashboard notification state:", error);
      return [];
    }
  });

  useEffect(() => {
    const subscriptions = [];
    const partnerSubscriptions = [];
    let subscribedPartnerSlug = "";
    let cancelled = false;
    const nextRecords = new Map();
    const nextErrors = new Set();
    const publishRecords = () => {
      if (!cancelled) setRecords([...nextRecords.values()]);
    };
    const reportError = (name, error) => {
      console.error(`Unable to load dashboard ${name}:`, error);
      nextErrors.add(name);
      if (!cancelled) setErrors([...nextErrors]);
    };

    if (role === "admin") {
      ADMIN_COLLECTIONS.forEach((definition) => {
        const unsubscribe = onSnapshot(
          collection(db, definition.collection),
          (snapshot) => {
            [...nextRecords.keys()]
              .filter((key) => key.startsWith(`${definition.collection}:`))
              .forEach((key) => nextRecords.delete(key));
            snapshot.docs
              .map((item) => recordFromDocument(definition, item))
              .forEach((record) => nextRecords.set(record.key, record));
            nextErrors.delete(definition.collection);
            setErrors([...nextErrors]);
            publishRecords();
          },
          (error) => reportError(definition.collection, error),
        );
        subscriptions.push(unsubscribe);
      });
    } else {
      const user = auth.currentUser;
      if (user) {
        const partnerUnsubscribe = onSnapshot(
          doc(db, "partners", user.uid),
          (partnerSnapshot) => {
            const partnerData = partnerSnapshot.data();
            if (!partnerData) {
              reportError("partner profile", new Error("The partner profile could not be found."));
              return;
            }
            const partnerRecord = recordFromDocument(
              { collection: "partners", label: "Store", path: "/partner-dashboard/settings", type: "settings" },
              partnerSnapshot,
            );
            nextRecords.set(partnerRecord.key, partnerRecord);
            publishRecords();

            const partnerSlug = partnerData.slug || "";
            const subscriptionKey = partnerSlug || "__missing-slug";
            if (subscriptionKey === subscribedPartnerSlug) return;
            subscribedPartnerSlug = subscriptionKey;
            partnerSubscriptions.forEach((unsubscribe) => unsubscribe());
            partnerSubscriptions.length = 0;
            [...nextRecords.keys()]
              .filter((key) => !key.startsWith("partners:"))
              .forEach((key) => nextRecords.delete(key));
            nextRecords.set(partnerRecord.key, partnerRecord);

            const productDefinition = PARTNER_SECTIONS[0];
            partnerSubscriptions.push(onSnapshot(
              query(collection(db, "products"), where("partnerId", "==", user.uid)),
              (snapshot) => {
                [...nextRecords.keys()]
                  .filter((key) => key.startsWith("products:"))
                  .forEach((key) => nextRecords.delete(key));
                snapshot.docs
                  .map((item) => recordFromDocument(productDefinition, item))
                  .forEach((record) => nextRecords.set(record.key, record));
                nextErrors.delete("products");
                setErrors([...nextErrors]);
                publishRecords();
              },
              (error) => reportError("products", error),
            ));

            if (!partnerSlug) {
              reportError("partner profile", new Error("The partner profile has no store slug."));
              return;
            }
            nextErrors.delete("partner profile");
            setErrors([...nextErrors]);

            const orderDefinition = PARTNER_SECTIONS[1];
            partnerSubscriptions.push(onSnapshot(collection(db, "orders"), (snapshot) => {
              [...nextRecords.keys()]
                .filter((key) => key.startsWith("orders:"))
                .forEach((key) => nextRecords.delete(key));
              snapshot.docs
                .filter((item) => item.data().items?.some((product) => product.partnerSlug === partnerSlug))
                .map((item) => recordFromDocument(orderDefinition, item))
                .forEach((record) => nextRecords.set(record.key, record));
              nextErrors.delete("orders");
              setErrors([...nextErrors]);
              publishRecords();
            }, (error) => reportError("orders", error)));

            const reviewDefinition = PARTNER_SECTIONS[2];
            partnerSubscriptions.push(onSnapshot(
              query(collection(db, "reviews"), where("partnerSlug", "==", partnerSlug)),
              (snapshot) => {
                [...nextRecords.keys()]
                  .filter((key) => key.startsWith("reviews:"))
                  .forEach((key) => nextRecords.delete(key));
                snapshot.docs
                  .map((item) => recordFromDocument(reviewDefinition, item))
                  .forEach((record) => nextRecords.set(record.key, record));
                nextErrors.delete("reviews");
                setErrors([...nextErrors]);
                publishRecords();
              },
              (error) => reportError("reviews", error),
            ));
          },
          (error) => reportError("partner profile", error),
        );
        subscriptions.push(partnerUnsubscribe);
      } else {
        reportError("partner profile", new Error("No signed-in partner was found."));
      }
    }

    return () => {
      cancelled = true;
      subscriptions.forEach((unsubscribe) => unsubscribe());
      partnerSubscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [role]);

  const notifications = useMemo(() => records
    .filter((record) => ["order", "application", "request", "customer", "partner", "settings", "product", "review", "coupon"].includes(record.type))
    .sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt))
    .slice(0, 20)
    .map((record) => ({
      id: record.notificationId,
      type: record.type,
      message: `${record.label} updated`,
      path: record.path,
      time: relativeTime(record.updatedAt),
      read: readNotificationIds.includes(record.notificationId),
    })), [records, readNotificationIds]);

  const markNotificationRead = useCallback((id) => {
    setReadNotificationIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      localStorage.setItem(`zyvar-${role}-notification-reads`, JSON.stringify(next));
      return next;
    });
  }, [role]);

  const markAllNotificationsRead = useCallback(() => {
    const next = [...new Set([...readNotificationIds, ...notifications.map(({ id }) => id)])];
    localStorage.setItem(`zyvar-${role}-notification-reads`, JSON.stringify(next));
    setReadNotificationIds(next);
  }, [notifications, readNotificationIds, role]);

  const value = useMemo(() => ({
    records,
    errors,
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    markNotificationRead,
    markAllNotificationsRead,
  }), [records, errors, notifications, markNotificationRead, markAllNotificationsRead]);

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}
