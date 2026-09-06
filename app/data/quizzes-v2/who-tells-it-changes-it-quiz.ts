import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Who Tells It Changes It QUIZ (RL.4.6) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second moment,
// "The Penalty Kick", told two ways INSIDE the questions: Tilly the kicker
// tells it in first person (the referee points to the spot, her hands will
// not stay still, Dex crouches and grins at her, which she reads as him
// knowing which way she will kick; she aims for the corner he is not watching
// and the ball rolls past the post), and a third person teller goes inside
// Dex the goalie (his face grins whenever he is frightened, he has no idea
// which way she will kick, he has decided to dive left because left is the
// side with the untied boot, and when the ball rolls wide he is so relieved
// he forgets to stand up). Two on-screen read-alouds are READ by the child
// and never narrated anywhere in the quiz: e-4 is Tilly's first person line
// (it carries I and he but no " my " token, so Speak stays in accept mode)
// and h-3 is the third person closing line. Bands: easier(G3-bridge whose
// view / the signal word / first-or-third at 3 options, picture support on
// e-1 only) / core(on-grade G4: person choose with second-person and
// no-narrator traps, the signal words as a choose because quiz-qa cannot
// drive highlight, what the third person teller knows that the first person
// teller could not, a six-item First Person / Third Person sort with b-*
// bucket clips, BEST evidence among four true fragments for third person, and
// a production speak comparing the two tellings with a full accept list) /
// harder(G5 transfer, RL.5.6 HOW THE NARRATOR'S POINT OF VIEW SHAPES THE
// DESCRIPTION: taught in h-1 on a hallway fall, tripped vs shoved, then
// applied to Dex on the line, sprawled like he owned it vs crouched and
// tried to disappear; applied again to the miss, just past the post vs a
// mile wide; the third person closing line read aloud; a closing production
// speak that names each teller's words and the view behind them). Nothing
// from the lesson story (Cormac, Gretchen, the scooter, the scratch) is
// reused. Names + setting grep-swept vs lessons-v2 + quizzes-v2: Tilly, Dex,
// penalty kick, goalie, referee, untied boot, out of bounds all 0 hits. Quiz
// support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/who-tells-it-changes-it-quiz";
const IMG = (w: string) => `/images/lessons-v2/who-tells-it-changes-it/${w.toLowerCase()}.png`;

export const whoTellsItChangesItQuiz: QuizDef = {
  id: "who-tells-it-changes-it-quiz",
  lessonId: "who-tells-it-changes-it",
  title: "Who Tells It Changes It Quiz",
  standard: "RL.4.6",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-whose-view",
      band: "easier",
      difficulty: 1,
      prompt: "Whose view does this line hold?",
      image: IMG("quiz-penalty-spot"),
      narration: { audio: `${Q}/e-1-whose-view.mp3`, script: "Here is a new story called The Penalty Kick, and the kicker, Tilly, is telling it. Listen to one line and think about whose view it holds. Then tap the person whose view you hear. Here is the line. Dex crouched in the goal and grinned at me, which could only mean that he already knew which way I would kick." },
      hint: { audio: `${Q}/e-1-whose-view-hint.mp3`, script: "Listen for the little words the teller uses for herself. The teller is the one whose view you hear." },
      explain: { audio: `${Q}/e-1-whose-view-explain.mp3`, script: "That one was tricky. The line is told by Tilly, the kicker. She says me and I, so it is her view of Dex and his grin." },
      interaction: { type: "choose", options: [{ id: "tilly-the-kicker", label: "tilly, the kicker" }, { id: "dex-the-goalie", label: "dex, the goalie" }, { id: "the-referee", label: "the referee" }], correctId: "tilly-the-kicker", coachWrong: "That person is being looked at, not doing the telling. Who says me and I in the line?" },
    },
    {
      id: "e-2-signal-word",
      band: "easier",
      difficulty: 2,
      prompt: "Which word shows a character is telling it?",
      narration: { audio: `${Q}/e-2-signal-word.mp3`, script: "Listen to the first line of Tilly's page, and find the little word that shows a character inside the story is the teller. Three words from the line are on your screen. Tap the signal. Here is the line. The referee pointed to the spot, and I set the ball down with hands that would not stay still." },
      hint: { audio: `${Q}/e-2-signal-word-hint.mp3`, script: "A character telling her own story uses a word for herself. Which of the three words does that?" },
      explain: { audio: `${Q}/e-2-signal-word-explain.mp3`, script: "That one was tricky. The word I is the signal. Tilly says I set the ball down, so a character is telling it." },
      interaction: { type: "choose", options: [{ id: "the-word-i", label: "I" }, { id: "the-word-spot", label: "spot" }, { id: "the-word-hands", label: "hands" }], correctId: "the-word-i", coachWrong: "That word names a thing. Find the little word that stands for the teller herself." },
    },
    {
      id: "e-3-first-or-third",
      band: "easier",
      difficulty: 3,
      prompt: "First person, or third person?",
      narration: { audio: `${Q}/e-3-first-or-third.mp3`, script: "Now the goalie's page begins, and a different teller is speaking. Listen for the words the teller uses for Dex, and tap the label that fits. Here is the line. Dex crouched on the line, wishing his face would do anything other than grin, because the grin was what his face did whenever he was frightened." },
      hint: { audio: `${Q}/e-3-first-or-third-hint.mp3`, script: "Does the teller say I, or does the teller say Dex and his? One of those means the teller stands outside the story." },
      explain: { audio: `${Q}/e-3-first-or-third-explain.mp3`, script: "That one was tricky. It is third person. The teller says Dex and his, never I, so the teller stands outside the story and can see inside Dex." },
      interaction: { type: "choose", options: [{ id: "third-person", label: "third person" }, { id: "first-person", label: "first person" }, { id: "second-person", label: "second person" }], correctId: "third-person", coachWrong: "Find the words the teller uses for Dex, and ask whether that teller is inside the story or outside it." },
    },
    {
      id: "e-4-speak-read-first-person",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: I aimed for the corner he was not watching, and the ball rolled past the post and out of bounds.",
      narration: { audio: `${Q}/e-4-speak-read-first-person.mp3`, script: "The next line of Tilly's page is on your screen, and it is told in first person. Tap the mic, then read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-first-person-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word I." },
      explain: { audio: `${Q}/e-4-speak-read-first-person-explain.mp3`, script: "The sentence tells you that Tilly aimed for the corner Dex was not watching, and that the ball rolled past the post and out of bounds." },
      interaction: { type: "speak", text: "I aimed for the corner he was not watching and the ball rolled past the post and out of bounds" },
    },
    {
      id: "c-1-name-the-person",
      band: "core",
      difficulty: 1,
      prompt: "Name the kind of teller.",
      narration: { audio: `${Q}/c-1-name-the-person.mp3`, script: "Name the person from the signal. Four labels are on your screen, and only one fits. Listen to the second line of the goalie's page, find the words the teller uses for Dex, and tap the label. Here is the line. He had no idea which way Tilly would kick, and he had already decided to dive left, because left was the side with the untied boot." },
      hint: { audio: `${Q}/c-1-name-the-person-hint.mp3`, script: "Find the word the teller uses for Dex, and ask whether that teller is inside the story or outside it." },
      explain: { audio: `${Q}/c-1-name-the-person-explain.mp3`, script: "That one was tricky. It is third person. The teller says he and Tilly, and stands outside the story." },
      interaction: { type: "choose", options: [{ id: "third-person", label: "third person" }, { id: "first-person", label: "first person" }, { id: "second-person", label: "second person" }, { id: "no-narrator-at-all", label: "no narrator at all" }], correctId: "third-person", coachWrong: "Two of the labels are traps, and one belongs to a teller who says I. Find the word the teller uses for Dex, and think about where that teller stands." },
    },
    {
      id: "c-2-signal-words",
      band: "core",
      difficulty: 2,
      prompt: "Which words are the first person signal?",
      narration: { audio: `${Q}/c-2-signal-words.mp3`, script: "Here is Tilly's page again. Four pieces of one line are on your screen, and every piece is really in the line. Only one piece holds the little words a teller uses for herself, the words that prove first person. Tap that piece. Here is the line. Dex crouched in the goal and grinned at me, which could only mean that he already knew which way I would kick." },
      hint: { audio: `${Q}/c-2-signal-words-hint.mp3`, script: "The teller is the kicker. Which words does she use for herself?" },
      explain: { audio: `${Q}/c-2-signal-words-explain.mp3`, script: "That one was tricky. The words me and I are the signal. Tilly uses them for herself, so the page is first person. He and Dex point at the goalie, not at the teller." },
      interaction: { type: "choose", options: [{ id: "me-and-i", label: "me and I" }, { id: "he-and-dex", label: "he and Dex" }, { id: "goal-and-grinned", label: "goal and grinned" }, { id: "knew-and-kick", label: "knew and kick" }], correctId: "me-and-i", coachWrong: "Those words point at the goalie, or name a thing or an action. Find the words the teller uses for herself." },
    },
    {
      id: "c-3-what-third-person-knows",
      band: "core",
      difficulty: 3,
      prompt: "What could Tilly not know that Dex's page tells you?",
      narration: { audio: `${Q}/c-3-what-third-person-knows.mp3`, script: "Here is the comparison. Tilly told the kick in first person, so she could only know what she saw and thought. The third person teller went inside Dex. Four things are on your screen. Three of them Tilly could know from the spot. One of them only Dex's page could tell you. Tap it. Here is Dex's page again. Dex crouched on the line, wishing his face would do anything other than grin, because the grin was what his face did whenever he was frightened. He had no idea which way Tilly would kick." },
      hint: { audio: `${Q}/c-3-what-third-person-knows-hint.mp3`, script: "Tilly could feel her own hands and see the referee. Which thing lived inside Dex?" },
      explain: { audio: `${Q}/c-3-what-third-person-knows-explain.mp3`, script: "That one was tricky. Only Dex's page tells why he was grinning. He grins when he is frightened, and Tilly read that grin as him knowing her plan." },
      interaction: { type: "choose", options: [{ id: "why-dex-was-grinning", label: "why dex was grinning" }, { id: "which-way-tilly-aimed", label: "which way tilly aimed" }, { id: "how-tillys-hands-shook", label: "how tilly's hands shook" }, { id: "what-the-referee-pointed-at", label: "what the referee pointed at" }], correctId: "why-dex-was-grinning", coachWrong: "Tilly knew that one, because she felt it or saw it from the spot. Find the thing that was inside Dex." },
    },
    {
      id: "c-4-sort-first-third",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: First Person, or Third Person?",
      narration: { audio: `${Q}/c-4-sort-first-third.mp3`, script: "Six sentences about the match are on your screen, each with its own teller. Find the little words in each one. If the teller uses the words for herself or himself, drag it to First Person. If the teller stands outside and uses names or the words for someone else, drag it to Third Person." },
      hint: { audio: `${Q}/c-4-sort-first-third-hint.mp3`, script: "The sort works one sentence at a time. Hunt for the word the teller uses, then decide whether that teller is inside the story or outside it." },
      explain: { audio: `${Q}/c-4-sort-first-third-explain.mp3`, script: "I, me, and my mean the teller is inside the story, so those three sentences are first person. She, Dex, and they mean the teller is outside, so those three are third person." },
      interaction: { type: "sort", buckets: ["First Person","Third Person"], bucketAudio: { "First Person": `${Q}/b-first-person.mp3`, "Third Person": `${Q}/b-third-person.mp3` }, items: [{ label: "i set the ball down", bucket: "First Person" }, { label: "she set the ball down", bucket: "Third Person" }, { label: "the grin was aimed at me", bucket: "First Person" }, { label: "dex crouched on the line", bucket: "Third Person" }, { label: "my boot came untied", bucket: "First Person" }, { label: "they walked off the field", bucket: "Third Person" }], coachWrong: "Hunt for the little word. I, me, and my mean the teller is inside. She, they, and names mean the teller is outside." },
    },
    {
      id: "c-5-best-evidence-third",
      band: "core",
      difficulty: 5,
      prompt: "Which words prove Dex's page is third person?",
      narration: { audio: `${Q}/c-5-best-evidence-third.mp3`, script: "Best evidence. Four pieces of Dex's page are on your screen, and all four are really there. Only one of them holds the signal, the word a teller uses for someone else. The rest name a boot, a dive, or a side, not a teller. Tap the words that prove third person. Here is the page. He had no idea which way Tilly would kick, and he had already decided to dive left, because left was the side with the untied boot." },
      hint: { audio: `${Q}/c-5-best-evidence-third-hint.mp3`, script: "Three pieces name a boot, a dive, or a side. One piece names the goalie with a little word. Find that word." },
      explain: { audio: `${Q}/c-5-best-evidence-third-explain.mp3`, script: "That one was tricky. The words he had no idea hold the signal. He is the word a teller uses for someone else, so the page is third person." },
      interaction: { type: "choose", options: [{ id: "he-had-no-idea", label: "he had no idea" }, { id: "the-untied-boot", label: "the untied boot" }, { id: "decided-to-dive-left", label: "decided to dive left" }, { id: "left-was-the-side", label: "left was the side" }], correctId: "he-had-no-idea", coachWrong: "Those words name a thing or an action. Find the piece where the teller uses a little word for Dex." },
    },
    {
      id: "c-6-speak-compare-tellings",
      band: "core",
      difficulty: 6,
      prompt: "Compare the two tellings out loud.",
      narration: { audio: `${Q}/c-6-speak-compare-tellings.mp3`, script: "Now the comparison, out loud. Tap the mic, then say, in first person we know, and finish it with what Tilly's page lets you know. After that, say, in third person we also know, and finish it with what only Dex's page could tell you." },
      hint: { audio: `${Q}/c-6-speak-compare-tellings-hint.mp3`, script: "The hint comes in two halves. The first half is what Tilly thought the grin meant. The second half is what the grin really meant." },
      explain: { audio: `${Q}/c-6-speak-compare-tellings-explain.mp3`, script: "One way to say it goes like this. In first person we know Tilly thought the grin meant Dex knew her plan. In third person we also know Dex was frightened and had no idea where she would kick." },
      interaction: { type: "speak", text: "first third person tilly dex kicker goalie grin grinned grinning frightened scared nervous afraid knew know knows thought thoughts guess plan corner boot untied dive left wide relieved only also inside" },
    },
    {
      id: "h-1-words-shape-taught",
      band: "harder",
      difficulty: 1,
      prompt: "Which words show the kicker's view of Dex?",
      narration: { audio: `${Q}/h-1-words-shape-taught.mp3`, script: "Here is a fifth grade move. A narrator's point of view does not only change what we can know. It also shapes how the same event gets described. Watch me with a fall in a hallway. One teller says, I tripped over the bag. Another teller says, the bag was shoved into the path. Same fall, but tripped makes it an accident, and shoved makes it somebody's fault, so the words show each teller's view. Now you. Two tellers describe Dex on the goal line. Tilly says, Dex sprawled across the line like he owned it. Dex says, I crouched on the line, tried to disappear, and waited for the kick. Four pieces are on your screen. Tap the words that show the kicker's view of Dex." },
      hint: { audio: `${Q}/h-1-words-shape-taught-hint.mp3`, script: "The kicker is Tilly. Which words come from her telling, and make Dex look big and sure of himself?" },
      explain: { audio: `${Q}/h-1-words-shape-taught-explain.mp3`, script: "That one was tricky. The words sprawled like he owned it are Tilly's. From the spot, Dex looked huge and sure of himself, so her words make him that way. Dex's own words make him small." },
      interaction: { type: "choose", options: [{ id: "sprawled-like-he-owned-it", label: "sprawled like he owned it" }, { id: "tried-to-disappear", label: "tried to disappear" }, { id: "crouched-on-the-line", label: "crouched on the line" }, { id: "waited-for-the-kick", label: "waited for the kick" }], correctId: "sprawled-like-he-owned-it", coachWrong: "Those words are Dex's, and they make him small. Find the words that come from Tilly and make him big." },
    },
    {
      id: "h-2-words-shape-the-miss",
      band: "harder",
      difficulty: 2,
      prompt: "Whose telling makes the miss look tiny?",
      narration: { audio: `${Q}/h-2-words-shape-the-miss.mp3`, script: "Apply it again. Two tellers describe the same miss, and each teller's words make it a different size. Tilly says, the ball slid just past the post, so close that the net shivered. Dex says, the ball sailed a mile wide of the goal. Tap the telling that makes the miss look tiny." },
      hint: { audio: `${Q}/h-2-words-shape-the-miss-hint.mp3`, script: "Just past the post and a mile wide describe the same kick. Which words shrink the miss?" },
      explain: { audio: `${Q}/h-2-words-shape-the-miss-explain.mp3`, script: "That one was tricky. The kicker's telling makes it tiny. Tilly says just past the post and so close, because from her view it nearly went in. Dex says a mile wide, because from his view it was never close." },
      interaction: { type: "choose", options: [{ id: "the-kickers-telling", label: "the kicker's telling" }, { id: "the-goalies-telling", label: "the goalie's telling" }, { id: "both-tellings-the-same", label: "both tellings the same" }, { id: "neither-telling", label: "neither telling" }], correctId: "the-kickers-telling", coachWrong: "Listen to the size words again. One teller says just past and so close, the other says a mile wide. Which one shrinks it?" },
    },
    {
      id: "h-3-speak-read-third-person",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: When the ball rolled wide, Dex was so relieved that he forgot to stand up until the referee waved at him.",
      narration: { audio: `${Q}/h-3-speak-read-third-person.mp3`, script: "The last line of the goalie's page is on your screen, told in third person. Tap the mic, then read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/h-3-speak-read-third-person-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word When." },
      explain: { audio: `${Q}/h-3-speak-read-third-person-explain.mp3`, script: "The sentence tells you that Dex was so relieved when the ball rolled wide that he forgot to stand up until the referee waved at him." },
      interaction: { type: "speak", text: "When the ball rolled wide Dex was so relieved that he forgot to stand up until the referee waved at him" },
    },
    {
      id: "h-4-speak-view-shapes-words",
      band: "harder",
      difficulty: 4,
      prompt: "Say how each teller's view shaped the words for the miss.",
      narration: { audio: `${Q}/h-4-speak-view-shapes-words.mp3`, script: "Last one, out loud. Tap the mic, then say which words Tilly chose for the miss and what they show about her view. After that, say which words Dex chose and what they show about his." },
      hint: { audio: `${Q}/h-4-speak-view-shapes-words-hint.mp3`, script: "One teller said just past the post. The other said a mile wide. Say why each one saw it that way." },
      explain: { audio: `${Q}/h-4-speak-view-shapes-words-explain.mp3`, script: "One way to say it goes like this. Tilly said just past the post because from the spot it almost went in, and Dex said a mile wide because from the line it was never going to beat him." },
      interaction: { type: "speak", text: "tilly dex kicker goalie close just past post net shivered mile wide small tiny big huge almost never nearly view point first third narrator words chose chosen describe describes relieved" },
    },
  ],
};
