"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Newspaper, Type, MessageCircle, Carrot, Star, Lock, Rabbit } from "lucide-react";

/* ─── Demo Data ──────────────────────────────────────── */

const CHILD_NAME = "Emma";
const CHILD_GRADE = "Kindergarten";
const STREAK_DAYS = 5;
const TOTAL_CARROTS = 120;

interface DemoNode {
  id: string;
  kidName: string;
  domain: string;
  status: "completed" | "current" | "locked";
  isFirstOfDomain: boolean;
}

const DEMO_NODES: DemoNode[] = [
  { id: "RL.K.1", kidName: "Key Details", domain: "Reading Literature", status: "completed", isFirstOfDomain: true },
  { id: "RL.K.2", kidName: "Retelling", domain: "Reading Literature", status: "completed", isFirstOfDomain: false },
  { id: "RL.K.3", kidName: "Story People", domain: "Reading Literature", status: "completed", isFirstOfDomain: false },
  { id: "RL.K.4", kidName: "New Words", domain: "Reading Literature", status: "completed", isFirstOfDomain: false },
  { id: "RI.K.1", kidName: "Info Details", domain: "Reading Informational Text", status: "completed", isFirstOfDomain: true },
  { id: "RI.K.2", kidName: "Main Topic", domain: "Reading Informational Text", status: "current", isFirstOfDomain: false },
  { id: "RI.K.3", kidName: "Linking Ideas", domain: "Reading Informational Text", status: "locked", isFirstOfDomain: false },
  { id: "RF.K.1a", kidName: "Word Tracking", domain: "Foundational Skills", status: "locked", isFirstOfDomain: true },
  { id: "RF.K.2a", kidName: "Rhyming", domain: "Foundational Skills", status: "locked", isFirstOfDomain: false },
  { id: "K.L.1", kidName: "Grammar", domain: "Language", status: "locked", isFirstOfDomain: true },
];

const DOMAIN_ICONS: Record<string, typeof BookOpen> = {
  "Reading Literature": BookOpen,
  "Reading Informational Text": Newspaper,
  "Foundational Skills": Type,
  "Language": MessageCircle,
};

/* ─── Animation Helpers ──────────────────────────────── */
/*
 * ALL animations use performance.now() + requestAnimationFrame.
 * Both are overridden by the recording script's virtual time system,
 * so animations stay perfectly synced in browser AND recording.
 * NO CSS transitions — everything is computed per-frame in JS.
 */

function useElapsed(): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let running = true;
    function tick() {
      if (!running) return;
      setElapsed(performance.now() - start);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);
  return elapsed;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Cubic ease-out: fast start, smooth deceleration */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Smooth ease-in-out for scrolling */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Returns eased 0→1 progress for an animation starting at `start` ms */
function anim(elapsed: number, start: number, duration: number): number {
  return easeOut(clamp01((elapsed - start) / duration));
}

/* ─── Layout ─────────────────────────────────────────── */

const NODE_VERTICAL_SPACING = 200;
const PATH_ROAD_W = 56;
const PATH_BORDER_W = 64;

interface NodeLayout { node: DemoNode; x: number; y: number }

function computeLayout(containerWidth: number): { nodes: NodeLayout[]; totalHeight: number } {
  const amplitude = Math.min(containerWidth * 0.28, 180);
  const cx = containerWidth / 2;
  let y = 80;
  const nodes: NodeLayout[] = [];

  for (let i = 0; i < DEMO_NODES.length; i++) {
    const n = DEMO_NODES[i];
    if (n.isFirstOfDomain && i > 0) y += 40;
    const phase = i % 4;
    const xOffset = phase === 0 ? -amplitude : phase === 2 ? amplitude : 0;
    nodes.push({ node: n, x: cx + xOffset, y });
    y += NODE_VERTICAL_SPACING;
  }

  return { nodes, totalHeight: y + 100 };
}

function buildBezierPath(nodes: NodeLayout[]): string {
  if (nodes.length < 2) return "";
  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    const dy = cur.y - prev.y;
    d += ` C ${prev.x} ${prev.y + dy * 0.55}, ${cur.x} ${cur.y - dy * 0.55}, ${cur.x} ${cur.y}`;
  }
  return d;
}

/* ─── Animation Timeline (ms) ────────────────────────── */

const T = {
  HEADER_START: 400,     HEADER_DUR: 800,
  AVATAR_START: 500,     AVATAR_DUR: 600,
  PROGRESS_START: 1200,  PROGRESS_DUR: 700,
  RING_START: 1600,      RING_DUR: 1500,
  COUNTUP_START: 1300,   COUNTUP_DUR: 1200,
  PATH_START: 2200,      PATH_DUR: 3500,
  COMPLETED_START: 3200, COMPLETED_DUR: 3500,
  FIRST_NODE: 4500,      NODE_INTERVAL: 500,  NODE_DUR: 500,
  SCROLL_START: 2500,    SCROLL_DUR: 12000,
  BREATHE_PERIOD: 2000,
};

/* ─── Component ──────────────────────────────────────── */

export default function RoadmapDemoPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<HTMLDivElement>(null);
  const [pathWidth, setPathWidth] = useState(500);
  const elapsed = useElapsed();

  /* Measure container */
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    setPathWidth(el.offsetWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setPathWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Auto-scroll (rAF + performance.now = virtual-time safe) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let running = true;
    const start = performance.now();

    function tick() {
      if (!running || !el) return;
      const e = performance.now() - start;
      if (e >= T.SCROLL_START) {
        const p = clamp01((e - T.SCROLL_START) / T.SCROLL_DUR);
        const totalScroll = el.scrollHeight - el.clientHeight;
        el.scrollTop = easeInOut(p) * totalScroll * 0.7;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);

  /* ── Compute all animation values from elapsed ── */

  const headerP = anim(elapsed, T.HEADER_START, T.HEADER_DUR);
  const avatarP = anim(elapsed, T.AVATAR_START, T.AVATAR_DUR);
  const progressP = anim(elapsed, T.PROGRESS_START, T.PROGRESS_DUR);
  const pathDrawP = anim(elapsed, T.PATH_START, T.PATH_DUR);
  const completedP = anim(elapsed, T.COMPLETED_START, T.COMPLETED_DUR);
  const ringP = anim(elapsed, T.RING_START, T.RING_DUR);

  // Count-up
  const countP = easeOut(clamp01((elapsed - T.COUNTUP_START) / T.COUNTUP_DUR));
  const animCarrots = Math.round(countP * TOTAL_CARROTS);
  const animStreak = Math.round(countP * STREAK_DAYS);
  const animTotal = Math.round(countP * DEMO_NODES.length);

  // Per-node 0→1 progress (fade + slide)
  const nodeProgress = DEMO_NODES.map((_, i) =>
    anim(elapsed, T.FIRST_NODE + i * T.NODE_INTERVAL, T.NODE_DUR)
  );

  // Breathing glow for current node (JS-driven sine wave)
  const breathePhase = elapsed >= T.FIRST_NODE
    ? ((elapsed - T.FIRST_NODE) % T.BREATHE_PERIOD) / T.BREATHE_PERIOD
    : 0;
  const breatheGlow = Math.sin(breathePhase * Math.PI * 2) * 0.5 + 0.5;

  /* ── Layout ── */

  const { nodes, totalHeight } = computeLayout(pathWidth);
  const fullPathD = buildBezierPath(nodes);
  const completedEnd = DEMO_NODES.findIndex((n) => n.status === "current") + 1;
  const completedPathD = buildBezierPath(nodes.slice(0, completedEnd));
  const completedCount = DEMO_NODES.filter((n) => n.status === "completed").length;
  const pct = Math.round((completedCount / DEMO_NODES.length) * 100);
  const approxPathLength = totalHeight * 1.4;

  // Progress ring
  const circumference = 264;
  const ringOffset = circumference - (circumference * pct / 100) * ringP;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ── Full-page world background ── */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              #e0f2fe 0%, #bae6fd 10%, #e0f2fe 20%,
              #fef9c3 32%, #fed7aa 44%, #fdba74 56%,
              #fb923c 68%, #f472b6 82%, #7c3aed 94%, #312e81 100%
            )`,
          }}
        />
        {/* Clouds */}
        <svg className="absolute" style={{ top: "2%", left: "5%", opacity: 0.5 }} width="100" height="40" viewBox="0 0 100 40">
          <ellipse cx="50" cy="25" rx="45" ry="14" fill="white" />
          <ellipse cx="35" cy="18" rx="25" ry="12" fill="white" />
          <ellipse cx="68" cy="18" rx="28" ry="10" fill="white" />
        </svg>
        <svg className="absolute" style={{ top: "6%", right: "8%", opacity: 0.4 }} width="80" height="35" viewBox="0 0 80 35">
          <ellipse cx="40" cy="22" rx="36" ry="12" fill="white" />
          <ellipse cx="28" cy="16" rx="20" ry="10" fill="white" />
          <ellipse cx="55" cy="15" rx="22" ry="9" fill="white" />
        </svg>
        {/* Tree silhouettes */}
        <svg className="absolute" style={{ top: "42%", left: 0, opacity: 0.15 }} width="45" height="70" viewBox="0 0 45 70">
          <polygon points="22,0 45,50 0,50" fill="#1c1917" />
          <rect x="18" y="50" width="8" height="20" fill="#1c1917" />
        </svg>
        <svg className="absolute" style={{ top: "46%", right: 0, opacity: 0.12 }} width="35" height="55" viewBox="0 0 35 55">
          <polygon points="17,0 35,40 0,40" fill="#1c1917" />
          <rect x="14" y="40" width="6" height="15" fill="#1c1917" />
        </svg>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative" style={{ scrollBehavior: "auto", zIndex: 1 }}>
        {/* ── Header ── */}
        <div
          className="max-w-lg mx-auto px-6 pt-5"
          style={{
            opacity: headerP,
            transform: `translateY(${(1 - headerP) * 20}px)`,
          }}
        >
          <div className="text-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-3xl mx-auto mb-2 shadow-sm"
              style={{
                opacity: avatarP,
                transform: `scale(${0.5 + avatarP * 0.5})`,
              }}
            >
              <Rabbit className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight drop-shadow-sm">
              {CHILD_NAME}&apos;s Reading Journey
            </h1>
            <p className="text-zinc-600 text-sm mt-1 drop-shadow-sm">{CHILD_GRADE} ELA Standards</p>
          </div>

          {/* ── Top Progress Bar ── */}
          <div
            className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 shadow-lg mb-6"
            style={{
              opacity: progressP,
              transform: `translateY(${(1 - progressP) * 12}px) scale(${0.97 + progressP * 0.03})`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-12 h-12 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{pct}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold">{completedCount} of {DEMO_NODES.length} standards</div>
                <div className="text-white/60 text-xs mt-0.5">Keep up the great work!</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm tabular-nums">{animCarrots}</div>
                <Carrot className="w-3 h-3 text-white/50 mx-auto" strokeWidth={1.5} />
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm tabular-nums">{animStreak}</div>
                <div className="text-white/50 text-[9px]">Streak</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm tabular-nums">{animTotal}</div>
                <div className="text-white/50 text-[9px]">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Snake Path Area ── */}
        <div className="px-6">
          <div ref={pathRef} className="relative w-full" style={{ height: totalHeight }}>
            {/* SVG path layer */}
            <svg
              className="absolute left-0 top-0 w-full pointer-events-none"
              viewBox={`0 0 ${pathWidth} ${totalHeight}`}
              preserveAspectRatio="xMidYMin meet"
            >
              <defs>
                <linearGradient id="snakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Road shadow */}
              <path
                d={fullPathD} fill="none" stroke="rgba(0,0,0,0.18)"
                strokeWidth={PATH_BORDER_W} strokeLinecap="round"
                transform="translate(0, 5)"
                strokeDasharray={approxPathLength}
                strokeDashoffset={approxPathLength * (1 - pathDrawP)}
              />
              {/* Road border */}
              <path
                d={fullPathD} fill="none" stroke="#312e81"
                strokeWidth={PATH_BORDER_W} strokeLinecap="round"
                strokeDasharray={approxPathLength}
                strokeDashoffset={approxPathLength * (1 - pathDrawP)}
              />
              {/* Road surface */}
              <path
                d={fullPathD} fill="none" stroke="#ede9fe"
                strokeWidth={PATH_ROAD_W} strokeLinecap="round"
                strokeDasharray={approxPathLength}
                strokeDashoffset={approxPathLength * (1 - pathDrawP)}
              />
              {/* Completed road overlay */}
              {completedPathD && (
                <path
                  d={completedPathD} fill="none" stroke="url(#snakeGrad)"
                  strokeWidth={PATH_ROAD_W} strokeLinecap="round"
                  filter="url(#pathGlow)"
                  strokeDasharray={approxPathLength}
                  strokeDashoffset={approxPathLength * (1 - completedP)}
                />
              )}
            </svg>

            {/* Domain labels — appear with their first node */}
            {nodes
              .filter((n) => n.node.isFirstOfDomain)
              .map((n) => {
                const nodeIdx = DEMO_NODES.findIndex((d) => d.id === n.node.id);
                const Icon = DOMAIN_ICONS[n.node.domain];
                const dark = n.y / totalHeight > 0.44;
                const p = nodeProgress[nodeIdx] ?? 0;
                return (
                  <div
                    key={`domain-${n.node.domain}`}
                    className={`absolute left-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ${
                      dark
                        ? "bg-slate-900/70 border border-slate-600/60"
                        : "bg-white/80 border border-zinc-200/60"
                    }`}
                    style={{
                      top: n.y - 55,
                      zIndex: 5,
                      opacity: p,
                      transform: `translateX(-50%) translateY(${(1 - p) * 10}px)`,
                    }}
                  >
                    {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
                    <span className={`text-[11px] font-semibold ${dark ? "text-slate-200" : "text-zinc-600"}`}>
                      {n.node.domain}
                    </span>
                  </div>
                );
              })}

            {/* Nodes — fade + slide in (no bouncy scale) */}
            {nodes.map((nl, i) => {
              const { node, x, y } = nl;
              const nodeSize = node.status === "current" ? 48 : node.status === "completed" ? 42 : 36;
              const leftPct = pathWidth > 0 ? (x / pathWidth) * 100 : 50;
              const p = nodeProgress[i];

              const phase = i % 4;
              const labelRight = phase === 0 || phase === 3;
              const dark = y / totalHeight > 0.44;
              const labelColor = node.status === "completed"
                ? (dark ? "text-emerald-300" : "text-emerald-700")
                : node.status === "current"
                  ? (dark ? "text-indigo-300" : "text-indigo-700")
                  : (dark ? "text-zinc-300" : "text-zinc-400");

              // JS-driven breathe glow for current node
              const glowRadius = node.status === "current" ? breatheGlow * 12 : 0;
              const boxShadow = node.status === "current" && p > 0.5
                ? `0 4px 0 0 #4338ca, 0 0 0 ${glowRadius}px rgba(99,102,241,${0.4 * (1 - breatheGlow)})`
                : node.status === "current"
                  ? "0 4px 0 0 #4338ca"
                  : undefined;

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    top: y - nodeSize / 2,
                    left: `${leftPct}%`,
                    width: nodeSize,
                    height: nodeSize,
                    transform: `translateX(-50%) translateY(${(1 - p) * 15}px)`,
                    opacity: p,
                    zIndex: node.status === "current" ? 20 : 10,
                  }}
                >
                  {node.status === "completed" && (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_3px_0_0_#059669] border-[3px] border-emerald-300/80 relative">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm border-2 border-white">
                        <Star className="w-3 h-3 text-white" strokeWidth={1.5} />
                      </span>
                    </div>
                  )}
                  {node.status === "current" && (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-[3px] border-indigo-300/80"
                      style={{ boxShadow }}
                    >
                      <span className="text-lg font-extrabold drop-shadow-sm">{i + 1}</span>
                    </div>
                  )}
                  {node.status === "locked" && (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-300 to-zinc-400 text-zinc-500 shadow-[0_2px_0_0_#a1a1aa] opacity-60 border-[3px] border-zinc-200">
                      <Lock className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  )}

                  {/* Kid-friendly label */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
                    style={labelRight
                      ? { left: "100%", marginLeft: Math.max(16, PATH_BORDER_W / 2 - nodeSize / 2 + 10) }
                      : { right: "100%", marginRight: Math.max(16, PATH_BORDER_W / 2 - nodeSize / 2 + 10) }
                    }
                  >
                    <span className={`text-[11px] font-semibold ${labelColor}`} style={{ opacity: p }}>
                      {node.kidName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
