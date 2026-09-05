import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./words-in-action-timings.json";

// Words in Action (L.3.5b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=words-in-action
// G3-U2 word-work lesson. REAL-LIFE CONNECTION tier of L.3.5: a describing
// word is yours when you can point to it in real life with three parts, the
// WORD, a real-life EXAMPLE (a person, a moment, or a place), and the
// BECAUSE that ties them. The G3 step-up over the K-2 siblings: precise
// tier-2 words (considerate, frustrating, cramped, cooperative, exhausting,
// grateful, cluttered, reliable) instead of friendly/helpful, the spoken
// "because" explanation, the NON-EXAMPLE check (doing the thing only after
// three reminders is not cooperative; moving a bag only when told is not
// considerate), and producing an example from the child's own life.
// Sibling split honored: words-in-real-life (L.1.5c) owns noisy/cozy/
// slippery/fresh/heavy/fragile, words-in-your-world (L.2.5a) owns juicy/
// cheer/squishy/whisper/crunchy/spicy/sticky, category-captain and
// word-families-friends own categories, just-right-words and strong-words
// own shades of meaning (L.3.5c stays in Unit 3, no shades here),
// why-they-did-it (RL.3.3) owns traits from a story character's actions
// (determined/careless/grumpy/shy/generous/patient/helpful/kind/brave and
// its accept lists are burned), the-authors-view owns loaded words. THIS
// owns the word-example-because move on real life, not on a story character.
// ONE scene: the Saturday spring cleanup of the vacant lot on Alder Street
// (Ingrid, Yusuf, little cousin Cyrus, Mr. Delgado with the pickup, Mrs.
// Novak with the lemonade). Two dense 5-sentence read-alongs (page one:
// considerate / cramped / frustrating; page two: cooperative / grateful /
// exhausting / cluttered), compound + early-complex sentences, two tagged
// dialogue lines, no digits, no contractions inside read-along text, plus a
// 2-sentence accept-mode child read (reliable). ANCHOR FRESHNESS grep-swept
// across all of lessons-v2 + quizzes-v2 before writing: considerate,
// frustrating, cramped, cooperative, exhausting, grateful, cluttered,
// reliable, vacant lot, tool shed, mattress, Alder Street, cleanup are
// catalog-first (crowded appears as incidental prose in five files and was
// swapped for cramped; generous, cautious, reluctant, eager, patient, calm,
// curious, sturdy, fragile, cozy, noisy found burned and avoided); names
// Ingrid, Yusuf, Cyrus, Delgado, Novak fresh. Keys prefixed quiz- are fresh
// picture supports for the quiz (energetic puppy, spacious gym, flimsy
// plate). Tiles lowercase, audio-free, kebab ids, 28-char cap; speak texts
// carry no " my "; speak scenes imageless.

const A = (id: string) => `/audio/lessons-v2/words-in-action/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/words-in-action/${w.toLowerCase()}.png`;

export const wordsInActionImages: Record<string, string | { subject: string; ref?: string }> = {
  "lot-morning": "A sunny weedy vacant lot at the end of a quiet street of small houses, a few old car tires and plastic bottles lying in the tall grass, a young girl with a blond braid in a green sweatshirt handing a pair of yellow work gloves to a young boy with short black hair in a blue T-shirt, a small red pickup truck with its tailgate down parked at the curb, and a man with a gray mustache and a tan cap standing beside the truck holding a roll of black trash bags. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "tool-shed": { subject: "The inside of a tiny wooden tool shed packed shoulder to shoulder with four people, the same young girl with a blond braid in a green sweatshirt and the same young boy with short black hair in a blue T-shirt squeezed between two grown-ups, rakes and brooms leaning against every wall, elbows bumping the walls, one bare lightbulb hanging overhead. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "lot-morning" },
  "lot-noon": { subject: "The same vacant lot at midday, now completely clean short green grass with nothing on it except a black and white soccer ball in the middle, no tires and no bottles anywhere in the grass, a tall pile of tied black trash bags stacked at the curb beside the same small red pickup truck, an elderly woman with white hair in a purple cardigan carrying a glass pitcher of yellow lemonade along the sidewalk, and the same young girl with a blond braid in a green sweatshirt wiping her forehead with the back of her hand. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "lot-morning" },
  "quiz-puppy-energetic": "A small brown puppy sprinting across a green backyard lawn with all four paws off the ground and its ears flying back, mouth open and tongue out in a natural running dog expression, a plain red ball bouncing just ahead of it, a wooden fence and blue sky behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-empty-gym-spacious": "A huge empty school gym with a shiny wooden floor, a high ceiling, a basketball hoop at each far end, tall windows letting in light, and one small girl with curly hair standing alone in the middle of the floor with her arms spread wide, no banners on the walls. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-flimsy-plate": "A thin white paper plate bending and folding in the middle under a big heavy slice of red watermelon, a child's two hands holding the edges of the plate as the watermelon slides toward the grass, a sunny picnic lawn with a checkered blanket behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const wordsInAction: LessonDef = {
  id: "words-in-action",
  title: "Words in Action",
  grade: "3rd Grade",
  standard: "L.3.5b",
  archetype: "vocabulary",
  objective: "I can point to a describing word in real life and explain why the example fits.",
  concepts: [
    "a word is yours when you can point to it in real life",
    "three parts: the word, a real-life example, and the because",
    "a describing word can fit a person, a moment, or a place",
    "the because is what makes the word fit",
    "a non-example looks like it fits, but its because is false",
    "you can give your own real-life example for a word",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you took describing words off the page and pointed to them in real life. For every word you found an example and a because, you caught a non-example when the because was false, and you gave a word an example from your own life. That is how a word becomes yours.",
    "title": "Word Owner!",
    "body": "You matched precise words to real people, moments, and places, and you proved every one with a because."
  },
  scenes: [
    {
      id: "hook-read-cleanup-morning",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one of the cleanup. Read along!",
      image: IMG("lot-morning"),
      narration: { audio: A("hook-read-cleanup-morning"), script: "Hello, reader. A third grader does not just learn what a describing word means. You point to it in real life, to a person you know, a moment you lived, or a place you have stood in. The pointing starts on a Saturday morning on Alder Street. Read along with me, and watch three precise words show up in real life." },
      interaction: { type: "read-along", text: "On Saturday morning the whole block met at the vacant lot at the end of Alder Street for the spring cleanup, and Mr. Delgado handed out trash bags from the back of his red pickup. Yusuf had forgotten his gloves at home, so Ingrid pulled a spare pair out of her pocket and slid them over to him without saying a word, which was the most considerate thing anybody did all morning. The tool shed was so cramped that when four people stepped inside for rakes, nobody could lift an elbow without bumping a wall. Yusuf's first bag tore on a branch, and his second bag tore on the same branch, so every can he had collected rolled down the hill into the weeds. \"That is the most frustrating thing I have ever seen,\" he said, and he sat down on the curb to laugh instead of cry.", audio: A("hook-read-cleanup-morning-sentence") },
    },
    {
      id: "model-word-example-because",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the word, the example, the because.",
      fx: {"text":"the **word**, the **example**, the **because**","effect":"pop-words"},
      narration: { audio: A("model-word-example-because"), script: "Here is what a third grader does with a describing word. You do not stop at what it means. You point to it in real life, and that takes three parts. The word. A real-life example. And the because. Watch me with considerate. Considerate means noticing what another person needs and taking care of it before they have to ask. The example is Ingrid on page one. Yusuf forgot his gloves, and she slid her spare pair over to him without saying a word. Now the because, and this is the part that makes the word yours. Ingrid is considerate because she noticed what Yusuf needed and took care of it before he had to ask. The word, the example, the because. When all three fit together, you own that word." },
    },
    {
      id: "model-place-cramped",
      purpose: "model",
      gate: "none",
      prompt: "A describing word can fit a place, too.",
      image: IMG("tool-shed"),
      narration: { audio: A("model-place-cramped"), script: "A describing word can fit a person, a moment, or a place. Cramped fits a place. Cramped means so small or so full that there is no room to move. The example is the tool shed. Four people stepped inside for rakes, and nobody could lift an elbow without bumping a wall. The because is easy to say now. The shed is cramped because four people filled it and nobody could move. Now test the same word on the vacant lot itself, wide open with weeds and room to run. Cramped does not fit there, because the because falls apart. There was space to spare. A word only fits when its because is true." },
    },
    {
      id: "guided-choose-example-frustrating",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which real-life moment fits frustrating?",
      narration: { audio: A("guided-choose-example-frustrating"), script: "Your turn with frustrating. Frustrating describes a moment when something keeps going wrong no matter how hard you try, like Yusuf's bag tearing twice on the same branch. Four real-life moments are on your screen, and only one of them is frustrating. Read each one, say the because in your head, and tap the moment that fits." },
      interaction: { type: "choose", options: [{ id: "a-zipper-stuck-halfway-twice", label: "a zipper stuck halfway twice" }, { id: "a-bus-right-on-time", label: "a bus right on time" }, { id: "a-puppy-asleep-in-the-sun", label: "a puppy asleep in the sun" }, { id: "a-cake-with-three-layers", label: "a cake with three layers" }], correctId: "a-zipper-stuck-halfway-twice", coachWrong: "Test the because. Is that a moment where something kept going wrong no matter how hard you tried?" },
    },
    {
      id: "guided-choose-why-considerate",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why does considerate fit Ingrid?",
      narration: { audio: A("guided-choose-why-considerate"), script: "Now the because, and you build it. Ingrid is considerate. That is the word and the example. Four reasons are on your screen, and every one of them could be true, but only one is the reason the word fits. Tap the because that makes considerate fit." },
      interaction: { type: "choose", options: [{ id: "she-noticed-what-he-needed", label: "she noticed what he needed" }, { id: "she-had-two-pairs-of-gloves", label: "she had two pairs of gloves" }, { id: "she-got-to-the-lot-first", label: "she got to the lot first" }, { id: "she-finished-her-bag-first", label: "she finished her bag first" }], correctId: "she-noticed-what-he-needed", coachWrong: "That could be true, but it does not explain the word. Considerate is about another person. Which reason is about Yusuf?" },
    },
    {
      id: "guided-sort-cramped",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the places: Example or Not an Example of cramped.",
      narration: { audio: A("guided-sort-cramped"), script: "Now cramped, the place word. Six places are on your screen. Say the because for each one. If the place is so small or so full that nobody can move, drag it to Example. If there is room to spare, drag it to Not an Example." },
      interaction: { type: "sort", buckets: ["Example","Not an Example"], items: [{ label: "a tent holding five people", bucket: "Example" }, { label: "an empty gym before school", bucket: "Not an Example" }, { label: "a closet you squeeze into", bucket: "Example" }, { label: "a beach with nobody on it", bucket: "Not an Example" }, { label: "a car full of six cousins", bucket: "Example" }, { label: "a wide field of cut hay", bucket: "Not an Example" }], coachWrong: "Picture yourself standing in that place. Can you stretch both arms out, or would you bump something?" },
    },
    {
      id: "apply-read-cleanup-noon",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, by noon. Read along!",
      image: IMG("lot-noon"),
      narration: { audio: A("apply-read-cleanup-noon"), script: "Back to Alder Street. Page two happens by noon, and four more precise words are living in it, each one with a real-life example. Read along with me, and for each word, find its example and say the because." },
      interaction: { type: "read-along", text: "By noon the pile of bags at the curb was taller than Cyrus, and the group was so cooperative that when a soggy mattress needed lifting, six neighbors grabbed a corner or a side before anyone even asked. Mrs. Novak, who had lived on Alder Street for fifty years, walked up and down the sidewalk with a pitcher of lemonade because she was grateful for every single helper. The work was exhausting, and by the time the last bag was tied, Ingrid's arms ached and her socks were soaked through. \"Look at this place now,\" said Mr. Delgado, and the lot that had been cluttered with tires and bottles at nine was nothing but grass and a soccer ball. Yusuf said his legs felt like wet noodles, but he still raced Cyrus to the truck.", audio: A("apply-read-cleanup-noon-sentence") },
    },
    {
      id: "apply-choose-word-cooperative",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which precise word fits this moment?",
      narration: { audio: A("apply-choose-word-cooperative"), script: "Now turn the move around. Here is a moment from page two. Six neighbors grabbed a corner or a side of the mattress before anyone even asked. Four precise words from the page are on your screen. Say the because for each one, and tap the word that fits this moment." },
      interaction: { type: "choose", options: [{ id: "cooperative", label: "cooperative" }, { id: "exhausting", label: "exhausting" }, { id: "grateful", label: "grateful" }, { id: "cluttered", label: "cluttered" }], correctId: "cooperative", coachWrong: "Read the moment again. Six people worked together before anyone asked. Which word is about working together?" },
    },
    {
      id: "apply-choose-word-exhausting",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which precise word fits this moment?",
      narration: { audio: A("apply-choose-word-exhausting"), script: "One more moment from page two. By the time the last bag was tied, Ingrid's arms ached and her socks were soaked through. The same four words are on your screen. Tap the one whose because is true for this moment." },
      interaction: { type: "choose", options: [{ id: "cooperative", label: "cooperative" }, { id: "exhausting", label: "exhausting" }, { id: "grateful", label: "grateful" }, { id: "cluttered", label: "cluttered" }], correctId: "exhausting", coachWrong: "Aching arms and soaked socks after hours of work. Which word describes work that wears you out?" },
    },
    {
      id: "model-non-example",
      purpose: "model",
      gate: "none",
      prompt: "The trap: an example whose because is false.",
      fx: {"text":"help after **three reminders** is not cooperative","effect":"cross-out"},
      narration: { audio: A("model-non-example"), script: "Here is the trap, and it catches a lot of readers. Sometimes an example looks like it fits, but the because is false. Watch me. Cyrus dragged a tire to the pile, but only after Mr. Delgado asked him three times. Some readers would call Cyrus cooperative. Test the because. Cooperative means working together willingly, the way the six neighbors did before anyone asked. Cyrus did the work, but he did not do it willingly, so the because is false. That is a non-example. Dragging a tire after three reminders looks like helping, but it is not cooperative. A strong reader checks the because before the word gets to stay." },
    },
    {
      id: "apply-choose-not-considerate",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which moment does NOT show considerate?",
      narration: { audio: A("apply-choose-not-considerate"), script: "Your turn to catch a non-example. Considerate means noticing what another person needs and taking care of it before they have to ask. Here are four moments. Yusuf held the door for the movers when their arms were full. Ingrid saved the last slice of pizza for her dad, who was working late. Cyrus let the little ones go first at the slide. And a boy on the bus moved his backpack off the seat, but only after the driver told him twice. Three of those show considerate. Tap the one that does not." },
      interaction: { type: "choose", options: [{ id: "moved-his-bag-when-told-to", label: "moved his bag when told to" }, { id: "held-the-door-for-the-movers", label: "held the door for the movers" }, { id: "saved-the-last-slice-for-dad", label: "saved the last slice for dad" }, { id: "let-the-little-ones-go-first", label: "let the little ones go first" }], correctId: "moved-his-bag-when-told-to", coachWrong: "That one shows considerate. The person noticed what someone needed and acted before being asked. Find the moment where that because is false." },
    },
    {
      id: "apply-choose-why-not-considerate",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why is that moment NOT considerate?",
      narration: { audio: A("apply-choose-why-not-considerate"), script: "You caught it. Now say why, because a non-example is only worth catching if you can explain it. The boy moved his backpack off the seat, but the word considerate does not fit. Four reasons are on your screen. Tap the because that shows why the word fails." },
      interaction: { type: "choose", options: [{ id: "he-waited-to-be-told", label: "he waited to be told" }, { id: "the-seat-was-already-empty", label: "the seat was already empty" }, { id: "he-was-in-the-back-row", label: "he was in the back row" }, { id: "his-bag-was-very-small", label: "his bag was very small" }], correctId: "he-waited-to-be-told", coachWrong: "Considerate means acting before someone has to ask. Which reason is about being asked?" },
    },
    {
      id: "apply-speak-read-reliable",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Yusuf was reliable all morning because every time Mr. Delgado needed a bag held open, he was already there holding it. At home he is the one who feeds the dog before anyone asks.",
      narration: { audio: A("apply-speak-read-reliable"), script: "One more precise word, and these two sentences are yours to read. Reliable means you can count on that person every single time. Read both sentences out loud, clearly and with feeling, and listen for the because inside them." },
      interaction: { type: "speak", text: "Yusuf was reliable all morning because every time Mr Delgado needed a bag held open he was already there holding it At home he is the one who feeds the dog before anyone asks" },
    },
    {
      id: "challenge-speak-own-frustrating",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell about a moment that was frustrating, and say why it fits.",
      narration: { audio: A("challenge-speak-own-frustrating"), script: "Last one, and it comes from your own life. Think of a real moment at home or at school when something kept going wrong no matter how hard you tried. Tap the mic, tell me what happened, and then say why the word frustrating fits that moment. Use the word because." },
      interaction: { type: "speak", text: "frustrating frustrated stuck could would not broke broken lost tangled homework puzzle zipper waited wait tried again hard wrong mad annoyed upset forgot dropped game computer keep kept fell crashed level knot shoelace shoe tie tied because" },
    },
    {
      id: "celebrate-words-in-action",
      purpose: "celebrate",
      gate: "none",
      prompt: "The word, the example, the because.",
      fx: {"text":"Point to the word in **real life**","effect":"fireworks"},
      narration: { audio: A("celebrate-words-in-action"), script: "Today you took describing words off the page and pointed to them in real life. For every word you found an example, a person, a moment, or a place, and then you said the because that made the word fit. You caught a non-example when the because was false. And you gave frustrating an example from your own life. That is what it means to own a word, and every precise word you meet from now on is waiting for you to do the same." },
    },
  ],
};
