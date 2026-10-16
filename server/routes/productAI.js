/* =========================================================================
   PRODUCT AI ROUTES  (mounted at /api/product-ai)

   Seller-only (Firebase ID token of ZYVAR admin or an approved partner):
     POST /analyze   name check + category + description + benefits
     POST /price     web-researched BDT price suggestion
     POST /images    product pictures found online
   Public (rate limited):
     GET  /image-proxy   serves only HMAC-signed image URLs from /images
     POST /translate     English -> Bengali description (customers)
   ========================================================================= */

const express = require("express");
const admin = require("firebase-admin");

const {
  analyzeProduct,
  suggestPrice,
  findProductImages,
  fetchSignedImage,
  translateToBengali,
} = require("../services/productAIService");

const router = express.Router();

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "admin@zyvar.com,hello.zyvar@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/* ---------------------------- rate limiting ----------------------------- */

function createLimiter(max, windowMs = 60 * 1000) {
  const log = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of log) {
      if (now - entry.start > windowMs) log.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.user?.uid || req.ip || "unknown";
    const now = Date.now();
    const entry = log.get(key);
    if (!entry || now - entry.start > windowMs) {
      log.set(key, { count: 1, start: now });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }
    return next();
  };
}

const sellerLimiter = createLimiter(30);
const publicLimiter = createLimiter(20);
const proxyLimiter = createLimiter(120);

/* ------------------------------ auth ------------------------------------ */

async function requireSeller(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sign in required" });

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const email = String(decoded.email || "").toLowerCase();
  let allowed = ADMIN_EMAILS.includes(email);

  if (!allowed) {
    try {
      const snap = await admin
        .firestore()
        .collection("partnerApplications")
        .doc(decoded.uid)
        .get();
      allowed = snap.exists && snap.data()?.status === "approved";
    } catch (error) {
      console.error("[product-ai] seller verification failed:", error);
      return res.status(503).json({ error: "Seller verification is temporarily unavailable" });
    }
  }

  if (!allowed) {
    return res.status(403).json({ error: "Only ZYVAR admin or approved partners can use this" });
  }

  req.user = { uid: decoded.uid, email };
  return next();
}

/* ----------------------------- helpers ---------------------------------- */

function handleError(res, error, label) {
  console.error(`[product-ai] ${label} error:`, error?.code || "", error?.message || error);

  const status = error?.status && Number.isInteger(error.status) ? error.status : 502;
  const known = [
    "ai_unavailable", "ai_timeout", "ai_auth_required", "ai_model_not_found",
    "search_not_configured", "search_unavailable", "price_unavailable", "bad_image", "bad_signature", "not_image",
  ];

  return res.status(status).json({
    code: known.includes(error?.code) ? error.code : "ai_failed",
    error: "AI is temporarily unavailable. You can continue filling the form manually.",
  });
}

function apiBaseFrom(req) {
  const proto = req.headers["x-forwarded-proto"]?.split(",")[0] || req.protocol;
  return `${proto}://${req.get("host")}/api/product-ai`;
}

const validName = (value) =>
  typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 150;

/* ------------------------------ routes ---------------------------------- */

router.post("/analyze", requireSeller, sellerLimiter, async (req, res) => {
  const { name, categories, description } = req.body || {};
  if (!validName(name)) return res.status(400).json({ error: "Invalid product name" });

  try {
    const result = await analyzeProduct({
      name,
      categories: Array.isArray(categories) ? categories.slice(0, 80) : [],
      existingDescription: typeof description === "string" ? description : "",
    });
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "analyze");
  }
});

router.post("/price", requireSeller, sellerLimiter, async (req, res) => {
  const { name, category } = req.body || {};
  if (!validName(name)) return res.status(400).json({ error: "Invalid product name" });

  try {
    return res.json(await suggestPrice({ name, category }));
  } catch (error) {
    return handleError(res, error, "price");
  }
});

router.post("/images", requireSeller, sellerLimiter, async (req, res) => {
  const { name } = req.body || {};
  if (!validName(name)) return res.status(400).json({ error: "Invalid product name" });

  try {
    const images = await findProductImages({ name, apiBase: apiBaseFrom(req) });
    return res.json({ images });
  } catch (error) {
    return handleError(res, error, "images");
  }
});

router.get("/image-proxy", proxyLimiter, async (req, res) => {
  try {
    if (
      typeof req.query.u !== "string" ||
      req.query.u.length > 4096 ||
      typeof req.query.s !== "string"
    ) {
      return res.status(400).json({ error: "Image unavailable" });
    }
    const { body, contentType } = await fetchSignedImage(req.query.u, req.query.s);
    res.set({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
    });
    return res.send(body);
  } catch (error) {
    const status = error?.status && Number.isInteger(error.status) && error.status < 500 ? error.status : 502;
    return res.status(status).json({ error: "Image unavailable" });
  }
});

router.post("/translate", publicLimiter, async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 3000) {
    return res.status(400).json({ error: "Invalid text" });
  }

  try {
    return res.json({ translation: await translateToBengali(text) });
  } catch (error) {
    return handleError(res, error, "translate");
  }
});

module.exports = router;
