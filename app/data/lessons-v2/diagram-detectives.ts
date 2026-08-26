import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./diagram-detectives-timings.json";

// Diagram Detectives (RI.K.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=diagram-detectives

const A = (id: string) => `/audio/lessons-v2/diagram-detectives/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/diagram-detectives/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/diagram-detectives/${w.toLowerCase()}.png`;

export const diagramDetectivesImages: Record<string, string | { subject: string; ref?: string }> = {
  "ladybug-spots": "A close-up of one red ladybug resting on a big green leaf, seen from above so its round red back fills the frame, with big round black spots clearly visible on the red shell. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "ladybug-wings": { subject: "The same red ladybug flying up in a clear blue sky, its red spotted shell open wide like two little doors and its thin clear flying wings spread out wide, small motion lines beneath it. No letters, no words, no numbers, no writing anywhere.", ref: "ladybug-spots" },
  "ladybug-eating": { subject: "The same red ladybug standing on a green plant stem, its mouth right next to one single tiny green bug it is about to munch. One green leaf lower on the stem and one small pink flower at the top of the stem. No letters, no words, no numbers, no writing anywhere.", ref: "ladybug-spots" },
  "ladybug-rest": { subject: "The same red ladybug resting very still underneath one big green leaf, wings closed tight, tucked close to the leaf. No letters, no words, no numbers, no writing anywhere.", ref: "ladybug-spots" },
  "garden": "A sunny garden with colorful flowers, green leafy plants, and rich brown soil, with two small red ladybugs with black spots resting on the green leaves. No people. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "scientist": "A friendly woman scientist kneeling down and smiling, holding a magnifying glass up to look closely at one red ladybug sitting on her other hand, soft plain pale background. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "leaf": "One single big green leaf with smooth edges lying flat, plain pale background, nothing else in the picture. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
};

export const diagramDetectives: LessonDef = {
  id: "diagram-detectives",
  title: "Diagram Detectives",
  grade: "Kindergarten",
  standard: "RI.K.7",
  archetype: "inference",
  objective: "I can tell what person, place, or thing a fact book picture shows.",
  concepts: ["Words and pictures connect","Person, place, or thing"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, detective. In a fact book, the words tell a fact, and the picture shows it. Now when you read, you can look at each picture and ask: what person, place, or thing does this picture show?",
    "title": "You're a Diagram Detective!",
    "body": "You connected the words to every picture!"
  },
  scenes: [
    {
      id: "hook-ladybug-book",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Words and pictures work together!",
      fx: {"text":"The **words** tell it. The **picture** shows it.","effect":"bubbles"},
      narration: { audio: A("hook-ladybug-book"), script: "Hello, reading detective. Today we open a fact book about ladybugs. A fact book tells facts that are true. Every page has words and a picture. The words tell a fact, and the picture shows that same fact. Let's read our first clue together." },
      interaction: { type: "read-along", text: "The words tell a fact. The picture shows the fact.", audio: A("hook-ladybug-book-sentence") },
    },
    {
      id: "model-words-show",
      purpose: "model",
      gate: "none",
      prompt: "The words say it. The picture shows it.",
      image: IMG("ladybug-spots"),
      narration: { audio: A("model-words-show"), script: "Here is a page from our ladybug book. The words on this page say: A ladybug has black spots. Now look at the picture. Do you see the black spots? There they are, right on the ladybug's red back. The words told the fact, and the picture shows it. Words and pictures are partners." },
    },
    {
      id: "model-person-place-thing",
      purpose: "model",
      gate: "none",
      prompt: "Person, place, or thing?",
      fx: {"text":"A picture can show a **person**, a **place**, or a **thing**.","effect":"pop-words"},
      narration: { audio: A("model-person-place-thing"), script: "A picture in a fact book can show a person, a place, or a thing from the words. So when you see a picture, be a detective. Ask yourself: what person, place, or thing does this picture show?" },
    },
    {
      id: "guided-find-wings",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does the picture show?",
      image: IMG("ladybug-wings"),
      narration: { audio: A("guided-find-wings"), script: "Time to turn the page. The words say: A ladybug can fly. Now look at the picture. Which part of the ladybug is spread open wide, lifting it into the sky? Tap that word." },
      interaction: { type: "choose", options: [{ id: "wings", label: "WINGS", audio: W("wings") }, { id: "legs", label: "LEGS", audio: W("legs") }, { id: "spots", label: "SPOTS", audio: W("spots") }], correctId: "wings", coachWrong: "Look at the picture again. The ladybug is up in the air. Which part is open wide, holding it up?" },
    },
    {
      id: "guided-find-lunch",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is the ladybug's lunch?",
      image: IMG("ladybug-eating"),
      narration: { audio: A("guided-find-lunch"), script: "New page, detective. The words say: A ladybug is eating its lunch. But the words do not tell us what the lunch is. The picture does. Look closely, right by the ladybug's mouth. What is its lunch? Tap the word." },
      interaction: { type: "choose", options: [{ id: "bug", label: "BUG", audio: W("bug") }, { id: "leaf", label: "LEAF", audio: W("leaf") }, { id: "flower", label: "FLOWER", audio: W("flower") }], correctId: "bug", coachWrong: "Those are in the picture, but look right at the ladybug's mouth. What tiny thing is it about to munch?" },
    },
    {
      id: "apply-find-place",
      purpose: "apply",
      gate: "interaction",
      prompt: "What place does the picture show?",
      image: IMG("garden"),
      narration: { audio: A("apply-find-place"), script: "Turn the page. The words say: Ladybugs live outside. This picture shows the place. Look at what is growing there. What place does the picture show? Tap the word." },
      interaction: { type: "choose", options: [{ id: "garden", label: "GARDEN", audio: W("garden") }, { id: "beach", label: "BEACH", audio: W("beach") }, { id: "farm", label: "FARM", audio: W("farm") }], correctId: "garden", coachWrong: "Look at the picture. Do you see flowers and green plants growing? Think about which place is full of flowers and plants." },
    },
    {
      id: "apply-up-up",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which picture goes with the words?",
      narration: { audio: A("apply-up-up"), script: "Here is a tricky one. Listen to the words from our book: Up, up goes the ladybug. Which picture belongs with those words? Tap it." },
      interaction: { type: "choose", options: [{ id: "fly", label: "FLY", audio: W("fly"), image: IMG("ladybug-wings") }, { id: "rest", label: "REST", audio: W("rest"), image: IMG("ladybug-rest") }], correctId: "fly", coachWrong: "Listen again. Up, up goes the ladybug. Which picture shows the ladybug going up?" },
    },
    {
      id: "apply-say-spots",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what the picture shows.",
      image: IMG("ladybug-spots"),
      narration: { audio: A("apply-say-spots"), script: "Back to our favorite page. The words say: Look at the ladybug's back. Look at the picture. What are the little black shapes on its back called? Tap the mic and say it." },
      interaction: { type: "speak", text: "spots spot dots dot" },
    },
    {
      id: "challenge-sort-pictures",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Person, place, or thing?",
      narration: { audio: A("challenge-sort-pictures"), script: "Last page, detective. Our fact book shows three pictures. Look closely at each one and ask: does this picture show a person, a place, or a thing? Drag each picture to where it belongs." },
      interaction: { type: "sort", buckets: ["Person","Place","Thing"], items: [{ label: "SCIENTIST", bucket: "Person", audio: W("scientist"), image: IMG("scientist") }, { label: "GARDEN", bucket: "Place", audio: W("garden"), image: IMG("garden") }, { label: "LEAF", bucket: "Thing", audio: W("leaf"), image: IMG("leaf") }], coachWrong: "Look closely at the picture. A person is someone. A place is somewhere you can go. A thing is something you can hold or touch." },
    },
    {
      id: "celebrate-detective-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Diagram Detective!",
      fx: {"text":"You are a **Diagram Detective**!","effect":"fireworks"},
      narration: { audio: A("celebrate-detective-success"), script: "You did it, detective. You connected the words to every picture. The words tell a fact, and the picture shows it. It can show a person, a place, or a thing. Keep looking closely at pictures every time you read." },
    },
  ],
};
