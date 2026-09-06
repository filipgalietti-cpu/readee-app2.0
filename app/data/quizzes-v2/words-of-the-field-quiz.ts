import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Words of the Field QUIZ (RI.4.4) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second
// informational text, "The Tower That Breathes" (termite mounds; every fact
// true: mounds of hardened soil on the grasslands of Africa and Australia that
// rise taller than a grown man, built crumb by crumb by termites, one family
// from one queen who may lay thousands of eggs a day, blind workers that build
// and gather, soldiers with jaws too large for other work, grass and dead wood
// chewed into paste and spread on combs where a fungus is grown and eaten,
// a fungus garden that dies in hot or stale air, chimneys that hold a large
// volume of air, air circulating in a slow loop with warm stale air out the
// top and fresh air in through the walls, nest warmth within a few degrees
// day and night, workers sealing and opening tunnels around the clock, an
// office building in a hot city cooled the way a mound is on a fraction of
// its neighbors' power), 16 sentences over 5 pages under three spoken
// headings (A Tower on the Grass / One Family, One Queen / The Tower
// Breathes), spoken page by page INSIDE the questions with the instruction
// first and the page last; two sentences are the child's on-screen read-
// alouds and are NEVER narrated anywhere (page two's blind workers sentence
// in e-4, the last sentence in h-3). PLANTED field words with support: mound
// (definition after a comma), fungus (example: mold on bread, mushrooms in a
// lawn), combs (the picture, its label spoken by the sentence), chimneys
// (definition after a comma). PLANTED everywhere words, none explained:
// method, circulate, maintain, volume, degree. Bands: easier (G3-bridge at 3
// options: the comma definition with the picture as evidence, the example
// support, the plain version of a school word, a one-sentence read-aloud) /
// core (on-grade G4: which kind x2, where the support lives with the cutaway
// picture, a six-item Field Word / Everywhere Word sort with b-* bucket
// clips, BEST evidence for what circulate means among four true fragments,
// a production speak using maintain or method in a new sentence) / harder
// (G5 transfer, RI.5.4 a word whose meaning SHIFTS between subjects: taught
// in h-1 on volume in this text vs volume in music, applied to a music
// sentence; h-2 applied to degree in this text vs degree in a sports
// sentence; h-3 last-sentence read-aloud; h-4 production speak of both
// meanings of volume). Nothing from the lesson text (the ear) is reused;
// colony was found carried by the prairie dog and bee lessons and is not
// used. Topic grep-swept vs lessons-v2 + quizzes-v2: termite, mound as a
// built tower, fungus, chimney, circulate, maintain, method, volume, degree
// 0 hits in child-facing strings. Quiz support images live in the lesson's
// image dir (quiz- keys), no digits, no real person named.

const Q = "/audio/quizzes-v2/words-of-the-field-quiz";
const IMG = (w: string) => `/images/lessons-v2/words-of-the-field/${w.toLowerCase()}.png`;

export const wordsOfTheFieldQuiz: QuizDef = {
  id: "words-of-the-field-quiz",
  lessonId: "words-of-the-field",
  title: "Words of the Field Quiz",
  standard: "RI.4.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-mound-comma-definition",
      band: "easier",
      difficulty: 1,
      prompt: "What is a mound?",
      image: IMG("quiz-mound"),
      narration: { audio: `${Q}/e-1-mound-comma-definition.mp3`, script: "Here is page one of a new text called The Tower That Breathes, under its first heading, A Tower on the Grass. The writer uses a field word and then explains it right after a comma. Listen for the word mound and the words that come after it, and then tap what a mound is. On the dry grasslands of Africa and Australia, a traveler sometimes comes upon a mound, a tower of hardened soil that can rise taller than a grown man, with nobody in sight who could have built it. The builders are termites, insects no bigger than an ant, and their method is simple, since each one carries a crumb of wet soil in its jaws, presses it into place, and goes back for another. Millions of crumbs later, the tower stands, and it keeps growing for as long as the family inside it lives." },
      hint: { audio: `${Q}/e-1-mound-comma-definition-hint.mp3`, script: "The words right after the comma tell you what a mound is, and the picture shows one standing on the grass." },
      explain: { audio: `${Q}/e-1-mound-comma-definition-explain.mp3`, script: "The writer says a mound, a tower of hardened soil. A tower of hard soil is the answer, and the picture shows it beside the tree." },
      interaction: { type: "choose", options: [{ id: "a-tower-of-hard-soil", label: "a tower of hard soil" }, { id: "a-kind-of-tree", label: "a kind of tree" }, { id: "a-deep-hole-in-the-ground", label: "a deep hole in the ground" }], correctId: "a-tower-of-hard-soil", coachWrong: "Look at the picture, and listen again for the words after the comma. Is the thing on the grass a tree, a hole, or a tower?" },
    },
    {
      id: "e-2-fungus-by-example",
      band: "easier",
      difficulty: 2,
      prompt: "What is a fungus like?",
      narration: { audio: `${Q}/e-2-fungus-by-example.mp3`, script: "Page three of The Tower That Breathes. This time the writer explains a field word with examples, using the words such as. Listen for the word fungus and the examples that follow it, and then tap what a fungus is like. The workers do not eat the grass and dead wood they carry home. Instead they chew it into a paste and spread it on combs, and on those combs they grow a fungus, such as the mold that grows on old bread or the mushrooms that spring up in a lawn. In the picture, the gray spongy blocks low in the mound are the combs, and the fungus that grows on them is what the whole family eats." },
      hint: { audio: `${Q}/e-2-fungus-by-example-hint.mp3`, script: "The words such as introduce the examples. Listen for the two things the writer names right after them." },
      explain: { audio: `${Q}/e-2-fungus-by-example-explain.mp3`, script: "The writer says a fungus, such as the mold on old bread or the mushrooms in a lawn. Mold or a mushroom is the answer." },
      interaction: { type: "choose", options: [{ id: "mold-or-a-mushroom", label: "mold or a mushroom" }, { id: "grass-or-dead-wood", label: "grass or dead wood" }, { id: "a-crumb-of-wet-soil", label: "a crumb of wet soil" }], correctId: "mold-or-a-mushroom", coachWrong: "Those words are on the page, but they are not the examples after such as. Listen for what comes right after such as." },
    },
    {
      id: "e-3-method-plain-version",
      band: "easier",
      difficulty: 3,
      prompt: "Their method is simple. What is the plain version of method?",
      narration: { audio: `${Q}/e-3-method-plain-version.mp3`, script: "Third grade readers swap a hard school word for a plain one, and fourth grade readers still do it. Page one says the termites have a method, and the writer never explains that word, because it turns up in every subject. Three plain versions are on your screen, so test each one in the sentence and tap the one that fits. Here is the sentence again. The builders are termites, insects no bigger than an ant, and their method is simple, since each one carries a crumb of wet soil in its jaws, presses it into place, and goes back for another." },
      hint: { audio: `${Q}/e-3-method-plain-version-hint.mp3`, script: "The rest of the sentence tells you what the termites do, step by step. What do you call the steps somebody follows to get a thing done?" },
      explain: { audio: `${Q}/e-3-method-plain-version-explain.mp3`, script: "A method is a way of doing something. Their way of doing it is simple, carry a crumb, press it in, go back. A way of doing something is the answer." },
      interaction: { type: "choose", options: [{ id: "a-way-of-doing-something", label: "a way of doing something" }, { id: "a-kind-of-food", label: "a kind of food" }, { id: "a-loud-warning-sound", label: "a loud warning sound" }], correctId: "a-way-of-doing-something", coachWrong: "Put your choice into the sentence. Their food is simple? Their warning sound is simple? Find the one that fits what the termites do." },
    },
    {
      id: "e-4-speak-read-the-workers",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: The workers, which are blind, do all the building, all the repairs, and all the gathering of food.",
      narration: { audio: `${Q}/e-4-speak-read-the-workers.mp3`, script: "The sentence on your screen comes from page two of the text, and it is one sentence with three commas. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/e-4-speak-read-the-workers-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words The workers." },
      explain: { audio: `${Q}/e-4-speak-read-the-workers-explain.mp3`, script: "The sentence tells you that the workers cannot see, and that they still do every bit of the building and the food gathering." },
      interaction: { type: "speak", text: "The workers which are blind do all the building all the repairs and all the gathering of food" },
    },
    {
      id: "c-1-kind-of-fungus",
      band: "core",
      difficulty: 1,
      prompt: "Page three used the word fungus. Which kind of word is it?",
      narration: { audio: `${Q}/c-1-kind-of-fungus.mp3`, script: "Fourth grade readers sort a hard word by its kind before they solve it. A field word belongs to one field of study, and an everywhere word travels into every subject. Page three used the word fungus, so ask where that word lives and tap its kind. Here is page three. The workers do not eat the grass and dead wood they carry home. Instead they chew it into a paste and spread it on combs, and on those combs they grow a fungus, such as the mold that grows on old bread or the mushrooms that spring up in a lawn. In the picture, the gray spongy blocks low in the mound are the combs, and the fungus that grows on them is what the whole family eats." },
      hint: { audio: `${Q}/c-1-kind-of-fungus-hint.mp3`, script: "Ask which subjects would ever use the word fungus. A math book, a history book, or a book about living things?" },
      explain: { audio: `${Q}/c-1-kind-of-fungus-explain.mp3`, script: "Fungus belongs to the field of living things, and the writer stopped to give examples for it, which is what writers do for field words. A field word is the answer." },
      interaction: { type: "choose", options: [{ id: "a-field-word", label: "a field word" }, { id: "an-everywhere-word", label: "an everywhere word" }, { id: "the-name-of-a-person", label: "the name of a person" }, { id: "a-rhyming-word", label: "a rhyming word" }], correctId: "a-field-word", coachWrong: "Notice that the writer stopped to give examples for this word. Which kind of word gets that kind of help?" },
    },
    {
      id: "c-2-kind-of-maintain",
      band: "core",
      difficulty: 2,
      prompt: "Page five used the word maintain. Which kind of word is it?",
      narration: { audio: `${Q}/c-2-kind-of-maintain.mp3`, script: "Sort another word by its kind. Page five used the word maintain, and the writer did not stop to explain it. Ask where that word lives, in one field of study, in every subject, or somewhere else, and tap its kind. Here is page five. The workers maintain the tower every hour of every day, sealing a tunnel here and opening one there, so that the loop of air never stops. People have studied this design so closely that an office building in a hot city was built to cool itself the way a mound does, and it uses only a fraction of the power its neighbors burn to stay cool." },
      hint: { audio: `${Q}/c-2-kind-of-maintain-hint.mp3`, script: "Think of other places you could meet maintain. A person maintains a bike, a friendship, a garden, a grade. Does the word stay in one field?" },
      explain: { audio: `${Q}/c-2-kind-of-maintain-explain.mp3`, script: "Maintain turns up in every subject, and no writer stops to explain it, so it is an everywhere word. The plain version is keep up, and it fits, the workers keep up the tower every hour." },
      interaction: { type: "choose", options: [{ id: "a-field-word", label: "a field word" }, { id: "an-everywhere-word", label: "an everywhere word" }, { id: "the-name-of-a-person", label: "the name of a person" }, { id: "a-rhyming-word", label: "a rhyming word" }], correctId: "an-everywhere-word", coachWrong: "Would only a termite expert ever say maintain, or could a coach, a gardener, or a math teacher say it too?" },
    },
    {
      id: "c-3-where-combs-is-supported",
      band: "core",
      difficulty: 3,
      prompt: "Where does the text support the word combs? Tap the support.",
      image: IMG("quiz-mound-cutaway"),
      narration: { audio: `${Q}/c-3-where-combs-is-supported.mp3`, script: "A field word sends you to the support the writer gives, and this writer gives it with the picture on your screen. Four pieces of page three are on your screen, and all four are really on the page. One of them is the support for combs, the part that tells you what the combs are. Another only uses the word, another supports a different word, and another has nothing to do with it, so tap the support for combs. Here is page three. The workers do not eat the grass and dead wood they carry home. Instead they chew it into a paste and spread it on combs, and on those combs they grow a fungus, such as the mold that grows on old bread or the mushrooms that spring up in a lawn. In the picture, the gray spongy blocks low in the mound are the combs, and the fungus that grows on them is what the whole family eats." },
      hint: { audio: `${Q}/c-3-where-combs-is-supported-hint.mp3`, script: "The support for combs points at the picture. Which piece names something you can see low in the mound?" },
      explain: { audio: `${Q}/c-3-where-combs-is-supported-explain.mp3`, script: "The support is, the gray blocks in the picture. The writer says the gray spongy blocks low in the mound are the combs, so the picture does the explaining. Mold on old bread supports fungus, not combs." },
      interaction: { type: "choose", options: [{ id: "gray-blocks-in-the-picture", label: "gray blocks in the picture" }, { id: "spread-it-on-combs", label: "spread it on combs" }, { id: "the-mold-on-old-bread", label: "the mold on old bread" }, { id: "the-grass-and-dead-wood", label: "the grass and dead wood" }], correctId: "gray-blocks-in-the-picture", coachWrong: "That piece is on the page, but does it tell you what a comb is? Find the piece that points at the picture." },
    },
    {
      id: "c-4-sort-two-kinds",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Field Word, or Everywhere Word?",
      narration: { audio: `${Q}/c-4-sort-two-kinds.mp3`, script: "Six hard words from The Tower That Breathes are on your screen. If a word belongs to the field of termites and living things, and the writer helped you with it, drag it to Field Word. If the word could show up in any subject, and you would swap in a plain version you know, drag it to the other bucket, Everywhere Word. Here are the pages the words come from. On the dry grasslands of Africa and Australia, a traveler sometimes comes upon a mound, a tower of hardened soil that can rise taller than a grown man. The builders are termites, insects no bigger than an ant, and their method is simple. On the combs they grow a fungus, such as the mold that grows on old bread. That air must circulate through the nest, moving in a slow loop. The workers maintain the tower every hour of every day." },
      hint: { audio: `${Q}/c-4-sort-two-kinds-hint.mp3`, script: "One word at a time, ask which subjects would use it. Only a text about termites and living things, or any book at all?" },
      explain: { audio: `${Q}/c-4-sort-two-kinds-explain.mp3`, script: "The field words are mound, termites, and fungus, and the writer explained each one. The everywhere words are method, circulate, and maintain, and nobody stopped to explain them." },
      interaction: { type: "sort", buckets: ["Field Word","Everywhere Word"], bucketAudio: { "Field Word": `${Q}/b-field-word.mp3`, "Everywhere Word": `${Q}/b-everywhere-word.mp3` }, items: [{ label: "mound", bucket: "Field Word" }, { label: "method", bucket: "Everywhere Word" }, { label: "termites", bucket: "Field Word" }, { label: "circulate", bucket: "Everywhere Word" }, { label: "fungus", bucket: "Field Word" }, { label: "maintain", bucket: "Everywhere Word" }], coachWrong: "Ask which subjects would use that word. Only a text about termites, or any book at all? And did the writer stop to explain it?" },
    },
    {
      id: "c-5-best-evidence-circulate",
      band: "core",
      difficulty: 5,
      prompt: "Which words in the sentence show what circulate means?",
      narration: { audio: `${Q}/c-5-best-evidence-circulate.mp3`, script: "Page four used the word circulate, and nobody explained it, because it is an everywhere word. But the sentence around it shows its meaning if you look. Four pieces of that sentence are on your screen, and all four are really there. Only one of them shows what circulate means, so tap that one. Here is the sentence. That air must circulate through the nest, moving in a slow loop, so warm stale air climbs up the chimneys and out while fresh air seeps in through the walls." },
      hint: { audio: `${Q}/c-5-best-evidence-circulate-hint.mp3`, script: "Circulate is about how the air moves. Which piece describes the shape of that movement?" },
      explain: { audio: `${Q}/c-5-best-evidence-circulate-explain.mp3`, script: "The words that show it are, moving in a slow loop. To circulate is to move around in a loop, which is what the stale air going out and the fresh air coming in add up to. Warm stale air, up the chimneys, and through the walls are true pieces, but each names a thing or a place, not the movement." },
      interaction: { type: "choose", options: [{ id: "moving-in-a-slow-loop", label: "moving in a slow loop" }, { id: "warm-stale-air", label: "warm stale air" }, { id: "up-the-chimneys", label: "up the chimneys" }, { id: "through-the-walls", label: "through the walls" }], correctId: "moving-in-a-slow-loop", coachWrong: "Those words are in the sentence, but they name a thing or a place. Which words tell you how the air moves?" },
    },
    {
      id: "c-6-speak-new-sentence",
      band: "core",
      difficulty: 6,
      prompt: "Use maintain or method in a new sentence about anything else. Then say what it means.",
      narration: { audio: `${Q}/c-6-speak-new-sentence.mp3`, script: "Everywhere words are worth keeping, because you will meet them again in another subject. Tap the mic. Use maintain or method in a brand new sentence about anything but termites, and then say in plain words what the word means." },
      hint: { audio: `${Q}/c-6-speak-new-sentence-hint.mp3`, script: "Pick one of the two words, put it in a sentence about a bike, a game, or a pet, and then tell the plain version." },
      explain: { audio: `${Q}/c-6-speak-new-sentence-explain.mp3`, script: "One way to say it goes like this. I maintain the bike by oiling the chain, and maintain means keep it in good shape. Or, the best method for a spelling test is to practice each night, and method means a way of doing something." },
      interaction: { type: "speak", text: "maintain maintains maintained maintaining keep keeps kept keeping care shape good method methods way ways plan plans step steps how done" },
    },
    {
      id: "h-1-volume-shift-taught",
      band: "harder",
      difficulty: 1,
      prompt: "In the music sentence, what does volume mean?",
      narration: { audio: `${Q}/h-1-volume-shift-taught.mp3`, script: "Here is a fifth grade move. Some everywhere words shift their meaning when they cross from one subject into another, and the subject tells you which meaning to use. Watch me with the word volume. Page four says the chimneys hold a large volume of air. In a science text, volume means how much space something fills, so a large volume of air means a lot of air. In music class, the same word means how loud a sound is, so turning up the volume makes the sound louder. Same word, two subjects, two meanings. Now your turn with a sentence from a music book. Four meanings are on your screen, and only one of them is what volume means in this sentence. The band turned the volume up until the windows shook." },
      hint: { audio: `${Q}/h-1-volume-shift-taught-hint.mp3`, script: "The sentence is about a band playing, so ask which subject you are in, and then which meaning of volume belongs to that subject." },
      explain: { audio: `${Q}/h-1-volume-shift-taught-explain.mp3`, script: "In the music sentence, volume means how loud a sound is. The band turned it up until the windows shook, so this is the loudness meaning, not the space meaning from the termite text." },
      interaction: { type: "choose", options: [{ id: "how-loud-a-sound-is", label: "how loud a sound is" }, { id: "how-much-space-it-fills", label: "how much space it fills" }, { id: "one-book-in-a-set", label: "one book in a set" }, { id: "a-tower-of-hard-soil", label: "a tower of hard soil" }], correctId: "how-loud-a-sound-is", coachWrong: "That is a real meaning of volume, but is it the one a band would use? Ask which subject the sentence belongs to." },
    },
    {
      id: "h-2-degree-shift-applied",
      band: "harder",
      difficulty: 2,
      prompt: "In the sports sentence, what does degree mean?",
      narration: { audio: `${Q}/h-2-degree-shift-applied.mp3`, script: "The same move on a new word. Page four says the warmth deep in the nest stays within a few degrees of the same level. In a science text, a degree is one step of warmth or cold on a thermometer. Now here is a sentence from a sports book, where the word shifts. The gymnast showed a high degree of skill on the beam. Four meanings are on your screen, and only one of them is what degree means in the sports sentence, so tap it." },
      hint: { audio: `${Q}/h-2-degree-shift-applied-hint.mp3`, script: "A gymnast on a beam is not being measured with a thermometer. Ask what a high degree of skill is a lot of." },
      explain: { audio: `${Q}/h-2-degree-shift-applied-explain.mp3`, script: "In the sports sentence, degree means an amount or a level. A high degree of skill is a high level of skill. The thermometer meaning belongs to the science text, and the word shifted when it crossed into sports." },
      interaction: { type: "choose", options: [{ id: "an-amount-or-a-level", label: "an amount or a level" }, { id: "a-step-of-warmth-or-cold", label: "a step of warmth or cold" }, { id: "a-paper-from-a-college", label: "a paper from a college" }, { id: "a-loop-of-moving-air", label: "a loop of moving air" }], correctId: "an-amount-or-a-level", coachWrong: "That is a meaning of degree somewhere, but test it in the sentence. A high paper of skill? A high step of warmth of skill? Find the one that fits a gymnast." },
    },
    {
      id: "h-3-speak-read-the-ending",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: A tower that breathes, it turns out, was an insect idea first.",
      narration: { audio: `${Q}/h-3-speak-read-the-ending.mp3`, script: "The last sentence of the text is on your screen, and it ends the whole piece. Tap the mic. Read the sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/h-3-speak-read-the-ending-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words A tower that breathes." },
      explain: { audio: `${Q}/h-3-speak-read-the-ending-explain.mp3`, script: "The sentence says that the idea of a building that cools itself with moving air belonged to termites long before people copied it." },
      interaction: { type: "speak", text: "A tower that breathes it turns out was an insect idea first" },
    },
    {
      id: "h-4-speak-both-meanings-volume",
      band: "harder",
      difficulty: 4,
      prompt: "Say what volume means in this text, and what it means in music class.",
      narration: { audio: `${Q}/h-4-speak-both-meanings-volume.mp3`, script: "Last one, out loud, and it takes both meanings. Tap the mic. Say what volume means in the termite text, where the chimneys hold a large volume of air, and then say what the same word means in music class." },
      hint: { audio: `${Q}/h-4-speak-both-meanings-volume-hint.mp3`, script: "One meaning is about how much room the air takes up, and the other is about sound. Say one, then the other." },
      explain: { audio: `${Q}/h-4-speak-both-meanings-volume-explain.mp3`, script: "One way to say it goes like this. In the termite text, volume means how much space the air fills, and in music class, volume means how loud the sound is." },
      interaction: { type: "speak", text: "space room amount fills filled full air lot quantity size big loud louder loudness sound sounds quiet soft noise music turn up down" },
    },
  ],
};
