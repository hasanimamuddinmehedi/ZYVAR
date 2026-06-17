import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BecomePartnerCTA() {
  const stats = [
    { value: "0%", label: "Setup Complexity" },
    { value: "24/7", label: "Store Visibility" },
    { value: "∞", label: "Products Allowed" },
    { value: "Custom", label: "Store URL" },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="
            relative overflow-hidden
            rounded-3xl lg:rounded-[32px]
            border border-white/10
            bg-white/10
            backdrop-blur-2xl
            p-6 sm:p-8 lg:p-12
          "
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#C6922B15,transparent_40%)] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
                Partner Program
              </p>

              <h2 className="font-black leading-tight mb-4 text-3xl sm:text-4xl lg:text-6xl">
                Become a
                <span className="block text-[#C6922B]">
                  ZYVAR Partner
                </span>
              </h2>

              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Launch your own branded store, sell products to customers across
                Bangladesh and grow your business under the ZYVAR ecosystem.
              </p>

              <Link
                to="/become-partner"
                className="
                  inline-flex items-center justify-center
                  w-full sm:w-auto
                  px-8 sm:px-10
                  py-4
                  rounded-2xl
                  bg-[#C6922B]
                  text-black
                  font-black
                  hover:scale-105
                  transition-all duration-300
                "
              >
                Apply Now
              </Link>
            </div>

            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="
                    rounded-2xl lg:rounded-[24px]
                    border border-white/10
                    bg-white/5
                    backdrop-blur-md
                    p-4 sm:p-5 lg:p-6
                    text-center
                  "
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#C6922B] break-words">
                    {value}
                  </h3>

                  <p className="mt-2 text-sm sm:text-base text-gray-300">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}