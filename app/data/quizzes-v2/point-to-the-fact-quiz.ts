import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Point to the Fact QUIZ (RI.3.1) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// who/what/where/how at 3 options w/ picture support) / core(on-grade G3:
// find-the-proof, which-question-does-this-answer, put-together, does-the-
// text-say-it, production speak) / harder(G4 transfer RI.4.1: "the text says
// X, so I can tell Y", an inference backed by a quoted sentence, MODELED first
// in h-1 then applied, closing with a production speak). ALL-FRESH second
// informational text, "The Slowest Animal in the Trees" (sloths; every fact
// true: Central and South American rainforests, long curved claws hook over
// the branch, eats and sleeps upside down, stays in one tree for days, green
// algae grows in its fur and hides it among the leaves, fur parts on the belly
// so rain runs off upside down, leaves give little energy and take many days
// to digest, climbs down about once a week, cannot walk on the ground and
// drags itself with its claws, jaguars catch crawling sloths, strong swimmer
// faster than it crawls), spoken page by page INSIDE the questions so every Q
// is self-contained; nothing from the lesson text (redwoods) is reused. Topic
// grep-swept vs lessons-v2 + quizzes-v2: sloth, algae, jaguar 0 hits;
// rainforest only as a frog picture prompt. Planted trap: WHY it climbs down
// (to go to the bathroom is true in the world, the text never says it).
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/point-to-the-fact-quiz";
const IMG = (w: string) => `/images/lessons-v2/point-to-the-fact/${w.toLowerCase()}.png`;

export const pointToTheFactQuiz: QuizDef = {
  id: "point-to-the-fact-quiz",
  lessonId: "point-to-the-fact",
  title: "Point to the Fact Quiz",
  standard: "RI.3.1",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-how-hold-on",
      band: "easier",
      difficulty: 1,
      prompt: "How does a sloth hold on to a branch?",
      image: IMG("quiz-sloth-hanging"),
      narration: { audio: `${Q}/e-1-how-hold-on.mp3`, script: "Here is page one of a new true text called The Slowest Animal in the Trees. Deep in the rainforests of Central and South America, a sloth hangs upside down from a branch. It holds on with long, curved claws that hook over the branch like coat hooks. How does a sloth hold on to a branch? Tap the answer." },
      hint: { audio: `${Q}/e-1-how-hold-on-hint.mp3`, script: "Listen for the words right after, it holds on with. The picture shows them too." },
      explain: { audio: `${Q}/e-1-how-hold-on-explain.mp3`, script: "The text says, it holds on with long, curved claws that hook over the branch. Long curved claws is the answer." },
      interaction: { type: "choose", options: [{ id: "with-long-curved-claws", label: "with long curved claws" }, { id: "with-its-long-tail", label: "with its long tail" }, { id: "with-its-sharp-teeth", label: "with its sharp teeth" }], correctId: "with-long-curved-claws", coachWrong: "Look at the sloth in the picture. What is hooked over the branch?" },
    },
    {
      id: "e-2-what-grows-in-fur",
      band: "easier",
      difficulty: 2,
      prompt: "What grows in a sloth's fur?",
      image: IMG("quiz-sloth-hanging"),
      narration: { audio: `${Q}/e-2-what-grows-in-fur.mp3`, script: "Page two. A sloth moves so slowly that tiny green plants called algae grow right in its fur. What grows in a sloth's fur? Tap it." },
      hint: { audio: `${Q}/e-2-what-grows-in-fur-hint.mp3`, script: "Listen for the color word. The text names what grows and tells its color." },
      explain: { audio: `${Q}/e-2-what-grows-in-fur-explain.mp3`, script: "The text says, tiny green plants called algae grow right in its fur. Tiny green plants is the answer." },
      interaction: { type: "choose", options: [{ id: "tiny-green-plants", label: "tiny green plants" }, { id: "small-brown-mushrooms", label: "small brown mushrooms" }, { id: "little-white-flowers", label: "little white flowers" }], correctId: "tiny-green-plants", coachWrong: "The text gave a color. Which answer has that color in it?" },
    },
    {
      id: "e-3-how-move-on-ground",
      band: "easier",
      difficulty: 3,
      prompt: "How does a sloth move on the ground?",
      image: IMG("quiz-sloth-crawling"),
      narration: { audio: `${Q}/e-3-how-move-on-ground.mp3`, script: "Page four. On the ground, a sloth cannot walk, so it drags itself along with its claws. How does a sloth move on the ground? Tap the answer." },
      hint: { audio: `${Q}/e-3-how-move-on-ground-hint.mp3`, script: "The text says it cannot walk. Listen for what it does instead, and check the picture." },
      explain: { audio: `${Q}/e-3-how-move-on-ground-explain.mp3`, script: "The text says, it drags itself along with its claws. It drags itself along is the answer." },
      interaction: { type: "choose", options: [{ id: "it-drags-itself-along", label: "it drags itself along" }, { id: "it-hops-on-two-legs", label: "it hops on two legs" }, { id: "it-runs-on-four-legs", label: "it runs on four legs" }], correctId: "it-drags-itself-along", coachWrong: "Look at the sloth in the picture. Is it hopping, running, or pulling itself along?" },
    },
    {
      id: "e-4-where-faster",
      band: "easier",
      difficulty: 4,
      prompt: "Where can a sloth move faster than it crawls?",
      image: IMG("quiz-sloth-swimming"),
      narration: { audio: `${Q}/e-4-where-faster.mp3`, script: "Listen to the last sentence of the text. Strangely, a sloth is a strong swimmer, and it can swim faster than it can crawl. Where can a sloth move faster than it crawls? Tap the answer." },
      hint: { audio: `${Q}/e-4-where-faster-hint.mp3`, script: "A where question asks about a place. Where does swimming happen?" },
      explain: { audio: `${Q}/e-4-where-faster-explain.mp3`, script: "In the water. The text says a sloth is a strong swimmer and can swim faster than it can crawl, and swimming happens in the water." },
      interaction: { type: "choose", options: [{ id: "in-the-water", label: "in the water" }, { id: "on-the-ground", label: "on the ground" }, { id: "on-a-flat-rock", label: "on a flat rock" }], correctId: "in-the-water", coachWrong: "The text called the sloth a strong swimmer. Where do swimmers go?" },
    },
    {
      id: "c-1-proof-stays-put",
      band: "core",
      difficulty: 1,
      prompt: "Which piece of the text proves a sloth stays in one place a long time?",
      narration: { audio: `${Q}/c-1-proof-stays-put.mp3`, script: "Now you point to the sentence. Listen to page one. Deep in the rainforests of Central and South America, a sloth hangs upside down from a branch. It holds on with long, curved claws that hook over the branch like coat hooks. A sloth eats, sleeps, and even naps in this upside down position, and it may stay in the same tree for days. Here is the answer: a sloth stays in one place for a long time. Now tap the piece of the text that proves it." },
      hint: { audio: `${Q}/c-1-proof-stays-put-hint.mp3`, script: "The proof has to tell you how long the sloth stays. Read each piece and ask, does this one tell me that?" },
      explain: { audio: `${Q}/c-1-proof-stays-put-explain.mp3`, script: "The piece is, in the same tree for days. That is the part of the text that proves a sloth stays in one place a long time." },
      interaction: { type: "choose", options: [{ id: "in-the-same-tree-for-days", label: "in the same tree for days" }, { id: "hangs-upside-down", label: "hangs upside down" }, { id: "hook-over-the-branch", label: "hook over the branch" }, { id: "long-curved-claws", label: "long curved claws" }], correctId: "in-the-same-tree-for-days", coachWrong: "That piece is really in the text, but it does not tell how long the sloth stays. Read the pieces again." },
    },
    {
      id: "c-2-which-question",
      band: "core",
      difficulty: 2,
      prompt: "Which question does this sentence answer?",
      narration: { audio: `${Q}/c-2-which-question.mp3`, script: "Here is one sentence from page two. Its fur also parts on its belly instead of its back, so rain runs off while it hangs upside down. Four questions are on your screen. Tap the question that this sentence answers." },
      hint: { audio: `${Q}/c-2-which-question-hint.mp3`, script: "Think about what the sentence explains. It is about the fur and what the rain does." },
      explain: { audio: `${Q}/c-2-which-question-explain.mp3`, script: "The sentence answers, why does the rain run off. It tells you the fur parts on the belly, so rain runs off while the sloth hangs upside down." },
      interaction: { type: "choose", options: [{ id: "why-does-the-rain-run-off", label: "why does the rain run off" }, { id: "what-does-a-sloth-eat", label: "what does a sloth eat" }, { id: "how-fast-can-a-sloth-swim", label: "how fast can a sloth swim" }, { id: "where-do-sloths-live", label: "where do sloths live" }], correctId: "why-does-the-rain-run-off", coachWrong: "The text can answer that question, but not with this sentence. What does this sentence explain about the fur?" },
    },
    {
      id: "c-3-put-together-hide",
      band: "core",
      difficulty: 3,
      prompt: "How does moving slowly help a sloth hide? Put two sentences together.",
      narration: { audio: `${Q}/c-3-put-together-hide.mp3`, script: "This one takes two sentences. Listen to page two. A sloth moves so slowly that tiny green plants called algae grow right in its fur. The green color helps the sloth hide among the leaves. Put those two sentences together. How does moving slowly help a sloth hide? Tap the answer." },
      hint: { audio: `${Q}/c-3-put-together-hide-hint.mp3`, script: "Sentence one tells what moving slowly lets grow. Sentence two tells what that color does. Put them together." },
      explain: { audio: `${Q}/c-3-put-together-hide-explain.mp3`, script: "Green algae grows on its fur. Moving slowly lets the algae grow, and the green color hides the sloth among the leaves. Two sentences, one fact." },
      interaction: { type: "choose", options: [{ id: "green-algae-grows-on-its-fur", label: "green algae grows on its fur" }, { id: "its-claws-look-like-branches", label: "its claws look like branches" }, { id: "it-swims-away-from-danger", label: "it swims away from danger" }, { id: "its-fur-parts-on-its-belly", label: "its fur parts on its belly" }], correctId: "green-algae-grows-on-its-fur", coachWrong: "That does not connect to moving slowly. What does moving slowly let grow, and what does its color do?" },
    },
    {
      id: "c-4-text-does-not-say",
      band: "core",
      difficulty: 4,
      prompt: "Why does a sloth climb down to the ground?",
      narration: { audio: `${Q}/c-4-text-does-not-say.mp3`, script: "Listen to page three. Sloths eat leaves, and leaves give a body very little energy. A single meal can take a sloth many days to digest. About once a week, a sloth climbs all the way down to the ground. Now the question. Why does a sloth climb down to the ground? You may know a fact that fits. Before you tap, hunt for a sentence that says so." },
      hint: { audio: `${Q}/c-4-text-does-not-say-hint.mp3`, script: "Hunt through the page for a sentence that gives a reason. If you cannot find one, you know what the honest answer is." },
      explain: { audio: `${Q}/c-4-text-does-not-say-explain.mp3`, script: "The text does not say. Page three tells that the sloth climbs down about once a week, but no sentence tells why. A fact the text never says is not an answer from the text, even if it is true." },
      interaction: { type: "choose", options: [{ id: "the-text-does-not-say", label: "the text does not say" }, { id: "to-go-to-the-bathroom", label: "to go to the bathroom" }, { id: "to-find-fresh-water", label: "to find fresh water" }, { id: "to-look-for-a-new-tree", label: "to look for a new tree" }], correctId: "the-text-does-not-say", coachWrong: "That may even be true, but which sentence says it? If no sentence does, it is not an answer from the text." },
    },
    {
      id: "c-5-put-together-danger",
      band: "core",
      difficulty: 5,
      prompt: "Why is the ground a dangerous place for a sloth? Put two sentences together.",
      narration: { audio: `${Q}/c-5-put-together-danger.mp3`, script: "Two sentences again. Listen to page four. On the ground, a sloth cannot walk, so it drags itself along with its claws. A jaguar can catch a crawling sloth easily, but it rarely spots one hanging still among the leaves. Put those two sentences together. Why is the ground a dangerous place for a sloth? Tap the answer." },
      hint: { audio: `${Q}/c-5-put-together-danger-hint.mp3`, script: "Sentence one tells how a sloth moves on the ground. Sentence two tells what happens to a sloth that moves that way." },
      explain: { audio: `${Q}/c-5-put-together-danger-explain.mp3`, script: "A jaguar catches it crawling. On the ground the sloth can only crawl, and a jaguar can catch a crawling sloth easily, so the ground is dangerous." },
      interaction: { type: "choose", options: [{ id: "a-jaguar-catches-it-crawling", label: "a jaguar catches it crawling" }, { id: "it-cannot-swim-in-the-river", label: "it cannot swim in the river" }, { id: "it-cannot-climb-back-up", label: "it cannot climb back up" }, { id: "the-leaves-are-too-far-away", label: "the leaves are too far away" }], correctId: "a-jaguar-catches-it-crawling", coachWrong: "The text never says that. Think about how the sloth moves on the ground, and who can catch it when it moves that way." },
    },
    {
      id: "c-6-speak-hide",
      band: "core",
      difficulty: 6,
      prompt: "What helps a sloth hide among the leaves? Answer, then say the sentence that proves it.",
      narration: { audio: `${Q}/c-6-speak-hide.mp3`, script: "Now say both halves out loud. Here is page two one more time. A sloth moves so slowly that tiny green plants called algae grow right in its fur. The green color helps the sloth hide among the leaves. What helps a sloth hide among the leaves? Tap the mic. Say your answer, then say the sentence from the text that proves it." },
      hint: { audio: `${Q}/c-6-speak-hide-hint.mp3`, script: "Start with what is on the sloth's fur, then say the whole sentence about hiding as your proof." },
      explain: { audio: `${Q}/c-6-speak-hide-explain.mp3`, script: "The green color of the algae in its fur helps it hide. The text says, the green color helps the sloth hide among the leaves. That is the sentence, and it is the proof." },
      interaction: { type: "speak", text: "green color colors algae plants plant fur hide hides hiding hidden leaves leaf blend blends camouflage tiny grow grows growing helps" },
    },
    {
      id: "h-1-what-can-you-tell",
      band: "harder",
      difficulty: 1,
      prompt: "What can you tell from that sentence?",
      narration: { audio: `${Q}/h-1-what-can-you-tell.mp3`, script: "Here is a fourth grade step. Readers use a sentence to figure out something the text never says outright, and they still point to the sentence. Watch me. The text says, on the ground a sloth cannot walk, so it drags itself along with its claws. It never says the ground is a hard place for a sloth, but that sentence lets me tell the sloth is nearly helpless down there. Now you. The text says, a sloth moves so slowly that tiny green plants called algae grow right in its fur. What can you tell from that sentence? Tap it." },
      hint: { audio: `${Q}/h-1-what-can-you-tell-hint.mp3`, script: "Plants need time to grow. What does that tell you about how long the sloth keeps still?" },
      explain: { audio: `${Q}/h-1-what-can-you-tell-explain.mp3`, script: "You can tell it holds still a long time. Plants need time to grow, so if algae can grow in its fur, the sloth must keep still for a very long time." },
      interaction: { type: "choose", options: [{ id: "it-holds-still-a-long-time", label: "it holds still a long time" }, { id: "it-washes-its-fur-often", label: "it washes its fur often" }, { id: "it-lives-in-the-water", label: "it lives in the water" }, { id: "it-moves-fast-at-night", label: "it moves fast at night" }], correctId: "it-holds-still-a-long-time", coachWrong: "The sentence does not show that. Think about what has to be true for plants to grow on an animal." },
    },
    {
      id: "h-2-sentence-backs-idea",
      band: "harder",
      difficulty: 2,
      prompt: "Which sentence backs up the idea that a sloth's body is built for hanging?",
      narration: { audio: `${Q}/h-2-sentence-backs-idea.mp3`, script: "When you tell what you figured out, you still point to a sentence. Listen to four sentences from the text. It holds on with long, curved claws that hook over the branch like coat hooks. A single meal can take a sloth many days to digest. A jaguar can catch a crawling sloth easily. A sloth is a strong swimmer. I can tell that a sloth's body is built for hanging. Which sentence backs that up? Tap it." },
      hint: { audio: `${Q}/h-2-sentence-backs-idea-hint.mp3`, script: "Built for hanging means a body part made for holding on. Which sentence tells about a part like that?" },
      explain: { audio: `${Q}/h-2-sentence-backs-idea-explain.mp3`, script: "It is the piece that says, claws hook like coat hooks. Long curved claws that hook over a branch are a body part made for hanging, so that sentence backs up the idea." },
      interaction: { type: "choose", options: [{ id: "claws-hook-like-coat-hooks", label: "claws hook like coat hooks" }, { id: "a-meal-takes-many-days", label: "a meal takes many days" }, { id: "a-jaguar-can-catch-it", label: "a jaguar can catch it" }, { id: "it-is-a-strong-swimmer", label: "it is a strong swimmer" }], correctId: "claws-hook-like-coat-hooks", coachWrong: "That sentence is about something else. Which one tells about a body part that holds on to a branch?" },
    },
    {
      id: "h-3-put-together-tell",
      band: "harder",
      difficulty: 3,
      prompt: "What can you tell from those two sentences?",
      narration: { audio: `${Q}/h-3-put-together-tell.mp3`, script: "Put two sentences together, then tell what they show. The text says, sloths eat leaves, and leaves give a body very little energy. The text also says, a sloth moves so slowly that tiny green plants grow in its fur. What can you tell from those two sentences? Tap it." },
      hint: { audio: `${Q}/h-3-put-together-tell-hint.mp3`, script: "A sloth gets very little energy from its food. Think about why an animal with little energy would move the way it does." },
      explain: { audio: `${Q}/h-3-put-together-tell-explain.mp3`, script: "You can tell moving slowly saves energy. Leaves give the sloth very little energy, and the sloth moves very slowly, so moving slowly must help it use as little energy as possible." },
      interaction: { type: "choose", options: [{ id: "moving-slowly-saves-energy", label: "moving slowly saves energy" }, { id: "leaves-make-a-sloth-strong", label: "leaves make a sloth strong" }, { id: "a-sloth-eats-very-fast", label: "a sloth eats very fast" }, { id: "a-sloth-never-eats-leaves", label: "a sloth never eats leaves" }], correctId: "moving-slowly-saves-energy", coachWrong: "Neither sentence shows that. Put little energy together with moving slowly." },
    },
    {
      id: "h-4-speak-tell-and-back",
      band: "harder",
      difficulty: 4,
      prompt: "How would a sloth rather cross a river? Say what you can tell, then back it up.",
      narration: { audio: `${Q}/h-4-speak-tell-and-back.mp3`, script: "Last one, out loud. The text says, on the ground a sloth cannot walk, so it drags itself along with its claws. It also says, a sloth is a strong swimmer, and it can swim faster than it can crawl. Those sentences never say how a sloth would rather cross a river, but they let you tell. Tap the mic. Say what you can tell, then say the words from the text that back you up." },
      hint: { audio: `${Q}/h-4-speak-tell-and-back-hint.mp3`, script: "Compare the two ways a sloth can move. Which one is faster, and which words in the text say so?" },
      explain: { audio: `${Q}/h-4-speak-tell-and-back-explain.mp3`, script: "You can tell a sloth would rather swim across. The text says it is a strong swimmer and can swim faster than it can crawl, and that backs it up." },
      interaction: { type: "speak", text: "swim swims swimming swimmer swam water river faster fast quicker quick strong better easier safer safe crawl crawls crawling drag drags slow slower ground" },
    },
  ],
};
