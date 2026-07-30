import { chromium } from "@playwright/test";
const CORRECT = new Set(["A red ball","To school","It was Emma's birthday.","Gray with white paws","His grandma","It is cold and snowy","None","Hungry","To surprise Rosa","To catch the fish"]);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: ".demo-auth.json", viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/practice-hub", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(1800);
  const child = new URL(p.url()).searchParams.get("child");
  await p.goto(`http://localhost:3000/practice?child=${child}&standard=RL.K.1`, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(1800);
  const start = p.getByText("Tap to Start", { exact: false });
  if (await start.count()) { await start.first().click().catch(() => {}); await p.waitForTimeout(1600); }

  for (let n = 0; n < 14; n++) {
    // If we've reached the completion screen, stop.
    if (await p.getByText(/Perfect Score|You did it|Keep going|Back to my path/i).count()) break;
    const choices = p.locator("button").filter({ has: p.locator("span", { hasText: /^[A-D]$/ }) });
    const ct = await choices.count();
    if (!ct) break;
    // Click the correct choice by matching its label text.
    let clicked = false;
    for (let i = 0; i < ct; i++) {
      const label = (await choices.nth(i).innerText()).replace(/^[A-D]\s*/, "").trim();
      if (CORRECT.has(label)) { await choices.nth(i).click().catch(() => {}); clicked = true; break; }
    }
    if (!clicked) await choices.nth(0).click().catch(() => {}); // fallback (shouldn't happen for RL.K.1)
    await p.waitForTimeout(1300);
    const next = p.getByText(/^(Next|Finish)$/);
    if (await next.count()) { await next.first().click().catch(() => {}); await p.waitForTimeout(1200); }
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/Users/filipgalietti/.claude/jobs/520509e3/tmp/seal.png" });
  await b.close();
})();
