import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./check-the-dictionary-timings.json";

// Check the Dictionary (L.3.4d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=check-the-dictionary
// G3-U2 word-work lesson. THE FOURTH TOOL: when read-around / take-apart /
// find-the-root leave you unsure, or when close-enough is not good enough,
// a third grader checks a dictionary or glossary for the PRECISE meaning.
// The move: find the entry fast (alphabetical order to the second and third
// letter, then the guide words at the top of the page), read the entry's
// four parts (the word, how to say it, the numbered meanings, an example
// sentence), and pick the ONE numbered meaning that fits the sentence you
// were reading. The same move on a digital dictionary (type the word, tap
// the speaker to hear it, scroll the numbered meanings) and in the glossary
// at the back of a fact book (only the topic's words, only the meaning the
// book uses). Sibling split honored: look-it-up (L.2.4e) owns G2 first- and
// second-letter ABC order, the three-part entry, gallop/timid/seal/pitcher,
// and its quiz previews guide words lake/lunch + third-letter stamp/sting,
// so every stimulus here is new; word-toolbox (L.1.4) owns bark/bat/ring;
// three-word-tools (L.3.4) owns the choosing among the other three tools
// and deliberately did not teach the dictionary; search-like-a-pro (RI.3.5)
// owns text features and search tools (contents, index, sidebar, link,
// search box), none of which appear here. ONE story: Hattie's first
// Saturdays at Ms. Marlow's clay studio, where a potter's words carry exact
// meanings (throw, wedge, slip, fire, glaze, kiln). Dictionary entries are
// SPOKEN by the narrator (read-along text splits on whitespace, so no entry
// layout on screen). ANCHOR FRESHNESS grep-swept across all of lessons-v2 +
// quizzes-v2: pottery, kiln, glaze, studio, wedge (as a verb), slip (potter's
// sense), throw (potter's sense), guide-word pairs sleeve/slope, skate/sleep,
// slow/smoke, snap/soap, thick/thumb are catalog-first; names Hattie and
// Marlow fresh (Elena burned). Images show the SUBJECTS of the words (the
// wheel, the kiln, the glazed bowl), never a book page. Tiles lowercase,
// audio-free, kebab ids, 28-char cap; speak texts carry no " my ".

const A = (id: string) => `/audio/lessons-v2/check-the-dictionary/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/check-the-dictionary/${w.toLowerCase()}.png`;

export const checkTheDictionaryImages: Record<string, string | { subject: string; ref?: string }> = {
  "studio-first-saturday": "Inside a sunny pottery studio, a young girl with freckles and two short red-brown braids in a green apron standing beside a spinning potter's wheel with a wet grey lump of clay splattered on the wooden floor beside it, and a tall woman with short silver hair, brown skin, and a clay-stained blue apron laughing kindly beside her, wooden shelves of plain unpainted clay bowls and mugs along the back wall, a big window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no books, no paper, no writing anywhere.",
  "kiln-room": { subject: "The same young girl with freckles and two short red-brown braids in a green apron staring up at a big square brick kiln oven as tall as she is, its heavy door open a crack with a warm orange glow inside, a wooden shelf beside it holding a row of small plain unpainted clay bowls, the same tall woman with short silver hair, brown skin, and a clay-stained blue apron resting one hand on the shelf, inside the same sunny pottery studio.", ref: "studio-first-saturday" },
  "glazed-bowl": { subject: "The same young girl with freckles and two short red-brown braids in a green apron smiling and holding up a small shiny bright blue glazed clay bowl with both hands, the same sunny pottery studio behind her with wooden shelves of plain bowls, a small wide paintbrush and a jar of blue liquid on the table in front of her.", ref: "studio-first-saturday" },
  "quiz-bike-pump": "A close view of a red bicycle leaning on a stand inside a small repair shop, a hand pump with a black hose attached to the front tire, a boy's hands pressing the pump handle down, plain wooden workbench behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-bike-chain": "A close view of a bicycle's shiny metal chain looping around the toothed wheel by the pedal, a small drop of oil falling onto the chain from a tiny oil can held by a hand, plain grey workshop floor behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-patched-tube": "A black rubber bicycle inner tube lying flat on a wooden workbench with one small round orange rubber patch pressed over a hole, a pair of hands smoothing the patch down, a small tin of glue beside it with a plain lid and no label. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
};

export const checkTheDictionary: LessonDef = {
  id: "check-the-dictionary",
  title: "Check the Dictionary",
  grade: "3rd Grade",
  standard: "L.3.4d",
  archetype: "vocabulary",
  objective: "I can find a word's entry fast, read its parts, and pick the numbered meaning that fits my sentence exactly.",
  concepts: [
    "when the other tools leave you unsure, or close is not good enough, check a dictionary",
    "find the entry fast: second letter, third letter, then the guide words at the top of the page",
    "an entry has four parts: the word, how to say it, the numbered meanings, an example sentence",
    "the numbered meaning that fits the sentence is the precise meaning",
    "a digital dictionary works the same way: type the word, tap the speaker, scroll the meanings",
    "a glossary keeps only the book's important words, with the meaning the book uses",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You have a fourth tool now, and you know when to reach for it. When the other tools leave you unsure, or when close is not good enough, you check the dictionary. You found entries fast with the second letter, the third letter, and the guide words. You read the four parts of an entry, and you picked the one numbered meaning that fit the sentence. That meaning is the precise one, and it is the one a strong reader wants.",
    "title": "Precise Meaning Finder!",
    "body": "You found entries fast, read their parts, and picked the numbered meaning that fit the sentence exactly."
  },
  scenes: [
    {
      id: "hook-read-first-saturday",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a clay studio. Read along!",
      image: IMG("studio-first-saturday"),
      narration: { audio: A("hook-read-first-saturday"), script: "Hello, reader. You own three word tools, and today you get a fourth one, for the moments when the first three leave you unsure, or when close is not good enough. The story starts in a clay studio. Read along with me, and watch what happens when a reader settles for a meaning that is only close." },
      interaction: { type: "read-along", text: "On her first Saturday at the clay studio, Hattie read the class list taped beside the door, and it said that beginners would wedge the clay, throw a bowl, and fire it in the kiln. She knew what throw meant, so she picked up a lump of grey clay and flung it at the spinning wheel as hard as she could. It landed with a wet slap, wobbled twice, and sailed off onto the floor. \"Close enough is not enough in this room,\" said Ms. Marlow, wiping the splatter from her apron, \"because a potter's words have exact meanings.\" Then she set a fat blue dictionary on the bench beside the wheel, and she opened a thin fact book to the glossary at the back.", audio: A("hook-read-first-saturday-sentence") },
    },
    {
      id: "model-close-is-not-enough",
      purpose: "model",
      gate: "none",
      prompt: "When close is not good enough, check the dictionary.",
      fx: {"text":"**Close enough** is not enough","effect":"cross-out"},
      narration: { audio: A("model-close-is-not-enough"), script: "Throw did not stop Hattie the way a brand new word does. She already knew a meaning for throw, and it was close enough to get her started, and close enough is what sent the clay onto the floor. You own three tools. You can read around a word, take it apart, or find the root you know. Sometimes those tools leave you unsure, and sometimes close is not good enough, because you need the exact meaning. That is when a third grader reaches for the fourth tool. A dictionary lists almost every word in the language with all of its meanings. A glossary is the short word list at the back of a fact book, and it keeps only that book's important words. Today you learn to find the entry fast, read its parts, and pick the one meaning that fits your sentence. That one meaning is the precise meaning." },
    },
    {
      id: "model-find-the-entry-fast",
      purpose: "model",
      gate: "none",
      prompt: "Watch me find throw fast: second letter, third letter, guide words.",
      fx: {"text":"Second letter, **third letter**, then the **guide words**","effect":"underline"},
      narration: { audio: A("model-find-the-entry-fast"), script: "A dictionary is one long list in alphabetical order, so watch how I find throw fast. The first letter is t, so I open near the back of the book. Now the second letter. Throw starts with t and then h, so it sits with the t h words, after every t a and t e word and before every t o and t r word. That is still hundreds of words, so I use the third letter, the letter r. Here is the trick that saves the most time. At the top of every page sit two guide words, the first word on that page and the last word on that page. I flip until the guide words at the top say thick and thumb. Thick is t, h, i. Thumb is t, h, u. Throw is t, h, r, and the letter r comes after i and before u, so throw lives on this page. Second letter, third letter, guide words. That is the fast way in." },
    },
    {
      id: "guided-choose-which-page-slip",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which page holds slip? Tap its guide words.",
      narration: { audio: A("guided-choose-which-page-slip"), script: "Your turn. Hattie needs the entry for slip. Slip is s, l, i, p. Four pairs of guide words are on your screen, one pair for each page. Check the second letter, then the third letter, and tap the pair of guide words that slip falls between." },
      interaction: { type: "choose", options: [{ id: "sleeve-and-slope", label: "sleeve and slope" }, { id: "skate-and-sleep", label: "skate and sleep" }, { id: "slow-and-smoke", label: "slow and smoke" }, { id: "snap-and-soap", label: "snap and soap" }], correctId: "sleeve-and-slope", coachWrong: "Line slip up against both guide words. Its second letter is l, and its third letter is i. Slip has to come after the first guide word and before the second one." },
    },
    {
      id: "guided-sequence-dictionary-order",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the five words in dictionary order.",
      narration: { audio: A("guided-sequence-dictionary-order"), script: "Now build a page of your own. Five studio words are on your screen, and every one of them starts with the letter c. Look at the second letter of each word, and when two words share the second letter too, go on to the third. Tap the words in dictionary order, from first to last." },
      interaction: { type: "sequence", items: [{ id: "clay", label: "clay" }, { id: "clip", label: "clip" }, { id: "coil", label: "coil" }, { id: "crack", label: "crack" }, { id: "cup", label: "cup" }], order: ["clay","clip","coil","crack","cup"], coachWrong: "Every word starts with c, so the first letter cannot decide. Compare the second letters against the alphabet, and when they match, compare the third." },
    },
    {
      id: "model-entry-parts",
      purpose: "model",
      gate: "none",
      prompt: "An entry has four parts. Listen to the entry for slip.",
      fx: {"text":"the **word**, how to **say** it, the **meanings**, an **example**","effect":"pop-words"},
      narration: { audio: A("model-entry-parts"), script: "Here is the page with sleeve and slope at the top, and here is the entry for slip. Every entry has four parts, and I read them in order. First comes the word itself, slip, printed in dark letters. Next comes how to say it, the word written the way it sounds, broken into its sounds, so you can say a word you have never heard before. Then come the meanings, and when a word has more than one, the dictionary numbers them. The entry for slip says, number one, to slide by accident and lose your balance. Number two, wet, runny clay that potters brush on like glue to stick two pieces together. Number three, a small piece of paper. Last comes an example sentence that shows the word at work. The example says, she brushed slip on the handle before she pressed it onto the mug. The word, how to say it, the numbered meanings, an example. Four parts, every time." },
    },
    {
      id: "guided-choose-slip-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which numbered meaning fits the sentence?",
      narration: { audio: A("guided-choose-slip-meaning"), script: "Now the entry meets the sentence. Ms. Marlow said, brush slip on both edges before you join the two pieces of clay. Hattie read three numbered meanings. Only one of them fits that sentence exactly, and that one is the precise meaning. Test each meaning on your screen inside the sentence, and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "runny-clay-used-like-glue", label: "runny clay used like glue" }, { id: "sliding-and-losing-balance", label: "sliding and losing balance" }, { id: "a-small-piece-of-paper", label: "a small piece of paper" }, { id: "a-quick-careless-mistake", label: "a quick careless mistake" }], correctId: "runny-clay-used-like-glue", coachWrong: "Put that meaning into the sentence. Brush it on both edges to join two pieces of clay. Only one meaning is something you could brush on." },
    },
    {
      id: "apply-read-second-saturday",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The story continues. Read along!",
      image: IMG("kiln-room"),
      narration: { audio: A("apply-read-second-saturday"), script: "Back to the studio, one week later. This page hides three more potter's words, and for two of them you already know a meaning. Read along with me, and notice where close might not be good enough." },
      interaction: { type: "read-along", text: "By the second Saturday, Hattie could wedge the clay, pressing and folding it against the table until every air bubble was gone, because a trapped bubble can burst inside the kiln. She threw a small bowl that leaned like a tired flower, and Ms. Marlow set it on a shelf to dry for a week. \"On Monday I will fire the whole shelf,\" said Ms. Marlow, \"and the bowls will come out as hard as stone.\" Hattie stared at the kiln, a brick oven as tall as she was, and she wondered whether fire meant flames. She did not guess this time, since the dictionary sat within reach, and a guess that is close is still a guess.", audio: A("apply-read-second-saturday-sentence") },
    },
    {
      id: "apply-choose-wedge-precise",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which is the precise meaning of wedge here?",
      narration: { audio: A("apply-choose-wedge-precise"), script: "Wedge. You can read around it, because the sentence says Hattie was pressing and folding the clay until the air bubbles were gone. Reading around gets you close. The dictionary gets you exact. The entry for wedge says, number one, a piece that is thick at one end and thin at the other, like a slice of pie. Number two, to force something into a tight space. Number three, to press and fold clay over and over to push out the air bubbles. One meaning on your screen is close, and one is precise. Tap the precise meaning, the one the entry and the sentence both agree on." },
      interaction: { type: "choose", options: [{ id: "fold-clay-to-push-out-air", label: "fold clay to push out air" }, { id: "squeeze-the-clay-a-little", label: "squeeze the clay a little" }, { id: "cut-a-thick-slice-of-clay", label: "cut a thick slice of clay" }, { id: "force-it-into-a-tight-space", label: "force it into a tight space" }], correctId: "fold-clay-to-push-out-air", coachWrong: "Close is not the same as exact. Match the sentence, pressing and folding until the bubbles were gone, to the numbered meaning that says the same thing." },
    },
    {
      id: "apply-sort-fits-meaning-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Meaning three of fire: to bake clay in a kiln until it is hard. Sort the sentences.",
      narration: { audio: A("apply-sort-fits-meaning-three"), script: "Hattie looked up fire, and the entry has several numbered meanings. Number one, the flames and heat of something burning. Number two, to make someone leave a job. Number three, to bake clay in a kiln until it turns hard. Six sentences are on your screen. If a sentence uses fire with meaning number three, the potter's meaning, drag it to Fits Meaning Three. If it uses any other meaning of fire, drag it to Does Not Fit." },
      interaction: { type: "sort", buckets: ["Fits Meaning Three","Does Not Fit"], items: [{ label: "she fires the bowls Monday", bucket: "Fits Meaning Three" }, { label: "we sat close to the fire", bucket: "Does Not Fit" }, { label: "he fired ten mugs on Tuesday", bucket: "Fits Meaning Three" }, { label: "the boss fired the cook", bucket: "Does Not Fit" }, { label: "she fired her first vase", bucket: "Fits Meaning Three" }, { label: "the fire truck raced past", bucket: "Does Not Fit" }], coachWrong: "Put meaning number three into that sentence. Does baking clay in a kiln make sense there? If not, the sentence is using a different meaning of fire." },
    },
    {
      id: "apply-choose-tap-to-hear",
      purpose: "apply",
      gate: "interaction",
      prompt: "On the tablet dictionary, what do you tap to hear glaze said aloud?",
      narration: { audio: A("apply-choose-tap-to-hear"), script: "Ms. Marlow keeps a dictionary on the studio tablet too, and it works the same way with fewer steps. There are no pages to flip, so you type the word into the box at the top, g, l, a, z, e, and the entry appears. The parts are the same. The word, how to say it, the numbered meanings, an example. One part is even better on a screen. Beside the word sits a small picture of a speaker, and when you tap it, the tablet says the word out loud, so you hear it exactly right. Four things you might tap are on your screen. Tap the one that plays the word." },
      interaction: { type: "choose", options: [{ id: "the-speaker-picture", label: "the speaker picture" }, { id: "the-star-picture", label: "the star picture" }, { id: "the-house-picture", label: "the house picture" }, { id: "the-arrow-picture", label: "the arrow picture" }], correctId: "the-speaker-picture", coachWrong: "Think about what plays sound on a tablet. Which small picture sits beside the word to say it out loud?" },
    },
    {
      id: "apply-choose-glaze-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which numbered meaning of glaze fits the sentence?",
      narration: { audio: A("apply-choose-glaze-meaning"), script: "Now scroll down the entry with me, past how to say it, to the numbered meanings. Number one, a thin glassy coating that is painted onto clay and baked on in the kiln, so the pot shines and holds water. Number two, a sweet, shiny coating on a cake or a doughnut. Number three, when eyes glaze, they turn dull and stop paying attention. Here is the sentence from the class list. Next Saturday you will glaze your bowl. Tap the precise meaning for that sentence." },
      interaction: { type: "choose", options: [{ id: "glassy-coat-baked-onto-clay", label: "glassy coat baked onto clay" }, { id: "sweet-icing-on-a-doughnut", label: "sweet icing on a doughnut" }, { id: "eyes-going-dull-and-tired", label: "eyes going dull and tired" }, { id: "a-thin-sheet-of-window-glass", label: "a thin sheet of window glass" }], correctId: "glassy-coat-baked-onto-clay", coachWrong: "Test it in the sentence. You will do this to your bowl in a pottery studio. Which meaning belongs on a clay bowl?" },
    },
    {
      id: "apply-choose-glossary-word",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word would you find in the fact book's glossary?",
      narration: { audio: A("apply-choose-glossary-word"), script: "One more tool waits at the back of Ms. Marlow's thin fact book about pottery. It is the glossary, a short list of the book's important words, each with the meaning the book uses. A glossary does not list every word. It skips the everyday words, it keeps only the words that matter to the topic, and it gives each one just the meaning this book needs, so there is no scrolling through numbers. Four words from the book are on your screen. Only one of them belongs in a pottery glossary. Tap it." },
      interaction: { type: "choose", options: [{ id: "kiln", label: "kiln" }, { id: "shelf", label: "shelf" }, { id: "water", label: "water" }, { id: "door", label: "door" }], correctId: "kiln", coachWrong: "A glossary keeps the special words of the topic, the ones a reader might not know yet. Is that word special to pottery, or is it an everyday word?" },
    },
    {
      id: "apply-speak-read-third-saturday",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: On the third Saturday, Hattie lifted her bowl out of the kiln, and it rang like a bell when she tapped it. She brushed on a blue glaze, and she did not have to guess what one word on the class list meant, because the dictionary had told her exactly.",
      narration: { audio: A("apply-speak-read-third-saturday"), script: "The story ends on the third Saturday, and these two sentences are yours to read. Read them out loud, clearly and with feeling." },
      interaction: { type: "speak", text: "On the third Saturday Hattie lifted her bowl out of the kiln and it rang like a bell when she tapped it She brushed on a blue glaze and she did not have to guess what one word on the class list meant because the dictionary had told her exactly" },
    },
    {
      id: "challenge-speak-precise-slip",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what slip means in Hattie's sentence, and tell how you found the entry.",
      narration: { audio: A("challenge-speak-precise-slip"), script: "Last one, and it is all yours. Hattie brushed slip on both edges before she joined the two pieces of clay. Tap the mic. Say the precise meaning of slip in that sentence, and then tell me how you found its entry so fast." },
      interaction: { type: "speak", text: "runny wet watery liquid soft clay glue paste stick sticks sticking join joins joining brush brushed pieces second third letter letters guide words page top between alphabet alphabetical order" },
    },
    {
      id: "celebrate-precise-meaning",
      purpose: "celebrate",
      gate: "none",
      prompt: "Find it fast, read the parts, pick the precise meaning.",
      fx: {"text":"Find it **fast**, pick the **precise** meaning","effect":"fireworks"},
      narration: { audio: A("celebrate-precise-meaning"), script: "You have a fourth tool now, and you know when to reach for it. When the other tools leave you unsure, or when close is not good enough, you check the dictionary. Second letter, third letter, guide words, and you are on the page. The word, how to say it, the numbered meanings, an example, and you have the entry. Then you test each numbered meaning in your sentence, and the one that fits is the precise meaning. Throw, slip, wedge, fire, glaze. Hattie never had to guess again, and neither do you." },
    },
  ],
};
