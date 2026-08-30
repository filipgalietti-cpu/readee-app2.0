import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./prefix-suffix-decoders-timings.json";

// Prefix & Suffix Decoders (RF.2.3d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=prefix-suffix-decoders

const A = (id: string) => `/audio/lessons-v2/prefix-suffix-decoders/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/prefix-suffix-decoders/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/prefix-suffix-decoders/${w.toLowerCase()}.png`;

export const prefixSuffixDecodersImages: Record<string, string> = {
  "preheat": "A smiling parent opening a bright kitchen oven with a warm orange glow inside, a tray of unbaked cookies waiting on the counter nearby. No text, no letters, no numbers anywhere.",
  "careless": "A cartoon boy painting at an easel, paint drips and colorful spots splattered on the floor and on his shirt, a tipped-over paint cup by his feet. No text, no letters, no words anywhere.",
  "teacher": "A friendly cartoon teacher standing beside a plain green chalkboard, holding a wooden pointer and smiling, sunny classroom. The chalkboard is completely blank. No text, no letters, no words anywhere.",
};

export const prefixSuffixDecoders: LessonDef = {
  id: "prefix-suffix-decoders",
  title: "Prefix & Suffix Decoders",
  grade: "2nd Grade",
  standard: "RF.2.3d",
  archetype: "phonics",
  objective: "I can decode words with prefixes and suffixes: spot the part, read the base, and snap them together.",
  concepts: ["a prefix snaps onto the front of a word: un-, re-, pre-, dis-","a suffix snaps onto the end of a word: -ful, -less, -ly, -er","the decode plan: spot the part, read the base, snap them together"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You did it. You can decode long words by spotting the part, reading the base, and snapping them together. Prefixes snap on at the front. Suffixes snap on at the end. Keep decoding long words in every book you read.",
    title: "Word Decoder!",
    body: "You can snap prefixes and suffixes onto base words and read them.",
  },
  scenes: [
    {
      id: "hook-decode-plan",
      purpose: "hook",
      gate: "none",
      prompt: "Spot the part. Read the base. Snap!",
      fx: { text: "Spot it. Read it. **Snap!**", effect: "pop-words" },
      narration: { audio: A("hook-decode-plan"), script: "Today you become a word decoder. Long words often carry a small part at the front or at the end. Here is your plan. Spot the part. Read the base. Snap them together. Let's decode." },
    },
    {
      id: "model-prefix-preheat",
      purpose: "model",
      gate: "none",
      prompt: "pre snaps on at the front. It means before.",
      image: IMG("preheat"),
      narration: { audio: A("model-prefix-preheat"), script: "Watch me decode a long word. Preheat. First I spot a part I know at the front. Pre. Pre means before. Next I read the base. Heat. Now I snap the parts together. Pre. Heat. Preheat. To preheat the oven means to heat it before the food goes in." },
    },
    {
      id: "guided-read-prefixes",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Spot the parts at the front.",
      narration: { audio: A("guided-read-prefixes"), script: "You already know some prefixes. Un means not. Re means again. Here is a new one. Dis. Dis also means not. Now read along with me, and spot the part at the front of each long word." },
      interaction: { type: "read-along", text: "Sam had to unpack his bag after camp. Then he wanted to reread his favorite book. He did not dislike the rain, because rain means reading time.", audio: A("guided-read-prefixes-sentence") },
    },
    {
      id: "guided-sequence-dislike",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Snap the parts of dislike in order.",
      narration: { audio: A("guided-sequence-dislike"), script: "Your turn. Here are the parts of a word you just read, all mixed up. Drag them into snapping order. The prefix first, the base next, and the whole word last." },
      interaction: { type: "sequence", items: [{ id: "dis", label: "dis" }, { id: "like", label: "like" }, { id: "dislike", label: "dislike" }], order: ["dis","like","dislike"], coachWrong: "Spot the prefix. It snaps on at the front. Then comes the base. The whole word goes at the end." },
    },
    {
      id: "guided-choose-unpack",
      purpose: "guided",
      gate: "interaction",
      prompt: "Snap the parts. Which word do they make?",
      fx: { text: "**un** + **pack**", effect: "glow" },
      narration: { audio: A("guided-choose-unpack"), script: "Snap time. Look at the two parts on screen. Say the prefix in your head, then the base. Snap them together, and tap the whole word they make." },
      interaction: { type: "choose", options: [{ id: "unpack", label: "unpack" }, { id: "unpick", label: "unpick" }, { id: "repack", label: "repack" }, { id: "packer", label: "packer" }], correctId: "unpack", coachWrong: "Say the first part, then the base. Snap them together with no changes. Then find that exact word." },
    },
    {
      id: "model-suffix-careless",
      purpose: "model",
      gate: "none",
      prompt: "less snaps on at the end. It means without.",
      image: IMG("careless"),
      narration: { audio: A("model-suffix-careless"), script: "Parts can snap onto the end of a word too. Watch. Careless. I spot the part at the end. Less. Less means without. I read the base. Care. Snap. Care. Less. Careless. This painter was careless. He painted without care, and now there are spots everywhere." },
    },
    {
      id: "guided-read-suffixes",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read along. Spot the parts at the end.",
      narration: { audio: A("guided-read-suffixes"), script: "Two more endings. The ending in teacher, the letters e r, can mean a person who does something. The ending in quickly, the letters l y, tells how something is done. And you know ful. It means full of. Read along with me, and watch the end of each long word." },
      interaction: { type: "read-along", text: "Our teacher is helpful and kind. She hands out paper quickly. Soon every helper has a useful job.", audio: A("guided-read-suffixes-sentence") },
    },
    {
      id: "apply-choose-split-teacher",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where does teacher split?",
      image: IMG("teacher"),
      narration: { audio: A("apply-choose-split-teacher"), script: "Decode this word. Read it in your head. Spot the ending you know. Then tap the split that breaks the word between the base and its ending." },
      interaction: { type: "choose", options: [{ id: "teach-er", label: "teach-er" }, { id: "tea-cher", label: "tea-cher" }, { id: "teac-her", label: "teac-her" }, { id: "te-acher", label: "te-acher" }], correctId: "teach-er", coachWrong: "Find the ending first. Which letters at the end make the part you know? Split right before them." },
    },
    {
      id: "apply-transform-hopeless",
      purpose: "apply",
      gate: "interaction",
      prompt: "Build the word that means without hope.",
      narration: { audio: A("apply-transform-hopeless"), script: "Now you build a word. Here is the base. Hope. Snap on the ending that makes it mean without hope." },
      interaction: { type: "transform", base: "hope", add: "less", result: "hopeless", changeIndex: 3, options: ["less", "ful", "er"], labels: { added: "without" }, successAudio: W("hopeless"), coachWrong: "That ending does not mean without. Try a different ending." },
    },
    {
      id: "apply-sort-front-end",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words. Part at the front or the end?",
      narration: { audio: A("apply-sort-front-end"), script: "Sort time. Read each word. Spot the part that snapped on. If the part is at the front of the word, drag it to Front. If the part is at the end, drag it to End." },
      interaction: { type: "sort", buckets: ["Front","End"], items: [{ label: "preheat", bucket: "Front" }, { label: "careless", bucket: "End" }, { label: "reread", bucket: "Front" }, { label: "teacher", bucket: "End" }, { label: "dislike", bucket: "Front" }, { label: "quickly", bucket: "End" }], coachWrong: "Find the part you know first. Look at the start of the word and the end of the word. Then drag the word to where its part lives." },
    },
    {
      id: "apply-speak-restart",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word aloud: restart",
      narration: { audio: A("apply-speak-restart"), script: "Time to read out loud. Look at this brand new word. Spot the part at the front, read the base, and snap them together. Tap the mic and say the whole word in a clear voice." },
      interaction: { type: "speak", text: "restart restarts" },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: The teacher will preheat the oven quickly",
      narration: { audio: A("apply-speak-sentence"), script: "Now read a whole sentence out loud. Spot the word parts as you go. Tap the mic and read the sentence in a big clear voice." },
      interaction: { type: "speak", text: "The teacher will preheat the oven quickly" },
    },
    {
      id: "challenge-choose-prepay",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word means to pay before?",
      fx: { text: "**pay**", effect: "pop-words" },
      narration: { audio: A("challenge-choose-prepay"), script: "Challenge time. Here is a brand new base word. Pay. Word parts can snap onto pay to build new words. Tap the word that means to pay before." },
      interaction: { type: "choose", options: [{ id: "prepay", label: "prepay" }, { id: "repay", label: "repay" }, { id: "unpaid", label: "unpaid" }, { id: "payer", label: "payer" }], correctId: "prepay", coachWrong: "Spot the part at the front of each word. Which prefix means before? Snap it onto pay, then try again." },
    },
    {
      id: "celebrate-word-decoder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a word decoder!",
      fx: { text: "Spot it. Read it. **Snap!**", effect: "fireworks" },
      narration: { audio: A("celebrate-word-decoder"), script: "Amazing decoding. You can spot a prefix at the front, spot a suffix at the end, read the base, and snap the parts together. Pre means before. Dis means not. Less means without. Now no long word can stop you. Keep snapping parts in every book you read." },
    },
  ],
};
