/** Resumable static Autonoe assets. Batch synthesis reduces request pressure.
 * npx tsx scripts/placement-spectrum-audio.ts [--dry]
 * python3 scripts/placement-spectrum-verify.py /tmp/spectrum-scripts.json
 * Requires local ffmpeg + Whisper. Only fixed author text goes to Google.
 */
import { config } from "dotenv";
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spectrumAudioScripts } from "../app/data/placement-spectrum/audio";
import { getVertexAccessToken, VERTEX_TTS_PROJECT_ID } from "../lib/ai/vertex-tts";
config({ path: ".env.local", quiet: true });
async function main() {
  const dir = "public/audio/placement-spectrum";
  await fs.mkdir(dir, { recursive: true });
  const pending = [];
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  for (const [id, text] of Object.entries(spectrumAudioScripts())) {
    if (only && !only.split(",").some(prefix => id.startsWith(prefix))) continue;
    const hash = createHash("sha256").update(`Autonoe:${text}`).digest("hex");
    if (
      !process.argv.includes("--force") &&
      (await fs.readFile(`${dir}/${id}.sha256`, "utf8").catch(() => "")) === hash &&
      (await fs
        .stat(`${dir}/${id}.mp3`)
        .then((s) => s.size > 500)
        .catch(() => false))
    )
      continue;
    pending.push({ id, text, hash });
  }
  console.log(`${pending.length} missing or changed clips`);
  if (process.argv.includes("--dry")) return;
  let failures = 0;
  // Single clips avoid delivery drift and separators leaking between questions.
  const batchSize = process.argv.includes("--batch") ? 12 : 1;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const tmp = await fs.mkdtemp(join(tmpdir(), "readee-spectrum-tts-"));
    await fs.writeFile(join(tmp, "clips.json"), JSON.stringify(batch));
    let ok = false;
    for (let attempt = 0; attempt < 5 && !ok; attempt++) {
      try {
        // Same Luna/Autonoe voice through Google's dedicated speech endpoint.
        // https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
        const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
          method: "POST",
          signal: AbortSignal.timeout(180000),
          headers: {
            Authorization: `Bearer ${await getVertexAccessToken()}`,
            "Content-Type": "application/json",
            "x-goog-user-project": VERTEX_TTS_PROJECT_ID,
          },
          body: JSON.stringify({
            input: {
              text:
                batch.length === 1
                  ? batch[0].text.replace(/\bNia\b/g, "NEE-ah").replace(/\bMOSTLY\b/g, "mostly")
                  : batch.map((c) => `${c.text.replace(/\s+/g, " ")}. Next recording.`).join("\n"),
              // Short clips must be text-only: delivery/pronunciation prompts
              // can be spoken or repeated by this endpoint. Respelling stays in text.
              ...(batch.length === 1 ? {} : { prompt: "Read exactly the supplied text in a calm, warm reading-teacher voice. Pause one second before and after each phrase Next recording. Speak the phrase Next recording every time. Do not add numbers, explanations, or introductions." }),
            },
            voice: { languageCode: "en-US", name: "Autonoe", model_name: "gemini-2.5-flash-tts" },
            audioConfig: { audioEncoding: "MP3" },
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.audioContent) throw new Error(`Cloud TTS ${response.status}`);
        await fs.writeFile(join(tmp, "batch.mp3"), Buffer.from(result.audioContent, "base64"));
        if (batch.length === 1) {
          const file = `${dir}/${batch[0].id}`;
          const duration = Number(spawnSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", join(tmp, "batch.mp3")], { encoding: "utf8" }).stdout);
          const pace = batch[0].text.split(/\s+/).length * 60 / duration;
          const tempo = Number.isFinite(pace) && pace > 165 ? Math.max(0.65, 165 / pace) : 1;
          const encoded = spawnSync(
            "ffmpeg",
            [
              "-y",
              "-i",
              join(tmp, "batch.mp3"),
              "-af",
              `${tempo < 1 ? `atempo=${tempo},` : ""}loudnorm=I=-18:TP=-2:LRA=7`,
              "-codec:a",
              "libmp3lame",
              "-qscale:a",
              "2",
              `${file}.mp3`,
            ],
            { stdio: "ignore" },
          );
          if (encoded.status !== 0) throw new Error("Audio encoding failed");
          await fs.writeFile(`${file}.sha256`, batch[0].hash);
        } else {
          const split = spawnSync(
            "python3",
            [
              "scripts/placement-spectrum-split.py",
              join(tmp, "batch.mp3"),
              join(tmp, "clips.json"),
            ],
            { encoding: "utf8", timeout: 180000 },
          );
          if (split.status !== 0)
            throw new Error(`Audio split failed: ${split.stderr.slice(-250)}`);
        }
        ok = true;
        console.log(`Built ${batch.length} clips (${i + batch.length}/${pending.length})`);
      } catch (error) {
        console.log(String(error));
        await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)));
      }
    }
    if (!ok) failures += batch.length;
    await fs.rm(tmp, { recursive: true, force: true });
  }
  console.log(`Audio build complete; ${failures} failures`);
  if (failures) process.exitCode = 1;
}
void main();
