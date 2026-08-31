import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./book-team-up-timings.json";

// Book Team-Up (RI.2.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=book-team-up
// G2: compare/contrast the MOST IMPORTANT POINTS of two texts on the same topic.
// Informational twin of one-story-two-ways (RL.2.9). TWO original TRUE dolphin
// texts with different angles: Book One "how a dolphin's body works" (mammal
// swims up for air, blowhole, smooth skin + strong tail = speed, clicks to
// catch fish) and Book Two "how a pod lives together" (pods, signature name
// whistles, team fish herding, pod pushes a hurt dolphin up for air).
// Shared facts, told in different words: dolphins come up for air / dolphins
// catch fish. Compare move: Both Books / Book One only / Book Two only.
// All dolphin facts verified true. Keys prefixed quiz- are fresh stimuli for
// the quiz (gecko two-text pair, same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/book-team-up/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/book-team-up/${w.toLowerCase()}.png`;

export const bookTeamUpImages: Record<string, string | { subject: string; ref?: string }> = {
  "two-books": "Two closed books standing upright side by side on a light wooden table: one book with a plain solid teal cover and one book with a plain solid coral orange cover, plain soft cream background, bold clean outlines. No letters, no words, no numbers, no labels, no writing anywhere on the covers or in the picture.",
  "book-one": "One closed book with a plain solid teal cover lying flat on a light wooden table, plain soft cream background, bold clean outlines. No letters, no words, no numbers, no labels, no writing anywhere on the cover or in the picture.",
  "book-two": "One closed book with a plain solid coral orange cover lying flat on a light wooden table, plain soft cream background, bold clean outlines. No letters, no words, no numbers, no labels, no writing anywhere on the cover or in the picture.",
  "dolphin-air": "A friendly nonfiction illustration of one gray dolphin at the surface of calm blue ocean water, the top of its head just above the surface with a soft puff of misty air rising from the blowhole on top of its head, gentle waves around it, plain blue sky above. The dolphin looks and acts like a real dolphin, no human smile, no clothes. No letters, no words, no numbers, no writing anywhere.",
  "dolphin-pod": "A friendly nonfiction illustration of five gray dolphins swimming close together as a calm group underwater, clear blue ocean water with soft light rays coming down from above. The dolphins look and act like real dolphins, no human smiles, no clothes. No letters, no words, no numbers, no writing anywhere.",
  "dolphin-fish": "A friendly nonfiction illustration of three gray dolphins swimming in a circle around one tight round ball of many small silver fish underwater, clear blue ocean water. The dolphins look and act like real dolphins, no human smiles, no clothes. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gecko-wall": "A friendly nonfiction illustration of one small green gecko climbing up a plain light stone wall, its wide toe pads spread flat against the wall, seen from the side, soft daylight. The gecko looks and acts like a real gecko, no human smile, no clothes. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gecko-night": "A friendly nonfiction illustration of one small green gecko with big round eyes perched on a tree branch at night, dark blue night sky with a plain crescent moon and a few small stars behind it. The gecko looks and acts like a real gecko, no human smile, no clothes, no face on the moon. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gecko-bug": "A friendly nonfiction illustration of one small green gecko on a leafy green branch looking at one small brown cricket sitting farther along the same branch, soft daylight. The gecko and cricket look and act like real animals, no human smiles, no clothes. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gecko-tail": "A friendly nonfiction illustration of one small green gecko standing on a flat gray rock, shown from the side so its long striped tail curls clearly behind it, soft daylight, a few small green plants nearby. The gecko looks and acts like a real gecko, no human smile, no clothes. No letters, no words, no numbers, no writing anywhere.",
};

export const bookTeamUp: LessonDef = {
  id: "book-team-up",
  title: "Book Team-Up",
  grade: "2nd Grade",
  standard: "RI.2.9",
  archetype: "inference",
  objective: "I can compare the most important points of two books about the same topic.",
  concepts: ["two texts on one topic","most important point","facts in both books","facts in only one book","same fact in different words","different author jobs"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read two books about one topic and compared them like a strong reader. You found each author's most important point, you matched facts that both books taught even when the words changed, and you spotted facts that lived in only one book. Two books about one topic always teach you more than one.",
    "title": "Book Team-Up!",
    "body": "You compared two books on the same topic: each author's most important point, the facts in both books, and the facts in just one."
  },
  scenes: [
    {
      id: "hook-two-books",
      purpose: "hook",
      gate: "none",
      prompt: "Two books, one topic: dolphins!",
      image: IMG("two-books"),
      narration: { audio: A("hook-two-books"), script: "Hello, reader. Today you get two books instead of one, and both books are about the very same topic: dolphins. Two different authors wrote them, so each book does its own job. Strong readers compare books like these. They find the points both books teach, and the points only one book teaches. Let's see how it works." },
    },
    {
      id: "model-both-or-one",
      purpose: "model",
      gate: "none",
      prompt: "Watch me compare two tiny books.",
      fx: {"text":"**Both** books? Or just **one**?","effect":"underline"},
      narration: { audio: A("model-both-or-one"), script: "Watch me compare two tiny apple books first. The first tiny book says: apples grow on trees, and apples can be red or green. The second tiny book says: apples grow on trees, and apples taste sweet. Now I compare. Both books said apples grow on trees, so that point is in both. Only the first book said red or green. Only the second book said sweet. Both, or only one. That is the compare move you will use today." },
    },
    {
      id: "read-a-page-one",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one of book one.",
      image: IMG("dolphin-air"),
      narration: { audio: A("read-a-page-one"), script: "Here is book one. This author wrote about a dolphin's body and how it works. Page one is a read along. Follow each word with me." },
      interaction: { type: "read-along", text: "A dolphin looks like a fish, but it is not one. A dolphin must swim up to the top for air. It breathes through a blowhole on top of its head.", audio: A("read-a-page-one-sentence") },
    },
    {
      id: "read-a-page-two",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Smooth skin and a strong tail make a dolphin a fast swimmer. To catch fish, it makes clicks and listens for the echo. A dolphin's body is built for life in the sea.",
      narration: { audio: A("read-a-page-two"), script: "Now page two of book one is all yours. Read it out loud, nice and smooth." },
      interaction: { type: "speak", text: "Smooth skin and a strong tail make a dolphin a fast swimmer To catch fish it makes clicks and listens for the echo A dolphin's body is built for life in the sea" },
    },
    {
      id: "check-a-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is book one's most important point?",
      image: IMG("book-one"),
      narration: { audio: A("check-a-point"), script: "Book one is done. Every fact book has one most important point, the big idea the whole book teaches. Book one told you about swimming up for air, a blowhole, smooth skin, a strong tail, and clicks that catch fish. All those details work for one big idea. Tap book one's most important point." },
      interaction: { type: "choose", options: [{ id: "built-for-life-in-the-sea", label: "built for life in the sea" }, { id: "it-breathes-with-a-blowhole", label: "it breathes with a blowhole" }, { id: "it-is-not-a-fish", label: "it is not a fish" }, { id: "it-has-smooth-skin", label: "it has smooth skin" }], correctId: "built-for-life-in-the-sea", coachWrong: "That is one detail from book one. The most important point is the big idea that all the details work for. Which choice covers the whole book?" },
    },
    {
      id: "read-b-page-one",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one of book two.",
      image: IMG("dolphin-pod"),
      narration: { audio: A("read-b-page-one"), script: "Here comes book two. Same topic, dolphins, but a different author with a different job. This author wrote about how dolphins live together. Page one is a read along. Follow along with me." },
      interaction: { type: "read-along", text: "Dolphins live in groups called pods. Pod mates talk with whistles. Each dolphin has its own special whistle, like a name.", audio: A("read-b-page-one-sentence") },
    },
    {
      id: "read-b-page-two",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A pod hunts as a team. The dolphins herd fish into a tight ball to catch them. When a dolphin is hurt, its pod pushes it up to the top for air. Dolphins do almost everything together.",
      narration: { audio: A("read-b-page-two"), script: "Page two of book two belongs to you. Read it out loud, clear and steady." },
      interaction: { type: "speak", text: "A pod hunts as a team The dolphins herd fish into a tight ball to catch them When a dolphin is hurt its pod pushes it up to the top for air Dolphins do almost everything together" },
    },
    {
      id: "check-b-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is book two's most important point?",
      image: IMG("book-two"),
      narration: { audio: A("check-b-point"), script: "Now find book two's most important point. Book two told you about pods, name whistles, team fish hunts, and helping a hurt dolphin. All those details point at one big idea. Tap book two's most important point." },
      interaction: { type: "choose", options: [{ id: "they-do-everything-together", label: "they do everything together" }, { id: "pods-herd-fish-into-a-ball", label: "pods herd fish into a ball" }, { id: "each-dolphin-has-a-whistle", label: "each dolphin has a whistle" }, { id: "a-hurt-dolphin-gets-a-push", label: "a hurt dolphin gets a push" }], correctId: "they-do-everything-together", coachWrong: "That is a detail from book two. Step back and ask: what big idea do all of book two's details show?" },
    },
    {
      id: "model-same-fact",
      purpose: "model",
      gate: "none",
      prompt: "Different words can tell the same fact.",
      fx: {"text":"Different words, **same** fact","effect":"glow"},
      narration: { audio: A("model-same-fact"), script: "Time for the tricky part of comparing. Book one said a dolphin must swim up to the top for air. Book two said a pod pushes a hurt dolphin up to the top for air. The words are different, but both books teach the same fact: dolphins need air. When two books teach the same fact, even in different words, that fact is in both books. But watch out. Only book one taught about the blowhole. Only book two taught about pods. Some facts live in just one book." },
    },
    {
      id: "guided-choose-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which fact is in **both** books?",
      image: IMG("two-books"),
      narration: { audio: A("guided-choose-both"), script: "Your turn to compare. Think about what each book taught. Book one taught: dolphins swim up for air, a blowhole sits on top of the head, smooth skin and a strong tail make them fast, and clicks help them catch fish. Book two taught: dolphins live in pods, each dolphin has its own whistle, pods herd fish to catch them, and a pod pushes a hurt dolphin up for air. Tap the fact that is in both books." },
      interaction: { type: "choose", options: [{ id: "coming-up-for-air", label: "coming up for air" }, { id: "a-blowhole-on-the-head", label: "a blowhole on the head" }, { id: "one-special-whistle-each", label: "one special whistle each" }, { id: "living-in-big-groups", label: "living in big groups" }], correctId: "coming-up-for-air", coachWrong: "Check that fact against both books. One of the books never taught it. Find the fact that book one and book two both teach." },
    },
    {
      id: "guided-which-book",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which book taught: each dolphin has its own special whistle?",
      image: IMG("two-books"),
      narration: { audio: A("guided-which-book"), script: "Now place one fact. Here it is: each dolphin has its own special whistle, like a name. Think back to your reading. Did one book teach you that fact, or did you read it in both? Tap where that fact lives." },
      interaction: { type: "choose", options: [{ id: "book-one", label: "book one" }, { id: "book-two", label: "book two" }, { id: "both-books", label: "both books" }], correctId: "book-two", coachWrong: "Think about each author's job. One book taught how the body works. The other taught how dolphins live together. Where does a name whistle belong?" },
    },
    {
      id: "apply-both-fish",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which book teaches that dolphins catch fish?",
      image: IMG("dolphin-fish"),
      narration: { audio: A("apply-both-fish"), script: "Here is a tricky one. Book one said a dolphin makes clicks to catch fish. Book two said the pod herds fish into a tight ball to catch them. Those sentences use different words. Think about the fact underneath them, then tap which book teaches that dolphins catch fish." },
      interaction: { type: "choose", options: [{ id: "book-one", label: "book one" }, { id: "book-two", label: "book two" }, { id: "both-books", label: "both books" }], correctId: "both-books", coachWrong: "Read the two sentences again in your head. Do they teach two different facts, or the same fact told in different words?" },
    },
    {
      id: "apply-different-jobs",
      purpose: "apply",
      gate: "interaction",
      prompt: "What job was book one doing?",
      image: IMG("book-one"),
      narration: { audio: A("apply-different-jobs"), script: "Both books are about dolphins, but each author did a different job. Think about book one and everything it taught: the blowhole, the smooth skin, the strong tail, the clicks. Tap the job book one was doing." },
      interaction: { type: "choose", options: [{ id: "how-a-dolphins-body-works", label: "how a dolphin's body works" }, { id: "how-a-pod-lives-together", label: "how a pod lives together" }, { id: "how-fish-breathe-underwater", label: "how fish breathe underwater" }, { id: "how-boats-cross-the-sea", label: "how boats cross the sea" }], correctId: "how-a-dolphins-body-works", coachWrong: "Book one never taught that. Think about its pages: a blowhole, smooth skin, a strong tail, clicks. What are all of those details about?" },
    },
    {
      id: "challenge-sort",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each fact: Both Books, Book One, or Book Two?",
      narration: { audio: A("challenge-sort"), script: "Last big compare, and it is all yours. Think back. Book one taught the body: swimming up for air, the blowhole, smooth skin and a strong tail for speed, and clicks that catch fish. Book two taught pod life: living in groups, name whistles, team fish hunts, and pushing a hurt dolphin up for air. Now sort each fact. If both books taught it, drag it to both books. If only one book taught it, drag it to that book. Remember, two books can teach the same fact with different words." },
      interaction: { type: "sort", buckets: ["Both Books","Book One","Book Two"], items: [{ label: "coming up for air", bucket: "Both Books" }, { label: "catching fish", bucket: "Both Books" }, { label: "a blowhole on the head", bucket: "Book One" }, { label: "skin and tail for speed", bucket: "Book One" }, { label: "one special whistle each", bucket: "Book Two" }, { label: "living in groups", bucket: "Book Two" }], coachWrong: "Say that fact to yourself, then check it against book one and book two. Different words can still teach the same fact. Where does it truly live?" },
    },
    {
      id: "challenge-speak",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one fact that both books taught!",
      image: IMG("two-books"),
      narration: { audio: A("challenge-speak"), script: "One last job. Tell me one fact that both books taught. Think about what dolphins do at the top of the water, or what dolphins catch to eat. Tap the mic and say a both books fact out loud." },
      interaction: { type: "speak", text: "air breathe breathes breathing top surface fish catch catches catching hunt hunts hunting eat eats eating need needs" },
    },
    {
      id: "celebrate-team-up",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You compared two books like an expert!",
      fx: {"text":"Two books teach **more** than one!","effect":"fireworks"},
      narration: { audio: A("celebrate-team-up"), script: "What a comparer you are. You read two books about one topic and found each author's most important point. Book one taught how a dolphin's body works. Book two taught how a pod lives together. You matched facts that were in both books, even when the words changed, and you spotted facts that lived in only one book. Whenever you read two books about one topic, compare them. Two books together always teach you more than one." },
    },
  ],
};
