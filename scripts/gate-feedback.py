#!/usr/bin/env python3
"""Deterministic gate for authored MCQ feedback (scripts/fb-out/*.json).

Trust nothing the AI wrote — verify mechanically before applying:
  - all 3 lines present + non-empty + length-bounded
  - LEAK: incorrect_feedback must NOT contain the correct-answer phrase
    (the 1st-wrong nudge must not give the answer away)
  - reveal_feedback SHOULD reference the correct answer
Passing rows -> scripts/feedback-approved.json ; failures printed + saved.

  python3 scripts/gate-feedback.py
"""
import json, re, glob
from pathlib import Path

DATA = Path("app/data")
FILES = ["kindergarten", "1st-grade", "2nd-grade", "3rd-grade", "4th-grade"]
MAXLEN = 220


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", (s or "").lower()).strip()


# build id -> correct-answer text map from live data
correct_by_id = {}
for fn in FILES:
    d = json.loads((DATA / f"{fn}-standards-questions.json").read_text())
    for s in d["standards"]:
        for q in s.get("questions", []):
            c = q.get("correct")
            if isinstance(c, list):
                c = c[0] if c else ""
            elif isinstance(c, str):
                c = c.split("|")[0]
            correct_by_id[q["id"]] = c or ""

approved, fails = [], []
seen = set()
for f in sorted(glob.glob("scripts/fb-out/*.json")):
    try:
        rows = json.loads(Path(f).read_text())
    except Exception as e:
        fails.append({"file": f, "error": f"unparseable: {e}"})
        continue
    for r in rows:
        qid = r.get("id")
        cf, inf, rf = r.get("correct_feedback"), r.get("incorrect_feedback"), r.get("reveal_feedback")
        problems = []
        if qid not in correct_by_id:
            problems.append("unknown id")
        if qid in seen:
            problems.append("duplicate id")
        for name, v in [("correct", cf), ("incorrect", inf), ("reveal", rf)]:
            if not v or not str(v).strip():
                problems.append(f"empty {name}")
            elif len(str(v)) > MAXLEN:
                problems.append(f"{name} too long ({len(str(v))})")
        ans = norm(correct_by_id.get(qid, ""))
        # Word-boundary match so a phonics answer like "m" (from "/m/")
        # doesn't false-trigger inside words like "map". Only flag when
        # the whole answer phrase appears as standalone words in the nudge.
        if ans and inf and re.search(r"\b" + re.escape(ans) + r"\b", norm(inf)):
            problems.append("LEAK: nudge contains the answer")
        # Reveal must reference the answer — fuzzy: share most content
        # words (paraphrases that resolve pronouns are fine, e.g.
        # "She put them" -> "Bella put the apples"). Match on 4-char stem.
        STOP = {"the","a","an","to","of","in","on","at","is","are","was","were",
                "he","she","it","they","them","his","her","its","their","that",
                "this","and","or","for","with","by","up","out","not","did","do",
                "you","your","i","me","my","we","us","one","from","as","so"}
        if ans and rf:
            content = [w for w in ans.split() if w not in STOP and len(w) >= 3]
            rwords = norm(rf).split()
            if content:
                hit = sum(1 for w in content if any(
                    rw[:4] == w[:4] or rw == w for rw in rwords))
                if hit / len(content) < 0.6:
                    problems.append("reveal omits the answer")
        seen.add(qid)
        if problems:
            fails.append({"id": qid, "problems": problems,
                          "incorrect": (inf or "")[:80], "answer": correct_by_id.get(qid, "")})
        else:
            approved.append({"id": qid, "correct_feedback": cf,
                             "incorrect_feedback": inf, "reveal_feedback": rf})

Path("scripts/feedback-approved.json").write_text(json.dumps(approved, indent=1))
Path("scripts/feedback-fails.json").write_text(json.dumps(fails, indent=1))
print(f"authored: {len(approved)+len(fails)}  |  PASS: {len(approved)}  |  FAIL: {len(fails)}")
if fails:
    print("\nFailures (first 20):")
    for x in fails[:20]:
        print(f"  {x.get('id','?'):16} {x.get('problems') or x.get('error')}")
    print(f"\n-> scripts/feedback-fails.json ({len(fails)})")
print(f"-> scripts/feedback-approved.json ({len(approved)})")
