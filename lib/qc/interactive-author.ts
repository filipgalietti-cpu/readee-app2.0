/**
 * Interactive "fork" author — the coached "Your Turn" beat that sits
 * between the tip and the practice MCQs (teach → example → tip → FORK →
 * practice). The kid DOES one problem with a safety net: right → spoken
 * affirmation, wrong → spoken encouragement + retry, never scored.
 *
 * The author CHOOSES the interaction style from the lesson's skill:
 *   - "tap"   — pick the one best answer (comprehension: a fresh mini-story
 *               read ALOUD, then a who/what/how-many question; the story is
 *               never printed, so nothing can be read off the screen).
 *   - "match" — pair each item with its mate (the lesson teaches a SET that
 *               maps 1:1 — roots→meaning, prefix→meaning, word→vowel-team,
 *               synonyms). Pulled straight from what the lesson taught.
 *
 * Mirrors lib/qc/example-author.ts (Gemini 2.5 Flash, structured output,
 * 3-attempt self-correcting validation). PURE authoring — returns the
 * validated `interactive` payload + the three TTS scripts with placeholder
 * audio paths; the caller assigns canonical paths, generates the audio,
 * inserts the slide, and gates it through qc-judge-interactive.ts.
 *
 * Gemini structured-output gotcha (see memory): NEVER use dynamic-keyed
 * objects in the schema. Match pairs come back as a parallel array
 * `pairs:[{left,right}]` and we pivot to leftItems/rightItems/correctPairs.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { skillTypeForStandard, type SkillType } from "./example-author";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type ForkKind = "tap" | "match";

export type InteractiveAuthorInput = {
  standardId: string;
  lessonTitle: string;
  grade: string;
  skillType: SkillType;
  /** Everything the lesson teaches — intro/teach/example ttsScripts +
   *  on-screen text — so the fork reinforces THIS lesson and pulls its
   *  distractors/pairs from what was actually taught. */
  lessonContent: string;
};

export type InteractivePayload = {
  kind: ForkKind;
  heading: string;
  prompt: string;
  hint: string;
  choices?: string[];
  correct?: string;
  leftItems?: string[];
  rightItems?: string[];
  correctPairs?: Record<string, string>;
  questionScript: string;
  correctScript: string;
  wrongScript: string;
};

export type InteractiveAuthorResult =
  | { ok: true; payload: InteractivePayload }
  | { ok: false; error: string };

const SYSTEM = `You are a senior K-4 reading specialist authoring ONE interactive "Your Turn" fork for a karaoke-style lesson. It comes right after the tip and just before the practice questions. It is the coached "we do": the kid does ONE problem with a safety net (right → celebrate, wrong → a gentle hint + try again, never scored).

You receive STANDARD, LESSON, GRADE, SKILL TYPE, and LESSON CONTENT (everything the lesson taught). Author a fork that REINFORCES this exact lesson and pulls its options from what was taught.

FIRST choose the interaction KIND:
- "match" — ONLY if the lesson teaches a SET of 3 discrete items that each map 1:1 to a meaning / sound / category (roots→meaning like bio→life, prefixes→meaning like un→not, words→vowel-team like rain→AI, synonyms, word→category). This is the best fit for vocabulary/roots/affixes and many phonics lessons.
- "tap" — otherwise. The kid picks the ONE best answer from 3 choices. This is the default and is almost always right for comprehension (RL/RI). For a comprehension tap, INVENT a brand-new tiny story (NOT the one in the lesson's example) and read it ALOUD in the questionScript only — never print it — then ask a who/what/where/how-many question about it.

THE GOLDEN RULE — the on-screen text ANCHORS, it never gives away the answer. The correct answer must NEVER appear in the on-screen prompt. The kid must USE THE SKILL to get it.

Output JSON only. Fields:
- kind: "tap" or "match".
- heading: a short "Your Turn!" style title (≤4 words).
- prompt: the ON-SCREEN question (tap) or instruction (match). TERSE — ≤6 words. e.g. "How many frogs?", "Match each root to its meaning". For comprehension tap, the prompt is the QUESTION only (the story is spoken, not printed) and must NOT contain the answer.
- hint: one short coaching sentence shown on a wrong try. Nudges toward the skill; does NOT state the answer outright.
- For "tap": choices = exactly 3 short options (≤3 words each); correct = the one right option (must be one of choices, must NOT appear in the prompt). CRITICAL — the two distractors must be the SAME KIND as the correct answer so the kid can't win by elimination: a "where" question → all 3 choices are PLACES; "who" → all 3 are CHARACTERS/people; "how many" → all 3 are NUMBERS; "what does X mean" → all 3 are MEANINGS/definitions. Never mix a character, an object, and a place. Distractors should be plausible and on-topic for the lesson, but category-matched first.
- For "match": pairs = exactly 3 objects {left, right}, each ≤3 words, taken from what the lesson taught (e.g. {left:"bio", right:"life"}). All three LEFT items must be the SAME kind of thing (all roots, or all digraphs, or all figurative-language types) — do not mix categories (e.g. don't put "Compare" beside "Simile" and "Metaphor"). Leave choices/correct empty.
- questionScript: the spoken question audio. Friendly, one or two sentences. For comprehension tap, this is where the brand-new little story is read aloud, then the question. Start with a varied lead-in ("Now you try!", "Your turn, detective!", "You've got this — try one.").
- correctScript: the affirmation. NAME the answer + restate the rule in one clause (e.g. "Yes! Redo — 're' means again, so redo means do it again!"). Do NOT add "now do them on your own" — the next slide handles that. Vary the opener (Yes!/You got it!/Nice work!/Exactly!).
- wrongScript: the encouragement. Warm, invites a retry ("...Try again!"), nudges toward the skill, and must NOT say the correct answer. Vary the opener (Almost!/So close!/Good try!/Not quite!).

Hard rules:
1. Author the EXACT standard's skill, not an adjacent one.
2. TERSENESS: prompt ≤6 words; every choice/pair item ≤3 words.
3. NO GIVEAWAY: the correct answer never appears in the prompt or hint; for comprehension the story is spoken only, never printed in the prompt.
4. Distractors/pairs come from THIS lesson's taught content.
5. No markdown, no emoji, no asterisks. Use plain friendly text.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    kind: { type: Type.STRING },
    heading: { type: Type.STRING },
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    choices: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } },
    correct: { type: Type.STRING, nullable: true },
    pairs: {
      type: Type.ARRAY,
      nullable: true,
      items: {
        type: Type.OBJECT,
        properties: { left: { type: Type.STRING }, right: { type: Type.STRING } },
        required: ["left", "right"],
      },
    },
    questionScript: { type: Type.STRING },
    correctScript: { type: Type.STRING },
    wrongScript: { type: Type.STRING },
  },
  required: ["kind", "heading", "prompt", "hint", "questionScript", "correctScript", "wrongScript"],
};

const words = (s: string) => String(s || "").replace(/[?!.,]/g, " ").trim().split(/\s+/).filter(Boolean).length;
const norm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

function validate(p: any): string | null {
  if (p.kind !== "tap" && p.kind !== "match") return `kind "${p.kind}" must be tap or match`;
  for (const f of ["heading", "prompt", "hint", "questionScript", "correctScript", "wrongScript"])
    if (!String(p[f] ?? "").trim()) return `missing ${f}`;
  if (words(p.prompt) > 6) return `prompt "${p.prompt}" too long (${words(p.prompt)} words, max 6)`;

  if (p.kind === "tap") {
    const choices: string[] = p.choices ?? [];
    if (choices.length !== 3) return `tap needs exactly 3 choices, got ${choices.length}`;
    if (new Set(choices.map(norm)).size !== 3) return "duplicate choices";
    for (const c of choices) if (words(c) > 3) return `choice "${c}" too long (max 3 words)`;
    if (!choices.map(norm).includes(norm(p.correct))) return `correct "${p.correct}" not among choices`;
    if (norm(p.prompt).split(" ").includes(norm(p.correct))) return `GIVEAWAY: answer "${p.correct}" is in the prompt`;
    if (words(p.prompt) > 8) return "prompt looks like a printed passage — keep the story in the audio";
    if (!norm(p.correctScript).includes(norm(p.correct))) return "affirmation must name the answer";
    if (norm(p.wrongScript).split(" ").includes(norm(p.correct))) return "encouragement gives away the answer";
  } else {
    const pairs: any[] = p.pairs ?? [];
    if (pairs.length !== 3) return `match needs exactly 3 pairs, got ${pairs.length}`;
    const lefts = pairs.map((x) => x.left), rights = pairs.map((x) => x.right);
    if (lefts.some((l) => !String(l ?? "").trim()) || rights.some((r) => !String(r ?? "").trim())) return "a pair has an empty side";
    if (new Set(lefts.map(norm)).size !== 3) return "duplicate left items";
    if (new Set(rights.map(norm)).size !== 3) return "duplicate right items";
    for (const x of [...lefts, ...rights]) if (words(x) > 3) return `match item "${x}" too long (max 3 words)`;
  }
  if (!/try again|again/i.test(p.wrongScript)) return "encouragement should invite a retry ('Try again!')";
  return null;
}

export async function authorInteractiveFork(
  input: InteractiveAuthorInput,
): Promise<InteractiveAuthorResult> {
  let ai: GoogleGenAI;
  try { ai = client(); } catch (e: any) { return { ok: false, error: e?.message ?? "AI not configured." }; }

  const baseMsg = [
    `STANDARD: ${input.standardId}`,
    `LESSON: ${input.lessonTitle}`,
    `GRADE: ${input.grade}`,
    `SKILL TYPE: ${input.skillType} (phonics→often match; vocab→often match; comprehension→almost always tap)`,
    "",
    "LESSON CONTENT (reinforce THIS; pull options from here):",
    input.lessonContent.slice(0, 3500),
  ].join("\n");

  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const userMsg = lastError
      ? `${baseMsg}\n\nYOUR PREVIOUS ATTEMPT FAILED THIS CHECK — fix ONLY this, keep the rest: ${lastError}`
      : baseMsg;
    let parsed: any;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMsg,
        config: { systemInstruction: SYSTEM, responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.4 },
      });
      parsed = JSON.parse(response.text ?? "{}");
    } catch (e: any) { lastError = `invalid JSON: ${e?.message ?? e}`; continue; }

    const err = validate(parsed);
    if (err) { lastError = err; continue; }

    const payload: InteractivePayload = {
      kind: parsed.kind,
      heading: parsed.heading,
      prompt: parsed.prompt,
      hint: parsed.hint,
      questionScript: parsed.questionScript,
      correctScript: parsed.correctScript,
      wrongScript: parsed.wrongScript,
    };
    if (parsed.kind === "tap") {
      payload.choices = parsed.choices;
      payload.correct = parsed.correct;
    } else {
      // pivot the parallel array → leftItems / rightItems / correctPairs
      payload.leftItems = parsed.pairs.map((x: any) => x.left);
      payload.rightItems = parsed.pairs.map((x: any) => x.right);
      payload.correctPairs = Object.fromEntries(parsed.pairs.map((x: any) => [x.left, x.right]));
    }
    return { ok: true, payload };
  }
  return { ok: false, error: `failed after 3 attempts: ${lastError}` };
}

export { skillTypeForStandard };
