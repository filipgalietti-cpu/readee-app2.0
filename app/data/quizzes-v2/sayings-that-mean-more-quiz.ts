import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Sayings That Mean More QUIZ (L.3.5a) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// literal-or-saying at 3 options w/ 3 picture supports, a literal picture
// allowed) / core(on-grade G3: meaning in context, same-words-two-ways, the
// Means the Words sort, which-saying-fits, a production speak) / harder(G4
// transfer L.4.5b: a PROVERB is a saying that gives ADVICE, each one
// explained first as advice rather than a picture, then applied to a new
// situation, closing with a production speak). ALL-FRESH second story,
// "Planting Day" (Silas, cousin Freya, Grandpa Wilbur at the community
// garden: bright and early, green thumb, dig in, ran out of steam, hang in
// there, second wind, out of the blue, pitch in, the last straw, call it a
// day, in the nick of time; proverbs the early bird catches the worm, many
// hands make light work, do not count your chickens, practice makes
// perfect), spoken page by page INSIDE the questions so every Q is
// self-contained; nothing from the lesson story (Elodie, Idris, the relay)
// is reused. Every saying, proverb, name, and garden prop grep-swept vs
// lessons-v2 + quizzes-v2: 0 hits. Quiz support images live in the lesson's
// image dir (quiz- keys). Tiles are audio-free lowercase; bucket clips b-*
// are synthed from punctuated labels before quiz-tts and whisper-verified.

const Q = "/audio/quizzes-v2/sayings-that-mean-more-quiz";
const IMG = (w: string) => `/images/lessons-v2/sayings-that-mean-more/${w.toLowerCase()}.png`;

export const sayingsThatMeanMoreQuiz: QuizDef = {
  id: "sayings-that-mean-more-quiz",
  lessonId: "sayings-that-mean-more",
  title: "Sayings That Mean More Quiz",
  standard: "L.3.5a",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-bright-and-early",
      band: "easier",
      difficulty: 1,
      prompt: "What does bright and early mean here?",
      image: IMG("quiz-garden-sunrise"),
      narration: { audio: `${Q}/e-1-bright-and-early.mp3`, script: "Here is page one of a new story called Planting Day. Silas and his cousin Freya got to the community garden bright and early, before anyone else had even opened the gate. Look at the picture, and picture the words. Nobody is glowing. What does bright and early mean here? Tap the answer." },
      hint: { audio: `${Q}/e-1-bright-and-early-hint.mp3`, script: "Look at the sky in the picture, and think about a gate that nobody had opened yet." },
      explain: { audio: `${Q}/e-1-bright-and-early-explain.mp3`, script: "It means very early in the morning. The sun was just coming up and the gate was still closed, so the cousins were the first ones there." },
      interaction: { type: "choose", options: [{ id: "very-early-in-the-morning", label: "very early in the morning" }, { id: "carrying-a-bright-lamp", label: "carrying a bright lamp" }, { id: "when-the-sun-was-hot", label: "when the sun was hot" }], correctId: "very-early-in-the-morning", coachWrong: "Nobody in the picture is glowing. Look at the sky and think about what time of day it shows." },
    },
    {
      id: "e-2-means-the-words",
      band: "easier",
      difficulty: 2,
      prompt: "Which line means exactly what it says?",
      image: IMG("quiz-digging-soil"),
      narration: { audio: `${Q}/e-2-means-the-words.mp3`, script: "Page one tells three things about Grandpa Wilbur. He dug with a small shovel. He has a green thumb. And he told the cousins to hang in there. Those three lines are on your screen. Look at the picture, and tap the one that means exactly what it says." },
      hint: { audio: `${Q}/e-2-means-the-words-hint.mp3`, script: "Look at the picture. Which line shows something you can really see happening, just like that?" },
      explain: { audio: `${Q}/e-2-means-the-words-explain.mp3`, script: "He dug with a small shovel means exactly what it says, and the picture shows it. A thumb is not really green, and nobody hangs in a garden." },
      interaction: { type: "choose", options: [{ id: "he-dug-with-a-small-shovel", label: "he dug with a small shovel" }, { id: "he-has-a-green-thumb", label: "he has a green thumb" }, { id: "he-said-to-hang-in-there", label: "he said to hang in there" }], correctId: "he-dug-with-a-small-shovel", coachWrong: "Picture that one. Can it really happen exactly the way the words say? Look at the picture for the one that can." },
    },
    {
      id: "e-3-green-thumb",
      band: "easier",
      difficulty: 3,
      prompt: "What does a green thumb mean here?",
      image: IMG("quiz-tall-plants"),
      narration: { audio: `${Q}/e-3-green-thumb.mp3`, script: "Page one says Grandpa Wilbur has a green thumb, and every spring his rows of peppers grow taller than the fence. Look at the picture. His thumb is not green at all. What does a green thumb mean here? Tap the answer." },
      hint: { audio: `${Q}/e-3-green-thumb-hint.mp3`, script: "Look at what is growing all around Grandpa in the picture. What is he good at?" },
      explain: { audio: `${Q}/e-3-green-thumb-explain.mp3`, script: "It means he is good at growing plants. His peppers grow taller than the fence, and that is what a green thumb does." },
      interaction: { type: "choose", options: [{ id: "he-is-good-at-growing-plants", label: "he is good at growing plants" }, { id: "his-thumb-is-painted-green", label: "his thumb is painted green" }, { id: "he-got-dirt-on-his-hand", label: "he got dirt on his hand" }], correctId: "he-is-good-at-growing-plants", coachWrong: "His thumb is a plain thumb. Look at the plants around him and think about what he is good at." },
    },
    {
      id: "e-4-hang-in-there",
      band: "easier",
      difficulty: 4,
      prompt: "What does hang in there mean here?",
      narration: { audio: `${Q}/e-4-hang-in-there.mp3`, script: "Listen to page two. By ten in the morning Freya had run out of steam, and she flopped down beside the wheelbarrow. Hang in there, one more row, said Grandpa. Picture the words. Nobody is hanging from anything. What does hang in there mean? Tap the answer." },
      hint: { audio: `${Q}/e-4-hang-in-there-hint.mp3`, script: "Grandpa said it when Freya was tired and had one more row to plant. What did he want her to do?" },
      explain: { audio: `${Q}/e-4-hang-in-there-explain.mp3`, script: "It means keep going and do not quit. Freya was tired, and Grandpa wanted her to finish one more row." },
      interaction: { type: "choose", options: [{ id: "keep-going-and-do-not-quit", label: "keep going and do not quit" }, { id: "hold-on-to-the-fence", label: "hold on to the fence" }, { id: "hang-the-tools-on-a-hook", label: "hang the tools on a hook" }], correctId: "keep-going-and-do-not-quit", coachWrong: "There is no hook and no fence in the sentence. Think about what Grandpa wants a tired girl to do." },
    },
    {
      id: "c-1-ran-out-of-steam",
      band: "core",
      difficulty: 1,
      prompt: "What does ran out of steam mean here?",
      narration: { audio: `${Q}/c-1-ran-out-of-steam.mp3`, script: "Page two says by ten in the morning Freya had run out of steam, and she flopped down beside the wheelbarrow. Picture the words. Freya is a girl, not a kettle, so the words mean more. Find the meaning from the sentence. Four plain versions are on your screen. Tap the one that fits." },
      hint: { audio: `${Q}/c-1-ran-out-of-steam-hint.mp3`, script: "She flopped down beside the wheelbarrow. What does a person feel like when they do that?" },
      explain: { audio: `${Q}/c-1-ran-out-of-steam-explain.mp3`, script: "It means she got too tired to keep going. Flopping down beside the wheelbarrow is what a worn out girl does." },
      interaction: { type: "choose", options: [{ id: "got-too-tired-to-keep-going", label: "got too tired to keep going" }, { id: "ran-out-of-hot-water", label: "ran out of hot water" }, { id: "ran-away-from-the-kettle", label: "ran away from the kettle" }, { id: "ran-faster-than-before", label: "ran faster than before" }], correctId: "got-too-tired-to-keep-going", coachWrong: "Read around it. She flopped down. Which plain version fits a girl who flops down?" },
    },
    {
      id: "c-2-last-straw-two-ways",
      band: "core",
      difficulty: 2,
      prompt: "Which sentence uses the last straw as a saying?",
      narration: { audio: `${Q}/c-2-last-straw-two-ways.mp3`, script: "Page three says when the hose burst and sprayed Silas from head to toe, that was the last straw, and Grandpa laughed so hard he had to sit down. People say that was the last straw when one more bad thing lands on top of a pile of bad things. Four sentences are on your screen, and every one of them has the words last straw inside it. In three of them, the straw is real. Tap the one where the straw is a saying." },
      hint: { audio: `${Q}/c-2-last-straw-two-ways-hint.mp3`, script: "Picture each one. If you can see a real straw you could hold in your hand, it means the words." },
      explain: { audio: `${Q}/c-2-last-straw-two-ways-explain.mp3`, script: "That hose was the last straw is the saying. A hose is not a straw, so the words mean one more bad thing on top of the pile." },
      interaction: { type: "choose", options: [{ id: "that-hose-was-the-last-straw", label: "that hose was the last straw" }, { id: "he-took-the-last-straw", label: "he took the last straw" }, { id: "the-last-straw-was-bent", label: "the last straw was bent" }, { id: "one-last-straw-in-the-cup", label: "one last straw in the cup" }], correctId: "that-hose-was-the-last-straw", coachWrong: "Picture that one. If there is a real straw you could pick up, it means the words. Find the one with no real straw in it." },
    },
    {
      id: "c-3-sort-words-or-more",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Means the Words, or Means More?",
      narration: { audio: `${Q}/c-3-sort-words-or-more.mp3`, script: "Six short lines from Planting Day are on your screen, and here is where each one comes from. Silas grabbed a shovel and dug in the dirt. Freya flopped by the wheelbarrow. She got her second wind after a drink of water. A truck full of mulch pulled up at the gate. Out of the blue, the truck pulled up. And Grandpa said, let us call it a day. Picture each line exactly as it says. If the picture can be true, drag it to Means the Words. If it cannot, drag it to Means More." },
      hint: { audio: `${Q}/c-3-sort-words-or-more-hint.mp3`, script: "Picture that line happening in a real garden. If you can see it exactly like that, it means the words." },
      explain: { audio: `${Q}/c-3-sort-words-or-more-explain.mp3`, script: "Digging in the dirt, flopping by the wheelbarrow, and a truck at the gate all really happen, so they mean the words. Nobody gets a second wind from the sky, nothing drives out of a color, and you cannot call a day, so those three mean more." },
      interaction: { type: "sort", buckets: ["Means the Words","Means More"], bucketAudio: { "Means the Words": `${Q}/b-means-the-words.mp3`, "Means More": `${Q}/b-means-more.mp3` }, items: [{ label: "dug in the dirt", bucket: "Means the Words" }, { label: "got her second wind", bucket: "Means More" }, { label: "flopped by the wheelbarrow", bucket: "Means the Words" }, { label: "out of the blue", bucket: "Means More" }, { label: "truck pulled up at the gate", bucket: "Means the Words" }, { label: "let us call it a day", bucket: "Means More" }], coachWrong: "Picture that one in a real garden, word for word. If you can see it exactly like that, it means the words." },
    },
    {
      id: "c-4-which-saying-fits",
      band: "core",
      difficulty: 4,
      prompt: "Which saying fits the sentence?",
      narration: { audio: `${Q}/c-4-which-saying-fits.mp3`, script: "Here is a new sentence with a hole in it. The sun was going down and the tools were already packed in the wheelbarrow, so Grandpa wiped his hands and said, let us, blank. Four sayings from the story are on your screen. Picture the plain meaning of each one, and tap the saying that fits the hole." },
      hint: { audio: `${Q}/c-4-which-saying-fits-hint.mp3`, script: "The tools are packed and the sun is going down. Is Grandpa starting something, or finishing something?" },
      explain: { audio: `${Q}/c-4-which-saying-fits-explain.mp3`, script: "Call it a day fits. The work is finished and the tools are packed, so Grandpa is saying it is time to stop for today." },
      interaction: { type: "choose", options: [{ id: "call-it-a-day", label: "call it a day" }, { id: "pitch-in", label: "pitch in" }, { id: "dig-in", label: "dig in" }, { id: "get-a-second-wind", label: "get a second wind" }], correctId: "call-it-a-day", coachWrong: "The tools are already packed away. Which saying fits a day that is over, not a day that is starting?" },
    },
    {
      id: "c-5-out-of-the-blue",
      band: "core",
      difficulty: 5,
      prompt: "What does out of the blue mean here?",
      narration: { audio: `${Q}/c-5-out-of-the-blue.mp3`, script: "Page two says, then, out of the blue, a truck full of free mulch pulled up at the gate, and every neighbor on the street came to pitch in. Picture the words. A truck cannot drive out of a color. Find the meaning from the sentence. Four plain versions are on your screen. Tap the one that fits." },
      hint: { audio: `${Q}/c-5-out-of-the-blue-hint.mp3`, script: "Nobody knew a truck was coming. What does that tell you about how it showed up?" },
      explain: { audio: `${Q}/c-5-out-of-the-blue-explain.mp3`, script: "It means with no warning at all. Nobody expected a truck full of mulch, and then there it was at the gate." },
      interaction: { type: "choose", options: [{ id: "with-no-warning-at-all", label: "with no warning at all" }, { id: "down-from-the-blue-sky", label: "down from the blue sky" }, { id: "out-of-the-blue-pond", label: "out of the blue pond" }, { id: "painted-bright-blue", label: "painted bright blue" }], correctId: "with-no-warning-at-all", coachWrong: "The sentence is about a surprise, not a color. Think about how the truck showed up." },
    },
    {
      id: "c-6-speak-call-it-a-day",
      band: "core",
      difficulty: 6,
      prompt: "Use call it a day in a sentence of your own, the saying way.",
      narration: { audio: `${Q}/c-6-speak-call-it-a-day.mp3`, script: "Now the sentence is yours. Grandpa said, let us call it a day, when the planting was done. Think of a time somebody stopped working or playing because it was time to quit for the day. Tap the mic and say one whole sentence that uses call it a day the way Grandpa did." },
      hint: { audio: `${Q}/c-6-speak-call-it-a-day-hint.mp3`, script: "Your sentence can begin with the word after, or with the word when. Say what was going on, then end with the saying." },
      explain: { audio: `${Q}/c-6-speak-call-it-a-day-explain.mp3`, script: "Here is one way to say it. After two hours of raking leaves, Dad said it was time to call it a day, and we went inside for dinner." },
      interaction: { type: "speak", text: "call called calling day tired late dark finished done stop stopped quit quitting rest home bed dinner enough work practice game" },
    },
    {
      id: "h-1-early-bird-proverb",
      band: "harder",
      difficulty: 1,
      prompt: "Which one shows the early bird catches the worm?",
      narration: { audio: `${Q}/h-1-early-bird-proverb.mp3`, script: "Here is a fourth grade step. Some sayings are longer, and they give advice. People call them proverbs. Here is one. The early bird catches the worm. Picture it first. The bird that gets to the grass first gets the worm before the other birds do. So the advice is, start early, and you get the best chance. Now use it. Here is more of page one. The cousins came early, so they got the best row by the fence. Freya had slept past nine the day before. A robin ate a worm at noon. And the neighbors came at four. Those four things are on your screen. Tap the one that shows the early bird catches the worm." },
      hint: { audio: `${Q}/h-1-early-bird-proverb-hint.mp3`, script: "The proverb is advice about starting early. Which choice shows somebody who started early and got something good for it?" },
      explain: { audio: `${Q}/h-1-early-bird-proverb-explain.mp3`, script: "Came early, got the best row shows it. The cousins started early, so they got the best chance, just like the bird that gets to the grass first." },
      interaction: { type: "choose", options: [{ id: "came-early-got-the-best-row", label: "came early, got the best row" }, { id: "a-robin-ate-a-worm-at-noon", label: "a robin ate a worm at noon" }, { id: "freya-slept-past-nine", label: "freya slept past nine" }, { id: "the-neighbors-came-at-four", label: "the neighbors came at four" }], correctId: "came-early-got-the-best-row", coachWrong: "A real bird eating a real worm is only the picture. Find the choice where somebody got something good by starting early." },
    },
    {
      id: "h-2-many-hands-proverb",
      band: "harder",
      difficulty: 2,
      prompt: "What did Grandpa mean by many hands make light work?",
      narration: { audio: `${Q}/h-2-many-hands-proverb.mp3`, script: "Another proverb. Many hands make light work. Picture it. Not hands that glow. Light here means easy, not heavy. So the advice is, when lots of people help, a big job gets easy. Page two says every neighbor on the street came to pitch in with the mulch. Grandpa looked at the huge pile and said, many hands make light work. What did Grandpa mean? Tap it." },
      hint: { audio: `${Q}/h-2-many-hands-proverb-hint.mp3`, script: "The proverb is about helpers, not about hands or lamps. What happens to a big pile when a whole street helps?" },
      explain: { audio: `${Q}/h-2-many-hands-proverb-explain.mp3`, script: "He meant lots of helpers make it easy. A whole street of neighbors spreading mulch turns a big job into a quick one." },
      interaction: { type: "choose", options: [{ id: "lots-of-helpers-make-it-easy", label: "lots of helpers make it easy" }, { id: "wash-your-hands-before-work", label: "wash your hands before work" }, { id: "the-mulch-is-not-heavy", label: "the mulch is not heavy" }, { id: "work-under-bright-lights", label: "work under bright lights" }], correctId: "lots-of-helpers-make-it-easy", coachWrong: "Light here means easy, not glowing. Think about what all those neighbors do to a big job." },
    },
    {
      id: "h-3-which-proverb-fits",
      band: "harder",
      difficulty: 3,
      prompt: "Which proverb fits what Grandpa would say?",
      narration: { audio: `${Q}/h-3-which-proverb-fits.mp3`, script: "One more proverb, and this one is a warning. Do not count your chickens before they hatch. Picture it. A farmer counting eggs as if they were already chickens, when some eggs might never hatch. The advice is, do not plan on something before it really happens. Now listen. Freya wanted to spend the prize money from the pepper contest on new seeds, but the contest was still a week away. Grandpa shook his head. Four proverbs are on your screen. Tap the one that fits what Grandpa would say." },
      hint: { audio: `${Q}/h-3-which-proverb-fits-hint.mp3`, script: "Freya is planning to spend money she has not won yet. Which proverb warns about planning on something that has not happened?" },
      explain: { audio: `${Q}/h-3-which-proverb-fits-explain.mp3`, script: "Do not count your chickens fits. The contest has not happened yet, so the prize money is like an egg that has not hatched." },
      interaction: { type: "choose", options: [{ id: "do-not-count-your-chickens", label: "do not count your chickens" }, { id: "early-bird-catches-the-worm", label: "early bird catches the worm" }, { id: "many-hands-make-light-work", label: "many hands make light work" }, { id: "practice-makes-perfect", label: "practice makes perfect" }], correctId: "do-not-count-your-chickens", coachWrong: "Think about what Freya is doing. She is planning on money that is not hers yet. Which proverb warns against that?" },
    },
    {
      id: "h-4-speak-practice-makes-perfect",
      band: "harder",
      difficulty: 4,
      prompt: "Explain practice makes perfect to a friend, then say when you would use it.",
      narration: { audio: `${Q}/h-4-speak-practice-makes-perfect.mp3`, script: "Last one, out loud. Here is a proverb you may already know. Practice makes perfect. Picture it. Somebody doing the same thing again and again, and getting a little better every time. Tap the mic. Tell a friend what advice this proverb gives, in your own words, and then say one time when you would use it." },
      hint: { audio: `${Q}/h-4-speak-practice-makes-perfect-hint.mp3`, script: "Your answer begins with the words, it means. Then think of something you got better at by doing it many times." },
      explain: { audio: `${Q}/h-4-speak-practice-makes-perfect-explain.mp3`, script: "It means the more you do something, the better you get at it. You could say it to a friend who wants to quit piano after one hard week." },
      interaction: { type: "speak", text: "practice practicing practiced better good keep again repeat try trying learn improve skill piano soccer reading spelling riding bike every day" },
    },
  ],
};
