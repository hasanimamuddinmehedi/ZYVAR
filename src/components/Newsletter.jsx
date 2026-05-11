export default function Newsletter() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">
          Newsletter
        </p>

        <h2 className="text-4xl md:text-6xl font-black mb-8">
          Stay Updated
        </h2>

        <p className="text-gray-400 text-lg mb-10">
          Get updates about premium arrivals, offers and exclusive collections.
        </p>

        <div className="flex flex-col md:flex-row gap-5">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
          />

          <button className="px-8 py-5 rounded-2xl bg-[#D4AF37] text-black font-black">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}