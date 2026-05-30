/**
 * Bulk forced-alignment extractor — runs Whisper across every audio
 * file referenced in sample-lessons.json and caches the per-word
 * timestamps to scripts/slide-timings.json.
 *
 * One-time cost. Re-runs skip anything already in cache, so this is
 * safe to wire into the enricher later (always-runs, only does work
 * for new audio).
 *
 *   npx tsx scripts/derive-slide-timing-all.ts
 *
 * Concurrency: downloads 8 files in parallel; Whisper runs in a
 * single python subprocess so the model only loads once.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const SUPABASE_BASE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";
const SAMPLE_LESSONS = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const CACHE_FILE = path.resolve(process.cwd(), "scripts/slide-timings.json");
const DL_CONCURRENCY = 8;

type WordTiming = { word: string; start: number; end: number };
type CacheEntry = { duration: number; words: WordTiming[] };
type Cache = Record<string, CacheEntry>;

async function exists(p: string): Promise<boolean> {
  return fs.stat(p).then(() => true).catch(() => false);
}

async function downloadAudio(audioFile: string, outDir: string): Promise<string> {
  const url = `${SUPABASE_BASE}/${audioFile}`;
  const local = path.join(outDir, audioFile.replace(/\//g, "_"));
  if (await exists(local)) return local;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(local, buf);
  return local;
}

function audioDurationMs(audioPath: string): number {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audioPath],
      { encoding: "utf-8" },
    );
    return Math.round(parseFloat(out.trim()) * 1000);
  } catch {
    return 0;
  }
}

async function main() {
  const lessons = JSON.parse(await fs.readFile(SAMPLE_LESSONS, "utf-8")) as any[];
  const cache: Cache = await fs
    .readFile(CACHE_FILE, "utf-8")
    .then(JSON.parse)
    .catch(() => ({}));

  // Collect distinct audio files that aren't cached yet.
  const todo = new Set<string>();
  let totalRefs = 0;
  for (const lesson of lessons) {
    for (const slide of lesson.slides ?? []) {
      if (slide.type === "mcq") continue;
      for (const step of slide.steps ?? []) {
        if (!step.audioFile) continue;
        totalRefs++;
        if (!cache[step.audioFile]) todo.add(step.audioFile);
      }
    }
  }

  console.log(
    `Total audio refs: ${totalRefs} · already cached: ${totalRefs - todo.size} · to process: ${todo.size}`,
  );
  if (todo.size === 0) {
    console.log("Nothing to do. Cache is current.");
    return;
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "bulk-timing-"));
  console.log(`Temp dir: ${tmp}\n`);

  // Parallel download
  const queue = [...todo];
  const localMap: { remote: string; local: string }[] = [];
  let dl = 0;
  console.log(`Downloading ${queue.length} files (concurrency=${DL_CONCURRENCY})...`);
  await Promise.all(
    Array.from({ length: DL_CONCURRENCY }, async () => {
      while (queue.length > 0) {
        const remote = queue.shift();
        if (!remote) break;
        try {
          const local = await downloadAudio(remote, tmp);
          localMap.push({ remote, local });
        } catch (e) {
          console.warn(`  ✗ download ${remote}: ${(e as Error).message}`);
        }
        dl++;
        if (dl % 100 === 0 || dl === todo.size) {
          console.log(`  ${dl}/${todo.size} downloaded`);
        }
      }
    }),
  );

  // Whisper in a single subprocess — model loads once.
  const manifestPath = path.join(tmp, "manifest.json");
  const outputPath = path.join(tmp, "output.json");
  await fs.writeFile(manifestPath, JSON.stringify(localMap));

  const py = `
import sys, json, whisper, warnings
warnings.filterwarnings("ignore")
manifest_path = sys.argv[1]
output_path = sys.argv[2]
with open(manifest_path) as f:
    files = json.load(f)
print(f"Loading Whisper base model...", flush=True)
model = whisper.load_model("base", in_memory=True)
print(f"Transcribing {len(files)} files...", flush=True)
results = {}
for i, item in enumerate(files):
    if i % 50 == 0 and i > 0:
        print(f"  {i}/{len(files)}...", flush=True)
    try:
        result = model.transcribe(item["local"], word_timestamps=True, fp16=False, verbose=False, language="en")
        words = []
        for seg in result.get("segments", []):
            for w in seg.get("words", []):
                words.append({"word": w["word"].strip(), "start": float(w["start"]), "end": float(w["end"])})
        results[item["remote"]] = {"words": words}
    except Exception as e:
        results[item["remote"]] = {"error": str(e)}
with open(output_path, "w") as f:
    json.dump(results, f)
print(f"  Done. Wrote {len(results)} entries.", flush=True)
`;

  console.log(`\nRunning Whisper (one model load, batched transcription)...`);
  const r = spawnSync("python3", ["-c", py, manifestPath, outputPath], {
    stdio: "inherit",
    maxBuffer: 1024 * 1024 * 64,
  });
  if (r.status !== 0) {
    console.error("Whisper subprocess failed");
    process.exit(1);
  }

  const results = JSON.parse(await fs.readFile(outputPath, "utf-8"));

  // Merge into cache + grab ffprobe durations.
  let added = 0;
  let errs = 0;
  for (const { remote, local } of localMap) {
    const r = (results as any)[remote];
    if (!r) continue;
    if (r.error) {
      console.warn(`  ✗ whisper ${remote}: ${r.error}`);
      errs++;
      continue;
    }
    cache[remote] = { duration: audioDurationMs(local), words: r.words };
    added++;
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(
    `\n✓ Added ${added} new alignments (${errs} errors). Cache size: ${Object.keys(cache).length}`,
  );
  console.log(`Cache file: ${CACHE_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
