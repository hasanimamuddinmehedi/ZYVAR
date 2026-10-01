/* =========================================================================
   AI SERVICE — Zyvar AI, Step 2

    Wraps the Gemini Interactions API and implements controlled function calling
   loop. The AI never gets direct Firebase access — it can only request one
   of the explicitly registered tools below, and this file is the only place
   that decides whether a requested tool actually runs.
   ========================================================================= */

const { GoogleGenAI } = require("@google/genai");

const {
  searchProducts,
  getProductDetails,
  checkProductStock,
} = require("../tools/productTools");

/* -------------------------------------------------------------------------
   Provider client
   -------------------------------------------------------------------------
    GEMINI_API_KEY / GEMINI_MODEL are read from server-side environment variables
    only. Never exposed to the frontend.
------------------------------------------------------------------------- */
let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MAX_TOOL_ITERATIONS = 4; // hard cap — never loop on tool calls forever
const MAX_OUTPUT_TOKENS = 1024;

/* -------------------------------------------------------------------------
   System instructions (server-controlled — never overridable by the client)
------------------------------------------------------------------------- */
const SYSTEM_PROMPT = `You are Zyvar AI — Zyvar's shopping and beauty assistant.

LANGUAGE
- Zyvar's customers write in Bangla, Banglish (Bangla written in Latin letters), English, or a mix of all three in the same message.
- Understand all of these, and reply in the same language/style the customer used. If they write Banglish, a natural Banglish reply is fine — do not force overly formal Bangla.
- Example — a customer might ask the same question three ways:
  Bangla: "আপনার বাজেট কত?"
  Banglish: "Apnar budget koto?"
  English: "What is your budget?"
  Match whichever style the customer is using.

ROLE
- Help customers discover Zyvar's real products, answer general skincare/beauty questions, and help them build routines.
- Ask a clarifying question when you need more information (e.g. skin type, budget, category) before recommending something.
- You are a shopping and beauty assistant, not a general-purpose chatbot — stay focused on that.

PRODUCT DATA — VERY IMPORTANT
- You have tools (searchProducts, getProductDetails, checkProductStock) that look up Zyvar's actual product catalog. Use them whenever a customer asks about products, prices, stock, or availability.
- Never invent a product, price, or stock number. Only state a product exists, is priced a certain way, or is in/out of stock if a tool call actually returned that information.
- If a tool does not return a product the customer asked about, tell them honestly that you couldn't find it — do not claim it exists or is available.
- Clearly distinguish general skincare/beauty knowledge (which you can share freely) from Zyvar-specific information such as prices, stock, or catalog contents (which must always come from a tool call).

SAFETY — SKINCARE AND BEAUTY
- You may: give general skincare education, explain what common cosmetic products are for, discuss ingredients when you have reliable general knowledge of them, suggest cosmetic/skincare products based on stated preferences, and help build general skincare routines.
- You must NOT: claim to be a licensed dermatologist or doctor, diagnose any disease, prescribe prescription medication, state a definitive medical diagnosis, or tell a customer that a serious symptom definitely is a specific disease.
- If a customer describes symptoms that could be a medical condition (persistent pain, bleeding, rapidly changing moles, signs of infection, allergic reactions, etc.), calmly and non-alarmingly encourage them to consult a qualified healthcare professional or dermatologist, rather than trying to diagnose it yourself.
- Keep this guidance factual and calm — do not exaggerate risk to seem more helpful.`;

/* -------------------------------------------------------------------------
   Tool schemas exposed to the model.
   -------------------------------------------------------------------------
   This is the ONLY interface the AI has to product data. It cannot
   construct its own queries, name its own collections, or request fields
   outside of what's declared here.
------------------------------------------------------------------------- */
const TOOL_SCHEMAS = [
  {
    name: "searchProducts",
    description:
      "Search Zyvar's real product catalog by text query, category, and/or price range. Returns only products that actually exist.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text search, e.g. product name, category, or keyword.",
        },
        category: {
          type: "string",
          description: "Exact category to filter by, if the customer named one.",
        },
        minPrice: {
          type: "number",
          description: "Minimum price in BDT, if the customer gave a budget range.",
        },
        maxPrice: {
          type: "number",
          description: "Maximum price in BDT, if the customer gave a budget range.",
        },
        limit: {
          type: "integer",
          description: "Max number of results to return (server caps this at 10).",
        },
      },
    },
  },
  {
    name: "getProductDetails",
    description: "Get full details for one specific product by its product ID.",
    input_schema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The Firestore product document ID (from a prior searchProducts result).",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "checkProductStock",
    description: "Check whether a specific product is currently in stock, and how many units remain.",
    input_schema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The Firestore product document ID (from a prior searchProducts result).",
        },
      },
      required: ["productId"],
    },
  },
];

const GEMINI_FUNCTION_DECLARATIONS = TOOL_SCHEMAS.map(
  ({ name, description, input_schema }) => ({
    type: "function",
    name,
    description,
    parameters: input_schema,
  })
);

// Dispatch table — the ONLY tools that can ever execute. Anything the
// model requests that isn't a key here is rejected outright.
const TOOL_HANDLERS = {
  searchProducts,
  getProductDetails,
  checkProductStock,
};

/**
 * Executes a single tool call requested by the model, after validating
 * that it's a registered tool and that its arguments are a plain object.
 * Never executes arbitrary code — only ever calls one of the three
 * fixed functions above, with the arguments they each already validate
 * internally (see tools/productTools.js).
 */
async function executeTool(toolName, toolInput) {
  const handler = TOOL_HANDLERS[toolName];

  if (typeof handler !== "function") {
    return { error: "unknown_tool" };
  }

  const args =
    toolInput && typeof toolInput === "object" && !Array.isArray(toolInput)
      ? toolInput
      : {};

  try {
    return await handler(args);
  } catch (err) {
    console.error(`[zyvar-ai] tool "${toolName}" failed:`, err);
    return { error: "tool_execution_failed" };
  }
}

/**
 * Runs the full chat turn: sends the user's message (plus prior sanitized
 * conversation) to the model, executes any requested tool calls, feeds the
 * results back, and returns the final text reply.
 *
 * @param {string} message - the new user message (already validated)
 * @param {Array<{role: "user"|"assistant", content: string}>} conversation
 * @returns {Promise<string>} the assistant's final text reply
 */
async function getChatReply(message, conversation = []) {
  const gemini = getClient();

  const conversationContext = conversation
    .map((turn) => `${turn.role === "assistant" ? "Assistant" : "Customer"}: ${turn.content}`)
    .join("\n\n");
  const input = conversationContext
    ? `${conversationContext}\n\nCustomer: ${message}`
    : message;

  let finalText = "";
  let interaction = await gemini.interactions.create({
    model: MODEL,
    input,
    generation_config: { max_output_tokens: MAX_OUTPUT_TOKENS },
    system_instruction: SYSTEM_PROMPT,
    tools: GEMINI_FUNCTION_DECLARATIONS,
  });

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const functionCalls = (interaction.steps || []).filter(
      (step) => step.type === "function_call"
    );

    finalText = interaction.output_text?.trim() || "";

    if (functionCalls.length === 0) {
      return (
        finalText ||
        "Sorry, I'm having trouble finding that right now. Could you try rephrasing?"
      );
    }

    const functionResults = [];

    for (const call of functionCalls) {
      const result = await executeTool(call.name, call.arguments);

      functionResults.push({
        type: "function_result",
        call_id: call.id,
        name: call.name,
        result: JSON.stringify(result),
      });
    }

    interaction = await gemini.interactions.create({
      model: MODEL,
      previous_interaction_id: interaction.id,
      input: functionResults,
      generation_config: { max_output_tokens: MAX_OUTPUT_TOKENS },
      system_instruction: SYSTEM_PROMPT,
      tools: GEMINI_FUNCTION_DECLARATIONS,
    });
  }

  // Safety net if we somehow exhaust MAX_TOOL_ITERATIONS without a final
  // text answer — never leave the customer with a blank response.
  return (
    finalText ||
    "Sorry, I'm having trouble finding that right now. Could you try rephrasing?"
  );
}

module.exports = {
  getChatReply,
};