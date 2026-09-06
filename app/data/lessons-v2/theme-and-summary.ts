import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./theme-and-summary-timings.json";

// Theme and Summary (RL.4.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=theme-and-summary
// G4-U1 lesson 2. THEME AS A BIG IDEA + THE THREE-SENTENCE SUMMARY tier of
// RL.4.2 (sibling split: follow-the-message RL.3.2 owns the G3 recount and the
// message a tale SHOWS, plus its quiz's G4-transfer "theme = one word like
// honesty / courage / patience" (kingfisher, hedgehog), so those three theme
// words and its Shows the Message sort are burned and none is used here;
// the-whole-chapter RL.3.10 owns the G3 capstone; text-says-so-i-know RL.4.1
// owns evidence-to-inference, so citing details here always serves THEME;
// parts-that-build RL.3.5 owns chapter/stanza/scene). THIS lesson owns the G4
// step-up: theme as a big idea about life in one or two words, told apart from
// the TOPIC (surface subject) and from a MORAL (a rule of advice), proven with
// details from at least three pages (best evidence, then a second detail from
// a different page); and the SUMMARY as three sentences (who wanted what, what
// got in the way, how it ended), Big Beat vs Small Detail, the summary
// sentences in order, telling a summary from a retelling that keeps
// everything, and producing the whole summary aloud. ONE original story, "The
// Elm Fort": Anouk (ten) and her brother Emil (fourteen); the fort in the old
// elm has to come down; she paints it red and sleeps in it, feels the wet bark,
// pulls the nails herself and keeps the boards, stands in the yard and watches,
// builds a bench facing the sapling, gives the lantern away,
// and can say "I know" without her voice shaking. 20 sentences over 7
// child-read pages in real paragraphs (read-along 1/3/5/7 with ref-chained
// images, accept-mode speaks 2/4/6 at 48/41/50 tokens, no " my " token),
// complex sentences with relative pronouns (that Dad had nailed up, who was
// fourteen, which was as thick as her waist), past perfect + progressive,
// dialogue with action beats ("This elm is dying from the inside," he said,
// rapping the trunk with his knuckles), stretch words arborist (defined in
// text) / hollow / defiant / rapping / sapling, no digits, no contractions in
// child-read text. THEME never printed: letting go (carried by pages 3, 4, 5,
// 6, 7); the TOPIC tile a surface reader picks (tree forts); the MORAL a third
// grader picks (always listen to experts); the wrong big idea (teamwork,
// because Emil helps build the bench). ANCHOR FRESHNESS grep-swept vs every
// lessons-v2 + quizzes-v2 file: Anouk, Emil, elm, arborist, sapling, cherries,
// tree fort, wet cardboard, letting go as a theme all 0 hits (a treehouse is a
// pulley prop in pictures-that-teach, a stump a fishing landmark, a lantern a
// festival prop). Keys prefixed quiz- are picture supports for the quiz's
// fresh second story (The Long Rope: Teodora, Mina, Mr. Okonkwo, Ashgrove, a
// jump rope team, all 0 hits).

const A = (id: string) => `/audio/lessons-v2/theme-and-summary/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/theme-and-summary/${w.toLowerCase()}.png`;

export const themeAndSummaryImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A sunny backyard with a huge old elm tree at the far end, a flat platform of plain gray wooden boards nailed high in the fork of its thick branches with a short rope ladder hanging down, a ten year old girl with olive skin and short dark hair held back by a green headband, wearing blue denim overalls over a white shirt, sitting on the edge of the platform with her legs dangling and looking down worried, a man in an orange safety vest and white hard hat with a coil of rope over one shoulder pressing his thumb into the soft bark of the trunk and frowning, and a father with light skin, a short dark beard, and a red plaid shirt standing beside him with his arms crossed, a wooden fence and a small white house in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same backyard at night with a dark blue starry sky and no moon, the same huge old elm tree with the same flat platform high in its branches, but now every board of the platform is painted bright red, a small glowing lantern hanging from the lowest thick branch, one large completely bare branch with no leaves at all, dead gray wood, sticking out directly above the platform over the girl's head, clearly different from the leafy branches, the same ten year old girl with olive skin, short dark hair, a green headband, and blue denim overalls sitting on the red boards with her palm flat on the trunk, and a tall fourteen year old boy with olive skin and curly dark hair in a gray hooded sweatshirt climbing the rope ladder toward her holding a flashlight and a small brown paper bag. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no face on anything, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same backyard on a gray overcast day, the huge old elm tree is completely gone and only a wide fresh pale tree stump with visible rings remains where it stood, a stack of red painted boards lying in the grass, a worker in an orange safety vest and white hard hat carrying a chainsaw away toward a truck, the same ten year old girl with olive skin, short dark hair, a green headband, and blue denim overalls standing in the grass beside the same tall fourteen year old boy with olive skin and curly dark hair in a gray hooded sweatshirt, both of them watching the stump, and the same father with light skin, a short dark beard, and a red plaid shirt kneeling to set a very small young elm sapling with a few green leaves into a hole in the ground a few steps from the stump. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "The same backyard on a golden autumn evening, a low simple bench built from red painted boards standing in the grass and facing a small young elm sapling that holds a few yellow leaves, the wide pale tree stump a few steps behind the sapling, the same ten year old girl with olive skin, short dark hair, a green headband, and blue denim overalls sitting on the bench, and the same tall fourteen year old boy with olive skin and curly dark hair in a gray hooded sweatshirt sitting down beside her and nodding toward the sapling, fallen yellow leaves on the grass, the wooden fence and small white house behind them, no lantern anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-rope-practice": "A bright gym inside a community recreation center, two children turning a very long jump rope in a wide arc, a ten year old girl with brown skin and two dark braids wearing a purple T shirt and black shorts caught mid jump with the rope tangled around her ankles and a surprised face, beside her a girl with pale skin, red curly hair, and a yellow T shirt tapping her foot and clapping the beat, a man with dark brown skin, a shaved head, a gray tracksuit, and a whistle on a cord watching from the side, a row of other children waiting along the wall. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no posters, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-porch-practice": { subject: "The same ten year old girl with brown skin, two dark braids, a purple T shirt, and black shorts jumping over a thin white clothesline rope tied to the wooden railing of a small front porch at dusk, a warm porch light glowing, a shaggy brown dog sitting on the lawn below with its head tilted up howling, purple evening sky with the first stars. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no face on the stars, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-rope-practice" }
};

export const themeAndSummary: LessonDef = {
  id: "theme-and-summary",
  title: "Theme and Summary",
  grade: "4th Grade",
  standard: "RL.4.2",
  archetype: "story-elements",
  objective: "I can name the theme of a story as a big idea about life, prove it with details from across the text, and summarize the story in three sentences.",
  concepts: [
    "the topic is the surface subject, a moral is a rule of advice, the theme is a big idea about life",
    "a theme is never printed, it comes from details on many pages",
    "the best evidence is the detail that really shows the theme",
    "a second detail from another page makes the theme solid",
    "a summary keeps the big beats: who wanted what, what got in the way, how it ended",
    "a retelling keeps everything, a summary keeps the spine",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Elm Fort, named its theme from details across the pages, and summarized it in three sentences with only the big beats. The summary is what happened. The theme is what it means. Both jobs are yours now.",
    "title": "Theme and Summary, Done",
    "body": "You named a theme as a big idea about life, proved it with details from three pages, and summarized the whole story in three sentences."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Elm Fort, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Today a story gets two jobs done on it. Job one is the theme, a big idea about life that the story shows but never prints. Job two is the summary, the whole story in three sentences, with only the big beats. Here is page one of The Elm Fort. Read along with me, and notice what matters to Anouk." },
      interaction: { type: "read-along", text: "Every summer since she was six, Anouk had climbed into the fort in the old elm at the end of the yard, a platform of gray boards that Dad had nailed up the year they moved in. This June an arborist, a tree doctor with a coil of rope over one shoulder, pressed his thumb into the trunk and frowned at how easily the bark gave way. \"This elm is dying from the inside,\" he said, rapping the trunk with his knuckles until it answered with a hollow sound, \"and it has to come down before the first big storm.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-topic-moral-theme",
      purpose: "model",
      gate: "none",
      prompt: "Topic, moral, theme. Only one is a big idea about life.",
      fx: {"text":"Topic. Moral. **Theme**.","effect":"pop-words"},
      narration: { audio: A("model-topic-moral-theme"), script: "Three words get mixed up, so let me set them side by side. The topic is what the story is about on the surface, and page one hands it to you: a fort in an elm tree. A moral is a rule, a sentence of advice with a should or a never in it, like, never climb a dying tree. A theme is neither of those. A theme is a big idea about life, said in one or two words, like belonging, or second chances, and the story never prints it. It comes from details on many pages, so one page is never enough to name it. Page one has planted its first detail already. The fort has mattered to Anouk for years, and now it has to come down. Hold that detail, and keep reading." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Anouk spent the next week proving him wrong. She propped a ladder against the trunk and painted every board a bright, defiant red. She hung a lantern from the lowest branch, which was as thick as her waist, and she slept up there two nights in a row.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and hold on to what Anouk does to the boards." },
      interaction: { type: "speak", text: "Anouk spent the next week proving him wrong She propped a ladder against the trunk and painted every board a bright defiant red She hung a lantern from the lowest branch which was as thick as her waist and she slept up there two nights in a row" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the branch above them.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and notice what Anouk sees and feels on the tree while Emil talks." },
      interaction: { type: "read-along", text: "Emil, who was fourteen and had not climbed the fort in two summers, found her there on the third night with a flashlight and a paper bag of cherries. \"You cannot paint a tree back to life,\" he said, handing up the bag and settling onto the boards beside her. Anouk said nothing, but she noticed that the branch above them had not grown a single leaf, and that the bark under her palm felt like wet cardboard.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: In the morning she asked Dad whether the boards could be saved. He said they could, if she was the one who pulled the nails. It took her the whole day, and she kept every board, even the two that split.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to who does the work." },
      interaction: { type: "speak", text: "In the morning she asked Dad whether the boards could be saved He said they could if she was the one who pulled the nails It took her the whole day and she kept every board even the two that split" },
    },
    {
      id: "page-5-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and watch where Anouk stands.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five. Read along with me, and notice what Anouk had planned to do, and what she does instead." },
      interaction: { type: "read-along", text: "Anouk had planned to watch from her bedroom window, but when the saw started up on that gray Thursday, she walked out and stood in the yard beside Emil, and she did not look away once. Before the crew had even packed up, Dad set a young elm, no taller than Anouk, into a hole three steps from the stump.", audio: A("page-5-read-sentence") },
    },
    {
      id: "guided-choose-theme",
      purpose: "guided",
      gate: "interaction",
      prompt: "Five pages in. Which one is the theme?",
      narration: { audio: A("guided-choose-theme"), script: "Now you have five pages of details, and that is enough to name the theme. Think about the whole arc so far. Anouk paints the boards and sleeps in the fort, then she feels the wet bark and sees the bare branch, then she pulls the nails herself, then she stands in the yard and watches. Four tiles are on your screen. One is the topic. One is a moral. One is a big idea the story never shows. One is the theme, the big idea about life that these details keep pointing at. Tap the theme." },
      interaction: { type: "choose", options: [{ id: "letting-go", label: "letting go" }, { id: "tree-forts", label: "tree forts" }, { id: "always-listen-to-experts", label: "always listen to experts" }, { id: "teamwork", label: "teamwork" }], correctId: "letting-go", coachWrong: "Test that against the whole story. Is it the surface subject, a rule of advice, or something the pages never show? The theme is the big idea the details keep pointing at." },
    },
    {
      id: "guided-choose-best-evidence",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail best shows the theme of letting go?",
      narration: { audio: A("guided-choose-best-evidence"), script: "Here is the fourth grade move. A theme has to be proven, and several details can be true while only one really shows it. My theme is letting go. Four details from the story are on your screen, and every one of them is in the text. One of them shows Anouk letting go. The others are true, but they show something else, like how hard she held on, or how sick the tree was, or nothing at all. Tap the best evidence." },
      interaction: { type: "choose", options: [{ id: "she-did-not-look-away-once", label: "she did not look away once" }, { id: "she-painted-the-boards-red", label: "she painted the boards red" }, { id: "the-branch-had-no-leaves", label: "the branch had no leaves" }, { id: "emil-brought-cherries", label: "emil brought cherries" }], correctId: "she-did-not-look-away-once", coachWrong: "That detail is true, but ask what it shows. Painting shows holding on, and a bare branch shows a dying tree. Which detail shows Anouk facing what she cannot keep?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: That fall, Anouk and Emil built a low bench from the red boards and set it facing the sapling. She sat there most evenings and watched it hold its first leaves against the wind. When the boy next door asked for the lantern, she handed it over without a word.",
      narration: { audio: A("page-6-read"), script: "Page six is yours. Read all three sentences out loud, and hold on to what happens to the lantern." },
      interaction: { type: "speak", text: "That fall Anouk and Emil built a low bench from the red boards and set it facing the sapling She sat there most evenings and watched it hold its first leaves against the wind When the boy next door asked for the lantern she handed it over without a word" },
    },
    {
      id: "apply-choose-second-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which detail from page six points the same way?",
      narration: { audio: A("apply-choose-second-detail"), script: "One detail proves a theme, and a second detail from a different page makes it solid. My first detail is from page five, where Anouk stood in the yard and did not look away. Now I want a second detail from page six that points the same way, toward letting go. Four details from page six are on your screen, all of them true. Only one of them shows the same idea. Tap it." },
      interaction: { type: "choose", options: [{ id: "she-gave-the-lantern-away", label: "she gave the lantern away" }, { id: "the-bench-was-low", label: "the bench was low" }, { id: "the-boards-were-red", label: "the boards were red" }, { id: "emil-helped-build-the-bench", label: "emil helped build the bench" }], correctId: "she-gave-the-lantern-away", coachWrong: "That detail is true, but it tells about the bench or about Emil. Which detail shows Anouk letting something go?" },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page. Read along with me, and listen to what Anouk can say now." },
      interaction: { type: "read-along", text: "One evening Emil came out and sat down on the bench beside her, nodding at the sapling. \"It will be a long time before anybody climbs that one,\" he said. \"I know,\" Anouk said, and she found that she could say it without her voice shaking.", audio: A("page-7-read-sentence") },
    },
    {
      id: "apply-sort-big-beat",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Big Beat, or Small Detail?",
      narration: { audio: A("apply-sort-big-beat"), script: "Job two is the summary, and a summary keeps only the big beats. A big beat is something the story cannot do without, like who wanted what, what got in the way, or how it ended. A small detail is real and often lovely, but the story would still be the same story without it. Six cards from The Elm Fort are on your screen. If the story falls apart without it, drag it to Big Beat. If the story would survive without it, drag it to Small Detail." },
      interaction: { type: "sort", buckets: ["Big Beat","Small Detail"], items: [{ label: "anouk fought for the fort", bucket: "Big Beat" }, { label: "emil brought cherries", bucket: "Small Detail" }, { label: "the tree came down", bucket: "Big Beat" }, { label: "the boards were red", bucket: "Small Detail" }, { label: "a bench by the new tree", bucket: "Big Beat" }, { label: "the crew came on a thursday", bucket: "Small Detail" }], coachWrong: "Ask whether the story would still be the same story without that card. If it would, the card is a small detail." },
    },
    {
      id: "apply-sequence-summary",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the three summary sentences in order.",
      narration: { audio: A("apply-sequence-summary"), script: "Now build the summary itself. Three sentences are on your screen, one for who wanted what, one for what got in the way, and one for how it ended, but they are mixed up. Tap them in story order, first the want, then the trouble, then the ending." },
      interaction: { type: "sequence", items: [{ id: "want", label: "anouk wants to keep the fort" }, { id: "trouble", label: "the tree comes down anyway" }, { id: "ending", label: "a bench beside the new tree" }], order: ["want","trouble","ending"], coachWrong: "Story order. What did Anouk want before anything went wrong, what went wrong, and what came last?" },
    },
    {
      id: "apply-choose-fix-retelling",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is wrong with this summary?",
      narration: { audio: A("apply-choose-fix-retelling"), script: "A summary is not a retelling. A retelling keeps everything, and a summary keeps the spine. Four possible problems are on your screen, and only one of them is true of the summary you are about to hear. Tap that problem after you hear it. Here is the summary a student wrote. Anouk loved the fort in the old elm. An arborist said the tree was dying. She painted the boards red, hung a lantern, and slept up there, and Emil brought her cherries in a paper bag. The tree came down on a Thursday, and later she and Emil built a bench beside the new tree." },
      interaction: { type: "choose", options: [{ id: "it-keeps-small-details", label: "it keeps small details" }, { id: "it-adds-an-opinion", label: "it adds an opinion" }, { id: "it-skips-the-ending", label: "it skips the ending" }, { id: "it-mixes-up-the-order", label: "it mixes up the order" }], correctId: "it-keeps-small-details", coachWrong: "Check the summary against that problem. Does it really do that? Listen again for what a summary should have left out." },
    },
    {
      id: "challenge-speak-summary",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the summary: who wanted what, what got in the way, how it ended.",
      narration: { audio: A("challenge-speak-summary"), script: "Last one, and you make the whole summary out loud. Tap the mic. Say three sentences about the story. First, who wanted what. Then, what got in the way. Then, how it ended. Big beats only, no opinion, and no cherries." },
      interaction: { type: "speak", text: "anouk wanted keep fort tree elm dying die cut down came fell arborist storm boards nails pulled saved kept bench sapling built new young emil planted stump gone lost" },
    },
    {
      id: "celebrate-theme-and-summary",
      purpose: "celebrate",
      gate: "none",
      prompt: "Theme is what it means. Summary is what happened.",
      fx: {"text":"**Theme** is what it means. **Summary** is what happened.","effect":"fireworks"},
      narration: { audio: A("celebrate-theme-and-summary"), script: "Two jobs, both done. You named the theme as a big idea about life, not the topic and not a rule, and you proved it with details from three different pages. Then you summarized the whole story in three sentences, big beats only, with the small details and the opinions left out. The summary is what happened. The theme is what it means. That is how a fourth grade reader finishes a story." },
    },
  ],
};
