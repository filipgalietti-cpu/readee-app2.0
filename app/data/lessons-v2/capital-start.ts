import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./capital-start-timings.json";

// Capital Start, Power Stop (K.L.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=capital-start

const A = (id: string) => `/audio/lessons-v2/capital-start/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/capital-start/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/capital-start/${w.toLowerCase()}.png`;

export const capitalStartImages: Record<string, string> = {
  "milo": "A small friendly cartoon mouse wearing a yellow tool belt, holding a shiny red wrench, smiling proudly",
  "play": "Two happy children playing with a colorful beach ball on green grass",
  "park": "A sunny park with a red slide, a swing set, and one big green tree",
  "dog": "A fluffy brown puppy hopping happily with its floppy ears in the air",
  "hat": "A bright red baseball cap sitting on a wooden table",
  "fish": "An orange fish swimming happily in clear blue water with little bubbles",
  "pond": "A calm blue pond with lily pads and cattails under a sunny sky"
};

export const capitalStart: LessonDef = {
  id: "capital-start",
  title: "Capital Start, Power Stop",
  grade: "Kindergarten",
  standard: "K.L.2",
  archetype: "print-concepts",
  objective: "I can make sentences start big and stop strong!",
  concepts: ["sentences start with a capital letter","the word I is always a capital","sentences end with a period or a question mark","fix sentences that are missing them"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super Sentence Squad member! You helped so many sentences start big and stop strong. Remember, sentences begin with a capital letter and end with a period or a question mark. Keep looking for those important clues!",
    "title": "Sentence Squad Star!",
    "body": "You made sentences perfect!"
  },
  scenes: [
    {
      id: "hook-sentence-squad",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Milo the Sentence Fixer!",
      image: IMG("milo"),
      narration: { audio: A("hook-sentence-squad"), script: "Hello, Sentence Squad! This is Milo the mouse. Milo fixes broken sentences. Every sentence starts with a capital letter and ends with a stop mark. Today, you get to be a sentence fixer too!" },
    },
    {
      id: "model-capital-start",
      purpose: "model",
      gate: "none",
      prompt: "Sentences start with a capital letter.",
      fx: {"text":"**We** can run.","effect":"underline"},
      narration: { audio: A("model-capital-start"), script: "Every sentence starts with a capital letter. A capital letter is big and tall. Listen: We can run. See the word We? It starts with a big tall W. That is a capital start!" },
    },
    {
      id: "guided-fix-start",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that needs a capital.",
      image: IMG("play"),
      narration: { audio: A("guided-fix-start"), script: "Milo found a broken sentence! It tells about friends who like to play. Uh oh, the first word forgot its capital letter. Tap the word that needs to be big and tall." },
      interaction: { type: "highlight", text: "we like to play.", targets: ["we"], coachWrong: "A capital letter goes at the start. Which word is at the very start of the sentence?" },
    },
    {
      id: "model-capital-i",
      purpose: "model",
      gate: "none",
      prompt: "The word I is always a capital.",
      fx: {"text":"Mom and **I** hop.","effect":"glow"},
      narration: { audio: A("model-capital-i"), script: "Here is a special word. The word I talks about you! I is always a capital letter, every single time. Listen: Mom and I hop. See how I stands big and tall, even in the middle of the sentence!" },
    },
    {
      id: "apply-fix-i",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that should be a capital.",
      image: IMG("park"),
      narration: { audio: A("apply-fix-i"), script: "This sentence tells about going to the park with Mom. One tiny word forgot to stand tall! Find that tiny word and tap it." },
      interaction: { type: "highlight", text: "Mom and i go to the park.", targets: ["i"], coachWrong: "Find the little word that talks about yourself. That word should always be big!" },
    },
    {
      id: "model-telling-stop",
      purpose: "model",
      gate: "none",
      prompt: "A telling sentence ends with a period.",
      fx: {"text":"Tell it. Stop with a **dot**.","effect":"stamp"},
      narration: { audio: A("model-telling-stop"), script: "Some sentences tell you something. Listen: We like cake. That sentence tells, so it ends with a tiny dot called a period. The period says, this sentence is done!" },
    },
    {
      id: "model-asking-stop",
      purpose: "model",
      gate: "none",
      prompt: "An asking sentence ends with a question mark.",
      fx: {"text":"Ask it. Stop with a **question mark**.","effect":"bounce"},
      narration: { audio: A("model-asking-stop"), script: "Some sentences ask you something. Listen: Do you like cake? Hear how my voice goes up at the end? An asking sentence ends with a curvy mark called a question mark." },
    },
    {
      id: "guided-choose-stop",
      purpose: "guided",
      gate: "interaction",
      prompt: "The dog can hop",
      image: IMG("dog"),
      narration: { audio: A("guided-choose-stop"), script: "Milo's next sentence lost its stop mark! Listen: The dog can hop. Does that sentence tell you something, or ask you something? Tap the mark that fits at the end." },
      interaction: { type: "choose", options: [{ id: "period", label: ".", audio: W("period") }, { id: "question", label: "?", audio: W("question-mark") }], correctId: "period", coachWrong: "Listen one more time. Is the sentence telling you something, or asking you a question?" },
    },
    {
      id: "apply-choose-stop",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where is my hat",
      image: IMG("hat"),
      narration: { audio: A("apply-choose-stop"), script: "Try this one! Listen: Where is my hat? My voice went up, like it wants an answer. Is that telling or asking? Tap the mark that fits." },
      interaction: { type: "choose", options: [{ id: "period", label: ".", audio: W("period") }, { id: "question", label: "?", audio: W("question-mark") }], correctId: "question", coachWrong: "Listen to the end of the sentence. Does your voice go up like a question, or stop flat?" },
    },
    {
      id: "challenge-fix-capitals",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap every word that needs a capital.",
      image: IMG("fish"),
      narration: { audio: A("challenge-fix-capitals"), script: "Last fix, all by yourself! This sentence is about swimming. Two words forgot their capitals. Find both and tap them!" },
      interaction: { type: "highlight", text: "the fish and i can swim.", targets: ["the", "i"], coachWrong: "Remember both rules. Where does a sentence start? And which special word is always big?" },
    },
    {
      id: "challenge-choose-stop",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Can we go to the pond",
      image: IMG("pond"),
      narration: { audio: A("challenge-choose-stop"), script: "One more, sentence fixer! Listen: Can we go to the pond? Which stop mark does this sentence need? Tap it!" },
      interaction: { type: "choose", options: [{ id: "period", label: ".", audio: W("period") }, { id: "question", label: "?", audio: W("question-mark") }], correctId: "question", coachWrong: "Listen again. Does the sentence want an answer from you, or is it just telling?" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You made sentences perfect!",
      fx: {"text":"Hooray!","effect":"fireworks"},
      narration: { audio: A("celebrate-success"), script: "You did it, Sentence Squad! You gave sentences a capital start and a power stop. Milo is so proud of you!" },
    },
  ],
};
