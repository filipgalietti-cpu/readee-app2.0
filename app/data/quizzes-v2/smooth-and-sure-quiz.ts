import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Smooth and Sure QUIZ (RF.3.4) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// one-sentence reads with picture support, which-mark-moves-your-voice at 3
// options, a listen-and-check) / core(on-grade G3: two-sentence accept-mode
// reads, an understanding check after a read, Talking Pace sort, a
// punctuation-to-voice choose, a production retell) / harder(G4 transfer
// RF.4.4b-adjacent: a short poem read with its line breaks and beat, MODELED
// in h-1 on lines one and two, then the child reads lines three and four,
// a listen-and-understand on the second stanza, closing production speak).
// ALL-FRESH second story, "The First Skateboard" (Arlo and his big sister
// Dinah at the park), spoken page by page INSIDE the questions where the
// child listens, and shown on screen where the child READS; nothing from the
// lesson story (Marnie, Grandma Edith, the greenhouse) is reused, and the
// narrator never pre-reads a sentence the child reads. Names + setting
// grep-swept vs lessons-v2 + quizzes-v2: Arlo, Dinah, skateboard, shady
// street, wheels hum fresh (0 hits). Tiles are audio-free lowercase text.
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/smooth-and-sure-quiz";
const IMG = (w: string) => `/images/lessons-v2/smooth-and-sure/${w.toLowerCase()}.png`;

export const smoothAndSureQuiz: QuizDef = {
  id: "smooth-and-sure-quiz",
  lessonId: "smooth-and-sure",
  title: "Smooth and Sure Quiz",
  standard: "RF.3.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-speak-read-carried",
      band: "easier",
      difficulty: 1,
      prompt: "Read it out loud: Arlo carried his new skateboard to the park.",
      image: IMG("quiz-arlo-carrying"),
      narration: { audio: `${Q}/e-1-speak-read-carried.mp3`, script: "Here is a new story about a boy named Arlo and his first skateboard. The first sentence is on your screen. Get the words, keep a talking pace, and read it out loud." },
      hint: { audio: `${Q}/e-1-speak-read-carried-hint.mp3`, script: "Point to each word as you say it, at the easy speed you use with a friend." },
      explain: { audio: `${Q}/e-1-speak-read-carried-explain.mp3`, script: "Here is the whole sentence, smooth and sure. Arlo carried his new skateboard to the park. Every word came out right, at a talking pace, with a rest at the period." },
      interaction: { type: "speak", text: "Arlo carried his new skateboard to the park" },
    },
    {
      id: "e-2-which-mark-climbs",
      band: "easier",
      difficulty: 2,
      prompt: "\"Are you going to ride it or hug it?\" Dinah teased. Which mark made my voice climb?",
      narration: { audio: `${Q}/e-2-which-mark-climbs.mp3`, script: "Arlo's big sister Dinah rode circles around him while he held his new board. Here is what she said. Are you going to ride it or hug it? Dinah teased. One mark at the end of her words made my voice climb. Look at the line on your screen, and tap the name of that mark." },
      hint: { audio: `${Q}/e-2-which-mark-climbs-hint.mp3`, script: "The mark you need sits right before the closing quote, at the end of Dinah's words. A climbing voice means she is asking." },
      explain: { audio: `${Q}/e-2-which-mark-climbs-explain.mp3`, script: "The question mark made my voice climb. Dinah was asking Arlo something, so her words end with a question mark, and a question mark sends the voice up." },
      interaction: { type: "choose", options: [{ id: "question-mark", label: "question mark" }, { id: "period", label: "period" }, { id: "comma", label: "comma" }], correctId: "question-mark", coachWrong: "Look at the very end of Dinah's words, just before the quote closes. Which mark sits there?" },
    },
    {
      id: "e-3-where-first-try",
      band: "easier",
      difficulty: 3,
      prompt: "Where did Arlo end up on his first try?",
      image: IMG("quiz-board-in-grass"),
      narration: { audio: `${Q}/e-3-where-first-try.mp3`, script: "Here is page two of the story. Arlo set one foot on the board, pushed twice, and wobbled straight into the grass. He tried again, and this time the board shot out from under him and rolled away without him. Where did Arlo end up on his first try? Tap it." },
      hint: { audio: `${Q}/e-3-where-first-try-hint.mp3`, script: "The picture shows it too. Look at where Arlo is sitting." },
      explain: { audio: `${Q}/e-3-where-first-try-explain.mp3`, script: "The story says he wobbled straight into the grass. In the grass is where Arlo ended up on his first try." },
      interaction: { type: "choose", options: [{ id: "in-the-grass", label: "in the grass" }, { id: "in-the-sandbox", label: "in the sandbox" }, { id: "on-the-bench", label: "on the bench" }], correctId: "in-the-grass", coachWrong: "Listen for where he wobbled to. The picture shows the same place." },
    },
    {
      id: "e-4-speak-read-rolling",
      band: "easier",
      difficulty: 4,
      prompt: "Read it out loud: The board rolled, and rolled, and kept rolling!",
      image: IMG("quiz-arlo-gliding"),
      narration: { audio: `${Q}/e-4-speak-read-rolling.mp3`, script: "Arlo finally got his board moving, and the sentence on your screen tells it. It has two commas for tiny pauses and an exclamation point at the end. Read it out loud, and let the end come out strong." },
      hint: { audio: `${Q}/e-4-speak-read-rolling-hint.mp3`, script: "Each comma in this sentence gets a tiny pause, and the exclamation point at the end asks you to make the last word strong." },
      explain: { audio: `${Q}/e-4-speak-read-rolling-explain.mp3`, script: "Here is the sentence one more time. The board rolled, and rolled, and kept rolling! The commas gave tiny pauses, and the exclamation point made the ending strong." },
      interaction: { type: "speak", text: "The board rolled and rolled and kept rolling" },
    },
    {
      id: "c-1-speak-read-two-sentences",
      band: "core",
      difficulty: 1,
      prompt: "Read it: Arlo stared at the far end of the path and bent his knees. Then he pushed off with one foot and did not look down.",
      narration: { audio: `${Q}/c-1-speak-read-two-sentences.mp3`, script: "Here are two sentences from page three, and they are on your screen. Get the words, keep a talking pace, and let the period give you a rest between them. Read both sentences out loud." },
      hint: { audio: `${Q}/c-1-speak-read-two-sentences-hint.mp3`, script: "The easy way is to say it like you are telling a friend what Arlo did. Rest for a beat at the period, then keep going." },
      explain: { audio: `${Q}/c-1-speak-read-two-sentences-explain.mp3`, script: "Arlo stared at the far end of the path and bent his knees. Then he pushed off with one foot and did not look down. Smooth and steady, with one rest in the middle." },
      interaction: { type: "speak", text: "Arlo stared at the far end of the path and bent his knees Then he pushed off with one foot and did not look down" },
    },
    {
      id: "c-2-check-after-read",
      band: "core",
      difficulty: 2,
      prompt: "Read it: \"Bend your knees, and look where you want to go,\" said Dinah, \"because the board follows your eyes.\" What did Dinah tell Arlo to do?",
      narration: { audio: `${Q}/c-2-check-after-read.mp3`, script: "Now a read with an understanding check. A line from Dinah is on your screen. Read it in your head, smooth and sure, and then tap what she told Arlo to do." },
      hint: { audio: `${Q}/c-2-check-after-read-hint.mp3`, script: "Reread the first part of Dinah's words, before the word because. She names two things to do." },
      explain: { audio: `${Q}/c-2-check-after-read-explain.mp3`, script: "Dinah told him to bend and look ahead. Her words were, bend your knees, and look where you want to go, because the board follows your eyes." },
      interaction: { type: "choose", options: [{ id: "bend-and-look-ahead", label: "bend and look ahead" }, { id: "look-down-at-his-feet", label: "look down at his feet" }, { id: "push-with-both-feet", label: "push with both feet" }, { id: "hold-on-to-her-arm", label: "hold on to her arm" }], correctId: "bend-and-look-ahead", coachWrong: "Dinah did not say that. Read her words again and find the two things she told him to do." },
    },
    {
      id: "c-3-sort-talking-pace",
      band: "core",
      difficulty: 3,
      prompt: "Sort the readers: Talking Pace, or Not Yet?",
      narration: { audio: `${Q}/c-3-sort-talking-pace.mp3`, script: "Six cards, six readers. Read each card and picture that reader out loud. If the reader keeps a talking pace, the easy speed you use with a friend, drag the card to Talking Pace. If the reader is not there yet, drag it to Not Yet." },
      hint: { audio: `${Q}/c-3-sort-talking-pace-hint.mp3`, script: "A talking pace is not a crawl and not a race. Ask whether that reader sounds like talking." },
      explain: { audio: `${Q}/c-3-sort-talking-pace-explain.mp3`, script: "Keeps a steady, easy speed, pauses a beat at the period, and reads like telling a story all keep a talking pace. Says one word, then stops, zooms past every mark, and runs the words into a blur are not there yet." },
      interaction: { type: "sort", buckets: ["Talking Pace", "Not Yet"], bucketAudio: { "Talking Pace": `${Q}/b-talking-pace.mp3`, "Not Yet": `${Q}/b-not-yet.mp3` }, items: [{ label: "keeps a steady, easy speed", bucket: "Talking Pace" }, { label: "says one word, then stops", bucket: "Not Yet" }, { label: "pauses a beat at the period", bucket: "Talking Pace" }, { label: "zooms past every mark", bucket: "Not Yet" }, { label: "reads like telling a story", bucket: "Talking Pace" }, { label: "runs the words into a blur", bucket: "Not Yet" }], coachWrong: "Picture that reader out loud. Does it sound like talking, or does it crawl or race?" },
    },
    {
      id: "c-4-voice-at-question-mark",
      band: "core",
      difficulty: 4,
      prompt: "\"Can I try the small hill next?\" asked Arlo. What does your voice do at the end of his words?",
      narration: { audio: `${Q}/c-4-voice-at-question-mark.mp3`, script: "On page four, Arlo asked Dinah for something, and his words are on your screen. Look at the mark at the end of his words, and tap what your voice does there." },
      hint: { audio: `${Q}/c-4-voice-at-question-mark-hint.mp3`, script: "The mark sits right before the closing quote. Think about what that mark always asks a voice to do." },
      explain: { audio: `${Q}/c-4-voice-at-question-mark-explain.mp3`, script: "Your voice climbs up. Arlo's words end with a question mark, and a question mark sends the voice up at the end, because he is asking." },
      interaction: { type: "choose", options: [{ id: "climbs-up", label: "climbs up" }, { id: "drops-to-a-rest", label: "drops to a rest" }, { id: "gets-loud-and-strong", label: "gets loud and strong" }, { id: "pauses-for-a-beat", label: "pauses for a beat" }], correctId: "climbs-up", coachWrong: "That is what a different mark asks for. Check the mark at the end of Arlo's words once more." },
    },
    {
      id: "c-5-speak-read-dialogue",
      band: "core",
      difficulty: 5,
      prompt: "Read it: \"Did you see that?\" he shouted. \"I saw it, and I also saw you fall eleven times!\" said Dinah.",
      narration: { audio: `${Q}/c-5-speak-read-dialogue.mp3`, script: "Two people are talking in the sentences on your screen. Let the marks move your voice, a climb at the question mark and a strong finish at the exclamation point, and read both sentences out loud." },
      hint: { audio: `${Q}/c-5-speak-read-dialogue-hint.mp3`, script: "The first sentence asks, so it climbs. The second one bursts, so it ends strong. Try it again." },
      explain: { audio: `${Q}/c-5-speak-read-dialogue-explain.mp3`, script: "Did you see that? he shouted. I saw it, and I also saw you fall eleven times! said Dinah. A climb, then a strong finish." },
      interaction: { type: "speak", text: "Did you see that he shouted I saw it and I also saw you fall eleven times said Dinah" },
    },
    {
      id: "c-6-speak-retell-last-page",
      band: "core",
      difficulty: 6,
      prompt: "What happened on the last page? Tell it in your own words.",
      narration: { audio: `${Q}/c-6-speak-retell-last-page.mp3`, script: "Here is the last page of the story. By lunchtime, Arlo could glide the whole length of the path without falling once. Dinah rode beside him and clapped every time he reached the end. Then he asked to try the small hill, and he rolled down it without a single wobble. Now the understanding check. Tap the mic and tell me what happened on the last page in your own words." },
      hint: { audio: `${Q}/c-6-speak-retell-last-page-hint.mp3`, script: "Say what Arlo could do by lunchtime, and say what he tried at the end." },
      explain: { audio: `${Q}/c-6-speak-retell-last-page-explain.mp3`, script: "By lunchtime Arlo could glide the whole path without falling, Dinah clapped for him, and then he rolled down the small hill without a wobble." },
      interaction: { type: "speak", text: "glide glided gliding rode ride riding whole length path without falling fell fall lunchtime clapped clap hill wobble wobbling rolled roll down made sister dinah" },
    },
    {
      id: "h-1-poem-line-pause",
      band: "harder",
      difficulty: 1,
      prompt: "Four small wheels and a board of wood, Push and glide the way you should. The sentence runs across both lines. Where does the tiny pause go?",
      narration: { audio: `${Q}/h-1-poem-line-pause.mp3`, script: "Here is a fourth grade step, reading a poem. A poem is written in lines, and each line ends where the poet stopped it, not always where the sentence ends. At the end of each line you take a tiny pause, and you keep the beat, the steady rhythm you could tap with a finger. Listen to me read the first two lines of a poem about Arlo's board. Four small wheels and a board of wood, Push and glide the way you should. A tiny pause where the poet stopped the first line, a beat you could tap, and the rhyme, wood and should, chimes at the line ends. Now the check. Those two lines make one sentence, and it runs across the line break. Look at them on your screen, and tap where the tiny pause goes." },
      hint: { audio: `${Q}/h-1-poem-line-pause-hint.mp3`, script: "The pause does not wait for the sentence to finish. Think about where the poet stopped line one." },
      explain: { audio: `${Q}/h-1-poem-line-pause-explain.mp3`, script: "At the end of line one. The sentence keeps going, but the poet stopped the line after wood, and every line end gets a tiny pause that keeps the beat." },
      interaction: { type: "choose", options: [{ id: "at-the-end-of-line-one", label: "at the end of line one" }, { id: "only-at-the-period", label: "only at the period" }, { id: "after-every-single-word", label: "after every single word" }, { id: "nowhere-in-one-sentence", label: "nowhere in one sentence" }], correctId: "at-the-end-of-line-one", coachWrong: "That is how prose works, but a poem is built from lines. Where did the poet stop line one?" },
    },
    {
      id: "h-2-speak-read-two-lines",
      band: "harder",
      difficulty: 2,
      prompt: "Read the next two lines: Bend your knees and find your feet, Roll on down the shady street!",
      narration: { audio: `${Q}/h-2-speak-read-two-lines.mp3`, script: "The next two lines of the poem are yours, and nobody has read them for you. Take a tiny pause at the end of the first line, keep the beat, and let the exclamation point finish strong. Read both lines out loud." },
      hint: { audio: `${Q}/h-2-speak-read-two-lines-hint.mp3`, script: "Your finger can tap the beat while you read. Pause after the first line, and make the last word strong." },
      explain: { audio: `${Q}/h-2-speak-read-two-lines-explain.mp3`, script: "Here are the two lines once more. Bend your knees and find your feet, Roll on down the shady street! A pause at the line break, a steady beat, and a strong finish." },
      interaction: { type: "speak", text: "Bend your knees and find your feet Roll on down the shady street" },
    },
    {
      id: "h-3-poem-understanding",
      band: "harder",
      difficulty: 3,
      prompt: "What has changed for the rider in this part of the poem?",
      narration: { audio: `${Q}/h-3-poem-understanding.mp3`, script: "Poems still have to make sense, so the understanding check works here too. Listen to the second part of the poem, and keep the beat in your head. The wheels hum low, the wind blows by, the path runs straight, the sun is high. I lean, I turn, I do not fall, the little hill is not so tall. What has changed for the rider in this part? Tap it." },
      hint: { audio: `${Q}/h-3-poem-understanding-hint.mp3`, script: "Listen to the third line again in your head. It tells what the rider does not do anymore." },
      explain: { audio: `${Q}/h-3-poem-understanding-explain.mp3`, script: "He rides without falling. The poem says, I lean, I turn, I do not fall, so the rider stays on the board now." },
      interaction: { type: "choose", options: [{ id: "he-rides-without-falling", label: "he rides without falling" }, { id: "he-loses-his-board", label: "he loses his board" }, { id: "he-stops-at-the-hill", label: "he stops at the hill" }, { id: "he-rides-in-the-dark", label: "he rides in the dark" }], correctId: "he-rides-without-falling", coachWrong: "The poem does not say that. Think about the line with the word fall in it." },
    },
    {
      id: "h-4-speak-poem-production",
      band: "harder",
      difficulty: 4,
      prompt: "What can the rider do now, and what does a reader do at the end of a poem line?",
      narration: { audio: `${Q}/h-4-speak-poem-production.mp3`, script: "Last one, out loud. Here is the second part of the poem once more. The wheels hum low, the wind blows by, the path runs straight, the sun is high. I lean, I turn, I do not fall, the little hill is not so tall. Tap the mic. Tell me in your own words what the rider can do now, and then name one thing a reader does at the end of a poem line." },
      hint: { audio: `${Q}/h-4-speak-poem-production-hint.mp3`, script: "Say what the rider does on the board without doing anymore, then say what your voice does when a line ends." },
      explain: { audio: `${Q}/h-4-speak-poem-production-explain.mp3`, script: "The rider can lean and turn without falling, even on the little hill. And at the end of a poem line, a reader takes a tiny pause and keeps the beat." },
      interaction: { type: "speak", text: "ride rides riding turn turns lean leans fall falling without stay stays board hill tall pause pauses stop beat rhythm rhyme line lines end tiny breath rest" },
    },
  ],
};
