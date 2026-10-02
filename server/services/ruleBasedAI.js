const { searchProducts } = require("../tools/productTools");

const STOP_WORDS = new Set([
  "a", "an", "and", "any", "available", "below", "best", "buy", "can",
  "cost", "do", "for", "find", "get", "good", "have", "i", "in", "is",
  "looking", "me", "of", "please", "price", "product", "products",
  "recommend", "search", "show", "some", "the", "there", "under", "want",
  "what", "with", "you", "your", "zyvar", "৳", "tk", "bdt",
]);

function normalize(message) {
  return message.toLowerCase().replace(/[.,!?;:()[\]{}]/g, " ").replace(/\s+/g, " ").trim();
}

function getPriceLimit(message) {
  const match = message.match(
    /(?:under|below|less than|within|budget(?: of)?)\s*(?:৳\s*|tk\.?\s*|bdt\s*)?(\d{2,7})|(?:৳\s*|tk\.?\s*|bdt\s*)(\d{2,7})/i
  );
  const value = Number(match?.[1] || match?.[2]);
  return Number.isFinite(value) ? value : null;
}

function formatProducts(products) {
  return products
    .map((product) => {
      const price = Number.isFinite(product.price)
        ? `৳${product.price.toLocaleString("en-BD")}`
        : "price not listed";
      const stock = Number(product.stock) > 0 ? "in stock" : "out of stock";
      return `• ${product.name} — ${price}, ${stock}`;
    })
    .join("\n");
}

async function findProducts(message, productSearch) {
  const normalized = normalize(message);
  const maxPrice = getPriceLimit(message);
  const terms = normalized
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (word) =>
        word.length > 2 &&
        !/^\d+$/.test(word) &&
        !STOP_WORDS.has(word)
    );
  const query = terms.join(" ");

  if (!query && maxPrice === null) return [];

  const options = { maxPrice: maxPrice ?? undefined, limit: 5 };
  const firstResult = await productSearch({ ...options, query });
  const products = firstResult?.products || [];
  if (products.length || terms.length < 2) return products;

  const found = new Map();
  for (const term of terms.slice(0, 4)) {
    const result = await productSearch({ ...options, query: term });
    for (const product of result?.products || []) found.set(product.id, product);
    if (found.size >= 5) break;
  }
  return [...found.values()].slice(0, 5);
}

async function getChatReply(message, _conversation = [], productSearch = searchProducts) {
  const text = normalize(message);
  const bangla = /[\u0980-\u09ff]/.test(message);

  if (/^(hi|hello|hey|হাই|হ্যালো|আসসালামু আলাইকুম)[!. ]*$/.test(text)) {
    return bangla
      ? "হ্যালো! আমি Zyvar-এর সহায়ক। পণ্য খুঁজতে বা অর্ডার সম্পর্কে জানতে বলুন।"
      : "Hi! I'm Zyvar's shopping assistant. I can look up products, prices, and stock, or point you to order support. What are you looking for?";
  }

  if (/\b(thanks|thank you|ধন্যবাদ)\b/.test(text)) {
    return bangla ? "আপনাকে স্বাগতম!" : "You're welcome!";
  }

  if (/\b(contact|support|যোগাযোগ|সাহায্য)\b/.test(text)) {
    return "You can reach Zyvar at hello.zyvar@gmail.com or 01820400999, or visit /contact.";
  }

  if (/\b(order|tracking|track|অর্ডার)\b/.test(text)) {
    return "For order updates, sign in and open My Orders. If you need a person to help, contact Zyvar at hello.zyvar@gmail.com or 01820400999.";
  }

  if (/\b(delivery|shipping|return|refund|ডেলিভারি|রিটার্ন)\b/.test(text)) {
    return "I don't have verified delivery or return-policy details to quote. Please contact Zyvar at hello.zyvar@gmail.com or 01820400999 for the current policy.";
  }

  if (/\b(payment|pay|bkash|nagad|cash on delivery|payment method)\b/.test(text)) {
    return "The payment methods currently available for your order are shown at checkout. Cash on delivery is one of the checkout options.";
  }

  if (/\b(doctor|dermatologist|rash|bleeding|infection|allergic reaction|pain|diagnos)\b/.test(text)) {
    return "I can't diagnose or treat medical conditions. For persistent symptoms, pain, infection, or an allergic reaction, please contact a qualified healthcare professional or dermatologist.";
  }

  if (/\b(skincare|skin care|routine|acne|oily skin|dry skin|sensitive skin)\b/.test(text)) {
    return "A simple routine is gentle cleanser, moisturizer, and daytime sunscreen. Introduce new products one at a time and stop if irritation occurs. Tell me your skin type and budget if you'd like help finding products in Zyvar's catalog.";
  }

  if (/\b(find|show|search|product|products|price|cost|buy|stock|available|recommend|under|cleanser|sunscreen|moisturizer|serum|makeup|beauty|perfume)\b|৳|\bbdt\b|\btk\b/.test(text)) {
    try {
      const products = await findProducts(message, productSearch);
      if (products.length) {
        return `Here are matching products from Zyvar's catalog:\n${formatProducts(products)}\n\nOpen /products to see product details.`;
      }
      return "I couldn't find a matching item in the current catalog. Try a shorter product name, or browse /products.";
    } catch (error) {
      console.error("[zyvar-ai] product search failed:", error);
      return "I can't access the product catalog right now. Please try again shortly or contact hello.zyvar@gmail.com.";
    }
  }

  return "I'm Zyvar's code-based shopping assistant. I can answer common shop questions and look up catalog products, prices, and stock. I don't understand every open-ended question yet; try asking for a product or contact hello.zyvar@gmail.com for help.";
}

module.exports = { getChatReply, findProducts };
