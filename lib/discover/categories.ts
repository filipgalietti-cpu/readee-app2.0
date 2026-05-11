/**
 * Discovery library categories.
 *
 * The 7 buckets parents and kids browse on /discover/[category].
 * Set is intentionally small + non-controversial so the generator
 * doesn't drift into politics, tragedy, or current affairs that
 * need editorial review.
 *
 * Each category carries a passage-prompt guidance block that pins
 * the model's topic surface and tone. Add new categories via the
 * database constraint migration FIRST, then extend this map.
 */

export type DiscoveryCategory =
  | "science"
  | "history"
  | "nature"
  | "inventions"
  | "sports"
  | "stories"
  | "math_in_real_life";

export type CategoryConfig = {
  slug: DiscoveryCategory;
  label: string;
  /** One-liner shown on the /discover index card. */
  blurb: string;
  /** Pinned topic surface — bullet list the model picks from. */
  topicGuidance: string;
  /** Tone + framing rules layered onto the passage prompt. */
  toneGuidance: string;
  /** When true, the generator runs the fact-check judge eagerly
   *  (i.e. attempts to detect a named figure even if the passage
   *  doesn't obviously mention one). Categories where most pieces
   *  reference named entities benefit. */
  preferFactCheck: boolean;
};

export const CATEGORIES: Record<DiscoveryCategory, CategoryConfig> = {
  science: {
    slug: "science",
    label: "Science",
    blurb: "How the world works — animals, space, the body, and more.",
    topicGuidance: [
      "Pick ONE concrete science topic kids find fascinating:",
      "- Animal facts (camouflage, migration, how an animal eats)",
      "- Space (planets, moons, how stars form, simple astronomy)",
      "- The human body (how we hear, how blood works, why we sneeze)",
      "- Weather (clouds, rainbows, where wind comes from, lightning)",
      "- Simple physics (why ice floats, how magnets work, sound)",
      "- Plants (photosynthesis basics, how seeds travel, why leaves change color)",
      "Stick to facts that are uncontroversial and widely documented.",
    ].join("\n"),
    toneGuidance:
      "Curious + concrete. Lead with a vivid scene or surprising fact. Avoid jargon — if a word like 'photosynthesis' is needed, define it the first time. Never speculate beyond what's well established.",
    preferFactCheck: false,
  },
  history: {
    slug: "history",
    label: "History",
    blurb: "Real people, real moments, real things that happened.",
    topicGuidance: [
      "Pick ONE historical topic with a clear teachable point:",
      "- A historical figure (PREFER long-dead figures with Wikipedia portraits — Lincoln, Sacagawea, MLK, Cleopatra, da Vinci)",
      "- An event with a clear before/after (moon landing, building of the pyramids, invention of writing)",
      "- A 'how did people do this' question (how did Romans build roads; what did kids do in colonial times)",
      "Avoid: current politics, modern living figures, recent tragedies, war specifics for under-3rd-grade audiences.",
    ].join("\n"),
    toneGuidance:
      "Honest but age-appropriate. Name what happened without sensationalizing. For sensitive topics (slavery, war, displacement) frame around resilience + what changed, not graphic detail. Cite a date when known.",
    preferFactCheck: true,
  },
  nature: {
    slug: "nature",
    label: "Nature",
    blurb: "Earth's wild places, weather, and creatures.",
    topicGuidance: [
      "Pick ONE nature / ecology topic:",
      "- A specific habitat (coral reef, prairie, rainforest canopy, tide pool)",
      "- An ecosystem relationship (food chains, pollinators, decomposers)",
      "- Seasonal changes in a specific place",
      "- A specific animal in its natural setting (not zoo behavior)",
      "- Geographic features (rivers, mountains, deserts)",
      "Stay descriptive and observational — kids should feel they're seeing the place.",
    ].join("\n"),
    toneGuidance:
      "Visual + concrete. Use sensory language (what the kid would see, hear, smell). Avoid environmental advocacy framing for K-2; for 3-4 it's OK to mention stewardship factually.",
    preferFactCheck: false,
  },
  inventions: {
    slug: "inventions",
    label: "Inventions",
    blurb: "Smart ideas that changed how people live.",
    topicGuidance: [
      "Pick ONE invention or inventor:",
      "- Long-established inventions (the wheel, printing press, telephone, lightbulb, airplane, vaccines)",
      "- The story of an inventor whose work is well-documented",
      "- 'How does a [common object] work' — explain a thing the kid already sees daily",
      "Avoid: still-evolving tech, controversial attributions, founder-vs-founder disputes.",
    ].join("\n"),
    toneGuidance:
      "Problem → idea → impact. Lead with the problem the invention solved. If a person is named, ground the date and the role precisely (Wikipedia-verified).",
    preferFactCheck: true,
  },
  sports: {
    slug: "sports",
    label: "Sports & Games",
    blurb: "How games work, where they came from, and what makes them fun.",
    topicGuidance: [
      "Pick ONE sport or game topic:",
      "- How a sport works (rules, key positions, scoring) for a sport kids know",
      "- The origin / history of a sport or game (chess, soccer, basketball, marbles)",
      "- A specific historic athletic moment (long-established, like the first 4-min mile)",
      "- Playground games and their variations",
      "Avoid: current rosters, current standings, current controversies. Anything date-sensitive will go stale.",
    ].join("\n"),
    toneGuidance:
      "Energetic but factual. Explain the mechanics like a kid is trying the sport for the first time. Athletes named must be historically established, not currently active.",
    preferFactCheck: true,
  },
  stories: {
    slug: "stories",
    label: "Stories & Folktales",
    blurb: "Fables, folk tales, and stories told for generations.",
    topicGuidance: [
      "Pick ONE traditional story or fable to retell:",
      "- Aesop's fables (Tortoise + Hare, Boy Who Cried Wolf, etc.)",
      "- Folk tales from any culture (Anansi, How the Tiger Got Its Stripes, etc.)",
      "- Tall tales (Paul Bunyan, Pecos Bill)",
      "- Fairy tales with kid-safe endings (avoid Grimm originals; use the kid-modern version)",
      "Always cite the cultural origin if the tale belongs to one. No invented 'traditional' tales.",
    ].join("\n"),
    toneGuidance:
      "Story voice. Clear arc: setup → conflict → turn → lesson. End with a single takeaway line the kid can repeat. Length tier: short.",
    preferFactCheck: false,
  },
  math_in_real_life: {
    slug: "math_in_real_life",
    label: "Math in Real Life",
    blurb: "Stories where the math actually matters.",
    topicGuidance: [
      "Pick ONE real-world scenario where the math makes the story:",
      "- Shopping math (counting change, simple fractions of pies/pizzas)",
      "- Time math (how long until something, hours vs minutes)",
      "- Measurement (how tall is the giraffe, how heavy is the elephant)",
      "- Patterns (sequences in nature, in art, in music)",
      "- Probability framed simply (more likely / less likely)",
      "The math must be load-bearing — the story falls apart without it.",
    ].join("\n"),
    toneGuidance:
      "Concrete characters, concrete numbers, concrete problem. The MCQs should test whether the kid followed the math, not just whether they remember the character's name.",
    preferFactCheck: false,
  },
};

export function listCategories(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}

export function getCategory(slug: string): CategoryConfig | null {
  return (CATEGORIES as Record<string, CategoryConfig>)[slug] ?? null;
}
