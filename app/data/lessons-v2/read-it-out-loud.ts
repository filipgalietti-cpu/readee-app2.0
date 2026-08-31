import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./read-it-out-loud-timings.json";

// Read It Out Loud (RF.2.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=read-it-out-loud
//
// PERFORMANCE lesson (sibling read-like-you-talk RF.2.4 taught the concepts):
// the child reads ALOUD five times on escalating material, ending with the full
// anchor story. Anchor = "Nell at the talent show" (original; dog-lost-in-park
// and Rosa/Rex/Meg burned across the catalog, swept). The two rate-model
// narrations (model-three-speeds, guided-choose-speed) are CONCAT clips: their
// too-fast / too-slow segments are one-off synthesized + ffmpeg atempo'd, then
// spliced. Editing those scripts means rebuilding the concat clips, not just
// re-running lesson-tts.

const A = (id: string) => `/audio/lessons-v2/read-it-out-loud/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/read-it-out-loud/${w.toLowerCase()}.png`;

export const readItOutLoudImages: Record<string, string> = {
  "nell-drum": "A young girl with curly brown hair smiling and playing a small red drum on a wooden stage, warm yellow spotlight shining down, dark blue curtain behind her, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  // Quiz easier-band picture support:
  "cat-bed": "An orange cat curled up asleep on a small round blue pet bed on a wooden floor, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "party-cake": "A round birthday cake with pink frosting and five lit candles on a table, colorful streamers hanging above, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "fish-tank": "A round orange goldfish swimming in a clear glass tank with green water plants and small pebbles, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
};

export const readItOutLoud: LessonDef = {
  id: "read-it-out-loud",
  title: "Read It Out Loud",
  grade: "2nd Grade",
  standard: "RF.2.4b",
  archetype: "fluency",
  objective: "I can read out loud with every word right, a just-right speed, and a voice that shows the feeling.",
  concepts: [
    "accuracy means every word comes out right",
    "a just-right speed is not too fast and not too slow, it sounds like talking",
    "expression means your voice shows the feeling of the words",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You did the three jobs of an out-loud reader. You said every word right. You found the just-right speed, not too fast, not too slow. And you made your voice match the feeling, calm lines, climbing questions, and big glad news. Every time you read out loud this week, give your voice all three jobs.",
    title: "Out-Loud Star!",
    body: "Every word right. Just-right speed. A voice full of feeling.",
  },
  scenes: [
    {
      id: "hook-talent-show",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the story with me. Listen to how my reading sounds.",
      narration: { audio: A("hook-talent-show"), script: "Here is a story about the school talent show. Read along with me, and listen to how my reading sounds. Every word comes out right. My speed is not too fast and not too slow. And my voice shows the feeling. Watch the words, and listen." },
      interaction: { type: "read-along", text: "Tonight is the talent show at school. Nell waits backstage with her drum. Her hands shake a little bit. Can she play in front of the crowd? The bright lights come up, and Nell starts to play. Boom, tap, boom! The crowd claps and cheers for Nell!", audio: A("hook-talent-show-sentence") },
    },
    {
      id: "model-three-jobs",
      purpose: "model",
      gate: "none",
      prompt: "An out-loud reader has three jobs.",
      fx: { text: "**1** every word right   **2** just-right speed   **3** show the feeling", effect: "pop-words" },
      narration: { audio: A("model-three-jobs"), script: "When you read out loud, your voice has three jobs. Job one, say every word right. Job two, use a just-right speed, not too fast, not too slow. Job three, make it sound like the feeling. Listen to me do all three jobs on a line from our story. Nell waits backstage with her drum. Every word right, a speed like talking, and a calm, steady sound. Today you do the reading, and at the end, you read the whole story out loud." },
    },
    {
      id: "guided-speak-calm",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the line out loud, calm and clear.",
      narration: { audio: A("guided-speak-calm"), script: "Time for your first read. Listen to me read a calm line first. The show starts at six tonight. Every word right, a speed like talking, calm and easy. Now it is your turn on a new line. Read the line on your screen out loud, calm and clear." },
      interaction: { type: "speak", text: "My seat is in the front row." },
    },
    {
      id: "model-three-speeds",
      purpose: "model",
      gate: "none",
      prompt: "Not too fast. Not too slow. Just right.",
      fx: { text: "not too **fast**, not too **slow**, just **right**", effect: "wave" },
      narration: { audio: A("model-three-speeds"), script: "Job two is speed. Listen to me read a line from our story three ways. First, too fast. The bright lights come up, and Nell starts to play. When I race, the words smash into a blur. Now too slow. The. Bright. Lights. Come. Up. And. Nell. Starts. To. Play. When I crawl, the story falls apart. Now just right. The bright lights come up, and Nell starts to play. Not too fast, not too slow. A just-right speed sounds like talking." },
    },
    {
      id: "guided-choose-speed",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which reading used a just-right speed?",
      fx: { text: "A green frog naps on a wet log.", effect: "highlight" },
      narration: { audio: A("guided-choose-speed"), script: "Here is a new line, read three ways. Reading one. A. Green. Frog. Naps. On. A. Wet. Log. Reading two. A green frog naps on a wet log. Reading three. A green frog naps on a wet log. One of those readings used a just-right speed. Tap it." },
      interaction: { type: "choose", options: [{ id: "reading-one", label: "reading one" }, { id: "reading-two", label: "reading two" }, { id: "reading-three", label: "reading three" }], correctId: "reading-three", coachWrong: "One reading crawled, one raced, and one sounded like talking. Tap the one that sounded like talking." },
    },
    {
      id: "apply-speak-question",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the question. Let your voice climb.",
      narration: { audio: A("apply-speak-question"), script: "Job three is feeling, and questions have a feeling all their own. Listen to a question from our story. Can she play in front of the crowd? My voice climbed up at the end, like the words were reaching. The line on your screen asks a question too. Read it out loud, and let your voice climb at the end." },
      interaction: { type: "speak", text: "Is it my turn yet?" },
    },
    {
      id: "apply-choose-feeling",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which voice fits this line?",
      fx: { text: "I miss my old friend.", effect: "slide-in" },
      narration: { audio: A("apply-choose-feeling"), script: "Expression means your voice shows the feeling of the words. Read the line on your screen in your head. Think about how it feels. Then tap the voice that fits it." },
      interaction: { type: "choose", options: [{ id: "quiet-sad", label: "quiet and sad" }, { id: "big-cheery", label: "big and cheery" }, { id: "flat-robot", label: "flat like a robot" }, { id: "fast-race", label: "fast like a race" }], correctId: "quiet-sad", coachWrong: "The words tell you the feeling. Read the line once more, then tap the voice that matches that feeling." },
    },
    {
      id: "apply-speak-excited",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the big news, strong and glad.",
      narration: { audio: A("apply-speak-excited"), script: "Some lines are big news, and big news needs a big voice. Listen to the last line of our story. The crowd claps and cheers for Nell! Strong and glad. The line on your screen is big news too. Read it out loud, strong and glad." },
      interaction: { type: "speak", text: "That was the best show ever!" },
    },
    {
      id: "challenge-speak-passage",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read all three sentences with your whole voice.",
      narration: { audio: A("challenge-speak-passage"), script: "Now you read a tiny story all by yourself. Three sentences, three feelings. Listen to how I read a different tiny story first. The cake is done. Can we try it? It smells so sweet! Calm, then a climb, then big news. Your tiny story is on your screen. Read all three sentences out loud, and let each one show its feeling." },
      interaction: { type: "speak", text: "The bus is late. Where can it be? Here it comes now!" },
    },
    {
      id: "challenge-speak-story",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the whole story out loud.",
      narration: { audio: A("challenge-speak-story"), script: "Here is your big finish. The whole talent show story is on your screen, and this time the reading voice is yours. Remember the three jobs. Every word right, a just-right speed, and a voice full of feeling. Take a breath, and read the whole story out loud." },
      interaction: { type: "speak", text: "Tonight is the talent show at school. Nell waits backstage with her drum. Her hands shake a little bit. Can she play in front of the crowd? The bright lights come up, and Nell starts to play. Boom, tap, boom! The crowd claps and cheers for Nell!" },
    },
    {
      id: "celebrate-out-loud-star",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read the whole story out loud!",
      image: IMG("nell-drum"),
      fx: { text: "You read it **out loud** like a star!", effect: "fireworks" },
      narration: { audio: A("celebrate-out-loud-star"), script: "What a big finish. You read the whole story out loud all by yourself. You said every word right. You kept a just-right speed, not too fast, not too slow. And your voice showed the feeling in every line, calm, asking, and cheering. That is what strong readers do. Read out loud every day, and your voice will bring every story alive." },
    },
  ],
};
