import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fable-tellers-timings.json";

// Fable Tellers (RL.2.2) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fable-tellers
// G2 PILOT: original fable "The Squirrel and the Jay", 8 sentences over 4 child-read pages.

const A = (id: string) => `/audio/lessons-v2/fable-tellers/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fable-tellers/${w.toLowerCase()}.png`;

export const fableTellersImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover illustration of a red squirrel clutching a big pile of brown acorns under an oak tree on the left, and a cheerful blue jay handing seeds to two small brown sparrows on a branch on the right, sunny green park, framed like a picture book cover, no text anywhere",
  "page-1": { subject: "The same red squirrel stuffing shiny brown acorns into a hole in a big oak tree trunk, a large pile of acorns inside the tree hollow, sunny green park in the background", ref: "cover" },
  "page-2": { subject: "The same cheerful blue jay sharing a small pile of seeds with two happy brown sparrows and a tiny yellow chick on a tree branch, while the same red squirrel peeks out of her tree hollow hugging her acorn pile, sunny green park", ref: "page-1" },
  "page-3": { subject: "The same green park at night in a fierce storm, dark grey rain clouds, wind bending the trees, the big old oak tree cracked open with its hollow torn open and completely empty, brown acorns spilling out and floating away down a rushing stream, exactly one red squirrel in the whole picture, watching sadly from a branch, no animal inside the tree hollow", ref: "page-2" },
  "page-4": { subject: "The same green park at golden sunrise after the storm, a crowd of small colorful birds carrying seeds and straw to help the same cheerful blue jay fix her nest, exactly one red squirrel in the whole picture, sitting alone and sad on a bare branch watching them, the cracked tree hollow dark and completely empty, no acorns anywhere", ref: "page-2" }
};

export const fableTellers: LessonDef = {
  id: "fable-tellers",
  title: "Fable Tellers",
  grade: "2nd Grade",
  standard: "RL.2.2",
  archetype: "story-elements",
  objective: "I can read a whole fable, retell it in order, and find the moral it teaches.",
  concepts: ["what a fable is","read a whole fable","retell events in order","find the central message or moral","moral versus event","explain the moral in your own words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole fable from cover to end, all by yourself. You retold it in order, you found the moral, and you explained it in your own words. That is exactly what a fable teller does. The next fable you meet is going to hand you its lesson, because now you know how to find it.",
    "title": "You Are a Fable Teller!",
    "body": "You read a whole fable, retold it in order, and found the lesson it teaches about how to live."
  },
  scenes: [
    {
      id: "hook-what-is-a-fable",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "What is a fable?",
      fx: {"text":"A **fable** is a short story that hides a **lesson**.","effect":"pop-words"},
      narration: { audio: A("hook-what-is-a-fable"), script: "People have told fables for thousands of years. A fable is a short story, usually about animals, and it always hides something inside: a lesson about how to live. Readers call that lesson the moral. Today you will read a whole fable, retell it in order, and dig out its moral." },
    },
    {
      id: "model-mini-fable",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "Watch how a fable teller finds the moral.",
      fx: {"text":"The **moral** is the lesson the fable teaches.","effect":"underline"},
      narration: { audio: A("model-mini-fable"), script: "Watch me do it first with a tiny fable. Listen. Finn the fox laughed at the crow for flying so slowly. Then one day Finn's paw got stuck under a root, and the slow crow tugged and tugged until he was free. Now I retell it in order. First, Finn teased the crow. Next, Finn got stuck. Last, the crow set him free. And now the moral, the lesson for my own life: do not tease others, because you may need their help one day. Retell in order, then find the lesson. That is the whole job." },
    },
    {
      id: "predict-cover",
      purpose: "guided",
      gate: "interaction",
      prompt: "What do you think this fable will be about?",
      image: IMG("cover"),
      narration: { audio: A("predict-cover"), script: "Our fable is called The Squirrel and the Jay. Before we read, make a prediction, a smart guess built on clues. Study the cover. Look at what each animal is doing. Read every choice, then tap your best guess." },
      interaction: { type: "choose", options: [{ id: "squirrel-wont-share", label: "a squirrel who won't share" }, { id: "jay-steals-acorns", label: "a jay who steals acorns" }, { id: "race-across-park", label: "a race across the park" }, { id: "bear-sleeps-all-day", label: "a bear who sleeps all day" }], correctId: "squirrel-wont-share", coachWrong: "A prediction is built on clues. Look at the cover again. What is the squirrel holding, and what is the jay doing with her seeds? Tap your new best guess." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one: Sasha the squirrel found shiny brown acorns all over the park. She stored every acorn in her hollow oak and never shared one.",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Time to read. Page one of our fable is all yours. Sound out the tricky words, take your time, and read the whole page out loud." },
      interaction: { type: "speak", text: "Sasha the squirrel found shiny brown acorns all over the park She stored every acorn in her hollow oak and never shared one" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Joy the jay gathered seeds too, but she shared hers with every hungry bird. Sasha just snorted and hid her pile deeper in the dark.",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Now meet the second character in our fable. Page two is yours too. Read it out loud in your best storyteller voice." },
      interaction: { type: "speak", text: "Joy the jay gathered seeds too but she shared hers with every hungry bird Sasha just snorted and hid her pile deeper in the dark" },
    },
    {
      id: "check-response-sasha",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did Sasha do when Joy shared her seeds?",
      narration: { audio: A("check-response-sasha"), script: "Check-in time. On the page you just read, Joy shared her seeds with every hungry bird. Sasha saw it all. What did Sasha do? Read every choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "snorted-hid-pile", label: "snorted and hid her pile" }, { id: "shared-half-acorns", label: "shared half her acorns" }, { id: "sang-with-birds", label: "sang with the other birds" }, { id: "packed-up-left", label: "packed up and left the park" }], correctId: "snorted-hid-pile", coachWrong: "Think about how Sasha felt about sharing. Read page two again in your mind, and picture what she did next. Then tap it." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Something big is coming. Here is page three. Read along with me as the storm rolls in." },
      interaction: { type: "read-along", text: "One night a howling storm roared through the park and tossed the nests. The wind cracked the old oak, and Sasha's acorns washed down the river.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-response-storm",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did Sasha most likely feel after the storm?",
      narration: { audio: A("check-response-storm"), script: "The storm took every acorn Sasha had saved all summer. The story does not tell us how she felt, so a good reader figures it out. Read each choice, then tap the feeling that fits best." },
      interaction: { type: "choose", options: [{ id: "upset-and-alone", label: "upset and alone" }, { id: "proud-of-her-pile", label: "proud of her pile" }, { id: "sleepy-and-cozy", label: "sleepy and cozy" }, { id: "glad-the-oak-cracked", label: "glad the oak cracked" }], correctId: "upset-and-alone", coachWrong: "Sasha worked all summer for those acorns, and now they are gone. Think about losing something you worked hard for. Tap the feeling that fits." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: At dawn a crowd of birds flew in with seeds and straw to help Joy rebuild. Sasha sat alone in the cold and wished she had shared too.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "Here is the last page of the fable, and it is yours. Read it out loud and find out how the story ends." },
      interaction: { type: "speak", text: "At dawn a crowd of birds flew in with seeds and straw to help Joy rebuild Sasha sat alone in the cold and wished she had shared too" },
    },
    {
      id: "check-why-friends",
      purpose: "apply",
      gate: "interaction",
      prompt: "Why did the birds come to help Joy?",
      narration: { audio: A("check-why-friends"), script: "At dawn, a whole crowd of birds flew in to help Joy rebuild her nest. But why did they come for her? Think about what Joy did all through the fable. Read each choice, then tap the reason." },
      interaction: { type: "choose", options: [{ id: "she-always-shared", label: "she always shared her seeds" }, { id: "they-wanted-her-nest", label: "they wanted her nest" }, { id: "storm-blew-them-there", label: "the storm blew them there" }, { id: "sasha-asked-them", label: "sasha asked them to come" }], correctId: "she-always-shared", coachWrong: "Think back to page two. What did Joy do for the hungry birds before the storm ever came? That is your clue." },
    },
    {
      id: "retell-order",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the fable in order.",
      narration: { audio: A("retell-order"), script: "A fable teller can retell the whole story in order. Think about what happened first, what happened next, and how it ended. Put the events in the order they happened." },
      interaction: { type: "sequence", items: [{ id: "sasha-keeps-acorns", label: "sasha keeps every acorn", image: IMG("page-1") }, { id: "joy-shares-seeds", label: "joy shares her seeds", image: IMG("page-2") }, { id: "storm-takes-pile", label: "the storm takes the pile", image: IMG("page-3") }, { id: "friends-help-rebuild", label: "friends help joy rebuild", image: IMG("page-4") }], order: ["sasha-keeps-acorns","joy-shares-seeds","storm-takes-pile","friends-help-rebuild"], coachWrong: "Start at the very beginning, before the storm. Which character did we meet first, and what was she doing with her acorns?" },
    },
    {
      id: "find-moral",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which is the moral of this fable?",
      narration: { audio: A("find-moral"), script: "Now for the biggest job a fable teller has: finding the moral. The moral is the lesson the fable teaches about how to live. Think about how our fable ended, and what Joy did differently from Sasha. Read every choice carefully. They all sound wise, but only one fits our fable. Tap the moral." },
      interaction: { type: "choose", options: [{ id: "sharing-brings-friends", label: "sharing brings true friends" }, { id: "hard-work-pays-off", label: "hard work always pays off" }, { id: "slow-and-steady-wins", label: "slow and steady wins" }, { id: "never-trust-a-stranger", label: "never trust a stranger" }], correctId: "sharing-brings-friends", coachWrong: "A moral has to match our fable. Ask yourself what Joy did all along, and how it helped her after the storm. Tap the lesson that fits this story." },
    },
    {
      id: "moral-vs-event",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which one is a lesson, not just an event?",
      narration: { audio: A("moral-vs-event"), script: "Here is a tricky one. An event is something that happened one time in the story. A moral is different: it is advice you could use in your own life, any day. Read each choice. Three of them are events from our fable. One is a lesson for how to live. Tap the lesson." },
      interaction: { type: "choose", options: [{ id: "kindness-comes-back", label: "kindness comes back to you" }, { id: "oak-cracked-in-storm", label: "the oak cracked in the storm" }, { id: "sasha-hid-her-pile", label: "sasha hid her acorn pile" }, { id: "birds-brought-straw", label: "the birds brought straw" }], correctId: "kindness-comes-back", coachWrong: "An event happened one time in the story. A lesson is advice you could follow tomorrow, in your own life. Tap the advice." },
    },
    {
      id: "speak-explain-moral",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tell it in your own words: why did sharing help Joy?",
      narration: { audio: A("speak-explain-moral"), script: "Last job, fable teller. Prove you own the moral. Tell me in your own words: why did sharing help Joy after the storm? Just talk to me. Start with, sharing helped Joy because." },
      interaction: { type: "speak", text: "friends friend helped help shared share sharing seeds rebuild kind" },
    },
    {
      id: "celebrate-fable-teller",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You read a whole fable!",
      fx: {"text":"You are a **fable teller**!","effect":"fireworks"},
      narration: { audio: A("celebrate-fable-teller"), script: "Look at what you just did. You predicted from the cover. You read all four pages of a fable out loud. You retold the whole story in order. You found the moral, and you told me why it was true, in your own words. Sasha learned her lesson the hard way. You found it the reader's way. That is what fable tellers do." },
    },
  ],
};
