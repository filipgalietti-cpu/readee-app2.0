import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });
  await p.goto("http://localhost:3000/demo/adaptive", { waitUntil: "networkidle" });
  const nailed = p.getByText("✓ Nailed it");
  for (let i = 0; i < 6; i++) { await nailed.click(); await p.waitForTimeout(200); }
  await p.waitForTimeout(600);
  await p.screenshot({ path: "lesson-shots/adaptive-demo-gas.png", fullPage: true });
  await b.close();
  console.log("gas shot saved");
})();
