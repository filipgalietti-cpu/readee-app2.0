import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./look-it-up-timings.json";

// Look It Up (L.2.4e) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=look-it-up
// Glossaries and beginning dictionaries: read an entry (word, meaning, example),
// hunt a word with ABC order (first letter, then second letter), and pick the
// entry meaning that fits the sentence. Goes DEEP on the using skill; find-it-fast
// (RI.2.5) already covered glossary as one text feature among many. All anchors
// fresh: gallop, timid, seal, pitcher (bark/bat = word-toolbox, drowsy =
// sentence-clues, burrow = science-word-clues, bank/train/light = word-solvers).

const A = (id: string) => `/audio/lessons-v2/look-it-up/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/look-it-up/${w.toLowerCase()}.png`;

export const lookItUpImages: Record<string, string> = {
  "boy-horse-book": "A young boy sitting on a rug reading a big blue book with a plain cover, a brown pony galloping across a green field inside an empty thought bubble above his head. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "envelope-desk": "A hand pressing the flap of a plain white envelope closed on a wooden desk. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "seal-zoo": "A happy gray seal clapping its front flippers on a rock beside a blue pool at the zoo. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const lookItUp: LessonDef = {
  id: "look-it-up",
  title: "Look It Up",
  grade: "2nd Grade",
  standard: "L.2.4e",
  archetype: "vocabulary",
  objective: "I can use a dictionary or glossary to find what a word means.",
  concepts: ["a dictionary entry gives the word, its meaning, and an example", "ABC order is how you find a word", "when first letters match, use the second letter", "pick the entry meaning that fits the sentence"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can look up any word now. A dictionary entry hands you the word, its meaning, and an example. ABC order helps you hunt the word down, first letter first, second letter when you need it. And when an entry lists two meanings, the sentence tells you which one fits. Keep a dictionary close, and no word can stump you.",
    "title": "Word Hunter!",
    "body": "You read dictionary entries, hunted words in ABC order, and picked the meaning that fits."
  },
  scenes: [
    {
      id: "hook-lost-word",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read the story with me.",
      image: IMG("boy-horse-book"),
      narration: { audio: A("hook-lost-word"), script: "Hello, reader. Today you will learn to use two word tools, the dictionary and the glossary. When you meet a word you do not know, these tools hold its meaning. Read the story with me and watch for the word that stumps Sam." },
      interaction: { type: "read-along", text: "Sam read a book about horses. One page said the pony broke into a gallop. Sam stopped. He did not know what a gallop was. Then he remembered the big blue dictionary on the shelf. That book holds the meanings of thousands of words. Sam ran to look it up.", audio: A("hook-lost-word-sentence") },
    },
    {
      id: "model-entry-gallop",
      purpose: "model",
      gate: "none",
      prompt: "Watch me read a dictionary entry.",
      fx: {"text":"the word, the **meaning**, an example","effect":"pop-words"},
      narration: { audio: A("model-entry-gallop"), script: "Sam opened the dictionary and found the entry for gallop. Every entry has three parts. It starts with the word, then it gives the meaning, then it shows an example sentence. Listen to Sam's entry. It says gallop, to run fast the way a horse runs. Then comes the example, the pony broke into a gallop. Now Sam understands his page. The meaning was waiting right there in the entry." },
    },
    {
      id: "guided-read-timid",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read this glossary entry yourself.",
      narration: { audio: A("guided-read-timid"), script: "Some books carry their own small word list in the back. That list is called a glossary, and its entries work just like dictionary entries. Here is one from a book about mice. Read the whole entry with me, the word, the meaning, and the example." },
      interaction: { type: "read-along", text: "timid: easily scared. The timid mouse hid from the cat.", audio: A("guided-read-timid-sentence") },
    },
    {
      id: "guided-choose-timid",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does timid mean?",
      narration: { audio: A("guided-choose-timid"), script: "You just read the glossary entry for timid. Now use it. Think about the meaning part, it came right after the word. Read each card. Tap what timid means." },
      interaction: { type: "choose", options: [{ id: "easily-scared", label: "easily scared" }, { id: "always-hungry", label: "always hungry" }, { id: "very-sleepy", label: "very sleepy" }, { id: "extra-loud", label: "extra loud" }], correctId: "easily-scared", coachWrong: "Think back to the entry you read. The meaning came right after the word, before the example about the mouse. Try again!" },
    },
    {
      id: "apply-sequence-abc-order",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the words in ABC order, like a dictionary.",
      narration: { audio: A("apply-sequence-abc-order"), script: "A dictionary holds thousands of words, so how did Sam find his so fast? The words march in ABC order, just like the alphabet. To hunt a word, start with its first letter. Here are four animal words. Drag them into ABC order, from first to last." },
      interaction: { type: "sequence", items: [{ id: "crab", label: "crab" }, { id: "fox", label: "fox" }, { id: "moth", label: "moth" }, { id: "seal", label: "seal" }], order: ["crab","fox","moth","seal"], coachWrong: "Say the alphabet in your head. Which first letter comes earliest? That word goes first. Try again!" },
    },
    {
      id: "apply-choose-second-letter",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word comes first in the dictionary?",
      narration: { audio: A("apply-choose-second-letter"), script: "Here is the tricky part. These four words all start with b, so the first letter cannot help you. When first letters match, dictionaries use the second letter. Look at the second letter of each word. Read each word. Tap the one that comes first in the dictionary." },
      interaction: { type: "choose", options: [{ id: "bean", label: "bean" }, { id: "bike", label: "bike" }, { id: "boat", label: "boat" }, { id: "bug", label: "bug" }], correctId: "bean", coachWrong: "All four start with b, so check the second letter of each word. Which of those letters comes earliest in the alphabet? Try again!" },
    },
    {
      id: "apply-speak-name-tool",
      purpose: "apply",
      gate: "interaction",
      prompt: "Name a tool where you can look up a word.",
      narration: { audio: A("apply-speak-name-tool"), script: "Let's lock in your two word tools. A dictionary is its own big book, with thousands of words in ABC order. A glossary is the short word list in the back of one book, and it keeps the important words from that book. So when a new word stumps you, you know where to go. Tap the mic and name one tool where you can look up a word." },
      interaction: { type: "speak", text: "dictionary glossary" },
    },
    {
      id: "apply-choose-seal-envelope",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which meaning of seal fits the sentence?",
      image: IMG("envelope-desk"),
      narration: { audio: A("apply-choose-seal-envelope"), script: "Some entries hold two meanings, and the dictionary numbers them. The entry for seal says, one, a sea animal with flippers. Two, to close something up tight. Only one meaning fits each sentence. Listen. Please seal the envelope before you mail it. Read each card. Tap the meaning that fits." },
      interaction: { type: "choose", options: [{ id: "to-close-it-up-tight", label: "to close it up tight" }, { id: "a-sea-animal-with-flippers", label: "a sea animal with flippers" }, { id: "to-tear-it-open", label: "to tear it open" }, { id: "to-fold-it-in-half", label: "to fold it in half" }], correctId: "to-close-it-up-tight", coachWrong: "Read the sentence again. What do you do to an envelope before you mail it? Pick the meaning that matches. Try again!" },
    },
    {
      id: "apply-choose-seal-flip",
      purpose: "apply",
      gate: "interaction",
      prompt: "Same word, new sentence. Which meaning fits now?",
      image: IMG("seal-zoo"),
      narration: { audio: A("apply-choose-seal-flip"), script: "Same word, brand new sentence. Watch how the fitting meaning flips. Listen. A seal clapped its flippers at the zoo. Think about both numbered meanings in the entry. Read each card. Tap the meaning that fits this sentence." },
      interaction: { type: "choose", options: [{ id: "a-sea-animal-with-flippers", label: "a sea animal with flippers" }, { id: "to-close-something-tight", label: "to close something tight" }, { id: "a-splash-in-the-pool", label: "a splash in the pool" }, { id: "a-striped-beach-ball", label: "a striped beach ball" }], correctId: "a-sea-animal-with-flippers", coachWrong: "Read the sentence again. What clapped its flippers at the zoo? Pick the meaning that matches. Try again!" },
    },
    {
      id: "challenge-choose-pitcher",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Pick the meaning that fits the sentence.",
      narration: { audio: A("challenge-choose-pitcher"), script: "Challenge time, and this one is all you. Here is a new entry with two meanings. Pitcher. One, a jug for pouring drinks. Two, the person who throws the ball in baseball. Listen. The pitcher threw the ball right over home plate. Read each card. Tap the meaning that fits." },
      interaction: { type: "choose", options: [{ id: "the-player-who-throws", label: "the player who throws" }, { id: "a-jug-for-pouring-drinks", label: "a jug for pouring drinks" }, { id: "a-glove-for-catching", label: "a glove for catching" }, { id: "a-base-on-the-field", label: "a base on the field" }], correctId: "the-player-who-throws", coachWrong: "Read the sentence again. Who threw the ball over home plate? Pick the meaning that matches. Try again!" },
    },
    {
      id: "challenge-speak-pitcher",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what pitcher means in this sentence.",
      narration: { audio: A("challenge-speak-pitcher"), script: "Last one, and you say it yourself. The same entry, but a new sentence. Listen. Mom filled the pitcher with lemonade. In that sentence, pitcher is not the baseball meaning. Tap the mic and tell me what a pitcher is in that sentence." },
      interaction: { type: "speak", text: "container jug pour pours pouring drink drinks holds" },
    },
    {
      id: "celebrate-word-hunter",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can look it up!",
      fx: {"text":"**Look it up**, every time!","effect":"fireworks"},
      narration: { audio: A("celebrate-word-hunter"), script: "You can look up any word now. A dictionary entry hands you the word, its meaning, and an example. ABC order helps you hunt the word down, first letter first, second letter when you need it. And when an entry lists two meanings, the sentence tells you which one fits. Keep a dictionary close, and no word can stump you." },
    },
  ],
};
