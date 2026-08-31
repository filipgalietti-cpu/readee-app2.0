/**
 * WARM-UP GENERATOR — builds Warm-Up Arcade rounds from lesson anchors.
 *
 *   npx tsx scripts/warmup-generate.ts --lesson=silent-e
 *   npx tsx scripts/warmup-generate.ts --all --limit=12 --skip-existing
 *   npx tsx scripts/warmup-generate.ts --lesson=silent-e --force
 *   npx tsx scripts/warmup-generate.ts --all --dry        (compose+judge only)
 *
 * Pipeline per lesson: ROUTE (archetype + content signals → recipe) →
 * COMPOSE (deterministic anchor extraction; topic-scout is the ONE generative
 * step, a single Gemini call grounded in the lesson's own text) → JUDGE
 * (mechanical checks + Gemini decoy-ambiguity check for topic-scout) →
 * WRITE def (app/data/warmups-v2/gen/<lessonId>-warmup.ts, auto-registered)
 * → TTS (shared warmup-tts-lib machinery, paced for the shared Vertex quota)
 * → WHISPER-VERIFY every clip (base, arbitrate with small; genuine drift →
 * re-record once, second failure → drop that clip's audio field, never ship
 * a bad clip).
 *
 * Idempotent + resumable: a lesson whose def file exists with all clips
 * recorded AND whisper-verified is skipped unless --force.
 *
 * Hand-built pilots (HAND_BUILT_WARMUPS) always win — their lessons are
 * never generated over.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as fss from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

import type { LessonDef, SceneDef, SortDef, ChooseDef, ListenDef, HighlightDef, TransformDef } from "../lib/lesson-engine/types";
import type { WarmupDef, WarmupTile, WarmupWave, WarmupBuild } from "../lib/warmup-engine/types";
import { LESSONS } from "../app/data/lessons-v2";
// Hand-built defs are imported directly (NOT via ../app/data/warmups-v2) so a
// stale gen/index.ts can never brick the generator that repairs it.
import { soundSwitchHunt } from "../app/data/warmups-v2/sound-switch-hunt";
import { storyWordScout } from "../app/data/warmups-v2/story-word-scout";
import { wordBuilderCompounds } from "../app/data/warmups-v2/word-builder-compounds";
import { snapWordDash } from "../app/data/warmups-v2/snap-word-dash";
import { rhymeRain } from "../app/data/warmups-v2/rhyme-rain";
import { oppositeBlast } from "../app/data/warmups-v2/opposite-blast";
import { jobsForWarmup, recordWarmup, synthClip, TTS_PACE_MS } from "./warmup-tts-lib";

const HAND_BUILT_WARMUPS = { soundSwitchHunt, storyWordScout, wordBuilderCompounds, snapWordDash, rhymeRain, oppositeBlast };

// ────────────────────────────────────────────────────────────── CLI ──
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => (argv.find((a) => a.startsWith(`--${n}=`)) ?? "").split("=")[1];
const ONE_LESSON = opt("lesson");
const ALL = flag("all");
const LIMIT = parseInt(opt("limit") ?? "0", 10) || Infinity;
const SKIP_EXISTING = flag("skip-existing");
const FORCE = flag("force");
const DRY = flag("dry");

const ROOT = process.cwd();
const GEN_DIR = path.join(ROOT, "app/data/warmups-v2/gen");
const AUDIO_ROOT = path.join(ROOT, "public/audio/warmups-v2");
const HAND_BUILT_LESSONS = new Set(Object.values(HAND_BUILT_WARMUPS).map((w) => w.lessonId));

// ─────────────────────────────────────────────────────── dictionary ──
const DICT = new Set(
  fss.readFileSync("/usr/share/dict/words", "utf-8").split("\n").map((w) => w.toLowerCase()),
);
const inDict = (w: string) => DICT.has(w.toLowerCase());

// ─────────────────────────────────────────────────────────── helpers ──
const lc = (s: string) => s.trim().toLowerCase();
const isTile = (w: string) => /^[a-z]{2,14}$/.test(w);
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const titleCase = (s: string) => s.split(/\s+/).map(cap).join(" ");
const uniq = <T,>(a: T[]) => [...new Set(a)];
/** Spell out letters for the ear: "ow" → "o w" (never bare phoneme tokens). */
const spell = (letters: string) => letters.split("").join(" ");

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// ─────────────────────────────────────── lesson anchor extraction ──
type SortX = { buckets: string[]; itemsByBucket: Map<string, string[]> };

function scenes(l: LessonDef): SceneDef[] { return l.scenes ?? []; }
function inter<T>(l: LessonDef, t: string): T[] {
  return scenes(l).map((s) => s.interaction).filter((i): i is NonNullable<typeof i> => !!i && (i as { type: string }).type === t) as T[];
}
function sortsOf(l: LessonDef): SortX[] {
  return inter<SortDef>(l, "sort").map((s) => {
    const m = new Map<string, string[]>();
    for (const b of s.buckets) m.set(b, []);
    for (const it of s.items) {
      const w = lc(it.label);
      if (isTile(w)) m.get(it.bucket)?.push(w);
    }
    return { buckets: s.buckets, itemsByBucket: m };
  });
}
/** Merge sorts that share the same bucket pair (some lessons split one sort
 *  across scenes). */
function mergedSorts(l: LessonDef): SortX[] {
  const by = new Map<string, SortX>();
  for (const s of sortsOf(l)) {
    const key = s.buckets.map(lc).sort().join("|");
    const prev = by.get(key);
    if (!prev) { by.set(key, s); continue; }
    for (const [b, ws] of s.itemsByBucket) prev.itemsByBucket.set(b, uniq([...(prev.itemsByBucket.get(b) ?? []), ...ws]));
  }
  return [...by.values()];
}
function chooseWords(l: LessonDef): { word: string; correct: boolean }[] {
  const out: { word: string; correct: boolean }[] = [];
  for (const c of inter<ChooseDef>(l, "choose")) {
    for (const o of c.options) {
      const w = lc(o.label);
      if (isTile(w)) out.push({ word: w, correct: o.id === c.correctId });
    }
  }
  return out;
}
function listenWords(l: LessonDef): string[] {
  return inter<ListenDef>(l, "listen").flatMap((i) => i.items.map((x) => lc(x.label))).filter(isTile);
}
function transformsOf(l: LessonDef): TransformDef[] { return inter<TransformDef>(l, "transform"); }
function highlightsOf(l: LessonDef): HighlightDef[] { return inter<HighlightDef>(l, "highlight"); }
function readAlongTexts(l: LessonDef): string[] {
  return scenes(l).map((s) => (s.interaction?.type === "read-along" ? s.interaction.text : "")).filter(Boolean);
}
function lessonText(l: LessonDef): string {
  return [l.title, l.objective, ...(l.concepts ?? [])].join(" ").toLowerCase();
}
function narrationExcerpt(l: LessonDef, maxChars = 2400): string {
  const parts = [
    ...readAlongTexts(l),
    ...scenes(l).map((s) => s.fx?.text ?? ""),
    ...highlightsOf(l).map((h) => h.text),
    ...scenes(l).map((s) => s.narration?.script ?? ""),
  ].filter(Boolean);
  let out = "";
  for (const p of parts) {
    if (out.length + p.length > maxChars) break;
    out += p + "\n";
  }
  return out.trim();
}

// ───────────────────────────────────────────────────────── routing ──
type Plan =
  | { kind: "sound-hunt" }
  | { kind: "rhyme-rain" }
  | { kind: "snap-dash" }
  | { kind: "family-blast"; variant: "synonym" | "antonym" }
  | { kind: "builder" }
  | { kind: "topic-scout"; variant: "story" | "topic" | "category" };

export function route(l: LessonDef): Plan | { skip: string } {
  const t = lessonText(l);
  switch (l.archetype) {
    case "phonics":
      if (/rhym/.test(t)) return { kind: "rhyme-rain" };
      if (/snap word|heart word|tricky word|sight word|by heart|irregular/.test(t)) return { kind: "snap-dash" };
      return { kind: "sound-hunt" };
    case "vocabulary":
      if (/prefix|suffix|compound|root word|base word|word part/.test(t)) return { kind: "builder" };
      // Category before opposites: mixed K lessons (categorization + opposites)
      // lead with sorting, and the flagship antonym lesson is hand-built.
      if (/categor|group|belongs|sort words/.test(t)) return { kind: "topic-scout", variant: "category" };
      if (/opposite|antonym/.test(t)) return { kind: "family-blast", variant: "antonym" };
      if (/shades|family words|almost the same|weakest to strongest|synonym/.test(t)) return { kind: "family-blast", variant: "synonym" };
      return { kind: "topic-scout", variant: l.standard.startsWith("RL") ? "story" : "topic" };
    case "story-elements":
    case "inference":
    case "fluency":
    case "print-concepts":
      return { kind: "topic-scout", variant: /^RL/.test(l.standard) || /stor/.test(t) ? "story" : "topic" };
    default:
      return { skip: `no recipe for archetype "${l.archetype}"` };
  }
}

// ───────────────────────────────────────────── composed round shape ──
type Composed = {
  def: WarmupDef;
  /** Words that must never appear as targets (the cow bug). */
  forbiddenTargets: string[];
  tap: boolean;
};

const audioPath = (warmupId: string, file: string) => `/audio/warmups-v2/${warmupId}/${file}.mp3`;

function buildWaves(warmupId: string, targets: string[], decoys: string[], tileAudio: boolean): WarmupWave[] {
  const waves: { t: WarmupTile[]; d: WarmupTile[] }[] = [0, 1, 2].map(() => ({ t: [], d: [] }));
  targets.forEach((w, i) => waves[i % 3].t.push({
    word: w, isMatch: true, ...(tileAudio ? { audio: audioPath(warmupId, `w-${w}`) } : {}),
  }));
  decoys.forEach((w, i) => waves[i % 3].d.push({ word: w, isMatch: false }));
  // Interleave targets/decoys inside each wave for a natural spawn mix.
  return waves
    .map(({ t, d }) => {
      const tiles: WarmupTile[] = [];
      for (let i = 0; i < Math.max(t.length, d.length); i++) {
        if (t[i]) tiles.push(t[i]);
        if (d[i]) tiles.push(d[i]);
      }
      return { tiles };
    })
    .filter((w) => w.tiles.length > 0);
}

/** Words that look like tiles but are answer-scaffolding, not content —
 *  never let augmentation promote them onto the field. */
const META_WORDS = new Set(["one", "two", "three", "beginning", "middle", "end", "first", "last", "yes", "no", "long", "short", "big", "little", "beat", "beats", "sound", "word", "words", "letter", "letters"]);

function baseDef(l: LessonDef, over: Partial<WarmupDef> & Pick<WarmupDef, "title" | "recipe" | "mode" | "playPrompt" | "intro" | "celebrate" | "waves">): WarmupDef {
  return {
    id: `${l.id}-warmup`,
    lessonId: l.id,
    lessonTitle: l.title,
    playSeconds: 45,
    carrots: 2,
    ...over,
  } as WarmupDef;
}

// ───────────────────────────────────────────── composer: sound-hunt ──
function composeSoundHunt(l: LessonDef): Composed | { skip: string } {
  const wid = `${l.id}-warmup`;
  const sorts = mergedSorts(l).filter((s) => s.buckets.length === 2);
  if (!sorts.length) return { skip: "sound-hunt: no two-bucket sort to anchor a rule" };
  const sort = sorts.sort((a, b) =>
    [...b.itemsByBucket.values()].flat().length - [...a.itemsByBucket.values()].flat().length)[0];
  const [bA, bB] = sort.buckets;
  const conceptsText = lessonText(l);

  // ANCHOR RULE: both bucket names are words ("Moon"/"Book") and they share a
  // letter chunk the lesson teaches ("oo") → "catch words where oo sounds
  // like it does in moon".
  const nA = lc(bA), nB = lc(bB);
  let common = "";
  if (isTile(nA) && isTile(nB)) {
    for (let len = Math.min(nA.length, nB.length); len >= 2 && !common; len--) {
      for (let i = 0; i + len <= nA.length; i++) {
        const chunk = nA.slice(i, i + len);
        if (nB.includes(chunk) && conceptsText.includes(chunk)) { common = chunk; break; }
      }
    }
  }
  let targets: string[], decoys: string[], forbidden: string[];
  let intro: string, playPrompt: string, cardText: string, celebrate: string, zero: string, title: string;

  if (common) {
    const targetAnchor = nA, decoyAnchor = nB;
    targets = sort.itemsByBucket.get(bA) ?? [];
    decoys = sort.itemsByBucket.get(bB) ?? [];
    forbidden = [targetAnchor];
    intro = `Today's letters are ${spell(common)}. Sometimes ${spell(common)} sounds like it does in ${decoyAnchor}. Sometimes it sounds like it does in ${targetAnchor}. Your job: catch every word where ${spell(common)} sounds like ${targetAnchor}. Ready? Go!`;
    playPrompt = `Catch the words that sound like ${targetAnchor}!`;
    cardText = common;
    celebrate = `Wow, your ears are warmed up! You heard the ${spell(common)} sound, like in ${targetAnchor}, hiding in all those words. Now let's take those sharp ears into today's lesson.`;
    zero = `Good warm up! Those ${spell(common)} words are sneaky. Keep your ears open for the ${targetAnchor} sound in today's lesson, and you will catch them next time.`;
    title = `${cap(targetAnchor)} Sound Hunt`;
  } else {
    // DESCRIPTOR RULE: buckets like "short vowel"/"long vowel". Lessons order
    // known → new, so the LAST bucket is the concept being taught.
    const targetBucket = bB, otherBucket = bA;
    let label = lc(targetBucket);
    if (label.split(" ").length === 2 && label.endsWith("s")) label = label.slice(0, -1); // "two beats" → "two beat"
    targets = [...(sort.itemsByBucket.get(targetBucket) ?? [])];
    decoys = [...(sort.itemsByBucket.get(otherBucket) ?? [])];
    forbidden = [];
    // Augment from transforms + choose/listen words with honest phonics
    // heuristics (only where the rule is mechanically checkable).
    const longRule = /long|silent/.test(label + conceptsText) && /long/.test(label);
    const beatRule = /beat|syllable/.test(label + conceptsText) && /\b(one|two|three)\b/.test(label);
    for (const tr of transformsOf(l)) {
      const base = lc(tr.base), res = lc(tr.result);
      if (longRule && isTile(res) && isTile(base)) { targets.push(res); decoys.push(base); }
    }
    // Beat/syllable rules only trust listen-item exemplars — choose options on
    // counting lessons are meta answers ("one", "two"), not content words.
    const pool = uniq(
      beatRule ? listenWords(l) : [...chooseWords(l).map((c) => c.word), ...listenWords(l)],
    ).filter((w) => !META_WORDS.has(w));
    const isCVCe = (w: string) => /^[a-z]*[aeiou][bcdfghjklmnpqrstvwz]e$/.test(w);
    const isCVC = (w: string) => /^[bcdfghjklmnpqrstvwxyz]{1,2}[aeiou][bcdfghjklmnpqrstvwxyz]{1,2}$/.test(w);
    const beats = (w: string) => {
      let s = w;
      if (s.length > 3 && s.endsWith("e") && !s.endsWith("le")) s = s.slice(0, -1);
      return (s.match(/[aeiouy]+/g) ?? []).length;
    };
    for (const w of pool) {
      if (targets.includes(w) || decoys.includes(w)) continue;
      if (longRule) { if (isCVCe(w)) targets.push(w); else if (isCVC(w)) decoys.push(w); }
      else if (beatRule) {
        const want = /two/.test(label) ? 2 : /three/.test(label) ? 3 : 1;
        const b = beats(w);
        if (b === want) targets.push(w); else if (b >= 1 && b <= 3) decoys.push(w);
      }
    }
    targets = uniq(targets); decoys = uniq(decoys).filter((w) => !targets.includes(w));
    const [ex1, ex2] = targets;
    intro = `Listen up, word catcher! Some words here are ${label} words, like ${ex1} and ${ex2}. Your job: catch every ${label} word. If a word does not fit, let it go. Ready? Go!`;
    playPrompt = `Catch the ${label} words!`;
    cardText = titleCase(label);
    celebrate = `Wow, your ears are warmed up! You caught ${label} words like ${ex1} and ${ex2}. Now let's take those sharp ears into today's lesson.`;
    zero = `Good warm up! Those ${label} words are sneaky. Keep your ears open in today's lesson, and you will catch them next time.`;
    title = `${titleCase(label)} Hunt`;
  }

  targets = uniq(targets).filter((w) => !forbidden.includes(w)).slice(0, 8);
  decoys = uniq(decoys).filter((w) => !targets.includes(w)).slice(0, 6);
  const def = baseDef(l, {
    title, recipe: "sound-hunt", mode: "rule", skin: "carrot", playPrompt,
    intro: { audio: audioPath(wid, "intro"), script: intro, cardText },
    waves: buildWaves(wid, targets, decoys, true),
    celebrate: { audio: audioPath(wid, "celebrate"), script: celebrate },
    celebrateZero: { audio: audioPath(wid, "celebrate-zero"), script: zero },
  });
  return { def, forbiddenTargets: forbidden, tap: true };
}

// ───────────────────────────────────────────── composer: rhyme-rain ──
function composeRhymeRain(l: LessonDef): Composed | { skip: string } {
  const wid = `${l.id}-warmup`;
  // Family from an anchor-word sort ("cat"/"pig"): items rhyme with their
  // bucket word. Target = the family with the most words.
  const sorts = mergedSorts(l).filter((s) => s.buckets.every((b) => isTile(lc(b))));
  if (!sorts.length) return { skip: "rhyme-rain: no word-family sort found" };
  let best: { anchor: string; words: string[] } | null = null;
  const others: string[] = [];
  for (const s of sorts) {
    for (const [b, ws] of s.itemsByBucket) {
      const anchor = lc(b);
      const fam = ws.filter((w) => w !== anchor && w.slice(-2) === anchor.slice(-2));
      if (!best || fam.length > best.words.length) {
        if (best) others.push(...best.words);
        best = { anchor, words: fam };
      } else others.push(...ws);
    }
  }
  if (!best) return { skip: "rhyme-rain: no rhyme family extractable" };
  const anchor = best.anchor;
  const targets = uniq(best.words).slice(0, 8);
  const decoys = uniq(others).filter((w) => w.slice(-2) !== anchor.slice(-2) && !targets.includes(w) && w !== anchor).slice(0, 6);
  const def = baseDef(l, {
    title: "Rhyme Rain", recipe: "sound-hunt", mode: "rule", skin: "sky",
    playPrompt: `Catch everything that rhymes with ${anchor}!`,
    intro: {
      audio: audioPath(wid, "intro"),
      script: `Rhyming words sound the same at the end, like ${anchor} and ${targets[0]}. Word balloons are floating down. Catch every word that rhymes with ${anchor}. Ready? Go!`,
      cardText: anchor,
    },
    waves: buildWaves(wid, targets, decoys, true),
    celebrate: {
      audio: audioPath(wid, "celebrate"),
      script: `${cap(targets[0])}, ${targets[1]}, ${targets[2]}! You caught the rhymes. Rhyming words sound the same at the end, just like ${anchor}. Now let's make even more rhymes in today's lesson.`,
    },
    celebrateZero: {
      audio: audioPath(wid, "celebrate-zero"),
      script: `Good warm up! Rhymes can be sneaky. Listen for words that end like ${anchor}, like ${targets[0]} and ${targets[1]}, in today's lesson. Your ears will catch them, I know it.`,
    },
  });
  return { def, forbiddenTargets: [anchor], tap: true };
}

// ───────────────────────────────────────────── composer: snap-dash ──
function composeSnapDash(l: LessonDef): Composed | { skip: string } {
  const wid = `${l.id}-warmup`;
  const t = lessonText(l);
  const label = /tricky/.test(t) ? "tricky words" : /heart/.test(t) ? "heart words" : "snap words";
  const singular = label.replace(/s$/, "");
  // The lesson's own word list: concepts are the words themselves for these
  // lessons; fall back to the snap-word sort bucket.
  let targets = (l.concepts ?? []).map(lc).filter(isTile);
  const sorts = mergedSorts(l);
  const snapBucket = sorts.flatMap((s) => [...s.itemsByBucket.entries()])
    .filter(([b]) => /snap|heart|tricky|sight/i.test(b)).flatMap(([, ws]) => ws);
  if (targets.length < 5) targets = uniq([...targets, ...snapBucket]);
  targets = uniq(targets).slice(0, 8);
  // Decoys: regular decodable words the lesson itself contrasts against.
  const decoyBucket = sorts.flatMap((s) => [...s.itemsByBucket.entries()])
    .filter(([b]) => /sound|other|regular/i.test(b)).flatMap(([, ws]) => ws);
  const hlWords = highlightsOf(l).flatMap((h) => {
    const tg = h.targets.map(lc);
    return h.text.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => isTile(w) && w.length >= 3 && !tg.includes(w));
  });
  // Regular decodable words are always fair decoys against a sight-word rule
  // (the gold snap-word-dash decoys work exactly this way), so a curated CVC
  // pool tops up lessons that contrast too few regulars of their own.
  const SNAP_DECOYS = ["jump", "stop", "hand", "best", "swim", "plant", "sun", "hat", "run", "sit"];
  const decoys = uniq([...decoyBucket, ...hlWords, ...SNAP_DECOYS]).filter((w) => !targets.includes(w)).slice(0, 6);
  const [t1, t2, t3] = targets;
  const def = baseDef(l, {
    title: `${titleCase(singular)} Dash`, recipe: "word-catch", mode: "rule", skin: "carrot",
    speedRamp: true,
    playPrompt: `Catch the ${label}!`,
    intro: {
      audio: audioPath(wid, "intro"),
      script: `${cap(label)} are words you know by heart, like ${t1}, ${t2}, and ${t3}. Today they are hiding in the garden. Catch every ${singular} you see. Careful, they speed up! Ready? Go!`,
      cardText: titleCase(label),
    },
    waves: buildWaves(wid, targets, decoys, true),
    celebrate: {
      audio: audioPath(wid, "celebrate"),
      script: `Snap! You caught those ${label} at top speed. ${cap(t1)}, ${t2}, ${t3}, and more. You know them by heart, and that is exactly how readers read them. Now let's meet them in today's lesson.`,
    },
    celebrateZero: {
      audio: audioPath(wid, "celebrate-zero"),
      script: `Good warm up! ${cap(label)} move fast. You will meet ${t1}, ${t2}, and ${t3} in today's lesson, nice and slow this time.`,
    },
  });
  return { def, forbiddenTargets: [], tap: true };
}

// ─────────────────────────────────────── composer: family / opposite ──
function stemsOf(w: string): string[] {
  const out = [w];
  if (w.endsWith("s")) out.push(w.slice(0, -1));
  for (const suf of ["ed", "ing"]) {
    if (w.endsWith(suf)) {
      const head = w.slice(0, -suf.length);
      out.push(head, head + "e");
      if (head.length > 2 && head[head.length - 1] === head[head.length - 2]) out.push(head.slice(0, -1));
    }
  }
  return out;
}

function composeFamilyBlast(l: LessonDef, variant: "synonym" | "antonym"): Composed | { skip: string } {
  const wid = `${l.id}-warmup`;
  const famSorts = mergedSorts(l).filter((s) => s.buckets.length === 2 && s.buckets.every((b) => /family/i.test(b)));
  if (variant === "synonym") {
    if (!famSorts.length) return { skip: "family-blast: no word-family sort found" };
    const sort = famSorts[0];
    const [bA, bB] = sort.buckets;
    const anchor = lc(bA).replace(/\s*family\s*/i, "").trim();
    const decoyAnchor = lc(bB).replace(/\s*family\s*/i, "").trim();
    if (!isTile(anchor)) return { skip: "family-blast: bucket anchor is not a word" };
    let targets = [...(sort.itemsByBucket.get(bA) ?? [])];
    let decoys = [...(sort.itemsByBucket.get(bB) ?? [])];
    // Choose options join the side their stem belongs to ("tugged" → tug).
    const famSet = new Set([anchor, ...targets]);
    const decoySet = new Set([decoyAnchor, ...decoys]);
    for (const { word } of chooseWords(l)) {
      if (targets.includes(word) || decoys.includes(word)) continue;
      const st = stemsOf(word);
      if (st.some((s) => famSet.has(s))) targets.push(word);
      else if (st.some((s) => decoySet.has(s))) decoys.push(word);
      else decoys.push(word); // outside both families = clearly not a catch
    }
    const anchorStems = new Set([anchor, ...stemsOf(anchor), anchor + "s", anchor + "ed", anchor + "ing"]);
    targets = uniq(targets).filter((w) => !anchorStems.has(w) && !stemsOf(w).includes(anchor)).slice(0, 8);
    decoys = uniq(decoys).filter((w) => !targets.includes(w) && !anchorStems.has(w)).slice(0, 6);
    const [t1, t2, t3, t4] = targets;
    const def = baseDef(l, {
      title: "Word Family Blast", recipe: "word-catch", mode: "rule", skin: "carrot",
      playPrompt: `Catch the words that mean ${anchor}!`,
      intro: {
        audio: audioPath(wid, "intro"),
        script: `Family words mean almost the same thing, like ${anchor} and ${t1}. Today's word is ${anchor}. Catch every word that means almost the same as ${anchor}. If a word does not fit the family, let it go. Ready? Go!`,
        cardText: anchor,
      },
      waves: buildWaves(wid, targets, decoys, true),
      celebrate: {
        audio: audioPath(wid, "celebrate"),
        script: `Blast off! ${cap(t1)}, ${t2}, ${t3}, and ${t4 ?? t1}. Every one means almost the same as ${anchor}. You caught a whole word family. Let's meet more word families in today's lesson.`,
      },
      celebrateZero: {
        audio: audioPath(wid, "celebrate-zero"),
        script: `Good warm up! Word families are sneaky. ${cap(anchor)}, ${t1}, and ${t2} all mean almost the same thing. Watch for word families in today's lesson. You will catch them.`,
      },
    });
    return { def, forbiddenTargets: [anchor], tap: true };
  }
  // Antonym variant: needs a decidable pair from the lesson's own pairs.
  // Concepts like "big/small" or "(on, off)" pairs; too little signal → skip
  // (the hand-built opposite-blast covers the flagship lesson).
  return { skip: "family-blast(antonym): no extractable pair (hand-built covers the flagship)" };
}

// ─────────────────────────────────────────────── composer: builder ──
const PREFIXES = ["un", "re", "pre", "dis", "mis"];
const SUFFIXES = ["ful", "less", "ness"];

function composeBuilder(l: LessonDef): Composed | { skip: string } {
  const wid = `${l.id}-warmup`;
  const words = uniq([
    ...mergedSorts(l).flatMap((s) => [...s.itemsByBucket.values()].flat()),
    ...chooseWords(l).map((c) => c.word),
    ...transformsOf(l).map((t) => lc(t.result)),
  ]).filter(isTile);
  const builds: { word: string; parts: [string, string] }[] = [];
  const seen = new Set<string>();
  const add = (word: string, parts: [string, string]) => {
    if (seen.has(word)) return;
    if (parts[0] + parts[1] !== word) return;
    seen.add(word);
    builds.push({ word, parts });
  };
  // 1) transforms are explicit builds (base + add = result)
  for (const t of transformsOf(l)) {
    const base = lc(t.base), addPart = lc(t.add), res = lc(t.result);
    if (isTile(res) && base.length >= 2 && addPart.length >= 2 && base + addPart === res) add(res, [base, addPart]);
  }
  // 2) affix splits: known prefix/suffix + a real remaining word
  for (const w of words) {
    if (seen.has(w)) continue;
    const p = PREFIXES.find((x) => w.startsWith(x) && w.length - x.length >= 3 && inDict(w.slice(x.length)));
    if (p) { add(w, [p, w.slice(p.length)]); continue; }
    const s = SUFFIXES.find((x) => w.endsWith(x) && w.length - x.length >= 3 && inDict(w.slice(0, -x.length)));
    if (s) { add(w, [w.slice(0, -s.length), s]); continue; }
    // compound split: both halves real words
    for (let i = 3; i <= w.length - 3; i++) {
      const a = w.slice(0, i), b = w.slice(i);
      if (inDict(a) && inDict(b)) { add(w, [a, b]); break; }
    }
  }
  // NOTE: no cross-product "bonus" builds. /usr/share/dict is happy to bless
  // obscure combos ("unplant") that are wrong for K-2 — a real-but-uncalled
  // snap gently shaking apart is a far smaller cost than celebrating a
  // non-word. Builds come only from the lesson's own morphology anchors.
  if (builds.length < 5) return { skip: `builder: only ${builds.length} builds extractable` };
  const capped = builds.slice(0, 12);
  const allParts = new Set(capped.flatMap((b) => b.parts));
  const decoyPool = ["sock", "desk", "frog", "milk", "tree", "lamp", "jump", "pond"];
  const decoyParts = decoyPool.filter((d) =>
    !allParts.has(d) && ![...allParts].some((p) => inDict(p + d) || inDict(d + p)),
  ).slice(0, 4);
  const b0 = capped[0];
  const defBuilds: WarmupBuild[] = capped.map((b) => ({
    word: b.word, parts: b.parts, wordAudio: audioPath(wid, `w-${b.word}`),
  }));
  const def = baseDef(l, {
    title: "Word Builder", recipe: "word-catch", mode: "builder",
    skin: l.id.length % 2 === 0 ? "workshop" : "pond",
    playPrompt: "Snap parts together to build words!",
    startPrompt: "Snap parts together to build words!",
    intro: {
      audio: audioPath(wid, "intro"),
      script: "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
      cardText: `${b0.parts[0]} + ${b0.parts[1]}`,
    },
    waves: [],
    builds: defBuilds,
    decoyParts,
    celebrate: {
      audio: audioPath(wid, "celebrate"),
      script: "Wow, you snapped word parts together and built bigger words! Little parts can change what a word means. Let's take your word building power into today's lesson!",
    },
    celebrateZero: {
      audio: audioPath(wid, "celebrate-zero"),
      script: `Good warm up! Two word parts can make one bigger word, like ${b0.parts[0]} and ${b0.parts[1]} make ${b0.word}. Watch for words like that in today's lesson. You will build them, I know it.`,
    },
  });
  return { def, forbiddenTargets: [], tap: false };
}

// ──────────────────────────────────────────────── Gemini plumbing ──
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const GEN_MODEL = "gemini-2.5-flash";
let geminiCalls = 0;

async function geminiJson<T>(system: string, user: string, schema: object): Promise<T | null> {
  for (let a = 0; a < 3; a++) {
    try {
      geminiCalls++;
      const res = await gemini.models.generateContent({
        model: GEN_MODEL,
        contents: user,
        config: { systemInstruction: system, responseMimeType: "application/json", responseSchema: schema, temperature: 0.6 },
      });
      return JSON.parse(res.text ?? "") as T;
    } catch (e) {
      if (a === 2) console.log("   gemini error:", String((e as Error)?.message ?? e).slice(0, 160));
      await new Promise((r) => setTimeout(r, 2500 * (a + 1)));
    }
  }
  return null;
}

const SCOUT_SYSTEM = `You design 30-second word-catch warm-up games for children in grades K-2 (ages 5-8), played right before a reading lesson. Given a lesson's text, derive the lesson's WORLD and pick catch words.

The WORLD must be CONCRETE: a setting, subject, or thing a child can picture (a storm, a garden, the ocean, ants, a farm). NEVER a meta-world about reading itself (never: story, stories, book, books, words, letters, sentences, reading, facts). Reading-skill lessons always contain an example story or example topic inside their text; use THAT as the world. If the lesson text tells a story about a lost dog, the world is the dog's adventure, not "stories".

Rules for words:
- targets: exactly 6 single words that clearly BELONG in the world. A 6-year-old must instantly agree each belongs. Concrete, common, easy to read (3-9 letters, lowercase, no proper nouns, no hyphens).
- decoys: exactly 6 fun everyday single words that clearly do NOT belong in the world. Zero ambiguity: a reasonable 7-year-old must NOT be able to argue any decoy belongs. Avoid anything loosely connected to the world.
- Never include the world word itself in targets or decoys. No duplicates anywhere.
- worldNoun: 1-2 lowercase words naming the world (like "storm" or "the ocean").
- cardText: a short display version, capitalized (like "Storm").
- aPhrase: fits the sentence "Today's story has ___ in it" or "Today's book is all about ___" (like "a big storm" or "busy ants").
- inPhrase: fits "If it belongs ___, catch it" (like "in a storm" or "with the ants").
No em-dashes anywhere. Plain warm language.`;

type ScoutGen = { worldNoun: string; cardText: string; aPhrase: string; inPhrase: string; targets: string[]; decoys: string[] };
const SCOUT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    worldNoun: { type: Type.STRING },
    cardText: { type: Type.STRING },
    aPhrase: { type: Type.STRING },
    inPhrase: { type: Type.STRING },
    targets: { type: Type.ARRAY, items: { type: Type.STRING } },
    decoys: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["worldNoun", "cardText", "aPhrase", "inPhrase", "targets", "decoys"],
};

async function judgeScoutDecoys(world: string, inPhrase: string, decoys: string[]): Promise<string[]> {
  const schema = {
    type: Type.OBJECT,
    properties: { flagged: { type: Type.ARRAY, items: { type: Type.STRING } } },
    required: ["flagged"],
  };
  const res = await geminiJson<{ flagged: string[] }>(
    `You review decoy words for a children's "catch what belongs" game. The catch rule is: catch it if it belongs ${inPhrase} (the world is "${world}"). Decoys are SUPPOSED to be ordinary everyday things that are simply not part of that world. Flag a decoy ONLY if a typical 7-year-old would genuinely and immediately think it belongs (a direct, obvious connection). A stretch, a maybe, or a "you could imagine it there" is NOT a flag - almost anything can be imagined anywhere. Expect to flag zero or one word in a good set.`,
    `Decoys: ${decoys.join(", ")}`,
    schema,
  );
  return (res?.flagged ?? []).map(lc).filter((w) => decoys.includes(w));
}

async function composeTopicScout(l: LessonDef, variant: "story" | "topic" | "category"): Promise<Composed | { skip: string }> {
  const wid = `${l.id}-warmup`;
  const material = [
    `Lesson title: ${l.title} (grade: ${l.grade}, standard: ${l.standard})`,
    `Objective: ${l.objective}`,
    `Concepts: ${(l.concepts ?? []).join("; ")}`,
    variant === "category" ? `Word groups in the lesson: ${mergedSorts(l).map((s) => s.buckets.join("/") + " with " + [...s.itemsByBucket.values()].flat().join(", ")).join(" | ")}` : "",
    `Lesson text:\n${narrationExcerpt(l)}`,
  ].filter(Boolean).join("\n");
  const gen = await geminiJson<ScoutGen>(SCOUT_SYSTEM, `Kind: ${variant}\n${material}`, SCOUT_SCHEMA);
  if (!gen) return { skip: "topic-scout: generation failed" };

  const world = lc(gen.worldNoun ?? "").replace(/[^a-z ]/g, "").replace(/^(a|an|the) /, "").trim();
  const sanitize = (a: string[]) => uniq((a ?? []).map(lc).filter(isTile)).filter((w) => !world.split(" ").includes(w));
  let targets = sanitize(gen.targets).slice(0, 6);
  let decoys = sanitize(gen.decoys).filter((w) => !targets.includes(w)).slice(0, 6);
  const aPhrase = lc(gen.aPhrase ?? "").replace(/[—–]/g, ",").trim();
  const inPhrase = lc(gen.inPhrase ?? "").replace(/[—–]/g, ",").trim();
  const cardText = (gen.cardText ?? titleCase(world)).replace(/[—–]/g, " ").trim();
  console.log(`   world="${world}" (${inPhrase}) targets=[${targets.join(", ")}] decoys=[${decoys.join(", ")}]`);
  const META_WORLDS = /\b(story|stories|book|books|word|words|letter|letters|sentence|sentences|reading|fact|facts)\b/;
  if (META_WORLDS.test(world)) return { skip: `topic-scout: meta world "${world}" (needs a concrete world)` };
  if (targets.length < 5 || !world || !aPhrase || !inPhrase) return { skip: "topic-scout: generation too thin" };

  // Decoy ambiguity judge: flagged decoys get replaced once; still flagged →
  // dropped for good (keep at least 4).
  let flagged = await judgeScoutDecoys(world, inPhrase, decoys);
  if (flagged.length) {
    const repl = await geminiJson<{ decoys: string[] }>(
      SCOUT_SYSTEM,
      `Kind: ${variant}\n${material}\n\nThese decoys were too arguable for the world "${world}": ${flagged.join(", ")}. Give ${flagged.length} REPLACEMENT decoy words (single, lowercase, clearly not belonging ${inPhrase}). Avoid all of: ${[...targets, ...decoys].join(", ")}.`,
      { type: Type.OBJECT, properties: { decoys: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["decoys"] },
    );
    const fresh = sanitize(repl?.decoys ?? []).filter((w) => !targets.includes(w) && !decoys.includes(w));
    decoys = [...decoys.filter((d) => !flagged.includes(d)), ...fresh.slice(0, flagged.length)];
    const still = await judgeScoutDecoys(world, inPhrase, decoys);
    if (still.length) {
      console.log(`   dropped arguable decoys: ${still.join(", ")}`);
      decoys = decoys.filter((d) => !still.includes(d));
    }
  }
  if (decoys.length < 4) return { skip: "topic-scout: not enough unambiguous decoys" };

  const lead =
    variant === "story" ? `Today's story has ${aPhrase} in it!` :
    variant === "topic" ? `Today we are reading all about ${aPhrase}!` :
    `Today we are hunting for words that go together, like ${aPhrase}!`;
  const [t1, t2, t3, t4] = targets;
  const def = baseDef(l, {
    title: `${titleCase(world)} Catch`, recipe: variant === "story" ? "story-scout" : "topic-scout",
    mode: "rule", skin: "sky",
    playPrompt: `Catch what belongs ${inPhrase}!`,
    intro: {
      audio: audioPath(wid, "intro"),
      script: `${lead} Look at each word. If it belongs ${inPhrase}, catch it. If it does not belong, let it float away. Ready? Go!`,
      cardText,
    },
    waves: buildWaves(wid, targets, decoys, true),
    celebrate: {
      audio: audioPath(wid, "celebrate"),
      script: variant === "story"
        ? `You caught it! ${cap(t1)}, ${t2}, ${t3}, and ${t4}. All of them belong ${inPhrase}, and they are waiting in today's story. Let's go read it!`
        : `You caught them! ${cap(t1)}, ${t2}, ${t3}, and ${t4}. All of them belong ${inPhrase}, and today's lesson is full of them. Let's go!`,
    },
    celebrateZero: {
      audio: audioPath(wid, "celebrate-zero"),
      script: `Good warm up! Words like ${t1}, ${t2}, and ${t3} belong ${inPhrase}. Watch for them in today's lesson. You will spot them, I know it.`,
    },
  });
  return { def, forbiddenTargets: [...world.split(" ")], tap: true };
}

// ──────────────────────────────────────────────── mechanical judge ──
function judgeDef(c: Composed): string[] {
  const errs: string[] = [];
  const d = c.def;
  const tiles = d.waves.flatMap((w) => w.tiles);
  const targets = tiles.filter((t) => t.isMatch).map((t) => t.word);
  const decoys = tiles.filter((t) => !t.isMatch).map((t) => t.word);
  if (c.tap) {
    if (targets.length < 5) errs.push(`only ${targets.length} targets (need >=5)`);
    if (decoys.length < 4) errs.push(`only ${decoys.length} decoys (need >=4)`);
  }
  const all = [...targets, ...decoys, ...(d.builds ?? []).flatMap((b) => [b.word, ...b.parts]), ...(d.decoyParts ?? [])];
  for (const w of all) {
    if (w !== lc(w)) errs.push(`tile not lowercase: "${w}"`);
    if (w.length > 14) errs.push(`tile too long: "${w}"`);
  }
  const dupes = [...targets, ...decoys].filter((w, i, a) => a.indexOf(w) !== i);
  if (dupes.length) errs.push(`duplicate tiles: ${uniq(dupes).join(", ")}`);
  for (const f of c.forbiddenTargets) {
    if (targets.includes(f)) errs.push(`target equals rule anchor "${f}" (the cow bug)`);
  }
  if (d.mode === "builder") {
    const builds = d.builds ?? [];
    if (builds.length < 5) errs.push(`only ${builds.length} builds (need >=5)`);
    const bwords = new Set(builds.map((b) => b.word));
    if (bwords.size !== builds.length) errs.push("duplicate build words");
    for (const b of builds) {
      if (b.parts[0] + b.parts[1] !== b.word) errs.push(`parts do not join: ${b.parts.join("+")} != ${b.word}`);
      for (const p of b.parts) {
        if (!(inDict(p) || PREFIXES.includes(p) || SUFFIXES.includes(p))) errs.push(`part not real: "${p}"`);
      }
    }
    const parts = new Set(builds.flatMap((b) => b.parts));
    for (const dp of d.decoyParts ?? []) {
      if (parts.has(dp)) errs.push(`decoy part "${dp}" is a build part`);
      if (!inDict(dp)) errs.push(`decoy part not a real word: "${dp}"`);
      for (const p of parts) if (bwords.has(p + dp) || bwords.has(dp + p)) errs.push(`decoy "${dp}" completes a build`);
    }
    if ((d.decoyParts ?? []).length < 2) errs.push("need >=2 decoy parts");
  }
  // Customer-copy + TTS-safety rules on every script.
  const scripts = [d.intro.script, d.celebrate.script, d.celebrateZero?.script ?? "", d.playPrompt];
  for (const s of scripts) {
    if (/[—–]/.test(s)) errs.push(`em-dash in script: "${s.slice(0, 40)}..."`);
    if (/\bkids?\b/i.test(s)) errs.push(`"kid" in script`);
    if (/^(read this|build)/i.test(s.trim())) errs.push(`script starts with a TTS trap: "${s.slice(0, 24)}"`);
    if (/\bthe word\b/i.test(s)) errs.push(`"the word X" phrasing in script`);
    if (/\balways\b/i.test(s)) errs.push(`"always" aural trap in script`);
    if (/\p{Extended_Pictographic}/u.test(s)) errs.push("emoji in script");
  }
  return errs;
}

// ───────────────────────────────────────── def file (de)serialization ──
function defFilePath(lessonId: string) { return path.join(GEN_DIR, `${lessonId}-warmup.ts`); }

async function writeDefFile(l: LessonDef, plan: string, def: WarmupDef) {
  const body = JSON.stringify(def, null, 2);
  const src = `import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for ${l.id} (${l.standard}) by scripts/warmup-generate.ts.
// Recipe: ${plan}. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=${l.id} --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = ${body};
`;
  await fs.mkdir(GEN_DIR, { recursive: true });
  await fs.writeFile(defFilePath(l.id), src);
}

async function regenGenIndex() {
  const files = (await fs.readdir(GEN_DIR)).filter((f) => f.endsWith("-warmup.ts")).sort();
  const imports = files.map((f, i) => `import { warmupDef as w${i} } from "./${f.replace(/\.ts$/, "")}";`).join("\n");
  const entries = files.map((f, i) => `  "${f.replace(/\.ts$/, "")}": w${i},`).join("\n");
  const src = `// AUTO-GENERATED by scripts/warmup-generate.ts — do not edit by hand.
// Registers every generated warm-up def in gen/. Hand-built warm-ups live one
// directory up and always win on lessonId collisions (see ../index.ts).
import type { WarmupDef } from "@/lib/warmup-engine/types";
${imports ? imports + "\n" : ""}
export const GEN_WARMUPS: Record<string, WarmupDef> = {
${entries}
};
`;
  await fs.writeFile(path.join(GEN_DIR, "index.ts"), src);
}

async function loadExistingDef(lessonId: string): Promise<WarmupDef | null> {
  const p = defFilePath(lessonId);
  if (!fss.existsSync(p)) return null;
  try {
    const mod = await import(pathToFileURL(p).href);
    return mod.warmupDef as WarmupDef;
  } catch { return null; }
}

// ─────────────────────────────────────────────── whisper verification ──
type VerifyState = Record<string, { ok: boolean; model: string; transcript: string; attempts: number }>;

const NUM_WORDS: Record<string, string> = { "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten" };
/** ASR-equivalent words: a clip of "To!" transcribed as "Two!" is a correct
 *  recording, not drift. Each group maps to its first member. */
const HOMOPHONE_GROUPS = [
  ["to", "two", "too"], ["are", "r"], ["one", "won"], ["you", "u", "ewe"],
  ["the", "thee", "v", "da"], ["do", "due", "dew"], ["for", "four"], ["there", "their"],
  ["would", "wood"], ["be", "bee"], ["by", "buy", "bye"], ["know", "no"],
  ["our", "hour"], ["said", "sed"], ["see", "sea"], ["so", "sew"],
  ["here", "hear"], ["your", "yore"], ["they", "thay"],
];
const HOMOPHONE_CANON = new Map<string, string>();
for (const g of HOMOPHONE_GROUPS) for (const w of g) HOMOPHONE_CANON.set(w, g[0]);
function normText(s: string): string {
  return s.toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\b(\d{1,2})\b/g, (m) => NUM_WORDS[m] ?? m)
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => HOMOPHONE_CANON.get(w) ?? w)
    .join(" ");
}
function clipMatches(expect: string, transcript: string): boolean {
  const e = normText(expect), t = normText(transcript);
  if (e === t) return true;
  const es = e.replace(/ /g, ""), ts = t.replace(/ /g, "");
  if (es === ts) return true;
  if (e.split(" ").length <= 2) {
    // single-word call-outs: allow one character of ASR fuzz on longer words
    return es.length >= 5 && levenshtein(es, ts) <= 1;
  }
  const dist = levenshtein(es, ts);
  return dist / Math.max(es.length, ts.length) <= 0.1;
}

function whisperBatch(model: string, files: string[]): Record<string, string> {
  if (!files.length) return {};
  const tmp = fss.mkdtempSync(path.join(os.tmpdir(), "wver-"));
  const manifest = path.join(tmp, "m.json");
  fss.writeFileSync(manifest, JSON.stringify(files));
  const r = spawnSync("python3", [path.join(ROOT, "scripts/warmup-whisper.py"), model, manifest], {
    encoding: "utf-8", maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.log("   whisper failed:", (r.stderr ?? "").slice(-300));
    return {};
  }
  return JSON.parse(r.stdout || "{}");
}

function verifyPath(warmupId: string) { return path.join(AUDIO_ROOT, warmupId, ".verify.json"); }
function readVerify(warmupId: string): VerifyState {
  try { return JSON.parse(fss.readFileSync(verifyPath(warmupId), "utf-8")).clips ?? {}; } catch { return {}; }
}
async function writeVerify(warmupId: string, clips: VerifyState) {
  await fs.writeFile(verifyPath(warmupId), JSON.stringify({ clips, updatedAt: new Date().toISOString() }, null, 1));
}

/** Whisper-verify every clip of a warm-up. Genuine drift → re-record once;
 *  second failure → the clip is reported for dropping (never ship bad audio).
 *  Returns files that must lose their audio reference. */
async function verifyWarmupAudio(def: WarmupDef, stats: Stats): Promise<{ dropped: string[]; state: VerifyState }> {
  const dir = path.join(AUDIO_ROOT, def.id);
  const state = readVerify(def.id);
  const jobs = jobsForWarmup(def).filter((j) => fss.existsSync(path.join(dir, `${j.file}.mp3`)));
  const expects = new Map(jobs.map((j) => [path.join(dir, `${j.file}.mp3`), j.script]));

  let pending = jobs.filter((j) => !state[j.file]?.ok).map((j) => path.join(dir, `${j.file}.mp3`));
  for (let round = 0; round < 2 && pending.length; round++) {
    if (round === 1) {
      // Genuine drift: re-record once, then re-verify.
      console.log(`   re-recording ${pending.length} drifted clip(s)`);
      for (const f of pending) {
        const buf = await synthClip(expects.get(f)!);
        stats.rerecorded++;
        if (buf) await fs.writeFile(f, buf);
        await new Promise((r) => setTimeout(r, TTS_PACE_MS));
      }
    }
    const base = whisperBatch("base", pending);
    stats.whispered += pending.length;
    const misses: string[] = [];
    for (const f of pending) {
      const file = path.basename(f, ".mp3");
      const t = base[f] ?? "";
      if (clipMatches(expects.get(f)!, t)) state[file] = { ok: true, model: "base", transcript: t, attempts: round + 1 };
      else misses.push(f);
    }
    if (misses.length) {
      const small = whisperBatch("small", misses);
      stats.arbitrated += misses.length;
      pending = [];
      for (const f of misses) {
        const file = path.basename(f, ".mp3");
        const t = small[f] ?? "";
        if (clipMatches(expects.get(f)!, t)) state[file] = { ok: true, model: "small", transcript: t, attempts: round + 1 };
        else {
          state[file] = { ok: false, model: "small", transcript: t, attempts: round + 1 };
          pending.push(f);
        }
      }
      if (round === 0 && pending.length) stats.drift += pending.length;
    } else pending = [];
  }
  const dropped = pending.map((f) => path.basename(f, ".mp3"));
  await writeVerify(def.id, state);
  return { dropped, state };
}

/** Remove audio references for dropped clips (tile call-outs / build word
 *  clips / celebrateZero) and delete the bad files. Core clips (intro,
 *  celebrate) failing = the whole warm-up fails. */
async function applyDrops(def: WarmupDef, dropped: string[]): Promise<{ def: WarmupDef; fatal: boolean }> {
  let fatal = false;
  for (const file of dropped) {
    const p = path.join(AUDIO_ROOT, def.id, `${file}.mp3`);
    await fs.rm(p, { force: true });
    if (file === "intro" || file === "celebrate") { fatal = true; continue; }
    if (file === "celebrate-zero") { delete def.celebrateZero; continue; }
    for (const wave of def.waves) for (const t of wave.tiles) {
      if (t.audio && path.basename(t.audio, ".mp3") === file) delete t.audio;
    }
    if (def.builds) {
      // A build without its word clip is a broken moment — drop the build.
      def.builds = def.builds.filter((b) => path.basename(b.wordAudio, ".mp3") !== file);
      if (def.builds.length < 5) fatal = true;
    }
  }
  return { def, fatal };
}

// ──────────────────────────────────────────────────────── main loop ──
type Stats = { whispered: number; arbitrated: number; drift: number; rerecorded: number; droppedClips: number; recorded: number };
type Row = { lesson: string; grade: string; recipe: string; status: string; detail: string };

function planName(p: Plan): string {
  return "variant" in p ? `${p.kind}/${p.variant}` : p.kind;
}

async function compose(l: LessonDef, p: Plan): Promise<Composed | { skip: string }> {
  switch (p.kind) {
    case "sound-hunt": return composeSoundHunt(l);
    case "rhyme-rain": return composeRhymeRain(l);
    case "snap-dash": return composeSnapDash(l);
    case "family-blast": return composeFamilyBlast(l, p.variant);
    case "builder": return composeBuilder(l);
    case "topic-scout": return composeTopicScout(l, p.variant);
  }
}

function allClipsVerified(def: WarmupDef): boolean {
  const state = readVerify(def.id);
  return jobsForWarmup(def).every((j) =>
    state[j.file]?.ok && fss.existsSync(path.join(AUDIO_ROOT, def.id, `${j.file}.mp3`)));
}

async function main() {
  // Self-heal the gen registry first: prune entries whose def file vanished.
  await fs.mkdir(GEN_DIR, { recursive: true });
  await regenGenIndex();
  const rows: Row[] = [];
  const stats: Stats = { whispered: 0, arbitrated: 0, drift: 0, rerecorded: 0, droppedClips: 0, recorded: 0 };
  let lessons = Object.values(LESSONS).map((e) => e.lesson);
  if (ONE_LESSON) {
    lessons = lessons.filter((l) => l.id === ONE_LESSON);
    if (!lessons.length) { console.error(`Unknown lesson "${ONE_LESSON}"`); process.exit(1); }
  }
  let produced = 0;
  for (const l of lessons) {
    if (produced >= LIMIT) break;
    if (HAND_BUILT_LESSONS.has(l.id)) {
      if (ONE_LESSON) console.log(`skip ${l.id}: hand-built warm-up owns this lesson`);
      continue;
    }
    if (SKIP_EXISTING && fss.existsSync(defFilePath(l.id))) continue;

    const p = route(l);
    if ("skip" in p) {
      rows.push({ lesson: l.id, grade: l.grade, recipe: "-", status: "skipped", detail: p.skip });
      if (ONE_LESSON) console.log(`skip ${l.id}: ${p.skip}`);
      continue;
    }
    console.log(`\n▶ ${l.id} (${l.grade} · ${l.standard}) → ${planName(p)}`);

    // Resume path: existing def + fully verified audio = done.
    let def = FORCE ? null : await loadExistingDef(l.id);
    if (def && !DRY && allClipsVerified(def)) {
      rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: "complete", detail: "already generated + verified" });
      console.log("   complete (def + verified audio exist)");
      produced++;
      continue;
    }
    if (!def) {
      const c = await compose(l, p);
      if ("skip" in c) {
        rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: "skipped", detail: c.skip });
        console.log(`   skip: ${c.skip}`);
        continue;
      }
      const errs = judgeDef(c);
      if (errs.length) {
        rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: "rejected", detail: errs.join("; ") });
        console.log(`   REJECTED: ${errs.join("; ")}`);
        continue;
      }
      def = c.def;
      await writeDefFile(l, planName(p), def);
      await regenGenIndex();
      const tiles = def.waves.flatMap((w) => w.tiles);
      console.log(`   def written: ${tiles.filter((t) => t.isMatch).length} targets / ${tiles.filter((t) => !t.isMatch).length} decoys${def.builds ? ` / ${def.builds.length} builds` : ""}`);
    }

    if (!DRY) {
      const rec = await recordWarmup(def, { skipExisting: true });
      stats.recorded += rec.ok.length;
      if (rec.failed.length) {
        rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: "tts-failed", detail: rec.failed.join(",") });
        continue;
      }
      const { dropped } = await verifyWarmupAudio(def, stats);
      if (dropped.length) {
        stats.droppedClips += dropped.length;
        console.log(`   dropping unverifiable clip(s): ${dropped.join(", ")}`);
        const res = await applyDrops(def, dropped);
        if (res.fatal) {
          rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: "failed", detail: `core clip unverifiable: ${dropped.join(",")}` });
          await fs.rm(defFilePath(l.id), { force: true });
          await regenGenIndex();
          continue;
        }
        def = res.def;
        await writeDefFile(l, planName(p), def);
        await regenGenIndex();
      }
    }
    rows.push({ lesson: l.id, grade: l.grade, recipe: planName(p), status: DRY ? "composed" : "done", detail: "" });
    produced++;
  }

  console.log("\n──────── summary ────────");
  for (const r of rows) console.log(`${r.status.padEnd(10)} ${r.lesson.padEnd(26)} ${r.recipe.padEnd(22)} ${r.detail}`);
  console.log(`\nclips recorded=${stats.recorded} whisper-verified=${stats.whispered} arbitrated(small)=${stats.arbitrated} drift(re-recorded)=${stats.drift} dropped=${stats.droppedClips} gemini-calls=${geminiCalls}`);
}

// Only run the CLI when executed directly — the router is importable for
// census/tooling without side effects.
if (require.main === module) {
  if (!ONE_LESSON && !ALL) {
    console.error("Usage: npx tsx scripts/warmup-generate.ts --lesson=<id> | --all [--limit=N] [--skip-existing] [--force] [--dry]");
    process.exit(1);
  }
  main().catch((e) => { console.error(e); process.exit(1); });
}
