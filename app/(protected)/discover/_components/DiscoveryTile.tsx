import type { ReactElement } from "react";

/**
 * Discovery category tile — animated SVG per category. Sourced from
 * a Claude Design handoff bundle (readee-discover-tiles, May 2026).
 * Animations run on hover only (matches the design default), with a
 * 2.4s base loop.
 *
 * 512×512 viewBox, scales to whatever container width × height. The
 * parent in app/discover/page.tsx renders an aspect-square box, so
 * the SVG renders square.
 *
 * Class names per category are uniquely prefixed (sci-, hist-, nat-,
 * inv-, sp-, st-, mt-) so the keyframes can sit in one shared style
 * block without collisions. Hover-gated animations use the `:hover`
 * selector on `.discovery-tile` — that class is added to the wrapper.
 */
export type DiscoveryCategory =
  | "science"
  | "history"
  | "nature"
  | "inventions"
  | "sports"
  | "stories"
  | "math_in_real_life";

const STYLES = `
.discovery-tile { --anim-base: 2.4s; }
.discovery-tile svg { width: 100%; height: 100%; display: block; }
/* animation-play-state: paused only affects elements that already
   have an animation set; the universal selector is the simplest way
   to pause every tile's animations without enumerating each class. */
/* !important is needed: the per-animation rules use the animation
   shorthand, which sets play-state=running implicitly and beats a
   plain longhand override on a lower-specificity selector. */
.discovery-tile * { animation-play-state: paused !important; }
.discovery-tile:hover *,
.group:hover .discovery-tile * { animation-play-state: running !important; }

/* SCIENCE */
.discovery-tile .sci-bubble { transform-origin: center; transform-box: fill-box; opacity: 0; }
.discovery-tile .sci-b1 { animation: sciB1 var(--anim-base) ease-in-out infinite; }
.discovery-tile .sci-b2 { animation: sciB2 var(--anim-base) ease-in-out infinite; animation-delay: -.8s; }
.discovery-tile .sci-b3 { animation: sciB3 var(--anim-base) ease-in-out infinite; animation-delay: -1.5s; }
.discovery-tile .sci-b4 { animation: sciB1 var(--anim-base) ease-in-out infinite; animation-delay: -1.9s; }
.discovery-tile .sci-glow-anim { transform-origin: 256px 320px; animation: sciGlow var(--anim-base) ease-in-out infinite; }
.discovery-tile .sci-liquid    { transform-origin: 256px 360px; animation: sciLiquid var(--anim-base) ease-in-out infinite; }
@keyframes sciB1 { 0% { transform: translate(0px,80px) scale(.6); opacity: 0; } 20% { opacity: 1; } 70% { transform: translate(-6px,-40px) scale(1); opacity: 1; } 85% { transform: translate(-6px,-40px) scale(1.4); opacity: 0; } 100% { transform: translate(0px,-50px) scale(.4); opacity: 0; } }
@keyframes sciB2 { 0% { transform: translate(0px,80px) scale(.5); opacity: 0; } 25% { opacity: 1; } 75% { transform: translate(8px,-50px) scale(.9); opacity: 1; } 90% { transform: translate(8px,-50px) scale(1.3); opacity: 0; } 100% { opacity: 0; } }
@keyframes sciB3 { 0% { transform: translate(0px,80px) scale(.4); opacity: 0; } 30% { opacity: 1; } 70% { transform: translate(-2px,-30px) scale(.7); opacity: 1; } 85% { transform: translate(-2px,-30px) scale(1.1); opacity: 0; } 100% { opacity: 0; } }
@keyframes sciGlow { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.12); } }
@keyframes sciLiquid { 0%,100% { transform: translateY(0px) scaleY(1); } 50% { transform: translateY(-2px) scaleY(1.02); } }

/* HISTORY */
.discovery-tile .hist-grain { transform-origin: center; transform-box: fill-box; opacity: 0; }
.discovery-tile .hist-g1 { animation: histGrain var(--anim-base) ease-in-out infinite; }
.discovery-tile .hist-g2 { animation: histGrain var(--anim-base) ease-in-out infinite; animation-delay: -0.8s; }
.discovery-tile .hist-g3 { animation: histGrain var(--anim-base) ease-in-out infinite; animation-delay: -1.6s; }
.discovery-tile .hist-scroll-curl { transform-origin: 386px 420px; animation: histScroll var(--anim-base) ease-in-out infinite; }
@keyframes histGrain { 0% { opacity: 0; transform: translateY(0px); } 20% { opacity: 1; } 80% { opacity: 1; transform: translateY(68px); } 100% { opacity: 0; transform: translateY(76px); } }
@keyframes histScroll { 0%,100% { transform: rotate(0deg) translateY(0px); } 50% { transform: rotate(2deg) translateY(-2px); } }

/* NATURE */
.discovery-tile .nat-bird      { transform-origin: 358px 282px; animation: natBird calc(var(--anim-base) * 2.5) ease-in-out infinite; }
.discovery-tile .nat-bird-flip { transform-origin: 358px 282px; animation: natBirdFlip calc(var(--anim-base) * 2.5) steps(1, end) infinite; }
.discovery-tile .nat-wing      { transform-origin: -3px -3px; transform-box: fill-box; animation: natWing 0.32s ease-in-out infinite; }
.discovery-tile .nat-canopy    { transform-origin: 256px 200px; animation: natCanopy var(--anim-base) ease-in-out infinite; }
.discovery-tile .nat-leaf-1    { animation: natLeaf1 var(--anim-base) ease-in-out infinite; }
.discovery-tile .nat-leaf-2    { animation: natLeaf2 var(--anim-base) ease-in-out infinite; animation-delay: -0.7s; }
.discovery-tile .nat-leaf-3    { animation: natLeaf3 var(--anim-base) ease-in-out infinite; animation-delay: -1.4s; }
@keyframes natBird { 0% { transform: translate(0,0); } 8% { transform: translate(-8px,-20px); } 24% { transform: translate(-120px,-130px); } 42% { transform: translate(-220px,-110px); } 50% { transform: translate(-220px,-110px); } 62% { transform: translate(-110px,-170px); } 78% { transform: translate(40px,-130px); } 85% { transform: translate(40px,-120px); } 92% { transform: translate(18px,-40px); } 100% { transform: translate(0,0); } }
@keyframes natBirdFlip { 0%,49.99% { transform: scaleX(1); } 50%,84.99% { transform: scaleX(-1); } 85%,100% { transform: scaleX(1); } }
@keyframes natWing { 0%,100% { transform: scaleY(1) skewX(0deg); } 50% { transform: scaleY(.55) skewX(-12deg); } }
@keyframes natCanopy { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(1deg); } }
@keyframes natLeaf1 { 0% { transform: translate(0,0) rotate(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(20px,180px) rotate(120deg); opacity: 0; } }
@keyframes natLeaf2 { 0% { transform: translate(0,0) rotate(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(-30px,200px) rotate(-140deg); opacity: 0; } }
@keyframes natLeaf3 { 0% { transform: translate(0,0) rotate(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(10px,160px) rotate(90deg); opacity: 0; } }

/* INVENTIONS */
.discovery-tile .inv-glow-anim { transform-origin: 256px 230px; animation: invGlow var(--anim-base) ease-in-out infinite; }
.discovery-tile .inv-bulb-fill { animation: invBulbFill var(--anim-base) ease-in-out infinite; }
.discovery-tile .inv-gear-a    { transform-origin: 145px 350px; animation: invGearA calc(var(--anim-base) * 1.67) linear infinite; }
.discovery-tile .inv-gear-b    { transform-origin: 370px 360px; animation: invGearB calc(var(--anim-base) * 1.67) linear infinite; }
.discovery-tile .inv-spark     { transform-origin: center; transform-box: fill-box; opacity: 0; }
.discovery-tile .inv-s1 { animation: invS1 var(--anim-base) ease-in-out infinite; }
.discovery-tile .inv-s2 { animation: invS1 var(--anim-base) ease-in-out infinite; animation-delay: -0.8s; }
.discovery-tile .inv-s3 { animation: invS1 var(--anim-base) ease-in-out infinite; animation-delay: -1.6s; }
@keyframes invGlow { 0%,100% { opacity: .5; transform: scale(.95); } 50% { opacity: 1; transform: scale(1.18); } }
@keyframes invBulbFill { 0%,100% { fill: #ffe157; } 50% { fill: #fff39a; } }
@keyframes invGearA { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes invGearB { from { transform: rotate(0); } to { transform: rotate(-360deg); } }
@keyframes invS1 { 0%,50%,100% { opacity: 0; transform: scale(.5); } 20%,30% { opacity: 1; transform: scale(1.2); } }

/* SPORTS */
.discovery-tile .sp-ball-wrap { transform-origin: 256px 290px; animation: spBall var(--anim-base) ease-in-out infinite; }
.discovery-tile .sp-shadow    { transform-origin: 256px 432px; transform-box: fill-box; animation: spShadow var(--anim-base) ease-in-out infinite; }
@keyframes spBall { 0%,100% { transform: translate(0,0) scale(1,1); } 20% { transform: translate(0,120px) scale(1.12,.82); } 35% { transform: translate(0,-10px) scale(.96,1.05); } 60% { transform: translate(0,120px) scale(1.12,.82); } 80% { transform: translate(0,0) scale(.97,1.04); } }
@keyframes spShadow { 0%,100% { transform: scaleX(.7); opacity: .2; } 20%,60% { transform: scaleX(1.3); opacity: .45; } }

/* STORIES */
.discovery-tile .st-glow   { transform-origin: 256px 360px; transform-box: fill-box; animation: stGlow var(--anim-base) ease-in-out infinite; }
.discovery-tile .st-spark  { transform-origin: center; transform-box: fill-box; opacity: 0; }
.discovery-tile .st-s1     { animation: stSpark var(--anim-base) ease-in-out infinite; }
.discovery-tile .st-s2     { animation: stSpark var(--anim-base) ease-in-out infinite; animation-delay: -0.8s; }
.discovery-tile .st-s3     { animation: stSpark var(--anim-base) ease-in-out infinite; animation-delay: -1.6s; }
.discovery-tile .st-ribbon { transform-origin: 256px 320px; transform-box: fill-box; animation: stRibbon var(--anim-base) ease-in-out infinite; }
.discovery-tile .st-crown  { transform-origin: 256px 220px; transform-box: fill-box; animation: stCrown var(--anim-base) ease-in-out infinite; }
@keyframes stGlow   { 0%,100% { opacity: .45; transform: scale(1); } 50% { opacity: .85; transform: scale(1.08); } }
@keyframes stSpark  { 0% { opacity: 0; transform: translateY(0) scale(.5) rotate(0); } 20% { opacity: 1; transform: translateY(-30px) scale(1) rotate(60deg); } 60% { opacity: 1; transform: translateY(-110px) scale(.95) rotate(180deg); } 85% { opacity: 0; transform: translateY(-140px) scale(.6) rotate(240deg); } 100% { opacity: 0; } }
@keyframes stRibbon { 0%,100% { transform: skewX(0); } 50% { transform: skewX(-7deg); } }
@keyframes stCrown  { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-5px) rotate(2deg); } }

/* MATH */
.discovery-tile .mt-pizza { transform-origin: 200px 360px; animation: mtPizza var(--anim-base) ease-in-out infinite; }
.discovery-tile .mt-d     { opacity: 0; transform-origin: center; transform-box: fill-box; }
.discovery-tile .mt-d1    { animation: mtD1 var(--anim-base) ease-in-out infinite; }
.discovery-tile .mt-d2    { animation: mtD2 var(--anim-base) ease-in-out infinite; }
.discovery-tile .mt-d3    { animation: mtD3 var(--anim-base) ease-in-out infinite; }
@keyframes mtPizza { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes mtD1 { 0% { opacity: 0; transform: translateY(10px) scale(.6); } 10% { opacity: 1; transform: translateY(0) scale(1.1); } 20%,80% { opacity: 1; transform: translateY(0) scale(1); } 95%,100% { opacity: 0; transform: translateY(-8px) scale(.9); } }
@keyframes mtD2 { 0%,15% { opacity: 0; transform: translateY(10px) scale(.6); } 25% { opacity: 1; transform: translateY(0) scale(1.1); } 35%,80% { opacity: 1; transform: translateY(0) scale(1); } 95%,100% { opacity: 0; transform: translateY(-8px) scale(.9); } }
@keyframes mtD3 { 0%,30% { opacity: 0; transform: translateY(10px) scale(.6); } 40% { opacity: 1; transform: translateY(0) scale(1.1); } 50%,80% { opacity: 1; transform: translateY(0) scale(1); } 95%,100% { opacity: 0; transform: translateY(-8px) scale(.9); } }
`;

function ScienceTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="sci-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#dff0ff" /><stop offset="100%" stopColor="#a9d4f5" /></radialGradient>
        <radialGradient id="sci-glow" cx="50%" cy="60%" r="50%"><stop offset="0%" stopColor="#7df2c9" stopOpacity="0.7" /><stop offset="100%" stopColor="#7df2c9" stopOpacity="0" /></radialGradient>
        <clipPath id="sci-tube-inner"><path d="M210 180 L210 380 a46 46 0 0 0 92 0 L302 180 Z" /></clipPath>
      </defs>
      <rect width="512" height="512" fill="url(#sci-bg)" />
      <circle data-anim className="sci-glow-anim" cx="256" cy="320" r="140" fill="url(#sci-glow)" />
      <ellipse cx="256" cy="438" rx="80" ry="10" fill="#000" opacity=".15" />
      <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M210 180 L210 380 a46 46 0 0 0 92 0 L302 180" fill="#ffffff" fillOpacity=".55" />
        <g clipPath="url(#sci-tube-inner)"><g data-anim className="sci-liquid"><path d="M196 290 Q230 278 256 290 T326 290 L326 430 L196 430 Z" fill="#3ec28b" /><path d="M196 290 Q230 278 256 290 T326 290" fill="none" stroke="#1a1a1a" strokeWidth="6" /></g></g>
        <rect x="200" y="168" width="112" height="22" rx="6" fill="#ffffff" />
      </g>
      <g clipPath="url(#sci-tube-inner)">
        <g data-anim className="sci-bubble sci-b1"><circle cx="246" cy="350" r="10" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4" /></g>
        <g data-anim className="sci-bubble sci-b2"><circle cx="266" cy="350" r="7" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4" /></g>
        <g data-anim className="sci-bubble sci-b3"><circle cx="256" cy="350" r="5" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5" /></g>
      </g>
      <g data-anim className="sci-bubble sci-b4"><circle cx="256" cy="150" r="9" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4" /></g>
    </svg>
  );
}

function HistoryTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs><radialGradient id="hist-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#fbeed1" /><stop offset="100%" stopColor="#e8c98a" /></radialGradient></defs>
      <rect width="512" height="512" fill="url(#hist-bg)" />
      <ellipse cx="256" cy="450" rx="170" ry="14" fill="#000" opacity=".13" />
      <g data-anim className="hist-scroll-curl" stroke="#1a1a1a" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
        <rect x="340" y="200" width="108" height="220" rx="6" fill="#fff6dc" />
        <ellipse cx="394" cy="200" rx="54" ry="12" fill="#f0dfb5" />
        <ellipse cx="394" cy="420" rx="54" ry="12" fill="#f0dfb5" />
        <line x1="356" y1="232" x2="428" y2="232" strokeWidth="4" />
        <line x1="356" y1="252" x2="422" y2="252" strokeWidth="4" />
        <line x1="356" y1="272" x2="428" y2="272" strokeWidth="4" />
        <line x1="356" y1="294" x2="414" y2="294" strokeWidth="4" />
      </g>
      <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M168 144 L272 144 L226 250 L272 376 L168 376 L214 250 Z" fill="#fff6dc" fillOpacity=".5" />
        <rect x="140" y="122" width="160" height="22" rx="4" fill="#a25b3a" />
        <rect x="140" y="376" width="160" height="22" rx="4" fill="#a25b3a" />
        <line x1="154" y1="144" x2="154" y2="376" />
        <line x1="286" y1="144" x2="286" y2="376" />
      </g>
      <g fill="#d9a85a" stroke="#1a1a1a" strokeWidth="2">
        <g data-anim className="hist-grain hist-g1"><circle cx="220" cy="258" r="3" /></g>
        <g data-anim className="hist-grain hist-g2"><circle cx="218" cy="258" r="2.5" /></g>
        <g data-anim className="hist-grain hist-g3"><circle cx="222" cy="258" r="2.5" /></g>
      </g>
    </svg>
  );
}

function NatureTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs><radialGradient id="nat-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#dcefff" /><stop offset="100%" stopColor="#9cc9ee" /></radialGradient></defs>
      <rect width="512" height="512" fill="url(#nat-bg)" />
      <circle cx="80" cy="100" r="34" fill="#ffe88a" stroke="#1a1a1a" strokeWidth="6" />
      <path d="M0 440 Q256 420 512 440 L512 512 L0 512 Z" fill="#7fcf7a" stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" />
      <g stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 440 q4 -14 10 -4 q-2 -10 10 -4" />
        <path d="M420 440 q4 -14 10 -4 q-2 -10 10 -4" />
      </g>
      <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M220 446 L228 326 Q220 296 248 286 L264 286 Q292 296 284 326 L292 446 Z" fill="#9c6a3f" />
        <path d="M242 370 q8 4 0 16" fill="none" strokeWidth="5" />
        <path d="M268 350 q-8 4 0 16" fill="none" strokeWidth="5" />
        <path d="M286 318 Q330 304 360 290" fill="none" />
        <path d="M226 322 Q198 312 180 304" fill="none" />
      </g>
      <g stroke="#1a1a1a" strokeWidth="5" strokeLinejoin="round" fill="#4eb24a">
        <path data-anim className="nat-leaf-1" d="M170 240 q12 -6 18 4 q-12 6 -18 -4 z" />
        <path data-anim className="nat-leaf-2" d="M310 240 q12 -6 18 4 q-12 6 -18 -4 z" />
        <path data-anim className="nat-leaf-3" d="M250 210 q12 -6 18 4 q-12 6 -18 -4 z" />
      </g>
      <g data-anim className="nat-canopy" stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round">
        <path
          d="M150 220 C 150 150, 200 110, 252 138 C 280 100, 340 110, 360 158 C 410 162, 426 230, 380 254 C 392 296, 332 308, 304 290 C 270 312, 222 310, 198 290 C 152 304, 122 260, 150 220 Z"
          fill="#5db657"
        />
        <ellipse cx="218" cy="180" rx="22" ry="10" fill="#7cc878" stroke="none" opacity=".85" />
        <ellipse cx="312" cy="172" rx="20" ry="9" fill="#7cc878" stroke="none" opacity=".85" />
      </g>
      <g data-anim className="nat-bird">
        <g data-anim className="nat-bird-flip">
          <g stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" transform="translate(358 282)">
            <ellipse cx="0" cy="0" rx="22" ry="17" fill="#ef7a3e" />
            <ellipse cx="-2" cy="3" rx="12" ry="9" fill="#fff1d0" stroke="none" />
            <circle cx="-16" cy="-9" r="12" fill="#ef7a3e" />
            <circle cx="-19" cy="-11" r="2.5" fill="#1a1a1a" stroke="none" />
            <path d="M-28 -8 L-36 -6 L-28 -1 Z" fill="#f2c64a" />
            <path d="M20 -3 L32 -10 L26 4 Z" fill="#c95c25" />
            <g data-anim className="nat-wing"><path d="M-3 -5 Q12 -3 16 9 Q4 12 -5 9 Z" fill="#c95c25" /></g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function InventionsTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="inv-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#ffe2c2" /><stop offset="100%" stopColor="#f5b27a" /></radialGradient>
        <radialGradient id="inv-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff39a" stopOpacity=".9" /><stop offset="100%" stopColor="#fff39a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#inv-bg)" />
      <circle data-anim className="inv-glow-anim" cx="256" cy="230" r="160" fill="url(#inv-glow)" />
      <g stroke="#1a1a1a" strokeWidth="7" strokeLinejoin="round">
        <g data-anim className="inv-gear-a"><g transform="translate(145 350)"><path d="M0 -48 L8 -38 L18 -42 L20 -28 L34 -26 L30 -14 L42 -6 L34 4 L40 18 L26 22 L24 36 L10 30 L0 42 L-10 30 L-24 36 L-26 22 L-40 18 L-34 4 L-42 -6 L-30 -14 L-34 -26 L-20 -28 L-18 -42 L-8 -38 Z" fill="#8a96ad" /><circle r="14" fill="#cdd5e3" /></g></g>
        <g data-anim className="inv-gear-b"><g transform="translate(370 360)"><path d="M0 -38 L6 -30 L14 -32 L16 -22 L26 -20 L24 -10 L32 -4 L26 2 L30 14 L20 18 L18 28 L8 24 L0 32 L-8 24 L-18 28 L-20 18 L-30 14 L-26 2 L-32 -4 L-24 -10 L-26 -20 L-16 -22 L-14 -32 L-6 -30 Z" fill="#8a96ad" /><circle r="11" fill="#cdd5e3" /></g></g>
      </g>
      <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <path data-anim className="inv-bulb-fill" d="M256 110 Q330 110 340 200 Q340 250 300 280 L300 320 L212 320 L212 280 Q172 250 172 200 Q182 110 256 110 Z" fill="#ffe157" />
        <path d="M226 260 q10 -30 30 -30 q20 0 30 30" fill="none" strokeWidth="5" />
        <rect x="212" y="320" width="88" height="20" rx="4" fill="#cdd5e3" />
        <rect x="220" y="340" width="72" height="14" rx="3" fill="#9aa4b8" />
        <rect x="226" y="354" width="60" height="10" rx="3" fill="#9aa4b8" />
        <path d="M240 364 q16 14 32 0" fill="none" />
      </g>
      <g fill="#ffd14a" stroke="#1a1a1a" strokeWidth="3">
        <circle data-anim className="inv-spark inv-s1" cx="170" cy="150" r="6" />
        <circle data-anim className="inv-spark inv-s2" cx="345" cy="135" r="5" />
        <circle data-anim className="inv-spark inv-s3" cx="365" cy="220" r="5" />
      </g>
    </svg>
  );
}

function SportsTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs><radialGradient id="sp-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#ffe6c2" /><stop offset="100%" stopColor="#d9925a" /></radialGradient></defs>
      <rect width="512" height="512" fill="url(#sp-bg)" />
      <ellipse data-anim className="sp-shadow" cx="256" cy="432" rx="64" ry="10" fill="#000" />
      <g data-anim className="sp-ball-wrap">
        <g transform="translate(256 290)">
          <circle r="72" fill="#e8772e" stroke="#1a1a1a" strokeWidth="7" />
          <ellipse cx="-26" cy="-34" rx="22" ry="14" fill="#f4a363" stroke="none" opacity=".85" />
          <line x1="0" y1="-72" x2="0" y2="72" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <path d="M-72 -4 Q0 20 72 -4" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <path d="M-44 -58 Q-66 0 -44 58" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <path d="M44 -58 Q66 0 44 58" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function StoriesTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs><radialGradient id="st-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#ece0fa" /><stop offset="100%" stopColor="#b89eea" /></radialGradient></defs>
      <rect width="512" height="512" fill="url(#st-bg)" />
      <g fill="#fff7c2" stroke="#1a1a1a" strokeWidth="3">
        <circle cx="80" cy="110" r="4" />
        <circle cx="440" cy="100" r="5" />
        <circle cx="60" cy="260" r="3" />
        <circle cx="460" cy="260" r="3" />
      </g>
      <g data-anim className="st-crown">
        <path d="M212 224 L222 196 L240 218 L256 188 L272 218 L290 196 L300 224 Z" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round" />
        <rect x="212" y="224" width="88" height="14" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="6" />
        <circle cx="222" cy="196" r="4" fill="#ef5b8b" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="256" cy="188" r="4" fill="#5db657" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="290" cy="196" r="4" fill="#ef5b8b" stroke="#1a1a1a" strokeWidth="3" />
      </g>
      <ellipse data-anim className="st-glow" cx="256" cy="310" rx="170" ry="50" fill="#fff7c2" />
      <g stroke="#1a1a1a" strokeWidth="4" strokeLinejoin="round" fill="#ffd14a">
        <g data-anim className="st-spark st-s1"><path d="M168 360 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" /></g>
        <g data-anim className="st-spark st-s2"><path d="M256 360 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 z" /></g>
        <g data-anim className="st-spark st-s3"><path d="M344 360 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" /></g>
      </g>
      <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60 340 Q256 314 452 340 L452 460 Q256 432 60 460 Z" fill="#7b5fb8" />
        <path d="M74 340 Q256 314 438 340 L438 446 Q256 418 74 446 Z" fill="#fdf3d8" />
        <line x1="256" y1="314" x2="256" y2="432" />
        <line x1="110" y1="360" x2="230" y2="348" strokeWidth="5" />
        <line x1="110" y1="382" x2="230" y2="370" strokeWidth="5" />
        <line x1="110" y1="404" x2="220" y2="392" strokeWidth="5" />
        <line x1="282" y1="348" x2="402" y2="360" strokeWidth="5" />
        <line x1="282" y1="370" x2="402" y2="382" strokeWidth="5" />
        <line x1="282" y1="392" x2="392" y2="404" strokeWidth="5" />
      </g>
      <g data-anim className="st-ribbon">
        <path d="M246 314 L266 314 L266 432 L256 418 L246 432 Z" fill="#ef5b8b" stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function MathTile() {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs><radialGradient id="mt-bg" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#ffe0ec" /><stop offset="100%" stopColor="#f6a8c4" /></radialGradient></defs>
      <rect width="512" height="512" fill="url(#mt-bg)" />
      <ellipse cx="200" cy="450" rx="100" ry="12" fill="#000" opacity=".15" />
      <g data-anim className="mt-pizza">
        <g stroke="#1a1a1a" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
          <path d="M200 200 L120 410 L280 410 Z" fill="#f4c364" />
          <path d="M200 218 L132 396 L268 396 Z" fill="#fff1b8" />
          <path d="M120 410 Q200 400 280 410 L268 396 Q200 388 132 396 Z" fill="#d49144" />
          <circle cx="200" cy="270" r="14" fill="#e85a5a" />
          <circle cx="170" cy="335" r="12" fill="#e85a5a" />
          <circle cx="230" cy="335" r="12" fill="#e85a5a" />
          <circle cx="200" cy="380" r="11" fill="#e85a5a" />
          <path d="M215 290 q8 -2 6 8 q-10 -2 -6 -8 z" fill="#4eb24a" />
          <path d="M180 360 q8 -2 6 8 q-10 -2 -6 -8 z" fill="#4eb24a" />
        </g>
      </g>
      <g fontFamily="Fredoka, 'Baloo 2', 'Comic Sans MS', system-ui, sans-serif" fontWeight={900} fontSize={110} textAnchor="middle" stroke="#1a1a1a" strokeWidth="6" paintOrder="stroke fill" strokeLinejoin="round">
        <text data-anim className="mt-d mt-d1" x="340" y="240" fill="#ef5b8b">1</text>
        <text data-anim className="mt-d mt-d2" x="400" y="320" fill="#ffd14a">2</text>
        <text data-anim className="mt-d mt-d3" x="360" y="410" fill="#5db657">3</text>
      </g>
    </svg>
  );
}

const TILES: Record<DiscoveryCategory, () => ReactElement> = {
  science: ScienceTile,
  history: HistoryTile,
  nature: NatureTile,
  inventions: InventionsTile,
  sports: SportsTile,
  stories: StoriesTile,
  math_in_real_life: MathTile,
};

export default function DiscoveryTile({ category }: { category: string }) {
  const Tile = TILES[category as DiscoveryCategory];
  if (!Tile) return null;
  return (
    <div className="discovery-tile h-full w-full">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Tile />
    </div>
  );
}
