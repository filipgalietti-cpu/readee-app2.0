import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./letter-sounds-timings.json";

// Letter Sounds (RF.K.3a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=letter-sounds

const A = (id: string) => `/audio/lessons-v2/letter-sounds/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/letter-sounds/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/letter-sounds/${w.toLowerCase()}.png`;

export const letterSoundsImages: Record<string, string> = {
  "pip": "a cute cartoon penguin wearing a small explorer's hat, looking curious",
  "mat": "a small woven mat with a simple pattern, brightly colored",
  "sun": "a bright yellow cartoon sun with a happy, smiling face",
  "sock": "a colorful striped sock, pulled up neatly",
  "top": "a spinning toy top, brightly painted",
  "tub": "a small, blue bathtub filled with bubbly water",
  "pen": "a blue ink pen with a cap, ready to write",
  "pig": "a happy, friendly pink cartoon pig, snorting playfully",
  "net": "a small fishing net with a wooden handle, ready to catch",
  "nut": "a single brown shelled nut, cracked open slightly",
  "cat": "a cute orange cartoon cat sitting calmly, looking friendly",
  "dog": "a friendly brown cartoon dog wagging its tail excitedly",
  "fan": "a small electric fan, spinning gently",
  "letter-m": "a simple, bold block letter M, standing tall",
  "letter-s": "a simple, bold block letter S, curvy and smooth",
  "letter-t": "a simple, bold block letter T, straight and strong",
  "letter-p": "a simple, bold block letter P, with a round top",
  "letter-n": "a simple, bold block letter N, with sharp angles"
};

export const letterSounds: LessonDef = {
  id: "letter-sounds",
  title: "Letter Sounds",
  grade: "Kindergarten",
  standard: "RF.K.3a",
  archetype: "phonics",
  objective: "You will learn to say the most common sound for consonant letters!",
  concepts: ["say the most common sound for consonant letters: see a letter, say its sound out loud, and match a spoken sound to the letter that makes it"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You helped Pip find all the lost letter sounds. Now you know that letters make sounds, and you can find them!",
    "title": "Sound Explorer Master!",
    "body": "You've mastered finding letter sounds and helped Pip save the day. Keep exploring sounds all around you!"
  },
  scenes: [
    {
      id: "hook-pip-mission",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to Pip's story!",
      image: IMG("pip"),
      fx: {"text":"Pip the penguin lost his **letter sounds**! Can you help him find them?","effect":"pop-words"},
      narration: { audio: A("hook-pip-mission"), script: "Hello, sound explorer! This is Pip the penguin. Pip lost his letter sounds, and he needs our help to find them! Are you ready?" },
    },
    {
      id: "model-say-m",
      purpose: "model",
      gate: "interaction",
      prompt: "Say the word: map!",
      image: IMG("letter-m"),
      narration: { audio: A("model-say-m"), script: "Pip found the letter M! Listen to the sound M makes. M says mmm. Mmm. Here is a word that starts with mmm: map. Now you try! Say map out loud!" },
      interaction: { type: "speak", text: "map" },
    },
    {
      id: "model-match-m",
      purpose: "model",
      gate: "interaction",
      prompt: "Which sound for M?",
      image: IMG("letter-m"),
      narration: { audio: A("model-match-m"), script: "Great job saying mmm! Now, let's find a word that starts with the mmm sound. Tap the picture that starts with mmm." },
      interaction: { type: "choose", options: [{ id: "mat", label: "MAT", audio: W("mat"), image: IMG("mat") }, { id: "sock", label: "SOCK", audio: W("sock"), image: IMG("sock") }], correctId: "mat", coachWrong: "Almost! Listen again. Mmm. Tap each picture to hear its name. Which one starts with mmm?" },
    },
    {
      id: "guided-match-s",
      purpose: "guided",
      gate: "interaction",
      prompt: "Your turn! What sound?",
      image: IMG("letter-s"),
      narration: { audio: A("guided-match-s"), script: "You found the mmm sound! Now, look at this letter. This is the letter S. S says sss. Sss. Tap the picture that starts with sss." },
      interaction: { type: "choose", options: [{ id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }, { id: "tub", label: "TUB", audio: W("tub"), image: IMG("tub") }], correctId: "sun", coachWrong: "That's a good try! Listen again. Sss. Say each picture's name out loud. Which one starts with sss?" },
    },
    {
      id: "guided-match-t",
      purpose: "guided",
      gate: "interaction",
      prompt: "What sound for this?",
      image: IMG("letter-t"),
      narration: { audio: A("guided-match-t"), script: "Excellent! You found the sss sound. Here's another letter, the letter T. T says tuh. Tuh. Tap the picture that starts with tuh." },
      interaction: { type: "choose", options: [{ id: "pig", label: "PIG", audio: W("pig"), image: IMG("pig") }, { id: "top", label: "TOP", audio: W("top"), image: IMG("top") }], correctId: "top", coachWrong: "Keep trying! Listen again. Tuh. Tap each picture to hear its name, then pick the one that starts with tuh." },
    },
    {
      id: "apply-match-p",
      purpose: "apply",
      gate: "interaction",
      prompt: "Find the sound!",
      image: IMG("letter-p"),
      narration: { audio: A("apply-match-p"), script: "You're doing great! Now, try this one all by yourself. This is the letter P. What sound does P make? Say it out loud. Then tap the picture that starts with the sound of P." },
      interaction: { type: "choose", options: [{ id: "nut", label: "NUT", audio: W("nut"), image: IMG("nut") }, { id: "pen", label: "PEN", audio: W("pen"), image: IMG("pen") }, { id: "mat", label: "MAT", audio: W("mat"), image: IMG("mat") }], correctId: "pen", coachWrong: "Listen carefully! P says puh. Say each picture's name. Which one starts with puh?" },
    },
    {
      id: "apply-match-n",
      purpose: "apply",
      gate: "interaction",
      prompt: "Match the sound!",
      image: IMG("letter-n"),
      narration: { audio: A("apply-match-n"), script: "Fantastic work! One more to go. Look at the letter N. What sound does N make? Say it out loud. Then tap the picture that starts with the sound of N." },
      interaction: { type: "choose", options: [{ id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }, { id: "net", label: "NET", audio: W("net"), image: IMG("net") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }], correctId: "net", coachWrong: "You're so close! N says nnn. Say each picture's name. Which one starts with nnn?" },
    },
    {
      id: "challenge-sort-sounds-to-letters",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort sounds to letters.",
      narration: { audio: A("challenge-sort-sounds-to-letters"), script: "Now for our final mission! Sort these pictures to their letters. Say each picture's name, listen to its first sound, then drag it to the letter that makes that sound." },
      interaction: { type: "sort", buckets: ["C","D","F"], items: [{ label: "CAT", bucket: "C", audio: W("cat"), image: IMG("cat") }, { label: "DOG", bucket: "D", audio: W("dog"), image: IMG("dog") }, { label: "FAN", bucket: "F", audio: W("fan"), image: IMG("fan") }], coachWrong: "Keep trying! Say the picture's name out loud. What sound do you hear first? Drag it to the letter that makes that sound." },
    },
    {
      id: "celebrate-mission-complete",
      purpose: "celebrate",
      gate: "none",
      prompt: "You did it! Sounds found!",
      image: IMG("pip"),
      fx: {"text":"You did it! You helped Pip find all the lost **letter sounds**! Now you know that letters make sounds, and you can find them!","effect":"rainbow"},
      narration: { audio: A("celebrate-mission-complete"), script: "You are amazing! You helped Pip find all the lost letter sounds. Now you know that letters make sounds, and you can find them!" },
    },
  ],
};
