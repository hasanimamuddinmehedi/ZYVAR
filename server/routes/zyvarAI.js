/* =========================================================================
   ZYVAR AI ROUTES — Step 2

   Exposes: POST /api/zyvar-ai/chat  (mounted with that prefix in server.js)

   The client controls only { message, conversation }. The server controls
  everything else — model instructions, web research, and verified catalog
  lookups.
   ========================================================================= */

const express = require("express");

const { validateChatRequest } = require("../utils/aiValidation");
const { getChatReply } = require("../services/aiService");
const { analyzeSkinImage } = require("../services/skinAnalysisService");

const router = express.Router();

/* -------------------------------------------------------------------------
   Minimal in-memory rate limiter.
   -------------------------------------------------------------------------
   This is intentionally basic — a fixed-window per-IP counter with no
   external dependency, appropriate for a first backend-only step. It does
   NOT persist across server restarts and does NOT work across multiple
   server instances/processes.

   TODO (Step 3+): replace with a proper rate-limiting middleware (e.g.
   express-rate-limit) or a shared store (e.g. Redis) once this endpoint is
   actually exposed to the public frontend and traffic patterns are known.
------------------------------------------------------------------------- */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // per IP, per window

const requestLog = new Map(); // ip -> { count, windowStart }
const skinAnalysisRequestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestLog.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

function isSkinAnalysisRateLimited(ip) {
  const now = Date.now();
  const entry = skinAnalysisRequestLog.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    skinAnalysisRequestLog.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > 3;
}

// Periodically clear stale entries so this Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestLog.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestLog.delete(ip);
    }
  }
  for (const [ip, entry] of skinAnalysisRequestLog.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      skinAnalysisRequestLog.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS).unref();

/* -------------------------------------------------------------------------
   POST /chat
------------------------------------------------------------------------- */
router.post("/chat", async (req, res) => {
  const clientIp = req.ip || req.connection?.remoteAddress || "unknown";

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  const validation = validateChatRequest(req.body);

  if (!validation.valid) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const result = await getChatReply(validation.message, validation.conversation);

    return res.status(200).json(result);
  } catch (error) {
    // Log full detail server-side only. Never leak this to the client.
    console.error("[zyvar-ai] chat error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        code: "provider_rate_limit",
        error: "AI service usage limit reached",
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        code: error.code || "provider_unavailable",
        error: "AI service is not configured or is temporarily unavailable",
      });
    }

    return res.status(502).json({ error: "AI service temporarily unavailable" });
  }
});

router.post("/skin-analysis", async (req, res) => {
  const clientIp = req.ip || req.connection?.remoteAddress || "unknown";
  if (isSkinAnalysisRateLimited(clientIp)) {
    return res.status(429).json({
      code: "skin_analysis_rate_limited",
      error: "Too many scans. Please wait a minute and try again.",
    });
  }

  const { image, mimeType } = req.body || {};
  if (
    mimeType !== "image/jpeg" ||
    typeof image !== "string" ||
    image.length < 100 ||
    image.length > 2_800_000 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(image)
  ) {
    return res.status(400).json({
      code: "invalid_skin_image",
      error: "Choose a valid JPG, PNG, or WebP photo and try again.",
    });
  }

  if (Buffer.byteLength(image, "base64") > 2 * 1024 * 1024) {
    return res.status(413).json({
      code: "skin_image_too_large",
      error: "This image is too large to analyze.",
    });
  }

  try {
    const analysis = await analyzeSkinImage({ image });
    return res.status(200).json(analysis);
  } catch (error) {
    console.error("[zyvar-ai] skin analysis error:", error.code || error.status || "unknown");
    if (error.status === 429) {
      return res.status(429).json({
        code: "provider_rate_limit",
        error: "The AI service is busy. Please try again in a moment.",
      });
    }
    if (error.status === 503) {
      return res.status(503).json({
        code: error.code || "provider_unavailable",
        error: "Skin analysis is temporarily unavailable. Please try again later.",
      });
    }
    if (error.status === 504) {
      return res.status(504).json({
        code: error.code || "skin_analysis_timeout",
        error: "The scan took too long. Please try again with a clear photo.",
      });
    }
    return res.status(502).json({
      code: error.code || "skin_analysis_failed",
      error: "We could not complete the analysis. Please try again with a clear photo.",
    });
  }
});

module.exports = router;