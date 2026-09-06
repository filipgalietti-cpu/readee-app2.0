import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Maps and Photos QUIZ (RI.3.7) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge: what the
// map or the photo shows, 3 options w/ picture support) / core(on-grade G3:
// which source, where from the map, what the photo adds, a Picture Tells /
// Words Tell sort, the combine question, a production speak) / harder(G4
// transfer RI.4.7: a TIMELINE and a CHART described in words, read together
// with the text, TAUGHT in h-1 and h-3 first, then applied, closing with a
// production speak). ALL-FRESH second event text, "The Sandbag Wall" (the
// river town of Corliss on the Tolby River builds a sandbag wall along Front
// Street when heavy rain upstream makes the river rise; every process fact
// true: bags filled only halfway so they settle, passed hand to hand, rows
// laid across the seams like bricks, every bag stomped flat, a plastic sheet
// over the river side because the bags hold the plastic and the plastic stops
// the water, the river crests a few days after the rain), spoken page by page
// INSIDE the questions with its own three generated pictures (quiz-map-corliss,
// quiz-photo-line, quiz-photo-wall), so every Q is self-contained; nothing
// from the lesson text (Fenwick, Okafor, the moved house) is reused. Names +
// setting grep-swept vs lessons-v2 + quizzes-v2: Corliss, Tolby, Front Street,
// sandbag, Whitaker, crest, seep-as-taught, fire station all 0 hits. Quiz
// support images live in the lesson's image dir (quiz- keys). No digits in
// any on-screen copy; the timeline and chart are number words in narration.

const Q = "/audio/quizzes-v2/maps-and-photos-quiz";
const IMG = (w: string) => `/images/lessons-v2/maps-and-photos/${w.toLowerCase()}.png`;

export const mapsAndPhotosQuiz: QuizDef = {
  id: "maps-and-photos-quiz",
  lessonId: "maps-and-photos",
  title: "Maps and Photos Quiz",
  standard: "RI.3.7",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-map-fire-station",
      band: "easier",
      difficulty: 1,
      prompt: "Where is the fire station? Use the map.",
      image: IMG("quiz-map-corliss"),
      narration: { audio: `${Q}/e-1-map-fire-station.mp3`, script: "Here is page one of a new fact book called The Sandbag Wall, with its map. Every few years, heavy spring rain far upstream makes the Tolby River rise over its banks at the little town of Corliss. The lowest street, Front Street, runs right beside the river, and its houses sit only a few feet above the water. So when the river begins to climb, the whole town builds a wall of sandbags. Now look at the map. Find the red fire station. Tap where it is." },
      hint: { audio: `${Q}/e-1-map-fire-station-hint.mp3`, script: "The fire station is the red building with two big garage doors. Is it near the river at the bottom, or somewhere else?" },
      explain: { audio: `${Q}/e-1-map-fire-station-explain.mp3`, script: "The answer is at the top of the hill. The map shows the red fire station standing alone at the very top, far above the river." },
      interaction: { type: "choose", options: [{ id: "at-the-top-of-the-hill", label: "at the top of the hill" }, { id: "right-beside-the-river", label: "right beside the river" }, { id: "in-the-middle-of-the-hill", label: "in the middle of the hill" }], correctId: "at-the-top-of-the-hill", coachWrong: "Find the red building with the two garage doors on the map, and look at where it sits." },
    },
    {
      id: "e-2-photo-people-doing",
      band: "easier",
      difficulty: 2,
      prompt: "What are the people in the photo doing?",
      image: IMG("quiz-photo-line"),
      narration: { audio: `${Q}/e-2-photo-people-doing.mp3`, script: "Page two. A sandbag is a cloth sack filled only halfway with sand, so it stays soft and settles against the bags beside it. Volunteers fill the bags at the fire station, and a long line of people passes them hand to hand down to Front Street. Here is the photo that goes with page two. Look at the line of people. Tap what they are doing." },
      hint: { audio: `${Q}/e-2-photo-people-doing-hint.mp3`, script: "Look at the hands in the photo. Each person is holding something and handing it to the next person." },
      explain: { audio: `${Q}/e-2-photo-people-doing-explain.mp3`, script: "The answer is passing bags down a line. The photo shows a long line of people handing sandbags to each other toward the river." },
      interaction: { type: "choose", options: [{ id: "passing-bags-down-a-line", label: "passing bags down a line" }, { id: "digging-a-hole-for-sand", label: "digging a hole for sand" }, { id: "swimming-in-the-river", label: "swimming in the river" }], correctId: "passing-bags-down-a-line", coachWrong: "Look at what each person is holding, and where the line is pointed." },
    },
    {
      id: "e-3-photo-weather",
      band: "easier",
      difficulty: 3,
      prompt: "What does the photo show about the weather?",
      image: IMG("quiz-photo-line"),
      narration: { audio: `${Q}/e-3-photo-weather.mp3`, script: "Here is the same photo from The Sandbag Wall. The words on this page never say what the weather was like that day, but the photo can show you. Look at the sky, the ground, and what the people are wearing. Tap what the weather is like." },
      hint: { audio: `${Q}/e-3-photo-weather-hint.mp3`, script: "Look at the color of the sky and the puddles on the street. Then look at the coats and boots." },
      explain: { audio: `${Q}/e-3-photo-weather-explain.mp3`, script: "The answer is gray and wet. The sky is full of gray clouds, there are puddles on the street, and everyone wears a raincoat and boots." },
      interaction: { type: "choose", options: [{ id: "gray-and-wet", label: "gray and wet" }, { id: "sunny-and-hot", label: "sunny and hot" }, { id: "snowy-and-cold", label: "snowy and cold" }], correctId: "gray-and-wet", coachWrong: "Check the sky in the photo. Is it blue, white with snow, or gray with clouds?" },
    },
    {
      id: "e-4-why-river-rises",
      band: "easier",
      difficulty: 4,
      prompt: "Why does the river rise at Corliss?",
      narration: { audio: `${Q}/e-4-why-river-rises.mp3`, script: "Here are the words of page one again. Every few years, heavy spring rain far upstream makes the Tolby River rise over its banks at the little town of Corliss. A map cannot tell you why the river rises, but the words can. Tap why the river rises." },
      hint: { audio: `${Q}/e-4-why-river-rises-hint.mp3`, script: "Listen for the words right before the river rises. What happens far upstream?" },
      explain: { audio: `${Q}/e-4-why-river-rises-explain.mp3`, script: "The answer is heavy rain far upstream. The words say that heavy spring rain far upstream makes the river rise." },
      interaction: { type: "choose", options: [{ id: "heavy-rain-far-upstream", label: "heavy rain far upstream" }, { id: "a-dam-that-broke", label: "a dam that broke" }, { id: "big-boats-passing-by", label: "big boats passing by" }], correctId: "heavy-rain-far-upstream", coachWrong: "The words never mention that. Listen again for what happens far upstream in spring." },
    },
    {
      id: "c-1-which-source-raincoats",
      band: "core",
      difficulty: 1,
      prompt: "The people wear raincoats and boots. Which source tells you that?",
      image: IMG("quiz-photo-line"),
      narration: { audio: `${Q}/c-1-which-source-raincoats.mp3`, script: "Here are the words of page two, with its photo. A sandbag is a cloth sack filled only halfway with sand, so it stays soft and settles against the bags beside it. Volunteers fill the bags at the fire station, and a long line of people passes them hand to hand down to Front Street. Now think about this fact. The people wear raincoats and boots. Four sources are on your screen. Tap the one that gave you that fact." },
      hint: { audio: `${Q}/c-1-which-source-raincoats-hint.mp3`, script: "Did you hear the word raincoat anywhere in the words? If not, ask where you could see it." },
      explain: { audio: `${Q}/c-1-which-source-raincoats-explain.mp3`, script: "The answer is the photo. The words never mention raincoats or boots, and a map cannot show clothes. Only the photo shows what the people were wearing." },
      interaction: { type: "choose", options: [{ id: "the-photo", label: "the photo" }, { id: "the-words", label: "the words" }, { id: "the-map", label: "the map" }, { id: "the-title", label: "the title" }], correctId: "the-photo", coachWrong: "Check that source. Does it say or show what the people are wearing? Only one of them does." },
    },
    {
      id: "c-2-map-where-wall",
      band: "core",
      difficulty: 2,
      prompt: "Where does the sandbag wall run? Use the map.",
      image: IMG("quiz-map-corliss"),
      narration: { audio: `${Q}/c-2-map-where-wall.mp3`, script: "Here is the map of Corliss again. The words of page one say that the town builds a wall of sandbags, but they never say exactly where the wall goes or how long it is. The map does. Find the row of tan sandbags on the map, and follow it from one end to the other. Four answers are on your screen. Tap the one the map shows." },
      hint: { audio: `${Q}/c-2-map-where-wall-hint.mp3`, script: "The sandbags are the tan row. Which street is it next to, and does it run part of the way or the whole way?" },
      explain: { audio: `${Q}/c-2-map-where-wall-explain.mp3`, script: "The answer is the length of Front Street. The map shows the row of sandbags running along the river side of the lowest street, from one end to the other." },
      interaction: { type: "choose", options: [{ id: "the-length-of-front-street", label: "the length of Front Street" }, { id: "around-the-fire-station", label: "around the fire station" }, { id: "across-the-middle-street", label: "across the middle street" }, { id: "along-the-top-of-the-hill", label: "along the top of the hill" }], correctId: "the-length-of-front-street", coachWrong: "Find the tan row of sandbags on the map. Which street does it follow?" },
    },
    {
      id: "c-3-photo-adds",
      band: "core",
      difficulty: 3,
      prompt: "What does the photo show that the words never say?",
      image: IMG("quiz-photo-wall"),
      narration: { audio: `${Q}/c-3-photo-adds.mp3`, script: "Page three, with its photo. Each new row of bags is set across the seams of the row below, the way bricks are laid, and every bag is stomped flat. When the wall along Front Street is finished, a sheet of plastic is stretched over the river side, so that water cannot seep between the bags. Now read the photo. Four things are on your screen, and all four are really in the photo. Three of them are in the words too. Tap the one that only the photo shows." },
      hint: { audio: `${Q}/c-3-photo-adds-hint.mp3`, script: "Check each one against the words you just heard. The words never name a color." },
      explain: { audio: `${Q}/c-3-photo-adds-explain.mp3`, script: "The answer is the water is brown and muddy. The words tell about the plastic, the rows like bricks, and the wall along the street, but only the photo shows the color of the water." },
      interaction: { type: "choose", options: [{ id: "the-water-is-brown-and-muddy", label: "the water is brown and muddy" }, { id: "plastic-covers-one-side", label: "plastic covers one side" }, { id: "the-rows-overlap-like-bricks", label: "the rows overlap like bricks" }, { id: "the-wall-runs-along-a-street", label: "the wall runs along a street" }], correctId: "the-water-is-brown-and-muddy", coachWrong: "The words of page three already say that. Find the thing you could only know by looking." },
    },
    {
      id: "c-4-sort-picture-or-words",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: The Picture Tells, or The Words Tell?",
      narration: { audio: `${Q}/c-4-sort-picture-or-words.mp3`, script: "Here are six facts from The Sandbag Wall. Ask about each one. Is this something you could see on the map or in a photo, like a color, a size, or a place? Or is it something only the words could tell you, like how, why, or when? Drag each one to The Picture Tells, or to The Words Tell." },
      hint: { audio: `${Q}/c-4-sort-picture-or-words-hint.mp3`, script: "Ask if a camera or a map could show that fact. If it could, the picture tells it. If it takes a sentence to explain, the words tell it." },
      explain: { audio: `${Q}/c-4-sort-picture-or-words-explain.mp3`, script: "Here is the sorting. Raincoats, a waist high wall, and where the station sits can all be seen, so the picture tells them. A half full bag, a stomped bag, and when the river crests take words to explain, so the words tell them." },
      interaction: { type: "sort", buckets: ["The Picture Tells","The Words Tell"], bucketAudio: { "The Picture Tells": `${Q}/b-the-picture-tells.mp3`, "The Words Tell": `${Q}/b-the-words-tell.mp3` }, items: [{ label: "the people wear raincoats", bucket: "The Picture Tells" }, { label: "each bag is only half full", bucket: "The Words Tell" }, { label: "the wall is waist high", bucket: "The Picture Tells" }, { label: "every bag is stomped flat", bucket: "The Words Tell" }, { label: "the station is up the hill", bucket: "The Picture Tells" }, { label: "the river crests days later", bucket: "The Words Tell" }], coachWrong: "Ask if a camera or a map could show that one. If yes, the picture tells it. If it takes a sentence about how, why, or when, the words tell it." },
    },
    {
      id: "c-5-combine-how-far",
      band: "core",
      difficulty: 5,
      prompt: "How far do the bags travel? Use the words and the map.",
      image: IMG("quiz-map-corliss"),
      narration: { audio: `${Q}/c-5-combine-how-far.mp3`, script: "This one takes two sources. The words of page two say that volunteers fill the bags at the fire station, and a long line of people passes them hand to hand down to Front Street. The map shows where the fire station is and where Front Street is. Put the words and the map together. Four answers are on your screen. Tap how far the bags travel." },
      hint: { audio: `${Q}/c-5-combine-how-far-hint.mp3`, script: "The words name the two ends of the line. Find both of them on the map, and see how far apart they are." },
      explain: { audio: `${Q}/c-5-combine-how-far-explain.mp3`, script: "The answer is from the hill to the river. The words say the bags go from the fire station to Front Street, and the map shows the station at the top of the hill and Front Street down beside the river." },
      interaction: { type: "choose", options: [{ id: "from-the-hill-to-the-river", label: "from the hill to the river" }, { id: "from-one-house-to-the-next", label: "from one house to the next" }, { id: "across-the-river-by-boat", label: "across the river by boat" }, { id: "along-the-top-of-the-hill", label: "along the top of the hill" }], correctId: "from-the-hill-to-the-river", coachWrong: "Find the fire station and Front Street on the map. The words say the bags travel from one to the other." },
    },
    {
      id: "c-6-speak-why-plastic",
      band: "core",
      difficulty: 6,
      prompt: "Why does the wall need the plastic sheet? Say why, and say which source told you.",
      narration: { audio: `${Q}/c-6-speak-why-plastic.mp3`, script: "Now say it out loud. Listen to the end of page three. When the wall is finished, a sheet of plastic is stretched over the river side, so that water cannot seep between the bags. The bags do not stop the water, said Fire Chief Whitaker. The bags hold the plastic, and the plastic stops the water. Tap the mic. Say why the wall needs the plastic, and say which source told you, the words or a picture." },
      hint: { audio: `${Q}/c-6-speak-why-plastic-hint.mp3`, script: "Think about what would happen to the water between the bags with no plastic. Then say whether you learned that from the words or from a picture." },
      explain: { audio: `${Q}/c-6-speak-why-plastic-explain.mp3`, script: "Here is one way to say it. The wall needs the plastic because water would seep between the bags, and the plastic is what really stops the water. The words told me that, because a photo cannot explain why." },
      interaction: { type: "speak", text: "seep seeps leak leaks through between bags stop stops holds hold blocks plastic sheet words page chief said sentence river wet dry cover covers side water" },
    },
    {
      id: "h-1-timeline-crest",
      band: "harder",
      difficulty: 1,
      prompt: "On which day did the river reach its highest point? Use the timeline.",
      narration: { audio: `${Q}/h-1-timeline-crest.mp3`, script: "Here is a fourth grade tool. Some fact books add a timeline, a line of days with one fact on each day. This book has a timeline for one flood. Monday, heavy rain far upstream. Tuesday, the river reaches the bottom of Front Street. Wednesday, the wall is finished. Thursday, the river crests. Saturday, the river is back in its banks. A reader uses the timeline together with the words. The words say the town starts passing bags when the river begins to climb, and the timeline says the river reached Front Street on Tuesday, so the passing began on Tuesday. Now you try. The words say that when a river crests, it reaches its highest point. Four days are on your screen. Tap the day the river reached its highest point." },
      hint: { audio: `${Q}/h-1-timeline-crest-hint.mp3`, script: "The words told you what crest means. Now find the day on the timeline that uses that word." },
      explain: { audio: `${Q}/h-1-timeline-crest-explain.mp3`, script: "The answer is Thursday. The words say that crest means reaching the highest point, and the timeline says the river crests on Thursday." },
      interaction: { type: "choose", options: [{ id: "thursday", label: "Thursday" }, { id: "tuesday", label: "Tuesday" }, { id: "wednesday", label: "Wednesday" }, { id: "saturday", label: "Saturday" }], correctId: "thursday", coachWrong: "That day is on the timeline, but it is not the day the river crests. Remember what crest means, and find that day." },
    },
    {
      id: "h-2-timeline-plastic",
      band: "harder",
      difficulty: 2,
      prompt: "On which day did the plastic go on? Use the timeline and the words.",
      narration: { audio: `${Q}/h-2-timeline-plastic.mp3`, script: "Same timeline, one more time. Monday, heavy rain far upstream. Tuesday, the river reaches the bottom of Front Street. Wednesday, the wall is finished. Thursday, the river crests. Saturday, the river is back in its banks. Now the words. The words of page three say that the plastic sheet goes on as soon as the wall is finished. Put the words and the timeline together. Four days are on your screen. Tap the day the plastic went on." },
      hint: { audio: `${Q}/h-2-timeline-plastic-hint.mp3`, script: "The words tie the plastic to one event, the wall being finished. Find that event on the timeline." },
      explain: { audio: `${Q}/h-2-timeline-plastic-explain.mp3`, script: "The answer is Wednesday. The words say the plastic goes on when the wall is finished, and the timeline says the wall was finished on Wednesday." },
      interaction: { type: "choose", options: [{ id: "wednesday-plastic", label: "Wednesday" }, { id: "monday-plastic", label: "Monday" }, { id: "thursday-plastic", label: "Thursday" }, { id: "saturday-plastic", label: "Saturday" }], correctId: "wednesday-plastic", coachWrong: "The plastic goes on when the wall is finished. Which day on the timeline says the wall was finished?" },
    },
    {
      id: "h-3-chart-rows",
      band: "harder",
      difficulty: 3,
      prompt: "How many rows did the town need? Use the chart and the words.",
      narration: { audio: `${Q}/h-3-chart-rows.mp3`, script: "Another fourth grade tool is a chart. A chart lines up facts in rows so you can compare them. This book has a chart of wall heights. One row of bags stops a puddle. Three rows stop water up to your ankle. Six rows stop water up to your knee. Ten rows stop water up to your waist. Here is how I use the chart with the words. If the words said the river would reach my ankle, I would look down the chart for ankle, and I would need three rows. Now you try. The words of page one say that this spring, the river was expected to reach knee height on Front Street. Four answers are on your screen. Tap how many rows the town needed." },
      hint: { audio: `${Q}/h-3-chart-rows-hint.mp3`, script: "The words said the water would reach your knee. Find that height on the chart, and see how many rows go with it." },
      explain: { audio: `${Q}/h-3-chart-rows-explain.mp3`, script: "The answer is six rows. The words say the river would reach knee height, and the chart says six rows stop water up to your knee." },
      interaction: { type: "choose", options: [{ id: "six-rows", label: "six rows" }, { id: "one-row", label: "one row" }, { id: "three-rows", label: "three rows" }, { id: "ten-rows", label: "ten rows" }], correctId: "six-rows", coachWrong: "That number is on the chart, but it goes with a different height. The words said knee height. Find knee." },
    },
    {
      id: "h-4-speak-chart-and-photo",
      band: "harder",
      difficulty: 4,
      prompt: "How high a flood can this wall stop? Say which source gave each part.",
      image: IMG("quiz-photo-wall"),
      narration: { audio: `${Q}/h-4-speak-chart-and-photo.mp3`, script: "Last one, out loud, with the chart and a photo. The chart says one row stops a puddle, three rows stop water up to your ankle, six rows stop water up to your knee, and ten rows stop water up to your waist. The words say the town always builds higher than the chart asks, to be safe. Here is the photo of the finished wall, with two people standing beside it. Tap the mic. Say how high a flood this wall can stop, and say which part of your answer came from the photo and which part came from the chart." },
      hint: { audio: `${Q}/h-4-speak-chart-and-photo-hint.mp3`, script: "Look at where the top of the wall reaches on the two people in the photo. Then find that height on the chart." },
      explain: { audio: `${Q}/h-4-speak-chart-and-photo-explain.mp3`, script: "Here is one way to say it. The photo shows the wall reaching the people's waists, and the chart says a waist high wall stops water up to your waist, so this wall can stop a waist high flood." },
      interaction: { type: "speak", text: "waist waists high height ten rows chart photo picture stop stops knee water flood wall people shows says reaches tall level" },
    },
  ],
};
