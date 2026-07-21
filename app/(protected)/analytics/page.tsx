"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { staggerContainer, slideUp, fadeUp } from "@/lib/motion/variants";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";
import { getAllStandards as fetchAllStandards, getStandardsForGrade } from "@/lib/data/all-standards";
import type { SnapshotFacts } from "@/lib/ai/build-parent-snapshot";
import { gradeToKey } from "@/lib/assessment/questions";
import { useChildStore } from "@/lib/stores/child-store";
import { usePlanStore } from "@/lib/stores/plan-store";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import { BookOpen, Newspaper, Type, MessageCircle, BarChart3, Sparkles, Lock, Check, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SkeletonPage } from "@/app/_components/Skeleton";

/* ─── Types ──────────────────────────────────────────── */

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip?: string;
  questions: { id: string }[];
}

interface PracticeResult {
  id: string;
  child_id: string;
  standard_id: string;
  questions_attempted: number;
  questions_correct: number;
  carrots_earned: number;
  completed_at: string;
}

interface StandardStat {
  standard_id: string;
  name: string;
  domain: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

type DateRange = "week" | "month" | "all";
type Tab = "overview" | "report" | "map";
type Status = "mastered" | "practicing" | "help" | "none";

/* ─── Constants ──────────────────────────────────────── */

const DOMAIN_META: Record<string, { icon: LucideIcon; accent: string; iconBg: string; iconStroke: string; subtitle: string; label: string }> = {
  "Foundational Skills":        { icon: Type,          accent: "#059669", iconBg: "#d1fae5", iconStroke: "#059669", subtitle: "Letters, sounds, phonics",    label: "Foundational Skills" },
  "Reading Literature":         { icon: BookOpen,      accent: "#7c3aed", iconBg: "#ede9fe", iconStroke: "#8b5cf6", subtitle: "Stories, characters, retelling", label: "Reading Literature" },
  "Language":                   { icon: MessageCircle, accent: "#b45309", iconBg: "#fef3c7", iconStroke: "#f59e0b", subtitle: "Grammar, vocabulary",         label: "Language" },
  "Reading Informational Text": { icon: Newspaper,     accent: "#2563eb", iconBg: "#dbeafe", iconStroke: "#2563eb", subtitle: "Nonfiction, main idea",       label: "Informational Text" },
};

const DOMAIN_ORDER = ["Foundational Skills", "Reading Literature", "Language", "Reading Informational Text"];

const STATUS_META: Record<Status, { fill: string; dot: string; label: string }> = {
  mastered:   { fill: "#10b981", dot: "#059669", label: "Mastered" },
  practicing: { fill: "#818cf8", dot: "#6366f1", label: "Practicing" },
  help:       { fill: "#f59e0b", dot: "#b45309", label: "Needs help" },
  none:       { fill: "#f4f4f5", dot: "#a1a1aa", label: "Not started" },
};

const CARD = "1px solid #e4e4e7";

/* ─── Helpers ────────────────────────────────────────── */

function shortName(desc: string): string {
  const cleaned = desc
    .replace(/^With prompting and support, /i, "")
    .replace(/^Demonstrate understanding of /i, "")
    .replace(/^Demonstrate command of the conventions of standard English /i, "")
    .replace(/^Demonstrate basic knowledge of /i, "")
    .replace(/^Recognize and name /i, "")
    .replace(/^Know and apply /i, "");
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 48 ? capped.slice(0, 45) + "..." : capped;
}

function displayGrade(grade: string | null | undefined): string {
  if (!grade) return "Kindergarten";
  if (grade.toLowerCase() === "pre-k") return "Pre-K";
  return grade;
}

function getDateCutoff(range: DateRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "week") {
    now.setDate(now.getDate() - 7);
    return now;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Monday 00:00 of the week containing `d`. */
function getMonday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 = Sun
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function statsOf(results: PracticeResult[]) {
  const attempted = results.reduce((s, r) => s + r.questions_attempted, 0);
  const correct = results.reduce((s, r) => s + r.questions_correct, 0);
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const days = new Set(results.map((r) => new Date(r.completed_at).toDateString())).size;
  const skills = new Set(results.map((r) => r.standard_id)).size;
  return { attempted, correct, accuracy, days, skills };
}

function computeStandardStats(
  results: PracticeResult[],
  nameMap: Record<string, string>,
  domainMap: Record<string, string>,
): StandardStat[] {
  const map: Record<string, { attempted: number; correct: number }> = {};
  for (const r of results) {
    if (!map[r.standard_id]) map[r.standard_id] = { attempted: 0, correct: 0 };
    map[r.standard_id].attempted += r.questions_attempted;
    map[r.standard_id].correct += r.questions_correct;
  }
  return Object.entries(map).map(([id, s]) => ({
    standard_id: id,
    name: nameMap[id] || id,
    domain: domainMap[id] || "Unknown",
    attempted: s.attempted,
    correct: s.correct,
    accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
  }));
}

function skillStatus(attempted: number, accuracy: number): Status {
  if (attempted === 0) return "none";
  if (accuracy >= 80) return "mastered";
  if (accuracy < 60) return "help";
  return "practicing";
}

interface SeriesPoint { label: string; accuracy: number; attempted: number }

/** Bucket results into an accuracy series: by day for "week", by week otherwise. */
function buildAccuracySeries(results: PracticeResult[], range: DateRange): SeriesPoint[] {
  const buckets = new Map<string, { order: number; label: string; attempted: number; correct: number }>();
  for (const r of results) {
    const d = new Date(r.completed_at);
    let key: string, order: number, label: string;
    if (range === "week") {
      key = d.toDateString();
      order = d.getTime();
      label = d.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      const m = getMonday(d);
      key = m.toDateString();
      order = m.getTime();
      label = m.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    const b = buckets.get(key) || { order, label, attempted: 0, correct: 0 };
    b.attempted += r.questions_attempted;
    b.correct += r.questions_correct;
    buckets.set(key, b);
  }
  return [...buckets.values()]
    .sort((a, b) => a.order - b.order)
    .map((b) => ({ label: b.label, accuracy: b.attempted > 0 ? Math.round((b.correct / b.attempted) * 100) : 0, attempted: b.attempted }));
}

/** Weekly question totals, most recent up to 7 weeks. */
function buildWeeklyVolume(results: PracticeResult[]) {
  const map = new Map<string, { order: number; label: string; count: number }>();
  for (const r of results) {
    const m = getMonday(new Date(r.completed_at));
    const key = m.toDateString();
    const b = map.get(key) || { order: m.getTime(), label: m.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: 0 };
    b.count += r.questions_attempted;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => a.order - b.order).slice(-7);
}

/* ═══════════════════════════════════════════════════════ */
/*  Page                                                   */
/* ═══════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AnalyticsLoader />
    </Suspense>
  );
}

function Spinner() {
  return <SkeletonPage cards={4} />;
}

function AnalyticsLoader() {
  const params = useSearchParams();
  const router = useRouter();
  const childIdParam = params.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      let resolvedId = childIdParam;

      if (!resolvedId) {
        const store = useChildStore.getState();
        const storeChild = store.childData || store.children[0] || null;
        if (storeChild) {
          resolvedId = storeChild.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: children } = await supabase
              .from("children")
              .select("*")
              .eq("parent_id", user.id)
              .order("created_at", { ascending: true })
              .limit(1);
            if (children && children.length > 0) {
              resolvedId = children[0].id;
            }
          }
        }
      }

      if (!resolvedId) { setLoading(false); return; }

      if (!childIdParam && resolvedId) {
        window.history.replaceState(null, "", `/analytics?child=${resolvedId}`);
      }

      const { data } = await supabase.from("children").select("*").eq("id", resolvedId).single();
      if (data) setChild(safeValidate(ChildSchema, data) as Child);
      setLoading(false);
    }
    load();
  }, [childIdParam]);

  if (loading) return <Spinner />;

  if (!child) {
    router.replace("/dashboard");
    return <Spinner />;
  }

  return <AnalyticsDashboard child={child} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Analytics Dashboard                                    */
/* ═══════════════════════════════════════════════════════ */

function AnalyticsDashboard({ child }: { child: Child }) {
  const allStandards = useMemo(() => fetchAllStandards() as Standard[], []);
  const gradeKey = useMemo(() => gradeToKey(child.grade), [child.grade]);
  const gradeStandards = useMemo(() => getStandardsForGrade(gradeKey) as Standard[], [gradeKey]);
  const gradeStandardCount = gradeStandards.length;

  const [tab, setTab] = useState<Tab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const rawPlan = usePlanStore((s) => s.plan);
  const userPlan = rawPlan ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);
  const isFree = rawPlan !== null && userPlan !== "premium";

  const storeChildren = useChildStore((s) => s.children);
  const childIndex = storeChildren.findIndex((c) => c.id === child.id);
  const avatarSrc = getChildAvatarImage(child, childIndex === -1 ? 0 : childIndex);

  const standardNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of allStandards) map[s.standard_id] = shortName(s.standard_description);
    return map;
  }, [allStandards]);

  const standardDomainMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of allStandards) map[s.standard_id] = s.domain;
    return map;
  }, [allStandards]);

  // Fetch practice results + user plan
  useEffect(() => {
    async function fetchResults() {
      const supabase = supabaseBrowser();
      fetchPlan();
      const { data } = await supabase
        .from("practice_results")
        .select("*")
        .eq("child_id", child.id)
        .order("completed_at", { ascending: false });
      setPracticeResults((data as PracticeResult[]) || []);
      setLoadingData(false);
    }
    fetchResults();
  }, [child.id, fetchPlan]);

  /* ── Overview range stats ── */
  const filteredResults = useMemo(() => {
    const cutoff = getDateCutoff(dateRange);
    if (!cutoff) return practiceResults;
    return practiceResults.filter((r) => new Date(r.completed_at) >= cutoff);
  }, [practiceResults, dateRange]);

  const prevRangeResults = useMemo(() => {
    if (dateRange === "all") return null;
    const now = new Date();
    let start: Date, end: Date;
    if (dateRange === "week") {
      end = new Date(now); end.setDate(end.getDate() - 7);
      start = new Date(now); start.setDate(start.getDate() - 14);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return practiceResults.filter((r) => {
      const t = new Date(r.completed_at);
      return t >= start && t < end;
    });
  }, [practiceResults, dateRange]);

  const totals = useMemo(() => statsOf(filteredResults), [filteredResults]);
  const prevTotals = useMemo(() => (prevRangeResults ? statsOf(prevRangeResults) : null), [prevRangeResults]);

  const rangeStandardStats = useMemo(
    () => computeStandardStats(filteredResults, standardNameMap, standardDomainMap),
    [filteredResults, standardNameMap, standardDomainMap],
  );

  const skillsPracticedInRange = useMemo(
    () => new Set(filteredResults.map((r) => r.standard_id)).size,
    [filteredResults],
  );

  // Snapshot: top-2 "doing well" and bottom-2 "needs help" by accuracy (with attempts)
  const { doingWell, needsHelp } = useMemo(() => {
    const withData = rangeStandardStats.filter((s) => s.attempted > 0);
    const byAcc = [...withData].sort((a, b) => b.accuracy - a.accuracy);
    return { doingWell: byAcc.slice(0, 2), needsHelp: [...byAcc].reverse().slice(0, 2) };
  }, [rangeStandardStats]);

  const worstRangeSkill = needsHelp[0];

  // Accuracy-over-time series
  const accuracySeries = useMemo(() => buildAccuracySeries(filteredResults, dateRange), [filteredResults, dateRange]);

  /* ── Last-7-days summary (banner + premium insight) ── */
  const last7 = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - 7);
    const rs = practiceResults.filter((r) => new Date(r.completed_at) >= start);
    return { ...statsOf(rs), stats: computeStandardStats(rs, standardNameMap, standardDomainMap) };
  }, [practiceResults, standardNameMap, standardDomainMap]);

  const insightBest = useMemo(() => {
    const withData = last7.stats.filter((s) => s.attempted > 0);
    return [...withData].sort((a, b) => b.accuracy - a.accuracy)[0];
  }, [last7]);
  const insightWorst = useMemo(() => {
    const withData = last7.stats.filter((s) => s.attempted > 0);
    return [...withData].sort((a, b) => a.accuracy - b.accuracy)[0];
  }, [last7]);

  /* ── All-time per-standard stats (skill map) ── */
  const allTimeStdStats = useMemo(() => {
    const map: Record<string, { attempted: number; correct: number }> = {};
    for (const r of practiceResults) {
      if (!map[r.standard_id]) map[r.standard_id] = { attempted: 0, correct: 0 };
      map[r.standard_id].attempted += r.questions_attempted;
      map[r.standard_id].correct += r.questions_correct;
    }
    return map;
  }, [practiceResults]);

  const totalGradeSkillsPracticed = useMemo(() => {
    return gradeStandards.filter((s) => (allTimeStdStats[s.standard_id]?.attempted ?? 0) > 0).length;
  }, [gradeStandards, allTimeStdStats]);

  /* ── Grade-level standing — computed from real performance on the child's
     grade standards (accuracy + breadth), not a placement guess. Null until
     there's enough signal (≥3 grade standards with ≥4 questions each). ── */
  const gradeStanding = useMemo(() => {
    const stats = gradeStandards
      .map((s) => allTimeStdStats[s.standard_id])
      .filter((st): st is { attempted: number; correct: number } => !!st && st.attempted >= 4);
    if (stats.length < 3) return null;
    const attempted = stats.reduce((n, st) => n + st.attempted, 0);
    const correct = stats.reduce((n, st) => n + st.correct, 0);
    const acc = attempted > 0 ? correct / attempted : 0;
    const breadth = stats.length / Math.max(1, gradeStandards.length);
    if (acc >= 0.85 && breadth >= 0.25) return { phrase: "reading above grade level", short: "Above grade", color: "#059669", bg: "#ecfdf5" };
    if (acc >= 0.65) return { phrase: "reading on grade level", short: "On grade", color: "#4338ca", bg: "#eef2ff" };
    return { phrase: "building toward grade level", short: "Building toward grade", color: "#b45309", bg: "#fffbeb" };
  }, [gradeStandards, allTimeStdStats]);

  /* ── AI flash-snapshot (premium) — a warm 2-sentence headline + one action,
     generated by Gemini from the deterministic facts below and cached per child
     for the day. Falls back to the static template line while loading / on any
     failure, so the card is never blank. ── */
  const accuracyTrend = useMemo<"up" | "down" | "flat" | null>(() => {
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d14 = new Date(now); d14.setDate(d14.getDate() - 14);
    const cur = statsOf(practiceResults.filter((r) => new Date(r.completed_at) >= d7));
    const prev = statsOf(practiceResults.filter((r) => {
      const t = new Date(r.completed_at);
      return t >= d14 && t < d7;
    }));
    if (cur.attempted < 3 || prev.attempted < 3) return null;
    const diff = cur.accuracy - prev.accuracy;
    return diff > 4 ? "up" : diff < -4 ? "down" : "flat";
  }, [practiceResults]);

  const snapshotFacts = useMemo<SnapshotFacts>(() => ({
    firstName: child.first_name,
    gradeLabel: displayGrade(child.grade),
    standing: gradeStanding?.phrase ?? null,
    questionsThisWeek: last7.attempted,
    accuracyThisWeek: last7.attempted > 0 ? last7.accuracy : null,
    daysThisWeek: last7.days,
    streak: child.streak_days,
    bestStreak: Math.max(child.best_streak ?? 0, child.streak_days),
    strongestSkill: insightBest?.name ?? null,
    weakestSkill: insightWorst && (!insightBest || insightWorst.standard_id !== insightBest.standard_id) ? insightWorst.name : null,
    trend: accuracyTrend,
  }), [child, gradeStanding, last7, insightBest, insightWorst, accuracyTrend]);

  const [aiSnapshot, setAiSnapshot] = useState<{ headline: string; action: string } | null>(null);
  const [snapLoading, setSnapLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Only spend a model call for premium parents with at least a little signal.
      if (isFree || last7.attempted < 3) { if (!cancelled) setAiSnapshot(null); return; }
      setSnapLoading(true);
      try {
        const r = await fetch("/api/analytics/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId: child.id, facts: snapshotFacts }),
        });
        const data = r.ok ? await r.json() : null;
        if (!cancelled) setAiSnapshot(data?.snapshot ?? null);
      } catch {
        if (!cancelled) setAiSnapshot(null);
      } finally {
        if (!cancelled) setSnapLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isFree, child.id, snapshotFacts, last7.attempted]);

  const weeklyVolume = useMemo(() => buildWeeklyVolume(practiceResults), [practiceResults]);

  /* ── Report card week window ── */
  const [weekOffset, setWeekOffset] = useState(0);
  const reportWeek = useMemo(() => {
    const start = getMonday(new Date());
    start.setDate(start.getDate() - weekOffset * 7);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const prevStart = new Date(start); prevStart.setDate(start.getDate() - 7);
    return { start, end, prevStart, nowMs: new Date().getTime() };
  }, [weekOffset]);

  const weekResults = useMemo(
    () => practiceResults.filter((r) => {
      const t = new Date(r.completed_at);
      return t >= reportWeek.start && t < reportWeek.end;
    }),
    [practiceResults, reportWeek],
  );
  const prevWeekResults = useMemo(
    () => practiceResults.filter((r) => {
      const t = new Date(r.completed_at);
      return t >= reportWeek.prevStart && t < reportWeek.start;
    }),
    [practiceResults, reportWeek],
  );
  const weekTotals = useMemo(() => statsOf(weekResults), [weekResults]);
  const prevWeekTotals = useMemo(() => statsOf(prevWeekResults), [prevWeekResults]);

  const weekStdStats = useMemo(
    () => computeStandardStats(weekResults, standardNameMap, standardDomainMap),
    [weekResults, standardNameMap, standardDomainMap],
  );

  // Per-domain totals for the report's subject rows (week window)
  const weekDomainStats = useMemo(() => {
    const map: Record<string, { attempted: number; correct: number }> = {};
    for (const r of weekResults) {
      const dom = standardDomainMap[r.standard_id] || "Unknown";
      if (!map[dom]) map[dom] = { attempted: 0, correct: 0 };
      map[dom].attempted += r.questions_attempted;
      map[dom].correct += r.questions_correct;
    }
    return map;
  }, [weekResults, standardDomainMap]);

  const weekBest = useMemo(() => [...weekStdStats].filter((s) => s.attempted > 0).sort((a, b) => b.accuracy - a.accuracy)[0], [weekStdStats]);
  const weekWorst = useMemo(() => [...weekStdStats].filter((s) => s.attempted > 0).sort((a, b) => a.accuracy - b.accuracy)[0], [weekStdStats]);

  const [emailWeekly, setEmailWeekly] = useState(false); // TODO(analytics): not persisted to any backend preference

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  if (loadingData) return <Spinner />;

  const hasData = practiceResults.length > 0;

  /* ── No-data empty state ── */
  if (!hasData) {
    return (
      <motion.div className="max-w-lg mx-auto pb-20 px-4 pt-8 text-center" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={slideUp}>
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4"><img src={avatarSrc} alt={child.first_name} className="w-full h-full object-cover" draggable={false} /></div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {child.first_name}&apos;s progress
          </h1>
          <p className="text-zinc-500 mb-8">
            {displayGrade(child.grade)}{child.reading_level ? ` · ${child.reading_level}` : ""}
          </p>
        </motion.div>
        <motion.div variants={slideUp} className="rounded-[20px] p-8 shadow-sm" style={{ border: CARD, background: "#fff" }}>
          <Rocket className="w-12 h-12 text-violet-500 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Ready to get started?</h2>
          <p className="text-sm text-zinc-500 mb-6">Complete your first practice session to see progress, strengths, and areas to grow!</p>
          <Link href={`/practice?child=${child.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-sm hover:from-violet-700 hover:to-violet-600 transition-all shadow-md hover:shadow-lg hover:scale-105">
            Start Practice →
          </Link>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-6">
          <Link href="/dashboard" className="text-sm text-violet-600 hover:text-violet-700 font-medium">&larr; Back to Dashboard</Link>
        </motion.div>
      </motion.div>
    );
  }

  const tabBtn = (key: Tab, label: string) => {
    const on = tab === key;
    return (
      <button
        key={key}
        onClick={() => setTab(key)}
        style={{
          border: "none", borderBottom: `2px solid ${on ? "#7c3aed" : "transparent"}`,
          background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14,
          padding: "10px 2px", marginBottom: -1, whiteSpace: "nowrap",
          fontWeight: on ? 700 : 600, color: on ? "#6d28d9" : "#71717a",
        }}
      >
        {label}
      </button>
    );
  };

  const rangeBtn = (key: DateRange, label: string) => {
    const on = dateRange === key;
    return (
      <button
        key={key}
        onClick={() => setDateRange(key)}
        style={{
          border: "none", cursor: "pointer", fontFamily: "inherit", padding: "7px 16px",
          borderRadius: 8, fontSize: 13, whiteSpace: "nowrap",
          fontWeight: on ? 600 : 500,
          background: on ? "#fff" : "transparent",
          color: on ? "#6d28d9" : "#71717a",
          boxShadow: on ? "0 1px 2px rgba(0,0,0,.06)" : "none",
        }}
      >
        {label}
      </button>
    );
  };

  const rangeWord = dateRange === "week" ? "this week" : dateRange === "month" ? "this month" : "all time";
  const qDelta = prevTotals ? totals.attempted - prevTotals.attempted : null;
  const accDelta = prevTotals ? totals.accuracy - prevTotals.accuracy : null;

  return (
    <div className="pb-20 px-4 sm:px-6" style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ede9fe", overflow: "hidden", flexShrink: 0 }}>
          <img src={avatarSrc} alt={child.first_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", color: "#18181b", lineHeight: 1.2 }}>
            {child.first_name}&apos;s progress
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 14, color: "#71717a" }}>
            {displayGrade(child.grade)}{child.reading_level ? ` · ${child.reading_level}` : ""}
          </p>
        </div>
        {gradeStanding && (
          <div style={{ flexShrink: 0, whiteSpace: "nowrap", background: gradeStanding.bg, color: gradeStanding.color, fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>
            {gradeStanding.short}
          </div>
        )}
        {child.streak_days > 0 && (
          <div style={{ flexShrink: 0, whiteSpace: "nowrap", background: "#d1fae5", color: "#059669", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>
            {child.streak_days}-day streak
          </div>
        )}
        <Link href="/dashboard" className="text-sm text-violet-600 hover:text-violet-700 font-medium" style={{ flexShrink: 0 }}>
          &larr; Dashboard
        </Link>
      </div>

      {/* ═══ Free preview banner / Premium insight ═══ */}
      {isFree ? (
        <div style={{ border: CARD, background: "#fff", borderRadius: 20, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BarChart3 className="w-[17px] h-[17px]" style={{ color: "#4338ca" }} strokeWidth={1.5} />
          </div>
          <p style={{ margin: 0, flex: 1, fontSize: 14, lineHeight: 1.5, color: "#3f3f46" }}>
            {child.first_name} answered <strong style={{ color: "#18181b" }}>{last7.attempted} question{last7.attempted === 1 ? "" : "s"}</strong> this week at <strong style={{ color: "#18181b" }}>{last7.accuracy}% accuracy</strong>.
          </p>
          <div style={{ flexShrink: 0, whiteSpace: "nowrap", background: "#f4f4f5", color: "#52525b", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Free plan</div>
        </div>
      ) : (
        <div style={{ border: "1px solid #c7d2fe", background: "linear-gradient(135deg,#eef2ff,#fff)", borderRadius: 20, padding: "20px 24px", marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Sparkles className="w-[22px] h-[22px]" style={{ color: "#4338ca", flexShrink: 0, marginTop: 3 }} strokeWidth={1.5} />
          <div style={{ flex: 1 }}>
            {aiSnapshot ? (
              <>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: "#3f3f46" }}>{aiSnapshot.headline}</p>
                <div style={{ margin: "12px 0 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, background: "#e0e7ff", color: "#4338ca", fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", padding: "3px 8px", borderRadius: 6, marginTop: 1 }}>Try this week</span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#3f3f46" }}>{aiSnapshot.action}</p>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: "#3f3f46", opacity: snapLoading ? 0.6 : 1, transition: "opacity .2s" }}>
                {child.first_name} is <strong style={{ color: "#18181b" }}>{gradeStanding ? gradeStanding.phrase : "just getting started"}</strong> and practiced <strong style={{ color: "#18181b" }}>{last7.days} of the last 7 days</strong>.
                {insightBest ? <> Strong in <strong style={{ color: "#18181b" }}>{insightBest.name}</strong>.</> : null}
                {insightWorst && (!insightBest || insightWorst.standard_id !== insightBest.standard_id) ? <> This week, work on <strong style={{ color: "#18181b" }}>{insightWorst.name}</strong>.</> : null}
              </p>
            )}
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 6 }}>
              {snapLoading && !aiSnapshot ? <>Writing {child.first_name}&apos;s snapshot…</> : <>Updated today · based on {last7.attempted} question{last7.attempted === 1 ? "" : "s"} this week</>}
            </p>
          </div>
        </div>
      )}

      {/* ═══ Tabbed content (blurred when free) ═══ */}
      <div style={{ position: "relative" }}>
        <div style={isFree ? { filter: "blur(6px)", opacity: 0.55, pointerEvents: "none", userSelect: "none", maxHeight: 720, overflow: "hidden" } : undefined}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, borderBottom: "1px solid #f4f4f5" }}>
            {tabBtn("overview", "Overview")}
            {tabBtn("report", "Report card")}
            {tabBtn("map", "Skill map")}
          </div>

          {/* ─── Tab 1 — Overview ─── */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 6, background: "#f4f4f5", borderRadius: 12, padding: 4, width: "fit-content" }}>
                {rangeBtn("week", "This week")}
                {rangeBtn("month", "This month")}
                {rangeBtn("all", "All time")}
              </div>

              {/* Stat tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
                <StatTile label="Questions answered" value={String(totals.attempted)}
                  note={qDelta === null ? `since starting` : qDelta === 0 ? "same as last period" : `${qDelta > 0 ? "▲" : "▼"} ${Math.abs(qDelta)} vs last period`}
                  noteColor={qDelta === null ? "#71717a" : qDelta >= 0 ? "#059669" : "#dc2626"} />
                <StatTile label="Accuracy" value={`${totals.accuracy}%`}
                  note={accDelta === null ? `over ${rangeWord}` : accDelta === 0 ? "no change" : `${accDelta > 0 ? "▲" : "▼"} ${Math.abs(accDelta)}% vs last period`}
                  noteColor={accDelta === null ? "#71717a" : accDelta >= 0 ? "#059669" : "#dc2626"} />
                <StatTile label="Day streak" value={String(child.streak_days)} note={`Best: ${Math.max(child.best_streak ?? 0, child.streak_days)} days`} noteColor="#71717a" />
                <StatTile label="Skills practiced" value={String(skillsPracticedInRange)} suffix={`/${gradeStandardCount}`}
                  note={`${displayGrade(child.grade)} standards`} noteColor="#71717a" />
              </div>

              {/* Chart + skills snapshot */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 16, alignItems: "start" }} className="max-md:!grid-cols-1">
                <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 2 }}>Accuracy over time</div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12 }}>
                    {dateRange === "week" ? "Daily accuracy · this week" : dateRange === "month" ? "Weekly accuracy · this month" : "Weekly accuracy · all time"}
                  </div>
                  {accuracySeries.length >= 2 ? (
                    <AccuracyOverTime series={accuracySeries} />
                  ) : (
                    <div style={{ textAlign: "center", padding: "28px 0", fontSize: 13, color: "#a1a1aa" }}>
                      Complete a few more sessions to see the trend.
                    </div>
                  )}
                </div>

                <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>Skills snapshot</div>
                  {doingWell.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: ".08em" }}>Doing well</div>}
                  {doingWell.map((s) => <SnapshotBar key={s.standard_id} label={s.name} value={s.accuracy} color="#10b981" textColor="#059669" />)}
                  {needsHelp.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 6 }}>Needs help</div>}
                  {needsHelp.map((s) => <SnapshotBar key={s.standard_id} label={s.name} value={s.accuracy} color="#f59e0b" textColor="#b45309" />)}
                  {doingWell.length === 0 && needsHelp.length === 0 && (
                    <div style={{ fontSize: 13, color: "#a1a1aa" }}>No skills practiced in this range yet.</div>
                  )}
                </div>
              </div>

              {/* What to do next */}
              <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 12 }}>What to do next</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {worstRangeSkill && (
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#fffbeb", border: "1px solid #fde68a" }}>
                      <div style={{ flex: 1, fontSize: 14, color: "#3f3f46" }}>
                        {child.first_name} missed <strong style={{ color: "#18181b" }}>{worstRangeSkill.attempted - worstRangeSkill.correct} of {worstRangeSkill.attempted} {worstRangeSkill.name} question{worstRangeSkill.attempted === 1 ? "" : "s"}</strong> {rangeWord} — a short practice would help.
                      </div>
                      <Link href={`/practice?child=${child.id}&standard=${worstRangeSkill.standard_id}`} style={{ flexShrink: 0, whiteSpace: "nowrap", background: "#4338ca", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 14px", borderRadius: 10 }}>
                        Practice {worstRangeSkill.name.length > 18 ? "this skill" : worstRangeSkill.name.toLowerCase()}
                      </Link>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#fafafa", border: "1px solid #f4f4f5" }}>
                    <div style={{ flex: 1, fontSize: 14, color: "#3f3f46" }}>
                      <strong style={{ color: "#18181b" }}>Offline tip:</strong> at dinner, stretch words out together — &quot;c-a-a-a-t&quot;. It builds the same sound skills.
                    </div>
                    <Link href="/practice-hub" style={{ flexShrink: 0, whiteSpace: "nowrap", color: "#4338ca", fontSize: 13, fontWeight: 700, padding: "9px 14px", borderRadius: 10 }}>
                      More tips
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab 2 — Report card ─── */}
          {tab === "report" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setWeekOffset((w) => w + 1)} style={{ border: CARD, background: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: "#52525b" }} strokeWidth={2} />
                </button>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>
                  Week of {reportWeek.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(reportWeek.end.getTime() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <button onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0} style={{ border: CARD, background: "#fff", cursor: weekOffset === 0 ? "default" : "pointer", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", opacity: weekOffset === 0 ? 0.4 : 1 }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "#52525b" }} strokeWidth={2} />
                </button>
                <label style={{ marginLeft: "auto", fontSize: 13, color: "#71717a", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  {/* TODO(analytics): checkbox is local-only, not wired to any email-preference backend */}
                  <input type="checkbox" checked={emailWeekly} onChange={(e) => setEmailWeekly(e.target.checked)} style={{ accentColor: "#4338ca" }} />
                  Email me this every Sunday
                </label>
              </div>

              {/* Days practiced */}
              <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 14 }}>Days practiced · {weekTotals.days} of 7</div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(reportWeek.start); d.setDate(reportWeek.start.getDate() + i);
                    const practiced = weekResults.some((r) => new Date(r.completed_at).toDateString() === d.toDateString());
                    const future = d.getTime() > reportWeek.nowMs;
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", boxSizing: "border-box",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: practiced ? "#4338ca" : future ? "transparent" : "#f4f4f5",
                          border: future ? "1.5px dashed #d4d4d8" : "none",
                        }}>
                          {practiced && <Check className="w-[18px] h-[18px]" style={{ color: "#fff" }} strokeWidth={2.5} />}
                        </div>
                        <span style={{ fontSize: 12, color: practiced ? "#71717a" : "#a1a1aa" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject report */}
              <div style={{ border: CARD, borderRadius: 20, padding: 8, background: "#fff" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", padding: "14px 16px 6px" }}>Subject report</div>
                {DOMAIN_ORDER.map((dom) => {
                  const meta = DOMAIN_META[dom];
                  const s = weekDomainStats[dom];
                  const attempted = s?.attempted ?? 0;
                  const acc = attempted > 0 ? Math.round((s!.correct / attempted) * 100) : 0;
                  const status = skillStatus(attempted, acc);
                  return (
                    <div key={dom} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderTop: "1px solid #f4f4f5" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: attempted > 0 ? meta.iconBg : "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <meta.icon className="w-[17px] h-[17px]" style={{ color: attempted > 0 ? meta.iconStroke : "#a1a1aa" }} strokeWidth={1.5} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: attempted > 0 ? "#18181b" : "#71717a" }}>{meta.label}</div>
                        <div style={{ fontSize: 12, color: attempted > 0 ? "#71717a" : "#a1a1aa" }}>
                          {attempted > 0 ? `${meta.subtitle} · ${attempted} question${attempted === 1 ? "" : "s"}` : "Not tried yet this week"}
                        </div>
                      </div>
                      {attempted > 0 ? (
                        <Badge label={STATUS_META[status].label} color={STATUS_META[status].dot} bg={status === "mastered" ? "#d1fae5" : status === "help" ? "#fef3c7" : "#eef2ff"} />
                      ) : (
                        <Link href={`/practice?child=${child.id}`} style={{ flexShrink: 0, whiteSpace: "nowrap", fontSize: 13, fontWeight: 700, color: "#4338ca" }}>Try a lesson</Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Note + vs last week */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 16, alignItems: "stretch" }} className="max-md:!grid-cols-1">
                <div style={{ border: "1px solid #fde68a", borderRadius: 20, padding: 20, background: "linear-gradient(180deg,#fffbeb,#fff)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>This week&apos;s note</div>
                    <span style={{ fontSize: 11, color: "#a1a1aa", whiteSpace: "nowrap" }}>from Readee</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#3f3f46" }}>
                    {weekBest || weekWorst ? (
                      <>
                        {weekBest ? <>{child.first_name} did well on <strong style={{ color: "#18181b" }}>{weekBest.name}</strong> ({weekBest.correct} of {weekBest.attempted} right). </> : null}
                        {weekWorst && (!weekBest || weekWorst.standard_id !== weekBest.standard_id) ? <>A good next step is <strong style={{ color: "#18181b" }}>{weekWorst.name}</strong> — a short lesson would help.</> : null}
                      </>
                    ) : (
                      <>No practice recorded this week. A quick session gets {child.first_name} back on track.</>
                    )}
                  </p>
                  <Link href={weekWorst ? `/practice?child=${child.id}&standard=${weekWorst.standard_id}` : `/practice?child=${child.id}`} style={{ display: "inline-block", marginTop: 14, whiteSpace: "nowrap", background: "#4338ca", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 14px", borderRadius: 10 }}>
                    Go to practice
                  </Link>
                </div>
                <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 12 }}>vs. last week</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <DeltaRow label="Questions" value={weekTotals.attempted} delta={weekTotals.attempted - prevWeekTotals.attempted} />
                    <DeltaRow label="Accuracy" value={weekTotals.accuracy} suffix="%" delta={weekTotals.accuracy - prevWeekTotals.accuracy} />
                    <DeltaRow label="Days practiced" value={weekTotals.days} delta={weekTotals.days - prevWeekTotals.days} />
                    <DeltaRow label="Skills tried" value={weekTotals.skills} delta={weekTotals.skills - prevWeekTotals.skills} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab 3 — Skill map ─── */}
          {tab === "map" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#71717a" }}>
                  {gradeStandardCount} {displayGrade(child.grade)} standards · <strong style={{ color: "#18181b" }}>{totalGradeSkillsPracticed} practiced</strong>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 12, color: "#52525b", alignItems: "center", flexWrap: "wrap" }}>
                  {(["mastered", "practicing", "help", "none"] as Status[]).map((st) => (
                    <span key={st} style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                      <span style={{ width: 12, height: 12, borderRadius: 4, boxSizing: "border-box", background: STATUS_META[st].fill, border: st === "none" ? "1px dashed #d4d4d8" : "none" }} />
                      {st === "none" ? "Not yet" : STATUS_META[st].label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff", display: "flex", flexDirection: "column", gap: 18 }}>
                {DOMAIN_ORDER.map((dom) => {
                  const meta = DOMAIN_META[dom];
                  const domStds = gradeStandards.filter((s) => s.domain === dom);
                  const practiced = domStds.filter((s) => (allTimeStdStats[s.standard_id]?.attempted ?? 0) > 0).length;
                  if (domStds.length === 0) return null;
                  return (
                    <div key={dom}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", color: meta.accent }}>{meta.label}</div>
                        <div style={{ fontSize: 12, color: "#a1a1aa", whiteSpace: "nowrap" }}>
                          {practiced > 0 ? `${practiced} of ${domStds.length} practiced` : "not started"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {domStds.map((s) => {
                          const stat = allTimeStdStats[s.standard_id];
                          const attempted = stat?.attempted ?? 0;
                          const acc = attempted > 0 ? Math.round((stat!.correct / attempted) * 100) : 0;
                          const status = skillStatus(attempted, acc);
                          const key = s.standard_id;
                          const hovered = hoveredCell === key;
                          return (
                            <div key={key} style={{ position: "relative" }}>
                              <Link
                                href={status === "mastered" ? `/practice-hub` : `/practice?child=${child.id}&standard=${s.standard_id}`}
                                onMouseEnter={() => setHoveredCell(key)}
                                onMouseLeave={() => setHoveredCell((c) => (c === key ? null : c))}
                                style={{
                                  display: "block", width: 36, height: 36, borderRadius: 9, boxSizing: "border-box",
                                  background: status === "none" ? "#f4f4f5" : STATUS_META[status].fill,
                                  border: status === "none" ? "1.5px dashed #d4d4d8" : "none",
                                  boxShadow: status === "help" ? "0 0 0 2px #fde68a" : "none",
                                  transition: "transform .12s ease",
                                  transform: hovered ? "scale(1.12)" : "none",
                                }}
                              />
                              {hovered && (
                                <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", zIndex: 30, background: "#fff", border: CARD, borderRadius: 12, boxShadow: "0 10px 28px rgba(24,24,27,.14)", padding: "12px 14px", width: 196, pointerEvents: "none" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: STATUS_META[status].dot }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap", color: STATUS_META[status].dot }}>{STATUS_META[status].label}</span>
                                    <span style={{ fontSize: 10, color: "#a1a1aa", marginLeft: "auto", whiteSpace: "nowrap" }}>{s.standard_id}</span>
                                  </div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", lineHeight: 1.3 }}>{standardNameMap[s.standard_id] || s.standard_id}</div>
                                  <div style={{ fontSize: 12, color: "#71717a", marginTop: 3 }}>
                                    {attempted > 0 ? `${acc}% correct · ${attempted} question${attempted === 1 ? "" : "s"}` : "Not practiced yet"}
                                  </div>
                                  {status !== "mastered" && <div style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", marginTop: 6 }}>Practice this skill →</div>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 12, color: "#a1a1aa" }}>Hover a square to see the skill · click to practice it</div>
              </div>

              {/* Needs help now + practice volume */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }} className="max-md:!grid-cols-1">
                <div style={{ border: "1px solid #fde68a", borderRadius: 20, padding: 20, background: "linear-gradient(180deg,#fffbeb,#fff)", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 12 }}>Needs help now</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(() => {
                      const weak = gradeStandards
                        .map((s) => {
                          const stat = allTimeStdStats[s.standard_id];
                          const attempted = stat?.attempted ?? 0;
                          const acc = attempted > 0 ? Math.round((stat!.correct / attempted) * 100) : 0;
                          return { id: s.standard_id, name: standardNameMap[s.standard_id] || s.standard_id, attempted, acc };
                        })
                        .filter((s) => s.attempted > 0 && s.acc < 60)
                        .sort((a, b) => a.acc - b.acc)
                        .slice(0, 3);
                      if (weak.length === 0) return <div style={{ fontSize: 13, color: "#71717a" }}>Nothing needs urgent attention — nice work!</div>;
                      return weak.map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b" }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: "#71717a" }}>{s.id} · {s.acc}% correct</div>
                          </div>
                          <Link href={`/practice?child=${child.id}&standard=${s.id}`} style={{ flexShrink: 0, whiteSpace: "nowrap", background: "#4338ca", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 14px", borderRadius: 10 }}>Practice</Link>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 2 }}>Practice volume</div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 10 }}>Questions per week</div>
                  {weeklyVolume.length > 0 ? (
                    <PracticeVolume weeks={weeklyVolume} />
                  ) : (
                    <div style={{ fontSize: 13, color: "#a1a1aa", padding: "20px 0", textAlign: "center" }}>No sessions yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade overlay (free plan) */}
        {isFree && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 20, paddingTop: 60 }}>
            <div style={{ textAlign: "center", maxWidth: 400, padding: "32px 28px", background: "rgba(255,255,255,.92)", border: CARD, borderRadius: 24, boxShadow: "0 20px 50px rgba(30,27,75,.14)", backdropFilter: "blur(4px)" }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#eef2ff,#ede9fe)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock className="w-7 h-7" style={{ color: "#4338ca" }} strokeWidth={1.5} />
              </div>
              <h2 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#18181b" }}>See where {child.first_name} needs help</h2>
              <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6, color: "#52525b" }}>Progress charts, weekly report cards, the full skill map, and next-step suggestions with Readee+</p>
              <Link href="/upgrade?reason=analytics" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Try Readee+ free for 7 days
              </Link>
              <p style={{ margin: "12px 0 0", fontSize: 12, color: "#a1a1aa" }}>$9.99/mo or $6.99/mo billed annually · cancel in one click</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Small presentational pieces                            */
/* ═══════════════════════════════════════════════════════ */

function StatTile({ label, value, suffix, note, noteColor }: { label: string; value: string; suffix?: string; note: string; noteColor: string }) {
  return (
    <div style={{ border: CARD, borderRadius: 20, padding: "18px 20px", background: "#fff" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#71717a" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "#18181b", marginTop: 4 }}>
        {value}{suffix ? <span style={{ fontSize: 18, color: "#a1a1aa" }}>{suffix}</span> : null}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: noteColor }}>{note}</div>
    </div>
  );
}

function SnapshotBar({ label, value, color, textColor }: { label: string; value: number; color: string; textColor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#3f3f46", gap: 8 }}>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ color: textColor, flexShrink: 0 }}>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#f4f4f5", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, value))}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ flexShrink: 0, whiteSpace: "nowrap", background: bg, color, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{label}</span>
  );
}

function DeltaRow({ label, value, suffix, delta }: { label: string; value: number; suffix?: string; delta: number }) {
  const color = delta > 0 ? "#059669" : delta < 0 ? "#dc2626" : "#71717a";
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "–";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "#52525b", fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value}{suffix ?? ""} {arrow} {delta === 0 ? "0" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`}</span>
    </div>
  );
}

/* ═══ Accuracy over time (SVG line + area) ═══ */

function AccuracyOverTime({ series }: { series: SeriesPoint[] }) {
  const W = 580, H = 200, padL = 40, padR = 22, padT = 30, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB; // 130
  const n = series.length;
  const x = (i: number) => (n === 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW);
  const y = (a: number) => padT + innerH - (Math.max(0, Math.min(100, a)) / 100) * innerH;
  const pts = series.map((s, i) => ({ x: x(i), y: y(s.accuracy) }));

  let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i], dx = (c.x - p.x) * 0.4;
    line += ` C ${(p.x + dx).toFixed(1)} ${p.y.toFixed(1)}, ${(c.x - dx).toFixed(1)} ${c.y.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  const bottom = padT + innerH;
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${bottom} L ${pts[0].x.toFixed(1)} ${bottom} Z`;

  const grid = [0, 25, 50, 75, 100];
  const labelStep = Math.max(1, Math.ceil(n / 6));

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 380, display: "block" }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {grid.map((g) => {
          const gy = y(g);
          return (
            <g key={g}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#f4f4f5" />
              <text x={padL - 6} y={gy + 3} textAnchor="end" fontSize="10" fill="#a1a1aa">{g}%</text>
            </g>
          );
        })}
        <path d={area} fill="url(#accGrad)" />
        <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[0].x} cy={pts[0].y} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
        <text x={pts[0].x} y={pts[0].y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#6d28d9">{series[0].accuracy}%</text>
        <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#6d28d9">{series[series.length - 1].accuracy}%</text>
        {series.map((s, i) => {
          if (i % labelStep !== 0 && i !== n - 1) return null;
          return <text key={i} x={pts[i].x} y={bottom + 20} textAnchor="middle" fontSize="10" fill="#a1a1aa">{s.label}</text>;
        })}
      </svg>
    </div>
  );
}

/* ═══ Practice volume (SVG bars) ═══ */

function PracticeVolume({ weeks }: { weeks: { label: string; count: number }[] }) {
  const W = 340, H = 100, baseline = 90, top = 22;
  const max = Math.max(...weeks.map((w) => w.count), 1);
  const n = weeks.length;
  const gap = 14;
  const barW = Math.min(32, (W - 20 - gap * (n - 1)) / n);
  const step = barW + gap;
  const startX = 10;
  const colorFor = (i: number) => (i >= n - 2 ? "#4338ca" : i >= n - 4 ? "#818cf8" : "#c7d2fe");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      {weeks.map((w, i) => {
        const h = Math.max(3, ((baseline - top) * w.count) / max);
        const bx = startX + i * step;
        const by = baseline - h;
        return <rect key={i} x={bx} y={by} width={barW} height={h} rx="4" fill={colorFor(i)} />;
      })}
      {weeks.map((w, i) => {
        if (i !== 0 && i !== n - 1 && !(n > 4 && i === Math.floor(n / 2))) return null;
        return <text key={`t${i}`} x={startX + i * step + barW / 2} y={98} textAnchor="middle" fontSize="9" fill="#a1a1aa">{w.label}</text>;
      })}
      {weeks.length > 0 && (
        <text x={startX + (n - 1) * step + barW / 2} y={baseline - Math.max(3, ((baseline - top) * weeks[n - 1].count) / max) - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4338ca">{weeks[n - 1].count}</text>
      )}
    </svg>
  );
}
