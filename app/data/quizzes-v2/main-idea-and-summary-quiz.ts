import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Main Idea and Summary QUIZ (RI.4.2) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second text,
// "The Biggest Storm on Earth" (hurricanes, every fact true: the largest storm
// on Earth, a spinning wheel of clouds wide enough to cover a coastline, winds
// that tear roofs off and push the sea onto the land; warm tropical sea water
// rises as vapor, cools into towering clouds, the turning of the Earth sets
// them spinning, more warm water = a stronger storm, no hurricane forms over
// cold water; the calm eye with the strongest winds in the eye wall around it,
// people who walked out in the eye and were struck by the far wall; weakening
// within hours over land or cold water because the warm water supply is gone;
// names from a list written years ahead, called a typhoon in the western
// Pacific, a storm that spins toward cold northern water falls apart), spoken
// paragraph by paragraph INSIDE the questions under four spoken headings (The
// Biggest Storm on Earth / Fuel from the Sea / The Eye / Running Out of
// Fuel), so every Q is self-contained; two sentences are the child's
// on-screen read-alouds and are NEVER narrated anywhere in the quiz (the last
// sentence of The Eye in e-4, the last sentence of the iceberg text in h-3).
// Main idea = warm ocean water powers a hurricane; key details = grows over
// warm water, weakens over land, falls apart over cold seas; small facts =
// named from a list, called a typhoon, the eye is calm. Bands: easier
// (G3-bridge RI.3.2 at 3 options: the idea of ONE paragraph twice with the
// picture as support, the topic as a word, a one-sentence read-aloud) / core
// (on-grade G4: main idea of the whole text among topic / paragraph idea /
// interesting fact, BEST detail among four true ones, how-it-supports because
// tiles, a six-item Key Detail / Small Fact sort with b-* bucket clips, the
// three summary sentences in order, a production summary speak with a full
// accept list) / harder (G5 transfer, RI.5.2 TWO MAIN IDEAS in one text:
// taught in h-1 on part one of a fresh two-part iceberg text (Born from a
// Glacier / The Hidden Danger; every fact true: a glacier is a river of ice,
// pieces crack off the front and float away, packed snow so an iceberg is
// fresh water, only the tip shows and most of the bulk hides under water,
// drifting with currents into shipping lanes, planes and satellites track the
// largest and ships steer wide) then applied to part two; the detail that
// serves part one and not part two; the last sentence read aloud; a closing
// production speak stating both main ideas). Nothing from the lesson text
// (the peregrine falcon) is reused. Freshness grep-swept vs lessons-v2 +
// quizzes-v2: hurricane, typhoon, eye wall, storm surge, iceberg, calving,
// shipping lane, satellite all 0 hits (glacier = one G2 word-meaning example
// only). Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/main-idea-and-summary-quiz";
const IMG = (w: string) => `/images/lessons-v2/main-idea-and-summary/${w.toLowerCase()}.png`;

export const mainIdeaAndSummaryQuiz: QuizDef = {
  id: "main-idea-and-summary-quiz",
  lessonId: "main-idea-and-summary",
  title: "Main Idea and Summary Quiz",
  standard: "RI.4.2",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-eye-paragraph-idea",
      band: "easier",
      difficulty: 1,
      prompt: "What is this paragraph mostly about?",
      image: IMG("quiz-hurricane-eye"),
      narration: { audio: `${Q}/e-1-eye-paragraph-idea.mp3`, script: "Here is part of a true text about hurricanes. This part has the heading The Eye, and the picture shows it from high above. Listen for what this one paragraph is mostly about, then tap it. At the very center of the storm is the eye, a calm hole where the sky is often clear and the wind almost dies. Around the eye stands the eye wall, the ring where the strongest winds of the whole storm spin." },
      hint: { audio: `${Q}/e-1-eye-paragraph-idea-hint.mp3`, script: "A paragraph idea covers the whole paragraph. Both sentences talk about the same place in the storm, and the picture shows that place." },
      explain: { audio: `${Q}/e-1-eye-paragraph-idea-explain.mp3`, script: "This paragraph is mostly about the calm eye at the center. Both sentences describe the eye and the wall around it, and nothing in it is about names or cold water." },
      interaction: { type: "choose", options: [{ id: "the-calm-eye-at-the-center", label: "the calm eye at the center" }, { id: "how-storms-get-their-names", label: "how storms get their names" }, { id: "cold-northern-water", label: "cold northern water" }], correctId: "the-calm-eye-at-the-center", coachWrong: "Was that in the paragraph you just heard? Find the idea both sentences share." },
    },
    {
      id: "e-2-fuel-paragraph-idea",
      band: "easier",
      difficulty: 2,
      prompt: "What is this paragraph mostly about?",
      image: IMG("quiz-warm-sea"),
      narration: { audio: `${Q}/e-2-fuel-paragraph-idea.mp3`, script: "Here is the paragraph under the heading Fuel from the Sea, and the picture shows what it describes. Listen for what this paragraph is mostly about, then tap it. Over a warm tropical sea, water rises into the air as vapor, and as the vapor climbs and cools it turns into towering clouds. The turning of the Earth sets those clouds spinning around a center, and the more warm water they pass over, the stronger the storm grows." },
      hint: { audio: `${Q}/e-2-fuel-paragraph-idea-hint.mp3`, script: "The whole paragraph keeps coming back to one thing, and the picture shows it rising off the sea." },
      explain: { audio: `${Q}/e-2-fuel-paragraph-idea-explain.mp3`, script: "The paragraph is mostly about how warm water builds the storm. The vapor rises from warm water, and more warm water makes the storm stronger." },
      interaction: { type: "choose", options: [{ id: "warm-water-builds-the-storm", label: "warm water builds the storm" }, { id: "the-eye-is-calm-and-clear", label: "the eye is calm and clear" }, { id: "the-wind-tears-off-roofs", label: "the wind tears off roofs" }], correctId: "warm-water-builds-the-storm", coachWrong: "That belongs to a different paragraph. What does this paragraph keep coming back to?" },
    },
    {
      id: "e-3-topic-hurricanes",
      band: "easier",
      difficulty: 3,
      prompt: "What is the topic of the text?",
      narration: { audio: `${Q}/e-3-topic-hurricanes.mp3`, script: "A topic is a word or two that says what a whole text is about. Three words from page one are on your screen, and only one is the topic. Tap the topic after you hear page one. A hurricane is the largest storm on Earth, a spinning wheel of clouds so wide that it can cover a whole coastline at once. Its winds can tear the roof from a house and push the sea up onto the land. Yet all of that power comes from one quiet source, warm ocean water." },
      hint: { audio: `${Q}/e-3-topic-hurricanes-hint.mp3`, script: "The topic is the thing every sentence keeps coming back to, not a thing that is only mentioned once." },
      explain: { audio: `${Q}/e-3-topic-hurricanes-explain.mp3`, script: "The topic is hurricanes. Clouds and the sea are in the page, but every sentence is about the hurricane itself." },
      interaction: { type: "choose", options: [{ id: "hurricanes", label: "hurricanes" }, { id: "clouds", label: "clouds" }, { id: "the-sea", label: "the sea" }], correctId: "hurricanes", coachWrong: "That word is in the page, but is every sentence about it? Find the thing the whole page keeps coming back to." },
    },
    {
      id: "e-4-speak-read-eye-walk",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: People caught in the eye have sometimes walked outside, thinking the storm was over, only to be struck by the far side of the wall.",
      narration: { audio: `${Q}/e-4-speak-read-eye-walk.mp3`, script: "The sentence on your screen ends the paragraph about the eye, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at each comma, and let the ending land." },
      hint: { audio: `${Q}/e-4-speak-read-eye-walk-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word People." },
      explain: { audio: `${Q}/e-4-speak-read-eye-walk-explain.mp3`, script: "The sentence tells you that people in the eye have thought the storm was over, and then the far side of the wall struck them." },
      interaction: { type: "speak", text: "People caught in the eye have sometimes walked outside thinking the storm was over only to be struck by the far side of the wall" },
    },
    {
      id: "c-1-main-idea-whole-text",
      band: "core",
      difficulty: 1,
      prompt: "Which line is the main idea of the whole text?",
      narration: { audio: `${Q}/c-1-main-idea-whole-text.mp3`, script: "Now the whole text. Four lines are on your screen. One is the topic. One is the smaller idea of a single paragraph. One is an interesting fact the text could lose without changing what it adds up to. One is the main idea, the sentence every paragraph holds up. Tap the main idea after you hear the text. A hurricane is the largest storm on Earth, a spinning wheel of clouds so wide that it can cover a whole coastline at once. Over a warm tropical sea, water rises into the air as vapor and turns into towering clouds, and the more warm water those clouds pass over, the stronger the storm grows. At the very center is the eye, a calm hole where the wind almost dies. When a hurricane crosses onto land or drifts over cold water, it begins to weaken within hours, because it has lost its supply of warm water. Every hurricane is given a name from a list written years ahead." },
      hint: { audio: `${Q}/c-1-main-idea-whole-text-hint.mp3`, script: "A topic is a word, a paragraph idea covers one paragraph, and a fact the text could drop is not the main idea. Which line does every paragraph hold up?" },
      explain: { audio: `${Q}/c-1-main-idea-whole-text-explain.mp3`, script: "The main idea is that warm water powers the storm. The storm grows over warm water and weakens when it loses warm water, so every paragraph holds that up." },
      interaction: { type: "choose", options: [{ id: "warm-water-powers-the-storm", label: "warm water powers the storm" }, { id: "hurricanes", label: "hurricanes" }, { id: "the-eye-is-a-calm-center", label: "the eye is a calm center" }, { id: "storms-are-named-from-a-list", label: "storms are named from a list" }], correctId: "warm-water-powers-the-storm", coachWrong: "Test it against every paragraph. A topic is a word or two, a paragraph idea covers one paragraph, and a fact the text could drop is not the main idea." },
    },
    {
      id: "c-2-best-detail-warm-water",
      band: "core",
      difficulty: 2,
      prompt: "Which detail best supports the main idea?",
      narration: { audio: `${Q}/c-2-best-detail-warm-water.mp3`, script: "The main idea is that warm ocean water powers a hurricane. Four details from the text are on your screen, and every one of them is true. Three are interesting, but the main idea would stand without them. One is a key detail, and it supports the main idea best. Tap it after you hear the two paragraphs it could come from. At the very center of the storm is the eye, a calm hole where the sky is often clear and the wind almost dies. When a hurricane crosses onto land or drifts over cold water, it begins to weaken within hours, because it has lost its supply of warm water. Every hurricane is given a name from a list written years ahead, and the same kind of storm is called a typhoon in the western Pacific." },
      hint: { audio: `${Q}/c-2-best-detail-warm-water-hint.mp3`, script: "One of the details is about the water under the storm. The others are true, but the main idea stands without them." },
      explain: { audio: `${Q}/c-2-best-detail-warm-water-explain.mp3`, script: "The best detail is, it weakens over cold water. Losing warm water makes the storm weaken, and that shows warm water is what powers it." },
      interaction: { type: "choose", options: [{ id: "it-weakens-over-cold-water", label: "it weakens over cold water" }, { id: "its-eye-is-calm-and-clear", label: "its eye is calm and clear" }, { id: "it-is-called-a-typhoon-too", label: "it is called a typhoon too" }, { id: "it-is-named-from-a-list", label: "it is named from a list" }], correctId: "it-weakens-over-cold-water", coachWrong: "That one is true, but the main idea would stand without it. Which detail is about the water the storm runs on?" },
    },
    {
      id: "c-3-land-detail-because",
      band: "core",
      difficulty: 3,
      prompt: "The land detail supports the main idea because...",
      narration: { audio: `${Q}/c-3-land-detail-because.mp3`, script: "Now the support gets explained in words. Here is a detail. The text says a hurricane begins to weaken within hours after it crosses onto land. That supports the main idea, warm water powers the storm, because, and you finish the sentence. Four endings are on your screen, and only one tells how the land detail supports the main idea. Tap it." },
      hint: { audio: `${Q}/c-3-land-detail-because-hint.mp3`, script: "The reason has to connect the land to the fuel the storm runs on." },
      explain: { audio: `${Q}/c-3-land-detail-because-explain.mp3`, script: "The ending is, land cuts off its warm water. Over land the storm has no warm sea under it, so it loses the fuel that powers it." },
      interaction: { type: "choose", options: [{ id: "land-cuts-off-its-warm-water", label: "land cuts off its warm water" }, { id: "land-is-harder-than-water", label: "land is harder than water" }, { id: "the-eye-closes-over-land", label: "the eye closes over land" }, { id: "its-name-runs-out-over-land", label: "its name runs out over land" }], correctId: "land-cuts-off-its-warm-water", coachWrong: "That ending does not connect the land to what powers the storm. What does the storm lose when it leaves the sea?" },
    },
    {
      id: "c-4-sort-key-or-small",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Key Detail, or Small Fact?",
      narration: { audio: `${Q}/c-4-sort-key-or-small.mp3`, script: "Six facts from the text are on your screen, and every one of them is true. If the main idea, warm water powers the storm, would lose support without a fact, drag it to Key Detail. If the main idea stands just the same without it, drag it to Small Fact. Here are the facts as the text gives them. Over a warm sea the vapor rises, and the more warm water the clouds pass over, the stronger the storm grows. The eye is a calm hole where the wind almost dies. Over land the storm weakens within hours, because it has lost its warm water. Every hurricane is given a name from a list, and the same kind of storm is called a typhoon in the western Pacific. A storm that spins toward cold northern water falls apart." },
      hint: { audio: `${Q}/c-4-sort-key-or-small-hint.mp3`, script: "Taking a fact out and asking whether warm water still has its support is the test. If nothing changes, the fact is small." },
      explain: { audio: `${Q}/c-4-sort-key-or-small-explain.mp3`, script: "Growing over warm water, weakening over land, and falling apart over cold seas all support the main idea. The name, the word typhoon, and the calm eye are interesting, but the main idea stands without them." },
      interaction: { type: "sort", buckets: ["Key Detail","Small Fact"], bucketAudio: { "Key Detail": `${Q}/b-key-detail.mp3`, "Small Fact": `${Q}/b-small-fact.mp3` }, items: [{ label: "it grows over warm water", bucket: "Key Detail" }, { label: "it is named from a list", bucket: "Small Fact" }, { label: "it weakens over land", bucket: "Key Detail" }, { label: "it is also called a typhoon", bucket: "Small Fact" }, { label: "it breaks up over cold seas", bucket: "Key Detail" }, { label: "the eye is calm", bucket: "Small Fact" }], coachWrong: "Take that fact out and ask whether warm water still gets its support. If it does, the fact is small." },
    },
    {
      id: "c-5-sequence-summary",
      band: "core",
      difficulty: 5,
      prompt: "Put the three summary sentences in order.",
      narration: { audio: `${Q}/c-5-sequence-summary.mp3`, script: "A summary of a fact text is three sentences, the main idea first, then the key details in the order the text gave them, with no small facts and no opinion. Three sentences are on your screen, out of order. Drag them into summary order after you hear the text in its own order. Over a warm tropical sea, water rises into the air as vapor and turns into towering clouds, and the more warm water those clouds pass over, the stronger the storm grows. When a hurricane crosses onto land, it begins to weaken within hours, because it has lost its supply of warm water." },
      hint: { audio: `${Q}/c-5-sequence-summary-hint.mp3`, script: "The main idea goes first. After that, the text itself tells you which detail came first." },
      explain: { audio: `${Q}/c-5-sequence-summary-explain.mp3`, script: "Summary order is the main idea, warm water powers the storm, then the storm grows over a warm sea, then it weakens over land, because that is the order the text gave them." },
      interaction: { type: "sequence", items: [{ id: "main", label: "warm water powers the storm" }, { id: "detail-one", label: "it grows over a warm sea" }, { id: "detail-two", label: "it weakens over land" }], order: ["main","detail-one","detail-two"], coachWrong: "Main idea first. Then the details in the order the text gave them, not the order you like best." },
    },
    {
      id: "c-6-speak-summary",
      band: "core",
      difficulty: 6,
      prompt: "Say the summary: the main idea, then two key details in order.",
      narration: { audio: `${Q}/c-6-speak-summary.mp3`, script: "Now the whole summary is yours. Tap the mic. Say the main idea of the hurricane text in one sentence. Then say two key details in the order the text gave them, and leave out the small facts and your opinion. Here is the text once more. Over a warm tropical sea, water rises as vapor and turns into towering clouds, and the more warm water those clouds pass over, the stronger the storm grows. At the center is the eye, a calm hole where the wind almost dies. When a hurricane crosses onto land or drifts over cold water, it begins to weaken within hours, because it has lost its supply of warm water. Every hurricane is given a name from a list written years ahead." },
      hint: { audio: `${Q}/c-6-speak-summary-hint.mp3`, script: "The first sentence is the one thing every paragraph comes back to. Then come two details about where the storm grows and where it weakens." },
      explain: { audio: `${Q}/c-6-speak-summary-explain.mp3`, script: "One way to say it goes like this. Warm ocean water powers a hurricane. The storm grows stronger the more warm water it passes over. When it crosses onto land, it loses its warm water and weakens within hours." },
      interaction: { type: "speak", text: "warm water ocean sea powers power fuel fuels feeds grows grow stronger strong weakens weaken weaker land cold vapor clouds spins spinning storm hurricane hours falls apart" },
    },
    {
      id: "h-1-two-main-ideas-taught",
      band: "harder",
      difficulty: 1,
      prompt: "What is the main idea of part two?",
      narration: { audio: `${Q}/h-1-two-main-ideas-taught.mp3`, script: "Here is a fifth grade move. A longer text can carry two main ideas, one for each part, and each part has its own key details. Here is part one of a text about icebergs, called Born from a Glacier. An iceberg begins as part of a glacier, a river of ice that creeps slowly toward the sea. When the front of the glacier reaches the water, huge pieces crack off and float away. The main idea of part one is that an iceberg is a piece of a glacier that broke off into the sea, and the pieces cracking off the front are the key detail that supports it. Now you. Four lines are on your screen, and only one is the main idea of part two, called The Hidden Danger. Tap it after you hear part two. Only the tip of an iceberg shows above the waves, and most of its bulk hides under the water where the crew of a ship cannot see it. Icebergs drift with the currents, so one can appear in a shipping lane far from where it was born." },
      hint: { audio: `${Q}/h-1-two-main-ideas-taught-hint.mp3`, script: "The main idea of a part covers every sentence in that part. Two of the lines are single details, and one belongs to part one." },
      explain: { audio: `${Q}/h-1-two-main-ideas-taught-explain.mp3`, script: "The main idea of part two is that icebergs are a hidden danger. The hidden bulk and the drifting are details that support it, and breaking off a glacier is the main idea of part one." },
      interaction: { type: "choose", options: [{ id: "icebergs-are-a-hidden-danger", label: "icebergs are a hidden danger" }, { id: "most-of-it-hides-under-water", label: "most of it hides under water" }, { id: "it-drifts-with-the-currents", label: "it drifts with the currents" }, { id: "it-broke-off-a-glacier", label: "it broke off a glacier" }], correctId: "icebergs-are-a-hidden-danger", coachWrong: "That line is a single detail, or it belongs to part one. Which line do both sentences of part two hold up?" },
    },
    {
      id: "h-2-detail-for-part-one",
      band: "harder",
      difficulty: 2,
      prompt: "Which detail supports the main idea of part one?",
      narration: { audio: `${Q}/h-2-detail-for-part-one.mp3`, script: "Each of the two main ideas has its own key details. The main idea of part one is that an iceberg is a piece of a glacier that broke off into the sea. Four details from the whole text are on your screen, and all of them are true. Only one supports the main idea of part one, and the others support part two. Tap the detail for part one after you hear both parts. An iceberg begins as part of a glacier, a river of ice that creeps slowly toward the sea. When the front of the glacier reaches the water, huge pieces crack off and float away. Only the tip of an iceberg shows above the waves, and most of its bulk hides under the water where the crew of a ship cannot see it. Icebergs drift with the currents, so one can appear in a shipping lane far from where it was born." },
      hint: { audio: `${Q}/h-2-detail-for-part-one-hint.mp3`, script: "Part one is about where an iceberg comes from. Which detail is about the glacier?" },
      explain: { audio: `${Q}/h-2-detail-for-part-one-explain.mp3`, script: "The detail is, pieces crack off the glacier. That tells where an iceberg comes from. The tip, the drifting, and the hidden bulk all support the hidden danger in part two." },
      interaction: { type: "choose", options: [{ id: "pieces-crack-off-the-glacier", label: "pieces crack off the glacier" }, { id: "the-tip-shows-above-water", label: "the tip shows above water" }, { id: "it-drifts-to-shipping-lanes", label: "it drifts to shipping lanes" }, { id: "the-crew-cannot-see-the-bulk", label: "the crew cannot see the bulk" }], correctId: "pieces-crack-off-the-glacier", coachWrong: "That detail supports the hidden danger in part two. Which detail is about where an iceberg comes from?" },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Today planes and satellites track the largest icebergs, and ships steer wide around them.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the iceberg text is on your screen. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at the comma, and let the ending land." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word Today." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that planes and satellites track the biggest icebergs, and that ships steer wide around them." },
      interaction: { type: "speak", text: "Today planes and satellites track the largest icebergs and ships steer wide around them" },
    },
    {
      id: "h-4-speak-two-main-ideas",
      band: "harder",
      difficulty: 4,
      prompt: "Say both main ideas of the iceberg text, part one and then part two.",
      narration: { audio: `${Q}/h-4-speak-two-main-ideas.mp3`, script: "Last one, out loud, and this time the text has two main ideas. Tap the mic. Say the main idea of part one in one sentence. Then say the main idea of part two in one sentence, and give one key detail for it. Here is the text once more. An iceberg begins as part of a glacier, a river of ice that creeps slowly toward the sea. When the front of the glacier reaches the water, huge pieces crack off and float away. Only the tip of an iceberg shows above the waves, and most of its bulk hides under the water where the crew of a ship cannot see it. Icebergs drift with the currents, so one can appear in a shipping lane far from where it was born." },
      hint: { audio: `${Q}/h-4-speak-two-main-ideas-hint.mp3`, script: "Part one is about where an iceberg comes from. Part two is about what it can do to a ship." },
      explain: { audio: `${Q}/h-4-speak-two-main-ideas-explain.mp3`, script: "One way to say it goes like this. An iceberg is a piece of a glacier that broke off into the sea. Icebergs are a hidden danger to ships, because most of the ice hides under the water where a crew cannot see it." },
      interaction: { type: "speak", text: "glacier piece pieces broke breaks broken cracked crack off ice sea fresh water hidden hides hide danger dangerous ships ship crew tip waves under underwater below bulk drift drifts currents shipping lane" },
    },
  ],
};
