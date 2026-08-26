import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-families-friends-timings.json";

// Word Families & Friends (K.L.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-families-friends

const A = (id: string) => `/audio/lessons-v2/word-families-friends/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/word-families-friends/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-families-friends/${w.toLowerCase()}.png`;

export const wordFamiliesFriendsImages: Record<string, string> = {
  "lexi-explorer": "A small, friendly cartoon ant wearing an explorer hat and holding a magnifying glass, smiling.",
  "apple": "A bright red cartoon apple with a green leaf.",
  "dog": "A friendly brown cartoon puppy with floppy ears, sitting and smiling.",
  "milk": "A plain white milk carton with a happy face and a red striped straw, completely blank carton with no label, no letters, no words anywhere.",
  "pear": "A green cartoon pear with a small brown stem and a leaf.",
  "star": "A shiny yellow five-pointed cartoon star.",
  "frog": "A cute green cartoon frog sitting on a lily pad, plain light blue background, no border, no circular frame.",
  "oval": "A simple purple cartoon oval shape.",
  "big": "A large, round cartoon elephant, smiling.",
  "small": "A tiny, round cartoon mouse, smiling.",
  "hot": "A steaming red cup of hot cocoa with a small flame icon above it.",
  "cold": "A blue ice cube with small white snowflakes around it.",
  "up": "A single big red cartoon arrow pointing straight up, perfectly vertical, against a plain light blue sky with a small white cloud, green grass at the bottom edge, no border, no frame.",
  "down": "A cartoon arrow pointing downwards to the green ground.",
  "traffic-light": "A cartoon traffic light on a silver pole, showing bright red, yellow, and green circle lights.",
  "street": "A simple cartoon street scene viewed from the side, a gray road with a yellow dashed center line running across, a light gray sidewalk, one small tree, blue sky, full scene, no border, no frame, no faces.",
  "park": "A green park scene with a swing set, trees, and a sunny sky, full scene filling the whole image edge to edge, no border, no frame.",
  "home": "A cozy cartoon house with a red roof, a chimney, and a welcoming door.",
  "bed": "A cozy cartoon bed with a fluffy white pillow and a striped blue blanket.",
  "shop": "A small cartoon storefront with a striped awning, a big display window full of fruits, and an open door."
};

export const wordFamiliesFriends: LessonDef = {
  id: "word-families-friends",
  title: "Word Families & Friends",
  grade: "Kindergarten",
  standard: "K.L.5",
  archetype: "vocabulary",
  objective: "You will sort words, find word buddies, and connect words to real life!",
  concepts: ["categorization","opposites","real-world connections"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Wow, you are a super Word Explorer! You learned to sort words into groups. You also matched words that are opposites. Keep looking for words everywhere!",
    "title": "Amazing Word Explorer!",
    "body": "You did a fantastic job exploring words today!"
  },
  scenes: [
    {
      id: "hook-intro-explorer",
      purpose: "hook",
      gate: "none",
      prompt: "Welcome, Word Explorer!",
      image: IMG("lexi-explorer"),
      narration: { audio: A("hook-intro-explorer"), script: "Hello, I'm Lexi, your Word Explorer! Our mission is to explore words today. We will find words, sort them, and make new word friends!" },
    },
    {
      id: "model-sort-foods",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Let's sort our first word!",
      narration: { audio: A("model-sort-foods"), script: "Words that go together live in the same home. Let's do the first one together. Apple is something we eat, so apple is a food. Drag the word apple to the Foods home!" },
      interaction: { type: "sort", buckets: ["Foods","Animals"], items: [{ label: "APPLE", bucket: "Foods", audio: W("apple"), image: IMG("apple") }], coachWrong: "Apple is something we eat. Which home is for things we eat? Try again!" },
    },
    {
      id: "guided-sort-foods-animals",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Your turn to sort!",
      narration: { audio: A("guided-sort-foods-animals"), script: "Great job! Now, help Lexi sort these words. Tap each word to hear it. Then drag it to its right home, Foods or Animals." },
      interaction: { type: "sort", buckets: ["Foods","Animals"], items: [{ label: "DOG", bucket: "Animals", audio: W("dog"), image: IMG("dog") }, { label: "MILK", bucket: "Foods", audio: W("milk"), image: IMG("milk") }, { label: "PEAR", bucket: "Foods", audio: W("pear"), image: IMG("pear") }], coachWrong: "Hmm, is that a food or an animal? Listen to the word again and try to put it in the correct home." },
    },
    {
      id: "apply-sort-shapes-animals",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "You try sorting words!",
      narration: { audio: A("apply-sort-shapes-animals"), script: "You're becoming a super word sorter! These homes are Shapes and Animals. Drag each word to its correct home. You've got this!" },
      interaction: { type: "sort", buckets: ["Shapes","Animals"], items: [{ label: "STAR", bucket: "Shapes", audio: W("star"), image: IMG("star") }, { label: "FROG", bucket: "Animals", audio: W("frog"), image: IMG("frog") }, { label: "OVAL", bucket: "Shapes", audio: W("oval"), image: IMG("oval") }], coachWrong: "Listen carefully to the word. Is it a shape, or is it an animal? Try again!" },
    },
    {
      id: "model-opposites-big-small",
      purpose: "model",
      gate: "none",
      prompt: "Find word buddies!",
      fx: {"text":"**Big** and **small** are word buddies!","effect":"pop-words"},
      narration: { audio: A("model-opposites-big-small"), script: "Words can also be friends with their opposites! Lexi will show you how to find 'word buddies' that are opposite. Listen: 'Big' and 'small' are word buddies!" },
    },
    {
      id: "guided-opposite-big",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word is the opposite of **big**?",
      image: IMG("big"),
      narration: { audio: A("guided-opposite-big"), script: "Now it's your turn to find a word buddy! Look at the elephant. The elephant is big. Which word is the opposite of big? Tap the word you think it is." },
      interaction: { type: "choose", options: [{ id: "small", label: "SMALL", audio: W("small"), image: IMG("small") }, { id: "hot", label: "HOT", audio: W("hot"), image: IMG("hot") }, { id: "up", label: "UP", audio: W("up"), image: IMG("up") }], correctId: "small", coachWrong: "Big means very, very large. Its word buddy means just the other kind of size. Try again!" },
    },
    {
      id: "apply-opposite-up",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is the opposite of **up**?",
      image: IMG("up"),
      narration: { audio: A("apply-opposite-up"), script: "You're so good at finding word buddies! This arrow points up, way up to the sky. Which word is the opposite of up? Tap it!" },
      interaction: { type: "choose", options: [{ id: "down", label: "DOWN", audio: W("down"), image: IMG("down") }, { id: "cold", label: "COLD", audio: W("cold"), image: IMG("cold") }, { id: "small", label: "SMALL", audio: W("small"), image: IMG("small") }], correctId: "down", coachWrong: "Up means going high, to the sky. Its word buddy means the other way. Try again!" },
    },
    {
      id: "apply-say-opposite",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the opposite of **hot**!",
      image: IMG("hot"),
      narration: { audio: A("apply-say-opposite"), script: "Word Explorer, this one is out loud! Cocoa is hot. Soup is hot. What word is the opposite of hot? Press the microphone and say it, loud and clear!" },
      interaction: { type: "speak", text: "cold" },
    },
    {
      id: "model-real-life-light",
      purpose: "model",
      gate: "interaction",
      prompt: "Where do you see it?",
      image: IMG("traffic-light"),
      narration: { audio: A("model-real-life-light"), script: "Words are all around us in the real world! Lexi will show you. This is a traffic light. Where do you see a traffic light? On the street, where the cars drive! Tap street." },
      interaction: { type: "choose", options: [{ id: "park", label: "PARK", audio: W("park"), image: IMG("park") }, { id: "street", label: "STREET", audio: W("street"), image: IMG("street") }, { id: "home", label: "HOME", audio: W("home"), image: IMG("home") }], correctId: "street", coachWrong: "Traffic lights tell cars when to go and when to stop. Where do cars drive? Try again!" },
    },
    {
      id: "challenge-real-life-bed",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where do you see a bed?",
      image: IMG("bed"),
      narration: { audio: A("challenge-real-life-bed"), script: "You're a super word explorer! Now, for a challenge. Think about the word bed. Where do you see your bed in real life? Tap that place." },
      interaction: { type: "choose", options: [{ id: "home", label: "HOME", audio: W("home"), image: IMG("home") }, { id: "park", label: "PARK", audio: W("park"), image: IMG("park") }, { id: "shop", label: "SHOP", audio: W("shop"), image: IMG("shop") }], correctId: "home", coachWrong: "Think about where you sleep every night, all cozy and warm. Which place is that? Try again!" },
    },
    {
      id: "celebrate-explorer",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Word Explorer!",
      fx: {"text":"You are an **amazing** Word Explorer!","effect":"rocket"},
      narration: { audio: A("celebrate-explorer"), script: "Wow, you did it! You are an amazing Word Explorer. You sorted words, found word buddies, and connected words to the real world. Keep exploring!" },
    },
  ],
};
