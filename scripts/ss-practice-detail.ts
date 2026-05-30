import { chromium } from "@playwright/test";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/showcase/practice/RL.4.3-Q3", { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/practice-detail.png", fullPage: false });
  await ctx.close();
  await browser.close();
  console.log("ok");
})();
