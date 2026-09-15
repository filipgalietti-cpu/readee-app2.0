import type { LessonDef, SceneDef, ChooseDef, SortDef, MatchDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { syllableBeats } from "@/app/data/lessons-v2/syllable-beats";
import sourceQuestions from "./syllable-beats-source-questions.json";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
export const beatAsset = (name: string) => `/lesson-studio/syllable-beats/${name}`;
const pic = (name: string) => beatAsset(name + ".webp");
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
const reveal = (name: string, sentence: string) => ({ image: pic(name), alt: sentence, sentence });
const names = ["zero", "one", "two", "three", "four"];
export const beatWarmup = {
  title: "Beat Buddy’s Jungle Trail",
  actorName: "Beat Buddy",
  eyebrow: "A quick canopy adventure",
  goalLabel: "the drum",
  goalImage: beatAsset("drum.svg"),
  boardLabel: "Guide Beat Buddy through the jungle paths",
  winTitle: "Ready for the band!",
  winMessage: "Our music clearing is ready.",
  emptyMessage: "Good exploring. Let’s hear some word beats!",
  nextLabel: "Meet Beat Buddy",
  introTitle: "Find a path to the drum",
  introDescription: "Drag Beat Buddy or use the arrows. Collect carrots along the way.",
  trailMark: "dots" as const,
  seconds: 45,
  backdrop: pic("jungle-floor"),
  greeting:
    "Welcome to Beat Buddy’s Jungle Trail! Help our monkey friend find the drum. Ready to warm up? Tap Let’s play.",
  intro:
    "Drag Beat Buddy along the paths, or use the arrow buttons. Collect carrots on your way to the drum. You have forty-five seconds. Ready?",
  finish:
    "You found the drum! Two carrots for getting there, plus two for warming up. Keep the carrots you collected, too! Now let’s listen for word beats.",
  emptyFinish:
    "Good exploring! Keep your carrots, plus two for warming up. Beat Buddy is ready to listen for word beats with you.",
};
export const beatWelcome =
  "Welcome to Beat Buddy’s music clearing! Play a quick jungle trail game. Then listen, clap, and count the beats in spoken words.";
export const beatCompletion =
  "You listened for word beats, called syllables. Now you are ready to practice counting syllables and say some words with Luna.";
export const beatLearned = [
  "Listen to the whole spoken word.",
  "Clap once for each syllable.",
  "Count one, two, or three syllables.",
];
// Candidate cue offsets must be derived from these exact recordings and reviewed.
// The listening player fails closed when a model has no validated cue track.
export const beatModels = [
  { word: "dog", count: 1, parts: ["Dog"], script: "Dog. The whole word has one syllable. One clap." },
  { word: "sun", count: 1, parts: ["Sun"], script: "Sun. The whole word has one syllable. One clap." },
  { word: "tiger", count: 2, parts: ["Tye", "ger"], script: "Tye. Ger. The whole word has two syllables. Two claps." },
  { word: "apple", count: 2, parts: ["Ap", "ul"], script: "Ap. Ul. The whole word has two syllables. Two claps." },
  { word: "banana", count: 3, parts: ["Buh", "nan", "nuh"], script: "Buh. Nan. Nuh. The whole word has three syllables. Three claps." },
  { word: "butterfly", count: 3, parts: ["Buh", "ter", "fly"], script: "Buh. Ter. Fly. The whole word has three syllables. Three claps." },
] as const;
function model(id: string, prompt: string, intro: string, words: string[]): SceneDef {
  const states = words.map((word) => {
    const m = beatModels.find((x) => x.word === word)!;
    return {
      id: word,
      label: word,
      text: "",
      script: m.script,
      visual: {
        word,
        count: m.count,
        image: pic(word),
        alt: `${word} for our spoken-word demonstration`,
        modelScript: m.script,
      },
    };
  });
  return {
    id,
    purpose: "model",
    evidence: "demonstration",
    gate: "interaction",
    prompt,
    narration: n(intro),
    visual: { id: "beat-stage", props: { ...states[0].visual } },
    interaction: {
      type: "transform",
      control: "toggle",
      base: "",
      add: "",
      result: "",
      changeIndex: 0,
      states,
    },
  };
}
// Guided counting supplies audible beats; scored practice keeps whole-word prompts.
const guidedWords: Record<string,{parts:string[];direction:string}> = {
  cat:{parts:["Cat"],direction:"Say cat naturally only where written after Listen. End the utterance immediately after the final word beats; do not repeat cat at the end."},
  pig:{parts:["Pig"],direction:"Say pig naturally only where written after Listen. End the utterance immediately after the final word beats; do not repeat pig at the end."},
  apple:{parts:["App","ul"],direction:"Say AP, ul: /æp/ /əl/. AP rhymes with cap without c; ul is the soft last syllable of apple."},
  monkey:{parts:["Mun","kee"],direction:"Say MUN, kee: /mʌŋ/ /ki/. Preserve the ng sound at the end of monkey’s first syllable; kee rhymes with key."},
  butterfly:{parts:["Buh","ter","fly"],direction:"Say BUH, ter, fly: the three syllables of butterfly. Ter is unstressed with the American English er sound; fly rhymes with sky. Do not spell letters."},
};
function count(id: string, word: string, beats: number, choices = ["1", "2", "3"], guided = false): SceneDef {
  choices = [...choices].sort((a,b)=>Number(a)-Number(b));
  const prompt = `How many syllables are in ${word}?`;
  const parts=guided?guidedWords[word]?.parts:undefined;
  const script=`${prompt} Listen: ${parts?parts.join(". "):word}. ${choices.map((x)=>names[+x]+".").join(" ")} Say the word and count its beats.`;
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(script),
    ...(parts?{visual:{id:"beat-stage",hideOnSuccess:true,props:{word,count:beats,image:pic(word),alt:word,modelScript:script,guided:true}}}:{}),
    interaction: {
      type: "choose",
      ...(!guided?{stimulus:{src:pic(word),alt:word}}:{}),
      options: choices.map((label) => ({ id: label, label, spoken: names[+label] + "." })),
      correctId: String(beats),
      success: reveal(
        word,
        `${word[0].toUpperCase() + word.slice(1)} has ${names[beats]} ${beats === 1 ? "syllable" : "syllables"}.`,
      ),
    } satisfies ChooseDef,
    feedback: f(
      `${word[0].toUpperCase() + word.slice(1)} has ${names[beats]} ${beats === 1 ? "syllable" : "syllables"}! You counted its word beats.`,
      `Listen to ${word} again. Say it naturally and clap its word beats. Count the claps.`,
    ),
  };
}
function sort(id: string, groups: Record<string, string[]>): SceneDef {
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt: "Sort the words by their syllables.",
    narration: n(
      "Sort the words by their syllables. Hear a word, clap its beats, then move it to a syllable group.",
    ),
    interaction: {
      type: "sort",
      buckets: Object.keys(groups),
      items: Object.entries(groups).flatMap(([bucket, words]) =>
        words.map((label) => ({
          label,
          spoken: label + ".",
          bucket,
          explanation: `${label[0].toUpperCase() + label.slice(1)} has ${bucket.toLowerCase()}.`,
        })),
      ),
    } satisfies SortDef,
    feedback: f(
      "You sorted the words by their spoken syllables!",
      "Say the word again. Clap once for each word beat. Try its syllable group.",
    ),
  };
}
function select(
  id: string,
  prompt: string,
  choices: string[],
  answer: string,
  feedback: string,
): SceneDef {
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(`${prompt} ${choices.map((x) => x + ".").join(" ")} Listen to each whole word.`),
    interaction: {
      type: "choose",
      options: choices.map((label) => ({ id: label, label, spoken: label + "." })),
      correctId: answer,
      success: reveal(answer.toLowerCase(), feedback),
    } satisfies ChooseDef,
    feedback: f(feedback, "Listen to each word again. Say it naturally and count its syllables."),
  };
}
export const beatLesson: LessonDef = {
  ...syllableBeats,
  id: "syllable-beats-coached-v1",
  title: "Beat Buddy’s Music Clearing",
  objective:
    "Listen, pronounce with support and count one-, two- and three-syllable spoken words. A focused contribution to RF.K.2b; taps and word coverage do not establish segmentation or pronunciation mastery. Expanded three-beat teaching and source adaptations require educator review.",
  completion: {
    title: "Ready to practice!",
    body: "Listen for syllables in new words.",
    script: beatCompletion,
  },
  scenes: [
    {
      id: "clearing",
      purpose: "hook",
      evidence: "demonstration",
      gate: "none",
      prompt: "Listen for word beats.",
      narration: n(
        "Listen for word beats. Meet Beat Buddy! Words have parts we can hear, called syllables. We can clap once for each syllable. Let’s try it together.",
      ),
      visual: {
        id: "beat-photo",
        props: {
          image: pic("opening"),
          alt: "Beat Buddy, an intact small monkey, beside a drum in a painted jungle music clearing",
        },
      },
    },
    model(
      "one-beat",
      "One syllable. One clap.",
      "One syllable. One clap. A syllable is a beat we hear in a word. These words each have one syllable. Tap a word. Listen, say it, and clap once with the drum. Try both buttons.",
      ["dog", "sun"],
    ),
    count("cat-guided", "cat", 1, ["2", "1", "3"], true),
    count("pig-guided", "pig", 1, ["1", "3", "2"], true),
    model(
      "two-beats",
      "Some words have two beats.",
      "Some words have two beats. Hear tiger and apple. The drum taps once for each syllable. Clap along, then try the other word.",
      ["tiger", "apple"],
    ),
    count("apple-guided", "apple", 2, ["1", "2", "3"], true),
    sort("source-sort", {
      "One syllable": ["dog", "sun", "fish"],
      "Two syllables": ["tiger", "apple", "candy"],
    }),
    count("monkey-challenge", "monkey", 2, ["3", "1", "2"], true),
    model(
      "three-beats",
      "Listen for three syllables.",
      "Listen for three syllables. Banana and butterfly each have three syllables. Choose a word and clap along. Then try the other word.",
      ["banana", "butterfly"],
    ),
    count("butterfly-guided", "butterfly", 3, ["2", "3", "1"], true),
    sort("three-groups", {
      "One syllable": ["pig", "fish"],
      "Two syllables": ["candy", "monkey"],
      "Three syllables": ["banana", "butterfly"],
    }),
    {
      id: "ready",
      purpose: "celebrate",
      evidence: "demonstration",
      gate: "none",
      prompt: "Great counting!",
      narration: n(
        "Great counting! You practiced hearing syllables and clapping their beats. Now let’s try some new words and read with Luna.",
      ),
      visual: {
        id: "beat-photo",
        props: { image: pic("opening"), alt: "Beat Buddy in the jungle music clearing" },
      },
    },
  ],
};
export const beatGuidedModels = beatLesson.scenes.filter(s=>s.visual?.props?.guided).map(s=>{
  const word=String(s.visual!.props!.word), choices=s.interaction as ChooseDef;
  return {word,count:Number(s.visual!.props!.count),parts:guidedWords[word].parts,script:s.narration!.script,after:"listen",next:names[+choices.options[0].id]};
});
export const beatSourceQuestions = sourceQuestions;
// Retain the original blending item, but do not assess an unmodeled operation.
export const beatSourceExtensions = sourceQuestions
  .filter((q) => q.id === "RF.K.2b-Q5")
  .map((q) => ({
    source: q,
    reason:
      "Rain + bow blending is not taught in this focused counting lesson. Needs an explicit blending model and reviewed bow pronunciation.",
    status: "prerequisite-and-educator-review-required" as const,
  }));
export type BeatQuestion = PracticeQuestion & {
  sourceId: string;
  stimulusId: string;
  difficultyRationale: string;
  reviewStatus: "educator-review-required";
};
const rationale: Record<Band, string> = {
  easier:
    "Count a familiar one/two-beat word, with three neutral numeric choices. Auditory access is intended; no independent decoding inference.",
  core: "Connect words with equal syllable counts or select a count/category from the original source. Familiar source items are supported practice, not unseen transfer.",
  harder:
    "Distinguish word length/spelling from spoken beats; use nearby counts and mixed one/two/three groups. Authored, not calibrated.",
  challenging:
    "Find or count three-beat words and compare groups across words of different lengths. Requires the explicit three-beat model; not calibrated.",
};
function check(
  band: Band,
  index: number,
  scene: SceneDef,
  sourceId = "syllable-beats/adaptation/" + scene.id,
): BeatQuestion {
  return {
    id: `beat-check/${band}-${index}`,
    standard: "RF.K.2b",
    band,
    difficulty: index,
    sourceId,
    stimulusId: sourceId,
    difficultyRationale: rationale[band],
    reviewStatus: "educator-review-required",
    scene: { ...scene, purpose: "challenge", evidence: "assessed" },
  };
}
function original(id: string, word?: string, beats?: number): SceneDef {
  const q = sourceQuestions.find((x) => x.id === id)!;
  return word
    ? count(id, word, beats!, q.choices)
    : select(
        id,
        id === "RF.K.2b-H3" ? "Which word has one syllable?" : "Which word has two syllables?",
        q.choices,
        q.correct,
        `${q.correct} has ${id === "RF.K.2b-H3" ? "one syllable" : "two syllables"}.`,
      );
}
const matched: SceneDef = {
  id: "same-beat-pairs",
  purpose: "challenge",
  evidence: "assessed",
  gate: "interaction",
  prompt: "Match words with the same number of syllables.",
  narration: n(
    "Match words with the same number of syllables. Hear each word and count its beats. Connect all three pairs, then check your matches.",
  ),
  interaction: {
    type: "match",
    pairs: [
      { left: "duck", right: "shell" },
      { left: "rabbit", right: "lemon" },
      { left: "tomato", right: "potato" },
    ],
    spoken: {
      duck: "Duck.",
      shell: "Shell.",
      rabbit: "Rabbit.",
      lemon: "Lemon.",
      tomato: "Tomato.",
      potato: "Potato.",
    },
  } satisfies MatchDef,
  feedback: f(
    "Duck and shell have one syllable. Rabbit and lemon have two. Tomato and potato have three. You matched their word beats!",
    "Count the syllables in both words. Match equal counts, then check all three pairs.",
  ),
};
export const beatChecks: BeatQuestion[] = [
  ...(
    [
      ["bell", 1, ["1", "2", "3"]],
      ["robot", 2, ["1", "2", "3"]],
      ["boat", 1, ["3", "2", "1"]],
      ["taco", 2, ["2", "3", "1"]],
      ["sock", 1, ["2", "1", "3"]],
      ["panda", 2, ["3", "1", "2"]],
    ] as [string, number, string[]][]
  ).map(([w, c, o], i) => check("easier", i, count("easy-" + w, w, c, o))),
  check("core", 0, matched),
  check("core", 1, original("RF.K.2b-Q1", "cat", 1), "RF.K.2b-Q1"),
  check("core", 2, original("RF.K.2b-Q4"), "RF.K.2b-Q4"),
  check("core", 3, original("RF.K.2b-H5"), "RF.K.2b-H5"),
  check("harder", 0, original("RF.K.2b-H1", "kite", 1), "RF.K.2b-H1"),
  check("harder", 1, original("RF.K.2b-H2", "turtle", 2), "RF.K.2b-H2"),
  check("harder", 2, original("RF.K.2b-H3"), "RF.K.2b-H3"),
  check("harder", 3, original("RF.K.2b-H4", "jumped", 1), "RF.K.2b-H4"),
  check("challenging", 0, original("RF.K.2b-Q2", "banana", 3), "RF.K.2b-Q2"),
  check("challenging", 1, original("RF.K.2b-Q3", "butterfly", 3), "RF.K.2b-Q3"),
  check(
    "challenging",
    2,
    select(
      "three-beat-new",
      "Which word has three syllables?",
      ["window", "hat", "basket", "dinosaur"],
      "dinosaur",
      "Dinosaur has three syllables.",
    ),
  ),
  check(
    "challenging",
    3,
    sort("new-sort", {
      "One syllable": ["train", "snail"],
      "Two syllables": ["window", "basket"],
      "Three syllables": ["dinosaur", "ladybug"],
    }),
  ),
];
function oral(
  id: string,
  prompt: string,
  rubricId: string,
  image: string,
  sentence: string,
): SceneDef {
  return {
    id,
    purpose: "guided",
    evidence: "practice",
    gate: "interaction",
    prompt,
    narration: n(prompt + " Tap the microphone and tell Luna."),
    interaction: {
      type: "speak",
      mode: "respond",
      text: prompt,
      rubricId,
      unclearScript: "I could not check that yet. You can try again, or move on.",
      success: reveal(image, sentence),
    },
    feedback: f(sentence, "Say the whole word and think about its beats. You can try again."),
  };
}
const rehearsal: SceneDef = {
  id: "say-the-words",
  purpose: "guided",
  evidence: "practice",
  gate: "interaction",
  prompt: "Say the words with Luna.",
  narration: n(
    "Say the words with Luna. Listen first: Dog. Tiger. Banana. Now tap the microphone and say all three. You can listen again.",
  ),
  interaction: {
    type: "speak",
    mode: "read",
    text: "Dog. Tiger. Banana.",
    allowHear: true,
    completionPolicy: "practice-coverage",
    autoStop: true,
    success: reveal("three-words", "Dog. Tiger. Banana."),
  },
  feedback: f(
    "You practiced saying all three words!",
    "Listen first, then try saying all three words.",
  ),
};
export const beatClosing: PracticeQuestion[] = [
  rehearsal,
  oral(
    "count-rabbit",
    "How many syllables are in rabbit?",
    "beat-rabbit-v1",
    "rabbit",
    "Rabbit has two syllables.",
  ),
  oral(
    "count-potato",
    "How many syllables are in potato?",
    "beat-potato-v1",
    "potato",
    "Potato has three syllables.",
  ),
  oral(
    "explain-beats",
    "How can you count the syllables in a word?",
    "beat-explain-v1",
    "opening",
    "Say the word. Clap its syllables, then count the claps!",
  ),
].map((scene) => ({
  id: "beat-response/" + scene.id,
  standard: "RF.K.2b",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
export const beatPractice = [...beatChecks, ...beatClosing];
export const beatPracticeCount = 12;
export const beatPracticeDone =
  "You practiced counting syllables and speaking with Luna! Your carrots are ready.";
export const beatPerfectDone =
  "Every syllable question, first try! Three extra carrots for careful listening!";
export const beatTimingTexts = [
  ...new Set(
    [...beatLesson.scenes, ...beatPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "match" ? Object.values(s.interaction.spoken ?? {}) : []),
      ...(s.interaction?.type === "sort" ? s.interaction.buckets : []),
      ...(s.interaction?.type === "speak" ? [s.interaction.text] : []),
    ]),
  ),
];
export const beatSpeech = collectSpeech(
  [beatLesson, { ...beatLesson, scenes: beatPractice.map((q) => q.scene) }],
  [
    beatWelcome,
    beatCompletion,
    beatPracticeDone,
    beatPerfectDone,
    ...beatLearned,
    beatWarmup.greeting,
    beatWarmup.intro,
    beatWarmup.finish,
    beatWarmup.emptyFinish,
    ...beatTimingTexts,
    "Let’s learn this together.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "You finished this question.",
    "Let’s try the next question.",
  ],
);
export const beatSpeechStyles: Record<string, string> = Object.fromEntries(
  beatModels.map((m) => [
    m.script,
    m.count > 1 ? `Use the warm natural Autonoe reading-teacher voice. The first ${m.count} written units are pronunciation cues for the syllables of ${m.word}, not letter names or separate vocabulary words. Say them as a teacher naturally models each syllable, with a clear short pause between them. ${m.word === "banana" ? "Say buh, NAN, nuh: /bə/ /næ/ /nə/. Stress NAN; buh and nuh have the soft unstressed uh vowel. Do not say nah or noo." : m.word === "tiger" ? "Say TYE, ger: /taɪ/ /gɚ/. TYE rhymes with sky; ger has a hard g, never j, then the er in tiger." : m.word === "butterfly" ? "Say BUH, ter, fly: the three syllables of butterfly. Ter is unstressed with the American English er sound; fly rhymes with sky." : "Say AP, ul: /æp/ /əl/. AP rhymes with cap without the c; ul is the soft unstressed last syllable of apple."} Then pause and read the remaining explanation conversationally. No singing, no spelled letters, no added words. Keep each syllable smooth and human-sounding; do not elongate it.` : "Use the warm natural Autonoe reading-teacher voice. Speak the first word clearly at a gentle conversational pace, followed by a short pause. Pronounce the complete word naturally, without stretching sounds or spelling letters. Read only the exact text.",
  ]),
);

// Add only guided utterances; the approved banana model source identity stays unchanged.
for(const m of beatGuidedModels) beatSpeechStyles[m.script]=`Use the warm natural Autonoe reading-teacher voice. Read the question normally. After Listen, deliberately model the written pronunciation cues as syllables with clear short pauses, then read the number choices and remaining instructions naturally. ${guidedWords[m.word].direction} Read only the exact text. No singing or added words.`;
export const beatAudioModels=[...beatModels,...beatGuidedModels];

beatSpeechStyles[beatLesson.scenes.at(-1)!.narration!.script]="Use the warm natural Autonoe teacher voice. Say Great counting with warm, gentle celebration. Read each remaining sentence smoothly at a conversational pace. Pause only between complete sentences. Read only the exact text, once, without adding words.";
