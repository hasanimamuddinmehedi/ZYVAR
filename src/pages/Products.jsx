import { useEffect, useState } from "react";
import {  collection,  getDocs, } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import {  useWishlist, } from "../context/WishlistContext";
import {  Link, } from "react-router-dom";
import {  trackEvent, } from "../utils/analytics";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();

  const filteredProducts =
    products.filter((product) =>

      product.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      product.category
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const [loading, setLoading] = useState(true);

  // ✅ Hooks must be INSIDE component

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  // FETCH PRODUCTS
  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "products")
        );

      const productList =
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setProducts(productList);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white">

      {/* HERO */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-10 py-24 border-b border-white/10">

        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />

        <div className="max-w-7xl mx-auto relative z-10">

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">
            Premium Ecommerce Store
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black leading-[0.9] mb-8">
            Discover
            <span className="block text-[#D4AF37]">
              Luxury Collections
            </span>
          </h1>

          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed mb-10">
            Explore premium skincare, luxury watches, imported perfumes,
            fashion accessories, bodycare and lifestyle products from ZYVAR.
          </p>

          <div className="flex flex-wrap gap-4">

            <button className="px-8 py-4 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-105 transition">
              Shop Now
            </button>

            <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
              Explore Categories
            </button>

          </div>

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="px-4 sm:px-6 lg:px-10 py-20">

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">

            <div>

              <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
                Featured Products
              </p>

              <h2 className="text-4xl md:text-5xl font-black">
                Trending Collections
              </h2>

            </div>

            <div className="mt-6 max-w-xl">

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                    setSearchTerm(
                          e.target.value
                          );

                          trackEvent(
                                "Search",
                                "Product Search",
                                    e.target.value
                                    );
                                  }}

                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37] text-white placeholder-gray-500"
              />

            </div>

            <button className="px-7 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
              View All Products
            </button>

          </div>

          {/* LOADING */}
          {loading ? (

            <div className="flex items-center justify-center py-32">

              <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center">

              <h2 className="text-4xl font-black mb-5">
                No Matching Products
              </h2>

              <p className="text-gray-400">
                Upload products from the admin panel.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">

              {filteredProducts.map((product) => (

                <Link

                  to={`/product/${product.id}`}

                  key={product.id}

                  className="group rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#D4AF37] transition duration-500 hover:-translate-y-3 block"
                >

                  {/* IMAGE */}
                  <div className="relative overflow-hidden">

                    <LazyLoadImage
                      src={product.image}
                        //effect="blur"
                      alt={product.name}
                      className="h-64 sm:h-72 lg:h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                    />

                    <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest">
                      {product.category}
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-7">

                    <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-gray-400 mb-6 line-clamp-2">
                      {product.description ||
                        "Premium imported luxury collection."}
                    </p>

                    <div className="flex justify-between items-center mb-6">

                      <div>

                        <p className="text-gray-400 text-sm mb-1">
                          Price
                        </p>

                        <h4 className="text-2xl sm:text-3xl font-black text-[#D4AF37]">
                          ৳{product.price}
                        </h4>

                      </div>

                      <div className="text-right">

                        <p className="text-gray-400 text-sm mb-1">
                          Stock
                        </p>

                        <h4 className="text-xl font-bold">
                          {product.stock}
                        </h4>

                      </div>

                    </div>

                    <div className="flex gap-3">

                      <button
                        onClick={() => {
                            addToCart(product);
                              trackEvent(
                                    "Cart",
                                        "Add To Cart",
                                            product.name
                                            );
                                          }}
                        className="flex-1 py-4 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-[1.02] transition duration-300"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => {
                            addToWishlist(
                                  product
                                  );
                                    trackEvent(
                                          "Wishlist",
                                              "Add Wishlist",
                                                  product.name
                                                  );
                                                }}

                        className={`w-14 rounded-2xl border transition text-xl

                        ${
                          isInWishlist(product.id)

                            ? "bg-red-500 text-white border-red-500"

                            : "border-white/10 bg-white/5 hover:border-[#D4AF37]"
                        }
                        `}
                      >
                        ❤
                      </button>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}