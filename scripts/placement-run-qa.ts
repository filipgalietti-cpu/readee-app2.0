/**
 * ROBOT QA for the placement RUNNER (no account, no saves): plays
 * /demo/placement-run?robot=1 for 5 enrolled grades x 3 personas and asserts
 * the placed band. Personas: "below" reads words up to (enrolled - 2), "at"
 * up to enrolled, "above" up to enrolled + 1. Comprehension: the robot taps
 * option "a" for the at/above personas' first two questions and the correct
 * answers are unknown to it, so the assertion is on the DECODING band, with
 * the comprehension guard allowed to step down at most one band.
 *
 *   npx tsx scripts/placement-run-qa.ts            # all
 *   npx tsx scripts/placement-run-qa.ts --grade=4 --persona=below
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const onlyGrade = (process.argv.find((a) => a.startsWith("--grade=")) ?? "").split("=")[1];
const onlyPersona = (process.argv.find((a) => a.startsWith("--persona=")) ?? "").split("=")[1];
type Persona = "below" | "at" | "above";

async function stage(page: Page): Promise<string> {
  return (await page.getAttribute("main[data-placement-stage]", "data-placement-stage")) ?? "";
}

async function runOne(enrolled: number, persona: Persona): Promise<string[]> {
  const errors: string[] = [];
  const trueBand = Math.max(0, Math.min(5, persona === "below" ? enrolled - 2 : persona === "above" ? enrolled + 1 : enrolled));
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`));
  page.on("console", (m) => { if (process.argv.includes("--debug") && m.type() !== "error") console.log("  [console]", m.text().slice(0, 140)); if (m.type() === "error" && !/favicon|Failed to load resource|Content Security Policy/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`); });
  await page.goto(`${BASE}/demo/placement-run?robot=1&grade=${enrolled}`, { waitUntil: "networkidle" });

  const deadline = Date.now() + 180000;
  let words = 0, tiles = 0, questions = 0, passages = 0;
  while (Date.now() < deadline) {
    if (await page.$("[data-demo-done]")) break;
    if (await page.$("[data-blocked]")) { errors.push("blocked screen"); break; }
    const robotWord = await page.$("[data-robot-controls]");
    if (robotWord) {
      const band = Number((await page.getAttribute("[data-word]", "data-band")) || "0");
      const word = (await page.getAttribute("[data-word]", "data-word")) ?? "";
      const isWarmup = word === "sun";
      const nonsense = (await page.$("[data-word][data-band='']")) !== null && !isWarmup;
      const correct = isWarmup ? true : nonsense ? trueBand >= 1 : band <= trueBand;
      await page.click(`[data-robot="${correct ? "correct" : "wrong"}"]`);
      words++;
      await page.waitForTimeout(80);
      continue;
    }
    const passage = await page.$("[data-robot-passage]");
    if (passage) {
      const c = 95, t = 100; // the passage is at the child's own level: an accurate read
      await page.fill("[data-robot-passage] input[name=c]", String(c));
      await page.fill("[data-robot-passage] input[name=t]", String(t));
      await page.click('[data-robot="passage"]');
      passages++;
      await page.waitForTimeout(80);
      continue;
    }
    const tile = await page.$("[data-tile]:not([disabled])");
    if (tile) { await tile.click(); tiles++; await page.waitForTimeout(80); continue; }
    const opt = await page.$("[data-option-id]:not([disabled])");
    if (opt) {
      const right = await page.$('[data-option-id][data-correct="1"]:not([disabled])');
      if (right) await right.click(); else await page.click('[data-option-id="a"]');
      questions++; await page.waitForTimeout(80); continue;
    }
    await page.waitForTimeout(120);
  }
  const done = await page.$("[data-demo-done]");
  if (!done) {
    errors.push(`did not finish (stage ${await stage(page)}; words ${words} tiles ${tiles} q ${questions} passages ${passages})`);
    if (process.argv.includes("--debug")) {
      const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
      console.log("---- page text at stall ----\n" + text.slice(0, 600));
      await page.screenshot({ path: `/private/tmp/claude-501/-Users-filipgalietti/1c929a3a-3f57-4806-a2d5-3aafdbeb33d2/scratchpad/robot-stall-${enrolled}-${persona}.png` });
    }
  }
  else {
    const placed = Number(await page.getAttribute("[data-placed-band]", "data-placed-band"));
    const expected = Math.min(4, trueBand);
    if (placed !== expected) errors.push(`placed ${placed}, expected ${expected}`);
    console.log(`  enrolled ${enrolled} ${persona.padEnd(5)} -> placed ${placed} (expected ${expected}) · words ${words} tiles ${tiles} q ${questions} passages ${passages}`);
  }
  await browser.close();
  return errors;
}

async function main() {
  let failed = 0;
  for (const enrolled of [0, 1, 2, 3, 4]) {
    if (onlyGrade && String(enrolled) !== onlyGrade) continue;
    for (const persona of ["below", "at", "above"] as Persona[]) {
      if (onlyPersona && persona !== onlyPersona) continue;
      const errs = await runOne(enrolled, persona);
      if (errs.length) { failed++; console.log(`  FAIL enrolled ${enrolled} ${persona}: ${errs.join(" | ")}`); }
    }
  }
  console.log(failed ? `\n${failed} run(s) failed` : "\nall runs passed");
  process.exit(failed ? 1 : 0);
}
main();
