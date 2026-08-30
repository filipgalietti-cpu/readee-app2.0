import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./tricky-sound-switchers-timings.json";

// Tricky Sound Switchers (RF.2.3e) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=tricky-sound-switchers

const A = (id: string) => `/audio/lessons-v2/tricky-sound-switchers/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/tricky-sound-switchers/${w.toLowerCase()}.png`;

export const trickySoundSwitchersImages: Record<string, string> = {
  "cow-snow": "A friendly brown cow standing in a snowy winter field while soft white snowflakes fall around her, bright and cheerful. No text, no letters, no numbers anywhere.",
  "moon-book": "An open book with completely blank pages resting on a windowsill beneath a big glowing full moon in a starry night sky. No text, no letters, no words anywhere.",
};

export const trickySoundSwitchers: LessonDef = {
  id: "tricky-sound-switchers",
  title: "Tricky Sound Switchers",
  grade: "2nd Grade",
  standard: "RF.2.3e",
  archetype: "phonics",
  objective: "I can read tricky letter teams by trying one sound, and flipping to the other sound if the word sounds wrong.",
  concepts: ["the same letters can make different sounds: ow says oh in snow but ow in cow","oo sounds long in moon but short in book","the flip-and-check plan: try one sound, and if the word sounds wrong, flip and check"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You did it. Some letter teams make more than one sound. The letters o w can sound like snow or like cow. The letters o o can sound like moon or like book. When a word sounds wrong, flip the sound and check. Keep flipping and checking in every book you read.",
    title: "Sound Switch Reader!",
    body: "You can flip and check tricky letter teams like ow and oo.",
  },
  scenes: [
    {
      id: "hook-tricky-teams",
      purpose: "hook",
      gate: "none",
      prompt: "Same letters. Two different sounds.",
      fx: { text: "Same letters. **Two** sounds.", effect: "pop-words" },
      narration: { audio: A("hook-tricky-teams"), script: "Some letter teams are tricky. The same two letters can make two different sounds in different words. Today you will meet two of these switcher teams, and you will learn a plan for reading them. Let's look." },
    },
    {
      id: "model-ow-two-sounds",
      purpose: "model",
      gate: "none",
      prompt: "The letters ow say oh in snow, ow in cow.",
      image: IMG("cow-snow"),
      narration: { audio: A("model-ow-two-sounds"), script: "Watch the letters o w. In snow, o w says oh. Snow. In cow, o w makes the sound you hear in ouch. Cow. Same letters, two different sounds. That is why o w is a switcher team." },
    },
    {
      id: "model-flip-and-check",
      purpose: "model",
      gate: "none",
      prompt: "Try one sound. If it sounds wrong, flip and check.",
      fx: { text: "Try it. **Flip** it. Check it.", effect: "underline" },
      narration: { audio: A("model-flip-and-check"), script: "Here is your plan for a switcher team. Try one sound. If the word sounds wrong, flip to the other sound and check. Watch me with this word. H o w. First I try oh, like in snow. Hoe. Hoe are you? That sounds wrong. Flip. Now I try the sound from cow. How. How are you? That sounds right. Try it, flip it, check it." },
    },
    {
      id: "guided-read-ow",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Flip and check each ow word.",
      narration: { audio: A("guided-read-ow"), script: "Your turn to read. This little story is full of o w words. Some sound like snow. Some sound like cow. Read along, and flip and check each o w word." },
      interaction: { type: "read-along", text: "The brown cow stood in the deep snow. A cold wind began to blow. White flakes fell down on her back. The cow let out a low moo. Then she walked slowly into town.", audio: A("guided-read-ow-sentence") },
    },
    {
      id: "guided-choose-crow",
      purpose: "guided",
      gate: "interaction",
      prompt: "In which word does ow say oh, like in snow?",
      narration: { audio: A("guided-choose-crow"), script: "Now find the sound. Read each word with your plan. Try a sound, and flip if the word sounds wrong. Tap the word where o w says oh, like in snow." },
      interaction: { type: "choose", options: [{ id: "crow", label: "crow" }, { id: "town", label: "town" }, { id: "brown", label: "brown" }, { id: "crowd", label: "crowd" }], correctId: "crow", coachWrong: "Try both sounds in each word. Only one of these words sounds right with oh." },
    },
    {
      id: "guided-sort-ow",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words. Does ow sound like snow or cow?",
      narration: { audio: A("guided-sort-ow"), script: "Sort time. Read each word. Try a sound, and flip if it sounds wrong. If the o w sounds like the end of snow, drag the word to Snow. If it sounds like cow, drag it to Cow." },
      interaction: { type: "sort", buckets: ["Snow","Cow"], items: [{ label: "glow", bucket: "Snow" }, { label: "owl", bucket: "Cow" }, { label: "slow", bucket: "Snow" }, { label: "clown", bucket: "Cow" }, { label: "pillow", bucket: "Snow" }, { label: "frown", bucket: "Cow" }], coachWrong: "Say the word both ways. Only one way sounds like a real word. Drag it to the team with that sound." },
    },
    {
      id: "model-oo-two-sounds",
      purpose: "model",
      gate: "none",
      prompt: "The letters oo sound long in moon, short in book.",
      image: IMG("moon-book"),
      narration: { audio: A("model-oo-two-sounds"), script: "Here is the second switcher team. The letters o o. In moon, o o makes a long sound. Moon. In book, o o makes a short, quick sound. Book. Same letters, two different sounds. Your flip and check plan works here too." },
    },
    {
      id: "guided-choose-broom",
      purpose: "guided",
      gate: "interaction",
      prompt: "In which word does oo sound like moon?",
      narration: { audio: A("guided-choose-broom"), script: "Read each word with your plan. Try one sound. If the word sounds wrong, flip. Tap the word where o o sounds like the o o in moon." },
      interaction: { type: "choose", options: [{ id: "broom", label: "broom" }, { id: "wood", label: "wood" }, { id: "hook", label: "hook" }, { id: "foot", label: "foot" }], correctId: "broom", coachWrong: "Say each word out loud. Listen for the long sound you hear in moon." },
    },
    {
      id: "apply-sort-oo",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words. Does oo sound like moon or book?",
      narration: { audio: A("apply-sort-oo"), script: "Now sort on your own. Read each word. If the o o sounds long like moon, drag it to Moon. If it sounds short and quick like book, drag it to Book." },
      interaction: { type: "sort", buckets: ["Moon","Book"], items: [{ label: "spoon", bucket: "Moon" }, { label: "took", bucket: "Book" }, { label: "zoom", bucket: "Moon" }, { label: "cook", bucket: "Book" }, { label: "scoop", bucket: "Moon" }, { label: "stood", bucket: "Book" }], coachWrong: "Say the word both ways. One way makes a real word. Drag it to that sound." },
    },
    {
      id: "apply-speak-window",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word aloud: window",
      narration: { audio: A("apply-speak-window"), script: "Time to read out loud. This word ends with the tricky team o w. Flip and check in your head first. Then tap the mic and say the whole word in a clear voice." },
      interaction: { type: "speak", text: "window windows" },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: The cow will look at the moon and the snow",
      narration: { audio: A("apply-speak-sentence"), script: "Now read a whole sentence out loud. It holds both switcher teams. Flip and check as you go. Tap the mic and read the sentence in a big clear voice." },
      interaction: { type: "speak", text: "The cow will look at the moon and the snow" },
    },
    {
      id: "challenge-choose-plow",
      purpose: "challenge",
      gate: "interaction",
      prompt: "In which word does ow sound like cow?",
      narration: { audio: A("challenge-choose-plow"), script: "Last challenge. These words all carry the letters o w. Use your plan on each one. Tap the word where o w makes the same sound you hear in cow." },
      interaction: { type: "choose", options: [{ id: "plow", label: "plow" }, { id: "flow", label: "flow" }, { id: "show", label: "show" }, { id: "slow", label: "slow" }], correctId: "plow", coachWrong: "Say each word both ways. Flip and check until one sounds right with the sound from cow." },
    },
    {
      id: "celebrate-flip-check",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can read the tricky teams!",
      fx: { text: "Try it. **Flip** it. Check it.", effect: "fireworks" },
      narration: { audio: A("celebrate-flip-check"), script: "Great reading. You learned that the letters o w can sound like snow or like cow. The letters o o can sound long like moon, or short like book. When a word sounds wrong, flip to the other sound and check. That plan works in every book you read." },
    },
  ],
};
