/**
 * ROBOT QA — headless playthrough of every engine lesson.
 * Data-driven: reads the lesson manifest and SOLVES each scene correctly
 * (right answers, right order), while recording console errors, page crashes,
 * and failed asset requests. Audio is accelerated 8x so a full lesson plays in
 * seconds. Fails loudly; humans only see the exception list.
 *
 *   npx tsx scripts/lesson-qa.ts                # all lessons
 *   npx tsx scripts/lesson-qa.ts --lesson=<id>  # one
 *   BASE_URL=http://localhost:3000 (default)
 */
import { chromium, type Page } from "playwright";
import { LESSONS } from "../app/data/lessons-v2";
import type { SceneDef } from "../lib/lesson-engine/types";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const only = (process.argv.find((a) => a.startsWith("--lesson=")) ?? "").split("=")[1];
const norm = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

async function solveScene(page: Page, scene: SceneDef): Promise<void> {
  const i = scene.interaction;
  if (!i) return;
  if (i.type === "listen") {
    for (const it of i.items) await page.getByRole("button", { name: `Hear ${it.label}`, exact: true }).click();
  } else if (i.type === "transform") {
    if (!scene.auto) await page.getByRole("button", { name: `Add ${i.add.toUpperCase()}`, exact: true }).click();
    // auto scenes solve themselves on the (accelerated) narration cue
  } else if (i.type === "choose") {
    const correct = i.options.find((o) => o.id === i.correctId)!;
    const labelDupes = i.options.filter((o) => o.label === correct.label).length > 1;
    if (labelDupes && correct.image) {
      // Homonym-style lessons show the SAME word on every tile (pictures differ):
      // disambiguate by the correct tile's image filename (survives next/image URLs).
      const file = correct.image.split("/").pop()!;
      await page.locator(`button:has(img[src*="${file}"])`).click();
    } else {
      await page.getByRole("button", { name: correct.label, exact: true }).click();
    }
  } else if (i.type === "sort") {
    for (const it of i.items) {
      await page.getByRole("button", { name: `Item ${it.label}`, exact: true }).click();
      await page.locator(".gb-bucket", { hasText: it.bucket }).first().click();
      await page.waitForTimeout(150);
    }
  } else if (i.type === "sequence") {
    for (const id of i.order) {
      const item = i.items.find((it) => it.id === id)!;
      await page.getByRole("button", { name: item.label, exact: true }).click();
      await page.waitForTimeout(150);
    }
  } else if (i.type === "highlight") {
    const words = i.text.split(/\s+/);
    for (const t of i.targets) {
      const w = words.find((x) => norm(x) === norm(t)) ?? t;
      await page.getByRole("button", { name: `Word ${w}`, exact: true }).click();
      await page.waitForTimeout(150);
    }
  } else if (i.type === "speak") {
    await page.getByRole("button", { name: /mic not working/ }).click();
  }
  // read-along: solves itself when the accelerated clip ends
}

async function runLesson(id: string): Promise<string[]> {
  const { lesson } = LESSONS[id];
  const errors: string[] = [];
  const browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const page = await browser.newPage();

  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|va\.vercel|posthog|401/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`));
  page.on("requestfailed", (r) => {
    // ERR_ABORTED is expected: "one voice at a time" cancels in-flight audio
    // when the child taps something. Only real failures count.
    if (r.failure()?.errorText === "net::ERR_ABORTED") return;
    if (/\/(audio|images)\/lessons-v2\//.test(r.url())) errors.push(`asset failed: ${r.url().split("/lessons-v2/")[1]}`);
  });
  page.on("response", (r) => {
    if (r.status() === 404 && /\/(audio|images)\/lessons-v2\//.test(r.url()))
      errors.push(`404: ${r.url().split("/lessons-v2/")[1]}`);
  });
  // 8x audio so lessons play in seconds; keep timing semantics intact.
  await page.addInitScript(() => {
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) {
      this.muted = true;
      const p = orig.apply(this, a as []);
      try { this.playbackRate = 8; } catch { /* some states reject */ }
      return p;
    };
  });

  try {
    await page.goto(`${BASE}/demo/${id}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    for (let s = 0; s < lesson.scenes.length; s++) {
      const scene = lesson.scenes[s];
      await page.waitForTimeout(400); // scene mount + narration start
      try {
        await solveScene(page, scene);
      } catch (e) {
        errors.push(`[${scene.id}] interact failed: ${String(e).slice(0, 120)}`);
      }
      const next = page.getByRole("button", { name: /Next →|Finish/ });
      try {
        await next.waitFor({ state: "visible", timeout: 5000 });
        // wait until enabled (audio cues at 8x; praise chains)
        await page.waitForFunction(
          () => {
            const b = [...document.querySelectorAll("button")].find((x) => /Next →|Finish/.test(x.textContent ?? ""));
            return b && !(b as HTMLButtonElement).disabled;
          },
          undefined,
          { timeout: 45000 },
        );
        // DOM click: robot verifies LOGIC, not pixel actionability (fixed overlays
        // like the mascot can confuse Playwright's actionability checks).
        await page.evaluate(() => {
          const b = [...document.querySelectorAll("button")].find((x) => /Next →|Finish/.test(x.textContent ?? ""));
          (b as HTMLButtonElement | undefined)?.click();
        });
      } catch {
        const dump = await page.evaluate(() =>
          [...document.querySelectorAll("button")].map((b) => `${(b.textContent ?? "").slice(0, 20)}|d=${(b as HTMLButtonElement).disabled}`).join(" · "),
        ).catch(() => "no-dump");
        errors.push(`[${scene.id}] STUCK: Next never enabled :: ${dump.slice(0, 300)}`);
        break;
      }
    }
    // completion screen
    try {
      await page.getByText(/You Did It!|Lesson complete/i).first().waitFor({ timeout: 8000 });
    } catch {
      errors.push("never reached the completion screen");
    }
  } catch (e) {
    errors.push(`fatal: ${String(e).slice(0, 160)}`);
  } finally {
    await browser.close();
  }
  return errors;
}

async function main() {
  const ids = Object.keys(LESSONS).filter((id) => !only || id === only);
  let failed = 0;
  console.log(`\nROBOT QA · ${ids.length} lesson(s) · ${BASE}\n`);
  for (const id of ids) {
    process.stdout.write(`  ${id.padEnd(20)} `);
    const errs = await runLesson(id);
    if (errs.length === 0) console.log("✓ PASS");
    else {
      failed++;
      console.log(`✗ FAIL (${errs.length})`);
      for (const e of errs.slice(0, 8)) console.log(`      ${e}`);
    }
  }
  console.log(failed ? `\n${failed} lesson(s) failed.\n` : "\nAll lessons pass. Ship it.\n");
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
