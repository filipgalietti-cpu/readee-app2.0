import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * What a human can ask for after reading the daily review email, and how that
 * ask is authenticated.
 *
 * Filip, 18 Sep 2026: "can you send me a daily email when our daily readee is
 * created... I should be able to respond and say 'fix image' or something like
 * that to update it from my email. To make sure our slop isn't too apparent."
 *
 * Two routes in, one set of actions:
 *
 *   a tap    the email carries signed links, which work in every mail client
 *            today and need no DNS at all
 *   a reply  Resend receives the reply and posts it to the inbound webhook,
 *            which needs an MX record on a subdomain (see the route)
 *
 * The reply is the one asked for, and it is the one with a setup step, so the
 * links exist to make the feature useful the day it ships rather than the day
 * DNS propagates.
 */

export const REVIEW_ACTIONS = ["image", "passage", "rebuild"] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export const ACTION_LABEL: Record<ReviewAction, string> = {
  image: "Redraw the picture",
  passage: "Rewrite the passage",
  rebuild: "Rebuild the whole day",
};

function secret(): string {
  // Its own secret when set, so a leaked review link can never be replayed as a
  // cron trigger. Falls back to CRON_SECRET so the feature works before anyone
  // adds an env var.
  const s = process.env.DAILY_REVIEW_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("DAILY_REVIEW_SECRET or CRON_SECRET is required to sign review links.");
  return s;
}

/** A link token binds one action to one day, so it cannot be pointed at another. */
export function reviewToken(slug: string, action: ReviewAction): string {
  return createHmac("sha256", secret()).update(`${slug}:${action}`).digest("hex").slice(0, 32);
}

export function reviewTokenValid(slug: string, action: ReviewAction, token: string): boolean {
  const expected = Buffer.from(reviewToken(slug, action));
  const given = Buffer.from(String(token ?? ""));
  // Length must match before timingSafeEqual, which throws on a mismatch.
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === "string" && (REVIEW_ACTIONS as readonly string[]).includes(value);
}

/**
 * Read an instruction out of a reply.
 *
 * A reply is not a command line. It arrives with the quoted original beneath
 * it, a signature, and "Sent from my iPhone", so only the part a person
 * actually typed is considered: everything from the first quote marker or
 * attribution line onward is dropped.
 *
 * Wording is deliberately loose. Filip said "fix image or something like
 * that", and the point of the feature is to answer a glance at a phone, not to
 * remember a syntax.
 */
export function parseReviewCommand(body: string): ReviewAction | null {
  const typed = humanPart(body).toLowerCase();
  if (!typed) return null;

  // "rebuild" first: "rebuild the whole thing" also contains no other keyword,
  // but "new passage and image" should mean the lot.
  const wantsImage = /\b(image|picture|pic|photo|illustration|art|drawing)\b/.test(typed);
  const wantsText = /\b(passage|text|story|copy|words|writing|article)\b/.test(typed);
  if (/\b(rebuild|redo everything|start over|whole thing|scrap it|all of it)\b/.test(typed)) return "rebuild";
  if (wantsImage && wantsText) return "rebuild";

  // An instruction, not a remark. "the image is great" must not redraw it.
  const asks = /\b(fix|redo|regenerate|regen|rebuild|replace|change|new|another|redraw|rewrite|bad|wrong|awful|terrible|horrible|slop|ugly)\b/.test(typed);
  if (!asks) return null;
  if (wantsImage) return "image";
  if (wantsText) return "passage";
  return null;
}

/** The part of a reply the person actually typed. */
export function humanPart(body: string): string {
  const lines = String(body ?? "").replace(/\r\n/g, "\n").split("\n");
  const kept: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith(">")) break; // quoted original
    if (/^on .*wrote:$/i.test(line)) break; // Gmail, Apple Mail attribution
    if (/^-{2,}\s*original message/i.test(line)) break; // Outlook
    if (/^from:\s/i.test(line) && kept.length) break; // forwarded header block
    if (/^(--|__)\s*$/.test(line)) break; // signature delimiter
    if (/^sent from my /i.test(line)) continue;
    kept.push(line);
  }
  return kept.join(" ").trim();
}
