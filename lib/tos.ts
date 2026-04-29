/**
 * Bump this whenever the live /terms-of-service page changes
 * materially. TosGate re-prompts every user whose accepted version
 * differs from this constant, so they explicitly consent to the
 * new copy before continuing.
 *
 * v2.0 (Apr 29 2026): added AI-content allocation, FERPA/COPPA
 * school-exception language, DMCA reference, indemnification,
 * subprocessor list, NJ choice of law + class waiver, all the
 * tiers, and the modern SaaS clauses. See docs/TOS_DRAFT_v2.md
 * for the lawyer-review notes.
 */
export const CURRENT_TOS_VERSION = "v2.0";
