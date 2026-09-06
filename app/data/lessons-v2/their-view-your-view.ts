import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./their-view-your-view-timings.json";

// Their View, Your View (RL.3.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=their-view-your-view
// G3-U2. THREE VIEWS ON ONE STORY tier of RL.3.6 (sibling split: whos-telling-it
// RL.1.6 owns G1 who-is-telling with I/me vs he/she/they and quote marks;
// two-ways-to-see RL.2.6 owns G2 two characters feeling differently about one
// event, Rose and Ben and the storm; why-they-did-it RL.3.3 owns trait, want,
// and feeling; follow-the-message RL.3.2 owns the message; show-me-where RL.3.1
// owns pointing to the proving line). THIS lesson owns the third-grade
// step-up: a first-person narrator who is a character WITH AN OPINION, found
// in the words she chooses (the worst partner, a partner who never talks never
// helps); a second character's view from his actions (Elias tapes a gentler
// curve) and a third character's view from his words (Joss: quiet is not the
// same as lazy); and the reader's own view held APART from the narrator's,
// backed by a detail from the story. ONE original story, "The Quiet Partner":
// Sylvie is paired with Elias for the class marble run, decides on page one
// that he is the worst partner in the third grade, and keeps most of that
// opinion even after his gentle curve is the part that works. 15 sentences
// over 5 child-read pages (read-along 1/3/5 with images, speak 2/4), compound
// + early-complex sentences, four speech-tagged dialogue lines, stretch words
// measured / radiator / complained / admit with in-text support. Speak texts
// avoid the token " my " (Speak.tsx flips to exact-read on it), so the
// child-read pages say I, mine, and ours. ANCHOR FRESHNESS grep-swept vs
// every lessons-v2 + quizzes-v2 file: Sylvie, Elias, Joss, Ms. Birch, marble,
// marble run, radiator, quiet partner, worst partner, gentle curve, fifth
// grade, after the bell all 0 hits (cardboard / tape / ramp only props
// elsewhere; the new-neighbor premise was dropped because more-than-it-says
// already carries a shy new neighbor). Keys prefixed quiz- are picture
// supports for the quiz's fresh second story (Tilda, Zeke, the meteor shower
// on the coldest night of October: meteor, frost, backyard-at-night, silly
// plan all fresh).

const A = (id: string) => `/audio/lessons-v2/their-view-your-view/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/their-view-your-view/${w.toLowerCase()}.png`;

export const theirViewYourViewImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A girl with light brown skin and a short black bob haircut wearing a striped orange shirt, sitting at a plain wooden classroom worktable with her arms crossed and her chin lifted, beside a boy with pale skin, freckles, and messy red hair in a gray hoodie who is looking down at the table and holding one small glass marble, a stack of flat brown cardboard strips and a roll of tape on the table between them, a teacher with dark brown skin and a gray cardigan standing behind them, one big sunny window and plain bare cream walls with nothing hanging on them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no posters, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same girl with light brown skin and a short black bob in a striped orange shirt standing at the same plain wooden classroom worktable with her hands on her hips, frowning at a wobbly cardboard marble run made of brown cardboard strips that leans to one side, while the same boy with pale skin, freckles, and messy red hair in a gray hoodie kneels beside the table carefully pressing a piece of tape onto a curved strip of cardboard, one small glass marble lying on the floor under a metal radiator beneath the big window, plain bare cream walls with nothing hanging on them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same girl with light brown skin and a short black bob in a striped orange shirt and the same boy with pale skin, freckles, messy red hair, and bright red ears in a gray hoodie standing behind the same plain wooden worktable, where a tall finished cardboard marble run with three curved turns carries one small glass marble down into a paper cup at the bottom, a crowd of other third grade children gathered around the table watching with wide eyes, the same teacher with dark brown skin and a gray cardigan smiling beside them, plain bare cream walls and one big window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-backyard-night": "A girl with dark brown skin and curly black hair in a puffy purple coat and a boy with light skin and short brown hair in a green knit hat lying side by side on a lawn under thick red plaid blankets in a small fenced backyard at night, frost sparkling on the grass, a dark blue sky full of many small stars with no moon, a small wooden house with one dark window behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon anywhere, no faces on any objects, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-cocoa-jug": { subject: "The same boy with light skin, short brown hair, and a green knit hat grinning widely while carrying two folded red plaid blankets stacked in his arms with a plain blue metal jug balanced on top, walking across the same small fenced backyard at dusk toward the same girl with dark brown skin and curly black hair in a puffy purple coat, who is spreading a blanket on the grass, orange and purple dusk sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-backyard-night" },
  "quiz-meteor-sky": { subject: "A wide dark blue night sky over the same small fenced backyard filled with many bright white streaks of light shooting across the stars in the same direction, the same girl with dark brown skin and curly black hair in a puffy purple coat and the same boy with light skin and a green knit hat sitting up in their red plaid blankets on the frosty grass pointing up at the sky with open mouths, no moon anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no faces on any objects, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-backyard-night" }
};

export const theirViewYourView: LessonDef = {
  id: "their-view-your-view",
  title: "Their View, Your View",
  grade: "3rd Grade",
  standard: "RL.3.6",
  archetype: "story-elements",
  objective: "I can tell the narrator's view and the characters' views apart from my own view, and back my view with a reason from the story.",
  concepts: [
    "the word I means a character is telling the story",
    "a narrator can have an opinion, and it lives in the words she chooses",
    "a character's view shows in what he says and does",
    "my view can match the narrator's or differ from it",
    "a view needs a reason from the story",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Quiet Partner and kept three views apart: what the narrator thought, what the characters thought, and what you think. You can agree with a narrator, or you can disagree, as long as your reason comes from the story. That is how a third grade reader reads with her own mind.",
    "title": "Three Views, One Story",
    "body": "You told the narrator's view and the characters' views apart from your own, and you backed your view with a reason from the story."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Quiet Partner, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. One story can hold three views. What a character thinks. What the narrator thinks, because the voice telling a story can have opinions too. And what you think, which does not have to match either one. Here is page one of The Quiet Partner. Read along with me, and watch for the little word I." },
      interaction: { type: "read-along", text: "\"Sylvie,\" said Ms. Birch, \"you and Elias will build the marble run together.\" I knew right away that I had the worst partner in the third grade, because Elias never talked, and in my opinion a partner who never talks is a partner who never helps. \"You do not have to say anything,\" I told him, \"because I already have a plan.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-who-is-telling",
      purpose: "model",
      gate: "none",
      prompt: "Who is telling it? Look for the little word.",
      fx: {"text":"**I** knew right away","effect":"underline"},
      narration: { audio: A("model-who-is-telling"), script: "Here is how I find the teller. I look for the little words. Page one says, I knew right away. I told him. In my opinion. The teller says I, so the teller is a character inside the story, and Ms. Birch calls her Sylvie. Sylvie is the narrator. Now, a narrator who is a character has opinions, and an opinion is not a fact. A fact is something you could check, like who built the marble run. An opinion is a judgment, like calling a plan silly, or calling a day the best day ever. Sylvie's opinions are hiding in the words she chose on page one. Read the page again in your head, and find the judgment she makes about Elias before he has done a single thing." },
    },
    {
      id: "guided-choose-narrator-view",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does the narrator, Sylvie, think about Elias?",
      narration: { audio: A("guided-choose-narrator-view"), script: "Your turn. What does Sylvie think about Elias on page one? Four views are on your screen. Only one of them is what the narrator says she thinks. Tap it." },
      interaction: { type: "choose", options: [{ id: "elias-will-be-no-help-at-all", label: "elias will be no help at all" }, { id: "elias-is-a-careful-builder", label: "elias is a careful builder" }, { id: "the-marble-run-will-be-easy", label: "the marble run will be easy" }, { id: "the-teacher-is-being-unfair", label: "the teacher is being unfair" }], correctId: "elias-will-be-no-help-at-all", coachWrong: "Check that view against page one. Which one did Sylvie say, in her own words, before the project even started?" },
    },
    {
      id: "guided-choose-words-show-view",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words show the narrator's opinion?",
      fx: {"text":"Fact, or **opinion**?","effect":"underline"},
      narration: { audio: A("guided-choose-words-show-view"), script: "An opinion lives in the words a narrator chooses. Four pieces of page one are on your screen, and all four are really there. Three of them are facts you could check. One is a judgment that only Sylvie could make. Tap the words that show her opinion." },
      interaction: { type: "choose", options: [{ id: "the-worst-partner", label: "the worst partner" }, { id: "build-the-marble-run", label: "build the marble run" }, { id: "elias-never-talked", label: "elias never talked" }, { id: "i-already-have-a-plan", label: "i already have a plan" }], correctId: "the-worst-partner", coachWrong: "Those words tell you something that happened, and anyone could check it. Find the words that judge Elias instead of describing him." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: On Monday, Elias showed up early and slid a folded sheet of paper across the table without a word: a sketch of a ramp with three turns, drawn so carefully that every curve was measured. I pushed it aside, because I was sure that a quiet partner could not have a better plan than mine.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read both sentences out loud, and notice what Elias does, because his actions will matter more than the narrator's opinion." },
      interaction: { type: "speak", text: "On Monday Elias showed up early and slid a folded sheet of paper across the table without a word a sketch of a ramp with three turns drawn so carefully that every curve was measured I pushed it aside because I was sure that a quiet partner could not have a better plan than mine" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch Elias's hands.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and watch what Elias does after the marble falls off." },
      interaction: { type: "read-along", text: "By Wednesday, our first ramp wobbled so badly that the marble flew off at the second turn and rolled under the radiator. \"Building is hard when only one person does the work,\" I said. Elias did not argue; he picked up his sketch, smoothed it flat, and began taping a gentler curve onto the cardboard, and he was still taping when the bell rang.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-elias-view",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does Elias think about the ramp? Use what he does.",
      narration: { audio: A("guided-choose-elias-view"), script: "Elias never says what he thinks, so you find his view the way you find any character's view, in what he says and does. On page three, watch his hands. Four views are on your screen. Tap the one his actions show." },
      interaction: { type: "choose", options: [{ id: "the-curve-should-be-gentler", label: "the curve should be gentler" }, { id: "the-ramp-is-fine-as-it-is", label: "the ramp is fine as it is" }, { id: "the-project-is-not-worth-it", label: "the project is not worth it" }, { id: "sylvie-should-build-it-alone", label: "sylvie should build it alone" }], correctId: "the-curve-should-be-gentler", coachWrong: "Look at what Elias did with the tape and the cardboard. What part of the ramp was he changing?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: That night I complained to Joss, who is in fifth grade and thinks he knows everything. \"Quiet is not the same as lazy, Sylvie,\" Joss said, \"and a partner who keeps working after the bell sounds shy to me.\" I told him that shy and lazy looked exactly the same from where I was sitting.",
      narration: { audio: A("page-4-read"), script: "Page four is yours, and a second character speaks up. Read all three sentences out loud, and listen for a view that does not match the narrator's." },
      interaction: { type: "speak", text: "That night I complained to Joss who is in fifth grade and thinks he knows everything Quiet is not the same as lazy Sylvie Joss said and a partner who keeps working after the bell sounds shy to me I told him that shy and lazy looked exactly the same from where I was sitting" },
    },
    {
      id: "guided-choose-joss-view",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does Joss think about Elias?",
      narration: { audio: A("guided-choose-joss-view"), script: "Joss is a character, so his view lives in his words. Think about what he said to Sylvie on page four. Four views are on your screen. Tap the one that belongs to Joss." },
      interaction: { type: "choose", options: [{ id: "elias-is-shy-not-lazy", label: "elias is shy, not lazy" }, { id: "elias-is-lazy-not-shy", label: "elias is lazy, not shy" }, { id: "sylvie-needs-a-new-partner", label: "sylvie needs a new partner" }, { id: "the-marble-run-will-fail", label: "the marble run will fail" }], correctId: "elias-is-shy-not-lazy", coachWrong: "That is not what Joss said. Play page four again in your head. What did Joss call a partner who keeps working after the bell?" },
    },
    {
      id: "apply-sort-narrator-joss",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Narrator Thinks, or Joss Thinks?",
      narration: { audio: A("apply-sort-narrator-joss"), script: "Here are six views from the story. Some belong to Sylvie, the narrator. Some belong to Joss. Read each one, and think about who said it, or who would say it. Drag it to Narrator Thinks or to Joss Thinks." },
      interaction: { type: "sort", buckets: ["Narrator Thinks","Joss Thinks"], items: [{ label: "quiet partners never help", bucket: "Narrator Thinks" }, { label: "elias is shy, not lazy", bucket: "Joss Thinks" }, { label: "shy and lazy look the same", bucket: "Narrator Thinks" }, { label: "working late is not lazy", bucket: "Joss Thinks" }, { label: "elias is the worst partner", bucket: "Narrator Thinks" }, { label: "quiet does not mean lazy", bucket: "Joss Thinks" }], coachWrong: "Go back to who said it. Sylvie judges Elias before he has done anything. Joss looks at what Elias did after the bell. Whose way of thinking is this?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and notice whether the narrator changes her mind, or keeps it." },
      interaction: { type: "read-along", text: "On Friday, the whole class crowded around our table, and Ms. Birch dropped the marble at the top of the run. It rattled through all three turns, dipped through the gentle curve that Elias had taped, and landed in the cup with a soft clink. Elias's ears turned red, and he whispered, \"It works,\" so quietly that only I could hear him. I still think a partner should talk more than Elias does, but the gentle curve was his idea, and I have to admit that ours was the only marble run in the room that worked.", audio: A("page-5-read-sentence") },
    },
    {
      id: "model-reader-view",
      purpose: "model",
      gate: "none",
      prompt: "Your view can be different, as long as you have a reason.",
      fx: {"text":"**I think**, and here is **why**","effect":"pop-words"},
      narration: { audio: A("model-reader-view"), script: "Now the third view, yours. A third grade reader does not have to agree with the narrator, and the narrator does not get the last word. Here is how I do it. Sylvie thinks Elias is a lazy partner. Here is what I think. I think Elias is careful and shy, and that is different from what the narrator thinks. My reason comes from the story. He showed up early with a sketch so careful that every curve was measured, and on Friday his curve was the part that worked. I did not guess. I held the narrator's view in one hand and the story's details in the other, and I made up my own mind." },
    },
    {
      id: "apply-choose-disagree-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which detail could make a reader disagree with the narrator?",
      narration: { audio: A("apply-choose-disagree-detail"), script: "Sylvie says a partner who never talks never helps. Four details from the story are on your screen, and all four really happened. Three of them fit what Sylvie thinks, or do not matter either way. One of them gives a reader a reason to disagree with her. Tap that detail." },
      interaction: { type: "choose", options: [{ id: "taping-when-the-bell-rang", label: "taping when the bell rang" }, { id: "he-never-said-a-word", label: "he never said a word" }, { id: "the-first-ramp-wobbled", label: "the first ramp wobbled" }, { id: "she-already-had-a-plan", label: "she already had a plan" }], correctId: "taping-when-the-bell-rang", coachWrong: "Ask, does this detail show Elias helping? If it shows him being quiet, or shows the ramp failing, it does not argue with Sylvie." },
    },
    {
      id: "apply-choose-pronoun-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which line tells you a character is telling this story?",
      fx: {"text":"Who is telling it? Look for the **little word**.","effect":"underline"},
      narration: { audio: A("apply-choose-pronoun-clue"), script: "One last check on the teller. Four lines from the story are on your screen. Only one of them holds the little word that proves a character is telling the story. Tap that line." },
      interaction: { type: "choose", options: [{ id: "i-knew-right-away", label: "i knew right away" }, { id: "elias-never-talked-line", label: "elias never talked" }, { id: "the-marble-flew-off", label: "the marble flew off" }, { id: "his-ears-turned-red", label: "his ears turned red" }], correctId: "i-knew-right-away", coachWrong: "That line talks about someone else. Find the line where the teller talks about herself." },
    },
    {
      id: "challenge-speak-your-view",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What do you think about Elias? Does your view match the narrator's? Say why.",
      narration: { audio: A("challenge-speak-your-view"), script: "Last one, and it is your view, out loud. Tap the mic. Say what you think about Elias, say whether that matches what the narrator thinks or is different, and give one reason from the story. Start with, I think." },
      interaction: { type: "speak", text: "shy careful quiet helpful hardworking kind clever smart patient lazy worst good partner agree disagree different same match matches narrator sylvie sketch ramp curve bell taping taped fixed early worked works" },
    },
    {
      id: "celebrate-three-views",
      purpose: "celebrate",
      gate: "none",
      prompt: "Their view, your view.",
      fx: {"text":"**Their** view. **Your** view.","effect":"fireworks"},
      narration: { audio: A("celebrate-three-views"), script: "You held three views apart today. You found the teller by the word I, and you found her opinion in the words she chose. You found one character's view by watching what he did, and another character's view by listening to what he said. Then you made up your own mind, and you backed it with a reason from the story. From now on, when a narrator tells you what to think, you can listen, check the story, and decide for yourself." },
    },
  ],
};
