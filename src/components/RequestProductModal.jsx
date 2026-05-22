import {
  useState,
} from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

export default function RequestProductModal({
  open,
  setOpen,
  onClose,
  searchText = "",
}) {

  // Support both setOpen (from Products.jsx) and onClose prop patterns
  const handleClose = () => {
    if (typeof setOpen === "function") setOpen(false);
    if (typeof onClose === "function") onClose();
  };

  const isLoggedIn =
    localStorage.getItem("zyvar-user") === "true";

  const user =
    auth.currentUser;

  const [loading,
    setLoading] =
    useState(false);

  // SEPARATE EMAIL STATE
  const [email,
    setEmail] =
    useState(
      user?.email || ""
    );

  const [formData,
    setFormData] =
    useState({

      name:
        user?.displayName || "",

      email:
        user?.email || "",

      phone: "",

      productName:
        searchText || "",

      details: "",

      referenceLink: "",
    });

  if (!open) return null;

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await addDoc(

          collection(
            db,
            "productRequests"
          ),

          {

            ...formData,

            // ALWAYS SAVE EMAIL
            email:
              user?.email ||
              email ||
              formData.email ||
              "",

            userId:
              user?.uid || null,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Product Request Submitted"
        );

        handleClose();

        // RESET FORM
        setFormData({

          name:
            user?.displayName || "",

          email:
            user?.email || "",

          phone: "",

          productName:
            "",

          details: "",

          referenceLink: "",
        });

        // RESET EMAIL STATE
        setEmail(
          user?.email || ""
        );

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/80
        backdrop-blur-md
        flex
        items-center
        justify-center
        overflow-y-auto
        p-4
      "
    >

      <div
        className="
          relative
          w-full
          max-w-2xl
          rounded-[40px]
          border
          border-white/10
          bg-[#111111]
          shadow-[0_0_60px_rgba(198,146,43,0.15)]
          p-6
          md:p-10
          my-10
          max-h-[90vh]
          overflow-y-auto
        "
        style={{
          scrollbarWidth: "none",       /* Firefox */
          msOverflowStyle: "none",      /* IE / Edge */
        }}
      >

        {/* Hide scrollbar for WebKit browsers (Chrome, Safari) */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="flex items-center justify-between mb-8">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
              Product Request
            </p>

            <h2 className="text-4xl font-black text-white">
              Can't Find Product?
            </h2>

          </div>

          {/* CLOSE BUTTON — now calls handleClose which supports both prop patterns */}
          <button
            onClick={handleClose}
            className="text-3xl text-white hover:text-[#C6922B] transition duration-300 leading-none"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NON LOGGED USER */}
          {!user && (

            <>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
              />

              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
              />

            </>
          )}

          {
            !isLoggedIn && (

              <>

                {/* NAME */}
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-black/30
                    border
                    border-white/10
                    outline-none
                    text-white
                    placeholder-gray-500
                    focus:border-[#C6922B]
                    transition
                    duration-300
                  "
                />

                {/* PHONE */}
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-black/30
                    border
                    border-white/10
                    outline-none
                    text-white
                    placeholder-gray-500
                    focus:border-[#C6922B]
                    transition
                    duration-300
                  "
                />

              </>

            )
          }

          {/* EMAIL — ALWAYS VISIBLE FOR ALL USERS */}
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="Your Email"
            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
          />

          {/* PRODUCT NAME */}
          <input
            type="text"
            name="productName"
            required
            value={formData.productName}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
          />

          {/* DETAILS */}
          <textarea
            rows="5"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Describe the product..."
            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none resize-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
          />

          {/* LINK */}
          <input
            type="text"
            name="referenceLink"
            value={formData.referenceLink}
            onChange={handleChange}
            placeholder="Reference Link (optional)"
            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none text-white placeholder-gray-500 focus:border-[#C6922B] transition duration-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              py-5
              rounded-2xl
              bg-[#C6922B]
              text-black
              text-lg
              font-black
              hover:scale-[1.02]
              transition
              duration-300
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >

            {
              loading
                ? "Submitting..."
                : "Submit Product Request"
            }

          </button>

        </form>

      </div>

    </div>
  );
}