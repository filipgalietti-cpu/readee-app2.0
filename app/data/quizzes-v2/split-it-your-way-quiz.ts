import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Split It Your Way QUIZ (RF.4.3a) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second text,
// "The Glass Studio" (Corbin, eleven, spends the first day of summer beside
// the furnace in his aunt's glass studio: molten glass gathered on a steel
// pipe, the gather rolled on a steel bench, a pinch of cobalt powder for
// blue, a goblet cooling on a wooden pedestal, the crucible that holds the
// melted color inside the furnace, the pipe swiveled so the soft glass does
// not sag, vapor off a wet wooden paddle, radiant blue goblets on the shelf,
// the old radiator ticking, an ornamental stem; every fact true). The text
// is spoken page by page INSIDE the questions so every Q is self-contained,
// and no lesson word (trumpet, percussion, cadence, melody, assemble,
// auditorium, tassel, polish, bugle, scramble, ceremony) appears anywhere.
// Bands: easier (G3-bridge two-syllable splits at 3 options: the wall on
// molten, the swing on cobalt, the tail on dazzle, plus a bare-word read of
// three two-syllable words) / core (on-grade G4: the swing-then-swing-back
// split on pedestal, the swing-plus-tail split on crucible, a six-item Wall
// Split / Swing Split sort of page words with b-* bucket clips, the four
// chunks of ornamental in order, the soft chunk of radiator, and a sentence
// read with accepts) / harder (G5 transfer, RF.5.3a: a suffix can MOVE the
// loud chunk and change which chunk goes soft, taught on atom and atomic in
// h-1 then applied to historical, applied again as which pair moves its loud
// chunk (metal to metallic), a Loud Chunk Moves / Loud Chunk Stays sort, and
// a closing production read of a sentence carrying historical, original and
// metallic with a full accept list). Two on-screen read-alouds live in the
// quiz (c-6, h-4) plus the bare-word read in e-4. Grep-swept vs lessons-v2 +
// quizzes-v2 BEFORE writing: glass studio / molten / goblet / cobalt /
// pedestal / crucible / swivel / dazzle / furnace / ornamental / radiator /
// harmonic / athlete / Corbin all 0 hits (pigment is a taught word in the
// flamingo lesson, so the color is a powder here; marble is burned by marble
// runs; lantern is burned; vapor and symbol are prose only). Quiz support
// images live in the lesson's image dir (quiz-studio, quiz-goblet).

const Q = "/audio/quizzes-v2/split-it-your-way-quiz";
const IMG = (w: string) => `/images/lessons-v2/split-it-your-way/${w.toLowerCase()}.png`;

export const splitItYourWayQuiz: QuizDef = {
  id: "split-it-your-way-quiz",
  lessonId: "split-it-your-way",
  title: "Split It Your Way Quiz",
  standard: "RF.4.3a",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-wall-molten",
      band: "easier",
      difficulty: 1,
      prompt: "Where does molten split? Tap it.",
      image: IMG("quiz-studio"),
      narration: { audio: `${Q}/e-1-wall-molten.mp3`, script: "Here is page one of a new text called The Glass Studio, and one long word from it is on your screen three ways. Two consonants between two vowels make a wall, and the split goes down the middle of the wall. Listen to the page, then tap the split that cuts the wall in the word molten. Corbin's aunt ran a glass studio in an old brick building, and on the first day of summer she let him stand beside the furnace while she gathered molten glass on the end of a long steel pipe. The glowing blob dazzled him, and he took one step back from the heat." },
      hint: { audio: `${Q}/e-1-wall-molten-hint.mp3`, script: "Find the first two vowels, then count the consonants between them. The cut goes between those two consonants." },
      explain: { audio: `${Q}/e-1-wall-molten-explain.mp3`, script: "The vowels are o and e, and the letters l and t stand between them, so the wall splits as mol, ten. Molten." },
      interaction: { type: "choose", options: [{ id: "mol-ten", label: "mol-ten" }, { id: "mo-lten", label: "mo-lten" }, { id: "molt-en", label: "molt-en" }], correctId: "mol-ten", coachWrong: "The cut goes between the two consonants, not before both of them and not after both of them." },
    },
    {
      id: "e-2-swing-cobalt",
      band: "easier",
      difficulty: 2,
      prompt: "Where does cobalt split? Tap it.",
      narration: { audio: `${Q}/e-2-swing-cobalt.mp3`, script: "Page two brings a color word, and it is on your screen three ways. One consonant between two vowels is a swing, so you swing it forward first and let the vowel say its name. Listen to the page, then tap the split that works for the word cobalt. She rolled the pipe on a steel bench, and the glass, which was the color of honey, began to stretch. A pinch of cobalt powder turned the next gather deep blue. When the goblet was done, she set it on a wooden pedestal to cool." },
      hint: { audio: `${Q}/e-2-swing-cobalt-hint.mp3`, script: "Only one consonant stands between the first two vowels. Swing it forward, say the word, and test it." },
      explain: { audio: `${Q}/e-2-swing-cobalt-explain.mp3`, script: "The letter b stands alone between o and a. Swing it forward and the o says its name. Co, balt. Cobalt, and it passes the test." },
      interaction: { type: "choose", options: [{ id: "co-balt", label: "co-balt" }, { id: "cob-alt", label: "cob-alt" }, { id: "coba-lt", label: "coba-lt" }], correctId: "co-balt", coachWrong: "Swing the consonant forward first, so the first chunk ends in its vowel. Say it and test it." },
    },
    {
      id: "e-3-tail-dazzle",
      band: "easier",
      difficulty: 3,
      prompt: "Where does the tail begin in dazzle? Tap it.",
      narration: { audio: `${Q}/e-3-tail-dazzle.mp3`, script: "Page one said the glowing blob dazzled Corbin. The word dazzle ends in a consonant plus l, e, and those three letters stick together as the tail. Count back three letters from the end and cut there. The word is on your screen three ways. Tap the split with the tail cut right." },
      hint: { audio: `${Q}/e-3-tail-dazzle-hint.mp3`, script: "The tail is exactly three letters long, one consonant and then l, e." },
      explain: { audio: `${Q}/e-3-tail-dazzle-explain.mp3`, script: "Three letters from the end are z, l, e, so the tail is zle and the first chunk is daz. Daz, zle. Dazzle." },
      interaction: { type: "choose", options: [{ id: "daz-zle", label: "daz-zle" }, { id: "dazz-le", label: "dazz-le" }, { id: "da-zzle", label: "da-zzle" }], correctId: "daz-zle", coachWrong: "Count back exactly three letters from the end. The tail is one consonant plus l, e, no more and no less." },
    },
    {
      id: "e-4-speak-three-words",
      band: "easier",
      difficulty: 4,
      prompt: "Read all three: goblet. cobalt. dazzle.",
      narration: { audio: `${Q}/e-4-speak-three-words.mp3`, script: "Three words from the studio are on your screen with no sentence around them. Tap the mic, then read all three out loud, one after the other, and split each one on the way in." },
      hint: { audio: `${Q}/e-4-speak-three-words-hint.mp3`, script: "Take them one at a time. Find the first two vowels, choose the pattern, and say the whole word." },
      explain: { audio: `${Q}/e-4-speak-three-words-explain.mp3`, script: "Gob, let. Co, balt. Daz, zle. A wall, a swing, and a tail, said one after the other." },
      interaction: { type: "speak", text: "goblet cobalt dazzle goblets dazzled" },
    },
    {
      id: "c-1-swing-back-pedestal",
      band: "core",
      difficulty: 1,
      prompt: "Where does the split go? Tap the right split of pedestal.",
      image: IMG("quiz-goblet"),
      narration: { audio: `${Q}/c-1-swing-back-pedestal.mp3`, script: "The goblet cooled on a pedestal, and that word is on your screen four ways. One consonant stands between its first two vowels, so it is a swing. Swing it forward, say the word, and test it. If that is not a word you have heard, swing it back and test again. Tap the split that gives you the real word." },
      hint: { audio: `${Q}/c-1-swing-back-pedestal-hint.mp3`, script: "Say the forward try out loud. If it fails, the consonant swings back and shuts the first vowel in." },
      explain: { audio: `${Q}/c-1-swing-back-pedestal-explain.mp3`, script: "The forward try gives pee, des, tal, which is not a word, so the d swings back and the e is shut in. Ped, es, tal. Pedestal." },
      interaction: { type: "choose", options: [{ id: "ped-es-tal", label: "ped-es-tal" }, { id: "pe-des-tal", label: "pe-des-tal" }, { id: "pede-stal", label: "pede-stal" }, { id: "ped-est-al", label: "ped-est-al" }], correctId: "ped-es-tal", coachWrong: "Say that split out loud and test it. If it is not a word you have heard, swing the consonant the other way." },
    },
    {
      id: "c-2-swing-tail-crucible",
      band: "core",
      difficulty: 2,
      prompt: "Where does the split go? Tap the right split of crucible.",
      narration: { audio: `${Q}/c-2-swing-tail-crucible.mp3`, script: "Page three brings a word with two patterns inside it, and it is on your screen four ways. Cut the tail first, then look at what is left and choose the swing. Listen to the page, then tap the right split of the word crucible. The color came from a crucible, a small clay pot that held the melted color inside the furnace. Corbin learned to swivel the pipe slowly so that the soft glass would not sag, and a cloud of vapor rose whenever a wet wooden paddle touched it." },
      hint: { audio: `${Q}/c-2-swing-tail-crucible-hint.mp3`, script: "The tail is three letters. In what is left, one consonant stands between two vowels, so swing it forward and test." },
      explain: { audio: `${Q}/c-2-swing-tail-crucible-explain.mp3`, script: "The tail is ble. What is left is cruci, and the c swings forward so the u says its name. Cru, ci, ble. Crucible." },
      interaction: { type: "choose", options: [{ id: "cru-ci-ble", label: "cru-ci-ble" }, { id: "cruc-i-ble", label: "cruc-i-ble" }, { id: "cru-cib-le", label: "cru-cib-le" }, { id: "cr-uci-ble", label: "cr-uci-ble" }], correctId: "cru-ci-ble", coachWrong: "Cut the tail first, one consonant plus l, e. Then swing the consonant in what is left and test it." },
    },
    {
      id: "c-3-sort-wall-swing",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Wall Split, or Swing Split?",
      narration: { audio: `${Q}/c-3-sort-wall-swing.mp3`, script: "Six words from the studio are on your screen. Look at the first two vowels in each word and count the consonants between them. Two consonants make a wall, so drag that word to Wall Split. One consonant is a swing, so drag that word to Swing Split." },
      hint: { audio: `${Q}/c-3-sort-wall-swing-hint.mp3`, script: "Find the first two vowels in the word, then count the letters between them. Two is a wall and one is a swing." },
      explain: { audio: `${Q}/c-3-sort-wall-swing-explain.mp3`, script: "Goblet, molten and furnace each have two consonants between their first two vowels, so they are walls. Cobalt, swivel and vapor each have one consonant there, so they are swings." },
      interaction: { type: "sort", buckets: ["Wall Split","Swing Split"], bucketAudio: { "Wall Split": `${Q}/b-wall-split.mp3`, "Swing Split": `${Q}/b-swing-split.mp3` }, items: [{ label: "goblet", bucket: "Wall Split" }, { label: "cobalt", bucket: "Swing Split" }, { label: "molten", bucket: "Wall Split" }, { label: "swivel", bucket: "Swing Split" }, { label: "furnace", bucket: "Wall Split" }, { label: "vapor", bucket: "Swing Split" }], coachWrong: "Find the first two vowels in that word and count the consonants between them. Two is a wall, and one is a swing." },
    },
    {
      id: "c-4-sequence-ornamental",
      band: "core",
      difficulty: 4,
      prompt: "Drag the four chunks of ornamental into order.",
      narration: { audio: `${Q}/c-4-sequence-ornamental.mp3`, script: "Chunk a four-chunk word. Listen to page four first, because the word is in it. By the afternoon a row of radiant blue goblets stood on the shelf, and the old radiator under the window ticked as it cooled. His aunt said that the ornamental stem on the last one was his, because he had swiveled the pipe all by himself. The word is ornamental. Say it slowly and feel each chunk. The four chunks are on your screen, mixed up. Drag them into the order you say them, first chunk first." },
      hint: { audio: `${Q}/c-4-sequence-ornamental-hint.mp3`, script: "Say ornamental slowly. Which chunk do you hear first? Start there, and add one chunk at a time." },
      explain: { audio: `${Q}/c-4-sequence-ornamental-explain.mp3`, script: "The chunks come in this order. Or, na, men, tal. Ornamental, which means made to look pretty." },
      interaction: { type: "sequence", items: [{ id: "or", label: "or" }, { id: "na", label: "na" }, { id: "men", label: "men" }, { id: "tal", label: "tal" }], order: ["or","na","men","tal"], coachWrong: "Say the word slowly and tap the chunk you hear first, then the next one." },
    },
    {
      id: "c-5-soft-chunk-radiator",
      band: "core",
      difficulty: 5,
      prompt: "Which chunk of radiator is the soft one?",
      narration: { audio: `${Q}/c-5-soft-chunk-radiator.mp3`, script: "Find the soft chunk. Page four said the old radiator under the window ticked as it cooled. The four chunks of radiator are on your screen. Say the word the way you would say it to a friend, and listen for the one chunk you barely hear, the chunk whose vowel turns into a quick uh. Tap that chunk." },
      hint: { audio: `${Q}/c-5-soft-chunk-radiator-hint.mp3`, script: "Say radiator slowly, then fast. The soft chunk is the one that almost disappears." },
      explain: { audio: `${Q}/c-5-soft-chunk-radiator-explain.mp3`, script: "Ra, di, a, tor. The first three chunks are clear, and the last one goes soft, so tor is the soft chunk, and its o says uh." },
      interaction: { type: "choose", options: [{ id: "ra", label: "ra" }, { id: "di", label: "di" }, { id: "a", label: "a" }, { id: "tor", label: "tor" }], correctId: "tor", coachWrong: "Say it again and listen for the chunk that is quiet and quick. Its vowel says uh, not its name." },
    },
    {
      id: "c-6-speak-read-sentence",
      band: "core",
      difficulty: 6,
      prompt: "Read it: Corbin set the cobalt goblet on the pedestal beside the crucible, and the vapor drifted toward the radiator.",
      narration: { audio: `${Q}/c-6-speak-read-sentence.mp3`, script: "A sentence from the studio is on your screen, and nobody reads it for you. Tap the mic, then read the whole sentence out loud at a talking pace. Choose the pattern for each long word as you reach it, and keep the sentence moving." },
      hint: { audio: `${Q}/c-6-speak-read-sentence-hint.mp3`, script: "Read it at a talking pace under the sentence, and split each long word as it comes." },
      explain: { audio: `${Q}/c-6-speak-read-sentence-explain.mp3`, script: "The sentence says that Corbin set the cobalt goblet on the pedestal beside the crucible, and that the vapor drifted toward the radiator." },
      interaction: { type: "speak", text: "cobalt goblet pedestal crucible vapor radiator drifted corbin" },
    },
    {
      id: "h-1-loud-chunk-moves",
      band: "harder",
      difficulty: 1,
      prompt: "Which chunk of historical is the loud one?",
      narration: { audio: `${Q}/h-1-loud-chunk-moves.mp3`, script: "Here is a fifth grade move. Every long word has one loud chunk and one soft chunk, and adding a part at the end can move the loud chunk. Take the word atom. At is loud, and om is soft. Add ic, and the loud chunk jumps. Atomic. Now tom is loud, and the a at the front went soft. The ending moved the loud chunk and changed which chunk says uh. Now you. The word history has his as its loud chunk. Add al, and it becomes historical. The four chunks of historical are on your screen. Say the whole word, and tap the chunk that is loud now." },
      hint: { audio: `${Q}/h-1-loud-chunk-moves-hint.mp3`, script: "Feel which chunk you push hardest when you say the whole word, because the ending pulled the loud chunk toward itself." },
      explain: { audio: `${Q}/h-1-loud-chunk-moves-explain.mp3`, script: "His, tor, i, cal. The loud chunk is tor, one chunk later than in history, and his went soft." },
      interaction: { type: "choose", options: [{ id: "his", label: "his" }, { id: "tor", label: "tor" }, { id: "i", label: "i" }, { id: "cal", label: "cal" }], correctId: "tor", coachWrong: "Say the whole word and listen for the chunk you push hardest. It is not the same chunk that was loud in history." },
    },
    {
      id: "h-2-which-pair-moves",
      band: "harder",
      difficulty: 2,
      prompt: "In which pair does the loud chunk move?",
      narration: { audio: `${Q}/h-2-which-pair-moves.mp3`, script: "Four pairs of words are on your screen, and each pair adds a part to the end of a word. In three of the pairs the loud chunk stays where it was. In one pair the loud chunk moves to a different chunk, the way it moved from atom to atomic. Say both words of each pair out loud, and tap the pair where the loud chunk moves." },
      hint: { audio: `${Q}/h-2-which-pair-moves-hint.mp3`, script: "Say the short word, then the long word, and feel whether you push the same chunk both times." },
      explain: { audio: `${Q}/h-2-which-pair-moves-explain.mp3`, script: "The pair is metal to metallic. Met is loud in metal, but tal is loud in metallic, and the e went soft. In the other three pairs the loud chunk never moved." },
      interaction: { type: "choose", options: [{ id: "metal-to-metallic", label: "metal to metallic" }, { id: "melt-to-melted", label: "melt to melted" }, { id: "glass-to-glassy", label: "glass to glassy" }, { id: "sharp-to-sharpen", label: "sharp to sharpen" }], correctId: "metal-to-metallic", coachWrong: "Say both words in that pair. Is the same chunk loud both times? If it is, the loud chunk did not move." },
    },
    {
      id: "h-3-sort-loud-chunk",
      band: "harder",
      difficulty: 3,
      prompt: "Sort it: Loud Chunk Moves, or Loud Chunk Stays?",
      narration: { audio: `${Q}/h-3-sort-loud-chunk.mp3`, script: "Six pairs are on your screen. Say both words in each pair out loud and feel where the loud chunk sits. If the ending pulls the loud chunk to a new place, drag the pair to Loud Chunk Moves. If the same chunk stays loud, drag it to the other bucket, Loud Chunk Stays." },
      hint: { audio: `${Q}/h-3-sort-loud-chunk-hint.mp3`, script: "Push on the loud chunk of the short word, then say the long word. Did the push move to a different chunk?" },
      explain: { audio: `${Q}/h-3-sort-loud-chunk-explain.mp3`, script: "Harmony to harmonic, origin to original, and athlete to athletic each move the loud chunk one step later. Quiet to quietly, cool to cooler, and bright to brightness keep the same loud chunk." },
      interaction: { type: "sort", buckets: ["Loud Chunk Moves","Loud Chunk Stays"], bucketAudio: { "Loud Chunk Moves": `${Q}/b-loud-chunk-moves.mp3`, "Loud Chunk Stays": `${Q}/b-loud-chunk-stays.mp3` }, items: [{ label: "harmony to harmonic", bucket: "Loud Chunk Moves" }, { label: "quiet to quietly", bucket: "Loud Chunk Stays" }, { label: "origin to original", bucket: "Loud Chunk Moves" }, { label: "cool to cooler", bucket: "Loud Chunk Stays" }, { label: "athlete to athletic", bucket: "Loud Chunk Moves" }, { label: "bright to brightness", bucket: "Loud Chunk Stays" }], coachWrong: "Say both words and push on the loud chunk each time. If the push lands on a different chunk, it moved." },
    },
    {
      id: "h-4-speak-read-moved-words",
      band: "harder",
      difficulty: 4,
      prompt: "Read it: The historical goblet on the pedestal kept its original metallic shine.",
      narration: { audio: `${Q}/h-4-speak-read-moved-words.mp3`, script: "Last one, out loud, with three words whose loud chunk moved. Tap the mic, then read the whole sentence on your screen at a talking pace. Put the loud chunk in its new place on each long word, and keep the sentence moving." },
      hint: { audio: `${Q}/h-4-speak-read-moved-words-hint.mp3`, script: "The mic sits under the sentence. On each long word, push on the chunk that the ending made loud." },
      explain: { audio: `${Q}/h-4-speak-read-moved-words-explain.mp3`, script: "The sentence says that the historical goblet on the pedestal kept its original metallic shine, with tor, rig, and tal as the loud chunks." },
      interaction: { type: "speak", text: "historical original metallic goblet pedestal shine kept" },
    },
  ],
};
