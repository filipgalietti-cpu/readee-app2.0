import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./ending-readers-timings.json";

// Ending Readers (RF.1.3f) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=ending-readers

const A = (id: string) => `/audio/lessons-v2/ending-readers/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/ending-readers/${w.toLowerCase()}.png`;

export const endingReadersImages: Record<string, string> = {
  "jumping-boy": "A cartoon boy jumping high in a sunny park, arms up, big smile, blue sky. No text, no letters, no words anywhere.",
  "planting-seed": "A cartoon girl planting a small green seedling in brown garden soil, sunny day, watering can nearby. No text, no letters, no words anywhere.",
};

export const endingReaders: LessonDef = {
  id: "ending-readers",
  title: "Ending Readers",
  grade: "1st Grade",
  standard: "RF.1.3f",
  archetype: "phonics",
  objective: "I can read words with endings like s, ed, and ing!",
  concepts: ["spot the base word at the front, read it, then add the ending","the ed ending can sound like d, t, or ed","doubled letters and a hidden e still show you the base word"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You did it, ending reader. Spot the base word at the front, read it, then add the ending. And remember the ed secret. It can say duh, tuh, or ed. Now you can read ending words in every book you open.",
    title: "You're an Ending Reader!",
    body: "You read words with s, ed, and ing endings all by yourself.",
  },
  scenes: [
    {
      id: "hook-ending-readers",
      purpose: "hook",
      gate: "none",
      prompt: "Endings change. The base stays.",
      fx: { text: "Watch a word change: **jump|jumping**", effect: "word-swap" },
      narration: { audio: A("hook-ending-readers"), script: "Today you become an ending reader. Words can wear endings. Jumps. Jumped. Jumping. They all start with the same base word, jump. Spot the base, read it, then add the ending. Watch the word change its ending. Let's learn how to read them." },
    },
    {
      id: "model-base-first",
      purpose: "model",
      gate: "none",
      prompt: "Read the base first, then add the ending.",
      image: IMG("jumping-boy"),
      fx: { text: "**jump**s   **jump**ed   **jump**ing", effect: "glow" },
      narration: { audio: A("model-base-first"), script: "Watch me read an ending word. First I spot the base word at the front. Jump. I read the base. Jump. Then I add the ending sound. Jumps. Jumped. Jumping. Every one starts with jump. Base first, then the ending. That is how ending readers read." },
    },
    {
      id: "model-ed-sounds",
      purpose: "model",
      gate: "none",
      prompt: "The **ed** ending can make three sounds.",
      image: IMG("planting-seed"),
      fx: { text: "played   jumped   planted", effect: "pop-words" },
      narration: { audio: A("model-ed-sounds"), script: "Here is a secret about the ed ending. It can make three sounds. Listen to the end of played. Duh. Played. Now listen to the end of jumped. Tuh. Jumped. Now listen to planted. Plant, ed. Planted. Same ending letters, three sounds. Duh, tuh, or ed. Your ears will tell you which one." },
    },
    {
      id: "guided-base-planted",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is the base word?",
      fx: { text: "**planted**", effect: "glow" },
      narration: { audio: A("guided-base-planted"), script: "Your turn. Read this ending word in your head. Cover the ending with your finger and read just the part at the front. Tap the base word." },
      interaction: { type: "choose", options: [{ id: "plant", label: "plant" }, { id: "plan", label: "plan" }, { id: "planted", label: "planted" }], correctId: "plant", coachWrong: "Take the ending off the end of the word. Read only the letters that are left at the front. Try again." },
    },
    {
      id: "guided-read-wishes",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word do you hear?",
      narration: { audio: A("guided-read-wishes"), script: "Now use your ears and your eyes. Listen closely. Wishes. Read each word all the way to its ending. Tap the word that says wishes." },
      interaction: { type: "choose", options: [{ id: "wishes", label: "wishes" }, { id: "wished", label: "wished" }, { id: "wish", label: "wish" }], correctId: "wishes", coachWrong: "Read past the base word, all the way to the very end. The ending has to match too. Try again." },
    },
    {
      id: "model-tricky-bases",
      purpose: "model",
      gate: "none",
      prompt: "Tricky bases still show themselves.",
      fx: { text: "running   jogged   baked", effect: "pop-words" },
      narration: { audio: A("model-tricky-bases"), script: "Sometimes the base word plays a little trick. Run. Running. The letter n doubles, but the base run still sits at the front. Jog. Jogged. You see two letter g's, but the base is jog. Bake. Baked. The base bake hides its e, but you can still read it. Spot the base, read it, add the ending." },
    },
    {
      id: "apply-base-running",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is the base word?",
      fx: { text: "**running**", effect: "glow" },
      narration: { audio: A("apply-base-running"), script: "Read this word in your head. It has a doubled letter inside. Find the base word hiding at the front and tap it." },
      interaction: { type: "choose", options: [{ id: "run", label: "run" }, { id: "ran", label: "ran" }, { id: "running", label: "running" }], correctId: "run", coachWrong: "Take off the ending and the extra doubled letter. Read the little word that is left. Try again." },
    },
    {
      id: "apply-sort-ed-sounds",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by their ending sound.",
      narration: { audio: A("apply-sort-ed-sounds"), script: "Big sort. Read each word out loud softly and listen to its very last sound. Does the ending sound like the end of played, like the end of jumped, or like the end of planted? Drag each word to its matching sound." },
      interaction: { type: "sort", buckets: ["Played","Jumped","Planted"], items: [{ label: "rained", bucket: "Played" }, { label: "jogged", bucket: "Played" }, { label: "baked", bucket: "Jumped" }, { label: "wished", bucket: "Jumped" }, { label: "needed", bucket: "Planted" }, { label: "painted", bucket: "Planted" }], coachWrong: "Read that word again and listen to its very last sound. Duh, tuh, or ed. Try again." },
    },
    {
      id: "apply-speak-jogging",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word aloud: jogging",
      narration: { audio: A("apply-speak-jogging"), script: "Time to read an ending word out loud, all by yourself. Spot the base at the front, read it, then add the ending. Tap the mic and read the word on your screen in a clear voice." },
      interaction: { type: "speak", text: "jogging jogged jogs" },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: Meg baked a cake and Ben planted seeds",
      narration: { audio: A("apply-speak-sentence"), script: "Now read a whole sentence with ending words inside. Tap the mic and read the sentence on your screen in a big clear voice." },
      interaction: { type: "speak", text: "Meg baked a cake and Ben planted seeds" },
    },
    {
      id: "challenge-base-baking",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is the base word?",
      fx: { text: "**baking**", effect: "glow" },
      narration: { audio: A("challenge-base-baking"), script: "Challenge time. Read this word in your head. The base word hides at the front, and one of its letters is hiding too. Tap the base word." },
      interaction: { type: "choose", options: [{ id: "bake", label: "bake" }, { id: "back", label: "back" }, { id: "baking", label: "baking" }], correctId: "bake", coachWrong: "Take off the ing ending. Then read the base with its quiet e back on the end. Try again." },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      gate: "none",
      prompt: "You're an Ending Reader!",
      fx: { text: "You can **read** ending words!", effect: "fireworks" },
      narration: { audio: A("celebrate"), script: "You did it, ending reader. Spot the base word at the front, read it, then add the ending. And remember the ed secret. It can say duh, tuh, or ed. Now you can read ending words in every book you open." },
    },
  ],
};
