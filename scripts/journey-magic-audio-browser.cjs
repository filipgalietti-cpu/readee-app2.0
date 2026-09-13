/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser audio regression. */
const { chromium, expect } = require('@playwright/test');
(async () => {
 const browser = await chromium.launch();
 const page = await browser.newPage();
 await page.addInitScript(() => {
   window.magicAudio = [];
   const Native = window.AudioContext;
   window.AudioContext = class extends Native {
     createOscillator() {
       const voice = super.createOscillator();
       const start = voice.start.bind(voice);
       voice.start = (at) => { window.magicAudio.push({ at, context: this.state }); start(at); };
       return voice;
     }
   };
 });
 await page.goto('http://127.0.0.1:3443/demo/journey-v2');
 await page.getByRole('button', { name: 'Build my journey', exact: true }).click();
 await expect(page.locator('.mt-play')).toHaveCount(1);
 await expect.poll(() => page.evaluate(() => window.magicAudio.length)).toBe(11);
 expect(await page.evaluate(() => window.magicAudio.every(v => v.context === 'running'))).toBe(true);
 await expect(page.locator('[data-magic-cover]')).toHaveCount(0, {timeout: 12000});
 await expect(page.locator('[data-phase=ready]')).toHaveCount(1, {timeout: 5000});
 await page.getByRole('button', {name:'Mute journey sounds'}).click();
 await page.getByLabel('Journey review controls', {exact:true}).click();
 await page.getByRole('button', {name:'Replay the reveal'}).click();
 await page.getByLabel('Journey review controls', {exact:true}).click();
 await page.getByRole('button', {name:'Build my journey',exact:true}).click();
 await expect(page.locator('.mt-play')).toHaveCount(1);
 expect(await page.evaluate(() => window.magicAudio.length)).toBe(11);
 await page.getByRole('button', {name:'Show reading journey now'}).click();
 console.log('PASS: 11 synchronized notes in running AudioContext, natural finish, muted replay, skip');
 await browser.close();
})().catch(e => { console.error(e); process.exitCode=1; });
