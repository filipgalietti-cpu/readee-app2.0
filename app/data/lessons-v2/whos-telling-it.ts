import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./whos-telling-it-timings.json";

// Who's Telling It (RL.1.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=whos-telling-it

const A = (id: string) => `/audio/lessons-v2/whos-telling-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/whos-telling-it/${w.toLowerCase()}.png`;

export const whosTellingItImages: Record<string, string> = {
  "pond-scene": "A cheerful young girl and a young boy standing at the grassy edge of a calm blue pond, tossing small pieces of bread to a happy duck floating on the water, bright 2D cartoon illustration with bold clean outlines and vibrant saturated colors, no letters and no words anywhere in the picture."
};

export const whosTellingIt: LessonDef = {
  id: "whos-telling-it",
  title: "Who's Telling It",
  grade: "1st Grade",
  standard: "RL.1.6",
  archetype: "story-elements",
  objective: "I can find out who is telling the story at each part.",
  concepts: ["a character telling their own story says I and me","a narrator outside the story says he, she, and they","dialogue in quotes is a character speaking out loud"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You learned to find the teller. The words I and me show a character telling their own story. The words he, she, and they show a narrator. Quote marks show a character talking out loud. Great work!",
    "title": "You Found the Teller!",
    "body": "You can tell who is telling the story at each part."
  },
  scenes: [
    {
      id: "hook-who-is-telling",
      purpose: "hook",
      gate: "none",
      prompt: "Who is telling the story?",
      image: IMG("pond-scene"),
      narration: { audio: A("hook-who-is-telling"), script: "Every story has a teller. Sometimes a character in the story tells it. Sometimes a narrator, someone outside the story, tells it. And sometimes a character talks out loud. Today you will find the teller in each part of a story about Rosa and Ben." },
    },
    {
      id: "model-character-telling",
      purpose: "model",
      gate: "none",
      prompt: "The words I and me show a character telling their own story.",
      fx: { text: "**I** ran to the pond. **My** legs are quick.", effect: "underline" },
      narration: { audio: A("model-character-telling"), script: "When a character tells their own story, they use the words I and me. Read this part. I ran to the pond. My legs are quick. The words I and my show that a character is the teller." },
    },
    {
      id: "model-narrator",
      purpose: "model",
      gate: "none",
      prompt: "The words he, she, and they show a narrator.",
      fx: { text: "**She** saw a duck. **They** ran home.", effect: "underline" },
      narration: { audio: A("model-narrator"), script: "A narrator tells the story from outside it. A narrator uses the words he, she, and they. Read this part. She saw a duck. They ran home. The words she and they show that a narrator is the teller." },
    },
    {
      id: "model-dialogue",
      purpose: "model",
      gate: "none",
      prompt: "Quote marks show a character talking out loud.",
      fx: { text: "Rosa said, **\"I want to feed it!\"**", effect: "underline" },
      narration: { audio: A("model-dialogue"), script: "When a character talks out loud, their words go inside quote marks. Read this part. Rosa said, I want to feed it. The quote marks around I want to feed it show that Rosa is talking out loud." },
    },
    {
      id: "guided-choose-character",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is telling this part?",
      narration: { audio: A("guided-choose-character"), script: "Your turn. Listen to this story part. I ran fast. My legs got tired. Who is telling this part? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-character", label: "a character in the story" }, { id: "a-narrator", label: "a narrator" }, { id: "the-reader", label: "the reader" }], correctId: "a-character", coachWrong: "Look for the words I, me, and my. Who would say those about their own self? Try again!" },
    },
    {
      id: "guided-choose-narrator",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is telling this part?",
      narration: { audio: A("guided-choose-narrator"), script: "Great. Listen to a new part. She saw a duck. They ran to the pond. Who is telling this part? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-narrator", label: "a narrator" }, { id: "a-character", label: "a character in the story" }, { id: "the-reader", label: "the reader" }], correctId: "a-narrator", coachWrong: "The teller uses she and they, not I or me. Try again!" },
    },
    {
      id: "guided-choose-dialogue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is talking out loud?",
      narration: { audio: A("guided-choose-dialogue"), script: "Now listen for who talks out loud. In the story, I want to feed it, said Rosa. Who is talking out loud? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "rosa", label: "rosa" }, { id: "ben", label: "ben" }, { id: "a-narrator", label: "a narrator" }], correctId: "rosa", coachWrong: "The quote marks hold the words a character says out loud. The line tells you who said them. Try again!" },
    },
    {
      id: "guided-choose-clue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which clue shows a character is talking out loud?",
      narration: { audio: A("guided-choose-clue"), script: "In the line, I want to feed it, said Rosa, one clue shows a character is talking out loud. Read each card. Tap the clue." },
      interaction: { type: "choose", options: [{ id: "quote-marks", label: "the quote marks" }, { id: "word-duck", label: "the word duck" }, { id: "word-pond", label: "the word pond" }], correctId: "quote-marks", coachWrong: "The clue is not a naming word. It holds the exact words a character says out loud. Try again!" },
    },
    {
      id: "apply-passage-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read this story with me.",
      narration: { audio: A("apply-passage-read"), script: "Read this story about Rosa and Ben. Notice who is telling each part." },
      interaction: { type: "read-along", text: "Rosa ran to the pond. She saw a duck. \"I want to feed it!\" said Rosa. \"Here is some bread,\" said Ben. They fed the duck together.", audio: A("apply-passage-read-sentence") },
    },
    {
      id: "apply-choose-narrator-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Who is telling this part?",
      narration: { audio: A("apply-choose-narrator-line"), script: "In the story, one part says, they fed the duck together. Who is telling that part? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-narrator", label: "a narrator" }, { id: "rosa", label: "rosa" }, { id: "ben", label: "ben" }], correctId: "a-narrator", coachWrong: "The word they is a narrator word, not I or me. Try again!" },
    },
    {
      id: "apply-speak-dialogue-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read Rosa's words out loud: I want to feed it.",
      narration: { audio: A("apply-speak-dialogue-line"), script: "Rosa says these words out loud in the story. Tap the mic and read her words: I want to feed it." },
      interaction: { type: "speak", text: "i want to feed it" },
    },
    {
      id: "apply-sort-lines",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the lines from our story.",
      narration: { audio: A("apply-sort-lines"), script: "Here are lines from the story. Is each line told by the narrator, or is it a character speaking out loud? Read each line. Drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Narrator","Speaking"], items: [{ label: "she saw a duck", bucket: "Narrator" }, { label: "\"i want to feed it!\"", bucket: "Speaking" }, { label: "they fed the duck", bucket: "Narrator" }, { label: "\"here is some bread\"", bucket: "Speaking" }], coachWrong: "Words inside quote marks are spoken out loud. Lines with he, she, or they are the narrator. Try again!" },
    },
    {
      id: "challenge-speak-who",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say who is telling this part!",
      narration: { audio: A("challenge-speak-who"), script: "Last one. Listen to a new part. She ran home fast. Who is telling this part, a narrator or a character? Tap the mic and say who is telling it." },
      interaction: { type: "speak", text: "a narrator narrator" },
    },
    {
      id: "celebrate-teller-found",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You found the teller!",
      fx: { text: "You can find **who is telling** the story!", effect: "fireworks" },
      narration: { audio: A("celebrate-teller-found"), script: "You found the teller in every part. When you see I and me, a character is telling their own story. When you see he, she, and they, a narrator is telling it. When words sit inside quote marks, a character is talking out loud. Great reading!" },
    },
  ],
};
