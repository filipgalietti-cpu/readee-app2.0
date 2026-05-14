/**
 * Demo recorder — drives the local dev server through scripted flows,
 * captures Playwright video, transcodes to landing-page-ready MP4.
 *
 *   npx tsx scripts/record-demo.ts --flow=hero
 *   npx tsx scripts/record-demo.ts --flow=practice --headed
 *   npx tsx scripts/record-demo.ts --flow=lesson --out=lesson-2.mp4
 *
 * Flags:
 *   --flow=<name>     name of file in scripts/demo-flows/ (required)
 *   --headed          open a visible browser window
 *   --out=<filename>  output filename (default: <flow>-demo.mp4)
 *   --base=<url>      target URL (default: http://localhost:3000)
 *   --width / --height (default 1280×720; landing-page baseline)
 *
 * Output drops into ../readee-site-next/public/assets/ if that dir
 * exists, else into scripts/demo-out/.
 *
 * Dev server must already be running. The script does NOT start one;
 * a hot-reload restart mid-record kills the capture.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { existsSync } from "node:fs";

type Args = {
  flow: string | null;
  headed: boolean;
  out: string | null;
  base: string;
  width: number;
  height: number;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = {
    flow: null,
    headed: false,
    out: null,
    base: "http://localhost:3000",
    width: 1280,
    height: 720,
  };
  for (const a of argv) {
    if (a === "--headed") out.headed = true;
    else if (a.startsWith("--flow=")) out.flow = a.slice("--flow=".length);
    else if (a.startsWith("--out=")) out.out = a.slice("--out=".length);
    else if (a.startsWith("--base=")) out.base = a.slice("--base=".length);
    else if (a.startsWith("--width=")) out.width = parseInt(a.slice("--width=".length), 10);
    else if (a.startsWith("--height=")) out.height = parseInt(a.slice("--height=".length), 10);
  }
  return out;
}

function resolveOutputDir(): string {
  const landingAssets = path.resolve(
    process.cwd(),
    "..",
    "readee-site-next",
    "public",
    "assets",
  );
  if (existsSync(landingAssets)) return landingAssets;
  const local = path.resolve(process.cwd(), "scripts", "demo-out");
  return local;
}

async function ffmpegTranscode(input: string, output: string): Promise<void> {
  // Convert WebM → H.264 MP4. Optimizations for landing-page <video>:
  //   - faststart (moov atom at front) so it plays before fully buffered
  //   - constant quality 23 (visually transparent for cartoon UI)
  //   - 30 fps cap (Playwright records ~25, smooth enough)
  //   - drop audio (landing-page demos are silent by convention)
  await new Promise<void>((resolve, reject) => {
    const args = [
      "-y",
      "-i", input,
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      "-r", "30",
      output,
    ];
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (b: Buffer) => (stderr += b.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-300)}`));
    });
  });
}

async function fileSizeMB(p: string): Promise<number> {
  const stat = await fs.stat(p);
  return stat.size / (1024 * 1024);
}

async function main() {
  const args = parseArgs();
  if (!args.flow) {
    console.error("Need --flow=<name>. Available: hero, practice, lesson");
    process.exit(1);
  }
  const parentEmail =
    process.env.PLAYWRIGHT_PARENT_EMAIL ?? process.env.DEMO_PARENT_EMAIL ?? "";
  const parentPassword =
    process.env.PLAYWRIGHT_PARENT_PASSWORD ?? process.env.DEMO_PARENT_PASSWORD ?? "";
  if (!parentEmail || !parentPassword) {
    console.error(
      "Need PLAYWRIGHT_PARENT_EMAIL + PLAYWRIGHT_PARENT_PASSWORD in .env.local for auth flows",
    );
    process.exit(1);
  }

  const flowPath = path.resolve(
    process.cwd(),
    "scripts",
    "demo-flows",
    `${args.flow}.ts`,
  );
  if (!existsSync(flowPath)) {
    console.error(`Flow file not found: ${flowPath}`);
    process.exit(1);
  }

  // Dynamic import — tsx handles TS at runtime
  const flow = (await import(flowPath)) as {
    run: (ctx: any) => Promise<void>;
    totalSeconds?: number;
  };

  const tmpDir = await fs.mkdtemp(path.join(process.cwd(), ".demo-rec-"));
  const outDir = resolveOutputDir();
  await fs.mkdir(outDir, { recursive: true });
  const outName = (args.out ?? `${args.flow}-demo`).replace(/\.mp4$/i, "") + ".mp4";
  const outPath = path.join(outDir, outName);

  console.log(`Demo recorder · flow=${args.flow} → ${outPath}`);
  console.log(`  base=${args.base} viewport=${args.width}×${args.height} headed=${args.headed}`);

  // Refresh auth state cache if missing/stale, so flows that need a
  // signed-in session start mid-app instead of mid-login form.
  const { isAuthStateFresh, authStatePath, captureAuthState } = await import(
    "./demo-flows/_helpers"
  );
  if (!(await isAuthStateFresh())) {
    console.log(`  auth cache stale — refreshing once...`);
    const setupBrowser = await chromium.launch({ headless: true });
    const setupCtx = await setupBrowser.newContext({
      viewport: { width: args.width, height: args.height },
    });
    const setupPage = await setupCtx.newPage();
    await captureAuthState({
      page: setupPage,
      context: setupCtx,
      baseUrl: args.base,
      parentEmail,
      parentPassword,
    });
    await setupCtx.close();
    await setupBrowser.close();
    console.log(`  auth state cached at ${authStatePath()}`);
  }

  // `--autoplay-policy=no-user-gesture-required` lets HTMLAudio.play()
  // succeed without a real user gesture, so the lesson player's
  // onEnded handler fires and auto-advances slides. Without this the
  // record sits on slide 1 watching a disabled "Listening…" button.
  // `--mute-audio` keeps the recording silent (landing-page videos
  // are autoplay+muted) while still letting playback "complete".
  const browser = await chromium.launch({
    headless: !args.headed,
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: 2, // crisp on retina
    recordVideo: { dir: tmpDir, size: { width: args.width, height: args.height } },
    storageState: authStatePath(),
  });
  const page = await context.newPage();

  // Abort audio fetches. Lesson slides advance via
  // `audioManager.play().then(...)`; under `--mute-audio` Chrome doesn't
  // reliably resolve that promise, so the slide gets stuck on the
  // "Listening…" gate. Aborting forces the `.catch()` branch in
  // LessonSlideshow.tsx:389 → setTimeout-based advance, which is what
  // we want for a silent recording.
  await context.route(/\.(mp3|wav|m4a|ogg)(\?.*)?$/i, (route) => route.abort());

  // Install the cursor pulse stylesheet up front so flow scripts can
  // assume it's present.
  const { installCursor, resolveChildId, hideRecordingChrome } = await import(
    "./demo-flows/_helpers"
  );
  page.on("framenavigated", async () => {
    try {
      await installCursor(page);
      await hideRecordingChrome(page);
    } catch {
      /* fine — page might be about to navigate again */
    }
  });

  // Resolve the active child id once — every kid surface requires
  // `?child=<id>`, otherwise it bails to "We lost track of which reader".
  const childId =
    process.env.DEMO_CHILD_ID ?? (await resolveChildId(page, args.base));
  if (!childId) {
    console.error(
      "  could not resolve child id — set DEMO_CHILD_ID or ensure the parent account has at least one child.",
    );
    process.exit(1);
  }
  console.log(`  child id: ${childId.slice(0, 8)}…`);

  const t0 = Date.now();
  try {
    await flow.run({
      page,
      context,
      baseUrl: args.base,
      parentEmail,
      parentPassword,
      childId,
    });
  } catch (e: any) {
    console.error(`  flow error: ${e?.message ?? e}`);
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  flow done in ${elapsed}s, finalizing video...`);

  await context.close();
  await browser.close();

  // Playwright writes one .webm per page. Pick the largest.
  const files = await fs.readdir(tmpDir);
  const webms = files.filter((f) => f.endsWith(".webm"));
  if (webms.length === 0) {
    console.error("No .webm captured — recordVideo failed.");
    process.exit(1);
  }
  let bestWebm = path.join(tmpDir, webms[0]);
  let bestSize = (await fs.stat(bestWebm)).size;
  for (const f of webms) {
    const p = path.join(tmpDir, f);
    const s = (await fs.stat(p)).size;
    if (s > bestSize) {
      bestSize = s;
      bestWebm = p;
    }
  }

  await ffmpegTranscode(bestWebm, outPath);
  const sizeMB = await fileSizeMB(outPath);
  console.log(`✓ ${outPath} (${sizeMB.toFixed(2)} MB)`);

  // Clean up tmp
  await fs.rm(tmpDir, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
