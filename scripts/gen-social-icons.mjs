/**
 * Rasterize email-safe social icons (Gmail/Outlook strip inline SVG, so the
 * email footer needs PNGs). Matches the Claude Design footer .soc button:
 * a rounded light-gray square with a gray glyph. Output: public/images/ui/social/.
 * Run once: node scripts/gen-social-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "ui", "social");
mkdirSync(OUT, { recursive: true });

// 24x24 glyph paths lifted from the Claude Design footer (source of truth).
const GLYPHS = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  tiktok:
    "M13.6 3h2.7c.3 2.2 1.9 3.8 4 4v2.7c-1.5 0-2.8-.5-4-1.3v6.1a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.8a3 3 0 1 0 2.2 2.9V3z",
  x:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  facebook:
    "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.684 4.533-4.684 1.312 0 2.686.235 2.686.235v2.96H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
};

const SIZE = 56; // 2x of a 28px display icon
const BG = "#f3f3f7";
const FG = "#6b7280";
const RADIUS = 16;
const GLYPH = 30; // glyph box within the button
const OFFSET = (SIZE - GLYPH) / 2;
const SCALE = GLYPH / 24;

async function make(name, path) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="${BG}"/>
    <g transform="translate(${OFFSET} ${OFFSET}) scale(${SCALE})"><path d="${path}" fill="${FG}"/></g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${name}.png`));
  console.log("wrote", `${name}.png`);
}

await Promise.all(Object.entries(GLYPHS).map(([n, p]) => make(n, p)));
console.log("done ->", OUT);
