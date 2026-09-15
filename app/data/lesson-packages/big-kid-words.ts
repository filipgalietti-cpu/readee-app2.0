import type {
  LessonDef,
  SceneDef,
  TransformDef,
  ChooseDef,
  SortDef,
  MatchDef,
} from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { bigKidWords } from "@/app/data/lessons-v2/big-kid-words";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
import sourceQuiz from "./big-kid-words-source-quiz.json";
import sourceQuestions from "./big-kid-words-source-questions.json";

// Jennifer requested acorn vocabulary on 14 September. Preserve legacy source records and asset IDs; child-facing language uses acorn.
export const acornAsset = (name: string) => `/lesson-studio/big-kid-words/${name}`;
export type Position = "on" | "under" | "next to";
export type Anchor = "log" | "leaf" | "rock" | "hat" | "cup" | "stool" | "bench" | "box";
export type SmallObject = "nut" | "ball" | "shell" | "block";
export type PositionPicture = {
  items?: { object: SmallObject; position: Position }[];
  id: string;
  object: SmallObject;
  anchor: Anchor;
  position: Position;
};
const pictures: PositionPicture[] = [];
function picture(object: SmallObject, anchor: Anchor, position: Position) {
  const id = `${object}-${position.replaceAll(" ", "-")}-${anchor}`;
  if (!pictures.some((p) => p.id === id)) pictures.push({ id, object, anchor, position });
  return acornAsset(id + ".webp");
}
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
const objectName = (object: SmallObject) => object === "nut" ? "acorn" : object;
const sentence = (object: SmallObject, anchor: Anchor, position: Position) =>
  `The ${objectName(object)} is ${position} the ${anchor}.`;
const reveal = (object: SmallObject, anchor: Anchor, position: Position) => ({
  image: picture(object, anchor, position),
  alt: sentence(object, anchor, position),
  sentence: sentence(object, anchor, position),
});
export const acornWarmup = {
  title: "Acorn Trail",
  actorName: "Squeaky",
  eyebrow: "A quick woodland adventure",
  goalLabel: "the acorn",
  goalImage: acornAsset("nut-object.webp"),
  boardLabel: "Guide Squeaky the squirrel along the paths to the acorn",
  winTitle: "An acorn for Squeaky!",
  winMessage: "You helped Squeaky reach his acorn!",
  emptyMessage: "Good exploring. Squeaky is ready for our adventure!",
  nextLabel: "Meet Squeaky",
  introTitle: "Help Squeaky find his acorn",
  introDescription: "Drag Squeaky or use the arrows. Collect carrots on the way.",
  trailMark: "dots" as const,
  seconds: 45,
  backdrop: acornAsset("woodland-floor.webp"),
  greeting:
    "Welcome to Acorn Trail! Help Squeaky the squirrel reach his acorn. Ready to warm up? Tap Let’s play.",
  intro:
    "Drag Squeaky along the paths, or use the arrow buttons. Collect carrots on your way to the acorn. You have forty-five seconds. Ready?",
  finish:
    "An acorn for Squeaky! Two carrots for reaching the acorn, plus two for warming up. Keep your catch carrots too! Now let’s help Squeaky find his acorns.",
  emptyFinish:
    "Good exploring! Keep your carrots, plus two for warming up. Now let’s help Squeaky find his acorns.",
};
export const acornWelcome =
  "Welcome to Squeaky’s Secret Stash! Play a quick path game. Then use words to tell Squeaky where his acorns are.";
export const acornCompletion =
  "You used on, under, and next to to help Squeaky. Now you are ready to practice with new things and tell Luna where they are!";
export const acornLearned = [
  "On can tell us something rests on top.",
  "Under tells us something is below.",
  "Next to tells us things are beside each other.",
];
export const acornModels = [
  {
    id: "model-on",
    anchor: "log" as const,
    before: "next to" as const,
    after: "on" as const,
    prompt: "Put the acorn on the log.",
    action: "On the log",
    script:
      "The acorn is on the log. It rests right on top and touches the log. On tells where the acorn is.",
  },
  {
    id: "model-under",
    anchor: "leaf" as const,
    before: "next to" as const,
    after: "under" as const,
    prompt: "Put the acorn under the leaf.",
    action: "Under the leaf",
    script:
      "The acorn is under the leaf. The leaf is above it. We can still see some of the acorn underneath. Under tells where the acorn is.",
  },
  {
    id: "model-next",
    anchor: "rock" as const,
    before: "on" as const,
    after: "next to" as const,
    prompt: "Put the acorn next to the rock.",
    action: "Next to the rock",
    script:
      "The acorn is next to the rock. They are beside each other. The acorn is not sitting on the rock. Next to tells where the acorn is.",
  },
];
function model(m: (typeof acornModels)[number]): SceneDef {
  const props = (position: Position) => ({
    object: "nut",
    anchor: m.anchor,
    position,
    image: picture("nut", m.anchor, position),
    alt: sentence("nut", m.anchor, position),
  });
  return {
    id: m.id,
    purpose: "model",
    evidence: "demonstration",
    gate: "interaction",
    prompt: m.prompt,
    narration: n(
      `${m.prompt} Tap ${m.action}. Watch the acorn move. Then you can put it back and try again.`,
    ),
    visual: { id: "position-world", props: props(m.before) },
    interaction: {
      type: "transform",
      control: "toggle",
      base: "",
      add: "",
      result: "",
      changeIndex: 0,
      states: [
        {
          id: "before",
          label: "Put it back",
          text: "",
          script: sentence("nut", m.anchor, m.before),
          visual: props(m.before),
        },
        { id: "after", label: m.action, text: "", script: m.script, visual: props(m.after) },
      ],
    } satisfies TransformDef,
  };
}
function where(
  id: string,
  object: SmallObject,
  anchor: Anchor,
  position: Position,
  order: Position[],
  sourceId?: string,
): SceneDef {
  return {
    id,
    purpose: "apply",
    gate: "interaction",
    prompt: `Where is the ${objectName(object)}?`,
    image: picture(object, anchor, position),
    imageAlt: sentence(object, anchor, position),
    visual: { id: "position-world", hideOnSuccess: true, props: { object, anchor, position, alt: sentence(object, anchor, position) } },
    narration: n(
      `Where is the ${objectName(object)}? Look at it and the ${anchor}. ${order.map((x) => x + ".").join(" ")}`,
    ),
    interaction: {
      type: "choose",
      options: order.map((x) => ({ id: x, label: x, spoken: x + "." })),
      correctId: position,
      success: reveal(object, anchor, position),
    } satisfies ChooseDef,
    feedback: f(
      sentence(object, anchor, position),
      `Look at the ${objectName(object)} and the ${anchor}. Is it resting on top, below, or beside the ${anchor}?`,
    ),
    ...(sourceId ? { evidence: "practice" as const } : {}),
  };
}
export const acornLesson: LessonDef = {
  ...bigKidWords,
  id: "big-kid-words-acorn",
  title: "Squeaky’s Secret Stash",
  timings: undefined,
  completion: undefined,
  objective:
    "Use the source position words on, under, and next to in supported conversation and new spatial contexts. This is a narrow contribution to K.L.6, not all vocabulary mastery.",
  scenes: [
    {
      id: "opening",
      purpose: "hook",
      gate: "none",
      prompt: "Help Squeaky find his acorns.",
      narration: n(
        "Help Squeaky find his acorns. Squeaky the squirrel lost his favorite acorns! We can help by telling him where to look. Today we will use three words and phrases: on, under, and next to.",
      ),
      visual: {
        id: "acorn-scene",
        props: {
          image: acornAsset("opening.webp"),
          alt: "A whole squirrel beside a basket and an acorn trail in a painted woodland clearing",
        },
      },
    },
    model(acornModels[0]),
    where("c-1-choose-on", "nut", "log", "on", ["on", "under", "next to"], "c-1-choose-on"),
    model(acornModels[1]),
    where(
      "c-2-choose-under",
      "nut",
      "leaf",
      "under",
      ["under", "on", "next to"],
      "c-2-choose-under",
    ),
    model(acornModels[2]),
    where(
      "c-3-choose-next",
      "nut",
      "rock",
      "next to",
      ["next to", "on", "under"],
      "c-3-choose-next",
    ),
    {
      ...where("nut-under-hat", "nut", "hat", "under", ["next to", "under", "on"]),
      evidence: "practice",
    },
    {
      ...where("nut-next-cup", "nut", "cup", "next to", ["on", "under", "next to"]),
      evidence: "practice",
    },
    {
      ...where("nut-on-stool", "nut", "stool", "on", ["under", "on", "next to"]),
      evidence: "practice",
    },
    {
      id: "squeaky-directions-luna",
      purpose: "guided",
      gate: "interaction",
      evidence: "practice",
      prompt: "Read to Squeaky with Luna.",
      visual: { id: "acorn-scene", hideOnSuccess: true, props: { image: acornAsset("squeaky-object.webp"), alt: "Squeaky is ready to listen." } },
      narration: n("Read to Squeaky with Luna. Tap the microphone and read the sentence. You can listen first if you need to."),
      interaction: {
        type: "speak",
        mode: "read",
        text: "The acorn is on the log.",
        allowHear: true,
        autoStop: true,
        completionPolicy: "practice-coverage",
        success: {
          image: acornAsset("squeaky-on-log.webp"),
          alt: "Squeaky looks at an acorn resting on top of the log.",
          sentence: "The acorn is on the log.",
        },
      },
      feedback: f("You told Squeaky where to look! The acorn is on the log.", "Listen first if you need to. Then read all the words with Luna."),
    },
    {
      id: "ready",
      purpose: "celebrate",
      gate: "none",
      prompt: "Ready for new hiding places?",
      narration: n("Ready for new hiding places? " + acornCompletion),
      visual: {
        id: "acorn-scene",
        props: {
          image: acornAsset("squeaky-found.webp"),
          alt: "Squeaky beside his basket of collected acorns",
        },
      },
    },
  ],
};
function q(band: Band, index: number, scene: SceneDef): PracticeQuestion {
  return {
    id: `acorn-check/${band}-${index}`,
    standard: "K.L.6",
    band,
    difficulty: { easier: 1, core: 2, harder: 3, challenging: 4 }[band],
    scene: { ...scene, evidence: "assessed", id: `acorn-check-${band}-${index}` },
  };
}
function find(
  object: SmallObject,
  anchor: Anchor,
  position: Position,
  order: Position[],
): SceneDef {
  return {
    id: "find",
    purpose: "apply",
    gate: "interaction",
    prompt: `Find the ${objectName(object)} ${position} the ${anchor}.`,
    narration: n(
      `Find the ${objectName(object)} ${position} the ${anchor}. Look at all three pictures. Tap the picture that follows the words.`,
    ),
    interaction: {
      type: "choose",
      options: order.map((p, i) => ({
        id: p,
        label: `Picture ${i + 1}`,
        spoken: `Picture ${i + 1}.`,
        image: picture(object, anchor, p),
      })),
      correctId: position,
      success: reveal(object, anchor, position),
    } satisfies ChooseDef,
    feedback: f(
      sentence(object, anchor, position),
      `Listen again. Find the ${objectName(object)} ${position} the ${anchor}.`,
    ),
  };
}
function sort(items: { object: SmallObject; anchor: Anchor; position: Position }[]): SceneDef {
  return {
    id: "sort",
    purpose: "apply",
    gate: "interaction",
    prompt: "Sort the hiding places.",
    narration: n(
      "Sort the hiding places. Look at each picture. Is the small thing on, under, or next to the bigger thing? Tap a picture, then its place.",
    ),
    interaction: {
      type: "sort",
      buckets: ["On", "Under", "Next to"],
      items: items.map((p, i) => ({
        label: `Picture ${i + 1}`,
        spoken: `Picture ${i + 1}.`,
        image: picture(p.object, p.anchor, p.position),
        bucket:
          p.position === "next to" ? "Next to" : p.position[0].toUpperCase() + p.position.slice(1),
        explanation: sentence(p.object, p.anchor, p.position),
      })),
    } satisfies SortDef,
    feedback: f(
      "You used the pictures to tell where things are!",
      "Look at one picture. Find the small thing and the bigger thing. Then choose on, under, or next to.",
    ),
  };
}
// Matching uses actual picture cards, not three synonyms pretending to be a reading target.
function match(objects: [SmallObject, Anchor, Position][]): SceneDef {
  return {
    id: "match",
    purpose: "apply",
    gate: "interaction",
    prompt: "Match the words to the pictures.",
    narration: n(
      "Match the words to the pictures. Tap a phrase to hear it. Match each phrase to its picture. You can listen to your last pair before checking.",
    ),
    interaction: {
      type: "match",
      silentLabels: objects.map((_, i) => `Picture ${i + 1}`),
      pairs: objects.map(([object, anchor, position], i) => ({
        left: `${position} the ${anchor}`,
        right: `Picture ${i + 1}`,
      })),
      images: Object.fromEntries(
        objects.map(([object, anchor, position], i) => [
          `Picture ${i + 1}`,
          { src: picture(object, anchor, position), alt: sentence(object, anchor, position) },
        ]),
      ),
      spoken: Object.fromEntries(
        objects.flatMap(([, anchor, position], i) => [
          [`${position} the ${anchor}`, `${position} the ${anchor}.`],
          [`Picture ${i + 1}`, `Picture ${i + 1}.`],
        ]),
      ),
    } satisfies MatchDef,
    feedback: f(
      "Your words and pictures tell the same places!",
      "Listen to one phrase. Look for the picture that shows that place.",
    ),
  };
}

function multiPicture(anchor: Anchor, items: { object: SmallObject; position: Position }[]) {
  const id =
    items.map((x) => x.object + "-" + x.position.replaceAll(" ", "-")).join("--") + "-" + anchor;
  if (!pictures.some((p) => p.id === id)) pictures.push({ id, anchor, ...items[0], items });
  return acornAsset(id + ".webp");
}
function locate(
  anchor: Anchor,
  items: { object: SmallObject; position: Position }[],
  target: Position,
  order: SmallObject[],
): SceneDef {
  const correct = items.find((x) => x.position === target)!;
  return {
    id: "locate",
    purpose: "challenge",
    gate: "interaction",
    prompt: `What is ${target} the ${anchor}?`,
    image: multiPicture(anchor, items),
    imageAlt: items.map((x) => sentence(x.object, anchor, x.position)).join(" "),
    narration: n(
      `What is ${target} the ${anchor}? Look at all the things. ${order.map((x) => "The " + objectName(x) + ".").join(" ")}`,
    ),
    interaction: {
      type: "choose",
      options: order.map((x) => ({ id: x, label: "The " + objectName(x) + "." })),
      correctId: correct.object,
      success: {
        image: multiPicture(anchor, items),
        alt: items.map((x) => sentence(x.object, anchor, x.position)).join(" "),
        sentence: sentence(correct.object, anchor, target),
      },
    } satisfies ChooseDef,
    feedback: f(
      sentence(correct.object, anchor, target),
      `Start at the ${anchor}. Look ${target} it. Which thing is there?`,
    ),
  };
}
function follow(
  anchor: Anchor,
  items: { object: SmallObject; position: Position }[],
  correctIndex: number,
): SceneDef {
  const script = items.map((x) => sentence(x.object, anchor, x.position)).join(" ");
  const positions: Position[] = ["on", "under", "next to"];
  const arrangements = positions.flatMap((first) =>
    positions.filter((second) => second !== first).map((second) => [first, second]),
  );
  const choices = arrangements
    .filter((ps) => ps.some((p, i) => p !== items[i].position))
    .slice(0, 2)
    .map((ps) => items.map((x, i) => ({ ...x, position: ps[i] })));
  choices.splice(correctIndex, 0, items);
  return {
    id: "follow",
    purpose: "challenge",
    gate: "interaction",
    prompt: "Find the picture that follows both clues.",
    context: script,
    narration: n(
      "Find the picture that follows both clues. " + script + " Look at all three pictures.",
    ),
    interaction: {
      type: "choose",
      options: choices.map((xs, i) => ({
        id: String(i),
        label: "Picture " + (i + 1),
        spoken: "Picture " + (i + 1) + ".",
        image: multiPicture(anchor, xs),
      })),
      correctId: String(correctIndex),
      success: { image: multiPicture(anchor, items), alt: script, sentence: script },
    } satisfies ChooseDef,
    feedback: f("Both clues fit! " + script, "Listen to the two clues again. " + script),
  };
}
export const acornChecks: PracticeQuestion[] = [
  q("easier", 0, where("", "ball", "bench", "under", ["under", "on", "next to"])),
  q("easier", 1, where("", "shell", "rock", "on", ["under", "on", "next to"])),
  q("easier", 2, where("", "block", "cup", "next to", ["on", "under", "next to"])),
  q("easier", 3, where("", "ball", "box", "on", ["on", "next to", "under"])),
  q("easier", 4, where("", "shell", "hat", "under", ["next to", "under", "on"])),
  q("easier", 5, where("", "block", "stool", "next to", ["under", "on", "next to"])),
  q("core", 0, find("ball", "stool", "on", ["under", "next to", "on"])),
  q("core", 1, find("shell", "box", "under", ["under", "on", "next to"])),
  q(
    "core",
    2,
    match([
      ["shell", "cup", "on"],
      ["shell", "cup", "under"],
      ["shell", "cup", "next to"],
    ]),
  ),
  q(
    "core",
    3,
    sort([
      { object: "block", anchor: "bench", position: "on" },
      { object: "ball", anchor: "cup", position: "next to" },
      { object: "shell", anchor: "leaf", position: "under" },
    ]),
  ),
  q(
    "harder",
    0,
    locate(
      "stool",
      [
        { object: "shell", position: "on" },
        { object: "ball", position: "under" },
        { object: "block", position: "next to" },
      ],
      "on",
      ["ball", "shell", "block"],
    ),
  ),
  q(
    "harder",
    1,
    match([
      ["block", "box", "next to"],
      ["block", "box", "under"],
      ["block", "box", "on"],
    ]),
  ),
  q(
    "harder",
    2,
    locate(
      "bench",
      [
        { object: "ball", position: "on" },
        { object: "block", position: "under" },
        { object: "shell", position: "next to" },
      ],
      "under",
      ["block", "ball", "shell"],
    ),
  ),
  q(
    "harder",
    3,
    locate(
      "stool",
      [
        { object: "block", position: "on" },
        { object: "shell", position: "under" },
        { object: "ball", position: "next to" },
      ],
      "next to",
      ["shell", "block", "ball"],
    ),
  ),
  q(
    "challenging",
    0,
    follow(
      "bench",
      [
        { object: "shell", position: "on" },
        { object: "ball", position: "under" },
      ],
      2,
    ),
  ),
  q(
    "challenging",
    1,
    follow(
      "stool",
      [
        { object: "block", position: "under" },
        { object: "shell", position: "next to" },
      ],
      0,
    ),
  ),
  q(
    "challenging",
    2,
    follow(
      "bench",
      [
        { object: "ball", position: "on" },
        { object: "block", position: "next to" },
      ],
      1,
    ),
  ),
  q(
    "challenging",
    3,
    sort([
      { object: "ball", anchor: "hat", position: "under" },
      { object: "block", anchor: "leaf", position: "on" },
      { object: "shell", anchor: "log", position: "next to" },
    ]),
  ),
];
// Higher bands add competing objects and two simultaneous spoken clues, not new untaught prepositions.
function read(
  id: string,
  text: string,
  object: SmallObject,
  anchor: Anchor,
  position: Position,
): SceneDef {
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt: "Read with Luna.",
    narration: n(
      "Read with Luna. Tap the microphone and read every word. You can listen first if you need to.",
    ),
    interaction: {
      type: "speak",
      mode: "read",
      text,
      allowHear: true,
      autoStop: true,
      completionPolicy: "practice-coverage",
      success: {
        ...reveal(object, anchor, position),
        image: acornAsset(id + ".webp"),
        alt: text,
        sentence: text,
      },
    },
    feedback: f(
      "You practiced reading the whole sentence!",
      "Listen if you need to. Then try all the words with Luna.",
    ),
  };
}
function respond(
  id: string,
  prompt: string,
  rubricId: string,
  anchor: Anchor,
  position: Position,
): SceneDef {
  return {
    id,
    purpose: "apply",
    evidence: "practice",
    gate: "interaction",
    prompt,
    image: picture("nut", anchor, position),
    imageAlt: sentence("nut", anchor, position),
    narration: n(
      prompt + " Look at the picture. Tap the microphone and tell Luna where the acorn is.",
    ),
    interaction: {
      type: "speak",
      mode: "respond",
      text: prompt,
      rubricId,
      unclearScript: "I could not check that answer yet. You can try again, or move on.",
      success: reveal("nut", anchor, position),
    },
    feedback: f(
      sentence("nut", anchor, position),
      "Look at the acorn and the " + anchor + ". Tell Luna where the acorn is. A few words are enough.",
    ),
  };
}
export const acornClosing: PracticeQuestion[] = [
  read("read-ball", "The ball is on the hat.", "ball", "hat", "on"),
  respond("c-6-speak-under", "Where is this acorn?", "acorn-under-hat-v1", "hat", "under"),
  read("read-block", "The block is next to the rock.", "block", "rock", "next to"),
  respond("h-4-describe-image", "Tell Luna where this acorn is.", "acorn-on-box-v1", "box", "on"),
].map((scene) => ({
  id: "acorn-response/" + scene.id,
  standard: "K.L.6",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
export const acornPractice = [...acornChecks, ...acornClosing],
  acornPracticeCount = 12;
export const acornPracticeDone =
  "You used position words, followed clues, and read with Luna. Your carrots are ready!";
export const acornPerfectDone =
  "Look at those first-try answers! Three extra carrots for listening carefully and finding the right places!";
export const acornTimingTexts = [
  ...new Set(
    [...acornLesson.scenes, ...acornPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...(s.context ? [s.context, ...spokenSentences(s.context)] : []),
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "match" ? Object.values(s.interaction.spoken ?? {}) : []),
      ...(s.interaction?.type === "sort" ? s.interaction.buckets : []),
      ...(s.interaction?.type === "read-along" || s.interaction?.type === "speak"
        ? [s.interaction.text]
        : []),
    ]),
  ),
];
export const acornSpeech = collectSpeech(
  [acornLesson, { ...acornLesson, scenes: acornPractice.map((q) => q.scene) }],
  [
    acornWelcome,
    acornCompletion,
    acornPracticeDone,
    acornPerfectDone,
    ...acornLearned,
    ...acornTimingTexts,
    acornWarmup.greeting,
    acornWarmup.intro,
    acornWarmup.finish,
    acornWarmup.emptyFinish,
    "Three, two, one, go!",
    "Let’s learn this together.",
    "Let’s try the next question.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "Your carrots are ready!",
    "Under the hat.",
    "On top of the box.",
  ],
);
export const acornSourceReview = {
  originalQuiz: sourceQuiz,
  originalBank: sourceQuestions,
  reusedGuidedIds: ["c-1-choose-on", "c-2-choose-under", "c-3-choose-next"],
  oralIntentsToAdapt: ["c-5-speak-on", "c-6-speak-under", "h-1-speak-next", "h-4-describe-image"],
  holds: [
    "Legacy K.L.6 bank targets untaught vocabulary.",
    "Source acorn-under-box depicts inside; replace relation geometry.",
    "Original speak synonym lists are not text for coverage grading.",
    "Above alone does not demonstrate surface contact on.",
    "Difficulty, fresh evidence and oral rubrics require review.",
  ],
};
export const acornPictures = pictures;

// Confirmed truncated source and persistent single-word ASR discrepancy: recut with distinct source identity.
export const acornSpeechStyles:Record<string,string>={
"Read to Squeaky with Luna.": "Friendly clear American Autonoe voice. Read only the supplied six words exactly once. Luna is pronounced LOO-nuh, with a clear N sound, never Luda. Squeaky is pronounced SQUEE-kee. Do not say these pronunciation directions or add an explanation.",
"Put the acorn under the leaf. Tap Under the leaf. Watch the acorn move. Then you can put it back and try again.":"Speak all four supplied sentences completely, using Autonoe’s clear warm teaching voice. No long pauses, no omitted instructions, no added words. Read the exact supplied script.",
"on.":"Use Autonoe’s clear warm teaching voice. Say only the word on. Begin with its vowel sound; do not add a consonant before it. No explanation or other words."
};
