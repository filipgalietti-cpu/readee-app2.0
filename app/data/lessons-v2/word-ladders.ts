import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-ladders-timings.json";

// Word Ladders (L.2.5b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-ladders
// Shades of meaning: word families climb from weakest to strongest.
// Ladders: pull < tug < yank (verbs), cry < sob < wail (verbs),
// smart < clever < brilliant (adjectives). Anchors verified FRESH vs
// same-and-opposite (glad/happy/thrilled nuance taste), G1 strong-words
// (toss/throw/hurl, tap/knock/pound, damp/wet/soaked, sip/drink/gulp) and
// just-right-words (walk/march/stomp, big/huge/gigantic, talk/whisper/shout).

const A = (id: string) => `/audio/lessons-v2/word-ladders/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-ladders/${w.toLowerCase()}.png`;

export const wordLaddersImages: Record<string, string> = {
  "garden-weed": "A girl with a determined happy face and yellow gardening gloves leaning back and pulling a huge green weed with both hands in a sunny vegetable garden, a few red flowers along the garden edge, plain blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "wooden-ladder": "A sturdy wooden ladder with three wide rungs leaning against a big leafy apple tree, green grass below, plain blue sky, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "robot-helper": "A small friendly silver robot with a round head holding a tiny watering can over a leafy potted plant, a plain blue prize rosette pinned to its chest, plain background, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "dropped-cone": "An ice cream cone tipped over on a sunny sidewalk with one scoop of pink ice cream splatted on the ground beside it, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const wordLadders: LessonDef = {
  id: "word-ladders",
  title: "Word Ladders",
  grade: "2nd Grade",
  standard: "L.2.5b",
  archetype: "vocabulary",
  objective: "I can tell how family words climb from weakest to strongest and pick the one that fits.",
  concepts: ["family words mean almost the same (pull, tug, yank)", "ladders climb weakest to strongest (cry, sob, wail)", "pick the family word that fits the moment", "strong words show more (wailed, brilliant)"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can climb word ladders now. Family words like pull, tug, and yank mean almost the same thing, but they are not the same strength. They climb from weakest to strongest, and good readers pick the word that fits the moment. A stuck drawer needs yank. The loudest cry is a wail. The smartest invention ever is brilliant. Keep climbing word ladders every time you read and write!",
    "title": "Word Ladder Climber!",
    "body": "You ordered word ladders, picked the strongest word for the moment, and spoke like an author."
  },
  scenes: [
    {
      id: "hook-stuck-weed",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the garden story with me.",
      image: IMG("garden-weed"),
      narration: { audio: A("hook-stuck-weed"), script: "Hello, reader. Today you will learn a secret about words. Some words are family. They mean almost the same thing, but some are stronger than others. Read this garden story with me, and watch what Rosa does to each weed." },
      interaction: { type: "read-along", text: "Rosa was weeding the garden. The first weed was small, and she pulled it right out. The next weed was bigger, so she tugged hard with both hands. The last weed was a monster. Rosa grabbed it, dug in her feet, and yanked with all her might. Pop! The weed flew out, and Rosa sat down in the dirt.", audio: A("hook-stuck-weed-sentence") },
    },
    {
      id: "model-pull-ladder",
      purpose: "model",
      gate: "none",
      prompt: "Pull, tug, yank. Same family, different strength.",
      image: IMG("wooden-ladder"),
      narration: { audio: A("model-pull-ladder"), script: "Did you see it? Rosa pulled, then tugged, then yanked. Pull, tug, and yank are one word family. They all mean to pull something. But they are not the same strength. Pull is gentle, like pulling a wagon down the sidewalk. Tug is stronger, like tugging a stuck boot with both hands. Yank is the strongest, one fast, hard pull with all your might. The words climb like the rungs of a ladder. Weak at the bottom, strong at the top. I call that a word ladder." },
    },
    {
      id: "model-cry-ladder",
      purpose: "model",
      gate: "none",
      prompt: "The cry family climbs a ladder too.",
      fx: {"text":"cry, sob, **wail**","effect":"pop-words"},
      narration: { audio: A("model-cry-ladder"), script: "Here is another word ladder. Cry, then sob, then wail. Cry is the smallest, a few quiet tears. Sob is stronger, crying hard with shaky breaths. Wail is the strongest, crying so loud the whole street can hear it. Same family, different strength. Listen one more time, climbing from weakest to strongest. Cry. Sob. Wail." },
    },
    {
      id: "guided-order-cry",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the cry ladder: weakest first, strongest last.",
      narration: { audio: A("guided-order-cry"), script: "Your turn to build a ladder. Drag the words into ladder order. Start with the weakest, a few quiet tears. Finish with the strongest, the loudest cry of all." },
      interaction: { type: "sequence", items: [{ id: "cry", label: "cry" }, { id: "sob", label: "sob" }, { id: "wail", label: "wail" }], order: ["cry","sob","wail"], coachWrong: "Act each word out in your head. Which one is just a few quiet tears? That one goes first. Try again!" },
    },
    {
      id: "guided-choose-yank",
      purpose: "guided",
      gate: "interaction",
      prompt: "Dad ___ the stuck drawer open in one fast, hard move.",
      narration: { audio: A("guided-choose-yank"), script: "Now pick the word that fits the moment. Listen. The kitchen drawer was stuck tight. Dad grabbed the handle and blank the drawer open in one fast, hard move. One fast, hard move needs the strongest word in the pull family. Read each word. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "yanked", label: "yanked" }, { id: "tugged", label: "tugged" }, { id: "pulled", label: "pulled" }, { id: "held", label: "held" }], correctId: "yanked", coachWrong: "Think about how much power one fast, hard move takes. Which word has the most power in it? Try again!" },
    },
    {
      id: "model-smart-ladder",
      purpose: "model",
      gate: "none",
      prompt: "Describing words climb ladders too.",
      fx: {"text":"smart, clever, **brilliant**","effect":"pop-words"},
      narration: { audio: A("model-smart-ladder"), script: "Word ladders are not just for action words. Describing words climb too. Smart, clever, brilliant. Smart means you know a lot. Clever is stronger, smart in a quick, tricky way. Brilliant is the strongest, so smart it almost shines. A dog that sits is smart. A dog that opens the gate is clever. A dog that opens the gate, hides the latch, and waits by the food bowl is brilliant." },
    },
    {
      id: "guided-choose-brilliant",
      purpose: "guided",
      gate: "interaction",
      prompt: "The judges had never seen a smarter invention. It was ___.",
      image: IMG("robot-helper"),
      narration: { audio: A("guided-choose-brilliant"), script: "Rosa from the garden loves to build things too. She built a robot that waters plants, pulls weeds, and feeds her cat. At the science fair, the judges said they had never seen a smarter invention. That moment needs the very top of the smart ladder. Read each word. Tap the strongest one." },
      interaction: { type: "choose", options: [{ id: "brilliant", label: "brilliant" }, { id: "clever", label: "clever" }, { id: "smart", label: "smart" }, { id: "careful", label: "careful" }], correctId: "brilliant", coachWrong: "That word fits, but the judges had never seen anything smarter. Climb all the way to the top of the ladder. Try again!" },
    },
    {
      id: "apply-sort-families",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word into its family.",
      narration: { audio: A("apply-sort-families"), script: "Sorting time. Every word here is a way to pull or a way to cry. Read each word, act it out in your head, and drag it to its family." },
      interaction: { type: "sort", buckets: ["Pull Family","Cry Family"], items: [{ label: "tug", bucket: "Pull Family" }, { label: "sob", bucket: "Cry Family" }, { label: "yank", bucket: "Pull Family" }, { label: "whimper", bucket: "Cry Family" }, { label: "haul", bucket: "Pull Family" }, { label: "wail", bucket: "Cry Family" }], coachWrong: "Read that word again and act it out. Is it a way to pull something, or a way to cry? Try again!" },
    },
    {
      id: "apply-precision-wailed",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does wailed show that cried does not?",
      image: IMG("dropped-cone"),
      narration: { audio: A("apply-precision-wailed"), script: "Authors pick strong words on purpose. Listen to this sentence from a story. The baby wailed when his ice cream hit the sidewalk. The author could have written cried, but she picked wailed. What does wailed show you that cried does not? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "loudest-crying", label: "the loudest, biggest crying" }, { id: "few-quiet-tears", label: "a few quiet tears" }, { id: "stopped-crying", label: "the baby stopped crying" }, { id: "fell-asleep", label: "the baby fell asleep" }], correctId: "loudest-crying", coachWrong: "Think about where wail sits on the cry ladder, near the bottom or at the very top? Try again!" },
    },
    {
      id: "apply-order-pull",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the pull ladder: weakest first, strongest last.",
      narration: { audio: A("apply-order-pull"), script: "One more ladder to build, and this one is from Rosa's garden. Every one of these words comes from the pull family. Drag them into ladder order, from the gentlest pull to the strongest pull of all." },
      interaction: { type: "sequence", items: [{ id: "pull", label: "pull" }, { id: "tug", label: "tug" }, { id: "yank", label: "yank" }], order: ["pull","tug","yank"], coachWrong: "Picture each one. A wagon, a stuck boot, a monster weed. Gentlest goes first. Try again!" },
    },
    {
      id: "challenge-speak-strongest",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the strongest word in the cry family.",
      narration: { audio: A("challenge-speak-strongest"), script: "Challenge time, and this is all you. Think about the cry family. Cry, wail, sob. One of those words is the very strongest, the loudest cry of all. Tap the mic and say the strongest word in the family." },
      interaction: { type: "speak", text: "wail wails wailed wailing" },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Use yank in a sentence of your own.",
      narration: { audio: A("challenge-speak-sentence"), script: "Last one. Yank means the strongest, fastest pull there is. Make up your own sentence with yank or yanked, and say the whole sentence out loud. Tap the mic and tell me your sentence." },
      interaction: { type: "speak", text: "yank yanks yanked yanking" },
    },
    {
      id: "celebrate-word-ladders",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can climb word ladders!",
      fx: {"text":"pull, tug, **yank!**","effect":"fireworks"},
      narration: { audio: A("celebrate-word-ladders"), script: "You can climb word ladders now. Pull, tug, yank. Cry, sob, wail. Smart, clever, brilliant. Family words mean almost the same thing, but they climb from weak to strong. When you read, notice the strong words authors pick. And when you tell a story, do not just say pulled. Say yanked, and let your words climb!" },
    },
  ],
};
