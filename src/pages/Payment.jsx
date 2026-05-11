import { useState }
from "react";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import { db }
from "../firebase/firebase";

import { useCart }
from "../context/CartContext";

export default function Payment() {

  const navigate =
    useNavigate();

  const { cart, clearCart } =
    useCart();

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] =
    useState(false);

  // TOTAL
  const total = cart.reduce(

    (acc, item) =>

      acc +
      item.price *
      item.quantity,

    0
  );

  // PLACE ORDER
  const handleOrder =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // SAVE ORDER
        await addDoc(

          collection(
            db,
            "orders"
          ),

          {

            name,
            phone,
            address,

            paymentMethod,

            items: cart,

            total,

            status: "Pending",

            createdAt:
              new Date(),
          }
        );

        alert(
          "Order Placed Successfully"
        );

        clearCart();

        navigate("/");

      } catch (error) {

        console.log(error);

        alert(
          "Payment Failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-20">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
            Secure Checkout
          </p>

          <h1 className="text-5xl font-black mb-10">
            Payment Gateway
          </h1>

          {/* FORM */}
          <form

            onSubmit={handleOrder}

            className="space-y-8"
          >

            {/* NAME */}
            <div>

              <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                Full Name

              </label>

              <input

                type="text"

                required

                value={name}

                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }

                placeholder="Enter your full name"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
              />

            </div>

            {/* PHONE */}
            <div>

              <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                Phone Number

              </label>

              <input

                type="text"

                required

                value={phone}

                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }

                placeholder="01820400999"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
              />

            </div>

            {/* ADDRESS */}
            <div>

              <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                Shipping Address

              </label>

              <textarea

                rows="5"

                required

                value={address}

                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }

                placeholder="Enter your full address"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
              />

            </div>

            {/* PAYMENT METHODS */}
            <div>

              <label className="block mb-5 text-sm uppercase tracking-widest text-gray-400">

                Select Payment Method

              </label>

              <div className="grid md:grid-cols-3 gap-5">

                {/* COD */}
                <button

                  type="button"

                  onClick={() =>
                    setPaymentMethod(
                      "COD"
                    )
                  }

                  className={`rounded-3xl border p-6 transition ${
                    paymentMethod === "COD"

                      ? "border-[#D4AF37] bg-[#D4AF37]/10"

                      : "border-white/10 bg-white/5"
                  }`}
                >

                  <h3 className="text-2xl font-black mb-3">
                    Cash On Delivery
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Pay after receiving product.
                  </p>

                </button>

                {/* BKASH */}
                <button

                  type="button"

                  onClick={() =>
                    setPaymentMethod(
                      "bKash"
                    )
                  }

                  className={`rounded-3xl border p-6 transition ${
                    paymentMethod === "bKash"

                      ? "border-[#D4AF37] bg-[#D4AF37]/10"

                      : "border-white/10 bg-white/5"
                  }`}
                >

                  <h3 className="text-2xl font-black mb-3">
                    bKash
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Mobile banking payment.
                  </p>

                </button>

                {/* SSL */}
                <button

                  type="button"

                  onClick={() =>
                    setPaymentMethod(
                      "SSLCommerz"
                    )
                  }

                  className={`rounded-3xl border p-6 transition ${
                    paymentMethod ===
                    "SSLCommerz"

                      ? "border-[#D4AF37] bg-[#D4AF37]/10"

                      : "border-white/10 bg-white/5"
                  }`}
                >

                  <h3 className="text-2xl font-black mb-3">
                    SSLCommerz
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Card & Online Payments.
                  </p>

                </button>

              </div>
            </div>

            {/* BUTTON */}
            <button

              type="submit"

              disabled={loading}

              className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition"
            >

              {
                loading

                  ? "Processing Payment..."

                  : "Place Order"
              }

            </button>

          </form>
        </div>

        {/* RIGHT */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 h-fit sticky top-10">

          <h2 className="text-3xl font-black mb-8">
            Order Summary
          </h2>

          <div className="space-y-5 mb-8">

            {
              cart.map((item) => (

                <div

                  key={item.id}

                  className="flex items-center gap-4"
                >

                  <img

                    src={item.image}

                    alt={item.name}

                    className="w-20 h-20 rounded-2xl object-cover"
                  />

                  <div className="flex-1">

                    <h3 className="font-bold">
                      {item.name}
                    </h3>

                    <p className="text-gray-400 text-sm">

                      Qty:
                      {" "}
                      {item.quantity}

                    </p>

                  </div>

                  <h4 className="font-black text-[#D4AF37]">

                    ৳
                    {
                      item.price *
                      item.quantity
                    }

                  </h4>

                </div>
              ))
            }

          </div>

          {/* TOTAL */}
          <div className="border-t border-white/10 pt-6 flex justify-between items-center">

            <h3 className="text-2xl font-black">
              Total
            </h3>

            <h3 className="text-4xl font-black text-[#D4AF37]">

              ৳{total}

            </h3>

          </div>
        </div>
      </div>
    </div>
  );
}