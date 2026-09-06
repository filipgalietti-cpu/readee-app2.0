import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./context-at-a-distance-timings.json";

// Context at a Distance (L.4.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=context-at-a-distance
// G4-U1 word-work lesson. THE CLUE LIVES SOMEWHERE ELSE tier of L.4.4a
// (sibling split: read-around-the-word L.3.4a (Sofia, Felix, Uncle Amos, the
// fire lookout; summit / gear / reluctant / trudged / parched / provisions /
// torrent / cautious / elated) owns SENTENCE-level clues and its clue-kind
// names Tells It Straight / Gives an Example / Says the Opposite / The Whole
// Sentence, none of which is used here; its quiz's harder band previewed "the
// clue waits in the next sentence" on ramshackle / bland / came to a halt /
// treacherous, all burned; three-word-tools L.3.4 (the blackout: rummaged,
// unhurried, delighted, dwindled, restored) owns choosing a tool; expert-words
// RI.3.4 (earthquakes) owns expert vs school words; check-the-dictionary L.3.4d
// (the clay studio) owns the dictionary; facts-say-so-i-know RI.4.1 (mangroves)
// owns evidence-to-inference). THIS lesson owns the G4 step-up: the clue is
// often NOT in the word's sentence. A DEFINITION arrives one sentence later
// (vigil, coax, linger), a RESTATEMENT opens the next paragraph (frigid, "in
// other words" at the top of page two), an EXAMPLE takes a whole sentence of
// its own (drafty, meager), a CONTRAST sits after the signal instead (bleak),
// and TWO PIECES in different sentences must be combined (feeble, abundant).
// The move: read around the word, then read FURTHER, name the clue kind and
// WHERE it lives, test the meaning. Plus the near-miss: a sentence that only
// MENTIONS the word (Casper already using the word frigid, keep the vigil
// going, feeble is an insult) and tells nothing. ONE original story, "The
// Comet Night": Bridget (ten) and her cousin Casper (thirteen) go up to the
// hilltop observatory where Uncle Konrad volunteers, on the night a comet is
// at its brightest. Every fact true: a comet grows brighter for weeks, its
// tail always points away from the sun, observatories sit on hills away from
// town lights, an old dome is turned by hand and has a slit, red flashlights
// protect night vision, a faint object fades when you look straight at it and
// returns with averted vision, frost forms on metal on a clear cold night.
// Three dense read-alongs of 6-7 sentences (pages one, three, four, ref-chained
// images) + one accept-mode child-read page (page two, 52 tokens, no " my "),
// complex sentences with relative pronouns (who had looked through the big
// telescope once before, which always points away from the sun), perfect
// tenses, one action-beat dialogue line, no digits, no contractions in child-
// read text. ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2
// file: observatory, eyepiece, night vision, red flashlight, stargazing,
// astronomer, constellation, moonless, Bridget, Konrad, Casper, vigil, drafty,
// feeble, coax, meager, bleak, abundant, linger, frigid, tottering all 0 hits
// (comet only as the Captain Comet mascot name in sentence-shapes, telescope
// only as a root-word tile and a picture prop, dome only inside image prose,
// a planetarium visit sits in what-the-picture-adds so this night is OUTSIDE
// at a telescope with a comet, never a star show). Maple sugaring was the
// first pick and is BURNED by chains-and-steps (From Tree to Syrup); a
// lambing barn was the second pick and sits too close to the-whole-story's
// sheep farm, so both were dropped. Keys prefixed quiz- are picture supports
// for the quiz's all-fresh blacksmith fact text (forge, bellows, anvil, tongs,
// horseshoe all 0 hits).

const A = (id: string) => `/audio/lessons-v2/context-at-a-distance/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/context-at-a-distance/${w.toLowerCase()}.png`;

export const contextAtADistanceImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A hilltop at dusk with a small white observatory building topped by a round white dome whose narrow slit is open, a gravel road bending up the slope toward it, a ten year old girl with light brown skin and two dark braids under a red knit hat wearing a blue puffy jacket and a thirteen year old boy with pale skin and short blond hair in a green jacket with a backpack, both seen from BEHIND walking up the last bend of the road, a tall man in a long gray wool coat and an orange knit hat standing side-on in the open doorway of the observatory holding the door with one hand, dark pine trees on both sides, a deep blue sky with the first stars and a faint pale comet with a short tail low in the sky, no moon anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, wide scene, no moon, no faces on anything, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "THREE people inside the same round observatory dome at night lit only by dim red light, a large white telescope tube on a heavy mount pointing up through the open slit where a strip of dark starry sky shows a faint gray smudge, the same ten year old girl with light brown skin, two dark braids, a red knit hat, and a blue puffy jacket standing on a wooden step stool with one eye pressed to the eyepiece at the side of the telescope, her face turned toward the telescope, the same tall man in a long gray wool coat and an orange knit hat seen side-on pushing his shoulder against a big metal wheel on the curved wall with both hands busy, and the same thirteen year old boy with pale skin, short blond hair, and a green jacket standing beside the step stool and holding a small red flashlight pointed at the floor, the girl has EMPTY hands, all three people clearly visible, a desk with loose papers. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no moon, no faces on anything, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-4": { subject: "The same hilltop after midnight, the same white observatory with its dome now closed behind, a low metal railing along the edge of the slope covered in sparkling white frost that catches the starlight, the whole grassy slope glittering white, a huge deep blue sky crowded with thousands of tiny stars and one bright comet high above the pine trees with a long pale tail streaming to one side, the same ten year old girl with two dark braids, a red knit hat, and a blue puffy jacket and the same thirteen year old boy with short blond hair and a green jacket both seen from BEHIND leaning on the railing and looking up at the comet, no moon anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, wide scene, no moon, no faces on anything, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-forge-fire": "A dim old stone workshop with a low brick forge hearth in the middle, a bed of glowing orange coals with a straight iron bar lying in the coals glowing bright yellow at one end, a large leather bellows with wooden handles resting beside the hearth, plain iron tools hanging on the dark wall, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces on anything, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-bellows": { subject: "A close view of two bare hands gripping the wooden handles of a large leather bellows and squeezing it, its metal nozzle pointed at a bed of coals that flare bright orange with small sparks rising, the low brick forge hearth from the same dim stone workshop, only the hands and forearms of the person visible. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-forge-fire" },
  "quiz-anvil-tongs": { subject: "A close view of a heavy black iron anvil on a thick wooden stump in the same dim stone workshop, a bar of glowing orange iron held flat on top of the anvil by long iron tongs in one gloved hand while the other gloved hand brings a hammer down onto it, a few sparks flying, only the arms and gloved hands of the person visible, the forge glowing in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-forge-fire" }
};

export const contextAtADistance: LessonDef = {
  id: "context-at-a-distance",
  title: "Context at a Distance",
  grade: "4th Grade",
  standard: "L.4.4a",
  archetype: "vocabulary",
  objective: "I can find the clue for a new word even when it lives a sentence or a paragraph away, name its kind and its place, and test the meaning.",
  concepts: [
    "read around the word, then read further, and the clue is often not in the word's own sentence",
    "a definition can arrive one sentence later",
    "a restatement can open the next paragraph, often after the words in other words",
    "an example can take a whole sentence of its own, and a contrast can follow a signal like instead",
    "two half clues in different sentences are combined into one meaning",
    "a sentence that only mentions the word is not a clue, and a reader can say where the real clue lives",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Comet Night, and not one of its new words gave up its meaning inside its own sentence. You read further, found the definition, the restatement, the example, the contrast, and the two pieces, and you walked past the sentences that only mentioned the word. That is how fourth grade readers unlock words.",
    "title": "Read Further",
    "body": "You found the clue for every new word, even when it lived a sentence or a page away, and you named its kind and its place."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Comet Night, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In fourth grade, the clue to a new word is often not sitting in the same sentence as the word. A definition may arrive one sentence later. A restatement, the same idea said again in other words, may open the next paragraph. An example may take a whole sentence of its own. A contrast may follow a signal like instead. So the move grows by one step. Read around the word, then read further, collect the clue, and test the meaning. Here is page one of The Comet Night, and each page of this story is one paragraph. Read along with me, and notice which words you cannot unlock from their own sentence." },
      interaction: { type: "read-along", text: "Because a comet had been growing brighter for a month, Bridget's uncle Konrad was keeping a vigil at the observatory on the hill. A vigil is a long watch, a stretch of hours when a person stays awake so that nothing worth seeing slips past. Bridget and her cousin Casper, who had looked through the big telescope once before and would not stop saying so, walked up the last bend of the road at dusk, and Casper was already using the word frigid to sound like a weather report. Nights on the hill were still frigid, Konrad warned them at the door. The dome was drafty. Wind slid through the slit in its roof and stirred the papers on the desk beneath it.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-read-further",
      purpose: "model",
      gate: "none",
      prompt: "Read around the word. Then read further.",
      fx: {"text":"Read **around** it. Then read **further**.","effect":"pop-words"},
      narration: { audio: A("model-read-further"), script: "Vigil might have stopped you. Watch the move. First I read around the word, the words on either side of it. Konrad was keeping a vigil at the observatory on the hill. That tells me where, and it tells me nothing about what a vigil is. So I read further, into the next sentence. A vigil is a long watch, a stretch of hours when a person stays awake so that nothing worth seeing slips past. There it is. That clue is a definition, and it lives in the next sentence, one sentence away from the word. Now I test it. Konrad was keeping a long watch at the observatory. It fits. Every time a word stops you, do those four things. Read around it. Read further. Name the clue and where it sits. Test the meaning." },
    },
    {
      id: "guided-choose-drafty-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does drafty mean here?",
      narration: { audio: A("guided-choose-drafty-meaning"), script: "Your turn, and this clue is not a definition. Read around the word first. The dome was drafty. That sentence gives you nothing. So read further. Wind slid through the slit in its roof and stirred the papers on the desk beneath it. That whole next sentence is an example of the dome being drafty. Test each meaning against it, and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "letting-cold-air-blow-in", label: "letting cold air blow in" }, { id: "keeping-the-warm-air-inside", label: "keeping the warm air inside" }, { id: "dark-from-wall-to-wall", label: "dark from wall to wall" }, { id: "too-small-for-the-telescope", label: "too small for the telescope" }], correctId: "letting-cold-air-blow-in", coachWrong: "Test that meaning against the example sentence about the slit and the papers. Which meaning would make the papers move?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: In other words, the cold up here was sharp enough to bite through two coats. That was why a heater hummed in the corner of the dome. Bridget was told to keep her red flashlight low and her voice lower. Casper said he would keep the vigil going, and then he forgot.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all four sentences out loud, and notice what the first sentence is doing for a word from page one." },
      interaction: { type: "speak", text: "In other words the cold up here was sharp enough to bite through two coats That was why a heater hummed in the corner of the dome Bridget was told to keep her red flashlight low and her voice lower Casper said he would keep the vigil going and then he forgot" },
    },
    {
      id: "guided-choose-frigid-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does the clue for frigid live?",
      narration: { audio: A("guided-choose-frigid-where"), script: "Frigid is the word, and here is its sentence again. Nights on the hill were still frigid, Konrad warned them at the door. That sentence tells you who and when, and nothing about what frigid means. Casper using the word on the way up tells you nothing either. The real clue lives somewhere else, and you have already read it out loud. A fourth grade reader can say where a clue lives, not only what it says. Four places are on your screen. Tap the place where the clue for frigid lives." },
      interaction: { type: "choose", options: [{ id: "in-the-same-sentence", label: "in the same sentence" }, { id: "in-the-next-sentence", label: "in the next sentence" }, { id: "in-the-next-paragraph", label: "in the next paragraph" }, { id: "in-an-example-sentence", label: "in an example sentence" }], correctId: "in-the-next-paragraph", coachWrong: "Not there. Think about the words in other words, and think about which page you read them on." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the comet.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and count how many new words try to stop you." },
      interaction: { type: "read-along", text: "The old dome had to be turned by hand, so Konrad leaned his shoulder into the wheel and began to coax it around toward the west. To coax is to get something to move with patience and steady pushes, never with force. Low over the trees, the comet was feeble, and Bridget could barely tell it from the haze. \"Feeble is an insult to anything that has traveled this far,\" Casper said, and Konrad, without turning around, told him to hold the flashlight steady. Her first look through the eyepiece was meager. The comet filled less of the circle than one crumb would fill a plate. Whenever she looked straight at it, it faded, and it came back only when she looked a little to one side.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-meager-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does meager mean here?",
      narration: { audio: A("guided-choose-meager-meaning"), script: "The word is meager. Read around it. Her first look through the eyepiece was meager. Nothing there. Read further. The comet filled less of the circle than one crumb would fill a plate. A whole sentence, and it is an example of what a meager look is like. Test the four meanings against it, and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "small-not-nearly-enough", label: "small, not nearly enough" }, { id: "fast-gone-in-a-blink", label: "fast, gone in a blink" }, { id: "bright-hard-to-look-at", label: "bright, hard to look at" }, { id: "clear-sharp-all-over", label: "clear, sharp all over" }], correctId: "small-not-nearly-enough", coachWrong: "Test that meaning against the example sentence, the crumb and the plate. Does one crumb on a plate match the meaning you picked?" },
    },
    {
      id: "guided-choose-coax-clue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words are the clue for coax?",
      narration: { audio: A("guided-choose-coax-clue"), script: "You can find the meaning, and now find the clue itself. Konrad began to coax the dome around toward the west. Coax means to get something moving gently, a little at a time. Four groups of words from page three are on your screen. Only one of them is the clue that tells you that. Tap the clue." },
      interaction: { type: "choose", options: [{ id: "patience-and-steady-pushes", label: "patience and steady pushes" }, { id: "toward-the-west", label: "toward the west" }, { id: "hold-the-flashlight-steady", label: "hold the flashlight steady" }, { id: "a-little-to-one-side", label: "a little to one side" }], correctId: "patience-and-steady-pushes", coachWrong: "Those words are on the page, and they do not tell you how the dome was moved. Find the words that tell you how." },
    },
    {
      id: "model-clue-or-mention",
      purpose: "model",
      gate: "none",
      prompt: "A clue tells the meaning. A mention only uses the word.",
      fx: {"text":"A **clue** tells. A **mention** only uses the word.","effect":"underline"},
      narration: { audio: A("model-clue-or-mention"), script: "Two more things a fourth grade reader watches for. First, some sentences near a word only mention it. Suppose a page said, Casper wrote the word vigil on the back of his hand. That sentence uses the word, and it tells you nothing about what a vigil is. It is a mention, not a clue, and you walk past it. Second, a clue can come in two pieces that live in different sentences. On page three, Bridget could barely tell the comet from the haze. That is one piece. Three sentences later, whenever she looked straight at it, it faded. That is the other piece. Put them together, barely visible and fading, and feeble means weak and faint. One kind of sentence to walk past, and two pieces to combine. Page two had one more thing. In other words, at the top of the page, was a restatement, the idea of frigid said again in plain words." },
    },
    {
      id: "apply-sort-clue-or-mention",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Clue, or Just Mentions It?",
      narration: { audio: A("apply-sort-clue-or-mention"), script: "Six groups of words from the first three pages are on your screen, and every one of them sits near a new word. Read each one. If it tells you what the word means, drag it to Clue. If it only uses the word, or only sits near it, and tells you nothing about the meaning, drag it to the other bucket, Just Mentions It." },
      interaction: { type: "sort", buckets: ["Clue","Just Mentions It"], items: [{ label: "a vigil is a long watch", bucket: "Clue" }, { label: "using the word frigid", bucket: "Just Mentions It" }, { label: "wind slid through the slit", bucket: "Clue" }, { label: "keep the vigil going", bucket: "Just Mentions It" }, { label: "bite through two coats", bucket: "Clue" }, { label: "feeble is an insult", bucket: "Just Mentions It" }], coachWrong: "Ask one question about that card. Does it tell you what the word means, or does it only use the word? Only a card that tells the meaning is a clue." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page four. Read along, and watch the sky.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Page four, after midnight. Read along with me, and run the whole move on every word that stops you." },
      interaction: { type: "read-along", text: "Bridget had expected the hill after midnight to be bleak. Instead, frost on the railing caught the light of the stars, and the whole slope looked dusted with sugar. Away from the lights of the town, the stars were abundant, and Bridget could not find one patch of sky without them. Casper started counting them out loud and lost his place before the first hundred. The comet had climbed clear of the trees, and its tail, which always points away from the sun, stretched longer than her thumb held at arm's length. Even after the dome was shut, the cold lingered in the metal of the railing, and Konrad said that it would still be there at breakfast. To linger is to stay on after everything else has moved along.", audio: A("page-4-read-sentence") },
    },
    {
      id: "apply-choose-two-pieces",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which two pieces together tell you what abundant means?",
      narration: { audio: A("apply-choose-two-pieces"), script: "The word is abundant. The stars were abundant. Read around it and you get where, away from the lights of the town, and nothing more. This clue comes in two pieces, and they live in different sentences. Four pairs of words from page four are on your screen. Only one pair puts the two pieces together. Tap the pair that gives you the meaning of abundant." },
      interaction: { type: "choose", options: [{ id: "no-empty-patch-lost-count", label: "no empty patch, lost count" }, { id: "bleak-hill-frost-like-sugar", label: "bleak hill, frost like sugar" }, { id: "clear-of-trees-a-long-tail", label: "clear of trees, a long tail" }, { id: "cold-railing-breakfast", label: "cold railing, breakfast" }], correctId: "no-empty-patch-lost-count", coachWrong: "Those two pieces are on the page, and they are about something else. Find the pair where both pieces are about the stars." },
    },
    {
      id: "apply-choose-bleak-kind",
      purpose: "apply",
      gate: "interaction",
      prompt: "What kind of clue unlocked bleak?",
      narration: { audio: A("apply-choose-bleak-kind"), script: "The word is bleak. Bridget had expected the hill after midnight to be bleak. Instead, frost on the railing caught the light of the stars, and the whole slope looked dusted with sugar. Bleak means bare and gloomy, and you can tell that from the second sentence. Now name the kind of clue it is. Read the two sentences again, find the signal word at the start of the second one, and tap the kind of clue that signal gives you." },
      interaction: { type: "choose", options: [{ id: "a-definition", label: "a definition" }, { id: "an-example", label: "an example" }, { id: "a-restatement", label: "a restatement" }, { id: "a-contrast", label: "a contrast" }], correctId: "a-contrast", coachWrong: "Look at the very first word of the second sentence. Does that word tell the meaning, show an example, say the idea again, or point the other way from what she expected?" },
    },
    {
      id: "challenge-speak-linger",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does linger mean, and where does its clue live? Say both.",
      narration: { audio: A("challenge-speak-linger"), script: "Last one, and you say the whole move out loud. The word is linger. The cold lingered in the metal of the railing. Tap the mic. Say what linger means, and then say where its clue lives, the way a fourth grade reader would." },
      interaction: { type: "speak", text: "stay stays stayed staying remain remains remained keep keeps kept hang hangs hanging around last lasts lasting after later longer still gone moved along next sentence following definition defines tells below" },
    },
    {
      id: "celebrate-context-at-a-distance",
      purpose: "celebrate",
      gate: "none",
      prompt: "Read around it. Then read further.",
      fx: {"text":"Read around it. Then **read further**.","effect":"fireworks"},
      narration: { audio: A("celebrate-context-at-a-distance"), script: "Today the clues stopped waiting inside the sentence, and you went and got them. A definition one sentence later. A restatement at the top of the next page. An example that took a whole sentence. A contrast after the word instead. Two pieces that only worked together. And you learned to walk past a sentence that only mentions the word. Vigil, drafty, frigid, coax, feeble, meager, bleak, abundant, linger. Nine words, and you can say what each one means and where its clue lives. From now on, when a word stops you, read around it, and then read further." },
    },
  ],
};
