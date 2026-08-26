import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sentence-shapes-timings.json";

// Sentence Shapes (RF.1.1a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// G1 PILOT: first 1st-Grade lesson; the felt step-up = kid READS sentences.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sentence-shapes

const A = (id: string) => `/audio/lessons-v2/sentence-shapes/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sentence-shapes/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sentence-shapes/${w.toLowerCase()}.png`;

export const sentenceShapesImages: Record<string, string> = {
  "captain": "friendly cartoon space captain, bright suit, no text anywhere",
  "star": "shining gold star",
};

export const sentenceShapes: LessonDef = {
  id: "sentence-shapes",
  title: "Sentence Shapes",
  grade: "1st Grade",
  standard: "RF.1.1a",
  archetype: "print-concepts",
  objective: "I can spot what makes a sentence just right!",
  concepts: ["capital letters", "spaces between words", "end punctuation", "fixing sentences"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are an amazing sentence builder! Every sentence starts with a capital letter, keeps spaces between its words, and ends with a stop mark. Look for those three shapes every time you read and write!",
    "title": "Mission Accomplished!",
    "body": "You built perfect sentences with Captain Comet!"
  },
  scenes: [
    {
      id: "intro-hook",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Captain Comet!",
      image: IMG("captain"),
      narration: { audio: A("intro-hook"), script: "Hello, sentence builder! This is Captain Comet. Some of his sentences broke on the way to Earth. Today you will learn the three shapes every sentence needs, and then you will fix his sentences." },
    },
    {
      id: "sentence-read-along",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read with me.",
      narration: { audio: A("sentence-read-along"), script: "A sentence is a group of words that tells a whole idea. Read this one with me." },
      interaction: { type: "read-along", text: "The dog ran to the park.", audio: A("sentence-read-along-sentence") },
    },
    {
      id: "model-capital-letter",
      purpose: "model",
      gate: "none",
      prompt: "Shape one: the capital letter.",
      fx: { "text": "**The** dog ran.", "effect": "underline" },
      narration: { audio: A("model-capital-letter"), script: "Shape one. Every sentence starts with a capital letter. Look at this sentence. The word The starts with a big, tall T. That capital letter says, a sentence starts here!" },
    },
    {
      id: "guided-capital-letter",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that could START a sentence.",
      narration: { audio: A("guided-capital-letter"), script: "Your turn. Look closely at how each word is written. Tap the word that starts with a capital letter." },
      interaction: { type: "choose", options: [{ id: "the-cap", label: "The" }, { id: "sun-low", label: "sun" }, { id: "the-low", label: "the" }], correctId: "the-cap", coachWrong: "Look at the very first letter of each word. A capital letter stands big and tall." },
    },
    {
      id: "model-spaces",
      purpose: "model",
      gate: "none",
      prompt: "Shape two: spaces between words.",
      fx: { "text": "The dog ran.", "effect": "pop-words" },
      narration: { audio: A("model-spaces"), script: "Shape two. Words need spaces between them. Watch the words land one at a time. The space between each word keeps them from bumping together, so your eyes can read each one." },
    },
    {
      id: "guided-spaces",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is a real sentence?",
      narration: { audio: A("guided-spaces"), script: "One of these has spaces, and one is all squished. Read them both. Tap the one that is a real sentence." },
      interaction: { type: "choose", options: [{ id: "with-spaces", label: "The cat sat." }, { id: "no-spaces", label: "Thecatsat." }], correctId: "with-spaces", coachWrong: "Try to read the squished one. It is hard! Spaces make a sentence easy to read." },
    },
    {
      id: "model-end-punctuation",
      purpose: "model",
      gate: "none",
      prompt: "Shape three: the stop mark.",
      fx: { "text": "The dog **ran.**", "effect": "circle" },
      narration: { audio: A("model-end-punctuation"), script: "Shape three. Every sentence ends with a stop mark. A period ends a telling sentence. A question mark ends an asking sentence. An exclamation point ends an excited sentence!" },
    },
    {
      id: "guided-end-punctuation",
      purpose: "guided",
      gate: "interaction",
      prompt: "The cat naps",
      narration: { audio: A("guided-end-punctuation"), script: "Listen. The cat naps. That sentence TELLS us something, nice and calm. Tap the stop mark it needs." },
      interaction: { type: "choose", options: [{ id: "period", label: ".", audio: W("period") }, { id: "question", label: "?", audio: W("question-mark") }, { id: "exclaim", label: "!", audio: W("exclamation-point") }], correctId: "period", coachWrong: "Is that sentence telling, asking, or shouting? Listen to it again." },
    },
    {
      id: "speak-perfect-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it aloud: The sun is hot",
      narration: { audio: A("speak-perfect-sentence"), script: "This sentence has all three shapes. Now you read it! Tap the mic and read the sentence out loud." },
      interaction: { type: "speak", text: "The sun is hot" },
    },
    {
      id: "apply-fix-sentence-1",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Fix Captain Comet's sentence!",
      narration: { audio: A("apply-fix-sentence-1"), script: "Captain Comet's sentence broke into pieces! Use the shapes you know. The capital letter starts the sentence, and the stop mark ends it. Tap the pieces in order." },
      interaction: { type: "sequence", items: [{ id: "ran", label: "ran", audio: W("ran") }, { id: "the", label: "The", audio: W("the") }, { id: "dog", label: "dog", audio: W("dog") }, { id: "period", label: ".", audio: W("period") }], order: ["the", "dog", "ran", "period"], coachWrong: "Which piece starts with a capital letter? That one goes first. Which piece is a stop mark? That one goes last." },
    },
    {
      id: "speak-fixed-sentence-1",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read your sentence: The dog ran",
      narration: { audio: A("speak-fixed-sentence-1"), script: "You fixed it! Now read your sentence out loud so Captain Comet can hear it. Tap the mic." },
      interaction: { type: "speak", text: "The dog ran" },
    },
    {
      id: "challenge-fix-sentence-2",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Fix this asking sentence all by yourself!",
      narration: { audio: A("challenge-fix-sentence-2"), script: "Last one, and it is all yours. This broken sentence ASKS something. Build it so every shape is in the right place." },
      interaction: { type: "sequence", items: [{ id: "she", label: "she", audio: W("she") }, { id: "happy", label: "happy", audio: W("happy") }, { id: "is-cap", label: "Is", audio: W("is") }, { id: "question", label: "?", audio: W("question-mark") }], order: ["is-cap", "she", "happy", "question"], coachWrong: "An asking sentence still starts with a capital letter and ends with its own special mark." },
    },
    {
      id: "celebrate-sentence-shapes",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a sentence builder!",
      fx: { "text": "You build **perfect** sentences!", "effect": "fireworks" },
      narration: { audio: A("celebrate-sentence-shapes"), script: "Amazing work, sentence builder! You found all three sentence shapes. A capital letter at the start, spaces between the words, and a stop mark at the end. Captain Comet's sentences are safe with you!" },
    },
  ],
};
