"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * MagicTrick — self-contained port of the Claude Design `magic-trick.jsx` component.
 *
 * The source registered a global `MagicTrick` that rendered the Readee bunny
 * mascot in the "magician" outfit (`<Bunny outfitId="magician" />`) under an
 * overlay SVG, then played a single 7s routine ~1.5s after mount:
 *   wand waggle -> sparkle burst -> top hat tips forward -> a carrot pops out
 *   and floats up with stars -> confetti "ta-da" wink -> settle.
 * The idle breathing / blink rig keeps running underneath the whole time.
 *
 * This is that exact scene, inlined as pure JSX + scoped CSS. The magician
 * bunny (base anatomy + cape + tux + top hat) is inline SVG; the source used a
 * runtime DOM-tag hack to find the hat group, but here the hat is tagged
 * directly with `mt-hat`, so no querySelector plumbing is needed.
 *
 * Everything is pure inline SVG (no external assets). Every CSS class and
 * @keyframes name is prefixed `mt-` / `mt…` so it cannot collide with the app's
 * existing `bn-*` (bunny mascot), `rw-*` (RoboWalk), `rx2-*`, `kwf-*`, or
 * `readee*` styles — the source's `bn-*` anatomy classes and `mg-*` trick
 * classes were all renamed to `mt-*` here.
 *
 * Design intent: ~220×147, but the stage fills its container width and keeps a
 * 240/260 aspect ratio; the SVG scales to the stage.
 */

const LOOP_S = 7;
const DELAY_MS = 1500;

// [translateX, translateY, originX, originY, fill]
const STARS: Array<[string, string, number, number, string]> = [
  ["-34px", "-20px", 96, 70, "#ffd14a"],
  ["36px", "-16px", 148, 66, "#8b5cf6"],
  ["-20px", "-38px", 106, 52, "#38bdf8"],
  ["24px", "-40px", 136, 50, "#f43f5e"],
];
const CONFETTI: Array<[string, string, number, number, string]> = [
  ["-46px", "-26px", 84, 120, "#4338ca"],
  ["48px", "-30px", 156, 116, "#f59e0b"],
  ["-30px", "-44px", 96, 100, "#10b981"],
  ["34px", "-46px", 146, 98, "#f43f5e"],
  ["0px", "-52px", 120, 92, "#8b5cf6"],
];

const CSS = `
.mt-stage { position: relative; width: 100%; aspect-ratio: 240 / 260; --loop: ${LOOP_S}s; }
.mt-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.mt-prop { transform-box: view-box; opacity: 0; }

/* excited lean-in on a wrapper — idle breathing keeps running untouched */
.mt-lean { width: 100%; height: 100%; transform-origin: 50% 88%; }
.mt-play .mt-lean { animation: mtBody var(--loop) ease-in-out 1; }
@keyframes mtBody {
  0%,10% { transform: rotate(0) translateY(0); }
  16%,26% { transform: rotate(-2.5deg) translateY(0); }
  32% { transform: rotate(1.5deg) translateY(1px); }
  40%,62% { transform: rotate(0) translateY(-3px); }
  70% { transform: rotate(2deg) translateY(-1px); }
  80% { transform: rotate(-1.5deg) translateY(-3px); }
  92%,100% { transform: rotate(0) translateY(0); }
}

/* wand: rises, waggles twice, flicks, drops away */
.mt-play .mt-wand { animation: mtWand var(--loop) ease-in-out 1; }
@keyframes mtWand {
  0%,6% { opacity: 0; transform: translate(-16px,34px) rotate(-30deg); }
  12% { opacity: 1; transform: translate(0,0) rotate(0); }
  17% { opacity: 1; transform: translate(2px,-4px) rotate(14deg); }
  22% { opacity: 1; transform: translate(-2px,0) rotate(-12deg); }
  27% { opacity: 1; transform: translate(2px,-4px) rotate(14deg); }
  32% { opacity: 1; transform: translate(0,-8px) rotate(-24deg); }
  38%,44% { opacity: 1; transform: translate(-4px,6px) rotate(-6deg); }
  52% { opacity: 0; transform: translate(-14px,30px) rotate(-28deg); }
  100% { opacity: 0; transform: translate(-14px,30px) rotate(-28deg); }
}

/* wand-tip sparkle burst at the flick */
.mt-play .mt-zap { animation: mtZap var(--loop) ease-out 1; }
@keyframes mtZap { 0%,30% { opacity: 0; transform: scale(.2) rotate(0); } 34% { opacity: 1; transform: scale(1.2) rotate(20deg); } 42% { opacity: 0; transform: scale(1.7) rotate(45deg); } 100% { opacity: 0; } }

/* hat tips forward off the head during the reveal */
.mt-stage .mt-hat { transform-box: fill-box; transform-origin: 20% 90%; }
.mt-stage.mt-play .mt-hat { animation: mtHat var(--loop) ease-in-out 1; }
@keyframes mtHat {
  0%,34% { transform: rotate(0) translate(0,0); }
  42%,64% { transform: rotate(-38deg) translate(-26px,-14px); }
  72%,100% { transform: rotate(0) translate(0,0); }
}

/* carrot pops out of the tipped hat, floats up, vanishes */
.mt-play .mt-carrot { animation: mtCarrot var(--loop) cubic-bezier(0.34,1.3,0.64,1) 1; }
@keyframes mtCarrot {
  0%,40% { opacity: 0; transform: translate(0,16px) rotate(-20deg) scale(.3); }
  48% { opacity: 1; transform: translate(0,-26px) rotate(8deg) scale(1.1); }
  56% { opacity: 1; transform: translate(0,-38px) rotate(-6deg) scale(1); }
  62% { opacity: 1; transform: translate(0,-46px) rotate(4deg) scale(1); }
  70% { opacity: 0; transform: translate(0,-64px) rotate(0) scale(.5); }
  100% { opacity: 0; }
}
.mt-play .mt-star { animation: mtStar var(--loop) ease-out 1; }
@keyframes mtStar {
  0%,44% { opacity: 0; transform: translate(0,0) scale(.3) rotate(0); }
  52% { opacity: 1; transform: translate(var(--mx), var(--my)) scale(1) rotate(80deg); }
  66% { opacity: 0; transform: translate(calc(var(--mx) * 1.7), calc(var(--my) * 1.7)) scale(.5) rotate(200deg); }
  100% { opacity: 0; }
}
/* ta-da confetti wink at the end */
.mt-play .mt-conf { animation: mtConf var(--loop) ease-out 1; }
@keyframes mtConf {
  0%,72% { opacity: 0; transform: translate(0,0) rotate(0) scale(.4); }
  79% { opacity: 1; transform: translate(var(--cx), var(--cy)) rotate(150deg) scale(1); }
  92% { opacity: 0; transform: translate(calc(var(--cx) * 1.5), calc(var(--cy) * 1.5 + 26px)) rotate(360deg) scale(.7); }
  100% { opacity: 0; }
}

/* ── base bunny anatomy (renamed from bn-* to mt-*) ── */
.mt-bn { display: block; overflow: visible; width: 100%; height: 100%; }

/* soft ground shadow */
.mt-ground { transform-box: fill-box; transform-origin: center; animation: mtGround 3.4s ease-in-out infinite; }
@keyframes mtGround { 0%,100% { transform: scaleX(1); opacity: .18; } 50% { transform: scaleX(.92); opacity: .22; } }

/* gentle breathing */
.mt-body-grp { transform-origin: 120px 220px; animation: mtBreathe 3.4s ease-in-out infinite; }
@keyframes mtBreathe { 0%,100% { transform: scaleY(1) translateY(0); } 50% { transform: scaleY(.985) translateY(.5px); } }

/* head bob */
.mt-head-grp { transform-origin: 120px 156px; animation: mtHeadBob 3.4s ease-in-out infinite; }
@keyframes mtHeadBob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-1.5px) rotate(.4deg); } }

/* blink */
.mt-eye { transform-box: fill-box; transform-origin: center; animation: mtBlink 4.6s ease-in-out infinite; }
@keyframes mtBlink {
  0%, 92%, 100% { transform: scaleY(1); }
  94%           { transform: scaleY(.08); }
  96%           { transform: scaleY(1); }
}

/* ear twitch (idle) */
.mt-ear-l { transform-origin: 50% 100%; transform-box: fill-box; animation: mtEarTwitch 6.2s ease-in-out infinite; }
@keyframes mtEarTwitch {
  0%, 85%, 100% { transform: rotate(-6deg); }
  88%           { transform: rotate(-14deg); }
  91%           { transform: rotate(-4deg); }
  94%           { transform: rotate(-6deg); }
}
.mt-ear-r { transform-origin: 50% 100%; transform-box: fill-box; transform: rotate(6deg); }

@media (prefers-reduced-motion: reduce) { .mt-stage * { animation: none !important; } .mt-prop { opacity: 0; } }
`;

export default function MagicTrick({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // breathe → one trick → breathe (no loop): kick off once after the delay.
  useEffect(() => {
    const t = setTimeout(() => setPlaying(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // stop once the body lean-in animation (mtBody) finishes.
  useEffect(() => {
    if (!playing) return;
    const root = stageRef.current;
    if (!root) return;
    const done = (e: AnimationEvent) => {
      if (e.animationName === "mtBody") setPlaying(false);
    };
    root.addEventListener("animationend", done);
    return () => root.removeEventListener("animationend", done);
  }, [playing]);

  const stageStyle = { ...style, ["--loop"]: `${LOOP_S}s` } as React.CSSProperties;
  const stageClass = `mt-stage${playing ? " mt-play" : ""}${className ? ` ${className}` : ""}`;

  return (
    <div ref={stageRef} className={stageClass} style={stageStyle}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{CSS}</style>

      {/* Magician bunny — idle rig runs underneath the trick */}
      <div className="mt-lean">
        <svg className="mt-bn" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
          {/* Ground shadow */}
          <ellipse className="mt-ground" cx="120" cy="238" rx="62" ry="6" fill="#1a1a1a" />

          {/* BODY GROUP — cape (behind), body silhouette, tux overlay, feet */}
          <g className="mt-body-grp">
            {/* Magician cape (held) — short black cape with red lining */}
            <path
              d="M 76 148 Q 96 162 144 162 Q 164 162 164 148 L 178 230 Q 120 240 62 230 Z"
              fill="#1f1c2a"
              stroke="#1a1a1a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M 80 156 Q 120 166 160 156 L 162 174 Q 120 180 78 174 Z" fill="#c43d2a" />

            {/* Body silhouette */}
            <path
              d="M 76 168
                 C 76 148, 92 140, 120 140
                 C 148 140, 164 148, 164 168
                 C 168 196, 158 218, 142 220
                 L 98 220
                 C 82 218, 72 196, 76 168 Z"
              fill="#fafafa"
              stroke="#1a1a1a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Belly highlight */}
            <ellipse cx="120" cy="188" rx="22" ry="20" fill="#efece8" />

            {/* Magician outfit — body overlay (black tux + shirt + bow tie) */}
            <path
              d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
              fill="#1f1c2a"
              stroke="#1a1a1a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* white shirt panel */}
            <path
              d="M 108 148 L 120 174 L 132 148 L 132 210 L 120 218 L 108 210 Z"
              fill="#fafafa"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* red bow tie */}
            <path
              d="M 110 150 L 100 144 L 100 158 L 110 152 L 110 158 L 130 158 L 130 152 L 140 158 L 140 144 L 130 150 Z"
              fill="#c43d2a"
              stroke="#1a1a1a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="117" y="148" width="6" height="11" fill="#a02f1f" stroke="#1a1a1a" strokeWidth="1.8" />
            {/* buttons */}
            <circle cx="120" cy="186" r="1.8" fill="#1a1a1a" />
            <circle cx="120" cy="200" r="1.8" fill="#1a1a1a" />

            {/* Feet */}
            <ellipse cx="104" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
            <ellipse cx="136" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
            {/* Toe-bean accents */}
            <circle cx="104" cy="222" r="2" fill="#f8b8d0" />
            <circle cx="136" cy="222" r="2" fill="#f8b8d0" />
          </g>

          {/* HEAD GROUP — ears, head, face, top-hat overlay */}
          <g className="mt-head-grp">
            {/* Ears */}
            <g className="mt-ear-l">
              <path
                d="M 96 22 C 88 22, 84 40, 88 90 L 110 90 C 112 40, 110 22, 102 22 Z"
                fill="#fafafa"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M 98 32 C 94 36, 92 52, 95 84 L 105 84 C 106 52, 104 36, 100 32 Z" fill="#f8b8d0" />
            </g>
            <g className="mt-ear-r">
              <path
                d="M 138 22 C 130 22, 128 40, 130 90 L 152 90 C 156 40, 152 22, 144 22 Z"
                fill="#fafafa"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M 140 32 C 136 36, 134 52, 135 84 L 145 84 C 148 52, 146 36, 142 32 Z" fill="#f8b8d0" />
            </g>

            {/* Head silhouette */}
            <ellipse cx="120" cy="120" rx="52" ry="44" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />

            {/* Cheeks */}
            <circle cx="92" cy="130" r="6" fill="#f8b8d0" opacity=".75" />
            <circle cx="148" cy="130" r="6" fill="#f8b8d0" opacity=".75" />

            {/* Eyes */}
            <ellipse className="mt-eye" cx="104" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
            <ellipse className="mt-eye" cx="136" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
            {/* Eye shine */}
            <circle cx="105.5" cy="116" r="1.3" fill="#fff" />
            <circle cx="137.5" cy="116" r="1.3" fill="#fff" />

            {/* Nose */}
            <path
              d="M 116 128 Q 120 134, 124 128 Q 120 132, 116 128 Z"
              fill="#ee5b85"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Mouth */}
            <path
              d="M 120 132 L 120 136"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mt-mouth-smile"
              d="M 114 138 Q 120 144, 126 138"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mt-mouth-frown"
              d="M 114 142 Q 120 136, 126 142"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0 }}
            />

            {/* Magician outfit — head overlay (top hat), tagged mt-hat so it tips */}
            <g className="mt-hat">
              <ellipse cx="120" cy="80" rx="34" ry="6" fill="#1f1c2a" stroke="#1a1a1a" strokeWidth="3" />
              <rect x="92" y="32" width="56" height="48" fill="#1f1c2a" stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" />
              {/* red band */}
              <rect x="92" y="68" width="56" height="8" fill="#c43d2a" stroke="#1a1a1a" strokeWidth="2.5" />
              {/* rim shine */}
              <line x1="96" y1="36" x2="96" y2="60" stroke="#ffffff" strokeWidth="2.5" opacity=".4" strokeLinecap="round" />
              {/* tiny star sparkle (magic) */}
              <path
                d="M 158 50 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"
                fill="#ffd14a"
                stroke="#1a1a1a"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Trick overlay props */}
      <svg className="mt-overlay" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
        {/* wand in right paw */}
        <g className="mt-prop mt-wand" style={{ transformOrigin: "176px 150px" }}>
          <line x1="168" y1="166" x2="192" y2="118" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
          <line x1="186" y1="130" x2="192" y2="118" stroke="#fafafa" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="170" cy="164" rx="11" ry="9" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        </g>
        {/* wand-tip sparkle burst */}
        <g className="mt-prop mt-zap" style={{ transformOrigin: "194px 112px" }}>
          <path
            d="M 194 98 L 197 108 L 207 111 L 197 114 L 194 124 L 191 114 L 181 111 L 191 108 Z"
            fill="#ffd14a"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="207" cy="99" r="3" fill="#8b5cf6" />
          <circle cx="182" cy="122" r="2.5" fill="#38bdf8" />
        </g>
        {/* carrot reveal above the head */}
        <g className="mt-prop mt-carrot" style={{ transformOrigin: "120px 66px" }}>
          <path
            d="M 120 52 L 130 55 L 124 92 Q 120 97 116 92 L 110 55 Z"
            fill="#f59e0b"
            stroke="#1a1a1a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M 115 64 L 125 66 M 116 74 L 124 76" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" opacity=".45" />
          <path d="M 120 52 Q 112 40 104 39 Q 109 49 114 52 Z" fill="#10b981" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 121 52 Q 128 39 137 38 Q 133 49 126 52 Z" fill="#10b981" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
        </g>
        {/* sprinkle of stars trailing the carrot */}
        {STARS.map(([mx, my, x, y, fill]) => (
          <g
            key={`s-${x}-${y}`}
            className="mt-prop mt-star"
            style={{ ["--mx"]: mx, ["--my"]: my, transformOrigin: `${x}px ${y}px` } as React.CSSProperties}
          >
            <path
              d={`M ${x} ${y - 6} L ${x + 1.8} ${y - 1.8} L ${x + 6} ${y} L ${x + 1.8} ${y + 1.8} L ${x} ${y + 6} L ${x - 1.8} ${y + 1.8} L ${x - 6} ${y} L ${x - 1.8} ${y - 1.8} Z`}
              fill={fill}
              stroke="#1a1a1a"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {/* ta-da confetti */}
        {CONFETTI.map(([cx, cy, x, y, fill]) => (
          <g
            key={`c-${x}-${y}`}
            className="mt-prop mt-conf"
            style={{ ["--cx"]: cx, ["--cy"]: cy, transformOrigin: `${x}px ${y}px` } as React.CSSProperties}
          >
            <rect x={x - 4} y={y - 4} width="8" height="8" rx="2" fill={fill} />
          </g>
        ))}
      </svg>
    </div>
  );
}
