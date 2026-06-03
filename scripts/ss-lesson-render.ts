/**
 * Render a lesson's slides to PNGs via the desktop canon wireframe, so a
 * rewritten lesson can be eyeballed for real (not just text-checked).
 *
 *   npx tsx scripts/ss-lesson-render.ts RL.1.3 L.3.4 RF.K.2a
 *
 * Uses the cached owner auth at .demo-auth.json. Output → lesson-shots/.
 */
import { chromium } from "@playwright/test";
import * as path from "node:path";
import { promises as fs } from "node:fs";

const AUTH = path.resolve(process.cwd(), ".demo-auth.json");
const OUT = path.resolve(process.cwd(), "lesson-shots");
const stds = process.argv.slice(2);

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  for (const std of stds) {
    await page.goto(`http://localhost:3000/demo/render/${std}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1500);
    let captured = 0;
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(2600); // let the slide's reveals settle
      await page.screenshot({ path: path.join(OUT, `${std}-s${i + 1}.png`) });
      captured++;
      const next = page.getByRole("button", { name: /next|start practice|let.?s go/i });
      if ((await next.count()) === 0 || !(await next.first().isVisible().catch(() => false))) break;
      await next.first().click().catch(() => {});
    }
    console.log(`${std}: ${captured} slide(s) captured`);
  }
  await browser.close();
  console.log(`\nshots → ${OUT}`);
})();
