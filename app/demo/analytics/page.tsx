"use client";

import { useState, useEffect, useRef } from "react";
import { Rabbit } from "lucide-react";

/* ─── Fake data for demo ─────────────────────────────── */
const CHILD_NAME = "Emma";
const CHILD_GRADE = "Kindergarten";

const STATS = { attempted: 87, accuracy: 84, sessions: 14 };

const CHART_DATA = [
  { label: "Feb 10", accuracy: 45 },
  { label: "Feb 13", accuracy: 58 },
  { label: "Feb 16", accuracy: 50 },
  { label: "Feb 19", accuracy: 62 },
  { label: "Feb 22", accuracy: 55 },
  { label: "Feb 25", accuracy: 68 },
  { label: "Feb 28", accuracy: 60 },
  { label: "Mar 1", accuracy: 75 },
  { label: "Mar 3", accuracy: 84 },
];

const STRENGTHS = [
  { domain: "Reading Literature", best: "Retell familiar stories", accuracy: 92, color: "#8b5cf6", bg: "bg-violet-100" },
  { domain: "Foundational Skills", best: "Letter recognition", accuracy: 88, color: "#10b981", bg: "bg-emerald-100" },
  { domain: "Reading Informational", best: "Identify main topic", accuracy: 85, color: "#3b82f6", bg: "bg-blue-100" },
];

const WEAKNESSES = [
  { domain: "Language", focus: "Capitalization & punctuation", color: "#f59e0b", bg: "bg-amber-100" },
  { domain: "Foundational Skills", focus: "Vowel sounds", color: "#10b981", bg: "bg-emerald-100" },
  { domain: "Reading Literature", focus: "Character, setting, events", color: "#8b5cf6", bg: "bg-violet-100" },
];

const CURRICULUM = [
  { domain: "Reading Literature", practiced: 5, total: 8, color: "#8b5cf6" },
  { domain: "Reading Informational", practiced: 4, total: 9, color: "#3b82f6" },
  { domain: "Foundational Skills", practiced: 9, total: 14, color: "#10b981" },
  { domain: "Language", practiced: 2, total: 5, color: "#f59e0b" },
];

const RECENT = [
  { date: "Mar 3", name: "Retell familiar stories", standard: "RL.K.2", score: "4/5", carrots: 12 },
  { date: "Mar 3", name: "Letter recognition", standard: "RF.K.1", score: "5/5", carrots: 15 },
  { date: "Mar 1", name: "Identify main topic", standard: "RI.K.2", score: "4/5", carrots: 12 },
  { date: "Mar 1", name: "Vowel sounds", standard: "RF.K.3", score: "3/5", carrots: 9 },
  { date: "Feb 28", name: "Capitalization & punctuation", standard: "L.K.2", score: "3/5", carrots: 9 },
];

/* ─── SVG Icons (inline) ─────────────────────────────── */
const FileTextIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const TargetIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const ZapIcon = () => (
  <svg className="w-4 h-4 text-emerald-500 inline-block" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const SproutIcon = () => (
  <svg className="w-4 h-4 text-amber-500 inline-block" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 5.25A3.75 3.75 0 0112 9m0 0A3.75 3.75 0 018.25 5.25M12 9v4.5M3.75 18h16.5" />
  </svg>
);

/* ─── Animated Count-Up Hook ─────────────────────────── */
function useCountUp(target: number, duration: number, start: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) { setValue(0); return; }
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

/* ─── Accuracy Ring ──────────────────────────────────── */
function AccuracyRing({ accuracy, animate }: { accuracy: number; animate: boolean }) {
  const r = 28;
  const C = 2 * Math.PI * r;
  const ringColor = accuracy >= 70 ? "#10b981" : accuracy >= 50 ? "#f59e0b" : "#ef4444";
  const offset = animate ? C - (C * accuracy) / 100 : C;
  const displayVal = useCountUp(accuracy, 1200, animate);

  return (
    <div className="relative w-16 h-16 mx-auto mb-1">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f4f4f5" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={ringColor} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-zinc-900">
        {displayVal}%
      </span>
    </div>
  );
}

/* ─── Animated Line Chart ────────────────────────────── */
function AnimatedChart({ data, animate }: { data: typeof CHART_DATA; animate: boolean }) {
  const W = 560, H = 180, PL = 36, PR = 16, PT = 20, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;

  const pts = data.map((d, i) => ({
    x: PL + (i / Math.max(data.length - 1, 1)) * cW,
    y: PT + cH - (d.accuracy / 100) * cH,
    ...d,
  }));

  const line = pts.reduce((p, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    return `${p} C ${prev.x + (pt.x - prev.x) * 0.4} ${prev.y}, ${pt.x - (pt.x - prev.x) * 0.4} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const area = `${line} L ${pts[pts.length - 1].x} ${PT + cH} L ${pts[0].x} ${PT + cH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((t) => {
        const y = PT + cH - (t / 100) * cH;
        return (
          <g key={t}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f4f4f5" strokeWidth="1" />
            <text x={PL - 6} y={y + 3} textAnchor="end" fill="#a1a1aa" fontSize="10">{t}%</text>
          </g>
        );
      })}
      {/* Area fill */}
      <path
        d={area}
        fill="url(#cg)"
        className={animate ? "chart-area-in" : ""}
        style={{ opacity: animate ? 1 : 0, transition: "opacity 0.6s ease 0.6s" }}
      />
      {/* Line draws itself */}
      <path
        d={line}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "chart-line-draw" : ""}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: animate ? 0 : 1000,
          transition: "stroke-dashoffset 1.5s ease-out",
        }}
      />
      {/* Dots */}
      {pts.map((pt, i) => (
        <g key={i} style={{ opacity: animate ? 1 : 0, transition: `opacity 0.3s ease ${0.8 + i * 0.1}s` }}>
          <circle cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" />
          <text x={pt.x} y={PT + cH + 18} textAnchor="middle" fill="#a1a1aa" fontSize="10">{pt.label}</text>
          {(i === 0 || i === pts.length - 1) && (
            <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">{pt.accuracy}%</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────── */
export default function AnalyticsDemoPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Staggered animation triggers
  const [showHeader, setShowHeader] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showStrengths, setShowStrengths] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  // Animated count-up values
  const attempted = useCountUp(STATS.attempted, 1000, showStats);
  const sessions = useCountUp(STATS.sessions, 1000, showStats);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setShowHeader(true), 300));
    timers.push(setTimeout(() => setShowTabs(true), 700));
    timers.push(setTimeout(() => setShowStats(true), 1200));
    timers.push(setTimeout(() => setShowChart(true), 2500));
    timers.push(setTimeout(() => setShowStrengths(true), 4000));
    timers.push(setTimeout(() => setShowCurriculum(true), 6000));
    timers.push(setTimeout(() => setShowRecent(true), 8000));

    // Auto-scroll
    timers.push(setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const totalScroll = el.scrollHeight - el.clientHeight;
      const duration = 8000;
      const startTime = performance.now();

      function scroll(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        el!.scrollTop = eased * totalScroll;
        if (progress < 1) requestAnimationFrame(scroll);
      }
      requestAnimationFrame(scroll);
    }, 3000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const totalPracticed = CURRICULUM.reduce((s, c) => s + c.practiced, 0);
  const totalStandards = CURRICULUM.reduce((s, c) => s + c.total, 0);
  const overallPct = Math.round((totalPracticed / totalStandards) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollBehavior: "auto" }}>
        <div className="max-w-3xl mx-auto px-6 pb-20">

          {/* ═══ Header ═══ */}
          <div className={`pt-6 mb-6 transition-all duration-700 ${showHeader ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl flex-shrink-0">
                <Rabbit className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {CHILD_NAME}&apos;s Progress
                </h1>
                <p className="text-sm text-zinc-500">{CHILD_GRADE}</p>
              </div>
              <span className="text-sm text-indigo-600 font-medium flex-shrink-0">
                &larr; Dashboard
              </span>
            </div>

            {/* Date range tabs */}
            <div className={`flex gap-1.5 bg-zinc-100 rounded-xl p-1 transition-all duration-500 ${showTabs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {["This Week", "This Month", "All Time"].map((label, i) => (
                <button
                  key={label}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    i === 2
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Key Stats ═══ */}
          <div className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-700 ${showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="flex justify-center mb-1"><FileTextIcon /></div>
              <div className="text-2xl font-bold text-zinc-900 tabular-nums">{attempted}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">Questions Answered</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <AccuracyRing accuracy={STATS.accuracy} animate={showStats} />
              <div className="text-[11px] text-zinc-500 font-medium">Accuracy</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="flex justify-center mb-1"><TargetIcon /></div>
              <div className="text-2xl font-bold text-zinc-900 tabular-nums">{sessions}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">Practice Sessions</div>
            </div>
          </div>

          {/* ═══ Progress Chart ═══ */}
          <div className={`rounded-2xl border border-zinc-200 bg-white p-5 mb-6 shadow-sm transition-all duration-700 ${showChart ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="text-base font-bold text-zinc-900 mb-4">
              How {CHILD_NAME} is doing
            </h2>
            <AnimatedChart data={CHART_DATA} animate={showChart} />
          </div>

          {/* ═══ Strengths & Weaknesses ═══ */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 transition-all duration-700 ${showStrengths ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">
                Strengths <ZapIcon />
              </h3>
              <div className="space-y-3">
                {STRENGTHS.map((s, idx) => (
                  <div
                    key={s.domain}
                    className="flex items-start gap-3"
                    style={{
                      opacity: showStrengths ? 1 : 0,
                      transform: showStrengths ? "translateX(0)" : "translateX(-12px)",
                      transition: `all 0.4s ease ${idx * 0.15}s`,
                    }}
                  >
                    <div className={`w-7 h-7 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800">{s.domain}</div>
                      <div className="text-xs text-zinc-400 truncate">Best: {s.best}</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex-shrink-0 pt-0.5">{s.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keep Practicing */}
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/80 to-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">
                Keep Practicing <SproutIcon />
              </h3>
              <div className="space-y-3">
                {WEAKNESSES.map((w, idx) => (
                  <div
                    key={w.domain}
                    className="flex items-start gap-3"
                    style={{
                      opacity: showStrengths ? 1 : 0,
                      transform: showStrengths ? "translateX(0)" : "translateX(12px)",
                      transition: `all 0.4s ease ${idx * 0.15}s`,
                    }}
                  >
                    <div className={`w-7 h-7 rounded-full ${w.bg} flex items-center justify-center flex-shrink-0`}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800">{w.domain}</div>
                      <div className="text-xs text-zinc-400 truncate">Focus: {w.focus}</div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 flex-shrink-0 pt-0.5">
                      Practice &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Curriculum Progress ═══ */}
          <div className={`rounded-2xl border border-zinc-200 bg-white p-5 mb-6 shadow-sm transition-all duration-700 ${showCurriculum ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="text-base font-bold text-zinc-900 mb-1">Curriculum Progress</h2>
            <p className="text-xs text-zinc-500 mb-4">
              {overallPct}% of {CHILD_GRADE} standards practiced
            </p>

            {/* Overall bar */}
            <div className="h-3 bg-zinc-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-full rounded-full"
                style={{
                  width: showCurriculum ? `${overallPct}%` : "0%",
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  transition: "width 1.2s ease-out",
                }}
              />
            </div>

            {/* Domain rows */}
            <div className="space-y-3">
              {CURRICULUM.map((c, idx) => {
                const pct = Math.round((c.practiced / c.total) * 100);
                return (
                  <div key={c.domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: c.color }}>{c.domain}</span>
                      <span className="text-xs text-zinc-500 font-medium">{c.practiced}/{c.total}</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: showCurriculum ? `${pct}%` : "0%",
                          backgroundColor: c.color,
                          transition: `width 1s ease-out ${0.3 + idx * 0.2}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ Recent Activity ═══ */}
          <div className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-700 ${showRecent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="text-base font-bold text-zinc-900 mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {RECENT.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
                  style={{
                    opacity: showRecent ? 1 : 0,
                    transform: showRecent ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.3s ease ${i * 0.12}s`,
                  }}
                >
                  <div className="text-xs text-zinc-400 w-16 flex-shrink-0 font-medium">{r.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-800 truncate">{r.name}</div>
                    <div className="text-xs text-zinc-400">{r.standard}</div>
                  </div>
                  <div className="text-sm font-bold text-zinc-700 flex-shrink-0">{r.score}</div>
                  <div className="text-xs font-medium text-amber-600 flex-shrink-0">+{r.carrots} 🥕</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
