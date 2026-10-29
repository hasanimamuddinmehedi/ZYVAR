import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../firebase/firebase";

export default function DashboardPage() {

  const [stats, setStats] =
    useState({
      totalProducts: 0,
      orders: 0,
      revenue: 0,
      rating: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    let cancelled = false;

    const loadStats =
      async () => {

        const user =
          auth.currentUser;

        if (!user) {

          setError(
            "Unable to load dashboard statistics: no signed-in partner was found."
          );

          setLoading(false);

          return;
        }

        try {

          const [
            partnerSnapshot,
            productsSnapshot,
            ordersSnapshot,
          ] = await Promise.all([
            getDoc(
              doc(
                db,
                "partners",
                user.uid
              )
            ),
            getDocs(
              query(
                collection(db, "products"),
                where("partnerId", "==", user.uid)
              )
            ),
            getDocs(
              collection(db, "orders")
            ),
          ]);

          const partner =
            partnerSnapshot.data();

          if (!partner?.slug) {

            throw new Error(
              "The partner store profile or slug could not be found."
            );
          }

          const partnerOrders =
            ordersSnapshot.docs
              .map((orderDocument) => {

                const order =
                  orderDocument.data();

                const items =
                  Array.isArray(order.items)
                    ? order.items.filter(
                        (item) =>
                          (item.partnerSlug || "zyvar") ===
                          partner.slug
                      )
                    : [];

                if (!items.length) {
                  return null;
                }

                const subtotal =
                  items.reduce(
                    (total, item) =>
                      total +
                      Number(item.price || 0) *
                        Number(item.quantity || 1),
                    0
                  );

                return {
                  status: order.status,
                  subtotal,
                };
              })
              .filter(Boolean);

          const commissionRate =
            partner.commissionRate != null
              ? Number(partner.commissionRate)
              : 0.1;

          const revenue =
            partnerOrders
              .filter(
                (order) =>
                  order.status?.toLowerCase() ===
                  "delivered"
              )
              .reduce(
                (total, order) =>
                  total +
                  order.subtotal *
                    (1 - commissionRate),
                0
              );

          if (!cancelled) {

            setStats({
              totalProducts:
                productsSnapshot.size,
              orders:
                partnerOrders.length,
              revenue,
              rating:
                Number(partner.rating) || 0,
            });
          }

        } catch (loadError) {

          console.error(
            "Unable to load partner dashboard statistics:",
            loadError
          );

          if (!cancelled) {
            setError(
              "Unable to load dashboard statistics. Please refresh and try again."
            );
          }

        } finally {

          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadStats();

    return () => {
      cancelled = true;
    };

  }, []);

  const statValue = (value) =>
    loading
      ? "…"
      : value.toLocaleString("en-BD");

  return (

    <div>

      <h1 className="text-5xl font-black mb-10">

        Partner Dashboard

      </h1>

      {error && (
        <p
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Total Products

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            {statValue(stats.totalProducts)}

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Orders

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            {statValue(stats.orders)}

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Revenue

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            ৳{statValue(Math.round(stats.revenue))}

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Rating

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            {statValue(stats.rating)}★

          </h2>

        </div>

      </div>

    </div>
  );
}