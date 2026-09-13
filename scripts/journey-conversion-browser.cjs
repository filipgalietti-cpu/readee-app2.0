const {chromium,expect}=require('@playwright/test');
(async()=>{const browser=await chromium.launch();try{
for(const width of (process.env.JOURNEY_WIDTHS?.split(',').map(Number) || [320,390,768,1280])){
 const p=await browser.newPage({viewport:{width,height:900}});const errors=[];let checkouts=0;
 p.on('pageerror',e=>errors.push(e.stack));await p.route('**/api/**',r=>{if(r.request().url().includes('/checkout'))checkouts++;return r.fulfill({json:{}})});await p.route('**/*.supabase.co/**',r=>r.fulfill({json:[]}));
 await p.goto('http://127.0.0.1:3443/demo/journey');
 await expect(p.locator('[data-map-building=true]')).toBeVisible({timeout:30000});
 await expect(p.locator('[data-map-building=false]')).toBeVisible({timeout:12000});
 await expect.poll(()=>p.evaluate(()=>Math.abs(scrollY-Math.max(0,document.getElementById('journey-introduction').getBoundingClientRect().top+scrollY-88)))).toBeLessThan(3);
 await expect(p.locator('[data-journey-overview]')).toContainText('Hear and make words that rhyme.');
 await expect(p.locator('[data-journey-main-offer]')).toContainText('$9.99/mo');
 await expect(p.locator('[data-journey-main-offer]')).toContainText('Credit card required');
 await expect(p.getByRole('tablist',{name:'Lesson grade'})).not.toBeVisible();
 await expect(p.locator('[data-lesson-purpose]').first()).toHaveText('Hear and make words that rhyme.');
 expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await p.screenshot({path:`/private/tmp/journey-conversion-${width}.png`});
 await p.locator('[data-journey-primary-trial]').click();await expect(p.locator('[data-paywall-modal]')).toBeVisible();expect(checkouts).toBe(0);await p.keyboard.press('Escape');
 await p.getByRole('button',{name:'Why these lessons?'}).click();await expect(p.locator('[data-journey-evidence]')).toBeVisible();await p.keyboard.press('Escape');await expect(p.getByRole('button',{name:'Why these lessons?'})).toBeFocused();
 await p.getByRole('button',{name:'Browse the full journey',exact:true}).click();await expect(p.getByRole('tablist',{name:'Lesson grade'})).toBeVisible();
 await p.getByRole('tab',{name:'4th Grade',exact:true}).click();await expect(p.locator('[data-grade-summary]')).toHaveAttribute('data-grade-summary','4th Grade');
 await expect(p.getByRole('button',{name:'Finish tour',exact:true})).toHaveCount(0);
 await expect(p.locator('[data-map-building=false]')).toBeVisible();
 await p.waitForTimeout(1200);
 const bounds=await p.locator('[data-lesson-card]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 expect(bounds.every(b=>b.left>=0&&b.right<=width)).toBe(true);
 for(let i=1;i<bounds.length;i++) expect(bounds[i].top-bounds[i-1].bottom).toBeGreaterThan(8);
 await p.locator('[data-journey-lesson]').first().scrollIntoViewIfNeeded();await p.screenshot({path:`/private/tmp/journey-conversion-map-${width}.png`});
 expect(errors).toEqual([]);console.log(`PASS ${width}: plan evidence, trial terms and paywall, grade browser, map bounds.`);await p.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
