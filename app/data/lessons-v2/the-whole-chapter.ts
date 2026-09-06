import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-whole-chapter-timings.json";

// The Whole Chapter (RL.3.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-whole-chapter
// G3-U3. THE GRADE 3 LITERATURE CAPSTONE (precedent: the-whole-story RL.2.10,
// The Whistle, twelve sentences over five pages with the G2 toolbox). No new
// skill. The child reads ONE longer, harder chapter at the high end of the
// grades 2-3 band, mostly in their own voice, and applies the whole G3 RL
// toolbox between the pages, a different tool each time and none of them
// taught here: the proving line (show-me-where RL.3.1), a trait from actions
// (why-they-did-it RL.3.3), a phrase that means more (more-than-it-says
// RL.3.4), the chapter as a part that builds on chapter one (parts-that-build
// RL.3.5), the narrator's view held apart from the reader's own (their-view-
// your-view RL.3.6), and the message from the details (follow-the-message
// RL.3.2), then a five-event sequence, an In the Story / Not in the Story
// sort, and a production retell. ONE original chapter, "The Long Flight",
// chapter two of Clementine and the Rooftop Birds (chapter one is recapped in
// the hook: Grandpa Vernon's twelve homing pigeons in a loft on the roof,
// Clementine feeding them every morning since spring, the gray bird Slate
// that lands on her wrist first, the warning that a young bird can lose the
// way): 16 sentences over 6 child-read pages (read-along 1 and 4 with images,
// accept-mode speaks 2/3/5/6 at 47/53/53/47 tokens, no " my " token),
// compound + early-complex sentences, three speech-tagged dialogue lines,
// stretch words wicker / homing / strutting / skidded with in-text support,
// no digits, no contractions in read-along or speak text. A third-person
// narrator with an opinion ("if you ask me, most people would have been
// right"), one phrase that means more ("the hours crawled"), a trait shown by
// repeated action (faithful), a message shown only by what happens (daily
// care comes back to you), and a clear turn on the last page. ANCHOR
// FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Clementine,
// Vernon, Slate, loft, homing, tar paper, seed can, the hours crawled all
// 0 hits; pigeon only as a root-word tile, wicker only as image prose. Keys
// prefixed quiz- are picture supports for the quiz's fresh chapter (Winona,
// Conrad, Mr. Dunbar, the chess club: all 0 hits).

const A = (id: string) => `/audio/lessons-v2/the-whole-chapter/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-whole-chapter/${w.toLowerCase()}.png`;

export const theWholeChapterImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wide open grassy field on a bright autumn morning with a dusty green pickup truck parked on a dirt road, an elderly man with brown skin, a short white beard, a flat gray cap, and a brown canvas jacket kneeling beside an open tan wicker basket, and a nine year old girl with pale skin, freckles, and short red hair under a blue knit hat, wearing a yellow raincoat and holding a plain silver tin can with both hands, both looking up as a flock of twelve gray and white pigeons bursts up out of the basket into the sky, a river and low hills far in the distance. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-4": { subject: "The flat black tar paper roof of a city apartment building at night, a small wooden pigeon loft like a little shed with its door standing wide open and a shallow water dish beside it, the same nine year old girl with pale skin, freckles, short red hair, a blue knit hat, and a yellow raincoat sitting alone on the roof edge with a lit flashlight in one hand and the same plain silver tin can in her lap, looking up at a dark empty sky over the dark shapes of other rooftops and a distant river, a few lit windows in the buildings below, no birds anywhere in the sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no faces on any objects, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-chess-table": "A quiet public library reading room with tall wooden bookshelves of plain colored book spines with no markings, a ten year old girl with light brown skin and two dark braids in a green sweater sitting at a small table across from a taller teenage boy with light brown skin and short black hair in a red hoodie, a wooden chessboard between them with plain black and white squares and no letters or numbers on its edges, simple wooden chess pieces in play, a closed plain green notebook with a blank cover beside the girl's elbow, warm afternoon light through a window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-king-on-its-side": { subject: "A close view of the same wooden chessboard with plain black and white squares and no markings on its edges, a black wooden chess king lying tipped over on its side in the middle of the board among a few standing wooden pieces, the same girl's hand with light brown skin resting flat on the table edge, the same closed plain green notebook with a blank cover beside the board, warm library light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-chess-table" },
  "quiz-mr-dunbar-watching": { subject: "The same library reading room, the same girl with light brown skin, two dark braids, and a green sweater seen from behind at the chess table, and standing right behind her chair a tall thin older man with dark brown skin, round glasses, a gray mustache, and a brown cardigan, his arms folded across his chest and his face calm and serious as he watches the board, the same teenage boy in a red hoodie across the table chewing his thumbnail with a worried face, empty tables and chairs around them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-chess-table" }
};

export const theWholeChapter: LessonDef = {
  id: "the-whole-chapter",
  title: "The Whole Chapter",
  grade: "3rd Grade",
  standard: "RL.3.10",
  archetype: "story-elements",
  objective: "I can read a whole chapter mostly on my own, hold on to what happens, and use every reading tool I own to understand it from the first page to the last.",
  concepts: [
    "read a whole chapter, hold on to what happens, check that it made sense",
    "answer, then point to the proving line",
    "a trait shows in what a character does again and again",
    "a phrase can mean more than it says",
    "a chapter builds on the chapter before it",
    "the narrator's view is not always your view",
    "the message is shown by the details, never printed",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Long Flight from the first page to the last, and most of it was in your own voice. You pointed to the proving line, you named what Clementine is like from what she did, you said the plain version of a phrase, you held the narrator's view apart from your own, and you followed the details to the message. That is what a third grade reader does with a real chapter.",
    "title": "The Whole Chapter",
    "body": "You read a whole chapter mostly on your own and used every reading tool you own on it, from the first page to the last."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Clementine and the Rooftop Birds, chapter two, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Today there is no new tool. Today you read one whole chapter, and most of the reading is yours. Between the pages you will use the tools you already own, a different one each time. The book is called Clementine and the Rooftop Birds. In chapter one, Clementine's grandfather, Vernon, keeps twelve homing pigeons in a loft, a little wooden house for birds, on the roof of their building. In the spring he put Clementine in charge of the young birds, and every morning since then she has climbed the stairs with the seed can before school. The gray bird she named Slate always lands on her wrist first. Grandpa warned her that a young bird on its first long flight does not always find the way home. Here is chapter two, The Long Flight, page one. Read along with me." },
      interaction: { type: "read-along", text: "On the last Saturday of September, Grandpa Vernon lifted the twelve young pigeons into a wicker basket, and Clementine rode beside them in the truck with the seed can on her lap. They drove across the river and forty miles past it, farther than the birds had ever flown, because a homing pigeon learns the road home only by flying it. \"Most of them will beat us back to the roof,\" said Grandpa as he raised the lid, \"but a young bird on its first long flight can lose the way.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-read-hold-on-check",
      purpose: "model",
      gate: "none",
      prompt: "Read. Hold on. Check.",
      fx: {"text":"**Read**. **Hold on**. **Check**.","effect":"pop-words"},
      narration: { audio: A("model-read-hold-on-check"), script: "A chapter is longer than a page, so a chapter reader does three things on every page. Read it. Hold on to what matters. Check that it made sense. Watch me on page one. I read it. Now I hold on to what matters: twelve young birds, a drive forty miles past the river, and Grandpa's warning that a young bird can lose the way. Now I check. Can I say what happened? Grandpa drove the birds far from home so that they could fly back. Yes, so I keep going. Notice one more thing. Page one only makes sense because of chapter one. Chapter one set up the young birds, the seed can every morning, and the warning, and this chapter builds on all of it. From here, most of the reading is yours. After every page, hold on to what mattered, because each check between the pages asks for a different tool, and the last checks ask about the whole chapter." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: The birds burst out of the basket in a gray and white cloud and circled twice over the field. Then they turned toward the river all at once, as if someone had called them, and were gone. Clementine counted them out of sight, and she counted eleven.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and hold on to the number at the end." },
      interaction: { type: "speak", text: "The birds burst out of the basket in a gray and white cloud and circled twice over the field Then they turned toward the river all at once as if someone had called them and were gone Clementine counted them out of sight and she counted eleven" },
    },
    {
      id: "guided-choose-proof-line",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why did Grandpa drive the birds so far from home? Tap the line that proves it.",
      narration: { audio: A("guided-choose-proof-line"), script: "First tool. Answer, then point to the line. Why did Grandpa drive the birds so far from home? Say the answer in your head. Four lines from the chapter are on your screen, and every one of them is really there. Only one of them proves your answer. Tap that line." },
      interaction: { type: "choose", options: [{ id: "only-by-flying-it", label: "only by flying it" }, { id: "the-seed-can-on-her-lap", label: "the seed can on her lap" }, { id: "circled-twice-over-the-field", label: "circled twice over the field" }, { id: "can-lose-the-way", label: "can lose the way" }], correctId: "only-by-flying-it", coachWrong: "That line is really in the chapter, but it answers a different question. Look for the line that comes right after the word because." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: By the time the truck pulled up at home, eleven birds were strutting across the roof, but Slate, the gray one, was nowhere. Clementine climbed to the loft with the seed can and shook it the way she had every morning since spring, and she kept shaking it until the streetlights came on.",
      narration: { audio: A("page-3-read"), script: "Page three is yours. Read both sentences out loud, and hold on to what Clementine does when she gets home." },
      interaction: { type: "speak", text: "By the time the truck pulled up at home eleven birds were strutting across the roof but Slate the gray one was nowhere Clementine climbed to the loft with the seed can and shook it the way she had every morning since spring and she kept shaking it until the streetlights came on" },
    },
    {
      id: "guided-choose-trait",
      purpose: "guided",
      gate: "interaction",
      prompt: "What do Clementine's actions show she is like?",
      narration: { audio: A("guided-choose-trait"), script: "Second tool. The chapter never says what Clementine is like, so you find it in what she does. On page three she climbed to the loft, she shook the can the way she had every morning since spring, and she stayed until the streetlights came on. Four words are on your screen. Tap the one her actions prove." },
      interaction: { type: "choose", options: [{ id: "faithful", label: "faithful" }, { id: "careless", label: "careless" }, { id: "greedy", label: "greedy" }, { id: "bossy", label: "bossy" }], correctId: "faithful", coachWrong: "Check that word against page three. Did Clementine do that kind of thing? Find the word that her climbing, shaking, and staying prove." },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page four. Read along, and listen for the narrator's opinion.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Page four. Read along with me, and notice that the voice telling this chapter has an opinion of its own." },
      interaction: { type: "read-along", text: "On Sunday she was on the roof before the sun, and she was there again at noon, and she was there after supper with a flashlight, though the loft door stood open and the water dish was full. Most people would have given up on one gray bird out of twelve by then, and if you ask me, most people would have been right. The hours crawled, and the sky over the river stayed empty.", audio: A("page-4-read-sentence") },
    },
    {
      id: "guided-choose-phrase",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does the hours crawled mean here?",
      fx: {"text":"**The hours crawled**, and the sky over the river stayed empty.","effect":"glow"},
      narration: { audio: A("guided-choose-phrase"), script: "Third tool. Page four says, the hours crawled. Hours have no legs, so that phrase means more than it says. Read around it. She was on the roof before the sun, at noon, and after supper, and the sky stayed empty the whole time. Four plain versions are on your screen. Tap the one this chapter supports." },
      interaction: { type: "choose", options: [{ id: "the-day-went-by-very-slowly", label: "the day went by very slowly" }, { id: "the-day-went-by-very-fast", label: "the day went by very fast" }, { id: "she-crawled-along-the-roof", label: "she crawled along the roof" }, { id: "the-birds-crawled-home", label: "the birds crawled home" }], correctId: "the-day-went-by-very-slowly", coachWrong: "Read around the phrase again. She waited from before the sun until after supper, and nothing came. Think about how a whole day of waiting like that feels." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: Grandpa Vernon came up at dusk with a quilt and two sandwiches and sat down on the tar paper beside her. He did not tell her to come inside, and he did not say that Slate was gone for good. He only said that the loft door should stay open one more night.",
      narration: { audio: A("page-5-read"), script: "Page five is yours. Read all three sentences out loud, and hold on to what Grandpa does not say." },
      interaction: { type: "speak", text: "Grandpa Vernon came up at dusk with a quilt and two sandwiches and sat down on the tar paper beside her He did not tell her to come inside and he did not say that Slate was gone for good He only said that the loft door should stay open one more night" },
    },
    {
      id: "apply-choose-narrator-view",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the narrator think about Clementine's waiting?",
      fx: {"text":"The narrator's view is **not always** your view","effect":"underline"},
      narration: { audio: A("apply-choose-narrator-view"), script: "Fourth tool. The voice telling this chapter is not a character in it, but it still has an opinion, and that opinion is hiding in the words on page four. Think about what the narrator said most people would have done by Sunday, and whose side the narrator took. Four views are on your screen. Tap the narrator's view. Your own view can be different, and you will get to say it at the end." },
      interaction: { type: "choose", options: [{ id: "one-bird-was-not-worth-it", label: "one bird was not worth it" }, { id: "waiting-was-the-right-choice", label: "waiting was the right choice" }, { id: "grandpa-should-wait-instead", label: "grandpa should wait instead" }, { id: "she-should-wait-even-longer", label: "she should wait even longer" }], correctId: "one-bird-was-not-worth-it", coachWrong: "Go back to the narrator's own words on page four, right after most people would have given up. Whose side did the narrator take?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Just as the streetlights blinked on, a gray shape dropped out of the dark, skidded across the tar paper, and landed on the rim of the seed can in her lap. \"He did not come home to the roof,\" Grandpa said quietly, \"he came home to you.\"",
      narration: { audio: A("page-6-read"), script: "The last page is yours. Read both sentences out loud, and hold on to where the bird lands." },
      interaction: { type: "speak", text: "Just as the streetlights blinked on a gray shape dropped out of the dark skidded across the tar paper and landed on the rim of the seed can in her lap He did not come home to the roof Grandpa said quietly he came home to you" },
    },
    {
      id: "apply-choose-message",
      purpose: "apply",
      gate: "interaction",
      prompt: "What message does this chapter show?",
      narration: { audio: A("apply-choose-message"), script: "Fifth tool. The chapter never prints its message, so follow the details to it. Every morning since spring, Clementine fed the birds. When one went missing, she kept climbing the stairs and shaking the can. And on the last page, the bird landed on her seed can, not on the roof. One message on your screen is shown by all of those details together. The others sound wise, but the chapter never shows them. Tap the message the details support." },
      interaction: { type: "choose", options: [{ id: "daily-care-comes-back-to-you", label: "daily care comes back to you" }, { id: "a-lost-bird-is-lost-for-good", label: "a lost bird is lost for good" }, { id: "the-fastest-birds-fly-home", label: "the fastest birds fly home" }, { id: "never-let-a-young-bird-fly", label: "never let a young bird fly" }], correctId: "daily-care-comes-back-to-you", coachWrong: "Test it against the details. Did the chapter show that happening? Find the message that the feeding, the waiting, and the landing all point to." },
    },
    {
      id: "apply-sequence-chapter-events",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the chapter's events in order.",
      narration: { audio: A("apply-sequence-chapter-events"), script: "A chapter is one part of a longer book, and it builds on the part before it. Chapter one set up the young birds, the seed can every morning, and the warning, and this chapter built the long flight on top of them. Here are five events from this chapter, mixed up. Drag them into the order they happened, from the field on Saturday to the last page." },
      interaction: { type: "sequence", items: [{ id: "the-birds-leave-the-basket", label: "the birds leave the basket" }, { id: "eleven-birds-come-home", label: "eleven birds come home" }, { id: "clementine-waits-all-sunday", label: "clementine waits all sunday" }, { id: "grandpa-brings-a-quilt", label: "grandpa brings a quilt" }, { id: "slate-lands-on-the-seed-can", label: "slate lands on the seed can" }], order: ["the-birds-leave-the-basket","eleven-birds-come-home","clementine-waits-all-sunday","grandpa-brings-a-quilt","slate-lands-on-the-seed-can"], coachWrong: "Start in the field on Saturday, when the basket lid came up. Then follow the chapter home to the roof, through Sunday, to dusk, and to the last page." },
    },
    {
      id: "apply-sort-in-the-story",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: In the Story, or Not in the Story?",
      narration: { audio: A("apply-sort-in-the-story"), script: "Here are six statements about The Long Flight. Some of them have a line in the chapter that says so. Some sound possible, but no line on any page says it. Read each one. If you can point to a line, drag it to In the Story. If there is no line, drag it to Not in the Story." },
      interaction: { type: "sort", buckets: ["In the Story","Not in the Story"], items: [{ label: "the birds circled twice", bucket: "In the Story" }, { label: "the truck got a flat tire", bucket: "Not in the Story" }, { label: "grandpa brought sandwiches", bucket: "In the Story" }, { label: "it rained all day sunday", bucket: "Not in the Story" }, { label: "slate landed on the seed can", bucket: "In the Story" }, { label: "slate has a broken wing", bucket: "Not in the Story" }], coachWrong: "Hunt for the line. If a page says it, it is in the story. If every page comes up empty, it is not." },
    },
    {
      id: "challenge-speak-retell-chapter",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell what this chapter was about in your own words.",
      narration: { audio: A("challenge-speak-retell-chapter"), script: "Last one, and you say it out loud. Tap the mic. Tell what this whole chapter was about, from the first page to the last, in your own words. Say who it was about, what went wrong, and how it turned out. If you want, add what you think about all that waiting." },
      interaction: { type: "speak", text: "clementine grandpa vernon slate pigeon pigeons bird birds basket truck river field flew flying flight home roof loft seed can shook waited waiting wait sunday stairs streetlights landed lap eleven twelve missing lost gone came back returned faithful worth" },
    },
    {
      id: "celebrate-whole-chapter",
      purpose: "celebrate",
      gate: "none",
      prompt: "One whole chapter. Every tool.",
      fx: {"text":"**One** whole chapter. **Every** tool.","effect":"fireworks"},
      narration: { audio: A("celebrate-whole-chapter"), script: "You read a whole chapter today, and most of it was in your own voice. Between the pages you pointed to the proving line, you named what Clementine is like from what she did, you said the plain version of a phrase, you held the narrator's view apart from your own, and you followed the details to the message. Then you put the whole chapter in order and told it back. That is what a third grade reader does with a real book. Read the whole chapter, hold on, and check." },
    },
  ],
};
