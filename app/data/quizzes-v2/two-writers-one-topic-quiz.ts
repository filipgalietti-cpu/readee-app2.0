import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Two Writers, One Topic QUIZ (RI.3.9) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge.
// Bands: easier(G2-bridge same-or-different / both-or-only at 3 options with
// picture support) / core(on-grade G3: each writer's most important point,
// the Only Text One / Only Text Two / In Both sort, how the two points
// differ, one detail both writers use for different reasons, production
// speak) / harder(G4 transfer RI.4.9, TAUGHT in the stimulus first: a
// question that neither text answers alone is answered by putting one fact
// from each text together, modeled on why a hippo comes back before sunrise,
// then applied to why it needs a river beside a grassland, then spotting
// which question needs both texts, closing with a production speak).
// ALL-FRESH second topic, the hippopotamus, in two short texts by two
// unnamed writers, every fact true: text one, "Made for the River" (one of
// the heaviest land animals, spends the day in African rivers where the
// water holds up its weight, eyes / ears / nostrils on top of the head,
// nostrils pinch shut and it holds its breath about five minutes, cannot
// really swim so it walks and bounces along the bottom, sleeps underwater
// and floats up to breathe without waking, needs the water by day because
// its skin dries and cracks in the sun, a red oily liquid that works like
// sunscreen), most important point = a hippo is made for the river; text
// two, "Hippo Nights" (waits in the river all day and climbs out at dusk to
// eat grass, walks for miles and eats a heap of grass heavier than a big
// dog, its droppings feed the tiny creatures fish eat, its heavy feet press
// the same night trails into deep paths that the rising river turns into
// channels for small fish and frogs, birds eat the bugs on its back), most
// important point = a hippo helps the whole river. Shared details: very
// heavy (writer one: the water holds it up; writer two: its feet press deep
// paths) and in the river all day. Spoken page by page INSIDE the questions
// so every Q is self-contained; nothing from the lesson text (bison) is
// reused. Topic grep-swept vs lessons-v2 + quizzes-v2: hippo, nostril,
// sunscreen-as-animal-fact 0 hits. Quiz support images live in the lesson's
// image dir (quiz- keys). Bucket clips b-only-text-one / b-only-text-two /
// b-in-both are pre-synthesized from punctuated labels before quiz-tts so
// self-heal never fills them.

const Q = "/audio/quizzes-v2/two-writers-one-topic-quiz";
const IMG = (w: string) => `/images/lessons-v2/two-writers-one-topic/${w.toLowerCase()}.png`;

export const twoWritersOneTopicQuiz: QuizDef = {
  id: "two-writers-one-topic-quiz",
  lessonId: "two-writers-one-topic",
  title: "Two Writers, One Topic Quiz",
  standard: "RI.3.9",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-both-say-river",
      band: "easier",
      difficulty: 1,
      prompt: "Do both writers say a hippo stays in the river by day?",
      image: IMG("quiz-hippo-river"),
      narration: { audio: `${Q}/e-1-both-say-river.mp3`, script: "Here are two new texts by two different writers, and both are about the hippo. Writer one says that a hippo spends the whole day in the rivers and lakes of Africa. Writer two says that all day a hippo waits in the river. Three answers are on your screen. Tap the one that tells whether both writers say a hippo stays in the river by day." },
      hint: { audio: `${Q}/e-1-both-say-river-hint.mp3`, script: "Listen to each writer one at a time. Writer one talked about the whole day in the river. Now ask whether writer two said the same thing." },
      explain: { audio: `${Q}/e-1-both-say-river-explain.mp3`, script: "The answer is that both writers say it. Writer one said the hippo spends the whole day in the river, and writer two said it waits in the river all day. That detail is in both texts." },
      interaction: { type: "choose", options: [{ id: "yes-both-say-it", label: "yes, both say it" }, { id: "only-writer-one", label: "only writer one" }, { id: "only-writer-two", label: "only writer two" }], correctId: "yes-both-say-it", coachWrong: "One writer did say it, but check the other writer too. Did that writer also put the hippo in the river all day?" },
    },
    {
      id: "e-2-who-says-grass",
      band: "easier",
      difficulty: 2,
      prompt: "Which writer tells you the hippo eats grass at night?",
      image: IMG("quiz-hippo-grass"),
      narration: { audio: `${Q}/e-2-who-says-grass.mp3`, script: "Listen to one sentence from each writer. Writer one says that a hippo can hold its breath for about five minutes. Writer two says that when the sun goes down, a hippo climbs out of the river and eats grass. Three answers are on your screen. Tap the one that says which writer tells you the hippo eats grass at night." },
      hint: { audio: `${Q}/e-2-who-says-grass-hint.mp3`, script: "One writer talked about breathing, and one writer talked about eating. Find the writer who talked about eating." },
      explain: { audio: `${Q}/e-2-who-says-grass-explain.mp3`, script: "The answer is only writer two. Writer two said the hippo climbs out and eats grass when the sun goes down. Writer one only talked about holding its breath." },
      interaction: { type: "choose", options: [{ id: "only-writer-two", label: "only writer two" }, { id: "only-writer-one", label: "only writer one" }, { id: "both-writers", label: "both writers" }], correctId: "only-writer-two", coachWrong: "Think about which sentence mentioned grass. Only one of the two writers said it." },
    },
    {
      id: "e-3-detail-in-both",
      band: "easier",
      difficulty: 3,
      prompt: "Which detail is in both texts?",
      image: IMG("quiz-hippo-birds"),
      narration: { audio: `${Q}/e-3-detail-in-both.mp3`, script: "Listen to a sentence from each writer. Writer one says that a hippo is one of the heaviest animals on land, and that it cannot really swim. Writer two says that a hippo is so heavy that its feet press deep paths, and that birds sit on its back. Three details are on your screen. Tap the detail that both writers give." },
      hint: { audio: `${Q}/e-3-detail-in-both-hint.mp3`, script: "Two of those details were said by only one writer. Listen for the detail that came up in both sentences." },
      explain: { audio: `${Q}/e-3-detail-in-both-explain.mp3`, script: "The answer is that it is very heavy. Writer one called the hippo one of the heaviest animals on land, and writer two said it is so heavy that its feet press deep paths. Both writers gave that detail." },
      interaction: { type: "choose", options: [{ id: "it-is-very-heavy", label: "it is very heavy" }, { id: "birds-sit-on-its-back", label: "birds sit on its back" }, { id: "it-cannot-really-swim", label: "it cannot really swim" }], correctId: "it-is-very-heavy", coachWrong: "That detail came from only one writer. Find the one that both writers mentioned." },
    },
    {
      id: "e-4-points-same-or-different",
      band: "easier",
      difficulty: 4,
      prompt: "Are the two writers' most important points the same or different?",
      image: IMG("quiz-hippo-river"),
      narration: { audio: `${Q}/e-4-points-same-or-different.mp3`, script: "Each writer has a most important point. Writer one's most important point is that a hippo is made for the river. Writer two's most important point is that a hippo helps the whole river. Both writers tell only true facts. Three answers are on your screen. Tap the one that says whether the two points are the same or different." },
      hint: { audio: `${Q}/e-4-points-same-or-different-hint.mp3`, script: "Made for the river and helps the river are not the same idea. Then ask whether either writer said anything false." },
      explain: { audio: `${Q}/e-4-points-same-or-different-explain.mp3`, script: "The answer is different, but both true. One writer says the hippo is made for the river, and the other says the hippo helps the river. Those are two different points, and both of them are true." },
      interaction: { type: "choose", options: [{ id: "different-but-both-true", label: "different, but both true" }, { id: "the-same-idea-twice", label: "the same idea twice" }, { id: "different-and-one-false", label: "different, and one false" }], correctId: "different-but-both-true", coachWrong: "The two points do not say the same thing, and both writers told only true facts. Put those two ideas together." },
    },
    {
      id: "c-1-text-one-point",
      band: "core",
      difficulty: 1,
      prompt: "What is writer one's most important point?",
      narration: { audio: `${Q}/c-1-text-one-point.mp3`, script: "Four sentences are on your screen, and you will tap the one that is writer one's most important point, the idea the whole text holds up. Here is text one, called Made for the River. A hippo is one of the heaviest animals on land, yet it spends the whole day in the rivers and lakes of Africa, where the water holds up all that weight. Its eyes, ears, and nostrils sit on top of its head, so it can see, hear, and breathe while the rest of it stays under. When it sinks, its nostrils pinch shut, and a hippo can hold its breath for about five minutes. A hippo cannot really swim, so it walks and bounces along the river bottom instead. A hippo needs the water by day, because in the hot sun its skin dries out and cracks." },
      hint: { audio: `${Q}/c-1-text-one-point-hint.mp3`, script: "Every sentence in that text is about the hippo and the water. Find the sentence that all the other sentences hold up, not one small detail." },
      explain: { audio: `${Q}/c-1-text-one-point-explain.mp3`, script: "The answer is that a hippo is made for the river. The nostrils on top, the walk along the bottom, and the skin that needs water are all details that hold up that one point." },
      interaction: { type: "choose", options: [{ id: "a-hippo-is-made-for-the-river", label: "a hippo is made for the river" }, { id: "a-hippo-cannot-really-swim", label: "a hippo cannot really swim" }, { id: "a-hippo-holds-its-breath", label: "a hippo holds its breath" }, { id: "a-hippo-hates-the-water", label: "a hippo hates the water" }], correctId: "a-hippo-is-made-for-the-river", coachWrong: "That one is either a single detail or it is not what the text says. Ask what every sentence in the text keeps coming back to." },
    },
    {
      id: "c-2-text-two-point",
      band: "core",
      difficulty: 2,
      prompt: "What is writer two's most important point?",
      narration: { audio: `${Q}/c-2-text-two-point.mp3`, script: "Four sentences are on your screen, and you will tap the one that is writer two's most important point. Here is text two, called Hippo Nights. All day a hippo waits in the river, but when the sun goes down it climbs out and walks onto the grassland to eat. It may walk for miles in one night, and it eats a heap of grass heavier than a big dog. Before morning it is back in the water, and its droppings sink and feed the tiny creatures that fish eat. When the river rises, water runs along the deep paths the hippos have worn through the reeds, and it makes new channels where small fish and frogs can live. Birds perch on the wide back of a hippo and eat the bugs and ticks on its skin." },
      hint: { audio: `${Q}/c-2-text-two-point-hint.mp3`, script: "The fish, the frogs, and the birds all get something from the hippo. Ask what one idea those details add up to." },
      explain: { audio: `${Q}/c-2-text-two-point-explain.mp3`, script: "The answer is that a hippo helps the river. The droppings that feed the fish, the paths that become channels, and the birds that eat the bugs all hold up that one point." },
      interaction: { type: "choose", options: [{ id: "a-hippo-helps-the-river", label: "a hippo helps the river" }, { id: "a-hippo-walks-far-at-night", label: "a hippo walks far at night" }, { id: "a-hippo-is-made-for-the-river", label: "a hippo is made for the river" }, { id: "a-hippo-eats-fish-and-frogs", label: "a hippo eats fish and frogs" }], correctId: "a-hippo-helps-the-river", coachWrong: "That one is a single detail, the other writer's point, or not what the text says. Ask what the fish, the frogs, and the birds all have in common." },
    },
    {
      id: "c-3-sort-only-or-both",
      band: "core",
      difficulty: 3,
      prompt: "Sort each detail: Only Text One, Only Text Two, or In Both?",
      narration: { audio: `${Q}/c-3-sort-only-or-both.mp3`, script: "Six details are on your screen, and you will drag each one to Only Text One, to Only Text Two, or to In Both. Here is text one. A hippo is one of the heaviest animals on land, yet it spends the whole day in the river. Its eyes and nostrils sit on top of its head. A hippo cannot really swim, so it walks along the river bottom. Here is text two. A hippo is so heavy that its feet press deep paths through the reeds. All day it waits in the river, but at night it climbs out to eat grass. Birds perch on its back and eat the bugs on its skin." },
      hint: { audio: `${Q}/c-3-sort-only-or-both-hint.mp3`, script: "For each detail, ask two questions. Did writer one say it? Did writer two say it? Two yeses means In Both." },
      explain: { audio: `${Q}/c-3-sort-only-or-both-explain.mp3`, script: "Only writer one gave the nostrils on top and the walk along the bottom. Only writer two gave the birds eating bugs and the grass at night. Both writers said the hippo is very heavy and that it stays in the river by day." },
      interaction: { type: "sort", buckets: ["Only Text One","Only Text Two","In Both"], bucketAudio: { "Only Text One": `${Q}/b-only-text-one.mp3`, "Only Text Two": `${Q}/b-only-text-two.mp3`, "In Both": `${Q}/b-in-both.mp3` }, items: [{ label: "its nostrils sit up top", bucket: "Only Text One" }, { label: "birds eat bugs on its back", bucket: "Only Text Two" }, { label: "it is very heavy", bucket: "In Both" }, { label: "it walks the river bottom", bucket: "Only Text One" }, { label: "it eats grass at night", bucket: "Only Text Two" }, { label: "it stays in the river by day", bucket: "In Both" }], coachWrong: "Ask whether writer one said that detail, and then whether writer two said it. One yes means only one text. Two yeses means In Both." },
    },
    {
      id: "c-4-points-differ",
      band: "core",
      difficulty: 4,
      prompt: "How do the two writers' most important points differ?",
      narration: { audio: `${Q}/c-4-points-differ.mp3`, script: "Now the two points side by side. Writer one's most important point is that a hippo is made for the river, and every detail in text one is about how the body of a hippo fits the water. Writer two's most important point is that a hippo helps the whole river, and every detail in text two is about what the fish, the frogs, and the birds get from it. Both points are true. Four answers are on your screen. Tap the one that tells how the two points differ." },
      hint: { audio: `${Q}/c-4-points-differ-hint.mp3`, script: "One writer talks about what the river does for the hippo. The other talks about what the hippo does for the river. Both are true." },
      explain: { audio: `${Q}/c-4-points-differ-explain.mp3`, script: "The answer is made for it versus helps it. Writer one says the hippo is made for the river, and writer two says the hippo helps the river. Two different points, and both are true." },
      interaction: { type: "choose", options: [{ id: "made-for-it-versus-helps-it", label: "made for it versus helps it" }, { id: "the-two-points-agree", label: "the two points agree" }, { id: "one-is-true-one-is-false", label: "one is true, one is false" }, { id: "one-is-about-the-birds", label: "one is about the birds" }], correctId: "made-for-it-versus-helps-it", coachWrong: "The two points are not the same, both are true, and neither one is about a single small detail. Ask what each writer says the river and the hippo do for each other." },
    },
    {
      id: "c-5-same-detail-new-reason",
      band: "core",
      difficulty: 5,
      prompt: "Both writers say a hippo is very heavy. What does writer two use that detail to show?",
      narration: { audio: `${Q}/c-5-same-detail-new-reason.mp3`, script: "Both writers use the very same detail, and each one uses it for a different reason. Writer one says a hippo is one of the heaviest animals on land, and uses that to show that the water holds up all that weight. Writer two says the hippo is heavy for a different reason. Here is the sentence from text two. Hippos use the same trails night after night, and their heavy feet press deep paths through the reeds, where the rising river makes channels for small fish and frogs. Four answers are on your screen. Tap what writer two uses the heavy detail to show." },
      hint: { audio: `${Q}/c-5-same-detail-new-reason-hint.mp3`, script: "Listen for what the heavy feet do in the sentence from text two. The answer is the thing the feet make." },
      explain: { audio: `${Q}/c-5-same-detail-new-reason-explain.mp3`, script: "The answer is that its feet press deep paths. Writer one used the weight to show the river holds the hippo up. Writer two used the same weight to show the paths that become channels for fish and frogs." },
      interaction: { type: "choose", options: [{ id: "its-feet-press-deep-paths", label: "its feet press deep paths" }, { id: "its-droppings-feed-fish", label: "its droppings feed fish" }, { id: "birds-sit-on-its-back", label: "birds sit on its back" }, { id: "it-eats-grass-at-night", label: "it eats grass at night" }], correctId: "its-feet-press-deep-paths", coachWrong: "That detail is in text two, but it is not what the heavy detail shows. Find the thing that happens because the hippo is heavy." },
    },
    {
      id: "c-6-speak-both-and-only",
      band: "core",
      difficulty: 6,
      prompt: "Say one detail both writers give about the hippo, and one detail only one writer gives.",
      narration: { audio: `${Q}/c-6-speak-both-and-only.mp3`, script: "This time you say it. Here is a piece of each text. Writer one says that a hippo is one of the heaviest animals on land, that it spends the whole day in the river, and that its nostrils pinch shut when it sinks. Writer two says that a hippo is so heavy its feet press deep paths, that it waits in the river all day, and that at night it climbs out to eat grass. Tap the mic. Say one detail that both writers give, and then one detail that only one writer gives." },
      hint: { audio: `${Q}/c-6-speak-both-and-only-hint.mp3`, script: "Two details came up in both pieces, the weight and the river. Say one of those, then say something only one writer said, such as the nostrils or the grass." },
      explain: { audio: `${Q}/c-6-speak-both-and-only-explain.mp3`, script: "One answer goes like this. Both writers say a hippo is very heavy. Only writer two says it eats grass at night. Any detail from both, and any detail from just one, is a good answer." },
      interaction: { type: "speak", text: "heavy heaviest weight weighs river water day daytime nostrils nostril nose breath breathe sinks sink paths path feet grass night eats eat eating swim bottom" },
    },
    {
      id: "h-1-put-together-modeled",
      band: "harder",
      difficulty: 1,
      prompt: "Text two told you when the hippo comes back. What did text one add?",
      narration: { audio: `${Q}/h-1-put-together-modeled.mp3`, script: "Here is a fourth grade move. Some questions are not answered by text one alone or by text two alone, and you answer them by putting one fact from each text together. Watch me. The question asks why a hippo comes back to the river before the sun is up. Text two says a hippo is back in the water before morning, but it never says why. Text one says that in the hot sun a hippo's skin dries out and cracks, but it never mentions the morning. Put them together. A hippo comes back before sunrise because the sun would crack its skin. Text two gave me the when, and text one gave me the why. Now you. Four answers are on your screen. Tap the part that text one added to the answer." },
      hint: { audio: `${Q}/h-1-put-together-modeled-hint.mp3`, script: "Text two gave the when. Text one gave the reason, the part about the sun and the skin." },
      explain: { audio: `${Q}/h-1-put-together-modeled-explain.mp3`, script: "The answer is why the sun is a danger. Text one told you the sun cracks a hippo's skin, and that reason is the part text two never gave." },
      interaction: { type: "choose", options: [{ id: "why-the-sun-is-a-danger", label: "why the sun is a danger" }, { id: "when-the-hippo-comes-back", label: "when the hippo comes back" }, { id: "how-far-the-hippo-walks", label: "how far the hippo walks" }, { id: "what-the-birds-eat", label: "what the birds eat" }], correctId: "why-the-sun-is-a-danger", coachWrong: "That part came from text two, or from neither text. Text one added the reason. What did text one say about the sun?" },
    },
    {
      id: "h-2-put-together-applied",
      band: "harder",
      difficulty: 2,
      prompt: "Why does a hippo need a river and a grassland close together? Use a fact from each text.",
      narration: { audio: `${Q}/h-2-put-together-applied.mp3`, script: "Now you put the two texts together. The question asks why a hippo needs a river and a grassland close together. Here is what text one says. A hippo needs the water by day, because in the hot sun its skin dries out and cracks. Here is what text two says. When the sun goes down, a hippo climbs out and walks onto the grassland to eat, and it may walk for miles in one night. Four answers are on your screen. Tap the answer that uses a fact from each text." },
      hint: { audio: `${Q}/h-2-put-together-applied-hint.mp3`, script: "Text one tells you what the hippo needs in the daytime. Text two tells you what it needs at night. The answer holds both." },
      explain: { audio: `${Q}/h-2-put-together-applied-explain.mp3`, script: "The answer is water by day, grass by night. Text one says the hippo needs the water by day for its skin, and text two says it eats grass at night, so it needs both close together." },
      interaction: { type: "choose", options: [{ id: "water-by-day-grass-by-night", label: "water by day, grass by night" }, { id: "grass-grows-only-near-rivers", label: "grass grows only near rivers" }, { id: "it-cannot-walk-on-dry-land", label: "it cannot walk on dry land" }, { id: "it-drinks-the-river-dry", label: "it drinks the river dry" }], correctId: "water-by-day-grass-by-night", coachWrong: "Neither text says that. Take the daytime fact from text one and the nighttime fact from text two, and find the answer that holds both." },
    },
    {
      id: "h-3-which-needs-both",
      band: "harder",
      difficulty: 3,
      prompt: "Which question can you answer only by putting both texts together?",
      narration: { audio: `${Q}/h-3-which-needs-both.mp3`, script: "Some questions are answered by one text alone, some by neither text, and some only by both texts together. Here are the facts. Text one says a hippo can hold its breath for about five minutes, and that in the hot sun its skin dries out and cracks. Text two says a hippo climbs out to eat grass only after the sun goes down, and that birds eat the bugs on its back. Four questions are on your screen. Tap the question that you can answer only by putting both texts together." },
      hint: { audio: `${Q}/h-3-which-needs-both-hint.mp3`, script: "Cross out any question that one text answers by itself, and any question that neither text answers. The one left needs a fact from each text." },
      explain: { audio: `${Q}/h-3-which-needs-both-explain.mp3`, script: "The answer is why it eats only at night. Text two says when it eats, and text one says the sun cracks its skin, so only both together tell you why the eating waits for dark. The breath question needs only text one, the birds question needs only text two, and neither text counts hippos." },
      interaction: { type: "choose", options: [{ id: "why-it-eats-only-at-night", label: "why it eats only at night" }, { id: "how-long-it-holds-its-breath", label: "how long it holds its breath" }, { id: "what-the-birds-eat", label: "what the birds eat" }, { id: "how-many-hippos-live-there", label: "how many hippos live there" }], correctId: "why-it-eats-only-at-night", coachWrong: "That question is answered by one text alone, or by neither text. Find the one where text one holds half the answer and text two holds the other half." },
    },
    {
      id: "h-4-speak-put-together",
      band: "harder",
      difficulty: 4,
      prompt: "Say why a hippo does its eating at night. Use one fact from each text.",
      narration: { audio: `${Q}/h-4-speak-put-together.mp3`, script: "Last one, out loud. Here is the fact from each text. Text one says that in the hot sun a hippo's skin dries out and cracks, so it needs the water by day. Text two says that when the sun goes down, a hippo climbs out and eats grass. Tap the mic, and tell me why a hippo does its eating at night, using a fact from each text." },
      hint: { audio: `${Q}/h-4-speak-put-together-hint.mp3`, script: "Your answer has two halves. Say what the sun would do to its skin in the daytime, and then say what it does once it is dark." },
      explain: { audio: `${Q}/h-4-speak-put-together-explain.mp3`, script: "One answer goes like this. In the daytime the sun would crack its skin, so it stays in the water, and it climbs out to eat grass once it is dark." },
      interaction: { type: "speak", text: "sun sunlight skin dry dries cracks crack burn burns water river day daytime hot night dark grass eats eat cool" },
    },
  ],
};
