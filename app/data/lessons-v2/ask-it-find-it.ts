import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./ask-it-find-it-timings.json";

// Ask It, Find It (RL.1.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=ask-it-find-it

const A = (id: string) => `/audio/lessons-v2/ask-it-find-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/ask-it-find-it/${w.toLowerCase()}.png`;

export const askItFindItImages: Record<string, string> = {
  "jen-and-dot": "A smiling cartoon girl with brown hair kneeling beside a small red hen in a sunny farmyard, no text anywhere",
  "empty-box": "An open, completely empty wooden box on straw beside a small red farm shed, nothing inside the box, no text anywhere",
  "dot-on-eggs": "A small red hen sitting on three white eggs in a straw nest inside a cozy farm shed, no text anywhere"
};

export const askItFindIt: LessonDef = {
  id: "ask-it-find-it",
  title: "Ask It, Find It",
  grade: "1st Grade",
  standard: "RL.1.1",
  archetype: "story-elements",
  objective: "I can ask a question about a story and find the answer in its words.",
  concepts: ["who","what","where","when","why"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a reader you are! You turned clue words into questions. Who, what, where, when, and why. Then you found every answer right in the story's words. Ask it and find it every time you read!",
    "title": "You Asked It and Found It!",
    "body": "You asked your own questions and proved every answer with the story's words."
  },
  scenes: [
    {
      id: "hook-meet-jen-and-dot",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Jen and her hen, Dot.",
      image: IMG("jen-and-dot"),
      narration: { audio: A("hook-meet-jen-and-dot"), script: "Hello, reader! This is Jen, and this is her little red hen, Dot. Curious readers ask questions about a story. Who? What? Where? When? Why? Then they find each answer right in the story's words. Today you will read Jen and Dot's story and do both." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our story. Read along with me." },
      interaction: { type: "read-along", text: "Jen has a small red hen named Dot. Dot naps in a big box by the shed.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-turn-who-into-question",
      purpose: "model",
      gate: "none",
      prompt: "Watch me turn who into a question.",
      fx: {"text":"**Who** has a hen?","effect":"glow"},
      narration: { audio: A("model-turn-who-into-question"), script: "Watch me turn a clue word into a question. My clue word is who. I ask, who has a hen? Now I hunt for the answer in the story's words. Page one says, Jen has a small red hen. There it is. Jen! The story's own words gave me the answer." },
    },
    {
      id: "guided-pick-the-question",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question can our story answer?",
      narration: { audio: A("guided-pick-the-question"), script: "Now you ask! A curious reader asks a question the story can answer. Read all three questions. Tap the question that page one can answer." },
      interaction: { type: "choose", options: [{ id: "q-where-nap", label: "Where does Dot nap?" }, { id: "q-lunch", label: "What is for lunch?" }, { id: "q-race", label: "Who won the race?" }], correctId: "q-where-nap", coachWrong: "Think about page one. Which question asks about something the page really said?" },
    },
    {
      id: "guided-find-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does Dot nap? Find it in the words.",
      fx: {"text":"Dot naps in a big box by the shed.","effect":"underline"},
      narration: { audio: A("guided-find-where"), script: "You picked a great question. Now find its answer! Here are the story's words. Read them slowly. Then tap the answer the words give you." },
      interaction: { type: "choose", options: [{ id: "in-a-big-box", label: "in a big box" }, { id: "in-a-tall-tree", label: "in a tall tree" }, { id: "on-a-soft-bed", label: "on a soft bed" }], correctId: "in-a-big-box", coachWrong: "Read the story line on the screen again. Point to each word. Where do those words say Dot naps?" },
    },
    {
      id: "apply-speak-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two aloud: One morning, the box was empty!",
      image: IMG("empty-box"),
      narration: { audio: A("apply-speak-page-two"), script: "Page two is short, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "One morning the box was empty" },
    },
    {
      id: "guided-find-when",
      purpose: "guided",
      gate: "interaction",
      prompt: "When was the box empty?",
      fx: {"text":"One morning, the box was empty!","effect":"underline"},
      narration: { audio: A("guided-find-when"), script: "You just read a when clue. When questions ask about time. Here are page two's words. When was the box empty? Tap the answer you find in the words." },
      interaction: { type: "choose", options: [{ id: "one-morning", label: "one morning" }, { id: "at-night", label: "at night" }, { id: "after-lunch", label: "after lunch" }], correctId: "one-morning", coachWrong: "Read the story line on the screen one more time. Which words tell the time it happened?" },
    },
    {
      id: "apply-read-page-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("apply-read-page-three"), script: "Where did Dot go? Page three holds the clues. Read it with me, and keep your detective eyes open." },
      interaction: { type: "read-along", text: "Jen ran to the shed. Dot sat on three white eggs! Dot hid there to keep her eggs safe.", audio: A("apply-read-page-three-sentence") },
    },
    {
      id: "apply-what-eggs",
      purpose: "apply",
      gate: "interaction",
      prompt: "What did Dot sit on?",
      narration: { audio: A("apply-what-eggs"), script: "Time for a what question. What did Dot sit on? Think about the words you just read on page three. Tap the answer." },
      interaction: { type: "choose", options: [{ id: "three-white-eggs", label: "three white eggs" }, { id: "a-red-ball", label: "a red ball" }, { id: "soft-green-grass", label: "soft green grass" }], correctId: "three-white-eggs", coachWrong: "Think back to page three. Jen ran to the shed and saw Dot sitting on something. What did the words say it was?" },
    },
    {
      id: "apply-build-a-question",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the question: Where did Dot hide?",
      narration: { audio: A("apply-build-a-question"), script: "Now build a question all by yourself! Drag the words in order to ask, where did Dot hide? The clue word goes first, and the question mark goes last." },
      interaction: { type: "sequence", items: [{ id: "did", label: "did" }, { id: "where", label: "Where" }, { id: "hide", label: "hide" }, { id: "dot", label: "Dot" }, { id: "q-mark", label: "?" }], order: ["where","did","dot","hide","q-mark"], coachWrong: "Say the question to yourself, where did Dot hide? Drag each word as you say it. The question mark goes at the very end." },
    },
    {
      id: "apply-answer-where-hide",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where did Dot hide?",
      narration: { audio: A("apply-answer-where-hide"), script: "You asked it. Now find it! Where did Dot hide? Think about where Jen ran on page three. Tap the answer." },
      interaction: { type: "choose", options: [{ id: "in-the-shed", label: "in the shed" }, { id: "in-the-box", label: "in the box" }, { id: "in-a-tree", label: "in a tree" }], correctId: "in-the-shed", coachWrong: "The box was empty, remember? Jen ran somewhere to look, and Dot was there. Where did Jen run?" },
    },
    {
      id: "model-why",
      purpose: "model",
      gate: "none",
      prompt: "Why questions ask for a reason.",
      fx: {"text":"**Why** did Dot hide?","effect":"glow"},
      narration: { audio: A("model-why"), script: "Here is the biggest clue word of all. Why! Why questions ask for a reason. Watch me. I ask, why did Dot hide in the shed? I hunt in the words. Page three says, Dot hid there to keep her eggs safe. The word to points at the reason. Dot wanted her eggs to be safe." },
    },
    {
      id: "challenge-speak-why",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: Why did Dot hide in the shed?",
      image: IMG("dot-on-eggs"),
      narration: { audio: A("challenge-speak-why"), script: "Challenge time! Tap the mic and answer out loud. Why did Dot hide in the shed? Use the story's words to tell me the reason." },
      interaction: { type: "speak", text: "safe eggs keep protect" },
    },
    {
      id: "celebrate-ask-it-find-it",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can ask it and find it!",
      fx: {"text":"You can **ask it** and **find it**!","effect":"fireworks"},
      narration: { audio: A("celebrate-ask-it-find-it"), script: "What a reader you are! You turned clue words into questions. Who, what, where, when, and why. Then you found every answer right in the story's words. Ask it and find it every time you read!" },
    },
  ],
};
