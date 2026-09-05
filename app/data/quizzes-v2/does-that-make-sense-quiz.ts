import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Does That Make Sense? QUIZ (RF.3.4c) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), Claude-judged rebuild. Bands: easier(G2-bridge:
// which-reading-fits at 3 options with picture support, plus the reread move) /
// core(on-grade G3: which-reading, the stop-and-reread sentence, a Confirm /
// Correct sort, the context-clue choose, a read-then-say production speak,
// a stress-shift homograph) / harder(G4 transfer RF.4.4c-adjacent TAUGHT in the
// stimulus: a word whose two readings BOTH fit until a LATER sentence settles it,
// modeled on the bass fiddle then applied to the bass from the pond, applied
// again on read and on bow, closing with a two-sentence production speak).
// ALL-FRESH second story, "The Farm Stand" (Opal, her cousin Gideon, and Aunt
// Colette's roadside stand: the produce, a sow the size of a bathtub, close the
// gate, the hose wound on its reel, the storm that passes in a minute, the lead
// pipe, the bass fiddle and the bass from the pond), spoken INSIDE every question
// where the child listens and shown on screen where the child reads; every
// stimulus is carried in its own narration (no earlier-question recall). Nothing
// from the lesson story (Ronan, Nadine, Grandpa Alonzo, Loon Lake, the net) is
// reused; the lesson's planted words bow / live / wind / tear are not the tested
// words here (bow returns only in h-3 as a different pair, take a bow vs the
// fiddle bow, taught fresh). Homographs inside narration sentences are written
// in the spelling that forces the settled reading where one exists (led / red);
// sow, wound, close, bass, content, minute are left natural for the voice, FLAG
// for ear-check. Names + setting grep-swept vs lessons-v2 + quizzes-v2: Opal,
// Gideon, Colette, farm stand, sow, bass, hose reel 0 hits. Tiles are audio-free
// lowercase text. Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/does-that-make-sense-quiz";
const IMG = (w: string) => `/images/lessons-v2/does-that-make-sense/${w.toLowerCase()}.png`;

export const doesThatMakeSenseQuiz: QuizDef = {
  id: "does-that-make-sense-quiz",
  lessonId: "does-that-make-sense",
  title: "Does That Make Sense? Quiz",
  standard: "RF.3.4c",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-sow-reading",
      band: "easier",
      difficulty: 1,
      prompt: "A sow the size of a bathtub dozed in her pen. Which reading fits?",
      image: IMG("quiz-sow-pen"),
      narration: { audio: `${Q}/e-1-sow-reading.mp3`, script: "Here is a new story about a farm stand. Aunt Colette ran a farm stand at the end of her gravel road, and every Saturday Opal and her cousin Gideon helped her. The sentence on your screen comes from page two of that story, and the word after the letter a can be said two ways, so let the sentence decide. The picture shows what dozed in the pen. Reread the sentence, and tap the meaning that fits it." },
      hint: { audio: `${Q}/e-1-sow-reading-hint.mp3`, script: "The picture shows you what was dozing in the pen. Reread the sentence with that picture in mind." },
      explain: { audio: `${Q}/e-1-sow-reading-explain.mp3`, script: "The answer is a big mother pig. Said so that it rhymes with cow, this word means a mother pig, and only a pig could be the size of a bathtub and doze in a pen." },
      interaction: { type: "choose", options: [{ id: "a-big-mother-pig", label: "a big mother pig" }, { id: "to-plant-seeds-in-a-row", label: "to plant seeds in a row" }, { id: "to-stitch-with-a-needle", label: "to stitch with a needle" }], correctId: "a-big-mother-pig", coachWrong: "Reread the sentence. Something the size of a bathtub was dozing in a pen. Which meaning could do that?" },
    },
    {
      id: "e-2-wound-reading",
      band: "easier",
      difficulty: 2,
      prompt: "Opal wound the long hose around its reel. Which reading fits?",
      image: IMG("quiz-hose-reel"),
      narration: { audio: `${Q}/e-2-wound-reading.mp3`, script: "Here is the next sentence from the farm stand. Opal wound the long hose around its reel so nobody would trip. The word right after Opal can be said two ways. The picture shows the hose on its reel. Reread the sentence, and tap the meaning that fits it." },
      hint: { audio: `${Q}/e-2-wound-reading-hint.mp3`, script: "The picture shows how the hose sits on the reel. Which meaning matches what Opal did to it?" },
      explain: { audio: `${Q}/e-2-wound-reading-explain.mp3`, script: "The answer is wrapped it around and around. Opal wound the hose, the reading that rhymes with found, and the hose went around the reel so nobody would trip." },
      interaction: { type: "choose", options: [{ id: "wrapped-it-around-and-around", label: "wrapped it around and around" }, { id: "a-cut-that-needs-a-bandage", label: "a cut that needs a bandage" }, { id: "a-puff-of-moving-air", label: "a puff of moving air" }], correctId: "wrapped-it-around-and-around", coachWrong: "Reread the sentence. Opal did something to the hose so nobody would trip over it. Which meaning is something you can do to a hose?" },
    },
    {
      id: "e-3-close-reading",
      band: "easier",
      difficulty: 3,
      prompt: "Gideon had to close the gate every time. Which reading fits?",
      image: IMG("quiz-gate"),
      narration: { audio: `${Q}/e-3-close-reading.mp3`, script: "One more sentence from the farm stand. Gideon had to close the gate every time he walked through it, because the pig could push it open. The word after had to can be said two ways. The picture shows Gideon at the gate. Reread the sentence, and tap the meaning that fits here." },
      hint: { audio: `${Q}/e-3-close-reading-hint.mp3`, script: "The picture shows what Gideon's hands are doing to the gate. Which meaning matches that?" },
      explain: { audio: `${Q}/e-3-close-reading-explain.mp3`, script: "The answer is shut it tight. Gideon had to close the gate, the reading that rhymes with nose, so the pig could not push it open." },
      interaction: { type: "choose", options: [{ id: "shut-it-tight", label: "shut it tight" }, { id: "stand-near-it", label: "stand near it" }, { id: "paint-it-red", label: "paint it red" }], correctId: "shut-it-tight", coachWrong: "Reread the sentence. Gideon did something to the gate so the sow stayed in. Which meaning keeps a pig in a pen?" },
    },
    {
      id: "e-4-what-to-do",
      band: "easier",
      difficulty: 4,
      prompt: "A sentence you just read cannot be right. What do you do?",
      narration: { audio: `${Q}/e-4-what-to-do.mp3`, script: "Here is a reading rule to check. You are reading the farm stand story, and a sentence comes out of your mouth that cannot be right. Think about what a careful reader does next, and tap it." },
      hint: { audio: `${Q}/e-4-what-to-do-hint.mp3`, script: "A sentence that cannot be right needs a second look, not a louder voice and not a skip." },
      explain: { audio: `${Q}/e-4-what-to-do-explain.mp3`, script: "The answer is go back and reread it. When a sentence cannot be right, a careful reader goes back, rereads it, and lets the words around it fix the reading." },
      interaction: { type: "choose", options: [{ id: "go-back-and-reread-it", label: "go back and reread it" }, { id: "skip-to-the-next-page", label: "skip to the next page" }, { id: "read-it-again-louder", label: "read it again louder" }], correctId: "go-back-and-reread-it", coachWrong: "Louder and skipping never fix a sentence. Which move gives the sentence a second look?" },
    },
    {
      id: "c-1-minute-reading",
      band: "core",
      difficulty: 1,
      prompt: "The storm would pass in a minute. Which reading fits?",
      narration: { audio: `${Q}/c-1-minute-reading.mp3`, script: "Here is page three of the farm stand story. By noon the sky turned dark, and a gust flipped the paper sign into the mud. Aunt Colette said the storm would pass in a minute, and she was right. The last word of that sentence can be said two ways. Reread the sentence, and tap the meaning that fits it." },
      hint: { audio: `${Q}/c-1-minute-reading-hint.mp3`, script: "The storm and how long it would last is what Aunt Colette was talking about, so reread the sentence with that in mind." },
      explain: { audio: `${Q}/c-1-minute-reading-explain.mp3`, script: "The answer is a short bit of time. In a minute, the reading that starts like the word mini, means soon, and the storm did pass soon." },
      interaction: { type: "choose", options: [{ id: "a-short-bit-of-time", label: "a short bit of time" }, { id: "something-very-tiny", label: "something very tiny" }, { id: "a-hand-on-a-clock", label: "a hand on a clock" }, { id: "a-note-you-write-down", label: "a note you write down" }], correctId: "a-short-bit-of-time", coachWrong: "Aunt Colette was talking about the storm and how long it would take to pass. Which meaning is about time?" },
    },
    {
      id: "c-2-stop-and-reread",
      band: "core",
      difficulty: 2,
      prompt: "Which sentence would make you stop and reread page two?",
      narration: { audio: `${Q}/c-2-stop-and-reread.mp3`, script: "Here is page two of the farm stand story. Behind the stand, a pig the size of a bathtub dozed in her pen, and Gideon had to close the gate every time he walked through it. Opal wound the long hose around its reel so nobody would trip. A reader hurried through that page and heard herself say four sentences. Three of them match what the page really says. One cannot be right, and it would make a careful reader stop and reread. Four sentences are on your screen. Tap the one that would make you stop." },
      hint: { audio: `${Q}/c-2-stop-and-reread-hint.mp3`, script: "Picture each sentence at the farm stand. Three of them happened on page two. Which one tells about something that never happened?" },
      explain: { audio: `${Q}/c-2-stop-and-reread-explain.mp3`, script: "The answer is Opal got a cut from the hose. A reader who said wound the way you say a cut heard a hurt Opal, but the page says she wrapped the hose so nobody would trip. Reread it, and the sentence corrects itself." },
      interaction: { type: "choose", options: [{ id: "opal-got-a-cut-from-the-hose", label: "Opal got a cut from the hose" }, { id: "the-pig-dozed-in-her-pen", label: "the pig dozed in her pen" }, { id: "gideon-shut-the-gate-again", label: "Gideon shut the gate again" }, { id: "opal-wrapped-the-hose-up", label: "Opal wrapped the hose up" }], correctId: "opal-got-a-cut-from-the-hose", coachWrong: "That one really happened on page two. Reread the page in your head and find the sentence that did not." },
    },
    {
      id: "c-3-sort-confirm-correct",
      band: "core",
      difficulty: 3,
      prompt: "Confirm, or Correct? Sort the six readings.",
      narration: { audio: `${Q}/c-3-sort-confirm-correct.mp3`, script: "Six cards are on your screen. Each card tells you how a reader said a word, spelled the way it sounded, and then the words around it. Read the card, reread the sentence in your head, and decide. If the reading fits those words, drag the card to Confirm. If the sentence needs the other reading, drag the card to Correct." },
      hint: { audio: `${Q}/c-3-sort-confirm-correct-hint.mp3`, script: "Say the word the way the card spells it, then reread the rest of the card. Does that reading still make sense with those words?" },
      explain: { audio: `${Q}/c-3-sort-confirm-correct-explain.mp3`, script: "Wound the hose takes the reading that rhymes with found, so wownd is a confirm and woond is a correct. A pig in a pen is said like cow, so soh is a correct. In a minute and take the lead both fit, so they are confirms. Close to me is the near reading, said like dose, so kloze is a correct." },
      interaction: { type: "sort", buckets: ["Confirm","Correct"], bucketAudio: { "Confirm": `${Q}/b-confirm.mp3`, "Correct": `${Q}/b-correct.mp3` }, items: [{ label: "said wownd, wound the hose", bucket: "Confirm" }, { label: "said soh, a sow in the pen", bucket: "Correct" }, { label: "said minit, in a minute", bucket: "Confirm" }, { label: "said kloze, close to me", bucket: "Correct" }, { label: "said leed, take the lead", bucket: "Confirm" }, { label: "said woond, wound the hose", bucket: "Correct" }], coachWrong: "Reread the card. Say the word the way the card spells it, and ask whether the words around it still make sense." },
    },
    {
      id: "c-4-context-clue",
      band: "core",
      difficulty: 4,
      prompt: "The old pipe was made of lead, a gray metal, and it left dark marks on Gideon's hands. Which words settle the word lead?",
      narration: { audio: `${Q}/c-4-context-clue.mp3`, script: "Here is a sentence from the barn behind the stand, and it carries a word that can be said two ways. One way rhymes with feed, as in lead the way. The other way rhymes with bed, as in a heavy led pipe. The old pipe was made of led, a gray metal, and it left dark marks on Gideon's hands. Four pieces of the sentence are on your screen. Tap the piece that settles which reading it is." },
      hint: { audio: `${Q}/c-4-context-clue-hint.mp3`, script: "The sentence tells you what kind of thing the pipe was made of. Reread it and find that piece." },
      explain: { audio: `${Q}/c-4-context-clue-explain.mp3`, script: "The answer is a gray metal. A metal is a thing, not an action, so the word is the one that rhymes with bed, and the whole sentence makes sense." },
      interaction: { type: "choose", options: [{ id: "a-gray-metal", label: "a gray metal" }, { id: "the-old-pipe", label: "the old pipe" }, { id: "dark-marks", label: "dark marks" }, { id: "on-gideons-hands", label: "on Gideon's hands" }], correctId: "a-gray-metal", coachWrong: "That piece does not tell you what the pipe was made of. Reread the sentence and find the piece that does." },
    },
    {
      id: "c-5-speak-sow-the-beans",
      band: "core",
      difficulty: 5,
      prompt: "Read it out loud: Gideon will sow the last row of beans before the rain comes back. Then say what sow means here, and which words settle it.",
      narration: { audio: `${Q}/c-5-speak-sow-the-beans.mp3`, script: "Now a sentence for you to read out loud, and it carries a word that can be said two ways. Tap the mic, read the sentence on your screen, and then tell me what that word means in this sentence, and which words settled it for you." },
      hint: { audio: `${Q}/c-5-speak-sow-the-beans-hint.mp3`, script: "Beans planted in a garden row are what this sentence is about. Say what a person does with beans in a row. Then name the words that told you." },
      explain: { audio: `${Q}/c-5-speak-sow-the-beans-explain.mp3`, script: "Here is the sentence one more time. Gideon will sow the last row of beans before the rain comes back. Sow here means to plant seeds, said like go, and the last row of beans settles it." },
      interaction: { type: "speak", text: "plant plants planting planted seed seeds put bury dig dirt soil ground grow row beans scatter drop spread garden" },
    },
    {
      id: "c-6-content-reading",
      band: "core",
      difficulty: 6,
      prompt: "Aunt Colette was content to sit in the shade. Which reading fits?",
      narration: { audio: `${Q}/c-6-content-reading.mp3`, script: "Here is a sentence from the end of the day. After the storm, Aunt Colette was content to sit in the shade and count the money while Opal and Gideon packed the truck. The word after was can be said two ways, one with the loud part at the front and one with the loud part at the back. Reread the sentence, and tap the meaning that fits it." },
      hint: { audio: `${Q}/c-6-content-reading-hint.mp3`, script: "Aunt Colette was sitting in the shade after a long day of work. Reread the sentence and ask how she felt." },
      explain: { audio: `${Q}/c-6-content-reading-explain.mp3`, script: "The answer is happy and calm. Content with the loud part at the back means pleased and calm, and that is how a person feels sitting in the shade after the work is done." },
      interaction: { type: "choose", options: [{ id: "happy-and-calm", label: "happy and calm" }, { id: "what-is-inside-a-box", label: "what is inside a box" }, { id: "the-list-inside-a-book", label: "the list inside a book" }, { id: "worried-and-rushed", label: "worried and rushed" }], correctId: "happy-and-calm", coachWrong: "Reread the sentence. It tells how Aunt Colette felt while she sat in the shade, so the meaning is a feeling." },
    },
    {
      id: "h-1-bass-hold-both",
      band: "harder",
      difficulty: 1,
      prompt: "Aunt Colette said the bass was the biggest one she had ever held. Which sentence settled the word bass?",
      narration: { audio: `${Q}/h-1-bass-hold-both.mp3`, script: "Fourth graders meet words where both readings fit at first, and they hold both readings until a later sentence settles it. Here is the setup. Aunt Colette played the big bass fiddle in a band on Saturday nights, and she also liked to fish the pond behind the barn. Now listen. When the rain stopped, Gideon helped her carry the bass to the truck. Both readings fit that sentence. It could be the deep-voiced fiddle, or it could be a big fish from the pond. So I hold both and keep reading. Its strings hummed when the truck hit a bump. Strings. That later sentence settles it, so the word is the fiddle. Your turn. Aunt Colette said the bass was the biggest one she had ever held. Hold both readings. It had nearly pulled her rod into the pond. Four sentences are on your screen. Tap the one that settled which bass it was." },
      hint: { audio: `${Q}/h-1-bass-hold-both-hint.mp3`, script: "The sentence you need came after the word bass, and it tells about something only a fish could do." },
      explain: { audio: `${Q}/h-1-bass-hold-both-explain.mp3`, script: "The answer is it pulled her rod. A fiddle cannot pull a fishing rod, so that later sentence settled the word as the fish from the pond." },
      interaction: { type: "choose", options: [{ id: "it-pulled-her-rod", label: "it pulled her rod" }, { id: "she-had-ever-held", label: "she had ever held" }, { id: "it-was-the-biggest", label: "it was the biggest" }, { id: "the-rain-stopped", label: "the rain stopped" }], correctId: "it-pulled-her-rod", coachWrong: "That sentence fits both readings. Reread the later sentence and find the one that only a fish could do." },
    },
    {
      id: "h-2-read-hold-both",
      band: "harder",
      difficulty: 2,
      prompt: "Opal read the price list one more time. Then she fixed the peach price with a marker. Which reading of read fits?",
      narration: { audio: `${Q}/h-2-read-hold-both.mp3`, script: "Here is a word that fits both ways until the next sentence. Opal read the price list one more time. Said one way, it means she is still doing it or does it often. Said the other way, it already happened. Hold both readings, and listen to the next sentence. Then she fixed the peach price with a marker. Four readings are on your screen. Tap the one that the second sentence settles." },
      hint: { audio: `${Q}/h-2-read-hold-both-hint.mp3`, script: "The second sentence begins with the word then, and it tells about something Opal did after the reading was finished." },
      explain: { audio: `${Q}/h-2-read-hold-both-explain.mp3`, script: "The answer is she already looked at it. Then she fixed the price, so the reading had already happened, and the word sounds like the color red." },
      interaction: { type: "choose", options: [{ id: "she-already-looked-at-it", label: "she already looked at it" }, { id: "she-looks-at-it-every-day", label: "she looks at it every day" }, { id: "she-will-look-at-it-soon", label: "she will look at it soon" }, { id: "she-is-looking-at-it-now", label: "she is looking at it now" }], correctId: "she-already-looked-at-it", coachWrong: "Reread the second sentence. Then she fixed the price. Did the reading happen before that, or is it still happening?" },
    },
    {
      id: "h-3-bow-hold-both",
      band: "harder",
      difficulty: 3,
      prompt: "When the song ended, Aunt Colette took a bow. Which reading fits after the next sentence?",
      narration: { audio: `${Q}/h-3-bow-hold-both.mp3`, script: "Here is one more word that fits both ways at first. In a band, this word can be the stick that plays the fiddle, said like go, or it can be bending low to the crowd, said like cow. When the song ended, Aunt Colette took a bow. A fiddle player could pick up her stick, or she could bend to the crowd, so hold both. The crowd clapped even louder, and she bent low a second time. Four readings are on your screen. Tap the one that the later sentence settles." },
      hint: { audio: `${Q}/h-3-bow-hold-both-hint.mp3`, script: "The later sentence says she did it a second time, and it tells you what her body did." },
      explain: { audio: `${Q}/h-3-bow-hold-both-explain.mp3`, script: "The answer is bent low to the crowd. She bent low a second time, so the first bow was a bend to the crowd, said like cow, not the fiddle stick." },
      interaction: { type: "choose", options: [{ id: "bent-low-to-the-crowd", label: "bent low to the crowd" }, { id: "picked-up-the-fiddle-stick", label: "picked up the fiddle stick" }, { id: "tied-a-ribbon-on-the-case", label: "tied a ribbon on the case" }, { id: "tuned-the-fiddle-strings", label: "tuned the fiddle strings" }], correctId: "bent-low-to-the-crowd", coachWrong: "Reread the later sentence. She did the same thing a second time. What did the sentence say her body did?" },
    },
    {
      id: "h-4-speak-wound-two-sentences",
      band: "harder",
      difficulty: 4,
      prompt: "Read both sentences out loud: The rope was wound around the fence post. It held the tarp down all night. Then say what wound means here, and which words settle it.",
      narration: { audio: `${Q}/h-4-speak-wound-two-sentences.mp3`, script: "Last one, out loud. Two sentences are on your screen, and the first one carries a word that can be said two ways. Hold both readings, read the second sentence, and let it settle the word. Tap the mic, read both sentences out loud, and then tell me what the word means and which words settled it." },
      hint: { audio: `${Q}/h-4-speak-wound-two-sentences-hint.mp3`, script: "Say what someone did with the rope to the post, and then name the words in the second sentence that told you." },
      explain: { audio: `${Q}/h-4-speak-wound-two-sentences-explain.mp3`, script: "Here are the sentences once more. The rope was wound around the fence post. It held the tarp down all night. Wound here means wrapped around, said like found, and a rope that held a tarp down was wrapped, not hurt." },
      interaction: { type: "speak", text: "wrapped wrap wrapping wraps tied tie tying circled circle around round twisted twist coiled coil looped loop rope post tarp held down night turned turn" },
    },
  ],
};
