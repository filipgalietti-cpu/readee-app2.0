/**
 * Content audit orchestrator. Runs structural + LLM-judge QC across
 * the live question banks and the lesson catalog, persists every
 * finding to content_audit_findings, and logs the run summary.
 *
 * Usage:
 *   npx tsx scripts/audit-content.ts                      # full sweep
 *   npx tsx scripts/audit-content.ts --kind=question      # questions only
 *   npx tsx scripts/audit-content.ts --kind=lesson        # lessons only
 *   npx tsx scripts/audit-content.ts --limit=10           # smoke test
 *   npx tsx scripts/audit-content.ts --grade=K            # only K
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { supabaseAdmin } from "../lib/supabase/admin";
import { containsBannedWord } from "../lib/ai/qc";
import {
  judgeShouldBeAsked,
  judgeBetterFormat,
} from "../lib/ai/qc-question-meta";
import {
  checkLessonStructure,
  checkLessonRichness,
  judgeLessonSlide,
} from "../lib/ai/qc-lesson";
import { generateFixSuggestion } from "../lib/ai/qc-suggestion";
import { judgeAudioFile, judgeImageQuality } from "../lib/ai/qc-media";

import kJson from "../app/data/kindergarten-standards-questions.json";
import g1Json from "../app/data/1st-grade-standards-questions.json";
import g2Json from "../app/data/2nd-grade-standards-questions.json";
import g3Json from "../app/data/3rd-grade-standards-questions.json";
import g4Json from "../app/data/4th-grade-standards-questions.json";
import sampleLessons from "../app/data/sample-lessons.json";

const GRADE_BANKS: { grade: string; bank: any }[] = [
  { grade: "K", bank: kJson },
  { grade: "1st", bank: g1Json },
  { grade: "2nd", bank: g2Json },
  { grade: "3rd", bank: g3Json },
  { grade: "4th", bank: g4Json },
];

type Args = {
  kind: "all" | "question" | "lesson";
  limit: number | null;
  grade: string | null;
  withMedia: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = { kind: "all", limit: null, grade: null, withMedia: false };
  for (const a of argv) {
    if (a.startsWith("--kind=")) {
      const v = a.slice("--kind=".length);
      if (v === "all" || v === "question" || v === "lesson") out.kind = v;
    } else if (a.startsWith("--limit=")) {
      const n = parseInt(a.slice("--limit=".length), 10);
      if (!Number.isNaN(n) && n > 0) out.limit = n;
    } else if (a.startsWith("--grade=")) {
      out.grade = a.slice("--grade=".length);
    } else if (a === "--with-media") {
      out.withMedia = true;
    }
  }
  return out;
}

/**
 * Stable hash of the canonical asset payload. The audit pass
 * stamps this on every finding so the next run can short-circuit
 * judges when the asset hasn't changed.
 *
 * Hash inputs are intentionally minimal — including timestamps or
 * URL query strings would defeat the cache. We hash only the
 * fields that semantically define the asset:
 *   image:      image_url + prompt
 *   audio:      audio_url + (ttsScript or prompt+choices)
 *   step audio: audio_url + ttsScript
 *   q text:     prompt + choices.join("|") + correct
 */
function assetContentHash(
  findingType: string,
  snapshot: any,
): string | null {
  if (!snapshot) return null;
  const norm = (v: unknown) => String(v ?? "").trim();
  let key: string | null = null;
  if (findingType === "q.image_quality") {
    key = `IMG\x1f${norm(snapshot.image_url)}\x1f${norm(snapshot.prompt)}`;
  } else if (findingType === "q.audio_quality") {
    const choices = Array.isArray(snapshot.choices)
      ? (snapshot.choices as unknown[]).map(norm).join("|")
      : "";
    key = `AUD\x1f${norm(snapshot.audio_url)}\x1f${norm(snapshot.prompt)}\x1f${choices}`;
  } else if (findingType === "step.audio_quality") {
    key = `STP\x1f${norm(snapshot.audio_url)}\x1f${norm(snapshot.ttsScript)}`;
  } else if (
    findingType === "q.should_be_asked" ||
    findingType === "q.no_self_leak" ||
    findingType === "q.unique_choices" ||
    findingType === "q.better_format"
  ) {
    const choices = Array.isArray(snapshot.choices)
      ? (snapshot.choices as unknown[]).map(norm).join("|")
      : "";
    key = `QTX\x1f${norm(snapshot.prompt)}\x1f${choices}\x1f${norm(snapshot.correct)}`;
  } else if (findingType === "slide.judge") {
    const stepHash = (snapshot.steps ?? [])
      .map((s: any) => `${norm(s.sub)}:${norm(s.ttsScript)}:${norm(s.displayText)}`)
      .join("\n");
    key = `SLD\x1f${norm(snapshot.heading)}\x1f${stepHash}`;
  }
  if (!key) return null;
  // SHA-256, hex; tsx runs on Node so crypto is available.
  // Imported via require to avoid a top-of-file rewrite.
  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Returns true if there is a recent pass finding with the same
 * (target_kind, target_id, finding_type, content_hash) — meaning
 * the asset hasn't changed since the last successful judge call.
 *
 * Caller skips the expensive judge in that case and writes a
 * lightweight pass row pointing at the same hash so the chain stays
 * unbroken.
 */
async function isAlreadyBlessed(input: {
  targetKind: string;
  targetId: string;
  findingType: string;
  contentHash: string;
  freshDays?: number;
}): Promise<boolean> {
  const supabase = supabaseAdmin();
  const cutoff = new Date(
    Date.now() - (input.freshDays ?? 30) * 86_400_000,
  ).toISOString();
  const { data } = await supabase
    .from("content_audit_findings")
    .select("id")
    .eq("target_kind", input.targetKind)
    .eq("target_id", input.targetId)
    .eq("finding_type", input.findingType)
    .eq("content_hash", input.contentHash)
    .eq("severity", "pass")
    .gte("created_at", cutoff)
    .limit(1);
  return !!data && data.length > 0;
}

async function upsertFinding(input: {
  runId: string;
  targetKind: "lesson" | "question" | "lesson_slide";
  targetId: string;
  grade: string | null;
  findingType: string;
  severity: "pass" | "warn" | "fail";
  message: string;
  suggestion?: string | null;
  targetSnapshot?: any;
}): Promise<void> {
  const supabase = supabaseAdmin();

  // Auto-generate a fix suggestion for warn/fail when one wasn't
  // supplied. ~$0.001 per finding. Pass-level findings get no
  // suggestion (nothing to fix).
  let finalSuggestion = input.suggestion ?? null;
  if (
    !finalSuggestion &&
    (input.severity === "fail" || input.severity === "warn")
  ) {
    try {
      const sug = await generateFixSuggestion({
        targetKind: input.targetKind,
        targetId: input.targetId,
        findingType: input.findingType,
        severity: input.severity,
        message: input.message,
        snapshot: input.targetSnapshot ?? null,
      });
      if (sug.ok) finalSuggestion = sug.suggestion;
    } catch {
      // Non-blocking — finding still upserts without a suggestion.
    }
  }

  // ON CONFLICT (target_kind, target_id, finding_type) — upsert so
  // re-running the audit refreshes the message + severity instead of
  // duplicating.
  const contentHash = assetContentHash(input.findingType, input.targetSnapshot);
  await supabase.from("content_audit_findings").upsert(
    {
      target_kind: input.targetKind,
      target_id: input.targetId,
      grade: input.grade,
      finding_type: input.findingType,
      severity: input.severity,
      message: input.message,
      suggestion: finalSuggestion,
      target_snapshot: input.targetSnapshot ?? null,
      audit_run_id: input.runId,
      content_hash: contentHash,
      status: input.severity === "pass" ? "fixed" : "open",
    },
    { onConflict: "target_kind,target_id,finding_type" },
  );
}

async function startRun(scope: string): Promise<string> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("content_audit_runs")
    .insert({ scope, status: "running" })
    .select("id")
    .single();
  if (error || !data) throw new Error("Could not start audit run.");
  return (data as { id: string }).id;
}

async function finishRun(input: {
  runId: string;
  questionsScanned: number;
  lessonsScanned: number;
  pass: number;
  warn: number;
  fail: number;
  status: "completed" | "failed" | "aborted";
  error?: string | null;
}): Promise<void> {
  const supabase = supabaseAdmin();
  await supabase
    .from("content_audit_runs")
    .update({
      questions_scanned: input.questionsScanned,
      lessons_scanned: input.lessonsScanned,
      findings_pass: input.pass,
      findings_warn: input.warn,
      findings_fail: input.fail,
      status: input.status,
      error: input.error ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.runId);
}

async function auditQuestions(input: {
  runId: string;
  limit: number | null;
  grade: string | null;
  withMedia: boolean;
}): Promise<{
  scanned: number;
  pass: number;
  warn: number;
  fail: number;
}> {
  let scanned = 0;
  let pass = 0;
  let warn = 0;
  let fail = 0;

  outer: for (const { grade, bank } of GRADE_BANKS) {
    if (input.grade && input.grade !== grade) continue;
    const standards = (bank.standards ?? []) as any[];

    for (const std of standards) {
      const standardId = std.standard_id as string;
      const standardDescription = std.standard_description as string;

      for (const q of std.questions ?? []) {
        if (input.limit && scanned >= input.limit) break outer;
        if (!q.choices || !q.correct) continue; // skip non-MCQ types
        scanned++;

        const targetId = String(q.id ?? `${standardId}-?`);
        const promptText = String(q.prompt ?? "");
        const snapshot = {
          id: q.id,
          standardId,
          standardDescription,
          prompt: q.prompt,
          choices: q.choices,
          correct: q.correct,
          hint: q.hint ?? null,
        };

        // Deterministic checks
        const banned = containsBannedWord(promptText);
        if (banned) {
          fail++;
          await upsertFinding({
            runId: input.runId,
            targetKind: "question",
            targetId,
            grade,
            findingType: "q.banned_words",
            severity: "fail",
            message: `Question prompt contains banned word "${banned}".`,
            targetSnapshot: snapshot,
          });
        }

        // Self-leakage — only inspect the QUESTION portion of the
        // prompt (last paragraph after `\n\n`). Embedded passages
        // legitimately contain answers; that's the comprehension model.
        //
        // Many K-4 question types LEGITIMATELY repeat the answer in the
        // stimulus (root-word ID, digraph ID, sight-word spelling, inline
        // choice listing, identification-in-sentence). The check below
        // detects those shapes and skips them — without these gates the
        // judge runs at 0% precision on basic phonics/grammar drills.
        const promptParts = promptText.split("\n\n");
        const questionPart = promptParts[promptParts.length - 1];
        const questionStripped = questionPart
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/[^\w\s]/g, " ")
          .replace(/\s+/g, " ")
          .toLowerCase()
          .trim();
        const correctText = String(q.correct ?? "").toLowerCase().trim();
        const correctCompact = correctText.replace(/\s+/g, "");

        // Skip families: question shapes where the answer being inside
        // the prompt is the question, not a leak.
        const stdId = String(standardId ?? "").toUpperCase();
        const isRootWordQ = /\broot word\b/i.test(questionPart);
        const isDigraphVowelTeamQ =
          /\b(two letters|vowel team|digraph|trigraph|letters spell|letters make|letters say|silent letter)\b/i.test(
            questionPart,
          );
        const isSightWordSpellQ =
          /\bhow (is|do you) (it )?spell\b|\bspell this\b|\bspelled\b/i.test(
            questionPart,
          );
        const isIdentifyInSentenceQ =
          /\bwhich (word|letter|sentence)\b.*\bin (this|the) (sentence|word|words)\b/i.test(
            questionPart,
          ) ||
          /\bidentify\b.*(in|from)\b/i.test(questionPart);
        const isInlineChoicePrompt =
          /:\s*[A-Za-z][^?]+?,\s*[A-Za-z][^?]+?,\s*[A-Za-z][^?]+?[?\.]/.test(
            questionPart,
          );
        const isPhonicsStandard = /^(RF|L)\.[K1-4]\.\d/.test(stdId);
        const isCommonWord = /\b(the|a|an|in|on|at|of|to|is|it|and|or|but)\b/i.test(
          correctText,
        );

        const isLetterDrill =
          correctCompact.length >= 3 &&
          /\b[a-z](?:[\s\-][a-z])+\b/.test(correctText);
        const promptHighlightsTarget =
          /["**'](.{1,30})["**']/.test(promptText) &&
          /how (is|do you) (it )?spell|how is it spelled|what letters/i.test(promptText);
        // Phonics MCQs ("which letter says /b/ in 'bat'?" with correct "b")
        // intentionally have the answer in the prompt — that's the question,
        // not a leak. Skip when the prompt is phonics-shaped AND the answer
        // is a single letter.
        const isPhonicsCtx =
          /\b(letter|letters|sound|sounds|phoneme|spell|spells)\b/i.test(questionPart);
        const isSingleLetterCorrect = correctText.length === 1;

        // Whole-word boundary check — "in" should NOT match inside
        // "inside". The naive substring check below was the source of
        // most false positives.
        const wordBoundaryHit = new RegExp(
          `\\b${correctText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        ).test(questionStripped);

        const skipFamily =
          isRootWordQ ||
          isDigraphVowelTeamQ ||
          isSightWordSpellQ ||
          isIdentifyInSentenceQ ||
          isInlineChoicePrompt ||
          (isPhonicsStandard && correctText.length <= 3) ||
          (isCommonWord && correctText.length <= 3);

        const leak =
          !skipFamily &&
          (promptHighlightsTarget ||
            (correctText.length >= 2 &&
              wordBoundaryHit &&
              !(isPhonicsCtx && isSingleLetterCorrect)) ||
            (isLetterDrill && questionStripped.includes(correctCompact)));
        if (leak) {
          fail++;
          await upsertFinding({
            runId: input.runId,
            targetKind: "question",
            targetId,
            grade,
            findingType: "q.no_self_leak",
            severity: "fail",
            message: `Prompt literally contains the correct answer ("${q.correct}").`,
            suggestion: "Rewrite the prompt to remove the leaked answer.",
            targetSnapshot: snapshot,
          });
        }

        // Choices contain duplicates. Case AND punctuation sensitive —
        // L.x.2 (capitalization) and L.x.2/RF.x.1a (sentence punctuation)
        // questions intentionally have visually-similar choices like
        // "the dog runs fast." vs "The dog runs fast" — those are NOT
        // duplicates, they're the entire question. Skip those standards
        // outright; for everything else compare exact strings.
        const isCapOrPunctRule = /^L\.[K1-4]\.2/.test(stdId) || /^RF\.[K1-4]\.1a$/.test(stdId);
        if (!isCapOrPunctRule) {
          const choiceTexts = (q.choices as string[]).map((c) =>
            String(c).trim(),
          );
          if (new Set(choiceTexts).size !== choiceTexts.length) {
            fail++;
            await upsertFinding({
              runId: input.runId,
              targetKind: "question",
              targetId,
              grade,
              findingType: "q.unique_choices",
              severity: "fail",
              message: "Choices contain duplicates.",
              targetSnapshot: snapshot,
            });
          }
        }

        // LLM judges (cost: ~$0.002 per question for both)
        try {
          const sba = await judgeShouldBeAsked({
            standardId,
            standardDescription,
            prompt: promptText,
            choices: q.choices as string[],
            correct: String(q.correct),
            passageBody: null,
          });
          if (sba.ok) {
            const sev = sba.verdict === "valid" ? "pass" : sba.verdict === "weak" ? "warn" : "fail";
            if (sev === "fail") fail++;
            else if (sev === "warn") warn++;
            else pass++;
            await upsertFinding({
              runId: input.runId,
              targetKind: "question",
              targetId,
              grade,
              findingType: "q.should_be_asked",
              severity: sev,
              message: sba.reason,
              targetSnapshot: snapshot,
            });
          }
        } catch (e) {
          // Don't fail the whole audit on a single judge call error.
        }

        try {
          const bf = await judgeBetterFormat({
            standardId,
            standardDescription,
            prompt: promptText,
            choices: q.choices as string[],
            correct: String(q.correct),
          });
          if (bf.ok && bf.recommendation !== "keep_mcq") {
            warn++;
            await upsertFinding({
              runId: input.runId,
              targetKind: "question",
              targetId,
              grade,
              findingType: "q.better_format",
              severity: "warn",
              message: `Recommend changing to ${bf.recommendation}: ${bf.reason}`,
              suggestion: bf.recommendation,
              targetSnapshot: snapshot,
            });
          }
        } catch (e) {
          // continue
        }

        // Optional: media QC.
        if (input.withMedia) {
          if (q.audio_url && typeof q.audio_url === "string") {
            try {
              // Pre-filters — the audio judge has been at ~35% precision
              // because it doesn't know Readee's TTS conventions:
              //   - Grades 2-4: choices are NOT in the audio by design
              //     (defaultPerQuestionTts returns false); judge keeps
              //     flagging "audio omits the choices".
              //   - RF.x.3d phonics-spelling: Gemini TTS naturalizes
              //     non-words like "Thoght / Thawt" as "thought";
              //     unfixable, not a bug.
              //   - Heteronym questions (wind/wind, lead/lead, read/read):
              //     dual pronunciation is the question, not inconsistency.
              const isG2to4 = /^[GK]?[234]/.test(grade) || /^[234]/.test(grade);
              const isPhonicsSpelling = /^RF\.[K1-4]\.3d$/.test(stdId);
              const isHeteronymQ = /\bsame spelling.+different (sound|pronunciation)\b|\brhym(es|ing) with .+ in this sentence\b|\bheteronym/i.test(
                promptText,
              );
              const includeChoicesInExpected = !isG2to4;
              const choicesText =
                includeChoicesInExpected && Array.isArray(q.choices)
                  ? `\n\nChoices read aloud:\n${(q.choices as string[]).map((c, i) => `${i + 1}. ${c}`).join("\n")}`
                  : "";

              if (isPhonicsSpelling || isHeteronymQ) {
                // Skip entirely — judge can't reliably evaluate these.
                pass++;
              } else {
                const audioSnap = { ...snapshot, audio_url: q.audio_url };
                const audioHash = assetContentHash("q.audio_quality", audioSnap);
                const blessed =
                  audioHash &&
                  (await isAlreadyBlessed({
                    targetKind: "question",
                    targetId,
                    findingType: "q.audio_quality",
                    contentHash: audioHash,
                  }));
                if (blessed) {
                  pass++;
                } else {
                  const a = await judgeAudioFile({
                    audioUrl: q.audio_url,
                    expectedText: promptText + choicesText,
                  });
                  if (a.ok) {
                    if (a.severity === "fail") fail++;
                    else if (a.severity === "warn") warn++;
                    else pass++;
                    await upsertFinding({
                      runId: input.runId,
                      targetKind: "question",
                      targetId,
                      grade,
                      findingType: "q.audio_quality",
                      severity: a.severity,
                      message: a.reason,
                      targetSnapshot: audioSnap,
                    });
                  }
                }
              }
            } catch {}
          }
          if (q.image_url && typeof q.image_url === "string") {
            try {
              const imageSnap = { ...snapshot, image_url: q.image_url };
              const imageHash = assetContentHash("q.image_quality", imageSnap);
              const blessed =
                imageHash &&
                (await isAlreadyBlessed({
                  targetKind: "question",
                  targetId,
                  findingType: "q.image_quality",
                  contentHash: imageHash,
                }));
              if (blessed) {
                pass++;
              } else {
                const i = await judgeImageQuality({
                  imageUrl: q.image_url,
                  expectedScene: promptText,
                });
                if (i.ok) {
                  if (i.severity === "fail") fail++;
                  else if (i.severity === "warn") warn++;
                  else pass++;
                  await upsertFinding({
                    runId: input.runId,
                    targetKind: "question",
                    targetId,
                    grade,
                    findingType: "q.image_quality",
                    severity: i.severity,
                    message: i.reason,
                    targetSnapshot: imageSnap,
                  });
                }
              }
            } catch {}
          }
        }

        if (scanned % 25 === 0) {
          console.log(`  ...questions scanned ${scanned} (pass ${pass} / warn ${warn} / fail ${fail})`);
        }
      }
    }
  }

  return { scanned, pass, warn, fail };
}

async function auditLessons(input: {
  runId: string;
  limit: number | null;
  grade: string | null;
  withMedia: boolean;
}): Promise<{
  scanned: number;
  pass: number;
  warn: number;
  fail: number;
}> {
  let scanned = 0;
  let pass = 0;
  let warn = 0;
  let fail = 0;

  const lessons = (sampleLessons as any[]) ?? [];

  // Lesson grade tags use long form ("Kindergarten", "1st Grade")
  // while questions use short ("K", "1st"). Normalize both ways.
  function shortGrade(g: string): string {
    if (g === "Kindergarten") return "K";
    if (g === "1st Grade") return "1st";
    if (g === "2nd Grade") return "2nd";
    if (g === "3rd Grade") return "3rd";
    if (g === "4th Grade") return "4th";
    return g;
  }

  outer: for (const lesson of lessons) {
    if (input.limit && scanned >= input.limit) break outer;
    const lessonGradeShort = shortGrade(lesson.grade ?? "");
    if (input.grade && lessonGradeShort !== input.grade) continue;
    if (!lesson.standardId) continue;
    scanned++;

    const standardId = lesson.standardId as string;

    const slides = Array.isArray(lesson.slides) ? lesson.slides : [];

    // Structural pass
    const structural = checkLessonStructure({ standardId, lesson });
    for (const f of structural) {
      if (f.severity === "fail") fail++;
      else warn++;
      await upsertFinding({
        runId: input.runId,
        targetKind: "lesson",
        targetId: standardId,
        grade: lessonGradeShort || null,
        findingType: f.type,
        severity: f.severity,
        message: f.message,
        suggestion: f.suggestion ?? null,
        targetSnapshot: {
          standardId,
          title: lesson.title,
          slideCount: slides.length,
          slidesPreview: slides.slice(0, 3),
        },
      });
    }

    // Richness pass — uses K-grade lessons as the reference quality
    // bar (Filip audited K by hand). Flags non-K lessons that don't
    // hit the same animation primitive density. K shows up as warn-
    // free here by construction; G3/G4 will surface most of the
    // findings since those grades currently ship plain read-aloud.
    const richness = checkLessonRichness({ standardId, lesson });
    for (const f of richness) {
      if (f.severity === "fail") fail++;
      else warn++;
      await upsertFinding({
        runId: input.runId,
        targetKind: "lesson",
        targetId: standardId,
        grade: lessonGradeShort || null,
        findingType: f.type,
        severity: f.severity,
        message: f.message,
        suggestion: f.suggestion ?? null,
        targetSnapshot: {
          standardId,
          title: lesson.title,
          slideCount: slides.length,
          slidesPreview: slides.slice(0, 3),
        },
      });
    }

    // Lesson audio (per-step) QC if --with-media
    if (input.withMedia) {
      const SUPABASE_PUBLIC = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/";
      for (const slide of slides) {
        const slideNum = slide?.slide ?? "?";
        const steps = Array.isArray(slide?.steps) ? slide.steps : [];
        for (const step of steps) {
          if (!step?.audioFile || typeof step.audioFile !== "string") continue;
          const url = step.audioFile.startsWith("http")
            ? step.audioFile
            : `${SUPABASE_PUBLIC}${step.audioFile}`;
          const stepRef = `S${slideNum}${step?.sub ?? ""}`;
          const stepSnap = {
            standardId,
            stepRef,
            audio_url: url,
            ttsScript: step?.ttsScript,
          };
          const stepHash = assetContentHash("step.audio_quality", stepSnap);
          const blessed =
            stepHash &&
            (await isAlreadyBlessed({
              targetKind: "lesson_slide",
              targetId: `${standardId}#${stepRef}`,
              findingType: "step.audio_quality",
              contentHash: stepHash,
            }));
          if (blessed) {
            pass++;
            continue;
          }
          try {
            const a = await judgeAudioFile({
              audioUrl: url,
              expectedText: String(step?.ttsScript ?? "").slice(0, 1500),
            });
            if (a.ok) {
              if (a.severity === "fail") fail++;
              else if (a.severity === "warn") warn++;
              else pass++;
              await upsertFinding({
                runId: input.runId,
                targetKind: "lesson_slide",
                targetId: `${standardId}#${stepRef}`,
                grade: lessonGradeShort || null,
                findingType: "step.audio_quality",
                severity: a.severity,
                message: a.reason,
                targetSnapshot: stepSnap,
              });
            }
          } catch {}
        }
      }
    }

    // Per-slide judge — only if the lesson isn't a stub
    if (slides.length > 0) {
      const standardDescription = lesson.title ?? standardId;
      for (const slide of slides) {
        const slideNum = slide?.slide ?? "?";
        const slideHeading = slide?.heading ?? null;
        const steps = Array.isArray(slide?.steps) ? slide.steps : [];
        const combinedText = steps
          .map((s: any) =>
            [s?.ttsScript, s?.interaction].filter(Boolean).join(" — "),
          )
          .filter(Boolean)
          .join("\n");
        if (!combinedText.trim()) continue;
        try {
          const judge = await judgeLessonSlide({
            standardId,
            standardDescription,
            lessonTitle: lesson.title ?? standardId,
            slideNumber: slideNum,
            slideHeading,
            combinedText,
          });
          if (judge.ok) {
            if (judge.severity === "fail") fail++;
            else if (judge.severity === "warn") warn++;
            else pass++;
            await upsertFinding({
              runId: input.runId,
              targetKind: "lesson_slide",
              targetId: `${standardId}#slide-${slideNum}`,
              grade: lessonGradeShort || null,
              findingType: "slide.judge",
              severity: judge.severity,
              message: judge.reason,
              targetSnapshot: {
                standardId,
                lessonTitle: lesson.title,
                slideNumber: slideNum,
                slideHeading,
                steps,
              },
            });
          }
        } catch (e) {
          // continue
        }
      }
    }

    if (scanned % 5 === 0) {
      console.log(`  ...lessons scanned ${scanned} (pass ${pass} / warn ${warn} / fail ${fail})`);
    }
  }

  return { scanned, pass, warn, fail };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const scope = `kind=${args.kind} limit=${args.limit ?? "all"} grade=${args.grade ?? "all"}`;
  console.log(`Starting content audit · ${scope}`);
  const runId = await startRun(scope);
  console.log(`  run_id=${runId}`);

  let qStats = { scanned: 0, pass: 0, warn: 0, fail: 0 };
  let lStats = { scanned: 0, pass: 0, warn: 0, fail: 0 };

  try {
    if (args.kind === "question" || args.kind === "all") {
      console.log("\n→ Auditing questions");
      qStats = await auditQuestions({
        runId,
        limit: args.limit,
        grade: args.grade,
        withMedia: args.withMedia,
      });
      console.log(
        `  questions: scanned ${qStats.scanned}, pass ${qStats.pass}, warn ${qStats.warn}, fail ${qStats.fail}`,
      );
    }
    if (args.kind === "lesson" || args.kind === "all") {
      console.log("\n→ Auditing lessons");
      lStats = await auditLessons({
        runId,
        limit: args.limit,
        grade: args.grade,
        withMedia: args.withMedia,
      });
      console.log(
        `  lessons: scanned ${lStats.scanned}, pass ${lStats.pass}, warn ${lStats.warn}, fail ${lStats.fail}`,
      );
    }

    await finishRun({
      runId,
      questionsScanned: qStats.scanned,
      lessonsScanned: lStats.scanned,
      pass: qStats.pass + lStats.pass,
      warn: qStats.warn + lStats.warn,
      fail: qStats.fail + lStats.fail,
      status: "completed",
    });
    console.log(`\n✓ Audit complete. run_id=${runId}`);
    console.log(
      `  Total: pass ${qStats.pass + lStats.pass}, warn ${qStats.warn + lStats.warn}, fail ${qStats.fail + lStats.fail}`,
    );
  } catch (e: any) {
    console.error("Audit threw:", e);
    await finishRun({
      runId,
      questionsScanned: qStats.scanned,
      lessonsScanned: lStats.scanned,
      pass: qStats.pass + lStats.pass,
      warn: qStats.warn + lStats.warn,
      fail: qStats.fail + lStats.fail,
      status: "failed",
      error: e?.message ?? String(e),
    });
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
