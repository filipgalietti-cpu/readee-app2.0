"use client";

import "./badges.css";
import { getBadge, TIER, type Badge as BadgeType } from "./badges";

/**
 * Achievement badge — tier-colored medal frame + inner disc + inner
 * illustration (dangerously-inserted SVG from `badge.art`).
 *
 * Sibling to <Bunny>: same drop-in pattern, same lifecycle expectations.
 * Use `<Badge badgeId="badge_first_book">` anywhere you'd put an icon.
 * Renders into a square container — caller controls the size via the
 * wrapping div's width/height (the badge fills it via absolute inset:0).
 *
 * Pass `showSparkle` to render the three-corner glitter ring; defaults
 * to true for `platinum` tier (the legendary badges). Override to force
 * sparkle on lower-tier badges during a celebration moment.
 */
export type BadgeProps = {
  badgeId?: string | null;
  /** Show the corner sparkle effect. Default = platinum-only. */
  showSparkle?: boolean;
  className?: string;
};

export function Badge({ badgeId, showSparkle, className }: BadgeProps) {
  const badge = getBadge(badgeId);
  return <BadgeBase badge={badge} showSparkle={showSparkle} className={className} />;
}

/**
 * BadgeBase — accepts a resolved Badge object directly. Useful when
 * iterating the BADGES array in a grid (avoids re-lookup per cell).
 */
export function BadgeBase({
  badge,
  showSparkle,
  className,
}: {
  badge: BadgeType;
  showSparkle?: boolean;
  className?: string;
}) {
  const tier = TIER[badge.tier] ?? TIER.bronze;
  const sparkle = showSparkle ?? badge.tier === "platinum";

  return (
    <div className={`bg-stage${className ? ` ${className}` : ""}`}>
      <svg
        className="bg-svg"
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={badge.name}
      >
        {/* Ground shadow under the medal */}
        <ellipse className="bg-shadow" cx="100" cy="196" rx="58" ry="6" fill="#1a1a1a" />

        {sparkle && (
          <g>
            <g className="bg-sparkle" style={{ transformOrigin: "32px 56px" }}>
              <path
                d="M 32 46 L 35 54 L 43 56 L 35 58 L 32 66 L 29 58 L 21 56 L 29 54 Z"
                fill="#ffd14a"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
            <g className="bg-sparkle s2" style={{ transformOrigin: "170px 80px" }}>
              <path
                d="M 170 70 L 173 78 L 181 80 L 173 82 L 170 90 L 167 82 L 159 80 L 167 78 Z"
                fill="#ffd14a"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
            <g className="bg-sparkle s3" style={{ transformOrigin: "180px 168px" }}>
              <path
                d="M 180 160 L 182 166 L 188 168 L 182 170 L 180 176 L 178 170 L 172 168 L 178 166 Z"
                fill="#ffd14a"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
          </g>
        )}

        {/* The medal — wrapped in a float group */}
        <g className="bg-float">
          {/* outer tier ring */}
          <circle cx="100" cy="110" r="86" fill={tier.rim} stroke="#1a1a1a" strokeWidth="5" />

          {/* 12 rivet notches around the rim — gives the medal a gear texture */}
          <g fill={tier.deep} stroke="#1a1a1a" strokeWidth="2">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = ((i * 30 - 90) * Math.PI) / 180;
              const cx = 100 + Math.cos(a) * 86;
              const cy = 110 + Math.sin(a) * 86;
              return <circle key={i} cx={cx} cy={cy} r="3.4" />;
            })}
          </g>

          {/* inner disc */}
          <circle cx="100" cy="110" r="74" fill={tier.inner} stroke="#1a1a1a" strokeWidth="4" />
          {/* soft inner glow ring */}
          <circle cx="100" cy="110" r="66" fill="none" stroke={tier.glow} strokeWidth="4" opacity="0.85" />

          {/* badge-specific art (dangerously inserted) */}
          <g dangerouslySetInnerHTML={{ __html: badge.art }} />
        </g>
      </svg>
    </div>
  );
}
