import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App";

import "./index.css";

import {
  HelmetProvider,
} from "react-helmet-async";

import {
  CartProvider,
} from "./context/CartContext";

import {
  WishlistProvider,
} from "./context/WishlistContext";

import {
  initAnalytics,
} from "./utils/analytics";

import {
  registerSW,
} from "virtual:pwa-register";

// REGISTER SERVICE WORKER
registerSW({
  immediate: true,
});

// INITIALIZE ANALYTICS
initAnalytics();

// ROOT RENDER
ReactDOM.createRoot(

  document.getElementById("root")

).render(

  <React.StrictMode>

    <BrowserRouter>

      <HelmetProvider>

        {/* WISHLIST CONTEXT */}
        <WishlistProvider>

          {/* CART CONTEXT */}
          <CartProvider>

            <App />

          </CartProvider>

        </WishlistProvider>

      </HelmetProvider>

    </BrowserRouter>

  </React.StrictMode>
);