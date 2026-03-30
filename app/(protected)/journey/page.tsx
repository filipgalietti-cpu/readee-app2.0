"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey, gradeOrder, type GradeKey } from "@/lib/assessment/questions";
import { usePlanStore } from "@/lib/stores/plan-store";
import lessonsData from "@/lib/data/lessons.json";
import {
  Flame, Carrot, ChevronDown, Play,
  BookOpen, Type, Newspaper, MessageCircle, BookMarked,
} from "lucide-react";

/* ── Solid SVG icons ───────────────────────────────── */

function CheckCircleSolid({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd"/>
    </svg>
  );
}

function LockSolid({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd"/>
    </svg>
  );
}

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

/* ── Constants ─────────────────────────────────────── */

const FREE_LESSON_COUNT = 5;

const GRADE_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

const SUBJECT_META: Record<string, { name: string; Icon: typeof BookOpen }> = {
  RF: { name: "Foundational Skills", Icon: Type },
  RL: { name: "Reading Literature", Icon: BookOpen },
  RI: { name: "Informational Text", Icon: Newspaper },
  L: { name: "Language", Icon: MessageCircle },
  story: { name: "Stories", Icon: BookMarked },
};

function getSubjectKey(lesson: LessonData): string {
  if (lesson.skill === "decodable_story" || lesson.skill === "reading") return "story";
  const std = lesson.standards?.[0] || "";
  return std.split(".")[0] || "story";
}

/* ── Build data ────────────────────────────────────── */

interface Subject {
  key: string;
  name: string;
  Icon: typeof BookOpen;
  lessons: LessonWithStatus[];
  completedCount: number;
}

interface GradeGroup {
  grade: string;
  label: string;
  subjects: Subject[];
  totalLessons: number;
  completedCount: number;
}

function buildAllLessons(startGrade: GradeKey): (LessonData & { grade: string })[] {
  const startIdx = gradeOrder.indexOf(startGrade);
  const all: (LessonData & { grade: string })[] = [];
  for (let i = startIdx; i < gradeOrder.length; i++) {
    const gk = gradeOrder[i];
    if (gk === "pre-k") continue;
    const level = (lessonsData as any).levels[gk];
    for (const l of (level?.lessons || []) as LessonData[]) all.push({ ...l, grade: gk });
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
  const [openGrades, setOpenGrades] = useState<Set<string> | null>(null);
  const [openSubjects, setOpenSubjects] = useState<Set<string> | null>(null);

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
  const allRaw = buildAllLessons(gradeKey);

  // Determine statuses
  const hasLearn = (id: string) => progress.some((p) => p.lesson_id === id && p.section === "learn");
  const hasPractice = (id: string) => progress.some((p) => p.lesson_id === id && p.section === "practice" && p.score >= 60);

  let foundCurrent = false;
  const allLessons: LessonWithStatus[] = allRaw.map((l, idx) => {
    let status: LessonStatus;
    if (hasPractice(l.id)) status = "completed";
    else if (hasLearn(l.id)) { if (!foundCurrent) foundCurrent = true; status = "started"; }
    else if (!foundCurrent) { foundCurrent = true; status = "current"; }
    else if (idx >= FREE_LESSON_COUNT && plan !== "premium") status = "premium";
    else status = "locked";
    return { ...l, status, globalIdx: idx };
  });

  // Group: grade → subjects → lessons
  const gradeGroups: GradeGroup[] = [];
  const gradeMap = new Map<string, LessonWithStatus[]>();
  for (const l of allLessons) {
    if (!gradeMap.has(l.grade)) gradeMap.set(l.grade, []);
    gradeMap.get(l.grade)!.push(l);
  }

  for (const [grade, lessons] of gradeMap) {
    const subjectMap = new Map<string, LessonWithStatus[]>();
    const subjectOrder: string[] = [];
    for (const l of lessons) {
      const sk = getSubjectKey(l);
      if (!subjectMap.has(sk)) { subjectMap.set(sk, []); subjectOrder.push(sk); }
      subjectMap.get(sk)!.push(l);
    }

    const subjects: Subject[] = subjectOrder.map((sk) => {
      const sLessons = subjectMap.get(sk)!;
      const meta = SUBJECT_META[sk] || { name: sk, Icon: BookOpen };
      return {
        key: `${grade}-${sk}`,
        name: meta.name,
        Icon: meta.Icon,
        lessons: sLessons,
        completedCount: sLessons.filter((l) => l.status === "completed").length,
      };
    });

    gradeGroups.push({
      grade,
      label: GRADE_LABELS[grade] || grade,
      subjects,
      totalLessons: lessons.length,
      completedCount: lessons.filter((l) => l.status === "completed").length,
    });
  }

  // Auto-open the grade + subject containing the current lesson (once)
  if (openGrades === null) {
    const initial = new Set<string>();
    const initialSubs = new Set<string>();
    const currentGrade = gradeGroups.find((g) =>
      g.subjects.some((s) => s.lessons.some((l) => l.status === "current" || l.status === "started"))
    );
    if (currentGrade) {
      initial.add(currentGrade.grade);
      const currentSubject = currentGrade.subjects.find((s) =>
        s.lessons.some((l) => l.status === "current" || l.status === "started")
      );
      if (currentSubject) initialSubs.add(currentSubject.key);
    }
    setOpenGrades(initial);
    setOpenSubjects(initialSubs);
    return null; // re-render with initialized state
  }

  const completedTotal = allLessons.filter((l) => l.status === "completed").length;
  const pct = allLessons.length > 0 ? Math.round((completedTotal / allLessons.length) * 100) : 0;

  const toggleGrade = (g: string) => setOpenGrades((prev) => {
    const next = new Set(prev || []);
    if (next.has(g)) next.delete(g); else next.add(g);
    return next;
  });

  const toggleSubject = (k: string) => setOpenSubjects((prev) => {
    const next = new Set(prev || []);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  return (
    <div className="min-h-screen">
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
              <p className="text-2xl font-extrabold text-white mt-0.5">{completedTotal} of {allLessons.length} lessons</p>
            </div>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={`${pct * 0.94} 94`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{pct}%</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/80">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {child.streak_days || 0} day streak</span>
            <span className="flex items-center gap-1"><Carrot className="w-3.5 h-3.5 text-orange-300" /> {child.carrots || 0} carrots</span>
          </div>
        </motion.div>

        {/* ── Grade Accordions ── */}
        {gradeGroups.map((gradeGroup, gIdx) => {
          const gradeOpen = openGrades?.has(gradeGroup.grade) ?? false;
          const gradePct = gradeGroup.totalLessons > 0
            ? Math.round((gradeGroup.completedCount / gradeGroup.totalLessons) * 100) : 0;
          const hasCurrent = gradeGroup.subjects.some((s) =>
            s.lessons.some((l) => l.status === "current" || l.status === "started")
          );
          const allDone = gradeGroup.completedCount === gradeGroup.totalLessons && gradeGroup.totalLessons > 0;

          return (
            <motion.div
              key={gradeGroup.grade}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.05 }}
              className="rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              {/* Grade header */}
              <button onClick={() => toggleGrade(gradeGroup.grade)} className="w-full text-left">
                <div
                  className="px-5 py-4 flex items-center gap-3 transition-colors"
                  style={
                    gradeOpen
                      ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }
                      : allDone
                      ? { background: "linear-gradient(135deg, #059669, #10b981)" }
                      : undefined
                  }
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold ${
                    gradeOpen || allDone ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                  }`}>
                    {allDone ? <CheckCircleSolid className="w-5 h-5 text-white" /> : gradeGroup.label.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${gradeOpen || allDone ? "text-white" : "text-zinc-900"}`}>
                      {gradeGroup.label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                        gradeOpen || allDone ? "bg-white/20" : "bg-zinc-100"
                      }`}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${gradePct}%`, backgroundColor: gradeOpen || allDone ? "white" : "#6366f1" }}
                        />
                      </div>
                      <span className={`text-[11px] font-medium flex-shrink-0 ${
                        gradeOpen || allDone ? "text-white/70" : "text-zinc-400"
                      }`}>
                        {gradeGroup.completedCount}/{gradeGroup.totalLessons}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    gradeOpen || allDone ? "text-white/60" : "text-zinc-400"
                  } ${gradeOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Subjects inside grade */}
              <AnimatePresence initial={false}>
                {gradeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 space-y-1">
                      {gradeGroup.subjects.map((subject) => {
                        const subOpen = openSubjects?.has(subject.key) ?? false;
                        const subPct = subject.lessons.length > 0
                          ? Math.round((subject.completedCount / subject.lessons.length) * 100) : 0;
                        const subDone = subject.completedCount === subject.lessons.length && subject.lessons.length > 0;
                        const subHasCurrent = subject.lessons.some((l) => l.status === "current" || l.status === "started");
                        const SIcon = subject.Icon;

                        return (
                          <div key={subject.key} className="rounded-xl overflow-hidden">
                            {/* Subject header */}
                            <button
                              onClick={() => toggleSubject(subject.key)}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors rounded-xl ${
                                subOpen ? "bg-indigo-50" : subDone ? "bg-emerald-50/50" : "hover:bg-zinc-50"
                              }`}
                            >
                              <SIcon className={`w-4 h-4 flex-shrink-0 ${
                                subDone ? "text-emerald-500" : subHasCurrent ? "text-indigo-500" : "text-zinc-400"
                              }`} strokeWidth={1.5} />
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-[13px] font-semibold text-zinc-800">{subject.name}</p>
                              </div>
                              <span className="text-[11px] text-zinc-400 font-medium flex-shrink-0 mr-1">
                                {subject.completedCount}/{subject.lessons.length}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                                subOpen ? "rotate-180" : ""
                              }`} />
                            </button>

                            {/* Lessons inside subject */}
                            <AnimatePresence initial={false}>
                              {subOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="relative ml-6 pl-5 py-1">
                                    {/* Progress rail */}
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full overflow-hidden">
                                      <div className="absolute inset-0 bg-zinc-100" />
                                      <motion.div
                                        className="absolute top-0 left-0 right-0 bg-indigo-400 rounded-full"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${subPct}%` }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      {subject.lessons.map((lesson, lIdx) => (
                                        <LessonRow
                                          key={lesson.id}
                                          lesson={lesson}
                                          childId={childId!}
                                          number={lIdx + 1}
                                          delay={lIdx * 0.04}
                                          prevTitle={lIdx > 0 ? subject.lessons[lIdx - 1].title : null}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}

/* ── Lesson Row ────────────────────────────────────── */

function LessonRow({
  lesson, childId, number, delay, prevTitle,
}: {
  lesson: LessonWithStatus;
  childId: string;
  number: number;
  delay: number;
  prevTitle: string | null;
}) {
  const { status } = lesson;

  const node = {
    completed: <div className="absolute -left-[19px] top-1/2 -translate-y-1/2"><CheckCircleSolid className="w-[14px] h-[14px] text-emerald-500" /></div>,
    started: <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-amber-400 border-2 border-white shadow" />,
    current: (
      <motion.div
        className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-indigo-600 border-[3px] border-white shadow-md flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Play className="w-[7px] h-[7px] text-white ml-[1px]" fill="white" />
      </motion.div>
    ),
    locked: <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-zinc-200 border-2 border-white" />,
    premium: <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-violet-300 border-2 border-white" />,
  }[status];

  const isClickable = status === "completed" || status === "current" || status === "started";
  const href = isClickable
    ? `/lesson?child=${childId}&lesson=${lesson.id}`
    : status === "premium" ? `/upgrade?child=${childId}` : "#";

  const row = (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`relative py-3 px-3 rounded-xl transition-all ${
        status === "current" ? "bg-indigo-50 border border-indigo-200 shadow-sm"
        : status === "started" ? "bg-amber-50/50 border border-amber-200/50"
        : status === "completed" ? "hover:bg-zinc-50"
        : "opacity-40"
      }`}
    >
      {node}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold leading-tight ${
            status === "locked" || status === "premium" ? "text-zinc-400" : "text-zinc-900"
          }`}>
            {number}. {lesson.title}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{lesson.description}</p>
          {status === "locked" && prevTitle && (
            <p className="text-[10px] text-zinc-300 mt-0.5">Complete &ldquo;{prevTitle}&rdquo; first</p>
          )}
        </div>
        {status === "current" && (
          <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-sm">Start</span>
        )}
        {status === "started" && (
          <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-bold shadow-sm">Continue</span>
        )}
        {status === "completed" && <CheckCircleSolid className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
        {status === "premium" && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-600">PRO</span>
        )}
        {status === "locked" && <LockSolid className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />}
      </div>
    </motion.div>
  );

  if (isClickable || status === "premium") return <Link href={href}>{row}</Link>;
  return row;
}
