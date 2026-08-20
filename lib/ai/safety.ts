/**
 * Child-safety filter for Readee.ai flows (incl. kid-authored Story Studio).
 *
 * Layers (defense-in-depth, not a single boundary):
 *  1. Substring banlist with obfuscation-hardening — catches profanity /
 *     unsafe themes, INCLUDING evasion tricks kids love: leetspeak (sh1t),
 *     separators (f.u.c.k, f u c k, f-u-c-k), and stretched repeats (fuuuck).
 *  2. Image-prompt hardening — IMAGE_SAFETY_PREFIX skews generations wholesome.
 *  3. (Story Studio) an LLM moderation gate on the raw input — see
 *     moderateKidInput in readee-ai.ts — which catches intent/paraphrase the
 *     banlist can't, plus a human review before anything is ever published.
 */

// Lowercased. Matched as whole tokens against the space-normalized text.
const BANNED_WORDS: string[] = [
  // Profanity / slurs
  "fuck", "fucking", "fucker", "fuckface", "motherfucker", "fux", "phuck",
  "shit", "bullshit", "shitty", "bitch", "bitches", "biatch",
  "asshole", "arsehole", "arse", "dumbass", "jackass", "ass", "azz",
  "dick", "cock", "cunt", "pussy", "tits", "boobs", "twat", "prick",
  "damn", "goddamn", "piss", "crap", "bastard", "wanker", "bollocks",
  "slut", "whore", "hoe", "faggot", "fag", "dyke", "tranny",
  "nigger", "nigga", "chink", "spic", "kike", "gook", "wetback",
  "retard", "retarded", "stfu", "gtfo",

  // Violence / self-harm
  "kill yourself", "kill myself", "kys", "suicide", "self harm",
  "cut myself", "cutting myself", "hang yourself", "shoot yourself",
  "murder", "rape", "raping", "rapist", "molest", "molestation", "incest",
  "pedophile", "pedo", "gore", "gory", "bloody corpse", "decapitat",

  // Weapons in a school-inappropriate context
  "bomb making", "build a bomb", "mass shooting", "school shooting",

  // Sexual content
  "porn", "pornography", "nude", "naked child", "naked kid",
  "sexual", "sexy", "erotic", "nsfw", "xxx", "orgasm", "masturbat",
  "genitals", "penis", "vagina", "boner", "cum", "cumming", "blowjob",
  "handjob", "dildo", "horny",

  // Drugs
  "cocaine", "heroin", "meth", "crack pipe", "get high on",
  "weed smoking", "drug dealer",
];

// Words unambiguous enough to match as a SUBSTRING of the de-obfuscated
// ("tightened") text without false-positiving inside clean/kid words.
// (Deliberately excludes short/ambiguous roots like ass, cock, dick, fag,
//  hoe, rape, tit, spic — those would hit class, peacock, grape, title,
//  despicable, shoe, etc. They still get caught by the whole-word scan.)
const STRONG_BANNED: string[] = [
  "fuck", "motherfuck", "shit", "bitch", "cunt", "nigger", "faggot",
  "molest", "pedophile", "porn", "masturbat", "cocaine", "heroin",
  "suicide", "blowjob", "dildo",
];

const LEET: Record<string, string> = {
  "@": "a", "4": "a", "0": "o", "$": "s", "5": "s", "1": "i",
  "!": "i", "3": "e", "7": "t", "9": "g", "8": "b", "2": "z",
};

function applyLeet(s: string): string {
  let out = s.toLowerCase();
  for (const [k, v] of Object.entries(LEET)) out = out.split(k).join(v);
  // ph -> f defeats "phuck"; harmless on clean words ("phone" -> "fone").
  return out.replace(/ph/g, "f");
}

// Whole-word-friendly form: letters + single spaces.
function normalizeForScanning(s: string): string {
  return applyLeet(s)
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Join runs of SINGLE letters that are split by spaces/punctuation into one
// word ("f u c k" / "f.u.c.k" / "f-u-c-k" -> "fuck"), while leaving normal
// multi-letter words untouched. This is what lets us catch spaced-out evasion
// WITHOUT merging separate words.
function joinSpacedLetters(s: string): string {
  return s.replace(/\b[a-z](?:[^a-z]+[a-z]\b)+/g, (m) => m.replace(/[^a-z]/g, ""));
}

// De-obfuscated form, computed PER WORD so separate words are never merged
// (that bug turned "wish it" -> "wishit" -> "shit"). Each word has its in-word
// separators stripped ("f.u.c.k" -> "fuck") and repeats collapsed ("fuuuck" ->
// "fuck"); the result is whole-word scanned against STRONG_BANNED.
function deobfuscate(s: string): string {
  return joinSpacedLetters(applyLeet(s))
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, "").replace(/([a-z])\1+/g, "$1"))
    .join(" ");
}

export function containsUnsafeContent(text: string): string | null {
  if (!text) return null;

  // 1) Whole-word scan of the full banlist on the space-normalized text.
  const norm = " " + normalizeForScanning(text) + " ";
  for (const word of BANNED_WORDS) {
    const needle = " " + word.toLowerCase() + " ";
    if (norm.includes(needle)) return word;
  }
  // Roots that are safe to match MID-WORD to catch inflections, WITHOUT hitting
  // innocent words. (A blanket "any 6+ char banned word as a substring" rule
  // wrongly flagged e.g. "heroine" -> "heroin", "class" is fine but names
  // aren't.) Every root here is unambiguous — it never appears inside a clean
  // English word.
  // NOTE: written in POST-normalization form (leet applied, "ph" -> "f"), since
  // `norm` above has already been through normalizeForScanning.
  const SUBSTRING_ROOTS = [
    "molest", "masturbat", "pedofil", "paedofil", "decapitat",
    "porn", "fellati", "ejaculat", "bestiality",
  ];
  for (const root of SUBSTRING_ROOTS) {
    if (norm.includes(root)) return root;
  }

  // 2) De-obfuscated WHOLE-WORD scan for the unambiguous strong words — catches
  //    separator/repeat evasion ("f.u.c.k", "f u c k", "fuuuck") without the
  //    cross-word false positives a substring scan caused.
  const deob = " " + deobfuscate(text) + " ";
  for (const word of STRONG_BANNED) {
    if (deob.includes(" " + word + " ")) return word;
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
