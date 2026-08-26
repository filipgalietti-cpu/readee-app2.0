import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./grammar-builders-timings.json";

// Grammar Builders (L.1.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=grammar-builders

const A = (id: string) => `/audio/lessons-v2/grammar-builders/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/grammar-builders/${w.toLowerCase()}.png`;

export const grammarBuildersImages: Record<string, string> = {
  "block-tower": "A smiling child stacking large colorful blank building blocks into a tower, plain soft sky-blue background, no letters, no words, no text.",
  "girl-reads-kids-play": "A girl sitting on grass reading an open book while two other children play with a ball nearby, sunny park, bright day, no letters, no words, no text.",
  // Quiz easier-band picture support:
  "pig-eating": "One happy cartoon pig eating from a small food trough, green meadow background, no letters, no words, no text.",
  "one-fox": "Exactly one orange cartoon fox running across a green meadow, no other animals, no letters, no words, no text.",
  "two-foxes": "Exactly two orange cartoon foxes running together side by side across a green meadow, no letters, no words, no text.",
  "boy-clapping": "One smiling cartoon boy standing and clapping his hands, plain soft sky-blue background, no letters, no words, no text."
};

export const grammarBuilders: LessonDef = {
  id: "grammar-builders",
  title: "Grammar Builders",
  grade: "1st Grade",
  standard: "L.1.1",
  archetype: "vocabulary",
  objective: "I can build sentences that sound right when I speak.",
  concepts: ["nouns match their verbs","pronouns stand in for names","complete sentences"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You built sentences that sound right. One dog runs. Two dogs run. Small words like he, she, it, and they can stand in for names. And a sentence tells who and what they do. Listen for sentences that sound right every time you talk.",
    "title": "Grammar Builders",
    "body": "Nouns match their verbs. He, she, it, and they stand in for names. A sentence tells who and what they do."
  },
  scenes: [
    {
      id: "hook-sound-right",
      purpose: "hook",
      gate: "interaction",
      prompt: "Sentences are built from words.",
      image: IMG("block-tower"),
      narration: { audio: A("hook-sound-right"), script: "Sentences are built out of words, like a tower is built out of blocks. When the words fit, the sentence sounds right. Read along with me." },
      interaction: { type: "read-along", text: "Words build sentences. When the words match, the sentence sounds right. Today you will build sentences that sound right.", audio: A("hook-sound-right-sentence") },
    },
    {
      id: "model-verb-match",
      purpose: "model",
      gate: "none",
      prompt: "The action word matches.",
      fx: {"text":"The **dog|dogs** **runs.|run.**","effect":"word-swap"},
      narration: { audio: A("model-verb-match"), script: "Listen. The dog runs. One dog, and the action word is runs. Now watch. The dogs run. More than one dog, and the action word changes to run. The action word matches how many. One dog runs. Two dogs run." },
    },
    {
      id: "guided-pick-verb-cats",
      purpose: "guided",
      gate: "interaction",
      prompt: "The cats ___ fast.",
      narration: { audio: A("guided-pick-verb-cats"), script: "This sentence has a hole in it. The cats, mmm, fast. Look at the sentence. Is it about one cat or more than one? Tap the action word that sounds right." },
      interaction: { type: "choose", options: [{ id: "run", label: "run" }, { id: "runs", label: "runs" }], correctId: "run", coachWrong: "How many cats are in this sentence? Say the sentence out loud with each word inside. Tap the one that sounds right." },
    },
    {
      id: "guided-pick-verb-bird",
      purpose: "guided",
      gate: "interaction",
      prompt: "The bird ___ up high.",
      narration: { audio: A("guided-pick-verb-bird"), script: "Here is another one. The bird, mmm, up high. How many birds is this sentence about? Tap the action word that sounds right." },
      interaction: { type: "choose", options: [{ id: "sings", label: "sings" }, { id: "sing", label: "sing" }], correctId: "sings", coachWrong: "This sentence is about just one bird. Say the sentence out loud with each word inside. Which one sounds right?" },
    },
    {
      id: "model-pronouns",
      purpose: "model",
      gate: "none",
      prompt: "Small words stand in for names.",
      fx: {"text":"he   she   it   they","effect":"pop-words"},
      narration: { audio: A("model-pronouns"), script: "Some small words can stand in for names. Ben hops. He hops. Rosa sings. She sings. The ball rolls. It rolls. The dogs bark. They bark. He, she, it, and they do the same job as a name." },
    },
    {
      id: "apply-pronoun-maya",
      purpose: "apply",
      gate: "interaction",
      prompt: "Maya kicks the ball. ___ kicks it far.",
      narration: { audio: A("apply-pronoun-maya"), script: "Read this with me. Maya kicks the ball. Mmm, kicks it far. The missing word stands in for Maya. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "she", label: "She" }, { id: "he", label: "He" }, { id: "it", label: "It" }], correctId: "she", coachWrong: "Read the first sentence again. Who kicks the ball? Tap the small word that can stand in for Maya." },
    },
    {
      id: "apply-pronoun-dogs",
      purpose: "apply",
      gate: "interaction",
      prompt: "The dogs dig. ___ dig fast.",
      narration: { audio: A("apply-pronoun-dogs"), script: "One more. The dogs dig. Mmm, dig fast. The missing word stands in for the dogs. Think about how many dogs there are. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "they", label: "They" }, { id: "he", label: "He" }, { id: "it", label: "It" }], correctId: "they", coachWrong: "The dogs means more than one. Which small word stands in for more than one? Tap it." },
    },
    {
      id: "model-complete",
      purpose: "model",
      gate: "none",
      prompt: "A sentence tells a whole idea.",
      fx: {"text":"The fish **swims**.","effect":"underline"},
      narration: { audio: A("model-complete"), script: "A sentence tells a whole idea. It needs a who and a what they do. The fish swims. That is a whole idea. But listen. The fish. That is not a sentence yet. What does the fish do? We do not know. Something is missing." },
    },
    {
      id: "apply-sort-complete",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Is it a whole sentence? Sort each one.",
      narration: { audio: A("apply-sort-complete"), script: "Time to sort. Read each card. Ask yourself, does it tell who, and what they do? If it tells the whole idea, it goes under Complete. If a part is missing, it goes under Not Yet." },
      interaction: { type: "sort", buckets: ["Complete","Not Yet"], items: [{ label: "the cat naps", bucket: "Complete" }, { label: "he hops", bucket: "Complete" }, { label: "they sing", bucket: "Complete" }, { label: "the little dog", bucket: "Not Yet" }, { label: "runs and jumps", bucket: "Not Yet" }, { label: "in the box", bucket: "Not Yet" }], coachWrong: "Read that card again. Does it tell who? Does it tell what they do? It needs both parts to be complete." },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud: She reads and they play.",
      image: IMG("girl-reads-kids-play"),
      narration: { audio: A("apply-speak-sentence"), script: "This sentence uses two of your small stand-in words. It is on your screen. Tap the mic and read it out loud in a clear voice." },
      interaction: { type: "speak", text: "She reads and they play" },
    },
    {
      id: "challenge-fix-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Build the sentence so it sounds right.",
      narration: { audio: A("challenge-fix-sentence"), script: "These words got all mixed up. Put them in order to build a complete sentence. Start with who it is about, then tell what it does. Tap the words in order." },
      interaction: { type: "sequence", items: [{ id: "jumps", label: "jumps" }, { id: "the", label: "The" }, { id: "frog", label: "frog" }, { id: "up", label: "up" }], order: ["the","frog","jumps","up"], coachWrong: "Who is this sentence about? That part comes first. What does it do? That part comes next." },
    },
    {
      id: "challenge-speak-finish",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Finish it: The frog ___.",
      narration: { audio: A("challenge-speak-finish"), script: "Last one. Now you finish a sentence out loud. One frog. The frog, mmm. Think of an action word that sounds right for one frog. Tap the mic and say the whole sentence." },
      interaction: { type: "speak", text: "jumps hops swims sits naps eats runs sleeps croaks leaps" },
    },
    {
      id: "celebrate-grammar",
      purpose: "celebrate",
      gate: "none",
      prompt: "You build sentences that sound right!",
      fx: {"text":"You build sentences that **sound right**!","effect":"fireworks"},
      narration: { audio: A("celebrate-grammar"), script: "Great building! One dog runs, two dogs run. He, she, it, and they stand in for names. And every sentence tells who, and what they do. Now your sentences sound just right." },
    },
  ],
};
