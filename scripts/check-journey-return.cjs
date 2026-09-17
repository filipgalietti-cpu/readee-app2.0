// Synthetic local map; no accounts, saves, rewards or external requests.
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true});
 const results=[];
 try {
  for (const reduced of [false,true]) {
   const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'});
   await context.route('**/*',route=>new URL(route.request().url()).hostname==='localhost'?route.continue():route.abort());
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://localhost:3336/demo/journey-v2/connected',{waitUntil:'networkidle'});
   await page.getByText('Integration review · synthetic reader',{exact:true}).click();
   const saved=page.getByLabel('Saved completions');
   const chapter=page.getByLabel('Choose journey chapter');
   await saved.selectOption('1');
   await expect(page.locator('[data-live-journey] header')).toContainText('1 of');
   if (!reduced) await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel','true');
   await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel','false',{timeout:8000});
   await expect(chapter).toHaveValue('0');
   // The first chapter has three lessons; save3 must land in the next chapter.
   await saved.selectOption('3');
   await expect(chapter).toHaveValue('1',{timeout:8000});
   await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel','false');
   // Repeat the same return in this session: no checkpoint trap or replayed hop.
   await saved.selectOption('0');await saved.selectOption('3');
   await expect(chapter).toHaveValue('1',{timeout:1500});
   await expect(page.locator('[data-bunny]')).toHaveAttribute('data-travel','false');
   await expect(page.locator('[data-reward-calls]')).toHaveText('0 reward callbacks');
   await page.getByText('Integration review · synthetic reader',{exact:true}).click();
   await expect(page.locator('[data-bunny]')).toHaveCSS('opacity','1');
   await page.screenshot({path:`/private/tmp/journey-return-${reduced?'reduced':'normal'}.png`});
   expect(errors).toEqual([]);
   results.push({reducedMotion:reduced,adjacent:true,chapterBoundary:true,repeatedReturn:true,noRewardWrite:true,pageErrors:errors});
   await context.close();
  }
  fs.writeFileSync('/private/tmp/journey-return-browser.json',JSON.stringify({passed:true,results},null,2));
  console.log(JSON.stringify({passed:true,results}));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
