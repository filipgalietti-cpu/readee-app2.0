import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./three-word-tools-timings.json";

// Three Word Tools (L.3.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=three-word-tools
// G3-U1 UMBRELLA CAPSTONE of the L.3.4 toolkit (precedent: word-solvers L.2.4
// for G2, decoding-champions RF.2.3). No new tool is taught. The child reads
// one real chapter with unknown words in it and CHOOSES FLEXIBLY which tool
// fits each word: read around it (read-around-the-word L.3.4a owns the four
// clue kinds), take it apart (new-word-new-meaning L.3.4b owns known word +
// known affix), find the root you know (same-root-new-branch L.3.4c owns the
// root as a clue), and for a word the child already knows whose usual
// meaning does not fit, the sentence picks the meaning (word-solvers L.2.4
// owns the G2 double-duty precedent bank/light/train). look-it-up (L.2.4e)
// owns glossaries and dictionaries; nothing here reaches for a dictionary
// (L.3.4d lives in Unit 2). THIS owns the choosing and the checking: look at
// the word first, choose the tool, test what you get in the sentence, and
// when the first tool fails the test, switch tools (delighted is not about
// lamps; restored is not stored again). Frame = one story: the night the
// power goes out in Hazel's apartment building; her little brother Quinn and
// Grandma Odette, candles, leftover soup, a board game, an old guitar.
// ANCHOR FRESHNESS grep-swept across all of lessons-v2 + quizzes-v2:
// rummaged, unhurried, tripped (stumble sense), windowless, delighted (as a
// target), dwindled, guitarist, silence, restored, unsteady, noiseless,
// height, tourist, glimmered, shuddered are catalog-first; blackout /
// apartment / junk drawer / refrigerator are first-touch topics; names Hazel,
// Quinn, Odette fresh (Bram, warmth, pianist, width, wisdom, musician,
// fearless, depth, reheat, match found burned and swapped out). Speak texts
// carry no " my " (Speak.tsx exact-read flip). Tiles lowercase, audio-free,
// kebab ids, 28-char cap. No digits inside read-along or speak text.

const A = (id: string) => `/audio/lessons-v2/three-word-tools/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/three-word-tools/${w.toLowerCase()}.png`;

export const threeWordToolsImages: Record<string, string | { subject: string; ref?: string }> = {
  "lights-out-kitchen": "A small apartment kitchen at night with the lights off, dark blue shadows everywhere, a young girl with light brown skin and a short curly ponytail in a purple t-shirt and a small boy with the same light brown skin and short curly hair in a green t-shirt sitting at a wooden table, an older woman with silver hair in a bun, round glasses, and a red cardigan pulling open a kitchen drawer with both hands, a faint glow of city lights through the window, a ceiling fan hanging still. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "candlelit-board-game": { subject: "The same apartment kitchen at night lit only by three candles on the wooden table, warm orange glow on every face, the same young girl with light brown skin and a short curly ponytail in a purple t-shirt and the same small boy in a green t-shirt grinning over a board game with plain colored squares and small wooden pawns, the same older woman with silver hair in a bun, round glasses, and a red cardigan setting down a bowl of soup, rain streaking the dark window. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "lights-out-kitchen" },
  "lights-back-on": { subject: "The same apartment kitchen suddenly bright with every lamp and ceiling light on, the same small boy in a green t-shirt slumped over the board game with plain colored squares and a groaning face, the same young girl with light brown skin and a short curly ponytail in a purple t-shirt laughing, the same older woman with silver hair in a bun, round glasses, and a red cardigan holding an old acoustic guitar, three burned-down candle stubs on the table, the ceiling fan spinning. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "lights-out-kitchen" },
  "quiz-crowded-ferry": "The open top deck of a white passenger ferry packed shoulder to shoulder with people standing and sitting on every bench, a young boy with dark hair in an orange jacket standing in the middle looking around with no seat to take, calm blue sea and a plain pale blue sky with two small white clouds behind, no sun anywhere in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags with marks, no signs, no faces on any object, no writing anywhere.",
  "quiz-boy-jacket-deck": "A young boy with dark hair on the sunny deck of a white passenger ferry, opening the front of his orange jacket with both hands, the buttons undone one by one, a warm bright sun in a clear sky above the blue sea, the sun a plain yellow circle with no face. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-ferry-leaving-dock": "A white passenger ferry pulling away from a wooden dock, a widening stretch of blue water between the boat and the dock, a few people on the dock waving, a small green island with a lighthouse far in the distance, a sunny sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no flags with marks, no signs, no writing anywhere."
};

export const threeWordTools: LessonDef = {
  id: "three-word-tools",
  title: "Three Word Tools",
  grade: "3rd Grade",
  standard: "L.3.4",
  archetype: "vocabulary",
  objective: "I can look at a new word, choose the tool that fits it, and test the meaning I get in the sentence.",
  concepts: [
    "look at the word first, then choose the tool that fits it",
    "read around it when nothing inside the word is a word you know",
    "take it apart when a known word carries a part you have learned",
    "find the root when a word you know hides inside with its spelling shifted",
    "when a word you know does not fit, the sentence picks the meaning",
    "test the meaning in the sentence, and when the tool fails the test, switch tools",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Today you did not learn a new tool. You did something harder. You chose. At every word that stopped you, you looked at the word first, picked the tool that fit, and tested what you got in the sentence. And when a tool failed, like light inside delighted, you switched tools instead of giving up. That is what a strong reader does with a hard book. The tools are yours, and now so is the choosing.",
    "title": "Tool Chooser!",
    "body": "You looked at each new word, chose the tool that fit it, tested the meaning, and switched tools when the first one failed."
  },
  scenes: [
    {
      id: "hook-lights-out",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a night without power. Read along!",
      image: IMG("lights-out-kitchen"),
      narration: { audio: A("hook-lights-out"), script: "Hello, reader. You own three word tools now. You can read around a word, take a word apart, and find the root you know. Today nobody hands you the tool. You read a real chapter, and at every word that stops you, you choose the tool yourself and test what you get. The story starts on a hot night in July. Read along with me." },
      interaction: { type: "read-along", text: "On the hottest night of July, the lights in Hazel's apartment building blinked twice and went out, and the hum of the fan died with them. Her little brother Quinn let out a yelp in the dark, so Grandma Odette called from the kitchen, \"Nobody move until I find the candles.\" Hazel listened as Grandma rummaged through the junk drawer, digging past batteries and tape and rubber bands until her fingers closed on the box.", audio: A("hook-lights-out-sentence") },
    },
    {
      id: "model-choose-the-tool",
      purpose: "model",
      gate: "none",
      prompt: "Watch me look at the word, choose the tool, and test it.",
      fx: {"text":"**Look** at the word. **Choose** the tool. **Test** it.","effect":"pop-words"},
      narration: { audio: A("model-choose-the-tool"), script: "Rummaged might have stopped you. Here is how you choose. Look at the word itself before you look anywhere else. Is there a whole word you know with a part snapped on, like un or re or less? No. Is there a root you know hiding inside? Rum, mage, no. The word gives me nothing, and that tells me which tool to pick up. I read around it. Grandma rummaged through the junk drawer, digging past batteries and tape and rubber bands until her fingers closed on the box. Digging past things, searching until she found it. Rummaged means dug around searching. Now I test it. Grandma dug around searching through the junk drawer. It fits. Four choices sit in your toolbox. Read around it. Take it apart. Find the root. And for a word you already know whose usual meaning does not fit, the sentence picks the meaning. Look at the word first, choose the tool, then test what you get." },
    },
    {
      id: "guided-speak-read-candles",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: Grandma lit one candle, and a small flame filled the kitchen with a wobbly orange glow. She was unhurried, and she moved from candle to candle as slowly as if the power had never gone out at all. Quinn tripped over the rug on his way to the table, because the windowless hallway was pitch black.",
      narration: { audio: A("guided-speak-read-candles"), script: "Page two is yours to read. Three sentences, and three words in them might stop you. Read them out loud, clearly and with feeling, and notice which words make you slow down." },
      interaction: { type: "speak", text: "Grandma lit one candle and a small flame filled the kitchen with a wobbly orange glow She was unhurried and she moved from candle to candle as slowly as if the power had never gone out at all Quinn tripped over the rug on his way to the table because the windowless hallway was pitch black" },
    },
    {
      id: "guided-choose-tool-unhurried",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which tool fits unhurried?",
      narration: { audio: A("guided-choose-tool-unhurried"), script: "Here is unhurried. Before you touch the sentence, look at the word. What do you see inside it? Is there a part you have learned snapped onto a word you know, or a word hiding with its spelling changed, or nothing at all? What you see tells you which tool to use. Tap the tool that fits unhurried." },
      interaction: { type: "choose", options: [{ id: "take-it-apart", label: "take it apart" }, { id: "read-around-it", label: "read around it" }, { id: "find-the-root", label: "find the root" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }], correctId: "take-it-apart", coachWrong: "Look at the front of unhurried. There is a part you have learned there, sitting on a word you know. Which tool uses parts?" },
    },
    {
      id: "guided-choose-unhurried-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does unhurried mean here?",
      narration: { audio: A("guided-choose-unhurried-meaning"), script: "You chose the tool. Now use it and test it. Take unhurried apart, put the two meanings together, and test what you get against the sentence. She was unhurried, and she moved from candle to candle as slowly as if the power had never gone out at all. Read all four, and tap the meaning that passes the test." },
      interaction: { type: "choose", options: [{ id: "calm-and-not-rushing", label: "calm and not rushing" }, { id: "quick-and-in-a-rush", label: "quick and in a rush" }, { id: "in-a-hurry-once-again", label: "in a hurry once again" }, { id: "tired-out-from-hurrying", label: "tired out from hurrying" }], correctId: "calm-and-not-rushing", coachWrong: "The part on the front of unhurried flips the word. Then test your choice against as slowly as if the power had never gone out." },
    },
    {
      id: "guided-choose-tripped-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which meaning of tripped does the sentence pick?",
      narration: { audio: A("guided-choose-tripped-meaning"), script: "Tripped is a word you know. A trip is a ride to somewhere, a journey. Test that. Quinn journeyed over the rug on his way to the table? It does not fit. When a word you know does not fit, do not skip it. The sentence picks the meaning. Quinn tripped over the rug on his way to the table, because the windowless hallway was pitch black. Read all four, test each one in that sentence, and tap the meaning the sentence picks." },
      interaction: { type: "choose", options: [{ id: "stumbled-and-nearly-fell", label: "stumbled and nearly fell" }, { id: "took-a-long-journey", label: "took a long journey" }, { id: "danced-across-the-rug", label: "danced across the rug" }, { id: "ran-as-fast-as-he-could", label: "ran as fast as he could" }], correctId: "stumbled-and-nearly-fell", coachWrong: "Test that meaning in the sentence. Quinn was crossing a dark hallway, and his foot met the rug. What happened?" },
    },
    {
      id: "apply-read-blackout-party",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The story continues. Read along!",
      image: IMG("candlelit-board-game"),
      narration: { audio: A("apply-read-blackout-party"), script: "Back to the kitchen. This page hides a word that will try to trick your first tool. Read along with me, and look at every word that stops you before you choose." },
      interaction: { type: "read-along", text: "Quinn was delighted when Grandma pulled the old board game down from the closet, and he grinned and cheered as if the blackout were a party. Grandma warmed the leftover soup on the stove, since the burner ran on gas and not on power, and the three of them ate by candlelight. Hazel leaned close to the flame and felt its heat on her cheeks while rain drummed against the windows.", audio: A("apply-read-blackout-party-sentence") },
    },
    {
      id: "model-first-tool-fails",
      purpose: "model",
      gate: "none",
      prompt: "Watch what I do when the first tool fails.",
      fx: {"text":"**delighted** is not about lamps","effect":"cross-out"},
      narration: { audio: A("model-first-tool-fails"), script: "Delighted. Look at the word. I see light inside it, so I pick up find the root. Light, what a lamp gives off. Borrow it. Delighted would mean lit up with light. Now test it. Quinn was delighted when Grandma pulled the board game down, and he grinned and cheered. Was Quinn glowing like a lamp? No. The tool failed the test, and that is fine, because a strong reader switches tools. Read around it. He grinned and cheered as if the blackout were a party. Delighted means very happy. Test again. Quinn was very happy about the game, and he grinned and cheered. It fits. When the first tool fails, the test tells you, and you pick up the next tool." },
    },
    {
      id: "guided-sort-by-tool",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word by the tool that fits it.",
      narration: { audio: A("guided-sort-by-tool"), script: "Six new words, and you choose the tool for each one by looking at the word. If you see a whole word you know with a part you have learned snapped on, like un, re, pre, dis, non, less, ful, or able, drag it to Take It Apart. If a word you know hides inside with its spelling shifted, or with an ending you have not learned, drag it to Find the Root. If nothing inside the word is a word you know, drag it to Read Around It." },
      interaction: { type: "sort", buckets: ["Read Around It","Take It Apart","Find the Root"], items: [{ label: "unsteady", bucket: "Take It Apart" }, { label: "glimmered", bucket: "Read Around It" }, { label: "height", bucket: "Find the Root" }, { label: "noiseless", bucket: "Take It Apart" }, { label: "shuddered", bucket: "Read Around It" }, { label: "tourist", bucket: "Find the Root" }], coachWrong: "Look at that word again. Is there a part you have learned on a word you know, a word hiding with its spelling shifted, or nothing you know at all?" },
    },
    {
      id: "apply-speak-read-guitar",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: By nine o'clock the candles had dwindled to stubs, and their flames shrank until they barely lit the table. Grandma had been a guitarist in a band long ago, so she took her old guitar down from the wall and played in the dark. Hazel did not know one song, but the silence of the building made every note sound bigger.",
      narration: { audio: A("apply-speak-read-guitar"), script: "Page four is yours. Read these three sentences out loud, clearly and with feeling, and look at each new word before you decide what to do with it." },
      interaction: { type: "speak", text: "By nine o'clock the candles had dwindled to stubs and their flames shrank until they barely lit the table Grandma had been a guitarist in a band long ago so she took her old guitar down from the wall and played in the dark Hazel did not know one song but the silence of the building made every note sound bigger" },
    },
    {
      id: "apply-choose-tool-guitarist",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which tool fits guitarist?",
      narration: { audio: A("apply-choose-tool-guitarist"), script: "Guitarist. Look at the word before you look at the sentence. What do you see inside it, and what does that tell you to pick up? Tap the tool that fits guitarist." },
      interaction: { type: "choose", options: [{ id: "find-the-root", label: "find the root" }, { id: "read-around-it", label: "read around it" }, { id: "take-it-apart", label: "take it apart" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }], correctId: "find-the-root", coachWrong: "Read guitarist from the front. A whole word you know is sitting there, and the ending after it is not one you have learned. Which tool is that?" },
    },
    {
      id: "apply-choose-guitarist-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does guitarist mean here?",
      narration: { audio: A("apply-choose-guitarist-meaning"), script: "You chose the tool. Now use it and test it. Grandma had been a guitarist in a band long ago, so she took her old guitar down from the wall and played in the dark. Borrow the meaning of the word you found inside, then tap the meaning that passes the test." },
      interaction: { type: "choose", options: [{ id: "a-person-who-plays-guitar", label: "a person who plays guitar" }, { id: "a-song-written-for-guitar", label: "a song written for guitar" }, { id: "a-case-that-holds-a-guitar", label: "a case that holds a guitar" }, { id: "a-string-on-a-guitar", label: "a string on a guitar" }], correctId: "a-person-who-plays-guitar", coachWrong: "Test it in the sentence. Grandma had been one in a band, and she played. Is that a thing or a person?" },
    },
    {
      id: "apply-read-lights-back",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The last page. Read along!",
      image: IMG("lights-back-on"),
      narration: { audio: A("apply-read-lights-back"), script: "The last page, and one more word in it will try to trick a tool. Read along with me." },
      interaction: { type: "read-along", text: "Just before midnight, the power was restored, and every lamp in the apartment blinked back on at once. The fan whirred, the refrigerator hummed, and Quinn groaned because the game was not over yet. \"Storms pass,\" said Grandma Odette, \"but I hope you remember this one anyway.\"", audio: A("apply-read-lights-back-sentence") },
    },
    {
      id: "apply-choose-restored-meaning",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does restored mean here?",
      narration: { audio: A("apply-choose-restored-meaning"), script: "Restored. Look at the word. There is re, a part you know, sitting on store, a word you know. So I take it apart. Re means again, and that makes restored mean stored again. Now test it. The power was stored again, and every lamp blinked back on? That does not fit, so the tool failed. Switch tools. Read around the word, and tap the meaning that passes the test." },
      interaction: { type: "choose", options: [{ id: "brought-back-on", label: "brought back on" }, { id: "stored-away-again", label: "stored away again" }, { id: "shut-off-for-the-night", label: "shut off for the night" }, { id: "packed-into-a-box", label: "packed into a box" }], correctId: "brought-back-on", coachWrong: "Test that meaning against what happened next. Every lamp blinked back on at once. What had happened to the power?" },
    },
    {
      id: "challenge-speak-dwindled",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what dwindled means, and name the tool you used.",
      narration: { audio: A("challenge-speak-dwindled"), script: "Now you run the whole move out loud. By nine o'clock the candles had dwindled to stubs, and their flames shrank until they barely lit the table. Tap the mic, tell me what dwindled means in that sentence, and name the tool that got you there." },
      interaction: { type: "speak", text: "shrank shrink shrinking shrunk smaller small shorter short stubs burned low lower less faded fading melted down away read around sentence clue clues context whole" },
    },
    {
      id: "celebrate-tool-chooser",
      purpose: "celebrate",
      gate: "none",
      prompt: "Look at the word, choose the tool, test it.",
      fx: {"text":"**Choose** the tool, **test** the meaning","effect":"fireworks"},
      narration: { audio: A("celebrate-tool-chooser"), script: "You did not learn a new tool today. You did something harder. You chose. Rummaged, unhurried, tripped, delighted, guitarist, restored, dwindled. At every one, you looked at the word first, picked the tool that fit, and tested what you got in the sentence. And twice the first tool failed, and you switched instead of giving up. That is what a strong reader does with a hard book. The tools are yours, and now so is the choosing." },
    },
  ],
};
