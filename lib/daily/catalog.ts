/**
 * What a Daily Readee is about, and what it looks like.
 *
 * Replaces the weekday-category system, which produced a schedule rather than a
 * surprise: Saturday was always an adventure, Wednesday was always history, and
 * because monthly observances fired on days 7/14/21/28 - all congruent mod 7 -
 * Asian Pacific American Heritage Month landed on four Thursdays in a row and
 * could never land on anything else. A child who reads these daily learned the
 * shape of the week instead of looking forward to the subject.
 *
 * Three ideas here.
 *
 * SUBJECT COMES FROM A CURATED POOL, DRAWN AT RANDOM. The pool is written by us
 * rather than invented per-day by a model, which is the main safety control on
 * a fully automated pipeline: nothing controversial, frightening or off-register
 * for K-4 can wander in, because nothing enters the pool without a person
 * putting it there. It is also what makes the catalogue ours - these are chosen
 * subjects, not whatever a model free-associates.
 *
 * THE GENRE MIX IS RANDOM, NOT WEIGHTED. Filip's call, and it is the right one:
 * fixed percentages are just a slower schedule. The bucket is drawn uniformly
 * with a short memory: the last three buckets are blocked, which stops one lane
 * taking five days in twenty-four without making tomorrow guessable.
 *
 * MEDIUM IS DRAWN TOO, INCLUDING FELT ON ANIMALS. A felt narwhal is a lovely
 * thing and the old rule - photoreal for anything factual - made it impossible.
 * The only hard constraints are the ones that protect a six-year-old: some
 * subjects must never be photographed, and real people are never invented.
 */

export type Bucket =
  | "animals"
  | "space"
  | "earth"
  | "plants"
  | "body"
  | "made"
  | "people"
  | "cultures"
  | "stories";

export const BUCKET_LABEL: Record<Bucket, string> = {
  animals: "Animals",
  space: "Space",
  earth: "Earth and weather",
  plants: "Plants and food",
  body: "The human body",
  made: "Things people made",
  people: "People who did something first",
  cultures: "Celebrations around the world",
  stories: "A story",
};

/**
 * Subjects, curated. Long enough that a year of dailies never repeats one.
 *
 * Deliberately global rather than default-Western. The people bucket is not the
 * same six inventors every child already gets - Wangari Maathai, Chien-Shiung
 * Wu, Sequoyah and Mary Anning sit alongside the Wright brothers - and the
 * celebrations bucket runs from Songkran to Up Helly Aa. The big named
 * festivals (Diwali, Lunar New Year, Nowruz, Eid) are taught on their actual
 * dates from holidays-inclusive.ts instead. That breadth is the point: a child
 * should meet the world here, not a hometown.
 */
export const POOL: Record<Bucket, string[]> = {
  animals: [
    "narwhal", "axolotl", "capybara", "pangolin", "octopus", "sloth", "seahorse",
    "flamingo", "chameleon", "hummingbird", "arctic fox", "manatee", "puffin",
    "snow leopard", "tardigrade", "cuttlefish", "honey badger", "okapi",
    "leafcutter ant", "mantis shrimp", "platypus", "red panda", "orca",
    "emperor penguin", "fennec fox", "wombat", "jellyfish", "peregrine falcon",
    "sea otter", "dung beetle", "firefly", "monarch butterfly", "beaver",
    "elephant", "giant tortoise", "kangaroo rat", "bowerbird", "star-nosed mole",
  ],
  space: [
    "Mars", "the Moon", "Saturn's rings", "the Sun", "a comet", "the Milky Way",
    "black holes", "the International Space Station", "Jupiter's Great Red Spot",
    "meteor showers", "the Hubble telescope", "Mars rovers", "constellations",
    "solar eclipses", "asteroids", "Venus", "the northern lights", "moon phases",
    "why stars twinkle", "space suits", "gravity in orbit", "the Voyager probes",
  ],
  earth: [
    "volcanoes", "thunderstorms", "rainbows", "glaciers", "caves", "tides",
    "deserts", "coral reefs", "geysers", "earthquakes", "snowflakes",
    "the water cycle", "fog", "canyons", "hurricanes", "sand dunes", "waterfalls",
    "the deep ocean", "rivers", "islands", "clouds", "wind", "seasons", "soil",
  ],
  plants: [
    "sunflowers", "giant sequoias", "venus flytraps", "mushrooms", "bamboo",
    "cacti", "seeds that travel", "pineapples", "how honey is made", "maple syrup",
    "chili peppers", "rice", "olive trees", "vanilla", "seaweed", "mangoes",
    "how bread rises", "roots", "moss", "pumpkins", "cacao", "saffron",
  ],
  body: [
    "why we sleep", "how ears hear", "why we get goosebumps", "how bones grow",
    "why we blink", "how muscles work", "what hiccups are", "why we yawn",
    "how the heart beats", "why we have fingerprints", "how we taste",
    "why we shiver", "how cuts heal", "why we dream", "how we balance",
  ],
  made: [
    "bicycles", "bridges", "zippers", "clocks", "paper", "the printing press",
    "kites", "lighthouses", "windmills", "elevators", "traffic lights",
    "submarines", "trains", "cameras", "telescopes", "pencils", "buttons",
    "umbrellas", "the compass", "velcro", "hot air balloons", "sailboats",
  ],
  people: [
    "Marie Curie", "Wangari Maathai", "Katherine Johnson", "Jane Goodall",
    "Mae Jemison", "Frida Kahlo", "Ada Lovelace", "Yuri Gagarin", "Hokusai",
    "Rachel Carson", "Ibn Battuta", "Amelia Earhart", "Louis Braille",
    "Chien-Shiung Wu", "Roberto Clemente", "Sequoyah", "Florence Nightingale",
    "Mary Anning", "Bessie Coleman", "Alexander Graham Bell", "the Wright brothers",
    "Zora Neale Hurston", "Temple Grandin", "Sonia Sotomayor",
  ],
  // ‼️ Nothing here may also be pinned in holidays-inclusive.ts. Those are tied
  // to a date; drawing one at random put "Lunar New Year" on an October Monday.
  // Celebrations WITH a fixed date are taught on that date instead.
  cultures: [
    "Carnival in Brazil", "Songkran", "St Lucia Day", "Obon", "Inti Raymi",
    "the Highland Games", "La Tomatina", "Hola Mohalla", "Maslenitsa",
    "Yi Peng lantern festival", "the Notting Hill Carnival", "Sinterklaas",
    "Up Helly Aa", "Onam", "the Dragon Boat Festival", "Sukkot",
    "the Venice Carnival masks", "Cherry Blossom Festival", "Bastille Day",
    "the Running of the Reindeer",
  ],
  stories: [
    "a lost thing found in an unlikely place", "two friends who want different things",
    "a first day somewhere new", "a small kindness that comes back around",
    "a plan that goes wrong and turns out better", "someone braver than they knew",
    "a misunderstanding cleared up", "a long wait finally over",
    "sharing something there is not enough of", "a secret worth keeping",
    "helping someone who did not ask", "trying again after getting it wrong",
    "an unlikely pair", "noticing what everyone else walked past",
    "giving up something to help", "the youngest one solves it",
  ],
};

/** Buckets whose subjects are real, documented things a photograph could show. */
export const PHOTOGRAPHABLE: Bucket[] = ["animals", "space", "earth", "plants", "made", "cultures"];

/**
 * Genre of a bucket, for the QC passage judge.
 *
 * `stories` is the only invented bucket — `topicFor` asks it for a plot with
 * characters. Every other bucket asks for a true passage, so the judge has to
 * be told "informational" or it fails the day for not being a narrative.
 */
export function isInformationalBucket(bucket: Bucket): boolean {
  return bucket !== "stories";
}

/**
 * Never photographed, whatever the medium draw says.
 *
 * A real photograph of a bone, of sweat, or of a heart is clinical, and for a
 * six-year-old it lands somewhere between boring and alarming. These shipped
 * live: "Your Changing Bones" carried a photograph of a bone. The body is a
 * wonderful subject and a terrible photograph.
 */
export const NEVER_PHOTOGRAPH: Bucket[] = ["body", "stories"];

/** The eight illustration mediums, felt included, available to every bucket. */
export const MEDIUMS = [
  "felt",
  "cut-paper",
  "watercolor",
  "gouache",
  "colored-pencil",
  "ink-and-wash",
  "pastel",
  "bold-cartoon",
] as const;
export type Medium = (typeof MEDIUMS)[number] | "photograph";

export const MEDIUM_PROMPT: Record<Medium, string> = {
  // Jennifer's favourite, and it survives Imagen better than most: stitched
  // felt has no fine detail to garble and reads warm at any size.
  felt: "Felt and fabric craft illustration, stitched textures, plush layered shapes, handmade warmth, no text, no watermarks. ",
  "cut-paper": "Cut-paper collage illustration, layered textured paper shapes, playful and tactile, Eric Carle style, no text, no watermarks. ",
  watercolor: "Soft watercolor storybook illustration, gentle washes, hand-painted texture, warm and cozy, no text, no watermarks. ",
  gouache: "Cozy gouache painting, flat matte colors, rounded friendly shapes, mid-century children's book style, no text, no watermarks. ",
  "colored-pencil": "Soft colored-pencil and crayon illustration, hand-drawn childlike warmth, gentle shading, no text, no watermarks. ",
  "ink-and-wash": "Classic storybook ink-and-wash illustration, fine linework with soft muted color washes, timeless picture-book feel, no text, no watermarks. ",
  pastel: "Soft pastel chalk illustration, dreamy blended colors, gentle glowing light, bedtime-story mood, no text, no watermarks. ",
  "bold-cartoon": "Bright bold 2D cartoon illustration, clean thick outlines, vibrant saturated colors, kid-friendly, no text, no watermarks. ",
  photograph: "",
};

/** Deterministic per-date hash, so a rerun of the cron produces the same day. */
export function seedFor(dateStr: string, salt = ""): number {
  let h = 2166136261;
  for (const ch of `${dateStr}${salt}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Pick the bucket for a date.
 *
 * Uniform, not weighted: a fixed percentage split is a slower schedule, and the
 * point is that a reader cannot predict tomorrow. `recentBuckets` (most recent
 * first) blocks the last two so the same lane cannot run back to back, which is
 * the only pattern uniform randomness produces that actually reads as a flaw.
 */
export function pickBucket(dateStr: string, recentBuckets: Bucket[] = []): Bucket {
  const blocked = new Set(recentBuckets.slice(0, 3));
  const open = (Object.keys(POOL) as Bucket[]).filter((b) => !blocked.has(b));
  const choices = open.length > 0 ? open : (Object.keys(POOL) as Bucket[]);
  return choices[seedFor(dateStr, "bucket") % choices.length];
}

/** Pick a subject from the bucket, skipping anything used recently. */
export function pickSubject(dateStr: string, bucket: Bucket, recentSubjects: string[] = []): string {
  const used = new Set(recentSubjects.map((s) => s.toLowerCase()));
  const open = POOL[bucket].filter((s) => !used.has(s.toLowerCase()));
  const choices = open.length > 0 ? open : POOL[bucket];
  return choices[seedFor(dateStr, `subject:${bucket}`) % choices.length];
}

/**
 * Pick the medium.
 *
 * Photograph is one option among nine for a photographable bucket, not the
 * default for anything factual - that rule is what buried the craft styles and
 * left the catalogue looking like a stock library. A felt narwhal is now as
 * likely as a photographed one.
 */
export function pickMedium(dateStr: string, bucket: Bucket, recentMediums: string[] = []): Medium {
  const options: Medium[] = NEVER_PHOTOGRAPH.includes(bucket)
    ? [...MEDIUMS]
    : PHOTOGRAPHABLE.includes(bucket)
      ? ["photograph", ...MEDIUMS]
      : [...MEDIUMS];
  // Block the last two mediums so three felt days never run together.
  const blocked = new Set(recentMediums.slice(0, 2));
  const open = options.filter((m) => !blocked.has(m));
  const choices = open.length > 0 ? open : options;
  return choices[seedFor(dateStr, "medium") % choices.length];
}

export type DailyPick = {
  bucket: Bucket;
  subject: string;
  medium: Medium;
  /** Human label for the `theme` column, e.g. "Animals - narwhal". */
  label: string;
  /** The topic instruction handed to the passage generator. */
  topic: string;
};

/**
 * Everything the builder needs for one day, in one call.
 *
 * `recent` comes from the last ~40 published rows so the draw can avoid what a
 * reader has actually just seen, rather than avoiding a fixed window of days.
 */
export function pickDaily(
  dateStr: string,
  recent: { bucket: Bucket; subject: string; medium: string }[] = [],
  /**
   * Subjects to refuse outright, whatever bucket they belong to.
   *
   * Separate from `recent` on purpose: recent is filtered down to the chosen
   * bucket, so an exclusion passed through it would be silently dropped whenever
   * the draw landed elsewhere. These are subjects that have already failed QC
   * today and must not come back.
   */
  exclude: string[] = [],
): DailyPick {
  const bucket = pickBucket(dateStr, recent.map((r) => r.bucket));
  const subject = pickSubject(
    dateStr,
    bucket,
    [...recent.filter((r) => r.bucket === bucket).map((r) => r.subject), ...exclude],
  );
  const medium = pickMedium(dateStr, bucket, recent.map((r) => r.medium));
  return { bucket, subject, medium, label: `${BUCKET_LABEL[bucket]} - ${subject}`, topic: topicFor(bucket, subject) };
}

/**
 * The passage brief.
 *
 * ‼️ NO LENGTH WORDS IN HERE. Length belongs to the tier, which the daily
 * builder sets to "medium" at 2nd grade = 100-150 words. These briefs used to
 * open "A short, true passage..." and "A warm short story...", which argued with
 * that instruction, and the model split the difference: the 2026-09-06 daily
 * came out at 75 words, below its own window and inside the 55-85 band the EASY
 * rendition targets - so Short read and Full read were the same length.
 *
 * Say what the passage is ABOUT. The tier says how long.
 */
function topicFor(bucket: Bucket, subject: string): string {
  if (bucket === "stories") {
    return `A warm story built on this premise: ${subject}. Invent the characters and the setting; the premise is the shape, not the plot. Give it a beginning, a real problem, and an ending that resolves it. Let scenes breathe rather than summarising them.`;
  }
  if (bucket === "people") {
    return `A true passage about ${subject} and one specific thing they did, told so a child can picture it: where they were, what they tried, what happened. Stick to what is documented. No invented dialogue and no invented scenes.`;
  }
  if (bucket === "cultures") {
    return `A warm, factual passage about ${subject}: what happens, what people eat, wear or make, and why it matters to the people who celebrate it. Respectful and specific, built around one vivid moment rather than a list of facts.`;
  }
  if (bucket === "body") {
    return `A cheerful passage explaining ${subject} to a young child, built around something they can feel or notice in themselves. Concrete and friendly. Nothing medical, nothing about illness or injury.`;
  }
  return `A true passage about ${subject}, built around the single most surprising real thing about it, with enough detail that a child can picture it. Concrete and vivid, the way a good nature programme opens.`;
}
