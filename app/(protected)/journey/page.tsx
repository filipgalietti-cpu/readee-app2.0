"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { usePlanStore } from "@/lib/stores/plan-store";
import lessonsData from "@/lib/data/lessons.json";
import {
  CheckCircle2, Lock, BookOpen, Flame,
  Play, RotateCcw, Star,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

interface LessonData {
  id: string;
  title: string;
  skill: string;
  description: string;
}

interface ProgressRecord {
  lesson_id: string;
  section: string;
  score: number;
}

type LessonStatus = "completed" | "current" | "locked" | "premium";

const FREE_LESSON_COUNT = 5;

/* ── Page ──────────────────────────────────────────── */

export default function JourneyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <JourneyContent />
    </Suspense>
  );
}

function JourneyContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);

  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const [childRes, progressRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase.from("lessons_progress").select("lesson_id, section, score").eq("child_id", childId),
      ]);
      if (childRes.data) setChild(childRes.data as Child);
      if (progressRes.data) setProgress(progressRes.data as ProgressRecord[]);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const gradeKey = levelNameToGradeKey(child.reading_level);
  const level = (lessonsData as any).levels[gradeKey];
  const lessons: LessonData[] = level?.lessons || [];

  const isComplete = (id: string) =>
    progress.some((p) => p.lesson_id === id && p.section === "practice" && p.score >= 60);

  let foundCurrent = false;
  const statuses: LessonStatus[] = lessons.map((lesson, idx) => {
    if (isComplete(lesson.id)) return "completed";
    if (!foundCurrent) { foundCurrent = true; return "current"; }
    if (idx >= FREE_LESSON_COUNT && plan !== "premium") return "premium";
    return "locked";
  });

  const completedCount = statuses.filter((s) => s === "completed").length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-5">
      {/* ── Progress Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-white"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-200">{child.first_name}&apos;s Lessons</p>
            <p className="text-2xl font-extrabold mt-0.5">{completedCount} of {lessons.length}</p>
          </div>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${pct * 0.94} 94`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{pct}%</span>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {child.streak_days || 0} day streak</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {child.carrots || 0} XP</span>
        </div>
      </motion.div>

      {/* ── Lesson List ── */}
      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-zinc-100 rounded-full" />

        <div className="space-y-2">
          {lessons.map((lesson, idx) => {
            const status = statuses[idx];
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                status={status}
                childId={childId!}
                number={idx + 1}
                delay={idx * 0.03}
              />
            );
          })}
        </div>
      </div>

      {/* ── Review stub ── */}
      <div className="pt-2 pb-8">
        <button
          disabled
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 font-semibold text-sm cursor-not-allowed"
        >
          Review Mode — Coming Soon
        </button>
      </div>
    </div>
  );
}

/* ── Lesson Row ────────────────────────────────────── */

function LessonRow({
  lesson,
  status,
  childId,
  number,
  delay,
}: {
  lesson: LessonData;
  status: LessonStatus;
  childId: string;
  number: number;
  delay: number;
}) {
  const icon = {
    completed: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    current: (
      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
        <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
      </div>
    ),
    locked: <Lock className="w-4 h-4 text-zinc-300" />,
    premium: <Lock className="w-4 h-4 text-violet-400" />,
  }[status];

  const isClickable = status === "completed" || status === "current";
  const href = isClickable
    ? `/lesson?child=${childId}&lesson=${lesson.id}`
    : status === "premium"
    ? `/upgrade?child=${childId}`
    : "#";

  const row = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`relative flex items-center gap-3 py-3.5 px-3 rounded-xl transition-colors ${
        status === "current"
          ? "bg-indigo-50 border border-indigo-200 shadow-sm"
          : status === "completed"
          ? "hover:bg-zinc-50"
          : "opacity-50"
      }`}
    >
      {/* Icon on connector */}
      <div className="relative z-10 w-[26px] flex justify-center flex-shrink-0">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-tight ${
          status === "locked" || status === "premium" ? "text-zinc-400" : "text-zinc-900"
        }`}>
          Lesson {number}: {lesson.title}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 truncate">{lesson.description}</p>
      </div>

      {/* Action */}
      {status === "current" && (
        <span className="flex-shrink-0 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
          Start
        </span>
      )}
      {status === "completed" && (
        <RotateCcw className="w-4 h-4 text-zinc-300 flex-shrink-0" />
      )}
      {status === "premium" && (
        <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-600">
          PRO
        </span>
      )}
    </motion.div>
  );

  if (isClickable || status === "premium") {
    return <Link href={href}>{row}</Link>;
  }
  return row;
}
