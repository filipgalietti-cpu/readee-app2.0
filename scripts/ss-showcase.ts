import { chromium } from "@playwright/test";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/showcase/stories", { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/showcase-index.png", fullPage: false });
  await page.goto("http://localhost:3000/showcase/stories/story-k-1", { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/showcase-story.png", fullPage: false });
  await ctx.close();
  await browser.close();
  console.log("ok");
})();
