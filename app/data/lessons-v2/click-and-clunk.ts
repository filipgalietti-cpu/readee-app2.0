import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./click-and-clunk-timings.json";

// Click and Clunk (RF.2.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=click-and-clunk
//
// Lane note: read-with-your-brain (RF.2.4a) owns purpose + does-it-make-sense at
// the COMPREHENSION level; tricky-sound-switchers (RF.2.3e) owns flip-and-check
// at the SOUND level. THIS lesson owns the full self-correction LOOP as a habit:
// read, hear a clunk (a word that makes nonsense), stop, go back, reread, fix,
// then confirm the fix with the context around the line. One anchor story (Cole
// and Gramps on the mountain trail) primes every lookalike pair the lesson uses:
// cloud/clown, twigs/twins, cheer/chair, trail/tail. The double speak
// (first-read then reread of the same line) is deliberate: the REREAD is the
// standard. Shape deviation justified: transform dropped (letter-building is the
// RF.2.3 lane); the build-middle is sequence (fix-it loop) + sort (click/clunk).

const A = (id: string) => `/audio/lessons-v2/click-and-clunk/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/click-and-clunk/${w.toLowerCase()}.png`;

export const clickAndClunkImages: Record<string, string> = {
  "trail-hike": "A young boy with short black hair and a friendly grandfather with a gray beard hiking up a green mountain trail, one small gray cloud above the peak, a little brown bird flying overhead carrying a small twig in its beak, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "cole-cheer": "A young boy with short black hair and a friendly grandfather with a gray beard cheering with raised arms on a sunny mountain top, blue sky and small white clouds behind them, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  // Quiz easier-band picture support:
  "frog-log": "A green frog sitting on a brown log at the edge of a calm blue pond, tall reeds nearby, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "corn-cob": "A bright yellow corn on the cob with green husk leaves peeled back, resting on a picnic plate on a checkered cloth, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "cat-bowl": "A striped gray cat lapping milk from a round red bowl on a sunny kitchen floor, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
  "mail-box": "A blue mailbox on a wooden post with a white envelope peeking out of its open slot and a small red flag raised, flowers at the base, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no letters, no numbers anywhere.",
};

export const clickAndClunk: LessonDef = {
  id: "click-and-clunk",
  title: "Click and Clunk",
  grade: "2nd Grade",
  standard: "RF.2.4c",
  archetype: "fluency",
  objective: "I can catch a word that clunks, reread to fix it, and check that it clicks.",
  concepts: [
    "a word that makes sense clicks, a word that makes nonsense clunks",
    "the fix-it loop: hear a clunk, stop and go back, reread and fix, check that it clicks",
    "the sentences around a line confirm which look-alike word is right",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    script: "You are a reader who catches your own clunks now. When a word made nonsense, you stopped, went back, and reread until it clicked. And you used the story around the line to pick the right word. Good readers catch their own mistakes. That fix-it habit will make every book you read make sense.",
    title: "Clunk Catcher!",
    body: "Hear a clunk, stop, reread, fix it, and check that it clicks.",
  },
  scenes: [
    {
      id: "hook-trail-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Our story: Cole and Gramps on the trail. Read along.",
      image: IMG("trail-hike"),
      narration: { audio: A("hook-trail-story"), script: "Strong readers do a quiet job while they read. They listen to their own reading and make sure every word makes sense. Today you learn how to catch a word that goes wrong, and how to fix it. First, here is a story about a boy named Cole. Read along with me." },
      interaction: { type: "read-along", text: "Cole and Gramps hike up the mountain trail. The morning air is cool and sweet. A gray cloud floats over the peak. Cole spots a bird with a twig in its beak. The bird flies to a nest high in a pine. At the top, Cole and Gramps cheer!", audio: A("hook-trail-story-sentence") },
    },
    {
      id: "model-click-clunk",
      purpose: "model",
      gate: "none",
      prompt: "A word that makes sense clicks. A word that makes nonsense clunks.",
      fx: { text: "**Click** means it makes sense. **Clunk** means stop and fix.", effect: "pop-words" },
      narration: { audio: A("model-click-clunk"), script: "While you read, every word should click. Click means it makes sense. But sometimes your mouth says a word that makes nonsense. That is a clunk, and a clunk means stop. Listen to me read a line from our story, and listen for a clunk. A gray clown floats over the peak. Wait. Can a clown float over a mountain? No. That clunks, so I stop. I go back, and I reread the line slowly. A gray cloud floats over the peak. A cloud floats over the peak, and that clicks. I heard my own mistake, and I fixed it myself." },
    },
    {
      id: "guided-sequence-fix-loop",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the fix-it steps in order.",
      narration: { audio: A("guided-sequence-fix-loop"), script: "You just watched my whole fix-it plan. Now show me you remember it. The four steps are on your screen, all mixed up. Think about what I did first, what I did next, and what I did last. Drag the steps into order." },
      interaction: { type: "sequence", items: [{ id: "clunk", label: "hear a clunk" }, { id: "stop", label: "stop and go back" }, { id: "reread", label: "reread and fix it" }, { id: "check", label: "check that it clicks" }], order: ["clunk", "stop", "reread", "check"], coachWrong: "Think back to the clown line. What did I do the moment the line made nonsense, and what did I do at the very end? Try the order again." },
    },
    {
      id: "guided-highlight-clunk",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that clunks.",
      narration: { audio: A("guided-highlight-clunk"), script: "Now you catch a clunk on your own. A reader read this line out loud, but one word came out wrong, and the line stopped making sense. Read the line on your screen slowly, and picture it happening. Tap the word that clunks." },
      interaction: { type: "highlight", text: "The pigs sleep in the warm bran.", targets: ["bran"], coachWrong: "Picture the line in your head. Pigs sleep in a cozy farm building. Which word almost says that place, but not quite?" },
    },
    {
      id: "guided-choose-twigs",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that fixes the line.",
      fx: { text: "The bird built a nest of twins.", effect: "highlight" },
      narration: { audio: A("guided-choose-twigs"), script: "Catching the clunk is step one. Fixing it is step two. A reader read a line about the bird from our story like this. The bird built a nest of twins. Twins are two babies born together. Can a bird build a nest of twins? No. That clunks. One choice on your screen fixes the line so it clicks. Tap it." },
      interaction: { type: "choose", options: [{ id: "twigs", label: "twigs" }, { id: "twins", label: "twins" }, { id: "tins", label: "tins" }, { id: "wigs", label: "wigs" }], correctId: "twigs", coachWrong: "Say the line again with each choice. Birds build nests out of little sticks from trees. Tap the choice that names those." },
    },
    {
      id: "model-context-decides",
      purpose: "model",
      gate: "none",
      prompt: "The sentences around a line tell you which word is right.",
      fx: { text: "Check the story **around** the line.", effect: "underline" },
      narration: { audio: A("model-context-decides"), script: "Sometimes two words look almost the same, and you need help picking the right word. The story around the line is your best clue. Think about the end of our story. Cole and Gramps make it to the top, and they are glad. Now listen to two readings of the last line. One reader said, at the top, Cole and Gramps chair. A chair, like the seat you sit on. Another reader said, at the top, Cole and Gramps cheer. A cheer, like a happy shout. Those two words look alike. But the story says they are glad they made it, and glad hikers let out a happy shout. The story around the line picked the right word for us. When you fix a word, always check that your fix makes sense with the story." },
    },
    {
      id: "apply-choose-puddles",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap what the last line really said.",
      fx: { text: "Rain fell hard on the path.", effect: "slide-in" },
      narration: { audio: A("apply-choose-puddles"), script: "Your turn to let the story pick the word. Marta read two lines in her book. The first line said, rain fell hard on the path. Then she read, the path was full of paddles. Paddles are the flat oars that row a boat. Do paddles sit all over a path? No. That clunks. Use the rain line as your clue, and tap what the last line really said." },
      interaction: { type: "choose", options: [{ id: "puddles", label: "puddles" }, { id: "paddles", label: "paddles" }, { id: "poodles", label: "poodles" }, { id: "pedals", label: "pedals" }], correctId: "puddles", coachWrong: "The first line is the clue. Rain fell hard on the path. Think about what rain leaves all over a path, and tap that choice." },
    },
    {
      id: "apply-sort-click-clunk",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the lines: Clicks, or Clunks?",
      narration: { audio: A("apply-sort-click-clunk"), script: "Time to sort like a careful reader. Read each line and picture it in your head. If every word makes sense, drag the line to Clicks. If one word makes nonsense, drag the line to Clunks." },
      interaction: { type: "sort", buckets: ["Clicks", "Clunks"], items: [{ label: "A moth flew to the light.", bucket: "Clicks" }, { label: "The king wore a gold crow.", bucket: "Clunks" }, { label: "We ate toast with jam.", bucket: "Clicks" }, { label: "He rows a boat with oats.", bucket: "Clunks" }, { label: "The bell rang at noon.", bucket: "Clicks" }, { label: "She swept with her bloom.", bucket: "Clunks" }], coachWrong: "Read the line once more and make a picture. If the picture works, it clicks. If one word breaks the picture, it clunks." },
    },
    {
      id: "apply-speak-first-read",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the line out loud.",
      narration: { audio: A("apply-speak-first-read"), script: "Now the reading voice is yours. Read the line on your screen out loud, nice and steady, and listen to yourself while you read." },
      interaction: { type: "speak", text: "A hawk glides over the tall trees." },
    },
    {
      id: "apply-speak-reread",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the same line again. Make every word click.",
      narration: { audio: A("apply-speak-reread"), script: "Strong readers read a line twice to be sure every word clicks. The same line is waiting on your screen. Reread it out loud, smooth and sure, and check that every word makes sense." },
      interaction: { type: "speak", text: "A hawk glides over the tall trees." },
    },
    {
      id: "challenge-speak-fix",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Fix the line. Read it the right way.",
      narration: { audio: A("challenge-speak-fix"), script: "Here is a line one reader got wrong. She read it as, we hiked up the steep tail. A tail belongs on an animal, and no one hikes up a tail. That clunks. The real line is on your screen. Read it out loud the right way, and make it click." },
      interaction: { type: "speak", text: "We hiked up the steep trail." },
    },
    {
      id: "challenge-speak-capstone",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read the ending out loud. Catch every word.",
      narration: { audio: A("challenge-speak-capstone"), script: "Time for your big finish. The end of our trail story is on your screen, and it is full of words that look like other words. Read all three sentences out loud. If a word clunks, stop, reread, and fix it before you go on." },
      interaction: { type: "speak", text: "The gray cloud drifted away. The bird set one more twig in its nest. Cole gave a happy cheer on the trail." },
    },
    {
      id: "celebrate-clunk-catcher",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You catch your own clunks now!",
      image: IMG("cole-cheer"),
      fx: { text: "Make every word **click**!", effect: "fireworks" },
      narration: { audio: A("celebrate-clunk-catcher"), script: "What sharp reading today. You learned the fix-it plan strong readers use. When a word clunks, you stop, you go back, you reread, and you fix it. Then you check the story around the line to be sure it clicks. Good readers catch their own mistakes. Keep catching yours in every book you read." },
    },
  ],
};
