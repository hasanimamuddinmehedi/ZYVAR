import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  Camera,
  Check,
  Heart,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import RequestProductModal from "./RequestProductModal";

const CHAT_ENDPOINT =
  import.meta.env.VITE_ZYVAR_AI_API_URL ||
  "https://zyvar-email-server.onrender.com/api/zyvar-ai/chat";
const ANALYSIS_ENDPOINT = (() => {
  const endpoint = new URL(CHAT_ENDPOINT, window.location.origin);
  const chatPath = endpoint.pathname.replace(/\/+$/, "");
  endpoint.pathname = chatPath.endsWith("/chat")
    ? chatPath.replace(/\/chat$/, "/skin-analysis")
    : `${chatPath}/skin-analysis`;
  endpoint.search = "";
  return endpoint.toString();
})();
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_ANALYSIS_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ANALYSIS_STORAGE_KEY = "zyvar-skin-analysis";
const ANALYSIS_TTL_MS = 24 * 60 * 60 * 1000;
const HERO_SCAN_AREAS = [
  { id: "texture", label: "Texture" },
  { id: "pores", label: "Pores" },
  { id: "spots", label: "Spots" },
  { id: "hydration", label: "Hydration" },
];

function drawKeyedHeroFrame(video, canvas, context) {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
  const width = Math.max(1, Math.round(bounds.width * pixelRatio));
  const height = Math.max(1, Math.round(bounds.height * pixelRatio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const sourceRatio = video.videoWidth / video.videoHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = sourceHeight * targetRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = sourceWidth / targetRatio;
    sourceY = (video.videoHeight - sourceHeight) * 0.45;
  }

  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );

  const frame = context.getImageData(0, 0, width, height);
  const pixels = frame.data;
  const pixelCount = width * height;
  const matte = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const index = pixel * 4;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const brightness = (red + green + blue) / 3;
    const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

    if (brightness > 165 && colorSpread < 70) {
      matte[pixel] = 1;
    }
  }

  let head = 0;
  let tail = 0;
  const enqueueBackgroundPixel = (pixel) => {
    if (matte[pixel] !== 1) return;
    matte[pixel] = 2;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueBackgroundPixel(x);
    enqueueBackgroundPixel((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueBackgroundPixel(y * width);
    enqueueBackgroundPixel(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    if (x > 0) enqueueBackgroundPixel(pixel - 1);
    if (x < width - 1) enqueueBackgroundPixel(pixel + 1);
    if (pixel >= width) enqueueBackgroundPixel(pixel - width);
    if (pixel < pixelCount - width) enqueueBackgroundPixel(pixel + width);
  }

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (matte[pixel] === 2) {
      const index = pixel * 4;
      const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      const coverage = (255 - brightness) / 255;
      pixels[index + 3] *= coverage * coverage;
    }
  }

  context.putImageData(frame, 0, 0);
}

function scanTargetClass(area) {
  return `skin-analysis__scan-target skin-analysis__scan-target--${area.id}`;
}

function loadSavedAnalysis() {
  try {
    const raw = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (
      !saved ||
      !Number.isFinite(saved.createdAt) ||
      saved.createdAt > Date.now() ||
      !saved.analysis ||
      typeof saved.analysis.isFace !== "boolean" ||
      Date.now() - saved.createdAt >= ANALYSIS_TTL_MS
    ) {
      removeSavedAnalysis();
      return null;
    }

    return saved;
  } catch (storageError) {
    console.error("[skin-analyzer] Could not load saved analysis:", storageError);
    try {
      window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    } catch (removeError) {
      console.error("[skin-analyzer] Could not remove invalid saved analysis:", removeError);
    }
    return null;
  }
}

function removeSavedAnalysis() {
  try {
    window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
  } catch (storageError) {
    console.error("[skin-analyzer] Could not remove saved analysis:", storageError);
  }
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(blob);
  });
}

async function loadImage(file) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { bitmap, dispose: () => bitmap.close() };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Could not decode this image."));
      image.src = objectUrl;
    });
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }

  return { bitmap: image, dispose: () => URL.revokeObjectURL(objectUrl) };
}

async function prepareImage(file) {
  const { bitmap, dispose } = await loadImage(file);
  try {
    const scale = Math.min(1, 1280 / bitmap.width, 1280 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const compressed = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });
    if (!compressed) throw new Error("Could not prepare this image. Please try another photo.");
    if (compressed.size > MAX_ANALYSIS_BYTES) {
      throw new Error("This image is too detailed to analyze. Please choose a smaller photo.");
    }

    const dataUrl = await readAsDataUrl(compressed);
    return dataUrl.slice(dataUrl.indexOf(",") + 1);
  } finally {
    dispose();
  }
}

function validateFile(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Choose an image smaller than 10 MB.");
  }
}

function Observation({ label, value }) {
  return (
    <div className="skin-analysis__observation">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function RoutineColumn({ title, items }) {
  return (
    <div className="skin-analysis__routine">
      <h4>{title}</h4>
      <ol>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SuggestedProduct({
  recommendation,
  wished,
  added,
  onBuyNow,
  onAddToCart,
  onToggleWishlist,
  onRequest,
}) {
  const { product, type, name, use, when, step, approximateCost, source, catalogStatus } = recommendation;
  const [imageFailed, setImageFailed] = useState(false);
  if (type === "request") {
    return (
      <article className="skin-analysis__product skin-analysis__product--request">
        <div className="skin-analysis__recommendation-step">
          <span>STEP {String(step).padStart(2, "0")}</span>
          <span>{when}</span>
        </div>
        <div className="skin-analysis__product-guidance">
          <span>{catalogStatus === "out_of_stock" ? "OUT OF STOCK AT ZYVAR" : "WORLDWIDE FIND"}</span>
          <h5>{name}</h5>
          <p>{use}</p>
          <p className="skin-analysis__product-order">Use after the previous routine step · {approximateCost}</p>
          <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
        </div>
        {catalogStatus !== "verification_unavailable" && (
          <button
            type="button"
            className="skin-analysis__request-button"
            onClick={() => onRequest({
              name,
              description: `${use} Suggested for ${when.toLowerCase()}, step ${step} of the photo-based routine.`,
              approximateCost,
              referenceLink: source.url,
            })}
          >
            <PackagePlus aria-hidden="true" />
            Request product
          </button>
        )}
      </article>
    );
  }

  const image = product.imageUrl || product.images?.[0] || product.image;
  const inStock = Number(product.stock) > 0;

  return (
    <article className="skin-analysis__product">
      <div className="skin-analysis__recommendation-step">
        <span>STEP {String(step).padStart(2, "0")}</span>
        <span>{when}</span>
      </div>
      <div className="skin-analysis__product-main">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="skin-analysis__product-placeholder" aria-hidden="true">
            <PackagePlus className="h-6 w-6" />
          </div>
        )}
        <div className="skin-analysis__product-info">
          <span>ZYVAR CATALOG</span>
          <h5>{product.name}</h5>
          <p>{Number.isFinite(product.price) ? `৳${product.price.toLocaleString("en-BD")}` : "Price unavailable"}</p>
        </div>
      </div>
      <p className="skin-analysis__product-use">{use}</p>
      <p className="skin-analysis__product-order">
        {step <= 1 ? "Use as the first step." : "Use after the previous routine step."}
      </p>
      <div className="skin-analysis__product-actions">
        <button type="button" onClick={() => onBuyNow(product)} disabled={!inStock}>
          <Zap aria-hidden="true" />
          Buy now
        </button>
        <button type="button" onClick={() => onAddToCart(product)} disabled={!inStock}>
          <ShoppingCart aria-hidden="true" />
          {added ? "Added" : "Add to cart"}
        </button>
        <button type="button" onClick={() => onToggleWishlist(product)}>
          <Heart fill={wished ? "currentColor" : "none"} aria-hidden="true" />
          {wished ? "Saved" : "Wishlist"}
        </button>
        <Link to={`/product/${product.slug || product.id}`} aria-label={`View ${product.name} details`}>
          <ArrowUpRight aria-hidden="true" />
          Details
        </Link>
      </div>
      {source && <a className="skin-analysis__product-source" href={source.url} target="_blank" rel="noreferrer">Research: {source.title}</a>}
    </article>
  );
}

export default function SkinAnalyzer() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [consented, setConsented] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [savedAnalysis, setSavedAnalysis] = useState(loadSavedAnalysis);
  const analysis = savedAnalysis?.analysis || null;
  const [keyedHeroFrameReady, setKeyedHeroFrameReady] = useState(false);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const previewUrlRef = useRef("");
  const cameraStreamRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { addToCart, setSelectedItems } = useCart();
  const wishlist = useWishlist();
  const [addedProductIds, setAddedProductIds] = useState({});
  const [requestProduct, setRequestProduct] = useState(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    const canvas = heroCanvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!video || !canvas || !context) return undefined;

    let active = true;
    let hasMarkedFrameReady = false;
    let frameRequest = 0;
    let videoFrameRequest = 0;
    const renderFrame = () => {
      if (!active || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      drawKeyedHeroFrame(video, canvas, context);
      if (!hasMarkedFrameReady) {
        hasMarkedFrameReady = true;
        setKeyedHeroFrameReady(true);
      }

      if (reduceMotion) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        videoFrameRequest = video.requestVideoFrameCallback(renderFrame);
      } else {
        frameRequest = window.requestAnimationFrame(renderFrame);
      }
    };

    video.addEventListener("loadeddata", renderFrame);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) renderFrame();

    return () => {
      active = false;
      video.removeEventListener("loadeddata", renderFrame);
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      if (videoFrameRequest && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(videoFrameRequest);
      }
    };
  }, [reduceMotion]);

  useEffect(() => {
    const video = cameraVideoRef.current;
    if (video && cameraStream) video.srcObject = cameraStream;
    return () => {
      if (video) video.srcObject = null;
    };
  }, [cameraStream]);

  useEffect(() => {
    if (!savedAnalysis) {
      removeSavedAnalysis();
      return;
    }

    try {
      window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(savedAnalysis));
    } catch (storageError) {
      console.error("[skin-analyzer] Could not save analysis:", storageError);
    }
  }, [savedAnalysis]);

  useEffect(() => {
    if (!savedAnalysis) return undefined;

    const expiresAt = savedAnalysis.createdAt + ANALYSIS_TTL_MS;
    const timeoutId = window.setTimeout(() => {
      setSavedAnalysis((current) =>
        current?.createdAt === savedAnalysis.createdAt ? null : current,
      );
    }, Math.max(0, expiresAt - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [savedAnalysis]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const selectImage = (file) => {
    if (!file) return;
    try {
      validateFile(file);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      setPreviewUrl(nextUrl);
      setImageFile(file);
      setError("");
      setCameraError("");
      setConsented(false);
    } catch (selectionError) {
      setError(selectionError.message);
    }
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraStream(null);
    setCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable. Upload a photo instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      });
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      setCameraError("Camera access was blocked or unavailable. You can upload a photo instead.");
    }
  };

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setCameraError("The camera is still starting. Please try again in a moment.");
      return;
    }

    const scale = Math.min(1, 1280 / video.videoWidth, 1280 / video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Could not capture the photo. Please upload an image instead.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Could not capture the photo. Please try again.");
        return;
      }
      selectImage(new File([blob], "zyvar-skin-photo.jpg", { type: "image/jpeg" }));
      stopCamera();
    }, "image/jpeg", 0.82);
  };

  const analyzePhoto = async (event) => {
    event.preventDefault();
    if (!imageFile || !consented || analyzing) return;

    setAnalyzing(true);
    setError("");

    try {
      const image = await prepareImage(imageFile);
      let response;
      try {
        response = await fetch(ANALYSIS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, mimeType: "image/jpeg" }),
          signal: AbortSignal.timeout(270000),
        });
      } catch (requestError) {
        if (requestError instanceof TypeError) {
          throw new Error(
            "Could not reach Zyvar AI at localhost:5000. The backend should start with `npm run dev`; if it did not, run `npm run dev:server` in another terminal and check that terminal for startup errors.",
            { cause: requestError },
          );
        }
        throw requestError;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("This image is too large to analyze. Please choose a smaller photo.");
        }
        if (response.status === 429) {
          throw new Error("Too many scans were requested. Please wait a minute and try again.");
        }
        if (response.status === 503) {
          throw new Error("Skin analysis is temporarily unavailable. Please try again later.");
        }
        throw new Error(result.error || "We couldn’t analyze this photo. Please try another image.");
      }
      setSavedAnalysis({ analysis: result, createdAt: Date.now() });
      if (window.matchMedia("(max-width: 900px)").matches) {
        window.setTimeout(() => {
          document.getElementById("skin-results")?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (analysisError) {
      setError(
        analysisError.name === "TimeoutError" || analysisError.name === "AbortError"
          ? "The analysis took too long. Please try again with a clear, well-lit photo."
          : analysisError.message || "Could not complete the skin analysis. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const clearPhoto = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
    setImageFile(null);
    setSavedAnalysis(null);
    setError("");
    setConsented(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetAnalysis = () => setSavedAnalysis(null);

  const buyProduct = (product) => {
    addToCart(product);
    setSelectedItems([product.id]);
    navigate("/payment");
  };

  const addProductToCart = (product) => {
    addToCart(product);
    setAddedProductIds((previous) => ({ ...previous, [product.id]: true }));
    navigate("/cart");
  };

  const toggleProductWishlist = (product) => {
    if (wishlist.isInWishlist(product.id)) {
      wishlist.removeFromWishlist(product.id);
    } else {
      wishlist.addToWishlist(product);
    }
    navigate("/wishlist");
  };

  const askZyvarAboutScan = () => {
    const recommendations = (analysis.recommendations || [])
      .map((item) => `${item.name} (${item.when}, step ${item.step}): ${item.use}`)
      .join("\n");
    const prompt = [
      "I just completed Zyvar's skin analyzer. Please explain my cosmetic observations and help me decide if these products fit my routine. Explain how and when to use each one, what order to layer them in, and any ingredient combinations or sensitivities to watch for. Keep it non-medical and ask me follow-up questions if needed.",
      `Photo-based estimate: ${analysis.skinType}.`,
      `Summary: ${analysis.summary}`,
      `Visible observations: texture - ${analysis.observations.texture}; pores - ${analysis.observations.pores}; spots/tone - ${analysis.observations.spots}; surface cues - ${analysis.observations.hydration}.`,
      recommendations ? `Suggested products:\n${recommendations}` : "",
    ].filter(Boolean).join("\n\n");
    window.dispatchEvent(new CustomEvent("zyvar:open-chat", { detail: { prompt } }));
  };

  return (
    <section
      id="your-skin"
      className="skin-analysis text-white"
      aria-labelledby="skin-analysis-heading"
    >
      <div className="skin-analysis__hero">
        <div className="skin-analysis__hero-copy">
          <p className="skin-analysis__eyebrow">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Thoughtful guidance, powered by Zyvar AI
          </p>
          <h2 id="skin-analysis-heading">
            A little more clarity
            <span>for your routine.</span>
          </h2>
          <p className="skin-analysis__intro">
            Get a gentle, visual overview of your skin’s surface and a simple
            routine to explore. No perfection promises—just a clearer place to start.
          </p>
          <a className="skin-analysis__cta" href="#skin-scan">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Start your skin scan
          </a>
          <p className="skin-analysis__privacy">
            Cosmetic guidance only. Not a diagnosis or a substitute for a dermatologist.
          </p>
        </div>

        <div className={`skin-analysis__hero-visual${keyedHeroFrameReady ? " has-keyed-video" : ""}`}>
          <video
            ref={heroVideoRef}
            className="skin-analysis__hero-video"
            src="/videos/skin-analysis-scan.mp4"
            autoPlay={!reduceMotion}
            loop={!reduceMotion}
            muted
            playsInline
            preload="auto"
            aria-label="Illustrative face video with scan callouts for texture, pores, spots, and hydration"
          />
          <canvas
            ref={heroCanvasRef}
            className={`skin-analysis__hero-canvas${keyedHeroFrameReady ? " is-ready" : ""}`}
            aria-hidden="true"
          />
          <div className="skin-analysis__video-shade" />
          <div className="skin-analysis__scan-highlights" aria-hidden="true">
            {HERO_SCAN_AREAS.map((area) => (
              <span key={area.id} className={scanTargetClass(area)}>
                <span className="skin-analysis__scan-target-label">{area.label}</span>
              </span>
            ))}
          </div>
          <div className="skin-analysis__video-caption">
            <span className="skin-analysis__live-dot" />
            Illustrative skin scan
          </div>
        </div>
      </div>

      <div className="skin-analysis__workspace" id="skin-scan">
        <div className="skin-analysis__workspace-heading">
          <p className="skin-analysis__eyebrow">Your skin, observed closely</p>
          <h3>A thoughtful starting point.</h3>
          <p>
            Choose a clear, well-lit photo with your face centered. For the most
            useful observations, remove filters and heavy makeup.
          </p>
        </div>

        <nav className="skin-analysis__flow" aria-label="Skin scan steps">
          <a className={imageFile ? "is-complete" : "is-current"} href="#skin-upload">
            <span>01</span>
            <span>{imageFile ? "Photo ready" : "Add your photo"}</span>
          </a>
          <ArrowDown aria-hidden="true" />
          <a className={analysis ? "is-complete" : analyzing ? "is-current" : ""} href="#skin-results">
            <span>02</span>
            <span>{analyzing ? "Analyzing…" : analysis ? "View your results" : "Results appear below"}</span>
          </a>
          <ArrowDown aria-hidden="true" />
          <a
            className={analysis?.isFace ? "is-current" : ""}
            href={analysis?.isFace ? "#skin-products" : "#skin-results"}
          >
            <span>03</span>
            <span>Product routine</span>
          </a>
        </nav>

        <div className="skin-analysis__columns">
          <form id="skin-upload" className="skin-analysis__upload-card glass-surface" onSubmit={analyzePhoto}>
            <div className="skin-analysis__card-heading">
              <span className="skin-analysis__step">01</span>
              <div>
                <h4>Add a photo</h4>
                <p>JPG, PNG, or WebP · up to 10 MB</p>
              </div>
            </div>

            <div className={`skin-analysis__photo-frame ${previewUrl ? "has-photo" : ""}`}>
              {cameraOpen ? (
                <>
                  <video
                    ref={cameraVideoRef}
                    className="skin-analysis__preview"
                    autoPlay
                    muted
                    playsInline
                    aria-label="Live camera preview"
                  />
                  <span className="skin-analysis__camera-label">Live preview</span>
                </>
              ) : previewUrl ? (
                <>
                  <img className="skin-analysis__preview" src={previewUrl} alt="Selected skin analysis preview" />
                  <button
                    type="button"
                    className="skin-analysis__remove-photo"
                    onClick={clearPhoto}
                    disabled={analyzing}
                    aria-label="Remove selected photo"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="skin-analysis__camera-label">Preview stays on this device</span>
                </>
              ) : (
                <div className="skin-analysis__empty-photo">
                  <span className="skin-analysis__upload-icon">
                    <ImagePlus className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <strong>Your photo will appear here</strong>
                  <span>Face forward · soft natural light</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              disabled={analyzing}
              aria-label="Choose or take a skin photo"
              onChange={(event) => {
                selectImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="skin-analysis__photo-actions">
              {cameraOpen ? (
                <>
                  <button type="button" className="skin-analysis__secondary-button" onClick={capturePhoto}>
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Capture photo
                  </button>
                  <button type="button" className="skin-analysis__icon-button" onClick={stopCamera} aria-label="Close camera">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="skin-analysis__secondary-button"
                    disabled={analyzing}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {imageFile ? "Choose another" : "Upload photo"}
                  </button>
                  <button
                    type="button"
                    className="skin-analysis__icon-button"
                    onClick={startCamera}
                    disabled={analyzing}
                    aria-label="Open camera"
                    title="Take a photo"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {cameraError && <p className="skin-analysis__error" role="alert">{cameraError}</p>}

            <label className="skin-analysis__consent">
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
                disabled={!imageFile || cameraOpen || analyzing}
              />
              <span>
                I agree to send this photo to the AI provider for one-time analysis.
                Zyvar does not add it to my account or product gallery.
              </span>
            </label>

            <button
              type="submit"
              className="skin-analysis__analyze-button"
              disabled={!imageFile || !consented || analyzing || cameraOpen}
            >
              {analyzing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {analyzing ? "Observing your photo…" : "Analyze my skin"}
            </button>
            {error && <p className="skin-analysis__error" role="alert">{error}</p>}

            <p className="skin-analysis__security-note">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Your photo is processed for this scan and is not saved by Zyvar.
            </p>
          </form>

          <div id="skin-results" className={`skin-analysis__result-card glass-surface ${analysis?.isFace ? "has-analysis" : ""}`} aria-live="polite">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="skin-analysis__result-empty"
                >
                  <span className="skin-analysis__scan-orb">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h4>Taking a thoughtful look</h4>
                  <p>Reviewing visible surface details and preparing gentle routine ideas.</p>
                  <div className="skin-analysis__scan-line" aria-hidden="true" />
                </motion.div>
              ) : analysis ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.55 }}
                  className="skin-analysis__results"
                >
                  {analysis.isFace ? (
                    <>
                      <div className="skin-analysis__results-topline">
                        <span className="skin-analysis__eyebrow">
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Your scan overview
                        </span>
                        <button type="button" className="skin-analysis__reset" onClick={resetAnalysis}>
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Reset
                        </button>
                      </div>
                      {previewUrl && analysis.regions?.length > 0 && (
                        <div className="skin-analysis__annotated-photo-section">
                          <p className="skin-analysis__type-label">
                            Approximate visual markers · cosmetic observations only
                          </p>
                          <div className="skin-analysis__annotated-photo">
                            <img
                              src={previewUrl}
                              alt="Your photo with approximate boxes around visible cosmetic observations"
                            />
                            <div className="skin-analysis__annotation-layer">
                              {analysis.regions.map((region, index) => (
                                <span
                                  key={`${region.label}-${index}`}
                                  className="skin-analysis__annotation-box"
                                  style={{
                                    left: `${region.box.x / 10}%`,
                                    top: `${region.box.y / 10}%`,
                                    width: `${region.box.width / 10}%`,
                                    height: `${region.box.height / 10}%`,
                                  }}
                                >
                                  <span>{region.label}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          <ul className="skin-analysis__annotation-notes" aria-label="Marked visual observations">
                            {analysis.regions.map((region, index) => (
                              <li key={`${region.label}-note-${index}`}>
                                <strong>{region.label}</strong>
                                <span>{region.note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="skin-analysis__type-label">Photo-based cosmetic estimate · not a diagnosis</p>
                      <h4 className="skin-analysis__skin-type">{analysis.skinType}</h4>
                      <p className="skin-analysis__summary">{analysis.summary}</p>
                      <div className="skin-analysis__observations">
                        <Observation label="Texture" value={analysis.observations.texture} />
                        <Observation label="Visible pores" value={analysis.observations.pores} />
                        <Observation label="Spots & tone" value={analysis.observations.spots} />
                        <Observation label="Surface hydration cues" value={analysis.observations.hydration} />
                      </div>
                      <div className="skin-analysis__routines">
                        <RoutineColumn title="Morning" items={analysis.routine.morning} />
                        <RoutineColumn title="Evening" items={analysis.routine.evening} />
                      </div>
                      {analysis.ingredientNotes.length > 0 && (
                        <div className="skin-analysis__ingredient-note">
                          <strong>Ingredient notes</strong>
                          <ul>
                            {analysis.ingredientNotes.map((note, index) => <li key={index}>{note}</li>)}
                          </ul>
                        </div>
                      )}
                      <p className="skin-analysis__result-disclaimer">
                        {analysis.disclaimer}
                      </p>
                      <a className="skin-analysis__next-step" href="#skin-products">
                        Continue to product suggestions
                        <ArrowDown aria-hidden="true" />
                      </a>
                    </>
                  ) : (
                    <div className="skin-analysis__result-empty">
                      <span className="skin-analysis__scan-orb">
                        <ImagePlus className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <h4>We couldn’t find a clear face in this photo</h4>
                      <p>Please choose a front-facing, well-lit photo and try again.</p>
                      <button type="button" className="skin-analysis__reset" onClick={clearPhoto}>
                        Choose another photo
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="skin-analysis__result-empty"
                >
                  <span className="skin-analysis__scan-orb">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="skin-analysis__eyebrow">A little clarity, at your pace</p>
                  <h4>Your observations will appear here</h4>
                  <p>Upload a photo and start a scan to receive a gentle, personalized routine.</p>
                  <div className="skin-analysis__result-points">
                    <span>Visible texture</span>
                    <span>Surface tone</span>
                    <span>Routine ideas</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {analysis?.isFace && (
          <section id="skin-products" className="skin-analysis__product-section" aria-labelledby="skin-analysis-products-heading">
            <div className="skin-analysis__product-heading">
              <div>
                <p className="skin-analysis__eyebrow">Research-backed routine ideas</p>
                <h3 id="skin-analysis-products-heading">Product suggestions, in the right order</h3>
                <p>Worldwide product ideas are checked against Zyvar’s catalog. Anything not currently listed can be requested.</p>
              </div>
            </div>
            {analysis.catalogError && <p className="skin-analysis__product-message" role="status">{analysis.catalogError}</p>}
            {analysis.webSearchStatus === "not_configured" && (
              <p className="skin-analysis__product-message" role="status">
                Worldwide research is not configured right now. Ask Zyvar AI for help with verified catalog options.
              </p>
            )}
            {analysis.webSearchStatus === "unavailable" && (
              <p className="skin-analysis__product-message" role="status">
                Worldwide research is temporarily unavailable. Zyvar AI can still help you explore the catalog.
              </p>
            )}
            {analysis.webSearchStatus === "no_results" && (
              <p className="skin-analysis__product-message" role="status">
                Current web research did not return reliable product suggestions. Ask Zyvar AI for help with the scan.
              </p>
            )}
            {analysis.webSearchStatus === "not_needed" && (
              <p className="skin-analysis__product-message" role="status">
                No product categories were matched to this scan. Ask Zyvar AI to help build a routine.
              </p>
            )}
            {analysis.recommendations?.length ? (
              <div className="skin-analysis__products">
                {analysis.recommendations.map((recommendation, index) => (
                  <SuggestedProduct
                    key={`${recommendation.name}-${index}`}
                    recommendation={recommendation}
                    wished={recommendation.product ? wishlist.isInWishlist(recommendation.product.id) : false}
                    added={recommendation.product ? Boolean(addedProductIds[recommendation.product.id]) : false}
                    onBuyNow={buyProduct}
                    onAddToCart={addProductToCart}
                    onToggleWishlist={toggleProductWishlist}
                    onRequest={setRequestProduct}
                  />
                ))}
              </div>
            ) : analysis.webSearchStatus === "searched" ? (
              <p className="skin-analysis__product-message">No reliable product matches were found in current web research. Ask Zyvar AI for tailored help.</p>
            ) : null}
            <button type="button" className="skin-analysis__ask-ai" onClick={askZyvarAboutScan}>
              <Bot aria-hidden="true" />
              Ask Zyvar AI how to use these products
            </button>
          </section>
        )}

        <p className="skin-analysis__medical-note">
          Zyvar AI cannot reliably measure hydration or identify skin conditions from a photo.
          Its observations are cosmetic guidance only. For persistent or concerning symptoms,
          consult a qualified dermatologist.
        </p>
      </div>
      {requestProduct && (
        <RequestProductModal
          key={`${requestProduct.name}-${requestProduct.referenceLink}`}
          open
          onClose={() => setRequestProduct(null)}
          searchText={requestProduct.name}
          requestDetails={requestProduct}
        />
      )}
    </section>
  );
}
