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

  // SUPPORT BOTH CLOSE METHODS
  const handleClose = () => {

    if (typeof setOpen === "function") {
      setOpen(false);
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const isLoggedIn =
    localStorage.getItem("zyvar-user") === "true";

  const user =
    auth.currentUser;

  const [
    loading,
    setLoading,
  ] = useState(false);

  // EMAIL STATE
  const [
    email,
    setEmail,
  ] = useState(
    user?.email || ""
  );

  // FORM DATA
  const [
    formData,
    setFormData,
  ] = useState({

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

  // INPUT CHANGE
  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };

  // SUBMIT
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // SAVE TO FIREBASE
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
              "",

            userId:
              user?.uid || null,

            status:
              "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Product Request Submitted Successfully!"
        );

        // CLOSE MODAL
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

        // RESET EMAIL
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
          hide-scrollbar
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        {/* HIDE SCROLLBAR */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
              Product Request
            </p>

            <h2 className="text-4xl font-black text-white">
              Can't Find Product?
            </h2>

          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClose}
            className="text-3xl text-white hover:text-[#C6922B] transition duration-300 leading-none"
          >
            ✕
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NON LOGGED USERS */}
          {
            !isLoggedIn && (

              <>

                {/* NAME */}
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="
                    w-full
                    px-6
                    py-5
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
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="
                    w-full
                    px-6
                    py-5
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

          {/* EMAIL */}
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
            className="
              w-full
              px-6
              py-5
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

          {/* PRODUCT NAME */}
          <input
            type="text"
            name="productName"
            required
            value={formData.productName}
            onChange={handleChange}
            placeholder="Product Name"
            className="
              w-full
              px-6
              py-5
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

          {/* DETAILS */}
          <textarea
            rows="5"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Describe the product..."
            className="
              w-full
              px-6
              py-5
              rounded-2xl
              bg-black/30
              border
              border-white/10
              outline-none
              resize-none
              text-white
              placeholder-gray-500
              focus:border-[#C6922B]
              transition
              duration-300
            "
          />

          {/* REFERENCE LINK */}
          <input
            type="text"
            name="referenceLink"
            value={formData.referenceLink}
            onChange={handleChange}
            placeholder="Reference Link (optional)"
            className="
              w-full
              px-6
              py-5
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

          {/* SUBMIT BUTTON */}
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