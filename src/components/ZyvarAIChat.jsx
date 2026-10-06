import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-yellow-500 text-black"
            : "rounded-bl-sm border border-white/10 bg-[#171717] text-gray-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function RecommendedProduct({ product, wished, added, onAddToCart, onToggleWishlist }) {
  const image = Array.isArray(product.images) ? product.images[0] : product.image;
  const imageUrl = typeof image === "string" ? image : image?.url;
  const inStock = Number(product.stock) > 0;

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111]">
      <div className="flex gap-3 p-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg bg-white/5 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-white">{product.name}</p>
          <p className="mt-1 text-sm font-semibold text-yellow-300">
            {Number.isFinite(product.price) ? `৳${product.price.toLocaleString("en-BD")}` : "Price unavailable"}
          </p>
          <p className={`mt-0.5 text-xs ${inStock ? "text-green-400" : "text-red-300"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-yellow-500 px-2 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />}
          {added ? "Added" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          title={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 transition hover:bg-white/10 ${wished ? "text-pink-400" : "text-gray-300"}`}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} aria-hidden="true" />
        </button>
        <Link
          to={`/product/${product.slug || product.id}`}
          aria-label={`View and buy ${product.name}`}
          title="View product details"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function ZyvarAIChat() {
  const location = useLocation();
  const { addToCart } = useCart();
  const wishlist = useWishlist();
  const [requestProductName, setRequestProductName] = useState("");
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
  };

  const handleToggleWishlist = (product) => {
    if (wishlist.isInWishlist(product.id)) {
      wishlist.removeFromWishlist(product.id);
    } else {
      wishlist.addToWishlist(product);
    }
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
                    Tell me about your skin concern, skin type, and what you
                    want help with. I can share skincare guidance, look up
                    current worldwide product information when web search is
                    configured, and find matching products from Zyvar&apos;s catalog.
                    <br />
                    <br />
                    Ask in Bangla, Banglish, or English. I provide education,
                    not a medical diagnosis or treatment.
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
                {message.role === "assistant" && message.products?.length > 0 && (
                  <div className="ml-9 grid gap-2">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">
                      Zyvar catalog matches
                    </p>
                    {message.products.map((product) => (
                      <RecommendedProduct
                        key={product.id}
                        product={product}
                        wished={wishlist.isInWishlist(product.id)}
                        added={Boolean(addedProductIds[product.id])}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
                {message.role === "assistant" && message.productRequestName && (
                  <div className="ml-9 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="text-xs leading-relaxed text-gray-300">
                      I couldn&apos;t find an in-stock match in Zyvar&apos;s catalog. You can request it or contact our team.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestProductName(message.productRequestName)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-yellow-500 px-3 text-xs font-semibold text-black transition hover:bg-yellow-400"
                      >
                        <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                        Request product
                      </button>
                      <Link
                        to="/contact"
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-gray-200 transition hover:bg-white/5"
                      >
                        Contact support
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
                {message.role === "assistant" &&
                  message.webSearchStatus === "not_configured" && (
                    <p className="ml-9 text-xs text-amber-300">
                      Live web search needs an Ollama API key in the backend
                      configuration. These product cards, if shown, are only
                      matches from Zyvar&apos;s catalog.
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
              placeholder="Ask in Bangla, Banglish, or English..."
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
      {requestProductName && (
        <RequestProductModal
          open
          onClose={() => setRequestProductName("")}
          searchText={requestProductName}
        />
      )}
    </>
  );
}