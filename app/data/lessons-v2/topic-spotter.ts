import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./topic-spotter-timings.json";

// Topic Spotter (RI.1.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=topic-spotter

const A = (id: string) => `/audio/lessons-v2/topic-spotter/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/topic-spotter/${w.toLowerCase()}.png`;

export const topicSpotterImages: Record<string, string | { subject: string; ref?: string }> = {
  "moon": "The full moon in a dark blue night sky with small white stars, round gray craters visible on the moon's surface. Friendly nonfiction illustration, no face on the moon, no text anywhere.",
  "sun-and-moon": { subject: "The bright yellow sun far away in dark space sending soft light rays across to the smaller gray moon, small white stars around them, no face on the sun and no face on the moon, no text anywhere", ref: "moon" },
  "craters": "The empty bumpy gray surface of the moon filling the bottom half of the picture, with four deep round crater holes with raised rims, completely empty landscape with nothing standing on the surface, no rocket, no spaceship, no person, no flag, no objects, and above the gray horizon the sky is very dark navy blue, almost black, like deep space at night, dotted with small white stars. Friendly nonfiction illustration, no faces anywhere, no text anywhere."
};

export const topicSpotter: LessonDef = {
  id: "topic-spotter",
  title: "Topic Spotter",
  grade: "1st Grade",
  standard: "RI.1.2",
  archetype: "inference",
  objective: "I can name the main topic of a fact book and retell its key details in order.",
  concepts: ["main topic","key details","retell in order"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a topic spotter you are! You read a whole fact book and named its main topic, the moon. You told the topic apart from the details. And you retold the details in the book's own order. Spot the topic every time you read!",
    "title": "You Spotted the Topic!",
    "body": "You named the main topic and retold the key details in order."
  },
  scenes: [
    {
      id: "hook-meet-the-book",
      purpose: "hook",
      gate: "none",
      prompt: "Let's read a true fact book!",
      image: IMG("moon"),
      narration: { audio: A("hook-meet-the-book"), script: "Hello, reader! Today we will read a fact book, and every fact in it is true. Every fact book has a main topic. The main topic is what the whole book is about. Not just one page. The whole book. As you read, keep asking yourself, what is this whole book about?" },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our fact book. Read along with me." },
      interaction: { type: "read-along", text: "The moon moves around the Earth. The moon has no light of its own.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-spot-check",
      purpose: "model",
      gate: "none",
      prompt: "Watch me check for the topic.",
      fx: {"text":"What is the **whole book** about?","effect":"glow"},
      narration: { audio: A("model-spot-check"), script: "Watch me work like a topic spotter. I just read page one. Both facts tell about the moon. It moves around the Earth. It has no light of its own. Hmm. Maybe this whole book is about the moon. A good spotter keeps reading to check every page." },
    },
    {
      id: "guided-speak-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two aloud: The moon gets its light from the sun.",
      image: IMG("sun-and-moon"),
      narration: { audio: A("guided-speak-page-two"), script: "Page two is short, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "The moon gets its light from the sun" },
    },
    {
      id: "guided-read-page-three",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("guided-read-page-three"), script: "Here is page three, the last page. It holds three more true facts. Read it with me." },
      interaction: { type: "read-along", text: "The moon has deep holes called craters. People have walked on the moon. They picked up moon rocks.", audio: A("guided-read-page-three-sentence") },
    },
    {
      id: "model-find-topic",
      purpose: "model",
      gate: "none",
      prompt: "Watch me spot the main topic.",
      fx: {"text":"The **whole book** is about the moon.","effect":"underline"},
      narration: { audio: A("model-find-topic"), script: "Now watch me spot the main topic. I check every page. Page one told how the moon moves and about its light. Page two told where its light comes from. Page three told about its craters and its rocks. Every page told about the moon! So the main topic is the moon. Careful, spotter. Craters is a detail. A detail is just one thing the book says. It is not the main topic." },
    },
    {
      id: "guided-choose-topic",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is the main topic of our book?",
      narration: { audio: A("guided-choose-topic"), script: "Your turn! The main topic is what the whole book is about. A detail is just one thing the book says. Read each card. Tap the main topic of our fact book." },
      interaction: { type: "choose", options: [{ id: "the-moon", label: "the moon" }, { id: "craters", label: "craters" }, { id: "the-sun", label: "the sun" }], correctId: "the-moon", coachWrong: "The book does say something about that. But is the whole book about it? Think about every page. Try again!" },
    },
    {
      id: "guided-sort-topic-details",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the topic and the details.",
      narration: { audio: A("guided-sort-topic-details"), script: "Here are cards from our moon book. One card names the main topic, what the whole book is about. The other cards are details, single facts the book told. Read each card and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Topic","Details"], items: [{ label: "the moon", bucket: "Topic" }, { label: "craters", bucket: "Details" }, { label: "moon rocks", bucket: "Details" }, { label: "light from the sun", bucket: "Details" }], coachWrong: "The main topic is what the whole book is about. A detail is just one fact from the book. Try again!" },
    },
    {
      id: "model-retell-order",
      purpose: "model",
      gate: "none",
      prompt: "Retelling means telling it again in order.",
      image: IMG("craters"),
      narration: { audio: A("model-retell-order"), script: "A topic spotter can also retell the book. Retelling means telling the key details again, in the order the book told them. Listen to our book's order one more time. First, the moon moves around the Earth. Next, the moon gets its light from the sun. Then, the moon has deep craters. Last, people walked on the moon and picked up moon rocks." },
    },
    {
      id: "apply-sequence-retell",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the details in order.",
      narration: { audio: A("apply-sequence-retell"), script: "Now you retell! Read each detail card. Then drag the details into the order our book told them. Think, what did page one tell first?" },
      interaction: { type: "sequence", items: [{ id: "around-earth", label: "moves around the Earth" }, { id: "light-from-sun", label: "gets light from the sun" }, { id: "deep-craters", label: "has deep craters" }, { id: "picked-up-rocks", label: "people picked up rocks" }], order: ["around-earth","light-from-sun","deep-craters","picked-up-rocks"], coachWrong: "Think back to the book. Page one told the first detail. What came next? Try again!" },
    },
    {
      id: "apply-find-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which card is a detail from our book?",
      narration: { audio: A("apply-find-detail"), script: "Now flip it! A detail is just one fact the book tells. Read each card. Tap the card that is a detail from our moon book." },
      interaction: { type: "choose", options: [{ id: "moon-rocks", label: "moon rocks" }, { id: "the-moon", label: "the moon" }, { id: "the-stars", label: "the stars" }], correctId: "moon-rocks", coachWrong: "A detail is one fact our book really told. Is that card the whole book? Did our book even say it? Try again!" },
    },
    {
      id: "challenge-new-book",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is the whole new book about?",
      narration: { audio: A("challenge-new-book"), script: "Challenge time! Here is a tiny new fact book. Listen. A crab has a hard shell. A crab walks side to side. A crab digs in the sand. Now read each card. What is the whole new book about? Tap it." },
      interaction: { type: "choose", options: [{ id: "crabs", label: "crabs" }, { id: "hard-shells", label: "hard shells" }, { id: "the-sand", label: "the sand" }], correctId: "crabs", coachWrong: "That is just one fact from the tiny book. What did every fact tell about? Try again!" },
    },
    {
      id: "challenge-say-topic",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the main topic of our fact book!",
      fx: {"text":"The **whole book** is about...","effect":"pop-words"},
      narration: { audio: A("challenge-say-topic"), script: "Last challenge! Think about our big fact book, the one you read today. What is the whole book about? Tap the mic and say the main topic out loud." },
      interaction: { type: "speak", text: "moon moons" },
    },
    {
      id: "celebrate-topic-spotter",
      purpose: "celebrate",
      gate: "none",
      prompt: "You spotted the topic!",
      fx: {"text":"You can **spot the topic**!","effect":"fireworks"},
      narration: { audio: A("celebrate-topic-spotter"), script: "You did it! You read a whole fact book about the moon. You spotted the main topic, told it apart from the details, and retold the details in order. Spot the topic in every book you read!" },
    },
  ],
};
