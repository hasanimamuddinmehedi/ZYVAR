import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { useCart } from "../context/CartContext";

import { useWishlist } from "../context/WishlistContext";

import { useNavigate, Link } from "react-router-dom";

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

// SWAP INTERVAL ms
const SWAP_INTERVAL = 3500;

export default function FeaturedProducts() {

  const [sortedProducts, setSortedProducts] =
    useState([]);

  // EACH SLOT HOLDS ONE PRODUCT
  const [slots, setSlots] =
    useState([]);

  // WHICH SLOT IS ANIMATING OUT
  const [exitingSlot, setExitingSlot] =
    useState(null);

  // NEXT PRODUCT INDEX IN THE SORTED LIST
  const nextRef =
    useState({ current: SLOTS })[0];

  const [loading, setLoading] =
    useState(true);

  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const navigate = useNavigate();

  const isLoggedIn =
    localStorage.getItem("zyvar-user") === "true";

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const snapshot =
        await getDocs(collection(db, "products"));

      const list =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      // SORT BY TRENDING SCORE
      const sorted = [...list].sort(
        (a, b) => scoreFeatured(b) - scoreFeatured(a)
      );

      setSortedProducts(sorted);

      // FILL INITIAL 6 SLOTS
      setSlots(sorted.slice(0, SLOTS));

      // NEXT POINTER STARTS AT INDEX 6
      nextRef.current = SLOTS % sorted.length;

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // AUTO SWAP — cycle ALL products through the 6 slots
  useEffect(() => {

    if (sortedProducts.length <= SLOTS) return;

    const interval = setInterval(() => {

      // PICK A RANDOM SLOT TO REPLACE
      const slotToReplace =
        Math.floor(Math.random() * SLOTS);

      // GET THE NEXT PRODUCT FROM THE FULL LIST
      const nextProduct =
        sortedProducts[nextRef.current];

      // ADVANCE POINTER — wraps around entire list
      nextRef.current =
        (nextRef.current + 1) % sortedProducts.length;

      // MARK SLOT AS EXITING
      setExitingSlot(slotToReplace);

      // AFTER EXIT ANIMATION COMPLETES — SWAP IN NEW PRODUCT
      setTimeout(() => {

        setSlots((prev) => {

          const next = [...prev];

          next[slotToReplace] = nextProduct;

          return next;
        });

        setExitingSlot(null);

      }, 500);

    }, SWAP_INTERVAL);

    return () => clearInterval(interval);

  }, [sortedProducts]);

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

    <section className="py-24 px-6 lg:px-10 bg-[#0B0B0B] text-white relative overflow-hidden">

      {/* GLOW — matches hero */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C6922B]/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C6922B]/10 rounded-full blur-[140px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER — hero-style staggered entrance */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16"
        >

          <div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="uppercase tracking-[0.4em] text-[#C6922B] text-sm mb-4"
            >
              Trending Products
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
            >
              Featured
              <span className="block text-[#C6922B]">
                Luxury Products
              </span>
            </motion.h2>

          </div>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate("/products")}
            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition"
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

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center">
            <h3 className="text-4xl font-black mb-5">No Products Found</h3>
            <p className="text-gray-400">Upload products from admin dashboard.</p>
          </div>

        ) : (

          // FIXED 6-SLOT GRID — never collapses
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">

            {slots.map((product, slotIdx) => {

              if (!product) return null;

              const isExiting = exitingSlot === slotIdx;

              return (

                <AnimatePresence mode="wait" key={`slot-${slotIdx}`}>

                  <motion.div

                    // KEY CHANGES ON PRODUCT SWAP — triggers exit+enter animation
                    key={`${slotIdx}-${product.id}`}

                    // HERO-STYLE — matches model swap animation
                    initial={{
                      opacity: 0,
                      scale: 0.82,
                      y: 40,
                      rotate: -4,
                    }}

                    animate={{
                      opacity: isExiting ? 0.75 : 1,
                      scale: isExiting ? 0.92 : 1,
                      y: isExiting ? -10 : 0,
                      rotate: 0,
                    }}

                    exit={{
                      opacity: 0,
                      scale: 0.82,
                      y: -40,
                      rotate: 4,
                    }}

                    whileHover={{
                      y: -12,
                      scale: 1.02,
                    }}

                    transition={{
                      duration: 0.8,
                      ease: "easeInOut",
                    }}

                    className="
                      group
                      rounded-[32px]
                      overflow-hidden
                      border border-white/10
                      bg-white/5
                      backdrop-blur-xl
                      hover:border-[#C6922B]
                      hover:shadow-[0_0_40px_rgba(198,146,43,0.15)]
                      transition-colors
                      duration-300
                      cursor-pointer
                    "
                  >

                    {/* IMAGE */}
                    <div
                      className="relative overflow-hidden"
                      onClick={() =>
                        navigate(
                          `/product/${product.slug || toSlug(product.name)}`
                        )
                      }
                    >

                      <motion.img
                        src={
                          product.images?.[0] ||
                          product.image
                        }
                        alt={product.name}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="h-64 w-full object-cover"
                      />

                      {/* CATEGORY BADGE */}
                      <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#C6922B] text-black text-xs font-bold uppercase tracking-widest">
                        {product.category}
                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="p-7">

                      <h3
                        onClick={() =>
                          navigate(
                            `/product/${product.slug || toSlug(product.name)}`
                          )
                        }
                        className="text-xl font-black mb-3 hover:text-[#C6922B] transition cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      {/* PARTNER / UPLOADER LINK */}
                      {product.partnerSlug && (

                        <Link
                          to={`/${product.partnerSlug}`}
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

                      <p className="text-gray-400 mb-5 line-clamp-2 text-sm">
                        {product.description || "Premium imported luxury collection."}
                      </p>

                      {/* PRICE */}
                      <div className="flex justify-between items-center mb-5">

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
                          onClick={() => handleBuyNow(product)}
                          className="w-full py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:opacity-90 transition duration-300 flex items-center justify-center gap-3"
                        >
                          <Zap size={18} />
                          Buy Now
                        </motion.button>

                        {/* CART + WISHLIST */}
                        <div className="flex gap-3">

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
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
                            onClick={() => {
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