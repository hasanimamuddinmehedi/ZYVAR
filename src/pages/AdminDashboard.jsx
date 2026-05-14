import { useEffect, useState } from "react";
import {  collection,  getDocs, } from "firebase/firestore";
import {  useNavigate, } from "react-router-dom";
import {  db, } from "../firebase/firebase";
import { Link } from "react-router-dom";

export default function AdminDashboard() {

  const navigate =
    useNavigate();

  const [products,
    setProducts] =
    useState([]);

  const [orders,
    setOrders] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  // FETCH DATA
  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard =
    async () => {

      try {

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

              id:
                doc.id,

              ...doc.data(),
            })
          );

        setProducts(
          productList
        );

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

              id:
                doc.id,

              ...doc.data(),
            })
          );

        setOrders(
          orderList
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // TOTAL REVENUE
  const totalRevenue =
    orders.reduce(

      (acc, item) =>

        acc +
        (item.total || 0),

      0
    );

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 border-r border-white/10 bg-black/30 backdrop-blur-xl p-8 flex-col">

        {/* LOGO */}
        <div className="mb-14">

          <h1 className="text-4xl font-black tracking-[0.3em] text-[#D4AF37]">
            ZYVAR
          </h1>

          <p className="text-gray-400 mt-3 uppercase tracking-[0.3em] text-xs">
            Admin Dashboard
          </p>

        </div>

        {/* NAVIGATION */}
        <nav className="space-y-4">

          <link className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold">
            📊 Dashboard
          </link>

          <link

            onClick={() =>
              navigate("/admin-upload")
            }

            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37]"
          >

            ➕ Upload Product

          </link>

          <link

            onClick={() =>
              navigate("/admin-products")
            }

            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37]"
          >

            🛍 Products

          </link>

          <link

            onClick={() =>
              navigate("/admin-orders")
            }

            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37]"
          >

            📦 Orders

          </link>

          <link className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37]">

            ⚙ Settings

          </link>

        </nav>

        {/* CARD */}
        <div className="mt-auto rounded-[35px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#1A1A1A] p-6">

          <h3 className="text-2xl font-black text-[#D4AF37] mb-4">
            Premium Admin
          </h3>

          <p className="text-gray-400 mb-6">
            Manage your entire ecommerce business professionally.
          </p>

          <link className="w-full py-4 rounded-2xl bg-[#D4AF37] text-black font-black">

            Explore Features

          </link>

        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-3">

              Ecommerce Analytics

            </p>

            <h2 className="text-5xl font-black">

              Dashboard Overview

            </h2>

          </div>

          <link

            onClick={() =>
              navigate("/admin-upload")
            }

            className="px-7 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold"
          >

            Upload Product

          </link>

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

          {/* PRODUCTS */}
          <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

            <p className="text-gray-400 mb-4">
              Total Products
            </p>

            <h2 className="text-5xl font-black text-[#D4AF37]">
              {products.length}
            </h2>

          </div>

          {/* ORDERS */}
          <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

            <p className="text-gray-400 mb-4">
              Total Orders
            </p>

            <h2 className="text-5xl font-black text-[#D4AF37]">
              {orders.length}
            </h2>

          </div>

          {/* REVENUE */}
          <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

            <p className="text-gray-400 mb-4">
              Revenue
            </p>

            <h2 className="text-5xl font-black text-[#D4AF37]">
              ৳{totalRevenue}
            </h2>

          </div>

          {/* USERS */}
          <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

            <p className="text-gray-400 mb-4">
              Customers
            </p>

            <h2 className="text-5xl font-black text-[#D4AF37]">
              1.2K
            </h2>

          </div>

        </div>

        {/* RECENT PRODUCTS */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 mb-10">

          <div className="flex justify-between items-center mb-10">

            <h3 className="text-3xl font-black">
              Recent Products
            </h3>

            <link

              onClick={() =>
                navigate("/admin-products")
              }

              className="px-6 py-3 rounded-2xl border border-white/10 bg-black/20"
            >

              View All

            </link>

          </div>

          {loading ? (

            <div className="flex justify-center py-16">

              <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-white/10 text-left text-gray-400">

                    <th className="pb-5">
                      Product
                    </th>

                    <th className="pb-5">
                      Category
                    </th>

                    <th className="pb-5">
                      Price
                    </th>

                    <th className="pb-5">
                      Stock
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products
                    .slice(0, 5)
                    .map((product) => (

                      <tr
                        key={product.id}
                        className="border-b border-white/5"
                      >

                        <td className="py-5 flex items-center gap-4">

                          <LazyLoadImage
                            src={product.image}
                                //effect="blur"

                            alt={product.name}

                            className="w-16 h-16 rounded-2xl object-cover"
                          />

                          <div>

                            <h4 className="font-bold">
                              {product.name}
                            </h4>

                          </div>

                        </td>

                        <td className="py-5">
                          {product.category}
                        </td>

                        <td className="py-5 text-[#D4AF37] font-bold">
                          ৳{product.price}
                        </td>

                        <td className="py-5">
                          {product.stock}
                        </td>

                      </tr>
                    ))}

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT ORDERS */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-8">

          <div className="flex justify-between items-center mb-10">

            <h3 className="text-3xl font-black">
              Recent Orders
            </h3>

            <link

              onClick={() =>
                navigate("/admin-orders")
              }

              className="px-6 py-3 rounded-2xl border border-white/10 bg-black/20"
            >

              View Orders

            </link>

          </div>

          {orders.length === 0 ? (

            <div className="text-center py-16 text-gray-400">

              No Orders Yet

            </div>

          ) : (

            <div className="space-y-5">

              {orders
                .slice(0, 5)
                .map((order) => (

                  <div

                    key={order.id}

                    className="rounded-3xl border border-white/10 bg-black/20 p-6 flex justify-between items-center"
                  >

                    <div>

                      <h4 className="text-xl font-bold mb-2">

                        {order.customerName ||
                          "Customer"}

                      </h4>

                      <p className="text-gray-400">

                        {order.items?.length || 0}
                        {" "}
                        Products

                      </p>

                    </div>

                    <div className="text-right">

                      <h4 className="text-2xl font-black text-[#D4AF37]">

                        ৳{order.total}

                      </h4>

                      <p className="text-gray-400">
                        Paid
                      </p>

                    </div>

                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}