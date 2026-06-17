import {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  uploadImage,
} from "../utils/cloudinary";

import {
  submitPartnerApplication,
} from "../services/partnerService";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "../utils/alerts";

import {
  auth,
  db,
} from "../firebase/firebase";

// FIX: generateSlug now imported from shared utils/slug.js
// so the preview URL shown here always matches the slug
// saved live during admin approval.
import {
  generateSlug,
} from "../utils/slug";

export default function BecomePartnerPage() {

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [checkingUser, setCheckingUser] =
    useState(true);

  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [discount, setDiscount] =
    useState(0);

  const [payableAmount, setPayableAmount] =
    useState(1000);

  const [couponApplied, setCouponApplied] =
    useState(false);

  const [userData, setUserData] =
    useState(null);

  const [formData, setFormData] =
    useState({
      shopName: "",
      ownerName: "",
      email: "",
      phone: "",
      facebook: "",
      instagram: "",
      address: "",
      description: "",
      paymentNumber: "",
      couponCode: "",
      transactionId: "",
      logo: "",
    });

  /* =====================================
     AUTH CHECK
  ===================================== */

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            warningAlert(
              "Login Required",
              "Please login first to become a partner."
            );

            navigate("/login");

            return;
          }

          try {

            const userRef =
              doc(
                db,
                "users",
                user.uid
              );

            const userSnap =
              await getDoc(userRef);

            let userInfo = {};

            if (userSnap.exists()) {

              userInfo =
                userSnap.data();

              setUserData(userInfo);
            }

            setFormData((prev) => ({
              ...prev,
              email:
                user.email || "",
              ownerName:
                userInfo?.name ||
                user.displayName ||
                "",
            }));

            await checkExistingApplication(
              user.uid
            );

          } catch (error) {

            console.log(error);

          } finally {

            setCheckingUser(false);
          }
        }
      );

    return () => unsubscribe();

  }, []);

  /* =====================================
     CHECK IF USER ALREADY APPLIED
  ===================================== */

  const checkExistingApplication =
    async (uid) => {

      try {

        const q =
          query(
            collection(
              db,
              "partnerApplications"
            ),
            where("uid", "==", uid)
          );

        const snapshot =
          await getDocs(q);

        if (!snapshot.empty) {

          setAlreadyApplied(true);
        }

      } catch (error) {

        console.log(error);
      }
    };

  /* =====================================
     INPUT CHANGE
  ===================================== */

  const handleChange =
    (e) => {

      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

  /* =====================================
     COUPON CHECK
  ===================================== */

  const handleApplyCoupon =
    async () => {

      try {

        if (!formData.couponCode) {

          return errorAlert(
            "Coupon Required",
            "Please enter a coupon code."
          );
        }

        setCouponLoading(true);

        const q =
          query(
            collection(
              db,
              "partnerCoupons"
            ),
            where(
              "code",
              "==",
              formData.couponCode.trim()
            )
          );

        const snapshot =
          await getDocs(q);

        if (snapshot.empty) {

          setDiscount(0);

          setPayableAmount(1000);

          setCouponApplied(false);

          return errorAlert(
            "Invalid Coupon",
            "Coupon code not found."
          );
        }

        const coupon =
          snapshot.docs[0].data();

        const discountValue =
          Number(coupon.discount);

        const payable =
          1000 -
          (1000 * discountValue) / 100;

        setDiscount(discountValue);

        setPayableAmount(payable);

        setCouponApplied(true);

        successAlert(
          "Coupon Applied",
          `${discountValue}% discount applied successfully.`
        );

      } catch (error) {

        console.log(error);

        errorAlert(
          "Coupon Error",
          "Failed to verify coupon."
        );

      } finally {

        setCouponLoading(false);
      }
    };

  /* =====================================
     LOGO UPLOAD
  ===================================== */

  const handleLogoUpload =
    async (e) => {

      const file = e.target.files[0];

      if (!file) return;

      try {

        setLoading(true);

        const imageUrl =
          await uploadImage(file);

        if (!imageUrl) {
          throw new Error("Upload failed");
        }

        setFormData((prev) => ({
          ...prev,
          logo: imageUrl,
        }));

        successAlert(
          "Logo Uploaded",
          "Your shop logo uploaded successfully."
        );

      } catch (error) {

        console.log(error);

        errorAlert(
          "Upload Failed",
          "Could not upload logo."
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     SUBMIT APPLICATION
  ===================================== */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const user = auth.currentUser;

        if (!user) {

          errorAlert(
            "Login Required",
            "Please login first."
          );

          navigate("/login");

          return;
        }

        if (alreadyApplied) {

          errorAlert(
            "Application Exists",
            "You already submitted a partner application."
          );

          return;
        }

        if (!formData.logo) {

          errorAlert(
            "Logo Required",
            "Please upload your shop logo."
          );

          return;
        }

        if (
          payableAmount > 0 &&
          !formData.transactionId
        ) {

          errorAlert(
            "Transaction ID Required",
            "Please enter your payment transaction ID."
          );

          return;
        }

        const slug =
          generateSlug(formData.shopName);

        const applicationData = {
          ...formData,
          uid: user.uid,
          slug,
          discount,
          payableAmount,
          status: "pending",
        };

        await submitPartnerApplication(
          applicationData
        );

        successAlert(
          "Application Submitted",
          "Your ZYVAR Partner application has been submitted successfully."
        );

        setAlreadyApplied(true);

        setFormData({
          shopName: "",
          ownerName: formData.ownerName,
          email: formData.email,
          phone: "",
          facebook: "",
          instagram: "",
          address: "",
          description: "",
          paymentNumber: "",
          couponCode: "",
          transactionId: "",
          logo: "",
        });

        setTimeout(() => {
          navigate("/profile");
        }, 1500);

      } catch (error) {

        console.log(error);

        errorAlert(
          "Submission Failed",
          "Something went wrong."
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     LOADING SCREEN
  ===================================== */

  if (checkingUser) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
      ">

        <div className="text-center">

          <div className="
            w-12
            h-12
            border-4
            border-[#C6922B]
            border-t-transparent
            rounded-full
            animate-spin
            mx-auto
            mb-4
          " />

          <p>Loading...</p>

        </div>

      </div>
    );
  }

  /* =====================================
     BLOCK PAGE IF ALREADY APPLIED
  ===================================== */

  if (alreadyApplied) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        px-6
      ">

        <div className="
          max-w-2xl
          text-center
          bg-white/5
          border
          border-white/10
          rounded-[40px]
          p-12
        ">

          <h1 className="
            text-5xl
            font-black
            text-[#C6922B]
            mb-6
          ">
            Application Submitted
          </h1>

          <p className="
            text-gray-400
            text-lg
            leading-relaxed
          ">
            You have already submitted
            a ZYVAR Partner application.
            Our team will review it
            and notify you after approval.
          </p>

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="
              mt-10
              bg-[#C6922B]
              text-black
              font-black
              px-10
              py-4
              rounded-2xl
            "
          >
            Go To Profile
          </button>

        </div>

      </div>
    );
  }

  /* =====================================
     MAIN RETURN
  ===================================== */

  return (

    <div className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="text-center">

          <span className="text-[#C6922B] uppercase tracking-[0.4em] text-sm">
            ZYVAR Marketplace
          </span>

          <h1 className="text-5xl md:text-7xl font-black mt-6">
            Become a
            <span className="block text-[#C6922B]">
              ZYVAR Partner
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-8 text-gray-400 text-lg leading-relaxed">
            Sell your products,
            grow your brand,
            get your own partner profile,
            showcase your shop,
            receive customer reviews
            and reach thousands of customers through ZYVAR.
          </p>

        </div>

      </section>

      {/* BENEFITS */}

      <section className="max-w-7xl mx-auto px-6 mb-16">

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-[#C6922B] mb-4">
              Your Own Store
            </h3>
            <p className="text-gray-400">
              Get your own page:
              <br />
              zyvar.vercel.app/shopname
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-[#C6922B] mb-4">
              Sell Products
            </h3>
            <p className="text-gray-400">
              Upload and sell your products
              directly through ZYVAR.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-[#C6922B] mb-4">
              Build Trust
            </h3>
            <p className="text-gray-400">
              Show reviews,
              social links,
              contact information
              and branding.
            </p>
          </div>

        </div>

      </section>

      {/* FORM */}

      <section className="max-w-5xl mx-auto px-6 pb-24">

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-14"
        >

          <h2 className="text-4xl font-black mb-10">
            Partner Application
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              name="shopName"
              placeholder="Shop Name"
              value={formData.shopName}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <input
              type="text"
              name="ownerName"
              placeholder="Owner Name"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <input
              type="text"
              name="facebook"
              placeholder="Facebook URL"
              value={formData.facebook}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <input
              type="text"
              name="instagram"
              placeholder="Instagram URL"
              value={formData.instagram}
              onChange={handleChange}
              required
              className="bg-black/40 border border-white/10 rounded-2xl p-4"
            />

          </div>

          <textarea
            name="address"
            placeholder="Shop Address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full mt-6 bg-black/40 border border-white/10 rounded-2xl p-4"
          />

          <textarea
            name="description"
            placeholder="Tell us about your business"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className="w-full mt-6 bg-black/40 border border-white/10 rounded-2xl p-4"
          />

          <input
            type="text"
            name="paymentNumber"
            placeholder="Bkash/Nagad Number For Receiving Payments"
            value={formData.paymentNumber}
            onChange={handleChange}
            required
            className="w-full mt-6 bg-black/40 border border-white/10 rounded-2xl p-4"
          />

          {/* STORE URL PREVIEW */}

          {formData.shopName && (

            <div className="mt-6 bg-[#C6922B]/10 border border-[#C6922B]/20 rounded-2xl p-4">

              <p className="text-sm text-gray-400">
                Your Store URL
              </p>

              <p className="text-[#C6922B] font-bold mt-1">
                https://zyvar.vercel.app/
                {generateSlug(formData.shopName)}
              </p>

            </div>

          )}

          {/* LOGO */}

          <div className="mt-8">

            <label className="block mb-3 text-[#C6922B] font-bold">
              Shop Logo
            </label>

            <label
              className="
                flex
                items-center
                justify-center
                w-full
                p-6
                rounded-2xl
                border
                border-white/10
                bg-black/40
                cursor-pointer
                hover:border-[#C6922B]
                transition
              "
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <span className="text-gray-300">
                Click To Upload Shop Logo
              </span>
            </label>

            {formData.logo && (
              <img
                src={formData.logo}
                alt="logo"
                className="w-32 h-32 object-cover rounded-2xl mt-6 border border-white/10"
              />
            )}

          </div>

          {/* PAYMENT BOX */}

          <div className="mt-10 bg-[#C6922B]/10 border border-[#C6922B]/20 rounded-3xl p-8">

            <h3 className="text-3xl font-black text-[#C6922B] mb-4">
              Partner Application Fee
            </h3>

            <p className="text-gray-300">
              Send Money via
              <span className="text-[#C6922B] font-bold">
                {" "}Bkash / Nagad
              </span>
            </p>

            <p className="mt-2 text-gray-300">
              Number:
              <span className="text-[#C6922B] font-bold">
                {" "}01820400999
              </span>
            </p>

            <div className="mt-6">

              <div className="text-gray-400">
                Original Fee
              </div>

              <div className="text-xl line-through">
                ৳1000
              </div>

              {discount > 0 && (
                <div className="mt-3 text-green-400 font-bold">
                  Coupon Applied: {discount}% OFF
                </div>
              )}

              <div className="mt-4 text-4xl font-black text-[#C6922B]">
                ৳{payableAmount}
              </div>

            </div>

          </div>

          {/* COUPON */}

          <div className="mt-6 flex gap-4">

            <input
              type="text"
              name="couponCode"
              placeholder="Coupon Code"
              value={formData.couponCode}
              onChange={handleChange}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4"
            />

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="px-8 bg-[#C6922B] text-black font-bold rounded-2xl"
            >
              {couponLoading
                ? "Checking..."
                : "Apply"}
            </button>

          </div>

          {/* TRANSACTION ID — hidden if 100% coupon applied */}

          {payableAmount > 0 && (

            <input
              type="text"
              name="transactionId"
              placeholder="Bkash/Nagad Transaction ID"
              value={formData.transactionId}
              onChange={handleChange}
              required
              className="w-full mt-6 bg-black/40 border border-white/10 rounded-2xl p-4"
            />

          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-10
              w-full
              bg-[#C6922B]
              text-black
              font-black
              text-lg
              py-5
              rounded-2xl
              hover:scale-[1.01]
              transition
            "
          >
            {loading ? "Submitting..." : "Apply Now"}
          </button>

        </form>

      </section>

    </div>
  );
}