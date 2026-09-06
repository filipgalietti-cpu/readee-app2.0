import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Three Ways to Tell It QUIZ (RL.4.5) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second event,
// "The Sprinkler" (Marcus, ten, and his cousin Bridie, nine, set an old
// sprinkler on the brown lawn on the hottest day of summer; its head is stuck
// facing the porch, so the first arc soaks the newspaper Aunt Dagny is
// reading; she folds the wet paper, walks down without a word, nudges the
// head straight with her shoe, and the water fans across the lawn; all three
// run through it), told the same three ways INSIDE the questions so every Q is
// self-contained: two prose pages, a three-stanza poem in iambic tetrameter
// (stanza three repeats stanza one's opening line with one word changed, brown
// to wet), and a two-scene play with "Name." speaker labels (Autonoe drops
// "Name:" labels, see the lesson header). Two on-screen read-alouds are NEVER
// narrated anywhere in the quiz: stanza two (e-4) and the exchange Bridie.
// Turn it off. Marcus. It is off. It is stuck. (h-3). Bands: easier(G3-bridge
// at 3 options: the part name for a story and for a poem, the form of a prose
// page, the stanza read-aloud) / core(on-grade G4: name the form of a script
// at 4 options with a letter distractor, dialogue vs stage direction, the
// script-order sequence, a Poem Words / Play Words sort with b-* bucket clips,
// BEST evidence that a page is a play among four pieces really on it, and a
// production speak naming what prose can do that the play cannot) /
// harder(G5 transfer, RL.5.5 how the parts fit together to make the whole:
// TAUGHT in h-1 on the poem's repeated opening line, applied to the play's
// scene change in h-2, the exchange read aloud in h-3, and a closing
// production speak explaining how stanzas one and three fit together).
// Nothing from the lesson event (Baxter, Piper, the hammock) is reused and no
// lesson tile is reused. Names + props grep-swept vs lessons-v2 + quizzes-v2:
// Marcus, Bridie, Dagny, sprinkler, sports page, newspaper all 0 hits. No
// pictures: nowhere in this quiz is a picture the evidence.

const Q = "/audio/quizzes-v2/three-ways-to-tell-it-quiz";

export const threeWaysToTellItQuiz: QuizDef = {
  id: "three-ways-to-tell-it-quiz",
  lessonId: "three-ways-to-tell-it",
  title: "Three Ways to Tell It Quiz",
  standard: "RL.4.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-part-name-for-a-story",
      band: "easier",
      difficulty: 1,
      prompt: "A prose story is cut into parts. Tap the name of the part.",
      narration: { audio: `${Q}/e-1-part-name-for-a-story.mp3`, script: "Here is a new event, The Sprinkler, and it is told as prose first. A story in prose is cut into parts, and the part has a name. Tap the name of a part of a prose story after you hear page one. On the hottest afternoon of the summer, Marcus dragged the old sprinkler to the middle of the brown lawn while his cousin Bridie waited by the tap, and neither of them noticed that the head was stuck facing the porch. When she turned the tap, one long arc of water sailed over the grass and landed on the newspaper Aunt Dagny was reading in her chair. She folded the wet paper in half, walked down the steps without a word, and nudged the sprinkler straight with the toe of her shoe." },
      hint: { audio: `${Q}/e-1-part-name-for-a-story-hint.mp3`, script: "A poem's parts and a play's parts have their own names. This one is the name for a part of a story book." },
      explain: { audio: `${Q}/e-1-part-name-for-a-story-explain.mp3`, script: "A story in prose is cut into chapters. A poem is cut into stanzas, and a play is cut into scenes." },
      interaction: { type: "choose", options: [{ id: "chapter", label: "chapter" }, { id: "stanza", label: "stanza" }, { id: "scene", label: "scene" }], correctId: "chapter", coachWrong: "That name belongs to a poem or a play. Which name goes with a story told in sentences and paragraphs?" },
    },
    {
      id: "e-2-part-name-for-a-poem",
      band: "easier",
      difficulty: 2,
      prompt: "A poem's group of lines has a name. Tap it.",
      narration: { audio: `${Q}/e-2-part-name-for-a-poem.mp3`, script: "The same event as a poem. A poem is written in lines, and the lines come in groups with a space before and after each group. Tap the name of one group of lines after you hear the first one. The lawn was brown, the sun was high, and not a cloud was in the sky. The sprinkler waited on the ground, and Bridie turned the tap around." },
      hint: { audio: `${Q}/e-2-part-name-for-a-poem-hint.mp3`, script: "A story has chapters and a play has scenes. The poem's group of lines has the third name." },
      explain: { audio: `${Q}/e-2-part-name-for-a-poem-explain.mp3`, script: "A group of lines in a poem is a stanza. Chapters belong to a story, and scenes belong to a play." },
      interaction: { type: "choose", options: [{ id: "stanza", label: "stanza" }, { id: "chapter", label: "chapter" }, { id: "scene", label: "scene" }], correctId: "stanza", coachWrong: "That name belongs to a story or a play. Which name goes with a group of lines in a poem?" },
    },
    {
      id: "e-3-which-form-prose-page",
      band: "easier",
      difficulty: 3,
      prompt: "Which form? Marcus and Bridie stood very still, waiting to be sent inside, but Aunt Dagny only stepped back onto the grass and let the water fan across her sandals.",
      narration: { audio: `${Q}/e-3-which-form-prose-page.mp3`, script: "Here is page two of The Sprinkler, and it is on your screen. Look at the shape before you read the words. Sentences, a paragraph, no names before the lines, no line that stops early to rhyme. Tap the form it is written in. Here it is. Marcus and Bridie stood very still, waiting to be sent inside, but Aunt Dagny only stepped back onto the grass and let the water fan across her sandals." },
      hint: { audio: `${Q}/e-3-which-form-prose-page-hint.mp3`, script: "A poem would break into short lines, and a play would put a name before each line. This page does neither." },
      explain: { audio: `${Q}/e-3-which-form-prose-page-explain.mp3`, script: "This page is prose, ordinary sentences in a paragraph, told by a narrator." },
      interaction: { type: "choose", options: [{ id: "prose", label: "prose" }, { id: "poem", label: "poem" }, { id: "drama", label: "drama" }], correctId: "prose", coachWrong: "Look at the shape again. No short lines, no names before the lines. Which form is plain sentences in a paragraph?" },
    },
    {
      id: "e-4-speak-read-stanza-two",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: One silver arc went up and out And crossed the lawn, then curved about, And landed with a heavy slap On Dagny's paper, in her lap.",
      narration: { audio: `${Q}/e-4-speak-read-stanza-two.mp3`, script: "Stanza two of the sprinkler poem is on your screen, four lines, and each line starts with a capital letter. Tap the mic, then read all four lines out loud with a tiny pause at the end of each line." },
      hint: { audio: `${Q}/e-4-speak-read-stanza-two-hint.mp3`, script: "The mic sits under the stanza, and the first line begins with the words One silver arc." },
      explain: { audio: `${Q}/e-4-speak-read-stanza-two-explain.mp3`, script: "The stanza tells you that one arc of water crossed the lawn and landed on the paper in Aunt Dagny's lap, and the rhymes come at the ends of the lines, out with about, and slap with lap." },
      interaction: { type: "speak", text: "One silver arc went up and out And crossed the lawn then curved about And landed with a heavy slap On Dagny's paper in her lap" },
    },
    {
      id: "c-1-which-form-script",
      band: "core",
      difficulty: 1,
      prompt: "Which form? Cast: Marcus, ten. Bridie, nine. Aunt Dagny. [Bridie turns the tap.] Marcus. Turn it on.",
      narration: { audio: `${Q}/c-1-which-form-script.mp3`, script: "Name the form from the shape of the page. The top of a new page is on your screen, and four forms are on the tiles, one of them a form the lesson never taught. Look at what comes before anyone speaks, and at what sits in brackets. Tap the form. Here is the page. Cast. Marcus, ten. Bridie, his cousin, nine. Aunt Dagny. Setting. A brown backyard on the hottest day of summer. Marcus. Turn it on. Bridie turns the tap. One arc of water flies over the grass and onto the porch. Aunt Dagny. That was the sports page." },
      hint: { audio: `${Q}/c-1-which-form-script-hint.mp3`, script: "A list of who is in it, a line about where, names before the lines, and a line in brackets that nobody says. Which form is built like that?" },
      explain: { audio: `${Q}/c-1-which-form-script-explain.mp3`, script: "It is drama, a play. Only a play opens with a cast and a setting, sets each line by the speaker's name, and puts stage directions in brackets." },
      interaction: { type: "choose", options: [{ id: "drama", label: "drama" }, { id: "prose", label: "prose" }, { id: "poem", label: "poem" }, { id: "letter", label: "letter" }], correctId: "drama", coachWrong: "Look at what the page does before anyone speaks, and at the line in brackets. Which form is built that way?" },
    },
    {
      id: "c-2-dialogue-or-stage-direction",
      band: "core",
      difficulty: 2,
      prompt: "Three lines are dialogue. Tap the stage direction.",
      narration: { audio: `${Q}/c-2-dialogue-or-stage-direction.mp3`, script: "Four lines from the sprinkler play are on your screen. Three of them are dialogue, words a character says, each one set by the speaker's name. One of them is a stage direction, and nobody says it. Tap the stage direction after you hear the four lines. Marcus. Turn it on. Aunt Dagny. That was the sports page. She folds the newspaper. Aunt Dagny. Now it is on." },
      hint: { audio: `${Q}/c-2-dialogue-or-stage-direction-hint.mp3`, script: "A line with a name in front of it gets said. Find the line that is done instead of said." },
      explain: { audio: `${Q}/c-2-dialogue-or-stage-direction-explain.mp3`, script: "The stage direction is, she folds the newspaper. It sits in brackets, no name comes before it, and it tells the actor what to do." },
      interaction: { type: "choose", options: [{ id: "she-folds-the-newspaper", label: "[She folds the newspaper.]" }, { id: "marcus-turn-it-on", label: "Marcus. Turn it on." }, { id: "aunt-dagny-now-it-is-on", label: "Aunt Dagny. Now it is on." }, { id: "bridie-run", label: "Bridie. Run." }], correctId: "she-folds-the-newspaper", coachWrong: "That line has a name in front of it, so somebody says it. Find the line that is done, not said." },
    },
    {
      id: "c-3-sequence-script-order",
      band: "core",
      difficulty: 3,
      prompt: "Put these in the order a script shows them.",
      narration: { audio: `${Q}/c-3-sequence-script-order.mp3`, script: "A script shows its parts in an order that never changes. Three pieces of the sprinkler play are on your screen, and they are out of order. Think about what a play tells you first, what it tells you second, and what has to wait until both of those are done. Tap them in the order a script shows them." },
      hint: { audio: `${Q}/c-3-sequence-script-order-hint.mp3`, script: "Ask what a reader needs to know before anyone can speak. Who is in it comes before where they are." },
      explain: { audio: `${Q}/c-3-sequence-script-order-explain.mp3`, script: "The cast comes first, then the setting, and only then the dialogue. Marcus and Bridie, then the brown yard, then Turn it on." },
      interaction: { type: "sequence", items: [{ id: "cast", label: "Marcus, ten. Bridie, nine." }, { id: "setting", label: "a brown yard, a hot day" }, { id: "dialogue", label: "Marcus. Turn it on." }], order: ["cast","setting","dialogue"], coachWrong: "Nobody can speak before you know who is in the play and where they are standing. Start with who." },
    },
    {
      id: "c-4-sort-poem-play-words",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Poem Words, or Play Words?",
      narration: { audio: `${Q}/c-4-sort-poem-play-words.mp3`, script: "Six terms are on your screen. Three of them name parts of a poem, and three of them name parts of a play. Read each one, decide which form it belongs to, and drag it to Poem Words or to Play Words." },
      hint: { audio: `${Q}/c-4-sort-poem-play-words-hint.mp3`, script: "Ask where you would see that word at work. In lines with a beat, or in a script written for actors?" },
      explain: { audio: `${Q}/c-4-sort-poem-play-words-explain.mp3`, script: "Rhythm, verse, and meter are poem words. Setting, dialogue, and cast are play words." },
      interaction: { type: "sort", buckets: ["Poem Words","Play Words"], bucketAudio: { "Poem Words": `${Q}/b-poem-words.mp3`, "Play Words": `${Q}/b-play-words.mp3` }, items: [{ label: "rhythm", bucket: "Poem Words" }, { label: "setting", bucket: "Play Words" }, { label: "verse", bucket: "Poem Words" }, { label: "dialogue", bucket: "Play Words" }, { label: "meter", bucket: "Poem Words" }, { label: "cast", bucket: "Play Words" }], coachWrong: "Ask where you would see that word at work. In lines with a beat, or in a script for actors?" },
    },
    {
      id: "c-5-best-evidence-play",
      band: "core",
      difficulty: 5,
      prompt: "Which piece of the page proves it is a play?",
      narration: { audio: `${Q}/c-5-best-evidence-play.mp3`, script: "Here is the best evidence move for forms. Four pieces from the sprinkler page are on your screen, and every one of them really is on that page. Three of them could sit in the prose version or in the poem just as easily, a place, a time, a thing somebody says. One of them could only come from a play. Tap the piece that proves the page is a play, after you hear the page. Cast. Marcus, ten. Bridie, his cousin, nine. Aunt Dagny. Setting. A brown backyard on the hottest day of summer. Bridie turns the tap. Aunt Dagny. That was the sports page." },
      hint: { audio: `${Q}/c-5-best-evidence-play-hint.mp3`, script: "A place, a time, and a thing somebody says can all sit in a story. Which piece would a story or a poem never have?" },
      explain: { audio: `${Q}/c-5-best-evidence-play-explain.mp3`, script: "The proof is the stage direction, Bridie turns the tap, in brackets. A brown backyard, the hottest day, and a thing somebody says could all sit in prose or in a poem." },
      interaction: { type: "choose", options: [{ id: "bridie-turns-the-tap", label: "[Bridie turns the tap.]" }, { id: "that-was-the-sports-page", label: "that was the sports page." }, { id: "the-hottest-day-of-summer", label: "the hottest day of summer" }, { id: "a-brown-backyard", label: "a brown backyard" }], correctId: "bridie-turns-the-tap", coachWrong: "That piece is on the page, but prose could carry it too. Find the piece no story and no poem would ever have." },
    },
    {
      id: "c-6-speak-what-prose-can-do",
      band: "core",
      difficulty: 6,
      prompt: "What can the prose do that the play cannot? Say it with a term.",
      narration: { audio: `${Q}/c-6-speak-what-prose-can-do.mp3`, script: "The prose version ends with this sentence. Marcus decided that she had been hot too. The play never says that, and it never could. Tap the mic, then say what prose can do that a play cannot, and use the term for the voice that does it." },
      hint: { audio: `${Q}/c-6-speak-what-prose-can-do-hint.mp3`, script: "Think about who tells a prose story, and where that voice can go that an actor on a stage cannot." },
      explain: { audio: `${Q}/c-6-speak-what-prose-can-do-explain.mp3`, script: "One way to say it goes like this. Prose has a narrator, and the narrator can go inside Marcus's head and tell what he decided. A play can only show what is said and done." },
      interaction: { type: "speak", text: "narrator narrate narrates thoughts thinks thinking thought inside head mind feel feels feelings decided decide tell tells telling paragraph paragraphs sentences prose knows know" },
    },
    {
      id: "h-1-how-stanzas-fit-taught",
      band: "harder",
      difficulty: 1,
      prompt: "How does stanza three fit with stanza one?",
      narration: { audio: `${Q}/h-1-how-stanzas-fit-taught.mp3`, script: "Here is a fifth grade move. Readers explain how the parts of a poem fit together to make the whole. Each stanza does a job for the poem. One stanza sets something up, the next one changes it, and the last one often answers the first. Watch me look at the sprinkler poem. Stanza one opens, The lawn was brown, the sun was high. Now here is stanza three. The lawn was wet, the sun was high, and no one stayed inside and dry. She fixed the head, the water spread, and all three ran right through instead. Hearing that opening line a second time, you notice the one word that is different, and that word carries what the whole poem is about. Now you. Four answers are on your screen. Tap how stanza three fits with stanza one." },
      hint: { audio: `${Q}/h-1-how-stanzas-fit-taught-hint.mp3`, script: "Say the two opening lines side by side, and listen for what stayed the same and what did not." },
      explain: { audio: `${Q}/h-1-how-stanzas-fit-taught-explain.mp3`, script: "Stanza three repeats stanza one's opening line with one change, brown to wet. The repeat makes the change stand out, and the change is the whole story of the poem." },
      interaction: { type: "choose", options: [{ id: "repeats-it-with-one-change", label: "repeats it with one change" }, { id: "tells-the-same-thing-again", label: "tells the same thing again" }, { id: "happens-the-next-day", label: "happens the next day" }, { id: "comes-before-stanza-one", label: "comes before stanza one" }], correctId: "repeats-it-with-one-change", coachWrong: "Say the two opening lines side by side. Most of the words match, but one does not, and that is the fit." },
    },
    {
      id: "h-2-what-scene-two-adds",
      band: "harder",
      difficulty: 2,
      prompt: "What does the jump to scene two let the play show?",
      narration: { audio: `${Q}/h-2-what-scene-two-adds.mp3`, script: "The same move on a play. A new scene means a jump in time or place, and the jump does a job for the whole play. Scene one of the sprinkler play ends with the water fanning across the lawn. Scene two starts ten minutes later. Listen to scene two. Scene two. The same yard, ten minutes later. All three stand dripping in the middle of the lawn. Marcus. Are we in trouble? Aunt Dagny. Only if it stops. Four answers are on your screen. Tap what the jump to scene two lets the play show." },
      hint: { audio: `${Q}/h-2-what-scene-two-adds-hint.mp3`, script: "Scene one already showed who turned the tap. Ask what you learn about Aunt Dagny only after the jump." },
      explain: { audio: `${Q}/h-2-what-scene-two-adds-explain.mp3`, script: "The jump lets the play show that Aunt Dagny liked it too. Only if it stops means she wants the water to stay on, and scene one could not show that while she was still holding a wet newspaper." },
      interaction: { type: "choose", options: [{ id: "that-aunt-dagny-liked-it-too", label: "that Aunt Dagny liked it too" }, { id: "who-turned-on-the-tap", label: "who turned on the tap" }, { id: "why-the-head-was-stuck", label: "why the head was stuck" }, { id: "what-the-sports-page-said", label: "what the sports page said" }], correctId: "that-aunt-dagny-liked-it-too", coachWrong: "Scene one already showed that, or no scene shows it at all. Listen to what Aunt Dagny says after the jump." },
    },
    {
      id: "h-3-speak-read-the-exchange",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: Bridie. Turn it off. Marcus. It is off. It is stuck.",
      narration: { audio: `${Q}/h-3-speak-read-the-exchange.mp3`, script: "Here is the shortest exchange in the sprinkler play, and it is on your screen. Nobody has read it for you. Tap the mic, then read both lines out loud, each name first and then its words, the way a script shows them." },
      hint: { audio: `${Q}/h-3-speak-read-the-exchange-hint.mp3`, script: "The mic sits under the lines, and the first line begins with the name Bridie." },
      explain: { audio: `${Q}/h-3-speak-read-the-exchange-explain.mp3`, script: "The exchange tells you that Bridie wants the water off and that Marcus has already turned the tap, but the sprinkler head is stuck." },
      interaction: { type: "speak", text: "Bridie Turn it off Marcus It is off It is stuck" },
    },
    {
      id: "h-4-speak-how-the-stanzas-fit",
      band: "harder",
      difficulty: 4,
      prompt: "How do stanzas one and three fit together? Use the terms.",
      narration: { audio: `${Q}/h-4-speak-how-the-stanzas-fit.mp3`, script: "Last one, out loud. Stanza one begins, The lawn was brown, the sun was high. Stanza three begins, The lawn was wet, the sun was high. Tap the mic, then explain how those two stanzas fit together to make the whole poem. Name the part, and say what changed." },
      hint: { audio: `${Q}/h-4-speak-how-the-stanzas-fit-hint.mp3`, script: "Say the word stanza, say what the last stanza repeats, and say the one word that is different." },
      explain: { audio: `${Q}/h-4-speak-how-the-stanzas-fit-explain.mp3`, script: "One way to say it goes like this. Stanza three repeats the opening line of stanza one, but brown has changed to wet, so the last stanza answers the first and shows what the sprinkler changed." },
      interaction: { type: "speak", text: "stanza stanzas repeat repeats repeated repeating same line opening first changed change changes brown wet dry word ending answers echo echoes beginning whole fit fits verse" },
    },
  ],
};
