import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./read-with-your-brain-timings.json";

// Read With Your Brain (RF.2.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=read-with-your-brain
//
// Lane note: RF.2.4 (read-like-you-talk) owns fluency MECHANICS (smooth, end
// marks, expression). This lesson owns reading FOR something: pick a purpose
// before you read, check "did that make sense?" while you read, reread to fix.

const A = (id: string) => `/audio/lessons-v2/read-with-your-brain/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/read-with-your-brain/${w.toLowerCase()}.png`;

export const readWithYourBrainImages: Record<string, string> = {
  "pip-honey": "A small friendly brown bear cub holding a tiny woven basket, gazing up at a golden honeycomb high in a pine tree, sunny forest, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  // Quiz easier-band picture support:
  "soup-book": "An open cookbook on a kitchen counter, its pages showing only a big picture of a steaming bowl of soup, no writing on the pages, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "dragon-book": "A closed storybook with a friendly green dragon pictured on the cover, lying on a cozy pillow, no writing on the cover, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "duck-pond": "A happy yellow duck swimming on a calm blue pond, cattails at the edge, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "red-bike": "A shiny red bicycle with a bell parked by a leafy green tree, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
};

export const readWithYourBrain: LessonDef = {
  id: "read-with-your-brain",
  title: "Read With Your Brain",
  grade: "2nd Grade",
  standard: "RF.2.4a",
  archetype: "fluency",
  objective: "I can pick a purpose before I read and check that every line makes sense.",
  concepts: [
    "before you read, know your purpose: find out, enjoy, or learn how",
    "while you read, your brain checks every line: did that make sense?",
    "when a line stops making sense, go back and reread it",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You read with your brain turned on today. You picked a purpose before you read. You checked every line for sense. And when a line broke, you went back and reread it. Give every read a why, and every story will make sense.",
    title: "Brain-On Reader!",
    body: "Pick your why, check for sense, reread to fix. That is brain-on reading.",
  },
  scenes: [
    {
      id: "hook-pip-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Our purpose: find out what Pip wants. Read along.",
      image: IMG("pip-honey"),
      narration: { audio: A("hook-pip-story"), script: "Your voice already knows how to read smooth. Today your brain gets a job too. Before you read, pick a purpose. Here is a story about a bear named Pip. Our purpose is to find out what Pip wants. Keep that question in your head, and read along with me." },
      interaction: { type: "read-along", text: "Pip was a small bear with a big dream. He loved sweet golden honey more than anything. One sunny morning, he packed his little basket and marched into the woods. He passed the tall oak trees and a busy brown squirrel. A wide river blocked his path, but an old log helped him cross. High in a pine tree, Pip spied a golden honeycomb buzzing with bees.", audio: A("hook-pip-story-sentence") },
    },
    {
      id: "guided-choose-pip-wants",
      purpose: "guided",
      gate: "interaction",
      prompt: "Your purpose was to find out. What did Pip want?",
      narration: { audio: A("guided-choose-pip-wants"), script: "You read that page with one purpose in your head. Did your brain catch the answer while you read? Tap what Pip wanted more than anything." },
      interaction: { type: "choose", options: [{ id: "honey", label: "sweet golden honey" }, { id: "basket", label: "a shiny new basket" }, { id: "oak", label: "a tall oak tree" }, { id: "squirrel", label: "a busy brown squirrel" }], correctId: "honey", coachWrong: "Think back to the very start of the story. Pip had a big dream. Tap what his dream was about." },
    },
    {
      id: "model-three-whys",
      purpose: "model",
      gate: "none",
      prompt: "Before you read, know your why.",
      fx: { text: "**Find out.** **Enjoy.** **Learn how.**", effect: "pop-words" },
      narration: { audio: A("model-three-whys"), script: "Reading is always for something. Sometimes you read to find out, like we just did with Pip. Sometimes you read the same story again just to enjoy it, and you slow down for every step of his walk. And sometimes you read to learn how, like the steps for building a birdhouse. Same eyes, different why. Before you read, know your why." },
    },
    {
      id: "guided-choose-recipe",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why do you read a recipe?",
      narration: { audio: A("guided-choose-recipe"), script: "Time to pick a why. You open a recipe for corn muffins. Think about what a recipe is for. Tap your purpose for reading it." },
      interaction: { type: "choose", options: [{ id: "learn-how", label: "to learn how to make them" }, { id: "enjoy", label: "to enjoy a made-up story" }, { id: "find-out", label: "to find out the game score" }, { id: "joke", label: "to hear a funny joke" }], correctId: "learn-how", coachWrong: "A recipe is a set of steps to follow. Tap the why that matches following steps." },
    },
    {
      id: "apply-sort-purpose",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each read: To Learn, or For Fun?",
      narration: { audio: A("apply-sort-purpose"), script: "Readers pick their books to match their purpose. Read each card. If you would read it to learn something, drag it to To Learn. If you would read it just for fun, drag it to For Fun." },
      interaction: { type: "sort", buckets: ["To Learn", "For Fun"], items: [{ label: "how to tie a knot", bucket: "To Learn" }, { label: "a tale of a brave mouse", bucket: "For Fun" }, { label: "steps to plant a seed", bucket: "To Learn" }, { label: "a silly poem about socks", bucket: "For Fun" }, { label: "facts about big sharks", bucket: "To Learn" }, { label: "a comic about a space cat", bucket: "For Fun" }], coachWrong: "Ask what you would get from that read. New know-how, or just a smile? Drag it to the bucket that matches." },
    },
    {
      id: "model-sense-check",
      purpose: "model",
      gate: "none",
      prompt: "While you read, your brain asks one question.",
      fx: { text: "Did that **make sense**?", effect: "underline" },
      narration: { audio: A("model-sense-check"), script: "Picking a purpose is job one. Job two never stops. While you read, your brain checks every line. Did that make sense? Listen to a reader who went too fast. The line was, the horse ate the hay. But she read, the house ate the hay. A house cannot eat hay. The sense broke. So she went back and reread the line, the horse ate the hay. Now it makes sense." },
    },
    {
      id: "guided-highlight-broken",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that breaks the sense.",
      narration: { audio: A("guided-highlight-broken"), script: "Now you catch one. A reader swapped one word in this line, and the sense broke. Read the line on your screen slowly, and picture it in your head. Tap the word that cannot be right." },
      interaction: { type: "highlight", text: "We ate soup with a moon.", targets: ["moon"], coachWrong: "Picture the line happening. Which word makes a picture that could never happen at the table?" },
    },
    {
      id: "apply-speak-fox",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the line out loud. Keep your purpose in your head.",
      narration: { audio: A("apply-speak-fox"), script: "Here is a tiny read with a purpose. Find out where the fox hid. Keep that question in your brain, and read the line on your screen out loud." },
      interaction: { type: "speak", text: "A fox hid in my yard." },
    },
    {
      id: "apply-speak-answer",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where did the fox hide? Say your answer.",
      narration: { audio: A("apply-speak-answer"), script: "You read with your brain on. Now prove it. Where did the fox hide? Say your answer out loud." },
      interaction: { type: "speak", text: "yard grass outside" },
    },
    {
      id: "challenge-choose-leo",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap what Leo should read.",
      narration: { audio: A("challenge-choose-leo"), script: "Leo wants to learn how to fold a paper boat. He finds four things to read. Only one fits his purpose. Tap the one Leo should read." },
      interaction: { type: "choose", options: [{ id: "steps", label: "a page of folding steps" }, { id: "tale", label: "a tale about a sea dog" }, { id: "poem", label: "a poem about big waves" }, { id: "list", label: "a list of boat names" }], correctId: "steps", coachWrong: "Leo's purpose is to learn how. Which read would teach his hands what to do?" },
    },
    {
      id: "challenge-speak-fix",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Fix the line. Read the real one out loud.",
      narration: { audio: A("challenge-speak-fix"), script: "One reader swapped a word here, and the sense broke. She read it like this. The cat naps on my bud. A bud is a tiny baby flower. That cannot be right. The real line is on your screen. Read it out loud, and put the sense back." },
      interaction: { type: "speak", text: "The cat naps on my bed." },
    },
    {
      id: "challenge-choose-habit",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the habit of a brain-on reader.",
      narration: { audio: A("challenge-choose-habit"), script: "Last one. Four readers, four habits. Only one reads with the brain turned on, not just the voice. Tap that reader's habit." },
      interaction: { type: "choose", options: [{ id: "sense", label: "asks, did that make sense" }, { id: "fast", label: "reads as fast as he can" }, { id: "loud", label: "says every word louder" }, { id: "never", label: "never looks back at a line" }], correctId: "sense", coachWrong: "Think about the jobs your brain did today. Which habit is one of those jobs?" },
    },
    {
      id: "celebrate-brain-on",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read with your brain on!",
      fx: { text: "You read with your **brain on**!", effect: "fireworks" },
      narration: { audio: A("celebrate-brain-on"), script: "Beautiful brain work today. You picked a purpose before you read. You found out, you enjoyed, you learned how. While you read, your brain kept asking, did that make sense? And when a line broke, you went back and reread it. That is reading with your brain turned on. Every read this week gets a why." },
    },
  ],
};
