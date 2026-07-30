import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/practice?standard=RL.K.2", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.screenshot({ path: "/Users/filipgalietti/.claude/jobs/520509e3/tmp/practice.png", fullPage: true });
  console.log("url:", p.url());
  await b.close();
})();
