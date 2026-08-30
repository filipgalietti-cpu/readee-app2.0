import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-word-finder-timings.json";

// Fact Word Finder (RI.1.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-word-finder

const A = (id: string) => `/audio/lessons-v2/fact-word-finder/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-word-finder/${w.toLowerCase()}.png`;

export const factWordFinderImages: Record<string, string | { subject: string; ref?: string }> = {
  "camel": "A tan camel with one hump standing on golden desert sand under a clear blue sky, friendly nonfiction illustration, the camel looks and acts like a real camel, no clothing, no text anywhere",
  "camel-desert": { subject: "A tan camel walking across wide golden sand dunes in a hot sunny desert, bright sun high in a clear blue sky, no clothing, no text anywhere", ref: "camel" },
  "camel-hump": { subject: "A tan camel seen from the side with one big rounded hump on its back, standing on flat golden desert sand, no clothing, no text anywhere", ref: "camel" },
  "camel-drink": { subject: "A tan camel bending its neck down to drink water from a small clear desert pool, a few green palm trees behind it and golden sand all around, no clothing, no text anywhere", ref: "camel" }
};

export const factWordFinder: LessonDef = {
  id: "fact-word-finder",
  title: "Fact Word Finder",
  grade: "1st Grade",
  standard: "RI.1.4",
  archetype: "vocabulary",
  objective: "I can ask and answer questions about new words in a fact book.",
  concepts: ["stop at a new science word","ask your own question","use sentence clues","use picture clues"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a fact word finder you are! You stopped at new science words, asked your own questions, and answered them with the sentence and the picture. Keep asking word questions every time you read!",
    "title": "You Found the Word Facts!",
    "body": "You asked your own questions about desert, hump, store, and thrive, and you answered every one with clues from a true camel book."
  },
  scenes: [
    {
      id: "hook-meet-the-camel",
      purpose: "hook",
      gate: "none",
      prompt: "Let's read true camel facts!",
      image: IMG("camel"),
      narration: { audio: A("hook-meet-the-camel"), script: "Hello, reader! Today we open a fact book about camels, and every fact in it is true. Fact books are full of science words. When you hit a new word, do not skip it. Stop and ask your own question, like, I wonder what that word means? Then use the sentence and the picture to answer your own question. Let's try it together." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read page one with me.",
      image: IMG("camel-desert"),
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our fact book. Read along with me, and watch for a science word." },
      interaction: { type: "read-along", text: "A camel lives in the desert. The desert is hot, dry land with lots of sand and very little rain.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-ask-desert",
      purpose: "model",
      gate: "none",
      prompt: "Stop and ask your own question.",
      fx: {"text":"I wonder, what is a **desert**?","effect":"glow"},
      narration: { audio: A("model-ask-desert"), script: "Watch me be a word finder. Page one says a camel lives in the desert. Desert. I stop right there and ask my own question. I wonder, what is a desert? Now I answer my question. The next sentence says it is hot, dry land with lots of sand and very little rain. The picture shows golden sand under a bright sun. So a desert is a hot, dry, sandy place. I asked a question, and the book helped me answer it!" },
    },
    {
      id: "apply-read-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two with me.",
      image: IMG("camel-hump"),
      narration: { audio: A("apply-read-page-two"), script: "Page two tells about something on the camel's back. Read it with me, and get ready to stop at a new word." },
      interaction: { type: "read-along", text: "A camel has a big hump on its back. The hump is packed with fat. When food is hard to find, the camel lives off this fat for days.", audio: A("apply-read-page-two-sentence") },
    },
    {
      id: "guided-pick-question",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question should you ask?",
      image: IMG("camel-hump"),
      narration: { audio: A("guided-pick-question"), script: "Hump. There is our new science word. A word finder stops and asks a question about it. Which question will help you figure out the word hump? Tap it." },
      interaction: { type: "choose", options: [{ id: "ask-hump", label: "what does hump mean?" }, { id: "who-made", label: "who made this book?" }, { id: "pages-left", label: "how many pages are left?" }], correctId: "ask-hump", coachWrong: "A word finder asks about the new word they just found, not about the book. Try again!" },
    },
    {
      id: "guided-answer-hump",
      purpose: "guided",
      gate: "interaction",
      prompt: "Answer your question. What is a hump?",
      fx: {"text":"A camel has a big hump on its back. The hump is **packed with fat**.","effect":"underline"},
      narration: { audio: A("guided-answer-hump"), script: "You asked, what does hump mean? Now answer your own question with the book's clues. Page two says, a camel has a big hump on its back. The hump is packed with fat. So what is a hump? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "pack-of-fat", label: "a pack of fat" }, { id: "bag-of-water", label: "a bag of water" }, { id: "hard-shell", label: "a hard shell" }], correctId: "pack-of-fat", coachWrong: "Read the clue on the screen one more time. What does the book say is inside the hump? Try again!" },
    },
    {
      id: "apply-speak-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three aloud: A camel can store water in its body.",
      image: IMG("camel-drink"),
      narration: { audio: A("apply-speak-page-three"), script: "Page three is short, and it is all yours. Tap the mic and read page three out loud." },
      interaction: { type: "speak", text: "A camel can store water in its body" },
    },
    {
      id: "apply-find-clue-store",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which clue answers your question?",
      fx: {"text":"It drinks fast, then treks for days with **no drink**.","effect":"underline"},
      narration: { audio: A("apply-find-clue-store"), script: "Store. Did you stop at that science word? Ask your question. I wonder, what does store mean? The book gives one more clue. It drinks fast, then treks for days with no drink. Which words from the book help answer your question? Tap them." },
      interaction: { type: "choose", options: [{ id: "treks-no-drink", label: "treks for days with no drink" }, { id: "hump-on-back", label: "a big hump on its back" }, { id: "lots-of-sand", label: "lots of sand" }], correctId: "treks-no-drink", coachWrong: "Ask your question again. Which words tell what the camel can do after it drinks? Try again!" },
    },
    {
      id: "apply-answer-store",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does store mean here?",
      fx: {"text":"A camel can **store** water in its body.","effect":"glow"},
      narration: { audio: A("apply-answer-store"), script: "Now answer your own question. The camel drinks fast, stores water in its body, and then treks for days with no drink. So what does store mean here? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "keep-for-later", label: "keep it for later" }, { id: "shop-for-toys", label: "a shop for toys" }, { id: "spill-it-out", label: "spill it out" }], correctId: "keep-for-later", coachWrong: "Use the clues. The camel drinks a lot now, and it has no drink for days after that. What must it be doing with that water? Try again!" },
    },
    {
      id: "challenge-thrive",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Ask and answer: what does thrive mean?",
      fx: {"text":"A cactus can **thrive** in the hot desert. It grows tall and stays green with little rain.","effect":"underline"},
      narration: { audio: A("challenge-thrive"), script: "Challenge time! Here are two new true facts from our desert. A cactus can thrive in the hot desert. It grows tall and stays green with little rain. Stop at the science word. Ask your own question, then answer it with the clues. What does thrive mean? Tap it." },
      interaction: { type: "choose", options: [{ id: "grow-well", label: "grow well" }, { id: "dry-up", label: "dry up" }, { id: "hide-away", label: "hide away" }, { id: "shrink-down", label: "shrink down" }], correctId: "grow-well", coachWrong: "Ask your question, then look at what the cactus does in the clues. Try again!" },
    },
    {
      id: "challenge-speak-hump",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: What is a camel's hump full of?",
      image: IMG("camel-hump"),
      narration: { audio: A("challenge-speak-hump"), script: "Last challenge! Think back to our fact book. You asked, what does hump mean? Now say your answer out loud. What is a camel's hump packed with? Tap the mic and tell me." },
      interaction: { type: "speak", text: "fat lump lumps" },
    },
    {
      id: "celebrate-fact-word-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You asked and answered!",
      fx: {"text":"You are a **fact word finder**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-word-finder"), script: "You did it! You stopped at new science words, asked your own questions, and answered them with the sentence and the picture. Desert, hump, store, and thrive. You figured them all out. Keep asking word questions every time you read!" },
    },
  ],
};
