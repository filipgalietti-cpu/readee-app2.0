import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./what-is-it-timings.json";

// What Is It? (L.1.5b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=what-is-it

const A = (id: string) => `/audio/lessons-v2/what-is-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/what-is-it/${w.toLowerCase()}.png`;

export const whatIsItImages: Record<string, string> = {
  "duck-swimming": "A cartoon yellow duck swimming on a calm blue pond, small ripples around it, green reeds at the water's edge. No text, no letters, no words anywhere.",
  "tiger-stripes": "A friendly cartoon orange tiger with bold black stripes standing in tall green grass. No text, no letters, no words anywhere.",
  "red-apple": "A single shiny red apple with a green leaf on its stem, on a plain soft-colored background. No text, no letters, no words anywhere.",
  "cow-field": "A friendly cartoon black and white spotted cow standing in a green farm field, a red barn far in the background. No text, no letters, no words anywhere.",
};

export const whatIsIt: LessonDef = {
  id: "what-is-it",
  title: "What Is It?",
  grade: "1st Grade",
  standard: "L.1.5b",
  archetype: "vocabulary",
  objective: "I can tell what a word means by naming its group and one special thing.",
  concepts: ["a definition names the group a thing belongs to","then it tells one special thing that is true","a definition can work like a riddle clue"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Great work today. A definition names the group a thing belongs to, then one special thing about it. A duck is a bird that swims. A tiger is a big cat with stripes. Keep building definitions for the things you see.",
    title: "What Is It? Solved!",
    body: "You can define a word by its group and one special thing about it!",
  },
  scenes: [
    {
      id: "hook-what-is-it",
      purpose: "hook",
      gate: "none",
      prompt: "What is it?",
      fx: { text: "What **is** it?", effect: "jelly" },
      narration: { audio: A("hook-what-is-it"), script: "What is a duck? What is a tiger? Today you will learn a word trick for telling exactly what a thing is. It works on ducks, tigers, apples, and almost anything. Let's learn the trick." },
    },
    {
      id: "model-the-formula",
      purpose: "model",
      gate: "none",
      prompt: "A duck is a bird that swims.",
      image: IMG("duck-swimming"),
      fx: { text: "a **bird** that **swims**", effect: "pop-words" },
      narration: { audio: A("model-the-formula"), script: "What is a duck? Here is the trick. First, name the group it belongs to. A duck is a bird. Then add one special thing about it. A duck is a bird that swims. Group first, then the special thing. Now you can tell anyone what a duck is." },
    },
    {
      id: "model-read-along",
      purpose: "model",
      gate: "interaction",
      prompt: "Read along with me.",
      narration: { audio: A("model-read-along"), script: "Let's read the trick together. Follow each word as we read." },
      interaction: { type: "read-along", text: "A duck is a bird that swims. A tiger is a big cat with stripes. Name the group. Then tell the special thing.", audio: A("model-read-along-sentence") },
    },
    {
      id: "guided-complete-tiger",
      purpose: "guided",
      gate: "interaction",
      prompt: "A tiger is a big cat with ___.",
      image: IMG("tiger-stripes"),
      narration: { audio: A("guided-complete-tiger"), script: "Your turn to finish a definition. Listen. A tiger is a big cat with what? The special thing is missing. Read the three words on your screen and tap the one that is true about a tiger." },
      interaction: { type: "choose", options: [{ id: "stripes", label: "stripes" }, { id: "wings", label: "wings" }, { id: "fins", label: "fins" }], correctId: "stripes", coachWrong: "Look at the tiger's coat. It is orange with dark lines all over it. Which word names those lines? Try again." },
    },
    {
      id: "guided-complete-apple",
      purpose: "guided",
      gate: "interaction",
      prompt: "An apple is a ___ that is sweet.",
      image: IMG("red-apple"),
      narration: { audio: A("guided-complete-apple"), script: "One more fix-it. Listen. An apple is a what, that is sweet? This time the group name is missing. Read the three words and tap the group an apple belongs to." },
      interaction: { type: "choose", options: [{ id: "fruit", label: "fruit" }, { id: "tool", label: "tool" }, { id: "bird", label: "bird" }], correctId: "fruit", coachWrong: "An apple is sweet, and you can eat it. Which group name fits something sweet that you eat? Try again." },
    },
    {
      id: "guided-speak-definition",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read it out loud: A duck is a bird that swims.",
      image: IMG("duck-swimming"),
      narration: { audio: A("guided-speak-definition"), script: "Now read a whole definition out loud. The sentence is on your screen. Read it in a big, clear voice." },
      interaction: { type: "speak", text: "A duck is a bird that swims" },
    },
    {
      id: "apply-build-duck",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the definition in order.",
      narration: { audio: A("apply-build-duck"), script: "Time to build a definition from parts. Read each card. Put the word first, then its group, then the special thing. Drag the parts into order." },
      interaction: { type: "sequence", items: [{ id: "word", label: "duck" }, { id: "group", label: "is a bird" }, { id: "special", label: "that swims" }], order: ["word","group","special"], coachWrong: "Read each part again. Start with the thing, then the group it belongs to, then the special thing it does. Try again." },
    },
    {
      id: "apply-sort-parts",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the cards: Group or Special.",
      narration: { audio: A("apply-sort-parts"), script: "Definitions have two kinds of parts. Some cards name a group, and some cards tell one special thing. Read each card and drag it to the box where it belongs." },
      interaction: { type: "sort", buckets: ["Group","Special"], items: [{ label: "bird", bucket: "Group" }, { label: "swims", bucket: "Special" }, { label: "fruit", bucket: "Group" }, { label: "sweet", bucket: "Special" }, { label: "big cat", bucket: "Group" }, { label: "stripes", bucket: "Special" }], coachWrong: "Read the card again. Is it the name of a big group of things, or is it one special thing about something? Try again." },
    },
    {
      id: "apply-riddle-penguin",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which animal is a bird that cannot fly but swims fast?",
      narration: { audio: A("apply-riddle-penguin"), script: "A definition can be a riddle, and the clues tell you the answer. Listen. It is a bird that cannot fly, but it swims fast. Read the three animal names and tap the one that fits both clues." },
      interaction: { type: "choose", options: [{ id: "penguin", label: "penguin" }, { id: "robin", label: "robin" }, { id: "fish", label: "fish" }], correctId: "penguin", coachWrong: "Check both clues. It must be a bird, and it must be a swimmer, not a flyer. Which animal fits both? Try again." },
    },
    {
      id: "challenge-riddle-spoon",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one is a tool you use to eat soup?",
      narration: { audio: A("challenge-riddle-spoon"), script: "Here is a trickier riddle. Listen. It is a tool that you use to eat soup. Read the three words and tap the one that fits the whole riddle." },
      interaction: { type: "choose", options: [{ id: "spoon", label: "spoon" }, { id: "fork", label: "fork" }, { id: "cup", label: "cup" }], correctId: "spoon", coachWrong: "Think about a bowl of warm soup. Which tool can scoop it up and carry it to your mouth? Try again." },
    },
    {
      id: "challenge-best-definition",
      purpose: "challenge",
      gate: "interaction",
      prompt: "An apple is ___. Tap the full definition.",
      narration: { audio: A("challenge-best-definition"), script: "A full definition does two jobs. It names the group, and it tells one special thing. Finish this sentence. An apple is, what? Read the three choices and tap the one that does both jobs." },
      interaction: { type: "choose", options: [{ id: "full-def", label: "a fruit that is sweet" }, { id: "attribute-only", label: "red and round" }, { id: "vague", label: "a thing" }], correctId: "full-def", coachWrong: "Read each choice again. Does it name the group an apple is in? Does it tell one special thing? You need the choice that does both. Try again." },
    },
    {
      id: "challenge-speak-cow",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell me: what is a cow?",
      image: IMG("cow-field"),
      narration: { audio: A("challenge-speak-cow"), script: "Now you make your own definition. Look at the picture. What is a cow? Press the microphone and tell me. You can name its group, or tell one special thing about it." },
      interaction: { type: "speak", text: "animal farm milk moo grass" },
    },
    {
      id: "celebrate-word-expert",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can tell what it is!",
      fx: { text: "You **did** it!", effect: "fireworks" },
      narration: { audio: A("celebrate-word-expert"), script: "What a word expert you are! You built definitions with a group and a special thing. A duck is a bird that swims. A tiger is a big cat with stripes. You even solved definition riddles. Keep telling what things are, everywhere you go." },
    },
  ],
};
