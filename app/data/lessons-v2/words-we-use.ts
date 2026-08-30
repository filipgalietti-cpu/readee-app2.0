import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-we-use-timings.json";

// Words We Use (L.1.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-we-use

const A = (id: string) => `/audio/lessons-v2/words-we-use/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-we-use/${w.toLowerCase()}.png`;

export const wordsWeUseImages: Record<string, string> = {
  "puzzle-pieces": "Two large colorful jigsaw puzzle pieces clicking together in midair, sparkles at the joint, plain soft sky-blue background, no letters, no words, no text.",
  "park-ducks": "A smiling boy and girl standing by a small park pond tossing food to two friendly ducks, green grass and one tree, bright day, no letters, no words, no text."
};

export const wordsWeUse: LessonDef = {
  id: "words-we-use",
  title: "Words We Use",
  grade: "1st Grade",
  standard: "L.1.6",
  archetype: "vocabulary",
  objective: "You will use joining words like because, and, but, and so to connect your ideas.",
  concepts: ["Joining words","Conjunctions","Connecting ideas","Telling why","Adding more","Showing change","What happened next"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You learned the four joining words and their jobs. Because tells why. And adds more. But shows a change. So tells what happened next. Use them when you talk and when you write.",
    "title": "Words We Use",
    "body": "Joining words connect two ideas. Because tells why, and adds more, but shows a change, so tells what happened next."
  },
  scenes: [
    {
      id: "hook-joining-words",
      purpose: "hook",
      gate: "interaction",
      prompt: "Some small words join big ideas.",
      image: IMG("puzzle-pieces"),
      narration: { audio: A("hook-joining-words"), script: "Some words have a special job. They join two ideas together, like puzzle pieces. Read along with me." },
      interaction: { type: "read-along", text: "Small words can join two ideas. A joining word can tell why, add more, or show a change. Today we put joining words to work.", audio: A("hook-joining-words-sentence") },
    },
    {
      id: "model-because",
      purpose: "model",
      gate: "none",
      prompt: "Because tells why.",
      fx: {"text":"I ate lunch **because** I was hungry.","effect":"underline"},
      narration: { audio: A("model-because"), script: "Listen. I ate lunch because I was hungry. The word because tells why. Why did I eat lunch? I was hungry. When you hear because, a reason is coming." },
    },
    {
      id: "model-and",
      purpose: "model",
      gate: "none",
      prompt: "And adds more.",
      fx: {"text":"I like apples **and** bananas.","effect":"underline"},
      narration: { audio: A("model-and"), script: "Listen. I like apples and bananas. The word and adds more. First one idea, apples. Then and brings a second idea, bananas. And glues two ideas into one sentence." },
    },
    {
      id: "model-but",
      purpose: "model",
      gate: "none",
      prompt: "But shows a change.",
      fx: {"text":"The sun was out, **but** it was still cold.","effect":"underline"},
      narration: { audio: A("model-but"), script: "Listen. The sun was out, but it was still cold. The word but shows a change. You thought sun means warm. But flips the idea. Something different is coming." },
    },
    {
      id: "model-so",
      purpose: "model",
      gate: "none",
      prompt: "So tells what happened next.",
      fx: {"text":"It was hot, **so** we drank cold water.","effect":"underline"},
      narration: { audio: A("model-so"), script: "Listen. It was hot, so we drank cold water. The word so tells what happened next. The hot day came first. Then so points to what we did about it." },
    },
    {
      id: "guided-complete-coat",
      purpose: "guided",
      gate: "interaction",
      prompt: "I wore my coat ___ it was cold.",
      narration: { audio: A("guided-complete-coat"), script: "This sentence has a hole in it. I wore my coat, mmm, it was cold. Read it on your screen. Think about the job the missing word must do. Then tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "because", label: "because" }, { id: "and", label: "and" }, { id: "but", label: "but" }], correctId: "because", coachWrong: "Read the whole sentence with your word inside. The end of the sentence gives a reason. Which word signals a reason? Try again." },
    },
    {
      id: "guided-complete-rain",
      purpose: "guided",
      gate: "interaction",
      prompt: "I wanted to play outside, ___ it was raining.",
      narration: { audio: A("guided-complete-rain"), script: "Here is another sentence with a hole. I wanted to play outside, mmm, it was raining. Read both ideas and think about how they fit together. Tap the word that fits the hole." },
      interaction: { type: "choose", options: [{ id: "but", label: "but" }, { id: "and", label: "and" }, { id: "because", label: "because" }], correctId: "but", coachWrong: "The first idea is about playing. The second idea flips it, the rain gets in the way. Which word signals a change? Try again." },
    },
    {
      id: "guided-join-hat",
      purpose: "guided",
      gate: "interaction",
      prompt: "I was sad ___ I lost my hat.",
      narration: { audio: A("guided-join-hat"), script: "Now you join two ideas. Idea one, I was sad. Idea two, I lost my hat. Think about how the two ideas fit together. Tap the word that joins them." },
      interaction: { type: "choose", options: [{ id: "because", label: "because" }, { id: "so", label: "so" }, { id: "and", label: "and" }], correctId: "because", coachWrong: "The lost hat tells why the feeling happened. Which joining word signals a why? Try again." },
    },
    {
      id: "guided-join-snow",
      purpose: "guided",
      gate: "interaction",
      prompt: "It snowed, ___ we made a snowman.",
      narration: { audio: A("guided-join-snow"), script: "Two more ideas. Idea one, it snowed. Idea two, we made a snowman. Think about which idea came first and how they fit. Tap the word that joins them." },
      interaction: { type: "choose", options: [{ id: "so", label: "so" }, { id: "but", label: "but" }, { id: "because", label: "because" }], correctId: "so", coachWrong: "The snow came first. Making the snowman is what happened next. Which word points to what happened next? Try again." },
    },
    {
      id: "apply-sort-jobs",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each sentence by its joining word's job.",
      narration: { audio: A("apply-sort-jobs"), script: "Time to sort. Read each sentence and find its joining word. Does that word tell why, add more, or show a change? Drag each sentence to the bucket that names its job." },
      interaction: { type: "sort", buckets: ["Why","More","Change"], items: [{ label: "i hid because i was shy", bucket: "Why" }, { label: "he smiled because he won", bucket: "Why" }, { label: "we ate chips and grapes", bucket: "More" }, { label: "she can hop and skip", bucket: "More" }, { label: "i tried but i missed", bucket: "Change" }, { label: "it is old but it works", bucket: "Change" }], coachWrong: "Find the joining word in that sentence first. Then think about its job in the sentence. Try again." },
    },
    {
      id: "apply-read-aloud",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud: We went to the park and fed the ducks.",
      image: IMG("park-ducks"),
      narration: { audio: A("apply-read-aloud"), script: "This sentence uses a joining word to hold two ideas. The sentence is on your screen. Read it out loud in a big, clear voice." },
      interaction: { type: "speak", text: "We went to the park and fed the ducks" },
    },
    {
      id: "challenge-finish-so",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what comes next: I was sleepy, so...",
      narration: { audio: A("challenge-finish-so"), script: "Last one. Now you build the sentence. I was sleepy, so. What happened next? Think of your own ending. Press the microphone and say it." },
      interaction: { type: "speak", text: "bed sleep slept nap napped rest rested eyes closed yawned pillow blanket" },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can join ideas!",
      fx: {"text":"You can join ideas!","effect":"fireworks"},
      narration: { audio: A("celebrate"), script: "You did it. Because tells why. And adds more. But shows a change. So tells what happened next. Use your joining words every time you talk, read, and write." },
    },
  ],
};
