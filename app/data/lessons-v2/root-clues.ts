import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./root-clues-timings.json";

// Root Clues (L.2.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=root-clues
// ROOT-FAMILY move: spot the known root hiding inside a big word and use its
// meaning as the clue. Lane check: word-math owns prefix MEANINGS (un-/re-),
// prefix-suffix-decoders owns DECODING affixed words, word-plus-word owns
// compounds. Families here are collision-free: farm, camp, garden (+ fishing,
// dancer as fresh transfer words). help/play/paint/sing/teach/care/read all
// avoided (anchored by word-changers and prefix-suffix-decoders).

const A = (id: string) => `/audio/lessons-v2/root-clues/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/root-clues/${w.toLowerCase()}.png`;

export const rootCluesImages: Record<string, string> = {
  "berry-farm": "A red barn beside rows of green berry bushes, a girl and her aunt picking ripe red berries into baskets on a sunny morning. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "lake-camp": "A cozy orange tent beside a calm blue lake, a small campfire and two camp chairs, tall pine trees behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "flower-garden": "A colorful flower garden in full bloom with a green watering can and a small trowel resting on the soil. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const rootClues: LessonDef = {
  id: "root-clues",
  title: "Root Clues",
  grade: "2nd Grade",
  standard: "L.2.4c",
  archetype: "vocabulary",
  objective: "I can use a small root word I know as a clue to a big word's meaning.",
  concepts: ["root words", "word families", "meaning clues"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You used root clues the whole way. When a big word hides a small word you know, that root tells you what the big word means. A farmer farms, a camper camps, and a gardener works in a garden. Hunt for root clues every time you read!",
    "title": "Root Clue Champ!",
    "body": "You found the small root words hiding inside big words and used them as clues to the meaning."
  },
  scenes: [
    {
      id: "hook-berry-farm-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the berry farm story with me.",
      image: IMG("berry-farm"),
      narration: { audio: A("hook-berry-farm-story"), script: "Hello, reader. Today you get a new word tool called a root clue. Some big words hide a small word you already know inside them. That small word is the root, and it points to what the big word means. Read the farm story with me and watch for big words with farm hiding inside." },
      interaction: { type: "read-along", text: "Rosa spent the summer on her aunt's berry farm. Her aunt is a farmer. Each morning they fed the hens and picked ripe berries. Rosa asked, \"Is farming hard work?\" Her aunt smiled. \"Farming keeps me busy, but I love it. Out here, no day is ever boring!\"", audio: A("hook-berry-farm-story-sentence") },
    },
    {
      id: "model-root-inside-farming",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find the root inside farming.",
      fx: {"text":"**farm**ing means doing **farm** work","effect":"underline"},
      narration: { audio: A("model-root-inside-farming"), script: "Look at farming. A small word you know is hiding right at the front. Farm. You know a farm, the place where food grows. So farming means doing farm work. That small word inside is called the root. Roots grow word families. Farm grows farming, farmer, and farms. When a big word looks new, hunt for the root inside. It is your clue." },
    },
    {
      id: "guided-choose-farmer-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a farmer?",
      narration: { audio: A("guided-choose-farmer-meaning"), script: "Your turn. Rosa's aunt is a farmer. Farmer hides the root farm. You know farm, so use the clue. Read each card. Tap what a farmer is." },
      interaction: { type: "choose", options: [{ id: "a-person-who-farms", label: "a person who farms" }, { id: "a-place-to-sleep", label: "a place to sleep" }, { id: "a-kind-of-food", label: "a kind of food" }, { id: "a-farm-that-is-small", label: "a farm that is small" }], correctId: "a-person-who-farms", coachWrong: "Find the root hiding inside farmer. Think about what that small word means, then pick the meaning that matches it. Try again!" },
    },
    {
      id: "guided-find-root-camper",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which small word hides inside camper?",
      narration: { audio: A("guided-find-root-camper"), script: "Here is a big word from a lake trip. Listen. The camper slept in a tent by the lake. Camper. One of these small words is hiding inside camper. Read each card. Tap the small word you can see inside camper." },
      interaction: { type: "choose", options: [{ id: "camp", label: "camp" }, { id: "tent", label: "tent" }, { id: "lake", label: "lake" }, { id: "sleep", label: "sleep" }], correctId: "camp", coachWrong: "Look at how camper starts. Which small word can you actually see inside it? Try again!" },
    },
    {
      id: "guided-choose-camper-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a camper?",
      image: IMG("lake-camp"),
      narration: { audio: A("guided-choose-camper-meaning"), script: "You found camp hiding inside camper. You know camp, sleeping and cooking outside in a tent. Use the root clue. Read each card. Tap what a camper is." },
      interaction: { type: "choose", options: [{ id: "a-person-who-camps", label: "a person who camps" }, { id: "a-person-who-swims", label: "a person who swims" }, { id: "a-kind-of-boat", label: "a kind of boat" }, { id: "a-very-small-tent", label: "a very small tent" }], correctId: "a-person-who-camps", coachWrong: "Camper hides the root camp. Think about what someone at a camp is doing. Try again!" },
    },
    {
      id: "apply-find-root-gardening",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which small word hides inside gardening?",
      narration: { audio: A("apply-find-root-gardening"), script: "New word family. Listen. Gram spends every Sunday gardening in her yard. Gardening. Find the small word hiding inside gardening. Read each card. Tap the root." },
      interaction: { type: "choose", options: [{ id: "garden", label: "garden" }, { id: "yard", label: "yard" }, { id: "grass", label: "grass" }, { id: "seeds", label: "seeds" }], correctId: "garden", coachWrong: "Read gardening slowly from the start. Which small word do you see inside it? Try again!" },
    },
    {
      id: "apply-speak-gardener",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tell me what a gardener is.",
      image: IMG("flower-garden"),
      narration: { audio: A("apply-speak-gardener"), script: "You found the root garden. Now meet a family member. Gardener. Gardener names a person. You know garden, so do the root move. Tap the mic and tell me what a gardener is." },
      interaction: { type: "speak", text: "gardens plants grows garden flowers" },
    },
    {
      id: "apply-sort-root-families",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word into its root family.",
      narration: { audio: A("apply-sort-root-families"), script: "Sorting time. Every word here grew from the root farm or the root camp. Read each word and spot the root hiding inside. If you see farm, drag it to farm words. If you see camp, drag it to camp words." },
      interaction: { type: "sort", buckets: ["farm words","camp words"], items: [{ label: "farmer", bucket: "farm words" }, { label: "camping", bucket: "camp words" }, { label: "farms", bucket: "farm words" }, { label: "camper", bucket: "camp words" }, { label: "farming", bucket: "farm words" }, { label: "camps", bucket: "camp words" }], coachWrong: "Read that word again slowly. Which root do you see at the start of it? Try again!" },
    },
    {
      id: "apply-choose-camping-sentence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which sentence uses camping the right way?",
      narration: { audio: A("apply-choose-camping-sentence"), script: "A family word still has to make sense in its sentence. Camping means staying and sleeping outside at a camp. Read each sentence. Tap the sentence that uses camping the right way." },
      interaction: { type: "choose", options: [{ id: "camping-by-the-lake", label: "We went camping by the lake." }, { id: "bowl-of-camping", label: "I ate a bowl of camping." }, { id: "camping-barked", label: "My camping barked all night." }, { id: "wore-camping", label: "He wore camping on his head." }], correctId: "camping-by-the-lake", coachWrong: "Think about what camping means. Which sentence could really happen with camping? Try again!" },
    },
    {
      id: "challenge-choose-fishing",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does fishing mean?",
      narration: { audio: A("challenge-choose-fishing"), script: "Challenge time. A brand new word. Listen. On Saturday we went fishing at the pond. Fishing. Hunt for the small word hiding inside, and let the root be your clue. Read each card. Tap what fishing means." },
      interaction: { type: "choose", options: [{ id: "trying-to-catch-fish", label: "trying to catch fish" }, { id: "flying-a-big-kite", label: "flying a big kite" }, { id: "baking-a-sweet-pie", label: "baking a sweet pie" }, { id: "raking-wet-leaves", label: "raking wet leaves" }], correctId: "trying-to-catch-fish", coachWrong: "Look inside fishing for a small word you know. That root tells you the meaning. Try again!" },
    },
    {
      id: "challenge-speak-dancer",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell me what a dancer is.",
      narration: { audio: A("challenge-speak-dancer"), script: "Last one, and this is all you. A new big word. Dancer. Find the root hiding inside it, then do the root move. Tap the mic and tell me what a dancer is." },
      interaction: { type: "speak", text: "dances dance dancing moves" },
    },
    {
      id: "celebrate-root-clues",
      purpose: "celebrate",
      gate: "none",
      prompt: "You cracked the root clues!",
      fx: {"text":"**Root clues** unlock big words!","effect":"fireworks"},
      narration: { audio: A("celebrate-root-clues"), script: "You used root clues the whole way. When a big word hides a small word you know, that root tells you what the big word means. A farmer farms, a camper camps, and a gardener works in a garden. Hunt for root clues every time you read!" },
    },
  ],
};
