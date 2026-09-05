import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Word Connections QUIZ (L.3.5) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// ONE connection per item, 3-opt, 3 picture supports) / core(on-grade G3:
// which-connection twice, a saying's plain meaning, the because for a
// real-life example, a 6-item Near the Same / The Opposite sort, and a
// production speak) / harder(G4 transfer TAUGHT in the stimulus first,
// L.4.5a: a simile and a metaphor are each explained on one sentence and
// then applied on the next, closing with a production speak that builds a
// simile). ALL stimuli FRESH vs the lesson (sharp, tight, safe, clear,
// proud, sit tight, better safe than sorry, loud and clear, proud as a
// peacock, sharp as a tack, the derby) and grep-swept vs the whole catalog.
// Second text: "The Tire Swing" (Esme, cousin Benji, Aunt Ramona, the
// swimming hole at the reservoir) spoken page by page inside the questions
// that need it. Quiz words: deep (opposite shallow from the text), bright
// (near-same shining, look on the bright side), wild (real-life example +
// because, the rabbit), hungry (hungry as a bear, Near the Same / The
// Opposite sort). Names fresh: Esme, Benji, Ramona. Tiles lowercase,
// audio-free, kebab ids, 28-char cap; bucket clips are quiz-local b-*.mp3
// pre-synthed from punctuated labels before quiz-tts ran.

const Q = "/audio/quizzes-v2/word-connections-quiz";
const IMG = (w: string) => `/images/lessons-v2/word-connections/${w.toLowerCase()}.png`;

export const wordConnectionsQuiz: QuizDef = {
  id: "word-connections-quiz",
  lessonId: "word-connections",
  title: "Word Connections Quiz",
  standard: "L.3.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-opposite-deep",
      band: "easier",
      difficulty: 1,
      prompt: "Which word is the opposite of deep?",
      image: IMG("quiz-swing-pool"),
      narration: { audio: `${Q}/e-1-opposite-deep.mp3`, script: "Listen. On the hottest Sunday in August, Aunt Ramona drove Esme and her cousin Benji to the swimming hole at the reservoir, where an old tire hung from a rope over the water. The water under the tire was deep, so dark that nobody could see the bottom, but the water by the pebbly shore was shallow enough to show every stone. Tap the word that is the opposite of deep." },
      hint: { audio: `${Q}/e-1-opposite-deep-hint.mp3`, script: "The opposite of deep is sitting in the same sentence. Listen for the word about the water by the shore." },
      explain: { audio: `${Q}/e-1-opposite-deep-explain.mp3`, script: "Shallow is the opposite of deep. The deep water hid the bottom, and the shallow water showed every stone." },
      interaction: { type: "choose", options: [{ id: "shallow", label: "shallow" }, { id: "dark", label: "dark" }, { id: "wet", label: "wet" }], correctId: "shallow", coachWrong: "That word is about the water too, but it does not point the other way from deep. Which word describes water that shows every stone?" },
    },
    {
      id: "e-2-near-same-bright",
      band: "easier",
      difficulty: 2,
      prompt: "Which word means nearly the same as bright?",
      narration: { audio: `${Q}/e-2-near-same-bright.mp3`, script: "Listen. The afternoon sun was bright on the water, so bright that Esme had to shade her eyes with both hands to watch. Tap the word that means nearly the same as bright." },
      hint: { audio: `${Q}/e-2-near-same-bright-hint.mp3`, script: "Bright light makes you shade your eyes. Which word is also about strong light?" },
      explain: { audio: `${Q}/e-2-near-same-bright-explain.mp3`, script: "Shining means nearly the same as bright. Dim is the opposite, and wet is about water, not light." },
      interaction: { type: "choose", options: [{ id: "shining", label: "shining" }, { id: "dim", label: "dim" }, { id: "wet", label: "wet" }], correctId: "shining", coachWrong: "Picture the sun on the water. Which word could take the place of bright and keep the sentence the same?" },
    },
    {
      id: "e-3-example-wild",
      band: "easier",
      difficulty: 3,
      prompt: "Which real-life example fits wild?",
      image: IMG("quiz-wild-rabbit"),
      narration: { audio: `${Q}/e-3-example-wild.mp3`, script: "Listen. A wild rabbit darted out of the tall grass beside the path, froze, and vanished again before Benji could point. Wild means living free in nature, not kept by people. Three animals are on your screen. Tap the real-life example that fits wild." },
      hint: { audio: `${Q}/e-3-example-wild-hint.mp3`, script: "Wild animals are not kept or fed by people. Which one lives on its own?" },
      explain: { audio: `${Q}/e-3-example-wild-explain.mp3`, script: "A hawk in the sky is wild, because nobody keeps it or feeds it. A dog on a leash and a fish in a tank are cared for by people." },
      interaction: { type: "choose", options: [{ id: "a-hawk-in-the-sky", label: "a hawk in the sky" }, { id: "a-dog-on-a-leash", label: "a dog on a leash" }, { id: "a-fish-in-a-tank", label: "a fish in a tank" }], correctId: "a-hawk-in-the-sky", coachWrong: "Somebody takes care of that animal. Which animal takes care of itself?" },
    },
    {
      id: "e-4-saying-hungry-bear",
      band: "easier",
      difficulty: 4,
      prompt: "What does hungry as a bear mean?",
      image: IMG("quiz-picnic-basket"),
      narration: { audio: `${Q}/e-4-saying-hungry-bear.mp3`, script: "Listen. By four o'clock the cousins were as hungry as bears, and Aunt Ramona opened the picnic basket before either of them could ask. Hungry as a bear is a saying that uses the word hungry. Tap what it means." },
      hint: { audio: `${Q}/e-4-saying-hungry-bear-hint.mp3`, script: "Think about a bear that has not eaten all winter. How does it feel?" },
      explain: { audio: `${Q}/e-4-saying-hungry-bear-explain.mp3`, script: "Hungry as a bear means very hungry. Nobody grows fur and nobody falls asleep. The bear is there to make hungry bigger." },
      interaction: { type: "choose", options: [{ id: "very-hungry", label: "very hungry" }, { id: "very-furry", label: "very furry" }, { id: "very-sleepy", label: "very sleepy" }], correctId: "very-hungry", coachWrong: "The saying still has the word hungry inside it. The bear only makes that word bigger." },
    },
    {
      id: "c-1-which-connection-deep",
      band: "core",
      difficulty: 1,
      prompt: "Which connection is this question asking for?",
      narration: { audio: `${Q}/c-1-which-connection-deep.mp3`, script: "Listen. The water under the tire was deep, so dark that nobody could see the bottom. Here is a question about deep. Give me a word that means the reverse of deep, a word for the water by the shore. Do not answer the question yet. Tap the kind of connection the question is asking for." },
      hint: { audio: `${Q}/c-1-which-connection-deep-hint.mp3`, script: "The question wants the reverse of deep. Which connection points the other way?" },
      explain: { audio: `${Q}/c-1-which-connection-deep-explain.mp3`, script: "Its opposite. A word that means the reverse of deep is the opposite connection, and the story gives it in the shallow water by the shore." },
      interaction: { type: "choose", options: [{ id: "its-opposite", label: "its opposite" }, { id: "a-saying", label: "a saying" }, { id: "a-real-life-example", label: "a real-life example" }, { id: "a-near-same-word", label: "a near-same word" }], correctId: "its-opposite", coachWrong: "Reverse means pointing the other way from deep. Which kind of connection does that?" },
    },
    {
      id: "c-2-saying-bright-side",
      band: "core",
      difficulty: 2,
      prompt: "What does look on the bright side mean?",
      narration: { audio: `${Q}/c-2-saying-bright-side.mp3`, script: "Listen. Benji climbed onto the tire, swung out over the deep part, and let go with a yell, and the ride was so wild that his towel flew off the branch. When he came up sputtering, Aunt Ramona said, look on the bright side, at least the towel landed on the rocks and not in the water. Look on the bright side is a saying that uses bright. Picture it, then tap what the saying means." },
      hint: { audio: `${Q}/c-2-saying-bright-side-hint.mp3`, script: "Could Aunt Ramona mean a real sunny side of the swimming hole? Then find what she pointed out about the towel." },
      explain: { audio: `${Q}/c-2-saying-bright-side-explain.mp3`, script: "See the good in a bad moment. The towel was gone from the branch, but it stayed dry, and Aunt Ramona pointed at that good part." },
      interaction: { type: "choose", options: [{ id: "see-the-good-in-a-bad-moment", label: "see the good in a bad moment" }, { id: "stand-in-the-sunny-spot", label: "stand in the sunny spot" }, { id: "turn-on-a-bright-light", label: "turn on a bright light" }, { id: "look-straight-at-the-sun", label: "look straight at the sun" }], correctId: "see-the-good-in-a-bad-moment", coachWrong: "Picture that one. Nobody was looking for sunshine. What did Aunt Ramona want Benji to notice about the towel?" },
    },
    {
      id: "c-3-because-wild-rabbit",
      band: "core",
      difficulty: 3,
      prompt: "Why does wild fit the rabbit?",
      narration: { audio: `${Q}/c-3-because-wild-rabbit.mp3`, script: "Listen. A wild rabbit darted out of the tall grass beside the path, froze, and vanished again before Benji could point. Wild is the word, and the rabbit is the real-life example. Now you need the because. Four reasons are on your screen, and all of them could be true, but only one of them is why the word wild fits. Tap that because." },
      hint: { audio: `${Q}/c-3-because-wild-rabbit-hint.mp3`, script: "Wild is about how an animal lives, not how it looks or how it moves." },
      explain: { audio: `${Q}/c-3-because-wild-rabbit-explain.mp3`, script: "Nobody keeps it or feeds it. That is what wild means, living free, and it is the only reason about how the rabbit lives." },
      interaction: { type: "choose", options: [{ id: "nobody-keeps-it-or-feeds-it", label: "nobody keeps it or feeds it" }, { id: "it-has-long-soft-ears", label: "it has long soft ears" }, { id: "it-hopped-across-the-path", label: "it hopped across the path" }, { id: "it-was-brown-and-white", label: "it was brown and white" }], correctId: "nobody-keeps-it-or-feeds-it", coachWrong: "That could be true of a pet rabbit too. Which reason could only be true of an animal that lives free?" },
    },
    {
      id: "c-4-sort-hungry",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Near the Same as hungry, or The Opposite?",
      narration: { audio: `${Q}/c-4-sort-hungry.mp3`, script: "Listen. By four o'clock the cousins were as hungry as bears, and after the picnic Esme said she felt stuffed. Six words and phrases are on your screen. Picture the person each one describes. If it means nearly the same as hungry, drag it to Near the Same. If it means the opposite of hungry, drag it to The Opposite." },
      hint: { audio: `${Q}/c-4-sort-hungry-hint.mp3`, script: "Picture the person that phrase describes. Does that person want to eat, or has that person eaten plenty?" },
      explain: { audio: `${Q}/c-4-sort-hungry-explain.mp3`, script: "Starving, ready for a snack, and a growling stomach all mean nearly the same as hungry. Stuffed, done eating, and no room for more are the opposite." },
      interaction: { type: "sort", buckets: ["Near the Same","The Opposite"], bucketAudio: { "Near the Same": `${Q}/b-near-the-same.mp3`, "The Opposite": `${Q}/b-the-opposite.mp3` }, items: [{ label: "starving", bucket: "Near the Same" }, { label: "stuffed", bucket: "The Opposite" }, { label: "ready for a snack", bucket: "Near the Same" }, { label: "done eating", bucket: "The Opposite" }, { label: "a growling stomach", bucket: "Near the Same" }, { label: "no room for more", bucket: "The Opposite" }], coachWrong: "Picture the person that phrase describes. Does that person want to eat, or has that person eaten plenty?" },
    },
    {
      id: "c-5-which-connection-bright",
      band: "core",
      difficulty: 5,
      prompt: "Which connection is this question asking for?",
      narration: { audio: `${Q}/c-5-which-connection-bright.mp3`, script: "Listen. The afternoon sun was bright on the water, so bright that Esme had to shade her eyes. Here is a question about bright. Tell me about a time in your own life when something was bright, and say why the word fits. Do not answer the question yet. Tap the kind of connection the question is asking for." },
      hint: { audio: `${Q}/c-5-which-connection-bright-hint.mp3`, script: "The question asks for something from your own life and a why. Which connection is built from those two parts?" },
      explain: { audio: `${Q}/c-5-which-connection-bright-explain.mp3`, script: "A real-life example. Something from your own life plus a because is the real-life connection." },
      interaction: { type: "choose", options: [{ id: "a-real-life-example", label: "a real-life example" }, { id: "a-saying", label: "a saying" }, { id: "a-near-same-word", label: "a near-same word" }, { id: "its-opposite", label: "its opposite" }], correctId: "a-real-life-example", coachWrong: "The question does not want another word at all. It wants a moment from your life and a why. Which connection is that?" },
    },
    {
      id: "c-6-speak-deep-connection",
      band: "core",
      difficulty: 6,
      prompt: "Give one connection for deep, and name which kind it is.",
      narration: { audio: `${Q}/c-6-speak-deep-connection.mp3`, script: "Listen. Benji swung out over the deep part of the swimming hole and let go with a yell. Deep. Tap the mic, give one connection for deep, any of the four, and then name which kind it is." },
      hint: { audio: `${Q}/c-6-speak-deep-connection-hint.mp3`, script: "Pick the easiest one. A word that points the other way from deep, or a place from your own life that is deep and why." },
      explain: { audio: `${Q}/c-6-speak-deep-connection-explain.mp3`, script: "Any of these works. Shallow is the opposite. Bottomless is a near-same word. A swimming pool is a real-life example, because your feet cannot touch the bottom. Deep down is a saying that means truly, in your heart." },
      interaction: { type: "speak", text: "deep saying down heart truly opposite shallow near same nearly bottomless low far example because pool ocean lake sea hole well dig dug bottom real life word means reverse" },
    },
    {
      id: "h-1-simile-taught-slingshot",
      band: "harder",
      difficulty: 1,
      prompt: "What does the simile show about Benji?",
      narration: { audio: `${Q}/h-1-simile-taught-slingshot.mp3`, script: "Here is a fourth grade connection. A simile compares two things with the word like or as, to show one thing about them. Watch. The water under the tire was as dark as the inside of a boot. That simile is about the water, and it compares the water to the inside of a boot to show that you could not see into it. Now you. Listen. Benji flew off the tire like a stone from a slingshot. That simile is about Benji. Tap what it shows about how he moved." },
      hint: { audio: `${Q}/h-1-simile-taught-slingshot-hint.mp3`, script: "A stone from a slingshot does one thing. It flies. Which choice is about flying fast?" },
      explain: { audio: `${Q}/h-1-simile-taught-slingshot-explain.mp3`, script: "He shot out fast and hard. A slingshot fires a stone fast, so the simile shows Benji's speed, not his weight." },
      interaction: { type: "choose", options: [{ id: "he-shot-out-fast-and-hard", label: "he shot out fast and hard" }, { id: "he-sank-straight-down", label: "he sank straight down" }, { id: "he-was-heavy-like-a-rock", label: "he was heavy like a rock" }, { id: "he-moved-slow-and-careful", label: "he moved slow and careful" }], correctId: "he-shot-out-fast-and-hard", coachWrong: "The simile picks one thing about a stone from a slingshot. Not its weight, not its color. What does that stone do?" },
    },
    {
      id: "h-2-metaphor-taught-soup",
      band: "harder",
      difficulty: 2,
      prompt: "What does the metaphor show about the water?",
      narration: { audio: `${Q}/h-2-metaphor-taught-soup.mp3`, script: "A metaphor compares without like or as. It says one thing is another. Watch. The sun was a lamp with no switch. The sun is not really a lamp, but the metaphor shows that it kept shining and nobody could turn it off. Now you. Listen. The swimming hole was a bowl of cold soup. Tap what that metaphor shows about the water." },
      hint: { audio: `${Q}/h-2-metaphor-taught-soup-hint.mp3`, script: "What is true about soup in a bowl that could also be true about water in a swimming hole? Think about the shape and the temperature." },
      explain: { audio: `${Q}/h-2-metaphor-taught-soup-explain.mp3`, script: "Cold and held in a dip. A bowl holds soup the way the rocks hold the water, and cold soup tells the temperature." },
      interaction: { type: "choose", options: [{ id: "cold-and-held-in-a-dip", label: "cold and held in a dip" }, { id: "tasted-just-like-soup", label: "tasted just like soup" }, { id: "cooked-by-somebody", label: "cooked by somebody" }, { id: "warm-as-a-bath", label: "warm as a bath" }], correctId: "cold-and-held-in-a-dip", coachWrong: "A metaphor shows something true, not something silly. What is really true about both a bowl of cold soup and a swimming hole?" },
    },
    {
      id: "h-3-metaphor-brown-streak",
      band: "harder",
      difficulty: 3,
      prompt: "What does the metaphor show about the rabbit?",
      narration: { audio: `${Q}/h-3-metaphor-brown-streak.mp3`, script: "One more metaphor, and this time nobody explains it first. Listen. The rabbit was a brown streak across the path. A streak is a fast smear of color, the kind a wet paintbrush leaves. Tap what the metaphor shows about the rabbit." },
      hint: { audio: `${Q}/h-3-metaphor-brown-streak-hint.mp3`, script: "When does something look like a streak instead of a shape? Think about what your eyes can and cannot catch." },
      explain: { audio: `${Q}/h-3-metaphor-brown-streak-explain.mp3`, script: "The rabbit moved too fast to see clearly. A streak is what a fast thing looks like, so the metaphor is about speed, not paint or size." },
      interaction: { type: "choose", options: [{ id: "it-moved-too-fast-to-see", label: "it moved too fast to see" }, { id: "it-was-painted-brown", label: "it was painted brown" }, { id: "it-was-long-and-thin", label: "it was long and thin" }, { id: "it-left-mud-on-the-path", label: "it left mud on the path" }], correctId: "it-moved-too-fast-to-see", coachWrong: "The rabbit is not paint and it is not a line. Why would a running rabbit look like a streak?" },
    },
    {
      id: "h-4-speak-make-a-simile",
      band: "harder",
      difficulty: 4,
      prompt: "Make your own simile for hungry, and say what it shows.",
      narration: { audio: `${Q}/h-4-speak-make-a-simile.mp3`, script: "Last one, and you build the simile. Hungry as a bear is one simile for hungry. Now make your own. Tap the mic and say, Benji was as hungry as, then finish it with your own comparison, and then say what your simile shows about Benji." },
      hint: { audio: `${Q}/h-4-speak-make-a-simile-hint.mp3`, script: "Pick an animal or a thing that everybody knows eats a lot, put it after as hungry as, and then say what that tells about Benji." },
      explain: { audio: `${Q}/h-4-speak-make-a-simile-explain.mp3`, script: "Benji was as hungry as a wolf, and that shows he wanted to eat right away. Any comparison to a big eater works, as long as you say what it shows." },
      interaction: { type: "speak", text: "hungry bear wolf lion shark dog horse tiger dinosaur monster giant whale elephant as like eat eating eats starving empty stomach food snack lunch dinner very shows means wanted" },
    },
  ],
};
