import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./two-books-one-topic-timings.json";

// Two Books, One Topic (RI.K.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=two-books-one-topic

const A = (id: string) => `/audio/lessons-v2/two-books-one-topic/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/two-books-one-topic/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/two-books-one-topic/${w.toLowerCase()}.png`;

export const twoBooksOneTopicImages: Record<string, string> = {
  "two-books": "A closed book with a plain solid blue cover and a closed book with a plain solid red cover, side by side on a wooden table, no words, letters, or pictures on either cover",
  "blue-book": "A closed book with a plain solid blue cover on a wooden table, no words, letters, or pictures on the cover",
  "red-book": "A closed book with a plain solid red cover on a wooden table, no words, letters, or pictures on the cover",
  "birds": "A penguin standing upright on white ice under a clear blue sky, realistic natural pose",
  "swim": "A penguin swimming underwater with small bubbles trailing behind it",
  "fish": "A small silver fish swimming in clear blue water",
  "slide": "A penguin sliding on its belly across smooth white ice"
};

export const twoBooksOneTopic: LessonDef = {
  id: "two-books-one-topic",
  title: "Two Books, One Topic",
  grade: "Kindergarten",
  standard: "RI.K.9",
  archetype: "story-elements",
  objective: "I can tell which facts are in both books and which facts are in just one book.",
  concepts: ["compare two books", "facts", "same topic"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You compared two fact books like a real fact finder! You found the facts that were in both books, and the facts that were in just one book. Amazing work!",
    "title": "Book Comparer!",
    "body": "You found what was in both books, and what was in just one!"
  },
  scenes: [
    {
      id: "hook-two-books",
      purpose: "hook",
      gate: "none",
      prompt: "Two books, one topic!",
      image: IMG("two-books"),
      narration: { audio: A("hook-two-books"), script: "Hello, fact finders! Look at these two books. One book has a blue cover. One book has a red cover. They are two different books, but they are both about the very same topic: penguins! Let's read them and compare their facts." },
    },
    {
      id: "read-blue-book",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read the blue book.",
      image: IMG("blue-book"),
      narration: { audio: A("read-blue-book"), script: "First, the blue book. Every fact in a fact book is true. Read the blue book's facts with me." },
      interaction: { type: "read-along", text: "Penguins are birds. Penguins swim. Penguins eat fish.", audio: A("read-blue-book-sentence") },
    },
    {
      id: "read-red-book",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read the red book.",
      image: IMG("red-book"),
      narration: { audio: A("read-red-book"), script: "Now, the red book. Listen closely. Some facts might be the same as the blue book. Some facts might be new. Read with me." },
      interaction: { type: "read-along", text: "Penguins are birds. Penguins swim. Penguins slide on ice.", audio: A("read-red-book-sentence") },
    },
    {
      id: "model-both",
      purpose: "model",
      gate: "none",
      prompt: "Some facts are in **both** books.",
      image: IMG("swim"),
      narration: { audio: A("model-both"), script: "Let's compare! The blue book said penguins are birds. The red book said penguins are birds too. And both books said penguins swim. When the blue book and the red book tell the same fact, that fact is in both books." },
    },
    {
      id: "model-only-one",
      purpose: "model",
      gate: "none",
      prompt: "Some facts are in **just one** book.",
      image: IMG("slide"),
      narration: { audio: A("model-only-one"), script: "But listen to this. Only the blue book said penguins eat fish. The red book did not say that. And only the red book said penguins slide on ice. Some facts are in just one book!" },
    },
    {
      id: "guided-choose-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which fact is in **both** books?",
      narration: { audio: A("guided-choose-both"), script: "Your turn, fact finder! Remember: the blue book said penguins are birds, penguins swim, and penguins eat fish. The red book said penguins are birds, penguins swim, and penguins slide on ice. Tap the fact that is in both books." },
      interaction: { type: "choose", options: [{ id: "swim", label: "SWIM", audio: W("swim"), image: IMG("swim") }, { id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }, { id: "slide", label: "SLIDE", audio: W("slide"), image: IMG("slide") }], correctId: "swim", coachWrong: "Look again. Was that fact in the blue book AND the red book?" },
    },
    {
      id: "guided-choose-only-blue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which fact is **only** in the blue book?",
      narration: { audio: A("guided-choose-only-blue"), script: "Great comparing! Listen again. The blue book said penguins are birds, penguins swim, and penguins eat fish. The red book said penguins are birds, penguins swim, and penguins slide on ice. Tap the fact that is only in the blue book." },
      interaction: { type: "choose", options: [{ id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }, { id: "birds", label: "BIRDS", audio: W("birds"), image: IMG("birds") }, { id: "swim", label: "SWIM", audio: W("swim"), image: IMG("swim") }], correctId: "fish", coachWrong: "Hmm, the red book told that fact too. Find the fact that only the blue book told." },
    },
    {
      id: "apply-choose-only-red",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which fact is **only** in the red book?",
      narration: { audio: A("apply-choose-only-red"), script: "Now find a red book fact. The red book said penguins are birds, penguins swim, and penguins slide on ice. The blue book said penguins are birds, penguins swim, and penguins eat fish. Tap the fact that is only in the red book." },
      interaction: { type: "choose", options: [{ id: "slide", label: "SLIDE", audio: W("slide"), image: IMG("slide") }, { id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }, { id: "birds", label: "BIRDS", audio: W("birds"), image: IMG("birds") }], correctId: "slide", coachWrong: "Check the red book's facts. Was that fact told by the red book, and only the red book?" },
    },
    {
      id: "apply-say-topic",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the topic!",
      image: IMG("two-books"),
      narration: { audio: A("apply-say-topic"), script: "Here is a big question. The blue book and the red book are about the same topic. They both tell all about one animal. Press the microphone and say the animal!" },
      interaction: { type: "speak", text: "penguin penguins" },
    },
    {
      id: "challenge-sort",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the facts!",
      narration: { audio: A("challenge-sort"), script: "Here is your challenge! Listen one more time. The blue book said: penguins are birds, penguins swim, penguins eat fish. The red book said: penguins are birds, penguins swim, penguins slide on ice. Now drag each fact to the right spot. Is it in both books, only the blue book, or only the red book?" },
      interaction: { type: "sort", buckets: ["Both", "Blue Book", "Red Book"], items: [{ label: "BIRDS", bucket: "Both", audio: W("birds"), image: IMG("birds") }, { label: "SWIM", bucket: "Both", audio: W("swim"), image: IMG("swim") }, { label: "FISH", bucket: "Blue Book", audio: W("fish"), image: IMG("fish") }, { label: "SLIDE", bucket: "Red Book", audio: W("slide"), image: IMG("slide") }], coachWrong: "Think about the books. Was that fact in both books, or in just one book?" },
    },
    {
      id: "celebrate-lesson",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You compared two books!",
      fx: { "text": "fact finder!", "effect": "fireworks" },
      narration: { audio: A("celebrate-lesson"), script: "You did it! You read two books about the same topic, and you compared their facts. You found facts in both books, and facts in just one book. You are a super fact finder!" },
    },
  ],
};
