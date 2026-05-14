import { motion }
from "framer-motion";

export default function ProductCollage() {

  return (

    <section className="relative py-24 overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Heading */}
        <motion.div

          initial={{
            opacity: 0,
            y: 40,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.8,
          }}

          viewport={{
            once: true,
          }}

          className="text-center mb-20"
        >

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">

            Luxury Lifestyle

          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">

            Premium Collections
            <span className="block text-[#D4AF37]">

              Curated For You

            </span>

          </h2>

        </motion.div>

        {/* Collage */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Background Glow */}
          <div className="absolute w-[550px] h-[550px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />

          {/* Grid */}
          <motion.div

            initial={{
              opacity: 0,
              scale: 0.9,
            }}

            whileInView={{
              opacity: 1,
              scale: 1,
            }}

            transition={{
              duration: 1,
            }}

            viewport={{
              once: true,
            }}

            className="
              relative
              grid
              grid-cols-2
              gap-6
              max-w-2xl
            "
          >

            {/* LEFT */}
            <div className="space-y-6 mt-10">

              {/* Beauty */}
              <motion.div

                whileHover={{
                  y: -10,
                }}

                className="
                  overflow-hidden
                  rounded-[32px]
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  shadow-2xl
                  transition
                  duration-500
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                  alt="beauty"

                  className="
                    h-80
                    w-full
                    object-cover
                    hover:scale-110
                    transition
                    duration-700
                  "
                />
              </motion.div>

              {/* Watch */}
              <motion.div

                whileHover={{
                  y: -10,
                }}

                className="
                  overflow-hidden
                  rounded-[32px]
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  shadow-2xl
                  transition
                  duration-500
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=1200&auto=format&fit=crop"
                  alt="watch"

                  className="
                    h-48
                    w-full
                    object-cover
                    hover:scale-110
                    transition
                    duration-700
                  "
                />
              </motion.div>

            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {/* Perfume */}
              <motion.div

                whileHover={{
                  y: -10,
                }}

                className="
                  overflow-hidden
                  rounded-[32px]
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  shadow-2xl
                  transition
                  duration-500
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1200&auto=format&fit=crop"
                  alt="perfume"

                  className="
                    h-48
                    w-full
                    object-cover
                    hover:scale-110
                    transition
                    duration-700
                  "
                />
              </motion.div>

              {/* Bags */}
              <motion.div

                whileHover={{
                  y: -10,
                }}

                className="
                  overflow-hidden
                  rounded-[32px]
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  shadow-2xl
                  transition
                  duration-500
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                  alt="bags"

                  className="
                    h-80
                    w-full
                    object-cover
                    hover:scale-110
                    transition
                    duration-700
                  "
                />
              </motion.div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}