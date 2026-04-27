import { test, expect } from "@playwright/test";

/**
 * Authenticated flows. Skips entirely if test creds aren't provided.
 *
 * Set in .env.local (or CI env vars):
 *   PLAYWRIGHT_TEACHER_EMAIL=...
 *   PLAYWRIGHT_TEACHER_PASSWORD=...
 *
 * The test account should:
 *   - Have role=educator
 *   - Own at least one classroom (so /classroom doesn't show onboarding)
 */

const EMAIL = process.env.PLAYWRIGHT_TEACHER_EMAIL;
const PASSWORD = process.env.PLAYWRIGHT_TEACHER_PASSWORD;

test.describe("Teacher authenticated flows", () => {
  test.skip(!EMAIL || !PASSWORD, "Teacher test creds not set — skipping authed flow tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/your@email\.com/i).fill(EMAIL!);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/(classroom|dashboard)/, { timeout: 15_000 });
  });

  test("Build with AI hub renders all four tiles", async ({ page }) => {
    await page.goto("/classroom/build");
    await expect(page.getByText(/build a quiz/i)).toBeVisible();
    await expect(page.getByText(/build a lesson/i)).toBeVisible();
    await expect(page.getByText(/build a decodable book/i)).toBeVisible();
    await expect(page.getByText(/build a leveled passage/i)).toBeVisible();
  });

  test("Lessons list page loads", async ({ page }) => {
    await page.goto("/classroom/lessons");
    await expect(page.getByRole("heading", { name: /your custom lessons/i })).toBeVisible();
  });

  test("Books list page loads", async ({ page }) => {
    await page.goto("/classroom/books");
    await expect(page.getByRole("heading", { name: /your decodable books/i })).toBeVisible();
  });

  test("Leveled list page loads", async ({ page }) => {
    await page.goto("/classroom/leveled");
    await expect(page.getByRole("heading", { name: /differentiated passages/i })).toBeVisible();
  });

  test("Reports page loads (or shows empty state)", async ({ page }) => {
    await page.goto("/classroom/reports");
    // Either renders the dashboard heading OR the no-classrooms empty state
    const ready = await Promise.race([
      page
        .getByRole("heading", { name: /how your students are doing/i })
        .waitFor({ timeout: 10_000 })
        .then(() => true),
      page
        .getByText(/no classrooms yet/i)
        .waitFor({ timeout: 10_000 })
        .then(() => true),
    ]).catch(() => false);
    expect(ready).toBe(true);
  });

  test("Account page loads with the right header", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: /^account$/i })).toBeVisible();
    // Profile section + at least one of the role-specific sections
    await expect(page.getByText(/display name/i)).toBeVisible();
  });

  test("Quiz wizard step 1 renders without errors", async ({ page }) => {
    await page.goto("/classroom/authoring/wizard");
    // Title field, grade picker, topic textarea
    await expect(page.locator("textarea").first()).toBeVisible();
    await expect(page.getByText(/grade level/i)).toBeVisible();
  });

  test("Lesson wizard renders", async ({ page }) => {
    await page.goto("/classroom/authoring/lesson-wizard");
    await expect(page.getByRole("heading", { name: /build a lesson/i })).toBeVisible();
  });

  test("Book wizard renders with grade-filtered phonics patterns", async ({ page }) => {
    await page.goto("/classroom/authoring/book-wizard");
    await expect(page.getByRole("heading", { name: /build a decodable book/i })).toBeVisible();
    // K is selected by default; "Short a (cat, hat)" should be visible
    await expect(page.getByText(/short a/i)).toBeVisible();
  });

  test("Leveled wizard renders", async ({ page }) => {
    await page.goto("/classroom/authoring/leveled-wizard");
    await expect(page.getByRole("heading", { name: /build a leveled passage/i })).toBeVisible();
  });
});
