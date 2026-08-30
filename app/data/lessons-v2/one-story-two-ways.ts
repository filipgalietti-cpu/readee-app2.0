import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./one-story-two-ways-timings.json";

// One Story, Two Ways (RL.2.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=one-story-two-ways
// G2: TWO original parallel versions of one stone-soup-shaped sharing tale,
// beat-for-beat: "Stone Soup" (Mira, snowy mountain village, potatoes/carrots/corn)
// and "Button Soup" (Nadia, sunny market town, rice/beans/red peppers).
// Teaching metaphor: same BONES (traveler, trick, sharing, lesson), different
// CLOTHES (place, name, thing in the pot, foods). Keys prefixed quiz- are
// fresh stimuli for the quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/one-story-two-ways/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/one-story-two-ways/${w.toLowerCase()}.png`;

export const oneStoryTwoWaysImages: Record<string, string | { subject: string; ref?: string }> = {
  "stone-soup-arrive": "A young woman traveler with a long dark braid, a red scarf, a patched brown coat, and a small travel pack, standing at the snowy edge of a little mountain village at night, warm yellow light glowing from the windows of small wooden houses, snow falling gently, tall pine trees and white mountain peaks behind the village, the traveler's face gentle and a little tired. No letters, no words, no numbers, no writing anywhere.",
  "stone-soup-share": { subject: "The same young woman traveler with a long dark braid, red scarf, and patched brown coat happily stirring a big black iron pot hanging over a crackling fire in a snowy village square at night, cheerful villagers in warm winter clothes gathered close holding wooden bowls, woven baskets of brown potatoes, orange carrots, and yellow corn cobs sitting beside the pot, steam rising, glowing lanterns, snowflakes drifting down", ref: "stone-soup-arrive" },
  "button-soup-arrive": "A young woman traveler with curly black hair, a bright yellow head wrap, a teal dress, and a small cloth shoulder bag, walking into a busy sunny market town plaza in golden evening light, colorful market stalls with striped cloth awnings, sellers arranging fruit and folded fabric, warm stone buildings around the plaza, the traveler's face gentle and a little tired. No letters, no words, no numbers, no writing anywhere.",
  "button-soup-share": { subject: "The same young woman traveler with curly black hair, yellow head wrap, and teal dress happily stirring a big round orange clay pot over a small fire in the middle of the sunny market plaza at dusk, smiling sellers and townsfolk gathered close holding clay bowls, woven baskets of white rice, brown beans, and sweet red peppers sitting beside the pot, steam rising, plain colorful triangle banners strung overhead", ref: "button-soup-arrive" },
  "quiz-cat-window": "A fluffy orange cat curled up fast asleep on a sunny windowsill inside a cozy home, golden sunlight streaming through the window onto its fur, a small potted plant beside it, peaceful closed eyes. No letters, no words, no numbers, no writing anywhere.",
  "quiz-puppy-dig": "A happy brown puppy digging a hole under a blooming pink rose bush in a green backyard, dirt flying behind its paws, a white bone half buried in the hole, blue sky above. No letters, no words, no numbers, no writing anywhere.",
  "quiz-cake-kitchen": "A smiling grandmother with grey hair in a bun and a blue apron proudly setting a golden round cake on a wooden kitchen table, steam rising from the cake, a sunny cozy kitchen with hanging pots behind her. No letters, no words, no numbers, no writing anywhere.",
  "quiz-kitten-rain": "A small grey kitten happily trotting close behind a young boy in a yellow raincoat and red boots on a rainy sidewalk, the boy looking back at the kitten with a kind smile, gentle rain falling, puddles on the pavement. No letters, no words, no numbers, no writing anywhere."
};

export const oneStoryTwoWays: LessonDef = {
  id: "one-story-two-ways",
  title: "One Story, Two Ways",
  grade: "2nd Grade",
  standard: "RL.2.9",
  archetype: "story-elements",
  objective: "I can compare two versions of the same story and tell what stays the same and what changes.",
  concepts: ["compare two versions","same story bones","different story clothes","stories across cultures","the lesson stays the same","retell one version"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read one story told two different ways. The bones never moved: a hungry traveler, a clever trick with a pot, and neighbors who learned that sharing makes plenty. The clothes changed: a snowy village became a sunny market town, a stone became a button, and potatoes became rice and peppers. Whenever you meet two versions of a story, hunt for what stays the same and what changes. That is real comparing.",
    "title": "One Story, Two Ways!",
    "body": "You compared two versions of the same story and found what stayed the same and what changed."
  },
  scenes: [
    {
      id: "hook-stories-travel",
      purpose: "hook",
      gate: "none",
      prompt: "One story can be told two ways.",
      fx: {"text":"**One** story, **two** tellings","effect":"pop-words"},
      narration: { audio: A("hook-stories-travel"), script: "Hello, reader! A really good story never stays in one place. It travels. And every place that catches it tells it again with its own names, its own foods, and its own weather. Today you will read the same story told two different ways: once in a snowy mountain village, and once in a sunny market town. Your job is to find what stays the same and what changes." },
    },
    {
      id: "model-same-bones",
      purpose: "model",
      gate: "none",
      prompt: "Watch me compare two tiny tellings.",
      fx: {"text":"Same **bones**, different **clothes**","effect":"underline"},
      narration: { audio: A("model-same-bones"), script: "Watch me compare two tiny tellings first. Telling one: a mouse in a red barn hides a seed in a farmer's boot. Telling two: a mouse in a big city hides a seed in a running shoe. Now I compare. What stayed the same? Both times, a mouse hides a seed. Those are the story's bones, the parts that hold it up. What changed? The barn became a city, and the boot became a running shoe. Those are the story's clothes, the outside parts a storyteller can swap. Same bones, different clothes. Keep that trick ready." },
    },
    {
      id: "story-a-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Version one: Stone Soup. Read along!",
      image: IMG("stone-soup-arrive"),
      narration: { audio: A("story-a-read"), script: "Here comes version one. Storytellers in the cold mountains call it Stone Soup. Read along with me, and keep your compare trick ready." },
      interaction: { type: "read-along", text: "One snowy night, a hungry traveler named Mira walked into a little mountain village. She knocked on every door and asked for food, but every neighbor said no. So Mira set a big iron pot of water on the fire. She dropped in one smooth stone. \"Stone soup!\" she called. \"It just needs one potato.\"", audio: A("story-a-read-sentence") },
    },
    {
      id: "story-a-ending",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the ending: Soon the whole village shared hot soup. Not one person went to bed hungry.",
      image: IMG("stone-soup-share"),
      narration: { audio: A("story-a-ending"), script: "The neighbors got curious. One ran home for a potato. Then came carrots. Then came corn. The pot filled right up. Now the ending is yours. Say it out loud, nice and clear." },
      interaction: { type: "speak", text: "Soon the whole village shared hot soup Not one person went to bed hungry" },
    },
    {
      id: "check-a-trick",
      purpose: "guided",
      gate: "interaction",
      prompt: "What made the neighbors bring food to the pot?",
      narration: { audio: A("check-a-trick"), script: "Think about version one. At the start, every neighbor said no. By the end, the pot was full of potatoes, carrots, and corn. What changed their minds? Tap it." },
      interaction: { type: "choose", options: [{ id: "miras-stone-soup-trick", label: "mira's stone soup trick" }, { id: "a-knock-at-every-door", label: "a knock at every door" }, { id: "a-prize-for-the-best-cook", label: "a prize for the best cook" }, { id: "a-kings-dinner-order", label: "a king's dinner order" }], correctId: "miras-stone-soup-trick", coachWrong: "The knocking only got a no from every door. Think about what Mira did with the pot that made everyone curious." },
    },
    {
      id: "story-b-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Version two: Button Soup. Read along!",
      image: IMG("button-soup-arrive"),
      narration: { audio: A("story-b-read"), script: "Now for version two. Storytellers in the warm market towns tell the very same story, but they call it Button Soup. Read along with me, and watch for what stays the same and what changes." },
      interaction: { type: "read-along", text: "One sunny evening, a hungry traveler named Nadia walked into a busy market town. She stopped at every stall and asked for food, but every seller said no. So Nadia set a big clay pot of water on the fire. She dropped in one shiny button. \"Button soup!\" she called. \"It just needs a little rice.\"", audio: A("story-b-read-sentence") },
    },
    {
      id: "story-b-ending",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the ending: Soon the whole town shared hot soup. Not one person went to bed hungry.",
      image: IMG("button-soup-share"),
      narration: { audio: A("story-b-ending"), script: "The sellers got curious too. One ran back for rice. Then came beans. Then came sweet red peppers. The pot filled right up. This ending is yours too. Say it out loud." },
      interaction: { type: "speak", text: "Soon the whole town shared hot soup Not one person went to bed hungry" },
    },
    {
      id: "compare-both-have",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which of these is in BOTH versions?",
      narration: { audio: A("compare-both-have"), script: "Compare time, just like the mouse tellings. Some parts showed up in both versions of the soup story. Some parts belong to only one version. Tap the part that both versions share." },
      interaction: { type: "choose", options: [{ id: "a-hungry-clever-traveler", label: "a hungry clever traveler" }, { id: "a-snowy-mountain-village", label: "a snowy mountain village" }, { id: "a-shiny-little-button", label: "a shiny little button" }, { id: "a-magic-talking-pot", label: "a magic talking pot" }], correctId: "a-hungry-clever-traveler", coachWrong: "Careful: some of those belong to only one version, and one of them is in neither story. Think about how both versions began." },
    },
    {
      id: "compare-cross-map",
      purpose: "apply",
      gate: "interaction",
      prompt: "Mira dropped a stone in her pot. What did Nadia drop in hers?",
      narration: { audio: A("compare-cross-map"), script: "Here is a sharp compare question. In the mountain version, Mira dropped one smooth stone into the pot. The market town version swaps that piece for something else. What did Nadia drop into her pot? Tap it." },
      interaction: { type: "choose", options: [{ id: "a-shiny-button", label: "a shiny button" }, { id: "a-smooth-stone", label: "a smooth stone" }, { id: "a-silver-coin", label: "a silver coin" }, { id: "a-sweet-red-pepper", label: "a sweet red pepper" }], correctId: "a-shiny-button", coachWrong: "The smooth stone belongs to Mira's version. Look back at Nadia's telling. What did she drop into the clay pot before calling out the name of her soup?" },
    },
    {
      id: "sort-same-different",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Same in Both, or Different?",
      narration: { audio: A("sort-same-different"), script: "Sorting time. Here are six story pieces. If a piece shows up the same way in both versions, drag it to Same in Both. If the two versions each do it their own way, drag it to Different. Take your time with each one." },
      interaction: { type: "sort", buckets: ["Same in Both","Different"], items: [{ label: "a hungry traveler", bucket: "Same in Both" }, { label: "the place it happens", bucket: "Different" }, { label: "a trick with a pot", bucket: "Same in Both" }, { label: "the thing in the pot", bucket: "Different" }, { label: "sharing at the end", bucket: "Same in Both" }, { label: "the foods people bring", bucket: "Different" }], coachWrong: "Ask yourself: did both tellings have this piece the same way, or did each telling swap in its own version of it?" },
    },
    {
      id: "compare-lesson",
      purpose: "apply",
      gate: "interaction",
      prompt: "Both versions end with the same lesson. What is it?",
      narration: { audio: A("compare-lesson"), script: "Here is the biggest bone of all: the lesson. The place changed, the foods changed, even the thing in the pot changed, but both versions end the exact same way, with full bowls and happy neighbors. What lesson do both versions teach? Tap it." },
      interaction: { type: "choose", options: [{ id: "sharing-makes-plenty", label: "sharing makes plenty" }, { id: "never-trust-a-stranger", label: "never trust a stranger" }, { id: "hard-work-beats-luck", label: "hard work beats luck" }, { id: "keep-your-food-hidden", label: "keep your food hidden" }], correctId: "sharing-makes-plenty", coachWrong: "Think about the ending of both tellings. Everyone gave a little, and then there was enough for every single bowl. What does that teach?" },
    },
    {
      id: "retell-stone-soup",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the mountain version in order.",
      narration: { audio: A("retell-stone-soup"), script: "Show me you can retell version one, Stone Soup. Here are four story cards, all mixed up. Think about what happened first, what happened next, and how it ended. Tap the cards in story order." },
      interaction: { type: "sequence", items: [{ id: "mira-arrives-hungry", label: "mira arrives hungry" }, { id: "every-neighbor-says-no", label: "every neighbor says no" }, { id: "a-stone-starts-the-soup", label: "a stone starts the soup" }, { id: "the-village-shares-supper", label: "the village shares supper" }], order: ["mira-arrives-hungry","every-neighbor-says-no","a-stone-starts-the-soup","the-village-shares-supper"], coachWrong: "Start with Mira walking into the snowy village. What happened right after she asked every door for food?" },
    },
    {
      id: "speak-same-and-different",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: one thing that stayed the same, or one thing that changed.",
      narration: { audio: A("speak-same-and-different"), script: "Now you talk like a story expert. Think about both tellings of the soup story. Tell me one thing that stayed the same in both, or one thing that changed between them. Say it in your own words." },
      interaction: { type: "speak", text: "traveler hungry trick pot soup share shared sharing lesson stone button village town market place setting foods potato potatoes rice beans corn carrots peppers supper mira nadia" },
    },
    {
      id: "challenge-two-more-tellings",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Two more tellings. What stayed the same?",
      narration: { audio: A("challenge-two-more-tellings"), script: "One last challenge, and this one is only for your ears, so listen closely. Here are two tellings of another traveling story. In the first telling, a grandpa plants a giant turnip in his garden, and his whole family pulls together until it pops out. In the second telling, a grandma plants a giant carrot in her field, and all her neighbors pull together until it pops out. What stayed the same in both tellings? Tap it." },
      interaction: { type: "choose", options: [{ id: "everyone-pulls-together", label: "everyone pulls together" }, { id: "a-giant-turnip-grows", label: "a giant turnip grows" }, { id: "a-grandma-plants-it", label: "a grandma plants it" }, { id: "it-grows-in-a-garden", label: "it grows in a garden" }], correctId: "everyone-pulls-together", coachWrong: "Careful: the turnip, the grandma, and the garden each belong to just one telling. Listen for the part both tellings kept." },
    },
    {
      id: "celebrate-story-traveler",
      purpose: "celebrate",
      gate: "none",
      prompt: "You compared two versions like an expert!",
      fx: {"text":"Same **bones**, different **clothes**","effect":"fireworks"},
      narration: { audio: A("celebrate-story-traveler"), script: "You did it! You read one story told two ways, and you caught everything. The bones stayed put: a hungry traveler, a clever trick with a pot, and a lesson about sharing. The clothes changed: the village became a market town, the stone became a button, and the potatoes became rice and peppers. Next time you meet two versions of a story, you know exactly what to hunt for." },
    },
  ],
};
