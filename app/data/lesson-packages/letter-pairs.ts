import type { LessonDef, SceneDef, ChooseDef, MatchDef, SortDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { letterPairs } from "@/app/data/lessons-v2/letter-pairs";
import sourceQuestions from "./letter-pairs-source-questions.json";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
// Adapt the human B/b, M/m, S/s lesson. New examples and terminology await educator review.
export const lanternAsset = (name: string) => `/lesson-studio/letter-pairs/${name}`;
const pic = (name: string) => lanternAsset(name + ".webp");
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
const letterName = (letter: string) => `The letter ${letter.toUpperCase()}.`;
const caseName = (letter: string) =>
  `${letter === letter.toUpperCase() ? "Uppercase" : "Lowercase"} ${letter}.`;
const pairVisual = (letters: string, variant = "regular") => ({
  id: "lantern-letters",
  props: { letters, variant },
});
export const lanternTargetImage = (letters: string, variant = "regular") =>
  pic(
    "v2/target-" +
      letters
        .split(" ")
        .map((x) => (x === x.toUpperCase() ? "upper-" : "lower-") + x.toLowerCase())
        .join("-") +
      "-" +
      variant,
  );
const reveal = (letters: string, sentence: string) => ({
  image: pic("v2/pair-" + letters.toLowerCase()),
  alt: `Uppercase and lowercase ${letters.toUpperCase()} on two garden lanterns`,
  sentence,
});
export const lanternWarmup = {
  title: "Lantern Matches",
  tileName: "tile" as const,
  nextLabel: "Light the letter garden",
  seconds: 45,
  largeBoard: 12,
  compactBoard: 12,
  backdrop: pic("garden-floor"),
  invitation: "What is hiding in the garden?",
  greeting:
    "Welcome to Lantern Matches! Find matching garden pictures. Ready to warm up? Tap Let’s play to begin.",
  intro:
    "Tap two tiles. Matching pictures earn two carrots! If they do not match, the tiles turn back over. Remember where each picture hides. Ready?",
  finish:
    "You found garden matches! Keep your match carrots, plus two for warming up. Now let’s light the letter garden.",
  emptyFinish:
    "You explored the garden! Here are two carrots for warming up. Now let’s light the letter garden.",
  labels: ["Bug", "Flower", "Leaf", "Snail", "Moon", "Star"],
  pictures: ["bug", "cherry-blossom", "leaf", "snail", "moon", "star"].map(
    (x) => `/icons/fluent/${x}.svg`,
  ),
};
export const lanternWelcome =
  "Welcome to the Lantern Letter Garden! Play a quick matching game. Then discover two ways to write the same letter.";
export const lanternCompletion =
  "You explored three letter pairs! Uppercase and lowercase letters can share a name. Now you are ready to practice finding letter partners and telling Luna their names.";
export const lanternLearned = ["Match B with b.", "Match M with m.", "Match S with s."];
function choose(
  id: string,
  prompt: string,
  letters: string[],
  correct: string,
  hint: string,
  target = "",
  variant = "regular",
): SceneDef {
  const correctText = target
    ? `${caseName(target).slice(0, -1)} and ${caseName(correct).replace(/^./, (char) => char.toLowerCase()).slice(0, -1)} are partners.`
    : `${caseName(correct)} You found the letter!`;
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(prompt + " You can listen to a letter if you need help."),
    ...(target ? { visual: pairVisual(target, variant) } : {}),
    interaction: {
      type: "choose",
      replayIsHelp: true,
      options: letters.map((label) => ({ id: label, label, spoken: caseName(label) })),
      correctId: correct,
      success: reveal(correct, correctText),
    } satisfies ChooseDef,
    feedback: f(correctText, hint),
  };
}
function match(id: string, reverse = false, assessed = false): SceneDef {
  const pairs = ["B", "M", "S"].map((x) => ({
    left: reverse ? x.toLowerCase() : x,
    right: reverse ? x : x.toLowerCase(),
  }));
  const prompt = "Match the letter partners.";
  return {
    id,
    purpose: assessed ? "challenge" : "guided",
    evidence: assessed ? "assessed" : "practice",
    gate: "interaction",
    prompt,
    narration: n(
      prompt +
        (assessed ? " Tap a letter on each side. Connect all three pairs, then check your matches. The sound buttons can help you hear a letter name." : " Tap a letter and listen to its name. Find its partner on the other side. Connect all three pairs, then check your matches."),
    ),
    interaction: {
      type: "match",
      pairs,
      replayIsHelp: assessed,
      autoPlayOnSelect: !assessed,
      spoken: Object.fromEntries(
        pairs.flatMap((p) => [p.left, p.right]).map((x) => [x, caseName(x)]),
      ),
    } satisfies MatchDef,
    feedback: f(
      "You matched the uppercase and lowercase forms of B, M, and S! Each pair has the same letter name.",
      "Look at each letter’s shape. Match it with the other way to write that letter.",
    ),
  };
}
function sort(id: string, letters: string[], assessed = false): SceneDef {
  const prompt = "Give each letter a home.";
  return {
    id,
    purpose: assessed ? "challenge" : "guided",
    evidence: assessed ? "assessed" : "practice",
    gate: "interaction",
    prompt,
    narration: n(
      prompt +
        " Move each letter into uppercase or lowercase. Look at its shape, not how tall it is.",
    ),
    interaction: {
      type: "sort",
      buckets: ["Uppercase", "Lowercase"],
      items: letters.map((label) => ({
        label,
        spoken: letterName(label),
        bucket: label === label.toUpperCase() ? "Uppercase" : "Lowercase",
        explanation: caseName(label),
      })),
    } satisfies SortDef,
    feedback: f(
      "Every letter has a home! You sorted by uppercase and lowercase forms.",
      "Think about the two forms we explored. Look at the letter’s shape.",
    ),
  };
}
function nameLetter(id: string, letter: "B" | "m" | "s"): SceneDef {
  const prompt = "Tell Luna this letter’s name.";
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(prompt + " Look at the letter. Tap the microphone and say its name."),
    image: lanternTargetImage(letter),
    imageAlt: caseName(letter),
    interaction: {
      type: "speak",
      mode: "respond",
      text: prompt,
      rubricId: `lantern-name-${letter.toLowerCase()}-v1`,
      recognitionVocabulary: "letter-names",
      unclearScript: "I did not catch that yet. You can try again, or move on.",
      success: reveal(letter, letterName(letter)),
    },
    feedback: f(
      letterName(letter),
      "Think about the letter names we heard in the garden. You can try again.",
    ),
  };
}
/** Shape explanations describe the same simple print forms the lantern diagrams draw. */
export const lanternFormLessons: Record<string, { description: string; parts: { path: string; cue: string }[] }> = {
  B: { description: "Uppercase B has a tall line and two round curves on the right. Follow the line and the curves with your finger.", parts: [{path:"M30 18V112",cue:"line"},{path:"M30 18H51C90 18 90 63 51 63H30M30 63H54C96 63 96 112 54 112H30",cue:"curves"}] },
  b: { description: "Lowercase b has a tall line and one round curve on the right, near the bottom. Trace it in the air.", parts: [{path:"M30 18V112",cue:"line"},{path:"M30 80C30 42 84 42 84 83C84 121 30 123 30 85",cue:"curve"}] },
  M: { description: "Uppercase M has two tall lines on the sides. Two slanting lines meet in the middle. Follow them down and up with your finger.", parts: [{path:"M23 112V18M91 18V112",cue:"tall"},{path:"M23 18L57 72L91 18",cue:"slanting"}] },
  m: { description: "Lowercase m has a short line and two humps. Go up and over each hump with your finger.", parts: [{path:"M18 61V112",cue:"line"},{path:"M18 79C18 53 54 53 54 79V112M54 79C54 53 90 53 90 79V112",cue:"humps"}] },
  S: { description: "Uppercase S curves around at the top, then bends the other way at the bottom. Follow the curving path with your finger.", parts: [{path:"M85 30C56 0 15 22 28 48C39 68 74 57 84 82C98 118 44 130 23 104",cue:"curves"}] },
  s: { description: "Lowercase s has a curving shape, too. Curve one way, then the other way.", parts: [{path:"M78 66C58 48 28 57 32 74C36 90 68 79 78 96C88 119 47 124 29 110",cue:"curving"}] },
};
const lanternFormBounds: Record<string, { x: number; y: number; width: number; height: number }> = {"B": {"x": 30, "y": 18, "width": 55.5, "height": 94}, "b": {"x": 30, "y": 18, "width": 54, "height": 94.51972961425781}, "M": {"x": 23, "y": 18, "width": 68, "height": 94}, "m": {"x": 18, "y": 59.5, "width": 72, "height": 52.5}, "S": {"x": 23, "y": 15.546257972717285, "width": 63.28694152832031, "height": 102.41722869873047}, "s": {"x": 29, "y": 56.131935119628906, "width": 50.549034118652344, "height": 61.65565490722656}};
/** Center the actual drawn shape in the paper body, independent of case or glyph width. */
export function lanternGlyphTransform(letter: string, scale = .8): string {
  const box = lanternFormBounds[letter];
  return `translate(${75 - (box.x + box.width / 2) * scale} ${110 - (box.y + box.height / 2) * scale}) scale(${scale})`;
}
export const lanternAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const lanternLesson: LessonDef = {
  ...letterPairs,
  id: "letter-pairs-coached-v1",
  title: "Lantern Letter Garden",
  objective:
    "Recognize, name, and match B/b, M/m, and S/s. Uppercase and lowercase are forms, not font sizes. This focused lesson contributes to RF.K.1d; it does not establish all-alphabet mastery. Spoken names are supported practice pending child-speech calibration.",
  completion: {
    title: "Ready to practice!",
    body: "Find letter partners and tell Luna their names.",
    script: lanternCompletion,
  },
  scenes: [
    {
      id: "garden",
      purpose: "hook",
      evidence: "demonstration",
      gate: "none",
      prompt: "Light the letter garden.",
      narration: n(
        "Light the letter garden. A letter has an uppercase form and a lowercase form. Two ways to write the same letter! Today we will explore B, M, and S.",
      ),
      visual: {
        id: "lantern-photo",
        props: {
          image: pic("opening"),
          alt: "A peaceful painted garden at dusk, with warm paper lanterns above a winding path",
        },
      },
    },
    ...(["B", "M", "S"] as const).map(
      (letter) =>
        ({
          id: "meet-" + letter.toLowerCase(),
          purpose: "model",
          evidence: "demonstration",
          gate: "interaction",
          prompt: `Meet the letter ${letter}.`,
          narration: n(
            `Meet the letter ${letter}. Tap uppercase, then lowercase. Watch the shapes light up. Trace each letter in the air with your finger.`,
          ),
          visual: {
            id: "lantern-letters",
            props: { letters: letter + " " + letter.toLowerCase(), activeForm: letter },
          },
          interaction: {
            type: "transform",
            control: "toggle",
            base: "",
            add: "",
            result: "",
            changeIndex: 0,
            states: [letter, letter.toLowerCase()].map((value) => ({
              id: value,
              label: value === value.toUpperCase() ? "Uppercase" : "Lowercase",
              text: "",
              script: lanternFormLessons[value].description,
              visual: { letters: letter + " " + letter.toLowerCase(), activeForm: value },
            })),
          },
        }) as SceneDef,
    ),
    choose(
      "guided-b",
      "Find uppercase B’s lowercase partner.",
      ["m", "b", "s"],
      "b",
      "Remember the B pair. Lowercase b has a tall line and one round part.",
      "B",
    ),
    choose(
      "guided-m",
      "Find lowercase m’s uppercase partner.",
      ["S", "B", "M"],
      "M",
      "Remember the M pair. Look for the uppercase form with two tall sides and a dip in the middle.",
      "m",
    ),
    {
      id: "alphabet-partners",
      purpose: "model",
      evidence: "demonstration",
      gate: "none",
      prompt: "Explore the alphabet garden.",
      narration: n("Explore the alphabet garden. Every letter has an uppercase form and a lowercase form. Tap a pair to light its lanterns and hear its name. You can explore, then move on."),
      visual: pairVisual("B b"),
      interaction: {
        type: "transform", control: "toggle", startUnselected: true,
        base: "", add: "", result: "", changeIndex: 0,
        states: lanternAlphabet.map(letter => ({
          id: letter, label: `${letter} ${letter.toLowerCase()}`, text: "",
          script: `Uppercase ${letter} and lowercase ${letter.toLowerCase()}. Two ways to write the letter ${letter}.`,
          visual: { letters: `${letter} ${letter.toLowerCase()}`, activeForm: "", variant: "regular" },
        })),
      },
    },
    sort("sort-forms", ["B", "m", "b", "M"]),
    match("connect-garden"),
    {
      id: "ready",
      purpose: "celebrate",
      evidence: "demonstration",
      gate: "none",
      prompt: "You lit the letter garden!",
      narration: n(
        "You lit the letter garden! You matched uppercase and lowercase forms of B, M, and S. Two forms, the same letter name! Now let’s practice and tell Luna some letter names.",
      ),
      visual: { id: "lantern-celebration", props: { letters: "Bb Mm Ss", celebration: true } },
    },
  ],
};
// The original nine questions remain intact. They name letters outside this source's B/M/S focus.
export const lanternSourceExtensions = sourceQuestions;
export const lanternSourceExtensionReason =
  "Prerequisite-gated extension: A/G/P/d/R/W are outside the human B/M/S teaching scope. Preserve original keys and wording; do not claim untaught-letter mastery. Journey integration and educator review required.";
export type LanternQuestion = PracticeQuestion & {sourceId:string;stimulusId:string;difficultyRationale:string;reviewStatus:"educator-review-required"};
const bandRationale: Record<Band,string> = {
  easier:"Recognize a spoken name among three letters in the same case; optional candidate-name replay is assistance.",
  core:"Connect three pairs, distinguish name plus case, or find a partner from a displayed glyph. Familiar B/M/S scope only.",
  harder:"Distinguish both forms of the same letter among distractors, or classify mixed B/M forms. Educator difficulty judgment, not calibrated.",
  challenging:"Infer the other form without its case being named, vary target print size, or reverse matching direction. No untaught letters or all-alphabet mastery claim.",
};
function check(band: Band, index: number, scene: SceneDef): LanternQuestion {
  const { visual, ...rest } = scene;
  const image = visual
    ? lanternTargetImage(String(visual.props?.letters), String(visual.props?.variant ?? "regular"))
    : undefined;
  return {
    id: `lantern-check/${band}-${index}`,
    sourceId: "letter-pairs/adaptation/"+scene.id,
    stimulusId: "letter-pairs/"+scene.id,
    difficultyRationale:bandRationale[band],reviewStatus:"educator-review-required",
    standard: "RF.K.1d",
    band,
    difficulty: index,
    scene: {
      ...rest,
      ...(image ? { image, imageAlt: String(visual?.props?.letters) } : {}),
      purpose: "challenge",
      evidence: "assessed",
    },
  };
}
export const lanternChecks: LanternQuestion[] = [
  check("core", 0, match("match-core", false, true)),
  check(
    "core",
    1,
    choose(
      "core-name-b",
      "Find uppercase B.",
      ["b", "M", "B"],
      "B",
      "Think of the uppercase form with a tall line and two round parts.",
    ),
  ),
  check(
    "core",
    2,
    choose(
      "core-pair-s",
      "Find this letter’s uppercase partner.",
      ["S", "B", "M"],
      "S",
      "Both S forms have a curving shape.",
      "s",
    ),
  ),
  check("core", 3, sort("core-sort", ["m", "B", "b"], true)),
  ...(["B", "M", "S", "b", "m", "s"] as const).map((letter, index) =>
    check(
      "easier",
      index,
      choose(
        "easy-" + letter,
        `Find the letter ${letter.toUpperCase()}.`,
        (letter === letter.toUpperCase() ? ["B", "M", "S"] : ["b", "m", "s"])
          .slice(Math.floor(index / 3))
          .concat(
            (letter === letter.toUpperCase() ? ["B", "M", "S"] : ["b", "m", "s"]).slice(
              0,
              Math.floor(index / 3),
            ),
          ),
        letter,
        `Think about the ${letter.toUpperCase()} pair we explored. You can use the sound buttons for help.`,
      ),
    ),
  ),
  check("harder", 0, sort("mixed-forms", ["b", "M", "m", "B"], true)),
  check(
    "harder",
    1,
    choose(
      "hard-m",
      "Find the lowercase form of M.",
      ["M", "s", "m"],
      "m",
      "The uppercase form has straight sides. Find its lowercase partner with two humps.",
      "M",
      "small",
    ),
  ),
  check(
    "harder",
    2,
    choose(
      "hard-b",
      "Find the uppercase form of b.",
      ["b", "B", "M"],
      "B",
      "Find the uppercase form with two round parts.",
      "b",
      "large",
    ),
  ),
  check(
    "harder",
    3,
    choose(
      "hard-m-name",
      "Find uppercase M.",
      ["m", "M", "B"],
      "M",
      "Look for the M form with straight tall sides.",
    ),
  ),
  check("challenging", 0, match("reverse-pairs", true, true)),
  check(
    "challenging",
    1,
    choose(
      "challenge-m",
      "Find the same letter in its other form.",
      ["S", "M", "m"],
      "M",
      "The shown letter is lowercase m. Find its uppercase partner.",
      "m",
      "large",
    ),
  ),
  check(
    "challenging",
    2,
    choose(
      "challenge-b",
      "Find the same letter in its other form.",
      ["b", "s", "B"],
      "b",
      "The shown letter is uppercase B. Find its lowercase partner.",
      "B",
      "small",
    ),
  ),
  check(
    "challenging",
    3,
    choose(
      "challenge-m-upper",
      "Find the same letter in its other form.",
      ["B", "M", "m"],
      "m",
      "The shown letter is uppercase M. Find its lowercase partner.",
      "M",
      "small",
    ),
  ),
];
const explain: SceneDef = {
  id: "explain-pair",
  purpose: "guided",
  evidence: "practice",
  gate: "interaction",
  prompt: "Why do these two letters go together?",
  narration: n(
    "Why do these two letters go together? Look at the pair. Tap the microphone and tell Luna.",
  ),
  image: lanternTargetImage("B b"),
  imageAlt: "Uppercase B beside lowercase b",
  interaction: {
    type: "speak",
    mode: "respond",
    text: "Why do these two letters go together?",
    rubricId: "lantern-pair-v1",
    unclearScript: "I did not catch that yet. You can try again, or move on.",
    success: reveal("B", "They are two forms of the letter B!"),
  },
  feedback: f(
    "They are two forms of the letter B!",
    "Think about their letter names. What stays the same?",
  ),
};
export const lanternClosing: PracticeQuestion[] = [
  nameLetter("name-b", "B"),
  nameLetter("name-m", "m"),
  nameLetter("name-s", "s"),
  explain,
].map((scene) => ({
  id: "lantern-response/" + scene.id,
  standard: "RF.K.1d",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
export const lanternPractice = [...lanternChecks, ...lanternClosing];
export const lanternPracticeCount = 12;
export const lanternPracticeDone =
  "You found letter partners and practiced their names with Luna! Your carrots are ready.";
export const lanternPerfectDone =
  "Every letter question, first try! You earned three extra carrots for careful thinking!";
const matchSpeech = (i: MatchDef) =>
  i.pairs.flatMap((p) => [i.spoken?.[p.left] ?? p.left, i.spoken?.[p.right] ?? p.right]);
export const lanternTimingTexts = [
  ...new Set(
    [...lanternLesson.scenes, ...lanternPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...(s.context ? [s.context, ...spokenSentences(s.context)] : []),
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "match" ? matchSpeech(s.interaction) : []),
      ...(s.interaction?.type === "speak" ? [s.interaction.text] : []),
    ]),
  ),
];
export const lanternSpeech = collectSpeech(
  [lanternLesson, { ...lanternLesson, scenes: lanternPractice.map((q) => q.scene) }],
  [
    lanternWelcome,
    lanternCompletion,
    lanternPracticeDone,
    lanternPerfectDone,
    ...lanternLearned,
    lanternWarmup.greeting,
    lanternWarmup.intro,
    lanternWarmup.finish,
    lanternWarmup.emptyFinish,
    ...lanternWarmup.labels,
    ...lanternTimingTexts,
    "Let’s learn this together.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "You finished this question.",
    "Let’s try the next question.",
  ],
).filter(text => !/^[A-Z] [a-z]$/.test(text));
export const lanternSpeechStyles: Record<string, string> = { ...Object.fromEntries(lanternSpeech.filter(text => /\b[BbMmSs]\b/.test(text) || /^Uppercase [A-Z] and lowercase/.test(text)).map(text => [text,
  "Friendly American reading teacher, clear natural pace. This lesson teaches LETTER NAMES, never phonemes or sounds. Say an isolated B or b as bee, M or m as em, S or s as ess. Always name every other alphabet letter normally too, including lowercase letters. Do not pronounce a letter as a sound, buzz, hum, or hiss. Read the supplied script faithfully, without singing or stretching letter names."
])),
  ...Object.fromEntries(["C", "T", "Y"].map(letter => [
    `Uppercase ${letter} and lowercase ${letter.toLowerCase()}. Two ways to write the letter ${letter}.`,
    `Read the script in exactly the supplied order. Say Uppercase first, never substitute capital. Clear normal American teacher voice. These are LETTER NAMES: C is see, T is tee, Y is why. Say every uppercase and lowercase letter as its name. Do not reorder the sentences, paraphrase, or sing.`,
  ])),
  // Reuse the natural object-name take accepted by the Book Workshop pronunciation checks.
  Snail: "Name the animal in clear conversational American English: snail, pronounced /sneɪl/, rhyming with mail and whale. Use the long A vowel, not the EE vowel. Speak the provided single word once at a normal brisk pace, as if naming a picture for a child. No drawn-out sounds, spelling, extra words, or singing.",
};
