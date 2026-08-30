import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./pictures-that-teach-timings.json";

// Pictures That Teach (RI.2.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=pictures-that-teach
// G2: informational sibling of pictures-tell-more (RL.2.7). The image's job here is
// to CLARIFY: a diagram-like picture makes how-it-works words easy to understand.
// Anchor: 6-sentence info passage about a pulley (the CCSS example machine) over 3
// child-facing pages; teaching image = textless treehouse-pulley diagram (arrows
// carry the clarity, the TEXT carries the labels). Transfer = submarine cutaway.
// Keys prefixed quiz- are fresh stimuli for the quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/pictures-that-teach/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/pictures-that-teach/${w.toLowerCase()}.png`;

export const picturesThatTeachImages: Record<string, string | { subject: string; ref?: string }> = {
  "pulley-diagram": "A clear side-view teaching picture of a pulley: a tall wooden post standing beside a leafy green tree that holds a small wooden treehouse platform high up, a large round wooden pulley wheel mounted at the very top of the post with a thick tan rope running over the groove of the wheel so the rope hangs down on both sides, on the left side a young girl with a black ponytail wearing a bright red shirt stands on green grass gripping the rope and pulling it down with a big bold simple outlined arrow beside her hands pointing straight down, on the right side the rope ends in a metal hook holding a woven basket full of red apples hanging partway up the post with a big bold simple outlined arrow beside the basket pointing straight up, a few puffy white clouds in a plain blue sky. The two arrows are plain solid shapes only. No letters, no words, no numbers, no labels, no writing anywhere.",
  "pulley-lift": { subject: "The same side-view teaching picture moments later, with EXACTLY ONE woven basket in the entire picture: the same young girl with a black ponytail in a bright red shirt standing on the green grass holding the rope low after pulling it all the way down, and the one single woven basket full of red apples now raised all the way to the top of the tall wooden post, hanging from its metal hook right beside the small wooden treehouse platform, the space below the basket completely empty air all the way down to the grass, the thick tan rope still running over the large round wooden pulley wheel at the top of the post, one big bold simple outlined arrow beside the girl's hands pointing straight down and one big bold simple outlined arrow beside the raised basket pointing straight up, puffy white clouds in a plain blue sky. Only one basket exists in this picture, high up at the platform, and no basket near the ground. No letters, no words, no numbers, no labels, no writing anywhere", ref: "pulley-diagram" },
  "apple-orchard-art": "A pretty decorative painting of a sunny apple orchard: rows of leafy green apple trees full of shiny red apples, colorful wildflowers in the grass, two butterflies in the warm golden sunshine, soft rolling hills behind. No people, no machines, no ropes, no arrows. No letters, no words, no numbers, no writing anywhere.",
  "submarine-cutaway": "A teaching cutaway drawing of a yellow submarine seen from the side, deep under blue water, with a big rounded window-like section of its middle hull drawn open to show two large rounded metal tanks inside the body of the submarine, the tanks partly filled with blue water, small air bubbles rising near the tanks, a few small orange fish swimming past outside and gentle waves at the water surface far above. No letters, no words, no numbers, no labels, no writing anywhere.",
  "quiz-pumpkin-panels": "A teaching picture strip made of three small square panels side by side in one wide row, each panel with a thin dark outline and a plain pale background, shown left to right: the first panel shows one brown seed resting in dark soil, the middle panel shows a curling green vine with big leaves and one small green pumpkin, the last panel shows a big ripe orange pumpkin sitting on the vine. No letters, no words, no numbers, no writing anywhere.",
  "quiz-drawbridge": "A simple side-view teaching picture of a drawbridge over a wide blue river: the two halves of the grey road split apart and tilted up open in the middle, a small white sailboat with a tall mast sailing between the raised halves, one big bold simple curved outlined arrow beside one raised road half showing it swinging upward, plain blue sky. The arrow is a plain solid shape only. No letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-rain-path": "A simple teaching picture of where rain water goes: one fluffy grey cloud high over a green hill with blue rain drops falling from it, a winding blue stream running from the top of the hill down its side into a wide blue river at the bottom, three big bold simple outlined arrows showing the path: one pointing down from the cloud to the hilltop, one along the stream partway down the hill, and one where the stream meets the river. The arrows are plain solid shapes only. No letters, no words, no numbers, no writing anywhere.",
  "quiz-rainbow-art": "A pretty decorative painting of a bright colorful rainbow arching over a sunny flower meadow, sparkles in the air, a few white daisies and red poppies in the green grass, soft warm sunshine, no rain and no clouds except two tiny white puffs. No arrows. No letters, no words, no numbers, no writing anywhere.",
  "quiz-crane": "A simple side-view teaching picture of a tall yellow construction crane lifting one long grey steel beam high into the air beside a half-built plain brick wall, a thin cable running from the crane arm down to the middle of the beam, one big bold simple outlined arrow beside the beam pointing straight up, plain blue sky behind. The arrow is a plain solid shape only. No people. No letters, no words, no numbers, no signs, no flags, no writing anywhere.",
};

export const picturesThatTeach: LessonDef = {
  id: "pictures-that-teach",
  title: "Pictures That Teach",
  grade: "2nd Grade",
  standard: "RI.2.7",
  archetype: "inference",
  objective: "I can explain how a picture helps me understand the words in an information book.",
  concepts: ["teaching pictures make words clear","arrows show which way things move","diagrams show how machines work","cutaways show the inside","say how a picture helps"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you read about pulleys, and a teaching picture did its job. The words told you to pull one end down, and the arrows in the picture showed you exactly what that looks like. Whenever a book explains how something works, find its teaching picture and ask what it helps you see. Foggy words turn clear when the picture does its job.",
    "title": "You Used the Teaching Picture!",
    "body": "You explained how a picture makes the words of an information book clear."
  },
  scenes: [
    {
      id: "hook-foggy-words",
      purpose: "hook",
      gate: "none",
      prompt: "Try to see these words in your head.",
      fx: {"text":"Pull one end down. The other end **rises**.","effect":"pop-words"},
      narration: { audio: A("hook-foggy-words"), script: "Hello, reader! Today we are reading an information book about a machine. First, try something with only your ears. Listen: a pulley is a wheel with a rope over the top. Pull one end down, and the other end rises. Hmm. Can you see that in your head? Which end? Rising where? When words explain how something works, our brains can get foggy. Information books have a helper for exactly this problem." },
    },
    {
      id: "model-picture-clicks",
      purpose: "model",
      gate: "none",
      prompt: "Same words, plus a teaching picture.",
      image: IMG("pulley-diagram"),
      narration: { audio: A("model-picture-clicks"), script: "Here is the helper: a teaching picture. Watch me use it. The same words again: pull one end down, and the other end rises. This time I look while I listen. I see the rope resting in the groove of the wheel. I see Mae gripping her side of the rope. And look, right beside her hands there is an arrow, and it points straight down. That arrow tells me which way her rope is moving. Now the fog is gone. The words did not change. The picture made them clear." },
    },
    {
      id: "check-basket-arrow",
      purpose: "guided",
      gate: "interaction",
      prompt: "There is a second arrow, beside the basket. What does it tell you?",
      image: IMG("pulley-diagram"),
      narration: { audio: A("check-basket-arrow"), script: "Your turn to read an arrow. I used the arrow beside Mae's hands. But the picture holds a second arrow, right beside the basket of apples. Look at it closely. What is that arrow telling you? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "which-way-the-basket-moves", label: "which way the basket moves" }, { id: "how-heavy-the-basket-is", label: "how heavy the basket is" }, { id: "what-the-basket-is-made-of", label: "what the basket is made of" }, { id: "who-owns-the-basket", label: "who owns the basket" }], correctId: "which-way-the-basket-moves", coachWrong: "Look at the arrow beside the basket one more time. Think about what an arrow like that is trying to tell you about the basket." },
    },
    {
      id: "check-two-pictures",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which picture could TEACH how the pulley works?",
      narration: { audio: A("check-two-pictures"), script: "Information books pick their pictures for a job. Here are two pictures that could sit beside our pulley words. One is only nice to look at. One does a teaching job. Tap the picture that helps you see how the pulley works." },
      interaction: { type: "choose", options: [{ id: "the-pulley-picture", label: "the pulley picture", image: IMG("pulley-diagram") }, { id: "the-orchard-picture", label: "the orchard picture", image: IMG("apple-orchard-art") }], correctId: "the-pulley-picture", coachWrong: "Pretty is not the same as helpful. Which picture shows the wheel, the rope, and the arrows from our words?" },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: A pulley is a simple machine that makes lifting easier. People have used pulleys for thousands of years.",
      image: IMG("pulley-diagram"),
      narration: { audio: A("page-1-read"), script: "Now for our information book. Page one is all yours. Read it out loud, nice and smooth." },
      interaction: { type: "speak", text: "A pulley is a simple machine that makes lifting easier People have used pulleys for thousands of years" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: A pulley is a wheel with a rope over the top. Pull one end down, and the other end rises.",
      image: IMG("pulley-diagram"),
      narration: { audio: A("page-2-read"), script: "Page two holds the foggy words from before, but this time the teaching picture is right beside them. Keep one eye on the arrows while you read page two out loud." },
      interaction: { type: "speak", text: "A pulley is a wheel with a rope over the top Pull one end down and the other end rises" },
    },
    {
      id: "check-why-here",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why did the book put this picture beside page two?",
      image: IMG("pulley-diagram"),
      narration: { audio: A("check-why-here"), script: "Nice reading. Now think like an author for a moment. The book chose to put this exact picture right beside the words of page two. Authors always have a reason. Why is this picture here? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "to-show-how-the-pulley-works", label: "to show how the pulley works" }, { id: "to-make-the-page-look-pretty", label: "to make the page look pretty" }, { id: "to-show-how-apples-taste", label: "to show how apples taste" }, { id: "to-tell-where-mae-was-born", label: "to tell where mae was born" }], correctId: "to-show-how-the-pulley-works", coachWrong: "Think about the words on page two. They explain something tricky. What job is the picture doing for those words?" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("pulley-lift"),
      narration: { audio: A("page-3-read"), script: "Here is the last page of our book. The picture has changed a little. Read along with me." },
      interaction: { type: "read-along", text: "Mae's pulley lifts a basket of apples to her treehouse. With one easy pull, the heavy basket sails to the top.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-which-part",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which part of the picture makes the pulley words easy to see?",
      image: IMG("pulley-lift"),
      narration: { audio: A("check-which-part"), script: "The words told you to pull one end down, and the other end rises. This picture has many parts, but only one part makes those words easy to see. Which part is it? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-two-arrows", label: "the two arrows" }, { id: "the-puffy-clouds", label: "the puffy clouds" }, { id: "the-bright-red-shirt", label: "the bright red shirt" }, { id: "the-green-leaves", label: "the green leaves" }], correctId: "the-two-arrows", coachWrong: "Find each part in the picture. Then ask that part a question: do you show me anything about down or up?" },
    },
    {
      id: "sequence-pulley-steps",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Use the words and the picture: put the steps in order.",
      narration: { audio: A("sequence-pulley-steps"), script: "Time to prove the picture worked. Think about how the apples travel from the grass to the treehouse. Use the words and the picture together. Tap the steps in order, first to last." },
      interaction: { type: "sequence", items: [{ id: "pull-down", label: "mae pulls the rope down" }, { id: "slide-wheel", label: "the rope slides on the wheel" }, { id: "end-rises", label: "the other end rises" }, { id: "basket-top", label: "the basket reaches the top" }], order: ["pull-down","slide-wheel","end-rises","basket-top"], coachWrong: "Start with Mae's hands. What does she do first? Then follow the rope up and over, all the way to the basket." },
    },
    {
      id: "sort-words-or-picture",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: did the words explain it, or did the picture make it clear?",
      narration: { audio: A("sort-words-or-picture"), script: "Sorting time. Here are facts about our pulley book. The words explained some of them. The others you only know because the picture made them clear. Take each fact, ask where it came from, and drag it to that bucket." },
      interaction: { type: "sort", buckets: ["Words","Picture"], items: [{ label: "a pulley is a machine", bucket: "Words" }, { label: "the wheel hangs up high", bucket: "Picture" }, { label: "pulleys are very old", bucket: "Words" }, { label: "the basket hangs from a hook", bucket: "Picture" }, { label: "lifting gets easier", bucket: "Words" }, { label: "mae stands on the grass", bucket: "Picture" }], coachWrong: "Say the three pages in your head. If a fact was never in those words, only the picture could have taught it to you." },
    },
    {
      id: "challenge-cutaway",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does this drawing let you see?",
      image: IMG("submarine-cutaway"),
      narration: { audio: A("challenge-cutaway"), script: "Now for a page from a brand new book. Listen to its words: a submarine has special tanks in its body. The tanks fill with water to make the submarine sink. Tricky to picture, right? A plain photo could only show the outside of a submarine. So the book uses this special drawing instead. Look at it carefully. What does this drawing let you see? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-tanks-hidden-inside", label: "the tanks hidden inside" }, { id: "the-waves-on-the-water", label: "the waves on the water" }, { id: "the-color-of-the-metal", label: "the color of the metal" }, { id: "the-fish-swimming-past", label: "the fish swimming past" }], correctId: "the-tanks-hidden-inside", coachWrong: "Three of these parts could show up in any plain photo. Look at what this special drawing opens up for you." },
    },
    {
      id: "challenge-say-it",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: what did the pulley picture help you see?",
      image: IMG("pulley-diagram"),
      narration: { audio: A("challenge-say-it"), script: "Last one, reader. Think back to our pulley book. The words said pull one end down, and the other end rises. The teaching picture made those words clear. Tell me what the picture helped you see, out loud." },
      interaction: { type: "speak", text: "down rises lifts moves moving arrow arrows rope wheel basket pull pulls pulling" },
    },
    {
      id: "celebrate-clear-words",
      purpose: "celebrate",
      gate: "none",
      prompt: "You made foggy words clear!",
      fx: {"text":"**Teaching pictures** make words clear.","effect":"fireworks"},
      narration: { audio: A("celebrate-clear-words"), script: "What a reader you are. The pulley words started out foggy, and you cleared them up with the teaching picture. The arrows showed you down and up, the wheel showed you where the rope rides, and the cutaway even showed you the inside of a submarine. Whenever an information book explains how something works, find the teaching picture and ask what it helps you see. That is how strong readers make foggy words clear." },
    },
  ],
};
