import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sayings-that-mean-more-timings.json";

// Sayings That Mean More (L.3.5a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sayings-that-mean-more
// G3-U2 word-work lesson. SAYINGS AS SHARED LANGUAGE tier of L.3.5 (sibling
// split: more-than-it-says RL.3.4 owns phrases decoded INSIDE one story from
// story clues, the reader-comprehension side, plus its contrast beat of four
// story sentences; words-in-real-life L.2.5a / words-in-your-world L.1.5c own
// real-life connections; just-right-words L.2.5b / strong-words L.1.5d own
// shades of meaning; word-pictures RL.1.4 owns sensory words in a poem).
// THIS owns: a saying is a fixed group of words people share and say the same
// way; the same words can be plain in one sentence and a saying in another
// (took the porch steps / took steps to calm down, feet cold from dew / cold
// feet about the race); the move "picture it, it cannot be, find the meaning,
// say it plain"; which saying FITS a new sentence; and PRODUCING a saying in
// a sentence of your own. Frame = one small everyday scene, "Race Day":
// Elodie, little brother Idris, Mom, Coach Perry, teammate Soren, a Saturday
// town relay at the track. Two dense read-alongs (page one 5 sentences: rise
// and shine, hit the road, on the ball, hold his horses, spilled the beans +
// literal took the porch steps; page two 5 sentences: in a pickle, under the
// weather, lend a hand, cold feet both ways, took steps + literal handed her
// the baton) + a 2-sentence accept-mode child read (over the moon, hit the
// hay). Compound + early-complex sentences, tagged dialogue, no digits.
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: every
// saying above 0 hits (piece of cake, break the ice, in hot water, keep an
// eye, on thin ice, butterflies found burned and avoided; all ears / up in
// the air / same page hits were literal prose only and still avoided);
// relay, baton-as-setting, track team, Elodie, Idris, Soren, Perry all 0
// hits (a swim relay was dropped because chunk-by-chunk carries a hotel pool
// race). Keys prefixed quiz- are fresh stimuli for the quiz (a community
// garden with Grandpa Wilbur, Silas, Freya). Speak texts carry no " my ".
// Tiles lowercase, audio-free, kebab ids, 28-char cap.

const A = (id: string) => `/audio/lessons-v2/sayings-that-mean-more/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sayings-that-mean-more/${w.toLowerCase()}.png`;

export const sayingsThatMeanMoreImages: Record<string, string | { subject: string; ref?: string }> = {
  "morning-kitchen": "A kitchen before sunrise with a dark blue window and a lamp on, a young girl with light brown skin and a dark ponytail in a green tracksuit slumped over a bowl of cereal at the table with her eyes half closed, a younger boy with light brown skin and short curly dark hair in the same green tracksuit and white running shoes standing by the door holding a packed sports bag and pointing outside, their mother with dark hair in a bun and a gray sweater holding a set of car keys and a travel mug. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no clock faces with digits, no signs, no writing anywhere.",
  "track-morning": { subject: "The same young girl with light brown skin and a dark ponytail in a green tracksuit standing on a plain red running track with only white lines, holding a shiny metal baton with both hands and looking nervous, wet green grass sparkling with dew beside the track, the same younger boy with short curly dark hair in the same green tracksuit standing next to her, a tall man in a blue coach jacket with a whistle on a cord around his neck, a small set of metal bleachers behind them where the same mother with dark hair in a bun gives a thumbs up, low golden morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no lane numbers, no signs, no writing anywhere.", ref: "morning-kitchen" },
  "quiz-garden-sunrise": "A community vegetable garden at sunrise with a pale pink and orange sky, rows of small green plants in dark soil, a wooden fence, an empty wheelbarrow, a boy with dark brown skin and short hair and a girl with pale skin and red braids in gardening gloves walking in through an open gate carrying a watering can and a small shovel, nobody else in the garden. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no sun with a face, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-digging-soil": "A close view of an older man's weathered hands in the dirt, one hand pushing a small metal hand shovel into dark crumbly soil and the other hand holding a tiny green seedling ready to plant, a row of seedlings already planted behind, a garden glove lying on the ground. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-tall-plants": "An older man with brown skin, a white beard, round glasses, and a plain green bucket hat standing proudly beside a row of tall leafy pepper plants heavy with red and green peppers that reach past his shoulders, a coiled garden hose on the ground, a wooden fence behind him, bright afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const sayingsThatMeanMore: LessonDef = {
  id: "sayings-that-mean-more",
  title: "Sayings That Mean More",
  grade: "3rd Grade",
  standard: "L.3.5a",
  archetype: "vocabulary",
  objective: "I can tell when a group of words is a saying that means more than it says, find its meaning from the sentence, and use a saying in a sentence of my own.",
  concepts: [
    "a saying is a group of words people share and say the same way",
    "picture the words; if the picture cannot be true, the words mean more",
    "find the meaning from the sentence around the saying, then say it plain",
    "the same words can mean the words in one sentence and more in another",
    "choose the saying that fits a new sentence, and use one yourself",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Race Day and met a dozen sayings that people share every day. Hit the road, on the ball, spilled the beans, hold your horses, in a pickle, under the weather, lend a hand, cold feet, over the moon, hit the hay. Each time, you pictured the words, noticed when the picture could not be true, and found the meaning in the sentence. Then you used a saying in a sentence of your own. Sayings mean more than they say, and now you know how much.",
    "title": "Sayings, Both Ways",
    "body": "You pictured each saying, found its meaning in the sentence, and used one in a sentence of your own."
  },
  scenes: [
    {
      id: "hook-read-morning",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Race Day, page one. Read along!",
      image: IMG("morning-kitchen"),
      narration: { audio: A("hook-read-morning"), script: "Hello, reader. People say things they do not mean word for word, on purpose, every single day. A saying is a group of words that everyone shares, and a third grade reader can hear one, picture what the words say, and know what the speaker really means. Here is page one of Race Day. Read along with me, and notice any group of words that could not be true if you pictured it." },
      interaction: { type: "read-along", text: "\"Rise and shine,\" called Mom at six on Saturday, because the town relay started at eight and the track was clear across town. Elodie groaned under her blanket, since the last thing she wanted was to hit the road before the sun was even up. Her little brother Idris was already dressed and on the ball, with his running shoes tied and two water bottles packed in the bag. He took the porch steps two at a time and waited by the car, honking the horn until Mom told him to hold his horses. On the drive over, Idris spilled the beans about Coach Perry's surprise, a new team cap for every runner who finished the relay.", audio: A("hook-read-morning-sentence") },
    },
    {
      id: "model-picture-it",
      purpose: "model",
      gate: "none",
      prompt: "Picture it. It cannot be. Find the meaning. Say it plain.",
      fx: {"text":"**Picture** it. It **cannot** be. Find the **meaning**. Say it **plain**.","effect":"pop-words"},
      narration: { audio: A("model-picture-it"), script: "Page one says the last thing Elodie wanted was to hit the road before the sun was up. Here is what I do with words like that. First I picture exactly what the words say. Elodie walking outside and hitting the road with her hand. That cannot be what Mom wants at six in the morning, so these words must mean more than they say. Next I find the meaning from the sentence around them. The relay starts at eight, the track is across town, and the sun is not even up. Mom wants the family to leave the house and start the trip. So hit the road means leave and get going. That is the plain version. Four steps. Picture it. It cannot be. Find the meaning. Say it plain." },
    },
    {
      id: "model-shared-sayings",
      purpose: "model",
      gate: "none",
      prompt: "The same words can do two jobs.",
      fx: {"text":"Idris **took** the porch **steps**. Coach **took steps** to fix it.","effect":"word-swap"},
      narration: { audio: A("model-shared-sayings"), script: "Hit the road is a saying. A saying is a group of words that people share, and everyone says it the same way. Nobody says hit the street or punch the road, because the saying belongs to all of us, words and all. Here is the tricky part. The very same words can be plain in one sentence and a saying in another. Page one says Idris took the porch steps two at a time. Picture it. A boy jumping up real steps. It can be true, so it means exactly what it says. Now listen to this. Coach took steps to fix the problem. Picture a coach carrying a staircase across the track. It cannot be. Here, took steps means started doing something about it. Same words, two jobs, and the sentence around them tells you which job they are doing." },
    },
    {
      id: "guided-choose-on-the-ball",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does on the ball mean here?",
      fx: {"text":"Idris was already dressed and **on the ball**","effect":"glow"},
      narration: { audio: A("guided-choose-on-the-ball"), script: "Your turn. Page one says Idris was already dressed and on the ball, with his running shoes tied and two water bottles packed. Picture it first. A boy standing on top of a ball in the kitchen. That cannot be what page one means, so find the meaning from the words around it. Dressed, shoes tied, bottles packed, and it is only six in the morning. Four plain versions are on your screen. Tap the one the sentence supports." },
      interaction: { type: "choose", options: [{ id: "ready-and-paying-attention", label: "ready and paying attention" }, { id: "balancing-on-a-round-ball", label: "balancing on a round ball" }, { id: "late-and-still-half-asleep", label: "late and still half asleep" }, { id: "playing-catch-in-the-yard", label: "playing catch in the yard" }], correctId: "ready-and-paying-attention", coachWrong: "Look at what Idris had already done by six in the morning. Which plain version fits a boy like that?" },
    },
    {
      id: "guided-choose-took-steps-two-ways",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which sentence uses took steps as a saying?",
      narration: { audio: A("guided-choose-took-steps-two-ways"), script: "Now hold both meanings at once. Four sentences are on your screen, and every one of them has the words took steps inside it. In three of them, the steps are real, and you could picture feet moving. In one of them, the words are a saying that means starting to do something about a problem. Picture each one. Tap the sentence where the steps cannot be real." },
      interaction: { type: "choose", options: [{ id: "the-town-took-steps-to-help", label: "the town took steps to help" }, { id: "she-took-the-steps-slowly", label: "she took the steps slowly" }, { id: "the-baby-took-three-steps", label: "the baby took three steps" }, { id: "he-took-two-steps-back", label: "he took two steps back" }], correctId: "the-town-took-steps-to-help", coachWrong: "Picture that one. Can you see real feet moving on real steps? Then it means the words. Find the one where no feet move at all." },
    },
    {
      id: "guided-choose-spilled-the-beans",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does spilled the beans mean here?",
      fx: {"text":"Idris **spilled the beans** about Coach Perry's surprise","effect":"underline"},
      narration: { audio: A("guided-choose-spilled-the-beans"), script: "Page one ends with Idris spilling the beans about Coach Perry's surprise, a new team cap for every runner who finished. Picture it. Beans rolling across the back seat of the car. Nothing on page one says a word about food, so the words mean more. Find the meaning from the sentence. The surprise was supposed to be a surprise, and now Elodie knows all about it. Four plain versions are on your screen. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "told-a-secret-too-early", label: "told a secret too early" }, { id: "dropped-his-snack-in-the-car", label: "dropped his snack in the car" }, { id: "made-a-mess-on-the-seat", label: "made a mess on the seat" }, { id: "forgot-the-surprise-at-home", label: "forgot the surprise at home" }], correctId: "told-a-secret-too-early", coachWrong: "The sentence tells what Idris did to a surprise, not to food. What happens to a surprise when somebody talks about it?" },
    },
    {
      id: "apply-read-track",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page two, at the track. Read along!",
      image: IMG("track-morning"),
      narration: { audio: A("apply-read-track"), script: "Page two takes the family to the track, and it is full of sayings. Read along with me, picture each one, and watch for one sentence that uses the same words two different ways." },
      interaction: { type: "read-along", text: "At the track, Coach Perry was in a pickle, because Soren had woken up under the weather and could not run his part of the relay. \"Somebody has to lend a hand,\" said Coach Perry, looking straight at Elodie, who had never raced in front of a crowd. Her feet were cold from the dew on the grass, but that was not the problem, since she had cold feet about the whole race. Idris just handed her the baton, and Mom gave her a thumbs up from the bleachers. So Elodie took steps to calm down, three slow breaths and a shake of her arms, and when the whistle blew she ran.", audio: A("apply-read-track-sentence") },
    },
    {
      id: "apply-sort-words-or-more",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Means the Words, or Means More?",
      narration: { audio: A("apply-sort-words-or-more"), script: "Six short lines from Race Day are on your screen, and each one comes from a sentence you just read. Picture each line exactly as it says. If the picture can be true, drag it to Means the Words. If the picture cannot be true and the words mean more, drag it to Means More." },
      interaction: { type: "sort", buckets: ["Means the Words","Means More"], items: [{ label: "took the porch steps", bucket: "Means the Words" }, { label: "spilled the beans about it", bucket: "Means More" }, { label: "her feet were cold from dew", bucket: "Means the Words" }, { label: "cold feet about the race", bucket: "Means More" }, { label: "handed her the baton", bucket: "Means the Words" }, { label: "coach was in a pickle", bucket: "Means More" }], coachWrong: "Picture that line exactly as it says. If you can see it really happening, it means the words. If you cannot, it means more." },
    },
    {
      id: "apply-choose-under-the-weather",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does under the weather mean here?",
      fx: {"text":"Soren had woken up **under the weather**","effect":"glow"},
      narration: { audio: A("apply-choose-under-the-weather"), script: "Page two says Soren had woken up under the weather and could not run his part of the relay. Picture it. A boy standing underneath a rain cloud. Weather is everywhere, so nobody can stand under it, and the words mean more. Find the meaning from the sentence. Four plain versions are on your screen. Tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "feeling-too-sick-to-run", label: "feeling too sick to run" }, { id: "standing-out-in-the-rain", label: "standing out in the rain" }, { id: "hiding-from-a-big-storm", label: "hiding from a big storm" }, { id: "sleeping-late-on-purpose", label: "sleeping late on purpose" }], correctId: "feeling-too-sick-to-run", coachWrong: "The sentence says he could not run. Which plain version explains why a boy who woke up that way stays home?" },
    },
    {
      id: "apply-choose-which-words-settle-it",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words settle what under the weather means?",
      narration: { audio: A("apply-choose-which-words-settle-it"), script: "You picked the plain version. Now show the words that settled it. Four groups of words from page two are on your screen, and every one of them is really on the page. Only one of them tells you what was wrong with Soren. Tap that one." },
      interaction: { type: "choose", options: [{ id: "could-not-run-his-part", label: "could not run his part" }, { id: "coach-perry-was-in-a-pickle", label: "coach perry was in a pickle" }, { id: "looking-straight-at-elodie", label: "looking straight at elodie" }, { id: "in-front-of-a-crowd", label: "in front of a crowd" }], correctId: "could-not-run-his-part", coachWrong: "Those words are on page two, but they do not tell what was wrong with Soren. Find the words about what he could not do." },
    },
    {
      id: "apply-choose-which-saying-fits",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which saying fits the sentence?",
      fx: {"text":"Dad's back hurt, so he asked us to **blank** with the groceries.","effect":"typewriter"},
      narration: { audio: A("apply-choose-which-saying-fits"), script: "Now use a saying yourself. Here is a new sentence with a hole in it. Dad's back hurt, so he asked us to, blank, with the groceries. Four sayings are on your screen. Picture the plain meaning of each one, and tap the saying that fits the hole." },
      interaction: { type: "choose", options: [{ id: "lend-a-hand", label: "lend a hand" }, { id: "hit-the-hay", label: "hit the hay" }, { id: "spill-the-beans", label: "spill the beans" }, { id: "hold-your-horses", label: "hold your horses" }], correctId: "lend-a-hand", coachWrong: "Think about what Dad needs from you when his back hurts and the bags are heavy. Which saying asks for that?" },
    },
    {
      id: "apply-speak-read-that-night",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: When the relay was over, Coach Perry handed out the caps, and Elodie was over the moon. That night everybody at the house hit the hay early, and a blue cap hung on her bedpost.",
      narration: { audio: A("apply-speak-read-that-night"), script: "The story ends after the race, and these two sentences are yours. Read them out loud, clearly and with feeling, and notice the two sayings hiding inside." },
      interaction: { type: "speak", text: "When the relay was over Coach Perry handed out the caps and Elodie was over the moon That night everybody at the house hit the hay early and a blue cap hung on her bedpost" },
    },
    {
      id: "apply-choose-hit-the-hay-fits",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which saying fits the sentence?",
      narration: { audio: A("apply-choose-hit-the-hay-fits"), script: "One more hole to fill. It was past nine, and Idris could not stop yawning, so Mom said it was time to, blank. Four sayings are on your screen. Picture each plain meaning, and tap the saying that fits." },
      interaction: { type: "choose", options: [{ id: "hit-the-hay", label: "hit the hay" }, { id: "hold-your-horses", label: "hold your horses" }, { id: "lend-a-hand", label: "lend a hand" }, { id: "spill-the-beans", label: "spill the beans" }], correctId: "hit-the-hay", coachWrong: "It is late, and Idris cannot stop yawning. Which saying fits what Mom wants a sleepy boy to do next?" },
    },
    {
      id: "challenge-speak-in-a-pickle",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Use in a pickle in a sentence of your own, the saying way.",
      narration: { audio: A("challenge-speak-in-a-pickle"), script: "Last one, out loud, and this time the sentence is yours. Coach Perry was in a pickle when Soren stayed home. Now think of a time somebody was in a pickle, a real problem with no easy way out, and it does not have to be about running. Tap the mic and say one whole sentence that uses in a pickle the way the story did." },
      interaction: { type: "speak", text: "pickle pickles trouble problem problems stuck forgot forgotten lost late missing broke broken mess jam fix help worried homework bus keys" },
    },
    {
      id: "celebrate-both-ways",
      purpose: "celebrate",
      gate: "none",
      prompt: "Picture it, then say it plain.",
      fx: {"text":"**Picture** it, then say it **plain**","effect":"fireworks"},
      narration: { audio: A("celebrate-both-ways"), script: "Today you learned that a saying is a group of words people share, and that the same words can do two jobs. Took the porch steps, real feet. Took steps to calm down, a saying. You pictured each one, noticed when the picture could not be true, found the meaning in the sentence, and said it plain. Then you used sayings yourself. From now on, when you hear one at home or at school, you will know exactly what it means." },
    },
  ],
};
