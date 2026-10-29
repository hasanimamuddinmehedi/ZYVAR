const crypto = require("node:crypto");
const axios = require("axios");
const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dhppdatrl";
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "admin@zyvar.com,hello.zyvar@gmail.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function getPublicId(imageUrl) {
  let url;
  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com"
  ) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const uploadIndex = segments.indexOf("upload");
  if (
    segments[0] !== CLOUD_NAME ||
    uploadIndex < 1 ||
    segments[uploadIndex - 1] !== "image"
  ) {
    return null;
  }

  const versionIndex = segments.findIndex(
    (segment, index) => index > uploadIndex && /^v\d+$/.test(segment),
  );
  const publicIdSegments =
    versionIndex === -1
      ? segments.slice(uploadIndex + 1)
      : segments.slice(versionIndex + 1);
  if (!publicIdSegments.length) return null;

  const publicId = publicIdSegments.join("/").replace(/\.[^/.]+$/, "");
  return publicId || null;
}

function getImageUrls(data = {}) {
  const imageUrls = [
    data.photoURL,
    data.coverPhoto,
    data.logo,
    data.banner,
    data.image,
    ...(Array.isArray(data.images) ? data.images : []),
  ];

  return imageUrls
    .map((image) =>
      typeof image === "string"
        ? image
        : image?.url || image?.secure_url || image?.src,
    )
    .filter(Boolean);
}

function createAuthorizationToken(uid, publicId) {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      publicId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.CLOUDINARY_API_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAuthorizationToken(token, uid, publicId) {
  if (!token || !process.env.CLOUDINARY_API_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.CLOUDINARY_API_SECRET)
    .update(payload)
    .digest("base64url");
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return false;
  }

  try {
    const authorization = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return (
      authorization.uid === uid &&
      authorization.publicId === publicId &&
      authorization.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

async function canAuthorizeDeletion(req, imageUrl, resource, publicId) {
  const isOwnerAsset = publicId.startsWith(`zyvar/${req.user.uid}/`);
  const isAdmin = ADMIN_EMAILS.includes(req.user.email);
  if (isOwnerAsset || isAdmin) return true;

  if (!resource || typeof resource.id !== "string") return false;
  const firestore = admin.firestore();

  if (resource.type === "profile" && resource.id === req.user.uid) {
    const snapshot = await firestore.collection("users").doc(req.user.uid).get();
    return snapshot.exists && getImageUrls(snapshot.data()).includes(imageUrl);
  }

  if (resource.type === "partner" && resource.id === req.user.uid) {
    const paths = ["partnerApplications", "partners", "users"];
    const snapshots = await Promise.all(
      paths.map((collection) => firestore.collection(collection).doc(req.user.uid).get()),
    );
    return snapshots.some(
      (snapshot) =>
        snapshot.exists && getImageUrls(snapshot.data()).includes(imageUrl),
    );
  }

  if (resource.type === "product") {
    const snapshot = await firestore.collection("products").doc(resource.id).get();
    if (!snapshot.exists) return false;
    const product = snapshot.data();
    const isProductOwner = product.partnerId === req.user.uid;
    return (
      getImageUrls(product).includes(imageUrl) &&
      (isProductOwner || isAdmin)
    );
  }

  return false;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Sign in required." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: String(decoded.email || "").toLowerCase(),
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

router.post("/authorize", authenticate, async (req, res) => {
  const imageUrl = req.body?.imageUrl;
  const publicId = getPublicId(imageUrl);
  if (!publicId) {
    return res.status(400).json({ error: "A valid Zyvar Cloudinary image URL is required." });
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("[cloudinary] deletion credentials are not configured.");
    return res.status(503).json({ error: "Image deletion is temporarily unavailable." });
  }

  try {
    if (!(await canAuthorizeDeletion(req, imageUrl, req.body?.resource, publicId))) {
      return res.status(403).json({ error: "You cannot delete this image." });
    }

    return res.status(200).json({
      authorizationToken: createAuthorizationToken(req.user.uid, publicId),
    });
  } catch (error) {
    console.error("[cloudinary] deletion authorization failed:", error.message);
    return res.status(503).json({ error: "Image deletion authorization is temporarily unavailable." });
  }
});

router.post("/delete", authenticate, async (req, res) => {
  const publicId = getPublicId(req.body?.imageUrl);
  if (!publicId) {
    return res.status(400).json({ error: "A valid Zyvar Cloudinary image URL is required." });
  }

  const isOwnerAsset = publicId.startsWith(`zyvar/${req.user.uid}/`);
  const isAdmin = ADMIN_EMAILS.includes(req.user.email);
  const hasAuthorization = verifyAuthorizationToken(
    req.body?.authorizationToken,
    req.user.uid,
    publicId,
  );
  if (!isOwnerAsset && !isAdmin && !hasAuthorization) {
    return res.status(403).json({ error: "You cannot delete this image." });
  }

  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("[cloudinary] deletion credentials are not configured.");
    return res.status(503).json({ error: "Image deletion is temporarily unavailable." });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  try {
    const body = new URLSearchParams({
      public_id: publicId,
      timestamp,
      api_key: CLOUDINARY_API_KEY,
      signature,
    });
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (!["ok", "not found"].includes(response.data?.result)) {
      console.error("[cloudinary] unexpected deletion response:", response.data?.result);
      return res.status(502).json({ error: "Cloudinary could not delete the image." });
    }

    return res.status(200).json({ deleted: response.data.result === "ok" });
  } catch (error) {
    console.error("[cloudinary] deletion request failed:", error.response?.data || error.message);
    return res.status(502).json({ error: "Cloudinary could not delete the image." });
  }
});

module.exports = router;
module.exports.getPublicId = getPublicId;
