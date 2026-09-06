import type { QuizDef } from "@/lib/lesson-engine/quiz";

// In-Depth Details QUIZ (RL.4.3) · FACTORY-AUTHORED from the finished lesson
// (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second story, "Between
// Floors" (Bettina and her cousin Rafael carry four bags of groceries up to
// Aunt Ophelia's ninth-floor apartment; the old elevator lurches and stops
// between eight and nine, the hum dies, the light settles to a dim yellow, a
// tick comes from above and the air turns warm and close; Rafael slides down
// the wall with his knees up and thinks the walls are closer, says they will
// be in there all night; Bettina counts to ten in her head, presses the red
// button under the speaker, and Mr. Pemberton the building super answers, ten
// minutes, do not go anywhere; she says thank you and hands down apricots
// while Rafael is sure the light is about to go out; the doors open a foot
// below the eighth-floor hallway; Rafael climbs out first and reaches back
// for every bag, then laughs about the tick on the stairs). The story is
// spoken page by page INSIDE the questions so every Q is self-contained; two
// sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere in the quiz (page five's first sentence in e-4, the last sentence
// in h-3). Bands: easier(G3-bridge, RL.3.3 what-a-character-is-like from ONE
// action or one set of words at 3 options with the three quiz pictures as
// support, plus a one-sentence read) / core(on-grade G4: which detail is a
// THOUGHT among thought / words / action / setting, the claim three details
// of different kinds build, a six-item Thought / Words / Action sort with b-*
// bucket clips, BEST evidence for a setting feel-claim among four true
// details, the event as led-in / happened / changed in a 3-item sequence with
// unlabeled tiles, and a production speak describing Rafael with a claim and
// two details of different kinds) / harder(G5 transfer, RL.5.3 COMPARING TWO
// CHARACTERS on the same kind of detail: taught in h-1 on actions, applied to
// their words; applied again to their thoughts in h-2; the last sentence read
// aloud; a closing production speak that compares the cousins on one kind of
// detail with a full accept list). Nothing from the lesson story (Imogen,
// Ezekiel, the zipline) is reused. Names + setting grep-swept vs lessons-v2 +
// quizzes-v2: Bettina, Rafael, Ophelia, Pemberton, between floors, lurch,
// stairwell all 0 hits; elevator = 3 prose hits in fact-party-g1; "sit tight"
// (word-connections idiom tile) and ice cream (13 hits) avoided on purpose.
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/in-depth-details-quiz";
const IMG = (w: string) => `/images/lessons-v2/in-depth-details/${w.toLowerCase()}.png`;

export const inDepthDetailsQuiz: QuizDef = {
  id: "in-depth-details-quiz",
  lessonId: "in-depth-details",
  title: "In-Depth Details Quiz",
  standard: "RL.4.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-rafael-knees-up",
      band: "easier",
      difficulty: 1,
      prompt: "Rafael slid down the wall with his knees up. What is he like right then?",
      image: IMG("quiz-elevator-dim"),
      narration: { audio: `${Q}/e-1-rafael-knees-up.mp3`, script: "This question comes from a new story about two cousins in an old elevator, and it is about one action. On page two, when the elevator stopped between floors, Rafael slid down the wall until he was sitting on the floor with his knees pulled up to his chest. That action shows you what he is like at that moment. Tap the word that fits." },
      hint: { audio: `${Q}/e-1-rafael-knees-up-hint.mp3`, script: "Ask what a person is feeling when they make themselves small against a wall the second something goes wrong." },
      explain: { audio: `${Q}/e-1-rafael-knees-up-explain.mp3`, script: "Sliding down the wall and pulling his knees in shows that Rafael was frightened. A bored person or a sleepy person does not curl up small the moment the elevator stops." },
      interaction: { type: "choose", options: [{ id: "frightened", label: "frightened" }, { id: "bored", label: "bored" }, { id: "sleepy", label: "sleepy" }], correctId: "frightened", coachWrong: "Look at the boy in the picture and think about why a person sits like that. Which word fits?" },
    },
    {
      id: "e-2-bettina-red-button",
      band: "easier",
      difficulty: 2,
      prompt: "Bettina counted to ten and pressed the button. What is she like?",
      image: IMG("quiz-red-button"),
      narration: { audio: `${Q}/e-2-bettina-red-button.mp3`, script: "This one is about Bettina, the other cousin, and one action of hers. On page three, while Rafael sat on the floor, Bettina counted to ten in her head and then pressed the red button under the speaker and held it until a crackle came out. That action shows what she is like at that moment. Tap the word that fits." },
      hint: { audio: `${Q}/e-2-bettina-red-button-hint.mp3`, script: "Ask what kind of person counts to ten first and then does the one useful thing." },
      explain: { audio: `${Q}/e-2-bettina-red-button-explain.mp3`, script: "Counting to ten and then pressing the button shows that Bettina was calm. Nothing in that action is silly, and nothing in it is angry." },
      interaction: { type: "choose", options: [{ id: "calm", label: "calm" }, { id: "silly", label: "silly" }, { id: "angry", label: "angry" }], correctId: "calm", coachWrong: "Look at the girl in the picture and think about what she is doing with her hand. Which word fits a person who does that?" },
    },
    {
      id: "e-3-pemberton-ten-minutes",
      band: "easier",
      difficulty: 3,
      prompt: "The super promised to have them out in ten minutes. What is he like?",
      image: IMG("quiz-doors-open"),
      narration: { audio: `${Q}/e-3-pemberton-ten-minutes.mp3`, script: "This one is about the building super, Mr. Pemberton, and his words. On page four, a tired voice came out of the speaker and said that they were stuck between eight and nine, that he could have them out in ten minutes, and that they should not go anywhere. Those words show what he is like. Tap the word that fits." },
      hint: { audio: `${Q}/e-3-pemberton-ten-minutes-hint.mp3`, script: "Ask what kind of person promises to come and get you out, and the picture shows him keeping that promise." },
      explain: { audio: `${Q}/e-3-pemberton-ten-minutes-explain.mp3`, script: "Promising to have them out in ten minutes shows that Mr. Pemberton is helpful. A lazy super would not come, and a mean one would not promise anything." },
      interaction: { type: "choose", options: [{ id: "helpful", label: "helpful" }, { id: "lazy", label: "lazy" }, { id: "mean", label: "mean" }], correctId: "helpful", coachWrong: "Look at the man in the doorway and what he is doing with the bag. Which word fits a person who does that?" },
    },
    {
      id: "e-4-speak-read-ten-minutes",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: The ten minutes felt like an hour to Rafael and like ten minutes to Bettina, who was thinking about whether the frozen peas in the bottom bag would survive.",
      narration: { audio: `${Q}/e-4-speak-read-ten-minutes.mp3`, script: "Page five begins with the sentence on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/e-4-speak-read-ten-minutes-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words The ten minutes." },
      explain: { audio: `${Q}/e-4-speak-read-ten-minutes-explain.mp3`, script: "The sentence tells you that the same ten minutes felt long to Rafael and short to Bettina, who was busy worrying about the frozen peas." },
      interaction: { type: "speak", text: "The ten minutes felt like an hour to Rafael and like ten minutes to Bettina who was thinking about whether the frozen peas in the bottom bag would survive" },
    },
    {
      id: "c-1-which-is-thought",
      band: "core",
      difficulty: 1,
      prompt: "Four details about Rafael. Tap the thought.",
      narration: { audio: `${Q}/c-1-which-is-thought.mp3`, script: "Four details from pages two and three are on your screen. One is a thought, something inside Rafael's head. One is his words, something he said out loud. One is an action, something his body did. And one describes the elevator, not Rafael. Tap the thought after you hear the pages. Here are pages two and three. The elevator was so quiet now that Bettina could hear a tick from somewhere above them, and the air, which had been cool, began to feel warm and close. Rafael slid down the wall until he was sitting on the floor with his knees pulled up to his chest. The walls, he thought, were closer than they had been a minute ago. We are going to be in here all night, he said, and his voice came out smaller than he meant it to." },
      hint: { audio: `${Q}/c-1-which-is-thought-hint.mp3`, script: "A thought is marked by a word like thought or wondered, so find the detail the page marks that way." },
      explain: { audio: `${Q}/c-1-which-is-thought-explain.mp3`, script: "The thought is, the walls were closer. The page says, the walls, he thought, were closer. All night was said out loud, and sliding down the wall was an action." },
      interaction: { type: "choose", options: [{ id: "the-walls-were-closer", label: "the walls were closer" }, { id: "in-here-all-night", label: "in here all night" }, { id: "he-slid-down-the-wall", label: "he slid down the wall" }, { id: "the-elevator-was-quiet", label: "the elevator was quiet" }], correctId: "the-walls-were-closer", coachWrong: "That detail was said out loud, or a body did it, or it describes the elevator. A thought lives inside his head, and the page marks it with the word thought." },
    },
    {
      id: "c-2-claim-from-details",
      band: "core",
      difficulty: 2,
      prompt: "Which claim do Bettina's three details build?",
      narration: { audio: `${Q}/c-2-claim-from-details.mp3`, script: "Here are three details about Bettina from pages three and four, one of each kind. Her thought. She counted to ten in her head, because nothing bad happens in the first ten seconds. Her action. She pressed the red button and held it until the speaker crackled. Her words. When the super answered, she said thank you. Four claims are on your screen. Tap the one those three details support." },
      hint: { audio: `${Q}/c-2-claim-from-details-hint.mp3`, script: "Test each claim against all three details, because a claim has to fit the thought, the action, and the words at once." },
      explain: { audio: `${Q}/c-2-claim-from-details-explain.mp3`, script: "The three details build, calm and she takes charge. She counted, she pressed the button, and she thanked the super. Nothing there is scared stiff, angry, or bored." },
      interaction: { type: "choose", options: [{ id: "calm-and-she-takes-charge", label: "calm and she takes charge" }, { id: "too-scared-to-move", label: "too scared to move" }, { id: "angry-at-her-cousin", label: "angry at her cousin" }, { id: "bored-by-the-whole-thing", label: "bored by the whole thing" }], correctId: "calm-and-she-takes-charge", coachWrong: "Test that claim against the button she pressed and the thank you she said. Find the claim all three details fit." },
    },
    {
      id: "c-3-sort-thought-words-action",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Thought, Words, or Action?",
      narration: { audio: `${Q}/c-3-sort-thought-words-action.mp3`, script: "Six details from the story are on your screen, some about Rafael, some about Bettina, and some about the super. Ask where each detail lives. Inside a head goes to Thought. Said out loud goes to Words. Something a body did goes to Action. Here are the pages the details come from. Bettina counted to ten in her head, because nothing bad happens in the first ten seconds, and then she pressed the red button. The super said they were stuck between eight and nine, and that they should not go anywhere. Bettina said thank you and handed a handful of apricots down to Rafael, who was sure the light was about to go out." },
      hint: { audio: `${Q}/c-3-sort-thought-words-action-hint.mp3`, script: "One at a time, ask whether the detail happened inside someone's head, came out of a mouth, or was done by a body." },
      explain: { audio: `${Q}/c-3-sort-thought-words-action-explain.mp3`, script: "Nothing bad in ten seconds and the light would go out lived inside heads. Do not go anywhere and thank you came out of mouths. Pressing the button and handing down the apricots were things bodies did." },
      interaction: { type: "sort", buckets: ["Thought","Words","Action"], bucketAudio: { "Thought": `${Q}/b-thought.mp3`, "Words": `${Q}/b-words.mp3`, "Action": `${Q}/b-action.mp3` }, items: [{ label: "nothing bad in ten seconds", bucket: "Thought" }, { label: "do not go anywhere", bucket: "Words" }, { label: "pressed the red button", bucket: "Action" }, { label: "the light would go out", bucket: "Thought" }, { label: "she said thank you", bucket: "Words" }, { label: "handed down the apricots", bucket: "Action" }], coachWrong: "Ask where that detail lives. Inside a head is a thought, out loud is words, and something a body did is an action." },
    },
    {
      id: "c-4-best-setting-evidence",
      band: "core",
      difficulty: 4,
      prompt: "The elevator felt stuffy and closed in. Which detail is the best evidence?",
      narration: { audio: `${Q}/c-4-best-setting-evidence.mp3`, script: "A setting is built from what is seen, what is heard, and what is felt. Here is my claim about the stalled elevator. It felt stuffy and closed in. Four details from pages one and two are on your screen, and every one of them is true. Three of them tell what the elevator looked like or sounded like. One of them tells what the air felt like, and that one is the best evidence. Tap the best evidence after you hear the pages. The elevator groaned when the doors slid shut, and the light flickered twice before it settled into a dim yellow glow. It was so quiet that Bettina could hear a tick from somewhere above them, and the air, which had been cool, began to feel warm and close." },
      hint: { audio: `${Q}/c-4-best-setting-evidence-hint.mp3`, script: "Stuffy is something a person feels, not something a person sees or hears." },
      explain: { audio: `${Q}/c-4-best-setting-evidence-explain.mp3`, script: "The best evidence is, the air felt warm and close. The dim light, the tick, and the doors are true, but stuffy and closed in is a feeling, and the air is the detail that carries it." },
      interaction: { type: "choose", options: [{ id: "the-air-felt-warm-and-close", label: "the air felt warm and close" }, { id: "the-light-glowed-dim-yellow", label: "the light glowed dim yellow" }, { id: "a-tick-came-from-above", label: "a tick came from above" }, { id: "the-doors-slid-shut", label: "the doors slid shut" }], correctId: "the-air-felt-warm-and-close", coachWrong: "That detail is true, but it tells what the elevator looked like or sounded like. Which detail tells what it felt like?" },
    },
    {
      id: "c-5-sequence-the-stall",
      band: "core",
      difficulty: 5,
      prompt: "Put the three parts of the stall in order.",
      narration: { audio: `${Q}/c-5-sequence-the-stall.mp3`, script: "An event is built from what led in, what happened, and what it changed. Three moments from the elevator stall are on your screen, mixed up. Drag them into order, first the moment that led in, then the moment it happened, then the moment that shows what changed. Here is page one and part of page three. Rafael pressed the button for nine and leaned against the mirror wall. Somewhere between the eighth floor and the ninth, the floor gave a small lurch, the hum stopped, and the light flickered. Bettina pressed the red button and held it until a crackle came out, and a tired voice said, building super." },
      hint: { audio: `${Q}/c-5-sequence-the-stall-hint.mp3`, script: "Walk it from the start. What did Rafael do first, what did the elevator do next, and what did the red button bring?" },
      explain: { audio: `${Q}/c-5-sequence-the-stall-explain.mp3`, script: "First Rafael pressed nine, and that led in. Then the floor lurched and the elevator stopped, and that is what happened. Then a voice answered the button, and that changed everything, because they were no longer alone." },
      interaction: { type: "sequence", items: [{ id: "rafael-presses-nine", label: "rafael presses nine" }, { id: "the-floor-lurches-and-stops", label: "the floor lurches and stops" }, { id: "a-voice-answers-the-button", label: "a voice answers the button" }], order: ["rafael-presses-nine","the-floor-lurches-and-stops","a-voice-answers-the-button"], coachWrong: "Walk it from the start. What did Rafael do first, what did the elevator do next, and what came out of the speaker last?" },
    },
    {
      id: "c-6-speak-describe-rafael",
      band: "core",
      difficulty: 6,
      prompt: "Describe Rafael in depth: a claim, then two details of different kinds.",
      narration: { audio: `${Q}/c-6-speak-describe-rafael.mp3`, script: "Now you build the description out loud. Tap the mic. Start with a claim about Rafael, one sentence that says what he is like when the elevator stops. Then give two details of different kinds, a thought and an action, or his words and an action. Here are the details to draw from. Rafael slid down the wall until he was sitting with his knees pulled up. The walls, he thought, were closer than they had been. We are going to be in here all night, he said, in a voice smaller than he meant it to be." },
      hint: { audio: `${Q}/c-6-speak-describe-rafael-hint.mp3`, script: "A claim comes first, what he is like, and then the words the story uses for a thought and for an action." },
      explain: { audio: `${Q}/c-6-speak-describe-rafael-explain.mp3`, script: "One way to say it goes like this. Rafael is frightened when the elevator stops. He slid down the wall with his knees pulled up, and he thought the walls were closer than they had been." },
      interaction: { type: "speak", text: "scared afraid frightened nervous worried panicked panicky slid sat sitting floor wall knees chest walls closer thought night stuck small voice said light out sure quiet still brave later laughing calm" },
    },
    {
      id: "h-1-compare-words-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Set their words side by side. Which comparison is true?",
      narration: { audio: `${Q}/h-1-compare-words-taught.mp3`, script: "Here is a fifth grade move. You compare two characters on the same kind of detail, set side by side. Watch me do it with actions. When the elevator stopped, Rafael's action was to slide down the wall and pull his knees up. Bettina's action was to press the red button and hold it. Same moment, two actions, and the comparison is, Rafael made himself small while Bettina got help. Now you do it with words. Four comparisons are on your screen, and only one sets their words side by side truthfully. Here are their words. Rafael said, we are going to be in here all night. Bettina, when the super answered, said thank you." },
      hint: { audio: `${Q}/h-1-compare-words-taught-hint.mp3`, script: "Match each half to the right cousin, the one who said the all-night line and the one who said thank you." },
      explain: { audio: `${Q}/h-1-compare-words-taught-explain.mp3`, script: "The true comparison is, he panics and she thanks. Rafael's words expected the worst, and Bettina's words were a thank you, so their words show two different cousins in the same box." },
      interaction: { type: "choose", options: [{ id: "he-panics-and-she-thanks", label: "he panics and she thanks" }, { id: "he-thanks-and-she-panics", label: "he thanks and she panics" }, { id: "both-of-them-panic", label: "both of them panic" }, { id: "both-of-them-say-thanks", label: "both of them say thanks" }], correctId: "he-panics-and-she-thanks", coachWrong: "Check each half against the page. Who said the all-night line, and who said thank you?" },
    },
    {
      id: "h-2-compare-thoughts",
      band: "harder",
      difficulty: 2,
      prompt: "Set their thoughts side by side. Which comparison is true?",
      narration: { audio: `${Q}/h-2-compare-thoughts.mp3`, script: "Now compare the two cousins on their thoughts, the same way. Four comparisons are on your screen, and only one sets the two thoughts side by side truthfully. Here are the thoughts. On page two, Rafael thought the walls were closer than they had been a minute ago. On page three, Bettina counted to ten in her head, because nothing bad happens in the first ten seconds." },
      hint: { audio: `${Q}/h-2-compare-thoughts-hint.mp3`, script: "One thought was about the walls, and one thought was a plan, so match each half to the right cousin." },
      explain: { audio: `${Q}/h-2-compare-thoughts-explain.mp3`, script: "The true comparison is, he fears and she counts. Rafael's thought was about the walls closing in, and Bettina's thought was a plan, count to ten, so the same moment lived differently in their two heads." },
      interaction: { type: "choose", options: [{ id: "he-fears-and-she-counts", label: "he fears and she counts" }, { id: "he-counts-and-she-fears", label: "he counts and she fears" }, { id: "both-of-them-count-to-ten", label: "both of them count to ten" }, { id: "both-of-them-fear-the-walls", label: "both of them fear the walls" }], correctId: "he-fears-and-she-counts", coachWrong: "Check each half against the pages. Whose thought was about the walls, and whose thought was counting?" },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: By the time they had carried everything up the last flight of stairs, he was laughing about the tick in the ceiling, and Bettina let him tell the story to Aunt Ophelia his own way.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the story is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at each comma, and let the ending land lightly." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words By the time." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that Rafael was laughing about the tick by the top of the stairs, and that the story got told his way when they reached the apartment." },
      interaction: { type: "speak", text: "By the time they had carried everything up the last flight of stairs he was laughing about the tick in the ceiling and Bettina let him tell the story to Aunt Ophelia his own way" },
    },
    {
      id: "h-4-speak-compare-cousins",
      band: "harder",
      difficulty: 4,
      prompt: "Compare the cousins on one kind of detail, then say what it shows.",
      narration: { audio: `${Q}/h-4-speak-compare-cousins.mp3`, script: "Last one, out loud. Compare Rafael and Bettina on one kind of detail. Pick thoughts, words, or actions. Say what Rafael did, or thought, or said, then say what Bettina did, or thought, or said at the same moment, and finish with what that shows about the two of them. Here is the moment. When the floor lurched and the hum stopped, Rafael slid down the wall with his knees pulled up and said they would be in there all night, while Bettina counted to ten in her head, pressed the red button, and said thank you when the super answered." },
      hint: { audio: `${Q}/h-4-speak-compare-cousins-hint.mp3`, script: "Pick one kind, thoughts, words, or actions, then give his and hers from the same moment." },
      explain: { audio: `${Q}/h-4-speak-compare-cousins-explain.mp3`, script: "One way to say it goes like this. When the elevator stopped, Rafael slid down the wall, and Bettina pressed the red button, so his action shows fear and hers shows a plan." },
      interaction: { type: "speak", text: "rafael bettina scared afraid frightened nervous worried panicked calm brave steady floor wall knees slid sat night stuck counted ten button pressed alarm thank thanks thanked apricots help helped different both while opposite small charge quiet plan" },
    },
  ],
};
