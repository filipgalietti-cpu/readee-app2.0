import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./prove-it-timings.json";

// Prove It! (RI.1.8) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=prove-it

const A = (id: string) => `/audio/lessons-v2/prove-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/prove-it/${w.toLowerCase()}.png`;

export const proveItImages: Record<string, string | { subject: string; ref?: string }> = {
  "dog-helper": "A friendly golden retriever dog wearing a real red service dog vest, sitting calmly next to a smiling child on a sunny sidewalk. Realistic working dog, no cartoon clothes, no smiling dog face. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "guide": { subject: "The same friendly golden retriever dog wearing a real guide dog harness with a handle, walking forward and leading an adult who holds the harness handle, on a sunny sidewalk near a crosswalk. No letters, no words, no numbers, no writing anywhere.", ref: "dog-helper" },
  "smell": { subject: "The same friendly golden retriever dog wearing a real orange search and rescue vest, nose down sniffing the ground on a forest trail, an adult handler standing a few steps behind holding a long leash. No letters, no words, no numbers, no writing anywhere.", ref: "dog-helper" },
  "fetch": { subject: "The same friendly golden retriever dog with no vest running across green park grass carrying a plain blue ball in its mouth, tail up, having fun. No people in the image. No letters, no words, no numbers, no writing anywhere.", ref: "dog-helper" },
};

export const proveIt: LessonDef = {
  id: "prove-it",
  title: "Prove It!",
  grade: "1st Grade",
  standard: "RI.1.8",
  archetype: "inference",
  objective: "I can find the author's point and the reasons that prove it.",
  concepts: ["the author makes a point","reasons after because prove the point","extra facts are true but do not prove it"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You proved it! An author makes a point, then gives reasons to prove it. A reason tells why the point is true. An extra fact is true, but it does not prove the point. When you read a fact book, find the point, then find every reason.",
    "title": "Proof Finder!",
    "body": "You can find an author's point and the reasons that prove it."
  },
  scenes: [
    {
      id: "hook-prove-it",
      purpose: "hook",
      gate: "none",
      prompt: "Authors prove their points.",
      image: IMG("dog-helper"),
      narration: { audio: A("hook-prove-it"), script: "Hello, proof finder! Today we open a fact book about helper dogs. An author of a fact book makes a point. That is the big idea the author wants you to believe. Then the author must prove it with reasons. A reason tells why the point is true. Let's find the point and the reasons that prove it." },
    },
    {
      id: "model-point-reasons",
      purpose: "model",
      gate: "none",
      prompt: "One point. Three reasons.",
      fx: {"text":"Dogs are great helpers **because**...","effect":"pop-words"},
      narration: { audio: A("model-point-reasons"), script: "Watch me work. The author's point is: dogs are great helpers. Can the author just say it? No! The author must prove it. So the author gives reasons. Dogs are great helpers because they can learn many jobs. Because they can smell what people cannot. Because they stay calm when people need help. One point, three reasons. Every reason tells why the point is true." },
    },
    {
      id: "read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one.",
      image: IMG("guide"),
      narration: { audio: A("read-page-one"), script: "Open our dog book. Here is page one. The author starts with the point, then gives the first reason. Read along." },
      interaction: { type: "read-along", text: "Dogs are great helpers. They can learn many jobs.", audio: A("read-page-one-sentence") },
    },
    {
      id: "read-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two.",
      image: IMG("smell"),
      narration: { audio: A("read-page-two"), script: "Turn the page. Page two gives two more reasons. Read along, and think about how each one proves the point." },
      interaction: { type: "read-along", text: "They can smell what people cannot. They stay calm when people need help.", audio: A("read-page-two-sentence") },
    },
    {
      id: "read-page-three",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page three.",
      image: IMG("fetch"),
      narration: { audio: A("read-page-three"), script: "One last page. This page is true too. But as you read, ask yourself: does this fact prove that dogs are great helpers?" },
      interaction: { type: "read-along", text: "Dogs also love to play with balls.", audio: A("read-page-three-sentence") },
    },
    {
      id: "guided-find-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence is the author's point?",
      image: IMG("dog-helper"),
      narration: { audio: A("guided-find-point"), script: "Think back to our book. It said: dogs are great helpers. They can learn many jobs. They can smell what people cannot. The point is the big idea the author wants to prove. The reasons tell why. Read each card. Tap the author's point." },
      interaction: { type: "choose", options: [{ id: "great-helpers", label: "dogs are great helpers" }, { id: "learn-jobs", label: "they can learn many jobs" }, { id: "smell-more", label: "they smell what we cannot" }], correctId: "great-helpers", coachWrong: "That card is a reason. It tells why. The point is the big idea the whole book tries to prove. Try again!" },
    },
    {
      id: "apply-speak-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the author's point aloud: Dogs are great helpers",
      image: IMG("dog-helper"),
      narration: { audio: A("apply-speak-point"), script: "You found the point! Now make it yours. Tap the mic and read the author's point out loud, nice and clear." },
      interaction: { type: "speak", text: "Dogs are great helpers" },
    },
    {
      id: "guided-count-reasons",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many reasons did the author give?",
      fx: {"text":"Count the **reasons**!","effect":"spotlight"},
      narration: { audio: A("guided-count-reasons"), script: "The author had to prove the point, so the author gave reasons. Listen and count. Dogs can learn many jobs. Dogs can smell what people cannot. Dogs stay calm when people need help. How many reasons is that? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "two", label: "two" }, { id: "three", label: "three" }, { id: "four", label: "four" }], correctId: "three", coachWrong: "Listen again and count on your fingers. Jobs. Smell. Calm. How many reasons did you count? Try again!" },
    },
    {
      id: "guided-sort-reason-extra",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Reason or extra fact?",
      narration: { audio: A("guided-sort-reason-extra"), script: "Here is the tricky part. Every card is true! But only some cards prove our point: dogs are great helpers. A card that tells why dogs are great helpers is a reason. A true card that does not prove the point is just extra. Read each card. Drag it to Reason or Extra." },
      interaction: { type: "sort", buckets: ["Reason","Extra"], items: [{ label: "they can learn many jobs", bucket: "Reason" }, { label: "they love to play with balls", bucket: "Extra" }, { label: "they smell what we cannot", bucket: "Reason" }, { label: "they have wet noses", bucket: "Extra" }], coachWrong: "Ask the question: does this fact tell why dogs are great helpers? If it tells why, it is a reason. If not, it is extra. Try again!" },
    },
    {
      id: "apply-which-reason",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which card proves dogs are great helpers?",
      narration: { audio: A("apply-which-reason"), script: "A new author makes the same point: dogs are great helpers. This author needs a reason to prove it. Every card is true, but only one card proves the point. Read each card. Tap the reason." },
      interaction: { type: "choose", options: [{ id: "find-lost", label: "they can find lost people" }, { id: "wag-tails", label: "they wag their happy tails" }, { id: "bark-loud", label: "they can bark very loud" }], correctId: "find-lost", coachWrong: "That card is true, but it does not tell why dogs are great helpers. Find the card that shows a dog truly helping. Try again!" },
    },
    {
      id: "challenge-new-book",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Find the reason that proves the point.",
      narration: { audio: A("challenge-new-book"), script: "Last challenge, proof finder. A brand new fact book! Listen to the page: Firefighters are brave. They run toward danger to help people. They also drive big red trucks. The author's point is: firefighters are brave. Read each card. Tap the reason that proves it." },
      interaction: { type: "choose", options: [{ id: "run-toward-danger", label: "they help people in danger" }, { id: "drive-red-trucks", label: "they drive big red trucks" }, { id: "eat-at-station", label: "they eat at the station" }], correctId: "run-toward-danger", coachWrong: "That fact does not prove firefighters are brave. A reason must tell why the point is true. Try again!" },
    },
    {
      id: "challenge-speak-reason",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one reason: why are dogs great helpers?",
      image: IMG("smell"),
      narration: { audio: A("challenge-speak-reason"), script: "Now prove it with your own voice. The point is: dogs are great helpers. Tap the mic and tell me one reason that proves it. You can start with because!" },
      interaction: { type: "speak", text: "jobs learn smell nose calm find lost help safe" },
    },
    {
      id: "celebrate-proof-finder",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You proved it!",
      fx: {"text":"You are a **Proof Finder**!","effect":"fireworks"},
      narration: { audio: A("celebrate-proof-finder"), script: "You did it, proof finder! You found the author's point: dogs are great helpers. You found the reasons that prove it: they learn jobs, they smell what people cannot, and they stay calm. And you spotted the extra facts that do not prove a thing. When an author makes a point, you know what to say: prove it!" },
    },
  ],
};
