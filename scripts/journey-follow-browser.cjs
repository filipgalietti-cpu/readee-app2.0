const {chromium,expect}=require('@playwright/test');
(async()=>{const browser=await chromium.launch();try{
for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:960}});let writes=0;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/**',r=>{if(r.request().method()==='POST' && !r.request().url().includes('funnel'))writes++;return r.fulfill({json:{}})});await page.route('**/*.supabase.co/**',r=>r.fulfill({json:[]}));
 await page.goto('http://127.0.0.1:3443/demo/journey');
 await expect(page.locator('[data-map-building=true]')).toBeVisible({timeout:30000});
 await expect(page.locator('[data-assessment-start]')).toContainText('Completed');
 await expect(page.locator('dialog:visible')).toHaveCount(0);
 const start=await page.evaluate(()=>scrollY);
 await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:6000}).toBeGreaterThan(start+350);
 await page.screenshot({path:`/private/tmp/journey-following-${width}.png`});
 await expect(page.locator('[data-map-building=false]')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>Math.abs(scrollY-Math.max(0,document.getElementById('journey-introduction').getBoundingClientRect().top+scrollY-88))),{timeout:5000}).toBeLessThan(3);
 const pos=await page.locator('[data-journey-bunny]').evaluate(e=>({r:e.getBoundingClientRect().toJSON(),s:e.getAttribute('style')}));
 const current=await page.locator('[data-journey-state=current]').evaluate(e=>e.getBoundingClientRect().toJSON());
 const card=await page.locator('[data-lesson-card]').first().evaluate(e=>e.getBoundingClientRect().toJSON());
 expect(card.x<current.x).toBe(true); expect(pos.r.x>current.x).toBe(true); expect(pos.r.right<=width).toBe(true);
 await page.screenshot({path:`/private/tmp/journey-returned-${width}.png`});
 await expect.poll(()=>page.locator('[data-lesson-card]').evaluateAll(es=>es.every(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth;}))).toBe(true);
 await page.getByRole('button',{name:'See Filus’s Journey',exact:true}).click();await expect(page.getByRole('dialog',{name:'Your child’s reading plan'})).toBeVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Watch the path unfold'}).click();await expect(page.locator('[data-map-building=true]')).toBeVisible();await page.mouse.wheel(0,220);await expect(page.locator('[data-map-building=false]')).toBeVisible();const after=await page.evaluate(()=>scrollY);await page.waitForTimeout(800);expect(Math.abs(await page.evaluate(()=>scrollY)-after)).toBeLessThan(3);
 await page.getByRole('button',{name:'Watch the path unfold'}).click();await expect(page.locator('[data-map-building=true]')).toBeVisible();await page.getByRole('button',{name:'See Filus’s Journey',exact:true}).click();await expect(page.locator('[data-map-building=false]')).toBeAttached();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Browse the full journey',exact:true}).click();
 await page.getByRole('button',{name:'Next unit',exact:true}).click();await expect(page.locator('[data-journey-unit]')).toHaveCount(1);await expect(page.locator('[data-assessment-start]')).toHaveCount(0);
 expect(writes).toBe(0); expect(errors).toEqual([]); console.log(`PASS ${width}: auto-follow and return, assessment origin, bunny opposite card within screen, reader drawer, user-scroll interruption, unit navigation.`);await page.close();
}
const p=await browser.newPage({reducedMotion:'reduce'});await p.route('**/api/**',r=>r.fulfill({json:{}}));await p.route('**/*.supabase.co/**',r=>r.fulfill({json:[]}));await p.goto('http://127.0.0.1:3443/demo/journey');await expect(p.locator('[data-journey-map]')).toBeVisible();await expect(p.locator('[data-map-building=false]')).toBeVisible();await p.waitForTimeout(1000);expect(await p.evaluate(()=>scrollY)).toBe(0);console.log('PASS reduced motion: no automatic camera movement.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
