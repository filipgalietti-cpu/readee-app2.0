import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Words for Effect QUIZ (L.3.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// plain-word-or-chosen-word and said-or-written at 3 options, 3 picture
// supports) / core(on-grade G3: a word for a named effect, the effect a
// chosen word makes, a Said Out Loud / Written Down sort, a spoken line
// turned into a page line, a detail placed for effect, a production speak)
// / harder(G4 transfer TAUGHT in the stimulus first: L.4.3b punctuation and
// sentence length chosen for effect, a short sentence that lands like a
// drumbeat and three dots that make the reader lean in, modeled then
// applied; L.4.3c formal English for a letter to the mayor vs informal
// English that is RIGHT in a text message to a cousin, modeled then applied;
// closing production speak). ALL stimuli FRESH vs the lesson (no Talia, no
// llama, no farmers market, none of the lesson's sort lines or chosen words
// as quiz targets) and grep-swept vs the whole catalog: juggler, stilts,
// fountain, festival, Linden Street, Waffles the dog, Quentin, Grandpa
// Leland, cousin Clara, plunged, bellowed, sprang, rattled, drumbeat,
// three dots, mayor, text message all catalog-first (deafening = a
// describe-it-better-quiz tile, thunderous = a take-apart-any-word planted
// word, damp = a strong-words taught word, dove =
// the follow-the-message bird, leaped = a reading-with-purpose word, all
// avoided). ONE frame spoken inside every question (no earlier-question
// recall): the evening festival on Linden Street, the juggler on tall red
// stilts who dropped a pin into the fountain, Waffles the dog who went in
// after it, Quentin telling cousin Clara out loud and writing a letter to
// the mayor. Tiles lowercase, audio-free, kebab ids, 28-char cap; bucket
// clips are quiz-local b-*.mp3 pre-synthed from punctuated labels; every
// narration leads with the teaching and puts the sentence LAST, no quoted
// sentence ending in ? or !, no bare-imperative or question openers.

const Q = "/audio/quizzes-v2/words-for-effect-quiz";
const IMG = (w: string) => `/images/lessons-v2/words-for-effect/${w.toLowerCase()}.png`;

export const wordsForEffectQuiz: QuizDef = {
  id: "words-for-effect-quiz",
  lessonId: "words-for-effect",
  title: "Words for Effect Quiz",
  standard: "L.3.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-see-the-jump",
      band: "easier",
      difficulty: 1,
      prompt: "Waffles ___ into the water after it. Which word makes you SEE the jump?",
      image: IMG("quiz-dog-fountain"),
      narration: { audio: `${Q}/e-1-see-the-jump.mp3`, script: "Here is Quentin at the Linden Street festival with Grandpa Leland. A plain word only tells what happened, and a chosen word makes you see it. Here is the sentence, and it is on your screen. When the juggler dropped a pin into the fountain, Waffles the dog blank into the water after it. Look at the picture. Three words are on your screen. Tap the word that makes you see the jump." },
      hint: { audio: `${Q}/e-1-see-the-jump-hint.mp3`, script: "Two of those words could be about anything at all. One of them shows a dog flying through the air." },
      explain: { audio: `${Q}/e-1-see-the-jump-explain.mp3`, script: "Sprang makes you see the jump, because it shows the dog pushing off and flying. Went and got only tell you that something happened." },
      interaction: { type: "choose", options: [{ id: "sprang", label: "sprang" }, { id: "went", label: "went" }, { id: "got", label: "got" }], correctId: "sprang", coachWrong: "That word does not show you anything. Look at the picture, and find the word that puts that jump in your head." },
    },
    {
      id: "e-2-said-out-loud",
      band: "easier",
      difficulty: 2,
      prompt: "Which line did Quentin SAY out loud?",
      image: IMG("quiz-juggler-stilts"),
      narration: { audio: `${Q}/e-2-said-out-loud.mp3`, script: "Quentin told his cousin Clara about the juggler out loud, and later he wrote about him in a letter. Talking words like yeah and like show up only when you talk. Look at the picture of the juggler on his stilts. Three lines are on your screen. Two are written the careful way, and one is the way Quentin said it out loud. Tap the line he said out loud." },
      hint: { audio: `${Q}/e-2-said-out-loud-hint.mp3`, script: "Listen for a talking word, one you would never write in a letter." },
      explain: { audio: `${Q}/e-2-said-out-loud-explain.mp3`, script: "Yeah, he was, like, so tall is the line Quentin said out loud, because yeah and like are talking words. The other two lines are whole, careful sentences for the page." },
      interaction: { type: "choose", options: [{ id: "yeah-he-was-like-so-tall", label: "yeah, he was, like, so tall" }, { id: "the-juggler-stood-on-stilts", label: "the juggler stood on stilts" }, { id: "he-tossed-three-red-pins", label: "he tossed three red pins" }], correctId: "yeah-he-was-like-so-tall", coachWrong: "That line is a whole, careful sentence. It could go straight into a letter. Find the line with a talking word in it." },
    },
    {
      id: "e-3-hear-how-loud",
      band: "easier",
      difficulty: 3,
      prompt: "The juggler ___ hello to the whole street. Which word makes you HEAR how loud he was?",
      narration: { audio: `${Q}/e-3-hear-how-loud.mp3`, script: "Some words carry a sound inside them. Bellowed means shouted in a deep, booming voice that carries a long way. Here is the sentence, and it is on your screen. From the top of his stilts, the juggler blank hello to the whole street. Three words are on your screen. Tap the word that makes you hear how loud he was." },
      hint: { audio: `${Q}/e-3-hear-how-loud-hint.mp3`, script: "Two of those words have no sound in them at all. One of them is a deep, booming shout." },
      explain: { audio: `${Q}/e-3-hear-how-loud-explain.mp3`, script: "Bellowed makes you hear it, because it means a deep, booming shout. Said and told do not tell you anything about how loud he was." },
      interaction: { type: "choose", options: [{ id: "bellowed", label: "bellowed" }, { id: "said", label: "said" }, { id: "told", label: "told" }], correctId: "bellowed", coachWrong: "That word is plain. It does not tell you how loud or how quiet he was. Find the word with a booming shout inside it." },
    },
    {
      id: "e-4-belongs-on-the-page",
      band: "easier",
      difficulty: 4,
      prompt: "Which line belongs on the page?",
      image: IMG("quiz-juggler-bow"),
      narration: { audio: `${Q}/e-4-belongs-on-the-page.mp3`, script: "Quentin is writing a line for his letter, and a page line is a whole sentence with no talking words. Look at the picture of the juggler taking a bow with Waffles beside him. Three lines are on your screen, and two of them still carry talking words. Tap the one that belongs on the page." },
      hint: { audio: `${Q}/e-4-belongs-on-the-page-hint.mp3`, script: "Look for words you would only say to a friend. The page line has none of them." },
      explain: { audio: `${Q}/e-4-belongs-on-the-page-explain.mp3`, script: "The juggler bowed low belongs on the page, because it is a whole sentence with no talking words. Like, and stuff, yeah, and totally are words for talking." },
      interaction: { type: "choose", options: [{ id: "the-juggler-bowed-low", label: "the juggler bowed low" }, { id: "he-like-bowed-and-stuff", label: "he, like, bowed and stuff" }, { id: "yeah-he-totally-bowed", label: "yeah, he totally bowed" }], correctId: "the-juggler-bowed-low", coachWrong: "That line still has a talking word in it. Find the line where every word could go into a letter." },
    },
    {
      id: "c-1-word-for-the-jolt",
      band: "core",
      difficulty: 1,
      prompt: "Waffles ___ into the fountain after the pin. Which word makes the jolt?",
      narration: { audio: `${Q}/c-1-word-for-the-jolt.mp3`, script: "Here is a sentence from Quentin's letter with a hole in it. Waffles blank into the fountain after the pin. Quentin wants the reader to feel a sudden jolt, the splash that makes everyone jump. Four words are on your screen, and each one makes a different effect. Tap the word that makes the jolt." },
      hint: { audio: `${Q}/c-1-word-for-the-jolt-hint.mp3`, script: "Three of those words are slow or gentle. Only one is sudden, with a big splash inside it." },
      explain: { audio: `${Q}/c-1-word-for-the-jolt-explain.mp3`, script: "The word that makes the jolt is plunged, because it is sudden and deep, with a splash inside it. Waded and paddled are slow, and floated is gentle." },
      interaction: { type: "choose", options: [{ id: "plunged", label: "plunged" }, { id: "waded", label: "waded" }, { id: "paddled", label: "paddled" }, { id: "floated", label: "floated" }], correctId: "plunged", coachWrong: "Say the sentence with your word inside. Does it feel sudden and startling, or slow and gentle? Find the word that makes the reader jump." },
    },
    {
      id: "c-2-effect-of-roared",
      band: "core",
      difficulty: 2,
      prompt: "The crowd roared when Waffles climbed out with the pin. What effect does roared make?",
      narration: { audio: `${Q}/c-2-effect-of-roared.mp3`, script: "Now name the effect a chosen word makes. Here is the line from the letter. The crowd roared when Waffles climbed out of the fountain with the pin in his mouth. Ask what roared does to the reader that clapped could never do. Four effects are on your screen. Tap the effect that roared makes." },
      hint: { audio: `${Q}/c-2-effect-of-roared-hint.mp3`, script: "Say roared out loud and listen to it. Is it quiet or loud? Is it sad, sneaky, or happy?" },
      explain: { audio: `${Q}/c-2-effect-of-roared-explain.mp3`, script: "Roared makes a loud burst of joy, because a roar is huge and sudden and the crowd was thrilled. It is not quiet, not sneaky, and not sad." },
      interaction: { type: "choose", options: [{ id: "a-loud-burst-of-joy", label: "a loud burst of joy" }, { id: "a-quiet-sleepy-calm", label: "a quiet, sleepy calm" }, { id: "a-sneaky-secret-hush", label: "a sneaky, secret hush" }, { id: "a-slow-heavy-sadness", label: "a slow, heavy sadness" }], correctId: "a-loud-burst-of-joy", coachWrong: "Say roared out loud. That sound is not quiet, not sneaky, and not sad. Find the effect that matches a huge, happy noise." },
    },
    {
      id: "c-3-sort-said-or-written",
      band: "core",
      difficulty: 3,
      prompt: "Sort each line: Said Out Loud or Written Down.",
      narration: { audio: `${Q}/c-3-sort-said-or-written.mp3`, script: "Six lines about the festival are on your screen. Some are the way Quentin said it to Clara, and some are the way he wrote it in his letter. Run the test on each one. If the line carries a talking word, a filler or a squeezed word, drag it to Said Out Loud. If it is a whole, careful sentence with no fillers, drag it to Written Down." },
      hint: { audio: `${Q}/c-3-sort-said-or-written-hint.mp3`, script: "Read the line and listen for like, kinda, gonna, or yeah. A page line has none of them." },
      explain: { audio: `${Q}/c-3-sort-said-or-written-explain.mp3`, script: "The lines with so then and like, kinda and yeah, and gonna were said out loud. The pin struck the water, the juggler wobbled once, and the water splashed his shoes are whole sentences that were written down." },
      interaction: { type: "sort", buckets: ["Said Out Loud","Written Down"], bucketAudio: { "Said Out Loud": `${Q}/b-said-out-loud.mp3`, "Written Down": `${Q}/b-written-down.mp3` }, items: [{ label: "so then, like, he dropped it", bucket: "Said Out Loud" }, { label: "the pin struck the water", bucket: "Written Down" }, { label: "yeah, it was kinda crazy", bucket: "Said Out Loud" }, { label: "the juggler wobbled once", bucket: "Written Down" }, { label: "we were gonna leave, but", bucket: "Said Out Loud" }, { label: "the water splashed his shoes", bucket: "Written Down" }], coachWrong: "Read that line again and listen for a filler or a squeezed word. If it has one, it was said. If every word could sit in a letter, it was written." },
    },
    {
      id: "c-4-written-version",
      band: "core",
      difficulty: 4,
      prompt: "Quentin said, it was, like, super loud and stuff. Which version belongs in the letter?",
      narration: { audio: `${Q}/c-4-written-version.mp3`, script: "Now turn a spoken line into a written one. Here is what Quentin said to Clara about the band. It was, like, super loud and stuff. Four versions are on your screen. Three still carry talking words. One is ready for the letter, a whole sentence with a chosen word and no fillers. Tap that one." },
      hint: { audio: `${Q}/c-4-written-version-hint.mp3`, script: "The letter version has no like, no stuff, and no yeah, and it picks one strong word for loud." },
      explain: { audio: `${Q}/c-4-written-version-explain.mp3`, script: "The music rattled the street belongs in the letter. It is a whole sentence, it has no fillers, and rattled is a chosen word that makes the reader hear the noise." },
      interaction: { type: "choose", options: [{ id: "the-music-rattled-the-street", label: "the music rattled the street" }, { id: "it-was-like-really-loud", label: "it was, like, really loud" }, { id: "the-music-was-loud-and-stuff", label: "the music was loud and stuff" }, { id: "yeah-super-loud-music", label: "yeah, super loud music" }], correctId: "the-music-rattled-the-street", coachWrong: "That version still has a talking word in it. Find the one where every word could go into a letter." },
    },
    {
      id: "c-5-detail-for-effect",
      band: "core",
      difficulty: 5,
      prompt: "The juggler wobbled on his stilts, ___. Which detail makes the reader hold their breath?",
      narration: { audio: `${Q}/c-5-detail-for-effect.mp3`, script: "A detail can carry an effect too. Here is a sentence from the letter with the detail missing. The juggler wobbled on his stilts, blank. Quentin wants the reader to hold their breath. Four details are on your screen, and all four are true, but only one makes the reader worry. Tap it." },
      hint: { audio: `${Q}/c-5-detail-for-effect-hint.mp3`, script: "Three of those details only describe the scene. One of them puts something in danger." },
      explain: { audio: `${Q}/c-5-detail-for-effect-explain.mp3`, script: "The pins still in the air makes the reader hold their breath, because if the juggler wobbles now, the pins will fall. His shirt, the band, and the popcorn cart are only facts about the scene." },
      interaction: { type: "choose", options: [{ id: "the-pins-still-in-the-air", label: "the pins still in the air" }, { id: "his-shirt-striped-green", label: "his shirt striped green" }, { id: "the-band-playing-on", label: "the band playing on" }, { id: "the-popcorn-cart-nearby", label: "the popcorn cart nearby" }], correctId: "the-pins-still-in-the-air", coachWrong: "That detail is true, but it does not make you worry. Find the detail that puts something in danger while he wobbles." },
    },
    {
      id: "c-6-speak-change-one-word",
      band: "core",
      difficulty: 6,
      prompt: "Say a plain sentence about the festival. Say it again with one word changed for effect. Name the effect.",
      narration: { audio: `${Q}/c-6-speak-change-one-word.mp3`, script: "Now you are the writer. Think of a plain sentence about the festival, like the dog going into the water or the juggler saying hello. Tap the mic and say it plainly first. Then say it again with one word changed to a stronger one, and tell me the effect your new word makes." },
      hint: { audio: `${Q}/c-6-speak-change-one-word-hint.mp3`, script: "Swap the plain word for one that makes the reader see or hear more, then say what it makes the reader feel." },
      explain: { audio: `${Q}/c-6-speak-change-one-word-explain.mp3`, script: "One answer could be, the dog went into the water, then the dog plunged into the water, and plunged makes a sudden jolt. Any strong word with its effect named works." },
      interaction: { type: "speak", text: "plunged sprang bellowed roared crept bolted hissed strolled dashed darted raced lunged wobbled splashed shouted yelled whispered tiptoed slammed grabbed jolt jump sudden loud quiet hush hurry rush calm shiver scary funny laugh excited effect feel feels see hear" },
    },
    {
      id: "h-1-drumbeat-sentence",
      band: "harder",
      difficulty: 1,
      prompt: "Which version lands like a drumbeat?",
      narration: { audio: `${Q}/h-1-drumbeat-sentence.mp3`, script: "Here is a fourth grade tool. A writer chooses punctuation and sentence length for effect, not only words. A very short sentence after longer ones lands like a drumbeat, and it makes the reader stop. Three dots at the end let a sentence trail off, so the reader leans in and waits. Watch the drumbeat. The juggler tossed the third pin high over the fountain, and every face on Linden Street turned up to follow it. It hung. Then it fell. That tiny sentence, it hung, is where the reader holds their breath. Now you. Quentin wants the moment when Waffles climbed out of the fountain to land like a drumbeat. Four ways to write it are on your screen. Tap the one that makes the drumbeat." },
      hint: { audio: `${Q}/h-1-drumbeat-sentence-hint.mp3`, script: "A drumbeat is short, so look for the version that breaks the moment into two tiny sentences." },
      explain: { audio: `${Q}/h-1-drumbeat-sentence-explain.mp3`, script: "He climbed out. He had it. That version lands like a drumbeat, because two tiny sentences make the reader stop on each one. The other three run the moment together into one line." },
      interaction: { type: "choose", options: [{ id: "he-climbed-out-he-had-it", label: "he climbed out. he had it." }, { id: "he-climbed-out-and-he-had-it", label: "he climbed out and he had it" }, { id: "he-climbed-out-so-he-had-it", label: "he climbed out, so he had it" }, { id: "he-climbed-out-with-the-pin", label: "he climbed out with the pin" }], correctId: "he-climbed-out-he-had-it", coachWrong: "That version runs the moment together in one breath. A drumbeat stops the reader. Find the version made of tiny sentences." },
    },
    {
      id: "h-2-three-dots",
      band: "harder",
      difficulty: 2,
      prompt: "Which version makes the reader lean in and wait?",
      narration: { audio: `${Q}/h-2-three-dots.mp3`, script: "One more mark chosen for effect. Three dots at the end of a sentence let it trail off, as if the writer stopped to watch, so the reader leans in and waits for what comes next. An exclamation point makes a burst, and a period simply stops. Quentin is writing the moment the third pin left the juggler's hand and would not come down. Four versions are on your screen, and the only difference is the mark at the end. Tap the version that makes the reader lean in and wait." },
      hint: { audio: `${Q}/h-2-three-dots-hint.mp3`, script: "A burst shouts, and a period stops. Only one mark trails off and makes you wait." },
      explain: { audio: `${Q}/h-2-three-dots-explain.mp3`, script: "The version with three dots makes the reader lean in, because the sentence trails off while the pin is still climbing. The exclamation point makes a burst, and the period simply stops." },
      interaction: { type: "choose", options: [{ id: "the-pin-spun-up-and-up-dots", label: "the pin spun up and up..." }, { id: "the-pin-spun-up-and-up-bang", label: "the pin spun up and up!" }, { id: "the-pin-spun-up-and-up-stop", label: "the pin spun up and up." }, { id: "the-pin-spun-up-and-up-comma", label: "the pin spun up, and up." }], correctId: "the-pin-spun-up-and-up-dots", coachWrong: "That mark shouts or stops. Find the mark that lets the sentence trail off while the pin is still in the air." },
    },
    {
      id: "h-3-text-to-a-cousin",
      band: "harder",
      difficulty: 3,
      prompt: "Which line belongs in the text message to Clara?",
      narration: { audio: `${Q}/h-3-text-to-a-cousin.mp3`, script: "Here is the fourth grade version of said or written. Writing can be formal or informal, and the reader decides which. Quentin is writing a letter to the mayor about the festival, and the mayor is someone he does not know, so that letter is formal, with whole sentences and careful words. He is also sending a text message to his cousin Clara, and a text to family can be informal, so talking words are exactly right there even though they are written down. Four lines about Waffles are on your screen. Three of them belong in the letter to the mayor. Tap the one that belongs in the text to Clara." },
      hint: { audio: `${Q}/h-3-text-to-a-cousin-hint.mp3`, script: "Three of those lines are careful and formal, the way you write to a stranger. One sounds like Quentin talking to family." },
      explain: { audio: `${Q}/h-3-text-to-a-cousin-explain.mp3`, script: "The dog totally went for it belongs in the text to Clara, because totally is a talking word and a text to family can be informal. Entered, retrieved, and rather wet are careful letter words for the mayor." },
      interaction: { type: "choose", options: [{ id: "the-dog-totally-went-for-it", label: "the dog totally went for it" }, { id: "the-dog-entered-the-fountain", label: "the dog entered the fountain" }, { id: "the-dog-retrieved-the-pin", label: "the dog retrieved the pin" }, { id: "the-dog-was-rather-wet", label: "the dog was rather wet" }], correctId: "the-dog-totally-went-for-it", coachWrong: "That line is careful and formal, the way you write to someone you do not know. Find the line that sounds like talking to your cousin." },
    },
    {
      id: "h-4-speak-letter-and-text",
      band: "harder",
      difficulty: 4,
      prompt: "Say one line for the letter to the mayor. Then say the same news as a text to your cousin.",
      narration: { audio: `${Q}/h-4-speak-letter-and-text.mp3`, script: "Last one, and you write both ways out loud. Pick one thing that happened at the festival, like the dog in the fountain or the juggler on his stilts. Tap the mic and say it first the way it would go in a formal letter to the mayor, a whole sentence with careful words. Then say the same news the way you would text it to your cousin, with talking words if you like." },
      hint: { audio: `${Q}/h-4-speak-letter-and-text-hint.mp3`, script: "The letter line is whole and careful. The text line can have like, totally, or yeah in it." },
      explain: { audio: `${Q}/h-4-speak-letter-and-text-explain.mp3`, script: "One answer could be, a dog retrieved the juggler's pin from the fountain, and then, the dog totally jumped in the fountain, like, whoa. Both are right, because each one matches its reader." },
      interaction: { type: "speak", text: "dog waffles juggler stilts fountain pin mayor cousin letter text festival jumped plunged sprang retrieved entered climbed dropped tossed bellowed wobbled totally like yeah kinda gonna whoa wow crazy cool careful formal dear thank" },
    },
  ],
};
