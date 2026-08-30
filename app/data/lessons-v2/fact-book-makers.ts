import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-book-makers-timings.json";

// Fact Book Makers (RI.K.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-book-makers

const A = (id: string) => `/audio/lessons-v2/fact-book-makers/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/fact-book-makers/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-book-makers/${w.toLowerCase()}.png`;

export const factBookMakersImages: Record<string, string> = {
  "turtle-book": "a closed nonfiction picture book standing upright, its cover showing only a large friendly green turtle on a sandy beach, completely blank of any letters, words, or titles, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "author-desk": "a woman with curly dark hair sitting at a wooden desk, writing with a pen in an open notebook, a small green turtle figurine on the desk, no visible letters or words anywhere, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "photographer": "a man kneeling on a sandy beach holding a camera up to his eye, taking a picture of a green turtle a short distance away, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "turtle-photo": "a realistic photograph of a green sea turtle swimming in clear blue ocean water, printed as a photo with a thin white border like a printed photograph",
  "turtle-drawing": "a simple childlike crayon drawing of a green turtle on white paper, wobbly hand-drawn lines, like a young child drew it",
  "camera": "a single black camera with a round lens, sitting on a plain light blue background, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "pen": "a single blue ink pen, sitting on a plain light yellow background, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "words-page": "an open book with pages covered in soft wavy gray horizontal lines suggesting rows of writing, no real letters or readable words, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "sam-truck": "a young man holding a camera up to his eye, taking a picture of a big red pickup truck parked outside, the truck is a plain ordinary realistic-looking vehicle with normal headlights, no face, no eyes, not a cartoon character, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors",
  "rosa-desk": "a woman with a black ponytail sitting at a desk, writing on paper with one small ordinary pencil held in her hand, her other hand resting on the desk, a small toy truck sitting on the desk beside her, no visible letters or words anywhere, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors"
};

export const factBookMakers: LessonDef = {
  id: "fact-book-makers",
  title: "Fact Book Makers",
  grade: "Kindergarten",
  standard: "RI.K.6",
  archetype: "print-concepts",
  objective: "You will learn who makes a fact book: the author writes the true words, and the illustrator makes the pictures or photos!",
  concepts: ["author writes true facts","illustrator makes pictures","photos come from cameras","fact book"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Amazing work today! You learned that fact books have makers too. The author learns real facts and writes the true words. The illustrator makes the pictures, with drawings or with photos from a camera. Now you know who makes every fact book you read!",
    "title": "You Know the Fact Book Makers!",
    "body": "The author writes the true words. The illustrator makes the pictures and photos!"
  },
  scenes: [
    {
      id: "hook-turtle-book",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "A fact book about turtles!",
      narration: { audio: A("hook-turtle-book"), script: "Look at this book! It is a fact book. A fact book tells true things about our real world. This fact book is all about turtles. Listen to the true words inside." },
      interaction: { type: "read-along", text: "A turtle has a hard shell. A turtle hatches from an egg. A turtle can live a long time.", audio: A("hook-turtle-book-sentence") },
    },
    {
      id: "model-remember-makers",
      purpose: "model",
      gate: "none",
      prompt: "Fact books have makers too!",
      image: IMG("turtle-book"),
      narration: { audio: A("model-remember-makers"), script: "Do you remember who makes a storybook? An author writes the words, and an illustrator makes the pictures. Guess what! Fact books have an author and an illustrator too. But in a fact book, their jobs have a special twist. Let's find out." },
    },
    {
      id: "model-author-facts",
      purpose: "model",
      gate: "none",
      prompt: "The **author** writes true words.",
      image: IMG("author-desk"),
      narration: { audio: A("model-author-facts"), script: "This is the author of our turtle book. The author writes the words. Here is the twist. In a fact book, the words must be true! So first, the author learns real facts about turtles. Then the author writes those true facts down." },
    },
    {
      id: "model-illustrator-photos",
      purpose: "model",
      gate: "none",
      prompt: "The **illustrator** makes pictures and photos.",
      image: IMG("photographer"),
      narration: { audio: A("model-illustrator-photos"), script: "This is the illustrator of our turtle book. The illustrator makes the pictures. Here is another twist. In a fact book, the pictures can be drawings, or they can be photos! A photo is a picture made with a camera. Photos show real turtles, just as they look in the real world." },
    },
    {
      id: "guided-find-photo",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the **photo**.",
      narration: { audio: A("guided-find-photo"), script: "Let's look closely. One of these pictures is a photo of a real turtle. The other one is a drawing. Tap the photo." },
      interaction: { type: "choose", options: [{ id: "photo", label: "PHOTO", audio: W("photo"), image: IMG("turtle-photo") }, { id: "drawing", label: "DRAWING", audio: W("drawing"), image: IMG("turtle-drawing") }], correctId: "photo", coachWrong: "A drawing is made by hand with crayons or paint. A photo shows a real animal, just like real life. Look closely and tap again." },
    },
    {
      id: "guided-camera-tool",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which tool made this photo?",
      image: IMG("turtle-photo"),
      narration: { audio: A("guided-camera-tool"), script: "This photo of a real turtle is in our fact book. The illustrator used a special tool to make it. Which tool makes a photo? Tap it." },
      interaction: { type: "choose", options: [{ id: "camera", label: "CAMERA", audio: W("camera"), image: IMG("camera") }, { id: "pen", label: "PEN", audio: W("pen"), image: IMG("pen") }], correctId: "camera", coachWrong: "That tool is for writing words. Which tool takes photos? Tap it." },
    },
    {
      id: "apply-sort-makers",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the book maker things!",
      narration: { audio: A("apply-sort-makers"), script: "Time to sort! Here are some tools and book parts. Drag each one to the book maker who uses it or makes it." },
      interaction: { type: "sort", buckets: ["Author","Illustrator"], items: [{ label: "PEN", bucket: "Author", audio: W("pen"), image: IMG("pen") }, { label: "CAMERA", bucket: "Illustrator", audio: W("camera"), image: IMG("camera") }, { label: "WORDS", bucket: "Author", audio: W("words"), image: IMG("words-page") }, { label: "PHOTOS", bucket: "Illustrator", audio: W("photos"), image: IMG("turtle-photo") }], coachWrong: "Think about each one. Does it help make the words, or does it help make the pictures? Then find the right book maker." },
    },
    {
      id: "apply-say-maker",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the book maker's name!",
      image: IMG("author-desk"),
      narration: { audio: A("apply-say-maker"), script: "Now say it yourself! This book maker learned true turtle facts and wrote all the words in our book. What is this book maker called? Say it into the microphone!" },
      interaction: { type: "speak", text: "author authors writer" },
    },
    {
      id: "challenge-sam-photos",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which book maker is Sam?",
      image: IMG("sam-truck"),
      narration: { audio: A("challenge-sam-photos"), script: "Here is a brand new fact book about trucks. This is Sam. Sam used a camera and took photos of real trucks for the book. Which book maker is Sam? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator") }, { id: "author", label: "AUTHOR", audio: W("author") }], correctId: "illustrator", coachWrong: "Sam made the pictures for the book, not the words. Which book maker makes the pictures? Tap that one." },
    },
    {
      id: "challenge-rosa-words",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which book maker is Rosa?",
      image: IMG("rosa-desk"),
      narration: { audio: A("challenge-rosa-words"), script: "One more! This is Rosa. Rosa learned true facts about trucks. Then she wrote all the words in the truck book. Which book maker is Rosa? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "author", label: "AUTHOR", audio: W("author") }, { id: "illustrator", label: "ILLUSTRATOR", audio: W("illustrator") }], correctId: "author", coachWrong: "Rosa made the words for the book, not the pictures. Which book maker writes the words? Tap that one." },
    },
    {
      id: "celebrate-makers",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You know the fact book makers!",
      fx: {"text":"The **author** writes true words. The **illustrator** makes pictures and **photos**!","effect":"fireworks"},
      narration: { audio: A("celebrate-makers"), script: "You did it! Now you know the fact book makers. The author learns real facts and writes the true words. The illustrator makes the pictures, with drawings or with photos from a camera. Great work, book expert!" },
    },
  ],
};
