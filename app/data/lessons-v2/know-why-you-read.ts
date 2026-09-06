import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./know-why-you-read-timings.json";

// Know Why You Read (RF.3.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=know-why-you-read
// G3-U3 lesson 1 · READ WITH PURPOSE tier of RF.3.4. Sibling split: smooth-and-sure
// RF.3.4 (the umbrella habit + understanding checks on one chapter, the greenhouse
// frost), read-with-your-brain RF.2.4a (G2 purpose + sense check, Pip the bear),
// reading-with-purpose RF.1.4a (G1 ask/read/answer/check loop, Wren and the frog),
// search-like-a-pro RI.3.5 (locating with headings/key words, NOT taught here),
// RF.3.4b (rate/expression on poetry) and RF.3.4c (self-correction) follow in U3.
// THIS owns: name the why BEFORE the read (to enjoy a story / to follow the
// steps / to find one fact / to learn how something works), the why changes HOW
// you read (settle in and picture it / in order, skip nothing / move quickly then
// slow down at the right part / stop and check each part), and the CHECK after
// the read is tied to the why (can I tell what happened / can I do the steps in
// order / did I find it). ONE world, three texts: "The Shadow Show" (Anya, little
// brother Ivo, Aunt Wanda's hallway theater, a swan shadow), "How to Make a
// Shadow Dog" (four safe hand steps), "Why Shadows Grow" (true facts: light in
// straight lines, blocked light = shadow, closer to the lamp blocks more light, a
// cloud wipes sun shadows away). 16 sentences over 6 child-read pages (read-along
// 1/3/5 with images, accept-mode speaks 2/4/6 at 52/45/44 tokens; a 72-token page
// six put the mic button below a 720px fold, so the fact page is split 3+2),
// compound + early-complex, tagged dialogue on the story pages, stretch words
// theater / wobbled / share / drifting with in-text support, no
// digits, no " my " token in any speak text. ANCHOR FRESHNESS grep-swept vs every
// lessons-v2 + quizzes-v2 file: Anya, Ivo, Wanda, swan, shadow show, shadow dog,
// hallway theater, pinky, pinwheel, Tobin, Hamid, Bernard all 0-hit. Keys
// prefixed quiz- are fresh stimuli for the quiz (Tobin, Hamid, the pinwheel).

const A = (id: string) => `/audio/lessons-v2/know-why-you-read/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/know-why-you-read/${w.toLowerCase()}.png`;

export const knowWhyYouReadImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A long narrow hallway at night with a plain white wall, a small lamp sitting on the wooden floor shining at the wall, a girl about nine years old with medium brown skin and curly dark hair in a yellow sweater holding both hands up in front of the lamp, a large dark swan-shaped shadow with a long curved neck cast on the white wall, a smaller boy about six years old with the same brown skin and short curly hair in a striped blue shirt sitting cross-legged tapping a wooden spoon on an upside-down cooking pot, a woman with short gray-streaked hair in a purple cardigan smiling from an armchair at the far end of the hallway. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": "A close view of a single child's hand held up sideways in front of a small lamp, fingers pressed together and thumb pointing straight up, casting a crisp dark dog-head shadow with one pointed ear and an open mouth on a plain white wall, warm lamplight, nothing else in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-5": { subject: "The same girl about nine years old with medium brown skin and curly dark hair in a yellow sweater kneeling on a wooden floor and holding one open hand very close to a small lamp on the floor, an enormous dark hand-shaped shadow filling almost the whole plain white wall behind her, the same smaller boy in a striped blue shirt looking up at the giant shadow with his mouth open in surprise. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-pinwheel-hill": "A boy about nine years old with pale skin and curly black hair in a red zip-up jacket standing on top of a round grassy hill holding up a spinning paper pinwheel with blue and orange blades on a pencil, tall grass bending sideways in a strong wind, an older teenage boy with tan skin and short dark hair in a green hoodie standing beside him with his hair blowing, a small farmhouse and a pear tree at the bottom of the hill, blue sky with a few white clouds. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-pinwheel-parts": "A wooden tabletop seen from above with a square of plain orange paper that has four straight cuts running from each corner toward the middle but stopping before the center, a single silver pushpin, a yellow pencil with a pink eraser, and a pair of blunt safety scissors, nothing else on the table. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no signs, no writing anywhere.",
  "quiz-pinwheel-in-tree": { subject: "The same boy about nine years old with pale skin and curly black hair in a red zip-up jacket standing under a leafy pear tree and looking up with his hands on his hips, the paper pinwheel with blue and orange blades stuck high on a branch among green pears, the same older teenage boy in a green hoodie pointing up at it, a grassy hill behind them, windy blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-pinwheel-hill" }
};

export const knowWhyYouRead: LessonDef = {
  id: "know-why-you-read",
  title: "Know Why You Read",
  grade: "3rd Grade",
  standard: "RF.3.4a",
  archetype: "fluency",
  objective: "I can name why I am reading before I start, read the page in the way that why needs, and check at the end that the why was met.",
  concepts: [
    "before you read, ask why am I reading this, and name the why",
    "to enjoy a story: settle in, keep a talking pace, picture it",
    "to follow steps: read every step in order and skip nothing",
    "to find one fact: move quickly, then slow down at the part that answers the question",
    "the check matches the why: can I tell what happened, can I do the steps in order, did I find it",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you read a story to enjoy it, a how-to to follow its steps, and a fact page to find one fact, and each why changed how you read. Name the why before you start reading, read that way, and check at the end. That is reading with purpose.",
    "title": "Know Why You Read",
    "body": "You named a why before each text, read it that way, and checked that the why was met."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Shadow Show, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Before a strong reader opens a page, she decides why she is reading it, because the why changes how she reads. Today you will read three short texts from one evening at Aunt Wanda's house, and each one gets a different why. Here is page one of The Shadow Show. This page is a story, so the why is to enjoy it. Settle in, picture it, and read along with me." },
      interaction: { type: "read-along", text: "On the last night of their visit, Anya and Ivo turned Aunt Wanda's long hallway into a theater, with a lamp on the floor and a bare white wall for a screen. Anya folded her hands into a swan, and its shadow bowed and stretched across the wall while Ivo tapped a spoon on a pot for the music. \"Make it fly higher!\" called Aunt Wanda from her chair at the end of the hall.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-name-the-why",
      purpose: "model",
      gate: "none",
      prompt: "Before you read, name your why.",
      fx: {"text":"Why am I **reading** this?","effect":"pop-words"},
      narration: { audio: A("model-name-the-why"), script: "Here is the habit. Before I read a page, I ask one question. Why am I reading this? I name the why out loud, and the why tells me how to read. For page one the why was to enjoy the story, so I settled in, I kept a talking pace, and I pictured the hallway, the lamp, and the swan on the wall. When the why is to follow steps, I read every step in order and skip nothing. When the why is to find one fact, I move quickly until I reach the right part, and then I slow down. When the why is to learn how something works, I stop after each part and check that it made sense. After the read comes the check, and the check matches the why. For a story the check is, can I picture it, and can I tell what happened? I can. Two children put on a shadow show in a hallway, and Aunt Wanda called for the swan to fly higher. Name the why, read that way, then check." },
    },
    {
      id: "guided-choose-why-flyer",
      purpose: "guided",
      gate: "interaction",
      prompt: "Ivo needs the start time from the flyer. What is your why?",
      narration: { audio: A("guided-choose-why-flyer"), script: "Now you name a why. Ivo hands you a flyer about a shadow show at the library, and all he wants from it is the time the show starts. Four whys are on your screen. Tap the why that fits this read." },
      interaction: { type: "choose", options: [{ id: "to-find-one-fact", label: "to find one fact" }, { id: "to-enjoy-the-story", label: "to enjoy the story" }, { id: "to-follow-the-steps", label: "to follow the steps" }, { id: "to-learn-how-it-works", label: "to learn how it works" }], correctId: "to-find-one-fact", coachWrong: "Think about what Ivo needs from the flyer. Does he need the whole page, or one small piece of it?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Anya slid her hands closer to the lamp, and the swan grew until its neck reached the ceiling. Then Ivo stepped in front of the lamp, and his own shadow wiped the swan right off the wall. \"The giant ate the swan,\" said Anya, laughing so hard that the whole swan wobbled.",
      narration: { audio: A("page-2-read"), script: "Page two of the story is yours. Name the why first. It is a story, so the why is to enjoy it. Settle in, picture it, keep a talking pace, and read all three sentences out loud, because the check comes next." },
      interaction: { type: "speak", text: "Anya slid her hands closer to the lamp and the swan grew until its neck reached the ceiling Then Ivo stepped in front of the lamp and his own shadow wiped the swan right off the wall The giant ate the swan said Anya laughing so hard that the whole swan wobbled" },
    },
    {
      id: "guided-check-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "The check for a story: what happened on page two?",
      narration: { audio: A("guided-check-page-2"), script: "Here is the check, and it matches the why. You read to enjoy the story, so the check is, can I tell what happened? Tap the card that tells what happened when Ivo stepped in front of the lamp." },
      interaction: { type: "choose", options: [{ id: "his-shadow-covered-the-swan", label: "his shadow covered the swan" }, { id: "the-lamp-tipped-over", label: "the lamp tipped over" }, { id: "the-swan-slid-off-the-wall", label: "the swan slid off the wall" }, { id: "aunt-wanda-closed-the-door", label: "Aunt Wanda closed the door" }], correctId: "his-shadow-covered-the-swan", coachWrong: "Reread the second sentence of page two. What did Ivo's shadow do to the swan?" },
    },
    {
      id: "model-follow-the-steps",
      purpose: "model",
      gate: "none",
      prompt: "A new why: to follow the steps.",
      fx: {"text":"**In order.** Skip **nothing**.","effect":"pop-words"},
      narration: { audio: A("model-follow-the-steps"), script: "The next text is not a story. It tells how to make a shadow dog, one step at a time, so the why changes. The why is to follow the steps, and that changes how I read. I read the steps in order, I skip nothing, and after each step I picture my own hand doing it before I move on. The check for this why is different too. The check is, can I do the steps in order? Here comes the first page of the how-to. Read along, and picture each step with your own hand." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "How to Make a Shadow Dog, page one. Read along, in order.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is the first page of the how-to. The why is to follow the steps. Read along with me, in order, and picture your hand doing each step." },
      interaction: { type: "read-along", text: "You can make a shadow dog with one hand and a lamp. First, sit between the lamp and a bare wall, and hold one hand up sideways with your fingers pressed together, so that the flat side faces the wall. Second, lift your thumb straight up, and the thumb becomes one ear standing on top of the head.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two of the how-to: Third, bend your pinky finger down and back up to open and close the mouth, and the dog will bark. Fourth, slide your hand closer to the lamp to make the dog grow, and pull it back toward the wall to make it small again.",
      narration: { audio: A("page-4-read"), script: "The last two steps are yours. The why is still to follow the steps, so read them in order, skip nothing, and picture your hand doing each one. Read both sentences out loud." },
      interaction: { type: "speak", text: "Third bend your pinky finger down and back up to open and close the mouth and the dog will bark Fourth slide your hand closer to the lamp to make the dog grow and pull it back toward the wall to make it small again" },
    },
    {
      id: "apply-sequence-steps",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The check: put the four steps in order.",
      narration: { audio: A("apply-sequence-steps"), script: "Here is the check for a how-to. Can I do the steps in order? Four cards are on your screen, one for each step, and they are mixed up. Tap them in the order the how-to gave them, from the first step to the last." },
      interaction: { type: "sequence", items: [{ id: "hold-hand-sideways", label: "hold one hand up sideways" }, { id: "lift-thumb-ear", label: "lift your thumb for the ear" }, { id: "bend-pinky-bark", label: "bend your pinky to bark" }, { id: "slide-closer-lamp", label: "slide closer to the lamp" }], order: ["hold-hand-sideways", "lift-thumb-ear", "bend-pinky-bark", "slide-closer-lamp"], coachWrong: "Picture your hand. What has to happen before that step can work? Begin with the very first thing the how-to told you to do." },
    },
    {
      id: "model-find-one-fact",
      purpose: "model",
      gate: "none",
      prompt: "A new why: to find one fact.",
      fx: {"text":"Find **one** fact.","effect":"spotlight"},
      narration: { audio: A("model-find-one-fact"), script: "The last text is a fact page about shadows, and this time I am not reading the whole thing for fun. I have one question. What makes a shadow grow bigger? So the why is to find one fact, and that changes how I read again. I move quickly through the parts that do not answer the question, and when I reach the part that does, I slow down and read it carefully. The check is, did I find it? Here comes the first page. Keep the question in your head. What makes a shadow grow bigger?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Why Shadows Grow, page one. Read along, and keep the question in your head.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is page one of the fact page. Read along with me, and notice whether this page answers the question yet." },
      interaction: { type: "read-along", text: "Light from a lamp travels in straight lines, and it cannot bend around the things in its path. When your hand blocks some of that light, the dark shape left on the wall is a shadow. Outside, the sun makes shadows the same way, and one cloud drifting in front of the sun can wipe them all away at once.", audio: A("page-5-read-sentence") },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Move your hand close to the lamp, and it blocks a much bigger share of the light, so the shadow on the wall grows. Pull your hand back toward the wall, and it blocks less light, so the shadow shrinks and its edges turn sharp.",
      narration: { audio: A("page-6-read"), script: "Page two is yours, and the answer is somewhere on it. The why is to find one fact, so move through the page, and slow down when you reach the part that answers the question. Read both sentences out loud." },
      interaction: { type: "speak", text: "Move your hand close to the lamp and it blocks a much bigger share of the light so the shadow on the wall grows Pull your hand back toward the wall and it blocks less light so the shadow shrinks and its edges turn sharp" },
    },
    {
      id: "apply-check-found-it",
      purpose: "apply",
      gate: "interaction",
      prompt: "The check: did you find it? What makes a shadow grow bigger?",
      narration: { audio: A("apply-check-found-it"), script: "Here is the check for this why. Did I find it? Tap the card that tells what makes a shadow grow bigger, the way the fact page said it." },
      interaction: { type: "choose", options: [{ id: "it-blocks-more-of-the-light", label: "it blocks more of the light" }, { id: "the-lamp-gets-brighter", label: "the lamp gets brighter" }, { id: "the-wall-moves-farther-away", label: "the wall moves farther away" }, { id: "the-light-bends-around-it", label: "the light bends around it" }], correctId: "it-blocks-more-of-the-light", coachWrong: "Reread the first sentence of page two. What does a hand close to the lamp do to the light?" },
    },
    {
      id: "apply-sort-why",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each read: Read to Enjoy, or Read to Find or Follow?",
      narration: { audio: A("apply-sort-why"), script: "Six cards, six reads. Read each card and name the why. If you would read it to enjoy it, drag it to Read to Enjoy. If you would read it to find one thing or to follow steps, drag it to Read to Find or Follow." },
      interaction: { type: "sort", buckets: ["Read to Enjoy","Read to Find or Follow"], items: [{ label: "a story before bed", bucket: "Read to Enjoy" }, { label: "the rules of a card game", bucket: "Read to Find or Follow" }, { label: "a comic about a pirate ship", bucket: "Read to Enjoy" }, { label: "when the pool opens", bucket: "Read to Find or Follow" }, { label: "a poem your aunt loves", bucket: "Read to Enjoy" }, { label: "how to fold a paper hat", bucket: "Read to Find or Follow" }], coachWrong: "Ask what you want from that read. A good time, or one answer or a set of steps to do?" },
    },
    {
      id: "challenge-speak-name-the-why",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Aunt Wanda hands you a card that shows how to make a swan shadow. Say your why, and say how you will check.",
      narration: { audio: A("challenge-speak-name-the-why"), script: "Last one, with no cards to tap. Aunt Wanda hands you a small card that shows how to make a swan shadow with your hands, one move at a time. Tap the mic. Say why you would read that card, say how you would read it, and then say what you would do at the end to check that you got it." },
      interaction: { type: "speak", text: "follow follows following steps step order in first second next then last skip skipping nothing do make made try hands hand swan check checked each every works worked did done can could moves move slowly picture picturing" },
    },
    {
      id: "celebrate-know-why",
      purpose: "celebrate",
      gate: "none",
      prompt: "Three texts, three whys, three ways to read.",
      fx: {"text":"Know **why** you read.","effect":"fireworks"},
      narration: { audio: A("celebrate-know-why"), script: "Three texts, three whys, three different ways to read. You settled in for a story and told what happened. You followed steps in order and put them back in order. You hunted one fact, slowed down at the right part, and found it. Before every page this week, ask why you are reading it, read that way, and then check." },
    },
  ],
};
