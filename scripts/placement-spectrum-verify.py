"""Transcribe static assessment clips locally; persist every result for resume.
Usage: python3 scripts/placement-spectrum-verify.py /tmp/spectrum-scripts.json
Transcription agreement is an automated check, not a specialist content review.
"""
import hashlib
import json
import pathlib
import re
import sys
import unicodedata
import subprocess
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
    # Orthographic variants with the same pronunciation, not missing words.
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))
    text = re.sub(r"\b(?:tick[ -]*tock|tiktok)\b", "ticktock", text, flags=re.I)
    text = re.sub(r"\bneigh\b", "nay", text, flags=re.I)
    for word, numeral in {"zero":"0", "one":"1", "two":"2", "three":"3", "four":"4", "five":"5", "six":"6", "seven":"7", "eight":"8", "nine":"9", "ten":"10", "first":"1st", "second":"2nd", "third":"3rd", "fourth":"4th"}.items():
        text = re.sub(r"\b" + word + r"\b", numeral, text, flags=re.I)
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
    duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)], text=True))
    if duration > 4 + len(tokens(script)) * 0.8:
        results[key] = {"audioSha256":digest,"script":script,"status":"review","reason":"Audio too long for script","durationSeconds":round(duration,3)}
        out.write_text(json.dumps(results,indent=2)+"\n")
        print(key, "review: excessive duration", flush=True)
        continue
    prior = results.get(key,{})
    if prior.get("audioSha256") == digest:
        error = wer(script, prior.get("transcript", ""))
        prior.update(script=script,wordErrorRate=round(error,3),status="matched" if error==0 else "review")
        out.write_text(json.dumps(results,indent=2)+"\n")
        if prior.get("status") == "matched" or prior.get("model", "base") == model_name: continue
    transcript = model.transcribe(str(path),fp16=False,language="en",initial_prompt="Names: Readee, Luna, Nia.")["text"].strip()
    error = wer(script,transcript)
    results[key] = {"model":model_name,"vocabularyPrompt":"Names: Readee, Luna, Nia.","script":script,"transcript":transcript,"audioSha256":digest,"wordErrorRate":round(error,3),"status":"matched" if error == 0 else "review"}
    out.write_text(json.dumps(results,indent=2)+"\n")
    print(key, results[key]["status"], transcript, flush=True)
print(f"Checked {len(results)} clips",flush=True)
