import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Theme and Summary QUIZ (RL.4.2) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second story,
// "The Long Rope" (Teodora, new in Ashgrove for eleven days, answers a poster
// for the rec center's jump rope team, which needs a ninth jumper; the rope
// catches her ankles three times at the first practice, nobody laughs, and
// Mina counts the beat out loud for her; she nearly quits, practices on her
// porch with a clothesline until the neighbor's dog howls along, and by the
// fifth practice the rope does not catch her; at the spring show the rope
// turns forty times without a miss, the town paper's photo shows nine jumpers
// with Mina's arm around her, and Mina tells her which lunch table has an
// extra chair). THEME never printed: belonging; TOPIC tile: jump rope; MORAL
// tile: practice makes perfect; wrong big idea: winning. The story is spoken
// page by page INSIDE the questions so every Q is self-contained; two
// sentences are the child's on-screen read-alouds and are NEVER narrated
// anywhere in the quiz (page three's clothesline sentence in e-4, the last
// sentence in h-3; other narrations paraphrase around them). Bands:
// easier(G3-bridge at 3 options with the two quiz pictures as support:
// topic, message as a sentence, big-beat pick, plus a one-sentence
// read-aloud) / core(on-grade G4: theme among topic / moral / wrong idea, BEST
// evidence among four true details, a six-item Big Beat / Small Detail sort
// with b-* bucket clips, the three summary sentences in order, the summary
// that adds an opinion, and a production summary speak with a full accept
// list) / harder(G5 transfer, RL.5.2: how a character RESPONDS to a challenge
// shows the theme, taught on Teodora then applied to Mina; a SUMMARY OF A
// POEM modeled on an original paper-plane poem then applied to an original
// hopscotch poem; the last sentence read aloud; a closing production speak
// summarizing the hopscotch poem). Nothing from the lesson story (Anouk,
// Emil, the elm) is reused. Names + setting grep-swept vs lessons-v2 +
// quizzes-v2: Teodora, Mina, Okonkwo, Ashgrove, jump rope, hopscotch, paper
// plane, clothesline all 0 hits. Quiz support images live in the lesson's
// image dir (quiz- keys).

const Q = "/audio/quizzes-v2/theme-and-summary-quiz";
const IMG = (w: string) => `/images/lessons-v2/theme-and-summary/${w.toLowerCase()}.png`;

export const themeAndSummaryQuiz: QuizDef = {
  id: "theme-and-summary-quiz",
  lessonId: "theme-and-summary",
  title: "Theme and Summary Quiz",
  standard: "RL.4.2",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-topic-page-one",
      band: "easier",
      difficulty: 1,
      prompt: "What is The Long Rope about on the surface? Tap the topic.",
      image: IMG("quiz-rope-practice"),
      narration: { audio: `${Q}/e-1-topic-page-one.mp3`, script: "Here is a new story called The Long Rope, and your first job is the topic, the thing the story is about on the surface. Tap the topic after you hear page one. Here is page one. Teodora had lived in Ashgrove for eleven days, and in eleven days nobody at school had said much more than hello. On the twelfth day, a poster in the library window said that the rec center's jump rope team needed a ninth jumper before the spring show. She had never jumped a long rope in her life." },
      hint: { audio: `${Q}/e-1-topic-page-one-hint.mp3`, script: "The topic is the surface subject, the who and the what that the whole page keeps coming back to." },
      explain: { audio: `${Q}/e-1-topic-page-one-explain.mp3`, script: "The topic is a new girl and a rope team. The window and the hellos are single details, but the page keeps coming back to Teodora and the team she wants to join." },
      interaction: { type: "choose", options: [{ id: "a-new-girl-and-a-rope-team", label: "a new girl and a rope team" }, { id: "a-library-window", label: "a library window" }, { id: "saying-hello-at-school", label: "saying hello at school" }], correctId: "a-new-girl-and-a-rope-team", coachWrong: "That is one detail on the page. The topic is what the whole page keeps coming back to." },
    },
    {
      id: "e-2-message-sentence",
      band: "easier",
      difficulty: 2,
      prompt: "What message does the story show? Tap the sentence.",
      image: IMG("quiz-porch-practice"),
      narration: { audio: `${Q}/e-2-message-sentence.mp3`, script: "Here are pages two and three, and a third grade job first: the message, the lesson the story shows, said as a sentence. Tap the message after you hear the pages. Here is page two. The coach, Mr. Okonkwo, put her at the end of the line and said that a team of eight had a hole in every routine. At the first practice the rope caught her ankles three times, and each time it slapped the floor like a dropped pan. Nobody laughed. A girl named Mina, who jumped in the spot beside hers, began counting the beat out loud so that Teodora could hear when to jump. Here is page three. Teodora nearly quit that night. She practiced on her porch with a clothesline instead, and by the fifth practice the rope did not catch her at all." },
      hint: { audio: `${Q}/e-2-message-sentence-hint.mp3`, script: "The message shows in what Teodora does the night she nearly quits, and in what comes of it by the fifth practice." },
      explain: { audio: `${Q}/e-2-message-sentence-explain.mp3`, script: "The message is, keep trying and you fit in. Teodora nearly quit, practiced instead, and by the fifth practice the rope did not catch her once." },
      interaction: { type: "choose", options: [{ id: "keep-trying-and-you-fit-in", label: "keep trying and you fit in" }, { id: "quit-before-you-look-silly", label: "quit before you look silly" }, { id: "dogs-love-a-jump-rope", label: "dogs love a jump rope" }], correctId: "keep-trying-and-you-fit-in", coachWrong: "Test that sentence against what Teodora actually does on page three, and what happens because of it." },
    },
    {
      id: "e-3-big-beat-pick",
      band: "easier",
      difficulty: 3,
      prompt: "Which card is a big beat of the story?",
      narration: { audio: `${Q}/e-3-big-beat-pick.mp3`, script: "Here is page four, the show. A summary keeps only the big beats, the things the story cannot do without. Three cards from page four are on your screen, and only one of them is a big beat. Tap it after you hear the page. Here is page four. At the spring show, the long rope turned forty times without a miss, and when it stopped, Mr. Okonkwo had the whole team bow. In the photo that ran in the town paper, there were nine jumpers in a row, and Teodora stood in the middle with Mina's arm around her shoulders." },
      hint: { audio: `${Q}/e-3-big-beat-pick-hint.mp3`, script: "The test is which card the story would fall apart without." },
      explain: { audio: `${Q}/e-3-big-beat-pick-explain.mp3`, script: "The big beat is, the team jumps with no miss. The bow and the photo are small details, and the story would be the same story without them." },
      interaction: { type: "choose", options: [{ id: "the-team-jumps-with-no-miss", label: "the team jumps with no miss" }, { id: "the-coach-has-the-team-bow", label: "the coach has the team bow" }, { id: "the-photo-was-in-the-paper", label: "the photo was in the paper" }], correctId: "the-team-jumps-with-no-miss", coachWrong: "Take that card out of the story. Is it still the same story? Then it is a small detail." },
    },
    {
      id: "e-4-speak-read-clothesline",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Instead, she tied a clothesline to the porch railing and jumped it until the neighbor's dog howled along.",
      narration: { audio: `${Q}/e-4-speak-read-clothesline.mp3`, script: "Page three has a sentence for you to read, and it is on your screen. Tap the mic. Read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-clothesline-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word Instead." },
      explain: { audio: `${Q}/e-4-speak-read-clothesline-explain.mp3`, script: "The sentence tells you that Teodora practiced on her porch with a clothesline instead of quitting, and that the neighbor's dog howled along." },
      interaction: { type: "speak", text: "Instead she tied a clothesline to the porch railing and jumped it until the neighbor's dog howled along" },
    },
    {
      id: "c-1-theme-choose",
      band: "core",
      difficulty: 1,
      prompt: "Which one is the theme of The Long Rope?",
      narration: { audio: `${Q}/c-1-theme-choose.mp3`, script: "Now the fourth grade job, the theme. The topic is the surface subject, a moral is a rule of advice, and the theme is a big idea about life that the story shows and never prints. Four tiles are on your screen: the topic, a moral, a big idea the story never shows, and the theme. Tap the theme after you hear the story in short. Here is the story in short. Teodora was new in Ashgrove, and nobody at school said much more than hello. She joined the rec center's jump rope team, which needed a ninth jumper. At the first practice the rope caught her ankles three times, nobody laughed, and Mina counted the beat out loud for her. She nearly quit, practiced on her porch instead, and by the fifth practice the rope did not catch her at all. At the show the team jumped without a miss, and in the photo Teodora stood in the middle with Mina's arm around her. On the way out, Mina told her which lunch table had an extra chair." },
      hint: { audio: `${Q}/c-1-theme-choose-hint.mp3`, script: "Two tiles can be crossed off first, the surface subject and the rule of advice. Then ask which big idea the last two pages keep pointing at." },
      explain: { audio: `${Q}/c-1-theme-choose-explain.mp3`, script: "The theme is belonging. Jump rope is the topic, practice makes perfect is a rule, and nobody wins anything. The arm around her shoulders and the chair at the lunch table show a girl who found her place." },
      interaction: { type: "choose", options: [{ id: "belonging", label: "belonging" }, { id: "jump-rope", label: "jump rope" }, { id: "practice-makes-perfect", label: "practice makes perfect" }, { id: "winning", label: "winning" }], correctId: "belonging", coachWrong: "Is that the surface subject, a rule with advice in it, or something the story never shows? The theme is the big idea the details keep pointing at." },
    },
    {
      id: "c-2-best-evidence-belonging",
      band: "core",
      difficulty: 2,
      prompt: "Which detail best shows the theme of belonging?",
      narration: { audio: `${Q}/c-2-best-evidence-belonging.mp3`, script: "Here is the best evidence move. My theme is belonging. Four details are on your screen, and every one of them is in the story. Only one really shows belonging. The others are true, but they show effort, or trouble, or nothing at all. Tap the best evidence after you hear the pages the details come from. At the first practice the rope caught her ankles three times, and each time it slapped the floor like a dropped pan. She practiced on her porch every night after that. At the spring show, the long rope turned forty times without a miss. In the photo that ran in the town paper, there were nine jumpers in a row, and Teodora stood in the middle with Mina's arm around her shoulders." },
      hint: { audio: `${Q}/c-2-best-evidence-belonging-hint.mp3`, script: "Belonging is about being part of a group. Which detail shows someone treating Teodora as part of the team?" },
      explain: { audio: `${Q}/c-2-best-evidence-belonging-explain.mp3`, script: "The best evidence is, Mina put an arm around her. The porch shows effort, the caught ankles show trouble, and forty turns show a clean show, but an arm around her shoulders in the team photo shows that she belongs." },
      interaction: { type: "choose", options: [{ id: "mina-put-an-arm-around-her", label: "mina put an arm around her" }, { id: "she-practiced-on-the-porch", label: "she practiced on the porch" }, { id: "the-rope-caught-her-ankles", label: "the rope caught her ankles" }, { id: "the-rope-turned-forty-times", label: "the rope turned forty times" }], correctId: "mina-put-an-arm-around-her", coachWrong: "That detail is true, but ask what it shows. Effort, trouble, or a clean show is not the same as being part of the group." },
    },
    {
      id: "c-3-sort-big-beat",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Big Beat, or Small Detail?",
      narration: { audio: `${Q}/c-3-sort-big-beat.mp3`, script: "A summary keeps the big beats and drops the small details. Six cards from The Long Rope are on your screen. If the story falls apart without it, drag it to Big Beat. If the story would be the same story without it, drag it to Small Detail. Here is the story in short. Teodora was new in Ashgrove. A poster in the library window said the jump rope team needed a ninth jumper, so she joined. At the first practice the rope caught her ankles three times, and it kept catching her for weeks. She practiced on her porch every night, and a dog next door howled along. At the show she jumped clean with the team, and Mr. Okonkwo had them all bow." },
      hint: { audio: `${Q}/c-3-sort-big-beat-hint.mp3`, script: "One card at a time, ask whether the story would still be the same story without it." },
      explain: { audio: `${Q}/c-3-sort-big-beat-explain.mp3`, script: "Joining the team, the rope catching her, and jumping clean at the show are the big beats, because the story cannot happen without them. The poster in the window, the howling dog, and the bow are small details." },
      interaction: { type: "sort", buckets: ["Big Beat","Small Detail"], bucketAudio: { "Big Beat": `${Q}/b-big-beat.mp3`, "Small Detail": `${Q}/b-small-detail.mp3` }, items: [{ label: "teodora joins the rope team", bucket: "Big Beat" }, { label: "the poster was in a window", bucket: "Small Detail" }, { label: "the rope keeps catching her", bucket: "Big Beat" }, { label: "the dog howled along", bucket: "Small Detail" }, { label: "she jumps clean at the show", bucket: "Big Beat" }, { label: "the coach had the team bow", bucket: "Small Detail" }], coachWrong: "Take that card out of the story and check. Still the same story? Then it is a small detail. Story falls apart? Then it is a big beat." },
    },
    {
      id: "c-4-sequence-summary",
      band: "core",
      difficulty: 4,
      prompt: "Put the three summary sentences in story order.",
      narration: { audio: `${Q}/c-4-sequence-summary.mp3`, script: "Now build the summary. Three sentences are on your screen, one for who wanted what, one for what got in the way, and one for how it ended, but they are mixed up. Tap them in story order after you hear the story in short. Here is the story in short. Teodora was new in Ashgrove, and nobody at school said much more than hello, so she joined the jump rope team. At the first practice the rope caught her ankles three times, and it kept catching her. She practiced on her porch every night until it stopped. At the show she jumped clean, and in the team photo she stood in the middle of the row with Mina's arm around her." },
      hint: { audio: `${Q}/c-4-sequence-summary-hint.mp3`, script: "Story order. What did Teodora want before anything went wrong, what went wrong, and what came last?" },
      explain: { audio: `${Q}/c-4-sequence-summary-explain.mp3`, script: "The order is, a new girl wants to fit in, the rope catches her ankles, and she earns a place in the row. Want, then trouble, then ending." },
      interaction: { type: "sequence", items: [{ id: "want", label: "a new girl wants to fit in" }, { id: "trouble", label: "the rope catches her ankles" }, { id: "ending", label: "she earns a place in the row" }], order: ["want","trouble","ending"], coachWrong: "Picture the story. That sentence comes after something else has already happened. What had to happen first?" },
    },
    {
      id: "c-5-summary-opinion",
      band: "core",
      difficulty: 5,
      prompt: "What is wrong with this summary?",
      narration: { audio: `${Q}/c-5-summary-opinion.mp3`, script: "A summary keeps the big beats, keeps the order, keeps the ending, and keeps the writer out of it. Four possible problems are on your screen, and only one of them is true of the summary you are about to hear. Tap that problem after you hear it. Here is the summary a student wrote. Teodora was new in town and wanted to fit in, so she joined the jump rope team. The rope kept catching her ankles, but she practiced until it stopped. At the show she jumped clean, and I think Mina is the nicest girl in Ashgrove." },
      hint: { audio: `${Q}/c-5-summary-opinion-hint.mp3`, script: "Each problem has to be checked against the summary you heard, and three of them are simply not true of it." },
      explain: { audio: `${Q}/c-5-summary-opinion-explain.mp3`, script: "The problem is, it adds an opinion. I think Mina is the nicest girl in Ashgrove is the writer's feeling, not something that happened, and a summary leaves that out." },
      interaction: { type: "choose", options: [{ id: "it-adds-an-opinion", label: "it adds an opinion" }, { id: "it-keeps-small-details", label: "it keeps small details" }, { id: "it-skips-the-ending", label: "it skips the ending" }, { id: "it-mixes-up-the-order", label: "it mixes up the order" }], correctId: "it-adds-an-opinion", coachWrong: "Check that problem against the summary. Does it really do that? Listen for the sentence that does not belong." },
    },
    {
      id: "c-6-speak-summary",
      band: "core",
      difficulty: 6,
      prompt: "Say the summary of The Long Rope in three sentences.",
      narration: { audio: `${Q}/c-6-speak-summary.mp3`, script: "Now the whole summary out loud. Tap the mic. Say three sentences about The Long Rope: who wanted what, what got in the way, and how it ended. Big beats only, and no opinion. Here is the story in short, one more time. Teodora was new in Ashgrove, and nobody at school said much more than hello, so she joined the jump rope team. At the first practice the rope caught her ankles three times, and it kept catching her. She practiced on her porch every night until it stopped. At the show she jumped clean, and in the team photo she stood in the middle of the row with Mina's arm around her." },
      hint: { audio: `${Q}/c-6-speak-summary-hint.mp3`, script: "The first sentence is what Teodora wanted when she moved to town. Then the rope. Then the show and the photo." },
      explain: { audio: `${Q}/c-6-speak-summary-explain.mp3`, script: "One way to say it goes like this. Teodora was new in town and wanted to fit in, so she joined the jump rope team. The rope kept catching her ankles. She practiced until it stopped, and at the show she earned her place in the row." },
      interaction: { type: "speak", text: "teodora new town ashgrove wanted join joined team rope jump jumping jumped caught catching ankles tripped practiced practice porch clothesline show clean nine friends mina table chair belonged belong place fit" },
    },
    {
      id: "h-1-response-shows-theme",
      band: "harder",
      difficulty: 1,
      prompt: "Which of Mina's responses shows the theme?",
      narration: { audio: `${Q}/h-1-response-shows-theme.mp3`, script: "Here is a fifth grade move. A theme often shows in how a character responds to a challenge. Watch me. Teodora's challenge is a rope that catches her ankles three times in front of a team she has just met. Her response is to tie a clothesline to her porch and practice instead of quitting, and that response shows the theme, because she keeps working toward her place on the team. Now you. Mina has a challenge too: a new jumper beside her who cannot find the beat. Four things Mina does in the story are on your screen. Tap her response to that challenge, the one that shows belonging. Here is the moment. At the first practice the rope caught her ankles three times, and each time it slapped the floor like a dropped pan. Nobody laughed. A girl named Mina, who jumped in the spot beside hers, began counting the beat out loud so that Teodora could hear when to jump." },
      hint: { audio: `${Q}/h-1-response-shows-theme-hint.mp3`, script: "The challenge is at the first practice, when the rope keeps catching. Which of Mina's actions answers that moment?" },
      explain: { audio: `${Q}/h-1-response-shows-theme-explain.mp3`, script: "The response is, counted the beat out loud. The arm and the lunch table come later, and jumping in the next spot is where she stands, not what she does. Counting the beat so a new girl can hear it is how Mina makes room for her." },
      interaction: { type: "choose", options: [{ id: "counted-the-beat-out-loud", label: "counted the beat out loud" }, { id: "jumped-in-the-next-spot", label: "jumped in the next spot" }, { id: "put-an-arm-around-her", label: "put an arm around her" }, { id: "asked-about-lunch-tables", label: "asked about lunch tables" }], correctId: "counted-the-beat-out-loud", coachWrong: "That is something Mina does, but is it her answer to the rope catching at the first practice? Find the response to that moment." },
    },
    {
      id: "h-2-poem-summary-obstacle",
      band: "harder",
      difficulty: 2,
      prompt: "In a summary of this poem, what got in the way?",
      narration: { audio: `${Q}/h-2-poem-summary-obstacle.mp3`, script: "A poem gets a summary too: who wanted what, what got in the way, how it ended. Watch me with a short poem. I folded a plane from a page of old spelling and aimed it across the whole length of the room. It looped once and dove and went straight in the trash. I flattened it out and creased every fold sharp. The second flight cleared every desk in the row and stuck its nose in the map on the wall. My summary in three sentences: a child wanted a paper plane to cross the room. The first throw crashed into the trash. The child refolded it, and the second flight crossed the room. Now you, with a new poem. Four things from it are on your screen, and only one got in the way. Tap that one after you hear the poem. Here it is. I chalked a hopscotch grid on the driveway, ten squares and a half moon at the top. Before I tossed my stone, the rain came down, and every number ran into the next. I waited on the porch until the sun came back, then chalked the whole grid over and jumped to ten." },
      hint: { audio: `${Q}/h-2-poem-summary-obstacle-hint.mp3`, script: "What got in the way is the thing that stopped the child from playing. Which line stops the game?" },
      explain: { audio: `${Q}/h-2-poem-summary-obstacle-explain.mp3`, script: "What got in the way is, rain washed the grid away. The half moon is part of the grid, the stone is what the child meant to toss, and the sun coming back is part of the ending." },
      interaction: { type: "choose", options: [{ id: "rain-washed-the-grid-away", label: "rain washed the grid away" }, { id: "the-half-moon-at-the-top", label: "the half moon at the top" }, { id: "tossing-the-stone", label: "tossing the stone" }, { id: "the-sun-coming-back", label: "the sun coming back" }], correctId: "rain-washed-the-grid-away", coachWrong: "That is in the poem, but did it stop the game? Find the thing that got between the child and playing." },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Teodora walked home the long way that night, swinging her rope, and for the first time she did not count the days.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of The Long Rope is on your screen, and it is one long sentence. Tap the mic. Read the whole sentence out loud at a talking pace. Rest at each comma, and let the ending land quietly." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the name Teodora." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you that Teodora took the long way home swinging her rope, and that she had stopped counting the days since she moved, which is how the story shows she belongs now." },
      interaction: { type: "speak", text: "Teodora walked home the long way that night swinging her rope and for the first time she did not count the days" },
    },
    {
      id: "h-4-speak-poem-summary",
      band: "harder",
      difficulty: 4,
      prompt: "Summarize the hopscotch poem in three sentences.",
      narration: { audio: `${Q}/h-4-speak-poem-summary.mp3`, script: "Last one, out loud. Tap the mic. Summarize the poem in three sentences: who wanted what, what got in the way, how it ended. Here is the poem again. I chalked a hopscotch grid on the driveway, ten squares and a half moon at the top. Before I tossed my stone, the rain came down, and every number ran into the next. I waited on the porch until the sun came back, then chalked the whole grid over and jumped to ten." },
      hint: { audio: `${Q}/h-4-speak-poem-summary-hint.mp3`, script: "The summary starts with what the child wanted to play, then the weather, then what the child did after the sun came back." },
      explain: { audio: `${Q}/h-4-speak-poem-summary-explain.mp3`, script: "One way to say it goes like this. A child wanted to play hopscotch on the driveway. Rain washed the chalk grid away. The child waited for the sun, chalked the grid again, and jumped to ten." },
      interaction: { type: "speak", text: "child wanted play hopscotch grid chalk chalked squares driveway stone rain rained washed ran waited porch sun back again redrew drew jumped ten game" },
    },
  ],
};
