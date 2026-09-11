const { chromium, expect } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  });
  try {
    const page = await browser.newPage({
      permissions: ["microphone"],
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/api/**", (r) =>
      r.request().method() === "POST"
        ? r.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              saidAs: "fee-LOOSH",
              audioUrl: "/audio/placement-spectrum/ask-name.mp3",
            }),
          })
        : r.continue(),
    );
    await page.goto("http://127.0.0.1:3431/demo/placement-studio");
    await page.getByRole("combobox").selectOption("23");
    await expect(page.locator("[data-name-luna]")).toBeInViewport();
    await expect(page.locator("[data-say-name-record]")).toHaveText("Stop");
    await page.locator("[data-say-name-record]").click();
    await expect(
      page.getByRole("button", { name: "That’s my name. Let’s read", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/fix the spelling in Settings/)).toHaveCount(0);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: "/private/tmp/round4-name.png" });
    for (const [width, height] of [
      [390, 844],
      [320, 568],
      [1280, 800],
    ]) {
      await page.setViewportSize({ width, height });
      await page.getByRole("combobox").selectOption("2");
      const rabbit = await page.locator(".pa-word-bunny").boundingBox(),
        orb = await page.locator(".pa-mic-row .pa-reading-orb").boundingBox();
      console.log({ width, rabbit, orb });
      expect(rabbit.width).toBeGreaterThanOrEqual(width < 600 ? 124 : 260);
      expect(rabbit.x + rabbit.width <= orb.x || rabbit.y >= orb.y + orb.height).toBe(true);
      await expect(page.locator("[data-skip-word]")).toBeInViewport();
      await page.screenshot({ path: `/private/tmp/round4-word-${width}.png` });
    }
    await page.goto("http://127.0.0.1:3431/demo/reader-loading");
    await expect(page.locator("[data-reader-loading]")).toBeInViewport();
    await expect(page.getByText("Getting Readee ready")).toBeVisible();
    await page.screenshot({ path: "/private/tmp/round4-loading.png" });
    expect(errors).toEqual([]);
    console.log(
      "Name orb, automatic preview, large non-overlapping rabbit, controls, and reader loading passed.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
