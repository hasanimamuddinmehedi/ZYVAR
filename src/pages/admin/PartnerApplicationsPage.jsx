import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import {
  successAlert,
  errorAlert,
  confirmAlert,
} from "../../utils/alerts";

// FIX: generateSlug now imported from shared utils/slug.js
// (previously this file generated slugs with a different
// hyphen-based algorithm than BecomePartnerPage.jsx, so the
// preview URL shown to the applicant never matched the slug
// that actually went live after approval)
import {
  generateSlug,
} from "../../utils/slug";

export default function PartnerApplicationsPage() {

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState(null);

  useEffect(() => {

    fetchApplications();

  }, []);

  const fetchApplications =
    async () => {

      try {

        setLoading(true);

        const snapshot =
          await getDocs(
            collection(
              db,
              "partnerApplications"
            )
          );

        const data =
          snapshot.docs.map(
            (docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            })
          );

        setApplications(data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  const approveApplication =
    async (application) => {

      try {

        setProcessingId(
          application.id
        );

        const result =
          await confirmAlert(
            "Approve Partner?",
            `Approve ${application.shopName}?`
          );

        if (!result.isConfirmed) {
          return;
        }

        // FIX: use the shared generateSlug so this slug
        // always matches the preview shown at application time
        const slug =
          generateSlug(
            application.shopName
          );

        const storeUrl =
          `${window.location.origin}/${slug}`;

        // FIX: write slug (and status) back onto the
        // partnerApplications doc itself, since Profile.jsx
        // reads partnerSlug from this collection, not from
        // the new "partners" doc created below.
        await updateDoc(
          doc(
            db,
            "partnerApplications",
            application.id
          ),
          {
            status: "approved",
            slug,
          }
        );

        await setDoc(
          doc(
            db,
            "partners",
            application.id
          ),
          {

            uid:
              application.uid || "",

            shopName:
              application.shopName,

            slug,

            storeUrl,

            logo:
              application.logo,

            banner:
  application.banner || "",

            ownerName:
              application.ownerName,

            email:
              application.email,

            phone:
              application.phone,

            facebook:
              application.facebook,

            instagram:
              application.instagram,

            address:
              application.address,

            description:
              application.description,

            paymentNumber:
              application.paymentNumber,

            applicationId:
              application.id,

            status: "active",

            rating: 0,

            totalSales: 0,

            totalReviews: 0,

            createdAt:
              serverTimestamp(),
          }
        );

        successAlert(
          "Partner Approved",
          `${application.shopName} is now an official ZYVAR Partner.`
        );

        fetchApplications();

      } catch (error) {

        console.error(error);

        errorAlert(
          "Approve Failed",
          error.message
        );

      } finally {

        setProcessingId(null);
      }
    };

  const rejectApplication =
    async (application) => {

      try {

        setProcessingId(
          application.id
        );

        const result =
          await confirmAlert(
            "Reject Partner?",
            `Reject ${application.shopName}?`
          );

        if (!result.isConfirmed) {
          return;
        }

        await updateDoc(
          doc(
            db,
            "partnerApplications",
            application.id
          ),
          {
            status: "rejected",
          }
        );

        successAlert(
          "Application Rejected",
          `${application.shopName} has been rejected.`
        );

        fetchApplications();

      } catch (error) {

        console.error(error);

        errorAlert(
          "Failed",
          error.message
        );

      } finally {

        setProcessingId(null);
      }
    };

  const deleteApplication =
    async (id) => {

      try {

        setProcessingId(id);

        const result =
          await confirmAlert(
            "Delete Application?",
            "This action cannot be undone."
          );

        if (!result.isConfirmed) {
          return;
        }

        await deleteDoc(
          doc(
            db,
            "partnerApplications",
            id
          )
        );

        successAlert(
          "Deleted",
          "Application removed."
        );

        fetchApplications();

      } catch (error) {

        console.error(error);

        errorAlert(
          "Failed",
          error.message
        );

      } finally {

        setProcessingId(null);
      }
    };

  return (

    <div className="text-white">

      <div className="mb-10">

        <h1 className="text-5xl font-black">
          Partner
          <span className="text-[#C6922B] block">
            Applications
          </span>
        </h1>

      </div>

      {loading && (
        <div className="text-center py-20">
          Loading...
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="text-center py-20">
          No Applications Found
        </div>
      )}

      <div className="grid gap-8">

        {applications.map((application) => (

          <div
            key={application.id}
            className="bg-white/5 border border-white/10 rounded-[30px] p-8"
          >

            <div className="grid lg:grid-cols-[180px_1fr] gap-8">

              <div>
                {application.logo && (
                  <img
                    src={application.logo}
                    alt=""
                    className="w-full h-44 rounded-3xl object-cover"
                  />
                )}
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-4 mb-4">

                  <h2 className="text-3xl font-black text-[#C6922B]">
                    {application.shopName}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold
                    ${
                      application.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : application.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {application.status || "pending"}
                  </span>

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <strong>Owner:</strong>{" "}
                    {application.ownerName}
                  </div>

                  <div>
                    <strong>Email:</strong>{" "}
                    {application.email}
                  </div>

                  <div>
                    <strong>Phone:</strong>{" "}
                    {application.phone}
                  </div>

                  <div>
                    <strong>Payment:</strong>{" "}
                    {application.paymentNumber}
                  </div>

                  <div>
                    <strong>Facebook:</strong>{" "}
                    {application.facebook}
                  </div>

                  <div>
                    <strong>Instagram:</strong>{" "}
                    {application.instagram}
                  </div>

                  <div>
                    <strong>Transaction ID:</strong>{" "}
                    {application.transactionId}
                  </div>

                  <div>
                    <strong>Coupon Code:</strong>{" "}
                    {application.couponCode || "—"}
                  </div>

                </div>

                <div className="mt-5">
                  <strong>Address:</strong>
                  <p className="text-gray-400 mt-2">
                    {application.address}
                  </p>
                </div>

                <div className="mt-5">
                  <strong>Description:</strong>
                  <p className="text-gray-400 mt-2 whitespace-pre-line">
                    {application.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">

                  <button
                    disabled={
                      processingId === application.id
                    }
                    onClick={() =>
                      approveApplication(application)
                    }
                    className="
                      bg-green-500
                      text-white
                      px-6
                      py-3
                      rounded-2xl
                      font-bold
                      transition
                      active:scale-95
                      disabled:opacity-50
                    "
                  >
                    {processingId === application.id
                      ? "Approving..."
                      : "Approve"}
                  </button>

                  <button
                    disabled={
                      processingId === application.id
                    }
                    onClick={() =>
                      rejectApplication(application)
                    }
                    className="
                      bg-yellow-500
                      text-black
                      px-6
                      py-3
                      rounded-2xl
                      font-bold
                      transition
                      active:scale-95
                      disabled:opacity-50
                    "
                  >
                    {processingId === application.id
                      ? "Rejecting..."
                      : "Reject"}
                  </button>

                  <button
                    disabled={
                      processingId === application.id
                    }
                    onClick={() =>
                      deleteApplication(application.id)
                    }
                    className="
                      bg-red-500
                      text-white
                      px-6
                      py-3
                      rounded-2xl
                      font-bold
                      transition
                      active:scale-95
                      disabled:opacity-50
                    "
                  >
                    {processingId === application.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}