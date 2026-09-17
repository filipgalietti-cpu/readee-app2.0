/** Founder-approved September 14, 2026. These identities are separate from legacy domain groups. */
export const UNIT_VERSION = "k1-2026-09-14";
export const UNIT_ONE = [
  { id: "rhyme-time", standard: "RF.K.2a", title: "Rory’s Rhyme Workshop" },
  { id: "key-details", standard: "RL.K.1", title: "Pip’s Tree" },
  { id: "syllable-beats", standard: "RF.K.2b", title: "Beat Buddy’s Music Clearing" },
  { id: "book-makers", standard: "RL.K.6", title: "Little Book Workshop" },
  { id: "letter-pairs", standard: "RF.K.1d", title: "Lantern Letter Garden" },
  { id: "book-basics", standard: "RF.K.1", title: "Wormy’s Word Trail" },
  { id: "story-kinds", standard: "RL.K.5", title: "The Book Explorer’s Shelf" },
  { id: "big-kid-words", standard: "K.L.6", title: "Squeaky’s Acorn Adventure" },
] as const;
export type ApprovedLessonId = (typeof UNIT_ONE)[number]["id"] | "k-unit-1-checkpoint";
export function approvedLesson(id: string) {
  return UNIT_ONE.find((l) => l.id === id);
}
export function approvedStandard(standard: string) {
  return UNIT_ONE.find((l) => l.standard === standard || approvedCoverage(l.id).includes(standard));
}
export function isApprovedId(id: string): id is ApprovedLessonId {
  return id === "k-unit-1-checkpoint" || !!approvedLesson(id);
}

/** Worm's authored objective covers RF.K.1a–c; its package identity is RF.K.1. */
export function approvedCoverage(id: string): readonly string[] {
  return id === "book-basics"
    ? ["RF.K.1a", "RF.K.1b", "RF.K.1c"]
    : UNIT_ONE.filter((l) => l.id === id).map((l) => l.standard);
}
