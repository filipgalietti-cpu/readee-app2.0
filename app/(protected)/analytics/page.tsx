"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import kStandards from "@/app/data/kindergarten-standards-questions.json";
import { staggerContainer, slideUp, fadeUp } from "@/lib/motion/variants";
import { safeValidate } from "@/lib/validate";
import { ChildSchema, StandardsFileSchema } from "@/lib/schemas";
import { useChildStore } from "@/lib/stores/child-store";

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
  xp_earned: number;
  completed_at: string;
}

type DateRange = "week" | "month" | "all";

/* ─── Constants ──────────────────────────────────────── */

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

const DOMAIN_META: Record<string, { emoji: string; color: string; darkColor: string; bg: string; darkBg: string; border: string; barColor: string; total: number }> = {
  "Reading Literature":         { emoji: "📖", color: "text-violet-700",  darkColor: "dark:text-violet-400",  bg: "bg-violet-50",  darkBg: "dark:bg-violet-950/30", border: "border-violet-200",  barColor: "#8b5cf6", total: 8 },
  "Reading Informational Text": { emoji: "📰", color: "text-blue-700",   darkColor: "dark:text-blue-400",   bg: "bg-blue-50",    darkBg: "dark:bg-blue-950/30",   border: "border-blue-200",    barColor: "#3b82f6", total: 9 },
  "Foundational Skills":        { emoji: "🔤", color: "text-emerald-700", darkColor: "dark:text-emerald-400", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/30", border: "border-emerald-200", barColor: "#10b981", total: 14 },
  "Language":                   { emoji: "💬", color: "text-amber-700",  darkColor: "dark:text-amber-400",  bg: "bg-amber-50",   darkBg: "dark:bg-amber-950/30",  border: "border-amber-200",   barColor: "#f59e0b", total: 5 },
};

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
  return capped.length > 60 ? capped.slice(0, 57) + "..." : capped;
}

function displayGrade(grade: string | null | undefined): string {
  if (!grade) return "Kindergarten";
  if (grade.toLowerCase() === "pre-k") return "Pre-K";
  return grade;
}

function getAvatar(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  return AVATARS[h % AVATARS.length];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateCutoff(range: DateRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "week") {
    now.setDate(now.getDate() - 7);
  } else {
    // Current calendar month: 1st of this month at midnight
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return now;
}

/* ─── useCountUp ─────────────────────────────────────── */

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current || target === 0) { setValue(target); return; }
    const el = ref.current;
    if (!el) { setValue(target); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
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
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  );
}

function AnalyticsLoader() {
  const params = useSearchParams();
  const childIdParam = params.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      let resolvedId = childIdParam;
      console.log("[Analytics] URL child param:", childIdParam);

      // If no child param, try child store first, then fetch from DB
      if (!resolvedId) {
        const store = useChildStore.getState();
        const storeChild = store.childData || store.children[0] || null;
        console.log("[Analytics] Store childData:", store.childData?.id ?? "null", "| Store children:", store.children.length);
        if (storeChild) {
          resolvedId = storeChild.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          console.log("[Analytics] Supabase user:", user?.id ?? "null");
          if (user) {
            const { data: children } = await supabase
              .from("children")
              .select("*")
              .eq("parent_id", user.id)
              .order("created_at", { ascending: true })
              .limit(1);
            console.log("[Analytics] Fetched children from DB:", children?.length ?? 0);
            if (children && children.length > 0) {
              resolvedId = children[0].id;
            }
          }
        }
      }

      console.log("[Analytics] Resolved child ID:", resolvedId ?? "null");
      if (!resolvedId) { setLoading(false); return; }

      // Silently update URL so bookmarks/sharing work, without triggering navigation
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
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">📊</div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-slate-100">No reader selected</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return <AnalyticsDashboard child={child} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Analytics Dashboard                                    */
/* ═══════════════════════════════════════════════════════ */

function AnalyticsDashboard({ child }: { child: Child }) {
  const allStandards = useMemo(() =>
    safeValidate(StandardsFileSchema, kStandards).standards as Standard[],
    []
  );
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Build standard friendly name map
  const standardNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of allStandards) {
      map[s.standard_id] = shortName(s.standard_description);
    }
    return map;
  }, [allStandards]);

  // Build standard to domain map
  const standardDomainMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of allStandards) {
      map[s.standard_id] = s.domain;
    }
    return map;
  }, [allStandards]);

  // Fetch practice results
  useEffect(() => {
    async function fetchResults() {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("practice_results")
        .select("*")
        .eq("child_id", child.id)
        .order("completed_at", { ascending: false });
      setPracticeResults((data as PracticeResult[]) || []);
      setLoadingData(false);
    }
    fetchResults();
  }, [child.id]);

  // Filter by date range
  const filteredResults = useMemo(() => {
    const cutoff = getDateCutoff(dateRange);
    if (!cutoff) return practiceResults;
    return practiceResults.filter((r) => new Date(r.completed_at) >= cutoff);
  }, [practiceResults, dateRange]);

  // Aggregate stats
  const totals = useMemo(() => {
    const attempted = filteredResults.reduce((s, r) => s + r.questions_attempted, 0);
    const correct = filteredResults.reduce((s, r) => s + r.questions_correct, 0);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const sessions = filteredResults.length;
    return { attempted, correct, accuracy, sessions };
  }, [filteredResults]);

  // Per-standard accuracy
  const standardStats = useMemo(() => {
    const map: Record<string, { attempted: number; correct: number }> = {};
    for (const r of filteredResults) {
      if (!map[r.standard_id]) map[r.standard_id] = { attempted: 0, correct: 0 };
      map[r.standard_id].attempted += r.questions_attempted;
      map[r.standard_id].correct += r.questions_correct;
    }
    return Object.entries(map).map(([id, s]) => ({
      standard_id: id,
      name: standardNameMap[id] || id,
      domain: standardDomainMap[id] || "Unknown",
      attempted: s.attempted,
      correct: s.correct,
      accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
    }));
  }, [filteredResults, standardNameMap, standardDomainMap]);

  // Strengths & weaknesses (full lists)
  const allStrengths = useMemo(() =>
    [...standardStats].filter((s) => s.attempted >= 1).sort((a, b) => b.accuracy - a.accuracy),
    [standardStats]
  );
  const allWeaknesses = useMemo(() =>
    [...standardStats].filter((s) => s.attempted >= 1).sort((a, b) => a.accuracy - b.accuracy),
    [standardStats]
  );
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllWeaknesses, setShowAllWeaknesses] = useState(false);
  const strengths = showAllStrengths ? allStrengths : allStrengths.slice(0, 3);
  const weaknesses = showAllWeaknesses ? allWeaknesses : allWeaknesses.slice(0, 3);

  // Chart data — group by day
  const chartData = useMemo(() => {
    const dayMap: Record<string, { attempted: number; correct: number }> = {};
    for (const r of filteredResults) {
      const day = new Date(r.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dayMap[day]) dayMap[day] = { attempted: 0, correct: 0 };
      dayMap[day].attempted += r.questions_attempted;
      dayMap[day].correct += r.questions_correct;
    }
    // Sort chronologically
    const sorted = [...filteredResults].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
    const seen = new Set<string>();
    const result: { label: string; accuracy: number; attempted: number }[] = [];
    for (const r of sorted) {
      const day = new Date(r.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (seen.has(day)) continue;
      seen.add(day);
      const d = dayMap[day];
      result.push({
        label: day,
        accuracy: d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0,
        attempted: d.attempted,
      });
    }
    return result;
  }, [filteredResults]);

  // Curriculum progress — standards practiced per domain (filtered by date range)
  const domainProgress = useMemo(() => {
    const practicedStandards = new Set(filteredResults.map((r) => r.standard_id));
    return Object.entries(DOMAIN_META).map(([domain, meta]) => {
      const domainStandards = allStandards.filter((s) => s.domain === domain);
      const practiced = domainStandards.filter((s) => practicedStandards.has(s.standard_id)).length;
      return { domain, practiced, ...meta };
    });
  }, [allStandards, filteredResults]);

  const totalStandardsPracticed = useMemo(() => {
    const all = new Set(filteredResults.map((r) => r.standard_id));
    return all.size;
  }, [filteredResults]);

  const overallProgressPct = Math.round((totalStandardsPracticed / allStandards.length) * 100);

  // Recent activity (last 5)
  const recentActivity = filteredResults.slice(0, 5);

  if (loadingData) return <Spinner />;

  const hasData = practiceResults.length > 0;
  const avatar = getAvatar(child.first_name);

  /* ── No data empty state ── */
  if (!hasData) {
    return (
      <motion.div
        className="max-w-lg mx-auto pb-20 px-4 pt-8 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideUp}>
          <div className="text-6xl mb-4">{avatar}</div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 mb-2">
            {child.first_name}&apos;s Analytics
          </h1>
          <p className="text-zinc-500 dark:text-slate-400 mb-8">
            {displayGrade(child.grade)} {child.reading_level ? `· ${child.reading_level}` : ""}
          </p>
        </motion.div>

        <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 mb-2">
            Ready to get started?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mb-6">
            Complete your first practice session to see progress, strengths, and areas to grow!
          </p>
          <Link
            href={`/practice?child=${child.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            Start Practice →
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
            &larr; Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-3xl mx-auto pb-20 px-4" variants={staggerContainer} initial="hidden" animate="visible">
      {/* ═══ Section 1 — Header ═══ */}
      <motion.div variants={slideUp} className="pt-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl flex-shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
              {child.first_name}&apos;s Progress
            </h1>
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              {displayGrade(child.grade)} {child.reading_level ? `· ${child.reading_level}` : ""}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex-shrink-0">
            &larr; Dashboard
          </Link>
        </div>

        {/* Date range tabs */}
        <div className="flex gap-1.5 bg-zinc-100 dark:bg-slate-800 rounded-xl p-1">
          {([
            { key: "week" as DateRange, label: "This Week" },
            { key: "month" as DateRange, label: "This Month" },
            { key: "all" as DateRange, label: "All Time" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                dateRange === key
                  ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ Section 2 — Key Stats ═══ */}
      <motion.div variants={slideUp} className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Questions Answered" value={totals.attempted} icon="📝" />
        <AccuracyCard accuracy={totals.accuracy} />
        <StatCard label="Practice Sessions" value={totals.sessions} icon="🎯" />
      </motion.div>

      {/* ═══ Section 3 — Progress Chart ═══ */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-4">
          How {child.first_name} is doing
        </h2>
        {chartData.length >= 2 ? (
          <AccuracyChart data={chartData} />
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              Complete a few more sessions to see your progress trend!
            </p>
          </div>
        )}
      </motion.div>

      {/* ═══ Section 4 — Strengths & Weaknesses ═══ */}
      {standardStats.length > 0 && (
        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-800 p-5 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-3">
              Strengths 💪
            </h3>
            {strengths.length > 0 ? (
              <div className="space-y-2.5">
                {strengths.map((s) => (
                  <div key={s.standard_id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800 dark:text-slate-200 truncate">{s.name}</div>
                      <div className="text-xs text-zinc-400 dark:text-slate-500">{s.standard_id}</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">{s.accuracy}%</span>
                  </div>
                ))}
                {allStrengths.length > 3 && (
                  <button
                    onClick={() => setShowAllStrengths(!showAllStrengths)}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-1"
                  >
                    {showAllStrengths ? "Show less" : `Show all ${allStrengths.length}`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-slate-400">Keep practicing to discover strengths!</p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-800 p-5 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-3">
              Keep Practicing 🌱
            </h3>
            {weaknesses.length > 0 ? (
              <div className="space-y-2.5">
                {weaknesses.map((s) => (
                  <div key={s.standard_id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🌱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800 dark:text-slate-200 truncate">{s.name}</div>
                      <div className="text-xs text-zinc-400 dark:text-slate-500">{s.standard_id}</div>
                    </div>
                    <Link
                      href={`/practice?child=${child.id}&standard=${s.standard_id}`}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex-shrink-0"
                    >
                      Practice →
                    </Link>
                  </div>
                ))}
                {allWeaknesses.length > 3 && (
                  <button
                    onClick={() => setShowAllWeaknesses(!showAllWeaknesses)}
                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mt-1"
                  >
                    {showAllWeaknesses ? "Show less" : `Show all ${allWeaknesses.length}`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-slate-400">Great work so far! Keep it up!</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ Section 5 — Curriculum Progress ═══ */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-1">Curriculum Progress</h2>
        <p className="text-xs text-zinc-500 dark:text-slate-400 mb-4">
          {overallProgressPct}% of Kindergarten standards practiced
        </p>

        {/* Overall bar */}
        <div className="h-3 bg-zinc-100 dark:bg-slate-700 rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgressPct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </div>

        {/* Domain rows */}
        <div className="space-y-3">
          {domainProgress.map((dp) => {
            const pct = dp.total > 0 ? Math.round((dp.practiced / dp.total) * 100) : 0;
            return (
              <div key={dp.domain}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{dp.emoji}</span>
                    <span className={`text-sm font-medium ${dp.color} ${dp.darkColor}`}>{dp.domain}</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">{dp.practiced}/{dp.total}</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: dp.barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ Section 6 — Recent Activity ═══ */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="text-xs text-zinc-400 dark:text-slate-500 w-16 flex-shrink-0 font-medium">
                  {formatDate(r.completed_at)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-800 dark:text-slate-200 truncate">
                    {standardNameMap[r.standard_id] || r.standard_id}
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-slate-500">{r.standard_id}</div>
                </div>
                <div className="text-sm font-bold text-zinc-700 dark:text-slate-300 flex-shrink-0">
                  {r.questions_correct}/{r.questions_attempted}
                </div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex-shrink-0">
                  +{r.xp_earned} XP
                </div>
              </div>
            ))}
            {filteredResults.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-zinc-400 dark:text-slate-500">
                  Showing 5 of {filteredResults.length} sessions
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              No activity in this time period. Try a different range!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Stat Card                                              */
/* ═══════════════════════════════════════════════════════ */

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const { value: animated, ref } = useCountUp(value);

  return (
    <div ref={ref} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center shadow-sm">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-slate-100">{animated}</div>
      <div className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Accuracy Card with animated ring                       */
/* ═══════════════════════════════════════════════════════ */

function AccuracyCard({ accuracy }: { accuracy: number }) {
  const ringColor = accuracy >= 70 ? "#10b981" : accuracy >= 50 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 28; // r=28

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center shadow-sm">
      <div className="relative w-16 h-16 mx-auto mb-1">
        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-slate-700" />
          <motion.circle
            cx="32" cy="32" r="28" fill="none" stroke={ringColor} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * accuracy / 100) }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-zinc-900 dark:text-slate-100">
          {accuracy}%
        </span>
      </div>
      <div className="text-[11px] text-zinc-500 dark:text-slate-400 font-medium">Accuracy</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Accuracy Chart (pure SVG)                              */
/* ═══════════════════════════════════════════════════════ */

function AccuracyChart({ data }: { data: { label: string; accuracy: number; attempted: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 600;
  const H = 220;
  const PAD_L = 36;
  const PAD_R = 16;
  const PAD_T = 28;
  const PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxY = 100;
  const yTicks = [0, 25, 50, 75, 100];

  const points = data.map((d, i) => ({
    x: PAD_L + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD_T + chartH - (d.accuracy / maxY) * chartH,
    ...d,
  }));

  const linePath = points.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) * 0.4;
    const cpx2 = pt.x - (pt.x - prev.x) * 0.4;
    return `${path} C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_T + chartH} L ${points[0].x} ${PAD_T + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[400px]"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
          <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = PAD_T + chartH - (tick / maxY) * chartH;
          return (
            <g key={tick}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-slate-700" />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 dark:fill-slate-500" fontSize="10">
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Line — animated draw */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Hover vertical guide */}
        {hovered !== null && (
          <line
            x1={points[hovered].x} y1={PAD_T}
            x2={points[hovered].x} y2={PAD_T + chartH}
            stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
          />
        )}

        {/* Dots + hit areas */}
        {points.map((pt, i) => {
          const isHovered = hovered === i;
          const isEndpoint = i === 0 || i === points.length - 1;
          const showLabel = isHovered || isEndpoint;

          return (
            <g key={i}>
              <circle
                cx={pt.x} cy={pt.y} r="18" fill="transparent"
                onMouseEnter={() => setHovered(i)}
                style={{ cursor: "pointer" }}
              />
              <circle
                cx={pt.x} cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? "#6366f1" : "white"}
                stroke="#6366f1" strokeWidth="2"
                style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
              />
              {/* X-axis label */}
              <text
                x={pt.x} y={PAD_T + chartH + 18} textAnchor="middle"
                className={isHovered ? "fill-indigo-600" : "fill-zinc-400 dark:fill-slate-500"}
                fontSize="10" fontWeight={isHovered ? "bold" : "normal"}
              >
                {pt.label}
              </text>
              {/* Tooltip */}
              {showLabel && (
                <g>
                  {isHovered && (
                    <>
                      <rect
                        x={pt.x - 52} y={pt.y - 48} width="104" height="38" rx="8"
                        fill="white" stroke="#e5e7eb" strokeWidth="1" filter="url(#tooltipShadow)"
                      />
                      <text x={pt.x} y={pt.y - 30} textAnchor="middle" className="fill-indigo-700" fontSize="13" fontWeight="bold">
                        {pt.accuracy}%
                      </text>
                      <text x={pt.x} y={pt.y - 17} textAnchor="middle" className="fill-zinc-400" fontSize="9">
                        {pt.attempted} questions
                      </text>
                    </>
                  )}
                  {!isHovered && isEndpoint && (
                    <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="fill-indigo-600" fontSize="10" fontWeight="bold">
                      {pt.accuracy}%
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
