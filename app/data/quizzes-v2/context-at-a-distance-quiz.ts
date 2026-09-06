import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Context at a Distance QUIZ (L.4.4a) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed and rebuilt in the judge.
// ALL-FRESH second text, "Iron and Fire", a true informational text about the
// village blacksmith (every fact true: before factories every village had a
// smith; the forge is a low brick hearth with air blown in from below; the
// anvil is a heavy iron block with a flat top and a horn; bar iron cold from
// the shelf will not bend and can crack under the hammer; in the coals a bar
// turns dull red, then orange, then bright yellow; at that heat it bends and
// stretches; the bellows are a leather bag with wooden handles that feed the
// fire air; a horseshoe takes several heats; quenching plunges the hot shoe
// into water, cooling it in an instant with a hiss and steam, setting the
// shape; the shop is black with coal dust; a smith also made hooks, hinges,
// and blades; a fire is banked at the end of the day). The text is spoken
// page by page INSIDE the questions so every Q is self-contained; two
// sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere in the quiz (page one's first sentence in e-4, the last sentence
// of page five in h-3), and no explain quotes a six-word run of either.
// Bands: easier (G3-bridge, the clue in the SAME sentence set off by commas,
// forge / anvil / bellows at 3 options with the picture as the evidence, plus
// a one-sentence read-aloud) / core (on-grade G4: malleable with its EXAMPLE a
// sentence later, WHERE the clue for quench lives = the next paragraph that
// opens with in other words while two sentences sit between the word and the
// page break so next-sentence is false, a six-item Clue / Just Mentions It
// sort with b-* bucket clips, the TWO-PIECE clue for sooty as a pair among
// four pairs, the clue KIND for laborious = an example, and a production
// speak on unyielding, meaning plus where its clue lives, 22 accepts) /
// harder (G5 transfer L.5.4a TAUGHT in the stimulus: a CAUSE as the clue,
// modeled on spent then applied to dormant; a COMPARISON as the clue,
// modeled on keen then applied to radiant; the last sentence read aloud; a
// closing production speak that says what dormant means and names the cause
// as the clue kind, 23 accepts). Nothing from the lesson story (the comet,
// Bridget, Casper, Konrad, vigil / drafty / frigid / coax / feeble / meager /
// bleak / abundant / linger) is reused. Words grep-swept vs lessons-v2 +
// quizzes-v2: blacksmith, forge (only inside forget), anvil, bellows, tongs,
// horseshoe, hearth, quench, malleable, laborious, sooty, unyielding, radiant,
// keen, dormant, deft all 0 hits (brittle, scorching, durable found burned and
// avoided). Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/context-at-a-distance-quiz";
const IMG = (w: string) => `/images/lessons-v2/context-at-a-distance/${w.toLowerCase()}.png`;

export const contextAtADistanceQuiz: QuizDef = {
  id: "context-at-a-distance-quiz",
  lessonId: "context-at-a-distance",
  title: "Context at a Distance Quiz",
  standard: "L.4.4a",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-forge-meaning",
      band: "easier",
      difficulty: 1,
      prompt: "What is a forge?",
      image: IMG("quiz-forge-fire"),
      narration: { audio: `${Q}/e-1-forge-meaning.mp3`, script: "Here is a true text about the iron workers of long ago, called Iron and Fire. In this sentence the clue sits right beside the word, the way third grade clues do. Listen for the word forge, and tap what a forge is. Here is the sentence. A smith's fire burns in a forge, a low brick hearth with air blown into it from below." },
      hint: { audio: `${Q}/e-1-forge-meaning-hint.mp3`, script: "The words right after forge, set off by a comma, tell you what it is, and the picture shows the same thing." },
      explain: { audio: `${Q}/e-1-forge-meaning-explain.mp3`, script: "A forge is a fire pit for heating iron. The sentence says it right after the word, a low brick hearth with air blown into it, and the picture shows the coals glowing in it." },
      interaction: { type: "choose", options: [{ id: "a-fire-pit-for-heating-iron", label: "a fire pit for heating iron" }, { id: "a-heavy-iron-block", label: "a heavy iron block" }, { id: "a-leather-air-bag", label: "a leather air bag" }], correctId: "a-fire-pit-for-heating-iron", coachWrong: "Look at the picture. What is glowing in the middle of the shop?" },
    },
    {
      id: "e-2-anvil-meaning",
      band: "easier",
      difficulty: 2,
      prompt: "What is an anvil?",
      image: IMG("quiz-anvil-tongs"),
      narration: { audio: `${Q}/e-2-anvil-meaning.mp3`, script: "The next sentence of Iron and Fire names a second tool, and its clue sits right beside the word again. Listen for the word anvil, and tap what an anvil is. Here is the sentence. Beside the forge stands the anvil, a heavy block of iron with a flat top for hammering." },
      hint: { audio: `${Q}/e-2-anvil-meaning-hint.mp3`, script: "The words after the comma describe the anvil, and the picture shows a hot bar being hammered on top of it." },
      explain: { audio: `${Q}/e-2-anvil-meaning-explain.mp3`, script: "An anvil is a block for hammering on. The sentence says, a heavy block of iron with a flat top for hammering, and the picture shows the hammer coming down on it." },
      interaction: { type: "choose", options: [{ id: "a-block-for-hammering-on", label: "a block for hammering on" }, { id: "a-bag-that-blows-air", label: "a bag that blows air" }, { id: "a-bucket-of-cold-water", label: "a bucket of cold water" }], correctId: "a-block-for-hammering-on", coachWrong: "Look at the picture. What is the glowing bar resting on?" },
    },
    {
      id: "e-3-bellows-meaning",
      band: "easier",
      difficulty: 3,
      prompt: "What are the bellows?",
      image: IMG("quiz-bellows"),
      narration: { audio: `${Q}/e-3-bellows-meaning.mp3`, script: "Page two of Iron and Fire ends with a third tool. Its clue sits in the same sentence, between two commas. Listen for the word bellows, and tap what the bellows are. Here is the sentence. A helper also pumps the bellows, a leather bag with wooden handles, so that the fire stays hot enough." },
      hint: { audio: `${Q}/e-3-bellows-meaning-hint.mp3`, script: "The words between the commas tell you what the bellows are made of, and the picture shows two hands squeezing them." },
      explain: { audio: `${Q}/e-3-bellows-meaning-explain.mp3`, script: "The bellows are a bag that pumps air. The sentence calls them a leather bag with wooden handles, and pumping them keeps the fire hot." },
      interaction: { type: "choose", options: [{ id: "a-bag-that-pumps-air", label: "a bag that pumps air" }, { id: "a-block-for-hammering", label: "a block for hammering" }, { id: "a-bucket-for-cooling", label: "a bucket for cooling" }], correctId: "a-bag-that-pumps-air", coachWrong: "Look at the picture. What are the hands squeezing, and where is it pointed?" },
    },
    {
      id: "e-4-speak-read-village-smith",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Long before factories, every village had a smith, a worker who shaped iron by hand.",
      narration: { audio: `${Q}/e-4-speak-read-village-smith.mp3`, script: "The first sentence of Iron and Fire is on your screen. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/e-4-speak-read-village-smith-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words Long before." },
      explain: { audio: `${Q}/e-4-speak-read-village-smith-explain.mp3`, script: "The sentence tells you that each village once had its own smith, and it tells you what a smith is, the person who made things out of iron with a hammer." },
      interaction: { type: "speak", text: "Long before factories every village had a smith a worker who shaped iron by hand" },
    },
    {
      id: "c-1-malleable-meaning",
      band: "core",
      difficulty: 1,
      prompt: "What does malleable mean here?",
      narration: { audio: `${Q}/c-1-malleable-meaning.mp3`, script: "Now a fourth grade clue, one that lives a sentence away. Listen for the word malleable on page two. Its own sentence tells you nothing, so read further, into the sentence after it. Four meanings are on your screen. Tap the meaning that the next sentence proves. Here is page two. In the fire, everything changes. A bar left in the coals turns dull red, then orange, then a yellow so bright that it hurts to look at. At that heat the iron is malleable. It bends around the horn of the anvil, stretches under the hammer, and takes any shape the smith asks of it." },
      hint: { audio: `${Q}/c-1-malleable-meaning-hint.mp3`, script: "The sentence after malleable is a whole example of what the hot iron does under the hammer." },
      explain: { audio: `${Q}/c-1-malleable-meaning-explain.mp3`, script: "Malleable means easy to bend and shape. The next sentence is the example, it bends around the horn, stretches under the hammer, and takes any shape the smith asks." },
      interaction: { type: "choose", options: [{ id: "easy-to-bend-and-shape", label: "easy to bend and shape" }, { id: "too-hot-to-pick-up", label: "too hot to pick up" }, { id: "too-heavy-to-lift-alone", label: "too heavy to lift alone" }, { id: "quick-to-cool-and-crack", label: "quick to cool and crack" }], correctId: "easy-to-bend-and-shape", coachWrong: "Test that meaning against the next sentence, the one about the horn and the hammer. Does it match what the iron does?" },
    },
    {
      id: "c-2-quench-clue-where",
      band: "core",
      difficulty: 2,
      prompt: "Where does the clue for quench live?",
      narration: { audio: `${Q}/c-2-quench-clue-where.mp3`, script: "Now say where a clue lives. Listen for the word quench near the end of page three. Its own sentence does not tell you what quenching does. Keep listening to the end, and then tap the place where the clue for quench lives. Here is page three. Shaping one horseshoe is laborious. The bar goes back into the fire six or seven times, and between each heat the smith hammers, checks the curve, and hammers again. Every smith has a story about quenching gone wrong. When the shape is right, the smith plunges the hot shoe into a bucket of water to quench it. The shoe is set aside, and the next bar goes into the coals. Here is the start of page four. In other words, quenching cools the iron in an instant, with a hiss and a cloud of steam." },
      hint: { audio: `${Q}/c-2-quench-clue-where-hint.mp3`, script: "The words in other words are the signal, and they sit at the top of a page." },
      explain: { audio: `${Q}/c-2-quench-clue-where-explain.mp3`, script: "The clue lives in the next paragraph. Page four opens with in other words, and it restates quench as cooling the iron in an instant." },
      interaction: { type: "choose", options: [{ id: "in-the-same-sentence", label: "in the same sentence" }, { id: "in-the-next-sentence", label: "in the next sentence" }, { id: "in-the-next-paragraph", label: "in the next paragraph" }, { id: "in-an-example-sentence", label: "in an example sentence" }], correctId: "in-the-next-paragraph", coachWrong: "Not there. Listen for the words in other words, and notice which page they open." },
    },
    {
      id: "c-3-sort-clue-or-mention",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Clue, or Just Mentions It?",
      narration: { audio: `${Q}/c-3-sort-clue-or-mention.mp3`, script: "Six groups of words from Iron and Fire are on your screen, and each one sits near a new word. If the words tell you what the word means, drag them to Clue. If they only use the word, or only sit near it, drag them to the other bucket, Just Mentions It. Here are the sentences they come from. It bends around the horn of the anvil, stretches under the hammer, and takes any shape the smith asks of it. Young helpers like the word malleable and use it for everything, even bread. Every smith has a story about quenching gone wrong. In other words, quenching cools the iron in an instant, with a hiss and a cloud of steam. A bar of iron straight from the cold shelf is unyielding. It will not bend under the hammer, no matter how hard the blow, and it may even crack. Visitors usually say sooty before they say hello." },
      hint: { audio: `${Q}/c-3-sort-clue-or-mention-hint.mp3`, script: "One question for each card. Does it tell the meaning, or does it only use the word?" },
      explain: { audio: `${Q}/c-3-sort-clue-or-mention-explain.mp3`, script: "Bends around the horn, cools the iron in an instant, and it will not bend each tell a meaning, so they are clues. Liking the word malleable, a story about quenching, and saying sooty before hello only use the words." },
      interaction: { type: "sort", buckets: ["Clue","Just Mentions It"], bucketAudio: { "Clue": `${Q}/b-clue.mp3`, "Just Mentions It": `${Q}/b-just-mentions-it.mp3` }, items: [{ label: "bends around the horn", bucket: "Clue" }, { label: "like the word malleable", bucket: "Just Mentions It" }, { label: "cools the iron in an instant", bucket: "Clue" }, { label: "a story about quenching", bucket: "Just Mentions It" }, { label: "it will not bend", bucket: "Clue" }, { label: "say sooty before hello", bucket: "Just Mentions It" }], coachWrong: "Ask one question about that card. Does it tell you what the word means, or does it only use the word?" },
    },
    {
      id: "c-4-sooty-two-pieces",
      band: "core",
      difficulty: 4,
      prompt: "Which two pieces together tell you what sooty means?",
      narration: { audio: `${Q}/c-4-sooty-two-pieces.mp3`, script: "The word is sooty, and its clue comes in two pieces that live in different sentences. Four pairs of words from the text are on your screen. Only one pair puts the two pieces together. Tap the pair that gives you the meaning of sooty. Here is page four. In other words, quenching cools the iron in an instant, with a hiss and a cloud of steam. It sets the shape and cools the shoe enough to handle. The whole shop is sooty. Black dust from the coals settles on every shelf. By noon a smith's hands and face are streaked with the same black. Visitors usually say sooty before they say hello." },
      hint: { audio: `${Q}/c-4-sooty-two-pieces-hint.mp3`, script: "Both pieces are about the same black stuff, one on the shelves and one on the smith." },
      explain: { audio: `${Q}/c-4-sooty-two-pieces-explain.mp3`, script: "The pair is black dust, streaked faces. Dust on every shelf and black streaks on hands and face together tell you that sooty means covered in black dust from the fire." },
      interaction: { type: "choose", options: [{ id: "black-dust-streaked-faces", label: "black dust, streaked faces" }, { id: "dull-red-bright-yellow", label: "dull red, bright yellow" }, { id: "hiss-cloud-of-steam", label: "hiss, cloud of steam" }, { id: "six-heats-checks-the-curve", label: "six heats, checks the curve" }], correctId: "black-dust-streaked-faces", coachWrong: "Those two pieces are in the text, and they are about something else. Find the pair where both pieces are about the shop being dirty." },
    },
    {
      id: "c-5-laborious-clue-kind",
      band: "core",
      difficulty: 5,
      prompt: "What kind of clue unlocked laborious?",
      narration: { audio: `${Q}/c-5-laborious-clue-kind.mp3`, script: "The word is laborious, and you can tell that it means slow, hard work. Now name the kind of clue that told you. Listen to the sentence with the word, and then the whole sentence after it, and tap the kind of clue the second sentence is. Here are the two sentences. Shaping one horseshoe is laborious. The bar goes back into the fire six or seven times, and between each heat the smith hammers, checks the curve, and hammers again." },
      hint: { audio: `${Q}/c-5-laborious-clue-kind-hint.mp3`, script: "A definition would say what laborious means outright. Check whether the second sentence does that, or does something else with the work." },
      explain: { audio: `${Q}/c-5-laborious-clue-kind-explain.mp3`, script: "It is an example. The second sentence shows laborious work happening, the bar going back in six or seven times, hammer, check, hammer again." },
      interaction: { type: "choose", options: [{ id: "a-definition", label: "a definition" }, { id: "an-example", label: "an example" }, { id: "a-restatement", label: "a restatement" }, { id: "a-contrast", label: "a contrast" }], correctId: "an-example", coachWrong: "Ask what the second sentence is doing. Does it say the meaning in plain words, point the other way, or show the work itself?" },
    },
    {
      id: "c-6-speak-unyielding",
      band: "core",
      difficulty: 6,
      prompt: "What does unyielding mean, and where does its clue live? Say both.",
      narration: { audio: `${Q}/c-6-speak-unyielding.mp3`, script: "Now you say the whole move out loud. The word is unyielding, from page one. Tap the mic. Say what unyielding means, and then say where its clue lives. Here are the sentences. A bar of iron straight from the cold shelf is unyielding. It will not bend under the hammer, no matter how hard the blow, and it may even crack." },
      hint: { audio: `${Q}/c-6-speak-unyielding-hint.mp3`, script: "The clue is about what the cold bar will not do, and count how far from the word it sits." },
      explain: { audio: `${Q}/c-6-speak-unyielding-explain.mp3`, script: "One way to say it goes like this. Unyielding means stiff, refusing to bend, and its clue lives in the next sentence, the one about the hammer and the crack." },
      interaction: { type: "speak", text: "stiff hard firm stubborn solid rigid unbending bend bends bending crack cracks cracking cold next sentence following after definition example tells later" },
    },
    {
      id: "h-1-cause-clue-dormant",
      band: "harder",
      difficulty: 1,
      prompt: "Use the cause as the clue. What does dormant mean?",
      narration: { audio: `${Q}/h-1-cause-clue-dormant.mp3`, script: "Here is a fifth grade tool. Sometimes the cause is the clue. Watch. The smith has worked since dawn without one break, so by evening the smith is spent. The cause, working since dawn without a break, tells me the effect. Spent means worn out, with no strength left. Now you. Listen for the word dormant, find the cause in the same sentence, and tap what dormant means. Here is the sentence from page five. Because the bellows have sat idle for an hour, the coals have gone dormant, and the last bar comes out as gray as it went in." },
      hint: { audio: `${Q}/h-1-cause-clue-dormant-hint.mp3`, script: "The bellows feed the fire. Ask what happens to a fire when nobody feeds it for an hour." },
      explain: { audio: `${Q}/h-1-cause-clue-dormant-explain.mp3`, script: "Dormant means not burning, gone quiet. The cause is the bellows sitting idle for an hour, so the coals stopped burning, and the gray bar proves it." },
      interaction: { type: "choose", options: [{ id: "not-burning-gone-quiet", label: "not burning, gone quiet" }, { id: "burning-hotter-than-ever", label: "burning hotter than ever" }, { id: "spread-across-the-floor", label: "spread across the floor" }, { id: "too-small-to-see", label: "too small to see" }], correctId: "not-burning-gone-quiet", coachWrong: "Follow the cause. The bellows sat idle for an hour. What would that do to the coals, and what does the gray bar tell you?" },
    },
    {
      id: "h-2-comparison-clue-radiant",
      band: "harder",
      difficulty: 2,
      prompt: "Use the comparison as the clue. What does radiant mean?",
      narration: { audio: `${Q}/h-2-comparison-clue-radiant.mp3`, script: "One more fifth grade tool. A comparison can be the clue. Watch. The new blade is as keen as a pin, and it splits a hair laid across its edge. A pin is sharp, so keen means sharp. Now you. Listen for the word radiant and the comparison right after it, and tap what radiant means. Here is the sentence. The morning's shoe is radiant when it leaves the anvil, like a low sun on the water, and then it cools to gray." },
      hint: { audio: `${Q}/h-2-comparison-clue-radiant-hint.mp3`, script: "The comparison is a low sun on the water. Think about what a low sun on water looks like." },
      explain: { audio: `${Q}/h-2-comparison-clue-radiant-explain.mp3`, script: "Radiant means glowing brightly. The shoe is compared to a low sun on the water, and a low sun on water blazes with light." },
      interaction: { type: "choose", options: [{ id: "glowing-brightly", label: "glowing brightly" }, { id: "shaped-like-a-circle", label: "shaped like a circle" }, { id: "heavy-and-wet", label: "heavy and wet" }, { id: "cold-and-gray", label: "cold and gray" }], correctId: "glowing-brightly", coachWrong: "Use the comparison. What does a low sun on the water do?" },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: So the smith banks the fire, hangs the hammer on its hook, and steps out into the cold.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of Iron and Fire is on your screen. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word So." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence closes the day. The fire is covered to keep it alive until morning, the hammer goes back on its hook, and the smith leaves the warm shop for the cold outside." },
      interaction: { type: "speak", text: "So the smith banks the fire hangs the hammer on its hook and steps out into the cold" },
    },
    {
      id: "h-4-speak-dormant-and-kind",
      band: "harder",
      difficulty: 4,
      prompt: "What does dormant mean, and what kind of clue told you? Say both.",
      narration: { audio: `${Q}/h-4-speak-dormant-and-kind.mp3`, script: "Last one, out loud. The word is dormant. Tap the mic. Say what dormant means, and then name the kind of clue that told you. Here is the sentence again. Because the bellows have sat idle for an hour, the coals have gone dormant, and the last bar comes out as gray as it went in." },
      hint: { audio: `${Q}/h-4-speak-dormant-and-kind-hint.mp3`, script: "The first word of the sentence names the kind of clue." },
      explain: { audio: `${Q}/h-4-speak-dormant-and-kind-explain.mp3`, script: "One way to say it goes like this. Dormant means not burning, quiet and cold, and the clue is a cause, the bellows sitting idle for an hour." },
      interaction: { type: "speak", text: "out cold dead asleep quiet unlit burning gone low dark gray cool cooled cause effect because reason result idle still sleeping resting stopped" },
    },
  ],
};
