#!/usr/bin/env node
/** RL.1.10 — Storytime All Year (range and complexity of literature) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RL.1.10",
  grade: "1st Grade",
  domain: "Literature",
  description: "With prompting and support, read prose and poetry of appropriate complexity for grade 1",
  parentTip: "Read a little every day. Mix old favorites with new, trickier books.",
  questions: [
    { type: "multiple_choice", prompt: "Why is it important to read lots of different stories?", choices: ["It makes your brain stronger", "It makes you taller", "It makes you loud", "It makes you tired"], correct: "It makes your brain stronger", hint: "Different stories build different reading muscles!", difficulty: 1, imagePrompt: `A cheerful cartoon brain character wearing a tiny graduation cap, lifting a small dumbbell. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which is a great way to get better at reading?", choices: ["read a little every day", "read only once a month", "never read", "read only one book over and over"], correct: "read a little every day", hint: "A little every day adds up fast!", difficulty: 1, imagePrompt: `A cheerful cartoon calendar with a tiny reading child drawn on each day, a star on today. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What should you do when a story gets tricky?", choices: ["ask for help", "give up forever", "skip every page", "close the book and never open it"], correct: "ask for help", hint: "Growing readers ask questions when stuck!", difficulty: 2, imagePrompt: `A cheerful cartoon child raising a hand to a smiling grown-up, both with open books nearby. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "A poem is a special kind of:", choices: ["story or writing", "toy", "food", "song on the radio"], correct: "story or writing", hint: "Poems are stories told with rhythm and feeling!", difficulty: 2, imagePrompt: `A cheerful cartoon open poetry book with tiny musical notes floating off the pages. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why try stories that are a little harder than before?", choices: ["to grow as a reader", "to show off", "to get tired quickly", "to skip reading"], correct: "to grow as a reader", hint: "A little stretch helps you grow!", difficulty: 2, imagePrompt: `A cheerful cartoon small plant growing into a taller plant, a tiny open book in front of it. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RL.1.10",
  grade: "1st Grade",
  domain: "Literature",
  title: "Storytime All Year",
  slides: [
    {
      type: "intro",
      heading: "Read Every Day",
      imagePrompt: `A cheerful cartoon calendar with a tiny bookmark on each month, and a friendly child reading next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Reading a little every day is like a superpower.", displayText: "Read every day", displayDelay: 2500 },
        { sub: "b", tts: "The more stories and poems you read, the stronger your reading gets.", displayText: "Stronger reader", displayDelay: 2800 },
        { sub: "c", tts: "Let us see how to read all year long.", displayText: "All year long!", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Mix It Up",
      imagePrompt: `A cheerful cartoon bookshelf full of different-colored books and a child picking one out, with others ready to choose. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pick stories about different things.", displayText: "Different stories", displayDelay: 2000 },
        { sub: "b", tts: "Funny ones. Scary ones. Adventure ones. Poems too!", displayText: "Funny. Scary. Adventure. Poems.", displayDelay: 3000 },
        { sub: "c", tts: "New stories teach you new words and new ideas.", displayText: "New words + ideas", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "When It Gets Tricky",
      imagePrompt: `A cheerful cartoon child with a puzzled look, raising a hand with a tiny lightbulb above them, a grown-up smiling nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sometimes a story has tricky words or long sentences.", displayText: "Some are tricky", displayDelay: 2500 },
        { sub: "b", tts: "That is a good thing! Growing readers try hard books.", displayText: "Tricky = growing", displayDelay: 2500 },
        { sub: "c", tts: "When you need help, ask a grown-up or friend. That is smart!", displayText: "Ask for help", displayDelay: 2800 },
      ],
    },
    {
      type: "tip",
      heading: "A Reading Routine",
      imagePrompt: `A cheerful cartoon clock with hearts around it, a child in pajamas sitting on a bed reading a book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A routine trick", displayDelay: 1500 },
        { sub: "b", tts: "Pick a time to read every day. Bedtime, after lunch, or right when you wake up.", displayText: "Same time daily", displayDelay: 3000 },
        { sub: "c", tts: "Now you are ready to enjoy stories all year long!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.10-Q1", "RL.1.10-Q2", "RL.1.10-Q3", "RL.1.10-Q4", "RL.1.10-Q5"],
});
