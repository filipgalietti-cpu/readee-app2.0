import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Why They Did It QUIZ (RL.3.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge
// how-does-she-feel / what-did-she-do at 3 options w/ picture support) /
// core(on-grade G3: trait from repeated actions, which-action-shows-it,
// motivation behind a choice, trait-vs-feeling sort, what-happened-because,
// production speak) / harder(G4 transfer RL.4.3: describe a character IN
// DEPTH from specific details, her words, thoughts, and actions, MODELED in
// h-1 first, then a detail-kind sort, a second character, and a two-detail
// production speak). ALL-FRESH second story, "The Blue Umbrella" (Ines, new
// at school, and Kwame caught in the rain by the fence), spoken page by page
// INSIDE the questions so every Q is self-contained; nothing from the lesson
// story (Yara/Nico/Millbrook/the wheel) is reused. Names + setting grep-swept
// vs lessons-v2 + quizzes-v2: Ines, Kwame, crackers, drenched, saved spot
// fresh (0 hits). Quiz support images live in the lesson's image dir
// (quiz- keys). Tiles are audio-free lowercase; bucket clips b-* are synthed
// from punctuated labels before quiz-tts and whisper-verified.

const Q = "/audio/quizzes-v2/why-they-did-it-quiz";
const IMG = (w: string) => `/images/lessons-v2/why-they-did-it/${w.toLowerCase()}.png`;

export const whyTheyDidItQuiz: QuizDef = {
  id: "why-they-did-it-quiz",
  lessonId: "why-they-did-it",
  title: "Why They Did It Quiz",
  standard: "RL.3.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-how-feel-lunch",
      band: "easier",
      difficulty: 1,
      prompt: "How did Ines feel at lunch?",
      image: IMG("quiz-lunch-alone"),
      narration: { audio: `${Q}/e-1-how-feel-lunch.mp3`, script: "Here is page one of a new story called The Blue Umbrella. Ines had been at her new school for one week, and she still ate lunch alone at the end of the long table. Every morning she thought, maybe today somebody will sit with me. How did Ines feel at lunch? Tap the feeling." },
      hint: { audio: `${Q}/e-1-how-feel-lunch-hint.mp3`, script: "Look at her face in the picture. She is sitting by herself, and she is wishing for company." },
      explain: { audio: `${Q}/e-1-how-feel-lunch-explain.mp3`, script: "Ines felt lonely. She ate alone every day, and every morning she hoped somebody would sit with her." },
      interaction: { type: "choose", options: [{ id: "lonely", label: "lonely" }, { id: "proud", label: "proud" }, { id: "angry", label: "angry" }], correctId: "lonely", coachWrong: "Nobody sat with her all week. Which feeling matches an empty table?" },
    },
    {
      id: "e-2-what-did-ines-do",
      band: "easier",
      difficulty: 2,
      prompt: "What did Ines do when the rain came?",
      image: IMG("quiz-umbrella-rain"),
      narration: { audio: `${Q}/e-2-what-did-ines-do.mp3`, script: "Page two. On Thursday, the sky cracked open at the end of recess, and a boy named Kwame stood frozen by the fence without a coat. Ines ran across the wet field and held her umbrella over both of them. What did Ines do when the rain came? Tap it." },
      hint: { audio: `${Q}/e-2-what-did-ines-do-hint.mp3`, script: "The picture shows it. Look at what Ines is holding, and who is standing under it." },
      explain: { audio: `${Q}/e-2-what-did-ines-do-explain.mp3`, script: "Ines held her umbrella over Kwame. She ran across the wet field so that both of them could stand under it." },
      interaction: { type: "choose", options: [{ id: "held-her-umbrella-over-kwame", label: "held her umbrella over kwame" }, { id: "ran-inside-to-stay-dry", label: "ran inside to stay dry" }, { id: "waited-by-the-fence", label: "waited by the fence" }], correctId: "held-her-umbrella-over-kwame", coachWrong: "Look at the picture again. Where is Ines standing, and what is over her head?" },
    },
    {
      id: "e-3-how-feel-tray",
      band: "easier",
      difficulty: 3,
      prompt: "How did Ines feel when Kwame sat down?",
      image: IMG("quiz-lunch-together"),
      narration: { audio: `${Q}/e-3-how-feel-tray.mp3`, script: "Page three. At lunch on Friday, Kwame set his tray down across from her, and a warm surprise spread through her chest. How did Ines feel when Kwame sat down? Tap the feeling." },
      hint: { audio: `${Q}/e-3-how-feel-tray-hint.mp3`, script: "The page says a warm surprise spread through her chest. Look at her face in the picture too." },
      explain: { audio: `${Q}/e-3-how-feel-tray-explain.mp3`, script: "Ines felt happy and surprised. Somebody finally sat with her, and the story calls it a warm surprise." },
      interaction: { type: "choose", options: [{ id: "happy-and-surprised", label: "happy and surprised" }, { id: "bored-and-sleepy", label: "bored and sleepy" }, { id: "scared-and-quiet", label: "scared and quiet" }], correctId: "happy-and-surprised", coachWrong: "A warm surprise is a good feeling. Which pair of words is a good feeling?" },
    },
    {
      id: "e-4-what-did-ines-want",
      band: "easier",
      difficulty: 4,
      prompt: "What did Ines want?",
      image: IMG("quiz-lunch-alone"),
      narration: { audio: `${Q}/e-4-what-did-ines-want.mp3`, script: "Listen to page one again. Ines had been at her new school for one week, and she still ate lunch alone at the end of the long table. Every morning she thought, maybe today somebody will sit with me. What did Ines want? Tap it." },
      hint: { audio: `${Q}/e-4-what-did-ines-want-hint.mp3`, script: "Listen to what she thought every morning. A thought like that tells you a want." },
      explain: { audio: `${Q}/e-4-what-did-ines-want-explain.mp3`, script: "Ines wanted somebody to sit with her. Every morning she thought, maybe today somebody will sit with me." },
      interaction: { type: "choose", options: [{ id: "somebody-to-sit-with-her", label: "somebody to sit with her" }, { id: "a-new-blue-umbrella", label: "a new blue umbrella" }, { id: "to-eat-lunch-outside", label: "to eat lunch outside" }], correctId: "somebody-to-sit-with-her", coachWrong: "Think about her thought every morning. What was she hoping would happen at lunch?" },
    },
    {
      id: "c-1-trait-from-actions",
      band: "core",
      difficulty: 1,
      prompt: "What is Ines like? Tap the word her actions prove.",
      narration: { audio: `${Q}/c-1-trait-from-actions.mp3`, script: "Now count what Ines does again and again. On Thursday, she ran across the wet field and held her umbrella over Kwame. On Friday, she shared her crackers with a girl who had forgotten her lunch, and she gave up her seat by the window for a boy with a sore ankle. Three actions, one trait. What is Ines like? Tap the word her actions prove." },
      hint: { audio: `${Q}/c-1-trait-from-actions-hint.mp3`, script: "Every one of those actions gives something of hers to somebody else. What do you call a person who does that again and again?" },
      explain: { audio: `${Q}/c-1-trait-from-actions-explain.mp3`, script: "Ines is generous. She gave her umbrella, her crackers, and her seat. Three times, so that is what she is like." },
      interaction: { type: "choose", options: [{ id: "generous", label: "generous" }, { id: "grumpy", label: "grumpy" }, { id: "careless", label: "careless" }, { id: "bossy", label: "bossy" }], correctId: "generous", coachWrong: "Check that word against her three actions. Did she do that kind of thing again and again?" },
    },
    {
      id: "c-2-which-action-shows-it",
      band: "core",
      difficulty: 2,
      prompt: "Which line from the story proves Ines is generous?",
      narration: { audio: `${Q}/c-2-which-action-shows-it.mp3`, script: "A trait needs proof. Listen to page two again. On Thursday, the sky cracked open at the end of recess, and a boy named Kwame stood frozen by the fence without a coat. Ines ran across the wet field and held her umbrella over both of them. Four lines from the story are on your screen, and all of them are really in the story. Tap the line that proves Ines is generous." },
      hint: { audio: `${Q}/c-2-which-action-shows-it-hint.mp3`, script: "Two of those lines are about Kwame, and one is about the weather. Find the line where Ines gives something." },
      explain: { audio: `${Q}/c-2-which-action-shows-it-explain.mp3`, script: "The line is, held her umbrella over both. Ines shared her umbrella with a boy she did not even know, and that is generous." },
      interaction: { type: "choose", options: [{ id: "held-her-umbrella-over-both", label: "held her umbrella over both" }, { id: "stood-frozen-by-the-fence", label: "stood frozen by the fence" }, { id: "the-sky-cracked-open", label: "the sky cracked open" }, { id: "set-his-tray-down", label: "set his tray down" }], correctId: "held-her-umbrella-over-both", coachWrong: "That line is in the story, but it is about Kwame or the rain. Which line shows what Ines gave?" },
    },
    {
      id: "c-3-motivation-saved-spot",
      band: "core",
      difficulty: 3,
      prompt: "Why did Ines save a spot at her table all week?",
      narration: { audio: `${Q}/c-3-motivation-saved-spot.mp3`, script: "Now the want behind a choice. At the end of the story, Kwame asked, you saved a spot? And Ines said, I have been saving one all week. Think back to page one, where she ate alone and thought, maybe today somebody will sit with me. Why did Ines save a spot all week? Tap the reason behind her choice." },
      hint: { audio: `${Q}/c-3-motivation-saved-spot-hint.mp3`, script: "Her want is in her morning thought. What was she hoping for every single day?" },
      explain: { audio: `${Q}/c-3-motivation-saved-spot-explain.mp3`, script: "She hoped for a lunch friend. Every morning she thought somebody might sit with her, so she kept a spot open just in case." },
      interaction: { type: "choose", options: [{ id: "she-hoped-for-a-lunch-friend", label: "she hoped for a lunch friend" }, { id: "she-wanted-to-eat-alone", label: "she wanted to eat alone" }, { id: "her-mother-told-her-to", label: "her mother told her to" }, { id: "the-table-was-too-small", label: "the table was too small" }], correctId: "she-hoped-for-a-lunch-friend", coachWrong: "The story never says that. Go back to her thought every morning. What did she want?" },
    },
    {
      id: "c-4-sort-trait-feeling",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Trait, or Feeling?",
      narration: { audio: `${Q}/c-4-sort-trait-feeling.mp3`, script: "Here are six things you could say about Ines. Some are traits, what she is like all through the story. Some are feelings, what she felt at one moment before it passed. Ask, does this last, or does this pass? Drag each one to Trait or to Feeling." },
      hint: { audio: `${Q}/c-4-sort-trait-feeling-hint.mp3`, script: "Would it still be true of Ines next month? Then it lasts. Does it belong to one moment on one page? Then it passes." },
      explain: { audio: `${Q}/c-4-sort-trait-feeling-explain.mp3`, script: "Sharing what she has, thinking of other people, and keeping hope every day are traits. They last. Lonely at the table, surprised when Kwame sat down, and happy at Friday lunch are feelings. Each one belongs to a moment." },
      interaction: { type: "sort", buckets: ["Trait","Feeling"], bucketAudio: { "Trait": `${Q}/b-trait.mp3`, "Feeling": `${Q}/b-feeling.mp3` }, items: [{ label: "shares what she has", bucket: "Trait" }, { label: "lonely at the long table", bucket: "Feeling" }, { label: "thinks of other people", bucket: "Trait" }, { label: "surprised when kwame sat", bucket: "Feeling" }, { label: "keeps hoping every day", bucket: "Trait" }, { label: "happy at friday lunch", bucket: "Feeling" }], coachWrong: "Ask the question again. Does this last all through the story, or does it pass after one moment?" },
    },
    {
      id: "c-5-because-umbrella",
      band: "core",
      difficulty: 5,
      prompt: "Because Ines held her umbrella over Kwame, what happened next?",
      narration: { audio: `${Q}/c-5-because-umbrella.mp3`, script: "Now the chain. Because she did this, that happened next. On Thursday, Ines held her umbrella over Kwame in the rain. On Friday, at lunch, Kwame set his tray down across from her. Because Ines held her umbrella over Kwame, what happened next? Tap the event her action caused." },
      hint: { audio: `${Q}/c-5-because-umbrella-hint.mp3`, script: "Go to Friday. Who came to her table, and what had she done for him the day before?" },
      explain: { audio: `${Q}/c-5-because-umbrella-explain.mp3`, script: "Kwame sat with her at lunch. She shared her umbrella on Thursday, and because of that, he set his tray down across from her on Friday." },
      interaction: { type: "choose", options: [{ id: "kwame-sat-with-her-at-lunch", label: "kwame sat with her at lunch" }, { id: "her-umbrella-blew-away", label: "her umbrella blew away" }, { id: "the-teacher-called-her-name", label: "the teacher called her name" }, { id: "kwame-gave-her-his-coat", label: "kwame gave her his coat" }], correctId: "kwame-sat-with-her-at-lunch", coachWrong: "The story never says that. What happened at lunch on Friday, the day after the rain?" },
    },
    {
      id: "c-6-speak-trait-and-proof",
      band: "core",
      difficulty: 6,
      prompt: "What is Ines like? Say the trait, then the action that proves it.",
      narration: { audio: `${Q}/c-6-speak-trait-and-proof.mp3`, script: "Now say it out loud. Tap the mic. Say the word for what Ines is like, then say one thing she did that proves it. Start with, Ines is." },
      hint: { audio: `${Q}/c-6-speak-trait-and-proof-hint.mp3`, script: "Think about the three things she gave away. Name the trait, then name one of those things." },
      explain: { audio: `${Q}/c-6-speak-trait-and-proof-explain.mp3`, script: "Ines is generous. She held her umbrella over Kwame, she shared her crackers, and she gave up her seat by the window." },
      interaction: { type: "speak", text: "generous kind giving sharing shares shared caring thoughtful helpful friendly nice umbrella crackers seat held gave rain kwame lunch window" },
    },
    {
      id: "h-1-what-her-words-tell",
      band: "harder",
      difficulty: 1,
      prompt: "What do Ines's words tell you about her?",
      narration: { audio: `${Q}/h-1-what-her-words-tell.mp3`, script: "Here is a fourth grade step. Readers describe a character in depth by using three kinds of details, what she says, what she thinks, and what she does. Watch me use a thought. Page one says, every morning she thought, maybe today somebody will sit with me. That thought tells me Ines stays hopeful even when things are hard. Now you use her words. On page two, Kwame said, you did not have to do that, and Ines shrugged and said, nobody should get drenched alone. What do her words tell you about her? Tap it." },
      hint: { audio: `${Q}/h-1-what-her-words-tell-hint.mp3`, script: "Nobody should get drenched alone. She is not talking about herself. Who is she thinking about?" },
      explain: { audio: `${Q}/h-1-what-her-words-tell-explain.mp3`, script: "Her words show she cares how others feel. She could have kept the umbrella to herself, but she said nobody should get drenched alone." },
      interaction: { type: "choose", options: [{ id: "she-cares-how-others-feel", label: "she cares how others feel" }, { id: "she-is-afraid-of-storms", label: "she is afraid of storms" }, { id: "she-wants-to-go-home", label: "she wants to go home" }, { id: "she-does-not-like-kwame", label: "she does not like kwame" }], correctId: "she-cares-how-others-feel", coachWrong: "Her words do not say that. Listen again to what she said about getting drenched, and think about who it is for." },
    },
    {
      id: "h-2-sort-words-thoughts-actions",
      band: "harder",
      difficulty: 2,
      prompt: "Sort the details: Words, Thoughts, or Actions?",
      narration: { audio: `${Q}/h-2-sort-words-thoughts-actions.mp3`, script: "An in-depth description keeps the three kinds of details straight. Words are what Ines says out loud. Thoughts are what she thinks inside her head. Actions are what she does. Here are six details about Ines from the story. Drag each one to Words, Thoughts, or Actions." },
      hint: { audio: `${Q}/h-2-sort-words-thoughts-actions-hint.mp3`, script: "Did she say it out loud, did she think it in her head, or did she do it with her hands and feet?" },
      explain: { audio: `${Q}/h-2-sort-words-thoughts-actions-explain.mp3`, script: "Nobody should get drenched, and saving one all week, are her words. Somebody will sit with me, and what a friend feels like, are her thoughts. Shared her crackers, and held her umbrella over both, are her actions." },
      interaction: { type: "sort", buckets: ["Words","Thoughts","Actions"], bucketAudio: { "Words": `${Q}/b-words.mp3`, "Thoughts": `${Q}/b-thoughts.mp3`, "Actions": `${Q}/b-actions.mp3` }, items: [{ label: "nobody should get drenched", bucket: "Words" }, { label: "somebody will sit with me", bucket: "Thoughts" }, { label: "shared her crackers", bucket: "Actions" }, { label: "saving one all week", bucket: "Words" }, { label: "what a friend feels like", bucket: "Thoughts" }, { label: "held her umbrella over both", bucket: "Actions" }], coachWrong: "Ask how that detail reached you. Through her mouth, inside her head, or through what she did?" },
    },
    {
      id: "h-3-what-kwames-words-tell",
      band: "harder",
      difficulty: 3,
      prompt: "What do Kwame's words tell you about him?",
      narration: { audio: `${Q}/h-3-what-kwames-words-tell.mp3`, script: "Now describe the other character from his words alone. On Thursday, when Ines held the umbrella over him, Kwame said, you did not have to do that. On Friday, when he saw the open spot, he asked, you saved a spot? What do Kwame's words tell you about him? Tap it." },
      hint: { audio: `${Q}/h-3-what-kwames-words-tell-hint.mp3`, script: "Both times he speaks, somebody has just done something for him. Listen to how he reacts." },
      explain: { audio: `${Q}/h-3-what-kwames-words-tell-explain.mp3`, script: "His words show he is surprised by kindness. Both times, he did not expect anyone to do something for him, and both times he noticed." },
      interaction: { type: "choose", options: [{ id: "he-is-surprised-by-kindness", label: "he is surprised by kindness" }, { id: "he-is-angry-about-the-rain", label: "he is angry about the rain" }, { id: "he-wants-to-eat-alone", label: "he wants to eat alone" }, { id: "he-forgot-his-umbrella", label: "he forgot his umbrella" }], correctId: "he-is-surprised-by-kindness", coachWrong: "His words do not show that. Both times he speaks, he is reacting to something Ines did. What does his reaction tell you?" },
    },
    {
      id: "h-4-speak-in-depth",
      band: "harder",
      difficulty: 4,
      prompt: "Describe Ines in depth: trait, one action, one thing she said or thought.",
      narration: { audio: `${Q}/h-4-speak-in-depth.mp3`, script: "Last one, out loud, fourth grade style. Describe Ines in depth. Tap the mic. Say what she is like, then give two details, one thing she did, and one thing she said or thought. Start with, Ines is." },
      hint: { audio: `${Q}/h-4-speak-in-depth-hint.mp3`, script: "Name the trait. Then pick one thing she gave away, and one line she said out loud or thought in her head." },
      explain: { audio: `${Q}/h-4-speak-in-depth-explain.mp3`, script: "Ines is generous and hopeful. She held her umbrella over Kwame, and she said nobody should get drenched alone. Two kinds of details make the description deep." },
      interaction: { type: "speak", text: "generous kind caring giving thoughtful hopeful friendly umbrella crackers seat held shared gave rain drenched alone somebody sit spot saving week friend thought said kwame" },
    },
  ],
};
