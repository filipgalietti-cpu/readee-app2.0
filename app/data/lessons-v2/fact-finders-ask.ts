import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-finders-ask-timings.json";

// Fact Finders Ask (RI.2.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-finders-ask
// G2: original TRUE fact book "The Bird That Chases Summer" (Arctic tern), 8 sentences over 4 child-read pages.

const A = (id: string) => `/audio/lessons-v2/fact-finders-ask/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-finders-ask/${w.toLowerCase()}.png`;

export const factFindersAskImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A nonfiction book cover style illustration of one Arctic tern in flight over a cold blue ocean, a small white seabird with a black cap on its head, gray wings, a red-orange beak, short red legs and a forked tail, icy shoreline below, soft blue sky, friendly nonfiction illustration, the bird looks and acts like a real Arctic tern, no text anywhere",
  "page-1": { subject: "The same single white Arctic tern with a black cap, gray wings and red-orange beak flying away from a snowy icy northern coastline, heading out over open water, cool morning light, friendly nonfiction illustration, no text anywhere", ref: "cover" },
  "page-2": { subject: "The same single white Arctic tern with a black cap, gray wings and red-orange beak flying high above wide open blue ocean, rolling waves stretching to the horizon in every direction, big sky, friendly nonfiction illustration, no text anywhere", ref: "cover" },
  "page-3": { subject: "The same single white Arctic tern with a black cap, gray wings and red-orange beak gliding with wings held wide and still on a strong wind, long windswept clouds around it above the blue ocean, friendly nonfiction illustration, no text anywhere", ref: "cover" },
  "page-4": { subject: "The same single white Arctic tern with a black cap, gray wings and red-orange beak hovering just above the sea surface with wings raised, about to dive, small silver fish under the clear blue water below it, friendly nonfiction illustration, no text anywhere", ref: "cover" }
};

export const factFindersAsk: LessonDef = {
  id: "fact-finders-ask",
  title: "Fact Finders Ask",
  grade: "2nd Grade",
  standard: "RI.2.1",
  archetype: "inference",
  objective: "I can ask and answer who, what, where, when, why, and how questions about a fact book and prove each answer with the book's exact words.",
  concepts: ["who questions","what questions","where questions","when questions","why questions","how questions","prove answers with the book's words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole fact book, and every fact in it was true. You asked all six questions. Who, what, where, when, why, and how. You pulled every answer straight from the book's exact words, even the tricky why and how ones. That is what fact finders do. Ask it, find it, prove it, every time you read.",
    "title": "You Found Every Fact!",
    "body": "You asked who, what, where, when, why, and how questions about a true fact book, and proved every answer with the book's own words."
  },
  scenes: [
    {
      id: "hook-six-questions",
      purpose: "hook",
      gate: "none",
      prompt: "Six questions unlock any fact book.",
      image: IMG("cover"),
      fx: {"text":"who, what, where, when, **why**, **how**","effect":"pop-words"},
      narration: { audio: A("hook-six-questions"), script: "Hello, fact finder! Fact books are full of true facts, and readers dig those facts out by asking questions. Who? What? Where? When? Why? How? Today you will read a true fact book called The Bird That Chases Summer. It is about a small bird that holds a giant record. You will ask all six questions, and you will pull every answer straight from the book's own words." },
    },
    {
      id: "model-ask-and-cite",
      purpose: "model",
      gate: "none",
      prompt: "Watch me ask, answer, and prove.",
      fx: {"text":"Pull the answer from the **exact words**.","effect":"underline"},
      narration: { audio: A("model-ask-and-cite"), script: "Watch me do it first with a tiny fact book. Listen. A woodpecker taps holes in tree bark. It taps to find bugs to eat. Now I ask a who question: who taps holes? I answer, a woodpecker. The words say, a woodpecker taps holes. There is my proof. Now a why question. Why questions ask for a reason. Why does it tap? The words say, to find bugs to eat. The little word to points right at the reason. Ask the question, then pull the answer from the exact words. That is the whole job." },
    },
    {
      id: "model-how-steps",
      purpose: "model",
      gate: "none",
      prompt: "How questions ask for the steps.",
      fx: {"text":"**How** does it happen? Step by step.","effect":"glow"},
      narration: { audio: A("model-how-steps"), script: "Now the trickiest question word: how. A how question asks the way something really happens, the steps. Another tiny fact book. Listen. A garden spider spins a web. First it builds strong frame threads. Then it adds sticky circles. I ask, how does a spider make a web? The steps are my answer. The words say, first it builds frame threads, then it adds sticky circles. One step, then the next step. That is how you answer a how question about the real world." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: The Arctic tern is a small gray and white seabird. Each fall it leaves the top of the world and flies to the icy south.",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Time to read The Bird That Chases Summer. Page one is all yours. Take your time, sound out the tricky words, and read the whole page out loud." },
      interaction: { type: "speak", text: "The Arctic tern is a small gray and white seabird Each fall it leaves the top of the world and flies to the icy south" },
    },
    {
      id: "check-what",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is an Arctic tern?",
      narration: { audio: A("check-what"), script: "Great reading. First question, a what question. What is an Arctic tern? Page one told you exactly what kind of animal it is. Tap the answer you can prove with the book's words." },
      interaction: { type: "choose", options: [{ id: "gray-white-seabird", label: "a gray and white seabird" }, { id: "big-blue-ocean-fish", label: "a big blue ocean fish" }, { id: "small-furry-snow-fox", label: "a small furry snow fox" }, { id: "tiny-buzzing-bug", label: "a tiny buzzing bug" }], correctId: "gray-white-seabird", coachWrong: "Read page one again in your mind. The very first sentence tells what kind of animal the Arctic tern is. Which words did the book really use?" },
    },
    {
      id: "check-when",
      purpose: "guided",
      gate: "interaction",
      prompt: "When does the tern leave the top of the world?",
      narration: { audio: A("check-when"), script: "Now a when question. When questions ask about time. Page one told you exactly when the tern leaves the top of the world. When does it leave? Tap the book's own words." },
      interaction: { type: "choose", options: [{ id: "each-fall", label: "each fall" }, { id: "each-spring", label: "each spring" }, { id: "in-the-summer", label: "in the summer" }, { id: "on-winter-nights", label: "on winter nights" }], correctId: "each-fall", coachWrong: "A when question asks about time. Picture page one. Which time of year did the book name for the start of the trip?" },
    },
    {
      id: "check-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does the tern fly?",
      narration: { audio: A("check-where"), script: "One more from page one, a where question. Where questions ask about place. The tern leaves the top of the world and flies somewhere far away. Where does it fly? Tap the exact words the book used." },
      interaction: { type: "choose", options: [{ id: "to-the-icy-south", label: "to the icy south" }, { id: "to-a-hot-dry-desert", label: "to a hot dry desert" }, { id: "to-a-big-city-park", label: "to a big city park" }, { id: "to-a-deep-dark-cave", label: "to a deep dark cave" }], correctId: "to-the-icy-south", coachWrong: "A where question asks about place. Read the last words of page one again in your mind. Which place did the book name?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page two. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Page two holds the giant record. Read along with me." },
      interaction: { type: "read-along", text: "This round trip can be more than forty thousand miles. No animal flies farther in a year.", audio: A("page-2-read-sentence") },
    },
    {
      id: "cite-longest",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words prove the tern's trip is the longest?",
      narration: { audio: A("cite-longest"), script: "Fact finders prove what they say. I say the tern's trip is the longest flight in the animal world. Which words from the book prove it? Read every choice, then tap the proof." },
      interaction: { type: "choose", options: [{ id: "no-animal-flies-farther", label: "no animal flies farther" }, { id: "forty-thousand-miles", label: "forty thousand miles" }, { id: "gray-and-white-seabird", label: "gray and white seabird" }, { id: "flies-to-the-icy-south", label: "flies to the icy south" }], correctId: "no-animal-flies-farther", coachWrong: "Proof of a record must beat every other animal. Read each choice and ask yourself, does this compare the tern to all the rest? Only one choice does that job." },
    },
    {
      id: "build-why-question",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the question: Why does the tern fly so far?",
      narration: { audio: A("build-why-question"), script: "Forty thousand miles is a very long way. A fact finder wants the reason, so you will build a why question. Drag the words in order to ask, why does the tern fly so far? The question word goes first, and the question mark goes last." },
      interaction: { type: "sequence", items: [{ id: "does", label: "does" }, { id: "why", label: "Why" }, { id: "fly", label: "fly" }, { id: "the-tern", label: "the tern" }, { id: "so-far", label: "so far" }, { id: "q-mark", label: "?" }], order: ["why","does","the-tern","fly","so-far","q-mark"], coachWrong: "Say the question to yourself: why does the tern fly so far? Drag each word as you say it. The question word goes first, and the question mark goes at the very end." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: The tern flies south because it follows the summer sun and the fish it needs. To save energy, it glides on the wind for miles.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "You asked why, and page three holds the answer. Read page three out loud, and watch for the word because." },
      interaction: { type: "speak", text: "The tern flies south because it follows the summer sun and the fish it needs To save energy it glides on the wind for miles" },
    },
    {
      id: "check-why",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why does the tern fly so far?",
      narration: { audio: A("check-why"), script: "Here is your own question. Why does the tern fly so far? Page three gave the reason, and the word because pointed right at it. Tap the reason you can prove." },
      interaction: { type: "choose", options: [{ id: "to-follow-sun-and-fish", label: "to follow sun and fish" }, { id: "to-race-other-seabirds", label: "to race other seabirds" }, { id: "to-build-a-bigger-nest", label: "to build a bigger nest" }, { id: "to-sleep-all-winter", label: "to sleep all winter" }], correctId: "to-follow-sun-and-fish", coachWrong: "Find the reason. Read the words right after because one more time in your mind. What two things does the tern chase?" },
    },
    {
      id: "check-how-energy",
      purpose: "apply",
      gate: "interaction",
      prompt: "How does the tern save energy?",
      narration: { audio: A("check-how-energy"), script: "Now a how question about a real trick. Such a long flight takes a lot of energy, and page three told you the way the tern saves it. How does the tern save energy? Tap the answer from the book's words." },
      interaction: { type: "choose", options: [{ id: "glides-on-the-wind", label: "it glides on the wind" }, { id: "swims-across-the-sea", label: "it swims across the sea" }, { id: "rides-on-big-ships", label: "it rides on big ships" }, { id: "flaps-as-fast-as-it-can", label: "it flaps as fast as it can" }], correctId: "glides-on-the-wind", coachWrong: "Read the last sentence of page three again in your mind. It starts with, to save energy. What does the book say the tern does?" },
    },
    {
      id: "page-4-read",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: To catch a fish, the tern hovers in the air, then dives into the sea. Scientists learned its path with tiny trackers on its legs.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "One page left, and it is all yours. Read the last page of our fact book out loud." },
      interaction: { type: "speak", text: "To catch a fish the tern hovers in the air then dives into the sea Scientists learned its path with tiny trackers on its legs" },
    },
    {
      id: "check-how-fish",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How does the tern catch a fish?",
      narration: { audio: A("check-how-fish"), script: "Here is the big one, a how question about the steps. How does the tern catch a fish? A how answer tells what happens first and what happens next. Tap the answer you can prove with the book's words." },
      interaction: { type: "choose", options: [{ id: "hovers-then-dives", label: "it hovers, then it dives" }, { id: "waits-on-the-beach", label: "it waits on the beach" }, { id: "scoops-with-its-wings", label: "it scoops with its wings" }, { id: "steals-from-big-birds", label: "it steals from big birds" }], correctId: "hovers-then-dives", coachWrong: "A how answer tells the steps in order. On page four the tern does one thing in the air first, then one thing next. Which choice tells both steps?" },
    },
    {
      id: "check-who",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Who learned the tern's path?",
      narration: { audio: A("check-who"), script: "Almost done, and one question word is left. A who question. Somebody followed the tern's whole path with tiny trackers. Who learned the tern's path? Tap the book's answer." },
      interaction: { type: "choose", options: [{ id: "scientists", label: "scientists" }, { id: "zookeepers", label: "zookeepers" }, { id: "sailors", label: "sailors" }, { id: "teachers", label: "teachers" }], correctId: "scientists", coachWrong: "A who question asks about people. Read the last sentence of page four again in your mind. Which people used the tiny trackers?" },
    },
    {
      id: "speak-how-answer",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: how does the tern catch a fish?",
      narration: { audio: A("speak-how-answer"), script: "Last job, fact finder. Answer a how question out loud. How does the tern catch a fish? Tell me the steps in your own words. Start with, first it." },
      interaction: { type: "speak", text: "hovers hover dives dive dove air sea water fish then" },
    },
    {
      id: "celebrate-fact-finders",
      purpose: "celebrate",
      gate: "none",
      prompt: "You asked it, found it, proved it!",
      fx: {"text":"Ask it. Find it. **Prove it**.","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-finders"), script: "You read a whole fact book, and every fact in it was true. You asked all six questions. Who, what, where, when, why, and how. You pulled every answer straight from the book's exact words, even the tricky why and how ones. That is what fact finders do. Ask it, find it, prove it, every time you read." },
    },
  ],
};
