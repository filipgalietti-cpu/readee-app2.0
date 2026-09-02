import { chromium } from "@playwright/test";
const PROBE = `(() => {
  const out = [];
  for (const el of document.querySelectorAll("span[aria-hidden]")) {
    const cs = getComputedStyle(el);
    const mask = cs.maskImage || cs.webkitMaskImage;
    if (!mask || mask === "none") continue;
    const r = el.getBoundingClientRect();
    const name = (mask.match(/icons\\/ui\\/([^."]+)\\.svg/) || [])[1] || "?";
    if (r.width >= 6 && r.height >= 6) continue;
    out.push({ name, w: Math.round(r.width), h: Math.round(r.height) });
  }
  return out;
})()`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  for (const route of ["/dashboard", "/practice", "/settings"]) {
    await p.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" }).catch(() => {});
    await p.waitForTimeout(1200);
    const zeros = (await p.evaluate(PROBE)) as any[];
    const total = await p.evaluate(`Array.from(document.querySelectorAll("span[aria-hidden]")).filter(e => { const m = getComputedStyle(e).maskImage; return m && m !== "none"; }).length`);
    console.log(`${route} 390px  glyphs=${total}  zero=${zeros.length}`, JSON.stringify(zeros));
  }
  await p.screenshot({ path: "/tmp/glyph-mobile.png" });
  await b.close();
})();
