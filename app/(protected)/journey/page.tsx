"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { usePlanStore } from "@/lib/stores/plan-store";
import { getLimits } from "@/lib/plan/limits";
import sampleLessons from "@/app/data/sample-lessons.json";
import Image from "next/image";
import {
  Flame, Carrot, ChevronDown, Play,
  BookOpen, Type, Newspaper, MessageCircle,
} from "lucide-react";

const GRADE_BADGES: Record<string, string> = {
  kindergarten: "/images/ui/grades/grade-k.png",
  "1st": "/images/ui/grades/grade-1.png",
  "2nd": "/images/ui/grades/grade-2.png",
  "3rd": "/images/ui/grades/grade-3.png",
  "4th": "/images/ui/grades/grade-4.png",
};
import { PaywallModal } from "@/app/_components/PaywallModal";

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

interface SampleLesson {
  standardId: string;
  grade: string;
  domain: string;
  title: string;
  slides: any[];
}

interface ProgressRecord {
  standard_id: string;
  questions_correct: number;
  questions_attempted: number;
}

interface LessonProgressRecord {
  lesson_id: string;
  section: string;
  score: number;
}

type LessonStatus = "completed" | "started" | "current" | "locked" | "premium";

interface LessonWithStatus extends SampleLesson {
  status: LessonStatus;
  idx: number;
}

interface DomainGroup {
  domain: string;
  Icon: typeof BookOpen;
  lessons: LessonWithStatus[];
  completedCount: number;
}

interface GradeGroup {
  grade: string;
  domains: DomainGroup[];
  totalLessons: number;
  completedCount: number;
}

/* ── Constants ─────────────────────────────────────── */

// FREE_LESSON_COUNT now comes from getLimits()

const DOMAIN_ICONS: Record<string, typeof BookOpen> = {
  "Reading Literature": BookOpen,
  "Reading Informational Text": Newspaper,
  "Foundational Skills": Type,
  "Language": MessageCircle,
};

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
  const [practiceProgress, setPracticeProgress] = useState<ProgressRecord[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGrades, setOpenGrades] = useState<Set<string> | null>(null);
  const [openDomains, setOpenDomains] = useState<Set<string> | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const [childRes, practiceRes, lessonRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase.from("practice_results").select("standard_id, questions_correct, questions_attempted").eq("child_id", childId),
        supabase.from("lessons_progress").select("lesson_id, section, score").eq("child_id", childId),
      ]);
      if (childRes.data) setChild(childRes.data as Child);
      if (practiceRes.data) setPracticeProgress(practiceRes.data as ProgressRecord[]);
      if (lessonRes.data) setLessonProgress(lessonRes.data as LessonProgressRecord[]);
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

  const allLessons = sampleLessons as SampleLesson[];

  // Check completion: practice_results has standard_id with good score, OR lessons_progress
  const hasCompleted = (standardId: string) =>
    practiceProgress.some((p) => p.standard_id === standardId && p.questions_correct >= 3) ||
    lessonProgress.some((p) => p.lesson_id === standardId && p.section === "practice" && p.score >= 60);
  const hasStarted = (standardId: string) =>
    lessonProgress.some((p) => p.lesson_id === standardId && p.section === "learn");

  // Assign statuses
  let foundCurrent = false;
  const lessonsWithStatus: LessonWithStatus[] = allLessons.map((lesson, idx) => {
    let status: LessonStatus;
    if (hasCompleted(lesson.standardId)) {
      status = "completed";
    } else if (hasStarted(lesson.standardId)) {
      if (!foundCurrent) foundCurrent = true;
      status = "started";
    } else if (!foundCurrent) {
      foundCurrent = true;
      status = "current";
    } else if (idx >= getLimits(plan).lessons && plan !== "premium") {
      status = "premium";
    } else {
      status = "locked";
    }
    return { ...lesson, status, idx };
  });

  // Group by grade → domain
  const gradeMap = new Map<string, LessonWithStatus[]>();
  const gradeOrder: string[] = [];
  for (const l of lessonsWithStatus) {
    if (!gradeMap.has(l.grade)) { gradeMap.set(l.grade, []); gradeOrder.push(l.grade); }
    gradeMap.get(l.grade)!.push(l);
  }

  const gradeGroups: GradeGroup[] = gradeOrder.map((grade) => {
    const lessons = gradeMap.get(grade)!;
    const domainMap = new Map<string, LessonWithStatus[]>();
    const domainOrder: string[] = [];
    for (const l of lessons) {
      if (!domainMap.has(l.domain)) { domainMap.set(l.domain, []); domainOrder.push(l.domain); }
      domainMap.get(l.domain)!.push(l);
    }
    const domains: DomainGroup[] = domainOrder.map((domain) => {
      const dLessons = domainMap.get(domain)!;
      return {
        domain,
        Icon: DOMAIN_ICONS[domain] || BookOpen,
        lessons: dLessons,
        completedCount: dLessons.filter((l) => l.status === "completed").length,
      };
    });
    return {
      grade,
      domains,
      totalLessons: lessons.length,
      completedCount: lessons.filter((l) => l.status === "completed").length,
    };
  });

  // Auto-open on first render
  if (openGrades === null) {
    const initGrades = new Set<string>();
    const initDomains = new Set<string>();
    const currentGrade = gradeGroups.find((g) =>
      g.domains.some((d) => d.lessons.some((l) => l.status === "current" || l.status === "started"))
    );
    if (currentGrade) {
      initGrades.add(currentGrade.grade);
      const currentDomain = currentGrade.domains.find((d) =>
        d.lessons.some((l) => l.status === "current" || l.status === "started")
      );
      if (currentDomain) initDomains.add(`${currentGrade.grade}-${currentDomain.domain}`);
    }
    setOpenGrades(initGrades);
    setOpenDomains(initDomains);
    return null;
  }

  const completedTotal = lessonsWithStatus.filter((l) => l.status === "completed").length;
  const pct = lessonsWithStatus.length > 0 ? Math.round((completedTotal / lessonsWithStatus.length) * 100) : 0;

  const toggle = (set: Set<string> | null, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set || []);
    if (next.has(key)) next.delete(key); else next.add(key);
    setter(next);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[640px] mx-auto py-6 px-4 space-y-3">
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
              <p className="text-2xl font-extrabold text-white mt-0.5">{completedTotal} of {lessonsWithStatus.length} lessons</p>
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

        <PaywallModal
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
          childId={childId}
          childName={child.first_name}
          trigger="lesson"
        />

        {/* ── Grade Accordions ── */}
        {gradeGroups.map((gg, gIdx) => {
          const gradeOpen = openGrades?.has(gg.grade) ?? false;
          const gradePct = gg.totalLessons > 0 ? Math.round((gg.completedCount / gg.totalLessons) * 100) : 0;
          const allDone = gg.completedCount === gg.totalLessons && gg.totalLessons > 0;

          return (
            <motion.div
              key={gg.grade}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.04 }}
              className="rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              {/* Grade header */}
              <button
                onClick={() => toggle(openGrades, setOpenGrades, gg.grade)}
                className="w-full text-left"
              >
                <div className={`px-5 py-4 flex items-center gap-3 transition-colors ${
                  gradeOpen ? "bg-gradient-to-r from-indigo-600 to-violet-500" : allDone ? "bg-gradient-to-r from-emerald-600 to-emerald-500" : ""
                }`}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    {allDone ? (
                      <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircleSolid className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <Image
                        src={GRADE_BADGES[gg.grade] || ""}
                        alt={gg.grade}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${gradeOpen || allDone ? "text-white" : "text-zinc-900"}`}>
                      {gg.grade}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                        gradeOpen || allDone ? "bg-white/20" : "bg-zinc-100"
                      }`}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${gradePct}%`, backgroundColor: gradeOpen || allDone ? "white" : "#6366f1" }} />
                      </div>
                      <span className={`text-[11px] font-medium flex-shrink-0 ${
                        gradeOpen || allDone ? "text-white/70" : "text-zinc-400"
                      }`}>{gg.completedCount}/{gg.totalLessons}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    gradeOpen || allDone ? "text-white/60" : "text-zinc-400"
                  } ${gradeOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Domains */}
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
                      {gg.domains.map((domain) => {
                        const domainKey = `${gg.grade}-${domain.domain}`;
                        const domOpen = openDomains?.has(domainKey) ?? false;
                        const domPct = domain.lessons.length > 0
                          ? Math.round((domain.completedCount / domain.lessons.length) * 100) : 0;
                        const domDone = domain.completedCount === domain.lessons.length;
                        const domHasCurrent = domain.lessons.some((l) => l.status === "current" || l.status === "started");
                        const DIcon = domain.Icon;

                        return (
                          <div key={domainKey} className="rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggle(openDomains, setOpenDomains, domainKey)}
                              className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-colors ${
                                domOpen ? "bg-indigo-50" : domDone ? "bg-emerald-50/50" : "hover:bg-zinc-50"
                              }`}
                            >
                              <DIcon className={`w-4 h-4 flex-shrink-0 ${
                                domDone ? "text-emerald-500" : domHasCurrent ? "text-indigo-500" : "text-zinc-400"
                              }`} strokeWidth={1.5} />
                              <p className="flex-1 text-left text-[13px] font-semibold text-zinc-800">{domain.domain}</p>
                              <span className="text-[11px] text-zinc-400 font-medium mr-1">{domain.completedCount}/{domain.lessons.length}</span>
                              <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${domOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence initial={false}>
                              {domOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="relative ml-4 pl-7 py-1">
                                    {/* Progress rail — centered at left-[11px] to align with node centers */}
                                    <div className="absolute left-[10px] top-2 bottom-2 w-[2px] rounded-full overflow-hidden">
                                      <div className="absolute inset-0 bg-zinc-200" />
                                      <motion.div
                                        className="absolute top-0 left-0 right-0 bg-indigo-400 rounded-full"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${domPct}%` }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      {domain.lessons.map((lesson, lIdx) => (
                                        <LessonRow
                                          key={lesson.standardId}
                                          lesson={lesson}
                                          childId={childId!}
                                          number={lIdx + 1}
                                          delay={lIdx * 0.03}
                                          prevTitle={lIdx > 0 ? domain.lessons[lIdx - 1].title : null}
                                          onPaywall={() => setShowPaywall(true)}
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
  lesson, childId, number, delay, prevTitle, onPaywall,
}: {
  lesson: LessonWithStatus;
  childId: string;
  number: number;
  delay: number;
  prevTitle: string | null;
  onPaywall?: () => void;
}) {
  const { status } = lesson;

  // All nodes centered at the rail (parent pl-7 = 28px, rail at left-[10px] = center at 11px)
  // Node center should be at -17px from content left (28px - 11px = 17px)
  const nodeBase = "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full";
  const nodeLeft = "left-[-17px]";

  const node = {
    completed: <div className={`${nodeBase} ${nodeLeft}`}><CheckCircleSolid className="w-[14px] h-[14px] text-emerald-500" /></div>,
    started: <div className={`${nodeBase} ${nodeLeft} w-[10px] h-[10px] rounded-full bg-amber-400 border-2 border-white shadow`} />,
    current: (
      <motion.div
        className={`${nodeBase} ${nodeLeft} w-[16px] h-[16px] rounded-full bg-indigo-600 border-[3px] border-white shadow-md flex items-center justify-center`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Play className="w-[7px] h-[7px] text-white ml-[1px]" fill="white" />
      </motion.div>
    ),
    locked: <div className={`${nodeBase} ${nodeLeft} w-[10px] h-[10px] rounded-full bg-zinc-200 border-2 border-white`} />,
    premium: <div className={`${nodeBase} ${nodeLeft} w-[10px] h-[10px] rounded-full bg-violet-300 border-2 border-white`} />,
  }[status];

  const isClickable = status === "completed" || status === "current" || status === "started";
  const href = isClickable
    ? `/learn?child=${childId}&standard=${lesson.standardId}`
    : "#";

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
          <p className="text-[11px] text-zinc-400 mt-0.5">{lesson.standardId}</p>
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

  if (isClickable) return <Link href={href}>{row}</Link>;
  if (status === "premium") return <div onClick={onPaywall} className="cursor-pointer">{row}</div>;
  return row;
}
