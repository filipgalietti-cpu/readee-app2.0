# Launch legal checklist

Filip's posture (locked Apr 29 2026): **gray-area is fine; have all
legal infrastructure in place before opening signups.** That means
permissive content policy, but registered DMCA, clear TOS, and a
takedown process so when a complaint arrives, we already have the
machinery to respond.

This doc is the punch list of what needs to be true before public
launch. Tick items as they're done.

## 1. DMCA safe harbor

Without registration, Section 512 doesn't protect Readee. With it,
takedown-and-comply is a complete defense for hosted infringement.

- [ ] **Register a DMCA agent** at <https://dmca.copyright.gov/>.
  - Cost: $6, takes ~5 minutes.
  - Use: `Readee Learning LLC` / `81 Culver Street, Somerset, NJ 08873`
    / `hello@readee.app`.
  - After registration, copy the registration number into the
    `/copyright` page footer (we'll wire this once you have it).
- [x] **Public takedown landing page** at `/copyright` (shipped, see
      `app/copyright/page.tsx`).
- [x] **Repeat-infringer policy** — drafted in the page above; two
      strikes = warning, three = account termination.
- [ ] **Takedown intake.** `hello@readee.app` already forwards.
      Establish an SLA (24h to acknowledge, 72h to remove valid claims).

## 2. Terms of Service

Existing TOS predates the AI features. Needs to be updated so the
teacher / parent / student carries primary responsibility for the
prompts they submit and the content their prompts generate.

Required clauses (have a real lawyer review before going live):

- [ ] **AI-content allocation.** Users own their prompts; output is
      provided "as-is"; users warrant they have the right to publish
      what they generate; users will indemnify Readee for third-party
      claims arising from their prompts.
- [ ] **Acceptable Use.** No copyright infringement, no defamation,
      no harassment, no scraping the platform, no using AI features
      to generate content for non-Readee redistribution.
- [ ] **Repeat-infringer policy** referenced (already in `/copyright`).
- [ ] **DMCA agent reference** linking to `/copyright`.
- [ ] **Children's content + COPPA acknowledgment.** Parent consent
      flow + how we handle data of users under 13.
- [ ] **Limitation of liability.** Readee not liable for AI-generated
      content reaching the public via teacher/parent prompts.
- [ ] **Indemnification by user** for their prompts.
- [ ] **Choice of law + venue** (probably NJ, where the LLC is
      registered, unless lawyer recommends Delaware).
- [ ] **Governing law for AI training-data disputes.** Standard
      "no warranty" disclaimer covers most of it.

## 3. Privacy + COPPA

- [x] Privacy Policy page exists (`app/privacy-policy/page.tsx`).
- [ ] **COPPA review.** Children under 13 → school consent (Title
      VI/Title I districts handle this) or verifiable parent consent
      for direct-to-parent signups.
- [ ] **Privacy Pledge** (Future of Privacy Forum) — districts ask
      for this. Free to sign, takes 1-2 hours. Registered at
      <https://studentprivacypledge.org/>.
- [ ] **California CCPA + Texas data privacy disclosure** if we
      take customers there. CCPA: "Do Not Sell" link in the footer.

## 4. Trademark + brand

- [ ] **Readee® application.** USPTO trademark for "Readee" word
      mark in the EdTech class. Self-file ($350) or attorney-file
      ($1500). Doesn't have to be granted before launch but should
      be FILED before launch so the priority date locks.
- [ ] **Domain confirmation.** `readee.app` + `learn.readee.app`
      registered, verified.

## 5. Operational legal

- [ ] **Insurance.** General liability + tech E&O. CyberPolicy or
      Vouch are common SaaS picks. Budget ~$1K-2K/year for the
      starter coverage.
- [ ] **Incorporation paperwork on file.** Readee Learning LLC
      operating agreement, EIN, NJ tax registration. (Confirmed
      done per Apr 14 session memory; verify with your CPA.)
- [ ] **Stripe terms accepted** (when wiring up the SKUs at launch).

## 6. Content moderation infrastructure

- [x] **Daily question safety preamble.** Permissive but bounded
      (`lib/daily/build-daily.ts`). Allows current events, public
      figures, nominative IP reference. Forbids graphic violence,
      sexual content, on-page death, addiction, harassment.
- [ ] **Per-user takedown audit log.** Two-strikes counter on
      `profiles` (e.g. `infringement_strikes int default 0`).
      Wire when DMCA agent is registered.
- [ ] **Sentry / observability rule** for any AI generation that
      produces a passage matching famous quoted material. Low
      priority; real defense is the takedown SLA.

## What I (Claude) have already shipped today

- `/copyright` page with DMCA notice, takedown procedure, and
  repeat-infringer policy.
- Daily-question safety preamble (lib/daily/build-daily.ts).
- Daily-question theme bank with hardened topics for
  controversial-day pivots.
- This checklist.

## What only Filip can do

1. **Register the DMCA agent** at dmca.copyright.gov ($6, 5 minutes).
2. **Get a lawyer to review the TOS clauses** above before opening
   public signups. Plan to spend $500-1500 on a one-shot review.
3. **Sign the Student Privacy Pledge** (free).
4. **Decide insurance coverage**.
5. **File the Readee® trademark application** with USPTO.

When 1-3 are done, send me the DMCA registration number and I'll
wire it into the `/copyright` page footer.
