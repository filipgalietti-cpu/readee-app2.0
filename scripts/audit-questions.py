#!/usr/bin/env python3
"""
Phase 0 of the quality turnaround: a DETERMINISTIC question scanner.

No AI judgment — only objective facts a script can verify 100% of the
time (the whole point: stop AI grading its own homework). Catches the
defect classes we found by hand in RL.K.2 and reports how deep they go
across the entire catalog, plus a full asset-coverage (audio/image) map.

  python3 scripts/audit-questions.py            # summary to stdout
  python3 scripts/audit-questions.py --json     # + write scripts/question-audit.json

Checks (per question):
  letter_prefix        choice text starts with "A." / "B)" etc.
  correct_not_in_choices   the `correct` value doesn't match any choice
  no_passage           RL/RI comprehension Q with no passage to answer from
  too_few_choices      MCQ with < 4 options
  empty_field          blank prompt or a blank choice
  dup_choices          two identical choices
Assets (tracked separately, per grade + per standard):
  missing_audio        no prompt audio (K/1 = critical)
  missing_image        no image  -> renderer shows the bunny placeholder
"""
import json, re, sys, collections
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "app" / "data"
FILES = [
    ("K",  "kindergarten-standards-questions.json"),
    ("1",  "1st-grade-standards-questions.json"),
    ("2",  "2nd-grade-standards-questions.json"),
    ("3",  "3rd-grade-standards-questions.json"),
    ("4",  "4th-grade-standards-questions.json"),
]
WRITE_JSON = "--json" in sys.argv

LETTER_PREFIX = re.compile(r"^\s*[A-Da-d]\s*[.)]\s+")
WH = re.compile(r"^\s*(what|why|how|who|where|which|when)\b", re.I)
# A prompt that embeds its own passage. Only an explicit "listen to the
# story: <text>" cue counts as a cue — bare references like "in the
# story" do NOT (that's a question ABOUT a story, not one containing it).
# Length / multi-sentence is the main signal that the passage is present.
EMBED_CUE = re.compile(r"listen to (the|this) story", re.I)


def norm_correct(correct):
    """correct may be a string, a 'a|b' multi string, or a list."""
    if correct is None:
        return []
    if isinstance(correct, list):
        return [str(c) for c in correct]
    return str(correct).split("|")


def sentences(text):
    return [s for s in re.split(r"[.!?]+", text) if s.strip()]


def check_question(std, grade, q):
    """Return a list of defect codes for one question."""
    flags = []
    qtype = q.get("type", "multiple_choice")
    prompt = (q.get("prompt") or "").strip()
    choices = q.get("choices") or []
    is_mcq = qtype == "multiple_choice"

    # --- content facts ---
    if not prompt:
        flags.append("empty_field")
    if is_mcq:
        if any(not str(c).strip() for c in choices):
            flags.append("empty_field")
        if any(LETTER_PREFIX.match(str(c)) for c in choices):
            flags.append("letter_prefix")
        if len(choices) < 4:
            flags.append("too_few_choices")
        if len(set(str(c).strip().lower() for c in choices)) < len(choices):
            flags.append("dup_choices")
        # correctness integrity
        corr = norm_correct(q.get("correct"))
        chset = set(str(c).strip() for c in choices)
        if corr and not all(c.strip() in chset for c in corr):
            flags.append("correct_not_in_choices")

    # --- no passage (RL/RI comprehension only) ---
    if is_mcq and (std.startswith("RL.") or std.startswith("RI.")):
        embedded = (
            bool(EMBED_CUE.search(prompt))
            or len(prompt) >= 110
            or len(sentences(prompt)) >= 2
            or bool(q.get("passage_audio_url"))
        )
        if WH.match(prompt) and not embedded:
            flags.append("no_passage")

    return flags


def main():
    scorecard = {
        "totals": {"questions": 0, "by_grade": {}, "by_type": collections.Counter()},
        "defects": collections.Counter(),
        "assets": {"missing_audio": 0, "missing_image": 0, "by_grade": {}},
        "adaptive_generated": {"count": 0, "missing_audio": 0, "missing_image": 0},
        "examples": collections.defaultdict(list),
        "worst_standards": [],
    }
    per_std = collections.defaultdict(lambda: {"n": 0, "defects": 0, "no_audio": 0, "no_image": 0})

    for grade, fname in FILES:
        d = json.loads((DATA / fname).read_text())
        gtot = {"questions": 0, "missing_audio": 0, "missing_image": 0, "defects": 0}
        for s in d.get("standards", []):
            std = s.get("standard_id", "?")
            for q in s.get("questions", []):
                scorecard["totals"]["questions"] += 1
                gtot["questions"] += 1
                scorecard["totals"]["by_type"][q.get("type", "multiple_choice")] += 1
                per_std[std]["n"] += 1

                # assets
                if not q.get("audio_url"):
                    scorecard["assets"]["missing_audio"] += 1
                    gtot["missing_audio"] += 1
                    per_std[std]["no_audio"] += 1
                if not q.get("image_url"):
                    scorecard["assets"]["missing_image"] += 1
                    gtot["missing_image"] += 1
                    per_std[std]["no_image"] += 1
                if q.get("adaptiveGenerated"):
                    scorecard["adaptive_generated"]["count"] += 1
                    if not q.get("audio_url"):
                        scorecard["adaptive_generated"]["missing_audio"] += 1
                    if not q.get("image_url"):
                        scorecard["adaptive_generated"]["missing_image"] += 1

                # defects
                flags = check_question(std, grade, q)
                for f in flags:
                    scorecard["defects"][f] += 1
                    gtot["defects"] += 1
                    per_std[std]["defects"] += 1
                    if len(scorecard["examples"][f]) < 8:
                        scorecard["examples"][f].append(
                            {"id": q.get("id"), "prompt": (q.get("prompt") or "")[:80]}
                        )
        scorecard["totals"]["by_grade"][grade] = gtot["questions"]
        scorecard["assets"]["by_grade"][grade] = {
            "missing_audio": gtot["missing_audio"],
            "missing_image": gtot["missing_image"],
        }

    # rank standards for the human-review queue: most defects first
    ranked = sorted(per_std.items(), key=lambda kv: (-kv[1]["defects"], -kv[1]["no_audio"]))
    scorecard["worst_standards"] = [
        {"standard": k, **v} for k, v in ranked if v["defects"] > 0
    ][:25]

    _print(scorecard, per_std)
    if WRITE_JSON:
        out = Path(__file__).resolve().parent / "question-audit.json"
        # Counters -> plain dicts for JSON
        sc = json.loads(json.dumps(scorecard, default=lambda o: dict(o)))
        out.write_text(json.dumps(sc, indent=2))
        print(f"\nFull scorecard -> {out}")


def _print(sc, per_std):
    tot = sc["totals"]["questions"]
    print("=" * 62)
    print(f"  READEE QUESTION AUDIT  ·  {tot} questions across {len(per_std)} standards")
    print("=" * 62)
    print("\n  By grade: " + "  ".join(f"{g}:{n}" for g, n in sc["totals"]["by_grade"].items()))
    print("  By type:  " + "  ".join(f"{t}:{n}" for t, n in sc["totals"]["by_type"].items()))

    print("\n  DEFECTS (deterministic — these are facts, not opinions)")
    if not sc["defects"]:
        print("    (none)")
    for code, n in sc["defects"].most_common():
        pct = 100 * n / tot
        print(f"    {code:24} {n:5}  ({pct:4.1f}%)")

    print("\n  ASSET GAPS")
    a = sc["assets"]
    print(f"    missing question audio   {a['missing_audio']:5}  ({100*a['missing_audio']/tot:4.1f}%)")
    print(f"    missing image            {a['missing_image']:5}  ({100*a['missing_image']/tot:4.1f}%)")
    print("    per grade (audio / image missing):")
    for g, v in a["by_grade"].items():
        print(f"      {g:2}  audio {v['missing_audio']:4}   image {v['missing_image']:4}")

    ag = sc["adaptive_generated"]
    if ag["count"]:
        print(f"\n  ADAPTIVE-GENERATED items: {ag['count']}  "
              f"(missing audio {ag['missing_audio']}, missing image {ag['missing_image']})")

    print("\n  WORST STANDARDS (most defects — top of the review queue):")
    for row in sc["worst_standards"][:12]:
        print(f"    {row['standard']:10} defects:{row['defects']:3}  no_audio:{row['no_audio']:3}  no_image:{row['no_image']:3}")


if __name__ == "__main__":
    main()
