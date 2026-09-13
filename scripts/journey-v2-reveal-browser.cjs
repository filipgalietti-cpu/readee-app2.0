/* eslint-disable @typescript-eslint/no-require-imports -- Standalone local browser regression check. */
const { chromium, expect } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:3443/demo/journey-v2');
      await page.getByRole('button', { name: 'Skip animation', exact: true }).click();
      await expect(page.locator('[data-reveal-card]')).toHaveCount(0);
      for (let replay = 0; replay < 2; replay++) {
        await page.getByLabel('Journey review controls', { exact: true }).click();
        await page.getByRole('button', { name: 'Replay the reveal' }).click();
        await page.getByLabel('Journey review controls', { exact: true }).click();
        // Observe through the complete stagger, including Framer's final transform cleanup.
        const samples = await page.evaluate(async () => {
          const frames = [];
          for (let i = 0; i < 30; i++) {
            const card = document.querySelector('[data-reveal-card]');
            frames.push([...card.querySelectorAll('dl > div')].map((row) => {
              const r = row.getBoundingClientRect();
              const icon = row.querySelector('dt > span').getBoundingClientRect();
              return { x: icon.x - r.x, y: icon.y - r.y };
            }));
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
          return frames;
        });
        for (let row = 0; row < 3; row++) {
          for (const axis of ['x', 'y']) {
            const values = samples.map((frame) => frame[row][axis]);
            expect(Math.max(...values) - Math.min(...values)).toBeLessThan(1);
          }
        }
        await page.screenshot({ path: `/tmp/journey-reveal-stable-${width}.png` });
        await page.getByRole('button', { name: 'Build my journey', exact: true }).click();
        await expect(page.locator('[data-magic-cover]')).toBeVisible();
        await expect(page.locator('[data-reveal-card]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Skip animation', exact: true })).toHaveCount(0);
        if (replay === 0) {
          await page.getByRole('button', { name: 'Show reading journey now' }).click();
        } else {
          await expect(page.locator('.mt-play')).toHaveCount(1);
        }
        await expect(page.locator('[data-magic-cover]')).toHaveCount(0, { timeout: 12000 });
        await expect(page.locator('[data-phase=ready]')).toHaveCount(1, { timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Let’s begin', exact: true })).toBeVisible();
      }
      console.log(`PASS ${width}×${height}: stable icons, repeated reveal, ordered exit/build, skip and finish`);
      await page.close();
    }
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:3443/demo/journey-v2');
    await expect(page.locator('[data-phase=ready]')).toHaveCount(1);
    await expect(page.locator('[data-reveal-card]')).toHaveCount(0);
    expect(errors).toEqual([]);
    console.log('PASS reduced motion; no browser runtime errors');
  } finally {
    await browser.close();
  }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
