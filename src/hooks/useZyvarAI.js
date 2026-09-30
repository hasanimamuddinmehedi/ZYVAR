import { useCallback, useEffect, useRef, useState } from "react";

/* =========================================================================
   ZYVAR AI — FRONTEND HOOK (Step 3)

   Owns all chat state and the network call to the existing Step 2 backend.
   The chat UI component only renders what this hook exposes — it never
   talks to the network directly. This keeps:

     Chat UI  →  useZyvarAI (this file)  →  POST /api/zyvar-ai/chat

   as a clean, replaceable chain, so later steps (product cards, cart
   actions, order tracking, etc.) can extend this hook without rewriting
   the chat window itself.

   SECURITY: this file never contains an API key, an Anthropic client, or
   any server-side credential. It only ever calls the one backend endpoint
   below. All of that lives exclusively on the server (Step 2).
   ========================================================================= */

/* -------------------------------------------------------------------------
   Backend endpoint
   -------------------------------------------------------------------------
   The rest of this project does not yet have an environment-variable-based
   config for this server — every existing call to it (Login.jsx, Signup.jsx,
   Newsletter.jsx, admin/partner OrdersPage.jsx, etc.) hardcodes this same
   absolute URL. Rather than inventing a new, inconsistent pattern, Step 3
   follows that exact existing convention.
------------------------------------------------------------------------- */
const ZYVAR_AI_API_URL =
  "https://zyvar-email-server.onrender.com/api/zyvar-ai/chat";

const REQUEST_TIMEOUT_MS = 30000;

// Mirrors the server-side caps (see server/utils/aiValidation.js) so we
// never send more than the backend will accept.
const MAX_CONVERSATION_MESSAGES_SENT = 20;

const STORAGE_KEY = "zyvar-ai-conversation";
const MAX_STORED_MESSAGES = 30;

/* -------------------------------------------------------------------------
   API client — isolated from rendering logic
------------------------------------------------------------------------- */
class ZyvarAIError extends Error {
  constructor(kind) {
    super(kind);
    this.kind = kind; // "network" | "timeout" | "rate_limited" | "invalid_request" | "server" | "malformed"
  }
}

function friendlyErrorMessage(kind) {
  switch (kind) {
    case "rate_limited":
      return "Too many requests right now. Please wait a moment and try again.";
    case "invalid_request":
      return "Sorry, I couldn't process that message. Please try rephrasing it.";
    case "network":
    case "timeout":
    case "server":
    case "malformed":
    default:
      return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

/**
 * sendMessageToZyvarAI({ message, conversation })
 * The ONLY function in the frontend that talks to the AI backend.
 * Never sends anything beyond { message, conversation } — no system
 * prompts, no credentials, no arbitrary internal state.
 */
async function sendMessageToZyvarAI({ message, conversation }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(ZYVAR_AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversation: conversation
          .slice(-MAX_CONVERSATION_MESSAGES_SENT)
          .map((m) => ({ role: m.role, content: m.content })),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ZyvarAIError("timeout");
    }
    throw new ZyvarAIError("network");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 429) throw new ZyvarAIError("rate_limited");
    if (response.status === 400) throw new ZyvarAIError("invalid_request");
    throw new ZyvarAIError("server");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new ZyvarAIError("malformed");
  }

  if (!data || typeof data.reply !== "string") {
    throw new ZyvarAIError("malformed");
  }

  return data.reply;
}

/* -------------------------------------------------------------------------
   localStorage helpers
------------------------------------------------------------------------- */
function isValidStoredMessage(m) {
  return (
    m &&
    typeof m === "object" &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    m.content.length > 0 &&
    m.content.length < 4000
  );
}

function loadStoredMessages() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidStoredMessage).slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

function saveStoredMessages(messages) {
  try {
    const safe = messages.filter(isValidStoredMessage).slice(-MAX_STORED_MESSAGES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Quota exceeded, storage disabled, etc. — silently skip persistence,
    // the chat still works for the current session either way.
  }
}

function clearStoredMessages() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* -------------------------------------------------------------------------
   Hook
------------------------------------------------------------------------- */
export default function useZyvarAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadStoredMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Holds what's needed to retry a failed send WITHOUT re-appending a
  // duplicate user bubble (the failed message is already in `messages`).
  const lastFailedRef = useRef(null);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    lastFailedRef.current = null;
    clearStoredMessages();
  }, []);

  // Shared core: actually calls the backend and updates state. Does NOT
  // touch the user-message bubble — the caller is responsible for that,
  // so a retry can reuse this without appending a duplicate.
  const performSend = useCallback(async (text, conversationSoFar) => {
    setError(null);
    setLoading(true);

    try {
      const reply = await sendMessageToZyvarAI({
        message: text,
        conversation: conversationSoFar,
      });

      lastFailedRef.current = null;
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      const kind = err instanceof ZyvarAIError ? err.kind : "server";
      lastFailedRef.current = { text, conversationSoFar };
      setError(friendlyErrorMessage(kind));
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    (rawText) => {
      const text = typeof rawText === "string" ? rawText.trim() : "";

      if (!text || loading) return;

      const userMessage = { id: makeId(), role: "user", content: text };

      // Snapshot the conversation as it stands BEFORE this new message,
      // since that's what the backend expects as prior context.
      let conversationSoFar = [];

      setMessages((prev) => {
        conversationSoFar = prev;
        return [...prev, userMessage];
      });

      setInput("");

      // conversationSoFar is populated synchronously by the updater above
      // before React commits, so it's safe to use immediately here.
      performSend(text, conversationSoFar);
    },
    [loading, performSend]
  );

  const retryLastMessage = useCallback(() => {
    const pending = lastFailedRef.current;
    if (pending && !loading) {
      performSend(pending.text, pending.conversationSoFar);
    }
  }, [loading, performSend]);

  return {
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
  };
}