import type { QuizDef } from "@/lib/lesson-engine/quiz";

// The Shape of the Facts QUIZ (RI.4.5) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second fact text
// with a DIFFERENT overall shape from the lesson's: "Two Ways Across the
// Gorge" is a COMPARISON (an arch bridge at the narrow end of a gorge vs a
// suspension bridge where the walls stand far apart; every fact true: both
// rest their ends on solid rock, the arch pushes its load down and outward so
// its stones are squeezed tighter under weight, the suspension bridge hangs
// its road from steel cables slung over two towers and pulled tight to great
// anchor blocks, stone arches stand for two thousand years and the oldest are
// still in use but leap only a short gap so a wide gorge needs a row of them,
// a suspension bridge crosses the widest gap in one span and is far lighter,
// it sways in strong wind so builders stiffen the road with a deep frame
// beneath it) whose LAST section, The Crossings Before, switches to a
// CHRONOLOGY (at first a footbridge of rope and planks, then a stone arch at
// the narrowest point, years later the suspension bridge where the road met
// the wide part). The text is spoken section by section INSIDE the questions
// so every Q is self-contained; two sentences are the child's on-screen
// read-alouds and are NEVER narrated anywhere in the quiz (the sway sentence
// that closes section two in e-4, the last sentence of the text in h-3).
// Bands: easier (G3-bridge, how TWO sentences connect and the word that shows
// it, at 3 options, plus one read-aloud) / core (on-grade G4: the overall
// shape of a section, the signal words as a choose because the quiz robot
// cannot solve a highlight, the diagram that fits, a six-item Comparison
// Signals / Chronology Signals sort with b-* bucket clips, the BEST-EVIDENCE
// opener that shows the switch among four real openers, and a production
// speak describing the overall structure with the term and one signal word) /
// harder (G5 transfer, RI.5.5 COMPARE THE STRUCTURES OF TWO TEXTS on one
// topic and say what each lets the author do: taught in h-1 on the
// comparison text, then applied to the chronology; the biggest difference
// between how the two texts are built; the last sentence read aloud; a
// closing production speak naming both shapes and what each one lets the
// author do). Nothing from the lesson text (the aqueducts, the city, the
// lesson's tiles) is reused. FRESHNESS grep-swept vs lessons-v2 +
// quizzes-v2: suspension, arch bridge, abutment, keystone, tension,
// compression, footbridge, anchor blocks 0 hits (gorge = one G3 vocabulary
// tile, rope bridge = one G2 quiz prop). No pictures: none would be evidence.

const Q = "/audio/quizzes-v2/the-shape-of-the-facts-quiz";

export const theShapeOfTheFactsQuiz: QuizDef = {
  id: "the-shape-of-the-facts-quiz",
  lessonId: "the-shape-of-the-facts",
  title: "The Shape of the Facts Quiz",
  standard: "RI.4.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-connect-both",
      band: "easier",
      difficulty: 1,
      prompt: "How do these two sentences connect?",
      narration: { audio: `${Q}/e-1-connect-both.mp3`, script: "Here is the start of a new fact text called Two Ways Across the Gorge. You will hear two sentences, and you name how they connect, the way you did in third grade. Listen for the word that joins them, then tap the answer. Two bridges cross the same deep gorge, one at its narrow end and one where the walls stand far apart, and both of them carry a road from one cliff to the other. Both bridges rest their ends on solid rock, and the rock takes the weight of everything that crosses." },
      hint: { audio: `${Q}/e-1-connect-both-hint.mp3`, script: "The second sentence opens with a word that points at two things at once. Ask what that word does." },
      explain: { audio: `${Q}/e-1-connect-both-explain.mp3`, script: "The connection is comparison. The word both sets the two bridges side by side and tells what they share." },
      interaction: { type: "choose", options: [{ id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "chronology", label: "chronology" }], correctId: "comparison", coachWrong: "Ask what the second sentence does with the two bridges. Does it tell why, does it tell when, or does it put them side by side?" },
    },
    {
      id: "e-2-word-unlike",
      band: "easier",
      difficulty: 2,
      prompt: "Which word shows the connection?",
      narration: { audio: `${Q}/e-2-word-unlike.mp3`, script: "Now the word itself. Here is the next sentence of the text, and one word in it shows how the arch and the suspension bridge connect. Tap that word after you hear the sentence. Unlike the arch, which stands on the stone it is made of, the suspension bridge hangs its road from steel cables slung over two tall towers." },
      hint: { audio: `${Q}/e-2-word-unlike-hint.mp3`, script: "The connecting word is the very first word of the sentence, and it tells you the two bridges are different." },
      explain: { audio: `${Q}/e-2-word-unlike-explain.mp3`, script: "The word is unlike. It opens the sentence and tells you the suspension bridge does something the arch does not." },
      interaction: { type: "choose", options: [{ id: "unlike", label: "unlike" }, { id: "which", label: "which" }, { id: "over", label: "over" }], correctId: "unlike", coachWrong: "That word does another job in the sentence. Find the word that tells you the two bridges are different." },
    },
    {
      id: "e-3-connect-so",
      band: "easier",
      difficulty: 3,
      prompt: "How do these two lines connect?",
      narration: { audio: `${Q}/e-3-connect-so.mp3`, script: "One more pair. Here are two lines from the second part of the text, and one of them makes the other true. Tap how they connect after you hear them. An arch can only leap a short gap. So a wide gorge would need a whole row of them." },
      hint: { audio: `${Q}/e-3-connect-so-hint.mp3`, script: "The second line opens with a little word that means, and this is what follows from it." },
      explain: { audio: `${Q}/e-3-connect-so-explain.mp3`, script: "The connection is cause and effect. The arch can only leap a short gap, so a wide gorge needs a row of them. The word so tells you the second line follows from the first." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "comparison", label: "comparison" }, { id: "chronology", label: "chronology" }], correctId: "cause-and-effect", coachWrong: "Ask what the second line does. Does it compare the two bridges, does it tell when, or does it tell what follows from the first line?" },
    },
    {
      id: "e-4-speak-read-sway",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: That lightness has a cost, for a suspension bridge sways in a strong wind, and its builders stiffen the road with a deep frame beneath it to keep it steady.",
      narration: { audio: `${Q}/e-4-speak-read-sway.mp3`, script: "The sentence on your screen closes the second part of the text, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/e-4-speak-read-sway-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words That lightness." },
      explain: { audio: `${Q}/e-4-speak-read-sway-explain.mp3`, script: "The sentence tells you that a light bridge sways in a strong wind, and that builders put a deep frame under the road to keep it steady." },
      interaction: { type: "speak", text: "That lightness has a cost for a suspension bridge sways in a strong wind and its builders stiffen the road with a deep frame beneath it to keep it steady" },
    },
    {
      id: "c-1-shape-section-one",
      band: "core",
      difficulty: 1,
      prompt: "One Gorge, Two Bridges: what is the overall shape of this section?",
      narration: { audio: `${Q}/c-1-shape-section-one.mp3`, script: "Now a whole section, and you name its overall shape, not one sentence pair. Collect the signal words as you listen, and then tap the shape. Here is the first section of Two Ways Across the Gorge, under the heading One Gorge, Two Bridges. Two bridges cross the same deep gorge, one at its narrow end and one where the walls stand far apart, and both of them carry a road from one cliff to the other. Both bridges rest their ends on solid rock, and the rock takes the weight of everything that crosses. Unlike the arch, which stands on the stone it is made of, the suspension bridge hangs its road from steel cables slung over two tall towers. While the arch pushes its load down and outward into the cliffs, so that every stone is squeezed tighter as the weight presses on it, the cables of the suspension bridge are pulled, stretched tight between the towers and the great blocks that anchor them." },
      hint: { audio: `${Q}/c-1-shape-section-one-hint.mp3`, script: "Count how many things the section keeps setting next to each other, and listen to the words that open the last two sentences." },
      explain: { audio: `${Q}/c-1-shape-section-one-explain.mp3`, script: "The overall shape is comparison. Both, unlike, and while set the arch and the suspension bridge side by side, fact against fact, through the whole section." },
      interaction: { type: "choose", options: [{ id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "chronology", label: "chronology" }, { id: "problem-and-solution", label: "problem and solution" }], correctId: "comparison", coachWrong: "One sentence pair might fit that, but the question is the whole section. Ask what every sentence in it keeps doing with the two bridges." },
    },
    {
      id: "c-2-signal-words",
      band: "core",
      difficulty: 2,
      prompt: "Which words are the signal words in this part?",
      narration: { audio: `${Q}/c-2-signal-words.mp3`, script: "Collect the signal words. Here are two sentences from the second section, What Each One Can Do. Four pieces of those sentences are on your screen, and every piece is really in them. Only one piece is a signal, the words that announce the shape. Tap that piece after you hear the sentences. The stone arch can stand for two thousand years, and the oldest ones are still in use, but an arch can only leap a short gap, so a wide gorge would need a whole row of them. The suspension bridge, in contrast, can cross the widest water or the deepest gorge in a single span, and it is far lighter than stone." },
      hint: { audio: `${Q}/c-2-signal-words-hint.mp3`, script: "A signal word does not describe a bridge. It tells you what kind of sentence is coming. Three of the pieces describe a bridge." },
      explain: { audio: `${Q}/c-2-signal-words-explain.mp3`, script: "The signal is in contrast. It tells you the second sentence will set the suspension bridge against the arch, which is the comparison shape." },
      interaction: { type: "choose", options: [{ id: "in-contrast", label: "in contrast" }, { id: "the-oldest-ones", label: "the oldest ones" }, { id: "a-single-span", label: "a single span" }, { id: "the-deepest-gorge", label: "the deepest gorge" }], correctId: "in-contrast", coachWrong: "That piece describes a bridge. A signal word announces what kind of sentence is coming. Find the piece that does that job." },
    },
    {
      id: "c-3-diagram",
      band: "core",
      difficulty: 3,
      prompt: "Which picture would hold the facts of this text?",
      narration: { audio: `${Q}/c-3-diagram.mp3`, script: "Every shape has a picture, and the picture is how you hold the facts. Two Ways Across the Gorge sets the arch and the suspension bridge next to each other, fact against fact, from its first sentence on. Four pictures are on your screen, one for each shape. Tap the one you would draw to hold this text's facts." },
      hint: { audio: `${Q}/c-3-diagram-hint.mp3`, script: "You would want one side for the arch and one side for the suspension bridge, with the matching facts across from each other." },
      explain: { audio: `${Q}/c-3-diagram-explain.mp3`, script: "The picture is a two column chart. One column holds the arch, the other holds the suspension bridge, and each fact sits across from the fact it is compared with." },
      interaction: { type: "choose", options: [{ id: "a-two-column-chart", label: "a two column chart" }, { id: "a-timeline", label: "a timeline" }, { id: "an-arrow-chain", label: "an arrow chain" }, { id: "a-lock-and-a-key", label: "a lock and a key" }], correctId: "a-two-column-chart", coachWrong: "That picture belongs to a different shape. Think about what this text keeps doing with two bridges, and pick the picture built for two things at once." },
    },
    {
      id: "c-4-sort-signals",
      band: "core",
      difficulty: 4,
      prompt: "Sort the signals: Comparison, or Chronology?",
      narration: { audio: `${Q}/c-4-sort-signals.mp3`, script: "Six signal words and phrases are on your screen. Some belong to comparison, the shape that sets two things side by side. Some belong to chronology, the shape that tells events in time order. Read each one, ask what kind of sentence it announces, and drag it to its shape." },
      hint: { audio: `${Q}/c-4-sort-signals-hint.mp3`, script: "Ask whether the word tells when something happened, or whether it sets one thing against another." },
      explain: { audio: `${Q}/c-4-sort-signals-explain.mp3`, script: "Both of them, unlike, and in contrast set two things side by side, so they are comparison. At first, then, and years later tell when, so they are chronology." },
      interaction: { type: "sort", buckets: ["Comparison Signals","Chronology Signals"], bucketAudio: { "Comparison Signals": `${Q}/b-comparison-signals.mp3`, "Chronology Signals": `${Q}/b-chronology-signals.mp3` }, items: [{ label: "both of them", bucket: "Comparison Signals" }, { label: "at first", bucket: "Chronology Signals" }, { label: "unlike", bucket: "Comparison Signals" }, { label: "then", bucket: "Chronology Signals" }, { label: "in contrast", bucket: "Comparison Signals" }, { label: "years later", bucket: "Chronology Signals" }], coachWrong: "Ask what comes after that word. If what follows tells when, it is chronology. If what follows sets one thing against another, it is comparison." },
    },
    {
      id: "c-5-switch-evidence",
      band: "core",
      difficulty: 5,
      prompt: "Which sentence opener shows where the text switched shape?",
      narration: { audio: `${Q}/c-5-switch-evidence.mp3`, script: "Here is the best evidence move. Two Ways Across the Gorge runs in one shape, but its last section switched to another, and one sentence opener is where the switch shows. Four openers from the text are on your screen, and every one is really in the text. Only one carries a signal from a different shape than the rest. Tap that opener after you hear the four sentences they come from. Two bridges cross the same deep gorge, one at its narrow end and one where the walls stand far apart. Unlike the arch, which stands on the stone it is made of, the suspension bridge hangs its road from steel cables. While the arch pushes its load down and outward into the cliffs, the cables of the suspension bridge are pulled tight. At first, the only way over the gorge was a footbridge of rope and planks that swung with every step." },
      hint: { audio: `${Q}/c-5-switch-evidence-hint.mp3`, script: "Three of the openers set the two bridges against each other. Find the one that tells when instead." },
      explain: { audio: `${Q}/c-5-switch-evidence-explain.mp3`, script: "The opener is at first, the only way. At first tells when, which is a chronology signal, and the other three openers all belong to the comparison." },
      interaction: { type: "choose", options: [{ id: "at-first-the-only-way", label: "at first, the only way" }, { id: "two-bridges-cross-the-same", label: "two bridges cross the same" }, { id: "unlike-the-arch-which-stands", label: "unlike the arch, which stands" }, { id: "while-the-arch-pushes", label: "while the arch pushes" }], correctId: "at-first-the-only-way", coachWrong: "That opener is in the text, but its signal belongs to the shape the whole text uses. Find the opener whose signal belongs to a different shape." },
    },
    {
      id: "c-6-speak-describe-shape",
      band: "core",
      difficulty: 6,
      prompt: "Describe the overall shape of this text. Say the term and one signal word.",
      narration: { audio: `${Q}/c-6-speak-describe-shape.mp3`, script: "Now describe a structure out loud. Tap the mic. Name the overall shape of Two Ways Across the Gorge with its term, say one signal word from the text that gave it away, and say what the text keeps doing with its facts. Here is the first section again. Two bridges cross the same deep gorge, one at its narrow end and one where the walls stand far apart, and both of them carry a road from one cliff to the other. Unlike the arch, which stands on the stone it is made of, the suspension bridge hangs its road from steel cables slung over two tall towers. While the arch pushes its load down and outward into the cliffs, the cables of the suspension bridge are pulled tight between the towers and the great blocks that anchor them." },
      hint: { audio: `${Q}/c-6-speak-describe-shape-hint.mp3`, script: "Say the name of the shape first, then the word that opened the second or third sentence, then what the text does with the two bridges." },
      explain: { audio: `${Q}/c-6-speak-describe-shape-explain.mp3`, script: "One way to say it goes like this. The shape is comparison, the word unlike gave it away, and the text sets the arch and the suspension bridge side by side, fact against fact." },
      interaction: { type: "speak", text: "comparison compare compared compares comparing contrast contrasts contrasting both unlike while alike different differences difference same side chart column columns arch suspension bridge bridges shape overall against" },
    },
    {
      id: "h-1-taught-what-shape-lets",
      band: "harder",
      difficulty: 1,
      prompt: "What does the chronology shape let the author of the last section do?",
      narration: { audio: `${Q}/h-1-taught-what-shape-lets.mp3`, script: "Here is a fifth grade move. When two texts, or two parts of one, tell about the same topic in different shapes, a reader compares the shapes and says what each one lets the author do. Watch me on the first part of Two Ways Across the Gorge, which is built as a comparison. That shape lets the author set the two bridges side by side, so every fact about the arch lands next to the matching fact about the suspension bridge. Now you. The last section, The Crossings Before, is built as a chronology. Four answers are on your screen. Tap what that shape lets the author do, after you hear the section. At first, the only way over the gorge was a footbridge of rope and planks that swung with every step. Then a stone arch was built where the gorge was narrowest, and carts could cross at last." },
      hint: { audio: `${Q}/h-1-taught-what-shape-lets-hint.mp3`, script: "A chronology moves through time. Ask what a reader can see only when the facts come in the order they happened." },
      explain: { audio: `${Q}/h-1-taught-what-shape-lets-explain.mp3`, script: "The chronology lets the author show how the crossings changed. The footbridge, then the arch, then the suspension bridge come in the order they were built, so the reader sees the change." },
      interaction: { type: "choose", options: [{ id: "show-how-crossings-changed", label: "show how crossings changed" }, { id: "set-two-bridges-side-by-side", label: "set two bridges side by side" }, { id: "explain-why-the-road-sways", label: "explain why the road sways" }, { id: "name-a-trouble-and-its-fix", label: "name a trouble and its fix" }], correctId: "show-how-crossings-changed", coachWrong: "That is what a different shape does. The section moves through time, from the first crossing to the newest. Ask what that order lets a reader see." },
    },
    {
      id: "h-2-compare-two-structures",
      band: "harder",
      difficulty: 2,
      prompt: "Both parts tell about one gorge. What is the biggest difference in how they are built?",
      narration: { audio: `${Q}/h-2-compare-two-structures.mp3`, script: "Compare the two structures directly. The first part of the text and the last section tell about the same gorge, but they are built in different shapes, and a fifth grade reader can say the difference in one line. Four lines are on your screen. Tap the one that names how the two parts are built, after you hear the opening of each part. The first part opens like this. Two bridges cross the same deep gorge, and both of them carry a road from one cliff to the other. The last section opens like this. At first, the only way over the gorge was a footbridge of rope and planks." },
      hint: { audio: `${Q}/h-2-compare-two-structures-hint.mp3`, script: "Name the shape of each part first, then find the line that names both shapes." },
      explain: { audio: `${Q}/h-2-compare-two-structures-explain.mp3`, script: "The line is, one compares, one tells when. The first part is a comparison of the two bridges, and the last section is a chronology of the crossings." },
      interaction: { type: "choose", options: [{ id: "one-compares-one-tells-when", label: "one compares, one tells when" }, { id: "one-explains-one-compares", label: "one explains, one compares" }, { id: "one-fixes-one-compares", label: "one fixes, one compares" }, { id: "one-tells-when-one-fixes", label: "one tells when, one fixes" }], correctId: "one-compares-one-tells-when", coachWrong: "One of the shapes in that line is not in either part. Name the shape of the first part and the shape of the last section, then find the line with exactly those two." },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Years later, when the new road reached the gorge where its walls stood far apart, engineers hung the suspension bridge, and both bridges have carried traffic ever since.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the text is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, rest at each comma, and let the ending land." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Years later." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that the suspension bridge was hung years later, where the road met the wide part of the gorge, and that both bridges have carried traffic ever since." },
      interaction: { type: "speak", text: "Years later when the new road reached the gorge where its walls stood far apart engineers hung the suspension bridge and both bridges have carried traffic ever since" },
    },
    {
      id: "h-4-speak-compare-structures",
      band: "harder",
      difficulty: 4,
      prompt: "Name both shapes, and say what each one lets the author do.",
      narration: { audio: `${Q}/h-4-speak-compare-structures.mp3`, script: "Last one, out loud, and this time compare the two structures. Tap the mic. Name the shape of the first part and the shape of the last section, and for each one say what that shape lets the author do. Here is the opening of each part. Two bridges cross the same deep gorge, and both of them carry a road from one cliff to the other. At first, the only way over the gorge was a footbridge of rope and planks." },
      hint: { audio: `${Q}/h-4-speak-compare-structures-hint.mp3`, script: "Name the first shape and what it does with two bridges, then name the second shape and what it does with the years." },
      explain: { audio: `${Q}/h-4-speak-compare-structures-explain.mp3`, script: "One way to say it goes like this. The first part is a comparison, which lets the author set the two bridges side by side, and the last section is a chronology, which lets the author show how the crossings changed over the years." },
      interaction: { type: "speak", text: "comparison compare compares compared contrast side chart columns column both unlike bridges chronology timeline time order first then later years changed change changing crossings crossing history sequence events" },
    },
  ],
};
