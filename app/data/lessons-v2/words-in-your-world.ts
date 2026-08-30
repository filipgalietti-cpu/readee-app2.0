import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-in-your-world-timings.json";

// Words in Your World (L.2.5a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-in-your-world
// Real-life connections: describing words fit real things (juicy fits a peach,
// not a cracker), words belong to places and times (whisper in a library,
// cheer at a ballgame), Crunchy-vs-Squishy thing sort, sentence-sense grammar
// beat (spicy), open production speaks (name something sticky, name a place to
// cheer). Anchors fresh vs L.2.5 same-and-opposite (quick/fast, shout/yell,
// loud/quiet, empty/full, glad/happy/thrilled) and vs G1 words-in-real-life
// (noisy, cozy, slippery, fresh, heavy, fragile).

const A = (id: string) => `/audio/lessons-v2/words-in-your-world/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-in-your-world/${w.toLowerCase()}.png`;

export const wordsInYourWorldImages: Record<string, string> = {
  "market-peach": "A boy and his grandfather at a colorful outdoor fruit market stand, the boy holding one ripe peach, baskets of fruit on the wooden stand, plain blue sky, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "juicy-peach": "A ripe orange peach with one bite taken out of it, small drops of juice dripping from the bite, sitting on a plain white plate on a wooden table, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "ballgame-cheer": "Four children with big happy smiling faces standing and cheering on a small wooden bleacher beside a grassy baseball field, arms raised high, open mouths cheering, plain blue sky, plain solid-color shirts with no designs. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
};

export const wordsInYourWorld: LessonDef = {
  id: "words-in-your-world",
  title: "Words in Your World",
  grade: "2nd Grade",
  standard: "L.2.5a",
  archetype: "vocabulary",
  objective: "I can connect words to the real things they fit and the places where I would use them.",
  concepts: ["describing words fit real things (juicy fits a peach, not a cracker)", "words belong to places and times (whisper in a library, cheer at a ballgame)", "sort real things by the describing words that fit them", "name real-life examples of your own"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You connected words to the real world today. Juicy fits a peach, because juice runs out when you bite it. A whisper belongs in the library, and cheering belongs at the ballgame. When you meet a new word, ask yourself two questions. What real thing does this word fit? And where would I use it? Keep connecting words to your world every day!",
    "title": "Word Connector!",
    "body": "You matched describing words to real things, found the places where words belong, and named real-life examples of your own."
  },
  scenes: [
    {
      id: "hook-market-day",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the Saturday story with me.",
      image: IMG("market-peach"),
      narration: { audio: A("hook-market-day"), script: "Hello, reader. Words are not just for books. Every word connects to real things and real places in your world. Read this story with me, and watch three words come alive in real life." },
      interaction: { type: "read-along", text: "On Saturday, Ben went to town with Grandpa. At the market, Ben bit into a ripe peach. Sweet juice ran down his chin. The peach was so juicy! Next they stopped at the quiet library. Ben asked for a book in a soft whisper. Last of all came the big ballgame. When the team scored, Ben jumped up to cheer!", audio: A("hook-market-day-sentence") },
    },
    {
      id: "model-connect-juicy",
      purpose: "model",
      gate: "none",
      prompt: "Watch me connect a word to real things.",
      image: IMG("juicy-peach"),
      fx: {"text":"**juicy** fits a peach","effect":"underline"},
      narration: { audio: A("model-connect-juicy"), script: "Look back at the story. Ben bit the peach, and juice ran down his chin. That peach was juicy. Juicy means full of juice. Now think about real life. A peach is juicy. A slice of watermelon is juicy. An orange is juicy. But a cracker? A cracker is dry. Not one drop of juice comes out. So juicy fits a peach, and juicy does not fit a cracker. That is how you connect a word to real things." },
    },
    {
      id: "model-places-cheer",
      purpose: "model",
      gate: "none",
      prompt: "Words belong to places too.",
      image: IMG("ballgame-cheer"),
      fx: {"text":"**cheer** belongs at the ballgame","effect":"pop-words"},
      narration: { audio: A("model-places-cheer"), script: "Words connect to places too. In the story, Ben jumped up to cheer at the ballgame. To cheer is to call out big happy sounds for your team. A ballgame is the perfect place for it. The team scores, and everyone cheers. Would you cheer in a library? No. A library is for quiet reading. Every word has places where it belongs. When you meet a word, ask yourself, where would I use this in real life?" },
    },
    {
      id: "guided-choose-squishy",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is squishy?",
      narration: { audio: A("guided-choose-squishy"), script: "Your turn. Here is a fresh describing word. Squishy. Squishy things are soft, and they squash down when you press them. Think about pressing each choice with your hand. Which one is squishy? Read each choice. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "pillow", label: "a pillow" }, { id: "rock", label: "a rock" }, { id: "fork", label: "a fork" }, { id: "brick", label: "a brick" }], correctId: "pillow", coachWrong: "Press each one in your mind. Which one squashes down soft under your hand? Try again!" },
    },
    {
      id: "guided-choose-whisper-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where would you whisper?",
      narration: { audio: A("guided-choose-whisper-where"), script: "Now connect a word to a place. A whisper is the softest little voice there is. Think about where a whisper belongs in real life. Which place asks for a whisper? Read each place. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "library", label: "the library" }, { id: "playground", label: "the playground" }, { id: "parade", label: "a parade" }, { id: "gym", label: "the gym" }], correctId: "library", coachWrong: "A whisper is for places where everyone needs quiet voices. Picture each place. Try again!" },
    },
    {
      id: "apply-sort-crunchy-squishy",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the real things: crunchy or squishy?",
      narration: { audio: A("apply-sort-crunchy-squishy"), script: "Sorting time. Crunchy things snap and crackle when you bite them or step on them. Squishy things squash down soft. Read each tile and picture that thing in real life. Then drag it to Crunchy or to Squishy." },
      interaction: { type: "sort", buckets: ["Crunchy","Squishy"], items: [{ label: "a pretzel", bucket: "Crunchy" }, { label: "a marshmallow", bucket: "Squishy" }, { label: "dry leaves", bucket: "Crunchy" }, { label: "a wet sponge", bucket: "Squishy" }, { label: "an apple", bucket: "Crunchy" }, { label: "wet mud", bucket: "Squishy" }], coachWrong: "Picture that thing in real life. Does it snap and crackle, or does it squash down soft? Try again!" },
    },
    {
      id: "apply-choose-spicy-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sentence makes real-life sense?",
      narration: { audio: A("apply-choose-spicy-sentence"), script: "A word only makes sense where it fits in real life. Spicy is a taste word. Spicy food feels hot and zingy on your tongue, and it can make you reach for water. Only something you eat can be spicy. Read each sentence. Tap the sentence that makes real-life sense." },
      interaction: { type: "choose", options: [{ id: "salsa", label: "The salsa was spicy." }, { id: "rug", label: "The rug was spicy." }, { id: "snow", label: "The snow was spicy." }, { id: "book", label: "The book was spicy." }], correctId: "salsa", coachWrong: "Spicy is a taste word, so it only fits something you can eat. Read each sentence again. Try again!" },
    },
    {
      id: "challenge-speak-sticky",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Name something sticky.",
      narration: { audio: A("challenge-speak-sticky"), script: "Challenge time, and this is all you. Sticky things grab your fingers and do not want to let go. Tape is sticky. Now search your own world. Think of one more thing that is sticky. Tap the mic and name your sticky thing." },
      interaction: { type: "speak", text: "glue tape honey gum syrup jam jelly slime candy lollipop frosting caramel sap sticker stickers paste marshmallow" },
    },
    {
      id: "challenge-speak-cheer-place",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Name a place where you would cheer.",
      narration: { audio: A("challenge-speak-cheer-place"), script: "Last one. Think about cheering, that big happy sound you make for a team. Where could you cheer as loud as you want? Tap the mic and name a place where cheering belongs." },
      interaction: { type: "speak", text: "ballgame game stadium field soccer baseball football basketball race parade party concert gym recess playground outside" },
    },
    {
      id: "celebrate-words-connected",
      purpose: "celebrate",
      gate: "none",
      prompt: "You connected words to your world!",
      fx: {"text":"Your words live in the **real world**!","effect":"fireworks"},
      narration: { audio: A("celebrate-words-connected"), script: "You connected words to the real world today. Juicy fits a peach. A whisper belongs in the library. Cheering belongs at the ballgame. And you named sticky things and cheering places all on your own. Every new word you meet connects to something real. Keep finding those connections in your world!" },
    },
  ],
};
