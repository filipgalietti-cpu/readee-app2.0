/** Local, synthetic presentation check. Never creates a child or submits a placement.
 * Start dev, then: ASSESSMENT_BASE_URL=http://127.0.0.1:3431 node scripts/assessment-experience-browser.cjs
 */
const { chromium, expect } = require("@playwright/test");
const base = process.env.ASSESSMENT_BASE_URL || "http://127.0.0.1:3431";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw Error("Use an isolated local dev server.");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors = [],
      writes = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      if (route.request().method() === "POST") {
        writes.push(new URL(route.request().url()).pathname);
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(`${base}/demo/placement-studio`);
    // Wait for the real orb effect: native select controls exist before React hydrates.
    await page.waitForFunction(
      () => document.querySelector(".pa-reading-orb button")?.style.transform,
    );
    for (const [width, height] of [
      [1440, 900],
      [1280, 720],
      [768, 1024],
      [390, 844],
      [390, 667],
      [320, 568],
    ]) {
      await page.setViewportSize({ width, height });
      for (let i = 0; i < 13; i++) {
        await page.getByRole("combobox").selectOption(String(i));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        if ([3, 5, 10, 11].includes(i)) {
          const action = page.locator("[data-confirm-answer]");
          await expect(
            action,
            `${width}×${height}, screen ${i}; ${errors.join(" | ")}`,
          ).toBeInViewport();
          const first = page.locator("[data-option-id]").first();
          await first.click();
          await expect(first).toHaveAttribute("aria-pressed", "true");
          await expect(page.locator("[data-option-id]").last()).toBeEnabled();
          await page.locator("[data-option-id]").last().click();
          await action.click();
          await expect(page.locator("[data-option-id]").first()).toBeDisabled();
          await expect(action).toBeDisabled();
          await expect(page.locator('[data-correct="1"]')).toHaveCount(0);
        }
      }
    }
    // A spoken choice highlights only that card, and cannot answer the question.
    await page.getByRole("combobox").selectOption("5");
    await page.getByRole("button", { name: "Hear Excited", exact: true }).click();
    await expect(page.locator(".pa-option.is-reading")).toContainText("Excited");
    await expect(page.locator('[data-option-id][aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator("[data-confirm-answer]")).toBeDisabled();
    await expect(page.locator(".pa-option.is-reading")).toHaveCount(0, { timeout: 8000 });
    expect(errors).toEqual([]);
    expect(writes).toEqual([]);
    console.log(
      "78 viewport states; selection, confirmation and spoken-choice isolation passed. No writes.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
