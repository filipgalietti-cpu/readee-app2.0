import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./hold-it-up-timings.json";

// Hold It Up! (RI.2.8) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=hold-it-up
// G2: describe HOW reasons support the author's point. Step-up from G1 prove-it
// (find the reasons) to the SUPPORT relationship itself: point = stool seat,
// reasons = the legs that hold it up; a true-but-loose sentence is not a leg.
// Anchor: original TRUE persuasive info passage "Drink Up" (point: kids should
// drink water every day; legs: refills what sweat takes / cools you down /
// no sugar, kind to teeth). Second point for the sort: washing hands stops germs.
// Keys prefixed quiz- are fresh stimuli for the quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/hold-it-up/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/hold-it-up/${w.toLowerCase()}.png`;

export const holdItUpImages: Record<string, string | { subject: string; ref?: string }> = {
  "stool-diagram": "A clear teaching picture of one sturdy wooden stool on a plain soft cream background: a smooth round honey-brown wooden seat on top held up by exactly three strong straight wooden legs arranged like a camera tripod, one single leg slanting down toward the front center of the picture and the other two legs slanting down behind it to the left and to the right, only three legs in total so anyone can count one two three, bold clean outlines, a gentle soft shadow under the legs. Nothing else in the picture. No letters, no words, no numbers, no labels, no writing anywhere.",
  "stool-water": { subject: "The same sturdy wooden three-legged stool on the same plain soft cream background, the same smooth round honey-brown wooden seat on top held up by the same exactly three strong straight wooden legs arranged like a camera tripod, one single leg slanting down toward the front center and two legs slanting down behind to the left and right, only three legs in total, and now a single clear drinking glass full of fresh blue water standing upright in the middle of the round seat, two tiny sparkles on the glass, bold clean outlines, a gentle soft shadow under the legs. Nothing else in the picture. No letters, no words, no numbers, no labels, no writing anywhere.", ref: "stool-diagram" },
  "water-break": "A cheerful young girl with curly black hair wearing a bright yellow shirt sitting on green park grass and drinking from a clear glass of cool water, a black and white soccer ball resting on the grass beside her, her cheeks rosy from playing, one big leafy green tree and a plain blue sky with two puffy white clouds behind her. No letters, no words, no numbers, no writing anywhere.",
  "playing-outside": "Two happy children playing outside in a sunny green park: a boy with short brown hair kicking a red ball and a girl with a dark ponytail running beside him with open arms, big leafy green trees behind them, a plain bright yellow sun high in a plain blue sky. The sun is a plain circle with no face. No letters, no words, no numbers, no writing anywhere, no faces on the sun or clouds.",
  "quiz-brushing": "A smiling young boy with short black hair in blue pajamas happily brushing his teeth with a green toothbrush in front of a round bathroom mirror, a small tube of toothpaste and a cup on the tidy white sink, soft mint-green bathroom wall behind. No letters, no words, no numbers, no writing anywhere.",
  "quiz-breakfast": "A cheerful young girl with brown pigtails sitting at a sunny kitchen table eating breakfast: a bowl of cereal with a spoon, a glass of milk, and a banana on a small plate, warm morning light through a window with yellow curtains behind her. No letters, no words, no numbers, no writing anywhere.",
  "quiz-sleeping": "A peaceful young child with curly dark hair fast asleep in a cozy bed under a soft blue blanket, head on a fluffy white pillow, a small teddy bear tucked beside them, a crescent moon and two stars visible through the dark window, a warm little bedside lamp glowing softly. No letters, no words, no numbers, no writing anywhere, no faces on the moon.",
  "quiz-swimming": "A happy young girl wearing a bright pink swim cap and orange arm floaties swimming in a clear blue pool, splashing gently with a big smile, a friendly adult swim teacher in the water nearby with open arms, small waves and sparkles on the sunny water. No letters, no words, no numbers, no writing anywhere.",
};

export const holdItUp: LessonDef = {
  id: "hold-it-up",
  title: "Hold It Up!",
  grade: "2nd Grade",
  standard: "RI.2.8",
  archetype: "inference",
  objective: "I can describe how an author's reasons hold up the author's point.",
  concepts: ["the point is the big idea the author wants you to believe","reasons tell why the point is true","reasons hold up the point like legs hold up a stool","a true sentence must still tell why to count as a reason","each point needs its own reasons"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today an author made a point, and you looked underneath it. You found the reasons holding it up, you said how each one helped, and you spotted the sentences that were true but too loose to hold anything. Whenever an author tells you to believe something, check the legs. A point only stands when its reasons hold it up.",
    "title": "You Held It Up!",
    "body": "You found an author's point and described how the reasons hold it up."
  },
  scenes: [
    {
      id: "hook-floating-point",
      purpose: "hook",
      gate: "none",
      prompt: "Should you believe a sentence with nothing under it?",
      fx: {"text":"You should go to bed **early**.","effect":"pop-words"},
      narration: { audio: A("hook-floating-point"), script: "Hello, reader. I am going to tell you something, and I want you to believe me. Here it comes: you should go to bed early. And that is all I am giving you, nothing more. A big idea like that is called a point. It is what an author wants you to believe. But right now my point is just floating in the air with nothing under it. Why should you believe it? Good authors never let a point float. Today you will see what holds a point up." },
    },
    {
      id: "model-stool-legs",
      purpose: "model",
      gate: "none",
      prompt: "The point is the seat. Reasons are the legs.",
      image: IMG("stool-diagram"),
      narration: { audio: A("model-stool-legs"), script: "Here is my favorite way to picture it. Look at this stool. The seat on top is like the author's point, the big idea. But a seat cannot hang in the air on its own. It needs legs. In a book, the legs are called reasons. A reason is a sentence that tells why the point is true. Look at those strong legs under the seat. Every leg pushes up, and the seat stands steady. That is how a good author writes. One point on top, and strong reasons underneath, holding it up." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: Kids should drink water every day. Your body is mostly water. Every time you play hard and sweat, a little of it drips away.",
      image: IMG("water-break"),
      narration: { audio: A("page-1-read"), script: "Our book today is called Drink Up. The author has a point to make and legs to build. Page one is all yours. Read it out loud, nice and smooth." },
      interaction: { type: "speak", text: "Kids should drink water every day Your body is mostly water Every time you play hard and sweat a little of it drips away" },
    },
    {
      id: "check-find-the-point",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence is the author's point?",
      image: IMG("stool-diagram"),
      narration: { audio: A("check-find-the-point"), script: "Great reading. Somewhere on page one, the author set down the seat of the stool. That is the point, the big idea the whole book wants you to believe. The other sentences are already working as legs underneath it. Find the seat. Tap the author's point." },
      interaction: { type: "choose", options: [{ id: "kids-should-drink-water", label: "kids should drink water" }, { id: "your-body-is-mostly-water", label: "your body is mostly water" }, { id: "playing-hard-makes-you-sweat", label: "playing hard makes you sweat" }, { id: "a-little-water-drips-away", label: "a little water drips away" }], correctId: "kids-should-drink-water", coachWrong: "A point is the big idea the author wants you to believe. A leg only tells why. Ask each sentence: are you the big idea, or are you holding one up?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Drinking water fills your body back up. Water also cools you down when you get hot. Best of all, water has no sugar, so it is kind to your teeth.",
      image: IMG("water-break"),
      narration: { audio: A("page-2-read"), script: "The author is not done building. Page two adds more legs under the point. Read page two out loud, and listen for the whys." },
      interaction: { type: "speak", text: "Drinking water fills your body back up Water also cools you down when you get hot Best of all water has no sugar so it is kind to your teeth" },
    },
    {
      id: "check-find-a-leg",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence is one of the author's reasons?",
      image: IMG("stool-water"),
      narration: { audio: A("check-find-a-leg"), script: "Now you have heard the whole argument. The author's point is that kids should drink water every day, and under that point the author built strong legs. Here are four sentences. Only one of them is a leg the author really built in this book. Tap the author's reason." },
      interaction: { type: "choose", options: [{ id: "water-has-no-sugar", label: "water has no sugar" }, { id: "juice-comes-from-fruit", label: "juice comes from fruit" }, { id: "cups-can-hold-water", label: "cups can hold water" }, { id: "rain-falls-from-clouds", label: "rain falls from clouds" }], correctId: "water-has-no-sugar", coachWrong: "Think back to the book. Which of these sentences did the author actually use to tell why kids should drink water?" },
    },
    {
      id: "check-how-it-holds",
      purpose: "apply",
      gate: "interaction",
      prompt: "The author says water cools you down. What job is that sentence doing?",
      image: IMG("stool-water"),
      narration: { audio: A("check-how-it-holds"), script: "Time to look at how a leg holds up the seat. The author wrote that water cools you down when you get hot. Why put that sentence in the book at all? Think about what that sentence does for the point. Tap the job it is doing." },
      interaction: { type: "choose", options: [{ id: "it-tells-why-to-drink-water", label: "it tells why to drink water" }, { id: "it-tells-how-rain-is-made", label: "it tells how rain is made" }, { id: "it-names-who-wrote-the-book", label: "it names who wrote the book" }, { id: "it-makes-the-book-longer", label: "it makes the book longer" }], correctId: "it-tells-why-to-drink-water", coachWrong: "The point is that kids should drink water every day. Now think about the cooling sentence again. What does it do for that point?" },
    },
    {
      id: "check-true-but-loose",
      purpose: "apply",
      gate: "interaction",
      prompt: "Every sentence here is true. Which one could hold up the point?",
      image: IMG("stool-diagram"),
      narration: { audio: A("check-true-but-loose"), script: "Here is the trickiest part of leg building, so listen closely. Every sentence on the screen is true. But true is not enough to be a leg! A leg must tell why our point is true: kids should drink water every day. Ask each sentence: do you tell me why kids should drink? Tap the one sentence that could hold up our point." },
      interaction: { type: "choose", options: [{ id: "drinking-water-stops-thirst", label: "drinking water stops thirst" }, { id: "fish-live-in-water", label: "fish live in water" }, { id: "ice-is-frozen-water", label: "ice is frozen water" }, { id: "oceans-are-salty-water", label: "oceans are salty water" }], correctId: "drinking-water-stops-thirst", coachWrong: "That sentence is true, but true is not the test. The test is: does it tell why kids should drink water every day? Find the sentence that answers why." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("stool-water"),
      narration: { audio: A("page-3-read"), script: "Here is the last page of Drink Up. Watch how the author stacks every leg under the point one more time. Read along with me." },
      interaction: { type: "read-along", text: "Water fills you up, cools you down, and guards your smile. Now you know why kids should drink water every day.", audio: A("page-3-read-sentence") },
    },
    {
      id: "sort-two-points",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Two points, six legs. Drag each leg to its point.",
      narration: { audio: A("sort-two-points"), script: "Authors can make more than one point, and each point needs its own legs. You know our first point: kids should drink water every day. Now a second author makes a second point: washing your hands keeps germs away. Six legs got jumbled together on the floor. Read each leg, ask it which point it holds up, and drag it home." },
      interaction: { type: "sort", buckets: ["Drink Water","Wash Hands"], items: [{ label: "sweat dries your body out", bucket: "Drink Water" }, { label: "soap lifts germs off skin", bucket: "Wash Hands" }, { label: "a cold sip cools you down", bucket: "Drink Water" }, { label: "germs hide on dirty hands", bucket: "Wash Hands" }, { label: "no sugar means happy teeth", bucket: "Drink Water" }, { label: "germs can make you sick", bucket: "Wash Hands" }], coachWrong: "Read that leg one more time. Does it tell why to drink water, or why to wash your hands? Slide it under the point it truly holds up." },
    },
    {
      id: "challenge-missing-leg",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which sentence could be the missing third leg?",
      image: IMG("playing-outside"),
      narration: { audio: A("challenge-missing-leg"), script: "Last book of the day, and this author needs your help. The point: playing outside is good for you. The author built two legs so far. Running makes your heart strong. Sunshine helps your bones grow. But this stool is wobbling on two legs! One more reason would make it stand steady. Tap the sentence that could work as the third leg." },
      interaction: { type: "choose", options: [{ id: "fresh-air-helps-your-brain", label: "fresh air helps your brain" }, { id: "balls-bounce-on-the-ground", label: "balls bounce on the ground" }, { id: "grass-grows-all-over-parks", label: "grass grows all over parks" }, { id: "some-shoes-have-laces", label: "some shoes have laces" }], correctId: "fresh-air-helps-your-brain", coachWrong: "A third leg must tell why playing outside is good for you. True is not enough. Which sentence answers why?" },
    },
    {
      id: "challenge-say-a-leg",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say one of the author's reasons in your own words.",
      image: IMG("water-break"),
      narration: { audio: A("challenge-say-a-leg"), script: "One last job, reader. Our first author's point was that kids should drink water every day. You found the legs under it. Now pick your favorite leg and say it in your own words. Tap the mic and tell me one reason kids should drink water." },
      interaction: { type: "speak", text: "water sweat sweaty refill refills fills fill cool cools cooler cooling down hot sugar teeth tooth smile body thirsty thirst drink drinks healthy" },
    },
    {
      id: "celebrate-strong-stool",
      purpose: "celebrate",
      gate: "none",
      prompt: "You held the point up!",
      fx: {"text":"**Reasons** hold the point up!","effect":"fireworks"},
      narration: { audio: A("celebrate-strong-stool"), script: "What a builder you are. You found the author's point, kids should drink water every day, and you found every leg holding it up. Water refills what sweat takes away, it cools you down, and it is kind to your teeth. You even spotted sentences that were true but too loose to hold anything. From now on, when an author makes a point, look under it and find the legs. That is how strong readers check that a point really stands." },
    },
  ],
};
