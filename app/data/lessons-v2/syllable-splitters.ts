import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./syllable-splitters-timings.json";

// Syllable Splitters (RF.1.3d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=syllable-splitters

const A = (id: string) => `/audio/lessons-v2/syllable-splitters/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/syllable-splitters/${w.toLowerCase()}.png`;

export const syllableSplittersImages: Record<string, string> = {
  "sunset": "A warm orange and pink cartoon sunset over gentle rolling hills, sun half below the horizon."
};

export const syllableSplitters: LessonDef = {
  id: "syllable-splitters",
  title: "Syllable Splitters",
  grade: "1st Grade",
  standard: "RF.1.3d",
  archetype: "phonics",
  objective: "I can count vowel sounds to find the syllables in a printed word!",
  concepts: ["every syllable has a vowel sound","count the vowel sounds in a printed word to count its syllables","a silent e does not make a vowel sound"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You can split printed words into syllables. Count the vowel sounds, watch out for a silent e, and you will always know how many syllables a word has. Keep splitting words in every book you read!",
    "title": "You're a Syllable Splitter!",
    "body": "You counted vowel sounds to find the syllables in printed words like sunset, basket, and banana."
  },
  scenes: [
    {
      id: "hook-read-the-rule",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read our syllable rule with me.",
      narration: { audio: A("hook-read-the-rule"), script: "Hi, reader! Words are built from little parts called syllables. Today you will learn a trick for counting the syllables in any printed word. Read our rule with me." },
      interaction: { type: "read-along", text: "Every word is made of parts called syllables. Every syllable has one vowel sound.", audio: A("hook-read-the-rule-sentence") },
    },
    {
      id: "model-rule",
      purpose: "model",
      gate: "none",
      prompt: "Count the vowel sounds to count the syllables.",
      fx: {"text":"Count the **vowel sounds**. That is the number of **syllables**.","effect":"pop-words"},
      narration: { audio: A("model-rule"), script: "Here is the trick. Every syllable has exactly one vowel sound. So when you see a printed word, count its vowel sounds. That number tells you the number of syllables. Let me show you." },
    },
    {
      id: "model-count-cat",
      purpose: "model",
      gate: "none",
      prompt: "How many syllables in cat?",
      fx: {"text":"c **a** t","effect":"glow"},
      narration: { audio: A("model-count-cat"), script: "Look at the word cat. I see one vowel letter, a. Say it with me. Cat. I hear one vowel sound, aaa. One vowel sound means one syllable. Cat has one syllable." },
    },
    {
      id: "model-count-sunset",
      purpose: "model",
      gate: "none",
      prompt: "How many syllables in sunset?",
      fx: {"text":"s **u** n s **e** t","effect":"glow"},
      narration: { audio: A("model-count-sunset"), script: "Now look at the word sunset. I see two vowel letters, u and e. Say it with me. Sun. Set. The u in sun makes a vowel sound. The e in set makes a vowel sound. Two vowel sounds means two syllables. Sunset has two syllables." },
    },
    {
      id: "guided-read-sunset",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the word aloud: sunset",
      image: IMG("sunset"),
      narration: { audio: A("guided-read-sunset"), script: "Your turn. Read this word out loud. Say both syllables, the sun part and the set part." },
      interaction: { type: "speak", text: "sunset sunsets" },
    },
    {
      id: "guided-count-basket",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many syllables: basket",
      narration: { audio: A("guided-count-basket"), script: "Here is a new word. Read it in your head. Find the vowel letters and count the vowel sounds. Then tap the number of syllables." },
      interaction: { type: "choose", options: [{ id: "one", label: "1" }, { id: "two", label: "2" }, { id: "three", label: "3" }], correctId: "two", coachWrong: "Look at the word again. Point to each vowel letter you see. Count one syllable for each vowel sound." },
    },
    {
      id: "guided-count-pond",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many syllables: pond",
      narration: { audio: A("guided-count-pond"), script: "Try another one. Read this word in your head and count its vowel sounds. Then tap the number of syllables." },
      interaction: { type: "choose", options: [{ id: "one", label: "1" }, { id: "two", label: "2" }, { id: "three", label: "3" }], correctId: "one", coachWrong: "Read the word again slowly. How many vowel letters do you see? Count the vowel sounds you hear." },
    },
    {
      id: "model-silent-e-cake",
      purpose: "model",
      gate: "none",
      prompt: "Watch out for silent e!",
      fx: {"text":"c **a** k e","effect":"glow"},
      narration: { audio: A("model-silent-e-cake"), script: "Watch out for a tricky one. Look at the word cake. I see two vowel letters, a and e. But say it with me. Cake. I hear only one vowel sound, ay. The e at the end is silent, just like in your magic e words. A silent e makes no sound, so it does not make a syllable. Cake has one syllable." },
    },
    {
      id: "apply-sort-syllables",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by their syllables.",
      narration: { audio: A("apply-sort-syllables"), script: "Time to sort. Read each word. Count its vowel sounds, and watch out for a silent e. Then drag the word to the bucket that matches its number of syllables." },
      interaction: { type: "sort", buckets: ["One","Two","Three"], items: [{ label: "cake", bucket: "One" }, { label: "pond", bucket: "One" }, { label: "robot", bucket: "Two" }, { label: "mitten", bucket: "Two" }, { label: "banana", bucket: "Three" }], coachWrong: "Read that word again. Count its vowel sounds, and remember a silent e does not count. Then pick its bucket." },
    },
    {
      id: "challenge-say-two",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a word that has two syllables.",
      narration: { audio: A("challenge-say-two"), script: "Here is your challenge. Think of a word with two syllables. Count the vowel sounds in your head to check it. Then say your word into the mic." },
      interaction: { type: "speak", text: "sunset basket robot mitten rabbit apple happy puppy tiger pencil paper baby monkey candy window cookie" },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      gate: "none",
      prompt: "You're a Syllable Splitter!",
      fx: {"text":"You can **split** words into **syllables**!","effect":"fireworks"},
      narration: { audio: A("celebrate"), script: "You did it! You can split printed words into syllables. Count the vowel sounds, watch out for a silent e, and you will always know how many syllables a word has. Keep splitting words in every book you read!" },
    },
  ],
};
