#!/usr/bin/env python3
"""
Adaptive questions — STEP 1: a-priori difficulty estimator + coverage heatmap.

The DB has no answer data yet (pre-launch), so we can't MEASURE difficulty
from kids. We ESTIMATE it from linguistic signals (free, deterministic):

  - Readability (Flesch-Kincaid grade) of the prompt + choices — captures
    sentence length + syllables/word, which tracks word rarity.
  - The grade band of the standard (K..4).
  - Answer-choice load (more/closer choices = harder) and target-word length.

Blended into a continuous 0-100 score, then bucketed into 5 rungs
(warmup < easy < onlevel < stretch < challenge). Prints a per-standard
coverage heatmap so we can SEE where the catalog is thin — almost certainly
the hard end. Writes scripts/difficulty-map.json.

  python3 scripts/estimate-difficulty.py

This is the a-priori seed. Once learning_events fills with real answers, the
empirical p-value (and later IRT) corrects these estimates.
"""
import json, glob, re
from collections import defaultdict, Counter

VOWELS = "aeiouy"

def syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    count, prev = 0, False
    for ch in w:
        v = ch in VOWELS
        if v and not prev:
            count += 1
        prev = v
    if w.endswith("e") and count > 1:
        count -= 1
    return max(1, count)

def fk_grade(text: str) -> float:
    words = re.findall(r"[A-Za-z']+", text)
    if not words:
        return 0.0
    sents = max(1, len(re.findall(r"[.!?]", text)) or 1)
    syl = sum(syllables(w) for w in words)
    wc = len(words)
    return 0.39 * (wc / sents) + 11.8 * (syl / wc) - 15.59

def grade_of(std: str) -> int:
    # RL.K.1 -> 0 ; RL.3.4 -> 3 ; L.4.2 -> 4
    m = re.search(r"\.(K|\d)\.", std)
    if not m:
        return 2
    return 0 if m.group(1) == "K" else int(m.group(1))

def rarest_word_len(text: str) -> int:
    words = [w for w in re.findall(r"[A-Za-z']+", text) if len(w) > 2]
    return max((len(w) for w in words), default=3)

def main():
    items = []
    for f in sorted(glob.glob("app/data/*-standards-questions.json")):
        if f.endswith("-es.json"):
            continue
        for std in json.load(open(f)).get("standards", []):
            sid = std["standard_id"]
            for q in std.get("questions", []):
                prompt = q.get("prompt") or ""
                choices = q.get("choices") or q.get("missing_choices") or []
                text = prompt + " " + " ".join(choices)
                fk = fk_grade(text)
                g = grade_of(sid)
                nchoices = len(choices) if choices else 3
                rare = rarest_word_len(text)
                # raw difficulty blend (roughly a grade-ish scale, then normalized)
                raw = (
                    0.45 * fk
                    + 0.9 * g
                    + 0.25 * (nchoices - 3)
                    + 0.25 * (rare - 5)
                )
                items.append({
                    "id": q.get("id"),
                    "standard": sid,
                    "grade": g,
                    "type": q.get("type", "multiple_choice"),
                    "fk": round(fk, 1),
                    "raw": raw,
                })

    # normalize raw -> 0..100 percentile
    raws = sorted(x["raw"] for x in items)
    def pct(v):
        lo, hi = raws[0], raws[-1]
        return 0 if hi == lo else round(100 * (v - lo) / (hi - lo))
    for x in items:
        x["difficulty"] = pct(x["raw"])
        x["bucket"] = (
            "warmup" if x["difficulty"] < 20 else
            "easy" if x["difficulty"] < 40 else
            "onlevel" if x["difficulty"] < 60 else
            "stretch" if x["difficulty"] < 80 else
            "challenge"
        )
        del x["raw"]

    json.dump(items, open("scripts/difficulty-map.json", "w"), indent=2)

    # ── report ──
    BUCKETS = ["warmup", "easy", "onlevel", "stretch", "challenge"]
    dist = Counter(x["bucket"] for x in items)
    print(f"\nESTIMATED DIFFICULTY — {len(items)} questions\n" + "─" * 58)
    print("Catalog-wide distribution across the 5 rungs:")
    for b in BUCKETS:
        n = dist[b]
        bar = "█" * round(40 * n / max(dist.values()))
        print(f"  {b:10} {n:4}  {bar}")

    # per-standard coverage: how many rungs does each standard span?
    by_std = defaultdict(lambda: Counter())
    for x in items:
        by_std[x["standard"]][x["bucket"]] += 1
    spans = Counter(len(c) for c in by_std.values())
    print("\nPer-standard rung coverage (how many of the 5 rungs each covers):")
    for k in sorted(spans):
        print(f"  covers {k}/5 rungs: {spans[k]} standards")

    # the holes: standards with NO hard item (stretch/challenge)
    no_hard = [s for s, c in by_std.items() if not (c["stretch"] + c["challenge"])]
    no_easy = [s for s, c in by_std.items() if not (c["warmup"] + c["easy"])]
    print(f"\nHOLES (the generation targets):")
    print(f"  standards with NO hard item (stretch/challenge): {len(no_hard)}/201")
    print(f"  standards with NO easy item (warmup/easy):       {len(no_easy)}/201")
    print(f"  format variety: {dict(Counter(x['type'] for x in items))}")
    print("\n-> scripts/difficulty-map.json")

if __name__ == "__main__":
    main()
