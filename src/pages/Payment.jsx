// src/pages/Payment.jsx

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useCart,
} from "../context/CartContext";

import {
  onAuthStateChanged,
} from "firebase/auth";

// ADDRESS DATA IMPORT
import {
  bangladeshData,
} from "../data/bangladeshData";

export default function Payment() {


const bkashLogo =
  "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg";

const nagadLogo =
  "https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png";

  const navigate =
    useNavigate();

  const {
    cart = [],
    clearCart,
  } = useCart();

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [division, setDivision] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [upazila, setUpazila] =
    useState("");

  const [area, setArea] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("COD");

  const [transactionId,
    setTransactionId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [profileLoading,
    setProfileLoading] =
    useState(true);

  // AUTO FILTER
  const districts =
    division
      ? Object.keys(
          bangladeshData[
            division
          ]
        )
      : [];

  const upazilas =
    division &&
    district
      ? bangladeshData[
          division
        ][district]
      : [];

  // AUTO FILL USER PROFILE
  useEffect(() => {

    const unsubscribe =

      onAuthStateChanged(

        auth,

        async (user) => {

          if (!user) {

            navigate("/login");

            return;
          }

          try {

            const savedProfile =

              JSON.parse(

                localStorage.getItem(
                  "zyvar-profile"
                )
              );

            setName(

              savedProfile?.name ||

              user.displayName ||

              ""
            );

            setPhone(

              savedProfile?.phone ||
              ""
            );

            setDivision(
              savedProfile?.division || ""
            );

            setDistrict(
              savedProfile?.district || ""
            );

            setUpazila(
              savedProfile?.upazila || ""
            );

            setArea(
              savedProfile?.area || ""
            );

            setAddress(

              savedProfile?.address ||
              ""
            );

          } catch (error) {

            console.log(error);

          } finally {

            setProfileLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // EMPTY CART
  useEffect(() => {

    if (
      !cart ||
      cart.length === 0
    ) {

      navigate("/cart");
    }

  }, [cart]);

  // TOTAL
  const total = cart.reduce(

    (acc, item) =>

      acc +
      Number(item.price) *
      Number(item.quantity),

    0
  );

  // FULL ADDRESS
  const fullAddress = `
${area},
${upazila},
${district},
${division}

${address}
`;

  // PLACE ORDER
  const handleOrder =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // VALIDATE TRANSACTION
        if (

          (paymentMethod === "bKash" ||

          paymentMethod === "Nagad")

          &&

          !transactionId

        ) {

          alert(
            "Please enter transaction ID"
          );

          setLoading(false);

          return;
        }

        // SAVE PROFILE
        localStorage.setItem(

          "zyvar-profile",

          JSON.stringify({

            name,
            phone,
            division,
            district,
            upazila,
            area,
            address,
          })
        );

        // SAVE ORDER
        await addDoc(

          collection(
            db,
            "orders"
          ),

          {

            userId:
              auth.currentUser.uid,

            userEmail:
              auth.currentUser.email,

            name,
            phone,

            division,
            district,
            upazila,
            area,

            address:
              fullAddress,

            paymentMethod,

            transactionId:

              paymentMethod === "COD"

                ? ""

                : transactionId,

            items: cart,

            total,

            shippingFee:
              "Collected Later",

            status: "Pending",

            createdAt:
              new Date(),
          }
        );

        alert(
          "Order Placed Successfully"
        );

        clearCart();

        navigate("/orders");

      } catch (error) {

        console.log(error);

        alert(
          "Payment Failed"
        );

      } finally {

        setLoading(false);
      }
    };

  // LOADING
  if (profileLoading) {

    return (

      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">

        <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 lg:px-10 py-20">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8 md:p-10 shadow-2xl">

          {/* HEADER */}
          <div className="mb-10">

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-3">

              Bangladesh Checkout

            </p>

            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">

              Delivery & Payment

            </h1>

            <p className="text-gray-400 leading-relaxed max-w-2xl">

              Daraz-style smart checkout optimized for Bangladesh delivery.
              Auto-filter division, district and upazila system.
              No API, no billing integration needed.

            </p>

          </div>

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

                className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-[#C6922B] transition"
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

                placeholder="017XXXXXXXX"

                className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-[#C6922B] transition"
              />

            </div>

            {/* ADDRESS SECTION */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-6">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-black">

                  Shipping Address

                </h2>

                <span className="text-xs bg-[#C6922B]/10 text-[#C6922B] px-4 py-2 rounded-full border border-[#C6922B]/20">

                  Bangladesh Delivery Optimized

                </span>

              </div>

              {/* DIVISION */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Division

                </label>

                <select

                  value={division}

                  onChange={(e) => {

                    setDivision(
                      e.target.value
                    );

                    setDistrict("");
                    setUpazila("");
                  }}

                  required

                  className="w-full px-6 py-5 rounded-2xl bg-black border border-white/10 outline-none focus:border-[#C6922B]"
                >

                  <option value="">
                    Select Division
                  </option>

                  {
                    Object.keys(
                      bangladeshData
                    ).map((div) => (

                      <option
                        key={div}
                        value={div}
                      >

                        {div}

                      </option>
                    ))
                  }

                </select>

              </div>

              {/* DISTRICT */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  District

                </label>

                <select

                  value={district}

                  onChange={(e) => {

                    setDistrict(
                      e.target.value
                    );

                    setUpazila("");
                  }}

                  required

                  disabled={!division}

                  className="w-full px-6 py-5 rounded-2xl bg-black border border-white/10 outline-none focus:border-[#C6922B] disabled:opacity-50"
                >

                  <option value="">
                    Select District
                  </option>

                  {
                    districts.map(
                      (dist) => (

                        <option
                          key={dist}
                          value={dist}
                        >

                          {dist}

                        </option>
                      )
                    )
                  }

                </select>

              </div>

              {/* UPAZILA */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Thana / Upazila

                </label>

                <select

                  value={upazila}

                  onChange={(e) =>
                    setUpazila(
                      e.target.value
                    )
                  }

                  required

                  disabled={!district}

                  className="w-full px-6 py-5 rounded-2xl bg-black border border-white/10 outline-none focus:border-[#C6922B] disabled:opacity-50"
                >

                  <option value="">
                    Select Upazila
                  </option>

                  {
                    upazilas.map(
                      (upa) => (

                        <option
                          key={upa}
                          value={upa}
                        >

                          {upa}

                        </option>
                      )
                    )
                  }

                </select>

              </div>

              {/* AREA */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Area / Road / Village

                </label>

                <input

                  type="text"

                  required

                  value={area}

                  onChange={(e) =>
                    setArea(
                      e.target.value
                    )
                  }

                  placeholder="Road / Area / Village"

                  className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-[#C6922B]"
                />

              </div>

              {/* FULL ADDRESS */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Full Address

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

                  placeholder="House no, building, landmark etc."

                  className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-[#C6922B]"
                />

              </div>

            </div>

            {/* PAYMENT */}
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

                  className={`rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
                    paymentMethod === "COD"

                      ? "border-[#C6922B] bg-[#C6922B]/10"

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

                  className={`rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
                    paymentMethod === "bKash"

                      ? "border-[#E2136E] bg-[#E2136E]/10"

                      : "border-white/10 bg-white/5"
                  }`}
                >

                  <div className="flex items-center gap-3 mb-4">

                    <img

                      src={bkashLogo}

                      alt="bKash"

                      className="w-14 object-contain"
                    />

                    <h3 className="text-2xl font-black">

                      bKash

                    </h3>

                  </div>

                  <p className="text-gray-400 text-sm">

                    Send Money:
                    {" "}
                    01820400999

                  </p>

                </button>

                {/* NAGAD */}
                <button

                  type="button"

                  onClick={() =>
                    setPaymentMethod(
                      "Nagad"
                    )
                  }

                  className={`rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
                    paymentMethod === "Nagad"

                      ? "border-[#F58220] bg-[#F58220]/10"

                      : "border-white/10 bg-white/5"
                  }`}
                >

                  <div className="flex items-center gap-3 mb-4">

                    <img

                      src={nagadLogo}

                      alt="Nagad"

                      className="w-14 object-contain"
                    />

                    <h3 className="text-2xl font-black">

                      Nagad

                    </h3>

                  </div>

                  <p className="text-gray-400 text-sm">

                    Send Money:
                    {" "}
                    01820400999

                  </p>

                </button>

              </div>

            </div>

            {/* TRANSACTION */}
            {
              (paymentMethod === "bKash" ||

              paymentMethod === "Nagad") && (

                <div>

                  <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                    Transaction ID

                  </label>

                  <input

                    type="text"

                    required

                    value={transactionId}

                    onChange={(e) =>
                      setTransactionId(
                        e.target.value
                      )
                    }

                    placeholder="Enter transaction ID"

                    className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>
              )
            }

            {/* BUTTON */}
            <button

              type="submit"

              disabled={loading}

              className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.02] transition-all duration-300 shadow-xl"
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
        <div className="rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8 h-fit sticky top-10 shadow-2xl">

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

                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
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

                  <h4 className="font-black text-[#C6922B]">

                    ৳
                    {
                      Number(item.price) *
                      Number(item.quantity)
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

            <h3 className="text-4xl font-black text-[#C6922B]">

              ৳{total}

            </h3>

          </div>

          {/* ADDRESS PREVIEW */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5">

            <h4 className="font-bold mb-3 text-[#C6922B]">

              Delivery Address

            </h4>

            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">

              {fullAddress}

            </p>

          </div>

          {/* SHIPPING NOTE */}
          <div className="mt-6 rounded-2xl border border-[#C6922B]/20 bg-[#C6922B]/10 p-5">

            <p className="text-sm text-gray-300 leading-relaxed">

              Shipping fee will be collected separately during delivery confirmation.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}