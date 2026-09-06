import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./long-word-trains-timings.json";

// Long Word Trains (RF.3.3b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=long-word-trains
// G3 lesson 2. DECODING tier of RF.3.3 (sibling split: meaning-machines RF.3.3a
// owns the MEANING of derivational affixes; THIS lesson owns reading long
// suffixed words smoothly by chunking). Latin suffix set as DECODE chunks:
// -tion/-sion (shun), -ture (chur), -ous (us), -able/-ible (uh bul). Frame =
// Grandpa Ray's rail yard: a long word is a train, chunks are cars, the suffix
// is the caboose ("same caboose, same sound, every time"). Meanings stay
// light; chunk-and-snap decoding is the star. ANCHOR FRESHNESS swept vs
// meaning-machines lesson+quiz (invention/celebration/subtraction/enjoyable/
// breakable/washable/movable/invitation/portable/telescope/construction/
// transport all burned), decoding-champions (remarkable/vacation burned),
// word-math, prefix-suffix-decoders, prefix-power, root-clues, ending-readers,
// word-changers: all word sets here are fresh (tradition, tremendous, caution,
// hibernation, fraction, lotion, mixture, sculpture, pasture, future, capture,
// famous, poisonous, dangerous, terrible, incredible, agreeable, education,
// vulture, imagination). TTS carriers per pilot precedent: "the shun ending,
// spelled t, i, o, n" / "the chur ending, spelled t, u, r, e" / "the us
// ending, spelled o, u, s" / "the uh bul ending, spelled a, b, l, e" (bare
// "tion"/"ture"/"ous" are TTS-unstable).

const A = (id: string) => `/audio/lessons-v2/long-word-trains/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/long-word-trains/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/long-word-trains/${w.toLowerCase()}.png`;

export const longWordTrainsImages: Record<string, string> = {
  "train-yard": "A young girl with dark curly hair in a yellow jacket and her smiling grandfather in a flat cap standing behind a low safety fence at a rail yard, watching a long freight train of plain colorful boxcars roll past with a bright red caboose at the very end, morning sunshine, a signal light on a post. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "poison-frog": "A tiny bright blue frog with black spots sitting proudly on a big green rainforest leaf, shiny skin, colorful jungle plants and dew drops all around. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "double-rainbow": "A young girl standing in a wet green field pointing up in wonder at TWO rainbows in the sky at once, one big bright rainbow arc with a second smaller fainter rainbow arc floating above it, both arcs fully visible, a few grey storm clouds drifting away, puddles on the grass. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-potion": "A round glass bottle full of bubbling bright purple liquid with a cork on top, sitting on a wooden shelf with soft sparkles rising from its neck. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-creature": "A friendly round furry creature with big kind eyes, tiny horns, and a fluffy teal coat, sitting on a mossy stone in a sunny forest clearing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-joyous": "A crowd of happy children waving colorful streamers and cheering at a sunny street parade, confetti floating in the air. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const longWordTrains: LessonDef = {
  id: "long-word-trains",
  title: "Long Word Trains",
  grade: "3rd Grade",
  standard: "RF.3.3b",
  archetype: "phonics",
  objective: "I can read long words by chunking them, the front cars first and the suffix caboose last.",
  concepts: [
    "a long word is a train of chunks, and the suffix is the caboose",
    "the ending tion always says shun",
    "the ending ture always says chur",
    "the ending ous always says us",
    "able and ible both say uh bul",
    "same caboose, same sound, every time",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Long words cannot slow you down anymore. You found the caboose, you read the front cars, and you snapped whole trains together. Tradition, capture, dangerous, incredible, imagination. You read every one of them chunk by chunk, and that is exactly how strong readers handle giant words.",
    "title": "Long Word Engineer!",
    "body": "You decoded long words with Latin suffix endings by reading them chunk by chunk and snapping them together."
  },
  scenes: [
    {
      id: "hook-train-yard",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about the rail yard. Read along!",
      image: IMG("train-yard"),
      narration: { audio: A("hook-train-yard"), script: "Hello, reader. Today you learn how third graders read giant words without slowing down. The trick starts at a rail yard. Read along with me, and keep your eye on the caboose." },
      interaction: { type: "read-along", text: "Every Saturday, by family tradition, Deja and Grandpa Ray walked down to the rail yard to watch the morning freight roll through. A tremendous engine thundered past, pulling car after car, and a bright red caboose rode at the very end of the line. \"A train is like a long word,\" said Grandpa Ray. \"Nobody reads it in one gulp. You read it car by car, and the caboose comes last, every single time.\" Deja grinned, because she planned to try that trick on the longest words in her books.", audio: A("hook-train-yard-sentence") },
    },
    {
      id: "model-shun-caboose",
      purpose: "model",
      gate: "none",
      prompt: "Spot the caboose first: tion says shun.",
      fx: {"text":"**tra** **di** **tion** snaps into **tradition**","effect":"pop-words"},
      narration: { audio: A("model-shun-caboose"), script: "Grandpa Ray's trick works on words, because a long word is a train of chunks, and the ending chunk is the caboose. Here is the first caboose, the shun ending, spelled t, i, o, n. It always says shun. Watch me read the word tradition car by car. I spot the caboose first, and it says shun. Then I read the front cars, truh, then dih. Now I snap the whole train together, truh, dih, shun, tradition. The caboose never changes its sound." },
    },
    {
      id: "guided-choose-caution",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says caution.",
      narration: { audio: A("guided-choose-caution"), script: "Your turn to use the caboose. A yellow sign near the tracks warns visitors to slow down and stay alert. The word on that sign is caution. Read each word car by car, check its ending, and tap the word that says caution." },
      interaction: { type: "choose", options: [{ id: "caution", label: "caution" }, { id: "cotton", label: "cotton" }, { id: "carton", label: "carton" }, { id: "cushion", label: "cushion" }], correctId: "caution", coachWrong: "Check the end of each word first. Only one of them carries the shun caboose, spelled t, i, o, n." },
    },
    {
      id: "guided-sequence-hibernation",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Snap the cars into order: hibernation.",
      narration: { audio: A("guided-sequence-hibernation"), script: "Some trains run longer. A bear sleeps through the whole winter, and that long sleep is called hibernation. Here is hibernation with its cars uncoupled. Drag the chunks into reading order, the front cars first, then the shun caboose, and the whole word at the end of the line." },
      interaction: { type: "sequence", items: [{ id: "hi", label: "hi" }, { id: "ber", label: "ber" }, { id: "na", label: "na" }, { id: "tion", label: "tion" }, { id: "hibernation", label: "hibernation" }], order: ["hi","ber","na","tion","hibernation"], coachWrong: "Say hibernation slowly and listen for each chunk in order. Start with the first sound you hear, and save the whole word for the end of the line." },
    },
    {
      id: "model-chur-caboose",
      purpose: "model",
      gate: "none",
      prompt: "A second caboose: ture says chur.",
      fx: {"text":"**fu** plus **ture** snaps into **future**","effect":"magic"},
      narration: { audio: A("model-chur-caboose"), script: "Here is the second caboose, the chur ending, spelled t, u, r, e. It always says chur. Watch it ride at the end of two trains. Future. I read the caboose, chur, then the front car, few, and I snap it together, future. Capture. The front car says cap, the caboose says chur, capture. Two different trains, same caboose, same sound." },
    },
    {
      id: "guided-sort-shun-chur",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words by their caboose.",
      narration: { audio: A("guided-sort-shun-chur"), script: "Six words are waiting in the yard, and every one carries a caboose you know. Read each word car by car and look at its ending. If the caboose says shun, drag the word to Says Shun. If the caboose says chur, drag it to Says Chur." },
      interaction: { type: "sort", buckets: ["Says Shun","Says Chur"], items: [{ label: "fraction", bucket: "Says Shun" }, { label: "mixture", bucket: "Says Chur" }, { label: "lotion", bucket: "Says Shun" }, { label: "sculpture", bucket: "Says Chur" }, { label: "tradition", bucket: "Says Shun" }, { label: "pasture", bucket: "Says Chur" }], coachWrong: "Look at the last four letters of that word. The shun caboose is spelled t, i, o, n, and the chur caboose is spelled t, u, r, e." },
    },
    {
      id: "model-us-caboose",
      purpose: "model",
      gate: "none",
      prompt: "A third caboose: ous says us.",
      image: IMG("poison-frog"),
      narration: { audio: A("model-us-caboose"), script: "The third caboose is the us ending, spelled o, u, s, and it says us. Watch it work. This tiny rainforest frog is famous, because its bright skin warns that it is poisonous. Famous. I read it car by car, fay, mus, famous. Poisonous. Poy, zun, us, poisonous. When you spot the us caboose, the end of a long word is already read." },
    },
    {
      id: "guided-transform-dangerous",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word that describes the cliff trail.",
      narration: { audio: A("guided-transform-dangerous"), script: "Now you build the train. The park ranger warns hikers about the steep cliff trail, because one wrong step up there is not safe. The base word is danger, and the word you want describes that trail. Snap on the caboose that says us." },
      interaction: { type: "transform", base: "danger", add: "ous", result: "dangerous", changeIndex: 5, options: ["ous", "tion", "ture"], labels: { added: "says us" }, successAudio: W("dangerous"), coachWrong: "Say us to yourself, then check each caboose. Only one of them is spelled o, u, s." },
    },
    {
      id: "apply-speak-caution-sign",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Use caution near the pasture, because those plants are poisonous.",
      narration: { audio: A("apply-speak-caution-sign"), script: "Here is a warning a ranger might post, and it holds three long trains. Read the sentence out loud, car by car if you need to, then smooth and strong." },
      interaction: { type: "speak", text: "Use caution near the pasture because those plants are poisonous" },
    },
    {
      id: "model-uhbul-caboose",
      purpose: "model",
      gate: "none",
      prompt: "The last caboose: able and ible say uh bul.",
      image: IMG("double-rainbow"),
      narration: { audio: A("model-uhbul-caboose"), script: "One caboose is left, and it comes in two spellings. The uh bul ending can be spelled a, b, l, e, or i, b, l, e, and both say uh bul. Last night's storm was terrible. Tare, ruh, bul, terrible. This morning's double rainbow is incredible. In, cred, uh, bul, incredible. Two spellings, one sound, and the caboose still comes last." },
    },
    {
      id: "guided-transform-agreeable",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word that describes Deja's plan.",
      narration: { audio: A("guided-transform-agreeable"), script: "Now build one more train. Everyone at the club meeting liked Deja's bake sale plan, because it was easy to say yes to. Her plan was easy to agree with. Start with the base agree, and snap on the caboose that says uh bul." },
      interaction: { type: "transform", base: "agree", add: "able", result: "agreeable", changeIndex: 4, options: ["able", "ous", "ture"], labels: { added: "says uh bul" }, successAudio: W("agreeable"), coachWrong: "Say uh bul to yourself, then read each caboose. Find the spelling a, b, l, e." },
    },
    {
      id: "apply-choose-chunk-count",
      purpose: "apply",
      gate: "interaction",
      prompt: "How many chunks are in the word education?",
      narration: { audio: A("apply-choose-chunk-count"), script: "Now count the cars on this train. The long word on your screen names everything school teaches you. Read it car by car, count every chunk including the caboose, and tap the number of chunks you read." },
      interaction: { type: "choose", options: [{ id: "two-chunks", label: "two chunks" }, { id: "three-chunks", label: "three chunks" }, { id: "four-chunks", label: "four chunks" }, { id: "five-chunks", label: "five chunks" }], correctId: "four-chunks", coachWrong: "Read the word again slowly and clap once for each chunk you say. Count the caboose too." },
    },
    {
      id: "apply-speak-park-passage",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: The famous sculpture in the park was shaped like a tremendous vulture. Deja read its sign car by car, and not one long word could stop her.",
      narration: { audio: A("apply-speak-park-passage"), script: "This little passage is packed with long trains. Read both sentences out loud with a clear, steady voice, and let every caboose do its job." },
      interaction: { type: "speak", text: "The famous sculpture in the park was shaped like a tremendous vulture Deja read its sign car by car and not one long word could stop her" },
    },
    {
      id: "apply-choose-imagination",
      purpose: "apply",
      gate: "interaction",
      prompt: "Find the word that says imagination.",
      narration: { audio: A("apply-choose-imagination"), script: "Here is a giant train nobody has read for you. Deja closed her eyes and pictured a castle made of clouds, using nothing but her imagination. One of these words says imagination, and the others are close enough to fool a hasty reader. Read every car, then tap the word that says imagination." },
      interaction: { type: "choose", options: [{ id: "imagination", label: "imagination" }, { id: "imitation", label: "imitation" }, { id: "instruction", label: "instruction" }, { id: "inspection", label: "inspection" }], correctId: "imagination", coachWrong: "Slow the train down and read every front car before the caboose. The fakes only match part of the word." },
    },
    {
      id: "challenge-speak-plan",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell me your plan for reading a giant new word.",
      narration: { audio: A("challenge-speak-plan"), script: "This is your last stop, engineer. Tomorrow a giant word you have never seen will roll into one of your books. Tap the mic and tell me your plan for reading it, step by step." },
      interaction: { type: "speak", text: "chunk chunks car cars caboose ending suffix part parts piece pieces break broke split snap read small little slow first spot find together whole" },
    },
    {
      id: "celebrate-word-engineer",
      purpose: "celebrate",
      gate: "none",
      prompt: "Same caboose, same sound, every time.",
      fx: {"text":"Same caboose, same sound, **every time**","effect":"fireworks"},
      narration: { audio: A("celebrate-word-engineer"), script: "You ran the whole rail yard today. The shun ending is spelled t, i, o, n, and the chur ending is spelled t, u, r, e. The us ending is spelled o, u, s, and the uh bul ending is spelled a, b, l, e, or i, b, l, e. Same caboose, same sound, every single time. When a giant word rolls into your book, you will not skip it, and you will not swallow it whole. You will read it car by car, snap it together, and roll right on." },
    },
  ],
};
