"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import kStandards from "@/app/data/kindergarten-standards-questions.json";

/* ─── Types ──────────────────────────────────────────── */

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip?: string;
  questions: { id: string }[];
}

interface StandardStat {
  standard_id: string;
  name: string;
  domain: string;
  parent_tip?: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  mastery: MasteryLevel;
}

type MasteryLevel = "Proficient" | "Developing" | "Needs Support" | "Not Started";
type SortField = "standard_id" | "accuracy" | "attempted";
type SortDir = "asc" | "desc";

interface WeeklyPoint {
  label: string;
  accuracy: number;
  attempted: number;
}

/* ─── Constants ──────────────────────────────────────── */

function displayGrade(grade: string | null | undefined): string {
  if (!grade) return "Kindergarten";
  if (grade.toLowerCase() === "pre-k") return "Foundational";
  return grade;
}

const DOMAINS = ["All", "Reading Literature", "Reading Informational Text", "Foundational Skills", "Language"] as const;

const DOMAIN_META: Record<string, { emoji: string; color: string; bg: string; border: string; barColor: string }> = {
  "Reading Literature":         { emoji: "📖", color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  barColor: "#8b5cf6" },
  "Reading Informational Text": { emoji: "📰", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",    barColor: "#3b82f6" },
  "Foundational Skills":        { emoji: "🔤", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", barColor: "#10b981" },
  "Language":                   { emoji: "💬", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",   barColor: "#f59e0b" },
};

const MASTERY_CONFIG: Record<MasteryLevel, { color: string; bg: string; border: string }> = {
  "Proficient":    { color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  "Developing":    { color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200" },
  "Needs Support": { color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200" },
  "Not Started":   { color: "text-zinc-500",    bg: "bg-zinc-50",     border: "border-zinc-200" },
};

/* ─── Mock data generator ────────────────────────────── */

function generateMockStats(standards: Standard[]): StandardStat[] {
  // Deterministic "random" using standard_id as seed
  function seed(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff;
    return h;
  }

  return standards.map((std) => {
    const s = seed(std.standard_id);
    const hasAttempted = (s % 100) < 72; // ~72% of standards attempted
    if (!hasAttempted) {
      return {
        standard_id: std.standard_id,
        name: shortName(std.standard_description),
        domain: std.domain,
        parent_tip: std.parent_tip,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        mastery: "Not Started" as MasteryLevel,
      };
    }

    const attempted = 3 + (s % 8); // 3-10 attempts
    const accuracyRaw = 25 + (s % 70); // 25-94%
    const correct = Math.round((accuracyRaw / 100) * attempted);
    const incorrect = attempted - correct;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    let mastery: MasteryLevel = "Needs Support";
    if (accuracy >= 80) mastery = "Proficient";
    else if (accuracy >= 50) mastery = "Developing";

    return {
      standard_id: std.standard_id,
      name: shortName(std.standard_description),
      domain: std.domain,
      parent_tip: std.parent_tip,
      attempted,
      correct,
      incorrect,
      accuracy,
      mastery,
    };
  });
}

function generateWeeklyData(): WeeklyPoint[] {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"];
  // Simulate upward trend
  const base = [52, 55, 61, 58, 67, 72, 70, 76];
  const attempted = [15, 20, 25, 22, 30, 28, 35, 32];
  return weeks.map((label, i) => ({
    label,
    accuracy: base[i],
    attempted: attempted[i],
  }));
}

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
  const childId = params.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) { setLoading(false); return; }
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) setChild(data as Child);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading) return <Spinner />;

  if (!child) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">📊</div>
        <h1 className="text-xl font-bold text-zinc-900">No reader selected</h1>
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
  const allStandards = (kStandards as { standards: Standard[] }).standards;
  const stats = useMemo(() => generateMockStats(allStandards), [allStandards]);
  const weeklyData = useMemo(() => generateWeeklyData(), []);

  const [domainFilter, setDomainFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("standard_id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* ── Derived stats ── */
  const totals = useMemo(() => {
    const attempted = stats.reduce((s, st) => s + st.attempted, 0);
    const correct = stats.reduce((s, st) => s + st.correct, 0);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const proficient = stats.filter((s) => s.mastery === "Proficient").length;
    const developing = stats.filter((s) => s.mastery === "Developing").length;
    const needsSupport = stats.filter((s) => s.mastery === "Needs Support").length;
    const notStarted = stats.filter((s) => s.mastery === "Not Started").length;
    const masteryPct = Math.round((proficient / allStandards.length) * 100);
    return { attempted, correct, accuracy, proficient, developing, needsSupport, notStarted, masteryPct };
  }, [stats, allStandards.length]);

  /* ── Domain breakdown ── */
  const domainStats = useMemo(() => {
    return Object.keys(DOMAIN_META).map((domain) => {
      const domainItems = stats.filter((s) => s.domain === domain);
      const attempted = domainItems.reduce((s, st) => s + st.attempted, 0);
      const correct = domainItems.reduce((s, st) => s + st.correct, 0);
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      const proficient = domainItems.filter((s) => s.mastery === "Proficient").length;
      return { domain, total: domainItems.length, attempted, correct, accuracy, proficient };
    });
  }, [stats]);

  /* ── Struggling standards ── */
  const struggles = useMemo(() => {
    return stats
      .filter((s) => s.attempted > 0 && s.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [stats]);

  /* ── Filtered & sorted table ── */
  const filteredStats = useMemo(() => {
    let list = domainFilter === "All" ? [...stats] : stats.filter((s) => s.domain === domainFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "standard_id") cmp = a.standard_id.localeCompare(b.standard_id);
      else if (sortField === "accuracy") cmp = a.accuracy - b.accuracy;
      else if (sortField === "attempted") cmp = a.attempted - b.attempted;
      return sortDir === "desc" ? -cmp : cmp;
    });

    return list;
  }, [stats, domainFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "accuracy" ? "desc" : "asc");
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4">
      {/* ── Nav ── */}
      <div className="flex items-center justify-between pt-4 mb-6 animate-slideUp">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          &larr; Dashboard
        </Link>
        <span className="text-xs text-zinc-400 font-medium">{displayGrade(child.grade)}</span>
      </div>

      {/* ── Title ── */}
      <div className="mb-8 dash-slide-up-1">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          📊 {child.first_name}&apos;s Progress Report
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Detailed performance breakdown by ELA standard
        </p>
      </div>

      {/* ══════════ TOP SUMMARY ══════════ */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 mb-6 shadow-lg dash-slide-up-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-12 h-12 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round" strokeDasharray="251"
                strokeDashoffset={251 - (251 * totals.masteryPct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-white text-sm font-bold">{totals.masteryPct}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg">Overall Mastery</div>
            <div className="text-white/70 text-xs mt-0.5">
              {child.reading_level || "Not assessed"} &middot; {displayGrade(child.grade)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white font-bold text-xl">{totals.attempted}</div>
            <div className="text-white/60 text-[10px] font-medium">Questions</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white font-bold text-xl">{totals.correct}</div>
            <div className="text-white/60 text-[10px] font-medium">Correct</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white font-bold text-xl">{totals.accuracy}%</div>
            <div className="text-white/60 text-[10px] font-medium">Accuracy</div>
          </div>
        </div>
      </div>

      {/* ── Mastery Breakdown Pills ── */}
      <div className="grid grid-cols-4 gap-2 mb-6 dash-slide-up-3">
        <MasteryPill label="Proficient" count={totals.proficient} total={allStandards.length} level="Proficient" />
        <MasteryPill label="Developing" count={totals.developing} total={allStandards.length} level="Developing" />
        <MasteryPill label="Needs Help" count={totals.needsSupport} total={allStandards.length} level="Needs Support" />
        <MasteryPill label="Not Started" count={totals.notStarted} total={allStandards.length} level="Not Started" />
      </div>

      {/* ══════════ PROGRESS CHART ══════════ */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 mb-6 dash-slide-up-3">
        <h2 className="text-base font-bold text-zinc-900 mb-4">Weekly Accuracy Trend</h2>
        <AccuracyChart data={weeklyData} />
      </div>

      {/* ══════════ DOMAIN BREAKDOWN ══════════ */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 mb-6 dash-slide-up-4">
        <h2 className="text-base font-bold text-zinc-900 mb-4">Performance by Domain</h2>
        <div className="space-y-3">
          {domainStats.map((ds) => (
            <DomainCard key={ds.domain} domainStat={ds} standards={stats.filter((s) => s.domain === ds.domain)} childId={child.id} />
          ))}
        </div>
      </div>

      {/* ══════════ AREAS TO FOCUS ON ══════════ */}
      {struggles.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/80 to-white p-5 mb-6 dash-slide-up-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎯</span>
            <h2 className="text-base font-bold text-zinc-900">Areas to Focus On</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            These {struggles.length} standards need the most attention — ranked by priority.
          </p>
          <div className="space-y-3">
            {struggles.map((s, i) => {
              const meta = DOMAIN_META[s.domain] || DOMAIN_META["Reading Literature"];
              const ringPct = s.accuracy;
              const ringOffset = 88 - (88 * ringPct / 100);
              return (
                <div key={s.standard_id} className="rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex gap-3">
                    {/* Priority ring */}
                    <div className="relative w-11 h-11 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#fee2e2" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke={ringPct >= 40 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray="88"
                          strokeDashoffset={ringOffset}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-zinc-600">
                        #{i + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.color} flex-shrink-0`}>
                          {s.standard_id}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 truncate">{s.name}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${s.accuracy}%`,
                              backgroundColor: s.accuracy >= 40 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${s.accuracy >= 40 ? "text-amber-600" : "text-red-500"}`}>
                          {s.accuracy}%
                        </span>
                        <span className="text-[11px] text-zinc-400 flex-shrink-0">
                          {s.correct}/{s.attempted}
                        </span>
                      </div>

                      {/* Parent tip */}
                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2.5">
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <span className="font-bold">💡 Tip:</span>{" "}
                          {s.parent_tip || `Revisit with guided practice and repeat the ${s.domain.toLowerCase()} exercises.`}
                        </p>
                      </div>

                      {/* Practice button */}
                      <Link
                        href={`/roadmap/practice?child=${child.id}&standard=${s.standard_id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
                      >
                        Practice {s.standard_id} →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ STANDARDS TABLE ══════════ */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dash-slide-up-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-bold text-zinc-900">Standards Breakdown</h2>
          <span className="text-xs text-zinc-400">
            {filteredStats.length} standard{filteredStats.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Domain filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {DOMAINS.map((d) => {
            const isActive = domainFilter === d;
            const meta = d !== "All" ? DOMAIN_META[d] : null;
            return (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : meta
                    ? `${meta.bg} ${meta.color} ${meta.border} hover:opacity-80`
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {meta ? `${meta.emoji} ` : ""}{d === "All" ? "All Domains" : d}
              </button>
            );
          })}
        </div>

        {/* Sort controls */}
        <div className="flex gap-2 mb-3">
          {([
            { field: "standard_id" as SortField, label: "Standard" },
            { field: "accuracy" as SortField, label: "Accuracy" },
            { field: "attempted" as SortField, label: "Attempts" },
          ]).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                sortField === field
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {label} {sortField === field && (sortDir === "asc" ? "↑" : "↓")}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="space-y-1.5">
          {filteredStats.map((s) => (
            <StandardRow key={s.standard_id} stat={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Accuracy Chart (pure SVG)                              */
/* ═══════════════════════════════════════════════════════ */

function AccuracyChart({ data }: { data: WeeklyPoint[] }) {
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
    x: PAD_L + (i / (data.length - 1)) * chartW,
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
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#f4f4f5" strokeWidth="1" />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" className="fill-zinc-400" fontSize="10">
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

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
              {/* Invisible larger hit area for easy hovering */}
              <circle
                cx={pt.x} cy={pt.y} r="18" fill="transparent"
                onMouseEnter={() => setHovered(i)}
                style={{ cursor: "pointer" }}
              />

              {/* Visible dot */}
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
                className={isHovered ? "fill-indigo-600" : "fill-zinc-400"}
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

/* ═══════════════════════════════════════════════════════ */
/*  Domain Card — expandable                               */
/* ═══════════════════════════════════════════════════════ */

interface DomainStatData {
  domain: string;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
  proficient: number;
}

function DomainCard({ domainStat, standards, childId }: {
  domainStat: DomainStatData;
  standards: StandardStat[];
  childId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const ds = domainStat;
  const meta = DOMAIN_META[ds.domain];

  // Sort by accuracy (lowest first when expanded to show where help is needed)
  const sortedStandards = useMemo(() =>
    [...standards].sort((a, b) => {
      if (a.attempted === 0 && b.attempted === 0) return a.standard_id.localeCompare(b.standard_id);
      if (a.attempted === 0) return 1;
      if (b.attempted === 0) return -1;
      return a.accuracy - b.accuracy;
    }),
    [standards]
  );

  return (
    <div className={`rounded-xl border-2 transition-all ${expanded ? `${meta.border} shadow-sm` : `${meta.border} ${meta.bg}`}`}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`w-full text-left p-3.5 rounded-xl transition-colors ${expanded ? `${meta.bg}` : ""}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.emoji}</span>
            <span className={`text-sm font-bold ${meta.color}`}>{ds.domain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${meta.color}`}>{ds.accuracy}%</span>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="h-2 bg-white/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${ds.accuracy}%`, backgroundColor: meta.barColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-zinc-500">
          <span>{ds.proficient}/{ds.total} proficient</span>
          <span>{ds.attempted} questions attempted</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-1.5 animate-fadeUp">
          <div className="h-px bg-zinc-200/60 mb-2" />
          {sortedStandards.map((s) => {
            const mc = MASTERY_CONFIG[s.mastery];
            return (
              <div key={s.standard_id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-white/80 transition-colors group">
                {/* Mastery dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  s.mastery === "Proficient" ? "bg-emerald-500"
                  : s.mastery === "Developing" ? "bg-amber-400"
                  : s.mastery === "Needs Support" ? "bg-red-400"
                  : "bg-zinc-200"
                }`} />
                {/* ID */}
                <span className="text-[11px] font-bold text-zinc-500 w-14 flex-shrink-0">{s.standard_id}</span>
                {/* Name */}
                <span className="text-xs text-zinc-600 flex-1 min-w-0 truncate">{s.name}</span>
                {/* Accuracy */}
                {s.attempted > 0 ? (
                  <span className={`text-xs font-bold flex-shrink-0 ${mc.color}`}>{s.accuracy}%</span>
                ) : (
                  <span className="text-[10px] text-zinc-300 flex-shrink-0">—</span>
                )}
                {/* Practice link */}
                <Link
                  href={`/roadmap/practice?child=${childId}&standard=${s.standard_id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  Practice →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Standard Row                                           */
/* ═══════════════════════════════════════════════════════ */

function StandardRow({ stat }: { stat: StandardStat }) {
  const [expanded, setExpanded] = useState(false);
  const mc = MASTERY_CONFIG[stat.mastery];
  const dm = DOMAIN_META[stat.domain] || DOMAIN_META["Reading Literature"];

  return (
    <div
      className={`rounded-xl border transition-all ${
        expanded ? "border-zinc-300 shadow-sm" : "border-zinc-100 hover:border-zinc-200"
      }`}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-3 flex items-center gap-3"
      >
        {/* Mastery indicator dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          stat.mastery === "Proficient" ? "bg-emerald-500"
          : stat.mastery === "Developing" ? "bg-amber-400"
          : stat.mastery === "Needs Support" ? "bg-red-400"
          : "bg-zinc-200"
        }`} />

        {/* Standard ID */}
        <span className={`text-[11px] font-bold w-16 flex-shrink-0 ${dm.color}`}>
          {stat.standard_id}
        </span>

        {/* Name */}
        <span className="text-sm text-zinc-700 flex-1 min-w-0 truncate">
          {stat.name}
        </span>

        {/* Accuracy */}
        <span className={`text-sm font-bold flex-shrink-0 w-12 text-right ${
          stat.mastery === "Not Started" ? "text-zinc-300"
          : stat.mastery === "Proficient" ? "text-emerald-600"
          : stat.mastery === "Developing" ? "text-amber-600"
          : "text-red-500"
        }`}>
          {stat.attempted > 0 ? `${stat.accuracy}%` : "—"}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-zinc-300 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2.5 animate-fadeUp">
          {/* Mastery badge + domain */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${mc.bg} ${mc.color} ${mc.border}`}>
              {stat.mastery}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${dm.bg} ${dm.color}`}>
              {dm.emoji} {stat.domain}
            </span>
          </div>

          {/* Stats grid */}
          {stat.attempted > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 rounded-lg p-2 text-center">
                  <div className="text-zinc-900 font-bold text-sm">{stat.attempted}</div>
                  <div className="text-zinc-400 text-[10px]">Attempted</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 text-center">
                  <div className="text-emerald-700 font-bold text-sm">{stat.correct}</div>
                  <div className="text-emerald-500 text-[10px]">Correct</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <div className="text-red-600 font-bold text-sm">{stat.incorrect}</div>
                  <div className="text-red-400 text-[10px]">Incorrect</div>
                </div>
              </div>
              {/* Accuracy bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-zinc-500">Accuracy</span>
                  <span className="font-bold text-zinc-700">{stat.accuracy}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.accuracy >= 80 ? "bg-emerald-500"
                      : stat.accuracy >= 50 ? "bg-amber-400"
                      : "bg-red-400"
                    }`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-zinc-400 py-2">
              No attempts yet. This standard will be tracked once practice begins.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Mastery Pill                                           */
/* ═══════════════════════════════════════════════════════ */

function MasteryPill({ label, count, total, level }: { label: string; count: number; total: number; level: MasteryLevel }) {
  const mc = MASTERY_CONFIG[level];
  const pct = Math.round((count / total) * 100);

  return (
    <div className={`rounded-xl border ${mc.border} ${mc.bg} p-2.5 text-center`}>
      <div className={`font-bold text-lg ${mc.color}`}>{count}</div>
      <div className={`text-[10px] font-medium ${mc.color} opacity-80`}>{label}</div>
      <div className="mt-1 h-1 bg-white/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            level === "Proficient" ? "bg-emerald-400"
            : level === "Developing" ? "bg-amber-400"
            : level === "Needs Support" ? "bg-red-400"
            : "bg-zinc-300"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
