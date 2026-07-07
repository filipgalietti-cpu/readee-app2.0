/**
 * Render a lesson's slides at PHONE size (390x844) so the mobile shell
 * (LessonShellMobile, auto-activated <1024px) can be eyeballed/vision-
 * audited for layout, dead-space, text sizing, fork columns, etc.
 *
 *   npx tsx scripts/ss-lesson-render-mobile.ts RL.K.1 L.3.4b ...
 *
 * Output → lesson-shots-mobile/<std>-s<N>.png. Uses cached owner auth.
 */
import { chromium } from "@playwright/test";
import * as path from "node:path";
import { promises as fs } from "node:fs";

const AUTH = path.resolve(process.cwd(), ".demo-auth.json");
const OUT = path.resolve(process.cwd(), "lesson-shots-mobile");
const rawArgs = process.argv.slice(2);
const stds = rawArgs.length === 1 && rawArgs[0].endsWith(".txt")
  ? require("node:fs").readFileSync(rawArgs[0], "utf-8").trim().split(/\s+/).filter(Boolean)
  : rawArgs;

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  for (const std of stds) {
    await page.goto(`http://localhost:3000/demo/render/${std}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    let captured = 0;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(2600);
      await page.screenshot({ path: path.join(OUT, `${std}-s${i + 1}.png`) });
      captured++;
      const next = page.getByRole("button", { name: /next|start practice|let.?s go/i });
      if ((await next.count()) === 0 || !(await next.first().isVisible().catch(() => false))) break;
      await next.first().click().catch(() => {});
    }
    console.log(`${std}: ${captured} slide(s)`);
  }
  await browser.close();
  console.log(`\nmobile shots → ${OUT}`);
})();
