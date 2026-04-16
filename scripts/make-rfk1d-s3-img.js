/**
 * Build RF.K.1d S3 "Let's Match Some Letters!" image.
 * Shows uppercase/lowercase letter pairs with matching lines:
 *   B ←→ b    D ←→ d    S ←→ s
 */

const sharp = require("sharp");

const OUT = "public/images/lessons/RF.K.1d/S3.png";
const W = 900;
const H = 480;
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";

const PAIRS = [
  { upper: "B", lower: "b", color: "#6366f1" },
  { upper: "D", lower: "d", color: "#f59e0b" },
  { upper: "S", lower: "s", color: "#10b981" },
];

const parts = [];

// Background + card
parts.push(`<rect width="${W}" height="${H}" fill="#fefce8"/>`);
parts.push(`<rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="24" fill="#ffffff" stroke="#e5e7eb" stroke-width="3"/>`);

// Layout 3 pairs across the width
const pairWidth = (W - 120) / 3;
PAIRS.forEach((pair, i) => {
  const cx = 60 + pairWidth * i + pairWidth / 2;
  const upperY = 170;
  const lowerY = 330;

  // Uppercase letter in a colored circle
  parts.push(`<circle cx="${cx}" cy="${upperY}" r="60" fill="${pair.color}" opacity="0.15" stroke="${pair.color}" stroke-width="4"/>`);
  parts.push(`<text x="${cx}" y="${upperY + 8}" font-family="${FONT}" font-size="72" font-weight="800" fill="${pair.color}" text-anchor="middle" dominant-baseline="middle">${pair.upper}</text>`);

  // Lowercase letter in a colored circle
  parts.push(`<circle cx="${cx}" cy="${lowerY}" r="50" fill="${pair.color}" opacity="0.1" stroke="${pair.color}" stroke-width="3"/>`);
  parts.push(`<text x="${cx}" y="${lowerY + 6}" font-family="${FONT}" font-size="56" font-weight="700" fill="${pair.color}" text-anchor="middle" dominant-baseline="middle">${pair.lower}</text>`);

  // Matching line between them
  parts.push(`<line x1="${cx}" y1="${upperY + 62}" x2="${cx}" y2="${lowerY - 52}" stroke="${pair.color}" stroke-width="4" stroke-dasharray="8,6"/>`);

  // Green check at midpoint
  const midY = (upperY + lowerY) / 2;
  parts.push(`
    <g transform="translate(${cx + 25}, ${midY - 12})">
      <circle cx="0" cy="0" r="14" fill="#22c55e"/>
      <path d="M -7 0 L -2 6 L 8 -5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
  `);
});

// Labels
parts.push(`<text x="${W / 2}" y="105" font-family="${FONT}" font-size="24" font-weight="700" fill="#6b7280" text-anchor="middle">UPPERCASE</text>`);
parts.push(`<text x="${W / 2}" y="${H - 65}" font-family="${FONT}" font-size="24" font-weight="700" fill="#6b7280" text-anchor="middle">lowercase</text>`);

const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  parts.join("") +
  `</svg>`
);

(async () => {
  await sharp(svg).png().toFile(OUT);
  console.log(`wrote ${OUT}`);
})();
