import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./pictures-tell-more-timings.json";

// Pictures Tell More (RL.2.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=pictures-tell-more

const A = (id: string) => `/audio/lessons-v2/pictures-tell-more/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/pictures-tell-more/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/pictures-tell-more/${w.toLowerCase()}.png`;

export const picturesTellMoreImages: Record<string, string> = {
  "professor-hoot": "a friendly, wise owl wearing a small detective hat and holding a magnifying glass",
  "story clues": "a magnifying glass over an open storybook",
  "sleeping-bear": "a cute brown bear sleeping soundly on a patch of green moss",
  "forest-with-moss": "a lush green forest floor with soft moss patches and tall trees",
  "squirrels-and-sleeping-bear": "two small squirrels playing near a large, sleeping brown bear",
  "lily-ladybug-garden": "a cheerful red ladybug with black spots flying near a large yellow sunflower in a bright garden",
  "lily-ladybug-flying": "a red ladybug with black spots happily flying through the air",
  "professor-hoot-listening": "a friendly owl, Professor Hoot, with one ear tilted as if listening intently",
  "detective-badge": "a shiny gold detective badge with a magnifying glass icon"
};

export const picturesTellMore: LessonDef = {
  id: "pictures-tell-more",
  title: "Pictures Tell More",
  grade: "2nd Grade",
  standard: "RL.2.7",
  archetype: "story-elements",
  objective: "I can use words and pictures to understand characters, setting, and plot.",
  concepts: ["characters","setting","plot","illustrations","words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You've become an amazing Story Detective today! You learned how to use clues from both the words and the pictures in a story. This skill will help you understand every story you read even better!",
    "title": "Story Detective Master!",
    "body": "You've successfully solved all the story mysteries! Keep using your detective skills to find clues about characters, setting, and plot in every book you open."
  },
  scenes: [
    {
      id: "story-detective-intro",
      purpose: "hook",
      gate: "none",
      prompt: "Welcome, Story Detective!",
      image: IMG("professor-hoot"),
      fx: {"text":"**Story Detective**","effect":"jelly"},
      narration: { audio: A("story-detective-intro"), script: "Hello, junior Story Detective! I'm Professor Hoot, and I need your help. Stories are full of clues, and we'll learn how to find them. Listen closely to our first mystery." },
      interaction: { type: "listen", items: [{ label: "PROFESSOR HOOT", audio: W("Professor Hoot") }, { label: "STORY CLUES", audio: W("story clues"), image: IMG("story clues") }] },
    },
    {
      id: "the-sleepy-bear-part1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read along with Professor Hoot's first case!",
      narration: { audio: A("the-sleepy-bear-part1"), script: "Every good detective starts by gathering information. Read this passage carefully. It's about a sleepy bear!" },
      interaction: { type: "read-along", text: "Barnaby Bear loved to nap. He would find the softest patch of moss in the forest and curl up. His fur was thick and brown, perfect for chilly days. Sometimes, little squirrels would scamper over him, thinking he was a cozy hill. Barnaby would just snore softly, dreaming of honey.", audio: A("the-sleepy-bear-part1-sentence") },
    },
    {
      id: "model-barnaby-character",
      purpose: "model",
      gate: "interaction",
      prompt: "Watch me find clues about Barnaby Bear!",
      image: IMG("sleeping-bear"),
      fx: {"text":"**sleepy**","effect":"underline"},
      narration: { audio: A("model-barnaby-character"), script: "Great job reading! Now, let's look at how words and pictures help us. I'll show you how to find out about Barnaby. The words say he loved to nap, and the picture shows him sleeping soundly. This tells me he is a very sleepy character." },
      interaction: { type: "choose", options: [{ id: "he is very playful.", label: "HE IS VERY PLAYFUL.", audio: W("He is very playful.") }, { id: "he is very sleepy.", label: "HE IS VERY SLEEPY.", audio: W("He is very sleepy.") }, { id: "he is very grumpy.", label: "HE IS VERY GRUMPY.", audio: W("He is very grumpy.") }], correctId: "he is very sleepy.", coachWrong: "Remember, the words said he loved to nap, and the picture showed him sleeping. That tells us he is sleepy!" },
    },
    {
      id: "guided-barnaby-setting",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does Barnaby Bear like to nap?",
      image: IMG("forest-with-moss"),
      fx: {"text":"**setting**","effect":"underline"},
      narration: { audio: A("guided-barnaby-setting"), script: "You've got the first clue! Now, let's find out where Barnaby likes to nap. The words say 'softest patch of moss in the forest'. The picture shows many trees and green plants. What does that tell us about the setting?" },
      interaction: { type: "choose", options: [{ id: "in a big cave", label: "IN A BIG CAVE", audio: W("in a big cave") }, { id: "in a cozy house", label: "IN A COZY HOUSE", audio: W("in a cozy house") }, { id: "in a quiet forest", label: "IN A QUIET FOREST", audio: W("in a quiet forest") }], correctId: "in a quiet forest", coachWrong: "Look at both the words 'forest' and the picture showing trees. They both point to the forest!" },
    },
    {
      id: "guided-barnaby-plot-event",
      purpose: "guided",
      gate: "interaction",
      prompt: "What happens when squirrels scamper over Barnaby?",
      image: IMG("squirrels-and-sleeping-bear"),
      fx: {"text":"**plot**","effect":"underline"},
      narration: { audio: A("guided-barnaby-plot-event"), script: "Excellent work, Detective! Now for a plot clue. Remember when the squirrels scampered over Barnaby? The words say he would 'just snore softly'. The picture shows squirrels playing nearby. What does this tell us about the plot?" },
      interaction: { type: "choose", options: [{ id: "he wakes up mad.", label: "HE WAKES UP MAD.", audio: W("He wakes up mad.") }, { id: "he chases them away.", label: "HE CHASES THEM AWAY.", audio: W("He chases them away.") }, { id: "he keeps on sleeping.", label: "HE KEEPS ON SLEEPING.", audio: W("He keeps on sleeping.") }], correctId: "he keeps on sleeping.", coachWrong: "The words said he 'would just snore softly', not wake up. The picture shows him still asleep!" },
    },
    {
      id: "apply-new-story-part1",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read this new story and find more clues!",
      narration: { audio: A("apply-new-story-part1"), script: "You're becoming a master detective! Here's a new case. Read this passage carefully. We'll find clues about a new friend." },
      interaction: { type: "read-along", text: "Lily the ladybug loved to fly. Her bright red shell, dotted with seven black spots, shimmered in the sun. She lived in a garden filled with tall sunflowers and sweet-smelling roses. Every morning, Lily would visit each flower, sipping nectar and greeting the busy bees. She loved her sunny, blooming home.", audio: A("apply-new-story-part1-sentence") },
    },
    {
      id: "apply-lily-character-setting",
      purpose: "apply",
      gate: "interaction",
      prompt: "What can we learn about Lily and her home?",
      image: IMG("lily-ladybug-garden"),
      narration: { audio: A("apply-lily-character-setting"), script: "Fantastic reading! Now, use both the words and the picture. What kind of character is Lily, and where does she live? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "lily is grumpy and lives in a forest.", label: "LILY IS GRUMPY AND LIVES IN A FOREST.", audio: W("Lily is grumpy and lives in a forest.") }, { id: "lily is happy and lives in a dark cave.", label: "LILY IS HAPPY AND LIVES IN A DARK CAVE.", audio: W("Lily is happy and lives in a dark cave.") }, { id: "lily is cheerful and lives in a sunny garden.", label: "LILY IS CHEERFUL AND LIVES IN A SUNNY GARDEN.", audio: W("Lily is cheerful and lives in a sunny garden.") }], correctId: "lily is cheerful and lives in a sunny garden.", coachWrong: "The words tell us she loved to fly and loved her sunny home. The picture shows a bright garden. Combine those clues!" },
    },
    {
      id: "speak-lily-why",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tell me why you think Lily is cheerful and lives in a sunny garden.",
      image: IMG("professor-hoot-listening"),
      narration: { audio: A("speak-lily-why"), script: "Fantastic! Now, tell Professor Hoot, how did you know that? What words and pictures helped you find that answer?" },
      interaction: { type: "speak", text: "I knew Lily was cheerful because the words said she loved to fly, and the picture showed her smiling. She lived in a sunny garden because the words said 'garden' and 'sunny', and the picture showed flowers in the sun." },
    },
    {
      id: "challenge-lily-plot-inference",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is Lily probably doing right now?",
      image: IMG("lily-ladybug-flying"),
      narration: { audio: A("challenge-lily-plot-inference"), script: "You're almost a master detective! For your final mission, use all the clues from the words and the picture. What do you think Lily is doing at this very moment?" },
      interaction: { type: "choose", options: [{ id: "sleeping in a leaf", label: "SLEEPING IN A LEAF", audio: W("sleeping in a leaf") }, { id: "flying to a new flower", label: "FLYING TO A NEW FLOWER", audio: W("flying to a new flower") }, { id: "hiding from a bird", label: "HIDING FROM A BIRD", audio: W("hiding from a bird") }, { id: "eating a big meal", label: "EATING A BIG MEAL", audio: W("eating a big meal") }], correctId: "flying to a new flower", coachWrong: "Remember, the story said she loved to fly and visited each flower every morning to sip nectar!" },
    },
    {
      id: "celebrate-detective",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Story Detective!",
      image: IMG("detective-badge"),
      fx: {"text":"**Amazing work**","effect":"fireworks"},
      narration: { audio: A("celebrate-detective"), script: "Amazing work, Story Detective! You've learned how to use words and pictures together. Keep looking for clues in every story you read!" },
    },
  ],
};
