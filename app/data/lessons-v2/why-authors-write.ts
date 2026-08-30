import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./why-authors-write-timings.json";

// Why Authors Write (RI.2.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=why-authors-write
// G2: identify the author's MAIN PURPOSE: to answer a question, to explain how
// something works, or to describe what something is like. Three SHORT original
// true texts with sharply different purposes carry the lesson (the skill IS the
// contrast): a cheetah text that asks and answers a question, a honey text that
// walks the steps of how honey gets made, a panda text that tells what a panda
// is like (the child reads that one aloud, the narrator never pre-reads it).
// Purpose vs topic (RI.2.2) contrast is taught in the model and panda beats.
// Evidence beats point at the clue that shows the purpose; a 6-line sort maps
// first lines into Answer / Explain / Describe; production speak names the
// purpose from its definition (multi-word accept list, "?" tile).
// All facts true: cheetah = fastest land runner, bursts up to about seventy
// miles an hour, long legs and flexible spine; honey = workers sip nectar,
// pass it mouth to mouth at the hive, house bees chew it and fan it thick,
// stored in wax cells for winter; pandas = thick black and white fur, cool
// misty mountain forests in China, chew bamboo most of the day; sea turtles
// hatch from nests dug in beach sand.

const A = (id: string) => `/audio/lessons-v2/why-authors-write/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/why-authors-write/${w.toLowerCase()}.png`;

export const whyAuthorsWriteImages: Record<string, string> = {
  "cheetah": "A realistic cheetah running at full speed across dry golden grassland, legs stretched in mid stride, small puffs of dust behind its paws, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "honeybee": "A realistic honeybee hovering beside one purple flower in a sunny garden, wings a soft blur, realistic natural insect with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "panda": "A realistic giant panda seen from the side sitting in a misty green mountain forest, its mouth busy chewing the leafy end of one green bamboo stalk it grips in its front paw, wildlife photo posture, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "sea-turtle": "A realistic sea turtle resting on smooth beach sand near gentle rolling waves, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  // Quiz easier-band picture support (fresh stimuli, not lesson scenes):
  "camel": "A realistic one hump camel standing on golden desert sand under a clear blue sky, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "penguin": "A realistic emperor penguin standing upright on white ice with a soft blue polar sky behind, realistic natural bird with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "hummingbird": "A realistic green hummingbird hovering at one red trumpet flower, wings a soft blur, realistic natural bird with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere"
};

export const whyAuthorsWrite: LessonDef = {
  id: "why-authors-write",
  title: "Why Authors Write",
  grade: "2nd Grade",
  standard: "RI.2.6",
  archetype: "inference",
  objective: "I can figure out why an author wrote a text.",
  concepts: ["authors write to answer a question","authors write to explain how something works","authors write to describe what something is like","purpose is why the author wrote it, not what the text is about","clues in the text show the purpose"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read three true texts today and caught every author's reason. The cheetah text asked a question and handed you the answer. The honey text walked you through how honey gets made, move by move. The panda text told you just what a panda is like. Answer, explain, describe. From now on, when you open a text, you can name what its author came to do.",
    "title": "Purpose Finder!",
    "body": "You can tell when an author writes to answer a question, explain how something works, or describe what something is like."
  },
  scenes: [
    {
      id: "hook-author-reason",
      purpose: "hook",
      gate: "none",
      prompt: "Every author writes for a reason.",
      fx: {"text":"Every author writes for a **reason**.","effect":"underline"},
      narration: { audio: A("hook-author-reason"), script: "Hello, reader! Every text you have ever read was written for a reason. The author sat down with a job in mind, and the whole text works on that job. That reason has a name. It is called the author's purpose. Today you will read three short true texts and catch each author's purpose." },
    },
    {
      id: "model-three-purposes",
      purpose: "model",
      gate: "none",
      prompt: "Authors answer, explain, or describe.",
      fx: {"text":"**Answer**. **Explain**. **Describe**.","effect":"pop-words"},
      narration: { audio: A("model-three-purposes"), script: "Informational authors mostly write for one of three purposes. Some write to answer a question, like why is the sky blue. Some write to explain how something works, step by step, like how a seed becomes a tree. And some write to describe, to tell what something is like, like a page all about a shark's smooth grey skin. Answer. Explain. Describe. Keep those three in your pocket." },
    },
    {
      id: "model-tiny-text",
      purpose: "model",
      gate: "none",
      prompt: "Watch me catch an author's purpose.",
      image: IMG("sea-turtle"),
      narration: { audio: A("model-tiny-text"), script: "Watch me catch one. Here is a tiny true text. Where do baby sea turtles hatch? They hatch from nests of sand, dug on the beach by their mother. Now I think. The text opened with a question, and then it handed me exactly what I asked for. So this author's purpose was to answer a question. And notice one more thing. The topic is sea turtles, that is what the text is about. But the purpose is why the author wrote it. Topic and purpose are two different questions." },
    },
    {
      id: "read-cheetah",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read the cheetah text with me.",
      narration: { audio: A("read-cheetah"), script: "Your turn to gather clues. Here is the first true text. Read it with me, and while you read, notice how the author built it." },
      interaction: { type: "read-along", text: "Who is the fastest runner on land? The cheetah is. A cheetah can run up to seventy miles an hour. Long strong legs and a bendy spine push it across the grass. No other land animal can keep up.", audio: A("read-cheetah-sentence") },
    },
    {
      id: "check-cheetah-purpose",
      purpose: "guided",
      gate: "interaction",
      prompt: "What was this author's purpose?",
      image: IMG("cheetah"),
      narration: { audio: A("check-cheetah-purpose"), script: "Think about the whole cheetah text. It opened by asking, who is the fastest runner on land? Then it told you, the cheetah, and backed that up with seventy miles an hour and long strong legs. The author built every line to do one job. Tap the author's purpose." },
      interaction: { type: "choose", options: [{ id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "answer-a-question", coachWrong: "Read the first line of the text again in your mind. What kind of sentence is it, and what does the rest of the text do about it?" },
    },
    {
      id: "check-cheetah-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words show the text's job?",
      narration: { audio: A("check-cheetah-evidence"), script: "Now point at the evidence. In the cheetah text, one line set up the job for the whole text, and every other line worked for it. Here are four lines from the text. Tap the one that set up the text's job." },
      interaction: { type: "choose", options: [{ id: "who-is-the-fastest-runner", label: "who is the fastest runner" }, { id: "long-strong-legs", label: "long strong legs" }, { id: "seventy-miles-an-hour", label: "seventy miles an hour" }, { id: "across-the-grass", label: "across the grass" }], correctId: "who-is-the-fastest-runner", coachWrong: "Three of these lines hand you facts. Only one line makes you wait for more. Which line leaves you needing the rest of the text?" },
    },
    {
      id: "read-honey",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read the honey text with me.",
      narration: { audio: A("read-honey"), script: "Here is the second true text, and it is built a different way. Read it with me, and watch how it moves." },
      interaction: { type: "read-along", text: "Worker bees fly from flower to flower. They sip a sweet juice called nectar. At the hive, bees pass the nectar mouth to mouth. They chew it and fan it with their wings until it thickens. Then they store the honey in wax cells for winter food.", audio: A("read-honey-sentence") },
    },
    {
      id: "check-honey-purpose",
      purpose: "apply",
      gate: "interaction",
      prompt: "What was the honey author's purpose?",
      image: IMG("honeybee"),
      narration: { audio: A("check-honey-purpose"), script: "Think about how the honey text moved. It took you from the flowers to the hive to the wax cells, one move after another. The bees sipped nectar, moved it mouth to mouth, and chewed and fanned it until it was thick. Think about what the author is doing with all those moves. Tap the author's purpose." },
      interaction: { type: "choose", options: [{ id: "explain-how-it-works", label: "explain how it works" }, { id: "answer-a-question", label: "answer a question" }, { id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "explain-how-it-works", coachWrong: "Think about the shape of the text. It walks you from the flowers to the hive to the wax cells, one move at a time. Which purpose fits that shape?" },
    },
    {
      id: "check-honey-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which clue did you find in the honey text?",
      narration: { audio: A("check-honey-evidence"), script: "Purpose clues come in different shapes. Think about how the honey text was built, from its first line to its last. Here are four kinds of clues a reader might find. Tap the clue you actually found inside the honey text." },
      interaction: { type: "choose", options: [{ id: "steps-from-first-to-last", label: "steps from first to last" }, { id: "a-question-at-the-very-start", label: "a question at the very start" }, { id: "words-that-paint-a-picture", label: "words that paint a picture" }, { id: "a-talking-storybook-bee", label: "a talking storybook bee" }], correctId: "steps-from-first-to-last", coachWrong: "Walk the honey text again in your mind. Flowers, then the hive, then the wax cells. What shape is that?" },
    },
    {
      id: "read-panda-aloud",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: A giant panda has thick black and white fur. It lives in cool misty mountains in China. It chews green bamboo all day.",
      narration: { audio: A("read-panda-aloud"), script: "The third true text is yours alone. I will not read this one. It is short, it is true, and it is about one animal. Tap the mic and read the panda text out loud." },
      interaction: { type: "speak", text: "A giant panda has thick black and white fur It lives in cool misty mountains in China It chews green bamboo all day" },
    },
    {
      id: "check-panda-purpose",
      purpose: "apply",
      gate: "interaction",
      prompt: "What was the panda author's purpose?",
      image: IMG("panda"),
      narration: { audio: A("check-panda-purpose"), script: "You read that one yourself. Now think like a purpose finder. The topic is pandas, that is what the text is about. But the purpose is why the author wrote it, and those are two different questions. This author never asked anything and never gave steps. The text handed you pictures made of words, thick fur, misty mountains, quiet bamboo chewing. Tap the author's purpose." },
      interaction: { type: "choose", options: [{ id: "describe-what-it-is-like", label: "describe what it is like" }, { id: "answer-a-question", label: "answer a question" }, { id: "explain-how-it-works", label: "explain how it works" }, { id: "tell-a-made-up-story", label: "tell a made-up story" }], correctId: "describe-what-it-is-like", coachWrong: "The panda text never asked anything, and it gave no step order. It handed you detail after detail about one animal. Which purpose fits that?" },
    },
    {
      id: "sort-purpose-clues",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each line to its purpose.",
      narration: { audio: A("sort-purpose-clues"), script: "Now the big sort. Here are six first lines from six different texts. Read each line, think about what its author came to do, and drag it to that purpose." },
      interaction: { type: "sort", buckets: ["Answer","Explain","Describe"], items: [{ label: "why is the sky blue?", bucket: "Answer" }, { label: "which bug is the loudest?", bucket: "Answer" }, { label: "first the snow melts", bucket: "Explain" }, { label: "next the seed cracks open", bucket: "Explain" }, { label: "the reef glows with color", bucket: "Describe" }, { label: "the desert is hot and dry", bucket: "Describe" }], coachWrong: "Read the line again. Does it ask something, give one step of a job, or paint a picture in words? Drag it to the purpose that fits." },
    },
    {
      id: "speak-name-purpose",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the author's purpose out loud.",
      narration: { audio: A("speak-name-purpose"), script: "Last one, and you say it. An author writes a page about a coral reef. No question starts it. No step order moves it. The page just shows the reef in words, bright colors, wavy shapes, fish gliding through. This author's purpose has a name. Tap the mic and say the purpose." },
      interaction: { type: "speak", text: "describe describes describing" },
    },
    {
      id: "celebrate-purpose-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You caught every author's purpose!",
      fx: {"text":"**Answer**. **Explain**. **Describe**!","effect":"fireworks"},
      narration: { audio: A("celebrate-purpose-finder"), script: "You read three true texts today and caught every author's reason. The cheetah text asked a question and handed you the answer. The honey text walked you through how honey gets made, move by move. The panda text told you just what a panda is like. Answer, explain, describe. From now on, when you open a text, you can name what its author came to do." },
    },
  ],
};
