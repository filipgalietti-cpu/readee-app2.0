/**
 * Build an animated "Let's Try It Together!" GIF for RF.K.1a slide 3.
 *
 * Renders a two-line kid-friendly sentence ("The cat sat" / "on a mat")
 * as SVG and produces a sequence of frames where each word lights up in
 * turn with a yellow highlight, plus a small green arrow pointing at it.
 * Frames are converted to PNG via sharp, stitched to GIF via ffmpeg.
 *
 * Pattern reusable for any "karaoke-style" reading slide.
 */

const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const OUT_DIR = "public/images/lessons/RF.K.1a";
const W = 800;
const H = 500;

// Kid-friendly sans font stack. We embed the text as <text> elements; sharp
// will render them using the system fonts (macOS has "Helvetica"/"Arial"
// available by default — safe on Vercel since we're rendering locally).
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";
const FONT_SIZE = 64;
const LINE_HEIGHT = 120;

// Two lines of words.
const LINES = [
  ["The", "cat", "sat"],
  ["on", "a", "mat"],
];

// Layout: pre-compute x positions for each word based on approximate widths.
// Easiest reliable method: allocate a slot of size proportional to letter count.
function layoutLines() {
  const out = [];
  const lineCenterX = W / 2;
  const lineYStart = 170;
  LINES.forEach((words, li) => {
    // Estimate widths: ~0.55 * FONT_SIZE per char for Comic Sans-ish
    const widths = words.map((w) => Math.max(120, w.length * FONT_SIZE * 0.6));
    const gap = 32;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = lineCenterX - total / 2;
    const y = lineYStart + li * LINE_HEIGHT;
    const lineWords = words.map((word, wi) => {
      const wWidth = widths[wi];
      const wordBox = { word, x, y, w: wWidth, h: FONT_SIZE + 20, lineIdx: li };
      x += wWidth + gap;
      return wordBox;
    });
    out.push(lineWords);
  });
  return out;
}

function frameSVG(layout, activeWord /* { li, wi } | null */) {
  const lineToRender = [];

  layout.forEach((lineWords, li) => {
    lineWords.forEach((wb, wi) => {
      const isActive = activeWord && activeWord.li === li && activeWord.wi === wi;
      const isPast =
        activeWord &&
        (li < activeWord.li || (li === activeWord.li && wi < activeWord.wi));

      // Background highlight for active word
      if (isActive) {
        lineToRender.push(
          `<rect x="${wb.x - 10}" y="${wb.y - FONT_SIZE + 8}" width="${wb.w + 20}" height="${FONT_SIZE + 20}" rx="14" fill="#fef08a" stroke="#facc15" stroke-width="3"/>`
        );
      }
      // Color: past = muted, active = dark green, future = black
      const fill = isActive ? "#166534" : isPast ? "#94a3b8" : "#1e293b";
      const weight = isActive ? "700" : "600";
      lineToRender.push(
        `<text x="${wb.x + wb.w / 2}" y="${wb.y + 5}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${weight}" fill="${fill}" text-anchor="middle" dominant-baseline="middle">${wb.word}</text>`
      );
    });
  });

  // Green arrow pointing at active word
  let arrow = "";
  if (activeWord) {
    const wb = layout[activeWord.li][activeWord.wi];
    const cx = wb.x + wb.w / 2;
    const cy = wb.y + 45;
    arrow = `
      <polygon points="${cx - 20},${cy + 20} ${cx + 20},${cy + 20} ${cx},${cy + 45}" fill="#22c55e"/>
      <rect x="${cx - 4}" y="${cy + 10}" width="8" height="18" rx="3" fill="#22c55e"/>
    `;
  }

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#fefce8"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="24" fill="#ffffff" stroke="#fde68a" stroke-width="4"/>
  ${lineToRender.join("\n  ")}
  ${arrow}
</svg>
  `.trim());
}

(async () => {
  const layout = layoutLines();
  const frames = [];
  // Frame 0: blank (no highlight)
  frames.push(frameSVG(layout, null));
  // Frame per word, top-to-bottom left-to-right
  LINES.forEach((words, li) => {
    words.forEach((_, wi) => {
      frames.push(frameSVG(layout, { li, wi }));
    });
  });

  // Write each frame as PNG
  for (let i = 0; i < frames.length; i++) {
    await sharp(frames[i]).png().toFile(`${OUT_DIR}/S3-frame${i}.png`);
  }
  console.log(`${frames.length} frames written.`);

  // Stitch with ffmpeg (~0.7s per frame)
  execSync(
    `ffmpeg -y -framerate 1.4 -i ${OUT_DIR}/S3-frame%d.png -vf "fps=15,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer" -loop 0 ${OUT_DIR}/S3.gif`,
    { stdio: "inherit" }
  );
  console.log(`gif at ${OUT_DIR}/S3.gif`);
})();
