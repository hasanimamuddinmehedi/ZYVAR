import {
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  FaChartLine,
  FaPlus,
  FaBoxOpen,
  FaShoppingBag,
  FaStar,
  FaMoneyBillWave,
  FaCog,
} from "react-icons/fa";

export default function PartnerLayout() {

  const menu = [

    {
      name: "Dashboard",
      icon: <FaChartLine />,
      path: "/partner-dashboard",
    },

    {
      name: "Uploads",
      icon: <FaPlus />,
      path: "/partner-dashboard/uploads",
    },

    {
      name: "Products",
      icon: <FaBoxOpen />,
      path: "/partner-dashboard/products",
    },

    {
      name: "Orders",
      icon: <FaShoppingBag />,
      path: "/partner-dashboard/orders",
    },

    {
      name: "Reviews",
      icon: <FaStar />,
      path: "/partner-dashboard/reviews",
    },

    {
      name: "Earnings",
      icon: <FaMoneyBillWave />,
      path: "/partner-dashboard/earnings",
    },

    {
      name: "Settings",
      icon: <FaCog />,
      path: "/partner-dashboard/settings",
    },
  ];

  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <aside className="w-[280px] border-r border-white/10 bg-[#0A0A0A] p-6">

        <h1 className="text-3xl font-black text-[#C6922B] mb-10">

          ZYVAR Partner

        </h1>

        <div className="space-y-3">

          {
            menu.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/partner-dashboard"
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-4 rounded-2xl transition ${
                    isActive
                      ? "bg-[#C6922B] text-black font-bold"
                      : "bg-white/5 hover:bg-white/10"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))
          }

        </div>

      </aside>

      {/* CONTENT */}

      <main className="flex-1 p-10">

        <Outlet />

      </main>

    </div>
  );
}