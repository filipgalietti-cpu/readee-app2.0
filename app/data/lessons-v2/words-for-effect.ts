import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-for-effect-timings.json";

// Words for Effect (L.3.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-for-effect
// G3-U4 word-work lesson, the GRADE 3 CENTER of L.3.3. Two moves. (a) WORDS
// FOR EFFECT (L.3.3a): a writer picks the word, the precise noun, or the
// placed detail that makes the reader FEEL or SEE more, and the child can
// NAME the effect a choice makes (a tense hush, a hurry, a calm, a shiver)
// and PICK the choice that makes a named effect. (b) SPOKEN vs WRITTEN
// (L.3.3b): people say things out loud (like, so then, kinda, yeah, gonna,
// a sentence that trails off, goes / is going for said) that they would not
// write in a story or a newsletter, and written standard English is fuller
// and more careful; the child tells which version belongs to talking and
// which belongs on the page, and NEITHER is wrong. Sibling split honored:
// match-your-voice (L.2.3) owns register by LISTENER (playground voice vs
// school voice, please / may I / wanna / gimme / see ya / thank-you card,
// all burned and avoided); words-we-use (L.1.6) joining words; just-right-
// words (L.1.5), word-ladders (L.2.5b) and shades-of-sure (L.3.5c) own the
// DIAL between near-same words (snatched / tone is a word-ladders-quiz tile,
// so the grab verb here is nabbed); build-a-better-sentence (L.3.1) grammar;
// commas-quotes-capitals (L.3.2) marks. THIS owns the EFFECT on a reader as
// the reason for a word choice, and spoken-vs-written as a CONVENTION.
// ONE story told twice: Saturday at the farmers market, when Dumpling the
// llama at Mr. Okoro's wool stand crept up on a small boy's dropped pretzel
// (Talia, her friend Desmond, their teacher Ms. Fairweather, the class
// newsletter). Page one = the WRITTEN version (5 dense sentences, ~115
// words, compound + early-complex, tagged dialogue, chosen verbs crept /
// hissed / nabbed / strolled, one placed detail); page two = the SPOKEN
// version Talia told Desmond on the walk to school (spoken forms like / so
// then / kinda / yeah / gonna / is going / a trailing sentence, and those
// spoken forms ARE the teaching point so they stay exactly as the tile
// shows); + a 2-sentence accept-mode child read of the written page. No
// digits, no apostrophe contractions in read-along text, no " my " in any
// speak text. ANCHOR FRESHNESS grep-swept whole lessons-v2 + quizzes-v2
// BEFORE writing: llama / farmers market / wool stand / Dumpling / Talia /
// Desmond / Okoro / Fairweather / strolled / hissed / bolted / nabbed /
// wandered / lunged / gonna / kinda / so then / totally 0 hits; crept +
// hushed incidental prose only; snatched (word-ladders-quiz h-2 taught
// tile), whisper (words-in-your-world + just-right-words-quiz), murmured
// (word-solvers taught), trudged / drifted (read-around-the-word, take-
// apart-any-word), tiptoed (describe-it-better), recess / playground /
// wanna / gimme / yeah-as-cheer (match-your-voice + quiz) found carried and
// avoided as taught items; names Leo / Rory / squirrel / oak / acorn from the
// draft dropped. Keys prefixed quiz- are fresh picture supports for the
// quiz's all-fresh street festival frame (Quentin, Grandpa Leland, cousin
// Ximena, the juggler on stilts, the dog in the fountain). Tiles lowercase,
// audio-free, kebab ids, 28-char cap; model scenes gate none; speak scenes
// imageless; every narration under about 1000 characters, teaching first,
// no question or quoted-sentence openers. RE-RECORDS after whisper-verify
// (scratchpad wfe-synth.ts mirroring lesson-tts): hook narration v1 dropped
// its tail after "belong to each." (34 s for 102 words) -> v2 verbatim;
// the newsletter sentence carried a 0.2 s inserted "it" before nabbed on
// both models -> v3 clean; the highlight narration was reworded ("one
// line exactly as Talia said it") after a 3-hear "the way" -> "that". The
// spoken read-along sentence ships the ORIGINAL lesson-tts take: gonna is
// heard verbatim on both models, kinda is transcribed "kind of" by
// unprimed whisper on every take (0.36 s, shorter than a 0.58 s full-form
// control, primed small hears kinda) = whisper normalization of the
// reduced form, and the model narration says kinda and gonna in isolation,
// verbatim on both models.

const A = (id: string) => `/audio/lessons-v2/words-for-effect/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-for-effect/${w.toLowerCase()}.png`;

export const wordsForEffectImages: Record<string, string | { subject: string; ref?: string }> = {
  "market-llama": "A sunny outdoor farmers market on green grass, a tall cream-colored llama with a long neck lowering its head toward a soft brown pretzel lying in the grass, a small boy of about five with red hair in a yellow T-shirt standing very still with his empty hand held out, an older man with a gray beard and a green apron behind a wooden stand piled with balls of gray and cream yarn, the man raising one hand with his finger to his lips, a few grown-ups in the background standing frozen and watching, white market tents, a plain blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no price tags, no banners, no labels, no writing anywhere.",
  "walk-to-school": "A morning sidewalk lined with small trees, a girl of about eight with dark curly hair in a red backpack and a purple jacket walking and talking with both hands raised in the air as if telling an exciting story, a boy of about eight with round glasses, short black hair and a blue jacket walking beside her with a green backpack, his mouth open in a laugh, a school building with a flag pole far down the street, plain blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.",
  // Quiz easier-band picture supports (all-fresh street festival frame):
  "quiz-juggler-stilts": "An evening street festival with strings of round paper lanterns, a tall juggler on very tall red wooden stilts wearing a purple vest and a striped shirt, three red juggling pins in the air above his hands, a crowd of people looking up, a round stone fountain with a spray of water in the foreground, food carts with plain striped awnings. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no labels, no writing anywhere.",
  "quiz-dog-fountain": { subject: "The same evening street festival with paper lanterns, a shaggy brown dog leaping through the air into a round stone fountain, a big splash of water rising, one red juggling pin floating in the water, a boy of about nine with freckles and a green cap and an elderly man with white hair and a brown cardigan watching from the edge of the fountain with their mouths open. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no labels, no writing anywhere.", ref: "quiz-juggler-stilts" },
  "quiz-juggler-bow": { subject: "The same juggler in a purple vest and striped shirt standing on the ground beside his tall red stilts, bowing low with one arm sweeping out, the same shaggy brown dog dripping wet beside him holding a red juggling pin in its mouth, a happy crowd clapping under paper lanterns at night. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no banners, no labels, no writing anywhere.", ref: "quiz-juggler-stilts" }
};

export const wordsForEffect: LessonDef = {
  id: "words-for-effect",
  title: "Words for Effect",
  grade: "3rd Grade",
  standard: "L.3.3",
  archetype: "vocabulary",
  objective: "I can choose a word or a detail for the effect it makes on a reader, name that effect, and tell which words belong to talking and which belong on the page.",
  concepts: [
    "a writer picks the word that makes the reader feel or see more",
    "the effect is the feeling a word choice makes: a hush, a hurry, a calm, a shiver",
    "a strong verb, a precise noun, and one placed detail are the tools for effect",
    "people say things out loud that they would not write on the page",
    "written English is fuller and more careful: whole sentences, no fillers, chosen words",
    "neither way is wrong; the words have to match where they are going",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you chose words the way a writer does. A strong verb, a precise noun, or one placed detail can make a reader hold their breath, hurry, or settle down, and you named those effects and picked the words that make them. You also heard one morning told two ways, out loud to a friend and written for the page, and you sorted the words that belong to each. Both ways are good. The skill is matching the words to where they are going.",
    "title": "Words for Effect",
    "body": "You chose words and details for the effect they make, and you told talking words from page words."
  },
  scenes: [
    {
      id: "hook-read-the-newsletter",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one, the class newsletter. Read along!",
      image: IMG("market-llama"),
      narration: { audio: A("hook-read-the-newsletter"), script: "Hello, reader. Today is about choosing words on purpose. A writer picks each word for the effect it makes on the reader, the feeling it leaves behind, and a third grader can name that effect and pick the word that makes it. You will also hear the same story told two ways, once out loud to a friend and once written for the page, and you will learn which words belong to each. Here is page one. Talia wrote it for the class newsletter after a strange Saturday at the farmers market. Read along with me, and notice the words she chose." },
      interaction: { type: "read-along", text: "On Saturday morning a llama named Dumpling stood beside the wool stand at the farmers market, chewing slowly while Mr. Okoro sold his gray and cream yarn. When a small boy dropped his pretzel in the grass, Dumpling lowered her long neck and crept toward it one silent step at a time. The crowd hushed, and Mr. Okoro raised one hand and hissed, \"Nobody move.\" Dumpling nabbed the pretzel, chewed it with her lips wobbling, and strolled back to the wool stand as if nothing had happened. The boy stared at his empty hand for a long moment, and then he laughed so hard that he sat down in the grass.", audio: A("hook-read-the-newsletter-sentence") },
    },
    {
      id: "model-the-chosen-word",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the plain word, the chosen word, and the effect.",
      fx: {"text":"walked, or **crept**? said, or **hissed**?","effect":"pop-words"},
      narration: { audio: A("model-the-chosen-word"), script: "Every word on that page was chosen, and here is how a writer chooses. Talia could have written that the llama walked toward the pretzel. Walked is true, but it makes the reader feel nothing. She wrote crept instead, and crept makes you hold your breath, because you can see the slow, silent steps. That feeling is the effect. She could have written that Mr. Okoro said, nobody move. She wrote hissed, and hissed makes the whole moment tense and quiet, like a warning through closed teeth. Nabbed makes the grab feel quick and sudden. Strolled makes the ending feel calm and lazy, as if the llama had done nothing at all. So a writer asks one question before picking a word, and the question is what she wants the reader to feel. Then she picks the word that makes it." },
    },
    {
      id: "guided-choose-word-for-hurry",
      purpose: "guided",
      gate: "interaction",
      prompt: "When the wind grabbed the boy's hat, he ___ after it. Which word makes the hurry?",
      narration: { audio: A("guided-choose-word-for-hurry"), script: "Your turn to pick a word for an effect. Here is a fresh sentence from that morning, with a word missing. When the wind grabbed the boy's hat, he blank after it. Talia wants the reader to feel the hurry, a sudden rush. Four words are on your screen, and each one makes a different effect. Tap the word that makes the hurry." },
      interaction: { type: "choose", options: [{ id: "bolted", label: "bolted" }, { id: "wandered", label: "wandered" }, { id: "crept", label: "crept" }, { id: "strolled", label: "strolled" }], correctId: "bolted", coachWrong: "Say the sentence with your word inside. Does it feel like a sudden rush, or does it feel slow, sneaky, or lazy? Find the word that makes you hurry with him." },
    },
    {
      id: "guided-choose-effect-of-hissed",
      purpose: "guided",
      gate: "interaction",
      prompt: "Mr. Okoro raised one hand and hissed, \"Nobody move.\" What effect does hissed make?",
      narration: { audio: A("guided-choose-effect-of-hissed"), script: "Now name the effect a word makes. Here is the line from the page. Mr. Okoro raised one hand and hissed, nobody move. Ask what hissed does to the reader that said could never do. Four effects are on your screen. Tap the effect that hissed makes." },
      interaction: { type: "choose", options: [{ id: "a-tense-hush", label: "a tense hush" }, { id: "a-big-laugh", label: "a big laugh" }, { id: "a-lazy-calm", label: "a lazy calm" }, { id: "a-loud-cheer", label: "a loud cheer" }], correctId: "a-tense-hush", coachWrong: "Say the word hissed out loud and listen to it. Is it loud or quiet? Is it relaxed or on edge? Find the effect that matches that sound." },
    },
    {
      id: "guided-choose-word-for-calm",
      purpose: "guided",
      gate: "interaction",
      prompt: "After the market closed, Mr. Okoro ___ home along the river path. Which word makes the calm?",
      narration: { audio: A("guided-choose-word-for-calm"), script: "One more word for an effect, and this time the effect is different. Here is the sentence. After the market closed, Mr. Okoro blank home along the river path with his hands in his pockets. Talia wants the reader to feel calm and unhurried, the way the end of a long day feels. Four words are on your screen. Tap the word that makes the calm." },
      interaction: { type: "choose", options: [{ id: "strolled", label: "strolled" }, { id: "bolted", label: "bolted" }, { id: "lunged", label: "lunged" }, { id: "crept", label: "crept" }], correctId: "strolled", coachWrong: "Hands in his pockets, nowhere to hurry. That word makes a rush or a sneak, not a calm. Find the slow, easy one." },
    },
    {
      id: "model-the-detail-for-effect",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: a precise noun and one placed detail.",
      fx: {"text":"crept toward it **one silent step at a time**","effect":"underline"},
      narration: { audio: A("model-the-detail-for-effect"), script: "A verb is not the only choice a writer makes. A detail can carry an effect too. Look at how Talia wrote the llama's walk. Dumpling lowered her long neck and crept toward it one silent step at a time. She could have stopped after crept. She added one silent step at a time, and that detail slows the reader down and makes them hold their breath along with the crowd. A precise noun does the same job. A snack is fuzzy, but a pretzel is something you can see and smell. A table is fuzzy, but a wool stand puts you right at the market. So a writer has three tools for effect. A strong verb, a precise noun, and one detail placed exactly where the reader needs to feel something." },
    },
    {
      id: "apply-choose-detail-for-effect",
      purpose: "apply",
      gate: "interaction",
      prompt: "Dumpling stopped an arm's length from the boy, ___. Which detail makes the reader shiver?",
      narration: { audio: A("apply-choose-detail-for-effect"), script: "Your turn with a detail. Talia wants one more shiver right before the grab. Here is the sentence, with the detail missing. Dumpling stopped an arm's length from the boy, blank. Four details are on your screen, and all four are true, but only one makes the reader shiver. Tap it." },
      interaction: { type: "choose", options: [{ id: "her-big-eyes-fixed-on-him", label: "her big eyes fixed on him" }, { id: "her-wool-the-color-of-cream", label: "her wool the color of cream" }, { id: "her-tail-short-and-fluffy", label: "her tail short and fluffy" }, { id: "the-sky-clear-and-blue", label: "the sky clear and blue" }], correctId: "her-big-eyes-fixed-on-him", coachWrong: "That detail is true, but it only describes. It does not make you feel anything. Find the detail that makes the moment feel a little dangerous." },
    },
    {
      id: "apply-read-the-telling",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, the way Talia told it on the walk to school. Read along!",
      image: IMG("walk-to-school"),
      narration: { audio: A("apply-read-the-telling"), script: "Now hear the same morning told a different way. On Monday, Talia told Desmond about it on the walk to school. She was not writing for the newsletter. She was talking to a friend, and talking has its own rules. Read along with me, and listen for the words she said out loud that she never wrote on the page." },
      interaction: { type: "read-along", text: "So we were at the farmers market Saturday, right, and there was this llama at the wool stand. Like, a real llama, and it was just chewing and stuff. So then this little boy drops his pretzel, and the llama just kinda goes for it, super slow. Everybody was like, uh oh, and Mr. Okoro is going, nobody move, nobody move. And then, yeah, it just grabbed the pretzel and ate it and went back. We were gonna get honey after, but it was so weird, you had to be there.", audio: A("apply-read-the-telling-sentence") },
    },
    {
      id: "model-said-or-written",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the same moment, said out loud and written down.",
      fx: {"text":"so then, like, it just goes for it. **Dumpling crept toward it.**","effect":"pop-words"},
      narration: { audio: A("model-said-or-written"), script: "Both tellings are true, and both are good in their place. When Talia talks, she says like, so then, kinda, and yeah. She says gonna instead of going to. She says the llama goes for it, and she says Mr. Okoro is going, instead of said. She lets a thought trail off, because Desmond is right there and can see her face. That is how spoken English works, out loud, with a friend. When she writes for the newsletter, the reader cannot see her face, so the page has to do all the work. Every sentence is whole. The fillers are gone. The plain word goes turns into the chosen word crept. Nobody writes kinda in a newsletter, and nobody says a newsletter sentence to a friend on the sidewalk. A good writer knows both sets of rules and picks the set that matches where the words are going." },
    },
    {
      id: "guided-highlight-spoken-words",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the two words that belong only to talking.",
      narration: { audio: A("guided-highlight-spoken-words"), script: "Here is one line exactly as Talia said it out loud. Two of its words are talking words, the kind you say to a friend and never write on the page. Every other word in the line could go straight into the newsletter. Read the line on your screen, and tap the two words that belong only to talking." },
      interaction: { type: "highlight", text: "The llama went for the pretzel, and everybody kinda gasped, yeah.", targets: ["kinda","yeah"], coachWrong: "That word could sit on the page as it is. Look for a squeezed word or a filler, the kind that only shows up when you talk." },
    },
    {
      id: "apply-sort-said-or-written",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each line: Said Out Loud or Written Down.",
      narration: { audio: A("apply-sort-said-or-written"), script: "Six lines about that Saturday are on your screen. Some are the way Talia said it to Desmond, and some are the way she wrote it for the page. Run the test on each one. If the line carries a word you would only say, a filler or a squeezed word, drag it to Said Out Loud. If it is a whole, careful sentence with a chosen word and no fillers, drag it to Written Down." },
      interaction: { type: "sort", buckets: ["Said Out Loud","Written Down"], items: [{ label: "yeah, it was so weird", bucket: "Said Out Loud" }, { label: "the crowd fell silent", bucket: "Written Down" }, { label: "so then, like, it ate it", bucket: "Said Out Loud" }, { label: "the boy stared at his hand", bucket: "Written Down" }, { label: "we were kinda scared", bucket: "Said Out Loud" }, { label: "she strolled to the stand", bucket: "Written Down" }], coachWrong: "Read that line again and listen for a filler or a squeezed word. If it has one, it was said. If every word could sit on the page, it was written." },
    },
    {
      id: "apply-choose-written-version",
      purpose: "apply",
      gate: "interaction",
      prompt: "Talia said, we were gonna get honey after, and stuff. Which version belongs in the newsletter?",
      narration: { audio: A("apply-choose-written-version"), script: "Now you turn a spoken line into a written one. Here is what Talia said to Desmond. We were gonna get honey after, and stuff. Four versions are on your screen. Three of them still carry talking words. One is ready for the page, a whole sentence with no fillers and no squeezed words. Tap that one." },
      interaction: { type: "choose", options: [{ id: "later-we-bought-some-honey", label: "later we bought some honey" }, { id: "we-were-gonna-get-honey", label: "we were gonna get honey" }, { id: "we-got-honey-after-and-stuff", label: "we got honey after and stuff" }, { id: "yeah-we-got-honey-after", label: "yeah, we got honey after" }], correctId: "later-we-bought-some-honey", coachWrong: "That version still has a talking word in it. Find the one where every word could go straight onto the page." },
    },
    {
      id: "apply-speak-read-the-page",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: The crowd hushed, and Mr. Okoro raised one hand and hissed, \"Nobody move.\" Dumpling nabbed the pretzel, chewed it with her lips wobbling, and strolled back to the wool stand as if nothing had happened.",
      narration: { audio: A("apply-speak-read-the-page"), script: "Two sentences from the newsletter page are yours to read, and they carry three chosen words. Read them out loud, clearly and at a talking pace, and let each chosen word make its effect." },
      interaction: { type: "speak", text: "The crowd hushed and Mr Okoro raised one hand and hissed Nobody move Dumpling nabbed the pretzel chewed it with her lips wobbling and strolled back to the wool stand as if nothing had happened" },
    },
    {
      id: "challenge-speak-word-for-effect",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a plain sentence. Say it again with one word changed for effect. Name the effect.",
      narration: { audio: A("challenge-speak-word-for-effect"), script: "Last one, and you are the writer. Think of a plain sentence about someone moving or speaking, like a dog going across a yard or a teacher saying good morning. Tap the mic and say it plainly first. Then say it again with one word changed to a stronger one, and tell me the effect your new word makes on the reader." },
      interaction: { type: "speak", text: "crept bolted hissed nabbed strolled ambled lunged dawdled inched raced dashed darted sprinted whispered shouted yelled roared tiptoed slammed grabbed snatched stomped marched hush hushed shiver shivery hurry rush calm calmly tense quiet loud fast quick slow sneaky funny laugh jolt sudden spooky scary excited scared effect feel feels" },
    },
    {
      id: "celebrate-words-for-effect",
      purpose: "celebrate",
      gate: "none",
      prompt: "Chosen on purpose.",
      fx: {"text":"Pick the word for the **effect**","effect":"fireworks"},
      narration: { audio: A("celebrate-words-for-effect"), script: "Today you chose words the way a writer does. Crept makes a reader hold their breath, hissed makes a tense hush, and strolled makes a calm, and you picked the word and the detail for the effect you wanted. You also heard one Saturday told two ways. Out loud, Talia said like and kinda and gonna, and that was exactly right for a friend. On the page, every sentence was whole and every word was chosen, and that was exactly right for a reader. Match the words to where they are going, and both of your voices will sound just right." },
    },
  ],
};
