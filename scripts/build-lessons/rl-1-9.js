#!/usr/bin/env node
/** RL.1.9 — Comparing Story Adventures */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.9",
  grade: "1st Grade",
  domain: "Literature",
  title: "Comparing Story Adventures",
  slides: [
    {
      type: "intro",
      heading: "Same and Different",
      imagePrompt: `Two cheerful cartoon open picture books side by side, one with a forest scene and a bear, the other with a beehive and flowers, with a tiny bridge of arrows between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two stories can be alike in some ways and different in others.", displayText: "Alike + different", displayDelay: 2500 },
        { sub: "b", tts: "We compare to see what is the same.", displayText: "Compare = same", displayDelay: 2200 },
        { sub: "c", tts: "We contrast to see what is different.", displayText: "Contrast = different", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Two Honey Stories",
      imagePrompt: `A cheerful cartoon brown bear licking its paw smiling, next to a tiny friendly cartoon bee buzzing around a honeycomb, both in a soft sunny forest scene. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Story one. A bear looks for honey.", displayText: "Bear finds honey", displayDelay: 2000 },
        { sub: "b", tts: "Story two. A bee makes honey.", displayText: "Bee makes honey", displayDelay: 2000 },
        { sub: "c", tts: "What is the same? Both are about honey!", displayText: "Same: honey", displayDelay: 2500 },
        { sub: "d", tts: "What is different? One finds it, one makes it.", displayText: "Different: find vs make", displayDelay: 2800 },
      ],
    },
    {
      type: "teach",
      heading: "Two Brave Friends",
      imagePrompt: `A cheerful cartoon girl with curly black hair climbing a small mountain, smiling bravely, next to a cheerful cartoon boy with red hair swimming across a blue lake, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Story one. Amy is brave and climbs a mountain.", displayText: "Amy climbs", displayDelay: 2000 },
        { sub: "b", tts: "Story two. Bob is brave and swims a lake.", displayText: "Bob swims", displayDelay: 2000 },
        { sub: "c", tts: "Same? Both are brave adventures!", displayText: "Same: brave", displayDelay: 2500 },
        { sub: "d", tts: "Different? One climbs, one swims.", displayText: "Different: how", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "A Comparing Trick",
      imagePrompt: `A friendly cartoon Venn diagram with two overlapping circles, each colored softly, small happy faces inside and a tiny star in the middle overlap. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A comparing trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, what do both stories share? Then ask, what is special about each one?", displayText: "Share? Special?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to practice comparing stories!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.9-Q1", "RL.1.9-Q2", "RL.1.9-Q3", "RL.1.9-Q4", "RL.1.9-Q5"],
});
