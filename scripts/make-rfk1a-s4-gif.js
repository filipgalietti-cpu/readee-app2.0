/**
 * Build per-step visuals for RF.K.1a slide 4 "A Helpful Trick!".
 *
 * Output:
 *   S4-a.png — finger resting at the start of a row (step a: "Use your finger to help you!")
 *   S4-b.gif — finger slides left → right under "The cat sat" (step b: "Put your finger under the first word. Then slide it to the right as you read!")
 *   S4-c.png — finger at end of the row with a happy checkmark (step c: "Your finger is like a reading guide.")
 */

const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const OUT_DIR = "public/images/lessons/RF.K.1a";
const W = 800;
const H = 500;

const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";
const FONT_SIZE = 70;

const WORDS = ["The", "cat", "sat"];

function layoutRow() {
  const widths = WORDS.map((w) => Math.max(130, w.length * FONT_SIZE * 0.6));
  const gap = 50;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (WORDS.length - 1);
  const rowY = 210;
  let x = (W - total) / 2;
  return WORDS.map((word, wi) => {
    const wWidth = widths[wi];
    const box = { word, x, y: rowY, w: wWidth };
    x += wWidth + gap;
    return box;
  });
}

/**
 * fingerPosition ∈ [0, 1] — normalized position along the row.
 * 0 = aligned with start of first word, 1 = aligned with end of last word.
 * if null, no finger shown at all.
 */
function frameSVG(row, fingerPosition, showCheck = false) {
  const parts = [];
  // Words
  row.forEach((wb) => {
    parts.push(
      `<text x="${wb.x + wb.w / 2}" y="${wb.y + 5}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="700" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">${wb.word}</text>`
    );
  });

  // Green horizontal arrow running the full length of the row, showing intended motion
  const rowLeftX = row[0].x - 10;
  const rowRightX = row[row.length - 1].x + row[row.length - 1].w + 10;
  const arrowY = row[0].y + FONT_SIZE - 4;
  // Shaft (short of arrowhead)
  const headW = 40;
  parts.push(
    `<rect x="${rowLeftX}" y="${arrowY - 6}" width="${rowRightX - rowLeftX - headW + 4}" height="12" rx="6" fill="#22c55e"/>`
  );
  // Arrowhead triangle at the right end
  parts.push(
    `<polygon points="${rowRightX - headW},${arrowY - 22} ${rowRightX},${arrowY} ${rowRightX - headW},${arrowY + 22}" fill="#16a34a"/>`
  );

  // Cartoon pointing hand positioned along the row (pointing up at the words)
  if (fingerPosition !== null) {
    const travelLeft = rowLeftX + 10;
    const travelRight = rowRightX - headW - 10;
    const tipX = travelLeft + (travelRight - travelLeft) * fingerPosition;
    const tipY = arrowY + 15; // fingertip touches just under the arrow
    // Cartoon hand: palm + extended index finger pointing up + thumb + curled fingers
    // Whole hand is ~80 wide x 130 tall. Translate so the index fingertip lands at (tipX, tipY).
    parts.push(
      `<g transform="translate(${tipX - 40}, ${tipY})">
        <!-- Curled fingers (behind, to the right of the palm) -->
        <path d="M 62 62 Q 78 58 78 75 L 78 100 Q 78 114 62 114 Z" fill="#f8c999" stroke="#8b4513" stroke-width="2.5"/>
        <path d="M 55 56 Q 70 52 72 70 L 72 105 Q 72 119 56 119 Z" fill="#fcd9b6" stroke="#8b4513" stroke-width="2.5"/>
        <!-- Palm / back of hand -->
        <path d="M 22 65 Q 22 48 40 48 L 56 48 Q 72 48 72 72 L 72 115 Q 72 135 50 135 L 30 135 Q 22 135 22 120 Z"
              fill="#fcd9b6" stroke="#8b4513" stroke-width="3"/>
        <!-- Index finger (extended UP) -->
        <rect x="30" y="-8" width="24" height="68" rx="12" fill="#fcd9b6" stroke="#8b4513" stroke-width="3"/>
        <!-- Fingertip dome highlight -->
        <ellipse cx="42" cy="-2" rx="7" ry="4" fill="#fff3e0" opacity="0.9"/>
        <!-- Knuckle crease on finger -->
        <line x1="33" y1="28" x2="51" y2="28" stroke="#8b4513" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <!-- Thumb (curved, on left side of palm) -->
        <path d="M 22 78 Q 4 82 6 100 Q 8 118 22 118 L 22 80 Z"
              fill="#fcd9b6" stroke="#8b4513" stroke-width="3"/>
        <!-- Wrist cuff (subtle) -->
        <rect x="24" y="130" width="44" height="14" rx="7" fill="#a78bfa" stroke="#6d28d9" stroke-width="2.5"/>
      </g>`
    );
  }

  if (showCheck) {
    // Green checkmark in the top-right corner
    parts.push(
      `<g transform="translate(${W - 120}, 80)">
        <circle cx="30" cy="30" r="38" fill="#22c55e"/>
        <path d="M 15 32 L 27 44 L 47 20" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>`
    );
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="#fefce8"/>` +
    `<rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="24" fill="#ffffff" stroke="#fde68a" stroke-width="4"/>` +
    parts.join("") +
    `</svg>`
  );
}

async function svgToPng(svg, outPath) {
  await sharp(svg).png().toFile(outPath);
}

async function stitchGif(segments, outGif) {
  const listPath = `${OUT_DIR}/.concat-s4.txt`;
  const lines = [];
  segments.forEach((seg) => {
    lines.push(`file '${seg.file.replace(OUT_DIR + "/", "")}'`);
    lines.push(`duration ${seg.duration.toFixed(3)}`);
  });
  lines.push(`file '${segments[segments.length - 1].file.replace(OUT_DIR + "/", "")}'`);
  fs.writeFileSync(listPath, lines.join("\n"));
  execSync(
    `ffmpeg -y -f concat -safe 0 -i ${listPath} -vf "fps=20,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer" -loop 0 ${OUT_DIR}/${outGif}`,
    { stdio: "inherit" }
  );
  fs.unlinkSync(listPath);
}

(async () => {
  // Clean up old S4 frames
  fs.readdirSync(OUT_DIR)
    .filter((f) => f.startsWith("S4-") && (f.endsWith(".png") || f.endsWith(".gif")))
    .forEach((f) => fs.unlinkSync(`${OUT_DIR}/${f}`));

  const row = layoutRow();

  // S4a: finger at the start of the row (no motion yet)
  await svgToPng(frameSVG(row, 0), `${OUT_DIR}/S4-a.png`);

  // S4b: animate finger from left to right.
  // Measured from ffmpeg silencedetect on new S4b (7.78s total):
  //   0.27-3.31s  "Put your finger under the first word."
  //   3.99-7.23s  "Then slide it to the right as you read."
  //   7.23+       tail silence (0.55s)
  const FRAMES = 30; // smoothness of slide
  const slideStart = 4.0; // finger begins moving when narrator says "Then slide it…"
  const slideDur = 3.2;   // reach right edge by end of second sentence (~7.2s)
  const holdTail = 0.58;  // short hold at right during tail silence

  // Write a hold frame at position 0, then a sequence of frames from 0→1.
  await svgToPng(frameSVG(row, 0), `${OUT_DIR}/S4-bhold.png`);
  const slideFrames = [];
  for (let i = 0; i <= FRAMES; i++) {
    const t = i / FRAMES;
    const path = `${OUT_DIR}/S4-bslide${i}.png`;
    await svgToPng(frameSVG(row, t), path);
    slideFrames.push(path);
  }

  const segments = [
    { file: `${OUT_DIR}/S4-bhold.png`, duration: slideStart },
  ];
  for (let i = 0; i < slideFrames.length; i++) {
    segments.push({ file: slideFrames[i], duration: slideDur / FRAMES });
  }
  // Hold the final frame
  segments.push({ file: slideFrames[slideFrames.length - 1], duration: holdTail });
  await stitchGif(segments, "S4-b.gif");

  // S4c: finger at end of row + checkmark (proud summary)
  await svgToPng(frameSVG(row, 1, true), `${OUT_DIR}/S4-c.png`);

  console.log(`Done. S4-a.png + S4-b.gif + S4-c.png written.`);
})();
