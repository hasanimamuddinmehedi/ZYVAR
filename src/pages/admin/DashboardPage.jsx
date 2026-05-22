import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "../../firebase/firebase";

export default function DashboardPage() {

      const [products,
    setProducts] =
    useState([]);

  const [orders,
    setOrders] =
    useState([]);

  const [totalRevenue,
    setTotalRevenue] =
    useState(0);

  const [loading,
    setLoading] =
    useState(true);

      useEffect(() => {

    const fetchDashboardData =
      async () => {

        try {

          /* PRODUCTS */
          const productsSnapshot =
            await getDocs(
              collection(
                db,
                "products"
              )
            );

          const productsData =
            productsSnapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),
              })
            );

          setProducts(
            productsData
          );

          /* ORDERS */
          const ordersSnapshot =
            await getDocs(
              collection(
                db,
                "orders"
              )
            );

          const ordersData =
            ordersSnapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),
              })
            );

          setOrders(
            ordersData
          );

          /* REVENUE */
          let revenue = 0;

          ordersData.forEach(
            (order) => {

              const subtotal =
                Number(
                  order.productSubtotal
                ) ||

                Number(
                  order.subtotal
                ) ||

                order.items?.reduce(

                  (
                    acc,
                    item
                  ) =>

                    acc +

                    Number(
                      item.price || 0
                    ) *

                    Number(
                      item.quantity || 1
                    ),

                  0
                ) ||

                0;

              const shipping =
                Number(
                  order.shipping || 0
                );

              revenue +=
                subtotal + shipping;
            }
          );

          setTotalRevenue(
            revenue
          );

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);
        }
      };

    fetchDashboardData();

  }, []);

    if (loading) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <h2 className="text-3xl font-black text-[#C6922B]">
          Loading Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
          <p className="text-gray-400 mb-4">
            Total Products
          </p>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {products?.length || 0}
          </h2>
        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
          <p className="text-gray-400 mb-4">
            Total Orders
          </p>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {orders?.length || 0}
          </h2>
        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
          <p className="text-gray-400 mb-4">
            Revenue
          </p>

          <h2 className="text-5xl font-black text-[#C6922B] break-words">
            ৳{totalRevenue || 0}
          </h2>
        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">
          <p className="text-gray-400 mb-4">
            Customers
          </p>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {orders?.length || 0}
          </h2>
        </div>

      </div>

      {/* QUICK OVERVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">

        {/* RECENT ORDERS */}
        <div className="xl:col-span-2 rounded-[35px] border border-white/10 bg-white/5 p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>
              <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-2">
                Orders Overview
              </p>

              <h3 className="text-2xl md:text-3xl font-black">
                Recent Orders
              </h3>
            </div>

            <div className="px-5 py-3 rounded-2xl border border-white/10 bg-black/20 text-sm text-gray-300 w-fit">
              Latest {(orders?.length || 0) >= 5 ? 5 : (orders?.length || 0)} Orders
            </div>

          </div>

          <div className="space-y-5">

            {[...(orders || [])]
              .sort((a, b) => {

                const aTime =
                  a.createdAt?.seconds || 0;

                const bTime =
                  b.createdAt?.seconds || 0;

                return bTime - aTime;
              })
              .slice(0, 5)
              .map((order) => {

                const subtotal =
                  Number(order.productSubtotal) ||
                  Number(order.subtotal) ||
                  order.items?.reduce(
                    (acc, item) =>
                      acc +
                      Number(item.price || 0) *
                        Number(item.quantity || 1),
                    0
                  ) ||
                  0;

                const shipping =
                  Number(order.shipping || 0);

                const total =
                  subtotal + shipping;

                return (

                  <div
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-3 mb-3">

                        <span className="px-4 py-2 rounded-full bg-[#C6922B]/15 border border-[#C6922B]/20 text-[#C6922B] text-xs font-bold tracking-widest uppercase">
                          #{order.id?.slice(0, 10)}
                        </span>

                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest

                          ${
                            order.status === "Delivered"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"

                              : order.status === "Shipping"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"

                              : order.status === "Confirmed"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"

                              : order.status === "Cancelled"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"

                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          }
                          `}
                        >
                          {order.status || "Pending"}
                        </span>

                      </div>

                      <h4 className="text-xl md:text-2xl font-black mb-2 break-words">
                        {order.name}
                      </h4>

                      <div className="space-y-1 text-gray-400 text-sm md:text-base">

                        <p>
                          {order.phone}
                        </p>

                        <p className="break-words">
                          {order.address}
                        </p>

                      </div>

                    </div>

                    <div className="lg:text-right">

                      <h3 className="text-3xl font-black text-[#C6922B] mb-2">
                        ৳{total}
                      </h3>

                      <p className="text-sm text-gray-400 mb-2">
                        ৳{subtotal} + ৳{shipping} (Shipping)
                      </p>

                      <p className="text-sm text-gray-400">
                        Payment: {order.paymentMethod}
                      </p>

                    </div>

                  </div>
                );
              })}

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {/* SALES OVERVIEW */}
          <div className="rounded-[35px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-8 overflow-hidden relative">

            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C6922B]/10 blur-[80px]" />

            <div className="relative z-10">

              <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
                Sales Analytics
              </p>

              <h3 className="text-3xl font-black mb-8">
                Store Insights
              </h3>

              <div className="space-y-6">

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">

                  <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest">
                    Revenue
                  </p>

                  <h2 className="text-4xl font-black text-[#C6922B] break-words">
                    ৳{totalRevenue || 0}
                  </h2>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">

                    <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest">
                      Products
                    </p>

                    <h2 className="text-3xl font-black text-[#C6922B]">
                      {products?.length || 0}
                    </h2>

                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">

                    <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest">
                      Orders
                    </p>

                    <h2 className="text-3xl font-black text-[#C6922B]">
                      {orders?.length || 0}
                    </h2>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RECENT CUSTOMERS */}
          <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
              Customer Activity
            </p>

            <h3 className="text-2xl font-black mb-8">
              Recent Customers
            </h3>

            <div className="space-y-5">

              {[...(orders || [])]
                .sort((a, b) => {

                  const aTime =
                    a.createdAt?.seconds || 0;

                  const bTime =
                    b.createdAt?.seconds || 0;

                  return bTime - aTime;
                })
                .slice(0, 4)
                .map((order, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
                  >

                    <div className="min-w-0 flex-1">

                      <h4 className="font-bold text-white truncate">
                        {order.name}
                      </h4>

                      <p className="text-gray-400 text-sm truncate">
                        {order.phone}
                      </p>

                    </div>

                    <div>

                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest

                        ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }
                        `}
                      >
                        {order.paymentStatus || "Pending"}
                      </span>

                    </div>

                  </div>
                ))}

            </div>

          </div>

        </div>

      </div>

      {/* RECENT PRODUCTS */}
      <div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

          <div>
            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-xs mb-3">
              Product Showcase
            </p>

            <h3 className="text-3xl md:text-4xl font-black">
              Recently Added Products
            </h3>
          </div>

          <div className="px-5 py-3 rounded-2xl border border-white/10 bg-black/20 text-sm text-gray-300 w-fit">
            Latest Product Collection
          </div>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {(products || []).slice(0, 6).map((product) => (

            <div
              key={product.id}
              className="rounded-[35px] border border-white/10 bg-white/5 overflow-hidden group hover:border-[#C6922B] transition duration-300"
            >

              <div className="overflow-hidden">

                <LazyLoadImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition duration-700"
                />

              </div>

              <div className="p-6">

                <div className="flex items-center justify-between gap-4 mb-4">

                  <p className="text-[#C6922B] text-sm uppercase tracking-widest">
                    {product.category}
                  </p>

                  <span className="px-4 py-2 rounded-full bg-black/20 border border-white/10 text-xs text-gray-300">
                    Stock {product.stock}
                  </span>

                </div>

                <h3 className="text-2xl font-black mb-5 line-clamp-2 min-h-[64px]">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between gap-4">

                  <h4 className="text-3xl font-black text-[#C6922B]">
                    ৳{product.price}
                  </h4>

                  <div className="px-4 py-2 rounded-full bg-[#C6922B]/15 border border-[#C6922B]/20 text-[#C6922B] text-xs font-bold uppercase tracking-widest">
                    Premium
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </>
  );
}