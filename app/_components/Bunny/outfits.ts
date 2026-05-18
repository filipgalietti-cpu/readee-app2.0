/**
 * 10 collectible bunny outfits. Each entry locks the bunny's base
 * anatomy and only contributes overlay SVG fragments for the
 * back / body / head slots. Slot SVG is raw markup (hyphenated
 * attributes, injected via dangerouslySetInnerHTML), not JSX.
 *
 * Source: Claude Design "Bunny outfits" handoff bundle, May 2026.
 */

export type OutfitRarity = "starter" | "common" | "rare";

/**
 * MilestoneTrigger — the in-app event that unlocks a milestone-drop outfit.
 * Keep these in sync with `lib/unlock/milestones.ts` so a new trigger here
 * also has a check function over there.
 */
export type MilestoneTrigger =
  | "first_lesson_complete"
  | "streak_3_days"
  | "ten_in_a_row_correct"
  | "first_grade_finished"
  | "hundred_correct_total"
  | "streak_365_days";

/**
 * UnlockMethod — how an outfit is obtained.
 *
 * - `free`     — owned at signup (Classic). No purchase row needed.
 * - `shop`     — buyable with carrots. Existing handleBuy() flow.
 * - `milestone`— granted automatically when a behavior signal fires.
 *                Drives the "earn it" excitement that flat catalogs lack.
 * - `seasonal` — granted automatically during a specific month (Halloween,
 *                April Fools, Thanksgiving). Kid keeps it forever once
 *                granted; the *availability* window only matters for the
 *                first grant.
 */
export type UnlockMethod =
  | { type: "free" }
  | { type: "shop"; price: number }
  | { type: "milestone"; trigger: MilestoneTrigger; label: string }
  | { type: "seasonal"; month: number; label: string };

export type Outfit = {
  id: string;
  name: string;
  /** Pastel card background tint. */
  tint: string;
  /** Card border colour (2px). */
  border: string;
  rarity: OutfitRarity;
  /** Cost in carrots if directly buyable. Mirrors `unlock.price` when
   *  `unlock.type === "shop"`; left at 0 for milestone/seasonal/free. */
  price: number;
  /** How the kid obtains this outfit. Source of truth for shop UI gating
   *  and milestone/seasonal grant logic. */
  unlock: UnlockMethod;
  /** Optional minimum reader level required to unlock the price. */
  levelRequired?: number;
  /** Behind-the-bunny overlay (capes, hat tails). */
  back?: string;
  /** Body overlay (shirts, robes, jerseys). */
  body?: string;
  /** Head overlay (hats, glasses, helmets). */
  head?: string;
};

/**
 * Outfit IDs are prefixed `bunny_` so they namespace cleanly alongside
 * other shop slots (avatars, backgrounds, themes) when stored in
 * `children.equipped_items.outfit`.
 */
export const OUTFITS: Outfit[] = [
  {
    id: "bunny_classic",
    name: "Classic Readee",
    tint: "#ECE7FF",
    border: "#C9BEFF",
    rarity: "starter",
    price: 0,
    unlock: { type: "free" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 108 144 Q 120 152 132 144" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
      <text x="120" y="192" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="26" fill="#6E5BFF" stroke="#1a1a1a" stroke-width="1.2" paint-order="stroke fill">R</text>
    `,
  },
  {
    id: "bunny_bookworm",
    name: "Bookworm",
    tint: "#F5EDDE",
    border: "#E6D6B1",
    rarity: "common",
    price: 200,
    unlock: { type: "milestone", trigger: "first_lesson_complete", label: "Finish your first lesson" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#d8a86a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g stroke="#a87440" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 88 168 L 100 162 L 112 168 L 124 162 L 136 168 L 148 162 L 158 168"/>
        <path d="M 86 184 L 98 178 L 110 184 L 122 178 L 134 184 L 146 178 L 158 184"/>
        <path d="M 86 200 L 98 194 L 110 200 L 122 194 L 134 200 L 146 194 L 158 200"/>
      </g>
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z" fill="#a87440" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
    `,
    head: `
      <g stroke="#1a1a1a" stroke-width="3.5" fill="none">
        <circle cx="104" cy="118" r="11" fill="#ffffff" fill-opacity=".35"/>
        <circle cx="136" cy="118" r="11" fill="#ffffff" fill-opacity=".35"/>
        <line x1="115" y1="118" x2="125" y2="118" stroke-linecap="round"/>
        <path d="M 93 118 L 84 116" stroke-linecap="round"/>
        <path d="M 147 118 L 156 116" stroke-linecap="round"/>
      </g>
    `,
  },
  {
    id: "bunny_astronaut",
    name: "Astronaut",
    tint: "#DCEEFF",
    border: "#B8DAF6",
    rarity: "common",
    price: 250,
    unlock: { type: "milestone", trigger: "first_grade_finished", label: "Finish a whole grade" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#f3f5fa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <rect x="82" y="142" width="76" height="10" rx="5" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="102" y="170" width="36" height="24" rx="4" fill="#e8503a" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="111" cy="182" r="2.6" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="120" cy="182" r="2.6" fill="#5db657" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="129" cy="182" r="2.6" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.5"/>
      <path d="M 82 152 Q 76 162 80 174" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    `,
    head: `
      <circle cx="120" cy="118" r="60" fill="#b8e0ff" fill-opacity=".28" stroke="#1a1a1a" stroke-width="4"/>
      <path d="M 84 100 Q 92 84, 112 80" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
      <line x1="120" y1="58" x2="120" y2="48" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="120" cy="46" r="3" fill="#e8503a" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_superhero",
    name: "Superhero",
    tint: "#FFE0DC",
    border: "#FBC0B7",
    rarity: "common",
    price: 250,
    unlock: { type: "milestone", trigger: "ten_in_a_row_correct", label: "Get 10 in a row right" },
    back: `
      <path d="M 86 156 C 100 166 140 166 154 156 L 184 232 Q 120 246 56 232 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 88 162 L 80 230" stroke="#c43d2a" stroke-width="3" fill="none"/>
      <path d="M 152 162 L 160 230" stroke="#c43d2a" stroke-width="3" fill="none"/>
    `,
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 120 168 L 126 180 L 139 182 L 130 191 L 132 204 L 120 198 L 108 204 L 110 191 L 101 182 L 114 180 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
    `,
  },
  {
    id: "bunny_pirate",
    name: "Pirate",
    tint: "#F3E7D2",
    border: "#D9C397",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <defs>
        <clipPath id="pirate-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g clip-path="url(#pirate-body-clip)">
        <rect x="72" y="156" width="100" height="9" fill="#3a6cd8"/>
        <rect x="72" y="176" width="100" height="9" fill="#3a6cd8"/>
        <rect x="72" y="196" width="100" height="9" fill="#3a6cd8"/>
      </g>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
    head: `
      <path d="M 92 102 Q 120 100 152 108" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <rect x="92" y="110" width="26" height="20" rx="4" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <path d="M 78 96 L 162 96 L 158 104 L 82 104 Z" fill="#c43d2a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="100" cy="100" r="2" fill="#ffffff"/>
      <circle cx="140" cy="100" r="2" fill="#ffffff"/>
    `,
  },
  {
    id: "bunny_scientist",
    name: "Scientist",
    tint: "#DDF0E5",
    border: "#B7DDC6",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 104 144 L 120 172 L 136 144" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 102 144 Q 100 160 108 178" fill="none" stroke="#cfd5dd" stroke-width="3"/>
      <path d="M 138 144 Q 140 160 132 178" fill="none" stroke="#cfd5dd" stroke-width="3"/>
      <rect x="86" y="180" width="22" height="20" rx="2" fill="#ffffff" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="95" y="172" width="4" height="14" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="95" y="168" width="4" height="6" fill="#e8503a" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="146" cy="190" r="2" fill="#1a1a1a"/>
    `,
  },
  {
    id: "bunny_royal",
    name: "Royal",
    tint: "#E8D9F5",
    border: "#C7AEE6",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    back: `
      <path d="M 82 156 C 100 168 140 168 158 156 L 192 240 Q 120 252 48 240 Z"
            fill="#7b5fb8" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 82 156 Q 96 166 106 158 Q 113 168 120 158 Q 127 168 134 158 Q 144 166 158 156"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="80" cy="210" r="2" fill="#1a1a1a"/>
      <circle cx="120" cy="220" r="2" fill="#1a1a1a"/>
      <circle cx="160" cy="208" r="2" fill="#1a1a1a"/>
    `,
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="120" cy="170" r="6" fill="#ee5b85" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="120" cy="170" r="2" fill="#fff" opacity=".9"/>
    `,
    head: `
      <path d="M 96 66 L 106 80 L 120 64 L 134 80 L 144 66 L 142 90 L 98 90 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <rect x="96" y="86" width="48" height="6" fill="#e6b332" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="106" cy="80" r="3" fill="#ee5b85" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="120" cy="64" r="3.5" fill="#5db657" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="134" cy="80" r="3" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_soccer",
    name: "Soccer Star",
    tint: "#DCEFDB",
    border: "#A8D2A4",
    rarity: "common",
    price: 250,
    unlock: { type: "milestone", trigger: "streak_3_days", label: "Reach a 3-day streak" },
    body: `
      <defs>
        <clipPath id="soccer-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g clip-path="url(#soccer-body-clip)">
        <rect x="86" y="140" width="9" height="80" fill="#5db657"/>
        <rect x="104" y="140" width="9" height="80" fill="#5db657"/>
        <rect x="122" y="140" width="9" height="80" fill="#5db657"/>
        <rect x="140" y="140" width="9" height="80" fill="#5db657"/>
      </g>
      <path d="M 108 144 L 120 160 L 132 144" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <text x="120" y="200" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#1a1a1a" stroke="#fafafa" stroke-width="2" paint-order="stroke fill">7</text>
    `,
  },
  {
    id: "bunny_wizard",
    name: "Wizard",
    tint: "#C9D2F0",
    border: "#9AA8D8",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#3a4abd" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2">
        <path d="M 96 168 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 142 172 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 108 196 l 1.2 3 l 3 1 l -3 1 l -1.2 3 l -1.2 -3 l -3 -1 l 3 -1 z"/>
        <path d="M 148 200 l 1.2 3 l 3 1 l -3 1 l -1.2 3 l -1.2 -3 l -3 -1 l 3 -1 z"/>
      </g>
      <rect x="80" y="206" width="80" height="6" fill="#2a3490" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <path d="M 120 6 L 174 96 L 66 96 Z" fill="#3a4abd" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 60 92 Q 120 104 180 92 L 180 100 Q 120 112 60 100 Z" fill="#2a3490" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g class="bn-wiz-star" style="transform-origin: 120px 56px;">
        <path d="M 120 38 L 126 52 L 141 53 L 130 63 L 134 78 L 120 70 L 106 78 L 110 63 L 99 53 L 114 52 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      </g>
      <circle cx="148" cy="74" r="1.8" fill="#ffd14a"/>
      <circle cx="92" cy="74" r="1.8" fill="#ffd14a"/>
    `,
  },
  {
    id: "bunny_birthday",
    name: "Birthday",
    tint: "#FFE0EE",
    border: "#F8B7D4",
    rarity: "rare",
    price: 750,
    unlock: { type: "milestone", trigger: "streak_365_days", label: "Reach a 365-day streak" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 108 144 Q 120 152 132 144" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="92" cy="164" r="2.8" fill="#ee5b85" stroke="#1a1a1a" stroke-width="1.2"/>
      <circle cx="146" cy="170" r="2.8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/>
      <circle cx="112" cy="190" r="2.8" fill="#5db657" stroke="#1a1a1a" stroke-width="1.2"/>
      <circle cx="150" cy="196" r="2.5" fill="#6E5BFF" stroke="#1a1a1a" stroke-width="1.2"/>
      <circle cx="88" cy="200" r="2.5" fill="#3a6cd8" stroke="#1a1a1a" stroke-width="1.2"/>
      <rect x="124" y="175" width="8" height="3" rx="1.5" fill="#ee5b85" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(25 128 176)"/>
      <rect x="100" y="174" width="8" height="3" rx="1.5" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(-30 104 175)"/>
      <rect x="130" y="200" width="8" height="3" rx="1.5" fill="#5db657" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(15 134 201)"/>
    `,
    head: `
      <path d="M 120 38 L 142 92 L 98 92 Z" fill="#ee5b85" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="114" cy="78" r="2.5" fill="#ffd14a"/>
      <circle cx="126" cy="68" r="2.5" fill="#ffffff"/>
      <circle cx="120" cy="86" r="2" fill="#5db657"/>
      <circle cx="120" cy="34" r="7" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="117" cy="32" r="2" fill="#fff" opacity=".7"/>
    `,
  },

  // ═══════════════════════════════════════════════════════════════
  // Season 2 — 10 more outfits (May 2026 handoff). 6 common, 4 rare.
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bunny_detective",
    name: "Detective",
    tint: "#F2E4CC",
    border: "#D9C195",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#c8a55f" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 102 144 L 120 178 L 138 144" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 102 144 Q 94 162 104 188" fill="#b89048" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 138 144 Q 146 162 136 188" fill="#b89048" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="108" cy="196" r="2.5" fill="#5a3a16" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="132" cy="196" r="2.5" fill="#5a3a16" stroke="#1a1a1a" stroke-width="1.5"/>
      <rect x="78" y="200" width="84" height="8" fill="#8a5a2a" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="116" y="201" width="8" height="6" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <ellipse cx="78" cy="92" rx="9" ry="11" fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3"/>
      <ellipse cx="162" cy="92" rx="9" ry="11" fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3"/>
      <path d="M 72 80 L 68 74 M 72 80 L 84 74" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 168 80 L 172 74 M 168 80 L 156 74" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 76 90 Q 76 68 120 68 Q 164 68 164 90 L 164 100 Q 120 106 76 100 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="120" cy="66" r="3.5" fill="#7a4a25" stroke="#1a1a1a" stroke-width="2"/>
      <path d="M 168 96 L 178 90 L 178 102 Z" fill="#7a4a25" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 72 96 L 62 90 L 62 102 Z" fill="#7a4a25" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <g stroke="#7a4a25" stroke-width="2" opacity=".55" stroke-linecap="round">
        <line x1="84" y1="84" x2="156" y2="84"/>
        <line x1="106" y1="72" x2="106" y2="100"/>
        <line x1="134" y1="72" x2="134" y2="100"/>
      </g>
    `,
  },
  {
    id: "bunny_ninja",
    name: "Ninja",
    tint: "#D6DCE5",
    border: "#9AA5B5",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#2a2e36" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 96 148 L 134 188 L 152 148 Z" fill="#1a1d24" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="78" y="194" width="84" height="14" fill="#c43d2a" stroke="#1a1a1a" stroke-width="3.5"/>
      <rect x="116" y="196" width="8" height="10" fill="#a02f1f" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <rect x="76" y="98" width="88" height="10" fill="#c43d2a" stroke="#1a1a1a" stroke-width="3"/>
      <path d="M 120 96 L 124 103 L 131 103 L 125 108 L 128 115 L 120 110 L 112 115 L 115 108 L 109 103 L 116 103 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M 76 124 Q 120 122 164 124 L 164 142 Q 164 166 120 166 Q 76 166 76 142 Z"
            fill="#1f1f24" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 80 132 Q 68 136 60 146 L 56 140 Q 70 128 80 128 Z"
            fill="#1f1f24" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 160 132 Q 172 136 180 146 L 184 140 Q 170 128 160 128 Z"
            fill="#1f1f24" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "bunny_chef",
    name: "Chef",
    tint: "#FFF3D4",
    border: "#F0D89F",
    rarity: "common",
    price: 250,
    unlock: { type: "seasonal", month: 11, label: "Free every November" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 100 144 L 120 158 L 140 144 L 138 156 L 122 168 L 102 156 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="114" cy="154" r="1" fill="#fafafa"/>
      <circle cx="126" cy="154" r="1" fill="#fafafa"/>
      <g fill="#e0d8c8" stroke="#1a1a1a" stroke-width="1.8">
        <circle cx="108" cy="176" r="3"/>
        <circle cx="132" cy="176" r="3"/>
        <circle cx="108" cy="190" r="3"/>
        <circle cx="132" cy="190" r="3"/>
        <circle cx="108" cy="204" r="3"/>
        <circle cx="132" cy="204" r="3"/>
      </g>
      <line x1="120" y1="168" x2="120" y2="214" stroke="#e6e0d0" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_robot",
    name: "Robot",
    tint: "#DCE6F0",
    border: "#A8B8CC",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#b8c0cc" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <rect x="92" y="158" width="56" height="50" rx="4" fill="#8a96ad" stroke="#1a1a1a" stroke-width="3.5"/>
      <circle cx="120" cy="183" r="11" fill="#5dd5ff" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="120" cy="183" r="5" fill="#ffffff" opacity=".8"/>
      <circle cx="104" cy="183" r="3.5" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="136" cy="183" r="3.5" fill="#5db657" stroke="#1a1a1a" stroke-width="1.5"/>
      <g fill="#1a1a1a">
        <circle cx="98" cy="164" r="2"/>
        <circle cx="142" cy="164" r="2"/>
        <circle cx="98" cy="202" r="2"/>
        <circle cx="142" cy="202" r="2"/>
      </g>
      <g stroke="#5a6878" stroke-width="2">
        <line x1="100" y1="170" x2="106" y2="170"/>
        <line x1="134" y1="170" x2="140" y2="170"/>
      </g>
    `,
    head: `
      <line x1="120" y1="78" x2="120" y2="44" stroke="#1a1a1a" stroke-width="3.5"/>
      <ellipse cx="120" cy="80" rx="6" ry="2.5" fill="#8a96ad" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="120" cy="40" r="5" fill="#e8503a" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="120" cy="40" r="9" fill="none" stroke="#ffd14a" stroke-width="1.8" opacity=".7"/>
      <circle cx="70" cy="120" r="4" fill="#8a96ad" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="170" cy="120" r="4" fill="#8a96ad" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="102" y="92" width="36" height="14" rx="3" fill="#2a3540" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="110" cy="99" r="2.4" fill="#5db657"/>
      <circle cx="120" cy="99" r="2.4" fill="#ffd14a"/>
      <circle cx="130" cy="99" r="2.4" fill="#e8503a"/>
    `,
  },
  {
    id: "bunny_cowboy",
    name: "Cowboy",
    tint: "#F5D8B5",
    border: "#D49E5D",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g stroke="#a02f1f" stroke-width="1.5" opacity=".7">
        <line x1="100" y1="156" x2="100" y2="216"/>
        <line x1="120" y1="156" x2="120" y2="216"/>
        <line x1="140" y1="156" x2="140" y2="216"/>
        <line x1="80" y1="180" x2="160" y2="180"/>
        <line x1="80" y1="200" x2="160" y2="200"/>
      </g>
      <path d="M 80 148 Q 102 160 100 172 L 100 218 L 78 218 Q 76 196 78 168 Z"
            fill="#4a6fa8" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 160 148 Q 138 160 140 172 L 140 218 L 162 218 Q 164 196 162 168 Z"
            fill="#4a6fa8" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 100 174 L 100 216 M 140 174 L 140 216" stroke="#2a4878" stroke-width="1.8" stroke-dasharray="3 3"/>
      <g transform="translate(108 184)">
        <path d="M 0 -10 L 2.5 -3 L 10 -3 L 4 1.5 L 6.5 9 L 0 4.5 L -6.5 9 L -4 1.5 L -10 -3 L -2.5 -3 Z"
              fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <circle r="1.6" fill="#7a4a25"/>
      </g>
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#a02f1f" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="114" cy="151" r="1" fill="#fafafa"/>
      <circle cx="128" cy="151" r="1" fill="#fafafa"/>
    `,
    head: `
      <path d="M 60 88 Q 80 78 120 78 Q 160 78 180 88 Q 166 100 146 98 Q 120 104 94 98 Q 74 100 60 88 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 100 82 Q 96 58 112 52 Q 122 40 132 52 Q 144 58 140 82 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 108 58 Q 120 66 132 58" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="100" y="78" width="40" height="7" fill="#5a3a16" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="116" y="79" width="8" height="5" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
    `,
  },
  {
    id: "bunny_knight",
    name: "Knight",
    tint: "#D8DBE3",
    border: "#A8AEBC",
    rarity: "rare",
    price: 500,
    unlock: { type: "milestone", trigger: "hundred_correct_total", label: "Answer 100 questions correctly" },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#b8c0cc" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g fill="#8a96ad">
        <circle cx="86" cy="164" r="1.8"/><circle cx="96" cy="164" r="1.8"/><circle cx="106" cy="164" r="1.8"/>
        <circle cx="134" cy="164" r="1.8"/><circle cx="144" cy="164" r="1.8"/><circle cx="154" cy="164" r="1.8"/>
        <circle cx="84" cy="176" r="1.8"/><circle cx="94" cy="176" r="1.8"/><circle cx="104" cy="176" r="1.8"/>
        <circle cx="136" cy="176" r="1.8"/><circle cx="146" cy="176" r="1.8"/><circle cx="156" cy="176" r="1.8"/>
        <circle cx="86" cy="188" r="1.8"/><circle cx="96" cy="188" r="1.8"/><circle cx="106" cy="188" r="1.8"/>
        <circle cx="134" cy="188" r="1.8"/><circle cx="144" cy="188" r="1.8"/><circle cx="154" cy="188" r="1.8"/>
        <circle cx="84" cy="200" r="1.8"/><circle cx="94" cy="200" r="1.8"/><circle cx="104" cy="200" r="1.8"/>
        <circle cx="136" cy="200" r="1.8"/><circle cx="146" cy="200" r="1.8"/><circle cx="156" cy="200" r="1.8"/>
      </g>
      <rect x="104" y="148" width="32" height="68" fill="#fafafa" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="116" y="166" width="8" height="38" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="108" y="178" width="24" height="8" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <path d="M 100 100 Q 96 70 120 60 Q 144 70 140 100 Z"
            fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 104 84 Q 108 70 116 66" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>
      <rect x="98" y="96" width="44" height="9" fill="#9aa4b8" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="106" cy="78" r="1.8" fill="#1a1a1a"/>
      <circle cx="134" cy="78" r="1.8" fill="#1a1a1a"/>
      <circle cx="120" cy="66" r="1.8" fill="#1a1a1a"/>
    `,
  },
  {
    id: "bunny_popstar",
    name: "Pop Star",
    tint: "#FCD8E8",
    border: "#F4A8C8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8a8c8" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 84 156 Q 120 170 156 156" stroke="#f4d8e8" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M 82 196 Q 120 210 158 196" stroke="#f4d8e8" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      <g fill="#ffffff" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round">
        <path d="M 96 174 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 142 178 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"/>
        <path d="M 116 200 l 1.2 3 l 3 1 l -3 1 l -1.2 3 l -1.2 -3 l -3 -1 l 3 -1 z"/>
      </g>
      <g transform="translate(160 196) rotate(-28)">
        <ellipse cx="0" cy="0" rx="9" ry="11" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3"/>
        <ellipse cx="0" cy="0" rx="6" ry="7" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>
        <line x1="-4" y1="-3" x2="4" y2="-3" stroke="#1a1a1a" stroke-width="1.2"/>
        <line x1="-4" y1="3" x2="4" y2="3" stroke="#1a1a1a" stroke-width="1.2"/>
        <rect x="-3" y="10" width="6" height="20" rx="2" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2"/>
      </g>
      <ellipse cx="146" cy="198" rx="11" ry="9" fill="#fafafa" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="146" cy="200" r="2" fill="#f8b8d0" />
    `,
    head: `
      <path d="M 104 132 C 90 120 92 110 104 118 C 116 110 118 120 104 132 Z"
            fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 136 132 C 122 120 124 110 136 118 C 148 110 150 120 136 132 Z"
            fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 114 117 Q 120 114 126 117" stroke="#1a1a1a" stroke-width="2.5" fill="none"/>
      <ellipse cx="98" cy="114" rx="3" ry="2" fill="#ee5b85" opacity=".9"/>
      <ellipse cx="142" cy="114" rx="3" ry="2" fill="#ee5b85" opacity=".9"/>
    `,
  },
  {
    id: "bunny_dino",
    name: "Dino Onesie",
    tint: "#D4F0D4",
    border: "#8AC78A",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="120" cy="190" rx="22" ry="18" fill="#fdf3d8" stroke="#1a1a1a" stroke-width="3"/>
      <g stroke="#d49144" stroke-width="1.5" opacity=".7" stroke-linecap="round">
        <path d="M 104 184 Q 120 188 136 184"/>
        <path d="M 104 194 Q 120 198 136 194"/>
        <path d="M 108 204 Q 120 207 132 204"/>
      </g>
      <g fill="#4a9540" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round">
        <path d="M 86 154 L 90 144 L 94 152 Z"/>
        <path d="M 146 152 L 150 144 L 154 154 Z"/>
      </g>
      <!-- dino tail emerging from the body's right side; sits in the body slot so it scales/rotates with the body during reactions -->
      <path d="M 152 196 Q 188 192 198 220 Q 202 232 192 232 Q 178 222 168 218 Q 158 214 152 210 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <g fill="#4a9540" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round">
        <path d="M 170 198 L 174 188 L 178 200 Z"/>
        <path d="M 184 202 L 188 192 L 192 204 Z"/>
      </g>
    `,
    head: `
      <path d="M 70 100 Q 66 84 80 80 Q 100 64 120 66 Q 140 64 160 80 Q 174 84 170 100 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <g fill="#4a9540" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round">
        <path d="M 108 70 L 112 60 L 116 70 Z"/>
        <path d="M 116 66 L 120 52 L 124 66 Z"/>
        <path d="M 124 70 L 128 60 L 132 70 Z"/>
      </g>
      <g fill="#fafafa" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round">
        <path d="M 78 100 L 82 106 L 86 100 Z"/>
        <path d="M 92 102 L 96 108 L 100 102 Z"/>
        <path d="M 106 102 L 110 108 L 114 102 Z"/>
        <path d="M 126 102 L 130 108 L 134 102 Z"/>
        <path d="M 140 102 L 144 108 L 148 102 Z"/>
        <path d="M 154 100 L 158 106 L 162 100 Z"/>
      </g>
    `,
  },
  {
    id: "bunny_jester",
    name: "Jester",
    tint: "#FFE8C2",
    border: "#F0C66E",
    rarity: "common",
    price: 250,
    unlock: { type: "seasonal", month: 4, label: "Free every April" },
    body: `
      <defs>
        <clipPath id="jester-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <g clip-path="url(#jester-body-clip)">
        <path d="M 120 144 L 120 220 L 168 220 L 168 144 Z" fill="#ffd14a"/>
      </g>
      <g stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round">
        <path d="M 92 174 L 96 178 L 92 182 L 88 178 Z" fill="#ffd14a"/>
        <path d="M 148 174 L 152 178 L 148 182 L 144 178 Z" fill="#c43d2a"/>
        <path d="M 92 202 L 96 206 L 92 210 L 88 206 Z" fill="#ffd14a"/>
        <path d="M 148 202 L 152 206 L 148 210 L 144 206 Z" fill="#c43d2a"/>
      </g>
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <line x1="120" y1="156" x2="120" y2="216" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <path d="M 76 92 Q 120 102 164 92 L 164 104 Q 120 114 76 104 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 110 90 Q 120 36 130 90 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 80 96 Q 56 64 92 90 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 160 96 Q 184 64 148 90 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="120" cy="40" r="5" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5"/>
      <line x1="120" y1="36" x2="120" y2="44" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="58" cy="66" r="4.5" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <line x1="56" y1="63" x2="60" y2="70" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="182" cy="66" r="4.5" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <line x1="180" y1="63" x2="184" y2="70" stroke="#1a1a1a" stroke-width="1.5"/>
    `,
  },
  {
    id: "bunny_vampire",
    name: "Vampire",
    tint: "#E6D5DE",
    border: "#B89BAB",
    rarity: "rare",
    price: 500,
    unlock: { type: "seasonal", month: 10, label: "Free every October" },
    back: `
      <path d="M 72 148 Q 96 162 144 162 Q 168 162 168 148 L 184 240 Q 120 250 56 240 Z"
            fill="#1f1c2a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 82 156 Q 120 168 158 156 L 162 176 Q 120 182 78 176 Z"
            fill="#c43d2a"/>
      <path d="M 96 148 L 84 112 L 112 148 Z"
            fill="#1f1c2a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 144 148 L 156 112 L 128 148 Z"
            fill="#1f1c2a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 98 146 L 94 132 L 110 146 Z" fill="#c43d2a"/>
      <path d="M 142 146 L 146 132 L 130 146 Z" fill="#c43d2a"/>
    `,
    body: `
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1f1c2a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 110 148 L 120 178 L 130 148 L 130 200 L 120 208 L 110 200 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 110 150 L 100 144 L 100 158 L 110 152 L 110 158 L 130 158 L 130 152 L 140 158 L 140 144 L 130 150 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="117" y="148" width="6" height="11" fill="#a02f1f" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="120" cy="188" r="2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/>
      <circle cx="120" cy="200" r="2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2"/>
    `,
    head: `
      <path d="M 113 138 L 115 146 L 117 138 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M 123 138 L 125 146 L 127 138 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/>
    `,
  },

  // ═══════════════════════════════════════════════════════════════
  // Season 3 — fantasy & theatrical
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bunny_magician",
    name: "Magician",
    tint: "#E2D8F4",
    border: "#B6A5DC",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <!-- black tux jacket -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1f1c2a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- white shirt panel -->
      <path d="M 108 148 L 120 174 L 132 148 L 132 210 L 120 218 L 108 210 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- red bow tie -->
      <path d="M 110 150 L 100 144 L 100 158 L 110 152 L 110 158 L 130 158 L 130 152 L 140 158 L 140 144 L 130 150 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="117" y="148" width="6" height="11" fill="#a02f1f" stroke="#1a1a1a" stroke-width="1.8"/>
      <!-- buttons -->
      <circle cx="120" cy="186" r="1.8" fill="#1a1a1a"/>
      <circle cx="120" cy="200" r="1.8" fill="#1a1a1a"/>
    `,
    head: `
      <!-- top hat: tall cylinder + brim, sits flat across the top of the head -->
      <ellipse cx="120" cy="80" rx="34" ry="6" fill="#1f1c2a" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="92" y="32" width="56" height="48" fill="#1f1c2a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- red band -->
      <rect x="92" y="68" width="56" height="8" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- top rim shine -->
      <line x1="96" y1="36" x2="96" y2="60" stroke="#ffffff" stroke-width="2.5" opacity=".4" stroke-linecap="round"/>
      <!-- tiny star sparkle (magic) -->
      <path d="M 158 50 l 1.5 4 l 4 1 l -4 1 l -1.5 4 l -1.5 -4 l -4 -1 l 4 -1 z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round"/>
    `,
  },
  {
    id: "bunny_mermaid",
    name: "Mermaid",
    tint: "#CFE9EE",
    border: "#8FC5CD",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <!-- aqua scale tank -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#5dd5ff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- scale pattern overlay -->
      <defs>
        <clipPath id="mer-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#mer-body-clip)" stroke="#2b9bb8" stroke-width="1.8" fill="none">
        <path d="M 78 174 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0"/>
        <path d="M 70 190 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0"/>
        <path d="M 78 206 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0"/>
      </g>
      <!-- two pink shell cups across the chest -->
      <g fill="#f8b8d0" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M 100 148 q -2 16 8 16 q 12 0 10 -14 q -8 6 -18 -2 Z"/>
        <path d="M 122 150 q 0 14 8 14 q 12 0 8 -14 q -8 4 -16 0 Z"/>
      </g>
      <g stroke="#c97a96" stroke-width="1.2" fill="none">
        <path d="M 108 154 q -1 6 0 8"/>
        <path d="M 105 154 q -2 5 -2 8"/>
        <path d="M 111 154 q 1 5 1 8"/>
        <path d="M 128 156 q -1 5 0 6"/>
        <path d="M 131 156 q 1 4 1 6"/>
      </g>
    `,
    head: `
      <!-- seashell + pearl tiara along the top of the head -->
      <path d="M 80 78 Q 120 62 160 78 L 158 88 Q 120 74 82 88 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- central pink scallop shell -->
      <g transform="translate(120 68)">
        <path d="M -12 0 Q 0 -16 12 0 Q 8 4 6 0 Q 4 8 0 2 Q -4 8 -6 0 Q -8 4 -12 0 Z"
              fill="#f8b8d0" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <!-- side pearls -->
      <circle cx="92" cy="76" r="3" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="148" cy="76" r="3" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.8"/>
      <!-- starfish on side -->
      <g transform="translate(70 130) rotate(-15)" fill="#ee5b85" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round">
        <path d="M 0 -7 L 2 -2 L 7 -2 L 3 1 L 5 6 L 0 3 L -5 6 L -3 1 L -7 -2 L -2 -2 Z"/>
      </g>
    `,
  },
  {
    id: "bunny_witch",
    name: "Witch",
    tint: "#D4C7DE",
    border: "#9B85B0",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 10, label: "Free every October" },
    body: `
      <!-- black robe -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#2a2540" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- purple collar lapel V -->
      <path d="M 100 148 L 120 174 L 140 148" fill="none" stroke="#7b5fb8" stroke-width="4" stroke-linejoin="round"/>
      <!-- big purple star center -->
      <path d="M 120 178 L 126 190 L 139 192 L 130 200 L 132 213 L 120 207 L 108 213 L 110 200 L 101 192 L 114 190 Z"
            fill="#7b5fb8" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- moons sprinkled -->
      <path d="M 92 174 a 5 5 0 0 0 7 7 a 6 6 0 1 1 -7 -7 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <path d="M 148 198 a 4 4 0 0 0 5.5 5.5 a 5 5 0 1 1 -5.5 -5.5 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
    `,
    head: `
      <!-- pointed witch hat: tall cone with a bent tip + wide brim, sits on top of head -->
      <path d="M 78 76 Q 120 86 162 76 Q 154 88 134 88 Q 120 92 106 88 Q 86 88 78 76 Z"
            fill="#2a2540" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- cone: rises tall between the ears, tip curls right -->
      <path d="M 102 76 Q 108 24 134 -22 Q 148 -28 144 -10 Q 130 42 138 76 Z"
            fill="#2a2540" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- purple band with gold buckle -->
      <rect x="100" y="70" width="40" height="8" fill="#7b5fb8" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="116" y="70" width="9" height="8" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="119" y1="72" x2="119" y2="76" stroke="#1a1a1a" stroke-width="1.4"/>
      <line x1="122" y1="72" x2="122" y2="76" stroke="#1a1a1a" stroke-width="1.4"/>
      <!-- tiny stars near tip -->
      <path d="M 152 -6 l 1 3 l 3 .5 l -3 .5 l -1 3 l -1 -3 l -3 -.5 l 3 -.5 z" fill="#ffd14a"/>
    `,
  },
  {
    id: "bunny_viking",
    name: "Viking",
    tint: "#E9D8B7",
    border: "#C4A66A",
    rarity: "rare",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <!-- brown tunic -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#9c6a3f" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- fur shoulder mantle (cream/white shaggy band) -->
      <path d="M 76 148
               Q 84 144 92 152
               Q 100 144 108 152
               Q 116 144 124 152
               Q 132 144 140 152
               Q 148 144 156 152
               Q 164 144 168 152
               L 164 168
               Q 120 174 76 168 Z"
            fill="#f5ebd2" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- fur shadow tufts -->
      <g stroke="#c7b890" stroke-width="1.5" opacity=".85" stroke-linecap="round" fill="none">
        <path d="M 88 156 q 2 6 0 8"/>
        <path d="M 104 158 q 2 6 0 8"/>
        <path d="M 120 158 q 2 6 0 8"/>
        <path d="M 136 158 q 2 6 0 8"/>
        <path d="M 152 156 q 2 6 0 8"/>
      </g>
      <!-- leather belt + buckle -->
      <rect x="78" y="200" width="84" height="9" fill="#5a3a16" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="114" y="201" width="12" height="7" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <!-- horned helmet: silver dome sits ON TOP of the head, then two big horns -->
      <path d="M 100 80 Q 96 54 120 44 Q 144 54 140 80 Z"
            fill="#cfd5dd" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- rim band (just above the head's top edge) -->
      <rect x="98" y="76" width="44" height="9" fill="#9aa4b8" stroke="#1a1a1a" stroke-width="3"/>
      <!-- horns: curl outward and up from each side of the dome -->
      <path d="M 102 70 Q 76 60 60 34 Q 70 46 82 48 Q 92 58 100 64 Z"
            fill="#f5ebd2" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 138 70 Q 164 60 180 34 Q 170 46 158 48 Q 148 58 140 64 Z"
            fill="#f5ebd2" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- horn detail lines -->
      <path d="M 76 48 Q 88 54 96 62" stroke="#c7b890" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 164 48 Q 152 54 144 62" stroke="#c7b890" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- center rivet -->
      <circle cx="120" cy="52" r="2.5" fill="#1a1a1a"/>
      <!-- side rivets -->
      <circle cx="106" cy="62" r="1.8" fill="#1a1a1a"/>
      <circle cx="134" cy="62" r="1.8" fill="#1a1a1a"/>
    `,
  },
  {
    id: "bunny_surfer",
    name: "Surfer",
    tint: "#C8EBF4",
    border: "#85C6D8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- cyan hawaiian shirt -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#7dd3e8" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- collar -->
      <path d="M 100 148 L 120 168 L 140 148 L 138 158 L 122 174 L 102 158 Z"
            fill="#5dbac8" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- tropical flowers scattered -->
      <g stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round">
        <g transform="translate(94 178)">
          <circle r="6" fill="#ee5b85"/>
          <circle r="2" fill="#ffd14a"/>
        </g>
        <g transform="translate(148 184)">
          <circle r="6" fill="#ee5b85"/>
          <circle r="2" fill="#ffd14a"/>
        </g>
        <g transform="translate(118 200)">
          <circle r="6" fill="#ee5b85"/>
          <circle r="2" fill="#ffd14a"/>
        </g>
      </g>
      <!-- leafy fronds -->
      <g stroke="#1a1a1a" stroke-width="1.6" fill="#5db657" stroke-linejoin="round">
        <path d="M 108 172 q -8 -2 -10 6 q 8 0 10 -6 z"/>
        <path d="M 134 188 q 8 -2 10 6 q -8 0 -10 -6 z"/>
      </g>
      <!-- pink + white flower lei across the collar -->
      <g stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round">
        <circle cx="92" cy="158" r="3.5" fill="#ee5b85"/>
        <circle cx="104" cy="166" r="3.5" fill="#fafafa"/>
        <circle cx="118" cy="170" r="3.5" fill="#ee5b85"/>
        <circle cx="132" cy="170" r="3.5" fill="#fafafa"/>
        <circle cx="146" cy="166" r="3.5" fill="#ee5b85"/>
        <circle cx="158" cy="158" r="3.5" fill="#fafafa"/>
      </g>
    `,
    head: `
      <!-- black aviator sunglasses sized to cover both eyes -->
      <rect x="84" y="108" width="34" height="18" rx="9" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <rect x="122" y="108" width="34" height="18" rx="9" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="118" y1="116" x2="122" y2="116" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="84" y1="116" x2="76" y2="114" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="156" y1="116" x2="164" y2="114" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- lens shine -->
      <path d="M 90 112 L 96 112" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>
      <path d="M 128 112 L 134 112" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>
    `,
  },
  {
    id: "bunny_mountaineer",
    name: "Mountaineer",
    tint: "#DCEAFB",
    border: "#9CB7D8",
    rarity: "common",
    price: 500,
    unlock: { type: "shop", price: 500 },
    body: `
      <!-- red puffy parka -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- quilted segment lines -->
      <g stroke="#a02f1f" stroke-width="2.2" fill="none" stroke-linecap="round">
        <path d="M 84 168 Q 120 174 158 168"/>
        <path d="M 82 184 Q 120 190 160 184"/>
        <path d="M 82 200 Q 120 206 160 200"/>
      </g>
      <!-- zipper -->
      <line x1="120" y1="148" x2="120" y2="216" stroke="#1a1a1a" stroke-width="2.5" stroke-dasharray="2 3"/>
      <circle cx="120" cy="178" r="2.8" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- pocket flaps -->
      <rect x="86" y="190" width="20" height="14" rx="2" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="134" y="190" width="20" height="14" rx="2" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- carabiner clipped to chest -->
      <g transform="translate(146 160)">
        <path d="M -6 -2 q 0 -8 6 -8 q 6 0 6 8 l 0 6 q 0 4 -4 4 q -4 0 -4 -4 l 0 -4" fill="none" stroke="#9aa4b8" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `,
    head: `
      <!-- orange beanie (compact) -->
      <path d="M 84 80 Q 84 60 120 56 Q 156 60 156 80 L 156 88 Q 120 94 84 88 Z"
            fill="#ef7a3e" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- folded brim -->
      <rect x="82" y="82" width="76" height="10" rx="3" fill="#c95c25" stroke="#1a1a1a" stroke-width="3"/>
      <!-- knit pattern -->
      <g stroke="#c95c25" stroke-width="1.6" opacity=".8" fill="none" stroke-linecap="round">
        <line x1="94" y1="66" x2="94" y2="80"/>
        <line x1="106" y1="62" x2="106" y2="80"/>
        <line x1="120" y1="60" x2="120" y2="80"/>
        <line x1="134" y1="62" x2="134" y2="80"/>
        <line x1="146" y1="66" x2="146" y2="80"/>
      </g>
      <!-- pom pom on top -->
      <circle cx="120" cy="54" r="6" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="118" cy="52" r="1.8" fill="#e6e0d0" opacity=".7"/>
      <!-- ski goggles across the eyes (over the head ellipse, not over the beanie) -->
      <rect x="84" y="108" width="72" height="22" rx="8" fill="#2a3540" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- goggle strap continues onto the head -->
      <line x1="84" y1="119" x2="70" y2="120" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="156" y1="119" x2="170" y2="120" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- reflective lens highlight -->
      <path d="M 90 114 L 102 112 L 100 124 L 88 122 Z" fill="#5dd5ff" opacity=".6"/>
      <path d="M 138 114 L 150 112 L 148 124 L 136 122 Z" fill="#5dd5ff" opacity=".6"/>
    `,
  },
  {
    id: "bunny_mummy",
    name: "Mummy",
    tint: "#E8DCC8",
    border: "#BDA678",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 10, label: "Free every October" },
    body: `
      <!-- aged-bandage base -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#f0e3c8" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- diagonal bandage strips with gaps -->
      <defs>
        <clipPath id="mum-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#mum-body-clip)" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round">
        <path d="M 60 152 L 180 168 L 180 178 L 60 162 Z" fill="#fafafa"/>
        <path d="M 60 174 L 180 188 L 180 200 L 60 184 Z" fill="#fafafa"/>
        <path d="M 60 196 L 180 210 L 180 222 L 60 208 Z" fill="#fafafa"/>
        <!-- frayed bandage end peeking out lower -->
        <path d="M 152 210 L 178 218 L 170 226 L 156 220 Z" fill="#fafafa"/>
      </g>
      <!-- shadow lines on bandage edges -->
      <g clip-path="url(#mum-body-clip)" stroke="#bda678" stroke-width="1.2" opacity=".8" fill="none">
        <path d="M 60 163 L 180 178"/>
        <path d="M 60 185 L 180 200"/>
        <path d="M 60 207 L 180 222"/>
      </g>
    `,
    head: `
      <!-- bandage strips wrapping around head; one diagonal across the right eye -->
      <!-- horizontal forehead wrap -->
      <path d="M 70 102 L 172 102 L 170 114 L 68 114 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- diagonal across right eye (covers eye → tiny scleral slit visible) -->
      <path d="M 90 96 L 172 122 L 170 130 L 86 104 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- chin wrap -->
      <path d="M 80 142 L 158 152 L 156 160 L 78 150 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- frayed end trailing off the head -->
      <path d="M 156 152 L 180 162 L 174 170 L 158 162 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- shadow seams -->
      <g stroke="#bda678" stroke-width="1.2" opacity=".7" fill="none">
        <path d="M 70 109 L 172 109"/>
        <path d="M 88 100 L 170 125"/>
      </g>
      <!-- bandage edge on ear -->
      <rect x="86" y="60" width="26" height="6" rx="1" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_disco",
    name: "Disco Star",
    tint: "#F4E4FF",
    border: "#C896E8",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 12, label: "Free every December" },
    body: `
      <!-- gold sequin jumpsuit -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- deep V neckline -->
      <path d="M 100 148 L 120 180 L 140 148" fill="#f2c64a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- sequin dot pattern -->
      <defs>
        <clipPath id="disco-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#disco-body-clip)" fill="#ffffff" opacity=".85">
        <circle cx="88" cy="166" r="1.4"/><circle cx="98" cy="172" r="1.4"/><circle cx="108" cy="166" r="1.4"/>
        <circle cx="134" cy="166" r="1.4"/><circle cx="144" cy="172" r="1.4"/><circle cx="154" cy="166" r="1.4"/>
        <circle cx="86" cy="184" r="1.4"/><circle cx="98" cy="190" r="1.4"/><circle cx="108" cy="184" r="1.4"/>
        <circle cx="118" cy="190" r="1.4"/><circle cx="132" cy="184" r="1.4"/><circle cx="144" cy="190" r="1.4"/>
        <circle cx="154" cy="184" r="1.4"/>
        <circle cx="88" cy="202" r="1.4"/><circle cx="100" cy="208" r="1.4"/><circle cx="112" cy="202" r="1.4"/>
        <circle cx="128" cy="202" r="1.4"/><circle cx="140" cy="208" r="1.4"/><circle cx="152" cy="202" r="1.4"/>
      </g>
      <!-- disco-ball pendant on a chain -->
      <path d="M 110 148 Q 120 160 130 148" fill="none" stroke="#c7b890" stroke-width="2"/>
      <circle cx="120" cy="166" r="8" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="2.5"/>
      <g stroke="#9aa4b8" stroke-width="1" fill="none">
        <line x1="112" y1="166" x2="128" y2="166"/>
        <line x1="120" y1="158" x2="120" y2="174"/>
        <path d="M 114 162 Q 120 166 126 162"/>
        <path d="M 114 170 Q 120 166 126 170"/>
      </g>
      <circle cx="117" cy="163" r="1.4" fill="#ffffff" opacity=".9"/>
    `,
    head: `
      <!-- gold star headband across the forehead -->
      <rect x="76" y="96" width="88" height="8" fill="#7b5fb8" stroke="#1a1a1a" stroke-width="3"/>
      <!-- center star -->
      <path d="M 120 84 L 124 94 L 134 94 L 126 100 L 130 110 L 120 104 L 110 110 L 114 100 L 106 94 L 116 94 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- side mini stars -->
      <path d="M 90 100 l 1.3 3.5 l 3.5 1 l -3.5 1 l -1.3 3.5 l -1.3 -3.5 l -3.5 -1 l 3.5 -1 z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M 150 100 l 1.3 3.5 l 3.5 1 l -3.5 1 l -1.3 3.5 l -1.3 -3.5 l -3.5 -1 l 3.5 -1 z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/>
    `,
  },
  {
    id: "bunny_racer",
    name: "Race Car Driver",
    tint: "#FFE0DC",
    border: "#F4A89E",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- red + white racing jumpsuit -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- diagonal red sash across chest -->
      <defs>
        <clipPath id="racer-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#racer-body-clip)">
        <path d="M 68 168 L 168 148 L 168 172 L 68 192 Z" fill="#e8503a"/>
      </g>
      <!-- belt with buckle -->
      <rect x="78" y="200" width="84" height="10" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="114" y="201" width="12" height="8" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="1.8"/>
      <!-- checkered chest patch -->
      <g>
        <rect x="98" y="180" width="22" height="14" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
        <g fill="#1a1a1a">
          <rect x="98" y="180" width="5.5" height="3.5"/><rect x="109" y="180" width="5.5" height="3.5"/>
          <rect x="103.5" y="183.5" width="5.5" height="3.5"/><rect x="114.5" y="183.5" width="5.5" height="3.5"/>
          <rect x="98" y="187" width="5.5" height="3.5"/><rect x="109" y="187" width="5.5" height="3.5"/>
          <rect x="103.5" y="190.5" width="5.5" height="3.5"/><rect x="114.5" y="190.5" width="5.5" height="3.5"/>
        </g>
      </g>
      <!-- number patch -->
      <circle cx="138" cy="186" r="9" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5"/>
      <text x="138" y="190" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="11" fill="#1a1a1a">3</text>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
    head: `
      <!-- racing helmet covers top half of head; chin strap dives behind face -->
      <path d="M 64 108
               Q 60 70 88 56
               Q 120 46 152 56
               Q 180 70 176 108
               L 168 108
               L 158 94
               L 82 94
               L 72 108 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- visor band (across forehead just above eyes) -->
      <rect x="76" y="92" width="88" height="14" rx="2" fill="#2a3540" stroke="#1a1a1a" stroke-width="3"/>
      <!-- visor reflective sheen -->
      <path d="M 84 96 L 100 96" stroke="#5dd5ff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
      <!-- white racing stripe down the center -->
      <path d="M 110 56 L 110 92 L 130 92 L 130 56 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- side accent -->
      <rect x="76" y="80" width="88" height="4" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
    `,
  },
  {
    id: "bunny_fairy",
    name: "Fairy",
    tint: "#FCE2F4",
    border: "#F0A4D4",
    rarity: "rare",
    price: 0,
    unlock: { type: "seasonal", month: 5, label: "Free every May" },
    body: `
      <!-- leafy green tunic -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#7fcf7a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- scalloped leaf hem along the bottom -->
      <path d="M 78 210
               Q 88 222 98 210
               Q 108 222 118 210
               Q 128 222 138 210
               Q 148 222 158 210
               L 162 218 L 78 218 Z"
            fill="#7fcf7a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- leaf veins -->
      <g stroke="#3f8e5c" stroke-width="1.5" fill="none" stroke-linecap="round">
        <path d="M 88 210 L 88 216"/>
        <path d="M 108 210 L 108 216"/>
        <path d="M 128 210 L 128 216"/>
        <path d="M 148 210 L 148 216"/>
      </g>
      <!-- flower brooch -->
      <g transform="translate(120 174)" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round">
        <circle r="7" fill="#ee5b85"/>
        <circle r="2.5" fill="#ffd14a"/>
      </g>
    `,
    head: `
      <!-- flower crown sits across the very top of the head, between the ears -->
      <g stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round">
        <path d="M 86 82 Q 120 66 154 82 L 152 88 Q 120 76 88 88 Z" fill="#7fcf7a"/>
        <circle cx="94" cy="76" r="5.5" fill="#ee5b85"/>
        <circle cx="94" cy="76" r="1.8" fill="#ffd14a"/>
        <circle cx="110" cy="70" r="5.5" fill="#f8b8d0"/>
        <circle cx="110" cy="70" r="1.8" fill="#ffd14a"/>
        <circle cx="120" cy="66" r="6" fill="#ffd14a"/>
        <circle cx="120" cy="66" r="2" fill="#e8503a"/>
        <circle cx="130" cy="70" r="5.5" fill="#f8b8d0"/>
        <circle cx="130" cy="70" r="1.8" fill="#ffd14a"/>
        <circle cx="146" cy="76" r="5.5" fill="#ee5b85"/>
        <circle cx="146" cy="76" r="1.8" fill="#ffd14a"/>
        <!-- small leaves between -->
        <path d="M 102 80 q -3 -4 -6 -2 q 2 4 6 2 z" fill="#5db657"/>
        <path d="M 138 80 q 3 -4 6 -2 q -2 4 -6 2 z" fill="#5db657"/>
      </g>
    `,
  },

  // ═══════════════════════════════════════════════════════════════
  // Season 4 — sports collection
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bunny_tennis",
    name: "Tennis Pro",
    tint: "#E7F3D4",
    border: "#A7C97A",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white polo -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- collared neckline -->
      <path d="M 100 144 L 120 160 L 140 144 L 138 158 L 122 170 L 102 158 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- placket buttons -->
      <line x1="120" y1="162" x2="120" y2="184" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="120" cy="170" r="1.4" fill="#1a1a1a"/>
      <circle cx="120" cy="178" r="1.4" fill="#1a1a1a"/>
      <!-- horizontal stripes (color-block top) -->
      <rect x="78" y="180" width="84" height="6" fill="#a7c97a"/>
      <rect x="78" y="190" width="84" height="3" fill="#7b8edf"/>
      <!-- tennis-ball brand crest -->
      <g transform="translate(146 168)">
        <circle r="6" fill="#d9ea4a" stroke="#1a1a1a" stroke-width="2"/>
        <path d="M -5 -2 Q 0 4 5 -2" stroke="#fafafa" stroke-width="1.4" fill="none"/>
        <path d="M -5 2 Q 0 -4 5 2" stroke="#fafafa" stroke-width="1.4" fill="none"/>
      </g>
      <!-- wristband peeking on left -->
      <rect x="74" y="206" width="14" height="10" rx="3" fill="#e8503a" stroke="#1a1a1a" stroke-width="2.5"/>
      <line x1="78" y1="208" x2="78" y2="214" stroke="#fafafa" stroke-width="1.5"/>
      <line x1="84" y1="208" x2="84" y2="214" stroke="#fafafa" stroke-width="1.5"/>
    `,
    head: `
      <!-- neon green sweatband wrapping cleanly across the forehead -->
      <path d="M 72 102 Q 120 92 168 102 L 168 116 Q 120 108 72 116 Z"
            fill="#b8f53a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- subtle ribbed terry-cloth lines -->
      <g stroke="#7ac421" stroke-width="1.4" opacity=".7" stroke-linecap="round">
        <line x1="88" y1="100" x2="88" y2="114"/>
        <line x1="104" y1="98" x2="104" y2="115"/>
        <line x1="120" y1="97" x2="120" y2="115"/>
        <line x1="136" y1="98" x2="136" y2="115"/>
        <line x1="152" y1="100" x2="152" y2="114"/>
      </g>
    `,
  },
  {
    id: "bunny_boxer",
    name: "Boxer",
    tint: "#FFD5C5",
    border: "#E89878",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- red tank top -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- wide tank straps + scoop -->
      <path d="M 92 144 L 100 174 L 140 174 L 148 144" fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- championship belt across waist -->
      <rect x="74" y="196" width="92" height="18" rx="3" fill="#5a3a16" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- gold center plate -->
      <ellipse cx="120" cy="205" rx="18" ry="13" fill="#ffd14a" stroke="#1a1a1a" stroke-width="3"/>
      <!-- star on belt -->
      <path d="M 120 199 L 122 203 L 127 204 L 123 207 L 124 212 L 120 209 L 116 212 L 117 207 L 113 204 L 118 203 Z"
            fill="#e8a93d" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- belt side gems -->
      <circle cx="94" cy="205" r="3" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="146" cy="205" r="3" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
    `,
    head: `
      <!-- red headgear strap across forehead (flush, wraps the head) -->
      <path d="M 70 100 Q 120 92 170 100 L 170 114 Q 120 106 70 114 Z"
            fill="#c43d2a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- center logo dot -->
      <circle cx="120" cy="107" r="3.5" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.6"/>
      <!-- cartoon black eye (shiner) on the right eye -->
      <ellipse cx="136" cy="118" rx="9" ry="7" fill="#7b5fb8" opacity=".55" stroke="#5a3a8a" stroke-width="1.8"/>
    `,
  },
  {
    id: "bunny_baseball",
    name: "Baseball Slugger",
    tint: "#D9E2F0",
    border: "#8FA5C8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- pinstripe jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <defs>
        <clipPath id="bb-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#bb-body-clip)" stroke="#1a3978" stroke-width="1.6" opacity=".7">
        <line x1="86" y1="148" x2="86" y2="220"/>
        <line x1="98" y1="148" x2="98" y2="220"/>
        <line x1="110" y1="148" x2="110" y2="220"/>
        <line x1="130" y1="148" x2="130" y2="220"/>
        <line x1="142" y1="148" x2="142" y2="220"/>
        <line x1="154" y1="148" x2="154" y2="220"/>
      </g>
      <!-- placket buttons -->
      <line x1="120" y1="150" x2="120" y2="200" stroke="#1a3978" stroke-width="2"/>
      <circle cx="120" cy="164" r="1.5" fill="#1a3978"/>
      <circle cx="120" cy="178" r="1.5" fill="#1a3978"/>
      <circle cx="120" cy="192" r="1.5" fill="#1a3978"/>
      <!-- collar V -->
      <path d="M 108 148 L 120 164 L 132 148" fill="none" stroke="#1a3978" stroke-width="3" stroke-linejoin="round"/>
      <!-- chest "R" letter (team logo) -->
      <text x="100" y="200" font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#1a3978" stroke="#1a3978" stroke-width="0.8">R</text>
    `,
    head: `
      <!-- baseball cap (forward-facing) — smaller, sits on top of head -->
      <path d="M 80 92
               Q 76 60 120 58
               Q 164 60 160 92
               Q 120 100 80 92 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- visor: curved lip extending forward from the front of the cap -->
      <path d="M 76 92
               Q 72 104 92 106
               Q 120 110 148 106
               Q 168 104 164 92
               Q 120 100 76 92 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- visor underside shadow -->
      <path d="M 76 92 Q 72 104 92 106 Q 120 110 148 106 Q 168 104 164 92 Q 120 100 76 92 Z"
            fill="#0e1f44" opacity=".25"/>
      <!-- panel seams on crown -->
      <g stroke="#3a59a8" stroke-width="1.4" opacity=".7" fill="none">
        <line x1="98" y1="64" x2="98" y2="90"/>
        <line x1="142" y1="64" x2="142" y2="90"/>
      </g>
      <!-- button on top -->
      <circle cx="120" cy="60" r="3" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.8"/>
      <!-- "R" team logo on the front of the crown -->
      <text x="120" y="86" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#ffd14a"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill"
            letter-spacing="-0.5">R</text>
      <!-- stitch hint on visor edge -->
      <path d="M 80 100 Q 120 106 160 100" stroke="#3a59a8" stroke-width="1.2" fill="none" stroke-dasharray="2 2.5" opacity=".75"/>
    `,
  },
  {
    id: "bunny_hockey",
    name: "Hockey",
    tint: "#D6E8F2",
    border: "#7EAEC8",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- striped hockey jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <defs>
        <clipPath id="hk-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <!-- chunky shoulder pad area in white -->
      <g clip-path="url(#hk-body-clip)">
        <path d="M 70 144 Q 120 158 170 144 L 170 168 Q 120 178 70 168 Z" fill="#fafafa"/>
        <!-- sleeve stripes -->
        <rect x="62" y="200" width="36" height="6" fill="#ffd14a"/>
        <rect x="62" y="210" width="36" height="6" fill="#fafafa"/>
        <rect x="142" y="200" width="36" height="6" fill="#ffd14a"/>
        <rect x="142" y="210" width="36" height="6" fill="#fafafa"/>
      </g>
      <!-- collar V re-stroke -->
      <path d="M 108 148 L 120 162 L 132 148" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="120" y="200" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="32" fill="#ffd14a"
            stroke="#1a1a1a" stroke-width="2" paint-order="stroke fill">9</text>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
    head: `
      <!-- helmet dome between ears (above face) -->
      <path d="M 76 94 Q 76 60 120 56 Q 164 60 164 94 L 164 102 Q 120 110 76 102 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- side vent -->
      <rect x="86" y="76" width="20" height="6" rx="2" fill="#0e1f44" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="134" y="76" width="20" height="6" rx="2" fill="#0e1f44" stroke="#1a1a1a" stroke-width="2"/>
      <!-- chin strap loops sweeping outward from each side of the helmet -->
      <path d="M 78 102 Q 72 116 68 126" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 162 102 Q 168 116 172 126" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `,
  },
  {
    id: "bunny_football",
    name: "Football",
    tint: "#E0F0D5",
    border: "#86B26C",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- big shoulder pads silhouette (broader than body) -->
      <path d="M 56 148
               Q 80 144 92 156
               L 92 174
               Q 120 184 148 174
               L 148 156
               Q 160 144 184 148
               L 178 184
               Q 120 196 62 184 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- shoulder cap detail -->
      <path d="M 60 152 Q 72 160 84 156" stroke="#a02f1f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 180 152 Q 168 160 156 156" stroke="#a02f1f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- jersey lower (peeking under pads) -->
      <path d="M 76 184 Q 120 196 164 184 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="120" y="212" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#fafafa"
            stroke="#1a1a1a" stroke-width="1.8" paint-order="stroke fill">14</text>
    `,
    head: `
      <!-- helmet shell across top of head -->
      <path d="M 64 110
               Q 60 70 88 60
               Q 120 52 152 60
               Q 180 70 176 110
               L 168 110
               L 158 96
               L 82 96
               L 72 110 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- center stripe -->
      <rect x="116" y="56" width="8" height="44" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
      <!-- ear hole -->
      <circle cx="78" cy="100" r="6" fill="#1a1a1a"/>
      <circle cx="78" cy="100" r="3" fill="#3a2025"/>
      <!-- face mask: horizontal bars across the front of the face -->
      <g stroke="#3a4452" stroke-width="4" stroke-linecap="round">
        <!-- top crossbar (forehead) -->
        <path d="M 82 108 Q 120 110 158 108"/>
        <!-- mid (cheek line) -->
        <path d="M 80 124 Q 120 126 160 124"/>
        <!-- chin bar -->
        <path d="M 84 142 Q 120 146 156 142"/>
        <!-- vertical struts -->
        <line x1="92" y1="108" x2="90" y2="142"/>
        <line x1="148" y1="108" x2="150" y2="142"/>
        <line x1="120" y1="110" x2="120" y2="146"/>
      </g>
      <!-- chin cup strap -->
      <path d="M 90 142 Q 96 154 110 158" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <path d="M 150 142 Q 144 154 130 158" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
    `,
  },
  {
    id: "bunny_karate",
    name: "Karate",
    tint: "#F1E3D3",
    border: "#D0B587",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white gi -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffffff" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- right-over-left lapel -->
      <path d="M 98 148 Q 100 162 116 168 L 120 198 L 124 168 Q 138 162 142 148"
            fill="#f0eee9" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 96 148 L 120 198 L 144 148" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- folds -->
      <path d="M 88 174 Q 92 196 96 214" stroke="#cfc7b5" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 152 174 Q 148 196 144 214" stroke="#cfc7b5" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- black belt across waist -->
      <rect x="76" y="198" width="88" height="12" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <!-- belt knot -->
      <rect x="110" y="194" width="20" height="20" rx="2" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- belt ends -->
      <path d="M 110 214 L 106 226 L 116 226 L 118 214 Z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2"/>
      <path d="M 130 214 L 134 226 L 124 226 L 122 214 Z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2"/>
    `,
    head: `
      <!-- red hachimaki (headband) — clean band wrapping across the head -->
      <path d="M 70 100 Q 120 94 170 100 L 170 112 Q 120 106 70 112 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- center red dot (rising sun motif) -->
      <circle cx="120" cy="106" r="4.5" fill="#a02f1f" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_cyclist",
    name: "Cyclist",
    tint: "#FCEFC5",
    border: "#E4C25A",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- bright cycling jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- diagonal color block -->
      <defs>
        <clipPath id="cyc-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#cyc-body-clip)">
        <path d="M 60 168 L 180 148 L 180 184 L 60 204 Z" fill="#1a3978"/>
        <path d="M 60 184 L 180 164 L 180 174 L 60 194 Z" fill="#5dd5ff"/>
      </g>
      <!-- collar zip -->
      <line x1="120" y1="148" x2="120" y2="180" stroke="#1a1a1a" stroke-width="2.5"/>
      <circle cx="120" cy="156" r="2.5" fill="#cfd5dd" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- chest sponsor patch -->
      <rect x="86" y="186" width="68" height="22" rx="4" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <text x="120" y="202" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="14" fill="#1a3978" letter-spacing="1">READEE</text>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
    head: `
      <!-- aero helmet — teardrop dome (compact) -->
      <path d="M 80 102
               Q 72 84 92 70
               Q 120 64 148 70
               Q 170 84 160 102
               L 160 110
               Q 120 116 80 110 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- aero vents -->
      <g fill="#5dd5ff" stroke="#1a1a1a" stroke-width="2">
        <ellipse cx="102" cy="86" rx="7" ry="3"/>
        <ellipse cx="120" cy="80" rx="7" ry="3"/>
        <ellipse cx="138" cy="86" rx="7" ry="3"/>
      </g>
      <!-- center logo stripe -->
      <rect x="116" y="90" width="8" height="12" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- wraparound sunglasses across the eyes -->
      <path d="M 78 116 Q 120 110 162 116 L 162 130 Q 120 138 78 130 Z"
            fill="#2a3540" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- nose bridge cut-out -->
      <path d="M 114 124 Q 120 130 126 124" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
      <!-- lens shine -->
      <path d="M 90 120 L 102 118" stroke="#5dd5ff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
      <path d="M 140 118 L 152 120" stroke="#5dd5ff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
    `,
  },
  {
    id: "bunny_swimmer",
    name: "Swimmer",
    tint: "#CCEEF5",
    border: "#7AC3D6",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- striped speedo top (more like a racing suit upper body) -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1a3978" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <defs>
        <clipPath id="sw-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#sw-body-clip)">
        <rect x="72" y="162" width="100" height="6" fill="#5dd5ff"/>
        <rect x="72" y="178" width="100" height="6" fill="#fafafa"/>
        <rect x="72" y="194" width="100" height="6" fill="#5dd5ff"/>
      </g>
      <!-- water droplets sprinkled on chest -->
      <g fill="#5dd5ff" stroke="#1a1a1a" stroke-width="1.5">
        <ellipse cx="98" cy="206" rx="2" ry="3"/>
        <ellipse cx="142" cy="206" rx="2" ry="3"/>
        <ellipse cx="120" cy="212" rx="2" ry="3"/>
      </g>
      <!-- collar V re-stroke -->
      <path d="M 108 148 L 120 162 L 132 148" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
    `,
    head: `
      <!-- swim cap: dome sitting on top of the head, ears stay visible -->
      <path d="M 76 102 Q 70 64 120 60 Q 170 64 164 102 Q 120 110 76 102 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- swim cap highlight (shiny) -->
      <path d="M 88 76 Q 96 70 110 70" stroke="#fafafa" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>
      <!-- center logo (R wave) -->
      <circle cx="120" cy="88" r="7" fill="#fafafa" stroke="#1a1a1a" stroke-width="2"/>
      <path d="M 115 90 Q 120 94 125 90" stroke="#1a3978" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- chin strap suggestion (the bands that go behind the ears) -->
      <path d="M 76 100 Q 72 110 76 118" fill="none" stroke="#c43d2a" stroke-width="2" stroke-linecap="round"/>
      <path d="M 164 100 Q 168 110 164 118" fill="none" stroke="#c43d2a" stroke-width="2" stroke-linecap="round"/>
      <!-- swim goggles across the eyes (sit just below the cap line) -->
      <ellipse cx="104" cy="118" rx="12" ry="9" fill="#5dd5ff" stroke="#1a1a1a" stroke-width="3"/>
      <ellipse cx="136" cy="118" rx="12" ry="9" fill="#5dd5ff" stroke="#1a1a1a" stroke-width="3"/>
      <!-- inner ring of goggle -->
      <ellipse cx="104" cy="118" rx="7" ry="5" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>
      <ellipse cx="136" cy="118" rx="7" ry="5" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>
      <!-- nose bridge -->
      <line x1="116" y1="118" x2="124" y2="118" stroke="#1a1a1a" stroke-width="3"/>
      <!-- strap continuing -->
      <line x1="92" y1="118" x2="78" y2="116" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="148" y1="118" x2="162" y2="116" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- lens shine -->
      <path d="M 100 114 L 106 114" stroke="#fafafa" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <path d="M 132 114 L 138 114" stroke="#fafafa" stroke-width="2" stroke-linecap="round" opacity=".9"/>
    `,
  },
  {
    id: "bunny_gymnast",
    name: "Gymnast",
    tint: "#F4D4E8",
    border: "#D499BB",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- sparkly leotard (deep magenta) -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#c93f7d" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- iridescent rhinestone scatter -->
      <defs>
        <clipPath id="gym-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#gym-body-clip)" stroke="#fafafa" stroke-width="1.4" stroke-linejoin="round">
        <path d="M 92 168 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#fafafa"/>
        <path d="M 142 172 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#fafafa"/>
        <path d="M 110 184 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#ffd14a"/>
        <path d="M 130 196 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#5dd5ff"/>
        <path d="M 100 200 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#fafafa"/>
        <path d="M 148 196 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z" fill="#5dd5ff"/>
      </g>
      <!-- diagonal sash detail -->
      <path d="M 84 168 Q 120 188 158 158" stroke="#ffd14a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <!-- thin straps -->
      <path d="M 96 148 L 102 168" stroke="#9a2e5c" stroke-width="3" stroke-linecap="round"/>
      <path d="M 144 148 L 138 168" stroke="#9a2e5c" stroke-width="3" stroke-linecap="round"/>
    `,
    head: `
      <!-- hair ribbon: high pony at the top -->
      <!-- ponytail base bun -->
      <circle cx="120" cy="76" r="10" fill="#c93f7d" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- ribbon wrap -->
      <rect x="108" y="74" width="24" height="6" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- ribbon loops on either side -->
      <path d="M 108 76 L 92 64 L 98 80 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 132 76 L 148 64 L 142 80 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- ribbon tails -->
      <path d="M 116 80 L 110 92 L 116 90 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M 124 80 L 130 92 L 124 90 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      <!-- ribbon highlight -->
      <line x1="112" y1="76" x2="128" y2="76" stroke="#fff3a8" stroke-width="1.5" opacity=".85"/>
    `,
  },
  {
    id: "bunny_cheer",
    name: "Cheerleader",
    tint: "#FFDBE0",
    border: "#F09BAE",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- V-front sweater + skirt look on top -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ee5b85" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- big white chevron V -->
      <path d="M 90 154 L 120 200 L 150 154 L 156 168 L 120 220 L 84 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- "R" team letter on chest -->
      <text x="120" y="184" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="20" fill="#ee5b85"
            stroke="#1a1a1a" stroke-width="1.6" paint-order="stroke fill">R</text>
      <!-- pleat lines on lower skirt edge -->
      <g stroke="#a02f1f" stroke-width="2" fill="none" opacity=".7">
        <line x1="88" y1="210" x2="90" y2="218"/>
        <line x1="104" y1="212" x2="104" y2="220"/>
        <line x1="120" y1="214" x2="120" y2="220"/>
        <line x1="136" y1="212" x2="136" y2="220"/>
        <line x1="152" y1="210" x2="150" y2="218"/>
      </g>
    `,
    head: `
      <!-- big bow on top of head -->
      <path d="M 96 80 L 80 70 L 80 90 L 100 84 L 100 92 L 140 92 L 140 84 L 160 90 L 160 70 L 144 80 Z"
            fill="#ee5b85" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- bow knot center -->
      <rect x="112" y="78" width="16" height="14" rx="2" fill="#c43d2a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- bow highlight -->
      <line x1="86" y1="76" x2="98" y2="82" stroke="#f8b8d0" stroke-width="2" opacity=".8"/>
      <line x1="142" y1="82" x2="154" y2="76" stroke="#f8b8d0" stroke-width="2" opacity=".8"/>
    `,
  },

  // ═══════════════════════════════════════════════════════════════
  // Season 5 — World Cup national teams
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bunny_brazil",
    name: "Brazil",
    tint: "#FFF1B3",
    border: "#E6C641",
    rarity: "rare",
    price: 0,
    unlock: { type: "seasonal", month: 6, label: "Free every June for World Cup season" },
    body: `
      <!-- canary yellow jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- green collar V trim -->
      <path d="M 100 144 L 120 168 L 140 144 L 138 156 L 122 178 L 102 156 Z"
            fill="#0a7a3a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- CBF crest (yellow shield on green diamond) -->
      <g transform="translate(86 178)">
        <path d="M 0 0 L 14 -8 L 28 0 L 14 8 Z" fill="#0a7a3a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M 8 0 L 14 -4 L 20 0 L 14 4 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/>
      </g>
      <!-- five stars above crest (5x champions) — tucked above the shield -->
      <g fill="#ffffff" stroke="#1a1a1a" stroke-width="0.6">
        <path d="M 86 167 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 92 166 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 98 165.5 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 104 166 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 110 167 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
      </g>
      <!-- jersey number -->
      <text x="140" y="208" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#0a7a3a"
            stroke="#1a1a1a" stroke-width="1.6" paint-order="stroke fill">10</text>
    `,
  },
  {
    id: "bunny_argentina",
    name: "Argentina",
    tint: "#D5E8F8",
    border: "#7AB2DD",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- vertical sky-blue stripes -->
      <defs>
        <clipPath id="arg-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#arg-body-clip)">
        <rect x="78" y="148" width="14" height="72" fill="#7ec1ec"/>
        <rect x="106" y="148" width="14" height="72" fill="#7ec1ec"/>
        <rect x="134" y="148" width="14" height="72" fill="#7ec1ec"/>
        <rect x="162" y="148" width="14" height="72" fill="#7ec1ec"/>
      </g>
      <!-- collar -->
      <path d="M 108 148 L 120 162 L 132 148" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- AFA shield (small) -->
      <g transform="translate(100 180)">
        <path d="M 0 -6 L 8 -6 L 8 4 Q 4 10 0 4 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 0 -6 L 8 -6" stroke="#fafafa" stroke-width="2"/>
      </g>
      <!-- three stars above shield (3x champions: 1978/1986/2022) -->
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="0.8">
        <path d="M 96 170 l .9 2.2 l 2.2 .4 l -2.2 .4 l -.9 2.2 l -.9 -2.2 l -2.2 -.4 l 2.2 -.4 z"/>
        <path d="M 104 168 l .9 2.2 l 2.2 .4 l -2.2 .4 l -.9 2.2 l -.9 -2.2 l -2.2 -.4 l 2.2 -.4 z"/>
        <path d="M 112 170 l .9 2.2 l 2.2 .4 l -2.2 .4 l -.9 2.2 l -.9 -2.2 l -2.2 -.4 l 2.2 -.4 z"/>
      </g>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#1a1a1a"
            stroke="#fafafa" stroke-width="1.4" paint-order="stroke fill">10</text>
    `,
  },
  {
    id: "bunny_france",
    name: "France",
    tint: "#D6DEF5",
    border: "#6D7CD8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- French blue jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1f3a8a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- red + white trim along collar -->
      <path d="M 100 144 Q 120 158 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#e23344" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- rooster crest (yellow shield with simple bird silhouette) -->
      <g transform="translate(100 184)">
        <path d="M 0 -8 L 12 -8 L 12 4 Q 6 12 0 4 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- simple coq silhouette (like the Germany eagle) -->
        <path d="M 0 -2 Q 6 -8 12 -2 Q 10 2 6 0 Q 2 2 0 -2 Z" fill="#bf2531"/>
      </g>
      <!-- two stars above the crest (2x champions: 1998/2018) — smaller, tucked above shield -->
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="0.6">
        <path d="M 102 170 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 110 170 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
      </g>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#fafafa"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill">10</text>
    `,
  },
  {
    id: "bunny_germany",
    name: "Germany",
    tint: "#E6E6E6",
    border: "#9C9C9C",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- diagonal flag chevron across chest: black / red / gold -->
      <defs>
        <clipPath id="ger-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#ger-body-clip)">
        <path d="M 70 156 L 160 184 L 160 192 L 70 164 Z" fill="#1a1a1a"/>
        <path d="M 70 168 L 160 196 L 160 204 L 70 176 Z" fill="#e23344"/>
        <path d="M 70 180 L 160 208 L 160 216 L 70 188 Z" fill="#ffd14a"/>
      </g>
      <!-- collar -->
      <path d="M 108 148 L 120 158 L 132 148" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- DFB eagle hint (small black mark, right side of chest) -->
      <g transform="translate(140 176)">
        <path d="M -6 0 Q 0 -6 6 0 Q 4 4 0 2 Q -4 4 -6 0 Z" fill="#1a1a1a"/>
      </g>
      <!-- four stars (4x champions) — arched above the eagle -->
      <g fill="#1a1a1a">
        <path d="M 132 165 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 137 164 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 143 164 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
        <path d="M 148 165 l .6 1.5 l 1.5 .3 l -1.5 .3 l -.6 1.5 l -.6 -1.5 l -1.5 -.3 l 1.5 -.3 z"/>
      </g>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    `,
  },
  {
    id: "bunny_usa",
    name: "USA",
    tint: "#DCE3F5",
    border: "#7188D2",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- red diagonal sash with white star (homage to "stars and stripes") -->
      <defs>
        <clipPath id="usa-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#usa-body-clip)">
        <path d="M 60 184 L 180 158 L 180 176 L 60 202 Z" fill="#bf2531"/>
        <!-- white stars sprinkled on the red sash -->
        <g fill="#fafafa">
          <path d="M 84 182 l 1.2 3 l 3 .6 l -3 .6 l -1.2 3 l -1.2 -3 l -3 -.6 l 3 -.6 z"/>
          <path d="M 112 176 l 1.2 3 l 3 .6 l -3 .6 l -1.2 3 l -1.2 -3 l -3 -.6 l 3 -.6 z"/>
          <path d="M 142 170 l 1.2 3 l 3 .6 l -3 .6 l -1.2 3 l -1.2 -3 l -3 -.6 l 3 -.6 z"/>
        </g>
      </g>
      <!-- blue collar -->
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- "USA" crest -->
      <g transform="translate(92 172)">
        <path d="M -10 -6 L 10 -6 L 10 6 L 0 12 L -10 6 Z" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <text x="0" y="4" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif"
              font-weight="900" font-size="8" fill="#fafafa">USA</text>
      </g>
      <!-- re-stroke silhouette -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="140" y="208" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#bf2531"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill">9</text>
    `,
  },
  {
    id: "bunny_england",
    name: "England",
    tint: "#EDEDED",
    border: "#A8A8A8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- white jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- navy/red collar trim -->
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- three lions crest (smaller, with actual lion silhouettes) -->
      <g transform="translate(92 178)">
        <path d="M 0 -8 L 14 -8 L 14 4 Q 7 12 0 4 Z" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <!-- three small heraldic lions passant (walking), stacked -->
        <g fill="#ffd14a" stroke="#ffd14a" stroke-width="0.3" stroke-linejoin="round">
          <!-- top lion -->
          <g transform="translate(7 -5)">
            <path d="M -3.2 0.6
                     Q -4 -.4 -2.6 -1.4
                     Q -1 -1.8 1 -1.4
                     Q 2 -1.8 3 -1
                     L 3 0
                     L 2.6 1.2
                     L 1.8 1.2
                     L 1.8 .6
                     L .8 .6
                     L .8 1.2
                     L 0 1.2
                     L 0 .6
                     L -1 .6
                     L -1 1.2
                     L -1.8 1.2
                     L -1.8 .6 Z"/>
            <!-- tail curl -->
            <path d="M -3 0 Q -4 -1.6 -3 -2.2" fill="none" stroke="#ffd14a" stroke-width="0.6" stroke-linecap="round"/>
          </g>
          <!-- middle lion -->
          <g transform="translate(7 -1)">
            <path d="M -3.2 0.6
                     Q -4 -.4 -2.6 -1.4
                     Q -1 -1.8 1 -1.4
                     Q 2 -1.8 3 -1
                     L 3 0
                     L 2.6 1.2
                     L 1.8 1.2
                     L 1.8 .6
                     L .8 .6
                     L .8 1.2
                     L 0 1.2
                     L 0 .6
                     L -1 .6
                     L -1 1.2
                     L -1.8 1.2
                     L -1.8 .6 Z"/>
            <path d="M -3 0 Q -4 -1.6 -3 -2.2" fill="none" stroke="#ffd14a" stroke-width="0.6" stroke-linecap="round"/>
          </g>
          <!-- bottom lion -->
          <g transform="translate(7 3)">
            <path d="M -3.2 0.6
                     Q -4 -.4 -2.6 -1.4
                     Q -1 -1.8 1 -1.4
                     Q 2 -1.8 3 -1
                     L 3 0
                     L 2.6 1.2
                     L 1.8 1.2
                     L 1.8 .6
                     L .8 .6
                     L .8 1.2
                     L 0 1.2
                     L 0 .6
                     L -1 .6
                     L -1 1.2
                     L -1.8 1.2
                     L -1.8 .6 Z"/>
            <path d="M -3 0 Q -4 -1.6 -3 -2.2" fill="none" stroke="#ffd14a" stroke-width="0.6" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <!-- one star above crest (1966 champions) -->
      <path d="M 99 162 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="0.8" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#1f3a8a"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill">9</text>
    `,
  },
  {
    id: "bunny_spain",
    name: "Spain",
    tint: "#F8D7D2",
    border: "#D87575",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- red jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#bf2531" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- gold trim along bottom -->
      <path d="M 78 210 Q 120 220 162 210" stroke="#ffd14a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <!-- yellow collar bar -->
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- RFEF crest (yellow shield) -->
      <g transform="translate(88 176)">
        <path d="M 0 -10 L 16 -10 L 16 4 Q 8 14 0 4 Z" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- red bands inside shield -->
        <rect x="2" y="-7" width="12" height="2.5" fill="#bf2531"/>
        <rect x="2" y="-1" width="12" height="2.5" fill="#bf2531"/>
        <rect x="2" y="5" width="10" height="2.5" fill="#bf2531"/>
      </g>
      <!-- one star above crest (2010) -->
      <path d="M 96 158 l 1 2.5 l 2.5 .5 l -2.5 .5 l -1 2.5 l -1 -2.5 l -2.5 -.5 l 2.5 -.5 z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="0.8" stroke-linejoin="round"/>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#ffd14a"
            stroke="#1a1a1a" stroke-width="1.6" paint-order="stroke fill">7</text>
    `,
  },
  {
    id: "bunny_italy",
    name: "Italy",
    tint: "#CFE8F2",
    border: "#6FB2CA",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- Azzurri blue jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#1c5fa3" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- gold/cream collar trim -->
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#e6d9a2" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- FIGC scudetto crest -->
      <g transform="translate(90 176)">
        <path d="M 0 -8 L 13 -8 L 13 3 Q 6.5 11 0 3 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <!-- green/white/red bands -->
        <rect x="1.5" y="-5.5" width="10" height="2.5" fill="#0a7a3a"/>
        <rect x="1.5" y="1.5" width="10" height="2.5" fill="#bf2531"/>
      </g>
      <!-- four stars (4x champions) -->
      <g fill="#ffd14a" stroke="#1a1a1a" stroke-width="0.8">
        <path d="M 84 162 l .8 2 l 2 .4 l -2 .4 l -.8 2 l -.8 -2 l -2 -.4 l 2 -.4 z"/>
        <path d="M 92 162 l .8 2 l 2 .4 l -2 .4 l -.8 2 l -.8 -2 l -2 -.4 l 2 -.4 z"/>
        <path d="M 100 162 l .8 2 l 2 .4 l -2 .4 l -.8 2 l -.8 -2 l -2 -.4 l 2 -.4 z"/>
        <path d="M 108 162 l .8 2 l 2 .4 l -2 .4 l -.8 2 l -.8 -2 l -2 -.4 l 2 -.4 z"/>
      </g>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#fafafa"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill">10</text>
    `,
  },
  {
    id: "bunny_netherlands",
    name: "Netherlands",
    tint: "#FFE3CB",
    border: "#F19B5C",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- bright orange jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ef7a3e" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- black collar trim -->
      <path d="M 100 144 Q 120 158 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- KNVB lion crest -->
      <g transform="translate(100 184)">
        <path d="M 0 -10 L 16 -10 L 16 4 Q 8 14 0 4 Z" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- abstract lion (orange dot + lines) -->
        <circle cx="8" cy="-2" r="3" fill="#ef7a3e"/>
        <path d="M 5 -5 L 4 -7 M 11 -5 L 12 -7" stroke="#ef7a3e" stroke-width="1.5" stroke-linecap="round"/>
      </g>
      <!-- black side stripes -->
      <path d="M 78 168 L 76 200" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <path d="M 162 168 L 164 200" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#1a1a1a"
            stroke="#fafafa" stroke-width="1.4" paint-order="stroke fill">14</text>
    `,
  },
  {
    id: "bunny_portugal",
    name: "Portugal",
    tint: "#F5C9C5",
    border: "#C25D55",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- deep maroon-red jersey -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#8a1d2b" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- green/yellow collar trim -->
      <path d="M 100 144 Q 120 156 140 144 L 138 152 Q 120 162 102 152 Z"
            fill="#0a7a3a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- gold trim at the bottom edge -->
      <path d="M 78 210 Q 120 220 162 210" stroke="#ffd14a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- FPF crest (white shield with red dots representing the quinas) -->
      <g transform="translate(100 184)">
        <path d="M 0 -10 L 16 -10 L 16 4 Q 8 14 0 4 Z" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- five small red shields in cross pattern -->
        <circle cx="8" cy="-6" r="1.3" fill="#8a1d2b"/>
        <circle cx="4" cy="-2" r="1.3" fill="#8a1d2b"/>
        <circle cx="12" cy="-2" r="1.3" fill="#8a1d2b"/>
        <circle cx="8" cy="2" r="1.3" fill="#8a1d2b"/>
        <circle cx="8" cy="-2" r="1.3" fill="#8a1d2b"/>
      </g>
      <!-- jersey number -->
      <text x="140" y="206" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="22" fill="#ffd14a"
            stroke="#1a1a1a" stroke-width="1.6" paint-order="stroke fill">7</text>
    `,
  },

  // ═══════════════════════════════════════════════════════════════
  // Season 6 — summer collection
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bunny_flamingo",
    name: "Flamingo Float",
    tint: "#C6E9F0",
    border: "#6FBED3",
    rarity: "rare",
    price: 0,
    unlock: { type: "seasonal", month: 6, label: "Free every June for summer kickoff" },
    body: `
      <!-- pink inflatable ring around the waist -->
      <path d="M 60 198
               Q 60 174 88 174
               L 152 174
               Q 180 174 180 198
               Q 180 224 152 224
               L 88 224
               Q 60 224 60 198 Z"
            fill="#f47fa8" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- top highlight (shiny inflatable) -->
      <path d="M 84 184 Q 120 178 156 184" stroke="#fde0ec" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
      <!-- stitch lines around the ring (inflatable seam) -->
      <g stroke="#c43d6a" stroke-width="1.4" fill="none" opacity=".7">
        <line x1="76" y1="216" x2="76" y2="222"/>
        <line x1="92" y1="220" x2="92" y2="226"/>
        <line x1="108" y1="222" x2="108" y2="228"/>
        <line x1="124" y1="222" x2="124" y2="228"/>
        <line x1="140" y1="220" x2="140" y2="226"/>
      </g>
      <!-- seam line around the middle of the ring -->
      <path d="M 64 200 Q 120 200 176 200" stroke="#c43d6a" stroke-width="1.5" fill="none" opacity=".5"/>
      <!-- wing bump (scalloped fin on the right side of the ring) -->
      <path d="M 158 184 Q 174 174 188 182 Q 196 190 188 200 Q 178 196 168 198 Z"
            fill="#f47fa8" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- wing feather grooves -->
      <g stroke="#c43d6a" stroke-width="1.4" fill="none" opacity=".7">
        <path d="M 170 184 Q 176 188 180 195"/>
        <path d="M 178 182 Q 184 187 186 195"/>
      </g>
      <!-- tail bump tucked at the back/right -->
      <path d="M 178 200 Q 196 200 200 210 Q 192 216 180 212 Z"
            fill="#f47fa8" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- flamingo head/neck rising up the bunny's left side -->
      <!-- neck (thick pink curve) — S-curve, extends further left -->
      <path d="M 96 184 Q 50 156 46 122 Q 44 92 64 86"
            fill="none" stroke="#f47fa8" stroke-width="22" stroke-linecap="round"/>
      <path d="M 96 184 Q 50 156 46 122 Q 44 92 64 86"
            fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <!-- head (sticks out to the left, away from the bunny) -->
      <ellipse cx="60" cy="82" rx="18" ry="15" fill="#f47fa8" stroke="#1a1a1a" stroke-width="3"/>
      <!-- head shine -->
      <ellipse cx="54" cy="74" rx="5" ry="3" fill="#fde0ec" opacity=".75"/>
      <!-- beak upper (peach) — hooked downward -->
      <path d="M 44 78 Q 18 80 14 94 L 26 98 Q 40 88 50 84 Z"
            fill="#f4a55f" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      <!-- eye -->
      <circle cx="64" cy="80" r="2.4" fill="#1a1a1a"/>
      <circle cx="65" cy="78.5" r=".9" fill="#fafafa"/>
    `,
  },
  {
    id: "bunny_scuba",
    name: "Scuba Diver",
    tint: "#B8D8E5",
    border: "#5F95B5",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- teal wetsuit (summery tropical aqua) -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#14b8a6" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- coral pink accent stripes (wetsuit color trim) -->
      <path d="M 78 168 Q 120 174 162 168" stroke="#ff7a5c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 78 200 Q 120 206 162 200" stroke="#ff7a5c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- zipper down the front -->
      <line x1="120" y1="148" x2="120" y2="208" stroke="#fafafa" stroke-width="2" stroke-dasharray="2 3"/>
      <circle cx="120" cy="160" r="3" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- BCD chest patch (logo strip) -->
      <rect x="104" y="178" width="32" height="10" rx="2" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2"/>
      <text x="120" y="186" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="8" fill="#1a1a1a">DIVE</text>
    `,
    head: `
      <!-- dive mask: clear lens with teal rubber border across the eyes -->
      <path d="M 78 108 Q 120 102 162 108 L 162 134 Q 120 140 78 134 Z"
            fill="#14b8a6" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- two eye lenses (clear blue) -->
      <ellipse cx="104" cy="121" rx="11" ry="9" fill="#7dd3e8" stroke="#1a1a1a" stroke-width="2.5"/>
      <ellipse cx="136" cy="121" rx="11" ry="9" fill="#7dd3e8" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- center bridge -->
      <rect x="116" y="116" width="8" height="10" fill="#14b8a6" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- mask strap going around the head -->
      <path d="M 78 121 L 70 122" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 162 121 L 170 122" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- lens reflections -->
      <path d="M 100 116 L 106 116" stroke="#fafafa" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <path d="M 132 116 L 138 116" stroke="#fafafa" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <!-- snorkel: yellow tube curving up from the right side of the mask -->
      <path d="M 162 110 Q 178 100 180 78 L 180 64"
            fill="none" stroke="#ffd14a" stroke-width="8" stroke-linecap="round"/>
      <path d="M 162 110 Q 178 100 180 78 L 180 64"
            fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <!-- mouthpiece -->
      <ellipse cx="160" cy="116" rx="6" ry="3.5" fill="#0a7a6e" stroke="#1a1a1a" stroke-width="2"/>
      <!-- snorkel top opening -->
      <ellipse cx="180" cy="62" rx="4.5" ry="2.5" fill="#0a7a6e" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  {
    id: "bunny_lifeguard",
    name: "Lifeguard",
    tint: "#FED7D7",
    border: "#E87878",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 7, label: "Free every July at peak summer" },
    body: `
      <!-- red lifeguard tank top -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- wide tank straps + white scoop -->
      <path d="M 94 144 L 100 174 L 140 174 L 146 144" fill="#fafafa" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- giant white cross (lifeguard mark) -->
      <rect x="100" y="184" width="40" height="10" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="115" y="172" width="10" height="36" fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- whistle on a lanyard -->
      <path d="M 120 144 Q 90 170 92 196" fill="none" stroke="#fafafa" stroke-width="2.5"/>
      <ellipse cx="92" cy="200" rx="7" ry="5" fill="#ffd14a" stroke="#1a1a1a" stroke-width="2.5"/>
      <rect x="98" y="199" width="5" height="3" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="90" cy="200" r="1.5" fill="#1a1a1a"/>
    `,
    head: `
      <!-- red baseball cap with white "LG" -->
      <path d="M 80 92
               Q 76 60 120 58
               Q 164 60 160 92
               Q 120 100 80 92 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 76 92
               Q 72 104 92 106
               Q 120 110 148 106
               Q 168 104 164 92
               Q 120 100 76 92 Z"
            fill="#e8503a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <text x="120" y="86" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="900" font-size="16" fill="#fafafa"
            stroke="#1a1a1a" stroke-width="1.4" paint-order="stroke fill">LG</text>
      <!-- white sunscreen stripes on the nose -->
      <rect x="116" y="128" width="8" height="3" fill="#fafafa" opacity=".9"/>
    `,
  },
  {
    id: "bunny_icecream",
    name: "Ice Cream",
    tint: "#FFE2E8",
    border: "#F5A2B8",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 8, label: "Free every August heat wave" },
    body: `
      <!-- waffle cone bottom (tan body) -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#d8a05c" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- waffle crosshatch pattern -->
      <defs>
        <clipPath id="ice-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#ice-body-clip)" stroke="#a8743a" stroke-width="2" fill="none" opacity=".75">
        <line x1="78" y1="160" x2="162" y2="180"/>
        <line x1="78" y1="176" x2="162" y2="196"/>
        <line x1="78" y1="192" x2="162" y2="212"/>
        <line x1="78" y1="208" x2="162" y2="222"/>
        <line x1="162" y1="160" x2="78" y2="180"/>
        <line x1="162" y1="176" x2="78" y2="196"/>
        <line x1="162" y1="192" x2="78" y2="212"/>
      </g>
      <!-- cream dripping over the top edge of the cone -->
      <path d="M 78 152 Q 88 162 96 152 Q 104 164 114 154 Q 124 164 132 152 Q 142 162 152 154 Q 158 164 162 152 L 162 162 Q 120 166 78 162 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
    `,
    head: `
      <!-- ice cream scoops piled high on top of head -->
      <!-- bottom scoop (strawberry pink) -->
      <path d="M 78 96 Q 76 78 100 70 Q 120 64 140 70 Q 164 78 162 96 Q 120 100 78 96 Z"
            fill="#f8b8d0" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- middle scoop (mint green) -->
      <ellipse cx="120" cy="60" rx="34" ry="20" fill="#b7e0c0" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- top scoop (chocolate brown) -->
      <ellipse cx="120" cy="40" rx="26" ry="16" fill="#8a5a2a" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- cherry on top -->
      <circle cx="120" cy="22" r="6" fill="#bf2531" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- cherry stem -->
      <path d="M 120 16 Q 124 8 128 6" stroke="#5a3a16" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- cherry highlight -->
      <circle cx="118" cy="20" r="1.5" fill="#fafafa" opacity=".8"/>
      <!-- sprinkles on scoops -->
      <g stroke-width="1.4" stroke-linecap="round">
        <line x1="100" y1="44" x2="103" y2="42" stroke="#ffd14a"/>
        <line x1="130" y1="42" x2="133" y2="40" stroke="#bf2531"/>
        <line x1="115" y1="52" x2="118" y2="50" stroke="#fafafa"/>
        <line x1="106" y1="62" x2="109" y2="60" stroke="#bf2531"/>
        <line x1="132" y1="64" x2="135" y2="62" stroke="#ffd14a"/>
        <line x1="124" y1="58" x2="127" y2="56" stroke="#7b5fb8"/>
        <line x1="92" y1="84" x2="95" y2="82" stroke="#ffd14a"/>
        <line x1="142" y1="86" x2="145" y2="84" stroke="#fafafa"/>
        <line x1="118" y1="90" x2="121" y2="88" stroke="#7b5fb8"/>
      </g>
    `,
  },
  {
    id: "bunny_watermelon",
    name: "Watermelon",
    tint: "#FCD4D8",
    border: "#E58691",
    rarity: "common",
    price: 0,
    unlock: { type: "seasonal", month: 8, label: "Free every August heat wave" },
    body: `
      <!-- watermelon flesh pink shirt -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#f17387" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- green rind band along the bottom hem -->
      <path d="M 78 208 Q 120 220 162 208 L 162 218 Q 120 226 78 218 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- black seeds scattered on the pink flesh -->
      <g fill="#1a1a1a">
        <ellipse cx="98" cy="170" rx="2.5" ry="3.5" transform="rotate(20 98 170)"/>
        <ellipse cx="130" cy="174" rx="2.5" ry="3.5" transform="rotate(-15 130 174)"/>
        <ellipse cx="110" cy="186" rx="2.5" ry="3.5" transform="rotate(10 110 186)"/>
        <ellipse cx="142" cy="188" rx="2.5" ry="3.5" transform="rotate(-25 142 188)"/>
        <ellipse cx="92" cy="196" rx="2.5" ry="3.5" transform="rotate(30 92 196)"/>
        <ellipse cx="124" cy="200" rx="2.5" ry="3.5" transform="rotate(-10 124 200)"/>
        <ellipse cx="152" cy="178" rx="2.5" ry="3.5" transform="rotate(20 152 178)"/>
      </g>
    `,
    head: `
      <!-- watermelon-slice hat: half-circle with green rim -->
      <path d="M 76 102 Q 120 56 164 102 Z"
            fill="#f17387" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- green outer rind -->
      <path d="M 70 100 Q 120 48 170 100 L 170 108 Q 120 60 70 108 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- seeds on the slice -->
      <g fill="#1a1a1a">
        <ellipse cx="100" cy="92" rx="2" ry="3" transform="rotate(-30 100 92)"/>
        <ellipse cx="120" cy="84" rx="2" ry="3"/>
        <ellipse cx="140" cy="92" rx="2" ry="3" transform="rotate(30 140 92)"/>
        <ellipse cx="110" cy="100" rx="2" ry="3" transform="rotate(-10 110 100)"/>
        <ellipse cx="130" cy="100" rx="2" ry="3" transform="rotate(10 130 100)"/>
      </g>
    `,
  },
  {
    id: "bunny_sailor",
    name: "Sailor",
    tint: "#D5E0F0",
    border: "#7E9BC8",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- Breton striped shirt -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- horizontal navy stripes -->
      <defs>
        <clipPath id="sail-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#sail-body-clip)">
        <rect x="72" y="162" width="100" height="6" fill="#1f3a8a"/>
        <rect x="72" y="178" width="100" height="6" fill="#1f3a8a"/>
        <rect x="72" y="194" width="100" height="6" fill="#1f3a8a"/>
        <rect x="72" y="210" width="100" height="6" fill="#1f3a8a"/>
      </g>
      <!-- red neckerchief -->
      <path d="M 100 148 Q 120 160 140 148 L 138 156 Q 120 164 102 156 Z"
            fill="#bf2531" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- knot -->
      <path d="M 118 158 L 122 158 L 124 168 L 116 168 Z" fill="#bf2531" stroke="#1a1a1a" stroke-width="2"/>
      <!-- anchor chest patch -->
      <g transform="translate(100 188)">
        <circle r="9" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5"/>
        <!-- anchor shape -->
        <g stroke="#fafafa" stroke-width="1.5" fill="none" stroke-linecap="round">
          <line x1="0" y1="-5" x2="0" y2="5"/>
          <circle cx="0" cy="-5" r="1.5" fill="#fafafa"/>
          <path d="M -4 4 Q 0 7 4 4"/>
          <line x1="-3" y1="-2" x2="3" y2="-2"/>
        </g>
      </g>
    `,
    head: `
      <!-- white sailor cap (Donald Duck style) -->
      <path d="M 80 98 Q 78 76 100 70 Q 120 64 140 70 Q 162 76 160 98 L 160 104 Q 120 110 80 104 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- black band -->
      <rect x="80" y="92" width="80" height="9" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- ribbon tails dangling on the right -->
      <path d="M 156 100 L 168 124 L 162 124 L 154 102 Z" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 154 102 L 158 124 L 152 124 L 150 102 Z" fill="#1f3a8a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- pinch fold on top -->
      <path d="M 110 70 Q 120 76 130 70" stroke="#cfd5dd" stroke-width="2" fill="none" stroke-linecap="round"/>
    `,
  },
  {
    id: "bunny_hula",
    name: "Hula",
    tint: "#FDE6CC",
    border: "#F0B575",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- bare body base (skin-tan) -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#f4d39a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- coconut-bra style top (2 brown halves) -->
      <g fill="#9c6a3f" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M 96 152 Q 100 168 110 168 Q 118 168 116 156 Q 108 158 96 152 Z"/>
        <path d="M 144 152 Q 140 168 130 168 Q 122 168 124 156 Q 132 158 144 152 Z"/>
      </g>
      <!-- coconut texture dots -->
      <g fill="#5a3a16">
        <circle cx="104" cy="162" r="1"/>
        <circle cx="110" cy="160" r="1"/>
        <circle cx="136" cy="162" r="1"/>
        <circle cx="130" cy="160" r="1"/>
      </g>
      <!-- grass skirt: vertical green fronds along the bottom -->
      <g fill="#5db657" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round">
        <path d="M 76 190 L 78 222 L 82 222 L 80 188 Z"/>
        <path d="M 84 192 L 86 222 L 90 222 L 88 190 Z"/>
        <path d="M 92 190 L 94 222 L 98 222 L 96 188 Z"/>
        <path d="M 100 192 L 102 222 L 106 222 L 104 190 Z"/>
        <path d="M 108 190 L 110 222 L 114 222 L 112 188 Z"/>
        <path d="M 116 192 L 118 222 L 122 222 L 120 190 Z"/>
        <path d="M 124 190 L 126 222 L 130 222 L 128 188 Z"/>
        <path d="M 132 192 L 134 222 L 138 222 L 136 190 Z"/>
        <path d="M 140 190 L 142 222 L 146 222 L 144 188 Z"/>
        <path d="M 148 192 L 150 222 L 154 222 L 152 190 Z"/>
        <path d="M 156 190 L 158 222 L 162 222 L 160 188 Z"/>
      </g>
      <!-- waistband on the grass skirt -->
      <rect x="76" y="184" width="86" height="8" fill="#5a3a16" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- flower lei across the neckline -->
      <g stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round">
        <circle cx="88" cy="152" r="4" fill="#ee5b85"/>
        <circle cx="100" cy="148" r="4" fill="#ffd14a"/>
        <circle cx="112" cy="148" r="4" fill="#fafafa"/>
        <circle cx="120" cy="146" r="4" fill="#ee5b85"/>
        <circle cx="128" cy="148" r="4" fill="#ffd14a"/>
        <circle cx="140" cy="148" r="4" fill="#fafafa"/>
        <circle cx="152" cy="152" r="4" fill="#ee5b85"/>
        <g fill="#5db657" stroke="none">
          <circle cx="88" cy="152" r="1"/>
          <circle cx="100" cy="148" r="1"/>
          <circle cx="112" cy="148" r="1"/>
          <circle cx="120" cy="146" r="1"/>
          <circle cx="128" cy="148" r="1"/>
          <circle cx="140" cy="148" r="1"/>
          <circle cx="152" cy="152" r="1"/>
        </g>
      </g>
    `,
    head: `
      <!-- large hibiscus flower behind the left ear -->
      <g transform="translate(78 96)" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round">
        <!-- five petals -->
        <ellipse cx="0" cy="-8" rx="6" ry="8" fill="#ee5b85" transform="rotate(0 0 0)"/>
        <ellipse cx="-8" cy="-3" rx="6" ry="8" fill="#ee5b85" transform="rotate(-72 -8 -3)"/>
        <ellipse cx="-5" cy="6" rx="6" ry="8" fill="#ee5b85" transform="rotate(-144 -5 6)"/>
        <ellipse cx="5" cy="6" rx="6" ry="8" fill="#ee5b85" transform="rotate(144 5 6)"/>
        <ellipse cx="8" cy="-3" rx="6" ry="8" fill="#ee5b85" transform="rotate(72 8 -3)"/>
        <!-- center pistil -->
        <circle r="3" fill="#ffd14a"/>
      </g>
    `,
  },
  {
    id: "bunny_fisherman",
    name: "Fisherman",
    tint: "#DDE8D2",
    border: "#8FB270",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- khaki tan fishing vest -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#c4a978" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- center seam (open vest) -->
      <line x1="120" y1="148" x2="120" y2="216" stroke="#1a1a1a" stroke-width="2.5"/>
      <!-- shirt underneath (cream) -->
      <path d="M 108 144 L 120 174 L 132 144" fill="#f5ebd2" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
      <!-- vest pockets (4 on chest) -->
      <rect x="90" y="170" width="20" height="14" rx="2" fill="#a98555" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="130" y="170" width="20" height="14" rx="2" fill="#a98555" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="90" y="190" width="20" height="16" rx="2" fill="#a98555" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="130" y="190" width="20" height="16" rx="2" fill="#a98555" stroke="#1a1a1a" stroke-width="2"/>
      <!-- pocket flap fold lines -->
      <line x1="90" y1="176" x2="110" y2="176" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="130" y1="176" x2="150" y2="176" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- fishing lures clipped to vest -->
      <g stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round">
        <ellipse cx="100" cy="164" rx="3" ry="2" fill="#ffd14a"/>
        <ellipse cx="140" cy="164" rx="3" ry="2" fill="#5dd5ff"/>
      </g>
    `,
    head: `
      <!-- bucket hat: floppy brim + low crown -->
      <ellipse cx="120" cy="100" rx="48" ry="6" fill="#5db657" stroke="#1a1a1a" stroke-width="3.5"/>
      <path d="M 80 100 Q 80 78 120 76 Q 160 78 160 100 Z"
            fill="#5db657" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- band -->
      <path d="M 82 92 Q 120 86 158 92" stroke="#3f8e5c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- fishing lure stuck on the brim -->
      <ellipse cx="148" cy="98" rx="3" ry="2" fill="#bf2531" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="148" y1="100" x2="148" y2="104" stroke="#1a1a1a" stroke-width="1.2"/>
    `,
  },
  {
    id: "bunny_beachtowel",
    name: "Beach Day",
    tint: "#FFE9B8",
    border: "#E6BD56",
    rarity: "common",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- striped beach towel wrapped around the body -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#fafafa" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- bold vertical stripes -->
      <defs>
        <clipPath id="bt-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#bt-body-clip)">
        <rect x="78" y="148" width="12" height="80" fill="#ef7a3e"/>
        <rect x="102" y="148" width="12" height="80" fill="#5dd5ff"/>
        <rect x="126" y="148" width="12" height="80" fill="#ef7a3e"/>
        <rect x="150" y="148" width="12" height="80" fill="#5dd5ff"/>
      </g>
      <!-- folded top edge -->
      <path d="M 78 148 Q 120 156 162 148 L 162 156 Q 120 162 78 156 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>
      <!-- tassels at the bottom -->
      <g stroke="#cfc7b5" stroke-width="1.4" stroke-linecap="round">
        <line x1="84" y1="216" x2="83" y2="222"/>
        <line x1="96" y1="216" x2="97" y2="222"/>
        <line x1="108" y1="216" x2="107" y2="222"/>
        <line x1="120" y1="216" x2="121" y2="222"/>
        <line x1="132" y1="216" x2="131" y2="222"/>
        <line x1="144" y1="216" x2="145" y2="222"/>
        <line x1="156" y1="216" x2="155" y2="222"/>
      </g>
      <!-- frosty drink held to the side (small) -->
      <g transform="translate(78 196)">
        <path d="M -4 0 L 4 0 L 3 12 L -3 12 Z" fill="#ee5b85" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
        <!-- straw -->
        <line x1="2" y1="-4" x2="0" y2="0" stroke="#fafafa" stroke-width="2" stroke-linecap="round"/>
        <!-- lemon slice -->
        <ellipse cx="-1" cy="0" rx="3" ry="1" fill="#ffd14a" stroke="#1a1a1a" stroke-width="1"/>
        <!-- umbrella -->
        <path d="M 1 -10 L 5 -4 L -3 -4 Z" fill="#5dd5ff" stroke="#1a1a1a" stroke-width="1.4"/>
        <line x1="1" y1="-10" x2="2" y2="-4" stroke="#1a1a1a" stroke-width="1"/>
      </g>
    `,
    head: `
      <!-- big floppy sun hat -->
      <ellipse cx="120" cy="100" rx="60" ry="8" fill="#f4d39a" stroke="#1a1a1a" stroke-width="3.5"/>
      <!-- crown -->
      <path d="M 86 100 Q 86 74 120 70 Q 154 74 154 100 Z"
            fill="#f4d39a" stroke="#1a1a1a" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- ribbon band -->
      <path d="M 86 96 Q 120 88 154 96 L 154 102 Q 120 94 86 102 Z"
            fill="#ef7a3e" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- ribbon bow on the side -->
      <path d="M 154 100 L 168 92 L 166 102 L 168 110 L 154 104 Z"
            fill="#ef7a3e" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- huge round sunglasses across eyes -->
      <circle cx="104" cy="120" r="14" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="136" cy="120" r="14" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="118" y1="120" x2="122" y2="120" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="90" y1="120" x2="80" y2="118" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="150" y1="120" x2="160" y2="118" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- lens shine -->
      <path d="M 96 114 L 104 114" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
      <path d="M 128 114 L 136 114" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
    `,
  },
  {
    id: "bunny_pineapple",
    name: "Pineapple",
    tint: "#FFF0B8",
    border: "#E6C04A",
    rarity: "rare",
    price: 250,
    unlock: { type: "shop", price: 250 },
    body: `
      <!-- yellow pineapple body -->
      <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"
            fill="#ffd14a" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <!-- crosshatch diamond pattern (pineapple skin) -->
      <defs>
        <clipPath id="pine-body-clip">
          <path d="M 80 148 C 100 156 140 156 160 148 L 162 168 C 162 196 152 214 138 216 L 102 216 C 88 214 78 196 78 168 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#pine-body-clip)" stroke="#d49144" stroke-width="2" fill="none" opacity=".85">
        <!-- diagonal grid one way -->
        <line x1="70" y1="160" x2="170" y2="180"/>
        <line x1="70" y1="172" x2="170" y2="192"/>
        <line x1="70" y1="184" x2="170" y2="204"/>
        <line x1="70" y1="196" x2="170" y2="216"/>
        <line x1="70" y1="208" x2="170" y2="228"/>
        <!-- diagonal grid the other way -->
        <line x1="170" y1="160" x2="70" y2="180"/>
        <line x1="170" y1="172" x2="70" y2="192"/>
        <line x1="170" y1="184" x2="70" y2="204"/>
        <line x1="170" y1="196" x2="70" y2="216"/>
        <line x1="170" y1="208" x2="70" y2="228"/>
      </g>
      <!-- small brown dots at diamond centers (pineapple "eyes") -->
      <g fill="#8a5a2a">
        <circle cx="100" cy="172" r="1.5"/>
        <circle cx="120" cy="172" r="1.5"/>
        <circle cx="140" cy="172" r="1.5"/>
        <circle cx="90" cy="184" r="1.5"/>
        <circle cx="110" cy="184" r="1.5"/>
        <circle cx="130" cy="184" r="1.5"/>
        <circle cx="150" cy="184" r="1.5"/>
        <circle cx="100" cy="196" r="1.5"/>
        <circle cx="120" cy="196" r="1.5"/>
        <circle cx="140" cy="196" r="1.5"/>
      </g>
    `,
    head: `
      <!-- spiky green leaf crown - 5 pointed leaves rising up -->
      <g fill="#5db657" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round">
        <!-- center tallest leaf -->
        <path d="M 120 92 L 112 56 L 120 18 L 128 56 Z"/>
        <!-- left tall -->
        <path d="M 108 94 L 96 64 L 100 30 L 112 60 Z"/>
        <!-- right tall -->
        <path d="M 132 94 L 144 64 L 140 30 L 128 60 Z"/>
        <!-- outer left -->
        <path d="M 96 96 L 80 78 L 78 50 L 100 76 Z"/>
        <!-- outer right -->
        <path d="M 144 96 L 160 78 L 162 50 L 140 76 Z"/>
      </g>
      <!-- leaf veins -->
      <g stroke="#3f8e5c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".8">
        <line x1="120" y1="92" x2="120" y2="24"/>
        <line x1="105" y1="94" x2="102" y2="36"/>
        <line x1="135" y1="94" x2="138" y2="36"/>
      </g>
    `,
  },
];

export const DEFAULT_OUTFIT_ID = "bunny_classic";

export function getOutfit(id: string | null | undefined): Outfit {
  return OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
}
