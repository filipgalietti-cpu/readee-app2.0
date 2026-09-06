import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./facts-say-so-i-know-timings.json";

// Facts Say, So I Know (RI.4.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=facts-say-so-i-know
// G4-U1, the INFORMATIONAL TWIN of the G4 pilot text-says-so-i-know (RL.4.1).
// EVIDENCE FOR BOTH KINDS OF QUESTIONS ON A FACT TEXT tier of RI.4.1 (sibling
// split: point-to-the-fact RI.3.1 (redwoods) owns the proving SENTENCE for an
// explicit answer at G3 (right there / put together / the text does not say),
// so explicit beats here are brief and lean on the EXAMPLE a fact writer uses
// to prove a point; big-idea-backed-up RI.3.2 (prairie dogs) owns big idea +
// key details; the-whole-fact-book RI.3.10 (printing press) owns the G3
// capstone; text-says-so-i-know RL.4.1 owns the same move on a STORY, so no
// phrasing pattern of its tiles is reused). THIS lesson owns the G4 core move
// on a fact text: an EXPLICIT question is answered by pointing to the detail
// or the example, an INFERENCE question is answered by citing the detail AND
// stating what it lets you know ("the text says X, so I can tell Y"), telling
// the two kinds apart, choosing the BEST evidence when several details are
// true but only one supports the inference, spotting the EXAMPLE a writer
// uses to prove a point, and REJECTING an inference no detail supports even
// when it might be true in the world. ONE original informational text, "The
// Forest That Stands in the Sea" (mangroves; every fact true: warm coasts
// where rivers meet the sea, tide covers the trunks twice a day, the black
// mangrove pushes salt out through its leaves until crystals sit on them,
// thick waxy leaves whose openings close on hot afternoons, salt-filled old
// leaves dropped, red mangrove stilt roots that grip the mud, black mangrove
// root tips that poke up like straws and take in air through openings when
// the tide is out, mud crabs and oysters among the roots, seeds that sprout on
// the branch into pencil-long spikes that float for weeks before snagging in
// mud, villages behind thick mangroves lost fewer homes in a great storm than
// villages whose trees were cut, replanting after fish farms, the root tangle
// as a nursery for young fish and shrimp and crabs, fishers far at sea hauling
// fish that grew up there), 20 sentences over 7 child-read pages in real
// paragraphs under FOUR SPOKEN HEADINGS (Trees in Salt Water / Roots Like
// Stilts and Straws / Seeds That Sail / A Wall and a Nursery), read-along
// 1/3/5/7 with ref-chained images, accept-mode speaks 2/4/6 at 53/51/53
// tokens (no " my " token), complex sentences with relative pronouns (which
// are called mangroves, where bigger hunters cannot, who may never set foot,
// whose trees had been cut down), perfect tenses, stretch words scarce /
// stilts / snags / nursery / shelter with support in the text, no digits, no
// contractions, no real person named. PLANTED inferences: the tree drinks
// salt water (crystals pushed out of the leaves), the leaf openings close to
// keep water from escaping (fresh water scarce + guards every drop + hot
// afternoons), the mud holds little air (root tips take in air above the
// mud; tempting TRUE non-support = the sea covers the tips at high tide), a
// seedling can travel far (drifts for many weeks), the forest matters to
// people far from it (villages, fishers); the true-in-the-world inference the
// text never supports (crocodiles hunt in the roots). ANCHOR FRESHNESS
// grep-swept vs every lessons-v2 + quizzes-v2 file: mangrove, stilt roots,
// root tips, propagule/spike, salt crystals, oysters, mud crab, nursery,
// fishers, kangaroo rat, cheek pouches all 0 hits (crab / seed / salt / tide
// only as phonics or picture words elsewhere; lighthouses, redwoods, prairie
// dogs, earthworms, bison, sloths rejected as burned). Keys prefixed quiz- are
// picture supports for the quiz's fresh second text (the kangaroo rat).

const A = (id: string) => `/audio/lessons-v2/facts-say-so-i-know/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/facts-say-so-i-know/${w.toLowerCase()}.png`;

export const factsSaySoIKnowImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wide view of a mangrove forest along a warm tropical coast at high tide, many leafy green trees standing in shallow blue green sea water on arching tangled roots, the mouth of a slow brown river meeting the sea in the background, a few thick oval leaves in the foreground dusted with tiny white salt crystals, bright blue sky, no people, no animals. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same mangrove forest at low tide seen from the muddy shore, the water pulled far back, on the left a red mangrove standing high on tall arching stilt roots that grip glossy brown mud, on the right a black mangrove trunk surrounded by hundreds of thin pencil shaped root tips poking straight up out of the mud like straws, a few small round burrow holes in the mud between the root tips, clusters of gray oysters clinging to the stilt roots, no animals, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "A close view of one mangrove branch from the same forest with several long green pencil shaped seedlings hanging straight down from it over the water, and below on the gentle blue green waves one green seedling spike floating away on its side, sunlight sparkling on the water, the mangrove forest soft in the background, no people, no animals. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "An underwater view among the tangled arching roots of the same mangrove forest, rays of sunlight slanting through green blue water, a school of small silver young fish and a few small shrimp tucked safely between the roots, one larger gray fish waiting outside the tangle unable to squeeze in, realistic fish with no smiles and no cartoon faces, and beyond the roots in open water the dark hull of a small wooden fishing boat seen from below with a net hanging down, no people visible. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-kangaroo-rat": "A small sandy brown kangaroo rat seen from the side in mid hop across pale sand at night under a starry sky, its very large hind feet stretched out behind it, tiny front paws tucked in, a long thin tail with a white tufted tip streaming out behind, its head turned away from the viewer so the face is barely visible, a few dry grass stalks and scattered tiny brown seeds on the sand, realistic wild rodent, no smile, no cartoon face, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-burrow": "A hot daytime desert scene under a blazing yellow sun and cloudless sky, a low mound of pale sand with one small round burrow entrance packed shut with sand, dry grass stalks and a few scattered tiny seeds nearby, heat shimmer in the air, no animals, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
};

export const factsSaySoIKnow: LessonDef = {
  id: "facts-say-so-i-know",
  title: "Facts Say, So I Know",
  grade: "4th Grade",
  standard: "RI.4.1",
  archetype: "inference",
  objective: "I can answer an explicit question about a fact text by pointing to the detail or the example, and answer an inference question by citing the detail and saying what it lets me know.",
  concepts: [
    "an explicit question is answered by the text outright, so point to the detail or the example",
    "a fact writer often proves a point with an example, and a reader can point to it",
    "an inference question is answered by a detail plus what it lets you know",
    "the text says, so I can tell: detail first, inference second",
    "when several details are true, choose the one that really supports the inference",
    "an inference with no detail behind it gets rejected, even if it might be true somewhere",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You finished The Forest That Stands in the Sea and answered every question with evidence. Explicit answers came from the detail or the example on the page, inferences came from a detail plus what it let you know, and an inference with no detail behind it got rejected. That is how fourth grade readers read facts.",
    "title": "The Facts Say, So I Can Tell",
    "body": "You answered explicit questions by pointing to the detail or the example, and inference questions by citing the detail and saying what it lets you know."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Forest That Stands in the Sea, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In fourth grade a fact text gets the same treatment as a story. Every answer comes with evidence. Some questions are explicit. The text says the answer outright, and you point to the detail, or to the example the writer uses to prove a point. Some questions are inferences. The text never says the answer, but its details let you work it out, so you cite the detail and then say what it lets you know. Here is page one of The Forest That Stands in the Sea, under its first heading, Trees in Salt Water. Read along with me, and keep track of what the page says outright." },
      interaction: { type: "read-along", text: "Along warm coasts where rivers spill into the sea, there grows a forest that stands in salt water. Twice each day the tide rises until the trunks of these trees, which are called mangroves, stand in the sea, and twice each day it sinks back and leaves them on soft, wet mud. Most trees would die within days if the sea ever reached their roots, but a mangrove has ways of dealing with salt, and the black mangrove, for example, pushes salt out through its leaves until white crystals sit on top of them like frost.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-two-questions",
      purpose: "model",
      gate: "none",
      prompt: "The text says X, so I can tell Y.",
      fx: {"text":"The text says **X**, so I can tell **Y**","effect":"pop-words"},
      narration: { audio: A("model-two-questions"), script: "Here is how I answer both kinds. My first question is explicit. How does a mangrove deal with salt? I look for the detail, and this writer proves the point with an example. The text says the black mangrove, for example, pushes salt out through its leaves. I point to that example and I am done, because the page said it outright. My second question is an inference. Does a mangrove drink salt water? No sentence says so. But the text says white crystals of salt sit on top of its leaves, and it says the tree pushes that salt out. Salt coming out means salt went in, so I can tell the tree drinks the sea water and sends the salt back out. Notice the shape of that answer. The text says, and then, so I can tell. Detail first, inference second. That shape is the whole lesson." },
    },
    {
      id: "guided-choose-which-is-inference",
      purpose: "guided",
      gate: "interaction",
      prompt: "Three of these are explicit. Tap the one that needs an inference.",
      narration: { audio: A("guided-choose-which-is-inference"), script: "Your turn to tell the two kinds apart. Four questions about page one are on your screen. Three of them are explicit, because a sentence on the page answers each one outright. One of them is an inference question, because no sentence answers it, and you would have to work it out from the details. Tap the inference question." },
      interaction: { type: "choose", options: [{ id: "why-most-trees-would-die", label: "why most trees would die" }, { id: "how-often-the-tide-rises", label: "how often the tide rises" }, { id: "where-the-forest-grows", label: "where the forest grows" }, { id: "what-sits-on-the-leaves", label: "what sits on the leaves" }], correctId: "why-most-trees-would-die", coachWrong: "A sentence on page one answers that one outright, so it is explicit. Find the question that no sentence answers." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Fresh water is scarce for a tree that stands in the sea, so a mangrove guards every drop. Its leaves are thick and waxy, and on hot afternoons the tree closes the tiny openings in them. Old leaves that have filled with salt turn yellow and drop, taking the salt with them.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, still under Trees in Salt Water. Read all three sentences out loud, and hold on to what the tree does on hot afternoons." },
      interaction: { type: "speak", text: "Fresh water is scarce for a tree that stands in the sea so a mangrove guards every drop Its leaves are thick and waxy and on hot afternoons the tree closes the tiny openings in them Old leaves that have filled with salt turn yellow and drop taking the salt with them" },
    },
    {
      id: "guided-choose-supported-inference",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why does the tree close the openings in its leaves?",
      narration: { audio: A("guided-choose-supported-inference"), script: "Now the inference half. Page two never says why the tree closes those openings on a hot afternoon, but it plants two details right before that. It says what is scarce for a tree in the sea, and it says the tree guards every drop. Four reasons are on your screen. Only one of them is what those details let you know. Tap it." },
      interaction: { type: "choose", options: [{ id: "to-keep-water-from-escaping", label: "to keep water from escaping" }, { id: "to-keep-the-salt-water-out", label: "to keep the salt water out" }, { id: "to-stop-crabs-climbing-up", label: "to stop crabs climbing up" }, { id: "to-catch-more-sunlight", label: "to catch more sunlight" }], correctId: "to-keep-water-from-escaping", coachWrong: "Test that against the details. Fresh water is scarce, and the tree guards every drop. Which reason is about those drops?" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the roots.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three opens a new heading, Roots Like Stilts and Straws. Read along with me, and notice what each kind of root does." },
      interaction: { type: "read-along", text: "A red mangrove seems to stand on tiptoe, because its roots arch down from the trunk like stilts and grip the mud below, and that tangle of stilts holds the tree steady when waves push against it. A black mangrove has a different trick, and it sends up hundreds of thin root tips that poke out of the mud like straws.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Each root tip is dotted with tiny openings that take in air whenever the tide is out. At high tide the sea covers the tips, and at low tide they stand in the open air. Mud crabs dig burrows between the tips, and oysters cling to the stilts of the red mangroves nearby.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to what the root tips take in." },
      interaction: { type: "speak", text: "Each root tip is dotted with tiny openings that take in air whenever the tide is out At high tide the sea covers the tips and at low tide they stand in the open air Mud crabs dig burrows between the tips and oysters cling to the stilts of the red mangroves nearby" },
    },
    {
      id: "guided-choose-best-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail best shows that the mud holds little air?",
      narration: { audio: A("guided-choose-best-evidence"), script: "Here is a fourth grade move. Sometimes several details are true, but only one of them really supports your inference. My inference is that the mud under a mangrove holds very little air for the roots. Four details from pages three and four are on your screen, and every one of them is really in the text. One of them is about getting air, and that one is the best evidence. The others are true, but they support something else, or nothing at all. Tap the best evidence." },
      interaction: { type: "choose", options: [{ id: "root-tips-take-in-air", label: "root tips take in air" }, { id: "the-sea-covers-the-tips", label: "the sea covers the tips" }, { id: "the-stilts-grip-the-mud", label: "the stilts grip the mud" }, { id: "oysters-cling-to-the-stilts", label: "oysters cling to the stilts" }], correctId: "root-tips-take-in-air", coachWrong: "That detail is true, but ask what it supports. Gripping mud tells about balance, and the sea covering the tips tells about the tide. Which detail tells about air?" },
    },
    {
      id: "apply-sort-supported",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Supported, or Not Supported?",
      narration: { audio: A("apply-sort-supported"), script: "Here are six inferences about the text so far. Some of them are supported, because a detail on one of the pages backs them up. Some of them are not supported, because no detail backs them up, and a detail may even point the other way. Read each one and hunt for its detail. If you can name the detail, drag it to Supported. If there is no detail, drag it to the other bucket, Not Supported." },
      interaction: { type: "sort", buckets: ["Supported","Not Supported"], items: [{ label: "the roots need air to live", bucket: "Supported" }, { label: "mangroves like cold water", bucket: "Not Supported" }, { label: "salt would harm the tree", bucket: "Supported" }, { label: "the tree drinks only rain", bucket: "Not Supported" }, { label: "the tree takes in salt water", bucket: "Supported" }, { label: "the roots go straight down", bucket: "Not Supported" }], coachWrong: "Hunt for the detail. If a page shows it, the inference is supported. If no page shows it, or a page shows the opposite, it is not." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and follow the seed.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five carries its own heading, Seeds That Sail. Read along with me, and notice how far the seed travels before it settles." },
      interaction: { type: "read-along", text: "A mangrove seed does not wait to reach the ground before it sprouts. It sprouts while it still hangs from the branch, growing into a green spike as long as a pencil, which then drops and floats away on the tide. A spike can drift for many weeks before its tip snags in soft mud, and only then does it put down roots.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-seed-inference",
      purpose: "apply",
      gate: "interaction",
      prompt: "What can you tell about mangrove seeds from page five?",
      narration: { audio: A("apply-choose-seed-inference"), script: "Another inference. Page five never says where new mangrove forests come from, but it plants details about the spike, how it travels and for how long. Four inferences are on your screen. Only one of them is what those details let you know. Tap it." },
      interaction: { type: "choose", options: [{ id: "a-seedling-can-travel-far", label: "a seedling can travel far" }, { id: "a-seed-needs-dry-ground", label: "a seed needs dry ground" }, { id: "a-spike-sinks-right-away", label: "a spike sinks right away" }, { id: "a-seed-sprouts-in-the-mud", label: "a seed sprouts in the mud" }], correctId: "a-seedling-can-travel-far", coachWrong: "Test that against the details. The spike floats, and it drifts for many weeks before it snags. Which inference do those details point to?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: When a storm drives waves at the coast, a wide band of mangroves takes the blow first. After one great storm, villages behind thick mangroves lost far fewer homes than villages whose trees had been cut down. People who once cleared the trees for fish farms now plant them back along the shore.",
      narration: { audio: A("page-6-read"), script: "Page six opens the last heading, A Wall and a Nursery. Read all three sentences out loud, and hold on to what happened to the villages." },
      interaction: { type: "speak", text: "When a storm drives waves at the coast a wide band of mangroves takes the blow first After one great storm villages behind thick mangroves lost far fewer homes than villages whose trees had been cut down People who once cleared the trees for fish farms now plant them back along the shore" },
    },
    {
      id: "apply-choose-the-example",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which example proves that mangroves protect the land behind them?",
      narration: { audio: A("apply-choose-the-example"), script: "Fact writers prove a point with an example, and a careful reader can point to it. The point on page six is that a band of mangroves protects the land behind it. Four details from the text are on your screen, and all four are true. Only one of them is the example the writer uses to prove that point. Tap the example." },
      interaction: { type: "choose", options: [{ id: "villages-lost-fewer-homes", label: "villages lost fewer homes" }, { id: "the-spike-drifts-for-weeks", label: "the spike drifts for weeks" }, { id: "salt-sits-on-the-leaves", label: "salt sits on the leaves" }, { id: "oysters-cling-to-the-stilts", label: "oysters cling to the stilts" }], correctId: "villages-lost-fewer-homes", coachWrong: "That detail is true, but it proves a different point. Which detail shows what happened to land that had mangroves in front of it?" },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page. Read along with me, and notice who ends up with the fish." },
      interaction: { type: "read-along", text: "The same tangle of roots that stops a wave also hides a nursery. Young fish, shrimp, and crabs shelter among the stilts, where bigger hunters cannot squeeze in after them. Fishers far out at sea, who may never set foot in a mangrove forest, haul up nets full of fish that spent their first months hiding among those roots.", audio: A("page-7-read-sentence") },
    },
    {
      id: "apply-choose-reject-unsupported",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which inference does the text not support?",
      narration: { audio: A("apply-choose-reject-unsupported"), script: "A careful reader also rejects inferences. Some inferences sound right, and some are even true in the world, but if no detail in the text backs one up, it is not an answer from this text. Four inferences are on your screen. Three of them are backed by details on pages six and seven. One of them may be true somewhere, but nothing in the text supports it. Tap the inference the text does not support." },
      interaction: { type: "choose", options: [{ id: "crocodiles-hunt-in-the-roots", label: "crocodiles hunt in the roots" }, { id: "young-fish-are-safer-inside", label: "young fish are safer inside" }, { id: "people-need-the-forest-too", label: "people need the forest too" }, { id: "big-fish-cannot-get-inside", label: "big fish cannot get inside" }], correctId: "crocodiles-hunt-in-the-roots", coachWrong: "That one has a detail behind it on page six or seven. Find the inference that no sentence on any page backs up." },
    },
    {
      id: "challenge-speak-facts-say-so-i-know",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Does the forest matter to people far from it? Say the text says, so I can tell.",
      narration: { audio: A("challenge-speak-facts-say-so-i-know"), script: "Last one, and you make the whole move out loud. The text never says in one sentence whether a mangrove forest matters to people who live far away from it, but the details on pages six and seven let you know. Tap the mic. Start with the words, the text says, and name a detail. Then say, so I can tell, and state what that detail lets you know." },
      interaction: { type: "speak", text: "fishers fishing fisherman fishermen nets net fish sea ocean boats villages village homes storm storms waves protect protects protected protection safe safer shelter nursery roots feed feeds food important need needs depend depends" },
    },
    {
      id: "celebrate-facts-say-so-i-know",
      purpose: "celebrate",
      gate: "none",
      prompt: "The text says, so I can tell.",
      fx: {"text":"The text says, **so I can tell**","effect":"fireworks"},
      narration: { audio: A("celebrate-facts-say-so-i-know"), script: "Today every answer came with evidence. When the text said it outright, you pointed to the detail, or to the example that proved the point. When the text did not say it, you cited the detail and told what it let you know, and when several details were true, you picked the one that really supported the inference. When no detail backed an inference, you rejected it, even if it might be true somewhere else. That is how fourth grade readers read facts. The text says, so I can tell." },
    },
  ],
};
