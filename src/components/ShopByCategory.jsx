import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const MotionLink = motion.create(Link);

const CATEGORY_IMAGES = {
  skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=85&w=1400&auto=format&fit=crop",
  face: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=85&w=1400&auto=format&fit=crop",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=85&w=1400&auto=format&fit=crop",
  fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=85&w=1400&auto=format&fit=crop",
  watch: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=85&w=1400&auto=format&fit=crop",
  fashion: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=85&w=1400&auto=format&fit=crop",
  makeup: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=85&w=1400&auto=format&fit=crop",
  "beauty tools": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=85&w=1400&auto=format&fit=crop",
  body: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=85&w=1400&auto=format&fit=crop",
  haircare: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=85&w=1400&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=85&w=1400&auto=format&fit=crop",
  bags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1400&auto=format&fit=crop",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=85&w=1400&auto=format&fit=crop",
  chocolate: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=85&w=1400&auto=format&fit=crop",
  juice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=85&w=1400&auto=format&fit=crop",
  honey: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=85&w=1400&auto=format&fit=crop",
  dates: "https://images.unsplash.com/photo-1604495772376-9657f0035eb5?q=85&w=1400&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=85&w=1400&auto=format&fit=crop",
  baby: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=85&w=1400&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=85&w=1400&auto=format&fit=crop",
};

const FEATURED_CATEGORIES = [
  "Skincare",
  "Perfume",
  "Watches",
  "Fashion",
  "Makeup",
  "Beauty Tools",
  "Haircare",
  "Bodycare",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=85&w=1400&auto=format&fit=crop";

const FOOD_SPECIALTY_IMAGES = [
  { src: CATEGORY_IMAGES.chocolate, alt: "Chocolate treats" },
  { src: CATEGORY_IMAGES.juice, alt: "Fresh juice" },
  { src: CATEGORY_IMAGES.honey, alt: "Honey" },
  { src: CATEGORY_IMAGES.dates, alt: "Dates" },
];

function isFoodCategory(category) {
  return /\b(food|grocery|snack|treat|sweet)\b/i.test(category);
}

function getCategoryImage(category) {
  const normalized = category.trim().toLowerCase();
  if (/\b(chocolate|cocoa|cacao)\b/.test(normalized)) return CATEGORY_IMAGES.chocolate;
  if (/\b(juice|drink|beverage)\b/.test(normalized)) return CATEGORY_IMAGES.juice;
  if (/\bhoney\b/.test(normalized)) return CATEGORY_IMAGES.honey;
  if (/\bdates?\b/.test(normalized)) return CATEGORY_IMAGES.dates;
  const key = Object.keys(CATEGORY_IMAGES).find(
    (name) => normalized === name || normalized.includes(name),
  );
  if (key) return CATEGORY_IMAGES[key];

  if (/\b(baby|kids|child|infant)\b/.test(normalized)) return CATEGORY_IMAGES.baby;
  if (/\b(home|kitchen|living|decor)\b/.test(normalized)) return CATEGORY_IMAGES.home;
  if (/\b(supplement|snack|grocery|drink|food|treat|sweet)\b/.test(normalized)) return CATEGORY_IMAGES.food;
  if (/\b(bag|purse|wallet)\b/.test(normalized)) return CATEGORY_IMAGES.bags;
  if (/\b(shoe|footwear|sandal)\b/.test(normalized)) return CATEGORY_IMAGES.shoes;
  if (/\b(jewel|accessor|sunglass)\b/.test(normalized)) return CATEGORY_IMAGES.accessories;
  return FALLBACK_IMAGE;
}

export default function ShopByCategory({ products = [], loading = false }) {
  const [showAll, setShowAll] = useState(false);
  const reduceMotion = useReducedMotion();
  const categoryMap = new Map();

  FEATURED_CATEGORIES.forEach((category) => {
    categoryMap.set(category.toLowerCase(), { name: category });
  });
  products.forEach((product) => {
    const name = product.category?.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!categoryMap.has(key)) categoryMap.set(key, { name });
  });
  const categories = [...categoryMap.values()];
  const visibleCategories = showAll ? categories : categories.slice(0, 8);
  const hasMoreCategories = categories.length > 8;

  return (
    <section
      className="shop-categories relative overflow-hidden px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12"
      aria-labelledby="shop-categories-heading"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#C6922B]/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mb-12 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D2A94F]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Shop By Category
            </p>
            <h2 id="shop-categories-heading" className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Explore Our
              <span className="block text-[#C6922B]">Luxury Collections</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="glass-surface inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:border-[#C6922B]/60 hover:text-[#E4C277]"
          >
            View all products
          </Link>
        </motion.header>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Loading product categories">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5 sm:h-80" />
            ))}
          </div>
        ) : categories.length ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              <AnimatePresence initial={false}>
                {visibleCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.18 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.65,
                      delay: Math.min(index % 8, 7) * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <MotionLink
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="shop-category-card glass-surface group relative flex min-h-64 items-end overflow-hidden rounded-3xl text-white sm:min-h-80"
                      aria-label={`Explore ${category.name} products`}
                      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    >
                      {isFoodCategory(category.name) ? (
                        <span className="shop-category-card__food-grid" aria-label="Chocolate, juice, honey, and dates">
                          {FOOD_SPECIALTY_IMAGES.map((image) => (
                            <img
                              key={image.alt}
                              src={image.src}
                              alt=""
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />
                          ))}
                        </span>
                      ) : (
                        <img
                          src={getCategoryImage(category.name)}
                          alt={`${category.name} collection`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="shop-category-card__image absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      )}
                      <span className="shop-category-card__overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <span className="shop-category-card__glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C6922B]/20 blur-3xl" />
                      <span className="relative z-10 flex w-full items-end justify-between gap-2 p-4 sm:p-6">
                        <span className="min-w-0">
                          <span className="shop-category-card__eyebrow block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E4C277]">
                            Curated collection
                          </span>
                          <span className="shop-category-card__title mt-1 block truncate text-lg font-semibold sm:text-2xl">
                            {category.name}
                          </span>
                        </span>
                      </span>
                    </MotionLink>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {hasMoreCategories && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((previous) => !previous)}
                  aria-expanded={showAll}
                  className="glass-surface inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:border-[#C6922B]/60 hover:text-[#E4C277]"
                >
                  {showAll ? "Show fewer categories" : "See more categories"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white">
            <p className="text-lg font-medium">New collections are on their way.</p>
            <Link to="/products" className="mt-4 inline-flex text-sm font-semibold text-[#E4C277] underline underline-offset-4">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
