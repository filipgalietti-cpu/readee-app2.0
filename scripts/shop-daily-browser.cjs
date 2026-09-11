const { chromium, expect } = require('@playwright/test');
const fs = require('fs');
const base = process.env.PLACEMENT_BASE_URL || 'http://127.0.0.1:3431';
const env = fs.readFileSync('.env.local', 'utf8');
const host = new URL(env.match(/^NEXT_PUBLIC_SUPABASE_URL=["']?([^\s"']+)/m)[1]).hostname;
const storageKey = `sb-${host.split('.')[0]}-auth-token`;
const user = { id: 'navigation-qa-parent', aud: 'authenticated', role: 'authenticated', email: 'qa@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const exp = Math.floor(Date.now()/1000) + 3600;
const token = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({exp,sub:user.id,role:'authenticated'})).toString('base64url')+'.test';
const session = { access_token: token, refresh_token: 'qa-only', token_type: 'bearer', expires_at: exp, expires_in: 3600, user };
(async()=>{
 const browser = await chromium.launch({headless:true, args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  for (const viewport of [{width:390,height:844},{width:1280,height:844},{width:667,height:375}]) {
   const page = await browser.newPage({viewport});
   const errors=[]; let mode='ready'; let delay=0; const writes=[];
   page.on('pageerror', e=>errors.push(e.message));
   await page.addInitScript(({key,value})=>{document.cookie=`${key}=base64-${value}; path=/; SameSite=Lax`;},{key:storageKey,value:Buffer.from(JSON.stringify(session)).toString('base64url')});
   await page.route(`https://${host}/**`, async route=>{
    const url=new URL(route.request().url());
    if(!['GET','HEAD'].includes(route.request().method())){ writes.push({path:url.pathname,method:route.request().method(),fields:Object.keys(JSON.parse(route.request().postData()||'{}'))}); return route.fulfill({status:200,json:[]}); }
    if(url.pathname==='/auth/v1/user') return route.fulfill({json:user});
    if(url.pathname.endsWith('/profiles')) return route.fulfill({status:503,json:{message:'QA unavailable'}});
    if(url.pathname.endsWith('/children')) {
     if(delay) await new Promise(r=>setTimeout(r,delay));
     if(mode==='error') return route.fulfill({status:503,json:{message:'QA temporary failure'}});
     const id=url.searchParams.get('id')?.replace('eq.','')||'reader-a';
     if(mode==='empty') return route.fulfill({json:null});
     const child={id,parent_id:user.id,first_name:id==='reader-b'?'Taylor':'Alex',carrots:id==='reader-b'?75:123,grade:'1st',equipped_items:{outfit:'bunny_classic'},last_free_mystery_box_at:null};
     return route.fulfill({json:route.request().headers().accept?.includes('object')?child:[child]});
    }
    return route.fulfill({json:[]});
   });
   await page.route('**/api/**',r=>r.fulfill({json:{}}));
   // No query: authenticated parent gets their first reader, never a permanent skeleton.
   await page.goto(base+'/demo/navigation/shop');
   await expect(page.getByRole('heading',{name:'Carrot Shop'})).toBeVisible({timeout:30000});
   await expect(page.locator('.shop-hero')).toContainText('Alex');
   const original=await page.locator('[data-shop-frame]').boundingBox();
   // Switching readers blocks the old balance immediately and shows matching frame.
   delay=1200;
   await page.getByRole('link',{name:'Second reader shop',exact:true}).evaluate(el => el.click());
   await expect(page.getByRole('status',{name:'Loading shop'})).toBeVisible();
   expect(await page.locator('[data-shop-frame]').boundingBox()).toEqual(original);
   await expect(page.locator('.shop-hero')).toHaveCount(0);
   await expect(page.locator('.shop-hero')).toContainText('Taylor',{timeout:15000});
   delay=0;
   // A failed read offers retry; the retry does not spend or change anything.
   mode='error';
   await page.getByRole('link',{name:'Shop preview',exact:true}).evaluate(el => el.click());
   await expect(page.locator('[data-shop-frame] [role=alert]')).toContainText('couldn’t load');
   mode='ready'; await page.getByRole('button',{name:'Try again',exact:true}).click();
   await expect(page.locator('.shop-hero')).toContainText('Alex');
   expect(await page.locator('[data-shop-frame]').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
   await page.screenshot({path:`/private/tmp/shop-${viewport.width}.png`});
   // Leaving the 3D shop releases its canvas and scroll lock.
   await page.getByRole('link',{name:'Daily preview',exact:true}).evaluate(el => el.click());
   await expect(page.getByRole('heading',{name:'The Daily Readee'})).toBeVisible();
   await expect(page.locator('[data-shop-frame]')).toHaveCount(0);
   expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
   for(const label of ['Previous month','Next month']) {
    const box=await page.getByRole('button',{name:label,exact:true}).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(viewport.width);
   }
   await page.getByRole('button',{name:'Previous month',exact:true}).click();
   await expect(page.getByRole('heading',{name:'August 2026',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Next month',exact:true}).click();
   await expect(page.getByRole('heading',{name:'September 2026',exact:true})).toBeVisible();
   await expect(page.getByRole('link',{name:'Reading for 2026-09-10, completed',exact:true})).toHaveAttribute('href','/today/qa-daily-2026-09-10');
   const activeTab = await page.locator('[aria-label="Available months"] [aria-pressed=true]').boundingBox();
   const strip = await page.locator('[aria-label="Available months"]').boundingBox();
   expect(activeTab.x).toBeGreaterThanOrEqual(strip.x - 1);
   expect(activeTab.x + activeTab.width).toBeLessThanOrEqual(strip.x + strip.width + 1);
   const geometry=await page.locator('[data-daily-frame]').evaluate(el=>({w:el.clientWidth,sw:el.scrollWidth,h:el.clientHeight,sh:el.scrollHeight}));
   expect(geometry.sw).toBeLessThanOrEqual(geometry.w);
   if(viewport.height<500) expect(geometry.sh).toBeGreaterThan(geometry.h);
   await page.screenshot({path:`/private/tmp/daily-${viewport.width}.png`});
   await page.goBack(); await expect(page.getByRole('heading',{name:'Carrot Shop'})).toBeVisible();
   mode='empty';await page.getByRole('link',{name:'Second reader shop',exact:true}).evaluate(el => el.click());
   await expect(page.getByRole('heading',{name:'Choose a reader for the shop.'})).toBeVisible();
   expect(errors).toEqual([]); expect(writes).toEqual([]);
   console.log(`Passed ${viewport.width}x${viewport.height}: default reader, switch, loading frame, failure/retry, empty state, calendar bounds/months, history, no shop writes or page errors.`);
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
