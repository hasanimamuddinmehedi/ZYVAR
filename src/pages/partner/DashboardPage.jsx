export default function DashboardPage() {

  return (

    <div>

      <h1 className="text-5xl font-black mb-10">

        Partner Dashboard

      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Total Products

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            0

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Orders

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            0

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Revenue

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            ৳0

          </h2>

        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">

          <p className="text-gray-400 mb-3">

            Rating

          </p>

          <h2 className="text-4xl font-black text-[#C6922B]">

            0★

          </h2>

        </div>

      </div>

    </div>
  );
}