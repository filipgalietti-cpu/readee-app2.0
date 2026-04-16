/**
 * Build per-step GIFs for RF.K.1a slide 3 "Let's Try It Together!".
 *
 * Produces THREE files so the image can advance in sync with the audio:
 *   S3-a.png — blank sentence, no highlights (for step a: "Watch my finger!")
 *   S3-b.gif — line 1 karaoke (The → cat → sat) timed ~matches S3b audio
 *   S3-c.gif — line 1 grayed + line 2 karaoke (on → a → mat)
 *
 * Each GIF ends on a hold frame so the final word stays highlighted
 * while the next step's audio starts.
 *
 * Green arrow sits ABOVE the word pointing DOWN at it (visually
 * clearer than below-and-up for reading direction).
 */

const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const OUT_DIR = "public/images/lessons/RF.K.1a";
const W = 800;
const H = 500;

const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";
const FONT_SIZE = 64;
const LINE_HEIGHT = 130;

const LINES = [
  ["The", "cat", "sat"],
  ["on", "a", "mat"],
];

function layoutLines() {
  const out = [];
  const lineCenterX = W / 2;
  const lineYStart = 200;
  LINES.forEach((words, li) => {
    const widths = words.map((w) => Math.max(120, w.length * FONT_SIZE * 0.6));
    const gap = 40;
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

/**
 * Render one frame.
 * activeWord = { li, wi } | null — current spotlighted word
 * completedLines = set of line indices that have been fully read (grayed out)
 */
function frameSVG(layout, activeWord, completedLines = new Set()) {
  const parts = [];

  layout.forEach((lineWords, li) => {
    lineWords.forEach((wb, wi) => {
      const isActive = activeWord && activeWord.li === li && activeWord.wi === wi;
      const isPast =
        completedLines.has(li) ||
        (activeWord && activeWord.li === li && wi < activeWord.wi);

      // Yellow highlight box behind active word
      if (isActive) {
        parts.push(
          `<rect x="${wb.x - 10}" y="${wb.y - FONT_SIZE + 8}" width="${wb.w + 20}" height="${FONT_SIZE + 20}" rx="14" fill="#fef08a" stroke="#facc15" stroke-width="4"/>`
        );
      }
      const fill = isActive ? "#166534" : isPast ? "#cbd5e1" : "#1e293b";
      const weight = isActive ? "700" : "600";
      parts.push(
        `<text x="${wb.x + wb.w / 2}" y="${wb.y + 5}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${weight}" fill="${fill}" text-anchor="middle" dominant-baseline="middle">${wb.word}</text>`
      );
    });
  });

  // Green arrow ABOVE the active word, pointing DOWN at it.
  if (activeWord) {
    const wb = layout[activeWord.li][activeWord.wi];
    const cx = wb.x + wb.w / 2;
    const arrowBottomY = wb.y - FONT_SIZE + 2; // tip sits just above the word's highlight box
    const arrowTopY = arrowBottomY - 55;
    // Shaft
    parts.push(
      `<rect x="${cx - 5}" y="${arrowTopY}" width="10" height="38" rx="4" fill="#22c55e"/>`
    );
    // Downward triangle
    parts.push(
      `<polygon points="${cx - 22},${arrowTopY + 30} ${cx + 22},${arrowTopY + 30} ${cx},${arrowBottomY}" fill="#16a34a"/>`
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

/**
 * Stitch a sequence of PNGs into a GIF using ffmpeg's concat demuxer
 * so each frame can have its own duration.
 *   segments = [{ file: "framePath.png", duration: secondsToHold }, ...]
 * The last segment's duration is the hold on the final frame.
 */
async function stitchGif(segments, outGif) {
  const listPath = `${OUT_DIR}/.concat.txt`;
  const lines = [];
  segments.forEach((seg, i) => {
    lines.push(`file '${seg.file.replace(OUT_DIR + "/", "")}'`);
    lines.push(`duration ${seg.duration.toFixed(3)}`);
  });
  // concat demuxer requires the last file listed twice without a duration.
  lines.push(`file '${segments[segments.length - 1].file.replace(OUT_DIR + "/", "")}'`);
  fs.writeFileSync(listPath, lines.join("\n"));

  execSync(
    `ffmpeg -y -f concat -safe 0 -i ${listPath} -vf "fps=15,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer" -loop 0 ${OUT_DIR}/${outGif}`,
    { stdio: "inherit" }
  );
  fs.unlinkSync(listPath);
}

(async () => {
  // Clean up old frames/gifs
  fs.readdirSync(OUT_DIR)
    .filter((f) => f.startsWith("S3-") && (f.endsWith(".png") || f.endsWith(".gif")))
    .forEach((f) => fs.unlinkSync(`${OUT_DIR}/${f}`));

  const layout = layoutLines();

  // ── Step a: blank PNG (just the sentence) ──
  await svgToPng(frameSVG(layout, null), `${OUT_DIR}/S3-a.png`);

  // ── Step b: line 1 karaoke (The → cat → sat) ──
  // Timings derived from ffmpeg silencedetect on S3b.mp3 (6.6s total):
  //   0.19-2.28s  "I start here on the left."
  //   2.84-3.59s  "I read."
  //   4.13-5.08s  "the cat"     (spoken as a phrase; "The" starts at 4.13)
  //   5.46-6.08s  "sat"
  //   6.08-6.61s  tail silence
  await svgToPng(frameSVG(layout, null), `${OUT_DIR}/S3-b0.png`);
  await svgToPng(frameSVG(layout, { li: 0, wi: 0 }), `${OUT_DIR}/S3-b1.png`); // "The"
  await svgToPng(frameSVG(layout, { li: 0, wi: 1 }), `${OUT_DIR}/S3-b2.png`); // "cat"
  await svgToPng(frameSVG(layout, { li: 0, wi: 2 }), `${OUT_DIR}/S3-b3.png`); // "sat"
  await stitchGif(
    [
      { file: `${OUT_DIR}/S3-b0.png`, duration: 4.13 }, // blank through "I read"
      { file: `${OUT_DIR}/S3-b1.png`, duration: 0.35 }, // "The"
      { file: `${OUT_DIR}/S3-b2.png`, duration: 1.0 },  // "cat" (covers pause before "sat")
      { file: `${OUT_DIR}/S3-b3.png`, duration: 1.15 }, // "sat" + tail
    ],
    "S3-b.gif"
  );

  // ── Step c: line 1 grayed + line 2 karaoke (on → a → mat) ──
  // Timings from S3c.mp3 (9.3s):
  //   0.24-3.75s  "Now I drop down to the next line."
  //   4.42-6.09s  "I start on the left again."
  //   6.79-7.36s  "On"
  //   7.63-8.04s  "a"
  //   8.26-8.64s  "mat"
  //   8.90+       tail silence
  const completed = new Set([0]);
  await svgToPng(frameSVG(layout, null, completed),            `${OUT_DIR}/S3-c0.png`);
  await svgToPng(frameSVG(layout, { li: 1, wi: 0 }, completed), `${OUT_DIR}/S3-c1.png`); // "on"
  await svgToPng(frameSVG(layout, { li: 1, wi: 1 }, completed), `${OUT_DIR}/S3-c2.png`); // "a"
  await svgToPng(frameSVG(layout, { li: 1, wi: 2 }, completed), `${OUT_DIR}/S3-c3.png`); // "mat"
  await stitchGif(
    [
      { file: `${OUT_DIR}/S3-c0.png`, duration: 6.79 }, // blank through "start on the left again"
      { file: `${OUT_DIR}/S3-c1.png`, duration: 0.84 }, // "On"
      { file: `${OUT_DIR}/S3-c2.png`, duration: 0.63 }, // "a"
      { file: `${OUT_DIR}/S3-c3.png`, duration: 1.05 }, // "mat" + tail
    ],
    "S3-c.gif"
  );

  console.log(`Done. S3-a.png + S3-b.gif + S3-c.gif written to ${OUT_DIR}`);
})();
