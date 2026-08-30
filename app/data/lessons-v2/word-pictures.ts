import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-pictures-timings.json";

// Word Pictures (RL.1.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-pictures

const A = (id: string) => `/audio/lessons-v2/word-pictures/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-pictures/${w.toLowerCase()}.png`;

export const wordPicturesImages: Record<string, string | { subject: string; ref?: string }> = {
  "rainy-window": "A cartoon girl with brown pigtails in a cozy yellow sweater seen from the side, sitting by a big window and watching rain fall outside, gray clouds and rain drops on the glass, warm cozy room inside, no text anywhere",
  "puddle-splash": "A child's legs in red rain boots jumping into a big puddle, water splashing up in drops, wet gray pavement, rain falling, gray sky, seen from the side, no faces, no text anywhere",
  "snug-rug": { subject: "the same cartoon girl with brown pigtails in a cozy yellow sweater sitting on a soft round blue rug holding a warm mug, smiling, a window with rain behind her, warm lamp light in a cozy room", ref: "rainy-window" }
};

export const wordPictures: LessonDef = {
  id: "word-pictures",
  title: "Word Pictures",
  grade: "1st Grade",
  standard: "RL.1.4",
  archetype: "vocabulary",
  objective: "I can find words in poems and stories that appeal to the senses or show feelings.",
  concepts: ["sense words", "feeling words", "poems", "words that appeal to the senses"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a reader you are! You read a whole poem and found the words that paint pictures. Words for your eyes, your ears, your skin, and your tongue, and words that show feelings. Look for word pictures in every story and poem you read!",
    "title": "You Found the Word Pictures!",
    "body": "You found words that help you see, hear, touch, and taste, and words that show feelings."
  },
  scenes: [
    {
      id: "hook-word-pictures",
      purpose: "hook",
      gate: "none",
      prompt: "Words can paint pictures in your mind.",
      image: IMG("rainy-window"),
      narration: { audio: A("hook-word-pictures"), script: "Hello, reader! Today you get something special. A poem. A poem is a small piece of writing with lines that can rhyme, like a little song. Poets pick their words with care. Some words help you see things in your mind. Some help you hear, touch, or taste. Some show how someone feels. Readers call them word pictures. Our poem is about a rainy day. Let's read it and find the word pictures." },
    },
    {
      id: "hook-read-poem-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the first part of the poem with me.",
      narration: { audio: A("hook-read-poem-one"), script: "Here is our poem. It is called A Rainy Day. Read the first part with me, and let the words paint pictures in your mind." },
      interaction: { type: "read-along", text: "Drip, drop! Rain taps all day. The clouds are big and gray. Splash! I dash from pool to pool. The drops feel wet and cool.", audio: A("hook-read-poem-one-sentence") },
    },
    {
      id: "model-hear-splash",
      purpose: "model",
      gate: "none",
      prompt: "Some words make sounds in your mind.",
      fx: {"text":"Splash! You can **hear** that word.","effect":"glow"},
      narration: { audio: A("model-hear-splash"), script: "Watch me find a word picture. Listen to this line of our poem. Splash! I dash from pool to pool. Say the first word with me. Splash. Can you hear the rain water fly up? The poet picked that word so your ears work while you read. Splash is a word you can hear in your mind. That is a word picture. Now you try." },
    },
    {
      id: "guided-highlight-see",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the word that helps you see the clouds.",
      narration: { audio: A("guided-highlight-see"), script: "This line comes from our poem. Read it to yourself. One word in this line helps your eyes. It paints the color of the sky. Tap the word that helps you see." },
      interaction: { type: "highlight", text: "The clouds are big and gray.", targets: ["gray"], coachWrong: "A see word tells how something looks. Read the line again. Which word tells how the clouds look?" },
    },
    {
      id: "guided-highlight-touch",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the two words that tell how the drops feel.",
      image: IMG("puddle-splash"),
      narration: { audio: A("guided-highlight-touch"), script: "Here is another line from the poem. Read it to yourself. Two words in this line tell how the rain drops would feel on your skin. Find both words and tap them." },
      interaction: { type: "highlight", text: "The drops feel wet and cool.", targets: ["wet", "cool"], coachWrong: "That word is not a touch word. Which two words tell how the drops would feel on your skin?" },
    },
    {
      id: "apply-read-poem-two",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read the next part of the poem with me.",
      narration: { audio: A("apply-read-poem-two"), script: "The rain part is done. Now the child in the poem goes home. Read the next part with me, and keep your senses awake." },
      interaction: { type: "read-along", text: "Then home I run to Dad. A sweet snack makes me glad. I sit on my soft rug.", audio: A("apply-read-poem-two-sentence") },
    },
    {
      id: "guided-choose-taste",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the taste word.",
      fx: {"text":"A sweet snack makes me glad.","effect":"spotlight"},
      narration: { audio: A("guided-choose-taste"), script: "One line of our poem holds two word pictures. Read the line on the screen. First, find the taste word. It tells how the snack tastes in your mouth. Read each choice, then tap the taste word." },
      interaction: { type: "choose", options: [{ id: "sweet", label: "sweet" }, { id: "snack", label: "snack" }, { id: "glad", label: "glad" }], correctId: "sweet", coachWrong: "A taste word tells how food tastes in your mouth. Read the line again. Which word tells the taste?" },
    },
    {
      id: "apply-highlight-feeling",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the feeling word.",
      narration: { audio: A("apply-highlight-feeling"), script: "That same line shows a feeling too. Read it one more time. The child got the snack. Then what happened inside the child? Tap the word that shows the feeling." },
      interaction: { type: "highlight", text: "A sweet snack makes me glad.", targets: ["glad"], coachWrong: "A feeling word tells what happens inside someone. Which word tells how the snack made the child feel?" },
    },
    {
      id: "apply-speak-last-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the last line aloud: I feel warm and dry and snug",
      image: IMG("snug-rug"),
      narration: { audio: A("apply-speak-last-line"), script: "One line of the poem is left, and it is all yours. Look at the last line, tap the mic, and read it out loud." },
      interaction: { type: "speak", text: "I feel warm and dry and snug" },
    },
    {
      id: "apply-sort-senses",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the word pictures.",
      narration: { audio: A("apply-sort-senses"), script: "Time to sort word pictures from our poem. Say each word to yourself. Does it help you see, hear, or touch? Drag each word to its bucket." },
      interaction: { type: "sort", buckets: ["See","Hear","Touch"], items: [{ label: "gray", bucket: "See" }, { label: "splash", bucket: "Hear" }, { label: "drip, drop", bucket: "Hear" }, { label: "wet", bucket: "Touch" }, { label: "soft", bucket: "Touch" }, { label: "cool", bucket: "Touch" }], coachWrong: "Say the word to yourself. Do you see it with your eyes, hear it with your ears, or feel it on your skin?" },
    },
    {
      id: "challenge-choose-new-line",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that helps you touch.",
      fx: {"text":"The fuzzy cat purrs on my lap.","effect":"spotlight"},
      narration: { audio: A("challenge-choose-new-line"), script: "Challenge time! Here is a line from a brand new poem. Read it on the screen to yourself. One word tells how the cat would feel under your hand. Read each choice, then tap the word that helps you touch." },
      interaction: { type: "choose", options: [{ id: "fuzzy", label: "fuzzy" }, { id: "cat", label: "cat" }, { id: "purrs", label: "purrs" }, { id: "lap", label: "lap" }], correctId: "fuzzy", coachWrong: "Think about your hand on the cat. Which word tells how the cat's fur would feel?" },
    },
    {
      id: "challenge-speak-feeling",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How did the child feel at the end? Say a feeling word.",
      narration: { audio: A("challenge-speak-feeling"), script: "The poem ended with a feeling. Think about the child at the end of the poem, home and dry with Dad. How did the child feel? Tap the mic and say a feeling word." },
      interaction: { type: "speak", text: "glad happy snug cozy good warm" },
    },
    {
      id: "celebrate-word-pictures",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the word pictures!",
      fx: {"text":"Words can make you **see**, **hear**, **touch**, **taste**, and **feel**!","effect":"fireworks"},
      narration: { audio: A("celebrate-word-pictures"), script: "You did it! You read a whole poem and found its word pictures. You found words for your eyes, your ears, your skin, and your mouth. You even found a feeling word. Poets hide word pictures in every poem. Now you know how to find them." },
    },
  ],
};
