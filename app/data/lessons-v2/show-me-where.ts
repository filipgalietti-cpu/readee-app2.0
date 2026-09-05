import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./show-me-where-timings.json";

// Show Me Where (RL.3.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=show-me-where
// G3-U1 lesson 3. EXPLICIT TEXT REFERENCE tier of RL.3.1 (sibling split:
// ask-and-answer-g2 RL.2.1 owns the 5 W's + how at G2; ask-it-find-it RL.1.1
// owns G1 ask-and-find; prove-it RI.1.8 owns author reasons; the-whole-story
// RL.2.10 is the G2 capstone. THIS lesson owns "answer, then point to the
// line": right there answers (one sentence), put together answers (two lines
// combined), and guesses with no line ("the story does not say"), plus the
// asking half (which question does this line answer). ONE original story,
// "The Wall on Pine Street": 14 sentences over 5 child-read pages (read-along
// 1/3/5, speak 2/4), compound + early-complex sentences, dialogue with speech
// tags, stretch words bare / sketching / backdrop / downpour / smeared with
// in-text support. Planted: the put together (line 9 rule + line 10 Friday
// sky; line 6 + line 8 whose reeds) and the guess traps (why a heron, why was
// the wall bare) that no line answers. ANCHOR FRESHNESS grep-swept vs every
// lessons-v2 + quizzes-v2 file: Amara, Farah, Pine Street, heron, marsh,
// mural, bus stop, downpour, smeared, backdrop all fresh (0 hits); reeds only
// as a G2 sheep-meadow prop. Keys prefixed quiz- are fresh stimuli for the
// quiz (Jonah, Mr. Abara, the sour violin string: violin/recital/tin box
// fresh).

const A = (id: string) => `/audio/lessons-v2/show-me-where/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/show-me-where/${w.toLowerCase()}.png`;

export const showMeWhereImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with dark brown skin and two puffy pigtails wearing a green backpack, standing beside a small wooden bus stop bench with a little roof, next to a tall bare gray concrete wall at the end of a quiet tree-lined street, while a woman with a long gray braid in overalls spotted with paint stands on a ladder drawing a large simple outline of a tall long-legged bird on the wall with a stick of blue chalk, soft morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same young girl with dark brown skin and two puffy pigtails standing on the sidewalk in a sudden heavy rain shower beside the same tall gray wall, holding a wide paintbrush and looking upset, while the freshly painted tall green reeds along the bottom of the wall drip and smear downward into long runny green streaks on the sidewalk, the same woman with a long gray braid in paint spotted overalls standing on the ground next to her holding a blue tarp over the paint cans, an empty wooden ladder leaning against the wall with nobody on it, dark rain clouds overhead. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same tall wall at the end of the quiet tree-lined street now completely covered by a finished bright mural of a marsh full of tall green reeds with one large gray heron standing in the middle, the same young girl with dark brown skin and two puffy pigtails wearing a green backpack smiling up at it from the same small wooden bus stop bench with a little roof, sunny morning. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-violin-practice": "A boy with light brown skin and short curly black hair standing in a cozy bedroom at night playing a wooden violin with a bow, a small desk lamp glowing, a plain empty wooden music stand beside him, a window showing a dark blue night sky with a few stars and a plain simple crescent moon with no face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces on objects, no letters, no words, no numbers, no musical notes, no writing anywhere.",
  "quiz-snapped-string": "A close view of a wooden violin lying on a chair with one thin string snapped and curling up loose from the neck while the other strings stay straight and tight, a bow resting beside it, warm indoor light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-tin-box": "A small open round silver tin box sitting on a wooden teacher's desk with several coiled shiny violin strings inside it, a cup of pencils and a green apple beside it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const showMeWhere: LessonDef = {
  id: "show-me-where",
  title: "Show Me Where",
  grade: "3rd Grade",
  standard: "RL.3.1",
  archetype: "story-elements",
  objective: "I can answer a question about a story and point to the exact line that proves it.",
  concepts: [
    "answer, then point to the line",
    "right there: one sentence holds the proof",
    "put together: two lines make the proof",
    "no line means it is a guess",
    "which question does this line answer",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You answered questions about The Wall on Pine Street, and you pointed to the line every single time. Right there answers, put together answers, and the honest words, the story does not say. That is how third grade readers prove what they know.",
    "title": "Answer, Then Point!",
    "body": "You answered questions about a story and pointed to the exact lines that prove each answer."
  },
  scenes: [
    {
      id: "hook-pine-street",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Wall on Pine Street, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-pine-street"), script: "Hello, reader. In third grade, answering a question about a story is only half the job. The other half is showing where the story says it. Here is page one of The Wall on Pine Street. Read along with me, and notice how much this one page tells you." },
      interaction: { type: "read-along", text: "All spring, a bare gray wall stood at the end of Pine Street, right beside the bus stop where Amara waited every morning. One Saturday, a woman in overalls spotted with paint leaned a ladder against the wall and began sketching a tall bird with a stick of blue chalk. \"I'm Farah,\" she said, \"and by the end of the month, this wall will be a marsh full of reeds, with a heron standing in the middle.\"", audio: A("hook-pine-street-sentence") },
    },
    {
      id: "model-right-there",
      purpose: "model",
      gate: "none",
      prompt: "Answer, then point to the line.",
      fx: {"text":"Answer, then **point to the line**","effect":"underline"},
      narration: { audio: A("model-right-there"), script: "Here is how I do both halves. My question is, what did the woman use to sketch the bird? I think I know, but a third grade reader does not stop at the answer. I hunt through page one until I find the sentence, and I read it back as my proof. The story says, began sketching a tall bird with a stick of blue chalk. There it is. Answer, blue chalk. Proof, that line. When one sentence holds the whole proof, I call it a right there answer." },
    },
    {
      id: "guided-choose-proof-line",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where did Amara wait every morning? Tap the line that proves it.",
      narration: { audio: A("guided-choose-proof-line"), script: "Your turn to point. Where did Amara wait every morning? Say the answer in your head. Now do the pointing half. Four lines from page one are on your screen, and only one of them proves your answer. Tap that line." },
      interaction: { type: "choose", options: [{ id: "beside-the-bus-stop", label: "beside the bus stop" }, { id: "leaned-a-ladder-against", label: "leaned a ladder against" }, { id: "a-stick-of-blue-chalk", label: "a stick of blue chalk" }, { id: "a-marsh-full-of-reeds", label: "a marsh full of reeds" }], correctId: "beside-the-bus-stop", coachWrong: "That line is really in the story, but it answers a different question. Find the line that tells where Amara waited." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Amara asked if she could help, because she had painted the backdrop for the school play. Farah handed her a wide brush and pointed at the reeds sketched along the bottom of the wall. Every afternoon that week, Amara painted reeds while Farah worked high on the ladder, filling in the heron's gray wings.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and keep track of who does what, because you will need to point to it soon." },
      interaction: { type: "speak", text: "Amara asked if she could help because she had painted the backdrop for the school play Farah handed her a wide brush and pointed at the reeds sketched along the bottom of the wall Every afternoon that week Amara painted reeds while Farah worked high on the ladder filling in the heron's gray wings" },
    },
    {
      id: "guided-choose-which-question",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question does this line answer?",
      fx: {"text":"Amara asked if she could help, **because** she had painted the backdrop for the school play.","effect":"glow"},
      narration: { audio: A("guided-choose-which-question"), script: "Now comes the asking half. Strong readers can look at one line and know which question it answers. Here is a line from page two. Read it again, and think about what it tells you. Four questions are on your screen. Tap the question that this line answers." },
      interaction: { type: "choose", options: [{ id: "why-did-amara-offer-to-help", label: "why did amara offer to help" }, { id: "what-color-was-the-chalk", label: "what color was the chalk" }, { id: "who-sketched-the-bird", label: "who sketched the bird" }, { id: "where-is-the-bus-stop", label: "where is the bus stop" }], correctId: "why-did-amara-offer-to-help", coachWrong: "The story can answer that question, but not with this line. Look at the word because. What does this line explain?" },
    },
    {
      id: "model-guess-no-line",
      purpose: "model",
      gate: "none",
      prompt: "An answer with no line is a guess.",
      fx: {"text":"No line? Then it is a **guess**","effect":"cross-out"},
      narration: { audio: A("model-guess-no-line"), script: "Here is the trap that catches many third graders. Someone asks, why did Farah choose a heron? A smart sounding answer pops up: because herons live near Pine Street. Now hunt for the line. Page one says she sketched a tall bird. Page one says a heron will stand in the middle. Not one line says why she picked it. An answer with no line to back it is a guess, and a guess is not proof. When that happens, the honest answer is, the story does not say." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the weather.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Something goes wrong on page three. Read along with me." },
      interaction: { type: "read-along", text: "On Thursday, a sudden downpour swept down Pine Street before the reeds had dried. By the time it passed, half of the reeds had smeared into long green streaks, and Amara's stomach dropped. \"We only paint when the sky is clear,\" said Farah, \"because wet paint runs in the rain.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-highlight-what-ruined",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "What ruined the reeds? Tap the two words that name it.",
      narration: { audio: A("guided-highlight-what-ruined"), script: "What ruined the reeds? You know it. Now point to it. Here are the first two sentences of page three. Find the two words that name what swept down Pine Street, and tap them both." },
      interaction: { type: "highlight", text: "On Thursday, a sudden downpour swept down Pine Street before the reeds had dried. By the time it passed, half of the reeds had smeared into long green streaks, and Amara's stomach dropped.", targets: ["sudden", "downpour"], coachWrong: "That word is part of the story, but it does not name what ruined the reeds. Find what came down Pine Street on Thursday." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: On Friday, the sky was clear and blue, so they carried the ladder back to the wall. They repainted every smeared reed before dinner, and Amara checked the sky between every stroke. \"Next time,\" she said, \"I will read the weather report before I open a single can of paint.\"",
      narration: { audio: A("page-4-read"), script: "Page four is yours, and it holds a line you will need in a minute. Read all three sentences out loud." },
      interaction: { type: "speak", text: "On Friday the sky was clear and blue so they carried the ladder back to the wall They repainted every smeared reed before dinner and Amara checked the sky between every stroke Next time she said I will read the weather report before I open a single can of paint" },
    },
    {
      id: "model-put-together",
      purpose: "model",
      gate: "none",
      prompt: "Some answers take two lines.",
      fx: {"text":"**Two** lines, **one** answer","effect":"pop-words"},
      narration: { audio: A("model-put-together"), script: "Some questions have no single line. My question is, whose reeds smeared in the rain? Page three says, half of the reeds had smeared. That tells me what happened, but not whose. So I keep hunting. Page two says, Amara painted reeds while Farah worked high on the ladder. Now I put the two lines together. Amara painted the reeds, and the reeds smeared, so Amara's reeds smeared. Two lines, one answer. I call that a put together answer, and I point to both lines." },
    },
    {
      id: "apply-choose-finish-proof",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why did they wait until Friday? Tap the line that finishes the proof.",
      narration: { audio: A("apply-choose-finish-proof"), script: "Now you build a put together answer. Why did Amara and Farah wait until Friday to fix the reeds? Here is the first half of the proof. Page three says, we only paint when the sky is clear. That is the rule, but it is not the whole answer. Tap the line that finishes the proof." },
      interaction: { type: "choose", options: [{ id: "the-sky-was-clear-and-blue", label: "the sky was clear and blue" }, { id: "the-reeds-had-smeared", label: "the reeds had smeared" }, { id: "repainted-every-smeared-reed", label: "repainted every smeared reed" }, { id: "a-sudden-downpour-swept-down", label: "a sudden downpour swept down" }], correctId: "the-sky-was-clear-and-blue", coachWrong: "That line is true, but it does not connect to the rule. The rule is about the sky. Which line matches it?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and check whether Farah kept her word." },
      interaction: { type: "read-along", text: "By the end of the month, a heron stood in a marsh full of reeds at the end of Pine Street, exactly as Farah had promised. Amara still waits at that bus stop every morning, and she always checks that her reeds are standing tall.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-sort-in-the-story",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: In the Story, or Not in the Story?",
      narration: { audio: A("apply-sort-in-the-story"), script: "Here are six statements about The Wall on Pine Street. Some of them have a line in the story that says so. Some of them sound possible, but no line says it anywhere. Read each statement. If you can point to a line, drag it to In the Story. If there is no line, drag it to Not in the Story." },
      interaction: { type: "sort", buckets: ["In the Story","Not in the Story"], items: [{ label: "amara painted the reeds", bucket: "In the Story" }, { label: "the bus was late", bucket: "Not in the Story" }, { label: "the rain came on thursday", bucket: "In the Story" }, { label: "amara has a little brother", bucket: "Not in the Story" }, { label: "farah handed amara a brush", bucket: "In the Story" }, { label: "farah lives on pine street", bucket: "Not in the Story" }], coachWrong: "Hunt for the line. If you can find a sentence that says it, it is in the story. If every page comes up empty, it is not." },
    },
    {
      id: "apply-choose-story-does-not-say",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why was the wall bare all spring?",
      narration: { audio: A("apply-choose-story-does-not-say"), script: "Here is a question with a trap in it. Why was the wall bare all spring? Think about every page you read. Before you tap, hunt for a line that says so. If no line backs an answer, you know what to do." },
      interaction: { type: "choose", options: [{ id: "the-story-does-not-say", label: "the story does not say" }, { id: "the-old-paint-had-peeled-off", label: "the old paint had peeled off" }, { id: "nobody-owned-the-wall", label: "nobody owned the wall" }, { id: "the-city-ran-out-of-money", label: "the city ran out of money" }], correctId: "the-story-does-not-say", coachWrong: "That sounds possible, but can you point to the line? If no page says it, it is a guess." },
    },
    {
      id: "challenge-speak-answer-and-point",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What did Farah promise? Answer, then say the line that proves it.",
      narration: { audio: A("challenge-speak-answer-and-point"), script: "Last one, and you do both halves out loud. What did Farah promise the wall would become? Tap the mic. Say your answer, then say the line from the story that proves it. Start your proof with, the story says." },
      interaction: { type: "speak", text: "marsh reeds reed heron bird swamp pond water grass plants standing middle month painted painting mural picture art" },
    },
    {
      id: "celebrate-answer-and-point",
      purpose: "celebrate",
      gate: "none",
      prompt: "Answer, then point to the line.",
      fx: {"text":"Answer, then **point to the line**","effect":"fireworks"},
      narration: { audio: A("celebrate-answer-and-point"), script: "Today you did both halves. You answered, and then you pointed to the line. Some answers were right there in one sentence. Some took two lines put together. And when no line backed an answer, you called it a guess and said so. From now on, when someone asks you about a story, you will not just answer. You will show them where." },
    },
  ],
};
