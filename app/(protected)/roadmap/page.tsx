"use client";

import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import kStandards from "@/app/data/kindergarten-standards-questions.json";

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

const DOMAIN_META: Record<string, { emoji: string; color: string; bg: string; border: string; fill: string }> = {
  "Reading Literature":         { emoji: "📖", color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  fill: "#8b5cf6" },
  "Reading Informational Text": { emoji: "📰", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",    fill: "#3b82f6" },
  "Foundational Skills":        { emoji: "🔤", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", fill: "#10b981" },
  "Language":                   { emoji: "💬", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",   fill: "#f59e0b" },
};

const NODE_SPACING = 100;       // vertical px between nodes
const AMPLITUDE = 70;           // horizontal snake swing (px)
const PATH_WIDTH = 320;         // SVG viewbox width
const CENTER_X = PATH_WIDTH / 2;
const DOMAIN_HEADER_HEIGHT = 64; // space reserved for domain header rows

/* ─── Mock progress ──────────────────────────────────── */

function buildMockProgress(standards: Standard[]): Record<string, StandardProgress> {
  const progress: Record<string, StandardProgress> = {};
  const doneCount = 8;

  standards.forEach((std, i) => {
    if (i < doneCount) {
      progress[std.standard_id] = {
        status: "completed",
        score: 3 + Math.floor(Math.random() * 3),
        total: 5,
        xpEarned: 10 + Math.floor(Math.random() * 6) * 5,
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

/** Get unique domains in order they appear */
function getDomainOrder(standards: Standard[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const s of standards) {
    if (!seen.has(s.domain)) { seen.add(s.domain); order.push(s.domain); }
  }
  return order;
}

/* ═══════════════════════════════════════════════════════ */
/*  Page wrapper (Suspense boundary)                      */
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
        <div className="text-4xl">🗺️</div>
        <h1 className="text-xl font-bold text-zinc-900">No reader selected</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return <Roadmap child={child} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Main Roadmap                                          */
/* ═══════════════════════════════════════════════════════ */

function Roadmap({ child }: { child: Child }) {
  const allStandards = (kStandards as { standards: Standard[] }).standards;
  const progress = useMemo(() => buildMockProgress(allStandards), [allStandards]);
  const domainOrder = useMemo(() => getDomainOrder(allStandards), [allStandards]);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const closeActive = useCallback(() => setActiveNode(null), []);

  /* ── Compute layout positions ── */

  // We need to know which Y rows are domain headers vs nodes.
  // Walk through standards, inserting a header row when the domain changes.
  interface LayoutItem {
    type: "header" | "node";
    domain?: string;
    standard?: Standard;
    globalIdx?: number;  // sequential index across all standards
    y: number;           // center-y in the layout
    x: number;           // center-x in the layout
  }

  const layout = useMemo(() => {
    const items: LayoutItem[] = [];
    let y = 30;
    let currentDomain = "";
    let nodeSeq = 0;

    for (const std of allStandards) {
      // Insert domain header when domain changes
      if (std.domain !== currentDomain) {
        if (currentDomain !== "") y += 20; // extra gap between domains
        items.push({ type: "header", domain: std.domain, y, x: CENTER_X });
        y += DOMAIN_HEADER_HEIGHT;
        currentDomain = std.domain;
      }

      const x = CENTER_X + Math.sin(nodeSeq * 0.7) * AMPLITUDE;
      items.push({ type: "node", standard: std, globalIdx: nodeSeq, y, x });
      y += NODE_SPACING;
      nodeSeq++;
    }

    return { items, totalHeight: y + 80 };
  }, [allStandards]);

  /* ── Build SVG path through node centers ── */
  const nodeItems = layout.items.filter((it) => it.type === "node");

  const pathD = useMemo(() => {
    if (nodeItems.length < 2) return "";
    let d = `M ${nodeItems[0].x} ${nodeItems[0].y}`;
    for (let i = 1; i < nodeItems.length; i++) {
      const prev = nodeItems[i - 1];
      const cur = nodeItems[i];
      const cpY = (prev.y + cur.y) / 2;
      d += ` C ${prev.x} ${cpY}, ${cur.x} ${cpY}, ${cur.x} ${cur.y}`;
    }
    return d;
  }, [nodeItems]);

  // Split path for completed portion
  const completedIdx = nodeItems.filter((n) => progress[n.standard!.standard_id]?.status === "completed").length;

  const completedPathD = useMemo(() => {
    const end = completedIdx + 1; // include "current" node in colored path
    const slice = nodeItems.slice(0, Math.min(end, nodeItems.length));
    if (slice.length < 2) return "";
    let d = `M ${slice[0].x} ${slice[0].y}`;
    for (let i = 1; i < slice.length; i++) {
      const prev = slice[i - 1];
      const cur = slice[i];
      const cpY = (prev.y + cur.y) / 2;
      d += ` C ${prev.x} ${cpY}, ${cur.x} ${cpY}, ${cur.x} ${cur.y}`;
    }
    return d;
  }, [nodeItems, completedIdx]);

  /* ── Stats ── */
  const completedCount = Object.values(progress).filter((p) => p.status === "completed").length;
  const totalXP = Object.values(progress).reduce((sum, p) => sum + (p.xpEarned || 0), 0);
  const currentStandard = allStandards.find((s) => progress[s.standard_id]?.status === "current");
  const currentDomain = currentStandard?.domain || domainOrder[0];
  const pct = Math.round((completedCount / allStandards.length) * 100);

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
      <div className="flex items-center justify-between pt-4 mb-6 animate-slideUp">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          &larr; Dashboard
        </Link>
        <span className="text-xs text-zinc-400 font-medium">{child.grade || "Kindergarten"}</span>
      </div>

      {/* ── Title ── */}
      <div className="text-center mb-8 dash-slide-up-1">
        <div className="text-4xl mb-2">🗺️</div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          {child.first_name}&apos;s Learning Journey
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Kindergarten ELA Standards</p>
      </div>

      {/* ── Progress Summary ── */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 mb-8 shadow-lg dash-slide-up-2">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-10 h-10 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round" strokeDasharray="251"
                strokeDashoffset={251 - (251 * pct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-white text-xs font-bold">{pct}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg">{completedCount} of {allStandards.length} standards</div>
            <div className="text-white/70 text-xs mt-0.5">Currently on: {currentDomain}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: totalXP, label: "XP Earned" },
            { val: child.streak_days, label: "Day Streak" },
            { val: domainOrder.length, label: "Domains" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <div className="text-white font-bold text-lg">{s.val}</div>
              <div className="text-white/60 text-[10px] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Domain Legend ── */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center dash-slide-up-3">
        {domainOrder.map((d) => {
          const m = DOMAIN_META[d];
          return (
            <span key={d} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${m.bg} ${m.color} ${m.border}`}>
              {m.emoji} {d}
            </span>
          );
        })}
      </div>

      {/* ══════════ THE PATH ══════════ */}
      <div className="relative dash-slide-up-4" style={{ height: layout.totalHeight }}>
        {/* SVG connecting path */}
        <svg
          className="absolute left-1/2 top-0 pointer-events-none"
          width={PATH_WIDTH}
          height={layout.totalHeight}
          style={{ transform: "translateX(-50%)" }}
        >
          {/* Gray dashed background path */}
          <path d={pathD} fill="none" stroke="#e5e7eb" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
          {/* Colored completed path */}
          {completedPathD && (
            <path d={completedPathD} fill="none" stroke="url(#roadmapGrad)" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
          )}
          <defs>
            <linearGradient id="roadmapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Layout items (headers + nodes) */}
        {layout.items.map((item, i) => {
          if (item.type === "header") {
            const dm = DOMAIN_META[item.domain!];
            return (
              <div
                key={`hdr-${item.domain}`}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: item.y - 8, width: 280 }}
              >
                <div className={`flex items-center gap-3 rounded-2xl border ${dm.border} ${dm.bg} p-3 shadow-sm`}>
                  <span className="text-2xl">{dm.emoji}</span>
                  <div>
                    <div className={`font-bold text-sm ${dm.color}`}>{item.domain}</div>
                    <div className="text-[11px] text-zinc-500">
                      {allStandards.filter((s) => s.domain === item.domain).length} standards
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Node
          const std = item.standard!;
          const p = progress[std.standard_id];
          const isActive = activeNode === std.standard_id;
          return (
            <NodeBubble
              key={std.standard_id}
              standard={std}
              progress={p}
              x={item.x}
              y={item.y}
              index={item.globalIdx!}
              isActive={isActive}
              childId={child.id}
              onClick={() => setActiveNode(isActive ? null : std.standard_id)}
              onClose={closeActive}
            />
          );
        })}

        {/* Trophy at end */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: layout.totalHeight - 70 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-200">
            🏆
          </div>
          <p className="text-sm font-bold text-zinc-700 mt-2">Level Complete!</p>
          <p className="text-xs text-zinc-400">Master all {allStandards.length} standards</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Node Bubble                                           */
/* ═══════════════════════════════════════════════════════ */

function NodeBubble({
  standard, progress, x, y, index, isActive, childId, onClick, onClose,
}: {
  standard: Standard;
  progress: StandardProgress;
  x: number;
  y: number;
  index: number;
  isActive: boolean;
  childId: string;
  onClick: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const status = progress.status;
  const dm = DOMAIN_META[standard.domain] || DOMAIN_META["Reading Literature"];

  // Close on outside click
  useEffect(() => {
    if (!isActive) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isActive, onClose]);

  // Calculate pixel offset from center (PATH_WIDTH / 2)
  const offsetX = x - CENTER_X;

  return (
    <div
      ref={ref}
      id={`node-${standard.standard_id}`}
      className="absolute flex flex-col items-center"
      style={{
        top: y - 28, // center the 56px node vertically on the path point
        left: `calc(50% + ${offsetX}px)`,
        transform: "translateX(-50%)",
        zIndex: isActive ? 50 : 10,
      }}
    >
      {/* Circle */}
      <button
        onClick={onClick}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-300 outline-none select-none
          ${status === "completed"
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
            : status === "current"
            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-300/40 roadmap-pulse"
            : "bg-zinc-200 text-zinc-400"
          }
          ${status !== "locked" ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"}
          ${isActive ? "!scale-110 ring-4 ring-indigo-400/50" : ""}
        `}
        aria-label={`${standard.standard_id}: ${standard.standard_description}`}
      >
        {status === "completed" && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === "current" && (
          <span className="text-lg font-bold">{index + 1}</span>
        )}
        {status === "locked" && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}

        {/* Star badge for completed */}
        {status === "completed" && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] shadow-sm">
            ⭐
          </span>
        )}
      </button>

      {/* Label */}
      <span className={`mt-1 text-[10px] font-bold whitespace-nowrap ${
        status === "completed" ? "text-emerald-600"
        : status === "current" ? "text-indigo-600"
        : "text-zinc-300"
      }`}>
        {standard.standard_id}
      </span>

      {/* ── Tooltip ── */}
      {isActive && (
        <div className="absolute top-full mt-2 z-50 animate-scaleIn" style={{ width: 288 }}>
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-xl p-4 space-y-3">
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-zinc-200 rotate-45" />

            {/* Header */}
            <div className="relative">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dm.bg} ${dm.color}`}>
                  {standard.standard_id}
                </span>
                <StatusBadge status={status} />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 mt-2 leading-snug">
                {shortName(standard.standard_description)}
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                {standard.standard_description}
              </p>
            </div>

            {/* Completed stats */}
            {status === "completed" && progress.score != null && (
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-50 rounded-xl p-2.5 text-center">
                  <div className="text-emerald-700 font-bold text-sm">{progress.score}/{progress.total}</div>
                  <div className="text-emerald-600 text-[10px]">Correct</div>
                </div>
                <div className="flex-1 bg-amber-50 rounded-xl p-2.5 text-center">
                  <div className="text-amber-700 font-bold text-sm">+{progress.xpEarned}</div>
                  <div className="text-amber-600 text-[10px]">XP Earned</div>
                </div>
              </div>
            )}

            {/* Current progress */}
            {status === "current" && progress.score != null && (
              <div className="bg-indigo-50 rounded-xl p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">Progress</span>
                  <span className="text-xs font-bold text-indigo-700">{progress.score}/{progress.total}</span>
                </div>
                <div className="mt-1.5 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${((progress.score || 0) / (progress.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            {status === "current" && (
              <Link
                href={`/roadmap/practice?child=${childId}&standard=${standard.standard_id}`}
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
              >
                {progress.score && progress.score > 0 ? "Continue" : "Start"} Practice →
              </Link>
            )}

            {status === "locked" && (
              <p className="text-center text-[11px] text-zinc-400 py-1">
                Complete previous standards to unlock
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────── */

function StatusBadge({ status }: { status: StandardProgress["status"] }) {
  if (status === "completed") {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Completed ✓</span>;
  }
  if (status === "current") {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">In Progress</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500">Locked 🔒</span>;
}
