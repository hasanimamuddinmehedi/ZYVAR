const categories = [
  "Skincare",
  "Perfume",
  "Watches",
  "Baby Care",
  "Fashion",
  "Imported Food",
];

export default function Categories() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
            Categories
          </p>

          <h2 className="text-4xl md:text-5xl font-black">
            Shop By Category
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((item, index) => (
            <div
              key={index}
              className="rounded-[32px] border border-white/10 bg-white/5 p-10 hover:border-[#D4AF37] transition hover:-translate-y-2"
            >
              <h3 className="text-3xl font-black mb-4">
                {item}
              </h3>

              <p className="text-gray-400">
                Explore premium {item.toLowerCase()} collections.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}