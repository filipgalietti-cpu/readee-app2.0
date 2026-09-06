import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./expert-words-timings.json";

// Expert Words (RI.3.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=expert-words
// G3-U2. RI.3.4 = determine the meaning of general academic (SCHOOL) words and
// domain-specific (EXPERT) words and phrases in a grade 3 informational text.
// Sibling split honored: science-word-clues (RI.2.4, beavers: gnaw/dam/lodge/
// waterproof) owns G2 topic words with the author's help, fact-word-finder
// (RI.1.4, camel: desert/hump/store) owns G1, science-word-wonder (RI.K.4,
// butterflies) owns K, read-around-the-word (L.3.4a, story-shaped text, the
// four clue kinds summit/gear/reluctant/trudged) owns sentence context clues,
// three-word-tools (L.3.4) owns choosing a tool (current = the sentence picks
// the meaning sits in ITS quiz, so rivers/current are not touched here).
// THIS lesson owns the G3 step-up: TWO kinds of big words (expert words that
// belong to the topic vs school words that travel to every subject), the text's
// own supports (a definition beside the word, an example, a comparison with
// like, a caption), the EVERYDAY-WORD TRAP (plate, fault, waves each carry an
// expert meaning here that the everyday meaning cannot fill), and explaining
// an expert word in the child's own words the way a specialist would.
// ONE original informational text, "When the Ground Shakes" (earthquakes;
// every fact true: the crust is the rocky outer layer, broken into plates that
// creep along at about fingernail speed, plate edges stick and the rock bends
// until it slips, the slip is an earthquake and the crack is a fault, shaking
// travels outward in waves, a seismograph records shaking as a wiggly line,
// big quakes make tall wiggles, stations are compared to locate the start,
// aftershocks follow for days or weeks, flexible buildings sway instead of
// snapping, drop-cover-hold-on is the real safety advice), 16 sentences over 5
// child-read pages (read-along 1/3/5 with images, speak 2/4), compound +
// early-complex sentences, no digits. Expert words with in-text support:
// crust (definition), plates (definition + what they carry), fault
// (definition), waves (comparison with like), seismograph (definition),
// aftershocks (definition). School words: result, observe, compare. Everyday
// words in their expert sense: plate, fault, waves. ANCHOR FRESHNESS grep-
// swept vs every lessons-v2 + quizzes-v2 file: earthquake, seismograph,
// aftershock, quake, crust-as-topic, continent, tremble-as-noun 0 hits as a
// text (plate only ever a dish or home plate, fault only "not your fault",
// which is exactly the everyday sense the trap needs). Keys prefixed quiz- are
// picture supports for the quiz's all-fresh cave text (limestone, chamber,
// stalactite, stalagmite, soda straw, flowstone all 0 hits).

const A = (id: string) => `/audio/lessons-v2/expert-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/expert-words/${w.toLowerCase()}.png`;

export const expertWordsImages: Record<string, string> = {
  "cracked-crust-cutaway": "A cutaway view of the planet Earth sliced open like a ball: a thin outer shell of grey and brown rock broken into several large jagged pieces with narrow dark cracks between them, blue ocean water and green land sitting on top of the rocky pieces, glowing orange and red hot rock filling the whole inside beneath the shell, dark starry space around the planet. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no arrows, no writing anywhere.",
  "fault-across-field": "A long jagged crack running straight across a dry golden field under a clear blue sky, the ground on one side of the crack shifted sideways a little so that a wooden fence and a dirt road are broken and offset where they cross it, a few rounded hills in the distance, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "seismograph-station": "A woman scientist with short curly black hair in a blue sweater leaning over a wooden desk, looking closely at a wide sheet of white paper wrapped around a slowly turning drum, where a thin pen is drawing a long jagged zigzag line, a window behind her with green hills outside, a potted plant on the desk. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no writing anywhere.",
  "quiz-cave-chamber": "A huge dark underground cave room lit by a soft warm glow, rough rocky walls, a still pool of clear water on the floor reflecting the ceiling, many long pointed stone shapes hanging down from the ceiling, one small explorer wearing a helmet with a round lamp standing at the edge of the pool for scale. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-cave-stalactites": "A close view of long pointed stone shapes hanging down from a rough rocky cave ceiling, a single clear drop of water falling from the tip of the longest one, dark cave background lit by soft warm light, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-cave-column": "Inside a cave, one thick tall stone pillar reaching from the rocky floor all the way up to the rocky ceiling, its middle slightly narrower where a hanging stone point and a rising stone bump grew together, a few smaller hanging stone points and floor bumps around it, soft warm lamp light, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const expertWords: LessonDef = {
  id: "expert-words",
  title: "Expert Words",
  grade: "3rd Grade",
  standard: "RI.3.4",
  archetype: "vocabulary",
  objective: "I can work out the meaning of expert words and school words in a fact text, using the supports the text gives me.",
  concepts: [
    "expert words belong to the topic, school words show up in every subject",
    "a fact text supports a big word with a definition, an example, a comparison, or a caption",
    "the support usually sits within a sentence of the word",
    "an everyday word can carry an expert meaning in a fact text",
    "when the everyday meaning does not fit the topic, look for the expert meaning the text gives",
    "explain an expert word in your own words, the way a specialist would",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a true text full of big words, and you worked out every one of them from the text itself. Expert words belong to the topic. School words travel to every subject. And an everyday word can carry an expert meaning, so when the meaning you know does not fit, you look for the one the text hands you. That is how a scientist reads a fact book, and now it is how you read one.",
    "title": "Expert Reader!",
    "body": "You worked out expert words and school words from a true text, caught the everyday-word trap, and explained a word like a specialist."
  },
  scenes: [
    {
      id: "hook-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "When the Ground Shakes, page one. Read along!",
      image: IMG("cracked-crust-cutaway"),
      narration: { audio: A("hook-page-one"), script: "Hello, reader. Fact books are full of big words, and today you learn how third graders work them out with no dictionary at all, using the text itself. Here is page one of a true text called When the Ground Shakes. Read along with me, and notice the words that sound like they belong to a scientist." },
      interaction: { type: "read-along", text: "Most days the ground under your feet feels as still as a floor, but the outside of the Earth is always slowly moving. The Earth's outer layer is called the crust, a shell of hard rock that wraps the whole planet. The crust is cracked into enormous pieces called plates, and the plates carry the oceans and the continents on their backs.", audio: A("hook-page-one-sentence") },
    },
    {
      id: "model-expert-word-support",
      purpose: "model",
      gate: "none",
      prompt: "An expert word, and the support right beside it.",
      fx: {"text":"the crust, **a shell of hard rock** that wraps the whole planet","effect":"underline"},
      narration: { audio: A("model-expert-word-support"), script: "The word crust is what I call an expert word. It belongs to this topic, the way a doctor has doctor words and a chef has kitchen words. A fact book almost never leaves an expert word alone. Look at page one. The Earth's outer layer is called the crust, a shell of hard rock that wraps the whole planet. Right after the word, the sentence tells me what it means. A shell of hard rock around the planet. That is the first kind of support, a definition sitting right beside the word. There are other kinds. A text can give an example. It can make a comparison, with the word like. It can put a caption under a picture. Every time an expert word stops you, look for one of those supports, and it is usually within a sentence of the word." },
    },
    {
      id: "guided-choose-plates-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does plates mean in this text?",
      narration: { audio: A("guided-choose-plates-meaning"), script: "Your turn. Page one used another expert word, plates, and it gave you support in the very same sentence. The crust is cracked into enormous pieces called plates, and the plates carry the oceans and the continents on their backs. Use that support. Read all four meanings, then tap the one that fits this text." },
      interaction: { type: "choose", options: [{ id: "huge-pieces-of-the-crust", label: "huge pieces of the crust" }, { id: "the-shell-around-the-planet", label: "the shell around the planet" }, { id: "the-hot-rock-deep-inside", label: "the hot rock deep inside" }, { id: "the-oceans-of-the-world", label: "the oceans of the world" }], correctId: "huge-pieces-of-the-crust", coachWrong: "Read the sentence with the word called in it. What is cracked into pieces, and what does the text call those pieces?" },
    },
    {
      id: "guided-choose-plates-clue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words told you what plates means?",
      narration: { audio: A("guided-choose-plates-clue"), script: "Now point to the support. Here is the sentence again. The crust is cracked into enormous pieces called plates, and the plates carry the oceans and the continents on their backs. All four of these come from page one, but only one group of words tells you what a plate is. Tap it." },
      interaction: { type: "choose", options: [{ id: "cracked-into-enormous-pieces", label: "cracked into enormous pieces" }, { id: "as-still-as-a-floor", label: "as still as a floor" }, { id: "always-slowly-moving", label: "always slowly moving" }, { id: "on-their-backs", label: "on their backs" }], correctId: "cracked-into-enormous-pieces", coachWrong: "Those words are on page one, but they do not tell you what a plate is. Look for the words right before the word called." },
    },
    {
      id: "page-two-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: The plates creep along at about the speed your fingernails grow, so nobody feels them move. Where two plates meet, their rough edges catch on each other and stick. The rock bends a little more every year, the way a stick bends before it snaps.",
      narration: { audio: A("page-two-read"), script: "Page two is yours. Read all three sentences out loud, and notice the comparison at the very end." },
      interaction: { type: "speak", text: "The plates creep along at about the speed your fingernails grow so nobody feels them move Where two plates meet their rough edges catch on each other and stick The rock bends a little more every year the way a stick bends before it snaps" },
    },
    {
      id: "page-three-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("fault-across-field"),
      narration: { audio: A("page-three-read"), script: "Page three holds the big moment, and two of its words are words you already use every day. Read along with me, and watch what happens to them." },
      interaction: { type: "read-along", text: "One day the stuck edges slip all at once, and the result is an earthquake. The crack where the rock slipped is called a fault, and a large fault can run for hundreds of miles. Shaking spreads out from the fault in waves, like the rings that spread when a stone drops into a pond.", audio: A("page-three-read-sentence") },
    },
    {
      id: "model-everyday-word-trap",
      purpose: "model",
      gate: "none",
      prompt: "An everyday word can carry an expert meaning.",
      fx: {"text":"In this text, a **fault** is a crack in the rock","effect":"pop-words"},
      narration: { audio: A("model-everyday-word-trap"), script: "Here is a trap that catches many readers. Page three said, the crack where the rock slipped is called a fault. You know the word fault. If you spill the milk, it is your fault. But that meaning makes no sense in a sentence about rock. In a text about earthquakes, the expert borrows an everyday word and gives it an expert meaning, and the support is right there. The crack where the rock slipped is called a fault. So here, a fault is a crack in the crust, and nobody is to blame. Plates worked the same way on page one. Not dishes, but pieces of the crust. Whenever a word you know does not fit the topic, stop, and look for the expert meaning the text hands you." },
    },
    {
      id: "guided-choose-waves-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does waves mean in this text?",
      narration: { audio: A("guided-choose-waves-meaning"), script: "Now you catch the trap. Page three said, shaking spreads out from the fault in waves, like the rings that spread when a stone drops into a pond. You know the word waves from the beach, and from saying hello. Test those meanings against the sentence and its comparison. Read all four, then tap the meaning of waves in this text." },
      interaction: { type: "choose", options: [{ id: "shaking-that-spreads-outward", label: "shaking that spreads outward" }, { id: "big-rolls-of-ocean-water", label: "big rolls of ocean water" }, { id: "hands-moving-to-say-hello", label: "hands moving to say hello" }, { id: "cracks-along-a-long-road", label: "cracks along a long road" }], correctId: "shaking-that-spreads-outward", coachWrong: "Use the comparison. Rings spread out from the spot where the stone drops. Which meaning spreads out from the fault the same way?" },
    },
    {
      id: "page-four-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Scientists who study earthquakes observe every tremble, even the ones too small for people to feel. They use a seismograph, a machine that records shaking as a wiggly line. A big earthquake makes tall, sharp wiggles, but a tiny one barely moves the line.",
      narration: { audio: A("page-four-read"), script: "Page four is yours, and it holds an expert word with its support sitting right beside it. Read all three sentences out loud." },
      interaction: { type: "speak", text: "Scientists who study earthquakes observe every tremble even the ones too small for people to feel They use a seismograph a machine that records shaking as a wiggly line A big earthquake makes tall sharp wiggles but a tiny one barely moves the line" },
    },
    {
      id: "model-school-words",
      purpose: "model",
      gate: "none",
      prompt: "School words show up in every subject.",
      fx: {"text":"**observe**, **result**, **compare**: words that travel to every subject","effect":"pop-words"},
      narration: { audio: A("model-school-words"), script: "Page four hands you a second kind of big word. Scientists observe every tremble. Observe is not an earthquake word. A cook can observe the soup, and a coach can observe the team. I call words like observe school words, because they show up in every subject, in science, in history, and in math. Result, on page three, is a school word too. The stuck edges slip, and the result is an earthquake. A result is what comes out of something. School words get support the same way expert words do. Observe every tremble, even the ones too small for people to feel. If the scientists notice trembles that small, observe must mean to watch very closely. So keep two piles in your head as you read. Expert words belong to the topic. School words go with you into every class." },
    },
    {
      id: "page-five-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("seismograph-station"),
      narration: { audio: A("page-five-read"), script: "Last page. Read along with me, and keep both piles ready, expert words and school words." },
      interaction: { type: "read-along", text: "Scientists compare the lines from many stations, and the station with the earliest wiggle tells them where the quake began. After a large earthquake, smaller quakes called aftershocks can rattle the same area for days or even weeks. Nobody can stop the plates from moving, but people can build towers and bridges that sway instead of snap. If the ground ever shakes under you, the safest move is to drop to the floor, crawl under a strong table, and hold on.", audio: A("page-five-read-sentence") },
    },
    {
      id: "apply-sort-expert-school",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: Expert Word, or School Word?",
      narration: { audio: A("apply-sort-expert-school"), script: "Here are six big words from our text. For each one, ask this. Does this word belong to earthquakes, or could it show up in a book about anything? If it belongs to the topic, drag it to Expert Word. If it travels to every subject, drag it to School Word." },
      interaction: { type: "sort", buckets: ["Expert Word","School Word"], items: [{ label: "crust", bucket: "Expert Word" }, { label: "observe", bucket: "School Word" }, { label: "fault", bucket: "Expert Word" }, { label: "result", bucket: "School Word" }, { label: "seismograph", bucket: "Expert Word" }, { label: "compare", bucket: "School Word" }], coachWrong: "Ask the question again. Would a book about cooking, or a book about castles, ever use that word? If it would, the word is a school word." },
    },
    {
      id: "apply-choose-compare-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does compare mean in this text?",
      narration: { audio: A("apply-choose-compare-meaning"), script: "Page five used the school word compare. Scientists compare the lines from many stations, and the station with the earliest wiggle tells them where the quake began. The support is in the second half of the sentence. Think about what the scientists must do with all those lines to find the earliest one. Read all four, then tap the meaning of compare." },
      interaction: { type: "choose", options: [{ id: "look-at-them-side-by-side", label: "look at them side by side" }, { id: "throw-them-all-away", label: "throw them all away" }, { id: "draw-them-one-more-time", label: "draw them one more time" }, { id: "read-them-out-loud", label: "read them out loud" }], correctId: "look-at-them-side-by-side", coachWrong: "To find the earliest wiggle, the scientists need every line in front of them at once. What are they doing with the lines?" },
    },
    {
      id: "apply-choose-aftershocks",
      purpose: "apply",
      gate: "interaction",
      prompt: "What are aftershocks?",
      narration: { audio: A("apply-choose-aftershocks"), script: "One more expert word, and this time you run the whole move on your own. Page five said, after a large earthquake, smaller quakes called aftershocks can rattle the same area for days or even weeks. Find the support, then read all four, and tap what aftershocks are." },
      interaction: { type: "choose", options: [{ id: "smaller-quakes-that-follow", label: "smaller quakes that follow" }, { id: "the-first-and-biggest-shake", label: "the first and biggest shake" }, { id: "towers-that-sway-in-wind", label: "towers that sway in wind" }, { id: "cracks-that-run-for-miles", label: "cracks that run for miles" }], correctId: "smaller-quakes-that-follow", coachWrong: "Look right before the word called. What kind of quakes does the text name there, and when do they happen?" },
    },
    {
      id: "challenge-speak-seismograph",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Explain a seismograph like a scientist would, then say the clue that told you.",
      narration: { audio: A("challenge-speak-seismograph"), script: "Last one, and now you are the expert. Page four used the word seismograph. Tap the mic. Tell me what a seismograph is in your own words, the way a scientist would explain it to a friend, and then tell me which words in the text gave you the meaning." },
      interaction: { type: "speak", text: "machine tool device records record recording measures measure shaking shakes shake earthquakes earthquake wiggly wiggles wiggle line lines paper draws draw shows show tremble trembles scientists big small called" },
    },
    {
      id: "celebrate-expert-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "Expert words, school words, worked out from the text.",
      fx: {"text":"Expert words and **school words**, worked out from the **text**","effect":"fireworks"},
      narration: { audio: A("celebrate-expert-reader"), script: "Today you read a true text full of big words, and not one of them stopped you. Expert words like crust, fault, and seismograph belong to the topic, and the text handed you their meanings with a definition, an example, or a comparison. School words like observe, compare, and result travel to every subject. And when an everyday word like plate or fault turned up in an expert sentence, you stopped, looked for the expert meaning, and found it. That is how a scientist reads, and now it is how you read." },
    },
  ],
};
