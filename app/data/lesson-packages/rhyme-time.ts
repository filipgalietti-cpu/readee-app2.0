import type { LessonDef, SceneDef, ChooseDef, MatchDef, SortDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { rhymeTime } from "@/app/data/lessons-v2/rhyme-time";
import sourceQuestions from "./rhyme-time-source-questions.json";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
export const roryAsset = (name: string) => `/lesson-studio/rhyme-time/${name}`;
const pic = (name: string) => roryAsset(name + ".webp");
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
const reveal = (name: string, sentence: string, alt: string) => ({
  image: pic(name),
  alt,
  sentence,
});
export const roryWarmup = {
  id: "rory-parts",
  title: "Rory’s Parts Patrol",
  lessonTitle: "Rory’s Rhyme Workshop",
  nextLabel: "Meet Rory",
  finishLabel: "Let’s find rhymes",
  introEyebrow: "A quick workshop game",
  ambienceLabel: "Rory’s robot sounds",
  seconds: 45,
  greeting:
    "Welcome to Rory’s Parts Patrol! Parts are rolling across the workshop. Ready to warm up? Tap Let’s play to begin.",
  intro:
    "Look at the part at the top. Catch matching parts as they move! Each match earns one carrot. The part to find will change. Ready?",
  ready: "Three, two, one, go!",
  finish:
    "Nice catching! Keep your match carrots, plus two for warming up. Now let’s meet Rory and listen for rhymes.",
  backdrop: pic("workbench"),
  ambience: roryAsset("robot-happy-forward-reverse.mp3"),
  targets: [
    {
      id: "gear",
      label: "Find the gears!",
      instruction: "Find the gears! Look for the round parts with teeth.",
    },
    {
      id: "bolt",
      label: "Find the bolts!",
      instruction: "Now find the bolts! Look for the long parts with a head at one end.",
    },
    {
      id: "nut",
      label: "Find the nuts!",
      instruction: "Now find the nuts! Look for the six-sided parts with a hole.",
    },
  ],
  sprites: [
    { id: "gear", label: "gear", image: "" },
    { id: "bolt", label: "bolt", image: "" },
    { id: "nut", label: "nut", image: "" },
  ],
  presentation: {
    singular: "part",
    plural: "parts",
    fieldLabel: "Catch matching workshop parts",
    welcome: "Ready for Parts Patrol?",
    instructions: "Catch the part shown at the top. Watch for a new part to find!",
    celebration: "Workshop helpers, ready!",
    exampleIds: ["gear", "bolt", "nut"],
    foliage: false,
  },
};
export const roryWelcome =
  "Welcome to Rory’s Rhyme Workshop! Catch rolling parts in a quick game. Then help Rory find words that sound the same at the end.";
export const roryCompletion =
  "You listened for words that rhyme! Now you are ready to practice finding rhyme partners and making rhymes with Luna.";
export const roryLearned = [
  "Listen to the end of each word.",
  "Find words that rhyme.",
  "Try saying a new rhyming word.",
];
function choose(
  id: string,
  target: string,
  options: string[],
  answer: string,
  photo: string,
  alt: string,
): SceneDef {
  const prompt = `Which word rhymes with ${target}?`;
  const correct = `${target[0].toUpperCase() + target.slice(1)} and ${answer} rhyme. They sound the same at the end!`;
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(`${prompt} ${options.map((x) => x + ".").join(" ")} Listen to the ending sounds.`),
    interaction: {
      type: "choose",
      options: options.map((label) => ({ id: label, label, spoken: label + "." })),
      correctId: answer,
      success: reveal(
        photo,
        `${target[0].toUpperCase() + target.slice(1)}. ${answer[0].toUpperCase() + answer.slice(1)}.`,
        alt,
      ),
    } satisfies ChooseDef,
    feedback: {
      ...f(
        correct,
        `Say ${target}. Listen to each choice again. Which word has the same ending sound?`,
      ),
      byChoice: Object.fromEntries(
        options
          .filter((x) => x !== answer)
          .map((x) => [
            x,
            `${target[0].toUpperCase() + target.slice(1)}. ${x[0].toUpperCase() + x.slice(1)}. Those endings sound different. Listen to the choices again.`,
          ]),
      ),
    },
  };
}
function pairs(id: string, items: [string, string][], assessed = false): SceneDef {
  const prompt = "Match the words that rhyme.";
  return {
    id,
    purpose: assessed ? "challenge" : "guided",
    evidence: assessed ? "assessed" : "practice",
    gate: "interaction",
    prompt,
    narration: n(
      prompt +
        " Tap a word on each side. Listen to both words. Connect all three pairs, then check your matches.",
    ),
    interaction: {
      type: "match",
      pairs: items.map(([left, right]) => ({ left, right })),
      spoken: Object.fromEntries(items.flat().map((x) => [x, x + "."])),
    } satisfies MatchDef,
    feedback: f(
      items.map(([a, b]) => `${a[0].toUpperCase() + a.slice(1)} and ${b}.`).join(" ") +
        " You found rhyme partners!",
      "Listen to each pair. Match words that sound the same at the end.",
    ),
  };
}
const rhymePictures: Record<string,string> = {
  tree:"/icons/fluent/deciduous-tree.svg", star:"/icons/fluent/star.svg",
  bee:pic("sort-bee"), key:pic("sort-key"), car:pic("sort-car"), jar:pic("sort-jar"),
};
function sort(id: string, groups: Record<string, string[]>, assessed = false): SceneDef {
  const prompt = "Send each word to its rhyme partner.";
  return {
    id,
    purpose: assessed ? "challenge" : "guided",
    evidence: assessed ? "assessed" : "practice",
    gate: "interaction",
    prompt,
    narration: n(prompt + " Tap a word to hear it. Move it to a word with the same ending sound."),
    interaction: {
      type: "sort",
      buckets: Object.keys(groups),
      showImages: Object.entries(groups).every(([bucket,words])=>[bucket,...words].every(word=>!!rhymePictures[word])),
      bucketImages: rhymePictures,
      items: Object.entries(groups).flatMap(([bucket, words]) =>
        words.map((label) => ({
          label,
          spoken: label + ".",
          image: rhymePictures[label],
          bucket,
          explanation: `${label[0].toUpperCase() + label.slice(1)} and ${bucket} rhyme!`,
        })),
      ),
    } satisfies SortDef,
    feedback: f(
      "You sorted words by their ending sounds!",
      "Say both words. Listen for the same ending sound, then try another home.",
    ),
  };
}
function demo(
  id: string,
  prompt: string,
  intro: string,
  states: {
    id: string;
    label: string;
    words: string;
    script: string;
    photo: string;
    alt: string;
  }[],
): SceneDef {
  return {
    id,
    purpose: "model",
    evidence: "demonstration",
    gate: "interaction",
    prompt,
    narration: n(intro),
    visual: {
      id: "rhyme-machine",
      props: { words: states[0].words, image: pic(states[0].photo), alt: states[0].alt },
    },
    interaction: {
      type: "transform",
      control: "toggle",
      base: "",
      add: "",
      result: "",
      changeIndex: 0,
      states: states.map((s) => ({
        id: s.id,
        label: s.label,
        text: "",
        script: s.script,
        visual: { words: s.words, image: pic(s.photo), alt: s.alt },
      })),
    },
  };
}
export const roryLesson: LessonDef = {
  ...rhymeTime,
  id: "rhyme-time-coached-v1",
  title: "Rory’s Rhyme Workshop",
  objective:
    "Recognize words that rhyme by their spoken endings, then attempt a different rhyming word with support. Contributes to RF.K.2a. Hearing choices is access, not assistance; spelling recognition is not the target. Oral production remains supported practice pending educator and child-speech review.",
  completion: {
    title: "Ready to practice!",
    body: "Find rhyme partners and make a rhyme with Luna.",
    script: roryCompletion,
  },
  scenes: [
    {
      id: "workshop",
      purpose: "hook",
      evidence: "demonstration",
      gate: "none",
      prompt: "Help Rory find rhymes.",
      narration: n(
        "Help Rory find rhymes. Rory’s machine needs words that rhyme. Rhyming words sound the same at the end. Cat. Hat. Listen with your ears!",
      ),
      visual: {
        id: "workshop-photo",
        props: {
          image: pic("opening-matching-rory"),
          alt: "A friendly blue robot beside a round rhyme machine in a warmly painted workshop",
        },
      },
    },
    demo(
      "cat-machine",
      "Try Rory’s rhyme machine.",
      "Try Rory’s rhyme machine. Cat. Hat. Bat. Their beginnings change, but their endings sound the same. Tap each button and listen.",
      [
        {
          id: "hat",
          label: "Cat and hat",
          words: "cat|hat",
          script: "Cat. Hat. Cat and hat rhyme!",
          photo: "cat-hat",
          alt: "A cat and a sun hat, each shown clearly",
        },
        {
          id: "bat",
          label: "Cat and bat",
          words: "cat|bat",
          script: "Cat. Bat. Cat and bat rhyme!",
          photo: "cat-bat",
          alt: "A cat and a wooden baseball bat, each shown clearly",
        },
      ],
    ),
    demo(
      "bug-machine",
      "Listen to the ending.",
      "Listen to the ending. Say bug. Now listen to rug and cup. Try both buttons. Which pair sounds the same at the end?",
      [
        {
          id: "rug",
          label: "Bug and rug",
          words: "bug|rug",
          script: "Bug. Rug. Bug and rug rhyme. Listen to their matching endings!",
          photo: "bug-rug",
          alt: "A beetle and a small woven rug, each shown clearly",
        },
        {
          id: "cup",
          label: "Bug and cup",
          words: "bug|cup",
          script: "Bug. Cup. Those endings sound different. Bug and cup do not rhyme.",
          photo: "bug-cup",
          alt: "A beetle and a plain drinking cup, each shown clearly",
        },
      ],
    ),
    choose(
      "find-fox",
      "fox",
      ["dog", "box", "sun"],
      "box",
      "fox-box",
      "A red fox and a cardboard box, each shown clearly",
    ),
    choose(
      "find-fan",
      "fan",
      ["pan", "cup", "dog"],
      "pan",
      "fan-pan",
      "A household fan and a frying pan, each shown clearly",
    ),
    sort("cat-pig-homes", { cat: ["hat", "mat"], pig: ["wig", "dig"] }),
    choose(
      "find-pen",
      "pen",
      ["log", "sun", "hen"],
      "hen",
      "pen-hen",
      "A writing pen and a hen, each shown clearly",
    ),
    sort("three-rhyme-homes", { bug: ["rug", "jug"], hen: ["pen", "ten"], fan: ["man", "can"] }),
    choose(
      "find-mouse",
      "mouse",
      ["car", "house", "boat"],
      "house",
      "mouse-house",
      "A small mouse and a house, each shown clearly",
    ),
    demo(
      "ears-first",
      "Our ears find the rhyme.",
      "Our ears find the rhyme. Rhyming words do not have to look alike. Listen to blue and shoe, then blue and black. Try both buttons.",
      [
        {
          id: "shoe",
          label: "Blue and shoe",
          words: "blue|shoe",
          script:
            "Blue. Shoe. The words look different, but their endings sound the same. Blue and shoe rhyme!",
          photo: "blue-shoe-v2",
          alt: "A blue paint swatch and a plain red shoe, each shown clearly",
        },
        {
          id: "black",
          label: "Blue and black",
          words: "blue|black",
          script:
            "Blue. Black. Their beginnings sound alike, but their endings are different. Blue and black do not rhyme.",
          photo: "blue-black",
          alt: "A blue paint swatch and a black paint swatch",
        },
      ],
    ),
    {...makeRhyme("feed-machine-three-words", "hop", "rory-hop-v1"), prompt:"Feed Rory’s rhyme machine.", narration:n("Feed Rory’s rhyme machine. Listen: hop. Let’s find three different words that rhyme with hop. Say one word at a time. Take your time. Tap the microphone when you are ready. Rory will listen with Luna.")},
    {
      id: "ready",
      purpose: "celebrate",
      evidence: "demonstration",
      gate: "none",
      prompt: "Rory’s workshop is full of rhymes!",
      narration: n(
        "Rory’s workshop is full of rhymes! You listened for matching endings. Now try some new rhyme questions, and make a rhyme with Luna.",
      ),
      visual: {
        id: "workshop-photo",
        props: { image: pic("opening-matching-rory"), alt: "Rory beside the rhyme machine in the workshop" },
      },
    },
  ],
};
// Keep the six original human-authored questions intact, including feedback and provenance.
export const rorySourceQuestions = sourceQuestions;
export type RoryQuestion = PracticeQuestion & {
  sourceId: string;
  stimulusId: string;
  difficultyRationale: string;
  reviewStatus: "educator-review-required";
};
const rationale: Record<Band, string> = {
  easier:
    "Hear a familiar spoken target and find its rhyme among three clearly different endings; no decoding required.",
  core: "Connect multiple spoken pairs, sort two rhyme families, or select a pair from the preserved source bank.",
  harder:
    "Ignore shared beginnings, distinguish a nearby vowel, or identify an odd ending. These are authored levels, not child-calibrated difficulty.",
  challenging:
    "Find same-sounding endings across different spellings, with same-onset distractors. Hearing all choices remains intended access.",
};
function check(
  band: Band,
  index: number,
  scene: SceneDef,
  sourceId = "rhyme-time/adaptation/" + scene.id,
): RoryQuestion {
  return {
    id: `rory-check/${band}-${index}`,
    sourceId,
    stimulusId: sourceId,
    difficultyRationale: rationale[band],
    reviewStatus: "educator-review-required",
    standard: "RF.K.2a",
    band,
    difficulty: index,
    scene: { ...scene, purpose: "challenge", evidence: "assessed" },
  };
}
const sourcePair: SceneDef = {
  id: "source-pair",
  purpose: "challenge",
  evidence: "assessed",
  gate: "interaction",
  prompt: "Which pair of words rhymes?",
  narration: n("Which pair of words rhymes? Pig, box. Fan, can. Sun, moon. Tree, flower."),
  interaction: {
    type: "choose",
    options: sourceQuestions[0].choices.map((label) => ({ id: label, label, displayLines: label.split(",").map(word=>word.trim()), spoken: label + "." })),
    correctId: "Fan, Can",
    success: reveal(
      "fan-can",
      "Fan. Can.",
      "A household fan and a plain metal can, each shown clearly",
    ),
  },
  feedback: f(
    "Fan and can rhyme. Their endings sound the same!",
    "Listen to the end of both words in each pair. Which pair has matching ending sounds?",
  ),
};
const odd: SceneDef = {
  id: "source-odd",
  purpose: "challenge",
  evidence: "assessed",
  gate: "interaction",
  prompt: "Which word does not rhyme?",
  narration: n(
    "Which word does not rhyme? Hot. Bat. Cat. Hat. Three have the same ending sound. Find the one that is different.",
  ),
  interaction: {
    type: "choose",
    options: ["hot", "bat", "cat", "hat"].map((label) => ({
      id: label,
      label,
      spoken: label + ".",
    })),
    correctId: "hot",
    success: reveal(
      "cat-hat-bat",
      "Cat, hat and bat rhyme. Hot does not.",
      "A cat, a sun hat and a baseball bat: all three rhyming words",
    ),
  },
  feedback: f(
    "Cat, hat and bat rhyme. Hot has a different ending sound. You found the odd one out!",
    "Listen to cat, then listen to each word again. One has a different ending sound.",
  ),
};
export const roryChecks: RoryQuestion[] = [
  check(
    "core",
    0,
    pairs(
      "new-pairs",
      [
        ["bed", "red"],
        ["pot", "dot"],
        ["wall", "ball"],
      ],
      true,
    ),
  ),
  check("core", 1, sourcePair, "RF.K.2a-Q2"),
  check("core", 2, sort("two-homes", { tree: ["bee", "key"], car: ["star", "jar"] }, true)),
  check(
    "core",
    3,
    choose(
      "clock-partner",
      "clock",
      ["clap", "sock", "leaf"],
      "sock",
      "clock-sock",
      "An analog clock and a sock, each shown clearly",
    ),
  ),
  ...(
    [
      ["dog", ["log", "fish", "pan"], "log", "dog-log", "A dog and a log, each shown clearly"],
      [
        "bell",
        ["cup", "shell", "tree"],
        "shell",
        "bell-shell",
        "A bell and a seashell, each shown clearly",
      ],
      ["tree", ["car", "ball", "bee"], "bee", "tree-bee", "A tree and a bee, each shown clearly"],
      [
        "duck",
        ["truck", "bed", "fox"],
        "truck",
        "duck-truck",
        "A duck and a truck, each shown clearly",
      ],
      [
        "star",
        ["hat", "car", "pig"],
        "car",
        "star-car",
        "A star in the night sky and a car, each shown clearly",
      ],
      [
        "king",
        ["sun", "boat", "ring"],
        "ring",
        "king-ring",
        "A storybook king and a plain ring, each shown clearly",
      ],
    ] as [string, string[], string, string, string][]
  ).map(([target, choices, answer, image, alt], i) =>
    check("easier", i, choose("easy-" + target, target, choices, answer, image, alt)),
  ),
  check("harder", 0, odd, "RF.K.2a-H1"),
  check(
    "harder",
    1,
    choose(
      "sun-partner",
      "sun",
      ["sad", "sock", "bun", "sit"],
      "bun",
      "sun-bun",
      "The sun in a clear sky and a bread bun, each shown clearly",
    ),
    "RF.K.2a-H3",
  ),
  check(
    "harder",
    2,
    choose(
      "ten-partner",
      "ten",
      ["hen", "tin", "tan", "top"],
      "hen",
      "ten-hen",
      "Exactly ten native counting dots beside a hen",
    ),
    "RF.K.2a-H5",
  ),
  check("harder", 3, sort("near-endings", { rat: ["bat", "fat"], hill: ["pill", "mill"] }, true)),
  check(
    "challenging",
    0,
    choose(
      "chair-partner",
      "chair",
      ["chip", "bear", "chin", "cheer"],
      "bear",
      "chair-bear",
      "A chair and a brown bear, each shown clearly",
    ),
    "RF.K.2a-H2",
  ),
  check(
    "challenging",
    1,
    choose(
      "cake-partner",
      "cake",
      ["cat", "cane", "cape", "lake"],
      "lake",
      "cake-lake",
      "A small cake and a quiet lake, each shown clearly",
    ),
    "RF.K.2a-H4",
  ),
  check(
    "challenging",
    2,
    choose(
      "snow-partner",
      "snow",
      ["snail", "go", "sun", "snap"],
      "go",
      "snow-go",
      "Snow on the left and a child walking forward on a path on the right",
    ),
  ),
  check(
    "challenging",
    3,
    choose(
      "light-partner",
      "light",
      ["leaf", "lamp", "kite", "lip"],
      "kite",
      "light-kite",
      "A lit table lamp and a flying kite, each shown clearly",
    ),
  ),
];
function makeRhyme(id: string, target: string, rubricId: string): SceneDef {
  const prompt = `Make a rhyme with ${target}.`;
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(
      `${prompt} Listen: ${target}. Let’s find three different words with the same ending sound. Say one word at a time. Tap the microphone when you are ready.`,
    ),
    visual: {id:"rhyme-machine-input",props:{target,responseGoal:3,responseWords:""}},
    interaction: {
      type: "speak",
      mode: "respond",
      visualFeedback: true,
      rhymeSeries: {
        target, count:3,
        nextPrompts:[
          `You found one rhyme! Think of a different word that rhymes with ${target}. Take your time. Tap the microphone when you are ready.`,
          `Two rhymes! Can you think of one more different word that rhymes with ${target}? Tap the microphone when you are ready.`,
        ],
        targetRepeatScript:"That is our starting word. Think of a different word with the same ending sound.",
        duplicateScript:"You already found that word. Think of a different word with the same ending sound. Take your time.",
        completeScript:"You found three different rhyming words! The endings sound the same. Your rhyme collection is complete!",
      },
      text: prompt,
      rubricId,
      unclearScript: "I’m not sure about that rhyme yet. Try saying one word clearly, or try a different word.",
      unavailableScript: "Luna could not listen just now. You can try again, or move on.",
      success: reveal("opening-matching-rory", "You made a rhyme!", "Rory beside his rhyme machine"),
      responseReveals:
        target === "hop"
          ? {
              mop: reveal("mop", "Mop rhymes with hop!", "A real floor mop"),
              other: reveal("opening-matching-rory", "You made a rhyme!", "Rory beside his rhyme machine"),
            }
          : target === "sun" ? {other: reveal("opening-matching-rory", "You made a rhyme!", "Rory beside his rhyme machine")}
          : {
              goat: reveal("goat", "Goat rhymes with boat!", "A whole goat standing in a meadow"),
              coat: reveal("coat", "Coat rhymes with boat!", "A plain child-sized coat on a peg"),
              other: reveal("opening-matching-rory", "You made a rhyme!", "Rory beside his rhyme machine"),
            },
    },
    feedback: f(
      "You made a rhyme! The endings sound the same.",
      `Not quite. Those words have different ending sounds. Listen: ${target}. Try another word with the same ending sound.`,
    ),
  };
}
const rehearse: SceneDef = {
  id: "say-rhyme-pair",
  purpose: "guided",
  evidence: "practice",
  gate: "interaction",
  prompt: "Say the rhyme with Luna.",
  narration: n(
    "Say the rhyme with Luna. Listen first: Cat. Hat. Bat. Now tap the microphone and say all three words. You can listen again.",
  ),
  interaction: {
    type: "speak",
    mode: "read",
    text: "Cat. Hat. Bat.",
    allowHear: true,
    completionPolicy: "practice-coverage",
    autoStop: true,
    success: reveal(
      "cat-hat-bat",
      "Cat. Hat. Bat.",
      "A cat, a sun hat and a baseball bat, from left to right",
    ),
  },
  feedback: f(
    "Cat, hat and bat. You practiced saying the rhyme!",
    "Listen first, then try saying all three words.",
  ),
};
const explain: SceneDef = {
  id: "explain-rhyme",
  purpose: "guided",
  evidence: "practice",
  gate: "interaction",
  prompt: "How can your ears find a rhyme?",
  narration: n(
    "How can your ears find a rhyme? Think about what you listened for. Tap the microphone and tell Luna.",
  ),
  interaction: {
    type: "speak",
    mode: "respond",
    text: "How can your ears find a rhyme?",
    rubricId: "rory-ending-v1",
    unclearScript: "I did not catch that yet. You can try again, or move on.",
    success: reveal(
      "opening-matching-rory",
      "Listen for words that sound the same at the end.",
      "Rory beside his rhyme machine",
    ),
  },
  feedback: f(
    "Listen for words that sound the same at the end. That is how we find a rhyme!",
    "Think about the beginning and the end of a word. Which part did we listen to?",
  ),
};
export const roryClosing: PracticeQuestion[] = [
  rehearse,
  makeRhyme("make-sun-three-words", "sun", "rory-sun-v1"),
  makeRhyme("make-boat-three-words", "boat", "rory-boat-v1"),
  explain,
].map((scene) => ({
  id: "rory-response/" + scene.id,
  standard: "RF.K.2a",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
export const roryPractice = [...roryChecks, ...roryClosing];
export const roryPracticeCount = 12;
export const roryPracticeDone =
  "You practiced finding rhymes and tried your own words with Luna! Your carrots are ready.";
export const roryPerfectDone =
  "Every rhyme question, first try! You earned three extra carrots for careful listening!";
export const roryTimingTexts = [
  ...new Set(
    [...roryLesson.scenes, ...roryPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...(s.context ? [s.context, ...spokenSentences(s.context)] : []),
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "match"
        ? s.interaction.pairs.flatMap((p) => [
            s.interaction?.type === "match" ? (s.interaction.spoken?.[p.left] ?? p.left) : p.left,
            s.interaction?.type === "match"
              ? (s.interaction.spoken?.[p.right] ?? p.right)
              : p.right,
          ])
        : []),
      ...(s.interaction?.type === "sort" ? s.interaction.buckets : []),
      ...(s.interaction?.type === "speak" ? [s.interaction.text] : []),
    ]),
  ),
];
export const rorySpeech = collectSpeech(
  [roryLesson, { ...roryLesson, scenes: roryPractice.map((q) => q.scene) }],
  [
    roryWelcome,
    roryCompletion,
    roryPracticeDone,
    roryPerfectDone,
    ...roryLearned,
    roryWarmup.greeting,
    roryWarmup.intro,
    roryWarmup.ready,
    roryWarmup.finish,
    ...roryWarmup.targets.map((x) => x.instruction),
    ...roryTimingTexts,
    "Pop.",
    "Bun.",
    "Fun.",
    "Run.",
    "Lupini beans.",
    "Float.",
    "Fish.",
    "Let’s learn this together.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "You finished this question.",
    "Let’s try the next question.",
  ],
);
export const rorySpeechStyles: Record<string, string> = {"ball.": "Say only the single word ball in a natural, clear American English speaking voice. One syllable, with a clear final L. No elongated singing, no extra words."};
