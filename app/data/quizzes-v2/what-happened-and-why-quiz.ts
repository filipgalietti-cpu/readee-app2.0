import type { QuizDef } from "@/lib/lesson-engine/quiz";

// What Happened and Why QUIZ (RI.4.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge.
// ALL-FRESH second informational text, "The Rope That Was Cut" (the elevator
// safety brake; every fact true: two hundred years ago freight platforms hung
// from a rope over a wheel at the top of a shaft, hauled by a worker or a steam
// engine; worn ropes snapped and the platform crashed, so almost nobody would
// ride; an inventor who built hoists in a bed factory fixed a flat steel wagon
// spring on top of the platform, held bent by the pull of the rope, with a
// toothed rail bolted on each side of the shaft; rope tight = spring bent =
// platform slides; rope breaks = nothing holds the spring = it springs
// straight and jams its ends into the teeth = the platform stops with nobody
// pulling a lever; he rode the platform at a great fair inside a glass and
// iron hall and had a helper cut the rope with an axe, the platform dropped a
// few inches and hung there, and he called down that all was safe; a few years
// later the first elevator for people opened in a store and climbed five
// floors; buildings could then rise as high as the elevator could carry them;
// a machine that stops itself when something breaks is called fail-safe).
// 15 sentences over 5 pages under four spoken headings (Ropes That Broke / A
// Spring and Two Rails / The Rope That Was Cut / Buildings Grow Up), spoken
// page by page INSIDE the questions so every Q is self-contained (teaching
// first, the passage last in every clip); two sentences are the child's
// on-screen read-alouds and are NEVER narrated anywhere in the quiz (page
// one's second sentence about the wheel and the steam engine in e-4, page
// five's second sentence about the stairs in h-3). Bands: easier (G3-bridge
// WHAT happened at 3 options, picture support only in e-3 where the picture
// is the evidence, plus a one-sentence read-aloud) / core (on-grade G4: WHY an
// event happened, the specific words that show a why among four true
// fragments, the four-step procedure in order, why a step is built the way it
// is, what the concept fail-safe means in the child's words, and a production
// explanation speak in a two-link chain with a full accept list) / harder (G5
// transfer, RI.5.3 EXPLAINING THE RELATIONSHIP BETWEEN TWO EVENTS OR IDEAS
// using specific information: taught in h-1 on the fair and the store, then
// applied to the safety and taller buildings; applied again to the snapped
// ropes and the safety; the stairs sentence read aloud; a closing production
// speak on the relationship between the tight rope and the bent spring).
// Nothing from the lesson text (canals, locks, coal, horses) is reused. Topic
// grep-swept vs lessons-v2 + quizzes-v2: elevator only as image prose in a
// story, hoist only as a decode word, ratchet / wagon spring / fail-safe /
// glass hall 0 hits. No digits in child-read text, no real person named. Quiz
// support image lives in the lesson's image dir (quiz- key).

const Q = "/audio/quizzes-v2/what-happened-and-why-quiz";
const IMG = (w: string) => `/images/lessons-v2/what-happened-and-why/${w.toLowerCase()}.png`;

export const whatHappenedAndWhyQuiz: QuizDef = {
  id: "what-happened-and-why-quiz",
  lessonId: "what-happened-and-why",
  title: "What Happened and Why Quiz",
  standard: "RI.4.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-what-happened-rope-snapped",
      band: "easier",
      difficulty: 1,
      prompt: "What happened when a rope snapped?",
      narration: { audio: `${Q}/e-1-what-happened-rope-snapped.mp3`, script: "Here is page one of a new text called The Rope That Was Cut, under its first heading, Ropes That Broke. Listen for what happened when a rope snapped, and then tap the answer. Two hundred years ago, heavy loads in mills and warehouses were lifted on a platform that hung from a rope. Ropes wore thin and sometimes snapped, and when one did, the platform crashed to the bottom of the shaft, so almost nobody would ride on one." },
      hint: { audio: `${Q}/e-1-what-happened-rope-snapped-hint.mp3`, script: "The last sentence of the page tells what the platform did the moment the rope broke." },
      explain: { audio: `${Q}/e-1-what-happened-rope-snapped-explain.mp3`, script: "The text says that when a rope snapped, the platform crashed to the bottom of the shaft. The platform crashed down is the answer." },
      interaction: { type: "choose", options: [{ id: "the-platform-crashed-down", label: "the platform crashed down" }, { id: "the-platform-stopped-still", label: "the platform stopped still" }, { id: "the-rope-was-tied-again", label: "the rope was tied again" }], correctId: "the-platform-crashed-down", coachWrong: "Listen again to what the platform did when the rope broke, before anyone had built a safety." },
    },
    {
      id: "e-2-what-on-top-of-the-platform",
      band: "easier",
      difficulty: 2,
      prompt: "What did the inventor fix on top of the platform?",
      narration: { audio: `${Q}/e-2-what-on-top-of-the-platform.mp3`, script: "Page two opens the next heading, A Spring and Two Rails. Listen for what the inventor fixed on top of the platform, and then tap it. An inventor who built hoists in a bed factory came up with a safety. He fixed a flat steel spring, the kind that carried the weight of a wagon, on top of the platform, and the pull of the rope held that spring bent." },
      hint: { audio: `${Q}/e-2-what-on-top-of-the-platform-hint.mp3`, script: "The second sentence names the part, and it is the same kind of part that carried the weight of a wagon." },
      explain: { audio: `${Q}/e-2-what-on-top-of-the-platform-explain.mp3`, script: "The text says he fixed a flat steel spring on top of the platform. A flat steel spring is the answer." },
      interaction: { type: "choose", options: [{ id: "a-flat-steel-spring", label: "a flat steel spring" }, { id: "a-heavy-iron-wheel", label: "a heavy iron wheel" }, { id: "a-second-thick-rope", label: "a second thick rope" }], correctId: "a-flat-steel-spring", coachWrong: "Listen again for the part that went on top of the platform, the one that carried the weight of a wagon." },
    },
    {
      id: "e-3-what-the-helper-did",
      band: "easier",
      difficulty: 3,
      prompt: "What did the helper do at the fair?",
      image: IMG("quiz-platform-cut"),
      narration: { audio: `${Q}/e-3-what-the-helper-did.mp3`, script: "Page four opens the heading The Rope That Was Cut, and the picture shows the moment. Listen for what the helper did, and then tap the answer. Nobody believed that, so the inventor took his hoist to a great fair held inside a hall of glass and iron. He rode the platform high above the crowd and told a helper to cut the rope with an axe." },
      hint: { audio: `${Q}/e-3-what-the-helper-did-hint.mp3`, script: "The picture shows the helper up on the beam, and the tool in his hands tells what he did." },
      explain: { audio: `${Q}/e-3-what-the-helper-did-explain.mp3`, script: "The text says the inventor told a helper to cut the rope with an axe. Cut the rope with an axe is the answer." },
      interaction: { type: "choose", options: [{ id: "cut-the-rope-with-an-axe", label: "cut the rope with an axe" }, { id: "pulled-the-platform-up", label: "pulled the platform up" }, { id: "rang-a-bell-for-the-crowd", label: "rang a bell for the crowd" }], correctId: "cut-the-rope-with-an-axe", coachWrong: "Look at the man on the beam above the platform. What is he holding?" },
    },
    {
      id: "e-4-speak-read-the-wheel",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: The rope ran over a wheel at the top of the shaft, and a worker or a steam engine hauled it up.",
      narration: { audio: `${Q}/e-4-speak-read-the-wheel.mp3`, script: "The sentence on your screen is the middle sentence of page one. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-the-wheel-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words The rope ran." },
      explain: { audio: `${Q}/e-4-speak-read-the-wheel-explain.mp3`, script: "The sentence tells you that the rope ran over a wheel at the top of the shaft, and that a worker or a steam engine did the hauling." },
      interaction: { type: "speak", text: "The rope ran over a wheel at the top of the shaft and a worker or a steam engine hauled it up" },
    },
    {
      id: "c-1-why-nobody-would-ride",
      band: "core",
      difficulty: 1,
      prompt: "Why would almost nobody ride on a platform?",
      narration: { audio: `${Q}/c-1-why-nobody-would-ride.mp3`, script: "Fourth grade readers explain the why. Page one reports an event, almost nobody would ride on a platform, and the same page gives the reason. Four reasons are on your screen, and only one of them is what the page lets you say. Tap it after you hear page one. Two hundred years ago, heavy loads in mills and warehouses were lifted on a platform that hung from a rope. Ropes wore thin and sometimes snapped, and when one did, the platform crashed to the bottom of the shaft, so almost nobody would ride on one." },
      hint: { audio: `${Q}/c-1-why-nobody-would-ride-hint.mp3`, script: "The reason sits in the last sentence, right before the word so, and it is about what a rope could do." },
      explain: { audio: `${Q}/c-1-why-nobody-would-ride-explain.mp3`, script: "The reason is, a snapped rope meant a crash. The page says ropes snapped and the platform crashed, so nobody wanted to be standing on it when that happened." },
      interaction: { type: "choose", options: [{ id: "a-snapped-rope-meant-a-crash", label: "a snapped rope meant a crash" }, { id: "the-platform-was-too-small", label: "the platform was too small" }, { id: "the-rope-cost-too-much", label: "the rope cost too much" }, { id: "the-shaft-was-too-dark", label: "the shaft was too dark" }], correctId: "a-snapped-rope-meant-a-crash", coachWrong: "Page one never says that. Find the reason the page really gives, the one that comes right before the word so." },
    },
    {
      id: "c-2-words-that-show-why",
      band: "core",
      difficulty: 2,
      prompt: "Which words show why the spring stayed bent?",
      narration: { audio: `${Q}/c-2-words-that-show-why.mp3`, script: "An explanation needs specific information behind it. Page two says the spring stayed bent while the platform worked, and the page tells why. Four pieces of page two are on your screen, and every one of them is really on the page. Only one of them tells what held the spring bent. Tap those words after you hear page two. An inventor who built hoists in a bed factory came up with a safety. He fixed a flat steel spring, the kind that carried the weight of a wagon, on top of the platform, and the pull of the rope held that spring bent." },
      hint: { audio: `${Q}/c-2-words-that-show-why-hint.mp3`, script: "Bent is the last word of the page, so the words that tell what did the bending sit right before it." },
      explain: { audio: `${Q}/c-2-words-that-show-why-explain.mp3`, script: "The words are, the pull of the rope held. The rope pulling on the spring is what kept it bent, and the factory, the flat spring, and the wagon are true details that do not tell why." },
      interaction: { type: "choose", options: [{ id: "the-pull-of-the-rope-held", label: "the pull of the rope held" }, { id: "hoists-in-a-bed-factory", label: "hoists in a bed factory" }, { id: "a-flat-steel-spring", label: "a flat steel spring" }, { id: "the-weight-of-a-wagon", label: "the weight of a wagon" }], correctId: "the-pull-of-the-rope-held", coachWrong: "Those words are on the page, but they do not tell what held the spring bent. Listen to the end of the last sentence." },
    },
    {
      id: "c-3-steps-in-order",
      band: "core",
      difficulty: 3,
      prompt: "Put the steps of the safety in the order the text gives them.",
      narration: { audio: `${Q}/c-3-steps-in-order.mp3`, script: "Page three is a procedure, and a procedure only makes sense in order. Four steps from page three are on your screen, mixed up. Tap them in the order the text gives them, from the first thing that happens to the last, after you hear the page. As long as the rope was tight, the spring stayed bent and the platform slid up and down freely. The instant the rope broke, nothing held the spring, so it sprang straight and jammed its ends into the teeth of the rails. The platform stopped where it was, and nobody had to notice or pull a lever." },
      hint: { audio: `${Q}/c-3-steps-in-order-hint.mp3`, script: "Each step needs the one before it, so ask what has to break before the spring can move, and what the spring has to do before the platform can stop." },
      explain: { audio: `${Q}/c-3-steps-in-order-explain.mp3`, script: "The order is, the rope breaks, the spring springs straight, the ends jam into the teeth, and the platform stops. Each step causes the next one." },
      interaction: { type: "sequence", items: [{ id: "rope-breaks", label: "the rope breaks" }, { id: "spring-straight", label: "the spring springs straight" }, { id: "ends-jam", label: "the ends jam into the teeth" }, { id: "platform-stops", label: "the platform stops" }], order: ["rope-breaks","spring-straight","ends-jam","platform-stops"], coachWrong: "Ask what has to happen before each step can happen. Nothing moves until something breaks, and nothing stops until something catches." },
    },
    {
      id: "c-4-why-the-rails-have-teeth",
      band: "core",
      difficulty: 4,
      prompt: "Why do the rails have teeth?",
      narration: { audio: `${Q}/c-4-why-the-rails-have-teeth.mp3`, script: "Here is the why of a step. Page two says the inventor bolted a rail cut with teeth on each side of the shaft, and page three shows what those teeth are for. Four reasons are on your screen. Tap the one that page three lets you say, after you hear both parts. On each side of the shaft he bolted a rail cut with teeth like a saw. The instant the rope broke, nothing held the spring, so it sprang straight and jammed its ends into the teeth of the rails." },
      hint: { audio: `${Q}/c-4-why-the-rails-have-teeth-hint.mp3`, script: "Think about what the ends of the spring do when it springs straight, and what they would need on the rail to do it." },
      explain: { audio: `${Q}/c-4-why-the-rails-have-teeth-explain.mp3`, script: "The reason is, so the spring ends can catch. A smooth rail would let the spring slide, and the teeth give its ends something to jam into." },
      interaction: { type: "choose", options: [{ id: "so-the-spring-ends-can-catch", label: "so the spring ends can catch" }, { id: "so-the-rope-cannot-slip-off", label: "so the rope cannot slip off" }, { id: "so-the-platform-slides-fast", label: "so the platform slides fast" }, { id: "so-the-crowd-can-see-them", label: "so the crowd can see them" }], correctId: "so-the-spring-ends-can-catch", coachWrong: "Nothing on page three says that. Listen to what jams into the teeth, and ask why it needs them there." },
    },
    {
      id: "c-5-what-fail-safe-means",
      band: "core",
      difficulty: 5,
      prompt: "What does fail-safe mean?",
      narration: { audio: `${Q}/c-5-what-fail-safe-means.mp3`, script: "Now the concept. The last page names it, and explaining a concept means saying what it means in your own words. Four meanings are on your screen. Only one of them matches what the text says. Tap it after you hear the ending. Here is the last sentence of page five. After the safety, buildings could rise as high as the elevator could carry them, and a machine that stops itself when something breaks is still called fail-safe." },
      hint: { audio: `${Q}/c-5-what-fail-safe-means-hint.mp3`, script: "The sentence says what the machine does and when it does it, so match both parts." },
      explain: { audio: `${Q}/c-5-what-fail-safe-means-explain.mp3`, script: "Fail-safe means it stops when a part breaks. The machine does not stay unbroken and it does not mend itself, it simply stops safely the moment something fails." },
      interaction: { type: "choose", options: [{ id: "it-stops-when-a-part-breaks", label: "it stops when a part breaks" }, { id: "it-never-breaks-at-all", label: "it never breaks at all" }, { id: "it-warns-before-it-breaks", label: "it warns before it breaks" }, { id: "it-mends-the-part-that-broke", label: "it mends the part that broke" }], correctId: "it-stops-when-a-part-breaks", coachWrong: "Listen again to the last sentence. What does the machine do, and when?" },
    },
    {
      id: "c-6-speak-explain-the-stop",
      band: "core",
      difficulty: 6,
      prompt: "Why did the platform stop when the rope was cut? Explain it in two links.",
      narration: { audio: `${Q}/c-6-speak-explain-the-stop.mp3`, script: "Now build the chain out loud. Page four reports an event. The rope was cut, and the platform hung there instead of crashing. Tap the mic. Say what happened, then say why, using page three. Make two links. Start with what the spring did when nothing held it, and end with what that did to the platform. Here is page three. As long as the rope was tight, the spring stayed bent and the platform slid up and down freely. The instant the rope broke, nothing held the spring, so it sprang straight and jammed its ends into the teeth of the rails. The platform stopped where it was, and nobody had to notice or pull a lever." },
      hint: { audio: `${Q}/c-6-speak-explain-the-stop-hint.mp3`, script: "The spring and the teeth are the two links, so say what the spring did first and what its ends did next." },
      explain: { audio: `${Q}/c-6-speak-explain-the-stop-explain.mp3`, script: "One way to say it goes like this. When the rope was cut, nothing held the spring, so it sprang straight, and its ends jammed into the teeth of the rails, which held the platform where it was." },
      interaction: { type: "speak", text: "spring sprang springs straight bent rope broke cut loose slack held pull nothing ends jammed jam teeth rails rail stopped stop caught catch platform hung tight safe" },
    },
    {
      id: "h-1-relationship-taught",
      band: "harder",
      difficulty: 1,
      prompt: "How are the safety and taller buildings related?",
      narration: { audio: `${Q}/h-1-relationship-taught.mp3`, script: "Here is a fifth grade move. Fifth grade readers explain the relationship between two events, which means saying how one led to the other, using specific information. Watch me do it with the fair and the store. Page four says the crowd watched the platform hang there after the rope was cut, and page five says the first elevator for people opened in a store a few years later. The fair proved the safety worked, so people were willing to ride, so a store could open one. Your turn with the safety and taller buildings. Four statements are on your screen, and only one tells that relationship the way page five gives it. Tap it after you hear the sentence from page five. After the safety, buildings could rise as high as the elevator could carry them." },
      hint: { audio: `${Q}/h-1-relationship-taught-hint.mp3`, script: "A relationship has a direction, so ask which one came first on page five and what it made possible." },
      explain: { audio: `${Q}/h-1-relationship-taught-explain.mp3`, script: "The relationship is, the safety let buildings grow. Page five says that after the safety, buildings could rise as high as the elevator could carry them, so the safety came first and the tall buildings followed." },
      interaction: { type: "choose", options: [{ id: "safety-let-buildings-grow", label: "safety let buildings grow" }, { id: "tall-buildings-came-first", label: "tall buildings came first" }, { id: "the-two-are-not-connected", label: "the two are not connected" }, { id: "a-store-made-buildings-tall", label: "a store made buildings tall" }], correctId: "safety-let-buildings-grow", coachWrong: "Check the direction. Page five says after the safety, so which one came first, and what did it make possible?" },
    },
    {
      id: "h-2-relationship-ropes-and-safety",
      band: "harder",
      difficulty: 2,
      prompt: "How are the snapped ropes and the safety related?",
      narration: { audio: `${Q}/h-2-relationship-ropes-and-safety.mp3`, script: "Explain a relationship again. Page one tells about ropes that snapped, and page two tells about the safety. Four statements are on your screen. Only one tells how those two are related, using what the pages say. Tap it after you hear both parts. Ropes wore thin and sometimes snapped, and when one did, the platform crashed to the bottom of the shaft, so almost nobody would ride on one. An inventor who built hoists in a bed factory came up with a safety." },
      hint: { audio: `${Q}/h-2-relationship-ropes-and-safety-hint.mp3`, script: "A safety is built to solve a problem, so ask which of the two was the problem and which was the answer to it." },
      explain: { audio: `${Q}/h-2-relationship-ropes-and-safety-explain.mp3`, script: "The relationship is, the crashes led to a safety. The ropes snapped and platforms crashed first, and the inventor came up with the safety because of that problem." },
      interaction: { type: "choose", options: [{ id: "the-crashes-led-to-a-safety", label: "the crashes led to a safety" }, { id: "the-safety-caused-crashes", label: "the safety caused crashes" }, { id: "the-crashes-ended-all-hoists", label: "the crashes ended all hoists" }, { id: "the-two-are-not-connected", label: "the two are not connected" }], correctId: "the-crashes-led-to-a-safety", coachWrong: "Check the direction and the pages. Which one happened first, and which one was built because of the other?" },
    },
    {
      id: "h-3-speak-read-the-stairs",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Before the safety, a building was only as tall as the stairs people were willing to climb.",
      narration: { audio: `${Q}/h-3-speak-read-the-stairs.mp3`, script: "The sentence on your screen is the middle sentence of page five. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/h-3-speak-read-the-stairs-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Before the safety." },
      explain: { audio: `${Q}/h-3-speak-read-the-stairs-explain.mp3`, script: "The sentence tells you that before the safety, a building could only be as tall as people were willing to climb on foot." },
      interaction: { type: "speak", text: "Before the safety a building was only as tall as the stairs people were willing to climb" },
    },
    {
      id: "h-4-speak-rope-and-spring",
      band: "harder",
      difficulty: 4,
      prompt: "How are the tight rope and the bent spring related? Explain it out loud.",
      narration: { audio: `${Q}/h-4-speak-rope-and-spring.mp3`, script: "Last one, out loud, and this time explain a relationship between two ideas. Tap the mic. Say how the tight rope and the bent spring are related, using the words the text gives you. Tell what the rope does to the spring while it is tight, and what happens to the spring the moment the rope breaks. Here are the two sentences. The pull of the rope held that spring bent. The instant the rope broke, nothing held the spring, so it sprang straight." },
      hint: { audio: `${Q}/h-4-speak-rope-and-spring-hint.mp3`, script: "The rope is the thing doing the holding, so say what it holds while it is tight and what stops being held when it breaks." },
      explain: { audio: `${Q}/h-4-speak-rope-and-spring-explain.mp3`, script: "One way to say it goes like this. The pull of the tight rope is what holds the spring bent, so the moment the rope breaks, nothing holds the spring, and it springs straight." },
      interaction: { type: "speak", text: "rope tight pull pulls pulling held holds hold bent bend bends spring straight breaks broke break loose slack free nothing springs sprang jams teeth" },
    },
  ],
};
