import {
  useState,
  useEffect,
} from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  FaPlus,
  FaImage,
  FaBoxOpen,
  FaTag,
  FaWarehouse,
  FaAlignLeft,
  FaTimes,
} from "react-icons/fa";

import {
  db,
  auth,
} from "../../firebase/firebase";

import {
  uploadImage,
} from "../../utils/cloudinary";

import {
  successAlert,
  errorAlert,
  warningAlert,
  confirmAlert,
} from "../../utils/alerts";

import {
  ADMIN_EMAILS,
} from "../../utils/adminCheck";

// SLUG UTILITY
const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// MAX IMAGES ALLOWED
const MAX_IMAGES = 5;

export default function UploadPage({
  products = [],
  orders = [],
  fetchDashboard = () => {},
}) {

  // PRODUCT FORM
  const [name,
    setName] =
    useState("");

  const [price,
    setPrice] =
    useState("");

  const [category,
    setCategory] =
    useState("");

  const [stock,
    setStock] =
    useState("");

  const [description,
    setDescription] =
    useState("");

  // IMAGES (multi-image support — up to MAX_IMAGES)
  const [images,
    setImages] =
    useState([]);

  const [previews,
    setPreviews] =
    useState([]);

  const [uploading,
    setUploading] =
    useState(false);

  // UPLOADER IDENTITY — resolved from the logged-in user
  // (admin gets a fixed ZYVAR identity, partners get their
  // approved shop name + slug from partnerApplications)
  const [uploaderInfo,
    setUploaderInfo] =
    useState(null);

  const [resolvingUploader,
    setResolvingUploader] =
    useState(true);

  // RESOLVE WHO IS UPLOADING — runs once on mount
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          if (!currentUser) {

            setUploaderInfo(null);

            setResolvingUploader(false);

            return;
          }

          try {

            // ADMIN — fixed identity, doesn't depend on partner data
            if (
              ADMIN_EMAILS.includes(
                currentUser.email
              )
            ) {

              setUploaderInfo({
                uid: currentUser.uid,
                uploadedBy: "ZYVAR",
                partnerSlug: "zyvar",
                isAdmin: true,
              });

              setResolvingUploader(false);

              return;
            }

            // PARTNER — look up their approved application
            const partnerRef =
              doc(
                db,
                "partnerApplications",
                currentUser.uid
              );

            const partnerSnap =
              await getDoc(partnerRef);

            if (
              partnerSnap.exists() &&
              partnerSnap.data().status === "approved"
            ) {

              const partnerData =
                partnerSnap.data();

              setUploaderInfo({
                uid: currentUser.uid,
                uploadedBy:
                  partnerData.shopName || "ZYVAR Partner",
                partnerSlug:
                  partnerData.slug || "",
                isAdmin: false,
              });

            } else {

              // LOGGED IN BUT NOT AN APPROVED PARTNER/ADMIN
              setUploaderInfo(null);
            }

          } catch (error) {

            console.log(error);

            setUploaderInfo(null);

          } finally {

            setResolvingUploader(false);
          }
        }
      );

    return () => unsubscribe();

  }, []);

  // ONE-TIME BACKFILL — fixes old products uploaded before
  // uploadedBy/partnerSlug/partnerId existed. Only relevant
  // for ZYVAR admin; safe to run multiple times (skips
  // products that already have partnerSlug set).
  const [backfilling,
    setBackfilling] =
    useState(false);

  const [backfillResult,
    setBackfillResult] =
    useState(null);

  const handleBackfillOldProducts =
    async () => {

      if (!uploaderInfo?.isAdmin) return;

      try {

        const result =
          await confirmAlert(
            "Fix Old Products?",
            "This will attach 'ZYVAR' as the uploader to every existing product that doesn't already have a partner/uploader set. This only needs to be run once."
          );

        if (!result.isConfirmed) {
          return;
        }

        setBackfilling(true);

        setBackfillResult(null);

        const allSnapshot =
          await getDocs(
            collection(db, "products")
          );

        // FIND PRODUCTS MISSING partnerSlug — these are the
        // old admin uploads that predate this feature
        const productsToFix =
          allSnapshot.docs.filter(
            (docItem) =>
              !docItem.data().partnerSlug
          );

        if (!productsToFix.length) {

          setBackfillResult(
            "All products already have an uploader. Nothing to fix."
          );

          setBackfilling(false);

          return;
        }

        // BATCH WRITE — Firestore batches cap at 500 ops,
        // so chunk just in case the catalog is large
        const CHUNK_SIZE = 450;

        for (
          let i = 0;
          i < productsToFix.length;
          i += CHUNK_SIZE
        ) {

          const chunk =
            productsToFix.slice(
              i,
              i + CHUNK_SIZE
            );

          const batch =
            writeBatch(db);

          chunk.forEach((docItem) => {

            batch.update(
              doc(db, "products", docItem.id),
              {
                uploadedBy: "ZYVAR",
                partnerSlug: "zyvar",
                partnerId:
                  uploaderInfo.uid,
              }
            );
          });

          await batch.commit();
        }

        setBackfillResult(
          `Fixed ${productsToFix.length} old product(s). They will now appear under "Products From ZYVAR" and on the /zyvar store page.`
        );

        await successAlert(
          "Backfill Complete",
          `${productsToFix.length} old product(s) updated successfully.`
        );

        // REFRESH DASHBOARD SO COUNTS/LISTS REFLECT THE FIX
        await fetchDashboard();

      } catch (error) {

        console.log(error);

        setBackfillResult(
          "Something went wrong while fixing old products."
        );

        await errorAlert(
          "Backfill Failed",
          "Could not update old products. Please try again."
        );

      } finally {

        setBackfilling(false);
      }
    };

  // HANDLE IMAGE UPLOAD (multiple files, uploads to Cloudinary immediately)
  const handleImageUpload =
    async (e) => {

      const files =
        Array.from(e.target.files || []);

      if (!files.length)
        return;

      // ENFORCE MAX IMAGES LIMIT
      const remainingSlots =
        MAX_IMAGES - images.length;

      if (remainingSlots <= 0) {

        await warningAlert(
          "Limit Reached",
          `You can upload a maximum of ${MAX_IMAGES} images.`
        );

        e.target.value = "";

        return;
      }

      const filesToUpload =
        files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {

        await warningAlert(
          "Limit Reached",
          `Only ${remainingSlots} more image(s) can be added. Extra files were ignored.`
        );
      }

      try {

        setUploading(true);

        const uploadedImages =
          [];

        const newPreviews =
          [];

        for (const file of filesToUpload) {

          const imageUrl =
            await uploadImage(file);

          uploadedImages.push(
            imageUrl
          );

          newPreviews.push(
            URL.createObjectURL(
              file
            )
          );
        }

        setImages(
          (prev) => [
            ...prev,
            ...uploadedImages,
          ]
        );

        setPreviews(
          (prev) => [
            ...prev,
            ...newPreviews,
          ]
        );

        await successAlert(
          "Uploaded",
          "Images uploaded successfully"
        );

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Upload Failed",
          "Could not upload images"
        );

      } finally {

        setUploading(false);

        // RESET FILE INPUT SO SAME FILE CAN BE RE-SELECTED IF NEEDED
        e.target.value = "";
      }
    };

  // REMOVE A SINGLE IMAGE (before/after save, from local state)
  const handleRemoveImage =
    (index) => {

      setImages(
        (prev) =>
          prev.filter(
            (_, i) => i !== index
          )
      );

      setPreviews(
        (prev) =>
          prev.filter(
            (_, i) => i !== index
          )
      );
    };

  // UPLOAD PRODUCT
  const handleUpload =
    async (e) => {

      e.preventDefault();

      try {

        setUploading(true);

        if (!images.length) {

          await warningAlert(
            "Image Required",
            "Please select at least one image before uploading."
          );

          setUploading(false);

          return;
        }

        // GUARD — don't save a product with no identity attached
        if (!uploaderInfo) {

          await warningAlert(
            "Not Authorized",
            "Only ZYVAR admin or an approved partner can upload products."
          );

          setUploading(false);

          return;
        }

        // FIREBASE
        await addDoc(
          collection(
            db,
            "products"
          ),
          {
            name,

            price:
              Number(price),

            category,

            stock:
              Number(stock),

            description,

            images:
              images,

            // SLUG — used for clean URL navigation
            slug:
              toSlug(name),

            // UPLOADER IDENTITY — links product back to admin/partner
            uploadedBy:
              uploaderInfo.uploadedBy,

            partnerSlug:
              uploaderInfo.partnerSlug,

            partnerId:
              uploaderInfo.uid,

            createdAt:
              serverTimestamp(),
          }
        );

        await successAlert(
          "Product Uploaded!",
          "Product has been uploaded successfully."
        );

        // RESET
        setName("");
        setPrice("");
        setCategory("");
        setStock("");
        setDescription("");
        setImages([]);
        setPreviews([]);

        // REFRESH
        await fetchDashboard();

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Upload Failed",
          "Something went wrong. Please try again."
        );

      } finally {

        setUploading(false);
      }
    };

  // SAFE ARRAYS
  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];

  // REVENUE
  const totalRevenue =
    safeOrders.reduce(
      (acc, item) =>
        acc +
        (
          Number(
            item?.total
          ) ||

          Number(
            item?.productSubtotal
          ) ||

          Number(
            item?.subtotal
          ) ||

          0
        ),
      0
    );

  // CAN ADD MORE IMAGES
  const canAddMoreImages =
    images.length < MAX_IMAGES;

  return (

    <div
      className="
      grid
      grid-cols-1
      xl:grid-cols-3
      gap-10
    "
    >

      {/* LEFT SIDE */}
      <div
        className="
        xl:col-span-2
        rounded-[40px]
        border
        border-white/10
        bg-white/5
        backdrop-blur-2xl
        p-5
        md:p-10
      "
      >

        {/* HEADER */}
        <div className="mb-10">

          <p
            className="
            uppercase
            tracking-[0.3em]
            text-[#C6922B]
            text-sm
            mb-4
          "
          >
            ZYVAR ADMIN
          </p>

          <h2
            className="
            text-3xl
            md:text-5xl
            font-black
            leading-tight
          "
          >
            Upload
            <span className="block text-[#C6922B]">
              New Product
            </span>
          </h2>

          {/* UPLOADER IDENTITY BANNER */}
          {resolvingUploader ? (

            <p className="mt-5 text-sm text-gray-500">
              Checking your account...
            </p>

          ) : uploaderInfo ? (

            <p className="mt-5 text-sm text-gray-400">
              Uploading as{" "}
              <span className="text-[#C6922B] font-bold">
                {uploaderInfo.uploadedBy}
              </span>
            </p>

          ) : (

            <p className="mt-5 text-sm text-red-400">
              You must be ZYVAR admin or an approved partner to upload products.
            </p>
          )}

        </div>

        {/* FORM */}
        <form
          onSubmit={handleUpload}
          className="space-y-8"
        >

          {/* PRODUCT NAME */}
          <div>

            <label
              className="
              flex
              items-center
              gap-3
              mb-4
              text-sm
              uppercase
              tracking-widest
              text-gray-400
            "
            >

              <FaBoxOpen />

              Product Name

            </label>

            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
              className="
              w-full
              px-6
              py-5
              rounded-2xl
              bg-black/30
              border
              border-white/10
              outline-none
              focus:border-[#C6922B]
            "
            />

          </div>

          {/* PRICE + STOCK */}
          <div
            className="
            grid
            md:grid-cols-2
            gap-6
          "
          >

            {/* PRICE */}
            <div>

              <label
                className="
                flex
                items-center
                gap-3
                mb-4
                text-sm
                uppercase
                tracking-widest
                text-gray-400
              "
              >

                <FaTag />

                Price

              </label>

              <input
                type="number"
                placeholder="Enter product price"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                required
                className="
                w-full
                px-6
                py-5
                rounded-2xl
                bg-black/30
                border
                border-white/10
                outline-none
                focus:border-[#C6922B]
              "
              />

            </div>

            {/* STOCK */}
            <div>

              <label
                className="
                flex
                items-center
                gap-3
                mb-4
                text-sm
                uppercase
                tracking-widest
                text-gray-400
              "
              >

                <FaWarehouse />

                Stock

              </label>

              <input
                type="number"
                placeholder="Enter stock quantity"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                required
                className="
                w-full
                px-6
                py-5
                rounded-2xl
                bg-black/30
                border
                border-white/10
                outline-none
                focus:border-[#C6922B]
              "
              />

            </div>

          </div>

          {/* CATEGORY */}
          <div>

            <label
              className="
              flex
              items-center
              gap-3
              mb-4
              text-sm
              uppercase
              tracking-widest
              text-gray-400
            "
            >

              <FaTag />

              Category

            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              required
              className="
              w-full
              px-6
              py-5
              rounded-2xl
              bg-black/30
              border
              border-white/10
              outline-none
              focus:border-[#C6922B]
            "
            >

              <option value="">
                Select Category
              </option>

              <option value="Skincare">
                Skincare
              </option>

              <option value="Makeup">
                Makeup
              </option>

              <option value="Beauty">
                Beauty
              </option>

              <option value="Haircare">
                Haircare
              </option>

              <option value="Perfume">
                Perfume
              </option>

              <option value="Fragrance">
                Fragrance
              </option>

              <option value="Watch">
                Watch
              </option>

              <option value="Fashion">
                Fashion
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Bodycare">
                Bodycare
              </option>

              <option value="Babycare">
                Babycare
              </option>

            </select>

          </div>

          {/* DESCRIPTION */}
          <div>

            <label
              className="
              flex
              items-center
              gap-3
              mb-4
              text-sm
              uppercase
              tracking-widest
              text-gray-400
            "
            >

              <FaAlignLeft />

              Description

            </label>

            <textarea
              rows="6"
              placeholder="Write product description..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
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
              focus:border-[#C6922B]
            "
            />

          </div>

          {/* IMAGES — multi-image upload (up to MAX_IMAGES) */}
          <div>

            <label
              className="
              flex
              items-center
              gap-3
              mb-4
              text-sm
              uppercase
              tracking-widest
              text-gray-400
            "
            >

              <FaImage />

              Product Images
              <span className="text-gray-500 normal-case tracking-normal">
                ({images.length}/{MAX_IMAGES})
              </span>

            </label>

            <div
              className="
              flex
              flex-wrap
              gap-4
            "
            >

              {/* EXISTING IMAGE PREVIEWS WITH REMOVE BUTTON */}
              {previews.map(
                (src, index) => (

                  <div
                    key={index}
                    className="
                    relative
                    w-28
                    h-28
                    rounded-2xl
                    overflow-hidden
                    border
                    border-white/10
                    bg-black/20
                  "
                  >

                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="
                      w-full
                      h-full
                      object-cover
                    "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveImage(
                          index
                        )
                      }
                      className="
                      absolute
                      top-1
                      right-1
                      w-6
                      h-6
                      rounded-full
                      bg-black/70
                      text-white
                      flex
                      items-center
                      justify-center
                      hover:bg-red-600
                      transition
                    "
                    >

                      <FaTimes
                        size={10}
                      />

                    </button>

                  </div>
                )
              )}

              {/* SINGLE UPLOAD SLOT — ONLY ONE VISIBLE "ADD" BUTTON */}
              {canAddMoreImages && (

                <label
                  className="
                  w-28
                  h-28
                  rounded-2xl
                  border
                  border-dashed
                  border-white/20
                  bg-black/30
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  hover:border-[#C6922B]
                  transition
                "
                >

                  <FaPlus
                    className="text-[#C6922B] text-2xl"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageUpload
                    }
                    className="hidden"
                  />

                </label>
              )}

            </div>

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={
              uploading ||
              resolvingUploader ||
              !uploaderInfo
            }
            className="
            w-full
            py-5
            rounded-2xl
            bg-[#C6922B]
            text-black
            text-lg
            font-black
            flex
            items-center
            justify-center
            gap-4
            hover:scale-[1.01]
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          >

            <FaPlus />

            {resolvingUploader

              ? "Checking Account..."

              : uploading

                ? "Uploading Product..."

                : "Upload Product"}

          </button>

        </form>

      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-8">

        {/* UPLOAD GUIDE */}
        <div
          className="
          rounded-[40px]
          border
          border-white/10
          bg-white/5
          p-8
        "
        >

          <h3 className="text-2xl font-black mb-8">
            Upload Tips
          </h3>

          <div className="space-y-5 text-gray-300">

            <div className="flex gap-4">
              <span className="text-[#C6922B]">
                ✔
              </span>

              <p>
                Use high-quality product images.
              </p>
            </div>

            <div className="flex gap-4">
              <span className="text-[#C6922B]">
                ✔
              </span>

              <p>
                Add detailed descriptions.
              </p>
            </div>

            <div className="flex gap-4">
              <span className="text-[#C6922B]">
                ✔
              </span>

              <p>
                Keep stock updated regularly.
              </p>
            </div>

            <div className="flex gap-4">
              <span className="text-[#C6922B]">
                ✔
              </span>

              <p>
                Use correct category tags.
              </p>
            </div>

            <div className="flex gap-4">
              <span className="text-[#C6922B]">
                ✔
              </span>

              <p>
                You can upload between 1 and {MAX_IMAGES} images per product.
              </p>
            </div>

          </div>

        </div>

        {/* STATS */}
        <div
          className="
          rounded-[40px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#1A1A1A]
          to-[#101010]
          p-8
        "
        >

          <h3 className="text-2xl font-black mb-8">
            Store Statistics
          </h3>

          <div className="space-y-6">

            <div className="flex justify-between">

              <span className="text-gray-400">
                Products
              </span>

              <span className="text-2xl font-black text-[#C6922B]">
                {safeProducts.length}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Orders
              </span>

              <span className="text-2xl font-black text-[#C6922B]">
                {safeOrders.length}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Revenue
              </span>

              <span className="text-2xl font-black text-[#C6922B]">
                ৳{totalRevenue}
              </span>

            </div>

          </div>

        </div>

        {/* ONE-TIME BACKFILL — ADMIN ONLY */}
        {uploaderInfo?.isAdmin && (

          <div
            className="
            rounded-[40px]
            border
            border-red-500/20
            bg-red-500/5
            p-8
          "
          >

            <h3 className="text-xl font-black mb-3 text-red-400">
              Maintenance Tool
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Old products uploaded before the partner system was
              added are missing their uploader info. Run this once
              to attach "ZYVAR" as the uploader so they show
              "Products From ZYVAR" and appear on the /zyvar store page.
            </p>

            <button
              type="button"
              onClick={handleBackfillOldProducts}
              disabled={backfilling}
              className="
                w-full
                py-4
                rounded-2xl
                bg-red-500
                text-white
                font-black
                hover:opacity-90
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {backfilling
                ? "Fixing Old Products..."
                : "Fix Old Products"}
            </button>

            {backfillResult && (

              <p className="text-sm text-gray-300 mt-5 leading-relaxed">
                {backfillResult}
              </p>
            )}

          </div>
        )}

      </div>

    </div>
  );
}