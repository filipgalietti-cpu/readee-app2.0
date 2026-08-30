import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-plus-word-timings.json";

// Word Plus Word (L.2.4d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-plus-word
// Compound words: two REAL words snap together, add their meanings to PREDICT
// the new word (sun + set = when the sun goes down). Sibling of Word Math
// (L.2.4b prefix equations) but with two real words joining; all anchors fresh.

const A = (id: string) => `/audio/lessons-v2/word-plus-word/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-plus-word/${w.toLowerCase()}.png`;

export const wordPlusWordImages: Record<string, string> = {
  "beach-sunset": "A young girl wearing a yellow raincoat walking on a sandy beach under an orange and pink sunset sky, a few soft raindrops falling. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "muddy-footprints": "A trail of small boot prints pressed into smooth brown mud in a backyard, green grass around the mud patch. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "doghouse-yard": "A small red doghouse in a sunny green backyard, a happy little brown dog sitting beside it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const wordPlusWord: LessonDef = {
  id: "word-plus-word",
  title: "Word Plus Word",
  grade: "2nd Grade",
  standard: "L.2.4d",
  archetype: "vocabulary",
  objective: "I can predict what a compound word means by adding the meanings of its two smaller words.",
  concepts: ["compound words", "word plus word equations", "predict meaning from parts", "tricky non-literal compounds"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can predict compound words now. Sun plus set means the time when the sun goes down. Rain plus coat means a coat for the rain. When two real words snap together, add their meanings and you will know the new word. And when a tricky word like butterfly does not add up, check the sentence. Keep adding word plus word every time you read!",
    "title": "Compound Word Champ!",
    "body": "You added two small words together to predict big new words like sunset, doghouse, and snowman."
  },
  scenes: [
    {
      id: "hook-beach-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the beach story with me.",
      image: IMG("beach-sunset"),
      narration: { audio: A("hook-beach-story"), script: "Hello, reader. Today you will learn about compound words. A compound word is two real words that snap together to make one new word. If you know the two small words, you can predict what the new word means. Read the story with me and watch for two compound words." },
      interaction: { type: "read-along", text: "Lena walked on the beach at sunset. The sky turned orange and pink. Then rain began to fall. Lena pulled on her raincoat and kept walking. Rain at sunset makes the best sky colors.", audio: A("hook-beach-story-sentence") },
    },
    {
      id: "model-sunset",
      purpose: "model",
      gate: "none",
      prompt: "Watch me add word plus word on sunset.",
      fx: {"text":"sun + set = sun goes **down**","effect":"pop-words"},
      narration: { audio: A("model-sunset"), script: "Look at this compound word. Sunset. I see two small words. Sun, and set. I know the sun, the bright light in the sky. I know set, it means to go down. Now I add the meanings. Sun plus set equals the time when the sun goes down. That is my prediction, and it is right. Two words I know told me the meaning of one new word." },
    },
    {
      id: "model-raincoat",
      purpose: "model",
      gate: "none",
      prompt: "Watch me add word plus word on raincoat.",
      fx: {"text":"rain + coat = a coat **for** rain","effect":"magic"},
      narration: { audio: A("model-raincoat"), script: "Now look at raincoat. Two small words again. Rain, and coat. Rain is water that falls from the sky. A coat is something warm you wear. Add the meanings with me. Rain plus coat equals a coat you wear in the rain. It kept Lena dry. When two real words join, add what you know about each one, and you can predict the new meaning." },
    },
    {
      id: "guided-choose-footprint",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a footprint?",
      image: IMG("muddy-footprints"),
      narration: { audio: A("guided-choose-footprint"), script: "Your turn. Look at this word. Footprint. Two small words. Foot, and print. A print is a mark something leaves behind. Add the meanings. Read each card. Tap what a footprint is." },
      interaction: { type: "choose", options: [{ id: "mark-a-foot-leaves", label: "a mark a foot leaves" }, { id: "print-of-a-hand", label: "a print of a hand" }, { id: "foot-that-hurts", label: "a foot that hurts" }, { id: "shop-for-shoes", label: "a shop for shoes" }], correctId: "mark-a-foot-leaves", coachWrong: "Add the two meanings. Foot, plus print. Think about what each small word means. Try again!" },
    },
    {
      id: "guided-choose-doghouse",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a doghouse?",
      image: IMG("doghouse-yard"),
      narration: { audio: A("guided-choose-doghouse"), script: "Here are two small words. Dog, and house. Snap them together and you get doghouse. A dog is a pet. A house is a place to live in. Add the meanings. Read each card. Tap what a doghouse is." },
      interaction: { type: "choose", options: [{ id: "small-house-for-a-dog", label: "a small house for a dog" }, { id: "dog-as-big-as-a-house", label: "a dog as big as a house" }, { id: "house-made-by-a-dog", label: "a house made by a dog" }, { id: "dog-with-no-home", label: "a dog with no home" }], correctId: "small-house-for-a-dog", coachWrong: "Add the meanings. Dog, plus house. Which card matches both small words? Try again!" },
    },
    {
      id: "apply-choose-bedtime",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word means the time to go to bed?",
      narration: { audio: A("apply-choose-bedtime"), script: "Now we flip it. I say the meaning, and you find the compound word. Which word means the time to go to bed? Read each word. Find its two small words and add them. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "bedtime", label: "bedtime" }, { id: "daytime", label: "daytime" }, { id: "springtime", label: "springtime" }, { id: "bedrock", label: "bedrock" }], correctId: "bedtime", coachWrong: "Find the two small words inside each word. Which one adds up to the time you go to bed? Try again!" },
    },
    {
      id: "apply-speak-snowman",
      purpose: "apply",
      gate: "interaction",
      prompt: "Snowman. Say what it means.",
      narration: { audio: A("apply-speak-snowman"), script: "Here is a new compound word. Snowman. Find the two small words. Snow, and man. Add the meanings in your head. Tap the mic and tell me what a snowman is." },
      interaction: { type: "speak", text: "man made of snow person build" },
    },
    {
      id: "apply-sort-compound-or-single",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: compound or single?",
      narration: { audio: A("apply-sort-compound-or-single"), script: "Sorting time. Some of these are compound words, two real words that snap together. Some are just one word, even if they are long. Read each word slowly. If you can find two real words inside, drag it to Compound. If it is only one word, drag it to Single Word." },
      interaction: { type: "sort", buckets: ["Compound","Single Word"], items: [{ label: "mailbox", bucket: "Compound" }, { label: "yellow", bucket: "Single Word" }, { label: "bathtub", bucket: "Compound" }, { label: "basket", bucket: "Single Word" }, { label: "playground", bucket: "Compound" }, { label: "turtle", bucket: "Single Word" }], coachWrong: "Read that word again slowly. Can you find two real words inside it, or is it just one word? Try again!" },
    },
    {
      id: "apply-choose-backpack-sentence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which sentence uses backpack the right way?",
      narration: { audio: A("apply-choose-backpack-sentence"), script: "Words only work when we use them the right way. Here is a new compound word. Backpack. Back, plus pack. Add the meanings, then read each sentence. Tap the sentence that uses backpack the right way." },
      interaction: { type: "choose", options: [{ id: "books-in-backpack", label: "My books go in my backpack." }, { id: "ate-my-backpack", label: "I ate my backpack for lunch." }, { id: "backpack-sang", label: "The backpack sang a song." }, { id: "swam-across-backpack", label: "We swam across the backpack." }], correctId: "books-in-backpack", coachWrong: "Add the meanings first. Back, plus pack. Which sentence makes sense for something you carry? Try again!" },
    },
    {
      id: "challenge-choose-butterfly",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is a butterfly?",
      narration: { audio: A("challenge-choose-butterfly"), script: "Challenge time. Some compound words do not play fair. Look at butterfly. Butter, plus fly. But adding those meanings gives a silly answer. Some compound words have a surprise meaning, so we check the sentence too. Listen. A butterfly landed softly on the flower. What is a butterfly? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "insect-with-big-wings", label: "an insect with big wings" }, { id: "butter-that-can-fly", label: "butter that can fly" }, { id: "fly-made-of-butter", label: "a fly made of butter" }, { id: "bread-with-butter", label: "bread with butter on it" }], correctId: "insect-with-big-wings", coachWrong: "Word plus word does not work on this tricky word. Use the sentence. What could land softly on a flower? Try again!" },
    },
    {
      id: "challenge-speak-cupcake",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Cupcake. Say what it means.",
      narration: { audio: A("challenge-speak-cupcake"), script: "Last one, and this is all you. Look at this word. Cupcake. Find the two small words. Add the meanings. Tap the mic and tell me what a cupcake is." },
      interaction: { type: "speak", text: "small cake cup little sweet treat" },
    },
    {
      id: "celebrate-word-plus-word",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can predict compound words!",
      fx: {"text":"**Word plus word**, every time!","effect":"fireworks"},
      narration: { audio: A("celebrate-word-plus-word"), script: "You can predict compound words now. Sun plus set means the time when the sun goes down. Rain plus coat means a coat for the rain. When two real words snap together, add their meanings and you will know the new word. And when a tricky word like butterfly does not add up, check the sentence. Keep adding word plus word every time you read!" },
    },
  ],
};
