import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./rhyme-time-timings.json";

// Rhyme Time (RF.K.2a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=rhyme-time

const A = (id: string) => `/audio/lessons-v2/rhyme-time/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/rhyme-time/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/rhyme-time/${w.toLowerCase()}.png`;

export const rhymeTimeImages: Record<string, string> = {
  "rory-robot": "a friendly round blue robot with a big smile and antenna, holding a sparkling gumball-style machine",
  "cat": "A friendly orange cartoon cat sitting with a wagging tail.",
  "hat": "A bright red baseball cap.",
  "bat": "A brown wooden baseball bat.",
  "bug": "A cute green ladybug with black spots.",
  "rug": "A colorful braided oval rug.",
  "fox": "A playful orange fox with a bushy tail.",
  "box": "A plain brown cardboard box.",
  "dog": "A happy brown puppy with floppy ears.",
  "fan": "A light blue oscillating electric fan.",
  "pan": "A black frying pan with a handle.",
  "cup": "A bright yellow plastic drinking cup.",
  "mat": "A rectangular welcome mat with a flower design.",
  "pig": "A happy pink cartoon pig standing.",
  "wig": "A curly purple wig on a stand.",
  "dig": "A small child's red shovel digging in a mound of dirt.",
  "pen": "A blue ballpoint pen.",
  "hen": "A brown clucking hen with red comb.",
  "log": "A brown tree log with bark.",
  "sun": "A bright yellow smiling sun with rays.",
  "jug": "A clear glass jug with a handle and spout.",
  "man": "A friendly cartoon man with short brown hair.",
  "can": "A shiny silver soda can.",
  "mouse": "A small grey cartoon mouse with big round ears.",
  "house": "A cozy red house with a smoking chimney.",
  "car": "A shiny blue cartoon car.",
  "boat": "A small red sailboat with a white sail."
};

export const rhymeTime: LessonDef = {
  id: "rhyme-time",
  title: "Rhyme Time",
  grade: "Kindergarten",
  standard: "RF.K.2a",
  archetype: "phonics",
  objective: "You will learn to find words that rhyme.",
  concepts: ["rhyming words","same ending sound"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Fantastic job today! You helped Rory fill his Rhyme Machine with so many rhyming words. Remember, rhyming words are words that sound the same at the end. You learned to find so many!",
    "title": "You are a Rhyme Master!",
    "body": "You successfully learned to recognize and produce rhyming words!"
  },
  scenes: [
    {
      id: "rory-intro-hook",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Listen to Rory the Rhyme Robot!",
      image: IMG("rory-robot"),
      narration: { audio: A("rory-intro-hook"), script: "Hi friends! I'm Rory the Rhyme Robot. My Rhyme Machine needs help. Listen to these words. They sound the same at the end!" },
      interaction: { type: "listen", items: [{ label: "CAT", audio: W("cat"), image: IMG("cat") }, { label: "HAT", audio: W("hat"), image: IMG("hat") }, { label: "BAT", audio: W("bat"), image: IMG("bat") }] },
    },
    {
      id: "rory-models-rhyme",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "Rory shows rhyming words.",
      image: IMG("rory-robot"),
      narration: { audio: A("rory-models-rhyme"), script: "Did you hear that? Cat, hat, and bat all rhyme! They have the same ending sound. Rory found a bug. He knows bug rhymes with rug! Listen to how they sound together." },
      interaction: { type: "listen", items: [{ label: "BUG", audio: W("bug"), image: IMG("bug") }, { label: "RUG", audio: W("rug"), image: IMG("rug") }] },
    },
    {
      id: "guided-choose-fox",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word rhymes with fox?",
      image: IMG("rory-robot"),
      narration: { audio: A("guided-choose-fox"), script: "Now it's your turn to help Rory! He needs a word that rhymes with fox. Listen carefully to the ending sound. Tap the word that rhymes with fox!" },
      interaction: { type: "choose", options: [{ id: "box", label: "BOX", audio: W("box"), image: IMG("box") }, { id: "dog", label: "DOG", audio: W("dog"), image: IMG("dog") }], correctId: "box", coachWrong: "Listen to the end of fox. It's 'ox'! Now listen to the end of dog. It's 'og'. Try again!" },
    },
    {
      id: "guided-choose-fan",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word rhymes with fan?",
      image: IMG("rory-robot"),
      narration: { audio: A("guided-choose-fan"), script: "Great job! Let's help Rory find another rhyme. Which word rhymes with fan? Tap the word that sounds the same at the end." },
      interaction: { type: "choose", options: [{ id: "pan", label: "PAN", audio: W("pan"), image: IMG("pan") }, { id: "cup", label: "CUP", audio: W("cup"), image: IMG("cup") }], correctId: "pan", coachWrong: "Listen to the end of fan. It's 'an'! Now listen to the end of cup. It's 'up'. Try again!" },
    },
    {
      id: "apply-sort-cat-pig",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words that rhyme!",
      image: IMG("rory-robot"),
      narration: { audio: A("apply-sort-cat-pig"), script: "Wow, you are becoming a rhyming expert! Now tap each word, then tap its rhyming home. Put words that rhyme together!" },
      interaction: { type: "sort", buckets: ["cat","pig"], items: [{ label: "HAT", bucket: "cat", audio: W("hat") }, { label: "WIG", bucket: "pig", audio: W("wig") }, { label: "MAT", bucket: "cat", audio: W("mat") }, { label: "DIG", bucket: "pig", audio: W("dig") }], coachWrong: "Oops! Listen carefully to the ending sound. Does it sound like 'at' or 'ig'? Try again!" },
    },
    {
      id: "apply-choose-pen",
      purpose: "apply",
      gate: "interaction",
      prompt: "Find the word that rhymes!",
      image: IMG("rory-robot"),
      narration: { audio: A("apply-choose-pen"), script: "Rory's Rhyme Machine is getting full! Can you find the word that rhymes with pen? Tap the correct rhyming word." },
      interaction: { type: "choose", options: [{ id: "hen", label: "HEN", audio: W("hen"), image: IMG("hen") }, { id: "log", label: "LOG", audio: W("log"), image: IMG("log") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }], correctId: "hen", coachWrong: "Listen to the end of pen. It's 'en'! Now listen to the other words. Try again!" },
    },
    {
      id: "apply-sort-multi",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the rhyming words!",
      image: IMG("rory-robot"),
      narration: { audio: A("apply-sort-multi"), script: "Rory's Rhyme Machine is almost full! Can you sort these words into their rhyming groups? Tap each word, then tap its rhyming friend!" },
      interaction: { type: "sort", buckets: ["bug","hen","fan"], items: [{ label: "RUG", bucket: "bug", audio: W("rug") }, { label: "PEN", bucket: "hen", audio: W("pen") }, { label: "MAN", bucket: "fan", audio: W("man") }, { label: "JUG", bucket: "bug", audio: W("jug") }, { label: "TEN", bucket: "hen", audio: W("ten") }, { label: "CAN", bucket: "fan", audio: W("can") }], coachWrong: "Listen carefully to the ending sound. Does it sound like 'ug', 'en', or 'an'? Try again!" },
    },
    {
      id: "challenge-mouse",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word rhymes?",
      image: IMG("rory-robot"),
      narration: { audio: A("challenge-mouse"), script: "You're a rhyming superstar! Rory has one last challenge for you. He needs to find a word that sounds like mouse. Can you help him?" },
      interaction: { type: "choose", options: [{ id: "house", label: "HOUSE", audio: W("house"), image: IMG("house") }, { id: "car", label: "CAR", audio: W("car"), image: IMG("car") }, { id: "boat", label: "BOAT", audio: W("boat"), image: IMG("boat") }], correctId: "house", coachWrong: "Listen closely to the ending sounds. Which two words sound the same at the end? You can do it!" },
    },
    {
      id: "celebrate-rhyme-master",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Rhyme Master!",
      fx: {"text":"Rhyming words are words that sound the same at the end.","effect":"pop-words"},
      narration: { audio: A("celebrate-rhyme-master"), script: "Fantastic job today! You helped Rory fill his Rhyme Machine with so many rhyming words. Remember, rhyming words are words that sound the same at the end. You learned to find so many!" },
    },
  ],
};
