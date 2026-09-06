import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "BUILD_SHA");
  return {
    publicDir: "frontend/public",
    define: {
      __BUILD_SHA__: JSON.stringify(env.BUILD_SHA?.trim() || "dev"),
    },
    build: { outDir: "frontend/dist", emptyOutDir: true, target: "es2022" },
    server: {
      proxy: {
        "/api": "http://127.0.0.1:8080",
        "/health": "http://127.0.0.1:8080",
      },
    },
    test: {
      include: ["frontend/src/**/*.test.ts"],
    },
  };
});
