/**
 * Build per-step "spaces teach" animation for RF.K.1c S2.
 *
 * Produces:
 *   S2-a.png — squished "thecatsat" in a red ✗ card (for step a: "Look at this: thecatsat...")
 *   S2-b.gif — squished → animates apart into "the cat sat" (for step b: "Now look: the cat sat...")
 *   S2-c.png — "the cat sat" with yellow space-dots + green ✓ (for step c: "One finger space!")
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT_DIR = "public/images/lessons/RF.K.1c";
const W = 900;
const H = 480;
const FONT = "'Comic Sans MS', 'Comic Neue', 'Baloo 2', 'Chalkboard SE', Arial, sans-serif";
const LETTER_SIZE = 90;

// Yellow Twemoji 👆 — reused from scripts/hand-pointer.svg for the "one finger space" marker.
const HAND_SVG_RAW = fs.readFileSync(path.resolve(__dirname, "hand-pointer.svg"), "utf-8");
const HAND_INNER = HAND_SVG_RAW
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const HAND_NATIVE = 80;
const HAND_TIP_X = 35;
const HAND_TIP_Y = 6;

const LETTERS = ["t", "h", "e", "c", "a", "t", "s", "a", "t"];
// Which letters are the START of a word (indexes in LETTERS).
const WORD_STARTS = [0, 3, 6]; // "t"(the), "c"(cat), "s"(sat)

function letterXPositions(gap) {
  // Base letter width ~0.55 * LETTER_SIZE
  const charW = LETTER_SIZE * 0.55;
  // Compute total width so we can center.
  let total = 0;
  for (let i = 0; i < LETTERS.length; i++) {
    if (i > 0 && WORD_STARTS.includes(i)) total += gap;
    total += charW;
  }
  let x = (W - total) / 2 + charW / 2;
  const out = [];
  for (let i = 0; i < LETTERS.length; i++) {
    if (i > 0 && WORD_STARTS.includes(i)) x += gap;
    out.push(x);
    x += charW;
  }
  return out;
}

/**
 * Render a frame.
 *   state: "bad" | "good"
 *   gap:   extra horizontal gap inserted at each word boundary (px)
 *   showSpaceDots: show small yellow dots in the gaps (S2-c final frame)
 */
function frameSVG({ state, gap = 0, showSpaceDots = false }) {
  const positions = letterXPositions(gap);
  const letterY = 210;
  const cardColor = state === "bad"
    ? { fill: "#fee2e2", stroke: "#ef4444", textFill: "#991b1b" }
    : { fill: "#dcfce7", stroke: "#22c55e", textFill: "#166534" };

  const letters = LETTERS.map(
    (ch, i) =>
      `<text x="${positions[i]}" y="${letterY + 5}" font-family="${FONT}" font-size="${LETTER_SIZE}" font-weight="800" fill="${cardColor.textFill}" text-anchor="middle" dominant-baseline="middle">${ch}</text>`
  ).join("");

  // Card dimensions fit the content
  const cardTop = 80;
  const cardBottom = 340;
  const cardLeftX = 60;
  const cardRightX = W - 60;

  let badge = "";
  if (state === "bad") {
    badge = `
      <g transform="translate(${W - 120}, ${cardTop + 30})">
        <circle cx="0" cy="0" r="28" fill="#ef4444"/>
        <path d="M -11 -11 L 11 11 M 11 -11 L -11 11" stroke="white" stroke-width="5" stroke-linecap="round"/>
      </g>
    `;
  } else {
    badge = `
      <g transform="translate(${W - 120}, ${cardTop + 30})">
        <circle cx="0" cy="0" r="28" fill="#22c55e"/>
        <path d="M -12 0 L -3 10 L 13 -9" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    `;
  }

  // "One finger space" markers — small Twemoji pointing hands sit in the gap
  // between each pair of words.
  let spaceDots = "";
  if (showSpaceDots && gap > 0) {
    const HAND_DISPLAY = 72;
    const scale = HAND_DISPLAY / HAND_NATIVE;
    for (let i = 1; i < LETTERS.length; i++) {
      if (!WORD_STARTS.includes(i)) continue;
      const midX = (positions[i - 1] + positions[i]) / 2 + LETTER_SIZE * 0.14;
      // Anchor the fingertip just below the text baseline so the hand sits in
      // the gap pointing up at the space.
      const tipX = midX;
      const tipY = letterY + 30;
      const offsetX = tipX - HAND_TIP_X * scale;
      const offsetY = tipY - HAND_TIP_Y * scale;
      spaceDots += `<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${HAND_INNER}</g>`;
    }
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="#fefce8"/>` +
    `<rect x="${cardLeftX}" y="${cardTop}" width="${cardRightX - cardLeftX}" height="${cardBottom - cardTop}" rx="24" fill="${cardColor.fill}" stroke="${cardColor.stroke}" stroke-width="4"/>` +
    letters +
    spaceDots +
    badge +
    `</svg>`
  );
}

async function svgToPng(svg, outPath) {
  await sharp(svg).png().toFile(outPath);
}

async function stitchGif(segments, outGif) {
  const listPath = `${OUT_DIR}/.concat-s2.txt`;
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
  // Clean up old frames
  fs.readdirSync(OUT_DIR)
    .filter((f) => f.startsWith("S2-") && (f.endsWith(".png") || f.endsWith(".gif")))
    .forEach((f) => fs.unlinkSync(`${OUT_DIR}/${f}`));

  // ── S2-a.png: squished, bad state ──
  await svgToPng(frameSVG({ state: "bad", gap: 0 }), `${OUT_DIR}/S2-a.png`);

  // ── S2-b.gif: animate from squished → spaced ──
  // Audio 9s: "Now look:" (0-1.6s) "the cat sat." (1.6-3.4s) "So much easier!" (4-5.3s) "The spaces tell us each word." (5.5-8.6s)
  // Plan:
  //   0 - 1.6s: still squished (red state, user is hearing "now look:")
  //   1.6 - 3.4s: animate gap from 0 → 80px over ~1.8s (transforms into "the cat sat")
  //   3.4 - 9s: hold at full-gap green state
  const GAP_FRAMES = 12;
  const MAX_GAP = 80;
  const animFrames = [];

  // Pre-anim squished frame (red state)
  await svgToPng(frameSVG({ state: "bad", gap: 0 }), `${OUT_DIR}/S2-banim0.png`);
  animFrames.push({ file: `${OUT_DIR}/S2-banim0.png`, duration: 1.6 });

  // Animate: red → green transitions at midpoint
  for (let i = 1; i <= GAP_FRAMES; i++) {
    const t = i / GAP_FRAMES;
    const gap = MAX_GAP * t;
    // Switch to green once past the halfway point (letters visibly apart)
    const state = t >= 0.5 ? "good" : "bad";
    const path = `${OUT_DIR}/S2-banim${i}.png`;
    await svgToPng(frameSVG({ state, gap }), path);
    animFrames.push({ file: path, duration: 1.8 / GAP_FRAMES });
  }

  // Hold on final spaced green state for the rest of the audio
  animFrames.push({ file: animFrames[animFrames.length - 1].file, duration: 5.6 });

  await stitchGif(animFrames, "S2-b.gif");

  // ── S2-c.png: final with space dots ──
  await svgToPng(frameSVG({ state: "good", gap: MAX_GAP, showSpaceDots: true }), `${OUT_DIR}/S2-c.png`);

  console.log(`Done. S2-a.png + S2-b.gif + S2-c.png written.`);
})();
