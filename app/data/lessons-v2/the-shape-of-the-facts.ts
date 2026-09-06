import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-shape-of-the-facts-timings.json";

// The Shape of the Facts (RI.4.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-shape-of-the-facts
// G4-U2. THE OVERALL STRUCTURE tier of RI.4.5 (sibling split honored:
// sentence-to-sentence RI.3.8 (flamingos) owns how TWO sentences or paragraphs
// connect and the word that shows it, its Comparison / Cause and Effect /
// Sequence sort and its "connect" frame, so the child is told once that they
// already know how two sentences connect and the word "sequence" is never a
// tile here; because-then-so RI.3.3 (Old Faithful) owns time words vs cause
// words; what-happened-and-why RI.4.3 (canal locks) owns the explanation
// chain and the why, so nothing here re-teaches why; search-like-a-pro /
// find-it-fast / maps-and-photos own text features; chains-and-steps RI.2.3
// owns the maple syrup procedure; words-of-the-field RI.4.4 and
// who-tells-it-changes-it RL.4.6 are parallel producers, untouched; RI.4.6
// accounts are the next lesson, never mentioned). THIS lesson owns the G4
// step-up from a sentence pair to the WHOLE text or a whole section: four
// shapes (chronology, comparison, cause and effect, problem and solution),
// each with its signal words and its picture (timeline, two column chart,
// arrow chain, lock and key), the move read the whole section / collect the
// signal words / name the OVERALL shape / expect what comes next, choosing
// the diagram that fits, noticing when a text SWITCHES shape between
// sections, the BEST-EVIDENCE sentence that shows the switch, why the author
// chose the shape, and describing the structure aloud with the term and one
// signal word. ONE original informational text, "Water Down from the Hills"
// (the aqueducts of ancient Rome; every fact true: the city grew into the
// largest of the ancient world on a river that carried its waste, wells
// inside the walls were too few, families first carried river water in clay
// jars, then dug wells and caught roof rain in cisterns, the first aqueduct
// ran almost wholly underground from a spring outside the walls, more than
// ten aqueducts fed the city over the centuries, later channels reached
// springs more than a day's walk away, crews climbed down stone hatches to
// scrape off the hard crust, one channel still carries water today, nobody
// could pump so the water carried itself down a slope too gentle to feel,
// arches carried the channel across valleys so the slope stayed steady, a
// settling tank dropped sand and grit, free fountains on street corners ran
// day and night). OVERALL SHAPE problem and solution (the trouble was / the
// problem grew / needs / to fix this / the answer) with ONE SECTION, Try
// After Try, built as a chronology (at first / then / later / over the
// centuries that followed), so the switch is real. 20 sentences over 6
// child-read pages in real paragraphs under FOUR SPOKEN HEADINGS (A City
// Runs Short / Try After Try / The Long Slope / Water for Everyone),
// read-along 1/3/5 with ref-chained images, accept-mode speaks 2/4/6 (no
// " my " token), relative pronouns which / who / where, perfect and
// progressive tenses, stretch words cistern / aqueduct / channel / settling
// / stale with support in the text, no digits, no contractions, no real
// person named, no names at all. ANCHOR FRESHNESS grep-swept vs every
// lessons-v2 + quizzes-v2 file BEFORE writing: aqueduct, cistern, Tiber,
// sewer, baths, settling tank, lock and key, arrow chain, two column chart,
// overall shape, chronology, timeline all 0 hits (Rome / Roman only as the
// myths lesson's word origin, arches only as a prose word, jar a common
// prop). The quiz's fresh second text (two bridges over one gorge, arch vs
// suspension: abutment, keystone, tension, compression all 0 hits) needs no
// picture support.

const A = (id: string) => `/audio/lessons-v2/the-shape-of-the-facts/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-shape-of-the-facts/${w.toLowerCase()}.png`;

export const theShapeOfTheFactsImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wide view of an ancient city of stone and brick buildings with red tile roofs crowded up a green hill beside a wide brown muddy river, a steep dirt path climbing from the riverbank into the narrow streets, a line of people in simple tunics and sandals carrying tall clay water jars on their shoulders up the path, a woman kneeling at the muddy river edge dipping a clay jar, a few boats on the river, warm afternoon light, realistic people with natural faces. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "A rocky green hillside outside the same ancient city, a clear spring pouring out of a cleft in the rock into a small stone basin, a long narrow trench cut into the hillside leading away from the spring with flat stone slabs laid over part of it as a roof, workers in simple tunics with picks and baskets digging the trench, a square stone hatch with a lid beside the covered part, the tile roofs of the city small in the distance, morning light, realistic people with natural faces. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "A long row of tall stone arches stacked in two tiers marching across a wide green valley, a narrow covered water channel running along the very top of the arches, the row of arches sloping ever so slightly downhill toward the same ancient city of red tile roofs on a hill in the distance, sheep grazing in the valley below the arches, a small square stone tank with water in it at the near end where the channel meets the ground, blue sky with a few clouds, realistic sheep with natural faces and no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
};

export const theShapeOfTheFacts: LessonDef = {
  id: "the-shape-of-the-facts",
  title: "The Shape of the Facts",
  grade: "4th Grade",
  standard: "RI.4.5",
  archetype: "inference",
  objective: "I can name the overall shape of a fact text or a section of it, point to the signal words that reveal it, choose the diagram that fits, and notice when the text switches shape.",
  concepts: [
    "a whole fact text, or a whole section, is built in one overall shape",
    "four shapes: chronology, comparison, cause and effect, problem and solution",
    "each shape has its own signal words and its own picture",
    "read the whole section, collect the signal words, name the shape, expect what comes next",
    "a text can switch shape between sections, and a sentence opener shows where",
    "the author chose the shape because of what the facts needed",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Water Down from the Hills and named its shape before the text told you. You collected the signal words, called the whole text problem and solution, spotted the one section that ran as a chronology, and matched each shape to its picture. From now on, you name the shape early and you know where every fact belongs.",
    "title": "Name the Shape, Then Expect",
    "body": "You named the overall shape of a fact text from its signal words, chose the diagram that fits, and caught the section where the shape switched."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Water Down from the Hills, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. You already know how two sentences connect. Fourth grade asks a bigger question about a fact text. What shape is the whole thing? A fact writer builds a whole text, or a whole section of one, in one overall shape, and a reader who names that shape early knows what is coming and where each fact belongs. There are four shapes, and each one has a picture. Chronology tells events in time order, like a timeline. Comparison sets two things side by side, like a chart with two columns. Cause and effect shows one thing making another happen, like a chain of arrows. Problem and solution names a trouble and then its fix, like a lock and a key. Here is page one of Water Down from the Hills, under its first heading, A City Runs Short. Read along with me, and watch for words that hint at a shape." },
      interaction: { type: "read-along", text: "Long ago, the city of Rome grew from a cluster of huts on a riverbank into the largest city the world had yet seen, and every person in it needed water each day. The trouble was the river, which had once been enough, for it now ran brown past the city's doors, carrying away everything the city threw into it. Wells dug inside the walls gave only a little, and in a dry summer some of them went bad. A city that keeps growing needs more clean water than the ground beneath it can give, and the problem grew with every new street.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-name-the-shape",
      purpose: "model",
      gate: "none",
      prompt: "Collect the words, name the shape, expect what comes next.",
      fx: {"text":"Collect the **words**, name the **shape**, **expect** what comes next","effect":"pop-words"},
      narration: { audio: A("model-name-the-shape"), script: "Here is the move, on page one. I read the whole section, not one sentence pair. Then I collect its signal words. Page one says the trouble was, and the problem grew, and it says needs, twice. Those are the words of a trouble, and when a fact text opens on a trouble, its shape is almost always problem and solution. The parts come in that order, the trouble first and the fix after, so I name the shape and I expect a fix before I turn the page. Every shape has words of its own. Problem and solution also says to fix this, and the answer was. Chronology says first, then, and years later. Comparison says both, unlike, and while. Cause and effect says because, as a result, and led to. Collect the words, name the shape, expect what comes next." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Dirty water spread sickness through the crowded streets, and the poorest families suffered most. The city could not move, and it could not stop growing. In the hills beyond the walls, clean springs poured out more water than anyone could carry, and the city needed a way to bring that water home.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, still under A City Runs Short. Read all three sentences out loud, and hold on to where the clean water is." },
      interaction: { type: "speak", text: "Dirty water spread sickness through the crowded streets and the poorest families suffered most The city could not move and it could not stop growing In the hills beyond the walls clean springs poured out more water than anyone could carry and the city needed a way to bring that water home" },
    },
    {
      id: "guided-highlight-signals",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the two signal words that give away the shape.",
      narration: { audio: A("guided-highlight-signals"), script: "Your turn to collect. Here is a short new piece about the city's water, two sentences long. Two of its words are signal words, one in each sentence, and together they give away the shape before you have finished reading. Tap both of them." },
      interaction: { type: "highlight", text: "Water that stood still in a tank grew warm and green, and that was the problem with a cistern in a hot summer. The answer was to keep the water moving, so the fountains of the city were never shut off.", targets: ["problem", "answer"], coachWrong: "That word tells about the water, not about the shape. A signal word tells you what kind of sentence is coming. One sits near the end of the first sentence, and one opens the second." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and notice how each sentence opens.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three opens the second heading, Try After Try. Read along with me, and notice the word that opens each sentence." },
      interaction: { type: "read-along", text: "At first, families walked down to the river with clay jars and carried the water back up the hill on their shoulders. Then, as the streets filled, people dug wells beside their houses and caught rain from their roofs in stone tanks called cisterns. Later, when the wells could not keep up, the city built its first aqueduct, a covered channel that ran almost the whole way underground from a spring outside the walls. Over the centuries that followed, the city added channel after channel, until more than ten aqueducts were pouring water into it at once.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The first channel was short, but the later ones reached springs more than a day's walk from the city. Repair crews climbed down through stone hatches to scrape off the hard crust the water left on the walls. One of those channels still carries water today, more than two thousand years after it was dug.",
      narration: { audio: A("page-4-read"), script: "Page four is yours, still under Try After Try. Read all three sentences out loud, and hold on to what the repair crews scraped away." },
      interaction: { type: "speak", text: "The first channel was short but the later ones reached springs more than a day's walk from the city Repair crews climbed down through stone hatches to scrape off the hard crust the water left on the walls One of those channels still carries water today more than two thousand years after it was dug" },
    },
    {
      id: "guided-choose-shape-try-after-try",
      purpose: "guided",
      gate: "interaction",
      prompt: "Try After Try: what is the overall shape of this section?",
      narration: { audio: A("guided-choose-shape-try-after-try"), script: "Now name a shape yourself. You just read the whole section called Try After Try, pages three and four. Collect the words that opened its sentences, and ask what those words do. Four shapes are on your screen. Tap the overall shape of that section, not of one sentence pair." },
      interaction: { type: "choose", options: [{ id: "chronology", label: "chronology" }, { id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "problem-and-solution", label: "problem and solution" }], correctId: "chronology", coachWrong: "Look again at the words that opened the sentences on page three. Do they tell when, do they compare, or do they tell why? Name the shape that those words belong to." },
    },
    {
      id: "guided-choose-diagram",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which picture fits the shape of Try After Try?",
      narration: { audio: A("guided-choose-diagram"), script: "Every shape has a picture, and the picture is how you hold the facts in your head. You named the shape of Try After Try. Four pictures are on your screen, one for each shape. Tap the one that fits the section you just named, the picture you would draw to hold its facts." },
      interaction: { type: "choose", options: [{ id: "a-timeline", label: "a timeline" }, { id: "a-two-column-chart", label: "a two column chart" }, { id: "an-arrow-chain", label: "an arrow chain" }, { id: "a-lock-and-a-key", label: "a lock and a key" }], correctId: "a-timeline", coachWrong: "That picture belongs to a different shape. Think about what the section did with its facts. It set them out in the order they happened. Which picture is built to hold events in order?" },
    },
    {
      id: "apply-sequence-the-move",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the reader's moves in order.",
      narration: { audio: A("apply-sequence-the-move"), script: "Here is the move as four steps, mixed up on your screen. Tap them in the order a reader makes them, from the very first thing you do with a new section to the thing you do once the shape has a name." },
      interaction: { type: "sequence", items: [{ id: "read", label: "read the whole section" }, { id: "collect", label: "collect the signal words" }, { id: "name", label: "name the overall shape" }, { id: "expect", label: "expect what comes next" }], order: ["read","collect","name","expect"], coachWrong: "Ask what has to happen before each step is possible. You cannot collect words from a section you have not read, and you cannot name a shape from words you have not collected." },
    },
    {
      id: "apply-sort-signals",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the signals: Cause and Effect, or Problem and Solution?",
      narration: { audio: A("apply-sort-signals"), script: "Six signal phrases are on your screen. Some of them belong to cause and effect, the shape where one thing makes another happen. Some of them belong to problem and solution, the shape with a trouble and then a fix. Read each phrase, ask what kind of sentence it announces, and drag it to its shape." },
      interaction: { type: "sort", buckets: ["Cause and Effect Signals","Problem and Solution Signals"], items: [{ label: "because of this", bucket: "Cause and Effect Signals" }, { label: "the trouble was", bucket: "Problem and Solution Signals" }, { label: "as a result", bucket: "Cause and Effect Signals" }, { label: "to fix this", bucket: "Problem and Solution Signals" }, { label: "which led to", bucket: "Cause and Effect Signals" }, { label: "the answer was", bucket: "Problem and Solution Signals" }], coachWrong: "Ask what comes right after that phrase. If what follows is the thing that got made to happen, it is cause and effect. If what follows is a trouble or the fix for one, it is problem and solution." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and collect the signal words.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five opens the third heading, The Long Slope. Read along with me, collect the signal words as they pass, and be ready to name this section's shape." },
      interaction: { type: "read-along", text: "The trouble with bringing water from the hills was that nobody could pump it that far, so the builders had to let the water carry itself. To fix this, they began at a spring that sat higher than the city and cut a channel that dropped a little with every step, a slope so gentle that a person walking beside it would never feel the ground going down. Where the channel met a valley, they lifted it onto rows of stone arches so that the slope would stay steady, and before the water reached the city it rested in a settling tank, where sand and grit sank to the bottom.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-shape-long-slope",
      purpose: "apply",
      gate: "interaction",
      prompt: "The Long Slope: which shape does this section use?",
      narration: { audio: A("apply-choose-shape-long-slope"), script: "Name it again, on your own this time. The section called The Long Slope is one whole page. You collected its signal words as you read. Ask what those words announce, and ask how the parts of the page are arranged. Four shapes are on your screen. Tap the shape of this section." },
      interaction: { type: "choose", options: [{ id: "chronology", label: "chronology" }, { id: "comparison", label: "comparison" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "problem-and-solution", label: "problem and solution" }], correctId: "problem-and-solution", coachWrong: "Look at how page five opens and how its second sentence opens. Those two openers belong to one shape, the same shape the whole text started with. Name that shape." },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: The answer changed the city. Fountains stood on the street corners, where anyone could fill a jar for free, and the water ran day and night, so it never went stale. The city that had run short of water grew into the largest city of the ancient world.",
      narration: { audio: A("page-6-read"), script: "Page six is yours, under the last heading, Water for Everyone. Read all three sentences out loud, and hold on to what stood on the street corners." },
      interaction: { type: "speak", text: "The answer changed the city Fountains stood on the street corners where anyone could fill a jar for free and the water ran day and night so it never went stale The city that had run short of water grew into the largest city of the ancient world" },
    },
    {
      id: "apply-choose-why-this-shape",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why did the author build the whole text in this shape?",
      narration: { audio: A("apply-choose-why-this-shape"), script: "A shape is a choice. The author looked at these facts and picked the shape that would hold them best, and a fourth grade reader can say why. Think about what the whole text is really about, from its first heading to its last. Four reasons are on your screen. Tap the reason this shape fits these facts." },
      interaction: { type: "choose", options: [{ id: "a-need-was-met-with-a-fix", label: "a need was met with a fix" }, { id: "two-cities-sat-side-by-side", label: "two cities sat side by side" }, { id: "it-only-follows-the-years", label: "it only follows the years" }, { id: "one-cause-set-off-a-chain", label: "one cause set off a chain" }], correctId: "a-need-was-met-with-a-fix", coachWrong: "That reason would fit a different shape. Ask what the first heading set up and what the last heading delivered. The shape was chosen to carry that." },
    },
    {
      id: "apply-choose-switch-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sentence opener shows where the text switched shape?",
      narration: { audio: A("apply-choose-switch-evidence"), script: "Here is the best evidence move. The whole text runs in one shape, but one section switched to another, and one sentence opener is where the switch shows. Four openers from the text are on your screen, and every one of them is really in the text. Only one carries a signal word from a different shape than the rest. Tap the opener that shows the switch." },
      interaction: { type: "choose", options: [{ id: "at-first-families-walked", label: "at first, families walked" }, { id: "the-trouble-was-the-river", label: "the trouble was the river" }, { id: "to-fix-this-they-began", label: "to fix this, they began" }, { id: "the-answer-changed-the-city", label: "the answer changed the city" }], correctId: "at-first-families-walked", coachWrong: "That opener is in the text, but its signal word belongs to the shape the whole text uses. Find the opener whose signal word belongs to a different shape." },
    },
    {
      id: "challenge-speak-describe-the-shape",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Describe the shape of the whole text. Say the term and one signal word.",
      narration: { audio: A("challenge-speak-describe-the-shape"), script: "Last one, and you say it out loud. Tap the mic. Name the overall shape of Water Down from the Hills with its term. Then say one signal word from the text that gave the shape away, and say how the parts are arranged, what came first and what came after." },
      interaction: { type: "speak", text: "problem solution problems solutions trouble troubles fix fixed fixing answer answered need needed needs lock key shape overall whole text city water springs first then later chronology timeline section switch switched aqueduct aqueducts channel channels" },
    },
    {
      id: "celebrate-the-shape-of-the-facts",
      purpose: "celebrate",
      gate: "none",
      prompt: "Name the shape, then expect.",
      fx: {"text":"Name the **shape**, then **expect**","effect":"fireworks"},
      narration: { audio: A("celebrate-the-shape-of-the-facts"), script: "Today you read a whole fact text and named its shape before it finished telling you. You collected the signal words, called the whole text problem and solution, caught the one section that ran as a chronology, and matched each shape to the picture that holds its facts. From now on, when a fact text starts, you have a question ready before the second sentence. What shape is this? Name the shape, then expect." },
    },
  ],
};
