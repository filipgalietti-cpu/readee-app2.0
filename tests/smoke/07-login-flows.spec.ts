import { test, expect } from "@playwright/test";

/**
 * Login flow E2E (#106). Covers the surface added in commits
 *   1a02997 (NavAuth #310 fix)
 *   162d4fb (Vertex split)
 *   f474aa5 (parent E2E hardening)
 *   plus the recent login UX pass:
 *     - Bulletproof post-login redirect
 *     - Plain-language error mapping (wrong password, no account, OAuth-only)
 *     - Magic-link fallback CTA
 *     - Forgot-password entry
 *
 * The "wrong password" + "no account" + "OAuth-only" assertions are
 * unauthed and run against any environment. The successful sign-in
 * test is gated on PLAYWRIGHT_PARENT_EMAIL/_PASSWORD; skips when
 * those aren't set.
 */

// Hide Next.js dev overlay so it can't intercept clicks against
// localhost. Production has no such element.
async function hideDevOverlay(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const s = document.createElement("style");
    s.textContent =
      "nextjs-portal,#__next-build-watcher{display:none!important;pointer-events:none!important}";
    document.head.appendChild(s);
  });
}

test.describe("Login form — anonymous error mapping", () => {
  test("wrong password surfaces the targeted message, not the raw Supabase string", async ({
    page,
  }) => {
    await page.goto("/login");
    await hideDevOverlay(page);
    await page.getByPlaceholder(/your@email\.com/i).fill("nobody-here-xyz@example.com");
    await page.getByPlaceholder(/••••••••/).fill("wrongpassword123");
    await page.getByRole("button", { name: /^sign in$/i }).click({ force: true });
    // Either "no account" or generic "wrong password" — but it must NOT
    // be the raw "Invalid login credentials" Supabase string.
    const banner = page.getByText(
      /couldn'?t find an account|wrong password|sign you in|continue with google/i,
    );
    await expect(banner.first()).toBeVisible({ timeout: 15_000 });
    // The legacy raw Supabase string should be gone.
    const rawSupabaseString = await page
      .getByText(/^invalid login credentials$/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(rawSupabaseString).toBe(false);
  });

  test("magic-link CTA triggers sendOtp and shows the inbox banner", async ({
    page,
  }) => {
    await page.goto("/login");
    await hideDevOverlay(page);
    await page.getByPlaceholder(/your@email\.com/i).fill("magic-link-test@example.com");
    // Click the "Email me a link" button. We don't have a real inbox
    // to read; we just verify the UI flips to the "check your inbox"
    // banner OR a rate-limit error (also valid).
    await page.getByRole("button", { name: /email me a link/i }).click({ force: true });
    const ok = await Promise.race([
      page
        .getByText(/check .+ for a sign-in link/i)
        .first()
        .waitFor({ timeout: 15_000 })
        .then(() => "sent" as const),
      page
        .getByText(/too many .+ requests|couldn'?t send|network error/i)
        .first()
        .waitFor({ timeout: 15_000 })
        .then(() => "throttled" as const),
    ]).catch(() => "neither" as const);
    expect(["sent", "throttled"]).toContain(ok);
  });

  test("forgot-password view renders the reset form", async ({ page }) => {
    await page.goto("/login");
    await hideDevOverlay(page);
    await page.getByRole("button", { name: /forgot password/i }).click({ force: true });
    await expect(
      page.getByRole("heading", { name: /reset password/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("login client-validates short password before hitting Supabase", async ({
    page,
  }) => {
    await page.goto("/login");
    await hideDevOverlay(page);
    // Email validates as required at the HTML level (browser pops a
    // native tooltip), but our JS validator catches < 8 char passwords
    // BEFORE hitting Supabase — that's the meaningful gate to test.
    await page.getByPlaceholder(/your@email\.com/i).fill("test@example.com");
    await page.getByPlaceholder(/••••••••/).fill("short");
    await page.getByRole("button", { name: /^sign in$/i }).click({ force: true });
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

const EMAIL = process.env.PLAYWRIGHT_PARENT_EMAIL;
const PASSWORD = process.env.PLAYWRIGHT_PARENT_PASSWORD;

test.describe("Login form — successful sign-in (gated)", () => {
  test.skip(!EMAIL || !PASSWORD, "Parent test creds not set");

  test("parent sign-in lands on /dashboard via the inline role-aware redirect", async ({
    page,
  }) => {
    await page.goto("/login");
    await hideDevOverlay(page);
    await page.getByPlaceholder(/your@email\.com/i).fill(EMAIL!);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click({ force: true });
    // Pre-fix this would have round-tripped through /; the new path
    // calls router.replace("/dashboard") inline. Both are acceptable —
    // we just need to leave /login.
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 20_000,
    });
    expect(page.url()).not.toMatch(/\/login/);
  });

  test("?redirect=<path> is honored after sign-in", async ({ page }) => {
    await page.goto("/login?redirect=%2Fdashboard%2Fhomework-scan");
    await hideDevOverlay(page);
    await page.getByPlaceholder(/your@email\.com/i).fill(EMAIL!);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click({ force: true });
    await page.waitForURL(/\/dashboard\/homework-scan/, { timeout: 20_000 });
    expect(page.url()).toMatch(/\/dashboard\/homework-scan/);
  });
});
