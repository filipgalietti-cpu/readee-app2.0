import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./because-then-so-timings.json";

// Because, Then, So (RI.3.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=because-then-so
// G3-U1 lesson 3. RI.3.3 = describe the relationship between ideas/events/steps
// in an informational text using TIME/SEQUENCE and CAUSE/EFFECT language.
// Sibling split: how-they-connect (RI.K.3, rain/seed/sun pictures), fact-links
// (RI.1.3, beaver pond, so/first/next/both), chains-and-steps (RI.2.3, maple
// syrup 4-step chain) own the younger versions. THIS lesson owns: a real
// 16-sentence chapter-length text, EXPLICIT signal-word language (time words
// first/while/finally/after vs cause words because/since/so/as a result),
// the after-vs-because distinction (two look-alike lines, only one tells why),
// and the child PRODUCING a connecting sentence. Anchor = "The Geyser That
// Keeps Its Promise" (Old Faithful, Yellowstone; every fact true: seep, hot
// rock from the volcanic system, narrow tube + weight = pressure, spill drops
// pressure, water flashes to steam, plume 100+ feet, refill, roughly hourly,
// named 1870 for its regularity). Transfer = a 6-sentence technical procedure
// (bottle geyser: vinegar + baking soda, steps numbered in words). Topic
// freshness swept: geyser/erupt/Yellowstone/vinegar/baking soda are catalog
// first-touch (popcorn was burned by read-to-learn-quiz; rain/seeds/beaver/
// moon/snow burned by the RI.x.3 siblings). No character names (informational).
// Stretch words with in-text support: seep (soaking slowly down), pressure
// (weight pushes down), plume (tower of water and steam), predict (post the
// time), faithfully (kept its schedule).

const A = (id: string) => `/audio/lessons-v2/because-then-so/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/because-then-so/${w.toLowerCase()}.png`;

export const becauseThenSoImages: Record<string, string> = {
  "geyser-crowd": "A crowd of visitors in jackets and hats sitting on long wooden benches in a wide semicircle, watching from a safe distance as a tall white plume of hot water and steam shoots straight up out of a low mound of pale grey rock, dark green pine trees and a bright blue sky behind, morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "underground-heat": "A cutaway side view of the ground beneath a geyser: layers of brown and grey rock, thin blue lines of water trickling down through cracks from the surface, a narrow winding tube of blue water deep in the rock, and glowing red and orange hot rock at the very bottom, a small puff of steam at the top opening, pine trees on the surface. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no writing anywhere.",
  "eruption-plume": "A close view of a geyser erupting, a huge column of white water and billowing steam blasting high into a blue sky from a pale rocky mound, sunlight glowing through the mist, tiny droplets sparkling, a few pine trees far below for scale. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "bottle-geyser": "A clear plastic bottle standing in a kitchen sink with a tall fountain of white fizzy foam shooting up out of its narrow neck, a plain unlabeled small cardboard box and a plain unlabeled glass bottle sitting on the counter beside the sink, a folded square of white tissue paper, tiled wall behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no writing anywhere.",
  "quiz-lightning-flash": "A single bright jagged lightning bolt flashing down from a dark purple storm cloud onto a wide open green field at dusk, a few raindrops falling, a distant line of low hills. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-storm-rain": "Heavy rain pouring in slanted lines from a huge dark grey storm cloud over a small town park with a bench and a pond, puddles splashing, no lightning. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-safe-indoors": "A young girl with curly black hair and a boy with red hair sitting cozily on a window seat inside a warm living room, looking out through a big window at a dark rainy storm sky, a lamp glowing beside them, a sleeping cat on a cushion. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const becauseThenSo: LessonDef = {
  id: "because-then-so",
  title: "Because, Then, So",
  grade: "3rd Grade",
  standard: "RI.3.3",
  archetype: "inference",
  objective: "I can find the words that connect facts in a text and explain how two ideas fit together using because, so, first, or after.",
  concepts: [
    "fact texts connect their facts, they do not just list them",
    "time words tell when and in what order: first, while, finally, after",
    "cause words tell why: because, since, so, as a result",
    "after tells when, because tells why, and they are not the same",
    "steps in a procedure connect in order, and some steps cause the next one",
    "explain a connection in a full sentence with because or so",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a true text the way a scientist reads it. You found the connecting words, you named the kind, and you explained why the geyser erupts in your own sentence. Time words tell you when. Cause words tell you why. From now on, when a fact text hands you two ideas, you will know exactly how they fit together.",
    "title": "Connection Finder!",
    "body": "You found the connecting words in a real text, told time words from cause words, and explained why Old Faithful erupts in a full sentence."
  },
  scenes: [
    {
      id: "hook-crowd-waits",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A true text about a famous geyser. Read along!",
      image: IMG("geyser-crowd"),
      narration: { audio: A("hook-crowd-waits"), script: "Hello, reader. Today you learn how third graders read a fact text the way a scientist does, by finding how one fact connects to the next. Our text takes you to a park where a crowd is waiting for something. Read page one along with me." },
      interaction: { type: "read-along", text: "In Yellowstone National Park, a crowd gathers on wooden benches and waits. Nobody is bored, because everyone knows what is coming. Soon a tower of hot water and steam will shoot out of the ground, and the crowd will cheer for Old Faithful, the most famous geyser in the world.", audio: A("hook-crowd-waits-sentence") },
    },
    {
      id: "model-find-because",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find a connecting word.",
      fx: {"text":"Nobody is bored, **because** everyone knows what is coming","effect":"underline"},
      narration: { audio: A("model-find-because"), script: "Look at page one again. It already holds a connection, and one small word points right at it. Nobody is bored, because everyone knows what is coming. There is the word. Because. Because tells me this is a cause. One thing makes another thing happen. Why is nobody bored? Because they know a show is coming. Fact texts are full of connecting words like this one, and they come in two kinds. Time words, such as first, next, after, and finally, tell you when things happen and in what order. Cause words, such as because, since, so, and as a result, tell you why something happens. When you find a connecting word, name its kind, and you know how the two ideas fit together." },
    },
    {
      id: "read-page-two",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page two. Read along!",
      image: IMG("underground-heat"),
      narration: { audio: A("read-page-two"), script: "Page two goes underground, where every eruption really starts. Read along with me, and watch for one time word and one cause word." },
      interaction: { type: "read-along", text: "The story of an eruption begins long before the crowd arrives. First, rain and melted snow seep into cracks in the ground, soaking slowly down through the rock. Deep underground, the rock is extremely hot, because Yellowstone sits on top of an ancient volcano. The hot rock heats the water the way a stove heats a kettle.", audio: A("read-page-two-sentence") },
    },
    {
      id: "guided-choose-cause-hot-rock",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why is the rock deep underground so hot?",
      narration: { audio: A("guided-choose-cause-hot-rock"), script: "Your turn to use a cause word. Page two said the rock deep underground is extremely hot, and it used the word because to tell you why. Because points to a cause. Why is the rock so hot? Read all four, then tap the cause the text gives." },
      interaction: { type: "choose", options: [{ id: "the-park-sits-on-a-volcano", label: "the park sits on a volcano" }, { id: "the-crowd-waits-on-benches", label: "the crowd waits on benches" }, { id: "rain-seeps-into-the-cracks", label: "rain seeps into the cracks" }, { id: "a-stove-heats-a-kettle", label: "a stove heats a kettle" }], correctId: "the-park-sits-on-a-volcano", coachWrong: "Think about the sentence with the word because in it. The cause comes right after that word." },
    },
    {
      id: "read-page-three",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      narration: { audio: A("read-page-three"), script: "Page three is about pressure. Read along with me, and notice that one connecting word tells why, and one only tells when." },
      interaction: { type: "read-along", text: "The hot water cannot boil right away, since it is trapped in a narrow tube under the weight of all the water above it. That weight pushes down and creates enormous pressure. The water grows hotter and hotter while the pressure builds.", audio: A("read-page-three-sentence") },
    },
    {
      id: "model-while-vs-because",
      purpose: "model",
      gate: "none",
      prompt: "Two lines look alike. Only one tells why.",
      fx: {"text":"**while** tells when, **because** tells why","effect":"pop-words"},
      narration: { audio: A("model-while-vs-because"), script: "Here are two lines that look almost alike. The water grows hotter while the pressure builds. The water grows hotter because the rock is hot. Only one of them tells you why. While is a time word. It says two things happen at the same time, and that is all it says. The pressure did not make the water hot. Because is a cause word. It points at the reason, the hot rock. So here is the test. Ask, does this word tell me why? If it only tells me when, it is a time word, even when the two facts sit side by side. After works the same way. If you eat lunch after you read, the reading did not cause your lunch." },
    },
    {
      id: "guided-sort-time-cause",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the connecting words: Time Words, or Cause Words?",
      narration: { audio: A("guided-sort-time-cause"), script: "Here are six connecting words from our text. Read each one and ask the test question. Does it tell me why? If it only tells you when, or in what order, drag it to Time Words. If it tells you why, drag it to Cause Words." },
      interaction: { type: "sort", buckets: ["Time Words","Cause Words"], items: [{ label: "first", bucket: "Time Words" }, { label: "because", bucket: "Cause Words" }, { label: "after", bucket: "Time Words" }, { label: "so", bucket: "Cause Words" }, { label: "finally", bucket: "Time Words" }, { label: "as a result", bucket: "Cause Words" }], coachWrong: "Put that word in a sentence in your head. Does it tell you why something happened, or only when it happened?" },
    },
    {
      id: "read-page-four",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page four. Read along!",
      image: IMG("eruption-plume"),
      narration: { audio: A("read-page-four"), script: "Page four is the big moment. Read along with me, and find the words that connect one event to the next." },
      interaction: { type: "read-along", text: "Finally, a little water near the top bubbles over and spills out, and the pressure on the deep water suddenly drops. As a result, the superhot water flashes into steam, and the steam pushes everything above it up the tube. The geyser erupts, and a plume of water and steam climbs higher than a ten story building.", audio: A("read-page-four-sentence") },
    },
    {
      id: "apply-choose-as-a-result",
      purpose: "apply",
      gate: "interaction",
      prompt: "The pressure drops. What happens as a result?",
      narration: { audio: A("apply-choose-as-a-result"), script: "Page four used the phrase as a result, and as a result works like the word so. It points to the effect, the thing that happens because of something else. The pressure on the deep water suddenly dropped. What happened as a result? Read all four, then tap it." },
      interaction: { type: "choose", options: [{ id: "the-water-flashes-into-steam", label: "the water flashes into steam" }, { id: "the-crowd-sits-on-benches", label: "the crowd sits on benches" }, { id: "rain-seeps-into-the-ground", label: "rain seeps into the ground" }, { id: "the-rock-heats-the-water", label: "the rock heats the water" }], correctId: "the-water-flashes-into-steam", coachWrong: "The effect comes right after the phrase as a result. Think about what the superhot water did once the pressure was gone." },
    },
    {
      id: "read-page-five",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along!",
      narration: { audio: A("read-page-five"), script: "Last page of the text. Read along with me, and notice how it uses after and so." },
      interaction: { type: "read-along", text: "After the eruption ends, the tube fills with water again, and the whole cycle starts over. Old Faithful erupts about once every hour or two, so rangers can predict its next show and post the time for visitors. More than one hundred and fifty years ago, explorers gave the geyser its name because it kept its schedule so faithfully.", audio: A("read-page-five-sentence") },
    },
    {
      id: "apply-sequence-eruption",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the steps of an eruption in order.",
      narration: { audio: A("apply-sequence-eruption"), script: "You read the whole text, and its time words told you the order. Now build that order yourself. Drag each step into the order it happens, from the very first step to the step that starts the cycle again." },
      interaction: { type: "sequence", items: [{ id: "water-seeps-underground", label: "water seeps underground" }, { id: "hot-rock-heats-the-water", label: "hot rock heats the water" }, { id: "pressure-builds-in-the-tube", label: "pressure builds in the tube" }, { id: "the-geyser-erupts", label: "the geyser erupts" }, { id: "the-tube-fills-up-again", label: "the tube fills up again" }], order: ["water-seeps-underground","hot-rock-heats-the-water","pressure-builds-in-the-tube","the-geyser-erupts","the-tube-fills-up-again"], coachWrong: "Walk it in order. Ask what has to happen before the water can get hot, and what has to happen before the tube can fill again." },
    },
    {
      id: "apply-speak-summary",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Old Faithful keeps its schedule because the same steps repeat under the ground. After each eruption, the tube fills again, so the next show is already on its way.",
      narration: { audio: A("apply-speak-summary"), script: "Here is a two sentence summary of our text, and it uses three connecting words. Read it out loud, clear and steady, and let every connecting word do its job." },
      interaction: { type: "speak", text: "Old Faithful keeps its schedule because the same steps repeat under the ground After each eruption the tube fills again so the next show is already on its way" },
    },
    {
      id: "read-procedure",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Directions for a bottle geyser. Read along!",
      image: IMG("bottle-geyser"),
      narration: { audio: A("read-procedure"), script: "Connecting words work in every kind of fact text, even a set of directions. This page tells you how to build a geyser of your own. Read along with me, and notice which words tell the order of the steps, and which words tell why." },
      interaction: { type: "read-along", text: "You can build a small geyser of your own in a kitchen sink. Step one, pour a cup of vinegar into an empty plastic bottle. Step two, wrap two spoonfuls of baking soda in a square of tissue paper. Step three, drop the tissue into the bottle and step back. As soon as the vinegar soaks through the paper, it mixes with the baking soda and makes a gas. The gas needs room to escape, so a fountain of fizz shoots out of the bottle.", audio: A("read-procedure-sentence") },
    },
    {
      id: "challenge-choose-fizz-cause",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Why does fizz shoot out of the bottle?",
      narration: { audio: A("challenge-choose-fizz-cause"), script: "Directions have connections too. Something in those steps makes the fizz shoot out of the bottle. Read all four, then tap the cause the directions give." },
      interaction: { type: "choose", options: [{ id: "the-gas-needs-room-to-escape", label: "the gas needs room to escape" }, { id: "the-bottle-is-plastic", label: "the bottle is plastic" }, { id: "the-tissue-is-a-square", label: "the tissue is a square" }, { id: "you-step-back-from-it", label: "you step back from it" }], correctId: "the-gas-needs-room-to-escape", coachWrong: "Find the last sentence of the directions, the one with the word so. The cause sits right before that word." },
    },
    {
      id: "challenge-speak-why-erupts",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell me why Old Faithful erupts. Use because or so.",
      narration: { audio: A("challenge-speak-why-erupts"), script: "Last one, and now the sentence is yours. Think back over the whole text. Tap the mic and tell me why Old Faithful erupts, in one full sentence that uses because or so." },
      interaction: { type: "speak", text: "steam pressure push pushes pushed pushing hot heat heats heated water rock boils boiling trapped tube drops escape spills" },
    },
    {
      id: "celebrate-connection-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "Time words tell when. Cause words tell why.",
      fx: {"text":"Time words tell **when**, cause words tell **why**","effect":"fireworks"},
      narration: { audio: A("celebrate-connection-finder"), script: "You read a true text the way a scientist reads it. Time words such as first, while, finally, and after told you when things happened and in what order. Cause words such as because, since, so, and as a result told you why. You told the two apart, you put the steps in order, and you explained an eruption in your own sentence. Every fact text you open from now on is full of connections, and you know how to find them." },
    },
  ],
};
