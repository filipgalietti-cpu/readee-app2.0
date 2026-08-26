import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-message-timings.json";

// Story Message (RL.1.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=story-message

const A = (id: string) => `/audio/lessons-v2/story-message/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-message/${w.toLowerCase()}.png`;

export const storyMessageImages: Record<string, string> = {
  "finn-and-bike": "A smiling cartoon boy with short brown hair and a blue shirt standing beside a shiny new red bike on a green lawn, no text anywhere",
  "finn-tries-again": "A hopeful cartoon boy with short brown hair, a blue shirt, and a small brave smile lifting his red bike up from the grass to try riding again, no text anywhere",
  "finn-rides": "A joyful cartoon boy with short brown hair and a blue shirt riding a red bike down a sunny country lane with a big grin, no text anywhere"
};

export const storyMessage: LessonDef = {
  id: "story-message",
  title: "Story Message",
  grade: "1st Grade",
  standard: "RL.1.2",
  archetype: "story-elements",
  objective: "I can retell a story in order and find its central message.",
  concepts: ["retelling","key details","story order","central message","big lesson"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a reader you are! You retold Finn's story in order with its key details. Then you found the story's message, the big lesson it teaches about life. Every story you read has a message waiting for you. Keep finding them!",
    "title": "You Found the Message!",
    "body": "You can retell a story in order and tell the big lesson it teaches."
  },
  scenes: [
    {
      id: "hook-meet-finn",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Finn and his new bike.",
      image: IMG("finn-and-bike"),
      narration: { audio: A("hook-meet-finn"), script: "Hello, reader! This is Finn, and that is his brand new bike. Today you will read Finn's story and retell it in order. Then you will do something new. You will find the story's message. That is the big lesson a story teaches us about life." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of Finn's story. Read along with me." },
      interaction: { type: "read-along", text: "Finn got a red bike with shiny wheels. He tried to ride it, but he fell in the grass.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "guided-first-detail",
      purpose: "guided",
      gate: "interaction",
      prompt: "What happened first?",
      narration: { audio: A("guided-first-detail"), script: "A good retell starts at the beginning. Think about page one. What happened first in the story? Read each choice, then tap the one that came first." },
      interaction: { type: "choose", options: [{ id: "got-a-bike", label: "Finn got a red bike" }, { id: "fell-in-grass", label: "Finn fell in the grass" }, { id: "rode-a-bus", label: "Finn rode a big bus" }], correctId: "got-a-bike", coachWrong: "Read page one again in your head. Which thing happened at the very start, before anything else?" },
    },
    {
      id: "apply-speak-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two aloud: Finn got up and tried again and again.",
      image: IMG("finn-tries-again"),
      narration: { audio: A("apply-speak-page-two"), script: "Page two is short, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "Finn got up and tried again and again" },
    },
    {
      id: "guided-read-page-three",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("guided-read-page-three"), script: "Did all that trying pay off? Page three tells us. Read it with me." },
      interaction: { type: "read-along", text: "Each day, Finn rode a bit more. One week later, he rode all the way down the lane. Finn grinned and said, \"I did it!\"", audio: A("guided-read-page-three-sentence") },
    },
    {
      id: "guided-end-detail",
      purpose: "guided",
      gate: "interaction",
      prompt: "How did the story end?",
      narration: { audio: A("guided-end-detail"), script: "A good retell ends at the end. Think about page three. How did Finn's story end? Read each choice, then tap the ending." },
      interaction: { type: "choose", options: [{ id: "rode-the-lane", label: "Finn rode down the lane" }, { id: "fell-again", label: "Finn fell in the grass" }, { id: "hid-the-bike", label: "Finn hid his bike" }], correctId: "rode-the-lane", coachWrong: "Think about the last page. What did Finn finally do after all those days of trying?" },
    },
    {
      id: "guided-retell-sequence",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the story. Put the parts in order.",
      narration: { audio: A("guided-retell-sequence"), script: "Now retell the whole story! Drag the story parts in order. What happened first, next, and last?" },
      interaction: { type: "sequence", items: [{ id: "tried-again", label: "Finn tried again and again" }, { id: "fell", label: "Finn fell in the grass" }, { id: "rode", label: "Finn rode down the lane" }], order: ["fell","tried-again","rode"], coachWrong: "Say the story to yourself from the start. What happened on page one, then page two, then page three?" },
    },
    {
      id: "model-what-is-a-message",
      purpose: "model",
      gate: "none",
      prompt: "What is a story's message?",
      fx: {"text":"The **message** is the lesson a story teaches.","effect":"glow"},
      narration: { audio: A("model-what-is-a-message"), script: "You retold the story. Now for the new part. Every story has a message. The message is the big lesson the story teaches us about life. Watch out! A message is not one thing that happened. Finn fell in the grass. That happened, but it is not a lesson. To find the message, ask, what does the whole story teach me? Think about what Finn did day after day, and how the story ended." },
    },
    {
      id: "apply-event-or-lesson",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which ones happened? Which ones teach?",
      narration: { audio: A("apply-event-or-lesson"), script: "Let's practice telling them apart. Some of these tell one thing that happened in a story. Some are lessons about life. Read each one and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Story Event","Lesson"], items: [{ label: "Finn fell", bucket: "Story Event" }, { label: "Be kind", bucket: "Lesson" }, { label: "Finn got a bike", bucket: "Story Event" }, { label: "Share your toys", bucket: "Lesson" }], coachWrong: "Ask yourself, did this happen one time in the story, or is it a lesson you could use in your own life?" },
    },
    {
      id: "challenge-find-the-message",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is the message of Finn's story?",
      narration: { audio: A("challenge-find-the-message"), script: "Challenge time! What is the message of Finn's story? Remember, the message is a lesson about life, not just one thing that happened. Read every choice, then tap the story's big lesson." },
      interaction: { type: "choose", options: [{ id: "keep-trying", label: "Keep trying till you get it" }, { id: "fell-event", label: "Finn fell in the grass" }, { id: "bikes-fast", label: "New bikes go fast" }, { id: "give-up", label: "It is best to give up" }], correctId: "keep-trying", coachWrong: "Is that a lesson about life, or just one thing that happened? Think about what Finn did every day, and how the story ended." },
    },
    {
      id: "challenge-say-the-message",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the story's big lesson out loud.",
      image: IMG("finn-rides"),
      narration: { audio: A("challenge-say-the-message"), script: "Now say it like a teacher! Tap the mic and tell me the big lesson of Finn's story in your own words." },
      interaction: { type: "speak", text: "keep trying try tried practice" },
    },
    {
      id: "celebrate-message-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the story's message!",
      fx: {"text":"You can retell a story and find its **message**!","effect":"fireworks"},
      narration: { audio: A("celebrate-message-finder"), script: "You did it! You retold Finn's story in order, and you found its message. Keep trying, just like Finn, and every story's big lesson will be yours!" },
    },
  ],
};
