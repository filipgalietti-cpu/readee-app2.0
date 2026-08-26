import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-reading-party-timings.json";

// Fact Reading Party (RI.K.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-reading-party

const A = (id: string) => `/audio/lessons-v2/fact-reading-party/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/fact-reading-party/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-reading-party/${w.toLowerCase()}.png`;

export const factReadingPartyImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A green frog crouched on a green lily pad in a blue pond, strong back legs bent, framed like the cover of a fact book. No letters or words anywhere.",
  "page-1": { subject: "The green frog swimming in clear blue pond water, legs stretched behind it.", ref: "cover" },
  "page-2": "A cluster of small round clear frog eggs with dark centers and one small brown tadpole with a long tail swimming beside them in clear pond water. No arrows, no letters, no labels.",
  "page-3": { subject: "The green frog with its long pink tongue stretched far out of its mouth, the tip of the tongue touching a small fly in the air, side view.", ref: "cover" },
  "page-4": { subject: "The green frog leaping high through the air with long back legs stretched out, motion lines behind it.", ref: "cover" },
  "page-5": { subject: "The green frog sitting on a lily pad at the edge of a blue pond, its skin shiny and wet with small water droplets on its back.", ref: "cover" },
  "frog": "A green frog sitting on grass, facing forward, plain background. No frame or border.",
  "pond": "A small round blue pond with a green lily pad floating on it, plain background. No frame or border.",
  "hop": "A green frog leaping high through the air with long back legs stretched out, plain pale background with nothing else in the frame. No other objects, no frame or border.",
  "sleep": "A green frog resting on a big leaf with its eyes closed, plain background. No letters, no Z symbols, no frame or border.",
  "egg": "A cluster of small round clear frog eggs with dark centers, in water, plain background. No frame or border.",
  "tadpole": "A single small brown tadpole with a round body and a long tail, swimming, plain background. No frame or border.",
  "bugs": "Three small simple black flies with translucent wings flying together, plain light background. Plain insect bodies with no cartoon faces, no noses, no frame or border.",
  "leaves": "Two simple green leaves, plain background. No frame or border."
};

export const factReadingParty: LessonDef = {
  id: "fact-reading-party",
  title: "Fact Reading Party",
  grade: "Kindergarten",
  standard: "RI.K.10",
  archetype: "fluency",
  objective: "I can read a whole fact book and understand it!",
  concepts: ["predict from the cover","read along with fact pages","find the topic and a detail","connect facts and find the author's reason","use a picture clue","read one fact sentence aloud"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole fact book today, and you understood every part of it. You found the topic, a detail, a connection, a picture clue, and the author's reason, just like a real fact reader. And that was the very last fact finder lesson. You finished the whole unit. I am so proud of you!",
    "title": "Fact Finder Forever!",
    "body": "You completed the Fact Reading Party and the whole Fact Finder unit!"
  },
  scenes: [
    {
      id: "intro-party",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Let's start our Fact Reading Party!",
      fx: {"text":"Welcome to the **Fact Reading Party**!","effect":"balloon"},
      narration: { audio: A("intro-party"), script: "Hello, fact finder! Welcome to the Fact Reading Party! Today we get to read a whole fact book together, from the cover to the very last page. Every fact in it is true. Ready? Let's go!" },
    },
    {
      id: "predict-cover",
      purpose: "guided",
      gate: "interaction",
      prompt: "What might this fact book teach us?",
      image: IMG("cover"),
      narration: { audio: A("predict-cover"), script: "Before we read, good readers look at the cover and make a guess. This is the cover of our fact book. I see a frog with big, strong back legs. What do you think this book will say frogs can do? Tap your best guess!" },
      interaction: { type: "choose", options: [{ id: "hop", label: "HOP", audio: W("hop"), image: IMG("hop") }, { id: "sleep", label: "SLEEP", audio: W("sleep"), image: IMG("sleep") }], correctId: "hop", coachWrong: "That was a fine guess! Look at the cover one more time. See those big, strong back legs, ready to push off? Tap your new best guess!" },
    },
    {
      id: "fact-page-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 1. Listen and follow!",
      image: IMG("page-1"),
      narration: { audio: A("fact-page-1"), script: "Great guessing! Let's read and find out. Our book is called All About Frogs. Here is page one. Watch the words light up while I read. Follow along with your eyes!" },
      interaction: { type: "read-along", text: "A frog is wet. It can swim in the pond.", audio: A("fact-page-1-sentence") },
    },
    {
      id: "check-topic",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is this whole book about?",
      narration: { audio: A("check-topic"), script: "Let's check in, fact finder. Think about the cover and page one. This book will tell us fact after fact, all about one thing. What is this whole book mostly about? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "frog", label: "FROG", audio: W("frog"), image: IMG("frog") }, { id: "pond", label: "POND", audio: W("pond"), image: IMG("pond") }], correctId: "frog", coachWrong: "A pond is in our book, but think about the whole book. Who is on the cover, and who will be on every page? Look at both pictures and try again!" },
    },
    {
      id: "fact-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 2. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("fact-page-2"), script: "Yes! Now let's learn how a frog begins. Here is page two. Read along with me!" },
      interaction: { type: "read-along", text: "A frog starts as an egg. The egg turns into a tadpole. The tadpole grows into a frog.", audio: A("fact-page-2-sentence") },
    },
    {
      id: "check-connection",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Show how a frog grows!",
      narration: { audio: A("check-connection"), script: "Page two connected three things that go together. Show how a frog grows! Drag the pictures in order: what a frog is first, next, and last." },
      interaction: { type: "sequence", items: [{ id: "egg", label: "EGG", audio: W("egg"), image: IMG("egg") }, { id: "tadpole", label: "TADPOLE", audio: W("tadpole"), image: IMG("tadpole") }, { id: "frog", label: "FROG", audio: W("frog"), image: IMG("frog") }], order: ["egg","tadpole","frog"], coachWrong: "Think back to page two. Which picture shows how a frog begins, at the very start? Try again!" },
    },
    {
      id: "fact-page-3",
      purpose: "apply",
      gate: "interaction",
      prompt: "Page 3. Keep reading!",
      image: IMG("page-3"),
      narration: { audio: A("fact-page-3"), script: "You connected them perfectly! Now, what do frogs eat? Here is page three. Eyes on the words!" },
      interaction: { type: "read-along", text: "A frog eats bugs. Snap! It grabs a bug fast.", audio: A("fact-page-3-sentence") },
    },
    {
      id: "check-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does a frog eat?",
      narration: { audio: A("check-detail"), script: "Detail check! A detail is one small fact. Think back to page three. What does a frog eat? Tap the picture from our book." },
      interaction: { type: "choose", options: [{ id: "bugs", label: "BUGS", audio: W("bugs"), image: IMG("bugs") }, { id: "leaves", label: "LEAVES", audio: W("leaves"), image: IMG("leaves") }], correctId: "bugs", coachWrong: "Think back to page three. Snap! What did the frog grab so fast? Look at both pictures and try again!" },
    },
    {
      id: "check-picture",
      purpose: "apply",
      gate: "interaction",
      prompt: "What grabs the bug?",
      image: IMG("page-3"),
      narration: { audio: A("check-picture"), script: "Here is that page again. The words said the frog grabs a bug, but the words did not say how! Good fact finders use the picture. Look closely. What does the frog use to grab the bug? Tap the word." },
      interaction: { type: "choose", options: [{ id: "tongue", label: "TONGUE", audio: W("tongue") }, { id: "foot", label: "FOOT", audio: W("foot") }], correctId: "tongue", coachWrong: "Use the picture clue! Look at what is stretching out of the frog's mouth to reach that bug. Try again!" },
    },
    {
      id: "fact-page-4",
      purpose: "apply",
      gate: "interaction",
      prompt: "Page 4. Almost there!",
      image: IMG("page-4"),
      narration: { audio: A("fact-page-4"), script: "Remember your cover guess? Page four tells us what those strong legs can do. Read along!" },
      interaction: { type: "read-along", text: "A frog has long back legs. It can hop far.", audio: A("fact-page-4-sentence") },
    },
    {
      id: "fact-page-5",
      purpose: "apply",
      gate: "interaction",
      prompt: "The last page!",
      image: IMG("page-5"),
      narration: { audio: A("fact-page-5"), script: "Your guess came true! One more page. This one tells us why frogs love the pond. Read along with me!" },
      interaction: { type: "read-along", text: "A frog sits near the pond. Its skin must stay wet.", audio: A("fact-page-5-sentence") },
    },
    {
      id: "check-reason",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why does a frog sit near the pond?",
      narration: { audio: A("check-reason"), script: "The author gave us a reason, a why! Think back to page five. Why does a frog sit near the pond? Tap the word that tells why." },
      interaction: { type: "choose", options: [{ id: "wet", label: "WET", audio: W("wet") }, { id: "dry", label: "DRY", audio: W("dry") }], correctId: "wet", coachWrong: "Think back to page five. What did the book say a frog's skin must always stay? Try again!" },
    },
    {
      id: "read-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "A frog can hop.",
      image: IMG("page-4"),
      narration: { audio: A("read-sentence"), script: "Now for the fact reader moment! This sentence is all yours. Look at the words, take a breath, then press the mic and read the sentence out loud in your best reading voice!" },
      interaction: { type: "speak", text: "a frog can hop" },
    },
    {
      id: "party-time",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You finished the Fact Reading Party!",
      fx: {"text":"You are a **Fact Finder**!","effect":"fireworks"},
      narration: { audio: A("party-time"), script: "You did it! You read a whole fact book from the cover to the last page, and you understood it all. The topic, the details, the connections, the picture clue, and the author's reason. That was the last fact finder lesson in our whole unit. You finished it! Let's celebrate, fact reader!" },
    },
  ],
};
