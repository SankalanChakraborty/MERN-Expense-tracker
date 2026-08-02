import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Mirrors the Vercel rewrite so local dev is same-origin too: the app calls
// /api/v1/* and Vite forwards it to the Express server. Keeps auth cookies
// first-party in development and means CORS is never in the picture.
const apiProxy = {
  "/api": {
    target: process.env.VITE_DEV_API_TARGET ?? "http://localhost:8080",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  // `npm run preview` serves the production build with the same proxy, so the
  // real bundle can be smoke-tested locally before pushing to Vercel.
  preview: { proxy: apiProxy },
});
