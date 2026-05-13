/**
 * Type-aware question authors (Path A+ of the regen rebuild).
 *
 * The audit committee recommends question-type changes for 137 MCQs
 * that would be pedagogically better as a different interaction type
 * (missing_word, sentence_build, category_sort, tap_to_pair,
 * sound_machine, space_insertion). The regen pipeline calls one of
 * these author functions to produce the new question in the right
 * schema.
 *
 * Each author:
 *  - Uses Gemini 2.5 Flash (cheap; same model the rest of the QC
 *    pipeline uses).
 *  - Receives the CCSS standard text, the old question, and the
 *    committee's critique so the rewrite is anchored not blind.
 *  - Returns the exact field shape the renderer expects for that type
 *    (inferred from canonical K-canon examples — see in-line refs).
 *  - Validates the AI output: required fields present, correct ↔
 *    choices/items consistency, no shape drift.
 *
 * Output shape is the `payload` jsonb body that goes into questions_db.
 * The caller mirrors a subset of these fields into the normalized
 * columns (id, type, prompt, choices, correct, hint, difficulty).
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type AuthorInput = {
  questionId: string;
  standardId: string;
  standardText: string;
  oldQuestion: {
    type?: string;
    prompt?: string;
    choices?: unknown;
    correct?: string;
    hint?: string;
  };
  /** Committee critique — what was wrong with the old question */
  critique: string;
  difficulty?: number;
};

export type AuthorResult<TPayload> =
  | { ok: true; payload: TPayload }
  | { ok: false; error: string };

const BASE_SYSTEM = `You are a senior K-4 reading specialist regenerating one practice question.

You receive:
  STANDARD: the CCSS standard text the question must teach.
  OLD QUESTION: the previous version (failed an audit — DON'T copy its flaws).
  CRITIQUE: what was wrong with the old question. Address it directly.

Rules:
  1. Output JSON only. No markdown fences. No explanatory prose.
  2. The new question must actually test the CCSS standard the OLD one was tagged with — not an adjacent skill.
  3. Match the EXACT JSON schema for the question type. The renderer ignores unknown fields silently, so a typo (e.g. "category_item" vs "category_items") will render as empty content.
  4. Hints are kid-friendly (1 sentence, < 90 chars, no answer reveal).
  5. Prompts are short and direct (≤ 25 words for K-G1; ≤ 35 for G2-G4).
  6. No emoji in any text field. Use words, not glyphs.
  7. No banned vocabulary (violence, alcohol, drugs, romance, politics).`;

async function callGemini<T>(
  systemInstruction: string,
  userMsg: string,
  responseSchema: any,
): Promise<T | { error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { error: e?.message ?? "AI not configured." };
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });
    const raw = response.text ?? "{}";
    return JSON.parse(raw) as T;
  } catch (e: any) {
    return { error: e?.message ?? "Gemini call failed." };
  }
}

function buildUserMessage(input: AuthorInput, typeNote: string): string {
  const oldJson = JSON.stringify(
    {
      type: input.oldQuestion.type,
      prompt: input.oldQuestion.prompt,
      choices: input.oldQuestion.choices,
      correct: input.oldQuestion.correct,
      hint: input.oldQuestion.hint,
    },
    null,
    2,
  );
  return [
    `STANDARD: ${input.standardId} — ${input.standardText}`,
    "",
    "OLD QUESTION (failed audit):",
    oldJson,
    "",
    `CRITIQUE: ${input.critique}`,
    "",
    `TARGET TYPE: ${typeNote}`,
  ].join("\n");
}

/* ─── missing_word ─────────────────────────────────────────── */

export type MissingWordPayload = {
  id: string;
  type: "missing_word";
  prompt: string;
  hint: string;
  difficulty: number;
  sentence_words: string[]; // contains "___" at blank_index
  blank_index: number;
  missing_choices: string[]; // exactly 4
  correct: string; // must equal one of missing_choices, byte-for-byte
};

const MISSING_WORD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    sentence_words: { type: Type.ARRAY, items: { type: Type.STRING } },
    blank_index: { type: Type.INTEGER },
    missing_choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct: { type: Type.STRING },
  },
  required: [
    "prompt",
    "hint",
    "sentence_words",
    "blank_index",
    "missing_choices",
    "correct",
  ],
};

export async function authorMissingWord(
  input: AuthorInput,
): Promise<AuthorResult<MissingWordPayload>> {
  const typeNote = `missing_word — a sentence with one blank ("___") and 4 word choices. ` +
    `sentence_words is the full sentence tokenized, with "___" at blank_index. ` +
    `missing_choices has EXACTLY 4 plausible options; correct must be one of them byte-for-byte.`;

  const result = await callGemini<Partial<MissingWordPayload> & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    MISSING_WORD_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as Partial<MissingWordPayload>;

  // Validate
  if (
    !r.prompt ||
    !Array.isArray(r.sentence_words) ||
    typeof r.blank_index !== "number" ||
    !Array.isArray(r.missing_choices) ||
    r.missing_choices.length !== 4 ||
    !r.correct ||
    !r.missing_choices.includes(r.correct)
  ) {
    return {
      ok: false,
      error: `Invalid missing_word payload: choices=${(r.missing_choices ?? []).length}, correct-in-choices=${r.missing_choices?.includes(r.correct ?? "")}`,
    };
  }
  // Index sanity: blank_index must be in range AND point to "___"
  if (
    r.blank_index < 0 ||
    r.blank_index >= r.sentence_words.length ||
    r.sentence_words[r.blank_index] !== "___"
  ) {
    return {
      ok: false,
      error: `missing_word: blank_index ${r.blank_index} doesn't point to "___" in sentence_words (len=${r.sentence_words.length})`,
    };
  }

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "missing_word",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      sentence_words: r.sentence_words,
      blank_index: r.blank_index,
      missing_choices: r.missing_choices,
      correct: r.correct,
    },
  };
}

/* ─── sentence_build ───────────────────────────────────────── */

export type SentenceBuildPayload = {
  id: string;
  type: "sentence_build";
  prompt: string;
  hint: string;
  difficulty: number;
  words: string[]; // words to drag (shuffled in display)
  correct: string; // joined string in correct order
  ordered: boolean; // true = order matters (default), false = any valid ordering
};

const SENTENCE_BUILD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    words: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct: { type: Type.STRING },
  },
  required: ["prompt", "hint", "words", "correct"],
};

export async function authorSentenceBuild(
  input: AuthorInput,
): Promise<AuthorResult<SentenceBuildPayload>> {
  const typeNote = `sentence_build — kid drags words into the right order. ` +
    `words is the unordered word array (3-6 words typical). ` +
    `correct is the same words joined with single spaces in the RIGHT order. ` +
    `Every word in correct must come from the words array; every word in words must appear in correct (no orphans).`;

  const result = await callGemini<Partial<SentenceBuildPayload> & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    SENTENCE_BUILD_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as Partial<SentenceBuildPayload>;

  if (
    !r.prompt ||
    !Array.isArray(r.words) ||
    r.words.length < 2 ||
    !r.correct
  ) {
    return { ok: false, error: "Invalid sentence_build payload (missing fields)" };
  }
  const correctTokens = r.correct.trim().split(/\s+/);
  const wordsSet = new Set(r.words.map((w) => w.trim()));
  if (correctTokens.length !== r.words.length) {
    return {
      ok: false,
      error: `sentence_build mismatch: correct has ${correctTokens.length} tokens but words has ${r.words.length}`,
    };
  }
  for (const tok of correctTokens) {
    if (!wordsSet.has(tok)) {
      return {
        ok: false,
        error: `sentence_build: correct contains "${tok}" not in words[]`,
      };
    }
  }

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "sentence_build",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 2,
      words: r.words,
      correct: r.correct,
      ordered: true,
    },
  };
}

/* ─── category_sort ────────────────────────────────────────── */

export type CategorySortPayload = {
  id: string;
  type: "category_sort";
  prompt: string;
  hint: string;
  difficulty: number;
  items: string[]; // all items to sort (concatenated)
  categories: string[]; // 2-3 bucket names
  category_items: Record<string, string[]>; // answer key per bucket
  correct: string; // human-readable summary "Cat1: a, b | Cat2: c, d"
};

// Gemini structured output is unreliable on dynamic-keyed objects
// (additionalProperties). Flatten to a parallel-array shape we can
// always parse, then re-pivot into the renderer's category_items dict.
const CATEGORY_SORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    categories: { type: Type.ARRAY, items: { type: Type.STRING } },
    item_assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ["item", "category"],
      },
    },
  },
  required: ["prompt", "hint", "categories", "item_assignments"],
};

type CategorySortRaw = {
  prompt?: string;
  hint?: string;
  categories?: string[];
  item_assignments?: Array<{ item: string; category: string }>;
};

export async function authorCategorySort(
  input: AuthorInput,
): Promise<AuthorResult<CategorySortPayload>> {
  const typeNote = `category_sort — kid drags items into category buckets. ` +
    `categories is an array of 2-3 bucket names (e.g. ["Animals", "Colors"]). ` +
    `item_assignments is a flat array of { item, category } pairs — 2-4 items per category, ` +
    `every item assigned to exactly one category from the categories array. ` +
    `(The renderer's category_items dict is derived from these pairs.)`;

  const result = await callGemini<CategorySortRaw & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    CATEGORY_SORT_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as CategorySortRaw;

  if (
    !r.prompt ||
    !Array.isArray(r.categories) ||
    r.categories.length < 2 ||
    !Array.isArray(r.item_assignments) ||
    r.item_assignments.length === 0
  ) {
    return { ok: false, error: "Invalid category_sort payload (missing fields)" };
  }
  const categories = r.categories;
  const category_items: Record<string, string[]> = {};
  for (const c of categories) category_items[c] = [];
  const items: string[] = [];
  const seen = new Set<string>();
  for (const pair of r.item_assignments) {
    if (!pair.item || !pair.category) {
      return { ok: false, error: "category_sort: empty item or category in assignments" };
    }
    if (!categories.includes(pair.category)) {
      return { ok: false, error: `category_sort: item "${pair.item}" assigned to unknown category "${pair.category}"` };
    }
    if (seen.has(pair.item)) {
      return { ok: false, error: `category_sort: item "${pair.item}" assigned to multiple categories` };
    }
    seen.add(pair.item);
    category_items[pair.category].push(pair.item);
    items.push(pair.item);
  }
  // Every category must have at least one item
  for (const c of categories) {
    if (category_items[c].length === 0) {
      return { ok: false, error: `category_sort: category "${c}" has no items` };
    }
  }

  const correct = categories
    .map((c) => `${c}: ${category_items[c].join(", ")}`)
    .join(" | ");

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "category_sort",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      items,
      categories,
      category_items,
      correct,
    },
  };
}

/* ─── tap_to_pair ──────────────────────────────────────────── */

export type TapToPairPayload = {
  id: string;
  type: "tap_to_pair";
  prompt: string;
  hint: string;
  difficulty: number;
  left_items: string[];
  right_items: string[]; // same length as left_items, shuffled
  correct_pairs: Record<string, string>; // left → right
  correct: string; // "L1→R1, L2→R2, …"
};

// Same Gemini-structured-output workaround as category_sort: avoid
// dynamic-keyed objects, use a parallel-array pairs shape.
const TAP_TO_PAIR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    pairs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          left: { type: Type.STRING },
          right: { type: Type.STRING },
        },
        required: ["left", "right"],
      },
    },
  },
  required: ["prompt", "hint", "pairs"],
};

type TapToPairRaw = {
  prompt?: string;
  hint?: string;
  pairs?: Array<{ left: string; right: string }>;
};

export async function authorTapToPair(
  input: AuthorInput,
): Promise<AuthorResult<TapToPairPayload>> {
  const typeNote = `tap_to_pair — kid matches each left item to a right item. ` +
    `pairs is an array of 3-4 { left, right } objects representing the correct matches. ` +
    `Every left and every right must be unique across the array. ` +
    `(The renderer's left_items / right_items / correct_pairs are derived from these pairs — right_items will be shuffled at display time.)`;

  const result = await callGemini<TapToPairRaw & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    TAP_TO_PAIR_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as TapToPairRaw;

  if (
    !r.prompt ||
    !Array.isArray(r.pairs) ||
    r.pairs.length < 2 ||
    r.pairs.length > 6
  ) {
    return { ok: false, error: "Invalid tap_to_pair payload (need 2-6 pairs)" };
  }
  const left_items: string[] = [];
  const right_items: string[] = [];
  const correct_pairs: Record<string, string> = {};
  const seenLeft = new Set<string>();
  const seenRight = new Set<string>();
  for (const p of r.pairs) {
    if (!p.left || !p.right) {
      return { ok: false, error: "tap_to_pair: empty left or right in pair" };
    }
    if (seenLeft.has(p.left)) {
      return { ok: false, error: `tap_to_pair: duplicate left "${p.left}"` };
    }
    if (seenRight.has(p.right)) {
      return { ok: false, error: `tap_to_pair: duplicate right "${p.right}"` };
    }
    seenLeft.add(p.left);
    seenRight.add(p.right);
    left_items.push(p.left);
    right_items.push(p.right);
    correct_pairs[p.left] = p.right;
  }
  // Shuffle right_items deterministically (Fisher-Yates with a fixed
  // seed tied to questionId — keeps repeatable across regens).
  const shuffled = [...right_items];
  let seed = 0;
  for (let i = 0; i < input.questionId.length; i++) seed = (seed * 31 + input.questionId.charCodeAt(i)) >>> 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const correct = Object.entries(correct_pairs)
    .map(([l, rgt]) => `${l}→${rgt}`)
    .join(", ");

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "tap_to_pair",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      left_items,
      right_items: shuffled,
      correct_pairs,
      correct,
    },
  };
}

/* ─── sound_machine ────────────────────────────────────────── */

export type SoundMachinePayload = {
  id: string;
  type: "sound_machine";
  prompt: string;
  hint: string;
  difficulty: number;
  target_word: string;
  phonemes: string[]; // in /x/ format
  distractors: string[]; // wrong phonemes mixed into the tile rack
  correct: string; // phonemes joined by space
};

const SOUND_MACHINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    target_word: { type: Type.STRING },
    phonemes: { type: Type.ARRAY, items: { type: Type.STRING } },
    distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["prompt", "hint", "target_word", "phonemes", "distractors"],
};

export async function authorSoundMachine(
  input: AuthorInput,
): Promise<AuthorResult<SoundMachinePayload>> {
  const typeNote = `sound_machine — kid taps phoneme tiles to build a target word. ` +
    `target_word is a short CVC or CCVC word matching the standard. ` +
    `phonemes is an array of /x/-format sounds for the word, in order. ` +
    `Examples: "sit" → ["/s/", "/i/", "/t/"]. "ship" → ["/sh/", "/i/", "/p/"]. ` +
    `distractors is 2-3 extra /x/ sounds that DON'T belong (red herrings). ` +
    `All phonemes use the standard /x/ wrap.`;

  const result = await callGemini<Partial<SoundMachinePayload> & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    SOUND_MACHINE_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as Partial<SoundMachinePayload>;

  if (
    !r.prompt ||
    !r.target_word ||
    !Array.isArray(r.phonemes) ||
    r.phonemes.length < 2 ||
    !Array.isArray(r.distractors)
  ) {
    return { ok: false, error: "Invalid sound_machine payload (missing fields)" };
  }
  // Every phoneme must be in /x/ format
  for (const p of [...r.phonemes, ...r.distractors]) {
    if (!/^\/[^/]+\/$/.test(p)) {
      return { ok: false, error: `sound_machine: phoneme "${p}" not in /x/ format` };
    }
  }

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "sound_machine",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      target_word: r.target_word,
      phonemes: r.phonemes,
      distractors: r.distractors,
      correct: r.phonemes.join(" "),
    },
  };
}

/* ─── space_insertion ──────────────────────────────────────── */

export type SpaceInsertionPayload = {
  id: string;
  type: "space_insertion";
  prompt: string;
  hint: string;
  difficulty: number;
  jumbled: string; // run-on text with no spaces ("Ilikedogs.")
  correct: string; // correctly spaced version
};

const SPACE_INSERTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    jumbled: { type: Type.STRING },
    correct: { type: Type.STRING },
  },
  required: ["prompt", "hint", "jumbled", "correct"],
};

export async function authorSpaceInsertion(
  input: AuthorInput,
): Promise<AuthorResult<SpaceInsertionPayload>> {
  const typeNote = `space_insertion — kid taps between letters to add spaces and break apart a run-on. ` +
    `jumbled is the run-on string ("Ilikedogs.") — all letters from correct with spaces removed. ` +
    `correct is the same string with spaces in the right places ("I like dogs."). ` +
    `Length match: removing spaces from correct must equal jumbled exactly.`;

  const result = await callGemini<Partial<SpaceInsertionPayload> & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    SPACE_INSERTION_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as Partial<SpaceInsertionPayload>;

  if (!r.prompt || !r.jumbled || !r.correct) {
    return { ok: false, error: "Invalid space_insertion payload (missing fields)" };
  }
  if (r.correct.replace(/\s+/g, "") !== r.jumbled.replace(/\s+/g, "")) {
    return {
      ok: false,
      error: `space_insertion: removing spaces from correct ("${r.correct}") doesn't match jumbled ("${r.jumbled}")`,
    };
  }

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "space_insertion",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      jumbled: r.jumbled,
      correct: r.correct,
    },
  };
}

/* ─── multiple_choice ─────────────────────────────────────── */

export type MultipleChoicePayload = {
  id: string;
  type: "multiple_choice";
  prompt: string;
  hint: string;
  difficulty: number;
  choices: string[]; // exactly 4 unique
  correct: string; // must equal one of choices byte-for-byte
};

const MULTIPLE_CHOICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    hint: { type: Type.STRING },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct: { type: Type.STRING },
  },
  required: ["prompt", "hint", "choices", "correct"],
};

export async function authorMultipleChoice(
  input: AuthorInput,
): Promise<AuthorResult<MultipleChoicePayload>> {
  const typeNote = `multiple_choice — exactly 4 unique choices. ` +
    `correct must be byte-for-byte one of choices. ` +
    `Test the actual CCSS standard's skill (not adjacent skills). ` +
    `If the critique says "context required," include a sentence in the prompt. ` +
    `Distractors must be plausible — not random unrelated words. ` +
    `No self-leak: the prompt must NOT contain the correct answer verbatim.`;

  const result = await callGemini<Partial<MultipleChoicePayload> & { error?: string }>(
    BASE_SYSTEM,
    buildUserMessage(input, typeNote),
    MULTIPLE_CHOICE_SCHEMA,
  );
  if ("error" in result && result.error) return { ok: false, error: result.error };
  const r = result as Partial<MultipleChoicePayload>;

  if (
    !r.prompt ||
    !Array.isArray(r.choices) ||
    r.choices.length !== 4 ||
    !r.correct
  ) {
    return { ok: false, error: "Invalid multiple_choice payload (missing fields or wrong choice count)" };
  }
  const trimmed = r.choices.map((c) => String(c).trim());
  if (new Set(trimmed).size !== 4) {
    return { ok: false, error: "multiple_choice: duplicate choices after trim" };
  }
  if (!trimmed.includes(String(r.correct).trim())) {
    return { ok: false, error: "multiple_choice: correct not in choices" };
  }

  return {
    ok: true,
    payload: {
      id: input.questionId,
      type: "multiple_choice",
      prompt: r.prompt,
      hint: r.hint ?? "",
      difficulty: input.difficulty ?? 1,
      choices: r.choices,
      correct: r.correct,
    },
  };
}

/* ─── Dispatcher ───────────────────────────────────────────── */

export type AuthorableType =
  | "multiple_choice"
  | "missing_word"
  | "sentence_build"
  | "category_sort"
  | "tap_to_pair"
  | "sound_machine"
  | "space_insertion";

export async function authorByType(
  targetType: AuthorableType,
  input: AuthorInput,
): Promise<AuthorResult<any>> {
  switch (targetType) {
    case "multiple_choice":
      return authorMultipleChoice(input);
    case "missing_word":
      return authorMissingWord(input);
    case "sentence_build":
      return authorSentenceBuild(input);
    case "category_sort":
      return authorCategorySort(input);
    case "tap_to_pair":
      return authorTapToPair(input);
    case "sound_machine":
      return authorSoundMachine(input);
    case "space_insertion":
      return authorSpaceInsertion(input);
    default:
      return { ok: false, error: `Unknown target type: ${targetType}` };
  }
}
