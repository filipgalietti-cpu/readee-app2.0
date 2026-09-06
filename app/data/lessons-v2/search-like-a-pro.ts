import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./search-like-a-pro-timings.json";

// Search Like a Pro (RI.3.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=search-like-a-pro
// G3-U2. RI.3.5 = use text features AND search tools (key words, sidebars,
// hyperlinks) to locate information on a topic EFFICIENTLY. Sibling split
// honored: text-feature-finders (RI.1.5, bug book: contents/heading/bold/
// labels/glossary) and find-it-fast (RI.2.5, All About Owls: contents/heading/
// bold/caption/glossary, plus its quiz's ant-book index-vs-contents and
// sidebar preview) own KNOWING the features; parts-of-a-book / book-basics own
// K print parts; look-it-up (L.2.4e) owns dictionary entries and ABC order;
// point-to-the-fact (RI.3.1) owns reading the located sentence as proof;
// diagram-detectives / pictures-that-teach (RI.K.7 / RI.2.7) own pictures.
// THIS lesson owns the G3 step-up, the STRATEGY of locating: pick the key
// words out of a question (the words that carry its meaning, none of the
// little ones), predict which section answers it from the contents BEFORE
// reading, know where a fact lives on a page (body under the heading, a
// sidebar box beside it, a caption under the picture), the index as the
// every-page tool vs the contents as the big-parts tool, the screen tools (a
// blue hyperlink names the page it jumps to, a search box takes key words),
// and the which-tool-is-fastest decision. The child never reads the whole
// book to answer; every answer arrives by a jump. ONE original fact book,
// "Puffins of the Cold Sea" (Atlantic puffins; every fact true: North Atlantic
// cliffs, black back / white belly / beak striped orange, yellow, and gray,
// the bright outer beak layer sheds in winter to dull gray, nicknamed the
// clown of the sea, wings beat hundreds of times a minute, waterproof
// feathers, flap-swimming underwater, sand eels and herring, dives deeper
// than a tall tree is high, a dozen or more fish held crosswise by spines on
// the tongue and roof of the mouth, most of the year at sea, spring nesting
// in cliff-top burrows dug with beak and claws, one egg, both parents brood,
// a puffling hatches after about six weeks), 16 sentences over 5 child-read
// pages (read-along 1/3/5 with images, speak 2/4 = two 3-sentence
// accept-mode reads), compound + early-complex, no digits, stretch words
// seabird / waterproof / spines / burrow / puffling with in-text support.
// Its FEATURES are SPOKEN by the narrator because the screen shows plain
// text: a three-section contents at the start (Puffin Bodies / Fishing Under
// the Sea / Puffin Homes), a heading named at each section, a bold word on
// pages two and four (waterproof, spines), a sidebar on pages two and four
// (winter beak, most of the year at sea), a caption under the page-three
// picture (a dozen fish), an index line at the end, and one screen moment
// (blue link "clown of the sea" on the puffin website, then the search box).
// ANCHOR FRESHNESS python-swept vs every lessons-v2 + quizzes-v2 file: puffin,
// puffling, Atlantic, herring, sand eel, hyperlink, keyword, sidebar-as-taught
// 0 hits (sidebar/index appear only as find-it-fast-quiz's G3 preview; owls,
// bugs, ants, bats, penguins, pelicans, kingfishers found burned and avoided).
// Keys prefixed quiz- are picture supports for the quiz's all-fresh platypus
// text (platypus, puggle, riverbank, venom, spur, Australia all 0 hits).

const A = (id: string) => `/audio/lessons-v2/search-like-a-pro/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/search-like-a-pro/${w.toLowerCase()}.png`;

export const searchLikeAProImages: Record<string, string | { subject: string; ref?: string }> = {
  "puffin-cliff": "A single Atlantic puffin standing on a grassy cliff top high above a cold blue ocean, its black back, white belly, and big beak striped with bright orange, yellow, and gray clearly visible, a few white waves far below and a pale sky, no other birds. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "puffin-underwater": { subject: "The same puffin swimming underwater in clear blue-green sea, wings spread mid-flap as if flying through the water, a row of several small silver fish held crosswise in its orange striped beak, a few more small silver fish darting away, sunlight rays coming down from the surface above, no bubbles with faces, no other birds.", ref: "puffin-cliff" },
  "puffin-burrow": { subject: "The same puffin standing at the round dark entrance of a burrow tunnel dug into a grassy green cliff top, one fluffy dark gray chick peeking out of the tunnel beside it, soft soil and tufts of grass around the hole, the blue ocean far in the background, no other birds.", ref: "puffin-cliff" },
  "quiz-platypus-swimming": "A platypus swimming in a calm brown-green river, its flat duck-like bill, sleek brown fur, wide flat tail, and webbed front feet clearly visible, small ripples on the water and a few reeds at the bank, no other animals. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-platypus-burrow": { subject: "The same platypus resting inside a cozy dirt burrow tunnel dug into a riverbank, two tiny pale baby platypuses curled up beside it on a bed of leaves, roots hanging from the ceiling of the tunnel, a small circle of daylight at the tunnel mouth, no other animals.", ref: "quiz-platypus-swimming" },
  "quiz-platypus-bill": { subject: "A close view of the same platypus with its eyes closed, poking its flat duck-like bill along the muddy bottom of a river among pebbles, a small shrimp and a tiny worm half hidden in the mud nearby, murky water all around, no other animals.", ref: "quiz-platypus-swimming" },
};

export const searchLikeAPro: LessonDef = {
  id: "search-like-a-pro",
  title: "Search Like a Pro",
  grade: "3rd Grade",
  standard: "RI.3.5",
  archetype: "inference",
  objective: "I can pick the key words out of a question and use a text's tools to jump straight to the fact I need.",
  concepts: [
    "key words are the words that carry the question's meaning",
    "the contents predicts which section answers a question",
    "body, sidebar, or caption: where a fact lives on the page",
    "the index lists every page for a small topic",
    "a blue link names the page it jumps to; a search box takes key words",
    "choose the tool that gets you there fastest",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You answered question after question about puffins, and you never once read the whole book. You picked out the key words, let the contents point you to the section, found facts in sidebars and captions, used the index for small topics, and on the screen you followed a link and filled in a search box. That is searching like a pro.",
    "title": "Search Like a Pro!",
    "body": "You picked out key words, predicted the right section, used sidebars, captions, the index, a link, and a search box, and jumped straight to every fact."
  },
  scenes: [
    {
      id: "hook-read-contents",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Puffins of the Cold Sea. Read the contents along with me.",
      narration: { audio: A("hook-read-contents"), script: "Hello, reader. Here is a question. How many fish can a puffin carry in its beak at one time? The answer is somewhere inside a fact book called Puffins of the Cold Sea. You could read every page from the front to the back, and you would find it eventually. A third grade reader does not do that. A fact book carries tools that let you jump straight to the fact, and the first tool sits at the front. It is the table of contents, the list of the book's sections and the page where each one starts. Read the contents along with me." },
      interaction: { type: "read-along", text: "Contents. Puffin Bodies, page one. Fishing Under the Sea, page three. Puffin Homes, page five.", audio: A("hook-read-contents-sentence") },
    },
    {
      id: "model-key-words-jump",
      purpose: "model",
      gate: "none",
      prompt: "Pick the key words, then let the contents point you.",
      fx: {"text":"**Key words**, then **jump**","effect":"pop-words"},
      narration: { audio: A("model-key-words-jump"), script: "Here is how I search. First I pick the key words out of the question. How many fish can a puffin carry in its beak at one time. The little words, how, many, can, in, its, at, do not help me find anything. The words that carry the meaning are fish, carry, and beak. Those are my key words. Next I hold those key words up against the contents. Puffin Bodies. Fishing Under the Sea. Puffin Homes. Fish and carry belong with fishing, so my fact almost certainly lives in the section called Fishing Under the Sea, and the contents says it starts on page three. I have not read a single page yet, and I already know where to jump. That is the whole move. Key words, then the contents, then the jump." },
    },
    {
      id: "guided-choose-key-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why does a puffin's beak turn gray in winter? Tap the best key words.",
      fx: {"text":"Why does a puffin's beak turn **gray** in **winter**?","effect":"glow"},
      narration: { audio: A("guided-choose-key-words"), script: "Your turn to pick key words. Here is a new question. Why does a puffin's beak turn gray in winter? Four sets of words are on your screen. Only one set holds the words that carry the question's meaning and leaves the little words out. Tap the best key words." },
      interaction: { type: "choose", options: [{ id: "beak-gray-winter", label: "beak gray winter" }, { id: "why-does-the-puffin", label: "why does the puffin" }, { id: "bird-sea-cliff", label: "bird sea cliff" }, { id: "in-the-winter-it", label: "in the winter it" }], correctId: "beak-gray-winter", coachWrong: "Those words will not lead you to this fact. Look for the set that names the thing the question is about and what happens to it, with no little words." },
    },
    {
      id: "guided-choose-which-section",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which section of the book answers the winter beak question?",
      narration: { audio: A("guided-choose-which-section"), script: "Now hold your key words up against the contents, before you read anything. The contents said, Puffin Bodies, page one. Fishing Under the Sea, page three. Puffin Homes, page five. Your question is about a puffin's beak, and a beak is part of a puffin. Tap the section where that fact most likely lives." },
      interaction: { type: "choose", options: [{ id: "puffin-bodies", label: "Puffin Bodies" }, { id: "fishing-under-the-sea", label: "Fishing Under the Sea" }, { id: "puffin-homes", label: "Puffin Homes" }, { id: "read-every-page", label: "read every page" }], correctId: "puffin-bodies", coachWrong: "Think about what a beak is a part of, then match that idea to a section name. Reading every page is the slow way, not the search." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page one. The heading says Puffin Bodies. Read along!",
      image: IMG("puffin-cliff"),
      narration: { audio: A("page-1-read"), script: "The contents sent us to page one, so we jump there. The heading at the top of the page says, Puffin Bodies. A heading names what its section is about, so we are in the right place. Read along with me." },
      interaction: { type: "read-along", text: "A puffin is a small seabird that lives along the cold cliffs of the North Atlantic Ocean. It has a black back, a white belly, and a big beak striped with orange, yellow, and gray. By spring the beak glows so bright that people call the puffin the clown of the sea.", audio: A("page-1-read-sentence") },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A puffin's short wings beat very fast, sometimes hundreds of times in one minute. Its feathers are waterproof, so the cold sea cannot soak through to its skin. On land it walks upright with a waddle, but in the air it is a strong, quick flier.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, and it holds two features. One word on this page is printed in bold, thick dark letters. The word is waterproof. Bold is the author saying, this word matters. And beside the main words sits a small box, a sidebar, with one extra fact inside. The sidebar says, in winter the bright outer layer of the beak falls off, and the beak turns dull gray. There is the answer to the winter question, and we found it by jumping, not by reading the whole book. Now read the three body sentences out loud." },
      interaction: { type: "speak", text: "A puffin's short wings beat very fast sometimes hundreds of times in one minute Its feathers are waterproof so the cold sea cannot soak through to its skin On land it walks upright with a waddle but in the air it is a strong quick flier" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. The heading says Fishing Under the Sea. Read along!",
      image: IMG("puffin-underwater"),
      narration: { audio: A("page-3-read"), script: "Page three starts a new section. The heading says, Fishing Under the Sea. This page has a picture, and under the picture sits a caption, a short line that explains what the picture shows. The caption says, a puffin can carry a dozen small fish in its beak at once, and sometimes many more. That is our very first question, answered by a caption. So a fact can live in three places on a page. The main story of the section lives in the body under the heading. An extra fact lives in the sidebar box beside it, and a fact about the picture lives in the caption under it. Read the body along with me." },
      interaction: { type: "read-along", text: "A puffin does not just float on the waves, it dives right under them. Underwater it flaps its wings to swim, so it looks like it is flying through the sea. It chases small fish such as sand eels and herring, and it can dive deeper than a tall tree is high.", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Tiny spines on the puffin's tongue and the roof of its mouth hold each fish in place. That is why a puffin can catch one fish and then another without dropping the first. When its beak is full, it flies back to the cliff to feed its chick.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. The bold word on this page is spines, and a sidebar beside the body adds, puffins spend most of the year far out at sea, and they come to land only to raise their young. Read the three body sentences out loud." },
      interaction: { type: "speak", text: "Tiny spines on the puffin's tongue and the roof of its mouth hold each fish in place That is why a puffin can catch one fish and then another without dropping the first When its beak is full it flies back to the cliff to feed its chick" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. The heading says Puffin Homes. Read along!",
      image: IMG("puffin-burrow"),
      narration: { audio: A("page-5-read"), script: "The last section starts here, and its heading says, Puffin Homes. Read along with me." },
      interaction: { type: "read-along", text: "In spring, thousands of puffins gather on the same grassy cliff tops to nest. A pair digs a burrow, a long tunnel in the soft soil, using the beak and the sharp claws. At the end of the tunnel the mother lays one egg, and both parents take turns keeping it warm. After about six weeks, a fluffy gray chick called a puffling hatches in the dark.", audio: A("page-5-read-sentence") },
    },
    {
      id: "model-index",
      purpose: "model",
      gate: "none",
      prompt: "The index lists every page for every small topic.",
      fx: {"text":"Contents for **big parts**, index for **every page**","effect":"underline"},
      narration: { audio: A("model-index"), script: "One more tool waits at the very back of the book. It is the index, a list of the book's small topics in A to Z order, with every page where each one appears. Listen to part of this book's index. Beak, pages one, two, and four. Burrow, page five. Puffling, page five. Spines, page four. Wings, pages two and three. Now watch me choose between two tools. Suppose I want every page that mentions the beak. The contents only lists three big sections, so it cannot tell me. The index lists beak with all three of its pages, so the index is the tool. But if I want to know where the section about puffin homes begins, the contents tells me in one glance, and the index would make me dig through a long list. Big parts, contents. Every page for one small topic, index." },
    },
    {
      id: "apply-sort-which-tool",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which tool gets you there? Sort the six questions.",
      narration: { audio: A("apply-sort-which-tool"), script: "Here are six things a reader might want from this book. For each one, decide which tool gets you there fastest. A heading, when you need a whole section. A sidebar or a caption, when you need the extra fact in the box or the fact under the picture. The index, when you need every page for one small topic. Read each card and drag it to its tool." },
      interaction: { type: "sort", buckets: ["Heading","Sidebar or Caption","Index"], items: [{ label: "which section is about homes", bucket: "Heading" }, { label: "what does the picture show", bucket: "Sidebar or Caption" }, { label: "every page that says beak", bucket: "Index" }, { label: "the extra fact in the box", bucket: "Sidebar or Caption" }, { label: "where does fishing start", bucket: "Heading" }, { label: "which pages mention wings", bucket: "Index" }], coachWrong: "Ask what the card really wants. A whole section, one small box or picture fact, or every page for one word? Then drag it to the tool built for that." },
    },
    {
      id: "apply-choose-hyperlink",
      purpose: "apply",
      gate: "interaction",
      prompt: "On the website, the blue words clown of the sea are a link. Where does it jump?",
      fx: {"text":"Blue words are a **link** that jumps","effect":"glow"},
      narration: { audio: A("apply-choose-hyperlink"), script: "Now the puffin website shows the same facts on a screen. It shows page one, and the words clown of the sea are printed in blue. On a screen, blue words are a link. Tap a link and it jumps to a different page, and the blue words themselves tell you what that page is about. Think about what clown of the sea means in the book. Tap the page that link most likely jumps to." },
      interaction: { type: "choose", options: [{ id: "puffin-nicknames", label: "puffin nicknames" }, { id: "deep-sea-fish", label: "deep sea fish" }, { id: "winter-storms", label: "winter storms" }, { id: "bird-eggs", label: "bird eggs" }], correctId: "puffin-nicknames", coachWrong: "Read the blue words again and remember what page one said about them. The link jumps to a page about that." },
    },
    {
      id: "apply-choose-search-words",
      purpose: "apply",
      gate: "interaction",
      prompt: "What do puffins eat in winter? Tap the words you would type in the search box.",
      narration: { audio: A("apply-choose-search-words"), script: "The website also has a search box. You type key words into it, and it finds the pages that hold those words. The same rule works here. Type the words that carry the meaning, and leave the little words out. Here is your question. What do puffins eat in winter? Tap the words you would type." },
      interaction: { type: "choose", options: [{ id: "puffin-winter-food", label: "puffin winter food" }, { id: "what-do-they", label: "what do they" }, { id: "winter-weather-facts", label: "winter weather facts" }, { id: "puffin-beak-colors", label: "puffin beak colors" }], correctId: "puffin-winter-food", coachWrong: "Check that set against the question. Does it name the animal, the season, and what the question is asking about, with no little words?" },
    },
    {
      id: "apply-choose-fastest-tool",
      purpose: "apply",
      gate: "interaction",
      prompt: "Does this book have a section about puffin enemies? Tap the fastest tool.",
      narration: { audio: A("apply-choose-fastest-tool"), script: "Here is a fresh question, and this time you pick the tool, not the words. You want to know whether this book has a whole section about puffin enemies, and where it would start. Four tools are on your screen, and more than one could get you there in the end. Tap the one that gets you there fastest." },
      interaction: { type: "choose", options: [{ id: "the-table-of-contents", label: "the table of contents" }, { id: "the-index", label: "the index" }, { id: "a-caption", label: "a caption" }, { id: "a-sidebar", label: "a sidebar" }], correctId: "the-table-of-contents", coachWrong: "You are hunting for a whole section and where it starts, not one small topic or one picture. Which tool shows the big parts in a single glance?" },
    },
    {
      id: "challenge-speak-search-plan",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does a puffling eat? Say the key words you would search and the tool you would use first.",
      narration: { audio: A("challenge-speak-search-plan"), script: "Last one, and you say your search plan out loud. Here is the question. What does a puffling eat? Tap the mic. Say the key words you would search for, then name the tool in this book you would go to first." },
      interaction: { type: "speak", text: "puffling pufflings eat eats eating food fish chick chicks baby index contents heading section homes page pages sidebar caption search" },
    },
    {
      id: "celebrate-search-like-a-pro",
      purpose: "celebrate",
      gate: "none",
      prompt: "Key words, then jump.",
      fx: {"text":"**Key words**, then **jump**","effect":"fireworks"},
      narration: { audio: A("celebrate-search-like-a-pro"), script: "You answered question after question about puffins, and you never read the whole book. You picked out the key words, let the contents point you to a section, found facts in a sidebar and a caption, used the index for a small topic, and on the screen you followed a link and filled a search box. Key words, then jump. That is searching like a pro." },
    },
  ],
};
