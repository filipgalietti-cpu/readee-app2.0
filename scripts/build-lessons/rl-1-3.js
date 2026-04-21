#!/usr/bin/env node
/** RL.1.3 — Characters, Settings, and Events */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.3",
  grade: "1st Grade",
  domain: "Literature",
  title: "Characters, Settings, and Events",
  slides: [
    {
      type: "intro",
      heading: "Three Parts of a Story",
      imagePrompt: `A cheerful cartoon child sitting inside an open pop-up storybook, surrounded by tiny paper trees, a small castle, and a small friendly dragon. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every story has three big pieces.", displayText: "Three big pieces", displayDelay: 2000 },
        { sub: "b", tts: "Characters. The people or animals in the story.", displayText: "Characters", displayDelay: 2500 },
        { sub: "c", tts: "Setting. Where and when the story takes place.", displayText: "Setting", displayDelay: 2500 },
        { sub: "d", tts: "Events. The things that happen!", displayText: "Events", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Meet the Character",
      imagePrompt: `A friendly cartoon elderly woman with a kind smile, warm brown skin, silver hair, wearing a cozy patterned shawl, holding a little basket with seeds for birds. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Characters are the who of the story.", displayText: "Characters = who", displayDelay: 2000 },
        { sub: "b", tts: "Listen. The kind old woman fed the birds every morning.", displayText: "A kind old woman", displayDelay: 2500 },
        { sub: "c", tts: "Who is the character? The kind old woman!", displayText: "Character: old woman", displayDelay: 2500 },
        { sub: "d", tts: "What is she like? Kind and caring. We can tell by what she does.", displayText: "She is kind", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Setting and Events",
      imagePrompt: `A cheerful cartoon little seaside cottage with a red roof, next to a sandy beach with gentle waves, flowers blooming around the door, and seabirds flying in the sky. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The setting is where and when it happens.", displayText: "Setting = where + when", displayDelay: 2500 },
        { sub: "b", tts: "The old woman lived by the sea, in a tiny cottage. That is the setting!", displayText: "By the sea", displayDelay: 2500 },
        { sub: "c", tts: "Events are what happens in the story.", displayText: "Events = what happens", displayDelay: 2500 },
        { sub: "d", tts: "Feeding the birds every morning. That is an event!", displayText: "Event: feeding birds", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Picture It",
      imagePrompt: `A friendly cartoon thought bubble with three little icons floating inside: a tiny smiling face, a tiny sun over grass, and a tiny waving hand. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A story trick", displayDelay: 1500 },
        { sub: "b", tts: "When you read, picture the character, the setting, and the events in your mind.", displayText: "Picture it all!", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to practice finding story parts!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.3-Q1", "RL.1.3-Q2", "RL.1.3-Q3", "RL.1.3-Q4", "RL.1.3-Q5"],
});
