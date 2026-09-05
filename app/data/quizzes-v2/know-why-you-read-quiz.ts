import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Know Why You Read QUIZ (RF.3.4a) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), Claude-judged rebuild. Bands: easier
// (G2-bridge: which-why for a described read at 3 options with picture
// support, a one-sentence purposeful read, the check that matches a why) /
// core (on-grade G3: the why for a situation, a two-step purposeful read, the
// check for a how-to, the four pinwheel steps in order, a Read to Enjoy / Read
// to Find or Follow sort with b-* bucket clips, a find-one-fact production
// speak) / harder (G4 transfer, RF.4.4a-adjacent: ONE why for TWO texts, read
// to compare, MODELED in h-1 on where the wind blows hardest, applied in h-2
// on two cards, the child reads two notes for one thing in h-3, closing
// production speak). ALL-FRESH second world, "The Pinwheel" (Tobin, his older
// cousin Hamid, Grandpa Bernard's farm, the hill, the pear tree): a story, a
// how-to for a paper pinwheel, and a fact page about wind, spoken INSIDE the
// questions where the child listens and shown on screen where the child
// READS; nothing from the lesson (Anya, Ivo, Aunt Wanda, the shadow show) is
// reused, and the narrator never pre-reads a sentence the child reads. Names
// and setting grep-swept vs lessons-v2 + quizzes-v2: Tobin, Hamid, Bernard,
// pinwheel, pear tree all 0-hit. Tiles are audio-free lowercase text. Quiz
// support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/know-why-you-read-quiz";
const IMG = (w: string) => `/images/lessons-v2/know-why-you-read/${w.toLowerCase()}.png`;

export const knowWhyYouReadQuiz: QuizDef = {
  id: "know-why-you-read-quiz",
  lessonId: "know-why-you-read",
  title: "Know Why You Read Quiz",
  standard: "RF.3.4a",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-why-for-a-how-to",
      band: "easier",
      difficulty: 1,
      prompt: "Grandpa Bernard hands Tobin a page of steps for making a pinwheel. What is Tobin's why?",
      image: IMG("quiz-pinwheel-parts"),
      narration: { audio: `${Q}/e-1-why-for-a-how-to.mp3`, script: "Here is a new reader named Tobin. Grandpa Bernard hands him a page that tells how to make a paper pinwheel, one step after another, and the paper, the pin, and the pencil are waiting on the table. Before Tobin reads, he names his why. Tap the why that fits this page." },
      hint: { audio: `${Q}/e-1-why-for-a-how-to-hint.mp3`, script: "The page tells Tobin what to do with the things in the picture, and it tells him in order. Think about which why goes with doing things in order." },
      explain: { audio: `${Q}/e-1-why-for-a-how-to-explain.mp3`, script: "The answer is to follow the steps. A page of steps is a how-to, and a reader reads a how-to in order and does each step." },
      interaction: { type: "choose", options: [{ id: "to-follow-the-steps", label: "to follow the steps" }, { id: "to-enjoy-a-story", label: "to enjoy a story" }, { id: "to-find-one-fact", label: "to find one fact" }], correctId: "to-follow-the-steps", coachWrong: "Look at the picture. The page tells Tobin what to do with those things, in order. Which why fits that?" },
    },
    {
      id: "e-2-why-for-a-story",
      band: "easier",
      difficulty: 2,
      prompt: "Which why fits this story?",
      image: IMG("quiz-pinwheel-hill"),
      narration: { audio: `${Q}/e-2-why-for-a-story.mp3`, script: "Here is the start of a story about Tobin. Tobin carried his new paper pinwheel to the top of the hill behind Grandpa Bernard's house, and the wind grabbed it before he had even lifted his arm. The blades spun so fast that they turned into a blur of blue and orange. A story like this one gets read for one why. Tap it." },
      hint: { audio: `${Q}/e-2-why-for-a-story-hint.mp3`, script: "This page has a boy, a hill, and a wind that grabs things. It does not give steps, and it does not hold one fact you need. Think about why a reader opens a story." },
      explain: { audio: `${Q}/e-2-why-for-a-story-explain.mp3`, script: "The answer is to enjoy the story. A story is read to settle in, picture it, and find out what happens." },
      interaction: { type: "choose", options: [{ id: "to-enjoy-the-story", label: "to enjoy the story" }, { id: "to-follow-the-steps", label: "to follow the steps" }, { id: "to-find-one-fact", label: "to find one fact" }], correctId: "to-enjoy-the-story", coachWrong: "A story has no steps to do and no single fact to hunt. Think about why you open a story at all." },
    },
    {
      id: "e-3-speak-read-pear-tree",
      band: "easier",
      difficulty: 3,
      prompt: "Read it out loud: The pinwheel landed high in the pear tree.",
      image: IMG("quiz-pinwheel-in-tree"),
      narration: { audio: `${Q}/e-3-speak-read-pear-tree.mp3`, script: "One sentence from the story is on your screen, and your why is to enjoy it. Picture it, keep a talking pace, and read the sentence out loud." },
      hint: { audio: `${Q}/e-3-speak-read-pear-tree-hint.mp3`, script: "Your finger can point to each word as you say it. The picture shows exactly what the sentence says." },
      explain: { audio: `${Q}/e-3-speak-read-pear-tree-explain.mp3`, script: "The sentence says that the pinwheel landed high in the pear tree, and a smooth reader rests at the period at the end." },
      interaction: { type: "speak", text: "The pinwheel landed high in the pear tree" },
    },
    {
      id: "e-4-check-for-find",
      band: "easier",
      difficulty: 4,
      prompt: "Tobin read the fact page to find out why a pinwheel spins. Which check matches his why?",
      narration: { audio: `${Q}/e-4-check-for-find.mp3`, script: "Tobin read a fact page about wind with one why, to find out why a pinwheel spins. After the read comes the check, and the check matches his why. Three checks are on your screen. Tap the one that matches his why." },
      hint: { audio: `${Q}/e-4-check-for-find-hint.mp3`, script: "His why was to find one thing. The check asks about that one thing, not about steps and not about what happened." },
      explain: { audio: `${Q}/e-4-check-for-find-explain.mp3`, script: "The answer is, did I find it. When the why is to find one fact, the check asks whether that fact was found." },
      interaction: { type: "choose", options: [{ id: "did-i-find-it", label: "did I find it" }, { id: "can-i-do-the-steps", label: "can I do the steps" }, { id: "can-i-tell-what-happened", label: "can I tell what happened" }], correctId: "did-i-find-it", coachWrong: "That check goes with a different why. Tobin was hunting one fact. Which check asks about one fact?" },
    },
    {
      id: "c-1-why-for-notebook",
      band: "core",
      difficulty: 1,
      prompt: "Hamid needs one number from the farm notebook. What is his why?",
      narration: { audio: `${Q}/c-1-why-for-notebook.mp3`, script: "Tobin's older cousin Hamid wants to know how many pears the tree gave last fall, and Grandpa Bernard hands him the thick farm notebook. Hamid names his why before he opens it. Four whys are on your screen. Tap the one that fits this read." },
      hint: { audio: `${Q}/c-1-why-for-notebook-hint.mp3`, script: "Hamid does not want the whole notebook. He wants one number from it. Think about which why fits a reader who needs one thing." },
      explain: { audio: `${Q}/c-1-why-for-notebook-explain.mp3`, script: "The answer is to find one fact. Hamid needs one number, so he moves quickly through the notebook and slows down at the page about the pears." },
      interaction: { type: "choose", options: [{ id: "to-find-one-fact", label: "to find one fact" }, { id: "to-enjoy-the-story", label: "to enjoy the story" }, { id: "to-follow-the-steps", label: "to follow the steps" }, { id: "to-learn-how-it-works", label: "to learn how it works" }], correctId: "to-find-one-fact", coachWrong: "Think about what Hamid wants from the notebook. Is it the whole thing, or one small piece?" },
    },
    {
      id: "c-2-speak-read-two-steps",
      band: "core",
      difficulty: 2,
      prompt: "Read it: Second, cut from each corner toward the middle, and stop before you reach the dot. Third, fold every other corner point into the middle and hold them there.",
      narration: { audio: `${Q}/c-2-speak-read-two-steps.mp3`, script: "Two steps from the pinwheel how-to are on your screen. Name the why first. It is a how-to, so read the steps in order, skip nothing, and picture your hands doing each one. Read both steps out loud." },
      hint: { audio: `${Q}/c-2-speak-read-two-steps-hint.mp3`, script: "The easy way is to read the first step to the period, picture your hands doing it, and then read the next one." },
      explain: { audio: `${Q}/c-2-speak-read-two-steps-explain.mp3`, script: "Here are the two steps one more time. Second, cut from each corner toward the middle, and stop before you reach the dot. Third, fold every other corner point into the middle and hold them there. In order, nothing skipped." },
      interaction: { type: "speak", text: "Second cut from each corner toward the middle and stop before you reach the dot Third fold every other corner point into the middle and hold them there" },
    },
    {
      id: "c-3-check-for-how-to",
      band: "core",
      difficulty: 3,
      prompt: "Tobin read the whole how-to in order. Which check matches that why?",
      narration: { audio: `${Q}/c-3-check-for-how-to.mp3`, script: "Tobin read the whole pinwheel how-to in order, skipping nothing, because his why was to follow the steps. Now comes the check, and the check matches the why. Four checks are on your screen. Tap the one that fits a how-to." },
      hint: { audio: `${Q}/c-3-check-for-how-to-hint.mp3`, script: "His why was to follow steps. The check for that why asks about the steps, not about a fact and not about a story." },
      explain: { audio: `${Q}/c-3-check-for-how-to-explain.mp3`, script: "The answer is, can I do the steps in order. When the why is to follow steps, the check asks whether the reader can do them, first to last." },
      interaction: { type: "choose", options: [{ id: "can-i-do-the-steps-in-order", label: "can I do the steps in order" }, { id: "can-i-tell-what-happened", label: "can I tell what happened" }, { id: "did-i-find-the-one-fact", label: "did I find the one fact" }, { id: "did-i-picture-the-hill", label: "did I picture the hill" }], correctId: "can-i-do-the-steps-in-order", coachWrong: "That check belongs to a different why. Tobin was following steps. Which check asks about steps?" },
    },
    {
      id: "c-4-sequence-pinwheel-steps",
      band: "core",
      difficulty: 4,
      prompt: "The check: put the four pinwheel steps in order.",
      narration: { audio: `${Q}/c-4-sequence-pinwheel-steps.mp3`, script: "Here is the whole how-to for a paper pinwheel, and your why is to follow the steps, so listen in order. First, cut a square of paper and mark the middle with a dot. Second, cut from each corner toward the middle, and stop before you reach the dot. Third, fold every other corner point into the middle and hold them there. Fourth, push a pin through the points and into the side of a pencil eraser, and give it a blow. Now the check. Four cards are on your screen, mixed up. Tap them in the order the how-to gave them." },
      hint: { audio: `${Q}/c-4-sequence-pinwheel-steps-hint.mp3`, script: "Picture your hands. You cannot fold a corner point before it has been cut, and you cannot pin the points before they are folded." },
      explain: { audio: `${Q}/c-4-sequence-pinwheel-steps-explain.mp3`, script: "The order is cut a square and mark it, cut in from each corner, fold every other point in, and pin it to a pencil eraser. Each step needs the one before it." },
      interaction: { type: "sequence", items: [{ id: "cut-square-mark", label: "cut a square and mark it" }, { id: "cut-in-corners", label: "cut in from each corner" }, { id: "fold-points-in", label: "fold every other point in" }, { id: "pin-to-eraser", label: "pin it to a pencil eraser" }], order: ["cut-square-mark", "cut-in-corners", "fold-points-in", "pin-to-eraser"], coachWrong: "Picture your hands doing that step. What has to be finished before it can work?" },
    },
    {
      id: "c-5-sort-read-to",
      band: "core",
      difficulty: 5,
      prompt: "Sort each read: Read to Enjoy, or Read to Find or Follow?",
      narration: { audio: `${Q}/c-5-sort-read-to.mp3`, script: "Six cards, six reads from Tobin's week at the farm. Read each card and name the why. If Tobin would read it to enjoy it, drag it to Read to Enjoy. If he would read it to find one thing or to follow steps, drag it to Read to Find or Follow." },
      hint: { audio: `${Q}/c-5-sort-read-to-hint.mp3`, script: "First, ask what Tobin wants from that read. A good time, or one answer, or a set of steps to do." },
      explain: { audio: `${Q}/c-5-sort-read-to-explain.mp3`, script: "A story Hamid wrote, a comic about a dragon, and a poem about the wind are reads to enjoy. How to plant a pear seed, the time the bus leaves, and how many legs a beetle has are reads to find or follow." },
      interaction: { type: "sort", buckets: ["Read to Enjoy", "Read to Find or Follow"], bucketAudio: { "Read to Enjoy": `${Q}/b-read-to-enjoy.mp3`, "Read to Find or Follow": `${Q}/b-read-to-find-or-follow.mp3` }, items: [{ label: "a story Hamid wrote", bucket: "Read to Enjoy" }, { label: "how to plant a pear seed", bucket: "Read to Find or Follow" }, { label: "a comic about a dragon", bucket: "Read to Enjoy" }, { label: "the time the bus leaves", bucket: "Read to Find or Follow" }, { label: "a poem about the wind", bucket: "Read to Enjoy" }, { label: "how many legs a beetle has", bucket: "Read to Find or Follow" }], coachWrong: "Ask what Tobin wants from that read. A good time, or one answer or a set of steps to do?" },
    },
    {
      id: "c-6-speak-find-why-it-spins",
      band: "core",
      difficulty: 6,
      prompt: "Your why: find out why a pinwheel spins. Say your why, and say what you found.",
      narration: { audio: `${Q}/c-6-speak-find-why-it-spins.mp3`, script: "Here is the fact page about wind, and your why is to find one fact. Why does a pinwheel spin? Listen, move quickly through the parts that do not answer it, and slow down at the part that does. Wind is air that is moving. The sun warms some parts of the ground more than others, and the warm air over those spots rises. Cooler air rushes in to fill the space, and that rush is the wind you feel on your face. A pinwheel spins because moving air pushes against its tilted blades, and the push turns them around the pin. Air moves faster across an open hilltop than through a town full of buildings, because nothing stands in its way. Now the check. Tap the mic. Say your why, and say what you found." },
      hint: { audio: `${Q}/c-6-speak-find-why-it-spins-hint.mp3`, script: "Your why was to find one fact. Say that, and then say what the moving air does to the blades." },
      explain: { audio: `${Q}/c-6-speak-find-why-it-spins-explain.mp3`, script: "The why was to find one fact, and the fact was found. A pinwheel spins because moving air pushes against its tilted blades and turns them around the pin." },
      interaction: { type: "speak", text: "find found fact one why spin spins spinning air moving moves pushes push pushing blades blade tilted turn turns wind because against pin" },
    },
    {
      id: "h-1-compare-modeled",
      band: "harder",
      difficulty: 1,
      prompt: "One why for two texts: to compare. What did I do to compare them?",
      narration: { audio: `${Q}/h-1-compare-modeled.mp3`, script: "Here is a fourth grade step. Sometimes a reader has one why for two texts at once, and the why is to compare them. That means reading each text for the same one thing, and then setting the two answers side by side. Watch me do it. Tobin wants to know where the wind blows hardest. Text one is from the fact page. Air moves faster across an open hilltop than through a town full of buildings, because nothing stands in its way. Text two is a note from Hamid. The wind blows hardest in the gap between the barn and the house, because it gets squeezed through. I read text one for its place, the hilltop. I read text two for its place, the gap by the barn. Side by side, the two texts name different places, and each one gives a reason. That is reading to compare. Now the check. Tap what I did to compare the two texts." },
      hint: { audio: `${Q}/h-1-compare-modeled-hint.mp3`, script: "To compare, a reader hunts for one thing in text one and the very same thing in text two." },
      explain: { audio: `${Q}/h-1-compare-modeled-explain.mp3`, script: "The answer is, read both for the same thing. I read each text for the place it named, and then I set the two places side by side." },
      interaction: { type: "choose", options: [{ id: "read-both-for-the-same-thing", label: "read both for the same thing" }, { id: "read-only-the-shorter-one", label: "read only the shorter one" }, { id: "read-the-first-one-twice", label: "read the first one twice" }, { id: "read-both-just-for-fun", label: "read both just for fun" }], correctId: "read-both-for-the-same-thing", coachWrong: "Comparing takes two texts and one hunt. Think about what I hunted for in each text." },
    },
    {
      id: "h-2-compare-applied",
      band: "harder",
      difficulty: 2,
      prompt: "Tobin may not run on the hill. Which card gives him a way to make the pinwheel spin faster?",
      narration: { audio: `${Q}/h-2-compare-applied.mp3`, script: "Your turn to compare. Grandpa Bernard said no running on the hill, and Tobin wants his pinwheel to spin faster. Two cards are in his pocket. Card one says, hold the pinwheel up high and turn its face into the wind. Card two says, run down the hill as fast as you can, and the pinwheel makes its own wind. Read both cards for the same thing, a way to spin faster while standing still. Tap which card gives Tobin a way he can use." },
      hint: { audio: `${Q}/h-2-compare-applied-hint.mp3`, script: "Grandpa said no running. Check each card for a way that works while Tobin stands still." },
      explain: { audio: `${Q}/h-2-compare-applied-explain.mp3`, script: "The answer is card one, face the wind. Card two needs running, so only card one gives a way Tobin can use while standing still." },
      interaction: { type: "choose", options: [{ id: "card-one-face-the-wind", label: "card one, face the wind" }, { id: "card-two-run-downhill", label: "card two, run downhill" }, { id: "both-cards-they-agree", label: "both cards, they agree" }, { id: "neither-card-no-way-given", label: "neither card, no way given" }], correctId: "card-one-face-the-wind", coachWrong: "Read each card for one thing, a way that works standing still. One card breaks Grandpa's rule." },
    },
    {
      id: "h-3-speak-read-two-notes",
      band: "harder",
      difficulty: 3,
      prompt: "Read both notes: Grandpa wrote that the wind on the hill is strongest right after lunch. Hamid wrote that the wind on the hill is strongest early in the morning.",
      narration: { audio: `${Q}/h-3-speak-read-two-notes.mp3`, script: "Two notes are on your screen, and both were written about the same hill. Your why is to compare them, so read both out loud for the same one thing, the time of day the wind is strongest." },
      hint: { audio: `${Q}/h-3-speak-read-two-notes-hint.mp3`, script: "Each note names a time of day. Read the first note to its period, then the second, and keep both times in your head." },
      explain: { audio: `${Q}/h-3-speak-read-two-notes-explain.mp3`, script: "Here are both notes once more. Grandpa wrote that the wind on the hill is strongest right after lunch. Hamid wrote that the wind on the hill is strongest early in the morning. Two notes, one thing to hunt, two different times." },
      interaction: { type: "speak", text: "Grandpa wrote that the wind on the hill is strongest right after lunch Hamid wrote that the wind on the hill is strongest early in the morning" },
    },
    {
      id: "h-4-speak-compare-production",
      band: "harder",
      difficulty: 4,
      prompt: "What time does each note give, and do the two notes agree?",
      narration: { audio: `${Q}/h-4-speak-compare-production.mp3`, script: "Last one, out loud. Here are the two notes about the hill once more. Grandpa wrote that the wind on the hill is strongest right after lunch. Hamid wrote that the wind on the hill is strongest early in the morning. You read both for the same one thing, the time of day. Tap the mic. Say what time each note gives, and then say whether the two notes agree." },
      hint: { audio: `${Q}/h-4-speak-compare-production-hint.mp3`, script: "Name the time from the first note, name the time from the second note, and then say if those two times are the same." },
      explain: { audio: `${Q}/h-4-speak-compare-production-explain.mp3`, script: "Grandpa's note says right after lunch, and Hamid's note says early in the morning. The two notes do not agree, and a reader who compared them found that out." },
      interaction: { type: "speak", text: "lunch after morning early agree disagree different differ same time times strongest wind grandpa hamid noon two both compare compared each note notes" },
    },
  ],
};
