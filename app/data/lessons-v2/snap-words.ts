import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./snap-words-timings.json";

// Snap Words (RF.K.3c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=snap-words

const A = (id: string) => `/audio/lessons-v2/snap-words/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/snap-words/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/snap-words/${w.toLowerCase()}.png`;

export const snapWordsImages: Record<string, string> = {
  "snap": "a finger snapping with a sparkle effect",
  "map": "a rolled-up treasure map with a compass rose",
  "bin": "a pair of red binoculars pointing forward",
  "tree": "a tall green tree with a sturdy brown trunk",
  "frog": "a happy green frog sitting on a lily pad",
  "bird": "a small blue bird with outstretched wings flying",
  "path": "a winding dirt path leading into a forest",
  "tent": "a small, cozy red camping tent in a grassy field",
  "fire": "a small campfire with orange and yellow flames and logs",
  "star": "a shiny, bright yellow star with five points"
};

export const snapWords: LessonDef = {
  id: "snap-words",
  title: "Snap Words",
  grade: "Kindergarten",
  standard: "RF.K.3c",
  archetype: "phonics",
  objective: "You will learn to read special words super fast, like a snap!",
  concepts: ["the","of","to","you","she","my","is","are","do","does"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a fantastic Snap Word explorer! You learned to read 'the', 'of', and 'to' in a flash. Keep practicing these words, and you'll be reading even more super fast!",
    "title": "Snap Word Champion!",
    "body": "You mastered reading your first Snap Words!"
  },
  scenes: [
    {
      id: "snap-word-intro",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Let's find Snap Words!",
      narration: { audio: A("snap-word-intro"), script: "Hello explorer! I'm Scout, and we're going on a Snap Word Safari today. Snap Words are super speedy words we read in a flash. Let's listen to our safari song!" },
      interaction: { type: "read-along", text: "Snap words are quick, snap words are fun. Read them fast, every one! The, of, to, you'll see. Snap words are for you and me!", audio: A("snap-word-intro-sentence") },
    },
    {
      id: "model-the",
      purpose: "model",
      gate: "interaction",
      prompt: "Tap to hear **the**.",
      image: IMG("map"),
      narration: { audio: A("model-the"), script: "Our first Snap Word is 'the'. We read it fast, no sounding out needed. Tap the word and listen to me say 'the'." },
      interaction: { type: "listen", items: [{ label: "THE", audio: W("the") }] },
    },
    {
      id: "guided-the",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap to read **the**.",
      image: IMG("bin"),
      narration: { audio: A("guided-the"), script: "Great job! Now it's your turn to read 'the'. Tap the word 'the' to hear it. Remember, it's a Snap Word, so read it fast!" },
      interaction: { type: "choose", options: [{ id: "the", label: "THE", audio: W("the") }, { id: "cat", label: "CAT", audio: W("cat") }, { id: "dog", label: "DOG", audio: W("dog") }], correctId: "the", coachWrong: "Almost! That word is not 'the'. Look closely and tap 'the'." },
    },
    {
      id: "model-of",
      purpose: "model",
      gate: "interaction",
      prompt: "Tap to hear **of**.",
      image: IMG("tree"),
      narration: { audio: A("model-of"), script: "You found 'the'! Here is another Snap Word. This word is 'of'. Tap the word and listen to me say 'of'." },
      interaction: { type: "listen", items: [{ label: "OF", audio: W("of") }] },
    },
    {
      id: "guided-of",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap to read **of**.",
      image: IMG("frog"),
      narration: { audio: A("guided-of"), script: "Super listening! Now you try to read 'of'. Tap the word 'of' to hear it. Can you say it like a snap?" },
      interaction: { type: "choose", options: [{ id: "of", label: "OF", audio: W("of") }, { id: "pen", label: "PEN", audio: W("pen") }, { id: "cup", label: "CUP", audio: W("cup") }], correctId: "of", coachWrong: "Good try! That word is not 'of'. Look closely and tap 'of'." },
    },
    {
      id: "apply-the-of",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is **of**?",
      image: IMG("bird"),
      narration: { audio: A("apply-the-of"), script: "You're doing great on our Snap Word Safari! Listen closely. Tap the word 'of'." },
      interaction: { type: "choose", options: [{ id: "the", label: "THE", audio: W("the") }, { id: "of", label: "OF", audio: W("of") }, { id: "to", label: "TO", audio: W("to") }], correctId: "of", coachWrong: "Not quite! We're looking for 'of'. Keep trying!" },
    },
    {
      id: "model-to",
      purpose: "model",
      gate: "interaction",
      prompt: "Tap to hear **to**.",
      image: IMG("path"),
      narration: { audio: A("model-to"), script: "Fantastic! Here is one more Snap Word for our collection. This word is 'to'. Tap the word and listen to me say 'to'. It helps us go places!" },
      interaction: { type: "listen", items: [{ label: "TO", audio: W("to") }] },
    },
    {
      id: "guided-to",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap to read **to**.",
      image: IMG("tent"),
      narration: { audio: A("guided-to"), script: "Wonderful! Now it's your turn to read 'to'. Tap the word 'to' to hear it. Can you read it like a snap?" },
      interaction: { type: "choose", options: [{ id: "to", label: "TO", audio: W("to") }, { id: "go", label: "GO", audio: W("go") }, { id: "no", label: "NO", audio: W("no") }], correctId: "to", coachWrong: "You found a word, but not 'to'. Try again to find 'to'!" },
    },
    {
      id: "apply-the-of-to",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is **to**?",
      image: IMG("fire"),
      narration: { audio: A("apply-the-of-to"), script: "You are becoming a Snap Word expert! Listen closely. Can you find the word 'to'?" },
      interaction: { type: "choose", options: [{ id: "the", label: "THE", audio: W("the") }, { id: "of", label: "OF", audio: W("of") }, { id: "to", label: "TO", audio: W("to") }], correctId: "to", coachWrong: "Not quite! We're looking for 'to'. Keep trying!" },
    },
    {
      id: "speak-the",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud in a snap!",
      image: IMG("snap"),
      narration: { audio: A("speak-the"), script: "Now for your explorer test! A Snap Word is waiting on your screen. Read it out loud, super fast, in a snap!" },
      interaction: { type: "speak", text: "the" },
    },
    {
      id: "challenge-snap-words",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words!",
      image: IMG("star"),
      narration: { audio: A("challenge-snap-words"), script: "You've been amazing on our Snap Word Safari! Now, can you put our special Snap Words in the right basket? Some words are Snap Words, and some are not. You got this!" },
      interaction: { type: "sort", buckets: ["Snap Word","Other Word"], items: [{ label: "THE", bucket: "Snap Word", audio: W("the") }, { label: "OF", bucket: "Snap Word", audio: W("of") }, { label: "TO", bucket: "Snap Word", audio: W("to") }, { label: "CAT", bucket: "Other Word", audio: W("cat") }, { label: "DOG", bucket: "Other Word", audio: W("dog") }], coachWrong: "Oops, try again! Snap Words are the speedy words we read in a flash." },
    },
    {
      id: "celebrate-snap-words",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Snap Word Star!",
      fx: {"text":"You are a Snap Word Star!","effect":"rainbow"},
      narration: { audio: A("celebrate-snap-words"), script: "Hooray, you finished your Snap Word Safari! You learned to read 'the', 'of', and 'to' in a snap. Keep practicing, and you'll be reading even more words super fast!" },
    },
  ],
};
