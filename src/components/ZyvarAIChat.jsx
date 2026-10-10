import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  Heart,
  Loader2,
  PackagePlus,
  RotateCcw,
  Send,
  ShoppingCart,
  Sparkles,
  Store,
  Zap,
  X,
} from "lucide-react";

import useZyvarAI from "../hooks/useZyvarAI";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import RequestProductModal from "./RequestProductModal";

/* =========================================================================
  ZYVAR AI CHAT

  Global multilingual skincare consultation and shopping widget. The
  backend supplies assistant replies and verified catalog products; this
  component renders them with the store's shopping actions.
  ========================================================================= */

const QUICK_SUGGESTIONS = [
  "I have sensitive skin. Help me build a routine.",
  "How should I use niacinamide?",
  "Find sunscreen under ৳1000",
  "আমার ত্বক তৈলাক্ত, কী ব্যবহার করব?",
];

// Routes where the public chat widget should not appear.
const HIDDEN_EXACT_PATHS = ["/login", "/signup", "/user-login", "/payment"];
const HIDDEN_PATH_PREFIXES = ["/admin", "/partner-dashboard"];

function shouldHideOnPath(pathname) {
  return (
    HIDDEN_EXACT_PATHS.includes(pathname) ||
    HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function AssistantAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
      <Sparkles className="h-3.5 w-3.5 text-yellow-400" aria-hidden="true" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <AssistantAvatar />
      <div
        className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-[#171717] px-4 py-3"
        role="status"
      >
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400/80 [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400/80 [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400/80" />
        </span>
        <span className="text-xs text-gray-400">Zyvar AI is thinking...</span>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <AssistantAvatar />}
      <div
        className={`max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm leading-7 ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
            : "rounded-bl-sm border border-white/10 bg-gradient-to-br from-[#1b1b1b] to-[#121212] text-gray-100 shadow-lg shadow-black/10"
        }`}
      >
        <FormattedReply content={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

function FormattedReply({ content, isUser }) {
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let listItems = [];
  let listType = "";

  const inlineContent = (text, keyPrefix) => text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${keyPrefix}-${index}`} className={`font-semibold ${isUser ? "text-black" : "text-white"}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={`${keyPrefix}-${index}`} className="rounded bg-white/10 px-1 py-0.5 text-yellow-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });

  const flushList = () => {
    if (!listItems.length) return;
    const List = listType === "number" ? "ol" : "ul";
    blocks.push(
      <List key={`list-${blocks.length}`} className={`${listType === "number" ? "list-decimal" : "list-disc"} space-y-1 pl-5 marker:text-yellow-400`}>
        {listItems.map((item, index) => <li key={index}>{inlineContent(item, `list-${blocks.length}-${index}`)}</li>)}
      </List>,
    );
    listItems = [];
    listType = "";
  };

  lines.forEach((line, index) => {
    const heading = line.match(/^\s*#{1,3}\s+(.+)/);
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      const nextType = numbered ? "number" : "bullet";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || numbered)[1]);
      return;
    }
    flushList();
    if (heading) {
      blocks.push(
        <h4 key={`heading-${index}`} className="pt-1 font-semibold text-white">
          {inlineContent(heading[1], `heading-${index}`)}
        </h4>,
      );
      return;
    }
    if (line.trim()) {
      blocks.push(<p key={`paragraph-${index}`}>{inlineContent(line, `paragraph-${index}`)}</p>);
    }
  });
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}

function RecommendedProduct({ product, position, wished, added, onBuyNow, onAddToCart, onToggleWishlist, onRequestProduct, onNavigate }) {
  const image = product.imageUrl || product.images?.[0] || product.image;
  const imageUrl = typeof image === "string"
    ? image
    : image?.url || image?.secure_url || image?.src;
  const [imageFailed, setImageFailed] = useState(false);
  const inStock = Number(product.stock) > 0;

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-lg shadow-black/10">
      <div className="flex gap-3 p-3">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-20 w-20 shrink-0 rounded-lg bg-white/5 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">Suggestion {String(position).padStart(2, "0")}</p>
          <p className="line-clamp-2 text-sm font-medium text-white">{product.name}</p>
          <p className="mt-1 text-sm font-semibold text-yellow-300">
            {Number.isFinite(product.price) ? `৳${product.price.toLocaleString("en-BD")}` : "Price unavailable"}
          </p>
          <p className={`mt-0.5 text-xs ${inStock ? "text-green-400" : "text-red-300"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => onBuyNow(product)}
          disabled={!inStock}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-yellow-500 px-2 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          Buy now · pay
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />}
          {added ? "Added to cart" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 text-xs transition hover:bg-white/10 ${wished ? "text-pink-400" : "text-gray-300"}`}
        >
          <Heart className="h-3.5 w-3.5" fill={wished ? "currentColor" : "none"} aria-hidden="true" />
          {wished ? "Wishlisted" : "Wishlist"}
        </button>
        <Link
          to={`/product/${product.slug || product.id}`}
          onClick={onNavigate}
          aria-label={`View and buy ${product.name}`}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          Details
        </Link>
      </div>
      {!inStock && (
        <button type="button" onClick={() => onRequestProduct(product.name)} className="w-full border-t border-white/10 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/10">
          <PackagePlus className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Request this product
        </button>
      )}
    </article>
  );
}

function PartnerStoreCard({ store, onNavigate }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111] p-3">
      {store.logo ? (
        <img src={store.logo} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-yellow-400"><Store className="h-5 w-5" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{store.name}</p>
        {store.address && <p className="truncate text-xs text-gray-400">{store.address}</p>}
      </div>
      <Link to={`/${store.slug}`} onClick={onNavigate} className="shrink-0 rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/10">
        Visit store
      </Link>
    </article>
  );
}

function MissingProductRequest({ recommendation, position, onRequest }) {
  const { name, approximateCost, description, referenceLink } = recommendation;
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400">Suggestion {String(position).padStart(2, "0")} · Not in catalog</p>
        <p className="mt-1 break-words text-sm text-white">{name}</p>
        <p className="mt-1 text-xs text-yellow-200">
          Approx. worldwide cost: {approximateCost || "Not available from current sources"}
        </p>
        {description && <p className="mt-1 text-xs leading-relaxed text-gray-400">{description}</p>}
        {referenceLink && (
          <a
            href={referenceLink}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-xs text-yellow-300 underline underline-offset-2"
          >
            View reference
          </a>
        )}
      </div>
      <button type="button" onClick={() => onRequest(recommendation)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-yellow-500 px-3 text-xs font-semibold text-black transition hover:bg-yellow-400">
        <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
        Request
      </button>
    </article>
  );
}

function getMessageRecommendations(message) {
  if (message.recommendations?.length) return message.recommendations;
  const entries = (message.products || []).map((product) => ({ type: "product", product }));
  const requestNames = [...new Set([...(message.productRequestNames || []), message.productRequestName].filter(Boolean))];
  return [
    ...entries,
    ...requestNames.map((name) => ({ type: "request", name })),
  ];
}

export default function ZyvarAIChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, setSelectedItems } = useCart();
  const wishlist = useWishlist();
  const [requestProduct, setRequestProduct] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState({});

  const {
    isOpen,
    open,
    close,
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    retryLastMessage,
    clearConversation,
  } = useZyvarAI();

  const listEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to the newest message / loading indicator.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, isOpen]);

  // Focus the input when the panel opens; close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Auto-grow the textarea (capped) as the user types.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  if (shouldHideOnPath(location.pathname)) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductIds((previous) => ({ ...previous, [product.id]: true }));
    close();
    navigate("/cart");
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    setSelectedItems([product.id]);
    close();
    navigate("/payment");
  };

  const handleToggleWishlist = (product) => {
    if (wishlist.isInWishlist(product.id)) {
      wishlist.removeFromWishlist(product.id);
    } else {
      wishlist.addToWishlist(product);
    }
    close();
    navigate("/wishlist");
  };

  const handleRequestProduct = (request) => {
    setRequestProduct(
      typeof request === "string" ? { name: request } : request,
    );
    close();
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      {/* FLOATING LAUNCHER — positioned clear of the WhatsApp support button. */}
      {!isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label="Open Zyvar AI, your shopping and beauty assistant"
          className="fixed bottom-6 right-28 z-[9997] flex items-center gap-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 px-4 py-3.5 text-black shadow-2xl shadow-black/60 transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:right-32 md:px-5"
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="hidden text-sm font-semibold sm:inline">Zyvar AI</span>
        </button>
      )}

      {/* CHAT PANEL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Zyvar AI chat"
          className="fixed inset-0 z-[10000] flex h-dvh flex-col overflow-hidden border-white/10 bg-[#0B0B0B] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-black/70 md:inset-auto md:bottom-4 md:right-4 md:h-[min(640px,calc(100dvh-2rem))] md:max-h-[calc(100dvh-2rem)] md:w-[min(400px,calc(100vw-2rem))] md:rounded-2xl md:border md:pt-0 md:pb-0"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#141414] to-[#0B0B0B] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
                <Sparkles className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">Zyvar AI</p>
                <p className="text-[11px] leading-tight text-gray-400">
                  Your Personal Shopping &amp; Beauty Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="mr-1 hidden items-center gap-1 text-[11px] text-green-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" />
                Online
              </span>
              <button
                type="button"
                onClick={clearConversation}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close Zyvar AI chat"
                className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Conversation with Zyvar AI"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-2">
                  <AssistantAvatar />
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-[#171717] px-4 py-3 text-sm leading-relaxed text-gray-100">
                    Hi, I&apos;m Zyvar AI 👋
                    <br />
                    <br />
                    I can help you find Zyvar products and partner stores, explain
                    how to order or pay, and connect you with customer care.
                    When available, I research product guidance online and only
                    show products verified in Zyvar&apos;s catalog.
                    <br />
                    <br />
                    Tell me what you&apos;re shopping for, your budget, or
                    what you need help with. For skin concerns, I share
                    education rather than a medical diagnosis or treatment.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pl-9">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={loading}
                      className="rounded-full border border-yellow-500/30 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-300 transition hover:bg-yellow-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <MessageBubble message={message} />
                {message.role === "assistant" && getMessageRecommendations(message).length > 0 && (
                  <div className="ml-9 grid gap-2">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">
                      Zyvar catalog and worldwide suggestions
                    </p>
                    {getMessageRecommendations(message).map((recommendation, index) => recommendation.type === "product" ? (
                      <RecommendedProduct
                        key={recommendation.product.id}
                        product={recommendation.product}
                        position={index + 1}
                        wished={wishlist.isInWishlist(recommendation.product.id)}
                        added={Boolean(addedProductIds[recommendation.product.id])}
                        onBuyNow={handleBuyNow}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        onRequestProduct={handleRequestProduct}
                        onNavigate={close}
                      />
                    ) : (
                      <MissingProductRequest
                        key={`${recommendation.name}-${index}`}
                        recommendation={recommendation}
                        position={index + 1}
                        onRequest={handleRequestProduct}
                      />
                    ))}
                  </div>
                )}
                {message.role === "assistant" && message.stores?.length > 0 && (
                  <div className="ml-9 grid gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner stores</p>
                    {message.stores.map((store) => (
                      <PartnerStoreCard key={store.id || store.slug} store={store} onNavigate={close} />
                    ))}
                  </div>
                )}
                {message.role === "assistant" && message.actions?.length > 0 && (
                  <div className="ml-9 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Link
                        key={`${action.path}-${action.label}`}
                        to={action.path}
                        onClick={close}
                        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 text-xs font-semibold text-yellow-200 transition hover:bg-yellow-500/15"
                      >
                        {action.label}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
                {message.role === "assistant" &&
                  message.webSearchStatus === "not_configured" && (
                    <p className="ml-9 text-xs text-amber-300">
                      Live product research is not enabled right now, so I
                      haven&apos;t claimed to search the web. Any product cards
                      shown are verified matches from Zyvar&apos;s catalog.
                    </p>
                  )}
                {message.role === "assistant" &&
                  message.webSearchStatus === "unavailable" && (
                    <p className="ml-9 text-xs text-amber-300">
                      Live web search is temporarily unavailable. Any product
                      cards shown are only matches from Zyvar&apos;s catalog.
                    </p>
                  )}
                {message.role === "assistant" &&
                  message.webSearchStatus === "no_results" && (
                    <p className="ml-9 text-xs text-amber-300">
                      I couldn&apos;t find useful web results for that search.
                      Any product cards shown are only matches from Zyvar&apos;s catalog.
                    </p>
                  )}
                {message.role === "assistant" && message.sources?.length > 0 && (
                  <div className="ml-9 border-l border-white/10 pl-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase text-gray-500">Web sources</p>
                    <ul className="space-y-1">
                      {message.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={close}
                            className="inline-flex items-start gap-1 text-xs text-yellow-300 underline decoration-yellow-500/30 underline-offset-2 hover:text-yellow-200"
                          >
                            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                            <span>{source.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {loading && <TypingIndicator />}

            <div ref={listEndRef} />
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div
              role="alert"
              className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={retryLastMessage}
                className="shrink-0 rounded-full border border-red-400/40 px-2 py-1 font-semibold text-red-200 transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Retry
              </button>
            </div>
          )}

          {/* INPUT */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-white/10 bg-[#0B0B0B] px-3 py-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <label htmlFor="zyvar-ai-input" className="sr-only">
              Message Zyvar AI
            </label>
            <textarea
              id="zyvar-ai-input"
              ref={(el) => {
                textareaRef.current = el;
                inputRef.current = el;
              }}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, stores, orders, or payment..."
              maxLength={2000}
              disabled={loading}
              className="max-h-[120px] flex-1 resize-none rounded-xl border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black transition hover:bg-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      )}
      {requestProduct && (
        <RequestProductModal
          key={`${requestProduct.name}-${requestProduct.referenceLink || ""}`}
          open
          onClose={() => setRequestProduct(null)}
          searchText={requestProduct.name}
          requestDetails={requestProduct}
        />
      )}
    </>
  );
}