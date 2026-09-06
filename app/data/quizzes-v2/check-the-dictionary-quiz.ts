import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Check the Dictionary QUIZ (L.3.4d) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt, first-letter alphabetical order + which-entry, 3 picture supports) /
// core(on-grade G3: guide words, second-letter order sequence, the numbered
// meaning that fits, a Fits/Does Not Fit sort against one numbered meaning,
// the digital-dictionary first step, production speak) / harder(G4 transfer
// TAUGHT in the stimulus first, L.4.4c: the pronunciation key and the
// part-of-speech label pick the right entry when one spelling is both a noun
// and a verb, present modeled, then record / object applied, closing with a
// production speak). ALL stimuli FRESH vs the lesson (throw, wedge, slip,
// fire, glaze, kiln, clay/clip/coil/crack/cup, sleeve/slope, thick/thumb)
// and grep-swept vs the whole catalog (look-it-up + its quiz own gallop,
// timid, seal, pitcher, cub, dawn, pen, spring, scale, lake/lunch, stamp/
// sting/stone/stump, crab/fox/moth, bean/bike/boat/bug). Second frame: Wilbur
// helps at Aunt Agnes's bicycle repair shop. Quiz words: chain, pump, tube,
// bell, patch, spoke, basket, bolt, brake, bump, present, record, object;
// guide-word pairs spin/spring, space/spell, spy/stamp, snap/soap. Names
// fresh: Wilbur, Agnes. Tiles lowercase, audio-free, kebab ids, 28-char cap;
// bucket clips are quiz-local b-*.mp3 pre-synthed from punctuated labels.

const Q = "/audio/quizzes-v2/check-the-dictionary-quiz";
const IMG = (w: string) => `/images/lessons-v2/check-the-dictionary/${w.toLowerCase()}.png`;

export const checkTheDictionaryQuiz: QuizDef = {
  id: "check-the-dictionary-quiz",
  lessonId: "check-the-dictionary",
  title: "Check the Dictionary Quiz",
  standard: "L.3.4d",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-first-letter-chain",
      band: "easier",
      difficulty: 1,
      prompt: "Which word comes first in the dictionary?",
      image: IMG("quiz-bike-chain"),
      narration: { audio: `${Q}/e-1-first-letter-chain.mp3`, script: "Wilbur helps at his Aunt Agnes's bicycle repair shop on Saturdays, and he keeps a dictionary on the workbench for the shop's words. Three of those words are on your screen. A dictionary lines its words up in alphabetical order, so look at the first letter of each word. Tap the word that comes first in the dictionary." },
      hint: { audio: `${Q}/e-1-first-letter-chain-hint.mp3`, script: "Say the alphabet slowly. Which of the three first letters do you reach soonest?" },
      explain: { audio: `${Q}/e-1-first-letter-chain-explain.mp3`, script: "Chain comes first. Its first letter is c, and c comes before p and t in the alphabet." },
      interaction: { type: "choose", options: [{ id: "chain", label: "chain" }, { id: "pump", label: "pump" }, { id: "tube", label: "tube" }], correctId: "chain", coachWrong: "Check the first letter of each word against the alphabet, and pick the earliest one." },
    },
    {
      id: "e-2-pump-entry",
      band: "easier",
      difficulty: 2,
      prompt: "What is a pump?",
      image: IMG("quiz-bike-pump"),
      narration: { audio: `${Q}/e-2-pump-entry.mp3`, script: "Listen to this entry. The entry for pump says, a tool that pushes air into a tire. The example says, Wilbur used the pump on the flat front tire. What is a pump?" },
      hint: { audio: `${Q}/e-2-pump-entry-hint.mp3`, script: "The meaning came right after the word in the entry." },
      explain: { audio: `${Q}/e-2-pump-entry-explain.mp3`, script: "A pump is a tool that pushes air into a tire. The entry told you that right after the word, and the example showed Wilbur using it on a flat tire." },
      interaction: { type: "choose", options: [{ id: "a-tool-that-pushes-air-in", label: "a tool that pushes air in" }, { id: "a-bell-on-the-handlebar", label: "a bell on the handlebar" }, { id: "a-light-for-riding-at-night", label: "a light for riding at night" }], correctId: "a-tool-that-pushes-air-in", coachWrong: "Think back to the entry. What did it say a pump does to a tire?" },
    },
    {
      id: "e-3-first-letter-bell",
      band: "easier",
      difficulty: 3,
      prompt: "Which word comes first in the dictionary?",
      narration: { audio: `${Q}/e-3-first-letter-bell.mp3`, script: "Three more shop words are on your screen. Look at the first letter of each one, and tap the word that comes first in the dictionary." },
      hint: { audio: `${Q}/e-3-first-letter-bell-hint.mp3`, script: "Compare the three first letters. Which one comes earliest in the alphabet?" },
      explain: { audio: `${Q}/e-3-first-letter-bell-explain.mp3`, script: "Bell comes first. Its first letter is b, and b comes before p and s in the alphabet." },
      interaction: { type: "choose", options: [{ id: "bell", label: "bell" }, { id: "patch", label: "patch" }, { id: "spoke", label: "spoke" }], correctId: "bell", coachWrong: "Look at the first letter of every word. Which letter comes earliest in the alphabet?" },
    },
    {
      id: "e-4-patch-entry",
      band: "easier",
      difficulty: 4,
      prompt: "Which meaning of patch fits the sentence?",
      image: IMG("quiz-patched-tube"),
      narration: { audio: `${Q}/e-4-patch-entry.mp3`, script: "This entry has two numbered meanings. The entry for patch says, number one, a small piece of rubber or cloth that covers a hole. Number two, a small area of ground. Listen to the sentence. Aunt Agnes pressed a patch over the hole in the tube. Which meaning fits?" },
      hint: { audio: `${Q}/e-4-patch-entry-hint.mp3`, script: "Read the sentence again. What did Aunt Agnes press over the hole?" },
      explain: { audio: `${Q}/e-4-patch-entry-explain.mp3`, script: "In that sentence, a patch is a small piece that covers a hole. She pressed it over the hole in the tube, so it cannot be an area of ground." },
      interaction: { type: "choose", options: [{ id: "a-piece-that-covers-a-hole", label: "a piece that covers a hole" }, { id: "a-small-area-of-ground", label: "a small area of ground" }, { id: "a-can-of-bright-red-paint", label: "a can of bright red paint" }], correctId: "a-piece-that-covers-a-hole", coachWrong: "Put that meaning into the sentence. Could Aunt Agnes press it over a hole in a tube?" },
    },
    {
      id: "c-1-guide-words-spoke",
      band: "core",
      difficulty: 1,
      prompt: "Which page holds spoke? Tap its guide words.",
      narration: { audio: `${Q}/c-1-guide-words-spoke.mp3`, script: "Wilbur needs the entry for spoke. Spoke is s, p, o, k, e. Four pairs of guide words are on your screen, one pair for each page. Check the second letter, then the third letter, and tap the pair of guide words that spoke falls between." },
      hint: { audio: `${Q}/c-1-guide-words-spoke-hint.mp3`, script: "The second letter of spoke is p, and the third letter is o. Spoke must come after the first guide word and before the second one." },
      explain: { audio: `${Q}/c-1-guide-words-spoke-explain.mp3`, script: "Spoke lives on the page with spin and spring. Spin is s, p, i, and spring is s, p, r. The letter o comes after i and before r, so spoke sits between them." },
      interaction: { type: "choose", options: [{ id: "spin-and-spring", label: "spin and spring" }, { id: "space-and-spell", label: "space and spell" }, { id: "spy-and-stamp", label: "spy and stamp" }, { id: "stem-and-stove", label: "stem and stove" }], correctId: "spin-and-spring", coachWrong: "Line spoke up against both guide words. Does it come after the first one and before the second one?" },
    },
    {
      id: "c-2-sequence-b-words",
      band: "core",
      difficulty: 2,
      prompt: "Put the five words in dictionary order.",
      narration: { audio: `${Q}/c-2-sequence-b-words.mp3`, script: "Five shop words are on your screen, and every one of them starts with the letter b. Look at the second letter of each word, and tap the words in dictionary order, from first to last." },
      hint: { audio: `${Q}/c-2-sequence-b-words-hint.mp3`, script: "Every word starts with b, so compare the second letters against the alphabet." },
      explain: { audio: `${Q}/c-2-sequence-b-words-explain.mp3`, script: "The order is basket, bell, bolt, brake, bump. Their second letters are a, e, o, r, and u, and that is the order those letters come in the alphabet." },
      interaction: { type: "sequence", items: [{ id: "basket", label: "basket" }, { id: "bell", label: "bell" }, { id: "bolt", label: "bolt" }, { id: "brake", label: "brake" }, { id: "bump", label: "bump" }], order: ["basket","bell","bolt","brake","bump"], coachWrong: "The first letter cannot decide, so line the second letters up against the alphabet." },
    },
    {
      id: "c-3-spoke-meaning",
      band: "core",
      difficulty: 3,
      prompt: "Which numbered meaning of spoke fits the sentence?",
      narration: { audio: `${Q}/c-3-spoke-meaning.mp3`, script: "Here is the entry. The entry for spoke says, number one, the past form of speak, said some words out loud. Number two, one of the thin metal rods that run from the middle of a wheel out to its rim. Listen to the sentence from the repair book. One bent spoke made the back wheel wobble. Tap the precise meaning for that sentence." },
      hint: { audio: `${Q}/c-3-spoke-meaning-hint.mp3`, script: "Test each meaning in the sentence. Could a bent one make a wheel wobble?" },
      explain: { audio: `${Q}/c-3-spoke-meaning-explain.mp3`, script: "In that sentence, a spoke is a thin metal rod inside the wheel. A bent rod would make the wheel wobble, and the speaking meaning cannot bend." },
      interaction: { type: "choose", options: [{ id: "a-thin-rod-inside-a-wheel", label: "a thin rod inside a wheel" }, { id: "said-some-words-out-loud", label: "said some words out loud" }, { id: "a-round-rubber-tire", label: "a round rubber tire" }, { id: "a-bell-on-the-handlebar", label: "a bell on the handlebar" }], correctId: "a-thin-rod-inside-a-wheel", coachWrong: "Put that meaning into the sentence. One bent one made the wheel wobble. Only one meaning can bend." },
    },
    {
      id: "c-4-sort-chain-meaning-two",
      band: "core",
      difficulty: 4,
      prompt: "Meaning two of chain: the loop of metal links that carries power from the pedals to the back wheel. Sort the sentences.",
      narration: { audio: `${Q}/c-4-sort-chain-meaning-two.mp3`, script: "Wilbur looked up chain, and the entry has more than one numbered meaning. Number one, a row of metal rings joined together, like the chain on a gate or a necklace. Number two, the loop of metal links on a bicycle that carries power from the pedals to the back wheel. Number three, a group of stores that all share one name. Six sentences are on your screen. If a sentence uses chain with meaning number two, the bicycle meaning, drag it to Fits Meaning Two. If it uses any other meaning, drag it to Does Not Fit." },
      hint: { audio: `${Q}/c-4-sort-chain-meaning-two-hint.mp3`, script: "Put meaning number two into that sentence. Is it the loop that runs from the pedals to the back wheel?" },
      explain: { audio: `${Q}/c-4-sort-chain-meaning-two-explain.mp3`, script: "Oiling the bike chain, the chain turning the wheel, and the chain falling off the bike all use the bicycle meaning. A chain of stores, a gold chain, and a chain on a gate use other meanings." },
      interaction: { type: "sort", buckets: ["Fits Meaning Two","Does Not Fit"], bucketAudio: { "Fits Meaning Two": `${Q}/b-fits-meaning-two.mp3`, "Does Not Fit": `${Q}/b-does-not-fit.mp3` }, items: [{ label: "wilbur oiled the bike chain", bucket: "Fits Meaning Two" }, { label: "a chain of stores opened", bucket: "Does Not Fit" }, { label: "the chain turned the wheel", bucket: "Fits Meaning Two" }, { label: "she wore a gold chain", bucket: "Does Not Fit" }, { label: "the chain fell off the bike", bucket: "Fits Meaning Two" }, { label: "a chain locked the gate", bucket: "Does Not Fit" }], coachWrong: "Ask whether that sentence is about the loop of links on a bicycle. If not, it uses a different meaning of chain." },
    },
    {
      id: "c-5-digital-first-step",
      band: "core",
      difficulty: 5,
      prompt: "Wilbur opens the dictionary app to look up brake. What does he do first?",
      narration: { audio: `${Q}/c-5-digital-first-step.mp3`, script: "The shop tablet has a dictionary app, and Wilbur wants the entry for brake, the part that slows a bicycle down. On a screen the steps change a little. Four things he might do are on your screen. Tap what he does first on the tablet." },
      hint: { audio: `${Q}/c-5-digital-first-step-hint.mp3`, script: "There are no pages on a screen. How does an app know which word you want?" },
      explain: { audio: `${Q}/c-5-digital-first-step-explain.mp3`, script: "He types brake into the box at the top. A digital dictionary has no pages to flip and no guide words, so typing the word is the first step, and the entry appears." },
      interaction: { type: "choose", options: [{ id: "type-brake-into-the-box", label: "type brake into the box" }, { id: "flip-to-the-b-pages", label: "flip to the b pages" }, { id: "check-the-guide-words", label: "check the guide words" }, { id: "read-the-example-first", label: "read the example first" }], correctId: "type-brake-into-the-box", coachWrong: "That step belongs to a paper dictionary. On a tablet, how do you tell the app which word you want?" },
    },
    {
      id: "c-6-speak-tube-precise",
      band: "core",
      difficulty: 6,
      prompt: "Say what tube means in the sentence, and tell how you found the entry.",
      narration: { audio: `${Q}/c-6-speak-tube-precise.mp3`, script: "Listen to the entry for tube. Number one, a long hollow pipe. Number two, the soft rubber ring inside a bicycle tire that holds the air. Here is the sentence. Aunt Agnes pulled the flat tube out of the tire and found the hole. Tap the mic, say the precise meaning of tube in that sentence, and tell me how you found the entry." },
      hint: { audio: `${Q}/c-6-speak-tube-precise-hint.mp3`, script: "Which meaning can come out of a tire and have a hole in it?" },
      explain: { audio: `${Q}/c-6-speak-tube-precise-explain.mp3`, script: "In that sentence, a tube is the soft rubber ring inside the tire that holds the air. It came out of the tire and had a hole, so it cannot be a long pipe. You find the entry by the second letter, the third letter, and the guide words." },
      interaction: { type: "speak", text: "rubber ring inside tire tyre holds hold holding air soft round loop inner second third letter letters guide words page top between alphabet alphabetical order typed type" },
    },
    {
      id: "h-1-record-entry-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Wilbur set a new record on the hill climb. Which entry fits?",
      narration: { audio: `${Q}/h-1-record-entry-taught.mp3`, script: "Here is a fourth grade tool. Some spellings have two entries, and each entry shows a different way to say the word, plus a small label that tells whether the word is a noun, a thing, or a verb, an action. Watch. Present. One entry says prez ent, with the front part loud, and its label says noun, a gift. The other entry says pri zent, with the back part loud, and its label says verb, to hand something over in front of people. The shop will present a trophy to the fastest rider. Present is an action there, so the verb entry, pri zent, is the one. Now you. Record. One entry says rec ord, with the front part loud, noun, the best result anyone has reached. The other says ri cord, with the back part loud, verb, to write something down to keep it. Wilbur set a new record on the hill climb. Tap the entry that fits." },
      hint: { audio: `${Q}/h-1-record-entry-taught-hint.mp3`, script: "Is record a thing Wilbur set, or an action he did? Then match the label." },
      explain: { audio: `${Q}/h-1-record-entry-taught-explain.mp3`, script: "Record is a thing here, the best result on the hill climb, so the noun entry fits, and it is said rec ord, with the front part loud." },
      interaction: { type: "choose", options: [{ id: "noun-the-best-result", label: "noun, the best result" }, { id: "verb-to-write-it-down", label: "verb, to write it down" }, { id: "noun-a-flat-music-disc", label: "noun, a flat music disc" }, { id: "verb-to-play-it-again", label: "verb, to play it again" }], correctId: "noun-the-best-result", coachWrong: "Ask whether record is a thing or an action in that sentence, then test the meaning on the tile against the hill climb." },
    },
    {
      id: "h-2-record-pronunciation",
      band: "harder",
      difficulty: 2,
      prompt: "How do you say record in that sentence?",
      narration: { audio: `${Q}/h-2-record-pronunciation.mp3`, script: "Same sentence. Wilbur set a new record on the hill climb. You picked the noun entry. Now use its pronunciation, the part right after the word that shows how to say it. Tap the way you say record in that sentence." },
      hint: { audio: `${Q}/h-2-record-pronunciation-hint.mp3`, script: "The noun entry and the verb entry are said differently. Which entry did you pick?" },
      explain: { audio: `${Q}/h-2-record-pronunciation-explain.mp3`, script: "The noun entry says rec ord, with the front part loud. The verb, to write something down, is ri cord, with the back part loud." },
      interaction: { type: "choose", options: [{ id: "rec-ord-front-part-loud", label: "rec ord, front part loud" }, { id: "ri-cord-back-part-loud", label: "ri cord, back part loud" }, { id: "both-parts-said-the-same", label: "both parts said the same" }, { id: "the-second-part-left-out", label: "the second part left out" }], correctId: "rec-ord-front-part-loud", coachWrong: "Think about which entry you picked, the noun or the verb, and how that entry said the word." },
    },
    {
      id: "h-3-object-entry",
      band: "harder",
      difficulty: 3,
      prompt: "Aunt Agnes did not object when Wilbur asked to stay late. Which entry fits?",
      narration: { audio: `${Q}/h-3-object-entry.mp3`, script: "One more spelling with two entries. Object. One entry says ahb ject, with the front part loud, and its label says noun, a thing you can see or touch. The other entry says ub jekt, with the back part loud, and its label says verb, to say that you are against something. Listen. Aunt Agnes did not object when Wilbur asked to stay late. Ask whether object is a thing or an action in that sentence, then tap the entry that fits." },
      hint: { audio: `${Q}/h-3-object-entry-hint.mp3`, script: "Did not object. Is that something she owned, or something she did?" },
      explain: { audio: `${Q}/h-3-object-entry-explain.mp3`, script: "Object is an action there, something Aunt Agnes did not do, so the verb entry fits, said ub jekt with the back part loud, to be against something." },
      interaction: { type: "choose", options: [{ id: "verb-to-be-against-it", label: "verb, to be against it" }, { id: "noun-a-thing-you-can-touch", label: "noun, a thing you can touch" }, { id: "verb-to-throw-it-far", label: "verb, to throw it far" }, { id: "noun-a-goal-you-aim-for", label: "noun, a goal you aim for" }], correctId: "verb-to-be-against-it", coachWrong: "In that sentence, object is something Aunt Agnes did not do. Which label goes with an action, and which meaning fits?" },
    },
    {
      id: "h-4-speak-present-verb",
      band: "harder",
      difficulty: 4,
      prompt: "Wilbur will present the shop's oldest bicycle at the town fair. Say the label, how you say it, and what it means.",
      narration: { audio: `${Q}/h-4-speak-present-verb.mp3`, script: "Last one, and you say it. Wilbur will present the shop's oldest bicycle at the town fair. Tap the mic. Tell me which label fits present in that sentence, noun or verb, how you say it, and what it means there." },
      hint: { audio: `${Q}/h-4-speak-present-verb-hint.mp3`, script: "Is present something Wilbur will do, or something he will hold? Then remember which part is loud for that entry." },
      explain: { audio: `${Q}/h-4-speak-present-verb-explain.mp3`, script: "Present is a verb there, an action Wilbur will do, so it is said pri zent, with the back part loud, and it means to show or hand something over in front of people." },
      interaction: { type: "speak", text: "verb action show shows showing hand hands give gives giving display displays offer offers back last second part loud zent prezent over people" },
    },
  ],
};
