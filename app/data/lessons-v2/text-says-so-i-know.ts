import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./text-says-so-i-know-timings.json";

// Text Says, So I Know (RL.4.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=text-says-so-i-know
// G4-U1 lesson 1, the GRADE 4 PILOT (the calibration mold for 34 lessons).
// EVIDENCE FOR BOTH KINDS OF QUESTIONS tier of RL.4.1 (sibling split: show-me-where
// RL.3.1 owns the proving line for EXPLICIT answers at G3 (right there / put
// together / the story does not say), so explicit beats here are brief;
// why-they-did-it RL.3.3 owns trait vocabulary from repeated actions, so every
// inference here is framed evidence-to-inference and never as a trait word;
// the-whole-chapter RL.3.10 owns the G3 capstone; their-view-your-view RL.3.6
// owns views). THIS lesson owns the G4 core move: an EXPLICIT question is
// answered by pointing to the detail, an INFERENCE question is answered by
// citing the detail AND stating what it lets you know ("the text says X, so I
// can tell Y"), telling the two kinds of question apart, choosing the BEST
// evidence when several details are true but only one supports the inference,
// strengthening an inference with a SECOND detail, and REJECTING an inference
// the later pages knock down. ONE original story, "The Tenth Bottle": Mirela
// and Grandma Hester, who builds ships inside bottles, on the Sunday the
// tenth ship needs its rigging; 20 sentences over 7 child-read pages in real
// paragraphs (read-along 1/3/5/7 with ref-chained images, accept-mode speaks
// 2/4/6 at 53/55/54 tokens, no " my " token), complex sentences with relative
// pronouns (where nine finished ships sat, which had built nine ships, a page
// that showed every knot), dialogue with action beats ("The rigging is the
// last step," Grandma said, tapping the bottle with one finger), stretch
// words rigging / tweezers / threaded / masts / patience with support in the
// text, no digits, no contractions in read-along or speak text. PLANTED
// inferences: Grandma's eyes are failing (held the ship close, then far, then
// close, and blinked hard; blamed a light that had not changed; nodded at the
// SOUND of the knot holding; looked at Mirela's hands, not the ship), Mirela
// does not give up (wrong twice, third try held), Grandma lets Mirela take
// over (folds her hands, talks her through the knot), Grandma is happy at the
// end (lamp still burning, sitting with the bottle, smiling at nothing); the
// tempting TRUE detail that does not support the eyes inference (her hands
// shook); the careless inference the later pages knock down (Grandma gave up
// on the ship when she pushed the bottle away). ANCHOR FRESHNESS grep-swept
// vs every lessons-v2 + quizzes-v2 file: Mirela, Hester, Renata, Falk, Duarte,
// Lucian, ship in a bottle, tweezers, rigging, workroom, chopsticks, cold tea,
// the tenth bottle, the substitute, attendance, seating chart, Room Twelve all
// 0 hits (mast only as a model sailboat's part in take-apart-any-word, kettle
// only as a heat comparison, glasses only as image prose). Keys prefixed
// quiz- are picture supports for the quiz's fresh second story (Mr. Falk the
// substitute, Mrs. Duarte, Renata, Lucian).

const A = (id: string) => `/audio/lessons-v2/text-says-so-i-know/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/text-says-so-i-know/${w.toLowerCase()}.png`;

export const textSaysSoIKnowImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A small attic workroom with a slanted wooden ceiling and one square window, a long wooden workbench with a bright green desk lamp, a wall shelf under the window holding nine clear glass bottles lying on their sides, each with a tiny wooden sailing ship inside, an elderly woman with light brown skin, short curly white hair, and a navy blue cardigan sitting at the bench tapping a completely EMPTY clear glass bottle with absolutely nothing inside it, the empty bottle lying on the bench, and beside the bottle but outside it a tiny wooden ship with its masts folded flat lying on its side, and a ten year old girl with light brown skin and a long dark braid in a yellow sweater standing in the doorway at the top of a narrow staircase looking at the bench, warm afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels on the bottles, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same elderly woman with light brown skin, short curly white hair, and a navy blue cardigan sitting at the same wooden workbench in the same attic workroom, leaning very close to a bright green desk lamp and holding a tiny wooden ship OUTSIDE of any bottle in long thin metal tweezers while a thin black thread slips loose from one tiny mast, and with her other hand pushing a completely EMPTY clear glass bottle with absolutely nothing inside it away across the bench, only one tiny ship on the bench and it is not inside the bottle, the same ten year old girl with light brown skin, a long dark braid, and a yellow sweater sitting on a wooden stool beside her with both hands on the base of the lamp, the wall shelf of nine bottled ships under the window behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels on the bottles, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same attic workroom with NOBODY standing in the doorway or on the stairs, only two people in the picture, the same elderly woman with light brown skin, short curly white hair, and a navy blue cardigan sitting in a wooden chair pulled up beside the same ten year old girl with light brown skin, a long dark braid, and a yellow sweater at the wooden workbench, the elderly woman clearly visible in the chair with her hands folded calmly in her lap and her white curly hair showing, two steaming teacups on the bench, the girl bent over a sheet of paper that shows only simple pencil drawings of rope knots and loops, holding long thin metal tweezers over the tiny wooden ship with its masts folded flat, the green desk lamp glowing, the wall shelf of nine bottled ships in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, only knot drawings on the paper, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "The same attic workroom at night with the square window completely dark, the green desk lamp the only light, the same elderly woman with light brown skin, short curly white hair, and a navy blue cardigan sitting alone at the wooden workbench with a gentle smile and a teacup beside her, an empty clear glass bottle standing upright in the lamplight next to the tiny wooden ship whose four masts now stand up with thin threads, the same ten year old girl with a long dark braid seen from behind in the doorway holding a folded yellow sweater, the wall shelf of nine bottled ships in shadow. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no faces on any objects, no labels on the bottles, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-first-day": "A bright elementary classroom seen from the back of the room, rows of children sitting at desks looking toward the front, a tall thin man with pale skin, a neat gray beard, and a brown corduroy jacket standing stiffly at the front beside a plain empty green chalkboard with nothing written on it, holding a clipboard close to his chest and looking down at it, a window with sunlight on one side. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, completely blank chalkboard, no posters, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-book-slide": { subject: "The same classroom, the same tall thin man with pale skin, a neat gray beard, and a brown corduroy jacket bent over an open canvas bag on the teacher's desk digging through it with both hands, while a ten year old girl with dark brown skin and two curly puffs of hair in a red cardigan reaches up from the front row and slides a closed plain blue book with a blank cover across the desk toward him, the plain empty green chalkboard behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank book cover, completely blank chalkboard, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-first-day" },
  "quiz-crutches": { subject: "The same classroom doorway on a sunny morning, a woman with olive skin, dark hair in a bun, and a purple blouse standing in the open door on two gray metal crutches with one foot in a black walking boot, the children at their desks turning around to look at her with wide smiles, an empty wooden coat hook on the wall beside the door with nothing hanging on it, a closed plain blue book lying on the teacher's desk with a small white strip of paper sticking out of its pages. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank book cover, completely blank chalkboard, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-first-day" }
};

export const textSaysSoIKnow: LessonDef = {
  id: "text-says-so-i-know",
  title: "Text Says, So I Know",
  grade: "4th Grade",
  standard: "RL.4.1",
  archetype: "story-elements",
  objective: "I can answer an explicit question by pointing to the detail, and answer an inference question by citing the detail and saying what it lets me know.",
  concepts: [
    "an explicit question is answered by the text outright, so point to the detail",
    "an inference question is answered by a detail plus what it lets you know",
    "the text says, so I can tell: detail first, inference second",
    "when several details are true, choose the one that really supports the inference",
    "a second detail makes an inference stronger",
    "an inference with no detail behind it gets rejected",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Tenth Bottle and answered every question with evidence. Explicit answers came from the detail on the page, inferences came from a detail plus what it let you know, and an inference with no detail behind it got rejected. That is how fourth grade readers read.",
    "title": "The Text Says, So I Can Tell",
    "body": "You answered explicit questions by pointing to the detail, and inference questions by citing the detail and saying what it lets you know."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Tenth Bottle, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In fourth grade, every question about a story gets the same kind of answer, and that answer is evidence. Some questions are explicit. The text says the answer outright, and you point to the detail. Some questions are inferences. The text never says the answer, but it plants details that let you work it out, so you cite the detail and then say what it lets you know. Here is page one of The Tenth Bottle. Read along with me, and keep track of what the page says outright." },
      interaction: { type: "read-along", text: "Every Sunday since she could remember, Mirela had climbed the narrow stairs to Grandma Hester's workroom, where nine finished ships sat inside nine glass bottles along the window shelf. This Sunday the tenth ship lay on its side on the bench, its tiny masts folded flat and its bottle still empty beside it. \"The rigging is the last step,\" Grandma said, tapping the bottle with one finger, \"and the rigging, all those thin lines that hold the masts up, is the part that takes patience.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-two-questions",
      purpose: "model",
      gate: "none",
      prompt: "The text says X, so I can tell Y.",
      fx: {"text":"The text says **X**, so I can tell **Y**","effect":"pop-words"},
      narration: { audio: A("model-two-questions"), script: "Here is how I answer both kinds. My first question is explicit. Where do the finished ships sit? The text says, along the window shelf. I point to that detail and I am done, because the page said it outright. My second question is an inference. Has Grandma Hester been building ships for a long time? No sentence says so. But the text says nine finished ships sit along the shelf, and it says Mirela has climbed those stairs every Sunday since she could remember. Nine ships and years of Sundays, so I can tell she has been at this for a long time. Notice the shape of that answer. The text says, and then, so I can tell. Detail first, inference second. That shape is the whole lesson." },
    },
    {
      id: "guided-choose-which-is-inference",
      purpose: "guided",
      gate: "interaction",
      prompt: "Three of these are explicit. Tap the one that needs an inference.",
      narration: { audio: A("guided-choose-which-is-inference"), script: "Your turn to tell the two kinds apart. Four questions about page one are on your screen. Three of them are explicit, because a sentence on the page answers each one outright. One of them is an inference question, because no sentence answers it, and you would have to work it out from the details. Tap the inference question." },
      interaction: { type: "choose", options: [{ id: "why-the-bottle-was-empty", label: "why the bottle was empty" }, { id: "what-grandma-tapped", label: "what grandma tapped" }, { id: "where-the-ships-sat", label: "where the ships sat" }, { id: "how-the-masts-lay", label: "how the masts lay" }], correctId: "why-the-bottle-was-empty", coachWrong: "A sentence on page one answers that one outright, so it is explicit. Find the question that no sentence answers." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Mirela pulled a stool up to the bench and watched her lift the ship with tweezers as thin as chopsticks. She held the ship close to her nose, then far away, then close again, and she blinked hard at the lamp. \"Pull that lamp nearer,\" she said, \"because the light in here has gotten worse.\"",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and hold on to what Grandma does with the ship before she speaks." },
      interaction: { type: "speak", text: "Mirela pulled a stool up to the bench and watched her lift the ship with tweezers as thin as chopsticks She held the ship close to her nose then far away then close again and she blinked hard at the lamp Pull that lamp nearer she said because the light in here has gotten worse" },
    },
    {
      id: "guided-choose-supported-inference",
      purpose: "guided",
      gate: "interaction",
      prompt: "What can you tell about Grandma from page two?",
      narration: { audio: A("guided-choose-supported-inference"), script: "Now the inference half. Page two never says what is going on with Grandma, but it plants three details. She held the ship close, then far away, then close again. She blinked hard at the lamp. She said the light had gotten worse. Four inferences are on your screen. Only one of them is what those details let you know. Tap it." },
      interaction: { type: "choose", options: [{ id: "her-eyes-are-not-seeing-well", label: "her eyes are not seeing well" }, { id: "she-is-angry-at-mirela", label: "she is angry at mirela" }, { id: "she-is-in-a-hurry-to-finish", label: "she is in a hurry to finish" }, { id: "she-is-tired-of-ships", label: "she is tired of ships" }], correctId: "her-eyes-are-not-seeing-well", coachWrong: "Test that against the details. Holding a thing close, then far, then close, and blinking hard at a lamp, do those show that? Find the inference the details point to." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the lamp.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and notice what the first sentence says about that lamp." },
      interaction: { type: "read-along", text: "The lamp had not changed since last winter, but Mirela dragged it across the bench without a word. Grandma threaded the thin black line through the first mast on her third try, and her hands, which had built nine ships, shook until the line slipped out again. She set the tweezers down, pushed the bottle away, and said that she would go and make tea.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-best-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail best shows that Grandma cannot see well?",
      narration: { audio: A("guided-choose-best-evidence"), script: "Here is a fourth grade move. Sometimes several details are true, but only one of them really supports your inference. My inference is that Grandma cannot see as well as she used to. Four details from pages two and three are on your screen, and every one of them is really in the story. One of them is about her eyes, and that one is the best evidence. The others are true, but they support something else, or nothing at all. Tap the best evidence." },
      interaction: { type: "choose", options: [{ id: "held-the-ship-close-then-far", label: "held the ship close then far" }, { id: "her-hands-shook", label: "her hands shook" }, { id: "the-tweezers-were-thin", label: "the tweezers were thin" }, { id: "she-went-to-make-tea", label: "she went to make tea" }], correctId: "held-the-ship-close-then-far", coachWrong: "That detail is true, but ask what it supports. Shaking hands tell about hands, and thin tweezers tell about tweezers. Which detail tells about her eyes?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: While the kettle rattled downstairs, Mirela picked up the tweezers. Each folded mast would rise inside the bottle when someone pulled one long thread from outside, but the knots were tied in an order she could not guess. Taped under the bench was a page of Grandma's drawings showing every knot from first to last.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to what Mirela finds under the bench." },
      interaction: { type: "speak", text: "While the kettle rattled downstairs Mirela picked up the tweezers Each folded mast would rise inside the bottle when someone pulled one long thread from outside but the knots were tied in an order she could not guess Taped under the bench was a page of Grandma's drawings showing every knot from first to last" },
    },
    {
      id: "apply-sort-supported",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Supported, or Not Supported?",
      narration: { audio: A("apply-sort-supported"), script: "Here are six inferences about the story so far. Some of them are supported, because a detail on one of the pages backs them up. Some of them are not supported, because no detail backs them up, and a detail may even point the other way. Read each one and hunt for its detail. If you can name the detail, drag it to Supported. If there is no detail, drag it to the other bucket, Not Supported." },
      interaction: { type: "sort", buckets: ["Supported","Not Supported"], items: [{ label: "grandma cannot see as well", bucket: "Supported" }, { label: "the lamp is broken", bucket: "Not Supported" }, { label: "grandma has lots of practice", bucket: "Supported" }, { label: "mirela built a ship before", bucket: "Not Supported" }, { label: "mirela wants to help", bucket: "Supported" }, { label: "grandma is angry at mirela", bucket: "Not Supported" }], coachWrong: "Hunt for the detail. If a page shows it, the inference is supported. If no page shows it, or a page shows the opposite, it is not." },
    },
    {
      id: "apply-choose-second-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which second detail makes the inference stronger?",
      narration: { audio: A("apply-choose-second-detail"), script: "One detail can support an inference, but two details make it strong. My inference is still that Grandma cannot see as well as she used to. My first detail is that she held the ship close, then far, then close again, and blinked hard at the lamp. Now I want a second detail that points the same way. Four details from the story are on your screen, all of them true. Only one of them adds to my inference. Tap the detail that makes it stronger." },
      interaction: { type: "choose", options: [{ id: "the-lamp-had-not-changed", label: "the lamp had not changed" }, { id: "nine-ships-sat-on-the-shelf", label: "nine ships sat on the shelf" }, { id: "the-kettle-rattled", label: "the kettle rattled" }, { id: "the-masts-were-folded-flat", label: "the masts were folded flat" }], correctId: "the-lamp-had-not-changed", coachWrong: "That detail is true, but it does not point at her eyes. Think about what she blamed for the trouble, and what page three says about that." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and watch Grandma's hands.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five. Read along with me, and watch what Grandma does when she comes back." },
      interaction: { type: "read-along", text: "Grandma came back up with two cups and stopped in the doorway when she saw Mirela bent over the drawings. \"Those are old,\" she said, setting the cups down slowly, \"but the order has never changed.\" She pulled her chair beside Mirela's, and instead of picking up the tweezers, she folded her hands in her lap and began to talk her through the first knot.", audio: A("page-5-read-sentence") },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Mirela tied the first knot wrong twice, and the line slipped loose both times. She did not stop, and on the third try the knot held while Grandma nodded at the sound of her breath letting out. By the time the tea had gone cold, four masts stood ready beside the empty bottle.",
      narration: { audio: A("page-6-read"), script: "Page six is yours. Read all three sentences out loud, and hold on to how many tries the knot takes." },
      interaction: { type: "speak", text: "Mirela tied the first knot wrong twice and the line slipped loose both times She did not stop and on the third try the knot held while Grandma nodded at the sound of her breath letting out By the time the tea had gone cold four masts stood ready beside the empty bottle" },
    },
    {
      id: "apply-choose-reject-unsupported",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which inference does the story not support?",
      narration: { audio: A("apply-choose-reject-unsupported"), script: "A careful reader also rejects inferences. Sometimes a detail on one page seems to point somewhere, and a careless reader stops there. A careful reader keeps reading and tests the inference against the later pages. Four inferences are on your screen. Three of them are backed by details on pages five and six. One of them sounds possible, but the later pages point the other way. Tap the inference the story does not support." },
      interaction: { type: "choose", options: [{ id: "grandma-gave-up-on-the-ship", label: "grandma gave up on the ship" }, { id: "grandma-let-mirela-take-over", label: "grandma let mirela take over" }, { id: "mirela-does-not-give-up", label: "mirela does not give up" }, { id: "the-knots-go-in-a-set-order", label: "the knots go in a set order" }], correctId: "grandma-gave-up-on-the-ship", coachWrong: "That one has a detail behind it on page five or six. Find the inference that the later pages knock down." },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page. Read along with me, and notice where Grandma is looking." },
      interaction: { type: "read-along", text: "\"Tomorrow we slide it into the bottle,\" Grandma said, and she did not look at the ship but at Mirela's hands. That night, when Mirela came back upstairs for her sweater, the lamp was still burning in the workroom, and Grandma sat in front of the tenth bottle with her cold tea, looking at nothing at all and smiling.", audio: A("page-7-read-sentence") },
    },
    {
      id: "challenge-speak-text-says-so-i-know",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How does Grandma feel at the end? Say the text says, so I can tell.",
      narration: { audio: A("challenge-speak-text-says-so-i-know"), script: "Last one, and you make the whole move out loud. The story never says how Grandma feels on the last page, but the details let you know. Tap the mic. Start with the words, the text says, and name a detail from page seven. Then say, so I can tell, and state what that detail lets you know about how she feels." },
      interaction: { type: "speak", text: "happy glad pleased proud content peaceful calm hopeful excited satisfied relieved grateful thankful smiling smiled smile lamp burning tea cold bottle sitting looking hands tomorrow finished done ready waiting patient cares loves" },
    },
    {
      id: "celebrate-text-says-so-i-know",
      purpose: "celebrate",
      gate: "none",
      prompt: "The text says, so I can tell.",
      fx: {"text":"The text says, **so I can tell**","effect":"fireworks"},
      narration: { audio: A("celebrate-text-says-so-i-know"), script: "Today every answer came with evidence. When the text said it outright, you pointed to the detail. When the text did not say it, you cited the detail and told what it let you know, and when several details were true, you picked the one that really supported the inference. When no detail backed an inference, you rejected it. From now on, that is how you answer. The text says, so I can tell." },
    },
  ],
};
