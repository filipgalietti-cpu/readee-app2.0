# Claude Design brief — Readee+ upgrade / paywall (`/upgrade`)

Paste the block below into Claude Design. Grounded in the real page: Readee+
is $9.99/mo (or $6.99/mo billed annually), 7-day free trial, a monthly/
annual toggle, a benefits list, a co-founder trust signal, and contextual
hero copy driven by `?reason=` (analytics / lesson / story / practice).

```
Redesign the READEE+ UPGRADE page for Readee, a K-4 kids' reading app — the
paywall a parent reaches when they hit a premium feature. It must feel warm,
honest, and convincing WITHOUT being sleazy — a parent investing in their
kid's reading, reassured by real educators. Calm confidence, not urgency
tricks.

WHO IT'S FOR
A parent (of ONE child) who just bumped into a locked feature and is
deciding whether Readee+ is worth it. On laptop or tablet. One child per
account — never child pickers.

SCREEN ANATOMY
- A CONTEXTUAL HERO that adapts to why they arrived (the ?reason= param):
  · analytics → "See exactly how [child] is progressing."
  · lesson → "Unlock every lesson on [child]'s reading path."
  · story → "Open the full library of decodable stories."
  · practice → "Unlimited practice, tuned to [child]."
  · default → a broad "Unlock all of Readee for [child]."
  Warm, specific, benefit-led headline + one supporting line + the bunny
  appearing lightly. Design the hero so this line clearly swaps per reason.
- The PLAN CARD with a MONTHLY / ANNUAL toggle:
  · Monthly $9.99/mo. Annual $6.99/mo (billed annually) — badge the annual
    option "Best value / Save 30%".
  · A clear "Start 7-day free trial" primary CTA, and honest fine print
    ("Then $X. Cancel anytime.") — no dark patterns.
- A BENEFITS list — what Readee+ unlocks, plain and concrete: every lesson,
  full stories library, unlimited practice, the parent progress dashboard,
  AI-generated custom content, homework help. Each with a Lucide icon; the
  benefit tied to the arrival reason gently highlighted.
- A TRUST SIGNAL from co-founder Jennifer Klingerman — a certified reading
  specialist and 3rd-grade teacher. Her photo/portrait, name, credentials,
  and a short warm quote about why Readee is built the way it is. This is
  the credibility anchor — give it real, tasteful space.
- Light reassurance near the CTA: cancel anytime, secure Stripe checkout,
  built by educators. A quiet FAQ (2-4 items) can sit below.

KEY INTERACTIONS
- Monthly/annual toggle flips price + fine print with a smooth Framer-
  Motion-style transition; annual pre-selected as best value.
- Primary CTA routes to Stripe checkout for the chosen interval.
- A promo-code entry (collapsed link "Have a code?" that expands).
- A clear, low-friction way to dismiss/return without feeling trapped.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 for the hero + price, Nunito for body/benefits.
- Palette: indigo/violet (#4338ca → #7c3aed) as the premium hero, gold as
  the Readee+ accent (carrot-gold "plus" energy), soft pastel + white
  surfaces. Feels premium and calm, not loud.
- Rounded cards, ONE consistent shadow depth, subtle motion. The bunny
  appears lightly — a friendly nudge, not a sales cartoon.
- Warm, honest, credibly educational. Trustworthy over flashy.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons only.
- NO plain black text on colored surfaces (body = zinc-800 on pale
  surfaces; no black on the violet hero).
- B2C — ONE child per account; never teacher/classroom/multi-child pickers.
- Desktop AND tablet layouts (design both) — plan card and benefits stack
  cleanly on tablet.

DELIVERABLE
A polished, responsive upgrade page: the contextual hero, the plan card with
monthly/annual toggle + 7-day-trial CTA + honest fine print, the benefits
list, and Jennifer's educator trust signal. Show two states: the "analytics"
reason hero, and the annual-toggle selected showing $6.99/mo best-value
framing.
```
