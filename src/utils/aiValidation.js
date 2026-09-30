/* =========================================================================
   AI VALIDATION — Zyvar AI, Step 2

   Server-side validation for the /api/zyvar-ai/chat endpoint.
   The server, not the client, decides what is acceptable — this file
   rejects anything malformed before it ever reaches the AI provider.
   ========================================================================= */

const MAX_MESSAGE_LENGTH = 2000; // characters
const MAX_CONVERSATION_MESSAGES = 20; // total prior turns accepted from client
const MAX_CONVERSATION_MESSAGE_LENGTH = 2000; // characters, per prior message

const ALLOWED_CONVERSATION_ROLES = ["user", "assistant"];

/**
 * Validates the incoming chat request body.
 * Returns { valid: true, message, conversation } or { valid: false, error }.
 *
 * IMPORTANT: this intentionally strips anything from `conversation` that
 * isn't a plain { role, content } pair with an allowed role — this is what
 * prevents a client from smuggling in a "system" role message to try to
 * override the server-controlled system prompt.
 */
function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request" };
  }

  const { message, conversation } = body;

  // MESSAGE
  if (typeof message !== "string") {
    return { valid: false, error: "Invalid request" };
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return { valid: false, error: "Invalid request" };
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: "Invalid request" };
  }

  // CONVERSATION (optional — defaults to empty)
  let safeConversation = [];

  if (conversation !== undefined && conversation !== null) {
    if (!Array.isArray(conversation)) {
      return { valid: false, error: "Invalid request" };
    }

    if (conversation.length > MAX_CONVERSATION_MESSAGES) {
      return { valid: false, error: "Invalid request" };
    }

    for (const entry of conversation) {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof entry.content !== "string" ||
        !ALLOWED_CONVERSATION_ROLES.includes(entry.role)
      ) {
        // Silently drop anything malformed or with a disallowed role
        // (e.g. a client-supplied "system" message) rather than erroring
        // the whole request — but never let it through.
        continue;
      }

      const content = entry.content.trim();

      if (content.length === 0 || content.length > MAX_CONVERSATION_MESSAGE_LENGTH) {
        continue;
      }

      safeConversation.push({
        role: entry.role,
        content,
      });
    }
  }

  return {
    valid: true,
    message: trimmedMessage,
    conversation: safeConversation,
  };
}

module.exports = {
  validateChatRequest,
  MAX_MESSAGE_LENGTH,
  MAX_CONVERSATION_MESSAGES,
  MAX_CONVERSATION_MESSAGE_LENGTH,
};