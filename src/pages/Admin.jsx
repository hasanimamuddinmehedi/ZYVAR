import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  signOut,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  FaChartPie,
  FaBoxOpen,
  FaShoppingBag,
  FaCog,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  db,
  auth,
} from "../firebase/firebase";

import {
  uploadImage,
} from "../utils/cloudinary";

export default function Admin() {

  const navigate = useNavigate();

  const [activeTab,
    setActiveTab] =
    useState("dashboard");

  const [products,
    setProducts] =
    useState([]);

  const [orders,
    setOrders] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

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

  const [uploading,
    setUploading] =
    useState(false);

  // FETCH ALL DATA
  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      // PRODUCTS
      const productSnapshot =
        await getDocs(
          collection(
            db,
            "products"
          )
        );

      const productList =
        productSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setProducts(productList);

      // ORDERS
      const orderSnapshot =
        await getDocs(
          collection(
            db,
            "orders"
          )
        );

      const orderList =
        orderSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setOrders(orderList);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {

    await signOut(auth);

    localStorage.removeItem(
      "zyvar-admin"
    );

    navigate("/admin-login");
  };

  // UPLOAD PRODUCT
  const handleUpload = async (e) => {

    e.preventDefault();

    try {

      setUploading(true);

      if (!file) {

        alert("Please select image");

        return;
      }

      const imageUrl =
        await uploadImage(file);

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

      // RESET
      setName("");
      setPrice("");
      setCategory("");
      setStock("");
      setDescription("");
      setFile(null);

      fetchDashboard();

      setActiveTab("products");

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

    } finally {

      setUploading(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmDelete)
      return;

    try {

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

      alert("Product Deleted");

    } catch (error) {

      console.log(error);
    }
  };

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (
    orderId,
    status
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "orders",
          orderId
        ),
        {
          status,
        }
      );

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      alert(
        `Order marked as ${status}`
      );

    } catch (error) {

      console.log(error);
    }
  };

  // REVENUE
  const totalRevenue =
    orders.reduce(
      (acc, item) =>
        acc +
        (Number(item.total) || 0),
      0
    );

  if (loading) {

    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white text-2xl font-black">
        Loading Admin Panel...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex overflow-hidden">

      {/* SIDEBAR */}
      <aside className="hidden xl:flex w-72 border-r border-white/10 bg-black/40 backdrop-blur-2xl p-8 flex-col fixed left-0 top-0 h-screen z-50">

        {/* LOGO */}
        <div className="mb-14">

          <h1 className="text-4xl font-black tracking-[0.3em] text-[#C6922B]">
            ZYVAR
          </h1>

          <p className="text-gray-400 mt-3 uppercase text-xs tracking-[0.3em]">
            Ultimate Admin Panel
          </p>

        </div>

        {/* NAVIGATION */}
        <nav className="space-y-4">

          <button
            onClick={() =>
              setActiveTab("dashboard")
            }
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition ${
              activeTab === "dashboard"
                ? "bg-[#C6922B] text-black font-black"
                : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
            }`}
          >
            <FaChartPie />
            Dashboard
          </button>

          <button
            onClick={() =>
              setActiveTab("upload")
            }
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition ${
              activeTab === "upload"
                ? "bg-[#C6922B] text-black font-black"
                : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
            }`}
          >
            <FaPlus />
            Upload Product
          </button>

          <button
            onClick={() =>
              setActiveTab("products")
            }
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition ${
              activeTab === "products"
                ? "bg-[#C6922B] text-black font-black"
                : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
            }`}
          >
            <FaBoxOpen />
            Products
          </button>

          <button
            onClick={() =>
              setActiveTab("orders")
            }
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition ${
              activeTab === "orders"
                ? "bg-[#C6922B] text-black font-black"
                : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
            }`}
          >
            <FaShoppingBag />
            Orders
          </button>

          <button
            onClick={() =>
              setActiveTab("settings")
            }
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition ${
              activeTab === "settings"
                ? "bg-[#C6922B] text-black font-black"
                : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
            }`}
          >
            <FaCog />
            Settings
          </button>

        </nav>

        {/* FOOTER CARD */}
        <div className="mt-auto rounded-[35px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-6">

          <h3 className="text-2xl font-black text-[#C6922B] mb-4">
            ZYVAR Premium
          </h3>

          <p className="text-gray-400 leading-relaxed mb-6">
            Manage your complete ecommerce business from one powerful dashboard.
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-3 hover:opacity-90 transition"
          >
            <FaSignOutAlt />
            Logout Admin
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 xl:ml-72 p-6 lg:p-10 overflow-y-auto pt-24">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-3">
              ZYVAR Ecommerce Control
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black leading-tight">

              {activeTab === "dashboard" &&
                "Dashboard"}

              {activeTab === "upload" &&
                "Upload Product"}

              {activeTab === "products" &&
                "Manage Products"}

              {activeTab === "orders" &&
                "Manage Orders"}

              {activeTab === "settings" &&
                "Admin Settings"}

            </h2>

          </div>

          <button
            onClick={() =>
              setActiveTab("products")
            }
            className="px-7 py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition"
          >
            View All Products
          </button>

        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (

          <>

            {/* STATS */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

              <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
                <p className="text-gray-400 mb-4">
                  Total Products
                </p>
                <h2 className="text-5xl font-black text-[#C6922B]">
                  {products.length}
                </h2>
              </div>

              <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
                <p className="text-gray-400 mb-4">
                  Total Orders
                </p>
                <h2 className="text-5xl font-black text-[#C6922B]">
                  {orders.length}
                </h2>
              </div>

              <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
                <p className="text-gray-400 mb-4">
                  Revenue
                </p>
                <h2 className="text-5xl font-black text-[#C6922B]">
                  ৳{totalRevenue}
                </h2>
              </div>

              <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
                <p className="text-gray-400 mb-4">
                  Customers
                </p>
                <h2 className="text-5xl font-black text-[#C6922B]">
                  {orders.length}
                </h2>
              </div>

            </div>

            {/* RECENT PRODUCTS */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

              {products.slice(0, 6).map((product) => (

                <div
                  key={product.id}
                  className="rounded-[35px] border border-white/10 bg-white/5 overflow-hidden"
                >

                  <LazyLoadImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover"
                  />

                  <div className="p-6">

                    <p className="text-[#C6922B] text-sm mb-2">
                      {product.category}
                    </p>

                    <h3 className="text-2xl font-black mb-4">
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-center">

                      <h4 className="text-3xl font-black text-[#C6922B]">
                        ৳{product.price}
                      </h4>

                      <p className="text-gray-400">
                        Stock: {product.stock}
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </>
        )}

        {/* UPLOAD PRODUCT */}
        {activeTab === "upload" && (

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* FORM */}
            <div className="xl:col-span-2 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

              <h3 className="text-3xl font-black mb-10">
                Product Information
              </h3>

              <form
                onSubmit={handleUpload}
                className="space-y-8"
              >

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
                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">

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
                      className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                      Stock
                    </label>

                    <input
                      type="number"
                      placeholder="Enter stock"
                      value={stock}
                      onChange={(e) =>
                        setStock(e.target.value)
                      }
                      required
                      className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                    />
                  </div>

                </div>

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
                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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

                <div>
                  <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
                    Description
                  </label>

                  <textarea
                    rows="5"
                    placeholder="Write description"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />
                </div>

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

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.02] transition duration-300"
                >

                  {uploading
                    ? "Uploading Product..."
                    : "Upload Product"}

                </button>

              </form>

            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-8">

              <div className="rounded-[40px] border border-white/10 bg-white/5 p-8">

                <h3 className="text-2xl font-black mb-6">
                  Upload Tips
                </h3>

                <div className="space-y-5 text-gray-300">

                  <div className="flex gap-4">
                    <span className="text-[#C6922B]">✔</span>
                    <p>Use high-quality images.</p>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-[#C6922B]">✔</span>
                    <p>Add detailed descriptions.</p>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-[#C6922B]">✔</span>
                    <p>Keep stock updated regularly.</p>
                  </div>

                </div>

              </div>

              <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-8">

                <h3 className="text-2xl font-black mb-8">
                  Store Stats
                </h3>

                <div className="space-y-6">

                  <div className="flex justify-between">
                    <span className="text-gray-400">Products</span>
                    <span className="text-2xl font-black text-[#C6922B]">
                      {products.length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Orders</span>
                    <span className="text-2xl font-black text-[#C6922B]">
                      {orders.length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-2xl font-black text-[#C6922B]">
                      ৳{totalRevenue}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {products.map((product) => (

              <div
                key={product.id}
                className="rounded-[35px] border border-white/10 bg-white/5 overflow-hidden"
              >

                <LazyLoadImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                />

                <div className="p-6">

                  <p className="text-[#C6922B] text-sm mb-3">
                    {product.category}
                  </p>

                  <h3 className="text-2xl font-black mb-4">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 mb-4">
                    Stock: {product.stock}
                  </p>

                  <div className="flex justify-between items-center mb-6">

                    <h4 className="text-3xl font-black text-[#C6922B]">
                      ৳{product.price}
                    </h4>

                  </div>

                  <div className="flex gap-4">

                    <button
                      onClick={() =>
                        navigate(`/edit-product/${product.id}`)
                      }
                      className="flex-1 py-3 rounded-2xl bg-[#C6922B] text-black font-bold flex items-center justify-center gap-3 hover:opacity-90 transition"
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteProduct(product.id)
                      }
                      className="w-14 rounded-2xl border border-red-500 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (

          <div className="space-y-8">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-[35px] border border-white/10 bg-white/5 p-8"
              >

                <div className="flex flex-col lg:flex-row justify-between gap-8">

                  <div>

                    <h3 className="text-2xl font-black mb-3">
                      {order.name}
                    </h3>

                    <p className="text-gray-400 mb-2">
                      {order.phone}
                    </p>

                    <p className="text-gray-400 mb-5">
                      {order.address}
                    </p>

                  </div>

                  <div className="lg:text-right">

                    <h2 className="text-4xl font-black text-[#C6922B] mb-4">
                      ৳{order.total}
                    </h2>

                    <p className="text-gray-400 mb-2">
                      Payment: {order.paymentMethod}
                    </p>

                    <p className="text-gray-400 mb-5">
                      Status: {order.status || "Pending"}
                    </p>

                    <div className="flex flex-wrap gap-3 lg:justify-end">

                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Pending")
                        }
                        className="px-5 py-3 rounded-2xl border border-yellow-500 text-yellow-400 flex items-center gap-3 hover:bg-yellow-500 hover:text-black transition"
                      >
                        <FaClock />
                        Pending
                      </button>

                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Confirmed")
                        }
                        className="px-5 py-3 rounded-2xl border border-green-500 text-green-400 flex items-center gap-3 hover:bg-green-500 hover:text-black transition"
                      >
                        <FaCheckCircle />
                        Confirm
                      </button>

                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Delivered")
                        }
                        className="px-5 py-3 rounded-2xl border border-blue-500 text-blue-400 flex items-center gap-3 hover:bg-blue-500 hover:text-black transition"
                      >
                        <FaTruck />
                        Delivered
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-10">

            <h3 className="text-3xl font-black mb-10">
              Admin Settings
            </h3>

            <div className="space-y-6">

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <h4 className="text-xl font-bold mb-3">
                  Store Name
                </h4>
                <p className="text-gray-400">
                  ZYVAR
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <h4 className="text-xl font-bold mb-3">
                  Support Email
                </h4>
                <p className="text-gray-400">
                  hello.zyvar@gmail.com
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <h4 className="text-xl font-bold mb-3">
                  Support Phone
                </h4>
                <p className="text-gray-400">
                  01820400999
                </p>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
