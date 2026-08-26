# Readee — Security & Scale Plan

_How data protection adapts from first users → 100k. We handle **children's data**, so this is
a product requirement, not a nice-to-have. Companion to `supabase/migrations/119_security_hardening.sql`._

## Guiding rules (always)
- **Never enable RLS on a table without a policy in the same migration.** Run `get_advisors(security)`
  after every migration that touches schema.
- **`service_role` key stays server-side only.** Never in a client bundle or `NEXT_PUBLIC_*`.
- **Every `SECURITY DEFINER` function must do its own auth check** (`auth.uid()` / owner check) —
  it bypasses RLS by design.
- **Child-generated content is private by default** (esp. Luna voice recordings — treat as sensitive/biometric-adjacent).

---

## ~1,000 users (now → next few weeks) — "close the obvious doors"
Traffic is low; the risk is *misconfiguration*, not load.
- [ ] Apply `119_security_hardening.sql` (search_path pins + drop needless `anon` grants).
- [ ] Enable **leaked-password protection** (Auth dashboard toggle).
- [ ] Enable **Point-in-Time Recovery / daily backups** — recoverability before real data accumulates.
- [ ] Make **Luna voice recordings private** (signed URLs, not public bucket) + set a retention window.
- [ ] Confirm `service_role` is server-only; audit for any leaked keys.
- [ ] Add `get_advisors` to the release checklist.

## ~10,000 users — "stop abuse & escalation"
Now there's enough traffic that abuse and cost become real.
- [ ] **Rate-limit expensive / AI endpoints** (TTS, image-gen, `match_content_embeddings`, grading).
      Per-user + per-IP caps. The `content_production_caps` table already hints at this — wire it through.
- [ ] **Cost guards** on all AI calls (hard daily ceilings per account) — a single abusive user shouldn't run up the bill.
- [ ] **Connection pooling everywhere** — use the Supabase pooler (Supavisor, *transaction* mode) in all
      serverless routes; direct connections exhaust under concurrency.
- [ ] **Audit every `SECURITY DEFINER` function** for an internal auth check (the Section-C "VERIFY" items).
- [ ] **MFA on owner/admin accounts** — the `/owner` dashboard sees everything; a compromised admin = full breach.
- [ ] **COPPA data-deletion flow** — parents can delete a child's data on request (legal requirement).
- [ ] Turn on **Vercel BotID** for signup/auth endpoints (bot signups + credential stuffing).

## ~100,000 users — "assume you're a target"
At this scale you're worth attacking and you're under real regulatory scrutiny.
- [ ] **Audit logging on all child-data access** (who read/wrote what) — retained + queryable.
- [ ] **Field-level encryption** for the most sensitive child PII (names/DOB) beyond at-rest disk encryption.
- [ ] **Key rotation policy** (service_role, Stripe, Azure, Gemini) on a schedule + on any suspected leak.
- [ ] **Separate analytics/read load** — read replica or a dedicated analytics store so reporting queries
      don't contend with the app; keep PII out of the analytics copy.
- [ ] **Formal 3rd-party pen-test** + move toward SOC 2 (schools/districts will ask; investors will ask).
- [ ] **Incident response plan** — breach notification path (COPPA/state law), on-call, and a status page.
- [ ] **WAF / DDoS** in front of the app (Vercel provides baseline; formalize).

---

## The one principle that scales all of it
RLS + per-function auth checks are the wall. As users grow, **one missing policy or one over-permissioned
`SECURITY DEFINER` function is a mass breach, not a single-user bug.** So the highest-leverage habit is the
boring one: `get_advisors` after every schema change, and treat every warning as a to-do, not noise.
