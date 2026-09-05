import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./read-around-the-word-timings.json";

// Read Around the Word (L.3.4a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=read-around-the-word
// G3-U1 lesson 3. Sentence-LEVEL context clues in compound and early-complex
// sentences: the move "stop, read around the word, find the clue, test the
// meaning" plus the four clue kinds a G3 reader names out loud: TELLS IT
// STRAIGHT (definition set off by commas), GIVES AN EXAMPLE (like/such as
// lists), SAYS THE OPPOSITE (unlike/but/instead/not signals), and THE WHOLE
// SENTENCE (no signal, only one meaning fits). Literal phrases are targets
// too (took shelter, out of breath); figurative language stays with L.3.5a.
// Sibling split honored: clue-hunters (L.2.4a) owns G2 short-sentence clues
// (cottage/ravenous/tranquil/mend/sturdy burned), sentence-clues (L.1.4a)
// owns G1 (drowsy/soaked/silent/rapid/gleeful burned), word-solvers (L.2.4)
// owns the strategy picker + bank/light/train, look-it-up (L.2.4e) owns
// glossary + gallop/timid/seal/pitcher, word-toolbox (L.1.4) owns bark/bat/
// ring/glum. Frame = one story: Sofia, her cousin Felix, and Uncle Amos
// climb to an old fire lookout. ANCHOR FRESHNESS grep-swept across all of
// lessons-v2 + quizzes-v2: summit, gear, reluctant, eager, trudged, parched,
// provisions, took shelter, torrent, sprinkle, cautious, elated, out of
// breath, gorge, figs, mallet, axe are all catalog-first; names Sofia, Felix,
// Amos fresh (Rosa/Leo/Marco/Priya/Nadia/Wren/Deja/Ray/Tasha/Kofi/Lola/
// Cole/Rafi/Otis/Isla/Mara/Jun/Roz/Tess burned).

const A = (id: string) => `/audio/lessons-v2/read-around-the-word/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/read-around-the-word/${w.toLowerCase()}.png`;

export const readAroundTheWordImages: Record<string, string> = {
  "trail-to-lookout": "A young girl with a dark braid in a green jacket and a young boy in a red cap, each wearing a hiking backpack, climbing a rocky mountain trail behind a tall smiling man with a short beard and a wide-brimmed hat, a small wooden fire lookout tower standing on the rounded summit above them, pine trees and a bright blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "hiking-gear": "A coiled blue climbing rope, a yellow headlamp, and a green metal water bottle laid out on a flat grey rock beside an open canvas backpack, a rocky mountain trail and pine trees in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "storm-at-lookout": "A small wooden fire lookout tower on a rocky mountain summit under dark purple storm clouds, heavy rain pouring down in thick sheets, warm yellow light glowing in the tower windows, wet rocks shining. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-mouse-cheese": "A small grey mouse taking one tiny bite from a wedge of yellow cheese on a wooden kitchen floor, a few crumbs beside it. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-boy-squinting": "A young boy in a striped shirt shielding his eyes with one hand and squinting hard, eyes narrowed to slits, under a huge plain bright yellow sun with NO face and no facial features, on a sandy beach with waves behind him. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-girl-kite": "A young girl gripping a kite string tightly with both hands as a big plain red kite pulls hard in a strong wind on a grassy hill, her hair blowing sideways. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const readAroundTheWord: LessonDef = {
  id: "read-around-the-word",
  title: "Read Around the Word",
  grade: "3rd Grade",
  standard: "L.3.4a",
  archetype: "vocabulary",
  objective: "I can read around a new word, find the clue in the sentence, and prove what the word means.",
  concepts: [
    "stop, read around the word, find the clue, test the meaning",
    "a clue can tell it straight, with the meaning sitting right beside the word",
    "a clue can give an example, a list that shows the word in action",
    "a clue can say the opposite, with a signal like unlike, but, or instead",
    "with no signal, the whole sentence lets only one meaning fit",
    "phrases work the same way as words",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "When a word stops you now, you know the move. Stop, read around the word, find the clue, and test the meaning. A clue can tell it straight, give an example, say the opposite, or let the whole sentence decide. You unlocked summit, reluctant, trudged, parched, and torrent yourself, and you proved each one with the words around it. That is exactly how third graders read hard books.",
    "title": "Word Unlocker!",
    "body": "You stopped at new words, read around them, found the clue, and tested the meaning."
  },
  scenes: [
    {
      id: "hook-trail-to-lookout",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A story about a mountain trail. Read along!",
      image: IMG("trail-to-lookout"),
      narration: { audio: A("hook-trail-to-lookout"), script: "Hello, reader. Today you learn what third graders do when a word in a sentence stops them cold. The move starts on a mountain trail. Read along with me, and notice the words that might be new to you." },
      interaction: { type: "read-along", text: "Early on Saturday, Uncle Amos led Sofia and her cousin Felix up the trail to the summit, the very top of the mountain, where an old fire lookout stood. Each of them carried gear, like a rope, a headlamp, and a water bottle, in a heavy pack. Sofia was reluctant, unlike Felix, who was eager to race ahead, so Uncle Amos walked beside her and pointed out the loose rocks. By the third mile, the three of them trudged up the last stretch, dragging their tired feet, and nobody said a word. \"Slow is fine,\" said Uncle Amos, \"as long as we keep climbing.\"", audio: A("hook-trail-to-lookout-sentence") },
    },
    {
      id: "model-the-move",
      purpose: "model",
      gate: "none",
      prompt: "Watch me stop, read around, find the clue, and test it.",
      fx: {"text":"**Stop.** Read around the word. **Find** the clue. **Test** it.","effect":"pop-words"},
      narration: { audio: A("model-the-move"), script: "Summit might have stopped you. Here is the move every strong reader makes. Stop. Read around the word, the words before it and the words after it. Find the clue. Then test the meaning in the sentence. Watch me. The sentence says, the summit, the very top of the mountain. That clue tells it straight. The meaning sits right beside the word, tucked between two commas. Now I test it. They climbed to the very top of the mountain, where the lookout stood. It fits. Summit means the top." },
    },
    {
      id: "model-gives-an-example",
      purpose: "model",
      gate: "none",
      prompt: "A second kind of clue gives an example.",
      image: IMG("hiking-gear"),
      narration: { audio: A("model-gives-an-example"), script: "Here is a second kind of clue. Each of them carried gear, like a rope, a headlamp, and a water bottle. I do not know gear, but the word like hands me examples. A rope, a headlamp, a water bottle. Those are all things you pack and carry, so gear must mean the equipment you bring along. I test it. They carried their equipment in heavy packs. It fits. That clue gives an example, and words like such as do the same job." },
    },
    {
      id: "model-says-the-opposite",
      purpose: "model",
      gate: "none",
      prompt: "A third kind of clue says the opposite.",
      fx: {"text":"Sofia was reluctant, **unlike** Felix, who was **eager**","effect":"cross-out"},
      narration: { audio: A("model-says-the-opposite"), script: "The third kind of clue points the other way. Sofia was reluctant, unlike Felix, who was eager to race ahead. The word unlike is a signal. It tells me Sofia is the opposite of Felix. Felix was eager, so Sofia was not eager at all. She did not want to rush. Reluctant means holding back, not wanting to do something. Signal words like unlike, but, instead, and not all tell you that the clue says the opposite." },
    },
    {
      id: "guided-choose-trudged",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does trudged mean here?",
      narration: { audio: A("guided-choose-trudged"), script: "Now the last kind of clue, and it is your turn. Trudged has no commas beside it, no like, and no unlike. When there is no signal, read the whole sentence. By the third mile, the three of them trudged up the last stretch, dragging their tired feet, and nobody said a word. Only one meaning fits that whole sentence. Read all four, test each one, and tap the meaning that fits." },
      interaction: { type: "choose", options: [{ id: "walked-with-slow-heavy-steps", label: "walked with slow heavy steps" }, { id: "raced-with-quick-light-steps", label: "raced with quick light steps" }, { id: "skipped-with-happy-steps", label: "skipped with happy steps" }, { id: "crawled-on-hands-and-knees", label: "crawled on hands and knees" }], correctId: "walked-with-slow-heavy-steps", coachWrong: "Read the whole sentence again. Their feet were tired and dragging. Which way of moving matches that?" },
    },
    {
      id: "guided-choose-trudged-clue",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words were the clue for trudged?",
      narration: { audio: A("guided-choose-trudged-clue"), script: "You found the meaning. Now prove it. A strong reader can point to the exact words that unlocked the word. Here is the sentence again. By the third mile, the three of them trudged up the last stretch, dragging their tired feet, and nobody said a word. All four of these come from that sentence, but only one group of words proves what trudged means. Tap the clue." },
      interaction: { type: "choose", options: [{ id: "dragging-their-tired-feet", label: "dragging their tired feet" }, { id: "by-the-third-mile", label: "by the third mile" }, { id: "up-the-last-stretch", label: "up the last stretch" }, { id: "nobody-said-a-word", label: "nobody said a word" }], correctId: "dragging-their-tired-feet", coachWrong: "Those words are in the sentence, but they do not show how the three of them were moving. Look for the words that do." },
    },
    {
      id: "guided-sort-clue-kinds",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each clue by its kind.",
      narration: { audio: A("guided-sort-clue-kinds"), script: "Three kinds of clues, six new clues. Read each card and find its signal. If the meaning sits right beside the word, drag the card to Tells It Straight. If the card lists things, drag it to Gives an Example. If it points to the opposite, drag it to Says the Opposite." },
      interaction: { type: "sort", buckets: ["Tells It Straight","Gives an Example","Says the Opposite"], items: [{ label: "a gorge, a narrow valley", bucket: "Tells It Straight" }, { label: "snacks such as nuts and figs", bucket: "Gives an Example" }, { label: "unlike his calm sister", bucket: "Says the Opposite" }, { label: "a mallet, a wooden hammer", bucket: "Tells It Straight" }, { label: "tools like a saw and an axe", bucket: "Gives an Example" }, { label: "but Felix was not tired", bucket: "Says the Opposite" }], coachWrong: "Look for the signal on that card. Commas beside a word, a list of things, or a word like unlike or but." },
    },
    {
      id: "apply-read-storm",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The story continues. Read along!",
      image: IMG("storm-at-lookout"),
      narration: { audio: A("apply-read-storm"), script: "Back to the mountain. The story continues at the top, and this part hides four new words and phrases. Read along with me, and run the move on every one that stops you." },
      interaction: { type: "read-along", text: "At the top, the sun blazed, and Sofia was so parched that she drank half her water without stopping once. Uncle Amos unpacked the provisions, the food they had brought for the day, and everyone ate in the shade of the tower. Then dark clouds rolled over the ridge, so the three of them took shelter inside the lookout just before the rain hit. The rain came down in a torrent, not a light sprinkle, and it ended as suddenly as it began. \"Storms up here move fast,\" said Uncle Amos, \"and so will we, once it clears.\"", audio: A("apply-read-storm-sentence") },
    },
    {
      id: "apply-choose-parched",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does parched mean here?",
      narration: { audio: A("apply-choose-parched"), script: "Parched has no signal beside it, so read the whole sentence. The sun blazed, and Sofia was so parched that she drank half her water without stopping once. Test each meaning in that sentence, and tap the one that fits." },
      interaction: { type: "choose", options: [{ id: "very-thirsty", label: "very thirsty" }, { id: "very-sleepy", label: "very sleepy" }, { id: "very-cold", label: "very cold" }, { id: "very-proud", label: "very proud" }], correctId: "very-thirsty", coachWrong: "Reread the sentence. The sun was blazing, and she drank half her water at once. What was her body telling her?" },
    },
    {
      id: "apply-choose-provisions-kind",
      purpose: "apply",
      gate: "interaction",
      prompt: "What kind of clue unlocked provisions?",
      narration: { audio: A("apply-choose-provisions-kind"), script: "Uncle Amos unpacked the provisions, the food they had brought for the day. You can tell provisions means the food and supplies for the trip. Now name the kind of clue that told you. Tap it." },
      interaction: { type: "choose", options: [{ id: "tells-it-straight", label: "tells it straight" }, { id: "gives-an-example", label: "gives an example" }, { id: "says-the-opposite", label: "says the opposite" }, { id: "the-whole-sentence", label: "the whole sentence" }], correctId: "tells-it-straight", coachWrong: "Find the signal. Is there a list, an opposite word, or a meaning sitting right beside the word?" },
    },
    {
      id: "apply-choose-torrent-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words were the clue for torrent?",
      narration: { audio: A("apply-choose-torrent-clue"), script: "The rain came down in a torrent, not a light sprinkle, and it ended as suddenly as it began. Torrent means a heavy, pouring rain. Which words in that sentence proved it? Tap the clue." },
      interaction: { type: "choose", options: [{ id: "not-a-light-sprinkle", label: "not a light sprinkle" }, { id: "the-rain-came-down", label: "the rain came down" }, { id: "as-suddenly-as-it-began", label: "as suddenly as it began" }, { id: "and-it-ended", label: "and it ended" }], correctId: "not-a-light-sprinkle", coachWrong: "Look for a signal word that points to the opposite of a torrent." },
    },
    {
      id: "apply-speak-read-descent",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it aloud: After the storm, the wet rocks were slippery, so Felix took cautious steps instead of racing down. Sofia felt elated, happier than she had felt all summer, because she had climbed every mile on her own legs.",
      narration: { audio: A("apply-speak-read-descent"), script: "The story ends on the way down, and these two sentences are yours to read. Read them out loud, clearly and with feeling, and notice the two new words hiding inside." },
      interaction: { type: "speak", text: "After the storm the wet rocks were slippery so Felix took cautious steps instead of racing down Sofia felt elated happier than she had felt all summer because she had climbed every mile on her own legs" },
    },
    {
      id: "apply-speak-cautious",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say what cautious means, and name the clue words.",
      narration: { audio: A("apply-speak-cautious"), script: "Now you run the whole move out loud. Felix took cautious steps instead of racing down. Tap the mic, tell me what cautious means in that sentence, and say the words that were the clue." },
      interaction: { type: "speak", text: "careful carefully slow slowly safe safely steady gentle gently watchful instead racing race raced slippery wet rocks opposite" },
    },
    {
      id: "challenge-choose-out-of-breath",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does out of breath mean here?",
      narration: { audio: A("challenge-choose-out-of-breath"), script: "Last one, and it is a phrase, not a single word. The move works the same way. At the bottom of the trail, Felix raced the last hundred steps and reached the car out of breath, panting so hard that he could not talk for a full minute. Read around the phrase, find the clue, and tap what out of breath means here." },
      interaction: { type: "choose", options: [{ id: "breathing-hard-after-running", label: "breathing hard after running" }, { id: "holding-his-breath-in-fear", label: "holding his breath in fear" }, { id: "breathing-softly-in-sleep", label: "breathing softly in sleep" }, { id: "yelling-as-loud-as-he-could", label: "yelling as loud as he could" }], correctId: "breathing-hard-after-running", coachWrong: "Read around the phrase. Felix had just raced, and he was panting. What does that tell you?" },
    },
    {
      id: "celebrate-read-around",
      purpose: "celebrate",
      gate: "none",
      prompt: "Stop, read around, find the clue, test it.",
      fx: {"text":"Read **around** the word, **every** time","effect":"fireworks"},
      narration: { audio: A("celebrate-read-around"), script: "You ran the move on every word that tried to stop you today. A clue can tell it straight, with the meaning sitting right beside the word. It can give an example, with a list that shows the word in action. It can say the opposite, with a signal like unlike or but. And when there is no signal, the whole sentence lets only one meaning fit. You met summit, gear, reluctant, trudged, parched, provisions, torrent, cautious, and elated today, and you unlocked every one of them by reading around the word, and you can point to the clue that proved it. Next time a word stops you cold, do not skip it. Read around it." },
    },
  ],
};
