import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./maps-and-photos-timings.json";

// Maps and Photos (RI.3.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=maps-and-photos
// G3-U3. TWO SOURCES, ONE UNDERSTANDING tier of RI.3.7 (sibling split:
// pictures-that-teach RI.2.7 pulley + diagram-detectives RI.2.7 ladybug own
// G2 pictures that clarify the words, picture-or-words RI.1.7 octopus owns
// which teacher taught a fact, search-like-a-pro RI.3.5 owns locating with
// features, what-the-picture-adds RL.3.7 owns mood and emphasis in STORIES).
// THIS lesson owns the where / when / why / how frame on a real EVENT in a
// FACT text: a MAP tells where and how far, a PHOTO tells what a moment
// really looked like (how big, what color, what was under it) and sometimes
// when, the WORDS tell why and how, and a question about the event is
// answered by putting a picture fact and a word fact together, saying which
// source gave each part. ONE original informational text, "The House That
// Moved Up the Hill" (a whole wooden house moved from a river bend to a
// hilltop lot; every process fact true: the ground dug out around the house,
// long steel beams slid under the floor, jacks lifting a few inches at a
// time, wheels rolled under the beams, a truck at walking speed because a
// house that rocks can crack, power lines raised by a worker in a bucket
// lift, a new foundation poured weeks ahead, the house lowered onto it),
// 15 sentences over 5 child-read pages (read-along 1/3/5 with the map and two
// photos, speak 2/4 imageless), compound + early-complex sentences, one
// quoted line with a speech tag, no digits, stretch words foundation / beams /
// jacks / crept / beneath with in-text support. FOUR pictures planned on
// purpose: map-town = WHERE and HOW FAR (the house sits at the river's sharp
// bend, one road climbs from the bend to the hilltop lot; the words never say
// bend or distance), photo-lifted = WHAT IT LOOKED LIKE (daylight under the
// floor, the old foundation is gray stone, which the words never say),
// photo-rolling = HOW BIG (the house towers over the truck), photo-new-lot =
// WHEN (an orange evening sky; the words say only that the trip took most of
// the day). The words never say the house is yellow, so color is a picture
// fact for the sort. Speak texts avoid the token " my ".
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Fenwick,
// Sable River, Okafor, Hargrove, Orchard Hill, River Street, water tower,
// house mover, bucket lift, walking speed, moving day, power line, empty lot
// all 0 hits; lighthouse, island, ferry, erosion-as-word, riverbank found
// carried and avoided. Keys prefixed quiz- are fresh stimuli for the quiz
// (Corliss, the Tolby River, Front Street, sandbags, crest, Whitaker, Vivian:
// all 0 hits).

const A = (id: string) => `/audio/lessons-v2/maps-and-photos/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/maps-and-photos/${w.toLowerCase()}.png`;

export const mapsAndPhotosImages: Record<string, string | { subject: string; ref?: string }> = {
  "map-town": "A simple bird's-eye view picture map of a small town drawn for children: a wide blue river runs along the bottom of the picture and makes one sharp bend in the middle, a small two-story yellow wooden house with a white front porch sits right at the tip of that sharp bend, one single gray road starts at the yellow house and runs straight up a big green hill to the top of the picture, a red brick school with a small playground sits halfway up the road on the left side, a tall silver water tower on thin legs stands near the top of the road on the right side, an empty flat rectangle of bare green lawn sits at the very top of the road across from the water tower, a dotted white line runs along the road from the yellow house up to the empty lawn, a few small houses and round green trees scattered on the hill, everything seen from directly above. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, flat pale background, no letters, no words, no numbers, no labels, no compass, no arrows, no signs, no writing anywhere.",
  "photo-lifted": "A realistic scene like a photograph in bright 2D cartoon style, seen from the side at ground level: a tall two-story yellow wooden house with a white front porch lifted high into the air, resting on two very long gray steel beams that run under its floor, with orange jacks under the beams, open daylight visible under the whole house, a low broken wall of old gray stone blocks where the house used to sit, a ring of dug-out brown dirt around it, four workers in orange vests and white hard hats standing back with their hands on their hips looking up at it, a blue river close behind the house, bright midday sun with short shadows, clear sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "photo-rolling": { subject: "The same tall two-story yellow wooden house with a white front porch sitting on long gray steel beams and sets of black wheels, being pulled slowly up a town street by one white truck in front of it, the house far taller and far wider than the truck, filling the whole street from curb to curb, a worker in a raised bucket lift beside the road holding a black power line up high so the roof can pass under it, workers in orange vests and white hard hats walking beside the house, a crowd of townspeople watching from both sidewalks, a red brick school in the background, bright daytime, clear sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "photo-lifted" },
  "photo-new-lot": { subject: "The same tall two-story yellow wooden house with a white front porch now resting on a new low gray stone foundation on a flat green lawn at the top of a hill, a tall silver water tower on thin legs across the road, three workers in orange vests and white hard hats loading tools into a white truck beside the house, the sky glowing orange and pink with the sun setting low near the horizon, the rooftops of a small town and a blue river far below in the distance. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "photo-rolling" },
  "quiz-map-corliss": "A simple bird's-eye view picture map of a small river town drawn for children: a wide brown river runs along the entire bottom edge of the picture, one gray street runs right beside the river with a row of small houses along it, two more gray streets with houses climb up a gentle green hill above it, a red brick fire station with two big red garage doors sits alone at the top of the hill, a long row of tan sandbags runs along the river side of the lowest street, round green trees scattered between the houses, everything seen from directly above. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, flat pale background, no letters, no words, no numbers, no labels, no compass, no arrows, no signs, no writing anywhere.",
  "quiz-photo-line": "A realistic scene like a photograph in bright 2D cartoon style: a long line of adults and teenagers in yellow and blue raincoats and rubber boots standing in a row down a wet gray street, passing tan cloth sandbags from hand to hand toward a rising muddy brown river at the far end of the street, a heap of sand and a pile of filled sandbags beside a red brick fire station with red garage doors at the near end, gray overcast sky, puddles on the pavement, no rain falling. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-photo-wall": { subject: "A realistic scene like a photograph in bright 2D cartoon style, seen from the side: a finished wall of tan cloth sandbags stacked in overlapping rows like bricks along the edge of a street, a clear plastic sheet stretched over the river side of the wall, muddy brown floodwater pressing against the plastic side of the wall, the street and the small houses on the other side completely dry, two adults in yellow raincoats standing right beside the wall with the top of the wall reaching their waists, gray overcast sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-photo-line" }
};

export const mapsAndPhotos: LessonDef = {
  id: "maps-and-photos",
  title: "Maps and Photos",
  grade: "3rd Grade",
  standard: "RI.3.7",
  archetype: "inference",
  objective: "I can use a map, a photo, and the words of a fact book together to tell where, when, why, and how something happened.",
  concepts: [
    "a map tells where and how far",
    "a photo tells what it really looked like, and sometimes when",
    "the words tell why and how",
    "put a picture fact and a word fact together to understand an event",
    "say which source gave each part of your answer",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The House That Moved Up the Hill and used every part of the page. The map for where and how far, the photos for what it looked like and when, the words for why and how, and both together when one source was not enough.",
    "title": "Maps, Photos, and Words",
    "body": "You read a map for where, photos for what it looked like, and words for why and how, then put them together."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The House That Moved Up the Hill, page one. Read along!",
      image: IMG("map-town"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In a third grade fact book, the pictures are not there to look nice. Each one has a job the words cannot do. A map tells you where a thing is and how far it is from something else. A photo shows you what a moment really looked like, and sometimes when it happened. The words tell you why and how. Here is page one of a fact book called The House That Moved Up the Hill, with its map beside it. Read along with me, and then look hard at the map." },
      interaction: { type: "read-along", text: "For almost a hundred years, a tall wooden house stood at the bottom of the town of Fenwick, beside the Sable River. Every spring the river ran high and fast, and every spring it carried away a little more of the ground under the porch. By the time Mrs. Okafor bought the house, the front steps hung out over the water.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-map-and-words",
      purpose: "model",
      gate: "none",
      prompt: "Where from the map. Why from the words. Understanding from both.",
      image: IMG("map-town"),
      narration: { audio: A("model-map-and-words"), script: "Here is how I put the words and the map together. The words say the house stood beside the river, and that every spring the river carried away the ground under the porch. That is the why, and a map cannot tell me why. Now the map. Look at the river. It makes one sharp bend, and the house sits right at that bend, where the water swings hardest against the ground. The words never said that. Only the map tells me where. Now I put the two together. The river takes ground every spring, and this house sits right where the river bends. So now I understand why this house, and not the school up the hill, was in trouble. Where from the map. Why from the words. Understanding from both." },
    },
    {
      id: "guided-choose-which-source",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which source tells you how far the house traveled?",
      narration: { audio: A("guided-choose-which-source"), script: "Your turn. Think about how far the house had to travel to reach its new lot. One source in this book can tell you that, and the others cannot. Four sources are on your screen. Tap the one that tells you how far." },
      interaction: { type: "choose", options: [{ id: "the-map", label: "the map" }, { id: "the-words", label: "the words" }, { id: "the-title", label: "the title" }, { id: "a-photo", label: "a photo" }], correctId: "the-map", coachWrong: "Check that source. Does it show or tell the distance from the old spot to the new one? Only one source in this book does." },
    },
    {
      id: "guided-choose-how-far",
      purpose: "guided",
      gate: "interaction",
      prompt: "How far did the house travel? Use the map.",
      image: IMG("map-town"),
      narration: { audio: A("guided-choose-how-far"), script: "Now read it off the map. Find the house, find the empty lot, and follow the road between them. Four answers are on your screen. Tap the one the map shows." },
      interaction: { type: "choose", options: [{ id: "from-the-bend-to-the-hilltop", label: "from the bend to the hilltop" }, { id: "just-across-the-river", label: "just across the river" }, { id: "to-the-town-next-door", label: "to the town next door" }, { id: "around-one-short-block", label: "around one short block" }], correctId: "from-the-bend-to-the-hilltop", coachWrong: "Follow the road with your finger. Where does it start, and where does it end?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Mrs. Okafor did not want to lose the house, so she hired a crew that moves whole buildings for a living. The town sold her an empty lot at the top of Orchard Hill, and weeks before the move, workers poured a new foundation there, a strong stone base for the house to rest on.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, and it has no picture. Read both sentences out loud, and notice that these words tell you what got ready before the move." },
      interaction: { type: "speak", text: "Mrs Okafor did not want to lose the house so she hired a crew that moves whole buildings for a living The town sold her an empty lot at the top of Orchard Hill and weeks before the move workers poured a new foundation there a strong stone base for the house to rest on" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three, with a photo. Read along, then look.",
      image: IMG("photo-lifted"),
      narration: { audio: A("page-3-read"), script: "Page three has a photo beside it. Read along with me, and when you finish, look closely at what the photo shows." },
      interaction: { type: "read-along", text: "On moving day, the crew dug out the dirt all the way around the house and slid long steel beams underneath the floor. Then heavy jacks pushed up on the beams a few inches at a time, until the whole house hung in the air above its old foundation. \"A house is only heavy until you lift it right,\" said Mr. Hargrove, the man in charge of the crew.", audio: A("page-3-read-sentence") },
    },
    {
      id: "model-photo-looked-like",
      purpose: "model",
      gate: "none",
      prompt: "A photo shows what it really looked like, and sometimes when.",
      image: IMG("photo-lifted"),
      narration: { audio: A("model-photo-looked-like"), script: "Here is what a photo does that words cannot. The words on page three say the whole house hung in the air. I can read that, but I cannot picture it until I see it. The photo shows what that moment really looked like. Daylight under the whole floor. Two long beams holding up an entire house. Workers standing back with their hands on their hips, tiny beside it. A photo can hint at when, too. The sky is bright blue and the light is strong, so this happened in full daylight, not at night. What it looked like, and sometimes when. That is the photo's job." },
    },
    {
      id: "guided-choose-photo-adds",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does the photo show that the words never say?",
      image: IMG("photo-lifted"),
      narration: { audio: A("guided-choose-photo-adds"), script: "Now you read the photo. Four things are on your screen, and all four are really in the photo. Three of them are in the words of page three too. Only one is something the photo shows and the words never say. Tap that one." },
      interaction: { type: "choose", options: [{ id: "the-old-foundation-is-stone", label: "the old foundation is stone" }, { id: "beams-run-under-the-floor", label: "beams run under the floor" }, { id: "the-house-hangs-in-the-air", label: "the house hangs in the air" }, { id: "dirt-is-dug-out-all-around", label: "dirt is dug out all around" }], correctId: "the-old-foundation-is-stone", coachWrong: "Page three already says that in words. Find the thing you could only know by looking at the photo." },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Next the crew rolled sets of wheels under the beams and hooked the front of the house to a truck. The truck crept up River Street at walking speed, because a house that rocks can crack. A worker in a bucket lift raised each power line so the roof could pass beneath it.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud. These words tell you how the house moved, step by step, which is the job that words do best." },
      interaction: { type: "speak", text: "Next the crew rolled sets of wheels under the beams and hooked the front of the house to a truck The truck crept up River Street at walking speed because a house that rocks can crack A worker in a bucket lift raised each power line so the roof could pass beneath it" },
    },
    {
      id: "apply-choose-scale",
      purpose: "apply",
      gate: "interaction",
      prompt: "How big is the house next to the truck? Use the photo.",
      image: IMG("photo-rolling"),
      narration: { audio: A("apply-choose-scale"), script: "Here is a photo from the middle of the move. The words tell you that a truck pulled the house, but they never say how big the house is. Only a photo can show size. Look at the house, and look at the truck in front of it. Four answers are on your screen. Tap the one the photo shows." },
      interaction: { type: "choose", options: [{ id: "much-taller-than-the-truck", label: "much taller than the truck" }, { id: "about-as-tall-as-the-truck", label: "about as tall as the truck" }, { id: "a-little-shorter-than-it", label: "a little shorter than it" }, { id: "half-as-tall-as-the-truck", label: "half as tall as the truck" }], correctId: "much-taller-than-the-truck", coachWrong: "Look again. Put the top of the truck next to the top of the house. Which one is higher, and by how much?" },
    },
    {
      id: "apply-sort-picture-or-words",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: The Picture Tells, or The Words Tell?",
      narration: { audio: A("apply-sort-picture-or-words"), script: "Here are six facts from this book. Some of them you learned from the map or a photo. Some of them you learned from the words. Read each fact and ask where it came from. Drag each one to The Picture Tells, or to The Words Tell." },
      interaction: { type: "sort", buckets: ["The Picture Tells","The Words Tell"], items: [{ label: "the house is painted yellow", bucket: "The Picture Tells" }, { label: "the river ran high in spring", bucket: "The Words Tell" }, { label: "the school sits halfway up", bucket: "The Picture Tells" }, { label: "it rose inches at a time", bucket: "The Words Tell" }, { label: "it is taller than the truck", bucket: "The Picture Tells" }, { label: "the truck crept slowly", bucket: "The Words Tell" }], coachWrong: "Ask where that fact came from. Could you see it on the map or in a photo, or did you have to read it in the words?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("photo-new-lot"),
      narration: { audio: A("page-5-read"), script: "Here is the last page, with its photo. Read along with me, and keep one eye on the sky in the picture." },
      interaction: { type: "read-along", text: "Half the town lined the sidewalks to watch the house roll past the school and the water tower. The trip took most of the day, and by the time the crew lowered the house onto its new foundation, most of the crowd had gone home. The next morning, Mrs. Okafor drank her tea on the porch and looked down at the river, far below.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-when",
      purpose: "apply",
      gate: "interaction",
      prompt: "When did the house reach the hill? Use the photo and the words.",
      image: IMG("photo-new-lot"),
      narration: { audio: A("apply-choose-when"), script: "The words on page five never name the time of day, and a photo alone cannot tell you everything either. But the two together can. Look at the sky in the photo, and remember what the words said about how long the trip took. Four times are on your screen. Tap the one that fits both the photo and the words." },
      interaction: { type: "choose", options: [{ id: "near-sunset", label: "near sunset" }, { id: "at-sunrise", label: "at sunrise" }, { id: "at-noon", label: "at noon" }, { id: "in-the-middle-of-the-night", label: "in the middle of the night" }], correctId: "near-sunset", coachWrong: "Look at the color of the sky, and think about how long the words said the trip took. Which time fits both?" },
    },
    {
      id: "apply-choose-combine-why",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why will the river never reach the house again?",
      image: IMG("map-town"),
      narration: { audio: A("apply-choose-combine-why"), script: "One more question that takes two sources. Why will the river never reach the house again? The words tell you what the river does every spring. The map shows you where the house is now. Put them together. Four answers are on your screen. Tap the one that the map and the words make true." },
      interaction: { type: "choose", options: [{ id: "it-now-sits-high-on-the-hill", label: "it now sits high on the hill" }, { id: "the-river-dried-up-for-good", label: "the river dried up for good" }, { id: "the-crew-built-a-stone-wall", label: "the crew built a stone wall" }, { id: "the-truck-blocks-the-water", label: "the truck blocks the water" }], correctId: "it-now-sits-high-on-the-hill", coachWrong: "Check that answer against both sources. Does the map show it? Do the words say it? Only one answer passes both checks." },
    },
    {
      id: "challenge-speak-how",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How did the crew move the house? Say how, then say which source gave you each part.",
      narration: { audio: A("challenge-speak-how"), script: "Last one, out loud. Tap the mic. Tell me how the crew got the house from the river to the top of the hill. Then tell me which part of your answer came from the words, and which part you could see in a photo or on the map." },
      interaction: { type: "speak", text: "beams jacks wheels truck lifted lift lifting rolled rolling pulled pulling slow slowly walking street hill crept dug dirt inches foundation power lines raised bucket map photo picture words page" },
    },
    {
      id: "celebrate-two-sources",
      purpose: "celebrate",
      gate: "none",
      prompt: "Where from the map. What it looked like from the photo. Why and how from the words.",
      fx: {"text":"Put the **pictures** and the **words** together","effect":"fireworks"},
      narration: { audio: A("celebrate-two-sources"), script: "Today you read a fact book the way a third grader should. The map told you where the house sat and how far it had to go. The photos showed you what the move really looked like, how big the house was next to the truck, and when the day ended. The words told you why the house had to move and how the crew did it. And when a question needed two sources, you put them together. From now on, every map and every photo in a fact book has a job, and you know how to read it." },
    },
  ],
};
