import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ storageState: '.demo-auth.json', viewport:{width:1400,height:1000}, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/dashboard', { waitUntil:'networkidle' }).catch(()=>{});
await p.waitForTimeout(2500);
console.log('url:', p.url());
const side = await p.$('aside, nav[class*="sidebar"], [class*="fixed"][class*="left-0"]');
if (side) { await side.screenshot({ path:'/tmp/sidebar.png' }); console.log('captured sidebar'); }
else console.log('no sidebar element matched');
await p.screenshot({ path:'/tmp/dash.png' });
await b.close();
