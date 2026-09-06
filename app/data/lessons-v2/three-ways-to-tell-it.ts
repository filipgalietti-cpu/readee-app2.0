import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./three-ways-to-tell-it-timings.json";

// Three Ways to Tell It (RL.4.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=three-ways-to-tell-it
// G4-U2. THE THREE FORMS COMPARED AS FORMS tier of RL.4.5 (sibling split:
// parts-that-build RL.3.5 owns chapter / scene / stanza as PARTS that build on
// the one before (the scarecrow story, poem and play, and its quiz's Music Box
// preview of prose vs poem vs play), so those part names are named as known
// words in one line and "builds on" is never re-taught; prose-and-poem RF.3.4b
// owns expression and pace on a story page and a poem (the tugboat, Bell on
// the Pier), so nothing here grades the voice; word-music RL.2.4 owns rhyme
// and refrain as meaning at G2; text-says-so-i-know RL.4.1 and
// theme-and-summary RL.4.2 untouched; RL.4.6 point of view is the NEXT lesson,
// so this one says only that prose has a narrator who can go inside a head,
// never first or third person). THIS lesson owns: naming prose, poem, and
// drama from the SHAPE of a page; the poem terms verse, stanza, rhythm, meter
// with the beat tapped (da DUM da DUM da DUM da DUM); the drama terms cast,
// setting, dialogue, stage direction and the dialogue-vs-stage-direction
// distinction (said vs done, brackets that nobody says); the order a script
// shows its parts; what each form can do that the other two cannot (the
// narrator's inside view, the poem's beat, the play's stage direction); the
// piece of a page that PROVES its form; and explaining a difference aloud
// with two terms. ONE fresh small event, "The Hammock" (Baxter, eight, is
// flipped out of a new hammock twice until his sister Piper, ten, holds the
// edge steady), told three ways inside the lesson: prose over three pages
// (read-along 1 and 2 with ref-chained images, accept-mode speak 3 at 42
// tokens, complex sentences with relative pronouns and two inside-view beats),
// a two-stanza poem in iambic tetrameter with couplet rhyme (one stanza per
// read-along screen, line starts marked by capitals because ReadAlong has no
// line breaks), and a drama page over two read-along screens (cast and setting
// first, then seven lines of dialogue set by speaker name and three stage
// directions in brackets). ENGINE + TTS FINDINGS: ReadAlong splits on
// whitespace, so brackets ride on their words and Autonoe skips them silently;
// BUT Autonoe treats "Name: line" as a script to ACT and DROPS the speaker
// labels (five takes: 6 of 7, 0 of 7, 0 of 7, 0 of 7 voiced, plus one tail
// truncation), so labels are written "Baxter. Watch this." (name as its own
// sentence, the printed-play convention), which voices every label; and the
// dialogue clip never opens on a bare name (a take that did truncated after
// three words), it opens on a bracketed direction. Snippet stimuli for the
// name-the-form chooses are fresh (a cook and a driver, a rainy porch). No
// digits, no contractions in read-along or speak text, no " my " token.
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: hammock,
// Baxter, Piper, grudge, maples-as-setting, gutter, screen door all 0 hits.
// The quiz's fresh second event (The Sprinkler: Marcus, Bridie, Aunt Dagny)
// is spoken inside its questions and needs no picture.

const A = (id: string) => `/audio/lessons-v2/three-ways-to-tell-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/three-ways-to-tell-it/${w.toLowerCase()}.png`;

export const threeWaysToTellItImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A sunny backyard on a hot June day, a striped red and cream canvas hammock strung between two tall leafy maple trees at the bottom of a green lawn, the hammock swinging empty and tilted as if it just flipped, an eight year old boy with dark brown skin and short curly black hair in a red T-shirt and blue shorts lying flat on his back on the grass directly under the hammock with his arms out, eyes open, looking up at the leaves, a wooden porch with three steps at the top of the lawn in the background where a ten year old girl with dark brown skin and long black braids in a green T-shirt sits reading a plain book with a blank cover. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no smile on the hammock, no faces on the trees or the sun, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-2": { subject: "The same sunny backyard, the same striped red and cream canvas hammock strung between the same two tall leafy maple trees, the same ten year old girl with dark brown skin and long black braids in a green T-shirt standing beside the hammock gripping its near edge firmly with both hands to hold it flat and still, the same eight year old boy with dark brown skin and short curly black hair in a red T-shirt and blue shorts climbing carefully into the hammock with one knee on the canvas, the wooden porch with three steps in the background with nobody on it, a closed plain book with a blank cover lying on the top step. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces on the trees or the sun, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "poem-shade": { subject: "The same sunny backyard in the late afternoon, the same striped red and cream canvas hammock strung between the same two tall leafy maple trees now hanging low and steady with exactly two children lying back in it side by side in the dappled shade of the leaves, nobody on the grass and nobody under the hammock, only two people in the whole picture, the same eight year old boy with dark brown skin and short curly black hair in a red T-shirt and blue shorts and the same ten year old girl with dark brown skin and long black braids in a green T-shirt, both with their hands behind their heads looking up at the leaves, long warm shadows across the empty lawn, the wooden porch with three steps small in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, only two children in the picture and both are inside the hammock, no one lying on the grass, no faces on the trees or the sun, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" }
};

export const threeWaysToTellIt: LessonDef = {
  id: "three-ways-to-tell-it",
  title: "Three Ways to Tell It",
  grade: "4th Grade",
  standard: "RL.4.5",
  archetype: "story-elements",
  objective: "I can name prose, a poem, and a drama from the shape of the page, and use the terms for their parts when I talk about a text.",
  concepts: [
    "prose is sentences in paragraphs with a narrator who can go inside a character's head",
    "a poem is verse in lines and stanzas with a rhythm you can tap and a meter that repeats",
    "a drama has a cast, a setting, dialogue set by the speaker's name, and stage directions",
    "dialogue is said, a stage direction is done and nobody says it",
    "each form can do one thing the other two cannot",
    "name the form and name the part when you speak about a text",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Hammock as prose, as a poem, and as a play, and you named each form from the shape of its page. Prose gave you a narrator, the poem gave you verse and meter, and the play gave you a cast, a setting, dialogue, and stage directions. Those are the terms you use whenever you speak about a text.",
    "title": "Three Ways to Tell It",
    "body": "You named prose, poem, and drama from the shape of the page, and you used the terms for their parts."
  },
  scenes: [
    {
      id: "hook-prose-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Hammock, told as prose. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-prose-page-1"), script: "Hello, reader. Today one small event gets told three ways, and by the end you will be able to name the form from the shape of the page alone. The first way is prose, which is the way most stories are written. Here is page one of The Hammock, told as prose. Read along with me, and notice that nobody on this page says a word out loud." },
      interaction: { type: "read-along", text: "On the first hot Saturday of June, Baxter found a new hammock hanging between the two maples at the bottom of the yard, and he decided at once that it was the finest thing his family had ever owned. He backed up to the porch steps, ran the whole length of the lawn, and launched himself at the middle of it, which flipped him over and dropped him flat on the grass before he had finished landing. Baxter lay there a moment, blinking up at the leaves, and told himself that the hammock had simply not been expecting him.", audio: A("hook-prose-page-1-sentence") },
    },
    {
      id: "model-prose-page-2",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, still prose. Read along, and watch the narrator.",
      image: IMG("page-2"),
      narration: { audio: A("model-prose-page-2"), script: "Here is what prose is. Prose is writing in ordinary sentences, and the sentences are grouped into paragraphs, the way page one was. A narrator tells it. The narrator is the voice telling the story, and that voice can go anywhere, even inside a character's head. Page one never showed Baxter speaking, but it told you what he told himself, that the hammock had not been expecting him. Only a narrator can do that. Page two is prose as well. Read along with me, and watch the narrator go inside Baxter's head a second time." },
      interaction: { type: "read-along", text: "The second try, which was slower and much more polite, ended exactly the same way, and by then Baxter was certain that the hammock held a grudge against him. His sister Piper, who had watched both attempts from the porch with a book open in her lap, walked down the lawn without a word. She took hold of the near edge and held it as steady as a table while he climbed in, one careful knee at a time.", audio: A("model-prose-page-2-sentence") },
    },
    {
      id: "prose-page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: When the canvas finally stopped swinging, Piper climbed in beside him. Baxter did not say thank you, because that would have meant admitting he had needed help. The two of them lay there listening to the maples for the rest of the afternoon.",
      narration: { audio: A("prose-page-3-read"), script: "Page three is yours, and it is still prose. Read all three sentences out loud, and notice the one thing the narrator tells you that Baxter never says." },
      interaction: { type: "speak", text: "When the canvas finally stopped swinging Piper climbed in beside him Baxter did not say thank you because that would have meant admitting he had needed help The two of them lay there listening to the maples for the rest of the afternoon" },
    },
    {
      id: "poem-stanza-1",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The same event as a poem, stanza one. Read along!",
      narration: { audio: A("poem-stanza-1"), script: "Now the same event told a second way, as a poem. A poem is written in verse, which means in lines, and the lines are grouped into stanzas. On this screen each new line begins with a capital letter, and the rhyme comes at the end of each line. This is stanza one. Read along with me, and listen for the beat under the words." },
      interaction: { type: "read-along", text: "The hammock hung between the trees, And Baxter ran to meet the breeze. He jumped, it flipped, he hit the ground, And found the grass had spun around.", audio: A("poem-stanza-1-sentence") },
    },
    {
      id: "poem-stanza-2",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Stanza two. Read along, and tap the beat!",
      image: IMG("poem-shade"),
      narration: { audio: A("poem-stanza-2"), script: "Stanza two, the second group of lines. The same beat runs under every line, and the rhyme lands again at the line ends. Read along with me, and tap one finger on the strong beats if you can feel them." },
      interaction: { type: "read-along", text: "Then Piper came without a word, And held the edge, and nothing stirred. He climbed in slow, the canvas stayed, They both lay back beneath the shade.", audio: A("poem-stanza-2-sentence") },
    },
    {
      id: "model-poem-beat",
      purpose: "model",
      gate: "none",
      prompt: "Verse. Stanza. Rhythm. Meter.",
      fx: {"text":"da **DUM** da **DUM** da **DUM** da **DUM**","effect":"heartbeat"},
      narration: { audio: A("model-poem-beat"), script: "Here are the poem's four terms. Verse is writing in lines, so every line of the poem is a line of verse. A stanza is a group of those lines, and this poem has two. Rhythm is the pattern of soft and strong beats you hear when you read a line, and meter is that pattern repeating the same way in line after line. Listen to the meter of this poem. da DUM, da DUM, da DUM, da DUM. Soft, strong, four times, and every line keeps it. Now the first line on that beat. The hammock hung between the trees. Four strong beats, one in hammock, one on hung, one in between, one on trees. Tap them with one finger and say the line again." },
    },
    {
      id: "drama-page-1",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "The same event as a play. First, the top of the page.",
      narration: { audio: A("drama-page-1"), script: "The third way is drama, a play, written to be acted on a stage. Before anyone speaks, a play tells you two things. The cast is the list of who is in it, and it comes first. The setting is the line that tells where and when. Here is the top of the hammock play. Read along with me." },
      interaction: { type: "read-along", text: "Cast: Baxter, eight. Piper, his sister, ten. Setting: The bottom of the yard, a hot Saturday in June.", audio: A("drama-page-1-sentence") },
    },
    {
      id: "drama-page-2",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Now the lines. Read along, and count the brackets.",
      narration: { audio: A("drama-page-2"), script: "Now the lines. In a play, dialogue is what the characters say, and each line of dialogue is set by the speaker's name, so you always know who is talking. Some lines are not said at all. A stage direction is a line in brackets, and nobody says it. It tells what is done, so the actors know what to do with their bodies. Prose would put those actions in a sentence from the narrator. A play hands them to the actors instead. Read along with me, and count how many lines are in brackets." },
      interaction: { type: "read-along", text: "[Baxter backs up to the porch steps.] Baxter. Watch this. [He runs at the hammock and jumps in. It flips him onto the grass.] Baxter. It has a grudge against me. Piper. It has never met you before. [Piper takes the near edge.] Baxter. Now what? Piper. Climb in slowly. Baxter. It held. Piper. Move over.", audio: A("drama-page-2-sentence") },
    },
    {
      id: "guided-choose-which-form-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which form? Cook: Is the lid on? [She lifts the pot.] Driver: It was, before the bump.",
      narration: { audio: A("guided-choose-which-form-1"), script: "Time to name the form from the shape of the page. A short new piece is on your screen, and it is not about the hammock. Look at how it is built before you read the words. Four forms are on the tiles, and one of them is a form this lesson never taught. Tap the form this piece is written in. Here it is. Cook. Is the lid on? She lifts the pot. Driver. It was, before the bump." },
      interaction: { type: "choose", options: [{ id: "drama", label: "drama" }, { id: "prose", label: "prose" }, { id: "poem", label: "poem" }, { id: "letter", label: "letter" }], correctId: "drama", coachWrong: "Look at how each line begins, and look for a line that nobody says out loud. Which form is built like that?" },
    },
    {
      id: "guided-choose-which-form-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which form? The rain came down, the gutter sang, The porch lamp swung, the screen door banged.",
      narration: { audio: A("guided-choose-which-form-2"), script: "One more from the shape. This piece is on your screen, and again it is new. Look at where the capital letters fall, and listen for the sound at the end of one line coming back at the end of the next. Tap the form. Here it is. The rain came down, the gutter sang, the porch lamp swung, the screen door banged." },
      interaction: { type: "choose", options: [{ id: "poem", label: "poem" }, { id: "prose", label: "prose" }, { id: "drama", label: "drama" }, { id: "recipe", label: "recipe" }], correctId: "poem", coachWrong: "Tap one finger while you read it, and listen to the last word of each line. Which form is built on a beat and a rhyme?" },
    },
    {
      id: "guided-choose-dialogue-or-direction",
      purpose: "guided",
      gate: "interaction",
      prompt: "Three lines are dialogue. Tap the stage direction.",
      narration: { audio: A("guided-choose-dialogue-or-direction"), script: "Back to the play. Four lines from the page are on your screen. Three of them are dialogue, words a character says out loud, each one set by the speaker's name. One of them is a stage direction, and nobody says it. Tap the stage direction." },
      interaction: { type: "choose", options: [{ id: "piper-takes-the-near-edge", label: "[Piper takes the near edge.]" }, { id: "piper-climb-in-slowly", label: "Piper. Climb in slowly." }, { id: "baxter-it-held", label: "Baxter. It held." }, { id: "piper-move-over", label: "Piper. Move over." }], correctId: "piper-takes-the-near-edge", coachWrong: "That line has a name in front of it, so somebody says it. Find the line that is done, not said." },
    },
    {
      id: "apply-sequence-script-order",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put these in the order a script shows them.",
      narration: { audio: A("apply-sequence-script-order"), script: "A script has an order, and it never changes. Three pieces of the hammock play are on your screen, and they are out of order. Think about what a play tells you first, what it tells you second, and what has to wait until both of those are done. Tap them in the order a script shows them." },
      interaction: { type: "sequence", items: [{ id: "cast", label: "Baxter, eight. Piper, ten." }, { id: "setting", label: "the yard, a hot Saturday" }, { id: "dialogue", label: "Baxter. Watch this." }], order: ["cast","setting","dialogue"], coachWrong: "Ask what a reader needs first. Nobody can speak before you know who is in the play and where they are standing." },
    },
    {
      id: "apply-sort-poem-drama-words",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Poem Words, or Drama Words?",
      narration: { audio: A("apply-sort-poem-drama-words"), script: "Six terms are on your screen. Three of them name parts of a poem, and three of them name parts of a play. Read each one, decide which form it belongs to, and drag it to Poem Words or to Drama Words." },
      interaction: { type: "sort", buckets: ["Poem Words","Drama Words"], items: [{ label: "stanza", bucket: "Poem Words" }, { label: "cast", bucket: "Drama Words" }, { label: "meter", bucket: "Poem Words" }, { label: "stage direction", bucket: "Drama Words" }, { label: "verse", bucket: "Poem Words" }, { label: "dialogue", bucket: "Drama Words" }], coachWrong: "Ask where you would see that word at work. In lines with a beat, or in a script written for actors?" },
    },
    {
      id: "apply-choose-what-only-the-poem-can-do",
      purpose: "apply",
      gate: "interaction",
      prompt: "What can the poem do that the prose and the play cannot?",
      narration: { audio: A("apply-choose-what-only-the-poem-can-do"), script: "Every form has one thing it can do that the other two cannot. Prose has a narrator, so it can go inside a character's head. A play has stage directions, so it can hand the actions to the actors. The poem has something of its own, and you felt it on the stanza screens. Four things are on your screen. Tap the one that only the poem can do." },
      interaction: { type: "choose", options: [{ id: "keep-a-beat-you-can-tap", label: "keep a beat you can tap" }, { id: "tell-what-baxter-thinks", label: "tell what Baxter thinks" }, { id: "tell-the-actor-what-to-do", label: "tell the actor what to do" }, { id: "name-the-two-maples", label: "name the two maples" }], correctId: "keep-a-beat-you-can-tap", coachWrong: "The prose or the play can do that one too. Think about what ran under every line of the poem and nowhere else." },
    },
    {
      id: "apply-choose-proves-it-is-a-play",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which piece of the page proves it is a play?",
      narration: { audio: A("apply-choose-proves-it-is-a-play"), script: "Here is the best evidence move for forms. Four pieces from the hammock play are on your screen, and every one of them really is on that page. Three of them could sit in the prose version or in the poem just as easily, a place, a time, a thing somebody says. One of them could only come from a play. Tap the piece that proves the page is a play." },
      interaction: { type: "choose", options: [{ id: "piper-takes-the-near-edge", label: "[Piper takes the near edge.]" }, { id: "it-has-a-grudge-against-me", label: "it has a grudge against me." }, { id: "a-hot-saturday-in-june", label: "a hot Saturday in June" }, { id: "the-bottom-of-the-yard", label: "the bottom of the yard" }], correctId: "piper-takes-the-near-edge", coachWrong: "That piece is on the page, but prose could carry it too. Find the piece no story and no poem would ever have." },
    },
    {
      id: "challenge-speak-one-difference",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Explain one difference between two forms. Use two of the terms.",
      narration: { audio: A("challenge-speak-one-difference"), script: "Last one, and you say it out loud. Pick two of the three forms, and explain one way they are different. Use two of the terms from today, the way a fourth grade reader talks about a text. Tap the mic, then say your difference." },
      interaction: { type: "speak", text: "stanza stanzas verse lines beat rhythm meter rhyme rhymes paragraph paragraphs narrator sentences cast setting dialogue stage direction directions brackets speaker actor actors thoughts inside prose poem play drama" },
    },
    {
      id: "celebrate-three-ways",
      purpose: "celebrate",
      gate: "none",
      prompt: "Prose. Poem. Drama. Name the form, name the part.",
      fx: {"text":"**Prose**. **Poem**. **Drama**.","effect":"fireworks"},
      narration: { audio: A("celebrate-three-ways"), script: "Today one hammock got told three ways. Prose told it in paragraphs, with a narrator who could go inside Baxter's head. The poem told it in verse, in two stanzas, on a meter you could tap. The play told it with a cast, a setting, dialogue set by the speaker's name, and stage directions in brackets that nobody says. From now on, when you talk about a text, name the form, and name the part. That is how fourth grade readers speak about what they read." },
    },
  ],
};
