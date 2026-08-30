import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./decoding-champions-timings.json";

// Decoding Champions (RF.2.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=decoding-champions
// G2 umbrella application lesson: the decoding toolkit (taught in K/G1) applied to fresh G2 words.

const A = (id: string) => `/audio/lessons-v2/decoding-champions/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/decoding-champions/${w.toLowerCase()}.png`;

export const decodingChampionsImages: Record<string, string> = {
  "toolkit": "A bright red toolbox standing wide open on a sunny wooden desk, golden sparkles and small stars rising out of it, cozy classroom background with a window, no text anywhere, no letters anywhere",
  // Quiz easier-band picture support (decoding-champions-quiz e-1 / e-4):
  "ship": "A friendly cartoon sailing ship with a red and white striped sail floating on gentle blue ocean waves under a clear sky, no text anywhere",
  "cat": "A cute orange tabby cat sitting and smiling on a plain soft cream background, no text anywhere",
  "cake": "A round birthday cake with pink frosting and three lit candles on a white plate, plain soft background, no text anywhere",
  "sun": "A bright cheerful yellow sun with rays shining in a clear blue sky above soft white clouds, no text anywhere"
};

export const decodingChampions: LessonDef = {
  id: "decoding-champions",
  title: "Decoding Champions",
  grade: "2nd Grade",
  standard: "RF.2.3",
  archetype: "phonics",
  objective: "I can pick the right phonics tool and use it to decode long words.",
  concepts: ["syllable splitting","digraphs and blends","vowel teams","silent e","r-controlled vowels","prefixes and endings","decode and check meaning"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You unlocked every word today. You split syllables, spotted vowel teams, used silent e, and read a whole sentence full of long words. No long word can stop a reader who knows which tool to pick. That is what a decoding champion is.",
    "title": "You Are a Decoding Champion!",
    "body": "You picked the right phonics tool for every word: syllables, vowel teams, silent e, and endings. Long words are just small parts now."
  },
  scenes: [
    {
      id: "hook-decoding-toolkit",
      purpose: "hook",
      gate: "none",
      prompt: "Big words are built from small parts you already know.",
      image: IMG("toolkit"),
      narration: { audio: A("hook-decoding-toolkit"), script: "Second grade words look long. Blanket. Thunder. Painting. But here is the secret: every long word is built from small parts you already know how to read. You have a whole toolkit. Sounds and blends. Letter teams. Vowel teams. Silent e. Syllable splitting. Endings. Today you learn to pick the right tool for each word and unlock it. That is what a decoding champion does." },
    },
    {
      id: "model-split-thunder",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "Watch a champion pick tools for the word thunder.",
      fx: {"text":"**thun** + **der** = thunder","effect":"pop-words"},
      narration: { audio: A("model-split-thunder"), script: "Watch me unlock the word thunder. First tool: syllable splitting. I say it slowly and clap the parts. Thun. Der. Two parts. Now I check each part. Thun starts with the letter team t h. Those two letters make one sound: thh. Thh. Un. Thun. Now der. The r is stuck to the vowel, so the part says dur. Thun. Der. Thunder. Two tools, one long word, unlocked." },
    },
    {
      id: "model-team-painting",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "One more model: the word painting.",
      fx: {"text":"**pain** + **ting** = painting","effect":"pop-words"},
      narration: { audio: A("model-team-painting"), script: "Here is another long word: painting. I split it first. Pain. Ting. In the first part, the vowels a and i sit side by side. That is a vowel team, and together they say ay. Pain. The second part is the ending i n g. Ting. Pain. Ting. Painting. Vowel team plus ending. When you pick the right tools, a long word turns easy." },
    },
    {
      id: "guided-which-tool-floating",
      purpose: "guided",
      gate: "interaction",
      prompt: "Look at the word: floating. Which tools unlock it?",
      narration: { audio: A("guided-which-tool-floating"), script: "Your turn to pick the tool. Look at the word on the screen. Split it in your head and study its parts. What do you actually see in this word? Read every choice, then tap the tools this word needs." },
      interaction: { type: "choose", options: [{ id: "vowel-team-and-ending", label: "a vowel team and an ending" }, { id: "silent-e-at-the-end", label: "silent e at the end" }, { id: "digraph-at-the-start", label: "a digraph at the start" }, { id: "r-controlled-vowel", label: "an r-controlled vowel" }], correctId: "vowel-team-and-ending", coachWrong: "Split the word in your head. Look closely at the middle of the first part, and at the last three letters. Which parts do you really see? Tap the choice that matches." },
    },
    {
      id: "guided-sequence-champion",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the word champion. Drag the syllables into order.",
      narration: { audio: A("guided-sequence-champion"), script: "You are a champion, so build the word. Champion. Say it slowly and clap the parts. It has three syllables. Drag the parts into order so they spell champion." },
      interaction: { type: "sequence", items: [{ id: "cham", label: "cham" }, { id: "pi", label: "pi" }, { id: "on", label: "on" }], order: ["cham","pi","on"], coachWrong: "Say champion slowly out loud. Which part do you hear first? Start with that part, then add the next sound you hear." },
    },
    {
      id: "guided-speak-blanket",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Use your tools, then read this word out loud.",
      narration: { audio: A("guided-speak-blanket"), script: "This word is yours to unlock. Split it into two parts. Check the blend at the front. Read each part in your head, then say the whole word out loud." },
      interaction: { type: "speak", text: "blanket" },
    },
    {
      id: "apply-which-tool-mistake",
      purpose: "apply",
      gate: "interaction",
      prompt: "Look at the word: mistake. Which tool unlocks the last part?",
      narration: { audio: A("apply-which-tool-mistake"), script: "Pick the tool again, champion. Look at the word on the screen and split it into two parts. Study the second part carefully, all the way to its last letter. Read every choice, then tap the tool that unlocks it." },
      interaction: { type: "choose", options: [{ id: "silent-e-at-the-end", label: "silent e at the end" }, { id: "vowel-team-in-the-middle", label: "a vowel team in the middle" }, { id: "digraph-at-the-start", label: "a digraph at the start" }, { id: "r-controlled-vowel", label: "an r-controlled vowel" }], correctId: "silent-e-at-the-end", coachWrong: "Split the word after the s. Read the second part slowly and look at how it is spelled, all the way to the end. Then tap again." },
    },
    {
      id: "apply-decode-match-unlocked",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word: unlocked. What does it mean?",
      narration: { audio: A("apply-decode-match-unlocked"), script: "A champion does not just say a word. A champion knows what it means. Read the word on the screen in your head. Split it, read each part, and put it back together. Then tap what the whole word means." },
      interaction: { type: "choose", options: [{ id: "opened-with-a-key", label: "opened with a key" }, { id: "closed-up-tight", label: "closed up tight" }, { id: "having-bad-luck", label: "having bad luck" }, { id: "emptied-all-the-way", label: "emptied all the way" }], correctId: "opened-with-a-key", coachWrong: "Split the word into three parts. The first part, un, means not. Read the middle part again, sound by sound, then think about what the whole word means." },
    },
    {
      id: "apply-speak-challenge",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "One more word to unlock. Read it out loud.",
      narration: { audio: A("apply-speak-challenge"), script: "This word starts with a letter team and hides more than one tool. Split it, check each part, then read the whole word out loud." },
      interaction: { type: "speak", text: "challenge" },
    },
    {
      id: "challenge-sequence-remarkable",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Champion round: build the word remarkable.",
      narration: { audio: A("challenge-sequence-remarkable"), script: "This is a third grade word, and you have every tool it needs. Remarkable. Say it slowly. It has four parts. Drag them into order so they spell remarkable." },
      interaction: { type: "sequence", items: [{ id: "re", label: "re" }, { id: "mark", label: "mark" }, { id: "a", label: "a" }, { id: "ble", label: "ble" }], order: ["re","mark","a","ble"], coachWrong: "Say remarkable slowly and clap each part. Which part do you hear at the very start? Begin there, then add one part at a time." },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read the sentence: A painting of thunder clouds floated over the blanket.",
      narration: { audio: A("challenge-speak-sentence"), script: "Last round, champion. Every word in this sentence is one you can unlock. Take your time, pick your tools, and read the whole sentence out loud." },
      interaction: { type: "speak", text: "A painting of thunder clouds floated over the blanket" },
    },
    {
      id: "celebrate-champion",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You unlocked every word!",
      fx: {"text":"You are a **decoding champion**!","effect":"fireworks"},
      narration: { audio: A("celebrate-champion"), script: "Look at what you unlocked. You split thunder into syllables. You found the vowel team in painting and the silent e in mistake. You read blanket and challenge out loud, and you built a third grade word from its parts. Long words are not scary. They are just small parts, and you own the tools. That is what a decoding champion is." },
    },
  ],
};
