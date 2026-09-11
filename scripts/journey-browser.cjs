const { chromium, expect } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultNavigationTimeout(120000);
    const errors = [],
      checkoutBodies = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let confirmCount = 0;
    await page.route("**/*", async (route) => {
      if (route.request().method() !== "POST" && route.request().method() !== "PATCH")
        return route.continue();
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/checkout") {
        checkoutBodies.push(route.request().postDataJSON());
        return route.fulfill({ status: 503, json: { error: "Synthetic outage" } });
      }
      if (path === "/api/billing/confirm")
        return route.fulfill({ json: { ok: true, fullAccess: ++confirmCount > 1 } });
      // Demo effects and analytics must never write to real services.
      return route.fulfill({ json: { ok: true } });
    });
    await page.goto("http://127.0.0.1:3431/demo/journey");
    await expect(page.locator("[data-trial-offer]")).toBeVisible();
    await expect(page.locator("[data-journey-map]")).toBeVisible();
    await page.waitForTimeout(1300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    for (const [width, height] of [
      [1440, 1000],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `/private/tmp/journey-new-${width}.png` });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByLabel("Annual", { exact: false }).check();
    await expect(page.locator("[data-trial-terms]")).toContainText("$83.88 a year");
    await page.locator("[data-trial-start]").click();
    await expect(page.locator("[data-trial-offer] [role=alert]")).toContainText(
      "Your reading plan is saved",
    );
    expect(checkoutBodies[0].billing).toBe("annual");
    expect(checkoutBodies[0].childId).toBeTruthy();
    await page.locator("[data-trial-start]").click();
    await expect.poll(() => checkoutBodies.length).toBe(2);
    expect(checkoutBodies[0].attemptId).toBe(checkoutBodies[1].attemptId);
    await page.locator("[data-journey-lesson]").nth(1).click();
    await expect(page.locator("[data-paywall-modal]")).toBeVisible();
    await expect(page.locator("[data-paywall-modal]")).not.toContainText(
      "finished all the free lessons",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-paywall-modal]")).not.toBeVisible();
    for (const scenario of ["paid", "legacy", "lapsed", "unconfirmed", "canceled", "loading"]) {
      await page.locator("#scenario").selectOption(scenario);
      if (scenario === "paid") {
        await expect(page.locator("[data-trial-offer]")).toHaveCount(0);
        await expect(page.locator("[data-next-lesson]")).toBeVisible();
      }
      if (scenario === "lapsed") {
        await expect(page.locator("[data-trial-terms]")).toContainText("starting today");
        await expect(page.locator("[data-trial-start]")).toHaveText("Continue with Readee+");
      }
      if (scenario === "unconfirmed")
        await expect(page.locator("[data-grade-ladder]")).toContainText("Guided lesson start");
      if (scenario === "loading")
        await expect(page.locator("[data-journey-loading]")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: `/private/tmp/journey-${scenario}.png` });
    }
    await page.locator("#scenario").selectOption("completed");
    const bunny = page.locator("[data-journey-bunny]");
    const initial = await bunny.getAttribute("style");
    await expect.poll(() => bunny.getAttribute("style"), { timeout: 12000 }).not.toBe(initial);
    await expect(page.locator("[data-journey-lesson]").nth(1)).toHaveAttribute(
      "data-journey-state",
      "current",
      { timeout: 12000 },
    );
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "/private/tmp/journey-hop.png" });
    await page.locator("[data-journey-lesson]").nth(1).click();
    await expect(page.locator("[data-paywall-modal]")).toBeVisible();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator("[data-paywall-modal] [data-trial-start]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "/private/tmp/journey-modal-320.png" });
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator("#scenario").selectOption("checkout");
    await expect(page.locator("[data-checkout-return]")).toContainText("Readee+ is ready", {
      timeout: 20000,
    });
    await expect(page.locator("[data-trial-offer]")).toHaveCount(0);
    await expect(page.locator("[data-next-lesson]")).toBeVisible();
    expect(errors).toEqual([]);
    console.log(
      "Journey viewport, paid/free/lapsed states, checkout retries, parent modal, and delayed activation passed. No live writes.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
