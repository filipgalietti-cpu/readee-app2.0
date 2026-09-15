import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { LessonDef, SceneDef, ChooseDef } from "@/lib/lesson-engine/types";
import { keyDetails } from "@/app/data/lessons-v2/key-details";
import originalBank from "@/app/data/kindergarten-standards-questions.json";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
import { bugHuntSpeech } from "./pip-bug-hunt";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
/** Presentation draft. Original Pip story, answer keys and standard remain the source.
 * New coaching and scene staging require the daily educator review. */
export const pipPicture = (name: string) => `/lesson-studio/pips-tree/art/${name}.svg`;
export const pipStory =
  "Pip the bird flew to a big tree. Pip found a shiny red bug. Pip ate the bug! Yum!";
export const pipPages = [
  { text: "Pip the bird flew to a big tree.", visual: { moment: "fly" } },
  { text: "Pip found a shiny red bug.", visual: { moment: "find" } },
  { text: "Pip ate the bug! Yum!", visual: { moment: "eat" } },
];
const narration = (script: string) => ({ script, audio: "" });
const choose = (sourceId: string, script: string, correct: string, hint: string): SceneDef => {
  const source = keyDetails.scenes.find((s) => s.id === sourceId)!;
  const original = source.interaction as ChooseDef;
  const names: Record<string, { label: string; spoken?: string }> =
    sourceId === "guided-what"
      ? {
          sing: { label: "Pip sang.", spoken: "Did Pip sing?" },
          eat: { label: "Pip ate.", spoken: "Did Pip eat?" },
          run: { label: "Pip ran.", spoken: "Did Pip run?" },
        }
      : sourceId === "guided-where"
        ? {
            park: { label: "At the park", spoken: "At the park?" },
            tree: { label: "In the tree", spoken: "In the tree?" },
            road: { label: "On the road", spoken: "On the road?" },
          }
        : { pip: { label: "Pip the bird" }, bug: { label: "The bug" }, sun: { label: "The sun" } };
  const options = original.options.map((o) => ({ ...o, ...names[o.id], image: pipPicture(o.id) }));
  const success =
    sourceId === "guided-what"
      ? { image: pipPicture("eat"), alt: "Pip eating a bug", sentence: "Pip ate the bug." }
      : sourceId === "guided-where"
        ? { image: pipPicture("tree"), alt: "The big tree", sentence: "It happened in the tree." }
        : { image: pipPicture("pip"), alt: "Pip the bird", sentence: "Pip is the main character." };
  return {
    ...source,
    id: sourceId,
    prompt:
      sourceId === "guided-what"
        ? "What did Pip do?"
        : sourceId === "guided-who"
          ? "Who is the main character?"
          : "Where did it happen?",
    evidence: "practice",
    narration: narration(script),
    interaction: { ...original, options, success },
    feedback: { correct, hint, incorrect: hint },
  };
};
export const pipWelcome =
  "Welcome to Pip’s tree! We will listen to a story and look for who, what, and where.";
export const pipCompletion =
  "You found clues in Pip’s story! Now you are ready to practice. Let’s try some questions together.";
export const pipLearned = [
  "Find who a story is about.",
  "Find what happened.",
  "Find where it happened.",
];
export const pipLesson: LessonDef = {
  ...keyDetails,
  id: "key-details-coached-v2",
  title: "Pip’s Tree",
  completion: {
    script: pipCompletion,
    title: "Ready to practice!",
    body: "Your story clues are ready.",
  },
  scenes: [
    {
      id: "welcome",
      purpose: "hook",
      gate: "none",
      prompt: "Let’s be story detectives.",
      evidence: "demonstration",
      visual: { id: "pips-tree", props: { moment: "rest" } },
      narration: narration(
        "Let’s be story detectives. A detective looks for clues. Listen for who is in our story, what happens, and where it happens.",
      ),
    },
    {
      id: "pip-story",
      purpose: "hook",
      gate: "interaction",
      prompt: "Listen to Pip’s story.",
      evidence: "demonstration",
      visual: { id: "pips-tree", props: { moment: "rest" } },
      narration: narration(
        "Listen to Pip’s story. Tap Read to me. Then turn the page to hear what happens next.",
      ),
      interaction: { type: "read-along", text: pipStory, audio: "", pages: pipPages },
    },
    {
      id: "clue-buttons",
      purpose: "model",
      gate: "interaction",
      prompt: "Choose a clue to explore.",
      evidence: "demonstration",
      visual: { id: "pips-tree", props: { moment: "rest" } },
      narration: narration(
        "Choose a clue to explore. Who tells us a character. What tells us what happened. Where tells us the place. Try all three buttons.",
      ),
      interaction: {
        type: "transform",
        control: "toggle",
        base: "",
        add: "",
        result: "",
        changeIndex: 0,
        states: [
          {
            id: "who",
            label: "Who?",
            text: "Pip the bird",
            script: "Who was in the story? Pip the bird. Pip is our character.",
            visual: { moment: "who" },
          },
          {
            id: "what",
            label: "What happened?",
            text: "Pip ate the bug.",
            script: "What happened? Pip ate the bug. That is something Pip did.",
            visual: { moment: "eat" },
          },
          {
            id: "where",
            label: "Where?",
            text: "In a big tree",
            script: "Where did it happen? In a big tree. The tree is the place.",
            visual: { moment: "where" },
          },
        ],
      },
    },
    choose(
      "guided-who",
      "Who is the main character? Pip the bird, the bug, or the sun?",
      "Yes! The story was about Pip the bird.",
      "Think about the little bird we followed in the story.",
    ),
    choose(
      "guided-what",
      "What did Pip do? Did Pip sing? Did Pip eat? Did Pip run?",
      "Pip ate the bug. You found what happened!",
      "Listen again: Pip found a shiny red bug. Pip ate the bug!",
    ),
    choose(
      "guided-where",
      "Where did it happen? At the park? In the tree? On the road?",
      "The story happened in a big tree. You found where!",
      "Remember where Pip flew at the beginning of our story.",
    ),
    {
      id: "story-order",
      purpose: "apply",
      gate: "interaction",
      prompt: "Put the story in order.",
      evidence: "practice",
      narration: narration(
        "Put the story in order. What happened first, next, and last? Tap the pictures in order, or drag them into the spaces.",
      ),
      interaction: {
        type: "sequence",
        items: [
          { id: "fly", label: "Pip flew", image: pipPicture("fly") },
          { id: "bug", label: "Pip found a bug", image: pipPicture("find") },
          { id: "eat", label: "Pip ate a bug", image: pipPicture("eat") },
        ],
        order: ["fly", "bug", "eat"],
        result: pipStory,
        resultParts: pipPages.map((page, i) => ({
          ...page,
          image: pipPicture(["fly", "find", "eat"][i]),
        })),
      },
      feedback: {
        correct: pipStory,
        hint: "Pip flew to the tree first. Think about what happened next.",
        incorrect:
          "Let’s try that order again. First Pip flew to the tree. Next Pip found a bug. Last Pip ate the bug.",
      },
    },
    {
      id: "read-pip",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read with Luna.",
      evidence: "practice",
      narration: narration(
        "Read with Luna. Tap the microphone. Read the purple sentence. You can hear it first if you need help.",
      ),
      interaction: {
        type: "speak",
        mode: "read",
        text: "Pip ate the bug!",
        allowHear: true,
        autoStop: true,
        completionPolicy: "practice-coverage",
      },
      feedback: {
        correct: "You read with Luna! Now let’s think about what those words tell us.",
        hint: "Listen first, then read with Luna.",
        incorrect: "Let’s listen to the sentence, then try reading it together.",
      },
    },
    {
      id: "understand-pip",
      purpose: "apply",
      gate: "interaction",
      prompt: "What did Pip eat?",
      context: "Pip ate the bug!",
      evidence: "practice",
      narration: narration(
        "What did Pip eat? A bug, a leaf, or a rock? Find the answer in the sentence.",
      ),
      interaction: {
        type: "choose",
        options: [
          { id: "bug", label: "A bug", image: pipPicture("bug") },
          { id: "leaf", label: "A leaf", image: pipPicture("leaf") },
          { id: "rock", label: "A rock", image: pipPicture("rock") },
        ],
        correctId: "bug",
        success: { image: pipPicture("bug"), alt: "The shiny red bug Pip ate", sentence: "Pip ate the bug." },
      },
      feedback: {
        correct: "Pip ate the bug. You used the words to find the answer!",
        hint: "Look after the word ate. What do the words tell us?",
        incorrect: "Read it with Luna again. Pip ate the bug.",
      },
    },
    {
      id: "read-new-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Try your skill with new words.",
      evidence: "practice",
      narration: narration(
        "Try your skill with new words. This story is about Max. Read the purple sentence with Luna. Then we will find a clue.",
      ),
      interaction: {
        type: "speak",
        mode: "read",
        text: "Max the dog ran to the park.",
        allowHear: true,
        autoStop: true,
        completionPolicy: "practice-coverage",
      },
      feedback: {
        correct: "You read a new sentence. Now use its words to find where Max went.",
        hint: "You can hear the sentence first, then read with Luna.",
        incorrect: "Let’s listen, then try reading the sentence together.",
      },
    },
    {
      id: "understand-max",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where did Max go?",
      context: "Max the dog ran to the park.",
      evidence: "practice",
      narration: narration(
        "Where did Max go? To the park, to the tree, or to the road? Use the sentence to find the place.",
      ),
      interaction: {
        type: "choose",
        options: [
          { id: "park", label: "To the park", image: pipPicture("park") },
          { id: "tree", label: "To the tree", image: pipPicture("tree") },
          { id: "road", label: "To the road", image: pipPicture("road") },
        ],
        correctId: "park",
        success: {
          image: "/lesson-studio/pips-tree/max-park.webp",
          alt: "A dog playing with a red ball in a park",
          sentence: "Max went to the park.",
        },
      },
      feedback: {
        correct: "Max went to the park. You found where in a new sentence!",
        hint: "Find the place after the words ran to the.",
        incorrect: "Listen again. Max the dog ran to the park.",
      },
    },
    {
      id: "practice-transition",
      purpose: "celebrate",
      gate: "none",
      prompt: "Your clues are ready!",
      evidence: "demonstration",
      visual: { id: "pips-tree", props: { moment: "who" } },
      narration: narration(
        "Your clues are ready! You explored who, what happened, and where. Now let’s read new little stories and use the same clue-finding skill.",
      ),
    },
  ],
};
/** Existing curriculum passages and keys. New texts stay visible, with sentence-by-sentence narration.
 * Exclude the arithmetic item: this checkpoint checks text comprehension. */
const originalQuestions = originalBank.standards.find((s) => s.standard_id === "RL.K.1")!.questions;
const sourceIds = [
  "RL.K.1-Q1",
  "RL.K.1-Q2",
  "RL.K.1-Q4",
  "RL.K.1-Q5",
  "RL.K.1-H1",
  "RL.K.1-H3",
  "RL.K.1-H5",
];
const photoNames = [
  "max-park",
  "lily-school",
  "kitten",
  "garden",
  "snowball",
  "hungry",
  "cat-fish",
];

export const pipOriginalPracticePool = sourceIds.map((id, index) => {
  const q = originalQuestions.find((q) => q.id === id)!;
  if (!q.correct_feedback || !q.incorrect_feedback || !q.reveal_feedback) {
    throw new Error(`Missing authored feedback: ${id}`);
  }
  const [context, prompt] = q.prompt.split("\n\n");
  const options = q.choices!.map((label, n) => ({ id: String(n), label }));
  return {
    id: "key-details-transfer/" + id,
    standard: "RL.K.1",
    band: (index < 3 ? "core" : index === 3 ? "easier" : "harder") as "easier" | "core" | "harder",
    difficulty: index + 1,
    explanation: q.reveal_feedback,
    sourceId: q.id,
    scene: {
      id: q.id,
      purpose: "challenge",
      gate: "interaction",
      evidence: "assessed",
      prompt: prompt.replace(/PLAY|COLOR|WANT/g, (s) => s.toLowerCase()),
      context,
      narration: narration(
        `${prompt.replace(/PLAY|COLOR|WANT/g, (s) => s.toLowerCase())} ${options.map((o) => o.label + "?").join(" ")}`,
      ),
      interaction: {
        type: "choose",
        options,
        correctId: String(q.choices!.indexOf(q.correct!)),
        success: {
          image: `/lesson-studio/pips-tree/${photoNames[index]}.webp`,
          alt: context,
          sentence: q.correct_feedback.replace(/ Great .*| You .*| That's .*| Great .*/, ""),
        },
      },
      feedback: {
        correct: q.correct_feedback,
        hint: q.hint ?? "",
        incorrect: q.incorrect_feedback,
      },
    } satisfies SceneDef,
  };
});
/** Additive practice: unused source passages, never a second test of an original passage.
 * These new format/answer-key adaptations require educator review. */
export const pipAdditionalPracticePool: (PracticeQuestion & { sourceId: string })[] = [
  {
    sourceId: "RL.K.1-Q3", id: "key-details-transfer/RL.K.1-Q3-match", standard: "RL.K.1",
    band: "core", difficulty: 3,
    explanation: "Emma turned five. Mom baked a chocolate cake for her birthday party.",
    scene: {
      id: "RL.K.1-Q3-match", purpose: "challenge", gate: "interaction", evidence: "assessed",
      context: originalQuestions.find(q => q.id === "RL.K.1-Q3")!.prompt
        .replace("Listen to the story: ", "").split(" Why did Emma's mom")[0],
      prompt: "Match Emma’s birthday clues.",
      narration: narration("Match Emma’s birthday clues. Tap a clue, then tap its answer. Match all three pairs. Then check your matches."),
      interaction: { type: "match", pairs: [
        { left: "Whose birthday?", right: "Emma’s" },
        { left: "Who baked?", right: "Mom" },
        { left: "What did she bake?", right: "A chocolate cake" },
      ], success: { image: "/lesson-studio/pips-tree/emma-birthday-photo.webp", alt: "Emma with a birthday cake", sentence: "Mom baked a chocolate cake for Emma’s birthday." } },
      feedback: {
        correct: "You matched the clues! It was Emma’s birthday. Mom baked a chocolate cake.",
        hint: "Listen for whose birthday it was, who baked, and what she baked.",
        incorrect: "Let’s check the story. Find the birthday child, the person who baked, and the food she made.",
      },
    },
  },
  {
    sourceId: "RL.K.1-H4", id: "key-details-transfer/RL.K.1-H4-match", standard: "RL.K.1",
    band: "harder", difficulty: 8,
    explanation: "Rosa’s friends hid behind the couch to surprise her.",
    scene: {
      id: "RL.K.1-H4-match", purpose: "challenge", gate: "interaction", evidence: "assessed",
      context: originalQuestions.find(q => q.id === "RL.K.1-H4")!.prompt.split("\n\n")[0],
      prompt: "Match the surprise clues.",
      narration: narration("Match the surprise clues. Tap a clue, then tap its answer. Match all three pairs. Then check your matches."),
      interaction: { type: "match", pairs: [
        { left: "Who hid?", right: "Rosa’s friends" },
        { left: "Where did they hide?", right: "Behind the couch" },
        { left: "Why did they hide?", right: "To surprise Rosa" },
      ], success: { image: "/lesson-studio/pips-tree/rosa-surprise-photo.webp", alt: "Friends surprising Rosa", sentence: "Rosa’s friends hid behind the couch to surprise her." } },
      feedback: {
        correct: "You found who, where, and why! Rosa’s friends hid behind the couch to surprise her.",
        hint: "Listen for who hid and where. Then listen to what they shouted to work out why.",
        incorrect: "Try the clues together. Who was hiding? Where were they? What happened when Rosa came in?",
      },
    },
  },
  {
    sourceId: "RL.K.1-H2", id: "key-details-transfer/RL.K.1-H2-sequence", standard: "RL.K.1",
    band: "easier", difficulty: 2,
    explanation: "First, Mia had two cookies. Then she gave one to her brother. Last, she ate the other cookie.",
    scene: {
      id: "RL.K.1-H2-sequence", purpose: "challenge", gate: "interaction", evidence: "assessed",
      context: originalQuestions.find(q => q.id === "RL.K.1-H2")!.prompt.split("\n\n")[0],
      prompt: "Put Mia’s story in order.",
      narration: narration("Put Mia’s story in order. Drag the cards into the three spaces, or tap them in order. Then check your order."),
      interaction: { type: "sequence", items: [
        { id: "had", label: "Mia had two cookies" },
        { id: "gave", label: "Mia gave one to her brother" },
        { id: "ate", label: "Mia ate the other cookie" },
      ], order: ["had", "gave", "ate"], result: "Mia had two cookies. She gave one to her brother. She ate the other cookie.",
      success: { image: "/lesson-studio/pips-tree/mia-cookies-photo.webp", alt: "Mia sharing cookies with her brother", sentence: "Mia shared a cookie and ate the other one." } },
      feedback: {
        correct: "You put Mia’s story in order! She had two cookies, gave one to her brother, and ate the other one.",
        hint: "Start with what Mia had. Then find what she did before she ate her cookie.",
        incorrect: "Listen to the story again. Mia had the cookies before she shared one. What did she do last?",
      },
    },
  },
];
export const pipStoryQuestions = [...pipOriginalPracticePool, ...pipAdditionalPracticePool];
/** Revisit two source sentences for supported oral reading AFTER the ten checks.
 * Shared stimuli are deliberate rehearsal, never new comprehension evidence. */
export const pipReadingPractice: (PracticeQuestion & { sourceId: string })[] = [
  { sourceId: "RL.K.1-Q2", id: "lily-raincoat", text: "Lily put on her yellow raincoat." },
  { sourceId: "RL.K.1-Q4", id: "sam-kitten", text: "Sam found a tiny kitten under the porch." },
].map((entry) => {
  if (!originalQuestions.find(q => q.id === entry.sourceId)?.prompt.includes(entry.text))
    throw Error("Pip reading excerpt differs from source");
  return {
    id: `key-details-reading/${entry.id}`, sourceId: entry.sourceId,
    standard: "RL.K.1", band: "core", difficulty: 1, phase: "reading-finish",
    scene: {
      id: entry.id, purpose: "apply", gate: "interaction", evidence: "practice",
      prompt: "Read with Luna.",
      narration: narration("Read with Luna. Tap the microphone and read the words. You can listen first if you need help."),
      interaction: { type: "speak", mode: "read", text: entry.text, allowHear: true,
        completionPolicy: "practice-coverage", autoStop: true },
      feedback: {
        correct: "You read the whole sentence! Listen to it once more.",
        hint: "Read one word at a time. You can tap Hear it first, then try reading with Luna.",
        incorrect: "Let’s try the words that are still waiting. Read the whole line when you are ready.",
      },
    },
  };
});
export const pipPracticePool = [...pipStoryQuestions, ...pipReadingPractice];
export const pipPracticeCount = pipPracticePool.length;
export const pipPracticeIntro =
  "Use your clue-finding skill with new little stories. Read with Luna, then find the answer in the words.";
export const pipPracticeDone =
  "You used your clue-finding skill with new stories! You found characters, actions, places, and details. Your carrots are ready!";
export const pipPerfectDone =
  "Every question, first try! You found all ten answers. You earned three extra carrots for your careful clue finding!";
export const pipSupportSpeech = [
  "Let’s learn this together.",
  "We’ll try this again another time. Let’s keep going.",
  "Listen to the story again.",
  "You finished this question.",
  "Let’s try the next question.",
];
export const pipSpeech = collectSpeech(
  [pipLesson, { ...pipLesson, id: "pip-quiz-audio", scenes: pipPracticePool.map((q) => q.scene) }],
  [
    pipWelcome,
    pipCompletion,
    pipPracticeIntro,
    pipPracticeDone,
    pipPerfectDone,
    ...pipSupportSpeech,
    ...bugHuntSpeech,
    ...pipPracticePool.flatMap((q) =>
      spokenSentences(q.scene.context ?? ""),
    ),
    ...pipLearned,
    ...pipPracticePool.map((q) => q.explanation).filter((s): s is string => !!s),
  ],
);
export const pipTimingTexts = [
  ...new Set([
    ...pipLesson.scenes.map((s) => s.narration!.script),
    ...pipPages.map((p) => p.text),
    ...pipPracticePool.map((q) => q.scene.narration!.script),
    pipStory,
    ...pipLesson.scenes.flatMap((s) =>
      s.interaction?.type === "speak" ? [s.interaction.text] : [],
    ),
    ...pipPracticePool.flatMap((q) => [
      ...(q.scene.context ? [q.scene.context, ...spokenSentences(q.scene.context)] : []),
      ...(q.scene.interaction?.type === "speak" ? [q.scene.interaction.text] : []),
    ]),
  ]),
];
export const pipReview = {
  status: "educator-review-required",
  source: "app/data/lessons-v2/key-details.ts",
  changes: [
    "Added two supported reading turns after all ten preserved questions. Lily and Sam excerpts are verbatim source sentences intentionally rehearsed after assessment; they do not add independent comprehension evidence. Review decoding load with Jennifer.",
    "Added child-controlled story pages without changing the source story.",
    "Combined three model answers into a repeatable, unscored clue demonstration.",
    "Added spoken coaching, instruction wording and picture sequencing.",
    "Added supported Luna oral reading followed by separately scored comprehension questions.",
    "All seven original MCQs, pictures, keys and feedback are retained. Three additions use previously unused source passages: Q3 and H4 matching; H2 event ordering (supports RL.K.2 retelling alongside RL.K.1). New keys/coaching require educator review. H2 arithmetic is not asked. No source passage is repeated within this practice pool.",
    "Practice now uses visible new passages from the original RL.K.1 bank, not Pip recall. Difficulty bands remain a draft, not psychometric calibration.",
  ],
  withheldQuizItems: ["RL.K.1-H2: original arithmetic question is withheld; its passage is reused only for event ordering"],
};
