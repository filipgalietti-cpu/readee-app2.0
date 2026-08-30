import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-changers-timings.json";

// Word Changers (L.1.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-changers

const A = (id: string) => `/audio/lessons-v2/word-changers/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/word-changers/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-changers/${w.toLowerCase()}.png`;

export const wordChangersImages: Record<string, string> = {
  "looking": "A cartoon girl looking through binoculars at a bird nest high in a tree, sunny park background. No text, no letters, no words anywhere.",
  "jump-log": "A cartoon boy jumping over a small log in a grassy park, mid air with a big smile, sunny day. No text, no letters, no words anywhere.",
  "helping": "A cartoon girl helping her mom rake leaves in a sunny yard, both smiling, small pile of leaves. No text, no letters, no words anywhere.",
};

export const wordChangers: LessonDef = {
  id: "word-changers",
  title: "Word Changers",
  grade: "1st Grade",
  standard: "L.1.4c",
  archetype: "vocabulary",
  objective: "I can find the root word and use endings like s, ed, and ing.",
  concepts: ["the root is the main part that stays the same","s tells it happens now","ed tells it already happened","ing tells it is happening right now"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Great work, word changer. You found the root inside changing words. The ending tells when it happens, but the root meaning stays the same. Keep spotting roots and endings wherever you read.",
    title: "Word Changer Power!",
    body: "You can find the root in any word!",
  },
  scenes: [
    {
      id: "hook-word-changers",
      purpose: "hook",
      gate: "none",
      prompt: "Endings snap on. Roots stay.",
      fx: { text: "Watch a word change: **look|looking**", effect: "word-swap" },
      narration: { audio: A("hook-word-changers"), script: "Today you meet word changers. A tiny ending can snap onto the end of a word and change when it happens. But the main part of the word, the root, never changes. Watch the word change its ending. Let's learn the secret." },
    },
    {
      id: "model-root-look",
      purpose: "model",
      gate: "none",
      prompt: "The root is the part that stays.",
      image: IMG("looking"),
      narration: { audio: A("model-root-look"), script: "Here is a root word. Look. The root is the main part. Now endings snap on. Looks. Looked. Looking. All those words share the same root, look. The ending changes, but the root stays the same. This girl is looking at a nest. Every look word is still about using your eyes." },
    },
    {
      id: "model-endings-when",
      purpose: "model",
      gate: "none",
      prompt: "Endings tell **when** it happens.",
      fx: { text: "Ben **jumps|jumped** over the log.", effect: "word-swap" },
      narration: { audio: A("model-endings-when"), script: "Endings tell you when it happens. The ending s means it happens now. Ben jumps now. The ending ed means it already happened. Yesterday Ben jumped. The ending ing means it is happening right now. Ben is jumping right now. Three endings, one root. The root jump never changes." },
    },
    {
      id: "guided-find-root-looking",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is the root of **looking**?",
      fx: { text: "**looking**", effect: "pop-words" },
      narration: { audio: A("guided-find-root-looking"), script: "Your turn. Here is a word. Looking. An ending snapped onto the end. Find the main part that never changes. Tap the root." },
      interaction: { type: "choose", options: [{ id: "look", label: "look" }, { id: "ing", label: "ing" }, { id: "looking", label: "looking" }], correctId: "look", coachWrong: "Take the ending off the end of the word. The little word that is left is the root. Try again." },
    },
    {
      id: "guided-find-root-helped",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is the root of **helped**?",
      fx: { text: "**helped**", effect: "pop-words" },
      narration: { audio: A("guided-find-root-helped"), script: "Here is a new word. Helped. Find the root, the main part, and tap it." },
      interaction: { type: "choose", options: [{ id: "help", label: "help" }, { id: "ed", label: "ed" }, { id: "helped", label: "helped" }], correctId: "help", coachWrong: "The root is the part before the ending. Take the ending off and see what is left. Try again." },
    },
    {
      id: "apply-transform-jumped",
      purpose: "apply",
      gate: "interaction",
      prompt: "Build the word that already happened.",
      narration: { audio: A("apply-transform-jumped"), script: "Now you build a word. Here is the root. Jump. Yesterday the jump already happened. Snap on the ending that shows it already happened." },
      interaction: { type: "transform", base: "jump", add: "ed", result: "jumped", changeIndex: 3, options: ["ed", "ing", "s"], labels: { added: "already happened" }, successAudio: W("jumped"), coachWrong: "That ending does not show it already happened. Try a different ending." },
    },
    {
      id: "apply-transform-helping",
      purpose: "apply",
      gate: "interaction",
      prompt: "Build the word that is happening right now.",
      narration: { audio: A("apply-transform-helping"), script: "Build another one. Here is the root. Help. Jen helps her dad, and it is happening right this minute. Snap on the ending that shows it is happening right now." },
      interaction: { type: "transform", base: "help", add: "ing", result: "helping", changeIndex: 3, options: ["ing", "s", "ed"], labels: { added: "right now" }, successAudio: W("helping"), coachWrong: "That ending does not show it is happening right now. Try another ending." },
    },
    {
      id: "apply-sort-when",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by when they happen.",
      narration: { audio: A("apply-sort-when"), script: "Big sort. Read each word and find its ending. Then drag the word to when it happens. Now, before, or doing it right now." },
      interaction: { type: "sort", buckets: ["Now","Before","Doing"], items: [{ label: "plays", bucket: "Now" }, { label: "looked", bucket: "Before" }, { label: "jumping", bucket: "Doing" }, { label: "helps", bucket: "Now" }, { label: "played", bucket: "Before" }, { label: "looking", bucket: "Doing" }], coachWrong: "Look at the ending of that word. Does it happen now, did it already happen, or is someone doing it right now? Try again." },
    },
    {
      id: "apply-choose-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Yesterday Ben ___ over the log.",
      image: IMG("jump-log"),
      narration: { audio: A("apply-choose-sentence"), script: "Read this sentence. Yesterday Ben, blank, over the log. One word is missing. The time word yesterday tells you when it happened. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "jumped", label: "jumped" }, { id: "jumps", label: "jumps" }, { id: "jumping", label: "jumping" }], correctId: "jumped", coachWrong: "Yesterday means it already happened. Which ending shows it already happened? Try again." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: Jen looked up and jumped for joy",
      narration: { audio: A("apply-speak-read"), script: "Now read a sentence out loud all by yourself. It has two word changers inside. Tap the mic and read the sentence on your screen in a big clear voice." },
      interaction: { type: "speak", text: "Jen looked up and jumped for joy" },
    },
    {
      id: "challenge-choose-playing",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Right now Meg is ___ with her dog.",
      narration: { audio: A("challenge-choose-playing"), script: "Challenge time. Right now Meg is, blank, with her dog. The words right now tell you it is happening right now. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "playing", label: "playing" }, { id: "played", label: "played" }, { id: "plays", label: "plays" }], correctId: "playing", coachWrong: "It is happening right now. Which ending shows happening right now? Try again." },
    },
    {
      id: "challenge-speak-roots",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the root of each word.",
      fx: { text: "**helping**  **played**", effect: "pop-words" },
      narration: { audio: A("challenge-speak-roots"), script: "Last one, word changer. Read these two words. Helping. Played. Each one has a root hiding inside. Take off the ending. Tap the mic and say each root you find." },
      interaction: { type: "speak", text: "help play" },
    },
    {
      id: "celebrate-word-changers",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a word changer!",
      fx: { text: "You found the **root**!", effect: "fireworks" },
      narration: { audio: A("celebrate-word-changers"), script: "You did it. Roots stay the same, and endings change when it happens. S means now. Ed means it already happened. Ing means it is happening right now. Now you can change words and read them everywhere. Great work today." },
    },
  ],
};
