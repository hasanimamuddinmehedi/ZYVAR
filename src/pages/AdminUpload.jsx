import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { uploadImage } from "../utils/cloudinary";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function AdminUpload() {

  const navigate = useNavigate();

  const handleLogout = async () => {

    await signOut(auth);

    localStorage.removeItem(

      "zyvar-admin"
    );

    navigate("/admin-login");
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    try {

      setLoading(true);

      console.log("STARTING UPLOAD");

      if (!file) {

        alert("Please select image");

        return;
      }

      // CLOUDINARY
      const imageUrl =
        await uploadImage(file);

      console.log(
        "IMAGE URL:",
        imageUrl
      );

      // FIREBASE
      await addDoc(
        collection(db, "products"),
        {

          name,
          price: Number(price),
          category,
          stock: Number(stock),
          description,

          image: imageUrl,

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Product Uploaded Successfully"
      );

      console.log("PRODUCT SAVED");

      // RESET
      setName("");
      setPrice("");
      setCategory("");
      setStock("");
      setDescription("");
      setFile(null);

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden xl:flex w-72 border-r border-white/10 bg-black/30 backdrop-blur-xl p-8 flex-col">

        <div className="mb-14">

          <h1 className="text-4xl font-black tracking-[0.3em] text-[#D4AF37]">
            ZYVAR
          </h1>

          <p className="text-gray-400 mt-3 uppercase text-xs tracking-[0.3em]">
            Admin Panel
          </p>

        </div>

        <nav className="space-y-4">

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            📊 Dashboard
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold">
            ➕ Upload Product
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            🛍 Products
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            📦 Orders
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            ⚙ Settings
          </button>

        </nav>

        {/* Bottom Card */}
        <div className="mt-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#111111] p-6">

          <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">
            ZYVAR Premium
          </h3>

          <p className="text-gray-400 leading-relaxed mb-6">
            Manage your luxury ecommerce products with full control.
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-red-500 text-white font-black"
          >
            Logout Admin
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-3">
              Ecommerce Management
            </p>

            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black">
              Upload New Product
            </h2>

          </div>

          <button className="px-7 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold hover:scale-105 transition">
            View All Products
          </button>

        </div>

        {/* Upload Form */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* FORM */}
          <div className="xl:col-span-2 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

            <h3 className="text-3xl font-black mb-10">
              Product Information
            </h3>

            <form

              onSubmit={(e) => {

                e.preventDefault();

                handleUpload();
              }}

              className="space-y-8"
            >

              {/* Product Name */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
                />

              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>

                  <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                    Price
                  </label>

                  <input
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    required
                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
                  />

                </div>

                <div>

                  <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                    Stock
                  </label>

                  <input
                    type="number"
                    placeholder="Enter stock quantity"
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value)
                    }
                    required
                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
                  />

                </div>

              </div>

              {/* Category */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  required
                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
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

              {/* Description */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                  Product Description
                </label>

                <textarea
                  rows="5"
                  placeholder="Write product description..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
                />

              </div>

              {/* Image Upload */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFile(e.target.files[0])
                  }
                  required
                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10"
                />

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition duration-300"
              >

                {loading
                  ? "Uploading Product..."
                  : "Upload Product"}

              </button>

            </form>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-8">

            {/* Tips */}
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

              <h3 className="text-2xl font-black mb-6">
                Upload Tips
              </h3>

              <div className="space-y-5 text-gray-300">

                <div className="flex gap-4">
                  <span className="text-[#D4AF37]">
                    ✔
                  </span>

                  <p>
                    Use high-quality product images.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="text-[#D4AF37]">
                    ✔
                  </span>

                  <p>
                    Add detailed product descriptions.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="text-[#D4AF37]">
                    ✔
                  </span>

                  <p>
                    Mention original/imported details.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="text-[#D4AF37]">
                    ✔
                  </span>

                  <p>
                    Keep pricing updated regularly.
                  </p>
                </div>

              </div>
            </div>

            {/* Stats */}
            <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-8">

              <h3 className="text-2xl font-black mb-8">
                Store Stats
              </h3>

              <div className="space-y-6">

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Products
                  </span>

                  <span className="text-2xl font-black text-[#D4AF37]">
                    326
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Orders
                  </span>

                  <span className="text-2xl font-black text-[#D4AF37]">
                    1,248
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Revenue
                  </span>

                  <span className="text-2xl font-black text-[#D4AF37]">
                    ৳4.8L
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}