import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-in-real-life-timings.json";

// Words in Real Life (L.1.5c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-in-real-life

const A = (id: string) => `/audio/lessons-v2/words-in-real-life/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-in-real-life/${w.toLowerCase()}.png`;

export const wordsInRealLifeImages: Record<string, string> = {
  "fire-truck": "A bright red cartoon fire truck with flashing lights driving down a city street. No text, no letters, no words anywhere.",
  "cocoa-blanket": "A cozy cartoon scene of a child wrapped in a thick orange blanket on a couch, holding a steaming mug of hot cocoa. No text, no letters, no words anywhere.",
  "fresh-bread": "A golden loaf of fresh bread on a wooden kitchen table, small curls of steam rising from it. No text, no letters, no words anywhere.",
};

export const wordsInRealLife: LessonDef = {
  id: "words-in-real-life",
  title: "Words in Real Life",
  grade: "1st Grade",
  standard: "L.1.5c",
  archetype: "vocabulary",
  objective: "I can connect words to real things, places, and moments in my world.",
  concepts: ["words connect to real things and places","a word fits the moments where you see, hear, and feel it"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Wonderful work today. You found where words live in real life. Noisy lives with fire trucks and drums. Cozy lives with warm blankets and hot cocoa. Keep matching words to the things in your world.",
    title: "Words Found Their Homes!",
    body: "You can connect words like noisy, cozy, slippery, fresh, and heavy to real things in your world!",
  },
  scenes: [
    {
      id: "hook-where-words-live",
      purpose: "hook",
      gate: "none",
      prompt: "Where do words live?",
      fx: { text: "Where do words **live**?", effect: "jelly" },
      narration: { audio: A("hook-where-words-live"), script: "Words do not just live in books. Words live in real life. The word noisy lives with loud things. The word cozy lives with warm, snug things. Today you will match words to the things, places, and moments where they live." },
    },
    {
      id: "model-noisy",
      purpose: "model",
      gate: "none",
      prompt: "Noisy lives with loud things.",
      image: IMG("fire-truck"),
      fx: { text: "**noisy**", effect: "pop-words" },
      narration: { audio: A("model-noisy"), script: "Listen to the word noisy. Noisy means full of loud sound. Where does noisy live in real life? A fire truck is noisy. A drum is noisy. A busy street is noisy. But a library is not noisy. A library is quiet. The word noisy lives with things that make big sound." },
    },
    {
      id: "model-read-along",
      purpose: "model",
      gate: "interaction",
      prompt: "Read along with me.",
      narration: { audio: A("model-read-along"), script: "Let's read about where words live. Follow each word as we read." },
      interaction: { type: "read-along", text: "A drum is noisy. A warm bed is cozy. A wet slide is slippery. Words live with real things.", audio: A("model-read-along-sentence") },
    },
    {
      id: "guided-slippery",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is **slippery**?",
      narration: { audio: A("guided-slippery"), script: "Your turn. Slippery things are smooth, and they make you slide. Soap in the tub is slippery. Now read the three choices and tap the thing that is slippery." },
      interaction: { type: "choose", options: [{ id: "ice", label: "ice" }, { id: "rug", label: "a rug" }, { id: "sand", label: "sand" }], correctId: "ice", coachWrong: "Think about walking on each one in socks. Which one is so smooth that your feet would slide? Try again." },
    },
    {
      id: "guided-cozy-moment",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word fits this moment?",
      image: IMG("cocoa-blanket"),
      narration: { audio: A("guided-cozy-moment"), script: "Cozy means warm, soft, and snug. Now listen to this moment. You wrap up in a warm blanket with a cup of hot cocoa. Which word fits that moment? Read the words and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "cozy", label: "cozy" }, { id: "noisy", label: "noisy" }, { id: "slippery", label: "slippery" }], correctId: "cozy", coachWrong: "Think about how a warm blanket and hot cocoa feel. Tap the word that tells about that feeling. Try again." },
    },
    {
      id: "apply-heavy",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which one is **heavy**?",
      narration: { audio: A("apply-heavy"), script: "Heavy things are hard to lift. A backpack full of books is heavy. Where else does the word heavy live? Read the three choices and tap the thing that is truly heavy." },
      interaction: { type: "choose", options: [{ id: "elephant", label: "an elephant" }, { id: "feather", label: "a feather" }, { id: "balloon", label: "a balloon" }], correctId: "elephant", coachWrong: "Try to lift each one in your mind. Which one could you never pick up? Try again." },
    },
    {
      id: "apply-sort-noisy-cozy",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the things: Noisy or Cozy.",
      narration: { audio: A("apply-sort-noisy-cozy"), script: "Some of these things are noisy. Some are cozy. Read each card and drag it to the word where it lives." },
      interaction: { type: "sort", buckets: ["Noisy","Cozy"], items: [{ label: "drum", bucket: "Noisy" }, { label: "blanket", bucket: "Cozy" }, { label: "siren", bucket: "Noisy" }, { label: "pillow", bucket: "Cozy" }], coachWrong: "Read the card again. Does that thing make a big loud sound, or is it warm and snug? Try again." },
    },
    {
      id: "apply-fresh-speak",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud: Fresh bread smells sweet and warm.",
      image: IMG("fresh-bread"),
      narration: { audio: A("apply-fresh-speak"), script: "Fresh means just made or just picked. Bread right out of the oven is fresh. The sentence is on your screen. Read it out loud in a big, clear voice." },
      interaction: { type: "speak", text: "Fresh bread smells sweet and warm" },
    },
    {
      id: "challenge-noisy-speak",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say something that is **noisy**.",
      narration: { audio: A("challenge-noisy-speak"), script: "Now find where words live at your house. Think about your home or your street. What is something noisy there? Press the microphone and say the noisy thing you thought of." },
      interaction: { type: "speak", text: "truck drum siren dog baby horn train thunder storm vacuum bell alarm" },
    },
    {
      id: "challenge-fragile",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one is **fragile**?",
      narration: { audio: A("challenge-fragile"), script: "Here is a second grade word. Fragile. Fragile means easy to break. An egg is fragile, so you hold it with care. Read the three choices and tap the thing that is fragile." },
      interaction: { type: "choose", options: [{ id: "glass-cup", label: "a glass cup" }, { id: "metal-spoon", label: "a metal spoon" }, { id: "rubber-ball", label: "a rubber ball" }], correctId: "glass-cup", coachWrong: "Fragile things break if they fall. Think about dropping each one on the floor. Which one would break? Try again." },
    },
    {
      id: "celebrate-words-found",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You found where words live!",
      fx: { text: "You **did** it!", effect: "fireworks" },
      narration: { audio: A("celebrate-words-found"), script: "Amazing work. You found where words live in real life. Noisy lives with fire trucks and drums. Cozy lives with blankets and hot cocoa. Slippery, fresh, and heavy live with real things too. Keep matching words to your world, everywhere you go." },
    },
  ],
};
