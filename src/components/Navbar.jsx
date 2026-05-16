import { useState } from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Phone,
  Info,
} from "lucide-react";

export default function Navbar() {

  const [menuOpen, setMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const isLoggedIn =
    localStorage.getItem(
      "zyvar-user"
    ) === "true";

  // HIDE NAVBAR ON LOGIN & SIGNUP
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup"
  ) {

    return null;
  }

  const handleLogout = () => {

    localStorage.removeItem(
      "zyvar-user"
    );

    navigate("/login");
  };

  return (

    <header className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        <div className="h-16 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-6">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3"
            >

              {/* LOGO IMAGE */}
              <div className="w-9 h-9 flex items-center justify-center">

  <img
    src="https://res.cloudinary.com/dhppdatrl/image/upload/v1778734083/w3ehnytbwrugrxptj9py.png"
    alt="ZYVAR Logo"

    className="
      w-full
      h-full
      object-contain
    "
  />

</div>

              {/* BRAND NAME */}
              <h1 className="text-xl font-black  tracking-[0.2em] text-[#C6922B]">

                ZYVAR

              </h1>

            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden lg:flex items-center gap-8 text-white">

              <Link
                to="/"
                className="flex items-center gap-2 hover:text-[#C6922B] transition"
              >

                <Home size={18} />

                Home

              </Link>

              <Link
                to="/products"
                className="flex items-center gap-2 hover:text-[#C6922B] transition"
              >

                <ShoppingBag size={18} />

                Products

              </Link>

              <Link
                to="/about"
                className="flex items-center gap-2 hover:text-[#C6922B] transition"
              >

                <Info size={18} />

                About

              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-2 hover:text-[#C6922B] transition"
              >

                <Phone size={18} />

                Contact

              </Link>

            </nav>

          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-4 text-white">

            {/* SOCIALS */}
            <div className="flex items-center gap-3 mr-4">

              <a
                href="https://www.facebook.com/zyvar.shop"
                target="_blank"
                rel="noreferrer"

                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
              >

                <FaFacebookF />

              </a>

              <a
                href="https://www.instagram.com/zyvar.shop"
                target="_blank"
                rel="noreferrer"

                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
              >

                <FaInstagram />

              </a>

            </div>

            {/* Wishlist */}
            <button
              onClick={() =>
                navigate("/wishlist")
              }

              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <Heart size={20} />

            </button>

            {/* Cart */}
            <button
              onClick={() =>
                navigate("/cart")
              }

              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <ShoppingBag size={20} />

            </button>

            {/* Profile */}
            <button
              onClick={() =>
                navigate("/profile")
              }

              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <User size={20} />

            </button>

            {/* LOGIN / LOGOUT */}
            {!isLoggedIn ? (

              <>

                <button
                  onClick={() =>
                    navigate("/login")
                  }

                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
                >

                  <LogIn size={18} />

                  Login

                </button>

                <button
                  onClick={() =>
                    navigate("/signup")
                  }

                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition"
                >

                  <UserPlus size={18} />

                  Signup

                </button>

              </>

            ) : (

              <button
                onClick={handleLogout}

                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500 text-white font-bold hover:scale-105 transition"
              >

                <LogOut size={18} />

                Logout

              </button>

            )}

          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }

            className="lg:hidden w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-white flex items-center justify-center"
          >

            {menuOpen
              ? <X />
              : <Menu />}

          </button>

        </div>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (

        <div className="lg:hidden bg-black border-t border-white/10 text-white">

          <div className="px-6 py-6 flex flex-col gap-5">

            <Link
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <Home size={18} />

              Home

            </Link>

            <Link
              to="/products"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <ShoppingBag size={18} />

              Products

            </Link>

            <Link
              to="/about"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <Info size={18} />

              About

            </Link>

            <Link
              to="/contact"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <Phone size={18} />

              Contact

            </Link>

            <Link
              to="/wishlist"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <Heart size={18} />

              Wishlist

            </Link>

            <Link
              to="/cart"
              onClick={() =>
                setMenuOpen(false)
              }

              className="flex items-center gap-3"
            >

              <ShoppingBag size={18} />

              Cart

            </Link>

            {!isLoggedIn ? (

              <>

                <button
                  onClick={() => {

                    navigate("/login");

                    setMenuOpen(false);
                  }}

                  className="w-full py-4 rounded-2xl border border-white/10 bg-white/5"
                >

                  Login

                </button>

                <button
                  onClick={() => {

                    navigate("/signup");

                    setMenuOpen(false);
                  }}

                  className="w-full py-4 rounded-2xl bg-[#C6922B] text-black font-bold"
                >

                  Signup

                </button>

              </>

            ) : (

              <button
                onClick={() => {

                  handleLogout();

                  setMenuOpen(false);
                }}

                className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold"
              >

                Logout

              </button>

            )}

          </div>

        </div>

      )}

    </header>
  );
}