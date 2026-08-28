import { defineConfig } from "@playwright/test";

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: { baseURL: liveBaseUrl || "http://127.0.0.1:8080", browserName: "chromium" },
  webServer: liveBaseUrl ? undefined : {
    command: "DATABASE_URL='sqlite:///tmp/kitchen-table-playwright.db?mode=rwc' cargo run",
    url: "http://127.0.0.1:8080/health",
    reuseExistingServer: false,
    timeout: 60_000
  }
});
