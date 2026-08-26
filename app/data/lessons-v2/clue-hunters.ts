import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./clue-hunters-timings.json";

// Clue Hunters (L.2.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=clue-hunters

const A = (id: string) => `/audio/lessons-v2/clue-hunters/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/clue-hunters/${w.toLowerCase()}.png`;

export const clueHuntersImages: Record<string, string> = {
  "detective-hat": "A child-sized brown detective hat next to a large magnifying glass on a wooden desk, soft golden sparkles around the lens. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "cottage": "A small cozy cottage with a bright red door in a green forest clearing, smoke curling from a stone chimney, flowers along the path. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "soup": "A hungry boy at a kitchen table eagerly eating from a big steaming bowl of soup, two empty bowls stacked beside him, spoon raised. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "quiet-girl": "A calm girl sitting peacefully under a shady tree reading a book, while far behind her a boy loudly bangs a drum and shouts. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "wooden-table": "A thick strong wooden table holding a tall stack of heavy books, its four legs solid and steady on the floor. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const clueHunters: LessonDef = {
  id: "clue-hunters",
  title: "Clue Hunters",
  grade: "2nd Grade",
  standard: "L.2.4a",
  archetype: "vocabulary",
  objective: "I can use sentence clues to figure out a new word, and name the kind of clue.",
  concepts: ["definition clue","example clue","contrast clue"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, clue hunter! You cracked cottage, ravenous, tranquil, mend, and sturdy. Definition clues explain the word, example clues show it in action, and contrast clues tell what it is not. Hunt for clues every time you read!",
    "title": "Super Clue Hunter!",
    "body": "You solved five words and named all three kinds of clues."
  },
  scenes: [
    {
      id: "intro-hook",
      purpose: "hook",
      gate: "none",
      prompt: "Today we hunt for word clues.",
      image: IMG("detective-hat"),
      fx: {"text":"Sentences hide **clues**.","effect":"pop-words"},
      narration: { audio: A("intro-hook"), script: "Hello, clue hunter. When you meet a new word, the sentence around it hides a clue to the meaning. Today you will learn the three kinds of clues. A definition clue explains the word right there. An example clue shows the word in action. A contrast clue tells you what the word is not. Let's hunt." },
    },
    {
      id: "model-definition",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use a definition clue.",
      image: IMG("cottage"),
      fx: {"text":"The cottage, **a small cozy house in the woods**, had a red door.","effect":"underline"},
      narration: { audio: A("model-definition"), script: "Clue type one, the definition clue. Listen to this sentence. The cottage, a small cozy house in the woods, had a red door. Cottage might be new to you. But look, the sentence stops and explains it right there. A small cozy house in the woods. That is the definition, sitting inside the sentence. So a cottage is a small cozy house. Definition clue, found." },
    },
    {
      id: "model-example",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use an example clue.",
      image: IMG("soup"),
      fx: {"text":"Ravenous, the boy **ate three bowls of soup and asked for more**.","effect":"underline"},
      narration: { audio: A("model-example"), script: "Clue type two, the example clue. Listen. Ravenous, the boy ate three bowls of soup and asked for more. The sentence does not tell me what ravenous means. It shows me. He ate three bowls of soup. He asked for more. Those examples show a boy who is very, very hungry. So ravenous means very hungry. Example clue, found." },
    },
    {
      id: "model-contrast",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use a contrast clue.",
      image: IMG("quiet-girl"),
      fx: {"text":"**Unlike her noisy brother**, Lena was tranquil.","effect":"underline"},
      narration: { audio: A("model-contrast"), script: "Clue type three, the contrast clue. Listen. Unlike her noisy brother, Lena was tranquil. The word unlike is my signal. Lena is not like her noisy brother. So tranquil must be the opposite of noisy. That tells me tranquil means calm and quiet. Contrast clue, found." },
    },
    {
      id: "guided-mend-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does mend mean?",
      narration: { audio: A("guided-mend-meaning"), script: "Your turn, clue hunter. Listen to this sentence. Grandma will mend the torn sock. She will sew up the hole so it is good as new. Mend is the new word. Use the clue in the sentence. Read each card. Tap what mend means." },
      interaction: { type: "choose", options: [{ id: "to-fix", label: "to fix" }, { id: "to-tear", label: "to tear" }, { id: "to-wash", label: "to wash" }, { id: "to-hide", label: "to hide" }], correctId: "to-fix", coachWrong: "Think about the clue. Grandma will sew up the hole. What does sewing up a hole do to a sock? Try again!" },
    },
    {
      id: "guided-mend-clue-type",
      purpose: "guided",
      gate: "interaction",
      prompt: "What kind of clue helped you?",
      narration: { audio: A("guided-mend-clue-type"), script: "You solved it. Mend means to fix. Now name that clue. Think about how the sentence helped you find the meaning. Read each card. Tap the kind of clue the sentence used." },
      interaction: { type: "choose", options: [{ id: "definition-clue", label: "definition clue" }, { id: "example-clue", label: "example clue" }, { id: "contrast-clue", label: "contrast clue" }], correctId: "definition-clue", coachWrong: "Think back. Did the sentence give examples, tell an opposite, or explain the meaning right there in the sentence? Try again!" },
    },
    {
      id: "apply-sort-clue-types",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the clue cards.",
      narration: { audio: A("apply-sort-clue-types"), script: "Real clue hunters can name every kind of clue. Here are four new clue cards. Read each card and think about how it helps you. Then drag each card to Definition, Example, or Contrast." },
      interaction: { type: "sort", buckets: ["Definition","Example","Contrast"], items: [{ label: "A cottage is a small house.", bucket: "Definition" }, { label: "Ravenous, he ate five rolls.", bucket: "Example" }, { label: "Jo was tranquil, not noisy.", bucket: "Contrast" }, { label: "Mend means to fix things.", bucket: "Definition" }], coachWrong: "Reread that card. Does it explain the word, show it in action, or tell what it is not? Try again!" },
    },
    {
      id: "apply-sturdy-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: The sturdy table held the heavy books without wobbling.",
      image: IMG("wooden-table"),
      narration: { audio: A("apply-sturdy-read"), script: "Time to read out loud, clue hunter. This sentence holds the new word sturdy. Tap the mic and read the sentence in a big clear voice." },
      interaction: { type: "speak", text: "The sturdy table held the heavy books without wobbling" },
    },
    {
      id: "apply-sturdy-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what sturdy means.",
      narration: { audio: A("apply-sturdy-meaning"), script: "You read, the sturdy table held the heavy books without wobbling. The heavy books did not make it shake. Those examples are your clue. What does sturdy mean? Tap the mic and say the meaning in your own words." },
      interaction: { type: "speak", text: "strong solid tough stable" },
    },
    {
      id: "challenge-tranquil-meaning",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does tranquil mean here?",
      narration: { audio: A("challenge-tranquil-meaning"), script: "Last case, clue hunter, and it is a tough one. Listen. Unlike the loud, busy city, the little village was tranquil. Find the clue and test it. Read each card. Tap what tranquil means in this sentence." },
      interaction: { type: "choose", options: [{ id: "calm-and-peaceful", label: "calm and peaceful" }, { id: "loud-and-noisy", label: "loud and noisy" }, { id: "busy-and-crowded", label: "busy and crowded" }, { id: "far-and-hidden", label: "far and hidden" }], correctId: "calm-and-peaceful", coachWrong: "The word unlike is the signal. The city is loud and busy, and the village is not like the city at all. Try again!" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a super clue hunter!",
      fx: {"text":"**Clue hunter**, case closed!","effect":"fireworks"},
      narration: { audio: A("celebrate-success"), script: "You did it, clue hunter! You cracked cottage, ravenous, tranquil, mend, and sturdy. Definition clues explain the word, example clues show it in action, and contrast clues tell what it is not. Hunt for clues every time you read!" },
    },
  ],
};
