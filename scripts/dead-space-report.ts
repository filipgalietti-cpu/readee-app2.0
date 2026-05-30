import fs from "node:fs";
import { estimateSlideUsage } from "../lib/qc/dead-space";

const lessons = JSON.parse(fs.readFileSync("app/data/sample-lessons.json", "utf-8"));
const CANON = ["RL.K.1", "RL.1.1", "RF.2.3b", "L.3.4b", "L.4.4b"];

type Row = {
  std: string;
  title: string;
  slide: number;
  type: string;
  usedPx: number;
  availablePx: number;
  ratio: number;
  deadPx: number;
  flagged: boolean;
};

function buildRows(surface: "mobile" | "desktop"): Row[] {
  const rows: Row[] = [];
  for (const std of CANON) {
    const l = (lessons as any[]).find((x) => x.standardId === std);
    if (!l) continue;
    for (const slide of l.slides) {
      if (slide.type === "mcq") continue;
      const u = estimateSlideUsage(slide, surface);
      const threshold =
        slide.type === "intro" || slide.type === "practice-intro" ? 0.5 : 0.6;
      const flagged = u.usedRatio < threshold && u.deadPx > 120;
      rows.push({
        std,
        title: l.title,
        slide: slide.slide,
        type: slide.type,
        usedPx: u.usedPx,
        availablePx: u.availablePx,
        ratio: u.usedRatio,
        deadPx: u.deadPx,
        flagged,
      });
    }
  }
  return rows;
}

function render(surface: "mobile" | "desktop") {
  const banner = surface === "mobile"
    ? "📱 MOBILE AUDIT — iPhone 16/17 portrait (393 × 852)"
    : "🖥  DESKTOP AUDIT — laptop split-shell right panel (680 × 720)";
  console.log("\n" + "═".repeat(78));
  console.log(banner);
  console.log("═".repeat(78));

  const rows = buildRows(surface);
  for (const std of CANON) {
    const lessonRows = rows.filter((r) => r.std === std);
    if (lessonRows.length === 0) continue;
    const title = lessonRows[0]?.title ?? "";
    console.log(`\n${std} — ${title}`);
    for (const r of lessonRows) {
      const tag = r.flagged ? " ⚠" : "  ";
      const filled = Math.min(20, Math.round(r.ratio * 20));
      const bar = "█".repeat(filled) + "·".repeat(Math.max(0, 20 - filled));
      console.log(
        `  ${tag} S${r.slide} ${r.type.padEnd(15)} ${bar} ${String(Math.round(r.ratio * 100)).padStart(3)}%   ${String(r.usedPx).padStart(3)}/${r.availablePx}px   ${String(r.deadPx).padStart(3)}px dead`,
      );
    }
  }

  const flagged = rows.filter((r) => r.flagged);
  const sorted = [...flagged].sort((a, b) => b.deadPx - a.deadPx);
  console.log("\n" + "─".repeat(78));
  console.log(
    `${flagged.length} flagged · worst offenders ranked by ${surface} dead-pixels:`,
  );
  for (const r of sorted) {
    console.log(
      `   ${String(r.deadPx).padStart(3)}px dead   ${r.std} S${r.slide} ${r.type} (${Math.round(r.ratio * 100)}% used)`,
    );
  }
}

const arg = process.argv[2];
if (arg === "mobile") {
  render("mobile");
} else if (arg === "desktop") {
  render("desktop");
} else {
  // Default: both, mobile first.
  render("mobile");
  render("desktop");
}
