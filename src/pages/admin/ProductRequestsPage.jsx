import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "../../firebase/firebase";

import {
  FaBoxOpen,
  FaTrash,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

export default function ProductRequestsPage() {

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // FETCH REQUESTS
  useEffect(() => {

    fetchRequests();

  }, []);

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const querySnapshot =
        await getDocs(
          collection(
            db,
            "productRequests"
          )
        );

      const requestsData =
        querySnapshot.docs.map(
          (docItem) => ({

            id: docItem.id,

            ...docItem.data(),
          })
        );

      // LATEST FIRST
      requestsData.sort((a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setRequests(requestsData);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // DELETE REQUEST
  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this request?"
      );

    if (!confirmDelete) {

      return;
    }

    try {

      await deleteDoc(
        doc(
          db,
          "productRequests",
          id
        )
      );

      setRequests(
        requests.filter(
          (item) => item.id !== id
        )
      );

    } catch (error) {

      console.log(error);
    }
  };

  // MARK AS COMPLETED
  const handleComplete = async (
    id,
    request
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "productRequests",
          id
        ),
        {
          status: "completed",
        }
      );

      await fetch(
        "https://zyvar-email-server.onrender.com/product-request-complete",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            customerName:
              request.name,

            customerEmail:
              request.email,

            productName:
              request.productName,
          }),
        }
      );

      setRequests(
        requests.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "completed",
              }
            : item
        )
      );

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <div className="min-h-screen text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">

        <div>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-3">
            Admin Panel
          </p>

          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Product
            <span className="block text-[#C6922B]">
              Requests
            </span>
          </h1>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-6 min-w-[220px]">

          <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">
            Total Requests
          </p>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {requests.length}
          </h2>

        </div>

      </div>

      {/* LOADING */}
      {
        loading && (

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-gray-400">

            Loading Requests...

          </div>
        )
      }

      {/* EMPTY */}
      {
        !loading &&
        requests.length === 0 && (

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-14 text-center">

            <div className="w-24 h-24 mx-auto rounded-full bg-[#C6922B]/10 flex items-center justify-center mb-8 text-[#C6922B] text-4xl">

              <FaBoxOpen />

            </div>

            <h2 className="text-3xl font-black mb-4">
              No Product Requests Yet
            </h2>

            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Customer requested products will appear here.
            </p>

          </div>
        )
      }

      {/* REQUESTS */}
      {
        !loading &&
        requests.length > 0 && (

          <div className="grid gap-8">

            {
              requests.map((request) => (

                <div
                  key={request.id}
                  className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8"
                >

                  {/* TOP */}
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-8">

                    <div className="space-y-4 flex-1">

                      <div className="flex flex-wrap items-center gap-4">

                        <div className="px-5 py-2 rounded-full bg-[#C6922B]/10 border border-[#C6922B]/20 text-[#C6922B] font-bold uppercase tracking-widest text-xs">

                          Requested Product

                        </div>

                        {
                          request.status === "completed"
                            ? (

                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">

                                <FaCheckCircle />
                                Completed

                              </div>
                            )
                            : (

                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold">

                                <FaClock />
                                Pending

                              </div>
                            )
                        }

                      </div>

                      <div>

                        <h2 className="text-3xl font-black mb-3 text-[#C6922B] leading-tight">
                          {request.productName || "Unnamed Product"}
                        </h2>

                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {request.message || "No additional message provided."}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-4">

                      {
                        request.status !== "completed" && (

                          <button
                            onClick={() =>
                              handleComplete(
                                request.id,
                                request
                              )
                            }
                            className="px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-[1.02] transition flex items-center gap-3"
                          >

                            <FaCheckCircle />
                            Mark Completed

                          </button>
                        )
                      }

                      <button
                        onClick={() =>
                          handleDelete(request.id)
                        }
                        className="px-6 py-4 rounded-2xl bg-red-500 text-white font-black hover:opacity-90 transition flex items-center gap-3"
                      >

                        <FaTrash />
                        Delete

                      </button>

                    </div>

                  </div>

                  {/* CUSTOMER INFO */}
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                        Customer Name
                      </p>

                      <h3 className="text-lg font-bold break-words">
                        {request.name || "Logged In User"}
                      </h3>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                        Phone Number
                      </p>

                      <h3 className="text-lg font-bold break-words">
                        {request.phone || "Not Provided"}
                      </h3>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                        User Email
                      </p>

                      <h3 className="text-lg font-bold break-words">
                        {request.email || "Guest User"}
                      </h3>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                        Requested At
                      </p>

                      <h3 className="text-lg font-bold break-words">
                        {
                          request.createdAt?.seconds
                            ? new Date(
                                request.createdAt.seconds * 1000
                              ).toLocaleString()
                            : "Unknown"
                        }
                      </h3>

                    </div>

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