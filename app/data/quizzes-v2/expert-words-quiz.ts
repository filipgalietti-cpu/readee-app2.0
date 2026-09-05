import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Expert Words QUIZ (RI.3.4) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge. Bands:
// easier(G2-bridge topic-word meanings at 3 options w/ picture support) /
// core(on-grade G3: expert-word meaning, which-words-tell-you, the everyday-
// vs-expert trap, Expert/School sort, a school-word meaning, production speak)
// / harder(G4 transfer RI.4.4, TAUGHT in the stimulus first: a domain word
// whose meaning is assembled from two sentences, the school words evidence and
// significant modeled then applied, closing with a production speak).
// ALL-FRESH second informational text, "The Room Under the Hill" (caves; every
// fact true: most caves form in limestone that slightly acidic rainwater slowly
// dissolves over thousands of years, big rooms are chambers, drips leave rings
// of stone that build stalactites from the ceiling, thin hollow ones are soda
// straws, stalagmites grow up where the drops land, the two join into a
// column, formations grow so slowly that a child-height column can be
// thousands of years old, skin oil stops a formation growing, some cave fish
// are born eyeless, water running down a slanted wall leaves flowstone that
// can look like a frozen waterfall, drip rates rise after heavy rain above),
// spoken page by page INSIDE the questions so every Q is self-contained;
// nothing from the lesson text (earthquakes) is reused. Topic grep-swept vs
// lessons-v2 + quizzes-v2: limestone, chamber, stalactite, stalagmite, soda
// straw, flowstone, cave fish 0 hits; cave only ever a story setting. Everyday
// words in expert sense: soda straws, column. School words: result, observe,
// process (core), evidence, significant (harder, modeled first). Quiz support
// images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/expert-words-quiz";
const IMG = (w: string) => `/images/lessons-v2/expert-words/${w.toLowerCase()}.png`;

export const expertWordsQuiz: QuizDef = {
  id: "expert-words-quiz",
  lessonId: "expert-words",
  title: "Expert Words Quiz",
  standard: "RI.3.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-chamber-meaning",
      band: "easier",
      difficulty: 1,
      prompt: "What is a chamber in this text?",
      image: IMG("quiz-cave-chamber"),
      narration: { audio: `${Q}/e-1-chamber-meaning.mp3`, script: "Here is a new true text called The Room Under the Hill. Listen to one sentence from it. The big rooms inside a cave are called chambers, and some chambers are large enough to hold a house. What is a chamber in this text? Tap the answer." },
      hint: { audio: `${Q}/e-1-chamber-meaning-hint.mp3`, script: "Listen for the word called. The words right before it tell you what a chamber is, and the picture shows one." },
      explain: { audio: `${Q}/e-1-chamber-meaning-explain.mp3`, script: "The text says, the big rooms inside a cave are called chambers. A chamber is a big room in a cave." },
      interaction: { type: "choose", options: [{ id: "a-big-room-in-a-cave", label: "a big room in a cave" }, { id: "a-drop-of-water", label: "a drop of water" }, { id: "a-kind-of-cave-fish", label: "a kind of cave fish" }], correctId: "a-big-room-in-a-cave", coachWrong: "Look at the picture. The text says some chambers could hold a house. Which answer is that big?" },
    },
    {
      id: "e-2-stalactite-meaning",
      band: "easier",
      difficulty: 2,
      prompt: "What is a stalactite?",
      image: IMG("quiz-cave-stalactites"),
      narration: { audio: `${Q}/e-2-stalactite-meaning.mp3`, script: "Listen to page two. Water drips from the ceiling of a chamber, and every drop leaves behind a tiny ring of stone. The rings pile up into a long stone point called a stalactite, which hangs down from the ceiling. What is a stalactite? Tap it." },
      hint: { audio: `${Q}/e-2-stalactite-meaning-hint.mp3`, script: "The picture shows them. Are they hanging from the ceiling, or sitting on the floor?" },
      explain: { audio: `${Q}/e-2-stalactite-meaning-explain.mp3`, script: "The text says, a long stone point called a stalactite, which hangs down from the ceiling. A stalactite is a stone point on the ceiling." },
      interaction: { type: "choose", options: [{ id: "a-stone-point-on-the-ceiling", label: "a stone point on the ceiling" }, { id: "a-bump-on-the-cave-floor", label: "a bump on the cave floor" }, { id: "a-soft-gray-rock", label: "a soft gray rock" }], correctId: "a-stone-point-on-the-ceiling", coachWrong: "The text says it hangs down. Which answer is something that hangs?" },
    },
    {
      id: "e-3-limestone-meaning",
      band: "easier",
      difficulty: 3,
      prompt: "What does limestone mean here?",
      narration: { audio: `${Q}/e-3-limestone-meaning.mp3`, script: "Listen to page one. Under some hills lies a hidden world of caves. Most caves form in limestone, a soft gray rock that rainwater can slowly eat away. What does limestone mean here? Tap the answer." },
      hint: { audio: `${Q}/e-3-limestone-meaning-hint.mp3`, script: "The meaning sits right after the word limestone, between two commas." },
      explain: { audio: `${Q}/e-3-limestone-meaning-explain.mp3`, script: "The text says, limestone, a soft gray rock that rainwater can slowly eat away. Limestone is a soft gray rock." },
      interaction: { type: "choose", options: [{ id: "a-soft-gray-rock", label: "a soft gray rock" }, { id: "a-hard-black-metal", label: "a hard black metal" }, { id: "a-cold-clear-stream", label: "a cold clear stream" }], correctId: "a-soft-gray-rock", coachWrong: "Caves form in it, and rainwater can eat it away. Which answer could a cave be made in?" },
    },
    {
      id: "e-4-column-meaning",
      band: "easier",
      difficulty: 4,
      prompt: "What is a column in this cave?",
      image: IMG("quiz-cave-column"),
      narration: { audio: `${Q}/e-4-column-meaning.mp3`, script: "Listen to the end of page three. When a stalactite and a stalagmite finally meet, they join into a column that reaches from floor to ceiling. What is a column in this cave? Tap it." },
      hint: { audio: `${Q}/e-4-column-meaning-hint.mp3`, script: "Look at the picture. Where does the column start, and where does it end?" },
      explain: { audio: `${Q}/e-4-column-meaning-explain.mp3`, script: "The text says, a column that reaches from floor to ceiling. A column is stone from floor to ceiling." },
      interaction: { type: "choose", options: [{ id: "stone-from-floor-to-ceiling", label: "stone from floor to ceiling" }, { id: "a-bump-on-the-floor", label: "a bump on the floor" }, { id: "a-drop-of-water", label: "a drop of water" }], correctId: "stone-from-floor-to-ceiling", coachWrong: "The text says it reaches from floor to ceiling. Which answer touches both?" },
    },
    {
      id: "c-1-stalagmite-meaning",
      band: "core",
      difficulty: 1,
      prompt: "What is a stalagmite?",
      narration: { audio: `${Q}/c-1-stalagmite-meaning.mp3`, script: "Here is page three of The Room Under the Hill. Some stalactites are thin and hollow, so cave explorers call them soda straws. Where the drops land on the floor, a bump grows upward, and that bump is called a stalagmite. When a stalactite and a stalagmite finally meet, they join into a column that reaches from floor to ceiling. Use the support the text gives. Read all four, then tap what a stalagmite is." },
      hint: { audio: `${Q}/c-1-stalagmite-meaning-hint.mp3`, script: "Find the sentence with the word stalagmite in it. Does the thing it names grow from the floor, or hang from the ceiling?" },
      explain: { audio: `${Q}/c-1-stalagmite-meaning-explain.mp3`, script: "The text says, a bump grows upward, and that bump is called a stalagmite. A stalagmite is a bump that grows upward from the floor." },
      interaction: { type: "choose", options: [{ id: "a-bump-that-grows-upward", label: "a bump that grows upward" }, { id: "a-point-that-hangs-down", label: "a point that hangs down" }, { id: "a-thin-hollow-straw", label: "a thin hollow straw" }, { id: "a-room-inside-a-cave", label: "a room inside a cave" }], correctId: "a-bump-that-grows-upward", coachWrong: "That is a different cave word. Look right before the word called in the sentence about the floor." },
    },
    {
      id: "c-2-stalactite-clue",
      band: "core",
      difficulty: 2,
      prompt: "Which words tell you what a stalactite is?",
      narration: { audio: `${Q}/c-2-stalactite-clue.mp3`, script: "Now point to the support. Here is page two. The big rooms inside a cave are called chambers, and some chambers are large enough to hold a house. Water drips from the ceiling of a chamber, and every drop leaves behind a tiny ring of stone. The rings pile up into a long stone point called a stalactite, which hangs down from the ceiling. Four groups of words from that page are on your screen. Only one tells you what a stalactite is. Tap it." },
      hint: { audio: `${Q}/c-2-stalactite-clue-hint.mp3`, script: "The support sits right before the word called. Which group of words is there?" },
      explain: { audio: `${Q}/c-2-stalactite-clue-explain.mp3`, script: "The words are, a long stone point. The text says, a long stone point called a stalactite, so those words tell you what it is." },
      interaction: { type: "choose", options: [{ id: "a-long-stone-point", label: "a long stone point" }, { id: "every-drop-leaves-behind", label: "every drop leaves behind" }, { id: "the-ceiling-of-a-chamber", label: "the ceiling of a chamber" }, { id: "large-enough-to-hold-a-house", label: "large enough to hold a house" }], correctId: "a-long-stone-point", coachWrong: "Those words are on the page, but they do not tell you what a stalactite is. Look for the words next to the word called." },
    },
    {
      id: "c-3-soda-straws-trap",
      band: "core",
      difficulty: 3,
      prompt: "What are soda straws in this text?",
      narration: { audio: `${Q}/c-3-soda-straws-trap.mp3`, script: "Here is an everyday phrase with an expert meaning. Page three says, some stalactites are thin and hollow, so cave explorers call them soda straws. You know what a soda straw is at lunch. Test that meaning against the sentence. Read all four, then tap what soda straws are in this text." },
      hint: { audio: `${Q}/c-3-soda-straws-trap-hint.mp3`, script: "The everyday meaning does not fit a sentence about stone. Look at the words right before the word so." },
      explain: { audio: `${Q}/c-3-soda-straws-trap-explain.mp3`, script: "In this text, soda straws are thin, hollow stalactites. The explorers borrowed the everyday name because of the shape." },
      interaction: { type: "choose", options: [{ id: "thin-hollow-stalactites", label: "thin hollow stalactites" }, { id: "tubes-for-sipping-a-drink", label: "tubes for sipping a drink" }, { id: "sweet-fizzy-drinks", label: "sweet fizzy drinks" }, { id: "cracks-in-the-limestone", label: "cracks in the limestone" }], correctId: "thin-hollow-stalactites", coachWrong: "That is the everyday meaning, or a different cave thing. What does the sentence say the explorers are naming?" },
    },
    {
      id: "c-4-sort-expert-school",
      band: "core",
      difficulty: 4,
      prompt: "Sort the words: Expert Word, or School Word?",
      narration: { audio: `${Q}/c-4-sort-expert-school.mp3`, script: "Six big words from the cave text are on your screen. For each one ask, does this word belong to caves, or could it show up in a book about anything? If it belongs to the topic, drag it to Expert Word. If it travels to every subject, drag it to School Word." },
      hint: { audio: `${Q}/c-4-sort-expert-school-hint.mp3`, script: "Would a book about cooking, or a book about castles, ever use that word? If it would, it is a school word." },
      explain: { audio: `${Q}/c-4-sort-expert-school-explain.mp3`, script: "Stalactite, chamber, and limestone belong to caves, so they are expert words. Observe, process, and result show up in every subject, so they are school words." },
      interaction: { type: "sort", buckets: ["Expert Word","School Word"], bucketAudio: { "Expert Word": `${Q}/b-expert-word.mp3`, "School Word": `${Q}/b-school-word.mp3` }, items: [{ label: "stalactite", bucket: "Expert Word" }, { label: "observe", bucket: "School Word" }, { label: "chamber", bucket: "Expert Word" }, { label: "process", bucket: "School Word" }, { label: "limestone", bucket: "Expert Word" }, { label: "result", bucket: "School Word" }], coachWrong: "Ask the question again. Does that word belong only to caves, or could any subject use it?" },
    },
    {
      id: "c-5-process-meaning",
      band: "core",
      difficulty: 5,
      prompt: "What does process mean in this text?",
      narration: { audio: `${Q}/c-5-process-meaning.mp3`, script: "Here is a school word from page four. Cave explorers observe the formations, the shapes that dripping water builds, but they never touch them, because oil from a hand can stop a formation from growing. The process is slow, so a column as tall as a child may be thousands of years old. What does process mean in this text? Read all four, then tap it." },
      hint: { audio: `${Q}/c-5-process-meaning-hint.mp3`, script: "The text says the process is slow, and then it tells you how old a column can be. What is taking all that time?" },
      explain: { audio: `${Q}/c-5-process-meaning-explain.mp3`, script: "Process means the slow way something forms. The text is talking about the way dripping water builds a column, one ring at a time, over thousands of years." },
      interaction: { type: "choose", options: [{ id: "the-slow-way-something-forms", label: "the slow way something forms" }, { id: "a-quick-trip-through-a-cave", label: "a quick trip through a cave" }, { id: "a-loud-noise-in-the-dark", label: "a loud noise in the dark" }, { id: "a-hand-that-touches-stone", label: "a hand that touches stone" }], correctId: "the-slow-way-something-forms", coachWrong: "The text says the process is slow, and a column takes thousands of years. Which answer takes a long time?" },
    },
    {
      id: "c-6-speak-stalagmite",
      band: "core",
      difficulty: 6,
      prompt: "Explain a stalagmite like a cave expert, then say the clue that told you.",
      narration: { audio: `${Q}/c-6-speak-stalagmite.mp3`, script: "Now you are the expert. Here is page three again. Where the drops land on the floor, a bump grows upward, and that bump is called a stalagmite. Tap the mic. Tell me what a stalagmite is in your own words, the way a cave expert would, and then say which words in the text gave you the meaning." },
      hint: { audio: `${Q}/c-6-speak-stalagmite-hint.mp3`, script: "Start with where it grows and which way it grows. Then say the words that come right before the word called." },
      explain: { audio: `${Q}/c-6-speak-stalagmite-explain.mp3`, script: "A stalagmite is a bump of stone that grows up from the cave floor where drops land. The clue was, a bump grows upward, and that bump is called a stalagmite." },
      interaction: { type: "speak", text: "bump bumps grows grow growing up upward floor ground drops drips drip land landing stone rock rises rising pile piles tall called ceiling water builds" },
    },
    {
      id: "h-1-flowstone-two-sentences",
      band: "harder",
      difficulty: 1,
      prompt: "Put two sentences together. What is flowstone?",
      narration: { audio: `${Q}/h-1-flowstone-two-sentences.mp3`, script: "Here is a fourth grade move. Sometimes a text gives a word's meaning in two pieces, sentences apart, and you put them together. Watch me with column. Page three says a stalactite hangs from the ceiling and a stalagmite grows up from the floor. Two sentences later it says they join into a column that reaches from floor to ceiling. Put together, a column is a stalactite and a stalagmite grown into one. Now you. Here is page five. Where water runs down a slanted wall instead of dripping, it leaves behind a smooth sheet of stone. Cave explorers call that sheet flowstone, and a large flowstone can look like a frozen waterfall. Put the two sentences together. What is flowstone? Tap it." },
      hint: { audio: `${Q}/h-1-flowstone-two-sentences-hint.mp3`, script: "Sentence one tells what the water leaves behind. Sentence two names it. Put them together." },
      explain: { audio: `${Q}/h-1-flowstone-two-sentences-explain.mp3`, script: "Flowstone is a sheet of stone on a wall. Sentence one says water leaves behind a smooth sheet of stone, and sentence two says explorers call that sheet flowstone." },
      interaction: { type: "choose", options: [{ id: "a-sheet-of-stone-on-a-wall", label: "a sheet of stone on a wall" }, { id: "a-drip-from-the-ceiling", label: "a drip from the ceiling" }, { id: "a-river-inside-a-cave", label: "a river inside a cave" }, { id: "a-frozen-waterfall-of-ice", label: "a frozen waterfall of ice" }], correctId: "a-sheet-of-stone-on-a-wall", coachWrong: "The text says it only looks like a waterfall, and it is not a drip. What does the water leave behind on the wall?" },
    },
    {
      id: "h-2-evidence-applied",
      band: "harder",
      difficulty: 2,
      prompt: "The flowstone is evidence of what?",
      narration: { audio: `${Q}/h-2-evidence-applied.mp3`, script: "Here is a school word that fourth graders meet everywhere. Evidence. Evidence means the facts that show something is true. If your boots are muddy, the mud is evidence that you walked through a puddle. Now listen to page five. A smooth sheet like that is evidence that water once ran down the wall, even if the wall is dry today. In that sentence, the flowstone is evidence of what? Tap it." },
      hint: { audio: `${Q}/h-2-evidence-applied-hint.mp3`, script: "Evidence shows something is true. Listen for the words right after, evidence that." },
      explain: { audio: `${Q}/h-2-evidence-applied-explain.mp3`, script: "The flowstone is evidence that water once ran down the wall. The sheet of stone is the fact that shows it, even though the wall is dry now." },
      interaction: { type: "choose", options: [{ id: "water-once-ran-down-the-wall", label: "water once ran down the wall" }, { id: "the-wall-is-dry-today", label: "the wall is dry today" }, { id: "the-cave-is-full-of-fish", label: "the cave is full of fish" }, { id: "rain-fell-this-morning", label: "rain fell this morning" }], correctId: "water-once-ran-down-the-wall", coachWrong: "The sentence says the wall is dry today, so the evidence points to something that happened before. What?" },
    },
    {
      id: "h-3-significant-applied",
      band: "harder",
      difficulty: 3,
      prompt: "Which change in the drips would be significant?",
      narration: { audio: `${Q}/h-3-significant-applied.mp3`, script: "One more school word. Significant means big enough to matter. A significant snowfall closes the school, but a few flakes do not. Now listen to page five. A significant change in the drips, such as twice as many in one week, usually means heavy rain fell on the hill above. Four changes are on your screen. Which change in the drips would be significant? Tap it." },
      hint: { audio: `${Q}/h-3-significant-applied-hint.mp3`, script: "Significant means big enough to matter. Which change is big?" },
      explain: { audio: `${Q}/h-3-significant-applied-explain.mp3`, script: "Twice as many drips is significant. That change is big enough to matter, and the text says it usually means heavy rain fell above the cave." },
      interaction: { type: "choose", options: [{ id: "twice-as-many-drips", label: "twice as many drips" }, { id: "one-extra-drip", label: "one extra drip" }, { id: "the-same-number-as-before", label: "the same number as before" }, { id: "a-slightly-louder-drip", label: "a slightly louder drip" }], correctId: "twice-as-many-drips", coachWrong: "Think about the snowfall. Significant means big enough to matter. Is that change big?" },
    },
    {
      id: "h-4-speak-flowstone",
      band: "harder",
      difficulty: 4,
      prompt: "Explain flowstone like a cave expert, then say where the meaning came from.",
      narration: { audio: `${Q}/h-4-speak-flowstone.mp3`, script: "Last one, out loud. Here is page five once more. Where water runs down a slanted wall instead of dripping, it leaves behind a smooth sheet of stone. Cave explorers call that sheet flowstone, and a large flowstone can look like a frozen waterfall. Tap the mic. Explain what flowstone is in your own words, the way a cave expert would, and then tell me which two sentences gave you the meaning." },
      hint: { audio: `${Q}/h-4-speak-flowstone-hint.mp3`, script: "Say what the water leaves on the wall and what it looks like. Then name the sentence that describes it and the sentence that names it." },
      explain: { audio: `${Q}/h-4-speak-flowstone-explain.mp3`, script: "Flowstone is a smooth sheet of stone that water leaves behind when it runs down a cave wall, and it can look like a frozen waterfall. Sentence one describes the sheet, and sentence two names it." },
      interaction: { type: "speak", text: "sheet smooth stone rock water runs running ran down wall slanted frozen waterfall looks like drips dripping instead leaves behind flat layer layers builds" },
    },
  ],
};
