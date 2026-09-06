import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./read-to-learn-timings.json";

// Read to Learn (RI.2.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=read-to-learn
// G2 INFORMATIONAL CAPSTONE (twin of the-whole-story RL.2.10): one longer
// original TRUE fact book, "Up in a Balloon" (13 sentences over 5 child-facing
// pages): the first hot air balloon riders were a sheep, a duck, and a rooster
// (France, over two hundred years ago); the envelope, basket, and burner; hot
// air is lighter than cool air so the balloon rises; the pilot opens a top
// flap to come down; the wind does the steering. No new skill: each check
// exercises ONE fact-reading tool (main point of a page, word meaning from
// context, evidence for a point, which text feature would help, how a
// diagram clarifies the words). Stretch words in context: passengers,
// envelope. All facts true. Keys prefixed quiz- are fresh stimuli for the
// quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/read-to-learn/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/read-to-learn/${w.toLowerCase()}.png`;

export const readToLearnImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A grand old-fashioned hot air balloon decorated in blue and gold rising into a bright sky above a cheering crowd in old-fashioned clothes near a grand palace, and in the balloon's round wicker basket ride exactly three animals looking out: one woolly white sheep, one white duck, and one rooster with a red comb. No letters, no words, no numbers, no writing anywhere.",
  "balloon-diagram": "A clean simple side-view diagram of a modern hot air balloon against a plain pale blue background: the huge rounded balloon drawn semi-transparent so the inside is visible, a small wicker basket hanging below, a bright orange burner flame just above the basket pointing up into the balloon's open mouth, and three soft wavy orange arrows inside the balloon, every arrow starting near the flame at the bottom and pointing straight up toward the balloon's rounded top, every arrowhead aimed upward, no downward arrows anywhere, tidy diagram style. No letters, no words, no numbers, no writing anywhere.",
  "wind-ways": "A simple diagram-style sky scene: one colorful hot air balloon floating in the middle of the sky, a stream of long curved white wind lines high in the sky all flowing toward the left, and a second stream of long curved white wind lines lower in the sky all flowing toward the right, soft blue background with a distant green field below. No letters, no words, no numbers, no writing anywhere.",
  "quiz-street-sweeper": "A realistic plain yellow street sweeper truck rolling along a city curb, an ordinary machine with a normal windshield and normal headlights, absolutely no face, no eyes, no mouth, not a cartoon character, two big round green spinning brushes under its front sweeping a small pile of brown leaves and dust, clean street behind it, sunny morning, simple flat illustration style. No letters, no words, no numbers, no writing anywhere.",
  "quiz-icicle": "A row of clear shiny icicles hanging from the snowy edge of a cabin roof, the longest icicle in the middle with a single water drop falling from its pointed tip, bright winter sunshine and blue sky. No letters, no words, no numbers, no writing anywhere.",
  "quiz-ferry": "A wide flat white ferry boat crossing calm blue water, a few colorful cars parked on its open deck and a small group of people standing at the railing, green shoreline far in the distance. No letters, no words, no numbers, no writing anywhere.",
  "quiz-ladybug": "A very close view of a red ladybug with black spots on a bright green leaf, its hard spotted shell lifted open like two little doors showing the thin clear delicate wings folded underneath. No letters, no words, no numbers, no writing anywhere."
};

export const readToLearn: LessonDef = {
  id: "read-to-learn",
  title: "Read to Learn",
  grade: "2nd Grade",
  standard: "RI.2.10",
  archetype: "inference",
  objective: "I can read a real fact book and understand it using all my fact-reading tools.",
  concepts: ["read a full informational text","main point of a page","word meaning from context","evidence that supports a point","text features that help","diagrams clarify the words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Up in a Balloon from the first page to the last, and you understood all of it. You found what each page mostly taught. The book itself taught you envelope and passengers. You picked the fact that proves a balloon needs heat, you knew which book helper holds word meanings, and the diagram showed you where the hot air goes. That is what strong readers do with every fact book: they read to learn, with every tool they own.",
    "title": "You Read to Learn!",
    "body": "You read a real fact book and understood it with every fact-reading tool you own."
  },
  scenes: [
    {
      id: "hook-one-true-book",
      purpose: "hook",
      gate: "none",
      prompt: "Today you read a whole fact book with every tool you own.",
      fx: {"text":"**Every** tool. **One** true book.","effect":"pop-words"},
      narration: { audio: A("hook-one-true-book"), script: "Hello, reader! All year you have been collecting fact-reading tools: the main point, word clues, proof for a point, book helpers, and pictures that teach. Today there is no new tool. Today you get a real fact book, and every single fact in it is true. It is called Up in a Balloon, and it tells how a giant balloon carries people across the sky. First, a quick warm up." },
    },
    {
      id: "model-warm-up",
      purpose: "model",
      gate: "none",
      prompt: "Watch me warm up my tools on two tiny fact sentences.",
      fx: {"text":"Warm up **every** tool","effect":"underline"},
      narration: { audio: A("model-warm-up"), script: "Watch me warm up on two tiny fact sentences. A snowplow's wide blade is curved, so the snow rolls off to one side of the road. Tool one, main point: these sentences mostly teach how a snowplow moves snow away. Tool two, word clues: maybe curved is new to me, but the snow rolls off to one side, so curved must mean bent in a smooth round shape. See that? The tools work on any fact book. Now for the real one." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Up in a Balloon, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Here is Up in a Balloon, page one. Read along with me, and keep your tools ready." },
      interaction: { type: "read-along", text: "More than two hundred years ago in France, a crowd gathered to watch the first hot air balloon riders lift into the sky. The passengers were not people at all. They were a sheep, a duck, and a rooster, and they landed safely in a green field.", audio: A("page-1-read-sentence") },
    },
    {
      id: "check-page-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did page one mostly teach?",
      narration: { audio: A("check-page-point"), script: "Tool one, the main point. Every page of a fact book mostly teaches one thing. Think back over everything that first page told you. What did it mostly teach? Tap it." },
      interaction: { type: "choose", options: [{ id: "animals-flew-before-people", label: "animals flew before people" }, { id: "how-to-care-for-a-sheep", label: "how to care for a sheep" }, { id: "why-roosters-crow-at-dawn", label: "why roosters crow at dawn" }, { id: "how-crowds-cheer-in-france", label: "how crowds cheer in france" }], correctId: "animals-flew-before-people", coachWrong: "Think about who was riding in that first balloon, and who was still standing on the ground watching." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A hot air balloon has three main parts. The giant bag on top is called the envelope. Under it hangs a basket for the riders.",
      narration: { audio: A("page-2-read"), script: "Page two belongs to you. It names the parts of the balloon. Read it out loud, clear and steady." },
      interaction: { type: "speak", text: "A hot air balloon has three main parts The giant bag on top is called the envelope Under it hangs a basket for the riders" },
    },
    {
      id: "check-envelope",
      purpose: "guided",
      gate: "interaction",
      prompt: "In this book, what is the envelope?",
      narration: { audio: A("check-envelope"), script: "Tool two, word clues. Page two used a stretchy word: envelope. You may know an envelope that gets mailed, but this book means something different, and the page you just read tells you exactly what. In this book, what is the envelope? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-giant-bag-on-top", label: "the giant bag on top" }, { id: "paper-that-holds-a-letter", label: "paper that holds a letter" }, { id: "the-basket-for-the-riders", label: "the basket for the riders" }, { id: "a-rope-the-pilot-pulls", label: "a rope the pilot pulls" }], correctId: "the-giant-bag-on-top", coachWrong: "This book gives the meaning right where the new word lives. Say page two again in your head, and listen for what is called the envelope." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the drawing!",
      image: IMG("balloon-diagram"),
      narration: { audio: A("page-3-read"), script: "Now the big question: how does it fly? Page three, read along with me, and keep one eye on the drawing." },
      interaction: { type: "read-along", text: "A burner under the envelope shoots a flame up inside and heats the air. Hot air is lighter than cool air. So the heated air lifts the whole balloon, like a bubble rising through water.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-diagram",
      purpose: "apply",
      gate: "interaction",
      prompt: "What do the arrows in the drawing show?",
      image: IMG("balloon-diagram"),
      narration: { audio: A("check-diagram"), script: "Tool three, pictures that teach. The words told you the flame heats the air, but words alone are hard to picture. The drawing catches it. Look inside the balloon in the drawing, and follow the arrows. What do the arrows show? Tap it." },
      interaction: { type: "choose", options: [{ id: "where-the-hot-air-goes", label: "where the hot air goes" }, { id: "how-big-the-basket-is", label: "how big the basket is" }, { id: "which-way-the-wind-blows", label: "which way the wind blows" }, { id: "where-the-riders-stand", label: "where the riders stand" }], correctId: "where-the-hot-air-goes", coachWrong: "Trace one arrow with your finger. It starts near the flame. Where does it travel next?" },
    },
    {
      id: "check-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which fact holds up the point: a balloon needs heat to fly?",
      narration: { audio: A("check-evidence"), script: "Tool four, proof for a point. Here is the author's big point: a balloon needs heat to fly. Watch how I test a point before you do. A point is like a stool seat, and facts are the legs that hold it up. A fact can be true and still be the wrong leg, so I ask: does this fact explain the flying, or does it just tell who or where? Now you. Which fact from the book holds up the point that a balloon needs heat to fly? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-burner-heats-the-air", label: "the burner heats the air" }, { id: "a-duck-rode-in-the-basket", label: "a duck rode in the basket" }, { id: "the-basket-hangs-below", label: "the basket hangs below" }, { id: "the-flight-was-in-france", label: "the flight was in france" }], correctId: "the-burner-heats-the-air", coachWrong: "Every tile is true, so being true is not enough. Ask each one: does this fact explain how the balloon gets off the ground?" },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: To come down, the pilot pulls a rope and opens a small flap at the top. Some hot air spills out, and the balloon sinks softly toward the ground.",
      narration: { audio: A("page-4-read"), script: "Page four belongs to you. It tells how the balloon comes back home. Read it out loud." },
      interaction: { type: "speak", text: "To come down the pilot pulls a rope and opens a small flap at the top Some hot air spills out and the balloon sinks softly toward the ground" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("wind-ways"),
      narration: { audio: A("page-5-read"), script: "One mystery is left: a balloon has no steering wheel. Page five, the last page. Read along with me." },
      interaction: { type: "read-along", text: "A balloon has no wheel and no motor to steer it. The wind does the steering, so a pilot rises or sinks to find a wind blowing the right way.", audio: A("page-5-read-sentence") },
    },
    {
      id: "check-feature",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which book helper gives the meanings of special words?",
      narration: { audio: A("check-feature"), script: "Tool five, book helpers. A real fact book carries helpers beyond its pages. Suppose that next week you forget what envelope means, and you want this book to remind you. Which book helper gives the meanings of a book's special words? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-glossary", label: "the glossary" }, { id: "the-table-of-contents", label: "the table of contents" }, { id: "the-front-cover", label: "the front cover" }, { id: "the-page-numbers", label: "the page numbers" }], correctId: "the-glossary", coachWrong: "The cover shows the title, and the table of contents shows where the chapters start. You are hunting for a helper that keeps meanings." },
    },
    {
      id: "sort-up-down",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Goes Up, or Comes Down?",
      narration: { audio: A("sort-up-down"), script: "Now check the whole machine. Some of these moments make the balloon rise, and some bring it back down. Drag each one to where it belongs." },
      interaction: { type: "sort", buckets: ["Goes Up","Comes Down"], items: [{ label: "the burner shoots its flame", bucket: "Goes Up" }, { label: "the pilot opens the flap", bucket: "Comes Down" }, { label: "the air inside heats up", bucket: "Goes Up" }, { label: "hot air spills out the top", bucket: "Comes Down" }, { label: "hot air is lighter", bucket: "Goes Up" }, { label: "the air inside cools", bucket: "Comes Down" }], coachWrong: "Ask each card one question: does this make the air inside hotter, or does it let the heat get away?" },
    },
    {
      id: "sequence-flight",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Fly the whole trip in order.",
      narration: { audio: A("sequence-flight"), script: "Time to fly the whole trip. Here are four moments from one balloon ride, all mixed up. Think about what must happen before the balloon can ever leave the ground. Tap them in flight order." },
      interaction: { type: "sequence", items: [{ id: "the-flame-heats-the-air", label: "the flame heats the air" }, { id: "the-balloon-lifts-off", label: "the balloon lifts off" }, { id: "the-pilot-opens-the-flap", label: "the pilot opens the flap" }, { id: "the-balloon-floats-down", label: "the balloon floats down" }], order: ["the-flame-heats-the-air","the-balloon-lifts-off","the-pilot-opens-the-flap","the-balloon-floats-down"], coachWrong: "Start on the ground. Nothing lifts until the air inside is hot, and the flap only opens when it is time to come home." },
    },
    {
      id: "speak-teach-it",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: how does a hot air balloon fly?",
      narration: { audio: A("speak-teach-it"), script: "Now you be the teacher. Think about the whole book, from the flame to the landing. Tell me how a hot air balloon flies, in your own words." },
      interaction: { type: "speak", text: "burner flame fire heats hot air lighter rises rise lifts lift envelope bag basket balloon floats wind pilot flap rope opens spills sinks lands down up" },
    },
    {
      id: "challenge-weather-balloon",
      purpose: "challenge",
      gate: "interaction",
      prompt: "A brand new page, just for your ears.",
      narration: { audio: A("challenge-weather-balloon"), script: "Here comes the last challenge, and this page is from a third grade fact book, only for your ears, so gather your tools and listen with everything you have. A weather balloon carries no basket and no burner. It is filled with helium, a gas that is already lighter than air, so it climbs on its own, higher than any hot air balloon, while a little box of tools measures the sky. Before you answer, think like a strong reader: in the hot air balloon, the flame had one job, making the air inside lighter than the air outside. Now use the new page. Why does a weather balloon need no burner? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "helium-is-already-lighter", label: "helium is already lighter" }, { id: "it-never-leaves-the-ground", label: "it never leaves the ground" }, { id: "the-wind-pushes-it-higher", label: "the wind pushes it higher" }, { id: "its-box-of-tools-lifts-it", label: "its box of tools lifts it" }], correctId: "helium-is-already-lighter", coachWrong: "Ask what the flame's job was in the hot air balloon. Then listen again for what fills a weather balloon instead of hot air." },
    },
    {
      id: "celebrate-fact-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "You read the whole fact book!",
      fx: {"text":"**Every** tool. **One** true book.","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-reader"), script: "You did it! You read Up in a Balloon from cover to cover, a real fact book, and every tool showed up for work. You found each page's main point. The book taught you envelope and passengers all by itself. You picked the fact that proves a balloon needs heat, you knew where the glossary lives, and the drawing showed you where the hot air goes. You even solved a third grade page about weather balloons. That is reading to learn. You are ready for any fact book on any shelf." },
    },
  ],
};
