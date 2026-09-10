"""Transcribe static assessment clips locally; persist every result for resume.
Usage: python3 scripts/placement-spectrum-verify.py /tmp/spectrum-scripts.json
Transcription agreement is an automated check, not a specialist content review.
"""
import hashlib
import json
import pathlib
import re
import sys
import whisper
import torch

torch.set_num_threads(4)
scripts = json.loads(pathlib.Path(sys.argv[1]).read_text())
root = pathlib.Path(sys.argv[2] if len(sys.argv)>2 else "public/audio/placement-spectrum")
out = pathlib.Path(sys.argv[3] if len(sys.argv)>3 else "app/data/placement-spectrum/audio-check.json")
results = json.loads(out.read_text()) if out.exists() else {}
model_name = sys.argv[4] if len(sys.argv)>4 else "base"
model = whisper.load_model(model_name)
def tokens(text):
    text = re.sub(r"\bmph\b", "miles per hour", text.lower())
    return re.sub(r"[^a-z0-9 ]", " ", text).split()
def wer(a, b):
    a, b = tokens(a), tokens(b)
    prev = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        row = [i]
        for j, y in enumerate(b, 1):
            row.append(min(row[-1]+1, prev[j]+1, prev[j-1]+(x != y)))
        prev = row
    return prev[-1]/max(1,len(a))
for key, script in scripts.items():
    path = root / f"{key}.mp3"
    if not path.exists(): continue
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    prior = results.get(key,{})
    if prior.get("audioSha256") == digest:
        error = wer(script, prior.get("transcript", ""))
        prior.update(script=script,wordErrorRate=round(error,3),status="matched" if error==0 else "review")
        out.write_text(json.dumps(results,indent=2)+"\n")
        if prior.get("status") == "matched" or prior.get("model", "base") == model_name: continue
    transcript = model.transcribe(str(path),fp16=False,language="en")["text"].strip()
    error = wer(script,transcript)
    results[key] = {"model":model_name,"script":script,"transcript":transcript,"audioSha256":digest,"wordErrorRate":round(error,3),"status":"matched" if error == 0 else "review"}
    out.write_text(json.dumps(results,indent=2)+"\n")
    print(key, results[key]["status"], transcript, flush=True)
print(f"Checked {len(results)} clips",flush=True)
