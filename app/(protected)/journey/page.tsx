"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey, gradeOrder, type GradeKey } from "@/lib/assessment/questions";
import { usePlanStore } from "@/lib/stores/plan-store";
import lessonsData from "@/lib/data/lessons.json";
import {
  CheckCircle2, Lock, Flame, Play, Star, ChevronDown,
  BookOpen, Type, Newspaper, MessageCircle, BookMarked,
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
}

type LessonStatus = "completed" | "started" | "current" | "locked" | "premium";

interface LessonWithStatus extends LessonData {
  status: LessonStatus;
  grade: string;
  globalIdx: number;
}

interface Section {
  name: string;
  icon: typeof BookOpen;
  lessons: LessonWithStatus[];
  completedCount: number;
  startedCount: number;
}

/* ── Constants ─────────────────────────────────────── */

const FREE_LESSON_COUNT = 5;

const GRADE_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

const SECTION_META: Record<string, { name: string; icon: typeof BookOpen }> = {
  RF: { name: "Foundational Skills", icon: Type },
  RL: { name: "Reading Literature", icon: BookOpen },
  RI: { name: "Reading Informational Text", icon: Newspaper },
  L: { name: "Language", icon: MessageCircle },
  story: { name: "Stories", icon: BookMarked },
};

function getSectionKey(lesson: LessonData): string {
  if (lesson.skill === "decodable_story" || lesson.skill === "reading") return "story";
  const std = lesson.standards?.[0] || "";
  const domain = std.split(".")[0]; // RF, RL, RI, L
  return domain || "story";
}

/* ── Build all lessons ─────────────────────────────── */

function buildAllLessons(startGrade: GradeKey): (LessonData & { grade: string })[] {
  const startIdx = gradeOrder.indexOf(startGrade);
  const all: (LessonData & { grade: string })[] = [];
  for (let i = startIdx; i < gradeOrder.length; i++) {
    const gk = gradeOrder[i];
    if (gk === "pre-k") continue;
    const level = (lessonsData as any).levels[gk];
    const lessons: LessonData[] = level?.lessons || [];
    for (const l of lessons) all.push({ ...l, grade: gk });
  }
  return all;
}

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
  const initializedRef = useRef(false);

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
  const allRawLessons = buildAllLessons(gradeKey);

  // Determine status
  const hasLearn = (id: string) => progress.some((p) => p.lesson_id === id && p.section === "learn");
  const hasPractice = (id: string) => progress.some((p) => p.lesson_id === id && p.section === "practice" && p.score >= 60);

  let foundCurrent = false;
  const allLessons: LessonWithStatus[] = allRawLessons.map((lesson, idx) => {
    let status: LessonStatus;
    if (hasPractice(lesson.id)) {
      status = "completed";
    } else if (hasLearn(lesson.id)) {
      if (!foundCurrent) { foundCurrent = true; status = "started"; }
      else status = "started";
    } else if (!foundCurrent) {
      foundCurrent = true;
      status = "current";
    } else if (idx >= FREE_LESSON_COUNT && plan !== "premium") {
      status = "premium";
    } else {
      status = "locked";
    }
    return { ...lesson, status, globalIdx: idx };
  });

  // Group into sections
  const sectionMap = new Map<string, LessonWithStatus[]>();
  const sectionOrder: string[] = [];
  for (const lesson of allLessons) {
    const key = getSectionKey(lesson);
    if (!sectionMap.has(key)) { sectionMap.set(key, []); sectionOrder.push(key); }
    sectionMap.get(key)!.push(lesson);
  }

  const sections: Section[] = sectionOrder.map((key) => {
    const lessons = sectionMap.get(key)!;
    const meta = SECTION_META[key] || { name: key, icon: BookOpen };
    return {
      name: meta.name,
      icon: meta.icon,
      lessons,
      completedCount: lessons.filter((l) => l.status === "completed").length,
      startedCount: lessons.filter((l) => l.status === "started").length,
    };
  });

  // Auto-expand section with current lesson on first render
  const currentSectionIdx = sections.findIndex((s) =>
    s.lessons.some((l) => l.status === "current" || l.status === "started")
  );
  if (!initializedRef.current && currentSectionIdx >= 0) {
    initializedRef.current = true;
    expandedSections.add(sections[currentSectionIdx].name);
  }

  const completedCount = allLessons.filter((l) => l.status === "completed").length;
  const pct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-indigo-50/40">
      <div className="max-w-[640px] mx-auto py-6 px-4 space-y-4">
        {/* ── Progress Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{child.first_name}&apos;s Reading Journey</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{completedCount} of {allLessons.length} lessons</p>
            </div>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={`${pct * 0.94} 94`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{pct}%</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/80">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {child.streak_days || 0} day streak</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {child.carrots || 0} carrots</span>
          </div>
        </motion.div>

        {/* ── Sections ── */}
        {sections.map((section, sIdx) => {
          const expanded = expandedSections.has(section.name);
          const sectionPct = section.lessons.length > 0
            ? Math.round((section.completedCount / section.lessons.length) * 100)
            : 0;
          const hasCurrent = section.lessons.some((l) => l.status === "current" || l.status === "started");
          const allDone = section.completedCount === section.lessons.length;
          const SectionIcon = section.icon;

          return (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sIdx * 0.05 }}
              className="rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.name)}
                className="w-full text-left"
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={
                    hasCurrent || expanded
                      ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }
                      : allDone
                      ? { background: "linear-gradient(135deg, #059669, #10b981)" }
                      : undefined
                  }
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    hasCurrent || expanded || allDone
                      ? "bg-white/20"
                      : "bg-zinc-100"
                  }`}>
                    <SectionIcon className={`w-4.5 h-4.5 ${
                      hasCurrent || expanded || allDone ? "text-white" : "text-zinc-400"
                    }`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${
                      hasCurrent || expanded || allDone ? "text-white" : "text-zinc-900"
                    }`}>
                      {section.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                        hasCurrent || expanded || allDone ? "bg-white/20" : "bg-zinc-100"
                      }`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${sectionPct}%`,
                            backgroundColor: hasCurrent || expanded || allDone ? "white" : allDone ? "#10b981" : "#6366f1",
                          }}
                        />
                      </div>
                      <span className={`text-[11px] flex-shrink-0 font-medium ${
                        hasCurrent || expanded || allDone ? "text-white/80" : "text-zinc-400"
                      }`}>
                        {section.completedCount}/{section.lessons.length}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    hasCurrent || expanded || allDone ? "text-white/60" : "text-zinc-400"
                  } ${expanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Lesson list */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3">
                      <div className="relative ml-3">
                        {/* Progress rail */}
                        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full overflow-hidden">
                          {/* Filled portion */}
                          {(() => {
                            const doneCount = section.lessons.filter((l) =>
                              l.status === "completed" || l.status === "started"
                            ).length;
                            const fillPct = section.lessons.length > 0
                              ? (doneCount / section.lessons.length) * 100
                              : 0;
                            return (
                              <>
                                <div className="absolute inset-0 bg-zinc-100" />
                                <motion.div
                                  className="absolute top-0 left-0 right-0 bg-indigo-400 rounded-full"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${fillPct}%` }}
                                  transition={{ duration: 0.6, delay: 0.2 }}
                                />
                              </>
                            );
                          })()}
                        </div>

                        <div className="space-y-1 pl-6">
                          {section.lessons.map((lesson, lIdx) => (
                            <LessonRow
                              key={lesson.id}
                              lesson={lesson}
                              childId={childId!}
                              number={lIdx + 1}
                              delay={lIdx * 0.05}
                              prevTitle={lIdx > 0 ? section.lessons[lIdx - 1].title : null}
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

        {/* ── Review stub ── */}
        <div className="pt-2 pb-8">
          <button
            disabled
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-400 font-semibold text-sm cursor-not-allowed bg-white/60"
          >
            Review Mode — Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Lesson Row ────────────────────────────────────── */

function LessonRow({
  lesson,
  childId,
  number,
  delay,
  prevTitle,
}: {
  lesson: LessonWithStatus;
  childId: string;
  number: number;
  delay: number;
  prevTitle: string | null;
}) {
  const { status } = lesson;

  // Status node on the rail
  const node = {
    completed: (
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center">
        <CheckCircle2 className="w-3 h-3 text-white" />
      </div>
    ),
    started: (
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-amber-400 border-2 border-white shadow" />
    ),
    current: (
      <motion.div
        className="absolute -left-[11px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-600 border-[3px] border-white shadow-md flex items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Play className="w-2 h-2 text-white ml-[1px]" fill="white" />
      </motion.div>
    ),
    locked: (
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-zinc-200 border-2 border-white shadow" />
    ),
    premium: (
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-violet-300 border-2 border-white shadow" />
    ),
  }[status];

  const isClickable = status === "completed" || status === "current" || status === "started";
  const href = isClickable
    ? `/lesson?child=${childId}&lesson=${lesson.id}`
    : status === "premium"
    ? `/upgrade?child=${childId}`
    : "#";

  const row = (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`relative py-3 px-4 rounded-xl transition-all ${
        status === "current"
          ? "bg-indigo-50 border-2 border-indigo-300 shadow-md shadow-indigo-100"
          : status === "started"
          ? "bg-amber-50/60 border border-amber-200"
          : status === "completed"
          ? "hover:bg-zinc-50 border border-transparent"
          : "border border-transparent opacity-45"
      }`}
    >
      {/* Rail node */}
      {node}

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-tight ${
            status === "locked" || status === "premium" ? "text-zinc-400" : "text-zinc-900"
          }`}>
            {number}. {lesson.title}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{lesson.description}</p>
          {status === "locked" && prevTitle && (
            <p className="text-[10px] text-zinc-400 mt-1">
              Complete &ldquo;{prevTitle}&rdquo; to unlock
            </p>
          )}
        </div>

        {/* Action / badge */}
        {status === "current" && (
          <span className="flex-shrink-0 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
            Start
          </span>
        )}
        {status === "started" && (
          <span className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm">
            Continue
          </span>
        )}
        {status === "completed" && (
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}
        {status === "premium" && (
          <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-600">
            PRO
          </span>
        )}
        {status === "locked" && (
          <Lock className="w-4 h-4 text-zinc-300 flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );

  if (isClickable || status === "premium") {
    return <Link href={href}>{row}</Link>;
  }
  return row;
}
