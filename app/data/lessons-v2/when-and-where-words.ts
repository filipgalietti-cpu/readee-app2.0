import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./when-and-where-words-timings.json";

// When and Where Words (L.3.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=when-and-where-words
// G3-U3 word-work lesson. PRECISE WHEN AND WHERE tier of L.3.6: acquire and
// USE the words that signal temporal and spatial relationships accurately.
// The G3 step-up over big-kid-words (K.L.6 on/under/next to, burned) is
// PRECISION: every word carries a SHADE (meanwhile = at the same time,
// afterward = later, eventually = after a long wait, before long = soon,
// at last = finally, overnight = during the night, the moment = right when;
// beneath = under, beyond = farther / on the far side, nearby = close,
// alongside = side by side along its length, upstairs = the floor above,
// along the edge = following the border). The child (1) learns the shade,
// (2) picks the word that makes a sentence precise, (3) spots a word used
// wrongly, (4) orders events from their when-words, and (5) PRODUCES a
// sentence with a when-word and a where-word about the child's own day.
// Sibling split honored: because-then-so (RI.3.3) owns first/next/after/
// before/finally/while/because/since/so/as a result as TAUGHT items (none
// of them is taught here), big-kid-words (K.L.6) owns on/under/next to,
// expert-words (RI.3.4) owns academic and domain words, words-in-action
// (L.3.5b) owns word-example-because, shades-of-sure (L.3.5c) owns shades
// among certainty and feeling words (these are shades among time and place
// words), read-around-the-word (L.3.4a) owns context clues.
// ONE story: moving day on Canal Street (Junie, big brother Everett, Dad,
// Mrs. Brandt from next door; the narrow blue house, the room upstairs
// beneath the slanted roof, the round window that looks beyond the canal).
// Two dense 5-sentence read-alongs (page one: alongside / upstairs / beneath
// / beyond / nearby / meanwhile / by tonight + tagged dialogue; page two:
// overnight / the moment / before long / eventually / at last / beneath /
// along the edge / beyond), compound + early-complex, no digits, no
// contractions inside read-along text, plus a 3-sentence accept-mode child
// read (beneath / meanwhile / upstairs / before long / beyond).
// ANCHOR FRESHNESS grep-swept across all of lessons-v2 + quizzes-v2 before
// writing: no taught word here is a tile anywhere else (meanwhile, before
// long, overnight, upstairs 0 hits; afterward, eventually, beyond, alongside,
// along the edge 1-2 incidental prose hits; beneath, nearby, at last, the
// moment incidental prose only); opposite dropped as a taught tile because
// 32 files carry it in the antonym sense. Canal, Canal Street, houseboat,
// slanted roof, moving truck, Junie, Everett, Brandt are catalog-first.
// Keys prefixed quiz- are fresh picture supports for the quiz's all-fresh
// wildlife rescue center frame. Tiles lowercase, audio-free, kebab ids,
// 28-char cap; speak texts carry no " my "; speak scenes imageless.

const A = (id: string) => `/audio/lessons-v2/when-and-where-words/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/when-and-where-words/${w.toLowerCase()}.png`;

export const whenAndWhereWordsImages: Record<string, string | { subject: string; ref?: string }> = {
  "canal-street-moving-day": "A tall narrow blue house with a steep slanted roof and one small round attic window, standing at the end of a quiet street right beside a calm green canal, a plain white moving truck with no writing on it parked at the edge of the water with its tailgate down, a girl of about eight with short curly dark hair in a yellow T-shirt carrying a plain brown cardboard box up the front steps, a taller boy with straight brown hair in a green hoodie carrying a small lamp, a dad with a short beard in a gray shirt and an elderly woman with white hair in a red cardigan squeezing a striped couch through the front door, a small wooden houseboat moored on the canal, low green hills far in the distance. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no paper tags, no stickers, no writing anywhere.",
  "room-beneath-the-roof": { subject: "The inside of a small cozy bedroom tucked under a steeply slanted wooden ceiling, one round window showing a green canal and low green hills beyond it, a bed with a blue quilt pushed under the low side of the roof, the same girl with short curly dark hair in a yellow T-shirt sitting on a plain brown cardboard box and looking out the round window, three more plain unlabeled cardboard boxes stacked by the door, warm afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no paper tags, no stickers, no writing anywhere.", ref: "canal-street-moving-day" },
  "morning-after-the-rain": { subject: "The same small bedroom under the slanted wooden ceiling at sunrise, the same girl with short curly dark hair in yellow pajamas pressing her nose to the round window, raindrops still clinging to the glass, a calm green canal and wet rooftops outside with a golden sun rising over the low hills beyond the water, a tall pile of plain unlabeled cardboard boxes burying a small table in the corner, a blue quilt thrown back on the bed. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no sun face, no letters, no words, no numbers, no signs, no labels, no paper tags, no stickers, no writing anywhere.", ref: "room-beneath-the-roof" },
  "quiz-bobcat-under-heat-lamp": "A small spotted bobcat kitten with tufted ears curled up asleep on a folded gray blanket directly underneath a warm glowing red heat lamp that hangs from a wooden beam, inside a clean wooden pen with straw on the floor, the kitten seen from the side with its head resting on its paws and its face turned away from the viewer so that no mouth is visible, eyes closed, a realistic sleeping wild cat with NO smile and NO mouth line, not cute, not cartoon-happy. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.",
  "quiz-hawk-across-from-gate": "A wide gravel path at a wildlife rescue center, a tall wooden entrance gate with an open door on the left side of the path, and directly across the path on the right side a large screened outdoor enclosure with a brown red-tailed hawk perched on a bare branch inside, pine trees and a blue sky behind, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.",
  "quiz-center-far-side-of-river": "A plain yellow school bus with no writing on it crossing a long wooden bridge over a wide blue river, a low wooden building with a green roof and several fenced animal pens sitting on the far bank of the river, a long forested ridge rising far in the distance behind it, morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere."
};

export const whenAndWhereWords: LessonDef = {
  id: "when-and-where-words",
  title: "When and Where Words",
  grade: "3rd Grade",
  standard: "L.3.6",
  archetype: "vocabulary",
  objective: "I can choose and use precise words that tell exactly when and exactly where.",
  concepts: [
    "a precise when-word or where-word carries its own shade",
    "meanwhile is at the same time, afterward is later, eventually is after a long wait",
    "beyond is farther away, nearby is close, beneath is under",
    "pick the word whose shade makes the sentence true",
    "a word is used wrongly when its shade does not match the rest of the sentence",
    "when-words tell the order events happened in",
    "use a when-word and a where-word in your own sentence",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you learned that a precise word carries a shade. Meanwhile is not afterward, and nearby is not beyond. You picked the word that fit, you caught a word used wrongly, you put events in order from their when-words, and you built a sentence of your own that told exactly when and exactly where.",
    "title": "Exactly When, Exactly Where",
    "body": "You chose precise when-words and where-words, caught the ones used wrongly, and used them in a sentence of your own."
  },
  scenes: [
    {
      id: "hook-read-moving-day",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one, moving day on Canal Street. Read along!",
      image: IMG("canal-street-moving-day"),
      narration: { audio: A("hook-read-moving-day"), script: "Hello, reader. Today is about words that tell exactly when and exactly where. A third grader does not settle for later or over there. You pick the word that carries the precise shade, and then you use it in a sentence of your own. The story starts on Canal Street, on moving day. Read along with me, and notice how many words tell you when something happened or where something sits." },
      interaction: { type: "read-along", text: "Junie's family moved into the narrow blue house on Canal Street on the last Saturday of summer, and the moving truck parked alongside the water, so close that Dad could have stepped from the tailgate onto a houseboat. Her new room was upstairs, tucked beneath the slanted roof, and its one round window looked beyond the canal to a line of green hills. Everett claimed the room nearby, just across the hall, before Junie had carried up a single box. Meanwhile, Dad and Mrs. Brandt from next door hauled the couch through the front door one inch at a time. \"By tonight this place will feel like home,\" said Mrs. Brandt, and Junie was not so sure.", audio: A("hook-read-moving-day-sentence") },
    },
    {
      id: "model-when-words",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: each when-word carries its own shade.",
      fx: {"text":"**meanwhile**, **afterward**, **eventually**, **before long**, **at last**","effect":"pop-words"},
      narration: { audio: A("model-when-words"), script: "Here are the when-words, and each one carries its own shade. Meanwhile means at the same time. On page one, Dad and Mrs. Brandt hauled the couch, and meanwhile Junie was upstairs, so both things were happening at once. Afterward means later, once something else is finished. Junie unpacked her books, and afterward she ate supper. Eventually means after a long wait. The truck was slow, but eventually every box came inside. Before long means soon, after only a short wait. Junie sat down, and before long Everett was at her door. At last means finally, after a long wait for something you wanted. The lamp was in the very last box, and at last her room had light. Overnight means during the night, and the moment means right when something happens. Same time, later, after a long wait, soon, finally. That is what precise looks like." },
    },
    {
      id: "guided-choose-when-shade",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which when-word tells that two things happened at the same time?",
      narration: { audio: A("guided-choose-when-shade"), script: "Your turn with the shades. Four when-words are on your screen. One of them tells that two things were happening at the same time. Say the shade of each word in your head, and tap that one." },
      interaction: { type: "choose", options: [{ id: "meanwhile", label: "meanwhile" }, { id: "eventually", label: "eventually" }, { id: "before-long", label: "before long" }, { id: "at-last", label: "at last" }], correctId: "meanwhile", coachWrong: "Say the shade of that word. Does it mean two things at once, or does it mean soon, or later, or after a long wait?" },
    },
    {
      id: "guided-choose-when-fits",
      purpose: "guided",
      gate: "interaction",
      prompt: "Dad was still hauling boxes, and ___ Everett taped the last box shut.",
      narration: { audio: A("guided-choose-when-fits"), script: "Now pick the word that makes a sentence precise. Here is the sentence. Dad was still hauling boxes, and blank, Everett taped the last box shut. The word still is your clue. Four when-words are on your screen. Tap the one that fits the hole." },
      interaction: { type: "choose", options: [{ id: "meanwhile", label: "meanwhile" }, { id: "afterward", label: "afterward" }, { id: "eventually", label: "eventually" }, { id: "at-last", label: "at last" }], correctId: "meanwhile", coachWrong: "The clue is the word still. Dad had not finished yet when Everett taped the box. Tap the word that carries that shade." },
    },
    {
      id: "model-where-words",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: each where-word draws a different picture.",
      image: IMG("room-beneath-the-roof"),
      narration: { audio: A("model-where-words"), script: "Now the where-words, and these carry shades too. Beneath means under, with something above you. Junie's room was tucked beneath the slanted roof. Beyond means farther away, on the far side of something. Her window looked beyond the canal to the hills, so the hills were past the water. Nearby means close, only a few steps away. Everett's room was nearby, just across the hall. Alongside means right next to something, side by side along its length. The truck parked alongside the water. Upstairs means on the floor above. Along the edge means following the border of something, not the middle. Under, farther, close, side by side, the floor above, the border. Each word draws a different picture, and that is why a writer chooses carefully." },
    },
    {
      id: "guided-choose-where-fits",
      purpose: "guided",
      gate: "interaction",
      prompt: "The old boathouse sat ___ the bridge, so far off that it looked like a toy.",
      narration: { audio: A("guided-choose-where-fits"), script: "Your turn to pick the where-word that makes this sentence precise. Here is the sentence. The old boathouse sat blank the bridge, so far off that it looked like a toy. The clue is so far off. Four where-words are on your screen. Tap the one that fits the hole." },
      interaction: { type: "choose", options: [{ id: "beneath", label: "beneath" }, { id: "beyond", label: "beyond" }, { id: "nearby", label: "nearby" }, { id: "alongside", label: "alongside" }], correctId: "beyond", coachWrong: "Use the clue. The boathouse looked tiny because it was far off. Which where-word carries that shade?" },
    },
    {
      id: "guided-choose-where-close",
      purpose: "guided",
      gate: "interaction",
      prompt: "The library is a two-minute walk from Junie's door. Which word fits?",
      narration: { audio: A("guided-choose-where-close"), script: "One more shade, and this one separates close from far. The library is a two-minute walk from Junie's front door. You could say it is somewhere in town, but a precise writer says exactly how close. Four where-words are on your screen. Tap the one that tells the reader the library is close." },
      interaction: { type: "choose", options: [{ id: "nearby", label: "nearby" }, { id: "beneath", label: "beneath" }, { id: "beyond", label: "beyond" }, { id: "upstairs", label: "upstairs" }], correctId: "nearby", coachWrong: "A two-minute walk is not far away, and it is not under anything or on a floor above. Which word carries the shade of close?" },
    },
    {
      id: "guided-sort-when-where",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: When Word or Where Word.",
      narration: { audio: A("guided-sort-when-where"), script: "Now sort the shades. Six words are on your screen. If a word tells when something happened, drag it to When Word. If a word tells where something sits, drag it to Where Word." },
      interaction: { type: "sort", buckets: ["When Word","Where Word"], items: [{ label: "overnight", bucket: "When Word" }, { label: "beneath", bucket: "Where Word" }, { label: "before long", bucket: "When Word" }, { label: "alongside", bucket: "Where Word" }, { label: "at last", bucket: "When Word" }, { label: "upstairs", bucket: "Where Word" }], coachWrong: "Put that word in a sentence. Does it answer the question when, or the question where?" },
    },
    {
      id: "apply-read-first-night",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, the first night. Read along!",
      image: IMG("morning-after-the-rain"),
      narration: { audio: A("apply-read-first-night"), script: "Back to Canal Street for page two, the first night and the first morning. Five when-words and three where-words are doing the work here. Read along with me, and notice which words tell you the order things happened in." },
      interaction: { type: "read-along", text: "Overnight, rain drummed on the slanted roof so hard that Junie pulled the blanket over her head and wondered whether the whole canal might climb the stairs. The moment the sun came up, she pressed her nose to the round window and saw that the water had stayed exactly where it belonged. Before long, Everett knocked with two bowls of cereal, and they ate on the floor because the table was still buried beneath a mountain of boxes. Eventually the boxes were emptied one by one, and Junie hung a string of tiny lights along the edge of the ceiling where the roof slanted lowest. At last, when the sky turned orange beyond the hills, she sat on the windowsill and decided that Mrs. Brandt had been right after all.", audio: A("apply-read-first-night-sentence") },
    },
    {
      id: "apply-choose-misuse-when",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sentence uses its when-word wrongly?",
      narration: { audio: A("apply-choose-misuse-when"), script: "A precise word only works when its shade is true. Here are four sentences. One. Junie fell asleep, and afterward she dreamed about the canal. Two. The soup simmered, and meanwhile Dad set the table. Three. Everett brushed his teeth, and meanwhile he was fast asleep. Four. Before long the moving truck drove away. Three of those use their when-word correctly. Tap the one that uses its word wrongly." },
      interaction: { type: "choose", options: [{ id: "afterward-she-dreamed", label: "afterward she dreamed" }, { id: "meanwhile-dad-set-the-table", label: "meanwhile dad set the table" }, { id: "meanwhile-he-was-fast-asleep", label: "meanwhile he was fast asleep" }, { id: "before-long-the-truck-left", label: "before long the truck left" }], correctId: "meanwhile-he-was-fast-asleep", coachWrong: "That when-word fits its sentence. Test the others. Can both halves of the sentence really happen at the same time?" },
    },
    {
      id: "apply-choose-misuse-where",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sentence uses its where-word wrongly?",
      narration: { audio: A("apply-choose-misuse-where"), script: "Now the where-words. Here are four more sentences. One. Junie tucked her boots beneath the bed. Two. The hills rose beyond the canal. Three. Everett walked alongside the moving truck. Four. Junie kept her lamp nearby, way over on the far side of town. Three of those where-words tell the truth. Tap the sentence whose where-word does not fit." },
      interaction: { type: "choose", options: [{ id: "boots-beneath-the-bed", label: "boots beneath the bed" }, { id: "hills-beyond-the-canal", label: "hills beyond the canal" }, { id: "walked-alongside-the-truck", label: "walked alongside the truck" }, { id: "lamp-nearby-on-the-far-side", label: "lamp nearby on the far side" }], correctId: "lamp-nearby-on-the-far-side", coachWrong: "That where-word matches its sentence. Find the sentence where the word and the rest of the sentence disagree about the distance." },
    },
    {
      id: "apply-sequence-first-night",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put page two's events in order. The when-words tell you.",
      narration: { audio: A("apply-sequence-first-night"), script: "The when-words on page two tell you the order. Four events from that page are on your screen, mixed up. Think about which when-word each event came with, and tap the events in the order they happened." },
      interaction: { type: "sequence", items: [{ id: "rain-drums-on-the-roof", label: "rain drums on the roof" }, { id: "cereal-on-the-floor", label: "cereal on the floor" }, { id: "the-boxes-get-emptied", label: "the boxes get emptied" }, { id: "the-sky-turns-orange", label: "the sky turns orange" }], order: ["rain-drums-on-the-roof","cereal-on-the-floor","the-boxes-get-emptied","the-sky-turns-orange"], coachWrong: "Go back to the when-word each event came with. Overnight comes before the moment the sun came up, and at last comes at the very end." },
    },
    {
      id: "apply-speak-read-lamp",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Everett found the light switch beneath the stairs, and the whole hall lit up at once. Meanwhile Junie carried the lamp upstairs, and before long her new room glowed. They stood at the round window and looked beyond the canal until the last hill went dark.",
      narration: { audio: A("apply-speak-read-lamp"), script: "These three sentences are yours to read, and they carry two when-words and three where-words. Read them out loud, clearly and at a talking pace, and let each precise word paint its picture." },
      interaction: { type: "speak", text: "Everett found the light switch beneath the stairs and the whole hall lit up at once Meanwhile Junie carried the lamp upstairs and before long her new room glowed They stood at the round window and looked beyond the canal until the last hill went dark" },
    },
    {
      id: "challenge-speak-own-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one sentence about your day with a when-word and a where-word.",
      narration: { audio: A("challenge-speak-own-sentence"), script: "Last one, and it comes from your own day. Think of something you did today. Tap the mic and say one sentence that uses a when-word, like meanwhile or afterward, and a where-word, like beneath or nearby. Make both shades true." },
      interaction: { type: "speak", text: "meanwhile afterward eventually overnight before long last moment beneath beyond nearby alongside upstairs downstairs edge under above school home bed breakfast lunch dinner bus room kitchen table desk door window yard park morning night today teacher friend mom dad sister brother" },
    },
    {
      id: "celebrate-when-and-where",
      purpose: "celebrate",
      gate: "none",
      prompt: "Exactly when, exactly where.",
      fx: {"text":"Exactly **when**, exactly **where**","effect":"fireworks"},
      narration: { audio: A("celebrate-when-and-where"), script: "A precise word carries a shade, and today you used the shades on purpose. Meanwhile is not afterward, and nearby is not beyond. You picked the word that fit the sentence, you caught a word used wrongly, you put events in order from their when-words, and you built a sentence of your own that told exactly when and exactly where. Keep choosing the exact word. Readers can see what you mean." },
    },
  ],
};
