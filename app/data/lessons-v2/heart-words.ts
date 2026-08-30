import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./heart-words-timings.json";

// Heart Words (RF.2.3f) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=heart-words

const A = (id: string) => `/audio/lessons-v2/heart-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/heart-words/${w.toLowerCase()}.png`;

export const heartWordsImages: Record<string, string> = {
  "swap-rug": "Children sitting together on a big round colorful rug in a bright classroom with stacks of colorful books around them, happy faces, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  // Quiz easier-band picture support:
  "come-wave": "A smiling child waving one hand to invite a friend over, sunny park background, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "heart-hug": "A happy child hugging a big soft red heart shaped pillow, plain soft background, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "soup-bowl": "A warm bowl of orange soup with gentle steam curls on a wooden table, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "owl-night": "A friendly brown owl perched on a tree branch under a starry night sky, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
};

export const heartWords: LessonDef = {
  id: "heart-words",
  title: "Heart Words",
  grade: "2nd Grade",
  standard: "RF.2.3f",
  archetype: "phonics",
  objective: "I can read heart words by sounding out the fair parts and knowing the tricky part by heart.",
  concepts: [
    "a heart word mostly plays fair, but one part breaks the sounding out rules",
    "sound out the fair parts, learn the tricky part by heart",
    "friend, people, enough, busy, again, pretty, once",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You cracked seven heart words today. Friend, people, enough, busy, again, pretty, and once. You sound out the parts that play fair, and you know each tricky part by heart. Watch for heart words in every book you read, and read them like old friends.",
    title: "Heart Word Reader!",
    body: "friend, people, enough, busy, again, pretty, once. You know the tricky parts by heart!",
  },
  scenes: [
    {
      id: "hook-book-swap",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the story. Some words will not play fair.",
      narration: { audio: A("hook-book-swap"), script: "Here is a story about a book swap. Hidden inside it are words that do not play fair. You cannot sound them out the usual way. Read along with me, and notice which words surprise you." },
      interaction: { type: "read-along", text: "Once a month, our class holds a book swap. My friend Dee brings a huge box of books. Busy helpers set them out in neat rows. People from every class stop by to trade. The pretty covers make it hard to pick just one. Soon there are not enough seats, so we sit on the rug. Again and again, we swap until each book finds a new home.", audio: A("hook-book-swap-sentence") },
    },
    {
      id: "model-heart-words",
      purpose: "model",
      gate: "none",
      prompt: "Most of the word plays fair. One part breaks the rules.",
      fx: { text: "Sound out the fair parts. Learn the **tricky part** by heart.", effect: "underline" },
      narration: { audio: A("model-heart-words"), script: "Some story words were rule breakers. Listen. Friend. People. Enough. If you sound them out letter by letter, they come out wrong. Readers call them heart words. Most of a heart word plays fair, so you sound that part out. One part breaks the rules, and that part you learn by heart." },
    },
    {
      id: "model-friend",
      purpose: "model",
      gate: "none",
      prompt: "Find the tricky part of friend.",
      fx: { text: "**friend**", effect: "glow" },
      narration: { audio: A("model-friend"), script: "Look at friend. The letters f and r play fair. The n and d at the end play fair too. The tricky part hides in the middle. In friend, the letters i e just say eh, so friend rhymes with end and bend. That middle part is the part to learn by heart. Friend." },
    },
    {
      id: "guided-choose-pretty",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the part of **pretty** that breaks the rules.",
      narration: { audio: A("guided-choose-pretty"), script: "The story said the pretty covers made it hard to pick. Say pretty out loud. Listen to each sound you say. Now look at the four parts of pretty. Three parts say just what their letters promise. One part does not. Tap the rule breaker." },
      interaction: { type: "choose", options: [{ id: "pr", label: "pr" }, { id: "e", label: "e" }, { id: "tt", label: "tt" }, { id: "y", label: "y" }], correctId: "e", coachWrong: "Say pretty slowly. Then make the sound of the part you tapped. Do they match? Find the part that does not match what you say." },
    },
    {
      id: "model-once-people",
      purpose: "model",
      gate: "none",
      prompt: "Two more heart words from the story.",
      fx: { text: "**once** and **people**", effect: "pop-words" },
      narration: { audio: A("model-once-people"), script: "Here are two more heart words from the story. Look at once. o, n, c, e. If those letters played fair, it would start with an o sound. But we say once with a w sound at the start, like the w in win. There is no w in it at all! You know its little cousin, one. Once means one time. Now look at people. Say people. Both p sounds play fair, and the l plays fair. The middle is the tricky part. The letters e o together just say ee. People." },
    },
    {
      id: "guided-highlight-breakers",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the two words that break the rules.",
      image: IMG("swap-rug"),
      narration: { audio: A("guided-highlight-breakers"), script: "Back to our book swap. Read this sentence to yourself. Most of its words play fair and sound out cleanly. Two words break the rules. Tap both rule breakers." },
      interaction: { type: "highlight", text: "Once the people sat down.", targets: ["once", "people"], coachWrong: "Sound out the word you tapped. If the letters match what you say, that word plays fair. Find the words that do not match their letters." },
    },
    {
      id: "apply-choose-enough",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which card spells the sounds we really say in **enough**?",
      narration: { audio: A("apply-choose-enough"), script: "The story said there were not enough seats. Say enough out loud. Now sound out each card, nice and slow. Tap the card that spells the sounds you really say." },
      interaction: { type: "choose", options: [{ id: "ee-nuff", label: "ee nuff" }, { id: "ee-now", label: "ee now" }, { id: "en-oog", label: "en oog" }, { id: "en-oh", label: "en oh" }], correctId: "ee-nuff", coachWrong: "Sound out the card you tapped. Then say enough again. Do they match? Try each card until one matches your mouth." },
    },
    {
      id: "apply-sort-heart",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sound it out, or know it by heart? Sort each word.",
      narration: { audio: A("apply-sort-heart"), script: "Sort time. Read each word card. If you can sound it out and it comes out right, drag it to Plays Fair. If one part breaks the rules and you must know it by heart, drag it to By Heart." },
      interaction: { type: "sort", buckets: ["By Heart", "Plays Fair"], items: [{ label: "busy", bucket: "By Heart" }, { label: "trade", bucket: "Plays Fair" }, { label: "again", bucket: "By Heart" }, { label: "stack", bucket: "Plays Fair" }, { label: "friend", bucket: "By Heart" }, { label: "shelf", bucket: "Plays Fair" }], coachWrong: "Sound out the card slowly, letter by letter. Does it match how you really say the word? Let that tell you its bucket." },
    },
    {
      id: "apply-speak-friend",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word aloud: friend",
      narration: { audio: A("apply-speak-friend"), script: "Time to read out loud. This heart word hides the letters i e in its middle, and they just say eh. Read it in a clear, strong voice." },
      interaction: { type: "speak", text: "friend friends" },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the whole sentence out loud.",
      narration: { audio: A("challenge-speak-sentence"), script: "Here is your big read. This sentence holds three heart words you learned today. Read the whole sentence out loud, nice and smooth." },
      interaction: { type: "speak", text: "People say my friend is busy" },
    },
    {
      id: "challenge-choose-again",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the rule breaker.",
      narration: { audio: A("challenge-choose-again"), script: "Last challenge. All four words hold the letters a i. In three of them, a i plays fair and says ay. In one word, it breaks the rules and says something else. Sound out each word, then tap the rule breaker." },
      interaction: { type: "choose", options: [{ id: "again", label: "again" }, { id: "rain", label: "rain" }, { id: "paint", label: "paint" }, { id: "train", label: "train" }], correctId: "again", coachWrong: "Say each word out loud, the real way you say it. In which one do the letters a i not say ay?" },
    },
    {
      id: "celebrate-heart-words",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You know them by heart!",
      fx: { text: "You know them **by heart**!", effect: "fireworks" },
      narration: { audio: A("celebrate-heart-words"), script: "Great reading. Friend, people, enough, busy, again, pretty, once. Seven heart words. Most of each word plays fair, and the tricky part you now know by heart. When one of them pops up in your book, you will read it without a single stumble." },
    },
  ],
};
