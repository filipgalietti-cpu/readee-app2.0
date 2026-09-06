import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Three Word Tools QUIZ (L.3.4) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge,
// 3-opt, ONE tool per word, 3 picture supports) / core(on-grade G3: which
// tool fits, meaning after choosing, 6-item tool sort, the sentence picks the
// meaning, first-tool-fails, production speak) / harder(G4 transfer TAUGHT in
// the stimulus first, L.4.4b: an old root plus an affix stacked inside one
// word, mar = sea and vis = see modeled, then applied, closing with a
// production speak). ALL stimuli FRESH vs the lesson (rummaged, unhurried,
// tripped, windowless, delighted, dwindled, guitarist, silence, restored,
// unsteady, noiseless, height, tourist, glimmered, shuddered) and grep-swept
// vs the whole catalog. Second text: Tariq and Aunt Salma ride the morning
// ferry to Bell Island, spoken page by page inside the questions that need
// it. Quiz words: crammed, unbuttoned, rower, left (went away sense),
// lurched, unhooked, tireless, decision, length, bobbed, squawked, current,
// recovered, hoisted, submarine, mariner, visible, invisible, supervisor,
// unsinkable. Names fresh: Tariq, Salma. Tiles lowercase, audio-free, kebab
// ids, 28-char cap; bucket clips are quiz-local b-*.mp3 pre-synthed from
// punctuated labels.

const Q = "/audio/quizzes-v2/three-word-tools-quiz";
const IMG = (w: string) => `/images/lessons-v2/three-word-tools/${w.toLowerCase()}.png`;

export const threeWordToolsQuiz: QuizDef = {
  id: "three-word-tools-quiz",
  lessonId: "three-word-tools",
  title: "Three Word Tools Quiz",
  standard: "L.3.4",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-crammed-ferry",
      band: "easier",
      difficulty: 1,
      prompt: "What does crammed mean?",
      image: IMG("quiz-crowded-ferry"),
      narration: { audio: `${Q}/e-1-crammed-ferry.mp3`, script: "Listen. The morning ferry to Bell Island was crammed, so full that Tariq could not find one empty seat. Read around the word. What does crammed mean?" },
      hint: { audio: `${Q}/e-1-crammed-ferry-hint.mp3`, script: "The words right after crammed tell you how full the ferry was." },
      explain: { audio: `${Q}/e-1-crammed-ferry-explain.mp3`, script: "Crammed means packed full of people. The clue tells it straight, so full that Tariq could not find one empty seat." },
      interaction: { type: "choose", options: [{ id: "packed-full-of-people", label: "packed full of people" }, { id: "nearly-empty-inside", label: "nearly empty inside" }, { id: "moving-very-slowly", label: "moving very slowly" }], correctId: "packed-full-of-people", coachWrong: "Read the words after crammed again. How many seats were empty?" },
    },
    {
      id: "e-2-unbuttoned-jacket",
      band: "easier",
      difficulty: 2,
      prompt: "What does unbuttoned mean?",
      image: IMG("quiz-boy-jacket-deck"),
      narration: { audio: `${Q}/e-2-unbuttoned-jacket.mp3`, script: "Listen. The sun was warm on the deck, so Tariq unbuttoned his jacket and let the breeze in. Take the word apart. What does unbuttoned mean?" },
      hint: { audio: `${Q}/e-2-unbuttoned-jacket-hint.mp3`, script: "Find the part on the front of unbuttoned. It flips the word." },
      explain: { audio: `${Q}/e-2-unbuttoned-jacket-explain.mp3`, script: "Unbuttoned means opened the buttons. Un flips button, and the breeze getting in proves it." },
      interaction: { type: "choose", options: [{ id: "opened-the-buttons", label: "opened the buttons" }, { id: "closed-the-buttons", label: "closed the buttons" }, { id: "lost-all-the-buttons", label: "lost all the buttons" }], correctId: "opened-the-buttons", coachWrong: "The part on the front of unbuttoned flips it. Could a breeze get in if the jacket were closed?" },
    },
    {
      id: "e-3-rower-boat",
      band: "easier",
      difficulty: 3,
      prompt: "What does rower mean?",
      narration: { audio: `${Q}/e-3-rower-boat.mp3`, script: "Listen. A rower in a small boat waved as the ferry passed, pulling her oars through the water. Find the word you know inside rower. What does rower mean?" },
      hint: { audio: `${Q}/e-3-rower-boat-hint.mp3`, script: "Read rower from the front. The short word you know at the front is what she is doing with the oars." },
      explain: { audio: `${Q}/e-3-rower-boat-explain.mp3`, script: "A rower is a person who rows a boat. The root row is at the front, and er names the person doing it." },
      interaction: { type: "choose", options: [{ id: "a-person-who-rows-a-boat", label: "a person who rows a boat" }, { id: "a-kind-of-small-fish", label: "a kind of small fish" }, { id: "a-long-wooden-dock", label: "a long wooden dock" }], correctId: "a-person-who-rows-a-boat", coachWrong: "Look at the word you know at the front of rower, then test it. She was pulling oars." },
    },
    {
      id: "e-4-left-the-dock",
      band: "easier",
      difficulty: 4,
      prompt: "Which meaning of left does the sentence pick?",
      image: IMG("quiz-ferry-leaving-dock"),
      narration: { audio: `${Q}/e-4-left-the-dock.mp3`, script: "Listen. At eight o'clock the ferry left the dock, and the people waving grew smaller and smaller. Left is a word you know. Test each meaning, and tap the one the sentence picks." },
      hint: { audio: `${Q}/e-4-left-the-dock-hint.mp3`, script: "The waving people grew smaller and smaller. What was the ferry doing?" },
      explain: { audio: `${Q}/e-4-left-the-dock-explain.mp3`, script: "Left means went away from. The ferry moved away from the dock, so the sentence picks that meaning, not the side that is not right." },
      interaction: { type: "choose", options: [{ id: "went-away-from", label: "went away from" }, { id: "the-side-that-is-not-right", label: "the side that is not right" }, { id: "stayed-close-to", label: "stayed close to" }], correctId: "went-away-from", coachWrong: "Test that meaning in the sentence. Would the waving people grow smaller if the ferry did that?" },
    },
    {
      id: "c-1-lurched-tool",
      band: "core",
      difficulty: 1,
      prompt: "Which tool fits lurched?",
      narration: { audio: `${Q}/c-1-lurched-tool.mp3`, script: "Listen. Halfway across, a big wave hit, and the ferry lurched so hard that everyone grabbed the rail. Look at the word lurched before you look at the sentence. What do you see inside it? Tap the tool that fits lurched." },
      hint: { audio: `${Q}/c-1-lurched-tool-hint.mp3`, script: "Is there a part you have learned on lurched, or a word you know hiding inside it? If not, which tool is left?" },
      explain: { audio: `${Q}/c-1-lurched-tool-explain.mp3`, script: "Read around it. Nothing inside lurched is a word you know, so the sentence has to do the work, and everyone grabbing the rail shows a sudden hard move." },
      interaction: { type: "choose", options: [{ id: "read-around-it", label: "read around it" }, { id: "take-it-apart", label: "take it apart" }, { id: "find-the-root", label: "find the root" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }], correctId: "read-around-it", coachWrong: "Look at the word again. Can you find a known part or a known word inside lurched? If nothing is there, which tool does that leave?" },
    },
    {
      id: "c-2-lurched-meaning",
      band: "core",
      difficulty: 2,
      prompt: "What does lurched mean here?",
      narration: { audio: `${Q}/c-2-lurched-meaning.mp3`, script: "The same sentence. Halfway across, a big wave hit, and the ferry lurched so hard that everyone grabbed the rail. Use the tool, test each meaning in that sentence, and tap the one that passes the test." },
      hint: { audio: `${Q}/c-2-lurched-meaning-hint.mp3`, script: "Why would everyone grab the rail all at once? Test each meaning against that." },
      explain: { audio: `${Q}/c-2-lurched-meaning-explain.mp3`, script: "Lurched means jerked hard to one side. People grab a rail when the boat throws them sideways, and a big wave does exactly that." },
      interaction: { type: "choose", options: [{ id: "jerked-hard-to-one-side", label: "jerked hard to one side" }, { id: "slowed-down-and-stopped", label: "slowed down and stopped" }, { id: "sounded-a-loud-horn", label: "sounded a loud horn" }, { id: "floated-calmly-along", label: "floated calmly along" }], correctId: "jerked-hard-to-one-side", coachWrong: "Test that meaning. Would everyone grab the rail if the ferry did that?" },
    },
    {
      id: "c-3-sort-by-tool",
      band: "core",
      difficulty: 3,
      prompt: "Sort each word by the tool that fits it.",
      narration: { audio: `${Q}/c-3-sort-by-tool.mp3`, script: "Six new words. Look at each word and choose its tool. A whole word you know with a part you have learned snapped on goes to Take It Apart. A word you know hiding inside with its spelling shifted goes to Find the Root. A word with nothing you know inside goes to Read Around It." },
      hint: { audio: `${Q}/c-3-sort-by-tool-hint.mp3`, script: "Read that word from the front. Is there a part like un or less on a word you know, a word you know with changed spelling, or nothing at all?" },
      explain: { audio: `${Q}/c-3-sort-by-tool-explain.mp3`, script: "Unhooked and tireless take apart, un plus hook and tire plus less. Decision hides decide, and length hides long, so you find the root. Bobbed and squawked give you nothing inside, so you read around them." },
      interaction: { type: "sort", buckets: ["Take It Apart","Find the Root","Read Around It"], bucketAudio: { "Take It Apart": `${Q}/b-take-it-apart.mp3`, "Find the Root": `${Q}/b-find-the-root.mp3`, "Read Around It": `${Q}/b-read-around-it.mp3` }, items: [{ label: "unhooked", bucket: "Take It Apart" }, { label: "decision", bucket: "Find the Root" }, { label: "bobbed", bucket: "Read Around It" }, { label: "tireless", bucket: "Take It Apart" }, { label: "length", bucket: "Find the Root" }, { label: "squawked", bucket: "Read Around It" }], coachWrong: "Look at that word again. A learned part on a known word, a known word with shifted spelling, or nothing you know inside?" },
    },
    {
      id: "c-4-current-meaning",
      band: "core",
      difficulty: 4,
      prompt: "Which meaning of current does the sentence pick?",
      narration: { audio: `${Q}/c-4-current-meaning.mp3`, script: "Listen. Near the island, the current pulled the ferry sideways, so the captain steered hard to stay on course. You may know current from the current week, the one happening right now. Test that meaning. Does it fit? When the meaning you know does not fit, the sentence picks the meaning. Read all four, and tap the one the sentence picks." },
      hint: { audio: `${Q}/c-4-current-meaning-hint.mp3`, script: "What could pull a boat sideways and make a captain steer hard?" },
      explain: { audio: `${Q}/c-4-current-meaning-explain.mp3`, script: "Current means the flow of moving water. Water that pulls a boat sideways is a current, and the sentence picks that meaning over right now." },
      interaction: { type: "choose", options: [{ id: "the-flow-of-moving-water", label: "the flow of moving water" }, { id: "happening-right-now", label: "happening right now" }, { id: "a-strong-gust-of-wind", label: "a strong gust of wind" }, { id: "a-deep-hole-in-the-sea", label: "a deep hole in the sea" }], correctId: "the-flow-of-moving-water", coachWrong: "Test that meaning in the sentence. Could it pull a ferry sideways on the water?" },
    },
    {
      id: "c-5-recovered-tool-fails",
      band: "core",
      difficulty: 5,
      prompt: "What does recovered mean here?",
      narration: { audio: `${Q}/c-5-recovered-tool-fails.mp3`, script: "Listen. By the time the ferry docked, Tariq had recovered from his dizzy spell, and he felt fine again. Look at recovered. There is re, a part you know, on cover, a word you know. Take it apart, and you get covered again. Test it. Tariq was covered again from his dizzy spell? That does not fit, so switch tools. Read around it, and tap the meaning that passes the test." },
      hint: { audio: `${Q}/c-5-recovered-tool-fails-hint.mp3`, script: "The words felt fine again tell you what happened to Tariq." },
      explain: { audio: `${Q}/c-5-recovered-tool-fails-explain.mp3`, script: "Recovered means got better again. Covered again failed the test, and reading around the word proved he felt fine." },
      interaction: { type: "choose", options: [{ id: "got-better-again", label: "got better again" }, { id: "was-covered-up-again", label: "was covered up again" }, { id: "fell-down-once-more", label: "fell down once more" }, { id: "stayed-dizzy-longer", label: "stayed dizzy longer" }], correctId: "got-better-again", coachWrong: "The take-it-apart sum failed. Read around the word instead. He felt fine again, so what had happened?" },
    },
    {
      id: "c-6-speak-hoisted",
      band: "core",
      difficulty: 6,
      prompt: "Say what hoisted means, and name the tool you used.",
      narration: { audio: `${Q}/c-6-speak-hoisted.mp3`, script: "Listen. The deckhand hoisted the heavy rope onto his shoulder, lifting it with one grunt, and tied the ferry to the dock. Tap the mic, say what hoisted means, and name the tool you used." },
      hint: { audio: `${Q}/c-6-speak-hoisted-hint.mp3`, script: "The words right after hoisted show what the deckhand did with the rope." },
      explain: { audio: `${Q}/c-6-speak-hoisted-explain.mp3`, script: "Hoisted means lifted up. You read around it, and lifting it with one grunt tells it straight." },
      interaction: { type: "speak", text: "lifted lift lifting lifts raised raise raising picked pulled heaved carried shoulder grunt heavy rope read around sentence clue clues context whole" },
    },
    {
      id: "h-1-mariner-root-mar",
      band: "harder",
      difficulty: 1,
      prompt: "What does mariner mean?",
      narration: { audio: `${Q}/h-1-mariner-root-mar.mp3`, script: "Here is a fourth grade tool. Some roots come from old languages, and they hide inside many words. Mar means the sea. Watch. Sub means under, so a submarine is a boat that travels under the sea. Two parts, two tools, one meaning. Now you. On the island, an old mariner told Tariq stories about the storms he had sailed through. Use the root mar and the ending, test it in the sentence, and tap what mariner means." },
      hint: { audio: `${Q}/h-1-mariner-root-mar-hint.mp3`, script: "Mar means the sea, and er names a person. Who sails through storms?" },
      explain: { audio: `${Q}/h-1-mariner-root-mar-explain.mp3`, script: "A mariner is a person who works at sea. Mar means the sea, and er names a person, so the two parts together pass the test." },
      interaction: { type: "choose", options: [{ id: "a-person-who-works-at-sea", label: "a person who works at sea" }, { id: "a-person-who-fixes-cars", label: "a person who fixes cars" }, { id: "a-kind-of-small-silver-fish", label: "a kind of small silver fish" }, { id: "a-place-that-keeps-boats", label: "a place that keeps boats" }], correctId: "a-person-who-works-at-sea", coachWrong: "Mar means the sea, and the ending names a person. Test your choice against stories about storms he had sailed through." },
    },
    {
      id: "h-2-invisible-root-vis",
      band: "harder",
      difficulty: 2,
      prompt: "What does invisible mean?",
      narration: { audio: `${Q}/h-2-invisible-root-vis.mp3`, script: "Another old root. Vis means see, as in visible, able to be seen. Now stack the parts. In means not, vis means see, and ible means can be. Listen. On the way home, thick fog rolled in, and the island was invisible behind the ferry within a minute. Put all three parts together, test it in the sentence, and tap what invisible means." },
      hint: { audio: `${Q}/h-2-invisible-root-vis-hint.mp3`, script: "In flips it. Vis means see. Ible means can be. Stack them, then test against thick fog." },
      explain: { audio: `${Q}/h-2-invisible-root-vis-explain.mp3`, script: "Invisible means could not be seen. Not, see, can be: not able to be seen, and thick fog proves it." },
      interaction: { type: "choose", options: [{ id: "could-not-be-seen", label: "could not be seen" }, { id: "could-be-seen-clearly", label: "could be seen clearly" }, { id: "could-be-seen-twice", label: "could be seen twice" }, { id: "could-be-heard-far-away", label: "could be heard far away" }], correctId: "could-not-be-seen", coachWrong: "Stack the three parts again. The one on the front flips the meaning. Then test it against the fog." },
    },
    {
      id: "h-3-supervisor-root-vis",
      band: "harder",
      difficulty: 3,
      prompt: "What does supervisor mean?",
      narration: { audio: `${Q}/h-3-supervisor-root-vis.mp3`, script: "You know vis now. Vis means see. Here is one more part. Super means over or above. Listen. On the dock, the supervisor watched every worker tie every rope before the ferry could leave. Stack the parts, test it in the sentence, and tap what supervisor means." },
      hint: { audio: `${Q}/h-3-supervisor-root-vis-hint.mp3`, script: "Super means over, vis means see, and or names a person. Who sees over the work?" },
      explain: { audio: `${Q}/h-3-supervisor-root-vis-explain.mp3`, script: "A supervisor is one who watches over workers. Over, see, person, and the sentence proves it, because the supervisor watched every worker tie every rope." },
      interaction: { type: "choose", options: [{ id: "one-who-watches-over-workers", label: "one who watches over workers" }, { id: "one-who-sails-a-boat-alone", label: "one who sails a boat alone" }, { id: "one-who-cannot-see-well", label: "one who cannot see well" }, { id: "one-who-sells-the-tickets", label: "one who sells the tickets" }], correctId: "one-who-watches-over-workers", coachWrong: "Super means over and vis means see. Test your choice against what the supervisor did on the dock." },
    },
    {
      id: "h-4-speak-unsinkable",
      band: "harder",
      difficulty: 4,
      prompt: "Say what unsinkable means, and name the parts that told you.",
      narration: { audio: `${Q}/h-4-speak-unsinkable.mp3`, script: "Last one, and you say it. The captain called the old ferry unsinkable, since it had crossed the bay for fifty years without once going down. Look at the word, and you will find a word you know with a part on the front and a part on the end. Tap the mic, tell me what unsinkable means, and name the parts that told you." },
      hint: { audio: `${Q}/h-4-speak-unsinkable-hint.mp3`, script: "The front part flips the word, and the end part means can be. Fifty years without going down tells the rest." },
      explain: { audio: `${Q}/h-4-speak-unsinkable-explain.mp3`, script: "Unsinkable means cannot be sunk. Un means not, sink is the word you know, and able means can be, so the ferry cannot be sunk." },
      interaction: { type: "speak", text: "cannot never sink sinks sinking sunk float floats floating afloat stays stay safe water down un able parts part front end" },
    },
  ],
};
