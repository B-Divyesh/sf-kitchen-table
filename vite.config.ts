import { defineConfig } from "vite";
export default defineConfig({
  publicDir: "frontend/public",
  build: { outDir: "frontend/dist", emptyOutDir: true, target: "es2022" },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8080",
      "/health": "http://127.0.0.1:8080",
    },
  },
});
