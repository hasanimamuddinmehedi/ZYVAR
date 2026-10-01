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
     name, price, category, stock, description, images, slug,
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
const MAX_SCAN_DOCS = 200; // upper bound on documents pulled per search
const MAX_QUERY_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;

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
  return {
    id,
    name: data.name ?? null,
    price: typeof data.price === "number" ? data.price : toSafeNumber(data.price),
    stock: typeof data.stock === "number" ? data.stock : toSafeNumber(data.stock),
    category: data.category ?? null,
    description: data.description ?? null,
    images: Array.isArray(data.images) ? data.images : [],
    slug: data.slug ?? null,
    partnerSlug: data.partnerSlug ?? null,
  };
}

/* -------------------------------------------------------------------------
   1. searchProducts({ query, category, minPrice, maxPrice, limit })
   -------------------------------------------------------------------------
   The existing "products" collection has no full-text search index, so
   this is a practical first version: pull a bounded page of products and
   filter/rank them in memory against the existing fields (name, category,
   description, partnerSlug). This keeps the AI from ever constructing its
   own Firestore query — the server always decides exactly what is fetched.
------------------------------------------------------------------------- */
async function searchProducts(rawArgs = {}) {
  const query = toSafeString(rawArgs.query, MAX_QUERY_LENGTH).toLowerCase();
  const category = toSafeString(rawArgs.category, MAX_CATEGORY_LENGTH).toLowerCase();

  let minPrice = rawArgs.minPrice !== undefined ? toSafeNumber(rawArgs.minPrice) : null;
  let maxPrice = rawArgs.maxPrice !== undefined ? toSafeNumber(rawArgs.maxPrice) : null;

  if (minPrice !== null && minPrice < 0) minPrice = 0;
  if (maxPrice !== null && maxPrice < 0) maxPrice = null;

  let limit = toSafeNumber(rawArgs.limit);
  if (!limit || limit < 1) limit = MAX_SEARCH_RESULTS;
  limit = Math.min(limit, MAX_SEARCH_RESULTS);

  const db = admin.firestore();

  // Bounded scan — never an unrestricted full-collection read.
  const snapshot = await db
    .collection(PRODUCTS_COLLECTION)
    .limit(MAX_SCAN_DOCS)
    .get();

  const matches = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() || {};

    const name = String(data.name || "").toLowerCase();
    const productCategory = String(data.category || "").toLowerCase();
    const description = String(data.description || "").toLowerCase();
    const partnerSlug = String(data.partnerSlug || "").toLowerCase();

    // TEXT MATCH — only applied if a query was actually given.
    const matchesQuery =
      !query ||
      name.includes(query) ||
      productCategory.includes(query) ||
      description.includes(query) ||
      partnerSlug.includes(query);

    if (!matchesQuery) return;

    // CATEGORY FILTER
    if (category && productCategory !== category) return;

    // PRICE FILTERS
    const price = toSafeNumber(data.price);
    if (minPrice !== null && (price === null || price < minPrice)) return;
    if (maxPrice !== null && (price === null || price > maxPrice)) return;

    matches.push({ id: docSnap.id, data });
  });

  // Simple relevance ranking: exact/starting name matches first.
  matches.sort((a, b) => {
    const aName = String(a.data.name || "").toLowerCase();
    const bName = String(b.data.name || "").toLowerCase();
    const aScore = query && aName.startsWith(query) ? 0 : 1;
    const bScore = query && bName.startsWith(query) ? 0 : 1;
    return aScore - bScore;
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
};