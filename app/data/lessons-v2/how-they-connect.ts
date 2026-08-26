import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./how-they-connect-timings.json";

// How They Connect (RI.K.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=how-they-connect

const A = (id: string) => `/audio/lessons-v2/how-they-connect/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/how-they-connect/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/how-they-connect/${w.toLowerCase()}.png`;

export const howTheyConnectImages: Record<string, string> = {
  "rain-puddle": "rain falling from a plain grey storm cloud onto a street with one big puddle, simple cloud with no face",
  "rain": "a plain dark grey rain cloud with falling blue raindrops, simple cloud shape with no face",
  "puddle": "a clear blue puddle on the ground reflecting the sky",
  "seed": "a small brown seed lying on dark soil",
  "plant": "a vibrant green leafy plant growing in a plain terracotta pot, simple pot with no face",
  "flower": "a tall plant with a big red flower blooming on top",
  "sun": "a plain bright yellow sun with simple rays high in a clear blue sky that fills the whole image, no face, no border",
  "melt": "an ice cream cone dripping and melting",
  "snow": "a snowman in a field of white snow",
  "moon": "a dark blue night sky filling the entire image edge to edge, with one plain yellow crescent moon and a few small stars, no face, no frame, no border",
  "fire": "a small campfire with orange flames on a ring of stones",
  "warm": "a child wrapped snugly in a cozy orange blanket",
  "cold": "a frosty blue ice cube on a plate",
  "dark": "a very dark night sky full of tiny stars stretching edge to edge across the whole image, no circle, no frame",
  "wash": "a plain blue bar of soap with white foam bubbles on top, simple soap bar with no face",
  "clean": "a sparkling clean white plate on a table",
  "dirty": "a white plate splattered with brown mud",
  "tall": "a tall giraffe standing next to a plain small green bush, realistic simple style, no face on the bush",
  "boy-wet": "a surprised boy with dripping wet hair and soaked clothes, water drops falling from his sleeves",
  "water": "a clear glass of water",
  "rock": "a smooth grey river rock"
};

export const howTheyConnect: LessonDef = {
  id: "how-they-connect",
  title: "How They Connect",
  grade: "Kindergarten",
  standard: "RI.K.3",
  archetype: "inference",
  objective: "I can tell why two things go together in a fact.",
  concepts: ["cause and effect","pairs that go together","inference"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Great job, Connection Detective! You learned to ask why, and the answer starts with because. Keep looking for connections all around you!",
    "title": "Super Connector!",
    "body": "You're a pro at finding how things connect!"
  },
  scenes: [
    {
      id: "hook-rain-puddles",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Listen to our fact story!",
      image: IMG("rain-puddle"),
      narration: { audio: A("hook-rain-puddles"), script: "Hello, Connection Detectives! Today we will find out how things connect. One thing can make another thing happen. Listen carefully to this true story about rain." },
      interaction: { type: "read-along", text: "The rain fell. Drip, drop, plink! Big puddles appeared.", audio: A("hook-rain-puddles-sentence") },
    },
    {
      id: "model-rain-puddles",
      purpose: "model",
      gate: "none",
      prompt: "How do these connect?",
      fx: {"text":"Rain makes puddles.","effect":"pop-words"},
      narration: { audio: A("model-rain-puddles"), script: "Great listening! The story told us about rain and puddles. Here is our detective question. Why did the puddles appear? The answer starts with because. Because the rain fell! Rain and puddles connect." },
    },
    {
      id: "model-seed-plant",
      purpose: "model",
      gate: "interaction",
      prompt: "What connects to SEED?",
      image: IMG("seed"),
      narration: { audio: A("model-seed-plant"), script: "Let's try another one. Look at the seed. What happens because of the seed? Tap the picture that connects to the seed." },
      interaction: { type: "choose", options: [{ id: "plant", label: "PLANT", audio: W("plant"), image: IMG("plant") }, { id: "rock", label: "ROCK", audio: W("rock"), image: IMG("rock") }, { id: "moon", label: "MOON", audio: W("moon"), image: IMG("moon") }], correctId: "plant", coachWrong: "Hmm, a seed grows into something. What grows from a seed? Try again!" },
    },
    {
      id: "guided-sun-melt",
      purpose: "guided",
      gate: "interaction",
      prompt: "What connects to SUN?",
      image: IMG("sun"),
      narration: { audio: A("guided-sun-melt"), script: "You found the plant! Good connecting! Now it's your turn, Connection Detective. Look at the hot sun. What happens because of the sun? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "melt", label: "MELT", audio: W("melt"), image: IMG("melt") }, { id: "snow", label: "SNOW", audio: W("snow"), image: IMG("snow") }, { id: "moon", label: "MOON", audio: W("moon"), image: IMG("moon") }], correctId: "melt", coachWrong: "The sun is hot! What happens to ice cream on a hot day? Try again." },
    },
    {
      id: "guided-fire-warm",
      purpose: "guided",
      gate: "interaction",
      prompt: "What connects to FIRE?",
      image: IMG("fire"),
      narration: { audio: A("guided-fire-warm"), script: "Yes, the sun makes things melt! You're doing great. Look at the fire. What does fire make us feel? Tap the picture that connects." },
      interaction: { type: "choose", options: [{ id: "warm", label: "WARM", audio: W("warm"), image: IMG("warm") }, { id: "cold", label: "COLD", audio: W("cold"), image: IMG("cold") }, { id: "dark", label: "DARK", audio: W("dark"), image: IMG("dark") }], correctId: "warm", coachWrong: "Think about how you feel when you sit close to a campfire. Try again." },
    },
    {
      id: "apply-wash-clean",
      purpose: "apply",
      gate: "interaction",
      prompt: "What connects to WASH?",
      image: IMG("wash"),
      narration: { audio: A("apply-wash-clean"), script: "Super work, Detective! Fire makes us warm. Now you try all by yourself. You wash a muddy dish with soap. What happens because you wash it? Tap the picture that connects." },
      interaction: { type: "choose", options: [{ id: "clean", label: "CLEAN", audio: W("clean"), image: IMG("clean") }, { id: "dirty", label: "DIRTY", audio: W("dirty"), image: IMG("dirty") }, { id: "tall", label: "TALL", audio: W("tall"), image: IMG("tall") }], correctId: "clean", coachWrong: "When you wash something, what do you hope happens to it? Try again!" },
    },
    {
      id: "apply-seed-grow",
      purpose: "apply",
      gate: "interaction",
      prompt: "Put the growing story in order!",
      narration: { audio: A("apply-seed-grow"), script: "You got it! Washing makes things clean. Here is a growing fact. First, a seed sits in the dirt. Next, the seed grows into a plant. Last, a flower blooms on the plant. Now you show the order. Drag the pictures. What came first, next, and last?" },
      interaction: { type: "sequence", items: [{ id: "seed", label: "SEED", audio: W("seed"), image: IMG("seed") }, { id: "plant", label: "PLANT", audio: W("plant"), image: IMG("plant") }, { id: "flower", label: "FLOWER", audio: W("flower"), image: IMG("flower") }], order: ["seed","plant","flower"], coachWrong: "Listen again. It starts tiny and grows bigger and bigger. Try again!" },
    },
    {
      id: "challenge-boy-wet",
      purpose: "challenge",
      gate: "interaction",
      prompt: "WHY is the boy wet?",
      image: IMG("boy-wet"),
      narration: { audio: A("challenge-boy-wet"), script: "Fantastic ordering! Now for a challenge. Look at the boy. He is all wet! Why is he wet? Tap the picture that tells why." },
      interaction: { type: "choose", options: [{ id: "rain", label: "RAIN", audio: W("rain"), image: IMG("rain") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }, { id: "moon", label: "MOON", audio: W("moon"), image: IMG("moon") }], correctId: "rain", coachWrong: "Think about what falls from the sky and makes things wet. Try again!" },
    },
    {
      id: "challenge-flower-big",
      purpose: "challenge",
      gate: "interaction",
      prompt: "WHY did the flower grow big?",
      image: IMG("flower"),
      narration: { audio: A("challenge-flower-big"), script: "You are a top Connection Detective! The rain made the boy wet. Here's one more challenge. Look at the big flower. It grew and grew. Why did it grow so big? Tap the picture that tells why." },
      interaction: { type: "choose", options: [{ id: "water", label: "WATER", audio: W("water"), image: IMG("water") }, { id: "rock", label: "ROCK", audio: W("rock"), image: IMG("rock") }, { id: "snow", label: "SNOW", audio: W("snow"), image: IMG("snow") }], correctId: "water", coachWrong: "What does a thirsty flower need to drink so it can grow? Try again!" },
    },
    {
      id: "challenge-say-connect",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what made the puddles!",
      image: IMG("puddle"),
      narration: { audio: A("challenge-say-connect"), script: "Yes! Water made the flower grow big. One last detective job. Look! Puddles are on the ground. What fell from the clouds and made the puddles? Tap the microphone and say the answer." },
      interaction: { type: "speak", text: "rain raining" },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Connection Detective!",
      fx: {"text":"You found the connections!","effect":"fireworks"},
      narration: { audio: A("celebrate"), script: "Amazing work, Connection Detective! You learned to ask why and find out how things connect. Keep looking for connections all around you!" },
    },
  ],
};
