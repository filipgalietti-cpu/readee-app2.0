import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./reading-detective-timings.json";

// Reading Detective — Meaning & Inference (RL.K.1: ask/answer questions about
// key details; inference foundations). EXEMPLAR C — the zero-budget proof:
// this lesson is composed ENTIRELY from existing registry interactions
// (listen / choose / highlight / sequence / speak). New engine code: NONE.
//
// Narrations are written as a CONNECTED ARC (detective frame carries through;
// each scene references the last) — the "slides feed off each other" fix.

const A = (id: string) => `/audio/lessons-v2/reading-detective/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/reading-detective/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/reading-detective/${w.toLowerCase()}.png`;

/** Image manifest, consumed by scripts/lesson-images.ts (word → subject). */
export const readingDetectiveImages: Record<string, string | { subject: string; ref?: string }> = {
  bella: "a smiling little girl with pigtails and a detective magnifying glass",
  milo: "a small playful orange kitten",
  prints: "a trail of muddy paw prints on the ground",
  scene: "wide storybook scene: a trail of muddy paw prints crossing a sunny farmyard, leading toward a big red barn with white doors, no characters, landscape composition",
  barn: "a big red barn with white doors",
  mud: "a squishy brown mud puddle",
  look: { subject: "the same little girl searching around a backyard with her magnifying glass", ref: "bella" },
  found: { subject: "the same little girl happily hugging a small orange kitten", ref: "bella" },
  rain: "rain falling from a friendly gray cloud",
  sun: "a bright warm smiling sun",
  stars: "twinkling stars in a dark night sky",
  sky: "a blue sky with fluffy white clouds",
  ocean: "blue ocean waves",
  snow: "soft white snow falling",
  sand: "a sandy beach dune",
};

export const readingDetective: LessonDef = {
  id: "reading-detective",
  title: "Reading Detective: Find Milo!",
  grade: "Kindergarten",
  standard: "RL.K.1",
  archetype: "inference",
  objective: "Use clues from the story to figure out what the words don't say. That's an inference!",
  concepts: ["inference", "evidence", "prediction"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "Case closed, detective! You followed the clues, made a smart guess, and figured out things the story never said. That is called making an inference. Great detective reading!",
    title: "Case closed, detective!",
    body: "You followed the paw prints, found the clue words, and cracked TWO cases. Detectives read carefully, just like you!",
  },
  scenes: [
    // ── HOOK — meet the case ──
    {
      id: "hook",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Bella and Milo. Tap each picture!",
      narration: {
        audio: A("hook"),
        script:
          "Meet Bella and her kitten, Milo. Tap each picture to hear its name. Uh oh! Milo is hiding! Today, you get to be a reading detective and help Bella find him.",
      },
      interaction: {
        type: "listen",
        items: [
          { label: "BELLA", audio: W("BELLA"), image: IMG("bella") },
          { label: "MILO", audio: W("MILO"), image: IMG("milo") },
        ],
      },
    },

    // ── THE CASE — karaoke read-along of the story itself ──
    {
      id: "case",
      purpose: "hook",
      gate: "interaction",
      prompt: "Here's the case. Follow along as I read!",
      image: IMG("scene"),
      narration: {
        audio: A("case"),
        script: "Detective, here is the case. Watch each word light up as I read the clues.",
      },
      interaction: {
        type: "read-along",
        text: "Milo is hiding! Bella sees muddy paw prints. The prints go to the big red barn.",
        audio: A("case-sentence"),
      },
    },

    // ── PREDICT — detective's first guess ──
    {
      id: "predict",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where do you think Milo is?",
      image: IMG("scene"),
      narration: {
        audio: A("predict"),
        script:
          "A detective looks for clues. Bella sees muddy paw prints, and they lead right to the big red barn! Think like a detective. Where do you think Milo is hiding? Tap your answer.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "barn", label: "BARN", image: IMG("barn"), audio: W("BARN") },
          { id: "sky", label: "SKY", image: IMG("sky"), audio: W("SKY") },
          { id: "ocean", label: "OCEAN", image: IMG("ocean"), audio: W("OCEAN") },
        ],
        correctId: "barn",
        coachWrong: "Follow the clue. Where did the paw prints go?",
      },
    },

    // ── EVIDENCE — find the clue words ──
    {
      id: "evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the words that tell what Bella saw on the ground!",
      narration: {
        audio: A("evidence"),
        script:
          "You followed the clue like a real detective! Now find it in the sentence. Tap the words that tell what Bella saw on the ground.",
      },
      interaction: {
        type: "highlight",
        text: "The muddy paw prints go to the red barn.",
        targets: ["paw", "prints"],
        coachWrong: "Look again. What did Bella SEE on the ground?",
      },
    },

    // ── INFER — figure out what the story didn't say ──
    {
      id: "infer",
      purpose: "guided",
      gate: "interaction",
      prompt: "The paw prints were MUDDY. So where did Milo walk?",
      narration: {
        audio: A("infer"),
        script:
          "Now here's the tricky detective part. The story never SAID where Milo walked. But the paw prints were muddy... so where must Milo have walked? Tap it.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "mud", label: "MUD", image: IMG("mud"), audio: W("MUD") },
          { id: "snow", label: "SNOW", image: IMG("snow"), audio: W("SNOW") },
          { id: "sand", label: "SAND", image: IMG("sand"), audio: W("SAND") },
        ],
        correctId: "mud",
        coachWrong: "Muddy prints... what makes paws muddy?",
      },
    },

    // ── ORDER — retell the case in order ──
    {
      id: "order",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tell the case in order! What happened first, next, and last?",
      narration: {
        audio: A("order"),
        script:
          "Let's tell the whole case in order, detective. First Bella looked for Milo. Then she found the paw prints. And last, she found Milo in the barn! Tap the pictures in order.",
      },
      interaction: {
        type: "sequence",
        items: [
          { id: "look", label: "LOOK", image: IMG("look"), audio: W("LOOK") },
          { id: "prints", label: "PRINTS", image: IMG("prints"), audio: W("PRINTS") },
          { id: "found", label: "FOUND", image: IMG("found"), audio: W("FOUND") },
        ],
        order: ["look", "prints", "found"],
        coachWrong: "Hmm, what happened before that?",
      },
    },

    // ── SAY IT — state the conclusion ──
    {
      id: "say-it",
      purpose: "guided",
      gate: "interaction",
      prompt: "Say it like a detective!",
      narration: {
        audio: A("say-it"),
        script: "You solved it, detective! Now say it out loud. Tap the mic and say: Milo is in the barn.",
      },
      interaction: { type: "speak", text: "Milo is in the barn" },
    },

    // ── CHALLENGE — a brand-new inference, all alone ──
    {
      id: "challenge",
      purpose: "challenge",
      gate: "interaction",
      prompt: "New case! Sam's boots are all wet. What was falling outside?",
      narration: {
        audio: A("challenge"),
        script:
          "One more case, and this one is all yours. Sam comes inside, and his boots are all wet. The story doesn't say why... but you can figure it out. What was falling outside? Tap it.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "rain", label: "RAIN", image: IMG("rain"), audio: W("RAIN") },
          { id: "sun", label: "SUN", image: IMG("sun"), audio: W("SUN") },
          { id: "stars", label: "STARS", image: IMG("stars"), audio: W("STARS") },
        ],
        correctId: "rain",
        coachWrong: "Wet boots... what falls from the sky and makes things wet?",
      },
    },

    // ── WRAP ──
    {
      id: "celebrate",
      fx: { text: "You used **clues** to crack the case!", effect: "burst" },
      purpose: "celebrate",
      gate: "none",
      prompt: "Case closed, detective!",
      narration: {
        audio: A("celebrate"),
        script:
          "You solved the case! You used clues to figure out things the story didn't say. That's called making an inference, and it's what great readers do. Amazing work, detective!",
      },
    },
  ],
};
