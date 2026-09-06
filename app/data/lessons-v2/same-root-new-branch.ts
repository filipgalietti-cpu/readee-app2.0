import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./same-root-new-branch-timings.json";

// Same Root, New Branch (L.3.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=same-root-new-branch
// G3-U1 word-work lesson. KNOWN-ROOT-AS-CLUE tier of L.3.4: when a new word
// shares a root with a word the child already knows, the root is the clue.
// The move: find the root you know, borrow its meaning, test it in the
// sentence. G3 step-up over root-clues (L.2.4c, farm/camp/garden add-an-
// ending pairs): longer and less obvious relatives (company/companion,
// memory/memorize with the y-to-i shift, strong/strength, know/knowledge),
// roots buried inside a word (direct inside director), and FALSE FRIENDS
// (a carpet is not a pet for cars; pantry, pigeon, cabbage) so the sentence
// test is what keeps the borrowed meaning honest. Sibling split honored:
// word-changers (L.1.4c) owns G1 inflections look/help/play/jump; root-clues
// (L.2.4c) owns farm/camp/garden + fishing/dancer; new-word-new-meaning
// (L.3.4b) owns known word + known AFFIX composition; meaning-machines
// (RF.3.3a) owns affix meanings; long-word-trains (RF.3.3b) owns chunk
// decoding; read-around-the-word (L.3.4a) owns sentence-context clues. Every
// pair here is a root-sharing relative, never affix arithmetic. Frame = one
// story: Oona spends spring break at the Harbor Aquarium where her aunt
// Marisol is the director; cousin Tobias is her companion; the Friday tour.
// ANCHOR FRESHNESS grep-swept across all of lessons-v2 + quizzes-v2:
// companion, accompany, memorize, director, childhood, health, strength (as
// a root pair), knowledge, carpet, pantry, pigeon, cabbage, aquarium,
// stingray, clinic are catalog-first as stimuli; names Oona, Marisol, Tobias
// fresh (icicle, handle, signature, signal, creature, hamster, turtle, reef
// found burned and dropped). Speak texts carry no " my " (Speak.tsx
// exact-read flip). Tiles lowercase, audio-free, kebab ids, 28-char cap.

const A = (id: string) => `/audio/lessons-v2/same-root-new-branch/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/same-root-new-branch/${w.toLowerCase()}.png`;

export const sameRootNewBranchImages: Record<string, string> = {
  "aquarium-great-hall": "Inside a huge aquarium hall lit deep blue, a young girl with brown skin and two curly puffs of dark hair in a teal hoodie stands in front of an enormous glass tank full of colorful fish, a younger boy with short dark hair in a striped shirt beside her pointing at a fish, and a tall woman with long black hair in a navy blazer smiling behind them, light rippling on the floor. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "stingray-clinic-tank": "A small shallow round tank of clear water inside a bright clean animal clinic room, a young stingray gliding in the water, the same tall woman with long black hair now in a white coat leaning over the tank with a gentle smile, and the same young girl with brown skin and two curly puffs of dark hair in a teal hoodie watching beside her. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-sailor-boat": "A cheerful sailor in a blue and white striped shirt and a white cap steering a small white sailboat with a big white sail on calm blue water under a sunny sky, a seagull overhead. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags with marks, no writing anywhere.",
  "quiz-skater-rink": "A young girl in a purple jacket and white ice skates gliding across a shiny outdoor ice rink with one leg stretched behind her, snowy pine trees around the rink. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-hilly-road": "A winding country road rising and dipping over many rolling green hills, a small red bicycle rider climbing one of the hills, fluffy clouds in a blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const sameRootNewBranch: LessonDef = {
  id: "same-root-new-branch",
  title: "Same Root, New Branch",
  grade: "3rd Grade",
  standard: "L.3.4c",
  archetype: "vocabulary",
  objective: "I can find a root I know inside a new word, borrow its meaning, and test it in the sentence.",
  concepts: [
    "a new word that shares a root with a word you know carries that root's meaning",
    "find the root you know, borrow its meaning, test it in the sentence",
    "the root can hide at the front, in the middle, or with its spelling shifted a little",
    "some words only look like they share a root, and the sentence test catches them",
    "a false friend fails the test, so its borrowed meaning gets thrown out",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You have a move for long words now. Find the root you know, borrow its meaning, and test it in the sentence. Companion, director, memorize, childhood, health, strength, knowledge, and accompany each grew from a root you already knew, and each one passed the test. You also caught the false friends, because a carpet is not a pet for cars. Next time a long word looks new, look for the root inside it before you skip it.",
    "title": "Root Finder!",
    "body": "You found the root you knew inside new words, borrowed its meaning, and tested it in the sentence."
  },
  scenes: [
    {
      id: "hook-aquarium-great-hall",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about an aquarium. Read along!",
      image: IMG("aquarium-great-hall"),
      narration: { audio: A("hook-aquarium-great-hall"), script: "Hello, reader. Today you will learn a move third graders use on long words. When a new word shares a root with a word you already know, that root is your clue. The move starts at an aquarium. Read along with me, and watch for long words that hide a shorter word you know." },
      interaction: { type: "read-along", text: "Oona spent spring break at the Harbor Aquarium, where her aunt Marisol worked as the director and decided what every tank would hold. Her cousin Tobias was her constant companion, and he kept her company through every echoing hall. \"By Friday you will memorize the name of every animal in the great hall,\" said Aunt Marisol, \"because the tour is yours.\" Oona had a good memory, but thirty names made her stomach drop, so she started at the smallest tank. A silver fish darted past the glass, and she whispered its name until it stuck.", audio: A("hook-aquarium-great-hall-sentence") },
    },
    {
      id: "model-the-move",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find the root, borrow its meaning, and test it.",
      fx: {"text":"**Find** the root. **Borrow** its meaning. **Test** it.","effect":"pop-words"},
      narration: { audio: A("model-the-move"), script: "Companion might have stopped you. Here is the move. Find the root you know. Look inside companion, and you see company. You know company. When friends come over, you have company, and when someone stays with you, they keep you company. Borrow that meaning. A companion must be someone who keeps you company. Now test it in the sentence. Tobias was her constant companion, and he kept her company through every hall. It fits. Find the root, borrow its meaning, test it." },
    },
    {
      id: "model-buried-root-director",
      purpose: "model",
      gate: "none",
      prompt: "The root can hide at the front with letters after it.",
      fx: {"text":"**direct**or is the one who **direct**s","effect":"underline"},
      narration: { audio: A("model-buried-root-director"), script: "Now watch the root hide. Director. The root direct sits right at the front, with letters after it. To direct is to be in charge and tell people what to do, like a coach who directs the team. Borrow that meaning, and a director must be the person in charge. Test it. Aunt Marisol worked as the director and decided what every tank would hold. She is the one deciding, so it fits. When a long word looks new, read it from the front and ask, is there a word I know sitting in here?" },
    },
    {
      id: "guided-choose-root-memorize",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which root do you know inside memorize?",
      narration: { audio: A("guided-choose-root-memorize"), script: "Your turn to find the root. Memorize. Here is a hint about the spelling. In this word, the root's last letter changed. The letter y turned into the letter i before the ending. Read memorize from the front, find the word you already know inside it, and tap the root." },
      interaction: { type: "choose", options: [{ id: "memory", label: "memory" }, { id: "more", label: "more" }, { id: "rise", label: "rise" }, { id: "mime", label: "mime" }], correctId: "memory", coachWrong: "Read memorize from the very first letter. Which word you know starts the same way, with one letter changed near the end?" },
    },
    {
      id: "guided-choose-memorize-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does memorize mean here?",
      narration: { audio: A("guided-choose-memorize-meaning"), script: "You found the root. Now borrow its meaning and test it. Your memory is the part of you that holds on to names and facts. By Friday you will memorize the name of every animal in the great hall. Read all four, test each one in that sentence, and tap the meaning that fits." },
      interaction: { type: "choose", options: [{ id: "learn-it-so-you-remember-it", label: "learn it so you remember it" }, { id: "write-it-on-a-long-list", label: "write it on a long list" }, { id: "read-it-out-loud-one-time", label: "read it out loud one time" }, { id: "draw-it-on-a-big-poster", label: "draw it on a big poster" }], correctId: "learn-it-so-you-remember-it", coachWrong: "Borrow the meaning of the root. What does your memory do with a name? Which meaning carries that?" },
    },
    {
      id: "model-false-friend-carpet",
      purpose: "model",
      gate: "none",
      prompt: "Some words only look like they share a root.",
      fx: {"text":"a **car**pet is not a pet for cars","effect":"cross-out"},
      narration: { audio: A("model-false-friend-carpet"), script: "Here is the catch. Some words only look like they share a root. Carpet starts with car and ends with pet, but a carpet is not a pet for cars. It is a soft covering for a floor. Run the test, and the borrowed meaning falls apart, and that is how you know it is a false friend. Pantry looks like it holds pants, but a pantry is a small room for food, and pants have nothing to do with it. The test in the sentence is what keeps you honest. If the borrowed meaning does not fit, throw it out." },
    },
    {
      id: "guided-sort-same-root-or-looks",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each pair: Same Root, or Just Looks Like It?",
      narration: { audio: A("guided-sort-same-root-or-looks"), script: "Here are six pairs. Read the short word, then the long word, and run the test. If the long word truly carries the short word's meaning, drag the pair to Same Root. If the short word is only hiding in the letters, drag it to Just Looks Like It." },
      interaction: { type: "sort", buckets: ["Same Root","Just Looks Like It"], items: [{ label: "company, companion", bucket: "Same Root" }, { label: "pig, pigeon", bucket: "Just Looks Like It" }, { label: "direct, director", bucket: "Same Root" }, { label: "memory, memorize", bucket: "Same Root" }, { label: "cab, cabbage", bucket: "Just Looks Like It" }, { label: "child, childhood", bucket: "Same Root" }], coachWrong: "Borrow the short word's meaning and test it in the long word. Does the meaning truly fit, or do only the letters match?" },
    },
    {
      id: "apply-read-friday-tour",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The story continues. Read along!",
      image: IMG("stingray-clinic-tank"),
      narration: { audio: A("apply-read-friday-tour"), script: "Back to the aquarium. It is Friday, and this part of the story hides four new words that grew from roots you know. Read along with me, and run the move on every one that stops you." },
      interaction: { type: "read-along", text: "On Friday morning, a young stingray rested in the clinic tank, where it had healed from a cut on its tail, and Aunt Marisol checked its health before the doors opened. She had loved this place since childhood, so she told Oona the one trick she knew. \"Speak slowly, and let each name land,\" she said. Oona's voice shook at the first tank, but it gathered strength with every name after that. By the last tank, the visitors were nodding along, and Oona's knowledge of the great hall had become her own.", audio: A("apply-read-friday-tour-sentence") },
    },
    {
      id: "apply-choose-childhood-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does childhood mean here?",
      narration: { audio: A("apply-choose-childhood-meaning"), script: "She had loved this place since childhood. Find the root you know at the front of childhood, borrow its meaning, and test it in that sentence. Tap what childhood means." },
      interaction: { type: "choose", options: [{ id: "the-years-of-being-a-child", label: "the years of being a child" }, { id: "the-years-of-being-a-parent", label: "the years of being a parent" }, { id: "the-days-of-one-long-summer", label: "the days of one long summer" }, { id: "the-rooms-of-one-big-house", label: "the rooms of one big house" }], correctId: "the-years-of-being-a-child", coachWrong: "Look at the short word at the front of childhood, and borrow what it means before you test." },
    },
    {
      id: "apply-highlight-heal-words",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the two words that carry the root heal.",
      narration: { audio: A("apply-highlight-heal-words"), script: "One root is hiding twice in this sentence, once with an ending added, and once with its spelling changed a little. To heal is to get well again. Find both words that carry the root heal, and tap them." },
      interaction: { type: "highlight", text: "The stingray had healed from a cut on its tail, and Aunt Marisol checked its health before the doors opened.", targets: ["healed","health"], coachWrong: "Read each word from the front. Does it start with the root that means to get well again?" },
    },
    {
      id: "apply-choose-true-relative-know",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word truly carries the root know?",
      narration: { audio: A("apply-choose-true-relative-know"), script: "Four words start with the same two letters, the letters k and n. Only one of them truly carries the root know. Borrow the meaning of know. Test it on each word, and tap the one where that meaning truly fits. The other three are false friends." },
      interaction: { type: "choose", options: [{ id: "knowledge", label: "knowledge" }, { id: "knock", label: "knock" }, { id: "knot", label: "knot" }, { id: "knee", label: "knee" }], correctId: "knowledge", coachWrong: "That word starts with the same letters, but test it. Does its meaning have anything to do with knowing?" },
    },
    {
      id: "apply-speak-read-ending",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Tobias clapped from the back of the hall, and Aunt Marisol gave a small nod that said more than words. Oona looked at the smallest tank one more time, because that was where the whole tour had started.",
      narration: { audio: A("apply-speak-read-ending"), script: "The story ends after the tour, and these two sentences are yours to read. Read them out loud, clearly and with feeling." },
      interaction: { type: "speak", text: "Tobias clapped from the back of the hall and Aunt Marisol gave a small nod that said more than words Oona looked at the smallest tank one more time because that was where the whole tour had started" },
    },
    {
      id: "apply-speak-strength",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what strength means, and the root word that told you.",
      narration: { audio: A("apply-speak-strength"), script: "Now you run the whole move out loud. Oona's voice shook at the first tank, but it gathered strength with every name after that. Tap the mic, tell me what strength means in that sentence, and say the root word that told you." },
      interaction: { type: "speak", text: "strong stronger strongest power powerful force steady steadier firm sure surer confident bold bolder louder brave courage energy" },
    },
    {
      id: "challenge-choose-accompany",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does accompany mean here?",
      narration: { audio: A("challenge-choose-accompany"), script: "Last one, and it is brand new. Aunt Marisol asked Tobias to accompany Oona on the tour, so he walked one step behind her the whole way. Find the root you know inside accompany, borrow its meaning, test it in the sentence, and tap what accompany means." },
      interaction: { type: "choose", options: [{ id: "go-along-with-someone", label: "go along with someone" }, { id: "wait-outside-for-someone", label: "wait outside for someone" }, { id: "take-a-photo-of-someone", label: "take a photo of someone" }, { id: "write-a-note-to-someone", label: "write a note to someone" }], correctId: "go-along-with-someone", coachWrong: "Read accompany from the front and find the word you know hiding in the middle. Borrow its meaning, then test it." },
    },
    {
      id: "celebrate-same-root",
      purpose: "celebrate",
      gate: "none",
      prompt: "Find the root, borrow its meaning, test it.",
      fx: {"text":"**Same root,** new branch","effect":"fireworks"},
      narration: { audio: A("celebrate-same-root"), script: "You ran the move on every new word today. Find the root you know, borrow its meaning, and test it in the sentence. Companion, director, memorize, childhood, health, strength, knowledge, and accompany each grew from a root you already knew, and each one passed the test. You also caught the false friends, because a carpet is not a pet for cars, and a pigeon is not a pig. Next time a long word looks new, look for the root inside it before you skip it." },
    },
  ],
};
