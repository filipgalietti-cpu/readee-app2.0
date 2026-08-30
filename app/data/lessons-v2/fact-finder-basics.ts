import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-finder-basics-timings.json";

// Fact Finder Basics (RI.K.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-finder-basics

const A = (id: string) => `/audio/lessons-v2/fact-finder-basics/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/fact-finder-basics/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-finder-basics/${w.toLowerCase()}.png`;

export const factFinderBasicsImages: Record<string, string | { subject: string; ref?: string }> = {
  "owl": "A friendly, realistic cartoon owl with big round yellow eyes and soft brown feathers, perched on a tree branch. Friendly nonfiction illustration, the owl looks and acts like a real owl.",
  "awake": { subject: "The brown owl with wide, alert yellow eyes perched on a branch under a dark blue night sky with a crescent moon and stars.", ref: "owl" },
  "sleep": { subject: "The brown owl with eyes closed, sleeping inside a tree hollow, bright daytime sky behind the tree.", ref: "owl" },
  "eat": { subject: "The brown owl flying low over the grass with wings spread and yellow talons reaching down toward a small grey mouse running on the ground below.", ref: "owl" },
  "turn": { subject: "The brown owl perched on a branch with its back and folded brown wings facing the viewer, but its head rotated completely backward so its face and big yellow eyes look straight at the viewer over its back.", ref: "owl" },
  "head": { subject: "A close-up of the brown owl's face and head with big round yellow eyes.", ref: "owl" },
  "tail": { subject: "The brown owl seen from behind on a branch, showing its short brown tail feathers.", ref: "owl" },
  "wings": { subject: "The brown owl with both large feathered wings spread wide open.", ref: "owl" },
  "play": { subject: "The brown owl hopping on green grass after a drifting orange leaf.", ref: "owl" },
  "bear": "A brown bear standing on four legs in a green forest. Friendly nonfiction illustration, the bear looks and acts like a real bear.",
  "fish": "An orange fish swimming in clear blue water. Friendly nonfiction illustration.",
  "mice": "A small grey mouse with big round ears sitting on the ground. Friendly nonfiction illustration.",
  "bugs": "Three small colorful beetles crawling on a big green leaf.",
  "seeds": "A small pile of brown sunflower seeds on the ground."
};

export const factFinderBasics: LessonDef = {
  id: "fact-finder-basics",
  title: "Fact Finder Basics",
  grade: "Kindergarten",
  standard: "RI.K.1",
  archetype: "story-elements",
  objective: "I can ask and answer questions about facts.",
  concepts: ["RI.K.1","story-elements","ask and answer questions","key details","fact book"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super fact finder! You learned to ask questions and find answers in our owl book. Keep finding facts everywhere you go!",
    "title": "Fact Finder Expert!",
    "body": "You mastered asking and answering questions about key details in a fact book!"
  },
  scenes: [
    {
      id: "intro-fact-finders",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Let's find owl facts!",
      fx: {"text":"Let's find **owl facts**!","effect":"pop-words"},
      narration: { audio: A("intro-fact-finders"), script: "Welcome, fact finders! A fact is something that is true. Today we will read a fact book about real owls. Then we will ask and answer questions to find the key facts. Let's go!" },
    },
    {
      id: "model-ask-questions",
      purpose: "model",
      gate: "none",
      prompt: "Fact finders ask questions!",
      fx: {"text":"We can ask **who**, **what**, and **where** questions.","effect":"pop-words"},
      narration: { audio: A("model-ask-questions"), script: "Fact finders ask questions. We can ask who, what, and where questions to learn new things. First, let's read our owl fact book. Keep your ears open for facts!" },
    },
    {
      id: "read-page-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 1. Listen and follow!",
      image: IMG("awake"),
      narration: { audio: A("read-page-1"), script: "Here is page one of our fact book. Watch the words light up while I read. Follow along with your eyes!" },
      interaction: { type: "read-along", text: "Owls are awake at night.", audio: A("read-page-1-sentence") },
    },
    {
      id: "read-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 2. Read along!",
      image: IMG("sleep"),
      narration: { audio: A("read-page-2"), script: "Owls are up all night! Here is page two. Read along with me!" },
      interaction: { type: "read-along", text: "Owls sleep in trees in the day.", audio: A("read-page-2-sentence") },
    },
    {
      id: "read-page-3",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 3. Keep reading!",
      image: IMG("eat"),
      narration: { audio: A("read-page-3"), script: "Here is page three. Eyes on the words!" },
      interaction: { type: "read-along", text: "Owls eat mice.", audio: A("read-page-3-sentence") },
    },
    {
      id: "read-page-4",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 4. One more fact!",
      image: IMG("turn"),
      narration: { audio: A("read-page-4"), script: "One more fact. Here is page four. Read along!" },
      interaction: { type: "read-along", text: "Owls turn their heads far around.", audio: A("read-page-4-sentence") },
    },
    {
      id: "model-ask-answer-where",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find a fact!",
      image: IMG("sleep"),
      narration: { audio: A("model-ask-answer-where"), script: "Watch me ask and answer a question. I wonder, where do owls sleep? Hmm. I will look back at our fact book. Page two said: Owls sleep in trees in the day. I found the answer! Owls sleep in trees." },
    },
    {
      id: "guided-ask-who",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is our book about?",
      narration: { audio: A("guided-ask-who"), script: "Now you try! Here is a who question: who is our fact book about? Think back. Our book said: Owls are awake at night. So, who is our fact book about? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "owl", label: "OWL", audio: W("owl"), image: IMG("owl") }, { id: "bear", label: "BEAR", audio: W("bear"), image: IMG("bear") }, { id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }], correctId: "owl", coachWrong: "Think back to our fact book. Every fact told about the same animal. Which animal did we read about? Try again!" },
    },
    {
      id: "guided-ask-what-eat",
      purpose: "guided",
      gate: "interaction",
      prompt: "What do owls eat?",
      narration: { audio: A("guided-ask-what-eat"), script: "Great fact finding! Here is a what question. Listen to page three again: Owls eat mice. Now answer: what do owls eat? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "mice", label: "MICE", audio: W("mice"), image: IMG("mice") }, { id: "bugs", label: "BUGS", audio: W("bugs"), image: IMG("bugs") }, { id: "seeds", label: "SEEDS", audio: W("seeds"), image: IMG("seeds") }], correctId: "mice", coachWrong: "Look back at page three of our fact book. What food did it name? Try again!" },
    },
    {
      id: "apply-say-where",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where do owls sleep?",
      fx: {"text":"Owls sleep in **trees**.","effect":"underline"},
      narration: { audio: A("apply-say-where"), script: "Now say an answer like a fact finder! Here is a where question: where do owls sleep? Look at our fact on the screen, press the mic, and say the answer word out loud!" },
      interaction: { type: "speak", text: "trees" },
    },
    {
      id: "apply-what-turn",
      purpose: "apply",
      gate: "interaction",
      prompt: "What can owls turn far around?",
      narration: { audio: A("apply-what-turn"), script: "Here is a tricky what question. Listen to page four again: Owls turn their heads far around. Now answer: what can owls turn far around? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "head", label: "HEAD", audio: W("head"), image: IMG("head") }, { id: "tail", label: "TAIL", audio: W("tail"), image: IMG("tail") }, { id: "wings", label: "WINGS", audio: W("wings"), image: IMG("wings") }], correctId: "head", coachWrong: "Think about page four. Which body part can owls turn far around? Try again!" },
    },
    {
      id: "challenge-night",
      purpose: "challenge",
      gate: "interaction",
      prompt: "At night, owls are...",
      narration: { audio: A("challenge-night"), script: "Challenge time, fact finders! Think back to page one of our fact book. It told a fact about owls at night. Can you remember it? At night, owls are... what? The pictures can help you. Tap your best answer." },
      interaction: { type: "choose", options: [{ id: "awake", label: "AWAKE", audio: W("awake"), image: IMG("awake") }, { id: "asleep", label: "ASLEEP", audio: W("asleep"), image: IMG("sleep") }, { id: "playing", label: "PLAYING", audio: W("playing"), image: IMG("play") }], correctId: "awake", coachWrong: "Listen for the fact about night. What did page one say owls are at night? Try again!" },
    },
    {
      id: "celebrate-lesson-complete",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You found the facts!",
      fx: {"text":"You are a super fact finder!","effect":"fireworks"},
      narration: { audio: A("celebrate-lesson-complete"), script: "You did it! You asked who, what, and where questions, and you found the answers in our fact book. You are a real fact finder! Keep finding facts everywhere you go!" },
    },
  ],
};
