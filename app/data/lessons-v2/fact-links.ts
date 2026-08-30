import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-links-timings.json";

// Fact Links (RI.1.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-links

const A = (id: string) => `/audio/lessons-v2/fact-links/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-links/${w.toLowerCase()}.png`;

export const factLinksImages: Record<string, string | { subject: string; ref?: string }> = {
  "beaver": "A brown beaver sitting on a stream bank beside green grass, wide flat tail and two big front teeth showing, friendly nonfiction illustration, the beaver looks and acts like a real beaver, no clothing, no text anywhere",
  "beaver-dam": { subject: "A brown beaver piling sticks onto a stick dam across a small stream, water held back behind the sticks, the beaver looks like a real beaver, no clothing, no text anywhere", ref: "beaver" },
  "beaver-swim": { subject: "A brown beaver swimming in clear blue water, wide flat tail stretched out behind it and webbed back feet paddling, seen from the side, no clothing, no text anywhere", ref: "beaver" },
  "beaver-pond": { subject: "A wide calm pond ringed by green trees with a brown beaver swimming in the middle, plain water and sky, no clothing, no text anywhere", ref: "beaver" }
};

export const factLinks: LessonDef = {
  id: "fact-links",
  title: "Fact Links",
  grade: "1st Grade",
  standard: "RI.1.3",
  archetype: "inference",
  objective: "I can tell how two facts in a book link together.",
  concepts: ["cause and effect","first and next","same job","link words so and because"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a link finder you are! You found cause and effect, first and next, and same job links in a true beaver book. Keep asking how facts fit together every time you read!",
    "title": "You Found the Links!",
    "body": "You linked the facts in a real beaver book, from strong teeth all the way to a brand new pond."
  },
  scenes: [
    {
      id: "hook-meet-the-beaver",
      purpose: "hook",
      gate: "none",
      prompt: "Let's read true beaver facts!",
      image: IMG("beaver"),
      narration: { audio: A("hook-meet-the-beaver"), script: "Hello, reader! Today we open a fact book about beavers, and every fact in it is true. Fact books hide little links between their facts. One fact can make another fact happen. Facts can come first and next, like steps. Two things can even do the same job. Today you will find every kind of link." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our fact book. Read along with me, and watch for one small glue word." },
      interaction: { type: "read-along", text: "A beaver has strong front teeth, so it can cut down small trees. It cuts the trees into sticks.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-so-link",
      purpose: "model",
      gate: "none",
      prompt: "One fact makes another happen.",
      fx: {"text":"Strong teeth, **so** it can cut trees.","effect":"glow"},
      narration: { audio: A("model-so-link"), script: "Watch me find a link. Page one says the beaver has strong front teeth, so it can cut down small trees. There is the glue word. So! The strong teeth make the tree cutting happen. When one fact makes another fact happen, that link is called cause and effect. The words so and because point right at it." },
    },
    {
      id: "apply-read-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two with me.",
      image: IMG("beaver-dam"),
      narration: { audio: A("apply-read-page-two"), script: "Page two tells what the beaver does with all those sticks. Read it with me, and look for words that tell the order." },
      interaction: { type: "read-along", text: "First the beaver drags the sticks to the stream. Next it piles them up into a dam. The dam blocks the stream, so a pond forms.", audio: A("apply-read-page-two-sentence") },
    },
    {
      id: "model-first-next",
      purpose: "model",
      gate: "none",
      prompt: "Order words link facts.",
      fx: {"text":"**First** it drags. **Next** it piles.","effect":"pop-words"},
      narration: { audio: A("model-first-next"), script: "Page two used two order words. First the beaver drags the sticks to the stream. Next it piles them up into a dam. First and next link the facts like steps on a ladder. That link is called first and next. It tells the order the jobs happen." },
    },
    {
      id: "guided-sequence-chain",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the pond chain in order.",
      narration: { audio: A("guided-sequence-chain"), script: "Now you build the chain! Page two told us how a pond forms, step by step. Drag the cards in order. What happened first, next, and last?" },
      interaction: { type: "sequence", items: [{ id: "drags-sticks", label: "Drags sticks to the stream" }, { id: "piles-a-dam", label: "Piles sticks into a dam" }, { id: "dam-blocks", label: "The dam blocks the stream" }, { id: "pond-forms", label: "A pond forms" }], order: ["drags-sticks","piles-a-dam","dam-blocks","pond-forms"], coachWrong: "Say page two in your head. The beaver must finish one step before the next step can start. Try again!" },
    },
    {
      id: "guided-find-link-word",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the link word.",
      fx: {"text":"The dam blocks the stream, so a pond forms.","effect":"underline"},
      narration: { audio: A("guided-find-link-word"), script: "You built the chain! Now find the glue. Read this line from page two. One small word links the blocked stream to the brand new pond. Tap that link word." },
      interaction: { type: "choose", options: [{ id: "so", label: "so" }, { id: "dam", label: "dam" }, { id: "pond", label: "pond" }], correctId: "so", coachWrong: "Ask yourself, which word tells you the blocked stream made the pond happen? Try again!" },
    },
    {
      id: "apply-name-link-chick",
      purpose: "apply",
      gate: "interaction",
      prompt: "What kind of link is this?",
      fx: {"text":"**First** a chick pecks the egg. **Next** it pops out.","effect":"glow"},
      narration: { audio: A("apply-name-link-chick"), script: "Here are two new true facts about a baby chick. First a chick pecks the egg. Next it pops out. What kind of link joins these two facts? Tap it." },
      interaction: { type: "choose", options: [{ id: "first-and-next", label: "first and next" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "same-job", label: "same job" }], correctId: "first-and-next", coachWrong: "Look at the first word of each fact. What do those words tell you? Try again!" },
    },
    {
      id: "apply-speak-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three aloud: A flat tail and webbed feet both help the beaver swim.",
      image: IMG("beaver-swim"),
      narration: { audio: A("apply-speak-page-three"), script: "Page three is short, and it is all yours. Tap the mic and read page three out loud." },
      interaction: { type: "speak", text: "A flat tail and webbed feet both help the beaver swim" },
    },
    {
      id: "model-same-job",
      purpose: "model",
      gate: "none",
      prompt: "Two things, one job.",
      fx: {"text":"Tail and feet **both** help it swim.","effect":"glow"},
      narration: { audio: A("model-same-job"), script: "Page three hides one more link. A flat tail helps the beaver swim. Webbed feet help the beaver swim too. The word both is the clue. The tail and the feet do the same job! When two things do the same job, that link is called same job." },
    },
    {
      id: "apply-name-link-bird",
      purpose: "apply",
      gate: "interaction",
      prompt: "What kind of link is this?",
      fx: {"text":"Wings help a bird fly. Light bones help it fly too.","effect":"underline"},
      narration: { audio: A("apply-name-link-bird"), script: "New facts, new link! Wings help a bird fly. Light bones help the bird fly too. What kind of link joins the wings and the bones? Tap it." },
      interaction: { type: "choose", options: [{ id: "same-job", label: "same job" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "first-and-next", label: "first and next" }], correctId: "same-job", coachWrong: "Think about what the wings do and what the light bones do. Is it one job or two different jobs? Try again!" },
    },
    {
      id: "challenge-name-link-lodge",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Name the link.",
      fx: {"text":"The lodge door hides under the water. A fox cannot get in.","effect":"underline"},
      narration: { audio: A("challenge-name-link-lodge"), script: "Challenge time! A beaver sleeps in a home called a lodge. Here are two new true facts. The lodge door hides under the water. A fox cannot get in. What kind of link joins these facts? Tap it." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "first-and-next", label: "first and next" }, { id: "same-job", label: "same job" }], correctId: "cause-and-effect", coachWrong: "Read the facts again. Does one fact make the other happen, do they tell an order, or do two things share a job? Try again!" },
    },
    {
      id: "challenge-speak-why",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: Why does a pond form?",
      image: IMG("beaver-pond"),
      narration: { audio: A("challenge-speak-why"), script: "Last challenge! Think back to our fact book. Why does a pond form at the beaver's home? Tap the mic and say the link out loud." },
      interaction: { type: "speak", text: "dam blocks blocked stream sticks" },
    },
    {
      id: "celebrate-fact-links",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the fact links!",
      fx: {"text":"You found the **fact links**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-links"), script: "You did it! You found the links in our beaver book. So and because show that one fact makes another happen. First and next show the order. And two things can do the same job, just like the tail and the feet. Keep finding links every time you read!" },
    },
  ],
};
