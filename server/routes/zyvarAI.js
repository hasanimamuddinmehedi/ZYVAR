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

// Periodically clear stale entries so this Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestLog.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestLog.delete(ip);
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

module.exports = router;