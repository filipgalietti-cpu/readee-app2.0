import type { FluentIconName } from "@/app/_components/FluentIcon";

/**
 * Shop item marks.
 *
 * These are reward art, not UI chrome, so they are Fluent Emoji (colour) and
 * not Glyph (monochrome). A child picking an outfit is looking at a prize; a
 * 2px grey outline is the wrong register for that, and the thin strokes lost
 * their silhouette at chip size anyway.
 *
 * The keys are the `icon` values stored on shop items in shop-items.ts, kept
 * as-is so no item data had to change. The values are Fluent Emoji names.
 * See CLAUDE.md for the icon system.
 */
export const ICON_MAP: Record<string, FluentIconName> = {
  binoculars: "magnifying-glass", // Fluent Emoji has no binoculars
  bird: "bird",
  blossom: "blossom",
  bone: "bone",
  "book-open": "open-book",
  bot: "robot",
  brain: "brain",
  bug: "bug",
  candy: "candy",
  carrot: "carrot",
  castle: "castle",
  cat: "cat",
  cherry: "cherries",
  "circle-dot": "blue-circle",
  citrus: "lemon",
  cloud: "cloud",
  crown: "crown",
  droplet: "droplet",
  feather: "feather",
  fish: "fish",
  flame: "fire",
  flower: "cherry-blossom",
  "flower-2": "blossom",
  "gamepad-2": "video-game",
  gem: "gem",
  ghost: "ghost",
  gift: "gift",
  globe: "globe",
  house: "house",
  image: "framed-picture",
  leaf: "leaf",
  moon: "moon",
  mountain: "mountain",
  "mountain-snow": "snow-mountain",
  music: "musical-note",
  orbit: "ringed-planet",
  palette: "artist-palette",
  palmtree: "palm-tree",
  "paw-print": "paw-prints",
  rabbit: "rabbit",
  rainbow: "rainbow",
  rat: "rat",
  rocket: "rocket",
  satellite: "satellite",
  search: "magnifying-glass",
  shell: "spiral-shell",
  shield: "shield",
  ship: "ship",
  skull: "skull",
  smile: "grinning-face",
  snail: "snail",
  snowflake: "snowflake",
  sparkles: "sparkles",
  squirrel: "chipmunk",
  star: "star",
  sun: "sun",
  sunrise: "sunrise",
  sunset: "sunset",
  swords: "crossed-swords",
  telescope: "telescope",
  tent: "tent",
  "tree-deciduous": "deciduous-tree",
  "tree-palm": "palm-tree",
  "tree-pine": "evergreen-tree",
  trees: "evergreen-tree",
  trophy: "trophy",
  turtle: "turtle",
  "wand-2": "wand",
  waves: "water-wave",
  wheat: "sheaf-of-rice",
  zap: "zap",
};

export function getShopIcon(name: string): FluentIconName {
  return ICON_MAP[name] || "star";
}
