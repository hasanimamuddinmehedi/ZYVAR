import { auth } from "../firebase/firebase";

/* =========================================================================
   PRODUCT AI — client API
   Talks to the ZYVAR server (/api/product-ai/*). Seller endpoints send the
   signed-in user's Firebase ID token; the server only allows ZYVAR admin
   and approved partners. Set VITE_PRODUCT_AI_API_URL to override the host.
   ========================================================================= */

const BASE =
  import.meta.env.VITE_PRODUCT_AI_API_URL ||
  "https://zyvar-email-server.onrender.com/api/product-ai";

async function request(path, body, { authed = true, timeoutMs = 90000 } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (authed) {
    const user = auth.currentUser;
    if (!user) throw new Error("Please sign in again.");
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("The AI service request timed out. Please try again.", {
        cause: error,
      });
    }
    throw new Error("Could not reach the AI service. Please try again.", {
      cause: error,
    });
  }

  const responseText = await res.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    if (res.ok) {
      throw new Error("The AI service returned an invalid response.", {
        cause: error,
      });
    }
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "The product AI endpoint is missing from the backend. Deploy the latest server update and try again."
      );
    }
    throw new Error(
      data.error || `The AI service request failed (HTTP ${res.status}).`
    );
  }
  return data;
}

export const analyzeProductName = ({ name, categories, description }) =>
  request("/analyze", { name, categories, description });

export const suggestProductPrice = ({ name, category }) =>
  request("/price", { name, category }, { timeoutMs: 120000 });

export const findProductImages = ({ name }) =>
  request("/images", { name }, { timeoutMs: 120000 });

export const translateToBengali = async (text) => {
  const result = await request("/translate", { text }, { authed: false });
  if (typeof result.translation !== "string" || !result.translation.trim()) {
    throw new Error("The translation service returned an invalid response.");
  }
  return result.translation;
};
