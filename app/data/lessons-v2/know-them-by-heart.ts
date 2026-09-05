import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./know-them-by-heart-timings.json";

// Know Them by Heart (RF.3.3d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=know-them-by-heart
// G3-U2 lesson 2. IRREGULARLY SPELLED WORDS tier of RF.3.3 (sibling split:
// heart-words RF.2.3f owns G2 friend/people/enough/busy/again/pretty/once +
// its quiz's done/gone/whose/been/buy/other, tricky-words RF.1.3g owns
// said/was/one/two/they/there/would/could, snap-words RF.K.3c owns K sight
// words, rule-breaker-words L.2.1 owns irregular plurals and past tense,
// chunk-by-chunk RF.3.3c owns syllable splits, long-word-trains RF.3.3b owns
// Latin suffixes, take-apart-any-word RF.3.3 owns the affix capstone; THIS
// owns 3rd-grade irregulars, the heart-part move (fair part, heart part,
// whole word at a glance), the ough family, and silent letters). ONE story:
// Tamsin, her brother Reuben, and Aunt Della paddle a canoe to a small
// island where a guard keeps a knight's armor and sword in a stone tower.
// ANCHOR FRESHNESS grep-swept vs the whole lessons-v2 + quizzes-v2 catalog:
// island, canoe, knight, sword, wrist, guard, couple, biscuit, onion, cough,
// rough, answer, listen, paddle, splash, mist, stone are 0-hit as phonics
// targets; names Tamsin / Reuben / Della are 0-hit. The look-alike trio
// though / through / thought is the standard's own content (previewed once
// in heart-words-quiz's G3 harder band) and is kept by brief; enough, busy,
// heart, sugar, tongue, machine, build, people, laugh, friend, dough, bought,
// brought, fought, although, doughnut, tough, knee, knock, knot, whistle,
// castle, gnaw, knuckle are burned and avoided. TTS carriers: letters are
// always spoken as "the letters o, u, g, h"; sounds inside a sentence.

const A = (id: string) => `/audio/lessons-v2/know-them-by-heart/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/know-them-by-heart/${w.toLowerCase()}.png`;

export const knowThemByHeartImages: Record<string, string | { subject: string; ref?: string }> = {
  "island-crossing": "A woman in a wide straw sun hat and a blue jacket paddling a red wooden canoe across choppy gray-green water, a girl with dark braids and a yellow life vest sitting in the middle of the canoe, a boy in a green cap and an orange life vest trailing one hand in the water at the front, a small rocky island with a round gray stone tower rising out of thin morning mist behind them, no signs, no flags. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "tower-room": { subject: "Inside a round stone tower room lit by one small window, an EMPTY suit of plain silver knight's armor standing by itself in the corner with nobody inside it, an iron hook on the wall beside it with nothing hanging on it, the same boy in a green cap and orange life vest gripping the handle of a long heavy silver sword with both hands and straining to lift it while its tip still rests on the floor, the same girl with dark braids and a yellow life vest laughing, a tall bearded guard wearing a plain green wool coat and brown trousers with NO armor at all holding out an open round tin of biscuits, no shields, no banners, no flags, no crests. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.", ref: "island-crossing" },
  "quiz-thumb": "A close view of one child's hand giving a thumbs up in front of a plain sky-blue background, the sleeve of a red shirt, nothing else in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-lamb": "A small fluffy white lamb standing in a green spring meadow beside a low wooden fence, a realistic natural farm animal seen from the side, its mouth closed, no smile, small natural eyes, chewing a blade of grass, a few yellow flowers, plain blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-half-orange": "One orange cut exactly in half sitting on a white plate on a wooden table, the juicy inside of the half facing up, the other half missing, nothing else on the table. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
};

export const knowThemByHeart: LessonDef = {
  id: "know-them-by-heart",
  title: "Know Them by Heart",
  grade: "3rd Grade",
  standard: "RF.3.3d",
  archetype: "phonics",
  objective: "I can read words that break the sound rules by sounding out the fair part, learning the heart part by heart, and reading the whole word at a glance.",
  concepts: [
    "most of a rule-breaking word plays fair, and one part does not",
    "the heart part is the part you learn by heart: a silent letter, or letters that sing their own song",
    "the letters o u g h say oh in though, oo in through, aw in thought, uff in rough, and off in cough",
    "look-alikes are told apart by the letters at the front and the back",
    "fair part, heart part, then the whole word at a glance",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Island, though, knight, sword, canoe. You found the fair part of each one, you learned the heart part by heart, and you read every whole word at a glance. That is exactly how strong readers handle the words that break the rules.",
    "title": "Heart Part Reader",
    "body": "You sounded out the fair parts, learned the heart parts by heart, and read rule-breaking words at a glance."
  },
  scenes: [
    {
      id: "hook-island-crossing",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a crossing to an island. Read along!",
      image: IMG("island-crossing"),
      narration: { audio: A("hook-island-crossing"), script: "Hello, reader. Today you learn how third graders read the words that refuse to play by the sound rules. The trick starts on a rough stretch of water. Read along with me, and watch for a word that sounding out would get wrong." },
      interaction: { type: "read-along", text: "Tamsin had wanted to visit the island all summer, though the water between it and the dock was rough that morning. Aunt Della paddled the canoe with long, steady strokes, and Reuben trailed one hand in the cold water. \"Is it true that a knight once lived out there?\" Tamsin asked, but Aunt Della did not answer right away. \"Something did,\" she said at last, and a wave slapped the front of the canoe. Tamsin thought about that for the whole crossing, until a stone tower rose out of the mist.", audio: A("hook-island-crossing-sentence") },
    },
    {
      id: "model-the-move-island",
      purpose: "model",
      gate: "none",
      prompt: "The move: fair part, heart part, whole word at a glance.",
      fx: {"text":"**island**","effect":"glow"},
      narration: { audio: A("model-the-move-island"), script: "Here is the word island. Sound it out letter by letter, the way you would with any new word. The letters are i, s, l, a, n, d, so sounding out gives you iz land. Nobody says iz land, so sounding out gets this word wrong. That is not your fault. It is the word. Here is the third grade move. Most of island plays fair. The i at the front and the chunk land at the end say exactly what their letters promise. One part does not. The s says nothing at all. That silent s is the heart part, the part you learn by heart, because no rule will hand it to you. Fair part, heart part, then the whole word in one look. Island. Every word that breaks the rules has a heart part, and once you know where it hides, you read the whole word at a glance." },
    },
    {
      id: "model-ough-family",
      purpose: "model",
      gate: "none",
      prompt: "The biggest heart part in third grade: o u g h.",
      fx: {"text":"**though** **through** **thought** **rough** **cough**","effect":"pop-words"},
      narration: { audio: A("model-ough-family"), script: "Now look at though, from the first sentence. The letters t and h play fair and say th. Then come four letters, o, u, g, h, and together they just say oh. Those four letters are the heart part, and they are the biggest heart part in third grade, because the same four letters sing a different song in different words. In though, they say oh. In through, they say oo, like blue. In thought, they say aw, like saw. In rough, they say uff, like puff. In cough, they say off. Same four letters, five sounds, and no rule tells you which is which. So you do not sound these words out. You learn the heart part of each one by heart, and you check the letters at the front and the back. Though ends in oh. Through has an r after the t h and says oo. Thought has a t at the end and says aw. Look-alikes, but not twins." },
    },
    {
      id: "model-silent-letters",
      purpose: "model",
      gate: "none",
      prompt: "Silent letters are heart parts too.",
      fx: {"text":"**knight** **sword** **answer**","effect":"underline"},
      narration: { audio: A("model-silent-letters"), script: "Silent letters are heart parts too. Take knight, the one Tamsin asked about. The k at the front says nothing, and the g and h in the middle say nothing either. What plays fair is n, i, and t. Night, with a silent k in front, and that k is the heart part. Now sword. The letters are s, w, o, r, d, but nobody says a w sound in the middle. Sord. Silent w, and that w is the heart part. And answer, the word Aunt Della would not give. Its w hides in the middle. An, ser. A silent letter is still there on the page, so you learn where it sits, you skip it, and you read the whole word in one look." },
    },
    {
      id: "guided-highlight-heart-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the two words that carry a heart part.",
      narration: { audio: A("guided-highlight-heart-words"), script: "Your turn. Read this sentence to yourself. Most of its words play fair and sound out cleanly. Two words carry a heart part, a part that does not say what its letters promise. Tap both of them." },
      interaction: { type: "highlight", text: "The tall man waved them through the door, then a girl lifted the sword.", targets: ["through", "sword"], coachWrong: "Sound out the word you tapped. If the letters match what you say, that word plays fair. Find the words that do not match their letters." },
    },
    {
      id: "guided-choose-heart-part-wrist",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the heart part of wrist.",
      narration: { audio: A("guided-choose-heart-part-wrist"), script: "Reuben's wrist is about to matter in this story. Say wrist out loud, and listen to each sound you make. Now look at the four parts of wrist on your screen. Three parts say exactly what their letters promise. One part says nothing at all. Tap the heart part." },
      interaction: { type: "choose", options: [{ id: "w", label: "w" }, { id: "r", label: "r" }, { id: "i", label: "i" }, { id: "st", label: "st" }], correctId: "w", coachWrong: "Say wrist slowly. Make the sound of the part you tapped. If you can hear it in the word, that part plays fair. Find the part you cannot hear." },
    },
    {
      id: "guided-choose-hear-though",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says though.",
      narration: { audio: A("guided-choose-hear-though"), script: "Now the look-alikes. Aunt Della said the tower was safe, though the stairs were steep. One of these four words says though. The others share the same four heart-part letters, so check the letters at the front and the back before you tap. Tap the word that says though." },
      interaction: { type: "choose", options: [{ id: "though", label: "though" }, { id: "through", label: "through" }, { id: "thought", label: "thought" }, { id: "rough", label: "rough" }], correctId: "though", coachWrong: "Say though out loud. It ends in oh, with nothing after the four heart-part letters. Check the last letter of each word." },
    },
    {
      id: "guided-choose-fits-through",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word fits? Aunt Della steered the canoe ___ the reeds.",
      narration: { audio: A("guided-choose-fits-through"), script: "Here is a sentence with one word missing. Aunt Della steered the canoe, blank, the reeds. Read the sentence with each look-alike in the gap. Only one of them makes sense. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "through", label: "through" }, { id: "though", label: "though" }, { id: "thought", label: "thought" }, { id: "cough", label: "cough" }], correctId: "through", coachWrong: "Read the sentence out loud with your word in the gap. The canoe went in one side of the reeds and out the other. Which look-alike says that?" },
    },
    {
      id: "guided-sort-fair-heart",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word: plays fair, or has a heart part?",
      narration: { audio: A("guided-sort-fair-heart"), script: "Six words from the island are on your screen. Read each one, then sound it out letter by letter. If sounding out gives you the real word, drag it to Plays Fair. If one part refuses to say what its letters promise, drag it to Heart Part." },
      interaction: { type: "sort", buckets: ["Plays Fair","Heart Part"], items: [{ label: "wrist", bucket: "Heart Part" }, { label: "stone", bucket: "Plays Fair" }, { label: "cough", bucket: "Heart Part" }, { label: "splash", bucket: "Plays Fair" }, { label: "onion", bucket: "Heart Part" }, { label: "mist", bucket: "Plays Fair" }], coachWrong: "Sound out that word slowly, letter by letter. Does it come out as the real word? Let that decide its bucket." },
    },
    {
      id: "apply-read-tower",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Inside the tower. Read along!",
      image: IMG("tower-room"),
      narration: { audio: A("apply-read-tower"), script: "Now the inside of the tower. Read along with me, and read every heart-part word at a glance instead of sounding it out." },
      interaction: { type: "read-along", text: "Inside the stone tower, a guard in a green coat waved them through a low door and into a round room. A knight's armor stood in the corner, and a heavy sword hung from a hook beside it, its handle worn smooth where a hand had gripped it. \"Try lifting it,\" said the guard, and Reuben's wrist bent under the load before the blade rose an inch. Tamsin laughed so hard that she started to cough, so the guard passed around a couple of biscuits from a tin. \"The knight who carried that sword paddled here in a canoe,\" he said, \"and nobody has lifted it since.\"", audio: A("apply-read-tower-sentence") },
    },
    {
      id: "apply-choose-fits-thought",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word fits? Tamsin ___ the sword was heavier than Reuben.",
      narration: { audio: A("apply-choose-fits-thought"), script: "One word is missing again. Tamsin, blank, the sword was heavier than Reuben. Try each look-alike in the gap, and listen for the one that makes sense. Tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "thought", label: "thought" }, { id: "though", label: "though" }, { id: "through", label: "through" }, { id: "rough", label: "rough" }], correctId: "thought", coachWrong: "The missing word is something Tamsin did inside her head. Say each look-alike in the gap, and keep the one that makes sense." },
    },
    {
      id: "apply-choose-silent-listen",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which letter in listen is silent?",
      narration: { audio: A("apply-choose-silent-listen"), script: "The guard told them to listen for the bell on the dock, because it would ring when the water calmed down. Say listen out loud, slowly. Now look at the letters of listen on your screen. One of them says nothing at all. Tap the silent letter." },
      interaction: { type: "choose", options: [{ id: "l", label: "l" }, { id: "s", label: "s" }, { id: "t", label: "t" }, { id: "n", label: "n" }], correctId: "t", coachWrong: "Say listen again, one sound at a time. The silent letter never shows up in your mouth." },
    },
    {
      id: "apply-speak-read-island",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: The guard said a knight had crossed to the island in a canoe. Reuben could not lift the sword, though he tried with both hands. Tamsin thought the biscuits were the best part of the day.",
      narration: { audio: A("apply-speak-read-island"), script: "Here are three sentences from the island, packed with heart-part words. Read them out loud in a steady voice. When you reach a word with a heart part, do not sound it out. Read it at a glance and keep going." },
      interaction: { type: "speak", text: "the guard said a knight had crossed to the island in a canoe reuben could not lift the sword though he tried with both hands tamsin thought the biscuits were the best part of the day" },
    },
    {
      id: "challenge-speak-spell-heart-part",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read it aloud, then spell the heart part of though: Tamsin thought the sword was heavy, though Reuben would not admit it.",
      narration: { audio: A("challenge-speak-spell-heart-part"), script: "Last stop. Read the sentence on your screen out loud, every heart-part word at a glance. Then spell the heart part of though, one letter at a time, the way you would if nobody could help you." },
      interaction: { type: "speak", text: "tamsin thought the sword was heavy though reuben would not admit it o u g h ough oh silent heart part letters four says spell" },
    },
    {
      id: "celebrate-heart-part-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "Fair part, heart part, whole word at a glance.",
      fx: {"text":"Fair part, heart part, whole word **at a glance**","effect":"fireworks"},
      narration: { audio: A("celebrate-heart-part-reader"), script: "You crossed to the island and back through a tower full of words that refuse to play fair. Sound out the part that plays fair. Learn the heart part by heart, the silent letter or the four letters that sing their own song. Then read the whole word in one look. Island, though, through, thought, knight, sword, answer, canoe. The next one you meet in a book will not slow you down." },
    },
  ],
};
