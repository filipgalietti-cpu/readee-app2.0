import type { QuizDef } from "@/lib/lesson-engine/quiz";

// More Than It Says QUIZ (RL.3.4) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// literal vs nonliteral on obvious phrases at 3 options w/ picture support) /
// core(on-grade G3: plain-version chooses, which-words-tell-you, Means What
// It Says sort, the same-words-twice contrast beat, production speak) /
// harder(G4 transfer RL.4.4: a SIMILE unpacked by asking what the two things
// share, MODELED in h-1 first then applied, and a phrase that points back to
// something the story set up earlier, closing with a production speak).
// ALL-FRESH second story, "Grandpa's Birthday Cake" (Callum bakes alone,
// big sister Astrid, Grandpa's saying slow hands, sweet cake), spoken page by
// page INSIDE the questions so every Q is self-contained; nothing from the
// lesson story (Rowan/Elsie/the pond) is reused. Names + phrases grep-swept
// vs lessons-v2 + quizzes-v2: Callum, Astrid, piece of cake, all thumbs, face
// fell, in hot water, slow hands, bitten off more, like leaves, smooth as
// glass all fresh (0 hits). Quiz support images live in the lesson's image
// dir (quiz- keys). Tiles are audio-free lowercase; bucket clips b-* are
// synthed from punctuated labels before quiz-tts and whisper-verified.

const Q = "/audio/quizzes-v2/more-than-it-says-quiz";
const IMG = (w: string) => `/images/lessons-v2/more-than-it-says/${w.toLowerCase()}.png`;

export const moreThanItSaysQuiz: QuizDef = {
  id: "more-than-it-says-quiz",
  lessonId: "more-than-it-says",
  title: "More Than It Says Quiz",
  standard: "RL.3.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-bitten-off-more",
      band: "easier",
      difficulty: 1,
      prompt: "What does bitten off more than he could chew mean here?",
      image: IMG("quiz-messy-counter"),
      narration: { audio: `${Q}/e-1-bitten-off-more.mp3`, script: "Here is page one of a new story called Grandpa's Birthday Cake. Callum promised to bake Grandpa's birthday cake all by himself, and by ten in the morning he knew he had bitten off more than he could chew. There is no cake to bite yet, so that phrase means more than it says. What does it mean here? Tap the answer." },
      hint: { audio: `${Q}/e-1-bitten-off-more-hint.mp3`, script: "Look at the counter in the picture, and think about the big promise Callum made all by himself." },
      explain: { audio: `${Q}/e-1-bitten-off-more-explain.mp3`, script: "It means he took on too big a job. Baking a whole cake alone was more than Callum could handle, and the messy counter shows it." },
      interaction: { type: "choose", options: [{ id: "he-took-on-too-big-a-job", label: "he took on too big a job" }, { id: "he-took-a-huge-bite-of-cake", label: "he took a huge bite of cake" }, { id: "he-chewed-with-a-full-mouth", label: "he chewed with a full mouth" }], correctId: "he-took-on-too-big-a-job", coachWrong: "There is no cake to bite yet. Think about what Callum promised to do alone." },
    },
    {
      id: "e-2-means-what-it-says",
      band: "easier",
      difficulty: 2,
      prompt: "Which phrase means exactly what it says?",
      image: IMG("quiz-butter-pan"),
      narration: { audio: `${Q}/e-2-means-what-it-says.mp3`, script: "Page two says, the butter melted in the warm pan while Callum cracked the eggs, and the clock on the wall seemed to race him. And page one said, his stomach did a flip. Three phrases from those pages are on your screen. Tap the one that means exactly what it says." },
      hint: { audio: `${Q}/e-2-means-what-it-says-hint.mp3`, script: "Look at the picture. Which phrase shows something you could really see happen, just like that?" },
      explain: { audio: `${Q}/e-2-means-what-it-says-explain.mp3`, script: "The butter melted in the pan means exactly what it says. Butter really melts in a warm pan. A clock cannot race, and a stomach cannot flip." },
      interaction: { type: "choose", options: [{ id: "the-butter-melted-in-the-pan", label: "the butter melted in the pan" }, { id: "the-clock-seemed-to-race-him", label: "the clock seemed to race him" }, { id: "his-stomach-did-a-flip", label: "his stomach did a flip" }], correctId: "the-butter-melted-in-the-pan", coachWrong: "Run the test. Could that really happen, word for word, in a kitchen? Look at the picture." },
    },
    {
      id: "e-3-keep-an-eye",
      band: "easier",
      difficulty: 3,
      prompt: "What does keep an eye on the oven mean here?",
      image: IMG("quiz-oven-window"),
      narration: { audio: `${Q}/e-3-keep-an-eye.mp3`, script: "Page two. Astrid said, mixing is a piece of cake, so start there, and keep an eye on the oven once it is in. Nobody can take an eye off and put it on an oven, so keep an eye on the oven means more than it says. What does it mean here? Tap the answer." },
      hint: { audio: `${Q}/e-3-keep-an-eye-hint.mp3`, script: "Look at what the boy in the picture is doing with his eyes. Astrid wants him to do that while the cake bakes." },
      explain: { audio: `${Q}/e-3-keep-an-eye-explain.mp3`, script: "It means watch the oven carefully. Astrid wants Callum to check on the cake while it bakes, and the picture shows him doing exactly that." },
      interaction: { type: "choose", options: [{ id: "watch-the-oven-carefully", label: "watch the oven carefully" }, { id: "put-his-eye-on-the-oven-door", label: "put his eye on the oven door" }, { id: "look-away-from-the-oven", label: "look away from the oven" }], correctId: "watch-the-oven-carefully", coachWrong: "Look at the picture. What is the boy doing while the cake bakes?" },
    },
    {
      id: "e-4-piece-of-cake",
      band: "easier",
      difficulty: 4,
      prompt: "What does a piece of cake mean here?",
      narration: { audio: `${Q}/e-4-piece-of-cake.mp3`, script: "Listen again to what Astrid said on page two. Mixing is a piece of cake, she said, so start there. There is no cake yet, so a piece of cake means more than it says. What does Astrid mean? Tap the answer." },
      hint: { audio: `${Q}/e-4-piece-of-cake-hint.mp3`, script: "Astrid is telling him where to start. Would she tell him to start with the hard part, or with the part that is no trouble at all?" },
      explain: { audio: `${Q}/e-4-piece-of-cake-explain.mp3`, script: "It means mixing is easy. Astrid says start there, because the easy part is a good place to begin." },
      interaction: { type: "choose", options: [{ id: "mixing-is-easy", label: "mixing is easy" }, { id: "mixing-makes-one-slice", label: "mixing makes one slice" }, { id: "mixing-takes-all-day", label: "mixing takes all day" }], correctId: "mixing-is-easy", coachWrong: "There is no cake yet, so it is not about a slice. Think about why Astrid says to start with mixing." },
    },
    {
      id: "c-1-stomach-did-a-flip",
      band: "core",
      difficulty: 1,
      prompt: "What does his stomach did a flip mean here?",
      narration: { audio: `${Q}/c-1-stomach-did-a-flip.mp3`, script: "Here is the rest of page one. Flour dusted the counter, an egg had rolled onto the floor, and his stomach did a flip every time he looked at the clock, while his hands shook like leaves in the wind. Run the test on his stomach did a flip. A stomach cannot really flip, so read around it. Four plain versions are on your screen. Tap the one the story supports." },
      hint: { audio: `${Q}/c-1-stomach-did-a-flip-hint.mp3`, script: "Read around it. It happened every time he looked at the clock, and his hands were shaking. What feeling makes that happen?" },
      explain: { audio: `${Q}/c-1-stomach-did-a-flip-explain.mp3`, script: "It means he felt nervous inside. Every look at the clock reminded him how little time he had, and his shaking hands show the same feeling." },
      interaction: { type: "choose", options: [{ id: "he-felt-nervous-inside", label: "he felt nervous inside" }, { id: "he-did-a-cartwheel", label: "he did a cartwheel" }, { id: "he-was-hungry-for-cake", label: "he was hungry for cake" }, { id: "he-ate-too-much-breakfast", label: "he ate too much breakfast" }], correctId: "he-felt-nervous-inside", coachWrong: "Read around it again. It happened when he looked at the clock. Why would the clock bother him?" },
    },
    {
      id: "c-2-which-words-face-fell",
      band: "core",
      difficulty: 2,
      prompt: "Which words tell you what his face fell means?",
      narration: { audio: `${Q}/c-2-which-words-face-fell.mp3`, script: "Page three. The first cake came out as flat as a pancake, and Callum's face fell. He had been all thumbs all morning, dropping the spoon twice and spilling the sugar, and now there was no cake at all. A face cannot really fall off, so his face fell means more than it says. Four groups of words from page three are on your screen, and all of them are really on the page. Only one tells you why his face fell. Tap that one." },
      hint: { audio: `${Q}/c-2-which-words-face-fell-hint.mp3`, script: "His face fell the moment he saw something. Find the words that tell what he saw." },
      explain: { audio: `${Q}/c-2-which-words-face-fell-explain.mp3`, script: "The words are, as flat as a pancake. The cake had not risen, and seeing that is what made his face fall. His face fell means he looked disappointed." },
      interaction: { type: "choose", options: [{ id: "as-flat-as-a-pancake", label: "as flat as a pancake" }, { id: "the-first-cake-came-out", label: "the first cake came out" }, { id: "dropping-the-spoon-twice", label: "dropping the spoon twice" }, { id: "spilling-the-sugar", label: "spilling the sugar" }], correctId: "as-flat-as-a-pancake", coachWrong: "Those words are on page three, but they do not tell what Callum saw when his face fell. Find what the cake looked like." },
    },
    {
      id: "c-3-sort-says-or-more",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Means What It Says, or Means More?",
      narration: { audio: `${Q}/c-3-sort-says-or-more.mp3`, script: "Here are six phrases from the story, and here is where each one comes from. Flour dusted the counter. The clock on the wall seemed to race him. The butter melted in the warm pan. Callum's face fell. He had been all thumbs all morning. And on page four, a bowl of chocolate sat melting in hot water beside him. Run the test on each one. If it could be true word for word, drag it to Means What It Says. If it means more, drag it to Means More." },
      hint: { audio: `${Q}/c-3-sort-says-or-more-hint.mp3`, script: "Picture that one happening in a real kitchen, word for word. If you can see it exactly like that, it means what it says." },
      explain: { audio: `${Q}/c-3-sort-says-or-more-explain.mp3`, script: "Flour on the counter, butter melting in a pan, and a bowl sitting in hot water all really happen, so they mean what they say. A clock cannot race, a face cannot fall off, and nobody is all thumbs, so those three mean more." },
      interaction: { type: "sort", buckets: ["Means What It Says","Means More"], bucketAudio: { "Means What It Says": `${Q}/b-means-what-it-says.mp3`, "Means More": `${Q}/b-means-more.mp3` }, items: [{ label: "flour dusted the counter", bucket: "Means What It Says" }, { label: "the clock seemed to race him", bucket: "Means More" }, { label: "the butter melted in the pan", bucket: "Means What It Says" }, { label: "his face fell", bucket: "Means More" }, { label: "he was all thumbs", bucket: "Means More" }, { label: "melting in hot water", bucket: "Means What It Says" }], coachWrong: "Run the test again. Could that one really happen in a kitchen, exactly the way the words say it?" },
    },
    {
      id: "c-4-piece-of-cake-twice",
      band: "core",
      difficulty: 4,
      prompt: "Where does a piece of cake mean more than it says?",
      narration: { audio: `${Q}/c-4-piece-of-cake-twice.mp3`, script: "The same words show up twice in this story. On page two, Astrid said, mixing is a piece of cake. On page five, Grandpa cut the first piece of cake for Callum, who had earned it. Same words, but the test gives a different answer each time. Four phrases from the story are on your screen, and only one of them uses a piece of cake to mean more than it says. Tap that one." },
      hint: { audio: `${Q}/c-4-piece-of-cake-twice-hint.mp3`, script: "Read around each one. Was there a real cake in the room when those words were said? If there was, the words mean what they say." },
      explain: { audio: `${Q}/c-4-piece-of-cake-twice-explain.mp3`, script: "Mixing is a piece of cake means more than it says. There was no cake yet, and Astrid meant that mixing is easy. On page five, Grandpa cut a real piece of a real cake." },
      interaction: { type: "choose", options: [{ id: "mixing-is-a-piece-of-cake", label: "mixing is a piece of cake" }, { id: "cut-the-first-piece-of-cake", label: "cut the first piece of cake" }, { id: "melting-in-hot-water", label: "melting in hot water" }, { id: "flour-dusted-the-counter", label: "flour dusted the counter" }], correctId: "mixing-is-a-piece-of-cake", coachWrong: "Read around that one. Is there a real thing you could touch in that sentence? Then it means what it says. Find the one where there is not." },
    },
    {
      id: "c-5-all-thumbs",
      band: "core",
      difficulty: 5,
      prompt: "What does all thumbs mean here?",
      narration: { audio: `${Q}/c-5-all-thumbs.mp3`, script: "Page three again. He had been all thumbs all morning, dropping the spoon twice and spilling the sugar, and now there was no cake at all. Nobody has a hand made only of thumbs, so all thumbs means more than it says. Read around it. Four plain versions are on your screen. Tap the one the story supports." },
      hint: { audio: `${Q}/c-5-all-thumbs-hint.mp3`, script: "Read around it. The sentence tells you two things Callum kept doing wrong with his hands. What kind of person does that?" },
      explain: { audio: `${Q}/c-5-all-thumbs-explain.mp3`, script: "It means he was clumsy with his hands. Dropping the spoon and spilling the sugar are the clues, because those are the mistakes clumsy hands make." },
      interaction: { type: "choose", options: [{ id: "he-was-clumsy-with-his-hands", label: "he was clumsy with his hands" }, { id: "he-had-too-many-thumbs", label: "he had too many thumbs" }, { id: "he-gave-a-big-thumbs-up", label: "he gave a big thumbs up" }, { id: "his-thumbs-were-sore", label: "his thumbs were sore" }], correctId: "he-was-clumsy-with-his-hands", coachWrong: "Read around it again. He dropped the spoon and spilled the sugar. What does that tell you about his hands?" },
    },
    {
      id: "c-6-speak-face-fell",
      band: "core",
      difficulty: 6,
      prompt: "What does his face fell mean here? Say the plain version, then the clue.",
      narration: { audio: `${Q}/c-6-speak-face-fell.mp3`, script: "Now say it out loud. Page three says, the first cake came out as flat as a pancake, and Callum's face fell. Tap the mic. Say the plain version of his face fell, then say the words from the page that told you. Start with, it means." },
      hint: { audio: `${Q}/c-6-speak-face-fell-hint.mp3`, script: "Think about how Callum felt when he saw that flat cake, then say what the cake looked like as your clue." },
      explain: { audio: `${Q}/c-6-speak-face-fell-explain.mp3`, script: "It means he looked disappointed. The clue is, as flat as a pancake. His hopes dropped when he saw the flat cake, and his face showed it." },
      interaction: { type: "speak", text: "sad disappointed upset unhappy let down frowned frown crushed gloomy bad flat pancake cake failed ruined hopes worked hard dropped" },
    },
    {
      id: "h-1-simile-flat-as-a-pancake",
      band: "harder",
      difficulty: 1,
      prompt: "What does as flat as a pancake tell you about the cake?",
      narration: { audio: `${Q}/h-1-simile-flat-as-a-pancake.mp3`, script: "Here is a fourth grade step. Writers sometimes compare two things using the word like or the word as. That is called a simile, and you unpack it by asking what the two things have in common. Watch me. Page one says, his hands shook like leaves in the wind. Leaves in the wind shake fast and never hold still, so the simile tells me Callum's hands were shaking hard, because he was nervous. Now you unpack one. Page three says, the first cake came out as flat as a pancake. Think about what a pancake and that cake have in common. What does the simile tell you about the cake? Tap it." },
      hint: { audio: `${Q}/h-1-simile-flat-as-a-pancake-hint.mp3`, script: "A pancake is thin and low. A birthday cake is supposed to be tall. What went wrong with this one?" },
      explain: { audio: `${Q}/h-1-simile-flat-as-a-pancake-explain.mp3`, script: "It tells you the cake did not rise at all. A pancake is thin and flat, so a cake as flat as a pancake never rose the way a cake should." },
      interaction: { type: "choose", options: [{ id: "it-did-not-rise-at-all", label: "it did not rise at all" }, { id: "it-tasted-like-a-pancake", label: "it tasted like a pancake" }, { id: "it-was-cooked-in-a-pan", label: "it was cooked in a pan" }, { id: "it-was-ready-to-eat", label: "it was ready to eat" }], correctId: "it-did-not-rise-at-all", coachWrong: "Unpack the simile. What is the one thing a pancake and this cake have in common? Think about height." },
    },
    {
      id: "h-2-slow-hands-points-back",
      band: "harder",
      difficulty: 2,
      prompt: "What does slow hands mean to Callum here?",
      narration: { audio: `${Q}/h-2-slow-hands-points-back.mp3`, script: "Sometimes a phrase means more because of something the story set up earlier. Page three ends like this. Then he remembered what Grandpa always said about baking: slow hands, sweet cake. Page four says, so Callum mixed a second batter, thought, slow hands, and stirred the batter gently. On page four, slow hands is not really about how fast his hands move. It points back to Grandpa's saying. What does slow hands mean to Callum here? Tap it." },
      hint: { audio: `${Q}/h-2-slow-hands-points-back-hint.mp3`, script: "Think about what Grandpa's saying is advice for. Callum rushed the first cake. What should he do differently?" },
      explain: { audio: `${Q}/h-2-slow-hands-points-back-explain.mp3`, script: "It means take your time and be careful. Grandpa's saying is advice about not rushing, and when Callum thinks slow hands, he is reminding himself of it." },
      interaction: { type: "choose", options: [{ id: "take-your-time-be-careful", label: "take your time, be careful" }, { id: "his-hands-were-too-cold", label: "his hands were too cold" }, { id: "use-the-slow-mixer-setting", label: "use the slow mixer setting" }, { id: "wait-for-grandpa-to-help", label: "wait for grandpa to help" }], correctId: "take-your-time-be-careful", coachWrong: "Go back to Grandpa's saying. It is advice about how to bake, and the first cake went wrong because Callum rushed." },
    },
    {
      id: "h-3-which-words-slow-hands",
      band: "harder",
      difficulty: 3,
      prompt: "Which words on page four show what slow hands means?",
      narration: { audio: `${Q}/h-3-which-words-slow-hands.mp3`, script: "Here is all of page four. So Callum mixed a second batter, thought, slow hands, and stirred the batter gently while a bowl of chocolate sat melting in hot water beside him. He set the timer, watched through the oven window, and did not open the door once. This time the cake rose tall and golden, and he spread the frosting until it was as smooth as glass. Four groups of words from that page are on your screen. Only one of them shows Callum doing what slow hands means. Tap that one." },
      hint: { audio: `${Q}/h-3-which-words-slow-hands-hint.mp3`, script: "Slow hands is about how Callum works, not about the chocolate, the window, or how the cake turned out. Find the words that show his hands at work." },
      explain: { audio: `${Q}/h-3-which-words-slow-hands-explain.mp3`, script: "The words are, stirred the batter gently. Stirring gently is Callum taking his time and being careful, which is exactly what slow hands means." },
      interaction: { type: "choose", options: [{ id: "stirred-the-batter-gently", label: "stirred the batter gently" }, { id: "melting-in-hot-water", label: "melting in hot water" }, { id: "rose-tall-and-golden", label: "rose tall and golden" }, { id: "through-the-oven-window", label: "through the oven window" }], correctId: "stirred-the-batter-gently", coachWrong: "Those words are on page four, but they do not show Callum's hands being careful. Find what he did with the batter." },
    },
    {
      id: "h-4-speak-smooth-as-glass",
      band: "harder",
      difficulty: 4,
      prompt: "What does as smooth as glass tell you about the frosting? Say it, then say why.",
      narration: { audio: `${Q}/h-4-speak-smooth-as-glass.mp3`, script: "Last one, out loud. Page four ends with, he spread the frosting until it was as smooth as glass. That is a simile, so unpack it. Think about what glass and that frosting have in common. Tap the mic. Say what the simile tells you about the frosting, then say what glass is like that made you think so." },
      hint: { audio: `${Q}/h-4-speak-smooth-as-glass-hint.mp3`, script: "Run your hand over a window in your mind. What do you feel, and what do you not feel? The frosting was like that." },
      explain: { audio: `${Q}/h-4-speak-smooth-as-glass-explain.mp3`, script: "It tells you the frosting was perfectly smooth, with no bumps or lumps, because glass is flat and shiny with nothing sticking up." },
      interaction: { type: "speak", text: "smooth flat even shiny glossy slick level bumps lumps bump lump perfect neat clean polished ripples wrinkles nothing sticking spread" },
    },
  ],
};
