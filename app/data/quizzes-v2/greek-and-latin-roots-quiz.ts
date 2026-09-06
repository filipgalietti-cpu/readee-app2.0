import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Greek and Latin Roots QUIZ (L.4.4b) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH world, "The
// Station on the Ridge" (a visit to a mountain weather station run by an
// unnamed observer; every fact true: the thermometer sits in a white slatted
// box that shades it and lets air through, a barometer measures the weight
// of the air pressing down and falls before a storm, an anemometer measures
// wind speed with spinning cups, cold air sinks at night so frost settles in
// the dip below the station while the ridge stays clear, birds circle on a
// thermal of warmed rising air, readings go to an international network of
// stations, spectacles is an old word for eyeglasses, expect once meant to
// look out for). Every stimulus is spoken inside its own question; two
// sentences are the child's on-screen read-alouds and are NEVER narrated
// (the cold-air sentence in e-4, the ladder sentence in h-3). Nothing from
// the lesson (Kendra, Grady, the theater, phonograph, spectators,
// intermission, megaphone, contradicted, dictated, interact, sprinter) is
// reused, and the lesson's PARTS are re-tested on fresh words. Bands:
// easier(G3-bridge, a known affix on a known word at 3 options: windless /
// unfrozen / misjudged, plus a one-sentence read-aloud) / core(on-grade G4:
// two-part meaning thermal, which part carries measure across three tools,
// a six-word Root Therm / Root Meter sort with b-* bucket clips, the
// look-alike winter among internet / interview / interstate, the piece of the
// sentence that confirms microclimate, and a production speak on multiday
// with a full accept list) / harder(G5 transfer, L.5.4b: a THREE-PART word
// modeled on inspector then applied to predictable; a root whose meaning
// SHIFTED modeled on spectacles then applied to expected; a long read-aloud;
// a closing production speak on the three-part international). Words +
// setting grep-swept vs lessons-v2 + quizzes-v2: weather station, observer,
// logbook, barometer, anemometer, rain gauge, thermal, thermostat,
// geothermal, speedometer, perimeter, microclimate, multiday, predictable,
// inspector, spectacles, internet, interview, interstate, international,
// windless, unfrozen, misjudged all 0 hits (thermos, misread, recheck,
// inspection, summit, hawks, crows, ravens found carried and avoided). No
// pictures: nothing here is answered from a picture.

const Q = "/audio/quizzes-v2/greek-and-latin-roots-quiz";

export const greekAndLatinRootsQuiz: QuizDef = {
  id: "greek-and-latin-roots-quiz",
  lessonId: "greek-and-latin-roots",
  title: "Greek and Latin Roots Quiz",
  standard: "L.4.4b",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-windless",
      band: "easier",
      difficulty: 1,
      prompt: "What does windless mean?",
      narration: { audio: `${Q}/e-1-windless.mp3`, script: "Here is a fresh place, a weather station on a high ridge, and a word from it with a part you know at the end. The ending l, e, s, s means without, the way a cloudless sky is a sky without clouds. Put the part together with the word in front of it, and test it in the sentence. The morning was windless, and the cups on the roof did not turn once. Tap what windless means." },
      hint: { audio: `${Q}/e-1-windless-hint.mp3`, script: "The ending means without. The word in front of it is a word you know, and the cups on the roof are not turning." },
      explain: { audio: `${Q}/e-1-windless-explain.mp3`, script: "Windless means without any wind. The ending means without, and the cups that measure wind did not turn because there was none." },
      interaction: { type: "choose", options: [{ id: "without-any-wind", label: "without any wind" }, { id: "full-of-strong-wind", label: "full of strong wind" }, { id: "windy-all-over-again", label: "windy all over again" }], correctId: "without-any-wind", coachWrong: "The ending on that word means without. Test your meaning against cups that did not turn once." },
    },
    {
      id: "e-2-unfrozen",
      band: "easier",
      difficulty: 2,
      prompt: "What does unfrozen mean?",
      narration: { audio: `${Q}/e-2-unfrozen.mp3`, script: "Another word from the station with a part you know, this time at the front. The part u, n means not, or the opposite of, the way unlocked means not locked. Put the part together with the word behind it, and test it in the sentence. By noon the rain gauge was unfrozen, and water dripped from its rim. Tap what unfrozen means." },
      hint: { audio: `${Q}/e-2-unfrozen-hint.mp3`, script: "The part at the front flips the word to its opposite. Water is dripping, so ask what the ice has stopped being." },
      explain: { audio: `${Q}/e-2-unfrozen-explain.mp3`, script: "Unfrozen means not frozen anymore. The part at the front means not, and dripping water shows that the ice had melted." },
      interaction: { type: "choose", options: [{ id: "not-frozen-anymore", label: "not frozen anymore" }, { id: "frozen-even-harder", label: "frozen even harder" }, { id: "frozen-before-noon", label: "frozen before noon" }], correctId: "not-frozen-anymore", coachWrong: "The part at the front means not. Test your meaning against water dripping from the rim." },
    },
    {
      id: "e-3-misjudged",
      band: "easier",
      difficulty: 3,
      prompt: "What does misjudged mean?",
      narration: { audio: `${Q}/e-3-misjudged.mp3`, script: "One more part at the front. The part m, i, s means wrongly, the way a misstep is a step taken wrongly. Put the part together with the word behind it, and test it in the sentence. A visitor misjudged the wind and let go of a paper, which sailed straight off the ridge. Tap what misjudged means." },
      hint: { audio: `${Q}/e-3-misjudged-hint.mp3`, script: "The part at the front means wrongly. The paper sailed away, so ask what the visitor got wrong about the wind." },
      explain: { audio: `${Q}/e-3-misjudged-explain.mp3`, script: "Misjudged means judged wrongly. The part at the front means wrongly, and the visitor judged the wind wrongly, so the paper flew off the ridge." },
      interaction: { type: "choose", options: [{ id: "judged-wrongly", label: "judged wrongly" }, { id: "judged-a-second-time", label: "judged a second time" }, { id: "judged-ahead-of-time", label: "judged ahead of time" }], correctId: "judged-wrongly", coachWrong: "The part at the front means wrongly. Test your meaning against a paper that sailed off the ridge." },
    },
    {
      id: "e-4-speak-read-cold-air",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Cold air sinks at night, so frost settles in the dip below the station while the ridge above stays clear.",
      narration: { audio: `${Q}/e-4-speak-read-cold-air.mp3`, script: "The sentence on your screen comes from the sign at the station door, and it is one sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-cold-air-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Cold air." },
      explain: { audio: `${Q}/e-4-speak-read-cold-air-explain.mp3`, script: "The sentence tells you that cold air sinks at night, so the dip below the station gets frost while the ridge above it stays clear." },
      interaction: { type: "speak", text: "Cold air sinks at night so frost settles in the dip below the station while the ridge above stays clear" },
    },
    {
      id: "c-1-thermal-meaning",
      band: "core",
      difficulty: 1,
      prompt: "What does thermal mean?",
      narration: { audio: `${Q}/c-1-thermal-meaning.mp3`, script: "Now the older parts. The part t, h, e, r, m means heat. You have it in thermometer, the tool at the station that measures heat. The ending a, l means having to do with. Put the two parts together, and test them in the sentence. Two birds circled above the ridge on a thermal, a column of air the sunlit rock had warmed, rising higher without flapping once. Tap what thermal means." },
      hint: { audio: `${Q}/c-1-thermal-meaning-hint.mp3`, script: "Borrow the meaning of the root, then ask what the sunlit rock did to the air the birds were riding." },
      explain: { audio: `${Q}/c-1-thermal-meaning-explain.mp3`, script: "Thermal means having to do with heat. The root means heat, the ending means having to do with, and the sentence says the rock had warmed the air." },
      interaction: { type: "choose", options: [{ id: "having-to-do-with-heat", label: "having to do with heat" }, { id: "having-to-do-with-wind", label: "having to do with wind" }, { id: "having-to-do-with-rain", label: "having to do with rain" }, { id: "having-to-do-with-height", label: "having to do with height" }], correctId: "having-to-do-with-heat", coachWrong: "Borrow the meaning of the root first, then test it against what the sunlit rock had done to the air." },
    },
    {
      id: "c-2-part-that-means-measure",
      band: "core",
      difficulty: 2,
      prompt: "Tap the part that means measure.",
      narration: { audio: `${Q}/c-2-part-that-means-measure.mp3`, script: "Three tools at the station share one part, and the part carries one meaning. A thermometer measures heat. A barometer measures the weight of the air pressing down, and it falls before a storm. An anemometer measures the speed of the wind with a set of spinning cups. Each tool measures something, and each name ends the same way. Four parts are on your screen. Tap the part that means measure." },
      hint: { audio: `${Q}/c-2-part-that-means-measure-hint.mp3`, script: "Say the three tool names slowly and listen for the part all three of them end with. That shared part is the one that means measure." },
      explain: { audio: `${Q}/c-2-part-that-means-measure-explain.mp3`, script: "The part is meter, spelled m, e, t, e, r, and it means measure. Thermometer, barometer, and anemometer all end with it, because all three measure something." },
      interaction: { type: "choose", options: [{ id: "meter", label: "meter" }, { id: "therm", label: "therm" }, { id: "baro", label: "baro" }, { id: "anemo", label: "anemo" }], correctId: "meter", coachWrong: "That part sits in only one of the three tool names. The part that means measure sits in all three." },
    },
    {
      id: "c-3-sort-therm-meter",
      band: "core",
      difficulty: 3,
      prompt: "Sort by part: Root Therm, or Root Meter?",
      narration: { audio: `${Q}/c-3-sort-therm-meter.mp3`, script: "Two parts, six words. The part t, h, e, r, m means heat, and the part m, e, t, e, r means measure. Read each word, find the part inside it, and drag the word to Root Therm or to Root Meter. Every word carries exactly one of the two." },
      hint: { audio: `${Q}/c-3-sort-therm-meter-hint.mp3`, script: "Look for the five letters of one part or the five letters of the other. The part can sit at the front of a word, in the middle, or at the very end." },
      explain: { audio: `${Q}/c-3-sort-therm-meter-explain.mp3`, script: "Thermal, thermostat, and geothermal carry therm, which means heat. Barometer, speedometer, and perimeter carry meter, which means measure." },
      interaction: { type: "sort", buckets: ["Root Therm","Root Meter"], bucketAudio: { "Root Therm": `${Q}/b-root-therm.mp3`, "Root Meter": `${Q}/b-root-meter.mp3` }, items: [{ label: "thermal", bucket: "Root Therm" }, { label: "barometer", bucket: "Root Meter" }, { label: "thermostat", bucket: "Root Therm" }, { label: "speedometer", bucket: "Root Meter" }, { label: "geothermal", bucket: "Root Therm" }, { label: "perimeter", bucket: "Root Meter" }], coachWrong: "Find the part itself inside the word. Heat goes to one bucket, and measure goes to the other." },
    },
    {
      id: "c-4-look-alike-inter",
      band: "core",
      difficulty: 4,
      prompt: "Which word only looks like it carries inter?",
      narration: { audio: `${Q}/c-4-look-alike-inter.mp3`, script: "The part i, n, t, e, r means between, and even an old part has look-alikes. Four words are on your screen, and each one has those five letters inside it. In three of them, the part truly means between, and you can find the between in the meaning. In one of them, the letters are there by chance, and the meaning has no between in it at all. Run the test on each word, and tap the one that only looks like it carries inter." },
      hint: { audio: `${Q}/c-4-look-alike-inter-hint.mp3`, script: "Ask each word the same question. Is there truly a between somewhere in what it means?" },
      explain: { audio: `${Q}/c-4-look-alike-inter-explain.mp3`, script: "Winter is the look-alike. The internet runs between computers, an interview is a talk between two people, and an interstate runs between states, but winter is a season with no between in it." },
      interaction: { type: "choose", options: [{ id: "winter", label: "winter" }, { id: "internet", label: "internet" }, { id: "interview", label: "interview" }, { id: "interstate", label: "interstate" }], correctId: "winter", coachWrong: "That word truly has a between in its meaning. Find the one where the letters are only a coincidence." },
    },
    {
      id: "c-5-confirming-clue-microclimate",
      band: "core",
      difficulty: 5,
      prompt: "Which piece of the sentence confirms what microclimate means?",
      narration: { audio: `${Q}/c-5-confirming-clue-microclimate.mp3`, script: "The last step of the move is the test, and the test lives in the sentence. The part m, i, c, r, o means small, and a climate is the usual weather of a place, so a microclimate is a small climate, the weather of one small spot. Four pieces of the sentence are on your screen, and every one of them is really in it. Only one of them shows the small climate. Tap the piece that confirms the meaning, after you hear the sentence. The dip behind the station has its own microclimate, a pocket of weather so small that frost forms there on nights when the ridge above stays clear." },
      hint: { audio: `${Q}/c-5-confirming-clue-microclimate-hint.mp3`, script: "The composed meaning is a small climate. Which piece of the sentence says that the weather there is small?" },
      explain: { audio: `${Q}/c-5-confirming-clue-microclimate-explain.mp3`, script: "The piece is, a pocket of weather so small. The dip, the frost, and the clear ridge are all in the sentence, but only that piece confirms a small climate." },
      interaction: { type: "choose", options: [{ id: "a-pocket-of-weather-so-small", label: "a pocket of weather so small" }, { id: "the-dip-behind-the-station", label: "the dip behind the station" }, { id: "frost-forms-there", label: "frost forms there" }, { id: "the-ridge-above-stays-clear", label: "the ridge above stays clear" }], correctId: "a-pocket-of-weather-so-small", coachWrong: "That piece is in the sentence, but it does not say anything about a small climate. Find the piece that does." },
    },
    {
      id: "c-6-speak-multiday",
      band: "core",
      difficulty: 6,
      prompt: "Multiday. Name its two parts, and say what the whole word means.",
      narration: { audio: `${Q}/c-6-speak-multiday.mp3`, script: "Now make the whole move out loud. The part m, u, l, t, i means many, and the other part is a word you have known since you could talk. Here is the sentence. A multiday storm sat over the ridge, and the rain gauge had to be emptied three times. Tap the mic. Name the two parts inside multiday, say what each part means, and then say what the whole word means." },
      hint: { audio: `${Q}/c-6-speak-multiday-hint.mp3`, script: "The part at the front means many. The part at the end is a plain word for the time between one sunrise and the next. Put them together." },
      explain: { audio: `${Q}/c-6-speak-multiday-explain.mp3`, script: "One way to say it goes like this. Multi means many, and day is a day, so a multiday storm is a storm that lasts many days, which is why the gauge had to be emptied three times." },
      interaction: { type: "speak", text: "multi many day days lasting lasts several more than one lots long storm keeps going stretch week number two three multiple over" },
    },
    {
      id: "h-1-three-parts-predictable",
      band: "harder",
      difficulty: 1,
      prompt: "What does predictable mean?",
      narration: { audio: `${Q}/h-1-three-parts-predictable.mp3`, script: "Here is a fifth grade move. Some words carry three parts, a part at the front, a root in the middle, and a part at the end, and you read all three. Watch me with inspector. I, n, at the front means into. S, p, e, c, t, in the middle, means look. O, r, at the end, names a person. An inspector is a person who looks into things, and the station gets a visit from one every spring. Now you. The part p, r, e means before. The part d, i, c, t means say. The part a, b, l, e means can be. Stack all three, and test them in the sentence. After a week of readings, the afternoon wind on the ridge became predictable, arriving within a few minutes of the same time each day. Tap what predictable means." },
      hint: { audio: `${Q}/h-1-three-parts-predictable-hint.mp3`, script: "Front, middle, end. Before, say, can be. Put the three meanings in a row, then ask what a wind that arrives at the same time each day lets you do." },
      explain: { audio: `${Q}/h-1-three-parts-predictable-explain.mp3`, script: "Predictable means can be said before it comes. Before, say, can be, and a wind that arrives at the same time every day can be said ahead of time." },
      interaction: { type: "choose", options: [{ id: "can-be-said-before-it-comes", label: "can be said before it comes" }, { id: "said-over-and-over-again", label: "said over and over again" }, { id: "can-be-said-after-it-ends", label: "can be said after it ends" }, { id: "cannot-be-said-at-all", label: "cannot be said at all" }], correctId: "can-be-said-before-it-comes", coachWrong: "Read all three parts in order. The part at the front tells you when, the root tells you the action, and the part at the end tells you can be." },
    },
    {
      id: "h-2-shifted-root-expected",
      band: "harder",
      difficulty: 2,
      prompt: "What does expected mean?",
      narration: { audio: `${Q}/h-2-shifted-root-expected.mp3`, script: "Another fifth grade move. Sometimes a root's meaning has shifted over hundreds of years, and the part still helps if you follow the shift. Watch me with spectacles. S, p, e, c, t means look, and spectacles is an old word for eyeglasses. The word shifted from the looking itself to the thing you look through, and the observer keeps a pair in a shirt pocket for reading the small dials. Now you. E, x means out, and s, p, e, c, t means look, so expect once meant to look out for something. Follow the shift, and test it in the sentence. By dusk the barometer had fallen so far that the observer expected snow before morning. Tap what expected means." },
      hint: { audio: `${Q}/h-2-shifted-root-expected-hint.mp3`, script: "Looking out for something shifted into a feeling about what is on its way. The barometer is falling, and the observer is thinking about snow." },
      explain: { audio: `${Q}/h-2-shifted-root-expected-explain.mp3`, script: "Expected means thought it would come. Looking out for something shifted into thinking it will arrive, and a falling barometer told the observer that snow was on its way." },
      interaction: { type: "choose", options: [{ id: "thought-it-would-come", label: "thought it would come" }, { id: "looked-at-it-up-close", label: "looked at it up close" }, { id: "measured-it-a-second-time", label: "measured it a second time" }, { id: "said-it-out-loud", label: "said it out loud" }], correctId: "thought-it-would-come", coachWrong: "Follow the shift. The root meant look out for, and today it means something you feel about what is on its way." },
    },
    {
      id: "h-3-speak-read-the-ladder",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Every morning the observer climbs the ladder to the roof, clears ice from the cups of the anemometer, and writes the wind speed in a logbook that has not missed a day in years.",
      narration: { audio: `${Q}/h-3-speak-read-the-ladder.mp3`, script: "The last sentence of the visit is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/h-3-speak-read-the-ladder-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Every morning." },
      explain: { audio: `${Q}/h-3-speak-read-the-ladder-explain.mp3`, script: "The sentence tells you that the observer climbs to the roof every morning, clears the ice from the cups, and writes the wind speed in a logbook that has not missed a day in years." },
      interaction: { type: "speak", text: "Every morning the observer climbs the ladder to the roof clears ice from the cups of the anemometer and writes the wind speed in a logbook that has not missed a day in years" },
    },
    {
      id: "h-4-speak-international",
      band: "harder",
      difficulty: 4,
      prompt: "International. Name its parts, and say what the whole word means.",
      narration: { audio: `${Q}/h-4-speak-international.mp3`, script: "Last one, out loud, and it carries three parts. The part i, n, t, e, r means between. The middle is a word you know, n, a, t, i, o, n, a country and its people. The ending a, l means having to do with. Here is the sentence. Once a day, the readings from the ridge go to an international network of stations, so that a storm crossing one country can be tracked into the next. Tap the mic. Name the parts inside international, and say what the whole word means." },
      hint: { audio: `${Q}/h-4-speak-international-hint.mp3`, script: "Front, middle, end. Between, a country, having to do with. Say the three, then say what a network like that reaches across." },
      explain: { audio: `${Q}/h-4-speak-international-explain.mp3`, script: "One way to say it goes like this. Inter means between, nation is a country, and al means having to do with, so international means having to do with what happens between countries, like stations sharing readings across a border." },
      interaction: { type: "speak", text: "inter between nation nations national countries country al many world worldwide across borders border shared global lands other different network stations tracked" },
    },
  ],
};
