import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./check-and-fix-timings.json";

// Check and Fix (RF.1.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=check-and-fix

const A = (id: string) => `/audio/lessons-v2/check-and-fix/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/check-and-fix/${w.toLowerCase()}.png`;

export const checkAndFixImages: Record<string, string | { subject: string; ref?: string }> = {
  "farm-barn": "A big red barn with white trim on a sunny green farm, a wooden fence and a dirt path in front, rolling green hills and a bright blue sky with small white clouds, no people and no animals, no text anywhere",
  "sam-horse": { subject: "A smiling cartoon boy with short black hair in a green shirt and blue jeans riding a big friendly brown horse along the wooden fence, the red barn with white trim far behind them, sunny green farm, no text anywhere", ref: "farm-barn" },
  "pup-barn": { subject: "A small happy golden puppy running along the dirt path toward the wide open door of the red barn with white trim, seen from behind the puppy, wooden fence on one side, sunny green farm, no people, no text anywhere", ref: "farm-barn" }
};

export const checkAndFix: LessonDef = {
  id: "check-and-fix",
  title: "Check and Fix",
  grade: "1st Grade",
  standard: "RF.1.4c",
  archetype: "fluency",
  objective: "I can stop, check, and fix a word that does not make sense.",
  concepts: ["self-correct", "context", "check and fix", "does it make sense"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, careful reader! You read the whole farm book and fixed every mixed-up word. When a word does not make sense, you know just what to do. Stop, check the letters and the meaning, and fix it. Keep checking your reading every day!",
    "title": "You Can Check and Fix!",
    "body": "You stopped, checked, and fixed every word that did not make sense."
  },
  scenes: [
    {
      id: "hook-farm-book",
      purpose: "hook",
      gate: "none",
      prompt: "Let's read a little farm book together.",
      image: IMG("farm-barn"),
      narration: { audio: A("hook-farm-book"), script: "Hello, reader! Today we read a little book about a day at the farm. Careful readers do a quick check while they read. They ask, does that make sense? If a word does not make sense, they stop, check it, and fix it. Watch me do it first." },
    },
    {
      id: "model-house-horse",
      purpose: "model",
      gate: "none",
      prompt: "Listen. I will read page one.",
      image: IMG("sam-horse"),
      narration: { audio: A("model-house-horse"), script: "Listen while I read page one. Sam rode the big brown house. Wait. House? You cannot ride a house. That does not make sense. So I stop and check. I check the letters. h, o, r, s, e. That word is horse! I read it again. Sam rode the big brown horse. I checked it and fixed it, and now the page makes sense." },
    },
    {
      id: "apply-speak-horse",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page one: Sam rode the big brown horse.",
      image: IMG("sam-horse"),
      narration: { audio: A("apply-speak-horse"), script: "Your turn! Page one is fixed. Read the fixed page out loud, nice and smooth." },
      interaction: { type: "speak", text: "Sam rode the big brown horse" },
    },
    {
      id: "guided-makes-sense",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the line that makes sense.",
      narration: { audio: A("guided-makes-sense"), script: "Now you try the check. Here are three lines from another farm book. Only one of them makes sense. Read each line to yourself and ask, does it make sense? Tap the line that makes sense." },
      interaction: { type: "choose", options: [{ id: "hen-egg", label: "A hen can lay an egg." }, { id: "hen-leg", label: "A hen can lay a leg." }, { id: "hen-peg", label: "A hen can lay a peg." }], correctId: "hen-egg", coachWrong: "Read the line again slowly. Ask yourself, can a hen really do that? Try again." },
    },
    {
      id: "guided-sort-check",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Does each line make sense?",
      narration: { audio: A("guided-sort-check"), script: "Time to sort. Read each line and ask the check question, does it make sense? If the line makes sense, drag it to makes sense. If a word in it seems mixed up, drag it to check it." },
      interaction: { type: "sort", buckets: ["Makes Sense","Check It"], items: [{ label: "A dog can bark.", bucket: "Makes Sense" }, { label: "I rode a house.", bucket: "Check It" }, { label: "The sun is hot.", bucket: "Makes Sense" }, { label: "He naps in his bad.", bucket: "Check It" }], coachWrong: "Read the line one word at a time. If every word makes sense, it goes to makes sense. If one word seems wrong, it goes to check it. Try again." },
    },
    {
      id: "guided-tap-goat",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the word that does not make sense.",
      narration: { audio: A("guided-tap-goat"), script: "Here is page two of our farm book, and one word on it does not make sense. Read the page yourself, one word at a time, and ask the check question. Does it make sense? Then tap the word that does not make sense." },
      interaction: { type: "highlight", text: "Sam put on his goat and ran out to play.", targets: ["goat"], coachWrong: "Read the page again slowly. Which word is a thing Sam could never put on? Try again." },
    },
    {
      id: "guided-fix-goat",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word fixes the page?",
      narration: { audio: A("guided-fix-goat"), script: "You found it! Goat does not make sense there. The real word looks a lot like goat, but it means something Sam can put on. Check the letters. Read each choice, then tap the word that fixes the page." },
      interaction: { type: "choose", options: [{ id: "coat", label: "coat" }, { id: "goal", label: "goal" }, { id: "boat", label: "boat" }], correctId: "coat", coachWrong: "Check the letters and the meaning. Sam puts it on before he runs out to play. Try again." },
    },
    {
      id: "apply-speak-coat",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two: Sam put on his coat and ran out to play.",
      narration: { audio: A("apply-speak-coat"), script: "Page two is all fixed now. Read the fixed page out loud, nice and smooth." },
      interaction: { type: "speak", text: "Sam put on his coat and ran out to play" },
    },
    {
      id: "challenge-tap-back",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the word that does not make sense.",
      narration: { audio: A("challenge-tap-back"), script: "Here is the last page of the farm book, and it has one mixed-up word too. Read the page slowly, all by yourself, and do the check. Then tap the word that does not make sense." },
      interaction: { type: "highlight", text: "The pup ran bark to the barn.", targets: ["bark"], coachWrong: "Read the page slowly, one word at a time. Which word does not fit its spot in the line? Try again." },
    },
    {
      id: "challenge-fix-back",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word fixes the page?",
      narration: { audio: A("challenge-fix-back"), script: "You found it! Bark does not make sense in that spot. The real word looks a lot like bark. Check the letters and the meaning. Read each choice, then tap the word that fixes the page." },
      interaction: { type: "choose", options: [{ id: "back", label: "back" }, { id: "bank", label: "bank" }, { id: "dark", label: "dark" }], correctId: "back", coachWrong: "Put each choice in the line and read it. The pup ran, your word, to the barn. Which one makes the line make sense? Try again." },
    },
    {
      id: "challenge-speak-back",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the last page: The pup ran back to the barn.",
      image: IMG("pup-barn"),
      narration: { audio: A("challenge-speak-back"), script: "You fixed the whole farm book! Now read the last page out loud the fixed way." },
      interaction: { type: "speak", text: "The pup ran back to the barn" },
    },
    {
      id: "celebrate-check-fix",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can check and fix!",
      fx: {"text":"You can **check and fix**!","effect":"fireworks"},
      narration: { audio: A("celebrate-check-fix"), script: "What careful reading! You stopped at every word that did not make sense, checked the letters and the meaning, and fixed it. House became horse, goat became coat, and bark became back. Keep asking, does it make sense? That is what strong readers do!" },
    },
  ],
};
