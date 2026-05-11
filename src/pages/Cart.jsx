import { useCart } from "../context/CartContext";
import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function Cart() {

  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-12">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-3">
              Shopping Cart
            </p>

            <h1 className="text-5xl font-black">
              Your Cart
            </h1>
          </div>

          <div className="text-2xl font-bold text-[#D4AF37]">
            {cartItems.length} Items
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">

            {cartItems.length === 0 ? (

              <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center">

                <h2 className="text-4xl font-black mb-5">
                  Cart is Empty
                </h2>

                <p className="text-gray-400">
                  Add products to your cart.
                </p>
              </div>

            ) : (

              cartItems.map((item) => (

                <div
                  key={item.id}
                  className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-6"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full md:w-40 h-40 object-cover rounded-3xl"
                  />

                  <div className="flex-1">

                    <p className="uppercase tracking-widest text-[#D4AF37] text-xs mb-2">
                      {item.category}
                    </p>

                    <h2 className="text-3xl font-black mb-4">
                      {item.name}
                    </h2>

                    <p className="text-gray-400 mb-6">
                      Premium imported collection.
                    </p>

                    <div className="flex items-center gap-4">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="w-12 h-12 rounded-xl bg-black/30 border border-white/10"
                      >
                        -
                      </button>

                      <span className="text-2xl font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-12 h-12 rounded-xl bg-black/30 border border-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">

                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="px-5 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      Remove
                    </button>

                    <div className="text-right">

                      <p className="text-gray-400 mb-2">
                        Total
                      </p>

                      <h3 className="text-3xl font-black text-[#D4AF37]">
                        ৳
                        {item.price * item.quantity}
                      </h3>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SUMMARY */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit sticky top-10">

            <h2 className="text-3xl font-black mb-10">
              Order Summary
            </h2>

            <div className="space-y-5 mb-10">

              <div className="flex justify-between text-gray-300">

                <span>Subtotal</span>

                <span>
                  ৳{totalPrice}
                </span>
              </div>

              <div className="flex justify-between text-gray-300">

                <span>Shipping</span>

                <span>
                  ৳120
                </span>
              </div>

              <div className="border-t border-white/10 pt-5 flex justify-between text-2xl font-black">

                <span>Total</span>

                <span className="text-[#D4AF37]">
                  ৳{totalPrice + 120}
                </span>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={() =>
                navigate("/payment")
              }
              className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition duration-300 mb-5"
            >
              Proceed to Checkout
            </button>

            {/* CONTINUE SHOPPING */}
            <Link to="/shop">

              <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">

                Continue Shopping
              </button>

            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}