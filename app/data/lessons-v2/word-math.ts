import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-math-timings.json";

// Word Math (L.2.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-math
// MEANING side of prefixes (RF.2.3d taught the decoding side): known prefix
// meaning + known word meaning = new word meaning. un- = not, re- = again.

const A = (id: string) => `/audio/lessons-v2/word-math/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-math/${w.toLowerCase()}.png`;

export const wordMathImages: Record<string, string> = {
  "sandcastle": "A young girl kneeling on a sunny beach next to a tall sandcastle, a big ocean wave rolling in behind it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "icy-steps": "Stone front steps of a cozy house covered in shiny slippery ice, winter morning, snow resting on the railing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "paint-jars": "Three glass jars holding colorful paintbrushes on a wooden art table, small splashes of paint on the wood. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const wordMath: LessonDef = {
  id: "word-math",
  title: "Word Math",
  grade: "2nd Grade",
  standard: "L.2.4b",
  archetype: "vocabulary",
  objective: "I can figure out a new word by adding the prefix meaning to a word I know.",
  concepts: ["prefixes", "un- means not", "re- means again", "meaning equations"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did the word math every time. Un means not, so unsafe means not safe. Re means again, so rebuild means build again. When a prefix you know snaps onto a word you know, you can figure out the brand new word. Keep doing word math every time you read!",
    "title": "Word Math Master!",
    "body": "You used prefix meanings to solve brand new words: un means not, and re means again."
  },
  scenes: [
    {
      id: "hook-sandcastle-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the sandcastle story with me.",
      image: IMG("sandcastle"),
      narration: { audio: A("hook-sandcastle-story"), script: "Hello, reader. Today you will do word math. A prefix is a small piece that snaps onto the front of a word you know and changes its meaning. Our two pieces today are un and re. Read the story with me and watch for them." },
      interaction: { type: "read-along", text: "Maya built a tall sandcastle by the sea. Then a big wave rolled in and flattened it. \"That was unfair!\" said Maya. \"But I will not give up. I will rebuild my castle before we go home.\"", audio: A("hook-sandcastle-story-sentence") },
    },
    {
      id: "model-un-means-not",
      purpose: "model",
      gate: "none",
      prompt: "Watch me do the word math on unfair.",
      fx: {"text":"un + fair = **not** fair","effect":"pop-words"},
      narration: { audio: A("model-un-means-not"), script: "Look at the word unfair. I see two pieces. Un, and fair. Fair is a word I already know. Un is a prefix, and un means not. Now the word math. Un plus fair equals not fair. The wave was not fair to Maya. When I know the prefix and I know the word, I know the new word too." },
    },
    {
      id: "model-re-means-again",
      purpose: "model",
      gate: "none",
      prompt: "Watch me do the word math on rebuild.",
      fx: {"text":"re + build = build **again**","effect":"magic"},
      narration: { audio: A("model-re-means-again"), script: "Now look at rebuild. Two pieces again. Re, and build. Build is a word I know. The prefix re means again. Do the math with me. Re plus build equals build again. Maya will build her castle again. Two small pieces, two meanings. Un means not. Re means again." },
    },
    {
      id: "guided-choose-unsafe",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does unsafe mean?",
      image: IMG("icy-steps"),
      narration: { audio: A("guided-choose-unsafe"), script: "Your turn. Listen to this sentence. The icy steps are unsafe. Unsafe has two pieces. Un, and safe. Do the word math. Read each card. Tap what unsafe means." },
      interaction: { type: "choose", options: [{ id: "not-safe", label: "not safe" }, { id: "safe-again", label: "safe again" }, { id: "very-safe", label: "very safe" }, { id: "safe-before", label: "safe before" }], correctId: "not-safe", coachWrong: "Break it into pieces. Un, plus safe. Think about what the prefix un means. Try again!" },
    },
    {
      id: "guided-choose-reuse",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does reuse mean?",
      image: IMG("paint-jars"),
      narration: { audio: A("guided-choose-reuse"), script: "Here is a re word. Listen. We can reuse the empty jars to hold our paintbrushes. Reuse. Re, plus use. Do the word math. Read each card. Tap what reuse means." },
      interaction: { type: "choose", options: [{ id: "use-again", label: "use again" }, { id: "not-use", label: "not use" }, { id: "use-before", label: "use before" }, { id: "use-wrongly", label: "use wrongly" }], correctId: "use-again", coachWrong: "Do the math again. Re, plus use. Think about what the prefix re means. Try again!" },
    },
    {
      id: "apply-choose-not-true",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word means not true?",
      narration: { audio: A("apply-choose-not-true"), script: "Now we flip the math. I say the meaning, and you find the word. Which word means not true? Read each word. Break it into its pieces. Tap the word that means not true." },
      interaction: { type: "choose", options: [{ id: "untrue", label: "untrue" }, { id: "retell", label: "retell" }, { id: "rewrite", label: "rewrite" }, { id: "unwrap", label: "unwrap" }], correctId: "untrue", coachWrong: "Read each word again. Find its prefix and its base word, and do the math. Which one comes out to not true? Try again!" },
    },
    {
      id: "apply-speak-refold",
      purpose: "apply",
      gate: "interaction",
      prompt: "Refold. Say what it means.",
      narration: { audio: A("apply-speak-refold"), script: "Here is a brand new word. Refold. Do the word math in your head. Re, plus fold. Tap the mic and tell me what refold means." },
      interaction: { type: "speak", text: "fold again folds" },
    },
    {
      id: "apply-sort-not-again",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by what their prefix means.",
      narration: { audio: A("apply-sort-not-again"), script: "Sorting time. Every word here starts with un or re. Read each word and find its prefix. If the prefix means not, drag that word to Not. If the prefix means again, drag that word to Again." },
      interaction: { type: "sort", buckets: ["Not","Again"], items: [{ label: "untidy", bucket: "Not" }, { label: "rewind", bucket: "Again" }, { label: "unroll", bucket: "Not" }, { label: "replant", bucket: "Again" }, { label: "unwell", bucket: "Not" }, { label: "reheat", bucket: "Again" }], coachWrong: "Read that word again and look at how it starts. Does its prefix mean not, or again? Try again!" },
    },
    {
      id: "apply-choose-unplug-sentence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which sentence uses unplug the right way?",
      narration: { audio: A("apply-choose-unplug-sentence"), script: "Words only make sense when we use them the right way. Here is a new word. Unplug. Un, plus plug. Do the math, then read each sentence. Tap the sentence that uses unplug the right way." },
      interaction: { type: "choose", options: [{ id: "unplug-the-lamp", label: "Dad will unplug the lamp." }, { id: "unplug-a-sandwich", label: "I will unplug my sandwich." }, { id: "unplug-a-nap", label: "She can unplug her nap." }, { id: "unplug-the-rain", label: "We will unplug the rain." }], correctId: "unplug-the-lamp", coachWrong: "Think about what unplug means after the word math. Which sentence talks about something with a plug? Try again!" },
    },
    {
      id: "challenge-choose-misspell",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does misspell mean?",
      narration: { audio: A("challenge-choose-misspell"), script: "Challenge time. A brand new prefix. Mis. The prefix mis means wrongly, in the wrong way. Now a new word all by yourself. What does misspell mean? Read each card. Tap the meaning." },
      interaction: { type: "choose", options: [{ id: "spell-it-wrongly", label: "spell it wrongly" }, { id: "spell-it-again", label: "spell it again" }, { id: "not-spell-it", label: "not spell it" }, { id: "spell-it-first", label: "spell it first" }], correctId: "spell-it-wrongly", coachWrong: "Break misspell into two pieces. Find the prefix, and think about what that piece means. Try again!" },
    },
    {
      id: "challenge-speak-unlocked",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Unlocked. Say what it means.",
      narration: { audio: A("challenge-speak-unlocked"), script: "Last one, and this is all you. Look at the word unlocked. Find the prefix. Find the word you know. Do the word math. Tap the mic and tell me what unlocked means." },
      interaction: { type: "speak", text: "not locked open opened" },
    },
    {
      id: "celebrate-word-math",
      purpose: "celebrate",
      gate: "none",
      prompt: "You did the word math!",
      fx: {"text":"**Word math** every time!","effect":"fireworks"},
      narration: { audio: A("celebrate-word-math"), script: "You did the word math every time. Un means not, so unsafe means not safe. Re means again, so rebuild means build again. When a prefix you know snaps onto a word you know, you can figure out the brand new word. Keep doing word math every time you read!" },
    },
  ],
};
