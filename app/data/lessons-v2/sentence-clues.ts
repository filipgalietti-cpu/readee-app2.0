import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sentence-clues-timings.json";

// Sentence Clues (L.1.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sentence-clues

const A = (id: string) => `/audio/lessons-v2/sentence-clues/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sentence-clues/${w.toLowerCase()}.png`;

export const sentenceCluesImages: Record<string, string> = {
  "magnifying-glass": "A large detective magnifying glass with a wooden handle lying on an open storybook, soft sparkles around the lens, nothing else on the table. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "ben-drowsy": "A young boy in blue pajamas yawning with heavy sleepy eyes, walking toward a cozy bed with a soft pillow and blanket, a dim lamp glowing on a nightstand. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const sentenceClues: LessonDef = {
  id: "sentence-clues",
  title: "Sentence Clues",
  grade: "1st Grade",
  standard: "L.1.4a",
  archetype: "vocabulary",
  objective: "I can use the other words in a sentence to figure out what a tricky word means.",
  concepts: ["the other words in a sentence are clues", "clue words point to the meaning"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Case closed, word detective! You cracked drowsy, soaked, silent, rapid, and gleeful. The other words in a sentence point right to the meaning. Hunt for sentence clues every time you read!",
    "title": "Case Closed!",
    "body": "You used sentence clues to crack five tricky words."
  },
  scenes: [
    {
      id: "hook-clue-hunt",
      purpose: "hook",
      gate: "none",
      prompt: "You are the word detective today.",
      image: IMG("magnifying-glass"),
      narration: { audio: A("hook-clue-hunt"), script: "Hello, word detective! Today tricky words are hiding in sentences. Here is the secret. The other words in the sentence are clues. They point right to the meaning. Let's crack five word cases together." },
    },
    {
      id: "model-drowsy-case",
      purpose: "model",
      gate: "none",
      prompt: "Watch me crack case one.",
      image: IMG("ben-drowsy"),
      narration: { audio: A("model-drowsy-case"), script: "Case one. Listen to this sentence. Ben was drowsy, so he went to bed. Drowsy is the tricky word. Watch me look at the other words. So he went to bed. When do you go to bed? When you are sleepy. The clue words, went to bed, point to the meaning. Drowsy means sleepy. Case one is closed." },
    },
    {
      id: "guided-read-soaked",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read case two with me.",
      narration: { audio: A("guided-read-soaked"), script: "Case two is about Jen. Read the case with me." },
      interaction: { type: "read-along", text: "Rain poured down on Jen. Her coat was soaked.", audio: A("guided-read-soaked-sentence") },
    },
    {
      id: "guided-choose-soaked",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does soaked mean?",
      narration: { audio: A("guided-choose-soaked"), script: "You read, rain poured down on Jen. Her coat was soaked. Soaked is the tricky word. Use the other words as clues. Read each card. Tap what soaked means." },
      interaction: { type: "choose", options: [{ id: "very-wet", label: "very wet" }, { id: "very-dry", label: "very dry" }, { id: "very-warm", label: "very warm" }], correctId: "very-wet", coachWrong: "Reread the case. Rain poured down on Jen. Think about what rain does to a coat. Try again!" },
    },
    {
      id: "guided-highlight-soaked-clue",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the clue words for soaked.",
      narration: { audio: A("guided-highlight-soaked-clue"), script: "You cracked it. Now show me the proof. Which words in the case pointed to the meaning of soaked? Tap the clue words." },
      interaction: { type: "highlight", text: "Rain poured down on Jen. Her coat was soaked.", targets: ["rain", "poured", "down"], coachWrong: "The clue is not the tricky word itself. Tap the words that tell what fell on Jen. Try again!" },
    },
    {
      id: "apply-read-silent",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read case three with me.",
      narration: { audio: A("apply-read-silent"), script: "Case three happens at the library. Read the case with me." },
      interaction: { type: "read-along", text: "The library was silent. The kids made no sound.", audio: A("apply-read-silent-sentence") },
    },
    {
      id: "apply-choose-silent",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does silent mean?",
      narration: { audio: A("apply-choose-silent"), script: "You read, the library was silent. The kids made no sound. Silent is the tricky word. Look at the clue words around it. Read each card. Tap what silent means." },
      interaction: { type: "choose", options: [{ id: "silent-quiet", label: "quiet" }, { id: "silent-loud", label: "loud" }, { id: "silent-messy", label: "messy" }], correctId: "silent-quiet", coachWrong: "Reread the case. The kids made no sound. Think about how a room with no sound feels. Try again!" },
    },
    {
      id: "apply-highlight-silent-clue",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the clue words for silent.",
      narration: { audio: A("apply-highlight-silent-clue"), script: "Now the proof. Which words in the case pointed to the meaning of silent? Tap the clue words." },
      interaction: { type: "highlight", text: "The library was silent. The kids made no sound.", targets: ["made", "no", "sound"], coachWrong: "The clue tells how much noise the kids made. Find those words. Try again!" },
    },
    {
      id: "apply-speak-rapid",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read case four aloud.",
      narration: { audio: A("apply-speak-rapid"), script: "Case four is all yours, detective. This time you read the case out loud. Read the sentence on your screen in a big clear voice." },
      interaction: { type: "speak", text: "The rapid train zoomed past my window in a flash" },
    },
    {
      id: "apply-choose-rapid",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does rapid mean?",
      narration: { audio: A("apply-choose-rapid"), script: "You read, the rapid train zoomed past my window in a flash. Rapid is the tricky word. Find the clue words in the sentence. Read each card. Tap what rapid means." },
      interaction: { type: "choose", options: [{ id: "rapid-fast", label: "fast" }, { id: "rapid-slow", label: "slow" }, { id: "rapid-tiny", label: "tiny" }], correctId: "rapid-fast", coachWrong: "Reread the case. The train zoomed past in a flash. Think about how a zooming train moves. Try again!" },
    },
    {
      id: "apply-highlight-rapid-clue",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the clue words for rapid.",
      narration: { audio: A("apply-highlight-rapid-clue"), script: "Show me the proof for case four. Which words pointed to the meaning of rapid? Tap the clue words." },
      interaction: { type: "highlight", text: "The rapid train zoomed past my window in a flash.", targets: ["zoomed", "flash"], coachWrong: "The clue words show how the train moved past the window. Try again!" },
    },
    {
      id: "challenge-read-gleeful",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read the last case with me.",
      narration: { audio: A("challenge-read-gleeful"), script: "Last case, case five. It is about Pam. Read the case with me." },
      interaction: { type: "read-along", text: "Pam was gleeful. She jumped and cheered all the way home.", audio: A("challenge-read-gleeful-sentence") },
    },
    {
      id: "challenge-choose-gleeful",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does gleeful mean?",
      narration: { audio: A("challenge-choose-gleeful"), script: "You read, Pam was gleeful. She jumped and cheered all the way home. Gleeful is the tricky word. Use the clue words. Read each card. Tap what gleeful means." },
      interaction: { type: "choose", options: [{ id: "very-happy", label: "very happy" }, { id: "very-sad", label: "very sad" }, { id: "very-sleepy", label: "very sleepy" }, { id: "very-cold", label: "very cold" }], correctId: "very-happy", coachWrong: "Reread the case. Pam jumped and cheered. Think about how Pam feels inside. Try again!" },
    },
    {
      id: "challenge-highlight-gleeful-clue",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the clue words for gleeful.",
      narration: { audio: A("challenge-highlight-gleeful-clue"), script: "Show me the proof one more time. Which words pointed to the meaning of gleeful? Tap the clue words." },
      interaction: { type: "highlight", text: "Pam was gleeful. She jumped and cheered all the way home.", targets: ["jumped", "cheered"], coachWrong: "The clue words show what Pam did with her body. Tap the action words. Try again!" },
    },
    {
      id: "challenge-speak-drowsy-meaning",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what drowsy means.",
      narration: { audio: A("challenge-speak-drowsy-meaning"), script: "One last check, detective. Back to case one. Ben was drowsy, so he went to bed. What does drowsy mean? Say the meaning out loud." },
      interaction: { type: "speak", text: "sleepy tired" },
    },
    {
      id: "celebrate-cases-closed",
      purpose: "celebrate",
      gate: "none",
      prompt: "Case closed, word detective!",
      fx: {"text":"You found the **sentence clues**!","effect":"fireworks"},
      narration: { audio: A("celebrate-cases-closed"), script: "Case closed, word detective! You cracked drowsy, soaked, silent, rapid, and gleeful. The other words in a sentence point right to the meaning. Hunt for sentence clues every time you read!" },
    },
  ],
};
