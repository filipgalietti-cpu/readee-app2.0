/**
 * Child-safety filter for teacher-facing Readee.ai flows.
 *
 * Two layers:
 *  1. Substring banlist — catches obvious profanity / unsafe themes before
 *     we spend a single token on the Gemini API.
 *  2. Image-prompt hardening — prepends a "kid-safe, school-appropriate"
 *     preamble to every image generation so Gemini skews wholesome even
 *     when the teacher's prompt is terse.
 *
 * This is defense-in-depth, not a security boundary. Gemini's own safety
 * settings do most of the work; this layer exists so that a surprised
 * teacher doesn't stare at a flagged-content error after waiting 8s.
 */

// Lowercased. Matched as whole-ish tokens (word boundary on each side).
const BANNED_WORDS: string[] = [
  // Profanity / slurs
  "fuck", "fucking", "fucker", "shit", "bullshit", "bitch", "bitches",
  "asshole", "dick", "cock", "cunt", "pussy", "tits", "boobs",
  "damn", "goddamn", "piss", "crap", "bastard", "wanker",
  "slut", "whore", "hoe", "faggot", "fag", "dyke", "tranny",
  "nigger", "nigga", "chink", "spic", "kike", "gook", "wetback",
  "retard", "retarded",

  // Violence / gore
  "kill yourself", "kys", "suicide",
  "murder", "rape", "raping", "molest", "molestation",
  "gore", "gory", "bloody corpse", "decapitat",
  "hang yourself", "shoot yourself",

  // Weapons in a school-inappropriate context
  "bomb making", "build a bomb", "mass shooting", "school shooting",

  // Sexual content
  "porn", "pornography", "nude", "naked child", "naked kid",
  "sexual", "sexy", "erotic", "nsfw", "xxx", "orgasm", "masturbat",
  "genitals", "penis", "vagina",

  // Drugs
  "cocaine", "heroin", "meth", "crack pipe", "get high on",
  "weed smoking", "drug dealer",
];

// Normalize common evasion tricks (@ → a, 0 → o, $ → s, etc.) before scanning.
function normalizeForScanning(s: string): string {
  return s
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/\$/g, "s")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/!/g, "i")
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsUnsafeContent(text: string): string | null {
  if (!text) return null;
  const norm = " " + normalizeForScanning(text) + " ";
  for (const word of BANNED_WORDS) {
    const needle = " " + word.toLowerCase() + " ";
    if (norm.includes(needle)) return word;
    // Also allow a partial-word hit for roots that need it (e.g. "molest" → "molested").
    if (word.length >= 6 && norm.includes(word.toLowerCase())) return word;
  }
  return null;
}

export function assertSafePrompt(
  text: string,
): { ok: true } | { ok: false; error: string } {
  const hit = containsUnsafeContent(text);
  if (hit) {
    return {
      ok: false,
      error:
        "That prompt contains language that isn't kid-safe. Rephrase and try again — Readee.ai is for K-4 classrooms.",
    };
  }
  return { ok: true };
}

export function assertSafeOutput(
  parts: (string | null | undefined)[],
): { ok: true } | { ok: false; error: string } {
  for (const p of parts) {
    if (!p) continue;
    const hit = containsUnsafeContent(p);
    if (hit) {
      return {
        ok: false,
        error:
          "The AI produced something we flagged as not kid-safe. Regenerate with a more specific prompt.",
      };
    }
  }
  return { ok: true };
}

export const IMAGE_SAFETY_PREFIX =
  "Kid-safe, school-appropriate, wholesome, friendly elementary-classroom scene. No weapons, no blood, no scary or frightening imagery, no suggestive or romantic content, no alcohol or drugs, no text or logos. ";
