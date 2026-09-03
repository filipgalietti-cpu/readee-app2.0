/**
 * PLACEMENT BANK - the shape of the content the exam draws from, plus the
 * validator the bank QC script and the unit tests run. Content lives in
 * app/data/placement-bank/ (authored by the factory, vetoed by Jennifer).
 *
 * Standardization is what makes the numbers citable: fixed lists, fixed
 * passages of known length, fixed questions. Nothing here is generated live.
 */
import { WORDS_PER_LIST, type Band } from "./ladder";

/**
 * The norms assume a full 60-second read, so a passage must outlast the fastest
 * reader we could meet at that band: the 90th-percentile spring WCPM plus
 * margin (H&T 2017: 1st 116, 2nd 148, 3rd 166, 4th 184, 5th 195). K has no
 * passage; K children get a listening story instead.
 */
export const PASSAGE_MIN_WORDS: Record<Exclude<Band, 0>, number> = { 1: 140, 2: 170, 3: 190, 4: 210, 5: 230 };
export const PASSAGE_READ_SECONDS = 60; // the rate window (DIBELS/Acadience: 1 minute)
/** The child reads to the end (MAP Reading Fluency allows up to 5 min); this is our cap. */
export const PASSAGE_MAX_SECONDS = 150;
/** After the rate window, this much silence means the child has stopped. */
export const PASSAGE_SILENCE_STOP_MS = 12000;
export const QUESTIONS_PER_PASSAGE = 3;
export const LETTER_SOUND_ITEMS = 8;
export const BLENDING_ITEMS = 6;
export const NONSENSE_WORD_ITEMS = 6;
export const LISTENING_QUESTIONS = 2;

export type BankWord = { word: string; /** the phonics feature this word probes, e.g. "cvc", "silent-e", "r-controlled" */ pattern: string };
export type BankOption = { id: string; label: string };
export type BankQuestion = {
  id: string;
  kind: "literal" | "inferential";
  /** What Luna says. Reads the question, never the answer. */
  prompt: string;
  options: BankOption[];
  correctId: string;
};
export type BankPassage = { id: string; title: string; text: string; questions: BankQuestion[] };
export type BandBank = { band: Band; words: BankWord[]; passage: BankPassage | null };

export type LetterSoundItem = { id: string; /** what Luna says, e.g. "mmm" */ sound: string; letters: string[]; correct: string };
export type BlendingItem = { id: string; /** what Luna says, e.g. ["m", "a", "p"] */ sounds: string[]; options: string[]; correct: string };
export type FoundationsBank = {
  letterSounds: LetterSoundItem[];
  blending: BlendingItem[];
  nonsenseWords: string[];
  listening: { text: string; questions: BankQuestion[] };
};

export type PlacementBank = { bands: Record<Band, BandBank>; foundations: FoundationsBank };

export function countWords(text: string): number {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/[^A-Za-z0-9']/g, ""))
    .filter((t) => t.length > 0).length;
}

/** Words the child must never see or hear in exam copy. Marketing may say
 *  "assessment" to parents; Luna never says test, exam, quiz, or kid. */
export const FORBIDDEN_CHILD_WORDS = ["test", "exam", "quiz", "kid", "kids", "assessment"];

export function childCopyProblems(text: string): string[] {
  const problems: string[] = [];
  if (/[—–]/.test(text)) problems.push("em-dash or en-dash");
  for (const w of FORBIDDEN_CHILD_WORDS) {
    if (new RegExp(`\\b${w}\\b`, "i").test(text)) problems.push(`forbidden word "${w}"`);
  }
  return problems;
}

function validateQuestions(where: string, qs: BankQuestion[], expected: number, errors: string[], seen: Set<string>) {
  if (qs.length !== expected) errors.push(`${where}: expected ${expected} questions, got ${qs.length}`);
  for (const q of qs) {
    if (seen.has(q.id)) errors.push(`${where}: duplicate question id ${q.id}`);
    seen.add(q.id);
    if (q.options.length < 3 || q.options.length > 4) errors.push(`${where}/${q.id}: needs 3-4 options`);
    if (!q.options.some((o) => o.id === q.correctId)) errors.push(`${where}/${q.id}: correctId not among options`);
    const ids = new Set(q.options.map((o) => o.id));
    if (ids.size !== q.options.length) errors.push(`${where}/${q.id}: duplicate option ids`);
    for (const p of childCopyProblems(q.prompt)) errors.push(`${where}/${q.id}: prompt has ${p}`);
    for (const o of q.options) for (const p of childCopyProblems(o.label)) errors.push(`${where}/${q.id}/${o.id}: option has ${p}`);
  }
}

/** Returns a list of problems; an empty list means the bank is valid. */
export function validateBank(bank: PlacementBank): string[] {
  const errors: string[] = [];
  const allWords = new Map<string, Band>();
  const seenQ = new Set<string>();

  for (const band of [0, 1, 2, 3, 4, 5] as Band[]) {
    const b = bank.bands[band];
    if (!b) { errors.push(`band ${band}: missing`); continue; }
    if (b.band !== band) errors.push(`band ${band}: band field says ${b.band}`);
    if (b.words.length !== WORDS_PER_LIST) errors.push(`band ${band}: expected ${WORDS_PER_LIST} words, got ${b.words.length}`);
    for (const w of b.words) {
      const word = w.word;
      if (!/^[a-z][a-z'-]*$/.test(word)) errors.push(`band ${band}: word "${word}" must be lowercase letters only`);
      const prior = allWords.get(word);
      if (prior !== undefined) errors.push(`band ${band}: word "${word}" already used in band ${prior}`);
      allWords.set(word, band);
      if (!w.pattern) errors.push(`band ${band}: word "${word}" has no pattern`);
    }
    if (band === 0) {
      if (b.passage) errors.push("band 0: K has no passage (listening story lives in foundations)");
    } else {
      const min = PASSAGE_MIN_WORDS[band as Exclude<Band, 0>];
      if (!b.passage) { errors.push(`band ${band}: passage missing`); continue; }
      const n = countWords(b.passage.text);
      if (n < min) errors.push(`band ${band}: passage has ${n} words, needs at least ${min}`);
      for (const p of childCopyProblems(b.passage.title)) errors.push(`band ${band}: passage title has ${p}`);
      validateQuestions(`band ${band} passage`, b.passage.questions, QUESTIONS_PER_PASSAGE, errors, seenQ);
      const literal = b.passage.questions.filter((q) => q.kind === "literal").length;
      if (literal !== 2) errors.push(`band ${band}: expected 2 literal + 1 inferential question, got ${literal} literal`);
    }
  }

  const f = bank.foundations;
  if (!f) { errors.push("foundations: missing"); return errors; }
  if (f.letterSounds.length !== LETTER_SOUND_ITEMS) errors.push(`foundations: expected ${LETTER_SOUND_ITEMS} letter-sound items, got ${f.letterSounds.length}`);
  for (const it of f.letterSounds) {
    if (!it.letters.includes(it.correct)) errors.push(`foundations/${it.id}: correct letter not among choices`);
    if (it.letters.length < 3 || it.letters.length > 4) errors.push(`foundations/${it.id}: needs 3-4 letters`);
  }
  if (f.blending.length !== BLENDING_ITEMS) errors.push(`foundations: expected ${BLENDING_ITEMS} blending items, got ${f.blending.length}`);
  for (const it of f.blending) {
    if (!it.options.includes(it.correct)) errors.push(`foundations/${it.id}: correct word not among options`);
    if (it.sounds.length < 2 || it.sounds.length > 4) errors.push(`foundations/${it.id}: needs 2-4 sounds`);
  }
  if (f.nonsenseWords.length !== NONSENSE_WORD_ITEMS) errors.push(`foundations: expected ${NONSENSE_WORD_ITEMS} nonsense words, got ${f.nonsenseWords.length}`);
  for (const w of f.nonsenseWords) {
    if (!/^[a-z]{2,5}$/.test(w)) errors.push(`foundations: nonsense word "${w}" must be 2-5 lowercase letters`);
    if (allWords.has(w)) errors.push(`foundations: nonsense word "${w}" is a real word in the lists`);
  }
  const ln = countWords(f.listening.text);
  if (ln < 40 || ln > 80) errors.push(`foundations: listening story has ${ln} words, wants 40-80`);
  validateQuestions("foundations listening", f.listening.questions, LISTENING_QUESTIONS, errors, seenQ);
  return errors;
}
