import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-connections-timings.json";

// Word Connections (L.3.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-connections
// G3-U2 UMBRELLA CAPSTONE of the L.3.5 family (precedent: three-word-tools
// L.3.4, word-solvers L.2.4). No new tool is taught. Sibling split honored:
// sayings-that-mean-more (L.3.5a) owns the four-step saying move + its bank
// of sayings, words-in-action (L.3.5b) owns the word-example-because move
// on precise tier-2 words, same-and-opposite (L.2.5) / just-right-words /
// strong-words own the lower-grade pairs and shades, category-captain owns
// categories, more-than-it-says (RL.3.4) owns phrases inside a story,
// three-word-tools (L.3.4) owns the meaning tools, and shades of meaning
// (L.3.5c) stays in Unit 3 and is NOT touched here. THIS owns: a word is
// never alone, it connects four ways (a SAYING people use it in, a REAL-LIFE
// example with a because, a NEAR-SAME word, its OPPOSITE), and the capstone's
// only new work is CHOOSING which connection a question is asking for before
// answering it. ONE story: the day before and the morning of the Spruce Hill
// Derby (Paloma, cousin Lars, Uncle Basil, a crate car on wagon wheels), 16
// sentences over 5 child-read pages (read-along 1/3/5 with ref-chained images,
// speak 2/4 = two 3-sentence accept-mode reads), compound + early-complex,
// tagged dialogue, no digits, no contractions inside read-along text. Planted
// words: sharp (p1, model + sort), tight (p2, which-connection + saying),
// safe (p3, real-life example + because), clear (p4, opposite from the text),
// proud (p5, fresh word: which-connection, then answer, then production).
// Sayings planted in the text: sit tight, better safe than sorry, loud and
// clear, proud as a peacock, sharp as a tack. ANCHOR FRESHNESS python-swept
// across every lessons-v2 + quizzes-v2 file BEFORE writing: all five sayings
// 0 hits; derby, crate, Spruce Hill, hay bales, seat belt, peacock, ashamed,
// pleased, blunt, pointy, rigid 0 hits; sharp/tight/safe/clear/proud appear
// only as incidental prose elsewhere, never as taught example words (stubborn
// was dropped because it sits in why-they-did-it's accept list, fair because
// word-math teaches un+fair, treehouse because pictures-that-teach owns it,
// helmet because smooth-and-sure carries it, snug because word-wonder owns it,
// dull/smooth/full/slow because same-and-opposite or strong-words carry them
// as tiles); names Paloma, Lars, Basil fresh (Greta burned by
// follow-the-message-quiz). Keys prefixed quiz- are fresh picture supports for
// the quiz (a tire swing over the reservoir swimming hole: Esme, Benji, Aunt
// Ramona). Tiles lowercase, audio-free, kebab ids, 28-char cap; speak texts
// carry no " my "; speak scenes imageless; model scenes gate none.

const A = (id: string) => `/audio/lessons-v2/word-connections/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-connections/${w.toLowerCase()}.png`;

export const wordConnectionsImages: Record<string, string | { subject: string; ref?: string }> = {
  "garage-build": "The inside of a small home garage with the door open to a sunny driveway, a young girl with brown skin and dark curly hair in two puffs wearing a yellow t-shirt kneeling beside a homemade race car built from a wooden crate on four old wagon wheels, a young boy with pale skin and short blond hair in a blue striped shirt holding a coil of rope, an older man with brown skin, a short gray beard, and a green work apron holding a wooden-handled hand saw pointed at the floor, a strip of black rubber tire and a few loose boards on the concrete floor, tools on a pegboard behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "hill-fog": { subject: "The grassy top of a long hill on a gray morning, the bottom of the hill completely hidden by thick white fog, a row of homemade race cars built from wooden crates and boxes waiting on the grass, the same young girl with brown skin and dark curly hair in two puffs in a yellow t-shirt and the same young boy with pale skin and short blond hair in a blue striped shirt sitting on their crate car, the same older man with brown skin, a short gray beard, and a green work apron turning a wrench on one wheel, a woman in a red vest with a whistle on a cord holding up one hand to stop the racers. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags with marks, no signs, no writing anywhere.", ref: "garage-build" },
  "finish-hay-bales": { subject: "The bottom of a long grassy hill on a clear sunny morning, a line of stacked hay bales, the same wooden crate race car on wagon wheels rolling to a stop beside the bales with the same young girl with brown skin and dark curly hair in two puffs in a yellow t-shirt at the rope, the same young boy with pale skin and short blond hair in a blue striped shirt jumping with both arms up, the same older man with brown skin, a short gray beard, and a green work apron standing with his chest puffed out and his thumbs hooked in his pockets, blue sky with a few clouds and no sun in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags with marks, no signs, no writing anywhere.", ref: "garage-build" },
  "quiz-swing-pool": "A thick old tire hanging from a rope on a big leaning tree over a calm swimming hole at a reservoir, the water under the tire dark blue and deep, the water near the pebbly shore pale and clear with round stones showing through it, a young girl with pale skin and red hair in a green swimsuit standing ankle deep at the shore, green hills behind, no sun in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no faces on any object, no writing anywhere.",
  "quiz-wild-rabbit": "A small brown wild rabbit with a white tail frozen mid-hop in tall green grass beside a dirt path, its ears straight up and its mouth closed, a few white wildflowers, a wooden fence post in the background, a natural animal with no smile and no human expression. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-picnic-basket": "A young boy with brown skin and short black hair in a red swimsuit and a young girl with pale skin and red hair in a green swimsuit both wrapped in towels and reaching into an open wicker picnic basket on a checkered blanket, sandwiches wrapped in paper and a bunch of grapes inside the basket, a woman with brown skin and a wide straw hat pouring water from a jug, green grass and a lake behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const wordConnections: LessonDef = {
  id: "word-connections",
  title: "Word Connections",
  grade: "3rd Grade",
  standard: "L.3.5",
  archetype: "vocabulary",
  objective: "I can decide which connection a question about a word is asking for, then give the saying, the real-life example with a because, the near-same word, or the opposite.",
  concepts: [
    "a word is never alone: it connects to a saying, a real-life example, a near-same word, and its opposite",
    "a saying that uses the word means more than the word alone",
    "a real-life example needs a because that makes the word fit",
    "a near-same word could take the word's place; the opposite points the other way",
    "decide which connection a question is asking for before you answer it",
    "the near-same word or the opposite is often sitting right there in the story",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read the whole derby story and walked five words through their connections. Sharp, tight, safe, clear, and proud. Each time, you decided which connection the question wanted before you answered it, and then you gave a saying, a real-life example with a because, a near-same word, or the opposite. A word with all four connections is a word you own.",
    "title": "Four Ways In",
    "body": "You chose the connection each question asked for, then walked it: a saying, a real-life example with a because, a near-same word, or the opposite."
  },
  scenes: [
    {
      id: "hook-read-garage",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Spruce Hill Derby, page one. Read along!",
      image: IMG("garage-build"),
      narration: { audio: A("hook-read-garage"), script: "Hello, reader. You already know how to picture a saying, how to point to a word in real life, and how to find a word that means nearly the same or the opposite. Today nobody tells you which one to use. You read a real story, and at every word that matters, you choose the connection yourself. The story starts the day before a race. Read along with me." },
      interaction: { type: "read-along", text: "All spring, Paloma and her cousin Lars had been building a derby car out of an old wooden crate and four wagon wheels, because the Spruce Hill Derby was the first Saturday in June and every racer had to build a car by hand. On the last afternoon before the race, Uncle Basil unrolled his tools on the garage floor and warned them that the blade of his saw was sharp enough to slice through a finger. \"Sharp tools, slow hands,\" he said, and he would not let either cousin touch the saw until they had repeated it twice.", audio: A("hook-read-garage-sentence") },
    },
    {
      id: "model-four-connections-sharp",
      purpose: "model",
      gate: "none",
      prompt: "Watch me walk the four connections of sharp.",
      fx: {"text":"a **saying**, a **real-life** example, a **near-same** word, its **opposite**","effect":"pop-words"},
      narration: { audio: A("model-four-connections-sharp"), script: "Page one says the blade of the saw was sharp enough to slice through a finger. A word is never alone, and here are the four places sharp connects. First, a saying. People say someone is sharp as a tack, and that means quick and smart, not pointed at all. Second, a real-life example with a because. The tip of a new pencil is sharp, because it can poke a hole right through paper. Third, a word that means nearly the same. Pointed. A pointed blade and a sharp blade are close cousins. Fourth, the opposite. Blunt. A blunt blade will not slice anything. Four connections, and I walked every one. A saying, a real-life example, a near-same word, the opposite. When you can walk all four, the word is yours." },
    },
    {
      id: "guided-speak-read-straps",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: By dinner the car had a seat, a rope to steer with, and a brake made from a strip of old tire. Uncle Basil pulled the seat straps so tight that Paloma could hardly take a full breath, and she squirmed until he loosened them one notch. \"Sit tight while I check the wheels,\" he said, and Paloma waited in the seat with her hands on the rope.",
      narration: { audio: A("guided-speak-read-straps"), script: "Page two is yours to read. Three sentences, and one small word in them shows up twice, doing two different jobs. Read them out loud, clearly and with feeling." },
      interaction: { type: "speak", text: "By dinner the car had a seat a rope to steer with and a brake made from a strip of old tire Uncle Basil pulled the seat straps so tight that Paloma could hardly take a full breath and she squirmed until he loosened them one notch Sit tight while I check the wheels he said and Paloma waited in the seat with her hands on the rope" },
    },
    {
      id: "guided-choose-which-connection-tight",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which connection is this question asking for?",
      narration: { audio: A("guided-choose-which-connection-tight"), script: "Here is the new work, and it is the only new thing today. Before you answer a question about a word, you decide which connection the question wants. Listen to this question about tight. Tight. Give me another word you could put in its place, so that the sentence still means the same thing. Four kinds of connections are on your screen. Do not answer the question yet. Tap the kind of connection the question is asking for." },
      interaction: { type: "choose", options: [{ id: "a-near-same-word", label: "a near-same word" }, { id: "a-saying", label: "a saying" }, { id: "a-real-life-example", label: "a real-life example" }, { id: "its-opposite", label: "its opposite" }], correctId: "a-near-same-word", coachWrong: "Listen to the question again. It wants a word that could take the place of tight without changing the meaning. Which connection is that?" },
    },
    {
      id: "guided-choose-saying-sit-tight",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which saying with tight means wait right where you are?",
      narration: { audio: A("guided-choose-saying-sit-tight"), script: "Now a saying. Tight lives inside several sayings, and each one means something different. Four sayings are on your screen, and every one of them has the word tight in it. Only one of them means wait right where you are and do not move, and Uncle Basil said it on page two. Picture each one, and tap the saying that means wait where you are." },
      interaction: { type: "choose", options: [{ id: "sit-tight", label: "sit tight" }, { id: "hold-on-tight", label: "hold on tight" }, { id: "in-a-tight-spot", label: "in a tight spot" }, { id: "a-tight-squeeze", label: "a tight squeeze" }], correctId: "sit-tight", coachWrong: "That saying uses tight, but it does not mean wait. Think about what Uncle Basil told Paloma to do while he checked the wheels." },
    },
    {
      id: "apply-read-fog-morning",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Race morning, page three. Read along!",
      image: IMG("hill-fog"),
      narration: { audio: A("apply-read-fog-morning"), script: "Race morning. Page three has one of your words in it twice, once from the head judge and once inside a saying. Read along with me." },
      interaction: { type: "read-along", text: "Race morning came up gray, and a thick fog hid the bottom of Spruce Hill, so the judges made every racer wait at the top. Lars wanted to roll anyway, but the head judge shook her head and said that a hill you could not see was not safe, since a driver could not spot a bump until the wheels were already on it. \"Better safe than sorry,\" Uncle Basil agreed, and he tightened every bolt on the car one more time while they waited.", audio: A("apply-read-fog-morning-sentence") },
    },
    {
      id: "guided-choose-example-safe",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which real-life example fits safe?",
      narration: { audio: A("guided-choose-example-safe"), script: "Safe. The head judge would not let anyone roll down a hill she could not see, and Uncle Basil said better safe than sorry. Now connect safe to real life. Four things from everyday life are on your screen. Only one of them is safe, and you should be able to say why with a because. Tap the real-life example that fits safe." },
      interaction: { type: "choose", options: [{ id: "a-seat-belt-clicked-shut", label: "a seat belt clicked shut" }, { id: "a-bike-with-no-brakes", label: "a bike with no brakes" }, { id: "a-candle-left-burning", label: "a candle left burning" }, { id: "a-skateboard-on-the-stairs", label: "a skateboard on the stairs" }], correctId: "a-seat-belt-clicked-shut", coachWrong: "Picture that one happening. Is it the kind of thing a grown-up would stop, or the kind of thing a grown-up would ask you to do?" },
    },
    {
      id: "guided-choose-because-safe",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why does safe fit a seat belt?",
      narration: { audio: A("guided-choose-because-safe"), script: "A seat belt clicked shut is safe. That is the word and the example, and now you need the because. Four reasons are on your screen, and some of them are true about seat belts, but only one of them is the reason the word safe fits. Tap that because." },
      interaction: { type: "choose", options: [{ id: "keeps-you-from-getting-hurt", label: "keeps you from getting hurt" }, { id: "makes-the-car-go-faster", label: "makes the car go faster" }, { id: "is-easy-to-unbuckle", label: "is easy to unbuckle" }, { id: "comes-in-many-colors", label: "comes in many colors" }], correctId: "keeps-you-from-getting-hurt", coachWrong: "That might be true about a seat belt, but it is not why the word safe fits. Safe is about what could happen to you. Which reason is about that?" },
    },
    {
      id: "apply-speak-read-clear-hill",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: By nine the sun had burned the fog away, and the whole hill was clear from the starting line to the hay bales at the bottom. The head judge read the rules once more, loud and clear, so that nobody could say afterward that they had not heard. Paloma held her breath when the flag went up, but the crate car rolled straight and true all the way down.",
      narration: { audio: A("apply-speak-read-clear-hill"), script: "Page four is yours. Three sentences, out loud, clearly and with feeling, and listen for the word that tells you what happened to the fog." },
      interaction: { type: "speak", text: "By nine the sun had burned the fog away and the whole hill was clear from the starting line to the hay bales at the bottom The head judge read the rules once more loud and clear so that nobody could say afterward that they had not heard Paloma held her breath when the flag went up but the crate car rolled straight and true all the way down" },
    },
    {
      id: "apply-choose-opposite-clear",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is the opposite of clear, the way page four uses it?",
      fx: {"text":"the whole hill was **clear** from the starting line","effect":"glow"},
      narration: { audio: A("apply-choose-opposite-clear"), script: "Clear. Page four says the sun burned the fog away, and the whole hill was clear from the starting line to the hay bales. Sometimes the opposite of a word is sitting right there in the story, on the page before or the page after. Four words are on your screen. Tap the one that is the opposite of clear, the way page four uses it." },
      interaction: { type: "choose", options: [{ id: "foggy", label: "foggy" }, { id: "sunny", label: "sunny" }, { id: "steep", label: "steep" }, { id: "early", label: "early" }], correctId: "foggy", coachWrong: "Think about what the hill was like before the sun did its work. Which word describes a hill you cannot see the bottom of?" },
    },
    {
      id: "apply-sort-sharp",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Near the Same as sharp, or The Opposite?",
      narration: { audio: A("apply-sort-sharp"), script: "Back to sharp, the blade on page one. Six words are on your screen. Say each one about a blade or a point. If the word means nearly the same as sharp, drag it to Near the Same. If it means the opposite of sharp, drag it to The Opposite." },
      interaction: { type: "sort", buckets: ["Near the Same","The Opposite"], items: [{ label: "pointed", bucket: "Near the Same" }, { label: "blunt", bucket: "The Opposite" }, { label: "spiky", bucket: "Near the Same" }, { label: "rounded", bucket: "The Opposite" }, { label: "jagged", bucket: "Near the Same" }, { label: "worn down", bucket: "The Opposite" }], coachWrong: "Picture a blade that is that word. Would it slice through paper, or would it just push the paper around?" },
    },
    {
      id: "apply-read-finish",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The last page. Read along!",
      image: IMG("finish-hay-bales"),
      narration: { audio: A("apply-read-finish"), script: "The last page, and two more sayings are hiding in it. One of them uses a word you walked already, and one of them uses a word that is brand new today. Read along with me." },
      interaction: { type: "read-along", text: "The crate car finished third out of nine, and Lars whooped so loudly that a judge covered her ears. Uncle Basil stood by the hay bales looking as proud as a peacock, with his chest out and his thumbs hooked in his pockets. \"Sharp as a tack, both of you,\" he said, \"because you figured out that brake by yourselves.\" Paloma decided right then that next year the car would have a horn.", audio: A("apply-read-finish-sentence") },
    },
    {
      id: "apply-choose-which-connection-proud",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which connection is this question asking for?",
      narration: { audio: A("apply-choose-which-connection-proud"), script: "Proud is the fresh word, and you have not walked it yet. First decide what the question wants. Here is the question. Proud. Give me a word that means the reverse of it, a word for how Uncle Basil would have felt if the car had fallen apart at the starting line. Do not answer yet. Tap the kind of connection that question is asking for." },
      interaction: { type: "choose", options: [{ id: "its-opposite", label: "its opposite" }, { id: "a-saying", label: "a saying" }, { id: "a-real-life-example", label: "a real-life example" }, { id: "a-near-same-word", label: "a near-same word" }], correctId: "its-opposite", coachWrong: "The question asks for the reverse of proud, a feeling that points the other way. Which kind of connection points the other way?" },
    },
    {
      id: "apply-choose-opposite-proud",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is the opposite of proud?",
      narration: { audio: A("apply-choose-opposite-proud"), script: "Now answer it. Uncle Basil felt proud when the car came in third. Four words are on your screen, and one of them is how he would feel if he had done something he wished he could hide. Tap the opposite of proud." },
      interaction: { type: "choose", options: [{ id: "ashamed", label: "ashamed" }, { id: "pleased", label: "pleased" }, { id: "sleepy", label: "sleepy" }, { id: "thirsty", label: "thirsty" }], correctId: "ashamed", coachWrong: "That is not the reverse of proud. Which feeling would make somebody want to hide what they did?" },
    },
    {
      id: "challenge-speak-proud-connection",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Give one connection for proud, and name which kind it is.",
      narration: { audio: A("challenge-speak-proud-connection"), script: "Last one, out loud, and this time you choose the connection. Proud. Pick any one of the four. A saying that uses it, a real-life example with a because, a word that means nearly the same, or its opposite. Tap the mic, say your connection, and then name which kind it is." },
      interaction: { type: "speak", text: "proud saying peacock example because near same nearly opposite ashamed pleased happy glad won made built trophy drawing real life word means reverse" },
    },
    {
      id: "celebrate-four-ways",
      purpose: "celebrate",
      gate: "none",
      prompt: "Four connections, one word.",
      fx: {"text":"**Four** connections, one **word**","effect":"fireworks"},
      narration: { audio: A("celebrate-four-ways"), script: "Nothing new was taught today. You did the choosing. Sharp, tight, safe, clear, proud. For each one you decided what the question was asking for, a saying, a real-life example, a near-same word, or the opposite, and then you walked that connection. A word you can walk all four ways is a word you own, and you can do that with any word in any book." },
    },
  ],
};
