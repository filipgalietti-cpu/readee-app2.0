import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./same-and-different-timings.json";

// Same & Different (RL.K.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=same-and-different

const A = (id: string) => `/audio/lessons-v2/same-and-different/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/same-and-different/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/same-and-different/${w.toLowerCase()}.png`;

export const sameAndDifferentImages: Record<string, string> = {
  "pip": "A friendly blue bird with a red scarf, smiling.",
  "pat-cat": "A fluffy orange cat with a green collar, sitting and smiling.",
  "pam-dog": "A happy brown dog with a blue collar, wagging its tail.",
  "cat-dog-ball": "A fluffy orange cat with a green collar and a happy brown dog with a blue collar playing together with a red ball.",
  "cat-fish-dog-bone": "On the left, a fluffy orange cat with a green collar eating a small blue fish. On the right, a happy brown dog with a blue collar chewing a white bone.",
  "foxy-beary": "An orange fox with a white-tipped tail and a big brown bear standing side by side in a sunny forest.",
  "runs": "A child running very fast with motion lines.",
  "climbs": "A child climbing a tree.",
  "sleeps": "A child sleeping peacefully in a bed.",
  "hops": "A child hopping on one foot, smiling.",
  "grass": "Bright green blades of grass.",
  "cheese": "A yellow block of Swiss cheese.",
  "bunny-mouse": "A white fluffy bunny and a tiny grey mouse standing side by side in a green meadow.",
  "bike": "A red bicycle.",
  "boat": "A small wooden boat floating on water.",
  "star": "A bright yellow star shining in the sky."
};

export const sameAndDifferent: LessonDef = {
  id: "same-and-different",
  title: "Same & Different",
  grade: "Kindergarten",
  standard: "RL.K.9",
  archetype: "story-elements",
  objective: "I can tell what happened to both friends, and what happened to just one friend in a story.",
  concepts: ["compare and contrast","story elements","same and different"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are so good at finding what is the same and what is different! We learned how to compare stories. You can tell what happens to both friends, and what happens to just one. Great job, superstar!",
    "title": "Story Expert!",
    "body": "You mastered comparing characters' adventures!"
  },
  scenes: [
    {
      id: "hook-intro",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Pip, our friend!",
      image: IMG("pip"),
      narration: { audio: A("hook-intro"), script: "Hi friends! I'm Pip, and I love finding things that are the same and things that are different. Let's start our adventure!" },
    },
    {
      id: "story-pat-cat",
      purpose: "hook",
      gate: "interaction",
      prompt: "Listen to Pat's story.",
      image: IMG("pat-cat"),
      narration: { audio: A("story-pat-cat"), script: "Our first friend is Pat. Listen carefully to what Pat does." },
      interaction: { type: "read-along", text: "Pat is a cat. Pat plays with a ball. Pat eats a fish.", audio: A("story-pat-cat-sentence") },
    },
    {
      id: "story-pam-dog",
      purpose: "hook",
      gate: "interaction",
      prompt: "Listen to Pam's story.",
      image: IMG("pam-dog"),
      narration: { audio: A("story-pam-dog"), script: "Now listen to Pam's story. Pam is Pat's friend. What does Pam do?" },
      interaction: { type: "read-along", text: "Pam is a dog. Pam plays with a ball. Pam eats a bone.", audio: A("story-pam-dog-sentence") },
    },
    {
      id: "model-both",
      purpose: "model",
      gate: "none",
      prompt: "What did **both** friends do?",
      image: IMG("cat-dog-ball"),
      narration: { audio: A("model-both"), script: "Pip says, 'I heard that Pat and Pam both played with a ball!' See, they both did that!" },
    },
    {
      id: "model-one",
      purpose: "model",
      gate: "none",
      prompt: "What did **only one** friend do?",
      image: IMG("cat-fish-dog-bone"),
      narration: { audio: A("model-one"), script: "But Pip also heard that Pat ate a fish, and Pam ate a bone. So, only one friend ate a fish. Only one friend ate a bone!" },
    },
    {
      id: "guided-say-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "Say what they **both** played with!",
      image: IMG("cat-dog-ball"),
      narration: { audio: A("guided-say-both"), script: "Pat and Pam both played with the same toy. Do you remember it? Look at the word on the screen. Press the microphone and say it, loud and clear!" },
      interaction: { type: "speak", text: "ball" },
    },
    {
      id: "story-foxy-beary",
      purpose: "guided",
      gate: "interaction",
      prompt: "New friends, new stories!",
      image: IMG("foxy-beary"),
      narration: { audio: A("story-foxy-beary"), script: "Great job, friends! Now let's meet two more friends. Listen to their stories to see what they do. Are you ready?" },
      interaction: { type: "read-along", text: "Foxy is a fox. Foxy runs fast. Foxy climbs a tree. Beary is a bear. Beary runs fast. Beary sleeps in a den.", audio: A("story-foxy-beary-sentence") },
    },
    {
      id: "guided-choose-both",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did **both** friends do?",
      narration: { audio: A("guided-choose-both"), script: "Pip wants your help! What did both Foxy and Beary do? Tap the picture that shows what both friends did." },
      interaction: { type: "choose", options: [{ id: "runs", label: "RUNS", audio: W("runs"), image: IMG("runs") }, { id: "climbs", label: "CLIMBS", audio: W("climbs"), image: IMG("climbs") }, { id: "sleeps", label: "SLEEPS", audio: W("sleeps"), image: IMG("sleeps") }], correctId: "runs", coachWrong: "Try again. Remember, what did Foxy AND Beary do?" },
    },
    {
      id: "guided-choose-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did **only one** friend do?",
      narration: { audio: A("guided-choose-one"), script: "You're doing great! Now, what did only one friend do? Tap the picture that shows what just one friend did." },
      interaction: { type: "choose", options: [{ id: "climbs", label: "CLIMBS", audio: W("climbs"), image: IMG("climbs") }, { id: "hops", label: "HOPS", audio: W("hops"), image: IMG("hops") }, { id: "runs", label: "RUNS", audio: W("runs"), image: IMG("runs") }], correctId: "climbs", coachWrong: "Think about the stories. Can you find something that only ONE friend did?" },
    },
    {
      id: "apply-choose-both",
      purpose: "apply",
      gate: "interaction",
      prompt: "What happened to **both**?",
      image: IMG("bunny-mouse"),
      narration: { audio: A("apply-choose-both"), script: "Let's try another one! Listen carefully. Bunny hops. Mouse hops. Bunny eats grass. Mouse eats cheese. What happened to both of these friends? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "hops", label: "HOPS", audio: W("hops"), image: IMG("hops") }, { id: "grass", label: "GRASS", audio: W("grass"), image: IMG("grass") }, { id: "cheese", label: "CHEESE", audio: W("cheese"), image: IMG("cheese") }], correctId: "hops", coachWrong: "Hmm, did both friends do that? Listen again and pick what both did." },
    },
    {
      id: "challenge-sort",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Put them where they go!",
      narration: { audio: A("challenge-sort"), script: "Here is your challenge! Tim and Meg went on a trip. Tim rode a bike. Meg rode a bike. Tim saw a boat. Meg saw a star. Now drag each one to the right spot. Did both friends do it, did only Tim, or did only Meg?" },
      interaction: { type: "sort", buckets: ["Both","Only Tim","Only Meg"], items: [{ label: "BIKE", bucket: "Both", audio: W("bike"), image: IMG("bike") }, { label: "BOAT", bucket: "Only Tim", audio: W("boat"), image: IMG("boat") }, { label: "STAR", bucket: "Only Meg", audio: W("star"), image: IMG("star") }], coachWrong: "Keep trying! Did both friends do that, or just one friend?" },
    },
    {
      id: "celebrate-lesson",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a story expert!",
      fx: {"text":"superstar!","effect":"fireworks"},
      narration: { audio: A("celebrate-lesson"), script: "You did it! You are so good at finding what is the same and what is different in stories. You can tell what happens to both friends, and what happens to just one. You are a superstar!" },
    },
  ],
};
