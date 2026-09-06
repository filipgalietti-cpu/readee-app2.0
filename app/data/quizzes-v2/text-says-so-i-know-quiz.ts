import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Text Says, So I Know QUIZ (RL.4.1) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second story,
// "The Substitute" (Mr. Falk, a tall quiet man with a gray beard, takes Room
// Twelve while Mrs. Duarte's ankle heals; he reads the attendance list without
// looking up and is still digging for the class book when the bell rings;
// Renata in the front row slides her own copy across his desk without a word;
// by Wednesday even the twins in the back row stop kicking their chairs to
// listen; a folded paper with a tiny thank you appears on Renata's desk while
// he wipes the board and does not turn around; Mrs. Duarte comes back on
// crutches, his coat is gone, the class book lies on the desk with the page
// marked, and Renata's copy is back in her bag with a new bookmark). The story
// is spoken page by page INSIDE the questions so every Q is self-contained;
// two sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere in the quiz (page three's first sentence in e-4, the last sentence
// of page five in h-3). Bands: easier(G3-bridge explicit who / what / how at
// 3 options, picture support only where the picture is the evidence, plus a
// one-sentence read-aloud) / core(on-grade G4: explicit vs inference, the
// supported inference, BEST evidence among four true details, a six-item
// Supported / Not Supported sort with b-* bucket clips, the second detail
// that strengthens an inference, and a production speak in the "the text
// says, so I can tell" shape with a full accept list) / harder(G5 transfer,
// RL.5.1 QUOTING ACCURATELY: taught in h-1 on page two, then applied to page
// one; applied again to the words that back an inference on page four; the
// last sentence read aloud; a closing production speak that quotes exact
// words then states the inference). Nothing from the lesson story (Mirela,
// Grandma Hester, the bottles) is reused. Names + setting grep-swept vs
// lessons-v2 + quizzes-v2: Falk, Duarte, Renata, Lucian, Room Twelve,
// substitute, attendance, crutches-as-plot all 0 hits. Quiz support images
// live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/text-says-so-i-know-quiz";
const IMG = (w: string) => `/images/lessons-v2/text-says-so-i-know/${w.toLowerCase()}.png`;

export const textSaysSoIKnowQuiz: QuizDef = {
  id: "text-says-so-i-know-quiz",
  lessonId: "text-says-so-i-know",
  title: "Text Says, So I Know Quiz",
  standard: "RL.4.1",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-who-at-the-front",
      band: "easier",
      difficulty: 1,
      prompt: "Who stood at the front of Room Twelve on Monday?",
      image: IMG("quiz-first-day"),
      narration: { audio: `${Q}/e-1-who-at-the-front.mp3`, script: "Here is page one of a new story called The Substitute. Listen. On Monday morning, a tall man with a gray beard stood at the front of Room Twelve and said his name so quietly that the back row asked him to say it again. I am Mr. Falk, he said, a little louder, and I will be here until Mrs. Duarte's ankle heals. Who stood at the front of Room Twelve on Monday? Tap the answer." },
      hint: { audio: `${Q}/e-1-who-at-the-front-hint.mp3`, script: "A who question asks about a person. The page describes the person at the front of the room, and the picture shows him too." },
      explain: { audio: `${Q}/e-1-who-at-the-front-explain.mp3`, script: "The story says, a tall man with a gray beard stood at the front of Room Twelve. The tall man with the gray beard is Mr. Falk, the substitute." },
      interaction: { type: "choose", options: [{ id: "a-tall-man-with-a-gray-beard", label: "a tall man with a gray beard" }, { id: "a-girl-from-the-front-row", label: "a girl from the front row" }, { id: "a-boy-from-the-back-row", label: "a boy from the back row" }], correctId: "a-tall-man-with-a-gray-beard", coachWrong: "Look at the front of the room in the picture. Who is standing there?" },
    },
    {
      id: "e-2-what-renata-slid",
      band: "easier",
      difficulty: 2,
      prompt: "What did Renata slide across his desk?",
      image: IMG("quiz-book-slide"),
      narration: { audio: `${Q}/e-2-what-renata-slid.mp3`, script: "Page two. He read the attendance list without looking up once, and when the bell rang for reading, he was still digging through his bag for the class book. Renata, who sat in the front row, slid her own copy across his desk without a word. What did Renata slide across his desk? Tap it." },
      hint: { audio: `${Q}/e-2-what-renata-slid-hint.mp3`, script: "The picture shows it too. The girl in the front row is pushing something toward the desk." },
      explain: { audio: `${Q}/e-2-what-renata-slid-explain.mp3`, script: "The story says, Renata slid her own copy across his desk. Her own copy of the book is the answer." },
      interaction: { type: "choose", options: [{ id: "her-own-copy-of-the-book", label: "her own copy of the book" }, { id: "the-attendance-list", label: "the attendance list" }, { id: "a-folded-paper", label: "a folded paper" }], correctId: "her-own-copy-of-the-book", coachWrong: "Look at the girl in the picture. What is in her hands?" },
    },
    {
      id: "e-3-how-she-came-back",
      band: "easier",
      difficulty: 3,
      prompt: "How did Mrs. Duarte come back?",
      image: IMG("quiz-crutches"),
      narration: { audio: `${Q}/e-3-how-she-came-back.mp3`, script: "Here is the first sentence of the last page. The next Monday, Mrs. Duarte came back on crutches, and the substitute's coat was already gone from the hook by the door. How did Mrs. Duarte come back? Tap the answer." },
      hint: { audio: `${Q}/e-3-how-she-came-back-hint.mp3`, script: "A how question asks about the way something happened. The sentence tells the way she came through the door, and the picture shows it too." },
      explain: { audio: `${Q}/e-3-how-she-came-back-explain.mp3`, script: "The story says, Mrs. Duarte came back on crutches. On crutches is the answer." },
      interaction: { type: "choose", options: [{ id: "on-crutches", label: "on crutches" }, { id: "in-a-wheelchair", label: "in a wheelchair" }, { id: "with-a-cane", label: "with a cane" }], correctId: "on-crutches", coachWrong: "Look at the teacher in the doorway. What is she leaning on?" },
    },
    {
      id: "e-4-speak-read-by-wednesday",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: By Wednesday, the substitute knew every name, and he read the chapter aloud in a voice so low and steady that even the twins in the back row stopped kicking their chairs.",
      narration: { audio: `${Q}/e-4-speak-read-by-wednesday.mp3`, script: "Page three of the story begins with the sentence on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at each comma, and keep the voice low and steady the way the sentence says." },
      hint: { audio: `${Q}/e-4-speak-read-by-wednesday-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words By Wednesday." },
      explain: { audio: `${Q}/e-4-speak-read-by-wednesday-explain.mp3`, script: "The sentence tells you that by Wednesday the substitute knew every name, and that his low steady voice made even the twins in the back row stop kicking their chairs." },
      interaction: { type: "speak", text: "By Wednesday the substitute knew every name and he read the chapter aloud in a voice so low and steady that even the twins in the back row stopped kicking their chairs" },
    },
    {
      id: "c-1-which-is-inference",
      band: "core",
      difficulty: 1,
      prompt: "Three questions are explicit. Tap the inference question.",
      narration: { audio: `${Q}/c-1-which-is-inference.mp3`, script: "Page one again, and then four questions about it. Three of the questions are explicit, because the page answers them outright. One is an inference question, because no sentence answers it, and you would have to work it out from the details. Tap the inference question after you hear the page. On Monday morning, a tall man with a gray beard stood at the front of Room Twelve and said his name so quietly that the back row asked him to say it again. I am Mr. Falk, he said, a little louder, and I will be here until Mrs. Duarte's ankle heals." },
      hint: { audio: `${Q}/c-1-which-is-inference-hint.mp3`, script: "Each question needs a sentence that answers it. Three of them have one, and the fourth makes you work it out from the details." },
      explain: { audio: `${Q}/c-1-which-is-inference-explain.mp3`, script: "The inference question is why he spoke so quietly. The page says that he spoke quietly, but it never says why, so a reader has to work that out from the details." },
      interaction: { type: "choose", options: [{ id: "why-he-spoke-so-quietly", label: "why he spoke so quietly" }, { id: "what-color-his-beard-was", label: "what color his beard was" }, { id: "where-he-stood", label: "where he stood" }, { id: "whose-ankle-was-hurt", label: "whose ankle was hurt" }], correctId: "why-he-spoke-so-quietly", coachWrong: "A sentence on page one answers that one outright, so it is explicit. Find the question that no sentence answers." },
    },
    {
      id: "c-2-supported-inference",
      band: "core",
      difficulty: 2,
      prompt: "What can you tell about Mr. Falk from page two?",
      narration: { audio: `${Q}/c-2-supported-inference.mp3`, script: "Now an inference. Page two never says what is going on with Mr. Falk, but it plants details. Four inferences are on your screen, and only one of them is what the details let you know. Here is page two. He read the attendance list without looking up once, and when the bell rang for reading, he was still digging through his bag for the class book." },
      hint: { audio: `${Q}/c-2-supported-inference-hint.mp3`, script: "A teacher who is still digging for the book when the bell rings is showing you something. Ask what those details point to." },
      explain: { audio: `${Q}/c-2-supported-inference-explain.mp3`, script: "The details point to, he was not ready for the day. He never looked up from the list, and the book was still lost in his bag when reading began." },
      interaction: { type: "choose", options: [{ id: "he-was-not-ready-for-the-day", label: "he was not ready for the day" }, { id: "he-did-not-like-the-class", label: "he did not like the class" }, { id: "he-forgot-his-own-name", label: "he forgot his own name" }, { id: "he-was-in-a-hurry-to-leave", label: "he was in a hurry to leave" }], correctId: "he-was-not-ready-for-the-day", coachWrong: "Test that against the details. Reading a list without looking up and digging for a lost book, do those show that? Find the inference the details point to." },
    },
    {
      id: "c-3-best-evidence-renata",
      band: "core",
      difficulty: 3,
      prompt: "Renata is helpful. Which detail is the best evidence?",
      narration: { audio: `${Q}/c-3-best-evidence-renata.mp3`, script: "Here is the best evidence move. My inference is that Renata is a helpful person. Four details from the story are on your screen, and every one of them is true. Only one of them really supports my inference. The others are true, but they support something else, or nothing at all. Tap the best evidence after you hear the two pages the details come from. Renata, who sat in the front row, slid her own copy across his desk without a word. On Friday, Renata found a folded paper on her desk." },
      hint: { audio: `${Q}/c-3-best-evidence-renata-hint.mp3`, script: "Being helpful is something a person does for someone else. Which detail shows Renata doing something for Mr. Falk?" },
      explain: { audio: `${Q}/c-3-best-evidence-renata-explain.mp3`, script: "The best evidence is, she slid her copy across. Sitting in the front row and owning a copy are true, but sliding her book to a teacher who could not find his is the detail that shows helping." },
      interaction: { type: "choose", options: [{ id: "she-slid-her-copy-across", label: "she slid her copy across" }, { id: "she-sat-in-the-front-row", label: "she sat in the front row" }, { id: "she-had-her-own-copy", label: "she had her own copy" }, { id: "she-found-a-folded-paper", label: "she found a folded paper" }], correctId: "she-slid-her-copy-across", coachWrong: "That detail is true, but ask what it supports. Where she sat and what she owned do not show helping. Which detail shows her doing something for him?" },
    },
    {
      id: "c-4-sort-supported",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Supported, or Not Supported?",
      narration: { audio: `${Q}/c-4-sort-supported.mp3`, script: "Six inferences about the story are on your screen. If a detail on a page backs one up, drag it to Supported. If no detail backs it up, or a detail points the other way, drag it to the other bucket, Not Supported. Here are the details to test them against. On Monday, Mr. Falk said his name so quietly that the back row asked him to say it again, and he read the attendance list without looking up. Renata slid her own copy of the book across his desk. By Wednesday, even the twins in the back row had stopped kicking their chairs to listen to him read. On Friday, Renata found a folded paper on her desk with two tiny words inside, thank you, and Mr. Falk, wiping the board, did not turn around." },
      hint: { audio: `${Q}/c-4-sort-supported-hint.mp3`, script: "One at a time, hunt for the detail behind each inference in what you just heard. No detail, or a detail that points the other way, means not supported." },
      explain: { audio: `${Q}/c-4-sort-supported-explain.mp3`, script: "Renata is kind to him, he was nervous on Monday, and the class listened to him all have details behind them, the book she slid over, the quiet voice and the list, and the twins who stopped kicking. Nothing in the story shows the class hating him, Renata being new, or him teaching them before." },
      interaction: { type: "sort", buckets: ["Supported","Not Supported"], bucketAudio: { "Supported": `${Q}/b-supported.mp3`, "Not Supported": `${Q}/b-not-supported.mp3` }, items: [{ label: "renata is kind to him", bucket: "Supported" }, { label: "the class hated him", bucket: "Not Supported" }, { label: "he was nervous on monday", bucket: "Supported" }, { label: "renata was new to the class", bucket: "Not Supported" }, { label: "the class listened to him", bucket: "Supported" }, { label: "he had taught them before", bucket: "Not Supported" }], coachWrong: "Hunt for the detail. If the story shows it, the inference is supported. If nothing shows it, or a detail shows the opposite, it is not." },
    },
    {
      id: "c-5-second-detail-shy",
      band: "core",
      difficulty: 5,
      prompt: "Mr. Falk is shy. Which second detail makes that stronger?",
      narration: { audio: `${Q}/c-5-second-detail-shy.mp3`, script: "Two details make an inference strong. My inference is that Mr. Falk is a shy person. My first detail is that he said his name so quietly that the back row asked him to say it again. Four more details from the story are on your screen, all of them true, and only one of them points the same way as my first detail. Tap the one that makes my inference stronger. Here is page four. On Friday, Renata found a folded paper on her desk. Inside, in letters so small that she had to hold it close, were two words, thank you, and Mr. Falk, who was wiping the board at the front, did not turn around." },
      hint: { audio: `${Q}/c-5-second-detail-shy-hint.mp3`, script: "A shy person avoids being noticed. Which detail shows Mr. Falk avoiding being noticed?" },
      explain: { audio: `${Q}/c-5-second-detail-shy-explain.mp3`, script: "The detail is, he did not turn around. Leaving a thank you note and not turning around to be thanked back points the same way as the quiet voice, so together they show a shy person." },
      interaction: { type: "choose", options: [{ id: "he-did-not-turn-around", label: "he did not turn around" }, { id: "he-had-a-gray-beard", label: "he had a gray beard" }, { id: "he-wiped-the-board", label: "he wiped the board" }, { id: "the-bell-rang-for-reading", label: "the bell rang for reading" }], correctId: "he-did-not-turn-around", coachWrong: "That detail is true, but it does not point at shyness. Which detail shows him keeping out of the way when Renata found the note?" },
    },
    {
      id: "c-6-speak-text-says-note",
      band: "core",
      difficulty: 6,
      prompt: "What does the note tell you about Mr. Falk? Say the text says, so I can tell.",
      narration: { audio: `${Q}/c-6-speak-text-says-note.mp3`, script: "Now make the whole move out loud. Page four never says why Mr. Falk left the note the way he did, but the details let you know. Tap the mic. Say, the text says, and name a detail from the page. Then say, so I can tell, and state what it lets you know about him. Here is page four. On Friday, Renata found a folded paper on her desk. Inside, in letters so small that she had to hold it close, were two words, thank you, and Mr. Falk, who was wiping the board at the front, did not turn around." },
      hint: { audio: `${Q}/c-6-speak-text-says-note-hint.mp3`, script: "The tiny letters, or his back to the room, are the details to name, and then you say what a person like that is like." },
      explain: { audio: `${Q}/c-6-speak-text-says-note-explain.mp3`, script: "One way to say it goes like this. The text says the letters were so small she had to hold the note close, and he did not turn around, so I can tell he is shy and did not want a fuss." },
      interaction: { type: "speak", text: "shy quiet grateful thankful thanks thankyou kind polite gentle humble bashful embarrassed nervous secret secretly private small tiny letters note paper folded board wiping turn around noticed attention fuss cared appreciated" },
    },
    {
      id: "h-1-accurate-quote-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Which one is an accurate quote from page one?",
      narration: { audio: `${Q}/h-1-accurate-quote-taught.mp3`, script: "Here is a fifth grade move. When you use a detail as evidence, you quote it accurately, which means you say the exact words the text uses, not words that are close. Watch me do it with page two. Page two says, he read the attendance list without looking up once. If I say, he never looked up from the list, that is close, but it is not a quote, because those are not the exact words. The accurate quote is, without looking up once. Now you. Four lines are on your screen, and each one is close to page one, but only one uses the exact words. Here is page one. On Monday morning, a tall man with a gray beard stood at the front of Room Twelve and said his name so quietly that the back row asked him to say it again." },
      hint: { audio: `${Q}/h-1-accurate-quote-taught-hint.mp3`, script: "A quote with a changed word is not an accurate quote, so match the words one by one against the page." },
      explain: { audio: `${Q}/h-1-accurate-quote-taught-explain.mp3`, script: "The accurate quote is, so quietly that the back row. Softly, the class, and in a whisper all change a word, and a quote has to keep every word the page used." },
      interaction: { type: "choose", options: [{ id: "so-quietly-that-the-back-row", label: "so quietly that the back row" }, { id: "so-softly-that-the-back-row", label: "so softly that the back row" }, { id: "so-quietly-that-the-class", label: "so quietly that the class" }, { id: "in-a-whisper-to-the-back-row", label: "in a whisper to the back row" }], correctId: "so-quietly-that-the-back-row", coachWrong: "One word in that line is not the word the page used. Match every word against the page." },
    },
    {
      id: "h-2-quote-backs-inference",
      band: "harder",
      difficulty: 2,
      prompt: "Which exact words from page four back up the inference?",
      narration: { audio: `${Q}/h-2-quote-backs-inference.mp3`, script: "Quote accurately again. My inference is that Mr. Falk did not want to be thanked in return. Four lines are on your screen. Only one of them is the exact words from page four that back up my inference. The others change a word, or say it a different way. Here is page four. On Friday, Renata found a folded paper on her desk. Inside, in letters so small that she had to hold it close, were two words, thank you, and Mr. Falk, who was wiping the board at the front, did not turn around." },
      hint: { audio: `${Q}/h-2-quote-backs-inference-hint.mp3`, script: "The words you need show him keeping his back to Renata, and every word has to match the page." },
      explain: { audio: `${Q}/h-2-quote-backs-inference-explain.mp3`, script: "The exact words are, did not turn around. One line changes turn to look, one line changes did not to never, and kept wiping the board is not on the page at all." },
      interaction: { type: "choose", options: [{ id: "did-not-turn-around", label: "did not turn around" }, { id: "did-not-look-around", label: "did not look around" }, { id: "never-turned-around", label: "never turned around" }, { id: "kept-wiping-the-board", label: "kept wiping the board" }], correctId: "did-not-turn-around", coachWrong: "That line changes a word, or it is not on the page. Find the line the page really says about him and Renata." },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: But the class book lay on the desk with a strip of paper marking the page where he had stopped, and Renata's own copy was back in her bag with a new bookmark inside it.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the story is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at each comma, and let the ending land quietly." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word But." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that the class book was left on the desk with the page marked, and that Renata's copy came back with a new bookmark inside it." },
      interaction: { type: "speak", text: "But the class book lay on the desk with a strip of paper marking the page where he had stopped and Renata's own copy was back in her bag with a new bookmark inside it" },
    },
    {
      id: "h-4-speak-quote-then-tell",
      band: "harder",
      difficulty: 4,
      prompt: "Quote the exact words that show he was not ready, then say so I can tell.",
      narration: { audio: `${Q}/h-4-speak-quote-then-tell.mp3`, script: "Last one, out loud, and this time quote accurately. Tap the mic. Say, the text says, and then say the exact words from page two that show Mr. Falk was not ready for the day. Then say, so I can tell, and finish the inference. Here is page two. He read the attendance list without looking up once, and when the bell rang for reading, he was still digging through his bag for the class book." },
      hint: { audio: `${Q}/h-4-speak-quote-then-tell-hint.mp3`, script: "The exact words come right from the page, the ones about looking up or the ones about the bag, said just as the page says them." },
      explain: { audio: `${Q}/h-4-speak-quote-then-tell-explain.mp3`, script: "One way to say it goes like this. The text says he was still digging through his bag for the class book when the bell rang, so I can tell he was not ready for the day." },
      interaction: { type: "speak", text: "without looking up once still digging through his bag bell rang class book attendance list ready unready nervous prepared unprepared flustered rushed organized disorganized copy" },
    },
  ],
};
