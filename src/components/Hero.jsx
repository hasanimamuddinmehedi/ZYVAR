import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";

const ASSET_BASE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";

const HERO_IMAGES = [
  {
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
    alt: "Female fashion model wearing an elegant neutral look",
    position: "hero-model hero-model--woman",
  },
  {
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=900&auto=format&fit=crop",
    alt: "Male fashion model in a refined modern outfit",
    position: "hero-model hero-model--man",
  },
];

const CAROUSEL_IMAGES = [
  { src: `${ASSET_BASE}hf_20260912_110422_0fc34393-7417-41b0-a200-43fd2b08a37f.png`, alt: "Zyvar beauty and lifestyle campaign" },
  { src: `${ASSET_BASE}hf_20260912_110423_ba46182e-43bc-43a8-9007-a8234acf442d.png`, alt: "Zyvar beauty collection campaign" },
  { src: `${ASSET_BASE}hf_20260912_110423_06cfbb84-6f96-48f6-be45-e03516510e48.png`, alt: "Zyvar curated product collection" },
  { src: `${ASSET_BASE}hf_20260912_110422_634bf390-f171-4f5d-9151-0d2c86c26e7b.png`, alt: "Zyvar partner store campaign" },
  { src: `${ASSET_BASE}hf_20260912_110423_0cfe058d-db0e-4ee6-9708-7a297cc11a7a.png`, alt: "Zyvar shopping campaign" },
  { src: `${ASSET_BASE}hf_20260912_110422_de267714-7647-4d9a-a0a9-55325683b2a2.png`, alt: "Zyvar daily essentials campaign" },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="explore" className="zyvar-hero hero-two" aria-label="Discover Zyvar">
      <div className="hero-two__glow" aria-hidden="true" />

      <div className="hero-two__content">
        <div className="hero-two__copy">
          <p className="hero-two__eyebrow"><Sparkles size={14} /> Original cosmetics · family essentials · imported treats</p>
          <h1>
            Discover
            <span>Premium finds</span>
            for every day.
          </h1>
          <p className="hero-two__description">
            Explore original beauty, useful essentials and partner-store
            collections, thoughtfully brought together by Zyvar.
          </p>
          <div className="hero-two__actions">
            <Link className="hero-glass-button hero-glass-button--gold" to="/products">Shop now</Link>
            <Link className="hero-glass-button" to="/stores">Explore stores</Link>
          </div>
          <div className="hero-two__stats" aria-label="Zyvar highlights">
            <div><strong>10K+</strong><span>Customers</span></div>
            <div><strong>500+</strong><span>Products</span></div>
            <div><strong>24/7</strong><span>Support</span></div>
          </div>
        </div>

        <div className="hero-two__models" aria-label="Zyvar style inspiration">
          <div className="hero-two__model-glow" aria-hidden="true" />
          {HERO_IMAGES.map((model) => (
            <motion.img
              key={model.alt}
              src={model.image}
              alt={model.alt}
              className={model.position}
              fetchPriority="high"
              animate={
                reduceMotion
                  ? { x: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 10 }
                  : model.position.includes("--woman")
                  ? {
                      x: ["38%", "0%", "-38%", "0%", "38%"],
                      scale: [1, 0.92, 0.82, 0.92, 1],
                      rotate: [0, -4, 0, 4, 0],
                      zIndex: [30, 25, 5, 25, 30],
                      opacity: [1, 1, 0.85, 1, 1],
                    }
                  : {
                      x: ["-38%", "0%", "38%", "0%", "-38%"],
                      scale: [0.82, 0.92, 1, 0.92, 0.82],
                      rotate: [0, 4, 0, -4, 0],
                      zIndex: [5, 25, 30, 25, 5],
                      opacity: [0.85, 1, 1, 1, 0.85],
                    }
              }
              transition={{
                duration: 10,
                repeat: reduceMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            animate={reduceMotion ? { y: 0 } : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}
            className="hero-two__arrival glass-surface"
          >
            <span className="hero-two__arrival-label">New Arrival</span>
            <strong>Premium Perfume</strong>
            <p>Imported luxury fragrance collection.</p>
            <Link className="hero-glass-button hero-glass-button--gold" to="/products">
              Buy Now
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="hero-marquee" aria-label="Featured Zyvar collections">
        <div className="hero-marquee__track">
          {[...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES].map((item, index) => (
            <Link
              className="hero-marquee__card glass-surface"
              to="/products"
              key={`${item.src}-${index}`}
              aria-label={`Explore products: ${item.alt}`}
              tabIndex={index >= CAROUSEL_IMAGES.length ? -1 : undefined}
            >
              <img src={item.src} alt={index < CAROUSEL_IMAGES.length ? item.alt : ""} loading="lazy" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
