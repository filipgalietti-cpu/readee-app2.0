"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { grades, gradeToKey, type GradeKey } from "@/lib/assessment/questions";
import {
  ClipboardCheck,
  BarChart3, CheckCircle2, XCircle, RotateCcw, ChevronDown,
} from "lucide-react";

import manifestRaw from "@/scripts/assessment_mixed_manifest.json";

/* ── Types ─────────────────────────────────────────── */

interface AssessmentRecord {
  id: string;
  child_id: string;
  grade_tested: string;
  score_percent: number;
  reading_level_placed: string;
  answers: {
    question_id: string;
    selected: string;
    correct: string;
    is_correct: boolean;
  }[];
  completed_at: string;
}

/* ── Question lookup ───────────────────────────────── */

const questionLookup: Record<string, { prompt: string; type: string }> = {};
for (const q of manifestRaw as any[]) {
  questionLookup[q.id] = { prompt: q.prompt, type: q.type };
}

/* ── Helpers ───────────────────────────────────────── */

const LEVEL_STEPS = [
  { key: "pre-k", label: "Emerging Reader", gradeLabel: "Pre-K", color: "#f59e0b" },
  { key: "kindergarten", label: "Beginning Reader", gradeLabel: "Kindergarten", color: "#f97316" },
  { key: "1st", label: "Developing Reader", gradeLabel: "1st Grade", color: "#8b5cf6" },
  { key: "2nd", label: "Growing Reader", gradeLabel: "2nd Grade", color: "#6366f1" },
  { key: "3rd", label: "Independent Reader", gradeLabel: "3rd Grade", color: "#3b82f6" },
  { key: "4th", label: "Advanced Reader", gradeLabel: "4th Grade", color: "#10b981" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    mcq: "Multiple Choice",
    category_sort: "Category Sort",
    missing_word: "Missing Word",
    sentence_build: "Sentence Build",
    tap_to_pair: "Tap to Pair",
    word_builder: "Word Builder",
  };
  return labels[type] || type;
}

/* ── Page ──────────────────────────────────────────── */

export default function AssessmentResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <AssessmentResultsContent />
    </Suspense>
  );
}

function AssessmentResultsContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [child, setChild] = useState<Child | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();

      const [childRes, assessmentRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase
          .from("assessments")
          .select("*")
          .eq("child_id", childId)
          .order("completed_at", { ascending: false })
          .limit(1),
      ]);

      if (childRes.data) setChild(childRes.data as Child);
      if (assessmentRes.data?.length) setAssessment(assessmentRes.data[0] as AssessmentRecord);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!child || !assessment) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <ClipboardCheck className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">No Placement Test Found</h1>
        <p className="text-zinc-500 mb-6">
          {child?.first_name || "This child"} hasn&apos;t taken the placement test yet.
        </p>
        <Link
          href={`/assessment?child=${childId}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
        >
          <ClipboardCheck className="w-5 h-5" />
          Take Placement Test
        </Link>
      </div>
    );
  }

  const gk = gradeToKey(assessment.grade_tested) as GradeKey;
  const gradeLabel = grades[gk]?.grade_label || assessment.grade_tested;

  const totalCorrect = assessment.answers.filter((a) => a.is_correct).length;
  const totalQuestions = assessment.answers.length;

  // Find where the child placed on the meter
  const placedIdx = LEVEL_STEPS.findIndex((s) => s.label === assessment.reading_level_placed);
  const testedIdx = LEVEL_STEPS.findIndex((s) => s.key === gradeToKey(assessment.grade_tested));

  // Group answers by type
  const byType: Record<string, { correct: number; total: number }> = {};
  for (const a of assessment.answers) {
    const q = questionLookup[a.question_id];
    const type = q?.type || "unknown";
    if (!byType[type]) byType[type] = { correct: 0, total: 0 };
    byType[type].total++;
    if (a.is_correct) byType[type].correct++;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Image
          src="/images/ui/bunny-celebrate.png"
          alt="Readee bunny"
          width={512}
          height={512}
          className="mx-auto w-[80px] h-auto mb-4"
        />
        <h1 className="text-2xl font-extrabold text-zinc-900">
          {child.first_name}&apos;s Placement Test Results
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Completed {formatDate(assessment.completed_at)}
        </p>
      </motion.div>

      {/* Reading Level Meter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white shadow-md p-6"
      >
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider text-center mb-1">
          Reading Level
        </p>
        <p className="text-2xl font-extrabold text-zinc-900 text-center mb-1">
          {assessment.reading_level_placed}
        </p>
        <p className="text-sm text-zinc-500 text-center mb-6">
          {assessment.score_percent}% &middot; {totalCorrect} of {totalQuestions} correct &middot; Tested at {gradeLabel}
        </p>

        {/* Meter */}
        <div className="relative">
          {/* Track */}
          <div className="flex gap-1">
            {LEVEL_STEPS.map((step, i) => {
              const isPlaced = i === placedIdx;
              const isTested = i === testedIdx;
              const isPast = i <= placedIdx;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  {/* Bar segment */}
                  <div
                    className={`w-full h-3 rounded-full transition-all duration-500 ${
                      isPast ? "" : "bg-zinc-100"
                    }`}
                    style={isPast ? { backgroundColor: step.color } : undefined}
                  />
                  {/* Marker */}
                  {isPlaced && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                      className="w-5 h-5 -mt-4 rounded-full border-[3px] border-white shadow-md"
                      style={{ backgroundColor: step.color }}
                    />
                  )}
                  {/* Labels */}
                  <p className={`text-[10px] mt-2 text-center leading-tight ${
                    isPlaced ? "font-bold text-zinc-900" : "text-zinc-400"
                  }`}>
                    {step.gradeLabel}
                  </p>
                  {isTested && !isPlaced && (
                    <p className="text-[9px] text-indigo-400 font-medium">tested</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Performance by type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white shadow-md p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-zinc-900">Performance by Skill</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(byType).map(([type, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700">{typeLabel(type)}</span>
                  <span className="text-zinc-500">{stats.correct}/{stats.total}</span>
                </div>
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Question details (collapsible) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white shadow-md overflow-hidden"
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-bold text-zinc-900">Question Details</span>
          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
        </button>

        {showDetails && (
          <div className="px-6 pb-4 space-y-3">
            {assessment.answers.map((a, i) => {
              const q = questionLookup[a.question_id];
              return (
                <div
                  key={a.question_id}
                  className={`p-3 rounded-xl border ${
                    a.is_correct
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {a.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800">
                        {i + 1}. {q?.prompt || a.question_id}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {q ? typeLabel(q.type) : ""}
                      </p>
                      {!a.is_correct && (
                        <div className="mt-1.5 text-xs space-y-0.5">
                          <p className="text-red-600">
                            <span className="font-medium">Answer:</span> {a.selected || "(no answer)"}
                          </p>
                          <p className="text-emerald-700">
                            <span className="font-medium">Correct:</span> {a.correct}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          href={`/assessment?child=${childId}`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Retake Placement Test
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
