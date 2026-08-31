import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./describe-it-better-timings.json";

// Describe It Better (L.2.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=describe-it-better
// USING acquired words: adjectives (thing helpers) describe a thing; adverbs
// (action helpers) tell HOW an action happens, many ending in -ly. The adverb
// lane is untouched by any earlier lesson (grep-verified). Anchors verified
// FRESH vs same-and-opposite (quick/fast, loud/quiet, shiny/sparkly, smooth/bumpy),
// words-in-your-world (juicy/squishy/crunchy/spicy/sticky), word-ladders
// (pull/tug/yank, cry/sob/wail, smart/clever/brilliant), G1 strong-words /
// just-right-words verb ladders, G1 words-in-real-life (noisy/cozy/slippery/
// fresh/heavy/fragile). Lesson describers: old, wet, slowly, happily, crooked,
// gently, quietly, carefully, hungry, spiky, frosty, bravely, proudly, softly.

const A = (id: string) => `/audio/lessons-v2/describe-it-better/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/describe-it-better/${w.toLowerCase()}.png`;

export const describeItBetterImages: Record<string, string> = {
  "turtle-garden": "An old green turtle with a kind wrinkled face walking through bright wet grass with shiny dew drops, one big green leaf on the ground ahead of it, plain blue sky, no people, no faces on plants or objects. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "crooked-fence": "A crooked old wooden fence leaning far to one side beside a quiet dirt road, green grass and a few white daisies below, plain blue sky, no people, no animals, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "sleeping-dragon": "A big green dragon sleeping curled up at the mouth of a stone cave with eyes closed and a peaceful face, a small knight in silver armor tiptoeing past on his toes, plain sky, no fire, no scary details. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "icy-path": "A frozen sidewalk covered in patches of shiny pale blue ice in front of a small snowy house, a bare winter tree to one side, plain pale sky, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const describeItBetter: LessonDef = {
  id: "describe-it-better",
  title: "Describe It Better",
  grade: "2nd Grade",
  standard: "L.2.6",
  archetype: "vocabulary",
  objective: "I can use describing words, thing helpers and action helpers, to make flat sentences come alive.",
  concepts: ["adjectives are thing helpers: they describe a person, place, or thing (the old turtle)", "adverbs are action helpers: they tell how an action happens (walked slowly)", "many action helpers end in -ly (quietly, bravely, happily)", "pick the describing word that fits the moment"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can describe it better now. Thing helpers like old and wet paint a picture of the thing, and action helpers like slowly and quietly tell how an action happens. When a sentence feels flat, add a describing word and watch it wake up!",
    "title": "Describing Word Expert!",
    "body": "You found thing helpers and action helpers, picked the describers that fit the moment, and spoke your own."
  },
  scenes: [
    {
      id: "hook-flat-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read Tara's story with me.",
      image: IMG("turtle-garden"),
      narration: { audio: A("hook-flat-story"), script: "Hello, reader. Some sentences are flat. They tell you almost nothing. Today you will meet the words that fix them. Tara wrote a story for her little brother, but her first try made him yawn. Read her story with me, and watch what she adds to wake it up." },
      interaction: { type: "read-along", text: "Tara read her story out loud. The turtle walked. The turtle found a leaf. Her little brother yawned. Boring! So Tara added describing words and read it again. The old turtle walked slowly through the wet grass. He found a green leaf and munched it happily. Her brother's eyes went wide. More, more!", audio: A("hook-flat-story-sentence") },
    },
    {
      id: "model-thing-helpers",
      purpose: "model",
      gate: "none",
      prompt: "Old describes the turtle. Wet describes the grass.",
      fx: {"text":"the **old** turtle","effect":"underline"},
      narration: { audio: A("model-thing-helpers"), script: "Did you feel the story wake up? Tara used two kinds of describing words. The first kind describes a thing, a person, a place, or an animal. Old describes the turtle. It tells what kind of turtle to picture. Wet describes the grass. Teachers call these adjectives. I call them thing helpers, because they help you see the thing." },
    },
    {
      id: "model-action-helpers",
      purpose: "model",
      gate: "none",
      prompt: "Slowly tells how the turtle walked.",
      fx: {"text":"walked **slowly**","effect":"pop-words"},
      narration: { audio: A("model-action-helpers"), script: "Tara's second kind of describing word helps an action. Slowly tells how the turtle walked. Happily tells how he munched. Teachers call these adverbs. I call them action helpers, because they tell how an action happens. Here is a trick. Lots of action helpers end with the letters l y. Listen for that ending. Slowly. Happily. Quietly. Bravely." },
    },
    {
      id: "guided-find-thing",
      purpose: "guided",
      gate: "interaction",
      prompt: "The crooked fence leaned over the road. Which word describes the fence?",
      image: IMG("crooked-fence"),
      narration: { audio: A("guided-find-thing"), script: "Your turn to find a thing helper. Listen. The crooked fence leaned over the road. One of these words describes the fence. It tells what kind of fence to picture. Read each word. Tap the thing helper." },
      interaction: { type: "choose", options: [{ id: "crooked", label: "crooked" }, { id: "leaned", label: "leaned" }, { id: "road", label: "road" }, { id: "over", label: "over" }], correctId: "crooked", coachWrong: "A thing helper tells what kind of fence it is. Which word paints the fence in your mind? Try again!" },
    },
    {
      id: "guided-find-how",
      purpose: "guided",
      gate: "interaction",
      prompt: "The nurse wrapped the bandage gently. Which word tells how?",
      narration: { audio: A("guided-find-how"), script: "Now hunt for an action helper. Listen. The nurse wrapped the bandage gently. One word tells how she wrapped it. And remember the trick. Action helpers love to end with l y. Read each word. Tap the action helper." },
      interaction: { type: "choose", options: [{ id: "gently", label: "gently" }, { id: "wrapped", label: "wrapped" }, { id: "bandage", label: "bandage" }, { id: "nurse", label: "nurse" }], correctId: "gently", coachWrong: "That word does a different job. You want the word that tells how the nurse wrapped the bandage. Try again!" },
    },
    {
      id: "guided-upgrade-quietly",
      purpose: "guided",
      gate: "interaction",
      prompt: "The knight tiptoed ___ past the sleeping dragon.",
      image: IMG("sleeping-dragon"),
      narration: { audio: A("guided-upgrade-quietly"), script: "Describing words are a choice, and the moment decides. Listen. The knight tiptoed blank past the sleeping dragon. He did not want to wake it. Read each word. Tap the one that fits that moment best." },
      interaction: { type: "choose", options: [{ id: "quietly", label: "quietly" }, { id: "loudly", label: "loudly" }, { id: "quickly", label: "quickly" }, { id: "angrily", label: "angrily" }], correctId: "quietly", coachWrong: "The knight does not want the dragon to hear one single sound. Which word fits that? Try again!" },
    },
    {
      id: "apply-sort-helpers",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the describing words: thing helpers or action helpers.",
      narration: { audio: A("apply-sort-helpers"), script: "Sorting time. Every word here is a describing word. Read each one and think. Does it describe a thing, or does it tell how an action happens? The l y trick can help you. Drag each word to its team." },
      interaction: { type: "sort", buckets: ["Thing Helpers","Action Helpers"], items: [{ label: "spiky", bucket: "Thing Helpers" }, { label: "bravely", bucket: "Action Helpers" }, { label: "frosty", bucket: "Thing Helpers" }, { label: "proudly", bucket: "Action Helpers" }, { label: "crooked", bucket: "Thing Helpers" }, { label: "softly", bucket: "Action Helpers" }], coachWrong: "Try that word in a sentence. Does it tell what kind of thing, or how someone does something? Try again!" },
    },
    {
      id: "apply-upgrade-carefully",
      purpose: "apply",
      gate: "interaction",
      prompt: "The path was icy, so Nan walked ___.",
      image: IMG("icy-path"),
      narration: { audio: A("apply-upgrade-carefully"), script: "Pick the word that fits the moment. Listen. The path was icy, so Nan walked blank. She did not want to slip. Read each word. Tap the best fit." },
      interaction: { type: "choose", options: [{ id: "carefully", label: "carefully" }, { id: "happily", label: "happily" }, { id: "loudly", label: "loudly" }, { id: "hungrily", label: "hungrily" }], correctId: "carefully", coachWrong: "Nan is watching every single step so she does not slip. Which word matches that? Try again!" },
    },
    {
      id: "apply-find-both",
      purpose: "apply",
      gate: "interaction",
      prompt: "The hungry wolf howled loudly. Which word tells how it howled?",
      narration: { audio: A("apply-find-both"), script: "This sentence has both kinds of helper. Listen. The hungry wolf howled loudly. One word describes the wolf, and a different word tells how it howled. Careful now. Read each word. Tap only the word that tells how." },
      interaction: { type: "choose", options: [{ id: "loudly", label: "loudly" }, { id: "hungry", label: "hungry" }, { id: "howled", label: "howled" }, { id: "wolf", label: "wolf" }], correctId: "loudly", coachWrong: "Close! That word has a different job in the sentence. You want the one that tells how the howl sounded. Try again!" },
    },
    {
      id: "challenge-speak-thing",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a thing helper that describes a puppy.",
      narration: { audio: A("challenge-speak-thing"), script: "Challenge time. Picture a puppy in your mind. What kind of puppy is it? Think of one thing helper, one word that describes your puppy. Tap the mic and say your describing word." },
      interaction: { type: "speak", text: "fluffy soft furry small tiny little cute sweet brown black white spotted fuzzy playful happy wiggly fast" },
    },
    {
      id: "challenge-speak-how",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say how you would walk past a sleeping baby. Use an -ly word.",
      narration: { audio: A("challenge-speak-how"), script: "Last challenge. A baby is fast asleep in the next room, and you need to walk past the door. How would you walk? Think of an action helper that ends with l y. Tap the mic and say your word." },
      interaction: { type: "speak", text: "quietly slowly softly gently carefully calmly silently sneakily lightly" },
    },
    {
      id: "celebrate-describers",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can describe it better!",
      fx: {"text":"walked **slowly**, munched **happily**","effect":"fireworks"},
      narration: { audio: A("celebrate-describers"), script: "You can describe it better now. Thing helpers like old, wet, and crooked paint the thing. Action helpers like slowly, quietly, and bravely tell how it happens, and so many of them end with l y. When your own sentence feels flat, do what Tara did. Add a describing word, and watch your reader's eyes go wide!" },
    },
  ],
};
