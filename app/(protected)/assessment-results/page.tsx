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
  ClipboardCheck, TrendingUp, TrendingDown, Minus,
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

function placementIcon(gradeKey: GradeKey, gradeTested: string) {
  const testedKey = gradeToKey(gradeTested);
  const gradeOrder = ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"];
  const placedIdx = gradeOrder.indexOf(gradeKey);
  const testedIdx = gradeOrder.indexOf(testedKey);

  if (placedIdx > testedIdx) return { icon: TrendingUp, label: "Above Grade Level", color: "text-emerald-600 bg-emerald-50" };
  if (placedIdx < testedIdx) return { icon: TrendingDown, label: "Below Grade Level", color: "text-amber-600 bg-amber-50" };
  return { icon: Minus, label: "On Grade Level", color: "text-indigo-600 bg-indigo-50" };
}

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
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">No Assessment Found</h1>
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
  const placement = placementIcon(
    gradeToKey(assessment.reading_level_placed === "Emerging Reader" ? "pre-k"
      : assessment.reading_level_placed === "Beginning Reader" ? "kindergarten"
      : assessment.reading_level_placed === "Developing Reader" ? "1st"
      : assessment.reading_level_placed === "Growing Reader" ? "2nd"
      : assessment.reading_level_placed === "Independent Reader" ? "3rd"
      : "4th") as GradeKey,
    assessment.grade_tested
  );
  const PlacementIcon = placement.icon;

  const totalCorrect = assessment.answers.filter((a) => a.is_correct).length;
  const totalQuestions = assessment.answers.length;

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
          {child.first_name}&apos;s Assessment Results
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Completed {formatDate(assessment.completed_at)}
        </p>
      </motion.div>

      {/* Score + Level cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Reading Level */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div
            className="px-6 py-6 text-center text-white"
            style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa, #c4b5fd)" }}
          >
            <p className="text-white text-xs font-medium uppercase tracking-wider mb-1">Reading Level</p>
            <p className="text-2xl font-extrabold">{assessment.reading_level_placed}</p>
          </div>
          <div className="px-6 py-3 bg-white flex items-center justify-center gap-2">
            <PlacementIcon className={`w-4 h-4 ${placement.color.split(" ")[0]}`} />
            <span className={`text-sm font-semibold ${placement.color.split(" ")[0]}`}>
              {placement.label}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="rounded-2xl bg-white shadow-md p-6 text-center">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Score</p>
          <p className="text-4xl font-extrabold text-zinc-900">{assessment.score_percent}%</p>
          <p className="text-sm text-zinc-500 mt-1">
            {totalCorrect} of {totalQuestions} correct
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Tested at {gradeLabel} level
          </p>
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
          Retake Assessment
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
