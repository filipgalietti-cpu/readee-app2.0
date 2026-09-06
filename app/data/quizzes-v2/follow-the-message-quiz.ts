import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Follow the Message QUIZ (RL.3.2) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// "what lesson does this fable teach" at 3 options, four fresh two-to-four
// sentence mini fables with picture support on three) / core(on-grade G3 on
// an ALL-FRESH second tale, "Why the Kingfisher Waits": message, which detail
// shows it, recount order, because-why, which detail shows the change,
// production speak) / harder(G4 transfer RL.4.2: THEME as the one-word big
// idea the whole story is about, TAUGHT in h-1 with a modeled example before
// it is asked, then applied to the kingfisher tale, a fresh mini tale, and a
// production speak). The kingfisher tale is spoken page by page INSIDE the
// questions so every Q is self-contained; nothing from the lesson tale
// (Juno, Hollis, pelicans, the bay) is reused. Names + animals grep-swept vs
// lessons-v2 + quizzes-v2: Bristle, Sorrel, kingfisher, Tam, Greta, Bex, Dova,
// Quill, badger, marmot, sandpiper, hedgehog, mole all fresh (0 hits).
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/follow-the-message-quiz";
const IMG = (w: string) => `/images/lessons-v2/follow-the-message/${w.toLowerCase()}.png`;

export const followTheMessageQuiz: QuizDef = {
  id: "follow-the-message-quiz",
  lessonId: "follow-the-message",
  title: "Follow the Message Quiz",
  standard: "RL.3.2",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-badger-lesson",
      band: "easier",
      difficulty: 1,
      prompt: "What lesson does this fable teach?",
      image: IMG("quiz-badger-den"),
      narration: { audio: `${Q}/e-1-badger-lesson.mp3`, script: "Here is a short fable. Tam the badger dug his den in soft sand, because sand was easy to dig. The first rain washed the den flat. Tam dug his next den in hard clay, and it lasted all winter. What lesson does this fable teach? Tap it." },
      hint: { audio: `${Q}/e-1-badger-lesson-hint.mp3`, script: "Think about which den was easy to dig, and which den lasted." },
      explain: { audio: `${Q}/e-1-badger-lesson-explain.mp3`, script: "The easy way may not last. The sand den was easy, but the rain washed it flat. The clay den took more work, and it lasted all winter." },
      interaction: { type: "choose", options: [{ id: "the-easy-way-may-not-last", label: "the easy way may not last" }, { id: "rain-is-bad-for-badgers", label: "rain is bad for badgers" }, { id: "sand-is-softer-than-clay", label: "sand is softer than clay" }], correctId: "the-easy-way-may-not-last", coachWrong: "That is a fact from the fable, not its lesson. What did Tam learn about easy and hard?" },
    },
    {
      id: "e-2-marmot-lesson",
      band: "easier",
      difficulty: 2,
      prompt: "What lesson does this fable teach?",
      image: IMG("quiz-marmot-whistle"),
      narration: { audio: `${Q}/e-2-marmot-lesson.mp3`, script: "Here is another short fable. Greta the marmot heard her mother whistle the danger call, but she wanted one more bite of grass. The shadow of a hawk crossed the meadow, and Greta barely reached the burrow in time. After that day, Greta dropped her food and ran at the very first whistle. What lesson does this fable teach? Tap it." },
      hint: { audio: `${Q}/e-2-marmot-lesson-hint.mp3`, script: "Think about what Greta did differently after the hawk came." },
      explain: { audio: `${Q}/e-2-marmot-lesson-explain.mp3`, script: "Act on a warning right away. Greta waited for one more bite and nearly got caught, so after that she ran at the first whistle." },
      interaction: { type: "choose", options: [{ id: "act-on-a-warning-right-away", label: "act on a warning right away" }, { id: "hawks-hunt-in-the-meadow", label: "hawks hunt in the meadow" }, { id: "marmots-love-to-eat-grass", label: "marmots love to eat grass" }], correctId: "act-on-a-warning-right-away", coachWrong: "That is true in the fable, but it is not the lesson. What did Greta do at the end, and why?" },
    },
    {
      id: "e-3-sandpiper-lesson",
      band: "easier",
      difficulty: 3,
      prompt: "What lesson does this fable teach?",
      image: IMG("quiz-sandpiper-nest"),
      narration: { audio: `${Q}/e-3-sandpiper-lesson.mp3`, script: "One more short fable. An old gull told Bex the sandpiper that the tide climbs high in spring. Bex built her nest close to the waves anyway, because the sand there was smooth. The high tide swept her nest away. The next spring, Bex built her nest where the gull had pointed, high in the dune grass. What lesson does this fable teach? Tap it." },
      hint: { audio: `${Q}/e-3-sandpiper-lesson-hint.mp3`, script: "Think about what the gull said, and where Bex built her nest the second time." },
      explain: { audio: `${Q}/e-3-sandpiper-lesson-explain.mp3`, script: "Take good advice. The gull warned Bex about the tide, and when she finally built where the gull had pointed, her nest was safe." },
      interaction: { type: "choose", options: [{ id: "take-good-advice", label: "take good advice" }, { id: "smooth-sand-is-the-best", label: "smooth sand is the best" }, { id: "spring-tides-are-cold", label: "spring tides are cold" }], correctId: "take-good-advice", coachWrong: "The fable never showed that. Think about who was right about the tide, and what Bex did next spring." },
    },
    {
      id: "e-4-mole-lesson",
      band: "easier",
      difficulty: 4,
      prompt: "What lesson does this fable teach?",
      narration: { audio: `${Q}/e-4-mole-lesson.mp3`, script: "Listen to a fable with no picture. Dova the mole knocked over her neighbor's woodpile and ran home. All night she could not sleep. In the morning she went back, told the truth, and stacked every log, and that night she slept well. What lesson does this fable teach? Tap it." },
      hint: { audio: `${Q}/e-4-mole-lesson-hint.mp3`, script: "Compare the two nights. What was different about the second one?" },
      explain: { audio: `${Q}/e-4-mole-lesson-explain.mp3`, script: "The truth lets you rest easy. Dova could not sleep while she hid what she did, and she slept well once she told the truth." },
      interaction: { type: "choose", options: [{ id: "the-truth-lets-you-rest-easy", label: "the truth lets you rest easy" }, { id: "moles-do-not-need-much-sleep", label: "moles do not need much sleep" }, { id: "never-touch-a-woodpile", label: "never touch a woodpile" }], correctId: "the-truth-lets-you-rest-easy", coachWrong: "The fable does not show that. Think about why Dova could not sleep, and what changed." },
    },
    {
      id: "c-1-kingfisher-message",
      band: "core",
      difficulty: 1,
      prompt: "What message does the tale teach?",
      narration: { audio: `${Q}/c-1-kingfisher-message.mp3`, script: "Here is a new tale called Why the Kingfisher Waits. Long ago, a young kingfisher named Bristle dove at every ripple on the stream, and he came up with nothing but water in his beak. An old kingfisher named Sorrel sat still on a low branch above the same stream, watching the water for a long, quiet minute. Then she dove once, and she rose with a silver fish. You dove twenty times and caught nothing, said Sorrel. Sit with me, and watch before you dive. Bristle hated sitting still, but he folded his wings and waited. Under the ripples he saw a flash of silver turn toward the bank. He dove once, and this time he came up with a fish. One good look is worth twenty dives, Bristle said, and that is why, to this day, a kingfisher sits still on its branch and watches the water before it dives. The tale never prints its lesson. What message does it teach? Tap the message the details support." },
      hint: { audio: `${Q}/c-1-kingfisher-message-hint.mp3`, script: "Test each choice against the details. What did Bristle do differently the second time, and what came of it?" },
      explain: { audio: `${Q}/c-1-kingfisher-message-explain.mp3`, script: "Watch before you act. Bristle dove at every ripple and caught nothing, then he waited and watched, dove once, and caught a fish." },
      interaction: { type: "choose", options: [{ id: "watch-before-you-act", label: "watch before you act" }, { id: "old-birds-catch-more-fish", label: "old birds catch more fish" }, { id: "diving-more-brings-more-fish", label: "diving more brings more fish" }, { id: "never-dive-into-a-stream", label: "never dive into a stream" }], correctId: "watch-before-you-act", coachWrong: "Check that against the details. Bristle dove twenty times and caught nothing, and at the end he still dove. Which idea does every page support?" },
    },
    {
      id: "c-2-detail-shows-message",
      band: "core",
      difficulty: 2,
      prompt: "Which detail shows the message, watch before you act?",
      narration: { audio: `${Q}/c-2-detail-shows-message.mp3`, script: "The message of Why the Kingfisher Waits is, watch before you act. Now point to a detail that shows it. Listen to two pages. Long ago, a young kingfisher named Bristle dove at every ripple on the stream, and he came up with nothing but water in his beak. Later, Bristle hated sitting still, but he folded his wings and waited. Under the ripples he saw a flash of silver turn toward the bank. He dove once, and this time he came up with a fish. All four details on your screen are real. Tap the one that shows the message." },
      hint: { audio: `${Q}/c-2-detail-shows-message-hint.mp3`, script: "The message is about watching first. Which detail shows Bristle actually doing that?" },
      explain: { audio: `${Q}/c-2-detail-shows-message-explain.mp3`, script: "The detail is, folded his wings and waited. That is Bristle watching before he acts, and right after it he caught his fish." },
      interaction: { type: "choose", options: [{ id: "folded-his-wings-and-waited", label: "folded his wings and waited" }, { id: "nothing-but-water", label: "nothing but water" }, { id: "hated-sitting-still", label: "hated sitting still" }, { id: "a-flash-of-silver", label: "a flash of silver" }], correctId: "folded-his-wings-and-waited", coachWrong: "That detail is in the tale, but it shows what Bristle saw or how he felt. Which detail shows him watching before he acts?" },
    },
    {
      id: "c-3-recount-order",
      band: "core",
      difficulty: 3,
      prompt: "Recount the tale. Put the events in order.",
      narration: { audio: `${Q}/c-3-recount-order.mp3`, script: "Now recount Why the Kingfisher Waits. Listen to the whole tale once more. Bristle dove at every ripple and came up with nothing but water. Sorrel sat still on her branch, watched for a long, quiet minute, and rose with a silver fish. She told Bristle to sit with her and watch before he dove. Bristle folded his wings, waited, saw a flash of silver, dove once, and came up with a fish. Now put the four events on your screen in the order they happened." },
      hint: { audio: `${Q}/c-3-recount-order-hint.mp3`, script: "Start with what Bristle did first, before Sorrel said a word. Then think about what Sorrel did, and what Bristle did after her advice." },
      explain: { audio: `${Q}/c-3-recount-order-explain.mp3`, script: "First, Bristle dove and missed. Next, Sorrel caught a fish. Then Bristle waited and watched. Last, Bristle caught a fish." },
      interaction: { type: "sequence", items: [{ id: "bristle-dives-and-misses", label: "bristle dives and misses" }, { id: "sorrel-catches-a-fish", label: "sorrel catches a fish" }, { id: "bristle-waits-and-watches", label: "bristle waits and watches" }, { id: "bristle-catches-a-fish", label: "bristle catches a fish" }], order: ["bristle-dives-and-misses","sorrel-catches-a-fish","bristle-waits-and-watches","bristle-catches-a-fish"], coachWrong: "Think about the order on the pages. Who caught a fish first, Sorrel or Bristle? What did Bristle do right before he caught his?" },
    },
    {
      id: "c-4-why-nothing-but-water",
      band: "core",
      difficulty: 4,
      prompt: "Why did Bristle catch nothing at first?",
      narration: { audio: `${Q}/c-4-why-nothing-but-water.mp3`, script: "Listen to the first two pages again. Long ago, a young kingfisher named Bristle dove at every ripple on the stream, and he came up with nothing but water in his beak. An old kingfisher named Sorrel sat still on a low branch above the same stream, watching the water for a long, quiet minute. Then she dove once, and she rose with a silver fish. Why did Bristle catch nothing at first? Tap the reason the tale supports." },
      hint: { audio: `${Q}/c-4-why-nothing-but-water-hint.mp3`, script: "Compare what Bristle did with what Sorrel did. Sorrel caught a fish in the same stream, so the stream is not the problem." },
      explain: { audio: `${Q}/c-4-why-nothing-but-water-explain.mp3`, script: "He dove at every ripple. He never watched first, so he dove at ripples that had no fish under them, while Sorrel watched and dove only once." },
      interaction: { type: "choose", options: [{ id: "he-dove-at-every-ripple", label: "he dove at every ripple" }, { id: "the-stream-had-no-fish", label: "the stream had no fish" }, { id: "sorrel-scared-the-fish-away", label: "sorrel scared the fish away" }, { id: "his-beak-was-too-short", label: "his beak was too short" }], correctId: "he-dove-at-every-ripple", coachWrong: "The tale does not say that. Sorrel caught a fish in the same stream. What was Bristle doing differently?" },
    },
    {
      id: "c-5-detail-shows-change",
      band: "core",
      difficulty: 5,
      prompt: "Which detail shows that Bristle changed?",
      narration: { audio: `${Q}/c-5-detail-shows-change.mp3`, script: "A tale often shows its message through a character who changes. Listen to how Bristle started and how the tale ends. Long ago, a young kingfisher named Bristle dove at every ripple on the stream, and he came up with nothing but water in his beak. Bristle hated sitting still. At the end, one good look is worth twenty dives, Bristle said, and that is why, to this day, a kingfisher sits still on its branch and watches the water before it dives. Which detail shows that Bristle changed? Tap it." },
      hint: { audio: `${Q}/c-5-detail-shows-change-hint.mp3`, script: "Three of these show the old Bristle. Find the one that shows what he believes at the end." },
      explain: { audio: `${Q}/c-5-detail-shows-change-explain.mp3`, script: "The detail is, one good look. Bristle started out diving at every ripple, and by the end he says one good look is worth twenty dives. That is the change." },
      interaction: { type: "choose", options: [{ id: "one-good-look", label: "one good look" }, { id: "dove-at-every-ripple", label: "dove at every ripple" }, { id: "nothing-but-water", label: "nothing but water" }, { id: "hated-sitting-still", label: "hated sitting still" }], correctId: "one-good-look", coachWrong: "That detail shows the old Bristle, at the start. Which words come from the end of the tale, after he learned?" },
    },
    {
      id: "c-6-speak-message-and-detail",
      band: "core",
      difficulty: 6,
      prompt: "Say the message of the tale, then one detail that shows it.",
      narration: { audio: `${Q}/c-6-speak-message-and-detail.mp3`, script: "Now say it out loud. Here is the tale in short. Bristle dove at every ripple and caught nothing. Sorrel sat still, watched the water, and dove once for a silver fish. Bristle folded his wings, waited, saw a flash of silver, and caught a fish with one dive. Tap the mic. Say the message of Why the Kingfisher Waits in your own words, then say one detail from the tale that shows it." },
      hint: { audio: `${Q}/c-6-speak-message-and-detail-hint.mp3`, script: "Start with what Bristle learned to do before he dove. Then name one thing he did that shows it." },
      explain: { audio: `${Q}/c-6-speak-message-and-detail-explain.mp3`, script: "The message is, watch before you act. A detail that shows it is that Bristle folded his wings and waited, and then he caught a fish with one dive." },
      interaction: { type: "speak", text: "watch watching watched wait waited waiting look looking looked still sit sat patient patience first before act dive dove dives fish branch minute silver flash calm slow think" },
    },
    {
      id: "h-1-theme-taught",
      band: "harder",
      difficulty: 1,
      prompt: "What is the theme of Why the Kingfisher Waits?",
      narration: { audio: `${Q}/h-1-theme-taught.mp3`, script: "Here is a fourth grade step. A moral is a sentence of advice. A theme is bigger and shorter: the one big idea the whole story is about, usually a single word, like honesty or courage. Watch me. A boy told his teacher that he broke the window, even though nobody saw him do it. The moral is, tell the truth even when it is hard. The theme, the one word the whole story is about, is honesty. Now you. Bristle dove at every ripple and caught nothing, then he learned to sit still and watch before he dove. What is the theme of Why the Kingfisher Waits? Tap the one word." },
      hint: { audio: `${Q}/h-1-theme-taught-hint.mp3`, script: "The theme is the big idea behind the whole tale, not one event in it. What did Bristle have to learn to do?" },
      explain: { audio: `${Q}/h-1-theme-taught-explain.mp3`, script: "The theme is patience. The whole tale is about learning to sit still and watch before acting, and patience is the one word for that." },
      interaction: { type: "choose", options: [{ id: "patience", label: "patience" }, { id: "speed", label: "speed" }, { id: "friendship", label: "friendship" }, { id: "hunger", label: "hunger" }], correctId: "patience", coachWrong: "The tale mentions that, but the whole story is not about it. What did Bristle learn to do before he dove?" },
    },
    {
      id: "h-2-detail-shows-theme",
      band: "harder",
      difficulty: 2,
      prompt: "Which detail best shows the theme of patience?",
      narration: { audio: `${Q}/h-2-detail-shows-theme.mp3`, script: "A theme is carried by details, just like a message. The theme of Why the Kingfisher Waits is patience. Listen to two pages. An old kingfisher named Sorrel sat still on a low branch above the same stream, watching the water for a long, quiet minute. Then she dove once, and she rose with a silver fish. Later, under the ripples Bristle saw a flash of silver turn toward the bank. Which detail best shows the theme of patience? Tap it." },
      hint: { audio: `${Q}/h-2-detail-shows-theme-hint.mp3`, script: "Patience is about waiting. Which detail is about time passing while a bird waits?" },
      explain: { audio: `${Q}/h-2-detail-shows-theme-explain.mp3`, script: "The detail is, a long, quiet minute. Sorrel watched the water for a whole minute before she dove, and that waiting is patience." },
      interaction: { type: "choose", options: [{ id: "a-long-quiet-minute", label: "a long, quiet minute" }, { id: "a-silver-fish", label: "a silver fish" }, { id: "a-flash-of-silver", label: "a flash of silver" }, { id: "toward-the-bank", label: "toward the bank" }], correctId: "a-long-quiet-minute", coachWrong: "That detail is about the fish, not about waiting. Which detail shows time passing while a bird holds still?" },
    },
    {
      id: "h-3-new-tale-theme",
      band: "harder",
      difficulty: 3,
      prompt: "What is the theme of this tale?",
      narration: { audio: `${Q}/h-3-new-tale-theme.mp3`, script: "Here is a new short tale, and you find its theme. Quill the hedgehog was afraid of the dark, rushing stream, and he never went near the water. One evening a baby hedgehog slipped off the bank into the current. Quill was shaking, but he jumped in anyway and pushed the baby to the shore. What is the theme of this tale, the one big idea it is about? Tap it." },
      hint: { audio: `${Q}/h-3-new-tale-theme-hint.mp3`, script: "Quill was afraid, and he did something anyway. What is the one word for that?" },
      explain: { audio: `${Q}/h-3-new-tale-theme-explain.mp3`, script: "The theme is courage. Quill was afraid of the stream, and he jumped in anyway to save the baby. Doing the hard thing while afraid is courage." },
      interaction: { type: "choose", options: [{ id: "courage", label: "courage" }, { id: "swimming", label: "swimming" }, { id: "darkness", label: "darkness" }, { id: "hunger", label: "hunger" }], correctId: "courage", coachWrong: "The tale mentions that, but it is not the big idea. Think about what Quill did while he was still afraid." },
    },
    {
      id: "h-4-speak-theme-and-moral",
      band: "harder",
      difficulty: 4,
      prompt: "Say the theme in one word, then say the moral as a sentence.",
      narration: { audio: `${Q}/h-4-speak-theme-and-moral.mp3`, script: "Last one, out loud. Think about Why the Kingfisher Waits. Bristle dove at every ripple and caught nothing, then he learned to sit still and watch before he dove, and one look was worth twenty dives. Tap the mic. Say the theme of the tale in one word, then say the moral as a full sentence of advice." },
      hint: { audio: `${Q}/h-4-speak-theme-and-moral-hint.mp3`, script: "The theme is the one word for learning to wait. The moral is the advice Sorrel gave to Bristle about diving." },
      explain: { audio: `${Q}/h-4-speak-theme-and-moral-explain.mp3`, script: "The theme is patience. The moral is, watch before you act, or in Sorrel's words, watch before you dive." },
      interaction: { type: "speak", text: "patience patient wait waiting waited watch watching watched look looking still calm slow careful think before first act dive dove" },
    },
  ],
};
