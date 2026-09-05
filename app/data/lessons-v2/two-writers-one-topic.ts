import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./two-writers-one-topic-timings.json";

// Two Writers, One Topic (RI.3.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=two-writers-one-topic
// G3-U3. RI.3.9 = compare and contrast the most important points and key
// details presented in two texts on the same topic. Sibling split honored:
// two-books-one-topic (RI.K.9, penguins, blue book / red book, facts in both
// or in just one) and two-texts-compare (RI.1.9, sea otters) own the K-1
// fact compares; same-different-stories (RL.1.9, Leo and Zara's loose teeth)
// and same-hero-new-story (RL.3.9, the Margo Pike series, Same in Both /
// Different sort) own the story side; big-idea-backed-up (RI.3.2, prairie
// dogs) owns naming ONE text's big idea and its key details; the-authors-view
// (RI.3.6, guinea pigs) owns fact vs the author's opinion. THIS lesson owns
// the third-grade step-up: two DIFFERENT writers on one topic, each with a
// MOST IMPORTANT POINT on top and KEY DETAILS underneath, lined up in two
// columns: what both texts say, what only text one says, what only text two
// says, whether the two points agree or differ, and the sharp move of one
// detail that both writers use for DIFFERENT reasons. ONE topic, the American
// bison, in two original informational texts by two unnamed writers, every
// fact true: text one, "Built for Winter" (heaviest land animal in North
// America, a bull heavier than ten grown men, the hump of muscle, a winter
// coat so thick snow piles on it without melting, walking straight into a
// blizzard so the storm passes sooner, plowing snow with its head to reach
// grass, nearly wiped out by hunters with only a few hundred left, the herds
// brought back), most important point = a bison is built to survive the
// hardest winter; text two, "Where the Bison Walks" (a herd trims the grass
// so sunlight reaches the ground and wildflowers spring up, birds ride on its
// back picking off bugs, rolling out a wallow that rain fills into a pool for
// frogs and toads and birds, the snow path it plows that deer follow to
// grass, spring fur that birds gather for nests), most important point = a
// bison helps every living thing around it. Shared details: the thick shaggy
// coat, eating grass, living in herds on the plains, and plowing snow with
// its head (used by writer one to show the bison feeding itself in winter and
// by writer two to show smaller animals reaching the grass). 16 sentences
// over 6 child-read pages (read-along 1/3/4/6 with images on 1/3/4, speak
// 2/5 = two 3-sentence accept-mode reads at about 50 tokens, no " my "
// token, no digits, no contractions), compound + early-complex sentences,
// stretch words hump / blizzard / plow / wallow with in-text support.
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file BEFORE
// writing: bison, hippo, tusk, survivor, cowbird, nostril, most important
// point (2 incidental), two writers, writer one, only text all 0 hits as
// topics; prairie kept out of the child-read text (big-idea-backed-up), the
// words plains / grassland / herd / shaggy appear only as incidental prose
// elsewhere. No character names (informational). Keys prefixed quiz- are
// picture supports for the quiz's all-fresh hippo texts.

const A = (id: string) => `/audio/lessons-v2/two-writers-one-topic/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/two-writers-one-topic/${w.toLowerCase()}.png`;

export const twoWritersOneTopicImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A single huge dark brown American bison with a massive shaggy head, a tall humped back, short curved black horns, and a thick woolly winter coat, standing in deep snow on a wide flat open plain, thick snow piled along its back and shoulders, facing left into a wind that blows streaks of snow sideways across the scene, low gray winter sky, a few bare shrubs poking out of the snow, natural animal face with no smile and no cartoon eyes. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same huge dark brown American bison with the massive shaggy head, tall humped back, short curved black horns, and thick woolly winter coat, swinging its head low and sideways through deep snow on the same wide flat open plain, snow flying up from its face, a patch of brown and yellow grass cleared open in the snow in front of it, two more bison standing farther back in the snow, low gray winter sky, natural animal faces with no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-4": { subject: "The same huge dark brown American bison with the massive shaggy head, tall humped back, and short curved black horns, now in summer with a shorter coat, standing on a wide green grassy plain eating grass with its head lowered, two small black birds perched on its back, a herd of bison grazing farther back, short green grass dotted with small purple and yellow wildflowers, a wide clear blue sky with no sun visible, natural animal faces with no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-hippo-river": "A large gray hippopotamus resting in a wide brown African river, only the top of its head showing above the water with its small round ears, its eyes, and its nostrils above the surface and its wide back just breaking the surface, tall green reeds along the far bank, a flat golden grassland and a few acacia trees beyond, clear pale blue daytime sky with no sun visible, a realistic hippo head with tiny eyes, a wide flat snout, NO smile, NO mouth line, no eyebrows, no cartoon face, no cute expression, wide painterly full-bleed scene with no vignette and no pale border. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-hippo-grass": { subject: "The same large gray hippopotamus standing on a flat golden grassland at night eating grass with its head lowered and mouth closed, a wide trail of trampled grass behind it leading back toward the same brown river and its tall green reeds, a deep blue night sky full of small stars with no moon anywhere, a realistic hippo head with tiny eyes, a wide flat snout, NO smile, NO mouth line, no eyebrows, no cartoon face, no cute expression, wide full-bleed scene with no vignette and no pale border. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-hippo-river" },
  "quiz-hippo-birds": { subject: "The same large gray hippopotamus standing in shallow water at the edge of the same brown river with its wide back and head fully out of the water, three small brown and white birds with orange beaks perched on its back pecking at its skin, tall green reeds and the flat golden grassland behind, clear pale blue daytime sky with no sun visible, realistic hippo head with tiny eyes, a wide flat snout, NO smile, NO mouth line, no eyebrows, no cartoon face, no cute expression, the birds with plain natural bird faces, wide full-bleed scene with no vignette and no pale border. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-hippo-river" }
};

export const twoWritersOneTopic: LessonDef = {
  id: "two-writers-one-topic",
  title: "Two Writers, One Topic",
  grade: "3rd Grade",
  standard: "RI.3.9",
  archetype: "inference",
  objective: "I can compare two texts on the same topic by lining up each writer's most important point and key details, and tell what both texts say, what only one says, and how the two points differ.",
  concepts: [
    "two writers can write about one topic and not say the same thing",
    "each text has a most important point on top and key details underneath",
    "some details are in both texts, some are in only one",
    "the two writers' most important points can agree or differ, and both can be true",
    "the same detail can be used by two writers for two different reasons",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read two texts about one animal by two different writers, and you kept them apart. You found each writer's most important point and the key details under it. You sorted what both texts say from what only one says, you named how the two points differ, and you caught one detail that both writers used for different reasons. That is how a third grade reader compares two texts on the same topic.",
    "title": "Two Writers, Lined Up",
    "body": "You found each writer's point, sorted the details into both and only one, and told how the two points differ."
  },
  scenes: [
    {
      id: "hook-text-one-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Built for Winter, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-text-one-page-one"), script: "Hello, reader. Today you read two texts by two different writers, and both texts are about the same animal, the American bison. Two writers can write about one topic and not say the same thing, because each writer has a most important point and picks the key details that hold it up. Your job is to line the two texts up. Here is page one of the first text, called Built for Winter. Read along with me, and start asking what this writer wants you to remember most." },
      interaction: { type: "read-along", text: "The American bison is the heaviest land animal in North America, and a big male, called a bull, weighs more than ten grown men. Most of that weight rides up front, in a huge head and a tall hump of muscle over its shoulders. In winter the bison grows a coat so thick and shaggy that snow piles up on its back without melting.", audio: A("hook-text-one-page-one-sentence") },
    },
    {
      id: "page-two-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: When a blizzard, a storm of wind and blowing snow, sweeps across the plains, most animals turn their backs to it. A bison walks straight into the wind instead. The storm passes over it sooner that way, and the thick fur on its face takes the worst of the cold.",
      narration: { audio: A("page-two-read"), script: "Page two is yours. Read all three sentences out loud, and notice what a bison does in a storm that other animals do not." },
      interaction: { type: "speak", text: "When a blizzard a storm of wind and blowing snow sweeps across the plains most animals turn their backs to it A bison walks straight into the wind instead The storm passes over it sooner that way and the thick fur on its face takes the worst of the cold" },
    },
    {
      id: "page-three-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Built for Winter, page three. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-three-read"), script: "Page three, the last page of text one. Read along with me, and hold on to the detail about deep snow, because it comes back later." },
      interaction: { type: "read-along", text: "When deep snow buries the grass, a bison swings its heavy head from side to side like a plow and clears a patch down to the food. Long ago, hunters nearly wiped the bison off the plains, and only a few hundred were left, but those survivors were tough enough to bring the herds back, and today many thousands roam the plains again.", audio: A("page-three-read-sentence") },
    },
    {
      id: "model-point-and-details",
      purpose: "model",
      gate: "none",
      prompt: "The most important point on top. The key details underneath.",
      fx: {"text":"**Most important point** on top. **Key details** underneath.","effect":"underline"},
      narration: { audio: A("model-point-and-details"), script: "Here is how I read text one. First I ask what the writer wants me to remember most, the most important point. Every page of Built for Winter comes back to one idea. A bison is built to survive the hardest winter. That point goes on top. Under it I put the key details that hold it up. A coat so thick that snow piles on it without melting. Walking straight into a blizzard. Plowing snow with its head to reach the grass. Those are key details, because if you take one away, the point gets weaker. Now text two is coming, and it is by a different writer. We will find that writer's point and key details the same way, and then we will line the two texts up. What both texts say. What only one text says. And whether the two points agree or differ. Watch for one detail that shows up in both texts." },
    },
    {
      id: "text-two-page-four",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Text two: Where the Bison Walks, page four. Read along!",
      image: IMG("page-4"),
      narration: { audio: A("text-two-page-four"), script: "Now the second text, by a different writer, and it is called Where the Bison Walks. Read along with me, and notice which details this writer chooses, because they are not the details the first writer chose." },
      interaction: { type: "read-along", text: "A bison spends most of its day eating grass, and a whole herd can trim a hillside as neatly as a lawn mower. Short grass lets sunlight reach the ground, so wildflowers and new plants spring up wherever the herd has been. Birds follow the herd too, and some ride right on the back of a bison, picking off the bugs that live in its shaggy coat.", audio: A("text-two-page-four-sentence") },
    },
    {
      id: "page-five-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: On a hot day, a bison drops to the ground and rolls in the dirt until it has worn a wide, shallow bowl called a wallow. Rolling scrapes off loose fur and biting flies. Later, rain fills the empty wallow, and frogs, toads, and thirsty birds crowd into the new pool.",
      narration: { audio: A("page-five-read"), script: "Page five is yours. Read all three sentences out loud, and find out what a wallow is." },
      interaction: { type: "speak", text: "On a hot day a bison drops to the ground and rolls in the dirt until it has worn a wide shallow bowl called a wallow Rolling scrapes off loose fur and biting flies Later rain fills the empty wallow and frogs toads and thirsty birds crowd into the new pool" },
    },
    {
      id: "page-six-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Where the Bison Walks, page six. Read along!",
      narration: { audio: A("page-six-read"), script: "Page six, the last page of text two. Read along with me, and listen for a detail you already met in text one." },
      interaction: { type: "read-along", text: "In winter, when a bison swings its head to plow through deep snow, it leaves a cleared path behind it, and smaller animals such as deer follow that path to grass they could never reach alone. Even the winter coat helps, because in spring it falls out in big soft clumps, and birds gather the fur to line their nests.", audio: A("page-six-read-sentence") },
    },
    {
      id: "guided-choose-text-two-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is writer two's most important point?",
      narration: { audio: A("guided-choose-text-two-point"), script: "Your turn to find a most important point. Ask what every page of text two keeps coming back to. The grass and the wildflowers, the birds on its back, the wallow that fills with rain, the path through the snow, the fur in the nests. Four sentences are on your screen, and every one of them is true, but only one of them is the point the whole text holds up. Tap it." },
      interaction: { type: "choose", options: [{ id: "a-bison-helps-its-neighbors", label: "a bison helps its neighbors" }, { id: "a-bison-is-built-for-winter", label: "a bison is built for winter" }, { id: "a-bison-rolls-in-the-dirt", label: "a bison rolls in the dirt" }, { id: "birds-ride-on-a-bison", label: "birds ride on a bison" }], correctId: "a-bison-helps-its-neighbors", coachWrong: "That sentence is true, but it is either one small detail or it belongs to the other writer. Ask which sentence every page of text two holds up." },
    },
    {
      id: "guided-choose-who-said-it",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which writer says that birds ride on the back of a bison?",
      narration: { audio: A("guided-choose-who-said-it"), script: "Now the lining up begins. Some details are in both texts, and some are in only one. Think about where you read that birds ride on the back of a bison and pick the bugs out of its coat. Four answers are on your screen. Tap the one that says which writer told you." },
      interaction: { type: "choose", options: [{ id: "only-writer-two", label: "only writer two" }, { id: "only-writer-one", label: "only writer one" }, { id: "both-writers", label: "both writers" }, { id: "neither-writer", label: "neither writer" }], correctId: "only-writer-two", coachWrong: "Walk back through the pages in your head. Did the winter writer ever mention birds? Did the second writer?" },
    },
    {
      id: "guided-choose-in-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail is in both texts?",
      narration: { audio: A("guided-choose-in-both"), script: "Here is the other side of the same move. Some details show up in both texts, because both writers needed them. Four details are on your screen, and each one is really in at least one of the texts. Only one of them is in both. Tap it." },
      interaction: { type: "choose", options: [{ id: "a-thick-shaggy-coat", label: "a thick shaggy coat" }, { id: "it-walks-into-the-wind", label: "it walks into the wind" }, { id: "rain-fills-its-wallow", label: "rain fills its wallow" }, { id: "the-herds-nearly-died-out", label: "the herds nearly died out" }], correctId: "a-thick-shaggy-coat", coachWrong: "That detail is real, but only one writer used it. Find the one that both writers describe." },
    },
    {
      id: "apply-sort-only-both",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each detail: Only Text One, Only Text Two, or In Both?",
      narration: { audio: A("apply-sort-only-both"), script: "Six details from the two texts are on your screen. Read each one, and remember which writer told you. If only the winter writer said it, drag it to Only Text One. If only the second writer said it, drag it to Only Text Two. If both writers said it, drag it to In Both." },
      interaction: { type: "sort", buckets: ["Only Text One","Only Text Two","In Both"], items: [{ label: "heavier than ten grown men", bucket: "Only Text One" }, { label: "its wallow becomes a pool", bucket: "Only Text Two" }, { label: "a bison eats grass", bucket: "In Both" }, { label: "it walks into a blizzard", bucket: "Only Text One" }, { label: "its fur lines bird nests", bucket: "Only Text Two" }, { label: "it plows snow with its head", bucket: "In Both" }], coachWrong: "Ask two questions about that detail. Did the winter writer say it? Did the second writer say it? Two yeses means In Both." },
    },
    {
      id: "guided-choose-points-differ",
      purpose: "guided",
      gate: "interaction",
      prompt: "How do the two writers' most important points differ?",
      narration: { audio: A("guided-choose-points-differ"), script: "Now the top row of the compare, the two points side by side. Writer one's point is that a bison is built to survive the hardest winter. Writer two's point is the one you found a moment ago. Both points are true, and both writers admire the same animal, but the points are not the same. Four answers are on your screen. Tap the one that tells how the two points differ." },
      interaction: { type: "choose", options: [{ id: "one-survives-one-helps", label: "one survives, one helps" }, { id: "the-two-points-agree", label: "the two points agree" }, { id: "one-is-true-one-is-false", label: "one is true, one is false" }, { id: "one-is-about-the-birds", label: "one is about the birds" }], correctId: "one-survives-one-helps", coachWrong: "Both points are true, and neither one is about a single small detail. Ask what each writer says the bison does, for itself or for others." },
    },
    {
      id: "apply-choose-same-detail-new-reason",
      purpose: "apply",
      gate: "interaction",
      prompt: "Both writers say a bison plows snow with its head. What does writer two use that detail to show?",
      narration: { audio: A("apply-choose-same-detail-new-reason"), script: "Here is the sharpest move in this lesson. Both writers tell you that a bison swings its heavy head to plow through deep snow. Writer one uses that detail to show a bison feeding itself in the worst of winter. Writer two uses the very same detail for a different reason. Think about what happens on that cleared path after the bison moves on. Four reasons are on your screen. Tap what writer two uses the detail to show." },
      interaction: { type: "choose", options: [{ id: "smaller-animals-reach-grass", label: "smaller animals reach grass" }, { id: "the-bison-stays-warm", label: "the bison stays warm" }, { id: "the-bison-is-very-heavy", label: "the bison is very heavy" }, { id: "the-herds-came-back", label: "the herds came back" }], correctId: "smaller-animals-reach-grass", coachWrong: "That reason belongs to the winter writer, or to nobody. Think about page six, and ask who walks along the path after the bison has plowed it." },
    },
    {
      id: "challenge-speak-both-and-only",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one thing both writers say about the bison, and one thing only one writer says.",
      narration: { audio: A("challenge-speak-both-and-only"), script: "Last one, and this time you say it. Tap the mic and tell me two things. First, one detail that both writers say about the bison. Then, one detail that only one of the writers says. Say them in your own words." },
      interaction: { type: "speak", text: "coat fur shaggy thick grass eats herd herds plow plows plowing snow head heavy heaviest hump blizzard wind wallow pool birds nest nests flowers wildflowers survivor helper deer frogs winter path" },
    },
    {
      id: "celebrate-two-writers",
      purpose: "celebrate",
      gate: "none",
      prompt: "Two writers, one topic, lined up.",
      fx: {"text":"**In both.** **Only one.** **Two points.**","effect":"fireworks"},
      narration: { audio: A("celebrate-two-writers"), script: "You read two texts about one animal by two different writers, and you did not let them blur together. You found each writer's most important point and the key details under it. You sorted what both texts say from what only one says, you named how the two points differ, and you caught one detail that both writers used for different reasons. That is how a third grade reader compares two texts, and you did it on your own." },
    },
  ],
};
