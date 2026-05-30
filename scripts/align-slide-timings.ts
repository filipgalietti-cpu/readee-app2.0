/**
 * Lesson timing aligner. Reads Whisper word-timestamps from
 * scripts/slide-timings.json and bakes real audio-derived delays into
 * app/data/sample-lessons.json — replacing the syllable-count heuristic
 * that was running 1-3.5s early on highlight words.
 *
 *   npx tsx scripts/align-slide-timings.ts                    # dry-run all
 *   npx tsx scripts/align-slide-timings.ts --standard=RF.2.3b # dry-run one
 *   npx tsx scripts/align-slide-timings.ts --apply            # write JSON
 *   npx tsx scripts/align-slide-timings.ts --grade=2nd --apply
 *
 * Grade-conditional pre-roll on highlight reveals (visual leads audio):
 *   K −150ms · 1st −120ms · 2nd −100ms · 3rd −60ms · 4th −40ms
 *
 * Aligns: displayParts[].delay · highlightWord.delay ·
 * displayTableRow.exampleDelay · highlightPills[].delay (synced to
 * displayParts). Leaves displayDelay, checkmarkDelay, afterPhonemes
 * untouched — those are authored, not audio-derived.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE_LESSONS = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const TIMINGS_CACHE = path.resolve(process.cwd(), "scripts/slide-timings.json");

type WordTiming = { word: string; start: number; end: number };
type Cache = Record<string, { duration: number; words: WordTiming[] }>;

const PRE_ROLL_MS: Record<string, number> = {
  Kindergarten: 150,
  "1st Grade": 120,
  "2nd Grade": 100,
  "3rd Grade": 60,
  "4th Grade": 40,
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9']/g, "");
}

function tokenizeText(s: string): string[] {
  return s.split(/[^A-Za-z0-9']+/).map(normalize).filter(Boolean);
}

/**
 * Find a target word in Whisper output at-or-after the cursor.
 * Allows prefix matching in both directions because Whisper often
 * splits digraphs ("EA" → "E"+"-A", "EE" → "E"+"2"). Without prefix
 * tolerance, ~30% of teach-slide alignments fail.
 */
function findWordStart(
  words: WordTiming[],
  target: string,
  cursor: number,
): { startMs: number; nextCursor: number } | null {
  const t = normalize(target);
  if (!t) return null;
  for (let i = cursor; i < words.length; i++) {
    const w = normalize(words[i].word);
    if (!w) continue;
    if (w === t || w.startsWith(t) || t.startsWith(w)) {
      return { startMs: Math.round(words[i].start * 1000), nextCursor: i + 1 };
    }
  }
  return null;
}

type StepResult = { changes: string[]; warnings: string[] };

/**
 * Q&A post-roll for example slides — delay between the answer being
 * spoken and the answer text appearing on screen. Gives the kid a
 * beat to think after hearing the question before the answer is
 * visually confirmed. Without this, "Who is the story about? Bella!"
 * shows "Bella!" text exactly when audio says "Bella" — Filip's
 * complaint: "the answers are just presented before the question
 * has a chance to be answered by the kid." This is the simplest
 * cheap fix; the full "kid clicks to reveal" interaction is a bigger
 * design change.
 */
const QA_ANSWER_POSTROLL_MS = 700;

function alignStep(step: any, words: WordTiming[], preRollMs: number, slideType?: string): StepResult {
  const changes: string[] = [];
  const warnings: string[] = [];

  // Detect a Q&A pair (displayParts of length 2 where the first
  // part ends with "?"). Applies post-roll on the answer reveal.
  const isQAPair =
    Array.isArray(step.displayParts) &&
    step.displayParts.length === 2 &&
    typeof step.displayParts[0]?.text === "string" &&
    step.displayParts[0].text.trim().endsWith("?");
  const isExampleSlide = slideType === "example";

  // ── displayParts ──────────────────────────────────────────────
  // Walk parts in order. Part 0 stays at 0 (initial display).
  // Each subsequent part's delay = wordStart of its first token.
  // For Q&A answers on example slides, add a post-roll so the kid
  // has time to think (see QA_ANSWER_POSTROLL_MS above).
  if (Array.isArray(step.displayParts) && step.displayParts.length > 1) {
    let cursor = 0;
    for (let i = 0; i < step.displayParts.length; i++) {
      const part = step.displayParts[i];
      const tokens = tokenizeText(part.text || "");
      if (i === 0) {
        if (part.delay !== 0) {
          changes.push(`displayParts[0].delay: ${part.delay} → 0`);
          part.delay = 0;
        }
        // Advance cursor past this part's tokens
        for (const tok of tokens) {
          const hit = findWordStart(words, tok, cursor);
          if (hit) cursor = hit.nextCursor;
        }
        continue;
      }
      if (tokens.length === 0) {
        warnings.push(`displayParts[${i}]: empty text "${part.text}"`);
        continue;
      }
      const hit = findWordStart(words, tokens[0], cursor);
      if (!hit) {
        warnings.push(
          `displayParts[${i}]: couldn't locate "${tokens[0]}" in audio`,
        );
        continue;
      }
      const oldDelay = part.delay;
      const isQAAnswerPart = isQAPair && isExampleSlide && i === 1;
      const postRoll = isQAAnswerPart ? QA_ANSWER_POSTROLL_MS : 0;
      part.delay = hit.startMs + postRoll;
      cursor = hit.nextCursor;
      // Advance cursor past remaining tokens in this part
      for (let j = 1; j < tokens.length; j++) {
        const h = findWordStart(words, tokens[j], cursor);
        if (h) cursor = h.nextCursor;
      }
      if (oldDelay !== part.delay) {
        const drift = oldDelay - part.delay;
        const postRollNote = postRoll > 0 ? ` + ${postRoll}ms Q&A post-roll` : "";
        changes.push(
          `displayParts[${i}]: ${oldDelay} → ${part.delay} (was ${drift > 0 ? "+" : ""}${drift}ms off · "${part.text.trim()}"${postRollNote})`,
        );
      }
    }
  }

  // ── highlightPills (synced to displayParts) ──────────────────
  // Same 1:1 pairing as displayParts. Re-apply delays after parts
  // moved so pill animations stay glued to visible text.
  if (Array.isArray(step.highlightPills) && Array.isArray(step.displayParts)) {
    for (const pill of step.highlightPills) {
      const idx = pill.pill;
      if (typeof idx !== "number") continue;
      const part = step.displayParts[idx];
      if (!part) continue;
      if (pill.delay !== part.delay) {
        const oldDelay = pill.delay;
        pill.delay = part.delay;
        changes.push(
          `highlightPills[pill=${idx}].delay: ${oldDelay} → ${part.delay} (sync)`,
        );
      }
    }
  }

  // ── highlightWord ────────────────────────────────────────────
  // Reveal beats audio onset by preRollMs (grade-conditional).
  if (step.highlightWord?.word) {
    const tok = normalize(step.highlightWord.word.split(/\s+/)[0]);
    const hit = findWordStart(words, tok, 0);
    if (!hit) {
      warnings.push(
        `highlightWord: couldn't locate "${step.highlightWord.word}" in audio`,
      );
    } else {
      const newDelay = Math.max(0, hit.startMs - preRollMs);
      if (step.highlightWord.delay !== newDelay) {
        const oldDelay = step.highlightWord.delay;
        step.highlightWord.delay = newDelay;
        changes.push(
          `highlightWord.delay: ${oldDelay} → ${newDelay} ("${step.highlightWord.word}", pre-roll −${preRollMs}ms)`,
        );
      }
    }
  }

  // ── displayTableRow.exampleDelay ─────────────────────────────
  if (
    step.displayTableRow?.example &&
    step.displayTableRow.exampleDelay !== undefined
  ) {
    const tok = normalize(step.displayTableRow.example.split(/[\s,]+/)[0]);
    const hit = findWordStart(words, tok, 0);
    if (!hit) {
      warnings.push(
        `displayTableRow.example "${step.displayTableRow.example}": not found in audio`,
      );
    } else {
      if (step.displayTableRow.exampleDelay !== hit.startMs) {
        const oldDelay = step.displayTableRow.exampleDelay;
        step.displayTableRow.exampleDelay = hit.startMs;
        changes.push(
          `displayTableRow.exampleDelay: ${oldDelay} → ${hit.startMs}`,
        );
      }
    }
  }

  return { changes, warnings };
}

async function main() {
  const args = new Map(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.split("=");
      return [k.replace(/^--/, ""), v ?? "true"];
    }),
  );
  const targetStandard = args.get("standard");
  const targetGrade = args.get("grade"); // "2nd" / "K" / etc. (loose match)
  const apply = args.get("apply") === "true";

  const cache: Cache = JSON.parse(await fs.readFile(TIMINGS_CACHE, "utf-8"));
  const lessons = JSON.parse(await fs.readFile(SAMPLE_LESSONS, "utf-8")) as any[];

  let totalChanges = 0;
  let totalWarnings = 0;
  let lessonsTouched = 0;
  let lessonsScanned = 0;

  for (const lesson of lessons) {
    if (targetStandard && lesson.standardId !== targetStandard) continue;
    if (
      targetGrade &&
      !String(lesson.grade ?? "").toLowerCase().includes(targetGrade.toLowerCase())
    ) {
      continue;
    }
    const grade = lesson.grade as string;
    const preRoll = PRE_ROLL_MS[grade];
    if (preRoll === undefined) {
      console.warn(`⚠ unknown grade "${grade}" on ${lesson.standardId}, skipping`);
      continue;
    }
    lessonsScanned++;

    const lessonChanges: string[] = [];
    const lessonWarnings: string[] = [];

    for (const slide of lesson.slides ?? []) {
      if (slide.type === "mcq") continue;
      for (const step of slide.steps ?? []) {
        if (!step.audioFile) continue;
        const entry = cache[step.audioFile];
        if (!entry || !entry.words) {
          lessonWarnings.push(
            `slide ${slide.slide}.${step.sub ?? "?"} → no Whisper data for ${step.audioFile}`,
          );
          continue;
        }
        const { changes, warnings } = alignStep(step, entry.words, preRoll, slide.type);
        for (const c of changes)
          lessonChanges.push(`slide ${slide.slide}.${step.sub ?? "?"} · ${c}`);
        for (const w of warnings)
          lessonWarnings.push(`slide ${slide.slide}.${step.sub ?? "?"} · ${w}`);
      }
    }

    if (lessonChanges.length || lessonWarnings.length) {
      lessonsTouched++;
      console.log(
        `\n=== ${lesson.standardId} · ${lesson.title} (${grade}, pre-roll −${preRoll}ms) ===`,
      );
      for (const c of lessonChanges) console.log(`  ✎ ${c}`);
      for (const w of lessonWarnings) console.log(`  ⚠ ${w}`);
      totalChanges += lessonChanges.length;
      totalWarnings += lessonWarnings.length;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`Scanned ${lessonsScanned} lessons`);
  console.log(`${lessonsTouched} lessons with changes/warnings`);
  console.log(`${totalChanges} timing rewrites · ${totalWarnings} warnings`);

  if (apply) {
    await fs.writeFile(SAMPLE_LESSONS, JSON.stringify(lessons, null, 2));
    console.log(`✓ Wrote ${SAMPLE_LESSONS}`);
  } else {
    console.log(`(dry-run — pass --apply to write)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
