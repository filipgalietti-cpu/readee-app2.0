import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./two-texts-compare-timings.json";

// Two Texts Compare (RI.1.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=two-texts-compare

const A = (id: string) => `/audio/lessons-v2/two-texts-compare/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/two-texts-compare/${w.toLowerCase()}.png`;

export const twoTextsCompareImages: Record<string, string> = {
  "two-books": "A closed book with a plain solid blue cover and a closed book with a plain solid red cover standing side by side on a light wooden table, no words, letters, or pictures on either cover",
  "blue-book": "A closed book with a plain solid blue cover lying on a light wooden table, no words, letters, or pictures on the cover",
  "red-book": "A closed book with a plain solid red cover lying on a light wooden table, no words, letters, or pictures on the cover",
  "otter-rock": "A cute cartoon sea otter floating on its back in calm blue sea water, holding a small gray rock above a clam shell resting on its belly, no text anywhere",
  "otter-hands": "Two cute cartoon sea otters floating on their backs side by side in calm blue sea water, holding paws with their eyes closed as if sleeping, no text anywhere"
};

export const twoTextsCompare: LessonDef = {
  id: "two-texts-compare",
  title: "Two Texts Compare",
  grade: "1st Grade",
  standard: "RI.1.9",
  archetype: "inference",
  objective: "I can find facts two books share and facts only one book teaches.",
  concepts: ["compare two texts", "same fact in different words", "facts in both books", "facts in one book"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read two books about sea otters and compared their facts like a strong reader. You found facts in both books, facts in just one book, and you even matched the same fact told in different words. Amazing work!",
    "title": "Book Comparer!",
    "body": "You found what both books taught, what each book taught alone, and matched facts told in different words."
  },
  scenes: [
    {
      id: "hook-two-books",
      purpose: "hook",
      gate: "none",
      prompt: "Two books, one topic: sea otters!",
      image: IMG("two-books"),
      narration: { audio: A("hook-two-books"), script: "Hello, reader! Look at these two books. One has a blue cover, and one has a red cover. They are two different books, but they are about the very same topic: sea otters. Today you will read both books. Then we will compare their facts to find what is the same and what is different." },
    },
    {
      id: "read-blue-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one of the Blue Book.",
      image: IMG("blue-book"),
      narration: { audio: A("read-blue-page-one"), script: "First, the Blue Book. Every fact in a fact book is true. Read page one with me. Follow each word." },
      interaction: { type: "read-along", text: "Sea otters live in the sea. They have thick fur. The thick fur keeps them warm.", audio: A("read-blue-page-one-sentence") },
    },
    {
      id: "read-blue-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two: Sea otters eat clams and crabs. They crack the shells with rocks. They hold hands when they sleep.",
      image: IMG("blue-book"),
      narration: { audio: A("read-blue-page-two"), script: "Page two of the Blue Book is all yours. Read it out loud, nice and clear." },
      interaction: { type: "speak", text: "Sea otters eat clams and crabs They crack the shells with rocks They hold hands when they sleep" },
    },
    {
      id: "read-red-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one of the Red Book.",
      image: IMG("red-book"),
      narration: { audio: A("read-red-page-one"), script: "Great reading! Now the Red Book. It is about sea otters too. Some of its facts may match the Blue Book, and some may be new. Read page one with me." },
      interaction: { type: "read-along", text: "A sea otter makes its home in the sea. Its fur keeps it warm. It can dive deep to get food.", audio: A("read-red-page-one-sentence") },
    },
    {
      id: "read-red-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two of the Red Book.",
      image: IMG("red-book"),
      narration: { audio: A("read-red-page-two"), script: "One page left. Read along with me, and listen for facts that match the Blue Book." },
      interaction: { type: "read-along", text: "Sea otters crack shells open with small stones. They float on their backs. A baby sea otter is a pup.", audio: A("read-red-page-two-sentence") },
    },
    {
      id: "model-same-fact",
      purpose: "model",
      gate: "none",
      prompt: "Same fact, even in different words!",
      image: IMG("otter-rock"),
      narration: { audio: A("model-same-fact"), script: "Time to compare! The Blue Book said thick fur keeps them warm. The Red Book said its fur keeps it warm. Same fact, so that fact is in both books. Now here is the tricky part. The Blue Book said otters crack shells with rocks. The Red Book said otters crack shells open with small stones. The words are different, but rocks and small stones are the same thing. When two books tell the same fact in different words, it still counts as the same fact." },
    },
    {
      id: "model-one-book",
      purpose: "model",
      gate: "none",
      prompt: "Some facts are in just **one** book.",
      image: IMG("otter-hands"),
      narration: { audio: A("model-one-book"), script: "Some facts are in just one book. Only the Blue Book said otters hold hands when they sleep. The Red Book left that out. And only the Red Book said a baby sea otter is a pup. The Blue Book left that out. Each book taught something the other one missed. That is why reading two books about one topic makes you extra smart." },
    },
    {
      id: "guided-choose-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which fact is in **both** books?",
      image: IMG("two-books"),
      narration: { audio: A("guided-choose-both"), script: "Your turn. Remember what each book taught. The Blue Book said: otters live in the sea, thick fur keeps them warm, they eat clams and crabs, they crack shells with rocks, and they hold hands when they sleep. The Red Book said: the sea is the otter's home, its fur keeps it warm, it dives deep for food, it cracks shells open with small stones, it floats on its back, and a baby otter is a pup. Read each fact, then tap the fact that is in both books." },
      interaction: { type: "choose", options: [{ id: "fur-keeps-warm", label: "fur keeps them warm" }, { id: "hold-hands", label: "they hold hands" }, { id: "baby-pup", label: "a baby is a pup" }], correctId: "fur-keeps-warm", coachWrong: "Close, but one book left that fact out. Find a fact that the Blue Book AND the Red Book both taught." },
    },
    {
      id: "guided-which-book",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which book taught: otters hold hands when they sleep?",
      image: IMG("otter-hands"),
      narration: { audio: A("guided-which-book"), script: "Now let's find where one fact lives. Think about this fact: otters hold hands when they sleep. The Blue Book said: otters live in the sea, thick fur keeps them warm, they eat clams and crabs, they crack shells with rocks, and they hold hands when they sleep. The Red Book said: the sea is the otter's home, its fur keeps it warm, it dives deep for food, it cracks shells open with small stones, it floats on its back, and a baby otter is a pup. Tap the book that taught this fact." },
      interaction: { type: "choose", options: [{ id: "blue-book", label: "the blue book" }, { id: "red-book", label: "the red book" }, { id: "both-books", label: "both books" }], correctId: "blue-book", coachWrong: "Listen for sleeping otters holding hands. Did both books say it, or just one? Which one?" },
    },
    {
      id: "apply-crack-shells",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which book taught: otters crack shells?",
      image: IMG("otter-rock"),
      narration: { audio: A("apply-crack-shells"), script: "Here is a tricky one. Think about this fact: otters crack shells. The Blue Book said otters crack shells with rocks. The Red Book said otters crack shells open with small stones. Now think carefully, and tap the book that taught that otters crack shells." },
      interaction: { type: "choose", options: [{ id: "blue-book", label: "the blue book" }, { id: "red-book", label: "the red book" }, { id: "both-books", label: "both books" }], correctId: "both-books", coachWrong: "Careful. Are rocks and small stones the same thing, or different things? Think, then tap again." },
    },
    {
      id: "apply-say-both-fact",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say one fact that both books taught!",
      image: IMG("two-books"),
      narration: { audio: A("apply-say-both-fact"), script: "Last talking job. Tell me one fact that was in both books. Both books told where otters live. Both books told what keeps otters warm. And both books told how otters crack shells. Pick one of those facts and say it out loud." },
      interaction: { type: "speak", text: "fur warm crack cracks shells rocks stones live lives home" },
    },
    {
      id: "challenge-sort",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each fact: Both, Blue Only, or Red Only?",
      narration: { audio: A("challenge-sort"), script: "Here is your final challenge. Listen one more time. The Blue Book said: otters live in the sea, thick fur keeps them warm, they eat clams and crabs, they crack shells with rocks, and they hold hands when they sleep. The Red Book said: the sea is the otter's home, its fur keeps it warm, it dives deep for food, it cracks shells open with small stones, it floats on its back, and a baby otter is a pup. Now sort each fact. If both books taught it, drag it to Both. If only the Blue Book taught it, drag it to Blue Only. If only the Red Book taught it, drag it to Red Only. Watch out, some matching facts use different words." },
      interaction: { type: "sort", buckets: ["Both", "Blue Only", "Red Only"], items: [{ label: "warm fur", bucket: "Both" }, { label: "crack shells", bucket: "Both" }, { label: "eat clams", bucket: "Blue Only" }, { label: "hold hands", bucket: "Blue Only" }, { label: "float on backs", bucket: "Red Only" }, { label: "a baby pup", bucket: "Red Only" }], coachWrong: "Think about what that fact means. Did both books teach it, or just one? Different words can still tell the same fact." },
    },
    {
      id: "celebrate-compare",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You compared two texts!",
      fx: { "text": "book comparer!", "effect": "fireworks" },
      narration: { audio: A("celebrate-compare"), script: "You did it! You read two whole books about sea otters and compared them like a strong reader. You found facts in both books, facts in just one book, and you even matched the same fact told in different words. Reading two books about one topic teaches you more than one book ever could. Amazing work!" },
    },
  ],
};
