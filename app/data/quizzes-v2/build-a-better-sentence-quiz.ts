import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Build a Better Sentence QUIZ (L.3.1) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt irregular plural / irregular past / joining word with 3 picture
// supports) / core(on-grade G3: joining word that fits the meaning, join-two-
// sentences build, the agreement fix on a spoken wrong sentence, the tense
// fix on an irregular past, Compound / Complex sort, production speak) /
// harder(G4 transfer TAUGHT in each stimulus first, L.4.1: relative pronouns
// who / which / that, the progressive was-holding form for an action going
// on at one moment in the past, closing with a production speak). ALL
// stimuli FRESH vs the lesson (no Sadie, no Enzo, no egg drop, no lesson
// sentence reused) and grep-swept vs the whole catalog. Frame: Ayla and her
// little brother Wyatt put on a puppet show for the little cousins in
// Grandpa Rufus's garage (wolf puppets sewn from socks, a bedsheet curtain
// hung on a rope, three garage shelves, the flashlight spotlight, the cat
// that jumps onto the stage). Quiz words: wolves, hung, shelves, because,
// swept, were, was holding, who, which. Names Ayla, Wyatt, Rufus fresh.
// Tiles lowercase, audio-free, kebab ids; bucket clips are quiz-local
// b-*.mp3 pre-synthed from punctuated labels; every stimulus is spoken inside
// its own question (no earlier-question recall); the wrong sentence in c-3 is
// its own short spoken sentence so the voice cannot correct it.

const Q = "/audio/quizzes-v2/build-a-better-sentence-quiz";
const IMG = (w: string) => `/images/lessons-v2/build-a-better-sentence/${w.toLowerCase()}.png`;

export const buildABetterSentenceQuiz: QuizDef = {
  id: "build-a-better-sentence-quiz",
  lessonId: "build-a-better-sentence",
  title: "Build a Better Sentence Quiz",
  standard: "L.3.1",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-two-wolves",
      band: "easier",
      difficulty: 1,
      prompt: "One wolf puppet, and now two ___. Which word fits?",
      image: IMG("quiz-two-wolf-puppets"),
      narration: { audio: `${Q}/e-1-two-wolves.mp3`, script: "Here is the start of a puppet show. Ayla sewed one wolf puppet out of a gray sock, and her little brother Wyatt sewed another one. Look at the picture. One wolf, and now two of them. Tap the word that means more than one wolf." },
      hint: { audio: `${Q}/e-1-two-wolves-hint.mp3`, script: "This word changes at the end instead of just taking an s. Say each choice out loud and listen for the real word." },
      explain: { audio: `${Q}/e-1-two-wolves-explain.mp3`, script: "Wolves is the word, because wolf changes its ending to v e s instead of taking an s. One wolf, two wolves." },
      interaction: { type: "choose", options: [{ id: "wolves", label: "wolves" }, { id: "wolfs", label: "wolfs" }, { id: "wolfes", label: "wolfes" }], correctId: "wolves", coachWrong: "Say that word out loud. Does it sound like a real word for two of them? Try the one that changes its ending." },
    },
    {
      id: "e-2-hung-the-curtain",
      band: "easier",
      difficulty: 2,
      prompt: "Yesterday Ayla ___ a bedsheet across the garage door.",
      image: IMG("quiz-sheet-curtain"),
      narration: { audio: `${Q}/e-2-hung-the-curtain.mp3`, script: "The puppet show needed a curtain. Look at the picture. Here is the sentence, and it is on your screen. Yesterday Ayla blank a bedsheet across the garage door on a rope. Yesterday means it already happened. Tap the word that tells about the past." },
      hint: { audio: `${Q}/e-2-hung-the-curtain-hint.mp3`, script: "Yesterday means the past, and this verb does not take e d. The word changes on the inside." },
      explain: { audio: `${Q}/e-2-hung-the-curtain-explain.mp3`, script: "Hung is the past of hang. Yesterday Ayla hung the sheet. There is no e d, because the word changes on the inside instead." },
      interaction: { type: "choose", options: [{ id: "hung", label: "hung" }, { id: "hanged", label: "hanged" }, { id: "hangs", label: "hangs" }], correctId: "hung", coachWrong: "Yesterday is the past. Say the sentence with your word inside. Does it sound like something that already happened?" },
    },
    {
      id: "e-3-tired-but-kept-sewing",
      band: "easier",
      difficulty: 3,
      prompt: "Wyatt was tired, ___ he kept sewing.",
      narration: { audio: `${Q}/e-3-tired-but-kept-sewing.mp3`, script: "Here is a sentence with a hole, and it is on your screen. Wyatt was tired, blank he kept sewing. He kept going even though he was tired. Three small words are on your screen. Tap the one that fits." },
      hint: { audio: `${Q}/e-3-tired-but-kept-sewing-hint.mp3`, script: "The second half goes against what the first half made you expect. Which small word shows a change?" },
      explain: { audio: `${Q}/e-3-tired-but-kept-sewing-explain.mp3`, script: "But fits. Wyatt was tired, but he kept sewing. But shows that the second half goes the other way from the first." },
      interaction: { type: "choose", options: [{ id: "but", label: "but" }, { id: "because", label: "because" }, { id: "when", label: "when" }], correctId: "but", coachWrong: "Say the sentence with your word inside. Does it show that he kept going even though he was tired?" },
    },
    {
      id: "e-4-three-shelves",
      band: "easier",
      difficulty: 4,
      prompt: "Grandpa Rufus has three ___ in the garage. Which word fits?",
      image: IMG("quiz-garage-shelves"),
      narration: { audio: `${Q}/e-4-three-shelves.mp3`, script: "Grandpa Rufus keeps his garage neat. One shelf holds the paint cans, and two more hold the tools and the pots. Look at the picture and count them. Tap the word that means more than one shelf." },
      hint: { audio: `${Q}/e-4-three-shelves-hint.mp3`, script: "Shelf ends with an f. For more than one, the f changes before the ending goes on." },
      explain: { audio: `${Q}/e-4-three-shelves-explain.mp3`, script: "Shelves is the word. One shelf, three shelves. The f turns into v e s, the same way wolf turns into wolves." },
      interaction: { type: "choose", options: [{ id: "shelves", label: "shelves" }, { id: "shelfs", label: "shelfs" }, { id: "shelfes", label: "shelfes" }], correctId: "shelves", coachWrong: "Say that word out loud. A word that ends in f usually changes that f before it takes its ending." },
    },
    {
      id: "c-1-because-flashlight",
      band: "core",
      difficulty: 1,
      prompt: "Wyatt could not see the cousins ___ the flashlight was pointed at his face.",
      narration: { audio: `${Q}/c-1-because-flashlight.mp3`, script: "Here is a sentence with a hole, and it is on your screen. Wyatt could not see the cousins blank the flashlight was pointed at his face. Think about what the second half is doing for the first half. Four joining words are on your screen. Tap the one whose meaning fits." },
      hint: { audio: `${Q}/c-1-because-flashlight-hint.mp3`, script: "The second half tells the reason he could not see. Which joining word points to a reason?" },
      explain: { audio: `${Q}/c-1-because-flashlight-explain.mp3`, script: "Because fits, since the flashlight in his face is the reason he could not see. So would point to a result, although would say even though, and until would set a time." },
      interaction: { type: "choose", options: [{ id: "because", label: "because" }, { id: "so", label: "so" }, { id: "although", label: "although" }, { id: "until", label: "until" }], correctId: "because", coachWrong: "Say the sentence with your word inside. Does the second half give the reason for the first half?" },
    },
    {
      id: "c-2-build-sheet-fell",
      band: "core",
      difficulty: 2,
      prompt: "Build one compound sentence: what happened first, the joining word, then the result.",
      narration: { audio: `${Q}/c-2-build-sheet-fell.mp3`, script: "Now you build a compound sentence from three pieces. Two pieces are whole ideas, and one piece is the joining word so. So points to a result, which means the thing that happened first goes first, then so, then what happened because of it. Tap the three pieces in order." },
      hint: { audio: `${Q}/c-2-build-sheet-fell-hint.mp3`, script: "Which piece happened first, and which piece happened because of it? The first thing, then so, then the result." },
      explain: { audio: `${Q}/c-2-build-sheet-fell-explain.mp3`, script: "The sheet fell down, so Ayla pinned it back up. The fall came first, and the pinning was the result, so the joining word so sits between them." },
      interaction: { type: "sequence", items: [{ id: "pinned-it-back-up", label: "ayla pinned it back up" }, { id: "so", label: "so" }, { id: "sheet-fell-down", label: "the sheet fell down" }], order: ["sheet-fell-down","so","pinned-it-back-up"], coachWrong: "Which piece happened first, and which piece happened because of it? The first thing, then so, then the result." },
    },
    {
      id: "c-3-cousins-were",
      band: "core",
      difficulty: 3,
      prompt: "The three cousins ___ in the front row. Which verb fixes it?",
      narration: { audio: `${Q}/c-3-cousins-were.mp3`, script: "Here is a sentence with one wrong word, and you will fix it. The three cousins was in the front row. Run the check. Find the subject, and ask one or more than one. Four verbs are on your screen. Tap the one that fixes the sentence." },
      hint: { audio: `${Q}/c-3-cousins-were-hint.mp3`, script: "The subject is the three cousins. That is more than one. Which verb goes with more than one in the past?" },
      explain: { audio: `${Q}/c-3-cousins-were-explain.mp3`, script: "Were fixes it. The three cousins were in the front row. Was goes with one, and were goes with more than one." },
      interaction: { type: "choose", options: [{ id: "were", label: "were" }, { id: "was", label: "was" }, { id: "is", label: "is" }, { id: "am", label: "am" }], correctId: "were", coachWrong: "Find the subject. Three cousins is more than one, and the show already happened. Say the sentence with your verb inside." },
    },
    {
      id: "c-4-grandpa-swept",
      band: "core",
      difficulty: 4,
      prompt: "Before the show, Grandpa Rufus ___ the garage floor.",
      narration: { audio: `${Q}/c-4-grandpa-swept.mp3`, script: "Here is the sentence, and it is on your screen. Before the show, Grandpa Rufus blank the garage floor. The show already happened, so the verb tells about the past, and this verb is one of the ones that refuses e d. Four forms are on your screen. Tap the one that fits." },
      hint: { audio: `${Q}/c-4-grandpa-swept-hint.mp3`, script: "The sweeping already happened, and this verb does not take e d. Say the sentence with your form inside." },
      explain: { audio: `${Q}/c-4-grandpa-swept-explain.mp3`, script: "Swept fits. Before the show, Grandpa Rufus swept the garage floor. Sweep becomes swept in the past, with no e d." },
      interaction: { type: "choose", options: [{ id: "swept", label: "swept" }, { id: "sweeps", label: "sweeps" }, { id: "sweeping", label: "sweeping" }, { id: "sweep", label: "sweep" }], correctId: "swept", coachWrong: "That form does not tell about the past. This verb changes on the inside instead of taking e d. Try again." },
    },
    {
      id: "c-5-sort-compound-complex",
      band: "core",
      difficulty: 5,
      prompt: "Sort each sentence: Compound or Complex.",
      narration: { audio: `${Q}/c-5-sort-compound-complex.mp3`, script: "Six sentences from the puppet show are on your screen, and the joining word in each one tells you what kind it is. If a comma and a small word hold two whole ideas together, drag the sentence to Compound. If a word like when, because, or until starts a part that leans on the rest, drag the sentence to Complex." },
      hint: { audio: `${Q}/c-5-sort-compound-complex-hint.mp3`, script: "Find the joining word. Could both halves stand alone as whole sentences? Then it is compound. Does one part lean on the other? Then it is complex." },
      explain: { audio: `${Q}/c-5-sort-compound-complex-explain.mp3`, script: "The sentences with so, and, and but join two whole ideas, so they are compound. The sentences with when, because, and until have a part that leans on the rest, so they are complex." },
      interaction: { type: "sort", buckets: ["Compound","Complex"], bucketAudio: { "Compound": `${Q}/b-compound.mp3`, "Complex": `${Q}/b-complex.mp3` }, items: [{ label: "the sock tore, so she sewed", bucket: "Compound" }, { label: "we clapped when it ended", bucket: "Complex" }, { label: "he howled, and they laughed", bucket: "Compound" }, { label: "he bowed because we cheered", bucket: "Complex" }, { label: "it was late, but they stayed", bucket: "Compound" }, { label: "we waited until it was dark", bucket: "Complex" }], coachWrong: "Find the joining word in that sentence. Two whole ideas joined by a comma and a small word is compound. A part that leans on the rest is complex." },
    },
    {
      id: "c-6-speak-your-show",
      band: "core",
      difficulty: 6,
      prompt: "Tell one thing that happened at a show, a game, or a party. Use so, but, because, or when.",
      narration: { audio: `${Q}/c-6-speak-your-show.mp3`, script: "Think of a show, a game, or a party you went to. Tap the mic and tell one thing that happened there in one sentence. Join two ideas with so or but, or make a part lean on the rest with because or when." },
      hint: { audio: `${Q}/c-6-speak-your-show-hint.mp3`, script: "Say what happened, then add so or but and a second idea, or add because or when and a reason or a time." },
      explain: { audio: `${Q}/c-6-speak-your-show-explain.mp3`, script: "One answer could be, the cake fell over, so we ate it with spoons. Any real moment works, as long as one joining word holds two ideas together." },
      interaction: { type: "speak", text: "so but because when although until after before while show game party birthday concert play movie went saw ate sang danced played laughed cheered clapped won lost fell late cake friend cousin team ball" },
    },
    {
      id: "h-1-who-sewed",
      band: "harder",
      difficulty: 1,
      prompt: "The boy ___ sewed the second puppet was only six. Which word fits?",
      narration: { audio: `${Q}/h-1-who-sewed.mp3`, script: "Here is a fourth grade tool. A relative pronoun starts a part that tells more about a noun. Who is for people. Which is for things, with a comma in front, when the extra part could be left out. That is for things, when the part is needed to say which one. Watch. The cousin who sat in front laughed the loudest. Who points back to the cousin, a person. Now you, and the sentence is on your screen. The boy blank sewed the second puppet was only six. Tap the word that fits." },
      hint: { audio: `${Q}/h-1-who-sewed-hint.mp3`, script: "The part tells more about the boy, and a boy is a person. Which relative pronoun is for people?" },
      explain: { audio: `${Q}/h-1-who-sewed-explain.mp3`, script: "Who fits, because the boy is a person. Which is for things, and where and when tell about a place or a time." },
      interaction: { type: "choose", options: [{ id: "who", label: "who" }, { id: "which", label: "which" }, { id: "where", label: "where" }, { id: "when", label: "when" }], correctId: "who", coachWrong: "The word points back to the boy. Is the boy a person, a thing, a place, or a time?" },
    },
    {
      id: "h-2-was-holding",
      band: "harder",
      difficulty: 2,
      prompt: "Ayla ___ the flashlight when the cat jumped onto the stage. Which form shows an action going on?",
      narration: { audio: `${Q}/h-2-was-holding.mp3`, script: "A fourth grader also uses a verb form for an action that was going on at one moment in the past. It takes was or were, plus a verb ending in i n g. Watch. Grandpa Rufus was sweeping the floor when the cousins knocked. The sweeping was in the middle of happening when the knock came. Now you, and the sentence is on your screen. Ayla blank the flashlight when the cat jumped onto the stage. The holding was in the middle of happening when the cat jumped. Tap the form that shows an action going on at that moment." },
      hint: { audio: `${Q}/h-2-was-holding-hint.mp3`, script: "The form you want has two parts, was and a verb ending in i n g." },
      explain: { audio: `${Q}/h-2-was-holding-explain.mp3`, script: "The form that fits is was holding. Ayla was holding the flashlight when the cat jumped, and was plus holding shows the action was going on right at that moment." },
      interaction: { type: "choose", options: [{ id: "was-holding", label: "was holding" }, { id: "held", label: "held" }, { id: "holds", label: "holds" }, { id: "will-hold", label: "will hold" }], correctId: "was-holding", coachWrong: "You want the form that shows the action in the middle of happening. It needs was and an i n g ending." },
    },
    {
      id: "h-3-which-flashlight",
      band: "harder",
      difficulty: 3,
      prompt: "The flashlight, ___ Grandpa Rufus found in the toolbox, made a perfect spotlight.",
      narration: { audio: `${Q}/h-3-which-flashlight.mp3`, script: "One more relative pronoun. Remember the three. Who is for people. Which is for things, with a comma in front, when the extra part could be left out. That is for things when the part is needed. Here is the sentence, and it is on your screen. The flashlight, blank Grandpa Rufus found in the toolbox, made a perfect spotlight. The part sits between two commas, and the sentence still works without it. Tap the word that fits." },
      hint: { audio: `${Q}/h-3-which-flashlight-hint.mp3`, script: "A flashlight is a thing, and the extra part sits between commas. Which relative pronoun is for a thing after a comma?" },
      explain: { audio: `${Q}/h-3-which-flashlight-explain.mp3`, script: "Which fits, because the flashlight is a thing and the extra part sits between commas. Who is for people, and where and when tell about a place or a time." },
      interaction: { type: "choose", options: [{ id: "which", label: "which" }, { id: "who", label: "who" }, { id: "where", label: "where" }, { id: "when", label: "when" }], correctId: "which", coachWrong: "The word points back to the flashlight, a thing, and the part comes after a comma. Which relative pronoun does that job?" },
    },
    {
      id: "h-4-speak-fourth-grade-tools",
      band: "harder",
      difficulty: 4,
      prompt: "Say one sentence about a show using who, which, or that, or a was-ing action.",
      narration: { audio: `${Q}/h-4-speak-fourth-grade-tools.mp3`, script: "Last one, and you build it with a fourth grade tool. Tap the mic and say one sentence about the puppet show, or about any show you have seen. Use who, which, or that to tell more about a person or a thing, or use was or were with an i n g verb to show an action that was going on." },
      hint: { audio: `${Q}/h-4-speak-fourth-grade-tools-hint.mp3`, script: "Try, the puppet that howled was gray, or, the cousins were laughing when the sheet fell." },
      explain: { audio: `${Q}/h-4-speak-fourth-grade-tools-explain.mp3`, script: "One answer could be, the girl who held the flashlight was laughing the whole time. Any sentence works, as long as it uses who, which, or that, or a was i n g action." },
      interaction: { type: "speak", text: "who which that was were sewing holding sweeping watching laughing sitting howling clapping singing dancing playing puppet puppets wolf wolves curtain sheet flashlight garage stage cousins cousin grandpa ayla wyatt cat show sock socks" },
    },
  ],
};
