const admin = require("firebase-admin");

const STORE_CACHE_TTL_MS = 5 * 60 * 1000;
let storeCache = {
  expiresAt: 0,
  stores: [],
};

function safeText(value, maxLength = 240) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function getPublicPartnerStores() {
  if (storeCache.expiresAt > Date.now()) return storeCache.stores;

  const snapshot = await admin
    .firestore()
    .collection("partnerApplications")
    .where("status", "==", "approved")
    .get();

  const stores = snapshot.docs
    .map((document) => {
      const data = document.data() || {};
      if (!data.slug || !data.shopName) return null;
      return {
        id: document.id,
        name: safeText(data.shopName, 100),
        slug: safeText(data.slug, 120),
        description: safeText(data.description, 360),
        address: safeText(data.address, 180),
        logo: safeText(data.logo, 1000),
        banner: safeText(data.banner, 1000),
        category: safeText(data.category, 100),
      };
    })
    .filter(Boolean);

  storeCache = {
    expiresAt: Date.now() + STORE_CACHE_TTL_MS,
    stores,
  };
  return stores;
}

function findRelevantPartnerStores(message, stores) {
  const normalized = message.toLowerCase();
  const asksForStores =
    /\b(partner|partners|store|stores|shop|shops|seller|sellers|near me|where to buy)\b/i.test(message) ||
    /পার্টনার|স্টোর|দোকান|শপ/.test(message);

  if (!asksForStores) return [];

  const stopWords = new Set(["all", "and", "are", "about", "find", "me", "show", "the", "where", "store", "stores", "partner", "partners", "shop", "shops"]);
  const terms = normalized
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 2 && !stopWords.has(term));
  const matches = stores.filter((store) => {
    const searchable = `${store.name} ${store.slug} ${store.description} ${store.address} ${store.category}`.toLowerCase();
    return terms.some((term) => searchable.includes(term));
  });

  return (matches.length ? matches : stores).slice(0, 50);
}

module.exports = {
  getPublicPartnerStores,
  findRelevantPartnerStores,
};
