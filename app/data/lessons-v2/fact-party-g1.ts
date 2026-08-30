import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./fact-party-g1-timings.json";

// Fact Finder Finale (RI.1.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=fact-party-g1

const A = (id: string) => `/audio/lessons-v2/fact-party-g1/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/fact-party-g1/${w.toLowerCase()}.png`;

export const factPartyG1Images: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A tall white lighthouse with red stripes standing on gray rocks by a calm blue sea, a bright yellow light glowing in the glass room at its top, framed like the cover of a fact book, no letters or words anywhere",
  "page-1": { subject: "The same tall white lighthouse with red stripes standing on gray rocks by a calm blue sea in bright daytime, a warm yellow light glowing in the glass room at the top of the tower, a few white clouds in the sky, no letters or words anywhere", ref: "cover" },
  "page-2": { subject: "The same tall white lighthouse with red stripes at night, a wide yellow beam of light shining from its top across a dark blue sea, sharp gray rocks poking out of the water near the shore, and a small ship sailing safely far away from the rocks, no letters or words anywhere", ref: "cover" },
  "page-3": "Inside a lighthouse tower, a friendly cartoon lighthouse keeper with a gray beard and a blue cap climbing a winding spiral staircase while holding a small glowing lantern, warm light on the round stone walls, the stairs clearly visible curving up the tower, no elevator, no rope, no letters or words anywhere"
};

export const factPartyG1: LessonDef = {
  id: "fact-party-g1",
  title: "Fact Finder Finale",
  grade: "1st Grade",
  standard: "RI.1.10",
  archetype: "fluency",
  objective: "I can read a whole fact book with purpose and understanding.",
  concepts: ["set a purpose","use headings","find key ideas","spot the author's reasons","check words and pictures"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole fact book on your own, and you used every fact skill to understand it. And you finished every lesson in Grade 1. That is a big deal. You have grown into a strong, thoughtful reader, and I am proud of you.",
    "title": "Grade 1 Complete!",
    "body": "You read a whole fact book like an expert and finished every Grade 1 lesson!"
  },
  scenes: [
    {
      id: "hook-last-book",
      purpose: "hook",
      gate: "none",
      prompt: "Your last Grade 1 fact book.",
      image: IMG("cover"),
      narration: { audio: A("hook-last-book"), script: "Hello, reader. Today is a special day. This is your very last Grade 1 lesson, and you are ready for it. You will read a whole fact book, and you will use every fact skill you know. Set a purpose, use the headings, find the key ideas, spot the author's reasons, and check the pictures. Our book is called All About Lighthouses, and every fact in it is true. Let's begin." },
    },
    {
      id: "set-purpose",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which question should we read this book to answer?",
      narration: { audio: A("set-purpose"), script: "First skill: set a purpose. A purpose is a question you want the book to answer. Look at the cover of All About Lighthouses. Read each question, then tap the one this book can answer." },
      interaction: { type: "choose", options: [{ id: "what-does-a-lighthouse-do", label: "What does a lighthouse do?" }, { id: "who-won-the-soccer-game", label: "Who won the soccer game?" }, { id: "what-is-for-lunch-today", label: "What is for lunch today?" }], correctId: "what-does-a-lighthouse-do", coachWrong: "A purpose is a question this book can answer. This book is all about lighthouses. Which question asks about them?" },
    },
    {
      id: "heading-hunt",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which heading names the page we want?",
      narration: { audio: A("heading-hunt"), script: "Second skill: use text features. This book has three headings, one for each page. A heading tells what a page will teach. Say we want to know who takes care of the light. Read each heading, then tap the heading of the page that will tell us." },
      interaction: { type: "choose", options: [{ id: "what-is-a-lighthouse", label: "What Is a Lighthouse?" }, { id: "how-the-light-helps", label: "How the Light Helps" }, { id: "the-keeper", label: "The Keeper" }], correctId: "the-keeper", coachWrong: "A heading names what its page teaches. We want the page about the person who takes care of the light. Read the headings one more time." },
    },
    {
      id: "read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one: A lighthouse is a tall tower by the sea. A bright light shines at the top.",
      image: IMG("page-1"),
      narration: { audio: A("read-page-one"), script: "You found the right heading. Now we read the whole book from the start, so that page will come last. Here is page one. Read it out loud in your best reading voice, and think about our purpose question." },
      interaction: { type: "speak", text: "A lighthouse is a tall tower by the sea A bright light shines at the top" },
    },
    {
      id: "check-what-is",
      purpose: "guided",
      gate: "interaction",
      prompt: "What is a lighthouse?",
      narration: { audio: A("check-what-is"), script: "Check what you read. Think back to page one. What is a lighthouse? Read each choice, then tap your answer." },
      interaction: { type: "choose", options: [{ id: "a-tall-tower-by-the-sea", label: "a tall tower by the sea" }, { id: "a-small-boat-on-a-lake", label: "a small boat on a lake" }, { id: "a-long-bridge-on-a-road", label: "a long bridge on a road" }], correctId: "a-tall-tower-by-the-sea", coachWrong: "Read page one in your mind again. It tells exactly what a lighthouse is. Which choice matches its words?" },
    },
    {
      id: "read-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two: At night, the sea is very dark. The light flashes to show ships where the sharp rocks hide.",
      image: IMG("page-2"),
      narration: { audio: A("read-page-two"), script: "Here is page two, under the heading How the Light Helps. Read it out loud and find out how the light helps ships." },
      interaction: { type: "speak", text: "At night the sea is very dark The light flashes to show ships where the sharp rocks hide" },
    },
    {
      id: "check-key-idea",
      purpose: "apply",
      gate: "interaction",
      prompt: "What is the key idea of page two?",
      narration: { audio: A("check-key-idea"), script: "Third skill: find the key idea. The key idea is the big thing a page teaches. Look at the picture and think about the words you just read. Read each choice, then tap the key idea of page two." },
      interaction: { type: "choose", options: [{ id: "the-light-keeps-ships-safe", label: "The light keeps ships safe." }, { id: "the-sea-has-many-fish-in-it", label: "The sea has many fish in it." }, { id: "ships-can-be-big-or-small", label: "Ships can be big or small." }], correctId: "the-light-keeps-ships-safe", coachWrong: "A key idea is the big thing the whole page teaches, not a small side fact. Think about what page two wanted you to learn, then tap again." },
    },
    {
      id: "check-reason",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which reason does the book give?",
      narration: { audio: A("check-reason"), script: "Fourth skill: spot the author's reason. An author gives reasons to back up a big point. The author's point is that ships need the light. Read each choice, then tap the reason page two gives." },
      interaction: { type: "choose", options: [{ id: "the-sea-is-dark-at-night", label: "The sea is dark at night." }, { id: "ships-sail-slowly-at-night", label: "Ships sail slowly at night." }, { id: "the-stars-are-too-far-away", label: "The stars are too far away." }], correctId: "the-sea-is-dark-at-night", coachWrong: "A reason tells why the point is true. Look for the reason that page two really gave, then tap again." },
    },
    {
      id: "read-page-three",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read page three: A keeper takes care of the light. Long ago, keepers lit the lamp every night.",
      image: IMG("page-3"),
      narration: { audio: A("read-page-three"), script: "Last page. This is the page your heading skill found, The Keeper. Read it out loud." },
      interaction: { type: "speak", text: "A keeper takes care of the light Long ago keepers lit the lamp every night" },
    },
    {
      id: "check-picture",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How does the keeper get to the top?",
      image: IMG("page-3"),
      narration: { audio: A("check-picture"), script: "Fifth skill: words and pictures can teach different things. The words told us the keeper takes care of the light. But the words did not tell how the keeper gets all the way up there. Look closely at the picture. Read each choice, then tap what the picture shows." },
      interaction: { type: "choose", options: [{ id: "climbs-the-winding-stairs", label: "climbs the winding stairs" }, { id: "rides-up-in-an-elevator", label: "rides up in an elevator" }, { id: "swings-up-on-a-long-rope", label: "swings up on a long rope" }], correctId: "climbs-the-winding-stairs", coachWrong: "This clue hides in the picture, not the words. Look at the picture one more time, then tap what it really shows." },
    },
    {
      id: "wrap-whole-book",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What did the whole book teach?",
      narration: { audio: A("wrap-whole-book"), script: "You read every page of a real fact book. One last check. Think about the words you read and the pictures you studied. Read each choice, then tap the one that tells what the whole book taught." },
      interaction: { type: "choose", options: [{ id: "how-lighthouses-help-ships", label: "How lighthouses help ships." }, { id: "how-keepers-sail-big-ships", label: "How keepers sail big ships." }, { id: "how-rocks-light-up-the-sea", label: "How rocks light up the sea." }], correctId: "how-lighthouses-help-ships", coachWrong: "Think about all three pages together. Which choice matches what this book really taught?" },
    },
    {
      id: "celebrate-finale",
      purpose: "celebrate",
      gate: "none",
      prompt: "You finished Grade 1!",
      fx: {"text":"You finished **Grade 1**!","effect":"fireworks"},
      narration: { audio: A("celebrate-finale"), script: "You just read a whole fact book from cover to end, and you used every skill like an expert. You set a purpose, used a heading, found a key idea, spotted the author's reason, and read a picture clue. And here is the biggest news of all. That was your very last Grade 1 lesson. You finished every single one. I am so proud of the reader you have become. Take a bow, fact expert." },
    },
  ],
};
