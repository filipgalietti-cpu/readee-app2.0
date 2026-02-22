"use client";

import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import kStandards from "@/app/data/kindergarten-standards-questions.json";
import { safeValidate } from "@/lib/validate";
import { ChildSchema, StandardsFileSchema } from "@/lib/schemas";

/* ─── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  type: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string;
  difficulty: number;
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: Question[];
}

interface StandardProgress {
  status: "completed" | "current" | "locked";
  score?: number;
  total?: number;
  xpEarned?: number;
}

/* ─── Constants ──────────────────────────────────────── */

const FREE_STANDARD_COUNT = 10;
const NODE_VERTICAL_SPACING = 240;
const PATH_ROAD_W = 56;
const PATH_BORDER_W = 64;

const DOMAIN_META: Record<string, { emoji: string }> = {
  "Reading Literature":         { emoji: "📖" },
  "Reading Informational Text": { emoji: "📰" },
  "Foundational Skills":        { emoji: "🔤" },
  "Language":                   { emoji: "💬" },
};

const MASCOTS: { afterNode: number; emoji: string; message: string }[] = [
  { afterNode: 3,  emoji: "🐰", message: "Great start! Keep going!" },
  { afterNode: 8,  emoji: "🦊", message: "You're doing amazing!" },
  { afterNode: 15, emoji: "🦡", message: "Almost halfway there!" },
];

const KID_NAMES: Record<string, string> = {
  // Reading Literature
  "RL.K.1": "Key Details",
  "RL.K.2": "Retelling",
  "RL.K.3": "Story People",
  "RL.K.4": "New Words",
  "RL.K.5": "Book Types",
  "RL.K.6": "Authors",
  "RL.K.7": "Story Art",
  "RL.K.9": "Compare Stories",
  // Reading Informational Text
  "RI.K.1": "Info Details",
  "RI.K.2": "Main Topic",
  "RI.K.3": "Linking Ideas",
  "RI.K.4": "Info Words",
  "RI.K.5": "Book Parts",
  "RI.K.6": "Who Wrote?",
  "RI.K.7": "Art & Text",
  "RI.K.8": "Author's Why",
  "RI.K.9": "Compare Texts",
  // Foundational Skills
  "RF.K.1a": "Word Tracking",
  "RF.K.1b": "Print Concepts",
  "RF.K.1c": "Word Spaces",
  "RF.K.1d": "ABCs",
  "RF.K.2a": "Rhyming",
  "RF.K.2b": "Syllables",
  "RF.K.2c": "Blending",
  "RF.K.2d": "Sound Out",
  "RF.K.2e": "New Sounds",
  "RF.K.3a": "Letter Sounds",
  "RF.K.3b": "Vowel Sounds",
  "RF.K.3c": "Sight Words",
  "RF.K.3d": "Spelling Clues",
  "RF.K.4": "Reading Time",
  // Language
  "K.L.1": "Grammar",
  "K.L.2": "Punctuation",
  "K.L.4": "Word Meaning",
  "K.L.5": "Word Play",
  "K.L.6": "Vocabulary",
};

/* ─── Mock progress ──────────────────────────────────── */

const ALL_STANDARDS = safeValidate(StandardsFileSchema, kStandards).standards as Standard[];

function buildMockProgress(standards: Standard[]): Record<string, StandardProgress> {
  const progress: Record<string, StandardProgress> = {};
  const doneCount = 8;

  standards.forEach((std, i) => {
    if (i < doneCount) {
      progress[std.standard_id] = {
        status: "completed",
        score: 3 + (i % 3),
        total: 5,
        xpEarned: 15 + (i % 4) * 5,
      };
    } else if (i === doneCount) {
      progress[std.standard_id] = { status: "current", score: 2, total: 5 };
    } else {
      progress[std.standard_id] = { status: "locked" };
    }
  });
  return progress;
}

/* ─── Helpers ────────────────────────────────────────── */

function shortName(desc: string): string {
  const cleaned = desc
    .replace(/^With prompting and support, /i, "")
    .replace(/^Demonstrate understanding of /i, "")
    .replace(/^Recognize and name /i, "")
    .replace(/^Know and apply /i, "");
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 55 ? capped.slice(0, 52) + "..." : capped;
}

/* ─── Path Helpers ───────────────────────────────────── */

interface NodeLayout {
  standard: Standard;
  globalIdx: number;
  x: number;
  y: number;
  domain: string;
  isFirstOfDomain: boolean;
}

function computeSnakeLayout(
  standards: Standard[],
  containerWidth: number,
): { nodes: NodeLayout[]; totalHeight: number } {
  const nodes: NodeLayout[] = [];
  const isMobile = containerWidth < 500;
  const amplitude = isMobile ? containerWidth * 0.28 : containerWidth * 0.30;
  const cx = containerWidth / 2;
  let y = 80;
  let prevDomain = "";

  for (let i = 0; i < standards.length; i++) {
    const std = standards[i];
    const isFirstOfDomain = std.domain !== prevDomain;
    if (isFirstOfDomain && i > 0) y += 40;

    // Sine-based horizontal offset: nodes snake left-right
    const phase = (i % 4);
    let xOffset: number;
    if (phase === 0) xOffset = -amplitude;
    else if (phase === 1) xOffset = 0;
    else if (phase === 2) xOffset = amplitude;
    else xOffset = 0;

    nodes.push({
      standard: std,
      globalIdx: i,
      x: cx + xOffset,
      y,
      domain: std.domain,
      isFirstOfDomain,
    });

    prevDomain = std.domain;
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
    const cp1y = prev.y + dy * 0.55;
    const cp2y = cur.y - dy * 0.55;
    d += ` C ${prev.x} ${cp1y}, ${cur.x} ${cp2y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

function getMascotPositions(nodes: NodeLayout[]): {
  nodeIndex: number;
  side: "left" | "right";
  emoji: string;
  message: string;
  x: number;
  y: number;
}[] {
  return MASCOTS.filter((m) => m.afterNode < nodes.length).map((m, i) => {
    const node = nodes[m.afterNode];
    const nextNode = nodes[m.afterNode + 1];
    const midY = nextNode ? (node.y + nextNode.y) / 2 : node.y + 60;
    const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
    const xOffset = side === "right" ? 110 : -110;
    return {
      nodeIndex: m.afterNode,
      side,
      emoji: m.emoji,
      message: m.message,
      x: (node.x + (nextNode?.x || node.x)) / 2 + xOffset,
      y: midY,
    };
  });
}

/* ─── Zone Helper ───────────────────────────────────── */

function getNodeZone(y: number, totalHeight: number): "meadow" | "sunset" | "night" | "space" {
  const pct = totalHeight > 0 ? y / totalHeight : 0;
  if (pct < 0.25) return "meadow";
  if (pct < 0.50) return "sunset";
  if (pct < 0.75) return "night";
  return "space";
}

function isDarkZone(y: number, totalHeight: number): boolean {
  return totalHeight > 0 && y / totalHeight > 0.44;
}

/* ─── Star positions (deterministic to avoid SSR mismatch) ── */

const STAR_POSITIONS = [
  { top: 53, left: 8, size: 2, delay: 0 },
  { top: 55, left: 22, size: 1.5, delay: 1.2 },
  { top: 57, left: 45, size: 2.5, delay: 0.5 },
  { top: 54, left: 67, size: 1, delay: 2.1 },
  { top: 59, left: 88, size: 2, delay: 0.8 },
  { top: 61, left: 15, size: 1.5, delay: 1.8 },
  { top: 56, left: 35, size: 2, delay: 3.2 },
  { top: 63, left: 52, size: 1, delay: 0.3 },
  { top: 58, left: 78, size: 2.5, delay: 2.5 },
  { top: 65, left: 5, size: 1.5, delay: 1.5 },
  { top: 60, left: 92, size: 2, delay: 0.9 },
  { top: 67, left: 30, size: 1, delay: 3.5 },
  { top: 62, left: 60, size: 2, delay: 2.0 },
  { top: 69, left: 18, size: 1.5, delay: 0.7 },
  { top: 64, left: 73, size: 2.5, delay: 1.1 },
  { top: 71, left: 42, size: 1, delay: 2.8 },
  { top: 66, left: 85, size: 2, delay: 0.4 },
  { top: 73, left: 10, size: 1.5, delay: 3.0 },
  { top: 68, left: 55, size: 2, delay: 1.6 },
  { top: 75, left: 38, size: 1, delay: 2.3 },
  { top: 52, left: 48, size: 2.5, delay: 0.2 },
  { top: 70, left: 25, size: 1.5, delay: 3.8 },
  { top: 54, left: 95, size: 2, delay: 1.4 },
  { top: 72, left: 65, size: 1, delay: 2.6 },
  { top: 57, left: 3, size: 2, delay: 0.6 },
  { top: 77, left: 12, size: 2, delay: 1.0 },
  { top: 79, left: 33, size: 1.5, delay: 2.2 },
  { top: 81, left: 58, size: 2.5, delay: 0.1 },
  { top: 78, left: 80, size: 1, delay: 3.3 },
  { top: 83, left: 20, size: 2, delay: 1.7 },
  { top: 80, left: 47, size: 1.5, delay: 2.9 },
  { top: 85, left: 72, size: 2, delay: 0.5 },
  { top: 82, left: 90, size: 1, delay: 3.6 },
  { top: 87, left: 8, size: 2.5, delay: 1.3 },
  { top: 84, left: 55, size: 1.5, delay: 2.7 },
  { top: 89, left: 40, size: 2, delay: 0.8 },
  { top: 86, left: 15, size: 1, delay: 3.1 },
  { top: 91, left: 68, size: 2, delay: 1.9 },
  { top: 88, left: 85, size: 1.5, delay: 2.4 },
  { top: 93, left: 30, size: 2.5, delay: 0.3 },
];

/* ─── World Background ──────────────────────────────── */

function WorldBackground({ totalHeight }: { totalHeight: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ zIndex: 0 }}>
      {/* Continuous gradient through all 4 worlds */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            #f0f9ff 0%,
            #bae6fd 6%,
            #e0f2fe 12%,
            #fef9c3 20%,
            #fed7aa 28%,
            #fdba74 34%,
            #fb923c 40%,
            #f472b6 46%,
            #7c3aed 52%,
            #312e81 58%,
            #1e1b4b 65%,
            #0f172a 72%,
            #1e1b4b 80%,
            #2e1065 88%,
            #0c0a09 100%
          )`,
        }}
      />

      {/* ── Meadow: Clouds ── */}
      <svg className="absolute" style={{ top: "3%", left: "5%", opacity: 0.5 }} width="100" height="40" viewBox="0 0 100 40">
        <ellipse cx="50" cy="25" rx="45" ry="14" fill="white" />
        <ellipse cx="35" cy="18" rx="25" ry="12" fill="white" />
        <ellipse cx="68" cy="18" rx="28" ry="10" fill="white" />
      </svg>
      <svg className="absolute" style={{ top: "8%", right: "8%", opacity: 0.4 }} width="80" height="35" viewBox="0 0 80 35">
        <ellipse cx="40" cy="22" rx="36" ry="12" fill="white" />
        <ellipse cx="28" cy="16" rx="20" ry="10" fill="white" />
        <ellipse cx="55" cy="15" rx="22" ry="9" fill="white" />
      </svg>
      <svg className="absolute" style={{ top: "14%", left: "35%", opacity: 0.3 }} width="70" height="30" viewBox="0 0 70 30">
        <ellipse cx="35" cy="18" rx="30" ry="10" fill="white" />
        <ellipse cx="22" cy="13" rx="18" ry="9" fill="white" />
        <ellipse cx="48" cy="12" rx="20" ry="8" fill="white" />
      </svg>

      {/* ── Sunset: Tree silhouettes ── */}
      <svg className="absolute" style={{ top: "30%", left: 0, opacity: 0.15 }} width="45" height="70" viewBox="0 0 45 70">
        <polygon points="22,0 45,50 0,50" fill="#1c1917" />
        <rect x="18" y="50" width="8" height="20" fill="#1c1917" />
      </svg>
      <svg className="absolute" style={{ top: "34%", left: "8%", opacity: 0.12 }} width="35" height="55" viewBox="0 0 35 55">
        <polygon points="17,0 35,40 0,40" fill="#1c1917" />
        <rect x="14" y="40" width="6" height="15" fill="#1c1917" />
      </svg>
      <svg className="absolute" style={{ top: "38%", left: "3%", opacity: 0.1 }} width="40" height="65" viewBox="0 0 40 65">
        <polygon points="20,0 40,48 0,48" fill="#1c1917" />
        <rect x="16" y="48" width="8" height="17" fill="#1c1917" />
      </svg>
      <svg className="absolute" style={{ top: "32%", right: 0, opacity: 0.15 }} width="45" height="70" viewBox="0 0 45 70">
        <polygon points="22,0 45,50 0,50" fill="#1c1917" />
        <rect x="18" y="50" width="8" height="20" fill="#1c1917" />
      </svg>
      <svg className="absolute" style={{ top: "36%", right: "7%", opacity: 0.12 }} width="35" height="55" viewBox="0 0 35 55">
        <polygon points="17,0 35,40 0,40" fill="#1c1917" />
        <rect x="14" y="40" width="6" height="15" fill="#1c1917" />
      </svg>
      <svg className="absolute" style={{ top: "40%", right: "2%", opacity: 0.1 }} width="40" height="60" viewBox="0 0 40 60">
        <polygon points="20,0 40,45 0,45" fill="#1c1917" />
        <rect x="16" y="45" width="8" height="15" fill="#1c1917" />
      </svg>

      {/* ── Night: Stars ── */}
      {STAR_POSITIONS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white roadmap-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        className="absolute rounded-full"
        style={{
          top: "56%",
          right: "10%",
          width: 36,
          height: 36,
          background: "radial-gradient(circle at 40% 40%, #fef3c7, #fde68a)",
          boxShadow: "0 0 30px 8px rgba(253,230,138,0.25)",
        }}
      />

      {/* ── Space: Aurora streaks ── */}
      <div className="absolute left-0 right-0" style={{ top: "82%", height: "8%" }}>
        <div
          className="h-full w-3/4 mx-auto rounded-full blur-2xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(52,211,153,0.2), transparent)" }}
        />
      </div>
      <div className="absolute left-0 right-0" style={{ top: "87%", height: "6%" }}>
        <div
          className="h-full w-1/2 ml-auto mr-[15%] rounded-full blur-2xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.15), transparent)" }}
        />
      </div>
      <div className="absolute left-0 right-0" style={{ top: "91%", height: "5%" }}>
        <div
          className="h-full w-2/3 mr-auto ml-[10%] rounded-full blur-xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(52,211,153,0.12), rgba(167,139,250,0.1), transparent)" }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Page wrapper                                          */
/* ═══════════════════════════════════════════════════════ */

export default function RoadmapPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RoadmapLoader />
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

function RoadmapLoader() {
  const params = useSearchParams();
  const childId = params.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) { setLoading(false); return; }
      const supabase = supabaseBrowser();

      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) setChild(safeValidate(ChildSchema, data) as Child);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setUserPlan((profile as { plan?: string } | null)?.plan || "free");
      }

      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading) return <Spinner />;

  if (!child) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">🗺️</div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-slate-100">No reader selected</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return <SnakePathRoadmap child={child} userPlan={userPlan} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Snake Path Roadmap — Main Component                    */
/* ═══════════════════════════════════════════════════════ */

function SnakePathRoadmap({ child, userPlan }: { child: Child; userPlan: string }) {
  const progress = useMemo(() => buildMockProgress(ALL_STANDARDS), []);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const pathRef = useRef<HTMLDivElement>(null);
  const [pathWidth, setPathWidth] = useState(400);

  const closeActive = useCallback(() => setActiveNode(null), []);

  /* ── Measure container width ── */
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

  /* ── Compute layout ── */
  const { nodes, totalHeight } = useMemo(
    () => computeSnakeLayout(ALL_STANDARDS, pathWidth),
    [pathWidth],
  );

  /* ── SVG paths ── */
  const fullPathD = useMemo(() => buildBezierPath(nodes), [nodes]);

  const completedIdx = nodes.filter(
    (n) => progress[n.standard.standard_id]?.status === "completed",
  ).length;

  const completedPathD = useMemo(() => {
    const end = completedIdx + 1;
    return buildBezierPath(nodes.slice(0, Math.min(end, nodes.length)));
  }, [nodes, completedIdx]);

  /* ── Mascots ── */
  const mascots = useMemo(() => getMascotPositions(nodes), [nodes]);

  /* ── Stats ── */
  const completedCount = Object.values(progress).filter((p) => p.status === "completed").length;
  const totalXP = Object.values(progress).reduce((sum, p) => sum + (p.xpEarned || 0), 0);
  const currentStandard = ALL_STANDARDS.find((s) => progress[s.standard_id]?.status === "current");
  const pct = Math.round((completedCount / ALL_STANDARDS.length) * 100);

  /* ── Scroll to current on mount ── */
  useEffect(() => {
    if (!currentStandard) return;
    const t = setTimeout(() => {
      document.getElementById(`node-${currentStandard.standard_id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 600);
    return () => clearTimeout(t);
  }, [currentStandard]);

  return (
    <div className="max-w-lg mx-auto pb-20 px-4">
      {/* ── Nav ── */}
      <div className="pt-4 mb-4">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          &larr; Dashboard
        </Link>
      </div>

      {/* ── Title ── */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
          {child.first_name}&apos;s Learning Journey
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 text-sm mt-1">Kindergarten ELA Standards</p>
      </div>

      {/* ── Top Progress Bar ── */}
      <TopProgressBar
        pct={pct}
        completedCount={completedCount}
        totalXP={totalXP}
        streakDays={child.streak_days}
      />

      {/* ── Snake Path Area ── */}
      <div ref={pathRef} className="relative w-full mt-6" style={{ height: totalHeight }}>
        {/* World background zones */}
        <WorldBackground totalHeight={totalHeight} />

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

          {/* Road shadow (3D depth — cast underneath) */}
          <path
            d={fullPathD}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={PATH_BORDER_W}
            strokeLinecap="round"
            transform="translate(0, 5)"
          />

          {/* Road border — dark outline for board game trail feel */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#312e81"
            strokeWidth={PATH_BORDER_W}
            strokeLinecap="round"
            className="dark:stroke-indigo-950"
          />

          {/* Road surface — base trail color */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#ede9fe"
            strokeWidth={PATH_ROAD_W}
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />

          {/* Completed road — gradient overlay */}
          {completedPathD && (
            <path
              d={completedPathD}
              fill="none"
              stroke="url(#snakeGrad)"
              strokeWidth={PATH_ROAD_W}
              strokeLinecap="round"
              filter="url(#pathGlow)"
            />
          )}
        </svg>

        {/* Domain labels */}
        {nodes
          .filter((n) => n.isFirstOfDomain)
          .map((n) => {
            const meta = DOMAIN_META[n.domain];
            const dark = isDarkZone(n.y, totalHeight);
            return (
              <div
                key={`domain-${n.domain}`}
                className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ${
                  dark
                    ? "bg-slate-900/70 border border-slate-600/60"
                    : "bg-white/80 border border-zinc-200/60"
                }`}
                style={{ top: n.y - 62, zIndex: 5 }}
              >
                <span className="text-sm">{meta?.emoji}</span>
                <span className={`text-[11px] font-semibold ${dark ? "text-slate-200" : "text-zinc-600"}`}>
                  {n.domain}
                </span>
              </div>
            );
          })}

        {/* Mascot bubbles */}
        {mascots.map((m) => (
          <MascotBubble key={m.nodeIndex} mascot={m} containerWidth={pathWidth} totalHeight={totalHeight} />
        ))}

        {/* Nodes */}
        {nodes.map((node) => {
          const p = progress[node.standard.standard_id];
          const isActive = activeNode === node.standard.standard_id;
          const isPremium = node.globalIdx >= FREE_STANDARD_COUNT && userPlan !== "premium";

          return (
            <MapNode
              key={node.standard.standard_id}
              node={node}
              progress={p}
              isActive={isActive}
              isPremium={isPremium}
              childId={child.id}
              containerWidth={pathWidth}
              totalHeight={totalHeight}
              onClick={() => setActiveNode(isActive ? null : node.standard.standard_id)}
              onClose={closeActive}
            />
          );
        })}

        {/* Trophy at end */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: totalHeight - 80 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-[0_4px_0_0_#c2410c,0_8px_24px_rgba(245,158,11,0.4)]">
            🏆
          </div>
          <p className="text-sm font-bold text-slate-100 mt-3">Level Complete!</p>
          <p className="text-xs text-slate-400">Master all {ALL_STANDARDS.length} standards</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Top Progress Bar                                       */
/* ═══════════════════════════════════════════════════════ */

function TopProgressBar({ pct, completedCount, totalXP, streakDays }: {
  pct: number;
  completedCount: number;
  totalXP: number;
  streakDays: number;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-12 h-12 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="264"
              strokeDashoffset={264 - (264 * pct / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{pct}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold">{completedCount} of {ALL_STANDARDS.length} standards</div>
          <div className="text-white/60 text-xs mt-0.5">Keep up the great work!</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-white font-bold text-sm">{totalXP}</div>
          <div className="text-white/50 text-[9px]">XP</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-white font-bold text-sm">{streakDays}</div>
          <div className="text-white/50 text-[9px]">Streak</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-white font-bold text-sm">{ALL_STANDARDS.length}</div>
          <div className="text-white/50 text-[9px]">Total</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Mascot Bubble                                          */
/* ═══════════════════════════════════════════════════════ */

function MascotBubble({ mascot, containerWidth, totalHeight }: {
  mascot: { emoji: string; message: string; x: number; y: number; side: "left" | "right" };
  containerWidth: number;
  totalHeight: number;
}) {
  const leftPct = containerWidth > 0 ? (mascot.x / containerWidth) * 100 : 50;
  const clampedPct = Math.max(10, Math.min(90, leftPct));
  const dark = isDarkZone(mascot.y, totalHeight);

  const bubbleClass = dark
    ? "bg-slate-800/90 text-violet-300 border border-violet-700"
    : "bg-white text-violet-700 border border-violet-100";

  return (
    <motion.div
      className="absolute hidden sm:flex items-center gap-2 z-10"
      style={{ top: mascot.y - 20, left: `${clampedPct}%`, transform: "translateX(-50%)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {mascot.side === "left" && (
        <div className={`rounded-xl px-3 py-2 shadow-md text-sm font-medium max-w-[160px] ${bubbleClass}`}>
          {mascot.message}
        </div>
      )}
      <span className="text-4xl drop-shadow-md">{mascot.emoji}</span>
      {mascot.side === "right" && (
        <div className={`rounded-xl px-3 py-2 shadow-md text-sm font-medium max-w-[160px] ${bubbleClass}`}>
          {mascot.message}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Map Node                                               */
/* ═══════════════════════════════════════════════════════ */

function MapNode({
  node, progress, isActive, isPremium, childId, containerWidth, totalHeight, onClick, onClose,
}: {
  node: NodeLayout;
  progress: StandardProgress;
  isActive: boolean;
  isPremium: boolean;
  childId: string;
  containerWidth: number;
  totalHeight: number;
  onClick: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const status = progress.status;
  const standard = node.standard;

  // Label side: nodes on the right → label left (toward center), and vice-versa
  const phase = node.globalIdx % 4;
  const labelRight = phase === 0 || phase === 3;

  useEffect(() => {
    if (!isActive) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isActive, onClose]);

  // Compact nodes that sit INSIDE the fat road
  const nodeSize = status === "current" ? 48 : status === "completed" ? 42 : 36;
  const leftPct = containerWidth > 0 ? (node.x / containerWidth) * 100 : 50;

  const kidName = KID_NAMES[standard.standard_id] || "Lesson";

  // Margin must clear the path border (PATH_BORDER_W/2) from the node edge
  const labelMargin = Math.max(16, PATH_BORDER_W / 2 - nodeSize / 2 + 10);

  const dark = isDarkZone(node.y, totalHeight);
  const labelColorClass = dark
    ? (status === "completed" ? "text-emerald-300"
      : status === "current" ? "text-indigo-300"
      : isPremium ? "text-violet-300"
      : "text-zinc-300")
    : (status === "completed" ? "text-emerald-700"
      : status === "current" ? "text-indigo-700"
      : isPremium ? "text-violet-400"
      : "text-zinc-400");

  return (
    <motion.div
      ref={ref}
      id={`node-${standard.standard_id}`}
      className="absolute"
      style={{
        top: node.y - nodeSize / 2,
        left: `${leftPct}%`,
        width: nodeSize,
        height: nodeSize,
        zIndex: isActive ? 50 : status === "current" ? 20 : 10,
      }}
      initial={{ opacity: 0, scale: 0.8, x: "-50%" }}
      whileInView={{ opacity: 1, scale: 1, x: "-50%" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Node circle — fills container, centered exactly on path ── */}
      {status === "completed" && (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full h-full relative rounded-full flex items-center justify-center
            bg-gradient-to-b from-emerald-400 to-emerald-600 text-white
            shadow-[0_3px_0_0_#059669] outline-none select-none cursor-pointer
            border-[3px] border-emerald-300/80
            ${isActive ? "ring-4 ring-emerald-400/40" : ""}
          `}
          aria-label={`${standard.standard_id}: ${standard.standard_description}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] shadow-sm border-2 border-white">
            ⭐
          </span>
        </motion.button>
      )}

      {status === "current" && (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.1 }}
          className={`
            w-full h-full relative rounded-full flex items-center justify-center
            bg-gradient-to-br from-indigo-500 to-violet-600 text-white
            shadow-[0_4px_0_0_#4338ca] outline-none select-none cursor-pointer
            border-[3px] border-indigo-300/80
            roadmap-breathe
            ${isActive ? "ring-4 ring-indigo-400/40" : ""}
          `}
          aria-label={`${standard.standard_id}: ${standard.standard_description}`}
        >
          <span className="text-lg font-extrabold drop-shadow-sm">{node.globalIdx + 1}</span>
        </motion.button>
      )}

      {status === "locked" && (
        <div
          onClick={onClick}
          className={`
            w-full h-full relative rounded-full flex items-center justify-center cursor-pointer
            border-[3px]
            ${isPremium
              ? "bg-gradient-to-b from-indigo-300 to-violet-400 text-white/70 shadow-[0_2px_0_0_#6d28d9] opacity-70 border-violet-300/50"
              : "bg-gradient-to-b from-zinc-300 to-zinc-400 text-zinc-500 shadow-[0_2px_0_0_#a1a1aa] opacity-60 border-zinc-200"
            }
          `}
          aria-label={`${standard.standard_id}: ${standard.standard_description}`}
        >
          {isPremium ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {isPremium && (
            <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-[6px] font-extrabold text-white shadow-sm leading-none border border-white">
              R+
            </span>
          )}
        </div>
      )}

      {/* ── Kid-friendly label — to the side, clear of the path ── */}
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
        style={labelRight
          ? { left: "100%", marginLeft: labelMargin }
          : { right: "100%", marginRight: labelMargin }
        }
      >
        <span className={`text-[11px] font-semibold ${labelColorClass}`}>
          {kidName}
        </span>
      </div>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {isActive && (
          <NodeTooltip
            standard={standard}
            progress={progress}
            isPremium={isPremium}
            childId={childId}
            nodeSize={nodeSize}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Node Tooltip                                           */
/* ═══════════════════════════════════════════════════════ */

function NodeTooltip({ standard, progress, isPremium, childId, nodeSize }: {
  standard: Standard;
  progress: StandardProgress;
  isPremium: boolean;
  childId: string;
  nodeSize: number;
}) {
  const status = progress.status;
  const tooltipW = 280;

  return (
    <motion.div
      className="absolute top-full mt-3 z-50"
      style={{ width: tooltipW, left: -(tooltipW - nodeSize) / 2 }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-xl p-4 space-y-3">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-l border-t border-zinc-200 dark:border-slate-700 rotate-45" />

        <div className="relative">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {KID_NAMES[standard.standard_id] || "Lesson"}
            </span>
            <StatusBadge status={status} isPremium={isPremium} />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-slate-100 mt-2 leading-snug">
            {shortName(standard.standard_description)}
          </h4>
        </div>

        {status === "completed" && progress.score != null && (
          <>
            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 text-center">
                <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{progress.score}/{progress.total}</div>
                <div className="text-emerald-600 dark:text-emerald-500 text-[10px]">Correct</div>
              </div>
              <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2.5 text-center">
                <div className="text-amber-700 dark:text-amber-400 font-bold text-sm">+{progress.xpEarned}</div>
                <div className="text-amber-600 dark:text-amber-500 text-[10px]">XP Earned</div>
              </div>
            </div>
            <Link
              href={`/practice?child=${childId}&standard=${standard.standard_id}`}
              className="block w-full text-center px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all border border-emerald-200 dark:border-emerald-800"
            >
              Practice Again
            </Link>
          </>
        )}

        {status === "current" && progress.score != null && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Progress</span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{progress.score}/{progress.total}</span>
            </div>
            <div className="mt-1.5 h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${((progress.score || 0) / (progress.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {status === "current" && (
          <Link
            href={`/practice?child=${childId}&standard=${standard.standard_id}`}
            className="block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
          >
            {progress.score && progress.score > 0 ? "Continue" : "Start"} Practice →
          </Link>
        )}

        {status === "locked" && !isPremium && (
          <p className="text-center text-[11px] text-zinc-400 dark:text-slate-500 py-1">
            Complete previous standards to unlock
          </p>
        )}

        {status === "locked" && isPremium && (
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl p-3 text-center">
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                This standard is part of Readee+
              </p>
            </div>
            <Link
              href={`/upgrade?child=${childId}`}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:from-indigo-600 hover:to-violet-600 transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Upgrade to Readee+
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Status Badge ───────────────────────────────────── */

function StatusBadge({ status, isPremium }: { status: StandardProgress["status"]; isPremium: boolean }) {
  if (status === "completed") {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Completed ✓</span>;
  }
  if (status === "current") {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">In Progress</span>;
  }
  if (isPremium) {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-600 dark:text-indigo-400">Readee+</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">Locked 🔒</span>;
}
