/**
 * MCQ layout audit — screenshot the practice MCQ screen at 4 viewports
 * to surface what's above/below the fold per device size. Output drops
 * into ./mcq-audit/ so before/after diffs are easy.
 *
 * Run from repo root:
 *   npx tsx scripts/mcq-viewport-audit.ts
 *
 * Reuses the cached parent auth state at .demo-auth.json (refresh via
 * scripts/record-demo.ts if stale). Pins to RL.K.1 by default; pass
 * a different standard as the first arg.
 */
import { chromium } from "@playwright/test";
import { promises as fs } from "node:fs";
import * as path from "node:path";

const AUTH_PATH = path.resolve(process.cwd(), ".demo-auth.json");
const OUT_DIR = path.resolve(process.cwd(), "mcq-audit");
const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const STANDARD = process.argv[2] ?? "RL.K.1";

const VIEWPORTS = [
  { name: "small-phone-375x667", width: 375, height: 667 },
  { name: "modern-phone-390x844", width: 390, height: 844 },
  { name: "tablet-1024x768", width: 1024, height: 768 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // Resolve childId once via a throwaway context so each viewport can
  // navigate straight to the pinned URL.
  const probe = await browser.newContext({ storageState: AUTH_PATH });
  const probePage = await probe.newPage();
  await probePage.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
  let childId = "";
  try {
    await probePage.waitForFunction(
      () => {
        const a = document.querySelector('a[href*="child="]') as HTMLAnchorElement | null;
        if (!a) return false;
        const m = a.href.match(/child=([^&]+)/);
        return !!(m && m[1] && m[1].length > 10);
      },
      undefined,
      { timeout: 8000 },
    );
    childId =
      (await probePage.evaluate(() => {
        const a = document.querySelector('a[href*="child="]') as HTMLAnchorElement | null;
        const m = a?.href.match(/child=([^&]+)/);
        return m?.[1] ?? "";
      })) ?? "";
  } catch {
    console.error("[audit] failed to resolve childId from dashboard — auth state may be stale.");
    console.error("[audit] refresh via: npx tsx scripts/record-demo.ts capture-auth");
    process.exit(1);
  }
  await probe.close();
  console.log(`[audit] childId = ${childId}`);

  const targetUrl = `${BASE_URL}/practice?standard=${STANDARD}&child=${encodeURIComponent(childId)}`;
  console.log(`[audit] target  = ${targetUrl}`);

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      storageState: AUTH_PATH,
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    // Click through the "Tap to Start" welcome card so we land on the
    // actual question + image + choices view we're auditing.
    await page.waitForTimeout(1800);
    await page
      .locator('button:has-text("Tap to Start")')
      .first()
      .click({ timeout: 4000 })
      .catch(() => {});
    await page.waitForTimeout(2200);

    // Hide dev-only chrome (Next.js dev indicator, feedback widgets)
    // so screenshots reflect what the kid sees, not our dev affordances.
    await page.addStyleTag({
      content: `
        nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button],
        [aria-label*="Open Next.js Dev Tools"],
        button[aria-label*="feedback" i] { display: none !important; }
      `,
    });

    // The "Tap to Start" click triggers a scroll-into-view, leaving the
    // page mid-scroll. Reset to top so the fold screenshot shows what
    // the kid sees the moment the question renders.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(120);

    // Above-the-fold snapshot — exactly what the viewport shows, no scroll.
    const foldPath = path.join(OUT_DIR, `${vp.name}-fold.png`);
    await page.screenshot({ path: foldPath, fullPage: false });

    // Full-page snapshot for context (so we can see what's hidden below).
    const fullPath = path.join(OUT_DIR, `${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    // Sanity probe — measure the bounding box of the MCQ choices grid
    // to confirm whether all 4 fit within the viewport.
    const gridBox = await page
      .locator(".grid.grid-cols-2")
      .first()
      .boundingBox()
      .catch(() => null);
    const choicesTopVisible = gridBox ? gridBox.y : null;
    const choicesBottomVisible = gridBox ? gridBox.y + gridBox.height : null;
    const choicesFitInFold = choicesBottomVisible !== null && choicesBottomVisible <= vp.height;

    console.log(
      `[${vp.name}] grid top=${choicesTopVisible?.toFixed(0)} bottom=${choicesBottomVisible?.toFixed(0)} fits_in_fold=${choicesFitInFold} viewport_h=${vp.height}`,
    );

    await ctx.close();
  }

  await browser.close();
  console.log(`[audit] done — screenshots in ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
