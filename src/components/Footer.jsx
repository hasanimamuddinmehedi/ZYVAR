export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-[0.3em] text-[#D4AF37] mb-3">
            ZYVAR
          </h1>

          <p className="text-gray-500">
            Premium Ecommerce Experience.
          </p>
        </div>

        <div className="flex gap-6 text-gray-400">
          <button className="hover:text-[#D4AF37] transition">
            Facebook
          </button>

          <button className="hover:text-[#D4AF37] transition">
            Instagram
          </button>

          <button className="hover:text-[#D4AF37] transition">
            TikTok
          </button>
        </div>
      </div>
    </footer>
  );
}