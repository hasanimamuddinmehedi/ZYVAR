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
  FaClipboardList,
  FaHandshake,
  FaTicketAlt,
  FaUsers,
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
        <div className="flex items-center gap-3">

          <img
            src="https://res.cloudinary.com/dhppdatrl/image/upload/v1778734083/w3ehnytbwrugrxptj9py.png"
            alt="ZYVAR Logo"
            className="w-9 h-9 rounded-xl object-contain"
          />

          <div className="text-center">

            <h1 className="text-2xl font-black tracking-[0.25em] text-[#C6922B] leading-none">
              ZYVAR
            </h1>

            <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mt-1">
              Admin Panel
            </p>

          </div>

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
          className={`absolute left-0 top-0 h-full w-72 bg-[#111111]/95 backdrop-blur-2xl border-r border-white/10 p-6 transition-transform duration-300 flex flex-col justify-between overflow-y-auto scrollbar-none ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >

          {/* Hides scrollbar in WebKit (Chrome, Safari) */}
          <style>{`
            .mobile-sidebar-inner::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* TOP */}
          <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-12">

              <div className="flex items-center gap-3">

                <img
                  src="https://res.cloudinary.com/dhppdatrl/image/upload/v1778734083/w3ehnytbwrugrxptj9py.png"
                  alt="ZYVAR Logo"
                  className="w-12 h-12 rounded-2xl object-contain"
                />

                <div>

                  <h2 className="text-3xl font-black tracking-[0.25em] text-[#C6922B]">
                    ZYVAR
                  </h2>

                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2">
                    Mobile Admin
                  </p>

                </div>

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

              {/* 1. Dashboard */}
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

              {/* 2. Upload Product */}
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

              {/* 3. Products */}
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

              {/* 4. Orders */}
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

              {/* 5. Product Requests */}
              <NavLink
                to="/admin/product-requests"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >
                <FaClipboardList />
                Product Requests
              </NavLink>

              {/* 6. Partner Applications */}
              <NavLink
                to="/admin/partner-applications"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >
                <FaHandshake />
                Partner Applications
              </NavLink>

              {/* 7. Partner Coupons */}
              <NavLink
                to="/admin/partner-coupons"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >
                <FaTicketAlt />
                Partner Coupons
              </NavLink>

              {/* 8. Users */}
              <NavLink
                to="/admin/users"
                onClick={() =>
                  setOpen(false)
                }
                className={navClass}
              >
                <FaUsers />
                Users
              </NavLink>

              {/* 9. Settings */}
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
          <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-5 relative overflow-hidden mt-10">

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