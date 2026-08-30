import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-toolbox-timings.json";

// Word Toolbox (L.1.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-toolbox

const A = (id: string) => `/audio/lessons-v2/word-toolbox/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-toolbox/${w.toLowerCase()}.png`;

export const wordToolboxImages: Record<string, string> = {
  "toolbox": "An open red metal toolbox on a wooden table with a hammer, a wrench, and a screwdriver inside, nothing else around it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "max-glum": "A young boy with brown hair standing in a sunny green park, brown mud splats on his yellow shirt, a sad glum face with a small frown, drooping shoulders, a small tan puppy sitting quietly beside him. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const wordToolbox: LessonDef = {
  id: "word-toolbox",
  title: "Word Toolbox",
  grade: "1st Grade",
  standard: "L.1.4",
  archetype: "vocabulary",
  objective: "I can use tools to figure out what a tricky word means.",
  concepts: ["reread the sentence","look at the picture","the sentence picks the meaning"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! Your word toolbox is full. You reread sentences, you looked at the picture, and you let each sentence pick the meaning of bark, bat, and ring. Use your toolbox every time you read!",
    "title": "Your Toolbox Is Full!",
    "body": "You used rereading, pictures, and sentence clues to unlock tricky words."
  },
  scenes: [
    {
      id: "hook-meet-the-toolbox",
      purpose: "hook",
      gate: "none",
      prompt: "Meet your word toolbox!",
      image: IMG("toolbox"),
      narration: { audio: A("hook-meet-the-toolbox"), script: "Hello, reader! Today you get a word toolbox. When you meet a tricky word, you have three tools. Tool one, reread the sentence. Tool two, look at the picture. Tool three, if a word means two things, let the sentence pick the meaning. Let's read a story and use every tool." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our story about Max and his dog Rex. Read along with me." },
      interaction: { type: "read-along", text: "Max and his dog Rex play at the park. Rex runs to a big tree and starts to bark.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-bark-two-meanings",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use the toolbox.",
      fx: {"text":"The **sentence** picks the meaning!","effect":"underline"},
      narration: { audio: A("model-bark-two-meanings"), script: "Bark is a word with two meanings. Bark can be the loud sound a dog makes. Bark can also be the rough skin on a tree. Watch me use tool one. I reread the sentence. Rex runs to a big tree and starts to bark. Who starts to bark? Rex. Rex is a dog. So in this sentence, bark is the sound a dog makes. The sentence picked the meaning for me." },
    },
    {
      id: "guided-speak-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two aloud: Max feels the bark on the tree trunk.",
      narration: { audio: A("guided-speak-page-two"), script: "Page two is one sentence, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "Max feels the bark on the tree trunk" },
    },
    {
      id: "guided-choose-bark-tree",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does bark mean on page two?",
      narration: { audio: A("guided-choose-bark-tree"), script: "You just read, Max feels the bark on the tree trunk. Now use tool one. Reread that sentence in your head. Read each card. Tap what bark means in this sentence." },
      interaction: { type: "choose", options: [{ id: "skin-on-a-tree", label: "the skin on a tree" }, { id: "sound-a-dog-makes", label: "the sound a dog makes" }, { id: "place-to-swim", label: "a place to swim" }], correctId: "skin-on-a-tree", coachWrong: "Reread page two. Max feels the bark on the tree trunk. Think about what a hand can feel. Try again!" },
    },
    {
      id: "apply-read-page-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("apply-read-page-three"), script: "Page three has a tricky word that works two ways in two sentences. Read along with me and keep your toolbox open." },
      interaction: { type: "read-along", text: "A small bat flies out of the tree. Then Max hits the ball with his bat.", audio: A("apply-read-page-three-sentence") },
    },
    {
      id: "model-bat-both-meanings",
      purpose: "model",
      gate: "none",
      prompt: "Watch me check both meanings.",
      fx: {"text":"Same word, **two** meanings!","effect":"underline"},
      narration: { audio: A("model-bat-both-meanings"), script: "Bat means two things too. A bat can be a small animal that flies at night. A bat can also be a wooden stick for hitting a ball. Watch tool three. In the first sentence, the bat flies out of the tree. A wooden stick cannot fly on its own. So that bat is the animal. Now the second sentence is yours." },
    },
    {
      id: "guided-choose-bat-stick",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does bat mean in sentence two?",
      narration: { audio: A("guided-choose-bat-stick"), script: "Reread the second sentence. Then Max hits the ball with his bat. Read each card. Tap what bat means in this sentence." },
      interaction: { type: "choose", options: [{ id: "stick-for-hitting", label: "a stick for hitting" }, { id: "animal-that-flies", label: "an animal that flies" }, { id: "soft-hat", label: "a soft hat" }], correctId: "stick-for-hitting", coachWrong: "Reread it. Max hits the ball with his bat. Think about what he is holding. Try again!" },
    },
    {
      id: "apply-sort-bark-sentences",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the bark sentences.",
      narration: { audio: A("apply-sort-bark-sentences"), script: "Here are four little sentences with the word bark. Read each card. Then let the sentence pick the meaning. Drag each card to Dog Sound or Tree Skin." },
      interaction: { type: "sort", buckets: ["Dog Sound","Tree Skin"], items: [{ label: "Rex barks at the cat.", bucket: "Dog Sound" }, { label: "I hear a loud bark.", bucket: "Dog Sound" }, { label: "The bark feels bumpy.", bucket: "Tree Skin" }, { label: "Bark peels off the log.", bucket: "Tree Skin" }], coachWrong: "Reread that card. Is its bark something you hear, or something you touch? Try again!" },
    },
    {
      id: "apply-read-page-four",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four with me.",
      narration: { audio: A("apply-read-page-four"), script: "Back to our story. Page four has a brand new word. Read along with me." },
      interaction: { type: "read-along", text: "Max trips in the mud. His shirt gets wet. Max is glum.", audio: A("apply-read-page-four-sentence") },
    },
    {
      id: "apply-choose-glum",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does glum mean?",
      image: IMG("max-glum"),
      narration: { audio: A("apply-choose-glum"), script: "Glum. That is a new word. Time for tool two. Look at the picture of Max. Look at his face and his shoulders. Then reread, Max trips in the mud. Max is glum. Read each card. Tap what glum means." },
      interaction: { type: "choose", options: [{ id: "glum-sad", label: "sad" }, { id: "glum-fast", label: "fast" }, { id: "glum-clean", label: "clean" }], correctId: "glum-sad", coachWrong: "Use tool two. Look at Max's face in the picture. How does he feel after tripping in the mud? Try again!" },
    },
    {
      id: "apply-speak-glum-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what glum means.",
      image: IMG("max-glum"),
      narration: { audio: A("apply-speak-glum-meaning"), script: "You figured out glum with your tools. What does glum mean? Tap the mic and say the meaning out loud." },
      interaction: { type: "speak", text: "sad unhappy upset" },
    },
    {
      id: "challenge-read-page-five",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read the last page with me.",
      narration: { audio: A("challenge-read-page-five"), script: "Here is the last page of our story. It holds one more two-meaning word. Read along with me." },
      interaction: { type: "read-along", text: "At home Max hears the phone ring. Mom has a gold ring on her hand.", audio: A("challenge-read-page-five-sentence") },
    },
    {
      id: "challenge-choose-ring",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does ring mean in Mom's sentence?",
      narration: { audio: A("challenge-choose-ring"), script: "Last challenge! You read two ring sentences. Reread the second one. Mom has a gold ring on her hand. Read each card. Tap what ring means in that sentence." },
      interaction: { type: "choose", options: [{ id: "round-band-you-wear", label: "a round band you wear" }, { id: "sound-a-phone-makes", label: "a sound a phone makes" }, { id: "pile-of-mud", label: "a pile of mud" }, { id: "kind-of-dog", label: "a kind of dog" }], correctId: "round-band-you-wear", coachWrong: "Reread it. The gold ring is on Mom's hand. Think about what can sit on a hand. Try again!" },
    },
    {
      id: "celebrate-toolbox-full",
      purpose: "celebrate",
      gate: "none",
      prompt: "Your toolbox is full!",
      fx: {"text":"Your **word toolbox** works!","effect":"fireworks"},
      narration: { audio: A("celebrate-toolbox-full"), script: "You did it! Your word toolbox is full. You reread sentences, you looked at the picture, and you let each sentence pick the meaning of bark, bat, and ring. Use your toolbox every time you read!" },
    },
  ],
};
