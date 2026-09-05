import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Search Like a Pro QUIZ (RI.3.5) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// which feature is this, at 3 options w/ picture support) / core(on-grade G3:
// key words, which section, which tool is fastest, tool sort w/ b-* bucket
// clips, hyperlink jump, production speak) / harder(G4 transfer, RI.4.7-
// adjacent, TAUGHT in the stimulus: a timeline described in words, a chart
// described in words, choosing between two sources, modeled first then
// applied, closing with a production speak). ALL-FRESH second fact book,
// "The Platypus Puzzle" (every fact true: rivers and streams of eastern
// Australia, flat duck-like bill, wide flat tail that stores fat, thick brown
// fur, webbed front feet whose webbing folds back for digging, one of the few
// mammals that lays eggs, eggs laid in a riverbank burrow and hatching after
// about ten days, babies called puggles that lap milk from the mother's fur
// for about four months, hunts with eyes, ears, and nose closed, the bill
// senses tiny electric signals from shrimp and worms, food stored in cheek
// pouches, a venomous spur on each back leg of the male, the first skin sent
// to England was thought to be a fake sewn from several animals), spoken
// feature by feature INSIDE the questions so every Q is self-contained;
// nothing from the lesson text (puffins) is reused. Topic grep-swept vs
// lessons-v2 + quizzes-v2: platypus, puggle, riverbank, venom, spur,
// Australia, timeline, chart 0 hits. Quiz support images live in the
// lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/search-like-a-pro-quiz";
const IMG = (w: string) => `/images/lessons-v2/search-like-a-pro/${w.toLowerCase()}.png`;

export const searchLikeAProQuiz: QuizDef = {
  id: "search-like-a-pro-quiz",
  lessonId: "search-like-a-pro",
  title: "Search Like a Pro Quiz",
  standard: "RI.3.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-what-is-the-heading",
      band: "easier",
      difficulty: 1,
      prompt: "The big dark words at the top of the page say Platypus Bodies. What are they called?",
      image: IMG("quiz-platypus-swimming"),
      narration: { audio: `${Q}/e-1-what-is-the-heading.mp3`, script: "Here is page one of a new fact book called The Platypus Puzzle. At the top of the page, in big dark letters, sit the words Platypus Bodies. Under them the page says, a platypus lives in rivers and streams of eastern Australia, and it has a flat bill like a duck, a wide flat tail, and thick brown fur. Those big words at the top name what the whole section is about. What are they called? Tap it." },
      hint: { audio: `${Q}/e-1-what-is-the-heading-hint.mp3`, script: "They sit at the very top of the page and name the section. Which tool does that job?" },
      explain: { audio: `${Q}/e-1-what-is-the-heading-explain.mp3`, script: "They are a heading. A heading sits at the top of a section in big dark letters and names what that section is about." },
      interaction: { type: "choose", options: [{ id: "a-heading", label: "a heading" }, { id: "a-caption", label: "a caption" }, { id: "a-sidebar", label: "a sidebar" }], correctId: "a-heading", coachWrong: "A caption sits under a picture and a sidebar is a box beside the words. These words sit at the top and name the section." },
    },
    {
      id: "e-2-what-is-the-caption",
      band: "easier",
      difficulty: 2,
      prompt: "The short line under the picture is called what?",
      image: IMG("quiz-platypus-bill"),
      narration: { audio: `${Q}/e-2-what-is-the-caption.mp3`, script: "Page three has a picture of a platypus poking its bill into the mud with its eyes shut. Right under the picture sits one short line. It says, a platypus closes its eyes, ears, and nose when it dives, and hunts with its bill. That short line explains what the picture shows. What is it called? Tap it." },
      hint: { audio: `${Q}/e-2-what-is-the-caption-hint.mp3`, script: "It sits right under the picture and explains it. Which tool lives under a picture?" },
      explain: { audio: `${Q}/e-2-what-is-the-caption-explain.mp3`, script: "It is a caption. A caption is the short line under a picture that explains what the picture shows." },
      interaction: { type: "choose", options: [{ id: "a-caption", label: "a caption" }, { id: "a-heading", label: "a heading" }, { id: "the-contents", label: "the contents" }], correctId: "a-caption", coachWrong: "A heading sits at the top of a section, and the contents sits at the front of the book. This line sits under a picture." },
    },
    {
      id: "e-3-which-section-babies",
      band: "easier",
      difficulty: 3,
      prompt: "Where is a baby platypus born? Which section do you turn to?",
      image: IMG("quiz-platypus-burrow"),
      narration: { audio: `${Q}/e-3-which-section-babies.mp3`, script: "Here is the contents of The Platypus Puzzle. Platypus Bodies, page one. Hunting in the Dark, page three. Puggles in the Burrow, page five. A puggle is a baby platypus. You want to know where a baby platypus is born. Tap the section you would turn to." },
      hint: { audio: `${Q}/e-3-which-section-babies-hint.mp3`, script: "The narration told you what a puggle is. Which section name has that word in it?" },
      explain: { audio: `${Q}/e-3-which-section-babies-explain.mp3`, script: "Puggles in the Burrow. A puggle is a baby platypus, so the section about puggles is where a fact about babies would live." },
      interaction: { type: "choose", options: [{ id: "puggles-in-the-burrow", label: "Puggles in the Burrow" }, { id: "platypus-bodies", label: "Platypus Bodies" }, { id: "hunting-in-the-dark", label: "Hunting in the Dark" }], correctId: "puggles-in-the-burrow", coachWrong: "Your question is about babies. Say the word for a baby platypus again and find the section name that holds it." },
    },
    {
      id: "e-4-what-is-the-sidebar",
      band: "easier",
      difficulty: 4,
      prompt: "The small box beside the main words holds one extra fact. What is it called?",
      narration: { audio: `${Q}/e-4-what-is-the-sidebar.mp3`, script: "On page two, beside the main words, sits a small box with one extra fact inside. The box says, a male platypus has a sharp spur on each back leg, and the spur carries venom. That box sits off to the side so it does not interrupt the main words. What is the box called? Tap it." },
      hint: { audio: `${Q}/e-4-what-is-the-sidebar-hint.mp3`, script: "Think about where the box sits, off to the side of the page. Its name says so." },
      explain: { audio: `${Q}/e-4-what-is-the-sidebar-explain.mp3`, script: "It is a sidebar. A sidebar is the box beside the main words that holds one extra fact." },
      interaction: { type: "choose", options: [{ id: "a-sidebar", label: "a sidebar" }, { id: "a-heading", label: "a heading" }, { id: "the-index", label: "the index" }], correctId: "a-sidebar", coachWrong: "The index lives at the back of the book, and a heading sits at the top of a section. This is a box beside the words." },
    },
    {
      id: "c-1-key-words-food",
      band: "core",
      difficulty: 1,
      prompt: "How does a platypus find food in the dark? Tap the best key words.",
      narration: { audio: `${Q}/c-1-key-words-food.mp3`, script: "Pick the key words. Here is the question. How does a platypus find food in the dark? Key words are the words that carry the question's meaning, and the little words stay out. Four sets are on your screen. Tap the best key words." },
      hint: { audio: `${Q}/c-1-key-words-food-hint.mp3`, script: "The best set names the animal, what it is looking for, and when. It has no little words like how, does, or a." },
      explain: { audio: `${Q}/c-1-key-words-food-explain.mp3`, script: "Platypus food dark. Those three words carry the meaning of the question. How does a, and, does it in the, are little words that find nothing, and bill fur tail are body words from a different question." },
      interaction: { type: "choose", options: [{ id: "platypus-food-dark", label: "platypus food dark" }, { id: "how-does-a-platypus", label: "how does a platypus" }, { id: "does-it-in-the", label: "does it in the" }, { id: "bill-fur-tail", label: "bill fur tail" }], correctId: "platypus-food-dark", coachWrong: "Check that set against the question. Does it hold the animal, the thing it wants, and when, with no little words?" },
    },
    {
      id: "c-2-which-section-eat",
      band: "core",
      difficulty: 2,
      prompt: "What does a platypus eat? Which section answers it?",
      narration: { audio: `${Q}/c-2-which-section-eat.mp3`, script: "Hold your key words up against the contents before you read. The contents says, Platypus Bodies, page one. Hunting in the Dark, page three. Puggles in the Burrow, page five. Your question is, what does a platypus eat? Think about what an animal has to do to get its food. Tap the section where that fact most likely lives." },
      hint: { audio: `${Q}/c-2-which-section-eat-hint.mp3`, script: "Eating starts with catching. Which section name is about catching food?" },
      explain: { audio: `${Q}/c-2-which-section-eat-explain.mp3`, script: "Hunting in the Dark. An animal eats what it hunts, so the section about hunting is where you find what a platypus eats. Reading every page is the slow way." },
      interaction: { type: "choose", options: [{ id: "hunting-in-the-dark", label: "Hunting in the Dark" }, { id: "platypus-bodies", label: "Platypus Bodies" }, { id: "puggles-in-the-burrow", label: "Puggles in the Burrow" }, { id: "read-every-page", label: "read every page" }], correctId: "hunting-in-the-dark", coachWrong: "Eating is about getting food. Match that idea to a section name, and remember that reading every page is not a search." },
    },
    {
      id: "c-3-fastest-tool-bill",
      band: "core",
      difficulty: 3,
      prompt: "You want every page that mentions the bill. Which tool is fastest?",
      narration: { audio: `${Q}/c-3-fastest-tool-bill.mp3`, script: "Now pick the tool. You want every single page in The Platypus Puzzle that mentions the bill, not just one. Four tools are on your screen. Tap the one that gets you there fastest." },
      hint: { audio: `${Q}/c-3-fastest-tool-bill-hint.mp3`, script: "You want every page for one small topic. Which tool lists small topics from A to Z with all of their pages?" },
      explain: { audio: `${Q}/c-3-fastest-tool-bill-explain.mp3`, script: "The index. It lists every small topic from A to Z with every page where it appears, so bill would sit there with all of its pages beside it. The contents only lists the three big sections." },
      interaction: { type: "choose", options: [{ id: "the-index", label: "the index" }, { id: "the-table-of-contents", label: "the table of contents" }, { id: "a-caption", label: "a caption" }, { id: "a-sidebar", label: "a sidebar" }], correctId: "the-index", coachWrong: "The contents lists three big sections, and a caption or sidebar holds one fact. You want every page for one small word." },
    },
    {
      id: "c-4-sort-which-tool",
      band: "core",
      difficulty: 4,
      prompt: "Which tool gets you there? Sort the six questions.",
      narration: { audio: `${Q}/c-4-sort-which-tool.mp3`, script: "Here are six things a reader might want from The Platypus Puzzle. A heading gets you a whole section. A sidebar or a caption gets you the extra fact in the box or the fact under the picture. The index gets you every page for one small topic. Read each card and drag it to the tool that gets you there fastest." },
      hint: { audio: `${Q}/c-4-sort-which-tool-hint.mp3`, script: "First, ask what the card really wants. A whole section, one box or picture fact, or every page for one word?" },
      explain: { audio: `${Q}/c-4-sort-which-tool-explain.mp3`, script: "Where hunting starts and which part is about babies are whole sections, so heading. The extra fact in the box and what the picture shows are sidebar or caption. Every page that says eggs and which pages mention fur want every page for one word, so index." },
      interaction: { type: "sort", buckets: ["Heading","Sidebar or Caption","Index"], bucketAudio: { "Heading": `${Q}/b-heading.mp3`, "Sidebar or Caption": `${Q}/b-sidebar-or-caption.mp3`, "Index": `${Q}/b-index.mp3` }, items: [{ label: "where does hunting start", bucket: "Heading" }, { label: "the extra fact in the box", bucket: "Sidebar or Caption" }, { label: "every page that says eggs", bucket: "Index" }, { label: "what the picture shows", bucket: "Sidebar or Caption" }, { label: "which part is about babies", bucket: "Heading" }, { label: "which pages mention fur", bucket: "Index" }], coachWrong: "Read the card again. Is it hunting for a whole section, for one small fact in a box or under a picture, or for every page that holds one word?" },
    },
    {
      id: "c-5-hyperlink-jump",
      band: "core",
      difficulty: 5,
      prompt: "On the website, the blue words egg laying mammal are a link. Where does it jump?",
      narration: { audio: `${Q}/c-5-hyperlink-jump.mp3`, script: "Now the same facts on the platypus website. Page one says, the platypus is one of the only mammals in the world that lays eggs. On the screen, the words egg laying mammal are printed in blue. Blue words on a screen are a link, and the blue words tell you what the page they jump to is about. Tap the page that link most likely jumps to." },
      hint: { audio: `${Q}/c-5-hyperlink-jump-hint.mp3`, script: "Read the blue words again. The link jumps to a page about exactly that." },
      explain: { audio: `${Q}/c-5-hyperlink-jump-explain.mp3`, script: "Mammals that lay eggs. The blue words say egg laying mammal, so the link jumps to a page about mammals that lay eggs, not about ducks, rivers, or fur." },
      interaction: { type: "choose", options: [{ id: "mammals-that-lay-eggs", label: "mammals that lay eggs" }, { id: "kinds-of-ducks", label: "kinds of ducks" }, { id: "rivers-of-the-world", label: "rivers of the world" }, { id: "thick-brown-fur", label: "thick brown fur" }], correctId: "mammals-that-lay-eggs", coachWrong: "The blue words name the page they jump to. Say the blue words again and find the tile that matches them." },
    },
    {
      id: "c-6-speak-search-plan",
      band: "core",
      difficulty: 6,
      prompt: "How long does a platypus egg take to hatch? Say the key words you would search and the tool you would use first.",
      narration: { audio: `${Q}/c-6-speak-search-plan.mp3`, script: "Say your search plan out loud. Here is the question. How long does a platypus egg take to hatch? Tap the mic. Say the key words you would search for, then name the tool in the book you would go to first." },
      hint: { audio: `${Q}/c-6-speak-search-plan-hint.mp3`, script: "Begin with the words that carry the meaning of the question, then name a tool such as the contents, the index, or a section heading." },
      explain: { audio: `${Q}/c-6-speak-search-plan-explain.mp3`, script: "The key words are platypus, egg, and hatch. You could go to the index and look up egg, or use the contents to jump to the section called Puggles in the Burrow." },
      interaction: { type: "speak", text: "platypus egg eggs hatch hatches hatching long days time puggle puggles baby index contents heading burrow section page pages search sidebar" },
    },
    {
      id: "h-1-timeline-point",
      band: "harder",
      difficulty: 1,
      prompt: "How long do puggles drink milk? Which point on the timeline do you jump to?",
      narration: { audio: `${Q}/h-1-timeline-point.mp3`, script: "Here is a fourth grade tool. Some pages hold a timeline, a line of steps in order from first to last, with one fact at each point. Page five of The Platypus Puzzle has a timeline of a puggle's first months. First point, the mother lays her eggs in the burrow. Second point, about ten days later, the eggs hatch. Third point, the puggles lap milk from their mother's fur for about four months. Fourth point, the young platypus leaves the burrow and swims on its own. Watch me use it. To learn when the eggs hatch, I do not read the whole page. I go straight to the point about hatching, the second point. Now you. You want to know how long puggles drink milk. Tap the point on the timeline you would jump to." },
      hint: { audio: `${Q}/h-1-timeline-point-hint.mp3`, script: "Play the timeline back in order. Eggs laid, eggs hatch, milk, leaving the burrow. Which point holds the milk fact?" },
      explain: { audio: `${Q}/h-1-timeline-point-explain.mp3`, script: "The third point. The timeline runs eggs laid, eggs hatch, then milk from the mother's fur for about four months, then leaving the burrow, so the milk fact is the third point." },
      interaction: { type: "choose", options: [{ id: "the-third-point", label: "the third point" }, { id: "the-first-point", label: "the first point" }, { id: "the-second-point", label: "the second point" }, { id: "the-fourth-point", label: "the fourth point" }], correctId: "the-third-point", coachWrong: "That point holds a different fact. Count through the timeline again until you reach the fact about milk." },
    },
    {
      id: "h-2-chart-row",
      band: "harder",
      difficulty: 2,
      prompt: "Which body part senses electric signals? Which row of the chart do you read?",
      narration: { audio: `${Q}/h-2-chart-row.mp3`, script: "Another fourth grade tool is a chart. A chart lines up facts in rows so you can compare them, and you read only the row you need. Page two has a chart called Platypus Body Parts with three rows. The bill row says, soft and rubbery, and it senses tiny electric signals from shrimp and worms. The tail row says, flat and wide, and it stores fat for hard times. The front feet row says, webbed for swimming, and the webbing folds back for digging. Watch me. To learn what the tail is for, I read only the tail row, stores fat. Now you. You want to know which body part senses electric signals. Tap the row you would read." },
      hint: { audio: `${Q}/h-2-chart-row-hint.mp3`, script: "Play the three rows back and listen for the words electric signals. Which row held them?" },
      explain: { audio: `${Q}/h-2-chart-row-explain.mp3`, script: "The bill row. It said the bill senses tiny electric signals from shrimp and worms. The other rows are about fat and about swimming and digging." },
      interaction: { type: "choose", options: [{ id: "the-bill-row", label: "the bill row" }, { id: "the-tail-row", label: "the tail row" }, { id: "the-front-feet-row", label: "the front feet row" }, { id: "every-row-in-order", label: "every row in order" }], correctId: "the-bill-row", coachWrong: "A chart lets you skip to one row. Which row's words matched your key words, electric signals?" },
    },
    {
      id: "h-3-two-sources",
      band: "harder",
      difficulty: 3,
      prompt: "What does a puggle eat? Which source do you pick to find it fastest?",
      narration: { audio: `${Q}/h-3-two-sources.mp3`, script: "Fourth grade readers also choose between sources. Two sources sit on the table. One is a thick book called Animals of Australia, with a short section on every animal in the country. The other is a single web page called All About the Platypus, with a search box at the top. Watch me choose. I want to compare the platypus with the kangaroo and the koala. The thick book covers all three animals, so the book is my source. Now you. You want to know exactly what a puggle eats, and you want it fast. Tap the source you would pick." },
      hint: { audio: `${Q}/h-3-two-sources-hint.mp3`, script: "Your question is about one animal only. Which source is all about that one animal and has a search box for your key words?" },
      explain: { audio: `${Q}/h-3-two-sources-explain.mp3`, script: "The platypus page. Your question is about one animal, and the page is all about that animal with a search box for the word puggle. The thick book would make you find the platypus section first, and a kangaroo book would not help at all." },
      interaction: { type: "choose", options: [{ id: "the-platypus-page", label: "the platypus page" }, { id: "the-thick-animal-book", label: "the thick animal book" }, { id: "read-both-from-the-start", label: "read both from the start" }, { id: "a-book-about-kangaroos", label: "a book about kangaroos" }], correctId: "the-platypus-page", coachWrong: "Your question is about one animal, and you want it fast. Pick the source that is only about that animal." },
    },
    {
      id: "h-4-speak-dangerous",
      band: "harder",
      difficulty: 4,
      prompt: "Can a platypus hurt a person? Say the key words you would search, then the part of the book you would jump to first.",
      narration: { audio: `${Q}/h-4-speak-dangerous.mp3`, script: "Last one, out loud. Remember the three tools on these pages. A sidebar on page two with an extra fact about a spur that carries venom. A chart of body parts on page two. A timeline of a puggle's first months on page five. Here is the question. Can a platypus hurt a person? Tap the mic. Say the key words you would search for, then name the part of the book you would jump to first." },
      hint: { audio: `${Q}/h-4-speak-dangerous-hint.mp3`, script: "Begin with the words that carry the question's meaning, then think about which tool held a fact about something sharp." },
      explain: { audio: `${Q}/h-4-speak-dangerous-explain.mp3`, script: "The key words are platypus, hurt, and person, or platypus and venom. The sidebar on page two is the first place to jump, because it holds the fact about the spur that carries venom." },
      interaction: { type: "speak", text: "platypus hurt hurts danger dangerous venom venomous poison poisonous spur spurs sharp sting stings person people sidebar box chart timeline index search page" },
    },
  ],
};
