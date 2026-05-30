import { chromium } from "@playwright/test";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const urls = [
    ["http://localhost:3000/showcase", "/tmp/showcase-hub.png"],
    ["http://localhost:3000/showcase/practice", "/tmp/showcase-practice.png"],
    ["http://localhost:3000/showcase/practice/RL.K.5-Q5", "/tmp/showcase-q-k.png"],
    ["http://localhost:3000/showcase/practice/RL.3.2-Q3", "/tmp/showcase-q-3.png"],
  ];
  for (const [u, p] of urls) {
    await page.goto(u, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: p, fullPage: false });
  }
  await ctx.close();
  await browser.close();
  console.log("ok");
})();
