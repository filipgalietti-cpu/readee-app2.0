import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./prefix-power-timings.json";

// Prefix Power (L.1.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=prefix-power

const A = (id: string) => `/audio/lessons-v2/prefix-power/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/prefix-power/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/prefix-power/${w.toLowerCase()}.png`;

export const prefixPowerImages: Record<string, string> = {
  "unhappy": "A cartoon boy with a sad frowning face sitting on a porch step, a small gray rain cloud floating above his head, soft blue background. No text, no letters, no words anywhere.",
  "refill": "A hand pouring water from a yellow pitcher into a clear drinking glass that is almost full, kitchen counter, bright and simple. No text, no letters, no words anywhere.",
  "joyful": "A cartoon girl jumping high in the air with a huge smile, arms stretched up, little sparkle stars around her, sunny park background. No text, no letters, no words anywhere.",
};

export const prefixPower: LessonDef = {
  id: "prefix-power",
  title: "Prefix Power",
  grade: "1st Grade",
  standard: "L.1.4b",
  archetype: "vocabulary",
  objective: "I can use word parts like un-, re-, and -ful to help me understand new words.",
  concepts: ["un- means not or the opposite (unhappy, unlock)","re- means again (redo, refill)","-ful means full of (helpful, joyful)","break the word into its parts to unlock what it means"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Amazing work, word builder. You can break a word into its parts and unlock what it means. Un means not, re means again, and ful means full of. Keep snapping word parts together wherever you read!",
    title: "Word Part Power!",
    body: "You can unlock big words!",
  },
  scenes: [
    {
      id: "hook-word-part-power",
      purpose: "hook",
      gate: "none",
      prompt: "Word parts are power pieces.",
      fx: { text: "Word parts change what a word **means**!", effect: "magic" },
      narration: { audio: A("hook-word-part-power"), script: "Today you get a new reading power. Little word parts snap onto words and change what they mean. When you know the parts, you can unlock big words all by yourself. Let's build some words." },
    },
    {
      id: "model-un",
      purpose: "model",
      gate: "none",
      prompt: "un means not, or the opposite.",
      image: IMG("unhappy"),
      narration: { audio: A("model-un"), script: "Here is your first word part. Un. Un snaps onto the start of a word, and it means not, or the opposite. Watch. Happy. Snap on un. Unhappy. Unhappy means not happy. Look at this boy. He is unhappy." },
    },
    {
      id: "guided-read-un",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Watch for un words.",
      narration: { audio: A("guided-read-un"), script: "Now let's read about Jack. Watch for words that start with un. Read along with me." },
      interaction: { type: "read-along", text: "Jack was unhappy. He could not untie his shoe. Mom will unlock the shed to help him.", audio: A("guided-read-un-sentence") },
    },
    {
      id: "guided-choose-unlock",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does unlock mean?",
      fx: { text: "**unlock**", effect: "pop-words" },
      narration: { audio: A("guided-choose-unlock"), script: "Your turn. Look at this word. Unlock. Find the word part at the start, then find the base word. Now tap what unlock means." },
      interaction: { type: "choose", options: [{ id: "opposite-of-lock", label: "the opposite of lock" }, { id: "lock-again", label: "lock again" }, { id: "full-of-locks", label: "full of locks" }], correctId: "opposite-of-lock", coachWrong: "Break the word apart. Un plus lock. Think about what un means, then try again." },
    },
    {
      id: "model-re",
      purpose: "model",
      gate: "none",
      prompt: "re means again.",
      image: IMG("refill"),
      narration: { audio: A("model-re"), script: "Here is your next word part. Re. Re snaps onto the start of a word, and it means again. Do. Redo. Redo means do it again. Look at the picture. The glass got low, so we refill it. We fill it up one more time." },
    },
    {
      id: "guided-read-re",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Watch for re words.",
      narration: { audio: A("guided-read-re"), script: "Time to read. This little story is packed with re words. Read along with me." },
      interaction: { type: "read-along", text: "I redo my messy bed. I refill the cat dish. Then we replay our best song.", audio: A("guided-read-re-sentence") },
    },
    {
      id: "guided-choose-replay",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does replay mean?",
      fx: { text: "**replay**", effect: "pop-words" },
      narration: { audio: A("guided-choose-replay"), script: "Look at this word. Replay. Find the word part at the start, then find the base word. Tap what replay means." },
      interaction: { type: "choose", options: [{ id: "play-again", label: "play again" }, { id: "not-play", label: "not play" }, { id: "full-of-play", label: "full of play" }], correctId: "play-again", coachWrong: "Break it apart. Re plus play. Think about what re tells you, then try again." },
    },
    {
      id: "model-ful",
      purpose: "model",
      gate: "none",
      prompt: "ful means full of.",
      image: IMG("joyful"),
      narration: { audio: A("model-ful"), script: "One more word part. Ful. Ful snaps onto the end of a word, and it means full of. Joy. Joyful. Joyful means full of joy. Look at this girl. She is jumping and laughing. She is joyful." },
    },
    {
      id: "guided-read-ful",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Watch the end of each word.",
      narration: { audio: A("guided-read-ful"), script: "Last story. This one is packed with ful words. Watch the end of each word. Read along with me." },
      interaction: { type: "read-along", text: "Rose is careful with the eggs. Ben is helpful at home. The pup is joyful when they play.", audio: A("guided-read-ful-sentence") },
    },
    {
      id: "guided-choose-helpful",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does helpful mean?",
      fx: { text: "**helpful**", effect: "pop-words" },
      narration: { audio: A("guided-choose-helpful"), script: "Look at this word. Helpful. This time the word part is at the end. Find it, then find the base word. Tap what helpful means." },
      interaction: { type: "choose", options: [{ id: "full-of-help", label: "full of help" }, { id: "help-again", label: "help again" }, { id: "not-help", label: "not help" }], correctId: "full-of-help", coachWrong: "Look at the end of the word. Help plus ful. Think about what ful means, then try again." },
    },
    {
      id: "apply-transform-careful",
      purpose: "apply",
      gate: "interaction",
      prompt: "Build the word that means full of care.",
      narration: { audio: A("apply-transform-careful"), script: "Now you build a word. Here is the base word. Care. Snap on the word part that makes it mean full of care." },
      interaction: { type: "transform", base: "care", add: "ful", result: "careful", changeIndex: 3, options: ["ful", "re", "un"], labels: { added: "full of" }, successAudio: W("careful"), coachWrong: "That part does not mean full of. Try a different part." },
    },
    {
      id: "apply-sort-meanings",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by what their parts mean.",
      narration: { audio: A("apply-sort-meanings"), script: "Power check. Read each word. Find its word part. Then drag the word to what that part means. Not, again, or full of." },
      interaction: { type: "sort", buckets: ["Not","Again","Full Of"], items: [{ label: "unhappy", bucket: "Not" }, { label: "redo", bucket: "Again" }, { label: "joyful", bucket: "Full Of" }, { label: "untie", bucket: "Not" }, { label: "replay", bucket: "Again" }, { label: "helpful", bucket: "Full Of" }], coachWrong: "Look at the start or the end of that word. Find the word part first. Then drag the word to what its part means." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: I will untie the shoe and redo the bow",
      narration: { audio: A("apply-speak-read"), script: "Now read a sentence out loud, all by yourself. Tap the mic and read the sentence on your screen in a big clear voice." },
      interaction: { type: "speak", text: "I will untie the shoe and redo the bow" },
    },
    {
      id: "challenge-choose-unkind",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does unkind mean?",
      fx: { text: "**unkind**", effect: "pop-words" },
      narration: { audio: A("challenge-choose-unkind"), script: "Challenge time. Here is a brand new word. Unkind. Kind means nice. Use your word part power. Tap what unkind means." },
      interaction: { type: "choose", options: [{ id: "not-kind", label: "not kind" }, { id: "kind-again", label: "kind again" }, { id: "full-of-kind", label: "full of kind" }], correctId: "not-kind", coachWrong: "Break the new word apart. Un plus kind. Think about what that first part means, then try again." },
    },
    {
      id: "challenge-speak-refill",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what refill means.",
      narration: { audio: A("challenge-speak-refill"), script: "Last one, word builder. You read the word refill today. Refill. Break it into its parts in your head. What does refill mean? Tap the mic and say it." },
      interaction: { type: "speak", text: "fill again" },
    },
    {
      id: "celebrate-word-part-power",
      purpose: "celebrate",
      gate: "none",
      prompt: "You have word part power!",
      fx: { text: "You have **word part power**!", effect: "fireworks" },
      narration: { audio: A("celebrate-word-part-power"), script: "You did it. Un means not. Re means again. Ful means full of. Now every big word is a puzzle you can solve. Snap the parts, unlock the meaning. Great work today." },
    },
  ],
};
