import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./rule-breaker-words-timings.json";

// Rule Breaker Words (L.2.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=rule-breaker-words
// G2 grammar umbrella, the IRREGULAR tier (G1 grammar-builders did noun-verb
// match / pronouns / sentences; G1 ending-readers did REGULAR -s/-ed/-ing).
// Three lanes: irregular plurals (foot/feet, tooth/teeth, mouse/mice, man/men,
// goose/geese), irregular past verbs (sit/sat, tell/told, run/ran, hide/hid),
// collective nouns (flock of birds, herd of cows, school of fish). Adjective/
// adverb lane lives in describe-it-better (L.2.6), skipped here on purpose.
// "Rule breaker" framing is a deliberate callback to heart-words (spelling
// rule breakers); "learn them by heart" line ties the two. QUIZ word sets are
// disjoint by design: child/children, woman/women, person/people, sheep/deer,
// ate/flew/swam/came/went-gone, swarm/pack/litter live in the quiz only.

const A = (id: string) => `/audio/lessons-v2/rule-breaker-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/rule-breaker-words/${w.toLowerCase()}.png`;

export const ruleBreakerWordsImages: Record<string, string> = {
  "mice-shoe": "Two small grey cartoon mice standing on a grassy pond bank looking up at one big red sneaker, a white goose watching kindly from the water, plain blue sky, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "cow-field": "A group of five brown and white cows grazing close together in a bright green field, a low wooden fence far behind them, plain blue sky, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "fish-stream": "A big group of small silver and orange fish all swimming in the same direction through clear blue water, smooth round rocks on the sandy bottom, no people, no faces on rocks. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  // quiz easier-band support image (e-4-sheep-same); not referenced by lesson scenes
  "sheep-hill": "One fluffy white sheep standing at the front of a green hill with ten more fluffy white sheep walking up the slope behind it, plain blue sky, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const ruleBreakerWords: LessonDef = {
  id: "rule-breaker-words",
  title: "Rule Breaker Words",
  grade: "2nd Grade",
  standard: "L.2.1",
  archetype: "vocabulary",
  objective: "I can pick the rule breaker words that mean more than one, tell about yesterday, and name a group.",
  concepts: ["some plurals change inside instead of adding s (one foot, two feet, never foots)", "some yesterday verbs skip ed and change instead (today I sit, yesterday I sat)", "groups get their own special names, collective nouns (a flock of birds, a herd of cows)", "when a word breaks the rules, you learn it by heart"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are ready for rule breaker words now. Feet, teeth, and mice change on the inside instead of taking s, and sat, told, and hid skip the e d completely. And when you spot birds flying together, you can call them what they really are. A flock!",
    "title": "Rule Breaker Expert!",
    "body": "You picked real plurals like feet, matched yesterday words like sat and told, and named a flock, a herd, and a school."
  },
  scenes: [
    {
      id: "hook-shoe-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read the story of the red shoe with me.",
      image: IMG("mice-shoe"),
      narration: { audio: A("hook-shoe-story"), script: "Hello, reader. You know the grammar rules. Add s to mean more than one. Add e d to tell about yesterday. But a few words refuse to follow those rules. This little story is packed with them. Read it with me, and see if you can feel which words play by their own rules." },
      interaction: { type: "read-along", text: "Yesterday two mice found one red shoe by the pond. They wanted shoes for all four of their feet. An old goose sat on the bank and watched them. The mice told her about the shoe. Soon a flock of geese waddled over to see it. Not one goose had shoes either. The shoe did not fit their wide orange feet. So the two mice hid it and ran home.", audio: A("hook-shoe-story-sentence") },
    },
    {
      id: "model-foot-feet",
      purpose: "model",
      gate: "none",
      prompt: "One foot, two feet. Never foots!",
      fx: {"text":"one **foot**, two **feet**","effect":"magic"},
      narration: { audio: A("model-foot-feet"), script: "Here is the first kind of rule breaker. The rule says add s for more than one. One cat, two cats. Now try that with foot. One foot, two foots? No! English says feet. The middle of the word changes instead. One foot, two feet. And foot has friends. One man, two men. One goose, a whole line of geese. Words like these break the plural rule, so readers learn them by heart." },
    },
    {
      id: "guided-choose-teeth",
      purpose: "guided",
      gate: "interaction",
      prompt: "One tooth, many ___. Tap the real word.",
      narration: { audio: A("guided-choose-teeth"), script: "Your turn. A shark can lose a tooth and grow a new one right back, so its mouth stays full of them. One tooth, many blank. Three of these are fake words. Only one is real. Read each one carefully, then tap the real word." },
      interaction: { type: "choose", options: [{ id: "teeth", label: "teeth" }, { id: "tooths", label: "tooths" }, { id: "toothes", label: "toothes" }, { id: "teeths", label: "teeths" }], correctId: "teeth", coachWrong: "Careful! Sticking s on the end of tooth makes a fake word. This rule breaker changes in the middle, like foot to feet. Try again!" },
    },
    {
      id: "apply-speak-mice",
      purpose: "apply",
      gate: "interaction",
      prompt: "One mouse. Two or three of them? Say the rule breaker word.",
      narration: { audio: A("apply-speak-mice"), script: "Now you say one. In the story, one small mouse had a friend, so there were two of them. Careful, do not add s. This word changes on the inside, just like foot and feet. Say the word that means more than one mouse." },
      interaction: { type: "speak", text: "mice mice" },
    },
    {
      id: "model-sit-sat",
      purpose: "model",
      gate: "none",
      prompt: "Yesterday words can break the rules too.",
      fx: {"text":"Today I **sit**. Yesterday I **sat**.","effect":"pop-words"},
      narration: { audio: A("model-sit-sat"), script: "Rule breakers hide in action words too. The rule says add e d to tell about yesterday. Today I jump. Yesterday I jumped. Now try sit. Yesterday I sitted? No! English says sat. Today I sit. Yesterday I sat. Remember the old goose in our story? She sat on the bank. No e d anywhere. The whole word changed instead." },
    },
    {
      id: "guided-choose-told",
      purpose: "guided",
      gate: "interaction",
      prompt: "Yesterday Gran ___ me a story. Tap the word that fits.",
      narration: { audio: A("guided-choose-told"), script: "Your turn. Every night, Gran tells me a story. Last night she did it again. So, yesterday Gran blank me a story. One of these is the real yesterday form. Read all four, then tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "told", label: "told" }, { id: "telled", label: "telled" }, { id: "tells", label: "tells" }, { id: "tell", label: "tell" }], correctId: "told", coachWrong: "That form does not fit yesterday. This verb is a rule breaker. No e d. The word changes on the inside. Try again!" },
    },
    {
      id: "apply-sort-today-yesterday",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the action words: today or yesterday.",
      narration: { audio: A("apply-sort-today-yesterday"), script: "Sorting time. Some of these action words tell about today. The others tell about yesterday, and not one of them uses e d. Read each word, think about when it happens, and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Today","Yesterday"], items: [{ label: "sit", bucket: "Today" }, { label: "sat", bucket: "Yesterday" }, { label: "tell", bucket: "Today" }, { label: "told", bucket: "Yesterday" }, { label: "run", bucket: "Today" }, { label: "ran", bucket: "Yesterday" }], coachWrong: "Try that word in a sentence. Today I blank, or yesterday I blank. Which one sounds right? Try again!" },
    },
    {
      id: "apply-speak-hid",
      purpose: "apply",
      gate: "interaction",
      prompt: "Yesterday the dog ___ under the bed. Say the missing word.",
      narration: { audio: A("apply-speak-hid"), script: "Finish my sentence out loud. My dog loves to hide under the bed. Yesterday he did it again. So, yesterday the dog blank under the bed. No e d on this one. The word changes instead. Say the missing word now." },
      interaction: { type: "speak", text: "hid hid" },
    },
    {
      id: "model-group-names",
      purpose: "model",
      gate: "none",
      prompt: "Groups get their own special names.",
      fx: {"text":"a **flock** of birds","effect":"underline"},
      narration: { audio: A("model-group-names"), script: "One more kind of rule breaker, and this one is pure fun. English gives groups their own names. Birds flying together are not a bird bunch. They are a flock. A flock of birds. Cows grazing together make a herd of cows. And fish? Fish swimming together make a school. Yes, a school of fish! Group names like these are called collective nouns." },
    },
    {
      id: "guided-choose-herd",
      purpose: "guided",
      gate: "interaction",
      prompt: "A ___ of cows grazed in the field.",
      image: IMG("cow-field"),
      narration: { audio: A("guided-choose-herd"), script: "Look at all those cows moving together. They make one group with one special name. A blank of cows grazed in the field. All four words are real group names, but only one belongs to cows. Tap it." },
      interaction: { type: "choose", options: [{ id: "herd", label: "herd" }, { id: "flock", label: "flock" }, { id: "school", label: "school" }, { id: "swarm", label: "swarm" }], correctId: "herd", coachWrong: "That group name belongs to a different animal team. Which one did we give the cows? Try again!" },
    },
    {
      id: "apply-choose-school",
      purpose: "apply",
      gate: "interaction",
      prompt: "A ___ of fish swam past the rocks.",
      image: IMG("fish-stream"),
      narration: { audio: A("apply-choose-school"), script: "Here come the fish, dozens of them turning together like one silver cloud. A blank of fish swam past the rocks. Read each group name, then tap the one that belongs to fish." },
      interaction: { type: "choose", options: [{ id: "school", label: "school" }, { id: "herd", label: "herd" }, { id: "pack", label: "pack" }, { id: "flock", label: "flock" }], correctId: "school", coachWrong: "Close! That name belongs to a different group of animals. Fish have a surprising one. Try again!" },
    },
    {
      id: "apply-find-breaker",
      purpose: "apply",
      gate: "interaction",
      prompt: "The men played ball in the park. Tap the rule breaker.",
      narration: { audio: A("apply-find-breaker"), script: "One more hunt, and it is a sneaky one. Read this sentence. The men played ball in the park. One of these words means more than one, but it never took an s. It changed on the inside instead. Read each word, then tap the rule breaker." },
      interaction: { type: "choose", options: [{ id: "men", label: "men" }, { id: "played", label: "played" }, { id: "ball", label: "ball" }, { id: "park", label: "park" }], correctId: "men", coachWrong: "That word plays fair. Hunt for the word that means more than one without any s on it. Try again!" },
    },
    {
      id: "challenge-speak-geese",
      purpose: "challenge",
      gate: "interaction",
      prompt: "One goose. A whole flock of them? Say the rule breaker word.",
      narration: { audio: A("challenge-speak-geese"), script: "Last challenge, all by yourself. In the story, one old goose sat on the bank. Then a whole flock of them waddled over. Do not add s to goose. The word changes on the inside. Say the word that means more than one goose." },
      interaction: { type: "speak", text: "geese geese" },
    },
    {
      id: "celebrate-rule-breakers",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You caught the rule breakers!",
      fx: {"text":"**feet**, **sat**, a **flock** of birds","effect":"fireworks"},
      narration: { audio: A("celebrate-rule-breakers"), script: "What a lesson. You caught rule breakers everywhere. Feet, teeth, and mice instead of adding s. Sat, told, and hid instead of adding e d. And those group names! A flock of birds, a herd of cows, a school of fish. When a word breaks the rules, you know it by heart now. Go catch some more!" },
    },
  ],
};
