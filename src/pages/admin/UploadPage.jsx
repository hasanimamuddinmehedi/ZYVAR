import {
  useState,
} from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  FaPlus,
  FaImage,
  FaBoxOpen,
  FaTag,
  FaWarehouse,
  FaAlignLeft,
} from "react-icons/fa";

import {
  db,
} from "../../firebase/firebase";

import {
  uploadImage,
} from "../../utils/cloudinary";

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

  const [file,
    setFile] =
    useState(null);

  const [preview,
    setPreview] =
    useState("");

  const [uploading,
    setUploading] =
    useState(false);

  // HANDLE IMAGE
  const handleImageChange =
    (e) => {

      const selectedFile =
        e.target.files?.[0];

      if (!selectedFile)
        return;

      setFile(selectedFile);

      setPreview(
        URL.createObjectURL(
          selectedFile
        )
      );
    };

  // UPLOAD PRODUCT
  const handleUpload =
    async (e) => {

      e.preventDefault();

      try {

        setUploading(true);

        if (!file) {

          alert(
            "Please select image"
          );

          return;
        }

        // CLOUDINARY
        const imageUrl =
          await uploadImage(file);

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

            image:
              imageUrl,

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Product Uploaded Successfully"
        );

        // RESET
        setName("");
        setPrice("");
        setCategory("");
        setStock("");
        setDescription("");
        setFile(null);
        setPreview("");

        // REFRESH
        await fetchDashboard();

      } catch (error) {

        console.log(error);

        alert(
          "Upload Failed"
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

              <option value="Perfume">
                Perfume
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

          {/* IMAGE */}
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

              Product Image

            </label>

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
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
            "
            />

          </div>

          {/* PREVIEW */}
          {preview && (

            <div
              className="
              rounded-[35px]
              overflow-hidden
              border
              border-white/10
              bg-black/20
            "
            >

              <img
                src={preview}
                alt="preview"
                className="
                w-full
                h-[400px]
                object-cover
              "
              />

            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
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

            {uploading

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

      </div>

    </div>
  );
}