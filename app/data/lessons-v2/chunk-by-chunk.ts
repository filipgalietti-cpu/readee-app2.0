import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./chunk-by-chunk-timings.json";

// Chunk by Chunk (RF.3.3c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=chunk-by-chunk
// G3-U2 lesson 1. SYLLABLE DIVISION tier of RF.3.3 (sibling split: syllable-beats
// RF.K.2b owns clapping beats, syllable-splitters RF.1.3d + word-breakers RF.1.3e
// own simple two-syllable and compound splits, long-vowel-builders RF.2.3c owns
// long-vowel patterns in two-syllable words, long-word-trains RF.3.3b owns Latin
// suffix chunks, take-apart-any-word RF.3.3 owns the affix capstone; THIS owns
// the vowel-spot split rules and the open/closed flex). The move: find the vowel
// spots, count the consonants between them, split (two consonants = split
// between, closed first chunk, short vowel; one consonant = try splitting before
// it, open first chunk, vowel says its name; not a word you know = flex and split
// after it), read each chunk, snap at speed. Frame = a roadside diner chalkboard
// on a road trip (Mabel + brother Otto). ANCHOR FRESHNESS grep-swept vs the
// whole lessons-v2 + quizzes-v2 catalog: motel, humid, velvet, melon, cucumber,
// bacon, beacon, baton, basin, walnut, goblin, tulip, ticket, bonus, admit,
// student, credit, cinnamon, mosquito, cider, wallet, tennis, mascot, closet,
// meter, minus, solar, hotel, medal all 0 hits (rabbit, napkin, tiger, robot,
// cabin, lemon, camel, basket, magnet, helmet, pumpkin, picnic, insect, kitten,
// planet, robin, salad, tornado, siren, sudden, acorn, hero burned and avoided).
// TTS carriers: chunks are always spoken inside a sentence ("Vel, and vet"),
// never as bare nonsense strings.

const A = (id: string) => `/audio/lessons-v2/chunk-by-chunk/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/chunk-by-chunk/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/chunk-by-chunk/${w.toLowerCase()}.png`;

export const chunkByChunkImages: Record<string, string | { subject: string; ref?: string }> = {
  "diner-booth": "A young girl with curly brown hair in a green striped shirt and her older brother in a plain blue hoodie sitting together in a roadside diner booth with worn red velvet seats, the girl holding an open paper menu and frowning at it, a plain empty green chalkboard easel with nothing written on it standing by the door, warm evening light through the window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "motel-dusk": "A row of small motel room doors with a glowing yellow lamp beside each door at dusk, a family car parked in front on the gravel, a purple and orange sunset sky, a few moths circling the lamps, a tall leafy tree beside the building, no signs anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "diner-morning": { subject: "The same young girl with curly brown hair in a green striped shirt and the same older brother in a plain blue hoodie sitting in the same roadside diner booth with worn red velvet seats the next morning, a plate of crispy bacon and a bowl of orange melon slices on the table, bright morning sunlight through the window, the girl reading the open paper menu with a confident smile. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.", ref: "diner-booth" },
  "quiz-sandal": "One brown leather sandal with two plain straps sitting on warm beach sand beside a small seashell, bright sunshine. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-tuba": "A big shiny brass tuba resting upright on a wooden stage floor with a red curtain behind it, light glinting off the wide bell. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-raven": "A large glossy black raven perched on a bare gray branch against a pale blue sky, realistic natural bird with no cartoon eyes and no smile. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
};

export const chunkByChunk: LessonDef = {
  id: "chunk-by-chunk",
  title: "Chunk by Chunk",
  grade: "3rd Grade",
  standard: "RF.3.3c",
  archetype: "phonics",
  objective: "I can find the vowel spots in a long word, split it into chunks at the right place, and read it chunk by chunk.",
  concepts: [
    "every chunk has one vowel spot",
    "two consonants between the vowel spots, split between them, and the first vowel stays short",
    "one consonant between the vowel spots, split before it, and the vowel says its name",
    "if the open try is not a word you know, flex and split after the consonant",
    "read each chunk, then snap them together at speed",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Long words come apart in your hands now. You found the vowel spots, you split velvet, motel, melon, and cucumber at the right place, and you snapped every chunk back together at speed. That is exactly how strong readers handle a word they have never seen before.",
    "title": "Chunk Reader!",
    "body": "You split long words at their vowel spots, read each chunk, and snapped them together at speed."
  },
  scenes: [
    {
      id: "hook-diner-board",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a roadside diner. Read along!",
      image: IMG("diner-booth"),
      narration: { audio: A("hook-diner-board"), script: "Hello, reader. Today you learn how third graders take a long word apart and read it chunk by chunk. The trick starts at a roadside diner. Read along with me, and watch for the moment a word stops Mabel cold." },
      interaction: { type: "read-along", text: "By the time the car pulled into the motel, the summer air had turned humid and heavy, and Mabel was hungry enough to eat the menu. Next door stood a small diner with booths covered in worn red velvet, and a chalkboard by the door listed the special of the day. Mabel read the first line easily, but the second line held a long word that stopped her cold. \"I know every letter,\" she said, \"but the word will not come out.\" \"Do not swallow it whole,\" said her brother Otto. \"Find the vowels first, and the word will come apart in your hands.\"", audio: A("hook-diner-board-sentence") },
    },
    {
      id: "model-two-consonants",
      purpose: "model",
      gate: "none",
      prompt: "Rule one: two consonants between the vowel spots, split between them.",
      fx: {"text":"**vel** **vet** snaps into **velvet**","effect":"pop-words"},
      narration: { audio: A("model-two-consonants"), script: "Otto is right, and here is the whole move. Every chunk has one vowel spot, so the vowel spots tell you how many chunks a word has. Look at the word velvet, the cloth on those booths. The vowel spots are e and e, and between them sit two consonants, l and v. Two consonants between the vowel spots means you split right between them. Vel, and vet. The first chunk ends in a consonant, so it is closed, and a closed chunk keeps its vowel short. Now read each chunk and snap them together at speed. Vel, vet, velvet. Two consonants, split between them, and the first vowel stays short. That is rule one." },
    },
    {
      id: "model-open-first",
      purpose: "model",
      gate: "none",
      prompt: "Rule two: one consonant between the vowel spots, try splitting before it.",
      image: IMG("motel-dusk"),
      narration: { audio: A("model-open-first"), script: "Rule two is for a different shape. Look at the word motel, the place where Mabel's family sleeps tonight. The vowel spots are o and e, and between them sits only one consonant, the t. One consonant between the vowel spots means you try splitting before it first. Mo, and tel. The first chunk ends in its vowel, so it is open, and an open chunk lets its vowel say its name. Mo, tel, motel. That is a word you know, so the first try wins. One consonant, split before it, and let the vowel say its name." },
    },
    {
      id: "model-flex",
      purpose: "model",
      gate: "none",
      prompt: "The flex: if the open try is not a real word, split after the consonant.",
      fx: {"text":"**mel** **on** snaps into **melon**","effect":"pop-words"},
      narration: { audio: A("model-flex"), script: "The first try does not always win, and that is where the flex comes in. The chalkboard said melon and cucumber slices. Look at melon. The vowel spots are e and o, with one consonant between them, so try splitting before it. Me, lon. Mee lon. Does that sound like a word you know? It does not. So flex. Split after the consonant instead, mel, on, and let the closed chunk make its vowel short. Mel, on, melon. That is the flex move. Try the open split first and listen. If it is not a word you know, flex the vowel and split after the consonant." },
    },
    {
      id: "guided-choose-hear-bacon",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says bacon.",
      narration: { audio: A("guided-choose-hear-bacon"), script: "Your turn to use the rules. The waiter brought Otto a plate of eggs and bacon. One of these words says bacon, and the others are lookalikes. Find the vowel spots in each word, split it, read it, and tap the word that says bacon." },
      interaction: { type: "choose", options: [{ id: "bacon", label: "bacon" }, { id: "beacon", label: "beacon" }, { id: "baton", label: "baton" }, { id: "basin", label: "basin" }], correctId: "bacon", coachWrong: "Split each word before its middle consonant and let the first vowel say its name. Only one of them reads as the breakfast food." },
    },
    {
      id: "guided-sequence-cucumber",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Snap the chunks into reading order: cucumber.",
      narration: { audio: A("guided-sequence-cucumber"), script: "Now the word that stopped Mabel at the chalkboard. Here it is with its chunks pulled apart. It has three vowel spots, so it has three chunks. Drag the chunks into reading order, the first chunk first, and put the whole word at the end of the line." },
      interaction: { type: "sequence", items: [{ id: "cu", label: "cu" }, { id: "cum", label: "cum" }, { id: "ber", label: "ber" }, { id: "cucumber", label: "cucumber" }], order: ["cu","cum","ber","cucumber"], coachWrong: "Say the word slowly and listen for the chunk that comes first. The whole word waits at the end of the line." },
    },
    {
      id: "guided-choose-split-walnut",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the split that follows the rule: walnut.",
      narration: { audio: A("guided-choose-split-walnut"), script: "Otto ordered walnut pancakes, and here is walnut split four different ways. Only one split follows the rules. Find the vowel spots, count the consonants between them, and tap the split that puts the cut in the right place." },
      interaction: { type: "choose", options: [{ id: "wal-nut", label: "wal-nut" }, { id: "wa-lnut", label: "wa-lnut" }, { id: "waln-ut", label: "waln-ut" }, { id: "walnu-t", label: "walnu-t" }], correctId: "wal-nut", coachWrong: "Count the consonants between the two vowel spots. Two consonants means the cut goes right between them." },
    },
    {
      id: "guided-sort-between-before",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word by where it splits.",
      narration: { audio: A("guided-sort-between-before"), script: "Six words are waiting on your screen. Find the vowel spots in each one and count the consonants between them. If there are two consonants, the word splits between them, so drag it to Split Between. If there is only one consonant, the word splits before it, so drag it to Split Before." },
      interaction: { type: "sort", buckets: ["Split Between","Split Before"], items: [{ label: "goblin", bucket: "Split Between" }, { label: "tulip", bucket: "Split Before" }, { label: "ticket", bucket: "Split Between" }, { label: "bonus", bucket: "Split Before" }, { label: "admit", bucket: "Split Between" }, { label: "student", bucket: "Split Before" }], coachWrong: "Look only at the letters between the two vowel spots. Count them, then pick the bucket that matches the count." },
    },
    {
      id: "guided-transform-credit",
      purpose: "guided",
      gate: "interaction",
      prompt: "Flex the vowel, then snap on the chunk that finishes credit.",
      narration: { audio: A("guided-transform-credit"), script: "Mabel's dad keeps a credit card in his wallet for road trips. Take the word credit apart. The vowel spots are e and i with one consonant between them, so the open try comes first. Cre, dit. Cree dit is not a word you know, so flex. Split after the d, and the closed chunk cred makes its vowel short. Cred is on your screen. Snap on the chunk that finishes credit, and watch the vowel flex." },
      interaction: { type: "transform", base: "cred", add: "it", result: "credit", changeIndex: 2, options: ["it", "et", "ut"], marks: { before: "Ē", after: "Ĕ" }, labels: { added: "second chunk", changed: "flexed to short" }, successAudio: W("credit"), coachWrong: "Say credit slowly and listen to its last chunk. Find the tile that spells that sound." },
    },
    {
      id: "apply-read-morning",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The next morning. Read along!",
      image: IMG("diner-morning"),
      narration: { audio: A("apply-read-morning"), script: "The next morning, Mabel goes back to the same chalkboard. Read along with me, and notice every long word she takes apart." },
      interaction: { type: "read-along", text: "In the morning the diner smelled like bacon and cinnamon, and a fat mosquito bite on Mabel's arm itched under her sleeve. She opened the menu again, found the vowel spots in every long word, and read each line without a single freeze. Otto timed her with the clock above the counter, and she beat him to the bottom of the page. When the check came, her dad paid with his credit card and left a bonus tip for the waiter. \"You read that whole board,\" said Otto, and Mabel grinned, because the long words had stopped scaring her.", audio: A("apply-read-morning-sentence") },
    },
    {
      id: "apply-choose-open-chunk",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word with an open first chunk.",
      narration: { audio: A("apply-choose-open-chunk"), script: "Now use rule two on your own. One of these four words has only one consonant between its vowel spots, so it splits before that consonant and its first chunk is open. The other three split between two consonants. Find the vowel spots in each word, count, and tap the word with the open first chunk." },
      interaction: { type: "choose", options: [{ id: "cider", label: "cider" }, { id: "wallet", label: "wallet" }, { id: "tennis", label: "tennis" }, { id: "mascot", label: "mascot" }], correctId: "cider", coachWrong: "Count the letters between the vowel spots in each word. Only one word has a single consonant there." },
    },
    {
      id: "apply-choose-needs-flex",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that needs the flex move.",
      narration: { audio: A("apply-choose-needs-flex"), script: "Every word here has one consonant between its vowel spots, so the open split comes first for all four. Try it on each word and listen. For three of them the open try makes a word you know. For one of them it does not, and that word needs the flex. Tap the word that needs the flex." },
      interaction: { type: "choose", options: [{ id: "closet", label: "closet" }, { id: "meter", label: "meter" }, { id: "minus", label: "minus" }, { id: "solar", label: "solar" }], correctId: "closet", coachWrong: "Say each word with the open split, the first vowel saying its name. The one that does not sound like a real word is the one that needs the flex." },
    },
    {
      id: "apply-speak-read-hotel",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: The hotel across the road had a tulip garden by the pool. Otto hung his wet towel in the closet, and Mabel read every sign on the way out chunk by chunk.",
      narration: { audio: A("apply-speak-read-hotel"), script: "Here are two sentences packed with long words. Read them out loud with a steady voice. Split a word in your head if you need to, then say it whole." },
      interaction: { type: "speak", text: "The hotel across the road had a tulip garden by the pool Otto hung his wet towel in the closet and Mabel read every sign on the way out chunk by chunk" },
    },
    {
      id: "challenge-speak-chunks-medal",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read it aloud, then say the chunks of medal: Otto won a medal in the hotel pool race.",
      narration: { audio: A("challenge-speak-chunks-medal"), script: "Last stop. Read the sentence on your screen out loud. Then take the word medal apart and say its chunks one at a time, the way you would if nobody could help you." },
      interaction: { type: "speak", text: "otto won a medal in the hotel pool race med al medal ho tel hotel chunks first second vowel vowels split before after between open closed short long flex consonant" },
    },
    {
      id: "celebrate-chunk-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "Find the vowel spots, split, read, snap.",
      fx: {"text":"Find the vowel spots, split, read, **snap**","effect":"fireworks"},
      narration: { audio: A("celebrate-chunk-reader"), script: "You took a chalkboard full of long words apart today. Find the vowel spots, and count the consonants between them. Two consonants, split between them, and the first vowel stays short. One consonant, split before it, and let the vowel say its name. If that is not a word you know, flex and split after it. Read each chunk, snap them together, and keep going. The next long word in your book is only chunks waiting to be found." },
    },
  ],
};
