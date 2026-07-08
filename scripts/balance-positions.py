#!/usr/bin/env python3
"""
Answer-position de-bias utility (Filip flagged a C/B-heavy, D-light skew).

A kid must never be able to game position ("pick C when unsure"). This
reshuffles each MCQ's choices so the CORRECT answer lands in an evenly
distributed slot (~25/25/25/25), and shuffles the distractors too so the
whole thing is genuinely scrambled — not just the answer moved.

  python3 scripts/balance-positions.py --check          # report current skew
  python3 scripts/balance-positions.py --apply          # rewrite balanced

IMPORTANT: `correct` is stored as the answer STRING, so reshuffling never
breaks correctness. But the question audio (audio_url) reads the choices IN
ORDER, so any question whose order changes needs its audio regenerated.
--apply prints the affected ids for exactly that follow-up (and, since the
adaptive rebuild regenerates question audio anyway, this folds in there).

This same balance() is the hard rule the generation pipeline calls on every
new batch, so balanced positions are guaranteed by construction going forward.
"""
import json, glob, sys, random
from collections import Counter

LETTERS = "ABCDEF"

def balance(questions, seed=42):
    """Reassign correct-answer positions round-robin + shuffle distractors.
    Mutates each question's `choices` in place. Returns list of changed ids."""
    rng = random.Random(seed)
    changed = []
    # round-robin target slot across the whole set → exact balance
    target = 0
    for q in questions:
        ch = q.get("choices")
        corr = q.get("correct")
        if not ch or corr not in ch:
            continue
        n = len(ch)
        slot = target % n
        target += 1
        distractors = [c for c in ch if c != corr]
        rng.shuffle(distractors)
        new = distractors[:]
        new.insert(slot, corr)
        if new != ch:
            q["choices"] = new
            changed.append(q.get("id"))
    return changed

def report(files):
    pos = Counter(); total = 0
    for f in files:
        for std in json.load(open(f)).get("standards", []):
            for q in std.get("questions", []):
                ch, corr = q.get("choices"), q.get("correct")
                if ch and corr in ch:
                    pos[ch.index(corr)] += 1; total += 1
    print(f"correct-answer position over {total} MCQs (target ~25% each):")
    for i in range(4):
        n = pos[i]
        bar = "█" * round(50 * n / max(pos.values())) if pos else ""
        print(f"  {LETTERS[i]}: {n:4} ({round(100*n/total) if total else 0:2}%)  {bar}")

def main():
    files = [f for f in sorted(glob.glob("app/data/*-standards-questions.json")) if not f.endswith("-es.json")]
    apply = "--apply" in sys.argv
    if not apply:
        print("BEFORE:")
        report(files)
        print("\n(run with --apply to rebalance)")
        return
    all_changed = []
    for f in files:
        data = json.load(open(f))
        qs = [q for std in data.get("standards", []) for q in std.get("questions", []) if q.get("type", "multiple_choice") == "multiple_choice"]
        all_changed += balance(qs)
        json.dump(data, open(f, "w"), indent=2)
    print("AFTER:")
    report(files)
    print(f"\nreshuffled {len(all_changed)} questions — their audio_url now reads a stale order and needs regen.")
    json.dump(all_changed, open("scripts/reshuffled-ids.json", "w"))
    print("affected ids -> scripts/reshuffled-ids.json")

if __name__ == "__main__":
    main()
