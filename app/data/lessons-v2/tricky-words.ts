import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./tricky-words-timings.json";

// Tricky Words (RF.1.3g) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=tricky-words

const A = (id: string) => `/audio/lessons-v2/tricky-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/tricky-words/${w.toLowerCase()}.png`;

export const trickyWordsImages: Record<string, string> = {
  "book-look": "A smiling child holding a magnifying glass up to an open storybook in a cozy reading corner, warm light, no letters, no words, no text.",
  "one-balloon": "One single red balloon floating on a plain soft sky-blue background, no letters, no numbers, no words, no text.",
  "kids-tag": "Three happy children playing tag together in a sunny green park, no letters, no words, no text.",
  "red-hen": "One plump red cartoon hen sitting on green grass in a sunny farmyard, no letters, no words, no text.",
  "park-fun": "Two happy children laughing on a seesaw in a sunny park, blue sky, no letters, no words, no text.",
  // Quiz easier-band picture support:
  "two-cookies": "Exactly two round chocolate chip cookies side by side on a small blue plate, plain background, no letters, no numbers, no words, no text.",
  "say-hi": "A smiling cartoon girl waving hello with an empty white speech bubble above her head, plain soft background, no letters, no words, no text."
};

export const trickyWords: LessonDef = {
  id: "tricky-words",
  title: "Tricky Words",
  grade: "1st Grade",
  standard: "RF.1.3g",
  archetype: "phonics",
  objective: "I can read tricky words that break the sounding out rules.",
  concepts: ["said","was","one","two","they","there","would","could"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You learned the secret of tricky words. Said, was, one, two, they, there, would. Their letters do not say what you expect, so you read them by heart. Every time you spot one in a book, you will know it in a snap!",
    "title": "Tricky Word Reader",
    "body": "Said, was, one, two, they, there, would. You read them all by heart!"
  },
  scenes: [
    {
      id: "hook-rule-breakers",
      purpose: "hook",
      gate: "interaction",
      prompt: "Some words do not play fair.",
      image: IMG("book-look"),
      narration: { audio: A("hook-rule-breakers"), script: "You are great at sounding out words. But some words do not play fair. Their letters do not say what you expect, so sounding out does not work. We call them tricky words, and we read them by heart. Read along with me." },
      interaction: { type: "read-along", text: "Some words break the sounding out rules. We learn them by heart and read them in a snap.", audio: A("hook-rule-breakers-sentence") },
    },
    {
      id: "model-said",
      purpose: "model",
      gate: "none",
      prompt: "This word breaks the rules.",
      fx: {"text":"**said**","effect":"glow"},
      narration: { audio: A("model-said"), script: "Look at this word. Its letters are s, a, i, d. If the letters played fair, a-i would say ay, like in rain, and the word would rhyme with paid. But it does not. This word says said. Said rhymes with red. The letters do not say what you expect, so you learn it by heart. Said." },
    },
    {
      id: "model-was",
      purpose: "model",
      gate: "none",
      prompt: "Here is another rule breaker.",
      fx: {"text":"**was**","effect":"glow"},
      narration: { audio: A("model-was"), script: "Here is another rule breaker. Its letters are w, a, s. If you sound it out, the word would rhyme with gas. But no. This word says was. Was rhymes with buzz. The letter a is not saying its usual sound. You just know this word. Was." },
    },
    {
      id: "guided-real-way-was",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which card shows how we really say **was**?",
      narration: { audio: A("guided-real-way-was"), script: "Let's check that tricky word. Say the word was out loud. Now look at the two cards. One card spells the sounds the letters pretend to make. The other card spells the sounds we really say. Sound out each card, and tap the one that sounds like was." },
      interaction: { type: "choose", options: [{ id: "wuz", label: "wuz" }, { id: "wass", label: "wass" }], correctId: "wuz", coachWrong: "Sound out each card slowly. Then say the real word out loud. Tap the card that matches what your mouth says." },
    },
    {
      id: "model-one-two",
      purpose: "model",
      gate: "none",
      prompt: "Even number words can be tricky.",
      fx: {"text":"**one** and **two**","effect":"pop-words"},
      narration: { audio: A("model-one-two"), script: "Even number words can be tricky. Look at o, n, e. You would expect it to start with an o sound. But this word is one. It starts with a w sound, and there is no letter w in it at all! Now look at t, w, o. It has a letter w you cannot hear. The word just says two. Sneaky letters! You know these words by heart. One. Two." },
    },
    {
      id: "guided-find-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the number word.",
      image: IMG("one-balloon"),
      narration: { audio: A("guided-find-one"), script: "One red balloon. You know the number word one. One of these cards spells it. Be careful, the cards look almost the same. Look at every letter, and tap the word that says one." },
      interaction: { type: "choose", options: [{ id: "one", label: "one" }, { id: "on", label: "on" }, { id: "own", label: "own" }], correctId: "one", coachWrong: "Look closely at all the letters on each card. Say the number out loud, then check every card again before you tap." },
    },
    {
      id: "apply-find-they",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word you hear.",
      image: IMG("kids-tag"),
      narration: { audio: A("apply-find-they"), script: "Listen closely. Find the word they. As in, they play tag in the park. The word they is tricky, because its letters do not sound it out right. The cards look almost the same, so check every letter before you tap." },
      interaction: { type: "choose", options: [{ id: "they", label: "they" }, { id: "them", label: "them" }, { id: "then", label: "then" }], correctId: "they", coachWrong: "Say the word on the card you tapped. Does its ending match the word you heard? Check the last letters and try again." },
    },
    {
      id: "apply-spot-tricky",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the two words that break the rules.",
      image: IMG("red-hen"),
      narration: { audio: A("apply-spot-tricky"), script: "Read this sentence to yourself. Most of its words play fair. You can sound them out. But two words do not say what their letters show. Tap both tricky words." },
      interaction: { type: "highlight", text: "One red hen sat there.", targets: ["one","there"], coachWrong: "Sound out the word you tapped. If the letters match what you say, that word plays fair. Find the words that do not match their letters." },
    },
    {
      id: "model-would",
      purpose: "model",
      gate: "none",
      prompt: "This long word is a rule breaker too.",
      fx: {"text":"**would**","effect":"glow"},
      narration: { audio: A("model-would"), script: "Here is a long rule breaker. w, o, u, l, d. So many letters! But the word just says would. It sounds exactly like the wood a tree is made of. The letter l is silent, and o-u does not say ow. Its friend could works the same way. You read would and could by heart." },
    },
    {
      id: "apply-speak-would",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word out loud.",
      narration: { audio: A("apply-speak-would"), script: "Your turn to read. A tricky word you just learned is on your screen. Read it out loud in a clear, strong voice." },
      interaction: { type: "speak", text: "would" },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the whole sentence out loud.",
      image: IMG("park-fun"),
      narration: { audio: A("challenge-speak-sentence"), script: "Here is your big read. This sentence is full of tricky words you learned today. Read the whole sentence out loud, nice and smooth." },
      interaction: { type: "speak", text: "They said it was fun" },
    },
    {
      id: "challenge-sort-tricky",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sound it out, or know it by heart? Sort each word.",
      narration: { audio: A("challenge-sort-tricky"), script: "Last job! Read each word card. If the letters play fair and you can sound it out, send it to Sound Out. If the letters do not say what you expect, it is a word you know by heart. Send it to Tricky Words." },
      interaction: { type: "sort", buckets: ["Tricky Words","Sound Out"], items: [{ label: "said", bucket: "Tricky Words" }, { label: "two", bucket: "Tricky Words" }, { label: "would", bucket: "Tricky Words" }, { label: "jump", bucket: "Sound Out" }, { label: "cup", bucket: "Sound Out" }, { label: "hand", bucket: "Sound Out" }], coachWrong: "Sound out that card slowly, letter by letter. Does it match how you really say the word? Let that tell you which bucket it belongs in." },
    },
    {
      id: "celebrate-tricky-words",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read the rule breakers!",
      fx: {"text":"You read the rule breakers!","effect":"fireworks"},
      narration: { audio: A("celebrate-tricky-words"), script: "You did it! Said, was, one, two, they, there, would. Those words break the sounding out rules, and now you read them by heart. Every time one pops up in a book, you will know it in a snap!" },
    },
  ],
};
