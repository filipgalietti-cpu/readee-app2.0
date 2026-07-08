import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 2 });
  await p.goto("http://localhost:3000/demo/adaptive", { waitUntil: "networkidle" });
  await p.getByText("Auto-play: struggling reader").click();
  await p.waitForTimeout(13000);
  await p.screenshot({ path: "lesson-shots/adaptive-demo.png", fullPage: true });
  await b.close(); console.log("saved");
})();
