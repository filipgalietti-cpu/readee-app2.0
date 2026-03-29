"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { grades, gradeToKey, type GradeKey } from "@/lib/assessment/questions";
import {
  ClipboardCheck,
  BarChart3, CheckCircle2, XCircle, RotateCcw, ChevronDown,
  AudioLines, BookOpen, MessageSquareText,
} from "lucide-react";

/* ── Animated counter hook ─────────────────────────── */

function useCountUp(target: number, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, target, duration, delay]);

  return { value, ref };
}

import manifestRaw from "@/scripts/assessment_mixed_manifest.json";
import bankRaw from "@/lib/assessment/mixed-bank-k4.json";

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

const bankLookup: Record<string, any> = {};
for (const qs of Object.values((bankRaw as { grades: Record<string, any[]> }).grades)) {
  for (const q of qs) bankLookup[q.id] = q;
}

interface QuestionMeta {
  prompt: string;
  type: string;
  standard: string;
  skill: string;
}

const SKILL_MAP: Record<string, { label: string; Icon: typeof AudioLines }> = {
  RF: { label: "Phonics & Word Skills", Icon: AudioLines },
  RL: { label: "Reading Comprehension", Icon: BookOpen },
  RI: { label: "Reading Comprehension", Icon: BookOpen },
  L:  { label: "Vocabulary & Grammar", Icon: MessageSquareText },
};

const questionLookup: Record<string, QuestionMeta> = {};
for (const q of manifestRaw as any[]) {
  const bank = bankLookup[q.id];
  const standard = bank?.standard || q.standard || "";
  const domain = standard.split(".")[0]; // RF, RL, RI, L
  const skill = SKILL_MAP[domain]?.label || "General";
  questionLookup[q.id] = { prompt: q.prompt, type: q.type, standard, skill };
}

/* ── Helpers ───────────────────────────────────────── */

const LEVEL_STEPS = [
  { key: "kindergarten", label: "Beginning Reader", gradeLabel: "Kindergarten", color: "#f59e0b" },
  { key: "1st", label: "Developing Reader", gradeLabel: "1st Grade", color: "#f97316" },
  { key: "2nd", label: "Growing Reader", gradeLabel: "2nd Grade", color: "#8b5cf6" },
  { key: "3rd", label: "Independent Reader", gradeLabel: "3rd Grade", color: "#6366f1" },
  { key: "4th", label: "Advanced Reader", gradeLabel: "4th Grade", color: "#10b981" },
];

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  "Emerging Reader": "Learning the basics — letter names, letter sounds, and print awareness. Building the foundation for reading.",
  "Beginning Reader": "Starting to sound out simple words, recognizing common sight words, and understanding short sentences.",
  "Developing Reader": "Reading short passages with some help, blending sounds, and starting to understand what they read.",
  "Growing Reader": "Reading chapter books and longer texts, building vocabulary, and answering questions about stories.",
  "Independent Reader": "Reading on their own with confidence, understanding main ideas, and making connections across texts.",
  "Advanced Reader": "Reading complex texts, analyzing themes, using context clues, and thinking critically about what they read.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

  // Pre-k kids take K questions, so show "Kindergarten" as tested grade
  const rawGk = gradeToKey(assessment.grade_tested);
  const effectiveGk = (rawGk === "pre-k" ? "kindergarten" : rawGk) as GradeKey;
  const gradeLabel = grades[effectiveGk]?.grade_label || assessment.grade_tested;

  const totalCorrect = assessment.answers.filter((a) => a.is_correct).length;
  const totalQuestions = assessment.answers.length;

  // Find where the child placed on the meter
  // "Emerging Reader" (pre-k placement) maps to below K — clamp to 0
  const placedLevel = assessment.reading_level_placed;
  const placedIdx = Math.max(0, LEVEL_STEPS.findIndex((s) => s.label === placedLevel));
  const testedIdx = LEVEL_STEPS.findIndex((s) => s.key === effectiveGk);

  // Group answers by reading skill
  const bySkill: Record<string, { correct: number; total: number; Icon: typeof AudioLines }> = {};
  for (const a of assessment.answers) {
    const q = questionLookup[a.question_id];
    const skill = q?.skill || "General";
    const domain = q?.standard?.split(".")[0] || "";
    const Icon = SKILL_MAP[domain]?.Icon || BookOpen;
    if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0, Icon };
    bySkill[skill].total++;
    if (a.is_correct) bySkill[skill].correct++;
  }

  const scorePct = useCountUp(assessment.score_percent, 1200, 400);
  const correctCount = useCountUp(totalCorrect, 800, 400);

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
        <p className="text-2xl font-extrabold text-zinc-900 text-center mb-2">
          {assessment.reading_level_placed}
        </p>
        <p className="text-sm text-zinc-600 text-center mb-3 max-w-sm mx-auto leading-relaxed">
          {LEVEL_DESCRIPTIONS[assessment.reading_level_placed] || ""}
        </p>
        <p className="text-sm text-zinc-400 text-center mb-6">
          Scored <span ref={scorePct.ref} className="font-semibold text-zinc-700">{scorePct.value}%</span> &middot; <span ref={correctCount.ref} className="font-semibold text-zinc-700">{correctCount.value}</span> of {totalQuestions} correct
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
                  <motion.div
                    className={`w-full h-3 rounded-full ${isPast ? "" : "bg-zinc-100"}`}
                    style={isPast ? { backgroundColor: step.color } : undefined}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
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

      {/* Performance by Skill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white shadow-md p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-zinc-900">Skill Breakdown</h2>
        </div>
        <div className="space-y-4">
          {Object.entries(bySkill).map(([skill, stats], skillIdx) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
            const label = pct >= 80 ? "Strong" : pct >= 50 ? "Developing" : "Needs Practice";
            const staggerDelay = 0.3 + skillIdx * 0.2;
            return (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: staggerDelay, duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <stats.Icon className="w-4 h-4 text-indigo-500" strokeWidth={1.5} />
                    <span className="font-semibold text-sm text-zinc-800">{skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: barColor, backgroundColor: barColor + "18" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: staggerDelay + 0.5, type: "spring", bounce: 0.4 }}
                    >
                      {label}
                    </motion.span>
                    <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: staggerDelay + 0.1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {stats.correct} of {stats.total} correct
                </p>
              </motion.div>
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
                        {q?.skill || ""}
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
