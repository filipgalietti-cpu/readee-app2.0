import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./find-it-fast-timings.json";

// Find It Fast (RI.2.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=find-it-fast
// G2: know and USE text features to locate facts efficiently. ONE true fact book
// "All About Owls" shown feature by feature: table of contents (read-along, then
// a which-page use check), heading + bold word taught on page 2, caption taught
// with the head-turn picture, glossary read-along, which-tool-for-the-need check,
// jobs-to-tools sort as diagram work, production speak names the contents.
// Text features live in on-screen TEXT and narration only; images stay textless.
// All owl facts true: eyes face front and sit fixed (the owl turns its head,
// up to about three quarters around), sharp talons grab prey, soft fringed
// feathers make flight nearly silent, owls hunt at night and eat mice, owls
// cough up pellets of fur and bone.

const A = (id: string) => `/audio/lessons-v2/find-it-fast/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/find-it-fast/${w.toLowerCase()}.png`;

export const findItFastImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A nonfiction book cover style illustration of one brown owl with large round yellow eyes perched on a bare branch at dusk, deep blue evening sky behind, realistic natural bird with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "owl-talons": { subject: "A zoomed-in close-up of only the lower half of the same brown owl standing on a thick branch, the frame filled by its two yellow feet wrapped around the bark with long sharp curved dark talons clearly gripping the wood, feathered legs above, the owl's head and eyes are OUT of the frame, soft dusk light, realistic natural bird with no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  "owl-head-turn": { subject: "The same brown owl perched on a branch with its body facing away and its head turned back over its shoulder to look behind it, deep blue dusk sky, realistic natural bird with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere", ref: "cover" },
  // Quiz easier-band picture support (fresh stimuli, not lesson scenes):
  "puppy": "A small golden puppy sitting in green grass, gentle daylight, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "rabbit": "A brown rabbit sitting upright in a green meadow, gentle daylight, realistic natural animal with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "cardinal": "A bright red cardinal bird perched on a plain bare branch, soft daylight, realistic natural bird with no cartoon eyes and no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere",
  "fox": "An orange red fox seen from the side standing on all four legs in a green forest clearing, bushy tail behind it, gentle daylight, realistic natural animal posture like a wildlife photo, no smile and no clothing, friendly nonfiction illustration, no text or letters or numbers anywhere"
};

export const findItFast: LessonDef = {
  id: "find-it-fast",
  title: "Find It Fast",
  grade: "2nd Grade",
  standard: "RI.2.5",
  archetype: "print-concepts",
  objective: "I can use a fact book's tools to find the facts I need fast.",
  concepts: ["the table of contents shows where parts start","headings name what a part is about","bold words flag important words","captions give facts about pictures","the glossary tells word meanings"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You opened one true owl book and used every tool inside it. The contents pointed you to the right page. Headings named each part. A bold word flagged what matters, the caption handed you a fact, and the glossary told you what pellet means. You never flipped page after page. You went straight to the fact. That is how a reader finds it fast.",
    "title": "Fact-Finder!",
    "body": "You used the table of contents, headings, bold words, captions, and the glossary to find facts fast."
  },
  scenes: [
    {
      id: "hook-book-tools",
      purpose: "hook",
      gate: "none",
      prompt: "Fact books carry their own tools.",
      image: IMG("cover"),
      fx: {"text":"A fact book carries its own **tools**.","effect":"underline"},
      narration: { audio: A("hook-book-tools"), script: "Hello, reader! Today we open a true book called All About Owls. A fact book holds facts, and it also holds tools, built right into its pages, that help you find any fact fast. The table of contents, headings, bold words, captions, and the glossary are those tools. Today you will use every one." },
    },
    {
      id: "model-contents",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use the table of contents.",
      fx: {"text":"The contents points you **straight to the page**.","effect":"pop-words"},
      narration: { audio: A("model-contents"), script: "Watch me first, with a different book. My sea turtle book's table of contents says, Turtle Bodies, page 2. Turtle Food, page 6. Turtle Babies, page 10. I want to know what sea turtles eat. Food is my topic, so the contents points me to page 6, and I turn straight there. No flipping, no hunting. That is what the contents is for." },
    },
    {
      id: "read-owl-contents",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read the contents of All About Owls.",
      narration: { audio: A("read-owl-contents"), script: "Now open All About Owls. The table of contents sits at the front and lists each part of the book with the page where it starts. Read the contents with me." },
      interaction: { type: "read-along", text: "Owl Bodies, page 2. Silent Hunters, page 5. Owl Babies, page 8. Glossary, page 10.", audio: A("read-owl-contents-sentence") },
    },
    {
      id: "read-page-bodies",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page 2 with me.",
      image: IMG("owl-talons"),
      narration: { audio: A("read-page-bodies"), script: "Turn to page 2, the part called Owl Bodies. The big name at the top of the page is a heading. A heading names what its part is about. And one word on this page is printed dark and thick. That is a bold word. Bold is the author saying, this word matters. Read page 2 with me." },
      interaction: { type: "read-along", text: "Owl Bodies. An owl's big eyes face the front. Sharp claws called **talons** grab and hold its food. Soft feathers cover the owl from head to toe.", audio: A("read-page-bodies-sentence") },
    },
    {
      id: "check-heading-scan",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which heading names the part about owl chicks?",
      narration: { audio: A("check-heading-scan"), script: "Headings let you jump straight to the right part. This book's parts are Owl Bodies, Silent Hunters, Owl Babies, and Glossary. Here is your need. You want to know what owl chicks look like. Tap the heading you would scan for." },
      interaction: { type: "choose", options: [{ id: "owl-babies", label: "Owl Babies" }, { id: "owl-bodies", label: "Owl Bodies" }, { id: "silent-hunters", label: "Silent Hunters" }, { id: "glossary", label: "Glossary" }], correctId: "owl-babies", coachWrong: "A chick is a baby bird. Say your need again, then scan the part names. Which one fits that idea?" },
    },
    {
      id: "teach-caption",
      purpose: "apply",
      gate: "none",
      prompt: "A caption sits under a picture.",
      image: IMG("owl-head-turn"),
      fx: {"text":"An owl can turn its head **almost all the way around**.","effect":"pop-words"},
      narration: { audio: A("teach-caption"), script: "Page 2 also holds a picture, and under the picture sits one small sentence. That is a caption. A caption tells you what the picture shows, and it often adds a fact all by itself. This picture's caption says, an owl can turn its head almost all the way around. That fact is true, and the caption handed it to you." },
    },
    {
      id: "check-caption-fact",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which fact came from the caption?",
      narration: { audio: A("check-caption-fact"), script: "A caption is small, but it carries a real fact. Think about what this one taught you. Tap the fact that came from the caption." },
      interaction: { type: "choose", options: [{ id: "it-turns-its-head-far", label: "it turns its head far" }, { id: "it-hunts-in-the-noon-sun", label: "it hunts in the noon sun" }, { id: "it-moves-just-its-eyes", label: "it moves just its eyes" }, { id: "it-builds-a-mud-nest", label: "it builds a mud nest" }], correctId: "it-turns-its-head-far", coachWrong: "Play the caption back in your mind, the little sentence under the picture. Which fact did it actually say?" },
    },
    {
      id: "check-contents-use",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which page do you turn to?",
      narration: { audio: A("check-contents-use"), script: "Now use the contents like a fast reader. It said, Owl Bodies, page 2. Silent Hunters, page 5. Owl Babies, page 8. Glossary, page 10. Here is your need. You want facts about how owls hunt. Tap the page you would turn to." },
      interaction: { type: "choose", options: [{ id: "page-5", label: "page 5" }, { id: "page-2", label: "page 2" }, { id: "page-8", label: "page 8" }, { id: "page-10", label: "page 10" }], correctId: "page-5", coachWrong: "Hunting is your topic. Scan the part names again. Which name sounds like hunting? Its page number is your answer." },
    },
    {
      id: "read-page-hunters",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page 5: Silent Hunters. An owl hunts at night. Its soft feathers make its flight almost silent. It swoops down and grabs a mouse.",
      narration: { audio: A("read-page-hunters"), script: "The contents pointed you to page 5, and here it is. This page is yours to read. Tap the mic and read page 5 out loud." },
      interaction: { type: "speak", text: "Silent Hunters An owl hunts at night Its soft feathers make its flight almost silent It swoops down and grabs a mouse" },
    },
    {
      id: "read-glossary",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the glossary with me.",
      narration: { audio: A("read-glossary"), script: "One tool waits at the back of the book. The glossary is the book's own word list. It gathers the important bold words and tells exactly what each one means. Read the glossary with me." },
      interaction: { type: "read-along", text: "Glossary. talons: the sharp claws of a bird. pellet: a ball of fur and bones an owl spits up.", audio: A("read-glossary-sentence") },
    },
    {
      id: "check-glossary-use",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which tool tells what pellet means?",
      narration: { audio: A("check-glossary-use"), script: "Now you need that tool. On page 6 you hit the bold word pellet, and you want its exact meaning, fast. Tap the tool made for that job." },
      interaction: { type: "choose", options: [{ id: "the-glossary", label: "the glossary" }, { id: "the-table-of-contents", label: "the table of contents" }, { id: "a-caption", label: "a caption" }, { id: "a-heading", label: "a heading" }], correctId: "the-glossary", coachWrong: "You are not hunting a part or a picture. You are hunting what one word means. Which tool holds word meanings?" },
    },
    {
      id: "sort-tool-jobs",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Which tool does each job? Sort them.",
      narration: { audio: A("sort-tool-jobs"), script: "Two tools do the most finding work, the table of contents and the glossary. Here are six reader jobs. Read each job, think about which tool does it, and drag it to that tool." },
      interaction: { type: "sort", buckets: ["Table of Contents","Glossary"], items: [{ label: "find the hunting part", bucket: "Table of Contents" }, { label: "see where parts start", bucket: "Table of Contents" }, { label: "find the owl babies part", bucket: "Table of Contents" }, { label: "learn what pellet means", bucket: "Glossary" }, { label: "look up a bold word", bucket: "Glossary" }, { label: "find what talons means", bucket: "Glossary" }], coachWrong: "Read the job again. Is it hunting for a part of the book, or for what a word means? Drag it to the tool that does that job." },
    },
    {
      id: "speak-which-tool",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: which tool lists the parts?",
      narration: { audio: A("speak-which-tool"), script: "Last one, and it is out loud. You pick up a fox book and you want its fox den part, fast. One tool at the front of the book lists every part with its page. Say that tool's name. Tap the mic and say it." },
      interaction: { type: "speak", text: "contents table" },
    },
    {
      id: "celebrate-fact-finder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found it fast!",
      fx: {"text":"Contents. Headings. Captions. **Glossary!**","effect":"fireworks"},
      narration: { audio: A("celebrate-fact-finder"), script: "You opened one true owl book and used every tool inside it. The contents pointed you to the right page. Headings named each part. A bold word flagged what matters, the caption handed you a fact, and the glossary told you what pellet means. You never flipped page after page. You went straight to the fact. That is how a reader finds it fast." },
    },
  ],
};
