# Claude Design brief — Settings & Account (`/settings` + `/account`)

Paste the block below into Claude Design. Grounded in the real model: one
parent manages ONE child's account — the child's profile (name, avatar),
the Readee+ plan status (`profiles.plan` = free/premium via Stripe), and
account preferences (notifications, privacy, sign out).

```
Redesign the parent SETTINGS & ACCOUNT area for Readee, a K-4 kids' reading
app — the grown-up control panel where a parent manages their child's
account, their subscription, and their own preferences. This is a calm,
trustworthy admin surface, not a kid game screen — but still warm, friendly,
and credibly built-by-educators.

WHO IT'S FOR
A parent (of ONE child), on a laptop or tablet, checking in between the
child's sessions. Wants to feel in control and reassured their family's data
is handled well. One child per account — never show child pickers or a
"manage children" list.

SCREEN ANATOMY (clear sections, scannable, not a dense form)
- A calm page header ("Settings" / the parent's name or email) with the
  Readee bunny appearing lightly, restrained.
- THE CHILD CARD (hero of the page): the child's avatar, name, grade/reading
  level, and a quiet "Edit" to change name or open the avatar customizer.
  This is the emotional center — make it feel like their kid.
- PLAN & BILLING: current status shown plainly — "Readee+ active" (with
  renewal date) OR "Free plan" with what's included. A clear primary action:
  Manage subscription (premium) or Upgrade to Readee+ (free). Free users get
  a gentle, non-pushy nudge toward premium, never a hard sell.
- PREFERENCES: notifications (email updates, progress reports), a privacy /
  data section (view privacy policy, terms, manage data), and language/
  region if present. Group into tidy labeled cards, one setting per row with
  a clear control (toggle, link, or button).
- ACCOUNT: email, change password, and a clearly separated Sign out. A
  destructive "Delete account" lives at the very bottom, understated.

KEY INTERACTIONS
- Toggles flip with a soft Framer-Motion-style motion + a confirming toast.
- "Edit" on the child card opens name edit / the avatar customizer inline or
  in a calm modal.
- Manage subscription routes to Stripe's portal; Upgrade routes to /upgrade.
- Sign out and Delete account both confirm before acting — Delete is a
  clearly heavier, guarded action.
- Every save shows a small success toast; every control has a resting,
  hover, and disabled state.

VISUAL SYSTEM (match the redesigned app — this is not a rebrand)
- Fonts: Baloo 2 for section headers, Nunito for body/labels.
- Palette: indigo/violet (#4338ca → #7c3aed), gold accents for the carrots/
  premium touches, soft pastel and white surfaces. More restraint and white
  space than the kid screens — this reads grown-up and calm.
- Rounded cards, ONE consistent shadow depth, subtle purposeful motion. The
  bunny mascot may appear lightly in the header or an empty state only.
- Trustworthy and clean — a parent should feel this company is careful.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons only.
- NO plain black text on colored surfaces (body text on cards = zinc-800 on
  a pale violet/white surface).
- B2C — ONE child per account; never teacher/classroom/multi-child pickers.
- Desktop AND tablet layouts (design both) — cards stack cleanly on tablet.

DELIVERABLE
A polished, responsive parent settings area: the child card, a plan/billing
card with a clear manage/upgrade action, grouped preference cards
(notifications, privacy, account), and a guarded sign-out/delete zone. Show
two states: a FREE parent (upgrade nudge visible) and a READEE+ parent
(active plan with renewal date and Manage subscription).
```
