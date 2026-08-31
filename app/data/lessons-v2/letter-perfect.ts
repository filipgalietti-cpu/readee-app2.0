import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./letter-perfect-timings.json";

// Letter Perfect (L.2.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=letter-perfect
// G2 conventions of writing: the three lanes G1 write-it-right (L.1.2) did NOT
// touch. write-it-right owns people/day/month capitals, end marks, commas in
// dates and lists, sound-out spelling; read-like-you-talk (RF.2.4) owns end-mark
// expression. THIS lesson owns: capitals for HOLIDAY and PLACE names (Halloween,
// Ohio, Chicago), the apostrophe's two jobs (contractions: don't, can't, isn't;
// possessives: Zoe's, Duke's; possessive-vs-plural kept gentle), and friendly-
// letter commas (Dear Gram, / Love, Ruby). Anchor names grep-verified fresh:
// Ruby, Gram, Zoe, Duke, Hugo, Vera, Cleo, Boston, Chicago, Ohio, Halloween
// (Thanksgiving/Texas/December burned by write-it-right-quiz; Ben/Sam/Meg/
// Finn/Leo/Eli/Omar/Rex burned across the catalog). QUIZ word sets disjoint
// by design: Pearl, Jasper, Hana, Sage, Nina, Denver, Salem, Oregon, wasn't,
// didn't, she's, I'm, won't, its/it's, boys' live in the quiz only.
// Case-bearing and apostrophe-bearing tiles are DELIBERATE here: case and
// apostrophe placement ARE the tested content. All tiles audio-free.

const A = (id: string) => `/audio/lessons-v2/letter-perfect/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/letter-perfect/${w.toLowerCase()}.png`;

export const letterPerfectImages: Record<string, string> = {
  "ruby-mailbox": "A smiling girl with a red ponytail standing on tiptoe to slide a plain white envelope into a round blue mailbox on a sunny sidewalk, orange autumn trees behind her. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "city-skyline": "A bright cheerful city skyline with tall colorful buildings beside a blue lake, small white clouds in a sunny sky, a green park in front, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "duke-bone": "A happy brown and white cartoon dog sitting in green grass proudly holding one big white bone in its front paws, plain blue sky behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  // Quiz easier-band picture support; not referenced by lesson scenes:
  "pearl-girl": "One smiling cartoon girl with curly dark hair standing and waving hello, plain soft sky-blue background, no other people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "im-kid": "One cheerful cartoon child pointing proudly at their own chest with a big smile, plain soft yellow background, no other people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "jasper-writing": "A smiling boy sitting at a small wooden desk writing on a blank white sheet of paper with a big red pencil, a plain envelope beside the paper, soft green background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "kite-girl": "A happy cartoon girl running across a green hill flying a bright red diamond kite with a long ribbon tail, sunny blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const letterPerfect: LessonDef = {
  id: "letter-perfect",
  title: "Letter Perfect",
  grade: "2nd Grade",
  standard: "L.2.2",
  archetype: "print-concepts",
  objective: "I can use capitals for special names, apostrophes, and letter commas when I write.",
  concepts: ["holiday and place names get capital letters (Halloween, Ohio)", "an apostrophe holds the spot in a squeezed word (do not becomes don't)", "an apostrophe with s shows belonging (Zoe's pumpkin)", "a friendly letter rests a comma after the greeting name and after the closing words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You write like a pro now. Capital letters for special names like Halloween and Ohio. An apostrophe to hold the spot in squeezed words, and an apostrophe with s to show who owns what. And two resting commas to dress up every friendly letter. Dear Gram, Love, Ruby. Letter perfect!",
    "title": "Letter Perfect!",
    "body": "You capitalized special names, put every apostrophe in its spot, and rested commas in the greeting and closing of a friendly letter."
  },
  scenes: [
    {
      id: "hook-rubys-letter",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Ruby wrote a letter to her grandmother. Read it with me.",
      image: IMG("ruby-mailbox"),
      narration: { audio: A("hook-rubys-letter"), script: "Hello, writer. Good writing follows polite little rules. Capital letters and tiny marks that help your reader understand you. Ruby wrote a letter to her grandmother and followed every single rule. Read her letter with me, and notice the capital letters and the tiny marks doing their quiet jobs." },
      interaction: { type: "read-along", text: "Dear Gram, Tomorrow is Halloween! Dad drove us to a farm in Ohio to pick pumpkins. Zoe's pumpkin is even bigger than mine. I can't wait to show you my costume. Please don't be late for the party. Love, Ruby", audio: A("hook-rubys-letter-sentence") },
    },
    {
      id: "model-special-names",
      purpose: "model",
      gate: "none",
      prompt: "Names of special things get capital letters.",
      fx: {"text":"**Halloween** and **Ohio**","effect":"underline"},
      narration: { audio: A("model-special-names"), script: "Rule one. You already give capital letters to names of people, days, and months. Second grade writers capitalize even more special names. Holidays get capitals, like Halloween. Names of places get capitals too, like Ohio. But watch out. Plain words stay small. Ruby capitalized Halloween, the name of one special holiday. She left pumpkin small, because pumpkin could mean any pumpkin anywhere." },
    },
    {
      id: "guided-choose-capital",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word needs a capital letter?",
      image: IMG("city-skyline"),
      narration: { audio: A("guided-choose-capital"), script: "Your turn. One of these four words names one special place, a real city you could visit. The other three could mean any old thing anywhere. A special name always needs its capital letter. Read all four words, then tap the one that needs a capital." },
      interaction: { type: "choose", options: [{ id: "chicago", label: "chicago" }, { id: "city", label: "city" }, { id: "street", label: "street" }, { id: "park", label: "park" }], correctId: "chicago", coachWrong: "Could that word mean lots of different ones? Then it stays small. Hunt for the name of one special place. Try again!" },
    },
    {
      id: "model-squeeze",
      purpose: "model",
      gate: "none",
      prompt: "An apostrophe holds the squeezed spot.",
      fx: {"text":"do + not = **don't**","effect":"magic"},
      narration: { audio: A("model-squeeze"), script: "Rule two. When we talk, we squeeze two small words into one. Do not turns into don't. Say it with me. Do not. Don't. The o in not got squeezed right out, and a tiny floating mark called an apostrophe holds its spot. Squeezed words like this are called contractions, and Ruby used two of them in her letter. Can't, and don't." },
    },
    {
      id: "guided-hidden-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which two words hide inside can't?",
      narration: { audio: A("guided-hidden-words"), script: "Every contraction hides two small words inside it. Ruby wrote, I can't wait to show you my costume. Can't is a squeezed word. Read each pair on the cards, then tap the two words hiding inside can't." },
      interaction: { type: "choose", options: [{ id: "can-not", label: "can not" }, { id: "did-not", label: "did not" }, { id: "will-not", label: "will not" }, { id: "can-it", label: "can it" }], correctId: "can-not", coachWrong: "Unsqueeze it. Say the squeezed word slowly and listen for the two small words hiding inside. Try again!" },
    },
    {
      id: "apply-squeeze-spelling",
      purpose: "apply",
      gate: "interaction",
      prompt: "How do you write the squeezed word for is not?",
      narration: { audio: A("apply-squeeze-spelling"), script: "Now squeeze a new pair. Is not. When is not gets squeezed, the o in not is pushed out, and the apostrophe must hold that exact spot. Only one of these cards puts the apostrophe in the squeezed spot. Read each card letter by letter, then tap the one written right." },
      interaction: { type: "choose", options: [{ id: "isnt-right", label: "isn't" }, { id: "isnt-early", label: "is'nt" }, { id: "isnt-none", label: "isnt" }, { id: "isnt-wild", label: "i'snt" }], correctId: "isnt-right", coachWrong: "Which letter got squeezed out of is not? The apostrophe belongs in that exact spot. Try again!" },
    },
    {
      id: "apply-speak-squeezed",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the squeezed word for do not.",
      narration: { audio: A("apply-speak-squeezed"), script: "Time to say one out loud. In her letter, Ruby told Gram, please do not be late for the party. But those two small words can be squeezed into one little word, with the apostrophe holding the spot of the o. Tap the mic and say the squeezed word for do not." },
      interaction: { type: "speak", text: "don't dont" },
    },
    {
      id: "model-owners",
      purpose: "model",
      gate: "none",
      prompt: "An apostrophe with s shows who owns it.",
      fx: {"text":"**Zoe's** pumpkin","effect":"underline"},
      narration: { audio: A("model-owners"), script: "Rule three. The apostrophe has a second job. With the letter s, it shows that something belongs to someone. Ruby wrote about Zoe's pumpkin. That apostrophe s tells the reader the pumpkin belongs to Zoe. Careful, though. Plain old more than one, like two pumpkins, needs no apostrophe at all. The apostrophe only comes out when someone owns something." },
    },
    {
      id: "guided-choose-owner",
      purpose: "guided",
      gate: "interaction",
      prompt: "The bone belongs to Duke. Tap the card written right.",
      image: IMG("duke-bone"),
      narration: { audio: A("guided-choose-owner"), script: "Meet Duke, a dog with one favorite bone. That bone belongs to Duke. Only one of these cards uses the apostrophe to show it. Read each card closely, then tap the one written right." },
      interaction: { type: "choose", options: [{ id: "dukes-right", label: "Duke's bone" }, { id: "dukes-none", label: "Dukes bone" }, { id: "dukes-after", label: "Dukes' bone" }, { id: "dukes-plural", label: "Duke bones" }], correctId: "dukes-right", coachWrong: "One dog owns one bone. Show the owner with an apostrophe, then the s, right after his name. Try again!" },
    },
    {
      id: "apply-sort-jobs",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "What job is each apostrophe doing? Sort the cards.",
      narration: { audio: A("apply-sort-jobs"), script: "Every card here carries an apostrophe, but the apostrophes are doing two different jobs. Some show that something belongs to someone. Some hold the spot in a squeezed word. Read each card, decide the apostrophe's job, and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Shows Belonging","Squeezed Words"], items: [{ label: "mom's cup", bucket: "Shows Belonging" }, { label: "bird's nest", bucket: "Shows Belonging" }, { label: "cat's bowl", bucket: "Shows Belonging" }, { label: "we're", bucket: "Squeezed Words" }, { label: "hasn't", bucket: "Squeezed Words" }, { label: "doesn't", bucket: "Squeezed Words" }], coachWrong: "Look at that apostrophe again. Is there an owner with an s right after it, or two words squeezed into one? Try again!" },
    },
    {
      id: "model-letter-commas",
      purpose: "model",
      gate: "none",
      prompt: "Friendly letters rest commas in two special spots.",
      fx: {"text":"Dear **Gram,** and **Love,** Ruby","effect":"circle"},
      narration: { audio: A("model-letter-commas"), script: "Rule four, the friendly letter rule. A letter starts with a greeting. Dear Gram. It ends with a closing. Love, Ruby. Each one gets a resting comma. In the greeting, the comma rests right after the person's name. Dear Gram, comma. In the closing, the comma rests after your warm words, just before your own name. Love, comma, Ruby. Two little commas, and your letter is dressed for the mail." },
    },
    {
      id: "guided-choose-greeting",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the greeting that follows every rule.",
      narration: { audio: A("guided-choose-greeting"), script: "Imagine you are writing a letter to your uncle. The greeting needs a capital letter at the very start and a comma resting right after his name. Only one of these greetings follows both rules. Read each one closely, then tap it." },
      interaction: { type: "choose", options: [{ id: "greet-right", label: "Dear Uncle Hugo," }, { id: "greet-comma-early", label: "Dear, Uncle Hugo" }, { id: "greet-lowercase", label: "dear Uncle Hugo," }, { id: "greet-no-comma", label: "Dear Uncle Hugo" }], correctId: "greet-right", coachWrong: "Check two things. Does it start with a capital letter? Does the comma rest right after the name? Try again!" },
    },
    {
      id: "apply-choose-closing",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the closing that is written right.",
      narration: { audio: A("apply-choose-closing"), script: "Vera is finishing a letter to her pen pal. Her closing needs warm words first, then a resting comma, then her own name. Only one of these closings puts everything in its place. Read each one, then tap it." },
      interaction: { type: "choose", options: [{ id: "close-right", label: "Your friend, Vera" }, { id: "close-comma-end", label: "Your friend Vera," }, { id: "close-comma-early", label: "Your, friend Vera" }, { id: "close-lowercase", label: "your friend, Vera" }], correctId: "close-right", coachWrong: "The comma rests right after the warm words, just before the name. And a closing starts with a capital. Try again!" },
    },
    {
      id: "challenge-fix-capitals",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the three words that need capital letters.",
      narration: { audio: A("challenge-fix-capitals"), script: "Last hunt, all by yourself. A friend typed this sentence in a hurry, and three special names lost their capital letters. A person, a place, and a holiday. Read the sentence carefully and tap all three." },
      interaction: { type: "highlight", text: "Our cousin cleo moved to boston before halloween.", targets: ["cleo","boston","halloween"], coachWrong: "Hunt for the name of one special person, one special place, and one special holiday. Those three always get capitals. Try again!" },
    },
    {
      id: "challenge-speak-greeting",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the greeting word that starts a friendly letter.",
      narration: { audio: A("challenge-speak-greeting"), script: "One more, and this one is yours to say. Every friendly letter starts with a greeting. One kind little word, then the person's name, then a resting comma. Ruby used that word to greet Gram at the top of her letter. Tap the mic and say the greeting word that starts a friendly letter." },
      interaction: { type: "speak", text: "dear dear" },
    },
    {
      id: "celebrate-letter-perfect",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are letter perfect!",
      fx: {"text":"You are **letter perfect**!","effect":"fireworks"},
      narration: { audio: A("celebrate-letter-perfect"), script: "What a writer you are. Special names got their capital letters, Halloween, Ohio, Chicago. Your apostrophes held the squeezed spots in don't and isn't, and showed who owned what in Zoe's pumpkin. And your commas rested in just the right letter spots. Dear Gram, comma. Love, comma, Ruby. Every letter you write can be letter perfect now!" },
    },
  ],
};
