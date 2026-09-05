import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./prose-and-poem-timings.json";

// Prose and Poem (RF.3.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=prose-and-poem
// G3-U3 · RF.3.4b: read grade-level PROSE and POETRY orally with accuracy, rate,
// and expression on SUCCESSIVE readings. Sibling split: smooth-and-sure RF.3.4
// (the whole habit + the understanding check; its quiz previewed a poem's
// line breaks on two lines), know-why-you-read RF.3.4a (purpose), read-it-out-loud
// RF.2.4b (three jobs, Nell), read-like-you-talk RF.2.4a (talking pace, road
// signs), word-music RL.2.4 (rhythm and rhyme as MEANING, the storm parade),
// word-pictures RL.1.4 (the rainy-day poem), parts-that-build RL.3.5 (stanza as
// a part, the scarecrow poem). THIS owns: the same three fluency parts work
// differently on a story page (the sentence and its marks drive the voice) and
// on a poem (the line ends, the beat you can tap, and the rhyme drive it, and a
// line does not always end where the sentence ends), and the deliberate SECOND
// READ, which is better because you know where it is going. ONE moment in two
// forms: "The Red Tugboat" (a prose page, 7 sentences: Orla and Uncle Emmett
// wait at the end of a dark pier for Mom's tugboat, a horn past the breakwater,
// an old brass bell, the red nose sliding out of the dark; tagged dialogue with
// a question mark and an exclamation point) and "Bell on the Pier" (an original
// two-stanza rhyming poem, 8 lines, iambic beat, run-on lines in both stanzas).
// 15 sentences and lines over 6 child-read pages (page one read twice in two
// halves, stanza one read twice), stretch words breakwater / rail / brass /
// flickered with in-text support, no digits, no contractions in the read-along,
// no " my " in any speak text. Both model sentences are in-world but NOT on the
// child's pages; the narrator reads stanza two, never stanza one. On screen a
// poem line is marked by a capital letter at its start (prompts cannot break
// lines), and the narration says so. ANCHOR FRESHNESS python-swept vs every
// lessons-v2 + quizzes-v2 file: tugboat, breakwater, black glass, Orla, Emmett
// 0 hits (pier = a vocabulary tile only, harbor = an aquarium name only);
// dented, vanished, ached, gull found carried elsewhere and swapped out. Keys
// prefixed quiz- are fresh stimuli for the quiz (Poppy, Zev, the carousel).

const A = (id: string) => `/audio/lessons-v2/prose-and-poem/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/prose-and-poem/${w.toLowerCase()}.png`;

export const proseAndPoemImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with light brown skin and curly dark hair wearing a yellow rain jacket, and an older man with a short gray beard wearing a navy wool coat and a knit cap, standing side by side at the end of a long wooden pier before sunrise, dark blue night sky, calm black water reflecting a few round pier lamps, the man holding out a small old brass hand bell, no boats anywhere on the water. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "tugboat-arrives": { subject: "The same young girl with light brown skin and curly dark hair in a yellow rain jacket ringing a small brass hand bell with both hands, beside the same older man with a short gray beard in a navy wool coat and knit cap, at the end of the same wooden pier before sunrise, the big rounded red front of a tugboat sliding out of the dark water right beside the pier with white foam at its base and one warm cabin window glowing, dark blue sky with a thin pale line of dawn on the horizon. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-carousel-night": "A brightly lit carousel at a county fair at night, painted wooden horses on golden poles under a striped red and white round roof ringed with warm yellow bulbs, a girl with pale skin and red pigtails wearing a green sweater sitting on a white painted horse, and a tall teenage boy with the same red hair wearing a denim jacket sitting on a blue painted horse beside her, dark night sky, no other people, no banners. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-poppy-reaching": { subject: "The same girl with pale skin and red pigtails in a green sweater leaning back on the same white painted carousel horse with both arms stretched wide and a big laugh, the horse rising on its golden pole, the fair lights behind her blurred into long streaks of yellow and pink, the same teenage boy with red hair in a denim jacket laughing on the blue horse beside her, night sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-carousel-night" },
  "quiz-carousel-stopped": { subject: "The same carousel stopped and dim at night with most of its warm bulbs switched off and only a few still glowing, the same girl with red pigtails in a green sweater climbing down from the white painted horse with wobbly legs and a sleepy smile, the same teenage boy with red hair in a denim jacket standing on the platform waiting for her with one hand out, empty fairground behind them, dark sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-carousel-night" }
};

export const proseAndPoem: LessonDef = {
  id: "prose-and-poem",
  title: "Prose and Poem",
  grade: "3rd Grade",
  standard: "RF.3.4b",
  archetype: "fluency",
  objective: "I can read a story page and a poem out loud with the right words, a good pace, and expression, and read each one a second time even better.",
  concepts: [
    "the first read finds out where the sentence is going; the second read already knows, so it is better",
    "on a story page the sentence and its marks drive your voice: a climb at a question mark, strong at an exclamation point, a tiny pause at a comma, a rest at a period",
    "in a poem the lines drive your voice: a tiny pause at every line end, a beat you can tap, and rhymes that chime at the line ends",
    "a line does not always end where the sentence ends; a run-on line keeps the sentence alive across the break",
    "read it twice: the second read is the habit",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "The Red Tugboat and Bell on the Pier told the same moment two ways, and you read each one twice. On the story page the marks moved your voice. In the poem the lines, the beat, and the rhyme drove it. Your second read was better every time, because you knew where it was going.",
    "title": "Prose and Poem",
    "body": "You read a story page and a poem out loud, twice each, and your second read was better."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Red Tugboat, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Today you get one moment told two ways, as a story page and as a poem, and you will read each one twice. That second read is the secret of this lesson. Here is page one of The Red Tugboat. Read along with me, and notice what the marks make my voice do, because in a minute you will read this page on your own." },
      interaction: { type: "read-along", text: "The harbor was still dark when Orla and Uncle Emmett reached the end of the pier, and the water below them lay as still as black glass. Somewhere out past the breakwater, the wall of rocks that keeps the waves out, a horn sounded twice and went quiet. \"Is that Mom's boat?\" asked Orla, leaning over the rail. \"Wait for the bell,\" said Uncle Emmett, and he pulled an old brass bell out of his coat pocket. Orla rang it until her arm grew tired, and the sound rolled out over the water and was gone. Then the red nose of a tugboat slid out of the dark, so close that she could have touched it. \"There she is!\" shouted Orla.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-first-read",
      purpose: "model",
      gate: "none",
      prompt: "The first read finds out where the sentence is going.",
      fx: {"text":"First read: **get the words**, find out **where it goes**","effect":"pop-words"},
      narration: { audio: A("model-first-read"), script: "You are going to read that page twice, and each read has its own job. Here is a sentence from the pier that is not on your page, and this is my first read of it. The pier lights flickered above them, and every few seconds a wave slapped the posts below. On a first read, I am finding out. I get every word right, I keep a talking pace, and I follow the sentence to see where it goes. I did not know a comma was coming until I reached it, and I did not know the sentence would end with a wave. A first read is honest work, and it is never the best read you can do." },
    },
    {
      id: "model-second-read",
      purpose: "model",
      gate: "none",
      prompt: "The second read already knows where it is going.",
      fx: {"text":"Second read: the marks move your voice **from the first word**","effect":"underline"},
      narration: { audio: A("model-second-read"), script: "Here is a different sentence from the pier, and I have already read it once, so this is my second read. I know a question is coming, I know a soft voice, and I know a shout at the very end. Listen. Do you hear that engine? asked Uncle Emmett softly, and then he laughed out loud. That is her! Because I knew where it was going, my voice climbed at the question mark, dropped soft for the tag, and came out strong at the exclamation point. That is what a second read gives you. Nothing surprises you, so the marks can move your voice from the first word." },
    },
    {
      id: "page-1a-first-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "First read, page one, part one: The harbor was still dark when Orla and Uncle Emmett reached the end of the pier, and the water below them lay as still as black glass. Somewhere out past the breakwater, the wall of rocks that keeps the waves out, a horn sounded twice and went quiet. \"Is that Mom's boat?\" asked Orla, leaning over the rail.",
      narration: { audio: A("page-1a-first-read"), script: "Your turn, and this is your first read. The first three sentences of page one are on your screen. Get the words, keep a talking pace, and follow each sentence to find out where it goes. Read all three out loud." },
      interaction: { type: "speak", text: "The harbor was still dark when Orla and Uncle Emmett reached the end of the pier and the water below them lay as still as black glass Somewhere out past the breakwater the wall of rocks that keeps the waves out a horn sounded twice and went quiet Is that Mom's boat asked Orla leaning over the rail" },
    },
    {
      id: "page-1b-first-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "First read, page one, part two: \"Wait for the bell,\" said Uncle Emmett, and he pulled an old brass bell out of his coat pocket. Orla rang it until her arm grew tired, and the sound rolled out over the water and was gone. Then the red nose of a tugboat slid out of the dark, so close that she could have touched it. \"There she is!\" shouted Orla.",
      narration: { audio: A("page-1b-first-read"), script: "Here is the rest of page one, still a first read. Four sentences, and two people talk in them. Get the words, keep a talking pace, and find out where each sentence goes. Read all four out loud." },
      interaction: { type: "speak", text: "Wait for the bell said Uncle Emmett and he pulled an old brass bell out of his coat pocket Orla rang it until her arm grew tired and the sound rolled out over the water and was gone Then the red nose of a tugboat slid out of the dark so close that she could have touched it There she is shouted Orla" },
    },
    {
      id: "guided-choose-which-mark",
      purpose: "guided",
      gate: "interaction",
      prompt: "\"Is that Mom's boat?\" asked Orla, leaning over the rail. Which mark should change your voice, and how?",
      narration: { audio: A("guided-choose-which-mark"), script: "Before your second read, look closely at one line from page one. It is on your screen, and it carries several marks. Now that you know the line, tap the card that names a mark in it and tells the right way that mark should change your voice." },
      interaction: { type: "choose", options: [{ id: "question-mark-climb", label: "the question mark, climb" }, { id: "comma-full-rest", label: "the comma, a full rest" }, { id: "period-climb", label: "the period, climb" }, { id: "quotes-get-loud", label: "the quotes, get loud" }], correctId: "question-mark-climb", coachWrong: "Check that mark again, and think about what it always asks a voice to do." },
    },
    {
      id: "page-1a-second-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Second read, page one, part one: The harbor was still dark when Orla and Uncle Emmett reached the end of the pier, and the water below them lay as still as black glass. Somewhere out past the breakwater, the wall of rocks that keeps the waves out, a horn sounded twice and went quiet. \"Is that Mom's boat?\" asked Orla, leaning over the rail.",
      narration: { audio: A("page-1a-second-read"), script: "Now the second read of the first part, and this time you know where it is going. You know the second sentence has commas around the breakwater, and you know Orla asks a question at the end. Let the marks move your voice from the first word, and read all three sentences out loud." },
      interaction: { type: "speak", text: "The harbor was still dark when Orla and Uncle Emmett reached the end of the pier and the water below them lay as still as black glass Somewhere out past the breakwater the wall of rocks that keeps the waves out a horn sounded twice and went quiet Is that Mom's boat asked Orla leaning over the rail" },
    },
    {
      id: "page-1b-second-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Second read, page one, part two: \"Wait for the bell,\" said Uncle Emmett, and he pulled an old brass bell out of his coat pocket. Orla rang it until her arm grew tired, and the sound rolled out over the water and was gone. Then the red nose of a tugboat slid out of the dark, so close that she could have touched it. \"There she is!\" shouted Orla.",
      narration: { audio: A("page-1b-second-read"), script: "Second read of the rest of the page. You know Uncle Emmett speaks first, you know the tugboat is coming, and you know Orla shouts at the end. Nothing can surprise you now. Let the comma after bell give a tiny pause, let the exclamation point come out strong, and read all four sentences out loud." },
      interaction: { type: "speak", text: "Wait for the bell said Uncle Emmett and he pulled an old brass bell out of his coat pocket Orla rang it until her arm grew tired and the sound rolled out over the water and was gone Then the red nose of a tugboat slid out of the dark so close that she could have touched it There she is shouted Orla" },
    },
    {
      id: "model-poem-beat",
      purpose: "model",
      gate: "none",
      prompt: "Bell on the Pier, stanza two: She rings the bell. It rolls and swings Across the water, and it brings A red nose sliding through the night. Then Orla shouts with all her might!",
      image: IMG("tugboat-arrives"),
      narration: { audio: A("model-poem-beat"), script: "The same moment is also a poem, Bell on the Pier. This is stanza two, and I will read it, because stanza one is yours. In a poem, the lines drive your voice. On this screen, each new line starts with a capital letter. Listen for three things while I read. The beat, a pattern you could tap with one finger, da DA da DA da DA da DA. A tiny pause at the end of every line, even when no mark is there. And the rhyme at the line ends, swings and brings, night and might. She rings the bell. It rolls and swings, across the water, and it brings, a red nose sliding through the night. Then Orla shouts with all her might!" },
    },
    {
      id: "model-run-on-line",
      purpose: "model",
      gate: "none",
      prompt: "A line does not always end where the sentence ends.",
      fx: {"text":"the line ends, the sentence **runs on**","effect":"underline"},
      narration: { audio: A("model-run-on-line"), script: "Listen to the first line of stanza two again. She rings the bell. It rolls and swings. I paused after swings, because the line ended there, but the sentence was not finished. It runs on into the next line, across the water, and it brings, and into the line after that, and it only ends at the period after night. That is a run-on line, and it is the trick of reading a poem out loud. Your voice takes the tiny pause at the line end and keeps the sentence alive across it, so the beat and the meaning both survive. On a second read of a poem you know where the lines end and where the sentences end, so you never stumble at the break." },
    },
    {
      id: "stanza-1-first-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "First read, stanza one: The sky is dark, the harbor sleeps, The pier is still, the cold wind creeps. A horn calls twice across the bay And fades to nothing, far away.",
      narration: { audio: A("stanza-1-first-read"), script: "Stanza one is yours, and nobody has read it for you. Four lines, and each new line starts with a capital letter. This is your first read, so get the words, find the beat, and take a tiny pause at the end of each line. Read all four lines out loud." },
      interaction: { type: "speak", text: "The sky is dark the harbor sleeps The pier is still the cold wind creeps A horn calls twice across the bay And fades to nothing far away" },
    },
    {
      id: "guided-choose-line-vs-sentence",
      purpose: "guided",
      gate: "interaction",
      prompt: "A horn calls twice across the bay And fades to nothing, far away. What is true about this sentence?",
      narration: { audio: A("guided-choose-line-vs-sentence"), script: "Look at the last two lines of stanza one. They are on your screen, and the capital letter on And shows where line four begins. Think about where the line ends and where the sentence ends, and tap the card that tells the truth about this sentence." },
      interaction: { type: "choose", options: [{ id: "runs-on-into-line-four", label: "it runs on into line four" }, { id: "ends-with-line-three", label: "it ends with line three" }, { id: "starts-on-line-four", label: "it starts on line four" }, { id: "ends-after-twice", label: "it ends after the word twice" }], correctId: "runs-on-into-line-four", coachWrong: "Find the period. Is it at the end of line three, or somewhere else?" },
    },
    {
      id: "guided-sort-story-page-poem",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: how do you read a Story Page, and how do you read a Poem?",
      narration: { audio: A("guided-sort-story-page-poem"), script: "Six cards describe ways to read out loud. Three belong to a story page, where the sentence and its marks drive your voice. Three belong to a poem, where the lines, the beat, and the rhyme drive it. Read each card and drag it to Story Page or to Poem." },
      interaction: { type: "sort", buckets: ["Story Page","Poem"], items: [{ label: "pause only at the marks", bucket: "Story Page" }, { label: "tiny pause at each line end", bucket: "Poem" }, { label: "the sentence sets the pace", bucket: "Story Page" }, { label: "the beat sets the pace", bucket: "Poem" }, { label: "the tags tell whose voice", bucket: "Story Page" }, { label: "listen for the rhyme", bucket: "Poem" }], coachWrong: "Ask what drives the voice on that card, the sentence and its marks, or the lines and the beat." },
    },
    {
      id: "stanza-1-second-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Second read, stanza one: The sky is dark, the harbor sleeps, The pier is still, the cold wind creeps. A horn calls twice across the bay And fades to nothing, far away.",
      narration: { audio: A("stanza-1-second-read"), script: "Now the second read of stanza one, and you know where it is going. You know the beat, you know sleeps rhymes with creeps and bay rhymes with away, and you know the last sentence runs on from line three into line four. Tap the beat with one finger if it helps, pause at each line end, keep that last sentence alive across the break, and read all four lines out loud." },
      interaction: { type: "speak", text: "The sky is dark the harbor sleeps The pier is still the cold wind creeps A horn calls twice across the bay And fades to nothing far away" },
    },
    {
      id: "challenge-speak-second-read",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What made your second read better? Say one thing.",
      narration: { audio: A("challenge-speak-second-read"), script: "Last one, out loud, with no cards to tap. You read the story page twice and the stanza twice. Tap the mic and tell me one thing that made your second read better than your first. Say what you knew the second time that you did not know the first time." },
      interaction: { type: "speak", text: "knew know knowing where going coming next ahead marks mark question climb climbed strong loud shout pause paused pauses beat rhyme rhymes line lines end ends break smooth smoother faster slower voice expression feeling surprise surprised twice again second better practice" },
    },
    {
      id: "celebrate-prose-and-poem",
      purpose: "celebrate",
      gate: "none",
      prompt: "Two forms, two reads, and the second read was better.",
      fx: {"text":"Read it **twice**","effect":"fireworks"},
      narration: { audio: A("celebrate-prose-and-poem"), script: "You read one moment two ways today. On the story page, the sentence and its marks moved your voice. In the poem, the lines, the beat, and the rhyme took over, and you kept a sentence alive across a line break. Both times, your second read was better, because you knew where it was going. Read it twice. That is the habit." },
    },
  ],
};
