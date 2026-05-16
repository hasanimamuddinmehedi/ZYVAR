import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaTruck,
} from "react-icons/fa";

export default function Orders() {

  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH USER ORDERS
  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders =
    async () => {

      try {

        const user =
          auth.currentUser;

        if (!user) {

          navigate("/login");

          return;
        }

        const q =
          query(

            collection(
              db,
              "orders"
            ),

            where(
              "userId",
              "==",
              user.uid
            ),

            orderBy(
              "createdAt",
              "desc"
            )
          );

        const querySnapshot =
          await getDocs(q);

        const fetchedOrders =
          [];

        querySnapshot.forEach((doc) => {

          fetchedOrders.push({

            id: doc.id,

            ...doc.data(),
          });
        });

        setOrders(
          fetchedOrders
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // STATUS STYLE
  const getStatusStyle =
    (status) => {

      switch (status) {

        case "Delivered":

          return "bg-green-500/20 text-green-400 border-green-500/30";

        case "Shipping":

          return "bg-blue-500/20 text-blue-400 border-blue-500/30";

        case "Pending":

          return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

        default:

          return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      }
    };

  // STATUS ICON
  const getStatusIcon =
    (status) => {

      switch (status) {

        case "Delivered":

          return <FaCheckCircle />;

        case "Shipping":

          return <FaTruck />;

        default:

          return <FaClock />;
      }
    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">

        <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-10">

      <div className="max-w-7xl mx-auto">

        {/* TOP */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">

              Your Orders

            </p>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">

              Order
              <span className="block text-[#C6922B]">
                History
              </span>

            </h1>

          </div>

          {/* BACK */}
          <button

            onClick={() =>
              navigate("/profile")
            }

            className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition duration-300"
          >

            <FaArrowLeft />

            Back To Profile

          </button>

        </div>

        {/* EMPTY */}
        {
          orders.length === 0 && (

            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-14 text-center">

              <div className="w-24 h-24 rounded-full bg-[#C6922B]/10 flex items-center justify-center mx-auto mb-8 text-[#C6922B] text-4xl">

                <FaBoxOpen />

              </div>

              <h2 className="text-3xl font-black mb-4">

                No Orders Yet

              </h2>

              <p className="text-gray-400 mb-10 max-w-xl mx-auto">

                Looks like you haven’t placed any order yet.
                Explore premium collections and start shopping.

              </p>

              <button

                onClick={() =>
                  navigate("/products")
                }

                className="px-8 py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition duration-300"
              >

                Explore Products

              </button>

            </div>
          )
        }

        {/* ORDERS */}
        <div className="space-y-8">

          {
            orders.map((order) => (

              <div

                key={order.id}

                className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
              >

                {/* HEADER */}
                <div className="border-b border-white/10 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  <div>

                    <p className="text-gray-400 text-sm mb-2">

                      Order ID

                    </p>

                    <h2 className="text-xl font-black text-[#C6922B] break-all">

                      #{order.id}

                    </h2>

                  </div>

                  <div>

                    <p className="text-gray-400 text-sm mb-2">

                      Payment Method

                    </p>

                    <h2 className="text-lg font-bold">

                      {order.paymentMethod}

                    </h2>

                  </div>

                  <div>

                    <p className="text-gray-400 text-sm mb-2">

                      Total Amount

                    </p>

                    <h2 className="text-3xl font-black text-[#C6922B]">

                      ৳{order.total}

                    </h2>

                  </div>

                  {/* STATUS */}
                  <div>

                    <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-bold ${getStatusStyle(order.status)}`}>

                      {getStatusIcon(order.status)}

                      {order.status}

                    </div>

                  </div>

                </div>

                {/* PRODUCTS */}
                <div className="p-6 space-y-6">

                  {
                    order.items?.map((item, index) => (

                      <div

                        key={index}

                        className="flex flex-col md:flex-row gap-6 md:items-center rounded-3xl border border-white/10 bg-black/20 p-5"
                      >

                        {/* IMAGE */}
                        <img

                          src={item.image}

                          alt={item.name}

                          className="w-full md:w-32 h-32 rounded-2xl object-cover"
                        />

                        {/* CONTENT */}
                        <div className="flex-1">

                          <p className="uppercase tracking-widest text-xs text-[#C6922B] mb-2">

                            {item.category}

                          </p>

                          <h3 className="text-2xl font-black mb-3">

                            {item.name}

                          </h3>

                          <p className="text-gray-400">

                            Quantity:
                            {" "}
                            {item.quantity}

                          </p>

                        </div>

                        {/* PRICE */}
                        <div>

                          <h3 className="text-3xl font-black text-[#C6922B]">

                            ৳
                            {
                              item.price *
                              item.quantity
                            }

                          </h3>

                        </div>

                      </div>
                    ))
                  }

                </div>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}