/** Synthetic localhost-only end-to-end verification. No real child or saves.
 * npx tsx scripts/assessment-spectrum-browser.ts
 */
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { SPECTRUM_PASSAGES } from "../app/data/placement-spectrum/reading";
import { countWords } from "../lib/placement/bank";
import { validatePlacementEvidence } from "../lib/placement/validate-evidence";
import { decidePlacement } from "../lib/placement/decide";
import type { PlacementSubmission } from "../lib/placement/types";
const base = process.env.ASSESSMENT_BASE_URL ?? "http://127.0.0.1:3431";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Use an isolated localhost server.");
async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const scenario of [
      { enrolled: 4, wordGrade: 2, readGrade: 2, expected: 2 },
      { enrolled: 0, wordGrade: 4, readGrade: 4, expected: 4 },
      { enrolled: 4, wordGrade: -1, readGrade: 0, expected: 0 },
    ].filter((s) => !process.env.SPECTRUM_FLOOR_ONLY || s.wordGrade === -1)) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      const errors: string[] = [],
        writes: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route("**/*", (route) => {
        if (route.request().method() === "POST") {
          writes.push(new URL(route.request().url()).pathname);
          return route.abort();
        }
        return route.continue();
      });
      await page.goto(`${base}/demo/placement-run?grade=${scenario.enrolled}&robot=1`, {
        waitUntil: "domcontentloaded",
      });
      let lastPassageGrade = 0,
        inLanguage = false,
        letterIndex = 0;
      for (let tick = 0; tick < 1500; tick++) {
        assert.deepEqual(errors, [], "Browser exception");
        if (await page.locator("[data-demo-done]").count()) break;
        const word = page.locator("[data-word]");
        if (await word.count()) {
          const value = await word.getAttribute("data-band");
          const correct = value === "" || Number(value) <= scenario.wordGrade;
          await page.locator(`[data-robot="${correct ? "correct" : "wrong"}"]`).click();
        } else if (await page.locator("[data-robot-passage]").count()) {
          const title = await page.locator(".pa-reading-page h1").innerText();
          const passage = SPECTRUM_PASSAGES.find((p) => p.title === title)!;
          assert(passage, `Unknown passage ${title}`);
          lastPassageGrade = passage.grade;
          const total = countWords(passage.text),
            correct = passage.grade <= scenario.readGrade ? total : Math.floor(total * 0.7);
          await page.getByLabel("words correct", { exact: true }).fill(String(correct));
          await page.getByLabel("words attempted", { exact: true }).fill(String(total));
          await page.locator('[data-robot="passage"]').click();
        } else if (await page.locator('[data-correct="1"]:enabled').count()) {
          inLanguage ||= (await page.locator(".pa-story-label h2").allTextContents()).includes(
            "Listen and think",
          );
          const correct = inLanguage || lastPassageGrade <= scenario.readGrade;
          await page
            .locator(
              correct
                ? `[data-correct="1"]:enabled`
                : `[data-option-id]:not([data-correct="1"]):enabled`,
            )
            .first()
            .click();
          await page.locator("[data-confirm-answer]").click();
        } else if (await page.locator(".pa-letter-choices [data-option-id]:enabled").count()) {
          const target = ["m", "s", "t", "p", "n", "f"][letterIndex++];
          await page
            .locator(
              `.pa-letter-choices [data-option-id]:not([data-option-id="${target}"]):enabled`,
            )
            .first()
            .click();
          await page.locator("[data-confirm-answer]").click();
        }
        await page.waitForTimeout(80);
      }
      assert.equal(
        await page.locator("[data-demo-done]").count(),
        1,
        await page.locator("body").innerText(),
      );
      const payload = JSON.parse(await page.locator("pre").innerText()) as {
        submission: PlacementSubmission;
      };
      const canonical = validatePlacementEvidence(payload.submission, scenario.enrolled as 0 | 4);
      const decision = decidePlacement(canonical);
      assert.equal(decision.placedBand, scenario.expected);
      assert.equal(decision.spectrum?.languageBand, 4);
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      console.log(
        JSON.stringify({
          ...scenario,
          languageBand: decision.spectrum?.languageBand,
          readingStatus: decision.spectrum?.readingStatus,
          words: canonical.spectrum?.words.length,
          passages: canonical.spectrum?.reading.length,
          errors: 0,
          writes: 0,
        }),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
