import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-poem-party-timings.json";

// Story & Poem Party (RL.1.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=story-poem-party

const A = (id: string) => `/audio/lessons-v2/story-poem-party/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-poem-party/${w.toLowerCase()}.png`;

export const storyPoemPartyImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover showing a small round brown baby owl with big worried eyes sitting on a tree branch at night, one tiny glowing yellow firefly light far away in the dark blue starry sky, framed like the cover of a picture book, no text anywhere",
  "page-1": { subject: "The same small round brown baby owl huddled low in a twig nest on a tree branch, wings pulled in tight, big worried eyes, surrounded by a very dark navy blue nighttime sky filling the whole background with a few tiny stars, deep night darkness all around", ref: "cover" },
  "page-2": { subject: "The same small round brown baby owl peeking up with surprised happy eyes at a tiny smiling firefly glowing warm yellow right beside the tree branch, dark blue night sky behind them", ref: "page-1" },
  "page-3": { subject: "Exactly one small round brown baby owl, the same owl, sitting on a tree branch with only the tiny glowing yellow firefly hovering beside it, no other owls or birds, both smiling and looking up at a big bright white moon and sparkling stars in the dark blue night sky", ref: "page-2" },
  "night-sky": "A peaceful night meadow under a big round white moon and sparkling stars, a few tiny glowing yellow fireflies floating over dark green grass, soft blue and purple colors, no people, no text anywhere"
};

export const storyPoemParty: LessonDef = {
  id: "story-poem-party",
  title: "Story & Poem Party",
  grade: "1st Grade",
  standard: "RL.1.10",
  archetype: "fluency",
  objective: "I can read a whole story and a whole poem like a grade one reader.",
  concepts: ["predict from the title","read story pages out loud","check how a character feels and why","find rhymes and sense words in a poem","compare a story and a poem","retell in order"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a party! You read a whole story about Ollie the owl and a whole poem about the night. You predicted, you checked feelings, you found rhymes and sense words, and you retold it all in order. You used every reading skill you have. You are a real grade one reader!",
    "title": "You Are a Real Reader!",
    "body": "You read a whole story and a whole poem, and you used every reading skill along the way."
  },
  scenes: [
    {
      id: "hook-party",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Welcome to the Story & Poem Party!",
      fx: {"text":"Welcome to the **Story & Poem Party**!","effect":"balloon"},
      narration: { audio: A("hook-party"), script: "Hello, reader! Today is a big day. It is a reading party, and you are the star. You will read a whole story and a whole poem, all the way to the end. You will use every reading skill you have. Ready? Let's start the party!" },
    },
    {
      id: "predict-title",
      purpose: "guided",
      gate: "interaction",
      prompt: "What do you think Ollie will find?",
      image: IMG("cover"),
      narration: { audio: A("predict-title"), script: "Before we read, good readers predict. That means you make a smart guess. Our story is called Ollie and the Little Light. Look at the cover. What do you think Ollie will find in this story? Read each choice, then tap your best guess." },
      interaction: { type: "choose", options: [{ id: "a-light-in-the-dark", label: "a light in the dark" }, { id: "a-day-at-the-pool", label: "a day at the pool" }, { id: "a-big-yellow-bus", label: "a big yellow bus" }], correctId: "a-light-in-the-dark", coachWrong: "A prediction uses clues. Read the title of the story one more time, and look at the cover. Then tap your new best guess." },
    },
    {
      id: "story-page-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one: Ollie was a small owl. He was so scared of the dark.",
      image: IMG("page-1"),
      narration: { audio: A("story-page-1"), script: "Time to read! Here is page one of our story, and it is all yours. Look at the words, take a breath, then tap the mic and read the page out loud." },
      interaction: { type: "speak", text: "Ollie was a small owl He was so scared of the dark" },
    },
    {
      id: "check-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "How did Ollie feel about the dark?",
      narration: { audio: A("check-feeling"), script: "Check-in time. Think about page one, the page you just read. How did Ollie feel about the dark? Read each word, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "scared", label: "scared" }, { id: "glad", label: "glad" }, { id: "sleepy", label: "sleepy" }], correctId: "scared", coachWrong: "Think back to page one. It told us just how Ollie felt about the dark. Tap the word the story used." },
    },
    {
      id: "story-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page two. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("story-page-2"), script: "Poor Ollie. But wait, something is coming. Here is page two. Read along with me!" },
      interaction: { type: "read-along", text: "One night, a small light blinked by his tree. It was Fern the firefly!", audio: A("story-page-2-sentence") },
    },
    {
      id: "story-page-3",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three: Fern showed Ollie the moon and the stars. Now Ollie loves the bright night.",
      image: IMG("page-3"),
      narration: { audio: A("story-page-3"), script: "A firefly friend! What will Fern do? Page three is the last page, and it is yours to read. Tap the mic and read it out loud in your best reading voice." },
      interaction: { type: "speak", text: "Fern showed Ollie the moon and the stars Now Ollie loves the bright night" },
    },
    {
      id: "check-why",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why does Ollie love the night now?",
      narration: { audio: A("check-why"), script: "Big thinking time. At the start, Ollie was scared of the dark. At the end, he loves the night. Why did Ollie change? Read each choice, then tap the reason." },
      interaction: { type: "choose", options: [{ id: "fern-showed-the-lights", label: "Fern showed him the lights." }, { id: "the-sun-came-back-up", label: "The sun came back up." }, { id: "ollie-got-a-warm-hat", label: "Ollie got a warm hat." }], correctId: "fern-showed-the-lights", coachWrong: "Read the choices again. Think about what happened on page three, right before Ollie loved the night. Tap what really happened." },
    },
    {
      id: "poem-read-along",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Now a poem! Read along with me.",
      narration: { audio: A("poem-read-along"), script: "A reading party needs a poem too! Our poem is called Good Night, Bright Night. It is about the night, just like Ollie's story. Read along with me, and listen for words that match at the ends of the lines." },
      interaction: { type: "read-along", text: "The sun dips down. The day is done. The stars wink on, one by one. The cool wind hums a low, sweet tune. Crickets sing to the round white moon. Little lights blink far and near.", audio: A("poem-read-along-sentence") },
    },
    {
      id: "poem-rhyme-find",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the word that rhymes with tune.",
      narration: { audio: A("poem-rhyme-find"), script: "Poems play with sound. Rhyming words end with the same sound, like night and bright. Here is a line from our poem. Read it to yourself. Tap the word that rhymes with tune." },
      interaction: { type: "highlight", text: "Crickets sing to the round white moon.", targets: ["moon"], coachWrong: "Say tune out loud. Now say each word in the line. Tap the word that ends with the same sound as tune." },
    },
    {
      id: "poem-sense-find",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the word that tells how the wind feels.",
      narration: { audio: A("poem-sense-find"), script: "Poets also pick words for your senses. Here is another line from our poem. Read it to yourself. One word tells how the wind would feel on your skin. Tap it." },
      interaction: { type: "highlight", text: "The cool wind hums a low, sweet tune.", targets: ["cool"], coachWrong: "Think about the night wind on your arms. Which word tells how it would feel on your skin?" },
    },
    {
      id: "poem-speak-line",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the last line: The night is bright. Good night, my dear!",
      image: IMG("night-sky"),
      narration: { audio: A("poem-speak-line"), script: "The poem needs its last line, and it is yours to read. It finishes the rhyme with near. Look at the line, tap the mic, and read it out loud." },
      interaction: { type: "speak", text: "The night is bright Good night my dear" },
    },
    {
      id: "compare-rhyme",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one rhymes?",
      narration: { audio: A("compare-rhyme"), script: "You read two party texts today, a story about Ollie and a poem about the night. Compare them. In one of them, the words at the ends of the lines made matching sounds. Which one rhymes? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-poem", label: "the poem" }, { id: "the-story", label: "the story" }], correctId: "the-poem", coachWrong: "Rhyming words end with the same sound. Think back to when you read along. Which one sang with matching word ends?" },
    },
    {
      id: "compare-events",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one tells events in order?",
      narration: { audio: A("compare-events"), script: "One more compare. One of them tells events, things that happened first, next, and last. Which one tells events? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-story", label: "the story" }, { id: "the-poem", label: "the poem" }], correctId: "the-story", coachWrong: "Think back. Which one had a character doing things, one thing after the next?" },
    },
    {
      id: "retell-story",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell Ollie's story in order.",
      narration: { audio: A("retell-story"), script: "Last skill of the party! Tell Ollie's story back like a real reader. Tap what happened first, then what happened next, then how the story ended." },
      interaction: { type: "sequence", items: [{ id: "scared-owl", label: "scared owl", image: IMG("page-1") }, { id: "fern-comes", label: "Fern comes", image: IMG("page-2") }, { id: "happy-night", label: "happy night", image: IMG("page-3") }], order: ["scared-owl","fern-comes","happy-night"], coachWrong: "Think back to the very start of the story. How did Ollie feel before Fern came? Tap that part first." },
    },
    {
      id: "celebrate-party",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read a story AND a poem!",
      fx: {"text":"You are a **real reader**!","effect":"fireworks"},
      narration: { audio: A("celebrate-party"), script: "Stop and look at what you just did. You read a whole story, start to finish. You read a whole poem, rhyme after rhyme. You predicted, you checked feelings, you found rhymes, and you retold it all in order. That is what real readers do, and that is what you are. This is the biggest reading party of the year, and it is all for you!" },
    },
  ],
};
