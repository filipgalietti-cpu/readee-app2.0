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
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import {
  Flame,
  Carrot,
  Star,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Play,
  Target,
  BookOpen,
  Mic,
  Compass,
  Trophy,
  Lock,
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

export interface KidHomeProps {
  childId: string;
  firstDay: boolean;
  // hero
  bubbleTitle: string;
  bubbleSub: string;
  equippedOutfitId: string;
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
  planSteps: Array<{ num: string; label: string; sub: string; status: PlanStatus; href?: string }>;
  // path teaser
  path: { nodes: NodeKind[]; unitTitle: string; unitPct: number; unitSub: string; href: string };
  // keep-it-up
  weekSub: string;
  weekBars: Array<{ day: string; pct: number; isToday: boolean; hasValue: boolean }>;
  shop: { href: string; sub: string; chip: string };
  league: { href: string; title: string; sub: string; locked: boolean };
}

export default function KidHome(p: KidHomeProps) {
  const [reaction, setReaction] = useState<"" | "levelup">("");
  const rxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrate = () => {
    if (reaction) return;
    setReaction("levelup");
    if (rxTimer.current) clearTimeout(rxTimer.current);
    rxTimer.current = setTimeout(() => setReaction(""), 6500);
  };

  const ringCirc = 150.8;
  const ringPct = p.goalTotal > 0 ? p.goalDone / p.goalTotal : 0;
  const ringOffset = ringCirc * (1 - ringPct);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes readeePulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.45)}50%{box-shadow:0 0 0 10px rgba(124,58,237,0)}}
        @keyframes readeeGlow{0%,100%{filter:drop-shadow(0 0 2px rgba(249,115,22,.4))}50%{filter:drop-shadow(0 0 8px rgba(249,115,22,.8))}}
        .kh-lift{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1),box-shadow .2s}
        .kh-lift:hover{transform:translateY(-3px)}
        .kh-tile{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1)}
        .kh-tile:hover{transform:translateY(-5px) scale(1.03)}
        .kh-outfit{transition:transform .2s cubic-bezier(0.34,1.56,0.64,1)}
        .kh-outfit:hover{transform:scale(1.12)}
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
              {reaction === "levelup"
                ? <BunnyReaction outfitId={p.equippedOutfitId} state="levelup" />
                : <Bunny outfitId={p.equippedOutfitId} />}
            </button>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
              {p.outfitChoices.map((c) => {
                const selected = c.id === p.equippedOutfitId;
                return (
                  <button
                    key={c.id}
                    onClick={() => c.owned && p.onPickOutfit(c.id)}
                    title={c.owned ? c.name : `${c.name} — earn it!`}
                    className="kh-outfit"
                    style={{
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
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>
              {p.firstDay ? "Win outfits as you read!" : "Pick an outfit — tap Readee to celebrate!"}
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
                const inner = (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 18,
                    background: cur ? "#f5f3ff" : done ? "#f0fdf4" : "#fafafa",
                    border: `2px solid ${cur ? "#ddd6fe" : done ? "#dcfce7" : "#f4f4f5"}`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                      background: done ? "#10b981" : cur ? "linear-gradient(135deg,#4338ca,#7c3aed)" : "#e4e4e7",
                      color: done || cur ? "#fff" : "#a1a1aa", fontFamily: BALOO, fontWeight: 800, fontSize: 17,
                      animation: cur ? "readeePulse 2s ease-in-out infinite" : "none",
                    }}>
                      {done ? <Check className="h-5 w-5" strokeWidth={3.5} /> : s.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15.5, color: done ? "#a1a1aa" : "#18181b", textDecoration: done ? "line-through" : "none" }}>{s.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#a1a1aa" }}>{s.sub}</div>
                    </div>
                    <ChevronRight className="h-5 w-5" stroke={cur ? "#7c3aed" : "#d4d4d8"} strokeWidth={2.5} />
                  </div>
                );
                return s.href
                  ? <Link key={i} href={s.href} className="block">{inner}</Link>
                  : <div key={i}>{inner}</div>;
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "0 4px" }}>
              <Sparkles className="h-4 w-4" stroke="#f59e0b" strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#71717a" }}>Finish all {p.goalTotal} to fill your ring — confetti time!</span>
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

      {/* ── Quick play tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        <QuickTile href={`/practice-hub?child=${p.childId}`} grad="linear-gradient(135deg,#8b5cf6,#6d28d9)" shadow="rgba(49,46,129,.3)" label="Practice" Icon={Target} />
        <QuickTile href={`/stories?child=${p.childId}`} grad="linear-gradient(135deg,#34d399,#14b8a6)" shadow="rgba(13,148,136,.35)" label="Stories" Icon={BookOpen} />
        <QuickTile href={`/buddy?child=${p.childId}`} grad="linear-gradient(135deg,#a855f7,#ec4899)" shadow="rgba(168,85,247,.35)" label="Reading Buddy" Icon={Mic} />
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

function QuickTile({ href, grad, shadow, label, Icon }: {
  href: string; grad: string; shadow: string; label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <Link href={href} className="kh-tile" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, height: 128, borderRadius: 24, background: grad, boxShadow: `0 10px 40px -12px ${shadow}` }}>
      <Icon className="h-[38px] w-[38px] text-white" strokeWidth={1.8} />
      <span style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 17, color: "#fff" }}>{label}</span>
    </Link>
  );
}
