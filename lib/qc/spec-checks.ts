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

export function runLessonSpecChecks(lesson: {
  grade?: string | null;
  slides?: any[];
}): Array<CheckResult & { targetSubId: string | null }> {
  const out: Array<CheckResult & { targetSubId: string | null }> = [];
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];

  // Grade-conditional TTS-required check
  for (const r of checkLessonStepAudioForKG1(lesson)) {
    if (!r.ok) out.push({ ...r, targetSubId: null });
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

    // Per-step checks
    const steps = Array.isArray(slide.steps) ? slide.steps : [];
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
    }
  }
  return out;
}
