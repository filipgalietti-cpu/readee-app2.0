import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./commas-quotes-capitals-timings.json";

// Commas, Quotes, and Capitals (L.3.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=commas-quotes-capitals
// G3-U3 word-work lesson. The THIRD GRADE CENTER of L.3.2: (1) dialogue
// punctuation (quotation marks wrap exactly the spoken words, the comma sits
// between the spoken words and the speech tag inside the closing mark, the
// end mark lives inside the closing mark, and a tag-first sentence moves the
// comma to sit after the tag); (2) capitals on the first, last, and important
// words of a title while and / the / of stay small in the middle; (3) the
// comma between a city and its state (and after the day in a date, named in
// the model only); (4) possessives, one owner = apostrophe then s, more than
// one owner = s then apostrophe; (5) the three spelling rules for adding an
// ending, double the last letter (sit, sitting), drop the silent e (smile,
// smiled), change y to i (cry, cries), and the same y rule building a new
// word (happy, happiness); (6) the dictionary as the tool when no rule
// settles a spelling (check-the-dictionary L.3.4d taught HOW; this only
// says WHEN).
// Sibling split honored: letter-perfect (L.2.2) owns holiday / place capitals,
// contractions, ONE-owner apostrophes, and friendly-letter commas (Dear Gram,
// / Love, Ruby / Duke's bone / Halloween / Ohio / Chicago burned); write-it-
// right (L.1.2) owns name / day / month capitals, end marks, the date comma
// (May 10, 2026) and list commas; capital-start (K) owns the capital first
// word and the capital I; heart-words / know-them-by-heart own irregular
// spellings (none re-taught here); build-a-better-sentence (L.3.1) owns
// grammar and sentence building, never marks; new-word-new-meaning (L.3.4b)
// owns affix MEANING, this owns affix SPELLING; ending-readers (RF.1.3f)
// owns READING inflectional endings (hopping / baking tiles burned, so the
// tiles here are trot / beg / hike / chase / fry / bury and grin, grinning).
// ONE story, "The Book Box": on a rainy October Saturday Rosalie and her
// little brother Dexter pack a box of books for their cousin Winnie, who
// moved to Duluth, Minnesota (Magpie and the Lost Thimble on top, Dexter's
// elbow, Winnie's ribbons, the post office scale, a postcard of a frozen
// lake, her new friends' dogs). Two dense 5-sentence read-alongs (page one
// ~125 words, page two ~120 words), compound + early-complex, tagged
// dialogue with the tag after AND before the spoken words, a title, an
// address line, singular and plural possessives, and added-ending words
// (copying, sitting, dropped, bumped / taped, copied, hopped, hoping, smiled,
// stopped, worrying, arrived, tried, carried, hanging), no digits, no
// contractions inside read-along text, plus a 3-sentence accept-mode child
// read of a phone call with every dialogue mark.
// ANCHOR FRESHNESS python-swept across all of lessons-v2 + quizzes-v2 before
// writing: Rosalie, Dexter, Winnie, Duluth, Minnesota, magpie, thimble,
// post office, parcel, shipped, shutting, cries, happiness, receive 0 hits;
// trot / beg / grin only as K decodable tiles; hike, chase, bury, fry, marry
// tile-free (carry / try / study / hop / bake / plan / trade / kettle /
// mailbox / party / Leo / Mia burned and avoided). Keys prefixed quiz- are
// fresh picture supports for the quiz's all-fresh pet-parade frame (Nellie
// and Hector, Cedar Street, Boise, Idaho). Tiles audio-free, kebab ids,
// 28-char cap; tiles carry capitals and marks ONLY where the mark or the
// capital IS the tested content; speak texts carry no " my "; speak scenes
// imageless; every narration under about 900 characters, teaching first.

const A = (id: string) => `/audio/lessons-v2/commas-quotes-capitals/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/commas-quotes-capitals/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/commas-quotes-capitals/${w.toLowerCase()}.png`;

export const commasQuotesCapitalsImages: Record<string, string | { subject: string; ref?: string }> = {
  "book-box-kitchen": "A warm kitchen on a rainy morning, rain streaking a window over the sink, a girl of about nine with an auburn braid in a green sweater kneeling at a wooden table holding a black marker above the plain blank lid of a large brown cardboard box, a boy of about seven with curly brown hair in a yellow raincoat standing beside her hugging a tall stack of hardcover books with plain solid-colored covers, a glass jar on the table holding two curled satin ribbons, one red and one blue, a roll of packing tape and a strip of blank stamps on the table. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no titles on the books, no labels, no stickers, no writing anywhere.",
  "post-office-scale": { subject: "The inside of a small post office, a long wooden counter, a clerk with gray hair and round glasses in a blue vest lifting a large plain brown cardboard box onto a flat metal counter scale with a blank round dial, the same girl with an auburn braid in a green sweater watching with her hands pressed together, the same boy with curly brown hair in a yellow raincoat hopping on one foot beside her, a wire mail cart behind the counter, a rainy window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers on the dial, no signs, no labels, no stickers, no writing anywhere.", ref: "book-box-kitchen" },
  "quiz-nellie-banner": "A girl of about eight with two dark puffy pigtails in an orange T-shirt kneeling on a garage floor painting a long plain white cloth banner with a wide brush dipped in blue paint, the banner still completely blank, three open paint cans beside her, a small brown terrier dog sitting nearby with its mouth closed, a bicycle leaning on the wall. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.",
  "quiz-pet-parade": { subject: "A sunny neighborhood street lined with tall cedar trees, a line of children walking their pets down the middle of the road, a boy of about eleven with short dark hair in a red hoodie at the front beating a small drum that hangs from a strap, the same girl with two dark puffy pigtails in an orange T-shirt walking a small brown terrier on a leash, other children with a cat in a wagon, a rabbit in a basket, and a turtle in a box, neighbors on the sidewalk clapping, plain colored flags on strings between the trees. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing on any flag, no writing anywhere.", ref: "quiz-nellie-banner" },
  "quiz-hector-drum": { subject: "A close view of the same boy of about eleven with short dark hair in a red hoodie standing on a porch step holding a small drum with a plain blue rim against his hip, two wooden drumsticks in one hand, the same small brown terrier dog sitting at his feet looking up with its mouth closed, a plain wooden porch railing behind him. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no labels, no writing anywhere.", ref: "quiz-pet-parade" }
};

export const commasQuotesCapitals: LessonDef = {
  id: "commas-quotes-capitals",
  title: "Commas, Quotes, and Capitals",
  grade: "3rd Grade",
  standard: "L.3.2",
  archetype: "vocabulary",
  objective: "I can punctuate dialogue, capitalize a title, place the comma in an address, show an owner with an apostrophe, and spell a word when an ending goes on.",
  concepts: [
    "quotation marks wrap exactly the spoken words, and the comma sits inside the closing mark next to the speech tag",
    "the first, last, and important words of a title get capital letters",
    "a comma sits between a city and its state",
    "one owner is apostrophe then s, more than one owner is s then apostrophe",
    "double the last letter, drop the silent e, or change y to i before an ending goes on",
    "when no rule settles a spelling, check the dictionary",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you kept every mark in its place. Quotation marks around the spoken words, a comma inside the closing mark, capitals on the big words of a title, a comma between the city and the state, an apostrophe that shows the owner, and a base word that doubles, drops its e, or turns its y into an i before an ending goes on. When no rule settles a spelling, you open the dictionary.",
    "title": "Every Mark in Its Place",
    "body": "You punctuated dialogue, capitalized a title, placed the address comma, showed the owner with an apostrophe, and spelled words with endings by the rules."
  },
  scenes: [
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Page one, the book box. Read along!",
      image: IMG("book-box-kitchen"),
      narration: { audio: A("hook-read-page-one"), script: "Hello, writer. Third grade writing has rules that a reader can see. Quotation marks show exactly which words a person said. A comma sits between a city and its state. An apostrophe shows who owns something. And a base word changes its spelling when an ending goes on. Today every one of those rules shows up in a story about a box of books. Read along with me, and notice the marks doing their jobs." },
      interaction: { type: "read-along", text: "On the first rainy Saturday of October, Rosalie and her brother Dexter packed a box of books to mail to their cousin Winnie, who had moved to Duluth, Minnesota, in August. \"She will want the magpie book first,\" said Dexter, and he slid Magpie and the Lost Thimble to the very top of the pile. Rosalie was copying the address onto the lid when Dexter's elbow bumped the marker, so the last line came out wobbly and she had to start over. \"Do we send the ribbons too?\" asked Rosalie, holding up two bookmarks that had been sitting in a jar since Winnie's last visit. Dexter nodded, because the ribbons were Winnie's and not theirs, and he dropped them in beside the books before Rosalie could change her mind.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "model-dialogue-marks",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the marks around spoken words.",
      fx: {"text":"\"She will want the magpie book **first,**\" said Dexter.","effect":"underline"},
      narration: { audio: A("model-dialogue-marks"), script: "Here is how the marks work when a person speaks. Dexter said seven words. She will want the magpie book first. The quotation marks wrap exactly those seven words and nothing else. The words said Dexter are the speech tag, and the tag tells the reader who spoke. A comma sits between the spoken words and the tag, right after the word first, and that comma lives inside the closing quotation mark. When the tag comes first, the comma moves to sit after the tag, right before the opening quotation mark. When the spoken words end the whole sentence, the period lives inside the closing quotation mark too. A question mark or an exclamation point takes the place of the comma, like Rosalie's question about the ribbons, and it lives inside the marks as well." },
    },
    {
      id: "guided-choose-dialogue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence has every mark in its place?",
      narration: { audio: A("guided-choose-dialogue"), script: "Your turn. Four versions of one sentence are on your screen, and only one has every mark in its place. Check three things. The quotation marks wrap only the spoken words. A comma sits between the spoken words and the speech tag. That comma lives inside the closing quotation mark. Read all four closely, then tap the one written right." },
      interaction: { type: "choose", options: [{ id: "comma-inside-closing-mark", label: "\"Hold the lid,\" said Dexter." }, { id: "no-comma-at-all", label: "\"Hold the lid\" said Dexter." }, { id: "marks-close-after-the-tag", label: "\"Hold the lid, said Dexter.\"" }, { id: "period-before-the-tag", label: "\"Hold the lid.\" said Dexter." }], correctId: "comma-inside-closing-mark", coachWrong: "Find the spoken words first. Do the quotation marks wrap only those words? Then look for the comma between the spoken words and the tag, and check which side of the closing mark it sits on." },
    },
    {
      id: "guided-highlight-title",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap every word in this title that still needs a capital letter.",
      narration: { audio: A("guided-highlight-title"), script: "Book titles follow their own capital rule. The first word, the last word, and every important word get a capital letter. Small joining words like and, the, of, and a stay small when they sit in the middle of the title. The title of the book on top of the pile is on your screen, typed all in small letters. Tap every word that needs a capital letter." },
      interaction: { type: "highlight", text: "magpie and the lost thimble", targets: ["magpie","lost","thimble"], coachWrong: "Ask about that word. Is it the first word, the last word, or an important word? Or is it a small joining word sitting in the middle?" },
    },
    {
      id: "model-comma-and-apostrophe",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: the address comma and the owner apostrophe.",
      fx: {"text":"**Duluth,** Minnesota and **Dexter's** elbow","effect":"underline"},
      narration: { audio: A("model-comma-and-apostrophe"), script: "Two more marks from page one. Rosalie wrote Duluth, Minnesota on the lid. A comma sits between the city and the state, every time, on an address line and inside a sentence. The same kind of comma sits after the day in a date, between the number of the day and the year. Now the apostrophe, which shows who owns something. Dexter's elbow means the elbow belongs to Dexter. One owner takes an apostrophe and then the letter s. When more than one person or animal owns something, the word already ends in s, so the apostrophe goes after that s. The teachers' desks means the desks belong to more than one teacher. Ask two questions every time. Whose is it? And how many owners are there?" },
    },
    {
      id: "guided-choose-address",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which line puts the comma where an address needs it?",
      narration: { audio: A("guided-choose-address"), script: "Rosalie printed the city and the state on the lid of the box. One of these four lines puts the comma exactly where an address needs it. The other three put it in the wrong spot or leave it out. Read all four, then tap the line written right." },
      interaction: { type: "choose", options: [{ id: "comma-between-city-and-state", label: "Duluth, Minnesota" }, { id: "no-comma", label: "Duluth Minnesota" }, { id: "comma-after-the-state", label: "Duluth Minnesota," }, { id: "comma-before-the-city", label: ", Duluth Minnesota" }], correctId: "comma-between-city-and-state", coachWrong: "The comma belongs between two things, the city and the state. Look for the line where the comma sits at exactly that meeting point." },
    },
    {
      id: "guided-choose-owner",
      purpose: "guided",
      gate: "interaction",
      prompt: "Two of Winnie's friends each own a dog. Tap the card written right.",
      narration: { audio: A("guided-choose-owner"), script: "Winnie made two friends in Duluth, and each friend owns a dog, so the dogs have more than one owner. Only one of these four cards shows that. Ask how many owners there are, then look at where the apostrophe sits. Read each card closely, then tap the one written right." },
      interaction: { type: "choose", options: [{ id: "apostrophe-after-the-s", label: "the friends' dogs" }, { id: "apostrophe-before-the-s", label: "the friend's dogs" }, { id: "no-apostrophe", label: "the friends dogs" }, { id: "apostrophe-on-the-box", label: "the friend dogs'" }], correctId: "apostrophe-after-the-s", coachWrong: "Count the owners first. Two friends own the dogs. Then check whether the apostrophe comes before the s or after it." },
    },
    {
      id: "model-ending-rules",
      purpose: "model",
      gate: "none",
      prompt: "Watch me: three rules before an ending goes on.",
      fx: {"text":"**sitting**, **smiled**, **cries**, **happiness**","effect":"pop-words"},
      narration: { audio: A("model-ending-rules"), script: "Now the spelling rules for adding an ending. Rule one, double the last letter. Sit has one short vowel and ends in one consonant, so before the letters i, n, g go on, the t is written twice. Sit, sitting. Rule two, drop the silent e. Smile ends in a silent e, so the e comes off before the letters e, d go on. Smile, smiled. Rule three, change y to i. Cry ends in a consonant and then y, so the y turns into an i before the letters e, s go on. Cry, cries. The same rule builds a whole new word. Happy ends in a consonant and then y. Change the y to an i, then add the letters n, e, s, s. Happy, happiness. Three rules, and they cover most of the endings you will ever add." },
    },
    {
      id: "guided-transform-grinning",
      purpose: "guided",
      gate: "interaction",
      prompt: "Grin, happening right now. Tap the piece that builds the word.",
      narration: { audio: A("guided-transform-grinning"), script: "Your turn to build a word. The base word is grin, like Dexter did when the box was ready. Add the ending that means it is happening right now. Before you tap, check the rule. Grin has one short vowel and ends in one consonant. Tap the piece that builds the word the right way." },
      interaction: { type: "transform", base: "grin", add: "ning", result: "grinning", changeIndex: 3, options: ["ning", "ing", "ed"], labels: { changed: "doubled", added: "ending" }, successAudio: W("grinning"), coachWrong: "Check the rule again. One short vowel, one last consonant. What happens to that consonant before the ending goes on?" },
    },
    {
      id: "apply-sort-ending-rules",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each base word by the rule it needs before ed goes on.",
      narration: { audio: A("apply-sort-ending-rules"), script: "Six base words are on your screen, and each one needs a rule before the ending e, d goes on. Look at how the word ends. One short vowel and one consonant means Double the Letter. A silent e at the end means Drop the E. A consonant and then y means Change Y to I. Drag each word to the rule it needs." },
      interaction: { type: "sort", buckets: ["Double the Letter","Drop the E","Change Y to I"], items: [{ label: "trot", bucket: "Double the Letter" }, { label: "hike", bucket: "Drop the E" }, { label: "fry", bucket: "Change Y to I" }, { label: "beg", bucket: "Double the Letter" }, { label: "chase", bucket: "Drop the E" }, { label: "bury", bucket: "Change Y to I" }], coachWrong: "Look at the last two letters of that word. Do you see a short vowel and one consonant, a silent e, or a consonant and then y?" },
    },
    {
      id: "apply-read-page-two",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, the post office. Read along!",
      image: IMG("post-office-scale"),
      narration: { audio: A("apply-read-page-two"), script: "Page two takes the box to the post office, and every rule from today shows up again. A speech tag that comes before the spoken words. An address on a lid. An owner word for more than one person. And words that changed their spelling when an ending went on. Read along with me, and notice each one." },
      interaction: { type: "read-along", text: "By noon the box was taped shut, and Rosalie had copied the address one last time in her neatest printing, with Duluth, Minnesota, on the bottom line. At the post office the clerk lifted the box onto the scale and said, \"Books are heavier than they look,\" while Dexter hopped from one foot to the other. Rosalie was hoping the stamps would be enough, and when the clerk smiled and slid the box onto the cart, she stopped worrying. Two weeks later a postcard arrived with a photo of a frozen lake, and Winnie had written on the back that both of her new friends' dogs had tried to eat the ribbons. Dexter read the postcard three times, then he carried it upstairs and pinned it above his bed, where it is still hanging.", audio: A("apply-read-page-two-sentence") },
    },
    {
      id: "apply-choose-dictionary",
      purpose: "apply",
      gate: "interaction",
      prompt: "When should a writer open the dictionary?",
      narration: { audio: A("apply-choose-dictionary"), script: "One tool is left, and you already know how to use it. A dictionary settles a spelling when no rule can. Here are four moments from the day. One. Rosalie adds the letters e, d to hop and knows the doubling rule. Two. Rosalie is not sure whether receive has i before e or e before i. Three. Dexter reads the word magpie on the cover. Four. Dexter writes his own name. Tap the moment when the dictionary is the right tool." },
      interaction: { type: "choose", options: [{ id: "adding-ed-to-hop", label: "adding ed to hop" }, { id: "spelling-receive", label: "spelling receive" }, { id: "reading-magpie-on-the-cover", label: "reading magpie on the cover" }, { id: "writing-his-own-name", label: "writing his own name" }], correctId: "spelling-receive", coachWrong: "Ask whether a rule already settles that spelling, or whether the writer already knows the word. The dictionary is for the spelling that nobody at the table can settle." },
    },
    {
      id: "apply-speak-read-phone-call",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: \"Is it heavy?\" asked Winnie. \"It is full of books,\" said Rosalie, and she taped the lid shut. Dexter grinned and said, \"Do not shake it.\"",
      narration: { audio: A("apply-speak-read-phone-call"), script: "Winnie called that night, and the phone call is on your screen. Three sentences carry every dialogue mark from today. Read them out loud, clearly and at a talking pace, and let your voice climb at the question mark." },
      interaction: { type: "speak", text: "Is it heavy asked Winnie It is full of books said Rosalie and she taped the lid shut Dexter grinned and said Do not shake it" },
    },
    {
      id: "challenge-speak-own-dialogue",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a sentence with a speech tag. Then tell where the comma and the quotation marks go.",
      narration: { audio: A("challenge-speak-own-dialogue"), script: "Last one, and it is yours to build. Think of something a friend might say, and put a speech tag on it, like said Rosalie or asked Dexter. Tap the mic. Say your sentence out loud, then tell me where the quotation marks go and where the comma sits." },
      interaction: { type: "speak", text: "said asked comma quotation marks quote quotes before after inside around opening closing open close end period words tag name speech spoken first last between mark sentence" },
    },
    {
      id: "celebrate-every-mark",
      purpose: "celebrate",
      gate: "none",
      prompt: "Every mark in its place.",
      fx: {"text":"Every mark in its **place**","effect":"fireworks"},
      narration: { audio: A("celebrate-every-mark"), script: "Today you used the marks a third grade writer owns. Quotation marks wrap the spoken words, and the comma sits inside the closing mark next to the speech tag. Capitals go on the first, last, and important words of a title. A comma sits between a city and its state. An apostrophe shows the owner, before the s for one and after the s for more than one. And a base word doubles its last letter, drops its e, or turns its y into an i before an ending goes on. When no rule settles a spelling, open the dictionary. Keep every mark in its place." },
    },
  ],
};
