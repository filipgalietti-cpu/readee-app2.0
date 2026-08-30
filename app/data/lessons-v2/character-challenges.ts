import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./character-challenges-timings.json";

// Character Challenges (RL.2.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=character-challenges
// G2: original story "Mochi Runs Off", 8 sentences over 4 child-read pages.

const A = (id: string) => `/audio/lessons-v2/character-challenges/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/character-challenges/${w.toLowerCase()}.png`;

export const characterChallengesImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover illustration of a smiling young boy with short black hair in a green t-shirt walking a small fluffy white dog on a blue leash through a sunny green park with trees, a winding path, and a swing set in the distance, framed like a picture book cover, no text anywhere",
  "page-1": { subject: "The same small fluffy white dog leaping forward chasing a grey squirrel across a sunny park path, an empty blue leash flying loose in the air behind the dog, the same surprised young boy with short black hair in a green t-shirt holding the leash handle, green park with trees", ref: "cover" },
  "page-2": { subject: "The same young boy with short black hair in a green t-shirt standing very still on a park path, one hand cupped beside his mouth calling out, holding an empty blue leash, dark grey clouds rolling in overhead with thin streaks of rain starting to fall, green park, no dog anywhere in the picture", ref: "page-1" },
  "page-3": { subject: "The same young boy with short black hair in a green t-shirt hurrying through heavy rain in a green park with a worried face, peering behind a green bush, holding the empty blue leash, puddles on the path, a park bench and a slide nearby, no dog anywhere in the picture", ref: "page-2" },
  "page-4": { subject: "The same young boy with short black hair in a green t-shirt laughing and hugging the same small fluffy white dog now splattered with brown mud, beside a swing set in a green park just after rain, shining puddles on the ground, warm light breaking through the clouds", ref: "page-3" }
};

export const characterChallenges: LessonDef = {
  id: "character-challenges",
  title: "Character Challenges",
  grade: "2nd Grade",
  standard: "RL.2.3",
  archetype: "story-elements",
  objective: "I can describe how a character responds to major events and challenges in a story.",
  concepts: ["major events","character responses","what characters do","how characters feel","feelings change across a story","event versus response"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole story, and you tracked every response. When Mochi slipped his leash, Kenji stayed calm and called. When the rain fell, he felt worried and searched faster. When he found Mochi safe, he laughed with relief and hugged him. Events pile up, and characters respond with actions and feelings. Now you know how to track them in every story you read.",
    "title": "You Tracked Every Response!",
    "body": "You read a whole story and described how Kenji responded to each big event with actions and feelings."
  },
  scenes: [
    {
      id: "hook-events-responses",
      purpose: "hook",
      gate: "none",
      prompt: "Big events make characters respond.",
      image: IMG("cover"),
      fx: {"text":"What did they **do**? How did they **feel**?","effect":"pop-words"},
      narration: { audio: A("hook-events-responses"), script: "Hello, reader! In every good story, something big happens to the character. Readers call that a major event. And every time a big event hits, the character responds: they do something, and they feel something. Today you will read a brand new story called Mochi Runs Off. As the events pile up, you will track each of Kenji's responses, what he does and how he feels." },
    },
    {
      id: "model-do-and-feel",
      purpose: "model",
      gate: "none",
      prompt: "Watch me track a response.",
      fx: {"text":"An **event** happens. The character **responds**.","effect":"underline"},
      narration: { audio: A("model-do-and-feel"), script: "Watch me do it first with a tiny story. Listen. Lena's block tower crashed to the floor. She took a deep breath and started building it again. First I find the event, the big thing that happened. The tower crashed. Now I track Lena's response. What did she DO? She took a breath and built it again. How did she FEEL? The story does not say, but her calm, steady actions show me she felt patient, not angry. Find the event, then ask what the character does and feels. That is how you track a response." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: On a sunny day, Kenji walked his dog, Mochi, in the park. A squirrel zipped by, and Mochi pulled so hard he slipped out of his leash.",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Time to read Mochi Runs Off. Page one is all yours. Take your time, sound out the tricky words, and read the whole page out loud." },
      interaction: { type: "speak", text: "On a sunny day Kenji walked his dog Mochi in the park A squirrel zipped by and Mochi pulled so hard he slipped out of his leash" },
    },
    {
      id: "check-event-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "What major event happened on page one?",
      narration: { audio: A("check-event-one"), script: "Great reading. Before we can track a response, we need the event. A major event is the big thing that changes the character's day. One big event ended page one. What happened? Tap the answer you can prove with the story's words." },
      interaction: { type: "choose", options: [{ id: "mochi-slipped-leash", label: "mochi slipped his leash" }, { id: "kenji-lost-red-ball", label: "kenji lost his red ball" }, { id: "park-gate-swung-shut", label: "the park gate swung shut" }, { id: "squirrel-stole-snack", label: "a squirrel stole a snack" }], correctId: "mochi-slipped-leash", coachWrong: "A major event changes everything for the character. Think about the very end of page one. What happened that made the walk go wrong?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Kenji stood very still and called Mochi's name in a calm, steady voice. But Mochi did not come back, and soon cold rain began to fall.",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Mochi is loose. How will Kenji respond? Page two is yours too. Read it out loud." },
      interaction: { type: "speak", text: "Kenji stood very still and called Mochi's name in a calm steady voice But Mochi did not come back and soon cold rain began to fall" },
    },
    {
      id: "check-response-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did Kenji do right after Mochi slipped away?",
      narration: { audio: A("check-response-one"), script: "Now track the response. A response is what a character does and feels after an event. Right after Mochi slipped away, page two showed Kenji's first response. What did Kenji do? Tap the answer you can prove." },
      interaction: { type: "choose", options: [{ id: "stood-still-called-calmly", label: "stood still, called calmly" }, { id: "chased-mochi-down-road", label: "chased mochi down the road" }, { id: "ran-home-for-help", label: "ran home to get help" }, { id: "yelled-at-the-squirrel", label: "yelled at the squirrel" }], correctId: "stood-still-called-calmly", coachWrong: "Read page two again in your mind. Kenji did two small things, one with his feet and one with his voice. Which choice tells both?" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "The rain is falling and Mochi is still missing. Here is page three. Read along with me." },
      interaction: { type: "read-along", text: "Now Kenji felt worried, so he searched faster and called out louder. He checked the bushes, the bench, and the slide, but he only found puddles.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-feeling-shift",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did Kenji's feeling change?",
      narration: { audio: A("check-feeling-shift"), script: "Events are piling up on Kenji. First his dog got loose, and now cold rain. At the start, Kenji stayed calm. Then the rain began, and page three names his new feeling. How did Kenji's feeling change? Tap the change." },
      interaction: { type: "choose", options: [{ id: "calm-to-worried", label: "from calm to worried" }, { id: "calm-to-sleepy", label: "from calm to sleepy" }, { id: "calm-to-proud", label: "from calm to proud" }, { id: "calm-to-bored", label: "from calm to bored" }], correctId: "calm-to-worried", coachWrong: "Page three names Kenji's new feeling in its very first words. Rain is falling and Mochi is still lost. Which new feeling fits that moment?" },
    },
    {
      id: "sort-event-response",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: event, or Kenji's response?",
      narration: { audio: A("sort-event-response"), script: "Sorting time. An event is something that happens to the character. A response is what the character does or feels about it. Look at each tile, ask yourself which one it is, and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Event","Response"], items: [{ label: "mochi slipped his leash", bucket: "Event" }, { label: "called mochi calmly", bucket: "Response" }, { label: "cold rain began to fall", bucket: "Event" }, { label: "searched faster, worried", bucket: "Response" }], coachWrong: "Ask yourself: did this happen to Kenji, or is it something Kenji did or felt about it? Happenings go in Event. Kenji's actions and feelings go in Response." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: At last, Kenji spotted Mochi by the swings, muddy from ears to tail. Kenji laughed with relief and gave his dog a great big hug.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "One page left. Did Kenji find Mochi? Read the ending out loud and find out." },
      interaction: { type: "speak", text: "At last Kenji spotted Mochi by the swings muddy from ears to tail Kenji laughed with relief and gave his dog a great big hug" },
    },
    {
      id: "check-why-response",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Why did Kenji laugh and hug his muddy dog?",
      narration: { audio: A("check-why-response"), script: "What an ending. At the end, Kenji laughed with relief and hugged his muddy dog. Why did he respond that way? The story does not say the reason straight out, so think about what Kenji finally saw near the swings, and how his whole search had felt. Tap the best reason." },
      interaction: { type: "choose", options: [{ id: "lost-dog-was-safe", label: "his lost dog was safe" }, { id: "mochi-won-a-prize", label: "mochi had won a prize" }, { id: "mud-looked-funny", label: "the mud looked funny" }, { id: "rain-had-stopped", label: "the rain had stopped" }], correctId: "lost-dog-was-safe", coachWrong: "Think about how worried Kenji felt out in the rain, and what he finally found by the swings. His laugh and his hug came from that feeling. Tap the reason that matches." },
    },
    {
      id: "track-feelings-story",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Track Kenji's feelings across the whole story.",
      narration: { audio: A("track-feelings-story"), script: "Here is the biggest job. Strong readers track a character's feelings across the whole story. Think about how Kenji felt at the start, how he felt out in the rain, and how he felt at the very end. The choices use the same feeling words, but only one shows them in the story's order. Tap it." },
      interaction: { type: "choose", options: [{ id: "calm-worried-relieved", label: "calm, worried, relieved" }, { id: "worried-relieved-calm", label: "worried, relieved, calm" }, { id: "relieved-worried-calm", label: "relieved, worried, calm" }, { id: "calm-relieved-worried", label: "calm, relieved, worried" }], correctId: "calm-worried-relieved", coachWrong: "Walk the story in order. How did Kenji feel when the walk began, then when the rain fell, then when he found Mochi? Tap the order that matches the story." },
    },
    {
      id: "speak-explain-response",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: when the rain started, what did Kenji do, and how did he feel?",
      narration: { audio: A("speak-explain-response"), script: "Last job. Explain a response in your own words. When the rain began to fall, what did Kenji do, and how did he feel? Tell me. Start with, Kenji felt." },
      interaction: { type: "speak", text: "worried searched search faster looked louder upset scared anxious hurried called checked" },
    },
    {
      id: "celebrate-response-tracker",
      purpose: "celebrate",
      gate: "none",
      prompt: "You tracked every response!",
      fx: {"text":"Event. **Response**. What did they do and feel?","effect":"fireworks"},
      narration: { audio: A("celebrate-response-tracker"), script: "You read a whole story, and you tracked every response. When Mochi slipped his leash, Kenji stayed calm and called. When the rain fell, he felt worried and searched faster. When he found Mochi safe, he laughed with relief and hugged him. Events pile up, and characters respond with actions and feelings. Now you know how to track them in every story you read." },
    },
  ],
};
