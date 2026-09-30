import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X, RotateCcw, Send, Loader2 } from "lucide-react";

import useZyvarAI from "../hooks/useZyvarAI";

/* =========================================================================
   ZYVAR AI CHAT — Step 3

   Global floating chat widget. Renders itself (or not) based on the
   current route, so App.jsx only needs to mount <ZyvarAIChat /> once at
   the top level — no per-route wiring required.

   Step 3 scope only: plain-text conversation with the existing
   POST /api/zyvar-ai/chat backend. No product cards, no cart/wishlist
   actions, no order lookups yet — those are later steps.
   ========================================================================= */

const QUICK_SUGGESTIONS = [
  "Find a cleanser",
  "Skincare help",
  "Products under ৳1000",
  "Show me sunscreen",
  "Help me choose a gift",
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

export default function ZyvarAIChat() {
  const location = useLocation();

  const {
    isOpen,
    open,
    close,
    toggle,
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

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      {/* FLOATING LAUNCHER — positioned clear of the existing WhatsApp
          support button (which sits at bottom-6 right-5). */}
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
          className="fixed inset-0 z-[10000] flex flex-col overflow-hidden border-white/10 bg-[#0B0B0B] shadow-2xl shadow-black/70 md:inset-auto md:bottom-8 md:right-6 md:h-[640px] md:w-[400px] md:rounded-2xl md:border"
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
                    I can help you find products, choose skincare and beauty
                    picks, compare options, and answer your questions.
                    <br />
                    <br />
                    You can ask me in Bangla, Banglish, or English — whatever
                    feels natural.
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
              <MessageBubble key={message.id} message={message} />
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
    </>
  );
}