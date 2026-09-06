import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Words in Action QUIZ (L.3.5b) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt match a word to a real-life example, 3 picture supports) /
// core(on-grade G3: which-example-fits, why-it-fits, Example/Not an Example
// sort, which-word-fits-the-moment, the non-example catch, production
// speak) / harder(G4 transfer TAUGHT in the stimulus first, L.4.5c:
// antonyms and synonyms as real-life pairs, deserted/bustling modeled then
// applied, annoyed/irritated synonym pair, humble/boastful, production
// speak). ALL stimuli FRESH vs the lesson (considerate, frustrating,
// cramped, cooperative, exhausting, grateful, cluttered, reliable, the
// Alder Street cleanup) and grep-swept vs the whole catalog. Quiz words:
// energetic, spacious, flimsy, dazzling, reliable-as-a-quiz-example is NOT
// reused (the lesson read it), impatient, organized, chaotic, serene,
// humble, sluggish, attentive, talkative, deserted, bustling, annoyed,
// irritated, boastful. Names fresh: Halle, Meera, Lorenzo. Tiles are
// lowercase, audio-free, kebab ids; bucket clips are quiz-local b-*.mp3
// pre-synthed from punctuated labels.

const Q = "/audio/quizzes-v2/words-in-action-quiz";
const IMG = (w: string) => `/images/lessons-v2/words-in-action/${w.toLowerCase()}.png`;

export const wordsInActionQuiz: QuizDef = {
  id: "words-in-action-quiz",
  lessonId: "words-in-action",
  title: "Words in Action Quiz",
  standard: "L.3.5b",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-energetic-puppy",
      band: "easier",
      difficulty: 1,
      prompt: "Which real-life example fits energetic?",
      image: IMG("quiz-puppy-energetic"),
      narration: { audio: `${Q}/e-1-energetic-puppy.mp3`, script: "Listen. Energetic means full of energy, always ready to run and play. Three real-life examples are on your screen. Which one fits energetic?" },
      hint: { audio: `${Q}/e-1-energetic-puppy-hint.mp3`, script: "Picture each one. Which one is moving the most?" },
      explain: { audio: `${Q}/e-1-energetic-puppy-explain.mp3`, script: "Energetic fits the puppy racing after the ball, because a puppy that races is full of energy. The cat and the snail are resting." },
      interaction: { type: "choose", options: [{ id: "a-puppy-racing-after-a-ball", label: "a puppy racing after a ball" }, { id: "a-cat-asleep-on-a-chair", label: "a cat asleep on a chair" }, { id: "a-snail-on-a-wet-leaf", label: "a snail on a wet leaf" }], correctId: "a-puppy-racing-after-a-ball", coachWrong: "Energetic is about energy. Is that one moving fast, or resting?" },
    },
    {
      id: "e-2-spacious-gym",
      band: "easier",
      difficulty: 2,
      prompt: "Which place is spacious?",
      image: IMG("quiz-empty-gym-spacious"),
      narration: { audio: `${Q}/e-2-spacious-gym.mp3`, script: "Listen. Spacious means having lots of room to move around. Three places are on your screen. Which place is spacious?" },
      hint: { audio: `${Q}/e-2-spacious-gym-hint.mp3`, script: "Think about stretching both arms out. Where would you never bump anything?" },
      explain: { audio: `${Q}/e-2-spacious-gym-explain.mp3`, script: "An empty gym is spacious, because there is room to run from wall to wall. A closet and a back seat are tight." },
      interaction: { type: "choose", options: [{ id: "an-empty-gym", label: "an empty gym" }, { id: "a-tiny-closet", label: "a tiny closet" }, { id: "the-back-seat-of-a-car", label: "the back seat of a car" }], correctId: "an-empty-gym", coachWrong: "Spacious means room to spare. Picture yourself inside that place. Is there room?" },
    },
    {
      id: "e-3-flimsy-plate",
      band: "easier",
      difficulty: 3,
      prompt: "Which thing is flimsy?",
      image: IMG("quiz-flimsy-plate"),
      narration: { audio: `${Q}/e-3-flimsy-plate.mp3`, script: "Listen. Flimsy means thin and weak, so it bends or breaks easily. Three things are on your screen. Which thing is flimsy?" },
      hint: { audio: `${Q}/e-3-flimsy-plate-hint.mp3`, script: "Flimsy things cannot hold much weight. Which one is bending?" },
      explain: { audio: `${Q}/e-3-flimsy-plate-explain.mp3`, script: "The paper plate is flimsy, because it bends under one slice of watermelon. The iron pan and the wooden door are strong." },
      interaction: { type: "choose", options: [{ id: "a-bending-paper-plate", label: "a bending paper plate" }, { id: "a-heavy-iron-pan", label: "a heavy iron pan" }, { id: "a-thick-wooden-door", label: "a thick wooden door" }], correctId: "a-bending-paper-plate", coachWrong: "Flimsy means weak and easy to bend. Is that thing weak?" },
    },
    {
      id: "e-4-dazzling-fireworks",
      band: "easier",
      difficulty: 4,
      prompt: "Which moment is dazzling?",
      narration: { audio: `${Q}/e-4-dazzling-fireworks.mp3`, script: "Listen. Dazzling means so bright that it almost hurts to look at it. Three moments are on your screen. Which moment is dazzling?" },
      hint: { audio: `${Q}/e-4-dazzling-fireworks-hint.mp3`, script: "Dazzling is about brightness. Which moment is the brightest?" },
      explain: { audio: `${Q}/e-4-dazzling-fireworks-explain.mp3`, script: "Fireworks over a dark lake are dazzling, because they burst so bright against the dark that you squint. A shaded lamp and a foggy morning are dim." },
      interaction: { type: "choose", options: [{ id: "fireworks-over-a-dark-lake", label: "fireworks over a dark lake" }, { id: "a-lamp-with-the-shade-on", label: "a lamp with the shade on" }, { id: "a-foggy-gray-morning", label: "a foggy gray morning" }], correctId: "fireworks-over-a-dark-lake", coachWrong: "Dazzling is about very bright light. Is that moment bright?" },
    },
    {
      id: "c-1-reliable-example",
      band: "core",
      difficulty: 1,
      prompt: "Which person is reliable?",
      narration: { audio: `${Q}/c-1-reliable-example.mp3`, script: "Listen. Reliable means you can count on that person every single time, without reminding them. Four real-life people are on your screen. Say the because for each one, and tap the person who is reliable." },
      hint: { audio: `${Q}/c-1-reliable-example-hint.mp3`, script: "Reliable has two parts, every time, and nobody has to ask. Check each person against both parts." },
      explain: { audio: `${Q}/c-1-reliable-example-explain.mp3`, script: "The person who feeds the fish every morning is reliable, because it happens every time and nobody has to ask. Feeding them when reminded fails the because, and so do twice in one day and forgetting for a week." },
      interaction: { type: "choose", options: [{ id: "feeds-the-fish-every-morning", label: "feeds the fish every morning" }, { id: "feeds-the-fish-when-reminded", label: "feeds the fish when reminded" }, { id: "feeds-the-fish-twice-one-day", label: "feeds the fish twice one day" }, { id: "forgets-the-fish-for-a-week", label: "forgets the fish for a week" }], correctId: "feeds-the-fish-every-morning", coachWrong: "Test the because. Does that happen every single time, with nobody asking?" },
    },
    {
      id: "c-2-impatient-why",
      band: "core",
      difficulty: 2,
      prompt: "Why does impatient fit Halle?",
      narration: { audio: `${Q}/c-2-impatient-why.mp3`, script: "Listen. Halle is impatient. Here is the example. In the lunch line, Halle sighed, tapped her foot, and asked how much longer four times before she got her tray. Impatient fits. Four reasons are on your screen. Tap the because that makes impatient fit." },
      hint: { audio: `${Q}/c-2-impatient-why-hint.mp3`, script: "Impatient is about how someone handles waiting. Which reason is about waiting?" },
      explain: { audio: `${Q}/c-2-impatient-why-explain.mp3`, script: "Halle is impatient because she could not stand waiting. Being hungry, a long line, and being near the back are all true, but they do not explain the word." },
      interaction: { type: "choose", options: [{ id: "she-could-not-stand-waiting", label: "she could not stand waiting" }, { id: "she-was-hungry-for-lunch", label: "she was hungry for lunch" }, { id: "the-line-was-very-long", label: "the line was very long" }, { id: "she-was-near-the-back", label: "she was near the back" }], correctId: "she-could-not-stand-waiting", coachWrong: "That could be true, but it does not explain the word. Impatient is about waiting." },
    },
    {
      id: "c-3-sort-organized",
      band: "core",
      difficulty: 3,
      prompt: "Sort: Example or Not an Example of organized.",
      narration: { audio: `${Q}/c-3-sort-organized.mp3`, script: "Organized means keeping your things in order so you can find them and be ready. Six real-life moments are on your screen. Say the because for each one. If it shows organized, drag it to Example. If the because is false, drag it to Not an Example." },
      hint: { audio: `${Q}/c-3-sort-organized-hint.mp3`, script: "Ask whether that person could find their things and be ready. If yes, it is an example." },
      explain: { audio: `${Q}/c-3-sort-organized-explain.mp3`, script: "Labeling folders, packing the bag before bed, and keeping crayons in one tin are examples, because each one keeps things in order. Losing the slip twice, dumping a drawer, and forgetting gym day are not, because things are out of order." },
      interaction: { type: "sort", buckets: ["Example","Not an Example"], bucketAudio: { "Example": `${Q}/b-example.mp3`, "Not an Example": `${Q}/b-not-an-example.mp3` }, items: [{ label: "labels every folder by class", bucket: "Example" }, { label: "lost the same slip twice", bucket: "Not an Example" }, { label: "packs her bag before bed", bucket: "Example" }, { label: "dumps a drawer for one sock", bucket: "Not an Example" }, { label: "keeps crayons in one tin", bucket: "Example" }, { label: "forgets which day is gym day", bucket: "Not an Example" }], coachWrong: "Say the because. Does that moment keep things in order, or does it show things out of order?" },
    },
    {
      id: "c-4-chaotic-word",
      band: "core",
      difficulty: 4,
      prompt: "Which precise word fits this moment?",
      narration: { audio: `${Q}/c-4-chaotic-word.mp3`, script: "Four precise words are on your screen. Chaotic means wild and out of control. Serene means calm and peaceful. Humble means never bragging. Sluggish means slow and tired. Now the moment. Two puppies knocked over the water bowl, the phone rang, and the doorbell rang, all in the same minute. Say the because for each word, and tap the one that fits." },
      hint: { audio: `${Q}/c-4-chaotic-word-hint.mp3`, script: "Three things went wrong at once. Which word describes a moment out of control?" },
      explain: { audio: `${Q}/c-4-chaotic-word-explain.mp3`, script: "Chaotic fits, because three things went wrong in the same minute and nobody was in control. Serene is the opposite, and humble and sluggish describe people, not a wild moment." },
      interaction: { type: "choose", options: [{ id: "chaotic", label: "chaotic" }, { id: "serene", label: "serene" }, { id: "humble", label: "humble" }, { id: "sluggish", label: "sluggish" }], correctId: "chaotic", coachWrong: "Say the because. Does that word describe a wild, out-of-control minute?" },
    },
    {
      id: "c-5-attentive-not-example",
      band: "core",
      difficulty: 5,
      prompt: "Which moment does NOT show attentive?",
      narration: { audio: `${Q}/c-5-attentive-not-example.mp3`, script: "Attentive means paying close attention and noticing every small detail. Here are four moments. Meera caught the one wrong note in the whole song. Lorenzo noticed that the sign on the corner had changed. Halle heard a tiny knock from below. And a boy missed his name being called three times. Three of those show attentive. Tap the one that does not." },
      hint: { audio: `${Q}/c-5-attentive-not-example-hint.mp3`, script: "Attentive people notice. Find the moment where someone did not notice." },
      explain: { audio: `${Q}/c-5-attentive-not-example-explain.mp3`, script: "Missing his name three times does not show attentive, because he did not notice something said right to him. The wrong note, the changed sign, and the tiny knock all show noticing." },
      interaction: { type: "choose", options: [{ id: "missed-his-name-three-times", label: "missed his name three times" }, { id: "caught-the-one-wrong-note", label: "caught the one wrong note" }, { id: "noticed-the-sign-had-changed", label: "noticed the sign had changed" }, { id: "heard-a-tiny-knock-below", label: "heard a tiny knock below" }], correctId: "missed-his-name-three-times", coachWrong: "That one shows attentive, because the person noticed a small detail. Find the moment where the because is false." },
    },
    {
      id: "c-6-speak-talkative",
      band: "core",
      difficulty: 6,
      prompt: "Tell about someone who is talkative, and say why it fits.",
      narration: { audio: `${Q}/c-6-speak-talkative.mp3`, script: "Listen. Talkative means loving to talk, and talking a lot. Think of someone you know who is talkative. Tap the mic, tell me who it is and what they do, and then say why the word talkative fits. Use the word because." },
      hint: { audio: `${Q}/c-6-speak-talkative-hint.mp3`, script: "Your answer names a person, tells what they do, and ends with because." },
      explain: { audio: `${Q}/c-6-speak-talkative-explain.mp3`, script: "One answer could be, a cousin is talkative because she tells a new story every minute of the car ride. Any real person works, as long as the because is about talking a lot." },
      interaction: { type: "speak", text: "talkative talks talk talking talked chatter chatters chatting stops never always questions stories jokes phone class recess dinner car sister brother cousin friend uncle aunt grandma grandpa mom dad teacher neighbor because loud quiet" },
    },
    {
      id: "h-1-opposite-bustling",
      band: "harder",
      difficulty: 1,
      prompt: "Which example shows the opposite of bustling?",
      narration: { audio: `${Q}/h-1-opposite-bustling.mp3`, script: "Here is a fourth grade tool. Some describing words come in opposite pairs, and their real-life examples come in pairs too. Deserted means empty of people. Bustling means full of busy people. Watch. The beach in January was deserted, not one towel on the sand. The same beach in July was bustling, towels edge to edge and a line at the ice cream stand. One place, two opposite words, two opposite examples. Now you. Four moments at the mall are on your screen. Which real-life example shows the opposite of bustling?" },
      hint: { audio: `${Q}/h-1-opposite-bustling-hint.mp3`, script: "The opposite of bustling is deserted, empty of people. When is the mall empty?" },
      explain: { audio: `${Q}/h-1-opposite-bustling-explain.mp3`, script: "The mall before it opens is the opposite of bustling, because it is deserted, with nobody inside. A big sale, the food court at noon, and the parking lot on Saturday are all bustling." },
      interaction: { type: "choose", options: [{ id: "the-mall-before-it-opens", label: "the mall before it opens" }, { id: "the-mall-during-a-big-sale", label: "the mall during a big sale" }, { id: "the-mall-food-court-at-noon", label: "the mall food court at noon" }, { id: "the-mall-lot-on-saturday", label: "the mall lot on saturday" }], correctId: "the-mall-before-it-opens", coachWrong: "That example is bustling, full of people. You want the opposite, a place with nobody in it." },
    },
    {
      id: "h-2-synonym-annoyed",
      band: "harder",
      difficulty: 2,
      prompt: "Which pair of words BOTH fit this moment?",
      narration: { audio: `${Q}/h-2-synonym-annoyed.mp3`, script: "Words can also come in almost-the-same pairs. Annoyed and irritated mean nearly the same thing, bothered by something small that keeps happening. One real-life example fits both words. A dripping faucet kept Meera awake, and by midnight she was annoyed. You could say irritated instead, and the because stays true. Two other words you might meet are grateful, which means thankful, and serene, which means calm and peaceful. Now you. A fly landed on Lorenzo's sandwich for the fifth time. Which pair of words both fit this moment?" },
      hint: { audio: `${Q}/h-2-synonym-annoyed-hint.mp3`, script: "Say the because for each word in the pair. Both words have to be true for the fly moment." },
      explain: { audio: `${Q}/h-2-synonym-annoyed-explain.mp3`, script: "Annoyed and irritated both fit, because a fly landing five times is a small thing that keeps happening. Grateful means thankful and serene means calm, and neither one is true for Lorenzo." },
      interaction: { type: "choose", options: [{ id: "annoyed-and-irritated", label: "annoyed and irritated" }, { id: "annoyed-and-grateful", label: "annoyed and grateful" }, { id: "irritated-and-serene", label: "irritated and serene" }, { id: "grateful-and-serene", label: "grateful and serene" }], correctId: "annoyed-and-irritated", coachWrong: "One word in that pair fails the because. Find the pair where both words are true." },
    },
    {
      id: "h-3-opposite-humble",
      band: "harder",
      difficulty: 3,
      prompt: "Which example shows the opposite of humble?",
      narration: { audio: `${Q}/h-3-opposite-humble.mp3`, script: "One more opposite pair. Humble means never bragging about what you can do. Boastful is its opposite, always telling everyone how great you are. Here is humble in real life. Meera won the spelling bee and only said that her sister helped her practice. Now describe someone who is the opposite of humble. Four people are on your screen. Which real-life example shows boastful?" },
      hint: { audio: `${Q}/h-3-opposite-humble-hint.mp3`, script: "The opposite of humble is bragging. Which person is bragging?" },
      explain: { audio: `${Q}/h-3-opposite-humble-explain.mp3`, script: "Reminding everyone she won is boastful, because she keeps telling people how great she is. Hiding the medal, thanking the coach, and giving credit to the team are all humble." },
      interaction: { type: "choose", options: [{ id: "reminds-everyone-she-won", label: "reminds everyone she won" }, { id: "hides-her-medal-in-a-drawer", label: "hides her medal in a drawer" }, { id: "thanks-her-coach-after-a-win", label: "thanks her coach after a win" }, { id: "says-the-whole-team-did-it", label: "says the whole team did it" }], correctId: "reminds-everyone-she-won", coachWrong: "That example is humble. You want the opposite, someone who brags." },
    },
    {
      id: "h-4-speak-deserted-bustling",
      band: "harder",
      difficulty: 4,
      prompt: "Name a deserted place and a bustling place, and say why.",
      narration: { audio: `${Q}/h-4-speak-deserted-bustling.mp3`, script: "Last one, and you say it. Think of two real places you know. Tap the mic. Name one place that is deserted. Next, name one place that is bustling. Say why each word fits, using the word because." },
      hint: { audio: `${Q}/h-4-speak-deserted-bustling-hint.mp3`, script: "Deserted means nobody is there. Bustling means full of busy people. Name one of each." },
      explain: { audio: `${Q}/h-4-speak-deserted-bustling-explain.mp3`, script: "One answer could be, the playground at night is deserted because nobody is there, and the cafeteria at lunch is bustling because everyone is there at once." },
      interaction: { type: "speak", text: "deserted bustling empty nobody quiet alone full busy people everyone packed crowded mall store park playground beach school gym hallway cafeteria library street night morning early late summer winter because" },
    },
  ],
};
