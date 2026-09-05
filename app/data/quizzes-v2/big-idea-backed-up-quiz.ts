import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Big Idea, Backed Up QUIZ (RI.3.2) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// RI.2.2 main idea of ONE paragraph, 3-opt, picture support) / core(on-grade
// G3: big idea of the WHOLE text, which-detail-backs-it, Holds It Up / Just
// Interesting sort, why-does-it-back-it-up, big-idea-first sequence, a
// production speak) / harder(G4 transfer TAUGHT in the stimulus: RI.4.2
// summarize, a summary = big idea + key details in your own words with the
// flags left out, modeled in h-1 then applied, ending in a two-sentence
// summary production speak). ALL-FRESH stimulus, never the lesson's prairie
// dogs: "The Underground Gardeners", a true text about earthworms (no eyes,
// ears, or legs, breathe through wet skin; tunnels let air and rainwater sink
// to the roots; drag dead leaves into the hole at night, eat them, castings
// are packed with plant food; mix deep soil with the top; worms on a wet path
// after rain; Charles Darwin studied them for years and wrote that few
// animals had done as much to shape the ground). Every page is SPOKEN inside
// the question that needs it, so each Q is self-contained. Fresh vs catalog:
// earthworm / castings / fertilizer / Darwin / wet path all 0 hits. Tiles
// lowercase, audio-free, kebab ids; bucket audio b-* pre-synthed from
// punctuated labels.

const Q = "/audio/quizzes-v2/big-idea-backed-up-quiz";
const IMG = (w: string) => `/images/lessons-v2/big-idea-backed-up/${w.toLowerCase()}.png`;

export const bigIdeaBackedUpQuiz: QuizDef = {
  id: "big-idea-backed-up-quiz",
  lessonId: "big-idea-backed-up",
  title: "Big Idea, Backed Up Quiz",
  standard: "RI.3.2",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-page-two-mostly-about",
      band: "easier",
      difficulty: 1,
      prompt: "What is this paragraph mostly about?",
      image: IMG("quiz-worm-tunnels"),
      narration: { audio: `${Q}/e-1-page-two-mostly-about.mp3`, script: "Here is a new true text called The Underground Gardeners. Listen to one paragraph from it. As a worm pushes through the ground, it leaves a tunnel behind it. Those tunnels let air and rainwater sink down to the roots of plants, instead of running off the top. Roots grow deeper and stronger in soil that is full of worm tunnels. What is this paragraph mostly about? Tap it." },
      hint: { audio: `${Q}/e-1-page-two-mostly-about-hint.mp3`, script: "All three sentences talk about the same thing. Ask what every sentence keeps coming back to." },
      explain: { audio: `${Q}/e-1-page-two-mostly-about-explain.mp3`, script: "Worm tunnels help the roots. Every sentence in the paragraph is about the tunnels and what they do for the roots of plants." },
      interaction: { type: "choose", options: [{ id: "worm-tunnels-help-the-roots", label: "worm tunnels help the roots" }, { id: "a-worm-leaves-a-tunnel", label: "a worm leaves a tunnel" }, { id: "worms-like-to-eat-leaves", label: "worms like to eat leaves" }], correctId: "worm-tunnels-help-the-roots", coachWrong: "One of those is only one small piece, and one is not in this paragraph at all. Find the idea all three sentences share." },
    },
    {
      id: "e-2-page-three-mostly-about",
      band: "easier",
      difficulty: 2,
      prompt: "What is this paragraph mostly about?",
      image: IMG("quiz-worm-leaf"),
      narration: { audio: `${Q}/e-2-page-three-mostly-about.mp3`, script: "Listen to another paragraph from The Underground Gardeners. At night, an earthworm comes up to the surface and drags dead leaves down into its hole. It eats the leaves along with bits of dirt, and what comes out the other end is called castings. Castings are packed with the food plants need, so a garden full of worms is a garden full of free fertilizer. What is this paragraph mostly about? Tap it." },
      hint: { audio: `${Q}/e-2-page-three-mostly-about-hint.mp3`, script: "Follow the leaves. Where do they go, and what do they turn into by the end of the paragraph?" },
      explain: { audio: `${Q}/e-2-page-three-mostly-about-explain.mp3`, script: "Castings feed the plants. The paragraph follows the leaves into the worm and out again as castings, and castings are packed with the food plants need." },
      interaction: { type: "choose", options: [{ id: "castings-feed-the-plants", label: "castings feed the plants" }, { id: "worms-come-up-at-night", label: "worms come up at night" }, { id: "worms-breathe-through-skin", label: "worms breathe through skin" }], correctId: "castings-feed-the-plants", coachWrong: "That is either one small piece of the paragraph or not in it at all. What does the whole paragraph build up to?" },
    },
    {
      id: "e-3-page-one-mostly-about",
      band: "easier",
      difficulty: 3,
      prompt: "What is this paragraph mostly about?",
      narration: { audio: `${Q}/e-3-page-one-mostly-about.mp3`, script: "Listen to the first paragraph of The Underground Gardeners. Under almost every lawn and garden, thousands of earthworms are hard at work. An earthworm has no eyes, no ears, and no legs, and it breathes through its wet skin. Gardeners love earthworms, because a worm makes the soil better for the plants growing above it. What is this paragraph mostly about? Tap it." },
      hint: { audio: `${Q}/e-3-page-one-mostly-about-hint.mp3`, script: "Two of the choices are true, but only one of them is what the paragraph is really about. Think about the last sentence." },
      explain: { audio: `${Q}/e-3-page-one-mostly-about-explain.mp3`, script: "Why gardeners love worms. The paragraph introduces earthworms and ends by telling you they make the soil better, which is why gardeners love them." },
      interaction: { type: "choose", options: [{ id: "why-gardeners-love-worms", label: "why gardeners love worms" }, { id: "a-worm-has-no-eyes", label: "a worm has no eyes" }, { id: "how-to-plant-a-garden", label: "how to plant a garden" }], correctId: "why-gardeners-love-worms", coachWrong: "One choice is a single small fact, and one is not in the paragraph. Which one covers the whole paragraph?" },
    },
    {
      id: "e-4-page-four-mostly-about",
      band: "easier",
      difficulty: 4,
      prompt: "What is this paragraph mostly about?",
      image: IMG("quiz-worm-rain"),
      narration: { audio: `${Q}/e-4-page-four-mostly-about.mp3`, script: "Listen to the last paragraph of The Underground Gardeners. Every day, worms carry soil from deep down up to the top and mix it all together, the way a gardener turns the dirt with a shovel. That mixing spreads the tunnels and the castings through the whole garden bed. After a heavy rain, you may see dozens of worms stretched out on a wet path. A famous scientist named Charles Darwin studied earthworms for years, and he wrote that few animals had done as much to shape the ground under our feet. What is this paragraph mostly about? Tap it." },
      hint: { audio: `${Q}/e-4-page-four-mostly-about-hint.mp3`, script: "The first two sentences do the main work. The wet path and the scientist are extras." },
      explain: { audio: `${Q}/e-4-page-four-mostly-about-explain.mp3`, script: "Worms stir up the soil. The paragraph is mostly about worms mixing deep soil with the top, and that mixing spreads the good stuff through the whole bed." },
      interaction: { type: "choose", options: [{ id: "worms-stir-up-the-soil", label: "worms stir up the soil" }, { id: "worms-lie-on-wet-paths", label: "worms lie on wet paths" }, { id: "gardens-need-sunshine", label: "gardens need sunshine" }], correctId: "worms-stir-up-the-soil", coachWrong: "One of those is a small extra fact, and one is not in the paragraph. What do the first two sentences describe?" },
    },
    {
      id: "c-1-big-idea-whole-text",
      band: "core",
      difficulty: 1,
      prompt: "Which sentence is the big idea of the whole text?",
      narration: { audio: `${Q}/c-1-big-idea-whole-text.mp3`, script: "Here is the whole text, The Underground Gardeners. Four sentences are on your screen. When the text ends, tap the one that is the big idea of the whole text. Under almost every lawn and garden, thousands of earthworms are hard at work. An earthworm has no eyes, no ears, and no legs, and it breathes through its wet skin. Gardeners love earthworms, because a worm makes the soil better for the plants growing above it. As a worm pushes through the ground, it leaves a tunnel behind it. Those tunnels let air and rainwater sink down to the roots of plants, instead of running off the top. Roots grow deeper and stronger in soil that is full of worm tunnels. At night, an earthworm comes up to the surface and drags dead leaves down into its hole. It eats the leaves along with bits of dirt, and what comes out the other end is called castings. Castings are packed with the food plants need, so a garden full of worms is a garden full of free fertilizer. Every day, worms carry soil from deep down up to the top and mix it all together. After a heavy rain, you may see dozens of worms stretched out on a wet path. A famous scientist named Charles Darwin studied earthworms for years, and he wrote that few animals had done as much to shape the ground under our feet." },
      hint: { audio: `${Q}/c-1-big-idea-whole-text-hint.mp3`, script: "Test each sentence against every paragraph. One covers only a single page, one is true but not the point, and one is not in the text at all." },
      explain: { audio: `${Q}/c-1-big-idea-whole-text-explain.mp3`, script: "Worms make the soil better. The tunnels, the castings, and the mixing are all ways worms make the soil better for plants, so that sentence covers the whole text." },
      interaction: { type: "choose", options: [{ id: "worms-make-the-soil-better", label: "worms make the soil better" }, { id: "worms-pull-leaves-into-holes", label: "worms pull leaves into holes" }, { id: "worms-have-no-eyes-or-ears", label: "worms have no eyes or ears" }, { id: "worms-are-good-fishing-bait", label: "worms are good fishing bait" }], correctId: "worms-make-the-soil-better", coachWrong: "Does that sentence cover the tunnels page, the castings page, and the mixing page? If it fits only one, or none, look again." },
    },
    {
      id: "c-2-which-detail-backs-it",
      band: "core",
      difficulty: 2,
      prompt: "Which detail backs up the big idea?",
      narration: { audio: `${Q}/c-2-which-detail-backs-it.mp3`, script: "The big idea of The Underground Gardeners is that worms make the soil better for plants. Listen to four sentences from the text. An earthworm has no eyes, no ears, and no legs. Those tunnels let air and rainwater sink down to the roots of plants. After a heavy rain, you may see dozens of worms stretched out on a wet path. Charles Darwin studied earthworms for years. A piece of each sentence is on your screen. Only one of them holds the big idea up. Tap it." },
      hint: { audio: `${Q}/c-2-which-detail-backs-it-hint.mp3`, script: "Ask the tent question. If you pulled this detail out, would the big idea still stand? Three of them are only flags." },
      explain: { audio: `${Q}/c-2-which-detail-backs-it-explain.mp3`, script: "Air and rainwater sink down. Tunnels that carry air and water to the roots are one way worms make the soil better. No eyes, wet paths, and a scientist are interesting, but they do not hold the big idea up." },
      interaction: { type: "choose", options: [{ id: "air-and-rainwater-sink-down", label: "air and rainwater sink down" }, { id: "no-eyes-no-ears-and-no-legs", label: "no eyes, no ears, no legs" }, { id: "worms-on-a-wet-path", label: "worms on a wet path" }, { id: "studied-earthworms-for-years", label: "studied earthworms for years" }], correctId: "air-and-rainwater-sink-down", coachWrong: "That detail is true, but pull it out and the big idea still stands. Find the one that shows how worms make the soil better." },
    },
    {
      id: "c-3-sort-holds-it-up",
      band: "core",
      difficulty: 3,
      prompt: "Sort the details: Holds It Up, or Just Interesting?",
      narration: { audio: `${Q}/c-3-sort-holds-it-up.mp3`, script: "The big idea is that worms make the soil better for plants. Here are six details from The Underground Gardeners, and every one of them is true. If a detail holds the big idea up, drag it to Holds It Up. If it is only interesting, drag it to Just Interesting." },
      hint: { audio: `${Q}/c-3-sort-holds-it-up-hint.mp3`, script: "For each one, ask whether it shows a way worms make the soil better. If it does not, it is only a flag." },
      explain: { audio: `${Q}/c-3-sort-holds-it-up-explain.mp3`, script: "Tunnels bringing air to the roots, castings feeding the plants, and worms mixing the deep soil with the top all hold the big idea up. No eyes, wet paths, and Darwin are just interesting." },
      interaction: { type: "sort", buckets: ["Holds It Up","Just Interesting"], bucketAudio: { "Holds It Up": `${Q}/b-holds-it-up.mp3`, "Just Interesting": `${Q}/b-just-interesting.mp3` }, items: [{ label: "tunnels bring air to roots", bucket: "Holds It Up" }, { label: "a worm has no eyes", bucket: "Just Interesting" }, { label: "castings feed the plants", bucket: "Holds It Up" }, { label: "worms lie on wet paths", bucket: "Just Interesting" }, { label: "worms mix deep and top soil", bucket: "Holds It Up" }, { label: "Darwin studied worms", bucket: "Just Interesting" }], coachWrong: "Ask the tent question again. Does that detail show a way worms make the soil better, or is it only a fact about worms?" },
    },
    {
      id: "c-4-why-it-backs-up",
      band: "core",
      difficulty: 4,
      prompt: "Why does that detail back up the big idea?",
      narration: { audio: `${Q}/c-4-why-it-backs-up.mp3`, script: "Here is a detail. The text says castings are packed with the food plants need. That backs up the big idea because, and now you finish the sentence. Read all four endings, then tap the one that tells how the detail holds the big idea up." },
      hint: { audio: `${Q}/c-4-why-it-backs-up-hint.mp3`, script: "The ending has to connect the castings to better soil. Think about what the plants get out of it." },
      explain: { audio: `${Q}/c-4-why-it-backs-up-explain.mp3`, script: "Plants get free food. Castings full of plant food make the soil richer, and richer soil is better soil for plants." },
      interaction: { type: "choose", options: [{ id: "plants-get-free-food", label: "plants get free food" }, { id: "worms-get-to-eat-leaves", label: "worms get to eat leaves" }, { id: "the-leaves-vanish-at-night", label: "the leaves vanish at night" }, { id: "castings-are-easy-to-see", label: "castings are easy to see" }], correctId: "plants-get-free-food", coachWrong: "That ending is about the worms or the leaves, not about the soil. Which ending tells what the plants get?" },
    },
    {
      id: "c-5-sequence-big-idea-first",
      band: "core",
      difficulty: 5,
      prompt: "Build it: the big idea first, then its poles in text order.",
      narration: { audio: `${Q}/c-5-sequence-big-idea-first.mp3`, script: "Now build the whole thing. The big idea goes first. Under it go three details that hold it up, in the order the text gave them, tunnels, then castings, then mixing. Drag the four pieces into that order." },
      hint: { audio: `${Q}/c-5-sequence-big-idea-first-hint.mp3`, script: "Start with the sentence that covers the whole text. Then think about which page came first, the tunnels, the castings, or the mixing." },
      explain: { audio: `${Q}/c-5-sequence-big-idea-first-explain.mp3`, script: "First the big idea, worms make the soil better. Then the tunnels that let in air and water, then the castings that feed the plants, then worms mixing up the soil." },
      interaction: { type: "sequence", items: [{ id: "worms-make-the-soil-better", label: "worms make the soil better" }, { id: "tunnels-let-in-air-and-water", label: "tunnels let in air and water" }, { id: "castings-feed-the-plants", label: "castings feed the plants" }, { id: "worms-mix-up-the-soil", label: "worms mix up the soil" }], order: ["worms-make-the-soil-better","tunnels-let-in-air-and-water","castings-feed-the-plants","worms-mix-up-the-soil"], coachWrong: "The big idea is the sentence that covers every page. After it, walk the text in order: tunnels came before castings, and mixing came last." },
    },
    {
      id: "c-6-speak-big-idea-and-detail",
      band: "core",
      difficulty: 6,
      prompt: "Say the big idea, then one detail that backs it up. Start the detail with, the text says.",
      narration: { audio: `${Q}/c-6-speak-big-idea-and-detail.mp3`, script: "Now the sentence is yours. Tap the mic. First tell me the big idea of The Underground Gardeners in one sentence. Then say, the text says, and give one detail that holds it up." },
      hint: { audio: `${Q}/c-6-speak-big-idea-and-detail-hint.mp3`, script: "Think about what worms do for the soil, then pick one page that shows it, the tunnels, the castings, or the mixing." },
      explain: { audio: `${Q}/c-6-speak-big-idea-and-detail-explain.mp3`, script: "Worms make the soil better for plants. The text says their tunnels let air and rainwater sink down to the roots, and that is one way the soil gets better." },
      interaction: { type: "speak", text: "soil dirt ground better good healthy rich plants roots grow grows tunnels tunnel air water rainwater castings food fertilizer mix mixes mixing leaves garden gardens worms worm helps help" },
    },
    {
      id: "h-1-what-is-a-summary",
      band: "harder",
      difficulty: 1,
      prompt: "Which sentence belongs in a summary of the text?",
      narration: { audio: `${Q}/h-1-what-is-a-summary.mp3`, script: "Here is a fourth grade tool, the summary. A summary is the big idea plus the key details, told in two or three sentences in your own words, with the flags left out. Listen to a summary of just the tunnels page. Worm tunnels help plants. They let air and water reach the roots, so the roots grow stronger. Notice what got left out. Nothing about eyes, or wet paths, or scientists. A summary keeps only what holds the big idea up. Now think about the whole text. Four sentences are on your screen. Only one of them belongs in a summary of The Underground Gardeners. Tap it." },
      hint: { audio: `${Q}/h-1-what-is-a-summary-hint.mp3`, script: "A summary keeps the poles and drops the flags. Which sentence shows a way worms make the soil better?" },
      explain: { audio: `${Q}/h-1-what-is-a-summary-explain.mp3`, script: "Tunnels carry water to roots. That detail holds the big idea up, so it belongs in the summary. No legs, wet paths, and a scientist are flags, and a summary leaves them out." },
      interaction: { type: "choose", options: [{ id: "tunnels-carry-water-to-roots", label: "tunnels carry water to roots" }, { id: "a-worm-has-no-legs", label: "a worm has no legs" }, { id: "worms-rest-on-wet-paths", label: "worms rest on wet paths" }, { id: "darwin-studied-for-years", label: "Darwin studied for years" }], correctId: "tunnels-carry-water-to-roots", coachWrong: "That one is a flag. It is true, but it does not show how worms make the soil better, so a summary leaves it out." },
    },
    {
      id: "h-2-cut-the-flag",
      band: "harder",
      difficulty: 2,
      prompt: "Which sentence should be cut from this summary?",
      narration: { audio: `${Q}/h-2-cut-the-flag.mp3`, script: "A summary has to stay short, so every sentence in it has to earn its place. Listen to a summary that has one sentence too many. Earthworms make the soil better for plants. Their tunnels let in air and water. Their castings feed the plants. Worms have no eyes. Worms mix up the soil. One of those sentences is a flag, and it does not belong. The four details are on your screen. Tap the one that should be cut." },
      hint: { audio: `${Q}/h-2-cut-the-flag-hint.mp3`, script: "Ask each sentence whether it shows a way worms make the soil better. The one that does not is the one to cut." },
      explain: { audio: `${Q}/h-2-cut-the-flag-explain.mp3`, script: "Worms have no eyes. It is true and interesting, but it does not hold the big idea up, so it is cut. Tunnels, castings, and mixing all stay." },
      interaction: { type: "choose", options: [{ id: "worms-have-no-eyes", label: "worms have no eyes" }, { id: "tunnels-let-in-air-and-water", label: "tunnels let in air and water" }, { id: "castings-feed-the-plants", label: "castings feed the plants" }, { id: "worms-mix-up-the-soil", label: "worms mix up the soil" }], correctId: "worms-have-no-eyes", coachWrong: "That sentence is a pole. It shows one way worms make the soil better, so it stays. Find the sentence that is only interesting." },
    },
    {
      id: "h-3-own-words",
      band: "harder",
      difficulty: 3,
      prompt: "Which sentence says the big idea in your own words?",
      narration: { audio: `${Q}/h-3-own-words.mp3`, script: "A summary says the big idea in your own words, not in the words the text used. The text says a worm makes the soil better for the plants growing above it. Four sentences are on your screen. One of them says that same big idea in different words. The other three say something else. Tap the one that means the same thing as the big idea." },
      hint: { audio: `${Q}/h-3-own-words-hint.mp3`, script: "Better soil is good for plants. Which sentence is about plants doing well because of worms?" },
      explain: { audio: `${Q}/h-3-own-words-explain.mp3`, script: "Worms help plants grow well. That says the big idea in new words. The other three are single facts, not the big idea." },
      interaction: { type: "choose", options: [{ id: "worms-help-plants-grow-well", label: "worms help plants grow well" }, { id: "worms-have-no-eyes-or-ears", label: "worms have no eyes or ears" }, { id: "rain-brings-worms-outside", label: "rain brings worms outside" }, { id: "castings-are-worm-poop", label: "castings are worm poop" }], correctId: "worms-help-plants-grow-well", coachWrong: "That is one fact, not the big idea. Which sentence covers everything worms do for the soil, in new words?" },
    },
    {
      id: "h-4-speak-two-sentence-summary",
      band: "harder",
      difficulty: 4,
      prompt: "Say a two-sentence summary: the big idea, then the key details. Leave the flags out.",
      narration: { audio: `${Q}/h-4-speak-two-sentence-summary.mp3`, script: "Last one. Give me a summary of The Underground Gardeners in two sentences, in your own words. Sentence one is the big idea. Sentence two names the key details that hold it up, and leaves the flags out. Tap the mic and say your summary." },
      hint: { audio: `${Q}/h-4-speak-two-sentence-summary-hint.mp3`, script: "Start with what worms do for the soil. Then name the tunnels, the castings, and the mixing, and skip the eyes and the wet paths." },
      explain: { audio: `${Q}/h-4-speak-two-sentence-summary-explain.mp3`, script: "Earthworms make the soil better for plants. Their tunnels let in air and water, their castings feed the plants, and they mix the deep soil with the top." },
      interaction: { type: "speak", text: "worms worm earthworms soil dirt ground better good healthy rich plants roots grow tunnels tunnel air water rainwater castings food fertilizer mix mixes mixing leaves help helps garden" },
    },
  ],
};
