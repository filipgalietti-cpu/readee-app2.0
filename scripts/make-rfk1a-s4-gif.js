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
const path = require("path");
const { execSync } = require("child_process");

const OUT_DIR = "public/images/lessons/RF.K.1a";
const W = 800;
const H = 500;

// Inlined from Downloads/backhand-index-pointing-up-svgrepo-com.svg (SVG Repo, free-to-use).
// Strip the outer <svg>…</svg> wrapper and keep the inner content so we can translate+scale it.
const HAND_SVG_RAW = fs.readFileSync(path.resolve(__dirname, "hand-pointer.svg"), "utf-8");
const HAND_INNER = HAND_SVG_RAW
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
// Natural viewBox is 80x80 with the index fingertip at roughly (35, 6).
const HAND_NATIVE = 80;
const HAND_TIP_X = 35;   // x coord of the fingertip inside the 80x80 viewBox
const HAND_TIP_Y = 6;    // y coord of the fingertip
const HAND_DISPLAY_SIZE = 120; // final on-slide size in px

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

  // Cartoon pointing hand (Twemoji 👆) positioned so the fingertip lands on the arrow.
  if (fingerPosition !== null) {
    const travelLeft = rowLeftX + 10;
    const travelRight = rowRightX - headW - 10;
    const tipX = travelLeft + (travelRight - travelLeft) * fingerPosition;
    const tipY = arrowY + 15; // fingertip sits just under the arrow
    const scale = HAND_DISPLAY_SIZE / HAND_NATIVE;
    const offsetX = tipX - HAND_TIP_X * scale;
    const offsetY = tipY - HAND_TIP_Y * scale;
    parts.push(
      `<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${HAND_INNER}</g>`
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
  // Final frame variant WITH the checkmark — used to end S4-b.gif and as S4-c.png.
  // Makes the step b → step c image swap seamless (both show finger-at-end + check).
  const bFinalChecked = `${OUT_DIR}/S4-bfinal-check.png`;
  await svgToPng(frameSVG(row, 1, true), bFinalChecked);

  const segments = [
    { file: `${OUT_DIR}/S4-bhold.png`, duration: slideStart },
  ];
  for (let i = 0; i < slideFrames.length; i++) {
    segments.push({ file: slideFrames[i], duration: slideDur / FRAMES });
  }
  // Short beat at the right edge without the check, then flip to the checked frame
  // for the remainder of the tail so the transition to S4-c.png is seamless.
  segments.push({ file: slideFrames[slideFrames.length - 1], duration: 0.15 });
  segments.push({ file: bFinalChecked, duration: Math.max(0.05, holdTail - 0.15) });
  await stitchGif(segments, "S4-b.gif");

  // S4c PNG: identical to the last frame of the GIF so there's no visual change
  // on the image-file swap.
  fs.copyFileSync(bFinalChecked, `${OUT_DIR}/S4-c.png`);

  console.log(`Done. S4-a.png + S4-b.gif + S4-c.png written.`);
})();
