import { wordsByTag, type WordEntry } from "./words";
import { sentenceTemplates, buildSentence } from "./sentences";
import { generateMissingWord, resetMissingWordIds } from "./missing-word";
import type { MatchingQuestion } from "@/lib/assessment/questions";

/* ── Helpers ─────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let nextId = 1;
function makeId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

/* ── Category Sort Generator ─────────────────────────── */

export function generateCategorySort(
  tag1: string,
  tag2: string,
  label1: string,
  label2: string,
  count = 3,
  usedWords: Set<string> = new Set()
): MatchingQuestion | null {
  const pool1 = shuffle(wordsByTag(tag1).filter((w) => !usedWords.has(w.word) && !w.tags.includes(tag2)));
  const pool2 = shuffle(wordsByTag(tag2).filter((w) => !usedWords.has(w.word) && !w.tags.includes(tag1)));

  if (pool1.length < count || pool2.length < count) return null;

  const pick1 = pool1.slice(0, count);
  const pick2 = pool2.slice(0, count);

  // Mark used
  for (const w of [...pick1, ...pick2]) usedWords.add(w.word);

  const items1 = pick1.map((w) => capitalize(w.word));
  const items2 = pick2.map((w) => capitalize(w.word));

  return {
    id: makeId("gen-cs"),
    type: "category_sort",
    prompt: `Sort the words into "${label1}" and "${label2}".`,
    categories: [label1, label2],
    categoryItems: {
      [label1]: items1,
      [label2]: items2,
    },
    items: shuffle([...items1, ...items2]),
  };
}

/* ── Rhyme Sort Generator ────────────────────────────── */

export function generateRhymeSort(
  family1: string,
  family2: string,
  count = 3,
  usedWords: Set<string> = new Set()
): MatchingQuestion | null {
  const tag1 = `rhyme:${family1}`;
  const tag2 = `rhyme:${family2}`;
  const label1 = `${family1} words`;
  const label2 = `${family2} words`;

  const pool1 = shuffle(wordsByTag(tag1).filter((w) => !usedWords.has(w.word)));
  const pool2 = shuffle(wordsByTag(tag2).filter((w) => !usedWords.has(w.word)));

  if (pool1.length < count || pool2.length < count) return null;

  const pick1 = pool1.slice(0, count);
  const pick2 = pool2.slice(0, count);

  for (const w of [...pick1, ...pick2]) usedWords.add(w.word);

  const items1 = pick1.map((w) => capitalize(w.word));
  const items2 = pick2.map((w) => capitalize(w.word));

  return {
    id: makeId("gen-rs"),
    type: "category_sort",
    prompt: "Sort the rhyming words!",
    categories: [label1, label2],
    categoryItems: {
      [label1]: items1,
      [label2]: items2,
    },
    items: shuffle([...items1, ...items2]),
  };
}

/* ── Beginning Sound Generator ───────────────────────── */

export function generateBeginningSound(
  letter1: string,
  letter2: string,
  count = 3,
  usedWords: Set<string> = new Set()
): MatchingQuestion | null {
  const tag1 = `starts:${letter1.toLowerCase()}`;
  const tag2 = `starts:${letter2.toLowerCase()}`;

  // Only pick nouns/adjectives (words with recognizable meanings, not sight words like "the")
  const pool1 = shuffle(
    wordsByTag(tag1).filter((w) => !usedWords.has(w.word) && w.tags.includes("noun"))
  );
  const pool2 = shuffle(
    wordsByTag(tag2).filter((w) => !usedWords.has(w.word) && w.tags.includes("noun"))
  );

  if (pool1.length < count || pool2.length < count) return null;

  const pick1 = pool1.slice(0, count);
  const pick2 = pool2.slice(0, count);

  for (const w of [...pick1, ...pick2]) usedWords.add(w.word);

  const label1 = `Starts with ${letter1.toUpperCase()}`;
  const label2 = `Starts with ${letter2.toUpperCase()}`;
  const items1 = pick1.map((w) => capitalize(w.word));
  const items2 = pick2.map((w) => capitalize(w.word));

  return {
    id: makeId("gen-bs"),
    type: "category_sort",
    prompt: `Sort by starting sound: ${letter1.toUpperCase()} or ${letter2.toUpperCase()}?`,
    categories: [label1, label2],
    categoryItems: {
      [label1]: items1,
      [label2]: items2,
    },
    items: shuffle([...items1, ...items2]),
  };
}

/* ── Sentence Build Generator ────────────────────────── */

export function generateSentenceBuild(
  usedWords: Set<string> = new Set()
): MatchingQuestion | null {
  const templates = shuffle([...sentenceTemplates]);

  for (const tpl of templates) {
    const result = buildSentence(tpl, new Set(usedWords));
    if (!result) continue;

    // Mark words used
    for (const w of result.words) usedWords.add(w.toLowerCase());

    return {
      id: makeId("gen-sb"),
      type: "sentence_build",
      prompt: "Put the words in order to make a sentence.",
      words: shuffle(result.words),
      correctSentence: result.correctSentence,
      sentenceHint: result.hint,
      sentenceAudioUrl: result.audioUrl,
    };
  }

  return null;
}

/* ── Category Sort Presets ───────────────────────────── */

interface CategoryPreset {
  tag1: string;
  tag2: string;
  label1: string;
  label2: string;
  prompt: string;
}

const categoryPresets: CategoryPreset[] = [
  { tag1: "animal", tag2: "thing", label1: "Animals", label2: "Things", prompt: "Which are animals and which are things?" },
  { tag1: "big", tag2: "small", label1: "Big", label2: "Small", prompt: "Which things are big and which are small?" },
  { tag1: "land", tag2: "water", label1: "Land", label2: "Water", prompt: "Which live on land and which live in water?" },
  { tag1: "food", tag2: "animal", label1: "Food", label2: "Animals", prompt: "Which are things you eat and which are animals?" },
  { tag1: "living", tag2: "nonliving", label1: "Living", label2: "Non-living", prompt: "Which are living and which are non-living?" },
  { tag1: "noisy", tag2: "quiet", label1: "Noisy", label2: "Quiet", prompt: "Which things make noise and which are quiet?" },
  { tag1: "inside", tag2: "outside", label1: "Inside", label2: "Outside", prompt: "Which are found inside and which are outside?" },
  { tag1: "fly", tag2: "land", label1: "Fly", label2: "Walk", prompt: "Which animals can fly and which walk?" },
  { tag1: "clothing", tag2: "food", label1: "Wear", label2: "Eat", prompt: "Which do you wear and which do you eat?" },
  { tag1: "animal", tag2: "food", label1: "Animals", label2: "Food", prompt: "Which are animals and which are food?" },
  { tag1: "nature", tag2: "vehicle", label1: "Nature", label2: "Vehicles", prompt: "Which are from nature and which are vehicles?" },
];

/** Rhyme family pairs that have enough words */
const rhymePairs: [string, string][] = [
  ["-at", "-ig"],
  ["-ug", "-an"],
  ["-at", "-ug"],
  ["-ig", "-an"],
  ["-at", "-an"],
  ["-og", "-ug"],
  ["-in", "-en"],
  ["-it", "-ug"],
  ["-ap", "-op"],
  ["-at", "-og"],
  ["-ed", "-et"],
  ["-un", "-up"],
];

/** Letter pairs for beginning sounds */
const letterPairs: [string, string][] = [
  ["b", "c"],
  ["c", "d"],
  ["b", "f"],
  ["c", "f"],
  ["b", "s"],
  ["d", "h"],
  ["f", "h"],
  ["m", "p"],
  ["r", "s"],
  ["p", "s"],
  ["b", "m"],
  ["c", "s"],
  ["b", "r"],
  ["h", "s"],
];

/* ── Top-level Generator ─────────────────────────────── */

type GeneratorType = "category" | "rhyme" | "beginning_sound";

/**
 * Generate a matching set with a mix of CategorySort, SentenceBuild, and MissingWord questions.
 * Returns an interleaved array of all three types.
 */
export function generateMatchingSet(
  catCount = 3,
  sentCount = 2,
  mwCount = 2
): MatchingQuestion[] {
  // Reset ID counters for fresh run
  nextId = 1;
  resetMissingWordIds();
  const usedWords = new Set<string>();

  // Pick category-sort questions using a mix of generator types
  const generatorTypes = shuffle<GeneratorType>([
    "category",
    "rhyme",
    "beginning_sound",
    "category",
    "rhyme",
    "beginning_sound",
  ]).slice(0, catCount);

  const catQuestions: MatchingQuestion[] = [];
  const shuffledPresets = shuffle([...categoryPresets]);
  const shuffledRhymes = shuffle([...rhymePairs]);
  const shuffledLetters = shuffle([...letterPairs]);
  let presetIdx = 0;
  let rhymeIdx = 0;
  let letterIdx = 0;

  for (const gtype of generatorTypes) {
    let q: MatchingQuestion | null = null;

    if (gtype === "category") {
      // Try presets until one works
      while (!q && presetIdx < shuffledPresets.length) {
        const preset = shuffledPresets[presetIdx++];
        q = generateCategorySort(preset.tag1, preset.tag2, preset.label1, preset.label2, 3, usedWords);
        if (q) q.prompt = preset.prompt;
      }
    } else if (gtype === "rhyme") {
      while (!q && rhymeIdx < shuffledRhymes.length) {
        const [f1, f2] = shuffledRhymes[rhymeIdx++];
        q = generateRhymeSort(f1, f2, 3, usedWords);
      }
    } else {
      while (!q && letterIdx < shuffledLetters.length) {
        const [l1, l2] = shuffledLetters[letterIdx++];
        q = generateBeginningSound(l1, l2, 3, usedWords);
      }
    }

    // Fallback: try any category preset
    if (!q) {
      while (!q && presetIdx < shuffledPresets.length) {
        const preset = shuffledPresets[presetIdx++];
        q = generateCategorySort(preset.tag1, preset.tag2, preset.label1, preset.label2, 3, usedWords);
        if (q) q.prompt = preset.prompt;
      }
    }

    if (q) catQuestions.push(q);
  }

  // Generate sentence-build questions
  const sentQuestions: MatchingQuestion[] = [];
  for (let i = 0; i < sentCount; i++) {
    const q = generateSentenceBuild(usedWords);
    if (q) sentQuestions.push(q);
  }

  // Generate missing-word questions
  const mwQuestions: MatchingQuestion[] = [];
  const usedSentences = new Set<number>();
  for (let i = 0; i < mwCount; i++) {
    const q = generateMissingWord(usedSentences);
    if (q) mwQuestions.push(q);
  }

  // Interleave all three types: cat, sent, mw, cat, sent, mw, ...
  const result: MatchingQuestion[] = [];
  const max = Math.max(catQuestions.length, sentQuestions.length, mwQuestions.length);
  for (let i = 0; i < max; i++) {
    if (i < catQuestions.length) result.push(catQuestions[i]);
    if (i < sentQuestions.length) result.push(sentQuestions[i]);
    if (i < mwQuestions.length) result.push(mwQuestions[i]);
  }

  return result;
}
