/**
 * Headless browser video capture (Playwright) for landing-page footage.
 * Records a route to webm, advancing through any Next/Continue buttons, then
 * you convert to mp4 with ffmpeg. Silent (no Web-Audio) — fine for muted loops.
 *
 *   node scripts/record-clip.mjs <url> <out.webm> [durationMs] [WxH]
 *   node scripts/record-clip.mjs "http://localhost:3000/demo/blend-builders" /tmp/lesson.webm 18000 1280x800
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const url = process.argv[2];
const out = process.argv[3];
const durationMs = parseInt(process.argv[4] || "16000", 10);
const [W, H] = (process.argv[5] || "1280x800").split("x").map(Number);
if (!url || !out) throw new Error("usage: record-clip.mjs <url> <out.webm> [ms] [WxH]");

mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  recordVideo: { dir: dirname(out), size: { width: W, height: H } },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(1500);

// Optional one-time click (e.g. an "Auto-play" button) then just record.
const initialClick = process.argv[6];
if (initialClick) {
  await page.locator(initialClick).first().click({ timeout: 2000 }).catch(() => {});
  await page.waitForTimeout(durationMs);
  const v = page.video();
  await context.close();
  console.log("SAVED", v ? await v.path() : null);
  await browser.close();
  process.exit(0);
}

// Advance through the lesson: click any Next/Continue/Start/Tap control we see.
const start = Date.now();
const selectors = [
  'button:has-text("Continue")',
  'button:has-text("Next")',
  'button:has-text("Start")',
  'button:has-text("Got it")',
  '[data-next]',
];
while (Date.now() - start < durationMs) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.count().catch(() => 0)) {
      await el.click({ timeout: 800 }).catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(2600);
}

const video = page.video();
await context.close();
const path = video ? await video.path() : null;
await browser.close();
console.log("SAVED", path);
