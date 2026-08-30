/** One-off win-back to the Amman family (first organic user). Run once:
 *  npx tsx scripts/send-winback-oneoff.ts   (--dry to preview, no send) */
import { config } from "dotenv";
config({ path: ".env.local" });
import { Resend } from "resend";
import { shell } from "../lib/email/lifecycle";

const TO = "3khandakji@gmail.com";
const PARENT_ID = "26362568-863a-4326-b7af-1cefdddc511f";
const KID = "Yaman";
const BASE = "https://learn.readee.app";

const unsubToken = Buffer.from(`${PARENT_ID}:${new Date().toISOString().slice(0, 10)}`).toString("base64url");
const unsubscribeUrl = `${BASE}/account/unsubscribe/weekly?t=${unsubToken}&u=${PARENT_ID}`;
const ctaHref = `${BASE}/dashboard`;

const subject = `Pick up where ${KID} left off`;
const bodyHtml = `
  <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;text-align:center;">${KID} jumped into Readee and earned <b>100 carrots</b> on the very first day. That is real momentum for a new reader.</p>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;text-align:center;">The next lesson takes about 10 minutes, and Readee reads along the whole way. Want to pick up where ${KID} left off tonight?</p>`;
const text = [
  "Hi there,",
  "",
  `${KID} jumped into Readee and earned 100 carrots on the very first day. That is real momentum for a new reader.`,
  "",
  `The next lesson takes about 10 minutes, and Readee reads along the whole way. Pick up where ${KID} left off:`,
  ctaHref,
  "",
  `Unsubscribe: ${unsubscribeUrl}`,
  "- Readee",
].join("\n");

const html = shell({
  preheader: `${KID} earned 100 carrots on day one. The next lesson is a short one.`,
  parentName: null,
  eyebrow: "Come back and read",
  heading: `${KID} is off to a great start`,
  bunny: "bunny-cheer.png",
  bodyHtml,
  ctaHref,
  ctaLabel: `Continue ${KID}'s reading`,
  unsubscribeUrl,
});

async function main() {
  if (process.argv.includes("--dry")) {
    console.log("DRY — subject:", subject, "\nto:", TO, "\n\n", text);
    return;
  }
  const r = await new Resend(process.env.RESEND_API_KEY!).emails.send({
    from: "Readee <hello@readee.app>",
    to: TO,
    subject,
    text,
    html,
  });
  console.log("sent:", JSON.stringify(r));
}
main();
