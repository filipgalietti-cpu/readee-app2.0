import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-questions-timings.json";

// Fact Questions (RI.1.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-questions

const A = (id: string) => `/audio/lessons-v2/fact-questions/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-questions/${w.toLowerCase()}.png`;

export const factQuestionsImages: Record<string, string | { subject: string; ref?: string }> = {
  "ants": "A line of small black ants walking across brown soil with green grass in the background. Friendly nonfiction illustration, the ants look and act like real ants, no text anywhere.",
  "ant-nest": { subject: "A cutaway side view of an underground ant nest with small tunnels and rooms below green grass, small black ants walking inside the tunnels, no text anywhere", ref: "ants" },
  "ant-seed": { subject: "One plain small black ant carrying a big brown seed over its back while walking on brown soil, the ant looks like a real ant with nothing around its neck, no clothing or scarf of any kind, no text anywhere", ref: "ants" },
  "ant-trail": { subject: "A long line of small black ants following a winding path across brown soil toward a small ant hill, no text anywhere", ref: "ants" }
};

export const factQuestions: LessonDef = {
  id: "fact-questions",
  title: "Fact Questions",
  grade: "1st Grade",
  standard: "RI.1.1",
  archetype: "inference",
  objective: "I can ask and answer questions about facts in a book.",
  concepts: ["who","what","where","when","why","how"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a fact finder you are! You turned clue words into questions about real ants. Where, why, and how. Then you found every answer right in the fact book's words. Ask it and find it every time you read!",
    "title": "You Found the Facts!",
    "body": "You asked your own questions and proved every answer with the fact book's words."
  },
  scenes: [
    {
      id: "hook-meet-the-ants",
      purpose: "hook",
      gate: "none",
      prompt: "Let's read true ant facts!",
      image: IMG("ants"),
      narration: { audio: A("hook-meet-the-ants"), script: "Hello, reader! Real ants are amazing. Today we will read a fact book about them, and every fact in it is true. Curious readers ask questions. Who? What? Where? When? Why? How? Then they find each answer right in the book's words. Today you will do both." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our fact book. Read along with me." },
      interaction: { type: "read-along", text: "Ants live in nests under the ground. An ant has six legs.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-turn-where-into-question",
      purpose: "model",
      gate: "none",
      prompt: "Watch me turn where into a question.",
      fx: {"text":"**Where** do ants live?","effect":"glow"},
      narration: { audio: A("model-turn-where-into-question"), script: "Watch me turn a clue word into a question. My clue word is where. I ask, where do ants live? Now I hunt for the answer in the fact book's words. Page one says, ants live in nests under the ground. There it is! The book's own words gave me the answer. In nests under the ground." },
    },
    {
      id: "guided-pick-the-question",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question can page one answer?",
      narration: { audio: A("guided-pick-the-question"), script: "Now you ask! A curious reader asks a question the book can answer. Read all three questions. Tap the question that page one can answer." },
      interaction: { type: "choose", options: [{ id: "q-legs", label: "How many legs do ants have?" }, { id: "q-lunch", label: "What do ants eat for lunch?" }, { id: "q-race", label: "Who won the big race?" }], correctId: "q-legs", coachWrong: "Think about page one. Which question asks about something the page really said? Try again!" },
    },
    {
      id: "guided-find-legs",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many legs do ants have?",
      fx: {"text":"An ant has six legs.","effect":"underline"},
      narration: { audio: A("guided-find-legs"), script: "You picked a question page one can answer. Now find the answer! Here is the line from our fact book. Read it slowly. Then tap the answer the words give you." },
      interaction: { type: "choose", options: [{ id: "six-legs", label: "six legs" }, { id: "two-legs", label: "two legs" }, { id: "ten-legs", label: "ten legs" }], correctId: "six-legs", coachWrong: "Read the fact book line on the screen again. Point to each word. How many legs do those words say? Try again!" },
    },
    {
      id: "apply-speak-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two aloud: A strong ant can lift a big seed.",
      image: IMG("ant-seed"),
      narration: { audio: A("apply-speak-page-two"), script: "Page two is short, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "A strong ant can lift a big seed" },
    },
    {
      id: "apply-read-page-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("apply-read-page-three"), script: "Here is page three. It holds two more true ant facts. Read it with me, and keep your eyes open for clue words." },
      interaction: { type: "read-along", text: "Ants smell with two feelers. Ants leave a smell trail. The trail helps them find their way home.", audio: A("apply-read-page-three-sentence") },
    },
    {
      id: "model-why-reason",
      purpose: "model",
      gate: "none",
      prompt: "Why questions ask for a reason.",
      fx: {"text":"**Why** do ants leave a trail?","effect":"glow"},
      narration: { audio: A("model-why-reason"), script: "Two big clue words are left. Why and how! Why questions ask for a reason. Watch me. I ask, why do ants leave a smell trail? I hunt in the words. Page three says, the trail helps them find their way home. The word helps points at the reason. Ants leave a trail so they can find their way home. How questions ask about the way something happens. You will build one next!" },
    },
    {
      id: "apply-build-a-question",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the question: How do ants smell?",
      narration: { audio: A("apply-build-a-question"), script: "Now build a question all by yourself! Drag the words in order to ask, how do ants smell? The clue word goes first, and the question mark goes last." },
      interaction: { type: "sequence", items: [{ id: "do", label: "do" }, { id: "how", label: "How" }, { id: "smell", label: "smell" }, { id: "ants", label: "ants" }, { id: "q-mark", label: "?" }], order: ["how","do","ants","smell","q-mark"], coachWrong: "Say the question to yourself, how do ants smell? Drag each word as you say it. The question mark goes at the very end." },
    },
    {
      id: "apply-answer-how-smell",
      purpose: "apply",
      gate: "interaction",
      prompt: "How do ants smell?",
      fx: {"text":"Ants smell with two feelers.","effect":"underline"},
      narration: { audio: A("apply-answer-how-smell"), script: "You asked it. Now find it! Here is the line from page three. Read it slowly. Then tap the answer the words give you." },
      interaction: { type: "choose", options: [{ id: "with-two-feelers", label: "with two feelers" }, { id: "with-their-legs", label: "with their legs" }, { id: "with-a-soft-nose", label: "with a soft nose" }], correctId: "with-two-feelers", coachWrong: "Read the fact book line on the screen one more time. What do those words say ants smell with? Try again!" },
    },
    {
      id: "challenge-what-lift",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What can a strong ant lift?",
      narration: { audio: A("challenge-what-lift"), script: "Challenge time! Here is a what question. What can a strong ant lift? Think back to page two, the page you read out loud. Tap the answer." },
      interaction: { type: "choose", options: [{ id: "a-big-seed", label: "a big seed" }, { id: "a-tall-tree", label: "a tall tree" }, { id: "a-wet-rock", label: "a wet rock" }], correctId: "a-big-seed", coachWrong: "Think back to page two. You read it out loud. What did the words say a strong ant can lift? Try again!" },
    },
    {
      id: "challenge-speak-why",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: Why do ants leave a smell trail?",
      image: IMG("ant-trail"),
      narration: { audio: A("challenge-speak-why"), script: "Last challenge! Tap the mic and answer out loud. Why do ants leave a smell trail? Use the fact book's words to say the reason." },
      interaction: { type: "speak", text: "home find way helps" },
    },
    {
      id: "celebrate-fact-questions",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can ask it and find it!",
      fx: {"text":"You can **ask it** and **find it**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-questions"), script: "You did it! You turned clue words into questions about real ants. Where, why, and how. Then you found every answer right in the fact book's true words. Ask it and find it every time you read!" },
    },
  ],
};
