import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Readee smoke tests.
 *
 * Default target = production (learn.readee.app). Override with
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
 *
 * Tests live in tests/smoke/. They run unauthenticated where possible;
 * authenticated tests use the test creds in .env.local
 * (PLAYWRIGHT_TEACHER_EMAIL / PLAYWRIGHT_TEACHER_PASSWORD).
 */
export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  timeout: 60_000,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://learn.readee.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
