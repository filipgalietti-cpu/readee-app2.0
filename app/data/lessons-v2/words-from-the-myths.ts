import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-from-the-myths-timings.json";

// Words From the Myths (RL.4.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-from-the-myths
// G4-U2 lesson 1. THE MYTHIC ALLUSION tier of RL.4.4 (sibling split:
// more-than-it-says RL.3.4 owns literal vs nonliteral phrases decoded from
// one story and sayings-that-mean-more L.3.5a owns shared sayings, so their
// phrases and their "means more than it says" frame are burned and unused;
// the word "idiom" never appears here; context-at-a-distance L.4.4a owns
// context clues and greek-and-latin-roots L.4.4b owns classical roots, so no
// root is taught and none of their target words appear; L.4.5 / L.4.5a own
// similes and metaphors, so no comparison is taught; follow-the-message
// RL.3.2 carries a pourquoi-style pelican myth and is untouched). THIS owns:
// a word or phrase that points back to a NAMED character from a Greek or
// Roman myth, whose meaning is borrowed from what that character was famous
// for; the move (spot the odd or capitalized word, ask who it is named after,
// ask what they were known for, borrow the quality, test it in the sentence);
// the name ALLUSION, spelled once; a short true myth summary taught inside the
// lesson for each allusion (Odysseus, Hercules, Midas, Achilles, the Trojan
// horse); the meaning the sentence borrows; WHICH quality of the character the
// writer borrowed (four true facts, one borrowed); the character / known for /
// means-now sequence; Points to a Myth vs Plain Saying; best evidence for an
// allusion's meaning; and explaining an allusion aloud ("Bertram calls the job
// Herculean because"). ONE original story, "Everything Must Go": Tabitha (ten)
// and her cousin Dorian (thirteen) help Great-Uncle Bertram sell everything in
// his garage; the drive is an odyssey, the workbench is a Herculean job, Dorian
// has the Midas touch, the red bicycle has an Achilles heel (a wobbling back
// wheel), a free box of comics is a Trojan horse (a nest of mice), and by
// sunset the garage is empty. 19 sentences over 4 pages: three dense
// read-alongs (pages 1/2/3, 6/5/5 sentences, ref-chained images) + one
// accept-mode child-read page (page 4, 49 tokens, no " my "), complex
// sentences with which/who/where clauses, past perfect, action-beat dialogue,
// stretch words odyssey / refund / chrome / glowing / confetti, no digits, no
// contractions. Odysseus taught in the model with a textless ship image;
// every other myth is told inside the beat that uses it. ANCHOR FRESHNESS
// grep-swept vs every lessons-v2 + quizzes-v2 file: Herculean / Hercules /
// Midas / Achilles / odyssey / Odysseus / Trojan / Titan / Atlas / Pandora /
// allusion / garage sale / lawn chair / refund / chrome / workbench-as-plot /
// Tabitha / Dorian / Bertram / Everything Must Go / cost an arm and a leg /
// couch potato / hit the nail on the head all 0 hits (moving day burned by
// when-and-where-words, so the world is a garage sale; piano burned as a prop
// in six quizzes and dropped). Keys prefixed quiz- are picture supports for
// the quiz's fresh second story (a class car wash: Kendrick, Constance).

const A = (id: string) => `/audio/lessons-v2/words-from-the-myths/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-from-the-myths/${w.toLowerCase()}.png`;

export const wordsFromTheMythsImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A suburban driveway on a sunny late morning, an open garage packed to the ceiling with old furniture, cardboard boxes, and paint cans, a huge heavy wooden workbench standing just inside the garage door, an elderly man with pale skin, a white mustache, and a green cardigan standing at the garage entrance holding a long sheet of plain blank white paper and pointing at the workbench, a ten year old girl with light brown skin and short black curly hair in a striped orange shirt standing beside a lanky thirteen year old boy with light brown skin, short dark hair, and a gray hoodie who is looking down at his own thin arms, a dusty blue car parked in the driveway behind them with one small black spare tire on the back wheel. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, the paper completely blank, no letters, no words, no numbers, no signs, no price tags, no writing anywhere.",
  "odyssey-ship": "An ancient Greek wooden sailing ship with one large square cloth sail and a row of long oars, tossed sideways on enormous dark storm waves under a heavy gray sky with a bolt of lightning far in the distance, a small rocky island with a dark cave mouth far away on the horizon, a few tiny sailors in plain tunics gripping the ropes, dramatic realistic scene, no faces on the waves, the clouds, or the sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, a plain sail with nothing on it, no letters, no words, no numbers, no flags, no symbols, no writing anywhere.",
  "page-2": { subject: "The same suburban front lawn on the same sunny afternoon, the same heavy wooden workbench now standing on the grass, two folding tables covered with old lamps, mugs, and books, the same lanky thirteen year old boy with light brown skin, short dark hair, and a gray hoodie handing a rusty lamp to a smiling adult customer beside a closed small gray metal cash box, the boy clearly having SHORT DARK BROWN HAIR and light brown skin exactly like the reference and NOT blond, and near the open garage the same ten year old girl with light brown skin, short black curly hair, and a striped orange shirt kneeling beside an old red bicycle with a shiny chrome bell and gray flat tires that she has just pulled out from behind a stack of paint cans, the same elderly man with pale skin, a white mustache, and a green cardigan bending over to spin the bicycle's back wheel with one finger. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain book covers and mugs with nothing on them, no letters, no words, no numbers, no signs, no price tags, no writing anywhere.", ref: "page-1" },
  "page-3": { subject: "The same suburban front lawn at the end of the afternoon in golden light, a large open cardboard box on a folding table with a stack of old comic books with plain colored covers lifted out of it and set beside it, and inside the box, revealed underneath where the comics were, a small nest of shredded paper with three tiny gray mice peeking out, the mice drawn realistic with no smiles, the same lanky thirteen year old boy with light brown skin, short dark hair, and a gray hoodie leaning back from the box with both arms stretched out, the same elderly man with pale skin, a white mustache, and a green cardigan holding up one hand in warning, the same ten year old girl with light brown skin, short black curly hair, and a striped orange shirt holding both hands over her mouth, the open garage behind them almost empty. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, comic covers completely plain with nothing on them, no letters, no words, no numbers, no signs, no price tags, no writing anywhere.", ref: "page-1" },
  "quiz-car-line": "A school parking lot on a bright Saturday morning seen from above and to the side, a very long line of cars of many colors winding along the whole edge of the lot and out along the street past the corner, children in wet tee shirts with buckets, sponges, and a garden hose washing the first car in the line, a low brick school building with plain windows behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no license plates with writing, no signs, no banners, no writing anywhere.",
  "quiz-muddy-truck": { subject: "The same school parking lot, an enormously tall pickup truck caked from top to bottom in thick brown mud so that its color cannot be seen, a ten year old boy with dark brown skin and short hair in a wet yellow tee shirt standing on the ground beside the truck on top of an upside down red bucket, stretching his sponge up as high as he can and still far below the truck's roof, nobody on top of the truck, three other children scrubbing the sides with sponges and straining with all their strength, soap suds and mud running down onto the pavement. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no license plates with writing, no signs, no writing anywhere.", ref: "quiz-car-line" }
};

export const wordsFromTheMyths: LessonDef = {
  id: "words-from-the-myths",
  title: "Words From the Myths",
  grade: "4th Grade",
  standard: "RL.4.4",
  archetype: "story-elements",
  objective: "I can find a word in a story that points to a character from a myth, tell what that character was known for, and explain the meaning the sentence borrows.",
  concepts: [
    "some words in a story point back to a character from a Greek or Roman myth",
    "the meaning is borrowed from what that character was famous for",
    "the move: spot it, who is it named after, what were they known for, borrow it, test it",
    "a word that borrows its meaning from an older story is an allusion",
    "a writer borrows one quality of the character, not the whole story",
    "an allusion points at a named character, a plain saying points at nobody",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Everything Must Go and caught five words that came from older stories. Each time, you asked who the word was named after and what that character was known for, and then you borrowed that quality and tested it in the sentence. A word like that is an allusion, and now you know how to read one.",
    "title": "Who Is It Named After?",
    "body": "You found the words that point to a myth, told what each character was known for, and explained the meaning the sentence borrowed."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Everything Must Go, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Some words in a story are borrowed from much older stories. A writer picks a word that points back to a character from a Greek or Roman myth, and the meaning of the word comes from what that character was famous for. When you meet a word like that, you spot it, you ask who it is named after and what they were known for, you borrow that famous quality, and you test it in the sentence. Here is page one of Everything Must Go, a story about a garage sale at Great-Uncle Bertram's house. Tabitha is ten, and her cousin Dorian is thirteen. Read along with me, and watch for words that seem to come from somewhere else." },
      interaction: { type: "read-along", text: "Great-Uncle Bertram had decided to sell everything in his garage, which had not been opened since before Tabitha was born, and he had asked the whole family to come and help. The drive should have taken half an hour, but a closed bridge, a wrong turn, and a flat tire turned it into an odyssey, and it was nearly noon when they finally pulled up. Bertram met them at the door with a list that ran onto a second page. \"The workbench goes first,\" he said, pointing into the garage, \"and I warn you, moving it will be a Herculean job.\" Dorian, who was thirteen and who had never carried anything heavier than a backpack, looked at the bench and then at his own arms. \"I have no idea what that means,\" he whispered to Tabitha, \"but I do not think it is good news.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-who-was-odysseus",
      purpose: "model",
      gate: "none",
      prompt: "Who was that? The story behind the word odyssey.",
      image: IMG("odyssey-ship"),
      narration: { audio: A("model-who-was-odysseus"), script: "Here is the first one. The drive turned into an odyssey. Odyssey is an odd word, and it is named after Odysseus, a king in a Greek myth. Odysseus sailed away to fight in a war, and when the war ended he set out for home. Storms blew his ship off course, a one-eyed giant trapped him in a cave, and a witch kept him on her island for a whole year, so a trip that should have taken a few weeks took ten years. That is what Odysseus was known for, a long, wandering journey home that was full of trouble. Hold on to that quality, because the next scene borrows it." },
    },
    {
      id: "model-the-move",
      purpose: "model",
      gate: "none",
      prompt: "The move, start to finish.",
      fx: {"text":"**Spot** it. **Who** is it named after? **What** were they known for? **Borrow** it. **Test** it.","effect":"pop-words"},
      narration: { audio: A("model-the-move"), script: "Now the whole move on that word. Spot it. Odyssey does not sound like the words around it, and that is the signal. Who is it named after? Odysseus. What was he known for? A long, wandering journey full of trouble. Borrow it. The drive was a long, wandering trip full of trouble. Test it in the sentence. A closed bridge, a wrong turn, and a flat tire, and they arrived at noon instead of in the morning. The borrowed meaning fits, so I keep it. That is the move, and you will run it yourself on the next word." },
    },
    {
      id: "model-name-it",
      purpose: "model",
      gate: "none",
      prompt: "allusion",
      fx: {"text":"An **allusion** points to a character from an older story","effect":"underline"},
      narration: { audio: A("model-name-it"), script: "A word that borrows its meaning from an older story has a name. It is an allusion, spelled a, l, l, u, s, i, o, n. It looks like the word illusion, but it starts with the letter a, and it is not a trick of the eye. It is a nod to a story the writer expects you to know. Plenty of sayings mean more than they say. If someone says it is raining cats and dogs, no cat is falling, but that saying points at nobody. An allusion points at a named character, and that character's fame is the meaning. Odyssey points at Odysseus. Later you will sort the two kinds apart." },
    },
    {
      id: "guided-choose-herculean-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does Bertram mean by a Herculean job?",
      narration: { audio: A("guided-choose-herculean-meaning"), script: "Your turn, with the second word from page one. Bertram warned that moving the workbench would be a Herculean job. Spot it. Herculean is named after Hercules, so here is who he was. Hercules was the strongest hero in the Greek myths. To make up for a mistake, he had to finish twelve labors that nobody believed could be done, like cleaning out a stable that held thousands of cattle in a single day, or carrying a giant wild boar home over his shoulder, and he finished every one of them. Now borrow what Hercules was known for, and test it in Bertram's sentence about the workbench. Four meanings are on your screen. Tap the one that borrows what Hercules was famous for." },
      interaction: { type: "choose", options: [{ id: "needing-enormous-strength", label: "needing enormous strength" }, { id: "happening-far-from-home", label: "happening far from home" }, { id: "done-in-secret-at-night", label: "done in secret at night" }, { id: "ending-with-a-big-reward", label: "ending with a big reward" }], correctId: "needing-enormous-strength", coachWrong: "Go back to what Hercules was known for, and ask whether moving a workbench borrows that. One meaning borrows the wrong character." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page two. Read along, and watch for two more.",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Page two. Read along with me. Two more words on this page point to a myth, and one of them is a name that sounds like a person in the story." },
      interaction: { type: "read-along", text: "By the time the workbench stood on the lawn, Dorian had discovered something about himself. Every single thing he carried out, from a rusty lamp to a box of chipped mugs, sold within minutes, and Bertram said that the boy had the Midas touch. Tabitha did not have it, because the only thing she had sold was a lawn chair, and the man who bought it had already come back for a refund. Then she found the bicycle, a red one with a chrome bell, leaning behind the paint cans, where it had waited so long that its tires had turned gray. \"That one has an Achilles heel,\" Bertram said, spinning the back wheel, which wobbled as it turned, \"so tell whoever buys it before they pay.\"", audio: A("page-2-read-sentence") },
    },
    {
      id: "guided-highlight-spot-it",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the one word that points to a myth.",
      narration: { audio: A("guided-highlight-spot-it"), script: "Spot it. Here is one sentence from page two. It holds one word that points to a character from a myth, and it also holds a name that points at nobody but a great-uncle. Read the sentence on your screen, and tap the word that points to a myth." },
      interaction: { type: "highlight", text: "Every single thing he carried out sold within minutes, and Bertram said that the boy had the Midas touch.", targets: ["Midas"], coachWrong: "That word is an everyday word, or it names someone who is in this story. Look for the name that belongs to an older story." },
    },
    {
      id: "guided-choose-midas-quality",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which quality of Midas did the writer borrow?",
      narration: { audio: A("guided-choose-midas-quality"), script: "Who is it named after? Midas was a king in a Greek myth who was granted one wish, and he wished that everything he touched would turn to gold. At first it was wonderful. Then his bread turned to gold in his hand, and his water turned to gold in the cup, and he begged to have the wish taken back. A writer borrows one quality of a character, not the whole story. Four things about Midas are on your screen, and every one of them is in his story. Only one of them is the quality the writer borrowed when Bertram said that Dorian had the Midas touch. Tap it." },
      interaction: { type: "choose", options: [{ id: "turning-things-to-gold", label: "turning things to gold" }, { id: "being-a-king-with-a-wish", label: "being a king with a wish" }, { id: "begging-to-undo-his-wish", label: "begging to undo his wish" }, { id: "having-his-bread-turn-hard", label: "having his bread turn hard" }], correctId: "turning-things-to-gold", coachWrong: "That is true of Midas, but test it on Dorian and his selling. Which part of the story do the words the Midas touch point at?" },
    },
    {
      id: "apply-sequence-achilles",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put them in order: the character, his fame, the meaning now.",
      narration: { audio: A("apply-sequence-achilles"), script: "Bertram said the bicycle had an Achilles heel. Here is Achilles. When Achilles was a baby, his mother dipped him in a magic river that made him safe from every wound, but she held him by one heel, and the water never touched it. He grew up to be the greatest fighter in the Greek army, safe everywhere except that one heel, and in the end it was that one spot that brought him down. Three tiles are on your screen. Tap them in order. First the character the phrase is named after, then what he was known for, then what the phrase means in Bertram's sentence about the bicycle." },
      interaction: { type: "sequence", items: [{ id: "character", label: "a hero named Achilles" }, { id: "known-for", label: "safe except for one heel" }, { id: "means-now", label: "the one weak spot" }], order: ["character", "known-for", "means-now"], coachWrong: "Start with who the phrase is named after, then what he was known for, and end with what the words mean about the bicycle." },
    },
    {
      id: "apply-sort-myth-or-plain",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Points to a Myth, or Plain Saying?",
      narration: { audio: A("apply-sort-myth-or-plain"), script: "Six phrases are on your screen. Three of them point to a character from a myth, and that character's fame is the meaning. Three of them are plain sayings, the kind people share, and they point at nobody at all. Read each phrase and ask whether it names a character from an older story. Drag each one to its bucket, Points to a Myth, or Plain Saying." },
      interaction: { type: "sort", buckets: ["Points to a Myth","Plain Saying"], items: [{ label: "a Herculean job", bucket: "Points to a Myth" }, { label: "cost an arm and a leg", bucket: "Plain Saying" }, { label: "the Midas touch", bucket: "Points to a Myth" }, { label: "a couch potato", bucket: "Plain Saying" }, { label: "an Achilles heel", bucket: "Points to a Myth" }, { label: "hit the nail on the head", bucket: "Plain Saying" }], coachWrong: "Ask whether the phrase names a character from an older story. A name from a myth points to a myth. No name at all means a plain saying." },
    },
    {
      id: "apply-page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the free box.",
      image: IMG("page-3"),
      narration: { audio: A("apply-page-3-read"), script: "Page three. Read along with me, and watch what Bertram calls the free box." },
      interaction: { type: "read-along", text: "Near the end of the afternoon a neighbor walked over with a large cardboard box, set it on the table, and said that it was free to anyone who wanted it. Dorian, who was still glowing from his sales, opened it at once and found a stack of old comic books that smelled like a damp basement. \"Careful,\" said Bertram, coming over to look, \"a free gift can be a Trojan horse.\" He was right, because under the comics sat a nest of mice, which had chewed the bottom pages into confetti, and the whole box had to go to the far end of the yard. Dorian carried it, since he was the one who had opened it, and he held it as far from his shirt as his arms would reach.", audio: A("apply-page-3-read-sentence") },
    },
    {
      id: "guided-choose-trojan-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does Bertram mean by a Trojan horse?",
      narration: { audio: A("guided-choose-trojan-meaning"), script: "Bertram called the free box a Trojan horse. Here is the story it points to. The Greeks had been trying to get inside the walled city of Troy for ten years and could not. So they built a giant wooden horse, hid soldiers inside it, and sailed away as if they had given up. The people of Troy pulled the horse inside their gates as a prize, and that night the soldiers climbed out and opened the gates from the inside. Now borrow the quality and test it on the box of comics. Four meanings are on your screen. Tap the one the writer borrowed." },
      interaction: { type: "choose", options: [{ id: "a-gift-with-trouble-inside", label: "a gift with trouble inside" }, { id: "a-prize-won-after-a-war", label: "a prize won after a war" }, { id: "a-horse-made-out-of-wood", label: "a horse made out of wood" }, { id: "a-box-too-heavy-to-carry", label: "a box too heavy to carry" }], correctId: "a-gift-with-trouble-inside", coachWrong: "That is a piece of the story, or a piece of the box, but not what the phrase means. Ask what the wooden horse and the free box have in common." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: By sunset the garage was empty and the cash box was full. Bertram sat in the lawn chair that nobody had wanted and looked at the bare walls for a long time. Same time next year, said Dorian, and Tabitha decided that he really did have the Midas touch.",
      narration: { audio: A("page-4-read"), script: "Page four is yours, and it is the last page. Read all three sentences out loud, and notice which allusion comes back at the very end." },
      interaction: { type: "speak", text: "By sunset the garage was empty and the cash box was full Bertram sat in the lawn chair that nobody had wanted and looked at the bare walls for a long time Same time next year said Dorian and Tabitha decided that he really did have the Midas touch" },
    },
    {
      id: "apply-choose-best-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words show the trouble hidden inside the gift?",
      narration: { audio: A("apply-choose-best-evidence"), script: "Best evidence. A Trojan horse is a gift with trouble hidden inside, and page three shows the gift plainly, a free box set on the table. Four groups of words from page three are on your screen, and all four are really on the page. Only one of them shows the hidden trouble, the part that proved Bertram right. Tap those words." },
      interaction: { type: "choose", options: [{ id: "sat-a-nest-of-mice", label: "sat a nest of mice" }, { id: "a-stack-of-old-comic-books", label: "a stack of old comic books" }, { id: "free-to-anyone-who-wanted-it", label: "free to anyone who wanted it" }, { id: "to-the-far-end-of-the-yard", label: "to the far end of the yard" }], correctId: "sat-a-nest-of-mice", coachWrong: "Those words are on the page, but they show the gift itself, or what happened after. Find the words that show what was hiding inside." },
    },
    {
      id: "challenge-speak-explain-herculean",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Explain it: Bertram calls the job Herculean because...",
      narration: { audio: A("challenge-speak-explain-herculean"), script: "Last one, and you explain an allusion out loud. On page one, Bertram says that moving the workbench will be a Herculean job. Tap the mic, then say, Bertram calls the job Herculean because, and finish the sentence with who the word points to and what that hero was known for." },
      interaction: { type: "speak", text: "hercules strong strongest strength heavy heaviest labors twelve impossible hard hardest huge difficult lift lifting lifted carry carrying carried workbench bench muscles power powerful tough enormous mighty hero effort giant" },
    },
    {
      id: "celebrate-words-from-the-myths",
      purpose: "celebrate",
      gate: "none",
      prompt: "Who is it named after? What were they known for?",
      fx: {"text":"Who is it named after? What were they **known for**?","effect":"fireworks"},
      narration: { audio: A("celebrate-words-from-the-myths"), script: "Five words in one garage sale came from older stories, and you caught every one. Odyssey, Herculean, the Midas touch, an Achilles heel, a Trojan horse. Each time you asked who the word was named after and what that character was known for, borrowed the quality, and tested it in the sentence. That is how you read an allusion. From now on, when a word in a story seems to come from somewhere else, ask who it is named after." },
    },
  ],
};
