import { chromium } from "@playwright/test";

/**
 * Post-migration icon audit.
 *
 * Catches the two failure modes a type checker cannot see:
 *   1. a masked Glyph that paints at zero size (collapsed parent), and
 *   2. a Glyph or FluentIcon pointing at an SVG that 404s, which still
 *      measures 20x20 but renders nothing.
 * Both look like "the icon is just missing" in a screenshot, which is how the
 * half-swapped state survived the first pass.
 */
const ROUTES = [
  "/dashboard", "/journey", "/practice", "/practice-hub", "/library", "/daily",
  "/shop", "/leaderboard", "/luna", "/luna/studio", "/settings", "/analytics",
  "/more", "/notifications", "/feedback", "/levels", "/carrot-rewards",
  "/roadmap", "/assessment", "/discover", "/today", "/community",
];

const PROBE = `(() => {
  const zero = [];
  let masked = 0, imgs = 0;
  for (const el of document.querySelectorAll("span[aria-hidden]")) {
    const cs = getComputedStyle(el);
    const mask = cs.maskImage || cs.webkitMaskImage;
    if (!mask || mask === "none") continue;
    masked++;
    const r = el.getBoundingClientRect();
    if (r.width >= 6 && r.height >= 6) continue;
    // an element inside a breakpoint-hidden container is correct, not a bug
    let p = el, hidden = false;
    while (p && p !== document.body) {
      if (getComputedStyle(p).display === "none") { hidden = true; break; }
      p = p.parentElement;
    }
    if (hidden) continue;
    const name = (mask.match(/icons\\/ui\\/([^."]+)\\.svg/) || [])[1] || "?";
    zero.push({ name, w: Math.round(r.width), h: Math.round(r.height) });
  }
  for (const el of document.querySelectorAll('img[src*="/icons/fluent/"]')) imgs++;
  return { masked, imgs, zero };
})()`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    storageState: ".demo-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  await ctx.addCookies([
    { name: "readee_sidebar_open", value: "true", domain: "localhost", path: "/" },
  ]);
  const p = await ctx.newPage();

  // any icon asset that 404s is a silently invisible icon
  const missing = new Set<string>();
  p.on("response", (r) => {
    const u = r.url();
    if (/\/icons\/(ui|fluent)\//.test(u) && r.status() >= 400) missing.add(`${r.status()} ${u}`);
  });

  let zeros = 0, totalMasked = 0, totalImgs = 0;
  for (const route of ROUTES) {
    await p.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" }).catch(() => {});
    await p.waitForTimeout(900);
    const r = (await p.evaluate(PROBE)) as { masked: number; imgs: number; zero: any[] };
    totalMasked += r.masked;
    totalImgs += r.imgs;
    zeros += r.zero.length;
    const flag = r.zero.length ? `  ZERO-SIZE: ${JSON.stringify(r.zero)}` : "";
    console.log(`${route.padEnd(18)} glyph=${String(r.masked).padStart(3)}  fluent=${String(r.imgs).padStart(3)}${flag}`);
  }

  console.log(`\nglyph renders: ${totalMasked}   fluent renders: ${totalImgs}`);
  console.log(`zero-size (visible container): ${zeros}`);
  console.log(`missing icon assets: ${missing.size}`);
  for (const m of missing) console.log("   " + m);
  await b.close();
  process.exit(zeros === 0 && missing.size === 0 ? 0 : 1);
})();
