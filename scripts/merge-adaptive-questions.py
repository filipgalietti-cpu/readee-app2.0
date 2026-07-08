#!/usr/bin/env python3
"""
Merge the generated hard + easy questions into the live bank (additive).

Turns the staged 1,036 questions into real, engine-usable data:
  - unique ids per standard (…-H1.. hard, …-E1.. easy)
  - a clean 0-100 `adaptiveDifficulty` on EVERY question (existing from the
    difficulty map; new hard placed high, new easy placed low, spread by the
    same linguistic estimator so they're ordered within their band)
  - balanced answer positions via balance() (round-robin + shuffled distractors)
  - type=multiple_choice, hint kept; NO audio_url (flagged for the launch
    asset pass — audio is generated once, at launch, incl per-choice clips)

Existing 823 questions are untouched except for the additive adaptiveDifficulty
field. Reversible (git). Run once; re-run is idempotent-ish (skips ids present).

  python3 scripts/merge-adaptive-questions.py --apply
"""
import json, glob, sys, re, random
from collections import defaultdict

# linguistic scoring (same as scripts/estimate-difficulty.py)
VOWELS = "aeiouy"
def _syll(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w: return 0
    c, prev = 0, False
    for ch in w:
        v = ch in VOWELS
        if v and not prev: c += 1
        prev = v
    if w.endswith("e") and c > 1: c -= 1
    return max(1, c)
def fk_grade(text):
    words = re.findall(r"[A-Za-z']+", text)
    if not words: return 0.0
    sents = max(1, len(re.findall(r"[.!?]", text)) or 1)
    return 0.39 * (len(words) / sents) + 11.8 * (sum(_syll(w) for w in words) / len(words)) - 15.59
def rarest_word_len(text):
    ws = [w for w in re.findall(r"[A-Za-z']+", text) if len(w) > 2]
    return max((len(w) for w in ws), default=3)

GRADE_FILE = {
    "K": "kindergarten", "1": "1st-grade", "2": "2nd-grade",
    "3": "3rd-grade", "4": "4th-grade",
}

def gkey(std):
    if std.startswith("K."):
        return "K"
    m = re.search(r"\.(K|\d)\.", std)
    return "K" if (not m or m.group(1) == "K") else m.group(1)

def raw_score(q):
    text = q.get("prompt", "") + " " + " ".join(q.get("choices", []))
    return 0.45 * fk_grade(text) + 0.25 * (rarest_word_len(text) - 5)

def balance(questions, seed=7):
    rng = random.Random(seed)
    tgt = 0
    for q in questions:
        ch, corr = q.get("choices"), q.get("correct")
        if not ch or corr not in ch:
            continue
        n = len(ch)
        slot = tgt % n
        tgt += 1
        d = [c for c in ch if c != corr]
        rng.shuffle(d)
        d.insert(slot, corr)
        q["choices"] = d

def band(items, lo, hi):
    """Assign adaptiveDifficulty spread across [lo,hi] by linguistic rank."""
    scored = sorted(items, key=lambda x: raw_score(x["q"]))
    n = len(scored)
    for i, s in enumerate(scored):
        s["q"]["adaptiveDifficulty"] = round(lo + (hi - lo) * (i / max(1, n - 1)))

def main():
    if "--apply" not in sys.argv:
        print("dry — pass --apply to write")
    diffmap = {x["id"]: x["difficulty"] for x in json.load(open("scripts/difficulty-map.json"))}

    # collect new items by standard
    new_by_std = defaultdict(lambda: {"hard": [], "easy": []})
    for f in glob.glob("scripts/generated-hard/*.json"):
        for x in json.load(open(f)):
            for q in x["questions"]:
                new_by_std[x["std"]]["hard"].append(q)
    for f in glob.glob("scripts/generated-easy/*.json"):
        for x in json.load(open(f)):
            for q in x["questions"]:
                new_by_std[x["std"]]["easy"].append(q)

    # score the new items into their bands (all-hard vs all-easy pools)
    hard_pool = [{"std": s, "q": q} for s, v in new_by_std.items() for q in v["hard"]]
    easy_pool = [{"std": s, "q": q} for s, v in new_by_std.items() for q in v["easy"]]
    band(hard_pool, 74, 98)
    band(easy_pool, 4, 26)

    added = 0
    for gk, fname in GRADE_FILE.items():
        path = f"app/data/{fname}-standards-questions.json"
        data = json.load(open(path))
        by_std = {s["standard_id"]: s for s in data["standards"]}
        for std, v in new_by_std.items():
            if gkey(std) != gk or std not in by_std:
                continue
            node = by_std[std]
            existing_ids = {q.get("id") for q in node["questions"]}
            # existing: add adaptiveDifficulty from the map
            for q in node["questions"]:
                if q.get("id") in diffmap and "adaptiveDifficulty" not in q:
                    q["adaptiveDifficulty"] = diffmap[q["id"]]
            # new: build rows, balance, id, no audio
            fresh = []
            for tag, arr in (("H", v["hard"]), ("E", v["easy"])):
                for i, q in enumerate(arr, 1):
                    qid = f"{std}-{tag}{i}"
                    if qid in existing_ids:
                        continue
                    fresh.append({
                        "id": qid,
                        "type": "multiple_choice",
                        "prompt": q["prompt"],
                        "choices": q["choices"],
                        "correct": q["correct"],
                        "hint": q.get("hint", ""),
                        "difficulty": "hard" if tag == "H" else "easy",
                        "adaptiveDifficulty": q.get("adaptiveDifficulty", 50),
                        "adaptiveGenerated": True,  # flags the launch asset pass
                    })
            balance(fresh)
            node["questions"].extend(fresh)
            added += len(fresh)
        if "--apply" in sys.argv:
            json.dump(data, open(path, "w"), indent=2)
    print(f"{'wrote' if '--apply' in sys.argv else 'would add'} {added} new questions into the bank")

if __name__ == "__main__":
    main()
