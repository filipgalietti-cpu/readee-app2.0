import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sentence-to-sentence-timings.json";

// Sentence to Sentence (RI.3.8) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sentence-to-sentence
// G3-U3. RI.3.8 = describe the logical connection between particular SENTENCES
// and PARAGRAPHS in a text (comparison, cause/effect, first/second/third in a
// sequence). Sibling split honored: because-then-so (RI.3.3, Old Faithful)
// owns connections between EVENTS and STEPS in the world using time words vs
// cause words (its Time Words / Cause Words sort of bare signal words is not
// repeated here); chains-and-steps (RI.2.3, maple syrup), fact-links (RI.1.3,
// beaver pond), how-they-connect (RI.K.3, rain / seed / sun) own the younger
// event connections; hold-it-up (RI.2.8, Drink Up) and prove-it (RI.1.8) own
// reasons holding up a point; big-idea-backed-up (RI.3.2, prairie dogs) owns
// the big idea; paragraph-power (RI.2.2, recycling trucks) owns the JOB of
// each paragraph. THIS lesson owns the text's own building blocks: two
// sentences side by side and the word that joins them, a new paragraph's
// first sentence reaching back to the paragraph before it, COMPARISON joining
// the set (both / but / unlike / while beside because / so / as a result and
// first / next / then / finally), "no connection" as a real answer, the
// paragraph move (read the first sentence, find the connecting word, ask what
// it points back to), choosing the sentence that would come next to make a
// named connection, and saying a connection out loud with the word that showed
// it. ONE original informational text, "Why Flamingos Are Pink" (every fact
// true: tall wading bird, shallow salty lakes and lagoons, eats with its head
// upside down and sweeps its bent beak through the water, comb-like plates in
// the beak filter tiny shrimp and algae, the pink comes from a pigment in
// that food and is stored in the feathers, a flamingo fed other food fades to
// white so zoos add the pigment to the diet, chicks hatch gray with a straight
// beak, both parents feed the chick a red liquid made in the upper throat,
// the beak curves as the chick grows, full pink after two or three years),
// 16 sentences over 6 child-read pages in THREE planned paragraphs: paragraph
// one (pages 1-2) = what a flamingo eats and how, paragraph two (pages 3-4)
// opens "Because of that strange diet" = cause and effect on paragraph one,
// paragraph three (pages 5-6) opens "First" = the steps in order by which the
// pink from paragraph two arrives; two comparison sentence pairs inside the
// paragraphs (most birds peck heads up / Unlike those birds, page 1; plenty
// of shrimp turns deep pink / But other food fades it, pages 3-4), a cause
// pair on page 2 (filter / So it can swallow) for the guided beats.
// Read-along pages 1/3/5 with images, speak pages 2/4/6 = 2-3-sentence
// accept-mode reads (no " my " token, no digits, no contractions), compound +
// early-complex, stretch words lagoons / filter / pigment / flock with in-text
// support. ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file
// BEFORE writing: flamingo, lagoon, crop milk, dragonfly, nymph, helicopter,
// "as a result" (only because-then-so), "paragraph two" (only paragraph-power
// and big-idea-backed-up) all 0 hits as topics; comparison / unlike appear
// only as a context-clue kind in the L.3.4 family. No character names
// (informational). Keys prefixed quiz- are picture supports for the quiz's
// all-fresh dragonfly text.

const A = (id: string) => `/audio/lessons-v2/sentence-to-sentence/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sentence-to-sentence/${w.toLowerCase()}.png`;

export const sentenceToSentenceImages: Record<string, string | { subject: string; ref?: string }> = {
  "flamingo-lagoon": "A flock of tall bright pink flamingos with long thin legs and curved necks standing in a shallow turquoise lagoon beside a pale sandy beach, the flamingo in front dipping its head upside down into the water with its bent beak under the surface, low green bushes along the shore and a clear blue sky, natural bird faces with no smiles and no cartoon eyes. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "pink-and-pale": { subject: "Two flamingos standing side by side in the same shallow turquoise lagoon, the one on the left a deep bright pink and the one on the right a very pale whitish pink, both wading with their heads dipped toward the water, tiny pink shrimp and small green specks floating in the clear water around their legs, the same sandy beach and low green bushes behind, natural bird faces with no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "flamingo-lagoon" },
  "gray-chick": { subject: "A small fluffy gray flamingo chick with a short straight beak standing on a low round mound of dried mud in the same shallow turquoise lagoon, its tall bright pink parent standing beside it and bending its long curved neck down toward the chick, the same sandy beach and low green bushes behind, natural bird faces with no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "flamingo-lagoon" },
  "quiz-dragonfly-hover": "A single large dragonfly with a long thin bright blue body, huge round eyes, and four clear glassy wings held straight out, hovering in place in the air above a still green pond, tall cattails and round lily pads below, sunlight glinting on the wings, a natural insect with no smile and no cartoon face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-nymph-underwater": { subject: "An underwater side view of a squat brown dragonfly nymph, a six-legged insect with a plump body and no wings, crawling along the muddy bottom of the same green pond among green water plants, a few small silver fish swimming farther away, the pale underside of round lily pads visible at the surface above, a real insect drawn with NO mouth, NO smile, no expression, and plain dark compound eyes, no cartoon face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-dragonfly-hover" },
  "quiz-dragonfly-stem": { subject: "A dragonfly with a long thin bright blue body clinging to a tall green reed stem just above the water of the same pond, its four fresh wings still soft, crumpled, and folded along its back, the empty split brown skin of a nymph clinging lower on the same stem, cattails and lily pads around, a natural insect with no smile and no cartoon face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-dragonfly-hover" }
};

export const sentenceToSentence: LessonDef = {
  id: "sentence-to-sentence",
  title: "Sentence to Sentence",
  grade: "3rd Grade",
  standard: "RI.3.8",
  archetype: "inference",
  objective: "I can name how two sentences or two paragraphs in a fact text connect, by comparison, cause and effect, or sequence, and point to the word that shows it.",
  concepts: [
    "a fact book is built, not piled: one sentence sets up the next, and one paragraph sets up the next",
    "comparison sets two things side by side: both, but, unlike, while",
    "cause and effect tells what happens because of something: because, so, as a result",
    "sequence tells the order: first, next, then, finally",
    "the first sentence of a new paragraph tells how it builds on the paragraph before it",
    "some sentences sit side by side with no connection at all",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a fact book the way it was built. You found the word that joined one sentence to the next and named the kind of connection, comparison, cause and effect, or sequence. Then you did the same for whole paragraphs, chose the sentence an author would write next, and explained a connection in your own words. Every fact book you open from now on is built the same way, one sentence setting up the next.",
    "title": "Built, Not Piled",
    "body": "You named how sentences and paragraphs connect in a real fact text, found the words that showed it, and built a connection of your own."
  },
  scenes: [
    {
      id: "hook-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Why Flamingos Are Pink, page one. Read along!",
      image: IMG("flamingo-lagoon"),
      narration: { audio: A("hook-page-one"), script: "Hello, reader. A fact book is built, not piled. Each sentence sets up the one after it, and each paragraph sets up the next one, and today you learn to name how they connect. Here is page one of a book called Why Flamingos Are Pink, and paragraph one begins right here. Read along with me, and watch how each sentence hands something to the next." },
      interaction: { type: "read-along", text: "A flamingo is a tall wading bird with long, thin legs and a neck that bends like a straw. Flamingos spend their days standing in shallow, salty lakes and lagoons, pools of seawater tucked behind a beach. Most birds peck at their food with their heads held up. Unlike those birds, a flamingo eats with its head upside down, and it sweeps its bent beak through the water like a spoon.", audio: A("hook-page-one-sentence") },
    },
    {
      id: "model-two-sentences",
      purpose: "model",
      gate: "none",
      prompt: "Two sentences, one connection, one word that shows it.",
      fx: {"text":"Most birds peck heads up. **Unlike** those birds, a flamingo eats upside down.","effect":"underline"},
      narration: { audio: A("model-two-sentences"), script: "Here is how I read two sentences that sit next to each other. Sentence three says most birds peck at their food with their heads held up. Sentence four says a flamingo eats with its head upside down. The second sentence only makes sense because the first one is there, and one word shows how they connect. Unlike. Unlike sets one thing against another, so these two sentences connect by comparison. Sentences connect in three main ways. Comparison shows how two things are alike or different, with words like both, but, unlike, and while. Cause and effect shows that one thing happens because of another, with words like because, so, and as a result. Sequence shows the order things happen in, with words like first, next, then, and finally. Some sentences sit next to each other with no connection at all, and that is a real answer too. When you find the connecting word, name the kind, and you know how the two sentences fit together." },
    },
    {
      id: "page-two-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Inside the beak, rows of tiny plates work as a filter, a screen that traps food and lets the water pour back out. So a flamingo can swallow a mouthful of tiny shrimp and algae, the green specks that float in still water, without swallowing the lake.",
      narration: { audio: A("page-two-read"), script: "Page two is yours, and it is still paragraph one. Read both sentences out loud, and notice the small word that joins the second sentence to the first." },
      interaction: { type: "speak", text: "Inside the beak rows of tiny plates work as a filter a screen that traps food and lets the water pour back out So a flamingo can swallow a mouthful of tiny shrimp and algae the green specks that float in still water without swallowing the lake" },
    },
    {
      id: "guided-choose-connection-kind",
      purpose: "guided",
      gate: "interaction",
      prompt: "How do the two sentences on page two connect?",
      narration: { audio: A("guided-choose-connection-kind"), script: "Your turn. Four kinds of connection are on your screen, and you will tap the kind that joins the two sentences from page two. Here they are once more. Inside the beak, rows of tiny plates work as a filter, a screen that traps food and lets the water pour back out. So a flamingo can swallow a mouthful of tiny shrimp and algae without swallowing the lake." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "comparison", label: "comparison" }, { id: "sequence", label: "sequence" }, { id: "no-connection", label: "no connection" }], correctId: "cause-and-effect", coachWrong: "Ask what the second sentence does with the first. Does it set two things against each other, tell what happens because of it, or put steps in order?" },
    },
    {
      id: "guided-choose-connecting-word",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words show the connection?",
      narration: { audio: A("guided-choose-connecting-word"), script: "Now the word that told you. Four pieces of page two are on your screen, and all four are really there. Only one of them holds the connecting word, the word that joins the second sentence to the first. Tap that piece." },
      interaction: { type: "choose", options: [{ id: "so-a-flamingo-can-swallow", label: "so a flamingo can swallow" }, { id: "rows-of-tiny-plates", label: "rows of tiny plates" }, { id: "a-mouthful-of-tiny-shrimp", label: "a mouthful of tiny shrimp" }, { id: "the-water-pour-back-out", label: "the water pour back out" }], correctId: "so-a-flamingo-can-swallow", coachWrong: "Those words tell what is in the beak or in the water. Find the small word at the start of the second sentence that points back to the first." },
    },
    {
      id: "page-three-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Paragraph two begins. Read along!",
      image: IMG("pink-and-pale"),
      narration: { audio: A("page-three-read"), script: "Page three, and paragraph two begins here. Read along with me, and listen to the very first words of the new paragraph, because they reach back to paragraph one." },
      interaction: { type: "read-along", text: "Because of that strange diet, a flamingo is pink. The shrimp and the algae hold a pigment, a natural coloring, and the flamingo stores that pigment in its feathers. As a result, a flamingo that eats plenty of shrimp turns a deep, bright pink.", audio: A("page-three-read-sentence") },
    },
    {
      id: "model-paragraph-to-paragraph",
      purpose: "model",
      gate: "none",
      prompt: "A new paragraph builds on the one before it.",
      fx: {"text":"**Because of that** strange diet, a flamingo is pink","effect":"underline"},
      narration: { audio: A("model-paragraph-to-paragraph"), script: "Paragraphs connect the same way sentences do, and the first sentence of a new paragraph usually tells you how. Here is how I check. Paragraph one was all about what a flamingo eats and how it eats. Paragraph two opens with the words because of that strange diet. Because is a cause word, and that strange diet points straight back to paragraph one. So paragraph two builds on paragraph one by telling what happens because of it. The diet is the cause, and the pink is the effect. That is the move for every new paragraph. Read its first sentence, find the connecting word, and ask what it points back to." },
    },
    {
      id: "page-four-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: But a flamingo that eats other food slowly fades to a pale, chalky white. Zookeepers know this, so they mix the pigment into the meals to keep every bird in the flock bright pink.",
      narration: { audio: A("page-four-read"), script: "Page four is yours, still inside paragraph two. Read both sentences out loud, and notice that the first one sets itself against the sentence you just read on page three." },
      interaction: { type: "speak", text: "But a flamingo that eats other food slowly fades to a pale chalky white Zookeepers know this so they mix the pigment into the meals to keep every bird in the flock bright pink" },
    },
    {
      id: "page-five-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Paragraph three begins. Read along!",
      image: IMG("gray-chick"),
      narration: { audio: A("page-five-read"), script: "Page five, and paragraph three begins. Read along with me, and catch the first word of the new paragraph." },
      interaction: { type: "read-along", text: "First, a chick hatches with fluffy gray feathers and a straight beak, and it looks nothing like its parents. Next, its parents feed it a red liquid made in their throats, so the chick starts soaking up pigment before it has ever tasted a shrimp.", audio: A("page-five-read-sentence") },
    },
    {
      id: "guided-choose-paragraph-three-builds",
      purpose: "guided",
      gate: "interaction",
      prompt: "How does paragraph three build on paragraph two?",
      narration: { audio: A("guided-choose-paragraph-three-builds"), script: "Run the paragraph move yourself. Paragraph two told you that the pink comes from the food. Now think about how paragraph three opens, and about the word that starts each of its sentences. Four ways a paragraph can build on the one before it are on your screen. Tap the way paragraph three builds on paragraph two." },
      interaction: { type: "choose", options: [{ id: "it-gives-the-steps-in-order", label: "it gives the steps in order" }, { id: "it-tells-what-the-pink-causes", label: "it tells what pink causes" }, { id: "it-sets-two-birds-against", label: "it contrasts two birds" }, { id: "it-says-paragraph-two-again", label: "it says paragraph two again" }], correctId: "it-gives-the-steps-in-order", coachWrong: "Look at the first word of paragraph three, and at the first word of its next sentence. What kind of connecting words are those?" },
    },
    {
      id: "page-six-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Then the beak bends, and the young bird learns to filter food on its own. Finally, after two or three years of shrimp and algae, the gray bird turns as pink as its parents. Every flamingo you see earned its color one meal at a time.",
      narration: { audio: A("page-six-read"), script: "Page six is yours, the last page of the book. Read all three sentences out loud, and let the connecting words carry you from one step to the next." },
      interaction: { type: "speak", text: "Then the beak bends and the young bird learns to filter food on its own Finally after two or three years of shrimp and algae the gray bird turns as pink as its parents Every flamingo you see earned its color one meal at a time" },
    },
    {
      id: "apply-sort-connections",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each piece: Comparison, Cause and Effect, or Sequence?",
      narration: { audio: A("apply-sort-connections"), script: "Here are six pieces of the book, and each one carries its connecting word. Read the piece, find the word that joins it to the sentence before it, and name the kind. If the word sets two things against each other, drag it to Comparison. If it tells what happens because of something, drag it to Cause and Effect. If it tells the order things happen in, drag it to Sequence." },
      interaction: { type: "sort", buckets: ["Comparison","Cause and Effect","Sequence"], items: [{ label: "unlike those birds", bucket: "Comparison" }, { label: "so it swallows its food", bucket: "Cause and Effect" }, { label: "first, a chick hatches", bucket: "Sequence" }, { label: "but other food fades it", bucket: "Comparison" }, { label: "as a result, it turns pink", bucket: "Cause and Effect" }, { label: "finally, the bird is pink", bucket: "Sequence" }], coachWrong: "Find the connecting word at the front of that piece. Does it set two things against each other, tell why something happens, or tell when it happens?" },
    },
    {
      id: "apply-sequence-paragraphs",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the parts of the book in the order the author built them.",
      narration: { audio: A("apply-sequence-paragraphs"), script: "The whole book is on your screen in four pieces, three paragraphs and the closing sentence, and they are out of order. Drag them into the order the author built them, from the first paragraph down to the last sentence. Think about what each part needed from the part before it." },
      interaction: { type: "sequence", items: [{ id: "how-a-flamingo-eats", label: "how a flamingo eats" }, { id: "why-the-food-makes-it-pink", label: "why the food makes it pink" }, { id: "how-a-chick-earns-its-pink", label: "how a chick earns its pink" }, { id: "one-meal-at-a-time", label: "one meal at a time" }], order: ["how-a-flamingo-eats","why-the-food-makes-it-pink","how-a-chick-earns-its-pink","one-meal-at-a-time"], coachWrong: "The pink cannot be explained before the food is, and the steps cannot come before the pink. Walk it from the first paragraph to the closing line." },
    },
    {
      id: "apply-choose-next-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "A flamingo often rests standing on one leg. Which sentence comes next to show cause and effect?",
      narration: { audio: A("apply-choose-next-sentence"), script: "Now you build a connection yourself. Here is a fresh sentence from the same book, and the author wants the next sentence to show cause and effect, to tell what happens because of the first one. Four sentences are on your screen, and every one of them is true, but only one of them makes that connection. Here is the sentence. A flamingo often rests standing on one leg." },
      interaction: { type: "choose", options: [{ id: "so-the-tucked-leg-stays-warm", label: "So the tucked leg stays warm" }, { id: "a-stork-rests-on-one-leg-too", label: "A stork rests on one leg too" }, { id: "first-it-folds-one-leg-up", label: "First, it folds one leg up" }, { id: "flamingos-have-webbed-feet", label: "Flamingos have webbed feet" }], correctId: "so-the-tucked-leg-stays-warm", coachWrong: "Look at the first word of each sentence. Which one tells what happens because the flamingo rests on one leg?" },
    },
    {
      id: "challenge-speak-connection",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Chicks gather in one huge group. Because the group is big, each chick is safer. Name the connection and the word that showed you.",
      narration: { audio: A("challenge-speak-connection"), script: "Last one, and this time you say it. Two fresh sentences from the book are on your screen. Read them in your head, then tap the mic and tell me two things. Name the kind of connection between the two sentences, and name the word that told you." },
      interaction: { type: "speak", text: "cause effect because reason reasons why result results makes made happen happens happened safer safe group chicks" },
    },
    {
      id: "celebrate-built-not-piled",
      purpose: "celebrate",
      gate: "none",
      prompt: "Sentence to sentence, paragraph to paragraph.",
      fx: {"text":"**Comparison.** **Cause and effect.** **Sequence.**","effect":"fireworks"},
      narration: { audio: A("celebrate-built-not-piled"), script: "You read a fact book the way it was built. You found the word that joined one sentence to the next, and you named the kind, comparison, cause and effect, or sequence. You did the same for whole paragraphs. Then you chose the sentence an author would write next, and you explained a connection in your own words. Every fact book you open from now on is built the same way, one sentence setting up the next, and now you can see it." },
    },
  ],
};
