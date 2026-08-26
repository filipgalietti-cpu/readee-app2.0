import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./syllable-beats-timings.json";

// Syllable Beats (RF.K.2b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=syllable-beats

const A = (id: string) => `/audio/lessons-v2/syllable-beats/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/syllable-beats/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/syllable-beats/${w.toLowerCase()}.png`;

export const syllableBeatsImages: Record<string, string> = {
  "dog": "a friendly brown dog sitting, wagging its tail",
  "sun": "a bright yellow sun with a happy face, shining rays",
  "cat": "a fluffy orange cat playing with a yarn ball",
  "pig": "a cute pink piglet rolling in the mud",
  "tiger": "a striped orange and black tiger cub pouncing playfully",
  "apple": "a shiny red apple with a green leaf",
  "fish": "a colorful blue fish swimming happily",
  "candy": "a wrapped hard candy, swirly colors",
  "monkey": "a playful brown monkey swinging from a tree branch",
  "one": "a single red apple",
  "two": "two blue birds flying together"
};

export const syllableBeats: LessonDef = {
  id: "syllable-beats",
  title: "Syllable Beats",
  grade: "Kindergarten",
  standard: "RF.K.2b",
  archetype: "phonics",
  objective: "I can clap and count the beats in words!",
  concepts: ["count syllables","clapping beats","one-beat words","two-beat words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You are a fantastic beat explorer. You learned to find the beats, or syllables, in so many words. Keep clapping out those word beats!",
    "title": "You're a Syllable Superstar!",
    "body": "You mastered counting beats in words! Keep practicing by clapping out the names of your toys, friends, and snacks!"
  },
  scenes: [
    {
      id: "intro-hook",
      purpose: "hook",
      gate: "none",
      prompt: "Listen for the word beats!",
      image: IMG("monkey"),
      fx: {"text":"beats","effect":"pop-words"},
      narration: { audio: A("intro-hook"), script: "Hi friends! I'm Jennifer, and this is our friend, Beat Buddy! Beat Buddy loves finding the beats in words, just like music! Let's listen to some words and clap along with Beat Buddy." },
      interaction: { type: "listen", items: [{ label: "DOG", audio: W("dog"), image: IMG("dog") }, { label: "SUN", audio: W("sun"), image: IMG("sun") }] },
    },
    {
      id: "model-one-dog",
      purpose: "model",
      gate: "none",
      prompt: "Watch me clap 'dog'.",
      image: IMG("dog"),
      fx: {"text":"dog","effect":"underline"},
      narration: { audio: A("model-one-dog"), script: "Did you hear those claps? Each clap is a word beat! Watch me clap the beats in the word dog. I'll say 'dog' and clap once for each beat. Dog has one beat!" },
    },
    {
      id: "model-one-sun",
      purpose: "model",
      gate: "none",
      prompt: "Watch me clap 'sun'.",
      image: IMG("sun"),
      fx: {"text":"sun","effect":"underline"},
      narration: { audio: A("model-one-sun"), script: "Great job watching! Let's try another one-beat word. Listen as I clap for sun. Sun has one beat too!" },
    },
    {
      id: "guided-one-cat",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many beats in 'cat'?",
      narration: { audio: A("guided-one-cat"), script: "Now it's your turn to clap with Beat Buddy! Tap the picture to hear the word cat. Then clap with Beat Buddy and me. How many beats does cat have?" },
      interaction: { type: "choose", options: [{ id: "one", label: "ONE", audio: W("one"), image: IMG("one") }, { id: "two", label: "TWO", audio: W("two"), image: IMG("two") }], correctId: "one", coachWrong: "Listen carefully and try clapping for cat again! Does it have one clap or two?" },
    },
    {
      id: "guided-one-pig",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many beats in 'pig'?",
      narration: { audio: A("guided-one-pig"), script: "You're doing great finding those beats! Let's try another one. Tap the picture to hear pig. Clap along with Beat Buddy. How many beats in pig?" },
      interaction: { type: "choose", options: [{ id: "one", label: "ONE", audio: W("one"), image: IMG("one") }, { id: "two", label: "TWO", audio: W("two"), image: IMG("two") }], correctId: "one", coachWrong: "Let's clap pig together. Piiiig! Just one clap. Try again!" },
    },
    {
      id: "model-two-tiger",
      purpose: "model",
      gate: "none",
      prompt: "Watch me clap 'tiger'.",
      image: IMG("tiger"),
      fx: {"text":"tiger","effect":"underline"},
      narration: { audio: A("model-two-tiger"), script: "Some words have more than one beat! Listen closely as I clap for tiger. Ti-ger! Did you hear two claps? Tiger has two beats!" },
    },
    {
      id: "guided-two-apple",
      purpose: "guided",
      gate: "interaction",
      prompt: "How many beats in 'apple'?",
      narration: { audio: A("guided-two-apple"), script: "Wow, you heard two beats in tiger! Now it's your turn. Tap the picture to hear apple. Clap along with Beat Buddy. How many beats does apple have?" },
      interaction: { type: "choose", options: [{ id: "one", label: "ONE", audio: W("one"), image: IMG("one") }, { id: "two", label: "TWO", audio: W("two"), image: IMG("two") }], correctId: "two", coachWrong: "Listen again and clap for apple. Ap-ple! It has two beats. You can do it!" },
    },
    {
      id: "apply-sort",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort words by their beats!",
      narration: { audio: A("apply-sort"), script: "You've become a super beat counter! Now let's sort some words. Drag the words that have one beat to the 'One Beat' basket, and words with two beats to the 'Two Beats' basket. Remember to clap them out!" },
      interaction: { type: "sort", buckets: ["One Beat","Two Beats"], items: [{ label: "DOG", bucket: "One Beat", audio: W("dog") }, { label: "SUN", bucket: "One Beat", audio: W("sun") }, { label: "TIGER", bucket: "Two Beats", audio: W("tiger") }, { label: "APPLE", bucket: "Two Beats", audio: W("apple") }, { label: "FISH", bucket: "One Beat", audio: W("fish") }, { label: "CANDY", bucket: "Two Beats", audio: W("candy") }], coachWrong: "Clap that word again! Does it make one sound or two? Try placing it in the other basket." },
    },
    {
      id: "challenge-monkey",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How many beats in this word?",
      narration: { audio: A("challenge-monkey"), script: "You are amazing at finding beats! For this last challenge, Beat Buddy has a new word for you. Tap the picture to hear it. Clap the beats all by yourself! How many beats did you hear?" },
      interaction: { type: "choose", options: [{ id: "one", label: "ONE", audio: W("one"), image: IMG("one") }, { id: "two", label: "TWO", audio: W("two"), image: IMG("two") }], correctId: "two", coachWrong: "Clap it out again! Listen for each part of the word. You're so close!" },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Beat Explorer!",
      fx: {"text":"You are a fantastic beat explorer!","effect":"rainbow"},
      narration: { audio: A("celebrate"), script: "You did it! You are a fantastic beat explorer. Now you know how to find the beats, or syllables, in so many words. Keep clapping out those word beats!" },
    },
  ],
};
