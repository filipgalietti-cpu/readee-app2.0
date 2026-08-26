import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-shape-timings.json";

// Story Shape (RL.2.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=story-shape
// G2: original anchor story "The Stuck Kite" with a clean three-part shape.
// Framing used throughout: beginning = meet (character, place, problem),
// middle = the tries, ending = concludes the action (fixes the problem).

const A = (id: string) => `/audio/lessons-v2/story-shape/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-shape/${w.toLowerCase()}.png`;

export const storyShapeImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover illustration of a sunny green park with one tall oak tree, a young boy with short brown hair in a striped blue shirt flying a bright red diamond kite high in a clear blue sky with puffy white clouds, bright 2D cartoon style, framed like a picture book cover, no text anywhere",
  "page-2": { subject: "The same young boy with short brown hair in a striped blue shirt looking up with a worried face at his bright red diamond kite tangled high in the leafy branches of the tall oak tree, sunny green park, puffy white clouds", ref: "cover" }
};

export const storyShape: LessonDef = {
  id: "story-shape",
  title: "Story Shape",
  grade: "2nd Grade",
  standard: "RL.2.5",
  archetype: "story-elements",
  objective: "I can describe how a story's beginning introduces it and its ending concludes the action.",
  concepts: ["story structure","beginning introduces character, setting, and problem","middle is the tries","ending concludes the action","retell a story in order"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole story and mapped its shape. The beginning introduced Bart, the park, and the stuck kite. The middle was full of tries. And the ending concluded the action, Miss Moon set the kite free. Beginning, middle, ending. Meet, try, fix. Now you can find the shape of any story you read.",
    "title": "You Found the Story Shape!",
    "body": "You read a whole story and described how the beginning introduces the story and the ending concludes the action."
  },
  scenes: [
    {
      id: "hook-story-shape",
      purpose: "hook",
      gate: "none",
      prompt: "Every story has a shape.",
      image: IMG("cover"),
      fx: {"text":"Every story has a **shape**.","effect":"underline"},
      narration: { audio: A("hook-story-shape"), script: "Hello, reader! Every story has a shape, a beginning, a middle, and an ending. The beginning introduces the story. The middle is full of tries. The ending concludes the action, it finishes things for good. Today you will read The Stuck Kite and find each part of its shape." },
    },
    {
      id: "model-meet-try-fix",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find the shape in a tiny story.",
      fx: {"text":"**Meet**. **Try**. **Fix**.","effect":"pop-words"},
      narration: { audio: A("model-meet-try-fix"), script: "Watch me find the shape in one tiny story. Pip the pup lost his bone. He sniffed all around the yard. Then he dug by the gate and found it. The beginning introduces the story, I meet Pip and his problem, the lost bone. The middle is his tries, sniffing and digging. The ending concludes the action, the bone is found. Meet, try, fix. Every story has that shape." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: Bart flew his red kite in the park. A gust of wind pushed it into a tall oak tree. Now the kite was stuck up high.",
      narration: { audio: A("page-1-read"), script: "Time to read The Stuck Kite. Page one is the beginning of the story. Read it out loud, nice and clear, and meet the character." },
      interaction: { type: "speak", text: "Bart flew his red kite in the park A gust of wind pushed it into a tall oak tree Now the kite was stuck up high" },
    },
    {
      id: "check-find-the-problem",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which of these is the problem in the beginning?",
      narration: { audio: A("check-find-the-problem"), script: "Good reading. The beginning introduced the story, and part of that job is to introduce the problem, the thing that goes wrong. Read each choice. Which one is the problem in The Stuck Kite? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-kite-is-stuck-up-high", label: "the kite is stuck up high" }, { id: "bart-flies-his-red-kite", label: "bart flies his red kite" }, { id: "the-park-has-an-oak-tree", label: "the park has an oak tree" }, { id: "bart-eats-a-picnic-lunch", label: "bart eats a picnic lunch" }], correctId: "the-kite-is-stuck-up-high", coachWrong: "A problem is the thing that goes wrong, the thing the character needs to fix. Read page one again in your mind. What went wrong for Bart?" },
    },
    {
      id: "check-beginning-job",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a beginning's job in every story?",
      narration: { audio: A("check-beginning-job"), script: "You found the problem. Now zoom out. Page one did the same job every beginning does, in every story ever written. Read each choice, then tap the beginning's job." },
      interaction: { type: "choose", options: [{ id: "it-introduces-the-story", label: "it introduces the story" }, { id: "it-finishes-the-action", label: "it finishes the action" }, { id: "it-solves-the-problem", label: "it solves the problem" }, { id: "it-shows-the-last-try", label: "it shows the last try" }], correctId: "it-introduces-the-story", coachWrong: "Think about what page one gave you. You met Bart, you saw the park, and you learned what went wrong. Did that start the story, or end it?" },
    },
    {
      id: "page-2-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two is the middle. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Page two is the middle of the story. The middle is where the character tries to fix the problem. Read along with me and count the tries." },
      interaction: { type: "read-along", text: "First, Bart tugged on the string. The kite would not budge. Next, he poked at the branch with a long stick. The branch was too high. Then Bart saw his neighbor, Miss Moon, and asked her for help.", audio: A("page-2-read-sentence") },
    },
    {
      id: "check-middle-try",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which one is something Bart really tried?",
      narration: { audio: A("check-middle-try"), script: "The middle of a story is full of tries, and Bart tried more than one way to get his kite back. Read each choice. Which one is something Bart really tried? Tap it." },
      interaction: { type: "choose", options: [{ id: "he-tugged-on-the-string", label: "he tugged on the string" }, { id: "he-bought-a-brand-new-kite", label: "he bought a brand new kite" }, { id: "he-chopped-down-the-tree", label: "he chopped down the tree" }, { id: "he-called-a-fire-truck", label: "he called a fire truck" }], correctId: "he-tugged-on-the-string", coachWrong: "Walk back through page two in your mind. Bart tried three things, one after another. Which choice really happened in the story?" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: Miss Moon set her ladder on the oak tree. She climbed up and set the kite free. Bart flew his kite far from the trees.",
      narration: { audio: A("page-3-read"), script: "Page three is the ending, and the ending has the biggest job. Read it out loud and watch what happens to the problem from page one." },
      interaction: { type: "speak", text: "Miss Moon set her ladder on the oak tree She climbed up and set the kite free Bart flew his kite far from the trees" },
    },
    {
      id: "check-ending-concludes",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did the ending conclude the action?",
      narration: { audio: A("check-ending-concludes"), script: "The ending concluded the action. It did not just stop, it finished the exact problem from the beginning. Read each choice. How did the ending conclude the action? Tap it." },
      interaction: { type: "choose", options: [{ id: "miss-moon-set-the-kite-free", label: "miss moon set the kite free" }, { id: "bart-bought-a-new-kite", label: "bart bought a new kite" }, { id: "the-wind-blew-the-kite-home", label: "the wind blew the kite home" }, { id: "bart-forgot-about-the-kite", label: "bart forgot about the kite" }], correctId: "miss-moon-set-the-kite-free", coachWrong: "Read page three again in your mind. The stuck kite came down one certain way. Who fixed the problem, and how?" },
    },
    {
      id: "speak-ending-word",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the teacher word for what an ending does.",
      narration: { audio: A("speak-ending-word"), script: "Now say it like a teacher. The beginning introduces the story. The middle is the tries. The ending has its own teacher word for finishing the action, and you have heard it many times in this lesson. Tap the mic and say the teacher word for what an ending does." },
      interaction: { type: "speak", text: "concludes conclude finishes ends" },
    },
    {
      id: "sort-story-shape",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Drag each story piece to its part.",
      narration: { audio: A("sort-story-shape"), script: "Time to map the whole shape. Here are six pieces of The Stuck Kite. Read each piece, think about the job it does, and drag it to its part of the story." },
      interaction: { type: "sort", buckets: ["Beginning","Middle","Ending"], items: [{ label: "we meet bart and his kite", bucket: "Beginning" }, { label: "the kite gets stuck", bucket: "Beginning" }, { label: "bart pokes with a stick", bucket: "Middle" }, { label: "bart asks miss moon for help", bucket: "Middle" }, { label: "the kite is set free", bucket: "Ending" }, { label: "bart flies far from trees", bucket: "Ending" }], coachWrong: "Read the piece again and think about its job. Does it introduce the story, is it a try, or does it finish the action? Drag it to that part." },
    },
    {
      id: "sequence-retell",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell The Stuck Kite. Put the events in order.",
      narration: { audio: A("sequence-retell"), script: "Now tell the story of The Stuck Kite again, like a storyteller. Think about what happened first, next, then, and last. Drag the events into story order." },
      interaction: { type: "sequence", items: [{ id: "a-gust-grabs-the-kite", label: "a gust grabs the kite" }, { id: "bart-tugs-and-pokes", label: "bart tugs and pokes" }, { id: "miss-moon-climbs-up", label: "miss moon climbs up" }, { id: "the-kite-flies-again", label: "the kite flies again" }], order: ["a-gust-grabs-the-kite","bart-tugs-and-pokes","miss-moon-climbs-up","the-kite-flies-again"], coachWrong: "Walk back through the pages in your mind. How did the story begin, what filled the middle, and how did the action conclude?" },
    },
    {
      id: "check-new-story-ending",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which ending concludes the new story?",
      narration: { audio: A("check-new-story-ending"), script: "Last case, and it is a brand new story. Here is only its beginning. Dawn's cat, Scout, ran up on the roof and would not come down. Dawn wanted her cat back. Read all four endings, then tap the one that concludes the action of that story." },
      interaction: { type: "choose", options: [{ id: "scout-comes-down-safe", label: "scout comes down safe" }, { id: "dawn-wins-a-school-prize", label: "dawn wins a school prize" }, { id: "dawn-paints-the-fence-red", label: "dawn paints the fence red" }, { id: "a-mail-truck-drives-past", label: "a mail truck drives past" }], correctId: "scout-comes-down-safe", coachWrong: "An ending must finish the problem from the beginning. Dawn's problem is her cat on the roof. Which ending finishes that exact problem?" },
    },
    {
      id: "celebrate-story-shape",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the story shape!",
      fx: {"text":"Beginning. Middle. **Ending**.","effect":"fireworks"},
      narration: { audio: A("celebrate-story-shape"), script: "You read a whole story and mapped its shape. The beginning introduced Bart, the park, and the stuck kite. The middle was full of tries. And the ending concluded the action, Miss Moon set the kite free. Beginning, middle, ending. Meet, try, fix. Now you can find the shape of any story you read." },
    },
  ],
};
