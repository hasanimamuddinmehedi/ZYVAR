import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import SkinAnalyzer from "./SkinAnalyzer";

export default function BeautyGuidance() {
  const philosophyRef = useRef(null);
  const philosophyInView = useInView(philosophyRef, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SkinAnalyzer />

      <section
        id="brand-story"
        className="brand-philosophy relative flex min-h-[520px] items-center justify-center overflow-hidden px-6 pt-12 pb-24 text-center text-white sm:px-10 lg:min-h-[620px]"
        aria-labelledby="brand-story-heading"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <span className="glass-surface absolute left-[12%] top-[25%] animate-[zyvar-soft-float_6s_ease-in-out_infinite] rounded-full border border-[#C6922B]/25 px-4 py-2 text-xs text-[#e2c277]">
            ✦ Thoughtful
          </span>
          <span className="glass-surface absolute right-[12%] top-[31%] animate-[zyvar-soft-float_7s_ease-in-out_infinite] rounded-full border border-[#C6922B]/25 px-4 py-2 text-xs text-[#e2c277] [animation-delay:1s]">
            ✦ Original
          </span>
          <span className="glass-surface absolute bottom-[24%] left-[20%] animate-[zyvar-soft-float_8s_ease-in-out_infinite] rounded-full border border-[#C6922B]/25 px-4 py-2 text-xs text-[#e2c277] [animation-delay:2s]">
            ✦ Everyday
          </span>
          <span className="glass-surface absolute bottom-[21%] right-[19%] animate-[zyvar-soft-float_7s_ease-in-out_infinite] rounded-full border border-[#C6922B]/25 px-4 py-2 text-xs text-[#e2c277] [animation-delay:0.5s]">
            ✦ For you
          </span>
        </div>
        <motion.div
          ref={philosophyRef}
          className="relative z-10 max-w-4xl"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0.25,
                  y: 20,
                  filter: "blur(12px) drop-shadow(0 0 22px rgba(210, 169, 79, 0.55))",
                }
          }
          animate={
            reduceMotion || philosophyInView
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px) drop-shadow(0 0 0 rgba(210, 169, 79, 0))",
                }
              : undefined
          }
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: "easeOut" }}
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#d2a94f]">
            The Zyvar philosophy
          </p>
          <h2
            id="brand-story-heading"
            className="text-3xl font-light leading-relaxed tracking-tight text-[#d2cec5] sm:text-4xl lg:text-5xl"
          >
            Original finds, useful guidance, and a more considered way to
            discover the things you use every day.
          </h2>
        </motion.div>
      </section>
    </>
  );
}
