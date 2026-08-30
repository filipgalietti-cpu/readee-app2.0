import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Why Authors Write QUIZ (RI.2.6) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed. ALL FRESH stimuli (no lesson
// recall): every question speaks its own new true mini-text. Easier = tiny
// spoken texts (camel hump, emperor penguin, hummingbird drinking, sea turtle
// swim) with 2 options + picture support; core = fresh true mini-texts
// (beaver dam, arctic tern, desert cactus, maple syrup) plus a fresh 6-line
// Answer/Explain/Describe sort and a name-the-purpose speak; harder = G3
// transfer TAUGHT in the stimulus (persuade as a fourth purpose, the purpose
// of one specific paragraph, spot the persuading line, say persuade).
// All facts true: a camel's hump stores fat; emperor penguins stand about as
// tall as a young child with gold at the chest; hummingbirds hover and lap
// nectar with a long tongue; some sea turtles swim thousands of miles; beavers
// bite down small trees, drag branches, pack mud; the arctic tern flies pole
// to pole and back each year; cactus skin is waxy, spines sharp, the plant
// swells with rain; maple sap drips from a drilled hole and is boiled into
// syrup; humpback whale songs roll for miles and can last hours; rain falls
// when cloud droplets grow too heavy to float.

const Q = "/audio/quizzes-v2/why-authors-write-quiz";
const IMG = (w: string) => `/images/lessons-v2/why-authors-write/${w.toLowerCase()}.png`;

export const whyAuthorsWriteQuiz: QuizDef = {
  id: "why-authors-write-quiz",
  lessonId: "why-authors-write",
  title: "Why Authors Write Quiz",
  standard: "RI.2.6",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-camel-hump",
      band: "easier",
      difficulty: 1,
      prompt: "What did this author want to do?",
      image: IMG("camel"),
      narration: { audio: `${Q}/e-1-camel-hump.mp3`, script: "Listen to this tiny true text. Why does a camel have a hump? The hump stores fat, and that fat feeds the camel when food is hard to find. Now think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/e-1-camel-hump-hint.mp3`, script: "Listen to the first line again. Why does a camel have a hump? The rest of the text gave that very thing back." },
      explain: { audio: `${Q}/e-1-camel-hump-explain.mp3`, script: "The purpose was to answer a question. The text opened by asking why camels have humps, then handed you the answer. The hump stores fat. Every fact in it worked on that one question." },
      interaction: { type: "choose", options: [{ id: "answer-a-question", label: "answer a question" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "answer-a-question", coachWrong: "This text was true from start to end, and its first line set up a job. What did the first line do?" },
    },
    {
      id: "e-2-penguin-describe",
      band: "easier",
      difficulty: 2,
      prompt: "What did this author want to do?",
      image: IMG("penguin"),
      narration: { audio: `${Q}/e-2-penguin-describe.mp3`, script: "Listen to this tiny true text. An emperor penguin stands about as tall as a young child. Its back is black, its belly is white, and soft gold glows at its chest. Now think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/e-2-penguin-describe-hint.mp3`, script: "This text did not give any steps. It kept handing you word pictures of one bird." },
      explain: { audio: `${Q}/e-2-penguin-describe-explain.mp3`, script: "The purpose was to describe what it is like. Black back, white belly, gold at the chest, as tall as a young child. The author painted the penguin in words so you could see it." },
      interaction: { type: "choose", options: [{ id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "explain-how-it-works", label: "explain how it works" }], correctId: "describe-what-it-is-like", coachWrong: "Did this text walk you through moves, one after another, or did it paint one animal in words? Pick the purpose that matches." },
    },
    {
      id: "e-3-hummingbird-steps",
      band: "easier",
      difficulty: 3,
      prompt: "What did this author want to do?",
      image: IMG("hummingbird"),
      narration: { audio: `${Q}/e-3-hummingbird-steps.mp3`, script: "Listen to this tiny true text. A hummingbird drinks in little moves. First it hovers at a flower. Then it slides its long tongue inside. Then it laps up the sweet nectar. Now think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/e-3-hummingbird-steps-hint.mp3`, script: "Listen to how the text moves. First it hovers. Then the tongue. Then the nectar. One move after another." },
      explain: { audio: `${Q}/e-3-hummingbird-steps-explain.mp3`, script: "The purpose was to explain how it works. The text walked you through the moves of a hummingbird's drink, first the hover, then the tongue, then the nectar. Moves in order are an author explaining." },
      interaction: { type: "choose", options: [{ id: "explain-how-it-works", label: "explain how it works" }, { id: "answer-a-question", label: "answer a question" }], correctId: "explain-how-it-works", coachWrong: "Did this text open by asking you something? Or did it walk you through moves in order? Pick the purpose that matches." },
    },
    {
      id: "e-4-turtle-clue",
      band: "easier",
      difficulty: 4,
      prompt: "Which clue did you hear?",
      image: IMG("sea-turtle"),
      narration: { audio: `${Q}/e-4-turtle-clue.mp3`, script: "Purpose clues hide in how a text starts. Listen. How far can a sea turtle swim? Some sea turtles swim thousands of miles across the ocean. Now tap the clue you heard at the very start of that text." },
      hint: { audio: `${Q}/e-4-turtle-clue-hint.mp3`, script: "Hear that first line again in your mind. How far can a sea turtle swim? What kind of line is that?" },
      explain: { audio: `${Q}/e-4-turtle-clue-explain.mp3`, script: "The clue was a question at the start. The text opened by asking how far a sea turtle can swim, and that clue tells you the author's purpose. The rest of the text gives the answer, thousands of miles." },
      interaction: { type: "choose", options: [{ id: "a-question-at-the-start", label: "a question at the start" }, { id: "steps-from-first-to-last", label: "steps from first to last" }], correctId: "a-question-at-the-start", coachWrong: "Listen to the first line one more time in your head. Does it give a step, or does it ask you something?" },
    },
    {
      id: "c-1-beaver-purpose",
      band: "core",
      difficulty: 1,
      prompt: "What was this author's purpose?",
      narration: { audio: `${Q}/c-1-beaver-purpose.mp3`, script: "Here is a fresh true text. A beaver builds its dam in moves. First it bites down small trees with its strong front teeth. Then it drags the branches into the stream. Then it packs mud on top until the water slows. The topic is beavers, that is what it is about. But think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/c-1-beaver-purpose-hint.mp3`, script: "Follow the shape of the text. Bite the trees, drag the branches, pack the mud. One move after another." },
      explain: { audio: `${Q}/c-1-beaver-purpose-explain.mp3`, script: "The purpose was to explain how it works. The text walked you through building a dam move by move, trees, branches, mud. The topic was beavers, but the author's reason for writing was to show you how the dam gets built." },
      interaction: { type: "choose", options: [{ id: "explain-how-it-works", label: "explain how it works" }, { id: "answer-a-question", label: "answer a question" }, { id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "explain-how-it-works", coachWrong: "Topic and purpose are two different questions. You know the topic is beavers. Now think about what the author is doing with all those moves in order." },
    },
    {
      id: "c-2-tern-answer",
      band: "core",
      difficulty: 2,
      prompt: "What was this author's purpose?",
      narration: { audio: `${Q}/c-2-tern-answer.mp3`, script: "Here is a fresh true text. Which bird flies the farthest? The arctic tern does. Every year this small seabird flies from the top of the world to the bottom, and back again. No bird on Earth travels farther. Think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/c-2-tern-answer-hint.mp3`, script: "Listen to the first line again. Which bird flies the farthest? What did the rest of the text do about that line?" },
      explain: { audio: `${Q}/c-2-tern-answer-explain.mp3`, script: "The purpose was to answer a question. The text opened by asking which bird flies the farthest, then handed you the arctic tern and backed it up. Top of the world to the bottom, every single year." },
      interaction: { type: "choose", options: [{ id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "answer-a-question", coachWrong: "The first line of this text set up a job for every other line. Play that first line back. What kind of line is it?" },
    },
    {
      id: "c-3-cactus-describe",
      band: "core",
      difficulty: 3,
      prompt: "What was this author's purpose?",
      narration: { audio: `${Q}/c-3-cactus-describe.mp3`, script: "Here is a fresh true text. A desert cactus stands like a tall green tower. Its skin is smooth and waxy. Its spines are sharp as needles. After a rain, the whole plant swells up, round and full of water. Think about why the author wrote it. Tap the author's purpose." },
      hint: { audio: `${Q}/c-3-cactus-describe-hint.mp3`, script: "This text never asked you anything, and it gave no moves in order. Listen to what it hands you instead. A tower, waxy skin, sharp needles." },
      explain: { audio: `${Q}/c-3-cactus-describe-explain.mp3`, script: "The purpose was to describe what it is like. A tall green tower, waxy skin, needle sharp spines, a plant that swells after rain. The author painted the cactus in words so you could see and almost touch it." },
      interaction: { type: "choose", options: [{ id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "describe-what-it-is-like", coachWrong: "Every line handed you another detail of one plant, what it looks like and feels like. Which purpose is that?" },
    },
    {
      id: "c-4-syrup-clue",
      band: "core",
      difficulty: 4,
      prompt: "Which clue shows this author's purpose?",
      narration: { audio: `${Q}/c-4-syrup-clue.mp3`, script: "Here is a fresh true text about maple syrup. First, farmers drill a small hole in a maple tree. Then, sweet sap drips out into a bucket. Last, the sap gets boiled and boiled until it thickens into syrup. Now point at the evidence. Tap the clue that shows this author's purpose." },
      hint: { audio: `${Q}/c-4-syrup-clue-hint.mp3`, script: "Listen to the order words. First the hole, then the sap, last the boiling. What shape is that?" },
      explain: { audio: `${Q}/c-4-syrup-clue-explain.mp3`, script: "The clue was steps from first to last. First drill, then drip, last boil. When a text moves in ordered steps, that is your evidence the author wrote it to explain how something gets made." },
      interaction: { type: "choose", options: [{ id: "steps-from-first-to-last", label: "steps from first to last" }, { id: "a-question-at-the-very-start", label: "a question at the very start" }, { id: "words-that-paint-a-picture", label: "words that paint a picture" }, { id: "a-talking-maple-tree", label: "a talking maple tree" }], correctId: "steps-from-first-to-last", coachWrong: "Walk the syrup text again in your mind. First, then, last. Which clue did you actually hear inside it?" },
    },
    {
      id: "c-5-sort-first-lines",
      band: "core",
      difficulty: 5,
      prompt: "Sort each line to its purpose.",
      narration: { audio: `${Q}/c-5-sort-first-lines.mp3`, script: "Here are six brand new first lines from six different texts. Read each line, think about what its author came to do, and drag it to that purpose." },
      hint: { audio: `${Q}/c-5-sort-first-lines-hint.mp3`, script: "Does the line ask something, give one step of a job, or paint a picture in words? That is its purpose." },
      explain: { audio: `${Q}/c-5-sort-first-lines-explain.mp3`, script: "The asking lines belong to answer. Where do bats sleep, and how deep is the sea. The step lines belong to explain. First the rain falls, then the river rises. And the word picture lines belong to describe. A moose is tall and heavy, the cave is dark and cool." },
      interaction: { type: "sort", buckets: ["Answer","Explain","Describe"], bucketAudio: { "Answer": `${Q}/b-answer.mp3`, "Explain": `${Q}/b-explain.mp3`, "Describe": `${Q}/b-describe.mp3` }, items: [{ label: "where do bats sleep?", bucket: "Answer" }, { label: "how deep is the sea?", bucket: "Answer" }, { label: "first the rain falls", bucket: "Explain" }, { label: "then the river rises", bucket: "Explain" }, { label: "a moose is tall and heavy", bucket: "Describe" }, { label: "the cave is dark and cool", bucket: "Describe" }], coachWrong: "Read the line again. Does it ask something, give one step in order, or paint a picture in words? Drag it to the purpose that fits." },
    },
    {
      id: "c-6-speak-answer",
      band: "core",
      difficulty: 6,
      prompt: "Say the author's purpose out loud.",
      narration: { audio: `${Q}/c-6-speak-answer.mp3`, script: "Now you say it. Listen to this tiny true text. Where does rain come from? Rain falls from clouds, when their tiny water drops grow too heavy to float. The text opened by asking, then handed you exactly what you asked for. This author's purpose has a name. Tap the mic and say the purpose." },
      hint: { audio: `${Q}/c-6-speak-answer-hint.mp3`, script: "The text asked where rain comes from, and then it gave that very thing back. Say what the author came to do." },
      explain: { audio: `${Q}/c-6-speak-answer-explain.mp3`, script: "The purpose was to answer. The text opened with a question about rain and gave the answer right back. When a text is built around one question, its author wrote it to answer." },
      interaction: { type: "speak", text: "answer answers answered" },
    },
    {
      id: "h-1-persuade-bike-lanes",
      band: "harder",
      difficulty: 1,
      prompt: "What is this author doing?",
      narration: { audio: `${Q}/h-1-persuade-bike-lanes.mp3`, script: "Third grade readers meet one more purpose. Sometimes an author writes to persuade you, to talk you into something. Listen. Our town needs more bike lanes. Bike lanes keep riders safe and traffic calm. Tell the town council to paint new lanes this year! Feel that push? Tap what this author is doing." },
      hint: { audio: `${Q}/h-1-persuade-bike-lanes-hint.mp3`, script: "The text is not handing you a picture or steps. It ends by telling you to go do something." },
      explain: { audio: `${Q}/h-1-persuade-bike-lanes-explain.mp3`, script: "This author wants to persuade the reader. The text gives reasons and then pushes you to act, tell the town council. Talking you into something is the fourth purpose, and third graders spot it everywhere." },
      interaction: { type: "choose", options: [{ id: "persuade-the-reader", label: "persuade the reader" }, { id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "describe-what-it-is-like", label: "describe what it is like" }], correctId: "persuade-the-reader", coachWrong: "The stimulus taught a brand new purpose, the one that pushes the reader to act. That is the one this text is doing." },
    },
    {
      id: "h-2-whale-paragraph",
      band: "harder",
      difficulty: 2,
      prompt: "What is the purpose of this one paragraph?",
      narration: { audio: `${Q}/h-2-whale-paragraph.mp3`, script: "Here is a third grade move. One book can hold different purposes in different parts, so readers name the purpose of one paragraph at a time. Listen to just one paragraph from a true whale book. A humpback whale sings in long, low notes. Its song rolls through the dark water for miles. One song can last for hours. Tap the purpose of that one paragraph." },
      hint: { audio: `${Q}/h-2-whale-paragraph-hint.mp3`, script: "Just this paragraph. No asking, no moves in order. Listen to what its words hand you. Long low notes, dark water, hours of song." },
      explain: { audio: `${Q}/h-2-whale-paragraph-explain.mp3`, script: "That paragraph's purpose was to describe what it is like. Long low notes rolling through dark water for miles. The paragraph paints the whale's song. Another paragraph of the same book might explain or answer, so strong readers check one paragraph at a time." },
      interaction: { type: "choose", options: [{ id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "persuade-the-reader", label: "persuade the reader" }], correctId: "describe-what-it-is-like", coachWrong: "Stay inside that one paragraph. Did it ask, give steps, push you to act, or paint the song in words?" },
    },
    {
      id: "h-3-spot-persuade",
      band: "harder",
      difficulty: 3,
      prompt: "Which author wants to persuade?",
      narration: { audio: `${Q}/h-3-spot-persuade.mp3`, script: "You just met persuade, the purpose that talks the reader into something. Here are four first lines from four different texts. One of these authors is pushing you to act. Tap that author's line." },
      hint: { audio: `${Q}/h-3-spot-persuade-hint.mp3`, script: "Three lines hand you facts or pictures. One line tells you to go do something. Find the push." },
      explain: { audio: `${Q}/h-3-spot-persuade-explain.mp3`, script: "Join the reading club today is the persuading line. It pushes you to act right now. The otter line paints a picture, the eggs line gives a step, and the owl line asks a question the text will answer." },
      interaction: { type: "choose", options: [{ id: "join-the-reading-club-today", label: "join the reading club today" }, { id: "an-otters-fur-is-thick", label: "an otter's fur is thick" }, { id: "first-the-eggs-hatch", label: "first the eggs hatch" }, { id: "where-do-owls-nest", label: "where do owls nest?" }], correctId: "join-the-reading-club-today", coachWrong: "Read each line and ask, is this one telling ME to do something? Only one line gives the reader a push." },
    },
    {
      id: "h-4-speak-persuade",
      band: "harder",
      difficulty: 4,
      prompt: "Say this author's purpose out loud.",
      narration: { audio: `${Q}/h-4-speak-persuade.mp3`, script: "Last one, and you say it like a third grader. An author writes, our class should get ten extra minutes of reading time every day, and here are three good reasons why! That author is talking you into something, and that purpose has a name. You just met it. Tap the mic and say the purpose." },
      hint: { audio: `${Q}/h-4-speak-persuade-hint.mp3`, script: "It is the fourth purpose, the pushy one. It starts like the word person. Say it." },
      explain: { audio: `${Q}/h-4-speak-persuade-explain.mp3`, script: "The purpose is to persuade. The author stacks reasons and pushes for extra reading time. When a text works to talk you into something, its author wrote it to persuade." },
      interaction: { type: "speak", text: "persuade persuades persuading persuaded" },
    },
  ],
};
