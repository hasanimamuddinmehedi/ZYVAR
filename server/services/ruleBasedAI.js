const { searchProducts } = require("../tools/productTools");

const STOP_WORDS = new Set([
  "a", "an", "and", "any", "are", "available", "below", "best", "buy", "can",
  "cost", "does", "do", "for", "find", "get", "good", "have", "how", "i", "in", "is",
  "it", "much", "sell",
  "looking", "me", "of", "please", "price", "product", "products",
  "recommend", "search", "show", "some", "the", "there", "under", "want",
  "what", "with", "you", "your", "zyvar", "৳", "tk", "bdt", "face", "skin",
]);

const PRODUCT_SYNONYMS = [
  [/face\s*wash|facewash|mukh dhoyar|মুখ ধোয়ার|ফেসওয়াশ/gi, "cleanser"],
  [/sun\s*screen|sun\s*cream|suncream|সানস্ক্রিন/gi, "sunscreen"],
  [/moisturi[sz]er|moisturiser|ময়েশ্চারাইজার/gi, "moisturizer"],
  [/lip\s*balm|lipbalm|লিপ বাম/gi, "lip balm"],
  [/hair\s*oil|চুলের তেল/gi, "hair oil"],
];

function matches(text, expressions) {
  return expressions.some((expression) => expression.test(text));
}

function getSearchQuery(message) {
  let normalized = normalize(message);
  for (const [synonym, replacement] of PRODUCT_SYNONYMS) {
    normalized = normalized.replace(synonym, replacement);
  }

  return normalized
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (word) =>
        word.length > 2 &&
        !/^\d+$/.test(word) &&
        !STOP_WORDS.has(word)
    )
    .join(" ");
}

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
  const maxPrice = getPriceLimit(message);
  const query = getSearchQuery(message);
  const terms = query.split(" ").filter(Boolean);

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

async function getChatReply(message, conversation = [], productSearch = searchProducts) {
  const text = normalize(message);
  const bangla = /[\u0980-\u09ff]/.test(message);
  const lastCustomerMessage = [...conversation]
    .reverse()
    .find((turn) => turn.role === "user")?.content;
  const isFollowUp = matches(text, [
    /^(and\b|also\b|what about\b|how much\b|under\b|below\b|within\b|in stock\b|available\b|does it\b|is it\b|it\b|that\b|same\b)/,
    /^(এটার|ওটার|এটা|ওটা|আর|তাহলে|দাম|স্টকে|আছে কি)/,
  ]);
  const searchMessage =
    isFollowUp && lastCustomerMessage
      ? `${lastCustomerMessage} ${message}`
      : message;

  if (/^(hi|hello|hey|হাই|হ্যালো|আসসালামু আলাইকুম|assalamu alaikum|salam)[!. ]*$/.test(text)) {
    return bangla
      ? "হ্যালো! আমি Zyvar-এর সহায়ক। পণ্য খুঁজতে বা অর্ডার সম্পর্কে জানতে বলুন।"
      : "Hi! I'm Zyvar's shopping assistant. I can look up products, prices, and stock, or point you to order support. What are you looking for?";
  }

  if (matches(text, [
    /\b(who are you|what can you do|what do you do|what can you help)\b/,
    /আপনি কে|কি করতে পারেন/,
  ])) {
    return "I'm Zyvar's shopping assistant. I can look up products and prices, check catalog stock, and answer common questions about orders, payments, and skincare.";
  }

  if (/^(good morning|good afternoon|good evening)[!. ]*$/.test(text)) {
    return "Hello! How can I help with your shopping today?";
  }

  if (/^(bye|goodbye|see you|বিদায়)[!. ]*$/.test(text)) {
    return bangla ? "আবার দেখা হবে! ভালো থাকবেন।" : "Goodbye! Thanks for visiting Zyvar.";
  }

  if (matches(text, [/\b(thanks|thank you|thx)\b/, /ধন্যবাদ|অনেক ধন্যবাদ/])) {
    return bangla ? "আপনাকে স্বাগতম!" : "You're welcome!";
  }

  if (matches(text, [
    /\b(contact|support|customer service|talk to (a person|someone)|phone number|email address)\b/,
    /যোগাযোগ|সাহায্য|ফোন নম্বর|কাস্টমার সার্ভিস/,
  ])) {
    return "You can reach Zyvar at hello.zyvar@gmail.com or 01820400999, or visit /contact.";
  }

  if (matches(text, [
    /\b(order|tracking|track|where is my|my parcel|my package)\b/,
    /অর্ডার|পার্সেল|ট্র্যাকিং/,
  ])) {
    return "For order updates, sign in and open My Orders. If you need a person to help, contact Zyvar at hello.zyvar@gmail.com or 01820400999.";
  }

  if (matches(text, [
    /\b(delivery|shipping|return|refund|exchange|arrive|how long.*deliver)\b/,
    /ডেলিভারি|রিটার্ন|ফেরত|এক্সচেঞ্জ/,
  ])) {
    return "I don't have verified delivery or return-policy details to quote. Please contact Zyvar at hello.zyvar@gmail.com or 01820400999 for the current policy.";
  }

  if (matches(text, [
    /\b(payment|pay|bkash|nagad|cash on delivery|payment method|card|pay when)\b/,
    /পেমেন্ট|বিকাশ|নগদ|ক্যাশ অন ডেলিভারি/,
  ])) {
    return "The payment methods currently available for your order are shown at checkout. Cash on delivery is one of the checkout options.";
  }

  if (matches(text, [
    /\b(doctor|dermatologist|rash|bleeding|infection|allerg|pain|diagnos|swelling|burning)\w*\b/,
    /ডাক্তার|চর্মরোগ|অ্যালার্জি|ব্যথা|র‍্যাশ/,
  ])) {
    return "I can't diagnose or treat medical conditions. For persistent symptoms, pain, infection, or an allergic reaction, please contact a qualified healthcare professional or dermatologist.";
  }

  if (matches(text, [
    /\b(skincare|skin care|routine|acne|pimple|oily|dry|sensitive|combination)\w*\b/,
    /ত্বক|ব্রণ|তৈলাক্ত|শুষ্ক/,
  ])) {
    return "A simple routine is gentle cleanser, moisturizer, and daytime sunscreen. Introduce new products one at a time and stop if irritation occurs. Tell me your skin type and budget if you'd like help finding products in Zyvar's catalog.";
  }

  if (matches(text, [
    /\b(find|show|search|product|products|price|cost|buy|stock|available|recommend|under|below|within|cleanser|face ?wash|sunscreen|moisturizer|serum|makeup|beauty|perfume|gift|hair|lip balm|do you have|looking for|how much)\b/,
    /৳|\bbdt\b|\btk\b|ফেসওয়াশ|সানস্ক্রিন|পণ্য|দাম|আছে কি/,
  ])) {
    try {
      if (!getSearchQuery(searchMessage) && getPriceLimit(searchMessage) === null) {
        return "Sure, what kind of product are you looking for? You can tell me a category, product name, or budget.";
      }

      const products = await findProducts(searchMessage, productSearch);
      if (products.length) {
        return `Here are matching products from Zyvar's catalog:\n${formatProducts(products)}\n\nOpen /products to see product details.`;
      }
      return "I couldn't find a matching item in the current catalog. Try a shorter product name or a category like cleanser, sunscreen, or moisturizer, or browse /products.";
    } catch (error) {
      console.error("[zyvar-ai] product search failed:", error);
      return "I can't access the product catalog right now. Please try again shortly or contact hello.zyvar@gmail.com.";
    }
  }

  return "I'm Zyvar's code-based shopping assistant. I can answer common shop questions and look up catalog products, prices, and stock. I don't understand every open-ended question yet; try asking for a product or contact hello.zyvar@gmail.com for help.";
}

module.exports = { getChatReply, findProducts };
