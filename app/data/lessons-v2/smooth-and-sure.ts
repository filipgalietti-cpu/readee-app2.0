import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./smooth-and-sure-timings.json";

// Smooth and Sure (RF.3.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=smooth-and-sure
// G3-U2 · the RF.3.4 UMBRELLA: the whole fluency package as ONE habit on a real
// third grade chapter, with the understanding check as the point. Sibling split:
// read-it-out-loud RF.2.4b (G2 three jobs, Nell), read-like-you-talk RF.2.4a
// (robot vs talking, road signs), read-with-your-brain RF.2.4a (purpose + sense
// check, Pip), click-and-clunk RF.2.4c (fix-it loop, Cole and Gramps),
// smooth-reader RF.1.4b (Jade's kite), match-your-voice L.2.3 (register). The
// Unit 3 lessons RF.3.4a (purpose), RF.3.4b (prose and poetry, rate,
// expression in depth) and RF.3.4c (self-correction with context) are NOT
// taught here. THIS owns: get the words, keep a talking pace, let the marks
// move your voice, all at once, and after every page you can say what
// happened; if you cannot, the reading was not fluent yet. ONE original story,
// "The Greenhouse Frost" (Marnie and Grandma Edith save pepper seedlings from
// an April frost): 16 sentences over 6 child-read pages (read-along 1 and 4
// with images, accept-mode speaks 2, 3, 5, 6), compound + early-complex
// sentences, tagged dialogue with a question mark and an exclamation point,
// stretch words seedlings / thermometer / clattered / withered with in-text
// support, no digits. Both model sentences are in-world but NOT on the child's
// pages. ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file:
// Marnie, Edith, greenhouse, thermometer, clothespins, clattered, withered,
// hard frost, talking pace all 0-hit. Keys prefixed quiz- are fresh stimuli
// for the quiz (Arlo, Dinah, the first skateboard).

const A = (id: string) => `/audio/lessons-v2/smooth-and-sure/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/smooth-and-sure/${w.toLowerCase()}.png`;

export const smoothAndSureImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with light brown skin and two dark braids wearing a puffy blue coat standing inside a glass greenhouse at dusk, holding a tall stack of folded white bedsheets in both arms, beside an older woman with silver hair in a bun, round glasses, and a long green cardigan, long wooden tables covered with rows of small black trays of tiny green pepper seedlings, a pale purple evening sky through the glass panes. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-4": { subject: "The same older woman with silver hair in a bun, round glasses, and a long green cardigan pushing a wooden garden cart stacked high with black trays of tiny green pepper seedlings through an open door from a dark glass greenhouse into a warm yellow-lit farmhouse kitchen at night, the same young girl with light brown skin and two dark braids in a puffy blue coat holding the door open, more trays of seedlings already crowding the kitchen table and counters, dark blue night sky outside the greenhouse glass. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-arlo-carrying": "A boy with pale skin, freckles, and messy red hair wearing a green t-shirt, shorts, and a plain black helmet, carrying a brand new skateboard with orange wheels in both hands along a paved path in a sunny park, a girl with the same red hair in a ponytail wearing a purple hoodie riding an older scuffed skateboard in a circle around him, green grass and leafy trees, blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no signs, no writing anywhere.",
  "quiz-board-in-grass": { subject: "The same boy with pale skin, freckles, messy red hair, green t-shirt, shorts, and plain black helmet sitting in thick green grass beside a paved park path with a surprised face, his skateboard with orange wheels lying upside down in the grass next to him with its wheels in the air, sunny day, leafy trees behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no signs, no writing anywhere.", ref: "quiz-arlo-carrying" },
  "quiz-arlo-gliding": { subject: "The same boy with pale skin, freckles, messy red hair, green t-shirt, shorts, and plain black helmet gliding smoothly on his skateboard with orange wheels down a long straight paved park path, knees bent, arms out for balance, looking straight ahead with a big grin, the same girl with red hair in a ponytail and a purple hoodie cheering with one arm raised beside the path, green grass, leafy trees, blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no signs, no writing anywhere.", ref: "quiz-arlo-carrying" }
};

export const smoothAndSure: LessonDef = {
  id: "smooth-and-sure",
  title: "Smooth and Sure",
  grade: "3rd Grade",
  standard: "RF.3.4",
  archetype: "fluency",
  objective: "I can read a real chapter out loud smooth and sure, with the right words, a talking pace, and a voice that follows the marks, so that I understand what happened.",
  concepts: [
    "get the words: long words come apart and snap back without stopping the sentence",
    "keep a talking pace: the easy speed you use with a friend, not a crawl and not a race",
    "let the marks move your voice: a tiny pause at a comma, a rest at a period, a climb at a question mark, strong at an exclamation point",
    "all three at once, so the brain is free to understand",
    "the test of fluent reading is saying what happened after every page",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "The Greenhouse Frost had long words, long sentences, and marks that asked your voice to climb and to call out. You read it smooth and sure, and you knew what happened on every page. Get the words, keep a talking pace, let the marks move your voice, and understand. That is fluent reading.",
    "title": "Smooth and Sure",
    "body": "You read a real chapter out loud, and you could tell what happened after every page."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Greenhouse Frost, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In third grade the pages get longer and the words get harder, and your job stays the same. Read so smoothly and surely that your brain has room to understand. Here is page one of The Greenhouse Frost. Read along with me, and listen for the pace and the marks, because you will read most of the pages yourself." },
      interaction: { type: "read-along", text: "Grandma Edith ran a greenhouse at the edge of town, and every April it was crowded with trays of pepper seedlings, baby plants too small to face the cold. One evening the radio warned of a hard frost, so she handed Marnie a stack of old bedsheets before she had even taken off her coat. \"Will a sheet really keep a plant warm?\" asked Marnie.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-the-habit",
      purpose: "model",
      gate: "none",
      prompt: "Get the words. Keep a talking pace. Let the marks move your voice.",
      fx: {"text":"Get the **words**. Keep a **talking pace**. Let the **marks** move your voice.","effect":"pop-words"},
      narration: { audio: A("model-the-habit"), script: "Fluent reading is one habit with three parts, and the whole point of it is understanding. Here is a sentence about the greenhouse that is not on your pages. The greenhouse thermometer hung beside a dented watering can, and its thin red line shrank as the temperature tumbled. Three things happened at once while I read that. I got the words. Thermometer and temperature are long, so I took each one apart and snapped it back without stopping the sentence. I kept a talking pace, the easy speed you use when you tell a friend something. And I let the marks move my voice, a tiny pause at the comma and a full rest at the period. Get the words, keep a talking pace, let the marks move your voice. When all three happen together, your brain is free for the real job, which is knowing what happened. That is the test today. After each page you read, I will ask what happened." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: \"A sheet traps the warm air that rises from the soil, and warm air is all a seedling needs,\" said Grandma Edith. Marnie spread sheets over the trays until every leaf was hidden, and she pinned the corners with clothespins so the wind could not lift them.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Get the words, keep a talking pace, and let the marks move your voice. Read both sentences out loud, and keep track of what Marnie does, because I will ask." },
      interaction: { type: "speak", text: "A sheet traps the warm air that rises from the soil and warm air is all a seedling needs said Grandma Edith Marnie spread sheets over the trays until every leaf was hidden and she pinned the corners with clothespins so the wind could not lift them" },
    },
    {
      id: "guided-check-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did Marnie do on page two?",
      narration: { audio: A("guided-check-page-2"), script: "Here is the understanding check. If your reading was smooth and sure, your brain caught what happened. What did Marnie do on page two? Four cards are on your screen. Tap the one that happened." },
      interaction: { type: "choose", options: [{ id: "she-covered-the-trays", label: "she covered the trays" }, { id: "she-watered-the-trays", label: "she watered the trays" }, { id: "she-moved-the-trays-out", label: "she moved the trays out" }, { id: "she-turned-the-radio-off", label: "she turned the radio off" }], correctId: "she-covered-the-trays", coachWrong: "Look back at page two. What did Marnie do with the stack Grandma Edith handed her?" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: The thermometer by the door dropped lower with each hour, and Marnie checked it so often that her boots wore a path in the gravel. Near midnight, the fan that pushed warm air down the aisle clattered to a stop with a bang. \"We cannot lose the peppers now!\" cried Marnie.",
      narration: { audio: A("page-3-read"), script: "Page three is yours, and it ends with an exclamation point, so let the last line come out strong. Get the words, keep a talking pace, and read all three sentences out loud." },
      interaction: { type: "speak", text: "The thermometer by the door dropped lower with each hour and Marnie checked it so often that her boots wore a path in the gravel Near midnight the fan that pushed warm air down the aisle clattered to a stop with a bang We cannot lose the peppers now cried Marnie" },
    },
    {
      id: "guided-check-page-3",
      purpose: "guided",
      gate: "interaction",
      prompt: "What went wrong near midnight?",
      narration: { audio: A("guided-check-page-3"), script: "Understanding check. Something went wrong near midnight on page three. Tap the card that tells what it was." },
      interaction: { type: "choose", options: [{ id: "the-fan-stopped-working", label: "the fan stopped working" }, { id: "the-door-blew-open", label: "the door blew open" }, { id: "the-sheets-caught-fire", label: "the sheets caught fire" }, { id: "the-radio-went-quiet", label: "the radio went quiet" }], correctId: "the-fan-stopped-working", coachWrong: "Reread the second sentence of page three. Something clattered to a stop. Which card names it?" },
    },
    {
      id: "model-marks-move-voice",
      purpose: "model",
      gate: "none",
      prompt: "A question mark climbs. An exclamation point calls out.",
      fx: {"text":"**?** climbs   **!** calls out   **,** tiny pause   **.** rest","effect":"pop-words"},
      narration: { audio: A("model-marks-move-voice"), script: "Marks do more than stop your voice. Here is another sentence that is not on your pages, and two people are talking in it. Is that frost on the glass already? asked Marnie, and Grandma Edith called back, Grab another sheet! Listen to what the marks did. The question mark made my voice climb at the end of Marnie's words, because she is asking. The exclamation point made Grandma Edith's words come out strong, because she is calling across the room. The little words after the quotes, asked and called back, told me whose voice to use. Page six carries a question mark and an exclamation point too. When you get there, let the marks move your voice." },
    },
    {
      id: "guided-sort-talking-pace",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the readers: Talking Pace, or Not Yet?",
      narration: { audio: A("guided-sort-talking-pace"), script: "Here are six cards, and each one describes a reader. Read each card and picture that reader out loud. If the reader keeps a talking pace, the easy speed you use with a friend, drag the card to Talking Pace. If the reader is not there yet, drag the card to Not Yet." },
      interaction: { type: "sort", buckets: ["Talking Pace","Not Yet"], items: [{ label: "sounds like telling a friend", bucket: "Talking Pace" }, { label: "stops after every word", bucket: "Not Yet" }, { label: "rests a beat at each period", bucket: "Talking Pace" }, { label: "rushes past the periods", bucket: "Not Yet" }, { label: "moves the words together", bucket: "Talking Pace" }, { label: "races until the words blur", bucket: "Not Yet" }], coachWrong: "Picture that reader out loud. Does the reading sound like talking, or does it crawl or race?" },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page four. Read along, and listen for the pauses.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Here is page four. Read along with me, and listen for the tiny pauses inside Grandma Edith's words." },
      interaction: { type: "read-along", text: "Grandma Edith was already rolling a cart down the aisle. \"Then we carry them inside,\" she said, \"because a kitchen at midnight is warmer than any sheet.\" They stacked the cart with trays until its wheels squeaked, and Marnie held the door while the cold rushed in around her ankles.", audio: A("page-4-read-sentence") },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: By the time the last tray was safe, the counters, the table, and even the bathtub were crowded with peppers. Marnie fell asleep in a kitchen chair with dirt under her fingernails, and when she woke, frost had painted the greenhouse windows white.",
      narration: { audio: A("page-5-read"), script: "Page five is yours. Two long sentences, and each one has commas that ask for tiny pauses. Get the words, keep a talking pace, and read both sentences out loud, because I will ask what happened." },
      interaction: { type: "speak", text: "By the time the last tray was safe the counters the table and even the bathtub were crowded with peppers Marnie fell asleep in a kitchen chair with dirt under her fingernails and when she woke frost had painted the greenhouse windows white" },
    },
    {
      id: "apply-check-page-5",
      purpose: "apply",
      gate: "interaction",
      prompt: "What happened while Marnie slept?",
      narration: { audio: A("apply-check-page-5"), script: "Understanding check. Marnie fell asleep in the kitchen chair. What happened while she slept? Tap the card that tells it." },
      interaction: { type: "choose", options: [{ id: "frost-covered-the-windows", label: "frost covered the windows" }, { id: "the-fan-started-again", label: "the fan started again" }, { id: "the-sheets-blew-away", label: "the sheets blew away" }, { id: "the-peppers-turned-red", label: "the peppers turned red" }], correctId: "frost-covered-the-windows", coachWrong: "Reread the last sentence of page five. What did Marnie see when she woke?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Grandma Edith set down two mugs of tea and bent over the trays for a long look. \"Not one leaf has withered or drooped, and that is because you kept checking!\" she said. \"Do we have to carry them all back?\" asked Marnie, and Grandma Edith laughed so hard that she nearly spilled her tea.",
      narration: { audio: A("page-6-read"), script: "Here is the last page, and it is yours. It carries an exclamation point and a question mark, so let the marks move your voice. Get the words, keep a talking pace, and read all three sentences out loud." },
      interaction: { type: "speak", text: "Grandma Edith set down two mugs of tea and bent over the trays for a long look Not one leaf has withered or drooped and that is because you kept checking she said Do we have to carry them all back asked Marnie and Grandma Edith laughed so hard that she nearly spilled her tea" },
    },
    {
      id: "challenge-speak-retell",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What happened on the last page? Tell it in your own words.",
      narration: { audio: A("challenge-speak-retell"), script: "Now the understanding check with no cards to tap. Tap the mic and tell me what happened on the last page in your own words. Say what Grandma Edith found when she looked at the trays, and say what Marnie asked her." },
      interaction: { type: "speak", text: "leaf leaves withered drooped droop wilted fine safe alive healthy okay checking checked check tea mugs mug carry carried back laughed laugh laughing spilled spill peppers plants asked ask morning looked look" },
    },
    {
      id: "celebrate-smooth-and-sure",
      purpose: "celebrate",
      gate: "none",
      prompt: "Smooth and sure, and you understood every page.",
      fx: {"text":"Smooth and **sure**","effect":"fireworks"},
      narration: { audio: A("celebrate-smooth-and-sure"), script: "You read most of a real chapter out loud today, and after every page you could say what happened. That is what fluent means. You got the words, you kept a talking pace, and you let the marks move your voice, so your brain stayed free to understand. Every book you open this week gets the same habit." },
    },
  ],
};
