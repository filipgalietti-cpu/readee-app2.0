import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Book Team-Up QUIZ (RI.2.9) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL FRESH stimuli: a
// brand-new two-text pair about GECKOS spoken in the narration (text one =
// body tricks: gripping toe hairs climb walls and ceilings, tail drops off
// and regrows, sticky toes catch bugs; text two = night life: wakes at
// sundown, big night eyes, hunts bugs in the dark, chirps and squeaks to
// talk). Shared facts told in different words: a gecko is a small lizard /
// geckos go after bugs. All gecko facts verified true. Never dolphin recall.
// Bands: easier(G1-bridge: 2 options + fresh picture support) / core(on-grade
// G2: points, both-or-one, sort, production) / harder(G3 transfer taught in
// the stimulus: pick the text that answers a question, pick the fact that
// fits an author's angle, spot the point two texts disagree on). Quiz images
// live in the lesson's image dir (quiz-* keys, same textless pipeline).

const Q = "/audio/quizzes-v2/book-team-up-quiz";
const IMG = (w: string) => `/images/lessons-v2/book-team-up/${w.toLowerCase()}.png`;

export const bookTeamUpQuiz: QuizDef = {
  id: "book-team-up-quiz",
  lessonId: "book-team-up",
  title: "Book Team-Up Quiz",
  standard: "RI.2.9",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-climb-text",
      band: "easier",
      difficulty: 1,
      prompt: "Tap the text that teaches climbing.",
      image: IMG("quiz-gecko-wall"),
      narration: { audio: `${Q}/e-1-climb-text.mp3`, script: "Here are two little texts about geckos. Text one says: a gecko's gripping toes can climb walls. Text two says: a gecko's big eyes see in the dark. You want to learn about climbing. Tap the text that teaches climbing." },
      hint: { audio: `${Q}/e-1-climb-text-hint.mp3`, script: "Listen again. One text talked about toes that climb. Which text was it?" },
      explain: { audio: `${Q}/e-1-climb-text-explain.mp3`, script: "Here is the answer. Text one said gripping toes can climb walls, so text one teaches climbing. Text two only taught about eyes." },
      interaction: { type: "choose", options: [{ id: "text-one", label: "text one" }, { id: "text-two", label: "text two" }], correctId: "text-one", coachWrong: "One text talked about big eyes. The other talked about toes that climb. Tap the climbing one." },
    },
    {
      id: "e-2-bugs-both",
      band: "easier",
      difficulty: 2,
      prompt: "Tap the fact that is in both texts.",
      image: IMG("quiz-gecko-bug"),
      narration: { audio: `${Q}/e-2-bugs-both.mp3`, script: "Listen to two little gecko texts. Text one says: geckos catch bugs to eat. Text two says: geckos hunt bugs at night. The words are different, but think about what both texts say geckos do. Tap the fact that is in both texts." },
      hint: { audio: `${Q}/e-2-bugs-both-hint.mp3`, script: "Catching and hunting are different words. What do both texts say geckos go after?" },
      explain: { audio: `${Q}/e-2-bugs-both-explain.mp3`, script: "Here is the answer. Text one said catch bugs, and text two said hunt bugs. Different words, same fact: geckos eat bugs. That fact is in both texts." },
      interaction: { type: "choose", options: [{ id: "geckos-eat-bugs", label: "geckos eat bugs" }, { id: "geckos-see-in-the-dark", label: "geckos see in the dark" }], correctId: "geckos-eat-bugs", coachWrong: "Only one text talked about seeing in the dark. Find the fact that both texts taught." },
    },
    {
      id: "e-3-tail-only-one",
      band: "easier",
      difficulty: 3,
      prompt: "Tap the fact that only text one teaches.",
      image: IMG("quiz-gecko-tail"),
      narration: { audio: `${Q}/e-3-tail-only-one.mp3`, script: "Two more little texts. Text one says: a gecko's tail can drop off and grow back. Text two says: geckos chirp at night. Tap the fact that only text one teaches." },
      hint: { audio: `${Q}/e-3-tail-only-one-hint.mp3`, script: "Only means just that one text. Which fact did you hear in text one, and not in text two?" },
      explain: { audio: `${Q}/e-3-tail-only-one-explain.mp3`, script: "Here is the answer. Only text one taught that the tail can drop off and grow back. The chirping fact belongs to text two." },
      interaction: { type: "choose", options: [{ id: "a-tail-that-grows-back", label: "a tail that grows back" }, { id: "chirping-at-night", label: "chirping at night" }], correctId: "a-tail-that-grows-back", coachWrong: "One of those facts came from text two. Tap the fact that text one taught." },
    },
    {
      id: "e-4-night-question",
      band: "easier",
      difficulty: 4,
      prompt: "Tap the text you should read.",
      image: IMG("quiz-gecko-night"),
      narration: { audio: `${Q}/e-4-night-question.mp3`, script: "You wonder what geckos do at night. Text one teaches about gecko toes and tails. Text two teaches about geckos at night. Tap the text you should read." },
      hint: { audio: `${Q}/e-4-night-question-hint.mp3`, script: "Your question is about the night. Which text teaches about the night?" },
      explain: { audio: `${Q}/e-4-night-question-explain.mp3`, script: "Here is the answer. Your question was about the night, and text two teaches about geckos at night. Text two is the one to read." },
      interaction: { type: "choose", options: [{ id: "text-two", label: "text two" }, { id: "text-one", label: "text one" }], correctId: "text-two", coachWrong: "Think about your question: what do geckos do at night? Tap the text with the night facts." },
    },
    {
      id: "c-1-text-one-point",
      band: "core",
      difficulty: 1,
      prompt: "Tap text one's most important point.",
      narration: { audio: `${Q}/c-1-text-one-point.mp3`, script: "Here is a whole little text about geckos. Text one says: a gecko is a small lizard whose body is full of tricks. Tiny hairs on its toes grip tight, so a gecko can climb walls and even ceilings. If a hunter grabs its tail, the tail drops off, and a new tail grows back. Sticky toes also help a gecko catch bugs to eat. One idea is the most important point, the big idea all the details work for. Tap text one's most important point." },
      hint: { audio: `${Q}/c-1-text-one-point-hint.mp3`, script: "Climbing, a tail that grows back, catching bugs. Those are details. What big idea do they all show?" },
      explain: { audio: `${Q}/c-1-text-one-point-explain.mp3`, script: "Here is the answer. The most important point is that a gecko's body is full of tricks. The gripping toes, the tail, and the bug catching are details working for that big idea." },
      interaction: { type: "choose", options: [{ id: "its-body-is-full-of-tricks", label: "its body is full of tricks" }, { id: "its-tail-can-drop-off", label: "its tail can drop off" }, { id: "its-toes-have-tiny-hairs", label: "its toes have tiny hairs" }, { id: "it-can-climb-a-wall", label: "it can climb a wall" }], correctId: "its-body-is-full-of-tricks", coachWrong: "That is one detail from the text. The most important point is the big idea all the details work for. Which choice covers the whole text?" },
    },
    {
      id: "c-2-text-two-point",
      band: "core",
      difficulty: 2,
      prompt: "Tap text two's most important point.",
      narration: { audio: `${Q}/c-2-text-two-point.mp3`, script: "Now a second text about the same topic. Text two says: a gecko is a small lizard that loves the night. When the sun goes down, geckos wake up. Their big eyes see well in the dark, and they hunt bugs in the dark. Geckos chirp and squeak to talk to each other. Tap text two's most important point." },
      hint: { audio: `${Q}/c-2-text-two-point-hint.mp3`, script: "Waking at sundown, night eyes, night hunting. Those details all point at one big idea." },
      explain: { audio: `${Q}/c-2-text-two-point-explain.mp3`, script: "Here is the answer. Text two's most important point is that geckos love the night. Waking at sundown, seeing in the dark, and hunting in the dark are details holding that big idea up." },
      interaction: { type: "choose", options: [{ id: "geckos-love-the-night", label: "geckos love the night" }, { id: "big-eyes-see-in-the-dark", label: "big eyes see in the dark" }, { id: "geckos-chirp-and-squeak", label: "geckos chirp and squeak" }, { id: "geckos-wake-at-sundown", label: "geckos wake at sundown" }], correctId: "geckos-love-the-night", coachWrong: "That is a detail from text two. Step back and ask: what big idea do all the details show?" },
    },
    {
      id: "c-3-both-texts-fact",
      band: "core",
      difficulty: 3,
      prompt: "Tap the fact that is in both texts.",
      narration: { audio: `${Q}/c-3-both-texts-fact.mp3`, script: "Time to compare our two gecko texts. Text one taught: a small lizard, toes that grip and climb, a tail that grows back, and catching bugs to eat. Text two taught: a small lizard, waking at night, big night eyes, hunting bugs in the dark, and chirping to talk. Tap the fact that is in both texts." },
      hint: { audio: `${Q}/c-3-both-texts-fact-hint.mp3`, script: "Check each fact against both texts. Different words can still tell the same fact." },
      explain: { audio: `${Q}/c-3-both-texts-fact-explain.mp3`, script: "Here is the answer. Text one said geckos catch bugs, and text two said geckos hunt bugs. Different words, same fact, so hunting bugs is in both texts. The other facts each live in just one text." },
      interaction: { type: "choose", options: [{ id: "hunting-bugs", label: "hunting bugs" }, { id: "a-tail-that-grows-back", label: "a tail that grows back" }, { id: "chirping-to-talk", label: "chirping to talk" }, { id: "seeing-in-the-dark", label: "seeing in the dark" }], correctId: "hunting-bugs", coachWrong: "One of the texts never taught that fact. Find the fact that both texts teach, even in different words." },
    },
    {
      id: "c-4-tail-lives-where",
      band: "core",
      difficulty: 4,
      prompt: "Where does this fact live?",
      narration: { audio: `${Q}/c-4-tail-lives-where.mp3`, script: "Here is one gecko fact: the tail drops off and a new one grows back. Think about our two texts. Text one taught body tricks. Text two taught the night. Tap where this fact lives." },
      hint: { audio: `${Q}/c-4-tail-lives-where-hint.mp3`, script: "Is a dropping tail a body trick, or a night fact? Which text taught it?" },
      explain: { audio: `${Q}/c-4-tail-lives-where-explain.mp3`, script: "Here is the answer. Only text one, the body text, taught that the tail drops off and grows back. Text two never mentioned the tail, so the fact lives in text one." },
      interaction: { type: "choose", options: [{ id: "text-one", label: "text one" }, { id: "text-two", label: "text two" }, { id: "both-texts", label: "both texts" }, { id: "neither-text", label: "neither text" }], correctId: "text-one", coachWrong: "Think about each author's job. One taught body tricks, one taught the night. Where does a dropping tail belong?" },
    },
    {
      id: "c-5-gecko-sort",
      band: "core",
      difficulty: 5,
      prompt: "Sort each fact: Text One, Text Two, or Both?",
      narration: { audio: `${Q}/c-5-gecko-sort.mp3`, script: "Big compare time. Remember our gecko texts. Text one taught: a small lizard, toes that grip walls, a tail that grows back, and catching bugs. Text two taught: a small lizard, waking when the sun sets, big night eyes, hunting bugs, and chirping. Now sort each fact. If both texts taught it, drag it to both. If only one text taught it, drag it to that text." },
      hint: { audio: `${Q}/c-5-gecko-sort-hint.mp3`, script: "Say each fact to yourself, then check it against text one and text two. Different words can still teach the same fact." },
      explain: { audio: `${Q}/c-5-gecko-sort-explain.mp3`, script: "Here is the answer. Both texts called the gecko a small lizard, and both had geckos going after bugs. Gripping toes and the growing tail belong to text one. Waking at sunset and chirping belong to text two." },
      interaction: { type: "sort", buckets: ["Text One","Text Two","Both"], bucketAudio: { "Text One": `${Q}/b-text-one.mp3`, "Text Two": `${Q}/b-text-two.mp3`, "Both": `${Q}/b-both.mp3` }, items: [{ label: "being a small lizard", bucket: "Both" }, { label: "catching bugs", bucket: "Both" }, { label: "toes that grip walls", bucket: "Text One" }, { label: "a tail that grows back", bucket: "Text One" }, { label: "waking when the sun sets", bucket: "Text Two" }, { label: "chirping and squeaking", bucket: "Text Two" }], coachWrong: "Check that fact against both texts. Did both teach it, or just one? Different words can still tell the same fact." },
    },
    {
      id: "c-6-say-both-fact",
      band: "core",
      difficulty: 6,
      prompt: "Say one fact that both texts taught.",
      narration: { audio: `${Q}/c-6-say-both-fact.mp3`, script: "Your turn to talk. Tell me one fact that both gecko texts taught. Think about what kind of animal a gecko is, or what geckos go after to eat. Tap the mic and say a both texts fact out loud." },
      hint: { audio: `${Q}/c-6-say-both-fact-hint.mp3`, script: "Both texts named the kind of animal a gecko is, and both told what geckos eat. Say one of those facts." },
      explain: { audio: `${Q}/c-6-say-both-fact-explain.mp3`, script: "Here is one way to say it. Both texts taught that a gecko is a small lizard, and both taught that geckos go after bugs. Either fact counts." },
      interaction: { type: "speak", text: "bug bugs lizard lizards small hunt hunts hunting catch catches catching eat eats eating insect insects" },
    },
    {
      id: "h-1-ceiling-question",
      band: "harder",
      difficulty: 1,
      prompt: "Tap the text that answers your question.",
      narration: { audio: `${Q}/h-1-ceiling-question.mp3`, script: "Here is how third graders use two texts: they pick the right text for their question. Your question: how can a gecko walk on the ceiling? Remember, text one taught body tricks, like gripping toe hairs and the growing tail. Text two taught the night, like big eyes and chirping. Tap the text that answers your question." },
      hint: { audio: `${Q}/h-1-ceiling-question-hint.mp3`, script: "Walking on a ceiling takes a special body part. Which text taught about body parts?" },
      explain: { audio: `${Q}/h-1-ceiling-question-explain.mp3`, script: "Here is the thinking. Walking on the ceiling is a body trick, and text one taught that tiny toe hairs grip tight. Text one answers your question. Text two never explained climbing." },
      interaction: { type: "choose", options: [{ id: "text-one", label: "text one" }, { id: "text-two", label: "text two" }, { id: "both-texts", label: "both texts" }, { id: "neither-text", label: "neither text" }], correctId: "text-one", coachWrong: "Ask your question again: how can a gecko walk on the ceiling? Which text taught the body part that makes it possible?" },
    },
    {
      id: "h-2-fits-the-angle",
      band: "harder",
      difficulty: 2,
      prompt: "Tap the fact that fits text two's job.",
      narration: { audio: `${Q}/h-2-fits-the-angle.mp3`, script: "Here is a third grade author move: an author picks facts that fit the job of the text. The author of text two, the night text, wants to add one more fact. Think about text two's job, then tap the fact that fits it." },
      hint: { audio: `${Q}/h-2-fits-the-angle-hint.mp3`, script: "Text two's job is the night. Which fact belongs in a text about gecko nights?" },
      explain: { audio: `${Q}/h-2-fits-the-angle-explain.mp3`, script: "Here is the thinking. Hunting moths at midnight is a nighttime fact, so it fits text two's job. Gripping toes and the growing tail fit the body text, and the plant fact fits neither gecko text." },
      interaction: { type: "choose", options: [{ id: "they-hunt-moths-at-midnight", label: "they hunt moths at midnight" }, { id: "toe-hairs-grip-the-glass", label: "toe hairs grip the glass" }, { id: "a-new-tail-grows-in-weeks", label: "a new tail grows in weeks" }, { id: "some-lizards-eat-plants", label: "some lizards eat plants" }], correctId: "they-hunt-moths-at-midnight", coachWrong: "That fact belongs to a different job. Text two teaches about geckos at night. Which fact is a night fact?" },
    },
    {
      id: "h-3-disagree-point",
      band: "harder",
      difficulty: 3,
      prompt: "Tap the point the texts disagree on.",
      narration: { audio: `${Q}/h-3-disagree-point.mp3`, script: "One more third grade move: sometimes two texts disagree on a point, and strong readers spot it. Listen to two new sentences. Text one says: the gecko's best trick is climbing with its gripping toes. Text two says: the gecko's best trick is dropping its tail to get away. Tap the point the two texts disagree on." },
      hint: { audio: `${Q}/h-3-disagree-point-hint.mp3`, script: "Both sentences argue about the same thing. One says toes, one says the tail. What are they arguing about?" },
      explain: { audio: `${Q}/h-3-disagree-point-explain.mp3`, script: "Here is the thinking. Text one picked climbing, and text two picked the dropping tail. They disagree on the gecko's best trick. Neither sentence talked about food, size, or sleep." },
      interaction: { type: "choose", options: [{ id: "the-geckos-best-trick", label: "the gecko's best trick" }, { id: "what-geckos-like-to-eat", label: "what geckos like to eat" }, { id: "how-big-geckos-grow", label: "how big geckos grow" }, { id: "where-geckos-sleep", label: "where geckos sleep" }], correctId: "the-geckos-best-trick", coachWrong: "Listen to what each sentence is arguing about. One says toes, one says the tail. What question are they both trying to answer?" },
    },
    {
      id: "h-4-pick-text-speak",
      band: "harder",
      difficulty: 4,
      prompt: "Say which text you would read.",
      narration: { audio: `${Q}/h-4-pick-text-speak.mp3`, script: "Last one, and it is all yours. You want to learn how geckos talk to each other. Think about our two texts: text one taught body tricks, and text two taught gecko nights, with chirps and squeaks. Tap the mic and tell me which text you would read." },
      hint: { audio: `${Q}/h-4-pick-text-speak-hint.mp3`, script: "Chirping and squeaking is how geckos talk. Which text taught those sounds? Say that text." },
      explain: { audio: `${Q}/h-4-pick-text-speak-explain.mp3`, script: "Here is the thinking. Chirps and squeaks were in text two, the night text. To learn how geckos talk, you would read text two." },
      interaction: { type: "speak", text: "two second night chirp chirps chirping squeak squeaks squeaking talk talking sounds" },
    },
  ],
};
