import { useEffect } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaHeart,
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";

import {
  useWishlist,
} from "../context/WishlistContext";

import {
  useCart,
} from "../context/CartContext";

export default function Wishlist() {

  const navigate =
    useNavigate();

  const {
    wishlist,
    removeFromWishlist,
  } = useWishlist();

  const {
    addToCart,
  } = useCart();

  // LOGIN CHECK
  useEffect(() => {

    const user =
      localStorage.getItem(
        "zyvar-user"
      );

    if (!user) {

      navigate("/login");
    }

  }, []);

  // EMPTY STATE
  if (!wishlist || wishlist.length === 0) {

    return (

      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">

        <div className="max-w-2xl w-full rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">

          <div className="w-28 h-28 rounded-full bg-[#C6922B]/10 flex items-center justify-center mx-auto mb-8 text-[#C6922B] text-5xl">

            <FaHeart />

          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-5">

            Wishlist Is Empty

          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-10">

            Save your favorite premium products here
            and shop them anytime later.

          </p>

          <button

            onClick={() =>
              navigate("/products")
            }

            className="px-8 py-5 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition duration-300"
          >

            Explore Products

          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">

              Saved Collection

            </p>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">

              Your
              <span className="block text-[#C6922B]">
                Wishlist
              </span>

            </h1>

          </div>

          {/* BACK BUTTON */}
          <button

            onClick={() =>
              navigate("/profile")
            }

            className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition duration-300"
          >

            <FaArrowLeft />

            Back To Profile

          </button>

        </div>

        {/* PRODUCTS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {
            wishlist.map((item) => (

              <div

                key={item.id}

                className="group rounded-[40px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#C6922B] transition duration-500"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden">

                  <img

                    src={item.image}

                    alt={item.name}

                    className="h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                  />

                  {/* CATEGORY */}
                  <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#C6922B] text-black text-xs font-black uppercase tracking-widest">

                    {item.category}

                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-7">

                  <h2 className="text-3xl font-black mb-4 leading-snug">

                    {item.name}

                  </h2>

                  <p className="text-gray-400 leading-relaxed mb-8">

                    Premium imported original collection
                    exclusively available at ZYVAR.

                  </p>

                  {/* PRICE */}
                  <div className="flex items-center justify-between mb-8">

                    <h3 className="text-4xl font-black text-[#C6922B]">

                      ৳{item.price}

                    </h3>

                    <div className="flex items-center gap-1 text-yellow-400 text-lg">

                      ★★★★★

                    </div>

                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-4">

                    {/* ADD TO CART */}
                    <button

                      onClick={() => {

                        addToCart(item);

                        navigate("/cart");
                      }}

                      className="flex-1 py-4 rounded-2xl bg-[#C6922B] text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition duration-300"
                    >

                      <FaShoppingCart />

                      Add To Cart

                    </button>

                    {/* REMOVE */}
                    <button

                      onClick={() =>
                        removeFromWishlist(
                          item.id
                        )
                      }

                      className="w-16 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 flex items-center justify-center"
                    >

                      <FaTrash />

                    </button>

                  </div>

                </div>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}