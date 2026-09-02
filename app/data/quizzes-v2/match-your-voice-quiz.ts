import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Match Your Voice QUIZ (L.2.3) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Reuses the lesson's
// images for easier-band support only; ALL pairs and situations are FRESH
// vs the lesson (lesson used: play asks, grandma thank-you card, park hoops
// hello, pencil ask, come/see-ya/no-way sort, soccer-cheer moment). Quiz
// situations: library book ask, class-play invitation to Grandpa, cousin
// bike ride, gotta-go/yep/later-gator sort, more-time ask, recess goal
// cheer. Harder = G3 transfer taught in stimulus: formal WRITING vs formal
// speaking, switching voices mid-conversation, why an author chose
// playground voice for dialogue, spell-it-all-the-way-out production.
// Characters fresh: Isla, Mara, Jun, Roz, Mrs. Reed.

const Q = "/audio/quizzes-v2/match-your-voice-quiz";
const IMG = (w: string) => `/images/lessons-v2/match-your-voice/${w.toLowerCase()}.png`;

export const matchYourVoiceQuiz: QuizDef = {
  id: "match-your-voice-quiz",
  lessonId: "match-your-voice",
  title: "Match Your Voice Quiz",
  standard: "L.2.3",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-recess-voice",
      band: "easier",
      difficulty: 1,
      prompt: "Your best friend wants to play at recess. Which voice fits?",
      image: IMG("recess-ball"),
      narration: { audio: `${Q}/e-1-recess-voice.mp3`, script: "Your best friend runs up at recess and wants to play. One of your two voices fits a best friend at recess. Tap that voice." },
      hint: { audio: `${Q}/e-1-recess-voice-hint.mp3`, script: "Look at the playground in the picture. Which voice is short, relaxed, and easy?" },
      explain: { audio: `${Q}/e-1-recess-voice-explain.mp3`, script: "Playground voice fits. Best friends at recess hear your short, relaxed voice, and it is a good voice for that moment." },
      interaction: { type: "choose", options: [{ id: "playground-voice", label: "playground voice" }, { id: "school-voice", label: "school voice" }], correctId: "playground-voice", coachWrong: "A best friend at recess wants the relaxed voice. Try again!" },
    },
    {
      id: "e-2-teacher-voice",
      band: "easier",
      difficulty: 2,
      prompt: "You are asking your teacher a question. Which voice fits?",
      image: IMG("classroom-pencils"),
      narration: { audio: `${Q}/e-2-teacher-voice.mp3`, script: "You walk up to your teacher's desk to ask a question. One of your two voices fits a teacher. Tap that voice." },
      hint: { audio: `${Q}/e-2-teacher-voice-hint.mp3`, script: "A teacher is a grown-up at school. Which voice is careful and polite?" },
      explain: { audio: `${Q}/e-2-teacher-voice-explain.mp3`, script: "School voice fits. Teachers hear your careful, polite voice with full sentences." },
      interaction: { type: "choose", options: [{ id: "school-voice", label: "school voice" }, { id: "playground-voice", label: "playground voice" }], correctId: "school-voice", coachWrong: "A teacher is a grown-up at school. Pick the careful, polite voice. Try again!" },
    },
    {
      id: "e-3-card-word",
      band: "easier",
      difficulty: 3,
      prompt: "A thank-you card wants school voice words. Which word belongs?",
      image: IMG("gift-envelope"),
      narration: { audio: `${Q}/e-3-card-word.mp3`, script: "A thank-you card is careful writing, so it wants school voice words. Read both words. Tap the one that belongs in the card." },
      hint: { audio: `${Q}/e-3-card-word-hint.mp3`, script: "The school voice loves polite words. Which word is the polite one?" },
      explain: { audio: `${Q}/e-3-card-word-explain.mp3`, script: "Please belongs in the card. It is a polite school voice word. Wanna is a fun playground word for talking with friends." },
      interaction: { type: "choose", options: [{ id: "please", label: "please" }, { id: "wanna", label: "wanna" }], correctId: "please", coachWrong: "The card wants the polite word. Try again!" },
    },
    {
      id: "e-4-park-hello",
      band: "easier",
      difficulty: 4,
      prompt: "You spot your buddy at the park. Which hello fits?",
      image: IMG("park-hoops"),
      narration: { audio: `${Q}/e-4-park-hello.mp3`, script: "You spot your buddy at the park. Buddies get the relaxed hello. Read both hellos. Tap the one that fits the park." },
      hint: { audio: `${Q}/e-4-park-hello-hint.mp3`, script: "Look at the friends in the picture. Which hello is short and easy?" },
      explain: { audio: `${Q}/e-4-park-hello-explain.mp3`, script: "Hey there fits the park. It is short and relaxed, just right for a buddy. Good day, sir is careful school voice for a grown-up you just met." },
      interaction: { type: "choose", options: [{ id: "hey-there", label: "hey there!" }, { id: "good-day-sir", label: "good day, sir." }], correctId: "hey-there", coachWrong: "A buddy at the park gets the short, easy hello. Try again!" },
    },
    {
      id: "c-1-library-ask",
      band: "core",
      difficulty: 1,
      prompt: "Isla asks the librarian for a dinosaur book. Which ask is school voice?",
      narration: { audio: `${Q}/c-1-library-ask.mp3`, script: "Isla is at the library desk, asking the librarian for a dinosaur book. Only one of these asks uses her school voice, careful and polite, in a full sentence. Read each ask. Tap the school voice." },
      hint: { audio: `${Q}/c-1-library-ask-hint.mp3`, script: "The librarian is a grown-up. Listen for polite words in a full sentence." },
      explain: { audio: `${Q}/c-1-library-ask-explain.mp3`, script: "May I borrow this book is the school voice ask. It is polite and a full sentence. The other asks are short playground bursts, better saved for a game with friends." },
      interaction: { type: "choose", options: [{ id: "may-i-borrow-this-book", label: "may i borrow this book?" }, { id: "gimme-that-book", label: "gimme that book!" }, { id: "hand-over-the-book", label: "hand over the book!" }, { id: "that-book-is-mine", label: "that book is mine!" }], correctId: "may-i-borrow-this-book", coachWrong: "That ask sounds like recess. The librarian ask wants polite words in a full sentence. Try again!" },
    },
    {
      id: "c-2-play-invitation",
      band: "core",
      difficulty: 2,
      prompt: "Mara is writing to invite Grandpa to the class play. Which line fits?",
      narration: { audio: `${Q}/c-2-play-invitation.mp3`, script: "Mara is writing an invitation so Grandpa will come to the class play. An invitation is careful writing, so it wants the school voice. Read each line. Tap the one that belongs in the invitation." },
      hint: { audio: `${Q}/c-2-play-invitation-hint.mp3`, script: "Careful writing wants polite words and a full sentence. Which line has them?" },
      explain: { audio: `${Q}/c-2-play-invitation-explain.mp3`, script: "Please come to our play belongs in the invitation. It is polite and complete. The other lines are playground voice, fun for talking, but not for an invitation." },
      interaction: { type: "choose", options: [{ id: "please-come-to-our-play", label: "please come to our play." }, { id: "get-over-here-gramps", label: "get over here, gramps!" }, { id: "yo-big-show-be-there", label: "yo! big show! be there!" }, { id: "show-up-dude", label: "show up, dude!" }], correctId: "please-come-to-our-play", coachWrong: "That line is playground voice. An invitation is careful writing. Try again!" },
    },
    {
      id: "c-3-cousin-bikes",
      band: "core",
      difficulty: 3,
      prompt: "Jun calls his cousin to go ride bikes. Which ask fits?",
      narration: { audio: `${Q}/c-3-cousin-bikes.mp3`, script: "Jun calls his cousin, his favorite bike-riding partner, to go ride after school. Family and close friends get the relaxed voice. Read each ask. Tap the one that fits a cousin." },
      hint: { audio: `${Q}/c-3-cousin-bikes-hint.mp3`, script: "A cousin is family. Which ask is short, relaxed, and easy?" },
      explain: { audio: `${Q}/c-3-cousin-bikes-explain.mp3`, script: "Wanna ride bikes fits a cousin. It is short and relaxed, and that is exactly right for family. The other asks are careful school voice, better for grown-ups you just met." },
      interaction: { type: "choose", options: [{ id: "wanna-ride-bikes", label: "wanna ride bikes?" }, { id: "shall-we-ride-bicycles", label: "shall we ride bicycles?" }, { id: "would-you-care-to-ride", label: "would you care to ride?" }, { id: "may-we-ride-together-sir", label: "may we ride together, sir?" }], correctId: "wanna-ride-bikes", coachWrong: "That ask is careful school voice. A cousin gets the relaxed voice. Try again!" },
    },
    {
      id: "c-4-voice-sort",
      band: "core",
      difficulty: 4,
      prompt: "Sort each line: playground voice or school voice.",
      narration: { audio: `${Q}/c-4-voice-sort.mp3`, script: "Read each line and say it in your head. Is it short and relaxed, for friends and family? Or careful and polite, for a teacher or a grown-up you just met? Drag each line to its voice." },
      hint: { audio: `${Q}/c-4-voice-sort-hint.mp3`, script: "Ask yourself, would I say this to my buddy, or to my teacher?" },
      explain: { audio: `${Q}/c-4-voice-sort-explain.mp3`, script: "Gotta go, yep, and later, gator are short, relaxed playground voice. I have to leave now, yes, please, and goodbye, Mrs. Reed are careful, polite school voice." },
      interaction: { type: "sort", buckets: ["Playground Voice","School Voice"], bucketAudio: { "Playground Voice": `${Q}/b-playground-voice.mp3`, "School Voice": `${Q}/b-school-voice.mp3` }, items: [{ label: "gotta go!", bucket: "Playground Voice" }, { label: "i have to leave now.", bucket: "School Voice" }, { label: "yep!", bucket: "Playground Voice" }, { label: "yes, please.", bucket: "School Voice" }, { label: "later, gator!", bucket: "Playground Voice" }, { label: "goodbye, mrs. reed.", bucket: "School Voice" }], coachWrong: "Say the line in your head. Buddy words are short and relaxed. Teacher words are careful and polite. Try again!" },
    },
    {
      id: "c-5-more-time-ask",
      band: "core",
      difficulty: 5,
      prompt: "Rafi needs more time on his drawing. Which ask fits his teacher?",
      narration: { audio: `${Q}/c-5-more-time-ask.mp3`, script: "Same message, two voices. At home, Rafi might holler, gimme more time. Now he is asking his teacher for more time on his drawing, so the message needs its school voice. Read each ask. Tap the school voice way." },
      hint: { audio: `${Q}/c-5-more-time-ask-hint.mp3`, script: "The teacher ask wants polite words in a full sentence. Which ask has them?" },
      explain: { audio: `${Q}/c-5-more-time-ask-explain.mp3`, script: "May I have more time is the school voice ask, polite and complete. The other asks still sound like the playground, and they are better saved for it." },
      interaction: { type: "choose", options: [{ id: "may-i-have-more-time", label: "may i have more time?" }, { id: "gimme-more-time", label: "gimme more time!" }, { id: "i-need-more-time", label: "i need more time!" }, { id: "more-time-ok", label: "more time, ok?" }], correctId: "may-i-have-more-time", coachWrong: "That one still sounds like the playground. Find the polite, full-sentence ask. Try again!" },
    },
    {
      id: "c-6-speak-goal-cheer",
      band: "core",
      difficulty: 6,
      prompt: "Your friend just scored a goal at recess. Cheer in playground voice.",
      narration: { audio: `${Q}/c-6-speak-goal-cheer.mp3`, script: "Your friend just scored a goal at recess, and cheering is a playground voice moment. Give them a loud, happy playground cheer. Tap the mic and say your cheer." },
      hint: { audio: `${Q}/c-6-speak-goal-cheer-hint.mp3`, script: "Keep it short, loud, and happy, the way you cheer with friends." },
      explain: { audio: `${Q}/c-6-speak-goal-cheer-explain.mp3`, script: "Any short, happy burst works here. Yay, woohoo, awesome, goal. Cheering with friends is exactly what the playground voice is for." },
      interaction: { type: "speak", text: "yay yeah woohoo hooray awesome goal nice sweet epic let's yes" },
    },
    {
      id: "h-1-writing-thanks",
      band: "harder",
      difficulty: 1,
      prompt: "Mara is writing to the library to ask for a book. Which thanks fits?",
      narration: { audio: `${Q}/h-1-writing-thanks.mp3`, script: "Here is a third grade move. Your school voice has two levels. Speaking politely is one level, and formal writing is one step more careful. When Mara talks to her teacher, thanks sounds fine. But now she is writing to the town library to ask for a book. Read each thanks. Tap the one careful enough for formal writing." },
      hint: { audio: `${Q}/h-1-writing-thanks-hint.mp3`, script: "Formal writing is the most careful level. Which thanks is complete, with no shortcuts?" },
      explain: { audio: `${Q}/h-1-writing-thanks-explain.mp3`, script: "Thank you very much fits formal writing. It is complete and extra careful. Thanks a ton, thanks a bunch, and you rock are friendly talking words, one level too relaxed for a formal letter." },
      interaction: { type: "choose", options: [{ id: "thank-you-very-much", label: "thank you very much." }, { id: "thanks-a-ton", label: "thanks a ton!" }, { id: "thanks-a-bunch", label: "thanks a bunch!" }, { id: "thanks-you-rock", label: "thanks, you rock!" }], correctId: "thank-you-very-much", coachWrong: "Formal writing wants the most careful thanks, with no shortcuts. Try again!" },
    },
    {
      id: "h-2-hallway-switch",
      band: "harder",
      difficulty: 2,
      prompt: "Jun is joking with a friend when the principal walks up. What now?",
      narration: { audio: `${Q}/h-2-hallway-switch.mp3`, script: "Third graders can switch voices in the middle of a conversation. Jun is joking with his friend in the hall, all playground voice. Then the principal walks up and asks Jun a question. The friend did not change, but the listener did. Read each choice. Tap what a smart talker does next." },
      hint: { audio: `${Q}/h-2-hallway-switch-hint.mp3`, script: "The voice matches the listener. Who is Jun talking to now?" },
      explain: { audio: `${Q}/h-2-hallway-switch-explain.mp3`, script: "Jun switches to school voice, because his listener changed to the principal. His playground voice was never wrong, it is just not for this listener. When the principal leaves, the playground voice can come right back." },
      interaction: { type: "choose", options: [{ id: "switch-to-school-voice", label: "switch to school voice" }, { id: "keep-the-playground-voice", label: "keep the playground voice" }, { id: "stop-talking-completely", label: "stop talking completely" }, { id: "shout-so-both-can-hear", label: "shout so both can hear" }], correctId: "switch-to-school-voice", coachWrong: "The listener just changed. Match the voice to the new listener. Try again!" },
    },
    {
      id: "h-3-author-choice",
      band: "harder",
      difficulty: 3,
      prompt: "An author makes Roz say, wanna bet, slowpoke? Why that voice?",
      narration: { audio: `${Q}/h-3-author-choice.mp3`, script: "Third grade readers notice that authors pick voices on purpose. In a story, an author makes a kid character named Roz say, wanna bet, slowpoke? That is pure playground voice, right there in a book. Read each reason. Tap why the author picked that voice for Roz." },
      hint: { audio: `${Q}/h-3-author-choice-hint.mp3`, script: "Think about how real kids sound when they joke with each other." },
      explain: { audio: `${Q}/h-3-author-choice-explain.mp3`, script: "The author picked playground voice to make Roz feel real. Real kids joke in short, relaxed words, so the dialogue shows exactly who Roz is. Authors choose voices for characters the same way you choose voices for moments." },
      interaction: { type: "choose", options: [{ id: "to-make-roz-feel-real", label: "to make roz feel real" }, { id: "the-author-ran-out-of-time", label: "the author ran out of time" }, { id: "to-teach-polite-manners", label: "to teach polite manners" }, { id: "because-roz-is-in-trouble", label: "because roz is in trouble" }], correctId: "to-make-roz-feel-real", coachWrong: "Authors pick each character's voice on purpose. What does playground talk show about Roz? Try again!" },
    },
    {
      id: "h-4-speak-spell-it-out",
      band: "harder",
      difficulty: 4,
      prompt: "In a formal note, say the long way to write can't.",
      narration: { audio: `${Q}/h-4-speak-spell-it-out.mp3`, script: "One more third grade move. In formal writing, shortcut words get spelled all the way out. Can't is a shortcut. In a formal note to her teacher, Mara would write the long way, with no shortcut. Tap the mic and say the long way to write can't." },
      hint: { audio: `${Q}/h-4-speak-spell-it-out-hint.mp3`, script: "Can't is two words squeezed together. Say them the long way, with no squeeze." },
      explain: { audio: `${Q}/h-4-speak-spell-it-out-explain.mp3`, script: "Cannot. In formal writing, can't stretches back out to cannot, the careful, no-shortcut way to write it." },
      interaction: { type: "speak", text: "cannot can not" },
    },
  ],
};
