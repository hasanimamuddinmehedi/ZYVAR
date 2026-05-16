import {
  useNavigate,
} from "react-router-dom";

import {
  useCart,
} from "../context/CartContext";

export default function Cart() {

  const navigate =
    useNavigate();

  const {

    cart = [],

    removeFromCart,

    cartTotal,

  } = useCart();

  // EMPTY CART
  if (!cart || cart.length === 0) {

    return (

      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center px-6">

        <h1 className="text-4xl font-black text-[#C6922B] mb-6 text-center">

          Your Cart Is Empty

        </h1>

        <button

          onClick={() =>
            navigate("/products")
          }

          className="px-8 py-5 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
        >

          Continue Shopping

        </button>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-20">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-12">

          <h1 className="text-5xl font-black">

            Shopping Cart

          </h1>

          <span className="text-[#C6922B] text-xl font-bold">

            {cart.length} Items

          </span>

        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {
              cart.map((item) => (

                <div

                  key={item.id}

                  className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-6"
                >

                  <img

                    src={item.image}

                    alt={item.name}

                    className="w-full md:w-40 h-40 rounded-2xl object-cover"
                  />

                  <div className="flex-1">

                    <p className="uppercase tracking-widest text-[#C6922B] text-xs mb-3">

                      {item.category}

                    </p>

                    <h2 className="text-3xl font-black mb-4">

                      {item.name}

                    </h2>

                    <p className="text-gray-400 mb-5">

                      Quantity:
                      {" "}
                      {item.quantity}

                    </p>

                    <h3 className="text-3xl font-black text-[#C6922B]">

                      ৳
                      {
                        Number(item.price) *
                        Number(item.quantity)
                      }

                    </h3>

                  </div>

                  <button

                    onClick={() =>
                      removeFromCart(
                        item.id
                      )
                    }

                    className="px-6 py-3 rounded-2xl border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition h-fit"
                  >

                    Remove

                  </button>

                </div>
              ))
            }

          </div>

          {/* RIGHT */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit sticky top-10">

            <h2 className="text-3xl font-black mb-8">

              Order Summary

            </h2>

            <div className="flex justify-between items-center mb-6">

              <span className="text-gray-400">

                Total Items

              </span>

              <span className="font-bold">

                {cart.length}

              </span>

            </div>

            <div className="border-t border-white/10 pt-6 flex justify-between items-center mb-10">

              <h3 className="text-2xl font-black">

                Total

              </h3>

              <h3 className="text-4xl font-black text-[#C6922B]">

                ৳{cartTotal}

              </h3>

            </div>

            <button

              onClick={() =>
                navigate("/payment")
              }

              className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.02] transition"
            >

              Proceed To Checkout

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}