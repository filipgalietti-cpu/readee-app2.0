import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./point-to-the-fact-timings.json";

// Point to the Fact (RI.3.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=point-to-the-fact
// G3-U1. EXPLICIT TEXT REFERENCE tier of RI.3.1, the informational twin of
// show-me-where (RL.3.1). Sibling split: fact-finder-basics (RI.K.1, owls),
// fact-questions (RI.1.1, ants), fact-finders-ask (RI.2.1, Arctic tern) own
// who/what/where/when/why/how on fact texts at K-2; because-then-so (RI.3.3)
// owns time/cause signal words. THIS lesson owns "answer, then point to the
// sentence" on a FACT text: right there facts (one sentence), put together
// facts (two sentences combined), and facts the text never states (a fact
// that is TRUE in the world but that the text does not say is not an answer
// from the text), plus the asking half (which question does this sentence
// answer; which question would you still need to look up). ONE original
// informational text, "The Tallest Trees on Earth" (coast redwoods; every
// fact true: northern California coast, taller than a thirty story building,
// trunk wider than a car is long, summer fog drip on the needles, bark up to
// a foot thick and water-packed so fire rarely burns through, shallow roots
// that spread wide and tangle with neighbors, canopy soil with ferns and
// salamanders, two thousand year lives, new trunks sprouting from the roots
// in a ring), 16 sentences over 5 child-read pages (read-along 1/3/5 with
// images, speak 2/4), compound + early-complex sentences, one quoted park
// ranger with a speech tag, no digits, stretch words moisture / scorch /
// shallow / canopy / sprout with in-text support. Planted: the put together
// (page 3 thick wet bark + hard to burn = why they survive fire; page 4
// shallow roots + tangle with neighbors = why a redwood needs its neighbors)
// and the true-in-the-world traps the text never states (cars drive through
// some trunks; the bark is reddish, which is why they are called redwoods;
// how many are left). ANCHOR FRESHNESS grep-swept vs every lessons-v2 +
// quizzes-v2 file: redwood, sequoia, salamander, canopy, scorch all 0 hits;
// fog/needles/stump only as phonics or picture words. Keys prefixed quiz- are
// fresh stimuli for the quiz (sloths: algae, jaguar, rainforest text all
// first-touch).

const A = (id: string) => `/audio/lessons-v2/point-to-the-fact/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/point-to-the-fact/${w.toLowerCase()}.png`;

export const pointToTheFactImages: Record<string, string | { subject: string; ref?: string }> = {
  "coast-giants": "Looking up from the forest floor at a grove of enormously tall redwood trees with thick reddish brown trunks rising into soft white fog, thin shafts of sunlight breaking through the mist, green ferns on the ground, and a tiny child in a yellow raincoat standing at the base of the widest trunk for scale. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "fire-scars": "A close view of the base of a giant living redwood tree with thick, deeply grooved reddish brown bark and a wide black scorch mark burned into the lower trunk, fresh green ferns growing around its base, several other tall redwoods standing behind it in a sunny forest, no flames anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "canopy-garden": "A view high up in the branches of a giant redwood tree, a wide mossy branch with a thick layer of dark soil in its crook where green ferns, small leafy bushes, and one tiny young tree are growing, a small orange spotted salamander resting on the moss, other huge reddish brown trunks and soft white fog far below in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-sloth-hanging": "A shaggy brown sloth with a greenish tint to its fur hanging upside down from a thick rainforest branch by its long curved claws, eyes half closed and peaceful, big green leaves and vines all around, dappled sunlight. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-sloth-crawling": "A shaggy brown sloth lying flat on the rainforest floor, slowly dragging itself forward with its long curved front claws, belly on the ground, a big tree trunk with roots beside it and fallen leaves around, no other animals. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-sloth-swimming": "A shaggy brown sloth swimming across a calm green jungle river with its head held above the water and its long arms reaching forward in a slow stroke, rainforest trees on the far bank, small ripples around it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const pointToTheFact: LessonDef = {
  id: "point-to-the-fact",
  title: "Point to the Fact",
  grade: "3rd Grade",
  standard: "RI.3.1",
  archetype: "inference",
  objective: "I can answer a question about a fact text and point to the exact sentence that says it.",
  concepts: [
    "answer, then point to the sentence",
    "right there: one sentence holds the fact",
    "put together: two sentences make the fact",
    "a true fact the text never says is not an answer from the text",
    "which question does this sentence answer",
    "which question would you still need to look up",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a true text about the tallest trees on Earth, and you pointed to the sentence every single time. Right there facts, put together facts, and the honest words, the text does not say. That is how third grade readers prove what they know.",
    "title": "Point to the Fact!",
    "body": "You answered questions about a true text, pointed to the exact sentences that prove each answer, and knew when the text did not say."
  },
  scenes: [
    {
      id: "hook-coast-giants",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Tallest Trees on Earth, page one. Read along!",
      image: IMG("coast-giants"),
      narration: { audio: A("hook-coast-giants"), script: "Hello, reader. In third grade, answering a question about a fact text is only half the job. The other half is pointing to the sentence that says it. Here is page one of a true text called The Tallest Trees on Earth. Read along with me, and keep track of what each sentence tells you." },
      interaction: { type: "read-along", text: "Along a foggy stretch of coast in northern California grows the tallest kind of tree on Earth, the coast redwood. The tallest redwood ever measured stands higher than a thirty story building, and it is still growing. The trunk of a giant redwood is wider than a car is long, and its top branches disappear into the fog.", audio: A("hook-coast-giants-sentence") },
    },
    {
      id: "model-right-there",
      purpose: "model",
      gate: "none",
      prompt: "Answer, then point to the sentence.",
      fx: {"text":"Answer, then **point to the sentence**","effect":"underline"},
      narration: { audio: A("model-right-there"), script: "Here is how I do both halves. My question is, how tall is the tallest redwood? I think I know, but a third grade reader does not stop at the answer. I hunt through page one until I find the sentence, and I read it back as my proof. The text says, stands higher than a thirty story building. There it is. Answer, taller than a thirty story building. Proof, that sentence. When one sentence holds the whole fact, I call it a right there fact." },
    },
    {
      id: "guided-choose-proof-line",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where do coast redwoods grow? Tap the piece of the text that proves it.",
      narration: { audio: A("guided-choose-proof-line"), script: "Your turn to point. Where do coast redwoods grow? Say the answer in your head. Now do the pointing half. Four pieces of page one are on your screen, and only one of them proves your answer. Tap that one." },
      interaction: { type: "choose", options: [{ id: "a-foggy-stretch-of-coast", label: "a foggy stretch of coast" }, { id: "a-thirty-story-building", label: "a thirty story building" }, { id: "wider-than-a-car-is-long", label: "wider than a car is long" }, { id: "it-is-still-growing", label: "it is still growing" }], correctId: "a-foggy-stretch-of-coast", coachWrong: "That piece is really in the text, but it answers a different question. Find the piece that tells where the redwoods grow." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Rain hardly falls on this coast in summer, so the redwoods drink fog instead. When thick fog rolls in from the ocean, millions of tiny drops collect on the needles high in the tree. The drops join together and drip to the ground, where the roots soak up the moisture.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and pay attention to what the fog does, because you will point to it soon." },
      interaction: { type: "speak", text: "Rain hardly falls on this coast in summer so the redwoods drink fog instead When thick fog rolls in from the ocean millions of tiny drops collect on the needles high in the tree The drops join together and drip to the ground where the roots soak up the moisture" },
    },
    {
      id: "guided-choose-which-question",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question does this sentence answer?",
      fx: {"text":"When thick fog rolls in from the ocean, **millions of tiny drops collect on the needles** high in the tree.","effect":"glow"},
      narration: { audio: A("guided-choose-which-question"), script: "Now comes the asking half. A strong reader can look at one sentence and know which question it answers. Here is a sentence from page two. Read it again, and think about what it tells you. Four questions are on your screen. Tap the question that this sentence answers." },
      interaction: { type: "choose", options: [{ id: "where-do-the-drops-collect", label: "where do the drops collect" }, { id: "how-tall-is-the-tallest-tree", label: "how tall is the tallest tree" }, { id: "how-thick-is-the-bark", label: "how thick is the bark" }, { id: "how-long-can-a-redwood-live", label: "how long can a redwood live" }], correctId: "where-do-the-drops-collect", coachWrong: "The text can answer that question, but not with this sentence. Look at what the drops do. What does this sentence explain?" },
    },
    {
      id: "model-fact-not-in-text",
      purpose: "model",
      gate: "none",
      prompt: "A true fact the text never says is not an answer from the text.",
      fx: {"text":"No sentence? Then it is **not from the text**","effect":"cross-out"},
      narration: { audio: A("model-fact-not-in-text"), script: "Here is the trap that catches many third graders. Someone asks, can a car drive through a redwood? A fact pops up that you may have seen in a picture. Some redwoods have a tunnel cut right through the trunk, and cars drive through it. That is true in the world. Now hunt for the sentence. Page one talks about how tall and how wide they are. Page two talks about fog. Not one sentence says anything about a tunnel. A fact the text never says is not an answer from the text, even when it is true. When that happens, the honest answer is, the text does not say." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch for a danger.",
      image: IMG("fire-scars"),
      narration: { audio: A("page-3-read"), script: "Page three is about a danger these trees face. Read along with me." },
      interaction: { type: "read-along", text: "A redwood's bark can be a foot thick, and it is packed with water. Thick, wet bark is very hard for flames to burn through. Forest fires have swept through these woods many times, yet most of the giants survive with only black scorch marks on their trunks.", audio: A("page-3-read-sentence") },
    },
    {
      id: "model-put-together",
      purpose: "model",
      gate: "none",
      prompt: "Some facts take two sentences.",
      fx: {"text":"**Two** sentences, **one** fact","effect":"pop-words"},
      narration: { audio: A("model-put-together"), script: "Some questions have no single sentence. My question is, why do most redwoods survive a fire? Page three says, most of the giants survive with only black scorch marks. That tells me they survive, but not why. So I keep hunting. One sentence says, a redwood's bark can be a foot thick, and it is packed with water. The next sentence says, thick, wet bark is very hard for flames to burn through. Now I put the two together. The bark is thick and wet, and thick wet bark is hard to burn, so the fire cannot get through to the tree. Two sentences, one fact. I call that a put together fact, and I point to both sentences." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The roots of a redwood grow only a few feet down, which seems far too shallow for such a heavy tree. Instead of going deep, the roots spread out wide and tangle with the roots of the trees around them. \"A redwood forest holds itself up,\" said one park ranger, \"because no tree in it stands alone.\"",
      narration: { audio: A("page-4-read"), script: "Page four is yours, and it holds two sentences you will need in a minute. Read all three sentences out loud, including what the park ranger said." },
      interaction: { type: "speak", text: "The roots of a redwood grow only a few feet down which seems far too shallow for such a heavy tree Instead of going deep the roots spread out wide and tangle with the roots of the trees around them A redwood forest holds itself up said one park ranger because no tree in it stands alone" },
    },
    {
      id: "apply-choose-finish-proof",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why does a redwood need the trees around it? Tap the piece that finishes the proof.",
      narration: { audio: A("apply-choose-finish-proof"), script: "Now you build a put together fact. Why does a redwood need the trees around it? Here is the first half of the proof. Page four says, the roots grow only a few feet down, far too shallow for such a heavy tree. That is a problem, but it is not the whole answer. Tap the piece of the text that finishes the proof." },
      interaction: { type: "choose", options: [{ id: "spread-out-wide-and-tangle", label: "spread out wide and tangle" }, { id: "roots-soak-up-the-moisture", label: "roots soak up the moisture" }, { id: "packed-with-water", label: "packed with water" }, { id: "said-one-park-ranger", label: "said one park ranger" }], correctId: "spread-out-wide-and-tangle", coachWrong: "That piece is true, but it does not connect to the shallow roots. Which piece tells what the roots do instead of going deep?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("canopy-garden"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and notice how much life one tree can hold." },
      interaction: { type: "read-along", text: "High in the canopy, fallen needles pile up in the crooks of the branches and slowly rot into soil. Ferns, bushes, and even small trees sprout from that soil, and some salamanders spend their whole lives up there without ever touching the ground. A redwood can live for more than two thousand years, far longer than any person. When an old redwood finally falls, new trunks sprout from its roots and grow in a ring around the stump, so the forest never stands empty for long.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-text-does-not-say",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why are these trees called redwoods?",
      narration: { audio: A("apply-choose-text-does-not-say"), script: "Here is a question with a trap in it. Why are these trees called redwoods? You may already know a fact that fits. Before you tap, hunt through every page for a sentence that says so. If no sentence backs an answer, you know what to do." },
      interaction: { type: "choose", options: [{ id: "the-text-does-not-say", label: "the text does not say" }, { id: "their-bark-is-reddish", label: "their bark is reddish" }, { id: "they-grow-in-red-soil", label: "they grow in red soil" }, { id: "their-needles-turn-red", label: "their needles turn red" }], correctId: "the-text-does-not-say", coachWrong: "That may even be true, but can you point to the sentence? If no page says it, it is not an answer from the text." },
    },
    {
      id: "apply-sort-in-the-text",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: In the Text, or Not in the Text?",
      narration: { audio: A("apply-sort-in-the-text"), script: "Here are six facts about redwoods, and every one of them is true in the world. Only some of them have a sentence in our text that says so. Read each fact. If you can point to a sentence, drag it to In the Text. If no sentence says it, drag it to Not in the Text." },
      interaction: { type: "sort", buckets: ["In the Text","Not in the Text"], items: [{ label: "fog drips from the needles", bucket: "In the Text" }, { label: "some trunks have a tunnel", bucket: "Not in the Text" }, { label: "bark can be a foot thick", bucket: "In the Text" }, { label: "the cones are tiny", bucket: "Not in the Text" }, { label: "salamanders live up high", bucket: "In the Text" }, { label: "they keep needles all winter", bucket: "Not in the Text" }], coachWrong: "Hunt for the sentence. If you can find one that says it, it is in the text. If every page comes up empty, it is not, even when the fact is true." },
    },
    {
      id: "apply-choose-look-it-up",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which question would you still need to look up?",
      narration: { audio: A("apply-choose-look-it-up"), script: "The asking half again, with a twist. A good reader also knows what a text leaves out. Four questions are on your screen. Three of them have a sentence in our text that answers them. One of them does not, and you would need another book to answer it. Tap the question you would still need to look up." },
      interaction: { type: "choose", options: [{ id: "how-many-redwoods-are-left", label: "how many redwoods are left" }, { id: "how-deep-do-the-roots-grow", label: "how deep do the roots grow" }, { id: "how-thick-is-the-bark", label: "how thick is the bark" }, { id: "how-long-can-a-redwood-live", label: "how long can a redwood live" }], correctId: "how-many-redwoods-are-left", coachWrong: "Our text has a sentence that answers that one. Hunt for the question no page answers." },
    },
    {
      id: "challenge-speak-answer-and-point",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What happens when an old redwood falls? Answer, then say the sentence that proves it.",
      narration: { audio: A("challenge-speak-answer-and-point"), script: "Last one, and you do both halves out loud. What happens when an old redwood finally falls? Tap the mic. Tell me your answer, then say the sentence from page five that proves it. Start your proof with, the text says." },
      interaction: { type: "speak", text: "new trunks trunk sprout sprouts sprouting roots root ring circle around stump grow grows grew young trees baby tree" },
    },
    {
      id: "celebrate-point-to-the-fact",
      purpose: "celebrate",
      gate: "none",
      prompt: "Answer, then point to the sentence.",
      fx: {"text":"Answer, then **point to the sentence**","effect":"fireworks"},
      narration: { audio: A("celebrate-point-to-the-fact"), script: "Today you did both halves. You answered questions about a true text, and then you pointed to the sentence that says so. Some facts were right there in one sentence. Some took two sentences put together. And when the text never said it, you did not guess, even when you knew a fact that fit. You said, the text does not say. From now on, when someone asks you about a fact book, you will show them exactly where it says so." },
    },
  ],
};
