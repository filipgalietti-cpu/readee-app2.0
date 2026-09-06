import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Show Me Where QUIZ (RL.3.1) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// who/what/where/when at 3 options w/ picture support) / core(on-grade G3:
// find-the-proof, right-there why, put-together, proven-vs-guess, production
// speak) / harder(G4 transfer RL.4.1: "the text says X, so I can tell Y",
// an inference backed by a quoted line, MODELED first in h-1 then applied).
// ALL-FRESH second story, "The Sour String" (Jonah, Mr. Abara, a snapped
// violin string that sounds sour for a day), spoken page by page INSIDE the
// questions so every Q is self-contained; nothing from the lesson story
// (Amara/Farah/Pine Street) is reused. Names + setting grep-swept vs
// lessons-v2 + quizzes-v2: Jonah, Abara, violin, tin box fresh (0 hits).
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/show-me-where-quiz";
const IMG = (w: string) => `/images/lessons-v2/show-me-where/${w.toLowerCase()}.png`;

export const showMeWhereQuiz: QuizDef = {
  id: "show-me-where-quiz",
  lessonId: "show-me-where",
  title: "Show Me Where Quiz",
  standard: "RL.3.1",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-who-practiced",
      band: "easier",
      difficulty: 1,
      prompt: "Who practiced the violin every night?",
      image: IMG("quiz-violin-practice"),
      narration: { audio: `${Q}/e-1-who-practiced.mp3`, script: "Here is page one of a new story called The Sour String. Jonah practiced his violin every night after dinner, because the spring recital was only two weeks away. Who practiced the violin every night? Tap the answer." },
      hint: { audio: `${Q}/e-1-who-practiced-hint.mp3`, script: "Listen for the name at the very start of the page. The story says who right away." },
      explain: { audio: `${Q}/e-1-who-practiced-explain.mp3`, script: "The story says, Jonah practiced his violin every night after dinner. Jonah is the one who practiced." },
      interaction: { type: "choose", options: [{ id: "jonah", label: "jonah" }, { id: "his-teacher", label: "his teacher" }, { id: "his-sister", label: "his sister" }], correctId: "jonah", coachWrong: "Think about the name the page began with." },
    },
    {
      id: "e-2-what-snapped",
      band: "easier",
      difficulty: 2,
      prompt: "What snapped in the middle of the song?",
      image: IMG("quiz-snapped-string"),
      narration: { audio: `${Q}/e-2-what-snapped.mp3`, script: "Page two. On Monday, the thinnest string snapped right in the middle of his favorite song. What snapped in the middle of the song? Tap it." },
      hint: { audio: `${Q}/e-2-what-snapped-hint.mp3`, script: "The picture shows it too. Look at the violin and find the part that broke." },
      explain: { audio: `${Q}/e-2-what-snapped-explain.mp3`, script: "The story says, the thinnest string snapped right in the middle of his favorite song. The thinnest string is what snapped." },
      interaction: { type: "choose", options: [{ id: "the-thinnest-string", label: "the thinnest string" }, { id: "the-wooden-bow", label: "the wooden bow" }, { id: "the-music-stand", label: "the music stand" }], correctId: "the-thinnest-string", coachWrong: "Look at the violin in the picture. Which part is curling loose?" },
    },
    {
      id: "e-3-where-strings",
      band: "easier",
      difficulty: 3,
      prompt: "Where did Mr. Abara keep spare strings?",
      image: IMG("quiz-tin-box"),
      narration: { audio: `${Q}/e-3-where-strings.mp3`, script: "Page three. His teacher, Mr. Abara, kept spare strings in a small tin box on his desk. Where did Mr. Abara keep spare strings? Tap the answer." },
      hint: { audio: `${Q}/e-3-where-strings-hint.mp3`, script: "A where question asks about a place. Listen for the place the strings were kept." },
      explain: { audio: `${Q}/e-3-where-strings-explain.mp3`, script: "The story says, Mr. Abara kept spare strings in a small tin box on his desk. In a small tin box is the answer." },
      interaction: { type: "choose", options: [{ id: "in-a-small-tin-box", label: "in a small tin box" }, { id: "in-his-coat-pocket", label: "in his coat pocket" }, { id: "in-the-piano-bench", label: "in the piano bench" }], correctId: "in-a-small-tin-box", coachWrong: "Where questions ask about a place. Which place did the page name?" },
    },
    {
      id: "e-4-when-clear",
      band: "easier",
      difficulty: 4,
      prompt: "When did the new string sound clear and bright?",
      narration: { audio: `${Q}/e-4-when-clear.mp3`, script: "Listen to two pages. Jonah wound the new string onto his violin, played one scale, and groaned at the sour sound. On Tuesday, the new string sang out clear and bright. When did the new string sound clear and bright? Tap the day." },
      hint: { audio: `${Q}/e-4-when-clear-hint.mp3`, script: "A when question asks about time. Listen for the day named right before clear and bright." },
      explain: { audio: `${Q}/e-4-when-clear-explain.mp3`, script: "The story says, On Tuesday, the new string sang out clear and bright. Tuesday is the day." },
      interaction: { type: "choose", options: [{ id: "on-tuesday", label: "on tuesday" }, { id: "on-monday", label: "on monday" }, { id: "on-saturday", label: "on saturday" }], correctId: "on-tuesday", coachWrong: "When questions ask about time. Which day did the page name?" },
    },
    {
      id: "c-1-proof-recital-soon",
      band: "core",
      difficulty: 1,
      prompt: "Which line proves the recital was coming soon?",
      narration: { audio: `${Q}/c-1-proof-recital-soon.mp3`, script: "Now you point to the line. Listen to page one and page two. Jonah practiced his violin every night after dinner, because the spring recital was only two weeks away. On Monday, the thinnest string snapped right in the middle of his favorite song. Here is the answer: the recital was coming soon. Now tap the line that proves it." },
      hint: { audio: `${Q}/c-1-proof-recital-soon-hint.mp3`, script: "The proof has to tell you how close the recital was. Read each line and ask, does this one tell me that?" },
      explain: { audio: `${Q}/c-1-proof-recital-soon-explain.mp3`, script: "The line is, only two weeks away. That is the line that proves the recital was coming soon." },
      interaction: { type: "choose", options: [{ id: "only-two-weeks-away", label: "only two weeks away" }, { id: "every-night-after-dinner", label: "every night after dinner" }, { id: "the-thinnest-string-snapped", label: "the thinnest string snapped" }, { id: "his-favorite-song", label: "his favorite song" }], correctId: "only-two-weeks-away", coachWrong: "That line is really in the story, but it does not tell how close the recital was. Read the lines again." },
    },
    {
      id: "c-2-why-practice",
      band: "core",
      difficulty: 2,
      prompt: "Why did Jonah practice every night?",
      narration: { audio: `${Q}/c-2-why-practice.mp3`, script: "Listen to page one again. Jonah practiced his violin every night after dinner, because the spring recital was only two weeks away. Why did Jonah practice every night? Tap the answer you can point to." },
      hint: { audio: `${Q}/c-2-why-practice-hint.mp3`, script: "The word because points right at the reason. Listen for what comes after it." },
      explain: { audio: `${Q}/c-2-why-practice-explain.mp3`, script: "The story says, because the spring recital was only two weeks away. The recital was close, so he practiced every night." },
      interaction: { type: "choose", options: [{ id: "the-recital-was-close", label: "the recital was close" }, { id: "his-teacher-made-him", label: "his teacher made him" }, { id: "he-loved-the-song", label: "he loved the song" }, { id: "his-string-was-new", label: "his string was new" }], correctId: "the-recital-was-close", coachWrong: "That sounds possible, but can you point to a line? Listen for the word because." },
    },
    {
      id: "c-3-proof-sour-sound",
      band: "core",
      difficulty: 3,
      prompt: "Which line proves the new string sounded bad at first?",
      narration: { audio: `${Q}/c-3-proof-sour-sound.mp3`, script: "Listen to page four and page five. A new string sounds sour for a day, said Mr. Abara, so do not judge it until tomorrow. Jonah wound the new string onto his violin, played one scale, and groaned at the sour sound. Here is the answer: the new string sounded bad at first. Tap the line that proves it." },
      hint: { audio: `${Q}/c-3-proof-sour-sound-hint.mp3`, script: "You need the line that tells what Jonah heard when he played. What did he do at the sound?" },
      explain: { audio: `${Q}/c-3-proof-sour-sound-explain.mp3`, script: "The line is, groaned at the sour sound. Jonah groaned, so the string sounded bad at first." },
      interaction: { type: "choose", options: [{ id: "groaned-at-the-sour-sound", label: "groaned at the sour sound" }, { id: "wound-the-new-string-onto", label: "wound the new string onto" }, { id: "played-one-scale", label: "played one scale" }, { id: "do-not-judge-it", label: "do not judge it" }], correctId: "groaned-at-the-sour-sound", coachWrong: "That line is in the story, but it does not tell how the string sounded. Find the line about the sound." },
    },
    {
      id: "c-4-put-together-why-sour",
      band: "core",
      difficulty: 4,
      prompt: "Why did the string sound sour on Monday? Put two lines together.",
      narration: { audio: `${Q}/c-4-put-together-why-sour.mp3`, script: "This one takes two lines. Mr. Abara said, a new string sounds sour for a day, so do not judge it until tomorrow. Then, Jonah wound the new string onto his violin, played one scale, and groaned at the sour sound. Put those two lines together. Why did the string sound sour on Monday? Tap the answer." },
      hint: { audio: `${Q}/c-4-put-together-why-sour-hint.mp3`, script: "Line one gives a rule about new strings. Line two tells what Jonah put on his violin. Put the rule and the fact together." },
      explain: { audio: `${Q}/c-4-put-together-why-sour-explain.mp3`, script: "The string was brand new. Mr. Abara said a new string sounds sour for a day, and Jonah had just wound a new string on, so it sounded sour." },
      interaction: { type: "choose", options: [{ id: "it-was-brand-new", label: "it was brand new" }, { id: "jonah-played-it-too-fast", label: "jonah played it too fast" }, { id: "it-was-the-wrong-size", label: "it was the wrong size" }, { id: "the-room-was-too-cold", label: "the room was too cold" }], correctId: "it-was-brand-new", coachWrong: "The story never says that. Use the rule Mr. Abara gave, and think about what kind of string Jonah put on." },
    },
    {
      id: "c-5-story-does-not-say",
      band: "core",
      difficulty: 5,
      prompt: "Why did the string snap?",
      narration: { audio: `${Q}/c-5-story-does-not-say.mp3`, script: "Listen to page two one more time. On Monday, the thinnest string snapped right in the middle of his favorite song. Now the question. Why did the string snap? Before you tap, hunt for a line that says so." },
      hint: { audio: `${Q}/c-5-story-does-not-say-hint.mp3`, script: "Hunt through the page for a line that gives a reason. If you cannot find one, you know what the honest answer is." },
      explain: { audio: `${Q}/c-5-story-does-not-say-explain.mp3`, script: "The story does not say. Page two tells that the string snapped, but no line tells why. An answer with no line is a guess." },
      interaction: { type: "choose", options: [{ id: "the-story-does-not-say", label: "the story does not say" }, { id: "jonah-played-too-hard", label: "jonah played too hard" }, { id: "the-string-was-very-old", label: "the string was very old" }, { id: "the-room-was-too-hot", label: "the room was too hot" }], correctId: "the-story-does-not-say", coachWrong: "That sounds possible, but which line says it? If no line does, it is a guess." },
    },
    {
      id: "c-6-speak-recital",
      band: "core",
      difficulty: 6,
      prompt: "What did Jonah do at the recital? Answer, then say the proving line.",
      narration: { audio: `${Q}/c-6-speak-recital.mp3`, script: "Now say both halves out loud. Here is the last page. At the recital, Jonah played the whole song without a single mistake, and Mr. Abara clapped the loudest. What did Jonah do at the recital? Tap the mic. Say your answer, then say the line from the story that proves it." },
      hint: { audio: `${Q}/c-6-speak-recital-hint.mp3`, script: "Start with what Jonah played, then say the whole line from the last page as your proof." },
      explain: { audio: `${Q}/c-6-speak-recital-explain.mp3`, script: "Jonah played the whole song without a single mistake. That is the line, and it is the proof." },
      interaction: { type: "speak", text: "played play whole song without single mistake mistakes perfectly perfect clean violin clapped loudest teacher entire errors" },
    },
    {
      id: "h-1-what-can-you-tell",
      band: "harder",
      difficulty: 1,
      prompt: "What can you tell about Jonah from that line?",
      narration: { audio: `${Q}/h-1-what-can-you-tell.mp3`, script: "Here is a fourth grade step. Readers use a line to figure out something the story never says outright, and they still point to the line. Watch me. The story says Jonah practiced his violin every night after dinner. It never says he cared about the recital, but that line lets me tell he took it seriously. Now you. The story says, he wanted to quit for the night, but he remembered what Mr. Abara had said, so he kept going. What can you tell about Jonah from that line? Tap it." },
      hint: { audio: `${Q}/h-1-what-can-you-tell-hint.mp3`, script: "Look at why he kept going. Whose words did he remember, and what does that show?" },
      explain: { audio: `${Q}/h-1-what-can-you-tell-explain.mp3`, script: "You can tell he trusts his teacher. The line says he remembered what Mr. Abara had said and kept going, so Mr. Abara's words mattered to him." },
      interaction: { type: "choose", options: [{ id: "he-trusts-his-teacher", label: "he trusts his teacher" }, { id: "he-dislikes-the-violin", label: "he dislikes the violin" }, { id: "he-wants-a-new-violin", label: "he wants a new violin" }, { id: "he-forgot-the-recital", label: "he forgot the recital" }], correctId: "he-trusts-his-teacher", coachWrong: "The line does not show that. Think about why he kept going, and what that says about him." },
    },
    {
      id: "h-2-line-backs-idea",
      band: "harder",
      difficulty: 2,
      prompt: "Which line backs up the idea that Mr. Abara was ready for trouble?",
      narration: { audio: `${Q}/h-2-line-backs-idea.mp3`, script: "When you tell what you figured out, you still point to a line. Listen to page two and page three. On Monday, the thinnest string snapped right in the middle of his favorite song. His teacher, Mr. Abara, kept spare strings in a small tin box on his desk. I can tell that Mr. Abara was ready for trouble. Which line backs that up? Tap it." },
      hint: { audio: `${Q}/h-2-line-backs-idea-hint.mp3`, script: "Ready for trouble means he had something waiting before the trouble came. Which line shows that?" },
      explain: { audio: `${Q}/h-2-line-backs-idea-explain.mp3`, script: "The line is, kept spare strings. Mr. Abara had extra strings waiting in a tin box before any string broke, so he was ready for trouble." },
      interaction: { type: "choose", options: [{ id: "kept-spare-strings", label: "kept spare strings" }, { id: "the-thinnest-string-snapped", label: "the thinnest string snapped" }, { id: "his-favorite-song", label: "his favorite song" }, { id: "right-in-the-middle", label: "right in the middle" }], correctId: "kept-spare-strings", coachWrong: "That line tells about the trouble itself. Which line shows Mr. Abara was prepared before it happened?" },
    },
    {
      id: "h-3-put-together-tell",
      band: "harder",
      difficulty: 3,
      prompt: "What can you tell from those two lines?",
      narration: { audio: `${Q}/h-3-put-together-tell.mp3`, script: "Put two lines together, then tell what they show. Mr. Abara said, a new string sounds sour for a day, so do not judge it until tomorrow. Then the story says, on Tuesday, the new string sang out clear and bright. What can you tell from those two lines? Tap it." },
      hint: { audio: `${Q}/h-3-put-together-tell-hint.mp3`, script: "Mr. Abara made a prediction on Monday. Check what happened on Tuesday, and compare." },
      explain: { audio: `${Q}/h-3-put-together-tell-explain.mp3`, script: "You can tell his teacher was right. Mr. Abara said the string would sound better after a day, and on Tuesday it sang out clear and bright." },
      interaction: { type: "choose", options: [{ id: "his-teacher-was-right", label: "his teacher was right" }, { id: "jonah-bought-a-new-violin", label: "jonah bought a new violin" }, { id: "the-string-snapped-again", label: "the string snapped again" }, { id: "the-recital-was-moved", label: "the recital was moved" }], correctId: "his-teacher-was-right", coachWrong: "Neither line says that. Compare what Mr. Abara said on Monday with what happened on Tuesday." },
    },
    {
      id: "h-4-speak-tell-and-back",
      band: "harder",
      difficulty: 4,
      prompt: "What does the last page tell you about Jonah? Say it, then back it up.",
      narration: { audio: `${Q}/h-4-speak-tell-and-back.mp3`, script: "Last one, out loud. The last page says, at the recital, Jonah played the whole song without a single mistake, and Mr. Abara clapped the loudest. That line never says what kind of musician Jonah is, but it lets you tell. Tap the mic. Say what you can tell about Jonah, then say the words from the line that back you up." },
      hint: { audio: `${Q}/h-4-speak-tell-and-back-hint.mp3`, script: "Think about what playing a whole song with no mistakes shows about a person. Then say the words that show it." },
      explain: { audio: `${Q}/h-4-speak-tell-and-back-explain.mp3`, script: "You can tell Jonah was ready and worked hard. The line says he played the whole song without a single mistake, and that backs it up." },
      interaction: { type: "speak", text: "practiced practice hard ready prepared worked skilled good great talented proud confident calm careful brave improved better mistake whole song without played clapped loudest" },
    },
  ],
};
