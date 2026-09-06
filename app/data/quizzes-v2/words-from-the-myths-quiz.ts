import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Words From the Myths QUIZ (RL.4.4) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second story,
// "The Car Wash" (the fourth grade washes cars in the school parking lot to
// pay for the spring trip; Kendrick, ten, runs the buckets; the line of cars
// stretches to the moon, or at least to the end of the block; a titanic
// pickup rolls in, too tall to reach even from a bucket; scrubbing it is a
// Herculean job for four of them; Kendrick's sister Constance, fifteen, holds
// the spray over her head like Atlas until her arms are about to fall off;
// the principal asks for questions about the money and opens a Pandora's
// box; Constance leaves at two and the car wash sags, because she had been
// the Atlas of it; that night she counts the money twice). The story is
// spoken page by page INSIDE the questions so every Q is self-contained, and
// every myth summary a question needs is TAUGHT in that question's stimulus
// before it asks; two sentences are the child's on-screen read-alouds and are
// NEVER narrated anywhere in the quiz (page three's cost-and-buses sentence in
// e-4, the last sentence in h-3). Fresh allusions titanic / Atlas / Pandora's
// box; Herculean is the one lesson allusion reused, in the easier band only.
// Bands: easier (G3-bridge, 3 options: two stretched phrases read plainly
// with the picture as evidence on e-1, the reused Herculean with the myth
// reminded, a one-sentence read-aloud) / core (titanic meaning from the myth,
// WHICH quality of Atlas was borrowed among four true facts, the Pandora
// character / known-for / means-now sequence, a six-item Points to a Myth /
// Plain Saying sort with b-* bucket clips, BEST evidence for the Atlas
// meaning among four true page-four fragments, a production speak explaining
// titanic with a full accept list) / harder (G5 RL.5.4 transfer: the allusion
// in a NEW SHAPE taught first, a Pandora's box OF something modeled on
// questions then applied to complaints, the Atlas OF something applied, the
// last sentence read aloud, a closing production speak explaining the Atlas
// of the car wash). Nothing from the lesson story (Tabitha, Dorian, Bertram,
// the garage sale) is reused. Names + world grep-swept vs lessons-v2 +
// quizzes-v2: Kendrick, Constance, car wash, titanic, Atlas, Pandora, a drop
// in the bucket, let the cat out of the bag, on cloud nine all 0 hits. Quiz
// support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/words-from-the-myths-quiz";
const IMG = (w: string) => `/images/lessons-v2/words-from-the-myths/${w.toLowerCase()}.png`;

export const wordsFromTheMythsQuiz: QuizDef = {
  id: "words-from-the-myths-quiz",
  lessonId: "words-from-the-myths",
  title: "Words From the Myths Quiz",
  standard: "RL.4.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-line-to-the-moon",
      band: "easier",
      difficulty: 1,
      prompt: "The line stretched to the moon. What does that mean?",
      image: IMG("quiz-car-line"),
      narration: { audio: `${Q}/e-1-line-to-the-moon.mp3`, script: "Here is a new story called The Car Wash, and page one begins it. Listen for the line of cars, because the question is about those words, and the picture shows the line too. On the first Saturday in May, the fourth grade held a car wash in the school parking lot to pay for the spring trip, and Kendrick had been put in charge of the buckets. By ten the line of cars stretched to the moon, or at least to the end of the block, and every sponge was in use." },
      hint: { audio: `${Q}/e-1-line-to-the-moon-hint.mp3`, script: "A line of cars cannot really reach the moon, so read around the words. The page corrects itself right away, and the picture shows the line." },
      explain: { audio: `${Q}/e-1-line-to-the-moon-explain.mp3`, script: "The line was very long. No car reached the moon. The writer stretched the truth to show how long the line was, and then said, or at least to the end of the block." },
      interaction: { type: "choose", options: [{ id: "the-line-was-very-long", label: "the line was very long" }, { id: "cars-drove-up-to-the-moon", label: "cars drove up to the moon" }, { id: "the-moon-was-out-at-ten", label: "the moon was out at ten" }], correctId: "the-line-was-very-long", coachWrong: "Look at the picture. Where does the line of cars really go?" },
    },
    {
      id: "e-2-herculean-job",
      band: "easier",
      difficulty: 2,
      prompt: "What does a Herculean job mean here?",
      image: IMG("quiz-muddy-truck"),
      narration: { audio: `${Q}/e-2-herculean-job.mp3`, script: "Page one ends with a truck, and page two begins with a word you met in the lesson. Herculean points to Hercules, the strongest hero in the Greek myths, who finished twelve labors that nobody believed could be done. Borrow what he was known for and test it on the sentence, and the picture shows the job too. Then a pickup truck rolled in, so muddy that nobody could tell what color it was. Scrubbing the mud off the truck was a Herculean job, and it took four of them." },
      hint: { audio: `${Q}/e-2-herculean-job-hint.mp3`, script: "Hercules was famous for one thing above all. Test each meaning on four children scrubbing a muddy truck." },
      explain: { audio: `${Q}/e-2-herculean-job-explain.mp3`, script: "A job needing great strength. Hercules was famous for his strength, so a Herculean job borrows that quality, and it took four of them to scrub the truck." },
      interaction: { type: "choose", options: [{ id: "a-job-needing-great-strength", label: "a job needing great strength" }, { id: "a-job-done-by-a-king", label: "a job done by a king" }, { id: "a-job-done-out-at-sea", label: "a job done out at sea" }], correctId: "a-job-needing-great-strength", coachWrong: "Go back to what Hercules was known for. Which meaning borrows that?" },
    },
    {
      id: "e-3-arms-fall-off",
      band: "easier",
      difficulty: 3,
      prompt: "What did Constance mean about her arms?",
      narration: { audio: `${Q}/e-3-arms-fall-off.mp3`, script: "Here is the end of page two. Constance, Kendrick's big sister, had held the hose over her head for a long time. By the time the truck shone, her arms were shaking, and she said they were about to fall off. What did Constance mean? Tap it." },
      hint: { audio: `${Q}/e-3-arms-fall-off-hint.mp3`, script: "Arms do not really come off. Read around the words. They were shaking after a long time holding the hose." },
      explain: { audio: `${Q}/e-3-arms-fall-off-explain.mp3`, script: "Her arms were very tired. Shaking arms after a long time holding a hose tell you that, and arms do not really fall off." },
      interaction: { type: "choose", options: [{ id: "her-arms-were-very-tired", label: "her arms were very tired" }, { id: "her-arms-had-come-loose", label: "her arms had come loose" }, { id: "she-wanted-to-leave-early", label: "she wanted to leave early" }], correctId: "her-arms-were-very-tired", coachWrong: "Could that be true word for word? Think about what shaking arms tell you." },
    },
    {
      id: "e-4-speak-read-page-three",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: Somebody asked why the trip cost so much, and somebody else asked why the buses were old.",
      narration: { audio: `${Q}/e-4-speak-read-page-three.mp3`, script: "Page three has a sentence that is yours alone, and it is on your screen. Tap the mic, then read the whole sentence out loud at a talking pace, and rest at the comma." },
      hint: { audio: `${Q}/e-4-speak-read-page-three-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the word Somebody." },
      explain: { audio: `${Q}/e-4-speak-read-page-three-explain.mp3`, script: "The sentence tells you two of the questions that came pouring out once the principal asked for them, one about the cost and one about the buses." },
      interaction: { type: "speak", text: "Somebody asked why the trip cost so much and somebody else asked why the buses were old" },
    },
    {
      id: "c-1-titanic-meaning",
      band: "core",
      difficulty: 1,
      prompt: "What does a titanic truck mean?",
      narration: { audio: `${Q}/c-1-titanic-meaning.mp3`, script: "Page one calls the pickup a titanic truck. Titanic points to the Titans, the giants of the Greek myths who ruled the world before the gods, and who were so enormous that mountains were said to be their chairs. Borrow that quality and test it on the truck. Four meanings are on your screen. Tap the one the writer borrowed. Here is the sentence. Then a titanic pickup truck rolled in, so tall that Kendrick could not reach the roof even standing on a bucket, and so muddy that nobody could tell what color it was." },
      hint: { audio: `${Q}/c-1-titanic-meaning-hint.mp3`, script: "The Titans were known for one quality above all, and the sentence tells you the roof of the truck was out of reach." },
      explain: { audio: `${Q}/c-1-titanic-meaning-explain.mp3`, script: "Enormous in size. The Titans were giants, so a titanic truck is a giant truck, and the sentence proves it, because Kendrick could not reach the roof." },
      interaction: { type: "choose", options: [{ id: "enormous-in-size", label: "enormous in size" }, { id: "older-than-anything", label: "older than anything" }, { id: "shaped-like-a-mountain", label: "shaped like a mountain" }, { id: "the-ruler-of-everything", label: "the ruler of everything" }], correctId: "enormous-in-size", coachWrong: "That is a piece of the Titans' story, but test it on a truck whose roof is out of reach. Which quality fits?" },
    },
    {
      id: "c-2-atlas-quality",
      band: "core",
      difficulty: 2,
      prompt: "Which quality of Atlas did the writer borrow?",
      narration: { audio: `${Q}/c-2-atlas-quality.mp3`, script: "Page two says Constance held the spray over her head like Atlas. Here is Atlas. Atlas was a Titan who fought against the gods and lost, and as his punishment he was made to stand at the edge of the world and hold up the whole sky on his shoulders forever. Four things about Atlas are on your screen, and every one of them is in his story. Only one is the quality the writer borrowed. Tap it. Here is the sentence. Constance climbed onto the tailgate and held the spray over her head like Atlas." },
      hint: { audio: `${Q}/c-2-atlas-quality-hint.mp3`, script: "Test each one on Constance with the hose. What is she doing that Atlas also did?" },
      explain: { audio: `${Q}/c-2-atlas-quality-explain.mp3`, script: "Holding a weight overhead. Atlas held up the sky on his shoulders, and Constance held the heavy spray over her head, so that is the quality the writer borrowed." },
      interaction: { type: "choose", options: [{ id: "holding-a-weight-overhead", label: "holding a weight overhead" }, { id: "losing-a-fight-with-the-gods", label: "losing a fight with the gods" }, { id: "being-punished-forever", label: "being punished forever" }, { id: "fighting-against-the-gods", label: "fighting against the gods" }], correctId: "holding-a-weight-overhead", coachWrong: "That is true of Atlas, but is Constance doing that with the hose? Find the part of his story that matches her." },
    },
    {
      id: "c-3-sequence-pandora",
      band: "core",
      difficulty: 3,
      prompt: "Put them in order: the character, her fame, the meaning now.",
      narration: { audio: `${Q}/c-3-sequence-pandora.mp3`, script: "Page three says the principal opened a Pandora's box. Here is Pandora. Pandora was the first woman in the Greek myths, and the gods gave her a sealed jar, later called a box, with orders never to open it. Curiosity won, she lifted the lid, and every trouble in the world flew out, sickness, sadness, and worry, and only hope stayed inside. Three tiles are on your screen. Tap them in order. First the character the phrase is named after, then what she was known for, then what the phrase means on page three. Here is the sentence. At noon the principal walked over with the cash box and asked, in front of everyone, whether anyone had questions about where the money would go, and with that she opened a Pandora's box." },
      hint: { audio: `${Q}/c-3-sequence-pandora-hint.mp3`, script: "Who first, then what she did, then what it means about the questions." },
      explain: { audio: `${Q}/c-3-sequence-pandora-explain.mp3`, script: "Pandora comes first, then she let every trouble out of the jar, and last, the phrase means the principal let loose questions that nobody could stop." },
      interaction: { type: "sequence", items: [{ id: "character", label: "a woman named Pandora" }, { id: "known-for", label: "let loose every trouble" }, { id: "means-now", label: "questions nobody could stop" }], order: ["character", "known-for", "means-now"], coachWrong: "Start with who the phrase is named after, then what she was known for, and end with what the words mean about the questions." },
    },
    {
      id: "c-4-sort-myth-or-plain",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Points to a Myth, or Plain Saying?",
      narration: { audio: `${Q}/c-4-sort-myth-or-plain.mp3`, script: "Six phrases are on your screen. Three of them point to a character from a myth, and that character's fame is the meaning. Three of them are plain sayings that point at nobody at all. Read each phrase and ask whether it names a character from an older story. Drag each one to its bucket, Points to a Myth, or Plain Saying." },
      hint: { audio: `${Q}/c-4-sort-myth-or-plain-hint.mp3`, script: "Ask whether the phrase names a character from an older story. A name from a myth points to a myth. No name at all means a plain saying." },
      explain: { audio: `${Q}/c-4-sort-myth-or-plain-explain.mp3`, script: "Titanic, Atlas, and Pandora each name a character from a myth. A drop in the bucket, the cat out of the bag, and cloud nine name nobody, so they are plain sayings." },
      interaction: { type: "sort", buckets: ["Points to a Myth","Plain Saying"], bucketAudio: { "Points to a Myth": `${Q}/b-points-to-a-myth.mp3`, "Plain Saying": `${Q}/b-plain-saying.mp3` }, items: [{ label: "a titanic truck", bucket: "Points to a Myth" }, { label: "a drop in the bucket", bucket: "Plain Saying" }, { label: "like Atlas with the hose", bucket: "Points to a Myth" }, { label: "let the cat out of the bag", bucket: "Plain Saying" }, { label: "opened a Pandora's box", bucket: "Points to a Myth" }, { label: "on cloud nine", bucket: "Plain Saying" }], coachWrong: "Does the phrase name a character from an older story? A name from a myth points to a myth. No name means a plain saying." },
    },
    {
      id: "c-5-best-evidence-atlas",
      band: "core",
      difficulty: 5,
      prompt: "Which words show what Atlas means on page four?",
      narration: { audio: `${Q}/c-5-best-evidence-atlas.mp3`, script: "Best evidence. Page four calls Constance the Atlas of the car wash, and Atlas was known for holding up the whole sky. Four groups of words from page four are on your screen, and all of them are on the page. Only one shows what the writer means by calling her Atlas. Tap it. Here is page four. Constance left at two, and without her the whole car wash sagged, because she had been the Atlas of it, holding up every part that the rest of them let drop. By the time the last car pulled away, the cash box was heavy, Kendrick's shoes were full of water, and the principal was still answering questions." },
      hint: { audio: `${Q}/c-5-best-evidence-atlas-hint.mp3`, script: "Atlas held something up. Find the words on the page about holding up." },
      explain: { audio: `${Q}/c-5-best-evidence-atlas-explain.mp3`, script: "Holding up every part. That is what Atlas did with the sky, so those words show the borrowed meaning. The heavy cash box and the wet shoes are true, but they show other things." },
      interaction: { type: "choose", options: [{ id: "holding-up-every-part", label: "holding up every part" }, { id: "left-at-two", label: "left at two" }, { id: "the-cash-box-was-heavy", label: "the cash box was heavy" }, { id: "shoes-were-full-of-water", label: "shoes were full of water" }], correctId: "holding-up-every-part", coachWrong: "Those words are on the page, but do they show what Atlas was known for? Find the words about holding something up." },
    },
    {
      id: "c-6-speak-explain-titanic",
      band: "core",
      difficulty: 6,
      prompt: "Explain it: the writer calls the truck titanic because...",
      narration: { audio: `${Q}/c-6-speak-explain-titanic.mp3`, script: "Now explain an allusion out loud. Page one calls the pickup a titanic truck. Tap the mic, then say, the writer calls the truck titanic because, and finish with who the word points to and what they were known for. Here is the sentence. Then a titanic pickup truck rolled in, so tall that Kendrick could not reach the roof even standing on a bucket." },
      hint: { audio: `${Q}/c-6-speak-explain-titanic-hint.mp3`, script: "The word points to the giants who ruled before the gods. Say their name and the size they were known for." },
      explain: { audio: `${Q}/c-6-speak-explain-titanic-explain.mp3`, script: "One way to say it goes like this. The writer calls the truck titanic because titanic points to the Titans, giants of enormous size, so the truck is enormous too." },
      interaction: { type: "speak", text: "titans titan giants giant enormous huge big biggest tall tallest large massive size mountains gods roof reach reached bucket ruled powerful mighty strong vast towering" },
    },
    {
      id: "h-1-pandora-box-of-complaints",
      band: "harder",
      difficulty: 1,
      prompt: "What does a Pandora's box of complaints mean?",
      narration: { audio: `${Q}/h-1-pandora-box-of-complaints.mp3`, script: "Here is a fifth grade move. Writers put an allusion into a new shape. Page three says the principal opened a Pandora's box. Writers also say a Pandora's box of something, and the something is what flew out. A Pandora's box of questions means questions that pour out and cannot be stopped or put back. Now you. Four meanings are on your screen for a new sentence. Tap the one that fits. Here is the sentence. When the principal asked for questions, she opened a Pandora's box of complaints." },
      hint: { audio: `${Q}/h-1-pandora-box-of-complaints-hint.mp3`, script: "What flew out of Pandora's jar could never be put back. Put complaints in that spot." },
      explain: { audio: `${Q}/h-1-pandora-box-of-complaints-explain.mp3`, script: "Complaints nobody could stop. The box is not a box at all. It is the moment the complaints were let loose, and once out they could not be put back." },
      interaction: { type: "choose", options: [{ id: "complaints-nobody-could-stop", label: "complaints nobody could stop" }, { id: "a-box-full-of-complaints", label: "a box full of complaints" }, { id: "one-complaint-about-a-box", label: "one complaint about a box" }, { id: "complaints-kept-in-a-jar", label: "complaints kept in a jar" }], correctId: "complaints-nobody-could-stop", coachWrong: "There is no real box on the page. Ask what Pandora's jar did to the troubles, and put the complaints in their place." },
    },
    {
      id: "h-2-atlas-of-the-car-wash",
      band: "harder",
      difficulty: 2,
      prompt: "What does the Atlas of the car wash mean?",
      narration: { audio: `${Q}/h-2-atlas-of-the-car-wash.mp3`, script: "Another new shape. Page four does not say like Atlas. It says Constance was the Atlas of the car wash. When a writer calls a person the Atlas of something, that something takes the place of the sky. Four meanings are on your screen. Tap the one that fits. Here is the sentence. Constance left at two, and without her the whole car wash sagged, because she had been the Atlas of it, holding up every part that the rest of them let drop." },
      hint: { audio: `${Q}/h-2-atlas-of-the-car-wash-hint.mp3`, script: "Atlas held up the sky. Ask what Constance held up, and what happened when she left." },
      explain: { audio: `${Q}/h-2-atlas-of-the-car-wash-explain.mp3`, script: "She held the whole thing up. Atlas carried the sky, and Constance carried the car wash, so when she left, it sagged." },
      interaction: { type: "choose", options: [{ id: "she-held-the-whole-thing-up", label: "she held the whole thing up" }, { id: "she-was-the-tallest-there", label: "she was the tallest there" }, { id: "she-was-punished-by-the-gods", label: "she was punished by the gods" }, { id: "she-was-a-fighter-who-lost", label: "she was a fighter who lost" }], correctId: "she-held-the-whole-thing-up", coachWrong: "That is a piece of the Atlas story, or a guess about her, but the sentence tells you what happened when she left. Which meaning fits that?" },
    },
    {
      id: "h-3-speak-read-last-sentence",
      band: "harder",
      difficulty: 3,
      prompt: "Read it: That night Kendrick fell asleep before dinner, and Constance, whose arms had not fallen off after all, counted the money twice.",
      narration: { audio: `${Q}/h-3-speak-read-last-sentence.mp3`, script: "The last sentence of the story is on your screen, and it is one long sentence. Tap the mic, then read the whole sentence out loud at a talking pace, and rest at each comma." },
      hint: { audio: `${Q}/h-3-speak-read-last-sentence-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the words That night." },
      explain: { audio: `${Q}/h-3-speak-read-last-sentence-explain.mp3`, script: "The sentence tells you the day wore Kendrick out, that the arms which were about to fall off did no such thing, and that the money got counted twice." },
      interaction: { type: "speak", text: "That night Kendrick fell asleep before dinner and Constance whose arms had not fallen off after all counted the money twice" },
    },
    {
      id: "h-4-speak-explain-atlas-of",
      band: "harder",
      difficulty: 4,
      prompt: "Explain it: Constance is the Atlas of the car wash because...",
      narration: { audio: `${Q}/h-4-speak-explain-atlas-of.mp3`, script: "Last one, out loud. Tap the mic, then say, the writer calls Constance the Atlas of the car wash because, and finish with what Atlas was known for and what Constance did. Here is the sentence. Constance left at two, and without her the whole car wash sagged, because she had been the Atlas of it, holding up every part that the rest of them let drop." },
      hint: { audio: `${Q}/h-4-speak-explain-atlas-of-hint.mp3`, script: "Atlas held up the sky on his shoulders. Say that, then say what Constance held up." },
      explain: { audio: `${Q}/h-4-speak-explain-atlas-of-explain.mp3`, script: "One way to say it goes like this. The writer calls Constance the Atlas of the car wash because Atlas held up the whole sky, and she held up every part of the car wash, so it sagged when she left." },
      interaction: { type: "speak", text: "atlas sky held holding holds hold shoulders heavy weight whole everything every part carried carrying carries sagged sagging drop dropped titan punished strong strongest kept running work worked" },
    },
  ],
};
