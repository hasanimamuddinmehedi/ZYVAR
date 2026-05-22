import {
  useNavigate,
} from "react-router-dom";

import {
  FaBell,
  FaSearch,
} from "react-icons/fa";

export default function AdminNavbar() {

  const navigate =
    useNavigate();

  return (

    <header
      className="
      fixed
      top-0
      right-0
      left-0
      lg:left-[280px]
      z-40
      h-24
      border-b
      border-white/10
      bg-[#0B0B0B]/90
      backdrop-blur-2xl
    "
    >

      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-6">

        {/* LEFT */}
        <div>

          <p className="text-[#C6922B] uppercase tracking-[0.3em] text-xs mb-2">
            Admin Dashboard
          </p>

          <h1 className="text-2xl md:text-3xl font-black">
            Welcome Back
          </h1>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div className="hidden md:flex items-center gap-3 px-5 h-14 rounded-2xl border border-white/10 bg-white/5">

            <FaSearch className="text-gray-500" />

            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm placeholder:text-gray-500"
            />

          </div>

          {/* NOTIFICATION */}
          <button
            className="
            w-14
            h-14
            rounded-2xl
            border
            border-white/10
            bg-white/5
            flex
            items-center
            justify-center
            hover:border-[#C6922B]
            transition
          "
          >

            <FaBell />

          </button>

          {/* PROFILE */}
          <button

            onClick={() =>
              navigate("/profile")
            }

            className="
            px-6
            h-14
            rounded-2xl
            bg-[#C6922B]
            text-black
            font-black
            hover:scale-105
            transition
          "
          >

            Profile

          </button>

        </div>

      </div>

    </header>
  );
}