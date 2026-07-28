/**
 * Story karaoke pipeline — produces per-word timing for the redesigned
 * Stories reader (karaoke word-highlighting).
 *
 * Reuses the SAME local Whisper forced-alignment as derive-slide-timing.ts
 * (word_timestamps) so the karaoke `litWord` is driven by real audio, not
 * browser speech.
 *
 *   K / 1st / 2nd  → re-record each SENTENCE as its own slow Autonoe clip
 *                    (natural pauses, per-sentence replay), align each clip.
 *   3rd / 4th      → keep the existing whole-passage recording, align it,
 *                    map words onto sentences (no re-record).
 *
 * Output: app/data/stories-karaoke.json  keyed by story id:
 *   { mode, autoplay, wholeAudio?, sentences: [{ text, audioUrl?, words:[{t,start,end}] }] }
 *
 * Usage:
 *   npx tsx scripts/build-story-karaoke.ts --story=story-k-1 --apply
 *   npx tsx scripts/build-story-karaoke.ts --grade=kindergarten --apply
 *   npx tsx scripts/build-story-karaoke.ts --all --apply     # every story
 *   (omit --apply for a dry run that only prints what it would do)
 *
 * Requires .env.local (SUPABASE) + Vertex/Google ADC + ffmpeg + python3/whisper.
 */
import { config as loadEnv } from "dotenv";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing SUPABASE env in .env.local");
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public`;
const VOICE = "Autonoe";
const STORY_STYLE =
  "in a warm, gentle reading-teacher voice for a young child. Read slowly and clearly, one sentence at a time, with a calm, encouraging tone.";

const BANK = path.resolve(process.cwd(), "scripts/stories-bank.json");
const OUT = path.resolve(process.cwd(), "app/data/stories-karaoke.json");

const args = process.argv.slice(2);
const onlyStory = args.find((a) => a.startsWith("--story="))?.split("=")[1];
const onlyGrade = args.find((a) => a.startsWith("--grade="))?.split("=")[1];
const doAll = args.includes("--all");
const APPLY = args.includes("--apply");

const PER_SENTENCE_GRADES = new Set(["kindergarten", "1st", "2nd"]);
type WordTiming = { word: string; start: number; end: number };
/* eslint-disable @typescript-eslint/no-explicit-any */

// Sentence split matching the design: after . ! ? " + whitespace.
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?"])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Local Whisper word timestamps (same inline python as derive-slide-timing.ts).
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
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out.trim());
}

async function ttsToMp3(text: string, outMp3: string, tmp: string): Promise<void> {
  let res: any;
  for (let attempt = 0; ; attempt++) {
    res = await generateSpeechVertex({ text, voice: VOICE, style: STORY_STYLE });
    if (res.ok) break;
    if (/429|RESOURCE_EXHAUSTED|Quota/i.test(res.error || "") && attempt < 8) {
      await new Promise((r) => setTimeout(r, 15000 + attempt * 8000));
      continue;
    }
    throw new Error(`TTS: ${res.error}`);
  }
  const pcm = path.join(tmp, "clip.pcm");
  fs.writeFileSync(pcm, Buffer.from(res.pcmBase64, "base64"));
  const ff = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-codec:a", "libmp3lame", "-qscale:a", "2", outMp3],
    { encoding: "utf-8" },
  );
  if (ff.status !== 0) throw new Error(`ffmpeg: ${ff.stderr?.slice(0, 120)}`);
}

// Map a flat word-timing list onto sentences (for whole-passage 3-4 audio).
function assignWordsToSentences(sentences: string[], words: WordTiming[]) {
  const out: Array<{ text: string; words: Array<{ t: string; start: number; end: number }> }> = [];
  let wi = 0;
  for (const sent of sentences) {
    const nTokens = sent.split(/\s+/).filter(Boolean).length;
    const slice = words.slice(wi, wi + nTokens);
    wi += nTokens;
    out.push({ text: sent, words: slice.map((w) => ({ t: w.word, start: w.start, end: w.end })) });
  }
  return out;
}

async function processStory(story: any, tmp: string): Promise<any> {
  const grade = story.grade;
  const perSentence = PER_SENTENCE_GRADES.has(grade);
  const sentences = splitSentences(story.text);
  // K–2 all get slow auto-play karaoke (line mode). 3–4 are reveal + read-along (no auto-play).
  const autoplay = perSentence;
  console.log(`\n${story.id} (${grade}) — ${sentences.length} sentence(s) · ${perSentence ? "per-sentence re-record" : "whole-passage align"}`);

  if (perSentence) {
    const built: any[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const sent = sentences[i];
      const storagePath = `stories/${grade}/${story.id}/s${i + 1}.mp3`;
      const localMp3 = path.join(tmp, `${story.id}-s${i + 1}.mp3`);
      if (APPLY) {
        await ttsToMp3(sent, localMp3, tmp);
        const up = await sb.storage.from("audio").upload(storagePath, fs.readFileSync(localMp3), {
          contentType: "audio/mpeg",
          upsert: true,
          cacheControl: "no-cache",
        });
        if (up.error) throw new Error(`upload ${storagePath}: ${up.error.message}`);
        const words = whisperWords(localMp3).map((w) => ({ t: w.word, start: w.start, end: w.end }));
        built.push({ text: sent, audioUrl: `${PUBLIC_BASE}/audio/${storagePath}`, words });
        console.log(`  ✓ s${i + 1} "${sent.slice(0, 40)}" — ${words.length} words`);
      } else {
        console.log(`  ⤿ [dry] s${i + 1} → ${storagePath} :: "${sent.slice(0, 40)}"`);
      }
    }
    return { mode: "line", autoplay, sentences: built };
  }

  // 3rd/4th — align the existing whole-passage recording.
  const wholePath = `stories/${grade}/${story.id}-story.mp3`;
  const wholeUrl = `${PUBLIC_BASE}/audio/${wholePath}`;
  if (!APPLY) {
    console.log(`  ⤿ [dry] align existing ${wholePath} across ${sentences.length} sentences`);
    return { mode: "prose", autoplay: false, wholeAudio: wholeUrl, sentences: sentences.map((t) => ({ text: t, words: [] })) };
  }
  const localWhole = path.join(tmp, `${story.id}-story.mp3`);
  const res = await fetch(wholeUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${wholeUrl}`);
  fs.writeFileSync(localWhole, Buffer.from(await res.arrayBuffer()));
  const words = whisperWords(localWhole);
  const built = assignWordsToSentences(sentences, words);
  console.log(`  ✓ whole-passage aligned — ${words.length} words across ${sentences.length} sentences`);
  return { mode: "prose", autoplay: false, wholeAudio: wholeUrl, sentences: built };
}

(async () => {
  const bank = JSON.parse(fs.readFileSync(BANK, "utf8"));
  const stories: any[] = bank.stories;
  let targets = stories;
  if (onlyStory) targets = stories.filter((s) => s.id === onlyStory);
  else if (onlyGrade) targets = stories.filter((s) => s.grade === onlyGrade);
  else if (!doAll) {
    console.log("Pass --story=<id>, --grade=<grade>, or --all. Add --apply to actually generate.");
    process.exit(0);
  }
  console.log(`${targets.length} story(ies)${APPLY ? "" : " [DRY RUN]"}`);

  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "storykar-"));
  let done = 0;
  for (const story of targets) {
    try {
      const built = await processStory(story, tmp);
      if (APPLY) {
        existing[story.id] = built;
        fs.writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n");
        done++;
      }
    } catch (e) {
      console.log(`  ✗ ${story.id}: ${(e as Error).message}`);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDONE. ${APPLY ? `wrote ${done} story(ies) → app/data/stories-karaoke.json` : "(dry run — no changes)"}`);
})();
