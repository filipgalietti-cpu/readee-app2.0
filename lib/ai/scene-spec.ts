/**
 * Scene-spec extraction — turns a passage into a structured manifest
 * the image generator + image judge can both reason against, instead
 * of a free-form sentence brief that lets the model decide which
 * concrete nouns to drop.
 *
 * The May 12 2026 "wtf animal" failure: passage explicitly named
 * squirrel + bunny + duck + frogs, brief collapsed them into "cute
 * woodland creatures," generator painted a chimera, prompt-vs-image
 * judge passed because "yeah cute animals at a pond." A structured
 * spec forces both the generator and the judge into atomic per-item
 * commitments — "is there a fluffy white rabbit visible? yes/no" is
 * far harder to pass-bias than "does this image match the brief?"
 *
 * The spec doubles as:
 *   - Image brief input (concrete roster, low ambiguity).
 *   - Image-judge spec (atomic per-item verdicts in qc-scene.ts).
 *   - Regen instruction when one specific item is missing — we know
 *     exactly which character/object the next generation must include.
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID, logUsage } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type SceneCharacter = {
  /** Concrete species, breed, or role. Examples: "squirrel", "Labrador
   *  retriever", "school teacher", "astronaut", "lion".
   *  NEVER vague nouns like "animal", "creature", "person". */
  species: string;
  /** Optional colour descriptor for visual anchoring. */
  color?: string | null;
  /** Optional one-word size or shape modifier — "little", "fluffy",
   *  "tall". Helps the generator differentiate species when multiple
   *  similar ones appear. */
  attribute?: string | null;
  /**
   * The character's name in the passage, when it has one. This exists so names
   * stop being crammed into `attribute`: the 2026-09-08 daily extracted Meg as
   * attribute="Meg", species="human", and the brief told the illustrator to
   * "Show exactly: a Meg human" - which means nothing to an image model, so it
   * drew two generic boys for a story about a girl.
   *
   * It is NEVER sent to the illustrator (a name has no appearance). It is kept
   * for the QC judge and for logs. `appearance` is what carries the name's
   * information across to the drawing - see below.
   */
  name?: string | null;
  /**
   * What this person LOOKS like: skin tone and hair, in plain illustrator
   * words. "brown skin, short black curly hair". People only; leave null for
   * animals and objects.
   *
   * ‼️ THIS FIELD EXISTS BECAUSE OF THE 2026-09-16 TRAFFIC LIGHTS DAILY.
   * The passage was about Tariq and Mohammed, with Tariq's mom the engineer.
   * REPRESENTATION_RULE (lib/ai/representation.ts) had done its job in the
   * text. But that rule only ever reaches the PASSAGE prompt, and the 09-08 fix
   * had just finished stripping names out of the brief, so the illustrator
   * received "a boy; a boy; a woman" and nothing else. Given no appearance at
   * all, the model drew its default: two white children and a white woman. It
   * also swapped one boy for a girl.
   *
   * So the system was generating names from a wide pool and then throwing away
   * the only signal those names carried. That is worse than either half alone:
   * it puts a Tariq and a Mohammed in the text and two white children in the
   * picture, on the page a parent judges us by.
   *
   * SKIN AND HAIR ONLY. Never clothing, religious dress, props or setting that
   * the passage did not state - the fix for a default is a described character,
   * not a costume. Related characters must match each other.
   */
  appearance?: string | null;
  /** Number of this character visible in the scene. Default 1.
   *  Captures "two green frogs on a log." */
  count?: number | null;
  /**
   * True when this character is a HUMAN BEING rather than an animal, object or
   * symbol.
   *
   * The depiction guard (lib/daily/depiction-guard.ts) can forbid drawing
   * people at all - a real, identifiable person or event gets "objects, places
   * and symbols only". Until this flag existed the guard rewrote the BRIEF but
   * nothing filtered the SPEC, so the 2026-09-11 Ellen Ochoa daily went to the
   * illustrator saying "Show exactly: a astronaut human" and, four lines later,
   * "NO people, NO faces, NO figures". The QC judge read the whole thing back
   * and called it out: "the image brief contains contradictory instructions".
   *
   * Deciding this here rather than by keyword downstream is the point: the
   * extractor is already reading the passage, and human ROLES are open-ended
   * ("astronaut", "beekeeper", "bus driver") in a way no word list closes over.
   */
  is_person?: boolean | null;
};

export type SceneSpec = {
  /** The named characters/animals/objects that MUST appear in the
   *  image. Empty array is allowed for concept passages (e.g. "what
   *  is gravity") — the judge will skip the per-item check. */
  characters: SceneCharacter[];
  /** Setting — physical place ("pond", "classroom", "kitchen"). */
  setting: string | null;
  /** Time of day if the passage specifies one. */
  time_of_day: string | null;
  /** One-word mood — "happy", "calm", "exciting", "curious". */
  mood: string | null;
  /** The single most important action happening in the scene. */
  key_action: string | null;
  /** "nonfiction" when the passage teaches real-world facts (animals,
   *  science, history); "fiction" for made-up stories. Drives the
   *  anthropomorphism rules in the image brief + judge. */
  genre?: "fiction" | "nonfiction" | null;
};

const SCENE_SPEC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          color: { type: Type.STRING, nullable: true },
          attribute: { type: Type.STRING, nullable: true },
          name: { type: Type.STRING, nullable: true },
          appearance: { type: Type.STRING, nullable: true },
          count: { type: Type.INTEGER, nullable: true },
          is_person: { type: Type.BOOLEAN, nullable: true },
        },
        // is_person is REQUIRED, not optional, because the keyword fallback
        // below cannot close over open-ended human roles - it does not know
        // that a beekeeper is a person. Making the model answer every time is
        // what keeps the fallback a legacy path rather than the load-bearing one.
        required: ["species", "is_person"],
      },
    },
    setting: { type: Type.STRING, nullable: true },
    time_of_day: { type: Type.STRING, nullable: true },
    mood: { type: Type.STRING, nullable: true },
    key_action: { type: Type.STRING, nullable: true },
    genre: { type: Type.STRING, nullable: true },
  },
  required: ["characters"],
};

const SCENE_SPEC_SYSTEM = `You extract a structured visual scene specification from short K-4 reading passages so an illustrator + a vision QC judge have a concrete checklist.

Output is JSON matching the supplied schema. No prose, no markdown.

Rules:
- "characters" lists every named entity that should visibly appear in a single illustration of the passage's most evocative moment. Real species/breeds/roles only — NEVER vague words like "animal", "creature", "person", "thing".
- FOR PEOPLE, "species" must be a concrete person word an illustrator can draw: "girl", "boy", "woman", "man", "grandmother", "family". "human", "person", "family member" and "child" are too vague — an illustrator given "a child human" draws whoever it likes, which is how a story about a girl named Meg shipped as a picture of two boys.
- If the passage makes a character's gender clear — by pronoun, by a relationship word like sister or dad, or by an unambiguously gendered name — say so in "species" ("girl", not "child"). If the passage genuinely never indicates it, use "child" and leave it open rather than guessing.
- Put a character's NAME in "name", never in "attribute". "attribute" is for what the illustrator must SEE: "curly-haired", "in a red coat", "tall". A name has no appearance and belongs nowhere near the drawing instruction.
- FOR EVERY PERSON, fill "appearance" with skin tone and hair in plain illustrator words: "brown skin, short black curly hair", "light brown skin, straight dark hair in a braid", "pale skin, red hair". This field is REQUIRED for anyone with is_person true. Never leave it null for a person.
- Read the name when you decide appearance. These passages draw names from a wide pool on purpose, so the name is real information about the character: a Tariq, a Mohammed, an Amara, a Priya or a Wei is not a white child, and writing "appearance" as if they were is the specific bug this field was added to stop. Where the passage gives you nothing at all - an unnamed "a farmer" - choose a plausible appearance and vary it across passages rather than defaulting to white every time.
- Characters related to each other in the passage must match: a boy and his mom have the same skin tone and family resemblance.
- "appearance" is SKIN AND HAIR ONLY. Never religious dress, cultural costume, flags, props or a setting the passage did not state. A story about crossing the street is a story about crossing the street. If you find yourself adding anything a reader would notice as a marker, delete it and keep the skin and hair.
- Do not put appearance in "attribute" as well. "attribute" stays for build, clothing and size the passage actually mentions.
- The passage's MAIN character must be first in the list and must appear in "key_action". If the story follows one person, the illustration is about that person; a scene that shows the setting while the protagonist is absent is a failed illustration.
- Set "is_person" true for every human being, whatever word you used for them — "girl", "astronaut", "grandmother", "bus driver" are all people. False for animals, objects, plants and symbols. A talking animal in a story is NOT a person.
- If the passage names two of something ("two green frogs"), set count=2.
- Color/attribute fields are for the most distinctive visual cue. Skip them if the passage doesn't say.
- "setting" is the immediate physical place (pond, classroom, jungle, kitchen). One short phrase.
- "key_action" is the single most important thing happening — what the illustration should depict if it can only show one moment. One short phrase.
- Concept passages (gravity, photosynthesis) can have empty characters[]; fill setting + key_action.
- Cap characters at 6. If the passage has more, keep the named/featured ones; drop background extras.
- "genre": "nonfiction" if the passage teaches true facts about the real world (real animals, science, history, how things work); "fiction" if it is a made-up story with invented characters or events. When unsure, "nonfiction".`;

/**
 * Person words the extractor reaches for when it ignores the "concrete role"
 * rule. Only a BACKFILL for `is_person` when the model omits the flag — the
 * flag itself is the source of truth, because roles ("beekeeper", "astronaut")
 * are open-ended and no list closes over them.
 */
const PERSON_WORDS =
  /\b(person|people|human|humans|man|men|woman|women|boy|boys|girl|girls|child|children|kid|kids|baby|babies|toddler|teen|teenager|adult|family|parent|mother|mom|father|dad|sister|brother|grandmother|grandma|grandfather|grandpa|aunt|uncle|cousin|friend|neighbou?r|teacher|student|pupil|astronaut|farmer|doctor|nurse|firefighter|police officer|scientist|engineer|chef|baker|artist|painter|musician|dancer|singer|athlete|player|explorer|pilot|sailor|worker|king|queen|prince|princess|knight|crowd|author|writer|inventor|reporter|librarian|coach|ranger|guide|driver|astronomer|dentist|\w+keeper)\b/i;

/**
 * "a" or "an" for the roster line. Crude on purpose: the roster holds concrete
 * nouns, so the vowel-letter test is right far more often than it is wrong, and
 * the failure mode is a slightly odd article rather than a wrong picture.
 */
export function indefiniteArticle(phrase: string): string {
  return /^[aeiou]/i.test(phrase.trim()) ? "an" : "a";
}

/** Vague person nouns the roster must never ship — "a astronaut human". */
const VAGUE_SPECIES = /^(human|humans|person|people|figure|character|individual|someone)$/i;

/**
 * Repair the two things the extractor gets wrong often enough to matter, and
 * fill in `is_person` when the model left it off.
 *
 * The repair: the 2026-09-08 fix moved NAMES out of `attribute`, but the role
 * kept landing there with "human" left in `species`, so 2026-09-11 still told
 * the illustrator to draw "a astronaut human". When `species` is a vague person
 * noun and `attribute` holds the real role, they are simply the wrong way
 * round — swap them.
 */
export function normalizeCharacter(c: SceneCharacter): SceneCharacter {
  let species = (c.species ?? "").trim();
  let attribute = c.attribute ?? null;
  if (VAGUE_SPECIES.test(species) && attribute && attribute.trim()) {
    species = attribute.trim();
    attribute = null;
  }
  const is_person =
    typeof c.is_person === "boolean"
      ? c.is_person
      : PERSON_WORDS.test(`${species} ${c.attribute ?? ""}`);
  return { ...c, species, attribute, is_person };
}

/**
 * Does this free-text phrase put a person in the picture? Used by the depiction
 * guard to decide whether a spec's `key_action` survives people-stripping.
 */
export function mentionsPerson(text: string | null | undefined): boolean {
  return !!text && PERSON_WORDS.test(text);
}

/** Is this character a human being? See `SceneCharacter.is_person`. */
export function isPersonCharacter(c: SceneCharacter): boolean {
  return typeof c.is_person === "boolean"
    ? c.is_person
    : PERSON_WORDS.test(`${c.species} ${c.attribute ?? ""}`);
}

/**
 * Extract a SceneSpec from a passage. Returns null on failure rather
 * than throwing so the caller (build-daily) can fall back to the
 * legacy free-form brief instead of breaking the whole build.
 */
export async function extractSceneSpec(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
}): Promise<{ ok: true; spec: SceneSpec } | { ok: false; error: string }> {
  const text = `${input.passageTitle}\n\n${input.passageBody}`.trim();
  if (!text) return { ok: false, error: "Passage is empty." };

  let client;
  try {
    client = getClient();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI client unavailable." };
  }

  const userPrompt = `Title: ${input.passageTitle}\n\nPassage:\n${input.passageBody.slice(
    0,
    2000,
  )}\n\nReturn the JSON scene spec.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SCENE_SPEC_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCENE_SPEC_SCHEMA as any,
        temperature: 0.15,
      },
    });
    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as Partial<SceneSpec>;
    const spec: SceneSpec = {
      characters: (Array.isArray(parsed.characters) ? parsed.characters : []).map(
        normalizeCharacter,
      ),
      setting: parsed.setting ?? null,
      time_of_day: parsed.time_of_day ?? null,
      mood: parsed.mood ?? null,
      key_action: parsed.key_action ?? null,
      // `genre` was declared in the schema, instructed in the system prompt,
      // and then dropped right here — so `spec.genre` was ALWAYS undefined.
      // Two things downstream read it and had therefore never once fired: the
      // nonfiction rule in renderSpecAsBrief ("animals behave naturally, no
      // clothing on animals") and the genre argument to pickImageStyle.
      genre:
        parsed.genre === "fiction" || parsed.genre === "nonfiction"
          ? parsed.genre
          : null,
    };
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `scene_spec: ${input.passageTitle.slice(0, 80)}`,
    });
    return { ok: true, spec };
  } catch (e: any) {
    trackError(e, {
      route: "scene-spec.extract",
      userId: input.teacherId,
      extra: { passageTitle: input.passageTitle.slice(0, 80) },
    });
    return { ok: false, error: e?.message ?? "Spec extraction failed." };
  }
}

/**
 * Render a SceneSpec as a human-readable brief the image generator
 * can consume directly. Roster sentence is always second so the
 * generator hits the named-species checklist after orienting on the
 * scene. Mirrors the format the (now tightened) IMAGE_BRIEF_SYSTEM
 * asks for, but built mechanically from structured data so it can't
 * drift back into "cute woodland critters."
 */
export function renderSpecAsBrief(spec: SceneSpec): string {
  const sceneParts: string[] = [];
  if (spec.key_action) sceneParts.push(spec.key_action);
  if (spec.setting) sceneParts.push(`at ${spec.setting}`);
  if (spec.time_of_day) sceneParts.push(`(${spec.time_of_day})`);
  const moodTail = spec.mood ? ` Mood: ${spec.mood}.` : "";
  const sceneSentence = sceneParts.length
    ? `Scene: ${sceneParts.join(" ")}.${moodTail}`
    : `A kid-friendly illustration of a simple scene.${moodTail}`;

  const hardRules = [
    // "No text" was not enough: the 2026-09-08 regeneration came back with an
    // artist signature in the corner and the judge failed it, which under the
    // ship-gate means the day publishes with NO image at all.
    "No text, letters, words, or numbers anywhere in the image.",
    // The rule above was not enough on its own. A generator that draws a street
    // will letter the shopfronts, and one that draws a police car will write
    // POLICE on the door - which is what failed the 2026-09-16 regeneration.
    // It comes back as garbled pseudo-text, the judge fails it, and under the
    // ship-gate a failed image means the day publishes with no picture at all.
    // So name the surfaces, rather than restating the rule louder.
    "Leave every surface that would normally carry writing completely blank: vehicle doors, shopfronts, street signs, banners, book covers, screens and clothing.",
    "No artist signature, watermark, initials, logo or caption — not in any corner, not anywhere.",
    "No thought bubbles or speech bubbles.",
    "No decorative frames or borders.",
  ];
  if (spec.genre === "nonfiction") {
    hardRules.push(
      "This is factual content: animals and objects look and behave naturally — no clothing on animals, no waving or human poses, no smiling faces drawn on objects, the sun, or the moon.",
    );
  }
  const rules = `\n\n${hardRules.join(" ")}`;

  if (spec.characters.length === 0) return sceneSentence + rules;

  const roster = spec.characters
    .map((c) => {
      // `name` is deliberately absent: an illustrator cannot draw a name, and
      // including it produced briefs like "a Meg human". `appearance` is the
      // replacement — the part of a name the illustrator CAN draw. Without it
      // the model defaults, which is how 2026-09-16 shipped Tariq and Mohammed
      // as two white children.
      const tail = [c.attribute ?? null, c.color ?? null, c.species]
        .filter(Boolean)
        .join(" ")
        .trim();
      // "a engineer woman" — the meta.adversarial judge caught this on the
      // 2026-09-16 regen and warned on the brief itself. A brief with a
      // grammatical error in it is a brief the illustrator reads less well.
      const lead = c.count && c.count > 1 ? `${c.count}` : indefiniteArticle(tail);
      const base = `${lead} ${tail}`.trim();
      const look = c.appearance?.trim();
      return look ? `${base} with ${look}` : base;
    })
    .join("; ");

  // Only when people are actually in the picture. The depiction guard strips
  // the cast to nothing for real, identifiable subjects, and a "draw each
  // person as described" line under a "NO people" instruction is exactly the
  // contradiction the QC judge called out on 2026-09-11.
  // One sentence, not three. The first version of this said the same thing
  // three ways and meta.adversarial warned that the brief carried "redundant,
  // confusing instructions for the types of humans to be shown".
  const peopleRule = spec.characters.some(isPersonCharacter)
    ? " Draw the people exactly as listed: the same number, the same gender, and the same skin tone and hair for each one."
    : "";

  return `${sceneSentence}\n\nShow exactly: ${roster}. Each item must be drawn as a clearly recognizable real-world species/object — no chimeras, no invented hybrids.${peopleRule}${rules}`;
}

/**
 * Human-readable summary for logs / dashboards.
 */
export function describeSpec(spec: SceneSpec): string {
  const chars = spec.characters
    .map((c) => `${c.count && c.count > 1 ? c.count : 1}× ${c.attribute ?? ""} ${c.color ?? ""} ${c.species}${c.name ? ` (${c.name})` : ""}${c.appearance ? ` [${c.appearance}]` : ""}`.replace(/\s+/g, " ").trim())
    .join(", ");
  return [
    chars ? `chars=[${chars}]` : "chars=[]",
    spec.setting ? `setting=${spec.setting}` : null,
    spec.key_action ? `action=${spec.key_action}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}
