import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import {
  successAlert,
  errorAlert,
  confirmAlert,
} from "../../utils/alerts";

export default function PartnerCouponsPage() {

  const [coupons, setCoupons] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      code: "",
      discount: "",
      expiryDate: "",
    });

  const fetchCoupons =
    async () => {

      const snapshot =
        await getDocs(
          collection(
            db,
            "partnerCoupons"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setCoupons(data);
    };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange =
    (e) => {

      setFormData({
        ...formData,
        [e.target.name]:
          e.target.value,
      });
    };

  const createCoupon =
    async () => {

      try {

        if (
          !formData.code ||
          !formData.discount
        ) {

          return errorAlert(
            "Missing Fields",
            "Fill all required fields."
          );
        }

        setLoading(true);

        await addDoc(
          collection(
            db,
            "partnerCoupons"
          ),
          {
            code:
              formData.code
                .trim()
                .toUpperCase(),

            discount:
              Number(
                formData.discount
              ),

            expiryDate:
              formData.expiryDate,

            active: true,

            createdAt:
              serverTimestamp(),
          }
        );

        successAlert(
          "Success",
          "Coupon created successfully."
        );

        setFormData({
          code: "",
          discount: "",
          expiryDate: "",
        });

        fetchCoupons();

      } catch (error) {

        console.log(error);

        errorAlert(
          "Error",
          "Failed to create coupon."
        );

      } finally {

        setLoading(false);
      }
    };

  const toggleCoupon =
    async (coupon) => {

      await updateDoc(
        doc(
          db,
          "partnerCoupons",
          coupon.id
        ),
        {
          active:
            !coupon.active,
        }
      );

      fetchCoupons();
    };

  const deleteCoupon =
    async (couponId) => {

      const result =
        await confirmAlert(
          "Delete Coupon?",
          "This action cannot be undone."
        );

      if (
        !result.isConfirmed
      )
        return;

      await deleteDoc(
        doc(
          db,
          "partnerCoupons",
          couponId
        )
      );

      successAlert(
        "Deleted",
        "Coupon deleted successfully."
      );

      fetchCoupons();
    };

  return (

    <div className="p-8 text-white">

      <h1 className="text-4xl font-black mb-8">
        Partner Coupons
      </h1>

      {/* CREATE FORM */}

      <div className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-6
        mb-8
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-6
        ">
          Create Coupon
        </h2>

        <div className="
          grid
          md:grid-cols-3
          gap-4
        ">

          <input
            type="text"
            name="code"
            placeholder="Coupon Code"
            value={formData.code}
            onChange={handleChange}
            className="
              bg-black/40
              border
              border-white/10
              rounded-xl
              p-4
            "
          />

          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            value={formData.discount}
            onChange={handleChange}
            className="
              bg-black/40
              border
              border-white/10
              rounded-xl
              p-4
            "
          />

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="
              bg-black/40
              border
              border-white/10
              rounded-xl
              p-4
            "
          />

        </div>

        <button
          onClick={createCoupon}
          disabled={loading}
          className="
            mt-6
            bg-[#C6922B]
            text-black
            px-8
            py-3
            rounded-xl
            font-bold
          "
        >
          Create Coupon
        </button>

      </div>

      {/* COUPON LIST */}

      <div className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        overflow-hidden
      ">

        <table className="w-full">

          <thead>

            <tr className="
              border-b
              border-white/10
            ">

              <th className="p-4">
                Code
              </th>

              <th className="p-4">
                Discount
              </th>

              <th className="p-4">
                Expiry
              </th>

              <th className="p-4">
                Status
              </th>

              <th className="p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {coupons.map(
              (coupon) => (

                <tr
                  key={coupon.id}
                  className="
                    border-b
                    border-white/10
                  "
                >

                  <td className="p-4">
                    {coupon.code}
                  </td>

                  <td className="p-4">
                    {coupon.discount}%
                  </td>

                  <td className="p-4">
                    {coupon.expiryDate}
                  </td>

                  <td className="p-4">

                    <span
                      className={
                        coupon.active
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {coupon.active
                        ? "Active"
                        : "Disabled"}
                    </span>

                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          toggleCoupon(
                            coupon
                          )
                        }
                        className="
                          bg-blue-600
                          px-4
                          py-2
                          rounded-lg
                        "
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() =>
                          deleteCoupon(
                            coupon.id
                          )
                        }
                        className="
                          bg-red-600
                          px-4
                          py-2
                          rounded-lg
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}