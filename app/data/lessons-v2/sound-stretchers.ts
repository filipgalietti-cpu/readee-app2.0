import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sound-stretchers-timings.json";

// Sound Stretchers (RF.1.2d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sound-stretchers

const A = (id: string) => `/audio/lessons-v2/sound-stretchers/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sound-stretchers/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sound-stretchers/${w.toLowerCase()}.png`;

export const soundStretchersImages: Record<string, string> = {
  "robbie": "A friendly, red robot with stretchy, accordion-like arms, smiling."
};

export const soundStretchers: LessonDef = {
  id: "sound-stretchers",
  title: "Sound Stretchers",
  grade: "1st Grade",
  standard: "RF.1.2d",
  archetype: "phonics",
  objective: "I can stretch a word and say every sound in order!",
  concepts: ["segment spoken single-syllable words into their complete sequence of individual sounds, including words with consonant blends like stop, flag, snap, and swim"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You stretched words like rubber bands and said every sound in order, even four sound words like stop, flag, and swim. Robbie is bouncing with joy. You are a true Sound Stretcher!",
    "title": "You're a Sound Stretcher!",
    "body": "You stretched words into every single sound, in order, even words with tricky blends."
  },
  scenes: [
    {
      id: "hook-robbie-intro",
      purpose: "hook",
      gate: "interaction",
      prompt: "Meet Robbie, the stretching robot.",
      image: IMG("robbie"),
      narration: { audio: A("hook-robbie-intro"), script: "Welcome back to the Sound Factory! This is Robbie, the stretching robot. Robbie grabs a word and stretches it like a rubber band, so slowly that you can hear every sound inside. Read along with me." },
      interaction: { type: "read-along", text: "Robbie loves to stretch words. He says a word very slowly. Then he can hear every sound.", audio: A("hook-robbie-intro-sentence") },
    },
    {
      id: "model-stretch-sun",
      purpose: "model",
      gate: "none",
      prompt: "Watch Robbie stretch a word.",
      fx: {"text":"Sss. Uh. Nnn. **Sun**!","effect":"pop-words"},
      narration: { audio: A("model-stretch-sun"), script: "Watch Robbie warm up with a little word. Sun. Robbie pulls it slow, like a rubber band. Sss. Uh. Nnn. Three sounds, in order, first to last. Let go, and the word snaps back. Sun." },
    },
    {
      id: "guided-sequence-map",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the sounds in order, then the word.",
      narration: { audio: A("guided-sequence-map"), script: "Now you stretch one. The word is map. Say it slowly. Mmm. Aaa. Puh. Drag the sound tiles into order, first sound to last, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "m", label: "mmm", audio: W("mmm") }, { id: "a", label: "aaa", audio: W("aaa") }, { id: "p", label: "puh", audio: W("puh") }, { id: "map", label: "map", audio: W("map") }], order: ["m","a","p","map"], coachWrong: "Say map slowly, like a rubber band. Mmm. Aaa. Puh. Which sound comes first? Put the sounds in that order, then the word last." },
    },
    {
      id: "model-stretch-stop",
      purpose: "model",
      gate: "none",
      prompt: "Some words hide four sounds.",
      fx: {"text":"Sss. Tuh. Aww. Puh. **Stop**!","effect":"pop-words"},
      narration: { audio: A("model-stretch-stop"), script: "Some words hide four sounds. Watch Robbie stretch the word stop. Sss. Tuh. Aww. Puh. Stop. Did you hear it? The sss and the tuh sit right next to each other at the start. Stretch slowly, so each sound gets its own turn." },
    },
    {
      id: "guided-sequence-flag",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the sounds in order, then the word.",
      narration: { audio: A("guided-sequence-flag"), script: "Your turn to stretch a four sound word. The word is flag. Say it slowly. Fff. Lll. Aaa. Guh. Drag the sound tiles into order, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "f", label: "fff", audio: W("fff") }, { id: "l", label: "lll", audio: W("lll") }, { id: "a", label: "aaa", audio: W("aaa") }, { id: "g", label: "guh", audio: W("guh") }, { id: "flag", label: "flag", audio: W("flag") }], order: ["f","l","a","g","flag"], coachWrong: "Stretch flag again. Fff. Lll. Aaa. Guh. Find the first sound, then keep going in order, and put the word flag last." },
    },
    {
      id: "apply-choose-count-snap",
      purpose: "apply",
      gate: "interaction",
      prompt: "Count the sounds. Tap how many.",
      narration: { audio: A("apply-choose-count-snap"), script: "Robbie needs your ears. The word is snap. Stretch snap slowly with your own voice, and count every sound you say. How many sounds hide inside snap? Read each tile, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "two", label: "two" }, { id: "three", label: "three" }, { id: "four", label: "four" }], correctId: "four", coachWrong: "Stretch snap again, nice and slow. Put up one finger for each sound you say. Then tap the number you counted." },
    },
    {
      id: "apply-speak-spin",
      purpose: "apply",
      gate: "interaction",
      prompt: "Stretch the word, then say it into the mic.",
      narration: { audio: A("apply-speak-spin"), script: "Now you be the rubber band! The word is spin. Say spin slowly and give every sound its own turn. Then tap the mic and say the whole word." },
      interaction: { type: "speak", text: "spin spins spinning" },
    },
    {
      id: "apply-sequence-swim",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the sounds in order, then the word.",
      narration: { audio: A("apply-sequence-swim"), script: "No warm up this time. The word is swim. Stretch it with your own voice and listen for all four sounds. Drag the sound tiles into order, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "s", label: "sss", audio: W("sss") }, { id: "w", label: "wuh", audio: W("wuh") }, { id: "i", label: "iii", audio: W("iii") }, { id: "swim", label: "swim", audio: W("swim") }, { id: "m", label: "mmm", audio: W("mmm") }], order: ["s","w","i","m","swim"], coachWrong: "Say swim slowly, like a rubber band. Which sound starts it? Put that tile first, then keep stretching in order, and put the word swim last." },
    },
    {
      id: "challenge-choose-frog",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which sound comes right after fff?",
      narration: { audio: A("challenge-choose-frog"), script: "Challenge time! Robbie found a brand new word. Frog. Say frog slowly in your head. Which sound comes right after the fff? Tap a tile to hear it, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "rrr", label: "rrr", audio: W("rrr") }, { id: "aww", label: "aww", audio: W("aww") }, { id: "guh", label: "guh", audio: W("guh") }], correctId: "rrr", coachWrong: "Say frog out loud, nice and slow. Fff starts it. Feel the very next sound your mouth makes, then tap that tile." },
    },
    {
      id: "challenge-speak-grab",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Last one! Stretch it, then say the word.",
      narration: { audio: A("challenge-speak-grab"), script: "Last stretch, Sound Stretcher! The word is grab. Say every sound in grab slowly, first to last. Then tap the mic and say the whole word." },
      interaction: { type: "speak", text: "grab grabs grabbed" },
    },
    {
      id: "celebrate-sound-stretcher",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Sound Stretcher!",
      fx: {"text":"You are a **Sound Stretcher**!","effect":"fireworks"},
      narration: { audio: A("celebrate-sound-stretcher"), script: "You did it! You stretched words like rubber bands and said every sound in order, even four sound words like stop, flag, and swim. Robbie is bouncing with joy. You are a true Sound Stretcher!" },
    },
  ],
};
