import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Same Hero, New Story QUIZ (RL.3.9) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// who is the hero of both books, where book two happens, is the place the
// same or different, what is the same in both, at 3 options w/ picture
// support on three) / core(on-grade G3: what stays the same, what changes,
// a Same in Both / Different sort, the shared theme, how the new setting
// changes the way the hero helps, a production speak) / harder(G4 transfer
// RL.4.9: two old tales from two different places that carry one big idea,
// TAUGHT in h-1 with both tales spoken, then what each place adds, how each
// tale treats the idea (a warning vs a reward) applied to a third tale, and
// a production speak). ALL-FRESH second series by "Beatrix Fen" about Ozzie,
// the smallest boy in his building, who is always looking up: book one,
// Ozzie and the Subway Map (a lost man in the noisy station under Kessler
// Street, the wall map, the right platform), and book two, Ozzie at the
// Campground (a lost girl at Pinebrook Campground at dusk, no map and no
// signs, a tent with a blue flag near a flat rock, the camp host Mrs.
// Abernathy). Every page is spoken INSIDE the questions so each Q is
// self-contained; nothing from the lesson series (Margo, the laundromat,
// the night train) is reused. Names + settings grep-swept vs lessons-v2 +
// quizzes-v2: Ozzie, Beatrix, Fen, Kessler, Pinebrook, Abernathy, subway,
// campground, camp host all 0 hits. Quiz support images live in the
// lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/same-hero-new-story-quiz";
const IMG = (w: string) => `/images/lessons-v2/same-hero-new-story/${w.toLowerCase()}.png`;

export const sameHeroNewStoryQuiz: QuizDef = {
  id: "same-hero-new-story-quiz",
  lessonId: "same-hero-new-story",
  title: "Same Hero, New Story Quiz",
  standard: "RL.3.9",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-hero-of-both-books",
      band: "easier",
      difficulty: 1,
      prompt: "Who is the hero of both books?",
      image: IMG("quiz-ozzie-subway"),
      narration: { audio: `${Q}/e-1-hero-of-both-books.mp3`, script: "Here is the start of a book called Ozzie and the Subway Map, written by Beatrix Fen. Ozzie was the smallest boy in his building, and he was always looking up. On a rainy Monday, in the noisy subway station under Kessler Street, he looked up and saw a man in a gray rain jacket staring at the big map on the wall with his mouth open. Helping starts with looking up, Ozzie said to himself, and he walked over. Beatrix Fen wrote a second book about the same boy, called Ozzie at the Campground. Who is the hero of both books? Tap the name." },
      hint: { audio: `${Q}/e-1-hero-of-both-books-hint.mp3`, script: "The hero is the person both books are about, and both titles begin with his name." },
      explain: { audio: `${Q}/e-1-hero-of-both-books-explain.mp3`, script: "The hero of both books is Ozzie. Both titles start with his name, and both books follow what he does." },
      interaction: { type: "choose", options: [{ id: "ozzie", label: "ozzie" }, { id: "the-man-in-the-rain-jacket", label: "the man in the rain jacket" }, { id: "the-subway-driver", label: "the subway driver" }], correctId: "ozzie", coachWrong: "That person is in only one book, or not in the books at all. Whose name is in both titles?" },
    },
    {
      id: "e-2-where-book-two-happens",
      band: "easier",
      difficulty: 2,
      prompt: "Where does book two happen?",
      image: IMG("quiz-campground-dusk"),
      narration: { audio: `${Q}/e-2-where-book-two-happens.mp3`, script: "Here is the start of the second book, Ozzie at the Campground. That summer, Ozzie's family camped at Pinebrook Campground, where the tents sat in long rows under the trees. At dusk, he looked up from the fire and saw a girl with a red ponytail walking slowly down the row, peering into every tent. I cannot find our campsite, she said, and every tent looks the same in the dark. The first book happened in a subway station. Where does the second book happen? Tap the place." },
      hint: { audio: `${Q}/e-2-where-book-two-happens-hint.mp3`, script: "Look at the picture, and think about where a family sleeps in tents." },
      explain: { audio: `${Q}/e-2-where-book-two-happens-explain.mp3`, script: "The second book happens at a campground. The first book happened in a subway station, so the place changed from book one to book two." },
      interaction: { type: "choose", options: [{ id: "at-a-campground", label: "at a campground" }, { id: "in-a-subway-station", label: "in a subway station" }, { id: "at-a-museum", label: "at a museum" }], correctId: "at-a-campground", coachWrong: "That is not where the tents are. Where did Ozzie's family sleep that summer?" },
    },
    {
      id: "e-3-place-same-or-different",
      band: "easier",
      difficulty: 3,
      prompt: "Is the place the same in both books, or different?",
      narration: { audio: `${Q}/e-3-place-same-or-different.mp3`, script: "Think about the two Ozzie books. In book one, Ozzie helps a man in a noisy subway station under the city. In book two, Ozzie helps a girl at a campground under the trees. Now think only about the place where each book happens. Is the place the same in both books, or is it different? Tap your answer." },
      hint: { audio: `${Q}/e-3-place-same-or-different-hint.mp3`, script: "Say the two places out loud, a subway station and a campground. Are those one place, or two?" },
      explain: { audio: `${Q}/e-3-place-same-or-different-explain.mp3`, script: "The place is different in each book. Book one happens in a subway station, and book two happens at a campground." },
      interaction: { type: "choose", options: [{ id: "different-in-each-book", label: "different in each book" }, { id: "the-same-in-both-books", label: "the same in both books" }, { id: "not-told-in-the-books", label: "not told in the books" }], correctId: "different-in-each-book", coachWrong: "Name the place in book one, then the place in book two. Do you get one place, or two?" },
    },
    {
      id: "e-4-same-in-both",
      band: "easier",
      difficulty: 4,
      prompt: "What is the same in both books?",
      image: IMG("quiz-camp-host"),
      narration: { audio: `${Q}/e-4-same-in-both.mp3`, script: "Here is what Ozzie does in each book. In book one, he looks up, sees a man who is lost in the subway station, and helps him find the right platform. In book two, he looks up, sees a girl who is lost at the campground, and takes her to the camp host, who knows every tent. What is the same in both books? Tap it." },
      hint: { audio: `${Q}/e-4-same-in-both-hint.mp3`, script: "First, ask what Ozzie does for someone in book one, and whether he does it again in book two." },
      explain: { audio: `${Q}/e-4-same-in-both-explain.mp3`, script: "In both books, Ozzie helps a lost person. The man and the girl are different, but helping someone who is lost happens in both." },
      interaction: { type: "choose", options: [{ id: "ozzie-helps-a-lost-person", label: "ozzie helps a lost person" }, { id: "someone-rides-a-subway", label: "someone rides a subway" }, { id: "someone-sleeps-in-a-tent", label: "someone sleeps in a tent" }], correctId: "ozzie-helps-a-lost-person", coachWrong: "That happens in only one of the books. Find the thing Ozzie does in both." },
    },
    {
      id: "c-1-what-stays-the-same",
      band: "core",
      difficulty: 1,
      prompt: "What stays the same in both books?",
      narration: { audio: `${Q}/c-1-what-stays-the-same.mp3`, script: "Here are the first pages of both Ozzie books. Book one. Ozzie was the smallest boy in his building, and he was always looking up. On a rainy Monday, in the noisy subway station under Kessler Street, he looked up and saw a man in a gray rain jacket staring at the big map on the wall with his mouth open. Book two. That summer, Ozzie's family camped at Pinebrook Campground, where the tents sat in long rows under the trees. At dusk, he looked up from the fire and saw a girl with a red ponytail walking slowly down the row, and every tent looked the same in the dark. Four things from these pages are on your screen, and all four are really there. Three happen in only one book. Tap the one that is true in both." },
      hint: { audio: `${Q}/c-1-what-stays-the-same-hint.mp3`, script: "Three of the choices belong to one place, the station or the campground. Find what Ozzie himself does on both pages." },
      explain: { audio: `${Q}/c-1-what-stays-the-same-explain.mp3`, script: "The thing that stays the same is that Ozzie looks up and notices. He looks up in the station and sees the man, and he looks up from the fire and sees the girl." },
      interaction: { type: "choose", options: [{ id: "ozzie-looks-up-and-notices", label: "ozzie looks up and notices" }, { id: "a-man-stares-at-a-wall-map", label: "a man stares at a wall map" }, { id: "every-tent-looks-the-same", label: "every tent looks the same" }, { id: "it-is-a-rainy-monday", label: "it is a rainy monday" }], correctId: "ozzie-looks-up-and-notices", coachWrong: "That detail comes from one book only. Which choice tells what Ozzie does on both first pages?" },
    },
    {
      id: "c-2-what-changes",
      band: "core",
      difficulty: 2,
      prompt: "What changes from book one to book two?",
      narration: { audio: `${Q}/c-2-what-changes.mp3`, script: "Here is how each book ends. In book one, the man wanted the museum, but he was on the wrong platform, so Ozzie traced the blue line on the wall map with his finger, found the museum stop, and walked the man across the bridge to the right platform. In book two, there was no map and no signs, so Ozzie asked the girl what she remembered, a tent with a blue flag near a big flat rock, and he took her to the camp host, Mrs. Abernathy, who pointed them straight down the path. Four parts of the books are on your screen. Three stay the same from book one to book two. One changes. Tap the part that changes." },
      hint: { audio: `${Q}/c-2-what-changes-hint.mp3`, script: "Think about the wall map in book one. What does Ozzie use instead in book two?" },
      explain: { audio: `${Q}/c-2-what-changes-explain.mp3`, script: "The part that changes is how Ozzie finds the way. In book one he reads a map, and in book two he asks what the girl remembers and goes to the camp host. The hero, the author, and the rule Ozzie lives by stay the same." },
      interaction: { type: "choose", options: [{ id: "how-ozzie-finds-the-way", label: "how ozzie finds the way" }, { id: "who-the-hero-is", label: "who the hero is" }, { id: "who-wrote-the-books", label: "who wrote the books" }, { id: "the-rule-ozzie-lives-by", label: "the rule ozzie lives by" }], correctId: "how-ozzie-finds-the-way", coachWrong: "That part is the same in both books. Compare what Ozzie does with the map to what he does at the campground." },
    },
    {
      id: "c-3-sort-same-different",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Same in Both, or Different?",
      narration: { audio: `${Q}/c-3-sort-same-different.mp3`, script: "Here are the two Ozzie books in short. In book one, Ozzie looks up in a subway station, sees a lost man, and reads the wall map to lead him to the right platform. In book two, Ozzie looks up at a campground, sees a lost girl, and asks the camp host to point the way to her tent. Six things about the books are on your screen. Drag each one to Same in Both or to Different." },
      hint: { audio: `${Q}/c-3-sort-same-different-hint.mp3`, script: "Ask, is this true in the station book and in the campground book the same way? If each book has its own version, it is different." },
      explain: { audio: `${Q}/c-3-sort-same-different-explain.mp3`, script: "Same in both: Ozzie is the hero, someone is lost, and Ozzie looks up first. Different: where it happens, who is lost, and how the way is found." },
      interaction: { type: "sort", buckets: ["Same in Both","Different"], bucketAudio: { "Same in Both": `${Q}/b-same-in-both.mp3`, "Different": `${Q}/b-different.mp3` }, items: [{ label: "ozzie is the hero", bucket: "Same in Both" }, { label: "where it happens", bucket: "Different" }, { label: "someone is lost", bucket: "Same in Both" }, { label: "who is lost", bucket: "Different" }, { label: "ozzie looks up first", bucket: "Same in Both" }, { label: "how the way is found", bucket: "Different" }], coachWrong: "Go back to the two books. Does this happen the same way in both, or does each book have its own version?" },
    },
    {
      id: "c-4-shared-lesson",
      band: "core",
      difficulty: 4,
      prompt: "What lesson do both books teach?",
      narration: { audio: `${Q}/c-4-shared-lesson.mp3`, script: "Row one of a compare is the theme, the lesson underneath the story. In book one, Ozzie notices a man who is lost, and he walks over to help. In book two, Ozzie notices a girl who is lost, and he helps her find the way. One lesson on your screen is taught by both books. The others sound wise, but the books never show them. Tap the lesson both books teach." },
      hint: { audio: `${Q}/c-4-shared-lesson-hint.mp3`, script: "What does Ozzie do first in both books, and what does he do right after?" },
      explain: { audio: `${Q}/c-4-shared-lesson-explain.mp3`, script: "Both books teach, notice trouble, then help. Ozzie looks up, sees someone who is lost, and steps in, in the station and at the campground." },
      interaction: { type: "choose", options: [{ id: "notice-trouble-then-help", label: "notice trouble, then help" }, { id: "the-smallest-guide-is-best", label: "the smallest guide is best" }, { id: "stay-close-to-your-family", label: "stay close to your family" }, { id: "maps-are-better-than-people", label: "maps are better than people" }], correctId: "notice-trouble-then-help", coachWrong: "Check it against both books. Does the story show that in the station and at the campground? Only one lesson is in both." },
    },
    {
      id: "c-5-setting-changes-help",
      band: "core",
      difficulty: 5,
      prompt: "How does the campground change the way Ozzie helps?",
      narration: { audio: `${Q}/c-5-setting-changes-help.mp3`, script: "Row two is the setting, and a new setting changes the problem. In the subway station, a big map hung on the wall, so Ozzie could trace the line with his finger. Here is book two again. There was no map on any wall, and the campground had no signs, so Ozzie could not trace a line this time. Instead, he asked the girl what she remembered, a tent with a blue flag near a big flat rock, and he took her to the camp host. Four details from book two are on your screen, and all four are in the story. Tap the one that changes how Ozzie helps." },
      hint: { audio: `${Q}/c-5-setting-changes-help-hint.mp3`, script: "In the station, Ozzie used something on the wall. What is missing at the campground?" },
      explain: { audio: `${Q}/c-5-setting-changes-help-explain.mp3`, script: "The detail that changes the search is that there is no map or sign. Without a map, Ozzie cannot trace the way, so he asks the girl what she remembers and goes to the camp host." },
      interaction: { type: "choose", options: [{ id: "there-is-no-map-or-sign", label: "there is no map or sign" }, { id: "the-girl-has-a-red-ponytail", label: "the girl has a red ponytail" }, { id: "it-is-summer", label: "it is summer" }, { id: "the-rock-is-big-and-flat", label: "the rock is big and flat" }], correctId: "there-is-no-map-or-sign", coachWrong: "That detail is in the book, but it does not change how Ozzie finds the way. What did Ozzie use in the station that the campground does not have?" },
    },
    {
      id: "c-6-speak-same-and-different",
      band: "core",
      difficulty: 6,
      prompt: "Say one thing that is the same in both Ozzie books, and one thing that is different.",
      narration: { audio: `${Q}/c-6-speak-same-and-different.mp3`, script: "Now say it out loud. Here are the two books in short. In book one, Ozzie looks up in a subway station, sees a lost man, and reads the map to lead him to the right platform. In book two, Ozzie looks up at a campground, sees a lost girl, and takes her to the camp host who knows every tent. Tap the mic. Name one thing that is the same in both books, then name one thing that is different." },
      hint: { audio: `${Q}/c-6-speak-same-and-different-hint.mp3`, script: "You can talk about the hero, the place, the person who was lost, or how Ozzie finds the way." },
      explain: { audio: `${Q}/c-6-speak-same-and-different-explain.mp3`, script: "One answer goes like this. The same thing is that Ozzie looks up and helps a lost person in both books. A different thing is the place, a subway station in book one and a campground in book two." },
      interaction: { type: "speak", text: "ozzie hero boy helper helps helping looks looking notices notice lost subway station map campground tents tent girl man flag host place setting problem lesson same different author rule" },
    },
    {
      id: "h-1-two-places-one-idea",
      band: "harder",
      difficulty: 1,
      prompt: "Two tales from two places. What big idea do both carry?",
      narration: { audio: `${Q}/h-1-two-places-one-idea.mp3`, script: "Here is a fourth grade step. People in different parts of the world tell their own old tales, and two tales from two different places can carry the same big idea, dressed in the things each place knows best. A fourth grade reader names the shared idea first. Here are two short tales. In the far north, where winter lasts half the year, people tell of two brothers who fished through the ice. The older brother kept every fish for himself, and the younger brother shared his catch with the village. When a storm froze the older brother's fishing hole shut, no door in the village opened for him, but the whole village fed the younger brother all winter. In a hot dry land, where rain hardly ever comes, people tell of a girl who owned the only full water jar on her road. She shared it with a thirsty traveler, and when her own well ran dry, every family on the road carried water to her door. Both tales carry one big idea. Tap it." },
      hint: { audio: `${Q}/h-1-two-places-one-idea-hint.mp3`, script: "Look at what happens to the person who shared, in both tales. What comes back to them?" },
      explain: { audio: `${Q}/h-1-two-places-one-idea-explain.mp3`, script: "The shared idea is that sharing comes back to you. The younger brother shared fish and was fed all winter, and the girl shared water and had water carried to her door." },
      interaction: { type: "choose", options: [{ id: "sharing-comes-back-to-you", label: "sharing comes back to you" }, { id: "winter-is-the-hardest-season", label: "winter is the hardest season" }, { id: "never-trust-a-traveler", label: "never trust a traveler" }, { id: "fish-matter-more-than-water", label: "fish matter more than water" }], correctId: "sharing-comes-back-to-you", coachWrong: "That is a detail from one tale, or it is not shown at all. What happened to the brother and the girl who shared?" },
    },
    {
      id: "h-2-what-the-place-adds",
      band: "harder",
      difficulty: 2,
      prompt: "What does the far north tale add to the shared idea?",
      narration: { audio: `${Q}/h-2-what-the-place-adds.mp3`, script: "The two tales share one idea, sharing comes back to you, but each place dresses the idea in what that place knows. The far north tale uses ice, fish, a fishing hole that freezes shut, and a winter that lasts half the year. The dry land tale uses a water jar, a well that runs dry, a thirsty traveler, and rain that hardly ever comes. A fourth grade reader can name what each place adds. Four things from the tales are on your screen. Tap the one that the far north tale adds." },
      hint: { audio: `${Q}/h-2-what-the-place-adds-hint.mp3`, script: "Three of the choices come from the hot dry land. Find the one that belongs to the cold place." },
      explain: { audio: `${Q}/h-2-what-the-place-adds-explain.mp3`, script: "The far north adds ice, fish, and a long winter. The water jar, the thirsty traveler, and the rare rain all belong to the dry land tale." },
      interaction: { type: "choose", options: [{ id: "ice-fish-and-a-long-winter", label: "ice, fish, and a long winter" }, { id: "a-water-jar-and-a-dry-well", label: "a water jar and a dry well" }, { id: "a-thirsty-traveler", label: "a thirsty traveler" }, { id: "rain-that-hardly-ever-comes", label: "rain that hardly ever comes" }], correctId: "ice-fish-and-a-long-winter", coachWrong: "That belongs to the hot dry land. Which choice could only happen where winter lasts half the year?" },
    },
    {
      id: "h-3-warning-or-reward",
      band: "harder",
      difficulty: 3,
      prompt: "Which tale does the river tale treat the idea most like?",
      narration: { audio: `${Q}/h-3-warning-or-reward.mp3`, script: "Two tales can share one idea and still treat it differently. The far north tale is a warning. It follows the brother who did not share, and his door stays shut. The dry land tale is a reward. It follows the girl who did share, and water comes to her door. Here is a third tale, from a village on a wide river. A boy kept his boat to himself all summer and never let anyone borrow it. When the river flooded his house, nobody had a boat to fetch him, so he waited on his roof until the water went down. Which tale does the river tale treat the idea most like? Tap it." },
      hint: { audio: `${Q}/h-3-warning-or-reward-hint.mp3`, script: "First, ask whether the river tale follows someone who shared or someone who did not, and whether things end well for him." },
      explain: { audio: `${Q}/h-3-warning-or-reward-explain.mp3`, script: "The river tale is most like the far north tale, a warning. Both follow someone who did not share, and both end with that person left on his own." },
      interaction: { type: "choose", options: [{ id: "the-north-tale-a-warning", label: "the north tale, a warning" }, { id: "the-dry-land-tale-a-reward", label: "the dry land tale, a reward" }, { id: "both-tales-in-the-same-way", label: "both tales in the same way" }, { id: "neither-tale-at-all", label: "neither tale at all" }], correctId: "the-north-tale-a-warning", coachWrong: "Think about who the river tale follows. Did that boy share, and did things end well for him? Then match that shape to one tale." },
    },
    {
      id: "h-4-speak-shared-idea",
      band: "harder",
      difficulty: 4,
      prompt: "Say the big idea the two tales share, then one thing the far north tale adds.",
      narration: { audio: `${Q}/h-4-speak-shared-idea.mp3`, script: "Last one, out loud. Think about the two brothers fishing through the ice in the far north, and the girl with the water jar in the hot dry land. Tap the mic. Say the big idea both tales share, then say one thing the far north tale adds that the dry land tale does not have." },
      hint: { audio: `${Q}/h-4-speak-shared-idea-hint.mp3`, script: "The big idea is about what happens after someone shares. The far north adds cold things you would never find in a dry land." },
      explain: { audio: `${Q}/h-4-speak-shared-idea-explain.mp3`, script: "The big idea is that sharing comes back to you. The far north adds ice, fish, and a winter that lasts half the year." },
      interaction: { type: "speak", text: "sharing share shared shares give giving kind kindness comes back returns help helped ice fish fishing winter cold snow storm frozen froze brother brothers village fed food water jar well rain dry thirsty traveler warning reward" },
    },
  ],
};
