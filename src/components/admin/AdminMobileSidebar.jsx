import {
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FaChartPie,
  FaBoxOpen,
  FaShoppingBag,
  FaCog,
  FaPlus,
} from "react-icons/fa";

export default function AdminMobileSidebar() {

  const [open,
    setOpen] =
    useState(false);

  const navigate =
    useNavigate();

  const navClass =
    ({ isActive }) =>

      `flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition duration-300 ${
        isActive
          ? "bg-[#C6922B] text-black font-black"
          : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
      }`;

  return (

    <>

      {/* TOPBAR */}
      <div
        className="
        lg:hidden
        fixed
        top-0
        left-0
        right-0
        z-50
        h-20
        border-b
        border-white/10
        bg-[#0B0B0B]/95
        backdrop-blur-2xl
        flex
        items-center
        justify-between
        px-5
      "
      >

        {/* MENU BUTTON */}
        <button

          onClick={() =>
            setOpen(true)
          }

          className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-xl hover:border-[#C6922B] transition duration-300"
        >

          ☰

        </button>

        {/* LOGO */}
        <div className="text-center">

          <h1 className="text-2xl font-black tracking-[0.25em] text-[#C6922B] leading-none">
            ZYVAR
          </h1>

          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mt-1">
            Admin Panel
          </p>

        </div>

        {/* BACK BUTTON */}
        <button

          onClick={() =>
            navigate("/profile")
          }

          className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-[#C6922B] hover:border-[#C6922B] transition duration-300"
        >

          Back

        </button>

      </div>

      {/* DRAWER */}
      <div

        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      >

        {/* OVERLAY */}
        <div

          onClick={() =>
            setOpen(false)
          }

          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* SIDEBAR */}
        <div

          className={`absolute left-0 top-0 h-full w-72 bg-[#111111]/95 backdrop-blur-2xl border-r border-white/10 p-6 transition-transform duration-300 flex flex-col justify-between ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >

          {/* TOP */}
          <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-12">

              <div>

                <h2 className="text-3xl font-black tracking-[0.25em] text-[#C6922B]">
                  ZYVAR
                </h2>

                <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2">
                  Mobile Admin
                </p>

              </div>

              <button

                onClick={() =>
                  setOpen(false)
                }

                className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-2xl hover:border-[#C6922B] transition duration-300"
              >

                ✕

              </button>

            </div>

            {/* NAVIGATION */}
            <div className="space-y-4">

              <NavLink
                to="/admin/dashboard"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >

                <FaChartPie />

                Dashboard

              </NavLink>

              <NavLink
                to="/admin/upload"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >

                <FaPlus />

                Upload Product

              </NavLink>

              <NavLink
                to="/admin/products"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >

                <FaBoxOpen />

                Products

              </NavLink>

              <NavLink
                to="/admin/orders"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >

                <FaShoppingBag />

                Orders

              </NavLink>

              <NavLink
                to="/admin/settings"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >

                <FaCog />

                Settings

              </NavLink>

            </div>

          </div>

          {/* FOOTER CARD */}
          <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-5 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C6922B]/10 blur-[60px]" />

            <div className="relative z-10">

              <h3 className="text-xl font-black text-[#C6922B] mb-3">
                ZYVAR Premium
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Manage products, orders and customers from your mobile dashboard.
              </p>

            </div>

          </div>

        </div>

      </div>

    </>
  );
}