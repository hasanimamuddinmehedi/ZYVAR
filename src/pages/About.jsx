import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {

  return (

    <div className="bg-[#0B0B0B] text-white min-h-screen">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-10">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">
              About ZYVAR
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-8">

              Original Cosmetics
              <span className="block text-[#C6922B]">
                Family Essentials
              </span>

              Imported Treats

            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">

              ZYVAR is a premium lifestyle ecommerce brand focused on
              authentic cosmetics, imported products, fashion accessories,
              skincare, perfumes, family essentials and luxury collections.

            </p>

            <p className="text-gray-400 leading-relaxed">

              We are committed to bringing trusted original products,
              premium customer experience and luxury-inspired shopping
              to modern customers in Bangladesh.

            </p>

          </div>

          {/* RIGHT */}
          <motion.div

  initial={{
    opacity: 0,
    x: 100,
  }}

  whileInView={{
    opacity: 1,
    x: 0,
  }}

  transition={{
    duration: 1,
  }}

  viewport={{
    once: true,
  }}

  className="relative"
>

  {/* GOLD GLOW */}
  <motion.div

    animate={{
      scale: [1, 1.1, 1],
    }}

    transition={{
      repeat: Infinity,
      duration: 6,
    }}

    className="absolute inset-0 bg-[#C6922B]/10 blur-[120px] rounded-full"
  />

  {/* IMAGE */}
  <motion.img

    animate={{
      y: [0, -15, 0],
    }}

    transition={{
      repeat: Infinity,
      duration: 5,
    }}

    whileHover={{
      scale: 1.03,
    }}

    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"

    alt="ZYVAR"

    className="relative rounded-[40px] border border-white/10 shadow-2xl"
  />

</motion.div>

        </div>

      </section>

      {/* STATS */}
      <section className="px-6 lg:px-10 pb-24">

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center">

            <h2 className="text-5xl font-extrabold text-[#C6922B] mb-4">
              500+
            </h2>

            <p className="uppercase tracking-widest text-gray-400">
              Premium Products
            </p>

          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center">

            <h2 className="text-5xl font-extrabold text-[#C6922B] mb-4">
              10K+
            </h2>

            <p className="uppercase tracking-widest text-gray-400">
              Customers
            </p>

          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center">

            <h2 className="text-5xl font-extrabold text-[#C6922B] mb-4">
              24/7
            </h2>

            <p className="uppercase tracking-widest text-gray-400">
              Support
            </p>

          </div>

        </div>

      </section>

      <Footer />

    </div>
  );
}