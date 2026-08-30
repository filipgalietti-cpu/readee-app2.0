/**
 * Instagram ad recorder — films one loop cycle of an HTML animation and
 * outputs a platform-ready H.264 MP4 at an Instagram size. Reuses the same
 * Playwright `recordVideo` capture as record-clip.mjs and the same ffmpeg
 * transcode settings as record-demo.ts. Silent (Instagram plays muted; the
 * video auto-loops in feed/Reels, so we only need one clean cycle).
 *
 *   node scripts/record-ad.mjs <url-or-file> [--size=feed|reels|feed45] [--seconds=27] [--out=path.mp4]
 *
 * Examples:
 *   node scripts/record-ad.mjs scripts/ad-src/readee-instagram-ad.html
 *   node scripts/record-ad.mjs http://localhost:8080/ --size=reels --seconds=30
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};
// Target can be a positional arg, or --url-file=<path> whose contents are the
// URL (keeps short-lived tokened preview URLs out of the command line / logs).
const urlFile = flag("url-file", null);
const target = urlFile ? readFileSync(urlFile, "utf8").trim() : argv.find((a) => !a.startsWith("--"));
// Optional: after load, pin this element to 0,0 so only it fills the viewport.
const isolate = flag("isolate", null);
if (!target) {
  console.error("usage: record-ad.mjs <url-or-file | --url-file=path> [--size=feed|reels|feed45] [--seconds=27] [--loop=22.4] [--isolate=#sel] [--out=path.mp4]");
  process.exit(1);
}

const SIZES = {
  feed: { w: 1080, h: 1080 },   // 1:1 square
  reels: { w: 1080, h: 1920 },  // 9:16 vertical (Reels/Stories)
  feed45: { w: 1080, h: 1350 }, // 4:5 tall feed
};
const sizeKey = flag("size", "feed");
const size = SIZES[sizeKey];
if (!size) {
  console.error(`unknown --size=${sizeKey} (use: ${Object.keys(SIZES).join(", ")})`);
  process.exit(1);
}
// --loop=<sec>: the animation's exact cycle length. When set, we record a bit
// extra (past the initial page-load flash) and export ONLY the final <loop>
// seconds. Any one-period window of a periodic animation is a seamless loop,
// so taking the tail drops the load junk and gives a clean start->end match.
const loopSecs = flag("loop", null) ? parseFloat(flag("loop", null)) : null;
// Post-isolate capture time. Explicit --seconds always wins; otherwise default
// to one loop + a little (the --loop tail is extracted from the end).
const seconds = flag("seconds", null)
  ? parseFloat(flag("seconds", null))
  : loopSecs
    ? loopSecs + 2.5
    : 27;
const outMp4 = path.resolve(
  flag("out", path.join("scripts", "ad-out", `readee-instagram-ad-${sizeKey}.mp4`)),
);

// Resolve a bare path to a file:// URL; leave http(s)/file URLs as-is.
const url = /^(https?|file):\/\//.test(target)
  ? target
  : pathToFileURL(path.resolve(target)).href;

const tmpDir = path.resolve("scripts", "ad-out", `.rec-${sizeKey}`);
mkdirSync(tmpDir, { recursive: true });
mkdirSync(path.dirname(outMp4), { recursive: true });

// --- ffmpeg: webm -> H.264 MP4, forced to exact IG dimensions --------------
// Mirrors record-demo.ts ffmpegTranscode (libx264 / crf 23 / yuv420p /
// +faststart / -an / 30fps) and adds an aspect-safe scale+pad so the output
// is exactly WxH with no stretching, plus high@4.0 for broad IG compatibility.
function transcode(input, output, { w, h }, tailSecs = null) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      // Grab only the final `tailSecs` (one clean loop, past the load flash).
      ...(tailSecs ? ["-sseof", `-${tailSecs}`] : []),
      "-i", input,
      ...(tailSecs ? ["-t", `${tailSecs}`] : []),
      "-vf", `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "23",
      "-profile:v", "high",
      "-level", "4.0",
      "-movflags", "+faststart",
      "-an",
      "-r", "30",
      output,
    ];
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (b) => (stderr += b.toString()));
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`)),
    );
  });
}

// --- record -----------------------------------------------------------------
// Redact any query string (preview URLs carry a token we must not log).
const shownUrl = url.replace(/\?.*$/, url.includes("?") ? "?…" : "");
console.log(`[record-ad] ${shownUrl}\n            ${sizeKey} ${size.w}x${size.h} · ${seconds}s`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: size.w, height: size.h },
  deviceScaleFactor: 1, // exact pixels: viewport px == recorded px == output px
  recordVideo: { dir: tmpDir, size: { width: size.w, height: size.h } },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});

if (isolate) {
  // Let the design-system bundle + any JSX components + fonts mount, then pin
  // the target element to the top-left so only it fills the recorded viewport.
  // Non-destructive (keeps the runtime alive so animated counters keep ticking).
  await page.waitForTimeout(3000);
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    document.documentElement.style.margin = "0";
    Object.assign(document.body.style, { margin: "0", overflow: "hidden" });
    Object.assign(el.style, { position: "fixed", top: "0", left: "0", margin: "0", zIndex: "2147483647" });
  }, isolate);
  await page.waitForTimeout(400);
} else {
  await page.waitForTimeout(600); // first-paint settle
}
await page.waitForTimeout(Math.round(seconds * 1000));

const video = page.video();
await context.close(); // flushes the .webm to disk
await browser.close();

// Pick the largest .webm Playwright wrote (one per page).
const webm = video
  ? await video.path()
  : readdirSync(tmpDir)
      .filter((f) => f.endsWith(".webm"))
      .map((f) => path.join(tmpDir, f))
      .sort((a, b) => statSync(b).size - statSync(a).size)[0];

if (!webm) {
  console.error("[record-ad] no .webm captured — recordVideo failed.");
  process.exit(1);
}

console.log(`[record-ad] transcoding to MP4${loopSecs ? ` (last ${loopSecs}s loop)` : ""}...`);
await transcode(webm, outMp4, size, loopSecs);
console.log("[record-ad] DONE ->", outMp4);
