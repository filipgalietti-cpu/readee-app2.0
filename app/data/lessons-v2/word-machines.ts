import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-machines-timings.json";

// Word Machines (RF.K.2e) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-machines

const A = (id: string) => `/audio/lessons-v2/word-machines/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/word-machines/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-machines/${w.toLowerCase()}.png`;

export const wordMachinesImages: Record<string, string> = {
  "word-machine": "A friendly cartoon robot, named Bolt, standing next to a whimsical machine with colorful gears and blinking lights, ready to make words.",
  "cat": "A cute cartoon cat sitting with a happy expression.",
  "hat": "A bright red cartoon hat, simple and vivid.",
  "bat": "A wooden baseball bat, brown with a grip.",
  "pin": "A shiny silver safety pin, open slightly.",
  "fin": "A cartoon fish fin, bright orange and flowing.",
  "dog": "A friendly cartoon dog wagging its tail, a golden retriever type.",
  "log": "A brown tree log, cut and showing rings.",
  "fog": "A swirling cloud of white mist, soft and ethereal.",
  "car": "A small red cartoon car, driving cheerfully.",
  "jar": "A clear glass jar with a metal lid, empty.",
  "can": "A metal soda can, shiny and silver.",
  "fan": "A small electric fan, white with spinning blades.",
  "f": "A bright red block with the uppercase letter 'F' on it.",
  "a": "A bright blue block with the lowercase letter 'a' on it.",
  "n": "A bright green block with the lowercase letter 'n' on it.",
  "red": "A red crayon, unwrapped and ready to color.",
  "bed": "A cozy cartoon bed with a soft blue blanket and pillow.",
  "b": "A bright yellow block with the lowercase letter 'b' on it.",
  "e": "A bright orange block with the lowercase letter 'e' on it.",
  "d": "A bright purple block with the lowercase letter 'd' on it.",
  "fox": "A cute cartoon fox, sitting with a bushy tail.",
  "box": "A simple brown cardboard box, closed.",
  "top": "A colorful spinning toy top, mid-spin."
};

export const wordMachines: LessonDef = {
  id: "word-machines",
  title: "Word Machines",
  grade: "Kindergarten",
  standard: "RF.K.2e",
  archetype: "phonics",
  objective: "You will learn to change one sound in a word to make a brand-new word!",
  concepts: ["add or swap one sound to make a brand-new word","change the first sound of cat to h to get hat","hear how one sound changes the whole word"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super Word Machine Master! You learned how to change just one sound to make a brand new word! Keep listening for those sounds all around you!",
    "title": "Amazing Word Master!",
    "body": "You've mastered the Word Machine! Changing sounds to make new words is a fantastic skill. Keep practicing and listening for those sound changes!"
  },
  scenes: [
    {
      id: "hook-listen-machine",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to the Word Machine!",
      image: IMG("word-machine"),
      fx: {"text":"cat makes **hat**","effect":"pop-words"},
      narration: { audio: A("hook-listen-machine"), script: "Hello, friend! I'm Bolt, your Word Machine helper. Listen closely as our machine makes some new words. Hear how the words change!" },
      interaction: { type: "listen", items: [{ label: "CAT", audio: W("cat"), image: IMG("cat") }, { label: "HAT", audio: W("hat"), image: IMG("hat") }, { label: "BAT", audio: W("bat"), image: IMG("bat") }] },
    },
    {
      id: "model-change-cat-to-hat",
      purpose: "model",
      gate: "interaction",
      prompt: "Watch the Word Machine!",
      fx: {"text":"cat -> **h**at","effect":"glow"},
      narration: { audio: A("model-change-cat-to-hat"), script: "Here is how the Word Machine works. We start with cat. The machine swaps the first sound. Cuh becomes Huh, and cat turns into hat! Tap cat first, then tap hat, to run the machine." },
      interaction: { type: "sequence", items: [{ id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }, { id: "hat", label: "HAT", audio: W("hat"), image: IMG("hat") }], order: ["cat","hat"], coachWrong: "The machine starts with cat and makes hat. Tap cat first, then hat." },
    },
    {
      id: "model-change-pin-to-fin",
      purpose: "model",
      gate: "interaction",
      prompt: "See it again!",
      fx: {"text":"pin -> **f**in","effect":"glow"},
      narration: { audio: A("model-change-pin-to-fin"), script: "Let's run it again! We start with pin. The machine swaps the first sound. Puh becomes Fff, and pin turns into fin! Tap pin first, then tap fin, to run the machine." },
      interaction: { type: "sequence", items: [{ id: "pin", label: "PIN", audio: W("pin"), image: IMG("pin") }, { id: "fin", label: "FIN", audio: W("fin"), image: IMG("fin") }], order: ["pin","fin"], coachWrong: "The machine starts with pin and makes fin. Tap pin first, then fin." },
    },
    {
      id: "guided-choose-dog-to-log",
      purpose: "guided",
      gate: "interaction",
      prompt: "Make a new word!",
      narration: { audio: A("guided-choose-dog-to-log"), script: "Your turn! We have the word dog. Change its first sound to Lll to make a new word. Which word did you make?" },
      interaction: { type: "choose", options: [{ id: "dog", label: "DOG", audio: W("dog"), image: IMG("dog") }, { id: "log", label: "LOG", audio: W("log"), image: IMG("log") }, { id: "fog", label: "FOG", audio: W("fog"), image: IMG("fog") }], correctId: "log", coachWrong: "Oops! Listen carefully. Change the Duh sound in dog to Lll. Try again!" },
    },
    {
      id: "guided-choose-car-to-jar",
      purpose: "guided",
      gate: "interaction",
      prompt: "Make another new word!",
      narration: { audio: A("guided-choose-car-to-jar"), script: "Super job! Let's try another. Here is the word car. Change its first sound to Juh. What new word do you hear?" },
      interaction: { type: "choose", options: [{ id: "car", label: "CAR", audio: W("car"), image: IMG("car") }, { id: "jar", label: "JAR", audio: W("jar"), image: IMG("jar") }, { id: "can", label: "CAN", audio: W("can"), image: IMG("can") }], correctId: "jar", coachWrong: "Almost! Listen for the Juh sound at the start. You'll get it!" },
    },
    {
      id: "apply-sequence-can-to-fan",
      purpose: "apply",
      gate: "interaction",
      prompt: "Make 'fan' from 'can'!",
      narration: { audio: A("apply-sequence-can-to-fan"), script: "You're getting so good! Start with can. Change the first sound to Fff. Now the word is fan. Tap the letters in order to build fan." },
      interaction: { type: "sequence", items: [{ id: "f", label: "f", audio: W("f"), image: IMG("f") }, { id: "a", label: "a", audio: W("a"), image: IMG("a") }, { id: "n", label: "n", audio: W("n"), image: IMG("n") }], order: ["f","a","n"], coachWrong: "Say fan slowly. Which sound do you hear first? Try again!" },
    },
    {
      id: "apply-sequence-red-to-bed",
      purpose: "apply",
      gate: "interaction",
      prompt: "Make 'bed' from 'red'!",
      narration: { audio: A("apply-sequence-red-to-bed"), script: "Fantastic! Now let's change red. Change its first sound to Buh. Now the word is bed. Tap the letters in order to build bed." },
      interaction: { type: "sequence", items: [{ id: "b", label: "b", audio: W("b"), image: IMG("b") }, { id: "e", label: "e", audio: W("e"), image: IMG("e") }, { id: "d", label: "d", audio: W("d"), image: IMG("d") }], order: ["b","e","d"], coachWrong: "Say bed slowly. Which sound do you hear first? Try again!" },
    },
    {
      id: "challenge-choose-fox-to-box",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What new word can you make?",
      narration: { audio: A("challenge-choose-fox-to-box"), script: "Here's a tricky one. We start with fox. Change the first sound to Buh. What new word did you make?" },
      interaction: { type: "choose", options: [{ id: "box", label: "BOX", audio: W("box"), image: IMG("box") }, { id: "fox", label: "FOX", audio: W("fox"), image: IMG("fox") }, { id: "top", label: "TOP", audio: W("top"), image: IMG("top") }], correctId: "box", coachWrong: "Listen carefully to the first sound. You can do it!" },
    },
    {
      id: "challenge-say-pup",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the new word!",
      narration: { audio: A("challenge-say-pup"), script: "One more challenge, and this time you get to say it! We have cup. Change its first sound to Puh. Say the new word out loud!" },
      interaction: { type: "speak", text: "pup" },
    },
    {
      id: "celebrate-word-master",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Word Machine Master!",
      fx: {"text":"You are a **Word Machine Master**!","effect":"rainbow"},
      narration: { audio: A("celebrate-word-master"), script: "Wow, you did it! You are a super Word Machine Master! You learned how to change just one sound to make a brand new word! Keep listening for those sounds!" },
    },
  ],
};
