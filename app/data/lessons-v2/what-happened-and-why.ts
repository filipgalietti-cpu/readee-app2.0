import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./what-happened-and-why-timings.json";

// What Happened and Why (RI.4.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=what-happened-and-why
// G4-U1. THE EXPLANATION CHAIN tier of RI.4.3 (sibling split: because-then-so
// RI.3.3 (Old Faithful + the bottle geyser) owns time words vs cause words and
// the after-vs-because line, so no signal-word sort and no geyser here;
// sentence-to-sentence RI.3.8 (flamingos) owns the connection between two
// sentences and the paragraph move; facts-say-so-i-know RI.4.1 (mangroves)
// owns evidence-to-inference, so the product here is always an EXPLANATION of
// an event, a procedure, or a concept, never an inference tile;
// main-idea-and-summary RI.4.2 (parallel producer) untouched; the-whole-fact-
// book RI.3.10 (printing press) owns the G3 capstone). THIS lesson owns the G4
// step-up: EXPLAINING a text instead of recalling it. For an EVENT, what
// happened and why, said in the child's words from specific sentences, as a
// two-link chain ("moving coal by water was cheap, but rivers did not go
// everywhere, so people dug canals"); for a PROCEDURE, the steps in order and
// why one step comes before another; for a CONCEPT, what it means in the
// child's words and the BEST-EVIDENCE detail that shows why it matters; a
// What Happened / Why It Happened sort; and a PRODUCTION speak that explains
// the last page's event in a two-link chain. ONE original informational text,
// "A Staircase for Boats" (canal locks; every fact true: more than two hundred
// years ago, before railroads, floating was the cheapest way to move heavy
// loads, a towpath horse could pull a thirty-ton boat, more than ten road
// wagons could carry; rivers did not go everywhere so people dug canals; a
// canal must stay level or its water drains to the lowest end; the lock is a
// stone or brick chamber with a wooden gate at each end; boat in, lower gate
// closed, paddles in the upper gate opened, chamber fills, boat rises, upper
// gate opens; about ten minutes, no engine; water runs downhill until it is
// level, nobody pumps it in or out, every passage sends one chamber of water
// downhill so a summit needs a reservoir; staircase locks up steep hills that
// take half a day; when the first great canal reached a coal-burning city the
// price of coal fell by half within a year because one horse and one boat did
// the work of a line of wagons; factories along the banks, towns at the
// locks), 20 sentences over 7 child-read pages in real paragraphs under FOUR
// SPOKEN HEADINGS (Boats Cannot Climb / Inside a Lock / Water Finds Its Level
// / What the Locks Changed), read-along 1/3/5/7 with ref-chained images,
// accept-mode speaks 2/4/6 at 49/54/48 tokens (no " my " token), complex
// sentences with relative pronouns (which is a chamber, that wants to go
// uphill, that sit low in the upper gate, which is why), perfect tenses,
// stretch words chamber / paddles / level / reservoir / staircase with support
// in the text, no digits, no contractions, no real person named. ANCHOR
// FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: canal lock,
// towpath, lock keeper, paddles, chamber, reservoir, staircase locks, coal all
// 0 hits as topics (Canal Street is a G3 setting name only, lock appears only
// as the verb / unlock, a windmill is burned by maps-and-photos, geysers by
// because-then-so, the printing press and the telegraph by the-whole-fact-
// book, lighthouses by fact-party). Keys prefixed quiz- are picture supports
// for the quiz's fresh second text (the elevator safety brake).

const A = (id: string) => `/audio/lessons-v2/what-happened-and-why/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/what-happened-and-why/${w.toLowerCase()}.png`;

export const whatHappenedAndWhyImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wide side view of a long narrow wooden canal boat painted dark green and red, heaped with shiny black coal, floating on a straight calm canal, a sturdy brown horse walking along a dirt path on the near bank pulling the boat by a long rope tied to the boat, a man in a flat cap and a brown coat walking beside the horse, flat green fields with hedges and a low stone bridge far in the distance, soft morning light, realistic horse seen from the side with a natural face and no smile. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "A canal lock seen from the bank, a deep narrow chamber with walls of gray stone blocks and a tall pair of dark wooden gates at each end, the same long narrow green and red canal boat heaped with black coal sitting low inside the chamber, white water pouring through openings low in the closed upper gates and swirling into the chamber, a woman in a flat cap and a brown coat on the top of the upper gate turning a small iron handle, the higher canal beyond the upper gates and the lower canal behind the boat, green grass and a small stone cottage beside the lock. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "A staircase of canal locks climbing a long green hill, five stone chambers one above the other with dark wooden gates between them, water at a different height in each chamber, the same long narrow green and red canal boat heaped with black coal sitting in the second chamber from the bottom, a dirt path running up beside the locks with a brown horse waiting on it, green fields and hedges on both sides, blue sky with a few white clouds, realistic horse with no smile. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "A canal running into an old town, the same long narrow green and red canal boat heaped with black coal moored at a stone wharf, tall red brick factory buildings with rows of windows and slim chimneys along both banks, a row of small brick houses beside a lock with wooden gates, a wooden crane on the wharf, a few people in flat caps and long coats unloading coal into a cart, hazy afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, completely blank walls and blank signs, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-platform-cut": "The inside of a huge glass and iron exhibition hall, a tall man with dark hair and a dark suit standing calmly on a small open wooden platform raised high above the floor between two tall wooden rails, a thick rope hanging cut and loose above his head, a second man on a beam above holding an axe, a crowd of people in long coats and tall hats far below looking up, sunlight through the glass roof. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no writing anywhere.",
};

export const whatHappenedAndWhy: LessonDef = {
  id: "what-happened-and-why",
  title: "What Happened and Why",
  grade: "4th Grade",
  standard: "RI.4.3",
  archetype: "inference",
  objective: "I can explain an event, a procedure, or a concept in a fact text, telling what happened and why in my own words from specific information in the text.",
  concepts: [
    "explaining is more than recalling: what happened, and why, from specific sentences",
    "an explanation is a chain of links: this happened because the text says X, which led to Y",
    "for an event, name what happened and the reason the text gives",
    "for a procedure, put the steps in order and say why one step comes before another",
    "for a concept, say what it means in your own words and pick the detail that shows why it matters",
    "a statement can report what happened or give the reason why, and a reader can tell which",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read A Staircase for Boats and explained it instead of just remembering it. You told what happened and why from the sentences that said so, you put a procedure in order and said why one step came before another, and you said what a concept means and why it matters. That is what explaining a text sounds like in fourth grade.",
    "title": "What Happened, and Why",
    "body": "You explained an event, a procedure, and a concept by telling what happened and why, in your own words, from specific information in the text."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A Staircase for Boats, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Third grade readers can tell you what a fact text said. Fourth grade readers can explain it, and explaining is a bigger job. For an event, you tell what happened and why it happened. For a procedure, a set of steps, you tell what each step does and why it comes where it does. For a concept, an idea, you tell what it means and why it matters. Every time, the why comes from specific sentences in the text, and you say it in your own words. Here is page one of A Staircase for Boats, under its first heading, Boats Cannot Climb. Read along with me, and keep track of what people did and why." },
      interaction: { type: "read-along", text: "More than two hundred years ago, before there were any railroads, the cheapest way to move anything heavy was to float it. A horse walking along the bank could pull a boat loaded with thirty tons of coal, which was more than ten wagons could carry over a muddy road. The trouble was that rivers did not go everywhere, so people began to dig canals, long channels of still water that could join a coal mine to a city.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-explanation-chain",
      purpose: "model",
      gate: "none",
      prompt: "What happened, why it happened, from which sentences.",
      fx: {"text":"**What** happened, **why** it happened, from **which** sentences","effect":"pop-words"},
      narration: { audio: A("model-explanation-chain"), script: "Here is how I explain an event. First, what happened. Page one says people began to dig canals. A third grader would stop there. I keep going, because the why is on the same page. The first sentence says floating was the cheapest way to move anything heavy, and the second sentence says a horse could pull thirty tons on water. The last sentence says rivers did not go everywhere. Now I put the links in a chain, in my own words. Moving coal by water was cheap, but rivers did not go everywhere, so people dug canals to bring the water to the coal. Notice the shape. What happened, why it happened, and which sentences told me. That chain is the whole lesson." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A canal has a problem that a river solves by itself. Water in a river runs downhill, but a canal must stay level, or all of its water would drain away to the lowest end. Whenever the land rose, the diggers faced a hill that their level water could not climb.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, still under Boats Cannot Climb. Read all three sentences out loud, and hold on to what a canal must do that a river does not." },
      interaction: { type: "speak", text: "A canal has a problem that a river solves by itself Water in a river runs downhill but a canal must stay level or all of its water would drain away to the lowest end Whenever the land rose the diggers faced a hill that their level water could not climb" },
    },
    {
      id: "guided-choose-why-the-hill",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why did the diggers have a problem at every hill?",
      narration: { audio: A("guided-choose-why-the-hill"), script: "Your turn to explain an event. Here is the what. Page two says that whenever the land rose, the diggers faced a hill. Now the why, and it is on the same page. Four reasons are on your screen. Only one of them is what page two lets you say. Tap it." },
      interaction: { type: "choose", options: [{ id: "a-canal-has-to-stay-level", label: "a canal has to stay level" }, { id: "the-horses-grew-too-tired", label: "the horses grew too tired" }, { id: "the-rivers-ran-too-fast", label: "the rivers ran too fast" }, { id: "the-coal-was-too-heavy", label: "the coal was too heavy" }], correctId: "a-canal-has-to-stay-level", coachWrong: "Page two never says that. The reason sits in the middle sentence, right after the word but. Find the reason the page really gives." },
    },
    {
      id: "guided-choose-the-information",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words from page two show why a canal must stay level?",
      narration: { audio: A("guided-choose-the-information"), script: "An explanation is only as good as the specific information behind it. You said a canal has to stay level. Now show the words that tell why that is true. Four pieces of page two are on your screen, and every one of them is really on the page. Only one of them tells what would go wrong if a canal did not stay level. Tap those words." },
      interaction: { type: "choose", options: [{ id: "all-of-its-water-would-drain", label: "all of its water would drain" }, { id: "the-diggers-faced-a-hill", label: "the diggers faced a hill" }, { id: "a-river-solves-by-itself", label: "a river solves by itself" }, { id: "whenever-the-land-rose", label: "whenever the land rose" }], correctId: "all-of-its-water-would-drain", coachWrong: "Those words are on the page, but they do not tell what would go wrong. Look at the middle sentence again, after the word or." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the gates.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three opens the next heading, Inside a Lock. This page is a procedure, a set of steps that happen in order. Read along with me, and notice what the crew does right after the boat sails in." },
      interaction: { type: "read-along", text: "The answer was a lock, which is a chamber of stone or brick with a heavy wooden gate at each end. A boat that wants to go uphill sails into the chamber through the lower gate, and the crew closes that gate behind it. Then the lock keeper opens small doors, called paddles, that sit low in the upper gate, and water from the higher canal pours into the chamber.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The chamber fills, and the boat rises with the water like a leaf in a bathtub. When the water inside stands as high as the canal above, the upper gate swings open and the boat sails out on the higher level. The whole climb takes about ten minutes and uses no engine at all.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to what opens when the water inside is high enough." },
      interaction: { type: "speak", text: "The chamber fills and the boat rises with the water like a leaf in a bathtub When the water inside stands as high as the canal above the upper gate swings open and the boat sails out on the higher level The whole climb takes about ten minutes and uses no engine at all" },
    },
    {
      id: "apply-sequence-lock-steps",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the steps of the lock in the order the text gives them.",
      narration: { audio: A("apply-sequence-lock-steps"), script: "A procedure only makes sense in order. Four steps of the lock from pages three and four are on your screen, mixed up. Tap them in the order the text gives them, from the first thing the boat does to the last thing the gate does." },
      interaction: { type: "sequence", items: [{ id: "sails-in", label: "boat sails in the lower gate" }, { id: "gate-closed", label: "the lower gate is closed" }, { id: "paddles-open", label: "paddles let water pour in" }, { id: "upper-opens", label: "the upper gate swings open" }], order: ["sails-in","gate-closed","paddles-open","upper-opens"], coachWrong: "Ask what has to be true before each step can happen. Where is the boat when the first thing happens, and what is the chamber like before the water can rise?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and watch what nobody has to do.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five opens the third heading, Water Finds Its Level. This page carries the idea that makes the whole procedure work. Read along with me, and notice what nobody has to do." },
      interaction: { type: "read-along", text: "The lock works because of one idea that every canal builder understood, which is that water always runs downhill until it is level. Nobody pumps water into the chamber, since it flows down from the higher canal on its own, and nobody pumps it out, since the lower paddles simply let it fall to the lower canal. Every boat that climbs a lock sends one chamber of water downhill, which is why the top of a canal needs a lake or a reservoir, a stored supply of water, to keep it full.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-why-this-step",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why is the lower gate closed before the paddles open?",
      narration: { audio: A("apply-choose-why-this-step"), script: "Here is the fourth grade move on a procedure. Not just what each step is, but why it comes where it does. Page three says the crew closes the lower gate before the keeper opens the paddles, and page five gives the idea that explains that order. Four reasons are on your screen. Tap the one that page five lets you say." },
      interaction: { type: "choose", options: [{ id: "so-the-water-cannot-run-out", label: "so the water cannot run out" }, { id: "so-the-horse-can-rest", label: "so the horse can rest" }, { id: "so-the-keeper-can-climb-down", label: "so the keeper can climb down" }, { id: "so-the-boat-stops-rocking", label: "so the boat stops rocking" }], correctId: "so-the-water-cannot-run-out", coachWrong: "Nothing on page five says that. Test it against the idea on page five. Which way does water always run, and what would an open lower gate let it do?" },
    },
    {
      id: "apply-choose-concept-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does water finds its level mean?",
      narration: { audio: A("apply-choose-concept-meaning"), script: "Now the concept. The heading says water finds its level, and the first sentence of page five says the same idea in full. Explaining a concept means saying what it means in your own words. Four meanings are on your screen. Only one of them matches what page five says. Tap it." },
      interaction: { type: "choose", options: [{ id: "water-runs-down-until-level", label: "water runs down until level" }, { id: "water-climbs-when-pushed", label: "water climbs when pushed" }, { id: "water-stays-where-it-is-put", label: "water stays where it is put" }, { id: "water-rises-when-it-is-warm", label: "water rises when it is warm" }], correctId: "water-runs-down-until-level", coachWrong: "Look again at the first sentence of page five. What does water always do, and when does it stop doing it?" },
    },
    {
      id: "apply-choose-why-it-matters",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which detail best shows why that idea matters to a lock?",
      narration: { audio: A("apply-choose-why-it-matters"), script: "Explaining a concept also means saying why it matters, and the text gives specific information for that. Four details from pages three, four, and five are on your screen, and every one of them is in the text. Only one of them shows what the idea of water finding its level does for a lock. Tap the best evidence." },
      interaction: { type: "choose", options: [{ id: "nobody-pumps-the-water-in", label: "nobody pumps the water in" }, { id: "the-gates-are-heavy-wood", label: "the gates are heavy wood" }, { id: "the-chamber-is-made-of-stone", label: "the chamber is made of stone" }, { id: "the-climb-takes-ten-minutes", label: "the climb takes ten minutes" }], correctId: "nobody-pumps-the-water-in", coachWrong: "That detail is true, but it describes the lock, not the water. Which detail is about how the water gets into the chamber?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Where a canal met a steep hill, the builders set several locks in a row, and boats climbed them one chamber at a time like a staircase. On the longest staircases a boat could spend half a day rising past the fields while the horse waited on the path.",
      narration: { audio: A("page-6-read"), script: "Page six is yours, still under Water Finds Its Level. Read both sentences out loud, and hold on to what the builders did at a steep hill." },
      interaction: { type: "speak", text: "Where a canal met a steep hill the builders set several locks in a row and boats climbed them one chamber at a time like a staircase On the longest staircases a boat could spend half a day rising past the fields while the horse waited on the path" },
    },
    {
      id: "apply-sort-what-and-why",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: What Happened, or Why It Happened?",
      narration: { audio: A("apply-sort-what-and-why"), script: "Here is a sort. Six statements from the text so far are on your screen. Three of them tell what happened, an event the text reports. Three of them tell why, a reason the text gives for one of those events. Read each one and ask which job it does. Drag the events to What Happened, and drag the reasons to the other bucket, Why It Happened." },
      interaction: { type: "sort", buckets: ["What Happened","Why It Happened"], items: [{ label: "people dug canals", bucket: "What Happened" }, { label: "rivers did not go everywhere", bucket: "Why It Happened" }, { label: "the diggers faced a hill", bucket: "What Happened" }, { label: "a canal has to stay level", bucket: "Why It Happened" }, { label: "locks were set in a row", bucket: "What Happened" }, { label: "a horse pulls more on water", bucket: "Why It Happened" }], coachWrong: "Ask whether the statement is a thing that happened, or the reason a thing happened. A reason answers the question why." },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page, under the heading What the Locks Changed. Read along with me, and notice the word because." },
      interaction: { type: "read-along", text: "When the first great canal reached a city that burned coal in every fireplace, the price of coal there fell by half within a year, because one horse and one boat now did the work of a whole line of wagons. Factories were built along the banks, and towns grew up around the busiest locks. Rivers had gone where they pleased for as long as anyone could remember, but the lock let people carry water, and the boats on it, over the hills.", audio: A("page-7-read-sentence") },
    },
    {
      id: "challenge-speak-explain-the-price",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Why did the price of coal fall? Explain it in two links from the text.",
      narration: { audio: A("challenge-speak-explain-the-price"), script: "Last one, and you build the whole chain out loud. Page seven reports an event. The price of coal in that city fell by half. Tap the mic. Say what happened, then say why, using the text. Make two links. Start with what one horse and one boat could do, and end with what that did to the price." },
      interaction: { type: "speak", text: "horse boat boats canal canals wagons wagon line work coal price fell half cheaper cheap city fireplace fireplaces carry carried pull pulled thirty tons water lock locks hills move moved factories cost less" },
    },
    {
      id: "celebrate-what-happened-and-why",
      purpose: "celebrate",
      gate: "none",
      prompt: "What happened, and why.",
      fx: {"text":"What happened, **and why**","effect":"fireworks"},
      narration: { audio: A("celebrate-what-happened-and-why"), script: "Today you explained a text instead of just remembering it. For an event, you told what happened and why, from the sentences that said so. For a procedure, you put the steps in order and said why one step came before another. For a concept, you said what it meant in your own words and picked the detail that showed why it mattered. From now on, when someone asks what a text was about, you have a chain ready. What happened, and why." },
    },
  ],
};
