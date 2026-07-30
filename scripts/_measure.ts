import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: "readee_sidebar_open", value: "true", domain: "localhost", path: "/" }]);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/practice-hub", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(2500);
  const m = await p.evaluate(`(() => {
    const aside = document.querySelector('aside');
    const cont = document.querySelector('[class*="@container"]');
    const wrap = cont && cont.parentElement;
    const g = (e) => e ? { w: Math.round(e.getBoundingClientRect().width), x: Math.round(e.getBoundingClientRect().x) } : null;
    return {
      viewport: window.innerWidth,
      aside: g(aside),
      wrapper: wrap ? { ...g(wrap), cls: wrap.className.slice(0,80) } : null,
      container: g(cont),
    };
  })()`);
  console.log(JSON.stringify(m, null, 2));
  await b.close();
})();
