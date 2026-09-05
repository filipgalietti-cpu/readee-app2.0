import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./does-that-make-sense-timings.json";

// Does That Make Sense? (RF.3.4c) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged rebuild.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=does-that-make-sense
// G3-U3 · CONFIRM OR CORRECT tier of RF.3.4 (use context to confirm or self-correct
// word recognition, rereading as necessary). Sibling split: click-and-clunk RF.2.4c
// (the G2 clunk loop on LOOKALIKE pairs cloud/clown, twigs/twins, cheer/chair,
// trail/tail, bran/barn, puddles/paddles and its Clicks/Clunks sort), read-with-
// your-brain RF.2.4a (purpose + did-that-make-sense, Pip), tricky-sound-switchers
// RF.2.3e (sound-level flip ow/oo), smooth-and-sure RF.3.4 (the umbrella habit +
// understanding checks), know-why-you-read RF.3.4a (purpose), prose-and-poem
// RF.3.4b (rate and expression), three-word-tools L.3.4 (meaning strategies, NOT
// taught here). THIS owns the G3 step-up: words spelled the same but said two ways
// (bow, live, wind, tear, and fresh close / wound) where only the sentence settles
// the reading; the sentence-level check ("that sentence cannot be right, reread the
// page"); and the CONFIRM half (reread, the reading fit, keep it) beside the
// CORRECT half. ONE original story, "Loon Lake" (Ronan, his older cousin Nadine,
// and Grandpa Alonzo take the rowboat out at dawn; Nadine sits in the bow, live
// bait, wind the line in, the wind pushes the cast, a minute later the reel sings,
// a tear in the net lets the big fish go, Grandpa wipes a tear from his eye): 16
// sentences over 6 child-read pages (read-along 1/3/5 with images, accept-mode
// speaks 2/4/6 at 49/37/41 tokens), compound + early-complex, tagged dialogue with
// an exclamation point, stretch words minnows / threaded / sinker / mesh with in-
// text support, no digits, no contractions in read-along text, no " my " in any
// speak text. Planted homographs: bow (p1 x2, p4), live (p1), wind verb (p2, p4) +
// wind noun (p3, the careless-reader trap right after the child said the verb),
// tear rip + tear drop (p5). The narrator's deliberate misreads are scripted as
// separate spoken tokens (Tier. Tare. Bough.) never inside the real sentence, and
// every homograph inside a narration sentence is written in the spelling that
// forces the settled reading (bough / tare / tier / red), since the script is
// never shown. ANCHOR FRESHNESS python-swept vs every lessons-v2 + quizzes-v2
// file: Ronan, Nadine, Alonzo, Loon Lake, minnows, reel, sinker, mesh, tackle,
// live bait, bass, sow all 0-hit; bow / lead / tear / wound / minute / close only
// incidental prose elsewhere, never taught as two readings; heron (show-me-where),
// canoe (know-them-by-heart), dove-as-bird (follow-the-message-quiz), desert
// (fact-word-finder), present / record / object (check-the-dictionary-quiz) found
// burned and avoided. Keys prefixed quiz- are fresh stimuli for the quiz (Opal,
// Gideon, Aunt Colette's farm stand).

const A = (id: string) => `/audio/lessons-v2/does-that-make-sense/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/does-that-make-sense/${w.toLowerCase()}.png`;

export const doesThatMakeSenseImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A small wooden rowboat just pushed away from a weathered wooden dock on a calm lake at dawn, pale pink and orange sky with no sun visible, an older man with brown skin, a white mustache, and a faded green fishing vest sitting at the oars in the back of the boat, a girl about eleven years old with dark brown skin and long braids wearing a red hoodie sitting at the very front tip of the boat, a boy about eight years old with dark brown skin and short curly hair wearing a blue jacket sitting on the middle seat with a white plastic bucket between his boots, two fishing rods laid along the boat, tall reeds along the shore, an old tree stump sticking up out of the water in the distance. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same small wooden rowboat on the calm lake in early morning light, the same boy about eight years old with dark brown skin and short curly hair in a blue jacket standing carefully on the middle seat holding a fishing rod after a cast, the thin fishing line blown sideways in a long curve by the wind, the same girl about eleven with dark brown skin and long braids in a red hoodie at the front of the boat pointing toward a dark patch of water beside an old tree stump, the same older man with a white mustache and green fishing vest at the oars, small ripple rings on the dark water near the stump, tall reeds far behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same small wooden rowboat on the lake in bright morning light with no sun visible, the same older man with a white mustache and green fishing vest leaning over the side holding a fishing net with a large ragged hole torn in its mesh, a big green and gold fish slipping through the hole back into the water with a splash, the same girl about eleven with dark brown skin and long braids in a red hoodie laughing at the front of the boat, the same boy about eight in a blue jacket on the middle seat holding a bent fishing rod with his mouth open in surprise. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-sow-pen": "A very large pink farm pig with floppy ears lying asleep on its side in yellow straw inside a low wooden fence pen, seen from the side with its head resting flat on the straw and its round snout pointing straight at the viewer so no mouth line is visible, eyes closed, no smile, no expression, a small wooden farm stand table with peaches and ears of corn behind the pen, a gravel road, sunny summer day with no sun visible. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-hose-reel": "A long green garden hose wrapped neatly around and around a metal hose reel on two wheels standing on gravel beside a small wooden farm stand table with baskets of green beans, a wooden fence and a red barn behind, sunny day with no sun visible, nothing else on the ground. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-gate": { subject: "A boy about nine years old with pale skin and messy brown hair wearing a yellow t-shirt and shorts pushing a wooden farm gate shut with both hands, the gate swinging into a wooden fence post with a metal latch, the same very large pink pig sleeping in yellow straw inside the pen behind the fence, gravel ground, sunny day with no sun visible. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-sow-pen" }
};

export const doesThatMakeSense: LessonDef = {
  id: "does-that-make-sense",
  title: "Does That Make Sense?",
  grade: "3rd Grade",
  standard: "RF.3.4c",
  archetype: "fluency",
  objective: "I can check that every word and every sentence makes sense, and reread to confirm the reading or to correct it.",
  concepts: [
    "some words are spelled the same but said two ways, and only the sentence around them decides which one you are looking at",
    "check every word against its sentence, and every sentence against its page",
    "if the reading fits, reread and confirm it; if the sentence cannot be right, reread the page and correct it",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Loon Lake was full of words that could be said two ways, and you let the sentences decide. When a reading fit, you reread and confirmed it. When a sentence could not be right, you reread the page and corrected it. Keep asking whether it makes sense, and every page will.",
    "title": "Does That Make Sense?",
    "body": "You checked every word against its sentence, and you reread to confirm or to correct."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Loon Lake, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Third grade pages are full of words that can be said two ways, and only the sentence around them can tell you which way is right. Today you will check every word against its sentence, and every sentence against its page. When something cannot be right, you stop, you reread, and you correct it. When it does make sense, you reread, you confirm it, and you keep going. Here is page one of Loon Lake. Read along with me, and listen for the words that the sentence has to settle." },
      interaction: { type: "read-along", text: "Grandpa Alonzo pushed the rowboat away from the dock at Loon Lake before the sun was fully up, and Ronan climbed in beside his cousin Nadine. \"Somebody has to sit in the bow,\" said Grandpa Alonzo, \"because the front of the boat needs some weight in it.\" Nadine crawled forward and settled into the bow, while Ronan took the middle seat with the bucket of live bait wedged between his boots.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-two-readings",
      purpose: "model",
      gate: "none",
      prompt: "Same letters, two ways to say it. The sentence decides.",
      fx: {"text":"Same letters. **Two** ways to say it. The **sentence** decides.","effect":"pop-words"},
      narration: { audio: A("model-two-readings"), script: "Back on page one there was a word that can be said two ways. One way rhymes with go, and it means a ribbon tied in loops. Bow. The other way rhymes with cow, and it means the front of a boat. Bough. Same letters, two different words, and only the sentence can tell you which one you are looking at. Grandpa Alonzo says somebody has to sit in the bough, because the front of the boat needs some weight in it. The front of the boat. Those words settle it, so this word is the one that rhymes with cow. Now I reread the whole sentence with that reading, and it makes sense. That is the check. Try a reading, reread the sentence, and let the words around it confirm the reading or correct it." },
    },
    {
      id: "guided-choose-live",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page one: the bucket of live bait. Which reading fits?",
      narration: { audio: A("guided-choose-live"), script: "Here is another word from page one that can be said two ways. One way sounds like the end of give, and it means to make your home somewhere, the way fish live in the lake. The other way sounds like the end of hive, and it means alive, or happening right now, like a live wire or a live show. Page one says Ronan took the middle seat with the bucket of live bait wedged between his boots. Reread that sentence in your head, and let the words around it decide. Four meanings are on your screen. Tap the one that fits this sentence." },
      interaction: { type: "choose", options: [{ id: "alive-and-still-wiggling", label: "alive and still wiggling" }, { id: "to-make-a-home-somewhere", label: "to make a home somewhere" }, { id: "happening-right-now-on-stage", label: "happening right now on stage" }, { id: "a-wire-that-carries-power", label: "a wire that carries power" }], correctId: "alive-and-still-wiggling", coachWrong: "Bait is what goes on the hook to catch a fish. Reread the sentence and ask which meaning could describe bait in a bucket." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: The bait was a dozen minnows, and they flicked their tails against the sides of the bucket. Ronan threaded one onto his hook, and Grandpa Alonzo clipped a heavy sinker above it so the minnow would drop deep. \"Cast toward the old stump, and then wind the line in slowly,\" said Grandpa Alonzo.",
      narration: { audio: A("page-2-read"), script: "Here is page two, and it is yours. Read all three sentences out loud. The last sentence carries a word that can be said two ways, and the words around it will tell you which one. Check every word against its sentence as you go." },
      interaction: { type: "speak", text: "The bait was a dozen minnows and they flicked their tails against the sides of the bucket Ronan threaded one onto his hook and Grandpa Alonzo clipped a heavy sinker above it so the minnow would drop deep Cast toward the old stump and then wind the line in slowly said Grandpa Alonzo" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Loon Lake, page three. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is page three. Read along with me, and watch the first sentence closely. Page two asked you to wined the line in, and this page has the same four letters doing a different job. Listen for the reading that the sentence chooses." },
      interaction: { type: "read-along", text: "Ronan cast, but the wind pushed his line sideways, so the minnow landed nowhere near the stump. Nadine studied the water the way Grandpa Alonzo had taught her, watching for the small rings that a feeding fish leaves behind. \"There,\" she said, pointing past the stump, \"right where the water is darkest.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-wind",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page three: the wind pushed his line sideways. Which reading fits?",
      narration: { audio: A("guided-choose-wind"), script: "The same four letters can be said two ways. One way rhymes with find, and it means to turn something around and around, like the handle on a reel. The other way rhymes with pinned, and it means moving air. Page three says the wind pushed his line sideways, so the minnow landed nowhere near the stump. A reader who just said the reel reading on page two might say it again here, and then the sentence falls apart. Reread it and let the words around it decide. Tap the meaning that fits this sentence." },
      interaction: { type: "choose", options: [{ id: "moving-air-a-breeze", label: "moving air, a breeze" }, { id: "to-turn-a-crank-around", label: "to turn a crank around" }, { id: "to-wrap-string-on-a-spool", label: "to wrap string on a spool" }, { id: "to-follow-a-curvy-path", label: "to follow a curvy path" }], correctId: "moving-air-a-breeze", coachWrong: "Something pushed the line sideways before the minnow landed. Reread the sentence and ask which meaning names a thing that can push." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Ronan cast again, and a minute after the minnow dropped beside the stump, the rod tip bent hard and the reel sang as the line ran out. \"Keep the tip up and wind it in!\" called Nadine from the bow.",
      narration: { audio: A("page-4-read"), script: "Here is page four, and it is yours. Two sentences, and both of them carry a word from earlier that can be said two ways. Read them out loud, let the exclamation point come out strong, and check each word against its sentence." },
      interaction: { type: "speak", text: "Ronan cast again and a minute after the minnow dropped beside the stump the rod tip bent hard and the reel sang as the line ran out Keep the tip up and wind it in called Nadine from the bow" },
    },
    {
      id: "guided-choose-stop-and-reread",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence would make you stop and reread page four?",
      narration: { audio: A("guided-choose-stop-and-reread"), script: "A reader rushed through page four and heard herself say four sentences. Three of them match what page four really says. One of them cannot be right, and a careful reader would stop, go back, and reread the page. Four sentences are on your screen. Picture each one happening in the boat, and tap the one that would make you stop." },
      interaction: { type: "choose", options: [{ id: "nadine-called-from-a-ribbon", label: "Nadine called from a ribbon" }, { id: "the-minnow-fell-by-the-stump", label: "the minnow fell by the stump" }, { id: "the-rod-tip-bent-hard", label: "the rod tip bent hard" }, { id: "the-reel-began-to-sing", label: "the reel began to sing" }], correctId: "nadine-called-from-a-ribbon", coachWrong: "That sentence can happen in a rowboat. Reread the four sentences and find the one that names something that is not in the boat at all." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Loon Lake, page five. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is page five, and it is the big moment. Read along with me. The same four letters show up twice on this page, and the sentence around each one decides how it sounds." },
      interaction: { type: "read-along", text: "The fish came up green and gold and fighting, and Grandpa Alonzo leaned over the side with the net, but there was a tear in the mesh as wide as his hand. The fish slid straight through the hole and back into the lake, and for a moment nobody said a word. Then Nadine laughed so hard that the boat rocked, and even Grandpa Alonzo had to wipe a tear from his eye.", audio: A("page-5-read-sentence") },
    },
    {
      id: "model-sentence-check",
      purpose: "model",
      gate: "none",
      prompt: "That sentence cannot be right. Reread the page.",
      fx: {"text":"That sentence **cannot** be right. **Reread** the page.","effect":"underline"},
      narration: { audio: A("model-sentence-check"), script: "Here is the check at the sentence level. A careless reader might say the word in the first sentence the way you say the drop that runs down your cheek. Tier. Then the sentence would say there was a teardrop in the net as wide as his hand. Stop. That sentence cannot be right. So I reread the page, and the next sentence says the fish slid straight through the hole. A hole. The net had a rip in it, so the word rhymes with care. Tare. That was a correct. Now the last sentence. Grandpa Alonzo had to wipe a tier from his eye. Say it the cheek way and check it. Nadine was laughing so hard that the boat rocked, and people laugh until their eyes water. That reading makes sense, so I reread it and keep it. That was a confirm. Two moves, correct or confirm, and both of them begin with a reread." },
    },
    {
      id: "apply-sort-confirm-correct",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Confirm, or Correct? Sort the six readings.",
      narration: { audio: A("apply-sort-confirm-correct"), script: "Six cards are on your screen. Each card tells you how a reader said a word, spelled the way it sounded, and then the words around it in the sentence. Read the card, reread the sentence in your head, and decide. If the way the reader said it fits those words, drag the card to Confirm. If the sentence needs the other reading, drag the card to Correct." },
      interaction: { type: "sort", buckets: ["Confirm","Correct"], items: [{ label: "said tare, a tear in the net", bucket: "Confirm" }, { label: "said bo, the bow of the boat", bucket: "Correct" }, { label: "said teer, a tear on a cheek", bucket: "Confirm" }, { label: "said liv, the live bait", bucket: "Correct" }, { label: "said wined, wind the line in", bucket: "Confirm" }, { label: "said reed, read it last week", bucket: "Correct" }], coachWrong: "Say the word the way the reader said it, then reread the rest of the card. Does that reading fit those words, or does it need the other one?" },
    },
    {
      id: "apply-choose-context-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Grandpa Alonzo kept the boat close, only a few feet from the reeds, so the fish would not be scared off. Which words settle the word close?",
      narration: { audio: A("apply-choose-context-clue"), script: "Here is a sentence from the ride home that is not on your pages, and it carries a fresh word that can be said two ways. One way rhymes with nose, as in close the door. The other way rhymes with dose, as in close to home. Grandpa Alonzo kept the boat close, only a few feet from the reeds, so the fish would not be scared off. Which reading fits, and which words in the sentence settle it? Four pieces of the sentence are on your screen. Tap the piece that settles the reading." },
      interaction: { type: "choose", options: [{ id: "only-a-few-feet-from", label: "only a few feet from" }, { id: "kept-the-boat", label: "kept the boat" }, { id: "so-the-fish-would-not", label: "so the fish would not" }, { id: "be-scared-off", label: "be scared off" }], correctId: "only-a-few-feet-from", coachWrong: "Reread the sentence. Which piece tells you where the boat was, and how far it was from something?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: \"That was the biggest fish this lake has ever seen,\" said Ronan, \"and I am going to tell everybody.\" \"Then you had better tell them about the net too,\" said Grandpa Alonzo, and he rowed them home in the morning light.",
      narration: { audio: A("page-6-read"), script: "Here is the last page, and it is yours. Read both sentences out loud, and keep the check running. Every word against its sentence, and every sentence against the page." },
      interaction: { type: "speak", text: "That was the biggest fish this lake has ever seen said Ronan and I am going to tell everybody Then you had better tell them about the net too said Grandpa Alonzo and he rowed them home in the morning light" },
    },
    {
      id: "challenge-speak-read-and-settle",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read it out loud: Ronan wound the wet line around the reel, round and round, until it was tight. Then say what wound means here, and which words settle it.",
      narration: { audio: A("challenge-speak-read-and-settle"), script: "Now the check is all yours, out loud. A sentence is on your screen, and it carries a word that can be said two ways. Tap the mic, read the sentence out loud, and then tell me what that word means in this sentence, and which words settled it for you." },
      interaction: { type: "speak", text: "wrapped wrap wrapping wraps turned turn turning around round circled circle twisted twist coiled coil looped loop rolled reel line tight winding" },
    },
    {
      id: "celebrate-does-that-make-sense",
      purpose: "celebrate",
      gate: "none",
      prompt: "Confirm or correct. Either way, you reread.",
      fx: {"text":"Does that make **sense**?","effect":"fireworks"},
      narration: { audio: A("celebrate-does-that-make-sense"), script: "You read a whole trip on Loon Lake today, and you caught every word that could be said two ways. When a reading fit its sentence, you reread it and confirmed it. When a sentence could not be right, you reread the page and corrected it. That quiet question, does that make sense, runs under every page a strong reader reads. Keep it running in every book this week." },
    },
  ],
};
