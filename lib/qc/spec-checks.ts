/**
 * Deterministic audit checks against docs/CONTENT_SPEC.md.
 *
 * Every rule in this file is a pure function over the asset's content.
 * No network, no LLM, no I/O. If a check fires, it's a hard structural
 * violation of the spec — never a subjective judgment. Soft / pedagogical
 * checks live in `qc-question-meta.ts` and `qc-lesson.ts` and use the
 * multi-judge committee.
 *
 * Why this exists: today's audit pass surfaced too many AI-judge false
 * positives because the judge had no shared definition of "right." This
 * file is the shared definition. When in doubt, encode the rule here
 * (deterministic) rather than ship a softer judge prompt.
 */
import { checkCanonDrift } from "./lesson-canon";
import { checkDeadSpace } from "./dead-space";
// Accept every grade-string format the DB uses (JSON banks use "1st",
// questions_db uses bare "1", lessons_db uses "Kindergarten"/"1st Grade").
// normalizeGrade in audit-sources.ts collapses these to the JSON form,
// but spec-checks may be called directly on DB rows that haven't been
// normalized — so this set accepts all variants.
const KG1_GRADES = new Set([
  "K", "Kindergarten", "0",
  "1", "1st", "1st Grade", "G1",
]);

export type CheckResult = {
  ok: boolean;
  /** Stable id matching the audit's finding_type. */
  findingType: string;
  message: string;
  severity: "fail" | "warn";
};

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F2FF}]/u;

const IMAGE_STYLE_SUFFIX =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors";
const IMAGE_NO_TEXT_CLAUSE = "No text, no words, no letters";

const VALID_QUESTION_TYPES = new Set([
  "multiple_choice",
  "missing_word",
  "sentence_build",
  "category_sort",
  "tap_to_pair",
  "sound_machine",
  "space_insertion",
]);

function normText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// ── Question checks ───────────────────────────────────────────────

export function checkMcqChoiceCount(q: {
  type: string;
  choices?: unknown;
  correct?: string;
}): CheckResult {
  if (q.type !== "multiple_choice") {
    return { ok: true, findingType: "spec.mcq_choice_count", message: "n/a", severity: "fail" };
  }
  const choices = Array.isArray(q.choices) ? (q.choices as string[]) : [];
  if (choices.length !== 4) {
    return {
      ok: false,
      findingType: "spec.mcq_choice_count",
      severity: "fail",
      message: `MCQ must have exactly 4 choices; found ${choices.length}.`,
    };
  }
  // Duplicate detection is exact-trim, case-preserving. Case-insensitive
  // dedupe would false-positive on K-G1 conventions questions (RF.1.1a,
  // L.1.2) where the WHOLE POINT is choices that look similar but differ
  // in capitalization/punctuation. Spec §2.2: "All 4 choices are unique."
  const trimmed = choices.map((c) => String(c).trim());
  const unique = new Set(trimmed);
  if (unique.size !== 4) {
    return {
      ok: false,
      findingType: "spec.mcq_choice_count",
      severity: "fail",
      message: "MCQ choices contain exact duplicates.",
    };
  }
  // correct must match a choice EXACTLY (after trim, case-preserving)
  // so the renderer's string equality lookup works.
  if (!q.correct || !trimmed.some((c) => c === String(q.correct).trim())) {
    return {
      ok: false,
      findingType: "spec.mcq_choice_count",
      severity: "fail",
      message: "MCQ correct answer does not match any choice byte-for-byte.",
    };
  }
  return { ok: true, findingType: "spec.mcq_choice_count", message: "ok", severity: "fail" };
}

export function checkQuestionTypeValid(q: { type: string }): CheckResult {
  if (!VALID_QUESTION_TYPES.has(q.type)) {
    return {
      ok: false,
      findingType: "spec.question_type_unknown",
      severity: "fail",
      message: `Unknown question type "${q.type}". Allowed: ${Array.from(VALID_QUESTION_TYPES).join(", ")}.`,
    };
  }
  return { ok: true, findingType: "spec.question_type_unknown", message: "ok", severity: "fail" };
}

export function checkTtsRequiredForQuestion(q: {
  grade?: string | null;
  audio_url?: string | null;
  type?: string;
}): CheckResult {
  const g = String(q.grade ?? "");
  if (!KG1_GRADES.has(g)) {
    return { ok: true, findingType: "spec.tts_required", message: "n/a", severity: "fail" };
  }
  if (!q.audio_url || String(q.audio_url).trim() === "") {
    return {
      ok: false,
      findingType: "spec.tts_required",
      severity: "fail",
      message: `K/G1 question is missing audio_url; TTS is required for K-1 (per CONTENT_SPEC §2.4).`,
    };
  }
  return { ok: true, findingType: "spec.tts_required", message: "ok", severity: "fail" };
}

// ── Image checks ──────────────────────────────────────────────────

export function checkImageStyleCompliance(imagePrompt: string | null | undefined): CheckResult {
  if (!imagePrompt || imagePrompt.trim() === "") {
    return { ok: true, findingType: "spec.image_style", message: "n/a", severity: "warn" };
  }
  const hasStyle = imagePrompt.includes(IMAGE_STYLE_SUFFIX);
  const hasNoText = imagePrompt.toLowerCase().includes(IMAGE_NO_TEXT_CLAUSE.toLowerCase());
  if (!hasStyle || !hasNoText) {
    const missing = [
      !hasStyle ? `"${IMAGE_STYLE_SUFFIX}"` : null,
      !hasNoText ? `"${IMAGE_NO_TEXT_CLAUSE}"` : null,
    ]
      .filter(Boolean)
      .join(" + ");
    return {
      ok: false,
      findingType: "spec.image_style",
      severity: "warn",
      message: `imagePrompt missing required style clause(s): ${missing}.`,
    };
  }
  return { ok: true, findingType: "spec.image_style", message: "ok", severity: "warn" };
}

// ── Emoji-leak check (applies to prompt, ttsScript, heading) ──────

export function checkNoEmojiLeak(text: string | null | undefined, field: string): CheckResult {
  if (!text) return { ok: true, findingType: "spec.emoji_leak", message: "n/a", severity: "warn" };
  if (EMOJI_RE.test(text)) {
    return {
      ok: false,
      findingType: "spec.emoji_leak",
      severity: "warn",
      message: `Emoji character leaked into ${field}. CONTENT_SPEC bans native emoji — use Lucide icons.`,
    };
  }
  return { ok: true, findingType: "spec.emoji_leak", message: "ok", severity: "warn" };
}

// ── Lesson-step checks ────────────────────────────────────────────

export function checkAnimationGhostWord(step: {
  ttsScript?: string;
  highlightWord?: { word?: string };
}): CheckResult {
  if (!step.highlightWord?.word) {
    return { ok: true, findingType: "spec.animation_ghost_word", message: "n/a", severity: "warn" };
  }
  const tts = normText(String(step.ttsScript ?? ""));
  const word = normText(String(step.highlightWord.word));
  if (!word) {
    return { ok: true, findingType: "spec.animation_ghost_word", message: "n/a", severity: "warn" };
  }
  // Word boundary match: the highlighted word must appear as a token
  // in the ttsScript so the animation lines up with something the kid
  // actually hears.
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`);
  if (!re.test(tts)) {
    return {
      ok: false,
      findingType: "spec.animation_ghost_word",
      severity: "warn",
      message: `highlightWord "${step.highlightWord.word}" does not appear in ttsScript. The kid sees a highlight on a word the TTS never says.`,
    };
  }
  return { ok: true, findingType: "spec.animation_ghost_word", message: "ok", severity: "warn" };
}

export function checkDisplayPartsSlice(step: {
  ttsScript?: string;
  displayParts?: Array<{ text?: string }>;
}): CheckResult {
  if (!Array.isArray(step.displayParts) || step.displayParts.length === 0) {
    return { ok: true, findingType: "spec.display_parts_drift", message: "n/a", severity: "warn" };
  }
  const tts = normText(String(step.ttsScript ?? ""));
  if (!tts) {
    return { ok: true, findingType: "spec.display_parts_drift", message: "n/a", severity: "warn" };
  }
  // Concatenated display text should be a substring (or close to) of the
  // ttsScript. We tolerate punctuation/whitespace drift via normalization.
  const concat = normText(step.displayParts.map((p) => String(p.text ?? "")).join(" "));
  if (!concat) {
    return { ok: true, findingType: "spec.display_parts_drift", message: "n/a", severity: "warn" };
  }
  // Token-level check: ≥80% of display tokens must appear in ttsScript.
  const ttsTokens = new Set(tts.split(" "));
  const dispTokens = concat.split(" ").filter(Boolean);
  if (dispTokens.length === 0) {
    return { ok: true, findingType: "spec.display_parts_drift", message: "n/a", severity: "warn" };
  }
  const hits = dispTokens.filter((t) => ttsTokens.has(t)).length;
  const ratio = hits / dispTokens.length;
  if (ratio < 0.8) {
    return {
      ok: false,
      findingType: "spec.display_parts_drift",
      severity: "warn",
      message: `Only ${Math.round(ratio * 100)}% of displayParts tokens appear in ttsScript. Reveals are drifting from what the TTS actually says.`,
    };
  }
  return { ok: true, findingType: "spec.display_parts_drift", message: "ok", severity: "warn" };
}

export function checkSubAudioUnique(slide: { steps?: Array<{ audioFile?: string }> }): CheckResult {
  if (!Array.isArray(slide.steps) || slide.steps.length <= 1) {
    return { ok: true, findingType: "spec.shared_step_audio", message: "n/a", severity: "fail" };
  }
  const files = slide.steps.map((s) => String(s.audioFile ?? ""));
  const unique = new Set(files.filter(Boolean));
  if (unique.size !== files.filter(Boolean).length) {
    return {
      ok: false,
      findingType: "spec.shared_step_audio",
      severity: "fail",
      message: `Slide has multiple sub-steps sharing the same audioFile. Renderer plays the audio anew on each sub-step → karaoke timing desyncs. Each sub-step needs its own audio file.`,
    };
  }
  return { ok: true, findingType: "spec.shared_step_audio", message: "ok", severity: "fail" };
}

export function checkLetterTextLength(step: {
  displayDiagram?: { letters?: Array<{ text?: string }> };
}): CheckResult {
  const letters = step.displayDiagram?.letters;
  if (!Array.isArray(letters) || letters.length === 0) {
    return { ok: true, findingType: "spec.long_letter_text", message: "n/a", severity: "warn" };
  }
  for (let i = 0; i < letters.length; i++) {
    const text = String(letters[i]?.text ?? "");
    // Single letter (1 char), digraph (2 chars), or trigraph (3 chars).
    // Longer means we packed a whole word into one "letter" slot.
    if (text.length > 3) {
      return {
        ok: false,
        findingType: "spec.long_letter_text",
        severity: "warn",
        message: `displayDiagram letter[${i}] is "${text}" (${text.length} chars). Must be ≤3 chars (letter / digraph / trigraph). Use displayParts for whole-word reveals.`,
      };
    }
  }
  return { ok: true, findingType: "spec.long_letter_text", message: "ok", severity: "warn" };
}

// ── Lesson-level checks ───────────────────────────────────────────

export function checkLessonStepAudioForKG1(lesson: {
  grade?: string | null;
  slides?: any[];
}): CheckResult[] {
  const g = String(lesson.grade ?? "");
  if (!KG1_GRADES.has(g)) return [];
  const out: CheckResult[] = [];
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
  for (let si = 0; si < slides.length; si++) {
    const s = slides[si];
    if (!s || s.type === "mcq") continue;
    const steps = Array.isArray(s.steps) ? s.steps : [];
    for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
      const step = steps[stepIdx];
      const sub = String(step?.sub ?? "?");
      if (!step?.audioFile || String(step.audioFile).trim() === "") {
        out.push({
          ok: false,
          findingType: "spec.tts_required",
          severity: "fail",
          message: `K/G1 lesson missing audioFile on slide ${si + 1} step ${sub}; TTS is required for K-1 per CONTENT_SPEC §1.6.`,
        });
      }
    }
  }
  return out;
}

// ── May 18 audit-driven checks ────────────────────────────────────
// Every check below was added because Filip's 5-lesson sample audit on
// /owner/lesson-timing-audit surfaced a class of slop that the existing
// judges weren't catching. The fixes for each issue go in
// LessonSlideshow.tsx + content rewrites; these checks make sure new
// content can't ship with the same issues.

/**
 * `slide.tableRow_empty` — a step has displayTableRow but missing
 * required label/value. Renderer would show nothing for that row,
 * silently degrading the chart.
 */
export function checkTableRowComplete(step: {
  displayTableRow?: { label?: unknown; value?: unknown } | null;
}): CheckResult {
  const t = step.displayTableRow;
  if (!t) return { ok: true, findingType: "slide.tableRow_empty", message: "", severity: "fail" };
  const label = typeof t.label === "string" ? t.label.trim() : "";
  const value = typeof t.value === "string" ? t.value.trim() : "";
  if (!label || !value) {
    return {
      ok: false,
      findingType: "slide.tableRow_empty",
      message: `displayTableRow missing required ${!label ? "label" : "value"}`,
      severity: "fail",
    };
  }
  return { ok: true, findingType: "slide.tableRow_empty", message: "", severity: "fail" };
}

/**
 * `slide.filler_step` — step has audio but contributes no anchor
 * content (no displayText, no displayParts, no displayTableRow, no
 * diagram, no alphabet grid). Almost always a filler "Listen…" /
 * "Let's see how!" beat that fragments attention without teaching.
 *
 * Exception: a step CAN be content-less if it's a deliberate
 * audio-only beat in a tableRow slide (the chart carries the visual).
 * We tolerate that by checking sibling steps in the same slide.
 */
export function checkFillerStep(step: {
  sub?: string;
  ttsScript?: string;
  displayText?: string;
  displayParts?: unknown[];
  displayTableRow?: unknown;
  displayDiagram?: unknown;
  displayDiagramSwap?: unknown;
  displayAlphabetGrid?: unknown;
  imageFile?: string;
}, slideHasTableRows: boolean): CheckResult {
  const hasAnchor =
    !!step.displayText ||
    (Array.isArray(step.displayParts) && step.displayParts.length > 0) ||
    !!step.displayTableRow ||
    !!step.displayDiagram ||
    !!step.displayDiagramSwap ||
    !!step.displayAlphabetGrid ||
    !!step.imageFile;
  if (hasAnchor) {
    return { ok: true, findingType: "slide.filler_step", message: "", severity: "warn" };
  }
  // Audio-only step is fine if slide has a chart that owns the visual
  if (slideHasTableRows) {
    return { ok: true, findingType: "slide.filler_step", message: "", severity: "warn" };
  }
  return {
    ok: false,
    findingType: "slide.filler_step",
    message: `step ${step.sub ?? "?"} has audio "${(step.ttsScript ?? "").slice(0, 60)}" but no visual anchor — kid sees nothing for this beat`,
    severity: "warn",
  };
}

/**
 * `slide.heading_redundancy` — displayText that just repeats the
 * slide heading verbatim (or near-verbatim). Filip flagged "A
 * Detective Trick" displayText on a slide titled "A Detective Trick"
 * as duplicating itself. Anchor should advance the concept, not echo.
 */
export function checkHeadingRedundancy(step: {
  sub?: string;
  displayText?: string;
}, slideHeading?: string): CheckResult {
  const text = (step.displayText ?? "").trim();
  const heading = (slideHeading ?? "").trim();
  if (!text || !heading) {
    return { ok: true, findingType: "slide.heading_redundancy", message: "", severity: "warn" };
  }
  const t = normText(text);
  const h = normText(heading);
  if (!t || !h) {
    return { ok: true, findingType: "slide.heading_redundancy", message: "", severity: "warn" };
  }
  if (t === h || t.includes(h) || h.includes(t)) {
    return {
      ok: false,
      findingType: "slide.heading_redundancy",
      message: `step ${step.sub ?? "?"} displayText "${text}" duplicates slide heading "${heading}"`,
      severity: "warn",
    };
  }
  return { ok: true, findingType: "slide.heading_redundancy", message: "", severity: "warn" };
}

/**
 * `slide.text_accumulation` — slide-level check. If a single slide
 * has a total of ≥7 displayParts chunks across all steps (or any
 * single step has ≥4 chunks fragmenting a sentence), it's the "throw
 * up of pills" pattern Filip flagged on RL.1.1 slide 1 (13 chunks)
 * and RF.2.3b slide 2 (14 chunks).
 */
export function checkTextAccumulation(slide: {
  slide?: number;
  steps?: Array<{ sub?: string; displayParts?: unknown[] }>;
}): CheckResult {
  const steps = Array.isArray(slide.steps) ? slide.steps : [];
  let total = 0;
  let worstSub: string | null = null;
  let worstCount = 0;
  for (const st of steps) {
    const n = Array.isArray(st.displayParts) ? st.displayParts.length : 0;
    total += n;
    if (n > worstCount) {
      worstCount = n;
      worstSub = String(st.sub ?? "?");
    }
  }
  if (worstCount >= 4) {
    return {
      ok: false,
      findingType: "slide.text_accumulation",
      message: `slide ${slide.slide ?? "?"} step ${worstSub} fragments into ${worstCount} displayParts — should be ≤3 beats per step`,
      severity: "warn",
    };
  }
  if (total >= 7) {
    return {
      ok: false,
      findingType: "slide.text_accumulation",
      message: `slide ${slide.slide ?? "?"} has ${total} displayParts chunks across ${steps.length} steps — too dense, kid sees wall of text`,
      severity: "warn",
    };
  }
  return { ok: true, findingType: "slide.text_accumulation", message: "", severity: "warn" };
}

/**
 * `step.tts_example_leak` — TTS script reads example values that are
 * also in a sibling step's displayTableRow.example. Filip flagged
 * L.4.4b S4b where audio reads "aquarium, aquatic, aqueduct" out
 * loud — those are visual table examples; audio shouldn't narrate
 * what the eye is supposed to do.
 */
export function checkTtsExampleLeak(step: {
  sub?: string;
  ttsScript?: string;
}, allExamples: string[]): CheckResult {
  const script = (step.ttsScript ?? "").toLowerCase();
  if (!script) {
    return { ok: true, findingType: "step.tts_example_leak", message: "", severity: "warn" };
  }
  const leaks = allExamples
    .map((ex) => ex.toLowerCase().split(/[,\s]+/).filter((w) => w.length > 3))
    .flat()
    .filter((w, i, a) => a.indexOf(w) === i);
  const hits = leaks.filter((w) => new RegExp(`\\b${w}\\b`).test(script));
  // Allow ≤1 leaked example word — the script can reference one as
  // a teaching anchor. ≥2 is reading the table aloud.
  if (hits.length >= 2) {
    return {
      ok: false,
      findingType: "step.tts_example_leak",
      message: `step ${step.sub ?? "?"} ttsScript reads table examples aloud: ${hits.slice(0, 4).join(", ")} — examples belong to the visual`,
      severity: "warn",
    };
  }
  return { ok: true, findingType: "step.tts_example_leak", message: "", severity: "warn" };
}

// ── Aggregator helpers used by audit-content.ts ───────────────────

export function runQuestionSpecChecks(q: {
  type: string;
  grade?: string | null;
  prompt?: string;
  choices?: unknown;
  correct?: string;
  audio_url?: string | null;
  image_url?: string | null;
}): CheckResult[] {
  const results: CheckResult[] = [];
  results.push(checkQuestionTypeValid(q));
  results.push(checkMcqChoiceCount(q));
  results.push(checkTtsRequiredForQuestion(q));
  results.push(checkNoEmojiLeak(q.prompt ?? null, "question.prompt"));
  return results.filter((r) => !r.ok);
}

// ── Canon architecture checks (2026-05-30) ─────────────────────────
// The golden rule from the canon scrub: the on-screen text ANCHORS the
// audio, it never transcribes it. These flag the non-canon catalog's
// core disease — full sentences dumped in pills, multiple concepts
// crammed into one pill, and verbose Q→A. See reference_lesson_architecture.

function toks(s: string): string[] {
  return normText(s).split(" ").filter(Boolean);
}
/** Word count that keeps contractions intact ("What's" = 1 word). */
function wcount(s: string): number {
  return String(s).toLowerCase().replace(/[^a-z0-9' ]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}
function overlapRatio(a: string[], b: string[]): number {
  if (!a.length) return 0;
  const bs = new Set(b);
  return a.filter((t) => bs.has(t)).length / a.length;
}

/**
 * Flags an on-screen pill that transcribes its TTS sentence instead of
 * anchoring it: ≥6 words, ≥80% token overlap with the ttsScript, AND
 * ≥60% as long as the audio (so a short anchor PHRASE pulled from a long
 * sentence — canon — is NOT flagged, but the whole sentence on screen
 * IS). Example-slide passages (the intended 2-sentence anchor) are
 * exempt; their Q→A parts are covered by checkQaTerseness.
 */
export function checkTranscriptPill(
  step: { ttsScript?: string; displayText?: string; displayParts?: Array<{ text?: string }> },
  slideType: string,
): CheckResult {
  const na = { ok: true, findingType: "slide.text_is_transcript", message: "n/a", severity: "warn" as const };
  const ttsToks = toks(step?.ttsScript ?? "");
  if (ttsToks.length < 6) return na;

  const chunks: string[] = [];
  if (typeof step?.displayText === "string" && step.displayText.trim() && slideType !== "example") {
    chunks.push(step.displayText);
  }
  const dp = step?.displayParts;
  const isQA =
    Array.isArray(dp) && dp.length === 2 &&
    typeof dp[0]?.text === "string" && dp[0].text.trim().endsWith("?");
  if (Array.isArray(dp) && !isQA) {
    // The slide shows the parts together, so judge them combined.
    chunks.push(dp.map((p) => p?.text ?? "").join(" "));
  }

  for (const c of chunks) {
    // Structured anchors (arrow mappings / equations like "rain → A",
    // "un + happy = unhappy") are canon, not prose — skip them.
    if (/[→=+]/.test(c)) continue;
    const ct = toks(c);
    if (
      ct.length >= 6 &&
      overlapRatio(ct, ttsToks) >= 0.8 &&
      ct.length >= 0.6 * ttsToks.length
    ) {
      return {
        ok: false,
        findingType: "slide.text_is_transcript",
        severity: "warn",
        message: `On-screen pill transcribes the audio (${ct.length} words): "${c.trim().slice(0, 60)}". Anchor it — show the one idea, not the sentence.`,
      };
    }
  }
  return { ok: true, findingType: "slide.text_is_transcript", message: "ok", severity: "warn" };
}

/**
 * Flags a single pill that crams ≥3 comma-separated concepts (e.g.
 * "Characters, setting, and events" / "the who, where, and what").
 * Canon shows one idea per pill. Example passages are exempt (narrative,
 * not a concept list).
 */
export function checkCrammedPill(
  step: { displayText?: string; displayParts?: Array<{ text?: string }> },
  slideType: string,
): CheckResult {
  const chunks: string[] = [];
  if (typeof step?.displayText === "string" && slideType !== "example") chunks.push(step.displayText);
  for (const p of step?.displayParts ?? []) if (typeof p?.text === "string") chunks.push(p.text);

  for (const c of chunks) {
    const commas = (c.match(/,/g) ?? []).length;
    if (commas >= 2) {
      return {
        ok: false,
        findingType: "slide.crammed_pill",
        severity: "warn",
        message: `One pill lists ${commas + 1} concepts: "${c.trim().slice(0, 60)}". Split into separate pills — one idea each.`,
      };
    }
  }
  return { ok: true, findingType: "slide.crammed_pill", message: "ok", severity: "warn" };
}

/**
 * Flags verbose Q→A on a worked-example pair: the question must be ≤3
 * words and the answer ≤4 words (canon: "Who?" → "Bella!"). A sentence
 * answer like "Rolled his toy car down the slide." is what makes a slide
 * feel like "too much going on".
 */
export function checkQaTerseness(step: { displayParts?: Array<{ text?: string }> }): CheckResult {
  const na = { ok: true, findingType: "slide.qa_not_terse", message: "n/a", severity: "warn" as const };
  const dp = step?.displayParts;
  if (!Array.isArray(dp) || dp.length !== 2) return na;
  if (!(typeof dp[0]?.text === "string" && dp[0].text.trim().endsWith("?"))) return na;
  // Caps bracket canon exactly: longest canon question is "What does it
  // mean?" (4), longest answer is "Played with a red ball!" (5).
  const qw = wcount(dp[0].text);
  const aw = wcount(String(dp[1]?.text ?? ""));
  if (qw > 4) {
    return { ok: false, findingType: "slide.qa_not_terse", severity: "warn", message: `Question "${dp[0].text.trim()}" is ${qw} words (max 4) — terse anchor like "Who?".` };
  }
  if (aw > 5) {
    return { ok: false, findingType: "slide.qa_not_terse", severity: "warn", message: `Answer "${String(dp[1]?.text).trim()}" is ${aw} words (max 5) — terse anchor like "Bella!".` };
  }
  return { ok: true, findingType: "slide.qa_not_terse", message: "ok", severity: "warn" };
}

export function runLessonSpecChecks(lesson: {
  standardId?: string | null;
  grade?: string | null;
  slides?: any[];
}): Array<CheckResult & { targetSubId: string | null }> {
  const out: Array<CheckResult & { targetSubId: string | null }> = [];
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];

  // Grade-conditional TTS-required check
  for (const r of checkLessonStepAudioForKG1(lesson)) {
    if (!r.ok) out.push({ ...r, targetSubId: null });
  }

  // Canon drift — slide-sequence + per-slide structural rules
  // matched against the 5 reference lessons (RL.K.1 et al). Canon
  // lessons themselves are skipped inside checkCanonDrift.
  for (const r of checkCanonDrift(lesson)) {
    if (!r.ok) out.push(r);
  }

  // Dead-space estimator — flag slides where mobile or desktop
  // content uses < 60% of available vertical space (50% for intro /
  // practice-intro which are lighter by design).
  for (const r of checkDeadSpace(lesson)) {
    if (!r.ok) out.push(r);
  }

  for (let si = 0; si < slides.length; si++) {
    const slide = slides[si];
    if (!slide || slide.type === "mcq") continue;

    // Shared-audio-across-sub-steps check
    const slideR = checkSubAudioUnique(slide);
    if (!slideR.ok) out.push({ ...slideR, targetSubId: `slide-${si + 1}` });

    // Image style on the slide
    if (slide.imagePrompt) {
      const imgR = checkImageStyleCompliance(slide.imagePrompt);
      if (!imgR.ok) out.push({ ...imgR, targetSubId: `slide-${si + 1}` });
    }

    // Slide-level: text accumulation (May 18 audit)
    const accR = checkTextAccumulation(slide);
    if (!accR.ok) out.push({ ...accR, targetSubId: `slide-${si + 1}` });

    const steps = Array.isArray(slide.steps) ? slide.steps : [];
    const slideHasTableRows = steps.some((s: any) => s?.displayTableRow);

    // Collect all table examples on this slide so we can flag tts
    // scripts that read them aloud (step.tts_example_leak).
    const allExamples: string[] = steps
      .map((s: any) => s?.displayTableRow?.example)
      .filter((e: any): e is string => typeof e === "string" && !!e);

    // Per-step checks
    for (const step of steps) {
      const sub = String(step?.sub ?? "?");
      const subId = `S${si + 1}${sub}`;

      const r1 = checkAnimationGhostWord(step);
      if (!r1.ok) out.push({ ...r1, targetSubId: subId });

      const r2 = checkDisplayPartsSlice(step);
      if (!r2.ok) out.push({ ...r2, targetSubId: subId });

      const r3 = checkLetterTextLength(step);
      if (!r3.ok) out.push({ ...r3, targetSubId: subId });

      const r4 = checkNoEmojiLeak(step?.ttsScript ?? null, `step.${subId}.ttsScript`);
      if (!r4.ok) out.push({ ...r4, targetSubId: subId });

      // May 18 audit-driven checks
      const r5 = checkTableRowComplete(step);
      if (!r5.ok) out.push({ ...r5, targetSubId: subId });

      const r6 = checkFillerStep(step, slideHasTableRows);
      if (!r6.ok) out.push({ ...r6, targetSubId: subId });

      const r7 = checkHeadingRedundancy(step, slide?.heading);
      if (!r7.ok) out.push({ ...r7, targetSubId: subId });

      if (allExamples.length > 0) {
        const r8 = checkTtsExampleLeak(step, allExamples);
        if (!r8.ok) out.push({ ...r8, targetSubId: subId });
      }

      // Canon architecture (anchor, not transcript)
      const r9 = checkTranscriptPill(step, slide?.type);
      if (!r9.ok) out.push({ ...r9, targetSubId: subId });

      const r10 = checkCrammedPill(step, slide?.type);
      if (!r10.ok) out.push({ ...r10, targetSubId: subId });

      const r11 = checkQaTerseness(step);
      if (!r11.ok) out.push({ ...r11, targetSubId: subId });
    }
  }
  return out;
}
