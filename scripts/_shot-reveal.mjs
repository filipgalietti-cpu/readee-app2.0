import { chromium } from "@playwright/test";
const OUT = "/private/tmp/claude-501/-Users-filipgalietti/1c929a3a-3f57-4806-a2d5-3aafdbeb33d2/scratchpad";
const URL = "http://localhost:3000/demo/placement-reveal";
const b = await chromium.launch();
const errors = [];
const PROBE = `(() => { const el = document.querySelector("[data-reveal-viewport]"); return el ? { sh: el.scrollHeight, ch: el.clientHeight } : null; })()`;

async function walk(viewport, suffix) {
  const phone = viewport.width < 500;
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: phone });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${suffix}: ${e}`));
  const shot = (name, opts = {}) => p.screenshot({ path: `${OUT}/reveal-${name}-${suffix}.png`, fullPage: phone, ...opts });
  const tab = (label) => p.getByRole("button", { name: label, exact: true }).click();
  const next = () => p.getByRole("button", { name: "Next", exact: true }).click();
  await p.goto(URL, { waitUntil: "networkidle" });
  await tab("Wizard");
  const waits = { r2: 3400, r3: 3600, r4: 2400, r5: 3800, r6: 2600, r7: 1800, r8: 2000 };
  const names = Object.keys(waits);
  for (let i = 0; i < names.length; i++) {
    if (i > 0) await next();
    await p.waitForTimeout(waits[names[i]]);
    await shot(names[i]);
    const m = await p.evaluate(PROBE);
    console.log(`${suffix} ${names[i]}: scroll=${m?.sh} client=${m?.ch} ${m && m.sh > m.ch ? "OVERFLOW " + (m.sh - m.ch) : "fits"}`);
  }
  await tab("Static report");
  await p.waitForTimeout(1200);
  await shot("report", { fullPage: true });
  await ctx.close();
}
await walk({ width: 1280, height: 900 }, "desktop");
await walk({ width: 390, height: 844 }, "phone");
console.log("page errors:", errors.length ? errors : "none");
await b.close();
