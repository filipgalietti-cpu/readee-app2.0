/**
 * 26 achievement badges. Same drop-in pattern as bunny outfits:
 * each entry has id/name/desc/tier/art. The Badge component
 * (Badge.tsx) draws the tier ring + glow + inner disc, then
 * dangerously-inserts the `art` SVG string on top.
 *
 * Source: Claude Design "bunny-badges" handoff bundle, May 2026.
 * Art lives in a 200×220 viewBox. Medal center = (100, 110).
 */

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeTierStyle = {
  /** Outer ring color (the metal). */
  rim: string;
  /** Inner disc fill. */
  inner: string;
  /** Deep accent for notches + small rivet dots. */
  deep: string;
  /** Soft glow ring just inside the disc. */
  glow: string;
  /** Card background tint (used by BadgeCard). */
  card: string;
  /** Card border (2px). */
  cardBorder: string;
  /** Short display label ("Bronze" / "Legendary"). */
  tag: string;
};

export const TIER: Record<BadgeTier, BadgeTierStyle> = {
  bronze:   { rim: "#b87333", inner: "#e6b27a", deep: "#8a5a2a", glow: "#f5d3a0", card: "#F5E0C8", cardBorder: "#E0B888", tag: "Bronze" },
  silver:   { rim: "#8a96ad", inner: "#cfd5dd", deep: "#5a6878", glow: "#eaedf2", card: "#E6EAF0", cardBorder: "#B0BAC8", tag: "Silver" },
  gold:     { rim: "#e6b332", inner: "#ffd14a", deep: "#b8852a", glow: "#fff0b0", card: "#FFF2C8", cardBorder: "#F0D880", tag: "Gold" },
  platinum: { rim: "#6E5BFF", inner: "#c9b8ff", deep: "#4A3BCC", glow: "#e0d6ff", card: "#ECE7FF", cardBorder: "#C9BEFF", tag: "Legendary" },
};

export type Badge = {
  /** `badge_<slug>` — prefix mirrors `bunny_*` outfit IDs. */
  id: string;
  name: string;
  /** Short kid-friendly description shown on hover/tap. */
  desc: string;
  tier: BadgeTier;
  /** Raw inner SVG string. Drawn ON TOP of the tier ring/disc
   *  via `dangerouslySetInnerHTML`. Use hyphenated SVG attrs. */
  art: string;
  /** Predicate that returns true when the kid has earned this badge.
   *  Badges without an `earns` predicate are "future" — designed but
   *  not yet wired to a behavior signal (no underlying tracking).
   *  The unlock engine skips them silently. */
  earns?: (signals: BadgeSignals) => boolean;
};

/**
 * Signal shape the badge predicates read from. Mirrors `UnlockSignals`
 * in `lib/unlock/index.ts` — defined here (rather than imported) so
 * `badges.ts` stays free of circular-dependency risk.
 */
export type BadgeSignals = {
  lesson_completed?: { passed: boolean };
  consecutive_correct?: number;
  total_correct?: number;
  streak_days?: number;
  grade_finished?: boolean;
  finished_grade?: string;
  lessons_completed?: number;
  perfect_sessions?: number;
};

export const BADGES: Badge[] = [
  {
    id: "badge_first_book",
    name: "First Book",
    desc: "Finish your very first book.",
    tier: "bronze",
    art: `
      <!-- open book -->
      <path d="M 56 100 Q 78 90 100 96 L 100 148 Q 78 142 56 152 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 144 100 Q 122 90 100 96 L 100 148 Q 122 142 144 152 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <line x1="100" y1="96" x2="100" y2="148" stroke="#1a1a1a" stroke-width="3"/>
      <g stroke="#9aa4b0" stroke-width="2" stroke-linecap="round">
        <line x1="64" y1="108" x2="92" y2="108"/><line x1="64" y1="116" x2="92" y2="116"/><line x1="64" y1="124" x2="92" y2="124"/><line x1="64" y1="132" x2="92" y2="132"/>
        <line x1="108" y1="108" x2="136" y2="108"/><line x1="108" y1="116" x2="136" y2="116"/><line x1="108" y1="124" x2="136" y2="124"/><line x1="108" y1="132" x2="136" y2="132"/>
      </g>
      <!-- gold star marker above the book with a "1" -->
      <g class="bg-pulse" style="transform-origin: 100px 70px;">
        <path d="M 100 44 L 108 62 L 128 64 L 114 78 L 118 98 L 100 88 L 82 98 L 86 78 L 72 64 L 92 62 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
        <text x="100" y="84" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="22" fill="#1a1a1a">1</text>
      </g>
    `,
    earns: (s) => s.lesson_completed?.passed === true,  },
  {
    id: "badge_bookworm",
    name: "Bookworm",
    desc: "Read 10 days in a row.",
    tier: "bronze",
    art: `
      <!-- closed book base -->
      <rect x="50" y="118" width="100" height="36" rx="3" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="4"/>
      <rect x="50" y="118" width="100" height="6" fill="#2a4878"/>
      <rect x="62" y="148" width="76" height="8" fill="#fafafa" stroke="#1a1a1a" stroke-width="3"/>
      <text x="100" y="142" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="14" fill="#fafafa" letter-spacing="1">A B C</text>
      <!-- worm body (segments) emerging through the cover -->
      <g stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round">
        <ellipse cx="74" cy="108" rx="11" ry="9" fill="#5db657"/>
        <ellipse cx="92" cy="96"  rx="11" ry="9" fill="#7cc878"/>
        <ellipse cx="110" cy="84" rx="11" ry="9" fill="#5db657"/>
        <ellipse cx="126" cy="74" rx="12" ry="10" fill="#7cc878"/>
      </g>
      <!-- worm head: round glasses + tiny smile -->
      <circle cx="122" cy="73" r="4.5" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="132" cy="73" r="4.5" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="126.5" y1="73" x2="127.5" y2="73" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="122" cy="73" r="1.4" fill="#1a1a1a"/>
      <circle cx="132" cy="73" r="1.4" fill="#1a1a1a"/>
      <path d="M 124 80 Q 128 83 132 80" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- hole through cover where worm exits -->
      <ellipse cx="74" cy="118" rx="9" ry="3" fill="#1a1a1a" opacity=".6"/>
    `,
    earns: (s) => (s.streak_days ?? 0) >= 10,  },
  {
    id: "badge_ten_books",
    name: "10 Books Read",
    desc: "Finish ten books.",
    tier: "bronze",
    art: `
      <!-- book stack: three volumes -->
      <rect x="46" y="124" width="108" height="22" rx="3" fill="#c43d2a" stroke="#1a1a1a" stroke-width="4"/>
      <rect x="54" y="104" width="92"  height="22" rx="3" fill="#5db657" stroke="#1a1a1a" stroke-width="4"/>
      <rect x="62" y="84"  width="76"  height="22" rx="3" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="4"/>
      <!-- spine ridges -->
      <g stroke="#1a1a1a" stroke-width="2" opacity=".55">
        <line x1="62" y1="130" x2="62" y2="140"/><line x1="138" y1="130" x2="138" y2="140"/>
        <line x1="68" y1="110" x2="68" y2="120"/><line x1="132" y1="110" x2="132" y2="120"/>
        <line x1="74" y1="90"  x2="74" y2="100"/><line x1="126" y1="90"  x2="126" y2="100"/>
      </g>
      <!-- bookmark from middle book -->
      <path d="M 84 104 L 84 156 L 90 150 L 96 156 L 96 104 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- big "10" callout star -->
      <g class="bg-pulse" style="transform-origin: 100px 64px;">
        <path d="M 100 40 L 108 56 L 126 58 L 114 70 L 118 88 L 100 78 L 82 88 L 86 70 L 74 58 L 92 56 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
        <text x="100" y="74" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="20" fill="#1a1a1a">10</text>
      </g>
    `,
    earns: (s) => (s.lessons_completed ?? 0) >= 10,  },
  {
    id: "badge_fifty_books",
    name: "50 Books Read",
    desc: "A serious shelf.",
    tier: "silver",
    art: `
      <!-- five stacked books -->
      <rect x="44" y="136" width="112" height="18" rx="3" fill="#c43d2a" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="52" y="120" width="96"  height="18" rx="3" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="46" y="104" width="108" height="18" rx="3" fill="#5db657" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="54" y="88"  width="92"  height="18" rx="3" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="58" y="72"  width="84"  height="18" rx="3" fill="#ee5b85" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- spine markers -->
      <g stroke="#1a1a1a" stroke-width="1.6" opacity=".5">
        <line x1="60" y1="140" x2="60" y2="150"/><line x1="140" y1="140" x2="140" y2="150"/>
        <line x1="68" y1="108" x2="68" y2="118"/><line x1="132" y1="108" x2="132" y2="118"/>
        <line x1="72" y1="76"  x2="72" y2="86"/> <line x1="128" y1="76"  x2="128" y2="86"/>
      </g>
      <!-- ribbon banner with "50" -->
      <g>
        <path d="M 50 162 L 40 196 L 76 188 L 82 196 L 100 174 L 118 196 L 124 188 L 160 196 L 150 162 Z"
              fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
        <text x="100" y="190" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="20" fill="#1a1a1a">50</text>
      </g>
    `,
    earns: (s) => (s.lessons_completed ?? 0) >= 50,  },
  {
    id: "badge_hundred_books",
    name: "100 Books Club",
    desc: "Triple digits. Whoa.",
    tier: "gold",
    art: `
      <!-- trophy cup -->
      <!-- handles -->
      <path d="M 56 92 Q 38 96 40 116 Q 42 132 60 130" fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>
      <path d="M 144 92 Q 162 96 160 116 Q 158 132 140 130" fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>
      <!-- cup body -->
      <path d="M 56 80 L 144 80 L 138 138 Q 132 148 100 148 Q 68 148 62 138 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 56 80 L 144 80 L 142 88 Q 100 96 58 88 Z" fill="#e6b332" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- shine -->
      <path d="M 70 96 Q 74 116 78 130" stroke="#fff7d0" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>
      <!-- "100" engraved -->
      <text x="100" y="130" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="22" fill="#8a5a14" stroke="#fff7d0" stroke-width="1.2" paint-order="stroke fill">100</text>
      <!-- base -->
      <rect x="74" y="150" width="52" height="8" fill="#e6b332" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="64" y="158" width="72" height="10" rx="2" fill="#c79028" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- crown of three stars above -->
      <g>
        <path d="M 100 32 L 105 44 L 117 46 L 108 54 L 110 66 L 100 60 L 90 66 L 92 54 L 83 46 L 95 44 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M 64 50 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -4 l -6 4 l 1 -7 l -5 -5 l 7 -1 z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 136 50 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -4 l -6 4 l 1 -7 l -5 -5 l 7 -1 z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      </g>
    `,
    earns: (s) => (s.lessons_completed ?? 0) >= 100,  },
  {
    id: "badge_speed_reader",
    name: "Speed Reader",
    desc: "Beat the timer five times.",
    tier: "silver",
    art: `
      <!-- motion lines on the left -->
      <g stroke="#1a1a1a" stroke-width="4" stroke-linecap="round" opacity=".7">
        <line x1="32" y1="84"  x2="56" y2="84"/>
        <line x1="22" y1="104" x2="56" y2="104"/>
        <line x1="32" y1="124" x2="56" y2="124"/>
        <line x1="22" y1="144" x2="56" y2="144"/>
      </g>
      <!-- book — tilted/zooming right -->
      <g transform="rotate(8 110 114)">
        <path d="M 60 80 L 160 80 L 160 148 L 60 148 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <line x1="110" y1="80" x2="110" y2="148" stroke="#1a1a1a" stroke-width="3"/>
        <g stroke="#9aa4b0" stroke-width="2" stroke-linecap="round">
          <line x1="68" y1="94" x2="102" y2="94"/><line x1="68" y1="104" x2="98" y2="104"/><line x1="68" y1="114" x2="102" y2="114"/><line x1="68" y1="124" x2="96" y2="124"/><line x1="68" y1="134" x2="100" y2="134"/>
          <line x1="118" y1="94" x2="152" y2="94"/><line x1="118" y1="104" x2="148" y2="104"/><line x1="118" y1="114" x2="152" y2="114"/><line x1="118" y1="124" x2="146" y2="124"/><line x1="118" y1="134" x2="150" y2="134"/>
        </g>
      </g>
      <!-- lightning bolt over book -->
      <path d="M 134 60 L 96 116 L 116 116 L 100 162 L 156 96 L 132 96 L 146 60 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
    earns: (s) => (s.perfect_sessions ?? 0) >= 5,  },
  {
    id: "badge_streak_7",
    name: "7-Day Streak",
    desc: "A full week of reading.",
    tier: "bronze",
    art: `
      <!-- Authentic fire-emoji silhouette (paths derived from Noto/Google
           emoji 1F525 lottie). Wide rounded body, two peaks, right wisp,
           white-yellow core. -->
      <g class="bg-flame" style="transform-origin: 100px 180px;">
        <!-- Outer red flame -->
        <path d="M 60.8 77.2 C 58.5 79.6 47.4 91 44.1 108.3 C 43.3 112.7 42.9 117.5 43.4 122.7 C 45.5 148 61.4 179.7 103.6 180 C 123 179.7 95.8 146.1 89.9 133.4 C 84 120.8 71.1 110.6 71.1 110.6 C 71.1 110.6 64.3 97.7 65.7 77.7 C 65.7 73.7 63.8 74.2 60.8 77.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <!-- Right orange wisp -->
        <path d="M 126.4 98.2 C 126.4 98.2 86.7 177.7 103.5 180 C 120.3 182.3 145.3 173 156.6 146.2 C 162.3 132.9 159.8 120.6 156.4 112.1 C 153.8 105.4 150.5 101.1 150.2 100.3 C 149.4 98.7 145.1 95.6 145.2 99.5 C 145.3 102.9 141.6 107.3 136.1 107.5 C 129.7 107.6 126.4 98.2 126.4 98.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <!-- Mid orange layer -->
        <g transform="translate(-30 12.5) scale(1.3)"><path d="M 88.6 32 C 85.6 32 85.1 33.6 86.9 35.5 C 90.4 39 103.4 54.7 84.5 72.6 C 73.8 82.8 70.4 92.9 69.6 100.2 C 68.8 107 70.4 111.5 70.4 111.5 C 70.4 111.5 121.1 117.8 121.1 117.8 C 121.1 117.8 121.7 117.2 122.6 115.8 C 123.3 114.4 124.4 112.5 125.4 109.9 C 128.3 102.8 131.4 90.7 130.5 72.4 C 128.7 32.3 91.5 32 88.6 32 Z"
              fill="#ff8a3d"/></g>
        <!-- White/yellow inner core -->
        <path d="M 108.6 86.2 C 96.5 95.5 92.2 104.1 88.6 116.9 C 84.9 129.7 90.7 134.3 91.4 138.6 C 92.1 142.9 89.6 144.6 86.9 143.5 C 83.4 142.1 80.1 137.1 79.1 133.6 C 78.2 130.1 76.7 133.3 76.7 133.3 C 76.7 133.3 73.8 138.2 72.7 145.8 C 69.9 162.6 81.7 176.8 103 177.6 C 124.2 178.4 129.5 161 130.3 158.3 C 131.1 155.6 135.1 143.5 118.7 127.1 C 102.3 110.7 109 93.9 111.7 87.4 C 114.4 81 111 84.2 108.6 86.2 Z"
              fill="#ffd14a"/>
      </g>
      <!-- big day number overlaid -->
      <text x="100" y="152" text-anchor="middle" font-family="ui-sans-serif, system-ui"
            font-weight="900" font-size="38" fill="#c43d2a"
            stroke="#fff7d0" stroke-width="3.5" paint-order="stroke fill">7</text>
      <!-- floating embers -->
      <g class="bg-ember"><circle cx="122" cy="50" r="2.4" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="1.2"/></g>
      <g class="bg-ember e2"><circle cx="72" cy="58" r="2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/></g>
    `,
    earns: (s) => (s.streak_days ?? 0) >= 7,  },
  {
    id: "badge_streak_30",
    name: "30-Day Streak",
    desc: "A whole month — keep going.",
    tier: "silver",
    art: `
      <!-- Authentic fire-emoji silhouette (same as 7-day) -->
      <g class="bg-flame" style="transform-origin: 100px 180px;">
        <path d="M 60.8 77.2 C 58.5 79.6 47.4 91 44.1 108.3 C 43.3 112.7 42.9 117.5 43.4 122.7 C 45.5 148 61.4 179.7 103.6 180 C 123 179.7 95.8 146.1 89.9 133.4 C 84 120.8 71.1 110.6 71.1 110.6 C 71.1 110.6 64.3 97.7 65.7 77.7 C 65.7 73.7 63.8 74.2 60.8 77.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <path d="M 126.4 98.2 C 126.4 98.2 86.7 177.7 103.5 180 C 120.3 182.3 145.3 173 156.6 146.2 C 162.3 132.9 159.8 120.6 156.4 112.1 C 153.8 105.4 150.5 101.1 150.2 100.3 C 149.4 98.7 145.1 95.6 145.2 99.5 C 145.3 102.9 141.6 107.3 136.1 107.5 C 129.7 107.6 126.4 98.2 126.4 98.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <g transform="translate(-30 12.5) scale(1.3)"><path d="M 88.6 32 C 85.6 32 85.1 33.6 86.9 35.5 C 90.4 39 103.4 54.7 84.5 72.6 C 73.8 82.8 70.4 92.9 69.6 100.2 C 68.8 107 70.4 111.5 70.4 111.5 C 70.4 111.5 121.1 117.8 121.1 117.8 C 121.1 117.8 121.7 117.2 122.6 115.8 C 123.3 114.4 124.4 112.5 125.4 109.9 C 128.3 102.8 131.4 90.7 130.5 72.4 C 128.7 32.3 91.5 32 88.6 32 Z"
              fill="#ff8a3d"/></g>
        <path d="M 108.6 86.2 C 96.5 95.5 92.2 104.1 88.6 116.9 C 84.9 129.7 90.7 134.3 91.4 138.6 C 92.1 142.9 89.6 144.6 86.9 143.5 C 83.4 142.1 80.1 137.1 79.1 133.6 C 78.2 130.1 76.7 133.3 76.7 133.3 C 76.7 133.3 73.8 138.2 72.7 145.8 C 69.9 162.6 81.7 176.8 103 177.6 C 124.2 178.4 129.5 161 130.3 158.3 C 131.1 155.6 135.1 143.5 118.7 127.1 C 102.3 110.7 109 93.9 111.7 87.4 C 114.4 81 111 84.2 108.6 86.2 Z"
              fill="#ffd14a"/>
      </g>
      <text x="100" y="152" text-anchor="middle" font-family="ui-sans-serif, system-ui"
            font-weight="900" font-size="34" fill="#c43d2a"
            stroke="#fff7d0" stroke-width="3.5" paint-order="stroke fill">30</text>
      <g class="bg-ember"><circle cx="122" cy="48" r="2.6" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="1.2"/></g>
      <g class="bg-ember e2"><circle cx="68" cy="56" r="2.2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/></g>
      <g class="bg-ember e3"><circle cx="132" cy="72" r="1.8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1"/></g>
    `,
    earns: (s) => (s.streak_days ?? 0) >= 30,  },
  {
    id: "badge_streak_100",
    name: "100-Day Streak",
    desc: "The legendary century.",
    tier: "platinum",
    art: `
      <!-- Authentic fire-emoji silhouette, full size like 7/30 day -->
      <g class="bg-flame" style="transform-origin: 100px 180px;">
        <path d="M 60.8 77.2 C 58.5 79.6 47.4 91 44.1 108.3 C 43.3 112.7 42.9 117.5 43.4 122.7 C 45.5 148 61.4 179.7 103.6 180 C 123 179.7 95.8 146.1 89.9 133.4 C 84 120.8 71.1 110.6 71.1 110.6 C 71.1 110.6 64.3 97.7 65.7 77.7 C 65.7 73.7 63.8 74.2 60.8 77.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <path d="M 126.4 98.2 C 126.4 98.2 86.7 177.7 103.5 180 C 120.3 182.3 145.3 173 156.6 146.2 C 162.3 132.9 159.8 120.6 156.4 112.1 C 153.8 105.4 150.5 101.1 150.2 100.3 C 149.4 98.7 145.1 95.6 145.2 99.5 C 145.3 102.9 141.6 107.3 136.1 107.5 C 129.7 107.6 126.4 98.2 126.4 98.2 Z"
              fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <g transform="translate(-30 12.5) scale(1.3)"><path d="M 88.6 32 C 85.6 32 85.1 33.6 86.9 35.5 C 90.4 39 103.4 54.7 84.5 72.6 C 73.8 82.8 70.4 92.9 69.6 100.2 C 68.8 107 70.4 111.5 70.4 111.5 C 70.4 111.5 121.1 117.8 121.1 117.8 C 121.1 117.8 121.7 117.2 122.6 115.8 C 123.3 114.4 124.4 112.5 125.4 109.9 C 128.3 102.8 131.4 90.7 130.5 72.4 C 128.7 32.3 91.5 32 88.6 32 Z"
              fill="#ff8a3d"/></g>
        <path d="M 108.6 86.2 C 96.5 95.5 92.2 104.1 88.6 116.9 C 84.9 129.7 90.7 134.3 91.4 138.6 C 92.1 142.9 89.6 144.6 86.9 143.5 C 83.4 142.1 80.1 137.1 79.1 133.6 C 78.2 130.1 76.7 133.3 76.7 133.3 C 76.7 133.3 73.8 138.2 72.7 145.8 C 69.9 162.6 81.7 176.8 103 177.6 C 124.2 178.4 129.5 161 130.3 158.3 C 131.1 155.6 135.1 143.5 118.7 127.1 C 102.3 110.7 109 93.9 111.7 87.4 C 114.4 81 111 84.2 108.6 86.2 Z"
              fill="#ffd14a"/>
      </g>
      <!-- big day number overlaid -->
      <text x="100" y="152" text-anchor="middle" font-family="ui-sans-serif, system-ui"
            font-weight="900" font-size="28" fill="#c43d2a"
            stroke="#fff7d0" stroke-width="3.5" paint-order="stroke fill">100</text>
      <!-- embers (legendary) -->
      <g class="bg-ember"><circle cx="126" cy="82" r="2.8" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="1.2"/></g>
      <g class="bg-ember e2"><circle cx="74" cy="96" r="2.4" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/></g>
      <g class="bg-ember e3"><circle cx="112" cy="68" r="2" fill="#fff7d0" stroke="#1a1a1a" stroke-width="1"/></g>
    `,
    earns: (s) => (s.streak_days ?? 0) >= 100,  },
  {
    id: "badge_early_bird",
    name: "Early Bird",
    desc: "Read before 8am, 5 days.",
    tier: "bronze",
    art: `
      <!-- full circular sun, rays all around -->
      <g class="bg-spin" style="transform-origin: 100px 100px;">
        <g stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round">
          <!-- 12 rays every 30° around (100,100), inner r=44 → outer r=58 -->
          <line x1="100" y1="56"  x2="100" y2="42"/>
          <line x1="122" y1="62"  x2="129" y2="50"/>
          <line x1="138" y1="78"  x2="150" y2="71"/>
          <line x1="144" y1="100" x2="158" y2="100"/>
          <line x1="138" y1="122" x2="150" y2="129"/>
          <line x1="122" y1="138" x2="129" y2="150"/>
          <line x1="100" y1="144" x2="100" y2="158"/>
          <line x1="78"  y1="138" x2="71"  y2="150"/>
          <line x1="62"  y1="122" x2="50"  y2="129"/>
          <line x1="56"  y1="100" x2="42"  y2="100"/>
          <line x1="62"  y1="78"  x2="50"  y2="71"/>
          <line x1="78"  y1="62"  x2="71"  y2="50"/>
        </g>
      </g>
      <!-- full sun disc -->
      <circle cx="100" cy="100" r="34" fill="#ffd14a" stroke="#1a1a1a" stroke-width="4"/>
      <!-- happy sun face -->
      <circle cx="88" cy="96" r="2.8" fill="#1a1a1a"/>
      <circle cx="112" cy="96" r="2.8" fill="#1a1a1a"/>
      <path d="M 88 106 Q 100 116 112 106" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- cheek dabs -->
      <circle cx="78" cy="104" r="3" fill="#ee5b85" opacity=".65"/>
      <circle cx="122" cy="104" r="3" fill="#ee5b85" opacity=".65"/>

      <!-- tiny open book on the bottom (grass-less) -->
      <path d="M 68 168 Q 84 160 100 164 L 100 184 Q 84 180 68 186 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 132 168 Q 116 160 100 164 L 100 184 Q 116 180 132 186 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <g stroke="#9aa4b0" stroke-width="1.6" stroke-linecap="round">
        <line x1="74" y1="172" x2="92" y2="172"/><line x1="74" y1="178" x2="92" y2="178"/>
        <line x1="108" y1="172" x2="126" y2="172"/><line x1="108" y1="178" x2="126" y2="178"/>
      </g>
    `,
  },
  {
    id: "badge_night_owl",
    name: "Night Owl",
    desc: "Read after dark, 5 days.",
    tier: "silver",
    art: `
      <!-- night-sky tint inside the medal -->
      <circle cx="100" cy="112" r="60" fill="#2a3490" opacity=".22"/>
      <!-- crescent moon in top-right corner -->
      <path d="M 164 62 A 16 16 0 1 0 164 90 A 13 13 0 0 1 164 62 Z"
            fill="#fff7d0" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- moon craters -->
      <circle cx="150" cy="72" r="2" fill="#e6b332" opacity=".55"/>
      <circle cx="148" cy="82" r="1.5" fill="#e6b332" opacity=".55"/>
      <circle cx="156" cy="86" r="1.2" fill="#e6b332" opacity=".55"/>
      <!-- stars scattered in the night -->
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.3" stroke-linejoin="round">
        <path d="M 42 78  l 1.6 4 l 4 1 l -4 1 l -1.6 4 l -1.6 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 56 130 l 1.3 3.5 l 3.5 .8 l -3.5 .8 l -1.3 3.5 l -1.3 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
        <path d="M 162 134 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
        <path d="M 34 108 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
      </g>

      <!-- branch (perch) -->
      <path d="M 48 172 Q 100 178 154 170" stroke="#5a3a16" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 48 172 Q 100 178 154 170" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- tiny leaf sprig -->
      <path d="M 54 164 Q 46 156 54 152 Q 64 156 54 164 Z" fill="#5db657" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- OWL body -->
      <path d="M 62 124
               C 62 96 78 78 100 78
               C 122 78 138 96 138 124
               C 138 156 122 168 100 168
               C 78 168 62 156 62 124 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- ear tufts: angled triangular peaks at the corners of the head,
           pointing outward and up (like horned-owl tufts) -->
      <path d="M 70 96 L 60 60 L 82 80 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 130 96 L 140 60 L 118 80 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- inner-ear shading (smaller triangle inside each tuft) -->
      <path d="M 73 92 L 65 68 L 78 80 Z" fill="#7a4a25"/>
      <path d="M 127 92 L 135 68 L 122 80 Z" fill="#7a4a25"/>
      <!-- belly (lighter cream) -->
      <ellipse cx="100" cy="138" rx="22" ry="26" fill="#e6b27a"/>
      <!-- belly feather chevrons -->
      <g stroke="#9c6a3f" stroke-width="1.6" fill="none" stroke-linecap="round">
        <path d="M 86 130 Q 92 134 88 138"/>
        <path d="M 100 130 Q 106 134 102 138"/>
        <path d="M 114 130 Q 120 134 116 138"/>
        <path d="M 92 148 Q 98 152 94 156"/>
        <path d="M 108 148 Q 114 152 110 156"/>
      </g>
      <!-- wing edges (curving down on each side) -->
      <path d="M 66 124 Q 72 144 76 162" stroke="#7a4a25" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 134 124 Q 128 144 124 162" stroke="#7a4a25" stroke-width="2.5" fill="none" stroke-linecap="round"/>

      <!-- big eyes (white disc + yellow iris + black pupil) -->
      <circle cx="84" cy="112" r="13" fill="#fafafa" stroke="#1a1a1a" stroke-width="3.5"/>
      <circle cx="116" cy="112" r="13" fill="#fafafa" stroke="#1a1a1a" stroke-width="3.5"/>
      <circle cx="84" cy="112" r="8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="116" cy="112" r="8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="86" cy="113" r="4" fill="#1a1a1a"/>
      <circle cx="118" cy="113" r="4" fill="#1a1a1a"/>
      <circle cx="87" cy="111.5" r="1.4" fill="#fff"/>
      <circle cx="119" cy="111.5" r="1.4" fill="#fff"/>

      <!-- beak -->
      <path d="M 96 124 L 100 134 L 104 124 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- talons gripping the branch -->
      <g stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M 86 168 L 84 178"/>
        <path d="M 92 168 L 92 178"/>
        <path d="M 108 168 L 108 178"/>
        <path d="M 114 168 L 116 178"/>
      </g>
    `,
  },
  {
    id: "badge_grade_k",
    name: "Kindergarten Hero",
    desc: "Complete Kindergarten reading.",
    tier: "gold",
    art: `
      
    <!-- twin ribbon tails -->
    <path d="M 64 134 L 50 196 L 80 186 Z" fill="#ee5b85" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 136 134 L 150 196 L 120 186 Z" fill="#ee5b85" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- inner big medal disc -->
    <circle cx="100" cy="106" r="52" fill="#fff0b0" stroke="#1a1a1a" stroke-width="4"/>
    <circle cx="100" cy="106" r="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
    <!-- SHINE -->
    <path d="M 78 86 Q 64 100 68 124" stroke="#fff7d0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M 88 80 Q 80 84 76 92" stroke="#fff7d0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- twinkle stars -->
    <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round">
      <path d="M 128 80 l 1.4 3.5 l 3.5 .8 l -3.5 .8 l -1.4 3.5 l -1.4 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
      <path d="M 134 130 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
    </g>
    <!-- laurel branches -->
    <g stroke="#5db657" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M 64 92 Q 60 106 70 124"/>
      <path d="M 136 92 Q 140 106 130 124"/>
    </g>
    <g fill="#5db657" stroke="#1a1a1a" stroke-width="1.5">
      <ellipse cx="60" cy="98"  rx="5" ry="3" transform="rotate(-30 60 98)"/>
      <ellipse cx="58" cy="110" rx="5" ry="3" transform="rotate(-10 58 110)"/>
      <ellipse cx="64" cy="122" rx="5" ry="3" transform="rotate(20 64 122)"/>
      <ellipse cx="140" cy="98"  rx="5" ry="3" transform="rotate(30 140 98)"/>
      <ellipse cx="142" cy="110" rx="5" ry="3" transform="rotate(10 142 110)"/>
      <ellipse cx="136" cy="122" rx="5" ry="3" transform="rotate(-20 136 122)"/>
    </g>
    <!-- big number/letter -->
    <text x="100" y="120" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="42" fill="#ee5b85" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke fill">K</text>
  
    `,
    earns: (s) => s.grade_finished === true && s.finished_grade === "kindergarten",  },
  {
    id: "badge_grade_1",
    name: "Grade 1 Complete",
    desc: "Finish all of Grade 1.",
    tier: "gold",
    art: `
      
    <!-- twin ribbon tails -->
    <path d="M 64 134 L 50 196 L 80 186 Z" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 136 134 L 150 196 L 120 186 Z" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- inner big medal disc -->
    <circle cx="100" cy="106" r="52" fill="#fff0b0" stroke="#1a1a1a" stroke-width="4"/>
    <circle cx="100" cy="106" r="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
    <!-- SHINE -->
    <path d="M 78 86 Q 64 100 68 124" stroke="#fff7d0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M 88 80 Q 80 84 76 92" stroke="#fff7d0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- twinkle stars -->
    <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round">
      <path d="M 128 80 l 1.4 3.5 l 3.5 .8 l -3.5 .8 l -1.4 3.5 l -1.4 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
      <path d="M 134 130 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
    </g>
    <!-- laurel branches -->
    <g stroke="#5db657" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M 64 92 Q 60 106 70 124"/>
      <path d="M 136 92 Q 140 106 130 124"/>
    </g>
    <g fill="#5db657" stroke="#1a1a1a" stroke-width="1.5">
      <ellipse cx="60" cy="98"  rx="5" ry="3" transform="rotate(-30 60 98)"/>
      <ellipse cx="58" cy="110" rx="5" ry="3" transform="rotate(-10 58 110)"/>
      <ellipse cx="64" cy="122" rx="5" ry="3" transform="rotate(20 64 122)"/>
      <ellipse cx="140" cy="98"  rx="5" ry="3" transform="rotate(30 140 98)"/>
      <ellipse cx="142" cy="110" rx="5" ry="3" transform="rotate(10 142 110)"/>
      <ellipse cx="136" cy="122" rx="5" ry="3" transform="rotate(-20 136 122)"/>
    </g>
    <!-- big number/letter -->
    <text x="100" y="120" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="42" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke fill">1</text>
  
    `,
    earns: (s) => s.grade_finished === true && s.finished_grade === "1st",  },
  {
    id: "badge_grade_2",
    name: "Grade 2 Complete",
    desc: "Finish all of Grade 2.",
    tier: "gold",
    art: `
      
    <!-- twin ribbon tails -->
    <path d="M 64 134 L 50 196 L 80 186 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 136 134 L 150 196 L 120 186 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- inner big medal disc -->
    <circle cx="100" cy="106" r="52" fill="#fff0b0" stroke="#1a1a1a" stroke-width="4"/>
    <circle cx="100" cy="106" r="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
    <!-- SHINE -->
    <path d="M 78 86 Q 64 100 68 124" stroke="#fff7d0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M 88 80 Q 80 84 76 92" stroke="#fff7d0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- twinkle stars -->
    <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round">
      <path d="M 128 80 l 1.4 3.5 l 3.5 .8 l -3.5 .8 l -1.4 3.5 l -1.4 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
      <path d="M 134 130 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
    </g>
    <!-- laurel branches -->
    <g stroke="#5db657" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M 64 92 Q 60 106 70 124"/>
      <path d="M 136 92 Q 140 106 130 124"/>
    </g>
    <g fill="#5db657" stroke="#1a1a1a" stroke-width="1.5">
      <ellipse cx="60" cy="98"  rx="5" ry="3" transform="rotate(-30 60 98)"/>
      <ellipse cx="58" cy="110" rx="5" ry="3" transform="rotate(-10 58 110)"/>
      <ellipse cx="64" cy="122" rx="5" ry="3" transform="rotate(20 64 122)"/>
      <ellipse cx="140" cy="98"  rx="5" ry="3" transform="rotate(30 140 98)"/>
      <ellipse cx="142" cy="110" rx="5" ry="3" transform="rotate(10 142 110)"/>
      <ellipse cx="136" cy="122" rx="5" ry="3" transform="rotate(-20 136 122)"/>
    </g>
    <!-- big number/letter -->
    <text x="100" y="120" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke fill">2</text>
  
    `,
    earns: (s) => s.grade_finished === true && s.finished_grade === "2nd",  },
  {
    id: "badge_grade_3",
    name: "Grade 3 Complete",
    desc: "Finish all of Grade 3.",
    tier: "gold",
    art: `
      
    <!-- twin ribbon tails -->
    <path d="M 64 134 L 50 196 L 80 186 Z" fill="#5db657" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 136 134 L 150 196 L 120 186 Z" fill="#5db657" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- inner big medal disc -->
    <circle cx="100" cy="106" r="52" fill="#fff0b0" stroke="#1a1a1a" stroke-width="4"/>
    <circle cx="100" cy="106" r="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
    <!-- SHINE -->
    <path d="M 78 86 Q 64 100 68 124" stroke="#fff7d0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M 88 80 Q 80 84 76 92" stroke="#fff7d0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- twinkle stars -->
    <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round">
      <path d="M 128 80 l 1.4 3.5 l 3.5 .8 l -3.5 .8 l -1.4 3.5 l -1.4 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
      <path d="M 134 130 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
    </g>
    <!-- laurel branches -->
    <g stroke="#5db657" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M 64 92 Q 60 106 70 124"/>
      <path d="M 136 92 Q 140 106 130 124"/>
    </g>
    <g fill="#5db657" stroke="#1a1a1a" stroke-width="1.5">
      <ellipse cx="60" cy="98"  rx="5" ry="3" transform="rotate(-30 60 98)"/>
      <ellipse cx="58" cy="110" rx="5" ry="3" transform="rotate(-10 58 110)"/>
      <ellipse cx="64" cy="122" rx="5" ry="3" transform="rotate(20 64 122)"/>
      <ellipse cx="140" cy="98"  rx="5" ry="3" transform="rotate(30 140 98)"/>
      <ellipse cx="142" cy="110" rx="5" ry="3" transform="rotate(10 142 110)"/>
      <ellipse cx="136" cy="122" rx="5" ry="3" transform="rotate(-20 136 122)"/>
    </g>
    <!-- big number/letter -->
    <text x="100" y="120" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="42" fill="#5db657" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke fill">3</text>
  
    `,
    earns: (s) => s.grade_finished === true && s.finished_grade === "3rd",  },
  {
    id: "badge_grade_4",
    name: "Grade 4 Complete",
    desc: "Finish all of Grade 4.",
    tier: "gold",
    art: `
      
    <!-- twin ribbon tails -->
    <path d="M 64 134 L 50 196 L 80 186 Z" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 136 134 L 150 196 L 120 186 Z" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- inner big medal disc -->
    <circle cx="100" cy="106" r="52" fill="#fff0b0" stroke="#1a1a1a" stroke-width="4"/>
    <circle cx="100" cy="106" r="42" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
    <!-- SHINE -->
    <path d="M 78 86 Q 64 100 68 124" stroke="#fff7d0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M 88 80 Q 80 84 76 92" stroke="#fff7d0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- twinkle stars -->
    <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round">
      <path d="M 128 80 l 1.4 3.5 l 3.5 .8 l -3.5 .8 l -1.4 3.5 l -1.4 -3.5 l -3.5 -.8 l 3.5 -.8 z"/>
      <path d="M 134 130 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
    </g>
    <!-- laurel branches -->
    <g stroke="#5db657" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M 64 92 Q 60 106 70 124"/>
      <path d="M 136 92 Q 140 106 130 124"/>
    </g>
    <g fill="#5db657" stroke="#1a1a1a" stroke-width="1.5">
      <ellipse cx="60" cy="98"  rx="5" ry="3" transform="rotate(-30 60 98)"/>
      <ellipse cx="58" cy="110" rx="5" ry="3" transform="rotate(-10 58 110)"/>
      <ellipse cx="64" cy="122" rx="5" ry="3" transform="rotate(20 64 122)"/>
      <ellipse cx="140" cy="98"  rx="5" ry="3" transform="rotate(30 140 98)"/>
      <ellipse cx="142" cy="110" rx="5" ry="3" transform="rotate(10 142 110)"/>
      <ellipse cx="136" cy="122" rx="5" ry="3" transform="rotate(-20 136 122)"/>
    </g>
    <!-- big number/letter -->
    <text x="100" y="120" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="42" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke fill">4</text>
  
    `,
    earns: (s) => s.grade_finished === true && s.finished_grade === "4th",  },
  {
    id: "badge_gold_star",
    name: "Gold Star",
    desc: "A perfect lesson.",
    tier: "gold",
    art: `
      <g class="bg-pulse" style="transform-origin: 100px 110px;">
        <path d="M 100 38 L 116 80 L 162 84 L 128 114 L 138 158 L 100 134 L 62 158 L 72 114 L 38 84 L 84 80 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <!-- soft inner shine -->
        <path d="M 100 56 L 112 84 L 142 86 L 120 104" fill="none" stroke="#fff7d0" stroke-width="4" stroke-linecap="round"/>
      </g>
      <!-- happy face on star -->
      <g>
        <circle cx="88"  cy="108" r="3.2" fill="#1a1a1a"/>
        <circle cx="112" cy="108" r="3.2" fill="#1a1a1a"/>
        <circle cx="89"  cy="106.5" r="1" fill="#fff"/>
        <circle cx="113" cy="106.5" r="1" fill="#fff"/>
        <path d="M 86 122 Q 100 132 114 122" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="76" cy="118" r="3.5" fill="#ee5b85" opacity=".7"/>
        <circle cx="124" cy="118" r="3.5" fill="#ee5b85" opacity=".7"/>
      </g>
    `,
    earns: (s) => s.consecutive_correct !== undefined && s.consecutive_correct >= 10,  },
  {
    id: "badge_phonics_pro",
    name: "Phonics Pro",
    desc: "Master every sound.",
    tier: "bronze",
    art: `
      <!-- three alphabet blocks A B C -->
      <g stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round">
        <g transform="rotate(-8 64 130)">
          <rect x="42" y="104" width="44" height="44" rx="4" fill="#ee5b85"/>
          <rect x="42" y="104" width="44" height="10" fill="#c43d2a"/>
          <text x="64" y="142" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="28" fill="#fafafa">A</text>
        </g>
        <g>
          <rect x="78" y="92" width="46" height="46" rx="4" fill="#ffd14a"/>
          <rect x="78" y="92" width="46" height="10" fill="#e6b332"/>
          <text x="101" y="132" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="30" fill="#1a1a1a">B</text>
        </g>
        <g transform="rotate(7 138 128)">
          <rect x="116" y="104" width="44" height="44" rx="4" fill="#3a6cd8"/>
          <rect x="116" y="104" width="44" height="10" fill="#2a4878"/>
          <text x="138" y="142" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="28" fill="#fafafa">C</text>
        </g>
      </g>
      <!-- sound waves coming off -->
      <g stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M 50 70 Q 60 78 50 86"/>
        <path d="M 150 70 Q 140 78 150 86"/>
      </g>
    `,
  },
  {
    id: "badge_word_wizard",
    name: "Word Wizard",
    desc: "Spell 50 tricky words.",
    tier: "silver",
    art: `
      <!-- WIZARD CHARACTER: pointed hat OVER head (brim comes down over forehead) -->

      <!-- 1. cone of the hat (behind everything else on the head) -->
      <path d="M 100 30 L 144 124 L 56 124 Z"
            fill="#4a3bcc" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- big star on hat -->
      <g class="bg-pulse" style="transform-origin: 100px 66px;">
        <path d="M 100 52 l 3 8 l 8 1 l -6 6 l 2 8 l -7 -4 l -7 4 l 2 -8 l -6 -6 l 8 -1 z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
      </g>
      <!-- small stars sprinkled on the cone -->
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.3" stroke-linejoin="round">
        <path d="M 84 96 l 1.4 4 l 4 1 l -4 1 l -1.4 4 l -1.4 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 116 100 l 1.4 4 l 4 1 l -4 1 l -1.4 4 l -1.4 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 94 110 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
      </g>

      <!-- 2. FACE (bigger, drawn AFTER cone so it shows under the brim) -->
      <ellipse cx="100" cy="140" rx="24" ry="18" fill="#f5d3a0" stroke="#1a1a1a" stroke-width="3"/>

      <!-- 3. HAT BRIM — drawn LAST so it sits OVER the top of the face -->
      <path d="M 52 122 Q 100 140 148 122 L 146 134 Q 100 152 54 134 Z"
            fill="#2a3490" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- brim highlight -->
      <path d="M 60 126 Q 100 142 140 126" stroke="#5a4ad8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>

      <!-- eyes (drawn after brim, but positioned below it on the face) -->
      <circle cx="91" cy="140" r="2.4" fill="#1a1a1a"/>
      <circle cx="109" cy="140" r="2.4" fill="#1a1a1a"/>
      <!-- cheek dabs -->
      <circle cx="83" cy="148" r="3" fill="#ee5b85" opacity=".75"/>
      <circle cx="117" cy="148" r="3" fill="#ee5b85" opacity=".75"/>
      <!-- nose -->
      <path d="M 98 148 Q 100 152 102 148" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>

      <!-- big white beard cascading down from chin -->
      <path d="M 80 150
               Q 72 168 82 184
               Q 96 188 100 186
               Q 104 188 118 184
               Q 128 168 120 150
               Q 110 158 100 158
               Q 90 158 80 150 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- mustache curls -->
      <path d="M 86 154 Q 95 158 100 156 Q 105 158 114 154" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- beard texture lines -->
      <g stroke="#cfd5dd" stroke-width="1.8" fill="none" stroke-linecap="round">
        <path d="M 92 168 Q 90 176 92 184"/>
        <path d="M 100 170 Q 100 178 100 186"/>
        <path d="M 108 168 Q 110 176 108 184"/>
      </g>

      <!-- magic wand from beard area up to top-right -->
      <line x1="128" y1="168" x2="172" y2="108" stroke="#5a3a16" stroke-width="6" stroke-linecap="round"/>
      <line x1="128" y1="168" x2="172" y2="108" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
      <!-- wand silver tip -->
      <line x1="166" y1="116" x2="172" y2="108" stroke="#cfd5dd" stroke-width="5" stroke-linecap="round"/>
      <line x1="166" y1="116" x2="172" y2="108" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
      <!-- magic burst at wand tip -->
      <g class="bg-pulse" style="transform-origin: 178px 100px;">
        <path d="M 178 84 l 3 9 l 9 1 l -7 6 l 2 9 l -7 -4 l -7 4 l 2 -9 l -7 -6 l 9 -1 z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
        <text x="178" y="104" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="10" fill="#1a1a1a">W</text>
      </g>
      <!-- spell spark -->
      <g fill="#fafafa" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round">
        <path d="M 36 140 l 1.2 3 l 3 .8 l -3 .8 l -1.2 3 l -1.2 -3 l -3 -.8 l 3 -.8 z"/>
      </g>
    `,
  },
  {
    id: "badge_spelling_bee",
    name: "Spelling Bee",
    desc: "Win a spelling round.",
    tier: "gold",
    art: `
      <!-- WINGS (behind body, lowered) -->
      <ellipse cx="66" cy="108" rx="24" ry="15" fill="#cfe4ff" fill-opacity=".85" stroke="#1a1a1a" stroke-width="3" transform="rotate(-30 66 108)"/>
      <ellipse cx="134" cy="108" rx="24" ry="15" fill="#cfe4ff" fill-opacity=".85" stroke="#1a1a1a" stroke-width="3" transform="rotate(30 134 108)"/>

      <!-- BEE BODY: chubby round oval -->
      <ellipse cx="100" cy="124" rx="40" ry="34" fill="#ffd14a" stroke="#1a1a1a" stroke-width="4"/>
      <!-- 2 black stripes leaving the middle clear for the face -->
      <defs>
        <clipPath id="bee-clip">
          <ellipse cx="100" cy="124" rx="40" ry="34"/>
        </clipPath>
      </defs>
      <g clip-path="url(#bee-clip)" fill="#1a1a1a">
        <ellipse cx="100" cy="100" rx="44" ry="5"/>
        <ellipse cx="100" cy="148" rx="44" ry="5"/>
      </g>
      <!-- re-stroke body outline -->
      <ellipse cx="100" cy="124" rx="40" ry="34" fill="none" stroke="#1a1a1a" stroke-width="4"/>

      <!-- antennae -->
      <path d="M 90 98 Q 82 78 76 70" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 110 98 Q 118 78 124 70" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="76" cy="68" r="4" fill="#1a1a1a"/>
      <circle cx="124" cy="68" r="4" fill="#1a1a1a"/>

      <!-- FACE (in the middle yellow band) -->
      <!-- big cute eyes -->
      <circle cx="88" cy="120" r="6" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="112" cy="120" r="6" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="89" cy="121" r="2.6" fill="#1a1a1a"/>
      <circle cx="113" cy="121" r="2.6" fill="#1a1a1a"/>
      <circle cx="90" cy="119.5" r="1" fill="#fff"/>
      <circle cx="114" cy="119.5" r="1" fill="#fff"/>
      <!-- smile -->
      <path d="M 90 134 Q 100 142 110 134" stroke="#1a1a1a" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <!-- cheek dabs -->
      <circle cx="76" cy="128" r="3.2" fill="#ee5b85" opacity=".75"/>
      <circle cx="124" cy="128" r="3.2" fill="#ee5b85" opacity=".75"/>
    `,
  },
  {
    id: "badge_perfect_score",
    name: "Perfect Score",
    desc: "A flawless quiz.",
    tier: "platinum",
    art: `
      <!-- bullseye target -->
      <circle cx="100" cy="112" r="58" fill="#fafafa" stroke="#1a1a1a" stroke-width="4"/>
      <circle cx="100" cy="112" r="46" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="100" cy="112" r="34" fill="#fafafa" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="100" cy="112" r="22" fill="#e8503a" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="100" cy="112" r="10" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
      <!-- arrow stuck in bullseye — shaft buried in target, fletching symmetric around tail -->
      <g>
        <!-- shaft: from top-right (tail) into the bullseye center -->
        <line x1="170" y1="54" x2="108" y2="112" stroke="#5a3a16" stroke-width="6" stroke-linecap="round"/>
        <line x1="170" y1="54" x2="108" y2="112" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- fletching: 2 feathers MIRRORED around the shaft axis at the tail.
             Shaft direction at tail (outward) ≈ (0.73, -0.68); perpendicular ≈ (0.68, 0.73).
             Each feather: tip 18 units out from tail along shaft, base 10 units perpendicular. -->
        <!-- upper-left feather (above shaft) -->
        <path d="M 170 54 L 183 42 L 163 47 Z"
              fill="#ee5b85" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <!-- lower-right feather (below shaft) -->
        <path d="M 170 54 L 183 42 L 177 61 Z"
              fill="#fafafa" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <!-- nock notch detail at very tip -->
        <line x1="183" y1="42" x2="187" y2="38" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
      </g>
      <!-- "100%" tag below -->
      <g>
        <rect x="58" y="178" width="84" height="22" rx="11" fill="#1a1a1a"/>
        <text x="100" y="194" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="14" fill="#ffd14a" letter-spacing="1">100%</text>
      </g>
    `,
    earns: (s) => s.perfect_sessions !== undefined && s.perfect_sessions >= 1,  },
  {
    id: "badge_quiz_champion",
    name: "Quiz Champion",
    desc: "Win 10 quizzes in a row.",
    tier: "gold",
    art: `
      <!-- ribbon rosette base -->
      <g stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round">
        <path d="M 70 140 L 50 196 L 80 184 Z" fill="#3a6cd8"/>
        <path d="M 130 140 L 150 196 L 120 184 Z" fill="#3a6cd8"/>
      </g>
      <!-- rosette petals -->
      <g stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round" fill="#ffd14a">
        <circle cx="100" cy="60" r="14"/>
        <circle cx="66"  cy="74" r="14"/>
        <circle cx="46"  cy="106" r="14"/>
        <circle cx="56"  cy="138" r="14"/>
        <circle cx="134" cy="74" r="14"/>
        <circle cx="154" cy="106" r="14"/>
        <circle cx="144" cy="138" r="14"/>
        <circle cx="100" cy="148" r="14"/>
      </g>
      <!-- center disc with check -->
      <circle cx="100" cy="106" r="34" fill="#fafafa" stroke="#1a1a1a" stroke-width="4"/>
      <path d="M 84 108 L 96 120 L 118 92" stroke="#5db657" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    earns: (s) => (s.perfect_sessions ?? 0) >= 10,  },
  {
    id: "badge_reading_rocket",
    name: "Reading Rocket",
    desc: "Level up two grades fast.",
    tier: "platinum",
    art: `
      <!-- rocket body (book-shaped) -->
      <g>
        <!-- nose cone -->
        <path d="M 100 42 L 124 88 L 76 88 Z" fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
        <!-- main body shaped like a book -->
        <rect x="74" y="88" width="52" height="68" fill="#fafafa" stroke="#1a1a1a" stroke-width="4"/>
        <rect x="74" y="88" width="52" height="14" fill="#3a6cd8"/>
        <text x="100" y="100" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="11" fill="#fafafa">READ</text>
        <line x1="100" y1="102" x2="100" y2="156" stroke="#1a1a1a" stroke-width="3"/>
        <g stroke="#9aa4b0" stroke-width="2" stroke-linecap="round">
          <line x1="80" y1="114" x2="94" y2="114"/><line x1="80" y1="124" x2="94" y2="124"/><line x1="80" y1="134" x2="94" y2="134"/><line x1="80" y1="144" x2="94" y2="144"/>
          <line x1="106" y1="114" x2="120" y2="114"/><line x1="106" y1="124" x2="120" y2="124"/><line x1="106" y1="134" x2="120" y2="134"/><line x1="106" y1="144" x2="120" y2="144"/>
        </g>
        <!-- porthole window -->
        <circle cx="100" cy="74" r="6" fill="#b8e0ff" stroke="#1a1a1a" stroke-width="2.5"/>
        <!-- fins -->
        <path d="M 74 134 L 56 168 L 74 156 Z" fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M 126 134 L 144 168 L 126 156 Z" fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      </g>
      <!-- exhaust: tapered jet anchored at book base (y=156). bg-jet uses
           scaleY only (no rotation) so the base stays locked to the rocket. -->
      <g class="bg-jet">
        <!-- outer red exhaust -->
        <path d="M 78 156
                 C 76 168 70 180 78 192
                 C 86 200 96 202 100 202
                 C 104 202 114 200 122 192
                 C 130 180 124 168 122 156 Z"
              fill="#c43d2a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
        <!-- mid orange -->
        <path d="M 86 156
                 C 84 166 82 178 88 188
                 C 92 194 100 196 100 196
                 C 100 196 108 194 112 188
                 C 118 178 116 166 114 156 Z"
              fill="#ff8a3d" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
        <!-- yellow inner -->
        <path d="M 92 156
                 C 92 166 90 176 94 184
                 C 96 188 100 188 100 188
                 C 100 188 104 188 106 184
                 C 110 176 108 166 108 156 Z"
              fill="#ffd14a"/>
        <!-- white-hot core -->
        <path d="M 96 156 C 96 168 100 176 100 180 C 100 176 104 168 104 156 Z" fill="#fff7d0"/>
      </g>
    `,
  },
  {
    id: "badge_comeback_kid",
    name: "Comeback Kid",
    desc: "Try again and nail it.",
    tier: "silver",
    art: `
      <!-- upward arrow path behind the star -->
      <g>
        <path d="M 50 162 Q 60 130 92 122 Q 124 116 140 88 Q 152 70 156 50"
              fill="none" stroke="#5db657" stroke-width="9" stroke-linecap="round"/>
        <path d="M 50 162 Q 60 130 92 122 Q 124 116 140 88 Q 152 70 156 50"
              fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
        <!-- arrowhead -->
        <path d="M 146 38 L 168 42 L 162 64 Z" fill="#5db657" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      </g>
      <!-- determined star -->
      <g class="bg-pulse" style="transform-origin: 84px 138px;">
        <path d="M 84 108 L 92 130 L 116 132 L 98 146 L 104 168 L 84 156 L 64 168 L 70 146 L 52 132 L 76 130 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="78" cy="140" r="2.6" fill="#1a1a1a"/>
        <circle cx="90" cy="140" r="2.6" fill="#1a1a1a"/>
        <!-- determined eyebrow -->
        <path d="M 74 134 L 82 136" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 86 136 L 94 134" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 76 150 Q 84 154 92 150" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>
    `,
  },
  {
    id: "badge_library_master",
    name: "Library Master",
    desc: "Visit all the genres.",
    tier: "silver",
    art: `
      <!-- columned library facade -->
      <!-- roof triangle -->
      <path d="M 46 84 L 100 50 L 154 84 Z" fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- frieze bar -->
      <rect x="44" y="82" width="112" height="10" fill="#fafafa" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- columns -->
      <g stroke="#1a1a1a" stroke-width="3.5">
        <rect x="52"  y="92" width="14" height="58" fill="#fafafa"/>
        <rect x="80"  y="92" width="14" height="58" fill="#fafafa"/>
        <rect x="108" y="92" width="14" height="58" fill="#fafafa"/>
        <rect x="134" y="92" width="14" height="58" fill="#fafafa"/>
      </g>
      <g stroke="#9aa4b0" stroke-width="1.6" opacity=".7" stroke-linecap="round">
        <line x1="59" y1="100" x2="59" y2="146"/>
        <line x1="87" y1="100" x2="87" y2="146"/>
        <line x1="115" y1="100" x2="115" y2="146"/>
        <line x1="141" y1="100" x2="141" y2="146"/>
      </g>
      <!-- steps -->
      <rect x="40" y="150" width="120" height="8" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="34" y="158" width="132" height="8" fill="#9aa4b0" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- book on steps -->
      <rect x="86" y="138" width="28" height="14" rx="2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5"/>
      <line x1="100" y1="138" x2="100" y2="152" stroke="#1a1a1a" stroke-width="2"/>
      <!-- key icon top-left (bigger and more recognizable) -->
      <g transform="rotate(-30 36 50)">
        <!-- bow (round handle) -->
        <circle cx="30" cy="50" r="10" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
        <circle cx="30" cy="50" r="4" fill="#9aa4b0" stroke="#1a1a1a" stroke-width="2"/>
        <!-- shaft -->
        <rect x="38" y="46" width="26" height="8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
        <!-- teeth (notches on bottom of shaft) -->
        <rect x="54" y="54" width="4" height="6" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="60" y="54" width="4" height="4" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
    `,
  },
  {
    id: "badge_vocab_vault",
    name: "Vocabulary Vault",
    desc: "Collect 200 new words.",
    tier: "platinum",
    art: `
      <!-- treasure chest -->
      <!-- chest base -->
      <rect x="48" y="118" width="104" height="44" rx="4" fill="#9c6a3f" stroke="#1a1a1a" stroke-width="4"/>
      <rect x="48" y="118" width="104" height="10" fill="#7a4a25"/>
      <!-- chest lid (open, tilted back) -->
      <path d="M 48 118 Q 100 78 152 118 L 152 92 Q 100 60 48 92 Z"
            fill="#c79028" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 48 96 Q 100 76 152 96" stroke="#1a1a1a" stroke-width="2.5" fill="none" opacity=".5"/>
      <!-- gold edges + bands -->
      <g stroke="#1a1a1a" stroke-width="3" fill="#ffd14a">
        <rect x="48" y="138" width="104" height="6"/>
        <rect x="92" y="118" width="16" height="44"/>
      </g>
      <!-- lock -->
      <rect x="94" y="132" width="12" height="14" rx="2" fill="#e6b332" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="100" cy="138" r="1.8" fill="#1a1a1a"/>
      <!-- letter coins spilling out: each one a bright color -->
      <g stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round">
        <circle cx="74"  cy="106" r="11" fill="#e8503a"/>
        <text x="74" y="111" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="14" fill="#fafafa">A</text>
        <circle cx="128" cy="100" r="11" fill="#3a6cd8"/>
        <text x="128" y="105" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="14" fill="#fafafa">B</text>
        <circle cx="148" cy="118" r="9" fill="#5db657"/>
        <text x="148" y="123" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="12" fill="#fafafa">C</text>
        <circle cx="58"  cy="124" r="9" fill="#ee5b85"/>
        <text x="58" y="129" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-weight="900" font-size="12" fill="#fafafa">Z</text>
      </g>
      <!-- shimmer above chest -->
      <g fill="#fff7d0" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round">
        <path d="M 100 50 l 2 6 l 6 1.5 l -6 1.5 l -2 6 l -2 -6 l -6 -1.5 l 6 -1.5 z"/>
        <path d="M 70 64 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 134 70 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
      </g>
    `,
  },
];

export const DEFAULT_BADGE_ID = BADGES[0].id;

export function getBadge(id: string | null | undefined): Badge {
  return BADGES.find((b) => b.id === id) ?? BADGES[0];
}