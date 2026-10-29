import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    name: "face",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203023_87a26602-2898-4acc-a396-c7a2b5ad84fd.mp4",
  },
  {
    name: "beauty tools",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203415_b86e3f19-2aec-46cd-9a86-b64c40118e38.mp4",
  },
  {
    name: "body",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203051_85fee398-ea01-4aa0-972b-137a74213be5.mp4",
  },
  {
    name: "skincare",
    video: "https://assets.mixkit.co/videos/50426/50426-360.mp4",
  },
  {
    name: "haircare",
    video: "https://assets.mixkit.co/videos/33257/33257-360.mp4",
  },
  {
    name: "fragrance",
    video: "https://assets.mixkit.co/videos/20766/20766-360.mp4",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function Categories() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section
      id="categories"
      className="everyday-favorites flex min-h-screen w-full flex-col justify-center overflow-hidden text-white"
      aria-labelledby="everyday-favorites-heading"
    >
      <header className="px-6 pb-10 pt-16 text-center text-white sm:pb-14 md:pt-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#D2A94F]">
          Explore the Zyvar edit
        </p>
        <h2
          id="everyday-favorites-heading"
          className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Find your everyday favorites
        </h2>
      </header>

      <div
        ref={ref}
        className={`grid grid-cols-1 transition-all duration-1000 ease-out md:grid-cols-2 xl:grid-cols-3 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {CATEGORIES.map((category, index) => (
          <article
            key={category.name}
            className={`everyday-video-card ${category.name === "fragrance" ? "everyday-video-card--fragrance" : ""} group relative flex min-h-[420px] flex-col items-start justify-between overflow-hidden border border-white/10 bg-[#111]/30 p-6 transition-all duration-1000 ease-out sm:min-h-[540px] sm:p-8 xl:min-h-[680px] xl:p-10 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <video
              className="everyday-video-card__media absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              src={category.video}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <div className="everyday-video-card__overlay absolute inset-0" />
            <h3
              className="everyday-video-card__name relative z-10 origin-center text-5xl font-medium text-white transition-transform duration-500 sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
            >
              {category.name}
            </h3>
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="btn-primary relative z-10 mt-auto inline-flex rounded-full border border-white/25 bg-white/90 px-8 py-3 text-sm font-semibold lowercase text-black backdrop-blur-md transition hover:bg-white"
              aria-label={`Shop ${category.name} products`}
            >
              shop {category.name}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
