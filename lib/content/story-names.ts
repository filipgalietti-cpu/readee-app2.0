/**
 * Who the invented children in our stories are called.
 *
 * REPRESENTATION_RULE already tells every generator to "draw names from a wide
 * pool". It shipped on 2026-09-05 and did not work, because asking a model to
 * choose returns the model's prior, not a choice. Measured on 2026-09-07 across
 * 134 dailies: Leo appeared on 10 days, Ben on 8, Mia on 9, and 31 of the 53
 * story dailies used one of just five names. The lesson catalog is the same
 * pipeline and the same result - Sam 83 mentions, Lily 54, Mia 40, Leo 39.
 *
 * This is the fix the daily catalogue already demonstrated for subjects: stop
 * asking, and hand the generator a name that has been chosen for it. The model
 * is good at writing a story about Amara. It is bad at deciding to.
 *
 * ‼️ These are for INVENTED characters only. Real people keep their real names,
 * always - see the last paragraph of REPRESENTATION_RULE.
 */

/**
 * The roster.
 *
 * Wide on purpose, and deliberately not a tour of the world: these are names
 * children in an American classroom actually have, which is the point. They sit
 * in the story without announcing anything. Anglo names stay in the pool - the
 * goal is that no child is always the default and no child is never present,
 * not that one set replaces another.
 *
 * Long enough that a reader does not meet the same child twice in a term. At
 * one story-daily every few days plus the lesson catalog, 96 names is roughly a
 * year before the pool wraps, and the recency filter spreads it further.
 */
export const STORY_NAMES: string[] = [
  // A-E
  "Amara", "Ana", "Arjun", "Asha", "Ayo", "Beatriz", "Bilal", "Caleb",
  "Camila", "Chidi", "Clara", "Dara", "Dev", "Diego", "Ella", "Emeka",
  "Esme", "Ezra",
  // F-J
  "Farrah", "Finn", "Gabriel", "Gemma", "Grace", "Hana", "Hassan", "Hugo",
  "Ines", "Iris", "Isabel", "Ivan", "Jamal", "Jonah", "Josie", "Juan",
  "Julia", "June",
  // K-O
  "Kiera", "Kofi", "Lena", "Lucia", "Luka", "Maeve", "Malik", "Marisol",
  "Mateo", "Maya", "Mila", "Mohammed", "Nadia", "Naomi", "Nina", "Noor",
  "Nora", "Omar", "Oscar", "Olga",
  // P-T
  "Pablo", "Pedro", "Priya", "Rafi", "Ravi", "Rosa", "Ruth", "Sadie",
  "Salma", "Santiago", "Sena", "Simone", "Sofia", "Tariq", "Theo", "Tomas",
  "Tunde", "Talia",
  // U-Z
  "Uma", "Vera", "Wei", "Wren", "Yara", "Yusuf", "Zara", "Zeke",
  // A few more, kept plain and easy to decode for K-1
  "Ada", "Ali", "Bo", "Cruz", "Dot", "Eli", "Gus", "Ida",
  "Jo", "Kai", "Lev", "Mae", "Nia", "Otto", "Rue", "Sol",
];

/** Names the generators reach for unprompted. Never handed out by the picker. */
export const OVERUSED_NAMES: string[] = [
  "Leo", "Mia", "Ben", "Sam", "Pip", "Lily", "Max", "Zoe", "Ava", "Emma",
  "Liam", "Noah", "Olivia", "Sophia", "Jack", "Lucy", "Tim", "Tom",
];

/** Stable per-key hash, so the same date always draws the same cast. */
function seedFor(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Pick `count` distinct names for one story.
 *
 * `recent` is whatever the last several stories used; those names drop out of
 * the running entirely, which is what stops the clustering the model produced
 * on its own. If avoidance would empty the pool the filter is dropped rather
 * than returning nothing - a repeated name is a much smaller failure than a
 * story with no characters.
 */
export function pickStoryNames(
  key: string,
  count = 2,
  recent: string[] = [],
): string[] {
  const avoid = new Set(recent.map((n) => n.toLowerCase()));
  let pool = STORY_NAMES.filter((n) => !avoid.has(n.toLowerCase()));
  if (pool.length < count) pool = STORY_NAMES.slice();

  const picked: string[] = [];
  const taken = new Set<number>();
  for (let i = 0; picked.length < Math.min(count, pool.length); i++) {
    // Re-hash per slot so the second name is not adjacent to the first.
    let idx = seedFor(`${key}:name:${i}`) % pool.length;
    let guard = 0;
    while (taken.has(idx) && guard++ < pool.length) idx = (idx + 1) % pool.length;
    taken.add(idx);
    picked.push(pool[idx]);
  }
  return picked;
}

/**
 * The instruction handed to the passage generator.
 *
 * Names the cast outright and closes the escape hatch: told only what to avoid,
 * the model swaps Leo for Max and calls it variety.
 */
export function storyNameDirective(names: string[]): string {
  if (names.length === 0) return "";
  const cast =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return [
    `CHARACTER NAMES (invented characters only - real people always keep their real names)`,
    `Name the character${names.length > 1 ? "s" : ""} in this story ${cast}. Use ${
      names.length > 1 ? "these exact names" : "this exact name"
    }, not a substitute you prefer.`,
    `Do not remark on the name${names.length > 1 ? "s" : ""} or on anyone's background. The name is just the child's name.`,
    `Never use: ${OVERUSED_NAMES.join(", ")}. Every generator reaches for those and our catalog is already full of them.`,
  ].join("\n");
}
