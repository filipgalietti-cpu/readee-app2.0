import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./big-idea-backed-up-timings.json";

// Big Idea, Backed Up (RI.3.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=big-idea-backed-up
// G3-U1. MAIN IDEA + KEY DETAILS + HOW THEY SUPPORT IT tier of RI.3.2.
// Sibling split: whats-it-about (RI.K.2, bees) owns K "what is it all about",
// topic-spotter (RI.1.2, the moon) owns the G1 main topic, paragraph-power
// (RI.2.2, recycling trucks) owns G2 main topic of a whole text + the job of
// each paragraph, point-to-the-fact (RI.3.1, redwoods) owns pointing to the
// sentence that answers a question, because-then-so (RI.3.3, Old Faithful)
// owns time/cause connections, hold-it-up (RI.2.8) owns an AUTHOR'S POINT and
// its reasons (stool legs). THIS lesson owns the G3 step-up: the big idea is a
// full SENTENCE about a multi-page text (a topic is a word, a big idea is a
// sentence), a KEY detail (holds the big idea up, a tent pole) is told from an
// INTERESTING detail (a flag on the tent, true but pull it out and the idea
// still stands), the too-small trap (one page's detail dressed as the big
// idea), and the child EXPLAINS the support in a two-part sentence: "The text
// says X. That backs up the big idea because Y." ONE original informational
// text, "The Town Under the Grass" (prairie dogs; every fact true: ground
// squirrels of the North American plains, hunted by coyotes/hawks/badgers,
// colonies called towns holding hundreds, tunnel mazes with sleeping/nursery/
// toilet rooms, entrance mounds that keep rain out and serve as lookout posts,
// a sentry on its back feet while the others feed, alarm bark and the dive
// underground, distinct calls for a hawk and a coyote (Slobodchikoff), the
// jump-yip that spreads in a wave, the teeth-touch greeting), 16 sentences
// over 5 child-read pages (read-along 1/3/5 with images, speak 2/4), compound
// + early-complex sentences, no digits, stretch words colony / mound / sentry
// / predators with in-text support. Planted: the too-small idea (a sentry
// stands on a mound), the true-but-off-idea details (short tail, teeth-touch
// greeting, nibbling grass), and the big idea the text adds up to (living
// together in a town keeps prairie dogs safe). ANCHOR FRESHNESS grep-swept vs
// every lessons-v2 + quizzes-v2 file: prairie dog, coyote, colony, sentry,
// mound, ground squirrel, jump/yip all 0 hits (penguin huddle, sea otters,
// octopus, beavers rejected as burned). Keys prefixed quiz- are picture
// supports for the quiz's all-fresh earthworm text (worm/soil/castings/dead
// leaves all 0 hits as a text).

const A = (id: string) => `/audio/lessons-v2/big-idea-backed-up/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/big-idea-backed-up/${w.toLowerCase()}.png`;

export const bigIdeaBackedUpImages: Record<string, string | { subject: string; ref?: string }> = {
  "prairie-dog-lookout": "A small tan and brown prairie dog with a short dark-tipped tail, round dark eyes, and small ears, poking its head and shoulders up out of a round burrow hole in the middle of a wide flat grassland of short green and golden grass, low rolling hills far in the distance under a big clear blue sky, a few small dirt mounds dotted across the grass behind it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "sentry-mound": { subject: "The same small tan and brown prairie dog standing straight up on its back feet on top of a low round mound of packed brown dirt with a dark burrow hole beside it, front paws held against its chest, looking alertly toward the sky, while three other prairie dogs on all fours nibble short green grass nearby, one tiny dark hawk silhouette very high and far away in the wide blue sky, flat grassland stretching to the horizon. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "prairie-dog-lookout" },
  "all-clear-jump": { subject: "The same small tan and brown prairie dog standing on its back feet on green grass with both front paws thrown straight up into the air and its mouth open wide as if calling out, two more prairie dogs behind it doing the exact same stretch with paws in the air, several low brown dirt mounds with dark burrow holes scattered across a sunny flat grassland, clear blue sky, no birds in the sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "prairie-dog-lookout" },
  "quiz-worm-tunnels": "A cutaway side view of rich dark brown garden soil below a strip of green grass, showing several thin winding tunnels running down through the dirt and one long pink earthworm curled inside a tunnel, tiny white plant roots reaching down from the grass into the soil, small pebbles, a pale blue sky above the grass. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-worm-rain": "Three long plain pink earthworms, real worms with segmented bodies and NO faces, no eyes, no mouths, no smiles, stretched out on a wet gray garden path beside green grass, big puddles reflecting a cloudy sky, a few last raindrops falling, wet dark soil at the edge of the path, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-worm-leaf": "A close side view of one plain pink earthworm, a real segmented worm with NO face, no eyes, no mouth, half inside a small hole in dark brown garden soil with the tip of its body wrapped around the stem of a brown fallen leaf that is being dragged down into the hole, a few more brown and orange fallen leaves scattered on the soil around it, green grass blades at the edges. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const bigIdeaBackedUp: LessonDef = {
  id: "big-idea-backed-up",
  title: "Big Idea, Backed Up",
  grade: "3rd Grade",
  standard: "RI.3.2",
  archetype: "inference",
  objective: "I can find the big idea of a whole fact text, tell which details hold it up, and explain how they back it up.",
  concepts: [
    "a topic is a word, a big idea is a sentence about the whole text",
    "the big idea is what all the pages add up to",
    "key details hold the big idea up, like poles hold up a tent",
    "a true, interesting detail is not always a key detail",
    "a detail that covers only one page is too small to be the big idea",
    "explain the support: the text says X, and that backs up the big idea because Y",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You found the big idea of a whole true text, you sorted the details that hold it up from the ones that are just interesting, and you explained the support in your own sentence. That is the third grade way to read a fact text.",
    "title": "Big Idea, Backed Up!",
    "body": "You named the big idea of a whole text, found the key details that hold it up, and explained how they back it up."
  },
  scenes: [
    {
      id: "hook-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Town Under the Grass, page one. Read along!",
      image: IMG("prairie-dog-lookout"),
      narration: { audio: A("hook-page-one"), script: "Hello, reader. Today you find the big idea of a true text, and then you back it up. Third graders do not stop at what a text is about. They say the one big thing the whole text adds up to, and they show which details hold it up. Here is page one of a true text called The Town Under the Grass. Read along with me." },
      interaction: { type: "read-along", text: "On the wide, grassy plains of North America, a small brown animal pops its head out of a hole, looks all around, and barks. It is a prairie dog, a kind of ground squirrel with a short tail, sharp eyes, and a loud voice. A prairie dog never lives alone, because one prairie dog by itself would not last long against the coyotes, hawks, and badgers that hunt it.", audio: A("hook-page-one-sentence") },
    },
    {
      id: "model-topic-vs-big-idea",
      purpose: "model",
      gate: "none",
      prompt: "A topic is a word. A big idea is a sentence.",
      fx: {"text":"A topic is a **word**. A big idea is a **sentence**.","effect":"pop-words"},
      narration: { audio: A("model-topic-vs-big-idea"), script: "Here is the difference between second grade and third grade. In second grade you found the topic, and a topic is a word or two. The topic of this text is prairie dogs. I can tell that from page one. But the big idea is a whole sentence about the whole text. It says what all the pages add up to, and I cannot write that sentence yet, because I have only read one page. So here is what I do. Page one gave me a clue. It says a prairie dog never lives alone, because one by itself would not last long. I hold on to that clue, and I read on to see if every page points the same way." },
    },
    {
      id: "page-two-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Instead, hundreds of prairie dogs live together in one big colony, and people call a colony like that a town. A town is a maze of tunnels dug deep under the grass, with separate rooms for sleeping, for raising babies, and even for going to the bathroom. Deep in those tunnels, a prairie dog is out of reach of almost every hunter on the plain.",
      narration: { audio: A("page-two-read"), script: "Page two is yours. Read all three sentences out loud, and notice what a town is made of." },
      interaction: { type: "speak", text: "Instead hundreds of prairie dogs live together in one big colony and people call a colony like that a town A town is a maze of tunnels dug deep under the grass with separate rooms for sleeping for raising babies and even for going to the bathroom Deep in those tunnels a prairie dog is out of reach of almost every hunter on the plain" },
    },
    {
      id: "page-three-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("sentry-mound"),
      narration: { audio: A("page-three-read"), script: "Page three is about the mounds, and about a job one prairie dog does for all the others. Read along with me." },
      interaction: { type: "read-along", text: "Every hole has a mound of packed dirt around it, and each mound does two jobs at once. It keeps rainwater from pouring down into the tunnels, and it gives a sentry, a prairie dog on lookout duty, a high spot to watch from. While the others nibble grass, the sentry stands tall on its back feet and scans the sky and the ground for predators, the animals that hunt prairie dogs.", audio: A("page-three-read-sentence") },
    },
    {
      id: "model-poles-and-flags",
      purpose: "model",
      gate: "none",
      prompt: "Key details hold the big idea up.",
      fx: {"text":"Key details are the **poles**. Interesting details are the **flags**.","effect":"underline"},
      narration: { audio: A("model-poles-and-flags"), script: "Here is a picture to keep. Think of a big idea as a tent. A tent cannot stand on its own. Poles hold it up. In a text, the poles are the key details, the facts that hold the big idea up. Now picture a little flag on top of the tent. It is pretty, and it is really there, but if you pulled it off, the tent would still stand. Some details in a text are like that flag. They are true and interesting, but they do not hold the big idea up. Here is a tiny example. The big idea is, a garden takes a lot of work. Somebody waters it every morning. That is a pole. Somebody pulls the weeds every Friday. Another pole. The tomatoes are bright red. True, and nice to know, but does it show that the garden takes work? No. That one is a flag. As you read the rest of our text, sort the facts in your head. Pole, or flag?" },
    },
    {
      id: "page-four-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: When the sentry spots danger, it gives a sharp bark, and every prairie dog close enough to hear it dives underground. Scientists who listened closely found that the barks are not all the same. A prairie dog uses one call for a hawk and a different call for a coyote, so the whole town knows what is coming before it even looks.",
      narration: { audio: A("page-four-read"), script: "Page four is yours, and it holds the loudest part of the text. Read all three sentences out loud." },
      interaction: { type: "speak", text: "When the sentry spots danger it gives a sharp bark and every prairie dog close enough to hear it dives underground Scientists who listened closely found that the barks are not all the same A prairie dog uses one call for a hawk and a different call for a coyote so the whole town knows what is coming before it even looks" },
    },
    {
      id: "page-five-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("all-clear-jump"),
      narration: { audio: A("page-five-read"), script: "Here is the last page. Read along with me, and keep asking what the whole text adds up to." },
      interaction: { type: "read-along", text: "When the danger has passed, one prairie dog throws its front paws into the air and gives a loud yip, and the others copy it in a wave across the town. Then the colony climbs back out to eat. Prairie dogs also greet their family members by touching their teeth together, almost like a kiss. For an animal this small, living close together is the best protection there is.", audio: A("page-five-read-sentence") },
    },
    {
      id: "guided-choose-big-idea",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence is the big idea of the whole text?",
      narration: { audio: A("guided-choose-big-idea"), script: "You read all five pages. Now write the sentence in your head, the one big thing every page adds up to. Four sentences are on your screen. One is big enough to cover the whole text. One is true but only covers one page. One is true but is not the point. And one is not in the text at all. Read all four, then tap the big idea." },
      interaction: { type: "choose", options: [{ id: "the-town-keeps-them-safe", label: "the town keeps them safe" }, { id: "a-sentry-stands-on-a-mound", label: "a sentry stands on a mound" }, { id: "prairie-dogs-eat-grass", label: "prairie dogs eat grass" }, { id: "hawks-build-big-nests", label: "hawks build big nests" }], correctId: "the-town-keeps-them-safe", coachWrong: "Test it against every page. Does that sentence cover page one, page three, and page five? If it fits only one page, or if it is not what the pages keep coming back to, look again." },
    },
    {
      id: "guided-choose-backs-it-up",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail backs up the big idea?",
      narration: { audio: A("guided-choose-backs-it-up"), script: "Now find a pole. The big idea is that the town keeps prairie dogs safe. Four pieces of the text are on your screen, and every one of them is really in the text. Only one of them holds the big idea up. Tap the piece that backs up the big idea." },
      interaction: { type: "choose", options: [{ id: "dives-underground", label: "dives underground" }, { id: "a-kind-of-ground-squirrel", label: "a kind of ground squirrel" }, { id: "touching-their-teeth", label: "touching their teeth" }, { id: "the-others-nibble-grass", label: "the others nibble grass" }], correctId: "dives-underground", coachWrong: "That piece is in the text, but pull it out and the big idea still stands. Find the piece that shows how the town protects a prairie dog from a hunter." },
    },
    {
      id: "apply-sort-poles-flags",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the details: Holds It Up, or Just Interesting?",
      narration: { audio: A("apply-sort-poles-flags"), script: "Here are six details from our text, and every one of them is true. Ask the tent question for each one. If you pulled this detail out, would the big idea still stand? If the detail holds the big idea up, drag it to Holds It Up. If it is only a flag, drag it to Just Interesting." },
      interaction: { type: "sort", buckets: ["Holds It Up","Just Interesting"], items: [{ label: "a sentry on lookout duty", bucket: "Holds It Up" }, { label: "short tail and sharp eyes", bucket: "Just Interesting" }, { label: "one call for each hunter", bucket: "Holds It Up" }, { label: "they greet by touching teeth", bucket: "Just Interesting" }, { label: "the town dives underground", bucket: "Holds It Up" }, { label: "they nibble grass", bucket: "Just Interesting" }], coachWrong: "Ask the tent question again. If you pulled that detail out of the text, would the big idea still stand? If it would, that detail is only a flag." },
    },
    {
      id: "model-support-sentence",
      purpose: "model",
      gate: "none",
      prompt: "The text says X. That backs up the big idea because Y.",
      fx: {"text":"The text says **X**. That backs up the big idea because **Y**.","effect":"typewriter"},
      narration: { audio: A("model-support-sentence"), script: "Sorting is good. Third graders go one step further and explain the support out loud, in a sentence with two parts. Listen. The text says a sentry stands on a mound and scans the sky and the ground for predators. That backs up the big idea because a lookout spots danger early, and spotting danger early is one way the town keeps everyone safe. Part one names the detail. Part two tells how it holds the big idea up. The word because is the hinge between them. In a minute you will build one of these yourself." },
    },
    {
      id: "apply-choose-why-backs-up",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why does that detail back up the big idea?",
      narration: { audio: A("apply-choose-why-backs-up"), script: "Here is a detail. The text says a prairie dog uses one call for a hawk and a different call for a coyote. That backs up the big idea because, and now you finish the sentence. Read all four endings, then tap the one that tells how the detail holds the big idea up." },
      interaction: { type: "choose", options: [{ id: "the-town-knows-who-is-coming", label: "the town knows who is coming" }, { id: "the-calls-sound-like-a-dog", label: "the calls sound like a dog" }, { id: "hawks-have-sharper-eyes", label: "hawks have sharper eyes" }, { id: "the-sentry-gets-to-eat-first", label: "the sentry gets to eat first" }], correctId: "the-town-knows-who-is-coming", coachWrong: "The ending has to connect the calls to staying safe. What does the town get to do when it knows which hunter is on the way?" },
    },
    {
      id: "apply-sequence-big-idea-first",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build it: the big idea first, then its poles in text order.",
      narration: { audio: A("apply-sequence-big-idea-first"), script: "Now build the whole thing. The big idea goes first, at the top. Under it go three details that hold it up, in the order the text gave them, from page two to page four. Drag the four pieces into that order." },
      interaction: { type: "sequence", items: [{ id: "the-town-keeps-them-safe", label: "the town keeps them safe" }, { id: "tunnels-deep-under-the-grass", label: "tunnels deep under the grass" }, { id: "a-lookout-on-every-mound", label: "a lookout on every mound" }, { id: "a-bark-that-names-the-hunter", label: "a bark that names the hunter" }], order: ["the-town-keeps-them-safe","tunnels-deep-under-the-grass","a-lookout-on-every-mound","a-bark-that-names-the-hunter"], coachWrong: "Start with the sentence that covers the whole text. Then walk the pages in order. What did page two describe, then page three, then page four?" },
    },
    {
      id: "challenge-speak-big-idea-and-detail",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the big idea, then one detail that backs it up. Start the detail with, the text says.",
      narration: { audio: A("challenge-speak-big-idea-and-detail"), script: "Last one, and this time the sentence is yours. Tap the mic. First tell me the big idea of the whole text in one sentence. Then say, the text says, and give one detail that holds it up." },
      interaction: { type: "speak", text: "town towns safe safer safety together colony sentry lookout lookouts mound mounds bark barks barking warning call calls tunnels tunnel underground dive dives dig hide hides danger predators hunters hawk coyote protection protects" },
    },
    {
      id: "celebrate-backed-up",
      purpose: "celebrate",
      gate: "none",
      prompt: "Big idea, backed up.",
      fx: {"text":"Big idea, **backed up**","effect":"fireworks"},
      narration: { audio: A("celebrate-backed-up"), script: "Today you did what third grade readers do. You read a whole true text, and you named the one big idea it adds up to, in a full sentence. You told the poles from the flags, the details that hold the big idea up from the ones that are only interesting. And you explained the support in your own words, with the text says and because. Every fact text you read from now on has a big idea inside it, and you know how to back it up." },
    },
  ],
};
