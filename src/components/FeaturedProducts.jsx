const products = [
  {
    name: "CeraVe Cleanser",
    price: 1850,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
  },
  {
    name: "Luxury Perfume",
    price: 4200,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601",
  },
  {
    name: "Premium Watch",
    price: 8500,
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  },
  {
    name: "Baby Lotion",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-14">
          <div>
            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
              Featured
            </p>

            <h2 className="text-4xl md:text-5xl font-black">
              Trending Products
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="group rounded-[32px] overflow-hidden border border-white/10 bg-white/5 hover:border-[#D4AF37] transition"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <h4 className="text-3xl font-black text-[#D4AF37]">
                    ৳{product.price}
                  </h4>

                  <button className="px-5 py-3 rounded-2xl bg-[#D4AF37] text-black font-bold">
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}