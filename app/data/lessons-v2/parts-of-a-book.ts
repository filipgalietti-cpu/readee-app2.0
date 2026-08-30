import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./parts-of-a-book-timings.json";

// Parts of a Book (RI.K.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=parts-of-a-book

const A = (id: string) => `/audio/lessons-v2/parts-of-a-book/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/parts-of-a-book/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/parts-of-a-book/${w.toLowerCase()}.png`;

export const partsOfABookImages: Record<string, string | { subject: string; ref?: string }> = {
  "fish-front": "The front cover of a closed picture book, seen straight on so the cover fills the frame. The cover is bright blue with a large framed picture in the middle: a cheerful orange fish swimming in clear blue water with small bubbles. A wide plain blue border surrounds the framed picture. No letters, no words, no numbers, no writing anywhere on the cover. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "fish-back": "The plain back cover of a closed bright blue hardcover picture book, seen straight on so the cover fills the frame. The back cover is one flat solid blue color and mostly empty, with one small plain white square near the bottom corner. The square is blank. No letters, no words, no numbers, no lines, no pictures anywhere else on the cover. The background behind the book is one perfectly flat solid pale blue color with no shadows, no smudges, no gradients, and no marks anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "title-page": { subject: "The same bright blue picture book lying open to its very first page. The open page is mostly white and empty, with one small simple drawing of the cheerful orange fish in the center and lots of clean white space all around it. No letters, no words, no numbers, no writing anywhere.", ref: "fish-front" },
  "story-page": { subject: "The same bright blue picture book lying open in the middle, both open pages filled edge to edge with big colorful pictures of orange fish swimming among green seaweed and rising bubbles in blue water. No letters, no words, no numbers, no writing anywhere.", ref: "fish-front" },
};

export const partsOfABook: LessonDef = {
  id: "parts-of-a-book",
  title: "Parts of a Book",
  grade: "Kindergarten",
  standard: "RI.K.5",
  archetype: "print-concepts",
  objective: "I can find the front cover, back cover, and title page of a book.",
  concepts: ["front cover","back cover","title page"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You found every part of the book. The front cover is the book's face. The back cover is the very end. And the title page inside tells the book's name and its author. You are a book expert!",
    "title": "Book Expert!",
    "body": "You found the front cover, back cover, and title page!"
  },
  scenes: [
    {
      id: "hook-book-parts",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Every book has parts!",
      fx: {"text":"Every **book** has special **parts**!","effect":"pop-words"},
      narration: { audio: A("hook-book-parts"), script: "Hello, readers. Today we get a brand new fact book. Before we read one single page, let's learn the parts of a book. Every book has a front cover, a back cover, and a title page. Each part tells you something special. Let's explore our book." },
      interaction: { type: "read-along", text: "A book has a front cover, a back cover, and a title page.", audio: A("hook-book-parts-sentence") },
    },
    {
      id: "model-front-cover",
      purpose: "model",
      gate: "none",
      prompt: "This is the **front cover**.",
      image: IMG("fish-front"),
      narration: { audio: A("model-front-cover"), script: "Here is our book. This side is the front cover. The front cover is the book's face. It is the first part you see. The front cover shows a big picture of what the book is about. Look at the big picture. A fish! So this book is about fish. The front cover also tells the book's name." },
    },
    {
      id: "model-back-cover",
      purpose: "model",
      gate: "none",
      prompt: "This is the **back cover**.",
      image: IMG("fish-back"),
      narration: { audio: A("model-back-cover"), script: "Now flip the book over. This plain side is the back cover. The back cover is the very end of the book. When you finish reading the last page, you close the book, and there is the back cover. See how plain it is? Just a little square near the bottom. The back cover tells you the book is done." },
    },
    {
      id: "model-title-page",
      purpose: "model",
      gate: "none",
      prompt: "This is the **title page**.",
      image: IMG("title-page"),
      narration: { audio: A("model-title-page"), script: "Now open the book. The very first page inside is the title page. The title page is a quiet page with a small picture and lots of empty space. It tells the book's name one more time. And it tells one more special thing. It tells who made the book. Remember book makers? The author writes the words. The title page tells the author's name." },
    },
    {
      id: "guided-tap-front",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the **front cover**.",
      narration: { audio: A("guided-tap-front"), script: "Your turn. Look at the two sides of our book. Tap the front cover." },
      interaction: { type: "choose", options: [{ id: "front", label: "FRONT", audio: W("front"), image: IMG("fish-front") }, { id: "back", label: "BACK", audio: W("back"), image: IMG("fish-back") }], correctId: "front", coachWrong: "Look again. The front cover is the book's face. It shows the big picture." },
    },
    {
      id: "guided-say-cover",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is this book about?",
      image: IMG("fish-front"),
      narration: { audio: A("guided-say-cover"), script: "Great tapping. Now look at the front cover's big picture. The big picture shows what the book is about. What is this book about? Tap the mic and say your answer." },
      interaction: { type: "speak", text: "fish fishes" },
    },
    {
      id: "guided-tap-title",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the **title page**.",
      narration: { audio: A("guided-tap-title"), script: "Now we open our book and look inside. Find the page that tells the book's name and its author. Tap the title page." },
      interaction: { type: "choose", options: [{ id: "title", label: "TITLE", audio: W("title"), image: IMG("title-page") }, { id: "story", label: "STORY", audio: W("story"), image: IMG("story-page") }, { id: "back", label: "BACK", audio: W("back"), image: IMG("fish-back") }], correctId: "title", coachWrong: "Not that one. The title page is quiet, with a small picture and lots of empty space." },
    },
    {
      id: "apply-sort-parts",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Where does each one go?",
      narration: { audio: A("apply-sort-parts"), script: "Look at these three book things. A big picture, a little square, and a title page. Where does each one live on our book? Drag each picture to Front, Back, or Inside." },
      interaction: { type: "sort", buckets: ["Front","Back","Inside"], items: [{ label: "PICTURE", bucket: "Front", audio: W("picture"), image: IMG("fish-front") }, { label: "SQUARE", bucket: "Back", audio: W("square"), image: IMG("fish-back") }, { label: "TITLE", bucket: "Inside", audio: W("title"), image: IMG("title-page") }], coachWrong: "Look closely at each picture. Think about where you find it when you hold a real book." },
    },
    {
      id: "apply-where-start",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where do you **start**?",
      narration: { audio: A("apply-where-start"), script: "Here is a brand new book. Where do you start reading? Tap the part where you begin." },
      interaction: { type: "choose", options: [{ id: "front", label: "FRONT", audio: W("front"), image: IMG("fish-front") }, { id: "back", label: "BACK", audio: W("back"), image: IMG("fish-back") }], correctId: "front", coachWrong: "Think about opening a brand new book. You begin at the book's face." },
    },
    {
      id: "apply-who-made",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which page tells who made it?",
      narration: { audio: A("apply-who-made"), script: "You want to know who made our fish book. Which page tells you the author's name? Tap that page." },
      interaction: { type: "choose", options: [{ id: "title", label: "TITLE", audio: W("title"), image: IMG("title-page") }, { id: "story", label: "STORY", audio: W("story"), image: IMG("story-page") }], correctId: "title", coachWrong: "Look for the quiet page with lots of empty space. That kind of page names the author." },
    },
    {
      id: "challenge-order-parts",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Put the parts in **order**.",
      narration: { audio: A("challenge-order-parts"), script: "Last one, book expert. Show the order of a real book all by yourself. Drag the parts in order, from the very first thing you see to the very last." },
      interaction: { type: "sequence", items: [{ id: "front-seq", label: "FRONT", audio: W("front"), image: IMG("fish-front") }, { id: "title-seq", label: "TITLE", audio: W("title"), image: IMG("title-page") }, { id: "back-seq", label: "BACK", audio: W("back"), image: IMG("fish-back") }], order: ["front-seq","title-seq","back-seq"], coachWrong: "Think about how you read a real book, from when you pick it up to when you close it." },
    },
    {
      id: "celebrate-book-expert",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You know your book parts!",
      fx: {"text":"You are a **book expert**!","effect":"fireworks"},
      narration: { audio: A("celebrate-book-expert"), script: "You did it! You found every part of the book. The front cover is the book's face. The back cover is the very end. And the title page inside tells the book's name and its author. You are a book expert!" },
    },
  ],
};
