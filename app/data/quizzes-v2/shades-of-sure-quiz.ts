import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Shades of Sure QUIZ (L.3.5c) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// weakest-or-strongest and sure-or-feeling at 3 options, 3 picture supports) /
// core(on-grade G3: certainty ladder sequence, which-shade-fits, sadness
// ladder sequence, Sure Words / Feeling Words sort, neighbor difference,
// production speak) / harder(G4 transfer TAUGHT in the stimulus first: a
// dial for a NEW dimension, how FIRMLY something is said, hinted / mentioned
// / stated / insisted, modeled in h-1 then applied, neighbor difference,
// closing production speak). ALL stimuli FRESH vs the lesson (wondered /
// suspected / believed / knew, carefree / uneasy / worried / frantic, the
// lesson's sort words, Louisa, Cosmo, Bandit the ferret) and python-swept vs
// the whole catalog: had no idea, guessed, figured, was certain, downcast,
// miserable, heartbroken, devastated, expected, had a hunch, was convinced,
// petrified, gleeful, cranky, hinted, mentioned, stated, insisted, muddy
// prints, rain boots, doormat, Harriet, Rupert, Lucinda all catalog-first as
// tiles and taught words. ONE frame spoken inside every question (no
// earlier-question recall): a rainy afternoon at Aunt Lucinda's house,
// a trail of muddy boot prints across her clean kitchen floor, the gray cat
// on the chair, Rupert's green rain boots on the mat by the back door,
// Harriet working out who made the prints. Tiles lowercase, audio-free,
// kebab ids, 28-char cap; bucket clips are quiz-local b-*.mp3 pre-synthed
// from punctuated labels; every narration leads with the teaching and puts
// the moment LAST, no quoted sentence ending in ? or !, no bare-imperative
// or fragment openers.

const Q = "/audio/quizzes-v2/shades-of-sure-quiz";
const IMG = (w: string) => `/images/lessons-v2/shades-of-sure/${w.toLowerCase()}.png`;

export const shadesOfSureQuiz: QuizDef = {
  id: "shades-of-sure-quiz",
  lessonId: "shades-of-sure",
  title: "Shades of Sure Quiz",
  standard: "L.3.5c",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-least-sure",
      band: "easier",
      difficulty: 1,
      prompt: "Which word shows the LEAST sure?",
      image: IMG("quiz-harriet-looking"),
      narration: { audio: `${Q}/e-1-least-sure.mp3`, script: "Here is a rainy afternoon at Aunt Lucinda's house. Harriet found a trail of muddy boot prints across the clean kitchen floor, and she stared at them for a long time without any clue about who had made them. Three sure words are on your screen. Tap the word that means the least sure of all." },
      hint: { audio: `${Q}/e-1-least-sure-hint.mp3`, script: "Harriet has no clue at all. The word you want has no proof inside it." },
      explain: { audio: `${Q}/e-1-least-sure-explain.mp3`, script: "The least sure word is had no idea, because Harriet had nothing to go on, not one clue. Figured needs a strong clue, and was certain needs proof." },
      interaction: { type: "choose", options: [{ id: "had-no-idea", label: "had no idea" }, { id: "figured", label: "figured" }, { id: "was-certain", label: "was certain" }], correctId: "had-no-idea", coachWrong: "Ask how much proof that word needs. Harriet has none at all, so find the word with no proof inside it." },
    },
    {
      id: "e-2-most-sure",
      band: "easier",
      difficulty: 2,
      prompt: "Which word shows the MOST sure?",
      image: IMG("quiz-boots-by-door"),
      narration: { audio: `${Q}/e-2-most-sure.mp3`, script: "A little later Harriet found Rupert's green rain boots on the mat by the back door with fresh mud dripping off them, and she had watched him walk in wearing them. Three sure words are on your screen. Tap the word that means the most sure of all." },
      hint: { audio: `${Q}/e-2-most-sure-hint.mp3`, script: "Harriet saw it with her own eyes. The word you want has proof inside it." },
      explain: { audio: `${Q}/e-2-most-sure-explain.mp3`, script: "The most sure word is was certain, because Harriet saw Rupert walk in wearing the muddy boots. Guessed has almost no clue, and figured has a strong clue but no proof yet." },
      interaction: { type: "choose", options: [{ id: "guessed", label: "guessed" }, { id: "figured", label: "figured" }, { id: "was-certain", label: "was certain" }], correctId: "was-certain", coachWrong: "Harriet saw it happen. Find the word that means the proof is in hand." },
    },
    {
      id: "e-3-feeling-word",
      band: "easier",
      difficulty: 3,
      prompt: "Which word is a feeling word?",
      image: IMG("quiz-muddy-prints"),
      narration: { audio: `${Q}/e-3-feeling-word.mp3`, script: "Some words tell how sure a person is, and some tell what a person feels inside. The gray cat on the chair had watched the whole thing, and when the back door banged shut in the wind, the cat shot straight up in the air and then could not move a whisker for a whole minute. Three words are on your screen. Two of them are sure words, and one of them is a feeling word. Tap the feeling word." },
      hint: { audio: `${Q}/e-3-feeling-word-hint.mp3`, script: "A feeling word tells what happens inside a person or an animal, not how much proof they have." },
      explain: { audio: `${Q}/e-3-feeling-word-explain.mp3`, script: "Petrified is the feeling word, because it tells what the cat felt inside, so scared that it could not move. Guessed and figured tell how sure a person is." },
      interaction: { type: "choose", options: [{ id: "petrified", label: "petrified" }, { id: "guessed", label: "guessed" }, { id: "figured", label: "figured" }], correctId: "petrified", coachWrong: "That word is about proof, not about a feeling. Find the word that tells what someone feels inside." },
    },
    {
      id: "e-4-small-sadness",
      band: "easier",
      difficulty: 4,
      prompt: "Which sad word fits a small sadness?",
      narration: { audio: `${Q}/e-4-small-sadness.mp3`, script: "Sad words sit on a dial too, from small to huge. Downcast means only a little sad, with your head hanging for a minute. Heartbroken means deeply sad after losing something you love. Devastated means so crushed by sadness that you cannot do anything at all. Now the moment. Rupert dropped his cookie on the wet porch, frowned for one minute, and then forgot all about it. Tap the sad word that fits a sadness that small." },
      hint: { audio: `${Q}/e-4-small-sadness-hint.mp3`, script: "A frown that lasts one minute is a small sadness. The word you want sits at the bottom of the sad dial." },
      explain: { audio: `${Q}/e-4-small-sadness-explain.mp3`, script: "Downcast fits, because a one-minute frown over a cookie is a small sadness. Heartbroken and devastated are far too big for a dropped cookie." },
      interaction: { type: "choose", options: [{ id: "downcast", label: "downcast" }, { id: "heartbroken", label: "heartbroken" }, { id: "devastated", label: "devastated" }], correctId: "downcast", coachWrong: "That word is a huge sadness. Rupert forgot about the cookie in a minute, so find the smallest word on the dial." },
    },
    {
      id: "c-1-sequence-sure-dial",
      band: "core",
      difficulty: 1,
      prompt: "Build the sure dial, least sure to most sure.",
      narration: { audio: `${Q}/c-1-sequence-sure-dial.mp3`, script: "Here is a new sure dial from the afternoon of the muddy prints, with four words mixed up on your screen. Figured means you worked it out from a strong clue, but you have not seen it yet. Had no idea means no clue at all. Was certain means you saw it yourself or you hold the proof. Guessed means you picked an answer with almost nothing to go on. Drag the four words into order, from the least sure to the most sure." },
      hint: { audio: `${Q}/c-1-sequence-sure-dial-hint.mp3`, script: "The word with no clue at all goes first, and the word with proof in hand goes last." },
      explain: { audio: `${Q}/c-1-sequence-sure-dial-explain.mp3`, script: "The dial climbs by proof. Had no idea has no clue, guessed has almost nothing, figured has a strong clue, and was certain has the proof in hand." },
      interaction: { type: "sequence", items: [{ id: "had-no-idea", label: "had no idea" }, { id: "guessed", label: "guessed" }, { id: "figured", label: "figured" }, { id: "was-certain", label: "was certain" }], order: ["had-no-idea","guessed","figured","was-certain"], coachWrong: "Ask how much proof each word needs, and climb from no clue at all to proof in hand." },
    },
    {
      id: "c-2-which-shade-fits",
      band: "core",
      difficulty: 2,
      prompt: "Which sure word fits Harriet here?",
      narration: { audio: `${Q}/c-2-which-shade-fits.mp3`, script: "Four words from the sure dial are on your screen, and the moment comes next. After you hear it, ask how much proof Harriet has, and tap the word that fits. Harriet measured the muddy prints with her hand, and they were far too big for the cat, and exactly the size of the green boots that Rupert wore every rainy day, but she had not seen anybody walk across the floor." },
      hint: { audio: `${Q}/c-2-which-shade-fits-hint.mp3`, script: "A strong clue is not the same as seeing it happen. Find the spot on the dial that a strong clue earns." },
      explain: { audio: `${Q}/c-2-which-shade-fits-explain.mp3`, script: "Figured fits, because Harriet worked it out from a strong clue, the size of the prints, but she had not seen anybody make them. Was certain needs her own eyes, and guessed and had no idea have far less than a boot-sized clue." },
      interaction: { type: "choose", options: [{ id: "had-no-idea", label: "had no idea" }, { id: "guessed", label: "guessed" }, { id: "figured", label: "figured" }, { id: "was-certain", label: "was certain" }], correctId: "figured", coachWrong: "Count the proof. The prints match the boots, but nobody was seen. That is more than a guess and less than proof." },
    },
    {
      id: "c-3-sequence-sad-dial",
      band: "core",
      difficulty: 3,
      prompt: "Build the sad dial, smallest to biggest.",
      narration: { audio: `${Q}/c-3-sequence-sad-dial.mp3`, script: "Feeling words climb by size, and here is a sad dial with four words mixed up on your screen. Heartbroken means deeply sad because you lost something you love. Downcast means only a little sad, with your head hanging for a minute. Devastated means so crushed by sadness that you cannot do anything at all. Miserable means very unhappy, so unhappy that nothing feels good. Drag the four words into order, from the smallest sadness to the biggest." },
      hint: { audio: `${Q}/c-3-sequence-sad-dial-hint.mp3`, script: "A one-minute frown goes first, and a sadness that stops you from doing anything goes last." },
      explain: { audio: `${Q}/c-3-sequence-sad-dial-explain.mp3`, script: "The dial climbs by size. Downcast is a little sad, miserable is very unhappy, heartbroken is deep sadness over a loss, and devastated is so crushed that you cannot do anything." },
      interaction: { type: "sequence", items: [{ id: "downcast", label: "downcast" }, { id: "miserable", label: "miserable" }, { id: "heartbroken", label: "heartbroken" }, { id: "devastated", label: "devastated" }], order: ["downcast","miserable","heartbroken","devastated"], coachWrong: "Ask how big the sadness is in each word, and climb from a little sad to completely crushed." },
    },
    {
      id: "c-4-sort-sure-or-feeling",
      band: "core",
      difficulty: 4,
      prompt: "Sort: Sure Words or Feeling Words.",
      narration: { audio: `${Q}/c-4-sort-sure-or-feeling.mp3`, script: "Six new words are on your screen. Some tell how sure a person is, and some tell what a person feels inside. For each word, ask whether it is about proof or about a feeling. Drag the words about proof to Sure Words, and drag the words about feelings to Feeling Words." },
      hint: { audio: `${Q}/c-4-sort-sure-or-feeling-hint.mp3`, script: "A sure word could sit on the dial from no clue to proof in hand. A feeling word tells what is happening inside." },
      explain: { audio: `${Q}/c-4-sort-sure-or-feeling-explain.mp3`, script: "Expected, had a hunch, and was convinced tell how sure a person is, so they are sure words. Petrified, gleeful, and cranky tell what a person feels inside, so they are feeling words." },
      interaction: { type: "sort", buckets: ["Sure Words","Feeling Words"], bucketAudio: { "Sure Words": `${Q}/b-sure-words.mp3`, "Feeling Words": `${Q}/b-feeling-words.mp3` }, items: [{ label: "expected", bucket: "Sure Words" }, { label: "petrified", bucket: "Feeling Words" }, { label: "had a hunch", bucket: "Sure Words" }, { label: "gleeful", bucket: "Feeling Words" }, { label: "was convinced", bucket: "Sure Words" }, { label: "cranky", bucket: "Feeling Words" }], coachWrong: "Ask what that word is about. Does it tell how much proof someone has, or how they feel inside?" },
    },
    {
      id: "c-5-neighbor-figured",
      band: "core",
      difficulty: 5,
      prompt: "Which clue fits figured, not was certain?",
      narration: { audio: `${Q}/c-5-neighbor-figured.mp3`, script: "Figured and was certain sit side by side at the top of the sure dial, and the difference between them is proof. Four clues from the afternoon are on your screen, and each one fits a different spot on the dial. Tap the clue that fits figured, and not was certain." },
      hint: { audio: `${Q}/c-5-neighbor-figured-hint.mp3`, script: "Figured needs a strong clue without seeing it. Was certain needs your own eyes. Find the strong clue that nobody saw happen." },
      explain: { audio: `${Q}/c-5-neighbor-figured-explain.mp3`, script: "The prints matching his boots fits figured, because it is a strong clue that Harriet worked out without seeing anybody walk in. Seeing him track mud in means she was certain, one smudge is only a guess, and nothing to go on means she had no idea." },
      interaction: { type: "choose", options: [{ id: "the-prints-matched-his-boots", label: "the prints matched his boots" }, { id: "she-saw-him-track-mud-in", label: "she saw him track mud in" }, { id: "one-smudge-near-the-door", label: "one smudge near the door" }, { id: "nothing-to-go-on-yet", label: "nothing to go on yet" }], correctId: "the-prints-matched-his-boots", coachWrong: "That clue fits a different spot. Figured is a strong clue that was worked out, not seen and not a lone smudge." },
    },
    {
      id: "c-6-speak-guessed-certain",
      band: "core",
      difficulty: 6,
      prompt: "Tell the difference between guessed and was certain. Use a clue.",
      narration: { audio: `${Q}/c-6-speak-guessed-certain.mp3`, script: "Guessed and was certain sit on the same dial, but far apart. Tap the mic and tell me the difference between them. Say what a person has when they guess, and what a person has when they are certain. A clue from the muddy prints or from your own life will help." },
      hint: { audio: `${Q}/c-6-speak-guessed-certain-hint.mp3`, script: "Your answer talks about proof. One word has almost none, and the other has the proof in hand." },
      explain: { audio: `${Q}/c-6-speak-guessed-certain-explain.mp3`, script: "One answer could be, when you guess you have almost no clue, but when you are certain you saw it or you hold the proof, like watching Rupert walk in wearing the muddy boots." },
      interaction: { type: "speak", text: "guessed guess guessing certain sure surer proof clue clues saw seen see eyes evidence know knew nothing little small maybe picked pick think thought sure boots prints mud watched more less" },
    },
    {
      id: "h-1-firmly-dial-insisted",
      band: "harder",
      difficulty: 1,
      prompt: "How firmly did Rupert say it?",
      narration: { audio: `${Q}/h-1-firmly-dial-insisted.mp3`, script: "Here is a fourth grade dial, and it measures how firmly a person says something. Hinted is the lowest spot, when you only point at the idea and never say it straight. Mentioned is one step up, when you say it once, in passing, and move on. Stated is higher, when you say it plainly and clearly so nobody can miss it. Insisted is the top of the dial, when you say it firmly, again and again, and will not back down. Now the moment. Rupert crossed his arms and said the prints were not his, then said it again louder, and then said he would say it a hundred times if he had to. Four words from the new dial are on your screen. Tap the word that fits how firmly Rupert said it." },
      hint: { audio: `${Q}/h-1-firmly-dial-insisted-hint.mp3`, script: "Rupert said it three times and would not back down. Find the top of the dial." },
      explain: { audio: `${Q}/h-1-firmly-dial-insisted-explain.mp3`, script: "Insisted fits, because Rupert said it again and again and would not back down. Stated is plain and clear but only once, mentioned is in passing, and hinted never says it straight." },
      interaction: { type: "choose", options: [{ id: "hinted", label: "hinted" }, { id: "mentioned", label: "mentioned" }, { id: "stated", label: "stated" }, { id: "insisted", label: "insisted" }], correctId: "insisted", coachWrong: "Count how many times he said it and how hard he held on. That is not once, and it is not in passing." },
    },
    {
      id: "h-2-firmly-hinted",
      band: "harder",
      difficulty: 2,
      prompt: "How firmly did Harriet say it?",
      narration: { audio: `${Q}/h-2-firmly-hinted.mp3`, script: "The same dial is on your screen, from pointing at an idea without saying it, up to saying it again and again. Here is the moment. Harriet looked at the boots, looked at Rupert, and said in a quiet voice that somebody might want to check the mat by the back door, and she never once said his name. Tap the word that fits how firmly Harriet said it." },
      hint: { audio: `${Q}/h-2-firmly-hinted-hint.mp3`, script: "Harriet never said the idea straight out. She only pointed at it. Find the bottom of the dial." },
      explain: { audio: `${Q}/h-2-firmly-hinted-explain.mp3`, script: "Hinted fits, because Harriet only pointed at the idea, the mat by the back door, and never said straight out that Rupert made the prints." },
      interaction: { type: "choose", options: [{ id: "hinted", label: "hinted" }, { id: "mentioned", label: "mentioned" }, { id: "stated", label: "stated" }, { id: "insisted", label: "insisted" }], correctId: "hinted", coachWrong: "Ask whether she said the idea straight out. She did not, so find the word for only pointing at it." },
    },
    {
      id: "h-3-neighbor-stated",
      band: "harder",
      difficulty: 3,
      prompt: "Which clue fits stated, not insisted?",
      narration: { audio: `${Q}/h-3-neighbor-stated.mp3`, script: "Stated and insisted are neighbors on the firmly dial, and the difference between them is how many times you say it and how hard you hold on. Four clues about Rupert are on your screen, and each one fits a different spot on the dial. Tap the clue that fits stated, and not insisted." },
      hint: { audio: `${Q}/h-3-neighbor-stated-hint.mp3`, script: "Stated is plain and clear, but said one time. Insisted is said over and over." },
      explain: { audio: `${Q}/h-3-neighbor-stated-explain.mp3`, script: "Saying it once, plainly, fits stated. Saying it again and again is insisted, only pointing at the boots is hinted, and saying it once, in passing, is mentioned." },
      interaction: { type: "choose", options: [{ id: "said-it-once-plainly", label: "said it once, plainly" }, { id: "said-it-again-and-again", label: "said it again and again" }, { id: "only-pointed-at-the-boots", label: "only pointed at the boots" }, { id: "said-it-once-in-passing", label: "said it once, in passing" }], correctId: "said-it-once-plainly", coachWrong: "That clue fits a different spot. Stated is clear and plain, said one time, not over and over, and not in passing." },
    },
    {
      id: "h-4-speak-mentioned-insisted",
      band: "harder",
      difficulty: 4,
      prompt: "Tell the difference between mentioned and insisted. Use a clue.",
      narration: { audio: `${Q}/h-4-speak-mentioned-insisted.mp3`, script: "Last one, and you explain the new dial. Mentioned and insisted sit on the firmly dial, but far apart. Tap the mic and tell me the difference between them. Say how a person talks when they mention something, and how a person talks when they insist on it. A clue from Rupert and the boots or from your own life will help." },
      hint: { audio: `${Q}/h-4-speak-mentioned-insisted-hint.mp3`, script: "Your answer talks about how many times it is said and how hard the person holds on." },
      explain: { audio: `${Q}/h-4-speak-mentioned-insisted-explain.mp3`, script: "One answer could be, when you mention something you say it once in passing and move on, but when you insist you say it again and again and will not back down, like Rupert saying the prints were not his three times." },
      interaction: { type: "speak", text: "mentioned mention insisted insist insisting once passing quickly again repeated repeat firmly firm loud louder times twice three hundred back down give gave up plain plainly said says say hold held would not stubborn calm" },
    },
  ],
};
