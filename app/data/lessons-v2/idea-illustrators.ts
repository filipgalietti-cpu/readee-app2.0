import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./idea-illustrators-timings.json";

// Idea Illustrators (RI.1.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=idea-illustrators

const A = (id: string) => `/audio/lessons-v2/idea-illustrators/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/idea-illustrators/${w.toLowerCase()}.png`;

export const ideaIllustratorsImages: Record<string, string | { subject: string; ref?: string }> = {
  "giraffe-eating": "A tall adult giraffe with orange-brown patchy spots standing next to a tall acacia tree on a sunny green savanna, its long neck stretched high up to the top branches of the tree, its long dark purple tongue sticking out and wrapped around a bunch of green leaves, pulling the leaves toward its mouth. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "baby-giraffe": { subject: "The same tall adult giraffe with orange-brown patchy spots standing on a sunny green savanna, and a small baby giraffe standing up on its own four wobbly spread-out legs in the grass right beside the adult giraffe's tall legs, the baby looking up at the adult, both with orange-brown patchy spots. No letters, no words, no numbers, no writing anywhere.", ref: "giraffe-eating" },
  "two-giraffes": { subject: "The same tall adult giraffe with big rounded orange-brown patchy spots standing side by side with a second fully grown giraffe that is only a little shorter, both with long necks held straight up, the second giraffe's spots clearly different, smaller, darker brown, and jagged, the two different spot patterns easy to compare, both giraffes with two tiny horns on top of their heads, standing in green savanna grass under the sun. No letters, no words, no numbers, no writing anywhere.", ref: "giraffe-eating" },
  "giraffe-running": { subject: "The same tall adult giraffe with orange-brown patchy spots galloping fast across a sunny green savanna, all four long legs stretched out in a big running stride, a cloud of dust behind its hooves, and one lion running through the grass behind it, chasing the giraffe from a distance. No letters, no words, no numbers, no writing anywhere.", ref: "two-giraffes" },
};

export const ideaIllustrators: LessonDef = {
  id: "idea-illustrators",
  title: "Idea Illustrators",
  grade: "1st Grade",
  standard: "RI.1.7",
  archetype: "inference",
  objective: "I can use the words and the picture to describe what a fact page teaches.",
  concepts: ["the words state a key idea","the picture shows supporting details","read the words, study the picture, then describe what the page teaches"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What an idea illustrator you are! Every page of a fact book teaches a key idea. The words state it. The picture shows the details that make it clear. When you read a fact page, read the words, study the picture, then describe what the page teaches.",
    "title": "Idea Illustrator!",
    "body": "You can use words and pictures together to describe what a fact page teaches."
  },
  scenes: [
    {
      id: "hook-key-ideas",
      purpose: "hook",
      gate: "none",
      prompt: "Fact pages teach big ideas.",
      fx: {"text":"The **words** state it. The **picture** shows it.","effect":"pop-words"},
      narration: { audio: A("hook-key-ideas"), script: "Hello, idea illustrator! Today we open a fact book about giraffes. Every page teaches one key idea. That is the big thing the page wants you to learn. The words state the key idea. The picture shows details that make it clear. Your job: read the words, study the picture, then describe what the page teaches." },
    },
    {
      id: "read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one.",
      image: IMG("giraffe-eating"),
      narration: { audio: A("read-page-one"), script: "Open our giraffe book. Here is page one. Read the words, and keep your eyes on the picture. The picture always shows more." },
      interaction: { type: "read-along", text: "Giraffes eat leaves from tall trees.", audio: A("read-page-one-sentence") },
    },
    {
      id: "model-key-idea",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find what the page teaches.",
      image: IMG("giraffe-eating"),
      narration: { audio: A("model-key-idea"), script: "Watch me work on page one. First I read the words: Giraffes eat leaves from tall trees. That is the key idea. It is the big thing this page teaches. Now I study the picture for details. I see the giraffe's long neck stretched way up high. I see a long dark tongue pulling the leaves. The picture shows me how giraffes reach that food. Now I can describe the page: this page teaches that giraffes eat leaves from tall trees, and the picture shows how their neck and tongue help them do it." },
    },
    {
      id: "guided-picture-adds",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did the picture add?",
      image: IMG("giraffe-eating"),
      narration: { audio: A("guided-picture-adds"), script: "Your turn. The words of page one say: Giraffes eat leaves from tall trees. The picture shows a detail the words never said. Look closely at how the giraffe grabs its food. Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "dark-tongue", label: "a dark tongue pulls leaves" }, { id: "squirrel-drops", label: "a squirrel drops the leaves" }, { id: "eat-leaves", label: "giraffes eat green leaves" }], correctId: "dark-tongue", coachWrong: "Say page one in your head: giraffes eat leaves from tall trees. Now find the detail you can only see in the picture. Try again!" },
    },
    {
      id: "speak-read-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two aloud: A baby giraffe can stand up on day one.",
      image: IMG("baby-giraffe"),
      narration: { audio: A("speak-read-page-two"), script: "Turn the page. Page two is short, and it is all yours. Tap the mic and read page two out loud, nice and clear." },
      interaction: { type: "speak", text: "A baby giraffe can stand up on day one" },
    },
    {
      id: "guided-key-idea-baby",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does this page teach?",
      image: IMG("baby-giraffe"),
      narration: { audio: A("guided-key-idea-baby"), script: "You read page two yourself. The words say: A baby giraffe can stand up on day one. Now study the picture. The little giraffe is up on its own four legs. Put the words and the picture together. What does this page teach? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "stand-fast", label: "baby giraffes stand up fast" }, { id: "sleep-all-day", label: "baby giraffes sleep all day" }, { id: "swim-in-lakes", label: "baby giraffes swim in lakes" }], correctId: "stand-fast", coachWrong: "Say the page words in your head: a baby giraffe can stand up on day one. Now look at what the baby is doing in the picture. Try again!" },
    },
    {
      id: "read-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three.",
      image: IMG("two-giraffes"),
      narration: { audio: A("read-page-three"), script: "Here is page three. Two giraffes are on this page. Read the words, then compare the giraffes in the picture." },
      interaction: { type: "read-along", text: "Every giraffe has its own spots. No two look the same.", audio: A("read-page-three-sentence") },
    },
    {
      id: "apply-key-vs-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which card says the key idea?",
      image: IMG("two-giraffes"),
      narration: { audio: A("apply-key-vs-detail"), script: "Remember, every page teaches one key idea. That is the big thing the words state. A picture is full of small details too. Small details are fun to spot, but they are not the big teaching. Think about page three. Read each card. Tap the card that says the key idea." },
      interaction: { type: "choose", options: [{ id: "no-two-match", label: "no two giraffes match" }, { id: "sun-in-sky", label: "the sun is in the sky" }, { id: "one-is-taller", label: "one giraffe is taller" }], correctId: "no-two-match", coachWrong: "That card is a small detail from the picture. The key idea is the big thing the words of page three teach. Try again!" },
    },
    {
      id: "read-page-four",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page four.",
      image: IMG("giraffe-running"),
      narration: { audio: A("read-page-four"), script: "Turn to page four, the last page of our book. Read the words, then study the whole picture. A detail is hiding in the grass." },
      interaction: { type: "read-along", text: "Giraffes run fast to get away from danger.", audio: A("read-page-four-sentence") },
    },
    {
      id: "apply-picture-adds-lion",
      purpose: "apply",
      gate: "interaction",
      prompt: "What danger does the picture show?",
      image: IMG("giraffe-running"),
      narration: { audio: A("apply-picture-adds-lion"), script: "The words of page four say: Giraffes run fast to get away from danger. But the words never name the danger. The picture does. Look behind the running giraffe. Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "lion-chases", label: "a lion chases the giraffe" }, { id: "truck-chases", label: "a truck chases the giraffe" }, { id: "storm-chases", label: "a storm chases the giraffe" }], correctId: "lion-chases", coachWrong: "The words say giraffes run from danger, but they never say what the danger is. Look in the grass behind the giraffe. Try again!" },
    },
    {
      id: "apply-sort-key-detail",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Key idea or small detail?",
      narration: { audio: A("apply-sort-key-detail"), script: "Now sort our giraffe book. Some cards say a key idea, the big thing a page taught. Some cards say a small detail the picture showed. Read each card. Drag it to Key Idea or Detail." },
      interaction: { type: "sort", buckets: ["Key Idea","Detail"], items: [{ label: "giraffes eat leaves", bucket: "Key Idea" }, { label: "a long dark tongue", bucket: "Detail" }, { label: "giraffes run from danger", bucket: "Key Idea" }, { label: "a lion in the grass", bucket: "Detail" }], coachWrong: "Is that card the big thing a page taught, or a small thing you saw in a picture? The big teaching goes to Key Idea. Try again!" },
    },
    {
      id: "challenge-speak-key-idea",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Describe what page four teaches.",
      image: IMG("giraffe-running"),
      narration: { audio: A("challenge-speak-key-idea"), script: "Last job, idea illustrator. Look at page four one more time. Think about the words, and think about the picture. Tap the mic and describe the key idea of page four in your own words." },
      interaction: { type: "speak", text: "run runs running fast danger away legs" },
    },
    {
      id: "celebrate-idea-illustrator",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are an Idea Illustrator!",
      fx: {"text":"You are an **Idea Illustrator**!","effect":"fireworks"},
      narration: { audio: A("celebrate-idea-illustrator"), script: "You did it, idea illustrator! You read the words, you studied the pictures, and you described what every page teaches. Giraffes eat leaves from tall trees, babies stand up fast, every spot coat is different, and fast legs keep giraffes safe. When you read a fact book, remember: the words state the key idea, and the picture shows the details." },
    },
  ],
};
