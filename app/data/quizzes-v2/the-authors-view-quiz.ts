import type { QuizDef } from "@/lib/lesson-engine/quiz";

// The Author's View QUIZ (RI.3.6) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge. Bands:
// easier(G2-bridge fact-vs-opinion at 3 options w/ picture support) /
// core(on-grade G3: the author's view, which-words-show-it, Fact / Author's
// Opinion sort, the fact a reader could disagree with, what the author wants
// you to do, production speak) / harder(G4 transfer RI.4.8, TAUGHT in the
// stimulus first: which fact the author uses as a reason for a point, a
// reason that is evidence vs a reason that is only another opinion, the
// reader's own point backed by a fact from the same book, closing with a
// production speak). ALL-FRESH second informational text by an opinionated
// author, "The Sea's Most Amazing Animal" (jellyfish; every fact true: no
// brain, no heart, no bones, body almost entirely water, drifting in the
// oceans since before the dinosaurs, some kinds glow in the dark, moves by
// squeezing its bell to push water out, tentacles carry tiny stingers that
// catch small fish and shrimp, some kinds can hurt a swimmer; the opinions:
// most amazing animal, sadly, a sight nobody ever forgets, the loveliest
// sight, a tiny cost for such wonder, stranger than any animal on land,
// every family should spend an hour at an aquarium, deserve our wonder),
// spoken page by page INSIDE the questions so every Q is self-contained;
// nothing from the lesson text (guinea pigs) is reused. Topic grep-swept vs
// lessons-v2 + quizzes-v2: jellyfish, tentacle, stinger 0 hits; aquarium only
// a story setting in same-root-new-branch; dinosaur only a phonics / voice
// word. Quiz support images live in the lesson's image dir (quiz- keys).
// Bucket clips b-fact / b-authors-opinion are pre-synthesized from
// punctuated labels before quiz-tts so self-heal never fills them.

const Q = "/audio/quizzes-v2/the-authors-view-quiz";
const IMG = (w: string) => `/images/lessons-v2/the-authors-view/${w.toLowerCase()}.png`;

export const theAuthorsViewQuiz: QuizDef = {
  id: "the-authors-view-quiz",
  lessonId: "the-authors-view",
  title: "The Author's View Quiz",
  standard: "RI.3.6",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-fact-you-could-check",
      band: "easier",
      difficulty: 1,
      prompt: "Which one is a fact you could check?",
      image: IMG("quiz-jellyfish-drifting"),
      narration: { audio: `${Q}/e-1-fact-you-could-check.mp3`, script: "Here is a new true book called The Sea's Most Amazing Animal. Listen to page one. The jellyfish is the most amazing animal in the whole sea, and I will prove it before this book is over. A jellyfish has no brain, no heart, and no bones, and its body is made almost entirely of water. Sadly, most swimmers only fear them. Three pieces of page one are on your screen. Which one is a fact you could check? Tap it." },
      hint: { audio: `${Q}/e-1-fact-you-could-check-hint.mp3`, script: "A fact is something a scientist could check with a test. A word that carries a feeling belongs to the author." },
      explain: { audio: `${Q}/e-1-fact-you-could-check-explain.mp3`, script: "It has no bones is a fact. A scientist could check a jellyfish and find no bones. The other two carry the author's feelings." },
      interaction: { type: "choose", options: [{ id: "it-has-no-bones", label: "it has no bones" }, { id: "the-most-amazing-animal", label: "the most amazing animal" }, { id: "sadly-most-swimmers", label: "sadly, most swimmers" }], correctId: "it-has-no-bones", coachWrong: "Those words tell you how the author feels. Look for the words a scientist could check." },
    },
    {
      id: "e-2-words-show-opinion",
      band: "easier",
      difficulty: 2,
      prompt: "Which words show the author's opinion?",
      image: IMG("quiz-jellyfish-glow"),
      narration: { audio: `${Q}/e-2-words-show-opinion.mp3`, script: "Listen to page two. Jellyfish have drifted through the oceans since before the dinosaurs walked the earth. Some kinds glow in the dark, and a beach full of glowing jellyfish at night is a sight nobody ever forgets. Three pieces of page two are on your screen. Which words show the author's opinion? Tap them." },
      hint: { audio: `${Q}/e-2-words-show-opinion-hint.mp3`, script: "Two of these could be checked by a scientist. Which words could nobody check with a test?" },
      explain: { audio: `${Q}/e-2-words-show-opinion-explain.mp3`, script: "Nobody ever forgets is the author's opinion. The author cannot know what every person remembers. The other two are facts." },
      interaction: { type: "choose", options: [{ id: "nobody-ever-forgets", label: "nobody ever forgets" }, { id: "some-kinds-glow", label: "some kinds glow" }, { id: "before-the-dinosaurs", label: "before the dinosaurs" }], correctId: "nobody-ever-forgets", coachWrong: "Those words could be checked. Find the words that judge instead of describe." },
    },
    {
      id: "e-3-loaded-word",
      band: "easier",
      difficulty: 3,
      prompt: "Which word is a loaded word?",
      narration: { audio: `${Q}/e-3-loaded-word.mp3`, script: "Listen to one sentence from page one again. Sadly, most swimmers only fear them. One of these three words carries the author's feeling. Tap the loaded word." },
      hint: { audio: `${Q}/e-3-loaded-word-hint.mp3`, script: "A loaded word tells you how the author feels about what happens, not what happens." },
      explain: { audio: `${Q}/e-3-loaded-word-explain.mp3`, script: "Sadly is the loaded word. It tells you the author feels sad that swimmers fear jellyfish. Swimmers and them just name who." },
      interaction: { type: "choose", options: [{ id: "sadly", label: "sadly" }, { id: "swimmers", label: "swimmers" }, { id: "them", label: "them" }], correctId: "sadly", coachWrong: "That word only names who. Which word tells you how the author feels about it?" },
    },
    {
      id: "e-4-author-thinks",
      band: "easier",
      difficulty: 4,
      prompt: "What does the author think about jellyfish?",
      image: IMG("quiz-jellyfish-aquarium"),
      narration: { audio: `${Q}/e-4-author-thinks.mp3`, script: "Listen to the end of the book. Every family should spend an hour at an aquarium watching jellyfish drift, because these animals deserve our wonder, not our fear. What does this author think about jellyfish? Tap it." },
      hint: { audio: `${Q}/e-4-author-thinks-hint.mp3`, script: "The author wants families to spend a whole hour watching them. Would the author say that about something boring or scary?" },
      explain: { audio: `${Q}/e-4-author-thinks-explain.mp3`, script: "The author thinks jellyfish are worth watching. The text says they deserve our wonder, not our fear." },
      interaction: { type: "choose", options: [{ id: "they-are-worth-watching", label: "they are worth watching" }, { id: "they-should-be-feared", label: "they should be feared" }, { id: "they-are-dull-to-watch", label: "they are dull to watch" }], correctId: "they-are-worth-watching", coachWrong: "Listen again. The author says wonder, not fear, and asks you to watch for an hour." },
    },
    {
      id: "c-1-author-view",
      band: "core",
      difficulty: 1,
      prompt: "What does the author think about jellyfish?",
      narration: { audio: `${Q}/c-1-author-view.mp3`, script: "Here are pages one and two of a true book called The Sea's Most Amazing Animal. The jellyfish is the most amazing animal in the whole sea, and I will prove it before this book is over. A jellyfish has no brain, no heart, and no bones, and its body is made almost entirely of water. Sadly, most swimmers only fear them. Jellyfish have drifted through the oceans since before the dinosaurs walked the earth. Some kinds glow in the dark, and a beach full of glowing jellyfish at night is a sight nobody ever forgets. Four views are on your screen. Only one of them is what this author thinks about jellyfish. Tap it." },
      hint: { audio: `${Q}/c-1-author-view-hint.mp3`, script: "Listen to the loaded words. Most amazing. Sadly. Nobody ever forgets. Do those words come from someone who admires jellyfish, or someone who fears them?" },
      explain: { audio: `${Q}/c-1-author-view-explain.mp3`, script: "The author thinks jellyfish deserve our wonder. Every loaded word on those pages admires them, and the author is sad that swimmers only fear them." },
      interaction: { type: "choose", options: [{ id: "jellyfish-deserve-our-wonder", label: "jellyfish deserve our wonder" }, { id: "jellyfish-should-be-feared", label: "jellyfish should be feared" }, { id: "jellyfish-are-dull-to-watch", label: "jellyfish are dull to watch" }, { id: "swimmers-should-stay-away", label: "swimmers should stay away" }], correctId: "jellyfish-deserve-our-wonder", coachWrong: "Check that view against the pages. Which one would the person who wrote them agree with?" },
    },
    {
      id: "c-2-which-words-show-it",
      band: "core",
      difficulty: 2,
      prompt: "Which words show the author's opinion?",
      narration: { audio: `${Q}/c-2-which-words-show-it.mp3`, script: "Here is a sentence from page three. A jellyfish moves by squeezing its soft bell to push water out behind it, and watching one drift past is the loveliest sight in the whole sea. Four pieces of that sentence are on your screen, and all four are really there. Only one carries the author's feeling. Tap it." },
      hint: { audio: `${Q}/c-2-which-words-show-it-hint.mp3`, script: "Three of these describe what a jellyfish does, and a scientist could film it. Find the words that judge." },
      explain: { audio: `${Q}/c-2-which-words-show-it-explain.mp3`, script: "The loveliest sight is the author's opinion. Loveliest is a loaded word, and nobody can check it with a test. The rest of the sentence describes how a jellyfish moves." },
      interaction: { type: "choose", options: [{ id: "the-loveliest-sight", label: "the loveliest sight" }, { id: "squeezing-its-soft-bell", label: "squeezing its soft bell" }, { id: "push-water-out-behind-it", label: "push water out behind it" }, { id: "watching-one-drift-past", label: "watching one drift past" }], correctId: "the-loveliest-sight", coachWrong: "Those words describe something a scientist could film. Find the word that carries a feeling." },
    },
    {
      id: "c-3-sort-fact-opinion",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Fact, or Author's Opinion?",
      narration: { audio: `${Q}/c-3-sort-fact-opinion.mp3`, script: "Six pieces of the jellyfish book are on your screen. For each one, ask this. Could a scientist check it with a test, or is it a judgment that carries the author's feeling? If it can be checked, drag it to Fact. If it is what the author thinks, drag it to Author's Opinion." },
      hint: { audio: `${Q}/c-3-sort-fact-opinion-hint.mp3`, script: "Words like amazing, wonder, and stranger than carry a feeling. A body part, a glow, or water can be checked." },
      explain: { audio: `${Q}/c-3-sort-fact-opinion-explain.mp3`, script: "No brain, glows in the dark, and mostly water can all be checked, so they are facts. Most amazing, a tiny cost for such wonder, and stranger than any animal are judgments, so they are the author's opinion." },
      interaction: { type: "sort", buckets: ["Fact","Author's Opinion"], bucketAudio: { "Fact": `${Q}/b-fact.mp3`, "Author's Opinion": `${Q}/b-authors-opinion.mp3` }, items: [{ label: "it has no brain", bucket: "Fact" }, { label: "the most amazing animal", bucket: "Author's Opinion" }, { label: "some kinds glow in the dark", bucket: "Fact" }, { label: "a tiny cost for such wonder", bucket: "Author's Opinion" }, { label: "its body is mostly water", bucket: "Fact" }, { label: "stranger than any animal", bucket: "Author's Opinion" }], coachWrong: "Ask the question again. Could a scientist test those words and find them true or false? If not, they carry a feeling, and feelings belong to the author." },
    },
    {
      id: "c-4-fact-to-disagree",
      band: "core",
      difficulty: 4,
      prompt: "Which fact might make a reader disagree with the author?",
      narration: { audio: `${Q}/c-4-fact-to-disagree.mp3`, script: "The author says every family should spend an hour watching jellyfish, because they deserve our wonder, not our fear. Here is page three. A jellyfish moves by squeezing its soft bell to push water out behind it, and watching one drift past is the loveliest sight in the whole sea. Its long tentacles carry tiny stingers that catch small fish and shrimp, and some kinds can hurt a swimmer, but a sting is a tiny cost for such wonder. Four facts from page three are on your screen, and all four are true. Three of them fit the author's view, or do not matter either way. One of them could give a reader a reason to disagree. Tap that fact." },
      hint: { audio: `${Q}/c-4-fact-to-disagree-hint.mp3`, script: "Ask, does this fact give a reader a reason to feel fear instead of wonder? Look for the fact the author hurried to call a tiny cost." },
      explain: { audio: `${Q}/c-4-fact-to-disagree-explain.mp3`, script: "Some kinds can hurt a swimmer is the fact a reader could use to disagree. The author calls it a tiny cost, but a reader who has been stung might not agree." },
      interaction: { type: "choose", options: [{ id: "some-kinds-hurt-swimmers", label: "some kinds hurt swimmers" }, { id: "it-squeezes-its-bell-to-move", label: "it squeezes its bell to move" }, { id: "it-catches-small-fish-and-shrimp", label: "it catches fish and shrimp" }, { id: "it-pushes-water-behind-it", label: "it pushes water behind it" }], correctId: "some-kinds-hurt-swimmers", coachWrong: "That fact does not argue with the author. Look for the fact the author had to say was not so bad." },
    },
    {
      id: "c-5-what-author-wants",
      band: "core",
      difficulty: 5,
      prompt: "What does the author want you to do?",
      narration: { audio: `${Q}/c-5-what-author-wants.mp3`, script: "An author's view also shows in what the author tells you to do. Listen to the last page. Jellyfish are stranger than any animal on land, because they have no brain, no heart, and no bones. Every family should spend an hour at an aquarium watching jellyfish drift, because these animals deserve our wonder, not our fear. Four things are on your screen. What does this author want you to do? Tap it." },
      hint: { audio: `${Q}/c-5-what-author-wants-hint.mp3`, script: "Listen for the word should. What comes right after it?" },
      explain: { audio: `${Q}/c-5-what-author-wants-explain.mp3`, script: "The author wants you to watch them at an aquarium. The text says every family should spend an hour at an aquarium watching jellyfish drift." },
      interaction: { type: "choose", options: [{ id: "watch-them-at-an-aquarium", label: "watch them at an aquarium" }, { id: "keep-one-in-a-fish-tank", label: "keep one in a fish tank" }, { id: "stay-away-from-the-beach", label: "stay away from the beach" }, { id: "catch-one-with-a-net", label: "catch one with a net" }], correctId: "watch-them-at-an-aquarium", coachWrong: "The author never says that. Listen for the sentence with the word should in it." },
    },
    {
      id: "c-6-speak-your-view",
      band: "core",
      difficulty: 6,
      prompt: "What do you think about jellyfish? Does your view match the author's? Say why.",
      narration: { audio: `${Q}/c-6-speak-your-view.mp3`, script: "Here is page one of The Sea's Most Amazing Animal again. The jellyfish is the most amazing animal in the whole sea, and I will prove it before this book is over. A jellyfish has no brain, no heart, and no bones, and its body is made almost entirely of water. Sadly, most swimmers only fear them. Tap the mic. Say what you think about jellyfish, say whether that matches what the author thinks or is different, and give one reason, from the book or from your own life. Start with, I think." },
      hint: { audio: `${Q}/c-6-speak-your-view-hint.mp3`, script: "Say what you think jellyfish are. Then tell me whether your view is the same as the author's view or different from it. End with the word because, and give your reason." },
      explain: { audio: `${Q}/c-6-speak-your-view-explain.mp3`, script: "Any view works, as long as it has a reason. You could say, I think jellyfish are amazing, the same as the author, because they have no brain and still catch fish. Or, I think jellyfish are scary, which is different from the author, because their stingers can hurt a swimmer." },
      interaction: { type: "speak", text: "agree disagree different same match matches author amazing beautiful lovely pretty cool interesting scary dangerous sting stings stingers hurt hurts glow glows drift drifts water brain bones heart fear afraid weird slimy strange wonder" },
    },
    {
      id: "h-1-fact-used-as-reason",
      band: "harder",
      difficulty: 1,
      prompt: "Which fact does the author use as a reason for the point?",
      narration: { audio: `${Q}/h-1-fact-used-as-reason.mp3`, script: "Here is a fourth grade move. When an author makes a point, a strong reader asks which facts the author uses as reasons to hold it up. Watch me. On page two the author's point is that a beach full of jellyfish is a sight nobody ever forgets, and the reason the author gives is a fact. Some kinds glow in the dark. Now you. On the last page the author makes this point. Jellyfish are stranger than any animal on land. Four pieces of the book are on your screen. Which one does the author use as a reason for that point? Tap it." },
      hint: { audio: `${Q}/h-1-fact-used-as-reason-hint.mp3`, script: "Ask, does this piece explain why a jellyfish is strange? A feeling, a fear, or a piece of advice does not explain it." },
      explain: { audio: `${Q}/h-1-fact-used-as-reason-explain.mp3`, script: "The author's reason is that a jellyfish has no brain, no heart, and no bones. The text says, stranger than any animal on land, because they have no brain, no heart, and no bones. The reason comes right after the word because." },
      interaction: { type: "choose", options: [{ id: "no-brain-heart-or-bones", label: "no brain, heart, or bones" }, { id: "most-swimmers-fear-them", label: "most swimmers fear them" }, { id: "an-hour-at-an-aquarium", label: "an hour at an aquarium" }, { id: "the-loveliest-sight", label: "the loveliest sight" }], correctId: "no-brain-heart-or-bones", coachWrong: "That piece does not explain why a jellyfish is strange. Look for a fact about the jellyfish itself." },
    },
    {
      id: "h-2-reason-not-evidence",
      band: "harder",
      difficulty: 2,
      prompt: "Which reason is NOT evidence?",
      narration: { audio: `${Q}/h-2-reason-not-evidence.mp3`, script: "Fourth graders check the reasons too. A reason that is a fact is called evidence, and evidence holds a point up. A reason that is only another opinion holds nothing up, because nobody can check it. The author's point is that jellyfish are amazing. Four reasons from the book are on your screen. Three of them are facts, so they are evidence. One of them is only another opinion. Tap the reason that is not evidence." },
      hint: { audio: `${Q}/h-2-reason-not-evidence-hint.mp3`, script: "Evidence can be checked with a test. Which reason carries a loaded word instead?" },
      explain: { audio: `${Q}/h-2-reason-not-evidence-explain.mp3`, script: "They are the loveliest sight is not evidence. Loveliest is the author's feeling, and nobody can test it. No brain, glowing in the dark, and drifting before the dinosaurs can all be checked." },
      interaction: { type: "choose", options: [{ id: "they-are-the-loveliest-sight", label: "they are the loveliest sight" }, { id: "they-have-no-brain", label: "they have no brain" }, { id: "they-glow-in-the-dark", label: "they glow in the dark" }, { id: "drifted-before-dinosaurs", label: "drifted before dinosaurs" }], correctId: "they-are-the-loveliest-sight", coachWrong: "That reason is a fact a scientist could check, so it is evidence. Find the reason that is only a feeling." },
    },
    {
      id: "h-3-readers-point-backed",
      band: "harder",
      difficulty: 3,
      prompt: "A reader says, I think jellyfish are hunters. Which fact supports that?",
      narration: { audio: `${Q}/h-3-readers-point-backed.mp3`, script: "Now the reader's side. A reader can make a point of her own and hold it up with a fact from the same book. Here are pages one and three. A jellyfish has no brain, no heart, and no bones, and its body is made almost entirely of water. A jellyfish moves by squeezing its soft bell to push water out behind it. Its long tentacles carry tiny stingers that catch small fish and shrimp, and some kinds can hurt a swimmer. A reader says, I think jellyfish are hunters. Four facts from those pages are on your screen. Which one supports the reader's point? Tap it." },
      hint: { audio: `${Q}/h-3-readers-point-backed-hint.mp3`, script: "A hunter catches other animals to eat. Which fact shows a jellyfish catching something?" },
      explain: { audio: `${Q}/h-3-readers-point-backed-explain.mp3`, script: "Stingers catch fish and shrimp supports the reader's point. A hunter catches other animals, and that fact shows the jellyfish doing exactly that." },
      interaction: { type: "choose", options: [{ id: "stingers-catch-small-fish", label: "stingers catch small fish" }, { id: "its-body-is-mostly-water", label: "its body is mostly water" }, { id: "it-has-no-heart", label: "it has no heart" }, { id: "it-squeezes-its-bell-to-move", label: "it squeezes its bell to move" }], correctId: "stingers-catch-small-fish", coachWrong: "That fact is true, but it does not show the jellyfish catching anything. Which one does?" },
    },
    {
      id: "h-4-speak-point-and-reason",
      band: "harder",
      difficulty: 4,
      prompt: "Say the author's point, then one fact that holds it up.",
      narration: { audio: `${Q}/h-4-speak-point-and-reason.mp3`, script: "Last one, out loud. Here is page two once more. Jellyfish have drifted through the oceans since before the dinosaurs walked the earth. Some kinds glow in the dark, and a beach full of glowing jellyfish at night is a sight nobody ever forgets. Tap the mic. Say the point the author makes about jellyfish on this page, then say one fact from the page the author uses as a reason to hold that point up." },
      hint: { audio: `${Q}/h-4-speak-point-and-reason-hint.mp3`, script: "The point is the author's opinion, the part with the feeling in it. The reason is a fact you could check. Say the opinion first, then the fact." },
      explain: { audio: `${Q}/h-4-speak-point-and-reason-explain.mp3`, script: "The author's point is that a beach full of jellyfish is a sight nobody ever forgets. The facts the author uses are that some kinds glow in the dark, and that jellyfish have drifted in the oceans since before the dinosaurs." },
      interaction: { type: "speak", text: "amazing wonder wonderful forgets forget unforgettable sight point reason reasons because evidence fact facts drifted drift oceans ocean before dinosaurs old older glow glows glowing dark night beach support supports" },
    },
  ],
};
