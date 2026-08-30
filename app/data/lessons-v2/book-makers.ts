import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./book-makers-timings.json";

// Who Made This Book? (RL.K.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=book-makers

const A = (id: string) => `/audio/lessons-v2/book-makers/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/book-makers/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/book-makers/${w.toLowerCase()}.png`;

export const bookMakersImages: Record<string, string> = {
  "book": "A bright red storybook, open to a blank page, on a cozy rug.",
  "author": "A friendly cartoon person with a thoughtful expression, holding a pen over a notebook.",
  "illustrator": "A friendly cartoon person with a paint-splattered apron, holding a paintbrush to an easel with a colorful painting.",
  "words": "A page from an open book, filled with simple, squiggly lines representing text.",
  "pictures": "A page from an open book, featuring a simple, colorful drawing of a smiling sun and a fluffy cloud.",
  "pen": "A vibrant blue ink pen, ready to write.",
  "art": "A miniature wooden easel with a small, colorful abstract painting on it.",
  "draw": "A cartoon hand holding a red crayon, drawing a simple house outline on paper.",
  "write": "A cartoon hand holding a yellow pencil, carefully writing the letter 'A' on lined paper."
};

export const bookMakers: LessonDef = {
  id: "book-makers",
  title: "Who Made This Book?",
  grade: "Kindergarten",
  standard: "RL.K.6",
  archetype: "story-elements",
  objective: "You will learn who makes the words and pictures in a book!",
  concepts: ["author writes","illustrator draws","parts of a book"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did a fantastic job today! You learned that the author writes all the words in a book. And the illustrator draws all the beautiful pictures. Now you know who makes every part of a wonderful story!",
    "title": "You're a Book Expert!",
    "body": "You know who makes the words AND the pictures in a book!"
  },
  scenes: [
    {
      id: "hook-bookie-intro",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Bookie, the bookworm!",
      image: IMG("book"),
      fx: {"text":"**Bookie**, the **bookworm**!","effect":"pop-words"},
      narration: { audio: A("hook-bookie-intro"), script: "Hi friends! I'm Bookie, and I love books! I have a new book here, and I'm so curious. Who made all the wonderful things inside it? Listen closely to find out!" },
    },
    {
      id: "model-author-writes",
      purpose: "model",
      gate: "none",
      prompt: "The **author** writes the words.",
      image: IMG("author"),
      fx: {"text":"The **author** writes the **words**.","effect":"underline"},
      narration: { audio: A("model-author-writes"), script: "Watch me! This is an author. An author is a special person who writes all the words you see in a book. They use their ideas to tell a story with words." },
    },
    {
      id: "model-illustrator-draws",
      purpose: "model",
      gate: "none",
      prompt: "The **illustrator** draws the pictures.",
      image: IMG("illustrator"),
      fx: {"text":"The **illustrator** draws the **pictures**.","effect":"underline"},
      narration: { audio: A("model-illustrator-draws"), script: "Now look at this! This is an illustrator. An illustrator is a special person who draws all the beautiful pictures in a book. They bring the story to life with their art!" },
    },
    {
      id: "guided-who-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who made these **words**?",
      image: IMG("words"),
      narration: { audio: A("guided-who-words"), script: "It's your turn to help Bookie! Look at these words. Who do you think made them? Tap on the right person!" },
      interaction: { type: "choose", options: [{ id: "author", label: "AUTHOR", audio: W("author"), image: IMG("author") }, { id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator"), image: IMG("illustrator") }], correctId: "author", coachWrong: "Oops! An illustrator draws pictures. Who writes the words?" },
    },
    {
      id: "guided-who-pictures",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who made these **pictures**?",
      image: IMG("pictures"),
      narration: { audio: A("guided-who-pictures"), script: "Great job! Now look at these colorful pictures. Who made these? Tap on the person who draws the pictures!" },
      interaction: { type: "choose", options: [{ id: "author", label: "AUTHOR", audio: W("author"), image: IMG("author") }, { id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator"), image: IMG("illustrator") }], correctId: "illustrator", coachWrong: "Not quite! An author writes words. Who draws the pictures?" },
    },
    {
      id: "apply-sort-tools",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the tools!",
      narration: { audio: A("apply-sort-tools"), script: "Bookie found some tools! Can you help him sort them? Drag each tool to the person who uses it!" },
      interaction: { type: "sort", buckets: ["author","illustrator"], items: [{ label: "PEN", bucket: "author", audio: W("pen") }, { label: "ART", bucket: "illustrator", audio: W("art") }], coachWrong: "Think about what each person does. Does a pen help draw or write? Does art belong to words or pictures?" },
    },
    {
      id: "apply-sort-actions",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the actions!",
      narration: { audio: A("apply-sort-actions"), script: "You're doing wonderfully! Now let's sort some actions. Does an author or an illustrator do this? Drag each action to the correct person!" },
      interaction: { type: "sort", buckets: ["author","illustrator"], items: [{ label: "WRITE", bucket: "author", audio: W("write") }, { label: "DRAW", bucket: "illustrator", audio: W("draw") }], coachWrong: "Remember, one person writes the words. The other person draws the pictures. Which one does which?" },
    },
    {
      id: "challenge-text-in-book",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Who made the text?",
      image: IMG("words"),
      narration: { audio: A("challenge-text-in-book"), script: "You're becoming a book expert! Bookie found a book with words inside. Who is the person responsible for those words? Make your best guess!" },
      interaction: { type: "choose", options: [{ id: "author", label: "AUTHOR", audio: W("author"), image: IMG("author") }, { id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator"), image: IMG("illustrator") }], correctId: "author", coachWrong: "Think about who puts the words on the page. You know this!" },
    },
    {
      id: "challenge-images-in-book",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Who made the images?",
      image: IMG("pictures"),
      narration: { audio: A("challenge-images-in-book"), script: "Almost done! Here is the same book, but now we are looking at the pictures. Who is the person who created these pretty images? You've got this!" },
      interaction: { type: "choose", options: [{ id: "author", label: "AUTHOR", audio: W("author"), image: IMG("author") }, { id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator"), image: IMG("illustrator") }], correctId: "illustrator", coachWrong: "Who draws the pictures to make the book beautiful? You're so close!" },
    },
    {
      id: "celebrate-bookie-thanks",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a book expert!",
      image: IMG("book"),
      fx: {"text":"The **author** writes the **words**, and the **illustrator** draws the **pictures**!","effect":"rainbow"},
      narration: { audio: A("celebrate-bookie-thanks"), script: "Wow, you helped Bookie so much today! You learned that the author writes the words in a book, and the illustrator draws the pictures. Now you know who makes every part of a wonderful story!" },
    },
  ],
};
