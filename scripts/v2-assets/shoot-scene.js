/**
 * Render a real lesson scene headlessly and photograph it.
 *
 * Visual work shipped without looking at it is how "he = a boy she = a girl"
 * reached a six-year-old as seventeen loose words. TypeScript compiled; the
 * screen was nonsense. This closes that loop: build, shoot, LOOK, then ship.
 *
 *   node scripts/v2-assets/shoot-scene.js <lessonSlug> <sceneIndex> [outName]
 */
const { chromium } = require('playwright');
const OUT = process.env.SHOT_DIR || '/tmp';
const [slug, idxRaw, name] = process.argv.slice(2);
const idx = Number(idxRaw || 0);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  // Silence audio and let it "finish" instantly so the visual state is reachable
  // without waiting out a 45-second narration.
  await p.addInitScript(() => {
    const M = window.HTMLMediaElement.prototype;
    M.play = function () { setTimeout(() => this.dispatchEvent(new Event('ended')), 60); return Promise.resolve(); };
    Object.defineProperty(M, 'currentTime', { get(){ return 9999; }, set(){}, configurable: true });
  });
  await p.goto(`http://localhost:3211/demo/${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForTimeout(3500);
  // Scenes gate on their interaction, so Next stays disabled until the child
  // answers. Walking a lesson means actually solving each one.
  for (let i = 0; i < idx; i++) {
    const next = p.getByRole('button', { name: /next|finish|→/i }).last();
    for (let attempt = 0; attempt < 8; attempt++) {
      if (await next.count() && await next.isEnabled().catch(() => false)) break;
      // Try every tappable piece until the gate opens. A wrong tap is fine: the
      // engine reveals after two misses, which still advances the scene.
      const tiles = p.locator('.gb-tile, .gb-piece, [class*="gb-"]');
      const n = Math.min(await tiles.count(), 8);
      if (!n) break;
      await tiles.nth(attempt % n).click({ force: true }).catch(() => {});
      await p.waitForTimeout(700);
    }
    if (await next.count()) await next.click({ force: true }).catch(() => {});
    await p.waitForTimeout(1100);
  }
  await p.waitForTimeout(1200);
  const file = `${OUT}/${name || `${slug}-${idx}`}.png`;
  await p.screenshot({ path: file });
  console.log(`  shot: ${file}`);
  await b.close();
})().catch(e => { console.log('  ERROR', e.message.slice(0, 160)); process.exit(1); });
