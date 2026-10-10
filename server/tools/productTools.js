/* =========================================================================
   PRODUCT TOOLS — Zyvar AI, Step 2

   Narrowly-scoped, server-side-only functions the AI is allowed to call.
   These are the ONLY way the AI can touch Firestore product data — it never
   sees a Firestore query object, a collection name, or raw admin SDK access.
   Every function here:
     - reads ONLY the existing "products" collection (no other collection,
       no arbitrary collection name from the AI)
     - accepts a fixed, validated set of parameters (no arbitrary field
       names, no raw Firestore query expressions from the AI)
     - returns only a sanitized subset of fields (no Firestore metadata,
       no internal fields)

   Product schema (per the Step 1 audit) is NOT changed by this file:
     name, price, category, stock, description, images (or legacy image), slug,
     uploadedBy, partnerSlug, partnerId, createdAt
   ========================================================================= */

const admin = require("firebase-admin");

/* -------------------------------------------------------------------------
   Internal helpers
------------------------------------------------------------------------- */

// Only ever touch this one collection. Never derived from AI input.
const PRODUCTS_COLLECTION = "products";

// Reasonable hard caps — protects against abuse and runaway reads.
const MAX_SEARCH_RESULTS = 10;
const MAX_QUERY_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;
const PRODUCT_CACHE_TTL_MS = 60 * 1000;
let productCache = {
  expiresAt: 0,
  products: [],
};

function toSafeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function toSafeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Firestore document IDs: non-empty, no "/", reasonable length.
// This is intentionally conservative — it does not need to match every
// legal Firestore ID, only the ones this project actually generates
// (auto-IDs from addDoc()), while rejecting anything obviously unsafe.
function isValidProductId(id) {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length <= 200 &&
    !id.includes("/") &&
    !id.includes("..")
  );
}

// The exact, fixed set of fields the AI is ever allowed to see for a
// product. Anything else on the document (Firestore metadata, internal
// bookkeeping fields, etc.) is stripped out here.
function sanitizeProduct(id, data) {
  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    if (!image || typeof image !== "object") return "";
    return [image.secure_url, image.url, image.src].find(
      (url) => typeof url === "string" && url.trim(),
    ) || "";
  };
  const images = (Array.isArray(data.images) ? data.images : [data.images])
    .map(getImageUrl)
    .filter(Boolean);
  const legacyImage = getImageUrl(
    data.image || data.imageUrl || data.imageURL || data.image_url,
  );
  const imageUrl = images[0] || legacyImage || null;

  return {
    id,
    name: data.name ?? null,
    price: typeof data.price === "number" ? data.price : toSafeNumber(data.price),
    stock: typeof data.stock === "number" ? data.stock : toSafeNumber(data.stock),
    category: data.category ?? null,
    description: data.description ?? null,
    images,
    image: imageUrl,
    imageUrl,
    slug: data.slug ?? null,
    partnerSlug: data.partnerSlug ?? null,
  };
}

/* -------------------------------------------------------------------------
   1. searchProducts({ query, category, nameContains, minPrice, maxPrice, limit })
   -------------------------------------------------------------------------
   The existing "products" collection has no full-text search index, so
   read the catalog once per cache window and filter/rank it in memory
   against the existing fields (name, category, description, partnerSlug).
   This lets recommendations cover the full customer-visible catalog while
   limiting Firestore reads to one catalog fetch per minute per server.
------------------------------------------------------------------------- */
async function searchProducts(rawArgs = {}) {
  const query = toSafeString(rawArgs.query, MAX_QUERY_LENGTH).toLowerCase();
  const category = toSafeString(rawArgs.category, MAX_CATEGORY_LENGTH).toLowerCase();
  const nameContains = Array.isArray(rawArgs.nameContains)
    ? rawArgs.nameContains
        .map((term) => toSafeString(term, MAX_QUERY_LENGTH).toLowerCase())
        .filter(Boolean)
    : [];

  let minPrice = rawArgs.minPrice !== undefined ? toSafeNumber(rawArgs.minPrice) : null;
  let maxPrice = rawArgs.maxPrice !== undefined ? toSafeNumber(rawArgs.maxPrice) : null;

  if (minPrice !== null && minPrice < 0) minPrice = 0;
  if (maxPrice !== null && maxPrice < 0) maxPrice = null;

  let limit = toSafeNumber(rawArgs.limit);
  if (!limit || limit < 1) limit = MAX_SEARCH_RESULTS;
  limit = Math.min(limit, MAX_SEARCH_RESULTS);

  if (productCache.expiresAt <= Date.now()) {
    const snapshot = await admin
      .firestore()
      .collection(PRODUCTS_COLLECTION)
      .get();
    const products = [];
    snapshot.forEach((docSnap) => {
      products.push(sanitizeProduct(docSnap.id, docSnap.data() || {}));
    });
    productCache = {
      expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
      products,
    };
  }

  const matches = [];
  const queryTerms = query
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 2);

  productCache.products.forEach((data) => {

    const name = String(data.name || "").toLowerCase();
    if (nameContains.length > 0 && !nameContains.some((term) => name.includes(term))) return;
    const productCategory = String(data.category || "").toLowerCase();
    const description = String(data.description || "").toLowerCase();
    const partnerSlug = String(data.partnerSlug || "").toLowerCase();
    const searchableText = `${name} ${productCategory} ${description} ${partnerSlug}`;
    const matchedTerms = queryTerms.filter((term) => searchableText.includes(term)).length;

    // TEXT MATCH — only applied if a query was actually given.
    const matchesQuery =
      !query ||
      searchableText.includes(query) ||
      matchedTerms >= Math.max(1, Math.ceil(queryTerms.length * 0.6));

    if (!matchesQuery) return;

    // CATEGORY FILTER
    if (category && productCategory !== category) return;

    // PRICE FILTERS
    const price = toSafeNumber(data.price);
    if (minPrice !== null && (price === null || price < minPrice)) return;
    if (maxPrice !== null && (price === null || price > maxPrice)) return;

    matches.push({ id: data.id, data });
  });

  // Simple relevance ranking: exact/starting name matches first.
  matches.sort((a, b) => {
    const aName = String(a.data.name || "").toLowerCase();
    const bName = String(b.data.name || "").toLowerCase();
    const getScore = (data, productName) => {
      const searchableText = `${productName} ${data.category || ""} ${data.description || ""} ${data.partnerSlug || ""}`.toLowerCase();
      const matchedTerms = queryTerms.filter((term) => searchableText.includes(term)).length;
      return (productName.startsWith(query) ? 100 : 0) + matchedTerms;
    };
    const relevance = getScore(b.data, bName) - getScore(a.data, aName);
    if (relevance !== 0) return relevance;
    const aAvailable = Number(a.data.stock) > 0;
    const bAvailable = Number(b.data.stock) > 0;
    return Number(bAvailable) - Number(aAvailable);
  });

  const results = matches
    .slice(0, limit)
    .map(({ id, data }) => sanitizeProduct(id, data));

  return {
    query: rawArgs.query ?? null,
    resultCount: results.length,
    products: results,
  };
}

/* -------------------------------------------------------------------------
   2. getProductDetails({ productId })
------------------------------------------------------------------------- */
async function getProductDetails(rawArgs = {}) {
  const productId = rawArgs.productId;

  if (!isValidProductId(productId)) {
    return {
      found: false,
      error: "invalid_product_id",
    };
  }

  const db = admin.firestore();
  const docSnap = await db.collection(PRODUCTS_COLLECTION).doc(productId).get();

  if (!docSnap.exists) {
    return {
      found: false,
      productId,
    };
  }

  return {
    found: true,
    product: sanitizeProduct(docSnap.id, docSnap.data() || {}),
  };
}

/* -------------------------------------------------------------------------
   3. checkProductStock({ productId })
   -------------------------------------------------------------------------
   Availability convention (per the Step 1 audit): the product schema has
   no separate availability boolean, so `stock > 0` is treated as the
   current source of truth. This does NOT modify the product schema.
------------------------------------------------------------------------- */
async function checkProductStock(rawArgs = {}) {
  const productId = rawArgs.productId;

  if (!isValidProductId(productId)) {
    return {
      found: false,
      error: "invalid_product_id",
    };
  }

  const db = admin.firestore();
  const docSnap = await db.collection(PRODUCTS_COLLECTION).doc(productId).get();

  if (!docSnap.exists) {
    return {
      found: false,
      productId,
    };
  }

  const data = docSnap.data() || {};
  const stock = typeof data.stock === "number" ? data.stock : toSafeNumber(data.stock) || 0;

  return {
    found: true,
    productId,
    available: stock > 0,
    stock,
  };
}

module.exports = {
  searchProducts,
  getProductDetails,
  checkProductStock,
  // exported for validation/tests only
  isValidProductId,
  sanitizeProduct,
};