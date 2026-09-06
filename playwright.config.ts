import { defineConfig } from "@playwright/test";

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const testBuildSha = "0123456789abcdef0123456789abcdef01234567";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: { baseURL: liveBaseUrl || "http://127.0.0.1:8080", browserName: "chromium" },
  webServer: liveBaseUrl ? undefined : {
    command: `BUILD_SHA='${testBuildSha}' npm run build && BUILD_SHA='${testBuildSha}' DATABASE_URL='sqlite:///tmp/kitchen-table-playwright.db?mode=rwc' cargo run`,
    url: "http://127.0.0.1:8080/health",
    reuseExistingServer: false,
    timeout: 180_000
  }
});
