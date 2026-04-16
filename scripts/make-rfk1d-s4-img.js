/**
 * Build RF.K.1d S4 "A Helpful Trick!" image:
 * A chart of all 26 letters showing uppercase + lowercase pairs.
 */

const sharp = require("sharp");

const OUT = "public/images/lessons/RF.K.1d/S4.png";
const W = 900;
const H = 600;
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const COLS = 7;
const ROWS = Math.ceil(LETTERS.length / COLS); // 4 rows

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#0ea5e9"];

const cellW = 110;
const cellH = 120;
const gridW = COLS * cellW;
const gridH = ROWS * cellH;
const startX = (W - gridW) / 2;
const startY = (H - gridH) / 2 + 15;

const parts = [];

// Background
parts.push(`<rect width="${W}" height="${H}" fill="#fefce8"/>`);
parts.push(`<rect x="30" y="25" width="${W - 60}" height="${H - 50}" rx="24" fill="#ffffff" stroke="#e5e7eb" stroke-width="3"/>`);

// Title
parts.push(`<text x="${W / 2}" y="60" font-family="${FONT}" font-size="24" font-weight="800" fill="#4b5563" text-anchor="middle">UPPERCASE &amp; lowercase</text>`);

LETTERS.forEach((letter, idx) => {
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  const cx = startX + col * cellW + cellW / 2;
  const cy = startY + row * cellH + cellH / 2;
  const color = COLORS[idx % COLORS.length];

  // Cell background
  parts.push(`<rect x="${cx - cellW / 2 + 4}" y="${cy - cellH / 2 + 4}" width="${cellW - 8}" height="${cellH - 8}" rx="14" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="2" stroke-opacity="0.3"/>`);

  // Uppercase
  parts.push(`<text x="${cx}" y="${cy - 15}" font-family="${FONT}" font-size="36" font-weight="800" fill="${color}" text-anchor="middle" dominant-baseline="middle">${letter}</text>`);

  // Lowercase
  parts.push(`<text x="${cx}" y="${cy + 28}" font-family="${FONT}" font-size="28" font-weight="600" fill="${color}" text-anchor="middle" dominant-baseline="middle" opacity="0.7">${letter.toLowerCase()}</text>`);
});

const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  parts.join("") +
  `</svg>`
);

(async () => {
  await sharp(svg).png().toFile(OUT);
  console.log(`wrote ${OUT}`);
})();
