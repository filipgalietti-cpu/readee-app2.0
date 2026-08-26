import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./write-it-right-timings.json";

// Write It Right (L.1.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=write-it-right

const A = (id: string) => `/audio/lessons-v2/write-it-right/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/write-it-right/${w.toLowerCase()}.png`;

export const writeItRightImages: Record<string, string> = {
  "kid-writing": "A smiling child sitting at a small desk writing on blank paper with a big yellow pencil, soft sky-blue background, no letters, no words, no text.",
  "dog-running": "A happy brown cartoon dog running fast across green grass, sunny day, no letters, no words, no text.",
  "fruit-bowl": "A wooden bowl holding red apples, purple plums, and green grapes on a table, bright colors, no letters, no words, no text.",
  "lake-day": "Two happy children splashing at the edge of a blue lake on a sunny summer day, green trees behind, no letters, no words, no text.",
  // Quiz easier-band picture support:
  "girl-waving": "One smiling cartoon girl standing and waving hello, plain soft sky-blue background, no letters, no words, no text.",
  "hen-sitting": "One brown cartoon hen sitting calmly on green grass, plain background, no letters, no words, no text.",
  "rain-boy": "A smiling child in a yellow raincoat splashing in a puddle while rain falls, no letters, no words, no text."
};

export const writeItRight: LessonDef = {
  id: "write-it-right",
  title: "Write It Right",
  grade: "1st Grade",
  standard: "L.1.2",
  archetype: "print-concepts",
  objective: "I can write names, dates, and sentences the right way.",
  concepts: ["capitalize names of people and days and months","end sentences with the right mark","use commas in dates and lists","spell words the way they sound"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You learned the writer rules. Capital letters for names, days, and months. The right mark at the end of every sentence. Commas resting in dates and lists. And spelling words the way they sound. Use those rules every time you write!",
    "title": "Write It Right",
    "body": "Capitals for names and days, the right end mark, commas in dates and lists, and sound-it-out spelling."
  },
  scenes: [
    {
      id: "hook-writer-rules",
      purpose: "hook",
      gate: "interaction",
      prompt: "Writers follow special rules.",
      image: IMG("kid-writing"),
      narration: { audio: A("hook-writer-rules"), script: "When you write, big letters and little marks do big jobs. They show your reader just what you mean. Read along with me." },
      interaction: { type: "read-along", text: "Good writers use capitals, end marks, and commas. Today you will write it right.", audio: A("hook-writer-rules-sentence") },
    },
    {
      id: "model-capital-names",
      purpose: "model",
      gate: "none",
      prompt: "Names get capital letters.",
      fx: {"text":"**Ben** plays on **Monday**.","effect":"underline"},
      narration: { audio: A("model-capital-names"), script: "Rule one. Names get capital letters. A person's name, like Ben. A day of the week, like Monday. A month of the year, like July. Each one starts with a capital letter. Look. Ben starts with capital B, and Monday starts with capital M." },
    },
    {
      id: "guided-fix-capitals",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap both words that need a capital.",
      image: IMG("dog-running"),
      narration: { audio: A("guided-fix-capitals"), script: "A friend wrote this note about his dog. But two words forgot their capital letters. One is a person's name, and one is a day of the week. Read the note and tap both words." },
      interaction: { type: "highlight", text: "My dog ben runs fast on monday.", targets: ["ben","monday"], coachWrong: "Read each word again. Is one a person's name? Is one a day of the week? Those words need capitals." },
    },
    {
      id: "apply-sort-capitals",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Does it need a capital letter? Sort each word.",
      narration: { audio: A("apply-sort-capitals"), script: "Read each word card. If it is a person's name, a day, or a month, it needs a capital letter when you write it. Send it to Needs Capital. If it is just a plain word, send it to Stays Small." },
      interaction: { type: "sort", buckets: ["Needs Capital","Stays Small"], items: [{ label: "meg", bucket: "Needs Capital" }, { label: "friday", bucket: "Needs Capital" }, { label: "july", bucket: "Needs Capital" }, { label: "dog", bucket: "Stays Small" }, { label: "cake", bucket: "Stays Small" }, { label: "run", bucket: "Stays Small" }], coachWrong: "Ask about that card. Is it a person, a day, or a month? Then it needs a capital. If not, it stays small." },
    },
    {
      id: "model-end-marks",
      purpose: "model",
      gate: "none",
      prompt: "Every sentence ends with a mark.",
      fx: {"text":"He **naps.** Can he **hop?** We **won!**","effect":"circle"},
      narration: { audio: A("model-end-marks"), script: "Rule two. Every sentence ends with a mark. A telling sentence ends with a period. He naps. An asking sentence ends with a question mark. Can he hop? And a sentence with a big feeling ends with an exclamation point. We won!" },
    },
    {
      id: "guided-pick-mark",
      purpose: "guided",
      gate: "interaction",
      prompt: "What a great day",
      narration: { audio: A("guided-pick-mark"), script: "This sentence lost its end mark. Listen. What a great day! Say it to yourself. Is it calmly telling, asking a question, or bursting with feeling? Tap the mark that fits." },
      interaction: { type: "choose", options: [{ id: "period", label: "." }, { id: "question", label: "?" }, { id: "exclaim", label: "!" }], correctId: "exclaim", coachWrong: "Say the sentence out loud. Does your voice stop flat, go up like a question, or burst with feeling?" },
    },
    {
      id: "model-commas",
      purpose: "model",
      gate: "none",
      prompt: "Commas rest in dates and lists.",
      fx: {"text":"July **4,** 2026","effect":"circle"},
      narration: { audio: A("model-commas"), script: "Rule three. Commas. A comma is a tiny curl that means, take a little rest. In a date, the comma sits right after the day number. July fourth, twenty twenty six. In a list, commas sit between the things. I like red, blue, and green. Hear the little rests? Red, blue, and green." },
    },
    {
      id: "guided-comma-date",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the date with the comma in the right spot.",
      narration: { audio: A("guided-comma-date"), script: "A party is on May tenth, twenty twenty six. One of these cards writes that date the right way. Read each card and tap the one with the comma resting in the right spot." },
      interaction: { type: "choose", options: [{ id: "comma-after-day", label: "May 10, 2026" }, { id: "comma-after-month", label: "May, 10 2026" }, { id: "comma-at-end", label: "May 10 2026," }], correctId: "comma-after-day", coachWrong: "Say the date out loud. Where does your voice take its little rest? The comma sits in that spot." },
    },
    {
      id: "apply-speak-list",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it aloud: I like apples, plums, and grapes.",
      image: IMG("fruit-bowl"),
      narration: { audio: A("apply-speak-list"), script: "This sentence is a list with commas. It is on your screen. Take a little rest at each comma, and read it out loud in a clear voice." },
      interaction: { type: "speak", text: "I like apples plums and grapes" },
    },
    {
      id: "model-spelling",
      purpose: "model",
      gate: "none",
      prompt: "Spell words the way they sound.",
      fx: {"text":"p l a n","effect":"pop-words"},
      narration: { audio: A("model-spelling"), script: "Rule four. Spell words the way they sound. Say the word slow and stretch it. Plan. p, l, a, n. Four sounds, four letters. Plan. When you write a word, say it slow, and give every sound its letter." },
    },
    {
      id: "guided-spell-plan",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which spelling matches the word you hear?",
      narration: { audio: A("guided-spell-plan"), script: "Listen. Plan. We made a plan to play. Say plan slow to yourself, sound by sound. Tap the spelling that matches." },
      interaction: { type: "choose", options: [{ id: "plan", label: "plan" }, { id: "plann", label: "plann" }, { id: "plane", label: "plane" }], correctId: "plan", coachWrong: "Say the word slow. Give every sound one letter. Then check each card, letter by letter." },
    },
    {
      id: "apply-spell-sled",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which spelling matches the word you hear?",
      narration: { audio: A("apply-spell-sled"), script: "One more. Listen. Sled. We ride a sled down the hill. Say sled slow, sound by sound. Tap the spelling that matches every sound." },
      interaction: { type: "choose", options: [{ id: "sled", label: "sled" }, { id: "slad", label: "slad" }, { id: "sledd", label: "sledd" }], correctId: "sled", coachWrong: "Stretch the word out loud. What letter makes each sound you hear?" },
    },
    {
      id: "challenge-fix-note",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap both words that need a capital.",
      image: IMG("lake-day"),
      narration: { audio: A("challenge-fix-note"), script: "Last note, all by yourself. Two words in this note forgot their capital letters. Read it and tap them both." },
      interaction: { type: "highlight", text: "We swim at the lake with sam in june.", targets: ["sam","june"], coachWrong: "Look for a person's name. Look for a month of the year. Those always get capitals." },
    },
    {
      id: "challenge-say-day",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: What day comes right after Monday?",
      narration: { audio: A("challenge-say-day"), script: "You know days of the week get capital letters. Now say one. Think about the order of the days. What day comes right after Monday? Tap the mic and say the day." },
      interaction: { type: "speak", text: "tuesday tuesdays" },
    },
    {
      id: "celebrate-write-it-right",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can write it right!",
      fx: {"text":"You can **write it right**!","effect":"fireworks"},
      narration: { audio: A("celebrate-write-it-right"), script: "Great writing! Names of people, days, and months start with capital letters. Every sentence ends with a period, a question mark, or an exclamation point. Commas take little rests in dates and lists. And you spell words the way they sound. You can write it right!" },
    },
  ],
};
