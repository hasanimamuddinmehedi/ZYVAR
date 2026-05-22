import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useParams,
} from "react-router-dom";

import { db }
from "../firebase/firebase";

export default function OrderTracking() {

  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchOrder();

  }, []);

  const fetchOrder = async () => {

    try {

      const orderRef =
        doc(db, "orders", id);

      const orderSnap =
        await getDoc(orderRef);

      if (orderSnap.exists()) {

        setOrder({
          id: orderSnap.id,
          ...orderSnap.data(),
        });
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!order) {

    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">
        Order Not Found
      </div>
    );
  }

  const steps = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
  ];

  const currentStep =
    steps.indexOf(order.status);

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-6 py-32">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-black text-[#C6922B] mb-10">
          Order Tracking
        </h1>

        {/* STATUS */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 mb-10">

          <h2 className="text-3xl font-black mb-10">
            Current Status:
            <span className="text-[#C6922B] ml-4">
              {order.status}
            </span>
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            {steps.map((step, index) => (

              <div
                key={step}
                className={`rounded-3xl p-6 border ${
                  index <= currentStep
                    ? "bg-[#C6922B] text-black border-[#C6922B]"
                    : "bg-black/30 border-white/10 text-white"
                }`}
              >

                <h3 className="text-xl font-black">
                  {step}
                </h3>

              </div>
            ))}

          </div>

        </div>

        {/* ORDER DETAILS */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-10">

          <h2 className="text-3xl font-black mb-8">
            Order Details
          </h2>

          <div className="space-y-5 text-lg">

            <p>
              <span className="text-gray-400">
                Name:
              </span>{" "}
              {order.name}
            </p>

            <p>
              <span className="text-gray-400">
                Phone:
              </span>{" "}
              {order.phone}
            </p>

            <p>
              <span className="text-gray-400">
                Address:
              </span>{" "}
              {order.address}
            </p>

            <p>
              <span className="text-gray-400">
                Payment:
              </span>{" "}
              {order.paymentMethod}
            </p>

            <p>
              <span className="text-gray-400">
                Total:
              </span>{" "}
              ৳{order.total}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}