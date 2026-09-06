import type { QuizDef } from "@/lib/lesson-engine/quiz";

// The Right Tool QUIZ (L.4.4) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second text, "The
// Recipe Book" (Tova, ten, at Aunt Gerda's bakery before dawn: the first
// loaves come out scorched; the invaluable handwritten recipe book; the dough
// rises over the rim; unsalted butter; loaves scored with a razor and slid in
// on the long wooden peel; a spoonful of malt in warm milk; a restive line at
// the door; the malformed loaves go to the birds; jam injected into each bun;
// the dejected apprentice finally smiles; Aunt Gerda's impassive face; one
// pencil line under her grandmother's ink). Every fact true (bakers score
// loaves with a razor before baking, a peel is the long wooden shovel for
// loaves, malt is a sweet brown powder stirred into milk, salt slows a rise,
// jam goes into buns through a metal tube). The text is spoken sentence by
// sentence INSIDE the questions, teaching first and the sentence last; two
// sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere (the opening sentence in e-4, the last sentence in h-3). Bands:
// easier (G3-bridge, one tool per word at 3 options, two pictures that ARE
// the evidence, one-sentence read) / core (on-grade G4: which tool fits
// malformed, meaning by the parts for injected, the malt false friend, the
// two-sense glossary entry for peel, the words that CONFIRM sense two, a
// production speak on dejected with a full accept list) / harder (G5 L.5.4
// transfer TAUGHT in the stimulus: when the parts and the sentence DISAGREE
// the sentence wins, modeled on invaluable then applied to restive; a
// three-sense entry where every sense is tested, modeled on sift then
// applied to score (no respelling, no guide words: L.4.4c owns those in U2); the last sentence read aloud; a closing production
// speak on impassive that names which won). Nothing from the lesson story
// (Britta, Mr. Kowalski, the clock, chron / ject / mal target words) is
// reused. FRESHNESS grep-swept vs lessons-v2 + quizzes-v2: Tova, Gerda,
// recipe book, scorched, unsalted, malt, invaluable, restive, malformed,
// injected, dejected, impassive, sift, razor, peel-as-a-target, score-as-a-
// target all 0 hits (kneaded found burned as a G2 target and avoided; bakery
// and rose are incidental prose elsewhere). No sort in this quiz (the lesson
// carries one), so no b-* bucket clips. Tiles lowercase, audio-free, kebab
// ids, 28-char cap. Quiz support images live in the lesson's image dir.

const Q = "/audio/quizzes-v2/the-right-tool-quiz";
const IMG = (w: string) => `/images/lessons-v2/the-right-tool/${w.toLowerCase()}.png`;

export const theRightToolQuiz: QuizDef = {
  id: "the-right-tool-quiz",
  lessonId: "the-right-tool",
  title: "The Right Tool Quiz",
  standard: "L.4.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-scorched-loaves",
      band: "easier",
      difficulty: 1,
      prompt: "What does scorched mean?",
      image: IMG("quiz-scorched-loaves"),
      narration: { audio: `${Q}/e-1-scorched-loaves.mp3`, script: "Here is a new story about a bakery, and the picture shows its first tray of bread. Read around the word scorched, and tap what it means after you hear the sentence. The first loaves of the morning had come out scorched, black along the bottom and bitter to taste, because the oven had run too hot." },
      hint: { audio: `${Q}/e-1-scorched-loaves-hint.mp3`, script: "The words right after scorched describe the bottom of the loaves, and the picture shows it too." },
      explain: { audio: `${Q}/e-1-scorched-loaves-explain.mp3`, script: "Scorched means burned dark by too much heat. The clue tells it straight, black along the bottom, because the oven had run too hot." },
      interaction: { type: "choose", options: [{ id: "burned-dark-by-too-much-heat", label: "burned dark by too much heat" }, { id: "still-raw-in-the-middle", label: "still raw in the middle" }, { id: "cooled-on-a-wire-rack", label: "cooled on a wire rack" }], correctId: "burned-dark-by-too-much-heat", coachWrong: "Look at the bottom of the loaves in the picture, and listen for what the oven had done." },
    },
    {
      id: "e-2-unsalted-butter",
      band: "easier",
      difficulty: 2,
      prompt: "What does unsalted mean?",
      narration: { audio: `${Q}/e-2-unsalted-butter.mp3`, script: "Page two of the story, and one word in it comes apart into a part you know and a word you know. Take the word unsalted apart, and tap what it means after you hear the sentence. Tova mixed the second batch with unsalted butter, since the book said salt would slow the rising." },
      hint: { audio: `${Q}/e-2-unsalted-butter-hint.mp3`, script: "The part on the front of unsalted flips the word, the way it flips unhappy." },
      explain: { audio: `${Q}/e-2-unsalted-butter-explain.mp3`, script: "Unsalted means butter with no salt in it. Un flips salted, and the book wanted less salt because salt would slow the rising." },
      interaction: { type: "choose", options: [{ id: "butter-with-no-salt-in-it", label: "butter with no salt in it" }, { id: "butter-with-extra-salt", label: "butter with extra salt" }, { id: "butter-melted-in-a-pan", label: "butter melted in a pan" }], correctId: "butter-with-no-salt-in-it", coachWrong: "The part on the front of unsalted flips it. Would the book ask for more salt if salt slowed the rising?" },
    },
    {
      id: "e-3-dough-rose",
      band: "easier",
      difficulty: 3,
      prompt: "Which meaning of rose does the sentence pick?",
      image: IMG("quiz-dough-risen"),
      narration: { audio: `${Q}/e-3-dough-rose.mp3`, script: "The word rose is one you know, and the picture shows what happened in the bowl. When the meaning you know does not fit, the sentence picks the meaning. Test each meaning, and tap the one the sentence picks after you hear it. Tova read the page twice, and she watched the bowl until the dough rose over the rim like a pale moon." },
      hint: { audio: `${Q}/e-3-dough-rose-hint.mp3`, script: "A flower could not do what the dough did in that bowl. Look at how high the dough sits in the picture." },
      explain: { audio: `${Q}/e-3-dough-rose-explain.mp3`, script: "Rose means grew bigger and higher. The dough went up over the rim of the bowl, so the sentence picks that meaning, not the flower." },
      interaction: { type: "choose", options: [{ id: "grew-bigger-and-higher", label: "grew bigger and higher" }, { id: "a-flower-with-thorns", label: "a flower with thorns" }, { id: "turned-a-pink-color", label: "turned a pink color" }], correctId: "grew-bigger-and-higher", coachWrong: "Test that meaning in the sentence. Could the dough do that over the rim of a bowl?" },
    },
    {
      id: "e-4-speak-read-page-one",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Before the sun was up, Tova stood in the back of Aunt Gerda's bakery with flour to her elbows, and the ovens were already roaring.",
      narration: { audio: `${Q}/e-4-speak-read-page-one.mp3`, script: "The sentence on your screen opens the story, and it is one long sentence. Tap the mic, then read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/e-4-speak-read-page-one-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Before the sun." },
      explain: { audio: `${Q}/e-4-speak-read-page-one-explain.mp3`, script: "The sentence tells you that Tova was at work in the back of the bakery before sunrise, covered in flour, with the ovens already hot." },
      interaction: { type: "speak", text: "Before the sun was up Tova stood in the back of Aunt Gerda's bakery with flour to her elbows and the ovens were already roaring" },
    },
    {
      id: "c-1-which-tool-malformed",
      band: "core",
      difficulty: 1,
      prompt: "Which tool fits malformed?",
      narration: { audio: `${Q}/c-1-which-tool-malformed.mp3`, script: "Here is page four of the story, and a word in it stops you. Look at the word malformed before you touch the sentence, and ask what is inside it. Tap the tool that fits malformed after you hear the sentence. The malformed loaves from the first batch, lumpy and lopsided, went into a basket for the birds." },
      hint: { audio: `${Q}/c-1-which-tool-malformed-hint.mp3`, script: "The front of malformed carries a part you learned this week, and it sits on a word you already know." },
      explain: { audio: `${Q}/c-1-which-tool-malformed-explain.mp3`, script: "The tool that fits is take it apart. Mal means bad, and formed is a word you know, so malformed loaves are badly formed, lumpy and lopsided, and the sentence proves it." },
      interaction: { type: "choose", options: [{ id: "take-it-apart", label: "take it apart" }, { id: "read-around-it", label: "read around it" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }, { id: "check-the-glossary", label: "check the glossary" }], correctId: "take-it-apart", coachWrong: "Look at malformed again, from the front. Is there an old part you learned, sitting on a word you know? If yes, which tool uses parts?" },
    },
    {
      id: "c-2-injected-meaning",
      band: "core",
      difficulty: 2,
      prompt: "What does injected mean here?",
      narration: { audio: `${Q}/c-2-injected-meaning.mp3`, script: "The word injected comes apart too. The front part, in, means in, and ject means throw. Put the parts together, then test what you get in the sentence, and tap the meaning that passes the test. Here is the sentence. Then the jam was injected into each bun through a thin metal tube, one squeeze apiece." },
      hint: { audio: `${Q}/c-2-injected-meaning-hint.mp3`, script: "The two parts add up to a throw, and the sentence gives you a thin metal tube and one squeeze apiece." },
      explain: { audio: `${Q}/c-2-injected-meaning-explain.mp3`, script: "Injected means pushed in through a tube. In plus throw makes thrown in, and the thin metal tube with one squeeze apiece confirms it." },
      interaction: { type: "choose", options: [{ id: "pushed-in-through-a-tube", label: "pushed in through a tube" }, { id: "pulled-out-with-a-spoon", label: "pulled out with a spoon" }, { id: "spread-across-the-top", label: "spread across the top" }, { id: "baked-into-the-crust", label: "baked into the crust" }], correctId: "pushed-in-through-a-tube", coachWrong: "Test that meaning in the sentence. Could a thin metal tube and one squeeze do that to jam?" },
    },
    {
      id: "c-3-false-friend-malt",
      band: "core",
      difficulty: 3,
      prompt: "Which tool saves malt?",
      narration: { audio: `${Q}/c-3-false-friend-malt.mp3`, script: "Here is the trap. Malt carries the letters of mal, so the parts tool jumps into your hand, and the sum it gives you is something bad. Test that. A spoonful of something bad stirred into warm milk, sweet and brown? It fails, and a failed test means switch. Four tools are on your screen. Tap the tool that saves malt after you hear the sentence. Tova ate her breakfast standing up, a spoonful of malt stirred into warm milk, sweet and brown." },
      hint: { audio: `${Q}/c-3-false-friend-malt-hint.mp3`, script: "The parts already failed, and malt is not a word you knew before, so the words next to it have to do the work." },
      explain: { audio: `${Q}/c-3-false-friend-malt-explain.mp3`, script: "The tool that saves malt is read around it. The words next to malt, stirred into warm milk, sweet and brown, tell you it is a sweet powder for a drink, and the letters of mal never added up." },
      interaction: { type: "choose", options: [{ id: "read-around-it", label: "read around it" }, { id: "take-it-apart", label: "take it apart" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }, { id: "check-the-glossary", label: "check the glossary" }], correctId: "read-around-it", coachWrong: "The sum from the parts failed the test, and malt is not a word you knew before. Which tool works from the words next to an unknown word?" },
    },
    {
      id: "c-4-glossary-peel",
      band: "core",
      difficulty: 4,
      prompt: "peel. Sense one, the skin of a fruit. Sense two, a long flat wooden shovel for sliding loaves into an oven. Which sense fits?",
      narration: { audio: `${Q}/c-4-glossary-peel.mp3`, script: "The word peel is one you know, the skin of a banana or an orange. Test that meaning in the sentence, and if it does not fit, do not skip it. No part helps, so you check the glossary, and the entry for peel is on your screen with two numbered senses. Read both senses, test each one in the sentence, and tap the sense that fits after you hear the sentence. Aunt Gerda scored each loaf with a razor, three quick cuts across the top, and slid them into the oven on the long wooden peel." },
      hint: { audio: `${Q}/c-4-glossary-peel-hint.mp3`, script: "Each sense has to survive the sentence, so ask what Aunt Gerda did with the peel." },
      explain: { audio: `${Q}/c-4-glossary-peel-explain.mp3`, script: "Sense two fits. A peel is a long flat wooden shovel for loaves, and she slid the loaves into the oven on it, which a fruit skin could never do." },
      interaction: { type: "choose", options: [{ id: "a-flat-wooden-bread-shovel", label: "a flat wooden bread shovel" }, { id: "the-skin-of-an-orange", label: "the skin of an orange" }, { id: "a-sharp-steel-razor", label: "a sharp steel razor" }, { id: "a-loud-ring-of-bells", label: "a loud ring of bells" }], correctId: "a-flat-wooden-bread-shovel", coachWrong: "Test that in the sentence. Would she slide loaves into an oven on it?" },
    },
    {
      id: "c-5-confirming-words-peel",
      band: "core",
      difficulty: 5,
      prompt: "Which words confirm sense two of peel?",
      narration: { audio: `${Q}/c-5-confirming-words-peel.mp3`, script: "Choosing a sense is half the job, and confirming it is the other half. Sense two of peel is a long flat wooden shovel for sliding loaves into an oven. Four pieces of the sentence are on your screen, and all four are really in it. Only one confirms sense two, because it shows the peel doing what sense two says. Tap the words that confirm it after you hear the sentence. Aunt Gerda scored each loaf with a razor, three quick cuts across the top, and slid them into the oven on the long wooden peel." },
      hint: { audio: `${Q}/c-5-confirming-words-peel-hint.mp3`, script: "Three of the pieces are about the razor and the cuts. Find the piece that shows what the peel was used for." },
      explain: { audio: `${Q}/c-5-confirming-words-peel-explain.mp3`, script: "The words that confirm it are, slid them into the oven. That is the peel at work, and the razor and the cuts are about scoring, not the peel." },
      interaction: { type: "choose", options: [{ id: "slid-them-into-the-oven", label: "slid them into the oven" }, { id: "scored-each-loaf", label: "scored each loaf" }, { id: "with-a-razor", label: "with a razor" }, { id: "three-quick-cuts", label: "three quick cuts" }], correctId: "slid-them-into-the-oven", coachWrong: "That piece is true, but it is about the razor and the cuts. Which piece shows the peel doing its job?" },
    },
    {
      id: "c-6-speak-dejected",
      band: "core",
      difficulty: 6,
      prompt: "Say what dejected means, and name the tool you used.",
      narration: { audio: `${Q}/c-6-speak-dejected.mp3`, script: "The whole move comes out loud this time. Dejected stops you on page four, and two roads lead to its meaning. Tap the mic, then say what dejected means in the sentence, and name the tool that got you there. Here is the sentence. When the second tray came out golden, Tova, who had looked dejected all morning, finally smiled." },
      hint: { audio: `${Q}/c-6-speak-dejected-hint.mp3`, script: "The front part, de, means down, and ject is a part you know. The word finally, and the smile at the end, point the same way." },
      explain: { audio: `${Q}/c-6-speak-dejected-explain.mp3`, script: "Dejected means sad, thrown down in spirit. De means down and ject means throw, and the sentence agrees, because she finally smiled only when the good tray came out." },
      interaction: { type: "speak", text: "sad unhappy down gloomy low disappointed miserable glum upset discouraged thrown throw ject de take apart parts part read around sentence clue clues context smiled finally both agree" },
    },
    {
      id: "h-1-parts-vs-sentence-taught",
      band: "harder",
      difficulty: 1,
      prompt: "What does restive mean, and which wins?",
      narration: { audio: `${Q}/h-1-parts-vs-sentence-taught.mp3`, script: "Here is a fifth grade move. Sometimes the parts and the sentence disagree, and you decide which one wins. Watch me with invaluable. The parts say in, not, and valuable, so not valuable, worthless. The sentence says the book was worth more to Aunt Gerda than everything else in the shop. They disagree, and the sentence wins, because the test in the sentence is the judge and the parts only make a guess. Invaluable means so valuable that no price fits. Your turn with restive, and the parts say rest. Test that against the sentence, and tap what restive means. The line outside was restive, shifting from foot to foot and tapping on the glass, because the shop had opened late." },
      hint: { audio: `${Q}/h-1-parts-vs-sentence-taught-hint.mp3`, script: "The parts point to rest. The sentence shows feet shifting and fingers tapping. When they disagree, the sentence wins." },
      explain: { audio: `${Q}/h-1-parts-vs-sentence-taught-explain.mp3`, script: "Restive means unable to keep still. The parts said rest, the sentence showed shifting feet and tapping, and the sentence wins every time the two disagree." },
      interaction: { type: "choose", options: [{ id: "unable-to-keep-still", label: "unable to keep still" }, { id: "resting-after-a-long-day", label: "resting after a long day" }, { id: "very-well-rested", label: "very well rested" }, { id: "quiet-and-calm", label: "quiet and calm" }], correctId: "unable-to-keep-still", coachWrong: "Test the parts against the sentence. Would a resting line shift from foot to foot and tap on the glass?" },
    },
    {
      id: "h-2-full-entry-score",
      band: "harder",
      difficulty: 2,
      prompt: "score. Sense one, the points in a game. Sense two, a group of twenty. Sense three, to cut shallow lines into the top of a loaf before it bakes. Which sense fits?",
      narration: { audio: `${Q}/h-2-full-entry-score.mp3`, script: "Another fifth grade move. An entry can carry three senses or more, and the sense you need can hide at the bottom, so you test every sense, not only the first one that sounds familiar. Watch me with sift. Sense one, to shake flour through a fine mesh. Sense two, to look through many things carefully. The sentence, Tova sifted the flour into the bowl, picks sense one, and I still tested sense two before I chose. Your turn with score, and its entry is on your screen with three senses. Test all three, and tap the one that fits after you hear the sentence. Aunt Gerda scored each loaf with a razor, three quick cuts across the top." },
      hint: { audio: `${Q}/h-2-full-entry-score-hint.mp3`, script: "The first sense that sounds familiar is not always the one that fits. Test all three senses against a razor and three quick cuts." },
      explain: { audio: `${Q}/h-2-full-entry-score-explain.mp3`, script: "Sense three fits. To score a loaf is to cut shallow lines into its top before it bakes, and a razor with three quick cuts is exactly that, while points and twenty both fail the test." },
      interaction: { type: "choose", options: [{ id: "cut-shallow-lines-in-the-top", label: "cut shallow lines in the top" }, { id: "the-points-in-a-game", label: "the points in a game" }, { id: "a-group-of-twenty", label: "a group of twenty" }, { id: "a-slice-all-the-way-through", label: "a slice all the way through" }], correctId: "cut-shallow-lines-in-the-top", coachWrong: "Test that sense against a razor and three quick cuts across the top. Two of the senses have nothing to do with bread, and the cuts never went all the way through." },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Then she wrote one line at the bottom of the page, in pencil, under her grandmother's ink, and the book went back on its shelf a little heavier than before.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the story is on your screen, and it is one long sentence. Tap the mic, then read the whole sentence out loud at a talking pace, rest at each comma, and let the ending land quietly." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Then she wrote." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that Aunt Gerda added a pencil line of her own beneath the old ink, and that the book returned to the shelf holding one more page of history." },
      interaction: { type: "speak", text: "Then she wrote one line at the bottom of the page in pencil under her grandmother's ink and the book went back on its shelf a little heavier than before" },
    },
    {
      id: "h-4-speak-impassive",
      band: "harder",
      difficulty: 4,
      prompt: "Say what impassive means, and say which won, the parts or the sentence.",
      narration: { audio: `${Q}/h-4-speak-impassive.mp3`, script: "Last one, out loud, and the parts and the sentence disagree again. Impassive carries im, which means not, and passive, so the parts make a guess. Tap the mic, then say what impassive means in the sentence, and say which one won, the parts or the sentence, and why. Here is the sentence. Aunt Gerda's face stayed impassive, showing nothing at all, while she broke a loaf open and looked at the inside." },
      hint: { audio: `${Q}/h-4-speak-impassive-hint.mp3`, script: "The words right after impassive tell you what her face was doing, and the sentence wins whenever it disagrees with the parts." },
      explain: { audio: `${Q}/h-4-speak-impassive-explain.mp3`, script: "Impassive means showing no feeling at all. The parts said not passive, which sounds lively, but the sentence said her face showed nothing, and the sentence wins." },
      interaction: { type: "speak", text: "showing nothing feeling feelings blank still calm flat expression unmoved unreadable sentence wins won context around clue clues parts lose lost fail failed judge test disagree" },
    },
  ],
};
