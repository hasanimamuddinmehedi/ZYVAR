import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

import {
  VitePWA,
} from "vite-plugin-pwa";

export default defineConfig({

  plugins: [

    react(),

    tailwindcss(),

    VitePWA({

      registerType:
        "autoUpdate",

      includeAssets: [

        "favicon.ico",
        "apple-touch-icon.png",
      ],

      manifest: {

        name:
          "ZYVAR",

        short_name:
          "ZYVAR",

        description:
          "Luxury Ecommerce Store",

        theme_color:
          "#0B0B0B",

        background_color:
          "#0B0B0B",

        display:
          "standalone",

        orientation:
          "portrait",

        scope:
          "/",

        start_url:
          "/",

        icons: [

          {
            src: "/pwa-192.png",

            sizes:
              "192x192",

            type:
              "image/png",
          },

          {
            src: "/pwa-512.png",

            sizes:
              "512x512",

            type:
              "image/png",
          },

          {
            src: "/pwa-512.png",

            sizes:
              "512x512",

            type:
              "image/png",

            purpose:
              "any maskable",
          },
        ],
      },
    }),
  ],

  server: {

    headers: {

      "Cross-Origin-Opener-Policy":
        "same-origin-allow-popups",

    },

  },

});