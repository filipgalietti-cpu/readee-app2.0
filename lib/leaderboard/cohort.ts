/**
 * Grade-cohort leaderboard roster.
 *
 * B2C reality: 1 parent : 1 child, and pre-launch there are ~no other users,
 * so ranking a kid against "other kids" would be a podium of one. We also
 * can't show other real children's names/carrots (COPPA / privacy). So we
 * seed a stable set of rivals shown BY FIRST NAME (fictional kids, NOT real
 * users) with fixed carrot totals, and let the child climb the ladder by their
 * REAL carrot count — real effort moves them up a consistent board.
 * Deterministic per child (seeded by child id) so standings don't reshuffle.
 *
 * When there's a real userbase this can fold in anonymized same-grade peers by
 * first name.
 */

// First-name pool for the rivals — a friendly, diverse set so the board reads
// like a roomful of readers rather than cartoon animals.
const RIVAL_NAMES = [
  "Mia",
  "Liam",
  "Ava",
  "Noah",
  "Sofia",
  "Ethan",
  "Isla",
  "Mateo",
  "Zoe",
  "Kai",
  "Amara",
  "Leo",
  "Nina",
  "Aiden",
  "Priya",
  "Diego",
  "Ruby",
  "Omar",
  "Ella",
  "Jonah",
];

export interface CohortEntry {
  id: string;
  name: string;
  carrots: number;
  isMe: boolean;
}

/** FNV-1a — stable string hash for seeding (deterministic across requests). */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — seeded so a given child always gets the same rivals. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RIVAL_COUNT = 8;
// Stable ladder rungs bracketing a typical K-4 carrot range so a moderately
// active reader lands mid-pack with a rabbit to chase and one on their heels.
const RUNGS = [90, 180, 320, 500, 720, 1000, 1350, 1750];

export function buildCohort(
  childId: string,
  childName: string,
  childCarrots: number,
): { leaders: CohortEntry[]; myRank: number } {
  const rand = mulberry32(hashStr(childId));

  // Stable Fisher-Yates shuffle of the name pool → pick RIVAL_COUNT rivals.
  // Drop the child's own first name so the board never shows two of them.
  const mine = childName.trim().toLowerCase();
  const names = RIVAL_NAMES.filter((n) => n.toLowerCase() !== mine);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  const rivals: CohortEntry[] = names.slice(0, RIVAL_COUNT).map((name, i) => {
    const jitter = Math.floor((rand() - 0.5) * 80); // ±40
    return { id: `rival-${i}`, name, carrots: Math.max(20, RUNGS[i] + jitter), isMe: false };
  });

  const me: CohortEntry = {
    id: childId,
    name: childName,
    carrots: Math.max(0, Math.round(childCarrots)),
    isMe: true,
  };

  const all = [...rivals, me].sort((a, b) => b.carrots - a.carrots);

  // Feels-good clamps: never strand the kid alone at the very top or bottom.
  const myIdx = all.findIndex((e) => e.isMe);
  if (all.length > 1 && myIdx === 0) {
    // Kid is #1 → raise the runner-up just above so there's a target.
    all[1].carrots = me.carrots + 20 + Math.floor(rand() * 100);
  } else if (all.length > 1 && myIdx === all.length - 1 && me.carrots > 25) {
    // Kid is last → drop the next-lowest just below so they're not rock-bottom.
    all[all.length - 2].carrots = Math.max(5, me.carrots - (10 + Math.floor(rand() * 40)));
  }
  all.sort((a, b) => b.carrots - a.carrots);

  const myRank = all.findIndex((e) => e.isMe) + 1;
  return { leaders: all, myRank };
}
