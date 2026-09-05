/**
 * ROBOT QA for QUIZZES — headless playthrough of every quiz in the manifest.
 * Identifies the on-screen question by its prompt text, answers CORRECTLY from
 * the data, and requires: intro (Let's go → GO), 7 questions, and the summary.
 * Records console errors / crashes / 404s. Audio muted + 8x.
 *
 *   npx tsx scripts/quiz-qa.ts                 # all quizzes
 *   npx tsx scripts/quiz-qa.ts --quiz=<id>
 */
import { chromium, type Page } from "playwright";
import { QUIZZES } from "../app/data/quizzes-v2";
import type { QuizDef, QuizQuestion } from "../lib/lesson-engine/quiz";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const only = (process.argv.find((a) => a.startsWith("--quiz=")) ?? "").split("=")[1];

async function solve(page: Page, q: QuizQuestion): Promise<void> {
  const i = q.interaction;
  if (i.type === "choose") {
    const correct = i.options.find((o) => o.id === i.correctId)!;
    await page.getByRole("button", { name: correct.label, exact: true }).click();
  } else if (i.type === "sort") {
    for (const it of i.items) {
      await page.getByRole("button", { name: `Item ${it.label}`, exact: true }).click();
      await page.locator(".gb-bucket", { hasText: it.bucket }).first().click();
      await page.waitForTimeout(200);
    }
  } else if (i.type === "sequence") {
    // same driver as lesson-qa: tap the pool tiles in the correct order
    for (const id of i.order) {
      const item = i.items.find((it) => it.id === id)!;
      await page.getByRole("button", { name: item.label, exact: true }).click();
      await page.waitForTimeout(150);
    }
  } else if (i.type === "speak") {
    await page.getByRole("button", { name: /mic not working/ }).click();
  } else if (i.type === "transform") {
    await page.getByRole("button", { name: `Add ${i.add.toUpperCase()}`, exact: true }).click();
  }
}

async function runQuiz(id: string, quiz: QuizDef): Promise<string[]> {
  const errors: string[] = [];
  const browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|va\.vercel|posthog|401/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 140)}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 140)}`));
  page.on("response", (r) => {
    if (r.status() === 404 && /\/(audio|images)\//.test(r.url())) errors.push(`404: ${r.url().split("/public/")[0].slice(-80)}`);
  });
  await page.addInitScript(() => {
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) {
      this.muted = true;
      const p = orig.apply(this, a as []);
      try { this.playbackRate = 8; } catch { /* ok */ }
      return p;
    };
  });

  try {
    await page.goto(`${BASE}/demo/quiz/${quiz.lessonId}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // intro: Let's go → countdown → GO
    await page.getByRole("button", { name: /let'?s go/i }).click({ timeout: 10000 });
    // questions — track which prompts we've already answered so the feedback
    // beat (previous question still on screen) can't be re-matched.
    const seen = new Set<string>();
    for (let n = 0; n < quiz.askCount; n++) {
      await page.waitForTimeout(600);
      let matched: QuizQuestion | null = null;
      for (let tries = 0; tries < 60 && !matched; tries++) {
        const qid = await page
          .evaluate(() => (document.querySelector("[data-qid]") as HTMLElement | null)?.dataset.qid ?? "")
          .catch(() => "");
        if (qid && !seen.has(qid)) matched = quiz.questions.find((q) => q.id === qid) ?? null;
        if (!matched) await page.waitForTimeout(500);
      }
      if (matched) seen.add(matched.id);
      if (!matched) {
        const dump = await page.evaluate(() => document.body.innerText.replace(/\n+/g, " | ").slice(0, 400)).catch(() => "?");
        errors.push(`Q${n + 1}: no known prompt on screen :: ${dump}`);
        break;
      }
      try {
        await solve(page, matched);
      } catch (e) {
        errors.push(`Q${n + 1} (${matched.id}): solve failed ${String(e).slice(0, 100)}`);
        break;
      }
      await page.waitForTimeout(1200); // feedback beat (8x audio)
    }
    // summary (or seal → summary)
    try {
      await page.getByText(/Perfect Score!|Great Work!|Good Effort!|Keep Trying!/).first().waitFor({ timeout: 20000 });
    } catch {
      errors.push("never reached the summary");
    }
  } catch (e) {
    errors.push(`fatal: ${String(e).slice(0, 140)}`);
  } finally {
    await browser.close();
  }
  return errors;
}

async function main() {
  const entries = Object.entries(QUIZZES).filter(([id]) => !only || id === only);
  let failed = 0;
  console.log(`\nQUIZ ROBOT · ${entries.length} quiz(zes) · ${BASE}\n`);
  for (const [id, quiz] of entries) {
    process.stdout.write(`  ${id.padEnd(24)} `);
    const errs = await runQuiz(id, quiz);
    if (errs.length === 0) console.log("✓ PASS");
    else {
      failed++;
      console.log(`✗ FAIL (${errs.length})`);
      for (const e of errs.slice(0, 6)) console.log(`      ${e}`);
    }
  }
  console.log(failed ? `\n${failed} failed.\n` : "\nAll quizzes pass.\n");
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
