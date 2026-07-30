import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/practice-hub", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.screenshot({ path: "/Users/filipgalietti/.claude/jobs/520509e3/tmp/ph-fill.png", fullPage: true });
  await b.close();
})();
