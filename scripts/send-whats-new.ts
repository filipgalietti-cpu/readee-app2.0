/**
 * Send the "What's new" email to all opted-in parents.
 * Edit the CONTENT block below, then run:  npx tsx scripts/send-whats-new.ts
 * (Add --dry to preview the recipient count without sending.)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { sendWhatsNewToAll, type WhatsNewContent } from "../lib/email/whats-new";

// ── EDIT THIS each time you ship new content ──────────────────────────
const CONTENT: WhatsNewContent = {
  eyebrow: "What's new",
  heading: "New reading content just landed",
  intro: "We just added fresh lessons and stories to Readee. Here's what's new this week:",
  items: [
    "New Grade 2 lessons on main idea and key details",
    "More decodable stories in the library",
    "Luna can now write stories on even more topics",
  ],
  ctaLabel: "See what's new",
  ctaHref: "https://learn.readee.app/dashboard",
};
// ──────────────────────────────────────────────────────────────────────

async function main() {
  if (process.argv.includes("--dry")) {
    console.log("DRY RUN — content:\n", JSON.stringify(CONTENT, null, 2));
    return;
  }
  const res = await sendWhatsNewToAll(CONTENT);
  console.log(`What's-new broadcast done. Sent: ${res.sent}, Failed: ${res.failed}`);
}
main();
