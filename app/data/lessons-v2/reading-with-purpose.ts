import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./reading-with-purpose-timings.json";

// Reading with Purpose (RF.1.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=reading-with-purpose

const A = (id: string) => `/audio/lessons-v2/reading-with-purpose/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/reading-with-purpose/${w.toLowerCase()}.png`;

export const readingWithPurposeImages: Record<string, string | { subject: string; ref?: string }> = {
  "wren-grandpa": "A smiling cartoon girl with short dark hair in a teal shirt walking on a dirt path through a sunny green field with her gray-haired grandpa in a straw hat and tan vest, the girl carries a small green net and the grandpa carries a silver pail, no pond anywhere, no text anywhere",
  "wren-pond": { subject: "The same smiling cartoon girl with short dark hair in a teal shirt dipping her small green net into a calm blue pond with cattails at the edge while her gray-haired grandpa in a straw hat and tan vest watches beside her holding the silver pail, no frog anywhere, no text anywhere", ref: "wren-grandpa" },
  "wren-frog-pail": { subject: "The same smiling cartoon girl with short dark hair in a teal shirt grinning down into the silver pail where one fat green frog sits, her gray-haired grandpa in a straw hat and tan vest smiling behind her, calm blue pond and cattails in the background, no text anywhere", ref: "wren-pond" }
};

export const readingWithPurpose: LessonDef = {
  id: "reading-with-purpose",
  title: "Reading with Purpose",
  grade: "1st Grade",
  standard: "RF.1.4a",
  archetype: "fluency",
  objective: "I can set a purpose before reading, read to answer it, and check that it makes sense.",
  concepts: ["purpose","understanding","asking questions","checking sense"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole story with a purpose! Before each page you asked a question, you read to find the answer, and you checked that it made sense. Ask, read, answer, check. Do that every time you read!",
    "title": "You Read with Purpose!",
    "body": "You set a purpose before each page, read to answer it, and checked that the story made sense."
  },
  scenes: [
    {
      id: "hook-meet-wren",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Wren and her grandpa.",
      image: IMG("wren-grandpa"),
      narration: { audio: A("hook-meet-wren"), script: "Hello, reader! Today you get to read a story about a girl named Wren and her grandpa. Strong readers read with a purpose. That means before you read, you ask a question you want to answer. Then you read to find the answer, and you check that it makes sense. Let's see how it works." },
    },
    {
      id: "model-the-loop",
      purpose: "model",
      gate: "none",
      prompt: "Watch me read with a purpose.",
      fx: {"text":"Ask. **Read**. Answer. Check.","effect":"pop-words"},
      narration: { audio: A("model-the-loop"), script: "Watch me read one little page with a purpose. First I ask a question: what pet does Max have? That is my purpose. Now I read my page. Max has a soft black cat. Now I answer my question. Max has a cat! Last, I check that it makes sense. A cat is a pet, so yes, it makes sense. Ask, read, answer, check. Now it is your turn with Wren's story." },
    },
    {
      id: "guided-pick-purpose-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question should we read page one to answer?",
      narration: { audio: A("guided-pick-purpose-one"), script: "Here comes page one of Wren's story. Before we read, we set a purpose. A purpose is a question the story can answer. Read each question, then tap the one we should read page one to answer." },
      interaction: { type: "choose", options: [{ id: "where-does-wren-go", label: "Where does Wren go?" }, { id: "what-is-for-lunch", label: "What is for lunch today?" }, { id: "what-color-is-my-rug", label: "What color is my rug?" }], correctId: "where-does-wren-go", coachWrong: "A purpose is a question the story can answer. This story is about Wren. Which question asks about her?" },
    },
    {
      id: "guided-read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one: Wren and Grandpa take the path to the pond. They bring a net and a pail.",
      image: IMG("wren-grandpa"),
      narration: { audio: A("guided-read-page-one"), script: "You set your purpose: where does Wren go? Now read page one out loud and find the answer." },
      interaction: { type: "speak", text: "Wren and Grandpa take the path to the pond They bring a net and a pail" },
    },
    {
      id: "guided-check-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where do Wren and Grandpa go?",
      narration: { audio: A("guided-check-page-one"), script: "You read page one. Now answer your purpose question. Where do Wren and Grandpa go? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "to-the-pond", label: "to the pond" }, { id: "to-the-shop", label: "to the shop" }, { id: "to-the-park", label: "to the park" }], correctId: "to-the-pond", coachWrong: "Read page one again. The path takes them to one place. Which place does the page name?" },
    },
    {
      id: "apply-pick-purpose-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which question should we read page two to answer?",
      narration: { audio: A("apply-pick-purpose-two"), script: "Page two is next. We already answered our first question, so a strong reader asks a new one. Read each question, then tap the question we still need the story to answer." },
      interaction: { type: "choose", options: [{ id: "what-does-wren-scoop", label: "What does Wren scoop up?" }, { id: "where-does-wren-go-again", label: "Where does Wren go?" }, { id: "what-game-do-i-like", label: "What game do I like best?" }], correctId: "what-does-wren-scoop", coachWrong: "One question is already answered, and one is not about the story at all. Pick the new question the story can still answer." },
    },
    {
      id: "apply-read-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two: Wren scoops up a big green frog. The frog leaps from the net with a splash!",
      image: IMG("wren-pond"),
      narration: { audio: A("apply-read-page-two"), script: "Your purpose is set: what does Wren scoop up? Read page two out loud and find out." },
      interaction: { type: "speak", text: "Wren scoops up a big green frog The frog leaps from the net with a splash" },
    },
    {
      id: "apply-check-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does Wren scoop up in her net?",
      narration: { audio: A("apply-check-page-two"), script: "Answer your purpose question. What does Wren scoop up in her net? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-big-green-frog", label: "a big green frog" }, { id: "a-big-blue-fish", label: "a big blue fish" }, { id: "a-wet-gray-rock", label: "a wet gray rock" }], correctId: "a-big-green-frog", coachWrong: "Read page two again. What leaps back out with a splash? That is the thing she scooped." },
    },
    {
      id: "challenge-read-page-three",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read page three: Wren waits, then she scoops one more time. Now a fat green frog sits in her pail!",
      image: IMG("wren-frog-pail"),
      narration: { audio: A("challenge-read-page-three"), script: "Last page! The frog leaped out, so Wren does not have it yet. This time, set the purpose with me. Let's read to find out how Wren finally gets the frog. Read page three out loud." },
      interaction: { type: "speak", text: "Wren waits then she scoops one more time Now a fat green frog sits in her pail" },
    },
    {
      id: "challenge-check-page-three",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How does Wren get the frog in the end?",
      narration: { audio: A("challenge-check-page-three"), script: "Time to answer the last purpose question. How does Wren get the frog in the end? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "she-waits-and-scoops-again", label: "She waits and scoops again." }, { id: "grandpa-grabs-it-for-her", label: "Grandpa grabs it for her." }, { id: "the-frog-hops-in-by-itself", label: "The frog hops in by itself." }], correctId: "she-waits-and-scoops-again", coachWrong: "Read page three again. What does Wren do right before the frog is in her pail?" },
    },
    {
      id: "challenge-make-sense",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which sentence tells what happened and makes sense?",
      narration: { audio: A("challenge-make-sense"), script: "One last step in the loop: check that what you read makes sense. Think about the whole story you just read. Read each sentence, then tap the one that tells what happened and makes sense." },
      interaction: { type: "choose", options: [{ id: "wren-catches-a-frog", label: "Wren catches a pond frog." }, { id: "wren-rides-a-bus", label: "Wren rides a bus to school." }, { id: "grandpa-naps-in-a-barn", label: "Grandpa naps in a red barn." }], correctId: "wren-catches-a-frog", coachWrong: "Think back to all three pages you read. Which sentence matches what really happened in Wren's story?" },
    },
    {
      id: "celebrate-purpose-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "You read with purpose!",
      fx: {"text":"Ask. Read. **Answer**. Check!","effect":"fireworks"},
      narration: { audio: A("celebrate-purpose-reader"), script: "You read Wren's whole story with a purpose! Before each page you asked a question, you read out loud to find the answer, and you checked that it all made sense. Ask, read, answer, check. Do that every time you read, and you will always understand your story." },
    },
  ],
};
