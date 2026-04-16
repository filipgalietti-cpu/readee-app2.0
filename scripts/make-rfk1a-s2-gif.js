const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const BASE = "public/images/lessons/RF.K.1a/S2-base.png";

(async () => {
  const img = sharp(BASE);
  const meta = await img.metadata();
  console.log(`base: ${meta.width}x${meta.height}`);

  // Analyze rows to find gray bars.
  // We'll read raw pixel data and look for horizontal runs of gray.
  const raw = await sharp(BASE).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const W = info.width;
  const H = info.height;
  const CH = info.channels;

  // For each row, count how many pixels are "gray-ish" (R≈G≈B, mid-brightness)
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

  // Find rows with lots of gray (bars). Threshold = half of W/3 (assuming bars are ~W/3 wide)
  const threshold = Math.floor(W * 0.15);
  const barRows = grayPerRow.map((c, y) => ({ y, c })).filter((r) => r.c > threshold);

  // Group consecutive bar rows into bar bands
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
  // Filter out thin bands (book outlines) — real bars are >=30px tall
  const bars = allBands.filter((b) => b.end - b.start >= 30);

  console.log(`All bands: ${allBands.length}, real bars (h>=30): ${bars.length}`);
  bars.forEach((b, i) => console.log(`  bar ${i + 1}: y=${b.start}-${b.end} (h=${b.end - b.start})`));

  // For frame 2: draw green bar OVER the first bar band (top line)
  // For frame 3: draw green bars over the first AND second bar bands
  // Detect left+right bounds of the bars by scanning rows in bar 1
  function findBarXRange(barBand) {
    // Take middle row of band and find leftmost/rightmost gray pixels
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

  // For left-page: find which bars are on the LEFT page (x center < W/2)
  // Actually, we want to paint over ALL top-row bars (both pages), but the arrow concept is a single left-to-right sweep.
  // Simpler: paint a full-width green rectangle across bar 1 (including both pages), then bar 2.
  // Actually better: paint only LEFT page bars so the animation reads as "reading the left page first".

  const leftPageBars = bars.filter((b) => {
    const r = findBarXRange(b);
    return (r.left + r.right) / 2 < W / 2;
  });
  console.log(`Left-page bars: ${leftPageBars.length}`);

  async function compositeGreenOver(barIndices, outPath) {
    const overlays = [];
    for (const idx of barIndices) {
      const band = leftPageBars[idx];
      if (!band) continue;
      const { left, right } = findBarXRange(band);
      const barW = right - left;
      const barH = band.end - band.start;
      // Make green bar slightly taller/wider than gray for overlay effect
      const padX = 6;
      const padY = 4;
      const rectW = barW + padX * 2;
      const rectH = barH + padY * 2;
      const rectX = left - padX;
      const rectY = band.start - padY;
      // SVG with a green rounded rectangle
      const svg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${rectW}" height="${rectH}"><rect x="0" y="0" width="${rectW}" height="${rectH}" rx="${Math.floor(rectH / 2)}" ry="${Math.floor(rectH / 2)}" fill="#22c55e"/></svg>`
      );
      overlays.push({ input: svg, top: rectY, left: rectX });
    }
    await sharp(BASE).composite(overlays).toFile(outPath);
    console.log(`wrote ${outPath}`);
  }

  await sharp(BASE).toFile("public/images/lessons/RF.K.1a/S2-frame1.png"); // blank
  await compositeGreenOver([0], "public/images/lessons/RF.K.1a/S2-frame2.png");
  await compositeGreenOver([0, 1], "public/images/lessons/RF.K.1a/S2-frame3.png");

  // Stitch with ffmpeg — 1.5s per frame, loop
  execSync(
    `ffmpeg -y -framerate 2/3 -i public/images/lessons/RF.K.1a/S2-frame%d.png -vf "fps=15,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" -loop 0 public/images/lessons/RF.K.1a/S2.gif`,
    { stdio: "inherit" }
  );
  console.log("gif built at public/images/lessons/RF.K.1a/S2.gif");
})();
