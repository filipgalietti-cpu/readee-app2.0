import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./book-basics-timings.json";

// How Books Work (RF.K.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=book-basics

const A = (id: string) => `/audio/lessons-v2/book-basics/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/book-basics/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/book-basics/${w.toLowerCase()}.png`;

export const bookBasicsImages: Record<string, string> = {
  "wormy": "A friendly green cartoon bookworm with glasses, smiling.",
  "book": "A brightly colored open children's storybook.",
  "book-with-spaces": "An open storybook page with clear, visible empty gaps between words.",
  "left": "A cartoon hand pointing to the left side of a page.",
  "right": "A cartoon hand pointing to the right side of a page.",
  "top": "A cartoon hand pointing to the top of a page.",
  "bottom": "A cartoon hand pointing to the bottom of a page.",
  "i": "A capital letter 'I' with a small, happy face.",
  "see": "A cartoon eye looking forward.",
  "a": "A lowercase letter 'a' with a small, friendly face.",
  "cat": "A cute orange tabby cat, sitting.",
  "dog": "A playful brown dog, wagging its tail.",
  "space": "An empty rectangular box, representing a blank space.",
  "the": "A capital letter 'T' with a small, curious face.",
  "fox": "A mischievous red fox, peeking.",
  "ran": "A pair of cartoon running legs.",
  "start": "A cartoon finger pointing to the top-left corner of an open book page.",
  "next": "A bright blue arrow pointing horizontally to the right.",
  "then": "A bright green arrow pointing vertically downwards.",
  "end": "A cartoon finger pointing to the bottom-right corner of an open book page.",
  "champion": "A golden trophy with a star on top, sparkling."
};

export const bookBasics: LessonDef = {
  id: "book-basics",
  title: "How Books Work",
  grade: "Kindergarten",
  standard: "RF.K.1",
  archetype: "print-concepts",
  objective: "I can find words in a book by reading left to right and top to bottom.",
  concepts: ["how we read a book: we read the words from left to right and top to bottom, and there are spaces between words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super reader! You learned that we read words from left to right and top to bottom. You also found all the important spaces between words. Keep practicing, and you'll be a book expert!",
    "title": "You're a Reading Star!",
    "body": "Great job learning how books work!"
  },
  scenes: [
    {
      id: "hook-wormys-story",
      purpose: "hook",
      gate: "interaction",
      prompt: "Listen to Wormy's story!",
      image: IMG("wormy"),
      narration: { audio: A("hook-wormys-story"), script: "Hello there, friend! I'm Wormy, and I love reading books! But sometimes, books can be a little tricky. Let's listen to my story about finding words." },
      interaction: { type: "read-along", text: "Wormy loves books. He sees words on the page. Where do they start? Where do they go?", audio: A("hook-wormys-story-sentence") },
    },
    {
      id: "model-read-direction",
      purpose: "model",
      gate: "interaction",
      prompt: "Watch Wormy read!",
      image: IMG("book"),
      narration: { audio: A("model-read-direction"), script: "Wormy is going to show us how he reads. Watch his eyes carefully! He starts on this side, moves across, and then down to the next line." },
      interaction: { type: "read-along", text: "I see a big red apple.", audio: A("model-read-direction-sentence") },
    },
    {
      id: "model-spaces",
      purpose: "model",
      gate: "none",
      prompt: "Wormy sees spaces!",
      image: IMG("book-with-spaces"),
      fx: {"text":"That's because there are **spaces** between words!","effect":"pop-words"},
      narration: { audio: A("model-spaces"), script: "Did you see how Wormy took a tiny pause between words? That's because there are spaces between words! Spaces help us know where one word ends and another begins." },
    },
    {
      id: "guided-start-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap where Wormy starts!",
      narration: { audio: A("guided-start-point"), script: "Now it's your turn to help Wormy! Where does Wormy always start reading on a page? Tap the spot where he begins." },
      interaction: { type: "choose", options: [{ id: "right", label: "RIGHT", audio: W("right"), image: IMG("right") }, { id: "left", label: "LEFT", audio: W("left"), image: IMG("left") }, { id: "bottom", label: "BOTTOM", audio: W("bottom"), image: IMG("bottom") }], correctId: "left", coachWrong: "Almost! Books start on the left side, then move across. Try again!" },
    },
    {
      id: "guided-sequence-left-right",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag words to read!",
      narration: { audio: A("guided-sequence-left-right"), script: "Great job! Now, let's practice reading across. Drag the words into the correct order, from left to right, just like Wormy showed us." },
      interaction: { type: "sequence", items: [{ id: "I", label: "I", audio: W("I"), image: IMG("i") }, { id: "see", label: "SEE", audio: W("see"), image: IMG("see") }, { id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }], order: ["I","see","cat"], coachWrong: "Remember, we read from left to right. Try again!" },
    },
    {
      id: "guided-find-space",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the space!",
      narration: { audio: A("guided-find-space"), script: "You're doing super! Remember how Wormy told us about spaces? Spaces help us see different words. Tap the empty space between the words." },
      interaction: { type: "choose", options: [{ id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }, { id: "space", label: "SPACE", audio: W("space"), image: IMG("space") }, { id: "dog", label: "DOG", audio: W("dog"), image: IMG("dog") }], correctId: "space", coachWrong: "That's a word! Look for the empty spot where words take a breath." },
    },
    {
      id: "apply-direction-spaces",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put words in order!",
      narration: { audio: A("apply-direction-spaces"), script: "You're getting so good! Now, let's put it all together. Arrange these words correctly, remembering to read left to right, and notice the spaces." },
      interaction: { type: "sequence", items: [{ id: "The", label: "THE", audio: W("The"), image: IMG("the") }, { id: "ran", label: "RAN", audio: W("ran"), image: IMG("ran") }, { id: "fox", label: "FOX", audio: W("fox"), image: IMG("fox") }], order: ["The","fox","ran"], coachWrong: "Remember, we read from left to right! And each word needs its own spot." },
    },
    {
      id: "challenge-book-path",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Find the book's path!",
      narration: { audio: A("challenge-book-path"), script: "Wow, you are a reading superstar! Wormy has one more tricky puzzle for you. Put these special words in the order you would read them in a book. Think about left, right, top, and bottom!" },
      interaction: { type: "sequence", items: [{ id: "start", label: "START", audio: W("start"), image: IMG("start") }, { id: "end", label: "END", audio: W("end"), image: IMG("end") }, { id: "next", label: "NEXT", audio: W("next"), image: IMG("next") }, { id: "then", label: "THEN", audio: W("then"), image: IMG("then") }], order: ["start","next","then","end"], coachWrong: "Hmm, where do we always begin reading? And what comes after that? Keep trying!" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      gate: "none",
      prompt: "You did it!",
      image: IMG("champion"),
      fx: {"text":"You are a **reading champion**!","effect":"rainbow"},
      narration: { audio: A("celebrate-success"), script: "You did an amazing job helping Wormy! Now you know how to read a book, starting at the left, moving right, and then down. You also found all the secret spaces between words! You are a reading champion!" },
    },
  ],
};
