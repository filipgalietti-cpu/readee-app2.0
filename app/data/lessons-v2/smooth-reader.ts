import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./smooth-reader-timings.json";

// Smooth Reader (RF.1.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=smooth-reader

const A = (id: string) => `/audio/lessons-v2/smooth-reader/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/smooth-reader/${w.toLowerCase()}.png`;

export const smoothReaderImages: Record<string, string | { subject: string; ref?: string }> = {
  "jade-hill": "A smiling cartoon girl with dark curly hair in a yellow shirt holding a big red diamond kite on top of a sunny green hill, no text anywhere",
  "kite-high": { subject: "The big red diamond kite with blue tail ribbons soaring very high in a wide bright blue sky with small white clouds, seen from far below, the green hill top only a thin strip at the very bottom, no people anywhere", ref: "jade-hill" },
  "jade-joy": { subject: "The smiling cartoon girl with dark curly hair in a yellow shirt and blue overalls seen from behind at the bottom of the picture, cheering with one arm up while she holds a long thin string that stretches way up to the big red diamond kite soaring tiny and high in the huge blue sky", ref: "jade-hill" }
};

export const smoothReader: LessonDef = {
  id: "smooth-reader",
  title: "Smooth Reader",
  grade: "1st Grade",
  standard: "RF.1.4b",
  archetype: "fluency",
  objective: "I can read a story out loud with a good pace and expression.",
  concepts: ["fluency","pace","expression","accuracy"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, smooth reader! You read a whole story out loud with a good pace and real expression. Your voice went up for the question and got big for the exclamation. Keep reading out loud every day!",
    "title": "You Are a Smooth Reader!",
    "body": "You read a whole story aloud with accuracy, a good pace, and expression."
  },
  scenes: [
    {
      id: "hook-meet-jade",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Jade and her kite.",
      image: IMG("jade-hill"),
      narration: { audio: A("hook-meet-jade"), script: "Hello, reader! Today you get to read a whole story out loud. It is about a girl named Jade and her big red kite. Smooth readers read every word right, keep a good pace, and make their voice sound like talking. First, let's hear what that means." },
    },
    {
      id: "model-choppy-read",
      purpose: "model",
      gate: "none",
      prompt: "Listen to a choppy reader.",
      fx: {"text":"Choppy reading goes **word by word**.","effect":"shake"},
      narration: { audio: A("model-choppy-read"), script: "First, listen to a choppy reader read page one of Jade's story. Jade. Has. A. Big. Red. Kite. She. Takes. It. To. The. Top. Of. A. Sunny. Hill. That reader said every word right, but word by word by word. It did not sound like talking. It sounded like a robot." },
    },
    {
      id: "model-smooth-read",
      purpose: "model",
      gate: "none",
      prompt: "Now listen to a smooth reader.",
      fx: {"text":"**Smooth** reading sounds like talking.","effect":"glow"},
      narration: { audio: A("model-smooth-read"), script: "Now listen to a smooth reader read the very same page. Jade has a big red kite. She takes it to the top of a sunny hill. Hear the difference? A smooth reader keeps a good pace. Not too fast, not too slow. It sounds like talking." },
    },
    {
      id: "guided-sounds-like-talking",
      purpose: "guided",
      gate: "interaction",
      prompt: "What should smooth reading sound like?",
      narration: { audio: A("guided-sounds-like-talking"), script: "You heard two readers read the same page. Now you tell me. What should smooth reading sound like? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "like-talking", label: "Like talking" }, { id: "word-by-word", label: "Word by word" }, { id: "fast-as-you-can", label: "As fast as you can" }], correctId: "like-talking", coachWrong: "Think back to the two readers. Which way of reading was easy to listen to? How did that reader sound?" },
    },
    {
      id: "guided-read-page-one",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("guided-read-page-one"), script: "Your turn to try it. Read page one out loud with me. Keep your voice smooth, and match my pace." },
      interaction: { type: "read-along", text: "Jade has a big red kite. She takes it to the top of a sunny hill.", audio: A("guided-read-page-one-sentence") },
    },
    {
      id: "model-voice-marks",
      purpose: "model",
      gate: "none",
      prompt: "Little marks tell your voice what to do.",
      fx: {"text":"**?** goes up. **!** gets big.","effect":"bounce"},
      narration: { audio: A("model-voice-marks"), script: "Smooth readers use expression too. Little marks at the end of a line tell your voice what to do. A question mark makes your voice go up at the end. Listen. Can you jump? An exclamation point makes your voice get big. Listen. You can jump so high! That is expression." },
    },
    {
      id: "guided-marks-sort",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Where does each line go?",
      narration: { audio: A("guided-marks-sort"), script: "Read each line and look at the mark at the end. If the mark makes your voice go up, drag the line to voice up. If the mark makes your voice get big, drag it to big voice." },
      interaction: { type: "sort", buckets: ["Voice up","Big voice"], items: [{ label: "Can we go?", bucket: "Voice up" }, { label: "We did it!", bucket: "Big voice" }, { label: "Is it wet?", bucket: "Voice up" }, { label: "What a day!", bucket: "Big voice" }], coachWrong: "Look at the very last mark on the line. Is it a curly question mark, or a tall exclamation point?" },
    },
    {
      id: "apply-speak-question",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two: Will the kite fly?",
      image: IMG("jade-hill"),
      narration: { audio: A("apply-speak-question"), script: "Time to turn the page. Page two starts with a question, so make your voice go up at the end. Read page two out loud." },
      interaction: { type: "speak", text: "Will the kite fly" },
    },
    {
      id: "apply-speak-wind",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the next line: A strong wind lifts it high in the sky.",
      image: IMG("kite-high"),
      narration: { audio: A("apply-speak-wind"), script: "Keep going! This next line is a telling line. No special marks, just talking. Read it out loud, smooth and steady." },
      interaction: { type: "speak", text: "A strong wind lifts it high in the sky" },
    },
    {
      id: "apply-speak-dips",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three: The kite dips and dives like a bird.",
      image: IMG("kite-high"),
      narration: { audio: A("apply-speak-dips"), script: "Here comes the last page of the story. Read the first line out loud at a good pace, not too fast and not too slow." },
      interaction: { type: "speak", text: "The kite dips and dives like a bird" },
    },
    {
      id: "challenge-speak-exclaim",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the last line: What a fine day to fly a kite!",
      image: IMG("jade-joy"),
      narration: { audio: A("challenge-speak-exclaim"), script: "Here is the very last line of the story, and it ends with an exclamation point. Make your voice get big. Read it out loud!" },
      interaction: { type: "speak", text: "What a fine day to fly a kite" },
    },
    {
      id: "challenge-what-lifted",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What lifted the kite high in the sky?",
      narration: { audio: A("challenge-what-lifted"), script: "You read the whole story out loud! Smooth readers understand what they read, too. Think back to page two. What lifted the kite high in the sky? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "strong-wind", label: "A strong wind" }, { id: "big-bird", label: "A big bird" }, { id: "fast-truck", label: "A fast truck" }], correctId: "strong-wind", coachWrong: "Think back to page two of the story. Read each choice again. Which one really happened on that page?" },
    },
    {
      id: "challenge-how-jade-felt",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How did Jade feel at the end?",
      narration: { audio: A("challenge-how-jade-felt"), script: "One more. Think about the end of the story, and the way you read that last big line. How did Jade feel about her kite day? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "happy", label: "happy" }, { id: "sad", label: "sad" }, { id: "scared", label: "scared" }], correctId: "happy", coachWrong: "Think about the last page of the story. What did Jade say about her kite day? Match her words to a feeling." },
    },
    {
      id: "celebrate-smooth-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a smooth reader!",
      fx: {"text":"You are a **smooth reader**!","effect":"fireworks"},
      narration: { audio: A("celebrate-smooth-reader"), script: "What smooth reading! You read Jade's whole story out loud. Your voice went up for the question, got big for the exclamation, and sounded just like talking. Read out loud every day and your reading will get smoother and smoother!" },
    },
  ],
};
