/**
 * Forced-alignment slide timing extractor — proof pass.
 *
 * Reads a lesson's audio files from Supabase Storage, runs them
 * through local OpenAI Whisper with `word_timestamps=True` to extract
 * per-word start/end times, and prints a comparison against the
 * current heuristic `displayParts[].delay` values.
 *
 * The intent: replace heuristic syllable-count-based delays with
 * real audio-derived timestamps so the visual reveal stays glued
 * to what the kid actually hears. No TTS regen — the existing mp3s
 * are the source of truth.
 *
 *   npx tsx scripts/derive-slide-timing.ts --standard=RF.2.3b
 *
 * Pass --apply to rewrite the lesson JSON; default is dry-run + a
 * comparison report.
 */
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const SUPABASE_BASE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";
const SAMPLE_LESSONS = path.resolve(process.cwd(), "app/data/sample-lessons.json");

type WordTiming = { word: string; start: number; end: number };

async function downloadAudio(audioFile: string, outDir: string): Promise<string> {
  const url = `${SUPABASE_BASE}/${audioFile}`;
  const local = path.join(outDir, path.basename(audioFile));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(local, buf);
  return local;
}

/**
 * Invokes a tiny inline Python script that loads Whisper, transcribes
 * the audio with word_timestamps=True, and prints JSON to stdout.
 * Using subprocess keeps this script TS-native; Whisper itself is
 * pure Python.
 */
function whisperWords(audioPath: string): WordTiming[] {
  const script = `
import sys, json, whisper, warnings
warnings.filterwarnings("ignore")
model = whisper.load_model("base", in_memory=True)
result = model.transcribe(sys.argv[1], word_timestamps=True, fp16=False, verbose=False, language="en")
words = []
for seg in result.get("segments", []):
    for w in seg.get("words", []):
        words.append({"word": w["word"].strip(), "start": float(w["start"]), "end": float(w["end"])})
print(json.dumps(words))
`;
  const out = execFileSync("python3", ["-c", script, audioPath], {
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 8,
  });
  return JSON.parse(out);
}

async function audioDurationMs(audioPath: string): Promise<number> {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audioPath],
    { encoding: "utf-8" },
  );
  return Math.round(parseFloat(out.trim()) * 1000);
}

async function main() {
  const args = new Map(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.split("=");
      return [k.replace(/^--/, ""), v ?? "true"];
    }),
  );
  const standardId = args.get("standard");
  if (!standardId) {
    console.error("Usage: tsx scripts/derive-slide-timing.ts --standard=<id>");
    process.exit(1);
  }

  const lessons = JSON.parse(await fs.readFile(SAMPLE_LESSONS, "utf-8"));
  const lesson = lessons.find((l: any) => l.standardId === standardId);
  if (!lesson) {
    console.error(`Lesson ${standardId} not found`);
    process.exit(1);
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "slide-timing-"));
  console.log(`\n=== ${standardId} — ${lesson.title} ===`);
  console.log(`temp dir: ${tmp}\n`);

  for (const slide of lesson.slides) {
    if (slide.type === "mcq") continue;
    console.log(`Slide ${slide.slide} · ${slide.type} · "${slide.heading}"`);
    for (const step of slide.steps ?? []) {
      const audioFile: string = step.audioFile;
      if (!audioFile) continue;
      const sub = step.sub ?? "?";
      const script: string = step.ttsScript ?? "";
      try {
        const local = await downloadAudio(audioFile, tmp);
        const duration = await audioDurationMs(local);
        console.log(`\n  [${sub}] ${audioFile}  (${duration}ms)`);
        console.log(`       script: "${script}"`);
        const words = whisperWords(local);
        console.log(`       Whisper alignment:`);
        for (const w of words) {
          const startMs = Math.round(w.start * 1000);
          const endMs = Math.round(w.end * 1000);
          console.log(`         ${String(startMs).padStart(5)}ms → ${String(endMs).padStart(5)}ms   "${w.word}"`);
        }
        // Compare to existing delays
        if (step.displayParts) {
          console.log(`       Current displayParts delays:`);
          for (const p of step.displayParts) {
            console.log(`         ${String(p.delay).padStart(5)}ms   "${p.text}"`);
          }
        }
        if (step.highlightWord?.delay !== undefined) {
          console.log(
            `       highlightWord delay: ${step.highlightWord.delay}ms ("${step.highlightWord.word}")`,
          );
        }
        if (step.displayTableRow) {
          console.log(
            `       displayTableRow: label="${step.displayTableRow.label}" value="${step.displayTableRow.value}" example="${step.displayTableRow.example ?? ""}" exampleDelay=${step.displayTableRow.exampleDelay ?? "-"}ms`,
          );
        }
      } catch (err) {
        console.log(`  [${sub}] ${audioFile}  ✗ ${(err as Error).message}`);
      }
    }
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
