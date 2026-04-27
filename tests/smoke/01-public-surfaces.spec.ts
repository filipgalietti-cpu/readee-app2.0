import { test, expect } from "@playwright/test";

/**
 * Public surfaces — pages anyone can hit without auth. If any of these
 * 500 or fail to render their key copy, the marketing surface is broken.
 */

test.describe("Public surfaces", () => {
  test("signup page renders with both Parent and Teacher toggles", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveTitle(/Readee/i);
    await expect(page.getByText(/parent/i).first()).toBeVisible();
    await expect(page.getByText(/teacher/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible();
  });

  test("login page renders with the Continue with Google button", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Readee/i);
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible();
  });

  test("/signup?as=teacher defaults to teacher mode", async ({ page }) => {
    await page.goto("/signup?as=teacher");
    // Banner copy reads "Teacher signup — free to start"
    await expect(page.getByText(/teacher signup/i)).toBeVisible();
  });

  test("/today redirects to a published daily question", async ({ page }) => {
    const response = await page.goto("/today");
    // Either redirects to /today/<slug> or shows the empty-state if no
    // daily exists yet — both are valid states.
    expect(response?.status()).toBeLessThan(500);
    const onSlug = /\/today\/\d{4}-\d{2}-\d{2}/.test(page.url());
    const emptyState = page.getByText(/no daily question yet/i);
    if (!onSlug) {
      await expect(emptyState).toBeVisible();
    } else {
      // Has a daily — verify the passage block renders
      await expect(page.locator("article")).toBeVisible();
    }
  });
});
