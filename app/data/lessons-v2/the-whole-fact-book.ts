import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-whole-fact-book-timings.json";

// The Whole Fact Book (RI.3.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-whole-fact-book
// G3-U4. THE GRADE 3 INFORMATIONAL CAPSTONE (precedent: read-to-learn RI.2.10,
// Up in a Balloon, thirteen sentences over five pages with the G2 toolbox;
// twin of the-whole-chapter RL.3.10). No new skill. The child reads ONE
// longer, harder TRUE fact book at the high end of the grades 2-3 band, with
// a history flavor, mostly in their own voice, and applies the G3 RI toolbox
// between the pages, a different tool each time and none of them taught
// here: the proving line (point-to-the-fact RI.3.1), the connection between
// two sentences (sentence-to-sentence RI.3.8), an expert word from its
// in-text support (expert-words RI.3.4), the big idea of the whole book
// (big-idea-backed-up RI.3.2), and the author's view held apart from the
// reader's own (the-authors-view RI.3.6); the spoken headings as a tool for
// finding (search-like-a-pro RI.3.5) live in the hook and model narrations,
// the picture combined with the words (maps-and-photos RI.3.7) lives in the
// page-four narration, and the book's time order (because-then-so RI.3.3)
// lives in the sequence beat. Then an In the Text / Not in the Text sort of
// facts that are all true in the world, a five-step sequence, and a
// production speak (big idea plus one detail). ONE original informational
// text, "The Machine That Made Books" (every fact true: before printing every
// book was copied by hand by a scribe at a slanted desk, one letter at a
// time, a thick book took about a year and cost more than most families
// earned in that time, so most people never owned a book or learned to read;
// more than five hundred years ago a metal worker in Germany built the press:
// a small metal block per letter with the letter raised like a rubber stamp,
// blocks lined up in a frame to spell a page and taken apart after printing,
// the set called movable type, ink dabbed on, damp paper, a heavy wooden
// screw, hundreds of copies of a page in a day against a scribe's page or
// two; the price fell until ordinary families could afford a book, printing
// shops in cities across Europe within fifty years and millions of books,
// more people learned to read and ideas spread), 16 sentences over 6
// child-read pages under three spoken headings (Books by Hand, The Press at
// Work, A World of Readers): read-along 1 and 4 with images, accept-mode
// speaks 2/3/5/6 at 41/54/43/53 tokens (no " my " token), compound + early-
// complex sentences, one comparison pair joined by unlike, one cause pair
// joined by because, stretch words scribe / rare / movable type / afford
// with in-text support, no digits, no contractions, no real person named, and
// an author with a mild view on the last page ("I believe no machine has
// ever mattered more"). ANCHOR FRESHNESS grep-swept vs every lessons-v2 +
// quizzes-v2 file: printing press, scribe, movable type, Germany, slanted
// desk, wine press, rags, soot all 0 hits as topics (press only ever a verb,
// type only ever a kind). Keys prefixed quiz- are picture supports for the
// quiz's all-fresh telegraph text (telegraph, telegram, operator, key,
// railroad poles: all 0 hits as a topic).

const A = (id: string) => `/audio/lessons-v2/the-whole-fact-book/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-whole-fact-book/${w.toLowerCase()}.png`;

export const theWholeFactBookImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A quiet stone room lit by one tall candle, a scribe with pale skin and short gray hair in a plain brown robe sitting on a stool at a tall slanted wooden writing desk, holding a white feather quill pen above a large open book whose thick cream pages are completely blank, a small clay pot of black ink beside the book, a few closed leather books with plain blank covers on a shelf behind him, a tall narrow window showing a gray sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, the book pages completely blank, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-4": "The inside of an old wooden printing shop, a tall heavy wooden printing press with a thick vertical wooden screw in the middle and a long horizontal wooden bar sticking out sideways from the screw, a printer with brown skin and a short dark beard in a plain white shirt and a leather apron pulling the long bar toward himself with both hands, a flat wooden frame filled with tiny plain gray metal blocks lying on the bed of the press, a round leather ink pad on a wooden handle resting beside it, a stack of plain cream paper sheets on a side table, the sheets completely blank, warm light from a window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, the metal blocks plain with no letters on them, the paper completely blank, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-mail-rider": "A rider in an old fashioned wide brimmed hat and a long brown coat on a galloping brown horse along a dirt road across open rolling grassland, two plain leather saddlebags strapped behind the saddle, a wooden rail fence and a distant farmhouse, bright afternoon sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, realistic horse with no smile, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-operator-key": "An old fashioned telegraph office, a man with light brown skin and a dark mustache in a white shirt with rolled up sleeves and a dark vest sitting at a wooden desk, one finger tapping a small brass telegraph key on a wooden base, a small wooden sounder box on the desk beside it, a single wire running from the desk up the wall and out through the window, a brass oil lamp, a sheet of blank cream paper on the desk. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, the paper completely blank, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-wire-poles": "A long row of tall plain wooden poles carrying one thin wire running beside straight railroad tracks across flat open prairie toward the far horizon, a small wooden station building far in the distance, a wide blue sky with a few white clouds, no train, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
};

export const theWholeFactBook: LessonDef = {
  id: "the-whole-fact-book",
  title: "The Whole Fact Book",
  grade: "3rd Grade",
  standard: "RI.3.10",
  archetype: "inference",
  objective: "I can read a whole fact book mostly on my own, hold on to the big idea as it grows, and use every fact-reading tool I own to understand it from the first page to the last.",
  concepts: [
    "read a whole fact book, hold on to the big idea, check that each page made sense",
    "answer, then point to the proving line",
    "two sentences side by side connect in a certain way, and a word shows it",
    "an expert word gets its meaning from the support the text gives",
    "the big idea is the one sentence every page adds up to",
    "the author's view is not always your view",
    "a heading is a tool for finding, and a picture has a job the words cannot do",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Machine That Made Books from the first page to the last, and most of it was in your own voice. You pointed to the proving line, you named how two sentences connect, you worked out an expert word from its support, you found the big idea, and you held the author's view apart from your own. That is what a third grade reader does with a real fact book.",
    "title": "The Whole Fact Book",
    "body": "You read a whole fact book mostly on your own and used every fact-reading tool you own on it, from the first page to the last."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Machine That Made Books, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Today there is no new tool. Today you read one whole fact book, and most of the reading is yours. Between the pages you will use the fact-reading tools you already own, a different one each time. The book is called The Machine That Made Books, and every fact in it is true. It has three parts, and each part starts with a heading. The first heading is Books by Hand. The second heading is The Press at Work. The third heading is A World of Readers. Page one sits under the first heading, Books by Hand. Read along with me." },
      interaction: { type: "read-along", text: "Long ago, before there was any machine for making books, every book in the world was copied by hand. A person called a scribe sat at a slanted desk and wrote out each page with a pen and ink, one letter at a time. Copying one thick book could take a scribe a whole year, so a single book cost more than most families earned in all that time.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-read-hold-check",
      purpose: "model",
      gate: "none",
      prompt: "Read. Hold the big idea. Check.",
      fx: {"text":"**Read**. **Hold the big idea**. **Check**.","effect":"pop-words"},
      narration: { audio: A("model-read-hold-check"), script: "A fact book this long asks a reader for three things on every page. Read it. Hold on to the big idea as it grows. Check that the page made sense. Watch me on page one. I read it. Now I hold on to what matters. Every book was copied by hand. A scribe wrote one letter at a time. One book cost more than a family earned in a year. The big idea is only starting, but I can already feel its shape. Books were slow and costly to make. Now I check. Can I say what page one taught? Yes, so I keep going. One more thing before you read. The headings are a tool for finding. If I only wanted to know how the machine worked, the heading The Press at Work would take me straight to that part, and I could skip the rest. Today we read every part, and after each page I will ask you to use one tool. Page two is yours." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Because books were so rare and so costly, most families never owned even one, and most people never learned to read at all. Then, more than five hundred years ago, a metal worker in Germany built a machine that changed everything.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, still under the heading Books by Hand. Read both sentences out loud, and hold on to why most families never owned a book." },
      interaction: { type: "speak", text: "Because books were so rare and so costly most families never owned even one and most people never learned to read at all Then more than five hundred years ago a metal worker in Germany built a machine that changed everything" },
    },
    {
      id: "guided-choose-proof-line",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why did most families never own a book? Tap the line that proves it.",
      narration: { audio: A("guided-choose-proof-line"), script: "First tool. Answer, then point to the line. Why did most families never own even one book? Say the answer in your head. Four lines from the book are on your screen, and every one of them is really there. Only one of them proves your answer. Tap that line." },
      interaction: { type: "choose", options: [{ id: "so-rare-and-so-costly", label: "so rare and so costly" }, { id: "at-a-slanted-desk", label: "at a slanted desk" }, { id: "one-letter-at-a-time", label: "one letter at a time" }, { id: "a-metal-worker-in-germany", label: "a metal worker in Germany" }], correctId: "so-rare-and-so-costly", coachWrong: "That line is really in the book, but it answers a different question. Look for the line that comes right after the word because." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: He made a small metal block for every letter, with the letter raised on top like a rubber stamp. First, a worker lined the blocks up in a frame until they spelled out a whole page. After the page was printed, the blocks were taken apart and lined up again for the next one.",
      narration: { audio: A("page-3-read"), script: "Page three begins the second part of the book, under the heading The Press at Work. Read all three sentences out loud, and hold on to what the worker does with the blocks." },
      interaction: { type: "speak", text: "He made a small metal block for every letter with the letter raised on top like a rubber stamp First a worker lined the blocks up in a frame until they spelled out a whole page After the page was printed the blocks were taken apart and lined up again for the next one" },
    },
    {
      id: "guided-choose-connection",
      purpose: "guided",
      gate: "interaction",
      prompt: "How do the last two sentences of page three connect?",
      narration: { audio: A("guided-choose-connection"), script: "Second tool. Two sentences that sit side by side connect in a certain way, and a small word at the start of a sentence usually shows it. Four kinds of connection are on your screen, and you will tap the kind that joins the last two sentences of page three. Here they are once more. First, a worker lined the blocks up in a frame until they spelled out a whole page. After the page was printed, the blocks were taken apart and lined up again for the next one." },
      interaction: { type: "choose", options: [{ id: "sequence", label: "sequence" }, { id: "cause-and-effect", label: "cause and effect" }, { id: "comparison", label: "comparison" }, { id: "no-connection", label: "no connection" }], correctId: "sequence", coachWrong: "Look at the first word of each sentence. Do those words set two things against each other, tell why something happens, or tell when it happens?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page four, with a picture. Read along, then look.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Page four has a picture beside it, and the picture has a job the words cannot do. The words will tell you that the printer turned a heavy wooden screw. The picture shows what that looked like. A long bar sticks out from the screw, and the printer pulls the bar with both hands to turn it. The words tell you how, and the picture shows you what it looked like. Read along with me." },
      interaction: { type: "read-along", text: "That set of blocks was called movable type, because the letters could be moved from one page to the next. The printer dabbed the type with sticky ink, laid a damp sheet of paper on top, and turned a heavy wooden screw that pressed the two together. In one day a press could print hundreds of copies of a single page. Unlike the press, a scribe could finish only a page or two before the sun went down.", audio: A("page-4-read-sentence") },
    },
    {
      id: "guided-choose-expert-word",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does movable type mean in this book?",
      narration: { audio: A("guided-choose-expert-word"), script: "Third tool. Page four used an expert word, movable type, and it handed you the support in the very same sentence. Four meanings are on your screen, and you will tap the one this book gives. Here is the sentence once more. That set of blocks was called movable type, because the letters could be moved from one page to the next." },
      interaction: { type: "choose", options: [{ id: "blocks-of-letters-used-again", label: "blocks of letters used again" }, { id: "a-page-copied-out-by-hand", label: "a page copied out by hand" }, { id: "the-screw-that-pressed-down", label: "the screw that pressed down" }, { id: "the-ink-dabbed-on-the-frame", label: "the ink dabbed on the frame" }], correctId: "blocks-of-letters-used-again", coachWrong: "Read the part of the sentence right after the word because. What could be moved from one page to the next?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: Because the press made books so quickly, the price of a book fell and fell, until an ordinary family could afford to own one. Within fifty years, printing shops had opened in cities all across Europe, and they had printed millions of books.",
      narration: { audio: A("page-5-read"), script: "Page five begins the last part of the book, under the heading A World of Readers. Read both sentences out loud, and hold on to what happened to the price of a book." },
      interaction: { type: "speak", text: "Because the press made books so quickly the price of a book fell and fell until an ordinary family could afford to own one Within fifty years printing shops had opened in cities all across Europe and they had printed millions of books" },
    },
    {
      id: "apply-choose-big-idea",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sentence is the big idea of the whole book?",
      narration: { audio: A("apply-choose-big-idea"), script: "Fourth tool. A topic is a word, and a big idea is a sentence about the whole book. You have read five pages, so write that sentence in your head now, the one thing every page adds up to. Four sentences are on your screen. One is big enough to cover the whole book. One is true but covers only one page. One is true but is not the point. One is not in the book at all. Read all four, then tap the big idea." },
      interaction: { type: "choose", options: [{ id: "the-press-made-books-cheap", label: "the press made books cheap" }, { id: "a-scribe-used-pen-and-ink", label: "a scribe used pen and ink" }, { id: "the-screw-was-made-of-wood", label: "the screw was made of wood" }, { id: "the-ink-was-made-from-soot", label: "the ink was made from soot" }], correctId: "the-press-made-books-cheap", coachWrong: "Test it against every page. Does that sentence cover page one, page three, and page five? If it fits only one page, or if no page says it, look again." },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: More people learned to read, because at last there was something worth reading, and new ideas raced from town to town faster than ever before. Some people say the airplane changed the world the most, but I believe no machine has ever mattered more than the one that filled ordinary homes with books.",
      narration: { audio: A("page-6-read"), script: "The last page is yours. Read both sentences out loud, and listen for the author stepping in with an opinion." },
      interaction: { type: "speak", text: "More people learned to read because at last there was something worth reading and new ideas raced from town to town faster than ever before Some people say the airplane changed the world the most but I believe no machine has ever mattered more than the one that filled ordinary homes with books" },
    },
    {
      id: "apply-choose-author-view",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the author think mattered most?",
      fx: {"text":"The author's view is **not always** your view","effect":"underline"},
      narration: { audio: A("apply-choose-author-view"), script: "Fifth tool. A fact book is written by a person, and on the last page this author stopped reporting and started judging. Some people say one thing, and the author says another. Four views are on your screen. Tap the one that belongs to the author. Your own view can be different, and you will get to say it at the end." },
      interaction: { type: "choose", options: [{ id: "the-press-mattered-most", label: "the press mattered most" }, { id: "the-airplane-mattered-most", label: "the airplane mattered most" }, { id: "scribes-mattered-most", label: "scribes mattered most" }, { id: "no-machine-mattered-much", label: "no machine mattered much" }], correctId: "the-press-mattered-most", coachWrong: "Go back to the last sentence. The author names what some people say, and then says, but I believe. Which view comes after those words?" },
    },
    {
      id: "apply-sort-in-the-text",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: In the Text, or Not in the Text?",
      narration: { audio: A("apply-sort-in-the-text"), script: "Here are six facts about printing, and every one of them is true in the world. Only some of them have a sentence in our book that says so. Read each fact. If you can point to a sentence, drag it to In the Text. If no sentence says it, drag it to Not in the Text." },
      interaction: { type: "sort", buckets: ["In the Text","Not in the Text"], items: [{ label: "a scribe used a slanted desk", bucket: "In the Text" }, { label: "paper was made from old rags", bucket: "Not in the Text" }, { label: "the screw was made of wood", bucket: "In the Text" }, { label: "wine presses came first", bucket: "Not in the Text" }, { label: "shops opened across Europe", bucket: "In the Text" }, { label: "some type was cut from wood", bucket: "Not in the Text" }], coachWrong: "Hunt for the sentence. If a page says it, it is in the text. If every page comes up empty, it is not, even when the fact is true." },
    },
    {
      id: "apply-sequence-book-steps",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the book's steps in order, from the scribe to the readers.",
      narration: { audio: A("apply-sequence-book-steps"), script: "This book tells its story in time order, from the slow days before the machine to the world after it. Here are five steps from the book, mixed up. Drag them into the order the book gave them, from the first page to the last." },
      interaction: { type: "sequence", items: [{ id: "a-scribe-copies-each-page", label: "a scribe copies each page" }, { id: "blocks-are-lined-in-a-frame", label: "blocks are lined in a frame" }, { id: "the-screw-presses-the-paper", label: "the screw presses the paper" }, { id: "the-price-of-a-book-falls", label: "the price of a book falls" }, { id: "more-people-learn-to-read", label: "more people learn to read" }], order: ["a-scribe-copies-each-page","blocks-are-lined-in-a-frame","the-screw-presses-the-paper","the-price-of-a-book-falls","more-people-learn-to-read"], coachWrong: "Start with the slowest way to make a book. Then follow the machine step by step, and end with what happened to the readers." },
    },
    {
      id: "challenge-speak-teach-it",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the big idea of this book, then one detail that backs it up.",
      narration: { audio: A("challenge-speak-teach-it"), script: "Last one, and you say it out loud. Tap the mic. Tell me the big idea of the whole book in one sentence, in your own words. Then say, the text says, and give one detail from any page that backs it up." },
      interaction: { type: "speak", text: "press printing printed print machine books book copies copy cheap cheaper cost costly price fell afford scribe scribes hand letters blocks type ink paper screw read reading learned quickly fast hundreds millions homes families world changed everything ideas" },
    },
    {
      id: "celebrate-whole-fact-book",
      purpose: "celebrate",
      gate: "none",
      prompt: "One whole fact book. Every tool.",
      fx: {"text":"**One** whole fact book. **Every** tool.","effect":"fireworks"},
      narration: { audio: A("celebrate-whole-fact-book"), script: "You read a whole fact book today, and most of it was in your own voice. Between the pages you pointed to the proving line, you named how two sentences connect, you worked out an expert word from its support, you found the big idea, and you held the author's view apart from your own. Then you sorted what the book said from what it never said, you put its steps in order, and you taught it back. That is what a third grade reader does with a real fact book. Read it, hold the big idea, and check." },
    },
  ],
};
