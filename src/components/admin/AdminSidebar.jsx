import {
  FaChartPie,
  FaBoxOpen,
  FaShoppingBag,
  FaCog,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../../firebase/firebase";

export default function AdminSidebar() {

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {

      await signOut(auth);

      localStorage.removeItem(
        "zyvar-admin"
      );

      navigate(
        "/admin-login"
      );
    };

  const navClass =
    ({ isActive }) =>

      `w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition duration-300 ${
        isActive
          ? "bg-[#C6922B] text-black font-black shadow-xl shadow-yellow-500/10"
          : "border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
      }`;

  return (

    <aside

      className="
      hidden lg:flex
      fixed
      left-0
      top-0
      z-50
      w-[280px]
      h-screen
      flex-col
      justify-between
      bg-[#111111]/95
      backdrop-blur-2xl
      border-r
      border-white/10
      p-6
      overflow-y-auto
    "
    >

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="mb-14">

          <div className="flex items-center gap-4 mb-5">

            <div className="w-14 h-14 rounded-3xl bg-[#C6922B]/15 border border-[#C6922B]/20 flex items-center justify-center">

              <span className="text-[#C6922B] text-2xl font-black">
                Z
              </span>

            </div>

            <div>

              <h1 className="text-4xl font-black tracking-[0.3em] text-[#C6922B] leading-none">
                ZYVAR
              </h1>

              <p className="text-gray-400 mt-2 uppercase text-[10px] tracking-[0.35em]">
                Ultimate Admin Panel
              </p>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="space-y-4">

          <NavLink
            to="/admin/dashboard"
            className={navClass}
          >

            <FaChartPie className="text-lg" />

            Dashboard

          </NavLink>

          <NavLink
            to="/admin/upload"
            className={navClass}
          >

            <FaPlus className="text-lg" />

            Upload Product

          </NavLink>

          <NavLink
            to="/admin/products"
            className={navClass}
          >

            <FaBoxOpen className="text-lg" />

            Products

          </NavLink>

          <NavLink
            to="/admin/orders"
            className={navClass}
          >

            <FaShoppingBag className="text-lg" />

            Orders

          </NavLink>

          <NavLink
            to="/admin/settings"
            className={navClass}
          >

            <FaCog className="text-lg" />

            Settings

          </NavLink>

          <NavLink
  to="/admin/product-requests"
  className={navClass}
>
  Product Requests
</NavLink>

        </nav>

      </div>

      {/* BOTTOM CARD */}
      <div className="rounded-[35px] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#101010] p-6 mt-10 relative overflow-hidden">

        {/* GLOW */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C6922B]/10 blur-[80px]" />

        <div className="relative z-10">

          <h3 className="text-2xl font-black text-[#C6922B] mb-4">
            ZYVAR Premium
          </h3>

          <p className="text-gray-400 leading-relaxed mb-6">
            Manage your complete ecommerce business from one powerful dashboard.
          </p>

          <button

            onClick={handleLogout}

            className="w-full py-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-3 hover:opacity-90 transition duration-300"
          >

            <FaSignOutAlt />

            Logout Admin

          </button>

        </div>

      </div>

    </aside>
  );
}