import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./science-word-clues-timings.json";

// Science Word Clues (RI.2.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=science-word-clues
// G2: ONE true fact book "Busy Beavers". Topic words with in-text author help:
// gnaw (shown by example), dam (sentence clues around it), lodge (defined outright),
// waterproof (inferred from the sentence after it). Evidence beats point at the
// exact words; sort maps facts to dam vs lodge; production speak uses "lodge".
// All facts verified true: beavers gnaw trunks with front teeth, build stick-and-mud
// dams that pond streams, build lodges with underwater entrances, have waterproof fur.

const A = (id: string) => `/audio/lessons-v2/science-word-clues/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/science-word-clues/${w.toLowerCase()}.png`;

export const scienceWordCluesImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A nonfiction book cover style illustration of a calm beaver pond at the edge of a green forest, one brown beaver with a wide flat tail swimming with its head above the water, cattails at the pond edge, soft blue sky, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "gnawing-tree": { subject: "A close view of the same brown beaver on land biting the trunk of a small tree with its large front teeth, pale wood chips on the ground around the base of the trunk, green forest behind, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  "lodge-pond": { subject: "A calm pond with a large rounded solid dome of crisscrossed sticks packed with dried mud rising out of the middle of the water, the dome is completely closed with no opening and no hole and no doorway and no entrance visible anywhere, green forest in the background, no animals visible, realistic, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  // Quiz easier-band picture support (fresh stimuli, not lesson scenes):
  "rabbit-burrow": "A brown rabbit sitting in green grass beside the round entrance of its burrow hole in the earth, gentle daylight, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "seedling-plant": "A tiny green seedling with two small leaves sprouting up from dark brown soil, soft daylight, realistic, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "bee-flower": "A honeybee seen from the side resting on a bright open flower in a green meadow, the bee drawn as a real insect with a plain round head, no face, no eyes drawn, no mouth, no smile, not a cartoon character, realistic natural insect, friendly nonfiction illustration, no text or letters or numbers anywhere"
};

export const scienceWordClues: LessonDef = {
  id: "science-word-clues",
  title: "Science Word Clues",
  grade: "2nd Grade",
  standard: "RI.2.4",
  archetype: "vocabulary",
  objective: "I can use the author's help right in the text to figure out what a topic word means.",
  concepts: ["topic words in fact books","the author tells the meaning","an example shows the meaning","sentence clues around the word"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a true book about beavers, and no topic word stopped you. The author told you what a lodge is. The beaver's own actions showed you what gnaw means. The sentences around dam and waterproof held their clues. That help waits in every fact book you will ever read. Find the topic word, then find the author's help right beside it.",
    "title": "Topic Word Champion!",
    "body": "You used the author's help to crack gnaw, dam, lodge, and waterproof. The meaning of a topic word hides right in the text."
  },
  scenes: [
    {
      id: "hook-topic-words",
      purpose: "hook",
      gate: "none",
      prompt: "Fact books use topic words.",
      image: IMG("cover"),
      fx: {"text":"The author leaves **help** in the text.","effect":"underline"},
      narration: { audio: A("hook-topic-words"), script: "Hello, reader! Today we open a true book called Busy Beavers. Fact books are full of topic words, special science words about the topic. Here is the good news. The author almost always leaves help for those words right in the text. Sometimes the author tells you the meaning. Sometimes an example shows you. Sometimes the sentences around the word hold the clue. Today you will find that help and use it." },
    },
    {
      id: "model-fox-den",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use the author's help.",
      fx: {"text":"A den **is** a hole where a fox lives.","effect":"pop-words"},
      narration: { audio: A("model-fox-den"), script: "Watch me first, with a different animal. A fact book about foxes says this. Foxes dig a den. A den is a hole where a fox sleeps and stays safe. Den is a topic word, and I do not have to guess. The very next sentence tells me what a den is. The author put the meaning right there in the text. That is the kind of help we will hunt for today." },
    },
    {
      id: "read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one with me.",
      image: IMG("gnawing-tree"),
      narration: { audio: A("read-page-one"), script: "Time to open Busy Beavers. Every fact in it is true. Here is page one. Read along with me, and watch for the topic word gnaw." },
      interaction: { type: "read-along", text: "A beaver gnaws on tree trunks. It bites the wood again and again with its strong front teeth. At last the tree falls down.", audio: A("read-page-one-sentence") },
    },
    {
      id: "check-gnaw-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does gnaw mean?",
      narration: { audio: A("check-gnaw-meaning"), script: "Gnaw is our first topic word. The author did not stop to tell you the meaning. The beaver's own actions showed you. Page one said the beaver bites the wood again and again with its strong front teeth. Use what the beaver did. Tap what gnaw means." },
      interaction: { type: "choose", options: [{ id: "chew-again-and-again", label: "chew again and again" }, { id: "sleep-in-a-safe-spot", label: "sleep in a safe spot" }, { id: "swim-across-a-pond", label: "swim across a pond" }, { id: "climb-up-a-tall-tree", label: "climb up a tall tree" }], correctId: "chew-again-and-again", coachWrong: "Go back to page one. The beaver used its front teeth on the wood, over and over. Which action matches that?" },
    },
    {
      id: "check-gnaw-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words showed you what gnaw means?",
      narration: { audio: A("check-gnaw-evidence"), script: "Now prove it like a reader. Page one said, a beaver gnaws on tree trunks. It bites the wood again and again with its strong front teeth. At last the tree falls down. One group of words showed you what gnaw means. Tap the words that showed you." },
      interaction: { type: "choose", options: [{ id: "bites-again-and-again", label: "bites again and again" }, { id: "a-beaver-gnaws", label: "a beaver gnaws" }, { id: "on-tree-trunks", label: "on tree trunks" }, { id: "the-tree-falls-down", label: "the tree falls down" }], correctId: "bites-again-and-again", coachWrong: "The clue words show the action the beaver does with its teeth. Which words show that action?" },
    },
    {
      id: "read-page-two",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: The beaver drags sticks and mud into the stream. It builds a dam. The dam holds back the water and makes a deep pond.",
      narration: { audio: A("read-page-two"), script: "Page two is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "The beaver drags sticks and mud into the stream It builds a dam The dam holds back the water and makes a deep pond" },
    },
    {
      id: "check-dam-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is a dam?",
      narration: { audio: A("check-dam-meaning"), script: "Dam is a topic word, and this time the clue lives in the sentences around it. Page two said the beaver drags sticks and mud into the stream, and the dam holds back the water and makes a deep pond. Think about what a dam must be. Tap the best meaning." },
      interaction: { type: "choose", options: [{ id: "a-wall-that-blocks-water", label: "a wall that blocks water" }, { id: "a-deep-cold-pond", label: "a deep cold pond" }, { id: "a-fast-little-stream", label: "a fast little stream" }, { id: "a-pile-of-soft-leaves", label: "a pile of soft leaves" }], correctId: "a-wall-that-blocks-water", coachWrong: "Reread page two in your head. The beaver builds it from sticks and mud, and it holds back the stream. What kind of thing does that job?" },
    },
    {
      id: "read-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three with me.",
      image: IMG("lodge-pond"),
      narration: { audio: A("read-page-three"), script: "Page three has a topic word the author explains for you. Read along with me, and catch the author's help." },
      interaction: { type: "read-along", text: "In the middle of the pond, the beaver builds a lodge. A lodge is a home made of sticks and mud. Its doors are hidden under the water.", audio: A("read-page-three-sentence") },
    },
    {
      id: "check-lodge-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words tell us what a lodge is?",
      narration: { audio: A("check-lodge-evidence"), script: "The author tells you exactly what a lodge is, right on page three. Page three said, the beaver builds a lodge. A lodge is a home made of sticks and mud. Its doors are hidden under the water. Tap the words that tell us what a lodge is." },
      interaction: { type: "choose", options: [{ id: "a-home-of-sticks-and-mud", label: "a home of sticks and mud" }, { id: "hidden-under-the-water", label: "hidden under the water" }, { id: "the-middle-of-the-pond", label: "the middle of the pond" }, { id: "the-beaver-builds", label: "the beaver builds" }], correctId: "a-home-of-sticks-and-mud", coachWrong: "One choice tells where the lodge sits. One tells about its doors. You want the words that say what a lodge IS." },
    },
    {
      id: "sort-dam-or-lodge",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Dam or lodge? Sort each fact.",
      narration: { audio: A("sort-dam-or-lodge"), script: "You met two topic words for two builds, the dam and the lodge. Each fact below belongs to one of them. Read each fact, think about which build it tells about, and drag it to that word." },
      interaction: { type: "sort", buckets: ["Dam","Lodge"], items: [{ label: "holds back the water", bucket: "Dam" }, { label: "makes a deep pond", bucket: "Dam" }, { label: "built in the stream", bucket: "Dam" }, { label: "a beaver home", bucket: "Lodge" }, { label: "doors under the water", bucket: "Lodge" }, { label: "in the middle of the pond", bucket: "Lodge" }], coachWrong: "Go back to the book in your mind. Page two told about the dam. Page three told about the lodge. Which page does your fact come from?" },
    },
    {
      id: "read-page-four",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: A beaver's thick fur is waterproof. The beaver swims all day, but its skin stays warm and dry.",
      narration: { audio: A("read-page-four"), script: "One page left, and you read this one out loud too. Tap the mic and read page four." },
      interaction: { type: "speak", text: "A beavers thick fur is waterproof The beaver swims all day but its skin stays warm and dry" },
    },
    {
      id: "check-waterproof-meaning",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does waterproof mean?",
      narration: { audio: A("check-waterproof-meaning"), script: "Waterproof is our last topic word. The author did not stop to explain it. The clue hides in the sentence right after it. Page four said the beaver swims all day, but its skin stays warm and dry. Use that clue. Tap what waterproof means." },
      interaction: { type: "choose", options: [{ id: "keeps-water-out", label: "keeps water out" }, { id: "soaks-up-water", label: "soaks up water" }, { id: "makes-water-warm", label: "makes water warm" }, { id: "lets-water-in", label: "lets water in" }], correctId: "keeps-water-out", coachWrong: "Use page four's clue. The beaver swims all day, yet its skin stays dry. What must the fur be doing to the water?" },
    },
    {
      id: "speak-what-is-a-lodge",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell me out loud: what is a lodge?",
      narration: { audio: A("speak-what-is-a-lodge"), script: "Last one, and it is out loud. Use a topic word like a scientist. What is a lodge? Tap the mic and say your answer." },
      interaction: { type: "speak", text: "home house sticks mud den" },
    },
    {
      id: "celebrate-topic-words",
      purpose: "celebrate",
      gate: "none",
      prompt: "You cracked the topic words!",
      fx: {"text":"Gnaw. Dam. Lodge. **Waterproof!**","effect":"fireworks"},
      narration: { audio: A("celebrate-topic-words"), script: "You read a true book about beavers, and no topic word stopped you. The author told you what a lodge is. The beaver's own actions showed you what gnaw means. The sentences around dam and waterproof held their clues. That help waits in every fact book you will ever read. Find the topic word, then find the author's help right beside it." },
    },
  ],
};
