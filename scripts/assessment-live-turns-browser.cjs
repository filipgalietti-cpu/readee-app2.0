/** Local synthetic regression checks. No live child, email or database writes. */
const { chromium, expect } = require('@playwright/test');
const base = 'http://127.0.0.1:3431';
(async () => {
  const browser = await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:800},permissions:['microphone'],reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',route=>route.request().method()==='POST' ? route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,saidAs:'fee-LOOSH',audioUrl:'/audio/placement-spectrum/ask-name.mp3'})}) : route.continue());
    await page.goto(base+'/demo/placement-studio');
    for(const width of [1280,390,320]){
      await page.setViewportSize({width,height:width===320?568:844});
      const positions=[];
      for(const index of ['21','2','22']){
        await page.getByRole('combobox').selectOption(index);
        await expect(page.locator('.pa-word-task')).toBeVisible();
        const box=await page.locator('.pa-reading-word').boundingBox();positions.push(box);
        await expect(page.locator('[data-finish-speaking]')).toBeInViewport();
        await expect(page.locator('[data-skip-word]')).toBeInViewport();
        const rabbit=await page.locator('.pa-word-bunny').boundingBox();
        expect(rabbit.x+rabbit.width/2).toBeLessThan(width/2);
      }
      expect(Math.max(...positions.map(p=>p.y))-Math.min(...positions.map(p=>p.y))).toBeLessThan(1);
      console.log('Stable word card and left rabbit:',width);
      await page.screenshot({path:`/private/tmp/round3-word-${width}.png`});
    }
    await page.setViewportSize({width:1280,height:900});
    await page.getByRole('combobox').selectOption('23');
    await expect(page.getByRole('heading',{name:'What is your name?'})).toBeVisible();
    await expect(page.locator('[data-say-name-record]')).toHaveText('Stop');
    await page.locator('[data-say-name-record]').click();
    await expect(page.getByRole('button',{name:'Hear Luna say it',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Let’s read',exact:true})).toBeVisible();
    console.log('Child name capture starts after prompt and offers pronunciation preview.');
    await page.goto(base+'/demo/placement-reveal');
    await page.getByRole('button',{name:'Wizard',exact:true}).click();
    await expect(page.locator('[aria-label="Card 1 of 7"]')).toBeVisible();
    await page.waitForTimeout(8000);
    await expect(page.locator('[aria-label="Card 1 of 7"]')).toBeVisible();
    await expect(page.getByText('Luna’s narration is getting ready. This slide will stay here.')).toBeVisible();
    console.log('Missing narration holds the current slide.');
    await page.getByLabel('Narration playback test').selectOption('delayed');
    await page.waitForTimeout(4000);
    await expect(page.locator('[aria-label="Card 1 of 7"]')).toBeVisible();
    await expect(page.locator('[aria-label="Card 2 of 7"]')).toBeVisible({timeout:14000});
    await page.getByRole('button',{name:'Turn the voice off',exact:true}).click();
    await page.waitForTimeout(8000);
    await expect(page.locator('[aria-label="Card 2 of 7"]')).toBeVisible();
    console.log('Late audio starts, waits for completion plus reading pause, and mute holds.');
    await page.getByLabel('Narration playback test').selectOption('failed');
    await page.getByRole('button',{name:'Turn the voice on',exact:true}).click();
    await expect(page.getByText('The narration couldn’t play. This slide will stay here.')).toBeVisible({timeout:20000});
    await page.waitForTimeout(8000);
    await expect(page.locator('[aria-label="Card 2 of 7"]')).toBeVisible();
    console.log('Playback failure is visible and does not advance.');
    expect(errors).toEqual([]);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
