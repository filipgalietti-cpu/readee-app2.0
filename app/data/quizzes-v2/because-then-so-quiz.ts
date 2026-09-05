import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Because, Then, So QUIZ (RI.3.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt, picture support; e-1 is a picture-anchored either/or) / core(on-grade
// G3, 4-opt parallel TEXT tiles + a signal-word sort + a steps sequence + a
// production speak) / harder(G4 transfer TAUGHT in the stimulus: a three-link
// cause chain A causes B causes C, and RI.4.3 "explain why a step matters
// using specific information"). ALL-FRESH stimulus, never the lesson's geyser:
// "Flash, Then Boom", a true science text about lightning and thunder
// (lightning heats the air in an instant, the heated air slams into cooler
// air and that makes thunder; flash and boom start together but light is far
// faster than sound so the flash arrives first; sound needs about five seconds
// per mile so counting seconds gives the distance; when thunder roars, go
// indoors). Every page is SPOKEN inside the question that needs it, so each Q
// is self-contained. Fresh vs catalog: lightning/thunder appear elsewhere only
// as decode words, sound words, and picture prompts, never as a science text.
// Name fresh: Bea. Tiles lowercase, audio-free, kebab ids; bucket audio b-*.

const Q = "/audio/quizzes-v2/because-then-so-quiz";
const IMG = (w: string) => `/images/lessons-v2/because-then-so/${w.toLowerCase()}.png`;

export const becauseThenSoQuiz: QuizDef = {
  id: "because-then-so-quiz",
  lessonId: "because-then-so",
  title: "Because, Then, So Quiz",
  standard: "RI.3.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-flash-or-boom-first",
      band: "easier",
      difficulty: 1,
      prompt: "Which one do you notice first?",
      image: IMG("quiz-lightning-flash"),
      narration: { audio: `${Q}/e-1-flash-or-boom-first.mp3`, script: "Here is a new true text called Flash, Then Boom. Listen to page one. Lightning is a giant spark of electricity that jumps from a dark storm cloud while rain pours down. In a storm, you see the bright flash of lightning before you hear the low boom of thunder. Which one do you notice first? Tap it." },
      hint: { audio: `${Q}/e-1-flash-or-boom-first-hint.mp3`, script: "The word before is a time word. Listen for what comes before the other." },
      explain: { audio: `${Q}/e-1-flash-or-boom-first-explain.mp3`, script: "The flash comes first. The text says you see the flash of lightning before you hear the boom of thunder." },
      interaction: { type: "choose", options: [{ id: "the-flash", label: "the flash" }, { id: "the-boom", label: "the boom" }], correctId: "the-flash", coachWrong: "Listen again for the word before. It tells you which one comes first." },
    },
    {
      id: "e-2-what-makes-the-boom",
      band: "easier",
      difficulty: 2,
      prompt: "What makes the boom of thunder?",
      image: IMG("quiz-storm-rain"),
      narration: { audio: `${Q}/e-2-what-makes-the-boom.mp3`, script: "Listen to page two of Flash, Then Boom. When lightning flashes, it heats the air around it in an instant, hotter than the surface of the sun. The heated air pushes outward so fast that it slams into the cooler air around it, and that slam makes the boom we call thunder. What makes the boom of thunder? Tap it." },
      hint: { audio: `${Q}/e-2-what-makes-the-boom-hint.mp3`, script: "Listen for the sentence that ends with the boom. The cause comes right before it." },
      explain: { audio: `${Q}/e-2-what-makes-the-boom-explain.mp3`, script: "Hot air slams into cool air. The text says the heated air slams into the cooler air, and that slam makes the boom." },
      interaction: { type: "choose", options: [{ id: "hot-air-slams-into-cool-air", label: "hot air slams into cool air" }, { id: "rain-pours-from-the-cloud", label: "rain pours from the cloud" }, { id: "the-storm-cloud-turns-dark", label: "the storm cloud turns dark" }], correctId: "hot-air-slams-into-cool-air", coachWrong: "Think about what the heated air does. That is what makes the sound." },
    },
    {
      id: "e-3-find-the-time-word",
      band: "easier",
      difficulty: 3,
      prompt: "Which word tells you when?",
      narration: { audio: `${Q}/e-3-find-the-time-word.mp3`, script: "Here is one sentence from page three of Flash, Then Boom. The sound of the boom reaches your ears a little later, after it has traveled all the way from the cloud. One of these words is a time word. It tells you when. Tap it." },
      hint: { audio: `${Q}/e-3-find-the-time-word-hint.mp3`, script: "A time word tells you when something happens or in what order. It is not a thing you can point to." },
      explain: { audio: `${Q}/e-3-find-the-time-word-explain.mp3`, script: "After is the time word. It tells you the boom reaches your ears after the sound has traveled from the cloud." },
      interaction: { type: "choose", options: [{ id: "after", label: "after" }, { id: "boom", label: "boom" }, { id: "cloud", label: "cloud" }], correctId: "after", coachWrong: "Two of these words name things. Only one tells you when." },
    },
    {
      id: "e-4-when-thunder-roars",
      band: "easier",
      difficulty: 4,
      prompt: "What should you do when thunder roars?",
      image: IMG("quiz-safe-indoors"),
      narration: { audio: `${Q}/e-4-when-thunder-roars.mp3`, script: "Listen to the last page of Flash, Then Boom. When thunder roars, go indoors. Stay away from tall trees and open water until the storm has passed. What should you do when thunder roars? Tap it." },
      hint: { audio: `${Q}/e-4-when-thunder-roars-hint.mp3`, script: "The text tells you two things to stay away from, and one thing to do. Tap the thing to do." },
      explain: { audio: `${Q}/e-4-when-thunder-roars-explain.mp3`, script: "Go indoors. The text says when thunder roars, go indoors, and stay away from tall trees and open water." },
      interaction: { type: "choose", options: [{ id: "go-indoors", label: "go indoors" }, { id: "climb-a-tall-tree", label: "climb a tall tree" }, { id: "swim-in-open-water", label: "swim in open water" }], correctId: "go-indoors", coachWrong: "Tall trees and open water are the places the text says to stay away from. Tap the safe choice." },
    },
    {
      id: "c-1-why-flash-first",
      band: "core",
      difficulty: 1,
      prompt: "Why do you see the flash before you hear the boom?",
      narration: { audio: `${Q}/c-1-why-flash-first.mp3`, script: "Listen to page three of Flash, Then Boom. The flash and the boom start at the very same moment. You see the flash first because light travels much faster than sound. The sound of the boom reaches your ears a little later, after it has traveled all the way from the cloud. Why do you see the flash before you hear the boom? Read all four, then tap the cause the text gives." },
      hint: { audio: `${Q}/c-1-why-flash-first-hint.mp3`, script: "Find the sentence with the word because in it. The cause comes right after that word." },
      explain: { audio: `${Q}/c-1-why-flash-first-explain.mp3`, script: "Light is faster than sound. The text says you see the flash first because light travels much faster than sound. The flash and the boom actually start at the same moment." },
      interaction: { type: "choose", options: [{ id: "light-is-faster-than-sound", label: "light is faster than sound" }, { id: "sound-is-faster-than-light", label: "sound is faster than light" }, { id: "the-flash-is-closer-to-you", label: "the flash is closer to you" }, { id: "the-boom-starts-much-later", label: "the boom starts much later" }], correctId: "light-is-faster-than-sound", coachWrong: "The text says they start at the same moment, so think about which one travels faster." },
    },
    {
      id: "c-2-what-heated-air-does",
      band: "core",
      difficulty: 2,
      prompt: "What does the heated air do?",
      narration: { audio: `${Q}/c-2-what-heated-air-does.mp3`, script: "Listen to page two again. When lightning flashes, it heats the air around it in an instant, hotter than the surface of the sun. The heated air pushes outward so fast that it slams into the cooler air around it, and that slam makes the boom we call thunder. What does the heated air do? Read all four, then tap it." },
      hint: { audio: `${Q}/c-2-what-heated-air-does-hint.mp3`, script: "Listen for what happens right after the air heats up. The word so points to it." },
      explain: { audio: `${Q}/c-2-what-heated-air-does-explain.mp3`, script: "It slams into the cooler air. The heated air pushes outward so fast that it slams into the cooler air, and that slam is the thunder." },
      interaction: { type: "choose", options: [{ id: "slams-into-the-cooler-air", label: "slams into the cooler air" }, { id: "sinks-back-into-the-cloud", label: "sinks back into the cloud" }, { id: "turns-into-a-giant-spark", label: "turns into a giant spark" }, { id: "travels-a-mile-in-a-second", label: "travels a mile in a second" }], correctId: "slams-into-the-cooler-air", coachWrong: "The heated air pushes outward. Think about what it hits when it pushes out." },
    },
    {
      id: "c-3-sort-fresh-signal-words",
      band: "core",
      difficulty: 3,
      prompt: "Sort the connecting words: Time Words, or Cause Words?",
      narration: { audio: `${Q}/c-3-sort-fresh-signal-words.mp3`, script: "Six new connecting words. Read each one and ask the test question. Does it tell me why? If it only tells you when, or in what order, drag it to Time Words. If it tells you why, drag it to Cause Words." },
      hint: { audio: `${Q}/c-3-sort-fresh-signal-words-hint.mp3`, script: "Put the word in a sentence about the storm in your head. Does it give a reason, or only an order?" },
      explain: { audio: `${Q}/c-3-sort-fresh-signal-words-explain.mp3`, script: "Next, before, and then are time words. They tell when. Since, because of, and that is why are cause words. They tell why." },
      interaction: { type: "sort", buckets: ["Time Words","Cause Words"], bucketAudio: { "Time Words": `${Q}/b-time-words.mp3`, "Cause Words": `${Q}/b-cause-words.mp3` }, items: [{ label: "next", bucket: "Time Words" }, { label: "since", bucket: "Cause Words" }, { label: "before", bucket: "Time Words" }, { label: "because of", bucket: "Cause Words" }, { label: "then", bucket: "Time Words" }, { label: "that is why", bucket: "Cause Words" }], coachWrong: "Ask the test question again. Does that word tell you why, or only when?" },
    },
    {
      id: "c-4-sequence-thunder-steps",
      band: "core",
      difficulty: 4,
      prompt: "Put the steps in order, from the flash to the boom.",
      narration: { audio: `${Q}/c-4-sequence-thunder-steps.mp3`, script: "Page two told you how thunder is made, step by step. Here are its four steps, mixed up. Drag them into the order they happen, from the very first step to the sound you hear." },
      hint: { audio: `${Q}/c-4-sequence-thunder-steps-hint.mp3`, script: "Start with the spark. Then ask what the spark does to the air, and what the air does next." },
      explain: { audio: `${Q}/c-4-sequence-thunder-steps-explain.mp3`, script: "First, lightning flashes. Next, the air heats in an instant. Then the hot air slams into cool air. Finally, the thunder booms." },
      interaction: { type: "sequence", items: [{ id: "lightning-flashes", label: "lightning flashes" }, { id: "the-air-heats-in-an-instant", label: "the air heats in an instant" }, { id: "hot-air-slams-into-cool-air", label: "hot air slams into cool air" }, { id: "the-thunder-booms", label: "the thunder booms" }], order: ["lightning-flashes","the-air-heats-in-an-instant","hot-air-slams-into-cool-air","the-thunder-booms"], coachWrong: "Each step causes the next one. Ask what has to happen before the air can slam into anything." },
    },
    {
      id: "c-5-which-line-tells-why",
      band: "core",
      difficulty: 5,
      prompt: "Which line tells you why?",
      narration: { audio: `${Q}/c-5-which-line-tells-why.mp3`, script: "Here are four lines about a storm. Three of them only tell you when something happens. One of them tells you why. Read all four carefully, then tap the line that tells you why." },
      hint: { audio: `${Q}/c-5-which-line-tells-why-hint.mp3`, script: "After, while, and before are time words. Look for the line whose connecting word gives a reason." },
      explain: { audio: `${Q}/c-5-which-line-tells-why-explain.mp3`, script: "A boom comes because of heat. Because of gives the reason. The other three lines use after, while, and before, and those only tell you when." },
      interaction: { type: "choose", options: [{ id: "a-boom-comes-because-of-heat", label: "a boom comes because of heat" }, { id: "a-boom-comes-after-a-flash", label: "a boom comes after a flash" }, { id: "you-count-while-you-wait", label: "you count while you wait" }, { id: "the-rain-stops-before-dinner", label: "the rain stops before dinner" }], correctId: "a-boom-comes-because-of-heat", coachWrong: "That line tells you when. Find the line whose connecting word answers the question why." },
    },
    {
      id: "c-6-speak-why-flash-first",
      band: "core",
      difficulty: 6,
      prompt: "Tell me why you see lightning before you hear thunder. Use because or so.",
      narration: { audio: `${Q}/c-6-speak-why-flash-first.mp3`, script: "Now explain a connection yourself. Tap the mic and tell me why you see lightning before you hear thunder, in one full sentence that uses because or so." },
      hint: { audio: `${Q}/c-6-speak-why-flash-first-hint.mp3`, script: "Think about the two things that travel from the cloud to you, and which one wins the race." },
      explain: { audio: `${Q}/c-6-speak-why-flash-first-explain.mp3`, script: "You see lightning first because light travels much faster than sound, so the flash reaches your eyes before the boom reaches your ears." },
      interaction: { type: "speak", text: "light faster fast sound slow slower slowly travels travel speed quick quicker quickly far arrives reaches later behind eyes ears" },
    },
    {
      id: "h-1-middle-link-chain",
      band: "harder",
      difficulty: 1,
      prompt: "What is the middle link in the chain?",
      narration: { audio: `${Q}/h-1-middle-link-chain.mp3`, script: "Here is a fourth grade tool. Some causes come in a chain. One thing causes a second thing, and the second thing causes a third. Page two of Flash, Then Boom is a chain like that. Lightning heats the air in an instant. The heated air pushes outward and slams into the cooler air. That slam makes the boom. Lightning is the first link, and thunder is the last link. What is the middle link, the one that connects them? Read all four, then tap it." },
      hint: { audio: `${Q}/h-1-middle-link-chain-hint.mp3`, script: "The middle link is caused by the lightning, and it causes the thunder. Find the event that does both jobs." },
      explain: { audio: `${Q}/h-1-middle-link-chain-explain.mp3`, script: "The hot air slams cool air. Lightning causes the air to heat and slam outward, and that slam causes the thunder. It is the middle link in the chain." },
      interaction: { type: "choose", options: [{ id: "the-hot-air-slams-cool-air", label: "the hot air slams cool air" }, { id: "the-storm-cloud-grows-dark", label: "the storm cloud grows dark" }, { id: "the-rain-pours-even-harder", label: "the rain pours even harder" }, { id: "you-count-off-the-seconds", label: "you count off the seconds" }], correctId: "the-hot-air-slams-cool-air", coachWrong: "The middle link has to be caused by the lightning and has to cause the boom. Check each one against both jobs." },
    },
    {
      id: "h-2-why-count-seconds",
      band: "harder",
      difficulty: 2,
      prompt: "Why does the text tell you to count the seconds?",
      narration: { audio: `${Q}/h-2-why-count-seconds.mp3`, script: "Another fourth grade tool. Sometimes a text gives you a step, and a strong reader explains why that step matters, using the specific information the text gives. Listen to page four of Flash, Then Boom. Sound takes about five seconds to travel one mile. So count the seconds between the flash and the boom. Every five seconds means the lightning is about one mile away. Why does the text tell you to count the seconds? Read all four, then tap the reason." },
      hint: { audio: `${Q}/h-2-why-count-seconds-hint.mp3`, script: "Look at what the seconds turn into at the end of the page. Miles tell you a distance." },
      explain: { audio: `${Q}/h-2-why-count-seconds-explain.mp3`, script: "To tell how far the storm is. Every five seconds means about one mile, so counting the seconds tells you how far away the lightning is." },
      interaction: { type: "choose", options: [{ id: "to-tell-how-far-the-storm-is", label: "to tell how far the storm is" }, { id: "to-know-when-the-rain-stops", label: "to know when the rain stops" }, { id: "to-make-the-thunder-quieter", label: "to make the thunder quieter" }, { id: "to-count-the-flashes-you-see", label: "to count the flashes you see" }], correctId: "to-tell-how-far-the-storm-is", coachWrong: "The text turns seconds into miles. Think about what miles measure." },
    },
    {
      id: "h-3-bea-counts-ten",
      band: "harder",
      difficulty: 3,
      prompt: "Bea counts ten seconds. About how far away is the lightning?",
      narration: { audio: `${Q}/h-3-bea-counts-ten.mp3`, script: "Now use the rule from page four. Sound takes about five seconds to travel one mile, so every five seconds between the flash and the boom means the lightning is about one mile away. Bea sees a flash from her porch, and she counts ten seconds before the boom arrives. About how far away is the lightning? Tap it." },
      hint: { audio: `${Q}/h-3-bea-counts-ten-hint.mp3`, script: "Five seconds is one mile. Bea counted five seconds twice." },
      explain: { audio: `${Q}/h-3-bea-counts-ten-explain.mp3`, script: "About two miles. Five seconds means one mile, and ten seconds is five seconds twice, so the lightning is about two miles away." },
      interaction: { type: "choose", options: [{ id: "about-two-miles", label: "about two miles" }, { id: "about-ten-miles", label: "about ten miles" }, { id: "about-five-miles", label: "about five miles" }, { id: "about-one-mile", label: "about one mile" }], correctId: "about-two-miles", coachWrong: "Count by fives. How many fives fit inside ten seconds?" },
    },
    {
      id: "h-4-speak-why-go-indoors",
      band: "harder",
      difficulty: 4,
      prompt: "Tell me why you should go indoors when thunder roars. Use because or so.",
      narration: { audio: `${Q}/h-4-speak-why-go-indoors.mp3`, script: "Last one. The text says when thunder roars, go indoors, but it does not spell out the reason. Put two facts together. Thunder is the sound lightning makes, and a lightning strike can hurt you. If you can hear the thunder, the lightning is close enough to reach you. Tap the mic and tell me why you should go indoors when thunder roars, in one sentence that uses because or so." },
      hint: { audio: `${Q}/h-4-speak-why-go-indoors-hint.mp3`, script: "Thunder means lightning is near. Say what lightning could do if you stayed outside." },
      explain: { audio: `${Q}/h-4-speak-why-go-indoors-explain.mp3`, script: "You should go indoors because thunder means lightning is close, and lightning can strike and hurt you, so inside is the safe place to be." },
      interaction: { type: "speak", text: "lightning close closer near nearby dangerous danger strike strikes struck hit hurt safe safer safety inside shelter storm" },
    },
  ],
};
