import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-of-the-field-timings.json";

// Words of the Field (RI.4.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-of-the-field
// G4-U2. RI.4.4 = determine the meaning of general academic and domain-specific
// words in a grade 4 informational text. Sibling split honored: expert-words
// RI.3.4 (earthquakes; "expert words / school words", its supports list, its
// quiz's caves with observe / process / result / significant) owns the G3 tier,
// so those labels, that text and those school words are burned and unused;
// science-word-clues RI.2.4 (beavers), fact-word-finder RI.1.4 (camel),
// science-word-wonder RI.K.4 (butterflies) own the lower grades; context-at-a-
// distance L.4.4a owns distance clues (none taught), greek-and-latin-roots
// L.4.4b owns roots (none taught), the-right-tool L.4.4 owns the tool chooser
// (not re-taught); L.4.4c (reference materials) is later in this unit, so a
// glossary is only NAMED as one support a writer can give. THIS lesson owns the
// G4 step-up: the two-kind distinction made explicit (FIELD words belong to one
// field of study and the text usually supports them: a definition after a
// comma, an example, a labeled diagram whose label the sentence speaks, a
// glossary; EVERYWHERE words travel across every subject and the text rarely
// defines them, so the reader tests the plain version and keeps the word as a
// portable tool), the move (spot the hard word, decide its kind, use that
// kind's tool), the diagram support, the words in a sentence that show an
// everywhere word's meaning, and PRODUCING an everywhere word in a new
// sentence. ONE original informational text, "How the Ear Hears" (every fact
// true: sound is a vibration of the air, the outer flap funnels it into the ear
// canal, the eardrum is a thin tight sheet that shakes in time, a whisper moves
// it less than a hair's width, three tiny linked bones that fit on a fingertip,
// the chain transfers the shaking to an opening far smaller than the eardrum
// and squeezing it into a smaller space strengthens it, the fluid-filled
// cochlea coiled like a snail shell, hair cells with bristles that bend and
// make a burst of electricity, high sounds bend cells near the wide end and low
// sounds near the narrow tip, the auditory nerve as a bundle of thousands of
// fibers, the brain compares patterns with stored sounds, firing rate carries
// loudness, very loud sound snaps bristles that do not grow back, the ear never
// rests), 24 sentences over 6 child-read pages in real paragraphs under THREE
// SPOKEN HEADINGS (Catching a Sound / A Chain and a Coil / A Message for the
// Brain), dense read-alongs 1/3/5 of five complex sentences each with images,
// accept-mode speaks 2/4/6 (no " my " token), relative pronouns which / that /
// who, no digits, no contractions, no real person named. PLANTED field words
// with their support: vibration (definition after a comma, p1), eardrum
// (definition after a comma, p1), cochlea (the picture, its label spoken by
// the sentence, p3), hair cells (definition in a which-clause, p3), auditory
// nerve (definition after a comma, p5), frequency (example: whistle vs bass
// drum, p5). PLANTED everywhere words, none defined by the text: function
// (p1), transfer (p3), analyzes (p5), indicate (p5), factor (p5). ANCHOR
// FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: eardrum, cochlea,
// vibration, hair cell, auditory, nerve, inner ear, frequency, analyze,
// transfer, function, indicate, factor, termite, mound, fungus, colony 0 hits
// in child-facing strings (pitch, process, significant, structure, solution,
// current, pressure, force, energy, signal word found carried and avoided as
// targets). Keys prefixed quiz- are picture supports for the quiz's all-fresh
// termite-mound text.

const A = (id: string) => `/audio/lessons-v2/words-of-the-field/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-of-the-field/${w.toLowerCase()}.png`;

export const wordsOfTheFieldImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A ten year old girl with dark curly hair in a yellow shirt seen in profile from the side, cupping one hand behind her ear and leaning toward a small pond in a sunny park, rings of ripples spreading across the pond from a dropped pebble, on the far bank a boy in a green shirt tapping a small hand drum, green grass, a few trees, blue sky, no writing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no arrows, no writing anywhere.",
  "page-3": "A clean simple cutaway diagram of a human ear with no labels at all, shown on a plain cream background: on the left the curved outer ear flap in a warm peach skin tone, leading into a short straight tunnel, at the end of the tunnel a thin round pale membrane stretched across the tunnel like a drum skin, behind the membrane a small air filled room holding THREE separate tiny white bones lined up in a row and touching end to end like three links of a chain, exactly three bones, no more and no fewer, and on the right a smooth pale blue tube coiled tightly into a spiral shaped exactly like a snail shell, the parts drawn large and soft with rounded shapes, nothing else in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no arrows, no lines pointing at parts, no writing anywhere.",
  "page-5": { subject: "The same ten year old girl with dark curly hair in a yellow shirt walking along a quiet forest path in dappled sunlight, turning her head to look back over her shoulder, a snapped dry twig lying on the path behind her, a realistic brown deer with no smile standing half hidden among the ferns and tree trunks behind her, tall trees, no writing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.", ref: "page-1" },
  "quiz-mound": "A tall rust red termite mound with rounded ridges and several chimney like spires rising from dry golden savanna grass under a wide blue sky, the mound taller than the small acacia tree beside it, dusty ground, a few scattered stones, no animals, no people, no writing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.",
  "quiz-mound-cutaway": { subject: "The same tall rust red termite mound sliced open down the middle to show the inside: a maze of narrow winding tunnels running up through the earth walls to open chimney holes at the top, and low down near the ground a cluster of rounded chambers holding pale gray spongy comb shaped like honeycomb, a few thin tunnels leading out to the sides, dry golden grass outside, no insects visible, no people, no writing. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no arrows, no writing anywhere.", ref: "quiz-mound" },
};

export const wordsOfTheField: LessonDef = {
  id: "words-of-the-field",
  title: "Words of the Field",
  grade: "4th Grade",
  standard: "RI.4.4",
  archetype: "vocabulary",
  objective: "I can sort a hard word in a fact text into its kind, a field word or an everywhere word, and use that kind's tool to get its meaning.",
  concepts: [
    "a fact text carries two kinds of hard words, and each kind has its own tool",
    "a field word belongs to one field of study, and the writer usually supports it with a definition after a comma, an example, a labeled diagram, or a glossary",
    "an everywhere word travels across every subject, and the writer rarely stops to explain it",
    "for a field word, find the support the writer gives",
    "for an everywhere word, test the plain version you know in the sentence and keep the word for next time",
    "the words around an everywhere word can show its meaning",
    "an everywhere word is a tool you can use in a new sentence about anything",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You finished How the Ear Hears and sorted every hard word by its kind before you solved it. Field words got the support the writer gave, and everywhere words got the plain version you carry with you. That is how fourth grade readers read facts.",
    "title": "Two Kinds, Two Tools",
    "body": "You told field words from everywhere words, found the support the text gives, and put an everywhere word to work in a sentence of your own."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "How the Ear Hears, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. A fact text carries two kinds of hard words, and this lesson teaches you to tell them apart, because each kind has its own tool. A field word belongs to one field of study, the way a doctor owns some words and a sailor owns others, and a fact writer usually helps you with it, since the writer knows you may never have met it. An everywhere word travels across every subject, from science to history to math, and a writer almost never stops to explain it, so you learn it once and carry it with you. Here is page one of How the Ear Hears, under its first heading, Catching a Sound. Read along with me, and notice which hard words the writer stops to explain." },
      interaction: { type: "read-along", text: "Every sound you have ever heard began as a vibration, a quick back and forth shaking of the air, which spreads out from a plucked string or a slammed door the way ripples spread across a pond. The flap on the side of your head, which is the only part of the ear anyone can see, has one function, and that function is to gather the ripples and steer them into a short tunnel called the ear canal. At the far end of the canal the moving air presses against the eardrum, a thin sheet of skin stretched as tight as the top of a drum, and the eardrum begins to shake in time with the sound. A whisper moves it by less than the width of a hair, yet that tiny motion is enough to begin the work of the ear. A hand cupped behind the ear makes a faint voice easier to hear, because the hand widens the funnel and gathers more of the shaking air.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-two-kinds",
      purpose: "model",
      gate: "none",
      prompt: "Which kind? Then which tool?",
      fx: {"text":"Which **kind**? Then which **tool**?","effect":"pop-words"},
      narration: { audio: A("model-two-kinds"), script: "Watch me on two hard words from page one. The first is vibration. Vibration belongs to the field of sound, so it is a field word, and a field word sends me hunting for the support the writer gives. Right after the word sits a comma, and after the comma the writer tells me what it is, a quick back and forth shaking of the air. That is a definition after a comma, and the field word is handled. The second word is function. Function is not about ears at all. It turns up in science, in math, in history, in any book you open, so it is an everywhere word, and no comma comes to the rescue. For an everywhere word I try the plain version I already know, which is job. The flap has one job, and that job is to gather the ripples. The plain version fits, so I keep function in my pocket, because I will meet it again next week in a different subject. Two words, two kinds, two tools." },
    },
    {
      id: "guided-choose-kind-eardrum",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page one used the word eardrum. Which kind of word is it?",
      narration: { audio: A("guided-choose-kind-eardrum"), script: "Your turn to sort a word by its kind. Page one used the word eardrum. Think about where that word lives. Does it belong to one field of study, or does it travel into every subject, or is it something else altogether? Tap the kind that eardrum belongs to." },
      interaction: { type: "choose", options: [{ id: "a-field-word", label: "a field word" }, { id: "an-everywhere-word", label: "an everywhere word" }, { id: "the-name-of-a-person", label: "the name of a person" }, { id: "a-rhyming-word", label: "a rhyming word" }], correctId: "a-field-word", coachWrong: "Ask which subjects would ever use the word eardrum. A math book? A history book? Or only a text about the ear and sound?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Behind the eardrum sits a small room filled with air, and inside it hang the three tiniest bones in the body. They are linked in a chain, so when the eardrum shakes, the first bone shakes, then the second, then the third. All three together would fit on a fingertip.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, still under Catching a Sound. Read all three sentences out loud, and hold on to how the three bones are joined." },
      interaction: { type: "speak", text: "Behind the eardrum sits a small room filled with air and inside it hang the three tiniest bones in the body They are linked in a chain so when the eardrum shakes the first bone shakes then the second then the third All three together would fit on a fingertip" },
    },
    {
      id: "guided-choose-support-eardrum",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does page one support the word eardrum? Tap the support.",
      narration: { audio: A("guided-choose-support-eardrum"), script: "A field word sends you to the support the writer gives. Four pieces of page one are on your screen, and all four are really on the page. One of them is the support for eardrum, the part that tells you what an eardrum is. Another only uses the word without explaining it, another explains something else, and another has nothing to do with it. Tap the support for eardrum." },
      interaction: { type: "choose", options: [{ id: "a-thin-sheet-of-skin", label: "a thin sheet of skin" }, { id: "the-eardrum-begins-to-shake", label: "the eardrum begins to shake" }, { id: "a-hand-cupped-behind-the-ear", label: "a hand cupped behind the ear" }, { id: "ripples-spread-across-a-pond", label: "ripples spread across a pond" }], correctId: "a-thin-sheet-of-skin", coachWrong: "That piece is on the page, but does it tell you what an eardrum is? Look for the words that came right after the comma." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the picture.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three opens a new heading, A Chain and a Coil, and it comes with a picture of the ear cut open from the outside in. Read along with me, and notice that one sentence points at the picture to explain a field word." },
      interaction: { type: "read-along", text: "The chain has a task that no single bone could manage, which is to transfer the shaking from the wide eardrum to an opening no bigger than a grain of rice, and squeezing the same push into a smaller space makes it stronger. In the picture on this page, the tube coiled like a snail shell is the cochlea, and the strengthened shaking passes through that small opening into it. The cochlea is filled with fluid, and lining its coil are thousands of hair cells, which are not hairs at all but living cells topped with bristles finer than any hair on your head. When the fluid moves, the bristles bend, and a bending bristle does something a hair could never do, because it turns the motion into a tiny burst of electricity. The whole trip from the eardrum to that burst takes less time than a blink.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-kind-transfer",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page three used the word transfer. Which kind of word is it?",
      narration: { audio: A("guided-choose-kind-transfer"), script: "Page three used the word transfer, in the sentence about what the chain of bones does. Ask where that word lives, in one field of study, or in every subject you have ever had, or somewhere else. Tap the kind that transfer belongs to." },
      interaction: { type: "choose", options: [{ id: "a-field-word", label: "a field word" }, { id: "an-everywhere-word", label: "an everywhere word" }, { id: "the-name-of-a-person", label: "the name of a person" }, { id: "a-rhyming-word", label: "a rhyming word" }], correctId: "an-everywhere-word", coachWrong: "Think of other places you have met transfer. A bus transfer, a student transferring to a new school, heat transferring from a pan to a hand. Does the word stay in one field?" },
    },
    {
      id: "guided-choose-diagram-cochlea",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which part of the picture is the cochlea?",
      image: IMG("page-3"),
      narration: { audio: A("guided-choose-diagram-cochlea"), script: "Page three explained cochlea by pointing at the picture, which is another support a fact writer can give, a diagram with its parts named. This picture has no words on it, so the sentence did the naming for you. Look at the picture from the flap on the outside to the deepest part inside, find the part the sentence described, and tap its name." },
      interaction: { type: "choose", options: [{ id: "the-coiled-tube", label: "the coiled tube" }, { id: "the-outer-flap", label: "the outer flap" }, { id: "the-chain-of-bones", label: "the chain of bones" }, { id: "the-tight-thin-sheet", label: "the tight thin sheet" }], correctId: "the-coiled-tube", coachWrong: "Go back to the sentence that pointed at the picture. What shape did it say the cochlea has?" },
    },
    {
      id: "guided-sequence-the-move",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the three steps of the move into order.",
      narration: { audio: A("guided-sequence-the-move"), script: "The move has three steps, and the tiles on your screen have them out of order. Think about what you do first when a hard word stops you, what you decide next, and what you reach for last. Drag the steps into the order you used on page one." },
      interaction: { type: "sequence", items: [{ id: "spot", label: "spot the hard word" }, { id: "kind", label: "decide its kind" }, { id: "tool", label: "use the tool for that kind" }], order: ["spot","kind","tool"], coachWrong: "You cannot pick a tool before you know the kind, and you cannot know the kind before you have found the word." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Not every hair cell answers every sound. A whistle bends the cells near the wide end of the coil, while the rumble of a truck bends cells far inside, near the narrow tip. The place where the bending happens tells the brain how high or low the sound is.",
      narration: { audio: A("page-4-read"), script: "Page four is yours, still under A Chain and a Coil. Read all three sentences out loud, and hold on to which cells a whistle bends." },
      interaction: { type: "speak", text: "Not every hair cell answers every sound A whistle bends the cells near the wide end of the coil while the rumble of a truck bends cells far inside near the narrow tip The place where the bending happens tells the brain how high or low the sound is" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and count the everywhere words.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five opens the last heading, A Message for the Brain. Read along with me, and count the everywhere words as they pass, because this page carries more of them than any other." },
      interaction: { type: "read-along", text: "Each burst of electricity travels along the auditory nerve, a bundle of many thousands of fibers that runs from the cochlea to the brain like a rope made of threads. The pattern of bursts carries everything the brain needs, including the frequency of the sound, so that a whistle, which shakes the air very fast, and a bass drum, which shakes it slowly, arrive as two different patterns. The brain analyzes each pattern in a fraction of a second, comparing it with every sound it has stored, which is how you know a familiar voice before you turn around. A change in the pattern can indicate that something nearby has changed, so a twig snapping behind you is a sign to look back. One factor decides how loud a sound seems, and that factor is how hard the fluid moves the bristles, since a strong push sends more bursts than a gentle one.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-plain-analyze",
      purpose: "apply",
      gate: "interaction",
      prompt: "The brain analyzes each pattern. Tap the plain version of analyze.",
      narration: { audio: A("apply-choose-plain-analyze"), script: "Page five said the brain analyzes each pattern. Analyze is an everywhere word, and the writer does not stop to explain it, so the tool is the plain version. Four plain versions are on your screen. Test each one in the sentence, the brain does this to each pattern in a fraction of a second, comparing it with every sound it has stored. Tap the plain version that fits." },
      interaction: { type: "choose", options: [{ id: "study-it-part-by-part", label: "study it part by part" }, { id: "make-it-louder", label: "make it louder" }, { id: "send-it-back-out", label: "send it back out" }, { id: "forget-it-right-away", label: "forget it right away" }], correctId: "study-it-part-by-part", coachWrong: "Put your choice into the sentence. The brain does that to each pattern, comparing it with every sound it has stored. Does comparing sound like your choice?" },
    },
    {
      id: "apply-sort-two-kinds",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Field Word, or Everywhere Word?",
      narration: { audio: A("apply-sort-two-kinds"), script: "Six hard words from the text are on your screen, and each belongs to one of the two kinds. If a word belongs to the field of the ear and sound, and you would hunt for the support the writer gave, drag it to Field Word. If the word could show up in any subject, and you would reach for the plain version you know, drag it to the other bucket, Everywhere Word." },
      interaction: { type: "sort", buckets: ["Field Word","Everywhere Word"], items: [{ label: "vibration", bucket: "Field Word" }, { label: "function", bucket: "Everywhere Word" }, { label: "cochlea", bucket: "Field Word" }, { label: "transfer", bucket: "Everywhere Word" }, { label: "eardrum", bucket: "Field Word" }, { label: "analyze", bucket: "Everywhere Word" }], coachWrong: "Ask which subjects would use that word. Only a text about the ear and sound, or any book at all?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: A very loud sound can harm the ear, because a strong enough push can snap the bristles, and a snapped bristle does not grow back. That is why people who work near roaring engines wear covers over their ears. The ear never rests, even during sleep, which is why an alarm can wake you.",
      narration: { audio: A("page-6-read"), script: "Page six is yours, the last page. Read all three sentences out loud, and hold on to what a very loud sound can do." },
      interaction: { type: "speak", text: "A very loud sound can harm the ear because a strong enough push can snap the bristles and a snapped bristle does not grow back That is why people who work near roaring engines wear covers over their ears The ear never rests even during sleep which is why an alarm can wake you" },
    },
    {
      id: "apply-choose-evidence-indicate",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words in the sentence show what indicate means?",
      narration: { audio: A("apply-choose-evidence-indicate"), script: "Page five used the word indicate, and nobody explained it, because it is an everywhere word. But the sentence around it shows its meaning if you look. Four pieces of that sentence are on your screen, and all four are really there. Only one of them shows what indicate means, so tap that one. Here is the sentence. A change in the pattern can indicate that something nearby has changed, so a twig snapping behind you is a sign to look back." },
      interaction: { type: "choose", options: [{ id: "is-a-sign-to-look-back", label: "is a sign to look back" }, { id: "a-twig-snapping-behind-you", label: "a twig snapping behind you" }, { id: "a-change-in-the-pattern", label: "a change in the pattern" }, { id: "something-nearby-has-changed", label: "something nearby has changed" }], correctId: "is-a-sign-to-look-back", coachWrong: "Those words are in the sentence, but they name a thing, not what indicate does. Which words tell you what a change in the pattern is to the brain?" },
    },
    {
      id: "challenge-speak-new-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Use transfer or function in a new sentence about anything else. Then say what it means.",
      narration: { audio: A("challenge-speak-new-sentence"), script: "Last one, and it is all yours. Everywhere words are worth keeping, because you will meet them again in another subject next week. Tap the mic. Use transfer or function in a brand new sentence about anything but ears, and then say in plain words what the word means." },
      interaction: { type: "speak", text: "transfer transfers transferred transferring function functions functioned job jobs purpose purposes move moves moved moving carry carries carried carrying pass passes passed role work works" },
    },
    {
      id: "celebrate-words-of-the-field",
      purpose: "celebrate",
      gate: "none",
      prompt: "Which kind? Then which tool?",
      fx: {"text":"Which kind? Then which **tool**?","effect":"fireworks"},
      narration: { audio: A("celebrate-words-of-the-field"), script: "Today every hard word got sorted before it got solved. A field word belongs to one field of study, so you hunted for the support the writer gave, a definition after a comma, an example, or a part of the picture. An everywhere word travels into every subject, so you tested the plain version you knew and kept the word for next time. Your teacher may call them domain words and academic words. Same two kinds, same two tools. Which kind, then which tool." },
    },
  ],
};
