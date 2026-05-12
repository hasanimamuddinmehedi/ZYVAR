import { LazyLoadImage } from "react-lazy-load-image-component";
export default function ZyvarHomepage() {
  const products = [
    {
      id: 1,
      name: "CeraVe Moisturizing Cream",
      category: "Skincare",
      price: "৳2,450",
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Lattafa Yara Perfume",
      category: "Perfume",
      price: "৳3,200",
      image:
        "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Luxury Party Bag",
      category: "Fashion",
      price: "৳4,850",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Omega Seamaster",
      category: "Watch",
      price: "৳18,500",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
    },
  ];
  const categories = [
    "Skincare",
    "Makeup",
    "Perfumes",
    "Watches",
    "Bags",
    "Baby Care",
    "Imported Treats",
    "Lifestyle",
  ];

  const featuredProducts = [
    {
      name: "CeraVe Moisturizing Cream",
      category: "Skincare",
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Lattafa Yara Perfume",
      category: "Perfume",
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Luxury Party Bag",
      category: "Fashion",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Omega Seamaster",
      category: "Watch",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden font-sans">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-2xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shadow-xl shadow-yellow-500/10">
              <span className="text-[#D4AF37] text-xl font-black tracking-widest">
                Z
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-[0.35em] text-[#D4AF37] leading-none">
                ZYVAR
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mt-1">
                Luxury Lifestyle Store
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-sm uppercase tracking-[0.2em] font-medium">
            <a href="#home" className="hover:text-[#D4AF37] transition duration-300">
              Home
            </a>
            <a href="#categories" className="hover:text-[#D4AF37] transition duration-300">
              Categories
            </a>
            <a href="#products" className="hover:text-[#D4AF37] transition duration-300">
              Products
            </a>
            <a href="#about" className="hover:text-[#D4AF37] transition duration-300">
              About
            </a>
            <a href="#contact" className="hover:text-[#D4AF37] transition duration-300">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition duration-300 backdrop-blur-xl">
              Explore Store
            </button>

            <button className="lg:hidden w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative min-h-screen overflow-hidden flex items-center px-4 sm:px-6 lg:px-10 pt-28"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#121212] to-black" />

        <div className="absolute top-20 left-0 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[160px]" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 backdrop-blur-xl mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <p className="uppercase tracking-[0.25em] text-xs text-[#D4AF37]">
                Premium Collection Available
              </p>
            </div>

            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[0.95] mb-8">
              Luxury
              <span className="block text-[#D4AF37]">Lifestyle</span>
              <span className="block">Starts Here</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-10">
              Discover original cosmetics, premium skincare, luxury bags,
              watches, perfumes, baby care and imported treats curated for
              modern lifestyle lovers.
            </p>

            <div className="flex flex-wrap gap-5 mb-14">
              <button className="px-8 py-4 rounded-full bg-[#D4AF37] text-black font-bold hover:scale-105 transition duration-300 shadow-2xl shadow-yellow-500/20">
                Shop Now
              </button>

              <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition duration-300 backdrop-blur-xl">
                View Collections
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-2xl">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-3xl font-black text-[#D4AF37] mb-2">
                  100+
                </h3>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  Products
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-3xl font-black text-[#D4AF37] mb-2">
                  24/7
                </h3>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  Support
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-3xl font-black text-[#D4AF37] mb-2">
                  100%
                </h3>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  Original
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute w-[550px] h-[550px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />

            <div className="relative grid grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-6 mt-10">
                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:-translate-y-2 transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                    alt="beauty"
                    className="h-80 w-full object-cover hover:scale-110 transition duration-700"
                  />
                </div>

                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:-translate-y-2 transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=1200&auto=format&fit=crop"
                    alt="watch"
                    className="h-48 w-full object-cover hover:scale-110 transition duration-700"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:-translate-y-2 transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1200&auto=format&fit=crop"
                    alt="perfume"
                    className="h-48 w-full object-cover hover:scale-110 transition duration-700"
                  />
                </div>

                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:-translate-y-2 transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                    alt="bags"
                    className="h-80 w-full object-cover hover:scale-110 transition duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-24 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] tracking-[0.35em] uppercase text-sm mb-4">
              Categories
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Explore Our Collections
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((item, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 hover:border-[#D4AF37] transition duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center mb-5 text-[#D4AF37] text-xl font-bold">
                  0{index + 1}
                </div>

                <h3 className="text-xl font-semibold group-hover:text-[#D4AF37] transition">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[#D4AF37] tracking-[0.35em] uppercase text-sm mb-4">
                Featured Products
              </p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Trending Products
              </h2>
            </div>

            <button className="px-6 py-3 border border-white/20 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
              View All
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className="group rounded-3xl overflow-hidden bg-[#161616] border border-white/10 hover:border-[#D4AF37] transition duration-300 hover:-translate-y-3"
              >
                <div className="overflow-hidden">
                  <LazyLoadImage
                    src={product.image}
                      //effect="blur"
                    alt={product.name}
                    className="h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                  />
                </div>

                <div className="p-6">
                  <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-3">
                    {product.category}
                  </p>

                  <h3 className="text-xl font-semibold mb-5 leading-snug">
                    {product.name}
                  </h3>

                  <button className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-semibold hover:opacity-90 transition">
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-gradient-to-r from-[#1A1A1A] to-[#101010] p-12 md:p-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-3xl">
              <p className="text-[#D4AF37] uppercase tracking-[0.35em] text-sm mb-5">
                Exclusive Collection
              </p>

              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Luxury Products
                <span className="block text-[#D4AF37]">Curated For You</span>
              </h2>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Explore authentic skincare, premium fashion accessories,
                imported chocolates, perfumes, baby essentials and more — all
                in one place.
              </p>

              <button className="px-8 py-4 rounded-full bg-[#D4AF37] text-black font-semibold hover:scale-105 transition duration-300">
                Discover Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
              className="rounded-[40px] shadow-2xl border border-white/10"
              alt="about zyvar"
            />
          </div>

          <div>
            <p className="text-[#D4AF37] uppercase tracking-[0.35em] text-sm mb-5">
              About Zyvar
            </p>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              Premium Lifestyle &
              <span className="block text-[#D4AF37]">Imported Collection</span>
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Zyvar is your trusted destination for premium cosmetics,
              skincare, watches, perfumes, imported foods, baby care and
              lifestyle essentials.
            </p>

            <p className="text-gray-400 leading-relaxed mb-8">
              We focus on quality, authenticity and stylish collections that
              elevate your daily lifestyle. Whether you are looking for beauty,
              fashion, gifting or family essentials — Zyvar brings everything
              together in one luxury-inspired shopping experience.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-4xl font-black text-[#D4AF37] mb-2">
                  100+
                </h3>
                <p className="text-gray-300">Premium Products</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-4xl font-black text-[#D4AF37] mb-2">
                  24/7
                </h3>
                <p className="text-gray-300">Online Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.35em] text-sm mb-5">
            Contact Us
          </p>

          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
            Let’s Connect With
            <span className="block text-[#D4AF37]">ZYVAR</span>
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
            Looking for specific products? Just message us the product name —
            we’ll source and deliver it to your doorstep.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="text-[#D4AF37] text-xl font-semibold mb-3">
                Facebook
              </h3>
              <p className="text-gray-300">@ZyvarOfficial</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="text-[#D4AF37] text-xl font-semibold mb-3">
                Instagram
              </h3>
              <p className="text-gray-300">@zyvar.bd</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="text-[#D4AF37] text-xl font-semibold mb-3">
                Location
              </h3>
              <p className="text-gray-300">
                Chowdhury Market, Bandarban Sadar, Bandarban
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOPPING SECTION */}
      <section className="py-28 px-4 sm:px-6 lg:px-10 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
            <div>
              <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
                Ecommerce Store
              </p>

              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Shop Premium
                <span className="block text-[#D4AF37]">
                  Collections
                </span>
              </h2>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button className="px-6 py-3 rounded-full bg-[#D4AF37] text-black font-bold">
                All Products
              </button>

              <button className="px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37] transition">
                Skincare
              </button>

              <button className="px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37] transition">
                Watches
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#D4AF37] transition duration-500 hover:-translate-y-3"
              >
                <div className="relative overflow-hidden">
                  <LazyLoadImage
                    src={product.image}
                      //effect="blur"
                    alt={product.name}
                    className="h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                  />

                  <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest">
                    {product.category}
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-2xl font-bold mb-3">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[#D4AF37] text-2xl font-black">
                      {product.price}
                    </p>

                    <div className="flex items-center gap-1 text-yellow-400">
                      ★★★★★
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold hover:scale-[1.02] transition duration-300">
                      Add to Cart
                    </button>

                    <button className="w-14 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] transition">
                      ❤
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CART SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-10 bg-[#111111]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black">
                Shopping Cart
              </h2>

              <span className="text-[#D4AF37] font-semibold">
                4 Items
              </span>
            </div>

            <div className="space-y-6">
              {products.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-center gap-6 rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-2xl"
                  />

                  <div className="flex-1">
                    <p className="text-[#D4AF37] uppercase text-xs tracking-widest mb-2">
                      {item.category}
                    </p>

                    <h3 className="text-2xl font-bold mb-3">
                      {item.name}
                    </h3>

                    <p className="text-gray-400">
                      Premium original imported collection.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-[#D4AF37] mb-4">
                      {item.price}
                    </p>

                    <button className="px-5 py-3 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-400 transition">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit sticky top-28">
            <h2 className="text-3xl font-black mb-10">
              Order Summary
            </h2>

            <div className="space-y-5 mb-10 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳26,150</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>৳120</span>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-5 text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-[#D4AF37]">৳26,270</span>
              </div>
            </div>

            <button className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition duration-300 mb-5">
              Proceed to Checkout
            </button>

            <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition duration-300">
              Continue Shopping
            </button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto rounded-[40px] border border-white/10 bg-gradient-to-r from-[#151515] to-[#0F0F0F] p-12 md:p-20 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#D4AF37]/10 blur-[120px] rounded-full" />

          <div className="relative z-10">
            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">
              Stay Updated
            </p>

            <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
              Join The
              <span className="block text-[#D4AF37]">
                ZYVAR Community
              </span>
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
              Get updates about new arrivals, premium collections, imported
              products and exclusive offers.
            </p>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
              />

              <button className="px-8 py-5 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-105 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-400 text-sm bg-black">
        © 2026 ZYVAR — Original Cosmetics • Family Essentials • Imported Treats
      </footer>
    </div>
  );
}