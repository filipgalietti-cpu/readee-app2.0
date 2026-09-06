import type { QuizDef } from "@/lib/lesson-engine/quiz";

// When and Where Words QUIZ (L.3.6) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt when-or-where and which-where-word-fits with 3 picture supports) /
// core(on-grade G3: which-word-fits when, which-word-fits where, When Word /
// Where Word sort, the misuse spotter, events-in-order sequence from their
// when-words, production speak) / harder(G4 transfer TAUGHT in the stimulus
// first, L.4.6: precise ACTION and EMOTION words that replace a plain said
// (stammered / grumbled / beamed / pleaded) and DOMAIN words basic to a topic
// (wildlife / conservation / endangered / habitat), modeled then applied,
// closing with a production speak). ALL stimuli FRESH vs the lesson (no
// Junie, no Canal Street, none of the lesson's taught words as quiz targets)
// and grep-swept vs the whole catalog. Quiz when-words: immediately, just
// then, in the meantime, by nightfall, long after, as soon as. Quiz where-
// words: underneath, downstairs, around the corner, across from, in the
// distance, on the far side. Frame: Sabine and her cousin Nestor visit the
// Pinecone Ridge Wildlife Rescue Center on the far side of the river, where
// Aunt Loretta works (a bobcat kitten under a heat lamp, a hawk with a mended
// wing, a screech, a feeding bucket). Names Sabine, Nestor, Loretta fresh.
// Tiles lowercase, audio-free, kebab ids; bucket clips are quiz-local
// b-*.mp3 pre-synthed from punctuated labels; every stimulus is spoken
// inside its own question (no earlier-question recall).

const Q = "/audio/quizzes-v2/when-and-where-words-quiz";
const IMG = (w: string) => `/images/lessons-v2/when-and-where-words/${w.toLowerCase()}.png`;

export const whenAndWhereWordsQuiz: QuizDef = {
  id: "when-and-where-words-quiz",
  lessonId: "when-and-where-words",
  title: "When and Where Words Quiz",
  standard: "L.3.6",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-center-far-side",
      band: "easier",
      difficulty: 1,
      prompt: "Where is the rescue center?",
      image: IMG("quiz-center-far-side-of-river"),
      narration: { audio: `${Q}/e-1-center-far-side.mp3`, script: "Listen. Sabine and her cousin Nestor rode the bus to the wildlife rescue center where Aunt Loretta works. Look at the picture. The bus is crossing the bridge, and the center is the building with the green roof. Where is the rescue center?" },
      hint: { audio: `${Q}/e-1-center-far-side-hint.mp3`, script: "Find the green roof in the picture. Is it on this side of the water, or past it?" },
      explain: { audio: `${Q}/e-1-center-far-side-explain.mp3`, script: "The center is on the far side of the river, because the bus has to cross the whole bridge to reach the green roof." },
      interaction: { type: "choose", options: [{ id: "on-the-far-side-of-the-river", label: "on the far side of the river" }, { id: "underneath-the-bridge", label: "underneath the bridge" }, { id: "in-the-middle-of-the-river", label: "in the middle of the river" }], correctId: "on-the-far-side-of-the-river", coachWrong: "Look at the picture again. The bus is still on the bridge. Where does it end up?" },
    },
    {
      id: "e-2-kitten-underneath",
      band: "easier",
      difficulty: 2,
      prompt: "Which words tell where the kitten sleeps?",
      image: IMG("quiz-bobcat-under-heat-lamp"),
      narration: { audio: `${Q}/e-2-kitten-underneath.mp3`, script: "Listen. Aunt Loretta showed them a bobcat kitten asleep in a warm pen. Look at the picture. A red heat lamp hangs above the kitten. Which words tell where the kitten sleeps?" },
      hint: { audio: `${Q}/e-2-kitten-underneath-hint.mp3`, script: "The lamp is above the kitten. So where is the kitten compared to the lamp?" },
      explain: { audio: `${Q}/e-2-kitten-underneath-explain.mp3`, script: "The kitten sleeps underneath the lamp, because the lamp hangs above it and the warm light shines down on it." },
      interaction: { type: "choose", options: [{ id: "underneath-the-lamp", label: "underneath the lamp" }, { id: "across-from-the-lamp", label: "across from the lamp" }, { id: "in-the-distance", label: "in the distance" }], correctId: "underneath-the-lamp", coachWrong: "Find the lamp in the picture. Is the kitten far away from it, or right below it?" },
    },
    {
      id: "e-3-which-tells-when",
      band: "easier",
      difficulty: 3,
      prompt: "Which word tells WHEN?",
      narration: { audio: `${Q}/e-3-which-tells-when.mp3`, script: "Listen. Three words are on your screen. Two of them tell where something is. Only one of them tells when something happened. Tap the word that tells when." },
      hint: { audio: `${Q}/e-3-which-tells-when-hint.mp3`, script: "Put each word in a sentence. Two of them name a place. One of them names a time." },
      explain: { audio: `${Q}/e-3-which-tells-when-explain.mp3`, script: "Immediately tells when, because it means right away, with no wait. Underneath and downstairs both name a place." },
      interaction: { type: "choose", options: [{ id: "immediately", label: "immediately" }, { id: "underneath", label: "underneath" }, { id: "downstairs", label: "downstairs" }], correctId: "immediately", coachWrong: "That word names a place, so it tells where. You want the word that tells when." },
    },
    {
      id: "e-4-hawk-across-from",
      band: "easier",
      difficulty: 4,
      prompt: "The hawk's pen is ___ the gate. Which words fit?",
      image: IMG("quiz-hawk-across-from-gate"),
      narration: { audio: `${Q}/e-4-hawk-across-from.mp3`, script: "Listen. Look at the picture. A gravel path runs between the entrance gate and the hawk's pen, with the gate on one side and the pen on the other. Here is the sentence. The hawk's pen is blank the gate. Tap the words that fit the hole." },
      hint: { audio: `${Q}/e-4-hawk-across-from-hint.mp3`, script: "The gate is on one side of the path, and the pen is on the other side. Which words say that?" },
      explain: { audio: `${Q}/e-4-hawk-across-from-explain.mp3`, script: "The pen is across from the gate, because the path runs between them with one on each side. The pen is not under the gate, and it is not far off in the distance." },
      interaction: { type: "choose", options: [{ id: "across-from", label: "across from" }, { id: "underneath", label: "underneath" }, { id: "in-the-distance", label: "in the distance" }], correctId: "across-from", coachWrong: "Look at the path in the picture. The gate and the pen sit on its two sides, close together. Which words fit that?" },
    },
    {
      id: "c-1-when-word-fits",
      band: "core",
      difficulty: 1,
      prompt: "The hawk screeched, and ___ Nestor jumped back from the fence.",
      narration: { audio: `${Q}/c-1-when-word-fits.mp3`, script: "Here is a sentence with a hole in it, and the sentence is on your screen too. The hawk screeched, and blank, Nestor jumped back from the fence. Think about how fast a person jumps when a hawk screeches. Four when-words are on your screen. Tap the one that makes the sentence precise." },
      hint: { audio: `${Q}/c-1-when-word-fits-hint.mp3`, script: "A screech makes a person jump right away, with no wait at all. Which when-word carries that shade?" },
      explain: { audio: `${Q}/c-1-when-word-fits-explain.mp3`, script: "Immediately fits, because a person jumps the instant a hawk screeches. Long after and by nightfall put the jump far too late, and in the meantime would need two things happening at once." },
      interaction: { type: "choose", options: [{ id: "immediately", label: "immediately" }, { id: "in-the-meantime", label: "in the meantime" }, { id: "long-after", label: "long after" }, { id: "by-nightfall", label: "by nightfall" }], correctId: "immediately", coachWrong: "Say the shade of that word. Does a person wait that long to jump when a hawk screeches?" },
    },
    {
      id: "c-2-where-word-fits",
      band: "core",
      difficulty: 2,
      prompt: "Aunt Loretta keeps the food bins ___, so she climbs the stairs with every bucket.",
      narration: { audio: `${Q}/c-2-where-word-fits.mp3`, script: "Now a where-word, and the sentence is on your screen. Aunt Loretta keeps the food bins blank, so she climbs the stairs with every bucket. The clue is the stairs. Four where-words are on your screen. Tap the one that makes the sentence precise." },
      hint: { audio: `${Q}/c-2-where-word-fits-hint.mp3`, script: "She climbs stairs to get from the bins to the animals. So the bins sit on a lower floor. Which where-word says that?" },
      explain: { audio: `${Q}/c-2-where-word-fits-explain.mp3`, script: "Downstairs fits, because she climbs the stairs with every bucket, so the bins are on the floor below. Around the corner, across from, and in the distance do not need any stairs." },
      interaction: { type: "choose", options: [{ id: "downstairs", label: "downstairs" }, { id: "around-the-corner", label: "around the corner" }, { id: "across-from", label: "across from" }, { id: "in-the-distance", label: "in the distance" }], correctId: "downstairs", coachWrong: "Use the clue. Would she need to climb stairs if the bins were there?" },
    },
    {
      id: "c-3-sort-when-or-where",
      band: "core",
      difficulty: 3,
      prompt: "Sort: When Word or Where Word.",
      narration: { audio: `${Q}/c-3-sort-when-or-where.mp3`, script: "Six words from the day at the rescue center are on your screen. If a word tells when something happened, drag it to When Word. If a word tells where something is, drag it to Where Word." },
      hint: { audio: `${Q}/c-3-sort-when-or-where-hint.mp3`, script: "Put the word in a sentence. Does it answer the question when, or the question where?" },
      explain: { audio: `${Q}/c-3-sort-when-or-where-explain.mp3`, script: "Just then, by nightfall, and long after all tell when. Around the corner, across from, and in the distance all tell where." },
      interaction: { type: "sort", buckets: ["When Word","Where Word"], bucketAudio: { "When Word": `${Q}/b-when-word.mp3`, "Where Word": `${Q}/b-where-word.mp3` }, items: [{ label: "just then", bucket: "When Word" }, { label: "around the corner", bucket: "Where Word" }, { label: "by nightfall", bucket: "When Word" }, { label: "across from", bucket: "Where Word" }, { label: "long after", bucket: "When Word" }, { label: "in the distance", bucket: "Where Word" }], coachWrong: "Say a sentence with that word. Does it name a time, or a place?" },
    },
    {
      id: "c-4-misuse-spotter",
      band: "core",
      difficulty: 4,
      prompt: "Which sentence uses its word wrongly?",
      narration: { audio: `${Q}/c-4-misuse-spotter.mp3`, script: "A precise word only works when its shade is true. Here are four sentences from the day. One. The vet wrapped the hawk's wing, and in the meantime Nestor watched the bobcat. Two. Sabine saw the ridge in the distance, far past the pens. Three. Nestor spotted a mouse in the distance, right beside his shoe. Four. As soon as the bus stopped, the doors swung open. Three of those use their word correctly. Tap the one that uses its word wrongly." },
      hint: { audio: `${Q}/c-4-misuse-spotter-hint.mp3`, script: "Check each where-word and when-word against the rest of its sentence. One sentence says far and close at the same time." },
      explain: { audio: `${Q}/c-4-misuse-spotter-explain.mp3`, script: "The mouse sentence uses its word wrongly, because in the distance means far away, but the mouse was right beside his shoe. The ridge really was far, the watching really happened at the same time, and the doors really opened the instant the bus stopped." },
      interaction: { type: "choose", options: [{ id: "in-the-meantime-he-watched", label: "in the meantime he watched" }, { id: "the-ridge-in-the-distance", label: "the ridge in the distance" }, { id: "a-mouse-in-the-distance", label: "a mouse in the distance" }, { id: "as-soon-as-the-bus-stopped", label: "as soon as the bus stopped" }], correctId: "a-mouse-in-the-distance", coachWrong: "That word fits its sentence. Look for the sentence where the word and the rest of the sentence disagree." },
    },
    {
      id: "c-5-sequence-the-day",
      band: "core",
      difficulty: 5,
      prompt: "Put the four events in order. The when-words tell you.",
      narration: { audio: `${Q}/c-5-sequence-the-day.mp3`, script: "Here is the trip told with when-words, and the four events are on your screen mixed up. As soon as the bus stopped, Nestor raced to the gate. Immediately, Aunt Loretta waved him back to the group. By nightfall the bus was back at the school. Long after the trip, Sabine still talked about the bobcat. Tap the events in the order they happened." },
      hint: { audio: `${Q}/c-5-sequence-the-day-hint.mp3`, script: "As soon as the bus stopped comes first. Long after the trip comes at the very end. Fit the other two between them." },
      explain: { audio: `${Q}/c-5-sequence-the-day-explain.mp3`, script: "First Nestor raced to the gate, then Aunt Loretta waved him back immediately, then by nightfall the bus was back at school, and long after that Sabine still talked about the bobcat." },
      interaction: { type: "sequence", items: [{ id: "nestor-races-to-the-gate", label: "nestor races to the gate" }, { id: "aunt-loretta-waves-him-back", label: "aunt loretta waves him back" }, { id: "the-bus-is-back-at-school", label: "the bus is back at school" }, { id: "sabine-still-talks-about-it", label: "sabine still talks about it" }], order: ["nestor-races-to-the-gate","aunt-loretta-waves-him-back","the-bus-is-back-at-school","sabine-still-talks-about-it"], coachWrong: "Go back to the when-word each event came with. As soon as means first, and long after means last." },
    },
    {
      id: "c-6-speak-your-trip",
      band: "core",
      difficulty: 6,
      prompt: "Tell about a trip you took. Use a when-word and a where-word.",
      narration: { audio: `${Q}/c-6-speak-your-trip.mp3`, script: "Think of a trip you took, to a park, a store, a beach, or a relative's house. Tap the mic and tell one thing that happened. Use one word that tells exactly when, and one word that tells exactly where." },
      hint: { audio: `${Q}/c-6-speak-your-trip-hint.mp3`, script: "Your sentence needs a time word, like immediately or by nightfall, and a place word, like underneath or across from." },
      explain: { audio: `${Q}/c-6-speak-your-trip-explain.mp3`, script: "One answer could be, as soon as we reached the beach, I found a crab underneath a rock. Any real trip works, as long as one word tells when and one word tells where." },
      interaction: { type: "speak", text: "immediately meantime nightfall long after soon underneath downstairs upstairs corner across distance far side near nearby meanwhile afterward eventually overnight beneath beyond alongside inside outside behind bus car train trip park zoo beach school museum store house grandma grandpa morning night" },
    },
    {
      id: "h-1-precise-said-beamed",
      band: "harder",
      difficulty: 1,
      prompt: "Which precise word fits how Sabine spoke?",
      narration: { audio: `${Q}/h-1-precise-said-beamed.mp3`, script: "Here is a fourth grade tool. Some words signal a precise action or feeling, so a writer uses them instead of a plain word like said. Stammered means spoke in broken, nervous pieces. Grumbled means complained in a low, unhappy voice. Beamed means smiled wide with joy while speaking. Pleaded means begged. Watch. When the hawk screeched, Nestor said he was fine, but the words came out in three nervous pieces, so the precise word is stammered. Now you. Sabine got to hold the feeding bucket, and her whole face lit up as she said thank you. Which precise word fits how Sabine spoke?" },
      hint: { audio: `${Q}/h-1-precise-said-beamed-hint.mp3`, script: "Her whole face lit up. Which word carries a wide happy smile?" },
      explain: { audio: `${Q}/h-1-precise-said-beamed-explain.mp3`, script: "Beamed fits, because her face lit up with joy as she spoke. Stammered is nervous, grumbled is unhappy, and pleaded is begging, and none of those match a lit-up face." },
      interaction: { type: "choose", options: [{ id: "beamed", label: "beamed" }, { id: "grumbled", label: "grumbled" }, { id: "stammered", label: "stammered" }, { id: "pleaded", label: "pleaded" }], correctId: "beamed", coachWrong: "Say the shade of that word. Does it match a face lit up with joy?" },
    },
    {
      id: "h-2-domain-word-endangered",
      band: "harder",
      difficulty: 2,
      prompt: "Which word fits the fact about the salamanders?",
      narration: { audio: `${Q}/h-2-domain-word-endangered.mp3`, script: "Some words belong to one topic, and a fourth grader uses them exactly. When people talk about protecting animals, four words come up. Wildlife means wild animals living free. Conservation means the work of protecting nature. A habitat is the place where an animal lives. Endangered means so few are left that the whole kind could disappear. Watch. Aunt Loretta said the center's conservation work protects wildlife, and that is exactly right, because the center does the work of protecting wild animals. Now you. Aunt Loretta showed them a tank of tiny striped salamanders and said that only a few hundred are left in the whole world. Which word fits that fact?" },
      hint: { audio: `${Q}/h-2-domain-word-endangered-hint.mp3`, script: "Only a few hundred are left in the whole world. Which word is about a kind of animal that could disappear?" },
      explain: { audio: `${Q}/h-2-domain-word-endangered-explain.mp3`, script: "Endangered fits, because only a few hundred are left, so the whole kind could disappear. Wildlife is any wild animal, conservation is the protecting work, and habitat is the place where the animal lives." },
      interaction: { type: "choose", options: [{ id: "endangered", label: "endangered" }, { id: "wildlife", label: "wildlife" }, { id: "conservation", label: "conservation" }, { id: "habitat", label: "habitat" }], correctId: "endangered", coachWrong: "Say what that word means. Does it tell you that only a few of an animal are left?" },
    },
    {
      id: "h-3-precise-said-grumbled",
      band: "harder",
      difficulty: 3,
      prompt: "Which precise word fits how Nestor spoke?",
      narration: { audio: `${Q}/h-3-precise-said-grumbled.mp3`, script: "One more precise word for said. Remember the four. Stammered is nervous and broken. Grumbled is a low, unhappy complaint. Beamed is a wide happy smile. Pleaded is begging for something. Now the moment. When Aunt Loretta called everyone back to the bus, Nestor kicked the gravel and said, in a low unhappy voice, that the bus had come far too soon. Which precise word fits how Nestor spoke?" },
      hint: { audio: `${Q}/h-3-precise-said-grumbled-hint.mp3`, script: "He kicked the gravel and complained in a low unhappy voice. He was not begging, and he was not nervous. Which word is a complaint?" },
      explain: { audio: `${Q}/h-3-precise-said-grumbled-explain.mp3`, script: "Grumbled fits, because he complained in a low unhappy voice. Pleaded would mean he begged to stay, stammered would mean he was nervous, and beamed would mean he was happy." },
      interaction: { type: "choose", options: [{ id: "grumbled", label: "grumbled" }, { id: "pleaded", label: "pleaded" }, { id: "stammered", label: "stammered" }, { id: "beamed", label: "beamed" }], correctId: "grumbled", coachWrong: "Say the shade of that word. Does it match a low unhappy complaint?" },
    },
    {
      id: "h-4-speak-wildlife-sentence",
      band: "harder",
      difficulty: 4,
      prompt: "Say a sentence about protecting animals with one topic word and one precise action word.",
      narration: { audio: `${Q}/h-4-speak-wildlife-sentence.mp3`, script: "Last one, and you build it. The topic words are wildlife, conservation, endangered, and habitat. The precise action words are stammered, grumbled, beamed, and pleaded. Tap the mic. Say one sentence about protecting animals that uses one topic word and one precise action word." },
      hint: { audio: `${Q}/h-4-speak-wildlife-sentence-hint.mp3`, script: "Pick one topic word, like endangered, and one action word, like pleaded, and put them in the same sentence." },
      explain: { audio: `${Q}/h-4-speak-wildlife-sentence-explain.mp3`, script: "One answer could be, the guide beamed when she told us the endangered salamanders had laid eggs. Any sentence works, as long as it carries one topic word and one precise action word." },
      interaction: { type: "speak", text: "wildlife conservation endangered habitat protect protected protecting animals stammered grumbled beamed pleaded whined muttered said center rescue vet bobcat hawk kitten salamander salamanders eggs zoo park forest river guide because" },
    },
  ],
};
