import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: "readee_sidebar_open", value: "true", domain: "localhost", path: "/" }]);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.screenshot({ path: "/Users/filipgalietti/.claude/jobs/520509e3/tmp/dash-open.png" });
  // check for horizontal overflow
  const overflow = await p.evaluate(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
  console.log("horizontal overflow px:", overflow);
  await b.close();
})();
