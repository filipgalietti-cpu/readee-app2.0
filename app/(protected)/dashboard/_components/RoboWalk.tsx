"use client";

/**
 * RoboWalk — self-contained port of the Claude Design `robo-walk.jsx` component.
 *
 * The source registered a global `RoboWalk` that rendered the Readee bunny
 * mascot wearing the "robot" outfit (`<Bunny outfitId="robot" />`) inside a
 * marching wrapper. This is that exact scene, inlined as pure JSX + scoped CSS:
 * the robot marches stiffly across the floor, snap-turns, and marches back,
 * with a piston-stepped gait, a mechanical head swivel, blinking eyes, and
 * steam puffs at each pivot.
 *
 * Everything is pure inline SVG (no external assets). Every CSS class and
 * @keyframes name is prefixed `rw-` / `rw…` so it cannot collide with the
 * app's existing `bn-*`, `rx2-*`, `kwf-*`, `readee*` styles — the base bunny
 * anatomy classes (originally `bn-*`) were renamed to `rw-*` here.
 *
 * Design intent: ~480×213 (wide). The stage fills its container width and keeps
 * a 900/400 aspect ratio; the SVG scales to the stage.
 */

const CSS = `
.rw-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 900 / 400;
  overflow: hidden;
  --walk: 9s;
}

/* floor + subtle scanline shimmer for grounding */
.rw-floor { position: absolute; left: 0; right: 0; bottom: 11%; height: 3px; background: #e0e7ff; }
.rw-scan { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(180deg, rgba(67,56,202,.03) 0 2px, transparent 2px 6px); }

/* traveler: marches right, snap-turns, marches back */
.rw-traveler { position: absolute; bottom: 8%; left: 8%; width: 26%; aspect-ratio: 240 / 260; animation: rwTravel var(--walk) linear infinite; }
@keyframes rwTravel {
  0%   { transform: translateX(0); }
  41%  { transform: translateX(224%); }
  50%  { transform: translateX(224%); }
  91%  { transform: translateX(0); }
  100% { transform: translateX(0); }
}

/* piston gait: hard stepped bounce, freezes during the pauses */
.rw-gait { width: 100%; height: 100%; animation: rwGait var(--walk) step-end infinite; }
@keyframes rwGait {
  0.000% { transform: translateY(0); }
  2.273% { transform: translateY(-9px); }
  4.545% { transform: translateY(0); }
  6.818% { transform: translateY(-9px); }
  9.091% { transform: translateY(0); }
  11.364% { transform: translateY(-9px); }
  13.636% { transform: translateY(0); }
  15.909% { transform: translateY(-9px); }
  18.182% { transform: translateY(0); }
  20.455% { transform: translateY(-9px); }
  22.727% { transform: translateY(0); }
  25.000% { transform: translateY(-9px); }
  27.273% { transform: translateY(0); }
  29.545% { transform: translateY(-9px); }
  31.818% { transform: translateY(0); }
  34.091% { transform: translateY(-9px); }
  36.364% { transform: translateY(0); }
  38.636% { transform: translateY(-9px); }
  40.909% { transform: translateY(0); }
  41%, 50% { transform: translateY(0); }
  50.000% { transform: translateY(0); }
  52.273% { transform: translateY(-9px); }
  54.545% { transform: translateY(0); }
  56.818% { transform: translateY(-9px); }
  59.091% { transform: translateY(0); }
  61.364% { transform: translateY(-9px); }
  63.636% { transform: translateY(0); }
  65.909% { transform: translateY(-9px); }
  68.182% { transform: translateY(0); }
  70.455% { transform: translateY(-9px); }
  72.727% { transform: translateY(0); }
  75.000% { transform: translateY(-9px); }
  77.273% { transform: translateY(0); }
  79.545% { transform: translateY(-9px); }
  81.818% { transform: translateY(0); }
  84.091% { transform: translateY(-9px); }
  86.364% { transform: translateY(0); }
  88.636% { transform: translateY(-9px); }
  90.909% { transform: translateY(0); }
  91%, 100% { transform: translateY(0); }
}

/* ── base bunny anatomy (renamed from bn-* to rw-*) ── */
.rw-bn-stage { width: 100%; height: 100%; position: relative; }
.rw-bn { display: block; overflow: visible; width: 100%; height: 100%; position: absolute; inset: 0; }

/* soft ground shadow */
.rw-ground { transform-box: fill-box; transform-origin: center; animation: rwGround 3.4s ease-in-out infinite; }
@keyframes rwGround { 0%,100% { transform: scaleX(1); opacity: .18; } 50% { transform: scaleX(.92); opacity: .22; } }

/* gentle breathing */
.rw-body-grp { transform-origin: 120px 220px; animation: rwBreathe 3.4s ease-in-out infinite; }
@keyframes rwBreathe { 0%,100% { transform: scaleY(1) translateY(0); } 50% { transform: scaleY(.985) translateY(.5px); } }

/* head bob */
.rw-head-grp { transform-origin: 120px 156px; animation: rwHeadBob 3.4s ease-in-out infinite; }
@keyframes rwHeadBob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-1.5px) rotate(.4deg); } }

/* blink */
.rw-eye { transform-box: fill-box; transform-origin: center; animation: rwBlink 4.6s ease-in-out infinite; }
@keyframes rwBlink {
  0%, 92%, 100% { transform: scaleY(1); }
  94%           { transform: scaleY(.08); }
  96%           { transform: scaleY(1); }
}

/* ear twitch (idle only) */
.rw-ear-l { transform-origin: 50% 100%; transform-box: fill-box; animation: rwEarTwitch 6.2s ease-in-out infinite; }
@keyframes rwEarTwitch {
  0%, 85%, 100% { transform: rotate(-6deg); }
  88%           { transform: rotate(-14deg); }
  91%           { transform: rotate(-4deg); }
  94%           { transform: rotate(-6deg); }
}
.rw-ear-r { transform-origin: 50% 100%; transform-box: fill-box; transform: rotate(6deg); }

/* ── robotic overrides while marching ── */
/* mechanical head: stiff quarter-beat swivel, overrides idle bob */
.rw-traveler .rw-head-grp { animation: rwHead calc(var(--walk) / 3) steps(3, jump-none) infinite !important; }
@keyframes rwHead { 0% { transform: rotate(-3deg); } 100% { transform: rotate(3deg); } }
.rw-traveler .rw-ear-l, .rw-traveler .rw-ear-r { animation: none !important; }
.rw-traveler .rw-body-grp { animation: rwBody calc(var(--walk) / 18) steps(2, jump-none) infinite !important; }
@keyframes rwBody { 0% { transform: scaleY(.99); } 100% { transform: scaleY(1.01); } }

/* steam puffs at each pivot */
.rw-puff { position: absolute; bottom: 24%; width: 26px; height: 26px; border-radius: 50%; background: #cbd5e1; opacity: 0; }
.rw-puff.p1 { left: 64%; animation: rwPuff var(--walk) ease-out infinite; }
.rw-puff.p2 { left: 10%; animation: rwPuff var(--walk) ease-out infinite; animation-delay: calc(var(--walk) / 2); }
@keyframes rwPuff { 0%,44% { opacity: 0; transform: translateY(0) scale(.4); } 48% { opacity: .7; transform: translateY(-14px) scale(1); } 56% { opacity: 0; transform: translateY(-30px) scale(1.4); } 100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) { .rw-stage * { animation: none !important; } }
`;

export default function RoboWalk({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className ? `rw-stage ${className}` : "rw-stage"} style={style}>
      <style>{CSS}</style>

      <div className="rw-floor" />
      <div className="rw-scan" />
      <div className="rw-puff p1" />
      <div className="rw-puff p2" />

      <div className="rw-traveler">
        <div className="rw-gait">
          <div className="rw-bn-stage">
            <svg className="rw-bn" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
              {/* Ground shadow */}
              <ellipse className="rw-ground" cx="120" cy="238" rx="62" ry="6" fill="#1a1a1a" />

              {/* BODY GROUP — body silhouette, robot chassis overlay, feet */}
              <g className="rw-body-grp">
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

                {/* Robot outfit — body overlay */}
                {/* metallic body shell */}
                <path
                  d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
                  fill="#b8c0cc"
                  stroke="#1a1a1a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                {/* chest plate */}
                <rect x="92" y="158" width="56" height="50" rx="4" fill="#8a96ad" stroke="#1a1a1a" strokeWidth="3.5" />
                {/* glowing chest core */}
                <circle cx="120" cy="183" r="11" fill="#5dd5ff" stroke="#1a1a1a" strokeWidth="3" />
                <circle cx="120" cy="183" r="5" fill="#ffffff" opacity="0.8" />
                {/* side dials */}
                <circle cx="104" cy="183" r="3.5" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="1.5" />
                <circle cx="136" cy="183" r="3.5" fill="#5db657" stroke="#1a1a1a" strokeWidth="1.5" />
                {/* corner rivets */}
                <g fill="#1a1a1a">
                  <circle cx="98" cy="164" r="2" />
                  <circle cx="142" cy="164" r="2" />
                  <circle cx="98" cy="202" r="2" />
                  <circle cx="142" cy="202" r="2" />
                </g>
                {/* speaker grille */}
                <g stroke="#5a6878" strokeWidth="2">
                  <line x1="100" y1="170" x2="106" y2="170" />
                  <line x1="134" y1="170" x2="140" y2="170" />
                </g>

                {/* Feet */}
                <ellipse cx="104" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
                <ellipse cx="136" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
                {/* Toe-bean accents */}
                <circle cx="104" cy="222" r="2" fill="#f8b8d0" />
                <circle cx="136" cy="222" r="2" fill="#f8b8d0" />
              </g>

              {/* HEAD GROUP — ears, head, face, robot head overlay */}
              <g className="rw-head-grp">
                {/* Ears */}
                <g className="rw-ear-l">
                  <path
                    d="M 96 22 C 88 22, 84 40, 88 90 L 110 90 C 112 40, 110 22, 102 22 Z"
                    fill="#fafafa"
                    stroke="#1a1a1a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path d="M 98 32 C 94 36, 92 52, 95 84 L 105 84 C 106 52, 104 36, 100 32 Z" fill="#f8b8d0" />
                </g>
                <g className="rw-ear-r">
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
                <ellipse className="rw-eye" cx="104" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
                <ellipse className="rw-eye" cx="136" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
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
                  className="rw-mouth-smile"
                  d="M 114 138 Q 120 144, 126 138"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="rw-mouth-frown"
                  d="M 114 142 Q 120 136, 126 142"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0 }}
                />

                {/* Robot outfit — head overlay */}
                {/* antenna */}
                <line x1="120" y1="78" x2="120" y2="44" stroke="#1a1a1a" strokeWidth="3.5" />
                {/* base where antenna meets head */}
                <ellipse cx="120" cy="80" rx="6" ry="2.5" fill="#8a96ad" stroke="#1a1a1a" strokeWidth="2" />
                <circle cx="120" cy="40" r="5" fill="#e8503a" stroke="#1a1a1a" strokeWidth="2.5" />
                <circle cx="120" cy="40" r="9" fill="none" stroke="#ffd14a" strokeWidth="1.8" opacity="0.7" />
                {/* side bolts */}
                <circle cx="70" cy="120" r="4" fill="#8a96ad" stroke="#1a1a1a" strokeWidth="2.5" />
                <circle cx="170" cy="120" r="4" fill="#8a96ad" stroke="#1a1a1a" strokeWidth="2.5" />
                {/* forehead LED panel */}
                <rect x="102" y="92" width="36" height="14" rx="3" fill="#2a3540" stroke="#1a1a1a" strokeWidth="2.5" />
                <circle cx="110" cy="99" r="2.4" fill="#5db657" />
                <circle cx="120" cy="99" r="2.4" fill="#ffd14a" />
                <circle cx="130" cy="99" r="2.4" fill="#e8503a" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
