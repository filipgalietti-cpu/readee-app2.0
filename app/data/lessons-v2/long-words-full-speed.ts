import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./long-words-full-speed-timings.json";

// Long Words, Full Speed (RF.4.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=long-words-full-speed
// G4-U1 DECODING CAPSTONE for the RF.4.3 umbrella row (precedents: decoding-
// champions RF.2.3 and take-apart-any-word RF.3.3). Sibling split: take-apart-
// any-word RF.3.3 owns the machine / caboose / base / snap frame at G3 pace (the
// machine and the caboose are NAMED here as known tools in one line, never
// re-taught, and its word list is burned); long-word-trains RF.3.3b owns the
// Latin cabooses as chunks (its words burned); meaning-machines RF.3.3a owns
// affix MEANING; greek-and-latin-roots L.4.4b and the-right-tool L.4.4 own root
// meaning, so this lesson never explains what a part MEANS, only its sound and
// shape, and none of their roots appear; RF.4.3a (G4-U2) owns syllable
// division rules, r-controlled chunks and the schwa, so syllables here are
// chunked BY EAR only ("beats you can say"). THIS lesson owns the G4 step-up:
// a three-step self-check the child runs in seconds on four- and five-syllable
// words inside dense text: (1) spot the parts you know at the edges and the
// base in the middle, (2) chunk what is left into beats you can say, (3) say
// the whole word and TEST it (sounds like a word I have heard? fits the
// sentence?), and when the test fails, FLEX one chunk (the other vowel sound,
// or the stress) and test again, all without stopping the sentence. ONE
// true-to-life anchor, "The Intake Room": Tessa, eleven, on her first Saturday
// as a junior volunteer at a wildlife rehabilitation center, where Darius runs
// the intake desk and a young opossum arrives in a shoebox (every fact true:
// intake forms record where the animal was found and it is released near
// there, the room stays quiet so the animal does not get used to people,
// gloved checks, notes clipped to the cage for the visiting vet, a young
// opossum weighs about as much as an apple, it hisses, shows its teeth and
// plays dead, joeys ride on the mother's back for weeks, formula from a
// dropper). 3 dense read-alongs of 5 complex sentences (pages 1/3/5 with
// ref-chained images) + 2 child-read accept-mode pages (2/4 at 48/42 tokens,
// no " my ") + a closing production sentence nobody reads for the child.
// Planted targets, none carried by any shipped lesson or quiz: rehabilitation
// (the six-beat monster on the sign), emergency, particularly, considerably
// (p1); observation, investigation, communication, approximately (p3);
// ordinarily, temporarily, unmistakable, recovery, occasionally (p5). No
// digits, no contractions in child-read text, no flap-t targets, no reserved
// roots. Chunk carriers in narration follow the take-apart-any-word precedent
// (comma-separated sayable chunks: "Par, tick, you, lar, lee"; "the shun
// ending, spelled t, i, o, n"). Keys prefixed quiz- are picture supports for
// the quiz's all-fresh second text (a class visit to an archaeological dig).

const A = (id: string) => `/audio/lessons-v2/long-words-full-speed/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/long-words-full-speed/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/long-words-full-speed/${w.toLowerCase()}.png`;

export const longWordsFullSpeedImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A small bright intake room at a wildlife rescue center, a plain wooden counter with a flat gray kitchen scale on it, a man with dark brown skin, short black hair, and a green polo shirt sliding a plain brown cardboard shoebox onto the scale, inside the open shoebox a small gray young opossum curled up asleep under the edge of a gray towel with its eyes closed and its mouth closed, realistic animal, no smile, an eleven year old girl with pale skin, freckles, and red hair in a ponytail wearing a blue volunteer t-shirt standing beside the counter holding a clipboard with a completely blank white sheet on it, plain shelves with unlabeled brown boxes and folded towels behind them, one window with morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank clipboard, no posters, no labels on the boxes, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "A quiet back room at the same wildlife rescue center, a wire animal cage on a shelf with a dark cloth draped over most of it and one small uncovered opening, the same man with dark brown skin, short black hair, and a green polo shirt wearing blue rubber gloves and gently touching the back leg of a small gray young opossum that lies limp on its side on a towel with its eyes closed and its mouth closed, realistic animal, no smile, the same eleven year old girl with pale skin, freckles, and red hair in a ponytail in a blue volunteer t-shirt holding a small silver flashlight pointed at the towel, a plain white note card clipped to the cage bars with nothing written on it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank note card, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same quiet back room in the afternoon, the same wire cage with the dark cloth pulled back, a small gray young opossum standing on a folded gray towel inside the cage with its long bare tail curled tightly around a fold of the towel and its nose lifted as if sniffing the air, eyes open, mouth closed, realistic animal, no smile, the same man with dark brown skin, short black hair, and a green polo shirt pulling a blue rubber glove off one hand, the same eleven year old girl with pale skin, freckles, and red hair in a ponytail in a blue volunteer t-shirt sliding a blank white sheet of paper into a plain tan folder. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank paper, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-dig-square": "An outdoor archaeological dig on a sunny hillside, a shallow square pit with straight dirt walls marked off by thin string tied to wooden stakes, a ten year old boy with light brown skin and short black curly hair in a wide straw hat kneeling on the dirt and brushing a patch of soil with a small dry paintbrush, a tall woman with olive skin and gray hair in a long braid wearing a khaki vest and work gloves crouching beside him, a few plain metal buckets and a wooden sieve frame nearby, dry grass and a blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no tags on the string, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-clay-piece": { subject: "A close view of two gloved hands, one large adult hand and one child hand, both in thin white gloves, holding a single curved reddish brown piece of broken clay pot about the size of a hand, with a faint plain groove pattern pressed into it, above a clean white cloth spread on a wooden table at the same sunny hillside dig, dirt and string-marked squares blurred in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-dig-square" },
  "quiz-finds-tray": { subject: "The same ten year old boy with light brown skin and short black curly hair in a wide straw hat standing at a wooden folding table under a white canopy at the same sunny hillside dig, carefully placing plain reddish brown clay pieces into a shallow wooden tray divided into small empty compartments, a row of small plain paper bags beside the tray, the tall woman with olive skin and a gray braid in a khaki vest watching with her arms folded. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank paper bags, no tags, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-dig-square" }
};

export const longWordsFullSpeed: LessonDef = {
  id: "long-words-full-speed",
  title: "Long Words, Full Speed",
  grade: "4th Grade",
  standard: "RF.4.3",
  archetype: "phonics",
  objective: "I can read a four- or five-syllable word inside a sentence by spotting the edges, chunking the middle by ear, saying it and testing it, and flexing a chunk when the first try fails, without stopping the sentence.",
  concepts: [
    "spot the parts you know at the edges and the base in the middle",
    "chunk what is left into beats you can say",
    "say the whole word, then test it: a word I have heard, and it fits the sentence",
    "if the test fails, flex one chunk and test again",
    "count the beats to chunk any long word",
    "keep the sentence moving",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Intake Room, a whole day full of four, five and six beat words, and not one of them stopped a sentence. Edges, chunks, say it and test it, and a flex when the first try fails. That check is yours now, and it runs in about three seconds.",
    "title": "Long Words, Full Speed",
    "body": "You spotted the edges, chunked the middle by ear, said each long word and tested it, and flexed a chunk when the first try failed, all without stopping the sentence."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Intake Room, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Fourth grade text is full of words that are four or five beats long, and a few are six, and none of them are allowed to stop your sentence. Today you learn a check you can run in about three seconds. Spot the parts you know at the edges. Chunk the middle into beats you can say. Say the word and test it. Here is page one of The Intake Room. Read along with me, and notice the long word on the sign. It is the longest word in the whole story." },
      interaction: { type: "read-along", text: "On her first Saturday as a junior volunteer, Tessa reached the wildlife rehabilitation center before the doors were unlocked, and she read the longest word on the sign three times. Darius, who ran the intake desk, told her that the morning had already turned into an emergency, because a shoebox had been left on the front step overnight. Inside the box, under a torn towel, a young opossum lay curled with its eyes shut, considerably smaller than the ones Tessa had seen crossing her street at night. \"We keep this room particularly quiet,\" Darius said, sliding the box onto the scale, \"since every voice it hears makes it more afraid of people.\" He handed her an intake form, because an animal that recovers is released close to the place where it was found.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-three-steps",
      purpose: "model",
      gate: "none",
      prompt: "Edges, chunks, say it and test it.",
      fx: {"text":"par tic u lar **ly**","effect":"pop-words"},
      narration: { audio: A("model-three-steps"), script: "Here is the check on one word from page one. Particularly. Step one, spot the edges. At the front, there is no machine I know. At the end, there is ly, a caboose I know from third grade. Step two, the middle. Particular is a base I have heard, so I can read it whole. If I could not, I would chunk it by ear, in beats I can say. Par, tick, you, lar. Step three, say the whole word and test it. Par, tick, you, lar, lee. Particularly. Does it sound like a word I have heard? Yes. Does it fit the sentence? We keep this room particularly quiet. Especially quiet. Yes, it fits, so I keep reading. Edges, chunks, say it and test it. Three steps, about three seconds, and the sentence never stopped." },
    },
    {
      id: "model-flex-considerably",
      purpose: "model",
      gate: "none",
      prompt: "When the first try fails, flex one chunk.",
      fx: {"text":"con **side** er ab ly, then con **sid** er ab ly","effect":"word-swap"},
      narration: { audio: A("model-flex-considerably"), script: "Sometimes the first try fails the test, and that is where the flex comes in. Page one said the opossum was considerably smaller. Edges first. The caboose ly sits at the end, and there is nothing I know at the front. Now the middle, by ear. Con, side, er, ab. Say it and test it. Con, side, er, ab, lee. Is that a word I have heard? No, so it fails. Time to flex. I pick one chunk and try the other sound of its vowel. The i in side can also say the sound in sit. Con, sid, er, ab, lee. Considerably. That is a word I have heard, and now I can even see the base inside it, consider. Does it fit? Considerably smaller, much smaller. It passes. One flex, one test, and I keep reading. The two tries are under the sentence, and you can tap each one to hear the difference." },
      interaction: { type: "listen", items: [{ label: "con-side-er-ab-ly", audio: W("con-side-er-ab-ly") }, { label: "con-sid-er-ab-ly", audio: W("con-sid-er-ab-ly") }] },
    },
    {
      id: "guided-choose-front-part",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which piece is the machine at the front of rehabilitation?",
      narration: { audio: A("guided-choose-front-part"), script: "Your turn on the monster word from the sign. Rehabilitation. Step one is the edges, and this word carries a known part at each end. Four pieces of the word are on your screen. Tap the piece that is the machine at the front, the part you already know from third grade." },
      interaction: { type: "choose", options: [{ id: "re", label: "re" }, { id: "ha", label: "ha" }, { id: "tion", label: "tion" }, { id: "bil", label: "bil" }], correctId: "re", coachWrong: "That piece is not at the front, or it is not a part you know. Look at the very first letters of the word." },
    },
    {
      id: "guided-transform-particularly",
      purpose: "guided",
      gate: "interaction",
      prompt: "Snap the caboose on. Build particularly.",
      narration: { audio: A("guided-transform-particularly"), script: "Now build one. The base is particular, and page one needs the caboose that says lee, so the word can tell how quiet the room is. Three cabooses are on your screen. Tap the one that says lee, and snap it on." },
      interaction: { type: "transform", base: "particular", add: "ly", result: "particularly", changeIndex: 9, options: ["ly", "ness", "ful"], labels: { added: "says lee" }, successAudio: W("particularly"), coachWrong: "That caboose says a different sound. Say lee to yourself, then find its spelling." },
    },
    {
      id: "guided-sequence-emergency",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the four beats of emergency into order.",
      narration: { audio: A("guided-sequence-emergency"), script: "Chunk this one by ear. The word is emergency, the one Darius used for the shoebox morning. Say it slowly and feel the beats. The four beats are on your screen, mixed up. Drag them into the order you say them, first beat first." },
      interaction: { type: "sequence", items: [{ id: "e", label: "e" }, { id: "mer", label: "mer" }, { id: "gen", label: "gen" }, { id: "cy", label: "cy" }], order: ["e","mer","gen","cy"], coachWrong: "Say emergency slowly. Which beat do you hear first? Start there, and add one beat at a time." },
    },
    {
      id: "apply-sort-beats",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Four Beats, or Five Beats?",
      narration: { audio: A("apply-sort-beats"), script: "Six long words are on your screen, and the fastest way to chunk any of them is to count the beats you say. Say each word out loud, tap out its beats on the desk, and drag it to Four Beats or to Five Beats. Some of these you have read today, and some are new, and the count works the same on both." },
      interaction: { type: "sort", buckets: ["Four Beats","Five Beats"], items: [{ label: "emergency", bucket: "Four Beats" }, { label: "particularly", bucket: "Five Beats" }, { label: "observation", bucket: "Four Beats" }, { label: "considerably", bucket: "Five Beats" }, { label: "recovery", bucket: "Four Beats" }, { label: "investigation", bucket: "Five Beats" }], coachWrong: "Say that word slowly and tap once for every beat you say. Count the taps, then drag it again." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Tessa wrote the street name on the form while Darius weighed the box. The opossum was considerably lighter than a healthy one, so it needed a warm, dark corner. She learned that an emergency intake gets its own cage, and that the room stays particularly quiet all day.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, with three of today's words inside it. Read all three sentences out loud at a talking pace, and when a long word comes, run the check and keep going." },
      interaction: { type: "speak", text: "Tessa wrote the street name on the form while Darius weighed the box The opossum was considerably lighter than a healthy one so it needed a warm dark corner She learned that an emergency intake gets its own cage and that the room stays particularly quiet all day" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the long words go by.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me. Four new long words are coming, and I will not slow down for any of them. Watch the check happen at full speed." },
      interaction: { type: "read-along", text: "By late morning the opossum had been moved to a cage in the back room, where a small opening in the cover let the staff keep it under observation without lifting the cloth. Darius began an investigation of the injuries, which meant checking each leg, the tail, and the ears with gloved hands while Tessa held a flashlight. He explained that the center's communication with the vet who visited on Mondays happened through notes clipped to the cage, so every note had to be exact. The opossum, which weighed approximately as much as an apple, hissed once, showed its teeth, and then went limp as if it had died. \"That is an act,\" Darius said, writing on the note, \"and it tells me the animal has some strength left.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-real-try",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which try is the real word observation?",
      narration: { audio: A("guided-choose-real-try"), script: "One word from page three, and four tries at it. Someone chunked observation four different ways, and the tries are written on your screen the way they sound. Say each one out loud and run the test. Only one of them is a word you have heard. Tap it." },
      interaction: { type: "choose", options: [{ id: "ob-ser-vay-shun", label: "ob ser vay shun" }, { id: "ob-ser-vat-shun", label: "ob ser vat shun" }, { id: "obe-ser-vay-shun", label: "obe ser vay shun" }, { id: "ob-ser-vay-tee-on", label: "ob ser vay tee on" }], correctId: "ob-ser-vay-shun", coachWrong: "Say that try out loud again. Is it a word you have heard? One chunk in it has the wrong sound. Flex it, and test the next try." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Tessa checked the opening twice an hour and wrote every observation on the note. The opossum drank approximately one spoon of formula from a dropper each time. Darius said the investigation would take days, so nobody should expect a fast change.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and keep them moving through the long words." },
      interaction: { type: "speak", text: "Tessa checked the opening twice an hour and wrote every observation on the note The opossum drank approximately one spoon of formula from a dropper each time Darius said the investigation would take days so nobody should expect a fast change" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five is the last page I read with you, and it carries five long words. Read along, and notice that the sentence never stops for any of them." },
      interaction: { type: "read-along", text: "Ordinarily a young opossum rides on its mother's back for weeks, so one found alone in a box has usually lost her, which is why the center becomes its home temporarily. By the afternoon the animal had made an unmistakable change, because it was gripping the towel with its tail and sniffing the air. Darius, who had seen many intakes, said that a full recovery could take a month, and that Tessa would occasionally be asked to clean the cage without saying a word to it. \"The less it likes people,\" he said, snapping off his gloves, \"the better its chances outside.\" Tessa printed the last line on the intake form and slid it into the folder.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-test-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which clue shows that unmistakable was read right?",
      narration: { audio: A("apply-choose-test-clue"), script: "The last part of the test is the sentence itself. Page five said the animal had made an unmistakable change. If I read that word right, it means a change so clear that nobody could miss it, and the sentence should prove it. Four details from page five are on your screen, and all four are true. Only one of them is the clue that shows unmistakable fits. Tap it." },
      interaction: { type: "choose", options: [{ id: "gripping-with-its-tail", label: "gripping with its tail" }, { id: "seen-many-intakes", label: "seen many intakes" }, { id: "snapping-off-his-gloves", label: "snapping off his gloves" }, { id: "slid-it-into-the-folder", label: "slid it into the folder" }], correctId: "gripping-with-its-tail", coachWrong: "That detail is true, but it does not show a clear change in the animal. Find the detail that shows the change." },
    },
    {
      id: "challenge-speak-last-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read it at full speed: At closing time Darius told her that the opossum was temporarily safe, and Tessa read the word rehabilitation off the sign one last time without slowing down.",
      narration: { audio: A("challenge-speak-last-sentence"), script: "Last one, and nobody reads it for you. The closing sentence of the story is on your screen with two long words inside it. Tap the mic, then read the whole sentence out loud at a talking pace. When a long word comes, run the check and keep the sentence moving." },
      interaction: { type: "speak", text: "At closing time Darius told her that the opossum was temporarily safe and Tessa read the word rehabilitation off the sign one last time without slowing down" },
    },
    {
      id: "celebrate-full-speed",
      purpose: "celebrate",
      gate: "none",
      prompt: "Edges, chunks, say it and test it.",
      fx: {"text":"Long words, **full speed**","effect":"fireworks"},
      narration: { audio: A("celebrate-full-speed"), script: "Today you read a whole intake day full of four, five and six beat words, and not one of them stopped a sentence. You spotted the edges, chunked the middle by ear, said the word and tested it, and when a try failed, you flexed one chunk and tested again. That check is yours now. Run it in three seconds, and keep the sentence moving." },
    },
  ],
};
