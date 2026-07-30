#!/usr/bin/env python3
"""
Re-check ONLY the URLs the first pass flagged non-200, politely (low
concurrency + exponential backoff on 429) so Supabase throttling doesn't
masquerade as missing assets. Merges results into a trustworthy verdict.
"""
import json, time, sys
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from collections import defaultdict

r = json.load(open("scripts/asset-audit-report.json"))
# collect unique non-200 urls + their refs
url_refs = defaultdict(list)
for fld, rows in r["dead_by_field"].items():
    for g, qid, u, st in rows:
        url_refs[u].append((g, qid, fld, st))
urls = list(url_refs)
print(f"Re-checking {len(urls)} previously-non-200 URLs with backoff...", file=sys.stderr)

def head_polite(url):
    if not url.startswith("http"):
        return "MALFORMED"   # relative path, can never load
    for attempt in range(6):
        try:
            with urlopen(Request(url, method="HEAD"), timeout=25) as resp:
                return resp.status
        except HTTPError as e:
            if e.code == 429:
                time.sleep(1.5 * (attempt + 1))  # linear backoff
                continue
            return e.code
        except (URLError, Exception) as e:  # noqa
            return f"ERR:{type(e).__name__}"
    return 429  # still throttled after retries

status = {}
with ThreadPoolExecutor(max_workers=6) as ex:
    for i, (u, st) in enumerate(zip(urls, ex.map(head_polite, urls))):
        status[u] = st
        if (i + 1) % 200 == 0:
            print(f"  rechecked {i+1}/{len(urls)}", file=sys.stderr)

# true verdict
truly_dead = defaultdict(list)
for u, refs in url_refs.items():
    st = status[u]
    if st != 200:
        for g, qid, fld, _ in refs:
            truly_dead[fld].append((g, qid, u, st))

out = {"truly_dead_by_field": {k: v for k, v in truly_dead.items()}}
json.dump(out, open("scripts/asset-audit-truedead.json", "w"), indent=2)

print("\n========= TRUE DEAD ASSETS (after backoff) =========")
grand = 0
for fld, rows in sorted(truly_dead.items(), key=lambda x: -len(x[1])):
    codes = defaultdict(int)
    for *_, st in rows:
        codes[st] += 1
    grand += len(rows)
    print(f"  {fld:32} {len(rows):>4}  {dict(codes)}")
print(f"\n  TOTAL truly-dead asset references: {grand}")
# how many were false alarms (429 that resolved to 200)
resolved = sum(1 for u in urls if status[u] == 200)
print(f"  False alarms (429 → actually 200): {resolved} of {len(urls)} rechecked")
print("\nReport: scripts/asset-audit-truedead.json")
