/* eslint-disable @typescript-eslint/no-require-imports -- Standalone local browser check. */
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const output = fs.mkdtempSync('/tmp/readee-connected-journey-');
const url = 'http://127.0.0.1:3443/demo/journey-v2/connected';
async function review(page, action) {
  await page.getByText('Integration review · synthetic reader', { exact: true }).click();
  await action();
  await page.getByText('Integration review · synthetic reader', { exact: true }).click();
}
(async () => {
  const browser = await chromium.launch();
  const errors = [], writes = [];
  try {
    for (const [label, width, height] of [['desktop', 1440, 900], ['tablet', 820, 1180], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method()) && /\/api\/(checkout|placement|learn|journey)|supabase.*\/rest\//.test(request.url())) writes.push(request.url());
      });
      await page.goto(url);
      await expect(page.locator('[data-live-journey]')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Filus’s reading journey' })).toBeVisible();
      await page.waitForTimeout(800);
      const firstId = await page.locator('[data-node-state=current]').getAttribute('data-lesson');
      await page.getByRole('button', { name: 'Let’s begin', exact: true }).click();
      await expect(page.locator('[data-review-action]')).toContainText(encodeURIComponent(firstId));
      await expect(page.locator('[data-node-state=completed]')).toHaveCount(0);
      await page.locator('[data-node-state=premium] button').first().click();
      await expect(page.locator('[data-review-action]')).toContainText('Existing Readee+ paywall');
      await page.getByRole('button', { name: 'Why this journey?', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('Saved assessment');
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Back to bunny', exact: true }).click();
      await page.waitForTimeout(800);
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
      const viewport = page.locator('[data-world-viewport]');
      expect(await viewport.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
      await page.screenshot({ path: path.join(output, `${label}.png`) });
      await review(page, () => page.getByLabel('Saved completions').selectOption('1'));
      await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel', 'true');
      await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel', 'false', { timeout: 6000 });
      await expect(page.locator(`[data-lesson="${firstId}"]`)).toHaveAttribute('data-node-state', 'completed');
      await review(page, () => page.getByLabel('Saved completions').selectOption('3'));
      await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel', 'false', { timeout: 6000 });
      await page.getByRole('button', { name: 'Open chapter checkpoint' }).click();
      await expect(page.getByRole('dialog')).toContainText('3 of 3 lessons complete');
      await expect(page.getByRole('button', { name: /Collect your unit keepsake/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Explore the next part' }).click();
      await expect(page.locator('[data-node-state=current]')).toHaveCount(1);
      await review(page, () => page.getByLabel('Subscriber', { exact: true }).check());
      await page.getByRole('button', { name: 'Let’s begin', exact: true }).click();
      await expect(page.locator('[data-review-action]')).toContainText('/learn?child=');
      await review(page, () => page.getByLabel('Integration scenario').selectOption('fourth-to-second'));
      await expect(page.getByRole('heading', { name: 'Maya’s reading journey' })).toBeVisible();
      await expect(page.locator('[data-node-state=current]')).toHaveAttribute('data-lesson', /\.2\./);
      await page.screenshot({ path: path.join(output, `${label}-grade-two.png`) });
      await review(page, () => page.getByLabel('Integration scenario').selectOption('provisional'));
      await page.getByRole('button', { name: 'Why this journey?', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('lesson entry');
      await page.keyboard.press('Escape');
      const maximum = await page.getByLabel('Saved completions').locator('option').last().getAttribute('value');
      await review(page, () => page.getByLabel('Saved completions').selectOption(maximum));
      await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel', 'false', { timeout: 6000 });
      await page.getByRole('button', { name: 'View chapter completion keepsake' }).click();
      await page.getByRole('button', { name: /Collect your unit keepsake/ }).click();
      await expect(page.getByRole('button', { name: /Collect your unit keepsake/ })).toHaveCount(0);
      await page.getByRole('button', { name: /Collect your journey trophy/ }).click();
      await expect(page.locator('[data-reward-calls]')).toHaveText('2 reward callbacks');
      console.log(`PASS ${label}: launch/access, saved return hop, part progression, different placement, unit/trophy credit`);
      await page.close();
    }
    expect(errors).toEqual([]); expect(writes).toEqual([]);
    console.log(JSON.stringify({ output, errors, writes }));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
