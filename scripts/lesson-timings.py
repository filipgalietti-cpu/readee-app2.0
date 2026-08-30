"""
Whisper word-timestamps for ANY lesson's narration clips.
Reads public/audio/lessons-v2/<id>/*.mp3 (narration only, not words/) and writes
app/data/lessons-v2/<id>-timings.json — the map the engine uses to fire cues at
the exact spoken word.

    python3 scripts/lesson-timings.py silent-e
"""
import os
import sys
import json
import whisper

if len(sys.argv) < 2:
    print("Usage: python3 scripts/lesson-timings.py <lesson-id>")
    sys.exit(1)

LESSON = sys.argv[1]
IN = f"public/audio/lessons-v2/{LESSON}"
OUT = f"app/data/lessons-v2/{LESSON}-timings.json"

if not os.path.isdir(IN):
    print(f"No audio dir: {IN} — run lesson-tts.ts first.")
    sys.exit(1)

model = whisper.load_model("base")
out = {}

for fn in sorted(os.listdir(IN)):
    if not fn.endswith(".mp3"):
        continue
    sid = fn[:-4]
    r = model.transcribe(os.path.join(IN, fn), word_timestamps=True, fp16=False)
    words = []
    for seg in r.get("segments", []):
        for w in seg.get("words", []):
            words.append(
                {"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
            )
    dur = round(words[-1]["end"], 3) if words else 0
    out[sid] = {"duration": dur, "words": words}
    print(f"  {sid:14} {len(words):3} words  {dur:5.1f}s")

with open(OUT, "w") as f:
    json.dump(out, f, indent=1)
print("\nwrote", OUT)
