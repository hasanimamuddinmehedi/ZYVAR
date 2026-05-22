import { useEffect, useState } from "react";

import {
  collection,
  query,
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

        // QUERY
        const q =
          query(

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

        const fetchedOrders =
          [];

        querySnapshot.forEach((doc) => {

          const data =
            doc.data();

          // MATCH CURRENT USER
          if (

            data.userId === user.uid ||

            data.userEmail === user.email ||

            data.phone === user.phoneNumber

          ) {

            fetchedOrders.push({

              id: doc.id,

              ...data,
            });
          }
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

        case "Confirmed":

          return "bg-purple-500/20 text-purple-400 border-purple-500/30";

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

        case "Confirmed":

          return <FaCheckCircle />;

        default:

          return <FaClock />;
      }
    };

  // ORDER TRACKING BAR
  const getTrackingWidth =
    (status) => {

      switch (status) {

        case "Pending":

          return "25%";

        case "Confirmed":

          return "50%";

        case "Shipping":

          return "75%";

        case "Delivered":

          return "100%";

        default:

          return "10%";
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

                  {/* ORDER ID */}
                  <div>

                    <p className="text-gray-400 text-sm mb-2">
                      Order ID
                    </p>

                    <h2 className="text-xl font-black text-[#C6922B] break-all">
                      #{order.id}
                    </h2>

                  </div>

                  {/* PAYMENT */}
                  <div>

                    <p className="text-gray-400 text-sm mb-2">
                      Payment Method
                    </p>

                    <h2 className="text-lg font-bold mb-3">
                      {order.paymentMethod}
                    </h2>

                    <div>

                      <p className="text-gray-400 text-sm mb-2">
                        Payment Status
                      </p>

                      <h3
                        className={`text-lg font-black ${
                          order.paymentStatus === "Paid"

                            ? "text-green-400"

                            : "text-yellow-400"
                        }`}
                      >
                        {order.paymentStatus || "Pending"}
                      </h3>

                    </div>

                  </div>

                  {/* TOTAL */}
                  <div>

                    <p className="text-gray-400 text-sm mb-2">
                      Order Total
                    </p>

                    <h2 className="text-3xl font-black text-[#C6922B] mb-3">

  ৳{order.total}

  {
    order.shipping > 0 && (
      <span className="block text-sm text-gray-400 font-medium mt-2">

        (Including ৳{order.shipping} shipping charge)

      </span>
    )
  }

</h2>

                    <div>

                      <p className="text-gray-400 text-sm mb-2">
                        Shipping Charge
                      </p>

                      {
                        order.shipping > 0 ? (

                          <h3 className="text-xl font-black text-[#C6922B]">

                            ৳{order.shipping}

                          </h3>

                        ) : (

                          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">

                            Shipping charge will be added by admin.
                            You will pay it during delivery.

                          </p>
                        )
                      }

                    </div>

                  </div>

                  {/* STATUS */}
                  <div>

                    <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-bold ${getStatusStyle(order.status)}`}>

                      {getStatusIcon(order.status)}

                      {order.status}

                    </div>

                  </div>

                </div>

                {/* ORDER TRACKING */}
                <div className="px-6 pt-8">

                  <div className="flex items-center justify-between mb-5 text-xs sm:text-sm uppercase tracking-widest text-gray-400">

                    {/* PENDING */}
                    <div className="flex flex-col items-center gap-2">

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === "Pending" ||
                        order.status === "Confirmed" ||
                        order.status === "Shipping" ||
                        order.status === "Delivered"
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10"
                      }`}>
                        <FaClock />
                      </div>

                      Pending

                    </div>

                    {/* CONFIRMED */}
                    <div className="flex flex-col items-center gap-2">

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === "Confirmed" ||
                        order.status === "Shipping" ||
                        order.status === "Delivered"
                          ? "bg-purple-500 text-white"
                          : "bg-white/10"
                      }`}>
                        <FaCheckCircle />
                      </div>

                      Confirmed

                    </div>

                    {/* SHIPPING */}
                    <div className="flex flex-col items-center gap-2">

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === "Shipping" ||
                        order.status === "Delivered"
                          ? "bg-blue-500 text-white"
                          : "bg-white/10"
                      }`}>
                        <FaTruck />
                      </div>

                      Shipping

                    </div>

                    {/* DELIVERED */}
                    <div className="flex flex-col items-center gap-2">

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === "Delivered"
                          ? "bg-green-500 text-white"
                          : "bg-white/10"
                      }`}>
                        <FaCheckCircle />
                      </div>

                      Delivered

                    </div>

                  </div>

                  {/* TRACK LINE */}
                  <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mb-10">

                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#C6922B] to-yellow-400 rounded-full transition-all duration-700"
                      style={{
                        width:
                          getTrackingWidth(order.status),
                      }}
                    />

                  </div>

                </div>

                {/* CUSTOMER INFO */}
                <div className="px-6 pb-6">

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6 mb-8">

                    <h3 className="text-2xl font-black mb-6">

                      Delivery Information

                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">

                      <div>

                        <p className="text-gray-400 mb-2">
                          Customer Name
                        </p>

                        <h4 className="text-xl font-bold">
                          {order.name}
                        </h4>

                      </div>

                      <div>

                        <p className="text-gray-400 mb-2">
                          Phone Number
                        </p>

                        <h4 className="text-xl font-bold">
                          {order.phone}
                        </h4>

                      </div>

                      <div className="md:col-span-2">

                        <p className="text-gray-400 mb-2">
                          Delivery Address
                        </p>

                        <h4 className="text-lg font-bold leading-relaxed">
                          {order.address}
                        </h4>

                      </div>

                      {
                        order.note && (
                          <div className="md:col-span-2">

                            <p className="text-gray-400 mb-2">
                              Customer Note
                            </p>

                            <h4 className="text-lg font-bold leading-relaxed">
                              {order.note}
                            </h4>

                          </div>
                        )
                      }

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