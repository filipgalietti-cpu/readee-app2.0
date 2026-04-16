const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const BASE = "public/images/lessons/RF.K.1a/S2-base.png";
const OUT_DIR = "public/images/lessons/RF.K.1a";

(async () => {
  const raw = await sharp(BASE).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const W = info.width;
  const H = info.height;
  const CH = info.channels;

  // Detect gray rows of the workbook.
  const grayPerRow = [];
  for (let y = 0; y < H; y++) {
    let grayCount = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * CH;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      const avg = (r + g + b) / 3;
      if (diff < 20 && avg > 110 && avg < 180) grayCount++;
    }
    grayPerRow.push(grayCount);
  }

  const threshold = Math.floor(W * 0.15);
  const barRows = grayPerRow.map((c, y) => ({ y, c })).filter((r) => r.c > threshold);

  const allBands = [];
  let current = null;
  for (const row of barRows) {
    if (!current || row.y - current.end > 8) {
      if (current) allBands.push(current);
      current = { start: row.y, end: row.y };
    } else {
      current.end = row.y;
    }
  }
  if (current) allBands.push(current);
  const bars = allBands.filter((b) => b.end - b.start >= 30);
  console.log(`Detected ${bars.length} rows.`);

  // Find bar X extents across the page.
  function findBarXRange(barBand) {
    const midY = Math.floor((barBand.start + barBand.end) / 2);
    let left = W, right = 0;
    for (let x = 0; x < W; x++) {
      const i = (midY * W + x) * CH;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      const avg = (r + g + b) / 3;
      if (diff < 20 && avg > 110 && avg < 180) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    return { left, right };
  }

  const rowBounds = bars.slice(0, 2).map((b) => ({
    band: b,
    ...findBarXRange(b),
  }));
  console.log("Row bounds:", rowBounds);

  // Build an SVG overlay for a frame.
  // `completed` = array of row indices whose full-bar green is shown (past lines).
  // `active`    = { rowIdx, progress } where progress ∈ [0, 1] for the current arrow sweep.
  function frameSVG(completed, active) {
    const parts = [];
    // Completed rows: solid green bar across whole row.
    for (const idx of completed) {
      const r = rowBounds[idx];
      const barH = r.band.end - r.band.start;
      const padX = 10;
      const padY = 6;
      parts.push(
        `<rect x="${r.left - padX}" y="${r.band.start - padY}" width="${r.right - r.left + padX * 2}" height="${barH + padY * 2}" rx="${Math.floor((barH + padY * 2) / 2)}" fill="#22c55e"/>`
      );
    }
    // Active row: arrow extends from left to progress%, with arrowhead at front.
    if (active) {
      const r = rowBounds[active.rowIdx];
      const barH = r.band.end - r.band.start;
      const padY = 4;
      const startX = r.left;
      const endX = r.left + (r.right - r.left) * active.progress;
      const midY = (r.band.start + r.band.end) / 2;
      const shaftH = barH + padY * 2;
      const shaftTopY = r.band.start - padY;
      // Arrowhead size proportional to shaft height
      const headW = shaftH * 1.1;
      const shaftEndX = endX - headW + 6; // arrow body ends where head starts (slight overlap)
      // Shaft as a rounded rect from startX to shaftEndX
      if (shaftEndX > startX) {
        parts.push(
          `<rect x="${startX}" y="${shaftTopY}" width="${shaftEndX - startX}" height="${shaftH}" rx="${Math.floor(shaftH / 2)}" fill="#22c55e"/>`
        );
      }
      // Arrowhead triangle
      const tipX = endX;
      const headBaseX = endX - headW;
      const headTopY = midY - headW * 0.75;
      const headBottomY = midY + headW * 0.75;
      parts.push(
        `<polygon points="${headBaseX},${headTopY} ${tipX},${midY} ${headBaseX},${headBottomY}" fill="#16a34a"/>`
      );
    }
    return Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join("")}</svg>`
    );
  }

  async function renderFrame(n, completed, active) {
    const overlay = frameSVG(completed, active);
    await sharp(BASE)
      .composite([{ input: overlay, top: 0, left: 0 }])
      .toFile(`${OUT_DIR}/S2-frame${n}.png`);
  }

  // Frame plan:
  // 0: blank
  // 1-3: row 0 arrow at 33%, 66%, 100%
  // 4-6: row 0 solid + row 1 arrow at 33%, 66%, 100%
  await sharp(BASE).toFile(`${OUT_DIR}/S2-frame0.png`);
  await renderFrame(1, [], { rowIdx: 0, progress: 0.33 });
  await renderFrame(2, [], { rowIdx: 0, progress: 0.66 });
  await renderFrame(3, [], { rowIdx: 0, progress: 1.0 });
  await renderFrame(4, [0], { rowIdx: 1, progress: 0.33 });
  await renderFrame(5, [0], { rowIdx: 1, progress: 0.66 });
  await renderFrame(6, [0], { rowIdx: 1, progress: 1.0 });

  console.log("7 frames written.");

  // Stitch with ffmpeg. ~0.7s per frame, then hold the final for 1.2s via duplicating.
  execSync(
    `ffmpeg -y -framerate 1.5 -i ${OUT_DIR}/S2-frame%d.png -vf "fps=15,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer" -loop 0 ${OUT_DIR}/S2.gif`,
    { stdio: "inherit" }
  );
  console.log(`gif built at ${OUT_DIR}/S2.gif`);
})();
