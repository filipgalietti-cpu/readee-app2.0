import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./build-a-better-sentence-timings.json";

// Build a Better Sentence (L.3.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=build-a-better-sentence
// G3-U3 word-work lesson, the GRADE 3 CENTER of L.3.1. Sibling split honored:
// grammar-builders (L.1.1) owns one-dog-runs / two-dogs-run, he-she-it-they
// stand in for names, and complete vs not-yet sentences; words-we-use (L.1.6)
// owns because / and / but / so as single joining words with jobs (tells why,
// adds more, shows a change, tells what happened next); rule-breaker-words
// (L.2.1) owns foot/feet, tooth/teeth, mouse/mice, man/men, goose/geese,
// sit/sat, tell/told, run/ran, hide/hid + its quiz's child/children,
// woman/women, person/people, sheep/deer, ate/flew/swam/came/went, and the
// collective nouns; describe-it-better (L.2.6) owns adjectives vs adverbs
// (thing helpers / action helpers); letter-perfect (L.2.2) capitals, apostrophes
// and letter commas (NOT touched, L.3.2 owns conventions); match-your-voice
// (L.2.3) register; because-then-so (RI.3.3) time words vs cause words as
// text signals. THIS owns: (1) the two ways to JOIN two whole ideas, compound
// (comma + and/but/so, both halves stand alone) vs COMPLEX (because / when /
// although / until start a part that LEANS on the rest), and choosing the
// joining word whose meaning fits; (2) the agreement CHECK the child runs
// (find the subject, ask one or more than one, say it) on verbs AND on
// stand-in words; (3) present / past / future with FRESH irregular pasts
// (shake/shook, tear/tore, freeze/froze, hold/held, choose/chose); (4)
// comparing the right way (er / est for short words, more / most for long
// words and every ly word, two things vs three or more); (5) one beat on
// abstract nouns (patience taught, luck asked). ONE story: the science fair
// egg drop (Sadie, her cousin Enzo, science teacher Mrs. Petrov, the gym
// balcony, a sponge-and-foam-cup package, the tower of straws that splats).
// Two dense 5-sentence read-alongs written with DELIBERATELY varied
// sentences (page one: three compound, two complex incl. Although-first,
// taller / sturdiest, built / shook / heard / tore / wrote / thought, halves /
// children, tagged dialogue; page two: When-first, held / fell / hit / went /
// knew, faster / more tightly, the abstract noun patience) + a 3-sentence
// accept-mode child read (compound, so-that, Although-first, proudest). No
// digits, no contractions inside read-along text, no " my " in any speak
// text. ANCHOR FRESHNESS grep-swept whole lessons-v2 + quizzes-v2 BEFORE
// writing: egg drop / balcony / yolk / padding / science fair as a topic /
// Sadie / Enzo / Petrov / although / until / tore / shook / froze / chose /
// halves / more carefully / most carefully / luck / pride 0 tile hits
// (patience + courage are follow-the-message-quiz tiles, so patience is
// TAUGHT in narration and luck is the tile; children / went / ate / saw /
// feet / mice are rule-breaker taught items and appear only in prose here;
// taller / faster / louder / softer tiles elsewhere, used in prose only).
// Highlight beat: the narration never reads the wrong sentence (lint
// no-reveal on highlight targets + Autonoe would silently correct it); the
// child reads it on screen, which is the G3 contract. Tiles lowercase
// (Mrs Petrov keeps its capital), audio-free, kebab ids, 28-char cap; speak
// scenes imageless; model scenes gate none.

const A = (id: string) => `/audio/lessons-v2/build-a-better-sentence/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/build-a-better-sentence/${w.toLowerCase()}.png`;

export const buildABetterSentenceImages: Record<string, string | { subject: string; ref?: string }> = {
  "egg-drop-table": "A school gym set up for a science fair, a girl of about eight with a brown ponytail in a green T-shirt and a boy of about nine with short black hair in an orange hoodie standing at a long folding table, the girl holding a small round package made from a white foam cup and yellow kitchen sponges, the boy pressing a strip of clear tape onto it, one plain white egg resting in a small bowl on the table, a tall wobbly tower built from drinking straws standing on the next table, a few other children in the background, tall windows with daylight. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no posters, no labels, no writing anywhere.",
  "gym-balcony-drop": { subject: "The same school gym seen from the floor, a woman teacher with gray curly hair and round glasses in a blue cardigan leaning over the rail of a high indoor balcony and letting go of a small round package made from a white foam cup and yellow sponges that is falling through the air, the same girl with a brown ponytail in a green T-shirt and the same boy with short black hair in an orange hoodie watching from below with their hands clasped together, a collapsed tower of drinking straws lying on the floor beside a splash of yellow egg yolk on the tiles, other children watching from the edges. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no posters, no labels, no writing anywhere.", ref: "egg-drop-table" },
  // Quiz easier-band picture supports (all-fresh garage puppet show frame):
  "quiz-two-wolf-puppets": "Two gray wolf hand puppets sewn from socks, each with two black button eyes and a stitched red felt tongue, held up side by side above the edge of a cardboard box stage by two hands, a plain tan garage wall behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no stickers, no writing anywhere.",
  "quiz-garage-shelves": "The inside of a tidy garage with three long wooden shelves on the wall, the shelves holding plain unmarked paint cans, a coiled green garden hose, a red metal toolbox, a stack of flower pots and a folded blue tarp, a concrete floor, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no paper tags, no stickers, no writing anywhere.",
  "quiz-sheet-curtain": "A white bedsheet hanging from a rope stretched across the open doorway of a garage like a stage curtain, a girl of about nine with two dark braids in a purple sweater standing on a step stool and pinning the last corner of the sheet to the rope with a clothespin, a small boy with curly red hair in a striped shirt holding the other end of the rope, late afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere."
};

export const buildABetterSentence: LessonDef = {
  id: "build-a-better-sentence",
  title: "Build a Better Sentence",
  grade: "3rd Grade",
  standard: "L.3.1",
  archetype: "vocabulary",
  objective: "I can join two ideas with the right word, keep every verb matched to its subject, use the right tense, and compare things correctly.",
  concepts: [
    "a compound sentence joins two whole ideas with a comma and a small word like and, but, or so",
    "a complex sentence has a part that leans on the rest, started by because, when, although, or until",
    "the joining word has to fit the meaning: a reason, a result, a change, a time, or even though",
    "the subject decides the verb, and a stand-in word matches the noun it stands for",
    "verbs tell now, before, or later, and some past verbs refuse e d",
    "two things take er or more, three or more take est or most, long words and ly words take more and most",
    "some nouns name things you cannot touch, like patience",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you built better sentences. You joined two ideas with the right small word, you ran the check that keeps a verb matched to its subject, you told about the past with words like shook and held, and you compared things the right way with taller and more carefully. Keep building sentences that carry exactly what you mean.",
    "title": "Sentence Builder",
    "body": "You joined ideas with the right word, ran the agreement check, used the past correctly, and compared the right way."
  },
  scenes: [
    {
      id: "hook-read-egg-drop",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one, the egg drop. Read along!",
      image: IMG("egg-drop-table"),
      narration: { audio: A("hook-read-egg-drop"), script: "Hello, reader. Today is about building sentences the way a third grader builds them. You will join two short ideas with the right word, check that every verb matches its subject, tell about the past and the future, and compare things the correct way. The story is a science fair, and the contest is an egg drop. Read along with me, and notice how the sentences are built. Some are two whole ideas joined by a small word, and some have a part that leans on the rest." },
      interaction: { type: "read-along", text: "Sadie and her cousin Enzo built an egg-drop package for the science fair, and they wrapped a raw egg in three cotton balls and half of a foam cup. Although the package looked sturdy, Enzo shook it gently and heard the egg rattle inside. \"It needs more padding,\" said Sadie, so they tore two dish sponges into halves and stuffed the gaps. Mrs. Petrov wrote every team on a list because the packages had to drop in order. The other children had built taller towers out of straws and tape, but Sadie thought their small package was the sturdiest one in the gym.", audio: A("hook-read-egg-drop-sentence") },
    },
    {
      id: "model-two-ways-to-join",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: two short ideas, joined two ways.",
      fx: {"text":"The egg rattled, **so** they added padding. They added padding **because** the egg rattled.","effect":"pop-words"},
      narration: { audio: A("model-two-ways-to-join"), script: "Here are two short sentences. The egg rattled. They added padding. Each one is a whole idea, and a writer can join them two ways. Way one uses so. The egg rattled, so they added padding. Both halves could still stand alone, and a comma plus a small word holds them together. The small word can be and, but, or so. That is a compound sentence. Way two uses because. They added padding because the egg rattled. Now the second half leans on the first, since the words because the egg rattled cannot stand alone. That is a complex sentence, and words like because, when, although, and until start the leaning part. The joining word also carries the meaning. So points to a result. Because points to a reason. But points to a change. When points to a time. Although says this happened even though that was true." },
    },
    {
      id: "guided-choose-although",
      purpose: "guided",
      gate: "interaction",
      prompt: "___ the tower was taller, the small package won.",
      narration: { audio: A("guided-choose-although"), script: "Your turn to pick the joining word that fits the meaning. Here is the sentence, with a hole at the front. Blank, the tower was taller, the small package won. Think about what the two halves are doing. The tower had the height, and the small package won anyway. Four joining words are on your screen. Tap the one whose meaning fits." },
      interaction: { type: "choose", options: [{ id: "although", label: "although" }, { id: "because", label: "because" }, { id: "when", label: "when" }, { id: "until", label: "until" }], correctId: "although", coachWrong: "Say the sentence with your word at the front. The small package won even though the tower was taller. Which joining word carries even though?" },
    },
    {
      id: "guided-sequence-join-so",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build one compound sentence: what happened first, the joining word, then the result.",
      narration: { audio: A("guided-sequence-join-so"), script: "Now you build a compound sentence out of three pieces. Two of the pieces are whole ideas, and one piece is the joining word so. So points to a result, which means the thing that happened first goes first, then so, then what happened because of it. Tap the three pieces in order." },
      interaction: { type: "sequence", items: [{ id: "grabbed-a-mop", label: "the teacher grabbed a mop" }, { id: "so", label: "so" }, { id: "yolk-leaked", label: "the yolk leaked" }], order: ["yolk-leaked","so","grabbed-a-mop"], coachWrong: "Which piece happened first, and which piece happened because of it? The first thing, then so, then the result." },
    },
    {
      id: "model-subject-decides",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the subject decides the verb.",
      fx: {"text":"The **sponge holds** the egg. The **sponges hold** the egg.","effect":"underline"},
      narration: { audio: A("model-subject-decides"), script: "Every sentence has a subject, the one doing the action, and the subject decides the verb. Watch. The sponge holds the egg. One sponge, so the verb wears an s. The sponges hold the egg. More than one sponge, so the s comes off. Here is the check a third grader runs. Find the subject, ask one or more than one, and say the sentence to hear whether the verb matches. The check works on stand-in words too. A pronoun has to match the noun it stands for. Sadie is one girl, so she. The cousins are two people, so they. The package is a thing, so it. The cousins packed the box, and they carried it to the gym. They matches the cousins, and it matches the box." },
    },
    {
      id: "guided-highlight-does-not-agree",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the two words that do not match.",
      narration: { audio: A("guided-highlight-does-not-agree"), script: "Here is a sentence where two words do not match. Run the check on each part. Find the subject, ask one or more than one, and see whether the verb and the stand-in word agree with it. Read the sentence on your screen, and tap the two words that do not match." },
      interaction: { type: "highlight", text: "The two cousins carries the package, and Mrs. Petrov thanks him.", targets: ["carries","him"], coachWrong: "Find the subject of that part. Is it one or more than one? Now check the verb, and check the stand-in word, against it." },
    },
    {
      id: "apply-read-the-drop",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, the drop. Read along!",
      image: IMG("gym-balcony-drop"),
      narration: { audio: A("apply-read-the-drop"), script: "Back to the gym for page two, the drop itself. Read along with me, and listen for the verbs that tell about the past without any e d on the end, and for the words that compare one thing with another." },
      interaction: { type: "read-along", text: "When Mrs. Petrov climbed to the gym balcony, the whole room went quiet. She held the first package over the rail, and it fell faster than anyone expected. The tall tower of straws hit the floor with a crunch, and yellow yolk leaked across the tiles. Enzo squeezed the sponge package more tightly than he needed to, but he handed it up when Mrs. Petrov called their names. It dropped, bounced twice, and rolled to a stop, and Sadie knew before she opened it that their patience had paid off.", audio: A("apply-read-the-drop-sentence") },
    },
    {
      id: "model-three-times",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: a verb tells now, before, or later.",
      fx: {"text":"shake, **shook**, will shake","effect":"pop-words"},
      narration: { audio: A("model-three-times"), script: "A verb also tells when. Enzo shakes the package. That is now, the present. Enzo shook the package. That already happened, the past. Enzo will shake the package. That is later, the future, and the word will does the job. Most verbs make the past with e d, like dropped and rolled. Some refuse, and you learn them by heart. Shake becomes shook. Tear becomes tore. Freeze becomes froze. Hold becomes held. Choose becomes chose. On page two the room went quiet, Mrs. Petrov held the package, and it fell. Not holded, and not falled. Held, and fell." },
    },
    {
      id: "apply-choose-tore",
      purpose: "apply",
      gate: "interaction",
      prompt: "At the fair, Enzo ___ the sponges into halves.",
      narration: { audio: A("apply-choose-tore"), script: "Your turn with the past. Here is the sentence, and it is on your screen. At the fair, Enzo blank the sponges into halves. The fair already happened, so the verb must tell about the past, and this verb is one of the ones that refuses e d. Four forms are on your screen. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "tore", label: "tore" }, { id: "tears", label: "tears" }, { id: "tearing", label: "tearing" }, { id: "tear", label: "tear" }], correctId: "tore", coachWrong: "The tearing already happened, and this verb does not take e d. Say the sentence with your form inside. Does it sound like the past?" },
    },
    {
      id: "apply-sort-compound-complex",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each sentence: Compound or Complex.",
      narration: { audio: A("apply-sort-compound-complex"), script: "Six sentences are on your screen, and the joining word in each one tells you what kind it is. If a comma and a small word hold two whole ideas together, drag the sentence to Compound. If a word like when, because, or until starts a part that leans on the rest, drag the sentence to Complex." },
      interaction: { type: "sort", buckets: ["Compound","Complex"], items: [{ label: "it rained, so we stayed in", bucket: "Compound" }, { label: "we left when the bell rang", bucket: "Complex" }, { label: "she ran, but she was late", bucket: "Compound" }, { label: "she smiled because she won", bucket: "Complex" }, { label: "he sang, and we clapped", bucket: "Compound" }, { label: "we hid until the dog left", bucket: "Complex" }], coachWrong: "Find the joining word. Could both halves stand alone as whole sentences? Then it is compound. Does one part lean on the other? Then it is complex." },
    },
    {
      id: "model-comparing",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: compare two things, or three or more.",
      fx: {"text":"tall, **taller**, **tallest**. careful, **more** careful, **most** careful.","effect":"pop-words"},
      narration: { audio: A("model-comparing"), script: "Now the comparing words. When you compare two things, a short word takes e r. The tower was taller than the package. When you compare three or more, it takes e s t. The sponge package was the sturdiest one in the gym. A long word does not take those endings. It takes more or most instead. Sadie was more careful than Enzo, and Mrs. Petrov was the most careful person in the room. Words that tell how, the ones ending in l y, always take more or most. Enzo squeezed the package more tightly than he needed to. Two things, e r or more. Three or more, e s t or most. Long words and l y words, more and most." },
    },
    {
      id: "apply-choose-more-carefully",
      purpose: "apply",
      gate: "interaction",
      prompt: "Sadie wrapped the egg ___ than Enzo did.",
      narration: { audio: A("apply-choose-more-carefully"), script: "Your turn to compare. Here is the sentence, and it is on your screen. Sadie wrapped the egg blank than Enzo did. Count the people being compared, and notice that the missing word tells how she wrapped it. Four forms are on your screen. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "more-carefully", label: "more carefully" }, { id: "most-carefully", label: "most carefully" }, { id: "carefuller", label: "carefuller" }, { id: "careful", label: "careful" }], correctId: "more-carefully", coachWrong: "Two people are being compared, and the word ends in l y. Which form does a long l y word take when there are only two?" },
    },
    {
      id: "apply-choose-cannot-touch",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word names something you cannot touch?",
      narration: { audio: A("apply-choose-cannot-touch"), script: "One more kind of naming word. Most nouns name things you can touch or see, like a table, a ladder, or an egg. A few name things you cannot touch at all, like patience. You cannot hold patience in your hand, but page two says the cousins had it, and it paid off. Four naming words are on your screen. Three of them name things you could pick up or stand on. Tap the one that names something you cannot touch." },
      interaction: { type: "choose", options: [{ id: "luck", label: "luck" }, { id: "sponge", label: "sponge" }, { id: "balcony", label: "balcony" }, { id: "yolk", label: "yolk" }], correctId: "luck", coachWrong: "Could you pick that thing up or stand on it? Then it is not the one. Find the word for something you can only feel or notice." },
    },
    {
      id: "apply-speak-read-crack",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Sadie peeled back the sponges, and the egg sat there without a single crack. Enzo cheered so loudly that Mrs. Petrov laughed. Although their ribbon was small, it was the proudest moment of the whole fair.",
      narration: { audio: A("apply-speak-read-crack"), script: "The story ends with three sentences that are yours to read. One is compound, one is complex, and one compares. Read them out loud, clearly and at a talking pace." },
      interaction: { type: "speak", text: "Sadie peeled back the sponges and the egg sat there without a single crack Enzo cheered so loudly that Mrs Petrov laughed Although their ribbon was small it was the proudest moment of the whole fair" },
    },
    {
      id: "challenge-speak-own-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one complex sentence about your day. Use because, when, or although.",
      narration: { audio: A("challenge-speak-own-sentence"), script: "Last one, and it comes from your own day. Think of one thing you did today, and one reason for it or one moment it happened. Tap the mic and say one complex sentence about it, with because, when, or although starting the part that leans on the rest." },
      interaction: { type: "speak", text: "because when although until after before since while woke ate went saw ran walked played read rode slept school lunch recess home bus mom dad brother sister friend teacher dog cat rain morning night today tired happy hungry late early" },
    },
    {
      id: "celebrate-sentence-builder",
      purpose: "celebrate",
      gate: "none",
      prompt: "Built the right way.",
      fx: {"text":"Build a **better** sentence","effect":"fireworks"},
      narration: { audio: A("celebrate-sentence-builder"), script: "You built better sentences today. Two whole ideas joined by a comma and a small word make a compound sentence, and a part that leans on the rest makes a complex sentence. The subject decides the verb, and a stand-in word matches its noun. Shook, tore, held, and fell tell about the past without e d. Taller, sturdiest, more carefully, and most careful compare the right way. And a word like patience names something you cannot touch. Every sentence you write can be built this well." },
    },
  ],
};
