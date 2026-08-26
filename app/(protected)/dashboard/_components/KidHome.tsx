"use client";

/**
 * KidHome — the redesigned kid home screen (from the Claude Design
 * "Readee kid home screen redesign"). A Duolingo-style composition:
 * stats bar → hero (mascot + CTA) + today's plan → quick-play tiles →
 * keep-it-up strip. Purely presentational: all data + handlers are
 * computed in the dashboard page and passed as props, so this file
 * owns look-and-feel only (plus the tap-to-celebrate bunny reaction).
 */

import { useRef, useState } from "react";
import Link from "next/link";
import { Bunny, BunnyReaction, reactionHoldMs, type ReactionState } from "@/app/_components/Bunny/Bunny";
import { reactionStateFor } from "@/lib/data/shop-items";
import {
  Flame,
  Carrot,
  Star,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Play,
  Target,
  BookOpen,
  Mic,
  Compass,
  Trophy,
  Lock,
  TrendingUp,
} from "lucide-react";

const BALOO = "var(--font-baloo), 'Baloo 2', sans-serif";
const CARD_SHADOW = "0 10px 40px -12px rgba(49,46,129,.15)";

export type PlanStatus = "done" | "cur" | "todo";
export type NodeKind = "done" | "cur" | "lock";

export interface OutfitChoice {
  id: string;
  name: string;
  tint: string;
  border: string;
  owned: boolean;
}

export interface Momentum {
  levelName: string;
  skillsMastered: number;
  progressPct: number;
  nextMilestone: string;
}

export interface KidHomeProps {
  childId: string;
  firstDay: boolean;
  firstName: string;
  /** Full access — paid OR inside the 7-day reverse trial. Gates the locks
   *  + the post-trial upgrade card. */
  fullAccess: boolean;
  /** In-trial countdown; null when not in the reverse trial. */
  trial: { daysLeft: number } | null;
  /** Lapsed = had Readee+ and let it end. Swaps the upgrade card for a
   *  win-back reactivation pitch. */
  lapsed?: boolean;
  upgradeHref: string;
  /** "Getting better" proof card; null on the very first day (no data yet). */
  momentum: Momentum | null;
  // hero
  bubbleTitle: string;
  bubbleSub: string;
  equippedOutfitId: string;
  /** Equipped reaction id (equipped_items.reaction) — the reaction Readee
   *  plays when tapped. Falls back to the default reaction when unset. */
  equippedReactionId?: string | null;
  outfitChoices: OutfitChoice[];
  onPickOutfit: (id: string) => void;
  cta: { href: string; text: string; sub: string };
  // stats
  streak: number;
  goalDone: number;
  goalTotal: number;
  goalLabel: string;
  carrots: number;
  level: { name: string; num: number; xpPct: number; xpLabel: string };
  // today's plan
  planBadge: string;
  planSteps: Array<{ num: string; label: string; sub: string; status: PlanStatus; href?: string; locked?: boolean }>;
  // path teaser
  path: { nodes: NodeKind[]; unitTitle: string; unitPct: number; unitSub: string; href: string };
  // keep-it-up
  weekSub: string;
  weekBars: Array<{ day: string; pct: number; isToday: boolean; hasValue: boolean }>;
  shop: { href: string; sub: string; chip: string };
  league: { href: string; title: string; sub: string; locked: boolean };
}

export default function KidHome(p: KidHomeProps) {
  const [reaction, setReaction] = useState<"" | ReactionState>("");
  const rxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skinScrollRef = useRef<HTMLDivElement>(null);

  const scrollSkins = (dir: -1 | 1) => {
    const el = skinScrollRef.current;
    if (el) el.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  const celebrate = () => {
    if (reaction) return;
    const rx = reactionStateFor(p.equippedReactionId);
    setReaction(rx);
    if (rxTimer.current) clearTimeout(rxTimer.current);
    // Dismiss when the reaction has looped back to its rest pose so the swap
    // to the idle <Bunny> is seamless (see reactionHoldMs). The old flat
    // 2600ms cut the bunny off mid-wave and snapped it to rest.
    rxTimer.current = setTimeout(() => setReaction(""), reactionHoldMs(rx));
  };

  const ringCirc = 150.8;
  const ringPct = p.goalTotal > 0 ? p.goalDone / p.goalTotal : 0;
  const ringOffset = ringCirc * (1 - ringPct);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        /* transform/opacity only — GPU-composited so Safari (esp. iPad)
           doesn't repaint every frame like it did animating box-shadow/filter. */
        @keyframes readeePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes readeeGlow{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.14);opacity:1}}
        .kh-lift{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1),box-shadow .2s}
        .kh-lift:hover{transform:translateY(-3px)}
        .kh-tile{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1)}
        .kh-tile:hover{transform:translateY(-5px) scale(1.03)}
        .kh-outfit{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom center}
        .kh-outfit:hover{transform:scale(1.1)}
        .kh-arrow{transition:transform .15s,background .15s}
        .kh-arrow:hover{transform:scale(1.1);background:#f5f3ff}
        .kh-skinrow::-webkit-scrollbar{display:none}
      `}</style>

      {/* ── Stats bar ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Streak */}
        <StatCard>
          <div style={{ ...iconBox, background: p.streak > 0 ? "#fff7ed" : "#f4f4f5" }}>
            <Flame
              className="h-[26px] w-[26px]"
              fill={p.streak > 0 ? "#f97316" : "none"}
              stroke={p.streak > 0 ? "#ea580c" : "#a1a1aa"}
              strokeWidth={2}
              style={{ animation: p.streak > 0 ? "readeeGlow 2.2s ease-in-out infinite" : "none" }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 24, lineHeight: 1, color: "#18181b" }}>{p.streak}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#71717a" }}>{p.streak > 0 ? "day streak" : "start your streak!"}</div>
          </div>
        </StatCard>

        {/* Daily goal ring */}
        <StatCard>
          <div style={{ position: "relative", width: 44, height: 44, flex: "none" }}>
            <svg viewBox="0 0 60 60" style={{ width: 44, height: 44, transform: "rotate(-90deg)" }}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="#e0e7ff" strokeWidth="8" />
              <circle
                cx="30" cy="30" r="24" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(0.34,1.56,0.64,1)" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BALOO, fontWeight: 800, fontSize: 13, color: "#4338ca" }}>
              {p.goalDone}/{p.goalTotal}
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 16, lineHeight: 1.1, color: "#18181b" }}>Daily goal</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#71717a" }}>{p.goalLabel}</div>
          </div>
        </StatCard>

        {/* Carrots */}
        <StatCard>
          <div style={{ ...iconBox, background: "#fff7ed" }}>
            <Carrot className="h-[26px] w-[26px]" stroke="#f97316" strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 24, lineHeight: 1, color: "#18181b" }}>{p.carrots}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#71717a" }}>carrots</div>
          </div>
        </StatCard>

        {/* Level + XP */}
        <div style={{ ...statBase, flex: 1.4, minWidth: 200 }}>
          <div style={{ ...iconBox, background: "linear-gradient(135deg,#4338ca,#7c3aed)" }}>
            <Star className="h-6 w-6" fill="#fde68a" stroke="#fde68a" strokeWidth={1.5} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 16, lineHeight: 1.1, color: "#18181b", whiteSpace: "nowrap" }}>{p.level.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", whiteSpace: "nowrap" }}>Lv {p.level.num}</div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: "#e0e7ff", marginTop: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", width: `${p.level.xpPct}%`, transition: "width .8s cubic-bezier(0.34,1.56,0.64,1)" }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#71717a", marginTop: 3 }}>{p.level.xpLabel}</div>
          </div>
        </div>
      </div>

      {/* ── Momentum: the "getting better" proof ── */}
      {p.momentum && (
        <div style={{ background: "linear-gradient(160deg,#f5f3ff 0%,#eef2ff 55%,#ffffff 100%)", border: "1px solid #e0e7ff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, flex: "none", background: "linear-gradient(135deg,#4338ca,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp className="h-[26px] w-[26px] text-white" strokeWidth={2.4} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", color: "#4338ca" }}>{p.firstName} is getting better</div>
                <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 20, color: "#18181b", lineHeight: 1.15 }}>Reading at a {p.momentum.levelName} level</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <div style={{ background: "#fff", border: "1px solid #e0e7ff", borderRadius: 14, padding: "8px 14px", textAlign: "center", minWidth: 92 }}>
                <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 22, lineHeight: 1, color: "#4338ca" }}>{p.momentum.skillsMastered}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#71717a", marginTop: 3 }}>skills mastered</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e0e7ff", borderRadius: 14, padding: "8px 14px", textAlign: "center", minWidth: 92 }}>
                <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 22, lineHeight: 1, color: "#4338ca" }}>{p.momentum.progressPct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#71717a", marginTop: 3 }}>to next badge</div>
              </div>
            </div>
          </div>
          <div style={{ height: 12, borderRadius: 99, background: "#e0e7ff", marginTop: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#4338ca,#8b5cf6)", width: `${p.momentum.progressPct}%`, transition: "width .8s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11 }}>
            <Star className="h-4 w-4" fill="#f59e0b" stroke="#f59e0b" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3f3f46" }}>{p.momentum.nextMilestone}</span>
          </div>
        </div>
      )}

      {/* ── Split stage: hero + right column ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", gap: 20, alignItems: "stretch" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(170deg,#f5f3ff 0%,#ffffff 70%)", borderRadius: 24, boxShadow: CARD_SHADOW, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.12),transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -40, right: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,.12),transparent 70%)" }} />

          {/* Speech bubble */}
          <div style={{ position: "relative", background: "#fff", border: "2px solid #e0e7ff", borderRadius: 18, padding: "10px 18px", boxShadow: "0 4px 14px -6px rgba(49,46,129,.2)", marginBottom: 2 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 26, color: "#1e1b4b", lineHeight: 1.15 }}>{p.bubbleTitle}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>{p.bubbleSub}</div>
            <div style={{ position: "absolute", left: "50%", bottom: -9, width: 16, height: 16, background: "#fff", borderRight: "2px solid #e0e7ff", borderBottom: "2px solid #e0e7ff", transform: "translateX(-50%) rotate(45deg)" }} />
          </div>

          {/* Bunny + outfit picker */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 2 }}>
            <button onClick={celebrate} title="Tap Readee!" style={{ border: "none", background: "transparent", cursor: "pointer", width: 200, height: 216, padding: 0, flex: "none" }}>
              {reaction
                ? <BunnyReaction outfitId={p.equippedOutfitId} state={reaction} />
                : <Bunny outfitId={p.equippedOutfitId} />}
            </button>
            {/* Skin carousel — arrows scroll through unlocked skins;
                locked ones show greyed-out as aspiration. */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", maxWidth: 320 }}>
              <button
                onClick={() => scrollSkins(-1)}
                aria-label="Previous skins"
                className="kh-arrow"
                style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", border: "2px solid #e0e7ff", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px -2px rgba(49,46,129,.2)" }}
              >
                <ChevronLeft className="h-4 w-4" stroke="#7c3aed" strokeWidth={2.5} />
              </button>
              <div
                ref={skinScrollRef}
                className="kh-skinrow"
                style={{ flex: 1, display: "flex", gap: 10, alignItems: "flex-end", overflowX: "auto", scrollBehavior: "smooth", padding: "12px 4px 8px", scrollbarWidth: "none" }}
              >
                {p.outfitChoices.map((c) => {
                  const selected = c.id === p.equippedOutfitId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => c.owned && p.onPickOutfit(c.id)}
                      title={c.owned ? c.name : `${c.name} - earn it!`}
                      className="kh-outfit"
                      style={{
                        position: "relative",
                        flex: "none",
                        border: `2px solid ${selected ? "#7c3aed" : c.border}`,
                        cursor: c.owned ? "pointer" : "default",
                        padding: "4px 4px 0",
                        borderRadius: 16,
                        background: c.tint,
                        boxShadow: selected ? "0 0 0 3px rgba(124,58,237,.3)" : "none",
                        opacity: c.owned ? 1 : 0.45,
                        filter: c.owned ? "none" : "grayscale(1)",
                      }}
                    >
                      <div style={{ width: 42, height: 46, pointerEvents: "none" }}>
                        <Bunny outfitId={c.id} />
                      </div>
                      {!c.owned && (
                        <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#fff", border: "1.5px solid #e4e4e7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock className="h-2.5 w-2.5" stroke="#a1a1aa" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => scrollSkins(1)}
                aria-label="More skins"
                className="kh-arrow"
                style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", border: "2px solid #e0e7ff", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px -2px rgba(49,46,129,.2)" }}
              >
                <ChevronRight className="h-4 w-4" stroke="#7c3aed" strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>
              {p.firstDay ? "Win outfits as you read!" : "Pick an outfit - tap Readee to celebrate!"}
            </div>
          </div>

          {/* CTA */}
          <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Link
              href={p.cta.href}
              className="kh-lift"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(90deg,#4338ca,#7c3aed)", color: "#fff", fontFamily: BALOO, fontWeight: 800, fontSize: 21, padding: "16px 36px", borderRadius: 99, boxShadow: "0 12px 30px -8px rgba(67,56,202,.5)" }}
            >
              <Play className="h-[22px] w-[22px]" fill="#fff" stroke="none" />
              <span>{p.cta.text}</span>
            </Link>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#52525b" }}>{p.cta.sub}</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* Today's plan */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "22px 24px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 21, color: "#18181b" }}>Today&apos;s plan</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed", background: "#f5f3ff", borderRadius: 99, padding: "4px 12px" }}>{p.planBadge}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {p.planSteps.map((s, i) => {
                const done = s.status === "done";
                const cur = s.status === "cur";
                const locked = !!s.locked;
                const inner = (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 18,
                    background: locked ? "#fafafa" : cur ? "#f5f3ff" : done ? "#f0fdf4" : "#fafafa",
                    border: `2px solid ${locked ? "#eef2ff" : cur ? "#ddd6fe" : done ? "#dcfce7" : "#f4f4f5"}`,
                    borderStyle: locked ? "dashed" : "solid",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                      background: locked ? "#eef2ff" : done ? "#10b981" : cur ? "linear-gradient(135deg,#4338ca,#7c3aed)" : "#e4e4e7",
                      color: done || cur ? "#fff" : "#a1a1aa", fontFamily: BALOO, fontWeight: 800, fontSize: 17,
                      animation: cur && !locked ? "readeePulse 2s ease-in-out infinite" : "none",
                    }}>
                      {locked ? <Lock className="h-[18px] w-[18px]" stroke="#818cf8" strokeWidth={2.4} /> : done ? <Check className="h-5 w-5" strokeWidth={3.5} /> : s.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15.5, color: locked ? "#71717a" : done ? "#a1a1aa" : "#18181b", textDecoration: done ? "line-through" : "none" }}>{s.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#a1a1aa" }}>{s.sub}</div>
                    </div>
                    {locked
                      ? <span style={{ flex: "none", fontSize: 11, fontWeight: 800, letterSpacing: ".03em", textTransform: "uppercase", color: "#4338ca", background: "#e0e7ff", borderRadius: 99, padding: "5px 10px" }}>Readee+</span>
                      : <ChevronRight className="h-5 w-5" stroke={cur ? "#7c3aed" : "#d4d4d8"} strokeWidth={2.5} />}
                  </div>
                );
                return s.href
                  ? <Link key={i} href={s.href} className="block">{inner}</Link>
                  : <div key={i}>{inner}</div>;
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "0 4px" }}>
              <Sparkles className="h-4 w-4" stroke="#f59e0b" strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#71717a" }}>Finish all {p.goalTotal} to fill your ring - confetti time!</span>
            </div>
          </div>

          {/* Path teaser */}
          <Link href={p.path.href} className="kh-lift" style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "none" }}>
              {p.path.nodes.map((n, i) => {
                const size = n === "cur" ? 34 : 24;
                return (
                  <div key={i} style={{
                    width: size, height: size, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                    background: n === "done" ? "#f59e0b" : n === "cur" ? "linear-gradient(135deg,#4338ca,#7c3aed)" : "#e4e4e7",
                    animation: n === "cur" ? "readeePulse 2s ease-in-out infinite" : "none",
                  }}>
                    {n === "done" && <Check className="h-3 w-3" stroke="#fff" strokeWidth={4} />}
                    {n === "cur" && <Star className="h-3.5 w-3.5" fill="#fff" stroke="none" />}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: 2 }}>Reading Journey</div>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#18181b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.path.unitTitle}</div>
              <div style={{ height: 8, borderRadius: 99, background: "#e0e7ff", marginTop: 6, overflow: "hidden", maxWidth: 220 }}>
                <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", width: `${p.path.unitPct}%` }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#71717a", marginTop: 4 }}>{p.path.unitSub}</div>
            </div>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(90deg,#4338ca,#7c3aed)", color: "#fff", borderRadius: 99, padding: "10px 18px", fontWeight: 800, fontSize: 14, fontFamily: BALOO, whiteSpace: "nowrap" }}>
              See my path
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Trial countdown (in-trial): full access now, convert before it ends. ── */}
      {p.trial && (
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#ecfdf5 0%,#eef2ff 100%)", border: "1px solid #bbf7d0", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "absolute", top: -50, right: -30, width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)" }} />
          <div style={{ position: "relative", minWidth: 0, maxWidth: 500 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 99, padding: "5px 11px", marginBottom: 11 }}>
              <Sparkles className="h-3.5 w-3.5" stroke="#059669" strokeWidth={2.4} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".02em", color: "#047857" }}>{p.trial.daysLeft} {p.trial.daysLeft === 1 ? "day" : "days"} left of full access</span>
            </div>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 22, color: "#14532d", lineHeight: 1.15 }}>{p.firstName} has full Readee+ access.</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3f3f46", marginTop: 7, lineHeight: 1.5 }}>Every lesson, unlimited Luna, and all the stories are unlocked during the free trial. Keep it going so {p.firstName}&rsquo;s progress doesn&rsquo;t stop.</div>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", flex: "none" }}>
            <Link href={p.upgradeHref} className="kh-lift" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(90deg,#059669,#4338ca)", color: "#fff", fontFamily: BALOO, fontWeight: 800, fontSize: 17, padding: "14px 24px", borderRadius: 99, boxShadow: "0 12px 30px -8px rgba(5,150,105,.45)" }}>
              Keep Readee+
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.6} />
            </Link>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>$6.99/mo billed yearly &middot; cancel anytime</span>
          </div>
        </div>
      )}

      {/* ── Win-back (lapsed): they had it and let it end — reactivate on the
             progress they'd lose. ── */}
      {!p.fullAccess && p.lapsed && p.momentum && (
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#fff1f2 0%,#eef2ff 100%)", border: "1px solid #fecdd3", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "24px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "absolute", top: -50, right: -30, width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,63,94,.13),transparent 70%)" }} />
          <div style={{ position: "relative", minWidth: 0, maxWidth: 500 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 99, padding: "5px 11px", marginBottom: 11 }}>
              <Lock className="h-3 w-3" stroke="#e11d48" strokeWidth={2.6} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".02em", color: "#be123c" }}>Readee+ has ended</span>
            </div>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 23, color: "#4c0519", lineHeight: 1.15 }}>{p.firstName}&rsquo;s journey is paused.</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3f3f46", marginTop: 7, lineHeight: 1.5 }}>
              {p.firstName} reached a {p.momentum.levelName} level and mastered {p.momentum.skillsMastered} skill{p.momentum.skillsMastered === 1 ? "" : "s"}. Reactivate to unlock every lesson again and pick up right where {p.firstName} left off.
            </div>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", flex: "none" }}>
            <Link href={p.upgradeHref} className="kh-lift" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(90deg,#e11d48,#4338ca)", color: "#fff", fontFamily: BALOO, fontWeight: 800, fontSize: 17, padding: "14px 24px", borderRadius: 99, boxShadow: "0 12px 30px -8px rgba(225,29,72,.45)" }}>
              Reactivate Readee+
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.6} />
            </Link>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#be123c" }}>$6.99/mo billed yearly &middot; cancel anytime</span>
          </div>
        </div>
      )}

      {/* ── Keep the momentum going (post-trial Free, never paid): sell the
             parent on Bobby's progress, not a wall. ── */}
      {!p.fullAccess && !p.lapsed && p.momentum && (
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#eef2ff 0%,#e0e7ff 100%)", border: "1px solid #c7d2fe", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "24px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "absolute", top: -50, right: -30, width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.14),transparent 70%)" }} />
          <div style={{ position: "relative", minWidth: 0, maxWidth: 470 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 99, padding: "5px 11px", marginBottom: 11 }}>
              <Sparkles className="h-3.5 w-3.5" stroke="#4338ca" strokeWidth={2.4} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".02em", color: "#4338ca" }}>Keep the momentum going</span>
            </div>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 23, color: "#1e1b4b", lineHeight: 1.15 }}>{p.firstName} is on a roll.</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3f3f46", marginTop: 7, lineHeight: 1.5 }}>
              {p.momentum.skillsMastered > 0
                ? `${p.firstName} has mastered ${p.momentum.skillsMastered} skill${p.momentum.skillsMastered === 1 ? "" : "s"} and is reading at a ${p.momentum.levelName} level. Don't let the momentum stop.`
                : `${p.firstName} is climbing toward a ${p.momentum.levelName} badge. Unlock every lesson and keep the momentum going.`}
            </div>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", flex: "none" }}>
            <Link
              href={p.upgradeHref}
              className="kh-lift"
              style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(90deg,#4338ca,#7c3aed)", color: "#fff", fontFamily: BALOO, fontWeight: 800, fontSize: 17, padding: "14px 24px", borderRadius: 99, boxShadow: "0 12px 30px -8px rgba(67,56,202,.5)" }}
            >
              Continue with Readee+
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.6} />
            </Link>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>$6.99/mo billed yearly &middot; cancel anytime</span>
          </div>
        </div>
      )}

      {/* ── Quick play tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        <QuickTile href={`/practice-hub?child=${p.childId}`} grad="linear-gradient(135deg,#8b5cf6,#6d28d9)" shadow="rgba(49,46,129,.3)" label="Practice" Icon={Target} />
        <QuickTile href={`/stories?child=${p.childId}`} grad="linear-gradient(135deg,#34d399,#14b8a6)" shadow="rgba(13,148,136,.35)" label="Stories" Icon={BookOpen} />
        <QuickTile href={`/luna?child=${p.childId}`} grad="linear-gradient(135deg,#a855f7,#ec4899)" shadow="rgba(168,85,247,.35)" label="Luna" Icon={Mic} badge={p.fullAccess ? undefined : "Readee+"} />
        <QuickTile href="/discover" grad="linear-gradient(135deg,#38bdf8,#2563eb)" shadow="rgba(37,99,235,.35)" label="Discover" Icon={Compass} />
      </div>

      {/* ── Keep it up strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        {/* This week */}
        <div style={{ background: "#fff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "18px 22px" }}>
          <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#18181b", marginBottom: 4 }}>This week</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#71717a", marginBottom: 12 }}>{p.weekSub}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
            {p.weekBars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                <div style={{
                  width: "100%", maxWidth: 26, borderRadius: "7px 7px 3px 3px",
                  background: b.isToday ? "linear-gradient(180deg,#8b5cf6,#6d28d9)" : b.hasValue ? "#c7d2fe" : "#f4f4f5",
                  height: `${Math.max(6, Math.round(b.pct * 0.56))}px`, minHeight: 4,
                  transition: "height .6s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
                <div style={{ fontSize: 10.5, fontWeight: 800, color: b.isToday ? "#6d28d9" : "#a1a1aa" }}>{b.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop teaser */}
        <Link href={p.shop.href} className="kh-lift" style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "18px 22px" }}>
          <div style={{ width: 58, height: 64, flex: "none", background: "#fffbeb", borderRadius: 16, padding: "4px 4px 0", border: "2px solid #fde68a" }}>
            <Bunny outfitId="bunny_astronaut" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#18181b" }}>Shop</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#71717a", marginTop: 2 }}>{p.shop.sub}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, background: "#fff7ed", borderRadius: 99, padding: "4px 10px" }}>
              <Carrot className="h-3.5 w-3.5" stroke="#f97316" strokeWidth={2.2} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#c2410c" }}>{p.shop.chip}</span>
            </div>
          </div>
        </Link>

        {/* League / leaderboard teaser */}
        <Link href={p.league.href} className="kh-lift" style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 24, boxShadow: CARD_SHADOW, padding: "18px 22px" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: p.league.locked ? "#f4f4f5" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            {p.league.locked
              ? <Lock className="h-6 w-6" stroke="#a1a1aa" strokeWidth={2} />
              : <Trophy className="h-7 w-7" stroke="#f59e0b" strokeWidth={2} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#18181b" }}>{p.league.title}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#71717a", marginTop: 2 }}>{p.league.sub}</div>
          </div>
          <ChevronRight className="h-5 w-5" stroke="#a1a1aa" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

/* ── small building blocks ── */

const statBase: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, background: "#fff",
  borderRadius: 20, padding: "12px 16px", boxShadow: CARD_SHADOW,
};
const iconBox: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 14, display: "flex",
  alignItems: "center", justifyContent: "center", flex: "none",
};

function StatCard({ children }: { children: React.ReactNode }) {
  return <div style={{ ...statBase, flex: 1, minWidth: 150 }}>{children}</div>;
}

function QuickTile({ href, grad, shadow, label, Icon, badge }: {
  href: string; grad: string; shadow: string; label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Optional corner lock badge (e.g. "Readee+") for premium-gated tiles. */
  badge?: string;
}) {
  return (
    <Link href={href} className="kh-tile" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, height: 128, borderRadius: 24, background: grad, boxShadow: `0 10px 40px -12px ${shadow}` }}>
      {badge && (
        <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.92)", color: "#4338ca", fontSize: 10.5, fontWeight: 800, letterSpacing: ".02em", borderRadius: 99, padding: "3px 8px" }}>
          <Lock className="h-2.5 w-2.5" strokeWidth={3} />{badge}
        </span>
      )}
      <Icon className="h-[38px] w-[38px] text-white" strokeWidth={1.8} />
      <span style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#fff" }}>{label}</span>
    </Link>
  );
}
