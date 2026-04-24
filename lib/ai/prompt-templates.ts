/**
 * Curated prompt templates for the Ask Readee wizard.
 *
 * First-time parents often write terse prompts ("make a story about
 * cars") which produce mediocre output and churn them off the feature.
 * These templates give them a great starting point — one click fills
 * the topic field with a structured prompt that tends to generate
 * well.
 *
 * Each template has a title (what the parent sees as a chip) and a
 * function that takes the child's first name + optional details and
 * returns the generated topic string. Templates may also suggest a
 * phonics pattern.
 */

export type PromptTemplate = {
  id: string;
  title: string;
  subtitle: string;
  category: "interests" | "phonics" | "sel" | "seasonal" | "nonfiction";
  build: (input: { childName: string }) => { topic: string; phonicsPattern?: string };
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ── Interests ────────────────────────────────────────────────
  {
    id: "dinosaurs",
    title: "Favorite — dinosaurs",
    subtitle: "A short dino-themed passage",
    category: "interests",
    build: ({ childName }) => ({
      topic: `A short, fun passage about a young dinosaur character making a new friend. Include warm, descriptive moments and a small problem-and-solution arc. Feature a character named ${childName} (or a child meeting the dinosaur).`,
    }),
  },
  {
    id: "space",
    title: "Favorite — space",
    subtitle: "Astronauts, planets, shooting stars",
    category: "interests",
    build: ({ childName }) => ({
      topic: `A short reading passage about ${childName} exploring space — visiting a planet or seeing a shooting star. Curious, awe-filled tone, child-friendly vocabulary, a small discovery.`,
    }),
  },
  {
    id: "ocean",
    title: "Favorite — ocean animals",
    subtitle: "Octopus, whale, dolphin, fish",
    category: "interests",
    build: ({ childName }) => ({
      topic: `A short passage featuring an ocean animal (octopus, whale, or sea turtle) and a small adventure. Narrative-style, 1-2 characters, a simple problem resolved kindly.`,
    }),
  },
  {
    id: "pets",
    title: "Favorite — pets",
    subtitle: "Dogs, cats, hamsters",
    category: "interests",
    build: ({ childName }) => ({
      topic: `A short story about ${childName} and a pet having a small adventure (getting lost, meeting a neighbor, learning a trick). Warm tone, clear beginning/middle/end.`,
    }),
  },
  {
    id: "sports",
    title: "Favorite — sports",
    subtitle: "Soccer, basketball, hockey",
    category: "interests",
    build: ({ childName }) => ({
      topic: `A short passage about a young player named ${childName} learning a new sports skill. Practice, small setback, encouragement from a coach or friend, small win.`,
    }),
  },

  // ── Phonics ─────────────────────────────────────────────────
  {
    id: "short-a",
    title: "Phonics — short a",
    subtitle: "Cat, bat, jam, nap",
    category: "phonics",
    build: () => ({
      topic: `A very simple decodable passage using lots of short-a words. Keep sentences short and vocabulary simple. The target words should be bolded.`,
      phonicsPattern: "short a",
    }),
  },
  {
    id: "silent-e",
    title: "Phonics — silent e",
    subtitle: "Cake, bike, hope, cute",
    category: "phonics",
    build: () => ({
      topic: `A short decodable passage focused on silent-e (magic-e) words. Keep the plot simple; emphasize words like cake, make, ride, hope, cute. Bold the target words.`,
      phonicsPattern: "silent e",
    }),
  },
  {
    id: "r-controlled",
    title: "Phonics — bossy R",
    subtitle: "Car, bird, fern, shirt",
    category: "phonics",
    build: () => ({
      topic: `A short decodable passage using r-controlled vowels (ar, er, ir, or, ur). Natural-sounding but simple. Bold the target r-controlled words.`,
      phonicsPattern: "r-controlled vowels",
    }),
  },
  {
    id: "digraphs",
    title: "Phonics — sh/ch/th",
    subtitle: "Ship, chip, thin, shell",
    category: "phonics",
    build: () => ({
      topic: `A decodable short story loaded with digraphs (sh, ch, th, wh). Keep sentences short; highlight target words in bold.`,
      phonicsPattern: "consonant digraphs (sh, ch, th, wh)",
    }),
  },

  // ── SEL / character ────────────────────────────────────────
  {
    id: "sharing",
    title: "Feelings — sharing",
    subtitle: "A story about taking turns",
    category: "sel",
    build: ({ childName }) => ({
      topic: `A short story about ${childName} learning to share with a friend. Show the feeling (disappointment → understanding), a small resolution, and a warm ending.`,
    }),
  },
  {
    id: "trying-again",
    title: "Feelings — trying again",
    subtitle: "Dealing with a small setback",
    category: "sel",
    build: ({ childName }) => ({
      topic: `A short story where ${childName} tries something new, doesn't succeed right away, and chooses to try again. Growth mindset, warm tone, small but meaningful win.`,
    }),
  },
  {
    id: "kindness",
    title: "Feelings — kindness",
    subtitle: "Helping a classmate or stranger",
    category: "sel",
    build: ({ childName }) => ({
      topic: `A short story where ${childName} notices someone who needs help (a classmate, a grandparent, a neighbor) and does a small kind thing. Gentle tone, no big drama.`,
    }),
  },

  // ── Seasonal ────────────────────────────────────────────────
  {
    id: "halloween",
    title: "Seasonal — Halloween",
    subtitle: "Friendly, not scary",
    category: "seasonal",
    build: ({ childName }) => ({
      topic: `A FRIENDLY (not scary) Halloween passage about ${childName} picking a costume or going trick-or-treating. Warm, playful tone. Keep it age-appropriate — no frightening imagery.`,
    }),
  },
  {
    id: "winter",
    title: "Seasonal — winter adventure",
    subtitle: "Snow, sledding, cocoa",
    category: "seasonal",
    build: ({ childName }) => ({
      topic: `A short winter passage about ${childName} having a snowy-day adventure — sledding, building a snowperson, or discovering animal tracks. Cozy, wholesome.`,
    }),
  },
  {
    id: "spring",
    title: "Seasonal — spring garden",
    subtitle: "Flowers, bugs, growing things",
    category: "seasonal",
    build: ({ childName }) => ({
      topic: `A short spring passage about ${childName} planting seeds or finding a bug in the garden. Curiosity + growth, small sensory details.`,
    }),
  },

  // ── Nonfiction / factual ────────────────────────────────────
  {
    id: "how-plants-grow",
    title: "Science — how plants grow",
    subtitle: "Seed → sprout → plant",
    category: "nonfiction",
    build: () => ({
      topic: `A short informational passage explaining how plants grow: seed, water, sun, sprout, leaves, flower. Simple factual sentences. End with a question the reader can answer.`,
    }),
  },
  {
    id: "animal-habitats",
    title: "Science — animal habitats",
    subtitle: "Where animals live",
    category: "nonfiction",
    build: () => ({
      topic: `A short informational passage about animal habitats — forest, ocean, desert, or tundra. Introduce 2-3 animals and one key fact about each. Factual, clear, kid-appropriate.`,
    }),
  },
  {
    id: "community-helpers",
    title: "Social studies — community helpers",
    subtitle: "Doctors, firefighters, librarians",
    category: "nonfiction",
    build: () => ({
      topic: `A short informational passage about community helpers (firefighter, doctor, librarian, mail carrier). One specific thing each person does to help. Respectful, friendly tone.`,
    }),
  },
];

export const PROMPT_CATEGORIES: Record<PromptTemplate["category"], string> = {
  interests: "Favorite topics",
  phonics: "Phonics practice",
  sel: "Feelings & character",
  seasonal: "Seasonal",
  nonfiction: "Science & social studies",
};
