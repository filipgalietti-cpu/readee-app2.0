import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./meaning-machines-timings.json";

// Meaning Machines (RF.3.3a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=meaning-machines
// G3 GATE PILOT: first 3rd-Grade lesson. Derivational tier of RF.3.3a:
// pre- (before), dis- (not/opposite), -ful (full of), -less (without),
// -able (can be), -tion (action becomes a thing) — morphology as
// meaning-machinery ("every part has one job, every time"; Aunt Rosa's
// repair-shop frame). ANCHOR FRESHNESS swept against prefix-suffix-decoders
// (preheat/prepay/careless/hopeless/teacher), word-math (un-/re-/mis- sets +
// quiz dis-/pre- transfer disagrees/preorder/distrust), prefix-power
// (unhappy/replay/helpful/joyful), root-clues, ending-readers, word-changers:
// ALL word sets here are fresh (preview, pregame, disconnect, disappear,
// dishonest, thankful, cheerful, powerful, endless, weightless, sleeveless,
// breakable, washable, movable, enjoyable, invention, celebration,
// subtraction, protection, powerless, disobeyed). -able and -tion are
// first-touch for the whole catalog. TTS carrier: "-tion" is always scripted
// as "the shun ending, spelled t, i, o, n" (bare "tion" is TTS-unstable).

const A = (id: string) => `/audio/lessons-v2/meaning-machines/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/meaning-machines/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/meaning-machines/${w.toLowerCase()}.png`;

export const meaningMachinesImages: Record<string, string> = {
  "repair-shop": "A warm cozy repair workshop where a kind aunt with curly dark hair in denim overalls holds up one small silver spring beside a green toy frog on a wooden workbench, while a young boy with brown skin and a push broom watches with a big smile, shelves of colorful gears, springs, and fan belts behind them, a ceiling fan spinning above. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "weightless-astronaut": "A smiling astronaut in a plain white spacesuit floating sideways inside a spaceship cabin with arms relaxed, a small silver wrench and a round water bubble floating in the air beside her, a round window showing dark space and stars. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "stained-shirt": "A young girl in a soccer uniform holding up a plain white soccer shirt streaked with bright green grass stains, a black and white soccer ball resting by her cleats on a sunny grass field. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-cloudless-sky": "A wide bright blue sky completely empty of clouds above one rolling green hill with a single leafy tree, warm sunshine lighting the grass. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-teddy-bear": "A big soft round brown teddy bear with open stitched arms sitting on a child's bed against a plain pillow, extra fluffy and squeezable looking. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const meaningMachines: LessonDef = {
  id: "meaning-machines",
  title: "Meaning Machines",
  grade: "3rd Grade",
  standard: "RF.3.3a",
  archetype: "phonics",
  objective: "I can take a big word apart and use its prefix or suffix to unlock what it means.",
  concepts: [
    "a prefix snaps onto the front (pre means before, dis means not or opposite)",
    "a suffix snaps onto the end and changes the word's job",
    "ful means full of, less means without",
    "able means can be",
    "the shun ending turns an action into a thing",
    "same part, same job, every time",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can take big words apart now. A prefix changes the front of a word, and a suffix changes the end, and each part does the same job every single time. Preview, disappear, weightless, breakable, invention. You unlocked every one of them by reading its parts. From now on, when a giant word shows up in your book, you do not skip it. You take it apart.",
    "title": "Meaning Machine Mechanic!",
    "body": "You took big words apart and used their prefixes and suffixes to unlock what they mean."
  },
  scenes: [
    {
      id: "hook-repair-shop",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a repair shop. Read along!",
      image: IMG("repair-shop"),
      narration: { audio: A("hook-repair-shop"), script: "Hello, reader. Today you learn how third graders take giant words apart. It all starts in a repair shop. Read along with me, and watch how every part has a job." },
      interaction: { type: "read-along", text: "On Saturday, Leo swept the floor at Aunt Rosa's repair shop, where broken machines came back to life. One small spring made a toy frog hop, and one worn belt made a big fan spin. \"Every part has one job,\" said Aunt Rosa, \"and it does that job every single time.\" Leo remembered that rule, and it turned out to be true for words, too.", audio: A("hook-repair-shop-sentence") },
    },
    {
      id: "model-prefix-pre",
      purpose: "model",
      gate: "none",
      prompt: "Watch me take a word apart.",
      fx: {"text":"**pre** plus view means see it **before**","effect":"pop-words"},
      narration: { audio: A("model-prefix-pre"), script: "Aunt Rosa's rule works on words, too. Many big words are machines built from smaller parts, and every part has one job. Watch me take one apart. Preview. I see two parts, pre and view. A part that snaps onto the front of a word is called a prefix, and the prefix pre always means before. View means to see, so a preview is a look you get before everyone else. Same part, same job, every time." },
    },
    {
      id: "model-prefix-dis",
      purpose: "model",
      gate: "none",
      prompt: "The prefix dis flips a word around.",
      fx: {"text":"**dis** flips a word to its **opposite**","effect":"cross-out"},
      narration: { audio: A("model-prefix-dis"), script: "Here is a second front machine. The prefix dis means not, or the opposite of. Watch it work on appear. Appear means to show up, so disappear means the opposite, there one moment and gone the next. Now watch the same job on dishonest. Honest means truthful, so dishonest means not truthful. The machine never changes its job." },
    },
    {
      id: "guided-choose-pregame",
      purpose: "guided",
      gate: "interaction",
      prompt: "When does a pregame talk happen?",
      narration: { audio: A("guided-choose-pregame"), script: "Your turn to run a front machine. The coach calls the team in for the pregame talk. Take pregame apart, the prefix first, then the base. When does a pregame talk happen? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "before-the-game", label: "before the game" }, { id: "after-the-game", label: "after the game" }, { id: "during-the-game", label: "during the game" }, { id: "instead-of-the-game", label: "instead of the game" }], correctId: "before-the-game", coachWrong: "Find the prefix at the front of pregame, and think about the one job that part always does." },
    },
    {
      id: "guided-sequence-disconnect",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Snap the parts into order.",
      narration: { audio: A("guided-sequence-disconnect"), script: "Here is a word in pieces. The base is connect, which means to join together. Drag the parts into snapping order, the prefix first, the base next, the whole word last. As you snap, think about what the whole word must mean." },
      interaction: { type: "sequence", items: [{ id: "dis", label: "dis" }, { id: "connect", label: "connect" }, { id: "disconnect", label: "disconnect" }], order: ["dis","connect","disconnect"], coachWrong: "Spot the prefix, because it snaps on at the front. The base comes next, and the whole word ends the line." },
    },
    {
      id: "model-suffix-ful-less",
      purpose: "model",
      gate: "none",
      prompt: "Suffixes snap onto the end of a word.",
      image: IMG("weightless-astronaut"),
      narration: { audio: A("model-suffix-ful-less"), script: "Now for the machines that snap onto the end of a word. An ending part is called a suffix, and a suffix has a bigger job. It changes what the word does in a sentence. Thank is something you do. Add the suffix ful, which means full of, and thankful describes a person who is full of thanks. Weight is a thing you can measure. Add less, which means without, and weightless describes this astronaut, floating without any weight at all." },
    },
    {
      id: "guided-sort-ful-less",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort by suffix: Full Of, or Without?",
      narration: { audio: A("guided-sort-ful-less"), script: "Your turn on the ending machines. Read each word and look at its suffix. If the ending means full of, drag the word to Full Of. If the ending means without, drag it to Without." },
      interaction: { type: "sort", buckets: ["Full Of","Without"], items: [{ label: "thankful", bucket: "Full Of" }, { label: "endless", bucket: "Without" }, { label: "powerful", bucket: "Full Of" }, { label: "weightless", bucket: "Without" }, { label: "cheerful", bucket: "Full Of" }, { label: "sleeveless", bucket: "Without" }], coachWrong: "Read the end of that word one more time. Does its ending mean full of, or without?" },
    },
    {
      id: "guided-transform-breakable",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word that means can be broken.",
      narration: { audio: A("guided-transform-breakable"), script: "Here is one more ending machine. The suffix able means can be. A sign at the museum warns that an old vase could break at any touch. Build the word that means can be broken. Tap the ending that does that job." },
      interaction: { type: "transform", base: "break", add: "able", result: "breakable", changeIndex: 4, options: ["able", "less", "ful"], labels: { added: "can be" }, successAudio: W("breakable"), coachWrong: "That ending has a different job. You need the one that means can be." },
    },
    {
      id: "apply-choose-washable",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word says the shirt can be washed?",
      image: IMG("stained-shirt"),
      narration: { audio: A("apply-choose-washable"), script: "Run the able machine yourself. Grass stains covered Nina's soccer shirt, but her mom was not worried at all. One of these words tells you the shirt can be washed. Read all four, then tap it." },
      interaction: { type: "choose", options: [{ id: "washable", label: "washable" }, { id: "washed", label: "washed" }, { id: "washing", label: "washing" }, { id: "wash", label: "wash" }], correctId: "washable", coachWrong: "You need the ending that means can be. Check the end of each word before you choose." },
    },
    {
      id: "model-suffix-tion",
      purpose: "model",
      gate: "none",
      prompt: "The strongest machine turns actions into things.",
      fx: {"text":"You **invent** it, and then it is an **invention**","effect":"magic"},
      narration: { audio: A("model-suffix-tion"), script: "One last machine, and it is the strongest one in the shop. This suffix is spelled t, i, o, n, and it says shun. The shun ending turns an action into a thing. Invent is an action, because you invent a new machine. Add the ending, and an invention is the thing you made. Protect is an action, because a helmet protects your head. Protection is the thing that keeps you safe." },
    },
    {
      id: "apply-sort-word-jobs",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort by job: Names a Thing, or Describes?",
      narration: { audio: A("apply-sort-word-jobs"), script: "Now sort by job. Three of these words name a thing that came from an action. Three of them describe. Read each word, check its ending machine, and drag it to its job." },
      interaction: { type: "sort", buckets: ["Names a Thing","Describes"], items: [{ label: "invention", bucket: "Names a Thing" }, { label: "enjoyable", bucket: "Describes" }, { label: "celebration", bucket: "Names a Thing" }, { label: "breakable", bucket: "Describes" }, { label: "subtraction", bucket: "Names a Thing" }, { label: "movable", bucket: "Describes" }], coachWrong: "Check the ending. Ask yourself if the word names something that happened, or tells what something is like." },
    },
    {
      id: "apply-speak-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: The pregame show felt endless, but the fans stayed cheerful. After the last goal, the cheering was powerful.",
      narration: { audio: A("apply-speak-read"), script: "These two sentences hold four machines. Read them out loud, clearly and with feeling, and let every word part do its job." },
      interaction: { type: "speak", text: "The pregame show felt endless but the fans stayed cheerful After the last goal the cheering was powerful" },
    },
    {
      id: "challenge-choose-powerless",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Take the new word apart. What does it mean?",
      narration: { audio: A("challenge-choose-powerless"), script: "Here is a word nobody taught you, built from parts you know. A storm knocked the wires down, and the whole street was powerless all night. Take powerless apart, then tap what it means." },
      interaction: { type: "choose", options: [{ id: "without-power", label: "without power" }, { id: "full-of-power", label: "full of power" }, { id: "power-again", label: "power again" }, { id: "power-from-before", label: "power from before" }], correctId: "without-power", coachWrong: "Split the word into its base and its ending. The ending does the same job it always does." },
    },
    {
      id: "challenge-speak-disobeyed",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what the new word means.",
      narration: { audio: A("challenge-speak-disobeyed"), script: "Last one, and now you are the machine. Rex the puppy heard the command to sit, and he disobeyed it. Think about the prefix dis, then tap the mic and tell me what disobeyed means." },
      interaction: { type: "speak", text: "not obey obeyed listen listened follow followed opposite refuse refused broke break rule rules command" },
    },
    {
      id: "celebrate-machine-mechanic",
      purpose: "celebrate",
      gate: "none",
      prompt: "Every part has one job, every time.",
      fx: {"text":"Same part, same job, **every time**","effect":"fireworks"},
      narration: { audio: A("celebrate-machine-mechanic"), script: "You ran every machine in the shop today. The prefix pre means before, and dis flips a word to its opposite. The suffix ful fills a word up, less empties it out, and able means can be. The shun ending turns an action into a thing. Every part has one job, and it does that job every single time. When a giant word shows up in your book, you know exactly how to take it apart." },
    },
  ],
};
