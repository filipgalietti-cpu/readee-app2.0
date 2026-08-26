import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-solvers-timings.json";

// Word Solvers (L.2.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-solvers

const A = (id: string) => `/audio/lessons-v2/word-solvers/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-solvers/${w.toLowerCase()}.png`;

export const wordSolversImages: Record<string, string> = {
  "eagle": "A majestic brown eagle with wide open wings soaring high above green mountains, blue sky, small white clouds below its wings. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "mouse": "A small shy brown mouse holding a tiny wrapped gift box, standing in a cozy room, cheeks slightly blushing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "train": "A long colorful passenger train with a friendly rounded engine chugging along railroad tracks through green hills, puffs of white steam. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const wordSolvers: LessonDef = {
  id: "word-solvers",
  title: "Word Solvers",
  grade: "2nd Grade",
  standard: "L.2.4",
  archetype: "vocabulary",
  objective: "I can solve unknown words with context clues and test both meanings of double-duty words.",
  concepts: ["context clues","double-duty words","test both meanings"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, word solver! You used context clues to solve soared, murmured, and trembled. You tested both meanings of bank, light, and train, and you let each sentence pick the one that fits. Use your strategies every time you read!",
    "title": "Case Closed!",
    "body": "You solved new words with context clues and let each sentence pick the meaning of every double-duty word."
  },
  scenes: [
    {
      id: "hook-first-case",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read our first case with me.",
      narration: { audio: A("hook-first-case"), script: "Hello, reader. Today you are a word solver. When you meet a word you do not know, you have strategies. Use the other words as clues. Look for word parts you know. And when a word has two meanings, test both meanings in the sentence. Here is your first case. Read along with me." },
      interaction: { type: "read-along", text: "The brave eagle soared high above the green mountains. Its wide wings caught the wind. The wind carried it far away over the peaks.", audio: A("hook-first-case-sentence") },
    },
    {
      id: "model-solve-soared",
      purpose: "model",
      gate: "none",
      prompt: "Watch me solve soared.",
      image: IMG("eagle"),
      fx: {"text":"Clues **around** the word!","effect":"underline"},
      narration: { audio: A("model-solve-soared"), script: "Soared. That word might be new to you. Watch me solve it. First I check word parts. Soared ends with the letters e d, so it is something the eagle did. Next I use context clues, the other words around it. I reread. The eagle soared high above the green mountains. Its wide wings caught the wind. High above. Wings. Wind. Every clue points up into the sky. Soared means flew high. The sentence solved the word for me." },
    },
    {
      id: "guided-read-mouse-story",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read the mouse story with me.",
      narration: { audio: A("guided-read-mouse-story"), script: "Your turn, word solver. This little story holds the word murmured. Read along with me and collect your clues." },
      interaction: { type: "read-along", text: "Milo the mouse got a gift from his friend. \"Thank you,\" Milo murmured. He was too shy to speak loudly. His soft voice was hard to hear.", audio: A("guided-read-mouse-story-sentence") },
    },
    {
      id: "guided-choose-murmured",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does murmured mean in this story?",
      image: IMG("mouse"),
      narration: { audio: A("guided-choose-murmured"), script: "Use your context clues. Reread the story in your head and think about how Milo said thank you. Read each card. Tap what murmured means in this story." },
      interaction: { type: "choose", options: [{ id: "spoke-very-softly", label: "spoke very softly" }, { id: "shouted-very-loudly", label: "shouted very loudly" }, { id: "laughed-at-the-gift", label: "laughed at the gift" }, { id: "ran-away-to-hide", label: "ran away to hide" }], correctId: "spoke-very-softly", coachWrong: "Reread the story. Milo was too shy to speak loudly. How would his thank you sound? Try again!" },
    },
    {
      id: "model-test-both-bank",
      purpose: "model",
      gate: "none",
      prompt: "Watch me test both meanings of bank.",
      fx: {"text":"Test **both** meanings!","effect":"underline"},
      narration: { audio: A("model-test-both-bank"), script: "Now for the trickiest kind of word. Some words do double duty. They have two meanings. Bank can mean the land beside a river. Bank can also mean a place that keeps money safe. Watch my strategy. I test both meanings in a sentence. Dad puts his coins in the bank to keep them safe. Could Dad put his coins in the land beside a river? That does not make sense. Could Dad put his coins in a money bank? Yes. The sentence fits only one meaning. Test both, keep the one that makes sense." },
    },
    {
      id: "guided-choose-bank",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which meaning of bank fits this sentence?",
      narration: { audio: A("guided-choose-bank"), script: "Your turn to test both meanings. Listen to this sentence. The children skipped stones into the water from the grassy bank. Try the money meaning. Then try the river meaning. Read each card. Tap the meaning that fits this sentence." },
      interaction: { type: "choose", options: [{ id: "land-beside-a-river", label: "land beside a river" }, { id: "a-place-for-money", label: "a place for money" }], correctId: "land-beside-a-river", coachWrong: "Test both meanings. The children are skipping stones into the water. Where are they standing? Try again!" },
    },
    {
      id: "apply-sort-light",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the light sentences.",
      narration: { audio: A("apply-sort-light"), script: "Light is a double-duty word too. Light can mean a glow you see, like from a lamp. Light can also mean not heavy, easy to lift. Read each sentence card. Test both meanings. Then drag each card to Glow or Not Heavy." },
      interaction: { type: "sort", buckets: ["Glow","Not Heavy"], items: [{ label: "The feather is light.", bucket: "Not Heavy" }, { label: "Turn on the light.", bucket: "Glow" }, { label: "The lamp gives soft light.", bucket: "Glow" }, { label: "The box was light to carry.", bucket: "Not Heavy" }], coachWrong: "Reread that card. Is its light a glow you can see, or something easy to lift? Try again!" },
    },
    {
      id: "apply-speak-read-train",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read aloud: The long train chugged down the tracks.",
      image: IMG("train"),
      narration: { audio: A("apply-speak-read-train"), script: "Time to read out loud. Here is a new case with the word train. Tap the mic and read this sentence in a clear voice." },
      interaction: { type: "speak", text: "The long train chugged down the tracks" },
    },
    {
      id: "apply-speak-train-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what train means in that sentence.",
      image: IMG("train"),
      narration: { audio: A("apply-speak-train-meaning"), script: "Train is a double-duty word. Train can mean a long vehicle that rolls on tracks. Train can also mean to practice a skill. Think about the sentence you just read. The long train chugged down the tracks. Tap the mic and say what train means in that sentence." },
      interaction: { type: "speak", text: "vehicle tracks railroad engine cars" },
    },
    {
      id: "challenge-train-flips",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does trains mean in Lily's sentence?",
      narration: { audio: A("challenge-train-flips"), script: "One more train case, and this one flips. Listen. Lily wants to win the big race, so she trains with her coach every day. Trains is doing double duty again. Test both meanings. Read each card. Tap what trains means in that sentence." },
      interaction: { type: "choose", options: [{ id: "practices-to-get-better", label: "practices to get better" }, { id: "rides-on-a-railroad", label: "rides on a railroad" }, { id: "sits-down-to-rest", label: "sits down to rest" }, { id: "shouts-at-the-coach", label: "shouts at the coach" }], correctId: "practices-to-get-better", coachWrong: "Reread it. Lily does this with her coach every day to get ready for the race. Try again!" },
    },
    {
      id: "challenge-solve-trembled",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does trembled mean?",
      narration: { audio: A("challenge-solve-trembled"), script: "Last case, word solver. A brand new word. Listen. Cold wind blew across the field. Lily trembled and hugged her warm coat. Her teeth chattered. Use your context clues. Read each card. Tap what trembled means." },
      interaction: { type: "choose", options: [{ id: "shook-from-the-cold", label: "shook from the cold" }, { id: "danced-in-the-field", label: "danced in the field" }, { id: "shouted-at-the-wind", label: "shouted at the wind" }, { id: "slept-in-the-grass", label: "slept in the grass" }], correctId: "shook-from-the-cold", coachWrong: "Use the clues. Cold wind, a warm coat, chattering teeth. What was Lily's body doing? Try again!" },
    },
    {
      id: "celebrate-case-closed",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a word solver!",
      fx: {"text":"**Case** closed!","effect":"fireworks"},
      narration: { audio: A("celebrate-case-closed"), script: "You did it, word solver! You used context clues to solve soared, murmured, and trembled. You tested both meanings of bank, light, and train, and you let each sentence pick the one that fits. Use your strategies every time you read!" },
    },
  ],
};
