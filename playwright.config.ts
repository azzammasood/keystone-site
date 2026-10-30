import { defineConfig, devices } from "@playwright/test";

const base = process.env.KEYSTONE_BASE_PATH ?? "";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://127.0.0.1:4173${base}/`, ...devices["Desktop Chrome"] },
  webServer: { command: "node scripts/serve.mjs", url: `http://127.0.0.1:4173${base}/`, reuseExistingServer: !process.env.CI },
});
