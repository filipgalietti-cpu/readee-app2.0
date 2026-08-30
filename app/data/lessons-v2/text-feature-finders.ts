import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./text-feature-finders-timings.json";

// Text Feature Finders (RI.1.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=text-feature-finders

const A = (id: string) => `/audio/lessons-v2/text-feature-finders/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/text-feature-finders/${w.toLowerCase()}.png`;

export const textFeatureFindersImages: Record<string, string> = {
  "bug-book": "An open book lying flat, its two pages showing a big friendly cartoon ladybug on the left page and a colorful butterfly on the right page, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters and no words anywhere in the picture.",
  "bee-parts": "One large friendly cartoon bee in the center of a plain light background, its two wings, six legs, striped body, and antennae all clearly visible, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters and no words anywhere in the picture."
};

export const textFeatureFinders: LessonDef = {
  id: "text-feature-finders",
  title: "Text Feature Finders",
  grade: "1st Grade",
  standard: "RI.1.5",
  archetype: "print-concepts",
  objective: "I can use text features to find facts fast.",
  concepts: ["headings tell what a part is about","the table of contents shows where parts start","bold words are important","labels name picture parts","the glossary explains hard words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a fact finder you are! You can use the Table of Contents, headings, bold words, labels, and the glossary. Every information book you open is ready to answer your questions, and now you know exactly where to look.",
    "title": "Fact-Finding Champion!",
    "body": "You can use the Table of Contents, headings, bold words, labels, and the glossary to find facts fast."
  },
  scenes: [
    {
      id: "hook-fact-finders",
      purpose: "hook",
      gate: "none",
      prompt: "Find facts fast with text features.",
      fx: {"text":"Text features help you **find facts fast**.","effect":"pop-words"},
      narration: { audio: A("hook-fact-finders"), script: "Hello, reader! Information books are full of true facts. Good news: books give you helpers called text features. They help you find the fact you want, fast. Today we will use five helpers: the Table of Contents, headings, bold words, labels, and the glossary." },
    },
    {
      id: "model-contents",
      purpose: "model",
      gate: "none",
      prompt: "The Table of Contents shows where parts start.",
      image: IMG("bug-book"),
      narration: { audio: A("model-contents"), script: "Our book today is all about bugs. The first helper sits at the front of the book. It is the Table of Contents. It lists each part of the book and the page where that part starts. You can find the part you want without flipping every page. Read this Table of Contents with me." },
      interaction: { type: "read-along", text: "Bug Homes, page 2. Bug Food, page 5. Bug Bodies, page 8.", audio: A("model-contents-sentence") },
    },
    {
      id: "guided-contents-choose",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which part tells what bugs eat?",
      fx: {"text":"You want to know what bugs **eat**.","effect":"glow"},
      narration: { audio: A("guided-contents-choose"), script: "Your turn! You want to know what bugs eat. Think about the parts listed in our Table of Contents. Read each card. Tap the part that would tell about eating." },
      interaction: { type: "choose", options: [{ id: "bug-homes", label: "Bug Homes" }, { id: "bug-food", label: "Bug Food" }, { id: "bug-bodies", label: "Bug Bodies" }], correctId: "bug-food", coachWrong: "Think about what each part name means. Which one is about what bugs eat? Try again!" },
    },
    {
      id: "model-headings",
      purpose: "model",
      gate: "none",
      prompt: "A heading tells what a part is about.",
      fx: {"text":"**Bug Homes**","effect":"underline"},
      narration: { audio: A("model-headings"), script: "Turn to page two. Look at the top of the page. Big words sit there: Bug Homes. That is a heading. A heading tells what that part is about. This part is about where bugs live. Many ants dig nests under the ground. A wasp builds a nest out of thin paper. The heading helped us find those facts fast." },
    },
    {
      id: "guided-heading-speak",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the heading out loud.",
      fx: {"text":"**Bug Food**","effect":"underline"},
      narration: { audio: A("guided-heading-speak"), script: "Now turn to page five. A new heading sits at the top of the page. Look at the underlined words. Tap the mic and read the heading out loud, nice and clear." },
      interaction: { type: "speak", text: "bug food" },
    },
    {
      id: "model-bold",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "Bold words are important words.",
      narration: { audio: A("model-bold"), script: "You read the heading Bug Food. This part has a bold word. Bold words are printed in thick, dark letters. Writers make a word bold when it is important or new. When you spot a bold word, slow down and notice it. Read this part with me." },
      interaction: { type: "read-along", text: "Ants eat seeds and crumbs. Butterflies sip **nectar** from flowers. Nectar is their favorite food.", audio: A("model-bold-sentence") },
    },
    {
      id: "model-labels",
      purpose: "model",
      gate: "none",
      prompt: "A label names a picture part.",
      image: IMG("bee-parts"),
      narration: { audio: A("model-labels"), script: "Pictures in information books get a helper too. A label is a small word printed right next to a picture. It names one part of the picture. Look at this bee. A label by the wings would say wings. A label by the legs would say legs. Labels name picture parts so you learn what you see." },
    },
    {
      id: "model-glossary",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "The glossary explains hard words.",
      narration: { audio: A("model-glossary"), script: "One more helper hides at the back of the book. It is the glossary. The glossary is a little word list. It explains the hard words from the book. Remember the bold word nectar? Let's look it up. Read the glossary with me." },
      interaction: { type: "read-along", text: "nectar: a sweet juice made inside flowers. nest: a home a bug builds.", audio: A("model-glossary-sentence") },
    },
    {
      id: "apply-sort-jobs",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Match each helper to its job.",
      narration: { audio: A("apply-sort-jobs"), script: "Now show what you know. Here are four text features. Some help you find parts of the book. Some help you with hard words. Read each card. Drag each helper to its job." },
      interaction: { type: "sort", buckets: ["Find Parts","Hard Words"], items: [{ label: "contents", bucket: "Find Parts" }, { label: "heading", bucket: "Find Parts" }, { label: "glossary", bucket: "Hard Words" }, { label: "bold word", bucket: "Hard Words" }], coachWrong: "Think about the helper's job. Does it help you find a part of the book, or does it help you know a hard word? Try again!" },
    },
    {
      id: "apply-glossary-choose",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which helper explains a hard word?",
      fx: {"text":"What does **nectar** mean?","effect":"glow"},
      narration: { audio: A("apply-glossary-choose"), script: "You are reading and you stop at a hard word. You forget what nectar means. One helper can explain it. Read each card. Tap the helper you would use." },
      interaction: { type: "choose", options: [{ id: "glossary", label: "glossary" }, { id: "table-of-contents", label: "Table of Contents" }, { id: "label", label: "label" }], correctId: "glossary", coachWrong: "You need the helper that explains hard words. Which helper is a little word list at the back of the book? Try again!" },
    },
    {
      id: "challenge-feature-speak",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the helper you would use.",
      fx: {"text":"Where does the **Bug Bodies** part start?","effect":"pop-words"},
      narration: { audio: A("challenge-feature-speak"), script: "Challenge time! You grab the bug book again. You want to find where the Bug Bodies part starts. Which helper shows where each part of the book starts? Tap the mic and say the helper's name." },
      interaction: { type: "speak", text: "contents table" },
    },
    {
      id: "celebrate-fact-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Text Feature Finder!",
      fx: {"text":"You can **find facts fast**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-finder"), script: "You did it! The Table of Contents shows where parts start. Headings tell what a part is about. Bold words are important. Labels name picture parts. And the glossary explains hard words. You can find facts fast in any information book. Happy reading!" },
    },
  ],
};
