import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Commas, Quotes, and Capitals QUIZ (L.3.2) · FACTORY-AUTHORED from the
// finished lesson (scripts/quiz-author.ts), human-reviewed. Bands:
// easier(G2-bridge, 3-opt: a capital for a day, an end mark, a ONE-owner
// apostrophe, a capital for a place, with 3 picture supports) / core(on-
// grade G3: dialogue punctuation with 4 printed versions, title capitals,
// the two commas of a street-city-state address line, a plural possessive,
// the Double the Letter / Drop the E / Change Y to I sort with b-* bucket
// clips, and a production speak with 26 accepts) / harder(G4 L.4.2 TAUGHT
// in the stimulus first: the comma before and / but / so in a compound
// sentence, modeled then applied; quotation marks and a comma for words
// copied from a text, modeled then applied; the whole-sentence test for
// when NO comma is needed; a production speak). The lesson's add-an-ending
// transform is not repeated here (the sort carries the three rules; six core
// slots). ALL stimuli FRESH vs the lesson (no Rosalie, Dexter, Winnie,
// Duluth, magpie, thimble, trot, beg, hike, chase, fry, bury, grin) and
// grep-swept vs the whole catalog: Nellie, Hector, Cedar Street, Boise,
// Idaho, pet parade, banner, leashes, hum, nod, glide, wipe, hurry, reply,
// A Dog and the Lost Leash, Line up, Keep left 0 tile hits. Frame: Nellie
// (eight, pigtails, the terrier) and her big brother Hector (eleven, the
// drum) run the Cedar Street pet parade in Boise, Idaho. Tiles audio-free,
// kebab ids; tiles carry capitals and marks only where the mark or the
// capital IS the tested content; bucket clips are quiz-local b-*.mp3 pre-
// synthed from punctuated labels; every stimulus is spoken inside its own
// question or printed on screen (no earlier-question recall); a printed
// sentence is the stimulus wherever the child answers from marks.

const Q = "/audio/quizzes-v2/commas-quotes-capitals-quiz";
const IMG = (w: string) => `/images/lessons-v2/commas-quotes-capitals/${w.toLowerCase()}.png`;

export const commasQuotesCapitalsQuiz: QuizDef = {
  id: "commas-quotes-capitals-quiz",
  lessonId: "commas-quotes-capitals",
  title: "Commas, Quotes, and Capitals Quiz",
  standard: "L.3.2",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-capital-day",
      band: "easier",
      difficulty: 1,
      prompt: "Tap the word that needs a capital: The parade starts on saturday.",
      image: IMG("quiz-nellie-banner"),
      narration: { audio: `${Q}/e-1-capital-day.mp3`, script: "Listen. Nellie painted a banner for the pet parade on Cedar Street, and the sentence she wrote is on your screen. One word in it names a day of the week, and the name of a day always gets a capital letter. Three words from the sentence are on your screen. Tap the word that still needs a capital." },
      hint: { audio: `${Q}/e-1-capital-day-hint.mp3`, script: "Read the three words again. Which one of them is the name of a day?" },
      explain: { audio: `${Q}/e-1-capital-day-explain.mp3`, script: "Saturday needs the capital letter, because the names of the days of the week always start with a capital. Parade and starts are plain words, so they stay small." },
      interaction: { type: "choose", options: [{ id: "saturday", label: "saturday" }, { id: "parade", label: "parade" }, { id: "starts", label: "starts" }], correctId: "saturday", coachWrong: "That word could mean any parade or any start. Look for the name of one day of the week." },
    },
    {
      id: "e-2-end-mark",
      band: "easier",
      difficulty: 2,
      prompt: "What a loud parade this is ___",
      image: IMG("quiz-pet-parade"),
      narration: { audio: `${Q}/e-2-end-mark.mp3`, script: "Listen. The parade came down Cedar Street with a drum at the front, and Nellie shouted a sentence with a big feeling in it. Three end marks are on your screen, and the sentence is on your screen too. Say it to yourself with feeling, then tap the mark that fits at the end. What a loud parade this is." },
      hint: { audio: `${Q}/e-2-end-mark-hint.mp3`, script: "Nellie shouted that sentence, so the feeling in it is big. Which end mark shows a big feeling?" },
      explain: { audio: `${Q}/e-2-end-mark-explain.mp3`, script: "An exclamation point fits, because the sentence bursts with a big feeling. A period is for calm telling, and a question mark is for asking." },
      interaction: { type: "choose", options: [{ id: "exclamation-point", label: "!" }, { id: "period", label: "." }, { id: "question-mark", label: "?" }], correctId: "exclamation-point", coachWrong: "Say the sentence the way Nellie shouted it. Is it calmly telling, asking, or bursting with feeling?" },
    },
    {
      id: "e-3-one-owner",
      band: "easier",
      difficulty: 3,
      prompt: "The drum belongs to Hector. Tap the card written right.",
      image: IMG("quiz-hector-drum"),
      narration: { audio: `${Q}/e-3-one-owner.mp3`, script: "Here is the boy with the drum. Hector marched at the front of the parade with a drum on a strap, and that drum belongs to him, so it has one owner. Three cards are on your screen. Tap the card that shows the drum belongs to Hector." },
      hint: { audio: `${Q}/e-3-one-owner-hint.mp3`, script: "One owner takes an apostrophe and then the letter s, right after the name. Check where the apostrophe sits on each card." },
      explain: { audio: `${Q}/e-3-one-owner-explain.mp3`, script: "Hector's drum is written right, because one owner takes an apostrophe and then the letter s right after the name." },
      interaction: { type: "choose", options: [{ id: "apostrophe-then-s", label: "Hector's drum" }, { id: "no-apostrophe", label: "Hectors drum" }, { id: "apostrophe-after-s", label: "Hectors' drum" }], correctId: "apostrophe-then-s", coachWrong: "One boy owns the drum. Show one owner with an apostrophe and then the letter s, right after his name." },
    },
    {
      id: "e-4-capital-place",
      band: "easier",
      difficulty: 4,
      prompt: "Tap the word that needs a capital: Nellie mailed the invitations from boise.",
      narration: { audio: `${Q}/e-4-capital-place.mp3`, script: "Listen. Nellie mailed the invitations for the parade, and the sentence about it is on your screen. One word in it names a city, and the name of a place always gets a capital letter. Three words from the sentence are on your screen. Tap the word that still needs a capital." },
      hint: { audio: `${Q}/e-4-capital-place-hint.mp3`, script: "Read the three words again. Which one of them is the name of a city?" },
      explain: { audio: `${Q}/e-4-capital-place-explain.mp3`, script: "Boise needs the capital letter, because it is the name of a city, and the names of places always start with a capital. Mailed and invitations are plain words, so they stay small." },
      interaction: { type: "choose", options: [{ id: "boise", label: "boise" }, { id: "mailed", label: "mailed" }, { id: "invitations", label: "invitations" }], correctId: "boise", coachWrong: "That word could mean any mailing or any invitations. Look for the name of one city." },
    },
    {
      id: "c-1-dialogue-marks",
      band: "core",
      difficulty: 1,
      prompt: "Which sentence has every mark in its place?",
      narration: { audio: `${Q}/c-1-dialogue-marks.mp3`, script: "Hector called to the line of pets, and four versions of his sentence are on your screen. Only one puts every mark in its place. Check that the quotation marks wrap only the spoken words, that a comma sits between the spoken words and the speech tag, and that the comma lives inside the closing quotation mark. Read all four, then tap the one written right." },
      hint: { audio: `${Q}/c-1-dialogue-marks-hint.mp3`, script: "Find the two spoken words first. Then look for a comma right after them, on the inside of the closing quotation mark." },
      explain: { audio: `${Q}/c-1-dialogue-marks-explain.mp3`, script: "The sentence with the comma right after the word up, inside the closing quotation mark, is written right. The quotation marks wrap only the spoken words, and the comma sits between them and the tag said Hector." },
      interaction: { type: "choose", options: [{ id: "comma-inside-closing-mark", label: "\"Line up,\" said Hector." }, { id: "no-comma-at-all", label: "\"Line up\" said Hector." }, { id: "marks-close-after-the-tag", label: "\"Line up, said Hector.\"" }, { id: "period-before-the-tag", label: "\"Line up.\" said Hector." }], correctId: "comma-inside-closing-mark", coachWrong: "Find the spoken words. Do the quotation marks wrap only those words? Then check which side of the closing mark the comma sits on." },
    },
    {
      id: "c-2-title-capitals",
      band: "core",
      difficulty: 2,
      prompt: "Which title is written right?",
      narration: { audio: `${Q}/c-2-title-capitals.mp3`, script: "Nellie wrote a story about a dog and a leash for the parade newsletter, and four versions of her title are on your screen. The first word, the last word, and every important word of a title get a capital letter, while the small joining words in the middle stay small. Read all four, then tap the title written right." },
      hint: { audio: `${Q}/c-2-title-capitals-hint.mp3`, script: "Check the first word, the last word, and the big words for capitals. Then check that the small joining words in the middle stayed small." },
      explain: { audio: `${Q}/c-2-title-capitals-explain.mp3`, script: "A Dog and the Lost Leash is written right. The first word and the important words Dog, Lost, and Leash get capitals, while the two small joining words in the middle stay small." },
      interaction: { type: "choose", options: [{ id: "big-words-capital-small-words-small", label: "A Dog and the Lost Leash" }, { id: "every-word-capital", label: "A Dog And The Lost Leash" }, { id: "no-capitals", label: "a dog and the lost leash" }, { id: "only-first-word-capital", label: "A dog and the lost leash" }], correctId: "big-words-capital-small-words-small", coachWrong: "Look at the big words and the small words separately. Big words and the first word get capitals. Small joining words in the middle do not." },
    },
    {
      id: "c-3-address-commas",
      band: "core",
      difficulty: 3,
      prompt: "Which line puts the commas where an address needs them?",
      narration: { audio: `${Q}/c-3-address-commas.mp3`, script: "The invitation gives the address of the parade, with a street, a city, and a state on one line. An address puts a comma between the street and the city, and another comma between the city and the state. Four versions of the line are on your screen. Tap the line written right." },
      hint: { audio: `${Q}/c-3-address-commas-hint.mp3`, script: "Count the commas. A line with a street, a city, and a state needs two of them, one at each meeting point." },
      explain: { audio: `${Q}/c-3-address-commas-explain.mp3`, script: "Cedar Street, Boise, Idaho is written right, because one comma sits between the street and the city, and a second comma sits between the city and the state." },
      interaction: { type: "choose", options: [{ id: "two-commas", label: "Cedar Street, Boise, Idaho" }, { id: "missing-street-comma", label: "Cedar Street Boise, Idaho" }, { id: "missing-state-comma", label: "Cedar Street, Boise Idaho" }, { id: "no-commas", label: "Cedar Street Boise Idaho" }], correctId: "two-commas", coachWrong: "Find the two meeting points, street to city and city to state. A comma belongs at each one." },
    },
    {
      id: "c-4-many-owners",
      band: "core",
      difficulty: 4,
      prompt: "The leashes belong to all the dogs. Tap the card written right.",
      narration: { audio: `${Q}/c-4-many-owners.mp3`, script: "Every dog in the parade wore a leash, so the leashes have more than one owner. Only one of these four cards shows that. Count the owners first, then look at where the apostrophe sits. Read each card closely, then tap the one written right." },
      hint: { audio: `${Q}/c-4-many-owners-hint.mp3`, script: "More than one dog owns the leashes, so the word for the dogs already ends in s. Check what comes right after that s." },
      explain: { audio: `${Q}/c-4-many-owners-explain.mp3`, script: "The dogs' leashes is written right. More than one dog owns them, so the word dogs keeps its s and the apostrophe goes after it." },
      interaction: { type: "choose", options: [{ id: "apostrophe-after-the-s", label: "the dogs' leashes" }, { id: "apostrophe-before-the-s", label: "the dog's leashes" }, { id: "no-apostrophe", label: "the dogs leashes" }, { id: "apostrophe-on-the-leashes", label: "the dog leashes'" }], correctId: "apostrophe-after-the-s", coachWrong: "Count the owners. Many dogs own the leashes. Then check whether the apostrophe comes before the s or after it." },
    },
    {
      id: "c-5-sort-ending-rules",
      band: "core",
      difficulty: 5,
      prompt: "Sort each base word by the rule it needs before ed goes on.",
      narration: { audio: `${Q}/c-5-sort-ending-rules.mp3`, script: "Six base words from parade day are on your screen, and each one needs a rule before the ending e, d goes on. Look at how each word ends, and drag it to Double the Letter, or to Drop the E, or to Change Y to I." },
      hint: { audio: `${Q}/c-5-sort-ending-rules-hint.mp3`, script: "Look at the last two letters of the word. A short vowel and one consonant doubles. A silent e drops. A consonant and then y changes to i." },
      explain: { audio: `${Q}/c-5-sort-ending-rules-explain.mp3`, script: "Hum and nod double their last letter. Glide and wipe drop the silent e. Hurry and reply change the y to an i." },
      interaction: { type: "sort", buckets: ["Double the Letter","Drop the E","Change Y to I"], bucketAudio: { "Double the Letter": `${Q}/b-double-the-letter.mp3`, "Drop the E": `${Q}/b-drop-the-e.mp3`, "Change Y to I": `${Q}/b-change-y-to-i.mp3` }, items: [{ label: "hum", bucket: "Double the Letter" }, { label: "glide", bucket: "Drop the E" }, { label: "hurry", bucket: "Change Y to I" }, { label: "nod", bucket: "Double the Letter" }, { label: "wipe", bucket: "Drop the E" }, { label: "reply", bucket: "Change Y to I" }], coachWrong: "Look at the last two letters of that word. Do you see a short vowel and one consonant, a silent e, or a consonant and then y?" },
    },
    {
      id: "c-6-speak-dialogue-marks",
      band: "core",
      difficulty: 6,
      prompt: "Say a sentence with a speech tag. Then tell where the comma and the quotation marks go.",
      narration: { audio: `${Q}/c-6-speak-dialogue-marks.mp3`, script: "Think of something a person at the parade might say, and put a speech tag on it, like said Nellie or asked Hector. Tap the mic. Say your sentence out loud, then tell me where the quotation marks go and where the comma sits." },
      hint: { audio: `${Q}/c-6-speak-dialogue-marks-hint.mp3`, script: "Your sentence has two parts, the spoken words and the tag. After you say it, name the two marks that wrap the spoken words, and then name the mark that sits between them and the tag." },
      explain: { audio: `${Q}/c-6-speak-dialogue-marks-explain.mp3`, script: "One answer could be, wait for me, said Nellie. The quotation marks wrap the spoken words wait for me, and the comma sits after the word me, inside the closing quotation mark, right before the tag." },
      interaction: { type: "speak", text: "said asked shouted called comma quotation marks quote quotes before after inside around opening closing open close end period words tag name speech spoken first last between mark sentence" },
    },
    {
      id: "h-1-compound-comma",
      band: "harder",
      difficulty: 1,
      prompt: "Which sentence puts the comma where a compound sentence needs it?",
      narration: { audio: `${Q}/h-1-compound-comma.mp3`, script: "Here is a fourth grade tool. When two whole sentences are joined into one by a joining word like and, but, or so, a comma sits right before the joining word. Watch. Nellie painted the banner. Hector carried it. Joined into one sentence, it reads, Nellie painted the banner, comma, and Hector carried it. The comma sits just before the word and. Now you. Four versions of one sentence are on your screen. Tap the one that puts the comma where a compound sentence needs it." },
      hint: { audio: `${Q}/h-1-compound-comma-hint.mp3`, script: "Find the joining word and. The comma sits right before it, not after it and not anywhere else." },
      explain: { audio: `${Q}/h-1-compound-comma-explain.mp3`, script: "Nellie ran, and Hector sang is written right. Two whole sentences are joined by and, so the comma sits right before the word and." },
      interaction: { type: "choose", options: [{ id: "comma-before-and", label: "Nellie ran, and Hector sang." }, { id: "comma-after-and", label: "Nellie ran and, Hector sang." }, { id: "comma-after-nellie", label: "Nellie, ran and Hector sang." }, { id: "no-comma", label: "Nellie ran and Hector sang." }], correctId: "comma-before-and", coachWrong: "Find the joining word first. The comma belongs right before it, and nowhere else in the sentence." },
    },
    {
      id: "h-2-quote-from-a-text",
      band: "harder",
      difficulty: 2,
      prompt: "Which sentence copies the sign's words the right way?",
      narration: { audio: `${Q}/h-2-quote-from-a-text.mp3`, script: "The same marks work when a writer copies words from a text, like a sign, a note, or a book. A comma sits after the words that introduce it, quotation marks wrap the copied words, and the end mark lives inside the closing quotation mark. Watch. The banner said, then a comma, then quotation marks around the words Pets on Parade, with the period inside the closing mark. Now you. Hector read the sign at the corner, and four ways of writing it are on your screen. Tap the one that copies the sign's words the right way." },
      hint: { audio: `${Q}/h-2-quote-from-a-text-hint.mp3`, script: "Look for three things. A comma after the word read, quotation marks around the copied words, and the period inside the closing mark." },
      explain: { audio: `${Q}/h-2-quote-from-a-text-explain.mp3`, script: "The sentence with a comma after read, quotation marks around Keep left, and the period inside the closing mark is written right. Copied words take the same marks as spoken words." },
      interaction: { type: "choose", options: [{ id: "comma-marks-period-inside", label: "The sign read, \"Keep left.\"" }, { id: "no-comma", label: "The sign read \"Keep left.\"" }, { id: "period-outside-the-marks", label: "The sign read, \"Keep left\"." }, { id: "no-quotation-marks", label: "The sign read, Keep left." }], correctId: "comma-marks-period-inside", coachWrong: "Check all three marks. The comma after read, the quotation marks around the copied words, and the period inside the closing mark." },
    },
    {
      id: "h-3-no-comma-needed",
      band: "harder",
      difficulty: 3,
      prompt: "Which sentence does NOT need a comma?",
      narration: { audio: `${Q}/h-3-no-comma-needed.mp3`, script: "One more piece of the fourth grade rule. The comma only comes when both halves are whole sentences, each with its own who. Watch. The dog barked and wagged. Both halves are about the dog, and the second half has no who of its own, so no comma is needed. The dog barked, and the cat hid. Now the second half has its own who, the cat, so the comma goes in. Four sentences are on your screen with no commas at all. Three of them need a comma before the joining word. Tap the one that does not need a comma." },
      hint: { audio: `${Q}/h-3-no-comma-needed-hint.mp3`, script: "Ask whether the words after the joining word have their own who. If the second half has no who of its own, no comma is needed." },
      explain: { audio: `${Q}/h-3-no-comma-needed-explain.mp3`, script: "The dog ran and hid does not need a comma, because both halves are about the dog and the second half has no who of its own. The other three join two whole sentences, so each one needs a comma before and, but, or so." },
      interaction: { type: "choose", options: [{ id: "one-who-no-comma", label: "The dog ran and hid." }, { id: "two-whos-and", label: "The dog ran and the cat hid." }, { id: "two-whos-but", label: "It rained but we marched." }, { id: "two-whos-so", label: "Nellie sang so we clapped." }], correctId: "one-who-no-comma", coachWrong: "Look at the words after the joining word. Do they have their own who? If they do, that sentence needs a comma." },
    },
    {
      id: "h-4-speak-compound",
      band: "harder",
      difficulty: 4,
      prompt: "Say a sentence that joins two whole sentences with and, but, or so. Then tell where the comma goes.",
      narration: { audio: `${Q}/h-4-speak-compound.mp3`, script: "Last one, and you build it. Think of two things that happened at the parade, and join them into one sentence with and, but, or so. Tap the mic. Say your sentence out loud, then tell me where the comma sits." },
      hint: { audio: `${Q}/h-4-speak-compound-hint.mp3`, script: "Say one whole sentence, then the joining word, then another whole sentence. The comma sits right before the joining word." },
      explain: { audio: `${Q}/h-4-speak-compound-explain.mp3`, script: "One answer could be, the drum was loud, so the cat hid. The comma sits right before the word so, because both halves are whole sentences." },
      interaction: { type: "speak", text: "and but so comma before after joining word joins join two whole sentences sentence subject who first second between rain rained dog cat parade drum walked ran sang clapped hid loud marched" },
    },
  ],
};
