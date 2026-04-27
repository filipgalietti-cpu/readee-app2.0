import { test, expect } from "@playwright/test";

/**
 * Protected route gate — anonymous visits to authed routes redirect
 * to /login (not 500, not blank). If any of these break, the auth
 * proxy is misconfigured.
 */

const PROTECTED_PATHS = [
  "/dashboard",
  "/classroom",
  "/classroom/build",
  "/classroom/lessons",
  "/classroom/books",
  "/classroom/leveled",
  "/classroom/reports",
  "/classroom/live",
  "/classroom/library",
  "/account",
  "/admin/qc",
];

for (const path of PROTECTED_PATHS) {
  test(`anonymous visit to ${path} redirects to login`, async ({ page }) => {
    const response = await page.goto(path);
    // Either redirects to /login OR renders a login prompt.
    expect(response?.status()).toBeLessThan(500);
    const url = page.url();
    const loggedOut =
      url.includes("/login") ||
      (await page
        .getByRole("button", { name: /continue with google/i })
        .isVisible()
        .catch(() => false));
    expect(loggedOut, `${path} should redirect anonymous users to login`).toBe(true);
  });
}
