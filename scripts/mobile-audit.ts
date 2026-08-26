/** MOBILE AUDIT — loads key pages at iPhone size (390x844) and reports
 *  phone-hostility: horizontal overflow, elements wider than screen,
 *  tap targets under 44px, and fonts under 12px. */
import { chromium } from "playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGES = [
  "/login", "/signup",
  "/today", "/today/archive",
  "/demo/rhyme-time", "/demo/sentence-shapes", "/demo/fable-tellers",
  "/demo/quiz/rhyme-time", "/demo/quiz/k-final", "/demo/placement",
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
      const r = await page.evaluate(() => {
        const vw = window.innerWidth;
        const overflowX = document.documentElement.scrollWidth - vw;
        const wide: string[] = [];
        const smallTaps: string[] = [];
        let tinyFonts = 0;
        for (const el of Array.from(document.querySelectorAll("*"))) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width > vw + 8 && rect.height > 4) {
            const tag = `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).split(" ")[0] ?? ""}`.slice(0, 40);
            if (wide.length < 4 && !wide.includes(tag)) wide.push(`${tag} (${Math.round(rect.width)}px)`);
          }
          if ((el.tagName === "BUTTON" || el.tagName === "A") && rect.width > 0 && (rect.width < 40 || rect.height < 32)) {
            if (smallTaps.length < 4) smallTaps.push(`${el.textContent?.trim().slice(0, 18) || el.tagName} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
          }
          const fs = parseFloat(getComputedStyle(el as HTMLElement).fontSize);
          if (fs && fs < 12 && (el as HTMLElement).innerText?.trim()) tinyFonts++;
        }
        return { overflowX, wide, smallTaps, tinyFonts };
      });
      const flag = r.overflowX > 8 ? "🔴" : r.smallTaps.length > 0 || r.tinyFonts > 10 ? "🟡" : "🟢";
      console.log(`${flag} ${path} · overflow ${r.overflowX}px · wide: ${r.wide.join(", ") || "none"} · small-taps: ${r.smallTaps.join(" | ") || "none"} · tiny-fonts ${r.tinyFonts}`);
    } catch (e) {
      console.log(`⚫ ${path} · error ${String(e).slice(0, 60)}`);
    }
    await page.close();
  }
  await browser.close();
})();
