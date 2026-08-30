import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./read-like-you-talk-timings.json";

// Read Like You Talk (RF.2.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=read-like-you-talk

const A = (id: string) => `/audio/lessons-v2/read-like-you-talk/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/read-like-you-talk/${w.toLowerCase()}.png`;

export const readLikeYouTalkImages: Record<string, string> = {
  "lost-shoe": "One bright red sneaker lying on its side on a school running track, sunny field day, grass in the background, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  // Quiz easier-band picture support:
  "red-light": "A tall traffic light on a street corner showing a bright glowing red light, blue sky, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "jam-toast": "A slice of golden toast spread with shiny red jam on a plate, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "wet-pup": "A happy soggy puppy shaking off water drops in a backyard, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "warm-home": "A cozy little house with a glowing window at sunset, path leading to the front door, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
};

export const readLikeYouTalk: LessonDef = {
  id: "read-like-you-talk",
  title: "Read Like You Talk",
  grade: "2nd Grade",
  standard: "RF.2.4",
  archetype: "fluency",
  objective: "I can read smoothly, fix my mistakes, and let the end marks tell my voice what to do.",
  concepts: [
    "smooth reading sounds like talking, not one word at a time",
    "good readers go back and fix a word that comes out wrong",
    "end marks steer the voice: period stops, question mark climbs, exclamation point is strong, comma is a tiny pause",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You read like you talk now. Smooth, not choppy. You stop at periods, climb for question marks, get strong for exclamation points, and take a tiny pause at commas. And when a word comes out wrong, you go back and fix it. Every book you open this week is a new road. Drive it smooth.",
    title: "Smooth Reader!",
    body: "Smooth, not robot. Stop at periods, climb for questions, say it strong, pause at commas.",
  },
  scenes: [
    {
      id: "hook-race-day",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the story with me. Listen to what my voice does.",
      narration: { audio: A("hook-race-day"), script: "Here is a story about field day. Read along with me, and listen to what my voice does. Sometimes it stops. Sometimes it climbs up high. Sometimes it gets strong. Watch the marks in the story, and listen." },
      interaction: { type: "read-along", text: "Today is field day at our school. Can our class win the big race? Dan lines up next to me. Ready, set, go! We dash past the swings, the slide, and the shed. My shoe comes off, but I do not stop. Dan cheers, and I zoom to the line. We win the race!", audio: A("hook-race-day-sentence") },
    },
    {
      id: "model-robot-smooth",
      purpose: "model",
      gate: "none",
      prompt: "Smooth reading sounds like talking.",
      fx: { text: "Read like you **talk**.", effect: "underline" },
      narration: { audio: A("model-robot-smooth"), script: "Listen to two ways to read the last line of our story. Here is the first way. We. Win. The. Race. That sounded like a robot. Every word stood all alone. Now the second way. We win the race! That sounded like talking. The words moved together, smooth and easy. Good readers read like they talk." },
    },
    {
      id: "guided-choose-talking",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which reading sounds like talking?",
      narration: { audio: A("guided-choose-talking"), script: "Here is another line from the story. I will read it two ways. Reading one. Dan lines up next to me. Reading two. Dan. Lines. Up. Next. To. Me. Which reading sounded like real talking? Tap it." },
      interaction: { type: "choose", options: [{ id: "reading-one", label: "reading one" }, { id: "reading-two", label: "reading two" }], correctId: "reading-one", coachWrong: "Say the line in your head, like you are telling a friend. Did the words stand all alone, or move together? Tap the reading that moved like talking." },
    },
    {
      id: "guided-choose-fix",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does a good reader do next?",
      image: IMG("lost-shoe"),
      narration: { audio: A("guided-choose-fix"), script: "Smooth is not the only job. Good readers are careful with every word. Listen. A reader read this line from our story. My shoe comes off. But she said, my show comes off. Show is not shoe, and the line stopped making sense. What does a good reader do next? Tap it." },
      interaction: { type: "choose", options: [{ id: "fix", label: "go back and fix it" }, { id: "fast", label: "keep reading fast" }, { id: "skip", label: "skip the next line" }, { id: "louder", label: "read it even louder" }], correctId: "fix", coachWrong: "The story has to make sense. Which choice makes the line make sense again?" },
    },
    {
      id: "model-road-signs",
      purpose: "model",
      gate: "none",
      prompt: "End marks are road signs for your voice.",
      fx: { text: "**.** stop   **?** climb   **!** strong   **,** pause", effect: "pop-words" },
      narration: { audio: A("model-road-signs"), script: "The marks in a story are road signs for your voice. A period means stop. Rest for a beat, then start the next sentence. A question mark means your voice climbs up at the end. Can our class win the big race? Hear the climb? An exclamation point means say it strong. Ready, set, go! And a comma means a tiny pause. We dash past the swings, the slide, and the shed. Tiny pauses, and keep going." },
    },
    {
      id: "guided-choose-climb",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which road sign made my voice climb?",
      fx: { text: "Can our class win the big race**?**", effect: "highlight" },
      narration: { audio: A("guided-choose-climb"), script: "Listen to this line from our story one more time. Can our class win the big race? My voice climbed up at the end, like the words were reaching. Now look at the mark at the very end of the line. Tap the name of that road sign." },
      interaction: { type: "choose", options: [{ id: "question-mark", label: "question mark" }, { id: "period", label: "period" }, { id: "comma", label: "comma" }, { id: "exclamation-point", label: "exclamation point" }], correctId: "question-mark", coachWrong: "Look at the very last mark in the line on screen. Find that mark's name on the tiles." },
    },
    {
      id: "apply-choose-strong",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which way do you read this line?",
      fx: { text: "Ready, set, go**!**", effect: "burst" },
      narration: { audio: A("apply-choose-strong"), script: "Here is the starting call from the race. Look at the road sign at the very end of the line. That sign tells your voice how to read the whole line. Tap the way to read it." },
      interaction: { type: "choose", options: [{ id: "strong", label: "strong and excited" }, { id: "sleepy", label: "flat and sleepy" }, { id: "question", label: "like a question" }, { id: "robot", label: "one word at a time" }], correctId: "strong", coachWrong: "Check the mark at the end of the line. What does that road sign tell your voice to do?" },
    },
    {
      id: "apply-sort-ask-shout",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Ask it, or shout it? Let the end mark decide.",
      narration: { audio: A("apply-sort-ask-shout"), script: "Read each sentence card, and check the road sign at the end. If the mark tells your voice to climb up and ask, drag the card to Ask It. If the mark tells your voice to say it strong, drag it to Shout It." },
      interaction: { type: "sort", buckets: ["Ask It", "Shout It"], items: [{ label: "Where did Sam go?", bucket: "Ask It" }, { label: "We won the game!", bucket: "Shout It" }, { label: "May I pet your cat?", bucket: "Ask It" }, { label: "Watch out for the bee!", bucket: "Shout It" }, { label: "Is it time for bed?", bucket: "Ask It" }, { label: "That jet is so loud!", bucket: "Shout It" }], coachWrong: "Look at the very last mark on the card before you drag. Let that sign pick the bucket." },
    },
    {
      id: "apply-speak-ask",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it out loud like a real question.",
      narration: { audio: A("apply-speak-ask"), script: "Your turn to drive. The runner in our story lost a shoe in the race. Ask the question on your screen out loud, and let your voice climb up at the end, like you really want to know." },
      interaction: { type: "speak", text: "Where is my shoe?" },
    },
    {
      id: "apply-speak-shout",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it strong, like a cheer.",
      narration: { audio: A("apply-speak-shout"), script: "Now check the road sign at the end of this line. It tells you to say it strong. Read it out loud like a cheer for your teammate." },
      interaction: { type: "speak", text: "Dan is on my team!" },
    },
    {
      id: "challenge-speak-passage",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read both sentences, smooth and clear.",
      narration: { audio: A("challenge-speak-passage"), script: "Here is your big read. Two sentences this time. Read them out loud, smooth like talking. Stop your voice at the period, and finish strong." },
      interaction: { type: "speak", text: "We got my dog. He ran fast!" },
    },
    {
      id: "challenge-choose-cheer",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the line you read like a cheer.",
      narration: { audio: A("challenge-choose-cheer"), script: "Last challenge. All four lines use the same words. Only the road signs changed. Read each line in your head, and let the end mark tell your voice what to do. Tap the line you would read strong, like a cheer." },
      interaction: { type: "choose", options: [{ id: "cheer", label: "We did it!" }, { id: "ask", label: "Did we do it?" }, { id: "tell", label: "We did it." }, { id: "robot", label: "we. did. it." }], correctId: "cheer", coachWrong: "A cheer is strong and glad. Check the end mark on each line. Which sign says it strong?" },
    },
    {
      id: "celebrate-smooth-reader",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read like you talk!",
      fx: { text: "You read like you **talk**!", effect: "fireworks" },
      narration: { audio: A("celebrate-smooth-reader"), script: "Great driving today. You read smooth, like talking, not like a robot. You stopped at periods, climbed for question marks, got strong for exclamation points, and took tiny pauses at commas. And when a word came out wrong, you went back and fixed it. That is fluent reading. Read like you talk, and every story comes alive." },
    },
  ],
};
