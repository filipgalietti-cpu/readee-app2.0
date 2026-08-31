/**
 * Warm-Up Arcade robot playthrough — drives generated warm-ups end to end on
 * the dynamic demo route and reports whether the celebration was reached and
 * call-out audio actually got requested.
 *
 *   npx tsx scripts/warmup-robot.ts silent-e-warmup word-math-warmup ...
 *
 * Tap rounds: polls the field for tiles whose text is a target word and
 * pointer-downs them. Builder rounds: pointer-downs a build's two parts in
 * order as they float by. Both then wait out the 45s round for the end screen.
 */
import { chromium, type Page } from "@playwright/test";
import { pathToFileURL } from "node:url";
import * as path from "node:path";
import type { WarmupDef } from "../lib/warmup-engine/types";

const BASE = process.env.ROBOT_BASE ?? "http://localhost:3000";
const SHOT_DIR = process.env.ROBOT_SHOT_DIR ?? "";
const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (!ids.length) {
  console.error("Usage: npx tsx scripts/warmup-robot.ts <warmup-id> [...]");
  process.exit(1);
}

async function loadDef(id: string): Promise<WarmupDef> {
  const p = path.join(process.cwd(), "app/data/warmups-v2/gen", `${id}.ts`);
  const mod = await import(pathToFileURL(p).href);
  return mod.warmupDef as WarmupDef;
}

/** Click visible elements whose exact text is one of `words`. `max` caps taps
 *  (builder rounds must tap exactly one floater per part — duplicate parts on
 *  the field would otherwise fill both bench slots with the same word). */
async function tapWords(page: Page, words: string[], max = Infinity): Promise<number> {
  return page.evaluate(({ targets, cap }: { targets: string[]; cap: number }) => {
    let hits = 0;
    for (const el of Array.from(document.querySelectorAll("div"))) {
      if (hits >= cap) break;
      const t = el.textContent?.trim();
      if (!t || !targets.includes(t)) continue;
      // climb to the interactive node (cursor:pointer with a pointerdown handler)
      let n: HTMLElement | null = el as HTMLElement;
      for (let i = 0; i < 4 && n; i++) {
        if (getComputedStyle(n).cursor === "pointer") {
          n.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          hits++;
          break;
        }
        n = n.parentElement;
      }
    }
    return hits;
  }, { targets: words, cap: max === Infinity ? 1e9 : max });
}

/** Words currently on the field (text of cursor:pointer floaters). */
async function visibleWords(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll("div"))) {
      if (getComputedStyle(el).cursor !== "pointer" || el.style.pointerEvents === "none") continue;
      const t = el.textContent?.trim();
      if (t && /^[a-z]{1,14}$/.test(t)) out.push(t);
    }
    return out;
  });
}

async function run(id: string) {
  const def = await loadDef(id);
  const targets = def.waves.flatMap((w) => w.tiles.filter((t) => t.isMatch).map((t) => t.word));
  const audioReqs = new Set<string>();
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("request", (r) => {
    const u = r.url();
    if (u.includes(`/audio/warmups-v2/${id}/`)) audioReqs.add(u.split("/").pop()!);
  });
  const result = { id, celebrated: false, score: -1, callouts: 0, intro: false, celebrateClip: false, overflow: false, error: "" };
  try {
    await page.goto(`${BASE}/demo/warmup/${id}`, { waitUntil: "networkidle", timeout: 30000 });
    // Tap rounds say "Let's play!", builder rounds say "Let's build!".
    await page.getByRole("button", { name: /let'?s (play|build)/i }).click({ timeout: 15000 });
    await page.getByRole("button", { name: /^skip$/i }).click({ timeout: 10000 });
    // countdown 3-2-1-GO ≈ 3.2s, then the 45s round
    await page.waitForTimeout(3600);
    const deadline = Date.now() + (def.playSeconds ?? 45) * 1000 + 6000;
    if (def.mode === "builder") {
      // Tap a build only when BOTH its parts are on the field right now —
      // waiting on a fixed build order stalls when the partner never spawns.
      const remaining = (def.builds ?? []).map((b) => b.parts);
      while (Date.now() < deadline && remaining.length) {
        const vis = await visibleWords(page);
        const idx = remaining.findIndex(([a, b]) => vis.includes(a) && vis.includes(b));
        if (idx >= 0) {
          const [a, b] = remaining[idx];
          if ((await tapWords(page, [a], 1)) > 0) {
            await page.waitForTimeout(650);
            if ((await tapWords(page, [b], 1)) > 0) {
              remaining.splice(idx, 1);
              await page.waitForTimeout(2600);
              continue;
            }
          }
        }
        await page.waitForTimeout(500);
        if (await page.getByText(/you (caught|built)|great warm up/i).count()) break;
      }
      while (Date.now() < deadline) {
        if (await page.getByText(/you built|you caught|great warm up/i).count()) break;
        await page.waitForTimeout(800);
      }
    } else {
      while (Date.now() < deadline) {
        await tapWords(page, targets);
        if (await page.getByText(/you caught \d+|great warm up/i).count()) break;
        await page.waitForTimeout(450);
      }
    }
    await page.waitForTimeout(1500);
    const endText = await page.getByText(/you caught \d+|you built \d+|great warm up/i).first().textContent().catch(() => null);
    result.celebrated = !!endText;
    result.score = parseInt(endText?.match(/\d+/)?.[0] ?? "-1", 10);
    result.intro = audioReqs.has("intro.mp3");
    result.callouts = [...audioReqs].filter((f) => f.startsWith("w-")).length;
    result.celebrateClip = audioReqs.has("celebrate.mp3") || audioReqs.has("celebrate-zero.mp3");
    result.overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return d.scrollWidth > window.innerWidth + 1 || d.scrollHeight > window.innerHeight + 1;
    });
    if (SHOT_DIR) await page.screenshot({ path: path.join(SHOT_DIR, `gen-${id}.png`) });
  } catch (e) {
    result.error = String((e as Error)?.message ?? e).slice(0, 200);
  } finally {
    await browser.close();
  }
  const ok = result.celebrated && result.intro && result.celebrateClip && !result.overflow && !result.error;
  console.log(`${ok ? "PASS" : "FAIL"} ${id}  celebrated=${result.celebrated} score=${result.score} intro=${result.intro} callouts=${result.callouts} celebrateClip=${result.celebrateClip} overflow=${result.overflow} ${result.error}`);
  return ok;
}

(async () => {
  let allOk = true;
  for (const id of ids) allOk = (await run(id)) && allOk;
  process.exit(allOk ? 0 : 1);
})();
