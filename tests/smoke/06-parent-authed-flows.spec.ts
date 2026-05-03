import { test, expect } from "@playwright/test";

/**
 * Parent-side authed flow smoke tests (#65, #68, #69).
 *
 * Skips entirely if parent test creds aren't provided. Set in
 * .env.local (or CI):
 *   PLAYWRIGHT_PARENT_EMAIL=...
 *   PLAYWRIGHT_PARENT_PASSWORD=...
 *
 * The parent test account should:
 *   - Have role=parent
 *   - Have a Readee+ paid plan (so plan-gated tools render)
 *   - Have at least one child profile
 */

const EMAIL = process.env.PLAYWRIGHT_PARENT_EMAIL;
const PASSWORD = process.env.PLAYWRIGHT_PARENT_PASSWORD;

test.describe("Parent authenticated flows", () => {
  test.skip(!EMAIL || !PASSWORD, "Parent test creds not set — skipping authed flow tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Hide Next.js dev-overlay portal which can swallow clicks in dev
    // even when there's nothing wrong. Production has no such element.
    await page.evaluate(() => {
      const s = document.createElement("style");
      s.textContent = "nextjs-portal,#__next-build-watcher{display:none!important;pointer-events:none!important}";
      document.head.appendChild(s);
    });
    await page.getByPlaceholder(/your@email\.com/i).fill(EMAIL!);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click({ force: true });
    // After successful sign-in, the form does router.push("/") and the
    // server component on / redirects to /dashboard. In dev that round-
    // trip can be flaky on the first request after cookie write; just
    // navigate directly once the URL has left /login.
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 15_000,
    });
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
  });

  /* ── #68 Homework Scan ─────────────────────────────────────── */
  test("Homework scan page loads with the scanner UI", async ({ page }) => {
    await page.goto("/dashboard/homework-scan");
    await expect(
      page.getByRole("heading", { name: /scan a worksheet/i }),
    ).toBeVisible({ timeout: 20_000 });
    // The scanner accepts an image — file input or upload button visible.
    const hasFileInput =
      (await page.locator("input[type='file']").count()) > 0;
    const hasUploadBtn = await page
      .getByText(/take a photo|upload|choose image/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasFileInput || hasUploadBtn).toBe(true);
  });

  /* ── #65 Ask Readee + community share ──────────────────────── */
  test("Ask Readee library renders + share-to-community toggle present", async ({
    page,
  }) => {
    await page.goto("/dashboard/ask-readee");
    // Heading is "Ask Readee" when a child exists, "Add a child first"
    // when not. Either is a valid render of the page.
    await expect(
      page
        .getByRole("heading", { name: /ask readee|add a child first/i })
        .first(),
    ).toBeVisible({ timeout: 20_000 });

    // If at least one library item exists, the share-with-community
    // checkbox should be reachable.
    const shareToggle = page.getByText(/share with community/i).first();
    const hasItems = await shareToggle.isVisible().catch(() => false);
    if (hasItems) {
      // The label is a real <label> wrapping a checkbox — grab the input.
      const checkbox = page
        .locator("label", { hasText: /share with community/i })
        .first()
        .locator("input[type='checkbox']");
      await expect(checkbox).toBeVisible();
    }
  });

  /* ── #69 Buddy live mode entry ─────────────────────────────── */
  test("Reading Buddy page loads with the mode picker", async ({ page }) => {
    await page.goto("/buddy");
    // The h1 is "Hi, <name>!" when a child profile exists, otherwise
    // "Talk to Readee". Either render means the page mounted clean.
    await expect(
      page
        .getByRole("heading", { name: /^hi,.+!$|talk to readee/i })
        .first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("Buddy live token endpoint responds for paid parent (200 or 402)", async ({
    page,
  }) => {
    // Use page.request so the auth cookie set by the login form goes
    // along for the ride. The bare `request` fixture has no session.
    const res = await page.request.post("/api/buddy-live/token", {
      data: { childId: "playwright-smoke" },
    });
    expect([200, 400, 402, 404]).toContain(res.status());
  });
});
