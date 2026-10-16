import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaBoxOpen,
  FaTag,
  FaWarehouse,
  FaAlignLeft,
  FaImage,
  FaUserTag,
  FaMagic,
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
  confirmAlert,
  warningAlert,
} from "../../utils/alerts";

import {
  ADMIN_EMAILS,
} from "../../utils/adminCheck";

// AI PRODUCT ASSISTANT (name check, category, description, price, images)
import ProductAIAssistant from "../../components/productAI/ProductAIAssistant";
import CategoryField from "../../components/productAI/CategoryField";
import PriceSuggestion from "../../components/productAI/PriceSuggestion";
import {
  ImageAddTile,
  OnlineImageSuggestions,
  ImageProcessModal,
} from "../../components/productAI/ProductImageTools";
import useCategories from "../../hooks/useCategories";

// SLUG UTILITY
const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// MAX IMAGES ALLOWED — same cap as UploadPage.jsx
const MAX_IMAGES = 5;

export default function ProductsPage() {

  const navigate =
    useNavigate();

  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [editingId,
    setEditingId] =
    useState(null);

  const [search,
    setSearch] =
    useState("");

  // EDIT FORM STATE — now carries an images array instead
  // of a single image URL, matching the new product schema
  const [editData,
    setEditData] =
    useState({

      name: "",

      price: "",

      category: "",

      stock: "",

      description: "",

      images: [],
    });

  // PER-CARD UPLOADING STATE — disables save / shows spinner
  // while a newly selected image is uploading to Cloudinary
  const [imageUploading,
    setImageUploading] =
    useState(false);

  // AI ASSISTANT STATE — categories include every category already
  // used by a product plus any new ones created by AI / typed by hand
  const { categories, addCategory } =
    useCategories();

  const [aiMeta,
    setAiMeta] =
    useState({});

  const handleAiMeta =
    useCallback(
      (patch) =>
        setAiMeta((prev) => ({
          ...prev,
          ...patch,
        })),
      []
    );

  // IMAGE PROCESSING JOB (raw / erase background / Zyvar template)
  const [processJob,
    setProcessJob] =
    useState(null);

  // VIEWER IDENTITY — resolved the same way as UploadPage.jsx:
  // admin gets a fixed identity and sees every product; an
  // approved partner only sees products where partnerId
  // matches their own uid. This is what makes this single
  // component work as BOTH the admin dashboard and the
  // partner dashboard.
  const [viewerInfo,
    setViewerInfo] =
    useState(null);

  const [resolvingViewer,
    setResolvingViewer] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          if (!currentUser) {

            setViewerInfo(null);

            setProducts([]);

            setLoading(false);

            setResolvingViewer(false);

            return;
          }

          try {

            if (
              ADMIN_EMAILS.includes(
                currentUser.email
              )
            ) {

              setViewerInfo({
                uid: currentUser.uid,
                isAdmin: true,
                uploadedBy: "ZYVAR",
              });

              setResolvingViewer(false);

              return;
            }

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

              setViewerInfo({
                uid: currentUser.uid,
                isAdmin: false,
                uploadedBy:
                  partnerSnap.data().shopName ||
                  "ZYVAR Partner",
              });

            } else {

              setViewerInfo(null);

              setLoading(false);
            }

          } catch (error) {

            console.log(error);

            setViewerInfo(null);

            setLoading(false);

          } finally {

            setResolvingViewer(false);
          }
        }
      );

    return () => unsubscribe();

  }, []);

  // FETCH PRODUCTS — scoped to the viewer. Admin sees every
  // product in the store; a partner only sees products where
  // partnerId equals their own uid, so they can never see or
  // manage another seller's listings.
  useEffect(() => {

    if (resolvingViewer) return;

    if (!viewerInfo) return;

    const fetchProducts =
      async () => {

        try {

          setLoading(true);

          let snapshot;

          if (viewerInfo.isAdmin) {

            snapshot =
              await getDocs(
                collection(
                  db,
                  "products"
                )
              );

          } else {

            const partnerProductsQuery =
              query(
                collection(
                  db,
                  "products"
                ),
                where(
                  "partnerId",
                  "==",
                  viewerInfo.uid
                )
              );

            snapshot =
              await getDocs(
                partnerProductsQuery
              );
          }

          const data =
            snapshot.docs.map(
              (docItem) => ({

                id: docItem.id,

                ...docItem.data(),
              })
            );

          setProducts(data);

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);
        }
      };

    fetchProducts();

  }, [viewerInfo, resolvingViewer]);

  // DELETE PRODUCT
  const handleDeleteProduct =
    async (id) => {

      try {

        const result =
          await confirmAlert(
            "Delete Product?",
            "This will permanently delete the product. This action cannot be undone."
          );

        if (!result.isConfirmed)
          return;

        await deleteDoc(
          doc(
            db,
            "products",
            id
          )
        );

        setProducts(
          products.filter(
            (item) =>
              item.id !== id
          )
        );

        await successAlert(
          "Product Deleted!",
          "The product has been deleted successfully."
        );

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Delete Failed",
          "Failed to delete product. Please try again."
        );
      }
    };

  // START EDIT
  const handleEdit =
    (product) => {

      setAiMeta({});

      setProcessJob(null);

      setEditingId(
        product.id
      );

      setEditData({

        name:
          product.name || "",

        price:
          product.price || "",

        category:
          product.category || "",

        stock:
          product.stock || "",

        description:
          product.description || "",

        // FALLBACK — older products may still only have a
        // single "image" string instead of an images array
        images:
          product.images && product.images.length > 0

            ? product.images

            : product.image

              ? [product.image]

              : [],
      });
    };

  // ADD IMAGE(S) WHILE EDITING — uploads to Cloudinary
  // immediately, same UX as UploadPage.jsx, capped at MAX_IMAGES
  const handleEditImageUpload =
    async (e) => {

      const files =
        Array.from(e.target.files || []);

      if (!files.length) return;

      const remainingSlots =
        MAX_IMAGES - editData.images.length;

      if (remainingSlots <= 0) {

        await warningAlert(
          "Limit Reached",
          `You can have a maximum of ${MAX_IMAGES} images.`
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

        setImageUploading(true);

        const uploadedImages = [];

        for (const file of filesToUpload) {

          const imageUrl =
            await uploadImage(file);

          if (!imageUrl) throw new Error("Image upload failed.");

          uploadedImages.push(imageUrl);
        }

        setEditData(
          (prev) => ({
            ...prev,
            images: [
              ...prev.images,
              ...uploadedImages,
            ],
          })
        );

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Upload Failed",
          "Could not upload image. Please try again."
        );

      } finally {

        setImageUploading(false);

        e.target.value = "";
      }
    };

  // APPLY RESULT OF THE IMAGE OPTIONS POPUP
  // (new images go through the normal edit upload handler)
  const handleEditProcessApply =
    async (files) => {

      const job = processJob;

      setProcessJob(null);

      if (!job) return;

      if (job.replaceIndex == null) {

        await handleEditImageUpload({
          target: { files, value: "" },
        });

        return;
      }

      try {

        setImageUploading(true);

        const url =
          await uploadImage(files[0]);

        if (!url) throw new Error("upload");

        setEditData((prev) => ({
          ...prev,
          images: prev.images.map((x, i) =>
            i === job.replaceIndex ? url : x
          ),
        }));

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Upload Failed",
          "Could not upload image. Please try again."
        );

      } finally {

        setImageUploading(false);
      }
    };

  // REMOVE AN IMAGE WHILE EDITING
  const handleRemoveEditImage =
    (index) => {

      setEditData(
        (prev) => ({
          ...prev,
          images: prev.images.filter(
            (_, i) => i !== index
          ),
        })
      );
    };

  // SAVE EDIT
  const handleSave =
    async (id) => {

      try {

        if (!editData.images.length) {

          await warningAlert(
            "Image Required",
            "Please keep at least one image for this product."
          );

          return;
        }

        const updatedData = {

          name:
            editData.name,

          price:
            Number(
              editData.price
            ),

          category:
            editData.category,

          stock:
            Number(
              editData.stock
            ),

          description:
            editData.description,

          images:
            editData.images,
        };

        await updateDoc(
          doc(
            db,
            "products",
            id
          ),
          updatedData
        );

        setProducts(
          products.map(
            (product) =>

              product.id === id

                ? {
                    ...product,
                    ...updatedData,
                  }

                : product
          )
        );

        setEditingId(null);

        await successAlert(
          "Product Updated!",
          "Product has been updated successfully."
        );

      } catch (error) {

        console.log(error);

        await errorAlert(
          "Update Failed",
          "Failed to update product. Please try again."
        );
      }
    };

  // FILTER PRODUCTS
  const filteredProducts =
    products.filter(
      (product) =>

        product?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        product?.category
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  if (resolvingViewer || loading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white text-2xl font-black">
        Loading Products...
      </div>
    );
  }

  // NOT AUTHORIZED — logged in but neither admin nor an
  // approved partner, so there is nothing for them to manage
  if (!viewerInfo) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white text-2xl font-black text-center px-6">
        You must be ZYVAR admin or an approved partner to view this dashboard.
      </div>
    );
  }

  return (

    <div className="space-y-10">

      {/* HEADER */}
      <div
        className="
        flex
        flex-col
        lg:flex-row
        justify-between
        items-start
        lg:items-center
        gap-6
      "
      >

        <div>

          <p
            className="
            uppercase
            tracking-[0.3em]
            text-[#C6922B]
            text-sm
            mb-4
          "
          >
            {
              viewerInfo.isAdmin

                ? "ZYVAR PRODUCTS"

                : "MY STORE PRODUCTS"
            }
          </p>

          <h2
            className="
            text-3xl
            md:text-5xl
            font-black
            leading-tight
          "
          >
            Manage
            <span className="block text-[#C6922B]">
              Products
            </span>
          </h2>

        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-[400px]">

          <FaSearch
            className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
            w-full
            pl-14
            pr-6
            py-5
            rounded-2xl
            bg-black/20
            border
            border-white/10
            outline-none
            focus:border-[#C6922B]
          "
          />

        </div>

      </div>

      {/* PRODUCTS GRID */}
      <div
        className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-8
      "
      >

        {filteredProducts.map(
          (product) => {

            const isEditing =
              editingId ===
              product.id;

            return (

              <div
                key={product.id}
                className="
                rounded-[35px]
                border
                border-white/10
                bg-white/5
                overflow-hidden
                backdrop-blur-xl
              "
              >

                {/* IMAGE */}
                <div className="relative">

                  <LazyLoadImage
                    src={
                      isEditing

                        ? editData.images[0]

                        : (
                          product.images?.[0] ||
                          product.image
                        )
                    }
                    alt={
                      product.name
                    }
                    onClick={() =>
                      !isEditing &&
                      navigate(
                        `/product/${product.slug || toSlug(product.name)}`
                      )
                    }
                    className={`
                    w-full
                    h-80
                    object-cover
                    ${
                      !isEditing
                        ? "cursor-pointer hover:scale-105 transition duration-300"
                        : ""
                    }
                    `}
                  />

                  <div
                    className="
                    absolute
                    top-5
                    left-5
                    px-4
                    py-2
                    rounded-full
                    bg-[#C6922B]
                    text-black
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                  "
                  >
                    {
                      isEditing

                        ? editData.category

                        : product.category
                    }
                  </div>

                  {/* UPLOADED BY BADGE — admin only, since
                      admin's grid mixes every seller's products
                      together and needs to tell them apart */}
                  {
                    viewerInfo.isAdmin && !isEditing && (

                      <div
                        className="
                        absolute
                        top-5
                        right-5
                        px-4
                        py-2
                        rounded-full
                        bg-black/70
                        border
                        border-white/10
                        text-white
                        text-xs
                        font-bold
                        flex
                        items-center
                        gap-2
                      "
                      >

                        <FaUserTag />

                        {
                          product.uploadedBy ||
                          "Unknown"
                        }

                      </div>
                    )
                  }

                </div>

                {/* CONTENT */}
                <div className="p-6">

                  {/* EDIT MODE */}
                  {isEditing ? (

                    <div className="space-y-5">

                      {/* NAME */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaBoxOpen />

                          Product Name

                        </label>

                        <input
                          type="text"
                          value={
                            editData.name
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              name:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                        {/* AI: NAME CHECK + CATEGORY + DESCRIPTION + PRICE + IMAGES */}
                        <ProductAIAssistant
                          name={editData.name}
                          onNameChange={(value) =>
                            setEditData((prev) => ({ ...prev, name: value }))
                          }
                          category={editData.category}
                          onCategoryChange={(value) =>
                            setEditData((prev) => ({ ...prev, category: value }))
                          }
                          description={editData.description}
                          onDescriptionChange={(value) =>
                            setEditData((prev) => ({ ...prev, description: value }))
                          }
                          categories={categories}
                          onNewCategory={addCategory}
                          onMeta={handleAiMeta}
                        />
                      </div>

                      {/* PRICE */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaTag />

                          Price

                        </label>

                        <input
                          type="number"
                          value={
                            editData.price
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              price:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                        <PriceSuggestion
                          price={aiMeta.price}
                          onApply={(value) =>
                            setEditData((prev) => ({ ...prev, price: String(value) }))
                          }
                        />
                      </div>

                      {/* STOCK */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaWarehouse />

                          Stock

                        </label>

                        <input
                          type="number"
                          value={
                            editData.stock
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              stock:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* CATEGORY */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaTag />

                          Category

                        </label>

                        <CategoryField
                          value={editData.category}
                          onChange={(value) =>
                            setEditData((prev) => ({ ...prev, category: value }))
                          }
                          categories={categories}
                          onAddCategory={addCategory}
                          selectClassName="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* IMAGES — multi-image editor, same
                          pattern as UploadPage.jsx: existing
                          thumbnails with a remove button, plus
                          one "add" tile capped at MAX_IMAGES */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaImage />

                          Product Images
                          <span className="text-gray-500 normal-case tracking-normal">
                            ({editData.images.length}/{MAX_IMAGES})
                          </span>

                        </label>

                        {/* AI: PICTURES FOUND ONLINE */}
                        <OnlineImageSuggestions
                          images={aiMeta.images}
                          disabled={
                            editData.images.length >= MAX_IMAGES ||
                            imageUploading
                          }
                          onSelect={(url) =>
                            setProcessJob({
                              sources: [{ url }],
                              replaceIndex: null,
                            })
                          }
                        />

                        <div className="flex flex-wrap gap-3">

                          {
                            editData.images.map(
                              (img, index) => (

                                <div
                                  key={index}
                                  className="
                                  relative
                                  w-20
                                  h-20
                                  rounded-xl
                                  overflow-hidden
                                  border
                                  border-white/10
                                  bg-black/20
                                "
                                >

                                  <img
                                    src={img}
                                    alt={`product-${index}`}
                                    className="w-full h-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    title="Erase background / Zyvar template"
                                    onClick={() =>
                                      setProcessJob({
                                        sources: [{ url: img }],
                                        replaceIndex: index,
                                      })
                                    }
                                    className="
                                    absolute
                                    bottom-1
                                    left-1
                                    w-5
                                    h-5
                                    rounded-full
                                    bg-black/70
                                    text-[#C6922B]
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-[#C6922B]
                                    hover:text-black
                                    transition
                                  "
                                  >
                                    <FaMagic size={9} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveEditImage(
                                        index
                                      )
                                    }
                                    className="
                                    absolute
                                    top-1
                                    right-1
                                    w-5
                                    h-5
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

                                    <FaTimes size={9} />

                                  </button>

                                </div>
                              )
                            )
                          }

                          {
                            editData.images.length < MAX_IMAGES && (
                              <ImageAddTile
                                sizeClass="w-20 h-20"
                                busy={imageUploading}
                                onPick={(files) =>
                                  setProcessJob({
                                    sources: files.map((file) => ({ file })),
                                    replaceIndex: null,
                                  })
                                }
                              />
                            )
                          }

                        </div>

                      </div>

                      {/* DESCRIPTION */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaAlignLeft />

                          Description

                        </label>

                        <textarea
                          rows="4"
                          value={
                            editData.description
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              description:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          resize-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* BUTTONS */}
                      <div className="flex gap-4">

                        <button
                          onClick={() =>
                            handleSave(
                              product.id
                            )
                          }
                          disabled={imageUploading}
                          className="
                          flex-1
                          py-4
                          rounded-2xl
                          bg-[#C6922B]
                          text-black
                          font-black
                          flex
                          items-center
                          justify-center
                          gap-3
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                        >

                          <FaSave />

                          Save

                        </button>

                        <button
                          onClick={() =>
                            setEditingId(
                              null
                            )
                          }
                          className="
                          w-14
                          rounded-2xl
                          border
                          border-red-500
                          text-red-400
                          flex
                          items-center
                          justify-center
                        "
                        >

                          <FaTimes />

                        </button>

                      </div>

                    </div>

                  ) : (

                    <>
                      {/* VIEW MODE */}

                      <p
                        className="
                        text-[#C6922B]
                        text-sm
                        mb-3
                      "
                      >
                        {
                          product.category
                        }
                      </p>

                      <h3
                        onClick={() =>
                          navigate(
                            `/product/${product.slug || toSlug(product.name)}`
                          )
                        }
                        className="
                        text-2xl
                        font-black
                        mb-4
                        cursor-pointer
                        hover:text-[#C6922B]
                        transition
                      "
                      >
                        {
                          product.name
                        }
                      </h3>

                      <p
                        className="
                        text-gray-400
                        mb-3
                      "
                      >
                        Stock:
                        {" "}
                        {
                          product.stock
                        }
                      </p>

                      <p
                        className="
                        text-gray-400
                        mb-6
                        line-clamp-3
                      "
                      >
                        {
                          product.description
                        }
                      </p>

                      <div
                        className="
                        flex
                        justify-between
                        items-center
                        mb-6
                      "
                      >

                        <h4
                          className="
                          text-3xl
                          font-black
                          text-[#C6922B]
                        "
                        >
                          ৳
                          {
                            product.price
                          }
                        </h4>

                      </div>

                      {/* BUTTONS */}
                      <div className="flex gap-4">

                        <button
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                          className="
                          flex-1
                          py-4
                          rounded-2xl
                          bg-[#C6922B]
                          text-black
                          font-black
                          flex
                          items-center
                          justify-center
                          gap-3
                          hover:opacity-90
                          transition
                        "
                        >

                          <FaEdit />

                          Edit

                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProduct(
                              product.id
                            )
                          }
                          className="
                          w-14
                          rounded-2xl
                          border
                          border-red-500
                          text-red-400
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                        >

                          <FaTrash />

                        </button>

                      </div>

                    </>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* EMPTY */}
      {filteredProducts.length ===
        0 && (

        <div
          className="
          rounded-[35px]
          border
          border-white/10
          bg-white/5
          p-16
          text-center
        "
        >

          <h2
            className="
            text-3xl
            font-black
            text-[#C6922B]
            mb-4
          "
          >
            No Products Found
          </h2>

          <p className="text-gray-400">
            {
              viewerInfo.isAdmin

                ? "Try another search keyword."

                : "You haven't uploaded any products yet, or none match your search."
            }
          </p>

        </div>
      )}


      {/* IMAGE OPTIONS POPUP */}
      {processJob && (() => {
        const editingProduct =
          products.find((item) => item.id === editingId);

        return (
          <ImageProcessModal
            sources={processJob.sources}
            name={editData.name}
            benefits={aiMeta.benefits || []}
            storeName={
              editingProduct?.partnerSlug &&
              editingProduct.partnerSlug !== "zyvar"
                ? editingProduct.uploadedBy || ""
                : ""
            }
            onApply={handleEditProcessApply}
            onClose={() => setProcessJob(null)}
          />
        );
      })()}

    </div>
  );
}