/**
 * Render the app's own bunny (outfit + reaction pose) to transparent PNGs for
 * the emails: public/images/email/<key>.png. Needs the dev server on :3000.
 *   node scripts/render-email-bunnies.mjs
 */
import { chromium } from "@playwright/test";
const OUT = "public/images/email";
// key -> [outfit, state, seconds into the loop to capture (the action apex)]
const SCENES = {
  "welcome": ["bunny_classic", "wave", 1.4],
  "placement-nudge": ["bunny_detective", "wow", 1.6],
  "first-lesson": ["bunny_bookworm", "correct", 1.6],
  "report": ["bunny_scientist", "wow", 1.6],
  "trial-started": ["bunny_astronaut", "levelup", 2.2],
  "trial-ending": ["bunny_detective", "wave", 1.4],
  "digest": ["bunny_superhero", "clap", 1.6],
  "quiet": ["bunny_classic", "sleepy", 2.0],
  "re-engage": ["bunny_pirate", "love", 1.6],
  "winback": ["bunny_wizard", "wave", 1.4],
  "whats-new": ["bunny_popstar", "superstar", 2.4],
  "milestone": ["bunny_royal", "superstar", 2.4],
  "streak": ["bunny_classic", "streakfire", 1.6],
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 400, height: 440 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
for (const [key, [outfit, state, at]] of Object.entries(SCENES)) {
  await p.goto(`http://localhost:3000/demo/bunny-render?outfit=${outfit}&state=${state}`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-frame] svg", { timeout: 90000 });
  await p.waitForTimeout(Math.round(at * 1000));
  await p.locator("[data-frame]").screenshot({ path: `${OUT}/${key}.png`, omitBackground: true });
  console.log("rendered", key, outfit, state);
}
await b.close();
