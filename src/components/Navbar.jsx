import {
  useState,
  useEffect,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { createPortal } from "react-dom";

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
  Search,
  Store,
} from "lucide-react";

// FIREBASE
import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  signOut,
} from "firebase/auth";

import { auth, db } from "../firebase/firebase";

import RequestProductModal from "./RequestProductModal";
import NotificationCenter from "./NotificationCenter";

// SLUG UTILITY
const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export default function Navbar() {

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showSearch,
    setShowSearch] =
    useState(false);

  const [search,
    setSearch] =
    useState("");

  const [requestOpen,
    setRequestOpen] =
    useState(false);

  const [products,
    setProducts] =
    useState([]);

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.classList.add("zyvar-public-menu-open");
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    window.dispatchEvent(
      new CustomEvent("zyvar:public-menu", { detail: { open: true } }),
    );

    return () => {
      document.body.classList.remove("zyvar-public-menu-open");
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
      window.dispatchEvent(
        new CustomEvent("zyvar:public-menu", { detail: { open: false } }),
      );
    };
  }, [menuOpen]);

  const isLoggedIn =
    localStorage.getItem(
      "zyvar-user"
    ) === "true";

  // FETCH PRODUCTS FROM FIREBASE
  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          const querySnapshot =
            await getDocs(
              collection(
                db,
                "products"
              )
            );

          const productsData =
            querySnapshot.docs.map(
              (doc) => ({

                _id: doc.id,

                ...doc.data(),
              })
            );

          setProducts(
            productsData
          );

        } catch (error) {

          console.log(
            "Firebase Fetch Error:",
            error
          );
        }
      };

    fetchProducts();

  }, []);

  // SEARCHABLE ITEMS
  const searchableItems = [

    {
      name: "Home",
      path: "/",
    },

    {
      name: "Products",
      path: "/products",
    },

    {
      name: "Stores",
      path: "/stores",
    },

    {
      name: "About",
      path: "/about",
    },

    {
      name: "Contact",
      path: "/contact",
    },

    {
      name: "Wishlist",
      path: "/wishlist",
    },

    {
      name: "Cart",
      path: "/cart",
    },

    {
      name: "Profile",
      path: "/profile",
    },

    {
      name: "My Orders",
      path: "/my-orders",
    },

    // REAL PRODUCTS — clean slug URL: /product/product-name
    ...products.map(
      (product) => ({

        name:
          product.name || "",

        path:
          `/product/${product.slug || toSlug(product.name)}`,

        image:
          product.image,

        price:
          product.price,

        isProduct: true,
      })
    ),
  ];

  // FILTER SEARCH RESULTS
  const filteredResults =
    searchableItems.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // HIDE NAVBAR ON LOGIN & SIGNUP
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup"
  ) {

    return null;
  }

  // LOGOUT
  // FIX: the previous version only cleared the "zyvar-user" localStorage flag and
  // navigated to /login — it never actually signed the user out of Firebase Auth.
  // This meant auth.currentUser remained populated after "logout", which (combined
  // with any code checking auth.currentUser as a fallback) could silently log the
  // user right back in the moment they landed on /login. signOut(auth) is now called
  // first so Firebase's own session is properly terminated, then local data is cleared.
  const handleLogout =
    async () => {

      try {

        await signOut(auth);

      } catch (error) {

        console.log(
          "Firebase signOut error:",
          error
        );
      }

      localStorage.removeItem(
        "zyvar-user"
      );

      localStorage.removeItem(
        "zyvar-user-id"
      );

      localStorage.removeItem(
        "zyvar-user-data"
      );

      localStorage.removeItem(
        "zyvar-remember"
      );

      navigate("/login");
    };

  return (
    <>

    <header className="site-navbar-glass fixed left-1/2 top-2 z-50 w-[calc(100%-1rem)] max-w-[1450px] -translate-x-1/2 rounded-[22px] border border-[#C6922B]/25 bg-[#0B0B0B]/65 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:top-3 sm:w-[calc(100%-2rem)]">

      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8">

        <div className="h-14 flex items-center justify-between lg:h-16">

          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3 lg:gap-4">

            {/* LOGO */}
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2"
            >

              {/* LOGO IMAGE */}
              <div className="w-8 h-8 flex items-center justify-center">

                <img
                  src="/android-chrome-192x192.png"
                  alt="ZYVAR Logo"
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />

              </div>

              {/* BRAND NAME */}
              <h1 className="text-base font-black tracking-[0.14em] text-[#C6922B] xl:text-lg">

                ZYVAR

              </h1>

            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden lg:flex items-center gap-3 text-white text-xs xl:gap-4 xl:text-[13px]">

              <Link
                to="/"
                className="flex items-center gap-1.5 hover:text-[#C6922B] transition"
              >

                <Home size={16} />

                Home

              </Link>

              <Link
                to="/products"
                className="flex items-center gap-1.5 hover:text-[#C6922B] transition"
              >

                <ShoppingBag size={16} />

                Products

              </Link>

              <Link
                to="/stores"
                className="flex items-center gap-1.5 hover:text-[#C6922B] transition"
              >

                <Store size={16} />

                Stores

              </Link>

              <Link
                to="/about"
                className="flex items-center gap-1.5 hover:text-[#C6922B] transition"
              >

                <Info size={16} />

                About

              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-1.5 hover:text-[#C6922B] transition"
              >

                <Phone size={16} />

                Contact

              </Link>

            </nav>

          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-1.5 text-white xl:gap-2">

            {/* SOCIALS */}
            <div className="hidden items-center gap-2 xl:mr-2 xl:flex">

              <a
                href="https://www.facebook.com/zyvar.shop"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs transition hover:border-[#C6922B] hover:text-[#C6922B]"
              >

                <FaFacebookF />

              </a>

              <a
                href="https://www.instagram.com/zyvar.shop"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs transition hover:border-[#C6922B] hover:text-[#C6922B]"
              >

                <FaInstagram />

              </a>

            </div>

            {/* SEARCH BUTTON */}
            <button

              onClick={() =>
                setShowSearch(
                  !showSearch
                )
              }

              className="
                w-9
                h-9
                rounded-xl
                border
                border-white/10
                bg-white/5
                flex
                items-center
                justify-center
                hover:border-[#D4AF37]
                hover:text-[#D4AF37]
                transition
              "
            >

              {
                showSearch

                  ? <X size={17} />

                  : <Search size={17} />
              }

            </button>

            {/* Wishlist */}
            <button
              onClick={() =>
                navigate("/wishlist")
              }
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <Heart size={17} />

            </button>

            {/* Cart */}
            <button
              onClick={() =>
                navigate("/cart")
              }
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <ShoppingBag size={17} />

            </button>

            {/* Profile */}
            <button
              onClick={() =>
                navigate("/profile")
              }
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <User size={17} />

            </button>

            <NotificationCenter />

            {/* LOGIN / LOGOUT */}
            {!isLoggedIn ? (

              <>

                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:border-[#C6922B] hover:text-[#C6922B]"
                >

                  <LogIn size={15} />

                  Login

                </button>

                <button
                  onClick={() =>
                    navigate("/signup")
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-[#C6922B] px-3 py-2 text-xs font-bold text-black transition hover:scale-105"
                >

                  <UserPlus size={15} />

                  Signup

                </button>

              </>

            ) : (

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:scale-105"
              >

                <LogOut size={15} />

                Logout

              </button>

            )}

          </div>

          {/* MOBILE RIGHT — search button only, no X here since menu has its own */}
          <div className="lg:hidden flex items-center gap-2">

            <NotificationCenter />

            {/* MOBILE SEARCH BUTTON */}
            <button

              onClick={() => {

                setShowSearch(
                  !showSearch
                );

                // CLOSE MENU WHEN OPENING SEARCH
                if (!showSearch) {
                  setMenuOpen(false);
                }
              }}

              className="
                w-9
                h-9
                rounded-xl
                border
                border-white/10
                bg-white/5
                text-white
                flex
                items-center
                justify-center
              "
            >

              {/* ONLY SHOW SEARCH ICON — X is handled inside the search bar */}
              <Search size={17} />

            </button>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => {

                setMenuOpen(!menuOpen);

                // CLOSE SEARCH WHEN OPENING MENU
                if (!menuOpen) {
                  setShowSearch(false);
                }
              }}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white flex items-center justify-center"
            >

              {menuOpen
                ? <X />
                : <Menu />}

            </button>

          </div>

        </div>

      </div>

      {/* FLOATING SEARCH BAR */}
      {
        showSearch && !requestOpen && (

          <div
            className="
              absolute
              top-full
              left-0
              w-full
              border-b
              border-white/10
              bg-[#0B0B0B]/95
              backdrop-blur-2xl
              p-4
              animate-in
              fade-in
              slide-in-from-top-2
              duration-300
            "
          >

            <div className="max-w-4xl mx-auto">

              <div
                className="
                  flex
                  items-center
                  gap-4
                  px-6
                  py-5
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/5
                "
              >

                <Search
                  size={22}
                  className="text-[#D4AF37]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search premium products..."
                  autoFocus
                  className="
                    flex-1
                    bg-transparent
                    outline-none
                    text-lg
                    text-white
                    placeholder:text-gray-500
                  "
                />

                {/* SINGLE CLOSE BUTTON INSIDE SEARCH BAR */}
                <button
                  onClick={() => {

                    setShowSearch(false);

                    setSearch("");
                  }}
                  className="
                    w-9
                    h-9
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    flex
                    items-center
                    justify-center
                    text-gray-400
                    hover:text-white
                    hover:border-white/30
                    transition
                    flex-shrink-0
                  "
                >
                  <X size={18} />
                </button>

              </div>

              <button
                onClick={() => {

                  // CLOSE SEARCH BAR
                  setShowSearch(false);

                  // CLOSE MOBILE MENU
                  setMenuOpen(false);

                  // OPEN REQUEST MODAL
                  setRequestOpen(true);
                }}
                className="
                  w-full
                  mt-4
                  py-4
                  rounded-2xl
                  border
                  border-[#C6922B]/20
                  bg-[#C6922B]/10
                  text-[#C6922B]
                  font-bold
                "
              >

                Can't find product?
                Request It

              </button>

              {/* SEARCH RESULTS */}
              {
                search.length > 0 && (

                  <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

                    {
                      filteredResults.length > 0 ? (

                        filteredResults.map(
                          (
                            item,
                            index
                          ) => (

                            <button
                              key={index}
                              onClick={() => {

                                navigate(
                                  item.path
                                );

                                setShowSearch(
                                  false
                                );

                                setSearch("");
                              }}
                              className="
                                w-full
                                text-left
                                px-6
                                py-4
                                border-b
                                border-white/10
                                text-white
                                hover:bg-white/10
                                hover:text-[#D4AF37]
                                transition
                                flex
                                items-center
                                gap-4
                              "
                            >

                              {
                                item.isProduct &&
                                item.image && (

                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="
                                      w-14
                                      h-14
                                      rounded-xl
                                      object-cover
                                      border
                                      border-white/10
                                    "
                                  />

                                )
                              }

                              <div>

                                <h3 className="font-semibold">

                                  {item.name}

                                </h3>

                                {
                                  item.isProduct && (

                                    <p className="text-sm text-[#D4AF37]">

                                      ৳{item.price}

                                    </p>

                                  )
                                }

                              </div>

                            </button>

                          )
                        )

                      ) : (

                        <div
                          className="
                            px-6
                            py-5
                            text-gray-400
                          "
                        >

                          No results found.

                        </div>

                      )
                    }

                  </div>

                )
              }

            </div>

          </div>
        )

      }

      {/* MOBILE MENU */}
      {menuOpen && createPortal(
        <div className="fixed inset-x-0 bottom-0 top-[4.5rem] z-[10001] overflow-hidden rounded-t-2xl border-t border-[#C6922B]/20 bg-[#0B0B0B]/85 text-white shadow-2xl backdrop-blur-2xl overscroll-contain lg:hidden">

        <div className="h-full overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7">

          {/* HEADER */}
          <div className="mb-5">

            <h2 className="text-xl font-black tracking-[0.12em] text-[#C6922B]">
              Explore Zyvar
            </h2>
          </div>

          {/* MOBILE NAV LINKS */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

            <Link
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <Home size={20} />

              Home

            </Link>

            <Link
              to="/products"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <ShoppingBag size={20} />

              Products

            </Link>

            <Link
              to="/stores"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <Store size={20} />

              Stores

            </Link>

            <Link
              to="/about"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <Info size={20} />

              About

            </Link>

            <Link
              to="/contact"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <Phone size={20} />

              Contact

            </Link>

            <Link
              to="/wishlist"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <Heart size={20} />

              Wishlist

            </Link>

            <Link
              to="/cart"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <ShoppingBag size={20} />

              Cart

            </Link>

            <Link
              to="/profile"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <User size={20} />

              Profile

            </Link>

            <Link
              to="/my-orders"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition sm:px-4"
            >

              <ShoppingBag size={20} />

              My Orders

            </Link>

          </div>

          {/* SOCIAL LINKS */}
          <div className="flex items-center gap-3 mt-5">

            <a
              href="https://www.facebook.com/zyvar.shop"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <FaFacebookF />

            </a>

            <a
              href="https://www.instagram.com/zyvar.shop"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              <FaInstagram />

            </a>

          </div>

          {/* LOGIN / LOGOUT */}
          <div className="pt-5">

            {!isLoggedIn ? (

              <div className="grid grid-cols-2 gap-2.5">

                <button
                  onClick={() => {

                    navigate("/login");

                    setMenuOpen(false);
                  }}
                  className="w-full min-h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-2 text-sm hover:border-[#C6922B] hover:text-[#C6922B] transition"
                >

                  <LogIn size={18} />

                  Login

                </button>

                <button
                  onClick={() => {

                    navigate("/signup");

                    setMenuOpen(false);
                  }}
                  className="w-full min-h-12 rounded-xl bg-[#C6922B] text-black font-bold flex items-center justify-center gap-2 text-sm hover:scale-[1.02] transition"
                >

                  <UserPlus size={18} />

                  Signup

                </button>

              </div>

            ) : (

              <button
                onClick={() => {

                  handleLogout();

                  setMenuOpen(false);
                }}
                className="w-full min-h-12 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 text-sm hover:opacity-90 transition"
              >

                <LogOut size={18} />

                Logout

              </button>

            )}

          </div>

        </div>

        </div>,
        document.body,
      )}

    </header>

    <RequestProductModal
      key={requestOpen ? "open" : "closed"}
      open={requestOpen}
      onClose={() => setRequestOpen(false)}
    />

    </>
  );
}