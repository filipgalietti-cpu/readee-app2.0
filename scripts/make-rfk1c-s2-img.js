/**
 * Build RF.K.1c S2 "Why Do We Need Spaces?" illustration.
 *
 * Shows the exact TTS demo: "thecatsat" (smushed, hard to read) on top,
 * "the cat sat" (properly spaced) on the bottom, with clear visual markers
 * highlighting where spaces go.
 */

const sharp = require("sharp");

const OUT = "public/images/lessons/RF.K.1c/S2.png";
const W = 900;
const H = 560;
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#fefce8"/>

  <!-- Top card: bad version (no spaces) -->
  <rect x="60" y="60" width="${W - 120}" height="180" rx="24" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/>

  <!-- Red X badge -->
  <g transform="translate(${W - 140}, 90)">
    <circle cx="0" cy="0" r="30" fill="#ef4444"/>
    <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke="white" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- Squished text -->
  <text x="${W / 2}" y="175" font-family="${FONT}" font-size="86" font-weight="800" fill="#991b1b" text-anchor="middle" dominant-baseline="middle">thecatsat</text>

  <!-- Divider arrow -->
  <g transform="translate(${W / 2}, 290)">
    <rect x="-8" y="-30" width="16" height="50" rx="8" fill="#6366f1"/>
    <polygon points="-24,15 24,15 0,45" fill="#4f46e5"/>
  </g>

  <!-- Bottom card: good version (with spaces) -->
  <rect x="60" y="360" width="${W - 120}" height="180" rx="24" fill="#dcfce7" stroke="#22c55e" stroke-width="4"/>

  <!-- Green check badge -->
  <g transform="translate(${W - 140}, 390)">
    <circle cx="0" cy="0" r="30" fill="#22c55e"/>
    <path d="M -14 0 L -4 12 L 16 -10" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>

  <!-- Three words with clear spaces between them -->
  <!-- "the" -->
  <text x="240" y="475" font-family="${FONT}" font-size="86" font-weight="800" fill="#166534" text-anchor="middle" dominant-baseline="middle">the</text>
  <!-- space marker 1 -->
  <circle cx="340" cy="475" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
  <!-- "cat" -->
  <text x="440" y="475" font-family="${FONT}" font-size="86" font-weight="800" fill="#166534" text-anchor="middle" dominant-baseline="middle">cat</text>
  <!-- space marker 2 -->
  <circle cx="540" cy="475" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
  <!-- "sat" -->
  <text x="640" y="475" font-family="${FONT}" font-size="86" font-weight="800" fill="#166534" text-anchor="middle" dominant-baseline="middle">sat</text>
</svg>
`.trim());

(async () => {
  await sharp(svg).png().toFile(OUT);
  console.log(`wrote ${OUT}`);
})();
