import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-music-timings.json";

// Word Music (RL.2.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-music
// G2: original poem "The Storm Parade", 3 quatrains with a 2-line refrain that
// changes at the end. Teach beats: rhyme, refrain/beat, vivid word choice.

const A = (id: string) => `/audio/lessons-v2/word-music/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-music/${w.toLowerCase()}.png`;

export const wordMusicImages: Record<string, string | { subject: string; ref?: string }> = {
  "cover": "A storybook cover illustration of a cozy small town street under rolling dark blue storm clouds, rain falling in neat slanted lines, one bright lightning flash far away, a young girl with curly red hair in a yellow raincoat watching happily from her front porch, warm glowing windows along the street, framed like a picture book cover, no text anywhere",
  "page-2": { subject: "The same young girl with curly red hair in a yellow raincoat tapping her hands on her porch railing in the rain, raindrops bouncing and splashing on the rooftops and puddles of the same cozy small town street, warm glowing windows, playful steady rain everywhere", ref: "cover" }
};

export const wordMusic: LessonDef = {
  id: "word-music",
  title: "Word Music",
  grade: "2nd Grade",
  standard: "RL.2.4",
  archetype: "story-elements",
  objective: "I can describe how words and phrases give a poem rhythm and meaning.",
  concepts: ["rhyme","repeated lines and refrains","steady beat","vivid word choice","rhythm","how word choice changes meaning"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read a whole poem and found its word music. You heard rhymes chime, sky with by, and play with day. You felt the refrain march back to keep a steady beat. And you saw one vivid word, marching, turn plain rain into a parade. Poets choose words for their sound and their meaning. Now you can hear the music in any poem you read.",
    "title": "You Found the Word Music!",
    "body": "You read a whole poem and described how rhyme, a refrain, and vivid words gave it rhythm and meaning."
  },
  scenes: [
    {
      id: "hook-word-music",
      purpose: "hook",
      gate: "none",
      prompt: "Poems have music hiding inside.",
      image: IMG("cover"),
      fx: {"text":"Poems are made of **word music**.","effect":"pop-words"},
      narration: { audio: A("hook-word-music"), script: "Hello, reader! A poem is a story with music hiding inside it. Poets pick words that rhyme, lines that repeat, and words so vivid you can see them in your mind. Today you will read a poem called The Storm Parade, and you will find where its music comes from." },
    },
    {
      id: "model-rhyme-chime",
      purpose: "model",
      gate: "none",
      prompt: "Watch me listen for rhyme.",
      fx: {"text":"A frog sat down upon a **log**. He sang all night in the misty **fog**.","effect":"underline"},
      narration: { audio: A("model-rhyme-chime"), script: "Watch me find the first kind of word music with a tiny poem. Listen. A frog sat down upon a log. He sang all night in the misty fog. Now I check the ends of the lines. Log. Fog. They chime, like two bells with the same ring. Words that chime at the ends of lines are rhymes, and rhyme is the first piece of a poem's music." },
    },
    {
      id: "page-1-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read stanza one: Boom! The thunder rolls on by. Dark clouds tumble down the sky. Rain comes marching, drumming down. The storm parade is in our town!",
      narration: { audio: A("page-1-read"), script: "Time to read The Storm Parade. Stanza one is all yours. Read it out loud, nice and steady, and let the lines bounce like a drum." },
      interaction: { type: "speak", text: "Boom The thunder rolls on by Dark clouds tumble down the sky Rain comes marching drumming down The storm parade is in our town" },
    },
    {
      id: "check-rhyme-sky",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word rhymes with sky?",
      narration: { audio: A("check-rhyme-sky"), script: "Great reading. Now use your ears. One line in stanza one ends with the word sky. Another line ends with a word that chimes with it. Which word rhymes with sky? Tap it." },
      interaction: { type: "choose", options: [{ id: "by", label: "by" }, { id: "clouds", label: "clouds" }, { id: "storm", label: "storm" }, { id: "rain", label: "rain" }], correctId: "by", coachWrong: "Say sky out loud, then say each choice out loud. A rhyme chimes at the very end of the word. Tap the one that chimes with sky." },
    },
    {
      id: "sort-rhyme-families",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word into its rhyme family.",
      narration: { audio: A("sort-rhyme-families"), script: "Rhymes come in families. This poem uses the day family and the town family. Say each word out loud, listen to its ending, and drag it to the family it chimes with." },
      interaction: { type: "sort", buckets: ["day family","town family"], items: [{ label: "play", bucket: "day family" }, { label: "brown", bucket: "town family" }, { label: "stay", bucket: "day family" }, { label: "crown", bucket: "town family" }, { label: "gray", bucket: "day family" }, { label: "frown", bucket: "town family" }], coachWrong: "Say the word out loud and listen to its very end. Does it chime with day, or with town? Drag it to that family." },
    },
    {
      id: "page-2-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Stanza two. Read along!",
      image: IMG("page-2"),
      narration: { audio: A("page-2-read"), script: "Stanza two brings the rain to the rooftops. Read along with me, and listen closely. You will hear something you have already read." },
      interaction: { type: "read-along", text: "Drip, drop, drip, drop, hear it play, tapping on the roof all day. Rain comes marching, drumming down. The storm parade is in our town!", audio: A("page-2-read-sentence") },
    },
    {
      id: "check-refrain-line",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which line marches back in both stanzas?",
      narration: { audio: A("check-refrain-line"), script: "Did your ears catch it? Poets sometimes repeat a whole line, and that repeated line is called a refrain. One line showed up in stanza one and came right back in stanza two. Which line is the refrain? Tap it." },
      interaction: { type: "choose", options: [{ id: "rain-comes-marching", label: "rain comes marching" }, { id: "boom-the-thunder-rolls", label: "boom the thunder rolls" }, { id: "drip-drop-hear-it-play", label: "drip drop hear it play" }, { id: "tapping-on-the-roof", label: "tapping on the roof" }], correctId: "rain-comes-marching", coachWrong: "A refrain appears again and again. Walk back through both stanzas in your mind. Which line did you read both times?" },
    },
    {
      id: "check-refrain-job",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the repeated line give the poem?",
      narration: { audio: A("check-refrain-job"), script: "Now think like a poet. The poet chose to bring that refrain back again and again. Repeating is not an accident. It does a job for the poem. Read each choice, then tap what the refrain gives the poem." },
      interaction: { type: "choose", options: [{ id: "a-steady-marching-beat", label: "a steady marching beat" }, { id: "a-brand-new-character", label: "a brand new character" }, { id: "a-change-of-setting", label: "a change of setting" }, { id: "a-spooky-night-mood", label: "a spooky night mood" }], correctId: "a-steady-marching-beat", coachWrong: "Read the refrain again and tap your foot as you say it. Rain comes marching, drumming down. What do you feel when a line comes back like that?" },
    },
    {
      id: "check-vivid-marching",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the word marching make the rain seem like?",
      narration: { audio: A("check-vivid-marching"), script: "Here is the last piece of word music, the vivid word. The poet wrote, rain comes marching, drumming down. The poet could have written, rain comes falling, dripping down. Falling is plain. Marching is vivid, and it changes what you see and hear in your mind. What does marching make the rain seem like? Tap it." },
      interaction: { type: "choose", options: [{ id: "a-parade-with-a-beat", label: "a parade with a beat" }, { id: "a-quiet-sleepy-nap", label: "a quiet sleepy nap" }, { id: "a-slow-lazy-river", label: "a slow lazy river" }, { id: "a-soft-fluffy-cloud", label: "a soft fluffy cloud" }], correctId: "a-parade-with-a-beat", coachWrong: "Think about who marches. Picture rows of boots stepping together, left, right, left. Now picture the rain doing that. Tap what it seems like." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read stanza three: Then the sun peeks out to say, time to chase the clouds away. Rain stops marching, drumming down. The storm parade has left our town!",
      narration: { audio: A("page-3-read"), script: "You have one last stanza to read, and something changes at the end. Read stanza three out loud, and listen for what happened to the refrain." },
      interaction: { type: "speak", text: "Then the sun peeks out to say time to chase the clouds away Rain stops marching drumming down The storm parade has left our town" },
    },
    {
      id: "check-ending-change",
      purpose: "challenge",
      gate: "interaction",
      prompt: "The refrain changed. What do the new words tell you?",
      narration: { audio: A("check-ending-change"), script: "You read it just right. The last two lines sound almost like the refrain, but the poet swapped in a few new words. Small word changes can change the whole meaning. What do the new words tell you? Tap it." },
      interaction: { type: "choose", options: [{ id: "the-storm-is-over", label: "the storm is over" }, { id: "the-storm-grows-louder", label: "the storm grows louder" }, { id: "a-second-storm-arrives", label: "a second storm arrives" }, { id: "the-town-is-asleep", label: "the town is asleep" }], correctId: "the-storm-is-over", coachWrong: "Read the last stanza again in your mind. What did the rain do at the end, and where did the parade go? Tap what those words tell you." },
    },
    {
      id: "sequence-storm-retell",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Retell the poem. Put the events in order.",
      narration: { audio: A("sequence-storm-retell"), script: "Time to retell The Storm Parade like a storyteller. Think about what the poem showed first, next, then, and last. Drag the events into the poem's order." },
      interaction: { type: "sequence", items: [{ id: "thunder-rolls-in", label: "thunder rolls in" }, { id: "rain-drums-the-roofs", label: "rain drums on the roofs" }, { id: "the-sun-peeks-out", label: "the sun peeks out" }, { id: "the-parade-leaves-town", label: "the parade leaves town" }], order: ["thunder-rolls-in","rain-drums-the-roofs","the-sun-peeks-out","the-parade-leaves-town"], coachWrong: "Walk back through the stanzas in your mind. How did the poem begin, what did the rain do next, and what happened at the very end?" },
    },
    {
      id: "speak-make-a-rhyme",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a new word that rhymes with down.",
      narration: { audio: A("speak-make-a-rhyme"), script: "Last job, poet. This poem rhymed down with town. Now you make the music. Think of one more word that chimes with down. Tap the mic and say it." },
      interaction: { type: "speak", text: "brown crown frown gown clown drown noun" },
    },
    {
      id: "celebrate-word-music",
      purpose: "celebrate",
      gate: "none",
      prompt: "You found the word music!",
      fx: {"text":"Rhyme. **Refrain**. Vivid words. That is word music.","effect":"fireworks"},
      narration: { audio: A("celebrate-word-music"), script: "You read a whole poem and found its word music. You heard rhymes chime, sky with by, and play with day. You felt the refrain march back to keep a steady beat. And you saw one vivid word, marching, turn plain rain into a parade. Poets choose words for their sound and their meaning. Now you can hear the music in any poem you read." },
    },
  ],
};
