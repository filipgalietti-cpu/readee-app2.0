import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./paragraph-power-timings.json";

// Paragraph Power (RI.2.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=paragraph-power
// G2: original TRUE fact text "The Hungry Green Truck" (recycling trucks), 3 paragraphs x 3 sentences,
// whole-text topic vs per-paragraph focus discrimination.

const A = (id: string) => `/audio/lessons-v2/paragraph-power/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/paragraph-power/${w.toLowerCase()}.png`;

export const paragraphPowerImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A nonfiction book cover style illustration of one bright green recycling truck driving down a sunny neighborhood street, the truck has a boxy body and big black wheels, small houses and green recycling bins along the curb, plain round sun with no face, soft blue sky, realistic vehicle with no cartoon eyes or face on the truck or the sun or any object, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "truck-arm": { subject: "The same bright green recycling truck stopped at a curb, a strong gray mechanical arm reaching out from the truck's side and lifting a green recycling bin high in the air to tip it into the open top of the truck, plastic bottles and cans falling from the bin into the truck, plain sky with no sun face, realistic vehicle with no cartoon eyes or face on the truck or any object, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  "sorting-center": { subject: "The inside of a large bright recycling sorting center building, long gray conveyor belts carrying plastic bottles and blank paper sheets and metal cans, a big machine with a red magnet lifting metal cans off one belt, neat piles of sorted bottles and cans, plain industrial machines with no faces and no cartoon eyes anywhere, all paper and cardboard completely blank, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" }
};

export const paragraphPower: LessonDef = {
  id: "paragraph-power",
  title: "Paragraph Power",
  grade: "2nd Grade",
  standard: "RI.2.2",
  archetype: "inference",
  objective: "I can find the main topic of a whole text and the job of each of its paragraphs.",
  concepts: ["main topic of a whole text","focus of a paragraph","paragraphs have jobs","nonfiction text structure"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole fact text with three paragraphs, and you thought at two levels. You zoomed out and found the one big thing the whole text was about. Then you zoomed in and found the special job of every single paragraph. That is paragraph power. Big texts will never look scary again, because you know each paragraph is just doing its own small job.",
    "title": "You Found the Paragraph Power!",
    "body": "You found the main topic of a whole text and the job of each paragraph inside it. Zoom out for the topic, zoom in for the jobs."
  },
  scenes: [
    {
      id: "hook-two-levels",
      purpose: "hook",
      gate: "none",
      prompt: "Big texts are built from paragraphs.",
      image: IMG("cover"),
      fx: {"text":"One big topic. Each paragraph has a **job**.","effect":"glow"},
      narration: { audio: A("hook-two-levels"), script: "Hello, reader! Today you get a bigger kind of text. Not one paragraph. Three. Here is the secret of every big fact text. The whole text is about one big thing. But each paragraph inside it has its own smaller job. Good readers find both. Today you will read a true fact text called The Hungry Green Truck, and you will find the one big topic and the job of every paragraph." },
    },
    {
      id: "model-zoom-out-zoom-in",
      purpose: "model",
      gate: "none",
      prompt: "Watch me think at two levels.",
      fx: {"text":"Zoom **out** for the topic. Zoom **in** for the job.","effect":"pop-words"},
      narration: { audio: A("model-zoom-out-zoom-in"), script: "Watch me do it first with a tiny fact text about honeybees. Listen. Paragraph one. Honeybees live together in a hive. One queen bee leads thousands of workers. Paragraph two. Bees make honey from flower nectar. They store the honey in little wax cells. Now I zoom out. Both paragraphs kept talking about the same big thing, honeybees. So the whole text is mostly about honeybees. Now I zoom in. Paragraph one only talked about where bees live. That is its job. Paragraph two only talked about how bees make honey. That is its job. One big topic, and each paragraph does one job." },
    },
    {
      id: "read-p1",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read paragraph one: Recycling trucks are big, strong helpers in our towns. They pick up plastic bottles, paper, and metal cans. They carry old things away to be made into new things.",
      narration: { audio: A("read-p1"), script: "Time to read The Hungry Green Truck. It has three paragraphs, and each one is doing its own job. Paragraph one is yours. Read the whole paragraph out loud." },
      interaction: { type: "speak", text: "Recycling trucks are big strong helpers in our towns They pick up plastic bottles paper and metal cans They carry old things away to be made into new things" },
    },
    {
      id: "check-p1-focus",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is paragraph one mostly about?",
      narration: { audio: A("check-p1-focus"), script: "Nice reading. Now zoom in on just that paragraph. Paragraph one said, recycling trucks are big strong helpers in our towns. They pick up plastic bottles, paper, and metal cans. They carry old things away to be made into new things. All three sentences work on one same job. What is paragraph one mostly about? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "what-the-trucks-are-and-do", label: "what the trucks are and do" }, { id: "how-the-truck-packs-a-load", label: "how the truck packs a load" }, { id: "where-the-recycling-goes", label: "where the recycling goes" }, { id: "metal-cans", label: "metal cans" }], correctId: "what-the-trucks-are-and-do", coachWrong: "Careful, do not grab one tiny piece or a job from a different paragraph. Say all three sentences back to yourself. What one job are they all doing together?" },
    },
    {
      id: "read-p2",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read paragraph two: First, a strong metal arm reaches out and lifts the bin. The arm tips the bin, and everything falls inside the truck. Then a packer blade presses the load flat to make more room.",
      narration: { audio: A("read-p2"), script: "Paragraph two has a brand new job. Read paragraph two out loud, and think about what all three sentences are working on." },
      interaction: { type: "speak", text: "First a strong metal arm reaches out and lifts the bin The arm tips the bin and everything falls inside the truck Then a packer blade presses the load flat to make more room" },
    },
    {
      id: "check-p2-focus",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is paragraph two mostly about?",
      narration: { audio: A("check-p2-focus"), script: "Zoom in again. Paragraph two said, a strong metal arm reaches out and lifts the bin. The arm tips the bin, and everything falls inside. Then a packer blade presses the load flat to make more room. First, then, step by step. What is paragraph two mostly about? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "how-the-truck-does-its-work", label: "how the truck does its work" }, { id: "what-the-trucks-are", label: "what the trucks are" }, { id: "where-the-recycling-goes", label: "where the recycling goes" }, { id: "a-strong-metal-arm", label: "a strong metal arm" }], correctId: "how-the-truck-does-its-work", coachWrong: "The arm is only one piece of this paragraph. The arm reaches, the bin tips, the blade presses. Those are steps. What are all those steps showing you?" },
    },
    {
      id: "read-p3",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read paragraph three: When the truck is full, it drives to a sorting center. Machines and big magnets sort the load into piles. Old bottles and cans can then become brand new things.",
      narration: { audio: A("read-p3"), script: "One paragraph left, and it has its own job too. Read paragraph three out loud." },
      interaction: { type: "speak", text: "When the truck is full it drives to a sorting center Machines and big magnets sort the load into piles Old bottles and cans can then become brand new things" },
    },
    {
      id: "check-p3-focus",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is paragraph three mostly about?",
      narration: { audio: A("check-p3-focus"), script: "Zoom in one more time. Paragraph three said, when the truck is full, it drives to a sorting center. Machines and big magnets sort the load into piles. Old bottles and cans can then become brand new things. All three sentences follow the load after the truck picks it up. What is paragraph three mostly about? Tap the best answer." },
      interaction: { type: "choose", options: [{ id: "where-the-load-goes-next", label: "where the load goes next" }, { id: "what-the-trucks-are", label: "what the trucks are" }, { id: "how-the-arm-lifts-the-bin", label: "how the arm lifts the bin" }, { id: "big-magnets", label: "big magnets" }], correctId: "where-the-load-goes-next", coachWrong: "Magnets are only one small piece, and the arm lived in a different paragraph. This paragraph starts when the truck is full. Where does it take you after that?" },
    },
    {
      id: "check-whole-topic",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is the WHOLE text mostly about?",
      narration: { audio: A("check-whole-topic"), script: "You read all three paragraphs, and each one did its own job. Now zoom all the way out and think about the whole text at once. Every paragraph kept talking about the same one big thing. What is the whole text mostly about? Tap the idea that is big enough to cover all three paragraphs." },
      interaction: { type: "choose", options: [{ id: "recycling-trucks", label: "recycling trucks" }, { id: "how-the-trucks-work", label: "how the trucks work" }, { id: "where-the-load-goes", label: "where the load goes" }, { id: "the-strong-metal-arm", label: "the strong metal arm" }], correctId: "recycling-trucks", coachWrong: "That idea only covers one paragraph, or one small piece. The whole text needs an idea big enough to cover paragraph one, paragraph two, and paragraph three. Which choice covers them all?" },
    },
    {
      id: "sort-paragraph-jobs",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Match each paragraph to its job.",
      narration: { audio: A("sort-paragraph-jobs"), script: "Now show the whole map of the text. Here are the three paragraph jobs. Drag each job to the paragraph that does it." },
      interaction: { type: "sort", buckets: ["Paragraph 1","Paragraph 2","Paragraph 3"], items: [{ label: "what the trucks are and do", bucket: "Paragraph 1" }, { label: "how the truck does its work", bucket: "Paragraph 2" }, { label: "where the load goes next", bucket: "Paragraph 3" }], coachWrong: "Say each paragraph back to yourself in order. First the helpers and what they pick up. Then the arm and the blade. Then the sorting center. Now match each job to its paragraph." },
    },
    {
      id: "which-paragraph-arm",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where would you look to learn how the arm lifts the bin?",
      image: IMG("truck-arm"),
      narration: { audio: A("which-paragraph-arm"), script: "Paragraph jobs are like a map. They help you find facts fast, without reading the whole text again. Suppose you want to learn exactly how the metal arm lifts the bin. Which part of the text would you look in? Tap it." },
      interaction: { type: "choose", options: [{ id: "paragraph-two", label: "paragraph two" }, { id: "paragraph-one", label: "paragraph one" }, { id: "paragraph-three", label: "paragraph three" }, { id: "the-title", label: "the title" }], correctId: "paragraph-two", coachWrong: "Think about each paragraph's job. Which paragraph's job was showing the truck's steps? That is where arm facts live." },
    },
    {
      id: "which-paragraph-bottles",
      purpose: "challenge",
      gate: "interaction",
      prompt: "A friend asks: what happens to the bottles after the truck drives away?",
      narration: { audio: A("which-paragraph-bottles"), script: "One more time, use the map. A friend asks you, what happens to the bottles after the truck drives away? You do not need the whole text, just one paragraph. Which paragraph would you show your friend? Tap it." },
      interaction: { type: "choose", options: [{ id: "paragraph-three", label: "paragraph three" }, { id: "paragraph-one", label: "paragraph one" }, { id: "paragraph-two", label: "paragraph two" }, { id: "the-title", label: "the title" }], correctId: "paragraph-three", coachWrong: "Your friend is asking about what comes after the pick up. Which paragraph's job was following the load after the truck is full?" },
    },
    {
      id: "speak-explain-p3",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it out loud: what does paragraph three tell you about?",
      image: IMG("sorting-center"),
      narration: { audio: A("speak-explain-p3"), script: "Last job, and this one is out loud. Tell me in your own words, what does paragraph three tell you about? Start with, paragraph three tells." },
      interaction: { type: "speak", text: "sorting center sort sorts sorted magnets machines piles load goes new things bottles cans full drives where" },
    },
    {
      id: "celebrate-paragraph-power",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the paragraph power!",
      fx: {"text":"Zoom out. Zoom in. **Paragraph power!**","effect":"fireworks"},
      narration: { audio: A("celebrate-paragraph-power"), script: "You read a whole fact text with three paragraphs, and you thought at two levels. You zoomed out and found the one big thing the whole text was about. Then you zoomed in and found the special job of every single paragraph. That is paragraph power. Big texts will never look scary again, because you know each paragraph is just doing its own small job." },
    },
  ],
};
