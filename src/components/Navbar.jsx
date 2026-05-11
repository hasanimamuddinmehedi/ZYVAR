import { Link, useNavigate } from "react-router-dom";

import { signOut }
from "firebase/auth";

import { auth }
from "../firebase/firebase";

export default function Navbar() {

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {

      await signOut(auth);

      navigate("/");
    };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 sm:py-5 flex items-center justify-between">

        <h1 className="text-3xl font-black tracking-[0.3em] text-[#D4AF37]">
          ZYVAR
        </h1>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 text-sm uppercase tracking-widest">

          <Link
            to="/"
            className="hover:text-[#D4AF37] transition"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="hover:text-[#D4AF37] transition"
          >
            Products
          </Link>

          <Link
            to="/wishlist"
            className="hover:text-[#D4AF37] transition"
          >
            Wishlist
          </Link>

          <Link
            to="/cart"
            className="hover:text-[#D4AF37] transition"
          >
            Cart
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button className="text-white text-2xl">
            ☰
          </button>
        </div>

        <div className="flex items-center gap-4">

          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-[#D4AF37] text-black font-bold"
          >
            Login
          </Link>

          <button

            onClick={handleLogout}

            className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold"
          >

            Logout

          </button>

        </div>

      </div>

    </nav>
  );
}