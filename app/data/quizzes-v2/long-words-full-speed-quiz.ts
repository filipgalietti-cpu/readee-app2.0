import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Long Words, Full Speed QUIZ (RF.4.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second text, "The
// Dig Square": the fourth grade visits an archaeological dig on a hillside
// where Portia, the archaeologist who runs the site, hands Griffin a brush no
// bigger than a toothbrush; the hillside is divided into string-marked squares
// uncovered one thin layer at a time; after an hour of concentration a curved
// edge of reddish clay appears; a single piece can show how a civilization
// cooked, stored grain or carried water; every find goes into a tray of small
// compartments for identification later in the lab; Griffin, who expected
// treasure, decides preservation of a broken pot is remarkably close to
// treasure. Every fact true, no real place or person. Pages are spoken INSIDE
// the questions (instruction first, page last, "Here is page one." bridge);
// three sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere in the quiz (the reburied / uncovered / remeasured sentence in e-4,
// page three in c-6, the last sentence in h-3, the closing examination /
// organization sentence in h-4). Bands: easier (G3-bridge, three-syllable
// words with a machine or a caboose at 3 options, the dig pictures as scene
// support, plus a one-sentence read) / core (on-grade G4: the base of a
// five-syllable word, a four-chunk sequence, a six-item Four Beats / Five
// Beats sort with b-* bucket clips, the real try among four written tries, the
// sentence clue that proves a word was read right, and a three-sentence
// accept-mode read) / harder (G5 transfer, RF.5.3a: when a suffix goes on, the
// beat you press hardest can move and a chunk can change its sound, TAUGHT on
// examine to examination in h-1, applied to organize to organization in h-1
// and to cooperate to cooperation in h-2, the last sentence read aloud in h-3,
// and a closing read of a sentence carrying examination and organization with
// a full accept list in h-4). Nothing from the lesson (Tessa, Darius, the
// opossum, the intake room, its planted words and tiles) is reused. Quiz words
// grep-swept vs lessons-v2 + quizzes-v2: excavation, concentration,
// unexpectedly, civilization, identification, independently, preservation,
// remarkably, definitely, reconsidered, examination, organization,
// cooperation, uncovered, remeasured, reburied, Griffin, Portia, archaeolog,
// artifact, dig site all 0 hits. Quiz pictures live in the lesson's image dir
// (quiz- keys).

const Q = "/audio/quizzes-v2/long-words-full-speed-quiz";
const IMG = (w: string) => `/images/lessons-v2/long-words-full-speed/${w.toLowerCase()}.png`;

export const longWordsFullSpeedQuiz: QuizDef = {
  id: "long-words-full-speed-quiz",
  lessonId: "long-words-full-speed",
  title: "Long Words, Full Speed Quiz",
  standard: "RF.4.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-machine-uncovered",
      band: "easier",
      difficulty: 1,
      prompt: "Which piece is the machine at the front of uncovered?",
      image: IMG("quiz-dig-square"),
      narration: { audio: `${Q}/e-1-machine-uncovered.mp3`, script: "Here is a sentence from a new story called The Dig Square, and it carries a three-beat word with a machine at the front. Three pieces of the word uncovered are on your screen. Tap the piece that is the machine at the front. Here is the sentence. Griffin brushed until the corner of the square was uncovered." },
      hint: { audio: `${Q}/e-1-machine-uncovered-hint.mp3`, script: "The machine sits at the very front of the word, and it is a part you have read at the front of many words." },
      explain: { audio: `${Q}/e-1-machine-uncovered-explain.mp3`, script: "The machine at the front is un. Cov is a middle chunk, and ered is the end of the word." },
      interaction: { type: "choose", options: [{ id: "un", label: "un" }, { id: "cov", label: "cov" }, { id: "ered", label: "ered" }], correctId: "un", coachWrong: "That piece is not at the front. Look at the first letters of the word." },
    },
    {
      id: "e-2-caboose-remeasured",
      band: "easier",
      difficulty: 2,
      prompt: "Which piece is the caboose at the end of remeasured?",
      image: IMG("quiz-clay-piece"),
      narration: { audio: `${Q}/e-2-caboose-remeasured.mp3`, script: "Now the other edge. Three pieces of the word remeasured are on your screen. Tap the piece that is the caboose at the end, the ending you already know. Here is the sentence. Portia remeasured the square before the class went to lunch." },
      hint: { audio: `${Q}/e-2-caboose-remeasured-hint.mp3`, script: "The caboose rides at the very end of the word, and it is a short ending you have read on hundreds of words." },
      explain: { audio: `${Q}/e-2-caboose-remeasured-explain.mp3`, script: "The caboose at the end is ed. Re is the machine at the front, and meas is the start of the base." },
      interaction: { type: "choose", options: [{ id: "ed", label: "ed" }, { id: "re", label: "re" }, { id: "meas", label: "meas" }], correctId: "ed", coachWrong: "That piece is not at the end. Look at the last letters of the word." },
    },
    {
      id: "e-3-beats-reburied",
      band: "easier",
      difficulty: 3,
      prompt: "How many beats are in reburied?",
      image: IMG("quiz-finds-tray"),
      narration: { audio: `${Q}/e-3-beats-reburied.mp3`, script: "This one is about counting the beats. Say the word reburied slowly and tap once for every beat you say. Then tap the number on your screen. Here is the sentence. A loose corner of the square had been reburied by the wind overnight." },
      hint: { audio: `${Q}/e-3-beats-reburied-hint.mp3`, script: "The trick is to say it slowly and tap the desk once for every beat, then count the taps." },
      explain: { audio: `${Q}/e-3-beats-reburied-explain.mp3`, script: "Reburied has three beats. Re, bur, eed. The machine re is one beat, and the base carries the other two." },
      interaction: { type: "choose", options: [{ id: "three", label: "three" }, { id: "two", label: "two" }, { id: "four", label: "four" }], correctId: "three", coachWrong: "Say reburied again, slowly, and tap once for every beat. Count the taps." },
    },
    {
      id: "e-4-speak-read-brushing",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Griffin kept brushing until the reburied corner was uncovered again, and Portia remeasured the square before lunch.",
      narration: { audio: `${Q}/e-4-speak-read-brushing.mp3`, script: "The sentence on your screen comes from page one of The Dig Square, and it carries three long words with a machine or a caboose on them. Tap the mic, then read the whole sentence out loud at a talking pace, and keep it moving through the long words." },
      hint: { audio: `${Q}/e-4-speak-read-brushing-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the name Griffin." },
      explain: { audio: `${Q}/e-4-speak-read-brushing-explain.mp3`, script: "The sentence tells you that Griffin brushed the reburied corner clean again, and that Portia measured the square one more time before lunch." },
      interaction: { type: "speak", text: "Griffin kept brushing until the reburied corner was uncovered again and Portia remeasured the square before lunch" },
    },
    {
      id: "c-1-base-unexpectedly",
      band: "core",
      difficulty: 1,
      prompt: "Which piece is the base of unexpectedly?",
      narration: { audio: `${Q}/c-1-base-unexpectedly.mp3`, script: "Step one is the edges, and then the base in the middle. Four pieces of the word unexpectedly are on your screen. One piece is the base, the word that was there before any machine or caboose went on. Tap the base after you hear the sentence. Here is page two. Griffin brushed for an hour with total concentration before a curved edge of clay appeared, reddish and unexpectedly smooth under the dirt." },
      hint: { audio: `${Q}/c-1-base-unexpectedly-hint.mp3`, script: "Take the machine off the front and the cabooses off the end. The word left in the middle is the base." },
      explain: { audio: `${Q}/c-1-base-unexpectedly-explain.mp3`, script: "The base is expect. Un is the machine at the front, and ed and ly are two cabooses stacked at the end." },
      interaction: { type: "choose", options: [{ id: "expect", label: "expect" }, { id: "un", label: "un" }, { id: "ed", label: "ed" }, { id: "ly", label: "ly" }], correctId: "expect", coachWrong: "That piece is an edge, a machine or a caboose. The base is what is left in the middle when the edges come off." },
    },
    {
      id: "c-2-sequence-excavation",
      band: "core",
      difficulty: 2,
      prompt: "Drag the four beats of excavation into order.",
      narration: { audio: `${Q}/c-2-sequence-excavation.mp3`, script: "Chunk this one by ear. The word is excavation, the word Portia used for the whole dig. Say it slowly and feel the beats. The four beats are on your screen, mixed up. Drag them into the order you say them, first beat first. Here is the sentence. Portia told the class that the whole excavation moved at the speed of settling dust." },
      hint: { audio: `${Q}/c-2-sequence-excavation-hint.mp3`, script: "The first beat you hear goes first, and the shun ending goes last." },
      explain: { audio: `${Q}/c-2-sequence-excavation-explain.mp3`, script: "The order is ex, ca, va, tion. Excavation. Say it slowly and each beat lands in that order." },
      interaction: { type: "sequence", items: [{ id: "ex", label: "ex" }, { id: "ca", label: "ca" }, { id: "va", label: "va" }, { id: "tion", label: "tion" }], order: ["ex","ca","va","tion"], coachWrong: "Say excavation slowly. Which beat do you hear first? Start there, and add one beat at a time." },
    },
    {
      id: "c-3-sort-beats",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Four Beats, or Five Beats?",
      narration: { audio: `${Q}/c-3-sort-beats.mp3`, script: "Six long words from the dig are on your screen. Say each one out loud, tap out its beats, and drag it to Four Beats or to Five Beats. Some of them you have heard today and some are new, and counting works the same on both." },
      hint: { audio: `${Q}/c-3-sort-beats-hint.mp3`, script: "One word at a time. Say it slowly, tap once for every beat, and count the taps before you drag." },
      explain: { audio: `${Q}/c-3-sort-beats-explain.mp3`, script: "Excavation, concentration and preservation each have four beats. Civilization, independently and unexpectedly each have five." },
      interaction: { type: "sort", buckets: ["Four Beats","Five Beats"], bucketAudio: { "Four Beats": `${Q}/b-four-beats.mp3`, "Five Beats": `${Q}/b-five-beats.mp3` }, items: [{ label: "excavation", bucket: "Four Beats" }, { label: "civilization", bucket: "Five Beats" }, { label: "concentration", bucket: "Four Beats" }, { label: "independently", bucket: "Five Beats" }, { label: "preservation", bucket: "Four Beats" }, { label: "unexpectedly", bucket: "Five Beats" }], coachWrong: "Say that word slowly and tap once for every beat you say. Count the taps, then drag it again." },
    },
    {
      id: "c-4-real-try-definitely",
      band: "core",
      difficulty: 4,
      prompt: "Which try is the real word definitely?",
      narration: { audio: `${Q}/c-4-real-try-definitely.mp3`, script: "The word on your screen was chunked four different ways, and the four tries are written under it the way they sound. Say each try out loud and run the test. Only one of them is a word you have heard. Tap it." },
      hint: { audio: `${Q}/c-4-real-try-definitely-hint.mp3`, script: "Three of the tries give one chunk the wrong vowel sound. Say each try, and listen for the one you have heard people say." },
      explain: { audio: `${Q}/c-4-real-try-definitely-explain.mp3`, script: "The real word is def, in, it, lee. Definitely. The tries with fine, ite, or dee give a chunk a long vowel sound that the word does not have." },
      interaction: { type: "choose", options: [{ id: "def-in-it-lee", label: "def in it lee" }, { id: "de-fine-it-lee", label: "de fine it lee" }, { id: "def-in-ite-lee", label: "def in ite lee" }, { id: "dee-fin-it-lee", label: "dee fin it lee" }], correctId: "def-in-it-lee", coachWrong: "Say that try out loud again. Is it a word you have heard? One chunk in it has the wrong sound. Flex it, and test the next try." },
    },
    {
      id: "c-5-test-clue-civilization",
      band: "core",
      difficulty: 5,
      prompt: "Which clue shows that civilization was read right?",
      narration: { audio: `${Q}/c-5-test-clue-civilization.mp3`, script: "The last part of the test is the sentence itself. Page two uses the word civilization, and if I read it right, it names a whole people who lived together long ago, so the sentence should prove it. Four details from page two are on your screen, and all four are true. Only one of them is the clue that shows civilization fits. Tap it after you hear the page. Here is page two. Griffin brushed for an hour with total concentration before a curved edge of clay appeared, reddish and unexpectedly smooth under the dirt. Portia lifted it with gloved hands and said that a single piece could show how an entire civilization cooked, stored grain, or carried water." },
      hint: { audio: `${Q}/c-5-test-clue-civilization-hint.mp3`, script: "A whole people living together would do everyday things. Which detail names everyday things that people did?" },
      explain: { audio: `${Q}/c-5-test-clue-civilization-explain.mp3`, script: "The clue is, cooked and carried water. Cooking, storing grain and carrying water are things a whole people did, so civilization fits. The other details are true, but they are about the clay piece or about Griffin." },
      interaction: { type: "choose", options: [{ id: "cooked-and-carried-water", label: "cooked and carried water" }, { id: "lifted-with-gloved-hands", label: "lifted with gloved hands" }, { id: "reddish-and-smooth", label: "reddish and smooth" }, { id: "brushed-for-an-hour", label: "brushed for an hour" }], correctId: "cooked-and-carried-water", coachWrong: "That detail is true, but it tells about the clay or about Griffin, not about a whole people. Find the detail about what people did." },
    },
    {
      id: "c-6-speak-read-page-three",
      band: "core",
      difficulty: 6,
      prompt: "Read page three: Every find went into a tray of small compartments so that its identification could happen later in the lab. The pieces would be cleaned independently and then fitted together like a puzzle. Griffin, who had expected treasure, decided that preservation of a broken pot was remarkably close to treasure.",
      narration: { audio: `${Q}/c-6-speak-read-page-three.mp3`, script: "Page three is yours, and it carries four long words. Tap the mic, then read all three sentences out loud at a talking pace. When a long word comes, run the check and keep the sentence moving." },
      hint: { audio: `${Q}/c-6-speak-read-page-three-hint.mp3`, script: "The mic sits under the page, and the page begins with the words Every find." },
      explain: { audio: `${Q}/c-6-speak-read-page-three-explain.mp3`, script: "The page tells you that every find goes into a tray to be named later, that the pieces are cleaned one by one and fitted together, and that Griffin decides a saved broken pot is nearly as good as treasure." },
      interaction: { type: "speak", text: "Every find went into a tray of small compartments so that its identification could happen later in the lab The pieces would be cleaned independently and then fitted together like a puzzle Griffin who had expected treasure decided that preservation of a broken pot was remarkably close to treasure" },
    },
    {
      id: "h-1-moving-beat-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Which try is organization said right?",
      narration: { audio: `${Q}/h-1-moving-beat-taught.mp3`, script: "Here is a fifth grade move. When a caboose goes onto a word, the beat you press hardest can move, and a chunk can change its sound. Watch it happen to examine. X, am, in. The hard beat is am. Snap on the shun ending, and the word becomes examination. X, am, in, ay, shun. The hard beat moved to ay, right before the ending. Your turn with organize and the shun ending. Organize presses hardest on or, and its last chunk says eyes. Four tries at organization are on your screen. Only one moves the hard beat and says every chunk the way people really say the word. Tap it." },
      hint: { audio: `${Q}/h-1-moving-beat-taught-hint.mp3`, script: "The ize chunk of organize does not stay the same when the shun ending goes on. Say each try and listen for the one people really say." },
      explain: { audio: `${Q}/h-1-moving-beat-taught-explain.mp3`, script: "The right try is or, gan, uh, zay, shun. Organization. The hard beat moved to zay, right before the ending, and the eyes chunk of organize changed its sound." },
      interaction: { type: "choose", options: [{ id: "or-gan-uh-zay-shun", label: "or gan uh zay shun" }, { id: "or-gan-ize-a-shun", label: "or gan ize a shun" }, { id: "or-gan-eye-zay-shun", label: "or gan eye zay shun" }, { id: "or-gan-uh-za-tee-on", label: "or gan uh za tee on" }], correctId: "or-gan-uh-zay-shun", coachWrong: "Say that try out loud. Is it the word people really say? Check the chunk that came from ize, and check where the hard beat lands." },
    },
    {
      id: "h-2-hard-beat-cooperation",
      band: "harder",
      difficulty: 2,
      prompt: "Which beat gets the hard press in cooperation?",
      narration: { audio: `${Q}/h-2-hard-beat-cooperation.mp3`, script: "The move again, on a new word. The word cooperate presses hardest on the beat op. Co, op, er, ate. Snap on the shun ending and the word becomes cooperation. Say it slowly and feel where the hard press lands now. Four beats of cooperation are on your screen. Tap the beat that gets the hard press." },
      hint: { audio: `${Q}/h-2-hard-beat-cooperation-hint.mp3`, script: "The loudest beat is the one to listen for. Say cooperation slowly, and it sits right before the shun ending." },
      explain: { audio: `${Q}/h-2-hard-beat-cooperation-explain.mp3`, script: "The hard press lands on ray. Co, op, er, ray, shun. The beat moved from op in cooperate to ray in cooperation." },
      interaction: { type: "choose", options: [{ id: "ray", label: "ray" }, { id: "co", label: "co" }, { id: "op", label: "op" }, { id: "shun", label: "shun" }], correctId: "ray", coachWrong: "Say cooperation slowly and listen for the loudest beat. It is not the beat that was loudest in cooperate." },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: By the time the bus came, Griffin had definitely reconsidered what a boring morning could look like.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of The Dig Square is on your screen, and it carries two long words. Tap the mic, then read the whole sentence out loud at a talking pace, and let the ending land." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words By the time." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that when the bus finally arrived, Griffin had changed his mind about what a boring morning could be." },
      interaction: { type: "speak", text: "By the time the bus came Griffin had definitely reconsidered what a boring morning could look like" },
    },
    {
      id: "h-4-speak-read-moving-beats",
      band: "harder",
      difficulty: 4,
      prompt: "Read it: Portia said that a careful examination of one clay piece, and the organization of every find in the tray, was the real work of the dig.",
      narration: { audio: `${Q}/h-4-speak-read-moving-beats.mp3`, script: "Last one, and it carries both fifth grade words. The sentence on your screen holds examination and organization, and nobody reads it for you. Tap the mic, then read the whole sentence out loud at a talking pace, pressing the hard beat where it belongs in each long word." },
      hint: { audio: `${Q}/h-4-speak-read-moving-beats-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the name Portia." },
      explain: { audio: `${Q}/h-4-speak-read-moving-beats-explain.mp3`, script: "The sentence tells you that Portia sees two jobs as the real work, looking closely at one clay piece and putting every find in order in the tray." },
      interaction: { type: "speak", text: "Portia said that a careful examination of one clay piece and the organization of every find in the tray was the real work of the dig" },
    },
  ],
};
