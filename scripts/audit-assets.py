#!/usr/bin/env python3
"""
Asset audit — the ground truth on what's wrong with our question assets.

For every question across K-4 it checks two things:
  1. LINK HEALTH   — does each asset URL (image, question audio, hint audio,
                     feedback audio, passage audio) actually return 200?
  2. CONTENT NEED  — does the question TEXT reference a picture while having
                     no image? (the "look at the picture" → blank bug)

Writes a categorized JSON report to scripts/asset-audit-report.json and prints
a summary. Read-only: HEAD requests only, no writes to Supabase.
"""
import json, glob, re, sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

FILES = sorted(glob.glob("app/data/*standards-questions.json"))
PIC_RE = re.compile(r"\b(picture|photo|illustration|drawing|the image|look at the pic)\b", re.I)
ASSET_FIELDS = [
    "image_url", "audio_url", "hint_audio_url",
    "correct_feedback_audio_url", "incorrect_feedback_audio_url",
    "reveal_feedback_audio_url", "passage_audio_url",
]

def all_questions(node, grade):
    out = []
    if isinstance(node, dict):
        if isinstance(node.get("questions"), list):
            for q in node["questions"]:
                if isinstance(q, dict):
                    out.append((grade, q))
        for v in node.values():
            out += all_questions(v, grade)
    elif isinstance(node, list):
        for v in node:
            out += all_questions(v, grade)
    return out

def head(url):
    """Return HTTP status (int) or a string error label."""
    try:
        req = Request(url, method="HEAD")
        with urlopen(req, timeout=20) as r:
            return r.status
    except HTTPError as e:
        return e.code
    except (URLError, Exception) as e:  # noqa
        return f"ERR:{type(e).__name__}"

def main():
    questions = []
    for f in FILES:
        grade = f.split("/")[-1].replace("-standards-questions.json", "")
        questions += all_questions(json.load(open(f)), grade)

    # Collect unique URLs to check, remembering where each came from.
    url_refs = defaultdict(list)  # url -> [(grade, qid, field)]
    for grade, q in questions:
        qid = q.get("id", "?")
        for fld in ASSET_FIELDS:
            u = q.get(fld)
            if u:
                url_refs[u].append((grade, qid, fld))

    urls = list(url_refs)
    print(f"Questions: {len(questions)} | unique asset URLs to check: {len(urls)}", file=sys.stderr)

    status = {}
    with ThreadPoolExecutor(max_workers=32) as ex:
        for i, (u, st) in enumerate(zip(urls, ex.map(head, urls))):
            status[u] = st
            if (i + 1) % 250 == 0:
                print(f"  checked {i+1}/{len(urls)}", file=sys.stderr)

    # ── categorize ──
    dead_by_field = defaultdict(list)   # field -> [(grade,qid,url,status)]
    for u, refs in url_refs.items():
        st = status[u]
        if st != 200:
            for grade, qid, fld in refs:
                dead_by_field[fld].append((grade, qid, u, st))

    # prompt references a picture but no image
    pic_no_img = defaultdict(list)
    # prompt references a picture, HAS image but the image URL is dead
    pic_dead_img = defaultdict(list)
    for grade, q in questions:
        qid = q.get("id", "?")
        txt = " ".join(str(q.get(k, "")) for k in ("prompt", "hint", "passage"))
        if PIC_RE.search(txt):
            iu = q.get("image_url")
            if not iu:
                pic_no_img[grade].append(qid)
            elif status.get(iu) != 200:
                pic_dead_img[grade].append((qid, status.get(iu)))

    report = {
        "totals": {
            "questions": len(questions),
            "unique_urls_checked": len(urls),
            "dead_urls": sum(1 for u in urls if status[u] != 200),
        },
        "dead_by_field": {k: v for k, v in dead_by_field.items()},
        "pic_referenced_no_image": {k: v for k, v in pic_no_img.items()},
        "pic_referenced_dead_image": {k: v for k, v in pic_dead_img.items()},
    }
    json.dump(report, open("scripts/asset-audit-report.json", "w"), indent=2)

    # ── summary ──
    print("\n================ ASSET AUDIT ================")
    print(f"Questions checked : {len(questions)}")
    print(f"Unique URLs       : {len(urls)}")
    print(f"DEAD URLs (non-200): {report['totals']['dead_urls']}")
    print("\nDead links by asset field:")
    for fld in ASSET_FIELDS:
        rows = dead_by_field.get(fld, [])
        if rows:
            codes = defaultdict(int)
            for *_, st in rows:
                codes[st] += 1
            print(f"  {fld:32} {len(rows):>4}  {dict(codes)}")
    tot_pic_noimg = sum(len(v) for v in pic_no_img.values())
    tot_pic_dead = sum(len(v) for v in pic_dead_img.values())
    print(f"\nText references a picture but NO image : {tot_pic_noimg}")
    print(f"Text references a picture, image is DEAD: {tot_pic_dead}")
    print("\nReport: scripts/asset-audit-report.json")

if __name__ == "__main__":
    main()
