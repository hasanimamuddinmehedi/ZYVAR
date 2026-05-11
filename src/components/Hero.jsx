import { motion } from "framer-motion";

export default function Hero() {

  return (

    <section className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white flex items-center">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px]" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px]" />

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* LEFT CONTENT */}
        <motion.div

          initial={{
            opacity: 0,
            x: -80,
          }}

          animate={{
            opacity: 1,
            x: 0,
          }}

          transition={{
            duration: 1,
          }}
        >

          {/* TAG */}
          <motion.p

            initial={{
              opacity: 0,
              y: 20,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.2,
            }}

            className="uppercase tracking-[0.4em] text-[#D4AF37] text-sm mb-6"
          >

            Luxury Ecommerce Experience

          </motion.p>

          {/* HEADING */}
          <motion.h1

            initial={{
              opacity: 0,
              y: 40,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.4,
            }}

            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight lg:leading-[0.9] mb-8"
          >

            Discover
            <span className="block text-[#D4AF37]">
              Premium Luxury
            </span>

            Collections

          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p

            initial={{
              opacity: 0,
              y: 30,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.6,
            }}

            className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-10"
          >

            Explore premium skincare, imported perfumes,
            luxury fashion, watches, baby care and lifestyle
            essentials exclusively from ZYVAR.

          </motion.p>

          {/* BUTTONS */}
          <motion.div

            initial={{
              opacity: 0,
              y: 30,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.8,
            }}

            className="flex flex-wrap gap-5"
          >

            {/* BUTTON */}
            <button className="group relative px-9 py-5 rounded-2xl bg-[#D4AF37] text-black font-black overflow-hidden hover:scale-105 transition duration-300">

              <span className="relative z-10">
                Shop Now
              </span>

              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition duration-500" />

            </button>

            {/* BUTTON */}
            <button className="px-9 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#D4AF37] hover:text-[#D4AF37] transition duration-300">

              Explore Collections

            </button>

          </motion.div>

          {/* STATS */}
          <motion.div

            initial={{
              opacity: 0,
              y: 30,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 1,
            }}

            className="grid grid-cols-3 gap-6 mt-16"
          >

            <div>

              <h2 className="text-4xl font-black text-[#D4AF37] mb-2">
                10K+
              </h2>

              <p className="text-gray-400 uppercase text-sm tracking-widest">
                Customers
              </p>

            </div>

            <div>

              <h2 className="text-4xl font-black text-[#D4AF37] mb-2">
                500+
              </h2>

              <p className="text-gray-400 uppercase text-sm tracking-widest">
                Products
              </p>

            </div>

            <div>

              <h2 className="text-4xl font-black text-[#D4AF37] mb-2">
                24/7
              </h2>

              <p className="text-gray-400 uppercase text-sm tracking-widest">
                Support
              </p>

            </div>

          </motion.div>

        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div

          initial={{
            opacity: 0,
            x: 100,
          }}

          animate={{
            opacity: 1,
            x: 0,
          }}

          transition={{
            duration: 1,
          }}

          className="relative"
        >

          {/* MAIN IMAGE */}
          <motion.img

            animate={{
              y: [0, -20, 0],
            }}

            transition={{
              repeat: Infinity,
              duration: 6,
            }}

            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200"

            alt="Luxury"

            className="rounded-[40px] h-[700px] w-full object-cover border border-white/10 shadow-2xl"
          />

          {/* FLOATING CARD */}
          <motion.div

            animate={{
              y: [0, 20, 0],
            }}

            transition={{
              repeat: Infinity,
              duration: 5,
            }}

            className="absolute -bottom-10 -left-10 rounded-[32px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 w-72"
          >

            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-xs mb-4">

              New Arrival

            </p>

            <h3 className="text-3xl font-black mb-3">

              Premium
              Perfume

            </h3>

            <p className="text-gray-300 mb-5">

              Imported luxury fragrance collection.

            </p>

            <button className="w-full py-4 rounded-2xl bg-[#D4AF37] text-black font-black">

              Buy Now

            </button>

          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}