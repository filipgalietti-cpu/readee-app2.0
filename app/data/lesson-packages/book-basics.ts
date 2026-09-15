import type {
  LessonDef,
  SceneDef,
  ChooseDef,
  PrintPageDef,
  TransformDef,
} from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { bookBasics } from "@/app/data/lessons-v2/book-basics";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
import { printPagePositions, printPageText } from "@/lib/lesson-engine/delivery/print-page";
// Preserve the human-reviewed source. Adaptations and new transfer items await educator review.
export const wormAsset = (name: string) => `/lesson-studio/book-basics/${name}`;
const pic = (name: string) => wormAsset(name + ".webp");
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
const reveal = (image: string, sentence: string) => ({
  image: pic(image),
  alt: sentence,
  sentence,
});
export const wormPageOne = {
  lines: [
    ["A", "cat", "can", "hop."],
    ["The", "cat", "can", "nap."],
  ],
};
export const wormPageTwo = {
  lines: [
    ["A", "dog", "can", "sit."],
    ["It", "can", "run."],
  ],
};
const photoVisual = (image: string, alt: string) => ({
  id: "worm-photo",
  props: { image: pic(image), alt },
});
const pageVisual = (page: PrintPageDef, pageNumber = 1) => ({
  id: "worm-page",
  props: {
    lines: JSON.stringify(page.lines),
    pageNumber,
    markerId: page.markerId || "",
    showSpaces: !!page.showSpaces,
  },
});
export function wormPrintChoice(
  page: PrintPageDef,
  correctId: string,
  acceptedIds?: string[],
): ChooseDef {
  return {
    type: "choose",
    printPage: page,
    options: printPagePositions(page).map(({ id, label }) => ({ id, label })),
    correctId,
    ...(acceptedIds ? { acceptedIds } : {}),
  };
}
function printTask(
  id: string,
  page: PrintPageDef,
  correctId: string,
  prompt: string,
  correct: string,
  hint: string,
  acceptedIds?: string[],
): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "practice",
    prompt,
    narration: n(prompt),
    interaction: wormPrintChoice(page, correctId, acceptedIds),
    feedback: f(correct, hint),
  };
}
function read(id: string, text: string, image: string): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "practice",
    prompt: "Read with Luna.",
    narration: n("Read with Luna. Follow the words, then tap the microphone."),
    interaction: {
      type: "speak",
      mode: "read",
      text,
      allowHear: true,
      autoStop: true,
      completionPolicy: "practice-coverage",
      success: reveal(image, text),
    },
    feedback: f(
      "You followed the words. Now we can see what they tell us!",
      "Listen and follow each word. Then try reading with Luna.",
    ),
  };
}
export const wormWarmup = {
  title: "Wormy’s Word Trail",
  actorName: "Wormy",
  eyebrow: "A garden trail before our book",
  goalLabel: "the leaf",
  goalImage: wormAsset("leaf.svg"),
  boardLabel: "Guide Wormy through the garden paths",
  winTitle: "You found the leaf!",
  winMessage: "A little explorer, ready for a book.",
  emptyMessage: "Good exploring. Our book is ready!",
  nextLabel: "Open Wormy’s book",
  introTitle: "Find a path to the leaf",
  introDescription: "Drag Wormy or use the arrows. Gather carrots on the way.",
  trailMark: "dots" as const,
  seconds: 45,
  backdrop: pic("garden-floor"),
  greeting: "Welcome to Wormy’s Word Trail! Help Wormy find the leaf. Tap Let’s play to begin.",
  intro:
    "Drag Wormy along the paths, or use the arrow buttons. Pick up carrots on your way to the leaf. You have forty-five seconds. Ready?",
  finish:
    "You found the leaf! Keep your carrots, plus two for warming up. Now let’s follow the words in Wormy’s book.",
  emptyFinish:
    "Good exploring! Keep your carrots, plus two for warming up. Now let’s follow the words in Wormy’s book.",
};
export const wormWelcome =
  "Welcome to Wormy’s Word Trail! Play a little garden game. Then help Wormy find a path through the words in a book.";
export const wormCompletion =
  "You helped Wormy follow the words! Across a line, down to the next line, and on to the next page. Now you are ready to practice with new pages.";
export const wormLearned = [
  "Start at the top left of our English page.",
  "Follow words across, then down to the next line.",
  "Find the spaces between words.",
];
const states: NonNullable<TransformDef["states"]> = [
  {
    id: "across",
    label: "Across the line",
    text: "Across the line.",
    script: "Across the line. Start on the left. A cat can hop.",
    visual: { ...pageVisual(wormPageOne).props, readingLine: 0 },
  },
  {
    id: "down",
    label: "Next line",
    text: "Down and back to the left.",
    script: "Down and back to the left. The cat can nap.",
    visual: { ...pageVisual({ ...wormPageOne, markerId: "word-1-0" }).props, readingLine: 1 },
  },
  {
    id: "page",
    label: "Next page",
    text: "Turn to the next page.",
    script: "Turn to the next page. Start at the top left again. A dog can sit. It can run.",
    visual: { ...pageVisual(wormPageTwo, 2).props, readingLine: -1 },
  },
];
export const wormLesson: LessonDef = {
  ...bookBasics,
  id: "book-basics-coached-v1",
  title: "Wormy’s Word Trail",
  objective:
    "Follow English print left to right, top to bottom and page to page (RF.K.1a). With support, identify spaces between words (RF.K.1c) and connect a spoken word to its printed letters (RF.K.1b). Supported reading does not establish independent decoding. Spatial tasks assess print direction, not remembering left/right vocabulary alone.",
  completion: {
    title: "Ready to practice!",
    body: "Follow new word trails.",
    script: wormCompletion,
  },
  scenes: [
    {
      id: "garden-book",
      purpose: "hook",
      gate: "none",
      evidence: "demonstration",
      prompt: "A garden. A book. A word trail.",
      visual: photoVisual(
        "opening",
        "Wormy, a green bookworm with glasses, beside an open book in a sunny garden nook.",
      ),
      narration: n(
        "A garden. A book. A word trail. Wormy loves books! Our book has English words. Let’s find where they start and where they go.",
      ),
    },
    {
      id: "follow-print",
      purpose: "model",
      gate: "interaction",
      evidence: "demonstration",
      prompt: "Choose a part of the trail.",
      visual: pageVisual(wormPageOne),
      narration: n(
        "Choose a part of the trail. In our English book, start at the top left. Follow the words across the line. Then go down and back to the left. At the end of the page, turn to the next page. Try each button.",
      ),
      interaction: {
        type: "transform",
        control: "toggle",
        base: "",
        add: "",
        result: "",
        changeIndex: 0,
        states,
      },
    },
    printTask(
      "find-start",
      wormPageOne,
      "word-0-0",
      "Tap the word where we start this page.",
      "Start with the first word at the top left.",
      "Look at the top line. Find the word on its left end.",
    ),
    printTask(
      "follow-cat",
      { ...wormPageOne, markerId: "word-0-1" },
      "word-0-2",
      "We just read the marked word. Tap the word we read next.",
      "Move to the next word on the right.",
      "Find the mark. Move to the next word on its right.",
    ),
    printTask(
      "return-sweep",
      { ...wormPageOne, markerId: "word-0-3" },
      "word-1-0",
      "We finished the top line. Tap where we read next.",
      "Go down one line and back to the left.",
      "The top line is finished. Find the left end of the line below.",
    ),
    {
      id: "notice-spaces",
      purpose: "guided",
      gate: "interaction",
      evidence: "practice",
      prompt: "Words have spaces between them.",
      narration: n("Words have spaces between them. Listen: A cat naps. There are two gaps between these three words. Tap both gaps."),
      interaction: {
        ...wormPrintChoice({ lines: [["A", "cat", "naps."]], showSpaces: true }, "space-0-0"),
        collectAll: { ids: ["space-0-0", "space-0-1"], progressScript: "You found one gap. Find the other gap." },
      },
      feedback: f("You found both gaps! A space separates A and cat. Another space separates cat and naps.", "Look for the empty gaps between the words. Tap each gap."),
    },
    {
      ...printTask(
        "find-gap",
        { lines: [["A", "dog", "sits."]], showSpaces: true },
        "space-0-0",
        "Find both spaces between the words.",
        "You found both spaces! Each gap separates two words.",
        "Look for an empty gap, not the letters in a word.",
      ),
      interaction: {
        ...wormPrintChoice({ lines: [["A", "dog", "sits."]], showSpaces: true }, "space-0-0"),
        collectAll: { ids: ["space-0-0", "space-0-1"], progressScript: "You found one gap. Find the other gap." },
      },
    },
    {
      id: "spoken-written",
      purpose: "model",
      gate: "none",
      evidence: "demonstration",
      prompt: "A word we say. A word in print.",
      visual: { id: "worm-letters", props: { word: "cat" } },
      narration: n(
        "A word we say. A word in print. Say cat. We write that word with these three letters, in this order. The letters stay together inside the word. Spaces separate this word from other words.",
      ),
    },
    read("read-cat", "The cat can nap.", "cat-nap"),
    {
      id: "page-path",
      purpose: "guided",
      gate: "interaction",
      evidence: "practice",
      prompt: "Put our reading moves in order.",
      narration: n(
        "Put our reading moves in order. Start at the top left. Read across each line and go down to the next. Turn the page when its words are done. Then check your order.",
      ),
      interaction: {
        type: "sequence",
        items: [
          { id: "start", label: "Start at the top left." },
          { id: "lines", label: "Read across, then down." },
          { id: "turn", label: "Turn to the next page." },
        ],
        order: ["start", "lines", "turn"],
        result: "Start at the top left, read across and down, then turn the page.",
        success: {
          image: wormAsset("reading-moves.svg"),
          alt: "Three reading moves: start at the top left, follow each line across and down, then turn to the next page.",
          sentence: "Start at the top left, read across and down, then turn the page.",
        },
      },
      feedback: f(
        "Start at the top left, read across and down, then turn the page.",
        "Begin on this page. Turn it after you finish its words.",
      ),
    },
    {
      id: "ready-trails",
      purpose: "celebrate",
      gate: "none",
      evidence: "demonstration",
      prompt: "Your next word trail is ready!",
      visual: photoVisual("opening", "Wormy beside his garden book."),
      narration: n("Your next word trail is ready! " + wormCompletion),
    },
  ],
};
export const wormSourceQuestions = [
  {
    id: "RF.K.1a-Q1",
    prompt:
      "After you have read all the words on one page of your book, what is the best way to find the next part of the story?",
    choices: [
      "Close the book and pick a new one.",
      "Turn to the next page to continue reading.",
      "Read the same page again from the beginning.",
      "Look for words in the middle of the page you just finished.",
    ],
    correct: "Turn to the next page to continue reading.",
    hint: "Think about how we move through a book to keep reading the story.",
    correct_feedback:
      "Yes! When a page is done, you turn to the next page to keep reading. Great job!",
    incorrect_feedback:
      "Hmm, the story is not over yet! You read all the words on this page. Where does the story keep going?",
  },
  {
    id: "RF.K.1a-Q3",
    prompt: "When you finish a PAGE, what do you do?",
    choices: [
      "Start over from the beginning",
      "Skip to the last page",
      "Close the book",
      "Turn to the next page",
    ],
    correct: "Turn to the next page",
    hint: "We read page by page — one after another!",
    correct_feedback: "Yes! When a page is done, you turn to the next page. Great job!",
    incorrect_feedback:
      "Almost! The book still has more story to read. What do you do so you can keep going?",
  },
  {
    id: "RF.K.1a-Q5",
    prompt: "Where do you START reading on a page?",
    choices: ["Bottom right corner", "Bottom left corner", "Top left corner", "Top right corner"],
    correct: "Top left corner",
    hint: "Reading starts at the very beginning. Where is the beginning of a page — top or bottom? Left or right?",
    correct_feedback: "Yes! We start reading at the top left corner. Great job!",
    incorrect_feedback:
      "Not yet! Think about where your eyes go first on a page. Is it the top or the bottom? Which side?",
  },
  {
    id: "RF.K.1a-H3",
    prompt:
      "You open your book to a brand-new page that is full of words. Which word do you read FIRST?",
    choices: [
      "The word at the bottom on the left",
      "The biggest word on the page",
      "The word at the top on the left",
      "The word at the top on the right",
    ],
    correct: "The word at the top on the left",
    hint: "Words start at the top of the page, and each line starts on the left side.",
    correct_feedback: "Yes! On a new page, you start at the top on the left. Great job!",
    incorrect_feedback:
      "Hmm, it is not the biggest word or the bottom word. Think about where reading always begins. Top or bottom? Which side?",
  },
];
export const wormSourceAdaptations: Record<string, string> = {
  lesson:
    "Keep Wormy and the human print goals; add real two-line pages and gap targets. Remove invented pauses at every space and whole-book reading mastery. English-print scope throughout. Original nine scenes remain untouched.",
  "RF.K.1a-Q2":
    "Replace verbal left/right options with an actual marked line and next-word target; record print direction.",
  "RF.K.1a-Q4":
    "Actually print The little bird / flew to its nest. Target flew on the next line. Replace contradictory right-next-to feedback with return sweep.",
  "RF.K.1a-Q7":
    "Keep The cat ran fast. as a displayed line; ask for its first printed word, without telling the direction in the question.",
  "RF.K.1a-Q8":
    "Use actual three-line print; target the immediately next line rather than a direction label.",
  "RF.K.1a-H1":
    "Keep Sam has a pet. / We like him. as two sentences; replace one-sentence claim and detached choices with actual positional taps.",
  "RF.K.1a-H2":
    "Keep A fox can run / very fast today. and last-word target. Position rather than spelling is assessed.",
  "RF.K.1a-H4": "Use actual three-line print and an end-of-top-line mark; no skipped middle line.",
};
export const wormSourceHolds = {
  "RF.K.1a-H5":
    "Naming W does not decode was; retain for prerequisite-aware revision, not a print-direction score.",
};
type Sourced = PracticeQuestion & {
  sourceId: string;
  stimulusId: string;
  difficultyRationale: string;
  reviewStatus: string;
};
function check(
  id: string,
  band: Band,
  scene: SceneDef,
  sourceId = "book-basics/draft/" + id,
  rationale = "Apply English print direction to new positions, not word recognition.",
): Sourced {
  return {
    id: "worm-check/" + id,
    standard: "RF.K.1a",
    band,
    difficulty: { easier: 1, core: 2, harder: 3, challenging: 4 }[band],
    scene: { ...scene, purpose: "challenge", evidence: "assessed" },
    sourceId,
    stimulusId: sourceId,
    difficultyRationale: rationale,
    reviewStatus: "educator-review-required",
  };
}
function native(
  id: string,
  band: Band,
  page: PrintPageDef,
  key: string,
  prompt: string,
  feedback: string,
  hint: string,
  sourceId?: string,
): Sourced {
  return check(id, band, printTask(id, page, key, prompt, feedback, hint), sourceId);
}
const retained = wormSourceQuestions.map((q) =>
  check(
    q.id,
    q.id.endsWith("Q3") || q.id.endsWith("Q5") ? "easier" : q.id.endsWith("Q1") ? "core" : "harder",
    {
      id: q.id,
      purpose: "challenge",
      gate: "interaction",
      prompt: q.prompt,
      context: "We are reading an English book. It has more pages after this one.",
      narration: n([q.prompt, ...q.choices].join(" ")),
      interaction: {
        type: "choose",
        options: q.choices.map((label, i) => ({ id: String(i), label })),
        correctId: String(q.choices.indexOf(q.correct)),
      },
      feedback: { correct: q.correct_feedback, hint: q.hint, incorrect: q.incorrect_feedback },
    },
    q.id,
    "Retained human-authored page progression or starting-position concept with English-book context.",
  ),
);
export const wormChecks: Sourced[] = [
  native(
    "start-bug",
    "easier",
    { lines: [["A", "bug", "hops."]] },
    "word-0-0",
    "Tap where we start reading this line.",
    "Start at the left end of this line.",
    "Find the left end of this line.",
  ),
  native(
    "follow-start",
    "easier",
    { lines: [["A", "hen", "sits."]], markerId: "word-0-0" },
    "word-0-1",
    "We read the marked word. Tap the next word on this line.",
    "Move to the next word on the right.",
    "Find the mark and move one word to the right.",
  ),

  ...retained,
  native(
    "first-cat",
    "easier",
    { lines: [["The", "cat", "ran", "fast."]] },
    "word-0-0",
    "Tap the word we read first.",
    "Start at the left end of this line.",
    "Start at the left end of the line.",
    "RF.K.1a-Q7",
  ),
  native(
    "start-sun",
    "easier",
    { lines: [["The", "sun", "is", "up."]] },
    "word-0-0",
    "Tap where this line starts.",
    "Start at the left end of this line.",
    "Find the left end of the line.",
  ),
  native(
    "next-word",
    "core",
    { lines: [["A", "pig", "can", "dig."]], markerId: "word-0-1" },
    "word-0-2",
    "The marked word is done. Tap the next word.",
    "Move to the next word on the right.",
    "Move to the next word on the right.",
  ),
  native(
    "next-line",
    "core",
    {
      lines: [
        ["The", "hen", "sits."],
        ["The", "hen", "naps."],
      ],
      markerId: "word-0-2",
    },
    "word-1-0",
    "The top line is done. Tap the next word.",
    "Start the next line on the left.",
    "Go down one line and back to the left.",
    "RF.K.1a-Q2",
  ),
  check(
    "match-moves",
    "core",
    {
      id: "match-moves",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Match each stop to its next move.",
      narration: n(
        "Match each stop to its next move. Listen to where the reader stopped. Match it to what the reader does next. Then check your matches.",
      ),
      interaction: {
        type: "match",
        pairs: [
          { left: "In the middle of a line", right: "Read the word to the right." },
          { left: "At the end of the top line", right: "Start the line below on the left." },
          { left: "At the end of the page", right: "Turn to the next page." },
        ],
      },
      feedback: f(
        "Across a line, down to the next line, then on to the next page.",
        "Listen to where the reader stopped. Think about what comes next.",
      ),
    },
    undefined,
    "Recognize three described stop positions and match each to its appropriate next action. Labels are voiced; this is supported conceptual application, not decoding.",
  ),
  native(
    "sam-wrap",
    "harder",
    {
      lines: [
        ["Sam", "has", "a", "pet."],
        ["We", "like", "him."],
      ],
      markerId: "word-0-3",
    },
    "word-1-0",
    "We just read the marked word. Tap the next word.",
    "Start the next line on the left.",
    "Move down one line, then return to its left end.",
    "RF.K.1a-H1",
  ),
  native(
    "fox-last",
    "harder",
    {
      lines: [
        ["A", "fox", "can", "run"],
        ["very", "fast", "today."],
      ],
    },
    "word-1-2",
    "Tap the last word we read on this page.",
    "Read the last word on the bottom line.",
    "Follow the lines in order. Find the end of the final line.",
    "RF.K.1a-H2",
  ),
  native(
    "bird-wrap",
    "harder",
    {
      lines: [
        ["The", "little", "bird"],
        ["flew", "to", "its", "nest."],
      ],
      markerId: "word-0-2",
    },
    "word-1-0",
    "We just read the marked word. Tap the next word.",
    "Go down to the next line and start on the left.",
    "The top line has ended. Go to the left end of the next line.",
    "RF.K.1a-Q4",
  ),
  native(
    "three-lines",
    "challenging",
    {
      lines: [
        ["A", "bug", "hops."],
        ["It", "sits", "here."],
        ["It", "rests", "now."],
      ],
      markerId: "word-0-2",
    },
    "word-1-0",
    "We finished the marked word. Tap where we read next.",
    "Start the middle line on the left. Do not skip a line.",
    "Go down just one line, then back to its left end.",
    "RF.K.1a-H4",
  ),
  native(
    "middle-wrap",
    "challenging",
    {
      lines: [
        ["The", "dog", "sits."],
        ["The", "dog", "runs."],
        ["The", "dog", "rests."],
      ],
      markerId: "word-1-2",
    },
    "word-2-0",
    "We just read the marked word. Tap the next word.",
    "Start the bottom line on the left.",
    "Find the marked line. Move down to the very next line.",
    "RF.K.1a-Q8",
  ),
  native(
    "same-word",
    "challenging",
    {
      lines: [
        ["A", "cat", "can", "hop."],
        ["A", "cat", "can", "nap."],
      ],
      markerId: "word-1-1",
    },
    "word-1-2",
    "The marked word is done. Tap the next word.",
    "Move to the next word on this same line.",
    "Stay on the marked line and move one word to the right.",
  ),
  native(
    "final-position",
    "challenging",
    {
      lines: [
        ["A", "hen", "sits."],
        ["A", "pig", "digs."],
        ["A", "cat", "naps."],
      ],
    },
    "word-2-2",
    "Tap the last word we read on this whole page.",
    "Read the last word on the final line.",
    "Follow each line in order, all the way to the last line.",
  ),
];
export const wormLineContext = "Our English page has another line below the line we just finished.";
export const wormSpaceContext =
  "Look at this English sentence: A cat naps. There are gaps between its words.";
function oral(
  id: string,
  prompt: string,
  rubricId: string,
  image: string,
  answer: string,
  hint: string,
): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "practice",
    prompt,
    context: rubricId === "worm-next-line-v1" ? wormLineContext : wormSpaceContext,
    narration: n(prompt + " Tap the microphone and tell Luna."),
    interaction: {
      type: "speak",
      mode: "respond",
      text: prompt,
      rubricId,
      unclearScript: "I did not catch that yet. You can try again, or move on.",
      success: reveal(image, answer),
    },
    feedback: f(answer, hint),
  };
}
export const wormClosing: PracticeQuestion[] = [
  read("read-dog", "The dog can sit.", "dog-sit"),
  read("read-pig", "A pig can dig.", "pig-dig"),
  oral(
    "tell-next-line",
    "There is another line below. Where do we read after this line?",
    "worm-next-line-v1",
    "move-down",
    "Go down to the next line and start on the left.",
    "Think about the next line and which end we start at.",
  ),
  oral(
    "tell-spaces",
    "How do spaces help us read?",
    "worm-spaces-v1",
    "word-spaces",
    "Spaces help us see where one word ends and the next begins.",
    "Look at the gaps between the words. What do they separate?",
  ),
].map((scene) => ({
  id: "worm-response/" + scene.id,
  standard: scene.id === "tell-spaces" ? "RF.K.1c" : "RF.K.1a",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
export const wormPracticeStandards = ["RF.K.1a"];
export const wormPractice = [...wormChecks, ...wormClosing];
export const wormPracticeCount = 12;
export const wormPracticeDone =
  "You followed new word trails and shared your thinking with Luna! Your carrots are ready.";
export const wormPerfectDone =
  "Every print-trail answer, first try! You earned three extra carrots for careful thinking!";
export const wormTimingTexts = [
  ...new Set(
    [...wormLesson.scenes, ...wormPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...(s.context ? [s.context, ...spokenSentences(s.context)] : []),
      ...(s.interaction?.type === "choose" && s.interaction.printPage
        ? [printPageText(s.interaction.printPage)]
        : []),
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "speak" ? [s.interaction.text] : []),
      ...(s.interaction?.type === "match"
        ? s.interaction.pairs.flatMap((p) => [p.left, p.right])
        : []),
    ]),
  ),
];
export const wormSpeech = collectSpeech(
  [wormLesson, { ...wormLesson, scenes: wormPractice.map((q) => q.scene) }],
  [
    wormWelcome,
    wormCompletion,
    wormPracticeDone,
    wormPerfectDone,
    ...wormLearned,
    wormWarmup.greeting,
    wormWarmup.intro,
    wormWarmup.finish,
    wormWarmup.emptyFinish,
    ...wormTimingTexts,
    "Let’s learn this together.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "You finished this question.",
    "Let’s try the next question.",
  ],
);
export const wormSpeechStyles: Record<string, string> = {};
