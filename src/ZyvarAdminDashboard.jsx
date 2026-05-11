export default function ZyvarAdminDashboard() {
  const stats = [
    {
      title: "Total Sales",
      value: "৳4,85,000",
      growth: "+18%",
    },
    {
      title: "Orders",
      value: "1,248",
      growth: "+12%",
    },
    {
      title: "Products",
      value: "326",
      growth: "+8%",
    },
    {
      title: "Customers",
      value: "2,940",
      growth: "+22%",
    },
  ];

  const recentOrders = [
    {
      id: "#ZY1021",
      customer: "Hasan Mehedi",
      product: "Omega Seamaster",
      amount: "৳18,500",
      status: "Delivered",
    },
    {
      id: "#ZY1022",
      customer: "Ariana Sultana",
      product: "Lattafa Yara",
      amount: "৳3,200",
      status: "Pending",
    },
    {
      id: "#ZY1023",
      customer: "Nusrat Jahan",
      product: "Luxury Party Bag",
      amount: "৳4,850",
      status: "Processing",
    },
    {
      id: "#ZY1024",
      customer: "Rafsan Rahman",
      product: "CeraVe Cream",
      amount: "৳2,450",
      status: "Delivered",
    },
  ];

  const products = [
    {
      name: "CeraVe Moisturizing Cream",
      stock: "42",
      price: "৳2,450",
      category: "Skincare",
    },
    {
      name: "Omega Seamaster",
      stock: "8",
      price: "৳18,500",
      category: "Watch",
    },
    {
      name: "Lattafa Yara",
      stock: "15",
      price: "৳3,200",
      category: "Perfume",
    },
    {
      name: "Luxury Party Bag",
      stock: "24",
      price: "৳4,850",
      category: "Fashion",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex">
      
      {/* SIDEBAR */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-2xl p-8 sticky top-0 h-screen">
        
        <div className="mb-16">
          <h1 className="text-4xl font-black tracking-[0.3em] text-[#D4AF37]">
            ZYVAR
          </h1>

          <p className="text-gray-400 mt-3 uppercase text-xs tracking-[0.25em]">
            Admin Dashboard
          </p>
        </div>

        <nav className="space-y-4">

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#D4AF37] text-black font-bold">
            📊 Dashboard
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            🛍 Products
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            📦 Orders
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            👥 Customers
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            📈 Analytics
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
            ⚙ Settings
          </button>
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#111111] p-6">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-3">
            Premium Access
          </h3>

          <p className="text-gray-400 leading-relaxed mb-5">
            Upgrade your store analytics & ecommerce management tools.
          </p>

          <button className="w-full py-4 rounded-2xl bg-[#D4AF37] text-black font-black">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-hidden">

        {/* TOPBAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">

          <div>
            <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-3">
              Welcome Back
            </p>

            <h2 className="text-4xl md:text-5xl font-black">
              Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">

            <input
              type="text"
              placeholder="Search..."
              className="flex-1 lg:w-80 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

            <button className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-black text-xl">
              🔔
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

          {stats.map((item, index) => (
            <div
              key={index}
              className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-[#D4AF37] transition duration-300"
            >
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-5">
                {item.title}
              </p>

              <h3 className="text-4xl font-black mb-4">
                {item.value}
              </h3>

              <span className="inline-flex px-4 py-2 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-sm font-semibold">
                {item.growth}
              </span>
            </div>
          ))}
        </div>

        {/* ANALYTICS + RECENT ORDERS */}
        <div className="grid xl:grid-cols-3 gap-10 mb-12">

          {/* SALES CHART */}
          <div className="xl:col-span-2 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black">
                Sales Analytics
              </h3>

              <button className="px-5 py-3 rounded-xl border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
                Monthly
              </button>
            </div>

            <div className="h-[320px] flex items-end gap-5">

              {[45, 60, 75, 55, 90, 70, 100].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-3xl bg-gradient-to-t from-[#D4AF37] to-yellow-300 hover:opacity-80 transition"
                  style={{ height: `${height}%` }}
                />
              ))}

            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

            <h3 className="text-3xl font-black mb-10">
              Quick Actions
            </h3>

            <div className="space-y-5">

              <button className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-[1.02] transition duration-300">
                + Add New Product
              </button>

              <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
                Manage Orders
              </button>

              <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
                Customer Messages
              </button>

              <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
                Inventory Control
              </button>

            </div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 mb-12 overflow-x-auto">

          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black">
              Recent Orders
            </h3>

            <button className="px-5 py-3 rounded-xl border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
              View All
            </button>
          </div>

          <table className="w-full min-w-[700px]">

            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-5">Order ID</th>
                <th className="pb-5">Customer</th>
                <th className="pb-5">Product</th>
                <th className="pb-5">Amount</th>
                <th className="pb-5">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-6 font-semibold">
                    {order.id}
                  </td>

                  <td className="py-6">
                    {order.customer}
                  </td>

                  <td className="py-6">
                    {order.product}
                  </td>

                  <td className="py-6 text-[#D4AF37] font-bold">
                    {order.amount}
                  </td>

                  <td className="py-6">
                    <span className="px-4 py-2 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-sm font-semibold">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* INVENTORY */}
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black">
              Inventory
            </h3>

            <button className="px-5 py-3 rounded-xl border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition">
              Manage Stock
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            {products.map((product, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-black/20 p-6 hover:border-[#D4AF37] transition"
              >
                <p className="text-[#D4AF37] uppercase tracking-widest text-xs mb-3">
                  {product.category}
                </p>

                <h4 className="text-2xl font-bold mb-5 leading-snug">
                  {product.name}
                </h4>

                <div className="flex justify-between text-gray-300 mb-5">
                  <span>Stock:</span>
                  <span>{product.stock}</span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[#D4AF37] text-2xl font-black">
                    {product.price}
                  </p>

                  <button className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold">
                    Edit
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}