import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./science-word-wonder-timings.json";

// Science Word Wonder (RI.K.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=science-word-wonder

const A = (id: string) => `/audio/lessons-v2/science-word-wonder/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/science-word-wonder/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/science-word-wonder/${w.toLowerCase()}.png`;

export const scienceWordWonderImages: Record<string, string | { subject: string; ref?: string }> = {
  "sip": "A bright orange and black monarch butterfly perched on a big pink flower, its long thin black tongue uncoiled like a straw reaching into the center of the flower to drink. Friendly nonfiction illustration, the butterfly looks and acts like a real butterfly.",
  "nectar": { subject: "The orange and black monarch butterfly perched on a big yellow flower, tiny drops of clear golden liquid glistening in the center of the flower, the butterfly's long thin tongue reaching toward the sweet drops.", ref: "sip" },
  "hatch": "A tiny pale striped baby caterpillar crawling out of a small cracked white egg on a green leaf. Friendly nonfiction illustration, the caterpillar looks and acts like a real caterpillar.",
  "migrate": { subject: "A big group of orange and black monarch butterflies flying together high across a blue sky, heading toward the warm sun above green hills far away.", ref: "sip" },
  "drink": "A clear cup of water with a red drinking straw in it.",
  "jump": "A brown rabbit jumping in mid-air over green grass. Friendly nonfiction illustration.",
  "juice": "A clear glass full of orange juice.",
  "rock": "A smooth grey stone on the ground.",
  "born": "A small yellow chick coming out of a cracked white egg. Friendly nonfiction illustration.",
  "sleep": "A grey cat with natural solid grey fur curled up fast asleep with its eyes closed. Friendly nonfiction illustration, the cat looks like a real cat with realistic natural coloring.",
  "travel": "A plain white airplane with red stripes flying high in a clear blue sky, small white clouds below. The airplane is a simple machine with no face, no eyes, and no smile."
};

export const scienceWordWonder: LessonDef = {
  id: "science-word-wonder",
  title: "Science Word Wonder",
  grade: "Kindergarten",
  standard: "RI.K.4",
  archetype: "vocabulary",
  objective: "I can figure out new science words in a fact book.",
  concepts: ["ask and answer questions about unknown words","use photos to understand words","use sentences to understand words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super science word detective! You stopped at each new word. You looked at the photo and listened to the sentence for clues. Sip, nectar, hatch, and migrate. You figured them all out!",
    "title": "Science Word Wonder!",
    "body": "You used photo and sentence clues to figure out new science words!"
  },
  scenes: [
    {
      id: "hook-fact-book",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "New science words ahead!",
      fx: {"text":"science words","effect":"pop-words"},
      narration: { audio: A("hook-fact-book"), script: "Hello, word detectives. Today we will read a fact book about real butterflies. Fact books use science words. When we find a new science word, we stop, look at the photo, and listen to the sentence for clues. Here is our book." },
      interaction: { type: "read-along", text: "This fact book is all about butterflies.", audio: A("hook-fact-book-sentence") },
    },
    {
      id: "model-picture-clue",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find a clue!",
      image: IMG("sip"),
      narration: { audio: A("model-picture-clue"), script: "Page one says, \"The butterfly sips from the flower.\" Sips. That is a new science word. Watch how I figure it out. I stop and look at the photo. The butterfly's long tongue is inside the flower, like a straw in a cup. It is taking a tiny drink. So sip must mean drink. The photo was my clue." },
    },
    {
      id: "model-check-sip",
      purpose: "model",
      gate: "interaction",
      prompt: "What does \"sip\" mean?",
      image: IMG("sip"),
      narration: { audio: A("model-check-sip"), script: "Now you show me. The book says, \"The butterfly sips from the flower.\" Look at the photo clue. What does sip mean? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "drink", label: "DRINK", audio: W("drink"), image: IMG("drink") }, { id: "jump", label: "JUMP", audio: W("jump"), image: IMG("jump") }], correctId: "drink", coachWrong: "Look at the photo. The butterfly's tongue is in the flower, like a straw in a cup. Think about what it is doing." },
    },
    {
      id: "guided-read-nectar",
      purpose: "guided",
      gate: "interaction",
      prompt: "A new page, a new word!",
      image: IMG("nectar"),
      narration: { audio: A("guided-read-nectar"), script: "Here is the next page of our fact book. It has a new science word. Watch the words light up while I read. Follow along with your eyes." },
      interaction: { type: "read-along", text: "Butterflies sip sweet nectar from flowers.", audio: A("guided-read-nectar-sentence") },
    },
    {
      id: "guided-choose-nectar",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is \"nectar\"?",
      image: IMG("nectar"),
      narration: { audio: A("guided-choose-nectar"), script: "The book says, \"Butterflies sip sweet nectar from flowers.\" Nectar. Stop at that new word. Look at the photo. The butterfly is sipping the sweet drops inside the flower. What could nectar be? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "juice", label: "JUICE", audio: W("juice"), image: IMG("juice") }, { id: "rock", label: "ROCK", audio: W("rock"), image: IMG("rock") }], correctId: "juice", coachWrong: "Look at the photo again. The butterfly is sipping something sweet from the flower. Think about what you can sip." },
    },
    {
      id: "apply-read-hatch",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the next page!",
      image: IMG("hatch"),
      narration: { audio: A("apply-read-hatch"), script: "New page, new science word. Watch the words light up while I read. Follow along with your eyes." },
      interaction: { type: "read-along", text: "A baby caterpillar hatches out of its egg.", audio: A("apply-read-hatch-sentence") },
    },
    {
      id: "apply-choose-hatch",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does \"hatch\" mean?",
      image: IMG("hatch"),
      narration: { audio: A("apply-choose-hatch"), script: "The book says, \"A baby caterpillar hatches out of its egg.\" Hatch. Stop and look closely at the photo of the caterpillar and its egg. What does hatch mean? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "born", label: "BORN", audio: W("born"), image: IMG("born") }, { id: "sleep", label: "SLEEP", audio: W("sleep"), image: IMG("sleep") }], correctId: "born", coachWrong: "Look at the photo again. The egg is cracked open, and the baby caterpillar is climbing out. Think about what just happened to it." },
    },
    {
      id: "apply-say-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what \"sip\" means.",
      image: IMG("sip"),
      narration: { audio: A("apply-say-meaning"), script: "Word detectives can say what a science word means. Think back to our fact book. The butterfly sips from the flower with its long tongue. What does sip mean? Tap the mic and say your answer." },
      interaction: { type: "speak", text: "drink drinks drinking" },
    },
    {
      id: "challenge-migrate",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does \"migrate\" mean?",
      image: IMG("migrate"),
      narration: { audio: A("challenge-migrate"), script: "Here is your last page, detective. The book says, \"In the fall, monarch butterflies migrate to a warm place far away.\" Migrate. Stop, look at the photo, and think about the sentence. What could migrate mean? Tap your best answer." },
      interaction: { type: "choose", options: [{ id: "travel", label: "TRAVEL", audio: W("travel"), image: IMG("travel") }, { id: "sleep", label: "SLEEP", audio: W("sleep"), image: IMG("sleep") }], correctId: "travel", coachWrong: "Look at the photo. The butterflies are all flying somewhere far away. Think about what they are doing." },
    },
    {
      id: "celebrate-word-wonder",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Science Word Wonder!",
      fx: {"text":"Great job, word detective!","effect":"burst"},
      narration: { audio: A("celebrate-word-wonder"), script: "You are a super science word detective! You stopped at each new word. You looked at the photo and listened to the sentence for clues. Sip, nectar, hatch, and migrate. You figured them all out!" },
    },
  ],
};
