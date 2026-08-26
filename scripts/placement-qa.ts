/**
 * ROBOT QA for the PLACEMENT EXAM — plays /demo/placement for every grade
 * entry point, answering CORRECTLY from the bank (identified by data-qid),
 * and requires: 15 questions served, difficulty CLIMBING (all-correct must
 * ride the staircase up), and a summary with a "Reading level:" note.
 *
 *   npx tsx scripts/placement-qa.ts            # all 5 grades
 *   npx tsx scripts/placement-qa.ts --grade=4
 */
import { chromium } from "playwright";
import { placementPool, PLACEMENT_ASK } from "../lib/lesson-engine/placement";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const only = (process.argv.find((a) => a.startsWith("--grade=")) ?? "").split("=")[1];

async function runGrade(gradeIdx: number): Promise<string[]> {
  const errors: string[] = [];
  const byId = new Map(placementPool().map((q) => [q.id, q]));
  const browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 140)}`));
  await page.addInitScript(() => {
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) {
      this.muted = true;
      const p = orig.apply(this, a as []);
      try { this.playbackRate = 8; } catch { /* ok */ }
      return p;
    };
  });

  const climbed: number[] = [];
  try {
    await page.goto(`${BASE}/demo/placement`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.locator(`[data-grade="${gradeIdx}"]`).click({ timeout: 10000 });
    await page.getByRole("button", { name: /let'?s go/i }).click({ timeout: 10000 });
    const seen = new Set<string>();
    for (let n = 0; n < PLACEMENT_ASK; n++) {
      let qid = "";
      for (let tries = 0; tries < 60 && !qid; tries++) {
        const got = await page
          .evaluate(() => (document.querySelector("[data-qid]") as HTMLElement | null)?.dataset.qid ?? "")
          .catch(() => "");
        if (got && !seen.has(got)) qid = got;
        else await page.waitForTimeout(500);
      }
      const q = byId.get(qid);
      if (!q) {
        const dump = await page.evaluate(() => document.body.innerText.replace(/\n+/g, " | ").slice(0, 300)).catch(() => "?");
        errors.push(`Q${n + 1}: unknown question on screen :: ${dump}`);
        break;
      }
      seen.add(qid);
      climbed.push(q.globalDifficulty);
      const i = q.interaction;
      if (i.type !== "choose") { errors.push(`Q${n + 1} (${qid}): not a choose`); break; }
      const correct = i.options.find((o) => o.id === i.correctId)!;
      try {
        // long legacy narrations can gate the options; be patient, then match by
        // normalized text (accessible-name quirks on long labels)
        await page.getByRole("button", { name: correct.label, exact: true }).first()
          .click({ timeout: 30000 })
          .catch(async () => {
            // string-form evaluate: tsx/esbuild injects a __name helper into
            // serialized closures that doesn't exist in the page
            const ok = await page.evaluate(`(() => {
              const label = ${JSON.stringify(correct.label)};
              const norm = (t) => t.replace(/\\s+/g, " ").trim().toLowerCase();
              const b = Array.from(document.querySelectorAll("button")).find(
                (x) => norm(x.textContent || "") === norm(label));
              if (b) { b.click(); return true; }
              return false;
            })()`);
            if (!ok) throw new Error("no matching option button");
          });
      } catch (e) {
        errors.push(`Q${n + 1} (${qid}): click failed ${String(e).slice(0, 80)}`);
        break;
      }
      await page.waitForTimeout(1200);
    }
    try {
      await page.getByText(/Reading level:/).first().waitFor({ timeout: 25000 });
    } catch {
      errors.push("never reached the summary / no Reading level note");
    }
    // all-correct run must END harder than it started (the staircase works)
    if (climbed.length >= 5 && climbed[climbed.length - 1] <= climbed[0]) {
      errors.push(`ladder did not climb: ${climbed[0]} → ${climbed[climbed.length - 1]}`);
    }
  } catch (e) {
    errors.push(`fatal: ${String(e).slice(0, 140)}`);
  } finally {
    await browser.close();
  }
  if (errors.length === 0)
    console.log(`      ladder: ${climbed[0]} → ${climbed[climbed.length - 1]} (${climbed.length} Qs)`);
  return errors;
}

async function main() {
  const grades = [0, 1, 2, 3, 4].filter((g) => !only || String(g) === only);
  let failed = 0;
  console.log(`\nPLACEMENT ROBOT · ${grades.length} grade(s) · ${BASE}\n`);
  for (const g of grades) {
    console.log(`  grade ${g}:`);
    const errs = await runGrade(g);
    if (errs.length === 0) console.log("      ✓ PASS");
    else {
      failed++;
      console.log(`      ✗ FAIL (${errs.length})`);
      for (const e of errs.slice(0, 5)) console.log(`        ${e}`);
    }
  }
  console.log(failed ? `\n${failed} failed.\n` : "\nAll placements pass.\n");
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
