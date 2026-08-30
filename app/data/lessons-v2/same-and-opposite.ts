import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./same-and-opposite-timings.json";

// Same and Opposite (L.2.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=same-and-opposite
// Word relationships: synonym pairs (quick/fast, shout/yell), antonym pairs
// (loud/quiet, empty/full), Same-vs-Opposite sort, light nuance taste
// (glad < happy < thrilled) with a strongest-word grammar beat. Anchors fresh
// vs K opposites (big/small, up/down, hot/cold) and vs L.2.5b ladder work.

const A = (id: string) => `/audio/lessons-v2/same-and-opposite/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/same-and-opposite/${w.toLowerCase()}.png`;

export const sameAndOppositeImages: Record<string, string> = {
  "puppy-park": "A small brown puppy running fast across a green park lawn, ears flying back, a red leash trailing, plain blue sky, no sun in the sky, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "boy-shouting-field": "A boy cupping both hands around his mouth calling out across a wide empty grassy field, bushes in the background, plain sky, no other people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "empty-lunchbox": "An open plain red metal lunchbox on a wooden kitchen table with nothing inside it, lid up, plain silver inside the lid, no pictures on the lunchbox, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "gold-trophy": "A shiny gold trophy cup on a small podium with confetti falling around it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const sameAndOpposite: LessonDef = {
  id: "same-and-opposite",
  title: "Same and Opposite",
  grade: "2nd Grade",
  standard: "L.2.5",
  archetype: "vocabulary",
  objective: "I can tell when two words mean almost the same and when they are opposites.",
  concepts: ["synonyms mean almost the same (quick, fast)", "antonyms are opposites (loud, quiet)", "sort word pairs: same or opposite", "some synonyms are stronger (glad, happy, thrilled)"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You know how word pairs work now. Quick and fast are synonyms, words that mean almost the same. Loud and quiet are antonyms, words that are opposites. And some synonyms are stronger than others, like thrilled is stronger than glad. When you meet two words, ask yourself, are they almost the same, or are they opposites? Keep matching word pairs every time you read!",
    "title": "Word Pair Expert!",
    "body": "You matched synonyms, spotted antonyms, and picked the strongest word for the moment."
  },
  scenes: [
    {
      id: "hook-puppy-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the puppy story with me.",
      image: IMG("puppy-park"),
      narration: { audio: A("hook-puppy-story"), script: "Hello, reader. Today you will learn how words come in pairs. Some word pairs mean almost the same thing. Some word pairs are opposites. Read this story with me, and watch how the words work together." },
      interaction: { type: "read-along", text: "Ben took his new puppy to the park. The puppy was quick. It was so fast that Ben could not catch it. The park was loud with barking dogs. At home that night, the house was quiet. The tired puppy slept and slept.", audio: A("hook-puppy-story-sentence") },
    },
    {
      id: "model-synonyms",
      purpose: "model",
      gate: "none",
      prompt: "Watch me match two words that mean almost the same.",
      fx: {"text":"quick and fast mean almost the **same**","effect":"underline"},
      narration: { audio: A("model-synonyms"), script: "Look back at the story. The puppy was quick. The puppy was also fast. Quick and fast mean almost the same thing. Word pairs like that are called synonyms. Synonyms are meaning twins. If I say a race car is quick, or I say a race car is fast, I am telling you the same idea with two different words." },
    },
    {
      id: "model-antonyms",
      purpose: "model",
      gate: "none",
      prompt: "Watch me match two words that are opposites.",
      fx: {"text":"loud is the **opposite** of quiet","effect":"pop-words"},
      narration: { audio: A("model-antonyms"), script: "Now look at two more words from the story. The park was loud. The house was quiet. Loud and quiet do not mean the same thing. They mean the opposite. Word pairs like that are called antonyms. Antonyms sit on opposite ends, like a light that is on or off. Loud and quiet. Those two words could not be more different." },
    },
    {
      id: "guided-choose-synonym",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word means almost the same as shout?",
      image: IMG("boy-shouting-field"),
      narration: { audio: A("guided-choose-synonym"), script: "Your turn. Sam had to shout across the field so his brother could hear him. To shout is to call out in a loud voice. Which word means almost the same as shout? Read each word. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "yell", label: "yell" }, { id: "whisper", label: "whisper" }, { id: "wave", label: "wave" }, { id: "hop", label: "hop" }], correctId: "yell", coachWrong: "You are hunting for a meaning twin. Which word is also a big loud call? Try again!" },
    },
    {
      id: "guided-choose-antonym",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word is the opposite of empty?",
      image: IMG("empty-lunchbox"),
      narration: { audio: A("guided-choose-antonym"), script: "Now hunt for an opposite. Look at this lunchbox before lunch is packed. It is empty. Nothing is inside. Which word is the opposite of empty? Read each word. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "full", label: "full" }, { id: "clean", label: "clean" }, { id: "light", label: "light" }, { id: "new", label: "new" }], correctId: "full", coachWrong: "Empty means nothing is inside. Flip that idea all the way to the other end. Try again!" },
    },
    {
      id: "apply-sort-same-opposite",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the word pairs: same or opposite?",
      narration: { audio: A("apply-sort-same-opposite"), script: "Sorting time. Each tile shows a pair of words. Read the pair slowly. If the two words mean almost the same, drag the pair to Same. If the two words are opposites, drag the pair to Opposite." },
      interaction: { type: "sort", buckets: ["Same","Opposite"], items: [{ label: "begin and start", bucket: "Same" }, { label: "wide and narrow", bucket: "Opposite" }, { label: "sad and gloomy", bucket: "Same" }, { label: "brave and afraid", bucket: "Opposite" }, { label: "shut and close", bucket: "Same" }, { label: "smooth and bumpy", bucket: "Opposite" }], coachWrong: "Read that pair again. Do the two words tell the same idea, or do they pull in different directions? Try again!" },
    },
    {
      id: "model-strength",
      purpose: "model",
      gate: "none",
      prompt: "Some synonyms are stronger than others.",
      fx: {"text":"glad, happy, **thrilled**","effect":"pop-words"},
      narration: { audio: A("model-strength"), script: "Here is a synonym secret. Glad, happy, and thrilled are all in the same family. They all mean a good feeling. But they are not the same strength. Glad is a small good feeling, like finding a sticker. Happy is bigger, like a fun day at the pool. Thrilled is the strongest of all, like the best surprise of your whole year. Same family, different strength." },
    },
    {
      id: "apply-choose-strongest",
      purpose: "apply",
      gate: "interaction",
      prompt: "I was ___ when I won the big prize. Pick the strongest word.",
      image: IMG("gold-trophy"),
      narration: { audio: A("apply-choose-strongest"), script: "Now use the synonym secret. Listen. I was blank when I won the big prize. Winning a big prize is a huge, exciting moment, so this sentence needs the strongest good feeling word in the family. Read each word. Tap the strongest one." },
      interaction: { type: "choose", options: [{ id: "thrilled", label: "thrilled" }, { id: "glad", label: "glad" }, { id: "happy", label: "happy" }, { id: "okay", label: "okay" }], correctId: "thrilled", coachWrong: "That word fits, but is it the strongest one in the family? Think about which feeling is the very biggest. Try again!" },
    },
    {
      id: "challenge-speak-synonym",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a word that means almost the same as little.",
      narration: { audio: A("challenge-speak-synonym"), script: "Challenge time, and this is all you. A mouse is little. Think of a different word that means almost the same as little. Tap the mic and say your word." },
      interaction: { type: "speak", text: "small tiny" },
    },
    {
      id: "challenge-speak-antonym",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the opposite of day.",
      narration: { audio: A("challenge-speak-antonym"), script: "Last one. The sun shines during the day. Now think of the opposite of day. Tap the mic and say the opposite." },
      interaction: { type: "speak", text: "night nighttime" },
    },
    {
      id: "celebrate-same-and-opposite",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can match word pairs!",
      fx: {"text":"**Same** or **opposite**, you know the pair!","effect":"fireworks"},
      narration: { audio: A("celebrate-same-and-opposite"), script: "You can match word pairs now. Quick and fast are synonyms, they mean almost the same. Loud and quiet are antonyms, they are opposites. And when synonyms line up, one can be stronger, like thrilled. Keep asking, same or opposite, every time you meet a new word pair!" },
    },
  ],
};
