import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Find It Fast QUIZ (RI.2.5) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed. ALL FRESH stimuli (no owl-lesson
// recall): easier = tiny spoken feature stimuli (dog book contents, rabbit
// book heading, cardinal caption, fox book glossary) with picture support;
// core = an original true book "Amazing Ants" whose contents, headings, bold
// word, caption, and glossary are spoken per question; harder = G3 transfer
// taught in the stimulus (the index, index vs contents, sidebars, name the
// tool out loud). All facts true: ant nests hold rooms and tunnels dug by
// workers, ants smell and touch with antennae, an ant can lift many times its
// own weight, a larva is a baby ant, cardinals stay all winter, a baby fox is
// a kit and its home is a den.

const Q = "/audio/quizzes-v2/find-it-fast-quiz";
const IMG = (w: string) => `/images/lessons-v2/find-it-fast/${w.toLowerCase()}.png`;

export const findItFastQuiz: QuizDef = {
  id: "find-it-fast-quiz",
  lessonId: "find-it-fast",
  title: "Find It Fast Quiz",
  standard: "RI.2.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-dog-contents",
      band: "easier",
      difficulty: 1,
      prompt: "Which page do you turn to?",
      image: IMG("puppy"),
      narration: { audio: `${Q}/e-1-dog-contents.mp3`, script: "Listen to the contents page of a true dog book. Puppy Care, page 3. Dog Tricks, page 7. You want to teach your dog to sit. Which page do you turn to? Tap it." },
      hint: { audio: `${Q}/e-1-dog-contents-hint.mp3`, script: "Sit is a trick. Listen to the contents again. Which part is about tricks?" },
      explain: { audio: `${Q}/e-1-dog-contents-explain.mp3`, script: "Page 7 is the one. The contents said Dog Tricks starts on page 7, and teaching your dog to sit is a trick. The contents points you straight there." },
      interaction: { type: "choose", options: [{ id: "page-7", label: "page 7" }, { id: "page-3", label: "page 3" }], correctId: "page-7", coachWrong: "Say your need again. You want to teach a trick. Which part name matches that, and which page sits beside it?" },
    },
    {
      id: "e-2-rabbit-heading",
      band: "easier",
      difficulty: 2,
      prompt: "What will the Rabbit Homes page tell?",
      image: IMG("rabbit"),
      narration: { audio: `${Q}/e-2-rabbit-heading.mp3`, script: "Here is a page from a true rabbit book. The big name at the top of the page says, Rabbit Homes. A heading like that names what its page is about. What will this page tell about? Tap it." },
      hint: { audio: `${Q}/e-2-rabbit-heading-hint.mp3`, script: "Say the heading to yourself. Rabbit Homes. A home is a place." },
      explain: { audio: `${Q}/e-2-rabbit-heading-explain.mp3`, script: "It will tell where rabbits live. The heading Rabbit Homes names the page's topic, and a home is where an animal lives." },
      interaction: { type: "choose", options: [{ id: "where-rabbits-live", label: "where rabbits live" }, { id: "what-rabbits-eat", label: "what rabbits eat" }], correctId: "where-rabbits-live", coachWrong: "The heading is Rabbit Homes. Think about what a home is. Which choice matches that?" },
    },
    {
      id: "e-3-cardinal-caption",
      band: "easier",
      difficulty: 3,
      prompt: "What did the caption tell you?",
      image: IMG("cardinal"),
      narration: { audio: `${Q}/e-3-cardinal-caption.mp3`, script: "In a true bird book, under a picture of a red bird, sit these words. A cardinal stays all winter. Words under a picture like that are its caption. What did the caption tell you? Tap it." },
      hint: { audio: `${Q}/e-3-cardinal-caption-hint.mp3`, script: "Play the caption back in your mind. It told what the cardinal does all winter." },
      explain: { audio: `${Q}/e-3-cardinal-caption-explain.mp3`, script: "The caption said the bird stays all winter. A caption sits under a picture and hands you a fact about it, and that fact is true. Cardinals do not fly away for winter." },
      interaction: { type: "choose", options: [{ id: "the-bird-stays-all-winter", label: "the bird stays all winter" }, { id: "the-bird-sleeps-all-summer", label: "the bird sleeps all summer" }], correctId: "the-bird-stays-all-winter", coachWrong: "Listen to the caption once more in your head. A cardinal stays all winter. Which choice says that?" },
    },
    {
      id: "e-4-fox-glossary",
      band: "easier",
      difficulty: 4,
      prompt: "Where do you look up kit?",
      image: IMG("fox"),
      narration: { audio: `${Q}/e-4-fox-glossary.mp3`, script: "Listen to the glossary of a true fox book, the word list in the back. den: a fox's home. kit: a baby fox. Later you forget what kit means. Where do you look? Tap it." },
      hint: { audio: `${Q}/e-4-fox-glossary-hint.mp3`, script: "You need the part of the book that holds words and their meanings." },
      explain: { audio: `${Q}/e-4-fox-glossary-explain.mp3`, script: "You look in the glossary. It is the book's own word list in the back, and it told you a kit is a baby fox." },
      interaction: { type: "choose", options: [{ id: "the-glossary", label: "the glossary" }, { id: "the-front-cover", label: "the front cover" }], correctId: "the-glossary", coachWrong: "One choice holds a word list with meanings. One is just the outside of the book. Which one helps with a word?" },
    },
    {
      id: "c-1-ants-contents",
      band: "core",
      difficulty: 1,
      prompt: "Which page do you turn to?",
      narration: { audio: `${Q}/c-1-ants-contents.mp3`, script: "Here is the contents page of a true book called Amazing Ants. Ant Bodies, page 2. Ant Homes, page 5. Ant Jobs, page 9. Glossary, page 12. You want to see the rooms and tunnels ants dig. Which page do you turn to? Tap it." },
      hint: { audio: `${Q}/c-1-ants-contents-hint.mp3`, script: "Rooms and tunnels are the places ants live. Which part name matches that?" },
      explain: { audio: `${Q}/c-1-ants-contents-explain.mp3`, script: "Page 5 is the one. Rooms and tunnels are an ant's home, and the contents said Ant Homes starts on page 5. Match your need to a part name, then take its page number." },
      interaction: { type: "choose", options: [{ id: "page-5", label: "page 5" }, { id: "page-2", label: "page 2" }, { id: "page-9", label: "page 9" }, { id: "page-12", label: "page 12" }], correctId: "page-5", coachWrong: "Think about where rooms and tunnels belong. Scan the part names again, and take the page beside the one that fits." },
    },
    {
      id: "c-2-ant-jobs-heading",
      band: "core",
      difficulty: 2,
      prompt: "Which question will Ant Jobs answer?",
      narration: { audio: `${Q}/c-2-ant-jobs-heading.mp3`, script: "One part of Amazing Ants starts on page 9, and its heading is Ant Jobs. A heading names what its part is about. Which question will that part answer? Tap it." },
      hint: { audio: `${Q}/c-2-ant-jobs-heading-hint.mp3`, script: "Say the heading again. Ant Jobs. A job is something you do." },
      explain: { audio: `${Q}/c-2-ant-jobs-heading-explain.mp3`, script: "It will answer what work ants do. A job is work, so the part called Ant Jobs tells about the work each ant does. The heading told you before you read one word." },
      interaction: { type: "choose", options: [{ id: "what-work-ants-do", label: "what work ants do" }, { id: "how-long-ants-live", label: "how long ants live" }, { id: "where-ants-build-nests", label: "where ants build nests" }, { id: "what-ants-look-like", label: "what ants look like" }], correctId: "what-work-ants-do", coachWrong: "A job is something you do, like digging or carrying. Which question asks about doing?" },
    },
    {
      id: "c-3-bold-antennae",
      band: "core",
      difficulty: 3,
      prompt: "Which tool gives the exact meaning?",
      narration: { audio: `${Q}/c-3-bold-antennae.mp3`, script: "Page 2 of Amazing Ants says, an ant smells and touches with its two antennae. The word antennae is printed dark and thick. It is a bold word, and you want its exact meaning. Which tool do you turn to? Tap it." },
      hint: { audio: `${Q}/c-3-bold-antennae-hint.mp3`, script: "You are hunting a word's meaning, not a page and not a picture." },
      explain: { audio: `${Q}/c-3-bold-antennae-explain.mp3`, script: "The glossary is the tool. Bold words are the book's important words, and the glossary in the back lists them and tells exactly what each one means." },
      interaction: { type: "choose", options: [{ id: "the-glossary", label: "the glossary" }, { id: "the-table-of-contents", label: "the table of contents" }, { id: "a-caption", label: "a caption" }, { id: "a-page-number", label: "a page number" }], correctId: "the-glossary", coachWrong: "One tool is the book's own word list with meanings. That is the one a bold word needs." },
    },
    {
      id: "c-4-ant-caption",
      band: "core",
      difficulty: 4,
      prompt: "What fact did the caption give?",
      narration: { audio: `${Q}/c-4-ant-caption.mp3`, script: "On page 5 of Amazing Ants, under a picture of an ant nest, sits this caption. Worker ants dig new rooms every day. What fact did the caption hand you? Tap it." },
      hint: { audio: `${Q}/c-4-ant-caption-hint.mp3`, script: "Play the caption back in your mind. It told what worker ants do every day." },
      explain: { audio: `${Q}/c-4-ant-caption-explain.mp3`, script: "The caption said ants dig new rooms each day. A caption sits under a picture and adds a real fact of its own, and that one is true. Worker ants keep digging their nest bigger." },
      interaction: { type: "choose", options: [{ id: "ants-dig-new-rooms-each-day", label: "ants dig new rooms each day" }, { id: "ants-build-rooms-of-paper", label: "ants build rooms of paper" }, { id: "ants-fill-rooms-with-water", label: "ants fill rooms with water" }, { id: "ants-sing-in-their-rooms", label: "ants sing in their rooms" }], correctId: "ants-dig-new-rooms-each-day", coachWrong: "Listen to the caption once more in your head. What did it say worker ants do every day?" },
    },
    {
      id: "c-5-sort-tool-jobs",
      band: "core",
      difficulty: 5,
      prompt: "Which tool does each job? Sort them.",
      narration: { audio: `${Q}/c-5-sort-tool-jobs.mp3`, script: "Amazing Ants keeps a contents page at the front and a glossary at the back. Here are six reader jobs. Read each job, think about which tool does it, and drag it to that tool." },
      hint: { audio: `${Q}/c-5-sort-tool-jobs-hint.mp3`, script: "One tool finds parts of the book. One tool tells what words mean. Which does your job need?" },
      explain: { audio: `${Q}/c-5-sort-tool-jobs-explain.mp3`, script: "The contents finds parts, so finding the ant jobs part, seeing where parts start, and getting to page nine fast all belong to it. The glossary tells meanings, so learning what larva means, looking up a bold word, and finding a word's meaning belong there." },
      interaction: { type: "sort", buckets: ["Contents","Glossary"], bucketAudio: { "Contents": `${Q}/b-contents.mp3`, "Glossary": `${Q}/b-glossary.mp3` }, items: [{ label: "find the ant jobs part", bucket: "Contents" }, { label: "see where parts start", bucket: "Contents" }, { label: "get to page nine fast", bucket: "Contents" }, { label: "learn what larva means", bucket: "Glossary" }, { label: "look up a bold word", bucket: "Glossary" }, { label: "find a word's meaning", bucket: "Glossary" }], coachWrong: "Read the job again. Is it hunting a part of the book, or hunting what a word means? Drag it to the tool with that job." },
    },
    {
      id: "c-6-read-caption",
      band: "core",
      difficulty: 6,
      prompt: "Read aloud: Worker ants dig new rooms.",
      narration: { audio: `${Q}/c-6-read-caption.mp3`, script: "Here is a caption from Amazing Ants, sitting under a picture of an ant nest. Tap the mic and read the caption out loud." },
      hint: { audio: `${Q}/c-6-read-caption-hint.mp3`, script: "Take one big breath first. Then read the whole caption in one clear voice." },
      explain: { audio: `${Q}/c-6-read-caption-explain.mp3`, script: "Here is how it sounds. Worker ants dig new rooms. Reading a caption out loud helps its fact stick in your mind." },
      interaction: { type: "speak", text: "Worker ants dig new rooms" },
    },
    {
      id: "h-1-ant-index",
      band: "harder",
      difficulty: 1,
      prompt: "Which tool lists every queen page?",
      narration: { audio: `${Q}/h-1-ant-index.mp3`, script: "Third grade readers know one more tool. In the very back of many fact books lives the index, an A to Z list of every small topic in the book, with every page where it appears. You want every page of Amazing Ants that mentions the queen. Which tool lists them all? Tap it." },
      hint: { audio: `${Q}/h-1-ant-index-hint.mp3`, script: "You want every page for one small topic, not just where a big part begins." },
      explain: { audio: `${Q}/h-1-ant-index-explain.mp3`, script: "The index in the back is the tool. It lists every small topic from A to Z with every page where it appears, so queen would sit there with all its pages beside it." },
      interaction: { type: "choose", options: [{ id: "the-index-in-the-back", label: "the index in the back" }, { id: "the-table-of-contents", label: "the table of contents" }, { id: "a-caption", label: "a caption" }, { id: "a-bold-word", label: "a bold word" }], correctId: "the-index-in-the-back", coachWrong: "The stimulus taught a new A to Z tool that tracks every page for every small topic. That is the one you need." },
    },
    {
      id: "h-2-index-or-contents",
      band: "harder",
      difficulty: 2,
      prompt: "Which tool is faster for that job?",
      narration: { audio: `${Q}/h-2-index-or-contents.mp3`, script: "Now choose between two tools, like a third grader. The table of contents lists the book's few big parts, in order, with the page where each begins. The index lists every small topic from A to Z. Here is your job. You want the one page where the part called Ant Homes begins. Which tool is faster? Tap it." },
      hint: { audio: `${Q}/h-2-index-or-contents-hint.mp3`, script: "Ant Homes is a big part of the book, not a small topic. Which tool tracks the big parts?" },
      explain: { audio: `${Q}/h-2-index-or-contents-explain.mp3`, script: "The table of contents is faster. Ant Homes is one of the book's big parts, and the contents lists each big part with the page where it begins. The index would work, but you would dig through every small topic first." },
      interaction: { type: "choose", options: [{ id: "the-table-of-contents", label: "the table of contents" }, { id: "the-index", label: "the index" }, { id: "the-glossary", label: "the glossary" }, { id: "a-caption", label: "a caption" }], correctId: "the-table-of-contents", coachWrong: "Is Ant Homes a big part of the book or one small topic? Pick the tool that tracks that kind of thing." },
    },
    {
      id: "h-3-ant-sidebar",
      band: "harder",
      difficulty: 3,
      prompt: "Where did the extra fact live?",
      narration: { audio: `${Q}/h-3-ant-sidebar.mp3`, script: "Some fact book pages hold a sidebar, a small box beside the main words with one extra fact inside. A sidebar in Amazing Ants says, one ant can lift many times its own weight. Where did that extra fact live? Tap it." },
      hint: { audio: `${Q}/h-3-ant-sidebar-hint.mp3`, script: "The stimulus named the spot. A small box sitting beside the main words." },
      explain: { audio: `${Q}/h-3-ant-sidebar-explain.mp3`, script: "It lived in a box beside the words, the sidebar. Authors put one extra fact there so it will not interrupt the main words, and that lifting fact is true." },
      interaction: { type: "choose", options: [{ id: "in-a-box-beside-the-words", label: "in a box beside the words" }, { id: "in-the-table-of-contents", label: "in the table of contents" }, { id: "in-the-glossary-list", label: "in the glossary list" }, { id: "on-the-front-cover", label: "on the front cover" }], correctId: "in-a-box-beside-the-words", coachWrong: "Think about where a sidebar sits on the page. It is not at the front or the back of the book." },
    },
    {
      id: "h-4-speak-tool-name",
      band: "harder",
      difficulty: 4,
      prompt: "Say it: which tool tells word meanings?",
      narration: { audio: `${Q}/h-4-speak-tool-name.mp3`, script: "Last one, and you say it like a third grade reader. You are reading a true shark book and you hit the word gills, with no clue nearby. One book tool lists the hard words and tells their meanings. Say that tool's name. Tap the mic and say it." },
      hint: { audio: `${Q}/h-4-speak-tool-name-hint.mp3`, script: "It is the word list waiting in the back of the book. Say its name." },
      explain: { audio: `${Q}/h-4-speak-tool-name-explain.mp3`, script: "The glossary is the tool. When no clue sits near a hard word, the glossary in the back lists the word and tells you just what it means." },
      interaction: { type: "speak", text: "glossary glossaries" },
    },
  ],
};
