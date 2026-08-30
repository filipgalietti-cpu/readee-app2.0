import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-whole-story-timings.json";

// The Whole Story (RL.2.10) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-whole-story
// G2 CAPSTONE: one longer original story, "The Whistle" (12 sentences over 5
// child-facing pages): Miguel wants to whistle like Grandpa so Bess the
// sheepdog will come; all summer only plain air comes out; when the gate
// swings open and the sheep scatter, his whistle finally flies. No new skill:
// each check exercises ONE toolbox tool from the unit (story shape RL.2.5,
// feelings/POV RL.2.6, pictures plus words RL.2.7, word clues from context).
// Stretch words supported by context: puckered, scattered, streaked.
// Keys prefixed quiz- are fresh stimuli for the quiz (same dir, same pipeline).

const A = (id: string) => `/audio/lessons-v2/the-whole-story/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-whole-story/${w.toLowerCase()}.png`;

export const theWholeStoryImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young boy with short black hair, light brown skin, a red t-shirt and blue jeans standing at a wooden fence blowing hard with puffed cheeks and squeezed eyes, nothing coming from his lips, a wide green summer meadow behind him, and far away a smiling grandfather in a straw hat and blue overalls whistling with two fingers at his lips while a black-and-white sheepdog races toward the grandfather past grazing white sheep. No letters, no words, no numbers, no writing anywhere.",
  "page-2": { subject: "The same young boy with short black hair, red t-shirt and blue jeans standing at a closed wooden gate in soft morning light with slumped shoulders and a glum face, one hand dropping down from his lips, while the same black-and-white sheepdog lies in the grass a few steps away with her head resting flat on her front paws and exactly one ear standing straight up, white sheep grazing on the green hill behind them", ref: "page-1" },
  "page-3": { subject: "The same wooden gate now swung wide open with a big woolly white sheep leaning its shoulder right against the wooden gate latch, a scattered stream of other white sheep running loose down the green hill in different directions toward a small sparkling creek at the bottom, and the same black-and-white sheepdog standing stiff and alert between them, head turned back toward a red barn up on the hilltop", ref: "page-2" },
  "page-4": { subject: "A close view of the same young boy with short black hair and red t-shirt giving his biggest try: eyes squeezed shut, cheeks puffed out huge and round, lips puckered hard, fists clenched tight at his sides, while small blurry white sheep stream down the green hill far behind him under a hot blue summer sky", ref: "page-3" },
  "page-5": { subject: "The same black-and-white sheepdog racing low and fast down the green hill, sweeping the last white sheep back through the open wooden gate, while the same young boy with short black hair and red t-shirt throws both arms high in the air with a huge smile, and the grandfather in the straw hat and blue overalls laughs holding his belly beside the red barn", ref: "page-4" },
  "quiz-cat-shelf": "A small grey cat leaping up the side of a tall wooden bookcase toward a bright red ball sitting alone on the top shelf, one front paw stretched way up, plain colored book spines with no markings on the lower shelves, cozy living room background. No letters, no words, no numbers, no writing anywhere.",
  "quiz-gwen-sprout": "A little girl with curly red hair in green overalls cheering with both arms up beside a small clay flower pot, one tiny bright green sprout with two round leaves poking out of the dark soil, a small silver watering can sitting beside the pot on a sunny table. No letters, no words, no numbers, no writing anywhere.",
  "quiz-suvi-asleep": "A young girl with a dark ponytail fast asleep at a warm dinner table, her cheek resting on her folded arm right beside a full plate of food, a small hiking backpack still on her back, cozy evening kitchen light. No letters, no words, no numbers, no writing anywhere.",
  "quiz-bram-boot": "A father with rolled-up sleeves pulling a small blue rain boot out of a thick brown mud puddle, leaning back hard with the boot just popping free with flying mud drops, while a laughing young boy sits on the green grass holding up one completely bare pink foot with wiggling toes, his other foot wearing a blue rain boot, no other footwear in the scene. No letters, no words, no numbers, no writing anywhere."
};

export const theWholeStory: LessonDef = {
  id: "the-whole-story",
  title: "The Whole Story",
  grade: "2nd Grade",
  standard: "RL.2.10",
  archetype: "story-elements",
  objective: "I can read a longer story and understand it using all my reading tools.",
  concepts: ["read a full story","story shape check","feelings from clues","pictures plus words","word clues from context","retell the whole story"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Whistle from the first page to the last, and you understood all of it. Story shape found the want and the turn. The clues told you how Miguel felt. The pictures showed you who pushed the latch, and the story itself taught you what scattered means. That is what strong readers do with every book: they read the whole story, and they use every tool they own.",
    "title": "You Read the Whole Story!",
    "body": "You read a real chapter story and understood it with every reading tool you own."
  },
  scenes: [
    {
      id: "hook-a-real-chapter",
      purpose: "hook",
      gate: "none",
      prompt: "Today you read a whole story with every tool you own.",
      fx: {"text":"**Every** tool. **One** big story.","effect":"pop-words"},
      narration: { audio: A("hook-a-real-chapter"), script: "Hello, reader! All year you have been collecting reading tools: story shape, feeling clues, pictures plus words, and word clues. Today there is no new tool. Today you get a longer story, a real chapter, and you use every tool you own on it. The story is called The Whistle. First, a quick warm up." },
    },
    {
      id: "model-warm-up",
      purpose: "model",
      gate: "none",
      prompt: "Watch me warm up my tools on a tiny story.",
      fx: {"text":"Warm up **every** tool","effect":"underline"},
      narration: { audio: A("model-warm-up"), script: "Watch me warm up on a tiny story. Lea gripped the rope swing and looked down at the flashing river. Tool one, story shape: that beginning introduces a character and what she is doing. Tool two, word clues: maybe gripped is new to me, but Lea is hanging over a river, so gripped must mean held on tight. See that? The tools work on any story. Now for the real one." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The Whistle, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("page-1-read"), script: "Here is The Whistle, page one. Read along with me, and keep your tools ready." },
      interaction: { type: "read-along", text: "All summer, Miguel tried to whistle the way Grandpa did. Grandpa's whistle could sail across the whole meadow, and Bess the sheepdog would come running. But when Miguel puckered his lips and blew, only a puff of plain air came out.", audio: A("page-1-read-sentence") },
    },
    {
      id: "check-beginning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What did the beginning introduce?",
      narration: { audio: A("check-beginning"), script: "Tool one, story shape. A beginning introduces a character and what that character wants. Think about page one of The Whistle. What did this beginning introduce? Tap it." },
      interaction: { type: "choose", options: [{ id: "a-boy-who-wants-to-whistle", label: "a boy who wants to whistle" }, { id: "a-dog-who-wants-a-bone", label: "a dog who wants a bone" }, { id: "a-grandpa-who-wants-a-nap", label: "a grandpa who wants a nap" }, { id: "a-sheep-who-wants-a-friend", label: "a sheep who wants a friend" }], correctId: "a-boy-who-wants-to-whistle", coachWrong: "Think about who page one follows the most. Whose try did we watch at the end of the page, and what was that try for?" },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Every morning, Miguel practiced by the gate. Bess watched him with one ear up, but she never came running.",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Page two belongs to you. Read it out loud, nice and clear." },
      interaction: { type: "speak", text: "Every morning Miguel practiced by the gate Bess watched him with one ear up but she never came running" },
    },
    {
      id: "check-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "The words never name Miguel's feeling. What was it?",
      image: IMG("page-2"),
      narration: { audio: A("check-feeling"), script: "Tool two, feeling clues. The words tell what happened: Miguel practiced every single morning, and Bess never came. But they never name his feeling. Gather the clues, and check his shoulders in the picture too. How did Miguel feel? Tap the feeling." },
      interaction: { type: "choose", options: [{ id: "disappointed", label: "disappointed" }, { id: "proud", label: "proud" }, { id: "scared", label: "scared" }, { id: "sleepy", label: "sleepy" }], correctId: "disappointed", coachWrong: "Walk the clues one more time. He worked at it every morning, and every morning nothing changed. Which feeling fits trying hard and not getting there yet?" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch the picture!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Something is about to change. Page three, read along with me, and keep one eye on the picture." },
      interaction: { type: "read-along", text: "One hot afternoon, Grandpa was up in the barn when the gate swung open, and the sheep scattered down the hill toward the creek. Bess looked at the sheep, then at the barn, then back again.", audio: A("page-3-read-sentence") },
    },
    {
      id: "check-word-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "The sheep scattered. What does scattered mean?",
      narration: { audio: A("check-word-clue"), script: "Tool three, word clues. Page three said the sheep scattered down the hill. If scattered is new to you, use the story around it: the gate swung open, the sheep got loose, and Bess did not know where to look first. What does scattered mean? Tap it." },
      interaction: { type: "choose", options: [{ id: "ran-off-in-all-directions", label: "ran off in all directions" }, { id: "walked-in-one-neat-line", label: "walked in one neat line" }, { id: "fell-fast-asleep", label: "fell fast asleep" }, { id: "hid-inside-the-barn", label: "hid inside the barn" }], correctId: "ran-off-in-all-directions", coachWrong: "Picture it: the gate is open and the sheep are loose, and Bess cannot watch them all at once. Which meaning makes that true?" },
    },
    {
      id: "check-picture-clue",
      purpose: "apply",
      gate: "interaction",
      prompt: "How did the gate swing open? Only the picture knows.",
      image: IMG("page-3"),
      narration: { audio: A("check-picture-clue"), script: "Tool four, pictures plus words. The words say the gate swung open, but they never say how. The picture caught it. Look closely at the gate in the picture. What made it swing open? Tap it." },
      interaction: { type: "choose", options: [{ id: "a-sheep-pushed-the-latch", label: "a sheep pushed the latch" }, { id: "the-wind-blew-it-open", label: "the wind blew it open" }, { id: "grandpa-left-it-open", label: "grandpa left it open" }, { id: "bess-jumped-against-it", label: "bess jumped against it" }], correctId: "a-sheep-pushed-the-latch", coachWrong: "Look right at the gate latch in the picture. Who is leaning closest to it?" },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Miguel took a deep breath. He puckered his lips and blew with all his heart.",
      image: IMG("page-4"),
      narration: { audio: A("page-4-read"), script: "The big moment belongs to you. Page four, out loud, with feeling." },
      interaction: { type: "speak", text: "Miguel took a deep breath He puckered his lips and blew with all his heart" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here comes the turn. Page five, the ending. Read along with me." },
      interaction: { type: "read-along", text: "A whistle, high and clear, sailed across the meadow. Bess streaked down the hill and swept the sheep back through the gate. Grandpa's laugh boomed like a drum, and Bess licked Miguel's chin.", audio: A("page-5-read-sentence") },
    },
    {
      id: "sort-beginning-ending",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Beginning, or Ending?",
      narration: { audio: A("sort-beginning-ending"), script: "Story shape, one more time. A beginning introduces the problem, and an ending concludes it. Here are six moments from The Whistle. Drag each one to the part of the story where it lives." },
      interaction: { type: "sort", buckets: ["Beginning","Ending"], items: [{ label: "only plain air came out", bucket: "Beginning" }, { label: "a high clear whistle sailed", bucket: "Ending" }, { label: "bess never came running", bucket: "Beginning" }, { label: "the sheep came back safe", bucket: "Ending" }, { label: "miguel practiced by the gate", bucket: "Beginning" }, { label: "bess licked miguel's chin", bucket: "Ending" }], coachWrong: "Ask when that moment happened. Was Miguel still trying and trying, or had everything just turned out right?" },
    },
    {
      id: "retell-whistle",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell The Whistle in story order.",
      narration: { audio: A("retell-whistle"), script: "Retell time. Here are four story cards from The Whistle, all mixed up. Think about how the story began, what went wrong, and how it turned. Tap the cards in story order." },
      interaction: { type: "sequence", items: [{ id: "miguel-blows-plain-air", label: "miguel blows plain air", image: IMG("page-1") }, { id: "the-gate-swings-open", label: "the gate swings open", image: IMG("page-3") }, { id: "miguels-biggest-blow", label: "miguel's biggest blow", image: IMG("page-4") }, { id: "bess-brings-the-sheep-home", label: "bess brings the sheep home", image: IMG("page-5") }], order: ["miguel-blows-plain-air","the-gate-swings-open","miguels-biggest-blow","bess-brings-the-sheep-home"], coachWrong: "Start back at the beginning of summer, when the whistle was only a puff of air. Then follow the trouble at the gate, step by step." },
    },
    {
      id: "speak-the-ending",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say it: how did The Whistle end?",
      narration: { audio: A("speak-the-ending"), script: "Now tell it like a storyteller. Think about the last page of The Whistle. Tell me how the story ended, in your own words." },
      interaction: { type: "speak", text: "whistle whistled whistling bess sheep gate home safe back grandpa laughed boomed meadow clear swept licked" },
    },
    {
      id: "challenge-ravi-bird",
      purpose: "challenge",
      gate: "interaction",
      prompt: "A brand new story, just for your ears.",
      narration: { audio: A("challenge-ravi-bird"), script: "Last challenge, and this story is only for your ears, so listen with everything you have. All winter, Ravi pressed seeds into the snow on his windowsill for one little brown bird. Some mornings his fingers ached with cold, but the seeds were always there. When spring finally came, the bird did not fly away to the deep woods. It built its nest in the tree right beside Ravi's window. The words never say why the bird stayed. Gather clues from the whole story, beginning to end, before you answer. Why did the bird build its nest there? Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-bird-felt-safe-with-ravi", label: "the bird felt safe with ravi" }, { id: "it-was-too-tired-to-fly", label: "it was too tired to fly" }, { id: "the-deep-woods-were-too-far", label: "the deep woods were too far" }, { id: "it-liked-snow-on-the-sill", label: "it liked snow on the sill" }], correctId: "the-bird-felt-safe-with-ravi", coachWrong: "Use every clue: seeds every single morning, all winter long, even when Ravi's fingers ached. What would the bird learn to expect at that window?" },
    },
    {
      id: "celebrate-real-reader",
      purpose: "celebrate",
      gate: "none",
      prompt: "You read the whole story!",
      fx: {"text":"**Every** tool. **One** big story.","effect":"fireworks"},
      narration: { audio: A("celebrate-real-reader"), script: "You did it! You read The Whistle from cover to cover, a real chapter, and every tool showed up for work. Story shape found the want and the turn. The clues told you Miguel felt disappointed. The pictures showed you the sheep at the latch, and the story taught you scattered all by itself. That is reading the whole story. You are ready for any book that comes your way." },
    },
  ],
};
