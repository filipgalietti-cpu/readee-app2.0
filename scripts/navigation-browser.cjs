const { chromium, expect } = require('@playwright/test');
const base = process.env.PLACEMENT_BASE_URL || 'http://127.0.0.1:3431';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/api/**', async route => {
        if (route.request().method() !== 'GET') throw new Error('Unexpected write during navigation QA: ' + route.request().url());
        await route.continue();
      });
      await page.goto(base + '/demo/navigation/journey', { waitUntil: 'load' });
      await expect(page.locator('[data-navigation-ready="true"]')).toBeVisible();
      const note = page.getByRole('textbox', { name: 'Shared-layout test note' });
      await note.fill('Keep my place');
      await page.evaluate(() => {
        window.originalShell = document.querySelector('[data-app-content]');
        window.originalSidebar = document.querySelector('aside');
        window.navigationFrames = [];
        const track = () => {
          const shell = document.querySelector('[data-app-content]');
          const loading = document.querySelector('[data-page-loading]');
          const bounds = shell?.getBoundingClientRect();
          window.navigationFrames.push({ shellSame: shell === window.originalShell, sidebarSame: document.querySelector('aside') === window.originalSidebar, fullScreenLoader: !!document.querySelector('[data-reader-loading]'), x: bounds?.x, loader: !!loading, loaderPosition: loading ? getComputedStyle(loading).position : null });
          window.navFrame = requestAnimationFrame(track);
        };
        window.navFrame = requestAnimationFrame(track);
      });
      await page.getByRole('link', { name: 'Library preview' }).click();
      await expect(page.locator('[data-navigation-page="library"]')).toBeVisible({ timeout: 30000 });
      await expect(note).toHaveValue('Keep my place');
      await expect(page.locator('[data-route-progress]')).toHaveCount(0, { timeout: 3000 });
      await page.getByRole('link', { name: 'Details tab' }).click();
      await expect(page.locator('[data-navigation-tab="details"]')).toBeVisible();
      await expect(page.locator('[data-route-progress]')).toHaveCount(0, { timeout: 1500 });
      await page.getByRole('link', { name: 'Jump to notes' }).click();
      await page.waitForTimeout(220);
      await expect(page.locator('[data-route-progress]')).toHaveCount(0);
      await page.getByRole('link', { name: 'Settings preview' }).click();
      await expect(page.locator('[data-navigation-page="settings"]')).toBeVisible();
      await page.goBack();
      await expect(page.locator('[data-navigation-page="library"]')).toBeVisible({ timeout: 15000 }).catch(async e => { console.log('History failure', page.url(), await page.locator('body').innerText(), errors); throw e; });
      await page.waitForTimeout(250);
      await expect(page.locator('[data-route-progress]')).toHaveCount(0, { timeout: 1500 });
      await page.goForward();
      await expect(page.locator('[data-navigation-page="settings"]')).toBeVisible();
      await page.waitForTimeout(250);
      await expect(page.locator('[data-route-progress]')).toHaveCount(0, { timeout: 1500 });
      await page.getByRole('link', { name: 'Library preview' }).click();
      await page.getByRole('link', { name: 'Journey preview' }).click();
      await expect(page.locator('[data-navigation-page="journey"]')).toBeVisible();
      await expect(note).toHaveValue('Keep my place');
      await expect(page.locator('[data-route-progress]')).toHaveCount(0, { timeout: 1500 });
      const frames = await page.evaluate(() => { cancelAnimationFrame(window.navFrame); return window.navigationFrames; });
      expect(frames.every(f => f.shellSame && f.sidebarSame && !f.fullScreenLoader)).toBe(true);
      expect(new Set(frames.map(f => f.x)).size).toBe(1);
      expect(frames.filter(f => f.loader).every(f => f.loaderPosition !== 'fixed')).toBe(true);
      expect(frames.some(f => f.loader)).toBe(true);
      expect(errors).toEqual([]);
      await page.screenshot({ path: `/private/tmp/readee-navigation-${width}.png` });
      await page.evaluate(() => { window.originalHeader = document.querySelector('[data-site-header]'); });
      await page.getByRole('link', { name: 'Reading preview' }).click();
      await expect(page.locator('[data-begin]')).toBeVisible({ timeout: 30000 });
      expect(await page.evaluate(() => document.querySelector('[data-site-header]') === window.originalHeader)).toBe(true);
      expect(await page.locator('[data-site-header]').evaluate(e => e.hidden)).toBe(true);
      expect(await page.evaluate(() => getComputedStyle(document.body).paddingTop)).toBe('0px');
      await page.goBack();
      await expect(page.locator('[data-navigation-page="journey"]')).toBeVisible();
      expect(await page.evaluate(() => document.querySelector('[data-site-header]') === window.originalHeader)).toBe(true);
      expect(await page.locator('[data-site-header]').evaluate(e => e.hidden)).toBe(false);
      await expect(page.locator('[data-site-header] nav')).toBeVisible();
      expect(await page.evaluate(() => getComputedStyle(document.body).paddingTop)).toBe('76px');
      console.log(`Passed ${width}px: shell/sidebar preserved, no fullscreen loader or horizontal jump, query/hash/history/rapid navigation, in-page loading.`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
