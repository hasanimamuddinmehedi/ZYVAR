import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

import {
  VitePWA,
} from "vite-plugin-pwa";

import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import process from "node:process";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL("./server", import.meta.url));

function isLocalBackendAvailable() {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port: 5000 });
    const finish = (available) => {
      socket.destroy();
      resolve(available);
    };

    socket.setTimeout(700);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function localAiBackend() {
  return {
    name: "zyvar-local-ai-backend",
    apply: "serve",
    async configureServer(server) {
      if (await isLocalBackendAvailable()) {
        console.info("[zyvar-dev] AI backend already listening on port 5000.");
        return;
      }

      const backend = spawn(process.execPath, ["server.js"], {
        cwd: backendDirectory,
        stdio: "inherit",
        windowsHide: true,
      });
      let stopping = false;

      backend.once("error", (error) => {
        console.error("[zyvar-dev] Could not start the AI backend:", error.message);
      });
      backend.once("exit", (code, signal) => {
        if (!stopping && code !== 0) {
          console.error(
            `[zyvar-dev] AI backend exited (code ${code ?? "unknown"}, signal ${signal ?? "none"}). Check server startup output.`,
          );
        }
      });
      server.httpServer?.once("close", () => {
        stopping = true;
        if (backend.exitCode === null) backend.kill();
      });
    },
  };
}

export default defineConfig({

  plugins: [

    localAiBackend(),

    react(),

    tailwindcss(),

    VitePWA({

      registerType:
        "prompt",

      manifestFilename:
        "site.webmanifest",

      workbox: {
        globIgnores: ["**/*.wasm"],
        runtimeCaching: [
          {
            urlPattern: /\/videos\/skin-analysis-scan\.mp4$/,
            handler: "NetworkOnly",
          },
        ],
      },

      includeAssets: [

        "favicon.ico",
        "favicon.png",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
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
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
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