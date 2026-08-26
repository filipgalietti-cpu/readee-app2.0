import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./tell-it-back-timings.json";

// Tell It Back (RL.K.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=tell-it-back

const A = (id: string) => `/audio/lessons-v2/tell-it-back/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/tell-it-back/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/tell-it-back/${w.toLowerCase()}.png`;

export const tellItBackImages: Record<string, string> = {
  "hoot": "Friendly cartoon owl, wearing a small professor's cap",
  "pigs": "Three cartoon pigs, smiling",
  "house": "A small, simple house made of straw",
  "build": "A cartoon pig hammering nails into wood, building a house",
  "wolf": "A big, grey cartoon wolf, looking sneaky",
  "huff": "A cartoon wolf with puffed cheeks, blowing air",
  "safe": "Three cartoon pigs smiling inside a sturdy brick house",
  "seed": "A small brown seed with a tiny green sprout",
  "sun": "A bright yellow cartoon sun, smiling",
  "flower": "A large, colorful cartoon flower, blooming",
  "balloon": "A happy cartoon girl holding a red balloon on a string",
  "flies": "A red balloon flying away high in the sky, a cartoon girl below reaching up for it",
  "sad": "A sad cartoon girl with a tear on her cheek, empty sky above her",
  "straw": "A small, simple house made of straw",
  "stick": "A small, simple house made of sticks",
  "brick": "A small, sturdy house made of red bricks"
};

export const tellItBack: LessonDef = {
  id: "tell-it-back",
  title: "Tell It Back",
  grade: "Kindergarten",
  standard: "RL.K.2",
  archetype: "story-elements",
  objective: "I can tell what happened at the beginning, middle, and end of a story.",
  concepts: ["retell story","beginning","middle","end","key details"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are an amazing Story Helper! You learned to tell stories by finding the beginning, middle, and end. Keep practicing and telling all your favorite stories!",
    "title": "Super Story Helper!",
    "body": "You can tell what happens first, next, and last!"
  },
  scenes: [
    {
      id: "hook-listen-story",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Listen to our story!",
      fx: {"text":"The Three Little **Pigs**!","effect":"pop-words"},
      narration: { audio: A("hook-listen-story"), script: "Hello, little Story Helpers! I'm Professor Hoot. I love stories, but sometimes I get them mixed up. Can you help me learn to tell them in order? Let's listen to a story first. It's called 'The Three Little Pigs'." },
      interaction: { type: "read-along", text: "Once there were three little **pigs**. They each built a **house**. One pig built a **straw** house. One pig built a **stick** house. One pig built a **brick** house. A big, bad **wolf** came. He blew down the **straw** house. He blew down the **stick** house. But he could not blow down the **brick** house! The three little **pigs** were **safe** in the brick house!", audio: A("hook-listen-story-sentence") },
    },
    {
      id: "model-beginning",
      purpose: "model",
      gate: "interaction",
      prompt: "What happened first?",
      fx: {"text":"The **beginning** is what happened first.","effect":"underline"},
      narration: { audio: A("model-beginning"), script: "Wow, what a great story! Professor Hoot wants to show you how to tell a story in order. First, we think about the beginning. The beginning is what happened at the very start. In our story, the pigs built their houses. Tap the picture for 'build'." },
      interaction: { type: "choose", options: [{ id: "build", label: "BUILD", audio: W("build"), image: IMG("build") }, { id: "wolf", label: "WOLF", audio: W("wolf"), image: IMG("wolf") }, { id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }], correctId: "build", coachWrong: "That's not quite the beginning. The pigs built their houses first." },
    },
    {
      id: "model-middle",
      purpose: "model",
      gate: "interaction",
      prompt: "What happened next?",
      fx: {"text":"The **middle** is what happened next.","effect":"underline"},
      narration: { audio: A("model-middle"), script: "Great job! After the beginning, we think about the middle. The middle is what happened next in the story. In our story, the wolf came and blew down two houses. Tap the picture for 'huff'." },
      interaction: { type: "choose", options: [{ id: "huff", label: "HUFF", audio: W("huff"), image: IMG("huff") }, { id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }, { id: "house", label: "HOUSE", audio: W("house"), image: IMG("house") }], correctId: "huff", coachWrong: "Hmm, that wasn't exactly the middle. The wolf huffed and puffed in the middle." },
    },
    {
      id: "model-end",
      purpose: "model",
      gate: "interaction",
      prompt: "What happened last?",
      fx: {"text":"The **end** is what happened last.","effect":"underline"},
      narration: { audio: A("model-end"), script: "You're doing super! Now, let's think about the end. The end is what happened last in the story. In our story, the pigs were safe in the brick house. Tap the picture for 'safe'." },
      interaction: { type: "choose", options: [{ id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }, { id: "huff", label: "HUFF", audio: W("huff"), image: IMG("huff") }, { id: "build", label: "BUILD", audio: W("build"), image: IMG("build") }], correctId: "safe", coachWrong: "Not quite. The pigs were safe at the very end." },
    },
    {
      id: "guided-sequence-story",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put story parts in order.",
      narration: { audio: A("guided-sequence-story"), script: "You helped Professor Hoot find the beginning, middle, and end! Now, let's put them in order. Remember: first, next, last. Drag the pictures to show what happened first, next, and last. I'll help you!" },
      interaction: { type: "sequence", items: [{ id: "build-house", label: "BUILD", audio: W("build"), image: IMG("build") }, { id: "wolf-huff", label: "HUFF", audio: W("huff"), image: IMG("huff") }, { id: "pigs-safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }], order: ["build-house","wolf-huff","pigs-safe"], coachWrong: "Oops, remember the beginning comes first. What happened first in the story?" },
    },
    {
      id: "guided-retell-start",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the **start** of the story.",
      fx: {"text":"Tap the **start** of the story.","effect":"underline"},
      narration: { audio: A("guided-retell-start"), script: "Wonderful! You put the story in order. Now, let's practice telling it back. Professor Hoot will help you remember the parts. Tap the picture that shows what happened at the start of the story." },
      interaction: { type: "choose", options: [{ id: "build", label: "BUILD", audio: W("build"), image: IMG("build") }, { id: "huff", label: "HUFF", audio: W("huff"), image: IMG("huff") }, { id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }], correctId: "build", coachWrong: "Remember, at the start, the pigs built their houses." },
    },
    {
      id: "guided-retell-middle",
      purpose: "guided",
      gate: "interaction",
      prompt: "Say the **middle** of the story.",
      fx: {"text":"Say what the wolf did in the **middle**.","effect":"underline"},
      image: IMG("wolf"),
      narration: { audio: A("guided-retell-middle"), script: "That's right! The pigs built their houses first. Now the middle. What did the wolf do to the houses? Tap the mic and say the word." },
      interaction: { type: "speak", text: "huff" },
    },
    {
      id: "guided-retell-end",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the **end** of the story.",
      fx: {"text":"Tap the **end** of the story.","effect":"underline"},
      narration: { audio: A("guided-retell-end"), script: "Super! The wolf huffed in the middle. What happened at the end of the story? Tap the picture that shows what happened last." },
      interaction: { type: "choose", options: [{ id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }, { id: "huff", label: "HUFF", audio: W("huff"), image: IMG("huff") }, { id: "build", label: "BUILD", audio: W("build"), image: IMG("build") }], correctId: "safe", coachWrong: "Try again. At the end, the pigs were safe." },
    },
    {
      id: "apply-new-story-sequence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put THIS story in order!",
      narration: { audio: A("apply-new-story-sequence"), script: "Now let's try a new, very short story. Listen carefully. A boy plants a seed. The sun helps it grow. A big flower blooms! Put the pictures in order: what happened first, next, and last." },
      interaction: { type: "sequence", items: [{ id: "plant-seed", label: "SEED", audio: W("seed"), image: IMG("seed") }, { id: "sun-grow", label: "SUN", audio: W("sun"), image: IMG("sun") }, { id: "big-flower", label: "FLOWER", audio: W("flower"), image: IMG("flower") }], order: ["plant-seed","sun-grow","big-flower"], coachWrong: "Think about what happened first in this story. What was planted?" },
    },
    {
      id: "challenge-sequence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "You try! What happens first?",
      narration: { audio: A("challenge-sequence"), script: "Professor Hoot has a tricky one for you. This story is told only in pictures. Look at each picture, then put them in order: first, next, last. You can do this one all by yourself." },
      interaction: { type: "sequence", items: [{ id: "girl-balloon", label: "BALLOON", audio: W("balloon"), image: IMG("balloon") }, { id: "balloon-flies", label: "FLIES", audio: W("flies"), image: IMG("flies") }, { id: "girl-sad", label: "SAD", audio: W("sad"), image: IMG("sad") }], order: ["girl-balloon","balloon-flies","girl-sad"], coachWrong: "Keep trying! What happened at the very beginning of this little story?" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Story Helper!",
      fx: {"text":"You can tell what happens at the **beginning**, in the **middle**, and at the **end** of a story!","effect":"rainbow"},
      narration: { audio: A("celebrate-success"), script: "You did it! You are a super Story Helper! You can tell what happens at the beginning, in the middle, and at the end of a story! Professor Hoot is so proud of you!" },
    },
  ],
};
