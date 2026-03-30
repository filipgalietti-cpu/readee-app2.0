"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { usePlanStore } from "@/lib/stores/plan-store";
import lessonsData from "@/lib/data/lessons.json";
import {
  CheckCircle2, Lock, ChevronDown, BookOpen, Flame,
  Sparkles, Play, RotateCcw, Star,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

interface LessonData {
  id: string;
  title: string;
  skill: string;
  description: string;
  standards?: string[];
}

interface ProgressRecord {
  lesson_id: string;
  section: string;
  score: number;
  completed_at: string;
}

type LessonStatus = "completed" | "current" | "locked" | "premium";

interface LessonWithStatus extends LessonData {
  status: LessonStatus;
  idx: number;
}

interface Section {
  name: string;
  lessons: LessonWithStatus[];
  completedCount: number;
}

/* ── Skill → Section mapping ───────────────────────── */

const SKILL_SECTIONS: Record<string, string> = {
  letter_recognition: "Letters & Sounds",
  letter_sounds: "Letters & Sounds",
  short_vowels: "Letters & Sounds",
  phoneme_sounds: "Letters & Sounds",
  cvc_blending: "Words & Reading",
  word_families: "Words & Reading",
  sight_words: "Words & Reading",
  syllable_awareness: "Words & Reading",
  print_concepts: "Words & Reading",
  decodable_story: "Stories",
  reading: "Stories",
  // 1st grade
  blends: "Phonics",
  digraphs: "Phonics",
  cvce: "Phonics",
  fluency: "Reading & Fluency",
  word_endings: "Words & Vocabulary",
  long_short_vowels: "Phonics",
  multisyllabic: "Words & Vocabulary",
  // 2nd grade
  vowel_teams: "Phonics",
  compound_words: "Words & Vocabulary",
  prefixes: "Words & Vocabulary",
  suffixes: "Words & Vocabulary",
  inferences: "Comprehension",
  sight_words_advanced: "Words & Vocabulary",
  // 3rd+
  spelling_patterns: "Phonics",
  main_idea: "Comprehension",
  context_clues: "Comprehension",
  fact_opinion: "Comprehension",
  story_structure: "Comprehension",
  latin_suffixes: "Words & Vocabulary",
  poetry: "Reading & Fluency",
  point_of_view: "Comprehension",
  // 4th
  greek_latin: "Words & Vocabulary",
  figurative_language: "Comprehension",
  idioms: "Words & Vocabulary",
  text_structure: "Comprehension",
  theme: "Comprehension",
  author_purpose: "Comprehension",
  character_analysis: "Comprehension",
  summarizing: "Comprehension",
};

function getSectionName(skill: string): string {
  return SKILL_SECTIONS[skill] || "Reading";
}

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();

      const [childRes, progressRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase.from("lessons_progress").select("*").eq("child_id", childId),
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

  // Load lessons for child's reading level
  const gradeKey = levelNameToGradeKey(child.reading_level);
  const file = lessonsData as any;
  const level = file.levels[gradeKey];
  const lessons: LessonData[] = level?.lessons || [];

  // Determine status for each lesson
  const isComplete = (lessonId: string) =>
    progress.some((p) => p.lesson_id === lessonId && p.section === "practice" && p.score >= 60);

  let foundCurrent = false;
  const lessonsWithStatus: LessonWithStatus[] = lessons.map((lesson, idx) => {
    if (isComplete(lesson.id)) {
      return { ...lesson, status: "completed" as const, idx };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { ...lesson, status: "current" as const, idx };
    }
    // Check premium lock
    if (idx >= FREE_LESSON_COUNT && plan !== "premium") {
      return { ...lesson, status: "premium" as const, idx };
    }
    return { ...lesson, status: "locked" as const, idx };
  });

  // Group into sections
  const sectionMap = new Map<string, LessonWithStatus[]>();
  for (const lesson of lessonsWithStatus) {
    const section = getSectionName(lesson.skill);
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section)!.push(lesson);
  }

  const sections: Section[] = Array.from(sectionMap.entries()).map(([name, sectionLessons]) => ({
    name,
    lessons: sectionLessons,
    completedCount: sectionLessons.filter((l) => l.status === "completed").length,
  }));

  // Auto-expand the section containing the current lesson
  const currentSection = sections.find((s) => s.lessons.some((l) => l.status === "current"));

  // Stats
  const totalLessons = lessons.length;
  const completedLessons = lessonsWithStatus.filter((l) => l.status === "completed").length;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isSectionExpanded = (name: string) => {
    if (expandedSections.has(name)) return true;
    // Default: expand current section
    if (currentSection?.name === name && expandedSections.size === 0) return true;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      {/* ── Progress Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-white"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-200">{child.first_name}&apos;s Reading Journey</p>
            <p className="text-2xl font-extrabold mt-0.5">{completedLessons} of {totalLessons} lessons</p>
          </div>
          {/* Progress ring */}
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${pct * 0.94} 94`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {child.streak_days || 0} day streak</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {child.carrots || 0} XP</span>
        </div>
      </motion.div>

      {/* ── Sections ── */}
      {sections.map((section, sIdx) => {
        const expanded = isSectionExpanded(section.name);
        const sectionPct = section.lessons.length > 0
          ? Math.round((section.completedCount / section.lessons.length) * 100)
          : 0;
        const hasCurrent = section.lessons.some((l) => l.status === "current");

        return (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.05 }}
            className="rounded-2xl bg-white shadow-sm border border-zinc-100 overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full px-5 py-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                sectionPct === 100
                  ? "bg-emerald-50 text-emerald-600"
                  : hasCurrent
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-zinc-100 text-zinc-400"
              }`}>
                <BookOpen className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-zinc-900">{section.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sectionPct}%`,
                        backgroundColor: sectionPct === 100 ? "#10b981" : "#6366f1",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 flex-shrink-0">
                    {section.completedCount}/{section.lessons.length}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-zinc-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {/* Lesson rows */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4">
                    <div className="relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-zinc-100" />

                      <div className="space-y-1">
                        {section.lessons.map((lesson, lIdx) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            childId={childId!}
                            lessonNumber={lesson.idx + 1}
                            delay={lIdx * 0.04}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* ── Review Mode stub ── */}
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
  childId,
  lessonNumber,
  delay,
}: {
  lesson: LessonWithStatus;
  childId: string;
  lessonNumber: number;
  delay: number;
}) {
  const { status } = lesson;

  const statusIcon = {
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

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`relative flex items-center gap-3 py-3 px-2 rounded-xl transition-colors ${
        status === "current"
          ? "bg-indigo-50 border border-indigo-200"
          : status === "completed"
          ? "hover:bg-zinc-50"
          : "opacity-50"
      }`}
    >
      {/* Status dot on connector */}
      <div className="relative z-10 flex-shrink-0 w-9 flex justify-center">
        {statusIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${
          status === "locked" || status === "premium" ? "text-zinc-400" : "text-zinc-900"
        }`}>
          {lessonNumber}. {lesson.title}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 truncate">{lesson.description}</p>
      </div>

      {/* Right side */}
      {status === "current" && (
        <span className="flex-shrink-0 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold">
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
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
