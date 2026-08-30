import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./whats-it-about-timings.json";

// What's It All About? (RI.K.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=whats-it-about

const A = (id: string) => `/audio/lessons-v2/whats-it-about/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/whats-it-about/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/whats-it-about/${w.toLowerCase()}.png`;

export const whatsItAboutImages: Record<string, string> = {
  "buzz": "A small yellow and black striped bee flying through the air with curved motion lines behind it. Friendly nonfiction illustration, the bee looks and acts like a real bee.",
  "hive": "A brown and yellow beehive hanging from a tree branch with two small bees flying near it. Friendly nonfiction illustration.",
  "honey": "A plain glass jar full of golden honey with a wooden honey dipper resting beside it, no label and no writing on the jar. Friendly nonfiction illustration.",
  "nectar": "A small yellow and black striped bee drinking nectar from a bright red flower. Friendly nonfiction illustration, the bee looks and acts like a real bee.",
  "bees": "Three yellow and black striped bees flying together above green grass and flowers. Friendly nonfiction illustration, the bees look and act like real bees."
};

export const whatsItAbout: LessonDef = {
  id: "whats-it-about",
  title: "What's It All About?",
  grade: "Kindergarten",
  standard: "RI.K.2",
  archetype: "story-elements",
  objective: "I can name what a book is all about and tell important facts.",
  concepts: ["main topic","key details","retell"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are an amazing Book Detective! You learned to find what a book is all about. And you can tell all the important facts from a book. Keep finding what it's all about!",
    "title": "Super Reader!",
    "body": "You found the main topic and key details!"
  },
  scenes: [
    {
      id: "hook-listen",
      purpose: "hook",
      gate: "interaction",
      prompt: "Listen for clues!",
      fx: {"text":"Listen for clues!","effect":"bubbles"},
      narration: { audio: A("hook-listen"), script: "Hello, Book Detectives! We have a mystery book today. Tap each clue card to hear a clue about our book." },
      interaction: { type: "listen", items: [{ label: "BUZZ", audio: W("buzz"), image: IMG("buzz") }, { label: "HIVE", audio: W("hive"), image: IMG("hive") }, { label: "HONEY", audio: W("honey"), image: IMG("honey") }] },
    },
    {
      id: "model-read-book",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Read the book with me.",
      fx: {"text":"whole book","effect":"pop-words"},
      narration: { audio: A("model-read-book"), script: "Great listening! Now, I will read our special book. Listen closely to find out what the whole book is about." },
      interaction: { type: "read-along", text: "Bees live in a hive. Bees buzz when they fly. Bees make sweet honey. Bees collect flower nectar.", audio: A("model-read-book-sentence") },
    },
    {
      id: "model-choose-topic",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find the main topic!",
      image: IMG("bees"),
      fx: {"text":"The **whole book** is about bees.","effect":"underline"},
      narration: { audio: A("model-choose-topic"), script: "Watch me find the main topic. Every page told about bees. The hive, the buzzing, the honey, the nectar. All bee facts! So the main topic is bees. The whole book is about bees. Careful, detectives. Honey is a detail. A detail is just one fact from the book. It is not the main topic." },
    },
    {
      id: "guided-listen-details",
      purpose: "guided",
      gate: "interaction",
      prompt: "Listen for important facts.",
      fx: {"text":"important details","effect":"glow"},
      narration: { audio: A("guided-listen-details"), script: "Now let's collect the important details about bees. These are the facts we learned. Tap each card to hear a detail." },
      interaction: { type: "listen", items: [{ label: "HIVE", audio: W("hive"), image: IMG("hive") }, { label: "BUZZ", audio: W("buzz"), image: IMG("buzz") }, { label: "HONEY", audio: W("honey"), image: IMG("honey") }, { label: "NECTAR", audio: W("nectar"), image: IMG("nectar") }] },
    },
    {
      id: "guided-sort-topic-details",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort topic and details.",
      fx: {"text":"sort them","effect":"wave"},
      narration: { audio: A("guided-sort-topic-details"), script: "We have many words from our bee book. Let's sort them into two groups. One group for the main topic, and one for the details." },
      interaction: { type: "sort", buckets: ["Topic","Details"], items: [{ label: "BEES", bucket: "Topic", audio: W("bees") }, { label: "HIVE", bucket: "Details", audio: W("hive") }, { label: "BUZZ", bucket: "Details", audio: W("buzz") }, { label: "HONEY", bucket: "Details", audio: W("honey") }, { label: "NECTAR", bucket: "Details", audio: W("nectar") }], coachWrong: "Remember, the main topic is what the whole book is about. Details are the facts." },
    },
    {
      id: "apply-sequence-details",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the bee facts.",
      fx: {"text":"Put the facts in order.","effect":"bounce"},
      narration: { audio: A("apply-sequence-details"), script: "Great sorting! Now let's retell the details like the book told them. Listen to our book again: Bees live in a hive. Bees buzz when they fly. Bees make sweet honey. Bees collect flower nectar. Now tap the facts in that order!" },
      interaction: { type: "sequence", items: [{ id: "hive", label: "HIVE", audio: W("hive"), image: IMG("hive") }, { id: "buzz", label: "BUZZ", audio: W("buzz"), image: IMG("buzz") }, { id: "honey", label: "HONEY", audio: W("honey"), image: IMG("honey") }, { id: "nectar", label: "NECTAR", audio: W("nectar"), image: IMG("nectar") }], order: ["hive","buzz","honey","nectar"], coachWrong: "Think about what we learned first in the book. What came next?" },
    },
    {
      id: "apply-choose-topic-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Find the main topic.",
      fx: {"text":"whole book","effect":"pop-words"},
      narration: { audio: A("apply-choose-topic-detail"), script: "Remember, the main topic is what the whole book is about. A detail is just one part. What is the main topic here?" },
      interaction: { type: "choose", options: [{ id: "bees", label: "BEES", audio: W("bees"), image: IMG("bees") }, { id: "hive", label: "HIVE", audio: W("hive"), image: IMG("hive") }, { id: "honey", label: "HONEY", audio: W("honey"), image: IMG("honey") }], correctId: "bees", coachWrong: "That is a detail, just one fact from the book. Think: what was the whole book about? Try again!" },
    },
    {
      id: "challenge-say-topic",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the main topic!",
      fx: {"text":"The **whole book** is about...","effect":"pop-words"},
      narration: { audio: A("challenge-say-topic"), script: "Challenge time, Book Detective! Think about our whole fact book. What is the whole book about? Press the mic and say the main topic out loud!" },
      interaction: { type: "speak", text: "bees" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a star!",
      fx: {"text":"Fantastic job, Book Detective!","effect":"rocket"},
      narration: { audio: A("celebrate-success"), script: "Fantastic job, Book Detective! You can find the main topic of a book. And you can tell all the important details." },
    },
  ],
};
