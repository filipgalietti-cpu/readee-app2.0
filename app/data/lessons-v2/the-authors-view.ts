import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-authors-view-timings.json";

// The Author's View (RI.3.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-authors-view
// G3-U2. RI.3.6 = distinguish their own point of view from that of the AUTHOR
// of an informational text. The informational twin of their-view-your-view
// (RL.3.6, narrator / character / reader). Sibling split honored:
// why-authors-write (RI.2.6, cheetah / honey / panda) owns the author's
// PURPOSE (answer / explain / describe); author-reasons (RI.K.8, bear) owns
// the word because; prove-it (RI.1.8) owns finding reasons; hold-it-up
// (RI.2.8, Drink Up) owns how reasons support a point; point-to-the-fact
// (RI.3.1, redwoods) owns pointing to the proving sentence; big-idea-backed-up
// (RI.3.2, prairie dogs) owns the big idea. THIS lesson owns the G3 step-up:
// a fact book is written by a person with opinions, a FACT (can be checked)
// is told from the AUTHOR'S OPINION (a judgment nobody can check), the
// author's view shows in LOADED WORDS (best, sadly, delightful, should), in
// how the facts are DRESSED (a true fact with a feeling glued on, an awkward
// fact softened), and in what the author tells readers to do; then the
// reader's OWN view is held apart from the author's and backed with a fact
// from the text or the reader's own experience. ONE original informational
// text, "Why Every Family Needs a Guinea Pig", by a clearly opinionated
// author (every fact true: guinea pigs are rodents from the mountains of South
// America and not pigs, cannot climb or jump high, squeal when they hear a bag
// rustle or a fridge open because they learned it means food, front teeth
// never stop growing so they chew hay all day, cannot make vitamin C so they
// need fresh vegetables such as sweet peppers, hop straight up with all four
// feet off the ground when excited, eat some of their own droppings for extra
// vitamins, hate to be alone and in Switzerland keeping one alone is against
// the law, babies are born furred with open eyes and run within hours, the pen
// needs fresh bedding every few days, they live five years or longer), 16
// sentences over 5 child-read pages (read-along 1/3/5 with images, speak 2/4),
// compound + early-complex sentences, no digits, stretch words rodents /
// commitment / delightful / regretted with in-text support. Speak texts avoid
// the token " my " (Speak.tsx flips to exact-read on it). ANCHOR FRESHNESS
// grep-swept vs every lessons-v2 + quizzes-v2 file: guinea pig, rodent, South
// America, droppings, sweet pepper, bedding, wheek, allergic, commitment,
// regretted, loaded word all 0 hits (hamster is only a pet name in
// ask-and-answer-g2-quiz and is not used here; vitamin C appears once as an
// orange fact in hold-it-up-quiz). Keys prefixed quiz- are picture supports
// for the quiz's all-fresh jellyfish text (jellyfish, tentacle, stinger all
// 0 hits).

const A = (id: string) => `/audio/lessons-v2/the-authors-view/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-authors-view/${w.toLowerCase()}.png`;

export const theAuthorsViewImages: Record<string, string | { subject: string; ref?: string }> = {
  "pen-two-guinea-pigs": "Two round fluffy guinea pigs, one brown and white and one black and tan, sitting side by side on soft pale wood shavings inside a low open pen on a living room floor, a small pile of green hay beside them, a wooden hide box in one corner, a sunny window in the background, natural calm animal faces with no smiles and no cartoon eyes. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "guinea-pig-hay-peppers": { subject: "The same brown and white guinea pig close up, chewing a long strand of green hay with its front teeth, a small ceramic bowl holding a few slices of red and yellow sweet pepper beside it on the pale wood shavings, natural calm animal face with no smile. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "pen-two-guinea-pigs" },
  "family-meets-guinea-pigs": { subject: "A girl with dark brown skin and two puffy hair buns in a yellow sweater kneeling on a living room rug beside the same low open pen, holding a slice of red sweet pepper out toward the same two guinea pigs, one brown and white and one black and tan, while a tall man with light brown skin and a short beard in a blue shirt kneels behind her and watches, a sunny window and a plain cream wall behind them, natural calm animal faces with no smiles. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "pen-two-guinea-pigs" },
  "quiz-jellyfish-drifting": "A single large translucent pale pink jellyfish with a smooth rounded bell and many long thin trailing tentacles drifting through clear deep blue ocean water, small silver fish far in the background, soft beams of sunlight coming down from the surface, no face on the jellyfish. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-jellyfish-glow": { subject: "Several small jellyfish with rounded bells glowing bright blue and green in dark night ocean water near a sandy beach, their thin tentacles trailing softly, a dark sky with a few stars above the water and no moon, no faces on the jellyfish. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no moon, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-jellyfish-drifting" },
  "quiz-jellyfish-aquarium": { subject: "A boy with pale skin and short black hair in a green t-shirt standing in a dim aquarium room, looking up at a tall curved glass tank full of deep blue water where many translucent pale pink jellyfish with rounded bells and long thin tentacles drift slowly, soft blue light glowing on his face, no faces on the jellyfish. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.", ref: "quiz-jellyfish-drifting" }
};

export const theAuthorsView: LessonDef = {
  id: "the-authors-view",
  title: "The Author's View",
  grade: "3rd Grade",
  standard: "RI.3.6",
  archetype: "inference",
  objective: "I can tell a fact from the author's opinion in a fact book, find the author's view, and say whether my own view matches it, with a reason.",
  concepts: [
    "a fact book is written by a person, and that person has opinions",
    "a fact can be checked, an opinion is a judgment nobody can check",
    "the author's view shows in loaded words, in how the facts are dressed, and in what the author tells you to do",
    "my view can match the author's or differ from it",
    "a view needs a reason, from the text or from my own experience",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a fact book with your eyes open. You told the facts from the author's opinions, you found the author's view in the loaded words and in the way the facts were dressed, and then you decided what you think, with a reason of your own. An author can give you the facts, but the author does not get to decide your view. That is yours.",
    "title": "Your Own View",
    "body": "You told facts from the author's opinions, found the author's view, and held your own view apart from it, with a reason."
  },
  scenes: [
    {
      id: "hook-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Why Every Family Needs a Guinea Pig, page one. Read along!",
      image: IMG("pen-two-guinea-pigs"),
      narration: { audio: A("hook-page-one"), script: "Hello, reader. A fact book is written by a person, and a person has opinions. Today you learn to tell what is simply true from what the author thinks, and then to decide what you think. Here is page one of a book called Why Every Family Needs a Guinea Pig. Read along with me, and listen for the author's feelings slipping in between the facts." },
      interaction: { type: "read-along", text: "The guinea pig is the best pet a family can have, and I will spend this whole book telling you why. Guinea pigs are not pigs at all, and they do not come from a place called Guinea, because they are rodents, a family of animals with front teeth that never stop growing, and they first lived in the mountains of South America. Sadly, many families never even think of them, because they have only ever heard of dogs and cats.", audio: A("hook-page-one-sentence") },
    },
    {
      id: "model-fact-vs-opinion",
      purpose: "model",
      gate: "none",
      prompt: "A fact can be checked. An opinion is what the author thinks.",
      fx: {"text":"the **best** pet a family can have","effect":"underline"},
      narration: { audio: A("model-fact-vs-opinion"), script: "Here is how I read page one. Guinea pigs are rodents, and they first lived in the mountains of South America. Could I check that? Yes. I could look in another book, or ask a scientist, and it would be true or false. That is a fact. Now the first sentence. The guinea pig is the best pet a family can have. Best according to whom? Nobody can check that with a test, because it is a judgment. That is the author's opinion. The word that gives it away is best. I call words like best, wonderful, terrible, and should loaded words, because they carry the author's feelings instead of a fact. A fact book holds both kinds of sentences, and a third grade reader keeps them in separate piles. Read page one again in your head, and look for another loaded word hiding beside the facts." },
    },
    {
      id: "guided-choose-author-view",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does the author think about guinea pigs?",
      narration: { audio: A("guided-choose-author-view"), script: "Your turn. Page one is full of the author's feelings. Four views are on your screen, and only one of them is what this author thinks about guinea pigs. Tap it." },
      interaction: { type: "choose", options: [{ id: "every-family-should-keep-one", label: "every family should keep one" }, { id: "they-are-hard-to-care-for", label: "they are hard to care for" }, { id: "dogs-make-better-pets", label: "dogs make better pets" }, { id: "they-belong-in-the-mountains", label: "they belong in the mountains" }], correctId: "every-family-should-keep-one", coachWrong: "Check that view against page one. Which one would the person who wrote page one agree with?" },
    },
    {
      id: "guided-choose-loaded-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words show the author's opinion?",
      fx: {"text":"A **loaded word** carries a feeling","effect":"underline"},
      narration: { audio: A("guided-choose-loaded-words"), script: "An opinion lives in the words the author chooses. Four pieces of page one are on your screen, and all four are really there. Three of them are facts you could check. One of them carries the author's feeling. Tap the words that show the author's opinion." },
      interaction: { type: "choose", options: [{ id: "sadly-many-families", label: "sadly, many families" }, { id: "are-not-pigs-at-all", label: "are not pigs at all" }, { id: "mountains-of-south-america", label: "mountains of South America" }, { id: "heard-of-dogs-and-cats", label: "heard of dogs and cats" }], correctId: "sadly-many-families", coachWrong: "Those words tell you something anyone could check. Find the word that tells you how the author feels about it." },
    },
    {
      id: "page-two-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A guinea pig cannot climb or jump very high, so it lives happily in a low pen on the floor. When it hears a bag rustle or the fridge door open, it squeals with excitement, because it has learned that those sounds mean food is coming. I think nothing is sweeter than that sound.",
      narration: { audio: A("page-two-read"), script: "Page two is yours. Read all three sentences out loud, and notice the sentence where the author stops reporting and starts feeling." },
      interaction: { type: "speak", text: "A guinea pig cannot climb or jump very high so it lives happily in a low pen on the floor When it hears a bag rustle or the fridge door open it squeals with excitement because it has learned that those sounds mean food is coming I think nothing is sweeter than that sound" },
    },
    {
      id: "page-three-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch how the facts are dressed.",
      image: IMG("guinea-pig-hay-peppers"),
      narration: { audio: A("page-three-read"), script: "Page three. Read along with me, and watch what the author does with each fact." },
      interaction: { type: "read-along", text: "A guinea pig's front teeth never stop growing, so it chews hay all day long to wear them down. Its body cannot make vitamin C the way ours can, so it needs fresh vegetables such as sweet peppers every single day. When a guinea pig is excited, it hops straight up into the air with all four feet off the ground, which is the most delightful thing you will ever see. A guinea pig also eats some of its own droppings to get extra vitamins, which is not nearly as gross as it sounds.", audio: A("page-three-read-sentence") },
    },
    {
      id: "model-facts-dressed",
      purpose: "model",
      gate: "none",
      prompt: "An author can dress a fact in a feeling.",
      fx: {"text":"a fact, **dressed** in a feeling","effect":"pop-words"},
      narration: { audio: A("model-facts-dressed"), script: "Loaded words are the first clue to an author's view. Here is the second clue. Watch what the author does with the facts on page three. An excited guinea pig hops straight up with all four feet off the ground. That is a fact, and a scientist could film it. But the author does not stop there. Which is the most delightful thing you will ever see. The author glued a feeling onto the fact. Now the last sentence. A guinea pig eats some of its own droppings. That is a true fact too, and it is not a pretty one. So the author hurries to soften it. Not nearly as gross as it sounds. Why? Because this author wants you to love guinea pigs, so every fact gets dressed to help that view. When you read a fact book, notice which facts the author chose, and notice the feeling each one is wearing." },
    },
    {
      id: "guided-choose-checkable-fact",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words are a fact a scientist could check?",
      narration: { audio: A("guided-choose-checkable-fact"), script: "Now you separate the piles. Four pieces of page three are on your screen, and all four are really there. Three of them carry the author's feelings. Only one is a plain fact that a scientist could check with a test. Tap the fact." },
      interaction: { type: "choose", options: [{ id: "its-teeth-never-stop-growing", label: "its teeth never stop growing" }, { id: "the-most-delightful-thing", label: "the most delightful thing" }, { id: "not-nearly-as-gross", label: "not nearly as gross" }, { id: "you-will-ever-see", label: "you will ever see" }], correctId: "its-teeth-never-stop-growing", coachWrong: "Could a scientist check those words with a test? If the words carry a feeling instead, they belong to the author's opinion." },
    },
    {
      id: "page-four-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: A guinea pig hates to be alone, so you should always keep two, and in one country in Europe it is even against the law to keep just one. Guinea pig babies are born with fur and open eyes, and they can run around within hours. The pen does need fresh bedding every few days, but that is a small price to pay for so much joy.",
      narration: { audio: A("page-four-read"), script: "Page four is yours, and it holds the third clue to an author's view, the place where the author tells you what to do. Read all three sentences out loud." },
      interaction: { type: "speak", text: "A guinea pig hates to be alone so you should always keep two and in one country in Europe it is even against the law to keep just one Guinea pig babies are born with fur and open eyes and they can run around within hours The pen does need fresh bedding every few days but that is a small price to pay for so much joy" },
    },
    {
      id: "apply-sort-fact-opinion",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Fact, or Author's Opinion?",
      narration: { audio: A("apply-sort-fact-opinion"), script: "Here are six pieces of the book so far. For each one, ask this. Could somebody check it with a test, or is it a judgment that carries the author's feeling? If it can be checked, drag it to Fact. If it is what the author thinks, drag it to Author's Opinion." },
      interaction: { type: "sort", buckets: ["Fact","Author's Opinion"], items: [{ label: "teeth never stop growing", bucket: "Fact" }, { label: "a small price to pay", bucket: "Author's Opinion" }, { label: "born with fur and open eyes", bucket: "Fact" }, { label: "you should always keep two", bucket: "Author's Opinion" }, { label: "cannot make vitamin C", bucket: "Fact" }, { label: "nothing is sweeter than that", bucket: "Author's Opinion" }], coachWrong: "Ask the question again. Could a scientist test those words and find them true or false? If not, they carry a feeling, and feelings belong to the author." },
    },
    {
      id: "page-five-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the last page. Read along!",
      image: IMG("family-meets-guinea-pigs"),
      narration: { audio: A("page-five-read"), script: "Last page. Read along with me, and notice what the author wants you to do when the book is over." },
      interaction: { type: "read-along", text: "A guinea pig can live for five years or even longer, so a family that brings one home is making a commitment, a promise to care for it for a long time. I have kept guinea pigs for most of my life, and I have never once regretted it or wished for a different pet. So close this book, find a friend who keeps guinea pigs, and go and meet one this week, because no home is truly complete without a pair of happy guinea pigs squealing for their dinner.", audio: A("page-five-read-sentence") },
    },
    {
      id: "model-reader-view",
      purpose: "model",
      gate: "none",
      prompt: "The author has a view. You get your own.",
      fx: {"text":"The author thinks. **I think.**","effect":"pop-words"},
      narration: { audio: A("model-reader-view"), script: "Now the other view, yours. A reader does not have to agree with the author, and the author does not get to decide for you. Here is how I do it. The author thinks every family should keep guinea pigs. Here is what I think. I think guinea pigs are a good pet for some families, but not for every family, and that is different from what the author thinks. Here is why. The text says a guinea pig can live for five years or longer, and the pen needs fresh bedding every few days. A family that travels every month would not be happy with that promise. I used a fact from the text to disagree with the author's opinion. You can also use your own experience. If you have held a guinea pig and loved it, that is a reason too. The facts in a book can support the author's view, or they can argue with it. The reader decides." },
    },
    {
      id: "apply-choose-disagree-fact",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which fact might make a reader disagree with the author?",
      narration: { audio: A("apply-choose-disagree-fact"), script: "The author says every family should keep a guinea pig. Four facts from the book are on your screen, and all four are true. Three of them make guinea pigs sound sweet, so they agree with the author. One of them could give a reader a reason to disagree. Tap that fact." },
      interaction: { type: "choose", options: [{ id: "eats-some-of-its-droppings", label: "eats some of its droppings" }, { id: "it-hops-into-the-air", label: "it hops into the air" }, { id: "babies-are-born-with-fur", label: "babies are born with fur" }, { id: "it-squeals-when-food-comes", label: "it squeals when food comes" }], correctId: "eats-some-of-its-droppings", coachWrong: "That fact makes guinea pigs sound sweet, so it agrees with the author. Look for the fact the author had to say was not so bad." },
    },
    {
      id: "apply-choose-fresh-loaded-word",
      purpose: "apply",
      gate: "interaction",
      prompt: "A new book: A tortoise can live for more than a hundred years, and its slow, steady walk is the most peaceful sight in any garden. Which words show the author's opinion?",
      narration: { audio: A("apply-choose-fresh-loaded-word"), script: "Now a fresh page from a different fact book, about tortoises. Here is the sentence. A tortoise can live for more than a hundred years, and its slow, steady walk is the most peaceful sight in any garden. Four pieces of that sentence are on your screen. Tap the words that carry the author's feeling instead of a fact." },
      interaction: { type: "choose", options: [{ id: "the-most-peaceful-sight", label: "the most peaceful sight" }, { id: "more-than-a-hundred-years", label: "more than a hundred years" }, { id: "its-slow-steady-walk", label: "its slow, steady walk" }, { id: "in-any-garden", label: "in any garden" }], correctId: "the-most-peaceful-sight", coachWrong: "Could somebody check those words with a test or a clock? Find the words that judge instead of describe." },
    },
    {
      id: "challenge-speak-your-view",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Should every family keep a guinea pig? Does your view match the author's? Say why.",
      narration: { audio: A("challenge-speak-your-view"), script: "Last one, and it is your view, out loud. Tap the mic. Say what you think about keeping a guinea pig, say whether that matches what the author thinks or is different, and give one reason, from the book or from your own life. Start with, I think." },
      interaction: { type: "speak", text: "agree disagree different same match matches author think good great fun sweet cute soft gentle pet pets family families every some hard work care clean cleaning bedding smell allergic years long promise commitment two friend friends droppings gross teeth hay vegetables squeal squeals hop hops" },
    },
    {
      id: "celebrate-your-own-view",
      purpose: "celebrate",
      gate: "none",
      prompt: "The author's view, and your own.",
      fx: {"text":"The **author's** view. **Your** view.","effect":"fireworks"},
      narration: { audio: A("celebrate-your-own-view"), script: "You read a fact book with your eyes open today. You told the facts from the author's opinions. You found the author's view in the loaded words, in the way each fact was dressed, and in what the author told you to do. Then you made up your own mind, and you backed it with a reason. From now on, when an author tells you what to think, you can take the facts, and keep the deciding for yourself." },
    },
  ],
};
