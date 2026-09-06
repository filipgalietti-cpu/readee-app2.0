import type { QuizDef } from "@/lib/lesson-engine/quiz";

// The Whole Fact Book QUIZ (RI.3.10) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second fact
// book, "Wires Across the Land" (the telegraph; every fact true: two hundred
// years ago news moved only as fast as a horse, a boat, or a walker, and a
// letter could take weeks to cross the country; inventors sent messages
// through a wire as electricity; the operator tapped a small metal lever
// called a key; each tap made a click at a machine in another town; a code
// of short and long clicks stood for every letter; wooden poles beside the
// railroad tracks carried the wire town after town; the message reached the
// far end in seconds, so a telegram arrived the same day; newspapers printed
// yesterday's far-off news, families sent word of a new baby, railroads kept
// two trains off the same track; the author thinks the telegraph, not the
// telephone, deserves the credit). 16 sentences over 6 pages under three
// spoken headings (Slow News / A Machine That Clicks / The World Shrinks),
// spoken page-by-page INSIDE the questions so every Q is self-contained; two
// pages are the child's to read (one page-two sentence in e-4, page six in
// h-3) and page six is never narrated (c-5 puts it on screen for a silent
// read). Bands: easier (G2-bridge how / who / what at 3 options with picture
// support, plus a one-sentence read-aloud) / core (one question per RI tool
// on the new book: proving line RI.3.1, the heading as a finding tool RI.3.5,
// a page-to-page connection RI.3.8, an everyday word with an expert meaning
// RI.3.4, the author's view RI.3.6, and the big idea RI.3.2 as a production
// speak) / harder (G4 transfer, RI.4.10-adjacent: holding two parts of the
// text together for one inference, MODELED in h-1 on pages one and four, then
// applied to page three, applied again to pages four and five, a two-sentence
// read-aloud, and a closing production speak on the reader's own view).
// Nothing from the lesson book (scribes, movable type, the press) is reused.
// Names + topic grep-swept vs lessons-v2 + quizzes-v2: telegraph, telegram,
// operator, key-as-lever, outrun all 0 hits. Quiz support images live in the
// lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/the-whole-fact-book-quiz";
const IMG = (w: string) => `/images/lessons-v2/the-whole-fact-book/${w.toLowerCase()}.png`;

export const theWholeFactBookQuiz: QuizDef = {
  id: "the-whole-fact-book-quiz",
  lessonId: "the-whole-fact-book",
  title: "The Whole Fact Book Quiz",
  standard: "RI.3.10",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-how-a-letter-traveled",
      band: "easier",
      difficulty: 1,
      prompt: "How did a letter travel two hundred years ago?",
      image: IMG("quiz-mail-rider"),
      narration: { audio: `${Q}/e-1-how-a-letter-traveled.mp3`, script: "Here is a new fact book called Wires Across the Land, and every fact in it is true. Its first heading is Slow News. Listen to page one. Two hundred years ago, news could travel only as fast as a person could carry it. A letter went by horse, by boat, or on foot, and a message sent from one side of the country could take weeks to reach the other side. How did a letter travel two hundred years ago? Tap it." },
      hint: { audio: `${Q}/e-1-how-a-letter-traveled-hint.mp3`, script: "The picture shows one way a letter traveled, and page one says news went only as fast as a person could carry it." },
      explain: { audio: `${Q}/e-1-how-a-letter-traveled-explain.mp3`, script: "A letter went by horse. Page one says a letter went by horse, by boat, or on foot, and the picture shows a rider carrying one." },
      interaction: { type: "choose", options: [{ id: "by-horse", label: "by horse" }, { id: "by-airplane", label: "by airplane" }, { id: "by-wire", label: "by wire" }], correctId: "by-horse", coachWrong: "Look at the picture. Page one says a person had to carry the letter, so it could only go as fast as that person could travel." },
    },
    {
      id: "e-2-who-worked-the-machine",
      band: "easier",
      difficulty: 2,
      prompt: "Who worked the telegraph?",
      image: IMG("quiz-operator-key"),
      narration: { audio: `${Q}/e-2-who-worked-the-machine.mp3`, script: "Here is page two of Wires Across the Land, under the heading A Machine That Clicks. Then inventors found a way to send messages through a wire, using electricity. They called the machine a telegraph, and the person who worked it was called an operator. The operator sat at a desk and tapped a small metal lever called a key. Who worked the telegraph? Tap the name the book gives." },
      hint: { audio: `${Q}/e-2-who-worked-the-machine-hint.mp3`, script: "The picture shows the person at the desk, and page two names that person right after it names the machine." },
      explain: { audio: `${Q}/e-2-who-worked-the-machine-explain.mp3`, script: "The person who worked the telegraph was called an operator. Page two says so, and the picture shows the operator at the desk." },
      interaction: { type: "choose", options: [{ id: "an-operator", label: "an operator" }, { id: "a-scribe", label: "a scribe" }, { id: "a-rider", label: "a rider" }], correctId: "an-operator", coachWrong: "Listen again for the name page two gives to the person who worked the machine." },
    },
    {
      id: "e-3-what-carried-the-message",
      band: "easier",
      difficulty: 3,
      prompt: "What carried the message from town to town?",
      image: IMG("quiz-wire-poles"),
      narration: { audio: `${Q}/e-3-what-carried-the-message.mp3`, script: "Here is the first sentence of page four of Wires Across the Land, under the heading The World Shrinks. Workers set up wooden poles beside the railroad tracks and strung the wire from pole to pole, town after town. What carried the message from town to town? Tap it." },
      hint: { audio: `${Q}/e-3-what-carried-the-message-hint.mp3`, script: "The tracks are in the picture too, but the sentence tells you what the workers strung from pole to pole." },
      explain: { audio: `${Q}/e-3-what-carried-the-message-explain.mp3`, script: "A wire carried the message. Page four says the workers strung the wire from pole to pole, town after town, beside the tracks." },
      interaction: { type: "choose", options: [{ id: "a-wire-on-poles", label: "a wire on poles" }, { id: "a-train-on-tracks", label: "a train on tracks" }, { id: "a-boat-on-a-river", label: "a boat on a river" }], correctId: "a-wire-on-poles", coachWrong: "The tracks are only where the workers stood. Listen for what they strung from pole to pole." },
    },
    {
      id: "e-4-speak-read-the-key",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: If a family moved far away, the people they left behind might not hear from them for months.",
      narration: { audio: `${Q}/e-4-speak-read-the-key.mp3`, script: "The sentence on your screen comes from page one of Wires Across the Land. Tap the mic and read it out loud at a talking pace, with a rest at the comma and a stop at the period." },
      hint: { audio: `${Q}/e-4-speak-read-the-key-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words If a family." },
      explain: { audio: `${Q}/e-4-speak-read-the-key-explain.mp3`, script: "The sentence tells you that when a family moved far away, the people they left behind might wait for months before they heard any news." },
      interaction: { type: "speak", text: "If a family moved far away the people they left behind might not hear from them for months" },
    },
    {
      id: "c-1-proof-line-seconds",
      band: "core",
      difficulty: 1,
      prompt: "Why did the message reach the far end of the wire in seconds? Tap the line that proves it.",
      narration: { audio: `${Q}/c-1-proof-line-seconds.mp3`, script: "First tool. Answer, then point to the line. Listen to page four of Wires Across the Land, then answer this question in your head. Why did the message reach the far end of the wire in seconds? Four lines from page four are on your screen, and all four are really there. Tap the line that proves your answer. Here is page four. Workers set up wooden poles beside the railroad tracks and strung the wire from pole to pole, town after town. Because the message traveled as electricity, it reached the far end of the wire in seconds, no matter how far away that was. A letter still took weeks by horse, but a telegram, a message sent by telegraph, arrived the same day." },
      hint: { audio: `${Q}/c-1-proof-line-seconds-hint.mp3`, script: "The answer is a reason, and the reason sits right after the word because." },
      explain: { audio: `${Q}/c-1-proof-line-seconds-explain.mp3`, script: "The proving line is, traveled as electricity. Page four says that because the message traveled as electricity, it reached the far end of the wire in seconds." },
      interaction: { type: "choose", options: [{ id: "traveled-as-electricity", label: "traveled as electricity" }, { id: "beside-the-railroad-tracks", label: "beside the railroad tracks" }, { id: "from-pole-to-pole", label: "from pole to pole" }, { id: "took-weeks-by-horse", label: "took weeks by horse" }], correctId: "traveled-as-electricity", coachWrong: "That line is really on page four, but it answers a different question. Find the line that comes right after the word because." },
    },
    {
      id: "c-2-which-heading",
      band: "core",
      difficulty: 2,
      prompt: "You want to find out how the code of clicks worked. Which heading do you jump to?",
      narration: { audio: `${Q}/c-2-which-heading.mp3`, script: "Second tool. A heading is a tool for finding. Wires Across the Land has three parts, and each part starts with a heading. The first heading is Slow News. The second heading is A Machine That Clicks. The third heading is The World Shrinks. Suppose you want to find out how the code of short and long clicks worked, and you do not want to read the whole book. Three headings and one more choice are on your screen. Tap the heading that would take you straight to that part." },
      hint: { audio: `${Q}/c-2-which-heading-hint.mp3`, script: "Match the key words of your question, code and clicks, to the heading that names the machine." },
      explain: { audio: `${Q}/c-2-which-heading-explain.mp3`, script: "The heading is A Machine That Clicks. That part of the book tells how the key, the clicks, and the code work, so a reader who wants the code jumps straight there." },
      interaction: { type: "choose", options: [{ id: "a-machine-that-clicks", label: "A Machine That Clicks" }, { id: "slow-news", label: "Slow News" }, { id: "the-world-shrinks", label: "The World Shrinks" }, { id: "read-every-page", label: "read every page" }], correctId: "a-machine-that-clicks", coachWrong: "Think about what the code of clicks is part of, then match that idea to a heading. Reading every page is the slow way, not the search." },
    },
    {
      id: "c-3-page-five-connection",
      band: "core",
      difficulty: 3,
      prompt: "How does the first sentence of page five connect to page four?",
      narration: { audio: `${Q}/c-3-page-five-connection.mp3`, script: "Third tool. The first sentence of a new page often reaches back to the page before it, and a small word shows how. Four kinds of connection are on your screen, and you will tap the kind that joins the first sentence of page five to page four. Page four ended by saying that a telegram arrived the same day. Here is the first sentence of page five. So newspapers printed stories about things that had happened far away the day before, instead of the month before." },
      hint: { audio: `${Q}/c-3-page-five-connection-hint.mp3`, script: "Look at the very first word of page five. Does it tell why, tell when, or set two things against each other?" },
      explain: { audio: `${Q}/c-3-page-five-connection-explain.mp3`, script: "The connection is cause and effect, and the word so shows it. Because a telegram arrived the same day, newspapers could print news from the day before." },
      interaction: { type: "choose", options: [{ id: "cause-and-effect", label: "cause and effect" }, { id: "comparison", label: "comparison" }, { id: "sequence", label: "sequence" }, { id: "no-connection", label: "no connection" }], correctId: "cause-and-effect", coachWrong: "Ask what the first sentence of page five does with page four. Does it tell what happened because of it, tell the order, or set two things side by side?" },
    },
    {
      id: "c-4-expert-word-key",
      band: "core",
      difficulty: 4,
      prompt: "What does key mean in this book?",
      narration: { audio: `${Q}/c-4-expert-word-key.mp3`, script: "Fourth tool. Page two used a word you already know, key, and gave it an expert meaning, with the support in the same sentence. Four meanings are on your screen, and you will tap the one this book gives. Here is the sentence once more. The operator sat at a desk and tapped a small metal lever called a key." },
      hint: { audio: `${Q}/c-4-expert-word-key-hint.mp3`, script: "The everyday meaning does not fit a telegraph desk. Look at the words right before the word called." },
      explain: { audio: `${Q}/c-4-expert-word-key-explain.mp3`, script: "In this book a key is a lever the operator taps. The words right before called tell you so, and the everyday key that opens a lock does not fit." },
      interaction: { type: "choose", options: [{ id: "a-lever-the-operator-taps", label: "a lever the operator taps" }, { id: "a-tool-that-opens-a-lock", label: "a tool that opens a lock" }, { id: "a-wire-strung-on-poles", label: "a wire strung on poles" }, { id: "a-note-played-on-a-piano", label: "a note played on a piano" }], correctId: "a-lever-the-operator-taps", coachWrong: "Test that meaning against the sentence. Could an operator sit at a desk and tap that? Look right before the word called." },
    },
    {
      id: "c-5-author-view-credit",
      band: "core",
      difficulty: 5,
      prompt: "Page six: Some people say the telephone changed the world more than the telegraph ever did. I think the telegraph deserves the credit, because it was the first machine that let a message outrun the fastest horse.",
      narration: { audio: `${Q}/c-5-author-view-credit.mp3`, script: "Fifth tool. The last page of Wires Across the Land is on your screen, and it is yours to read to yourself. The author names what some people say, and then gives a view of their own. Read page six, then look at the four views on your screen. Tap the author's view. Your own view can be different." },
      hint: { audio: `${Q}/c-5-author-view-credit-hint.mp3`, script: "The author says what some people think, and then says, I think. The view after those words is the author's." },
      explain: { audio: `${Q}/c-5-author-view-credit-explain.mp3`, script: "The author thinks the telegraph deserves the credit, because it was the first machine that let a message outrun the fastest horse." },
      interaction: { type: "choose", options: [{ id: "telegraph-deserves-credit", label: "telegraph deserves credit" }, { id: "telephone-deserves-credit", label: "telephone deserves credit" }, { id: "horses-deserve-the-credit", label: "horses deserve the credit" }, { id: "nobody-deserves-the-credit", label: "nobody deserves the credit" }], correctId: "telegraph-deserves-credit", coachWrong: "Read the last sentence again. The author names what some people say, and then disagrees with them. Which view is the author's own?" },
    },
    {
      id: "c-6-speak-big-idea",
      band: "core",
      difficulty: 6,
      prompt: "Say the big idea of Wires Across the Land, then one detail that backs it up.",
      narration: { audio: `${Q}/c-6-speak-big-idea.mp3`, script: "Here is the whole book in short. Two hundred years ago, news traveled only as fast as a horse. Then the telegraph sent messages through a wire as electricity, and a telegram arrived the same day. Newspapers, families, and railroads all used it. Tap the mic. Say the big idea of the whole book in one sentence, in your own words. Then say, the text says, and give one detail that backs it up." },
      hint: { audio: `${Q}/c-6-speak-big-idea-hint.mp3`, script: "The big idea is about how fast news could travel after the telegraph, and the detail can come from any page." },
      explain: { audio: `${Q}/c-6-speak-big-idea-explain.mp3`, script: "One way to say it goes like this. The telegraph let news travel across the country in seconds instead of weeks. The text says a telegram arrived the same day, while a letter still took weeks by horse." },
      interaction: { type: "speak", text: "telegraph telegram wire wires electricity message messages news fast faster quickly quick seconds minutes same day horse horses weeks operator key click clicks code letter letters far away closer shrink shrank world changed railroad trains newspapers families" },
    },
    {
      id: "h-1-two-parts-operator",
      band: "harder",
      difficulty: 1,
      prompt: "Hold two parts of page three together. Why did the far end of the wire need an operator of its own?",
      narration: { audio: `${Q}/h-1-two-parts-operator.mp3`, script: "Here is a fourth grade move. Sometimes one page cannot answer a question alone, so a reader holds two parts of the book together. Watch me do it. Page one says a message could take weeks to cross the country. Page four says a telegram arrived the same day. Neither page says why the last heading is The World Shrinks, but together they do. When news that took weeks arrives in a day, far away places feel close. Now you try it. Page three says that every tap sent a burst of electricity down the wire to a machine in another town, where it made a click. Page three also says that an operator who knew the code could spell out a whole message, letter by letter. Hold those two parts together. Why did the town at the far end of the wire need an operator of its own? Tap it." },
      hint: { audio: `${Q}/h-1-two-parts-operator-hint.mp3`, script: "The machine at the far end only makes clicks. Think about who can turn clicks back into letters." },
      explain: { audio: `${Q}/h-1-two-parts-operator-explain.mp3`, script: "The answer is, someone must read the clicks. The far machine only clicked, and only an operator who knew the code could turn those clicks back into a message." },
      interaction: { type: "choose", options: [{ id: "someone-must-read-the-clicks", label: "someone must read the clicks" }, { id: "someone-must-hold-the-wire", label: "someone must hold the wire" }, { id: "someone-must-feed-the-horse", label: "someone must feed the horse" }, { id: "someone-must-paint-the-poles", label: "someone must paint the poles" }], correctId: "someone-must-read-the-clicks", coachWrong: "Put the two parts together. The far machine makes clicks, and clicks are not words yet. Who turns them into a message?" },
    },
    {
      id: "h-2-two-pages-trains",
      band: "harder",
      difficulty: 2,
      prompt: "Hold pages four and five together. Why could a telegraph keep two trains apart when a letter could not?",
      narration: { audio: `${Q}/h-2-two-pages-trains.mp3`, script: "Hold two pages together again. Page four says that because the message traveled as electricity, it reached the far end of the wire in seconds. Page five says that railroads used the telegraph to keep two trains from meeting on the same track. Neither page says why a letter could not do that job, but together they do. Why could a telegraph keep two trains apart when a letter could not? Tap it." },
      hint: { audio: `${Q}/h-2-two-pages-trains-hint.mp3`, script: "Think about how long a letter took to arrive, and how long a train takes to reach the next town." },
      explain: { audio: `${Q}/h-2-two-pages-trains-explain.mp3`, script: "The answer is, the warning arrived in time. A letter took weeks, but a telegram reached the next station in seconds, before the two trains could meet." },
      interaction: { type: "choose", options: [{ id: "the-warning-arrived-in-time", label: "the warning arrived in time" }, { id: "letters-cost-too-much-money", label: "letters cost too much money" }, { id: "trains-ran-only-at-night", label: "trains ran only at night" }, { id: "the-poles-blocked-the-tracks", label: "the poles blocked the tracks" }], correctId: "the-warning-arrived-in-time", coachWrong: "Put the two pages together. A train moves faster than a letter, but a telegram moves faster than both. What does that let the railroad do?" },
    },
    {
      id: "h-3-speak-read-page-six",
      band: "harder",
      difficulty: 3,
      prompt: "Read page six: Some people say the telephone changed the world more than the telegraph ever did. I think the telegraph deserves the credit, because it was the first machine that let a message outrun the fastest horse.",
      narration: { audio: `${Q}/h-3-speak-read-page-six.mp3`, script: "Page six of the book is on your screen, and it is two sentences long. Tap the mic. Read both sentences out loud at a talking pace. Rest at each period, and let the author's opinion in the last sentence come through in your voice." },
      hint: { audio: `${Q}/h-3-speak-read-page-six-hint.mp3`, script: "The mic sits under the page, and the first sentence begins with the words Some people." },
      explain: { audio: `${Q}/h-3-speak-read-page-six-explain.mp3`, script: "The page tells you that some people give the credit to the telephone, and that the author gives it to the telegraph, because it was the first machine that let a message outrun a horse." },
      interaction: { type: "speak", text: "Some people say the telephone changed the world more than the telegraph ever did I think the telegraph deserves the credit because it was the first machine that let a message outrun the fastest horse" },
    },
    {
      id: "h-4-speak-your-view",
      band: "harder",
      difficulty: 4,
      prompt: "Does the telegraph deserve the credit? Say your view, whether it matches the author's, and one reason.",
      narration: { audio: `${Q}/h-4-speak-your-view.mp3`, script: "Last one, out loud, and this time the view is yours. The author thinks the telegraph deserves the credit for shrinking the world, because it was the first machine that let a message outrun the fastest horse. Tap the mic. Say what you think, say whether that matches the author or is different, then give one reason, from the book or from your own life. Start with, I think." },
      hint: { audio: `${Q}/h-4-speak-your-view-hint.mp3`, script: "Your view can agree with the author or not, but it needs a reason, and the book is full of them." },
      explain: { audio: `${Q}/h-4-speak-your-view-explain.mp3`, script: "One way to say it goes like this. I think the telegraph deserves the credit, and that matches the author, because it was the first machine that carried a message faster than a horse. Another reader could pick the telephone, because a voice tells more than clicks." },
      interaction: { type: "speak", text: "agree disagree different same match matches author think telegraph telephone first fast faster message messages horse horses wire seconds weeks day talk voice hear phone call letter letters news family families trains credit important changed world outrun clicks" },
    },
  ],
};
