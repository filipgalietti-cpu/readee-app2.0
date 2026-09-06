import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./greek-and-latin-roots-timings.json";

// Greek and Latin Roots (L.4.4b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=greek-and-latin-roots
// G4-U1 word-work lesson, THE CLASSICAL PARTS tier of L.4.4 (sibling split:
// same-root-new-branch L.3.4c owns a KNOWN ENGLISH root as the clue
// (company/companion, director, the carpet false friend) and its quiz's G4
// band tri/cent/ped; new-word-new-meaning L.3.4b owns known word + known
// affix and its quiz's bio/aud/auto/graphy (autograph, biography burned);
// three-word-tools L.3.4 owns choosing a tool and its quiz's mar/sub/vis/
// super (submarine burned); take-apart-any-word RF.3.3 owns rupt/tract
// (rupture, disruption, abrupt, retract, distraction, extract, dictation as a
// lookalike tile); meaning-machines RF.3.3a owns port/tele/scope/struct
// (portable, telescope, construction, transport) and long-word-trains RF.3.3b
// owns -ment/-ity; context-at-a-distance L.4.4a is in production and
// untouched). THIS owns the Greek and Latin parts THEMSELVES at G4: phon
// (sound), graph (write), spect (look), dict (say) and the affixes micro
// (small), mega (big), multi (many), inter (between); the move "find the part
// you know, borrow its meaning, add the other part, test it in the sentence";
// two-part composition of words the child has never met (phonograph,
// spectators, megaphone, intermission, contradicted, dictated, spectacle,
// interact); the root FAMILY (a six-word Root Phon / Root Spect sort, and
// the word that shares dictated's root); the look-alike (sprinter carries the
// letters of inter and no between); the clue in the sentence that CONFIRMS a
// composed meaning; and a production speak that names both parts and the
// whole meaning. ONE world, "Opening Night": Kendra, ten, the youngest
// stagehand at the town's community theater, and her Uncle Grady, the stage
// manager, on the night the show opens; a borrowed phonograph with a brass
// horn plays the second-act waltz; two actors contradict each other about
// its needle at intermission; Kendra inspects it by flashlight and finds the
// needle down; Grady dictates the night's notes. Three dense read-alongs of
// six, six and five sentences (pages one, three, four, ref-chained images)
// plus one accept-mode child-read page (page two, 43 tokens, no " my "),
// complex sentences with relative pronouns (the ropes that raised the
// scenery, a breath she had been holding), past perfect and progressive,
// action-beat dialogue, no digits, no contractions in child-read text.
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file BEFORE
// writing: opening night / community theater / stage manager / stagehand /
// intermission / phonograph / megaphone / spectators / inspect / spectacular
// / spectacle / contradicted / multitude / multicolored / dictated / interact
// / international / sprinter / symphony / headset / waltz / orchestra /
// rehearsal / Kendra / Grady all 0 hits (theater = a G1 talent show, a hallway
// shadow theater and a planetarium, none a play; backstage = one G1 prose
// hit; microphone and telephone are said in the model only as the words the
// child already owns phon from). Speak texts carry no " my " token. Tiles
// lowercase, audio-free, kebab ids, 28-char cap.

const A = (id: string) => `/audio/lessons-v2/greek-and-latin-roots/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/greek-and-latin-roots/${w.toLowerCase()}.png`;

export const greekAndLatinRootsImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "The dim backstage wings of a small old theater seen from the side, a tall wooden wall with a row of thick ropes tied off on wooden pegs, the edge of a heavy red velvet curtain on the right, a ten year old girl with medium brown skin and short curly black hair wearing a black t-shirt and a gray headset with a small microphone arm, standing on tiptoe to tug one of the ropes, a tall man with medium brown skin, a short gray beard, and a black button shirt holding a plain clipboard with blank paper, and in the corner an antique wooden phonograph with a large shiny brass horn and a hand crank on a small table, warm amber work lights. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank clipboard, no posters, no signs, no letters, no words, no numbers, no writing anywhere.",
  "page-3": { subject: "The same dim backstage wings of the same small old theater, the same ten year old girl with medium brown skin, short curly black hair, a black t-shirt and a gray headset crouching beside the same antique wooden phonograph with a large shiny brass horn on its small table, shining a yellow flashlight onto the flat black disc and lifting the thin metal needle arm with two fingers, behind her two actors in old fashioned ballroom costumes, a woman in a long blue gown and a man in a dark tailcoat, standing with their arms crossed and frowning at each other, the same tall man with medium brown skin and a short gray beard holding a plain blank clipboard in the background, the edge of the red velvet curtain on the right. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank clipboard, no posters, no signs, no letters, no words, no numbers, no writing anywhere.", ref: "page-1" },
  "page-4": { subject: "The same backstage wings of the same small old theater late at night after the show, the same tall man with medium brown skin, a short gray beard, and a black button shirt sitting on a wooden crate talking with one hand raised, the same ten year old girl with medium brown skin, short curly black hair, a black t-shirt and a gray headset around her neck sitting on a lower crate beside him writing with a yellow pencil in a small open notebook that shows only blank pages, the antique wooden phonograph with its brass horn resting on its small table behind them, the ropes tied off on the wall, the red velvet curtain closed, a single warm work light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank notebook pages, no posters, no signs, no letters, no words, no numbers, no writing anywhere.", ref: "page-1" }
};

export const greekAndLatinRoots: LessonDef = {
  id: "greek-and-latin-roots",
  title: "Greek and Latin Roots",
  grade: "4th Grade",
  standard: "L.4.4b",
  archetype: "vocabulary",
  objective: "I can find a Greek or Latin part I know inside a long word, borrow its meaning, add the other part, and test it in the sentence.",
  concepts: [
    "thousands of English words are built from a small set of Greek and Latin parts",
    "phon means sound, graph means write, spect means look, and dict means say",
    "micro means small, mega means big, multi means many, and inter means between",
    "find the part you know, borrow its meaning, add the other part, test it in the sentence",
    "one root grows a whole family of words",
    "a look-alike carries the letters of a root but none of its meaning",
    "the sentence holds the clue that confirms a composed meaning",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You took long words apart tonight and built their meanings out of parts. Phon means sound, graph means write, spect means look, and dict means say. Micro means small, mega means big, multi means many, and inter means between. Find the part you know, borrow its meaning, add the other part, and test it in the sentence. That move opens thousands of words you have never seen, and now it is yours.",
    "title": "Parts You Own",
    "body": "You found a Greek or Latin part inside each long word, borrowed its meaning, added the other part, and tested it in the sentence."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Opening Night, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Thousands of English words are built from a small set of parts that came from two old languages, Greek and Latin. Once you own a dozen of those parts, a long word you have never seen stops being a wall, because you can take it apart. Here is page one of Opening Night. Read along with me, and when you meet the longest word on the page, notice that you already own both of its parts." },
      interaction: { type: "read-along", text: "Kendra had never seen the theater from behind the curtain until opening night, when Uncle Grady, the stage manager, hung a headset around her neck and told her to inspect every rope on the wall before the spectators came in. She was ten, the youngest stagehand the theater had ever hired, and the ropes that raised the scenery were hers to check. In the corner of the wings, the hidden space at the side of the stage, stood a phonograph with a brass horn, an old machine borrowed for the second act. When Grady wound its crank and set the needle down, a scratchy waltz drifted out of the horn and filled the whole backstage. \"That is the sound the actors dance to,\" he said, lifting the needle so the music stopped, \"and it has to start the second the lights come up.\" Kendra clipped a tiny wireless microphone to the lead actor's collar and heard the spectators begin to fill the seats beyond the curtain.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-the-move",
      purpose: "model",
      gate: "none",
      prompt: "Find the part you know. Borrow its meaning. Add the other part. Test it.",
      fx: {"text":"**phon** means sound, **graph** means write","effect":"pop-words"},
      narration: { audio: A("model-the-move"), script: "Here is the move, on the longest word from page one. Phonograph looks new, but it is built from two parts, and you own both of them. The part p, h, o, n means sound. You have it in microphone and in telephone. The part g, r, a, p, h means write. You have it in paragraph. Put the two meanings together, and a phonograph is a sound writer, a machine that writes sound down and plays it back. Now test that in the sentence. Grady sets the needle down, and a waltz drifts out of the horn. A machine that plays back the sound it holds. The meaning holds. That is the whole move. Find the part you know, borrow its meaning, add the other part, and test it in the sentence." },
    },
    {
      id: "model-the-parts",
      purpose: "model",
      gate: "none",
      prompt: "spect, dict, micro, mega, multi, inter",
      fx: {"text":"**spect** look, **dict** say, **micro** small, **mega** big, **multi** many, **inter** between","effect":"pop-words"},
      narration: { audio: A("model-the-parts"), script: "Six more parts, and then the rest of the night is yours. Each one is on your screen. The part s, p, e, c, t means look. You have it in inspect. The part d, i, c, t means say. You have it in predict, which means to say before. The part m, i, c, r, o means small. The part m, e, g, a means big. The part m, u, l, t, i means many. The part i, n, t, e, r means between. Eight parts in all, counting sound and write. When a long word shows up tonight, look for one of them inside it first." },
    },
    {
      id: "guided-choose-spectators",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does spectators mean?",
      narration: { audio: A("guided-choose-spectators"), script: "Your turn, on a word from page one. The spectators came in and filled the seats beyond the curtain. Find the part you know. The part s, p, e, c, t means look, and the ending of the word, the same ending that actor has, names a person who does something, the way an actor is a person who acts. Put the parts together, test them against people filling the seats, and tap what spectators means." },
      interaction: { type: "choose", options: [{ id: "people-who-watch-a-show", label: "people who watch a show" }, { id: "people-who-act-in-a-show", label: "people who act in a show" }, { id: "people-who-sell-the-tickets", label: "people who sell the tickets" }, { id: "people-who-build-the-scenery", label: "people who build the scenery" }], correctId: "people-who-watch-a-show", coachWrong: "Borrow the meaning of the root, then ask what a person who does that would be doing in the seats. Test it against the page." },
    },
    {
      id: "guided-choose-part-look",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the part that means look.",
      narration: { audio: A("guided-choose-part-look"), script: "Parts first, then words. Four parts from the list are on your screen, and every one of them is real. Only one of them means look. Say each part to yourself, remember a word you have it in, and tap the part that means look." },
      interaction: { type: "choose", options: [{ id: "spect", label: "spect" }, { id: "dict", label: "dict" }, { id: "phon", label: "phon" }, { id: "graph", label: "graph" }], correctId: "spect", coachWrong: "That part means something else. Think of the word Grady used when he sent Kendra to check the ropes with her eyes." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Grady predicted a full house, and he was right, because every seat had a coat on it. He lifted a megaphone and told the crew to clear the wings. Above the stage, multicolored lights swung into place and glowed red, gold, and blue.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and notice that each one carries a long word with a part you know at the front." },
      interaction: { type: "speak", text: "Grady predicted a full house and he was right because every seat had a coat on it He lifted a megaphone and told the crew to clear the wings Above the stage multicolored lights swung into place and glowed red gold and blue" },
    },
    {
      id: "guided-sequence-megaphone",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build it: first part, second part, whole word.",
      narration: { audio: A("guided-sequence-megaphone"), script: "One of the long words on page two is a tool Grady lifted to make his voice carry. Three tiles are on your screen, two parts and the whole word they make. Drag the part that comes first into the first slot, the part that follows it into the second slot, and the whole word into the last slot. Then say the two meanings together and test them against what Grady used it for." },
      interaction: { type: "sequence", items: [{ id: "mega", label: "mega" }, { id: "phone", label: "phone" }, { id: "megaphone", label: "megaphone" }], order: ["mega","phone","megaphone"], coachWrong: "Read the whole word slowly. The part at its front goes first, the part at its end goes second, and the whole word goes last." },
    },
    {
      id: "guided-sort-phon-spect",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort by root: Root Phon, or Root Spect?",
      narration: { audio: A("guided-sort-phon-spect"), script: "Two roots, six words. The root p, h, o, n means sound, and the root s, p, e, c, t means look. A root grows a whole family of words. Read each word, find the root inside it, and drag the word to Root Phon or to Root Spect. Two of the words are new tonight, but the root inside each one is not." },
      interaction: { type: "sort", buckets: ["Root Phon","Root Spect"], items: [{ label: "microphone", bucket: "Root Phon" }, { label: "spectators", bucket: "Root Spect" }, { label: "megaphone", bucket: "Root Phon" }, { label: "inspect", bucket: "Root Spect" }, { label: "symphony", bucket: "Root Phon" }, { label: "spectacular", bucket: "Root Spect" }], coachWrong: "Look past the front of the word and find the root itself. Sound goes to one bucket, and look goes to the other." },
    },
    {
      id: "apply-page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch for the parts.",
      image: IMG("page-3"),
      narration: { audio: A("apply-page-3-read"), script: "Page three. Read along with me, and every time a long word shows up, hunt for a part you own before you move on." },
      interaction: { type: "read-along", text: "The first act ran without a single missed cue, and when the curtain came down for intermission, Kendra let out a breath she had been holding since the waltz. In the lobby, a multitude of spectators crowded around the snack table, and their voices came through the wall as one long hum. Then two actors hurried into the wings, and their stories contradicted each other. One said up, one said down, and both of them pointed at the phonograph. Grady did not argue with either of them, but handed Kendra a flashlight and told her to inspect the machine herself, because a spectacular second act depended on that needle. She found it resting on the disc, exactly where it should not have been, and lifted it with two fingers.", audio: A("apply-page-3-read-sentence") },
    },
    {
      id: "apply-choose-intermission",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does intermission mean?",
      narration: { audio: A("apply-choose-intermission"), script: "A long word from page three. The curtain came down for intermission, and the spectators went out to the lobby. Find the part you know. The part i, n, t, e, r means between, and a mission is something you are sent to do, so the second part means sending. Put the parts together, test them against the curtain coming down and the crowd heading for snacks, and tap what intermission means." },
      interaction: { type: "choose", options: [{ id: "a-break-between-two-acts", label: "a break between two acts" }, { id: "the-loudest-song-in-the-show", label: "the loudest song in the show" }, { id: "the-final-bow-of-the-night", label: "the final bow of the night" }, { id: "the-first-line-of-the-play", label: "the first line of the play" }], correctId: "a-break-between-two-acts", coachWrong: "Borrow the meaning of the part at the front, then ask what the page says happens right then. The curtain is down and the crowd is in the lobby." },
    },
    {
      id: "apply-choose-look-alike",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word only looks like it carries inter?",
      narration: { audio: A("apply-choose-look-alike"), script: "Even an old part has look-alikes. Four words are on your screen, and each one has the letters i, n, t, e, r somewhere inside it. In three of them, the part truly means between, and you can find the between in the meaning. In one of them, the letters are there but the meaning has no between in it at all, the way a carpet is not a pet for cars. Run the test on each word, and tap the one that only looks like it carries inter." },
      interaction: { type: "choose", options: [{ id: "sprinter", label: "sprinter" }, { id: "intermission", label: "intermission" }, { id: "interact", label: "interact" }, { id: "international", label: "international" }], correctId: "sprinter", coachWrong: "That word truly has a between in its meaning. Find the one where the letters are only a coincidence." },
    },
    {
      id: "apply-choose-confirming-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words on page three confirm what contradicted means?",
      narration: { audio: A("apply-choose-confirming-clue"), script: "The last step of the move is the test, and the test lives in the sentence. Page three says the two actors' stories contradicted each other. The part d, i, c, t means say, and the part in front of it, c, o, n, t, r, a, means against, so contradicted means said the opposite. Four pieces of page three are on your screen, and every one of them is really there. Only one of them shows the two actors saying opposite things. Tap the piece that confirms the meaning." },
      interaction: { type: "choose", options: [{ id: "one-said-up-one-said-down", label: "one said up one said down" }, { id: "two-actors-hurried", label: "two actors hurried" }, { id: "both-of-them-pointed", label: "both of them pointed" }, { id: "at-the-phonograph", label: "at the phonograph" }], correctId: "one-said-up-one-said-down", coachWrong: "That piece is on the page, but it does not show anyone saying the opposite of anyone else. Find the piece where the two actors disagree." },
    },
    {
      id: "apply-page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page four, the ending. Read along!",
      image: IMG("page-4"),
      narration: { audio: A("apply-page-4-read"), script: "Here is the last page. Read along with me, and notice what Grady does with the notes at the end of the night." },
      interaction: { type: "read-along", text: "The second act opened with the waltz, right on the lights, and the actors swept across the stage in the multicolored glow while the spectators sat as still as the scenery. When the last line was spoken, the applause came like rain on a roof. Afterward, Grady dictated the night's notes to Kendra, speaking slowly while she wrote them in pencil, because every missed cue and every fixed needle went into the book. \"Tomorrow you inspect the phonograph before anyone touches it,\" he said, tapping the page. Kendra wrote it down, and then she wrote the whole spectacle down too, the ropes and the lights and the hum through the wall, so that she would never forget her first opening night.", audio: A("apply-page-4-read-sentence") },
    },
    {
      id: "apply-choose-root-family",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word belongs to the same family as dictated?",
      narration: { audio: A("apply-choose-root-family"), script: "Page four says Grady dictated the notes, which means he said them out loud for Kendra to write down. The root inside dictated is d, i, c, t, and it means say. A root grows a family, and every word in the family carries the same meaning inside it. Four words from tonight are on your screen. Tap the one that belongs to the same family as dictated, because the same root is inside it." },
      interaction: { type: "choose", options: [{ id: "predicted", label: "predicted" }, { id: "spectators", label: "spectators" }, { id: "megaphone", label: "megaphone" }, { id: "multitude", label: "multitude" }], correctId: "predicted", coachWrong: "That word carries a different root. Look for the four letters that mean say sitting inside the word." },
    },
    {
      id: "challenge-speak-interact",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Interact. Name its two parts, and say what the whole word means.",
      narration: { audio: A("challenge-speak-interact"), script: "Last one, and you make the whole move out loud on a word you have not taken apart yet. After the show, the actors came out to the lobby to interact with the spectators, shaking hands and answering questions. Tap the mic. Name the two parts inside interact, say what each part means, and then say what the whole word means." },
      interaction: { type: "speak", text: "inter between act acts acting action do doing together talk talking with each other people meet greet mingle chat shake hands answer questions mix share respond spectators crowd" },
    },
    {
      id: "celebrate-greek-and-latin-roots",
      purpose: "celebrate",
      gate: "none",
      prompt: "Find the part you know.",
      fx: {"text":"Find the part you know, **borrow its meaning**, test it","effect":"fireworks"},
      narration: { audio: A("celebrate-greek-and-latin-roots"), script: "Tonight every long word came apart in your hands. You found a part you owned, borrowed its meaning, added the other part, and tested the whole thing in the sentence. You sorted a root's family, you caught a look-alike, and you found the clue on the page that confirmed a meaning. Eight parts, and they open thousands of words. From now on, when a long word shows up, look inside it first." },
    },
  ],
};
