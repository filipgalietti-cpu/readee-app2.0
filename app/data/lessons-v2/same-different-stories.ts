import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./same-different-stories-timings.json";

// Same & Different Stories (RL.1.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=same-different-stories

const A = (id: string) => `/audio/lessons-v2/same-different-stories/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/same-different-stories/${w.toLowerCase()}.png`;

export const sameDifferentStoriesImages: Record<string, string> = {
  "leo-zara-meet": "Two cartoon friends standing side by side and smiling: a boy with short red hair, light skin, and a green t-shirt, and a girl with curly black hair, brown skin, and a yellow dress.",
  "leo-hides-tooth": "A worried cartoon boy with short red hair, light skin, and a green t-shirt, with wide nervous eyes, slipping a tiny white tooth into his pants pocket.",
  "zara-shows-tooth": "An excited cartoon girl with curly black hair, brown skin, and a yellow dress, grinning with joy and holding up a tiny white tooth to show two smiling children."
};

export const sameDifferentStories: LessonDef = {
  id: "same-different-stories",
  title: "Same & Different Stories",
  grade: "1st Grade",
  standard: "RL.1.9",
  archetype: "story-elements",
  objective: "I can compare and contrast what happens to two characters and how each one feels and acts.",
  concepts: ["compare and contrast","character experiences","character responses"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You compared two stories today. You found what happened to both friends, what happened to only one, and how each friend felt and acted differently. That is what strong readers do. Nice work!",
    "title": "Same & Different!",
    "body": "You compared what happened to both friends, what only one friend did, and how each friend felt."
  },
  scenes: [
    {
      id: "hook-two-stories",
      purpose: "hook",
      gate: "none",
      prompt: "Two friends, two stories",
      image: IMG("leo-zara-meet"),
      narration: { audio: A("hook-two-stories"), script: "Today we will read two small stories. This is Leo, and this is Zara. The same thing happens to both friends. But they do not feel the same way about it. Let's read and compare." },
    },
    {
      id: "read-leo-page",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read Leo's page",
      image: IMG("leo-hides-tooth"),
      narration: { audio: A("read-leo-page"), script: "Here is Leo's page. Something is happening to his tooth. Read the page to find out what Leo does." },
      interaction: { type: "read-along", text: "Leo has a loose tooth. He wiggles it with his finger. Pop! The tooth comes out. Leo feels scared. He hides the tooth in his pocket.", audio: A("read-leo-page-sentence") },
    },
    {
      id: "read-zara-page",
      purpose: "hook",
      gate: "interaction",
      prompt: "Read Zara's page",
      image: IMG("zara-shows-tooth"),
      narration: { audio: A("read-zara-page"), script: "Now here is Zara's page. The same thing happens to her tooth. Read the page to find out what Zara does." },
      interaction: { type: "read-along", text: "Zara has a loose tooth too. She wiggles it all day. Pop! The tooth comes out. Zara feels excited. She shows her tooth to her friends.", audio: A("read-zara-page-sentence") },
    },
    {
      id: "teach-same-different",
      purpose: "model",
      gate: "none",
      prompt: "Same thing, different feelings",
      fx: {"text":"Same thing, **different** feelings","effect":"underline"},
      narration: { audio: A("teach-same-different"), script: "Let's compare the two pages. Both friends had a loose tooth. Both friends wiggled it, and pop, both teeth came out. That part was the same. But their feelings were different. Leo felt scared, so he hid his tooth in his pocket. Zara felt excited, so she showed her tooth to her friends. The same thing can happen to two friends, and each friend can feel and act in a different way." },
    },
    {
      id: "choose-both-did",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did **both** friends do?",
      narration: { audio: A("choose-both-did"), script: "Your turn to compare. Think about both pages. What did Leo and Zara both do? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "wiggled-loose-tooth", label: "wiggled a loose tooth" }, { id: "hid-tooth-pocket", label: "hid a tooth in a pocket" }, { id: "showed-tooth-friends", label: "showed a tooth to friends" }], correctId: "wiggled-loose-tooth", coachWrong: "Check both pages. Only one friend did that. Find the thing that Leo did and Zara did too." },
    },
    {
      id: "choose-only-leo",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did **only** Leo do?",
      narration: { audio: A("choose-only-leo"), script: "Some things happened to just one friend. What did only Leo do, not Zara? Tap it." },
      interaction: { type: "choose", options: [{ id: "hid-his-tooth", label: "hid his tooth" }, { id: "wiggled-his-tooth", label: "wiggled his tooth" }, { id: "lost-his-tooth", label: "lost his tooth" }], correctId: "hid-his-tooth", coachWrong: "Both friends did that one. Look at the end of Leo's page. Find the thing that just Leo did." },
    },
    {
      id: "sort-both-only",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Both, Only Leo, or Only Zara?",
      narration: { audio: A("sort-both-only"), script: "Now sort. Drag each card to the right box. Did it happen to both friends, only to Leo, or only to Zara?" },
      interaction: { type: "sort", buckets: ["Both","Only Leo","Only Zara"], items: [{ label: "a loose tooth", bucket: "Both" }, { label: "the tooth pops out", bucket: "Both" }, { label: "hides the tooth", bucket: "Only Leo" }, { label: "feels scared", bucket: "Only Leo" }, { label: "shows the tooth", bucket: "Only Zara" }, { label: "feels excited", bucket: "Only Zara" }], coachWrong: "Look at that card again. Did it happen on both pages, or on just one friend's page?" },
    },
    {
      id: "speak-read-zara-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud: She shows her tooth to her friends",
      image: IMG("zara-shows-tooth"),
      narration: { audio: A("speak-read-zara-line"), script: "Here is one line from Zara's page. Tap the microphone and read the line out loud, nice and clear." },
      interaction: { type: "speak", text: "She shows her tooth to her friends" },
    },
    {
      id: "choose-compare-feelings",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did each friend **feel**?",
      narration: { audio: A("choose-compare-feelings"), script: "Think about the pop, when each tooth came out. How did each friend feel? Tap the answer that tells about both friends." },
      interaction: { type: "choose", options: [{ id: "leo-scared-zara-excited", label: "leo scared, zara excited" }, { id: "leo-excited-zara-scared", label: "leo excited, zara scared" }, { id: "both-felt-scared", label: "both friends felt scared" }], correctId: "leo-scared-zara-excited", coachWrong: "Look back at each page. How did Leo feel? How did Zara feel? Pick the one that matches both pages." },
    },
    {
      id: "choose-compare-actions",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did they **act** differently?",
      narration: { audio: A("choose-compare-actions"), script: "After the pop, each friend did something different with the tooth. What did each friend do? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "leo-hid-zara-showed", label: "leo hid it, zara showed it" }, { id: "zara-hid-leo-showed", label: "zara hid it, leo showed it" }, { id: "both-hid", label: "both hid their teeth" }, { id: "both-showed", label: "both showed their teeth" }], correctId: "leo-hid-zara-showed", coachWrong: "Check the end of each page. What did Leo do with his tooth? What did Zara do with hers?" },
    },
    {
      id: "speak-compare-production",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tell me how they were different",
      narration: { audio: A("speak-compare-production"), script: "Now you say it. When the tooth came out, Leo did one thing, and Zara did another. Tap the microphone and tell me what each friend did, or how each friend felt." },
      interaction: { type: "speak", text: "hid hides pocket showed shows scared excited" },
    },
    {
      id: "challenge-kim-ty",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How did Kim and Ty act differently?",
      narration: { audio: A("challenge-kim-ty"), script: "Here is one last story, and it is only for your ears, so listen closely. Boom! Kim and Ty both heard loud thunder. Kim ran inside to her mom. Ty stayed by the window and watched the sky flash. Now tap the answer that tells how Kim and Ty acted differently." },
      interaction: { type: "choose", options: [{ id: "kim-ran-ty-watched", label: "kim ran in, ty watched" }, { id: "ty-ran-kim-watched", label: "ty ran in, kim watched" }, { id: "both-ran-moms", label: "both ran to their moms" }, { id: "both-watched-sky", label: "both watched the sky" }], correctId: "kim-ran-ty-watched", coachWrong: "Listen again. Boom, the thunder came. What did Kim do next? What did Ty do next?" },
    },
    {
      id: "celebrate-compare",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You can compare stories!",
      fx: {"text":"You can compare stories!","effect":"fireworks"},
      narration: { audio: A("celebrate-compare"), script: "You did it! You read two stories and compared them. The same thing happened to Leo and to Zara, but each friend felt and acted a different way. Great work, reader!" },
    },
  ],
};
