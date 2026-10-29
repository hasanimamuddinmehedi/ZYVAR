const crypto = require("node:crypto");
const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const TOPIC = "zyvar_all_users";
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "admin@zyvar.com,hello.zyvar@gmail.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const allowedCategories = new Set([
  "message",
  "notice",
  "incident",
  "order-update",
]);
const requestCounts = new Map();

function isRateLimited(key, max, windowMs) {
  const now = Date.now();
  const entry = requestCounts.get(key);
  if (!entry || now - entry.startedAt >= windowMs) {
    requestCounts.set(key, { count: 1, startedAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

async function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Admin sign-in is required." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || "").toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: "Only ZYVAR administrators can send broadcasts." });
    }
    req.user = { uid: decoded.uid, email };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session." });
  }
}

function normalizeMessage(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Notification details must be an object." };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.body === "string" ? body.body.trim() : "";
  const category = body.category;
  const url = typeof body.url === "string" ? body.url.trim() : "/";

  if (!title || title.length > 80) {
    return { error: "Title is required and must be 80 characters or fewer." };
  }
  if (!message || message.length > 240) {
    return { error: "Message is required and must be 240 characters or fewer." };
  }
  if (!allowedCategories.has(category)) {
    return { error: "Choose a valid notification category." };
  }
  if (url && (!url.startsWith("/") || url.startsWith("//") || url.length > 200)) {
    return { error: "Notification links must be an in-app path." };
  }

  return { title, body: message, category, url: url || "/" };
}

router.post("/subscribe", async (req, res) => {
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  if (token.length < 100 || token.length > 4096) {
    return res.status(400).json({ error: "A valid device notification token is required." });
  }

  const requester = req.ip || req.socket.remoteAddress || "unknown";
  if (isRateLimited(`subscribe:${requester}`, 20, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many device registrations. Try again later." });
  }

  try {
    await admin.messaging().subscribeToTopic(token, TOPIC);
    return res.status(200).json({ subscribed: true });
  } catch (error) {
    console.error("[notifications] device subscription failed:", error.message);
    return res.status(502).json({ error: "Could not register this device for notifications." });
  }
});

router.post("/broadcast", authenticateAdmin, async (req, res) => {
  if (isRateLimited(`broadcast:${req.user.uid}`, 5, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Broadcast limit reached. Try again later." });
  }

  const message = normalizeMessage(req.body);
  if (message.error) {
    return res.status(400).json({ error: message.error });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  try {
    const messageId = await admin.messaging().send({
      topic: TOPIC,
      data: {
        id,
        title: message.title,
        body: message.body,
        category: message.category,
        url: message.url,
        createdAt,
      },
      webpush: {
        headers: { Urgency: "high", TTL: "86400" },
      },
    });

    return res.status(200).json({ sent: true, id, messageId });
  } catch (error) {
    console.error("[notifications] broadcast failed:", error.message);
    return res.status(502).json({ error: "Could not send this notification." });
  }
});

module.exports = router;
module.exports.normalizeMessage = normalizeMessage;
