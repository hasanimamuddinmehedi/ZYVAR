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
import Payment from "./pages/Payment";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import {
  trackPage,
} from "./utils/analytics";

/* ADMIN LAYOUT */
import AdminLayout from "./pages/admin/AdminLayout";

/* ADMIN PAGES */
import DashboardPage from "./pages/admin/DashboardPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import UploadPage from "./pages/admin/UploadPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProductRequestsPage from "./pages/admin/ProductRequestsPage";
import PartnerApplicationsPage from "./pages/admin/PartnerApplicationsPage";
import PartnerCouponsPage from "./pages/admin/PartnerCouponsPage";

import BecomePartnerPage from "./pages/BecomePartnerPage";
import PartnerStorePage from "./pages/PartnerStorePage";

import PartnerRoute from "./components/PartnerRoute";

import PartnerLayout from "./pages/partner/PartnerLayout";

import PartnerUploadProduct from "./pages/partner/PartnerUploadProduct";

import PartnerDashboardPage from "./pages/partner/DashboardPage";

import PartnerProductsPage from "./pages/partner/ProductsPage";

import PartnerOrdersPage from "./pages/partner/OrdersPage";

import PartnerReviewsPage from "./pages/partner/ReviewsPage";

import PartnerEarningsPage from "./pages/partner/EarningsPage";

import PartnerSettingsPage from "./pages/partner/SettingsPage";

function AppContent() {

  const location =
    useLocation();

  // TRACK PAGE VIEW
  useEffect(() => {

    trackPage(
      location.pathname
    );

  }, [location]);

  // HIDE NAVBAR ON AUTH + ADMIN PAGES
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/user-login",
  ];

  const shouldHideNavbar =

    hideNavbarRoutes.includes(
      location.pathname
    ) ||

    location.pathname.startsWith(
      "/admin"
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

        {/* PRODUCT DETAILS — clean slug URL: /product/product-name */}
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

        {/* USER ORDERS */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* ORDER SUCCESS */}
        <Route
          path="/order-success/:id"
          element={
            <OrderSuccess />
          }
        />

        {/* ORDER TRACKING */}
        <Route
          path="/order-tracking/:id"
          element={
            <OrderTracking />
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

        {/* ADMIN PANEL */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

          {/* DASHBOARD */}
          <Route
            index
            element={
              <DashboardPage />
            }
          />

          <Route
            path="dashboard"
            element={
              <DashboardPage />
            }
          />

          {/* ORDERS */}
          <Route
            path="orders"
            element={
              <OrdersPage />
            }
          />

          {/* PRODUCTS */}
          <Route
            path="products"
            element={
              <ProductsPage />
            }
          />

          {/* UPLOAD */}
          <Route
            path="upload"
            element={
              <UploadPage />
            }
          />

          {/* SETTINGS */}
          <Route
            path="settings"
            element={
              <SettingsPage />
            }
          />

          {/* PRODUCT REQUESTS */}
          <Route
            path="product-requests"
            element={
              <ProductRequestsPage />
            }
          />
          <Route
  path="partner-applications"
  element={
    <PartnerApplicationsPage />
  }
/>
<Route
  path="partner-coupons"
  element={
    <PartnerCouponsPage />
  }
/>
        </Route>

        {/* LEGACY ADMIN ORDERS PAGE */}
        <Route
          path="/orders"
          element={
            <AdminRoute>
              <Orders />
            </AdminRoute>
          }
        />

        {/* PUBLIC PARTNER STORE */}
<Route
  path="/:partnerSlug"
  element={
    <PartnerStorePage />
  }
/>

        <Route
  path="/become-partner"
  element={<BecomePartnerPage />}
/>

<Route
  path="/partner-dashboard"
  element={
    <PartnerRoute>
      <PartnerLayout />
    </PartnerRoute>
  }
>

  <Route
    index
    element={
      <PartnerDashboardPage />
    }
  />

  <Route
  path="uploads"
  element={
      <PartnerUploadProduct />
  }
/>

  <Route
    path="products"
    element={
      <PartnerProductsPage />
    }
  />

  <Route
    path="orders"
    element={
      <PartnerOrdersPage />
    }
  />

  <Route
    path="reviews"
    element={
      <PartnerReviewsPage />
    }
  />

  <Route
    path="earnings"
    element={
      <PartnerEarningsPage />
    }
  />

  <Route
    path="settings"
    element={
      <PartnerSettingsPage />
    }
  />

</Route>

      </Routes>
    </>
  );
}

export default function App() {

  return (
    <AppContent />
  );
}