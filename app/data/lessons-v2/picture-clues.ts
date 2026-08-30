import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./picture-clues-timings.json";

// Picture Clues (RL.K.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=picture-clues

const A = (id: string) => `/audio/lessons-v2/picture-clues/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/picture-clues/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/picture-clues/${w.toLowerCase()}.png`;

export const pictureCluesImages: Record<string, string | { subject: string; ref?: string }> = {
  "foxy": "A friendly orange cartoon fox detective wearing a brown detective hat on his head and a tan trench coat, holding a magnifying glass, smiling.",
  "foxy-yawn": { subject: "The orange cartoon fox detective sitting up in a cozy bed, yawning with his mouth open very wide, brown detective hat on his head.", ref: "foxy" },
  "foxy-bed": { subject: "The orange cartoon fox detective kneeling on the floor and peeking under his bed, brown detective hat on his head.", ref: "foxy-yawn" },
  "foxy-leaf": { subject: "The orange cartoon fox detective holding up one bright green leaf in his paw and looking at it closely, brown detective hat on his head.", ref: "foxy-bed" },
  "foxy-walk": { subject: "The orange cartoon fox detective walking from left to right along a winding dirt path, passing a tall green tree in the middle, with a small blue bird perched at the far right end of the path, brown detective hat on his head.", ref: "foxy-leaf" },
  "bird-drop": { subject: "The small blue bird flying in the sky with its beak wide open, a shiny gold button falling down through the air far below the bird with small motion lines showing it dropping, while the orange cartoon fox detective watches from the path below, brown detective hat on his head.", ref: "foxy-walk" },
  "foxy-hat-found": { subject: "The orange cartoon fox detective pointing up happily at the brown detective hat sitting on top of his own head, big surprised smile.", ref: "bird-drop" },
  "bed": "A simple cartoon bed with a blanket and pillow.",
  "chair": "A bright, comfy cartoon armchair.",
  "box": "A plain cardboard box.",
  "leaf": "A single, bright green leaf.",
  "stick": "A small, brown, twig-like stick.",
  "rock": "A smooth, grey, round rock.",
  "red": "A solid red circle.",
  "blue": "A solid blue circle.",
  "green": "A solid green circle.",
  "path": "A winding dirt path through green grass.",
  "tree": "A tall, leafy green tree with a brown trunk.",
  "bird": "A small, cheerful blue bird with a yellow beak."
};

export const pictureClues: LessonDef = {
  id: "picture-clues",
  title: "Picture Clues",
  grade: "Kindergarten",
  standard: "RL.K.7",
  archetype: "inference",
  objective: "We will learn how pictures tell us more about a story!",
  concepts: ["inference","illustrations","story connection"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did a super job today, picture detective! You learned that pictures can show us so much more than just the words. Keep looking closely at all the amazing pictures in your books!",
    "title": "Super Picture Detective!",
    "body": "You found all the picture clues and helped Foxy!"
  },
  scenes: [
    {
      id: "hook-foxy-intro",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Listen to our story about Foxy!",
      image: IMG("foxy"),
      narration: { audio: A("hook-foxy-intro"), script: "Hello, super detectives! I'm Foxy. I need your help today. Listen closely to this story about my morning. The words tell us some things, but the pictures will tell us even more. Let's find some picture clues!" },
      interaction: { type: "read-along", text: "Foxy woke up. He looked for his hat. But it was gone!", audio: A("hook-foxy-intro-sentence") },
    },
    {
      id: "model-yawning-foxy",
      purpose: "model",
      gate: "interaction",
      prompt: "What is Foxy doing?",
      image: IMG("foxy-yawn"),
      narration: { audio: A("model-yawning-foxy"), script: "The story said, 'Foxy woke up.' The words do not tell us anything else. But look at the picture clue! It shows what Foxy is doing with his mouth. Tap the word that matches the picture. Tap a word to hear it." },
      interaction: { type: "choose", options: [{ id: "sleep", label: "SLEEP", audio: W("sleep") }, { id: "yawn", label: "YAWN", audio: W("yawn") }, { id: "jump", label: "JUMP", audio: W("jump") }], correctId: "yawn", coachWrong: "Look at Foxy's mouth in the picture. It is open so wide! Tap the word that matches." },
    },
    {
      id: "model-hat-location",
      purpose: "model",
      gate: "interaction",
      prompt: "Where did Foxy look?",
      image: IMG("foxy-bed"),
      narration: { audio: A("model-hat-location"), script: "Next, the story said, 'He looked for his hat.' The words do not say where he looked. The picture shows us! Look closely at Foxy. Tap the picture that shows where he is looking." },
      interaction: { type: "choose", options: [{ id: "bed", label: "BED", audio: W("bed"), image: IMG("bed") }, { id: "chair", label: "CHAIR", audio: W("chair"), image: IMG("chair") }, { id: "box", label: "BOX", audio: W("box"), image: IMG("box") }], correctId: "bed", coachWrong: "Foxy is peeking under something. Which picture shows that?" },
    },
    {
      id: "guided-foxy-finds-clue",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is Foxy holding?",
      image: IMG("foxy-leaf"),
      narration: { audio: A("guided-foxy-finds-clue"), script: "Foxy needs your help now! The story says, 'He found a clue.' The words do not say what the clue is. Look at the picture! Tap what Foxy is holding in his paw." },
      interaction: { type: "choose", options: [{ id: "leaf", label: "LEAF", audio: W("leaf"), image: IMG("leaf") }, { id: "stick", label: "STICK", audio: W("stick"), image: IMG("stick") }, { id: "rock", label: "ROCK", audio: W("rock"), image: IMG("rock") }], correctId: "leaf", coachWrong: "Look carefully at Foxy's paw. What is in his hand?" },
    },
    {
      id: "guided-leaf-color",
      purpose: "guided",
      gate: "interaction",
      prompt: "What color is the leaf?",
      image: IMG("foxy-leaf"),
      narration: { audio: A("guided-leaf-color"), script: "Great job! The picture told us Foxy found a leaf. Here is another picture clue. The words never tell us the color. Look at the leaf in the picture. Tap the color you see." },
      interaction: { type: "choose", options: [{ id: "red", label: "RED", audio: W("red"), image: IMG("red") }, { id: "blue", label: "BLUE", audio: W("blue"), image: IMG("blue") }, { id: "green", label: "GREEN", audio: W("green"), image: IMG("green") }], correctId: "green", coachWrong: "What color is the leaf Foxy is holding?" },
    },
    {
      id: "apply-say-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the clue word!",
      image: IMG("foxy-leaf"),
      narration: { audio: A("apply-say-clue"), script: "The picture told us what Foxy found. The words never did! Now it is your turn to say the clue. Look at the word on the screen and say it into your microphone, loud and clear." },
      interaction: { type: "speak", text: "leaf" },
    },
    {
      id: "apply-foxy-follows-path",
      purpose: "apply",
      gate: "interaction",
      prompt: "Show Foxy's walk in order!",
      image: IMG("foxy-walk"),
      narration: { audio: A("apply-foxy-follows-path"), script: "Foxy followed the green leaf clue outside! Look at the picture of his walk. First he stepped onto the path. Then he passed the tall tree. Last, he saw a little bird. Put the picture clues in that same order." },
      interaction: { type: "sequence", items: [{ id: "path", label: "PATH", audio: W("path"), image: IMG("path") }, { id: "tree", label: "TREE", audio: W("tree"), image: IMG("tree") }, { id: "bird", label: "BIRD", audio: W("bird"), image: IMG("bird") }], order: ["path","tree","bird"], coachWrong: "Look at the picture of Foxy's walk again. What did he step onto first, at the very start? Try again!" },
    },
    {
      id: "apply-bird-action",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is the bird doing?",
      image: IMG("bird-drop"),
      narration: { audio: A("apply-bird-action"), script: "Foxy saw the bird! The story says, 'The bird had something shiny.' The words do not tell us what the bird did with it. The picture does! Look closely, then tap the word that matches. Tap a word to hear it." },
      interaction: { type: "choose", options: [{ id: "fly", label: "FLY", audio: W("fly") }, { id: "drop", label: "DROP", audio: W("drop") }, { id: "sing", label: "SING", audio: W("sing") }], correctId: "drop", coachWrong: "Look at the bird's beak in the picture. Something shiny is falling from it! Tap the word that matches." },
    },
    {
      id: "challenge-hat-found",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where was Foxy's hat?",
      image: IMG("foxy-hat-found"),
      narration: { audio: A("challenge-hat-found"), script: "You followed every clue, detective! At the end, the story says, 'Foxy found his hat!' But the words do not say where it was hiding. The picture tells the secret! Look closely at Foxy, then tap where his hat was. Tap a word to hear it." },
      interaction: { type: "choose", options: [{ id: "head", label: "HEAD", audio: W("head") }, { id: "bush", label: "BUSH", audio: W("bush") }, { id: "box", label: "BOX", audio: W("box") }], correctId: "head", coachWrong: "Look at the very top of Foxy in the picture. Try again!" },
    },
    {
      id: "celebrate-detective",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a super detective!",
      fx: {"text":"You found all the **picture clues**!","effect":"fireworks"},
      narration: { audio: A("celebrate-detective"), script: "You are a super picture detective, just like Foxy! The words never told us the hat was on Foxy's head the whole time. The pictures did! Great job using those picture clues!" },
    },
  ],
};
