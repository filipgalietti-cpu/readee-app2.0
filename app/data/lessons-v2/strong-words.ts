import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./strong-words-timings.json";

// Strong Words (L.1.5d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=strong-words

const A = (id: string) => `/audio/lessons-v2/strong-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/strong-words/${w.toLowerCase()}.png`;

export const strongWordsImages: Record<string, string> = {
  "meg-toss": "A cartoon girl gently tossing a small red ball underhand to a smaller toddler boy in a sunny backyard, soft easy motion, both smiling. No text, no letters, no words anywhere.",
  "jen-pound-door": "A cartoon girl banging on a big wooden door with the side of her fist, arm swung back with motion lines, determined face. No text, no letters, no words anywhere.",
  "library-giggle": "A cartoon girl at a library table hiding a tiny quiet laugh behind her hand, cheeks puffed, shelves of colorful books behind her. No text, no letters, no words anywhere.",
  "dripping-dog": "A cartoon soaked shaggy dog standing in a doorway, completely drenched, drops of water falling off its fur into a puddle below. No text, no letters, no words anywhere.",
};

export const strongWords: LessonDef = {
  id: "strong-words",
  title: "Strong Words",
  grade: "1st Grade",
  standard: "L.1.5d",
  archetype: "vocabulary",
  objective: "I can pick the verb that matches how it happened.",
  concepts: ["some verbs mean the same action at different strengths","word ladders climb from weakest to strongest","the way it happened picks the verb that fits"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Great work today. Verbs can name the same action at different strengths. Toss, throw, hurl. Tap, knock, pound. Giggle, laugh, howl. When you tell what happened, pick the verb that matches how it happened.",
    title: "Strong Words!",
    body: "You can pick the verb that matches how it happened!",
  },
  scenes: [
    {
      id: "hook-how-it-happened",
      purpose: "hook",
      gate: "none",
      prompt: "Verbs can be soft or strong.",
      fx: { text: "Ben will **tap|pound** the door.", effect: "word-swap" },
      narration: { audio: A("hook-how-it-happened"), script: "Tap and pound are both ways to hit something. But a tap is soft and quiet, and a pound is hard and loud. Watch the word change. The sentence feels different, right? Today you will climb verb ladders and pick the verb that matches how it happened." },
    },
    {
      id: "model-throwing-ladder",
      purpose: "model",
      gate: "none",
      prompt: "toss, throw, hurl",
      fx: { text: "toss, throw, **hurl**", effect: "shrink-grow" },
      narration: { audio: A("model-throwing-ladder"), script: "Toss, throw, and hurl are all ways to send something flying, but each one is stronger. A toss is soft and easy, just a little flip of your hand. A throw is a plain, everyday send. A hurl uses your whole arm and all your muscles to send it far and fast. Try it with me. Flip your hand for a little toss. Now swing your arm for a throw. Now wind up your whole body and hurl! The verbs climb like a ladder. Toss is the softest. Hurl is the strongest." },
    },
    {
      id: "guided-choose-toss",
      purpose: "guided",
      gate: "interaction",
      prompt: "Meg sent the ball soft and easy.",
      image: IMG("meg-toss"),
      narration: { audio: A("guided-choose-toss"), script: "Your turn. Meg played catch with her little brother. He is small, so she sent the ball soft and easy, just a little flip of her hand. Tap the verb that matches how she sent it." },
      interaction: { type: "choose", options: [{ id: "toss", label: "toss" }, { id: "throw", label: "throw" }, { id: "hurl", label: "hurl" }], correctId: "toss", coachWrong: "Meg was being gentle with her little brother. The ball only went a tiny way. Which verb is the softest, easiest send on the ladder? Try again." },
    },
    {
      id: "guided-sequence-throwing",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the sending ladder, weakest to strongest.",
      narration: { audio: A("guided-sequence-throwing"), script: "Now build the sending ladder. Remember what each verb means. A hurl uses your whole arm to send it far and fast. A toss is a soft, easy little flip. A throw is a plain, everyday send. Drag the verbs in order, from the softest send to the strongest send." },
      interaction: { type: "sequence", items: [{ id: "toss", label: "toss" }, { id: "throw", label: "throw" }, { id: "hurl", label: "hurl" }], order: ["toss","throw","hurl"], coachWrong: "Start with the soft, easy little flip. End with the send that uses your whole arm. Try again." },
    },
    {
      id: "model-knocking-ladder",
      purpose: "model",
      gate: "none",
      prompt: "tap, knock, pound",
      fx: { text: "tap, knock, **pound**", effect: "lightning" },
      narration: { audio: A("model-knocking-ladder"), script: "Here is a new ladder. Tap, knock, and pound are all ways to hit something, and each one gets louder. A tap is one soft little touch. A knock is a plain, firm hit, like knocking on a door. A pound is a hard, heavy hit that booms. Try it on your knee. Tap it softly with one finger. Now knock with your knuckles. Now pound with your fist. Boom! Tap is the quietest. Pound is the loudest." },
    },
    {
      id: "apply-sequence-knocking",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the hitting ladder, quietest to loudest.",
      narration: { audio: A("apply-sequence-knocking"), script: "Build the hitting ladder. Think about your knee. Which hit was one soft little touch? Which hit boomed like thunder? Drag the verbs in order, from the quietest hit to the loudest hit." },
      interaction: { type: "sequence", items: [{ id: "tap", label: "tap" }, { id: "knock", label: "knock" }, { id: "pound", label: "pound" }], order: ["tap","knock","pound"], coachWrong: "Start with the soft little touch. End with the hit that booms. Try again." },
    },
    {
      id: "apply-choose-pound",
      purpose: "apply",
      gate: "interaction",
      prompt: "Jen hit the door hard so they would hear.",
      image: IMG("jen-pound-door"),
      narration: { audio: A("apply-choose-pound"), script: "The music inside was very loud. Jen hit the door hard with her fist, boom, boom, boom, so someone would finally hear her. Tap the verb that matches how she hit it." },
      interaction: { type: "choose", options: [{ id: "tap", label: "tap" }, { id: "knock", label: "knock" }, { id: "pound", label: "pound" }], correctId: "pound", coachWrong: "Jen used her fist, and the hits went boom, boom, boom. Which verb is the loudest, hardest hit on the ladder? Try again." },
    },
    {
      id: "model-laughing-ladder",
      purpose: "model",
      gate: "none",
      prompt: "giggle, laugh, howl",
      fx: { text: "giggle, laugh, **howl**", effect: "pop-words" },
      narration: { audio: A("model-laughing-ladder"), script: "Laughing has a ladder too. A giggle is a tiny, quiet laugh you can hide behind your hand. A laugh is a plain, everyday ha ha. A howl is a great big laugh, so loud you throw your head back and hold your belly. Try it. Do a tiny giggle behind your hand. Now a plain laugh. Now a great big howl! Giggle is the smallest. Howl is the biggest." },
    },
    {
      id: "apply-choose-giggle",
      purpose: "apply",
      gate: "interaction",
      prompt: "Pip laughed a tiny, quiet laugh.",
      image: IMG("library-giggle"),
      narration: { audio: A("apply-choose-giggle"), script: "Pip was in the library, where everyone must be quiet. Her book was funny, so she let out a tiny, quiet laugh behind her hand. Nobody even heard it. Tap the verb that matches how she laughed." },
      interaction: { type: "choose", options: [{ id: "giggle", label: "giggle" }, { id: "laugh", label: "laugh" }, { id: "howl", label: "howl" }], correctId: "giggle", coachWrong: "Pip's laugh was so tiny and quiet that nobody heard it. Which verb is the smallest laugh on the ladder? Try again." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: Jen will pound on the big wood door.",
      narration: { audio: A("apply-speak-read"), script: "Now read out loud all by yourself. The sentence is on your screen. Read it in a big, clear voice." },
      interaction: { type: "speak", text: "Jen will pound on the big wood door" },
    },
    {
      id: "model-wet-ladder",
      purpose: "model",
      gate: "none",
      prompt: "damp, wet, dripping",
      image: IMG("dripping-dog"),
      narration: { audio: A("model-wet-ladder"), script: "Describing words climb ladders too. Damp, wet, and dripping all tell about water, and each one is stronger. Damp means just a little bit wet, like a towel after you dry your hands. Wet means soaked through. Dripping means so full of water that drops fall right off. Look at this dog. Water is falling off his fur, drip, drip, drip. That dog is not just damp. He is not just wet. He is dripping." },
    },
    {
      id: "apply-sort-weak-strong",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: weak or strong?",
      narration: { audio: A("apply-sort-weak-strong"), script: "Time to sort. Some of these words are the weakest step on their ladder, soft and small. Some are the strongest step, big and loud. Read each word. Then drag it to weak or strong." },
      interaction: { type: "sort", buckets: ["Weak","Strong"], items: [{ label: "tap", bucket: "Weak" }, { label: "pound", bucket: "Strong" }, { label: "giggle", bucket: "Weak" }, { label: "howl", bucket: "Strong" }, { label: "damp", bucket: "Weak" }, { label: "dripping", bucket: "Strong" }], coachWrong: "Think about that word's ladder. Is it the soft, small step or the big, loud step? Try again." },
    },
    {
      id: "challenge-choose-dripping",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Water fell off Sam's shirt in big drops.",
      narration: { audio: A("challenge-choose-dripping"), script: "Challenge time, no picture help. Sam ran all the way home in the pouring rain with no coat. When he stepped inside, water fell off his shirt in big drops and made a puddle on the floor. Tap the word that matches how wet he was." },
      interaction: { type: "choose", options: [{ id: "damp", label: "damp" }, { id: "wet", label: "wet" }, { id: "dripping", label: "dripping" }], correctId: "dripping", coachWrong: "Water was still falling off Sam's shirt, drop after drop, into a puddle. Which word is the strongest step on the water ladder? Try again." },
    },
    {
      id: "challenge-speak-howl",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the verb that matches the laugh.",
      narration: { audio: A("challenge-speak-howl"), script: "Last one. At the circus, a clown slipped on a banana peel and landed in a giant cake. The whole crowd threw their heads back and laughed as big and loud as they could, holding their bellies. Which laughing verb from our ladder matches that laugh? Say it out loud." },
      interaction: { type: "speak", text: "howl howls howled howling" },
    },
    {
      id: "celebrate-verb-ladders",
      purpose: "celebrate",
      gate: "none",
      prompt: "You pick strong words!",
      fx: { text: "**Strong** words!", effect: "fireworks" },
      narration: { audio: A("celebrate-verb-ladders"), script: "You did it! You climbed the sending ladder, the hitting ladder, the laughing ladder, and the water ladder. Verbs can name the same action at different strengths. From now on, pick the verb that matches how it happened." },
    },
  ],
};
