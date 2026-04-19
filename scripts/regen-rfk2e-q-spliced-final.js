#!/usr/bin/env node
/**
 * Splice real phoneme audio into RF.K.2e MCQ prompts.
 * User's preferred format with phoneme audio actually played.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleAuth } = require("google-auth-library");

const PROJECT_ID = "readee-487403";
const LOCATION = "us-central1";
const MODEL = "gemini-2.5-pro-preview-tts";
const VOICE = "Autonoe";
const SAMPLE_RATE = 22050;
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;
const PHONEME_DIR = path.resolve(__dirname, "..", "public/audio/phonemes");
const TMP = path.resolve(__dirname, "..", ".tmp-splice");
fs.mkdirSync(TMP, { recursive: true });

// Each chunk is at least 5 words to avoid Gemini hallucination on short pieces.
const QS = {
  "RF.K.2e-Q1": [
    { tts: "Start with the word Cat. Change the" },
    { phoneme: "c_hard" },
    { tts: "sound, to the" },
    { phoneme: "b" },
    { tts: "sound. What new word do you get? Sat, Bat, Mat, or Hat. What do you think?" },
  ],
  "RF.K.2e-Q2": [
    { tts: "Start with the word Hop. Change the" },
    { phoneme: "h" },
    { tts: "sound, to the" },
    { phoneme: "t" },
    { tts: "sound. What new word do you get? Top, Pop, Cop, or Mop. What do you think?" },
  ],
  "RF.K.2e-Q3": [
    { tts: "Start with the word Man. Change the" },
    { phoneme: "short_a" },
    { tts: "sound, to the" },
    { phoneme: "short_e" },
    { tts: "sound. What new word do you get? Mun, Mon, Min, or Men. What do you think?" },
  ],
  "RF.K.2e-Q4": [
    { tts: "Start with the word Sit. Change the" },
    { phoneme: "t" },
    { tts: "sound, to the" },
    { phoneme: "p" },
    { tts: "sound. What new word do you get? Sip, Set, Sat, or Sap. What do you think?" },
  ],
  "RF.K.2e-Q5": [
    { tts: "Start with the word Top. Add the" },
    { phoneme: "s" },
    { tts: "sound to the very beginning. What new word do you get? Spot, Stop, Step, or Tops. What do you think?" },
  ],
};

let _token = null;
async function getToken() {
  if (_token) return _token;
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const c = await auth.getClient(); const t = await c.getAccessToken(); _token = t.token; return _token;
}
async function genTTS(text, out) {
  const body = { contents: [{ role: "user", parts: [{ text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } };
  for (let attempt = 0; attempt < 6; attempt++) {
    const tok = await getToken();
    const r = await fetch(ENDPOINT, { method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.status === 429) { const wait = 30 + attempt * 15; console.log(`  429 — wait ${wait}s`); await new Promise(rs => setTimeout(rs, wait * 1000)); continue; }
    if (!r.ok) throw new Error("API " + r.status + ": " + (await r.text()).slice(0, 200));
    const j = await r.json();
    const chunks = Array.isArray(j) ? j : [j];
    const bufs = [];
    for (const c of chunks) for (const p of (c?.candidates?.[0]?.content?.parts || [])) if (p.inlineData?.data) bufs.push(Buffer.from(p.inlineData.data, "base64"));
    const tmpRaw = out.replace(/\.mp3$/, ".raw");
    fs.writeFileSync(tmpRaw, Buffer.concat(bufs));
    execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${tmpRaw}" -codec:a libmp3lame -qscale:a 2 "${out}"`, { stdio: "pipe" });
    fs.unlinkSync(tmpRaw);
    return;
  }
  throw new Error("failed after 6 retries");
}
function silence(d, out) { execSync(`ffmpeg -y -f lavfi -i anullsrc=r=${SAMPLE_RATE}:cl=mono -t ${d} -codec:a libmp3lame -qscale:a 2 "${out}"`, { stdio: "pipe" }); }

(async () => {
  for (const [qid, segs] of Object.entries(QS)) {
    console.log(qid);
    const pieces = [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (s.tts) { const f = path.join(TMP, `${qid}-${i}.mp3`); await genTTS(s.tts, f); pieces.push(f); }
      else { pieces.push(path.join(PHONEME_DIR, `${s.phoneme}.mp3`)); }
      if (i < segs.length - 1) { const sf = path.join(TMP, `${qid}-${i}-sil.mp3`); silence(0.25, sf); pieces.push(sf); }
    }
    const list = path.join(TMP, `${qid}-list.txt`);
    fs.writeFileSync(list, pieces.map(p => `file '${p}'`).join("\n"));
    const out = path.resolve(__dirname, "..", `public/audio/kindergarten/RF.K.2e/${qid}.mp3`);
    execSync(`ffmpeg -y -f concat -safe 0 -i "${list}" -codec:a libmp3lame -qscale:a 2 "${out}"`, { stdio: "pipe" });
    console.log("  done");
  }
})().catch(e => { console.error(e); process.exit(1); });
