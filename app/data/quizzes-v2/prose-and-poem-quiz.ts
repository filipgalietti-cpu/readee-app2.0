import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Prose and Poem QUIZ (RF.3.4b) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// one-line first and second reads with picture support, which-mark-climbs at
// 3 options) / core(on-grade G3: a two-sentence prose page read as a FIRST
// read and again as a SECOND read, a four-line stanza read, line-end vs
// sentence-end on a run-on line, a Story Page / Poem sort, a production speak
// with a full accept list) / harder(G4 transfer, RF.4.4b-adjacent: a stanza
// whose RHYTHM CHANGES as the lines get shorter, TAUGHT in h-1 by the
// narrator on the stanza itself, then the child reads it, a why-did-the-poet-
// split-it check, and a closing production speak). ALL-FRESH second world in
// both forms, "The Last Ride" (Poppy and her big brother Zev, the carousel on
// the last night of the county fair) with the stanza "Round and Round", spoken
// INSIDE the questions where the child listens and shown on screen where the
// child READS; nothing from the lesson (Orla, Uncle Emmett, the tugboat, the
// bell, the pier) is reused, and the narrator never pre-reads a line the
// child reads. On screen a poem line starts with a capital letter, and each
// question that needs it says so. Names + setting python-swept vs lessons-v2
// + quizzes-v2: Poppy, Zev, carousel, county fair, cotton candy 0 hits.
// Tiles are audio-free lowercase text. Quiz support images live in the
// lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/prose-and-poem-quiz";
const IMG = (w: string) => `/images/lessons-v2/prose-and-poem/${w.toLowerCase()}.png`;

export const proseAndPoemQuiz: QuizDef = {
  id: "prose-and-poem-quiz",
  lessonId: "prose-and-poem",
  title: "Prose and Poem Quiz",
  standard: "RF.3.4b",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-speak-read-ran",
      band: "easier",
      difficulty: 1,
      prompt: "Read it out loud: Poppy and Zev ran to the carousel.",
      image: IMG("quiz-carousel-night"),
      narration: { audio: `${Q}/e-1-speak-read-ran.mp3`, script: "Here is a new story about a girl named Poppy, her big brother Zev, and the last night of the fair. The first sentence is on your screen. Get the words, keep a talking pace, and read it out loud." },
      hint: { audio: `${Q}/e-1-speak-read-ran-hint.mp3`, script: "Point to each word as you say it, at the easy speed you use with a friend, and rest at the period." },
      explain: { audio: `${Q}/e-1-speak-read-ran-explain.mp3`, script: "Every word right, a talking pace, and a rest at the period. Here is the whole sentence one more time. Poppy and Zev ran to the carousel." },
      interaction: { type: "speak", text: "Poppy and Zev ran to the carousel" },
    },
    {
      id: "e-2-which-mark-climbs",
      band: "easier",
      difficulty: 2,
      prompt: "\"Can we ride it one more time?\" asked Poppy. Which mark makes your voice climb?",
      image: IMG("quiz-carousel-night"),
      narration: { audio: `${Q}/e-2-which-mark-climbs.mp3`, script: "The fair was about to close, and Poppy had one ticket left. Here is what she said to Zev. Can we ride it one more time? asked Poppy. One mark at the end of her words makes a voice climb. Look at the line on your screen, and tap the name of that mark." },
      hint: { audio: `${Q}/e-2-which-mark-climbs-hint.mp3`, script: "The mark you need sits at the end of Poppy's words, just before the closing quote. A climbing voice means she is asking." },
      explain: { audio: `${Q}/e-2-which-mark-climbs-explain.mp3`, script: "The question mark makes the voice climb. Poppy was asking Zev for one more ride, so her words end with a question mark, and a question mark sends the voice up." },
      interaction: { type: "choose", options: [{ id: "question-mark", label: "question mark" }, { id: "period", label: "period" }, { id: "comma", label: "comma" }], correctId: "question-mark", coachWrong: "Look at the very end of Poppy's words, just before the quote closes. Which mark sits there?" },
    },
    {
      id: "e-3-speak-first-read-laughed",
      band: "easier",
      difficulty: 3,
      prompt: "First read: The horses went up and down, and Poppy laughed out loud!",
      image: IMG("quiz-poppy-reaching"),
      narration: { audio: `${Q}/e-3-speak-first-read-laughed.mp3`, script: "The ride started, and the sentence on your screen tells what happened. This is your first read, so get the words and find out where the sentence goes. Read it out loud." },
      hint: { audio: `${Q}/e-3-speak-first-read-laughed-hint.mp3`, script: "Take it one word at a time at a talking pace, with a tiny pause at the comma." },
      explain: { audio: `${Q}/e-3-speak-first-read-laughed-explain.mp3`, script: "On a first read you found out that this sentence has a comma in the middle and ends with an exclamation point. Here it is once more. The horses went up and down, and Poppy laughed out loud!" },
      interaction: { type: "speak", text: "The horses went up and down and Poppy laughed out loud" },
    },
    {
      id: "e-4-speak-second-read-laughed",
      band: "easier",
      difficulty: 4,
      prompt: "Second read: The horses went up and down, and Poppy laughed out loud!",
      image: IMG("quiz-poppy-reaching"),
      narration: { audio: `${Q}/e-4-speak-second-read-laughed.mp3`, script: "Now read that same sentence a second time. You know it has a comma in the middle, and you know it ends with an exclamation point. Let the comma give a tiny pause, let the ending come out strong, and read it out loud." },
      hint: { audio: `${Q}/e-4-speak-second-read-laughed-hint.mp3`, script: "Nothing in this sentence can surprise you now, so pause at the comma and make the last words strong." },
      explain: { audio: `${Q}/e-4-speak-second-read-laughed-explain.mp3`, script: "On a second read you knew the comma and the exclamation point were coming, so your voice was ready for them. Here it is once more. The horses went up and down, and Poppy laughed out loud!" },
      interaction: { type: "speak", text: "The horses went up and down and Poppy laughed out loud" },
    },
    {
      id: "c-1-speak-prose-first-read",
      band: "core",
      difficulty: 1,
      prompt: "First read: The fair was closing when Poppy and Zev reached the carousel, and the painted horses were still going around under a ring of yellow lights. \"Can we ride it one more time?\" asked Poppy, holding up her last ticket.",
      narration: { audio: `${Q}/c-1-speak-prose-first-read.mp3`, script: "Here is page one of The Last Ride, and it is on your screen. This is your first read. Get the words, keep a talking pace, and follow each sentence to find out where it goes. Read both sentences out loud." },
      hint: { audio: `${Q}/c-1-speak-prose-first-read-hint.mp3`, script: "The easy way is to say it like you are telling a friend what happened. Rest for a beat at the period, then keep going." },
      explain: { audio: `${Q}/c-1-speak-prose-first-read-explain.mp3`, script: "A first read finds out that the second sentence is a question. Here is the page one more time. The fair was closing when Poppy and Zev reached the carousel, and the painted horses were still going around under a ring of yellow lights. Can we ride it one more time? asked Poppy, holding up her last ticket." },
      interaction: { type: "speak", text: "The fair was closing when Poppy and Zev reached the carousel and the painted horses were still going around under a ring of yellow lights Can we ride it one more time asked Poppy holding up her last ticket" },
    },
    {
      id: "c-2-speak-prose-second-read",
      band: "core",
      difficulty: 2,
      prompt: "Second read: The fair was closing when Poppy and Zev reached the carousel, and the painted horses were still going around under a ring of yellow lights. \"Can we ride it one more time?\" asked Poppy, holding up her last ticket.",
      narration: { audio: `${Q}/c-2-speak-prose-second-read.mp3`, script: "Here is page one of The Last Ride again, on your screen, and this time you know where it is going. You know the first sentence has a comma in the middle, and you know Poppy asks a question at the end. Let the marks move your voice from the first word, and read both sentences out loud." },
      hint: { audio: `${Q}/c-2-speak-prose-second-read-hint.mp3`, script: "Nothing in this page can surprise you now. A tiny pause at the comma, a climb at the question mark, and a rest at each period." },
      explain: { audio: `${Q}/c-2-speak-prose-second-read-explain.mp3`, script: "On the second read the voice climbed at the question mark before it even got there. Here is the page once more. The fair was closing when Poppy and Zev reached the carousel, and the painted horses were still going around under a ring of yellow lights. Can we ride it one more time? asked Poppy, holding up her last ticket." },
      interaction: { type: "speak", text: "The fair was closing when Poppy and Zev reached the carousel and the painted horses were still going around under a ring of yellow lights Can we ride it one more time asked Poppy holding up her last ticket" },
    },
    {
      id: "c-3-speak-stanza-read",
      band: "core",
      difficulty: 3,
      prompt: "Read the stanza: Around we go, the horses climb And fall again in perfect time. The music plays, the fair spins by, And Poppy laughs and reaches high.",
      narration: { audio: `${Q}/c-3-speak-stanza-read.mp3`, script: "The same ride is also a poem called Round and Round, and its first stanza is on your screen. Four lines, and each new line starts with a capital letter. Find the beat, take a tiny pause at the end of each line, and let the rhymes chime. Read all four lines out loud." },
      hint: { audio: `${Q}/c-3-speak-stanza-read-hint.mp3`, script: "Tap the beat with one finger while you read, and pause for a moment wherever a capital letter starts a new line." },
      explain: { audio: `${Q}/c-3-speak-stanza-read-explain.mp3`, script: "Around we go, the horses climb, and fall again in perfect time. The music plays, the fair spins by, and Poppy laughs and reaches high. A steady beat, a pause at every line end, and climb rhymes with time, by with high." },
      interaction: { type: "speak", text: "Around we go the horses climb And fall again in perfect time The music plays the fair spins by And Poppy laughs and reaches high" },
    },
    {
      id: "c-4-line-end-vs-sentence-end",
      band: "core",
      difficulty: 4,
      prompt: "Around we go, the horses climb And fall again in perfect time. What is true about this sentence?",
      narration: { audio: `${Q}/c-4-line-end-vs-sentence-end.mp3`, script: "Here are the first two lines of Round and Round, on your screen. The capital letter on And shows where line two begins. Think about where the line ends and where the sentence ends, and tap the card that tells the truth about this sentence." },
      hint: { audio: `${Q}/c-4-line-end-vs-sentence-end-hint.mp3`, script: "Find the period. Is it at the end of line one, or somewhere else?" },
      explain: { audio: `${Q}/c-4-line-end-vs-sentence-end-explain.mp3`, script: "The sentence runs on into line two. Line one ends after climb with no mark at all, so the voice takes a tiny pause there and keeps the sentence alive until the period after time." },
      interaction: { type: "choose", options: [{ id: "runs-on-into-line-two", label: "it runs on into line two" }, { id: "ends-with-line-one", label: "it ends with line one" }, { id: "starts-on-line-two", label: "it starts on line two" }, { id: "ends-after-the-word-go", label: "it ends after the word go" }], correctId: "runs-on-into-line-two", coachWrong: "A line end and a sentence end are not always the same place. Look for the period." },
    },
    {
      id: "c-5-sort-story-page-poem",
      band: "core",
      difficulty: 5,
      prompt: "Sort it: how do you read a Story Page, and how do you read a Poem?",
      narration: { audio: `${Q}/c-5-sort-story-page-poem.mp3`, script: "Six cards describe how a reader handles a text out loud. Three belong to a story page, where the sentence and its marks drive the voice. Three belong to a poem, where the lines, the beat, and the rhyme drive it. Read each card and drag it to Story Page or to Poem." },
      hint: { audio: `${Q}/c-5-sort-story-page-poem-hint.mp3`, script: "Ask what drives the voice on that card. A sentence with speech tags, or lines with a beat and a rhyme?" },
      explain: { audio: `${Q}/c-5-sort-story-page-poem-explain.mp3`, script: "The sentence drives it, the tags name the speaker, and no beat and no rhyme all describe a story page. The lines drive it, a beat you can tap, and rhymes at the line ends all describe a poem." },
      interaction: { type: "sort", buckets: ["Story Page", "Poem"], bucketAudio: { "Story Page": `${Q}/b-story-page.mp3`, "Poem": `${Q}/b-poem.mp3` }, items: [{ label: "the sentence drives it", bucket: "Story Page" }, { label: "the lines drive it", bucket: "Poem" }, { label: "the tags name the speaker", bucket: "Story Page" }, { label: "a beat you can tap", bucket: "Poem" }, { label: "no beat and no rhyme", bucket: "Story Page" }, { label: "rhymes at the line ends", bucket: "Poem" }], coachWrong: "Picture reading that card out loud. Does it sound like a story page, or like a poem with lines?" },
    },
    {
      id: "c-6-speak-production-two-forms",
      band: "core",
      difficulty: 6,
      prompt: "How is a poem read differently from a story page, and what does a second read give you?",
      narration: { audio: `${Q}/c-6-speak-production-two-forms.mp3`, script: "Now tell it in your own words, with no cards to tap. You read a story page twice and a stanza once. Tap the mic. Tell me one thing you do differently when you read a poem out loud, and then tell me what a second read gives you that a first read cannot." },
      hint: { audio: `${Q}/c-6-speak-production-two-forms-hint.mp3`, script: "Think about what drives your voice in a poem, and about what you already know the second time through a page." },
      explain: { audio: `${Q}/c-6-speak-production-two-forms-explain.mp3`, script: "In a poem you pause at the line ends, keep the beat, and listen for the rhyme. A second read is better because you already know where the sentence is going, so the marks can move your voice from the first word." },
      interaction: { type: "speak", text: "lines line beat tap tapping rhyme rhymes rhyming pause pauses pausing end ends break stanza sentence marks mark know knew knowing where going coming ahead smooth smoother better twice again second expression voice climb strong" },
    },
    {
      id: "h-1-rhythm-changes",
      band: "harder",
      difficulty: 1,
      prompt: "The music slows. The horses creep. The lights go dim. The fair Falls asleep. What should your voice do as the lines get shorter?",
      narration: { audio: `${Q}/h-1-rhythm-changes.mp3`, script: "Here is a fourth grade step. In some poems the rhythm changes on purpose. Listen to the last stanza of Round and Round, and count the beats in each line. The music slows. The horses creep. The lights go dim. The fair, falls asleep. The first line had a full, steady beat. Then the poet cut the lines shorter and shorter, until the last line is only two words, and the sentence about the fair is split across two lines. When the lines get shorter, the beat slows, and the reader slows with it, because the poet is using the shape of the lines to show the ride winding down. Now the check. The stanza is on your screen. Tap the card that tells what your voice should do as the lines get shorter." },
      hint: { audio: `${Q}/h-1-rhythm-changes-hint.mp3`, script: "Picture the carousel at the end of the ride. The lines are doing the same thing the ride is doing." },
      explain: { audio: `${Q}/h-1-rhythm-changes-explain.mp3`, script: "The right answer is to slow down with the lines. The poet made each line shorter to show the ride winding down, so a reader slows the beat and lets the last two words land softly." },
      interaction: { type: "choose", options: [{ id: "slow-down-with-the-lines", label: "slow down with the lines" }, { id: "speed-up-to-finish-fast", label: "speed up to finish fast" }, { id: "keep-the-same-steady-beat", label: "keep the same steady beat" }, { id: "get-louder-on-each-line", label: "get louder on each line" }], correctId: "slow-down-with-the-lines", coachWrong: "Listen to the stanza again in your head. Each line is shorter than the one before it. What is the ride doing?" },
    },
    {
      id: "h-2-speak-read-slowing-stanza",
      band: "harder",
      difficulty: 2,
      prompt: "Read the stanza: The music slows. The horses creep. The lights go dim. The fair Falls asleep.",
      narration: { audio: `${Q}/h-2-speak-read-slowing-stanza.mp3`, script: "Now the slowing stanza is yours, and it is on your screen. Four lines, and each new line starts with a capital letter. Keep a steady beat on the first line, then let your voice slow as the lines get shorter, and keep the last sentence alive across its line break. Read all four lines out loud." },
      hint: { audio: `${Q}/h-2-speak-read-slowing-stanza-hint.mp3`, script: "The first line gets a steady beat. After that, each line is shorter, so your voice gets slower and softer until the very last word." },
      explain: { audio: `${Q}/h-2-speak-read-slowing-stanza-explain.mp3`, script: "Steady, then slower, then slower still, with a tiny pause after fair and a soft landing on asleep. Here is the stanza once more. The music slows. The horses creep. The lights go dim. The fair, falls asleep." },
      interaction: { type: "speak", text: "The music slows The horses creep The lights go dim The fair Falls asleep" },
    },
    {
      id: "h-3-why-split-the-line",
      band: "harder",
      difficulty: 3,
      prompt: "The fair Falls asleep. Why did the poet split this short sentence across two lines?",
      narration: { audio: `${Q}/h-3-why-split-the-line.mp3`, script: "Remember the rule from the slowing stanza. When a poet cuts the lines short, the beat slows and the reader slows with it. The last sentence of Round and Round is on your screen, and it is only four words long, yet the poet broke it into two lines, with the capital letter on Falls showing the break. Think about what that break does to a reader, and tap the card that tells why the poet split it." },
      hint: { audio: `${Q}/h-3-why-split-the-line-hint.mp3`, script: "What happens to your voice at a line end? Now think about what happens to the ride at the end of the poem." },
      explain: { audio: `${Q}/h-3-why-split-the-line-explain.mp3`, script: "The poet split it to slow the reader down. The line break after fair forces a tiny pause, so the last two words come out slow and soft, just as the carousel comes to a stop." },
      interaction: { type: "choose", options: [{ id: "to-slow-the-reader-down", label: "to slow the reader down" }, { id: "to-make-it-rhyme-with-dim", label: "to make it rhyme with dim" }, { id: "to-turn-it-into-a-question", label: "to turn it into a question" }, { id: "to-make-the-reader-shout", label: "to make the reader shout" }], correctId: "to-slow-the-reader-down", coachWrong: "The break does not change the words or the marks. Think about what it does to the speed of your voice." },
    },
    {
      id: "h-4-speak-production-rhythm",
      band: "harder",
      difficulty: 4,
      prompt: "What does your voice do when the lines get shorter, and what did your second read know?",
      narration: { audio: `${Q}/h-4-speak-production-rhythm.mp3`, script: "Last one, out loud. Here is the slowing stanza once more. The music slows. The horses creep. The lights go dim. The fair, falls asleep. Tap the mic. Tell me in your own words what your voice does when the lines of a poem get shorter, and then tell me one thing a second read of this stanza would already know." },
      hint: { audio: `${Q}/h-4-speak-production-rhythm-hint.mp3`, script: "Say what happens to your speed as the lines shrink, then say what you would know about the last two lines before you got there." },
      explain: { audio: `${Q}/h-4-speak-production-rhythm-explain.mp3`, script: "Shorter lines mean a slower, quieter voice. A second read already knows that the last sentence breaks after the word fair, so the reader is ready to pause there and to finish quietly on the word asleep." },
      interaction: { type: "speak", text: "slow slows slower slowed down quiet quieter soft softer softly short shorter shrink lines line beat pause pauses end ends break split know knew where going smooth smoother better ready sleep asleep fair stop stops" },
    },
  ],
};
