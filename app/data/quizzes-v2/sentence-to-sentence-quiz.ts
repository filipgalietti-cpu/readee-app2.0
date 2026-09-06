import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Sentence to Sentence QUIZ (RI.3.8) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge.
// Bands: easier(G2-bridge which-word-connects / which-kind at 3 options with
// picture support) / core(on-grade G3: sentence connection, connecting word,
// paragraph-to-paragraph, the three-way sort, which-sentence-comes-next,
// production speak) / harder(G4 transfer RI.4.5, TAUGHT in the stimulus
// first: the overall STRUCTURE of a whole text, sequence vs comparison vs
// cause and effect vs problem and solution, modeled on the dragonfly text's
// third paragraph, then applied to three short whole texts, closing with a
// production speak). ALL-FRESH second informational text, "The Dragonfly"
// (every fact true: insect with a long thin body, four clear wings, huge eyes
// covering most of the head; most flying insects beat both wing pairs
// together while a dragonfly moves each wing on its own, so it hovers, darts
// sideways, flies backward; eyes see almost all the way around; snatches
// mosquitoes and flies from the air and rarely misses; eggs laid in ponds or
// slow streams; the nymph hunts underwater for months or years; climbs a
// stem, the skin splits, the adult crawls out; wings unfold, dry, harden;
// damselfly cousins fold their wings over the back while dragonflies hold
// them flat; nymphs need clean water), three planned paragraphs (one:
// wings, with a comparison pair and a cause pair; two: opens Because of those
// wings = cause and effect on paragraph one; three: first / next / while /
// then / finally = sequence), spoken page by page INSIDE the questions so
// every Q is self-contained; nothing from the lesson text (flamingos) is
// reused. Topic grep-swept vs lessons-v2 + quizzes-v2: dragonfly, damselfly,
// nymph 0 hits; mosquito only incidental prose. Quiz support images live in
// the lesson's image dir (quiz- keys). Bucket clips b-comparison /
// b-cause-and-effect / b-sequence are pre-synthesized from punctuated labels
// before quiz-tts so self-heal never fills them.

const Q = "/audio/quizzes-v2/sentence-to-sentence-quiz";
const IMG = (w: string) => `/images/lessons-v2/sentence-to-sentence/${w.toLowerCase()}.png`;

export const sentenceToSentenceQuiz: QuizDef = {
  id: "sentence-to-sentence-quiz",
  lessonId: "sentence-to-sentence",
  title: "Sentence to Sentence Quiz",
  standard: "RI.3.8",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-word-unlike",
      band: "easier",
      difficulty: 1,
      prompt: "Which word connects the second sentence to the first?",
      image: IMG("quiz-dragonfly-hover"),
      narration: { audio: `${Q}/e-1-word-unlike.mp3`, script: "Here is a new true book called The Dragonfly. Listen to two sentences from page one. Most flying insects beat both pairs of wings together. Unlike those insects, a dragonfly moves each of its four wings on its own. Three words from those sentences are on your screen. Tap the word that connects the second sentence to the first." },
      hint: { audio: `${Q}/e-1-word-unlike-hint.mp3`, script: "The connecting word sets the dragonfly against the other insects. It sits at the very start of the second sentence." },
      explain: { audio: `${Q}/e-1-word-unlike-explain.mp3`, script: "Unlike is the connecting word. It tells you the dragonfly is different from the other insects, so the two sentences connect by comparison." },
      interaction: { type: "choose", options: [{ id: "unlike", label: "unlike" }, { id: "wings", label: "wings" }, { id: "insects", label: "insects" }], correctId: "unlike", coachWrong: "That word names a thing. Find the word that sets one thing against another." },
    },
    {
      id: "e-2-kind-so",
      band: "easier",
      difficulty: 2,
      prompt: "What kind of connection joins these two sentences?",
      image: IMG("quiz-dragonfly-hover"),
      narration: { audio: `${Q}/e-2-kind-so.mp3`, script: "Listen to two more sentences from page one. A dragonfly moves each of its four wings on its own. So it can hover in one spot and even fly backward. Three kinds of connection are on your screen. Tap the kind that joins these two sentences." },
      hint: { audio: `${Q}/e-2-kind-so-hint.mp3`, script: "Listen to the small word at the start of the second sentence. It tells what the wings let the dragonfly do." },
      explain: { audio: `${Q}/e-2-kind-so-explain.mp3`, script: "Cause and effect joins them. The word so tells you that the hovering happens because of the way the wings move." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "comparison", label: "comparison" }, { id: "sequence", label: "sequence" }], correctId: "cause-and-effect", coachWrong: "The second sentence does not put things in order or set two things side by side. Ask what the wings make possible." },
    },
    {
      id: "e-3-word-next",
      band: "easier",
      difficulty: 3,
      prompt: "Which word tells you these sentences are in order?",
      image: IMG("quiz-nymph-underwater"),
      narration: { audio: `${Q}/e-3-word-next.mp3`, script: "Listen to two sentences from the last page of the book. First, the mother lays her eggs in a pond. Next, a squat brown nymph hatches and hunts underwater. Three words from those sentences are on your screen. Tap the word that tells you the second sentence comes after the first." },
      hint: { audio: `${Q}/e-3-word-next-hint.mp3`, script: "An order word tells you what comes after what. It sits at the very start of the second sentence." },
      explain: { audio: `${Q}/e-3-word-next-explain.mp3`, script: "Next is the order word. First and next put the two sentences in a sequence, one step after the other." },
      interaction: { type: "choose", options: [{ id: "next", label: "next" }, { id: "pond", label: "pond" }, { id: "hatches", label: "hatches" }], correctId: "next", coachWrong: "That word tells what or where. Find the word that tells when." },
    },
    {
      id: "e-4-kind-then-finally",
      band: "easier",
      difficulty: 4,
      prompt: "What kind of connection is this?",
      image: IMG("quiz-dragonfly-stem"),
      narration: { audio: `${Q}/e-4-kind-then-finally.mp3`, script: "Listen to the last two sentences of the book. Then the nymph climbs up a plant stem, and the grown dragonfly crawls out of its old skin. Finally, the new wings dry and harden, and the hunter takes to the air. Three kinds of connection are on your screen. Tap the kind that joins these two sentences." },
      hint: { audio: `${Q}/e-4-kind-then-finally-hint.mp3`, script: "Listen to the first word of each sentence. Do those words tell an order, a difference, or a reason?" },
      explain: { audio: `${Q}/e-4-kind-then-finally-explain.mp3`, script: "Sequence. Then and finally tell you the order the steps happen in, one after the other." },
      interaction: { type: "choose", options: [{ id: "sequence", label: "sequence" }, { id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }], correctId: "sequence", coachWrong: "The sentences do not set two things against each other or tell why. Listen to the words then and finally." },
    },
    {
      id: "c-1-sentence-connection",
      band: "core",
      difficulty: 1,
      prompt: "How do the second and third sentences of page one connect?",
      narration: { audio: `${Q}/c-1-sentence-connection.mp3`, script: "Four kinds of connection are on your screen, and you will tap the kind that joins the second sentence of page one to the third, the sentence about most insects and the sentence about the dragonfly. Here is page one of a true book called The Dragonfly. A dragonfly is an insect with a long thin body, four clear wings, and two huge eyes that cover most of its head. Most flying insects beat both pairs of wings together. Unlike those insects, a dragonfly moves each of its four wings on its own. So it can hover in one spot, dart sideways, and even fly backward." },
      hint: { audio: `${Q}/c-1-sentence-connection-hint.mp3`, script: "The third sentence starts with a word that sets the dragonfly against the other insects. What kind of connection uses a word like that?" },
      explain: { audio: `${Q}/c-1-sentence-connection-explain.mp3`, script: "Comparison. The word unlike sets the dragonfly against most flying insects, so the two sentences connect by comparison." },
      interaction: { type: "choose", options: [{ id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "sequence", label: "sequence" }, { id: "no-connection", label: "no connection" }], correctId: "comparison", coachWrong: "Ask what the third sentence does with the second. Does it tell why, tell when, or set two things against each other?" },
    },
    {
      id: "c-2-connecting-word",
      band: "core",
      difficulty: 2,
      prompt: "Which piece holds the connecting word?",
      narration: { audio: `${Q}/c-2-connecting-word.mp3`, script: "Four pieces of page one are on your screen, and all four are really there. Only one of them holds the word that joins the fourth sentence to the third. Here are the two sentences once more. Unlike those insects, a dragonfly moves each of its four wings on its own. So it can hover in one spot, dart sideways, and even fly backward." },
      hint: { audio: `${Q}/c-2-connecting-word-hint.mp3`, script: "The connecting word sits at the very start of the fourth sentence, and it points back to the wings." },
      explain: { audio: `${Q}/c-2-connecting-word-explain.mp3`, script: "The piece so it can hover holds the connecting word. So tells you that the hovering happens because of the wings." },
      interaction: { type: "choose", options: [{ id: "so-it-can-hover", label: "so it can hover" }, { id: "each-of-its-four-wings", label: "each of its four wings" }, { id: "dart-sideways", label: "dart sideways" }, { id: "those-insects", label: "those insects" }], correctId: "so-it-can-hover", coachWrong: "Those words tell what the dragonfly has or does. Find the small word at the start of the fourth sentence that points back to the third." },
    },
    {
      id: "c-3-paragraph-builds",
      band: "core",
      difficulty: 3,
      prompt: "How does paragraph two build on paragraph one?",
      narration: { audio: `${Q}/c-3-paragraph-builds.mp3`, script: "A new paragraph builds on the one before it, and its first sentence shows how. Paragraph one of The Dragonfly was about the wings and the eyes. Four ways paragraph two could build on it are on your screen, and you will tap the way it really does. Here is paragraph two. Because of those wings and those eyes, a dragonfly is one of the best hunters in the air. Its eyes see almost all the way around its head, and its wings let it turn in a flash. As a result, it snatches mosquitoes and flies right out of the air, and it almost never misses." },
      hint: { audio: `${Q}/c-3-paragraph-builds-hint.mp3`, script: "Listen to the first words of paragraph two. Because of those wings. What kind of word is because?" },
      explain: { audio: `${Q}/c-3-paragraph-builds-explain.mp3`, script: "Paragraph two tells what the wings and eyes cause. It opens with because of those wings and those eyes, and the effect is a hunter that almost never misses." },
      interaction: { type: "choose", options: [{ id: "it-tells-what-the-wings-cause", label: "it shows what wings cause" }, { id: "it-gives-the-steps-in-order", label: "it gives the steps in order" }, { id: "it-contrasts-two-insects", label: "it contrasts two insects" }, { id: "it-says-paragraph-one-again", label: "it says paragraph one again" }], correctId: "it-tells-what-the-wings-cause", coachWrong: "Look at the first word of paragraph two. Does it tell when, set two things against each other, or tell why?" },
    },
    {
      id: "c-4-sort-three-kinds",
      band: "core",
      difficulty: 4,
      prompt: "Sort each piece: Comparison, Cause and Effect, or Sequence?",
      narration: { audio: `${Q}/c-4-sort-three-kinds.mp3`, script: "Six pieces of The Dragonfly are on your screen, and each one carries its connecting word. Read the piece, find the word at the front, and name the kind. If the word sets two things side by side, drag it to Comparison. If it tells what happens because of something, drag it to Cause and Effect. If it tells the order, drag it to Sequence." },
      hint: { audio: `${Q}/c-4-sort-three-kinds-hint.mp3`, script: "The connecting word sits at the front of each piece. Ask whether it sets two things side by side, tells why, or tells when." },
      explain: { audio: `${Q}/c-4-sort-three-kinds-explain.mp3`, script: "Unlike and while set two things side by side, so they are comparison. So and as a result tell why, so they are cause and effect. First and then tell when, so they are sequence." },
      interaction: { type: "sort", buckets: ["Comparison","Cause and Effect","Sequence"], bucketAudio: { "Comparison": `${Q}/b-comparison.mp3`, "Cause and Effect": `${Q}/b-cause-and-effect.mp3`, "Sequence": `${Q}/b-sequence.mp3` }, items: [{ label: "unlike those insects", bucket: "Comparison" }, { label: "so it can hover", bucket: "Cause and Effect" }, { label: "first, the eggs are laid", bucket: "Sequence" }, { label: "while the adult is a flier", bucket: "Comparison" }, { label: "as a result, it never misses", bucket: "Cause and Effect" }, { label: "then the skin splits", bucket: "Sequence" }], coachWrong: "Find the connecting word at the front of that piece. Does it set two things side by side, tell why, or tell when?" },
    },
    {
      id: "c-5-next-sentence",
      band: "core",
      difficulty: 5,
      prompt: "A dragonfly rests on a sunny reed to warm up. Which sentence comes next to show sequence?",
      narration: { audio: `${Q}/c-5-next-sentence.mp3`, script: "Now you build a connection. Here is a fresh sentence from the book, and the author wants the next sentence to show sequence, the next step in order. Four sentences are on your screen, and every one of them is true, but only one of them makes that connection. Here is the sentence. A dragonfly rests on a sunny reed to warm up." },
      hint: { audio: `${Q}/c-5-next-sentence-hint.mp3`, script: "Look at the first word of each sentence. Which one tells what happens after the dragonfly warms up?" },
      explain: { audio: `${Q}/c-5-next-sentence-explain.mp3`, script: "Then it lifts off to hunt shows sequence. The word then tells you the next step, the one that comes after warming up." },
      interaction: { type: "choose", options: [{ id: "then-it-lifts-off-to-hunt", label: "Then it lifts off to hunt" }, { id: "so-its-wing-muscles-warm-up", label: "So its wing muscles warm up" }, { id: "a-lizard-warms-up-that-way-too", label: "A lizard warms up too" }, { id: "dragonflies-have-six-legs", label: "Dragonflies have six legs" }], correctId: "then-it-lifts-off-to-hunt", coachWrong: "That sentence makes a different connection, or none at all. Find the one whose first word tells what comes next." },
    },
    {
      id: "c-6-speak-connection",
      band: "core",
      difficulty: 6,
      prompt: "Its eyes see almost all the way around its head. As a result, it snatches mosquitoes right out of the air. Name the connection and the word that showed you.",
      narration: { audio: `${Q}/c-6-speak-connection.mp3`, script: "Two sentences from page two are on your screen. Read them in your head, then tap the mic and tell me two things. Name the kind of connection between the two sentences, and name the words that told you." },
      hint: { audio: `${Q}/c-6-speak-connection-hint.mp3`, script: "Say the kind of connection first, then say the connecting words. The connecting words sit at the start of the second sentence." },
      explain: { audio: `${Q}/c-6-speak-connection-explain.mp3`, script: "The connection is cause and effect. The words as a result tell you that the snatching happens because of the eyes." },
      interaction: { type: "speak", text: "cause effect because result results reason reasons why makes made happen happens happened catches catch snatches snatch eyes see sees" },
    },
    {
      id: "h-1-structure-problem-solution",
      band: "harder",
      difficulty: 1,
      prompt: "Which structure does this short text have?",
      narration: { audio: `${Q}/h-1-structure-problem-solution.mp3`, script: "Here is a fourth grade move. A whole text has a shape, called its structure, and the shape is one of the connections you know, stretched over the whole text. A text that tells events in order has a sequence structure. A text that sets two things side by side has a comparison structure. A text that tells what happens because of something has a cause and effect structure. And here is a fourth shape. A text that names a problem and then tells how it was fixed has a problem and solution structure. Watch me. Paragraph three of The Dragonfly starts with first, moves through next and then, and ends with finally, so its structure is sequence. Now you. Four structures are on your screen. Tap the structure of this short text. The pond in the park had far too many mosquitoes, and nobody wanted to picnic there. So the park planted water plants where dragonflies could lay their eggs, and by summer the mosquito clouds were gone." },
      hint: { audio: `${Q}/h-1-structure-problem-solution-hint.mp3`, script: "The first sentence names something. Is it a step, a difference, or a trouble that needs fixing? Then ask whether the text tells how the trouble was fixed." },
      explain: { audio: `${Q}/h-1-structure-problem-solution-explain.mp3`, script: "Problem and solution. The text names a problem, too many mosquitoes, and then tells how the park fixed it with water plants for dragonflies." },
      interaction: { type: "choose", options: [{ id: "problem-and-solution", label: "problem and solution" }, { id: "sequence", label: "sequence" }, { id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }], correctId: "problem-and-solution", coachWrong: "The text does more than tell when or why. It names a trouble at the start. What does the second half do with that trouble?" },
    },
    {
      id: "h-2-structure-comparison",
      band: "harder",
      difficulty: 2,
      prompt: "Which structure does this short text have?",
      narration: { audio: `${Q}/h-2-structure-comparison.mp3`, script: "Another short text, and the same four structures are on your screen. Sequence tells events in order, comparison sets two things side by side, cause and effect tells what happens because of something, and problem and solution names a trouble and its fix. Tap the structure of this text. A dragonfly and a damselfly look like cousins. Both have long thin bodies and four clear wings. But a dragonfly holds its wings flat out to the sides when it rests, while a damselfly folds its wings together over its back. A dragonfly is also thicker and stronger, and it flies faster." },
      hint: { audio: `${Q}/h-2-structure-comparison-hint.mp3`, script: "Listen for the words both, but, and while. What do those words do with the two insects?" },
      explain: { audio: `${Q}/h-2-structure-comparison-explain.mp3`, script: "Comparison. The whole text sets the dragonfly and the damselfly side by side, with the words both, but, and while." },
      interaction: { type: "choose", options: [{ id: "comparison", label: "comparison" }, { id: "sequence", label: "sequence" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "problem-and-solution", label: "problem and solution" }], correctId: "comparison", coachWrong: "The text does not tell steps, give a reason, or fix a trouble. Ask what it does with the two insects." },
    },
    {
      id: "h-3-structure-cause-effect",
      band: "harder",
      difficulty: 3,
      prompt: "Which structure does this short text have?",
      narration: { audio: `${Q}/h-3-structure-cause-effect.mp3`, script: "One more short text, and the same four structures are on your screen. This one takes care, because a text can tell what happens because of a trouble without ever telling how the trouble was fixed. Tap the structure of this text. Dragonflies need clean water. When a pond fills with mud and oil washed in from the street, the nymphs cannot breathe. Because of that, dragonflies disappear from dirty ponds, and the mosquitoes they used to eat come back." },
      hint: { audio: `${Q}/h-3-structure-cause-effect-hint.mp3`, script: "Does the text tell how the dirty pond was fixed, or only what happens because of it?" },
      explain: { audio: `${Q}/h-3-structure-cause-effect-explain.mp3`, script: "Cause and effect. Dirty water is the cause, and the missing dragonflies and the extra mosquitoes are the effects. Nobody fixes the pond, so it is not problem and solution." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "problem-and-solution", label: "problem and solution" }, { id: "sequence", label: "sequence" }, { id: "comparison", label: "comparison" }], correctId: "cause-and-effect", coachWrong: "Listen again for a fix. If nobody fixes the pond, the text is only telling what the dirty water causes." },
    },
    {
      id: "h-4-speak-structure",
      band: "harder",
      difficulty: 4,
      prompt: "First, the eggs are laid in a pond. Next, a nymph hatches and hunts underwater. Then it climbs a stem and the adult crawls out. Finally, the wings harden. Name the structure and two words that showed you.",
      narration: { audio: `${Q}/h-4-speak-structure.mp3`, script: "Last one, out loud. A short paragraph from The Dragonfly is on your screen. Read it in your head, then tap the mic. Name the structure of the paragraph, and name two of the words that showed you." },
      hint: { audio: `${Q}/h-4-speak-structure-hint.mp3`, script: "Look at the first word of every sentence. Say the structure those words build, then say two of the words." },
      explain: { audio: `${Q}/h-4-speak-structure-explain.mp3`, script: "The structure is sequence. The words first, next, then, and finally tell the order the steps happen in." },
      interaction: { type: "speak", text: "sequence order steps step first next then finally time chronological chronology after before events event happened happens" },
    },
  ],
};
