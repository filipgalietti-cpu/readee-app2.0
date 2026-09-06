import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./take-apart-any-word-timings.json";

// Take Apart Any Word (RF.3.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=take-apart-any-word
// G3-U1 APPLICATION CAPSTONE for RF.3.3 (the umbrella row, parked until the
// toolkit existed, as decoding-champions RF.2.3 was for G2). No new tool is
// taught. Sibling split: meaning-machines RF.3.3a owns affix MEANING (pre-,
// dis-, -ful, -less, -able, -tion as machines), long-word-trains RF.3.3b owns
// Latin-suffix DECODING (-tion/-ture/-ous/-able/-ible as chunk-and-snap
// cabooses), three-word-tools L.3.4 owns meaning strategies for unknown words.
// THIS lesson owns doing both moves INSIDE running text at 3rd-grade pace:
// spot the part (a machine at the front / a caboose at the end / both), take
// the word apart, snap it back, read the whole word, and keep the sentence
// moving. RF.3.3c syllable division and RF.3.3d irregular words are Unit 2
// and are NOT taught here. ONE original story, "The Cedar Pond Regatta":
// 15 sentences over 5 child-read pages (read-along 1/3/5, speak 2/4) plus a
// closing production sentence, compound + early-complex sentences, tagged
// dialogue, stretch words regatta / mast / buoys / rudder / muttered with
// in-text support, and twelve planted long words spread two or three per
// page: thoughtless, prepacked, dependable (p1), breathless, disqualified
// (p2), adjustable, competition (p3), preparation, countless (p4),
// unstoppable, skillful, victorious (p5), thunderous, disbelief (closer).
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: all
// planted words, sort/tile words (dismount, texture, precook, glorious,
// unfold, painful, brightness, brothers), names Zadie / Tariq / Uncle Emeka,
// and the setting (Cedar Pond, regatta, buoys, rudder, dock) are 0-hit.
// Rejected as burned: colorful, prediction/predict, flexible, nervous,
// hopeful, fearless, direction, dislike, useful, careful, helpless, furious,
// prewash, unzip, structure, nature, thoughtful, curious, possible, Bruno.
// TTS carriers per pilot precedent: "the shun ending, spelled t, i, o, n",
// "spelled a, b, l, e", digits as words.

const A = (id: string) => `/audio/lessons-v2/take-apart-any-word/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/take-apart-any-word/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/take-apart-any-word/${w.toLowerCase()}.png`;

export const takeApartAnyWordImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with light brown skin and a short curly black bob wearing a yellow rain jacket, carrying a small wooden model sailboat with a plain white cloth sail in both hands down a grassy hill toward a wide calm pond, walking beside a tall smiling man with dark brown skin, a short gray beard, and a green sweater, a small wooden dock at the bottom of the hill with a few tiny model sailboats floating near it, bright cloudy morning sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags, no signs, no writing anywhere.",
  "page-3": { subject: "The same wide pond seen from the grassy bank on a windy day, several small wooden model sailboats with plain white sails racing across choppy blue water, the leading boat's sail bent in a smooth curve, two other boats tipped sideways by a gust, a row of round orange floats bobbing along the far edge of the pond, the same young girl with light brown skin and a short curly black bob in a yellow rain jacket watching from a small wooden dock next to a boy with dark brown skin and short black hair in a blue hoodie, gray-blue sky with fast clouds. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same small wooden model sailboat with a plain white cloth sail gliding across a rope stretched low over calm, glassy pond water, other model sailboats sitting motionless behind it, the same young girl with light brown skin and a short curly black bob in a yellow rain jacket leaning forward on the small wooden dock with her hands clasped, the same tall man with dark brown skin, a short gray beard, and a green sweater grinning beside her, a boy with dark brown skin and short black hair in a blue hoodie cheering with both arms up, soft sunny sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-scraped-knee": "A young child sitting on a park path holding one knee that has a small red scrape, a bicycle lying on the grass nearby, the child's face calm but wincing a little, leafy trees behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-headphones": "A pair of chunky teal over-ear headphones resting on a plain wooden desk next to a small green potted plant, the headphones completely cordless with nothing attached to them, soft pale background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no writing anywhere.",
  "quiz-balloon-departure": "A big striped red and yellow hot air balloon just lifting off from a green field, its wicker basket a few feet above the grass with two people waving from inside, a small crowd watching from the ground, clear blue morning sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos, no writing anywhere."
};

export const takeApartAnyWord: LessonDef = {
  id: "take-apart-any-word",
  title: "Take Apart Any Word",
  grade: "3rd Grade",
  standard: "RF.3.3",
  archetype: "phonics",
  objective: "I can take a long word apart while I read a story and keep the sentence moving.",
  concepts: [
    "spot the part: a machine at the front, a caboose at the end, or both",
    "a machine at the front changes the meaning (pre, dis, un)",
    "a caboose at the end is chunked and snapped, and it has a job too",
    "read the base in the middle, snap the whole word, keep reading",
    "the same moves work on any long word in any book",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Prepacked, dependable, competition, preparation, unstoppable. You read every one of them inside a real story, and you kept going. Spot the part, take the word apart, snap it back, and keep reading. That move works on any long word in any book.",
    "title": "Any Word, Any Book",
    "body": "You took long words apart inside a real story and kept reading at full speed."
  },
  scenes: [
    {
      id: "hook-regatta-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Cedar Pond Regatta, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-regatta-page-one"), script: "Hello, reader. You already own two tools for long words. The machines from the repair shop, and the chunk and snap cabooses from the rail yard. Today you use both of them inside a real story, at reading speed, without stopping. Here is page one of The Cedar Pond Regatta. Read along with me, and notice the long words as they go by." },
      interaction: { type: "read-along", text: "On the morning of the Cedar Pond regatta, Zadie carried her model sailboat down the hill with both hands, because one thoughtless bump could crack its thin wooden mast. The night before, she had prepacked a small repair kit, since the wind over the pond changed its mind every minute. \"A stiff sail snaps in a hard wind,\" said Uncle Emeka, \"so we cut yours from a cloth that bends, and a sail that bends is dependable.\"", audio: A("hook-regatta-page-one-sentence") },
    },
    {
      id: "model-two-moves",
      purpose: "model",
      gate: "none",
      prompt: "Spot the part, take it apart, snap it back, keep reading.",
      fx: {"text":"**pre** packed and depend **able**","effect":"pop-words"},
      narration: { audio: A("model-two-moves"), script: "Page one holds three long words, and each one needs a move you already know. Here is the first. Prepacked. I see a part at the front, pre. That is a machine at the front, and pre always means before. I cover it, read the base, packed, and put the machine back. Prepacked, packed before. Then I keep reading the line. Here is the second. Dependable. I see a part at the end, spelled a, b, l, e. That is a caboose at the end, so I chunk it and snap it. De, pend, uh, bul, dependable. The caboose has a job too, because able means can be. A dependable sail can be depended on. The move is the same every time. Spot the part, take the word apart, snap it back, and keep reading." },
    },
    {
      id: "guided-choose-which-move",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which move does thoughtless need?",
      narration: { audio: A("guided-choose-which-move"), script: "Your turn to spot the part. Page one says one thoughtless bump could crack the mast. Look at the word thoughtless. Find its part, and decide which move it needs. Four moves are on your screen. Tap the move that thoughtless needs." },
      interaction: { type: "choose", options: [{ id: "a-machine-at-the-front", label: "a machine at the front" }, { id: "a-caboose-at-the-end", label: "a caboose at the end" }, { id: "both-front-and-end", label: "both, front and end" }, { id: "read-it-straight", label: "read it straight" }], correctId: "a-caboose-at-the-end", coachWrong: "Look at the very start of thoughtless, then at the very end. Which spot holds a part you know?" },
    },
    {
      id: "guided-choose-spoken-to-print",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says breathless.",
      narration: { audio: A("guided-choose-spoken-to-print"), script: "Page two is coming, and it holds a word you will meet at reading speed. The word is breathless. Tariq ran the whole way, so he arrived breathless. Four words are on your screen, and the fakes match only part of it. Read each one all the way to its end, and then tap the word that says breathless." },
      interaction: { type: "choose", options: [{ id: "breathless", label: "breathless" }, { id: "brightness", label: "brightness" }, { id: "breathing", label: "breathing" }, { id: "brothers", label: "brothers" }], correctId: "breathless", coachWrong: "Slow down and read the front of each word, then check its ending. Only one word carries the part that means without." },
    },
    {
      id: "guided-sequence-competition",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Snap the chunks into order: competition.",
      narration: { audio: A("guided-sequence-competition"), script: "Here is a long word from page three, and its chunks came apart. A race with many boats in it is a competition. Drag the chunks into reading order, the front chunks first, then the shun caboose, and the whole word at the end of the line." },
      interaction: { type: "sequence", items: [{ id: "com", label: "com" }, { id: "pe", label: "pe" }, { id: "ti", label: "ti" }, { id: "tion", label: "tion" }, { id: "competition", label: "competition" }], order: ["com","pe","ti","tion","competition"], coachWrong: "Say competition slowly and listen for each chunk in order. Start with the first chunk you hear, and save the whole word for the end." },
    },
    {
      id: "guided-sort-front-end",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort by move: Front Machine, or End Caboose?",
      narration: { audio: A("guided-sort-front-end"), script: "Six words, two moves. Read each word and find its part. If the part sits at the front, like pre, dis, or un, drag the word to Front Machine. If the part rides at the end, drag the word to End Caboose." },
      interaction: { type: "sort", buckets: ["Front Machine","End Caboose"], items: [{ label: "dismount", bucket: "Front Machine" }, { label: "texture", bucket: "End Caboose" }, { label: "precook", bucket: "Front Machine" }, { label: "glorious", bucket: "End Caboose" }, { label: "unfold", bucket: "Front Machine" }, { label: "forgetful", bucket: "End Caboose" }], coachWrong: "Find the part first. Is it at the very start of the word, or at the very end?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Tariq arrived at the dock breathless, because he had run the whole way from the bus stop. The judge stood on an upturned bucket and pointed at the row of orange buoys along the far edge. \"Every boat gets one push,\" he called, \"and any boat that drifts outside the buoys is disqualified.\"",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and when you reach a long word, take it apart, snap it back, and keep going." },
      interaction: { type: "speak", text: "Tariq arrived at the dock breathless because he had run the whole way from the bus stop The judge stood on an upturned bucket and pointed at the row of orange buoys along the far edge Every boat gets one push he called and any boat that drifts outside the buoys is disqualified" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the wind.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is page three, and two long words are waiting in it. Read along with me, and keep the sentence moving through each one." },
      interaction: { type: "read-along", text: "Zadie gave the adjustable rudder one last turn, then pushed, and the cloth sail filled with wind and bent like a bow. Halfway across, a wild gust spun two other boats sideways, and one of them drifted past the buoys and out of the competition. \"That wind has no manners,\" muttered Tariq, \"but your sail can handle it.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The little boat wobbled, then straightened, and it kept sliding toward the finish rope. Zadie held her breath, because all that preparation came down to one windy minute. Tariq stood on the dock without moving, and the countless faces along the bank went silent.",
      narration: { audio: A("page-4-read"), script: "Page four is yours, and one of its long words carries two parts at once. Read all three sentences out loud, and do not stop at the long words." },
      interaction: { type: "speak", text: "The little boat wobbled then straightened and it kept sliding toward the finish rope Zadie held her breath because all that preparation came down to one windy minute Tariq stood on the dock without moving and the countless faces along the bank went silent" },
    },
    {
      id: "apply-transform-skillful",
      purpose: "apply",
      gate: "interaction",
      prompt: "Build the word that describes a sailor with real skill.",
      narration: { audio: A("apply-transform-skillful"), script: "Now build a long word yourself. Uncle Emeka has a word for a sailor who handles wind with real skill. Start with the base skill, and snap on the ending whose job is full of." },
      interaction: { type: "transform", base: "skill", add: "ful", result: "skillful", changeIndex: 4, options: ["ful", "less", "ous"], labels: { added: "full of" }, successAudio: W("skillful"), coachWrong: "That ending has a different job. You need the one that fills a word up." },
    },
    {
      id: "model-both-preparation",
      purpose: "model",
      gate: "none",
      prompt: "Some words need both moves.",
      fx: {"text":"**pre** par a **tion**","effect":"magic"},
      narration: { audio: A("model-both-preparation"), script: "Some words carry a machine at the front and a caboose at the end, and page four had one. Preparation. Watch me use both moves. At the front I see pre, a machine that means before. At the end I see the shun caboose, spelled t, i, o, n, and it turns an action into a thing. Now I read the middle chunks and snap the whole train. Pre, par, ay, shun, preparation. The getting ready you do before something starts. Two moves, one word, and then I keep reading." },
    },
    {
      id: "apply-choose-unstoppable",
      purpose: "apply",
      gate: "interaction",
      prompt: "Take unstoppable apart. What does it mean?",
      narration: { audio: A("apply-choose-unstoppable"), script: "Here is a word from page five, and it needs both moves. Zadie's boat crept across the rope at an unstoppable crawl. Find the machine at the front, find the caboose at the end, and read the base in the middle. Then tap what unstoppable means." },
      interaction: { type: "choose", options: [{ id: "cannot-be-stopped", label: "cannot be stopped" }, { id: "stopped-before", label: "stopped before" }, { id: "stopped-again", label: "stopped again" }, { id: "full-of-stops", label: "full of stops" }], correctId: "cannot-be-stopped", coachWrong: "Take it apart one piece at a time. What does the front machine do to a word, and what job does the caboose at the end always have?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the finish. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and watch the word you just took apart go by at full speed." },
      interaction: { type: "read-along", text: "Then the wind died completely, and every boat on the pond sat still, except one. Zadie's sail was so light that the tiniest puff kept it moving, and the boat crept across the finish rope at an unstoppable crawl. \"Now that,\" said Uncle Emeka with a grin, \"is a skillful sailor and a victorious boat.\"", audio: A("page-5-read-sentence") },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: A thunderous cheer rolled across the pond, and Tariq shook his head in disbelief.",
      narration: { audio: A("challenge-speak-sentence"), script: "One more sentence closes the story, and it holds two long words nobody has read for you. Read the whole sentence out loud, clear and steady, and take each long word apart on the fly." },
      interaction: { type: "speak", text: "A thunderous cheer rolled across the pond and Tariq shook his head in disbelief" },
    },
    {
      id: "challenge-speak-parts",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which parts did you use on thunderous and disbelief?",
      narration: { audio: A("challenge-speak-parts"), script: "Now tell me how you did it. Tap the mic and name the parts you found in thunderous and in disbelief, and say which move each word needed." },
      interaction: { type: "speak", text: "thunder ous us thunderous dis belief believe disbelief caboose end ending front machine prefix suffix not opposite chunk chunks snap snapped part parts" },
    },
    {
      id: "celebrate-any-word",
      purpose: "celebrate",
      gate: "none",
      prompt: "Spot the part, take it apart, keep reading.",
      fx: {"text":"Any word, **any book**","effect":"fireworks"},
      narration: { audio: A("celebrate-any-word"), script: "You read a whole story full of long words today, and not one of them stopped you. You spotted machines at the front, cabooses at the end, and words that carried both. You took each one apart, snapped it back, and kept the sentence moving. That is how third grade readers handle any long word, in any book, at full speed." },
    },
  ],
};
