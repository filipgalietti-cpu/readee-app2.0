import { chromium } from "@playwright/test";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3001/", {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find((h) =>
      h.textContent?.includes("Tap an answer"),
    );
    if (h) h.scrollIntoView({ block: "center", behavior: "auto" });
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/tmp/practicereel.png", fullPage: false });
  await ctx.close();
  await browser.close();
  console.log("ok");
})();
