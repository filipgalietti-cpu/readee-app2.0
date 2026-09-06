import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./main-idea-and-summary-timings.json";

// Main Idea and Summary (RI.4.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=main-idea-and-summary
// G4-U1, the INFORMATIONAL TWIN of theme-and-summary (RL.4.2). MAIN IDEA AS A
// SENTENCE + HOW EACH KEY DETAIL SUPPORTS IT + THE THREE-SENTENCE SUMMARY tier
// of RI.4.2 (sibling split: big-idea-backed-up RI.3.2 (prairie dogs) owns the
// G3 big idea as a sentence, its tent poles and flags metaphor, its Holds It
// Up / Just Interesting sort and its "That backs up the big idea because"
// frame, so none of those words or buckets are reused; the-whole-fact-book
// RI.3.10 (printing press) owns the G3 capstone; facts-say-so-i-know RI.4.1
// (mangroves) owns evidence-to-inference, so every detail here serves the
// MAIN IDEA and no inference is drawn; theme-and-summary RL.4.2 owns the story
// summary (who wanted what / what got in the way / how it ended) and its Big
// Beat / Small Detail sort, so the fact summary here is main idea first, then
// the key details in the author's order, and the sort is Key Detail / Small
// Fact). THIS lesson owns the G4 step-up: a main idea stated as a full
// sentence across several paragraphs under spoken headings, told apart from
// the topic, from a paragraph's smaller idea, and from an interesting fact;
// the BEST detail among four true ones; explaining HOW a detail supports the
// main idea ("that supports the main idea because"); Key Detail vs Small Fact;
// the smaller idea of one paragraph under the text's main idea; the summary
// sentences in order; telling a summary from a list of facts; and producing
// the three-sentence summary aloud. ONE original informational text, "The
// Fastest Dive" (the peregrine falcon; every fact true: the hunting dive
// called a stoop, faster than any other animal and faster than any car on a
// highway; lives on every continent except Antarctica; climbs high and waits
// rather than tail-chasing; a small bony cone in each nostril that breaks up
// the rushing air so it can breathe in the dive; a clear third eyelid that
// wipes the eye; long stiff pointed wings folded into a teardrop; smooth
// feathers; the strike with a clenched foot and closed talons, then the catch
// in the air and the carry to a ledge; nests on a cliff ledge, no nest, only a
// scrape; the female larger than the male and doing most of the incubating;
// city buildings as cliffs, chicks raised on skyscraper ledges), 20 sentences
// over 7 child-read pages in three real paragraphs under THREE SPOKEN
// HEADINGS (Faster Than Anything Alive / Built for the Dive / A Cliff Is a
// Cliff), read-along 1/3/5/7 with ref-chained images, accept-mode speaks
// 2/4/6 at 44/53/51 tokens (no " my " token), complex sentences with relative
// pronouns (which breaks up the rushing air, who is larger than the male,
// where a high ledge opens onto the whole sky) and perfect tense (have
// discovered), stretch words stoop (defined in text) / plummets / streamlined
// (supported a clause later) / talons / clenched, no digits, no contractions,
// no real person named. PLANTED: main idea = the peregrine is built for a high
// speed dive; smaller ideas = it hunts with a stoop (paragraph one), its body
// can take the speed (paragraph two), any high perch can start the dive
// (paragraph three); key details = the bony cones, the third eyelid, the
// teardrop wings; small facts = every continent, the female is larger, no
// nest, a cliff ledge. ANCHOR FRESHNESS grep-swept vs every lessons-v2 +
// quizzes-v2 file: peregrine, falcon, stoop, eyelid, streamlined, plummet,
// Antarctica, skyscraper, hurricane, typhoon, iceberg, eye wall all 0 hits
// (teardrop, nostril, talon, windshield only as stray words elsewhere). Keys
// prefixed quiz- are picture supports for the quiz's fresh second text (the
// hurricane).

const A = (id: string) => `/audio/lessons-v2/main-idea-and-summary/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/main-idea-and-summary/${w.toLowerCase()}.png`;

export const mainIdeaAndSummaryImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wide view high above a green river valley with a winding blue river far below, one peregrine falcon with a slate blue gray back and wings, a pale chest with thin dark bars, a dark hood over its head and a dark stripe below each eye, and yellow feet, gliding in a wide circle with its wings spread against a bright blue sky with a few small white clouds, and far below it one tiny dark starling flying over the river, realistic wild bird, no smile, no cartoon face, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same peregrine falcon with a slate blue gray back, a pale chest with thin dark bars, a dark hood and a dark stripe below each eye, diving straight down headfirst at great speed with its wings folded tight against its body so that the whole bird forms one smooth pointed teardrop shape, thin white speed lines streaming up behind it, a bright blue sky behind it and the green river valley blurred far below, realistic wild bird, no smile, no cartoon face, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same peregrine falcon flying upward with its wings spread wide toward a flat rocky ledge on a tall gray cliff, carrying one small dark starling held in its yellow feet, the green river valley and the blue river far below, a bright blue sky, realistic wild birds, no blood, no smile, no cartoon faces, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "The same peregrine falcon perched on the narrow stone ledge of a tall city skyscraper very high above a busy street, the flat rooftops of other tall buildings and tiny cars far below, two fluffy white falcon chicks sitting in a shallow scrape of gravel on the ledge beside it, a clear blue sky, plain windows on every building, realistic wild birds, no smile, no cartoon faces, no people, no signs on any building. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-hurricane-eye": "A view from space looking straight down at one huge white spiral of hurricane clouds swirling over a deep blue ocean, with a small round clear hole at the very center of the spiral where the dark blue sea shows through, a curve of green coastline at one edge of the picture, no people, no ships, no faces on anything. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-warm-sea": "A calm warm tropical sea under a hot bright sun, thin wisps of white water vapor rising from the bright turquoise water into the air, and above them tall towering white storm clouds building high into a blue sky, open water to the horizon, no land, no people, no boats, no faces on the sun or the clouds. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
};

export const mainIdeaAndSummary: LessonDef = {
  id: "main-idea-and-summary",
  title: "Main Idea and Summary",
  grade: "4th Grade",
  standard: "RI.4.2",
  archetype: "inference",
  objective: "I can state the main idea of a fact text as a full sentence, explain how each key detail supports it, and summarize the text in three sentences.",
  concepts: [
    "a topic is a word or two, a main idea is a full sentence about the whole text",
    "a key detail supports the main idea, and you explain how with because",
    "a small fact is true and interesting, but the main idea stands without it",
    "each paragraph carries a smaller idea under the main idea of the text",
    "a summary is three sentences: the main idea, then the key details in the author's order",
    "a summary has no small facts and no opinion",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Fastest Dive and did both jobs a fourth grade reader does with a fact text. You stated the main idea as a full sentence and explained how each key detail supports it with because, and you summarized the whole text in three sentences with nothing small in them.",
    "title": "Main Idea and Summary",
    "body": "You stated the main idea, explained how the key details support it, and summarized the text in three sentences."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Fastest Dive, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. A fact text has a main idea, one sentence that says what all of its pages add up to. A fourth grade reader can state that sentence, show how the key details support it, and then summarize the whole text in three sentences. Here is a true text called The Fastest Dive. Its first heading is Faster Than Anything Alive. Read page one along with me, and start asking what this text is really about." },
      interaction: { type: "read-along", text: "High above a river valley, a peregrine falcon circles until it spots a starling flying far below. Then it folds its wings tight against its body and drops out of the sky in a dive that falcon watchers call a stoop. In that stoop the peregrine plummets faster than any other animal alive, faster than any car on a highway, so fast that the starling never sees it coming.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-topic-vs-main-idea",
      purpose: "model",
      gate: "none",
      prompt: "A topic is a word or two. A main idea is a sentence about the whole text.",
      fx: {"text":"The text says X. That supports the idea **because** Y.","effect":"pop-words"},
      narration: { audio: A("model-topic-vs-main-idea"), script: "Here is the difference between a topic and a main idea. The topic of this text is the peregrine falcon, and that is two words. The main idea is a full sentence that says what the whole text adds up to, and I cannot write it after one page, because I have not read the whole text yet. What I can write is the smaller idea of page one. Page one adds up to this. The peregrine hunts with a dive faster than anything alive. Now watch how a detail supports an idea, because fourth graders do not stop at saying that it does. The text says the starling never sees the falcon coming. That supports the idea because a hunter that arrives before its prey can even look up must be moving faster than anything else in the sky. Detail, then because, then the reason. Keep reading, and keep asking what all the pages add up to." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Peregrines live on every continent except Antarctica, and they hunt other birds wherever the sky is open. A peregrine rarely chases its prey in a long tail chase. It would rather climb high above the bird, wait, and let the dive do the work.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and notice how the peregrine chooses to hunt." },
      interaction: { type: "speak", text: "Peregrines live on every continent except Antarctica and they hunt other birds wherever the sky is open A peregrine rarely chases its prey in a long tail chase It would rather climb high above the bird wait and let the dive do the work" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the air rush in.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "The second heading is Built for the Dive. Read page three along with me, and notice what the nose and the eyes of the falcon have to handle." },
      interaction: { type: "read-along", text: "Air that rushes in at such speed would slam into the lungs of most birds and stop them from breathing. Inside each of the falcon's nostrils sits a small bony cone, which breaks up the rushing air so that the bird can breathe all the way down. Its eyes are guarded too, because a clear third eyelid slides across each eye during the dive and wipes it clean, the way a wiper clears a windshield.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The falcon's wings are long, stiff, and pointed, and they fold flat into a shape like a teardrop when the stoop begins. That streamlined shape, which slips through the air with almost no drag, lets the dive reach such speed. Even the feathers lie smooth so that nothing flutters and slows the fall.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to the shape the wings make." },
      interaction: { type: "speak", text: "The falcon's wings are long stiff and pointed and they fold flat into a shape like a teardrop when the stoop begins That streamlined shape which slips through the air with almost no drag lets the dive reach such speed Even the feathers lie smooth so that nothing flutters and slows the fall" },
    },
    {
      id: "page-5-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and watch the falcon's foot.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five ends the second paragraph. Read along with me, and notice how the falcon strikes." },
      interaction: { type: "read-along", text: "At the bottom of the stoop the falcon does not grab its prey with open claws, because at that speed the blow could hurt the falcon itself. Instead it strikes the bird with a clenched foot, the talons closed like a fist, and the stunned prey tumbles out of the air. The falcon swings around, catches it before it hits the ground, and carries it to a ledge to eat.", audio: A("page-5-read-sentence") },
    },
    {
      id: "guided-choose-main-idea",
      purpose: "guided",
      gate: "interaction",
      prompt: "Five pages in. Which line is the main idea of the whole text?",
      narration: { audio: A("guided-choose-main-idea"), script: "Five pages in, and it is time to write the main idea. Four lines are on your screen. One of them is the topic, and a topic is only a word or two. One is the smaller idea of a single paragraph. One is a true and interesting fact that the text could lose without changing what it adds up to. And one is the main idea, the sentence every page has been holding up. Tap the main idea." },
      interaction: { type: "choose", options: [{ id: "built-for-a-high-speed-dive", label: "built for a high speed dive" }, { id: "the-peregrine-falcon", label: "the peregrine falcon" }, { id: "it-hunts-with-a-stoop", label: "it hunts with a stoop" }, { id: "it-lives-on-every-continent", label: "it lives on every continent" }], correctId: "built-for-a-high-speed-dive", coachWrong: "Test it against every page. A topic is a word or two, a paragraph idea covers one paragraph, and a fact the text could drop is not the main idea. Which line do all five pages hold up?" },
    },
    {
      id: "guided-choose-best-detail",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail best supports the main idea?",
      narration: { audio: A("guided-choose-best-detail"), script: "The main idea is that the peregrine is built for a high speed dive. Now find the detail that supports it best. Four details from the text are on your screen, and every one of them is true. Three of them are interesting, but the main idea would stand without them. One is a key detail, a fact about how the body of the falcon is made for the dive. Tap the detail that supports the main idea best." },
      interaction: { type: "choose", options: [{ id: "a-bony-cone-in-each-nostril", label: "a bony cone in each nostril" }, { id: "it-lives-on-every-continent", label: "it lives on every continent" }, { id: "it-eats-on-a-ledge", label: "it eats on a ledge" }, { id: "it-hunts-other-birds", label: "it hunts other birds" }], correctId: "a-bony-cone-in-each-nostril", coachWrong: "That one is true, but the main idea would stand without it. Which detail tells how the body of the falcon is made for the dive?" },
    },
    {
      id: "guided-choose-how-it-supports",
      purpose: "guided",
      gate: "interaction",
      prompt: "The eyelid detail supports the main idea because...",
      narration: { audio: A("guided-choose-how-it-supports"), script: "Now explain the support in words. Here is a detail. The text says a clear third eyelid slides across each eye during the dive and wipes it clean. That detail supports the main idea because, and now you finish the sentence. Four endings are on your screen. Only one of them tells how the eyelid helps a body that is built for a high speed dive. Tap that ending." },
      interaction: { type: "choose", options: [{ id: "it-keeps-seeing-at-top-speed", label: "it keeps seeing at top speed" }, { id: "it-spots-prey-far-below", label: "it spots prey far below" }, { id: "it-can-blink-like-a-person", label: "it can blink like a person" }, { id: "its-eyes-never-need-to-rest", label: "its eyes never need to rest" }], correctId: "it-keeps-seeing-at-top-speed", coachWrong: "Ask what the eyelid does during the dive itself. The reason has to connect the wiped eye to the speed of the stoop." },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: For most of its life a peregrine nests on a cliff, where a high ledge opens onto the whole sky. It does not build a nest, but only scrapes a shallow hollow into the ledge. The female, who is larger than the male, does most of the sitting on the eggs.",
      narration: { audio: A("page-6-read"), script: "The last heading is A Cliff Is a Cliff. Page six is yours. Read all three sentences out loud, and notice which facts are about the dive and which are simply interesting." },
      interaction: { type: "speak", text: "For most of its life a peregrine nests on a cliff where a high ledge opens onto the whole sky It does not build a nest but only scrapes a shallow hollow into the ledge The female who is larger than the male does most of the sitting on the eggs" },
    },
    {
      id: "apply-sort-key-or-small",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Key Detail, or Small Fact?",
      narration: { audio: A("apply-sort-key-or-small"), script: "Six facts from the text are on your screen, and every one of them is true. A key detail supports the main idea, so if you took it out, the main idea would lose some of its support. A small fact is interesting, but the main idea stands just the same without it. Test each fact against the main idea, the peregrine is built for a high speed dive, and drag it to Key Detail or to Small Fact." },
      interaction: { type: "sort", buckets: ["Key Detail","Small Fact"], items: [{ label: "cones break up rushing air", bucket: "Key Detail" }, { label: "the female is larger", bucket: "Small Fact" }, { label: "wings fold into a teardrop", bucket: "Key Detail" }, { label: "it does not build a nest", bucket: "Small Fact" }, { label: "a third eyelid wipes the eye", bucket: "Key Detail" }, { label: "it nests on a cliff ledge", bucket: "Small Fact" }], coachWrong: "Take that fact out of the text and ask whether the main idea still has the same support. If it does, the fact is small." },
    },
    {
      id: "apply-choose-paragraph-idea",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is the smaller idea of the paragraph under Built for the Dive?",
      narration: { audio: A("apply-choose-paragraph-idea"), script: "A long text has one main idea, but each paragraph under a heading carries a smaller idea of its own. Think about the paragraph under the heading Built for the Dive, which is pages three, four, and five. Four lines are on your screen. One is the idea of a different paragraph. One is only a single detail from this paragraph. One is not in the text at all. And one is the idea that all three pages of this paragraph add up to. Tap that one." },
      interaction: { type: "choose", options: [{ id: "its-body-can-take-the-speed", label: "its body can take the speed" }, { id: "it-hunts-with-a-stoop", label: "it hunts with a stoop" }, { id: "it-hits-with-a-closed-foot", label: "it hits with a closed foot" }, { id: "it-hunts-best-at-night", label: "it hunts best at night" }], correctId: "its-body-can-take-the-speed", coachWrong: "That line is too small, or it belongs to another paragraph, or it is not in the text. Which line covers page three, page four, and page five at once?" },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page. Read along with me, and notice where the dive can begin." },
      interaction: { type: "read-along", text: "In the last hundred years peregrines have discovered that a tall city building looks, to a falcon, exactly like a cliff, so pairs now raise their chicks on ledges high above busy streets and hunt the city birds below in the same folding dive. Wherever there is a high perch and open air, the fastest dive in the world can begin.", audio: A("page-7-read-sentence") },
    },
    {
      id: "apply-sequence-summary",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the three summary sentences in order.",
      narration: { audio: A("apply-sequence-summary"), script: "Now the second job, the summary. A summary of a fact text is three sentences. The main idea comes first. Then come two or three key details, in the order the author gave them, and nothing else, no small facts and no opinion. Three sentences are on your screen, out of order. Drag them into summary order, main idea first, then the details in the order the text gave them." },
      interaction: { type: "sequence", items: [{ id: "main", label: "the falcon is built to dive" }, { id: "detail-one", label: "its nose and eyes take speed" }, { id: "detail-two", label: "its folded wings cut the air" }], order: ["main","detail-one","detail-two"], coachWrong: "Main idea first. Then ask which key detail the text gave first, the one on page three or the one on page four." },
    },
    {
      id: "apply-choose-summary-problem",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is wrong with this summary?",
      narration: { audio: A("apply-choose-summary-problem"), script: "A student wrote a summary of The Fastest Dive, and something is wrong with it. Four problems are on your screen, and only one of them is the real problem. Listen to the summary, then tap the problem. The peregrine falcon is built for a high speed dive. It lives on every continent except Antarctica. It does not build a nest. The female is larger than the male." },
      interaction: { type: "choose", options: [{ id: "its-details-are-small-facts", label: "its details are small facts" }, { id: "it-adds-an-opinion", label: "it adds an opinion" }, { id: "it-skips-the-main-idea", label: "it skips the main idea" }, { id: "it-mixes-up-the-order", label: "it mixes up the order" }], correctId: "its-details-are-small-facts", coachWrong: "Check the summary against that problem. Does it really have that problem? Then look hard at the three sentences after the main idea." },
    },
    {
      id: "challenge-speak-summary",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the summary: the main idea, then two key details in order.",
      narration: { audio: A("challenge-speak-summary"), script: "Last one, and the summary is yours. Tap the mic. Say the main idea of The Fastest Dive in one full sentence. Then say two key details in the order the text gave them. Leave out the small facts, and leave out your opinion." },
      interaction: { type: "speak", text: "built dive diving dives stoop speed fast faster fastest nostrils nostril cone cones eyelid eyelids eye eyes wipes wiper wings wing fold folds folded teardrop streamlined feathers smooth breathe breathes clenched foot talons strike strikes drag body" },
    },
    {
      id: "celebrate-main-idea-and-summary",
      purpose: "celebrate",
      gate: "none",
      prompt: "Main idea first. Key details next. Nothing small.",
      fx: {"text":"Main idea, then **key details**, nothing small","effect":"fireworks"},
      narration: { audio: A("celebrate-main-idea-and-summary"), script: "Today you read a whole fact text and stated its main idea in one full sentence. You found the key details that support it, and you explained the support with because. You told the key details from the small facts, and you summarized the whole text in three sentences, main idea first, details in order, nothing small and no opinion. That is what fourth grade readers do with every fact text." },
    },
  ],
};
