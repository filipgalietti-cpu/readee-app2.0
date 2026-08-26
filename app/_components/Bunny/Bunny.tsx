"use client";

import "./bunny.css";
import { getOutfit, type Outfit } from "./outfits";

export type ReactionState =
  // Base feedback reactions.
  | "correct"
  | "incorrect"
  | "levelup"
  // Reaction Pack 2 — 10 collectible reactions (ported from the design's
  // bunny-reactions-2.jsx; rigs in bunny.css, overlays below).
  | "wave"
  | "clap"
  | "laugh"
  | "wow"
  | "love"
  | "sleepy"
  | "dizzy"
  | "streakfire"
  | "superstar"
  | "rainbow";

/**
 * How long to hold a tapped reaction before dismissing it, in ms. Each
 * reaction is an infinite loop (bunny.css) that finishes its action and
 * returns to the REST pose in the last third of the cycle; these values land
 * inside that rest window so the swap back to the idle <Bunny> is seamless.
 * Dismissing mid-cycle (the old flat 2600ms) snapped the bunny out of a
 * half-finished wave — that was the glitch.
 */
export function reactionHoldMs(state: ReactionState): number {
  switch (state) {
    case "levelup":
      return 6500; // 6.5s dance loop
    case "sleepy":
    case "rainbow":
      return 4900; // 6s loops
    case "dizzy":
    case "superstar":
      return 4400; // 5.5s loops
    default:
      return 4000; // 5s loops (wave/clap/wow/laugh/love/streakfire/correct/incorrect)
  }
}

/** The Reaction Pack 2 ids (collectible reactions, sold in the shop). */
export const REACTION_PACK_2 = [
  "wave", "clap", "laugh", "wow", "love",
  "sleepy", "dizzy", "streakfire", "superstar", "rainbow",
] as const;

type BunnyBaseProps = { outfit: Outfit };

function BunnyBase({ outfit }: BunnyBaseProps) {
  return (
    <svg className="bn" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
      <ellipse className="bn-ground" cx="120" cy="238" rx="62" ry="6" fill="#1a1a1a" />

      {outfit.back && <g dangerouslySetInnerHTML={{ __html: outfit.back }} />}

      <g className="bn-body-grp">
        <path
          d="M 76 168 C 76 148, 92 140, 120 140 C 148 140, 164 148, 164 168 C 168 196, 158 218, 142 220 L 98 220 C 82 218, 72 196, 76 168 Z"
          fill="#fafafa"
          stroke="#1a1a1a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <ellipse cx="120" cy="188" rx="22" ry="20" fill="#efece8" />

        {outfit.body && <g dangerouslySetInnerHTML={{ __html: outfit.body }} />}

        <ellipse cx="104" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <ellipse cx="136" cy="220" rx="13" ry="8" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="104" cy="222" r="2" fill="#f8b8d0" />
        <circle cx="136" cy="222" r="2" fill="#f8b8d0" />
      </g>

      <g className="bn-head-grp">
        <g className="bn-ear-l">
          <path
            d="M 96 22 C 88 22, 84 40, 88 90 L 110 90 C 112 40, 110 22, 102 22 Z"
            fill="#fafafa"
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 98 32 C 94 36, 92 52, 95 84 L 105 84 C 106 52, 104 36, 100 32 Z" fill="#f8b8d0" />
        </g>
        <g className="bn-ear-r">
          <path
            d="M 138 22 C 130 22, 128 40, 130 90 L 152 90 C 156 40, 152 22, 144 22 Z"
            fill="#fafafa"
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 140 32 C 136 36, 134 52, 135 84 L 145 84 C 148 52, 146 36, 142 32 Z" fill="#f8b8d0" />
        </g>

        <ellipse cx="120" cy="120" rx="52" ry="44" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />

        <circle cx="92" cy="130" r="6" fill="#f8b8d0" opacity=".75" />
        <circle cx="148" cy="130" r="6" fill="#f8b8d0" opacity=".75" />

        <ellipse className="bn-eye" cx="104" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
        <ellipse className="bn-eye" cx="136" cy="118" rx="4" ry="5.5" fill="#1a1a1a" />
        <circle cx="105.5" cy="116" r="1.3" fill="#fff" />
        <circle cx="137.5" cy="116" r="1.3" fill="#fff" />

        <path
          d="M 116 128 Q 120 134, 124 128 Q 120 132, 116 128 Z"
          fill="#ee5b85"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 120 132 L 120 136"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="bn-mouth-smile"
          d="M 114 138 Q 120 144, 126 138"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="bn-mouth-frown"
          d="M 114 142 Q 120 136, 126 142"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0 }}
        />

        {outfit.head && <g dangerouslySetInnerHTML={{ __html: outfit.head }} />}
      </g>
    </svg>
  );
}

function RareSparkleRing() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 260"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <g className="bn-rare-sparkle" style={{ transformOrigin: "40px 60px" }}>
        <path
          d="M 40 50 L 44 58 L 52 60 L 44 62 L 40 70 L 36 62 L 28 60 L 36 58 Z"
          fill="#ffd14a"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />
      </g>
      <g className="bn-rare-sparkle s2" style={{ transformOrigin: "200px 90px" }}>
        <path
          d="M 200 80 L 204 88 L 212 90 L 204 92 L 200 100 L 196 92 L 188 90 L 196 88 Z"
          fill="#ffd14a"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />
      </g>
      <g className="bn-rare-sparkle s3" style={{ transformOrigin: "210px 200px" }}>
        <path
          d="M 210 192 L 213 198 L 219 200 L 213 202 L 210 208 L 207 202 L 201 200 L 207 198 Z"
          fill="#ffd14a"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

export type BunnyProps = {
  outfitId?: string | null;
  showRareSparkle?: boolean;
  className?: string;
};

export function Bunny({ outfitId, showRareSparkle = false, className }: BunnyProps) {
  const outfit = getOutfit(outfitId);
  return (
    <div className={`bn-stage${className ? ` ${className}` : ""}`}>
      {showRareSparkle && outfit.rarity === "rare" && <RareSparkleRing />}
      <BunnyBase outfit={outfit} />
    </div>
  );
}

function CorrectOverlay() {
  return (
    <g>
      <g className="rx-paw-l">
        <ellipse cx="60" cy="98" rx="13" ry="11" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="60" cy="100" r="2.5" fill="#f8b8d0" />
      </g>
      <g className="rx-paw-r">
        <ellipse cx="180" cy="98" rx="13" ry="11" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="180" cy="100" r="2.5" fill="#f8b8d0" />
      </g>

      <g fill="#ffd14a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round">
        <path className="rx-spark rx-spark-1" d="M 38 56 L 41 64 L 49 66 L 41 68 L 38 76 L 35 68 L 27 66 L 35 64 Z" />
        <path
          className="rx-spark rx-spark-2"
          d="M 202 56 L 205 64 L 213 66 L 205 68 L 202 76 L 199 68 L 191 66 L 199 64 Z"
        />
        <path
          className="rx-spark rx-spark-3"
          d="M 28 150 L 30 156 L 36 158 L 30 160 L 28 166 L 26 160 L 20 158 L 26 156 Z"
        />
        <path
          className="rx-spark rx-spark-4"
          d="M 212 150 L 214 156 L 220 158 L 214 160 L 212 166 L 210 160 L 204 158 L 210 156 Z"
        />
      </g>

    </g>
  );
}

function IncorrectOverlay() {
  return (
    <g>
      <g className="rx-scratch-paw">
        <ellipse cx="156" cy="74" rx="11" ry="9" fill="#fafafa" stroke="#1a1a1a" strokeWidth="3.5" />
        <circle cx="156" cy="76" r="2" fill="#f8b8d0" />
        <path
          d="M 170 64 L 174 60 M 172 72 L 176 70 M 172 80 L 176 80"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".55"
        />
      </g>

      <g className="rx-question">
        <circle cx="56" cy="56" r="16" fill="#FFD14A" stroke="#1a1a1a" strokeWidth="3" />
        <text
          x="56"
          y="64"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={900}
          fontSize={22}
          fill="#1a1a1a"
        >
          ?
        </text>
      </g>
    </g>
  );
}

function LevelUpOverlay() {
  return (
    <g>
      <g className="rx-dance-paw-l">
        <ellipse cx="62" cy="128" rx="13" ry="11" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="62" cy="130" r="2.5" fill="#f8b8d0" />
      </g>
      <g className="rx-dance-paw-r">
        <ellipse cx="178" cy="128" rx="13" ry="11" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="178" cy="130" r="2.5" fill="#f8b8d0" />
      </g>

      <g className="rx-note rx-note-1">
        <ellipse
          cx="40"
          cy="98"
          rx="6"
          ry="4.5"
          fill="#6E5BFF"
          stroke="#1a1a1a"
          strokeWidth="2"
          transform="rotate(-18 40 98)"
        />
        <path d="M 46 96 L 46 78 L 56 74" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <g className="rx-note rx-note-2">
        <ellipse
          cx="200"
          cy="98"
          rx="6"
          ry="4.5"
          fill="#ee5b85"
          stroke="#1a1a1a"
          strokeWidth="2"
          transform="rotate(18 200 98)"
        />
        <path d="M 194 96 L 194 78 L 184 74" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      <g stroke="#1a1a1a" strokeWidth="1.5">
        <rect className="rx-confetti rx-conf-1" x="116" y="158" width="9" height="4" rx="1.5" fill="#ee5b85" />
        <rect className="rx-confetti rx-conf-2" x="116" y="158" width="9" height="4" rx="1.5" fill="#ffd14a" />
        <rect className="rx-confetti rx-conf-3" x="116" y="158" width="7" height="7" rx="1.5" fill="#5db657" />
        <rect className="rx-confetti rx-conf-4" x="116" y="158" width="7" height="7" rx="1.5" fill="#6E5BFF" />
        <rect className="rx-confetti rx-conf-5" x="116" y="158" width="9" height="4" rx="1.5" fill="#3a6cd8" />
        <rect className="rx-confetti rx-conf-6" x="116" y="158" width="7" height="7" rx="1.5" fill="#ee5b85" />
      </g>
    </g>
  );
}

export type BunnyReactionProps = {
  outfitId?: string | null;
  state: ReactionState;
  className?: string;
  /** Optional text for the wave "hi" bubble (default "Hi!") — lets the welcome
   *  flow rotate greetings through it. */
  bubbleText?: string;
};

// ── Reaction Pack 2 overlay props (ported 1:1 from bunny-reactions-2.jsx) ──
const heartPath = (x: number, y: number, s = 1) =>
  `M ${x} ${y + 4 * s} C ${x - 6 * s} ${y - 4 * s}, ${x - 12 * s} ${y + 2 * s}, ${x} ${y + 10 * s} C ${x + 12 * s} ${y + 2 * s}, ${x + 6 * s} ${y - 4 * s}, ${x} ${y + 4 * s} Z`;

function Rx2Overlay({ state, bubbleText }: { state: ReactionState; bubbleText?: string }) {
  switch (state) {
    case "wave": {
      // Bubble widens to fit the greeting (default "Hi!"); the welcome flow
      // rotates greetings through it, matching the Kid Welcome Flow design.
      const label = bubbleText ?? "Hi!";
      const w = Math.max(52, label.length * 8.4 + 22);
      return (
        <g>
          <g className="rx2-prop rx2-wave-paw">
            <ellipse cx="178" cy="92" rx="13" ry="11" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
            <circle cx="178" cy="94" r="2.5" fill="#f8b8d0" />
            <path d="M 194 82 L 199 78 M 196 92 L 202 91" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" opacity=".5" />
          </g>
          <g className="rx2-prop rx2-hi">
            <rect x={52 - w / 2} y="46" width={w} height="30" rx="15" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
            <text x="52" y="67" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="15" fill="#1a1a1a">{label}</text>
          </g>
        </g>
      );
    }
    case "clap":
      return (
        <g>
          <g className="rx2-prop rx2-clap-l">
            <ellipse cx="103" cy="172" rx="12" ry="10" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
            <circle cx="103" cy="174" r="2.2" fill="#f8b8d0" />
          </g>
          <g className="rx2-prop rx2-clap-r">
            <ellipse cx="137" cy="172" rx="12" ry="10" fill="#fafafa" stroke="#1a1a1a" strokeWidth="4" />
            <circle cx="137" cy="174" r="2.2" fill="#f8b8d0" />
          </g>
          <g className="rx2-prop rx2-clap-burst">
            <path d="M 120 148 L 120 140 M 104 154 L 98 148 M 136 154 L 142 148" stroke="#ffd14a" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      );
    case "laugh":
      return (
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900">
          <g className="rx2-prop rx2-ha1">
            <text x="58" y="88" textAnchor="middle" fontSize="18" fill="#6E5BFF" stroke="#fff" strokeWidth="4" paintOrder="stroke fill">ha</text>
          </g>
          <g className="rx2-prop rx2-ha2">
            <text x="184" y="88" textAnchor="middle" fontSize="18" fill="#ee5b85" stroke="#fff" strokeWidth="4" paintOrder="stroke fill">ha!</text>
          </g>
        </g>
      );
    case "wow":
      return (
        <g className="rx2-prop rx2-bang">
          <circle cx="184" cy="52" r="17" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="3" />
          <text x="184" y="61" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="24" fill="#1a1a1a">!</text>
        </g>
      );
    case "love":
      return (
        <g>
          <g className="rx2-prop rx2-hearteye">
            <circle cx="104" cy="118" r="9" fill="#fafafa" />
            <path d={heartPath(104, 112, 1)} fill="#ee5b85" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g className="rx2-prop rx2-hearteye">
            <circle cx="136" cy="118" r="9" fill="#fafafa" />
            <path d={heartPath(136, 112, 1)} fill="#ee5b85" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g className="rx2-prop rx2-heart-1">
            <path d={heartPath(60, 66, 1.4)} fill="#ee5b85" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g className="rx2-prop rx2-heart-2">
            <path d={heartPath(182, 60, 1.1)} fill="#ff9db8" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        </g>
      );
    case "sleepy":
      return (
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fill="#6E5BFF" stroke="#fff" strokeWidth="3" paintOrder="stroke fill">
          <g className="rx2-prop rx2-z1"><text x="168" y="72" fontSize="20">Z</text></g>
          <g className="rx2-prop rx2-z2"><text x="184" y="54" fontSize="15">z</text></g>
          <g className="rx2-prop rx2-z3"><text x="196" y="40" fontSize="11">z</text></g>
        </g>
      );
    case "dizzy":
      return (
        <g>
          <g className="rx2-prop rx2-spiral">
            <circle cx="104" cy="118" r="9" fill="#fafafa" />
            <path d="M 104 118 m 0 -1 a 1.5 1.5 0 0 1 1.5 1.5 a 3 3 0 0 1 -3 3 a 5 5 0 0 1 -5 -5 a 7 7 0 0 1 7 -7" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className="rx2-prop rx2-spiral">
            <circle cx="136" cy="118" r="9" fill="#fafafa" />
            <path d="M 136 118 m 0 -1 a 1.5 1.5 0 0 1 1.5 1.5 a 3 3 0 0 1 -3 3 a 5 5 0 0 1 -5 -5 a 7 7 0 0 1 7 -7" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className="rx2-orbit">
            <path d="M 84 52 L 87 59 L 94 60 L 88 64 L 90 71 L 84 67 L 78 71 L 80 64 L 74 60 L 81 59 Z" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 156 46 L 158 51 L 163 52 L 159 55 L 160 60 L 156 57 L 152 60 L 153 55 L 149 52 L 154 51 Z" fill="#ffd14a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>
      );
    case "streakfire":
      return (
        <g>
          <g className="rx2-prop rx2-flame">
            <path d="M 120 18 C 130 30, 140 38, 140 50 C 140 62, 131 70, 120 70 C 109 70, 100 62, 100 50 C 100 42, 104 36, 108 32 C 108 40, 112 43, 114 42 C 112 34, 114 26, 120 18 Z" fill="#ff8a3d" stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M 120 42 C 126 48, 128 52, 128 56 C 128 61, 124 64, 120 64 C 116 64, 112 61, 112 56 C 112 51, 115 47, 120 42 Z" fill="#ffd14a" />
          </g>
          <g className="rx2-prop rx2-fire-badge">
            <rect x="152" y="34" width="66" height="28" rx="14" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
            <text x="185" y="53" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#1a1a1a">7 days</text>
          </g>
        </g>
      );
    case "superstar":
      return (
        <g stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" fill="#ffd14a">
          <path className="rx2-prop rx2-star-1" style={{ "--sx": "-40px", "--sx2": "-60px" } as React.CSSProperties} d="M 120 70 L 124 79 L 133 80 L 126 86 L 128 95 L 120 90 L 112 95 L 114 86 L 107 80 L 116 79 Z" />
          <path className="rx2-prop rx2-star-2" style={{ "--sx": "42px", "--sx2": "62px" } as React.CSSProperties} d="M 120 70 L 124 79 L 133 80 L 126 86 L 128 95 L 120 90 L 112 95 L 114 86 L 107 80 L 116 79 Z" fill="#ee5b85" />
          <path className="rx2-prop rx2-star-3" style={{ "--sx": "0px", "--sx2": "4px" } as React.CSSProperties} d="M 120 56 L 123 63 L 130 64 L 125 69 L 126 76 L 120 72 L 114 76 L 115 69 L 110 64 L 117 63 Z" fill="#6E5BFF" />
        </g>
      );
    case "rainbow":
      return (
        <g>
          <g className="rx2-prop rx2-rainbow" style={{ transformOrigin: "120px 90px" }}>
            <path d="M 40 96 A 80 80 0 0 1 200 96" fill="none" stroke="#ee5b85" strokeWidth="9" strokeLinecap="round" />
            <path d="M 50 96 A 70 70 0 0 1 190 96" fill="none" stroke="#ffd14a" strokeWidth="9" strokeLinecap="round" />
            <path d="M 60 96 A 60 60 0 0 1 180 96" fill="none" stroke="#5db657" strokeWidth="9" strokeLinecap="round" />
            <path d="M 70 96 A 50 50 0 0 1 170 96" fill="none" stroke="#3a6cd8" strokeWidth="9" strokeLinecap="round" />
          </g>
          <g className="rx2-prop rx2-rd1">
            <circle cx="38" cy="110" r="5" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />
          </g>
          <g className="rx2-prop rx2-rd2">
            <circle cx="202" cy="110" r="5" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

export function BunnyReaction({ outfitId, state, className, bubbleText }: BunnyReactionProps) {
  const outfit = getOutfit(outfitId);
  return (
    <div className={`bn-stage reaction-${state}${className ? ` ${className}` : ""}`}>
      <BunnyBase outfit={outfit} />
      <svg className="bn-overlay" viewBox="0 0 240 260">
        {state === "correct" && <CorrectOverlay />}
        {state === "incorrect" && <IncorrectOverlay />}
        {state === "levelup" && <LevelUpOverlay />}
        <Rx2Overlay state={state} bubbleText={bubbleText} />
      </svg>
    </div>
  );
}
