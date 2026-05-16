import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment";
import Signup from "./pages/Signup";
import UserLogin from "./pages/UserLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";

import {
  trackPage,
} from "./utils/analytics";

export default function App() {

  const location =
    useLocation();

  // TRACK PAGE VIEW
  useEffect(() => {

    trackPage(
      location.pathname
    );

  }, [location]);

  // HIDE NAVBAR ON AUTH PAGES
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/user-login",
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(
      location.pathname
    );

  return (

    <>
      {/* NAVBAR */}
      {
        !shouldHideNavbar && (
          <Navbar />
        )
      }

      {/* ROUTES */}
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            <Home />
          }
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            <Products />
          }
        />

        {/* PRODUCT DETAILS */}
        <Route
          path="/product/:id"
          element={
            <ProductDetails />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            <Signup />
          }
        />

        {/* USER LOGIN */}
        <Route
          path="/user-login"
          element={
            <UserLogin />
          }
        />

        {/* CART */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* WISHLIST */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* PAYMENT */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* PROFILE SETTINGS */}
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PANEL */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            <AdminRoute>
              <Orders />
            </AdminRoute>
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <About />
          }
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={
            <Contact />
          }
        />

      </Routes>
    </>
  );
}