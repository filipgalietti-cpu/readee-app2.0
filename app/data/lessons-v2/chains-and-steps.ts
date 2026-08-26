import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./chains-and-steps-timings.json";

// Chains & Steps (RI.2.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=chains-and-steps
// G2: ONE true process text "From Tree to Syrup" (how maple syrup is made), 4-step chain
// (tap the tree -> sap drips -> boil the sap -> syrup) across child-read pages.

const A = (id: string) => `/audio/lessons-v2/chains-and-steps/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/chains-and-steps/${w.toLowerCase()}.png`;

export const chainsAndStepsImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A nonfiction book cover style illustration of a quiet maple sugar grove in late winter, one tall bare maple tree with a small metal spout in its trunk and a silver bucket hanging from the spout, patches of snow on the ground, soft blue sky, realistic trees and bucket with no faces and no cartoon eyes on any object, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "tap-spout": { subject: "A close view of the same maple tree trunk with a small drilled hole and a metal spout tapped into the hole, a silver bucket hanging just below the spout, patches of snow in the background, realistic with no faces and no cartoon eyes on any object, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  "boiling-pan": { subject: "A wide shallow metal pan full of clear sap boiling over a low wood fire, thick white steam rising from the pan, inside a simple wooden sugarhouse, realistic with no faces and no cartoon eyes on any object, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  "syrup-jug": { subject: "A wide metal pan of thick golden maple syrup resting on a wooden table, a clear glass jug full of golden syrup standing on the table beside the pan, a wooden ladle resting inside the pan, a little gentle steam, warm golden color, realistic with no faces and no cartoon eyes on any object, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" }
};

export const chainsAndSteps: LessonDef = {
  id: "chains-and-steps",
  title: "Chains & Steps",
  grade: "2nd Grade",
  standard: "RI.2.3",
  archetype: "inference",
  objective: "I can explain how the steps in a true text connect, and why their order matters.",
  concepts: ["steps in a process","each step leads to the next","why order matters","what happens if a step is skipped"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a true text from tree to syrup, and you found the whole chain. You put the steps in order, you linked step to step, and you explained why the order matters. Tap the tree, catch the sap, boil it down, and the syrup appears. Every step leads to the next. When a text tells you how something is made, you know just what to do. Find the steps, and find the links between them.",
    "title": "You Found the Chain!",
    "body": "You linked the steps of a true text: tap the tree, catch the sap, boil it down, syrup. Each step leads to the next, and the order matters."
  },
  scenes: [
    {
      id: "hook-chain-idea",
      purpose: "hook",
      gate: "none",
      prompt: "Steps hook together like a chain.",
      image: IMG("cover"),
      fx: {"text":"Each step **leads to** the next.","effect":"glow"},
      narration: { audio: A("hook-chain-idea"), script: "Hello, reader! Today you get a true text about how something sweet is made. Fact texts often tell how things happen in steps. The steps hook together like links in a chain. Each step leads to the next one, and the order matters. Today you will read From Tree to Syrup, a true text about how maple syrup is made, and you will explain how its steps connect." },
    },
    {
      id: "model-tiny-chain",
      purpose: "model",
      gate: "none",
      prompt: "Watch me link two steps.",
      fx: {"text":"Pour the water, **then** it can freeze.","effect":"pop-words"},
      narration: { audio: A("model-tiny-chain"), script: "Watch me first, with a tiny chain about ice. I pour water into a tray. I put the tray in the freezer. The water freezes into ice cubes. Now watch my thinking. Could I freeze the water before I pour it into the tray? No. There would be nothing in the tray to freeze. The pouring step makes the freezing step possible. That is a chain. Each step leads to the next, and that is why the order matters." },
    },
    {
      id: "read-step-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read step one with me.",
      image: IMG("tap-spout"),
      narration: { audio: A("read-step-one"), script: "Time to read From Tree to Syrup. Every fact in it is true. The text has four steps, and each step is one link in the chain. Here is step one. Read along with me." },
      interaction: { type: "read-along", text: "Workers drill a small hole in a maple tree. Then they tap a spout into the hole.", audio: A("read-step-one-sentence") },
    },
    {
      id: "read-step-two",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read step two: Clear sap drips out of the spout, drop by drop. It falls into a bucket that hangs below.",
      narration: { audio: A("read-step-two"), script: "Step two is all yours. Tap the mic and read step two out loud." },
      interaction: { type: "speak", text: "Clear sap drips out of the spout drop by drop It falls into a bucket that hangs below" },
    },
    {
      id: "check-link-one-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "How do steps one and two hook together?",
      narration: { audio: A("check-link-one-two"), script: "Nice reading. Now link the first two steps. Step one said workers drill a small hole and tap a spout into it. Step two said clear sap drips out of the spout into a bucket. Think about how those two steps hook together. Tap the link that is true." },
      interaction: { type: "choose", options: [{ id: "tapping-leads-to-dripping", label: "tapping leads to dripping" }, { id: "dripping-leads-to-tapping", label: "dripping leads to tapping" }, { id: "the-bucket-drills-the-hole", label: "the bucket drills the hole" }, { id: "the-steps-do-not-connect", label: "the steps do not connect" }], correctId: "tapping-leads-to-dripping", coachWrong: "Think about the order. The sap cannot come out until something gives it a way out of the tree. Which step opens the way, and which step follows?" },
    },
    {
      id: "read-step-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read step three: The sap is boiled in a big pan for hours. The water steams away, little by little.",
      narration: { audio: A("read-step-three"), script: "Step three is yours too. Tap the mic and read step three out loud." },
      interaction: { type: "speak", text: "The sap is boiled in a big pan for hours The water steams away little by little" },
    },
    {
      id: "check-boil-first",
      purpose: "apply",
      gate: "interaction",
      prompt: "Could the workers boil BEFORE tapping the tree?",
      narration: { audio: A("check-boil-first"), script: "Here is a why question about the order. Step three said the sap is boiled in a big pan for hours. Could the workers do the boiling step before the tapping step? Think about what would be in the pan. Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "no-there-is-no-sap-yet", label: "no, there is no sap yet" }, { id: "yes-any-order-works", label: "yes, any order works" }, { id: "no-the-pan-is-too-small", label: "no, the pan is too small" }, { id: "yes-if-the-pan-is-hot", label: "yes, if the pan is hot" }], correctId: "no-there-is-no-sap-yet", coachWrong: "Walk the chain from the start. Before anyone can boil, an earlier step must fill the bucket. Has that step happened yet?" },
    },
    {
      id: "read-step-four",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the last step with me.",
      image: IMG("syrup-jug"),
      narration: { audio: A("read-step-four"), script: "One step left, and it is the sweetest one. Read the last step along with me." },
      interaction: { type: "read-along", text: "Thick golden syrup is left in the pan. It takes many buckets of sap to make one jug of syrup.", audio: A("read-step-four-sentence") },
    },
    {
      id: "check-link-three-four",
      purpose: "apply",
      gate: "interaction",
      prompt: "How do steps three and four hook together?",
      narration: { audio: A("check-link-three-four"), script: "Now link the last two steps. Step three said the water steams away while the sap boils. Step four said thick golden syrup is left in the pan. How do those two steps hook together? Tap the link that is true." },
      interaction: { type: "choose", options: [{ id: "boiling-leads-to-syrup", label: "boiling leads to syrup" }, { id: "syrup-leads-to-boiling", label: "syrup leads to boiling" }, { id: "the-jug-makes-the-sap", label: "the jug makes the sap" }, { id: "the-steps-do-not-connect", label: "the steps do not connect" }], correctId: "boiling-leads-to-syrup", coachWrong: "Think about the order. Which step happens first? A chain link points from the earlier step to the later one." },
    },
    {
      id: "sequence-build-chain",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Build the syrup chain. Drag the steps into order.",
      narration: { audio: A("sequence-build-chain"), script: "You read the whole chain. Now build it yourself. Here are the four steps, all mixed up. Drag them into the order they happen in the text." },
      interaction: { type: "sequence", items: [{ id: "tap-spout", label: "tap a spout into the tree" }, { id: "sap-drips", label: "sap drips into the bucket" }, { id: "boil-sap", label: "boil the sap in the pan" }, { id: "syrup-left", label: "golden syrup is left" }], order: ["tap-spout","sap-drips","boil-sap","syrup-left"], coachWrong: "Start at the very beginning. Ask what the workers must do first, before there is any sap at all. Then let each step lead to the next." },
    },
    {
      id: "check-skip-boiling",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What if the workers SKIPPED the boiling step?",
      image: IMG("boiling-pan"),
      narration: { audio: A("check-skip-boiling"), script: "Here is a what if question. Remember step three. The sap boils for hours, and the water steams away. What if the workers skipped the boiling step, and poured the sap straight into the jug? What would be in the jug? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "thin-watery-sap", label: "thin, watery sap" }, { id: "thick-golden-syrup", label: "thick golden syrup" }, { id: "dry-maple-sugar", label: "dry maple sugar" }, { id: "an-empty-jug", label: "an empty jug" }], correctId: "thin-watery-sap", coachWrong: "Skipping a step breaks the chain. The boiling step has a job. Think about what boiling takes out of the sap, and what the sap is like before that job is done." },
    },
    {
      id: "speak-explain-link",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it out loud: why must the sap boil before it becomes syrup?",
      narration: { audio: A("speak-explain-link"), script: "Last one, and it is out loud. Explain one link in the chain. Why must the sap boil before it can become syrup? Tap the mic and tell me why." },
      interaction: { type: "speak", text: "water steams steam steamed away boil boils boiled boiling thick thin sap syrup pan hours gone" },
    },
    {
      id: "celebrate-chain",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the chain!",
      fx: {"text":"Tap. Drip. Boil. **Syrup!**","effect":"fireworks"},
      narration: { audio: A("celebrate-chain"), script: "You read a true text from tree to syrup, and you found the whole chain. You put the steps in order, you linked step to step, and you explained why the order matters. Tap the tree, catch the sap, boil it down, and the syrup appears. Every step leads to the next. When a text tells you how something is made, you know just what to do. Find the steps, and find the links between them." },
    },
  ],
};
