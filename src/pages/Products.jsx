import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import {
  useCart,
} from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  trackEvent,
} from "../utils/analytics";

import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  ShoppingBag,
  Heart,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import RequestProductModal from "../components/RequestProductModal";
import Footer from "../components/Footer";

import {
  successAlert,
} from "../utils/alerts";

// SLUG UTILITY
const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export default function Products() {

  const [products,
    setProducts] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [requestOpen,
    setRequestOpen] =
    useState(false);

  const [loading,
    setLoading] =
    useState(true);

  const [selectedCategory,
    setSelectedCategory] =
    useState("All");

  const {
    addToCart,
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const navigate =
    useNavigate();

  const isLoggedIn =
    localStorage.getItem(
      "zyvar-user"
    ) === "true";

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

  // CATEGORIES
  const categories =
    useMemo(() => {

      const uniqueCategories = [
        "All",

        ...new Set(
          products
            .map((product) =>
              product.category
            )
            .filter(Boolean)
        ),
      ];

      return uniqueCategories;

    }, [products]);

  // FILTER PRODUCTS
  const filteredProducts =
    products.filter((product) => {

      const matchesSearch =
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
          );

      const matchesCategory =
        selectedCategory === "All"

          ? true

          : product.category ===
            selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // BUY NOW
  const handleBuyNow =
    (product) => {

      if (!isLoggedIn) {

        navigate("/login");

        return;
      }

      addToCart(product);

      navigate("/payment");
    };

  return (

    <>
      <div className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 lg:pt-36 pb-24 border-b border-white/10">

          {/* BACKGROUND IMAGE */}
          <div className="absolute inset-0 opacity-60">

            <img
              src="https://res.cloudinary.com/dhppdatrl/image/upload/v1779428106/gn6qmcgvjwbgnfhmsbrf.png"
              alt="ZYVAR Products"
              className="w-full h-full object-cover"
            />

          </div>

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#0B0B0B]" />

          {/* GLOW */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C6922B]/10 blur-[150px]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#C6922B]/20 bg-[#C6922B]/10 backdrop-blur-xl mb-8">

                <Sparkles size={18} className="text-[#C6922B]" />

                <p className="uppercase tracking-[0.25em] text-xs text-[#C6922B] font-semibold">
                  Premium Luxury Collections
                </p>

              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] mb-8">
                Explore
                <span className="block text-[#C6922B]">
                  ZYVAR Products
                </span>
              </h1>

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
                Premium skincare, imported perfumes, luxury accessories,
                watches, lifestyle essentials and curated collections.
              </p>

              <div className="flex flex-wrap gap-4">

                <button
                  onClick={() => {

                    document
                      .getElementById("products-section")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  className="px-8 py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition duration-300"
                >
                  Explore Products
                </button>

                <button
                  onClick={() =>
                    setRequestOpen(true)
                  }
                  className="px-8 py-4 rounded-2xl border border-[#C6922B]/30 bg-[#C6922B]/10 text-[#C6922B] font-bold hover:bg-[#C6922B] hover:text-black transition duration-300"
                >
                  Request Product
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* PRODUCTS */}
        <section
          id="products-section"
          className="px-4 sm:px-6 lg:px-10 py-20"
        >

          <div className="max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-14">

              <div>

                <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">
                  Product Collections
                </p>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Shop By
                  <span className="block text-[#C6922B]">
                    Categories
                  </span>
                </h2>

              </div>

              {/* REQUEST PRODUCT CTA */}
              <button
                onClick={() =>
                  setRequestOpen(true)
                }
                className="group relative overflow-hidden px-8 py-5 rounded-[24px] bg-gradient-to-r from-[#C6922B] to-[#E8BE56] text-black font-black shadow-2xl shadow-yellow-500/20 hover:scale-[1.03] transition duration-300"
              >

                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000" />

                <div className="relative flex items-center gap-3">

                  <Zap size={20} />

                  Can't Find Product? Request It

                  <ArrowRight size={18} />

                </div>

              </button>

            </div>

            {/* SEARCH */}
            <div className="mb-10">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full max-w-xl px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#C6922B] text-white placeholder-gray-500 transition"
              />

            </div>

            {/* CATEGORY FILTERS */}
            <div className="flex flex-wrap gap-4 mb-14">

              {categories.map((category, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`px-6 py-3 rounded-2xl font-semibold transition duration-300 border

                  ${
                    selectedCategory === category

                      ? "bg-[#C6922B] text-black border-[#C6922B]"

                      : "border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
                  }
                  `}
                >
                  {category}
                </button>

              ))}

            </div>

            {/* LOADING */}
            {loading ? (

              <div className="flex items-center justify-center py-32">

                <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center backdrop-blur-xl">

                <h2 className="text-4xl font-black mb-5">
                  No Matching Products
                </h2>

                <p className="text-gray-400 mb-8 text-lg">
                  We couldn't find your desired product.
                </p>

                <button
                  onClick={() =>
                    setRequestOpen(true)
                  }
                  className="px-8 py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition"
                >
                  Request This Product
                </button>

              </div>

            ) : (

              <>
                {/* PRODUCTS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">

                  {filteredProducts.map((product) => (

                    <div
                      key={product.id}
                      className="group rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#C6922B] transition duration-500 hover:-translate-y-3"
                    >

                      {/* IMAGE */}
                      <Link
                        to={`/product/${product.slug || toSlug(product.name)}`}
                        className="block"
                      >

                        <div className="relative overflow-hidden">

                          <LazyLoadImage
                            src={product.image}
                            alt={product.name}
                            className="h-64 sm:h-72 lg:h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                          />

                          <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#C6922B] text-black text-xs font-bold uppercase tracking-widest">
                            {product.category}
                          </div>

                        </div>

                      </Link>

                      {/* CONTENT */}
                      <div className="p-7">

                        <Link
                          to={`/product/${product.slug || toSlug(product.name)}`}
                        >

                          <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug group-hover:text-[#C6922B] transition">
                            {product.name}
                          </h3>

                        </Link>

                        <p className="text-gray-400 mb-6 line-clamp-2 min-h-[48px]">
                          {
                            product.description ||
                            "Premium imported luxury collection."
                          }
                        </p>

                        {/* PRICE */}
                        <div className="flex justify-between items-center mb-6">

                          <div>

                            <p className="text-gray-400 text-sm mb-1">
                              Price
                            </p>

                            <h4 className="text-2xl sm:text-3xl font-black text-[#C6922B]">
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

                        {/* BUTTONS */}
                        <div className="space-y-3">

                          {/* BUY NOW */}
                          <button
                            onClick={() =>
                              handleBuyNow(product)
                            }
                            className="w-full py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-[1.02] transition duration-300 flex items-center justify-center gap-3"
                          >

                            <Zap size={20} />

                            Buy Now

                          </button>

                          {/* CART + WISHLIST */}
                          <div className="flex gap-3">

                            <button
                              onClick={async () => {

                                addToCart(product);

                                trackEvent(
                                  "Cart",
                                  "Add To Cart",
                                  product.name
                                );

                                await successAlert(
                                  "Added To Cart!",
                                  `${product.name} has been added to your cart.`
                                );
                              }}
                              className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition duration-300 flex items-center justify-center gap-2"
                            >

                              <ShoppingBag size={18} />

                              Cart

                            </button>

                            <button
                              onClick={async () => {

                                if (
                                  isInWishlist(product.id)
                                ) {

                                  removeFromWishlist(
                                    product.id
                                  );

                                  await successAlert(
                                    "Removed From Wishlist",
                                    `${product.name} has been removed from your wishlist.`
                                  );

                                } else {

                                  addToWishlist(
                                    product
                                  );

                                  trackEvent(
                                    "Wishlist",
                                    "Add Wishlist",
                                    product.name
                                  );

                                  await successAlert(
                                    "Added To Wishlist!",
                                    `${product.name} has been added to your wishlist.`
                                  );
                                }
                              }}
                              className={`w-14 rounded-2xl border transition text-xl flex items-center justify-center

                              ${
                                isInWishlist(product.id)

                                  ? "bg-red-500 text-white border-red-500"

                                  : "border-white/10 bg-white/5 hover:border-[#C6922B]"
                              }
                              `}
                            >
                              <Heart size={20} />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                {/* REQUEST PRODUCT SECTION */}
                {search.length > 0 && (

                  <div className="mt-16 relative overflow-hidden rounded-[40px] border border-[#C6922B]/20 bg-gradient-to-r from-[#1A1A1A] to-[#101010] p-10 text-center">

                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C6922B]/10 blur-[120px]" />

                    <div className="relative z-10">

                      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#C6922B]/20 bg-[#C6922B]/10 mb-8">

                        <Sparkles size={18} className="text-[#C6922B]" />

                        <span className="text-[#C6922B] uppercase tracking-[0.25em] text-xs font-semibold">
                          Product Not Found?
                        </span>

                      </div>

                      <h3 className="text-4xl font-black mb-5 leading-tight">
                        Request Any
                        <span className="block text-[#C6922B]">
                          Premium Product
                        </span>
                      </h3>

                      <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                        ZYVAR can source luxury skincare, imported perfumes,
                        fashion accessories, watches and exclusive collections
                        specially for you.
                      </p>

                      <button
                        onClick={() =>
                          setRequestOpen(true)
                        }
                        className="group px-10 py-5 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition duration-300 shadow-2xl shadow-yellow-500/20"
                      >

                        <span className="flex items-center gap-3">

                          <Zap size={20} />

                          Request Product Now

                          <ArrowRight className="group-hover:translate-x-1 transition" size={18} />

                        </span>

                      </button>

                    </div>

                  </div>

                )}

              </>

            )}

          </div>

        </section>

        {/* FOOTER */}
        <Footer />

      </div>

      {/* REQUEST MODAL */}
      <RequestProductModal
        open={requestOpen}
        setOpen={setRequestOpen}
        searchText={search}
      />

    </>
  );
}