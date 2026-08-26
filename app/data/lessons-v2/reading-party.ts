import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./reading-party-timings.json";

// Reading Party (RL.K.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=reading-party

const A = (id: string) => `/audio/lessons-v2/reading-party/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/reading-party/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/reading-party/${w.toLowerCase()}.png`;

export const readingPartyImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A friendly orange fox kit and a small blue bird standing side by side on green grass, both smiling, framed like the cover of a storybook.",
  "nest": "A bird nest made of brown twigs sitting on a leafy tree branch.",
  "pond": "A small round blue pond with a green lily pad floating on it.",
  "page-1": { subject: "The orange fox kit looking down at a small white paper note lying on the green grass.", ref: "cover" },
  "page-2": { subject: "The orange fox kit holding the small white note open in its paws, reading it with wide happy eyes.", ref: "page-1" },
  "page-3": { subject: "The orange fox kit running fast toward a big green tree with a bird nest on a branch, the small blue bird peeking out of the nest.", ref: "page-2" },
  "tag": { subject: "The orange fox kit chasing the small blue bird across the green grass, both smiling, motion lines behind them.", ref: "page-3" },
  "page-5": { subject: "The orange fox kit and the small blue bird sitting close together on the grass, smiling, colorful balloons floating around them.", ref: "tag" },
  "fox": { subject: "The orange fox kit sitting on the grass, smiling, facing forward.", ref: "cover" },
  "bird": { subject: "The small blue bird standing on the grass with wings spread wide, smiling. No frame or border, plain background.", ref: "cover" },
  "play": { subject: "The orange fox kit and the small blue bird happily playing together with a red ball.", ref: "cover" },
  "sleep": { subject: "The orange fox kit curled up on the grass, fast asleep, eyes closed. No letters, no Z symbols, no frame or border, plain background.", ref: "cover" }
};

export const readingParty: LessonDef = {
  id: "reading-party",
  title: "Reading Party",
  grade: "Kindergarten",
  standard: "RL.K.10",
  archetype: "story-elements",
  objective: "I can understand a story and read some words!",
  concepts: ["predict before reading","listen and read along","answer who-what-where check-ins","use a picture clue","retell the story in order","read one decodable sentence aloud"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Wow, you did it! You listened to a story, understood all the parts, and even read some words yourself. You are a super reader and a wonderful party guest!",
    "title": "You're a Reading Star!",
    "body": "You completed the Reading Party lesson!"
  },
  scenes: [
    {
      id: "intro-party",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Let's start our party!",
      fx: {"text":"Welcome to the **Reading Party**!","effect":"balloon"},
      narration: { audio: A("intro-party"), script: "Hello, friend! Welcome to our Reading Party! Today we get to read a whole story together, from start to finish. Are you ready? Let's go!" },
    },
    {
      id: "predict-cover",
      purpose: "guided",
      gate: "interaction",
      prompt: "What might this story be about?",
      image: IMG("cover"),
      narration: { audio: A("predict-cover"), script: "Before we read, good readers make a guess about the story. This is the cover of our book. I see a fox and a bird. What do you think they might do in this story? Tap your best guess!" },
      interaction: { type: "choose", options: [{ id: "play", label: "PLAY", audio: W("play"), image: IMG("play") }, { id: "sleep", label: "SLEEP", audio: W("sleep"), image: IMG("sleep") }], correctId: "play", coachWrong: "That was a fine guess! Now look at the cover one more time. The fox and the bird look happy and ready for fun together. Tap your new best guess!" },
    },
    {
      id: "story-page-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 1. Listen and follow!",
      image: IMG("page-1"),
      narration: { audio: A("story-page-1"), script: "Great guessing! Let's read and find out. Our story is called Pip's Party. Here is page one. Watch the words light up while I read. Follow along with your eyes!" },
      interaction: { type: "read-along", text: "Pip is a fox. Pip saw a note.", audio: A("story-page-1-sentence") },
    },
    {
      id: "check-who",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is Pip?",
      narration: { audio: A("check-who"), script: "Let's check in, story friend. We just read page one. Think back. Who is Pip? Tap the picture that shows Pip." },
      interaction: { type: "choose", options: [{ id: "fox", label: "FOX", audio: W("fox"), image: IMG("fox") }, { id: "bird", label: "BIRD", audio: W("bird"), image: IMG("bird") }], correctId: "fox", coachWrong: "Think back to page one of our story. It told us just what Pip is. Look at both pictures and try again!" },
    },
    {
      id: "story-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 2. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("story-page-2"), script: "Yes! Now let's find out what the note says. Here is page two. Read along with me!" },
      interaction: { type: "read-along", text: "The note said, Come play! It was from Dot. Dot is a bird.", audio: A("story-page-2-sentence") },
    },
    {
      id: "story-page-3",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 3. Keep reading!",
      image: IMG("page-3"),
      narration: { audio: A("story-page-3"), script: "A note from Dot the bird! What will Pip do? Here is page three. Eyes on the words!" },
      interaction: { type: "read-along", text: "Pip ran to the nest in the big tree.", audio: A("story-page-3-sentence") },
    },
    {
      id: "check-where",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where did Pip run?",
      narration: { audio: A("check-where"), script: "Check-in time! Pip got the note and off he went. Where did Pip run? Tap the place from our story." },
      interaction: { type: "choose", options: [{ id: "nest", label: "NEST", audio: W("nest"), image: IMG("nest") }, { id: "pond", label: "POND", audio: W("pond"), image: IMG("pond") }], correctId: "nest", coachWrong: "Think back to page three. Pip ran to the place where Dot the bird lives. Look at both pictures and try again!" },
    },
    {
      id: "story-page-4",
      purpose: "apply",
      gate: "interaction",
      prompt: "Page 4. Almost there!",
      image: IMG("tag"),
      narration: { audio: A("story-page-4"), script: "Pip found Dot at the nest! Here is page four. Read along!" },
      interaction: { type: "read-along", text: "Dot and Pip played a game. It was so fun!", audio: A("story-page-4-sentence") },
    },
    {
      id: "picture-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "What game did they play?",
      image: IMG("tag"),
      narration: { audio: A("picture-clue"), script: "The story did not tell us the name of the game. But good readers use picture clues! Look closely at the picture. What game did Pip and Dot play? Tap the word." },
      interaction: { type: "choose", options: [{ id: "tag", label: "TAG", audio: W("tag") }, { id: "sit", label: "SIT", audio: W("sit") }], correctId: "tag", coachWrong: "Use the picture clue! Look how Pip is chasing after Dot. What game has chasing in it? Try again!" },
    },
    {
      id: "story-page-5",
      purpose: "apply",
      gate: "interaction",
      prompt: "The last page!",
      image: IMG("page-5"),
      narration: { audio: A("story-page-5"), script: "Every story has an ending. Here is our last page. Read along with me one more time!" },
      interaction: { type: "read-along", text: "What a fun day! Pip and Dot are pals.", audio: A("story-page-5-sentence") },
    },
    {
      id: "retell-story",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the story in order!",
      narration: { audio: A("retell-story"), script: "You read the whole story! Now let's retell it like a super reader. Tap what happened first, then what happened next, then how the story ended." },
      interaction: { type: "sequence", items: [{ id: "note", label: "NOTE", audio: W("note"), image: IMG("page-1") }, { id: "run", label: "RUN", audio: W("run"), image: IMG("page-3") }, { id: "play", label: "PLAY", audio: W("play"), image: IMG("tag") }], order: ["note","run","play"], coachWrong: "Think back to how our story began. Which picture shows the very first thing that happened? Try again!" },
    },
    {
      id: "read-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Pip ran to Dot.",
      image: IMG("page-3"),
      narration: { audio: A("read-sentence"), script: "Now for the super reader moment! This page is all yours. Look at the words, take a breath, then press the mic and read the sentence out loud in your best reading voice!" },
      interaction: { type: "speak", text: "Pip ran to Dot" },
    },
    {
      id: "party-time",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "Our Reading Party is a HIT!",
      fx: {"text":"Time to **celebrate**!","effect":"fireworks"},
      narration: { audio: A("party-time"), script: "You did it! You read a whole story, understood what happened, and even read a sentence on your own! You are a superstar reader! Let's celebrate your amazing reading skills!" },
    },
  ],
};
