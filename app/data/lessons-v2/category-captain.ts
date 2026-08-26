import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./category-captain-timings.json";

// Category Captain (L.1.5a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=category-captain

const A = (id: string) => `/audio/lessons-v2/category-captain/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/category-captain/${w.toLowerCase()}.png`;

export const categoryCaptainImages: Record<string, string> = {
  "sky-flyers": "A cartoon daytime sky scene with a small blue bird flying, a red toy airplane soaring, and a colorful diamond kite with a long tail, all up in the sky together over green hills. No text, no letters, no words anywhere.",
  "animal-moves": "A cartoon outdoor scene: a blue bird flying high in the sky, a brown dog running on green grass, and a big clear blue pond with an orange fish fully underwater below the water surface line, only its body under water. No text, no letters, no words anywhere.",
  "sea-swimmers": "A cartoon underwater ocean scene with a small orange fish, a grey shark, and a big blue whale all swimming together, bubbles rising. No text, no letters, no words anywhere.",
  "bat-flying": "A cute cartoon brown bat with wide wings flying in a dusk sky with a big yellow moon behind it. No text, no letters, no words anywhere.",
};

export const categoryCaptain: LessonDef = {
  id: "category-captain",
  title: "Category Captain",
  grade: "1st Grade",
  standard: "L.1.5a",
  archetype: "vocabulary",
  objective: "I can sort words into categories and tell why they belong.",
  concepts: ["a category is a group of things alike in one way","name what they share and you name the category","some words fit two categories, pick the best one for the ask"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Great sorting today, Captain. A category is a group of things that are alike in one way. You sorted foods and tools, animals that fly, swim, or stay on the ground, and school things and beach things. You even found a word that fits two categories. Keep sorting words everywhere you go.",
    title: "Mission Complete!",
    body: "You can sort words into categories and tell why they belong!",
  },
  scenes: [
    {
      id: "hook-word-spill",
      purpose: "hook",
      gate: "none",
      prompt: "The word box tipped over!",
      fx: { text: "Sort the words into **categories**!", effect: "jelly" },
      narration: { audio: A("hook-word-spill"), script: "Captain, we need you! A big box of word cards tipped over, and now the words are all mixed up. Today you will sort words into groups called categories, and you will tell why each word belongs. Let's get sorting." },
    },
    {
      id: "model-what-is-a-category",
      purpose: "model",
      gate: "none",
      prompt: "What do all three have in common?",
      image: IMG("sky-flyers"),
      narration: { audio: A("model-what-is-a-category"), script: "A category is a group of things that are alike in one way. Look at this picture. A bird, a plane, and a kite. What do all three have in common? They all fly! So they belong in one category, things that fly. When you name what is the same, you name the category." },
    },
    {
      id: "read-along-category",
      purpose: "model",
      gate: "none",
      prompt: "Read along with me.",
      narration: { audio: A("read-along-category"), script: "Let's read about categories together. Follow each word as we read." },
      interaction: { type: "read-along", text: "A category is a group. The things in a group are alike in one way. A bird, a plane, and a kite can all fly. Flying is the thing they share. Name what they share, and you name the group.", audio: A("read-along-category-sentence") },
    },
    {
      id: "guided-name-the-category",
      purpose: "guided",
      gate: "interaction",
      prompt: "milk, cheese, apple",
      narration: { audio: A("guided-name-the-category"), script: "Your turn, Captain. Read the three words on your screen. Think of one way all three are alike. Then tap the name of their category." },
      interaction: { type: "choose", options: [{ id: "foods", label: "foods" }, { id: "animals", label: "animals" }, { id: "colors", label: "colors" }], correctId: "foods", coachWrong: "Read the three words again. Milk, cheese, apple. Think about one thing you can do with all three of them. Try again." },
    },
    {
      id: "guided-sort-foods-tools",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: Foods or Tools.",
      narration: { audio: A("guided-sort-foods-tools"), script: "Time to sort a whole spill, Captain. Read each word card. Ask yourself, can I eat or drink this, or do I work with it? Drag each word to the Foods box or the Tools box." },
      interaction: { type: "sort", buckets: ["Foods","Tools"], items: [{ label: "corn", bucket: "Foods" }, { label: "saw", bucket: "Tools" }, { label: "milk", bucket: "Foods" }, { label: "hammer", bucket: "Tools" }, { label: "cheese", bucket: "Foods" }, { label: "broom", bucket: "Tools" }], coachWrong: "Read the word again. Can you eat or drink it, or do you work with it? Put it in the box that fits. Try again." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the sentence out loud.",
      narration: { audio: A("apply-speak-read"), script: "Captain's log time. The sentence is on your screen. Read it out loud in a big, clear voice." },
      interaction: { type: "speak", text: "A hammer is a tool and an apple is a food" },
    },
    {
      id: "model-animals-move",
      purpose: "model",
      gate: "none",
      prompt: "One big group can hide smaller groups.",
      image: IMG("animal-moves"),
      narration: { audio: A("model-animals-move"), script: "Here is a captain's secret. One big category can hide smaller ones. Animals is a big category. But watch. A bird flies in the sky. A fish swims in the water. A dog runs on the ground. We can sort animals by how they move. Fly, swim, or ground." },
    },
    {
      id: "apply-sort-animal-moves",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the animals by how they move.",
      narration: { audio: A("apply-sort-animal-moves"), script: "Sort these animals by how they move, Captain. Read each animal word and picture that animal moving. Then drag it to the box that fits." },
      interaction: { type: "sort", buckets: ["Fly","Swim","Ground"], items: [{ label: "bee", bucket: "Fly" }, { label: "shark", bucket: "Swim" }, { label: "cow", bucket: "Ground" }, { label: "bird", bucket: "Fly" }, { label: "fish", bucket: "Swim" }, { label: "dog", bucket: "Ground" }], coachWrong: "Read the animal word again. Picture it moving. Does it zip through the sky, glide through water, or move on land? Try again." },
    },
    {
      id: "apply-speak-name-category",
      purpose: "apply",
      gate: "interaction",
      prompt: "fish, shark, whale. What do all three do?",
      image: IMG("sea-swimmers"),
      narration: { audio: A("apply-speak-name-category"), script: "Now you name the category, Captain. Read the three words on your screen and look at the picture. What can all three of these animals do? Press the microphone and say it." },
      interaction: { type: "speak", text: "swim swims swimming" },
    },
    {
      id: "model-two-boxes-bat",
      purpose: "model",
      gate: "none",
      prompt: "Some words fit two categories.",
      image: IMG("bat-flying"),
      narration: { audio: A("model-two-boxes-bat"), script: "Here is a tricky one, Captain. A bat is an animal, and a bat can also fly. Some words fit two categories, and that is okay. When a word fits two boxes, read the ask and pick the box that fits best. If the ask is how it moves, bat goes with fly." },
    },
    {
      id: "challenge-odd-one-out",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word does NOT belong?",
      narration: { audio: A("challenge-odd-one-out"), script: "Challenge time, no picture help. Read all four words. Three of them belong in the same category. One does not. Tap the word that does not belong, and think about why." },
      interaction: { type: "choose", options: [{ id: "desk", label: "desk" }, { id: "book", label: "book" }, { id: "kite", label: "kite" }, { id: "pencil", label: "pencil" }], correctId: "kite", coachWrong: "Read each word and ask, where do I use this? Three of them share the same place. One does not. Try again." },
    },
    {
      id: "challenge-fits-both",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word fits BOTH: animals and things that fly?",
      narration: { audio: A("challenge-fits-both"), script: "Last tap, Captain. Some words fit two categories. Read the three words. One of them names an animal that can also fly. Tap the word that fits both categories." },
      interaction: { type: "choose", options: [{ id: "bat", label: "bat" }, { id: "kite", label: "kite" }, { id: "dog", label: "dog" }], correctId: "bat", coachWrong: "Read each word again. Ask two questions. Is it an animal? Can it fly? You need the word where both answers are yes. Try again." },
    },
    {
      id: "challenge-sort-school-beach",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Final sort: School or Beach.",
      narration: { audio: A("challenge-sort-school-beach"), script: "Final sort, Captain. Read each word and picture the place where it belongs. Then drag each word to the School box or the Beach box." },
      interaction: { type: "sort", buckets: ["School","Beach"], items: [{ label: "pencil", bucket: "School" }, { label: "shell", bucket: "Beach" }, { label: "desk", bucket: "School" }, { label: "sand", bucket: "Beach" }, { label: "book", bucket: "School" }, { label: "crab", bucket: "Beach" }], coachWrong: "Read the word again. Close your eyes and picture the place where you would find it. Try again." },
    },
    {
      id: "celebrate-captain",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Category Captain!",
      fx: { text: "Mission **complete**, Captain!", effect: "fireworks" },
      narration: { audio: A("celebrate-captain"), script: "Mission complete, Captain! You sorted foods and tools. You sorted animals that fly, swim, and stay on the ground. You found the word that did not belong, and you named categories all by yourself. That is what a Category Captain does. Keep sorting words everywhere you go!" },
    },
  ],
};
