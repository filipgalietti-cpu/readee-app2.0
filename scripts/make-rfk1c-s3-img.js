/**
 * Build RF.K.1c S3 example image: "I [👆] like [👆] dogs" with finger-space markers.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = "public/images/lessons/RF.K.1c/S3.png";
const W = 900;
const H = 420;
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";
const LETTER_SIZE = 96;

const HAND_SVG_RAW = fs.readFileSync(path.resolve(__dirname, "hand-pointer.svg"), "utf-8");
const HAND_INNER = HAND_SVG_RAW
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const HAND_NATIVE = 80;
const HAND_TIP_X = 35;
const HAND_TIP_Y = 6;

const WORDS = ["I", "like", "dogs"];

const wordWidths = WORDS.map((w) => Math.max(80, w.length * LETTER_SIZE * 0.6));
const gap = 130;
const total = wordWidths.reduce((a, b) => a + b, 0) + gap * (WORDS.length - 1);
const startX = (W - total) / 2;
const rowY = 230;

const wordPositions = (() => {
  let x = startX;
  const out = [];
  WORDS.forEach((w, i) => {
    const wWidth = wordWidths[i];
    out.push({ word: w, cx: x + wWidth / 2, startX: x, endX: x + wWidth });
    x += wWidth + gap;
  });
  return out;
})();

const parts = [];

parts.push(
  `<rect x="60" y="80" width="${W - 120}" height="260" rx="24" fill="#dcfce7" stroke="#22c55e" stroke-width="4"/>`
);

// Words
wordPositions.forEach((wp) => {
  parts.push(
    `<text x="${wp.cx}" y="${rowY + 5}" font-family="${FONT}" font-size="${LETTER_SIZE}" font-weight="800" fill="#166534" text-anchor="middle" dominant-baseline="middle">${wp.word}</text>`
  );
});

// Finger emojis between adjacent words
const HAND_DISPLAY = 78;
const scale = HAND_DISPLAY / HAND_NATIVE;
for (let i = 0; i < wordPositions.length - 1; i++) {
  const left = wordPositions[i].endX;
  const right = wordPositions[i + 1].startX;
  const midX = (left + right) / 2;
  const tipY = rowY + 35;
  const offsetX = midX - HAND_TIP_X * scale;
  const offsetY = tipY - HAND_TIP_Y * scale;
  parts.push(`<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${HAND_INNER}</g>`);
}

// Green check in corner
parts.push(`
  <g transform="translate(${W - 130}, 110)">
    <circle cx="0" cy="0" r="30" fill="#22c55e"/>
    <path d="M -13 0 L -3 11 L 14 -10" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
`);

const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="#fefce8"/>` +
  parts.join("") +
  `</svg>`
);

(async () => {
  await sharp(svg).png().toFile(OUT);
  console.log(`wrote ${OUT}`);
})();
