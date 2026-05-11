import { useEffect, useState }
from "react";

import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db }
from "../firebase/firebase";

export default function Orders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH ORDERS
  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders =
    async () => {

      try {

        const q = query(

          collection(
            db,
            "orders"
          ),

          orderBy(
            "createdAt",
            "desc"
          )
        );

        const querySnapshot =
          await getDocs(q);

        const orderList =
          querySnapshot.docs.map(
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

  // UPDATE STATUS
  const updateStatus =
    async (
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

        fetchOrders();

      } catch (error) {

        console.log(error);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">

        <div>

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-3">
            Admin Dashboard
          </p>

          <h1 className="text-5xl font-black">
            Order Management
          </h1>
        </div>

        <div className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5">

          <span className="text-gray-400 mr-3">
            Total Orders:
          </span>

          <span className="text-3xl font-black text-[#D4AF37]">
            {orders.length}
          </span>
        </div>
      </div>

      {/* LOADING */}
      {
        loading ? (

          <div className="flex justify-center py-32">

            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />

          </div>

        ) : orders.length === 0 ? (

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center">

            <h2 className="text-4xl font-black mb-5">
              No Orders Found
            </h2>

            <p className="text-gray-400">
              Orders will appear here.
            </p>
          </div>

        ) : (

          <div className="space-y-8">

            {
              orders.map((order) => (

                <div

                  key={order.id}

                  className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8"
                >

                  {/* TOP */}
                  <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">

                    <div>

                      <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">
                        Order ID
                      </p>

                      <h2 className="text-2xl font-black">
                        {order.id}
                      </h2>
                    </div>

                    <div className="flex gap-4 flex-wrap">

                      <button

                        onClick={() =>
                          updateStatus(
                            order.id,
                            "Processing"
                          )
                        }

                        className="px-5 py-3 rounded-2xl bg-yellow-500 text-black font-bold"
                      >

                        Processing
                      </button>

                      <button

                        onClick={() =>
                          updateStatus(
                            order.id,
                            "Shipped"
                          )
                        }

                        className="px-5 py-3 rounded-2xl bg-blue-500 text-white font-bold"
                      >

                        Shipped
                      </button>

                      <button

                        onClick={() =>
                          updateStatus(
                            order.id,
                            "Delivered"
                          )
                        }

                        className="px-5 py-3 rounded-2xl bg-green-500 text-black font-bold"
                      >

                        Delivered
                      </button>
                    </div>
                  </div>

                  {/* CUSTOMER */}
                  <div className="grid md:grid-cols-3 gap-6 mb-10">

                    <div>

                      <p className="text-gray-400 mb-2">
                        Customer Name
                      </p>

                      <h3 className="text-xl font-bold">
                        {order.name}
                      </h3>
                    </div>

                    <div>

                      <p className="text-gray-400 mb-2">
                        Phone
                      </p>

                      <h3 className="text-xl font-bold">
                        {order.phone}
                      </h3>
                    </div>

                    <div>

                      <p className="text-gray-400 mb-2">
                        Status
                      </p>

                      <h3 className="text-xl font-bold text-[#D4AF37]">
                        {
                          order.status ||
                          "Pending"
                        }
                      </h3>
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="mb-10">

                    <p className="text-gray-400 mb-2">
                      Shipping Address
                    </p>

                    <h3 className="text-lg font-medium leading-relaxed">
                      {order.address}
                    </h3>
                  </div>

                  {/* PRODUCTS */}
                  <div className="mb-10">

                    <h3 className="text-2xl font-black mb-6">
                      Ordered Products
                    </h3>

                    <div className="space-y-5">

                      {
                        order.items?.map(
                          (
                            item,
                            index
                          ) => (

                            <div

                              key={index}

                              className="flex items-center gap-5 rounded-3xl border border-white/10 bg-black/20 p-5"
                            >

                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-24 h-24 rounded-2xl object-cover"
                              />

                              <div className="flex-1">

                                <h4 className="text-xl font-bold mb-2">
                                  {item.name}
                                </h4>

                                <p className="text-gray-400">
                                  Qty:
                                  {" "}
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>

                              <h3 className="text-2xl font-black text-[#D4AF37]">

                                ৳
                                {
                                  item.price
                                }
                              </h3>
                            </div>
                          )
                        )
                      }
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="flex justify-between items-center border-t border-white/10 pt-8">

                    <h2 className="text-2xl font-black">
                      Total Amount
                    </h2>

                    <h2 className="text-4xl font-black text-[#D4AF37]">

                      ৳
                      {
                        order.total
                      }
                    </h2>
                  </div>

                </div>
              ))
            }

          </div>
        )
      }
    </div>
  );
}