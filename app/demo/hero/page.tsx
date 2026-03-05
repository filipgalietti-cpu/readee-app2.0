"use client";

import { useState, useEffect, useRef } from "react";
import {
  Carrot, Rocket, Rainbow, Egg, Star, Guitar, Cat, Dog, Rabbit, Squirrel, Fish, Bird,
  Moon, Umbrella, Flower2, Ghost, Snowflake, Palmtree, Trophy, Diamond, Flame,
  Target, Brain, Crown, Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Animation Helpers (JS-driven for virtual time) ── */

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

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function anim(elapsed: number, start: number, duration: number): number {
  return easeOut(clamp01((elapsed - start) / duration));
}

/* ─── Demo Data ──────────────────────────────────────── */

const CHILD_NAME = "Emma";
const CARROTS = 127;
const STREAK = 5;

const STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";
const LESSON_IMAGE = `${STORAGE}/images/kindergarten/RL.K.1/RL.K.1-Q4.png`;

/* ─── SVG Icons ──────────────────────────────────────── */

const TargetIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const PuzzleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.611a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.611-1.611a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.969a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const MapIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const FlameIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="fg" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <linearGradient id="fi" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
    </defs>
    <path d="M16 3c0 0-8 8-8 16a8 8 0 0016 0c0-4-2-7-4-9 0 0 0 4-2 6s-4 0-4-4c0-3 2-9 2-9z" fill="url(#fg)" />
    <path d="M16 14c0 0-3 3-3 7a3 3 0 006 0c0-2-1-4-1.5-4.5 0 0-0.5 1.5-1 2s-1 0-1-1.5c0-1 0.5-3 0.5-3z" fill="url(#fi)" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-16 h-16 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" /><path d="M22 5h-4" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 4l3 12h14l3-12-6 7-4-9-4 9-6-7z" />
    <rect x="5" y="18" width="14" height="3" rx="1" />
  </svg>
);

const MedalIcon = ({ color }: { color: string }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="14" r="6" fill={color} stroke={color} strokeWidth={1} />
    <path d="M8 2l2 6h-4l2-6z" fill={color} opacity={0.5} />
    <path d="M16 2l-2 6h4l-2-6z" fill={color} opacity={0.5} />
  </svg>
);

/* ─── Choice colors ──────────────────────────────────── */
const CHOICE_BG = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
];

/* ─── Timeline ───────────────────────────────────────── */
const SCREENS = [
  { start: 0, end: 4000, fade: 500 },      // Dashboard
  { start: 4000, end: 9000, fade: 500 },    // Lesson MCQ
  { start: 9000, end: 12000, fade: 500 },   // Completion
  { start: 12000, end: 19000, fade: 500 },  // Shop (7s — tab cycling)
  { start: 19000, end: 23000, fade: 500 },  // Leaderboard
];

function screenOpacity(elapsed: number, screen: typeof SCREENS[0]): number {
  const { start, end, fade } = screen;
  const ms = elapsed;
  if (ms < start) return 0;
  if (ms < start + fade) return (ms - start) / fade;
  if (ms <= end - fade) return 1;
  if (ms < end) return (end - ms) / fade;
  // Last screen stays visible
  if (screen === SCREENS[SCREENS.length - 1] && ms >= end) return 1;
  return 0;
}

/* ─── Nav Bar ────────────────────────────────────────── */
function AppNav({ activeLink, opacity }: { activeLink: string; opacity: number }) {
  if (opacity <= 0) return null;
  const links = [
    { label: "Dashboard", id: "dashboard" },
    { label: "Analytics", id: "analytics" },
    { label: "Shop", id: "shop" },
  ];
  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 border-b border-zinc-100" style={{ opacity }}>
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-zinc-800">read</span>
            <span className="text-indigo-600">ee</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {links.map((l) => (
            <span
              key={l.id}
              className={`text-sm font-medium ${
                l.id === activeLink
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-0.5"
                  : "text-zinc-400"
              }`}
            >
              {l.label}
            </span>
          ))}
          <span className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-500 text-white px-2 py-0.5 rounded-full">
            Readee+
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson Chrome ──────────────────────────────────── */
function LessonChrome({ progress, carrots, opacity }: { progress: number; carrots: number; opacity: number }) {
  if (opacity <= 0) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-30" style={{ opacity }}>
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center gap-3">
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 h-3.5 bg-zinc-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            boxShadow: "0 0 8px rgba(74,222,128,0.4)",
          }} />
        </div>
        <div className="flex items-center gap-1 bg-zinc-200 px-2.5 py-1 rounded-full">
          <Carrot className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
          <span className="text-xs font-bold text-orange-600 tabular-nums">{carrots}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Confetti ───────────────────────────────────────── */
function Confetti() {
  const colors = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#38bdf8", "#fbbf24", "#34d399"];
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    left: Math.random() * 100, delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.2, size: 4 + Math.random() * 6,
    shape: i % 3,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "-10px",
          width: p.shape === 2 ? p.size * 0.4 : p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.shape === 1 ? "50%" : "2px",
          animation: `confetti-fall-${p.id % 3} ${p.duration}s ${p.delay}s ease-in forwards`, opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ─── Leaderboard data ───────────────────────────────── */
const LEADERBOARD = [
  { rank: 1, name: "Sophia", carrots: 245, isYou: false },
  { rank: 2, name: "Liam", carrots: 212, isYou: false },
  { rank: 3, name: "Olivia", carrots: 198, isYou: false },
  { rank: 4, name: CHILD_NAME, carrots: CARROTS, isYou: true },
  { rank: 5, name: "Noah", carrots: 115, isYou: false },
  { rank: 6, name: "Ava", carrots: 98, isYou: false },
];

/* ─── Shop items ─────────────────────────────────────── */
type ShopItem = { icon: LucideIcon; name: string; price: number; color: string };
const SHOP_TABS: { label: string; items: ShopItem[] }[] = [
  { label: "All", items: [
    { icon: Egg, name: "Unicorn", price: 25, color: "text-violet-500" },
    { icon: Rocket, name: "Rocket", price: 30, color: "text-blue-500" },
    { icon: Rainbow, name: "Rainbow", price: 20, color: "text-pink-500" },
    { icon: Flame, name: "Dragon", price: 45, color: "text-red-500" },
    { icon: Star, name: "Star Pet", price: 35, color: "text-amber-500" },
    { icon: Guitar, name: "Guitar", price: 40, color: "text-emerald-500" },
  ]},
  { label: "Pets", items: [
    { icon: Cat, name: "Kitty", price: 20, color: "text-orange-500" },
    { icon: Dog, name: "Puppy", price: 25, color: "text-amber-600" },
    { icon: Rabbit, name: "Bunny", price: 30, color: "text-pink-500" },
    { icon: Squirrel, name: "Fox", price: 35, color: "text-orange-600" },
    { icon: Fish, name: "Fishy", price: 40, color: "text-blue-500" },
    { icon: Bird, name: "Owl", price: 30, color: "text-emerald-600" },
  ]},
  { label: "Themes", items: [
    { icon: Moon, name: "Night Sky", price: 50, color: "text-indigo-500" },
    { icon: Umbrella, name: "Beach", price: 45, color: "text-cyan-500" },
    { icon: Flower2, name: "Sakura", price: 40, color: "text-pink-400" },
    { icon: Ghost, name: "Spooky", price: 35, color: "text-violet-500" },
    { icon: Snowflake, name: "Winter", price: 45, color: "text-sky-400" },
    { icon: Palmtree, name: "Tropical", price: 40, color: "text-green-500" },
  ]},
  { label: "Badges", items: [
    { icon: Trophy, name: "Champion", price: 60, color: "text-amber-500" },
    { icon: Diamond, name: "Diamond", price: 55, color: "text-cyan-500" },
    { icon: Flame, name: "On Fire", price: 40, color: "text-red-500" },
    { icon: Target, name: "Bullseye", price: 35, color: "text-rose-500" },
    { icon: Brain, name: "Brain", price: 45, color: "text-pink-500" },
    { icon: Crown, name: "Royal", price: 50, color: "text-amber-500" },
  ]},
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function HeroDemoPage() {
  const elapsed = useElapsed();

  /* Preload lesson image */
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    const img = new Image();
    img.src = LESSON_IMAGE;
  }, []);

  /* Compute screen opacities */
  const opacities = SCREENS.map((s) => screenOpacity(elapsed, s));

  /* Nav logic: show on screens 0,3,4 (Dashboard, Shop, Leaderboard) */
  const navOpacity = Math.max(opacities[0], opacities[3], opacities[4]);
  const activeNav = opacities[4] > 0.5 ? "analytics" : opacities[3] > 0.5 ? "shop" : "dashboard";

  /* Lesson chrome: show on screens 1,2 */
  const lessonChromeOpacity = Math.max(opacities[1], opacities[2]);

  /* Lesson progress animation — smooth JS-driven */
  const lessonLocalMs = elapsed - SCREENS[1].start;
  const lessonProgress = 60 + 20 * anim(elapsed, SCREENS[1].start, 2000) + 20 * anim(elapsed, SCREENS[1].start + 3500, 500);
  const lessonCarrots = lessonLocalMs > 3500 ? CARROTS + 3 : CARROTS;

  /* Lesson phases */
  const showSelecting = lessonLocalMs >= 2500;
  const showFeedback = lessonLocalMs >= 3500;

  /* Completion timing */
  const compLocalMs = elapsed - SCREENS[2].start;
  const compFade = anim(elapsed, SCREENS[2].start, 600);
  const compCarrotFade = anim(elapsed, SCREENS[2].start + 800, 400);
  const compStreakFade = anim(elapsed, SCREENS[2].start + 1200, 400);

  /* Shop timing — tab cycling: All(0-1.5s) → Pets(1.5-3s) → Themes(3-4.5s) → Badges(4.5-6s) */
  const shopLocalMs = elapsed - SCREENS[3].start;
  const shopHeaderFade = anim(elapsed, SCREENS[3].start, 400);
  const shopBoxFade = anim(elapsed, SCREENS[3].start + 300, 500);
  const shopGridFade = anim(elapsed, SCREENS[3].start + 600, 500);
  const shopTabIdx = shopLocalMs < 1500 ? 0 : shopLocalMs < 3000 ? 1 : shopLocalMs < 4500 ? 2 : 3;
  const shopTab = SHOP_TABS[shopTabIdx];
  const shopTabSwitchMs = [0, 1500, 3000, 4500][shopTabIdx];
  const shopItemsFade = anim(elapsed, SCREENS[3].start + shopTabSwitchMs + 600, 300);

  /* Leaderboard timing */
  const lbFlameFade = anim(elapsed, SCREENS[4].start, 500);
  const lbBadgeFade = anim(elapsed, SCREENS[4].start + 300, 400);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Nav and lesson chrome removed for clean recording */}

      {/* ═══ SCREEN 1: Dashboard ═══ */}
      <div className="absolute inset-0 flex flex-col" style={{ opacity: opacities[0], pointerEvents: opacities[0] > 0 ? "auto" : "none" }}>
        <div className="pt-8 px-6 max-w-xl mx-auto w-full flex flex-col gap-4">
          {/* Welcome */}
          <div style={{ opacity: anim(elapsed, 200, 500), transform: `translateY(${(1 - anim(elapsed, 200, 500)) * 15}px)` }}>
            <h1 className="text-2xl font-bold text-zinc-800">
              Welcome back, <span className="text-indigo-600">{CHILD_NAME}</span>!
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">Kindergarten</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3" style={{ opacity: anim(elapsed, 500, 500), transform: `translateY(${(1 - anim(elapsed, 500, 500)) * 12}px)` }}>
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
              <Carrot className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              <span className="text-sm font-bold text-orange-600">{CARROTS}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
              <FlameIcon size={16} />
              <span className="text-sm font-bold text-rose-600">{STREAK} days</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
              <BookOpenIcon />
              <span className="text-sm font-bold text-indigo-600">12 stories</span>
            </div>
          </div>

          {/* Continue Lesson CTA */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-4 text-white flex items-center justify-between" style={{ opacity: anim(elapsed, 800, 500), transform: `translateY(${(1 - anim(elapsed, 800, 500)) * 12}px)` }}>
            <div>
              <p className="text-xs font-semibold text-indigo-200! uppercase tracking-wider">Continue where you left off</p>
              <p className="text-lg font-bold mt-0.5 text-white!">Key Details</p>
              <p className="text-sm text-indigo-200!">RL.K.1 &middot; 3 of 5 complete</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-sm font-bold">
              Continue →
            </div>
          </div>

          {/* Hero tiles 2x2 */}
          <div className="grid grid-cols-2 gap-3" style={{ opacity: anim(elapsed, 1100, 600), transform: `translateY(${(1 - anim(elapsed, 1100, 600)) * 15}px)` }}>
            {[
              { icon: <TargetIcon />, label: "Practice", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { icon: <PuzzleIcon />, label: "Games", color: "bg-purple-50 border-purple-200 text-purple-700" },
              { icon: <BookOpenIcon />, label: "Stories", color: "bg-blue-50 border-blue-200 text-blue-700" },
              { icon: <MapIcon />, label: "Journey", color: "bg-amber-50 border-amber-200 text-amber-700" },
            ].map((tile) => (
              <div key={tile.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${tile.color}`}>
                {tile.icon}
                <span className="font-bold text-sm">{tile.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SCREEN 2: Lesson MCQ ═══ */}
      <div className="absolute inset-0 flex flex-col" style={{ opacity: opacities[1], pointerEvents: opacities[1] > 0 ? "auto" : "none" }}>
        <div className="pt-6 px-6 max-w-lg mx-auto w-full flex flex-col">
          {/* Image */}
          <div className="flex justify-center mb-2 mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LESSON_IMAGE} alt="" className="max-h-[140px] w-auto object-contain rounded-2xl shadow-md border-2 border-white" />
          </div>

          {/* Passage */}
          <div className="mb-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-2.5">
              <button className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
              <p className="text-base leading-relaxed font-semibold text-gray-800" style={{ lineHeight: "1.7" }}>
                &ldquo;Sam found a tiny kitten under the porch. The kitten was gray with white paws. Sam named her Mittens.&rdquo;
              </p>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-lg font-bold text-gray-900 text-center mb-2">What color was the kitten?</h2>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {[true, true, false, true, null].map((d, i) => (
              <div key={i} className={`rounded-full ${
                d === true ? "bg-emerald-500 w-2 h-2"
                  : d === false ? "bg-red-400 w-2 h-2"
                  : "bg-indigo-500 w-3 h-3"
              }`} />
            ))}
          </div>

          {/* 2x2 answer grid */}
          <div className="grid grid-cols-2 gap-2">
            {["All white", "Gray with white paws", "Black with spots", "Orange and fluffy"].map((choice, i) => {
              const isCorrect = choice === "Gray with white paws";
              const selecting = showSelecting && !showFeedback && isCorrect;
              const answered = showFeedback;

              let bg = CHOICE_BG[i];
              let textColor = "";
              let extra = "";
              if (selecting) {
                extra = "ring-2 ring-offset-2 ring-indigo-500 scale-[0.95]";
              } else if (answered && isCorrect) {
                bg = "bg-emerald-500 border-emerald-600";
                textColor = "text-white";
                extra = "scale-[1.03]";
              } else if (answered) {
                extra = "opacity-40";
              }

              return (
                <div key={i} className={`flex items-center justify-center px-2 py-2.5 rounded-2xl border-2 min-h-[48px] ${bg} ${textColor} ${extra}`}
                  style={{ transition: "all 0.3s" }}>
                  <div className="flex items-center gap-1.5">
                    {answered && isCorrect && (
                      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-sm font-bold text-center ${textColor}`}>{choice}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Correct banner — always reserving space to prevent layout jump */}
          <div className="mt-3 text-center" style={{ opacity: showFeedback ? 1 : 0 }}>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border-2 border-emerald-300 px-4 py-2 rounded-2xl"
              style={{ opacity: anim(elapsed, SCREENS[1].start + 3500, 300), transform: `translateY(${(1 - anim(elapsed, SCREENS[1].start + 3500, 300)) * 8}px)` }}>
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-base font-extrabold text-emerald-700">Correct!</span>
              <span className="text-xs font-bold text-orange-500">+3</span>
              <Carrot className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCREEN 3: Completion ═══ */}
      <div className="absolute inset-0 flex flex-col items-center pt-16" style={{ opacity: opacities[2], pointerEvents: opacities[2] > 0 ? "auto" : "none" }}>
        {opacities[2] > 0 && <Confetti />}
        <div className="text-center space-y-5 px-6 relative z-10">
          <div style={{ opacity: compFade, transform: `scale(${0.5 + compFade * 0.5})` }}>
            <SparklesIcon />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900" style={{ opacity: compFade, transform: `translateY(${(1 - compFade) * 10}px)` }}>
            Lesson Complete!
          </h2>
          <div className="inline-flex items-center gap-2 bg-orange-50 border-2 border-orange-200 px-5 py-2.5 rounded-2xl"
            style={{ opacity: compCarrotFade, transform: `translateY(${(1 - compCarrotFade) * 10}px)` }}>
            <Carrot className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
            <span className="text-lg font-extrabold text-orange-600">+15 carrots earned</span>
          </div>
          <div className="flex items-center justify-center gap-2" style={{ opacity: compStreakFade, transform: `translateY(${(1 - compStreakFade) * 10}px)` }}>
            <FlameIcon size={24} />
            <span className="text-lg font-bold text-zinc-700">{STREAK} day streak!</span>
          </div>
        </div>
      </div>

      {/* ═══ SCREEN 4: Shop ═══ */}
      <div className="absolute inset-0 flex flex-col" style={{ opacity: opacities[3], pointerEvents: opacities[3] > 0 ? "auto" : "none" }}>
        <div className="pt-8 px-6 max-w-xl mx-auto w-full flex flex-col gap-4">
          {/* Carrot balance header */}
          <div className="flex items-center justify-between" style={{ opacity: shopHeaderFade, transform: `translateY(${(1 - shopHeaderFade) * 12}px)` }}>
            <h1 className="text-xl font-bold text-zinc-800">Shop</h1>
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
              <Carrot className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              <span className="text-sm font-bold text-orange-600">{CARROTS}</span>
            </div>
          </div>

          {/* Mystery box */}
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-5 text-white text-center relative overflow-hidden"
            style={{ opacity: shopBoxFade, transform: `translateY(${(1 - shopBoxFade) * 12}px)` }}>
            <div className="flex justify-center mb-2" style={{ animation: "float 3s ease-in-out infinite" }}>
              <Gift className="w-10 h-10 text-white" strokeWidth={1.8} />
            </div>
            <p className="text-lg font-extrabold text-white!">Mystery Box</p>
            <p className="text-sm text-indigo-200! mt-0.5">50 carrots &middot; Tap to open!</p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2" style={{ opacity: shopGridFade }}>
            {SHOP_TABS.map((t, i) => (
              <span key={t.label} className={`px-3 py-1 rounded-full text-xs font-bold ${
                i === shopTabIdx ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>{t.label}</span>
            ))}
          </div>

          {/* 3x2 item grid */}
          <div className="grid grid-cols-3 gap-2.5" style={{ opacity: shopItemsFade, transform: `translateY(${(1 - shopItemsFade) * 10}px)` }}>
            {shopTab.items.map((item) => {
              const Icon = item.icon;
              return (
              <div key={item.name} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 flex flex-col items-center">
                <Icon className={`w-7 h-7 mb-1 ${item.color}`} strokeWidth={1.8} />
                <p className="text-xs font-bold text-zinc-700">{item.name}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Carrot className="w-3 h-3 text-orange-500" strokeWidth={1.5} />
                  <span className="text-xs font-bold text-orange-600">{item.price}</span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SCREEN 5: Leaderboard ═══ */}
      <div className="absolute inset-0 flex flex-col" style={{ opacity: opacities[4], pointerEvents: opacities[4] > 0 ? "auto" : "none" }}>
        <div className="pt-8 px-6 max-w-xl mx-auto w-full flex flex-col gap-4">
          {/* Flame + streak */}
          <div className="flex flex-col items-center gap-1" style={{ opacity: lbFlameFade, transform: `scale(${0.7 + lbFlameFade * 0.3})` }}>
            <div style={{
              transform: `scale(${1 + 0.08 * Math.sin((elapsed - SCREENS[4].start) / 400)})`,
              filter: `drop-shadow(0 0 ${6 + 4 * Math.sin((elapsed - SCREENS[4].start) / 400)}px rgba(245,158,11,0.6))`,
            }}>
              <FlameIcon size={48} />
            </div>
            <span className="text-2xl font-extrabold text-zinc-800">{STREAK} Day Streak!</span>
            <p className="text-sm text-zinc-500">Keep reading to grow your streak</p>
          </div>

          {/* Rank badge */}
          <div className="flex items-center justify-center" style={{ opacity: lbBadgeFade, transform: `translateY(${(1 - lbBadgeFade) * 10}px)` }}>
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-5 py-2 rounded-full text-sm font-bold">
              Your Rank: #4
            </div>
          </div>

          {/* Leaderboard rows */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {LEADERBOARD.map((row, i) => {
              const rowFade = anim(elapsed, SCREENS[4].start + 500 + i * 150, 400);
              return (
                <div key={row.rank}
                  className={`flex items-center px-4 py-2.5 ${
                    row.isYou ? "bg-indigo-50 border-l-4 border-indigo-500" : i > 0 ? "border-t border-zinc-100" : ""
                  }`}
                  style={{ opacity: rowFade, transform: `translateX(${(1 - rowFade) * 20}px)` }}
                >
                  {/* Rank icon */}
                  <div className="w-8 flex justify-center">
                    {row.rank === 1 ? <CrownIcon /> :
                     row.rank === 2 ? <MedalIcon color="#94a3b8" /> :
                     row.rank === 3 ? <MedalIcon color="#d97706" /> :
                     <span className="text-sm font-bold text-zinc-400">#{row.rank}</span>}
                  </div>
                  {/* Name */}
                  <span className={`ml-2.5 text-sm font-bold flex-1 ${row.isYou ? "text-indigo-700" : "text-zinc-700"}`}>
                    {row.name} {row.isYou && <span className="text-xs font-medium text-indigo-400">(You)</span>}
                  </span>
                  {/* Carrots */}
                  <div className="flex items-center gap-1">
                    <Carrot className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
                    <span className="text-sm font-bold text-orange-600 tabular-nums">{row.carrots}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CSS Keyframes ─── */}
      <style>{`
        @keyframes confetti-fall-0 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(40px) rotate(720deg)} }
        @keyframes confetti-fall-1 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(-50px) rotate(540deg)} }
        @keyframes confetti-fall-2 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(20px) rotate(900deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}
