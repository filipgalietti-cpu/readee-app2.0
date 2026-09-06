import type { QuizDef } from "@/lib/lesson-engine/quiz";

// What the Picture Adds QUIZ (RL.3.7) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// what the picture shows, 3 options w/ picture support) / core(on-grade G3:
// what the picture adds, the specific aspect, the mood and its aspect, an
// Adds Mood / Adds a Detail sort, nothing new, production speak) / harder(G4
// transfer RL.4.7: the words and the picture each carry something the other
// cannot, only-the-words / only-the-picture / both, TAUGHT in h-1 first and
// closing with a production speak). ALL-FRESH second story, "The Planetarium"
// (Tavi, Wendell, Ms. Vasquez's class trip: a telescope the words never say,
// a dome of stars in deep blue light, Tavi calling the show "okay" with huge
// shining eyes, lunch on the front steps), spoken page by page INSIDE the
// questions with its own generated pictures, so every Q is self-contained;
// nothing from the lesson story (Fenna, Zora, the sleepover) is reused.
// Names + setting grep-swept vs lessons-v2 + quizzes-v2: Tavi, Wendell,
// Vasquez, planetarium, projector, gift shop all 0 hits (telescope only as a
// root-word example). Quiz support images live in the lesson's image dir
// (quiz- keys).

const Q = "/audio/quizzes-v2/what-the-picture-adds-quiz";
const IMG = (w: string) => `/images/lessons-v2/what-the-picture-adds/${w.toLowerCase()}.png`;

export const whatThePictureAddsQuiz: QuizDef = {
  id: "what-the-picture-adds-quiz",
  lessonId: "what-the-picture-adds",
  title: "What the Picture Adds Quiz",
  standard: "RL.3.7",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-teacher-doing",
      band: "easier",
      difficulty: 1,
      prompt: "What is the teacher doing in the picture?",
      image: IMG("quiz-lobby"),
      narration: { audio: `${Q}/e-1-teacher-doing.mp3`, script: "Here is page one of a new story called The Planetarium. On Tuesday, Ms. Vasquez's class rode the bus to the planetarium, a round building with a roof shaped like half of an egg. In the lobby, Tavi and Wendell waited in line while the teacher counted heads. Now look at the picture of the lobby. Tap what the teacher is doing." },
      hint: { audio: `${Q}/e-1-teacher-doing-hint.mp3`, script: "Look at the teacher in the red cardigan on the right, and look at her hand. Then remember what the words said she was doing." },
      explain: { audio: `${Q}/e-1-teacher-doing-explain.mp3`, script: "The answer is counting the children. The words say the teacher counted heads, and the picture shows her with one finger raised, counting the line." },
      interaction: { type: "choose", options: [{ id: "counting-the-children", label: "counting the children" }, { id: "eating-an-apple", label: "eating an apple" }, { id: "looking-through-a-telescope", label: "looking through a telescope" }], correctId: "counting-the-children", coachWrong: "Look at the teacher's raised finger, and think about what the words said she was doing in the lobby." },
    },
    {
      id: "e-2-dome-feeling",
      band: "easier",
      difficulty: 2,
      prompt: "What feeling does this picture give page two?",
      image: IMG("quiz-dome"),
      narration: { audio: `${Q}/e-2-dome-feeling.mp3`, script: "Page two. The lights went down, the ceiling turned into a sky, and thousands of stars came out all at once. A low hum filled the dome, and nobody in the class said a word. Look at the picture, at its colors and its light. Tap the feeling this picture gives the page." },
      hint: { audio: `${Q}/e-2-dome-feeling-hint.mp3`, script: "Deep blue light and a whole sky full of stars. Think about how a room like that would make you feel." },
      explain: { audio: `${Q}/e-2-dome-feeling-explain.mp3`, script: "The answer is calm and full of wonder. The deep blue light and the sky full of stars make the page feel hushed and amazed." },
      interaction: { type: "choose", options: [{ id: "calm-and-full-of-wonder", label: "calm and full of wonder" }, { id: "silly-and-giggly", label: "silly and giggly" }, { id: "angry-and-loud", label: "angry and loud" }], correctId: "calm-and-full-of-wonder", coachWrong: "Look at the colors again. Deep blue and a sky full of stars do not feel silly or angry." },
    },
    {
      id: "e-3-tavi-really-feels",
      band: "easier",
      difficulty: 3,
      prompt: "How does Tavi really feel about the show?",
      image: IMG("quiz-tavi"),
      narration: { audio: `${Q}/e-3-tavi-really-feels.mp3`, script: "Page three. When the show ended and the lights came up, Tavi said it was okay. Now look at Tavi in the picture, the boy in the blue jacket. His face and his body tell you how he really felt about the show. Tap the feeling the picture shows." },
      hint: { audio: `${Q}/e-3-tavi-really-feels-hint.mp3`, script: "Look at Tavi's eyes and his mouth, and look at how far forward he is leaning in his seat." },
      explain: { audio: `${Q}/e-3-tavi-really-feels-explain.mp3`, script: "The answer is excited. Tavi's eyes are huge, his mouth is open, and he is leaning forward in his seat, so the picture shows he loved the show, no matter what he said." },
      interaction: { type: "choose", options: [{ id: "excited", label: "excited" }, { id: "bored", label: "bored" }, { id: "sleepy", label: "sleepy" }], correctId: "excited", coachWrong: "A bored or sleepy boy would slump back in his seat. Look at what Tavi's face and body are doing." },
    },
    {
      id: "e-4-dark-hallway",
      band: "easier",
      difficulty: 4,
      prompt: "What feeling does that picture give the page?",
      narration: { audio: `${Q}/e-4-dark-hallway.mp3`, script: "Here is a picture described in words. A story says, the class walked down the hallway. The picture beside those words shows a long dark hallway with one tiny bulb and long black shadows across the floor. Tap the feeling that picture gives the page." },
      hint: { audio: `${Q}/e-4-dark-hallway-hint.mp3`, script: "Dark colors and long shadows. Think about how a hallway like that would feel to walk down." },
      explain: { audio: `${Q}/e-4-dark-hallway-explain.mp3`, script: "The answer is spooky. One tiny bulb and long black shadows make a plain sentence about a hallway feel spooky." },
      interaction: { type: "choose", options: [{ id: "spooky", label: "spooky" }, { id: "cheerful", label: "cheerful" }, { id: "sleepy", label: "sleepy" }], correctId: "spooky", coachWrong: "Picture the dark hallway with one tiny bulb. Would a cheerful page look like that?" },
    },
    {
      id: "c-1-page-2-adds",
      band: "core",
      difficulty: 1,
      prompt: "What does page two's picture add?",
      image: IMG("quiz-dome"),
      narration: { audio: `${Q}/c-1-page-2-adds.mp3`, script: "Now the three steps. Here is page two again. The lights went down, the ceiling turned into a sky, and thousands of stars came out all at once. A low hum filled the dome, and nobody in the class said a word. Here is the picture that goes with those words. Compare what the words say with what you see. Four jobs are on your screen. Tap the job this picture does." },
      hint: { audio: `${Q}/c-1-page-2-adds-hint.mp3`, script: "The words tell what happened. Ask what the colors and the light in the picture add to it." },
      explain: { audio: `${Q}/c-1-page-2-adds-explain.mp3`, script: "The answer is a mood the words do not have. The words say what happened, and the deep blue light adds a calm, amazed feeling that the words never state." },
      interaction: { type: "choose", options: [{ id: "a-mood-the-words-do-not-have", label: "a mood the words do not have" }, { id: "a-detail-the-words-never-say", label: "a detail the words never say" }, { id: "something-about-a-character", label: "something about a character" }, { id: "nothing-new-at-all", label: "nothing new at all" }], correctId: "a-mood-the-words-do-not-have", coachWrong: "The stars, the dome, and the quiet class are all in the words. Ask what the color and the light add." },
    },
    {
      id: "c-2-page-3-aspect",
      band: "core",
      difficulty: 2,
      prompt: "Which part of the picture shows how Tavi really feels?",
      image: IMG("quiz-tavi"),
      narration: { audio: `${Q}/c-2-page-3-aspect.mp3`, script: "Page three says that Tavi called the show okay. Here is the picture for page three. Four parts of it are on your screen, and all four are really in the picture. Only one of them shows how Tavi really feels about the show. Tap that part." },
      hint: { audio: `${Q}/c-2-page-3-aspect-hint.mp3`, script: "A jacket, a seat, and a cap cannot show a feeling. Look at Tavi's face." },
      explain: { audio: `${Q}/c-2-page-3-aspect-explain.mp3`, script: "The answer is his huge shining eyes. A jacket, a seat, and a cap cannot show a feeling, but Tavi's huge shining eyes and open mouth show that he loved the show." },
      interaction: { type: "choose", options: [{ id: "his-huge-shining-eyes", label: "his huge shining eyes" }, { id: "his-blue-jacket", label: "his blue jacket" }, { id: "the-rows-of-red-seats", label: "the rows of red seats" }, { id: "wendells-green-cap", label: "wendell's green cap" }], correctId: "his-huge-shining-eyes", coachWrong: "That part is in the picture, but it is a thing, and a thing cannot feel. Look at Tavi's face." },
    },
    {
      id: "c-3-page-2-mood-aspect",
      band: "core",
      difficulty: 3,
      prompt: "Which part of page two's picture makes the mood?",
      image: IMG("quiz-dome"),
      narration: { audio: `${Q}/c-3-page-2-mood-aspect.mp3`, script: "Back to page two, where the picture adds a calm, amazed mood. Four parts of the picture are on your screen, and all four are really in it. Only one of them is what makes that mood. Tap that part." },
      hint: { audio: `${Q}/c-3-page-2-mood-aspect-hint.mp3`, script: "A mood comes from color and light. Which part on your screen is about color and light?" },
      explain: { audio: `${Q}/c-3-page-2-mood-aspect-explain.mp3`, script: "The answer is the deep blue light. Seats, walls, and children are things. The deep blue light washing over everything is what makes the page feel calm and full of wonder." },
      interaction: { type: "choose", options: [{ id: "the-deep-blue-light", label: "the deep blue light" }, { id: "the-rows-of-red-seats-mood", label: "the rows of red seats" }, { id: "the-dark-curved-wall", label: "the dark curved wall" }, { id: "the-children-in-their-seats", label: "the children in their seats" }], correctId: "the-deep-blue-light", coachWrong: "That part is a thing in the room. A mood comes from color and light. Which part is about color and light?" },
    },
    {
      id: "c-4-sort-mood-or-detail",
      band: "core",
      difficulty: 4,
      prompt: "Sort it: Adds Mood, or Adds a Detail?",
      narration: { audio: `${Q}/c-4-sort-mood-or-detail.mp3`, script: "Here are six things a picture might show. Read each one on your screen and ask what it adds. Color and light add a mood. A thing the words never say adds a detail. Drag each one to Adds Mood, or to Adds a Detail." },
      hint: { audio: `${Q}/c-4-sort-mood-or-detail-hint.mp3`, script: "First, ask what that one is. Color or light adds a mood. A thing the words never said adds a detail." },
      explain: { audio: `${Q}/c-4-sort-mood-or-detail-explain.mp3`, script: "Here is the sorting. Blue light, long shadows, and warm sun are color and light, so they add a mood. A telescope, a moth, and a lost hat are things, so they add a detail." },
      interaction: { type: "sort", buckets: ["Adds Mood","Adds a Detail"], bucketAudio: { "Adds Mood": `${Q}/b-adds-mood.mp3`, "Adds a Detail": `${Q}/b-adds-a-detail.mp3` }, items: [{ label: "blue light on every face", bucket: "Adds Mood" }, { label: "a telescope by the door", bucket: "Adds a Detail" }, { label: "long shadows in the hallway", bucket: "Adds Mood" }, { label: "a moth on the ceiling", bucket: "Adds a Detail" }, { label: "warm sun on the steps", bucket: "Adds Mood" }, { label: "a lost hat under a seat", bucket: "Adds a Detail" }], coachWrong: "Ask what that one is. If it is about color or light, it adds a mood. If it is a thing the words never said, it adds a detail." },
    },
    {
      id: "c-5-page-4-adds",
      band: "core",
      difficulty: 5,
      prompt: "What does page four's picture add?",
      image: IMG("quiz-steps"),
      narration: { audio: `${Q}/c-5-page-4-adds.mp3`, script: "Here is page four. At noon, the class ate lunch on the wide front steps in the sun, and Ms. Vasquez handed out apples that crunched with every bite. Here is the picture for page four. Compare every part of it with the words, the steps, the sun, the apples. Four answers are on your screen. Tap what this picture adds." },
      hint: { audio: `${Q}/c-5-page-4-adds-hint.mp3`, script: "Check each answer against the words. If the words already say it, the picture did not add it, and if it is not in the picture at all, the picture did not add it either." },
      explain: { audio: `${Q}/c-5-page-4-adds-explain.mp3`, script: "The answer is nothing new at all. The steps, the sun, and the apples are all in the words, and there is no pet and nothing dark, so this picture simply shows what the words said." },
      interaction: { type: "choose", options: [{ id: "nothing-new-at-all", label: "nothing new at all" }, { id: "a-mood-the-words-do-not-have", label: "a mood the words do not have" }, { id: "a-pet-the-words-never-say", label: "a pet the words never say" }, { id: "how-dark-the-building-is", label: "how dark the building is" }], correctId: "nothing-new-at-all", coachWrong: "Check that answer against the words and the picture. The words already say it is sunny, and there is no pet and nothing dark in the picture." },
    },
    {
      id: "c-6-speak-page-3-adds",
      band: "core",
      difficulty: 6,
      prompt: "What does page three's picture add, and which part does it? Say it.",
      narration: { audio: `${Q}/c-6-speak-page-3-adds.mp3`, script: "Now say it out loud. Page three's words say that Tavi called the show okay, and the picture shows his face and his body. Tap the mic. Say what the picture adds about Tavi, and say which part of the picture does it. Start with, the picture shows." },
      hint: { audio: `${Q}/c-6-speak-page-3-adds-hint.mp3`, script: "Your answer begins with the words the picture shows. Then name the part of the picture, and say what it tells you about Tavi." },
      explain: { audio: `${Q}/c-6-speak-page-3-adds-explain.mp3`, script: "Here is one way to say it. The picture shows Tavi's huge shining eyes and his open mouth, so it adds that he was really excited, even though he said the show was only okay." },
      interaction: { type: "speak", text: "excited amazed loved loves happy thrilled wonder eyes huge wide open mouth leaning forward hands gripping armrests seat face shining okay really feels feeling character" },
    },
    {
      id: "h-1-only-the-words",
      band: "harder",
      difficulty: 1,
      prompt: "Which one do only the words tell you?",
      image: IMG("quiz-tavi"),
      narration: { audio: `${Q}/h-1-only-the-words.mp3`, script: "Here is a fourth grade step. The words and the picture each carry something the other one cannot. On page two, only the words tell you about the low hum, because a picture cannot make a sound. Only the picture shows the deep blue of the light, because the words never name a color. Now you try it on page three, with its picture on your screen. Four things are on your screen. Three of them you can see in the picture. Tap the one that only the words tell you. Here are the words of page three: when the show ended and the lights came up, Tavi said it was okay." },
      hint: { audio: `${Q}/h-1-only-the-words-hint.mp3`, script: "A picture cannot show what somebody said out loud. Which one is something Tavi said?" },
      explain: { audio: `${Q}/h-1-only-the-words-explain.mp3`, script: "The answer is tavi said it was okay. A picture cannot show words spoken out loud, so only the words tell you that. His eyes, his leaning, and the red seats are all in the picture." },
      interaction: { type: "choose", options: [{ id: "tavi-said-it-was-okay", label: "tavi said it was okay" }, { id: "tavis-eyes-were-huge", label: "tavi's eyes were huge" }, { id: "tavi-leaned-forward", label: "tavi leaned forward" }, { id: "the-seats-were-red", label: "the seats were red" }], correctId: "tavi-said-it-was-okay", coachWrong: "You can see that one in the picture, so the picture tells you too. Find the one a picture could never show." },
    },
    {
      id: "h-2-only-the-picture",
      band: "harder",
      difficulty: 2,
      prompt: "Which one does only the picture show?",
      image: IMG("quiz-lobby"),
      narration: { audio: `${Q}/h-2-only-the-picture.mp3`, script: "Now the other way around. Here is the picture for page one, and here are its words. On Tuesday, Ms. Vasquez's class rode the bus to the planetarium, a round building with a roof shaped like half of an egg. In the lobby, Tavi and Wendell waited in line while the teacher counted heads. Four things are on your screen. Three of them are in the words. Tap the one that only the picture shows." },
      hint: { audio: `${Q}/h-2-only-the-picture-hint.mp3`, script: "Check each one against the words. The words never mention the thing you are looking for, but the picture does." },
      explain: { audio: `${Q}/h-2-only-the-picture-explain.mp3`, script: "The answer is the telescope by the door. The bus, the counting, and Tuesday are all in the words, and only the picture shows a telescope." },
      interaction: { type: "choose", options: [{ id: "the-telescope-by-the-door", label: "the telescope by the door" }, { id: "the-class-rode-the-bus", label: "the class rode the bus" }, { id: "the-teacher-counted-heads", label: "the teacher counted heads" }, { id: "it-was-tuesday", label: "it was tuesday" }], correctId: "the-telescope-by-the-door", coachWrong: "The words say that one, so it is not only in the picture. Find the thing in the picture that the words never mention." },
    },
    {
      id: "h-3-in-both",
      band: "harder",
      difficulty: 3,
      prompt: "Which one do both the words and the picture give you?",
      image: IMG("quiz-steps"),
      narration: { audio: `${Q}/h-3-in-both.mp3`, script: "Some things are in both. Here is page four. At noon, the class ate lunch on the wide front steps in the sun, and Ms. Vasquez handed out apples that crunched with every bite. Here is its picture. Four things are on your screen. One is only in the words, one is only in the picture, one is in neither, and one is in both. Tap the one that both the words and the picture give you." },
      hint: { audio: `${Q}/h-3-in-both-hint.mp3`, script: "Both means you can hear it in the words and see it in the picture. Check each one twice." },
      explain: { audio: `${Q}/h-3-in-both-explain.mp3`, script: "The answer is the class ate on the steps. The words say it and the picture shows it. The crunch is only in the words, the gray stone is only in the picture, and no bus is in either one." },
      interaction: { type: "choose", options: [{ id: "the-class-ate-on-the-steps", label: "the class ate on the steps" }, { id: "the-apples-crunched", label: "the apples crunched" }, { id: "the-steps-are-gray-stone", label: "the steps are gray stone" }, { id: "the-bus-waited-nearby", label: "the bus waited nearby" }], correctId: "the-class-ate-on-the-steps", coachWrong: "Check that one twice. Can you hear it in the words, and can you see it in the picture? It has to pass both checks." },
    },
    {
      id: "h-4-speak-words-and-picture",
      band: "harder",
      difficulty: 4,
      prompt: "Say one thing only the words tell you, and one thing only the picture shows.",
      image: IMG("quiz-tavi"),
      narration: { audio: `${Q}/h-4-speak-words-and-picture.mp3`, script: "Last one, out loud. Here is page three one more time, with its picture on your screen. Tap the mic. Say one thing that only the words tell you, and one thing that only the picture shows. Here are the words: when the show ended and the lights came up, Tavi said it was okay." },
      hint: { audio: `${Q}/h-4-speak-words-and-picture-hint.mp3`, script: "The words can tell you what someone said. The picture can show you a face. Say one of each." },
      explain: { audio: `${Q}/h-4-speak-words-and-picture-explain.mp3`, script: "Here is one way. Only the words tell you that Tavi said it was okay. Only the picture shows his huge shining eyes and his open mouth." },
      interaction: { type: "speak", text: "said okay talking words voice spoke lights came up ended eyes huge wide shining mouth open leaning forward hands gripping armrests seat red cap jacket face excited" },
    },
  ],
};
