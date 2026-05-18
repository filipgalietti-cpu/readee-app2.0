"use client";

import "./bunny.css";
import { getOutfit, type Outfit } from "./outfits";

export type ReactionState = "correct" | "incorrect" | "levelup";

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
};

export function BunnyReaction({ outfitId, state, className }: BunnyReactionProps) {
  const outfit = getOutfit(outfitId);
  return (
    <div className={`bn-stage reaction-${state}${className ? ` ${className}` : ""}`}>
      <BunnyBase outfit={outfit} />
      <svg className="bn-overlay" viewBox="0 0 240 260">
        {state === "correct" && <CorrectOverlay />}
        {state === "incorrect" && <IncorrectOverlay />}
        {state === "levelup" && <LevelUpOverlay />}
      </svg>
    </div>
  );
}
