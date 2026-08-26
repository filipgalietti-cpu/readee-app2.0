import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./two-kinds-of-books-timings.json";

// Two Kinds of Books (RL.1.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=two-kinds-of-books

const A = (id: string) => `/audio/lessons-v2/two-kinds-of-books/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/two-kinds-of-books/${w.toLowerCase()}.png`;

export const twoKindsOfBooksImages: Record<string, string> = {
  "story-book": "An open picture book with a friendly cartoon knight waving at a smiling green dragon on its pages, bright 2D cartoon illustration with bold clean outlines, no letters and no words anywhere in the picture.",
  "information-book": "An open book showing a large realistic picture of planet Earth from space on its left page and a realistic gray whale swimming on its right page, calm nonfiction illustration style, no letters and no words anywhere in the picture.",
  "frog-hat": "A cartoon frog standing upright like a person, wearing a big red hat and holding one shiny gold coin in its hand, smiling, bright 2D cartoon illustration with bold clean outlines, no text anywhere.",
  "frog-pond": "A realistic green frog sitting on a rock at the edge of a calm pond, its long tongue reaching out toward a small fly, reeds and lily pads in the water, friendly nonfiction illustration, no faces drawn on objects, no text anywhere."
};

export const twoKindsOfBooks: LessonDef = {
  id: "two-kinds-of-books",
  title: "Two Kinds of Books",
  grade: "1st Grade",
  standard: "RL.1.5",
  archetype: "story-elements",
  objective: "I can explain how books that tell stories and books that give information are different.",
  concepts: ["story books have characters and made-up events","information books give true facts","you read them for different reasons"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Amazing work today! You read a story page and a fact page, and you explained how you knew which was which. Story books have characters and made-up events. Information books give true facts about the real world. Pick the right book for the job, every time!",
    "title": "You Know Both Kinds!",
    "body": "You explained the difference between story books and information books."
  },
  scenes: [
    {
      id: "hook-two-kinds",
      purpose: "hook",
      gate: "none",
      prompt: "There are two kinds of books.",
      fx: {"text":"Some books tell **stories**. Some books give **information**.","effect":"pop-words"},
      narration: { audio: A("hook-two-kinds"), script: "Hello, reader! Look at any book shelf and you will find two kinds of books. Some books tell stories. Some books give information. Today you will read a page from each kind, and you will explain how you can tell them apart." },
    },
    {
      id: "model-story-book",
      purpose: "model",
      gate: "none",
      prompt: "A story book has characters and made-up events.",
      image: IMG("story-book"),
      narration: { audio: A("model-story-book"), script: "This is a story book. A story book has characters, the people or animals the story is about. Look, a knight and a dragon! A story book has made-up events, things that did not really happen. A knight cannot really wave to a dragon. That is fine, because a story book's job is to tell a tale. You read a story book to enjoy the tale." },
    },
    {
      id: "model-information-book",
      purpose: "model",
      gate: "none",
      prompt: "An information book gives true facts.",
      image: IMG("information-book"),
      narration: { audio: A("model-information-book"), script: "Now look at this book. This is an information book. An information book gives true facts about the real world. This one tells about Earth and about whales, and every fact in it is true. You read an information book to learn something real." },
    },
    {
      id: "guided-choose-made-up",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which kind of book has made-up events?",
      fx: {"text":"Which kind has **made-up events**?","effect":"underline"},
      narration: { audio: A("guided-choose-made-up"), script: "Your turn! One kind of book has made-up events, things that did not really happen. Read both cards. Tap that kind of book." },
      interaction: { type: "choose", options: [{ id: "story-book", label: "story book" }, { id: "information-book", label: "information book" }], correctId: "story-book", coachWrong: "Made-up events did not really happen. Which kind of book tells a tale like that? Try again!" },
    },
    {
      id: "guided-choose-why-read",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why do you read a story book?",
      fx: {"text":"**Why** do you read a story book?","effect":"glow"},
      narration: { audio: A("guided-choose-why-read"), script: "Each kind of book has its own job. Think about what a story book does for you. Read each card. Tap the reason you read a story book." },
      interaction: { type: "choose", options: [{ id: "enjoy-tale", label: "to enjoy a tale" }, { id: "learn-facts", label: "to learn true facts" }], correctId: "enjoy-tale", coachWrong: "Think about the book's job. A story book is not for learning real things. Try again!" },
    },
    {
      id: "guided-read-story-page",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read this page with me.",
      narration: { audio: A("guided-read-story-page"), script: "Here is a page from a book about a frog named Lily. Read it with me, and think about what kind of book it comes from." },
      interaction: { type: "read-along", text: "Lily the frog found a gold coin. \"I will buy a big red hat,\" she said. She hopped to the hat shop.", audio: A("guided-read-story-page-sentence") },
    },
    {
      id: "guided-choose-kind-story",
      purpose: "guided",
      gate: "interaction",
      prompt: "What kind of book is Lily's page from?",
      image: IMG("frog-hat"),
      narration: { audio: A("guided-choose-kind-story"), script: "Think about Lily's page. A frog talked. A frog went to buy a hat. Can that really happen? Read each card. Tap the kind of book Lily's page comes from." },
      interaction: { type: "choose", options: [{ id: "story-book", label: "story book" }, { id: "information-book", label: "information book" }], correctId: "story-book", coachWrong: "Think. Can a real frog talk and shop for a hat? Try again!" },
    },
    {
      id: "guided-choose-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "How do you know it is a story book?",
      fx: {"text":"Point to the **clue**!","effect":"glow"},
      narration: { audio: A("guided-choose-evidence"), script: "You got it! Now do what good readers do. Explain how you know. Read each card. Tap the clue that shows Lily's page is a story book." },
      interaction: { type: "choose", options: [{ id: "frog-talks", label: "a frog talks and buys a hat" }, { id: "true-facts", label: "it gives true facts" }, { id: "frogs-real", label: "frogs are real animals" }], correctId: "frog-talks", coachWrong: "The clue must be something made up, something that cannot really happen. Find that card. Try again!" },
    },
    {
      id: "apply-read-fact-page",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read this page with me.",
      narration: { audio: A("apply-read-fact-page"), script: "Now here is a page from a different book. It is about frogs too. Read it with me, and think about what kind of book it comes from." },
      interaction: { type: "read-along", text: "Frogs live near water. They eat small bugs. A frog has a long, sticky tongue.", audio: A("apply-read-fact-page-sentence") },
    },
    {
      id: "apply-choose-kind-facts",
      purpose: "apply",
      gate: "interaction",
      prompt: "What kind of book is this frog page from?",
      image: IMG("frog-pond"),
      narration: { audio: A("apply-choose-kind-facts"), script: "Think about this new page. Frogs really do live near water. They really do eat bugs. Every line on this page is true. Read each card. Tap the kind of book this page comes from." },
      interaction: { type: "choose", options: [{ id: "story-book", label: "story book" }, { id: "information-book", label: "information book" }], correctId: "information-book", coachWrong: "Every line on this page is true in the real world. Which kind of book does that job? Try again!" },
    },
    {
      id: "apply-speak-fact-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read this line out loud: Frogs eat small bugs.",
      narration: { audio: A("apply-speak-fact-line"), script: "This true fact comes from the frog page you just read. Tap the mic and read the line out loud, nice and clear." },
      interaction: { type: "speak", text: "frogs eat small bugs" },
    },
    {
      id: "apply-sort-lines",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the lines from our two frog books.",
      narration: { audio: A("apply-sort-lines"), script: "Here are lines from our two frog books. Read each line. Is it a made-up story line, or a true fact? Drag each line to its bucket." },
      interaction: { type: "sort", buckets: ["Story","Facts"], items: [{ label: "a frog buys a big hat", bucket: "Story" }, { label: "frogs eat small bugs", bucket: "Facts" }, { label: "a frog can talk", bucket: "Story" }, { label: "frogs live near water", bucket: "Facts" }], coachWrong: "Made-up lines cannot really happen. True lines are real in our world. Try again!" },
    },
    {
      id: "challenge-choose-purpose",
      purpose: "challenge",
      gate: "interaction",
      prompt: "You want to learn how real tigers live. Which book do you pick?",
      fx: {"text":"Pick the **best book** for the job!","effect":"underline"},
      narration: { audio: A("challenge-choose-purpose"), script: "Challenge time! Pretend you want to learn how real tigers live, what they eat and where they sleep. Three books sit on the shelf. Read each title. Then tap the best book for the job." },
      interaction: { type: "choose", options: [{ id: "all-about-tigers", label: "all about tigers" }, { id: "tiger-magic-wish", label: "the tiger's magic wish" }, { id: "tigers-silly-picnic", label: "the tiger's silly picnic" }], correctId: "all-about-tigers", coachWrong: "That title sounds like a made-up tale. You want real facts about tigers. Try again!" },
    },
    {
      id: "challenge-speak-which-kind",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the kind of book out loud!",
      fx: {"text":"**What kind** of book is it from?","effect":"pop-words"},
      narration: { audio: A("challenge-speak-which-kind"), script: "Last challenge! Listen to a line from a brand new book. The little star said, hello moon, let us dance! Can that really happen? Think about which kind of book that line comes from. Tap the mic and say the kind of book out loud." },
      interaction: { type: "speak", text: "story stories storybook pretend" },
    },
    {
      id: "celebrate-book-expert",
      purpose: "celebrate",
      gate: "none",
      prompt: "You know both kinds of books!",
      fx: {"text":"You can **explain** both kinds of books!","effect":"fireworks"},
      narration: { audio: A("celebrate-book-expert"), script: "You did it! Story books have characters and made-up events, and you read them to enjoy a tale. Information books give true facts about the real world, and you read them to learn. Best of all, you can point to the clues and explain which is which. Happy reading!" },
    },
  ],
};
