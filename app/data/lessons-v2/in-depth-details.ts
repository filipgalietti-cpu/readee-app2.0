import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./in-depth-details-timings.json";

// In-Depth Details (RL.4.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=in-depth-details
// G4-U1. THE IN-DEPTH DESCRIPTION tier of RL.4.3 (sibling split: why-they-did-it
// RL.3.3 owns trait / motivation / feeling from repeated ACTIONS plus the cause
// chain and its Trait / Feeling sort, so no trait tile and no cause chain here;
// text-says-so-i-know RL.4.1 owns evidence-to-INFERENCE, so every product here
// is a DESCRIPTION, never an inference; theme-and-summary RL.4.2 (parallel
// producer) untouched; what-the-picture-adds RL.3.7 owns pictures). THIS lesson
// owns: shallow (one word) vs in depth (a claim standing on specific details of
// DIFFERENT kinds, each from the text); the three kinds for a character
// (thoughts, marked by thought / wondered / realized; words, in quotation marks
// or with said / told / asked; actions, what a body did) and telling them apart;
// the claim three details build; a SETTING built from what is seen, heard, and
// felt, with BEST evidence for a feel claim among four true details; an EVENT
// built from what led in, what happened, and what changed; leaving out a true
// detail that belongs to a different description; and PRODUCING a several-
// sentence description (claim + two details of different kinds) out loud.
// ONE original story, "The Far Platform": Imogen at summer camp, who told
// everyone she was not afraid of the zipline until she stood on the platform;
// 20 sentences over 7 child-read pages in real paragraphs (read-along 1/3/5/7
// with ref-chained images, accept-mode speaks 2/4/6 at 41/49/41 tokens, no
// " my " token, "the guide" on speak pages so no "Ms." token reaches Speak),
// complex sentences with relative pronouns (which was true until, the guide who
// had clipped forty campers, which meant), past perfect + progressive, action-
// beat dialogue ("The harness does the holding," she said, tugging the straps),
// stretch words harness / trolley (defined in the clause) / hollow / sawdust /
// coiling, no digits, no contractions in read-along or speak text. PLANTED:
// thoughts on pages 2 (nobody would say a word), 3 (had all forty felt their
// knees go hollow), 5 (realized she had done it) and 7; words on pages 1 (told
// everyone), 4 (said she was ready), 6 (asked for a second turn); actions on 1,
// 4, 5, 6, 7. SETTING = the far platform from sight (gray boards, swaying tops,
// the cable out of sight), sound (quiet enough to hear her breath, the cable
// hummed like a plucked string) and feel (the whole platform leaned, the hum in
// the boards under her feet). EVENT = the jump: led in (clipped to the cable,
// the count), happened (stepped off, the harness caught), changed (she knew she
// had done it; second turn; Ezekiel second in line). ANCHOR FRESHNESS grep-
// swept vs every lessons-v2 + quizzes-v2 file: zipline, ropes course, treetop,
// carabiner, summer camp, pines, Imogen, Ezekiel, Farrow all 0 hits (harness =
// 2 prose hits in prove-it, platform = prose only, camp = the common word);
// violin / recital (show-me-where), bus stop, sleepover, ferris wheel, chess,
// pigeons, ships in bottles found burned and avoided. Keys prefixed quiz- are
// picture supports for the quiz's fresh second story, "Between Floors"
// (Bettina, cousin Rafael, Aunt Ophelia, Mr. Pemberton the super: all 0 hits).

const A = (id: string) => `/audio/lessons-v2/in-depth-details/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/in-depth-details/${w.toLowerCase()}.png`;

export const inDepthDetailsImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A wooden zipline platform built high around the trunk of a tall pine tree, a square of plain gray boards with a simple wooden rail, a ten year old girl with pale freckled skin and short red hair under a plain blue climbing helmet, wearing a plain green t-shirt, dark shorts, and brown hiking boots, standing alone on the platform holding the rail with both hands and looking down, no harness on her, a thick steel cable running from a wooden post beside her down through the branches and out of sight, the tops of other pine trees swaying far below the platform, a wooden ladder nailed to the trunk, bright summer sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no other people, plain t-shirt with no logo, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same wooden zipline platform high in the same pine tree, the same ten year old girl with pale freckled skin, short red hair, a plain blue climbing helmet, a plain green t-shirt, dark shorts, and brown hiking boots standing on the platform now wearing a black climbing harness with straps around her waist and legs, and a tall woman with dark brown skin, long gray braids, a plain tan vest over a white shirt, and a plain red climbing helmet kneeling beside her pulling one harness strap tight with both hands, the thick steel cable running from the wooden post beside them down through the branches, swaying pine treetops far below, bright summer sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain vest with no badges, plain t-shirt with no logo, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same ten year old girl with pale freckled skin, short red hair, a plain blue climbing helmet, a plain green t-shirt, dark shorts, and brown hiking boots flying along a thick steel zipline cable high above a forest of tall pine trees, hanging by her black harness from a small metal wheel on the cable, her mouth open in a shout, both hands gripping the strap at her chest, her boots dangling, pine treetops rushing past below her, the wooden platform a tiny gray square far behind her on a distant trunk, bright summer sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain t-shirt with no logo, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-7": { subject: "The bottom of a zipline in a sunny pine forest, a wide patch of pale sawdust on the ground where the thick steel cable ends at a low wooden post, the same ten year old girl with pale freckled skin, short red hair, a plain blue climbing helmet, a plain green t-shirt, dark shorts, and brown hiking boots walking away up a dirt path toward a wooden ladder on a distant pine trunk, a taller boy with pale freckled skin, short red hair, a plain orange climbing helmet, and a plain gray t-shirt standing on the sawdust behind her with his hands on his hips looking after her, and the same tall woman with dark brown skin, long gray braids, a plain tan vest, and a plain red helmet coiling a black strap over one arm. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain shirts with no logos, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-elevator-dim": "The inside of a small old elevator lit only by one dim yellow ceiling light, plain metal walls with one wall a tall mirror, a ten year old girl with light brown skin and long black hair in a single braid wearing a plain yellow jacket standing with four brown paper grocery bags at her feet, and a ten year old boy with light brown skin and short curly black hair in a plain blue hoodie sitting on the floor with his back against the wall and his knees pulled up to his chest, the elevator doors closed, no button panel anywhere in view. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain paper bags with no logos, no buttons, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-red-button": { subject: "The same dim old elevator, a close view of the same ten year old girl with light brown skin, a long black braid, and a plain yellow jacket pressing her thumb firmly against one large plain round red button set alone in a smooth plain metal wall panel that has absolutely no other buttons, no numbers, no letters, and no markings, a small round metal speaker grille above the button, the same boy with light brown skin, short curly black hair, and a plain blue hoodie sitting on the floor behind her with his knees pulled up, brown paper grocery bags on the floor. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, only one button on the panel, no numbers, no letters, no words, no signs, no writing anywhere.", ref: "quiz-elevator-dim" },
  "quiz-doors-open": { subject: "The same old elevator seen from inside with its doors now open, the floor of a bright hallway sitting about a foot higher than the elevator floor so that a strip of hallway wall shows in the gap, a middle aged man with pale skin, a gray mustache, and plain dark blue work overalls crouching in the hallway doorway reaching one hand down, his heavy brown work boots at the level of the children's chests, the same girl with light brown skin, a long black braid, and a plain yellow jacket handing up a brown paper grocery bag, the same boy with light brown skin, short curly black hair, and a plain blue hoodie standing beside her, more brown paper grocery bags on the elevator floor. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain overalls with no patches, plain paper bags with no logos, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-elevator-dim" }
};

export const inDepthDetails: LessonDef = {
  id: "in-depth-details",
  title: "In-Depth Details",
  grade: "4th Grade",
  standard: "RL.4.3",
  archetype: "story-elements",
  objective: "I can describe a character, a setting, or an event in depth, with a claim and specific details of different kinds from the text.",
  concepts: [
    "in depth means a claim standing on specific details from the text, not one word",
    "a character is built from thoughts, words, and actions",
    "a setting is built from what is seen, what is heard, and what is felt",
    "an event is built from what led in, what happened, and what it changed",
    "the best evidence is the detail that shows the claim, not just a true detail",
    "a true detail that belongs to a different description gets left out",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Far Platform and described Imogen, the platform, and the jump in depth. Every description started with a claim and stood on details of different kinds, her thoughts, her words, and her actions, and you left out the true detail that belonged somewhere else. That is how fourth grade readers describe.",
    "title": "A Claim, Then Three Kinds of Detail",
    "body": "You described a character, a setting, and an event in depth, with a claim and specific details of different kinds from the text."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Far Platform, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In fourth grade, describing a character is not one word. It is a full picture built from the specific details the text gives, and a setting or an event gets the same treatment. Here is page one of The Far Platform. Read along with me, and notice how much the page tells you about the place where Imogen is standing." },
      interaction: { type: "read-along", text: "Imogen had told everyone at camp that she was not afraid of the zipline, which was true until she climbed the ladder and stood on the far platform. The platform was a square of gray boards nailed around the trunk of a pine, so high that the tops of the other trees swayed below her boots. A steel cable, thick as her thumb, ran from a post beside her down through the branches and out of sight, and every time the wind pushed the pine, the whole platform leaned with it.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-claim-and-three-kinds",
      purpose: "model",
      gate: "none",
      prompt: "A claim, then three kinds of detail.",
      fx: {"text":"A **claim**, then **three kinds** of detail","effect":"pop-words"},
      narration: { audio: A("model-claim-and-three-kinds"), script: "Here is the difference between a shallow description and an in-depth one. Shallow is one word. Imogen is brave. That is a claim with nothing under it. In depth means the claim plus specific details from the text, and the details come in three kinds. A thought is what she thinks inside her head, and the story marks it with words like thought, wondered, or realized. Her words are what she says out loud, either inside quotation marks or with said, told, or asked. An action is what her body does. Page one already gives me two of the three. Her words, because she told everyone at camp that she was not afraid. Her action, because she climbed the ladder anyway and stood on the far platform. When page two gives me a thought, I will have all three kinds, and then my claim has something to stand on. Claim first, then details of different kinds, each one from the text. That shape is the whole lesson." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Her brother Ezekiel had gone first, and his shout had faded into the trees. Now the platform was so quiet that Imogen could hear her own breath. She thought that if she climbed back down, nobody would say a word.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and hold on to what Imogen thinks while she stands there." },
      interaction: { type: "speak", text: "Her brother Ezekiel had gone first and his shout had faded into the trees Now the platform was so quiet that Imogen could hear her own breath She thought that if she climbed back down nobody would say a word" },
    },
    {
      id: "guided-choose-which-is-thought",
      purpose: "guided",
      gate: "interaction",
      prompt: "Four details from pages one and two. Tap the thought.",
      narration: { audio: A("guided-choose-which-is-thought"), script: "Your turn to tell the three kinds apart. Four details from pages one and two are on your screen. One of them is a thought, something that happened inside Imogen's head. One is her words, something she said out loud. One is an action, something her body did. And one is not about Imogen at all, because it describes the platform. Tap the thought." },
      interaction: { type: "choose", options: [{ id: "nobody-would-say-a-word", label: "nobody would say a word" }, { id: "not-afraid-of-the-zipline", label: "not afraid of the zipline" }, { id: "climbed-the-ladder", label: "climbed the ladder" }, { id: "the-platform-leaned", label: "the platform leaned" }], correctId: "nobody-would-say-a-word", coachWrong: "That detail was said out loud, or a body did it, or it describes the place. A thought lives inside her head, and page two marks it with the word thought." },
    },
    {
      id: "guided-choose-the-claim",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which claim do the three details build?",
      narration: { audio: A("guided-choose-the-claim"), script: "Now the claim. Here are three details about Imogen, one of each kind, all from pages one and two. Her words. She told everyone at camp that she was not afraid. Her action. She climbed the ladder and stood on the far platform anyway. Her thought. Standing there, she thought that if she climbed back down, nobody would say a word. Put those three side by side and they build one claim about her. Four claims are on your screen. Tap the one those three details support." },
      interaction: { type: "choose", options: [{ id: "afraid-but-she-keeps-going", label: "afraid but she keeps going" }, { id: "calm-and-never-afraid", label: "calm and never afraid" }, { id: "afraid-and-turning-back", label: "afraid and turning back" }, { id: "angry-at-her-brother", label: "angry at her brother" }], correctId: "afraid-but-she-keeps-going", coachWrong: "Test that claim against all three details. Her words say one thing, her thought says another, and her action settles it. Find the claim that fits all three." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and listen for the cable.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and notice what the platform sounds like and what it feels like under her feet." },
      interaction: { type: "read-along", text: "Ms. Farrow, the guide who had clipped forty campers to that cable since June, buckled the harness around Imogen's legs and waist and pulled each strap until it bit. \"The harness does the holding,\" she said, tugging the straps one more time, \"and your job is only to step.\" Far below, the cable hummed in the wind like a plucked string, the sound climbing up through the post into the boards under Imogen's feet, and she wondered whether all forty of those campers had felt their knees go hollow.", audio: A("page-3-read-sentence") },
    },
    {
      id: "apply-sort-thought-words-action",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Thought, Words, or Action?",
      narration: { audio: A("apply-sort-thought-words-action"), script: "Six details from pages one, two, and three are on your screen, and some of them belong to Ms. Farrow rather than Imogen, because the three kinds work the same for anyone. Ask where each detail lives. If it lived inside someone's head, drag it to Thought. If it was said out loud, drag it to Words. If a body did it, drag it to Action." },
      interaction: { type: "sort", buckets: ["Thought","Words","Action"], items: [{ label: "the others felt hollow too", bucket: "Thought" }, { label: "she said she was not afraid", bucket: "Words" }, { label: "stood on the far platform", bucket: "Action" }, { label: "she could climb back down", bucket: "Thought" }, { label: "your job is only to step", bucket: "Words" }, { label: "buckled the harness on her", bucket: "Action" }], coachWrong: "Ask where that detail lives. Inside a head is a thought, out loud is words, and something a body did is an action." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: The guide hooked the trolley, the small wheel that rides the cable, into place and clipped the harness to it with a click. Imogen gripped the strap at her chest with both hands and did not look down. Then she said, in a voice that surprised her, that she was ready.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to what Imogen does with her hands before she speaks." },
      interaction: { type: "speak", text: "The guide hooked the trolley the small wheel that rides the cable into place and clipped the harness to it with a click Imogen gripped the strap at her chest with both hands and did not look down Then she said in a voice that surprised her that she was ready" },
    },
    {
      id: "guided-choose-best-setting-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "The platform felt unsteady. Which detail is the best evidence?",
      narration: { audio: A("guided-choose-best-setting-evidence"), script: "A setting gets the same depth as a character, and its three kinds are what is seen, what is heard, and what is felt. Pages one and three build the far platform from all three. Here is my claim about it. The platform felt unsteady. Four details from those pages are on your screen, and every one of them is true. Most of them tell you what the place looked like or sounded like. One of them tells you what the place did under her boots, and that one is the best evidence for my claim. Tap the best evidence." },
      interaction: { type: "choose", options: [{ id: "the-whole-platform-leaned", label: "the whole platform leaned" }, { id: "the-boards-were-gray", label: "the boards were gray" }, { id: "the-cable-ran-out-of-sight", label: "the cable ran out of sight" }, { id: "the-platform-was-quiet", label: "the platform was quiet" }], correctId: "the-whole-platform-leaned", coachWrong: "That detail is true, but it tells what the platform looked like or sounded like. Which detail tells what it did under her feet?" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five. Read along, and watch the count.",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Page five. Read along with me, and notice what Imogen realizes while she is still in the air." },
      interaction: { type: "read-along", text: "\"Three, two, one,\" Ms. Farrow counted, and on one Imogen stepped off the edge into nothing. For half a breath there was only the harness catching her and the pines rushing up, and then the trolley began to sing on the cable and the wind pulled the shout right out of her. The far platform shrank behind her to a gray dot, which meant, she realized while she was still flying, that she had done it.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-sequence-the-jump",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the three parts of the jump in order.",
      narration: { audio: A("apply-sequence-the-jump"), script: "An event gets depth too, and its three parts are what led in, what happened, and what it changed. Pages four and five hold the jump. Three moments from it are on your screen, mixed up. Drag them into order. First the moment that led in, then the moment it happened, then the moment that shows what changed." },
      interaction: { type: "sequence", items: [{ id: "clipped-to-the-cable", label: "she is clipped to the cable" }, { id: "steps-off-the-edge", label: "she steps off the edge" }, { id: "knows-she-has-done-it", label: "she knows she has done it" }], order: ["clipped-to-the-cable","steps-off-the-edge","knows-she-has-done-it"], coachWrong: "Walk the jump from page four. What had to happen before she could go, what did she do at the count of one, and what did she realize while she was still flying?" },
    },
    {
      id: "page-6-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page six: Her boots hit the sawdust at the bottom, and Ezekiel pounded her on the back. Imogen unclipped the harness herself and looked back up the hill at the platform. Then she asked the guide whether the line for a second turn started here.",
      narration: { audio: A("page-6-read"), script: "Page six is yours. Read all three sentences out loud, and hold on to what Imogen asks at the bottom." },
      interaction: { type: "speak", text: "Her boots hit the sawdust at the bottom and Ezekiel pounded her on the back Imogen unclipped the harness herself and looked back up the hill at the platform Then she asked the guide whether the line for a second turn started here" },
    },
    {
      id: "apply-choose-does-not-belong",
      purpose: "apply",
      gate: "interaction",
      prompt: "She does the frightening thing anyway. Which detail does not belong?",
      narration: { audio: A("apply-choose-does-not-belong"), script: "One more move before you describe her yourself. A good description only uses the details that belong to it. Here is a description of Imogen. She does the frightening thing anyway. Four details from the story are on your screen, and all four are true. Three of them belong to that description, because they show her doing the frightening thing. One of them is true, but it belongs to a different description. Tap the detail that does not belong." },
      interaction: { type: "choose", options: [{ id: "ezekiel-went-down-first", label: "ezekiel went down first" }, { id: "she-said-she-was-ready", label: "she said she was ready" }, { id: "she-stepped-off-the-edge", label: "she stepped off the edge" }, { id: "she-asked-for-another-turn", label: "she asked for another turn" }], correctId: "ezekiel-went-down-first", coachWrong: "That detail shows Imogen doing the frightening thing, so it belongs. Find the detail that describes someone else." },
    },
    {
      id: "page-7-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page seven, the ending. Read along!",
      image: IMG("page-7"),
      narration: { audio: A("page-7-read"), script: "Here is the last page. Read along with me, and notice what Imogen is thinking about now." },
      interaction: { type: "read-along", text: "\"The line starts wherever you are standing,\" Ms. Farrow said, coiling the strap over her arm, and Imogen was already walking toward the ladder. This time she was thinking about the hum of the cable and the way the pines had rushed up to meet her, and Ezekiel, who had been first all summer, found himself second in line.", audio: A("page-7-read-sentence") },
    },
    {
      id: "challenge-speak-describe-imogen",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Describe Imogen in depth: a claim, then two details of different kinds.",
      narration: { audio: A("challenge-speak-describe-imogen"), script: "Last one, and you build the whole description out loud. Tap the mic. Start with a claim about Imogen, one sentence that says what she is like. Then give two details of different kinds from the story, a thought and an action, or her words and an action. Say each detail the way the text gives it." },
      interaction: { type: "speak", text: "afraid scared frightened nervous brave determined anyway keeps going kept stepped step off edge ready said told thought wondered realized climb climbed down nobody word harness cable strap gripped hands looked second turn again ladder hollow knees unclipped walking first line stubborn proud bold done" },
    },
    {
      id: "celebrate-in-depth-details",
      purpose: "celebrate",
      gate: "none",
      prompt: "A claim, then three kinds of detail.",
      fx: {"text":"A **claim**, then **three kinds** of detail","effect":"fireworks"},
      narration: { audio: A("celebrate-in-depth-details"), script: "Today no description was one word. You started with a claim and stood it on specific details of different kinds, a thought, her words, an action. You built a setting from what was seen, heard, and felt, and an event from what led in, what happened, and what changed. When a true detail belonged to a different description, you left it out. From now on, that is how you describe. A claim, then three kinds of detail." },
    },
  ],
};
