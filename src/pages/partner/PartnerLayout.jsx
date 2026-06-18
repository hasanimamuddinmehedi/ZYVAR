import {
  useState,
} from "react";

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
  FaBars,
  FaTimes,
} from "react-icons/fa";

import Navbar from "../../components/Navbar";

export default function PartnerLayout() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    <div className="min-h-screen bg-black text-white">

      {/* SITE NAVBAR (fixed, h-16) */}

      <Navbar />

      {/* DESKTOP SIDEBAR — sits below the fixed navbar */}

      <aside
        className="
        hidden
        lg:flex
        lg:flex-col
        fixed
        top-16
        left-0
        h-[calc(100vh-4rem)]
        w-[280px]
        border-r border-white/10
        bg-[#0A0A0A]
        p-6
        z-30
      "
      >

        <h1 className="text-3xl font-black text-[#C6922B] mb-10">

          ZYVAR Partner

        </h1>

        <div className="space-y-3 overflow-y-auto">

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

      {/* MOBILE PARTNER MENU TRIGGER — floating bar below navbar, mobile/tablet only */}

      <div
        className="
        lg:hidden
        fixed
        top-16
        left-0
        w-full
        z-30
        bg-[#0A0A0A]
        border-b border-white/10
        px-4
        h-14
        flex items-center justify-between
      "
      >

        <span className="text-base font-black text-[#C6922B]">

          ZYVAR Partner

        </span>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open partner menu"
          className="
          flex items-center justify-center
          w-10 h-10
          rounded-xl
          bg-white/5
          hover:bg-white/10
          text-white
          transition
        "
        >

          <FaBars size={16} />

        </button>

      </div>

      {/* MOBILE PARTNER MENU — backdrop + slide-in drawer, built inline (no extra files) */}

      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`
        lg:hidden
        fixed inset-0
        bg-black/70
        z-40
        transition-opacity duration-300
        ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }
      `}
      />

      <aside
        className={`
        lg:hidden
        fixed top-0 left-0
        h-screen
        w-[280px]
        bg-[#0A0A0A]
        border-r border-white/10
        p-6
        z-50
        transform transition-transform duration-300
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
      >

        <div className="flex items-center justify-between mb-10">

          <h1 className="text-2xl font-black text-[#C6922B]">

            ZYVAR Partner

          </h1>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close partner menu"
            className="
            flex items-center justify-center
            w-9 h-9
            rounded-full
            bg-white/5
            hover:bg-white/10
            text-white
            transition
          "
          >

            <FaTimes size={16} />

          </button>

        </div>

        <div className="space-y-3 overflow-y-auto">

          {
            menu.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/partner-dashboard"
                }
                onClick={() => setIsMobileMenuOpen(false)}
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

      {/* MAIN CONTENT */}

      <main
        className="
        min-h-screen
        w-full
        pt-[7.5rem]
        lg:pt-16
        lg:pl-[280px]
        overflow-x-hidden
      "
      >

        <div
          className="
          p-4
          md:p-8
        "
        >

          <Outlet />

        </div>

      </main>

    </div>
  );
}