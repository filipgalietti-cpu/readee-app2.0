import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-kinds-timings.json";

// Kinds of Books (RL.K.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=story-kinds

const A = (id: string) => `/audio/lessons-v2/story-kinds/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/story-kinds/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-kinds/${w.toLowerCase()}.png`;

export const storyKindsImages: Record<string, string> = {
  "book": "a chunky, open book with colorful pages",
  "story": "a book with a magical creature on the cover, sparkling",
  "fact": "a book with a picture of a real animal on the cover, like a lion",
  "talking cat": "a fluffy orange cat with a speech bubble coming from its mouth, smiling",
  "fast train": "a sleek, modern train speeding down tracks with motion lines",
  "dragon": "a friendly green dragon with large wings, breathing a puff of smoke",
  "bird": "a small, blue bird perched on a branch, chirping",
  "mouse house": "a tiny house made of cheese with a small mouse peeking out of a window",
  "robot": "a friendly, metallic robot with big, round eyes and waving arm",
  "tree": "a tall, green oak tree with strong roots visible above ground",
  "witch": "a smiling witch with a pointed hat, a broomstick, and a bubbling cauldron",
  "talking frog": "a cartoon frog with a tiny crown, a speech bubble near its mouth",
  "fairy": "a tiny, sparkling fairy with delicate wings and a wand",
  "bear": "a fluffy brown bear standing on its hind legs, waving",
  "car": "a bright red, shiny car driving on a road"
};

export const storyKinds: LessonDef = {
  id: "story-kinds",
  title: "Kinds of Books",
  grade: "Kindergarten",
  standard: "RL.K.5",
  archetype: "story-elements",
  objective: "I can tell if a book is make-believe or real.",
  concepts: ["Storybooks","Fact books","Make-believe","Real"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did such a wonderful job today! You learned all about storybooks and fact books. Now you know which books tell make-believe stories and which tell about real things!",
    "title": "Book Expert!",
    "body": "You're a true bookworm, just like Pip!"
  },
  scenes: [
    {
      id: "hook-intro",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to Pip the bookworm!",
      fx: {"text":"Some books tell fun **stories**. Some books tell about **real** things!","effect":"pop-words"},
      narration: { audio: A("hook-intro"), script: "Hi, I'm Pip! I love to read all kinds of books. Some books tell fun stories. Some books tell about real things! Let's find out more about books!" },
    },
    {
      id: "model-storybook",
      purpose: "model",
      gate: "none",
      prompt: "This book is make-believe.",
      fx: {"text":"This is a **story** book!","effect":"underline"},
      narration: { audio: A("model-storybook"), script: "Look at this book! It tells a story about a flying pig. Is a pig really flying? No, this is make-believe! It's a story book." },
      interaction: { type: "read-along", text: "A pig flew high. It waved bye-bye!", audio: A("model-storybook-sentence") },
    },
    {
      id: "model-factbook",
      purpose: "model",
      gate: "none",
      prompt: "This book tells real facts.",
      fx: {"text":"This is a **fact** book!","effect":"underline"},
      narration: { audio: A("model-factbook"), script: "Now look at this book! It tells about real pigs. Pigs really live on farms. This book tells about real things! It's a fact book." },
      interaction: { type: "read-along", text: "Pigs live on farms. They roll in mud.", audio: A("model-factbook-sentence") },
    },
    {
      id: "guided-choose-cat",
      purpose: "guided",
      gate: "interaction",
      prompt: "Is this a story or fact?",
      image: IMG("talking cat"),
      narration: { audio: A("guided-choose-cat"), script: "Pip found a book about a talking cat! Can cats really talk? You choose, is it a story or a fact?" },
      interaction: { type: "choose", options: [{ id: "story", label: "STORY", audio: W("story"), image: IMG("story") }, { id: "fact", label: "FACT", audio: W("fact"), image: IMG("fact") }], correctId: "story", coachWrong: "Cats do not really talk. That is make-believe! Try again." },
    },
    {
      id: "guided-choose-train",
      purpose: "guided",
      gate: "interaction",
      prompt: "Is this a story or fact?",
      image: IMG("fast train"),
      narration: { audio: A("guided-choose-train"), script: "Here is a book about a big, fast train. Trains are real! Do they go fast? Is this a story or a fact?" },
      interaction: { type: "choose", options: [{ id: "story", label: "STORY", audio: W("story"), image: IMG("story") }, { id: "fact", label: "FACT", audio: W("fact"), image: IMG("fact") }], correctId: "fact", coachWrong: "Trains are real! They go fast. That is true! Try again." },
    },
    {
      id: "guided-sort-dragon-bird",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort to story or fact.",
      narration: { audio: A("guided-sort-dragon-bird"), script: "Great job! Now, let's sort some ideas. Drag each picture to the right box. Does it belong in a storybook or a fact book?" },
      interaction: { type: "sort", buckets: ["story","fact"], items: [{ label: "DRAGON", bucket: "story", audio: W("dragon") }, { label: "BIRD", bucket: "fact", audio: W("bird") }], coachWrong: "Think, is a dragon real? Is a bird real? Try again." },
    },
    {
      id: "apply-choose-mouse",
      purpose: "apply",
      gate: "interaction",
      prompt: "Real or make-believe?",
      image: IMG("mouse house"),
      narration: { audio: A("apply-choose-mouse"), script: "You're doing so well! Pip has another book for us. It's about a little mouse who built a house. Is this real or make-believe?" },
      interaction: { type: "choose", options: [{ id: "real", label: "REAL", audio: W("real") }, { id: "make", label: "MAKE", audio: W("make") }], correctId: "make", coachWrong: "Think about what mice can really do. Try again!" },
    },
    {
      id: "apply-sort-robot-tree-witch",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Story or fact book?",
      narration: { audio: A("apply-sort-robot-tree-witch"), script: "Let's sort more! Where would you put these pictures? Put them in the story or fact box." },
      interaction: { type: "sort", buckets: ["story","fact"], items: [{ label: "ROBOT", bucket: "story", audio: W("robot") }, { label: "TREE", bucket: "fact", audio: W("tree") }, { label: "WITCH", bucket: "story", audio: W("witch") }], coachWrong: "Is a robot real? Is a tree real? Is a witch real? Try again." },
    },
    {
      id: "challenge-choose-frog",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which book for this?",
      image: IMG("talking frog"),
      narration: { audio: A("challenge-choose-frog"), script: "You are a book expert! Pip found a picture of a talking frog. What kind of book would this belong in?" },
      interaction: { type: "choose", options: [{ id: "story", label: "STORY", audio: W("story"), image: IMG("story") }, { id: "fact", label: "FACT", audio: W("fact"), image: IMG("fact") }], correctId: "story", coachWrong: "Think carefully. Can frogs really talk?" },
    },
    {
      id: "challenge-sort-fairy-bear-car",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the pictures.",
      narration: { audio: A("challenge-sort-fairy-bear-car"), script: "You're almost done! Pip has one last challenge for you. Sort these pictures into the right book type." },
      interaction: { type: "sort", buckets: ["story","fact"], items: [{ label: "FAIRY", bucket: "story", audio: W("fairy") }, { label: "BEAR", bucket: "fact", audio: W("bear") }, { label: "CAR", bucket: "fact", audio: W("car") }], coachWrong: "Think about what is real and what is make-believe." },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a book expert!",
      fx: {"text":"You are a SUPER book helper!","effect":"burst"},
      narration: { audio: A("celebrate-success"), script: "Fantastic! You learned so much about books today. You know that storybooks tell make-believe things. And fact books tell about real things! You are a super book helper!" },
    },
  ],
};
