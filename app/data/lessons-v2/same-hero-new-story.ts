import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./same-hero-new-story-timings.json";

// Same Hero, New Story (RL.3.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=same-hero-new-story
// G3-U3. TWO BOOKS FROM ONE SERIES tier of RL.3.9 (sibling split: one-story-
// two-ways RL.2.9 owns G2 two versions of the SAME tale, Stone Soup / Button
// Soup, same bones different clothes; same-different-stories RL.1.9 owns G1
// same-topic stories, Leo and Zara's loose teeth; two-texts-compare RI.1.9 and
// two-books-one-topic RI.K.9 own fact-book compares; follow-the-message RL.3.2
// owns naming a message from its details; parts-that-build RL.3.5 owns
// chapters; their-view-your-view RL.3.6 owns views). THIS lesson owns the
// third-grade step-up: two DIFFERENT stories that share one hero and one
// author, lined up in three rows, THEME (the same lesson twice, or a lesson
// that grows a new part), SETTING (where and when, and how the new place
// changes the problem), and PLOT (the problem and how it is solved), with the
// hero, her rule, and the author's way of writing as the things that stay the
// same. ONE original series by "Winifred Holt" about Margo Pike, the best
// finder on Fletcher Street, whose rule is that nothing is ever lost, it is
// only waiting where nobody has looked. Book one, Margo and the Lost
// Harmonica (Mr. Pruitt, her grandmother's laundromat, the bathrobe pocket in
// the dryer), and book two, Margo on the Night Train (Rudy's wooden yo-yo, a
// night train climbing the mountains to Aunt Ursula's, the floor tilts so
// loose things slide to the back, the conductor Ms. Lark, a grandfather holds
// it up, "this time the finding took all of us"). 16 sentences over 6
// child-read pages (read-along 1/3/4/6 with images, speak 2/5 = two
// three-sentence accept-mode reads under 55 tokens, no " my " token),
// compound + early-complex sentences, four speech-tagged dialogue lines,
// stretch words harmonica / laundromat / tumbled / conductor / admitted with
// in-text support, no digits, no contractions in read-along text. ANCHOR
// FRESHNESS python-swept vs every lessons-v2 + quizzes-v2 file: Margo,
// Winifred, Holt, Pruitt, Rudy, Lark, Ursula, Fletcher, laundromat,
// harmonica, dryer, bathrobe, conductor, yo-yo, tilt, sleeper, strangers,
// admitted all 0 hits. Keys prefixed quiz- are picture supports for the
// quiz's fresh second series (Ozzie: a subway station and a campground, both
// 0 hits).

const A = (id: string) => `/audio/lessons-v2/same-hero-new-story/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/same-hero-new-story/${w.toLowerCase()}.png`;

export const sameHeroNewStoryImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A nine year old girl with warm brown skin and two thick dark braids, wearing a teal sweater and jeans, standing inside a bright laundromat with a row of white front loading washing machines and dryers with round glass doors, beside a short elderly man with pale skin and a white mustache, wearing a plain gray cardigan over a white shirt and brown trousers and no bathrobe, who is holding a plastic laundry basket of wet clothes and frowning with worry, a folding table with a stack of towels, morning light through a big front window, plain walls with nothing hanging on them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same girl with warm brown skin, two thick dark braids, and a teal sweater kneeling at an open dryer door in the same bright laundromat, pulling a small shiny silver harmonica out of the pocket of a blue plaid bathrobe that hangs halfway out of the open dryer drum, while the same short elderly man with pale skin and a white mustache, wearing the same plain gray cardigan over a white shirt and no bathrobe, stands beside her with a wide happy smile and his hands raised, three other grown ups by the folding table clapping their hands, the row of white washing machines behind them, plain walls. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-4": { subject: "The same girl with warm brown skin, two thick dark braids, and a teal sweater sitting in a blue cushioned seat inside a dim night train car lit by one small warm reading lamp, dark mountains and stars outside the window, an elderly woman with gray hair asleep in the seat beside her under a shawl, and a small boy with light skin and messy blond hair in striped pajamas and gray socks standing in the narrow aisle with a sad crying face and empty hands, rows of seats with sleeping passengers fading into the dark behind him. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-6": { subject: "The very back of the same dim night train car, where an elderly man with dark brown skin, a white beard, and a green cardigan sits in the last seat holding up a small wooden yo-yo on a string with a gentle smile, the same girl with warm brown skin, two thick dark braids, and a teal sweater standing in the aisle beside the same small boy with messy blond hair in striped pajamas and gray socks who is laughing with delight, and a tall woman conductor with black hair in a bun wearing a plain navy blue uniform jacket and a plain navy cap with no badge, one small warm lamp, dark windows. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no badges, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-ozzie-subway": "A small boy with light brown skin and short curly black hair wearing a yellow raincoat and a backpack, standing in a busy underground subway station with white tiled walls and a crowd of blurred hurrying grown ups, looking up at a tall man in a gray rain jacket who is staring in confusion at a large wall poster covered only in thick colored lines and colored dots with no letters at all, a bright subway train waiting at the platform behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-campground-dusk": { subject: "The same small boy with light brown skin and short curly black hair in a yellow raincoat and backpack standing on a dirt path in a campground at dusk among many colorful dome tents and tall pine trees, beside a girl about his age with pale skin and a red ponytail in a green hoodie who is looking around with a worried face and holding a flashlight, a few glowing campfires far off between the trees, purple and orange evening sky, no moon. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no faces on any objects, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-ozzie-subway" },
  "quiz-camp-host": { subject: "The same small boy with light brown skin and short curly black hair in a yellow raincoat and the same girl with pale skin, a red ponytail, and a green hoodie standing at dusk in front of a small wooden cabin with a lit window in a pine tree campground, talking to a friendly older woman with silver hair in a brown vest who is holding a ring of keys and pointing down a dirt path between the tents, purple evening sky, no moon. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-ozzie-subway" }
};

export const sameHeroNewStory: LessonDef = {
  id: "same-hero-new-story",
  title: "Same Hero, New Story",
  grade: "3rd Grade",
  standard: "RL.3.9",
  archetype: "story-elements",
  objective: "I can compare two stories about the same hero by the same author, and tell what stays the same and what changes in the theme, the setting, and the plot.",
  concepts: [
    "a series: the same hero in new stories by the same author",
    "the hero, her rule, and the author's way of writing stay the same",
    "the setting changes, and the new place changes the problem",
    "the plot: the problem and how it is solved",
    "the theme can be the same lesson twice, or grow a new part",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You compared two books about the same hero, Margo, in three rows: theme, setting, and plot. You found what the author kept the same and what she changed, and you explained how a new setting changed the problem. That is how a third grade reader reads a series.",
    "title": "Same Hero, New Story",
    "body": "You compared two books from one series on theme, setting, and plot, and you told what stays the same and what changes."
  },
  scenes: [
    {
      id: "hook-book-one-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Margo and the Lost Harmonica, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-book-one-page-1"), script: "Hello, reader. Some heroes get more than one book. An author writes a series, and the same hero walks into a new story each time. Today you will read two short books by the same author, Winifred Holt, about the same hero, a girl named Margo, and then you will line them up side by side to find what stays the same and what changes. Here is page one of the first book, Margo and the Lost Harmonica. Read along with me." },
      interaction: { type: "read-along", text: "Margo Pike was nine years old, and she was the best finder on Fletcher Street. On the first Saturday of spring, old Mr. Pruitt shuffled into her grandmother's laundromat with a basket of wet clothes in his arms and worry all over his face. \"I have lost my harmonica,\" he said, \"and I have played it every night for fifty years.\"", audio: A("hook-book-one-page-1-sentence") },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Margo did not run to the machines. She asked where he had held the harmonica last, and Mr. Pruitt said that he had played one tune while his bathrobe tumbled in the dryer. \"Then it is not lost,\" said Margo, \"because it is only waiting where nobody has looked.\"",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and listen for the rule Margo lives by, because you will hear it again in the second book." },
      interaction: { type: "speak", text: "Margo did not run to the machines She asked where he had held the harmonica last and Mr Pruitt said that he had played one tune while his bathrobe tumbled in the dryer Then it is not lost said Margo because it is only waiting where nobody has looked" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three, the end of book one. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is the last page of book one. Read along with me, and watch how Margo finds the harmonica, because the way she finds things is part of who she is." },
      interaction: { type: "read-along", text: "Margo pictured the little harmonica sliding out of his hand while the dryer hummed, and she pictured the bathrobe pocket hanging open like a hungry mouth. She reached into the warm pocket, and there it was, and Mr. Pruitt played a tune so cheerful that every customer in the laundromat clapped along.", audio: A("page-3-read-sentence") },
    },
    {
      id: "model-three-rows",
      purpose: "model",
      gate: "none",
      prompt: "Three rows to compare: theme, setting, plot.",
      fx: {"text":"**Theme**. **Setting**. **Plot**.","effect":"pop-words"},
      narration: { audio: A("model-three-rows"), script: "Before the second book, watch me take book one apart. A third grade reader compares two stories in three rows. Row one is the theme, the lesson the story teaches. Row two is the setting, where and when it happens. Row three is the plot, the problem and how it gets solved. Here is book one in those rows. The hero is Margo, the best finder on Fletcher Street. The setting is her grandmother's laundromat on a spring Saturday. The plot is that Mr. Pruitt loses his harmonica, and Margo finds it by asking where he held it last and picturing where it would go. The theme, the lesson underneath, is that you find a lost thing by thinking where it would go, then looking there. Keep those three rows in your head, because the second book fills the same rows in its own way." },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Margo on the Night Train, page one. Read along!",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Now the second book by Winifred Holt, called Margo on the Night Train. It has the same hero, so watch for what stays the same, and watch even harder for what changes. Read along with me." },
      interaction: { type: "read-along", text: "Margo and her grandmother rode the night train over the mountains to visit Aunt Ursula, and the whole car was dark except for one small lamp. Near midnight, a small boy named Rudy came down the dim aisle in his socks, crying that his wooden yo-yo had rolled away while the train climbed. \"Nothing is ever lost,\" Margo told him, \"because it is only waiting where nobody has looked.\"", audio: A("page-4-read-sentence") },
    },
    {
      id: "page-5-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: Margo did not crawl under every seat. She felt the floor tilt as the train climbed, and she knew that anything loose would slide toward the back of the car. But the back of the car was crowded with sleeping strangers and their bags, so Margo went to find the conductor.",
      narration: { audio: A("page-5-read"), script: "Page five is yours. Read all three sentences out loud, and notice what Margo does here that she did not need to do in the laundromat." },
      interaction: { type: "speak", text: "Margo did not crawl under every seat She felt the floor tilt as the train climbed and she knew that anything loose would slide toward the back of the car But the back of the car was crowded with sleeping strangers and their bags so Margo went to find the conductor" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page six, the end of book two. Read along!",
      image: IMG("page-6"),
      narration: { audio: A("page-6-read"), script: "Here is the last page of book two. Read along with me, and listen for the moment when Margo says something she never said in the laundromat." },
      interaction: { type: "read-along", text: "The conductor, Ms. Lark, walked the whole length of the train asking every passenger to check the floor by their feet, and at the very back of the last car, a grandfather held up a wooden yo-yo. \"I could not have searched this whole train by myself,\" Margo admitted, \"so this time the finding took all of us.\"", audio: A("page-6-read-sentence") },
    },
    {
      id: "guided-choose-stays-the-same",
      purpose: "guided",
      gate: "interaction",
      prompt: "What stays the same in both books?",
      narration: { audio: A("guided-choose-stays-the-same"), script: "Now line the two books up. Four things from the books are on your screen, and every one of them is really there. Three of them happen in only one book. One of them is true in both books. Tap the one that stays the same." },
      interaction: { type: "choose", options: [{ id: "margo-stops-and-thinks-first", label: "margo stops and thinks first" }, { id: "a-train-climbs-a-mountain", label: "a train climbs a mountain" }, { id: "a-harmonica-goes-missing", label: "a harmonica goes missing" }, { id: "a-conductor-joins-the-search", label: "a conductor joins the search" }], correctId: "margo-stops-and-thinks-first", coachWrong: "That happens in one book only. Look for the thing Margo does the same way in the laundromat and on the train." },
    },
    {
      id: "guided-choose-what-changes",
      purpose: "guided",
      gate: "interaction",
      prompt: "What changes from book one to book two?",
      narration: { audio: A("guided-choose-what-changes"), script: "Now the other side of the compare. Four parts of the books are on your screen. Three of them stay the same from book one to book two. One of them changes. Tap the part that changes." },
      interaction: { type: "choose", options: [{ id: "the-place-where-it-happens", label: "the place where it happens" }, { id: "the-hero-of-the-book", label: "the hero of the book" }, { id: "the-author-who-wrote-it", label: "the author who wrote it" }, { id: "margos-rule-about-lost-things", label: "margo's rule for lost things" }], correctId: "the-place-where-it-happens", coachWrong: "Check both books. Is that part the same in the laundromat book and in the train book? Find the part that is different." },
    },
    {
      id: "apply-sort-same-different",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Same in Both, or Different?",
      narration: { audio: A("apply-sort-same-different"), script: "Here are six things about the two books. Some are the same in both books. Some are different from one book to the next. Read each one, and drag it to Same in Both or to Different." },
      interaction: { type: "sort", buckets: ["Same in Both","Different"], items: [{ label: "margo is the hero", bucket: "Same in Both" }, { label: "where the story happens", bucket: "Different" }, { label: "someone has lost a thing", bucket: "Same in Both" }, { label: "the thing that is lost", bucket: "Different" }, { label: "margo thinks, then looks", bucket: "Same in Both" }, { label: "how many people search", bucket: "Different" }], coachWrong: "Ask, is this true in the laundromat book and in the train book the same way? If each book has its own version of it, it is different." },
    },
    {
      id: "guided-choose-shared-lesson",
      purpose: "guided",
      gate: "interaction",
      prompt: "What lesson do both books teach?",
      narration: { audio: A("guided-choose-shared-lesson"), script: "Row one is the theme, and a series often carries one lesson from book to book. Think about how Margo found the harmonica, and how the search on the train began. One of the choices on your screen is taught by both books. The others sound wise, but the books never show them. Tap the lesson both books teach." },
      interaction: { type: "choose", options: [{ id: "think-where-it-would-go", label: "think where it would go" }, { id: "keep-your-things-in-a-pocket", label: "keep your things in a pocket" }, { id: "the-fastest-searcher-wins", label: "the fastest searcher wins" }, { id: "never-talk-to-strangers", label: "never talk to strangers" }], correctId: "think-where-it-would-go", coachWrong: "Test it against both books. Did Margo do that in the laundromat? Did she do it on the train? Only one lesson is shown in both." },
    },
    {
      id: "guided-choose-new-lesson",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is new in book two's lesson?",
      narration: { audio: A("guided-choose-new-lesson"), script: "Now the part of the theme that changes. Book two keeps the old lesson and adds something Margo did not need in the laundromat. Think about the last page of the train book, and what Margo admitted there. Four choices are on your screen. Tap the lesson that is new in book two." },
      interaction: { type: "choose", options: [{ id: "a-big-search-needs-helpers", label: "a big search needs helpers" }, { id: "look-at-the-back-first", label: "look at the back first" }, { id: "trains-are-no-place-to-play", label: "trains are no place to play" }, { id: "sleepy-people-cannot-help", label: "sleepy people cannot help" }], correctId: "a-big-search-needs-helpers", coachWrong: "That is a detail about the train, or it is something the book never showed. What did Margo admit on the last page about searching by herself?" },
    },
    {
      id: "apply-sequence-book-two-plot",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Row three, the plot. Put book two's events in order.",
      narration: { audio: A("apply-sequence-book-two-plot"), script: "Row three is the plot. Here are four events from Margo on the Night Train, mixed up. Drag them into the order they happened, from the first page of book two to the last." },
      interaction: { type: "sequence", items: [{ id: "rudy-loses-his-yo-yo", label: "rudy loses his yo-yo" }, { id: "margo-feels-the-floor-tilt", label: "margo feels the floor tilt" }, { id: "ms-lark-asks-each-passenger", label: "ms. lark asks each passenger" }, { id: "a-grandfather-holds-it-up", label: "a grandfather holds it up" }], order: ["rudy-loses-his-yo-yo","margo-feels-the-floor-tilt","ms-lark-asks-each-passenger","a-grandfather-holds-it-up"], coachWrong: "Begin with what Rudy does on the first page of book two. Then ask what Margo notices, who she asks, and who finds it." },
    },
    {
      id: "apply-choose-setting-changes-problem",
      purpose: "apply",
      gate: "interaction",
      prompt: "How does the train change the search?",
      fx: {"text":"A new **setting** changes the **problem**","effect":"underline"},
      narration: { audio: A("apply-choose-setting-changes-problem"), script: "Row two is the setting, and a new setting changes the problem. In the laundromat, a lost thing falls into a pocket or a machine, so Margo can find it alone. On the train, something about the place itself changes where the yo-yo goes. Four details from the train book are on your screen, and all four are in the story. Tap the one that changes the search." },
      interaction: { type: "choose", options: [{ id: "the-floor-tilts-as-it-climbs", label: "the floor tilts as it climbs" }, { id: "rudy-is-in-his-socks", label: "rudy is in his socks" }, { id: "they-are-visiting-an-aunt", label: "they are visiting an aunt" }, { id: "it-is-nearly-midnight", label: "it is nearly midnight" }], correctId: "the-floor-tilts-as-it-climbs", coachWrong: "That detail is in the book, but it does not change where the yo-yo goes. What did Margo feel under her feet on page five?" },
    },
    {
      id: "challenge-speak-same-and-different",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one thing that is the same in both books, and one thing that is different.",
      narration: { audio: A("challenge-speak-same-and-different"), script: "Last one, and you say it out loud. Tap the mic. Name one thing that is the same in both Margo books, then name one thing that is different. You can talk about the hero, the setting, the problem, or the lesson." },
      interaction: { type: "speak", text: "margo hero finder girl rule thinks think thinking looks look pictures lost waiting nobody laundromat train mountain mountains harmonica yoyo yo place setting problem plot lesson message helpers help alone conductor grandmother author same different" },
    },
    {
      id: "celebrate-same-hero-new-story",
      purpose: "celebrate",
      gate: "none",
      prompt: "Same hero. New story. Three rows.",
      fx: {"text":"**Same hero**. **New story**.","effect":"fireworks"},
      narration: { audio: A("celebrate-same-hero-new-story"), script: "Today you read two books from one series and lined them up in three rows. The hero stayed the same, and so did her rule and the way the author writes. The setting changed, the problem changed, and the plot changed with them. The theme stayed partly the same and grew a new part. The next time you pick up book two of a series, you will know exactly what to look for." },
    },
  ],
};
