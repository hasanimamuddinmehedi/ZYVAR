export default function BrandBanner() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-24">
      <div className="max-w-7xl mx-auto rounded-[50px] border border-white/10 bg-gradient-to-r from-[#1A1A1A] to-[#0B0B0B] p-12 lg:p-20 text-center">
        <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-6">
          ZYVAR Premium
        </p>

        <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
          Luxury Meets
          <span className="block text-[#D4AF37]">
            Modern Lifestyle
          </span>
        </h2>

        <button className="px-8 py-5 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-105 transition">
          Explore Now
        </button>
      </div>
    </section>
  );
}