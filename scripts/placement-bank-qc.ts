/**
 * PLACEMENT BANK QC - loads the authored bank, runs validateBank plus the
 * authoring rules the validator does not encode, prints every error, prints
 * the veto table for Jennifer (markdown), and exits 1 on any error.
 *
 *   npx tsx scripts/placement-bank-qc.ts          # veto table + QC result
 *   npx tsx scripts/placement-bank-qc.ts --table  # veto table only (paste into README)
 *
 * Text only: no audio, no images, no network, no writes.
 */
import fs from "node:fs";
import path from "node:path";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import {
  PASSAGE_MIN_WORDS, QUESTIONS_PER_PASSAGE, LISTENING_QUESTIONS,
  childCopyProblems, countWords, validateBank,
  type BandBank, type BankQuestion, type PlacementBank,
} from "@/lib/placement/bank";
import { BAND_LABEL, type Band } from "@/lib/placement/ladder";

const ROOT = path.resolve(__dirname, "..");
const PASSAGE_MAX_OVER_MIN = 40;
const MAX_QUOTED_LINES = 2;
const MAX_FIRST_SENTENCE_WORDS = 8;
const OPTIONS_PER_BAND: Record<Exclude<Band, 0>, number> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 4 };
const OPTION_IDS = ["a", "b", "c", "d"];
const NAMES = ["sam", "kim", "ben", "nia", "max", "rosa", "omar", "lee"];

/** The 45 phoneme clips that already exist (audio/phonemes/{id}.mp3). */
function phonemeIds(): Set<string> {
  const file = path.join(ROOT, "scripts", "phoneme-database.json");
  const list = JSON.parse(fs.readFileSync(file, "utf8")) as { id: string }[];
  return new Set(list.map((p) => p.id));
}

/** Letter -> phoneme id for the simple CVC/VC words the foundations stage uses. */
function phonemeForLetter(ch: string): string {
  if ("aeiou".includes(ch)) return `short_${ch}`;
  if (ch === "c") return "c_hard";
  return ch;
}

function words(text: string): string[] {
  return text.split(/\s+/).map((t) => t.replace(/[^A-Za-z0-9']/g, "").toLowerCase()).filter(Boolean);
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]*[.!?]/);
  return m ? m[0] : text;
}

function textProblems(where: string, text: string, errors: string[]) {
  for (const p of childCopyProblems(text)) errors.push(`${where}: ${p}`);
  if (/\d/.test(text)) errors.push(`${where}: contains a numeral`);
  if (/-/.test(text)) errors.push(`${where}: contains a hyphen`);
  const quoted = (text.match(/"/g) ?? []).length;
  if (quoted % 2 !== 0) errors.push(`${where}: unbalanced double quotes`);
  if (quoted / 2 > MAX_QUOTED_LINES) errors.push(`${where}: ${quoted / 2} quoted lines, max ${MAX_QUOTED_LINES}`);
  if (/[^\x20-\x7E\n]/.test(text)) errors.push(`${where}: non-ASCII character (curly quote, emoji, or dash)`);
}

function questionProblems(where: string, qs: BankQuestion[], optionCount: number, errors: string[]) {
  const kinds = qs.map((q) => q.kind).join(",");
  const expectedKinds = qs.length === 3 ? "literal,literal,inferential" : "literal,inferential";
  if (kinds !== expectedKinds) errors.push(`${where}: question kinds are ${kinds}, want ${expectedKinds}`);
  const positions = new Set<string>();
  qs.forEach((q, i) => {
    const w = `${where}/${q.id}`;
    if (q.options.length !== optionCount) errors.push(`${w}: ${q.options.length} options, want ${optionCount}`);
    q.options.forEach((o, j) => {
      if (o.id !== OPTION_IDS[j]) errors.push(`${w}: option ${j} has id "${o.id}", want "${OPTION_IDS[j]}"`);
      const n = words(o.label).length;
      if (n < 1 || n > 5) errors.push(`${w}/${o.id}: option "${o.label}" is ${n} words, want 1-5`);
      if (/all of the above|none of the above/i.test(o.label)) errors.push(`${w}/${o.id}: banned option`);
    });
    const correct = q.options.find((o) => o.id === q.correctId);
    if (correct && q.prompt.toLowerCase().includes(correct.label.toLowerCase())) {
      errors.push(`${w}: prompt reveals the answer "${correct.label}"`);
    }
    if (!/[?]$/.test(q.prompt.trim())) errors.push(`${w}: prompt should be a question`);
    if (/\d|-/.test(q.prompt)) errors.push(`${w}: prompt has a numeral or hyphen`);
    positions.add(q.correctId);
    if (i === 0 && q.kind !== "literal") errors.push(`${w}: first question must be literal`);
  });
  if (qs.length >= 2 && positions.size < 2) errors.push(`${where}: every correct answer sits at the same position`);
}

function extraProblems(bank: PlacementBank): string[] {
  const errors: string[] = [];
  const ids = phonemeIds();
  const everyListWord = new Set<string>();

  for (const band of [0, 1, 2, 3, 4, 5] as Band[]) {
    const b = bank.bands[band];
    if (!b) continue;
    const where = `band ${band}`;
    for (const w of b.words) {
      if (!/^[a-z]+$/.test(w.word)) errors.push(`${where}: word "${w.word}" must be plain lowercase letters (no apostrophe or hyphen)`);
      if (NAMES.includes(w.word)) errors.push(`${where}: word "${w.word}" is a name`);
      everyListWord.add(w.word);
    }
    if (band === 0 || !b.passage) continue;
    const min = PASSAGE_MIN_WORDS[band as Exclude<Band, 0>];
    const n = countWords(b.passage.text);
    if (n > min + PASSAGE_MAX_OVER_MIN) errors.push(`${where}: passage has ${n} words, max ${min + PASSAGE_MAX_OVER_MIN}`);
    if (b.passage.id !== `g${band}-passage`) errors.push(`${where}: passage id "${b.passage.id}", want g${band}-passage`);
    textProblems(`${where} passage`, b.passage.text, errors);
    if (/-|\d/.test(b.passage.title)) errors.push(`${where}: title has a hyphen or numeral`);
    const fs1 = words(firstSentence(b.passage.text)).length;
    if (fs1 > MAX_FIRST_SENTENCE_WORDS) errors.push(`${where}: first sentence is ${fs1} words, keep it under ${MAX_FIRST_SENTENCE_WORDS + 1}`);
    b.passage.questions.forEach((q, i) => {
      if (q.id !== `g${band}-q${i + 1}`) errors.push(`${where}: question id "${q.id}", want g${band}-q${i + 1}`);
    });
    questionProblems(`${where} passage`, b.passage.questions, OPTIONS_PER_BAND[band as Exclude<Band, 0>], errors);
  }

  const f = bank.foundations;
  f.letterSounds.forEach((it, i) => {
    const w = `foundations/${it.id}`;
    if (it.id !== `ls-${i + 1}`) errors.push(`${w}: id should be ls-${i + 1}`);
    if (!ids.has(it.sound)) errors.push(`${w}: sound "${it.sound}" is not an existing phoneme clip`);
    if (it.sound !== phonemeForLetter(it.correct)) errors.push(`${w}: sound "${it.sound}" does not match letter "${it.correct}"`);
    for (const l of it.letters) if (!/^[a-z]$/.test(l)) errors.push(`${w}: letter choice "${l}" must be one lowercase letter`);
    if (new Set(it.letters).size !== it.letters.length) errors.push(`${w}: duplicate letter choices`);
    if (it.letters.length !== 4) errors.push(`${w}: wants 4 letter choices`);
  });
  const consonantsFirst = f.letterSounds.map((it) => "aeiou".includes(it.correct) ? "v" : "c").join("");
  if (!/^c+v+$/.test(consonantsFirst)) errors.push(`foundations: letter sounds must be consonants first, then vowels (got ${consonantsFirst})`);
  f.blending.forEach((it, i) => {
    const w = `foundations/${it.id}`;
    if (it.id !== `bl-${i + 1}`) errors.push(`${w}: id should be bl-${i + 1}`);
    for (const s of it.sounds) if (!ids.has(s)) errors.push(`${w}: sound "${s}" is not an existing phoneme clip`);
    if (it.sounds.length < 2 || it.sounds.length > 3) errors.push(`${w}: wants 2-3 sounds`);
    const expected = it.correct.split("").map(phonemeForLetter).join(",");
    if (it.sounds.join(",") !== expected) errors.push(`${w}: sounds [${it.sounds}] do not spell "${it.correct}" (expected [${expected}])`);
    if (it.options.length !== 3) errors.push(`${w}: wants 3 options`);
    if (new Set(it.options).size !== it.options.length) errors.push(`${w}: duplicate options`);
    for (const o of it.options) {
      if (!/^[a-z]{2,3}$/.test(o)) errors.push(`${w}: option "${o}" must be a 2-3 letter word`);
      if (o !== it.correct && ![...o].some((ch) => it.correct.includes(ch))) errors.push(`${w}: option "${o}" shares no letters with "${it.correct}"`);
    }
  });
  const dictFile = "/usr/share/dict/words";
  const dict = fs.existsSync(dictFile) ? new Set(fs.readFileSync(dictFile, "utf8").split("\n").map((w) => w.toLowerCase())) : null;
  const seenNonsense = new Set<string>();
  const passageVocab = new Set<string>();
  for (const band of [1, 2, 3, 4, 5] as Band[]) for (const w of words(bank.bands[band].passage?.text ?? "")) passageVocab.add(w);
  for (const w of words(f.listening.text)) passageVocab.add(w);
  for (const w of f.nonsenseWords) {
    if (seenNonsense.has(w)) errors.push(`foundations: nonsense word "${w}" repeated`);
    seenNonsense.add(w);
    if (!/^[bcdfghjklmnprstvwyz]{1,2}[aeiou][bcdfgklmnptvz]$/.test(w)) errors.push(`foundations: nonsense word "${w}" is not a CVC or CCVC shape`);
    if (dict?.has(w)) errors.push(`foundations: nonsense word "${w}" is in the system dictionary`);
    if (passageVocab.has(w)) errors.push(`foundations: nonsense word "${w}" appears in a passage`);
    if (f.blending.some((b) => b.options.includes(w))) errors.push(`foundations: nonsense word "${w}" is a blending option`);
  }
  if (!dict) errors.push("foundations: /usr/share/dict/words not found, nonsense words not checked against a dictionary");
  textProblems("foundations listening", f.listening.text, errors);
  const lfs = words(firstSentence(f.listening.text)).length;
  if (lfs > MAX_FIRST_SENTENCE_WORDS) errors.push(`foundations listening: first sentence is ${lfs} words`);
  questionProblems("foundations listening", f.listening.questions, 3, errors);
  return errors;
}

// ---------- veto table ----------

function line(s = "") { out.push(s); }
const out: string[] = [];

function questionTable(qs: BankQuestion[]) {
  qs.forEach((q, i) => {
    line(`${i + 1}. (${q.kind}) ${q.prompt}`);
    for (const o of q.options) line(`   - ${o.id}) ${o.label}${o.id === q.correctId ? "  <-- correct" : ""}`);
  });
}

function bandTable(b: BandBank) {
  const label = b.band === 5 ? "5th-grade ceiling list" : `${BAND_LABEL[b.band]} grade`;
  line(`## Band ${b.band} (${label})`);
  line();
  line("| # | word | pattern |");
  line("|---|---|---|");
  b.words.forEach((w, i) => line(`| ${i + 1} | ${w.word} | ${w.pattern} |`));
  line();
  if (!b.passage) {
    line("Passage: none. K children hear the listening story in Foundations instead.");
    line();
    return;
  }
  const n = countWords(b.passage.text);
  const min = PASSAGE_MIN_WORDS[b.band as Exclude<Band, 0>];
  line(`### Passage: "${b.passage.title}" (${n} words; range ${min} to ${min + PASSAGE_MAX_OVER_MIN})`);
  line();
  for (const para of b.passage.text.split(/\n\s*\n/)) line(`> ${para.replace(/\n/g, " ")}`), line(">");
  out.pop();
  line();
  line(`### Questions (${QUESTIONS_PER_PASSAGE}: two literal, one inferential)`);
  line();
  questionTable(b.passage.questions);
  line();
}

function vetoTable(bank: PlacementBank) {
  line("# Placement bank veto table");
  line();
  line("Every word, passage, and question below is in the exam exactly as printed. Strike anything and the QC script is rerun.");
  line();
  for (const band of [0, 1, 2, 3, 4, 5] as Band[]) bandTable(bank.bands[band]);
  const f = bank.foundations;
  line("## Foundations (K and 1st, or an older child whose lists land at K)");
  line();
  line("### Letter sounds (Luna plays the phoneme clip, the child taps the letter)");
  line();
  line("| # | clip | choices | correct |");
  line("|---|---|---|---|");
  f.letterSounds.forEach((it, i) => line(`| ${i + 1} | ${it.sound} | ${it.letters.join(" ")} | ${it.correct} |`));
  line();
  line("### Blending (Luna plays the sounds in order, the child taps the word)");
  line();
  line("| # | clips | choices | correct |");
  line("|---|---|---|---|");
  f.blending.forEach((it, i) => line(`| ${i + 1} | ${it.sounds.join(" + ")} | ${it.options.join(" ")} | ${it.correct} |`));
  line();
  line("### Nonsense words (the child reads them aloud)");
  line();
  line(f.nonsenseWords.map((w, i) => `${i + 1}. ${w}`).join("  "));
  line();
  line(`### Listening story (${countWords(f.listening.text)} words; range 40 to 80)`);
  line();
  line(`> ${f.listening.text}`);
  line();
  line(`### Listening questions (${LISTENING_QUESTIONS}: literal, then inferential)`);
  line();
  questionTable(f.listening.questions);
  line();
}

// ---------- main ----------

const tableOnly = process.argv.includes("--table");
vetoTable(PLACEMENT_BANK);
console.log(out.join("\n"));
if (tableOnly) process.exit(0);

const errors = [...validateBank(PLACEMENT_BANK), ...extraProblems(PLACEMENT_BANK)];
console.log("## QC result");
console.log();
if (errors.length === 0) {
  const total = Object.values(PLACEMENT_BANK.bands).reduce((n, b) => n + b.words.length, 0);
  console.log(`validateBank + authoring rules: 0 errors (${total} words, 5 passages, ${5 * QUESTIONS_PER_PASSAGE + LISTENING_QUESTIONS} questions, ${PLACEMENT_BANK.foundations.letterSounds.length + PLACEMENT_BANK.foundations.blending.length + PLACEMENT_BANK.foundations.nonsenseWords.length} foundations items).`);
  process.exit(0);
}
console.log(`${errors.length} error(s):`);
for (const e of errors) console.log(`- ${e}`);
process.exit(1);
