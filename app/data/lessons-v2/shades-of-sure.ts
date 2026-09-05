import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./shades-of-sure-timings.json";

// Shades of Sure (L.3.5c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=shades-of-sure
// G3-U3 word-work lesson. THE DIAL tier of shades of meaning: words that mean
// almost the same thing sit at different SPOTS, and for words about what
// happens INSIDE a person the spot is set by two questions. On the SURE dial
// (wondered, suspected, believed, knew) the spot is how much PROOF the person
// has: no clue at all, one small clue, a strong reason without seeing it,
// seen with your own eyes. On the FEELING dial (carefree, uneasy, worried,
// frantic) the spot is how BIG the feeling is and what it makes the person
// do. A third grader (1) orders each dial weakest to strongest, (2) picks the
// word whose spot fits a sentence's clues, (3) sorts new words by which dial
// they belong to, and (4) explains two NEIGHBORS on a dial by naming the
// thing that grows between them. Sibling split honored: word-ladders
// (L.2.5b) owns the G2 ladders of visible actions and sizes (pull/tug/yank,
// cry/sob/wail, smart/clever/brilliant + its quiz's like/love/adore,
// dirty/filthy/spotless, thin/slender/skinny, surprise sizes), just-right-words
// (L.1.5) peek/look/stare, big/huge/gigantic, walk/march/stomp, warm/hot,
// whisper/talk/shout, strong-words (L.1.5d) toss/throw/hurl, tap/knock/pound,
// giggle/laugh/howl, damp/wet/dripping, big-kid-words (K.L.6) on/under/next
// to, why-they-did-it (RL.3.3) owns traits read from a character's actions
// (determined/careless/grumpy/shy/generous/patient/helpful/kind/brave, bored,
// discouraged, excited, relaxed all avoided), words-in-action (L.3.5b) owns
// word/example/because, word-connections (L.3.5) owns near-same vs opposite;
// THIS owns the ORDER between near-same words for states of mind and
// certainty, and the proof-or-size question that sets it. ONE story: the
// Saturday Bandit the ferret went missing (Louisa, her brother Cosmo, Mom,
// the shoes by the front door, striped socks in the hall, the laundry room
// with the washing machine and the tall hamper). Two dense read-alongs (page
// one: carefree / wondered / uneasy / suspected + tagged dialogue; page two:
// worried / believed / frantic / knew) and a 2-sentence accept-mode child
// read (page three: relieved / overjoyed), compound + early-complex, no
// digits, no contractions inside read-along text, no " my " in any speak
// text. ANCHOR FRESHNESS python-swept across all of lessons-v2 + quizzes-v2
// (tiles, sort/sequence items, accept lists, prose) BEFORE writing: wondered,
// suspected, believed, carefree, uneasy, frantic, doubted, assumed, was
// positive, jittery, miserable, overjoyed, ferret, Bandit, hamper, latch,
// washing machine, striped socks, Louisa, Cosmo 0 tile hits (knew = the
// standard's own example word, only a sentence-read token elsewhere; worried
// = an answer tile in three story quizzes, kept because the standard's own
// dial needs it and no fresh word sits between uneasy and frantic); calm,
// nervous, glad, pleased, delighted, thrilled, elated, relieved-as-tile,
// happy, scared, terrified, anxious, hopeful, confident, sure-as-tile,
// unsure, glum, dryer, closet, cushions, couch, yard found carried and
// avoided. Keys prefixed quiz- are fresh picture supports for the quiz (the
// muddy prints on Aunt Lucinda's floor: Harriet and cousin Rupert). Tiles
// lowercase, audio-free, kebab ids, 28-char cap; model scenes gate none;
// speak scenes imageless; every narration under about eight hundred
// characters with no list-shaped ladder (each dial word gets its own short
// sentence).

const A = (id: string) => `/audio/lessons-v2/shades-of-sure/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/shades-of-sure/${w.toLowerCase()}.png`;

export const shadesOfSureImages: Record<string, string | { subject: string; ref?: string }> = {
  "cage-open": "A cozy child's bedroom in the morning, a young girl with light brown skin and a short black bob haircut wearing a purple hoodie kneeling beside a small wire pet cage on the floor, the little cage door swung wide open and the cage completely empty inside, a few pairs of sneakers lined up by an open bedroom doorway, two striped blue and white socks lying on the wooden hallway floor beyond the door, no animal anywhere in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "laundry-search": { subject: "A small bright laundry room with a white washing machine against the wall, the same young girl with light brown skin and a short black bob haircut in a purple hoodie on her knees pulling towels out of a tall round wicker hamper, four or five towels flung across the floor around her, her mouth open as if calling out, a young boy with light brown skin and curly black hair in a green T-shirt standing in the doorway pointing at the washing machine, no animal anywhere in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "cage-open" },
  "quiz-muddy-prints": "A clean pale tile kitchen floor seen from above at an angle, a trail of large brown muddy boot prints crossing from an open back door to a wooden table, a small gray cat sitting on a chair with its paws tucked under and its mouth closed, a natural cat face with no smile, no people in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-boots-by-door": "A pair of tall green rubber rain boots standing on a woven doormat just inside an open back door, thick wet brown mud caked on the soles and dripping onto the mat, gray rain falling outside the door, no people in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-harriet-looking": { subject: "The same clean pale tile kitchen with the trail of muddy boot prints, a young girl with dark brown skin and two braided pigtails tied with yellow ribbons, wearing a red sweater, crouching low with her chin resting on her hand and her eyes narrowed while she studies one of the muddy prints closely, a tall boy with dark brown skin and short hair in a blue jacket standing behind her with both hands held up and palms out, rain on the window behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-muddy-prints" }
};

export const shadesOfSure: LessonDef = {
  id: "shades-of-sure",
  title: "Shades of Sure",
  grade: "3rd Grade",
  standard: "L.3.5c",
  archetype: "vocabulary",
  objective: "I can put words about how sure a person is, or how big a feeling is, in order from weakest to strongest, pick the word that fits the clues, and explain the difference between two neighbors.",
  concepts: [
    "words that mean almost the same thing sit at different spots on a dial",
    "on the sure dial, the spot is set by how much proof the person has",
    "on the feeling dial, the spot is set by how big the feeling is",
    "the clues in a sentence tell you which spot fits",
    "two neighbors on a dial differ by the thing that grows between them",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you learned that words which mean almost the same thing still sit in different spots on a dial. On the sure dial, the spot depends on proof. On the feeling dial, the spot depends on how big the feeling is. You built both dials, you matched clues to the right spot, and you explained the difference between two neighbors. From now on, when a word like these shows up, find its spot.",
    "title": "Dial Reader!",
    "body": "You ordered sure words and feeling words from weakest to strongest, matched clues to the right spot, and explained two neighbors on the dial."
  },
  scenes: [
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one of the missing ferret. Read along!",
      image: IMG("cage-open"),
      narration: { audio: A("hook-read-page-one"), script: "Hello, reader. Some words mean almost the same thing, but they do not sit in the same spot. Today the spot is on a dial, and the dial measures two things, how sure a person is, and how big a feeling is inside them. The dial starts turning on a Saturday morning at Louisa's house, where a ferret named Bandit has gone missing. Read along with me, and watch Louisa climb the sure dial one step at a time." },
      interaction: { type: "read-along", text: "On Saturday morning Louisa found the door of Bandit's cage hanging open, and the ferret was not inside. At first she felt carefree about it, because Bandit slipped out almost every week and always turned up asleep in a shoe, so she only wondered which shoe it would be this time. When every shoe by the front door turned up empty, she began to feel uneasy, as if something small had gone wrong. Then she spotted one of her striped socks in the hall and another by the laundry room door, and she suspected that Bandit had dragged them there, because he loved socks more than anything. \"He could be anywhere by now,\" said Cosmo from the kitchen, and Louisa did not feel carefree anymore.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-sure-dial",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the dial for how sure.",
      fx: {"text":"wondered, suspected, believed, **knew**","effect":"pop-words"},
      narration: { audio: A("model-sure-dial"), script: "Here is the first dial, and it measures how sure a person is. Each word on it needs a different amount of proof. Wondered is the lowest spot. When Louisa wondered which shoe Bandit was in, she had no clue at all, only a question. Suspected is one step up. A small clue, two socks in the hall, made her think that maybe he was in the laundry room. Believed is higher still. You believe something when you have a strong reason, like a person you trust telling you they saw it, even though you have not seen it yourself. Knew is the top of the dial. You know something when you have seen it with your own eyes or you hold the proof in your hands. So the question for every word on this dial is the same. How much proof does the person have?" },
    },
    {
      id: "guided-sequence-sure-dial",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the sure dial, least sure to most sure.",
      narration: { audio: A("guided-sequence-sure-dial"), script: "Your turn to build the dial. The four sure words from Louisa's morning are on your screen, but they are mixed up. Think about how much proof each word needs, and drag them into order, from the word with no clue at all to the word with proof in hand." },
      interaction: { type: "sequence", items: [{ id: "wondered", label: "wondered" }, { id: "suspected", label: "suspected" }, { id: "believed", label: "believed" }, { id: "knew", label: "knew" }], order: ["wondered","suspected","believed","knew"], coachWrong: "Ask how much proof each word needs. No clue at all goes first, and proof in hand goes last." },
    },
    {
      id: "guided-choose-sure-fits",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sure word fits the clues?",
      narration: { audio: A("guided-choose-sure-fits"), script: "Time to pick the word whose spot fits the clues. Here is a new moment from that morning. Louisa found a single flake of cereal on the pantry floor. Bandit liked cereal, but so did Cosmo, and nobody had seen the ferret yet. Four words from the sure dial are on your screen. Ask how much proof she has, and tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "wondered", label: "wondered" }, { id: "suspected", label: "suspected" }, { id: "believed", label: "believed" }, { id: "knew", label: "knew" }], correctId: "suspected", coachWrong: "Count the proof. One small clue that could point two ways, and nobody has seen him. Find the spot on the dial that a small clue earns." },
    },
    {
      id: "model-feeling-dial",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the dial for how big a feeling is.",
      fx: {"text":"carefree, uneasy, worried, **frantic**","effect":"pop-words"},
      narration: { audio: A("model-feeling-dial"), script: "The second dial measures how big a feeling is inside a person. Louisa's feeling this morning was worry, and it climbed. Carefree is the lowest spot. When the cage was open, she felt carefree, with no worry at all, because Bandit always turned up. Uneasy is one step up. When the shoes were empty, something small felt wrong, a little flutter in her stomach. Worried is higher. Worried means the trouble fills your thoughts and you cannot stop turning it over. Frantic is the top of the dial. Frantic means the feeling is so big that you rush from place to place and cannot think straight. The question for this dial is different. How big is the feeling, and what is it making the person do?" },
    },
    {
      id: "guided-sequence-feeling-dial",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Build the feeling dial, smallest to biggest.",
      narration: { audio: A("guided-sequence-feeling-dial"), script: "The second dial is yours to build. The four feeling words are on your screen, mixed up. Ask how big the feeling is in each one, and drag them into order, from no worry at all to worry so big that you cannot think straight." },
      interaction: { type: "sequence", items: [{ id: "carefree", label: "carefree" }, { id: "uneasy", label: "uneasy" }, { id: "worried", label: "worried" }, { id: "frantic", label: "frantic" }], order: ["carefree","uneasy","worried","frantic"], coachWrong: "Start with the word that means no worry at all, and end with the word that has the person rushing everywhere." },
    },
    {
      id: "guided-sort-sure-or-feeling",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the words: Sure Words or Feeling Words.",
      narration: { audio: A("guided-sort-sure-or-feeling"), script: "There are two dials, so there are two kinds of words. Six new words are on your screen. Some of them tell how sure a person is, and some tell what a person feels inside. For each one, ask whether it is about proof or about a feeling. Drag the words about proof to Sure Words, and drag the words about feelings to Feeling Words." },
      interaction: { type: "sort", buckets: ["Sure Words","Feeling Words"], items: [{ label: "doubted", bucket: "Sure Words" }, { label: "jittery", bucket: "Feeling Words" }, { label: "assumed", bucket: "Sure Words" }, { label: "miserable", bucket: "Feeling Words" }, { label: "was positive", bucket: "Sure Words" }, { label: "overjoyed", bucket: "Feeling Words" }], coachWrong: "Ask what the word is about. Does it tell how much proof someone has, or does it tell how they feel inside?" },
    },
    {
      id: "apply-read-page-two",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, by noon. Read along!",
      image: IMG("laundry-search"),
      narration: { audio: A("apply-read-page-two"), script: "Back to Louisa's house. Page two happens by noon, and both dials keep climbing. Read along with me, and each time a dial word shows up, ask what proof she has, or how big the feeling has grown." },
      interaction: { type: "read-along", text: "By noon Louisa was worried, because the back door had been open all morning and she kept picturing Bandit out in the wet grass with the dog from next door. Cosmo, who never made up stories, said he had seen a long brown tail slide behind the washing machine, and she believed him, even though she had not seen the ferret with her own eyes. When a whole hour passed with no sign of him, she became frantic, tearing every towel out of the tall hamper and calling his name until her voice cracked. Then two black eyes blinked up at her from the very bottom of the hamper, and she knew.", audio: A("apply-read-page-two-sentence") },
    },
    {
      id: "apply-choose-sure-fits-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which sure word fits Louisa here?",
      narration: { audio: A("apply-choose-sure-fits-two"), script: "Here is a fresh moment from that afternoon. Mom called down the hall that she had just seen Bandit dart under the big chair, but Louisa was still in the laundry room and had not seen him herself. Four words from the sure dial are on your screen. Ask how much proof Louisa has, and tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "wondered", label: "wondered" }, { id: "suspected", label: "suspected" }, { id: "believed", label: "believed" }, { id: "knew", label: "knew" }], correctId: "believed", coachWrong: "A person she trusts saw it, but her own eyes have not. Find the spot on the dial that a strong reason earns before the proof." },
    },
    {
      id: "apply-choose-feeling-fits",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which feeling word fits the clues?",
      narration: { audio: A("apply-choose-feeling-fits"), script: "The feeling dial comes next, with another fresh moment. Louisa had checked every room twice, her hands were shaking, and she was pulling the blankets off every bed while she called his name over and over. Four feeling words are on your screen. Ask how big the feeling is and what it is making her do, then tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "carefree", label: "carefree" }, { id: "uneasy", label: "uneasy" }, { id: "worried", label: "worried" }, { id: "frantic", label: "frantic" }], correctId: "frantic", coachWrong: "Look at what the feeling is making her do. Shaking hands and rushing from bed to bed is not a small flutter, and it is not only thinking. Find the top of the dial." },
    },
    {
      id: "model-neighbors",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: two neighbors on the dial.",
      fx: {"text":"**suspected** and **believed** are neighbors","effect":"underline"},
      narration: { audio: A("model-neighbors"), script: "Two words that sit next to each other on the dial are the hardest to tell apart, so here is how I do it. Suspected and believed are neighbors. Both of them mean Louisa thought Bandit was in the laundry room. The difference is the size of the reason. With suspected, the reason was small, two socks on the floor. With believed, the reason was strong, a brother she trusted saying he saw the tail. The feeling dial works the same way. Uneasy and worried are neighbors, and the difference is how much room the feeling takes up. Uneasy is a small flutter. Worried fills your whole head. When you explain two neighbors, name the thing that grows between them, the proof or the size of the feeling." },
    },
    {
      id: "apply-choose-neighbor",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which clue fits believed, not knew?",
      narration: { audio: A("apply-choose-neighbor"), script: "Your turn with two neighbors. Believed and knew sit side by side at the top of the dial. Four clues are on your screen, and each one fits a different spot. Tap the clue that fits believed, and not knew." },
      interaction: { type: "choose", options: [{ id: "cosmo-saw-the-tail-go-in", label: "cosmo saw the tail go in" }, { id: "she-saw-him-in-the-hamper", label: "she saw him in the hamper" }, { id: "one-sock-lay-in-the-hall", label: "one sock lay in the hall" }, { id: "no-clue-at-all-yet", label: "no clue at all yet" }], correctId: "cosmo-saw-the-tail-go-in", coachWrong: "Believed needs a strong reason without seeing it. Knew needs your own eyes. Which clue is a strong reason that Louisa did not see for herself?" },
    },
    {
      id: "apply-speak-read-page-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Louisa lifted Bandit out of the hamper with a sock still hanging from his mouth. She was so relieved that her knees wobbled, and by dinner she was overjoyed, because Cosmo had helped her fix the latch on the cage.",
      narration: { audio: A("apply-speak-read-page-three"), script: "Page three is yours to read. Two sentences are on your screen, and the feeling dial swings all the way from worry to joy inside them. Read both sentences out loud, clearly and with feeling." },
      interaction: { type: "speak", text: "Louisa lifted Bandit out of the hamper with a sock still hanging from his mouth She was so relieved that her knees wobbled and by dinner she was overjoyed because Cosmo had helped her fix the latch on the cage" },
    },
    {
      id: "challenge-speak-neighbors",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell the difference between suspected and knew. Use a clue.",
      narration: { audio: A("challenge-speak-neighbors"), script: "Last one, and you explain it. Suspected and knew sit on the same dial, but not in the same spot. Tap the mic and tell me the difference between them. Say what a person has when they suspect something, and what they have when they know it. A clue from Bandit's story or from your own life will help." },
      interaction: { type: "speak", text: "suspected suspect believed believe knew know knows clue clues small little proof saw seen sure surer certain maybe think thought guess hunch eyes evidence more less stronger weaker sock socks hamper tail question wondered" },
    },
    {
      id: "celebrate-shades-of-sure",
      purpose: "celebrate",
      gate: "none",
      prompt: "Two dials: how sure, and how big.",
      fx: {"text":"Find the word's **spot** on the dial","effect":"fireworks"},
      narration: { audio: A("celebrate-shades-of-sure"), script: "Today you learned that words which mean almost the same thing still sit in different spots. On the sure dial, the spot depends on proof, from wondered with no clue at all to knew with the proof in hand. On the feeling dial, the spot depends on size, from carefree to frantic. You built both dials, you matched clues to the right spot, and you explained the difference between two neighbors. From now on, when you read a word like these, find its spot." },
    },
  ],
};
