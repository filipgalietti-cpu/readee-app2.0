#!/usr/bin/env python3
"""
lint-lesson.py — deterministic conformance linter (Phase 1 of the cure).

Enforces the machine-checkable invariants from scripts/CANONICAL_LESSON_SPEC.md
(derived from the canonical lesson L.4.4b). Runs on all 201 lessons in seconds,
$0, no agents. Replaces the 5-6M-token vision audit for ~20 of 25 rubric rules.

Each violation is tagged:
  - fixer='renderer'  -> handled by the Phase 3 renderer hardening
  - fixer='auto'      -> deterministically auto-fixable (Phase 2 morph)
  - fixer='content'   -> needs a real content rewrite (short flag list)
  - fixer='asset'     -> regen audio/image (Phase 5)

Usage:
  python3 scripts/lint-lesson.py                 # summary + writes scripts/lint-report.json
  python3 scripts/lint-lesson.py --standard=RI.1.3
"""
import json, glob, re, sys

SAMPLE = "app/data/sample-lessons.json"
VISUAL_FIELDS = ("displayText", "displayParts", "displayTableRow",
                 "displayDiagram", "displayDiagramSwap", "displayAlphabetGrid")
TEACHING = ("intro", "teach", "example", "tip", "practice-intro", "interactive")

def load_bank():
    bank = set()
    for f in glob.glob("app/data/*-standards-questions.json"):
        if f.endswith("-es.json"): continue
        for std in json.load(open(f)).get("standards", []):
            for q in std.get("questions", []):
                if q.get("prompt") and q.get("choices"):
                    bank.add(q["id"])
    return bank

def load_audio_fails():
    try:
        a = json.load(open("scripts/audio-audit.json"))
        return {f.get("file") or f.get("std") for f in a.get("fails", [])}, \
               {f.get("std") for f in a.get("fails", [])}
    except Exception:
        return set(), set()

def load_timed():
    try:
        return set(json.load(open("scripts/slide-timings.json")).keys())
    except Exception:
        return set()

def words(s):
    return [w for w in re.split(r"\s+", (s or "").strip()) if w]

def is_visual(step):
    return any(step.get(k) for k in VISUAL_FIELDS)

def norm_word(w):
    return re.sub(r"[^a-z0-9]", "", (w or "").lower())

def lint(lesson, bank, audio_fail_stds, timed):
    std = lesson["standardId"]
    slides = lesson.get("slides", [])
    teach_slides = [s for s in slides if s.get("type") != "mcq"]
    mcqs = [s for s in slides if s.get("type") == "mcq"]
    V = []  # violations: (inv, rule, fixer, detail)
    phonics = std.startswith("RF.")

    # INV-1 sequence
    order = [s.get("type") for s in teach_slides]
    seq_ok = order and order[0] == "intro"
    if "interactive" in order and "practice-intro" in order:
        if order.index("interactive") > order.index("practice-intro"):
            V.append(("INV-1", 1, "content", "interactive after practice-intro"))
    if not seq_ok:
        V.append(("INV-1", 1, "content", f"does not start with intro: {order[:3]}"))
    # example expected unless phonics
    if "example" not in order and not phonics:
        V.append(("INV-1", 1, "content", "missing example ('Let's Try One')"))

    # INV-2 exactly one interactive
    ni = order.count("interactive")
    if ni != 1:
        V.append(("INV-2", 1, "content", f"{ni} interactive forks (need 1)"))

    # INV-3 mcqs resolve
    if not mcqs and not phonics:
        V.append(("INV-3", 24, "content", "no MCQ practice"))
    dead = [s.get("mcqId") for s in mcqs if s.get("mcqId") not in bank]
    if dead:
        V.append(("INV-3", 24, "auto", f"dead mcq refs: {dead}"))

    # INV-4 heading — flag only UNAMBIGUOUS problems: empty, or absurdly
    # long (>6 words). 1-word concept headings ("Idioms", "Opposites") and
    # 6-word playful ones ("How Do We Retell a Story?") are legitimate.
    for s in teach_slides:
        h = s.get("heading", "")
        n = len(words(h))
        if n == 0:
            V.append(("INV-4", 2, "content", f"[{s['type']}] EMPTY heading"))
        elif n > 6:
            V.append(("INV-4", 2, "content", f"[{s['type']}] heading {n}w: {h!r}"))

    # INV-5 ends on visual (except example + interactive)
    for s in teach_slides:
        if s["type"] in ("example", "interactive"): continue
        steps = s.get("steps", [])
        if steps and not is_visual(steps[-1]):
            V.append(("INV-5", 25, "renderer", f"[{s['type']}] '{s.get('heading')}' ends audio-only (mobile blank risk)"))

    # INV-6 highlightWord on-screen  &  INV-7/8 terseness
    for s in teach_slides:
        for st in s.get("steps", []):
            hw = st.get("highlightWord")
            hw_word = hw.get("word") if isinstance(hw, dict) else hw
            if hw_word:
                onscreen = " ".join([st.get("displayText", "")] +
                                    [p.get("text", "") for p in (st.get("displayParts") or [])])
                if norm_word(hw_word) and norm_word(hw_word) not in norm_word(onscreen):
                    # multi-word highlights are ok if any token matches
                    toks = [norm_word(t) for t in words(hw_word)]
                    if not any(t and t in norm_word(onscreen) for t in toks):
                        V.append(("INV-6", 25, "auto", f"[{s['type']}] highlightWord {hw_word!r} not on screen"))
            dt = st.get("displayText")
            if dt:
                n = len(words(dt))
                # A story-box / passage — any displayText containing sentence
                # punctuation, or on an example slide — is legitimate narrative
                # (rubric #12) and gets the 16-word limit. A terse anchor (no
                # sentence punctuation) gets 6. We deliberately do NOT try to
                # flag "sentence-as-pill" separately: a good story box and a bad
                # transcript pill are indistinguishable in the data, so we only
                # flag the unambiguous case — a displayText that blows past the
                # 16-word passage limit (a real transcript dump).
                is_passage = s["type"] == "example" or bool(re.search(r"[.!?]", dt))
                limit = 16 if is_passage else 6
                if n > limit:
                    V.append(("INV-7", 4, "content", f"[{s['type']}] displayText {n}w (>{limit}): {dt[:40]!r}"))
            for p in (st.get("displayParts") or []):
                pn = len(words(p.get("text", "")))
                if pn > 6:
                    V.append(("INV-8", 4, "content", f"[{s['type']}] displayPart {pn}w: {p.get('text','')[:40]!r}"))

    # INV-16 audio present + not failed
    for s in teach_slides:
        for st in s.get("steps", []):
            if st.get("ttsScript") and not st.get("audioFile"):
                V.append(("INV-16", 18, "asset", f"[{s['type']}] step {st.get('sub')} missing audioFile"))
    if std in audio_fail_stds:
        V.append(("INV-16", 18, "asset", "has clip(s) flagged by audio judge"))

    # INV-18 timing derived
    missing_t = 0
    for s in teach_slides:
        for st in s.get("steps", []):
            af = st.get("audioFile")
            if af and af not in timed:
                missing_t += 1
    if missing_t:
        V.append(("INV-18", 16, "asset", f"{missing_t} clips not Whisper-timed"))

    # INV-15 interactive shape
    for s in teach_slides:
        if s["type"] != "interactive": continue
        it = s.get("interactive", {})
        k = it.get("kind")
        if k == "tap" and not (it.get("choices") and it.get("correct")):
            V.append(("INV-15", 20, "content", "tap fork missing choices/correct"))
        if k == "match":
            pairs = it.get("correctPairs") or {}
            if len(pairs) < 3:
                V.append(("INV-15", 20, "content", f"match fork has {len(pairs)} pairs (<3)"))
    return V

def main():
    only = None
    for a in sys.argv[1:]:
        if a.startswith("--standard="): only = a.split("=")[1]
    lessons = json.load(open(SAMPLE))
    bank = load_bank(); _, audio_fail_stds = load_audio_fails(); timed = load_timed()
    report = {}
    for l in lessons:
        if only and l["standardId"] != only: continue
        report[l["standardId"]] = [
            {"inv": v[0], "rule": v[1], "fixer": v[2], "detail": v[3]}
            for v in lint(l, bank, audio_fail_stds, timed)
        ]
    # summary
    total = len(report)
    clean = sum(1 for v in report.values() if not v)
    by_inv, by_fixer = {}, {}
    for std, vs in report.items():
        seen_inv = set()
        for v in vs:
            if v["inv"] not in seen_inv:
                by_inv[v["inv"]] = by_inv.get(v["inv"], 0) + 1
                seen_inv.add(v["inv"])
            by_fixer[v["fixer"]] = by_fixer.get(v["fixer"], 0) + 1
    if only:
        print(json.dumps(report[only], indent=2)); return
    json.dump(report, open("scripts/lint-report.json", "w"), indent=2)
    print(f"LINT: {clean}/{total} lessons fully clean\n")
    print("Lessons failing each invariant:")
    for inv in sorted(by_inv, key=lambda x: -by_inv[x]):
        print(f"  {inv:8} {by_inv[inv]:3d} lessons")
    print("\nViolations by fixer type:")
    for fx in sorted(by_fixer, key=lambda x: -by_fixer[x]):
        print(f"  {fx:9} {by_fixer[fx]:4d} violations")
    print("\n-> scripts/lint-report.json")

if __name__ == "__main__":
    main()
