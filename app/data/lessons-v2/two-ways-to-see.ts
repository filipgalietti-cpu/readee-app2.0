import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./two-ways-to-see-timings.json";

// Two Ways to See It (RL.2.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=two-ways-to-see
// G2: original anchor story "The Big Storm". Point of view = how a character
// thinks or feels about something. Rose loves the storm, Ben is scared of it,
// the child proves each feeling with clues (words and actions), then transfers
// to a fresh two-character story. Same event, two feelings, both real.

const A = (id: string) => `/audio/lessons-v2/two-ways-to-see/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/two-ways-to-see/${w.toLowerCase()}.png`;

export const twoWaysToSeeImages: Record<string, string> = {
  "cover": "A storybook cover illustration of a cozy little house at dusk under huge dark storm clouds with one bright lightning bolt, warm yellow light glowing in the windows, rain falling, bright 2D cartoon style, framed like a picture book cover, no people, no text anywhere",
  "snowy-yard": "A snowy front yard in soft morning light, a wooden sled resting by a small bare tree and a snow shovel leaning against a porch rail, fresh deep snow everywhere, bright 2D cartoon style, no people, no text anywhere",
  "frog-pond": "A small bright green frog sitting on a lily pad in a sparkling blue pond ringed by cattails and smooth stones, bright 2D cartoon style, no people, no text anywhere"
};

export const twoWaysToSee: LessonDef = {
  id: "two-ways-to-see",
  title: "Two Ways to See It",
  grade: "2nd Grade",
  standard: "RL.2.6",
  archetype: "story-elements",
  objective: "I can notice when two characters feel differently about the same thing and tell who feels what.",
  concepts: ["point of view","how a character thinks or feels","same event, different feelings","clues in words and actions","both points of view are real"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You found two points of view inside one story. Rose loved the storm, Ben was scared of it, and you proved both feelings with clues from their words and actions. Same storm, two points of view, and both of them are real. That is how a strong reader listens to every character.",
    "title": "You Saw It Two Ways!",
    "body": "You noticed that two characters can feel differently about the same event, and you told who feels what."
  },
  scenes: [
    {
      id: "hook-two-ways",
      purpose: "hook",
      gate: "none",
      prompt: "Two characters can see one thing two ways.",
      image: IMG("cover"),
      fx: {"text":"A **point of view** is how a character thinks or feels.","effect":"underline"},
      narration: { audio: A("hook-two-ways"), script: "Hello, reader! Every character has a point of view. A point of view is how a character thinks or feels about something. Two characters can look at the very same thing and feel two different ways. Today you will read The Big Storm and find two points of view inside one story." },
    },
    {
      id: "model-snow-day",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find two points of view in a tiny story.",
      image: IMG("snowy-yard"),
      fx: {"text":"One snow. **Two points of view**.","effect":"pop-words"},
      narration: { audio: A("model-snow-day"), script: "Watch me find two points of view in one tiny story. Snow fell all night. Max grabbed his sled and cheered, best day ever! Gran looked at her shovel and sighed, so much work. Same snow for both of them. Max thinks the snow is fun. That is his point of view. Gran thinks the snow is work. That is her point of view. I did not guess. I found each feeling in what they said and what they did." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page one of The Big Storm. Read along!",
      narration: { audio: A("page-1-read"), script: "Time to read The Big Storm. Rose and Ben are in the same house, in the same storm. Read along with me, and watch each character closely." },
      interaction: { type: "read-along", text: "Boom! Thunder rolled over the little house. Rain tapped on every window. Rose and Ben looked up from their game.", audio: A("page-1-read-sentence") },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Rose ran to the window and clapped. \"This is the best show!\" she said. She watched each bright flash.",
      narration: { audio: A("page-2-read"), script: "Page two is all about Rose. Read it out loud in your clearest voice, and pay attention to what Rose says and does." },
      interaction: { type: "speak", text: "Rose ran to the window and clapped This is the best show she said She watched each bright flash" },
    },
    {
      id: "check-rose-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "How does Rose feel about the storm?",
      narration: { audio: A("check-rose-feeling"), script: "You just read Rose's page. Think about what she did and what she said. Read each choice. How does Rose feel about the storm? Tap it." },
      interaction: { type: "choose", options: [{ id: "happy-and-excited", label: "happy and excited" }, { id: "scared-and-shaky", label: "scared and shaky" }, { id: "angry-and-stomping", label: "angry and stomping" }, { id: "bored-and-sleepy", label: "bored and sleepy" }], correctId: "happy-and-excited", coachWrong: "Go back to page two in your mind. Rose ran, clapped, and watched. Do characters do those things when they hate something, or when they love it?" },
    },
    {
      id: "check-rose-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which one is a clue about Rose's feeling?",
      narration: { audio: A("check-rose-evidence"), script: "You found Rose's point of view. Now prove it like a reader. A clue is something a character says or does. Read each choice. Which one is a clue about Rose's feeling? Tap it." },
      interaction: { type: "choose", options: [{ id: "she-clapped-and-watched", label: "she clapped and watched" }, { id: "thunder-rolled-and-rolled", label: "thunder rolled and rolled" }, { id: "rain-tapped-the-window", label: "rain tapped the window" }, { id: "she-yawned-at-the-glass", label: "she yawned at the glass" }], correctId: "she-clapped-and-watched", coachWrong: "A clue about a feeling must be something the character says or does. Two of these are about the weather, and one never happened. Find what Rose herself did." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three is about Ben. Read along!",
      narration: { audio: A("page-3-read"), script: "Page three is all about Ben. Same storm, same boom. Read along with me, and watch what Ben says and does." },
      interaction: { type: "read-along", text: "Ben did not run to the window. He pulled his blanket over his head. \"Make it stop,\" he whispered. \"I do not like the boom.\" At last the storm rolled away, and Ben peeked out at a rainbow.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-ben-feeling",
      purpose: "apply",
      gate: "interaction",
      prompt: "How does Ben feel about the storm?",
      narration: { audio: A("check-ben-feeling"), script: "Now think about Ben. Same house, same storm, but his own point of view. Think about what he did and what he whispered. Read each choice. How does Ben feel about the storm? Tap it." },
      interaction: { type: "choose", options: [{ id: "scared-and-shaky", label: "scared and shaky" }, { id: "happy-and-excited", label: "happy and excited" }, { id: "angry-and-stomping", label: "angry and stomping" }, { id: "bored-and-sleepy", label: "bored and sleepy" }], correctId: "scared-and-shaky", coachWrong: "Go back to page three in your mind. Ben hid and whispered for the storm to stop. What feeling makes a character hide?" },
    },
    {
      id: "check-ben-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which one is a clue about Ben's feeling?",
      narration: { audio: A("check-ben-evidence"), script: "One more proof. Read each choice. Which one is a clue that shows Ben's feeling about the storm? Tap it." },
      interaction: { type: "choose", options: [{ id: "he-hid-under-his-blanket", label: "he hid under his blanket" }, { id: "he-ran-to-the-window", label: "he ran to the window" }, { id: "the-storm-rolled-away", label: "the storm rolled away" }, { id: "a-rainbow-filled-the-sky", label: "a rainbow filled the sky" }], correctId: "he-hid-under-his-blanket", coachWrong: "A clue about Ben's feeling must be something Ben said or did. One of these things Ben never did, and two are about the sky. Find Ben's own action." },
    },
    {
      id: "sort-who-said-it",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Drag each story piece to its character.",
      narration: { audio: A("sort-who-said-it"), script: "Same storm, two points of view. Rose's feeling is real, and Ben's feeling is real too. Here are six pieces of The Big Storm. Read each piece, think about who said or did it, and drag it to that character's name." },
      interaction: { type: "sort", buckets: ["Rose","Ben"], items: [{ label: "clapped at the window", bucket: "Rose" }, { label: "called it the best show", bucket: "Rose" }, { label: "watched each bright flash", bucket: "Rose" }, { label: "hid under a blanket", bucket: "Ben" }, { label: "whispered make it stop", bucket: "Ben" }, { label: "did not like the boom", bucket: "Ben" }], coachWrong: "Read the piece again and think about who said or did that in the story. Then drag it to that character's name." },
    },
    {
      id: "sequence-retell",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell The Big Storm. Put the events in order.",
      narration: { audio: A("sequence-retell"), script: "Now retell The Big Storm like a storyteller. Think about what happened first, next, then, and last. Drag the events into story order." },
      interaction: { type: "sequence", items: [{ id: "the-storm-rolls-in", label: "the storm rolls in" }, { id: "rose-cheers-at-the-window", label: "rose cheers at the window" }, { id: "ben-hides-under-his-blanket", label: "ben hides under his blanket" }, { id: "a-rainbow-fills-the-sky", label: "a rainbow fills the sky" }], order: ["the-storm-rolls-in","rose-cheers-at-the-window","ben-hides-under-his-blanket","a-rainbow-fills-the-sky"], coachWrong: "Walk back through the pages in your mind. The storm came first. Then each character showed a point of view. Last, the storm was over." },
    },
    {
      id: "check-frog-views",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one tells both points of view?",
      image: IMG("frog-pond"),
      narration: { audio: A("check-frog-views"), script: "Brand new story, brand new characters. Listen. Pam and Tess found a frog by the pond. Pam scooped it up and laughed. Tess stepped back and said, yuck. Read each choice. Which one tells both points of view? Tap it." },
      interaction: { type: "choose", options: [{ id: "pam-likes-it-tess-does-not", label: "pam likes it, tess does not" }, { id: "tess-likes-it-pam-does-not", label: "tess likes it, pam does not" }, { id: "they-both-love-the-frog", label: "they both love the frog" }, { id: "they-both-fear-the-frog", label: "they both fear the frog" }], correctId: "pam-likes-it-tess-does-not", coachWrong: "Match each girl to her clue. One girl scooped up the frog and laughed. The other stepped back and said yuck. Who did what?" },
    },
    {
      id: "speak-same-or-different",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Did Rose and Ben feel the same way, or different ways?",
      narration: { audio: A("speak-same-or-different"), script: "Last one, and you say it. Rose cheered at the storm. Ben hid from it. Here is the big teacher question. Did Rose and Ben feel the same way about the storm, or two different ways? Tap the mic and say it." },
      interaction: { type: "speak", text: "different differently" },
    },
    {
      id: "celebrate-two-ways",
      purpose: "celebrate",
      gate: "none",
      prompt: "You saw it two ways!",
      fx: {"text":"One storm. **Two points of view**.","effect":"fireworks"},
      narration: { audio: A("celebrate-two-ways"), script: "You read The Big Storm and found two points of view inside it. Rose thought the storm was a great show, and her clapping proved it. Ben thought the storm was scary, and his blanket proved it. Same storm, two feelings, and both of them are real. From now on, when characters do not feel the same way, you will see both sides." },
    },
  ],
};
