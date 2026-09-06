import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./parts-that-build-timings.json";

// Parts That Build (RL.3.5) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=parts-that-build
// G3-U2. PART TERMS + THE BUILD BETWEEN SUCCESSIVE PARTS tier of RL.3.5
// (sibling split: story-shape RL.2.5 owns the G2 beginning-introduces /
// ending-concludes shape; story-kinds + story-poem-party own K-1 kinds of
// texts and poems; book-basics + parts-of-a-book own K-1 print parts;
// word-music RL.2.4 owns rhythm and rhyme in a poem; follow-the-message
// RL.3.2 owns the recount; why-they-did-it RL.3.3 owns the cause chain of a
// character's actions). THIS lesson owns the part TERMS, chapter for a story,
// stanza for a poem, scene for a play, pointing to a part with its term and
// its number ("in chapter two", "in stanza one"), and describing how each
// successive part BUILDS on the one before it: chapter two only makes sense
// because chapter one set something up, stanza two turns what stanza one
// said, scene two answers what scene one left open. ONE world in three forms:
// "The Scarecrow's Hat" (Thea and Uncle Ansel build a scarecrow and Thea
// gives it her yellow hat; a windstorm takes the hat and the crows come back;
// Thea gives up her birthday cap), told as a story in three short titled
// chapters, 15 sentences over 5 child-read pages (read-along 1/3/5 with
// images, speak 2/4), compound + early-complex sentences, four speech-tagged
// dialogue lines, stretch words respect / rattled / strutting / knitted with
// in-text support; then the same story as a two-stanza poem (four lines each,
// stanza two turns stanza one) and as a two-scene play (four lines each,
// speaker labels spoken by the narrator). ANCHOR FRESHNESS grep-swept vs
// every lessons-v2 + quizzes-v2 file: scarecrow, Thea, Ansel, sack head,
// coat on a stick, birthday cap, strutting, windstorm 0 hits (crows appear
// only as a one-line fable prop elsewhere; corn/barn/gate only props). Keys
// prefixed quiz- are picture supports for the quiz's fresh second world (The
// Music Box: Zuri, Teo, Great-Aunt Delphine, attic, locket, all 0 hits).

const A = (id: string) => `/audio/lessons-v2/parts-that-build/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/parts-that-build/${w.toLowerCase()}.png`;

export const partsThatBuildImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A girl with dark brown skin and short black curly hair tied up in two small puffs, wearing orange overalls over a white shirt, standing in a field of short green young corn plants beside a tall man with dark brown skin, a short gray beard, and a blue denim jacket, the two of them tying an old brown coat onto a cross made of two wooden poles topped with a plain brown burlap sack head stuffed with straw and no face, the girl reaching up to set a floppy yellow sun hat on the sack head, three black crows circling high in a bright blue sky, a red barn far in the background, sunny morning. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no face on the scarecrow, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same scarecrow made of two wooden poles, an old brown coat, and a plain brown burlap sack head with no face and no hat, standing in a field of young corn plants bent flat against the muddy ground after a storm, a dozen black crows walking boldly between the rows of corn and one crow perched on the scarecrow's shoulder, the same girl with dark brown skin, two small hair puffs, and orange overalls standing at a wooden gate with both hands on her head, the red barn behind her, a gray morning sky clearing to blue. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no face on the scarecrow, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same girl with dark brown skin, two small hair puffs, and orange overalls standing on tiptoe in the corn field reaching up to pull a blue knitted wool cap down onto the bare plain burlap sack head of the same scarecrow made of two poles and an old brown coat, the sack head completely bare with no hat on it at all, no yellow hat anywhere in the picture, a big flock of black crows rising up into the sky all at once with their wings spread, the same tall man with dark brown skin, a short gray beard, and a blue denim jacket watching from the wooden gate, the red barn in the distance, warm golden afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no face on the scarecrow, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-attic-box": "A girl with light brown skin and two long dark braids wearing a green sweater, and a boy with light brown skin and short wavy dark hair wearing a red and white striped shirt, kneeling together in a dusty wooden attic beside an open old wooden trunk, the girl holding a small closed wooden music box with a tiny empty keyhole on its side, a slanted attic window letting in one bright sunbeam, cardboard boxes and a rolled up rug around them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels, no writing anywhere.",
  "quiz-old-photo": { subject: "The same girl with light brown skin and two long dark braids in a green sweater and the same boy with short wavy dark hair in a red and white striped shirt sitting on the attic floor looking closely at an old faded photograph in a plain wooden frame, the photograph showing a small girl in an old fashioned white dress holding a wooden music box, with a tiny brass key hanging on a ribbon around her neck, wooden attic beams and a sunbeam behind them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.", ref: "quiz-attic-box" },
  "quiz-locket-key": "An elderly woman with light brown skin, silver hair in a bun, and round glasses sitting in a soft green armchair, holding open a small gold heart shaped locket on a chain around her neck with a tiny brass key resting inside it, a small open wooden music box on the side table beside her, a warm glowing lamp, a window with flowered curtains. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere."
};

export const partsThatBuild: LessonDef = {
  id: "parts-that-build",
  title: "Parts That Build",
  grade: "3rd Grade",
  standard: "RL.3.5",
  archetype: "story-elements",
  objective: "I can point to a chapter, a stanza, or a scene by its number, and explain how each part builds on the one before it.",
  concepts: [
    "a story is cut into chapters, a poem into stanzas, a play into scenes",
    "point to a part with its name and its number",
    "chapter one sets something up",
    "a later part builds on what the earlier part set up",
    "a stanza can turn what the stanza before it said",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Scarecrow's Hat as three chapters, as two stanzas, and as two scenes, and you called every part by its right name. Then you explained how each part builds on the one before it. That is how a third grade reader talks about the parts of a text.",
    "title": "Every Part Builds",
    "body": "You named chapters, stanzas, and scenes, and you explained how each part builds on the one before it."
  },
  scenes: [
    {
      id: "hook-chapter-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Scarecrow's Hat, chapter one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-chapter-one"), script: "Hello, reader. Stories, poems, and plays all come in parts, and a third grade reader calls each part by its right name and explains how one part builds on the part before it. Today you get one story three ways. First, the story itself, called The Scarecrow's Hat, told in three short chapters. This is chapter one, The Crows. Read along with me, and notice what this chapter sets up." },
      interaction: { type: "read-along", text: "Every June, the crows came to Uncle Ansel's farm and pulled up the young corn before it could grow. \"A scarecrow is the only thing they respect,\" said Uncle Ansel, so he and Thea built one out of two poles, an old coat, and a sack stuffed with straw. Thea pulled her own yellow hat down over its sack head, because a scarecrow without a hat looked like nobody at all.", audio: A("hook-chapter-one-sentence") },
    },
    {
      id: "model-point-to-the-part",
      purpose: "model",
      gate: "none",
      prompt: "Point to a part with its name and its number.",
      fx: {"text":"**In chapter one**, the hat goes on","effect":"underline"},
      narration: { audio: A("model-point-to-the-part"), script: "A story this long is cut into chapters, and every chapter has a job. The job of chapter one is to set things up. Watch how I talk about it. In chapter one, the crows eat the corn, so Thea and Uncle Ansel build a scarecrow, and Thea gives it her yellow hat, because without a hat it looks like nobody. Notice the first three words I said. In chapter one. That is how a third grade reader points to a part of a story, with the word chapter and its number. Now notice what chapter one set up. A hat that makes the scarecrow look like somebody. A good story never sets something up for no reason, so keep that hat in mind." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Finish chapter one: The crows circled once, cawed, and flew off toward the far woods. \"Now the corn will grow,\" said Thea, and for a whole week it did.",
      narration: { audio: A("page-2-read"), script: "The rest of chapter one is yours. Read both sentences out loud, and notice what the scarecrow does to the crows." },
      interaction: { type: "speak", text: "The crows circled once cawed and flew off toward the far woods Now the corn will grow said Thea and for a whole week it did" },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Chapter two, The Wind. Read along!",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is chapter two, The Wind. Read along with me, and watch for the thing that chapter one set up." },
      interaction: { type: "read-along", text: "On the eighth night, a windstorm rattled the barn and bent the young corn flat against the ground. In the morning, the scarecrow was still standing, but the yellow hat was gone. By noon, a dozen crows were strutting between the rows as if the scarecrow were a fence post.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-two-builds-on-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "How does chapter two build on chapter one?",
      narration: { audio: A("guided-choose-two-builds-on-one"), script: "Chapter two only makes sense because of chapter one. Here is the question a third grade reader asks. What did chapter one set up, and what does chapter two do with it? Four things from chapter two are on your screen, and all four really happen. Only one of them uses what chapter one set up. Tap the one that tells how chapter two builds on chapter one." },
      interaction: { type: "choose", options: [{ id: "no-hat-so-crows-come-back", label: "no hat, so crows come back" }, { id: "a-windstorm-hits-at-night", label: "a windstorm hits at night" }, { id: "the-corn-bends-flat", label: "the corn bends flat" }, { id: "it-is-the-eighth-night", label: "it is the eighth night" }], correctId: "no-hat-so-crows-come-back", coachWrong: "That really happens in chapter two, but it does not use what chapter one set up. Chapter one put something on the scarecrow. What happens to it now?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Finish chapter two: \"They know,\" said Uncle Ansel, rubbing his chin, \"because without the hat he is just a coat on a stick.\" Thea searched the ditch and the hedge until dark, but the hat had blown clean away.",
      narration: { audio: A("page-4-read"), script: "The rest of chapter two is yours. Read both sentences out loud, and listen to what Uncle Ansel says the crows know." },
      interaction: { type: "speak", text: "They know said Uncle Ansel rubbing his chin because without the hat he is just a coat on a stick Thea searched the ditch and the hedge until dark but the hat had blown clean away" },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Chapter three, The Trade. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is chapter three, The Trade, the last chapter. Read along with me, and watch how it builds on what chapter two left behind." },
      interaction: { type: "read-along", text: "Thea had one hat left, a blue wool cap that Uncle Ansel had knitted for her birthday, and she stood at the gate a long time holding it. Then she marched down the row and tugged it firmly over the sack head. The crows rose in a black cloud, cawing, and they did not come back. \"That was your birthday cap,\" Uncle Ansel said softly. \"The corn needs it more than I do,\" said Thea, \"and besides, now he looks like somebody.\"", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-sequence-what-each-part-added",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put what each part added in story order.",
      narration: { audio: A("apply-sequence-what-each-part-added"), script: "Each chapter added something the story did not have before. Five things are on your screen, all mixed up, and they came one part at a time. Drag them into the order the chapters tell them, with chapter one first." },
      interaction: { type: "sequence", items: [{ id: "thea-gives-her-yellow-hat", label: "thea gives her yellow hat" }, { id: "the-crows-fly-to-the-woods", label: "the crows fly to the woods" }, { id: "the-wind-takes-the-hat", label: "the wind takes the hat" }, { id: "the-crows-strut-in-the-rows", label: "the crows strut in the rows" }, { id: "thea-gives-her-blue-cap", label: "thea gives her blue cap" }], order: ["thea-gives-her-yellow-hat","the-crows-fly-to-the-woods","the-wind-takes-the-hat","the-crows-strut-in-the-rows","thea-gives-her-blue-cap"], coachWrong: "Start with chapter one. What went onto the scarecrow first, and what did the crows do about it? Then move to chapter two, and then chapter three." },
    },
    {
      id: "apply-choose-three-builds-on-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "How does chapter three build on chapter two?",
      fx: {"text":"Chapter two leaves a problem. Chapter three **builds** on it.","effect":"glow"},
      narration: { audio: A("apply-choose-three-builds-on-two"), script: "Now you do chapter three the same way. Chapter two left the scarecrow with no hat and the crows back in the corn. Four things from chapter three are on your screen, and all four really happen. Tap the one that uses what chapter two left behind." },
      interaction: { type: "choose", options: [{ id: "no-hat-so-she-gives-her-cap", label: "no hat, so she gives her cap" }, { id: "the-cap-is-blue-wool", label: "the cap is blue wool" }, { id: "she-stands-at-the-gate", label: "she stands at the gate" }, { id: "uncle-ansel-speaks-softly", label: "uncle ansel speaks softly" }], correctId: "no-hat-so-she-gives-her-cap", coachWrong: "That is in chapter three, but it does not answer what chapter two left behind. What did the scarecrow lose, and what does Thea do about it?" },
    },
    {
      id: "poem-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The same story as a poem, two stanzas. Read along!",
      narration: { audio: A("poem-read"), script: "Now the same story, told a second way, as a poem. A poem is not cut into chapters. It is cut into stanzas, and a stanza is a group of lines with a space before it and after it. This poem has two stanzas of four lines each. Read along with me, and listen for the space between them, where I pause." },
      interaction: { type: "read-along", text: "Two poles, a coat, a sack of straw, a yellow hat pulled low. The crows took one look, cawed, and left, and let the young corn grow. Then wind came howling in the night and stole that yellow hat clean. By noon the crows were back in rows, the boldest ever seen.", audio: A("poem-read-sentence") },
    },
    {
      id: "guided-choose-stanza-turn",
      purpose: "guided",
      gate: "interaction",
      prompt: "What from stanza one does stanza two undo?",
      fx: {"text":"Stanza one builds it. Stanza two **turns** it.","effect":"word-swap"},
      narration: { audio: A("guided-choose-stanza-turn"), script: "Here is how I point in a poem. In stanza one, the scarecrow gets built, hat and all, and the crows leave. Stanza two builds on that by turning it around. Something that stanza one put in place, stanza two takes away, and everything after that follows from it. Four things from stanza one are on your screen. Tap the one that stanza two undoes." },
      interaction: { type: "choose", options: [{ id: "the-yellow-hat-pulled-low", label: "the yellow hat pulled low" }, { id: "the-coat-on-the-poles", label: "the coat on the poles" }, { id: "the-sack-full-of-straw", label: "the sack full of straw" }, { id: "the-two-tall-poles", label: "the two tall poles" }], correctId: "the-yellow-hat-pulled-low", coachWrong: "In stanza two, that part of the scarecrow is still standing. Read stanza two again. What does the wind take away?" },
    },
    {
      id: "play-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "The same story as a play, two scenes. Read along!",
      narration: { audio: A("play-read"), script: "The third way is a play. A play is written to be acted out on a stage, so its parts are called scenes, and each line begins with the name of the person who says it. Two scenes are on your screen. I will say each name before its line. Read along with me, and notice where scene one stops and scene two begins." },
      interaction: { type: "read-along", text: "Scene one. The gate, the morning after the storm. Thea: Uncle Ansel, the crows are back. Uncle Ansel: Look at him, Thea. What is missing? Thea: His hat. The wind took his hat. Uncle Ansel: Then to a crow, he is nobody. Scene two. The corn rows, that afternoon. Thea: This blue cap is the only one I have left. Uncle Ansel: You do not have to give it. Thea: The corn needs it more than I do. Uncle Ansel: Well. Now he looks like somebody.", audio: A("play-read-sentence") },
    },
    {
      id: "apply-sort-chapter-scene-stanza",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Chapter, Scene, or Stanza?",
      narration: { audio: A("apply-sort-chapter-scene-stanza"), script: "Here are six short bits, two from each way of telling the story. You can tell the form by how it is written. A bit from a chapter tells what happened in sentences, and it tells who said what. A bit from a scene starts with the name of the speaker. A bit from a stanza is one short line that rhymes with a line near it. Read each bit, and drag it to Chapter, Scene, or Stanza." },
      interaction: { type: "sort", buckets: ["Chapter","Scene","Stanza"], items: [{ label: "they know, said uncle ansel", bucket: "Chapter" }, { label: "thea: the wind took his hat", bucket: "Scene" }, { label: "and let the young corn grow", bucket: "Stanza" }, { label: "thea searched the ditch", bucket: "Chapter" }, { label: "uncle ansel: look at him", bucket: "Scene" }, { label: "the boldest ever seen", bucket: "Stanza" }], coachWrong: "Look at how it is written. Does it start with a speaker's name? Does it rhyme with a line in the poem? Or does it tell what happened, the way a chapter does?" },
    },
    {
      id: "apply-choose-point-to-the-part",
      purpose: "apply",
      gate: "interaction",
      prompt: "In the story, Thea gives the scarecrow her blue cap. Where would you point?",
      narration: { audio: A("apply-choose-point-to-the-part"), script: "Someone asks you, where in the story does Thea give the scarecrow her blue cap? A third grade reader answers with the right word for the form and the number of the part. Four answers are on your screen. Tap the one you would point to." },
      interaction: { type: "choose", options: [{ id: "in-chapter-three", label: "in chapter three" }, { id: "in-chapter-one", label: "in chapter one" }, { id: "in-stanza-three", label: "in stanza three" }, { id: "in-scene-three", label: "in scene three" }], correctId: "in-chapter-three", coachWrong: "Check the form first. The question asks about the story, and a story is cut into chapters. Then check the number. Which chapter has the blue cap in it?" },
    },
    {
      id: "challenge-speak-point-and-build",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where do the crows come back? Point to the part, then say what it builds on.",
      narration: { audio: A("challenge-speak-point-and-build"), script: "Last one, out loud. Where do the crows come back? Tap the mic. Point to that part with its name and its number, then tell what it builds on from the part before it. Start with the word in." },
      interaction: { type: "speak", text: "chapter stanza scene two second one first hat cap gone missing lost blew stole stolen wind storm windstorm nobody coat stick crows back return returned strut strutting" },
    },
    {
      id: "celebrate-every-part-builds",
      purpose: "celebrate",
      gate: "none",
      prompt: "Chapter. Stanza. Scene. Each part builds.",
      fx: {"text":"**Chapter**. **Stanza**. **Scene**.","effect":"fireworks"},
      narration: { audio: A("celebrate-every-part-builds"), script: "Today you read a story three ways. You pointed to a chapter by its number, a stanza by its number, and a scene by its number. And you did the harder thing too. You told how each part builds on the part before it. The hat went on in chapter one, the wind took it in chapter two, and chapter three could only happen because of both. From now on, when you talk about a story, a poem, or a play, you will name the part, and you will say what it builds on." },
    },
  ],
};
