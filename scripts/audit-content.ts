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
  judgeLessonSlide,
} from "../lib/ai/qc-lesson";

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
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = { kind: "all", limit: null, grade: null };
  for (const a of argv) {
    if (a.startsWith("--kind=")) {
      const v = a.slice("--kind=".length);
      if (v === "all" || v === "question" || v === "lesson") out.kind = v;
    } else if (a.startsWith("--limit=")) {
      const n = parseInt(a.slice("--limit=".length), 10);
      if (!Number.isNaN(n) && n > 0) out.limit = n;
    } else if (a.startsWith("--grade=")) {
      out.grade = a.slice("--grade=".length);
    }
  }
  return out;
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
  // ON CONFLICT (target_kind, target_id, finding_type) — upsert so
  // re-running the audit refreshes the message + severity instead of
  // duplicating.
  await supabase.from("content_audit_findings").upsert(
    {
      target_kind: input.targetKind,
      target_id: input.targetId,
      grade: input.grade,
      finding_type: input.findingType,
      severity: input.severity,
      message: input.message,
      suggestion: input.suggestion ?? null,
      target_snapshot: input.targetSnapshot ?? null,
      audit_run_id: input.runId,
      status: "open",
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
          });
        }

        // Self-leakage — only inspect the QUESTION portion of the
        // prompt (last paragraph after `\n\n`). Embedded passages
        // legitimately contain answers; that's the comprehension model.
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
        const isLetterDrill =
          correctCompact.length >= 3 &&
          /\b[a-z](?:[\s\-][a-z])+\b/.test(correctText);
        const promptHighlightsTarget =
          /["**'](.{1,30})["**']/.test(promptText) &&
          /how (is|do you) (it )?spell|how is it spelled|what letters/i.test(promptText);
        const leak =
          promptHighlightsTarget ||
          (correctText.length >= 2 && questionStripped.includes(correctText)) ||
          (isLetterDrill && questionStripped.includes(correctCompact));
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
          });
        }

        // Choices contain duplicates
        const choiceTexts = (q.choices as string[]).map((c) =>
          String(c).toLowerCase().trim(),
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
          });
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
            });
          }
        } catch (e) {
          // continue
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
      });
    }

    // Per-slide judge — only if the lesson isn't a stub
    const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
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
