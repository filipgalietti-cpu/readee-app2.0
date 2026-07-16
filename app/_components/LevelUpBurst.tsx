"use client";

/**
 * Level-Up Burst — the level-up celebration (from the Claude Design
 * "Level-Up Burst"). A timeline-driven scene: badge rockets up with rays +
 * sparkles, "LEVEL UP!" title, a ribbon that flips old→new level name, the
 * bunny cheering, and a "+N CARROTS" bonus pill that bounces in underneath.
 * Faithful port of the design's <Stage>/useTime engine, scaled to fit the
 * container. Uses the app's real BunnyReaction. Tap to replay.
 */

import { useEffect, useRef, useState } from "react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { LevelUpSFX } from "@/app/_components/level-up-sfx";
import { useAudio } from "@/lib/audio/use-audio";

const W = 1280, H = 720, CX = 640, BADGE_Y = 330;
const GOLD = "#f59e0b", GOLD_DEEP = "#d97706", VIOLET = "#8b5cf6";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const Easing = {
  easeOutCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  easeOutQuad: (p: number) => 1 - (1 - p) * (1 - p),
  easeInQuad: (p: number) => p * p,
  easeInOutQuad: (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  easeOutBack: (p: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
};
type Ease = (p: number) => number;
const animate = (cfg: { from: number; to: number; start: number; end: number; ease: Ease }) => (t: number) => {
  if (t <= cfg.start) return cfg.from;
  if (t >= cfg.end) return cfg.to;
  return cfg.from + (cfg.to - cfg.from) * cfg.ease((t - cfg.start) / (cfg.end - cfg.start));
};
function mulberry(seed: number) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function CarrotIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path fill="#16a34a" d="M12 8.5 C10.5 6.4 8.4 5.7 6.7 6.1 C7.9 3.9 10.4 3.3 12 4.8 C13.6 3.3 16.1 3.9 17.3 6.1 C15.6 5.7 13.5 6.4 12 8.5 Z" />
      <path fill="#f97316" d="M9.1 8.3 L14.9 8.3 C15.7 12.7 14.3 17.6 12 21.6 C9.7 17.6 8.3 12.7 9.1 8.3 Z" />
    </svg>
  );
}
function SparkleStar({ size, color }: { size: number; color: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}><path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" fill={color} /></svg>;
}

function SparkleBurst({ t, t0, count, seed, minDist, maxDist, cx, cy }: { t: number; t0: number; count: number; seed: number; minDist: number; maxDist: number; cx: number; cy: number }) {
  const dur = 1.05;
  if (t < t0 || t > t0 + dur) return null;
  const rand = mulberry(seed);
  const kids = [];
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.5;
    const dist = minDist + rand() * (maxDist - minDist);
    const size = 10 + rand() * 14;
    const color = i % 3 === 2 ? VIOLET : i % 3 === 1 ? GOLD_DEEP : GOLD;
    const delay = rand() * 0.12;
    const p = clamp((t - t0 - delay) / (dur - 0.15), 0, 1);
    if (p <= 0) continue;
    const e = Easing.easeOutCubic(p);
    const x = cx + Math.cos(ang) * e * dist;
    const y = cy + Math.sin(ang) * e * dist + 30 * p * p;
    const op = 1 - Easing.easeInQuad(p);
    const sc = 1 - 0.4 * p;
    const rot = ang * 57 + p * 160 * (i % 2 ? 1 : -1);
    kids.push(
      <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: op, transform: `scale(${sc}) rotate(${rot}deg)` }}>
        {i % 4 === 3 ? <div style={{ width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: color }} /> : <SparkleStar size={size} color={color} />}
      </div>,
    );
  }
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{kids}</div>;
}

function Orbs({ t }: { t: number }) {
  const d1 = Math.sin(t * 0.5) * 20, d2 = Math.cos(t * 0.4) * 24;
  const orb = (x: number, y: number, sz: number, c: string, dx: number) => (
    <div style={{ position: "absolute", left: x + dx, top: y, width: sz, height: sz, borderRadius: "50%", background: c, filter: "blur(60px)", pointerEvents: "none" }} />
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {orb(-120, -140, 460, "rgba(199,210,254,0.8)", d1)}
      {orb(920, 420, 520, "rgba(221,214,254,0.7)", d2)}
      {orb(760, -220, 420, "rgba(254,243,199,0.7)", -d1)}
    </div>
  );
}
function BreathGlow() {
  return <div style={{ position: "absolute", left: CX - 230, top: BADGE_Y - 230, width: 460, height: 460, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(139,92,246,0.18) 45%, transparent 70%)", filter: "blur(10px)", animation: "readeeBreath 2.8s ease-in-out infinite" }} />;
}
function Rays({ t }: { t: number }) {
  const fadeIn = animate({ from: 0, to: 1, start: 1.0, end: 1.4, ease: Easing.easeOutCubic })(t);
  const settle = animate({ from: 1, to: 0.45, start: 3.2, end: 4.8, ease: Easing.easeInOutQuad })(t);
  const grow = animate({ from: 0.5, to: 1, start: 1.0, end: 1.7, ease: Easing.easeOutBack })(t);
  const op = fadeIn * settle;
  if (op <= 0.01) return null;
  const rot = (t - 1) * 14;
  const layer = (angleOff: number, colorA: string, alpha: number, sz: number) => (
    <div style={{ position: "absolute", left: CX - sz / 2, top: BADGE_Y - sz / 2, width: sz, height: sz, borderRadius: "50%", background: `repeating-conic-gradient(from ${angleOff}deg, ${colorA} 0deg 9deg, transparent 9deg 30deg)`, WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 12%, rgba(0,0,0,0) 66%)", maskImage: "radial-gradient(circle, rgba(0,0,0,1) 12%, rgba(0,0,0,0) 66%)", opacity: alpha * op, transform: `rotate(${rot}deg) scale(${grow})`, pointerEvents: "none" }} />
  );
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{layer(0, "rgba(245,158,11,0.40)", 1, 760)}{layer(15, "rgba(139,92,246,0.28)", 0.9, 620)}</div>;
}
function Streak({ t }: { t: number }) {
  if (t < 0.45 || t > 1.55) return null;
  const op = animate({ from: 0.9, to: 0, start: 1.1, end: 1.5, ease: Easing.easeOutQuad })(t);
  const y = animate({ from: H + 240, to: BADGE_Y, start: 0.45, end: 1.2, ease: Easing.easeOutBack })(t);
  return <div style={{ position: "absolute", left: CX - 34, top: y + 90, width: 68, height: H - y + 40, background: "linear-gradient(180deg, rgba(251,191,36,0.85), rgba(139,92,246,0.25) 60%, transparent)", borderRadius: 40, filter: "blur(6px)", opacity: Math.max(0, op), pointerEvents: "none" }} />;
}
function Badge({ t, newLevel }: { t: number; newLevel: number }) {
  const oldLevel = newLevel - 1;
  const y = animate({ from: H + 240, to: BADGE_Y, start: 0.45, end: 1.2, ease: Easing.easeOutBack })(t);
  const sc = animate({ from: 0.55, to: 1, start: 0.45, end: 1.2, ease: Easing.easeOutBack })(t);
  const wob = t > 1.2 ? Math.sin((t - 1.2) * 2.2) * 1.2 : 0;
  const TICK = 2.15;
  const ticked = t >= TICK;
  const pop = ticked ? animate({ from: 1.5, to: 1, start: TICK, end: TICK + 0.4, ease: Easing.easeOutBack })(t) : 1;
  const slideOld = animate({ from: 0, to: -54, start: TICK - 0.12, end: TICK, ease: Easing.easeInQuad })(t);
  const D = 236;
  return (
    <div style={{ position: "absolute", left: CX - D / 2, top: y - D / 2, width: D, height: D, transform: `scale(${sc}) rotate(${wob}deg)`, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(160deg, #fbbf24, #f59e0b 45%, #b45309)", boxShadow: "0 18px 50px -12px rgba(30,27,75,0.45), 0 0 0 6px rgba(255,255,255,0.9)" }} />
      <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "linear-gradient(180deg, #4f46e5, #312e81)", boxShadow: "inset 0 6px 18px rgba(255,255,255,0.25), inset 0 -10px 22px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#fbbf24" style={{ marginBottom: 2 }}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
        <div style={{ position: "relative", height: 76, width: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!ticked && <div style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: 68, color: "#fff", lineHeight: 1, transform: `translateY(${slideOld}px)`, opacity: 1 + slideOld / 54 }}>{oldLevel}</div>}
          {ticked && <div style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: 68, color: "#fff", lineHeight: 1, transform: `scale(${pop})` }}>{newLevel}</div>}
        </div>
        <div style={{ fontFamily: "var(--font-nunito), 'Nunito', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: 3, color: "#c7d2fe", textTransform: "uppercase", marginTop: -4 }}>Level</div>
      </div>
    </div>
  );
}
function LevelUpTitle({ t }: { t: number }) {
  if (t < 1.2) return null;
  const letters = "LEVEL UP!".split("");
  const float = Math.sin(t * 1.8) * 4;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 96 + float, display: "flex", justifyContent: "center", gap: 4, pointerEvents: "none" }}>
      {letters.map((ch, i) => {
        const s = 1.25 + i * 0.045;
        const sc = animate({ from: 0, to: 1, start: s, end: s + 0.34, ease: Easing.easeOutBack })(t);
        return <span key={i} style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: 100, lineHeight: 1, display: "inline-block", transform: `scale(${sc})`, background: "linear-gradient(120deg, #4338ca, #8b5cf6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", width: ch === " " ? 28 : "auto", filter: "drop-shadow(0 6px 0 rgba(30,27,75,0.12))" }}>{ch === " " ? " " : ch}</span>;
      })}
    </div>
  );
}
function Ribbon({ t, oldName, newName }: { t: number; oldName: string; newName: string }) {
  if (t < 1.35) return null;
  const inSc = animate({ from: 0.4, to: 1, start: 1.35, end: 1.7, ease: Easing.easeOutBack })(t);
  const FLIP = 2.15;
  const oldRx = animate({ from: 0, to: -92, start: FLIP - 0.22, end: FLIP, ease: Easing.easeInQuad })(t);
  const newRx = animate({ from: 92, to: 0, start: FLIP, end: FLIP + 0.32, ease: Easing.easeOutBack })(t);
  const showNew = t >= FLIP;
  const wRib = 460, hRib = 78;
  const face = (label: string, rx: number, bg: string) => (
    <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 50%, 100% 100%, 0 100%, 22px 50%)", background: bg, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotateX(${rx}deg)`, backfaceVisibility: "hidden", boxShadow: "0 12px 30px -10px rgba(30,27,75,0.35)" }}>
      <span style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: 40, color: "#fff", letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: CX - wRib / 2, top: 468, width: wRib, height: hRib, transform: `scale(${inSc})`, perspective: 700, pointerEvents: "none" }}>
      {!showNew && face(oldName, oldRx, "linear-gradient(180deg, #6d28d9, #4c1d95)")}
      {showNew && face(newName, newRx, "linear-gradient(180deg, #4f46e5, #3730a3)")}
    </div>
  );
}
function BunnyCheer({ t, outfitId }: { t: number; outfitId: string | null }) {
  if (t < 1.15) return null;
  const enter = animate({ from: 0, to: 1, start: 1.15, end: 1.4, ease: Easing.easeOutCubic })(t);
  const hop = (s: number, e: number, h: number) => (t < s || t > e ? 0 : -h * Math.sin(Math.PI * ((t - s) / (e - s))));
  const jy = hop(1.45, 1.9, 100);
  const wB = 250, hB = 271, groundY = 648;
  const shadowSc = 1 - clamp(-jy / 100, 0, 1) * 0.35;
  return (
    <div style={{ position: "absolute", left: 895, top: 0, opacity: enter, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: wB / 2 - 66 * shadowSc, top: groundY - 14, width: 132 * shadowSc, height: 24 * shadowSc, borderRadius: "50%", background: "rgba(30,27,75,0.18)", filter: "blur(4px)" }} />
      <div style={{ position: "absolute", left: 0, width: wB, height: hB, top: groundY - hB + 30 + jy + (1 - enter) * 60 }}>
        <BunnyReaction outfitId={outfitId} state="levelup" />
      </div>
    </div>
  );
}
function BonusCarrots({ t, bonus }: { t: number; bonus: number }) {
  const T0 = 2.75;
  if (t < T0) return null;
  const inY = animate({ from: 70, to: 0, start: T0, end: T0 + 0.45, ease: Easing.easeOutBack })(t);
  const inSc = animate({ from: 0.5, to: 1, start: T0, end: T0 + 0.45, ease: Easing.easeOutBack })(t);
  const op = animate({ from: 0, to: 1, start: T0, end: T0 + 0.2, ease: Easing.easeOutCubic })(t);
  const cnt = Math.round(animate({ from: 0, to: bonus, start: T0 + 0.2, end: T0 + 0.9, ease: Easing.easeOutCubic })(t));
  const pop = t >= T0 + 0.9 ? animate({ from: 1.3, to: 1, start: T0 + 0.9, end: T0 + 1.2, ease: Easing.easeOutBack })(t) : 1;
  const labelOp = animate({ from: 0, to: 1, start: T0 + 0.65, end: T0 + 1.0, ease: Easing.easeOutCubic })(t);
  const LAND = T0 + 0.38;
  const flights = [
    { vx: -160, vy: -270, rot: -270, d: 0, s: 26 },
    { vx: 120, vy: -310, rot: 230, d: 0.05, s: 30 },
    { vx: -70, vy: -340, rot: -180, d: 0.1, s: 22 },
    { vx: 180, vy: -220, rot: 310, d: 0.13, s: 26 },
  ];
  const carrots: React.ReactNode[] = [];
  flights.forEach((f, i) => {
    const p = clamp((t - LAND - f.d) / 0.95, 0, 1);
    if (p <= 0 || p >= 1) return;
    const x = CX + f.vx * p;
    const y = 606 + f.vy * p + 400 * p * p;
    carrots.push(<div key={i} style={{ position: "absolute", left: x - f.s / 2, top: y - f.s / 2, opacity: 1 - Easing.easeInQuad(p), transform: `rotate(${f.rot * p}deg)` }}><CarrotIcon size={f.s} /></div>);
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SparkleBurst t={t} t0={LAND} count={10} seed={53} minDist={70} maxDist={150} cx={CX} cy={606} />
      {carrots}
      <div style={{ position: "absolute", left: 0, right: 0, top: 572 + inY, display: "flex", justifyContent: "center", opacity: op }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 30px 12px", background: "#fff", borderRadius: 999, boxShadow: "0 10px 40px -12px rgba(49,46,129,0.25), 0 0 0 1px rgba(226,232,240,1)", transform: `scale(${inSc})`, minWidth: 320, justifyContent: "center" }}>
          <CarrotIcon size={34} />
          <span style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1, background: "linear-gradient(180deg, #fbbf24, #d97706)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", display: "inline-block", transform: `scale(${pop})`, letterSpacing: 0.5 }}>+{cnt} CARROTS</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 668, textAlign: "center", opacity: labelOp, fontFamily: "var(--font-nunito), 'Nunito', sans-serif", fontWeight: 800, fontSize: 20, color: "#4338ca" }}>Level-up bonus!</div>
    </div>
  );
}

function useTime(duration: number, token: number, startAt = 0) {
  const [t, setT] = useState(startAt);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const el = startAt + (now - start) / 1000;
      setT(Math.min(el, duration));
      if (el < duration) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [duration, token, startAt]);
  return t;
}

const DURATION = 6.5;

export default function LevelUpBurst({
  oldName, newName, newLevel, bunnyOutfit = null, carrotBonus, onDone, compact = false, soundOn = true,
}: {
  oldName: string; newName: string; newLevel: number; bunnyOutfit?: string | null; carrotBonus: number;
  /** Fired once when this burst's timeline finishes — lets a parent chain
   *  multiple bursts (a kid who jumps 2+ levels in one session). */
  onDone?: () => void;
  /** Snappy mode for intermediate bursts in a multi-level chain: skips the
   *  slow intro build and ends sooner so only the final level gets the full
   *  show. */
  compact?: boolean;
  /** Play the Web-Audio celebration SFX (whoosh/fanfare/count-up/ding). */
  soundOn?: boolean;
}) {
  // Compact bursts jump straight to the reveal (skip the ~2.4s build) and
  // dwell only briefly before handing off to the next level.
  const startAt = compact ? 2.4 : 0;
  const dwellMs = compact ? 2600 : DURATION * 1000;
  const [token, setToken] = useState(0);
  const t = useTime(DURATION, token, startAt);

  // ── SFX: fire each celebration sound as the timeline crosses its cue ──
  const { muted } = useAudio();
  const soundEnabled = soundOn && !muted;
  const sfxPrev = useRef(startAt);
  const sfxTick = useRef(-1);
  useEffect(() => {
    if (!soundEnabled) { sfxPrev.current = t; return; }
    const p = sfxPrev.current;
    sfxPrev.current = t;
    if (t < p) { sfxTick.current = -1; return; } // replay reset
    const crossed = (cue: number) => p < cue && t >= cue;
    if (crossed(0.45)) LevelUpSFX.whoosh();
    if (crossed(1.08)) LevelUpSFX.impact();
    if (crossed(1.28)) LevelUpSFX.fanfare();
    if (crossed(2.15)) LevelUpSFX.pop();
    if (crossed(3.13)) { LevelUpSFX.thump(); [0, 1, 2, 3].forEach((i) => window.setTimeout(() => LevelUpSFX.carrotPop(i), i * 60)); }
    // steady ~55ms cadence for the carrot count-up (slot-machine payout feel)
    if (t >= 2.95 && t <= 3.65) {
      const step = Math.floor((t - 2.95) / 0.055);
      if (step !== sfxTick.current) {
        sfxTick.current = step;
        LevelUpSFX.tick((t - 2.95) / 0.7);
      }
    }
    if (crossed(3.66)) LevelUpSFX.ding();
    if (crossed(4.7)) LevelUpSFX.settle();
  }, [t, soundEnabled]);

  // Fire onDone once per mount (not on tap-replay) so a multi-level chain
  // advances exactly one step.
  const doneFired = useRef(false);
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(() => {
      if (!doneFired.current) { doneFired.current = true; onDone(); }
    }, dwellMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width) setScale(Math.min(r.width / W, r.height / H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} onClick={() => setToken((x) => x + 1)} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: "pointer", background: "#eef2ff" }}>
      <style>{`
        @keyframes readeeBreath{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.09);opacity:1}}
        .bn-ground{opacity:0 !important;animation:none !important}
      `}</style>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: W, height: H, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" }}>
        <Orbs t={t} />
        {t > 1.05 && <BreathGlow />}
        <Rays t={t} />
        <Streak t={t} />
        <SparkleBurst t={t} t0={1.08} count={26} seed={7} minDist={170} maxDist={360} cx={CX} cy={BADGE_Y} />
        <SparkleBurst t={t} t0={2.18} count={14} seed={31} minDist={120} maxDist={240} cx={CX} cy={BADGE_Y} />
        <Badge t={t} newLevel={newLevel} />
        <LevelUpTitle t={t} />
        <Ribbon t={t} oldName={oldName} newName={newName} />
        <BonusCarrots t={t} bonus={carrotBonus} />
        <BunnyCheer t={t} outfitId={bunnyOutfit} />
      </div>
    </div>
  );
}
