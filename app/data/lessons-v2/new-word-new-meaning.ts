import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./new-word-new-meaning-timings.json";

// New Word, New Meaning (L.3.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=new-word-new-meaning
// G3-U1 word-work lesson. COMPOSE-AND-TEST tier of L.3.4: the affix is already
// known (meaning-machines RF.3.3a owns what pre-/dis-/-ful/-less/-able/-tion
// MEAN; long-word-trains RF.3.3b owns decoding long suffixed words; word-math
// L.2.4b owns the G2 affix + word sums; prefix-power L.1.4b owns G1 un-/re-/
// -ful; root-clues L.2.4c owns roots; read-around-the-word L.3.4a owns
// sentence-context clues). THIS owns the move "known word + known part = new
// meaning, then TEST it in the sentence": composing the whole new word's
// meaning in context, the flippers un-/dis-/non- (reachable/unreachable on
// one base), and the case where the literal sum comes out slightly off
// (priceless is not free; the sentence carries the rest). Frame = one story:
// Imani, her little brother Ezra, and Grandpa Walt run a Saturday yard sale.
// ANCHOR FRESHNESS grep-swept across all of lessons-v2 + quizzes-v2:
// uncomfortable, prepaid, bendable, restless, reachable, unreachable,
// disapprove, nonstick, unable, displease, predawn, preseason, refillable,
// stackable, nonstop, priceless, unusual, disloyal, disorder are all
// catalog-first (careless / preheat / agreeable / comfortable-as-feeling /
// unlucky / painless / harmless / misplace found burned and avoided); names
// Imani, Ezra, Walt fresh; yard sale / trading cards / photo album / cash box
// are first-touch topics. Speak texts carry no " my " (Speak.tsx exact-read
// flip). Tiles lowercase, audio-free, kebab ids, 28-char cap.

const A = (id: string) => `/audio/lessons-v2/new-word-new-meaning/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/new-word-new-meaning/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/new-word-new-meaning/${w.toLowerCase()}.png`;

export const newWordNewMeaningImages: Record<string, string | { subject: string; ref?: string }> = {
  "yard-sale-dawn": "A front lawn at dawn under a pale orange and purple sky, a young girl with brown skin and curly dark hair in a yellow t-shirt carrying a cardboard box, an older man with a gray beard, round glasses, and a straw hat setting up a folding table, a small boy with short dark hair hopping beside a table stacked with old lamps, books, and toys, two gray metal folding chairs on the grass, one car parked at the curb. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no price tags, no signs, no writing anywhere.",
  "garage-top-shelf": { subject: "Inside a tidy garage with wooden shelves, the same older man with a gray beard, round glasses, and a straw hat stretching one arm up and touching a cardboard box on the very top shelf with ease, while the same young girl with brown skin and curly dark hair in a yellow t-shirt stands on tiptoe beside him with her arm raised, her hand far below the top shelf. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "yard-sale-dawn" },
  "yard-sale-noon": { subject: "The same front lawn at midday under a bright sun, crowded with shoppers browsing tables of old lamps, books, and toys, the same older man with a gray beard, round glasses, and a straw hat holding a worn brown photo album close to his chest and gently shaking his head at a woman in a blue dress with her open hand held out, the same young girl with brown skin and curly dark hair in a yellow t-shirt behind a small table with a plain gray metal cash box. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no money, no price tags, no signs, no writing anywhere.", ref: "yard-sale-dawn" },
  "quiz-green-tomato": "One hard, shiny, completely green tomato hanging on a leafy tomato vine in a sunny garden, a wooden stake beside it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-gift-rewrap": "A young boy with short red hair at a kitchen table with a small plain box, a torn and crumpled sheet of striped wrapping paper pushed to one side, and a fresh flat sheet of polka-dot wrapping paper spread out in front of him, a roll of clear tape nearby. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-leafless-tree": "One big old oak tree with thick bare branches and not a single leaf on it, standing alone on a snowy hill under a pale winter sky, a few flakes falling. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const newWordNewMeaning: LessonDef = {
  id: "new-word-new-meaning",
  title: "New Word, New Meaning",
  grade: "3rd Grade",
  standard: "L.3.4b",
  archetype: "vocabulary",
  objective: "I can put a known word and a known part together to work out a new word's meaning, then test it in the sentence.",
  concepts: [
    "find the word you know, find the part you know, put the two meanings together",
    "test the new meaning in the sentence; if it fits, it holds",
    "un, dis, and non flip a word to its opposite",
    "the same base can carry different parts, like reachable and unreachable",
    "when the sum comes out slightly off, the sentence carries you the rest of the way",
    "name the two parts that told you",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You built new words out of parts you already owned today. Find the word you know, find the part you know, put the two meanings together, and test the new meaning in the sentence. Un, dis, and non flip a word to its opposite. Pre puts it before, and able says it can be done. And when the sum comes out slightly off, like priceless, the sentence carries you the rest of the way. That move works on thousands of words, and now it is yours.",
    "title": "Word Builder!",
    "body": "You put a known word and a known part together, then tested the new meaning in the sentence."
  },
  scenes: [
    {
      id: "hook-yard-sale",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a yard sale. Read along!",
      image: IMG("yard-sale-dawn"),
      narration: { audio: A("hook-yard-sale"), script: "Hello, reader. Today you learn how third graders build the meaning of a word nobody taught them, out of parts they already know. It starts on a front lawn before the sun is up. Read along with me, and notice the long words. Every one of them is built from a word you know." },
      interaction: { type: "read-along", text: "Before sunrise on Saturday, Imani helped Grandpa Walt carry boxes to the front lawn for the yard sale, and the air was already so sticky that the metal folding chairs felt uncomfortable to sit in. Grandpa had prepaid for an ad in the town paper a whole week earlier, so by seven o'clock the first cars were parking along the curb. A tall man picked up a bendable desk lamp, twisted its neck in a full circle, and said, \"I will take it.\" Imani's little brother Ezra was restless, hopping from table to table, because nobody had bought his box of trading cards yet. \"Be patient,\" said Grandpa Walt, \"because the best buyers always come late.\"", audio: A("hook-yard-sale-sentence") },
    },
    {
      id: "model-the-move",
      purpose: "model",
      gate: "none",
      prompt: "Watch me build a meaning, then test it.",
      fx: {"text":"**Known** word. **Known** part. Put them together. **Test** it.","effect":"pop-words"},
      narration: { audio: A("model-the-move"), script: "Uncomfortable might be new to you, but every piece of it is old. Here is the move. Find the word you already know. Comfortable, feeling good and at ease. Find the part you already know. Un, which means not. Put the two meanings together. Not comfortable. Now test it in the sentence. The air was sticky, and the metal chairs felt uncomfortable to sit in. Would sticky air and hot metal chairs feel not comfortable? Yes. The meaning fits, so it holds. Known word, known part, put them together, test it." },
    },
    {
      id: "model-bendable",
      purpose: "model",
      gate: "none",
      prompt: "The same move on a word with a part at the end.",
      fx: {"text":"bend + able = **can be bent**","effect":"word-swap"},
      narration: { audio: A("model-bendable"), script: "Now run it again on bendable. The known word is bend. The known part is able, which means can be. Together, bendable means can be bent. Test it. The man twisted the lamp's neck in a full circle, so that lamp can be bent. It fits. Notice what I did not do. I did not guess from the picture, and I did not skip the word. I built the meaning from two parts I already owned, and then I checked it against the sentence." },
    },
    {
      id: "guided-transform-reachable",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word that means can be reached.",
      image: IMG("garage-top-shelf"),
      narration: { audio: A("guided-transform-reachable"), script: "Now you build a new word. Back in the garage, one last box sat on the very top shelf. Grandpa Walt stretched up and touched it with no trouble at all, because the box could be reached. The known word is reach, and you know the part that means can be. Snap it on, and think about what the new word means." },
      interaction: { type: "transform", base: "reach", add: "able", result: "reachable", changeIndex: 4, options: ["able", "less", "ful"], labels: { added: "can be" }, successAudio: W("reachable"), coachWrong: "That part has a different meaning. You need the one that means can be." },
    },
    {
      id: "guided-choose-prepaid",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does prepaid mean in the sentence?",
      narration: { audio: A("guided-choose-prepaid"), script: "Your turn to run the whole move. Grandpa had prepaid for an ad in the town paper a whole week earlier. Find the word you know inside prepaid. Find the part you know at the front. Put the two meanings together, then test your meaning against the words a whole week earlier. Read all four, and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "paid-ahead-of-time", label: "paid ahead of time" }, { id: "paid-a-second-time", label: "paid a second time" }, { id: "not-paid-at-all", label: "not paid at all" }, { id: "paid-far-too-much", label: "paid far too much" }], correctId: "paid-ahead-of-time", coachWrong: "Look at the part on the front of prepaid. It tells you when the paying happened. Test your choice against a whole week earlier." },
    },
    {
      id: "model-flip-unreachable",
      purpose: "model",
      gate: "none",
      prompt: "Three parts flip a word to its opposite.",
      fx: {"text":"reachable, **un**reachable","effect":"cross-out"},
      narration: { audio: A("model-flip-unreachable"), script: "Three parts do one special job. They flip a word to its opposite. Un, dis, and non all mean not. Watch the flip. You just built reachable, can be reached. Snap un onto the front, and unreachable means cannot be reached. Test it. Imani stood on her toes under that same top shelf and could not touch the box, so for Imani the box was unreachable. It fits. Dis flips the same way. If you disapprove of a plan, you do not approve of it. Non flips the same way. Food does not stick to a nonstick pan. The base word stays the same, and one small part turns the whole meaning around." },
    },
    {
      id: "guided-choose-unreachable",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which of these is unreachable?",
      narration: { audio: A("guided-choose-unreachable"), script: "Now test the flipped word yourself. Unreachable means cannot be reached. Four things are on the screen. Picture a person standing right there beside each one, and tap the one thing that person cannot reach." },
      interaction: { type: "choose", options: [{ id: "a-kite-stuck-high-in-an-oak", label: "a kite stuck high in an oak" }, { id: "a-cup-right-beside-her-hand", label: "a cup right beside her hand" }, { id: "a-coin-lying-at-his-feet", label: "a coin lying at his feet" }, { id: "a-book-open-on-her-lap", label: "a book open on her lap" }], correctId: "a-kite-stuck-high-in-an-oak", coachWrong: "Could a person standing right there put a hand on that? If yes, it can be reached, so it is not the one." },
    },
    {
      id: "guided-sort-new-meanings",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each new word by what it means.",
      narration: { audio: A("guided-sort-new-meanings"), script: "Six new words, and you build each meaning before you sort it. Find the word you know, find the part you know, and put them together. If the new word means not something, drag it to Means Not. If it means something before, drag it to Means Before. If it means something can be done, drag it to Means Can Be." },
      interaction: { type: "sort", buckets: ["Means Not","Means Before","Means Can Be"], items: [{ label: "unable", bucket: "Means Not" }, { label: "predawn", bucket: "Means Before" }, { label: "refillable", bucket: "Means Can Be" }, { label: "displease", bucket: "Means Not" }, { label: "preseason", bucket: "Means Before" }, { label: "stackable", bucket: "Means Can Be" }], coachWrong: "Find the known part on that word, at the front or at the end, and say what it adds to the base word. Then sort it." },
    },
    {
      id: "apply-read-noon",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The story continues. Read along!",
      image: IMG("yard-sale-noon"),
      narration: { audio: A("apply-read-noon"), script: "Back to the yard sale. This part hides four more built words, and one of them will test you. Read along with me, and run the move on every word that stops you." },
      interaction: { type: "read-along", text: "By noon the lawn was crowded, and Imani worked nonstop, running from the cash box to the tables without a single break. A woman offered five dollars for an old photo album, but Grandpa Walt shook his head, because the album was priceless to him and not for sale at any price. It was unusual for Grandpa to turn down a buyer, so Imani looked up from the cash box in surprise. Ezra decided that selling his favorite trading card would feel disloyal, and he slid it back into his pocket while the rest of the box sold. \"Some things you keep,\" said Grandpa, \"no matter what anyone offers.\"", audio: A("apply-read-noon-sentence") },
    },
    {
      id: "apply-choose-priceless",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does priceless mean in the sentence?",
      narration: { audio: A("apply-choose-priceless"), script: "Here is the word that shows why the test matters. Priceless. The known word is price, and the known part is less, which means without. So the sum says without a price. Now test that sum. A woman offered five dollars, and Grandpa said no, because the album was not for sale at any price. Does without a price fit a thing nobody can buy? Not quite. The sum gets you close, and the sentence carries you the rest of the way. Read all four, and tap the meaning that fits the sentence." },
      interaction: { type: "choose", options: [{ id: "worth-more-than-any-price", label: "worth more than any price" }, { id: "free-without-any-price", label: "free, without any price" }, { id: "sold-at-a-very-low-price", label: "sold at a very low price" }, { id: "missing-its-price-tag", label: "missing its price tag" }], correctId: "worth-more-than-any-price", coachWrong: "Test that meaning in the sentence. Grandpa would not sell the album for any amount of money. Which meaning fits a thing like that?" },
    },
    {
      id: "apply-choose-disloyal",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does disloyal mean in the sentence?",
      narration: { audio: A("apply-choose-disloyal"), script: "Now a word with a flipper on the front. Ezra decided that selling his favorite trading card would feel disloyal. Find the word you know inside disloyal. Loyal means standing by something you care about. Find the part at the front, put the two meanings together, and test your meaning against what Ezra did next. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "turning-his-back-on-it", label: "turning his back on it" }, { id: "standing-by-it-always", label: "standing by it always" }, { id: "standing-by-it-again", label: "standing by it again" }, { id: "standing-by-it-first", label: "standing by it first" }], correctId: "turning-his-back-on-it", coachWrong: "The part on the front of disloyal flips loyal to its opposite. Ezra kept the card so he would not feel that way. Test again." },
    },
    {
      id: "apply-speak-read-sunset",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: By sunset the lawn was unusually quiet, and Imani felt unable to lift one more box. Grandpa Walt handed her a refillable bottle of cold water, and the three of them walked inside without a word.",
      narration: { audio: A("apply-speak-read-sunset"), script: "The story ends at sunset, and these two sentences are yours to read. Read them out loud, clearly and with feeling, and notice the built words hiding inside." },
      interaction: { type: "speak", text: "By sunset the lawn was unusually quiet and Imani felt unable to lift one more box Grandpa Walt handed her a refillable bottle of cold water and the three of them walked inside without a word" },
    },
    {
      id: "apply-speak-nonstop",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what nonstop means, and name the two parts.",
      narration: { audio: A("apply-speak-nonstop"), script: "Now you run the whole move out loud. Imani worked nonstop, running from the cash box to the tables without a single break. Tap the mic, tell me what nonstop means in that sentence, and name the two parts that told you." },
      interaction: { type: "speak", text: "not stop stopping stopped stops without break breaks rest resting pause pausing non prefix front part parts kept going never always running" },
    },
    {
      id: "challenge-choose-disorder",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does disorder mean in the sentence?",
      narration: { audio: A("challenge-choose-disorder"), script: "Last one, and nobody taught you this word. After the crowd left, the tables were in disorder, with books piled sideways and cups tipped over. Find the word you know inside disorder, find the part on the front, put the two meanings together, and test it against the piled books and tipped cups. Tap the meaning that fits." },
      interaction: { type: "choose", options: [{ id: "a-messy-mixed-up-state", label: "a messy, mixed-up state" }, { id: "a-neat-and-tidy-state", label: "a neat and tidy state" }, { id: "put-back-in-order-again", label: "put back in order again" }, { id: "lined-up-ahead-of-time", label: "lined up ahead of time" }], correctId: "a-messy-mixed-up-state", coachWrong: "The part on the front of disorder is a flipper. Ask what the opposite of order looks like, then test it against the tipped cups." },
    },
    {
      id: "celebrate-word-builder",
      purpose: "celebrate",
      gate: "none",
      prompt: "Known word, known part, new meaning, then test it.",
      fx: {"text":"Build it, then **test** it","effect":"fireworks"},
      narration: { audio: A("celebrate-word-builder"), script: "You built new words out of parts you already owned today. Uncomfortable, prepaid, bendable, reachable, unreachable, priceless, disloyal, nonstop. Every time, you found the word you knew, found the part you knew, put the two meanings together, and tested the new meaning in the sentence. Un, dis, and non flip a word to its opposite. Pre puts it before, and able says it can be done. And when the sum comes out slightly off, the sentence carries you the rest of the way. That move works on thousands of words, and it is yours now." },
    },
  ],
};
