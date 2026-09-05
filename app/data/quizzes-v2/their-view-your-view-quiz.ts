import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Their View, Your View QUIZ (RL.3.6) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// who is telling, the pronoun clue, a character's feeling and the words that
// show it, 3 options w/ picture support) / core(on-grade G3: the narrator's
// view, the words that carry it, a character's view, a Narrator/Zeke sort,
// the detail a reader could disagree with, production speak) / harder(G4
// transfer RL.4.6: first person vs third person, the same event told by each,
// and the dialogue trap, TAUGHT in the stimulus first, closing with a
// first-person retell speak). ALL-FRESH second story, "The Silly Plan"
// (Tilda sleeps in the backyard on the coldest night of October to watch the
// meteor shower; cousin Zeke loves the idea; a THIRD-PERSON narrator with an
// opinion calls it a silly plan, says anybody with sense would go inside, and
// says Zeke was probably wrong), spoken page by page INSIDE the questions so
// every Q is self-contained; nothing from the lesson story (Sylvie, Elias,
// Joss, the marble run) is reused. Names + setting grep-swept vs lessons-v2 +
// quizzes-v2: Tilda, Zeke, meteor, frost-at-night, silly plan all 0 hits.
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/their-view-your-view-quiz";
const IMG = (w: string) => `/images/lessons-v2/their-view-your-view/${w.toLowerCase()}.png`;

export const theirViewYourViewQuiz: QuizDef = {
  id: "their-view-your-view-quiz",
  lessonId: "their-view-your-view",
  title: "Their View, Your View Quiz",
  standard: "RL.3.6",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-who-is-telling",
      band: "easier",
      difficulty: 1,
      prompt: "Who is telling this story?",
      image: IMG("quiz-backyard-night"),
      narration: { audio: `${Q}/e-1-who-is-telling.mp3`, script: "Here is page one of a new story called The Silly Plan. Tilda had a plan, and like most of Tilda's plans, it was a silly one. She wanted to sleep in the backyard on the coldest night of October so she could watch the meteor shower. Who is telling this story? Tap the answer." },
      hint: { audio: `${Q}/e-1-who-is-telling-hint.mp3`, script: "Listen for the little words. Does the teller say I, or does the teller say she and her?" },
      explain: { audio: `${Q}/e-1-who-is-telling-explain.mp3`, script: "A narrator outside the story is telling it. The teller says Tilda and she, never I, so the teller is not a character in the story." },
      interaction: { type: "choose", options: [{ id: "a-narrator-outside-the-story", label: "a narrator outside the story" }, { id: "tilda", label: "tilda" }, { id: "zeke", label: "zeke" }], correctId: "a-narrator-outside-the-story", coachWrong: "Think about the little words. Did the teller ever say I?" },
    },
    {
      id: "e-2-pronoun-clue",
      band: "easier",
      difficulty: 2,
      prompt: "Which little word tells you the teller is outside the story?",
      narration: { audio: `${Q}/e-2-pronoun-clue.mp3`, script: "Listen to one line again. She wanted to sleep in the backyard on the coldest night of October. Which little word tells you the teller is outside the story? Tap it." },
      hint: { audio: `${Q}/e-2-pronoun-clue-hint.mp3`, script: "A character telling her own story says I or we. An outside teller uses a different word for Tilda." },
      explain: { audio: `${Q}/e-2-pronoun-clue-explain.mp3`, script: "The word she tells you. An outside narrator says she and her, not I." },
      interaction: { type: "choose", options: [{ id: "she", label: "she" }, { id: "i", label: "i" }, { id: "we", label: "we" }], correctId: "she", coachWrong: "That word is what a character says about herself. Which word did the teller use about Tilda?" },
    },
    {
      id: "e-3-how-zeke-feels",
      band: "easier",
      difficulty: 3,
      prompt: "How does Zeke feel about the plan?",
      image: IMG("quiz-cocoa-jug"),
      narration: { audio: `${Q}/e-3-how-zeke-feels.mp3`, script: "Page two. Zeke carried out two blankets and a jug of hot cocoa, and he said, this is going to be the best night of the whole year. How does Zeke feel about the plan? Tap it." },
      hint: { audio: `${Q}/e-3-how-zeke-feels-hint.mp3`, script: "Look at his face in the picture, and listen to what he called the night." },
      explain: { audio: `${Q}/e-3-how-zeke-feels-explain.mp3`, script: "Zeke feels excited. He called it the best night of the whole year, and he carried out blankets and cocoa to get ready." },
      interaction: { type: "choose", options: [{ id: "excited", label: "excited" }, { id: "worried", label: "worried" }, { id: "bored", label: "bored" }], correctId: "excited", coachWrong: "Listen to what Zeke called the night. Is that what a person says when they feel that way?" },
    },
    {
      id: "e-4-words-show-zeke",
      band: "easier",
      difficulty: 4,
      prompt: "Which words show what Zeke thinks?",
      image: IMG("quiz-meteor-sky"),
      narration: { audio: `${Q}/e-4-words-show-zeke.mp3`, script: "Page four. When the alarm buzzed, the sky was full of streaks of light, dozens of them, falling faster than either cousin could count. I told you, Zeke whispered, and for once Tilda did not argue. Which words show what Zeke thinks? Tap them." },
      hint: { audio: `${Q}/e-4-words-show-zeke-hint.mp3`, script: "Zeke's view is in the words he said out loud. Which of these did Zeke say?" },
      explain: { audio: `${Q}/e-4-words-show-zeke-explain.mp3`, script: "The words are, I told you. Zeke said them, and they show he thinks he was right about the plan." },
      interaction: { type: "choose", options: [{ id: "i-told-you", label: "i told you" }, { id: "the-alarm-buzzed", label: "the alarm buzzed" }, { id: "streaks-of-light", label: "streaks of light" }], correctId: "i-told-you", coachWrong: "Those words tell what happened in the sky. Find the words that Zeke himself said." },
    },
    {
      id: "c-1-narrator-view",
      band: "core",
      difficulty: 1,
      prompt: "What does the narrator think about Tilda's plan?",
      narration: { audio: `${Q}/c-1-narrator-view.mp3`, script: "Now the narrator's view. This narrator stays outside the story, but she still has opinions. Listen to page one. Tilda had a plan, and like most of Tilda's plans, it was a silly one. She wanted to sleep in the backyard on the coldest night of October so she could watch the meteor shower. Her cousin Zeke thought it was the best idea he had ever heard, and he was probably wrong about that too. What does the narrator think about Tilda's plan? Tap it." },
      hint: { audio: `${Q}/c-1-narrator-view-hint.mp3`, script: "Listen for the judging word the narrator uses about the plan, right on the first line." },
      explain: { audio: `${Q}/c-1-narrator-view-explain.mp3`, script: "The narrator thinks the plan is silly. The narrator calls it a silly one, and says Zeke was probably wrong to love it." },
      interaction: { type: "choose", options: [{ id: "the-plan-is-silly", label: "the plan is silly" }, { id: "the-plan-is-clever", label: "the plan is clever" }, { id: "the-plan-is-dangerous", label: "the plan is dangerous" }, { id: "the-plan-is-boring", label: "the plan is boring" }], correctId: "the-plan-is-silly", coachWrong: "The narrator never uses that word. Listen for the word the narrator chose for the plan." },
    },
    {
      id: "c-2-words-show-opinion",
      band: "core",
      difficulty: 2,
      prompt: "Which words show the narrator's opinion?",
      narration: { audio: `${Q}/c-2-words-show-opinion.mp3`, script: "Page three. By midnight the grass was stiff with frost, and anybody with sense would have gone inside. Tilda pulled the blanket up to her chin and stayed exactly where she was. Four pieces of that page are on your screen. Three are facts. One is the narrator's opinion. Tap the words that show the opinion." },
      hint: { audio: `${Q}/c-2-words-show-opinion-hint.mp3`, script: "A fact could be checked. An opinion judges. Which words judge what a person should do?" },
      explain: { audio: `${Q}/c-2-words-show-opinion-explain.mp3`, script: "The words are, anybody with sense. That is a judgment. The narrator thinks a sensible person would have gone inside." },
      interaction: { type: "choose", options: [{ id: "anybody-with-sense", label: "anybody with sense" }, { id: "stiff-with-frost", label: "stiff with frost" }, { id: "up-to-her-chin", label: "up to her chin" }, { id: "by-midnight", label: "by midnight" }], correctId: "anybody-with-sense", coachWrong: "Those words describe something you could check. Find the words that judge instead." },
    },
    {
      id: "c-3-tilda-view",
      band: "core",
      difficulty: 3,
      prompt: "What does Tilda think about her plan?",
      narration: { audio: `${Q}/c-3-tilda-view.mp3`, script: "Now a character's view. Listen to page three and page five. Tilda pulled the blanket up to her chin and stayed exactly where she was. They came inside at dawn with red noses and frozen toes, and Tilda declared that it had been worth every shiver. What does Tilda think about her plan? Use what she did and what she said. Tap it." },
      hint: { audio: `${Q}/c-3-tilda-view-hint.mp3`, script: "Use what Tilda did in the frost and what she declared at dawn. One choice on the screen is the narrator's view, not hers." },
      explain: { audio: `${Q}/c-3-tilda-view-explain.mp3`, script: "Tilda thinks it was worth every shiver. She stayed out in the frost, and at dawn she said so herself." },
      interaction: { type: "choose", options: [{ id: "it-was-worth-every-shiver", label: "it was worth every shiver" }, { id: "it-was-a-silly-plan", label: "it was a silly plan" }, { id: "it-was-too-cold-to-stay", label: "it was too cold to stay" }, { id: "zeke-was-wrong-about-it", label: "zeke was wrong about it" }], correctId: "it-was-worth-every-shiver", coachWrong: "That is not what Tilda said or did. Think about what she declared at dawn." },
    },
    {
      id: "c-4-sort-narrator-zeke",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Narrator Thinks, or Zeke Thinks?",
      narration: { audio: `${Q}/c-4-sort-narrator-zeke.mp3`, script: "Here are six views from The Silly Plan. Listen to the lines they come from. Like most of Tilda's plans, it was a silly one. Zeke thought it was the best idea he had ever heard, and he was probably wrong about that too. Zeke said, this is going to be the best night of the whole year. Anybody with sense would have gone inside. I told you, Zeke whispered. Now read each view on your screen. Drag it to Narrator Thinks or to Zeke Thinks." },
      hint: { audio: `${Q}/c-4-sort-narrator-zeke-hint.mp3`, script: "Ask who said it, or who would say it. The narrator judges the plan from outside. Zeke loves the plan from the very first page." },
      explain: { audio: `${Q}/c-4-sort-narrator-zeke-explain.mp3`, script: "The narrator thinks the plan is silly, anyone with sense goes in, and Zeke is probably wrong. Zeke thinks it is the best idea he ever heard, the best night of the year, and I told you so." },
      interaction: { type: "sort", buckets: ["Narrator Thinks","Zeke Thinks"], bucketAudio: { "Narrator Thinks": `${Q}/b-narrator-thinks.mp3`, "Zeke Thinks": `${Q}/b-zeke-thinks.mp3` }, items: [{ label: "the plan is silly", bucket: "Narrator Thinks" }, { label: "the best idea he ever heard", bucket: "Zeke Thinks" }, { label: "anyone with sense goes in", bucket: "Narrator Thinks" }, { label: "the best night of the year", bucket: "Zeke Thinks" }, { label: "zeke is probably wrong", bucket: "Narrator Thinks" }, { label: "i told you so", bucket: "Zeke Thinks" }], coachWrong: "Who said it, or who would say it? The narrator judges the plan from outside. Zeke loves the plan from the first page." },
    },
    {
      id: "c-5-reader-disagree",
      band: "core",
      difficulty: 5,
      prompt: "Which detail could make a reader disagree with the narrator?",
      narration: { audio: `${Q}/c-5-reader-disagree.mp3`, script: "Now your view. The narrator says the plan was silly. A reader is allowed to disagree, as long as a detail from the story backs the reader up. Listen to page four. When the alarm buzzed, the sky was full of streaks of light, dozens of them, falling faster than either cousin could count. Four details from the story are on your screen. Tap the one that gives a reader a reason to disagree with the narrator." },
      hint: { audio: `${Q}/c-5-reader-disagree-hint.mp3`, script: "Which detail shows the plan worked? A detail about the cold only helps the narrator." },
      explain: { audio: `${Q}/c-5-reader-disagree-explain.mp3`, script: "She saw dozens of meteors. The plan worked, so a reader could say it was not silly at all, even if the narrator never admits it." },
      interaction: { type: "choose", options: [{ id: "she-saw-dozens-of-meteors", label: "she saw dozens of meteors" }, { id: "stiff-with-frost-detail", label: "stiff with frost" }, { id: "she-came-in-with-frozen-toes", label: "she came in with frozen toes" }, { id: "it-was-the-coldest-night", label: "it was the coldest night" }], correctId: "she-saw-dozens-of-meteors", coachWrong: "That detail is about the cold, and it fits what the narrator thinks. Find the detail that shows the plan paid off." },
    },
    {
      id: "c-6-speak-your-view",
      band: "core",
      difficulty: 6,
      prompt: "What do you think about Tilda's plan? Does it match the narrator? Say why.",
      narration: { audio: `${Q}/c-6-speak-your-view.mp3`, script: "Now say your view out loud. The narrator thinks Tilda's plan was silly. Tap the mic. Say what you think about the plan, say whether that matches the narrator or is different, and give one reason from the story. Start with, I think." },
      hint: { audio: `${Q}/c-6-speak-your-view-hint.mp3`, script: "Your answer begins with the words I think. Then put the narrator's view next to yours, and finish with one reason from the story." },
      explain: { audio: `${Q}/c-6-speak-your-view-explain.mp3`, script: "One way to say it goes like this. I think the plan was a good one, which is different from the narrator, because Tilda saw dozens of meteors and said it was worth every shiver." },
      interaction: { type: "speak", text: "silly smart clever good great brave fun worth agree disagree different same match matches narrator meteors meteor shower stars streaks cold frost blankets cocoa alarm ready prepared planned happy ending right wrong" },
    },
    {
      id: "h-1-first-or-third",
      band: "harder",
      difficulty: 1,
      prompt: "Who is telling that line now?",
      narration: { audio: `${Q}/h-1-first-or-third.mp3`, script: "Here is a fourth grade step. When the teller is a character who says I, we call it first person. When the teller stays outside and says he, she, and they, we call it third person. The Silly Plan is told in third person. Page three says, Tilda pulled the blanket up to her chin and stayed exactly where she was. Now listen to the same moment told in first person instead. I pulled the blanket up to my chin and stayed exactly where I was. The event did not change, but the teller did. Who is telling that line now? Tap it." },
      hint: { audio: `${Q}/h-1-first-or-third-hint.mp3`, script: "The line says I, so a character is telling it. Which character did that in the story?" },
      explain: { audio: `${Q}/h-1-first-or-third-explain.mp3`, script: "The answer is Tilda, in first person. The line says I, so a character is telling it, and the character who pulled up the blanket was Tilda." },
      interaction: { type: "choose", options: [{ id: "tilda-in-first-person", label: "tilda, in first person" }, { id: "zeke-in-first-person", label: "zeke, in first person" }, { id: "an-outside-narrator", label: "an outside narrator" }, { id: "the-reader", label: "the reader" }], correctId: "tilda-in-first-person", coachWrong: "Look at the little word I, then ask which character did that in the story." },
    },
    {
      id: "h-2-how-it-changes",
      band: "harder",
      difficulty: 2,
      prompt: "How would Tilda tell page one in first person?",
      narration: { audio: `${Q}/h-2-how-it-changes.mp3`, script: "When the teller changes, the same event can sound very different. In third person, the narrator said, like most of Tilda's plans, it was a silly one. Now imagine Tilda telling page one herself, in first person. Think about how Tilda feels about her own plan, and remember that a first person teller says I. Which line is the way Tilda would most likely tell it? Tap it." },
      hint: { audio: `${Q}/h-2-how-it-changes-hint.mp3`, script: "First person means she says I. And Tilda believes her plan is worth it, so pick the line that does both." },
      explain: { audio: `${Q}/h-2-how-it-changes-explain.mp3`, script: "I had a wonderful plan. Tilda says I, and she believes in the plan, so she would never call it silly." },
      interaction: { type: "choose", options: [{ id: "i-had-a-wonderful-plan", label: "i had a wonderful plan" }, { id: "tilda-had-a-silly-plan", label: "tilda had a silly plan" }, { id: "i-had-a-silly-plan", label: "i had a silly plan" }, { id: "anybody-with-sense-stays-in", label: "anybody with sense stays in" }], correctId: "i-had-a-wonderful-plan", coachWrong: "Check two things. Does the line say I? And is it what Tilda herself thinks about her plan?" },
    },
    {
      id: "h-3-dialogue-trap",
      band: "harder",
      difficulty: 3,
      prompt: "Which line is told in first person?",
      narration: { audio: `${Q}/h-3-dialogue-trap.mp3`, script: "Careful with this one. A character can say I inside quote marks and the story is still third person, because the teller is still outside. Listen. I told you, Zeke whispered. The words I told you are Zeke talking, but the teller says Zeke whispered, so the story stays in third person. Four lines are on your screen. Only one of them is told in first person. Tap it." },
      hint: { audio: `${Q}/h-3-dialogue-trap-hint.mp3`, script: "First person means the teller herself says I, outside of any quote marks." },
      explain: { audio: `${Q}/h-3-dialogue-trap-explain.mp3`, script: "I set the alarm for two, is first person. The teller says I with no quote marks. Zeke said, I am ready, is a character talking inside a third person story." },
      interaction: { type: "choose", options: [{ id: "i-set-the-alarm-for-two", label: "i set the alarm for two" }, { id: "tilda-set-the-alarm-for-two", label: "tilda set the alarm for two" }, { id: "zeke-said-i-am-ready", label: "zeke said, i am ready" }, { id: "they-came-inside-at-dawn", label: "they came inside at dawn" }], correctId: "i-set-the-alarm-for-two", coachWrong: "Check who says I. If the I sits inside quote marks with a speech tag, the teller is still outside." },
    },
    {
      id: "h-4-speak-first-person-retell",
      band: "harder",
      difficulty: 4,
      prompt: "Tell the meteor moment as Tilda, in first person.",
      narration: { audio: `${Q}/h-4-speak-first-person-retell.mp3`, script: "Last one, out loud. Here is page four in third person. When the alarm buzzed, the sky was full of streaks of light, dozens of them, falling faster than either cousin could count. I told you, Zeke whispered, and for once Tilda did not argue. Tap the mic. Tell that moment as Tilda, in first person. Use the word I, and say what you saw and what Zeke said." },
      hint: { audio: `${Q}/h-4-speak-first-person-retell-hint.mp3`, script: "Your retell begins with, when the alarm buzzed, I. After that, say what you saw in the sky and what Zeke whispered." },
      explain: { audio: `${Q}/h-4-speak-first-person-retell-explain.mp3`, script: "Here is one way. When the alarm buzzed, I saw dozens of streaks of light, and Zeke whispered, I told you, and for once I did not argue." },
      interaction: { type: "speak", text: "alarm buzzed woke sky full streaks light dozens falling faster count counted meteors stars zeke whispered told argue argued cold blanket saw looked bright" },
    },
  ],
};
