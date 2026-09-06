import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Facts Say, So I Know QUIZ (RI.4.1) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second
// informational text, "The Rat That Never Drinks" (the kangaroo rat; every
// fact true: the driest parts of the American West, a rodent with a long
// tufted tail and back feet so large it hops like a kangaroo, spends the
// blazing day in a burrow and plugs the entrance with sand until sundown,
// gathers seeds at night in cheek pouches, its body pulls water out of the
// seeds it eats, it hardly sweats and its droppings are nearly dry, kept
// healthy for months on nothing but dry seeds without a drop to drink, large
// hollow chambers in the skull that sharpen its hearing so it can leap from
// the swish of an owl's wings, fur-lined cheek pouches that keep the seeds
// dry). The text is spoken page by page INSIDE the questions so every Q is
// self-contained; two sentences are the child's on-screen read-alouds and are
// NEVER narrated anywhere in the quiz (page four's fur-lined pouches in e-4,
// the last sentence of page three about hearing in h-3). Bands: easier
// (G3-bridge explicit where / what at 3 options with picture support only
// where the picture is the evidence, a G3 proving-line pick, and a
// one-sentence read-aloud) / core (on-grade G4: explicit vs inference, the
// supported inference, BEST evidence among four true details, a six-item
// Supported / Not Supported sort with b-* bucket clips, the EXAMPLE the
// writer uses to prove the point, and a production speak in the "the text
// says, so I can tell" shape with a full accept list) / harder (G5 transfer,
// RI.5.1 QUOTING ACCURATELY: taught in h-1 on page two, then applied to page
// one; applied again to the words that back an inference on page two; the
// hearing sentence read aloud; a closing production speak that quotes exact
// words then states the inference). Nothing from the lesson text (mangroves,
// stilts, salt, seedlings, villages, fishers) is reused. Topic grep-swept vs
// lessons-v2 + quizzes-v2: kangaroo rat, cheek pouches, burrow plug, tufted
// tail all 0 hits. Quiz support images live in the lesson's image dir (quiz-
// keys), no digits, no real person named.

const Q = "/audio/quizzes-v2/facts-say-so-i-know-quiz";
const IMG = (w: string) => `/images/lessons-v2/facts-say-so-i-know/${w.toLowerCase()}.png`;

export const factsSaySoIKnowQuiz: QuizDef = {
  id: "facts-say-so-i-know-quiz",
  lessonId: "facts-say-so-i-know",
  title: "Facts Say, So I Know Quiz",
  standard: "RI.4.1",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-where-it-spends-the-day",
      band: "easier",
      difficulty: 1,
      prompt: "Where does a kangaroo rat spend the day?",
      image: IMG("quiz-burrow"),
      narration: { audio: `${Q}/e-1-where-it-spends-the-day.mp3`, script: "Here is page one of a new text called The Rat That Never Drinks. Listen for where the animal spends its day, and then tap the answer. In the driest parts of the American West, where rain may not fall for months, a small animal makes its home and never needs a drink. It is the kangaroo rat, a rodent with a long tufted tail and back feet so large that it hops across the sand the way a kangaroo does. The kangaroo rat spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down." },
      hint: { audio: `${Q}/e-1-where-it-spends-the-day-hint.mp3`, script: "A where question asks about a place. The last sentence of the page tells where it spends the whole day, and the picture shows that doorway packed shut." },
      explain: { audio: `${Q}/e-1-where-it-spends-the-day-explain.mp3`, script: "The text says the kangaroo rat spends the whole blazing day inside its burrow. Inside its burrow is the answer." },
      interaction: { type: "choose", options: [{ id: "inside-its-burrow", label: "inside its burrow" }, { id: "on-top-of-a-rock", label: "on top of a rock" }, { id: "under-a-bush", label: "under a bush" }], correctId: "inside-its-burrow", coachWrong: "Look at the picture. The doorway is packed shut with sand. What is that doorway the entrance to?" },
    },
    {
      id: "e-2-what-it-gathers",
      band: "easier",
      difficulty: 2,
      prompt: "What does the kangaroo rat gather at night?",
      image: IMG("quiz-kangaroo-rat"),
      narration: { audio: `${Q}/e-2-what-it-gathers.mp3`, script: "Page two of The Rat That Never Drinks. Listen for what the animal gathers at night, and then tap it. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Its body pulls water out of the seeds it eats, and it wastes almost none of that water, since it hardly sweats and its droppings are nearly dry." },
      hint: { audio: `${Q}/e-2-what-it-gathers-hint.mp3`, script: "The first sentence of the page names what it gathers, and the picture shows some of it lying on the sand." },
      explain: { audio: `${Q}/e-2-what-it-gathers-explain.mp3`, script: "The text says at night it comes out to gather seeds. Seeds is the answer." },
      interaction: { type: "choose", options: [{ id: "seeds", label: "seeds" }, { id: "insects", label: "insects" }, { id: "green-leaves", label: "green leaves" }], correctId: "seeds", coachWrong: "Look at the sand in the picture. What small things are scattered there?" },
    },
    {
      id: "e-3-proof-of-no-drinking",
      band: "easier",
      difficulty: 3,
      prompt: "Which part proves that it never needs a drink?",
      narration: { audio: `${Q}/e-3-proof-of-no-drinking.mp3`, script: "Third grade readers point to the words that prove an answer, and fourth grade readers still do it. The text says a kangaroo rat never needs a drink. Three parts of sentences are on your screen, and all three are really on the pages. Only one of them proves that the animal can live without drinking. Tap the proof after you hear page two again. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Its body pulls water out of the seeds it eats, and it wastes almost none of that water, since it hardly sweats and its droppings are nearly dry." },
      hint: { audio: `${Q}/e-3-proof-of-no-drinking-hint.mp3`, script: "Proof of no drinking has to be about water. Which part says where its water comes from?" },
      explain: { audio: `${Q}/e-3-proof-of-no-drinking-explain.mp3`, script: "The proof is, pulls water out of the seeds. If its body gets water from food, it does not need to drink." },
      interaction: { type: "choose", options: [{ id: "pulls-water-out-of-the-seeds", label: "pulls water out of the seeds" }, { id: "hops-across-the-sand", label: "hops across the sand" }, { id: "plugs-the-entrance-with-sand", label: "plugs the entrance with sand" }], correctId: "pulls-water-out-of-the-seeds", coachWrong: "That part is on a page, but it is not about water. Find the part that tells where the water comes from." },
    },
    {
      id: "e-4-speak-read-cheek-pouches",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Its cheek pouches are lined with fur instead of wet skin, so the seeds it carries stay dry all the way home.",
      narration: { audio: `${Q}/e-4-speak-read-cheek-pouches.mp3`, script: "The sentence on your screen is page four of the text, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-cheek-pouches-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Its cheek pouches." },
      explain: { audio: `${Q}/e-4-speak-read-cheek-pouches-explain.mp3`, script: "The sentence tells you that the cheek pouches are lined with fur, not wet skin, so the seeds stay dry on the trip home." },
      interaction: { type: "speak", text: "Its cheek pouches are lined with fur instead of wet skin so the seeds it carries stay dry all the way home" },
    },
    {
      id: "c-1-which-is-inference",
      band: "core",
      difficulty: 1,
      prompt: "Three questions are explicit. Tap the inference question.",
      narration: { audio: `${Q}/c-1-which-is-inference.mp3`, script: "Page one again, and then four questions about it. Three of the questions are explicit, because the page answers them outright. One is an inference question, because no sentence answers it, and you would have to work it out from the details. Tap the inference question after you hear the page. In the driest parts of the American West, where rain may not fall for months, a small animal makes its home and never needs a drink. It is the kangaroo rat, a rodent with a long tufted tail and back feet so large that it hops across the sand the way a kangaroo does. The kangaroo rat spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down." },
      hint: { audio: `${Q}/c-1-which-is-inference-hint.mp3`, script: "Each question needs a sentence that answers it. Three of them have one, and the fourth makes you work it out from the details." },
      explain: { audio: `${Q}/c-1-which-is-inference-explain.mp3`, script: "The inference question is why it plugs the entrance. The page says that it plugs the entrance with sand, but it never says why, so a reader has to work that out from the details." },
      interaction: { type: "choose", options: [{ id: "why-it-plugs-the-entrance", label: "why it plugs the entrance" }, { id: "how-it-moves-across-the-sand", label: "how it moves across the sand" }, { id: "what-it-plugs-the-hole-with", label: "what it plugs the hole with" }, { id: "where-it-makes-its-home", label: "where it makes its home" }], correctId: "why-it-plugs-the-entrance", coachWrong: "A sentence on page one answers that one outright, so it is explicit. Find the question that no sentence answers." },
    },
    {
      id: "c-2-supported-inference-plug",
      band: "core",
      difficulty: 2,
      prompt: "Why does the kangaroo rat plug its burrow by day?",
      narration: { audio: `${Q}/c-2-supported-inference-plug.mp3`, script: "Now an inference. Page one never says why the animal plugs its doorway, but it plants details around that sentence, about the place where it lives and the kind of day it hides from. Four reasons are on your screen, and only one of them is what the details let you know. Here is page one. In the driest parts of the American West, where rain may not fall for months, a small animal makes its home and never needs a drink. It is the kangaroo rat, a rodent with a long tufted tail and back feet so large that it hops across the sand the way a kangaroo does. The kangaroo rat spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down." },
      hint: { audio: `${Q}/c-2-supported-inference-plug-hint.mp3`, script: "Think about the word that describes the day, and the words that describe the place. What is the plug keeping out?" },
      explain: { audio: `${Q}/c-2-supported-inference-plug-explain.mp3`, script: "The details point to, to keep out the daytime heat. The place is the driest part of the West, the day is blazing, and the plug stays until the sun goes down." },
      interaction: { type: "choose", options: [{ id: "to-keep-out-the-daytime-heat", label: "to keep out the daytime heat" }, { id: "to-keep-other-rats-away", label: "to keep other rats away" }, { id: "to-hide-its-seeds-from-birds", label: "to hide its seeds from birds" }, { id: "to-sleep-in-the-dark", label: "to sleep in the dark" }], correctId: "to-keep-out-the-daytime-heat", coachWrong: "Test that against the details. A blazing day, and a plug that stays until the sun goes down, do those show that? Find the reason the details point to." },
    },
    {
      id: "c-3-best-evidence-water",
      band: "core",
      difficulty: 3,
      prompt: "It wastes little water. Which detail is the best evidence?",
      narration: { audio: `${Q}/c-3-best-evidence-water.mp3`, script: "Here is the best evidence move. My inference is that a kangaroo rat wastes very little water. Four details from the text are on your screen, and every one of them is true. Only one of them really supports my inference. The others are true, but they support something else. Tap the best evidence after you hear the parts the details come from. It is the kangaroo rat, a rodent with a long tufted tail and back feet so large that it hops across the sand the way a kangaroo does. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Its body pulls water out of the seeds it eats, and it wastes almost none of that water, since it hardly sweats and its droppings are nearly dry." },
      hint: { audio: `${Q}/c-3-best-evidence-water-hint.mp3`, script: "Wasting water means letting water leave the body. Which detail is about water leaving, or not leaving?" },
      explain: { audio: `${Q}/c-3-best-evidence-water-explain.mp3`, script: "The best evidence is, it hardly sweats. Sweat is water leaving the body, so hardly sweating shows water being saved. The tail, the hopping, and the stored seeds are true, but they are not about water." },
      interaction: { type: "choose", options: [{ id: "it-hardly-sweats", label: "it hardly sweats" }, { id: "it-hops-like-a-kangaroo", label: "it hops like a kangaroo" }, { id: "it-has-a-long-tufted-tail", label: "it has a long tufted tail" }, { id: "it-stores-seeds-at-home", label: "it stores seeds at home" }], correctId: "it-hardly-sweats", coachWrong: "That detail is true, but ask what it supports. Hopping and a tufted tail tell about moving, not water. Which detail is about water leaving the body?" },
    },
    {
      id: "c-4-sort-supported",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Supported, or Not Supported?",
      narration: { audio: `${Q}/c-4-sort-supported.mp3`, script: "Six inferences about the text are on your screen. If a detail on a page backs one up, drag it to Supported. If no detail backs it up, or a detail points the other way, drag it to the other bucket, Not Supported. Here are the details to test them against. The kangaroo rat spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down. At night it comes out to gather seeds, which it carries home to store. Its body pulls water out of the seeds it eats. Scientists once kept kangaroo rats on nothing but dry seeds, and the animals stayed healthy for months without a single drop to drink." },
      hint: { audio: `${Q}/c-4-sort-supported-hint.mp3`, script: "One at a time, hunt for the detail behind each inference in what you just heard. No detail, or a detail that points the other way, means not supported." },
      explain: { audio: `${Q}/c-4-sort-supported-explain.mp3`, script: "Daytime is too hot for it, it can live without drinking, and seeds are its main food all have details behind them, the blazing day and the plug, the months without a drop, and the seeds it gathers and eats. Nothing shows it sleeping all night, eating insects, or living in a tree, and the pages point the other way." },
      interaction: { type: "sort", buckets: ["Supported","Not Supported"], bucketAudio: { "Supported": `${Q}/b-supported.mp3`, "Not Supported": `${Q}/b-not-supported.mp3` }, items: [{ label: "daytime is too hot for it", bucket: "Supported" }, { label: "it sleeps all night", bucket: "Not Supported" }, { label: "it can live without drinking", bucket: "Supported" }, { label: "it eats mostly insects", bucket: "Not Supported" }, { label: "seeds are its main food", bucket: "Supported" }, { label: "it lives in a tree", bucket: "Not Supported" }], coachWrong: "Hunt for the detail. If the text shows it, the inference is supported. If nothing shows it, or a detail shows the opposite, it is not." },
    },
    {
      id: "c-5-the-example",
      band: "core",
      difficulty: 5,
      prompt: "Which example proves that it never needs a drink?",
      narration: { audio: `${Q}/c-5-the-example.mp3`, script: "Fact writers prove a point with an example, and a reader can point to it. The point of this text is that a kangaroo rat never needs a drink. Four details are on your screen, and all four are true. Only one of them is the example the writer uses to prove that point. Tap the example after you hear the parts. It is the kangaroo rat, a rodent with a long tufted tail and back feet so large that it hops across the sand the way a kangaroo does. It spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Scientists once kept kangaroo rats on nothing but dry seeds, and the animals stayed healthy for months without a single drop to drink." },
      hint: { audio: `${Q}/c-5-the-example-hint.mp3`, script: "An example that proves no drinking has to show the animal going without a drink. Which detail shows that happening?" },
      explain: { audio: `${Q}/c-5-the-example-explain.mp3`, script: "The example is, kept healthy on seeds alone. The scientists kept the rats on nothing but dry seeds for months, and the animals stayed healthy without a single drop. That proves the point." },
      interaction: { type: "choose", options: [{ id: "kept-healthy-on-seeds-alone", label: "kept healthy on seeds alone" }, { id: "it-hops-like-a-kangaroo", label: "it hops like a kangaroo" }, { id: "it-plugs-the-burrow-by-day", label: "it plugs the burrow by day" }, { id: "seeds-ride-in-its-cheeks", label: "seeds ride in its cheeks" }], correctId: "kept-healthy-on-seeds-alone", coachWrong: "That detail is true, but it proves a different point. Which detail shows the animal going without a drink for a long time?" },
    },
    {
      id: "c-6-speak-text-says-water",
      band: "core",
      difficulty: 6,
      prompt: "Does it need to live near water? Say the text says, so I can tell.",
      narration: { audio: `${Q}/c-6-speak-text-says-water.mp3`, script: "Now make the whole move out loud. The text never says in one sentence whether a kangaroo rat needs to live near water, but the details let you know. Tap the mic. Say, the text says, and name a detail. Then say, so I can tell, and state what it lets you know. Here are pages two and three. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Its body pulls water out of the seeds it eats, and it wastes almost none of that water, since it hardly sweats and its droppings are nearly dry. Scientists once kept kangaroo rats on nothing but dry seeds, and the animals stayed healthy for months without a single drop to drink." },
      hint: { audio: `${Q}/c-6-speak-text-says-water-hint.mp3`, script: "The seeds, the sweat, or the months without a drop are the details to name, and then you say what that means about living near water." },
      explain: { audio: `${Q}/c-6-speak-text-says-water-explain.mp3`, script: "One way to say it goes like this. The text says its body pulls water out of the seeds it eats, so I can tell it does not need to live near water at all." },
      interaction: { type: "speak", text: "seeds seed water dry drink drinks drinking sweat sweats droppings body pulls makes healthy months scientists rain river stream pond desert sand anywhere nowhere never" },
    },
    {
      id: "h-1-accurate-quote-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Which one is an accurate quote from page one?",
      narration: { audio: `${Q}/h-1-accurate-quote-taught.mp3`, script: "Here is a fifth grade move. When you use a detail as evidence, you quote it accurately, which means you say the exact words the text uses, not words that are close. Watch me do it with page two. Page two says, it hardly sweats and its droppings are nearly dry. If I say, it barely sweats, that is close, but it is not a quote, because those are not the exact words. The accurate quote is, it hardly sweats. Now you. Four lines are on your screen, and each one is close to page one, but only one uses the exact words. Here is the last sentence of page one. The kangaroo rat spends the whole blazing day inside its burrow, and it plugs the entrance with sand until the sun goes down." },
      hint: { audio: `${Q}/h-1-accurate-quote-taught-hint.mp3`, script: "A quote with a changed word is not an accurate quote, so match the words one by one against the sentence." },
      explain: { audio: `${Q}/h-1-accurate-quote-taught-explain.mp3`, script: "The accurate quote is, until the sun goes down. Has set, till, and sinks down each change a word, and a quote has to keep every word the page used." },
      interaction: { type: "choose", options: [{ id: "until-the-sun-goes-down", label: "until the sun goes down" }, { id: "until-the-sun-has-set", label: "until the sun has set" }, { id: "till-the-sun-goes-down", label: "till the sun goes down" }, { id: "until-the-sun-sinks-down", label: "until the sun sinks down" }], correctId: "until-the-sun-goes-down", coachWrong: "One word in that line is not the word the page used. Match every word against the sentence." },
    },
    {
      id: "h-2-quote-backs-inference",
      band: "harder",
      difficulty: 2,
      prompt: "Which exact words from page two back up the inference?",
      narration: { audio: `${Q}/h-2-quote-backs-inference.mp3`, script: "Quote accurately again. My inference is that a kangaroo rat gets its water from its food. Four lines are on your screen. Only one of them is the exact words from page two that back up my inference. The others change a word, or say it a different way. Here is page two. At night it comes out to gather seeds, which it stuffs into pouches in its cheeks and carries home to store. Its body pulls water out of the seeds it eats, and it wastes almost none of that water, since it hardly sweats and its droppings are nearly dry." },
      hint: { audio: `${Q}/h-2-quote-backs-inference-hint.mp3`, script: "The words you need tell where the water comes from, and every word has to match the page." },
      explain: { audio: `${Q}/h-2-quote-backs-inference-explain.mp3`, script: "The exact words are, pulls water out of the seeds. One line changes out of to from, one line changes pulls to takes, and one line changes pulls to gets and the to its." },
      interaction: { type: "choose", options: [{ id: "pulls-water-out-of-the-seeds", label: "pulls water out of the seeds" }, { id: "pulls-water-from-the-seeds", label: "pulls water from the seeds" }, { id: "takes-water-out-of-the-seeds", label: "takes water out of the seeds" }, { id: "gets-water-out-of-its-seeds", label: "gets water out of its seeds" }], correctId: "pulls-water-out-of-the-seeds", coachWrong: "That line changes a word. Find the line the page really says about water and seeds." },
    },
    {
      id: "h-3-speak-read-hearing",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: A kangaroo rat also has large hollow chambers inside its skull that sharpen its hearing, so it can catch the soft swish of an owl's wings in time to leap out of the way.",
      narration: { audio: `${Q}/h-3-speak-read-hearing.mp3`, script: "The last sentence of page three is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/h-3-speak-read-hearing-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words A kangaroo rat also has." },
      explain: { audio: `${Q}/h-3-speak-read-hearing-explain.mp3`, script: "The sentence tells you that hollow chambers in its skull sharpen its hearing, so it hears an owl coming in time to leap away." },
      interaction: { type: "speak", text: "A kangaroo rat also has large hollow chambers inside its skull that sharpen its hearing so it can catch the soft swish of an owl's wings in time to leap out of the way" },
    },
    {
      id: "h-4-speak-quote-then-tell",
      band: "harder",
      difficulty: 4,
      prompt: "Quote the exact words that show it never drinks, then say so I can tell.",
      narration: { audio: `${Q}/h-4-speak-quote-then-tell.mp3`, script: "Last one, out loud, and this time quote accurately. Tap the mic. Say, the text says, and then say the exact words from page three that show a kangaroo rat never drinks. Then say, so I can tell, and finish the inference. Here is the first sentence of page three. Scientists once kept kangaroo rats on nothing but dry seeds, and the animals stayed healthy for months without a single drop to drink." },
      hint: { audio: `${Q}/h-4-speak-quote-then-tell-hint.mp3`, script: "The exact words come right from the sentence, the ones about dry seeds or the ones about a single drop, said just as the page says them." },
      explain: { audio: `${Q}/h-4-speak-quote-then-tell-explain.mp3`, script: "One way to say it goes like this. The text says the animals stayed healthy for months without a single drop to drink, so I can tell a kangaroo rat never needs water to drink." },
      interaction: { type: "speak", text: "without single drop nothing dry seeds stayed healthy months hardly sweats droppings nearly pulls water drink drinking need needs food" },
    },
  ],
};
