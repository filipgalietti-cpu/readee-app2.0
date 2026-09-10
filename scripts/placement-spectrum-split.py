"""Split a synthesized batch at spoken delimiters, which are excluded from clips.
The separate per-clip verifier checks the resulting files again.
"""
import json, pathlib, subprocess, sys
import whisper, torch
torch.set_num_threads(4)
source, manifest = sys.argv[1:3]
clips = json.loads(pathlib.Path(manifest).read_text())
model = whisper.load_model("base")
result = model.transcribe(source,fp16=False,language="en",word_timestamps=True)
words = [w for s in result["segments"] for w in s["words"]]
norm = lambda s: ''.join(c for c in s.lower() if c.isalpha())
markers = [(words[i]["start"],words[i+1]["end"]) for i in range(len(words)-1) if norm(words[i]["word"]) == "next" and norm(words[i+1]["word"]) == "recording"]
if len(markers) == len(clips)-1 and markers:
    tail = [w["word"] for w in words if w["start"] >= markers[-1][1]]
    if norm(" ".join(tail)) == norm(clips[-1]["text"]):
        duration = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",source]))
        markers.append((duration,duration))
if len(markers) != len(clips):
    pathlib.Path(source+".transcript.json").write_text(json.dumps(result))
    raise RuntimeError(f"Expected {len(clips)} delimiters, found {len(markers)}. Nothing published.")
start = 0
for clip, (end, marker_end) in zip(clips,markers):
    target = pathlib.Path("public/audio/placement-spectrum") / (clip["id"]+".mp3")
    duration = end-start-0.04
    if duration < 0.25: raise RuntimeError("Invalid clip boundary")
    subprocess.run(["ffmpeg","-y","-ss",str(start),"-t",str(duration),"-i",source,"-af","loudnorm=I=-18:TP=-2:LRA=7","-codec:a","libmp3lame","-qscale:a","2",str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    target.with_suffix(".sha256").write_text(clip["hash"])
    start = marker_end+0.04
print(f"Split {len(clips)} clips; delimiters removed")
