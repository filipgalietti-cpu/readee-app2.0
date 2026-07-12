# Claude Design brief — Homework scanner (`/dashboard/homework-scan`)

Paste the block below into Claude Design. Grounded in the real feature: a
parent photographs/uploads the child's homework worksheet, Readee's vision
AI reads it, and offers help — an explanation the parent can use, or turns
it into matching practice for the child.

```
Redesign the HOMEWORK SCANNER for Readee, a K-4 kids' reading app — the
parent snaps or uploads a photo of their child's homework worksheet and
Readee reads it (vision AI) and offers help. Two moments: the SCAN/UPLOAD
flow, and the RESULTS/HELP view. Calm, reassuring, capable — a parent tool
built by educators, not a kid game screen.

WHO IT'S FOR
A parent (of ONE child) stuck at the kitchen table with a worksheet they're
not sure how to explain. On laptop or tablet (tablet camera matters — this
is often used live during homework). One child per account — never child
pickers.

SCREEN ANATOMY (flow: capture → reading → help)
- THE CAPTURE STATE (hero): a big, obvious dropzone / camera target —
  "Take a photo of the homework" — with two clear paths: use camera or
  upload a file. Friendly guidance ("Lay the worksheet flat, good light")
  and the bunny appearing lightly. Show recent scans as small thumbnails
  if any exist.
- A PREVIEW/CONFIRM step: the captured image with a "Looks good — read it"
  primary action and a "Retake" option. Simple crop/rotate if easy.
- THE READING STATE: a warm, confident processing moment (the image with a
  gentle scan-line/shimmer + bunny "reading"), reassuring microcopy
  ("Reading [child]'s worksheet..."). Skeleton, never a bare spinner.
- THE RESULTS / HELP VIEW (the payoff): what Readee found, in plain
  parent-friendly language:
  · A recognized summary of the worksheet (topic/skill, e.g. "Short-vowel
    word sorting").
  · HELP FOR THE PARENT — a clear, step-by-step explanation of how to guide
    the child (how to think about it, not just the answer), voiced/warm.
  · A "Turn this into practice for [child]" primary CTA — generates a
    matching practice set the child can do in Readee.
  · Per-item help where the worksheet has multiple questions, each openable.
  Keep it skimmable — a parent reads this mid-homework.

KEY INTERACTIONS
- Camera/upload with clear permission + error handling (blurry photo, no
  text found → a kind retry, never a dead end).
- Smooth Framer-Motion-style transitions capture → reading → results.
- "Turn into practice" deep-links into a generated practice session for the
  child; results can be saved to a light history of past scans.
- An EMPTY state for a first-time parent (bunny + "Scan your first
  worksheet") — never a dashed-grey box. Explicit error state on failed
  reads.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 for headers, Nunito for body/help text.
- Palette: indigo/violet (#4338ca → #7c3aed), gold accents, soft pastel +
  white surfaces. The scan/reading moment can carry a subtle violet scan-
  line/shimmer — tasteful, grown-up, reassuring (this is "AI reading your
  homework," and it should feel trustworthy, not gimmicky).
- Rounded cards, ONE consistent shadow depth, purposeful motion. Bunny
  appears lightly (capture header, reading state, empty state).
- Capable and calm — a parent should trust the read and feel helped, fast.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons only.
- NO plain black text on colored surfaces (help text = zinc-800 on pale
  surfaces).
- B2C — ONE child per account; never teacher/classroom/multi-child pickers.
- Desktop AND tablet layouts (design both) — the camera-first flow must feel
  natural on a tablet held over a worksheet.

DELIVERABLE
A polished, responsive homework scanner: the capture/upload hero, the
preview-confirm step, the reading/processing state, and the results-and-help
view with a plain-language explanation and a "turn into practice" CTA. Show
three states: the empty first-time capture screen, the reading-in-progress
state, and a completed results view with parent help + the practice CTA.
```
