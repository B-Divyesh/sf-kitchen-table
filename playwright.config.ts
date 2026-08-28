import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:8080", browserName: "chromium" },
  webServer: {
    command: "DATABASE_URL='sqlite:///tmp/kitchen-table-playwright.db?mode=rwc' cargo run",
    url: "http://127.0.0.1:8080/health",
    reuseExistingServer: false,
    timeout: 60_000
  }
});
