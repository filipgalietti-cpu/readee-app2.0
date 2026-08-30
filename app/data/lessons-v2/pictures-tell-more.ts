import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./pictures-tell-more-timings.json";

// Pictures Tell More (RL.2.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=pictures-tell-more
// G2: original 8-sentence story "The Berry Mystery" over 4 child-read pages.
// IMAGE-FORWARD by design: every page picture carries 1-2 facts the words omit
// (tail under the porch, paw prints, surprised face, moonlit visitor, baby raccoon).
// Keys prefixed quiz- are fresh stimuli for the quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/pictures-tell-more/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/pictures-tell-more/${w.toLowerCase()}.png`;

export const picturesTellMoreImages: Record<string, string | { subject: string; ref?: string }> = {
  "ben-rain": "A young boy with short brown hair in a yellow raincoat and a blue backpack walking along a sidewalk toward a small school building in the distance, heavy rain falling from dark grey clouds, the boy's face clearly glum with a downturned mouth, puddles on the pavement. No letters, no words, no numbers, no writing anywhere.",
  "page-1": "A storybook scene at golden sunset: a young boy with curly black hair in a striped orange t-shirt placing a small blue bowl full of blueberries on the wooden rail of a back porch, his face happy and excited, and low down at the shadowy gap under the porch steps a single bushy grey-and-black striped animal tail pokes out, the animal itself completely hidden under the porch, green backyard with an old oak tree, no other animals visible. No letters, no words, no numbers, no writing anywhere.",
  "page-2": { subject: "The same young boy with curly black hair in a striped orange t-shirt standing on the same back porch at dusk with a very surprised face, eyebrows high and mouth open in an O shape, hands on his cheeks, looking at the same small blue bowl now tipped over on its side on the porch rail completely empty, a trail of small dark hand-shaped animal paw prints across the wooden porch boards below the rail, darkening blue evening sky, no animals visible anywhere", ref: "page-1" },
  "page-3": { subject: "The same young boy with curly black hair in a striped orange t-shirt standing in the dark backyard at night holding up a glowing yellow lantern, a big full moon in the starry sky, and up on a low branch of the old oak tree a chubby raccoon with a black mask and striped tail caught in the lantern light, the raccoon's paws and snout stained purple with berry juice, no bowl in the picture", ref: "page-2" },
  "page-4": { subject: "The same young boy with curly black hair in a striped orange t-shirt grinning happily on the back porch at night as he watches the same chubby raccoon with a black mask and striped tail eating blueberries from a wide dish on the porch floor, and right beside the big raccoon a tiny fluffy baby raccoon also munching a blueberry, fireflies glowing in the dark yard, big full moon above", ref: "page-3" },
  "quiz-rain-play": "A little girl with brown pigtails in a green raincoat and red rubber boots joyfully jumping into a big puddle with a huge smile, rain falling from grey clouds, splash drops flying around her boots. No letters, no words, no numbers, no writing anywhere.",
  "quiz-pet-fish": "A young boy with blond hair kneeling beside a small table, sprinkling food flakes from his fingers into a round glass fishbowl where one bright orange goldfish swims, cozy bedroom background. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gift-joy": "A young boy with curly red hair laughing with pure delight, arms thrown up in the air, eyes shut with joy, standing over an open gift box with the lid tossed aside and a shiny toy robot peeking out, colorful streamers around the room. No letters, no words, no numbers, no writing anywhere.",
  "quiz-bike-helmet": "A little girl with a black ponytail riding a purple bicycle on a park path, clearly wearing a bright red safety helmet strapped under her chin, trees and a sunny sky behind her. No letters, no words, no numbers, no writing anywhere.",
  "quiz-beach-bag": "A young girl with wavy brown hair happily packing a big straw beach bag on her bed: a striped beach towel, a yellow plastic sand bucket with a small shovel, a bottle of sunscreen, and a wide sun hat laid out beside the bag, bedroom with a window. No letters, no words, no numbers, no writing anywhere.",
  "quiz-stage-fright": "A young boy with straight black hair standing alone on a wooden theater stage in a single spotlight, gripping his hands together tightly in front of his chest, eyes very wide and eyebrows raised high in a clearly nervous worried face, knees slightly knocked together, dark red curtain behind him. No letters, no words, no numbers, no writing anywhere.",
  "quiz-messy-kitchen": "A kitchen in happy chaos: white flour spilled across the floor and counter, a mixing bowl tipped on its side, a wooden spoon dripping batter, and in the middle of the table a lopsided homemade cake with wobbly pink frosting, two young children with flour smudged on their cheeks grinning proudly beside it. No letters, no words, no numbers, no writing anywhere."
};

export const picturesTellMore: LessonDef = {
  id: "pictures-tell-more",
  title: "Pictures Tell More",
  grade: "2nd Grade",
  standard: "RL.2.7",
  archetype: "story-elements",
  objective: "I can use the words and the pictures together to understand a story.",
  concepts: ["words and pictures work together","pictures show feelings","pictures show setting","pictures show plot clues","which teammate told you","retell with the pictures"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Berry Mystery with two teammates helping you. The words told you what happened, and the pictures told you even more: the tail under the porch, the paw prints, Theo's surprised face, and the little visitor at the end. Whenever you read a story, use both teammates. The words tell some of it. The pictures tell more.",
    "title": "You Used Both Teammates!",
    "body": "You used the words and the pictures together to solve The Berry Mystery."
  },
  scenes: [
    {
      id: "hook-two-teammates",
      purpose: "hook",
      gate: "none",
      prompt: "Every story page has two teammates.",
      fx: {"text":"The **words** tell some. The **pictures** tell more.","effect":"pop-words"},
      narration: { audio: A("hook-two-teammates"), script: "Hello, reader! Every story page has two teammates working together. The words are one teammate: they tell you what happens. The picture is the other teammate: it shows you things the words never say, like how a character feels, what the place looks like, or a secret clue. Today you will read a story called The Berry Mystery, and you will need both teammates to solve it." },
    },
    {
      id: "model-picture-tells-more",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use both teammates.",
      image: IMG("ben-rain"),
      narration: { audio: A("model-picture-tells-more"), script: "Watch me first. The words of a page say: Ben walked to school. That is all the words tell me. I do not know what the day was like, and I do not know how Ben felt. Now I ask the other teammate. The picture shows rain pouring down, and it shows Ben's glum face. The words never said any of that. The picture told me more. That is the whole trick: read the words, then look for what the picture adds." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: On Friday night, Theo set a bowl of blueberries on the porch rail. Then he ran inside to find his kite string.",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Time for The Berry Mystery. Page one is all yours. Read it out loud, and keep one eye on the picture while you read." },
      interaction: { type: "speak", text: "On Friday night Theo set a bowl of blueberries on the porch rail Then he ran inside to find his kite string" },
    },
    {
      id: "check-picture-secret",
      purpose: "guided",
      gate: "interaction",
      prompt: "What secret did the picture tell you?",
      image: IMG("page-1"),
      narration: { audio: A("check-picture-secret"), script: "Nice reading. The words told you about the berries and the kite string. But the picture is hiding a secret the words never said. Look very closely at the bottom of the picture, near the porch steps. What did the picture tell you? Tap it." },
      interaction: { type: "choose", options: [{ id: "tail-poked-from-porch", label: "a tail poked from the porch" }, { id: "kite-stuck-in-oak", label: "a kite stuck in the oak" }, { id: "rain-clouds-in-sky", label: "rain clouds in the sky" }, { id: "hole-in-porch-rail", label: "a hole in the porch rail" }], correctId: "tail-poked-from-porch", coachWrong: "Look under the porch steps in the picture, down in the shadows. Something is poking out that the words never mentioned." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: When Theo came back out, the bowl was flipped on its side. Every single blueberry was gone.",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Someone was hiding under that porch. Page two is yours too. Read it out loud." },
      interaction: { type: "speak", text: "When Theo came back out the bowl was flipped on its side Every single blueberry was gone" },
    },
    {
      id: "check-theo-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "How did Theo feel? Only the picture knows.",
      image: IMG("page-2"),
      narration: { audio: A("check-theo-feeling"), script: "The words told you the berries were gone, but they never said one word about Theo's feelings. Ask the other teammate. Look at Theo's face in the picture. How did he feel? Tap the feeling." },
      interaction: { type: "choose", options: [{ id: "surprised", label: "surprised" }, { id: "sleepy", label: "sleepy" }, { id: "proud", label: "proud" }, { id: "bored", label: "bored" }], correctId: "surprised", coachWrong: "Look at Theo's eyebrows and his wide open mouth in the picture. Which feeling makes a face like that?" },
    },
    {
      id: "check-which-teammate",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which teammate told you how Theo felt?",
      image: IMG("page-2"),
      narration: { audio: A("check-which-teammate"), script: "You just learned that Theo felt surprised. Now think like a reader. Where did that clue come from? Did you read it in the words of page two, or did you see it somewhere? Tap the teammate that told you." },
      interaction: { type: "choose", options: [{ id: "the-picture", label: "the picture" }, { id: "the-words", label: "the words" }, { id: "both-teammates", label: "both teammates" }, { id: "neither-one", label: "neither one" }], correctId: "the-picture", coachWrong: "Say page two in your head: the bowl was flipped, the berries were gone. Did those words name a feeling? Now think about where you saw his face." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three: Theo raised his lantern and looked out at the dark yard. Then he heard a rustle near the old oak.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Who took the berries? The mystery grows. Page three is yours. Read it out loud." },
      interaction: { type: "speak", text: "Theo raised his lantern and looked out at the dark yard Then he heard a rustle near the old oak" },
    },
    {
      id: "check-picture-showed",
      purpose: "apply",
      gate: "interaction",
      prompt: "The words stop at the rustle. What did the picture show?",
      image: IMG("page-3"),
      narration: { audio: A("check-picture-showed"), script: "Here is something sneaky. The words stop right at the rustle. They never say what made it. But the picture solves the mystery for you. Look up in the old oak. What did the picture show? Tap it." },
      interaction: { type: "choose", options: [{ id: "raccoon-with-berry-paws", label: "a raccoon with berry paws" }, { id: "owl-with-yellow-eyes", label: "an owl with yellow eyes" }, { id: "cat-up-on-a-branch", label: "a cat up on a branch" }, { id: "kite-caught-in-leaves", label: "a kite caught in the leaves" }], correctId: "raccoon-with-berry-paws", coachWrong: "Look at the low branch in the lantern light. Look at the animal's paws and nose. What color did the berries leave behind?" },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page four. Read along!",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "The mystery is solved, but the story has one more page. Here is page four. Read along with me." },
      interaction: { type: "read-along", text: "Theo grinned and scooped out more berries. His new night friend never missed a Friday after that.", audio: A("page-4-read-sentence") },
    },
    {
      id: "sort-words-or-picture",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: which teammate told us each fact?",
      narration: { audio: A("sort-words-or-picture"), script: "Sorting time. Here are facts from The Berry Mystery. Some of them you read in the words. Some of them you only saw in the pictures. Take each fact, ask yourself which teammate told you, and drag it to that bucket." },
      interaction: { type: "sort", buckets: ["Words","Pictures"], items: [{ label: "it was friday night", bucket: "Words" }, { label: "a tail under the porch", bucket: "Pictures" }, { label: "theo heard a rustle", bucket: "Words" }, { label: "theo looked surprised", bucket: "Pictures" }, { label: "theo went for kite string", bucket: "Words" }, { label: "the moon was up", bucket: "Pictures" }], coachWrong: "Ask yourself: could I read that fact on the page, or did I only see it? If you read it, it goes to Words. If you only saw it, it goes to Pictures." },
    },
    {
      id: "challenge-second-visitor",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Who else did the last picture show?",
      narration: { audio: A("challenge-second-visitor"), script: "Now for a real detective question. The words on page four said Theo's night friend never missed a Friday. But the last picture showed a second visitor eating berries, and the words never mentioned that visitor at all. Think back to that picture. Who else was there? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-baby-raccoon", label: "a baby raccoon" }, { id: "a-grey-squirrel", label: "a grey squirrel" }, { id: "a-red-fox", label: "a red fox" }, { id: "a-striped-skunk", label: "a striped skunk" }], correctId: "a-baby-raccoon", coachWrong: "Picture that last page in your mind. Right beside the big night friend, someone small and fluffy was munching a berry too." },
    },
    {
      id: "challenge-retell-pictures",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the story: put the pictures in order.",
      narration: { audio: A("challenge-retell-pictures"), script: "Strong readers can retell a story just from its pictures. Here are the four pictures from The Berry Mystery, all mixed up. Think about what happened first, what happened next, and how it ended. Tap the pictures in story order." },
      interaction: { type: "sequence", items: [{ id: "berries-on-the-rail", label: "berries on the rail", image: IMG("page-1") }, { id: "the-empty-bowl", label: "the empty bowl", image: IMG("page-2") }, { id: "the-rustle-in-the-oak", label: "the rustle in the oak", image: IMG("page-3") }, { id: "berries-with-a-friend", label: "berries with a friend", image: IMG("page-4") }], order: ["berries-on-the-rail","the-empty-bowl","the-rustle-in-the-oak","berries-with-a-friend"], coachWrong: "Start at the beginning of the story. Which picture shows the very first thing Theo did with the berries? Then follow the mystery step by step." },
    },
    {
      id: "challenge-say-the-clue",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: what clue did the picture leave on the porch boards?",
      narration: { audio: A("challenge-say-the-clue"), script: "Last job, detective. On page two, the words said the berries were gone, but they never said who took them. The picture left tiny clues all across the porch boards. Say what you saw there, out loud." },
      interaction: { type: "speak", text: "prints paw paws footprints tracks trail" },
    },
    {
      id: "celebrate-both-teammates",
      purpose: "celebrate",
      gate: "none",
      prompt: "You used both teammates!",
      fx: {"text":"**Words** tell some. **Pictures** tell more.","effect":"fireworks"},
      narration: { audio: A("celebrate-both-teammates"), script: "You solved The Berry Mystery, and you did it with two teammates. The words told you what happened: the berries, the flipped bowl, the rustle in the oak. The pictures told you more: the tail under the porch, the paw prints, Theo's surprised face, and the baby raccoon at the end. In every book you read, use both teammates. The words tell some. The pictures tell more." },
    },
  ],
};
