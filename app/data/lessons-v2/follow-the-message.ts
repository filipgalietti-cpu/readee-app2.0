import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./follow-the-message-timings.json";

// Follow the Message (RL.3.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=follow-the-message
// G3-U1 lesson 4. RECOUNT + MESSAGE + HOW tier of RL.3.2 (sibling split:
// fable-tellers RL.2.2 owns G2 fables + stating the moral; story-message
// RL.1.2 owns the G1 central message; tell-it-back RL.K.2 owns K retelling;
// show-me-where RL.3.1 owns pointing to the one proving line). THIS lesson
// owns the third-grade step-up: recount in order with key details, name the
// message the story SHOWS (never printed as a moral line), and explain HOW
// the message is carried by several details: what a character chose, what
// happened because of it, and what someone learned or said at the end. ONE
// original pourquoi-style myth, "Why the Pelicans Fly in a Line" (Juno, the
// fastest pelican in the cove, fails the wide bay alone; old Hollis shows her
// the line and the turn at the point; the next morning she offers the point to
// a wobbly young pelican): 15 sentences over 5 child-read pages (read-along
// 1/3/5 with images, speak 2/4), compound + early-complex sentences, three
// speech-tagged dialogue lines, stretch words exhausted / nudged / whitecaps /
// the point with in-text support. Planted tempting-but-unsupported message:
// "the strongest should lead" (Hollis leads first, then slides back).
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: pelican,
// Juno, Hollis, cove, bay, far shore, whitecaps, "take turns" all 0 hits.
// Keys prefixed quiz- are picture supports for the quiz's easier band
// (badger / marmot / sandpiper mini-fables, all fresh).

const A = (id: string) => `/audio/lessons-v2/follow-the-message/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/follow-the-message/${w.toLowerCase()}.png`;

export const followTheMessageImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young white pelican with a peach colored beak standing tall and proud on a sandy cove beach at early morning, next to an older larger pelican with gray flecked feathers and a worn beak, a wide calm blue bay stretching behind them to a faint hazy green shoreline far away on the horizon, a few gentle waves, soft golden light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same older pelican with gray flecked feathers flying strongly in front over open choppy blue water with white foamy wave tops, the same young white pelican with a peach colored beak flying right behind him close to his wingtip, both birds with wide wings spread, wind streaks in the air, early morning sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "A long line of white pelicans flying one behind another in a single line over blue water toward a green sandy shore, the same young white pelican with a peach colored beak at the front of the line, a much smaller fluffy young pelican with short stubby wings flying right behind her, the rest of the line trailing back across the sky, bright morning sun high in a clear sky with no face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces on the sun, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-badger-den": "A cartoon badger with a black and white striped face standing sadly in the rain beside a collapsed hole in loose pale sand, the sandy walls caved in and washed flat, gray rain clouds overhead, a hillside of hard brown clay in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-marmot-whistle": "A round brown marmot standing up on its hind legs on a rocky alpine meadow with a mouthful of green grass, the dark shadow of a large hawk sweeping across the grass beside it, a burrow hole in the rocks nearby, mountains in the distance. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-sandpiper-nest": "A small brown and white sandpiper bird standing beside a shallow nest scooped in smooth wet sand very close to the ocean waves, a foamy wave sliding up toward the nest, tall dune grass on a higher sandy hill in the background, a gray gull standing on the dune. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const followTheMessage: LessonDef = {
  id: "follow-the-message",
  title: "Follow the Message",
  grade: "3rd Grade",
  standard: "RL.3.2",
  archetype: "story-elements",
  objective: "I can recount a tale in order, name the message it teaches, and explain how the details show that message.",
  concepts: [
    "recount: the events in order with key details",
    "the message is shown, never printed",
    "a choice, what came of it, what changed",
    "which details carry the message",
    "a detail that shows a character changed",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You recounted Why the Pelicans Fly in a Line, you named the message it teaches, and you followed the details that carry it: what Juno chose, what happened because of it, and what she did differently at the end. That is the whole third grade job with a tale, and you did every part of it.",
    "title": "You Followed the Message!",
    "body": "You recounted a tale in order, named its message, and explained how the details show it."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Why the Pelicans Fly in a Line, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Long ago, people told tales to explain the world, and they tucked a lesson inside each one. Today you will read a tale like that, and you will do three jobs with it: recount it in order, name the message it teaches, and show how the story proves it. Here is page one of Why the Pelicans Fly in a Line. Read along with me." },
      interaction: { type: "read-along", text: "Long ago, when the world was still new, every pelican flew alone, and each one crossed the wide bay on its own tired wings. A young pelican named Juno was the fastest flier in the cove, and she liked everyone to know it. Hollis, the oldest pelican on the beach, warned her that the far shore was a whole morning away and that the wind over the open water pushed back hard.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-recount-page-1",
      purpose: "model",
      gate: "none",
      prompt: "A recount is the story again, in order, with the key details.",
      fx: {"text":"Recount: **in order**, with the **key details**","effect":"underline"},
      narration: { audio: A("model-recount-page-1"), script: "Job one is the recount. A recount is the story told again, in order, with the key details and nothing extra. Watch me recount page one. First, long ago, every pelican flew alone. Next, Juno was the fastest flier in the cove, and she liked everyone to know it. Then Hollis warned her that the far shore was a whole morning away and the wind pushed back hard. Three events, in order, and I kept the details that matter: alone, fastest, the warning. I left out the wide bay and the beach, because the story would be the same without them." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Juno laughed and flapped off across the bay by herself, because she was sure that fast wings needed no help. Halfway across, the wind shoved against her chest until every stroke felt like lifting a stone, and she turned back with her wings aching. That evening she landed on the sand exhausted, too worn out to even scold the wind.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and notice what Juno chooses to do, because a message always starts with a choice." },
      interaction: { type: "speak", text: "Juno laughed and flapped off across the bay by herself because she was sure that fast wings needed no help Halfway across the wind shoved against her chest until every stroke felt like lifting a stone and she turned back with her wings aching That evening she landed on the sand exhausted too worn out to even scold the wind" },
    },
    {
      id: "guided-choose-why-turned-back",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why did Juno turn back?",
      narration: { audio: A("guided-choose-why-turned-back"), script: "Here is a key detail you will need later. Juno chose to cross the bay alone, and something happened because of that choice. Why did Juno turn back? Tap the reason the story gives." },
      interaction: { type: "choose", options: [{ id: "the-wind-shoved-against-her", label: "the wind shoved against her" }, { id: "hollis-called-her-home", label: "hollis called her home" }, { id: "she-lost-sight-of-the-shore", label: "she lost sight of the shore" }, { id: "her-wings-were-too-small", label: "her wings were too small" }], correctId: "the-wind-shoved-against-her", coachWrong: "The story does not say that. Read the second sentence of page two again. What happened halfway across?" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch what Hollis does.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "On page three, Hollis does something instead of just warning. Read along with me." },
      interaction: { type: "read-along", text: "At dawn, Hollis nudged her awake with his beak and said, \"Fly behind me this time, and stay close to my wingtip.\" Juno frowned, but she tucked in behind him, and the air behind his wings felt smooth, as if a door had opened in the wind. When Hollis began to tire, he slid back and called, \"Your turn at the point,\" so Juno pulled ahead into the wind while he rested behind her.", audio: A("page-3-read-sentence") },
    },
    {
      id: "model-follow-the-details",
      purpose: "model",
      gate: "none",
      prompt: "The message is shown, never printed. Follow the details to it.",
      fx: {"text":"A **choice**, what **came of it**, what **changed**","effect":"pop-words"},
      narration: { audio: A("model-follow-the-details"), script: "Job two is the message, the lesson the tale teaches. This tale never prints its lesson, so a third grade reader follows the details to it. Watch how I trace it. I start with a choice. Juno chose to cross alone, sure that fast wings needed no help. Then I look at what came of that choice. The wind shoved her back, and she landed exhausted. Then I look for what changed. Hollis said, fly behind me, and when he tired, he slid back and gave her the point. A choice, what came of it, what changed. I can feel the message taking shape, but I do not name it yet, because a message needs the ending. Keep reading." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: One by one, the other pelicans joined the line, each taking a turn at the front and then dropping back to rest. The line climbed over the foaming whitecaps, and by midmorning their feet touched the far shore for the first time. Juno looked back down the long line, and not one bird in it was worn out.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and watch what every pelican in the line does." },
      interaction: { type: "speak", text: "One by one the other pelicans joined the line each taking a turn at the front and then dropping back to rest The line climbed over the foaming whitecaps and by midmorning their feet touched the far shore for the first time Juno looked back down the long line and not one bird in it was worn out" },
    },
    {
      id: "guided-choose-after-the-front",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did each pelican do after its turn at the front?",
      narration: { audio: A("guided-choose-after-the-front"), script: "One more key detail. On page four, every pelican took a turn at the front of the line. What did each pelican do after its turn at the front? Tap what the story says." },
      interaction: { type: "choose", options: [{ id: "dropped-back-to-rest", label: "dropped back to rest" }, { id: "landed-on-the-water", label: "landed on the water" }, { id: "flew-home-alone", label: "flew home alone" }, { id: "flew-twice-as-fast", label: "flew twice as fast" }], correctId: "dropped-back-to-rest", coachWrong: "Look at the first sentence of page four. After a turn at the front, where did each bird go?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and listen for what Juno says now." },
      interaction: { type: "read-along", text: "The next morning, a young pelican with wobbly wings hopped up beside Juno and begged to cross the bay by himself. \"Tuck in behind me,\" Juno said, \"and when I get tired, you will take the point.\" That is why, to this day, pelicans cross the water in a long line, and the bird at the front never stays there for long.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-sequence-recount",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Recount the tale. Put the events in order.",
      narration: { audio: A("apply-sequence-recount"), script: "Now you recount the whole tale. Here are five events from the story, mixed up. Put them in the order they happened, from the first page to the last." },
      interaction: { type: "sequence", items: [{ id: "flies-off-alone", label: "juno flies off alone" }, { id: "wind-turns-her-back", label: "the wind turns her back" }, { id: "tucks-in-behind-hollis", label: "she tucks in behind hollis" }, { id: "line-reaches-shore", label: "the line reaches the shore" }, { id: "leads-young-pelican", label: "juno leads a young pelican" }], order: ["flies-off-alone","wind-turns-her-back","tucks-in-behind-hollis","line-reaches-shore","leads-young-pelican"], coachWrong: "Start at page two, with what Juno chose to do first. Then ask what happened because of it, and keep going page by page." },
    },
    {
      id: "guided-choose-message",
      purpose: "guided",
      gate: "interaction",
      prompt: "What message does the tale teach?",
      narration: { audio: A("guided-choose-message"), script: "Now name the message. Remember, it is not printed anywhere, so check it against the details. Juno's choice, what came of it, what the line did, and what Juno said at the end all point the same way. One of the choices on your screen sounds wise, but no detail in the story backs it. Tap the message the details support." },
      interaction: { type: "choose", options: [{ id: "we-go-farther-taking-turns", label: "we go farther taking turns" }, { id: "the-strongest-should-lead", label: "the strongest should lead" }, { id: "never-fly-in-strong-wind", label: "never fly in strong wind" }, { id: "fast-wings-need-no-help", label: "fast wings need no help" }], correctId: "we-go-farther-taking-turns", coachWrong: "Test it against the details. Did Hollis stay at the front? Did the line stop for the wind? Find the idea that every page supports." },
    },
    {
      id: "apply-choose-detail-shows-message",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which detail shows the message? Tap it.",
      narration: { audio: A("apply-choose-detail-shows-message"), script: "Job three is the how. A message is carried by details, so a third grade reader can point to one. Here are four details from the story, and every one of them is real. Only one of them shows the message you just named. Tap that detail." },
      interaction: { type: "choose", options: [{ id: "taking-a-turn-at-the-front", label: "taking a turn at the front" }, { id: "fastest-flier-in-the-cove", label: "fastest flier in the cove" }, { id: "pushed-back-hard", label: "pushed back hard" }, { id: "landed-on-the-sand-exhausted", label: "landed on the sand exhausted" }], correctId: "taking-a-turn-at-the-front", coachWrong: "That detail is in the story, but it tells about the bay or about Juno at the start. Which detail shows the pelicans doing what the message says?" },
    },
    {
      id: "apply-choose-detail-juno-changed",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which detail shows that Juno changed?",
      narration: { audio: A("apply-choose-detail-juno-changed"), script: "A tale often shows its message through a character who changes. At the start, Juno flew off alone and liked everyone to know she was fastest. Which detail shows that Juno changed? All four are real lines from the story. Tap the one that shows the new Juno." },
      interaction: { type: "choose", options: [{ id: "you-will-take-the-point", label: "you will take the point" }, { id: "flapped-off-across-the-bay", label: "flapped off across the bay" }, { id: "liked-everyone-to-know-it", label: "liked everyone to know it" }, { id: "hopped-up-beside-juno", label: "hopped up beside juno" }], correctId: "you-will-take-the-point", coachWrong: "That line shows the old Juno, or someone else. Look at page five. What does Juno offer the young pelican?" },
    },
    {
      id: "apply-sort-shows-or-detail",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Shows the Message, or Just a Detail?",
      narration: { audio: A("apply-sort-shows-or-detail"), script: "Here are six details from the tale. Some of them carry the message: a choice, what came of it, or what changed. Others are just details, like where the story happens or who is oldest, and the message would be the same without them. Read each one. Drag it to Shows the Message or to Just a Detail." },
      interaction: { type: "sort", buckets: ["Shows the Message","Just a Detail"], items: [{ label: "hollis slides back to rest", bucket: "Shows the Message" }, { label: "the bay is wide", bucket: "Just a Detail" }, { label: "each takes a turn in front", bucket: "Shows the Message" }, { label: "hollis is the oldest pelican", bucket: "Just a Detail" }, { label: "alone, juno has to turn back", bucket: "Shows the Message" }, { label: "the shore is a morning away", bucket: "Just a Detail" }], coachWrong: "Ask, would the message change if this detail were gone? If the story could not teach its lesson without it, it shows the message." },
    },
    {
      id: "challenge-speak-message-and-detail",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the message, then one detail that shows it.",
      narration: { audio: A("challenge-speak-message-and-detail"), script: "Last one, and you do it out loud. Tap the mic. Say the message of Why the Pelicans Fly in a Line in your own words, then say one detail from the story that shows it. Start with, the tale teaches." },
      interaction: { type: "speak", text: "turns turn taking together behind front point rest rested resting line farther tired alone wind help lead leads led each everyone shore share teamwork" },
    },
    {
      id: "celebrate-follow-the-message",
      purpose: "celebrate",
      gate: "none",
      prompt: "Recount it, name the message, show how.",
      fx: {"text":"Recount it, **name the message**, **show how**","effect":"fireworks"},
      narration: { audio: A("celebrate-follow-the-message"), script: "Today you did all three jobs with a tale. You recounted it in order with its key details. You named the message even though the story never printed it. And you showed how the details carry it: a choice, what came of it, and what changed. The next tale you read will hide its lesson the same way, and now you know how to follow it." },
    },
  ],
};
