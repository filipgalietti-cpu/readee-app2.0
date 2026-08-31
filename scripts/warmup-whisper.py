"""
Batch Whisper transcription for warm-up clip verification.

    python3 scripts/warmup-whisper.py <model> <manifest.json>

manifest.json = ["abs/path/a.mp3", ...]
stdout        = {"abs/path/a.mp3": "transcript", ...}

The TS side (scripts/warmup-generate.ts) owns compare/arbitrate/retry policy;
this script only transcribes, so "base" and "small" runs share one code path.
"""
import json
import sys

import whisper

if len(sys.argv) < 3:
    print("Usage: python3 scripts/warmup-whisper.py <model> <manifest.json>", file=sys.stderr)
    sys.exit(1)

model_name = sys.argv[1]
with open(sys.argv[2]) as f:
    files = json.load(f)

model = whisper.load_model(model_name)
out = {}
for fp in files:
    try:
        r = model.transcribe(fp, fp16=False, language="en")
        out[fp] = (r.get("text") or "").strip()
    except Exception as e:  # noqa: BLE001 — report per-file, keep the batch going
        out[fp] = f"__ERROR__ {e}"

json.dump(out, sys.stdout)
