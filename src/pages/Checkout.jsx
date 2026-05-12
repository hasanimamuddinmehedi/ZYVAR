import { useState } from "react";

import { useCart } from "../context/CartContext";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export default function Checkout() {

  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useCart();

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [formData, setFormData] =
    useState({

      name: "",
      phone: "",
      address: "",
      note: "",

      paymentMethod: "COD",
      transactionId: "",
    });

  // HANDLE INPUT
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // PLACE ORDER
  const placeOrder = async () => {

    // REQUIRED FIELDS
    if (
      !formData.name ||
      !formData.phone ||
      !formData.address
    ) {

      alert(
        "Please fill all required fields"
      );

      return;
    }

    // EMPTY CART
    if (cartItems.length === 0) {

      alert("Your cart is empty");

      return;
    }

    // TRANSACTION ID VALIDATION
    if (
      formData.paymentMethod !== "COD" &&
      !formData.transactionId
    ) {

      alert(
        "Please enter transaction ID"
      );

      return;
    }

    try {

      setLoading(true);

      // SAVE ORDER TO FIREBASE
      await addDoc(
        collection(db, "orders"),
        {

          name: formData.name,

          phone: formData.phone,

          address: formData.address,

          note: formData.note,

          items: cartItems,

          subtotal: totalPrice,

          shipping: 120,

          total: totalPrice + 120,

          paymentMethod:
            formData.paymentMethod,

          transactionId:
            formData.transactionId,

          paymentStatus:
            formData.paymentMethod === "COD"
              ? "Pending"
              : "Paid",

          status: "Pending",

          createdAt:
            serverTimestamp(),
        }
      );

      // CLEAR CART
      clearCart();

      setSuccess(true);

    } catch (error) {

      console.log(error);

      alert("Order Failed");

    } finally {

      setLoading(false);
    }
  };

  // SUCCESS PAGE
  if (success) {

    return (

      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">

        <div className="max-w-2xl text-center">

          <div className="w-28 h-28 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-5xl mx-auto mb-8">
            ✓
          </div>

          <h1 className="text-5xl font-black mb-6">
            Order Confirmed
          </h1>
          
          trackEvent(
              "Order",
                "Place Order",
                  "Checkout Success"
                  );

          <p className="text-gray-400 text-lg leading-relaxed">
            Thank you for shopping with ZYVAR.
            Your order has been placed successfully.
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-20">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14">

        {/* LEFT */}
        <div>

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
            Checkout
          </p>

          <h1 className="text-5xl font-black mb-10">
            Shipping Details
          </h1>

          <div className="space-y-6">

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

            {/* PHONE */}
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

            {/* ADDRESS */}
            <textarea
              name="address"
              placeholder="Full Address"
              rows="5"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

            {/* NOTE */}
            <textarea
              name="note"
              placeholder="Additional Note (Optional)"
              rows="4"
              value={formData.note}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

            {/* PAYMENT METHOD */}
            <div className="space-y-5">

              <h3 className="text-2xl font-black">
                Payment Method
              </h3>

              {/* OPTIONS */}
              <div className="grid md:grid-cols-3 gap-4">

                {/* COD */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentMethod: "COD",
                    })
                  }
                  className={`p-5 rounded-2xl border transition

                  ${
                    formData.paymentMethod === "COD"

                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"

                      : "border-white/10 bg-white/5"
                  }
                  `}
                >
                  Cash On Delivery
                </button>

                {/* BKASH */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentMethod: "bKash",
                    })
                  }
                  className={`p-5 rounded-2xl border transition

                  ${
                    formData.paymentMethod === "bKash"

                      ? "bg-pink-500 text-white border-pink-500"

                      : "border-white/10 bg-white/5"
                  }
                  `}
                >
                  bKash
                </button>

                {/* NAGAD */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentMethod: "Nagad",
                    })
                  }
                  className={`p-5 rounded-2xl border transition

                  ${
                    formData.paymentMethod === "Nagad"

                      ? "bg-orange-500 text-white border-orange-500"

                      : "border-white/10 bg-white/5"
                  }
                  `}
                >
                  Nagad
                </button>

              </div>

              {/* PAYMENT INFO */}
              {
                formData.paymentMethod !== "COD" && (

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">

                    <div>

                      <p className="text-gray-400 mb-2">
                        Send Money To
                      </p>

                      <h3 className="text-3xl font-black text-[#D4AF37]">
                        017XXXXXXXX
                      </h3>

                    </div>

                    <div>

                      <p className="text-gray-400 mb-2">
                        Amount
                      </p>

                      <h3 className="text-3xl font-black text-[#D4AF37]">
                        ৳{totalPrice + 120}
                      </h3>

                    </div>

                    <input
                      type="text"
                      placeholder="Transaction ID"
                      value={formData.transactionId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transactionId:
                            e.target.value,
                        })
                      }
                      className="w-full p-5 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#D4AF37]"
                    />

                  </div>
                )
              }

            </div>

            {/* BUTTON */}
            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition disabled:opacity-50"
            >
              {
                loading
                  ? "Processing..."
                  : "Place Order"
              }
            </button>

          </div>

        </div>

        {/* RIGHT */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit">

          <h2 className="text-3xl font-black mb-10">
            Order Summary
          </h2>

          <div className="space-y-5 mb-10">

            {cartItems.map((item) => (

              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-white/10 pb-5"
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
                    Qty: {item.quantity}
                  </p>

                </div>

                <h4 className="font-black text-[#D4AF37]">
                  ৳
                  {item.price *
                    item.quantity}
                </h4>

              </div>
            ))}

          </div>

          {/* TOTALS */}
          <div className="space-y-5">

            <div className="flex justify-between text-gray-400">

              <span>Subtotal</span>

              <span>
                ৳{totalPrice}
              </span>

            </div>

            <div className="flex justify-between text-gray-400">

              <span>Shipping</span>

              <span>৳120</span>

            </div>

            <div className="border-t border-white/10 pt-5 flex justify-between text-2xl font-black">

              <span>Total</span>

              <span className="text-[#D4AF37]">
                ৳{totalPrice + 120}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}