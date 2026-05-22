import {
  useParams,
  useNavigate,
} from "react-router-dom";

export default function OrderSuccess() {

  const { id } = useParams();

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">

      <div className="max-w-2xl w-full rounded-[40px] border border-white/10 bg-white/5 p-10 text-center">

        <div className="text-7xl mb-6">
          🎉
        </div>

        <h1 className="text-5xl font-black text-[#C6922B] mb-6">
          Order Successful
        </h1>

        <p className="text-gray-300 text-lg mb-6">
          Thank you for shopping with ZYVAR.
        </p>

        <div className="rounded-3xl bg-black/30 border border-white/10 p-6 mb-8">

          <p className="text-gray-400 mb-2">
            Your Order ID
          </p>

          <h2 className="text-3xl font-black text-[#C6922B] break-all">
            {id}
          </h2>

        </div>

        <div className="flex flex-col md:flex-row gap-4">

          <button
            onClick={() =>
              navigate(`/order-tracking/${id}`)
            }
            className="flex-1 py-5 rounded-2xl bg-[#C6922B] text-black font-black"
          >
            Track Order
          </button>

          <button
            onClick={() =>
              navigate("/my-orders")
            }
            className="flex-1 py-5 rounded-2xl border border-white/10 bg-white/5"
          >
            My Orders
          </button>

        </div>

      </div>

    </div>
  );
}