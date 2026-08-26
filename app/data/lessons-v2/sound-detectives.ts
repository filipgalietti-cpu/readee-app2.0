import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sound-detectives-timings.json";

// Sound Detectives (RF.K.2d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sound-detectives

const A = (id: string) => `/audio/lessons-v2/sound-detectives/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sound-detectives/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sound-detectives/${w.toLowerCase()}.png`;

export const soundDetectivesImages: Record<string, string> = {
  "cat": "A friendly orange tabby cat sitting and looking curious.",
  "dog": "A playful brown dog wagging its tail, panting gently.",
  "sun": "A smiling yellow sun shining brightly in a blue sky.",
  "magnifying-glass": "A bright yellow magnifying glass with a handle, ready to find clues.",
  "pig": "A happy pink pig with big ears, oinking softly.",
  "p": "A blue square tile with a lowercase 'p' on it, representing the /p/ sound.",
  "i": "A green square tile with a lowercase 'i' on it, representing the /i/ sound.",
  "g": "A yellow square tile with a lowercase 'g' on it, representing the /g/ sound.",
  "d": "A red square tile with a lowercase 'd' on it, representing the /d/ sound.",
  "o": "A purple square tile with a lowercase 'o' on it, representing the /o/ sound.",
  "s": "An orange square tile with a lowercase 's' on it, representing the /s/ sound.",
  "u": "A light blue square tile with a lowercase 'u' on it, representing the /u/ sound.",
  "n": "A dark green square tile with a lowercase 'n' on it, representing the /n/ sound.",
  "cup": "A red plastic cup with a straw.",
  "c": "A pink square tile with a lowercase 'c' on it, representing the /c/ sound.",
  "beginning": "A green box labeled 'Beginning' with an arrow pointing to the left.",
  "middle": "A yellow box labeled 'Middle' with an arrow pointing to the center.",
  "end": "A red box labeled 'End' with an arrow pointing to the right.",
  "fan": "A blue electric fan with spinning blades.",
  "map": "A rolled-out paper treasure map with a dotted path and a red X."
};

export const soundDetectives: LessonDef = {
  id: "sound-detectives",
  title: "Sound Detectives",
  grade: "Kindergarten",
  standard: "RF.K.2d",
  archetype: "phonics",
  objective: "You will become a super sound detective and find sounds in words.",
  concepts: ["isolate sounds","first sound","middle vowel sound","last sound","CVC words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Great job, super sound detective! You learned to stretch words out slowly and listen carefully. You can now find the first, middle, and last sounds in words all by yourself. Keep practicing your amazing listening skills!",
    "title": "Mission Accomplished!",
    "body": "You're a master of sounds!"
  },
  scenes: [
    {
      id: "hook-listen-mission",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Listen closely to our mission!",
      narration: { audio: A("hook-listen-mission"), script: "Hello, super sound detectives! We have a very important mission today. We need to find special sounds hidden inside words. Listen closely to the sounds all around us!" },
      interaction: { type: "listen", items: [{ label: "CAT", audio: W("cat"), image: IMG("cat") }, { label: "DOG", audio: W("dog"), image: IMG("dog") }, { label: "SUN", audio: W("sun"), image: IMG("sun") }] },
    },
    {
      id: "model-stretch-words",
      purpose: "model",
      gate: "none",
      prompt: "Let's stretch out words.",
      image: IMG("magnifying-glass"),
      fx: {"text":"Stretch words slowly.","effect":"pop-words"},
      narration: { audio: A("model-stretch-words"), script: "To be a great sound detective, we need to stretch words out slowly. Listen as I stretch the word cat, nice and slow. Cuh. Aaa. Tuh. Then, we find where a sound lives. Is it at the beginning, the middle, or the end?" },
    },
    {
      id: "model-first-sound-cat",
      purpose: "model",
      gate: "none",
      prompt: "Listen for the first sound.",
      image: IMG("cat"),
      fx: {"text":"The first sound in **cat** is **c**.","effect":"glow"},
      narration: { audio: A("model-first-sound-cat"), script: "Let's try with the word cat. When I say cat, the very first sound I hear is cuh. Can you hear it? Cuh. Cuh. Cat." },
    },
    {
      id: "guided-first-sound-pig",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find the first sound: **pig**.",
      narration: { audio: A("guided-first-sound-pig"), script: "Great job! Now it's your turn. Listen to the word pig, stretched out slowly. Puh. Iii. Guh. What is the very first sound you hear in pig? Tap the sound!" },
      interaction: { type: "choose", options: [{ id: "p", label: "p", audio: W("p"), image: IMG("p") }, { id: "i", label: "i", audio: W("i"), image: IMG("i") }, { id: "g", label: "g", audio: W("g"), image: IMG("g") }], correctId: "p", coachWrong: "Almost! Remember, the first sound is the very first one you hear when you say pig slowly. Try again!" },
    },
    {
      id: "model-last-sound-cat",
      purpose: "model",
      gate: "none",
      prompt: "Listen for the last sound.",
      image: IMG("cat"),
      fx: {"text":"The last sound in **cat** is **t**.","effect":"glow"},
      narration: { audio: A("model-last-sound-cat"), script: "You found the first sound! Now, let's find the last sound. In the word cat, the very last sound I hear is tuh. Listen. Cuh. Aaa. Tuh. Hear that tuh at the end?" },
    },
    {
      id: "guided-last-sound-dog",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find the last sound: **dog**.",
      narration: { audio: A("guided-last-sound-dog"), script: "Super work! Let's try another one. Listen to the word dog, stretched out slowly. Duh. Aww. Guh. What is the very last sound you hear in dog? Tap the sound!" },
      interaction: { type: "choose", options: [{ id: "d", label: "d", audio: W("d"), image: IMG("d") }, { id: "o", label: "o", audio: W("o"), image: IMG("o") }, { id: "g", label: "g", audio: W("g"), image: IMG("g") }], correctId: "g", coachWrong: "You're so close! The last sound is the one that finishes the word dog. Listen carefully and try again!" },
    },
    {
      id: "model-middle-sound-cat",
      purpose: "model",
      gate: "none",
      prompt: "Listen for the middle sound.",
      image: IMG("cat"),
      fx: {"text":"The middle sound in **cat** is **a**.","effect":"glow"},
      narration: { audio: A("model-middle-sound-cat"), script: "Fantastic! Now for the trickiest sound. It's the middle sound. In cat, the sound in the middle is aaa. Cuh. Aaa. Tuh. That short a sound is right in the middle!" },
    },
    {
      id: "guided-middle-sound-sun",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find the middle sound: **sun**.",
      narration: { audio: A("guided-middle-sound-sun"), script: "Now let's find the middle sound in sun. Listen to sun, stretched out slowly. Sss. Uh. Nnn. What sound is right in the middle? Tap it!" },
      interaction: { type: "choose", options: [{ id: "s", label: "s", audio: W("s"), image: IMG("s") }, { id: "u", label: "u", audio: W("u"), image: IMG("u") }, { id: "n", label: "n", audio: W("n"), image: IMG("n") }], correctId: "u", coachWrong: "Almost! The middle sound is the one you hear between the first and last sounds in sun. Listen again!" },
    },
    {
      id: "apply-sequence-cup",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the sounds in order: **cup**.",
      narration: { audio: A("apply-sequence-cup"), script: "Now let's put all three sounds in order for the word cup. Say cup slowly to yourself. First, find the beginning sound. Then the middle. Last, the end sound. Drag them into order!" },
      interaction: { type: "sequence", items: [{ id: "c", label: "c", audio: W("c"), image: IMG("c") }, { id: "u", label: "u", audio: W("u"), image: IMG("u") }, { id: "p", label: "p", audio: W("p"), image: IMG("p") }], order: ["c","u","p"], coachWrong: "Keep listening! Say cup slowly and try to hear each sound in its place. You've got this!" },
    },
    {
      id: "challenge-position-fan",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where does the **a** sound live in **fan**?",
      narration: { audio: A("challenge-position-fan"), script: "Here's a tricky one. Listen to the word fan. Fff. Aaa. Nnn. Where do you hear the aaa sound in fan? Tap the box that shows where it lives!" },
      interaction: { type: "choose", options: [{ id: "beginning", label: "BEGINNING", audio: W("beginning"), image: IMG("beginning") }, { id: "middle", label: "MIDDLE", audio: W("middle"), image: IMG("middle") }, { id: "end", label: "END", audio: W("end"), image: IMG("end") }], correctId: "middle", coachWrong: "Listen to fan again, stretching it out. Fff. Aaa. Nnn. Where does the aaa sound live? You can do it!" },
    },
    {
      id: "challenge-say-map",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Stretch it, then say it out loud!",
      image: IMG("map"),
      narration: { audio: A("challenge-say-map"), script: "One last detective job! This is a map. Stretch it out slowly with me. Mmm. Aaa. Puh. Now say the whole word map out loud, nice and clear!" },
      interaction: { type: "speak", text: "map" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a sound expert!",
      fx: {"text":"You found all the sounds!","effect":"rainbow"},
      narration: { audio: A("celebrate-success"), script: "You did it! You are a super sound detective! You learned to stretch words out slowly, find where a sound lives, and say that sound all by itself. Keep practicing and listening for those hidden sounds!" },
    },
  ],
};
