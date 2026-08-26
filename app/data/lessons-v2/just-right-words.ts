import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./just-right-words-timings.json";

// Just-Right Words (L.1.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=just-right-words

const A = (id: string) => `/audio/lessons-v2/just-right-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/just-right-words/${w.toLowerCase()}.png`;

export const justRightWordsImages: Record<string, string> = {
  "girl-peeking": "A cartoon girl with pigtails peeking around a red curtain, only one eye showing, playful sneaky smile. No text, no letters, no words anywhere.",
  "mouse-hole": "A small brown cartoon mouse peeking its head out of a round dark mouse hole at the bottom of a wall, wide curious eyes, room interior background. No text, no letters, no words anywhere.",
  "elephant-dog": "A cartoon grey elephant standing next to a small brown dog in a sunny field, the elephant towering far above the dog. No text, no letters, no words anywhere.",
  "whale-boat": "An enormous cartoon blue whale swimming beside a tiny red rowboat in the ocean, the whale many times bigger than the boat. No text, no letters, no words anywhere.",
  "soup-pot": "A cartoon pot of orange soup bubbling on a stove, big puffs of steam rising from the pot. No text, no letters, no words anywhere.",
  "dino-stomp": "A cartoon green dinosaur slamming one big foot down on the ground, dust clouds puffing up around the foot. No text, no letters, no words anywhere.",
};

export const justRightWords: LessonDef = {
  id: "just-right-words",
  title: "Just-Right Words",
  grade: "1st Grade",
  standard: "L.1.5",
  archetype: "vocabulary",
  objective: "I can pick the word that fits just right.",
  concepts: ["some words are almost the same but not quite","word ladders climb from weakest to strongest","the context tells you which word fits just right"],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "Great work today. Words can be almost the same, but each one has its own strength. Peek, look, stare. Big, huge, gigantic. Walk, march, stomp. When you talk or write, pick the word that fits just right. Keep climbing those word ladders.",
    title: "Just-Right Words!",
    body: "You can pick the word that fits just right!",
  },
  scenes: [
    {
      id: "hook-almost-the-same",
      purpose: "hook",
      gate: "none",
      prompt: "Some words are almost the same.",
      fx: { text: "You can **peek|stare** at it.", effect: "word-swap" },
      narration: { audio: A("hook-almost-the-same"), script: "Some words are almost the same, but not quite. Peek and stare are both ways to see. But a peek is one tiny second, and a stare goes on and on. Watch the word change. The sentence feels different, right? Today you will climb word ladders and pick the word that fits just right." },
    },
    {
      id: "model-seeing-ladder",
      purpose: "model",
      gate: "none",
      prompt: "peek, look, stare",
      image: IMG("girl-peeking"),
      narration: { audio: A("model-seeing-ladder"), script: "Peek, look, and stare are all ways to see, but each word is a little different. A peek is a quick, sneaky little see, like this girl peeking around the curtain. A look is a plain, everyday see. A stare is a long, strong see that goes on and on. The words climb like a ladder. Peek is the quickest. Stare is the strongest." },
    },
    {
      id: "model-size-ladder",
      purpose: "model",
      gate: "none",
      prompt: "Size words grow stronger.",
      fx: { text: "big, huge, **gigantic**", effect: "shrink-grow" },
      narration: { audio: A("model-size-ladder"), script: "Size words climb a ladder too. Big is strong. Huge is even stronger. Gigantic is the strongest size word of all. A dog can be big. A horse is huge. A blue whale is gigantic. Watch the words grow bigger and stronger." },
    },
    {
      id: "guided-choose-mouse",
      purpose: "guided",
      gate: "interaction",
      prompt: "The mouse takes a quick, sneaky ___.",
      image: IMG("mouse-hole"),
      narration: { audio: A("guided-choose-mouse"), script: "Your turn. A mouse pokes its head out of its hole for one quick, sneaky second, then hides again. It does not want the cat to spot it. Tap the seeing word that fits just right." },
      interaction: { type: "choose", options: [{ id: "peek", label: "peek" }, { id: "look", label: "look" }, { id: "stare", label: "stare" }], correctId: "peek", coachWrong: "Think how fast and sneaky the mouse is. One tiny second, then it hides. Which word is the quickest, sneakiest see on the ladder? Try again." },
    },
    {
      id: "guided-sequence-seeing",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the seeing ladder, weakest to strongest.",
      narration: { audio: A("guided-sequence-seeing"), script: "Now build the seeing ladder. Remember what each word means. A stare goes on and on. A peek is one quick, sneaky second. A look is plain and everyday. Drag the words in order, from the quickest little see to the longest, strongest see." },
      interaction: { type: "sequence", items: [{ id: "peek", label: "peek" }, { id: "look", label: "look" }, { id: "stare", label: "stare" }], order: ["peek","look","stare"], coachWrong: "Start with the quickest, sneakiest see. End with the see that goes on and on. Try again." },
    },
    {
      id: "model-moving-act",
      purpose: "model",
      gate: "none",
      prompt: "Act it out: walk, march, stomp!",
      fx: { text: "**walk**, **march**, **stomp**", effect: "pop-words" },
      narration: { audio: A("model-moving-act"), script: "Time to move! Walk, march, and stomp are all ways to move your feet, and each one grows stronger. Stand up if you can. First take a soft, easy walk in place. Now march with strong, proud steps. Lift those knees. Now stomp! Slam your feet down hard. Boom! Walk is soft. March is stronger. Stomp is the strongest of all." },
    },
    {
      id: "apply-sequence-moving",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the moving ladder, weakest to strongest.",
      narration: { audio: A("apply-sequence-moving"), script: "Build the moving ladder. Think about your feet. Which move was quiet and easy? Which move slammed the ground? Drag the words in order, from the softest move to the hardest, strongest move." },
      interaction: { type: "sequence", items: [{ id: "walk", label: "walk" }, { id: "march", label: "march" }, { id: "stomp", label: "stomp" }], order: ["walk","march","stomp"], coachWrong: "Start with the soft, easy move. End with the move that slams the ground. Try again." },
    },
    {
      id: "apply-choose-elephant",
      purpose: "apply",
      gate: "interaction",
      prompt: "The elephant is ___.",
      image: IMG("elephant-dog"),
      narration: { audio: A("apply-choose-elephant"), script: "An ant is small. A dog is big. An elephant is even bigger than the dog. But the elephant is not the biggest animal of all. One animal in the sea is bigger still. Tap the size word that fits the elephant just right." },
      interaction: { type: "choose", options: [{ id: "big", label: "big" }, { id: "huge", label: "huge" }, { id: "gigantic", label: "gigantic" }], correctId: "huge", coachWrong: "The dog already took the word big, and the strongest word belongs to an even bigger animal. The elephant needs the middle step of the ladder. Try again." },
    },
    {
      id: "apply-choose-whale",
      purpose: "apply",
      gate: "interaction",
      prompt: "The whale is ___.",
      image: IMG("whale-boat"),
      narration: { audio: A("apply-choose-whale"), script: "Here is that sea animal. A blue whale is the biggest animal in the whole world, even bigger than the elephant. Look how tiny the boat is next to it. Tap the size word that fits the whale just right." },
      interaction: { type: "choose", options: [{ id: "big", label: "big" }, { id: "huge", label: "huge" }, { id: "gigantic", label: "gigantic" }], correctId: "gigantic", coachWrong: "The whale is the biggest animal of all, so it needs the strongest word on the whole ladder. Try again." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: The gigantic whale swims by the little boat.",
      narration: { audio: A("apply-speak-read"), script: "Now read out loud all by yourself. The sentence is on your screen. Read it in a big, clear voice." },
      interaction: { type: "speak", text: "The gigantic whale swims by the little boat" },
    },
    {
      id: "apply-choose-soup",
      purpose: "apply",
      gate: "interaction",
      prompt: "The soup is ___.",
      image: IMG("soup-pot"),
      narration: { audio: A("apply-choose-soup"), script: "Heat words climb a ladder too. Warm is gentle, like cozy bath water. Hot is stronger. Hot can burn you. Now listen. Dad's soup just came bubbling off the stove. Steam puffs up. Be careful, do not touch it yet! Tap the heat word that fits the soup just right." },
      interaction: { type: "choose", options: [{ id: "cold", label: "cold" }, { id: "warm", label: "warm" }, { id: "hot", label: "hot" }], correctId: "hot", coachWrong: "The soup is bubbling and steaming, and it could burn you. Gentle bath water is warm. This soup is stronger than that. Try again." },
    },
    {
      id: "challenge-choose-magic-show",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Maya did not blink. She kept her eyes on the hat.",
      narration: { audio: A("challenge-choose-magic-show"), script: "Challenge time, no picture help. Maya watched the magician for a whole minute. She kept her eyes right on his hat and did not blink one time. Tap the seeing word that fits just right." },
      interaction: { type: "choose", options: [{ id: "peek", label: "peek" }, { id: "look", label: "look" }, { id: "stare", label: "stare" }], correctId: "stare", coachWrong: "A whole minute without blinking is a long, long see. Which word is the strongest step on the seeing ladder? Try again." },
    },
    {
      id: "challenge-speak-dino",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the just-right moving word.",
      image: IMG("dino-stomp"),
      narration: { audio: A("challenge-speak-dino"), script: "Last one. Pretend you are a giant dinosaur. You slam your feet down as hard as you can. Boom! Boom! Which moving word from our ladder fits just right? Say it out loud." },
      interaction: { type: "speak", text: "stomp stomps stomped stomping" },
    },
    {
      id: "celebrate-word-ladders",
      purpose: "celebrate",
      gate: "none",
      prompt: "You pick just-right words!",
      fx: { text: "**Just-right** words!", effect: "fireworks" },
      narration: { audio: A("celebrate-word-ladders"), script: "You did it! You climbed the seeing ladder, the size ladder, and the moving ladder. Words can be almost the same, but each one has its own strength. From now on, pick the word that fits just right." },
    },
  ],
};
