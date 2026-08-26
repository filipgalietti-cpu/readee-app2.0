import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./picture-or-words-timings.json";

// Picture or Words (RI.1.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=picture-or-words

const A = (id: string) => `/audio/lessons-v2/picture-or-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/picture-or-words/${w.toLowerCase()}.png`;

export const pictureOrWordsImages: Record<string, string | { subject: string; ref?: string }> = {
  "octopus-reef": "A friendly reddish-orange octopus with big round eyes hiding inside a crack between colorful coral, most of its soft body tucked into the rocky coral crevice with only its head and two arms peeking out, and one small yellow and blue striped fish swimming in the clear blue water above its head. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "octopus-arms": { subject: "The same friendly reddish-orange octopus floating in clear blue water with exactly eight arms, four arms spread out on the left side and four arms spread out on the right side, every single arm fully visible and separated so a child can count all eight, no arm hidden or overlapping, one arm curled around a small shiny white seashell, holding it up. No letters, no words, no numbers, no writing anywhere.", ref: "octopus-reef" },
  "octopus-ink": { subject: "The same friendly reddish-orange octopus jetting away through clear blue water, a big cloud of dark black ink swirling behind it, and one small red crab standing on the sandy sea floor below, looking up at the ink cloud. No letters, no words, no numbers, no writing anywhere.", ref: "octopus-arms" },
  "octopus-camouflage": { subject: "The same friendly octopus sitting on one big brown rock with green speckles, half of the octopus's body turned the same brown color with green speckles as the rock so that half blends into the rock, the other half still bright reddish-orange. No letters, no words, no numbers, no writing anywhere.", ref: "octopus-ink" },
};

export const pictureOrWords: LessonDef = {
  id: "picture-or-words",
  title: "Picture or Words",
  grade: "1st Grade",
  standard: "RI.1.6",
  archetype: "inference",
  objective: "I can tell if a fact came from the words or the picture.",
  concepts: ["words teach some facts","pictures teach other facts","some facts come from both"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a fact detective you are! Now you know that every page has two teachers. The words teach some facts, the picture teaches others, and some facts come from both. When you read a fact book, ask yourself: which teacher taught me that?",
    "title": "Fact Detective!",
    "body": "You can tell which facts came from the words and which came from the picture."
  },
  scenes: [
    {
      id: "hook-two-teachers",
      purpose: "hook",
      gate: "none",
      prompt: "Every page has two teachers.",
      fx: {"text":"The **words** teach. The **picture** teaches.","effect":"pop-words"},
      narration: { audio: A("hook-two-teachers"), script: "Hello, fact detective! Today we open a fact book about the octopus. Every page has two teachers. The words teach you some facts. The picture teaches you other facts. Your detective job: figure out which teacher taught you each fact." },
    },
    {
      id: "model-page-one",
      purpose: "model",
      gate: "none",
      prompt: "Which teacher taught each fact?",
      image: IMG("octopus-reef"),
      narration: { audio: A("model-page-one"), script: "Watch me be a detective on page one. The words on this page say: An octopus lives in the ocean. That fact came from the words. Now I look at the picture. I see something the words never said. The octopus is hiding in a crack in the coral. The words did not say that. The picture taught me that fact all by itself." },
    },
    {
      id: "guided-coral-fact",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which teacher taught you this fact?",
      image: IMG("octopus-reef"),
      narration: { audio: A("guided-coral-fact"), script: "Your turn, detective. Here is a fact: the octopus is hiding in the coral. Which teacher taught you that fact? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-picture", label: "the picture" }, { id: "the-words", label: "the words" }], correctId: "the-picture", coachWrong: "Say the page words in your head: an octopus lives in the ocean. Now look at where the octopus is tucked in. Which teacher showed you the coral? Try again!" },
    },
    {
      id: "guided-read-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two aloud: An octopus has eight arms.",
      image: IMG("octopus-arms"),
      narration: { audio: A("guided-read-page-two"), script: "Time for page two. This page is short, and it is all yours. Tap the mic and read page two out loud, nice and clear." },
      interaction: { type: "speak", text: "An octopus has eight arms" },
    },
    {
      id: "guided-shell-fact",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which teacher taught you this fact?",
      image: IMG("octopus-arms"),
      narration: { audio: A("guided-shell-fact"), script: "You read page two yourself. Now here is a fact: the octopus is holding a shell. Which teacher taught you that fact? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-picture", label: "the picture" }, { id: "the-words", label: "the words" }, { id: "both-teachers", label: "both teachers" }], correctId: "the-picture", coachWrong: "Think hard. Did the words of page two say anything about a shell? Now look at what one arm is holding. Try again!" },
    },
    {
      id: "apply-arms-fact",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which teacher taught you this fact?",
      image: IMG("octopus-arms"),
      narration: { audio: A("apply-arms-fact"), script: "One more fact from page two: an octopus has eight arms. Careful, this one is tricky. Think about the words you read. Then count the arms in the picture. Which teacher taught you that fact? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "both-teachers", label: "both teachers" }, { id: "the-words", label: "the words" }, { id: "the-picture", label: "the picture" }], correctId: "both-teachers", coachWrong: "Did the words say eight arms? Now count the arms in the picture too. Maybe more than one teacher taught this fact. Try again!" },
    },
    {
      id: "apply-read-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three.",
      image: IMG("octopus-ink"),
      narration: { audio: A("apply-read-page-three"), script: "Turn to page three, detective. Read the words, and keep your eyes on the picture too. The picture is teaching facts of its own." },
      interaction: { type: "read-along", text: "An octopus squirts ink when it is scared. The ink is made inside its body.", audio: A("apply-read-page-three-sentence") },
    },
    {
      id: "apply-sort-teachers",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which teacher taught each fact?",
      narration: { audio: A("apply-sort-teachers"), script: "Now sort like a detective. The words on page three said: an octopus squirts ink when it is scared, and the ink is made inside its body. Think back to the picture too. Read each fact card. Drag it to the teacher that taught it." },
      interaction: { type: "sort", buckets: ["Words","Picture"], items: [{ label: "it squirts when scared", bucket: "Words" }, { label: "the ink is dark", bucket: "Picture" }, { label: "ink is made in its body", bucket: "Words" }, { label: "a crab watches it", bucket: "Picture" }], coachWrong: "Which teacher gave you that fact? If the words said it, it goes to Words. If you only saw it, it goes to Picture. Try again!" },
    },
    {
      id: "challenge-rock-fact",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which fact did only the picture teach?",
      image: IMG("octopus-camouflage"),
      narration: { audio: A("challenge-rock-fact"), script: "Last page, detective. I will read it to you. The words say: An octopus can change color. This helps it hide. Now look closely at the picture. One fact on these cards came only from the picture. Read each card. Tap the picture-only fact." },
      interaction: { type: "choose", options: [{ id: "match-a-rock", label: "it can match a rock" }, { id: "change-color", label: "it can change color" }, { id: "helps-it-hide", label: "this helps it hide" }], correctId: "match-a-rock", coachWrong: "Say the page words in your head one more time. Two of these cards are facts the words already said. Find the fact you can only see. Try again!" },
    },
    {
      id: "challenge-name-the-fish",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Name the picture-only fact!",
      image: IMG("octopus-reef"),
      narration: { audio: A("challenge-name-the-fish"), script: "Back to page one for your last detective job. The words said: an octopus lives in the ocean. But look above the octopus. Something small is swimming there, and the words never named it. Tap the mic and say what it is." },
      interaction: { type: "speak", text: "fish fishes" },
    },
    {
      id: "celebrate-fact-detective",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Fact Detective!",
      fx: {"text":"You are a **Fact Detective**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-detective"), script: "You did it, fact detective! The words taught you that an octopus lives in the ocean and squirts ink. The pictures taught you about the coral, the shell, and the rock. Words teach some facts, pictures teach others, and some facts come from both. Keep asking: which teacher taught me that?" },
    },
  ],
};
