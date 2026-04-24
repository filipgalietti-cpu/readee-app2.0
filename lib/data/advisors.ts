/**
 * Readee advisory board — shared data source for /about and /schools.
 *
 * Populate each slot when a real advisor signs on. Until then, the
 * slots are hidden from the UI via the `status` flag.
 *
 * Targets we want in the first three seats:
 *   - A sitting or recently retired superintendent or curriculum
 *     director — opens district doors
 *   - A certified reading specialist in addition to Jennifer (e.g. a
 *     Science of Reading academic or Orton-Gillingham practitioner)
 *   - A parent-facing voice: a well-known homeschool educator, a
 *     reading tutor, or a pediatric speech-language pathologist
 */

export type Advisor = {
  name: string;
  role: string;
  org?: string;
  bio: string;
  status: "confirmed" | "in_discussion" | "placeholder";
  headshotUrl?: string;
};

export const ADVISORY_BOARD: Advisor[] = [
  {
    name: "Seat 1 — Superintendent / Curriculum Director",
    role: "Founding advisor",
    bio: "We're in conversations with district leaders about this seat. If you'd be a fit, reach out at hello@readee.app.",
    status: "placeholder",
  },
  {
    name: "Seat 2 — Reading researcher",
    role: "Founding advisor",
    bio: "Reserved for a Science of Reading researcher or Orton-Gillingham practitioner to keep our content honest to evidence-based methodology.",
    status: "placeholder",
  },
  {
    name: "Seat 3 — Home reading expert",
    role: "Founding advisor",
    bio: "Reserved for a voice representing homeschool families, reading tutors, or pediatric language specialists — the people who meet kids where they are.",
    status: "placeholder",
  },
];

export const CONFIRMED_ADVISORS = ADVISORY_BOARD.filter((a) => a.status === "confirmed");
export const ANY_PUBLIC_ADVISORS = ADVISORY_BOARD.some(
  (a) => a.status === "confirmed" || a.status === "in_discussion",
);
