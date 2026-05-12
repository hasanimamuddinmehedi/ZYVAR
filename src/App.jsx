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
import AdminUpload from "./pages/AdminUpload";
import Payment from "./pages/Payment";
import Signup from "./pages/Signup";
import UserLogin from "./pages/UserLogin";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import {
  trackPage,
} from "./utils/analytics";

export default function App() {

  const location = useLocation();

  useEffect(() => {

    trackPage(
      location.pathname
    );

  }, [location]);

  return (

    <Routes>

      {/* HOME */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* PRODUCTS */}
      <Route
        path="/products"
        element={<Products />}
      />

      {/* PRODUCT DETAILS */}
      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
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

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminUpload />
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

      {/* PAYMENT */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />

      {/* SIGNUP */}
      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* USER LOGIN */}
      <Route
        path="/user-login"
        element={<UserLogin />}
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

    </Routes>
  );
}