import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/practice-hub", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(2500);
  // click the "2" grade bubble
  await p.getByRole("button", { name: "2nd Grade" }).click().catch(async () => {
    await p.locator('button', { hasText: /^2$/ }).first().click().catch(()=>{});
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/Users/filipgalietti/.claude/jobs/520509e3/tmp/g2.png", fullPage: true });
  await b.close();
})();
