import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./ask-and-answer-g2-timings.json";

// Ask & Answer (RL.2.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=ask-and-answer-g2
// G2: original story "The Kite on the Hill", 8 sentences over 4 child-read pages.

const A = (id: string) => `/audio/lessons-v2/ask-and-answer-g2/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/ask-and-answer-g2/${w.toLowerCase()}.png`;

export const askAndAnswerG2Images: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover illustration of a smiling young boy with short dark hair holding a bright red diamond kite with a long string, standing beside his cheerful grey-haired grandmother in a purple cardigan, on a grassy green hill under a blue sky with puffy white clouds, framed like a picture book cover, no text anywhere",
  "page-1": { subject: "The same smiling young boy with short dark hair carrying the same bright red diamond kite up a grassy windy hill in golden morning light, the same cheerful grey-haired grandmother in a purple cardigan walking beside him, tall grass bending in the wind", ref: "cover" },
  "page-2": { subject: "The same young boy with short dark hair looking worried beside a green thorn bush on a grassy hill, one single bright red diamond kite lying stuck in the thorn bush with a long rip torn down its red paper sail, the same grey-haired grandmother in a purple cardigan walking toward him, plain blue sky with only clouds, nothing flying in the sky", ref: "page-3" },
  "page-3": { subject: "The same cheerful grey-haired grandmother in a purple cardigan kneeling on the grass repairing the same bright red diamond kite, pressing tape onto its sail, a small open repair kit on the grass beside her, a soft striped scarf tied to the kite as a new long tail, the same young boy with short dark hair watching happily", ref: "page-2" },
  "page-4": { subject: "The same bright red diamond kite with a striped scarf tail soaring high in a bright blue sky above a grassy green hill, the same young boy with short dark hair below holding the string and cheering, the same grey-haired grandmother in a purple cardigan clapping her hands, sunny day", ref: "page-3" }
};

export const askAndAnswerG2: LessonDef = {
  id: "ask-and-answer-g2",
  title: "Ask & Answer",
  grade: "2nd Grade",
  standard: "RL.2.1",
  archetype: "story-elements",
  objective: "I can ask and answer who, what, where, when, why, and how questions and prove each answer with the story's words.",
  concepts: ["who questions","what questions","where questions","when questions","why questions","how questions","prove answers with the story's words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole story, and you asked all six questions. Who, what, where, when, why, and how. You answered every one, and you proved each answer with the story's exact words. That is what strong readers do. Ask it, answer it, prove it, every time you read.",
    "title": "You Proved Every Answer!",
    "body": "You asked who, what, where, when, why, and how questions, and proved each answer with the story's own words."
  },
  scenes: [
    {
      id: "hook-six-questions",
      purpose: "hook",
      gate: "none",
      prompt: "Six questions unlock any story.",
      image: IMG("cover"),
      fx: {"text":"who, what, where, when, why, **how**","effect":"pop-words"},
      narration: { audio: A("hook-six-questions"), script: "Hello, reader! Strong readers ask questions about every story they read. Who? What? Where? When? Why? And here is a new one for you: how? A how question asks the way something was done, step by step. Today you will read a brand new story called The Kite on the Hill. You will ask questions, answer them, and prove every answer with the story's own words." },
    },
    {
      id: "model-ask-and-prove",
      purpose: "model",
      gate: "none",
      prompt: "Watch me ask, answer, and prove.",
      fx: {"text":"Prove it with the story's **exact words**.","effect":"underline"},
      narration: { audio: A("model-ask-and-prove"), script: "Watch me do it first with a tiny story. Listen. Ben lost his red hat at the park. Now I ask a who question: who lost a hat? I answer, Ben. But a strong reader proves it. The story's words say, Ben lost his red hat. There is my proof. Now a where question: where did he lose it? The words say, at the park. Ask the question, answer it, then point to the exact words that prove you are right. That is the whole job." },
    },
    {
      id: "model-how-questions",
      purpose: "model",
      gate: "none",
      prompt: "How questions ask for the steps.",
      fx: {"text":"**How** did she do it? Step by step.","effect":"glow"},
      narration: { audio: A("model-how-questions"), script: "Now the new question word: how. A how question asks the way something was done, the steps. Another tiny story. Mia's wagon wheel fell off. She pushed the wheel back on, then taped it tight. I ask, how did Mia fix the wheel? The steps are my answer. The words say she pushed it back on, then taped it tight. First one step, then the next step. That is how you answer a how question." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: On Saturday morning, Omar took his new kite to the windy hill. His grandmother came too, because she had flown kites for fifty years.",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Time to read The Kite on the Hill. Page one is all yours. Take your time, sound out the tricky words, and read the whole page out loud." },
      interaction: { type: "speak", text: "On Saturday morning Omar took his new kite to the windy hill His grandmother came too because she had flown kites for fifty years" },
    },
    {
      id: "check-when",
      purpose: "guided",
      gate: "interaction",
      prompt: "When did Omar take his kite out?",
      narration: { audio: A("check-when"), script: "Great reading. First question. A when question asks about time. Page one told us exactly when Omar took his kite out. When was it? Find the story's own words and tap them." },
      interaction: { type: "choose", options: [{ id: "on-saturday-morning", label: "on saturday morning" }, { id: "late-sunday-night", label: "late sunday night" }, { id: "after-school-one-day", label: "after school one day" }, { id: "on-a-rainy-evening", label: "on a rainy evening" }], correctId: "on-saturday-morning", coachWrong: "A when question asks about time. Read page one again in your mind. Which words name the day and the time Omar went out?" },
    },
    {
      id: "check-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where did Omar take his kite?",
      narration: { audio: A("check-where"), script: "Now a where question. Where questions ask about place. On Saturday morning, Omar took his new kite somewhere special. Where did he go? Tap the exact words the story used." },
      interaction: { type: "choose", options: [{ id: "to-the-windy-hill", label: "to the windy hill" }, { id: "to-the-sandy-beach", label: "to the sandy beach" }, { id: "to-the-school-yard", label: "to the school yard" }, { id: "down-by-the-pond", label: "down by the pond" }], correctId: "to-the-windy-hill", coachWrong: "A where question asks about place. Picture Omar walking with his kite on page one. Which words tell the place he went?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page two. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Something is about to go wrong. Here is page two. Read along with me." },
      interaction: { type: "read-along", text: "A wild gust slammed the kite into a thorn bush. Omar found a long rip right down the paper sail.", audio: A("page-2-read-sentence") },
    },
    {
      id: "check-what",
      purpose: "guided",
      gate: "interaction",
      prompt: "What happened to the kite?",
      narration: { audio: A("check-what"), script: "Oh no. A what question now. A wild gust grabbed Omar's kite. What happened to it? The story's words tell you exactly. Tap the answer you can prove." },
      interaction: { type: "choose", options: [{ id: "ripped-in-thorn-bush", label: "it ripped in a thorn bush" }, { id: "sank-in-a-deep-pond", label: "it sank in a deep pond" }, { id: "string-snapped-in-two", label: "its string snapped in two" }, { id: "blew-away-for-good", label: "it blew away for good" }], correctId: "ripped-in-thorn-bush", coachWrong: "Think about page two. The gust slammed the kite into something sharp. What did the words say happened to the sail?" },
    },
    {
      id: "build-how-question",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build the question: How can we fix the kite?",
      narration: { audio: A("build-how-question"), script: "Omar stared at that rip. When something goes wrong in a story, a strong reader asks a how question. Now you build one. Drag the words in order to ask, how can we fix the kite? The question word goes first, and the question mark goes last." },
      interaction: { type: "sequence", items: [{ id: "can", label: "can" }, { id: "how", label: "How" }, { id: "fix", label: "fix" }, { id: "we", label: "we" }, { id: "the-kite", label: "the kite" }, { id: "q-mark", label: "?" }], order: ["how","can","we","fix","the-kite","q-mark"], coachWrong: "Say the question to yourself: how can we fix the kite? Drag each word as you say it. The question word goes first, and the question mark goes at the very end." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: Grandma smiled and opened her small repair kit. First she taped the rip, then she tied on a new tail made from her old scarf.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "You asked how, and page three holds the answer. Read page three out loud, and watch for the steps." },
      interaction: { type: "speak", text: "Grandma smiled and opened her small repair kit First she taped the rip then she tied on a new tail made from her old scarf" },
    },
    {
      id: "check-how-fix",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did Grandma fix the kite?",
      narration: { audio: A("check-how-fix"), script: "Here is the big one, your how question. How did Grandma fix the kite? A how answer tells the steps, what she did first and what she did next. Tap the answer you can prove with the story's words." },
      interaction: { type: "choose", options: [{ id: "taped-rip-tied-tail", label: "taped the rip, tied a tail" }, { id: "sewed-sail-with-thread", label: "sewed the sail with thread" }, { id: "glued-a-paper-patch", label: "glued on a paper patch" }, { id: "bought-a-new-kite", label: "bought a brand new kite" }], correctId: "taped-rip-tied-tail", coachWrong: "A how answer tells the steps in order. Grandma did one thing first and one thing next on page three. Which choice tells both of her steps?" },
    },
    {
      id: "check-who-proof",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words prove Grandma knows all about kites?",
      narration: { audio: A("check-who-proof"), script: "Who fixed the kite? Grandma did. Now prove something bigger. Way back on page one, the story showed us that Grandma is a kite expert. Which words from the story prove she knows all about kites? Read every choice, then tap the proof." },
      interaction: { type: "choose", options: [{ id: "flown-kites-fifty-years", label: "flown kites for fifty years" }, { id: "grandmother-came-too", label: "his grandmother came too" }, { id: "grandma-smiled-at-omar", label: "grandma smiled at omar" }, { id: "omar-took-his-new-kite", label: "omar took his new kite" }], correctId: "flown-kites-fifty-years", coachWrong: "Proof has to show she is an expert. Read each choice and ask yourself, does this show Grandma knows kites well? Only one choice does that job." },
    },
    {
      id: "page-4-read",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Omar tossed the kite high, and it soared over the hill like a bird. He cheered, because Grandma's old trick had saved the day.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "One page left, and it is all yours. Read the ending of our story out loud." },
      interaction: { type: "speak", text: "Omar tossed the kite high and it soared over the hill like a bird He cheered because Grandma's old trick had saved the day" },
    },
    {
      id: "check-why",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Why did Omar cheer?",
      narration: { audio: A("check-why"), script: "What an ending. Now a why question. Why questions ask for a reason. At the end of the story, Omar cheered. Why? The story's word because points right at the reason. Tap the reason you can prove." },
      interaction: { type: "choose", options: [{ id: "trick-saved-the-day", label: "her trick saved the day" }, { id: "won-a-kite-contest", label: "he won a kite contest" }, { id: "wind-stopped-blowing", label: "the wind stopped blowing" }, { id: "found-a-shiny-coin", label: "he found a shiny coin" }], correctId: "trick-saved-the-day", coachWrong: "Find the reason. Page four says Omar cheered, and then it gives the reason. Read the words right after because one more time, then tap that reason." },
    },
    {
      id: "speak-how-answer",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: how did Grandma fix the kite?",
      narration: { audio: A("speak-how-answer"), script: "Last job. Prove you can answer a how question out loud. How did Grandma fix the kite? Tell me her steps in your own words. Start with, first she." },
      interaction: { type: "speak", text: "taped tape rip tied tie tail scarf fix fixed repair" },
    },
    {
      id: "celebrate-ask-answer",
      purpose: "celebrate",
      gate: "none",
      prompt: "You asked, answered, and proved it!",
      fx: {"text":"Ask it. Answer it. **Prove it**.","effect":"fireworks"},
      narration: { audio: A("celebrate-ask-answer"), script: "You read a whole story, and you asked all six questions. Who, what, where, when, why, and how. You answered every one, and you proved each answer with the story's exact words. That is what strong readers do. Ask it, answer it, prove it, every time you read." },
    },
  ],
};
