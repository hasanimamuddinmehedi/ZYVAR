import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { useCart } from "../context/CartContext";

import { useWishlist } from "../context/WishlistContext";

import { useNavigate, Link } from "react-router-dom";
import productImage from "../utils/productImage";

import {
  successAlert,
} from "../utils/alerts";

import {
  Zap,
  Heart,
} from "lucide-react";

// SLUG UTILITY
const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// TRENDING KEYWORDS — most searched in Bangladesh
const TRENDING_KEYWORDS = [
  "vitamin c", "niacinamide", "retinol", "sunscreen", "spf",
  "serum", "moisturizer", "hyaluronic", "collagen", "brightening",
  "whitening", "glow", "anti aging", "face wash", "toner", "essence",
  "lipstick", "lip gloss", "foundation", "concealer", "blush",
  "highlighter", "contour", "mascara", "eyeliner", "eyeshadow",
  "setting spray", "primer", "bb cream", "cushion",
  "perfume", "fragrance", "eau de parfum", "oud", "arabic",
  "club de nuit", "armaf", "lattafa", "rasasi", "body spray", "deodorant",
  "hair oil", "hair serum", "keratin", "argan", "shampoo",
  "conditioner", "hair mask", "hair growth", "scalp",
  "imported", "luxury", "premium", "original", "authentic",
  "korea", "korean", "japan", "japanese", "french", "swiss",
  "watch", "luxury watch", "smart watch",
  "body lotion", "body butter", "body scrub", "bath",
];

const CATEGORY_SCORES = {
  perfume: 40,
  fragrance: 40,
  skincare: 35,
  makeup: 35,
  watch: 30,
  beauty: 28,
  haircare: 25,
  bodycare: 22,
  fashion: 18,
  babycare: 12,
  food: 10,
};

const scoreFeatured = (product) => {
  let score = 0;
  const name = (product.name || "").toLowerCase();
  const description = (product.description || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const searchText = name + " " + description;
  TRENDING_KEYWORDS.forEach((kw) => {
    if (searchText.includes(kw)) score += 15;
  });
  score += CATEGORY_SCORES[category] || 5;
  TRENDING_KEYWORDS.forEach((kw) => {
    if (name.includes(kw)) score += 10;
  });
  return score;
};

// FIXED SLOTS
const SLOTS = 6;

// Keep each collection on screen long enough to explore.
const SWAP_INTERVAL = 10000;

export default function FeaturedProducts({ products = [], loading = false }) {

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => scoreFeatured(b) - scoreFeatured(a)),
    [products],
  );

  const [startIndex, setStartIndex] = useState(0);
  const [pinnedSlots, setPinnedSlots] = useState({});

  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const isLoggedIn =
    localStorage.getItem("zyvar-user") === "true";

  // Advance the product strip one item at a time so the collection keeps moving.
  useEffect(() => {
    if (sortedProducts.length <= SLOTS || reduceMotion) return;

    const interval = setInterval(() => {
      setStartIndex((index) => (index + 1) % sortedProducts.length);
    }, SWAP_INTERVAL);

    return () => clearInterval(interval);

  }, [reduceMotion, sortedProducts.length]);

  const slots = sortedProducts.length
    ? Array.from(
        { length: Math.min(SLOTS, sortedProducts.length) },
        (_, index) => sortedProducts[(startIndex + index) % sortedProducts.length],
      )
    : [];
  const reservedProductIds = new Set(
    Object.values(pinnedSlots).map((product) => product.id),
  );
  const occupiedProductIds = new Set(reservedProductIds);
  const displayedSlots = slots.map((product, slotIdx) => {
    if (pinnedSlots[slotIdx]) return pinnedSlots[slotIdx];

    const nextProduct = sortedProducts
      .slice((startIndex + slotIdx) % sortedProducts.length)
      .concat(sortedProducts.slice(0, (startIndex + slotIdx) % sortedProducts.length))
      .find((candidate) => !occupiedProductIds.has(candidate.id));
    const selectedProduct = nextProduct || product;
    occupiedProductIds.add(selectedProduct.id);
    return selectedProduct;
  });

  // BUY NOW
  const handleBuyNow = (product) => {

    if (!isLoggedIn) {

      navigate("/login");

      return;
    }

    addToCart(product);

    navigate("/payment");
  };

  return (

    <section className="featured-products-section relative overflow-hidden bg-[#0B0B0B] px-5 py-20 text-white sm:px-6 sm:py-24 lg:px-10">

      {/* GLOW — matches hero */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C6922B]/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C6922B]/10 rounded-full blur-[140px]" />
      <div className="featured-products-orbit featured-products-orbit--one" aria-hidden="true" />
      <div className="featured-products-orbit featured-products-orbit--two" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER — hero-style staggered entrance */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="featured-products-header mb-12 flex flex-col items-start justify-between gap-7 sm:mb-16 lg:flex-row lg:items-end"
        >

          <div>

            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#D6B66F] sm:text-sm">
              <span className="h-px w-8 bg-[#C6922B]" />
              Trending Products
            </p>

            <h2 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-7xl">
              Featured
              <span className="featured-products-heading-accent block">
                The Zyvar Edit
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Thoughtfully selected finds, chosen to make everyday feel extraordinary.
            </p>

          </div>

          <motion.button
            whileHover={reduceMotion ? undefined : { y: -3 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => navigate("/products")}
            className="glass-surface min-h-12 rounded-full px-6 text-sm font-semibold text-white transition hover:border-[#C6922B]/60 hover:text-[#E4C277] sm:px-7"
          >
            View All Products
          </motion.button>

        </motion.div>

        {/* LOADING */}
        {loading ? (

          <div className="flex items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />
          </div>

        ) : sortedProducts.length === 0 ? (

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center text-white backdrop-blur-xl sm:p-16">
            <h3 className="mb-5 text-3xl font-bold sm:text-4xl">Our next favorites are on their way.</h3>
            <p className="text-gray-300">Explore the full Zyvar collection while we curate more products.</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 rounded-full border border-[#C6922B]/45 bg-[#C6922B]/10 px-6 py-3 font-semibold text-[#E4C277] transition hover:bg-[#C6922B]/20"
            >
              Browse products
            </button>
          </div>

        ) : (

          // FIXED 6-SLOT GRID — never collapses
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-7">

            {displayedSlots.map((product, slotIdx) => {
              if (!product) return null;

              return (

                <AnimatePresence mode="wait" key={`slot-${slotIdx}`}>

                  <motion.div

                    // KEY CHANGES ON PRODUCT SWAP — triggers exit+enter animation
                    key={`${slotIdx}-${product.id}`}

                    initial={{
                      opacity: 0,
                      y: 48,
                      rotateX: 9,
                      scale: 0.96,
                    }}

                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}

                    exit={{
                      opacity: 0,
                      y: -24,
                      rotateX: -6,
                      scale: 0.97,
                    }}

                    whileHover={reduceMotion ? undefined : { y: -10, scale: 1.015, rotateX: 0 }}
                    onPointerEnter={() => {
                      setPinnedSlots((current) => (
                        current[slotIdx]
                          ? current
                          : { ...current, [slotIdx]: product }
                      ));
                    }}
                    onPointerLeave={() => {
                      setPinnedSlots((current) => {
                        if (!current[slotIdx]) return current;
                        const next = { ...current };
                        delete next[slotIdx];
                        return next;
                      });
                    }}
                    onClick={() => navigate(`/product/${product.slug || toSlug(product.name)}`)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/product/${product.slug || toSlug(product.name)}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                    aria-label={`View ${product.name} details`}

                    transition={{
                      duration: reduceMotion ? 0 : 1.05,
                      delay: reduceMotion ? 0 : slotIdx * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}

                    style={{ transformPerspective: 1200 }}
                    className="
                      featured-product-card group relative cursor-pointer overflow-hidden rounded-[30px]
                    "
                  >

                    {/* IMAGE */}
                    <div className="featured-product-card__image relative overflow-hidden">

                      <motion.img
                        src={productImage(product) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop"}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop";
                        }}
                        whileHover={reduceMotion ? undefined : { scale: 1.07 }}
                        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-80 w-full object-cover sm:h-[22rem]"
                      />

                      <div className="featured-product-card__image-shade absolute inset-0" />
                      <div className="featured-product-card__image-glow absolute inset-0" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md sm:left-5 sm:top-5">
                        {pinnedSlots[slotIdx] ? "Held for you" : "Zyvar selection"}
                      </div>
                      <div className="absolute right-4 top-4 rounded-full bg-[#C6922B] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-black sm:right-5 sm:top-5">
                        {product.category}
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:bottom-5 sm:left-5">
                        <span className="h-px w-6 bg-[#E4C277]" />
                        Featured {String(slotIdx + 1).padStart(2, "0")}
                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="featured-product-card__content p-5 sm:p-6">

                      <h3
                        className="mb-3 line-clamp-1 text-xl font-bold tracking-tight text-white transition group-hover:text-[#F0D18A] sm:text-2xl"
                      >
                        {product.name}
                      </h3>

                      {/* PARTNER / UPLOADER LINK */}
                      {product.partnerSlug && (

                        <Link
                          to={`/${product.partnerSlug}`}
                          onClick={(event) => event.stopPropagation()}
                          className="
                            inline-block
                            text-sm
                            text-[#C6922B]
                            hover:underline
                            mb-3
                          "
                        >
                          Products From{" "}
                          {product.uploadedBy}
                        </Link>
                      )}

                      <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
                        {product.description || "Premium imported luxury collection."}
                      </p>

                      {/* PRICE */}
                      <div className="mb-5 flex items-end justify-between border-t border-white/10 pt-4">

                        <div>
                          <p className="text-gray-400 text-xs mb-1">Price</p>
                          <h4 className="text-2xl font-black text-[#C6922B]">
                            ৳{product.price}
                          </h4>
                        </div>

                        <div className="text-right">
                          <p className="text-gray-400 text-xs mb-1">Stock</p>
                          <h4 className="text-lg font-bold">{product.stock}</h4>
                        </div>

                      </div>

                      {/* BUTTONS */}
                      <div className="space-y-3">

                        {/* BUY NOW */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleBuyNow(product);
                          }}
                          className="featured-product-card__buy w-full rounded-2xl py-4 font-bold text-black transition duration-300"
                        >
                          <span className="flex items-center justify-center gap-3">
                            <Zap size={18} />
                            Buy Now
                          </span>
                        </motion.button>

                        {/* CART + WISHLIST */}
                        <div className="flex gap-3">

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              addToCart(product);
                              successAlert(
                                "Added To Cart!",
                                `${product.name} has been added to your cart.`
                              );
                            }}
                            className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition duration-300 text-sm font-bold"
                          >
                            Add To Cart
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isInWishlist(product.id)) {
                                removeFromWishlist(product.id);
                              } else {
                                addToWishlist(product);
                              }
                            }}
                            className={`w-14 rounded-2xl border transition duration-300 flex items-center justify-center
                            ${
                              isInWishlist(product.id)
                                ? "bg-red-500 border-red-500 text-white"
                                : "border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
                            }`}
                          >
                            <Heart size={20} />
                          </motion.button>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                </AnimatePresence>
              );
            })}

          </div>

        )}

      </div>

    </section>
  );
}