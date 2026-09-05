import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./why-they-did-it-timings.json";

// Why They Did It (RL.3.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=why-they-did-it
// G3-U1 lesson 5. CHARACTER DESCRIPTION + CAUSE CHAIN tier of RL.3.3 (sibling
// split: character-challenges RL.2.3 owns G2 characters RESPONDING to events
// (Kenji/Mochi, calm/worried/relieved); story-parts RL.1.3 owns G1 character/
// setting/event (Meg/Jax, helpful); story-elements RL.K.3 owns K; show-me-where
// RL.3.1 owns pointing to the proving line; follow-the-message RL.3.2 owns the
// moral. THIS lesson owns three lenses on ONE person, TRAIT (what she is like,
// shown by what she does again and again), MOTIVATION (what she wants, the
// reason behind a choice), FEELING (what she feels at one moment, and it
// passes), plus the cause chain: because she did X, Y happened next. Traits
// are never stated by the narrator; the child infers them from repeated
// actions. ONE original story, "The Wheel at Sunset": 15 sentences over 5
// child-read pages (read-along 1/3/5 with images, speak 2/4), compound +
// early-complex sentences, three speech-tagged dialogue lines, stretch words
// harvest / upstream / slumped / squelched / clinked with in-text support.
// Yara's repeated actions (climbs the trunk, walks a mile upstream, asks the
// farmer, follows the creek two more miles) show one trait; her want (ride the
// great wheel with Nico before he moves) explains the key choice (she does not
// turn back); her feeling changes (skipping on Saturday morning, shoulders
// slumped at the flood, glowing at the top); one action (following the creek)
// visibly causes the next event (she reaches the gate as the lights come on).
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Yara,
// Nico, Millbrook, Cold Creek, harvest, upstream, slumped, squelched, clinked,
// footbridge, fairgrounds, jam jar, dairy, discouraged, determined-as-trait
// all 0 hits (wheel/wagon/oak/creek/pumpkin appear only as props elsewhere).
// Keys prefixed quiz- are fresh stimuli for the quiz (Ines, Kwame, the blue
// umbrella, crackers, the saved seat: all 0 hits).

const A = (id: string) => `/audio/lessons-v2/why-they-did-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/why-they-did-it/${w.toLowerCase()}.png`;

export const whyTheyDidItImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with light brown skin and a curly dark ponytail wearing a yellow sweater, dropping a coin into a glass jam jar half full of coins on a sunny farmhouse kitchen windowsill, through the window a view of rolling autumn farmland with a small distant ferris wheel and a few striped tents on a far hill, warm morning light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same young girl with light brown skin and a curly dark ponytail in a yellow sweater and rubber boots standing at the edge of a wide muddy brown flooded creek where a row of old flat stepping stones disappears under the rushing water, her shoulders slumped and her head down, behind her on a dirt road a farmer in a straw hat sitting on a wooden wagon full of hay pulled by one brown horse, gray overcast sky, autumn fields. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same young girl with light brown skin and a curly dark ponytail in a yellow sweater sitting beside a boy with light brown skin and short black curls in a red jacket, both smiling, in the top gondola of a tall ferris wheel covered in glowing warm lights at sunset, a wide valley of autumn fields and a small town with tiny lit windows spread out far below them, orange and purple sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-lunch-alone": "A young girl with dark skin and two braided pigtails wearing a purple hoodie sitting alone at the end of a long empty cafeteria table with a lunch tray, chin resting on one hand, other tables full of children far behind her, big windows. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-umbrella-rain": "The same young girl with dark skin and two braided pigtails in a purple hoodie holding a big blue umbrella over herself and a surprised boy with a shaved head in a green t-shirt beside a chain link fence on a wet grassy school field in pouring rain, dark rain clouds. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-lunch-together": "The same young girl with dark skin and two braided pigtails in a purple hoodie laughing at a cafeteria table as the same boy with a shaved head in a green t-shirt sets his lunch tray down across from her, both smiling, sunny windows behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const whyTheyDidIt: LessonDef = {
  id: "why-they-did-it",
  title: "Why They Did It",
  grade: "3rd Grade",
  standard: "RL.3.3",
  archetype: "story-elements",
  objective: "I can describe a character by her trait, her want, and her feeling, and explain how her action caused what happened next.",
  concepts: [
    "trait: what a character is like, shown by what she does again and again",
    "motivation: what a character wants, the reason behind a choice",
    "feeling: what a character feels at one moment, and it passes",
    "a trait lasts, a feeling passes",
    "cause chain: because she did this, that happened next",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You described Yara three ways. Her trait, shown by what she did again and again. Her want, the reason behind her choice. Her feeling, which changed from page to page. Then you traced her action to the event it caused. That is how a third grade reader explains why a character did it.",
    "title": "Three Lenses, One Person",
    "body": "You described a character by her trait, her want, and her feeling, and you explained how one action pushed the story forward."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Wheel at Sunset, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In third grade, describing a character means more than saying her name. You look at her through three lenses. What she is like. What she wants. What she feels. Then you explain how her actions push the story along. Here is page one of The Wheel at Sunset. Read along with me, and watch for what Yara wants." },
      interaction: { type: "read-along", text: "Yara had been dropping coins into a jam jar since June, because the harvest fair came to Millbrook only once a year. This year mattered more than any other, since her cousin Nico was moving to the city on Monday. \"We ride the great wheel together before I go,\" Nico had said on the phone, and Yara had promised.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-the-want",
      purpose: "model",
      gate: "none",
      prompt: "The want is the reason behind a choice.",
      fx: {"text":"What does she **want**?","effect":"underline"},
      narration: { audio: A("model-the-want"), script: "Here is the first lens, the want. Readers call it motivation. I ask, what does Yara want more than anything? Page one tells me. She wants to ride the great wheel with Nico before he moves away on Monday. That is her want, and it is why she saved coins since June. Keep that want in your pocket, because later in the story Yara makes a hard choice, and her want is the reason behind it." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: On Saturday morning, Yara skipped down the lane, until she found the footbridge over Cold Creek blocked by a fallen oak. She climbed onto the wet trunk to look across, but the far bank was too far to jump. So she turned upstream toward the old stone crossing, a whole mile away.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and count what Yara does when something gets in her way." },
      interaction: { type: "speak", text: "On Saturday morning Yara skipped down the lane until she found the footbridge over Cold Creek blocked by a fallen oak She climbed onto the wet trunk to look across but the far bank was too far to jump So she turned upstream toward the old stone crossing a whole mile away" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch Yara's body.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and notice what Yara's body does when she reaches the crossing." },
      interaction: { type: "read-along", text: "The stone crossing was gone under brown floodwater, and Yara's shoulders slumped. A farmer in a hay wagon shook his head when she asked for a ride, since his horse would not go near the flood. \"The road bridge is two more miles,\" he said, \"and the fair gates close at sunset.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "How did Yara feel when she saw the flooded crossing?",
      fx: {"text":"The stone crossing was gone under brown floodwater, and Yara's **shoulders slumped**.","effect":"glow"},
      narration: { audio: A("guided-choose-feeling"), script: "Here is the second lens, the feeling. A feeling belongs to one moment. Page three never says the feeling word. It shows the feeling with her body. Read the first sentence again, and think about what her shoulders are telling you. Four feeling words are on your screen. Tap the one that fits this moment." },
      interaction: { type: "choose", options: [{ id: "discouraged", label: "discouraged" }, { id: "excited", label: "excited" }, { id: "bored", label: "bored" }, { id: "relaxed", label: "relaxed" }], correctId: "discouraged", coachWrong: "Look at what her shoulders did. Shoulders that drop tell you a hope just sank. Which word matches that?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Yara did not turn back. She followed the creek past the pumpkin field and the dairy barn, counting fence posts to keep her tired legs moving. Her boots squelched with every step, and the coins clinked in her pocket.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud. Yara makes her hard choice on this page." },
      interaction: { type: "speak", text: "Yara did not turn back She followed the creek past the pumpkin field and the dairy barn counting fence posts to keep her tired legs moving Her boots squelched with every step and the coins clinked in her pocket" },
    },
    {
      id: "model-trait-from-actions",
      purpose: "model",
      gate: "none",
      prompt: "A trait shows in what she does again and again.",
      fx: {"text":"She did it **again** and **again**","effect":"pop-words"},
      narration: { audio: A("model-trait-from-actions"), script: "Now the third lens, the trait. A trait is what a person is like, and the story never hands it to you. You find it by counting what she does again and again. Watch me count. The oak blocked the bridge, and she climbed the trunk to look across. The bank was too far, and she walked a whole mile upstream. The crossing was flooded, and she asked the farmer for a ride. The farmer said no, and she followed the creek two more miles. One, two, three, four. When a person does the same kind of thing that many times, that is what she is like. A feeling passes in a moment. A trait lasts the whole story." },
    },
    {
      id: "guided-choose-trait",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word tells what Yara is like?",
      narration: { audio: A("guided-choose-trait"), script: "Your turn to name it. Think about all four things Yara did when something got in her way. Four trait words are on your screen, and only one of them is backed by what she did again and again. Tap that word." },
      interaction: { type: "choose", options: [{ id: "determined", label: "determined" }, { id: "careless", label: "careless" }, { id: "grumpy", label: "grumpy" }, { id: "shy", label: "shy" }], correctId: "determined", coachWrong: "Check that word against the story. Did Yara do that kind of thing again and again? Find the word her four actions prove." },
    },
    {
      id: "guided-choose-which-action",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which line from the story proves that trait?",
      narration: { audio: A("guided-choose-which-action"), script: "A trait is only worth saying if you can prove it. Four lines from the story are on your screen, and every one of them is really in the story. Only one shows what Yara is like. Tap the line that proves her trait." },
      interaction: { type: "choose", options: [{ id: "yara-did-not-turn-back", label: "yara did not turn back" }, { id: "her-shoulders-slumped", label: "her shoulders slumped" }, { id: "gates-close-at-sunset", label: "gates close at sunset" }, { id: "nico-was-waiting-at-the-gate", label: "nico was waiting at the gate" }], correctId: "yara-did-not-turn-back", coachWrong: "That line is in the story, but it tells about a feeling, a rule, or someone else. Find the line where Yara does something hard." },
    },
    {
      id: "guided-choose-motivation",
      purpose: "guided",
      gate: "interaction",
      prompt: "Why did Yara keep walking instead of going home?",
      fx: {"text":"Her **want** explains her **choice**","effect":"underline"},
      narration: { audio: A("guided-choose-motivation"), script: "Now take the want out of your pocket. On page four, Yara had a choice. She could turn around and walk home dry, or she could walk two more miles in wet boots. She kept walking. Why? Her want is the reason. Tap the reason behind her choice." },
      interaction: { type: "choose", options: [{ id: "to-ride-the-wheel-with-nico", label: "to ride the wheel with nico" }, { id: "to-see-the-flooded-creek", label: "to see the flooded creek" }, { id: "to-help-the-farmers-horse", label: "to help the farmer's horse" }, { id: "to-sell-her-jar-of-coins", label: "to sell her jar of coins" }], correctId: "to-ride-the-wheel-with-nico", coachWrong: "Go back to page one. What did Yara want more than anything, and what did she promise?" },
    },
    {
      id: "apply-sort-trait-feeling",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Trait, or Feeling?",
      narration: { audio: A("apply-sort-trait-feeling"), script: "Here are six things you could say about Yara. Some are traits, what she is like all through the story. Some are feelings, what she felt at one moment before it passed. Read each one. Ask, does this last, or does this pass? Drag the ones that last to Trait, and the ones that pass to Feeling." },
      interaction: { type: "sort", buckets: ["Trait","Feeling"], items: [{ label: "does not give up", bucket: "Trait" }, { label: "discouraged at the flood", bucket: "Feeling" }, { label: "plans months ahead", bucket: "Trait" }, { label: "excited on saturday morning", bucket: "Feeling" }, { label: "keeps her promises", bucket: "Trait" }, { label: "happy at the top", bucket: "Feeling" }], coachWrong: "Ask the question again. Would this still be true of Yara next week? Then it lasts. Does it belong to one moment in the story? Then it passes." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and watch for the word because. It tells you which action caused what." },
      interaction: { type: "read-along", text: "Because Yara kept walking, she reached the fairgrounds just as the lights on the great wheel blinked on. Nico was waiting at the gate with two tickets, grinning from ear to ear. \"I knew you would come,\" he said, and Yara laughed all the way to the top while the whole valley glowed below them.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-sequence-cause-chain",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the chain of events in story order.",
      narration: { audio: A("apply-sequence-cause-chain"), script: "In this story, one thing leads to the next like links in a chain. Something gets in Yara's way, she does something about it, and that leads to the next thing. Five links are on your screen, all mixed up. Drag them into the order the story tells them." },
      interaction: { type: "sequence", items: [{ id: "oak-blocks-bridge", label: "an oak blocks the bridge" }, { id: "walks-to-crossing", label: "she walks to the crossing" }, { id: "farmer-says-no", label: "the farmer says no" }, { id: "follows-the-creek", label: "she follows the creek" }, { id: "rides-the-wheel", label: "she rides the wheel" }], order: ["oak-blocks-bridge","walks-to-crossing","farmer-says-no","follows-the-creek","rides-the-wheel"], coachWrong: "Walk the story from the first page. What blocked her first, where did she go next, who did she ask, and what did she do after that?" },
    },
    {
      id: "apply-choose-because",
      purpose: "apply",
      gate: "interaction",
      prompt: "Because Yara followed the creek, what happened next?",
      fx: {"text":"**Because** she did this, **that** happened next","effect":"underline"},
      narration: { audio: A("apply-choose-because"), script: "Now say the chain the way a third grade reader says it. Because she did this, that happened next. Yara followed the creek for two more miles. Because of that action, what happened next? Four events are on your screen. Tap the one her walking caused." },
      interaction: { type: "choose", options: [{ id: "she-got-there-at-sunset", label: "she got there at sunset" }, { id: "the-farmer-drove-her-there", label: "the farmer drove her there" }, { id: "the-footbridge-got-fixed", label: "the footbridge got fixed" }, { id: "nico-rode-the-wheel-alone", label: "nico rode the wheel alone" }], correctId: "she-got-there-at-sunset", coachWrong: "Check page five. What does the story say happened because Yara kept walking?" },
    },
    {
      id: "challenge-speak-trait-and-proof",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What is Yara like? Say the trait, then the action that proves it.",
      narration: { audio: A("challenge-speak-trait-and-proof"), script: "Last one, and you say it out loud. Describe Yara with the third lens. Tap the mic. Say the word for what she is like, then say one thing she did that proves it. Start with, Yara is." },
      interaction: { type: "speak", text: "determined stubborn persistent tough strong brave keeps kept going walked walking walk followed creek miles farmer crossing bridge oak give gave up quit turn turned back climbed tried asked" },
    },
    {
      id: "celebrate-three-lenses",
      purpose: "celebrate",
      gate: "none",
      prompt: "Trait, want, feeling, and the chain.",
      fx: {"text":"**Trait**. **Want**. **Feeling**. Then the chain.","effect":"fireworks"},
      narration: { audio: A("celebrate-three-lenses"), script: "Today you described one person three ways. Her want explained her hardest choice. Her feeling changed from page to page. Her trait showed in what she did again and again, and you proved it with a line. Then you followed the chain, because she did this, that happened next. From now on, when someone asks why a character did it, you have the answer." },
    },
  ],
};
