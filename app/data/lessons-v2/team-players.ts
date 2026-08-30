import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./team-players-timings.json";

// Team Players (RF.2.3b) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged.
// G2 step-up of magic-teams (RF.1.3c ai/ee/oa): NEW vowel teams with the
// two-sounds subtlety as the core teach — oo (moon vs book), ow (cow vs snow),
// oi/oy (coin, toy), aw (saw, dawn).
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=team-players

const A = (id: string) => `/audio/lessons-v2/team-players/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/team-players/${w.toLowerCase()}.png`;

export const teamPlayersImages: Record<string, string> = {
  "moon-book": "An open storybook lying on soft green grass under a big bright crescent moon in a starry night sky, bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no text anywhere, no letters anywhere",
  // Quiz easier-band picture support (team-players-quiz e-1 .. e-4):
  "spoon": "A single shiny silver spoon on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "spin": "A colorful striped spinning top toy spinning with small motion swirls around it, plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "hook": "A single silver metal coat hook mounted on a wooden wall board, nothing hanging on it, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "hood": "A cozy red hooded jacket with the empty hood pulled up, on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "toy": "A cute brown teddy bear toy sitting on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "tie": "A single blue striped necktie on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "saw": "A single hand saw with a wooden handle and silver blade on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "sun": "A big bright smiling yellow sun with rays in a clear blue sky, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
};

export const teamPlayers: LessonDef = {
  id: "team-players",
  title: "Team Players",
  grade: "2nd Grade",
  standard: "RF.2.3b",
  archetype: "phonics",
  objective: "I can read words with the vowel teams oo, ow, oi, oy, and aw, even when a team makes two different sounds.",
  concepts: ["vowel teams", "oo", "ow", "oi", "oy", "aw"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "You read every new team today. The o o team in moon and book. The o w team in cow and snow. The o i and o y teams in coin and toy. The a w team in saw and dawn. When a team has two sounds, you tried one, checked the word, and flipped to the other. That is exactly what strong readers do. Keep trying both sounds when a word looks new.",
    title: "You Know the New Teams!",
    body: "Some vowel teams make two sounds. You read moon and book, cow and snow, coin and toy, saw and dawn, and picked the right sound every time.",
  },
  scenes: [
    // ── HOOK ──
    {
      id: "hook-new-teams",
      purpose: "hook",
      gate: "none",
      prompt: "New vowel teams make brand new sounds.",
      image: IMG("moon-book"),
      narration: {
        audio: A("hook-new-teams"),
        script:
          "You already know some vowel teams. In rain, feet, and boat, the first vowel does the talking and says its name. But some teams do not follow that rule. Listen. Moon. Cow. Coin. Saw. Those teams make brand new sounds, and two of the teams can even make two different sounds. Today you will learn the new teams and read their words.",
      },
    },

    // ── MODEL — one team at a time ──
    {
      id: "model-oo-two-sounds",
      purpose: "model",
      gate: "none",
      prompt: "The oo team makes two sounds.",
      fx: { text: "m **oo** n   b **oo** k", effect: "glow" },
      narration: {
        audio: A("model-oo-two-sounds"),
        script:
          "Here is the o o team. Two o's side by side. This team makes two different sounds. Listen. Moon. In moon, the team makes a long cool sound, ooo. Now listen. Book. In book, the same team makes a quick sound, like in look and good. Same two letters, two sounds. When you read an o o word, try the moon sound first. If the word sounds wrong, flip to the book sound.",
      },
    },
    {
      id: "model-ow-two-sounds",
      purpose: "model",
      gate: "none",
      prompt: "The ow team makes two sounds too.",
      fx: { text: "c **ow**   sn **ow**", effect: "glow" },
      narration: {
        audio: A("model-ow-two-sounds"),
        script:
          "Here is the o w team, and it has two sounds too. Listen. Cow. In cow, the team says ow, like when you bump your knee and say ow. Now listen. Snow. In snow, the same team says oh, the o's name. Cow. Snow. When you read an o w word, try one sound. If the word sounds wrong, flip to the other one.",
      },
    },
    {
      id: "model-oi-oy",
      purpose: "model",
      gate: "none",
      prompt: "The oi and oy teams share one sound.",
      fx: { text: "c **oi** n   t **oy**", effect: "glow" },
      narration: {
        audio: A("model-oi-oy"),
        script:
          "Now an easier pair. The o i team and the o y team make the very same sound, oy. Listen. Coin. Toy. Do you hear oy in the middle of coin and at the end of toy? The o i team likes to sit in the middle of a word. The o y team likes to sit at the end.",
      },
    },
    {
      id: "model-aw",
      purpose: "model",
      gate: "none",
      prompt: "The aw team says aw.",
      fx: { text: "s **aw**   d **aw** n", effect: "glow" },
      narration: {
        audio: A("model-aw"),
        script:
          "One more team. The a w team says aw. Listen. Saw. Dad cut wood with a saw. Dawn. Dawn is the time when the sun first comes up. The a and the w work as one team and say aw. Saw. Dawn.",
      },
    },

    // ── GUIDED — two-sounds discrimination ──
    {
      id: "guided-which-oo-spoon",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which oo sound do you hear in spoon?",
      narration: {
        audio: A("guided-which-oo-spoon"),
        script:
          "Your turn, and your ears lead the way. Listen. Spoon. I eat soup with a spoon. Spoon. The o o team is in the middle. Does it make the moon sound or the book sound? Tap your answer.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "like-moon", label: "like moon" },
          { id: "like-book", label: "like book" },
        ],
        correctId: "like-moon",
        coachWrong:
          "Say spoon again, nice and slow, and stretch the middle. Now say moon, then say book. Which middle sound matches spoon? Tap that one.",
      },
    },
    {
      id: "guided-which-ow-town",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which ow sound do you hear in town?",
      narration: {
        audio: A("guided-which-ow-town"),
        script:
          "Listen again. Town. We drove to the town. Town. The o w team is in there. Does it say ow like cow, or oh like snow? Tap your answer.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "like-cow", label: "like cow" },
          { id: "like-snow", label: "like snow" },
        ],
        correctId: "like-cow",
        coachWrong:
          "Say town slowly and listen to the middle. Now say cow, then say snow. Which word has the same sound as town? Tap that one.",
      },
    },

    // ── APPLY — read and match (hear it, pick it) ──
    {
      id: "apply-read-coin",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that says coin.",
      narration: {
        audio: A("apply-read-coin"),
        script:
          "Time to read. Listen. Coin. I found a shiny coin on the sidewalk. Coin. Now read each word with your own eyes, all the way to the last letter. Then tap the word that says coin.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "coin", label: "coin" },
          { id: "corn", label: "corn" },
          { id: "cane", label: "cane" },
          { id: "coat", label: "coat" },
        ],
        correctId: "coin",
        coachWrong:
          "Say coin in your head and listen to its middle sound. Read each word again, letter by letter, and check its vowel team. Then tap the word that says coin.",
      },
    },
    {
      id: "apply-read-snow",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that says snow.",
      narration: {
        audio: A("apply-read-snow"),
        script:
          "Here is another one. Listen. Snow. White snow falls in winter. Snow. Read all four words carefully. Two of them end with the same team, so read every letter. Then tap the word that says snow.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "snow", label: "snow" },
          { id: "slow", label: "slow" },
          { id: "soon", label: "soon" },
          { id: "saw", label: "saw" },
        ],
        correctId: "snow",
        coachWrong:
          "Say snow slowly. Now read each word from its first letter to its last. Two words end the same way, so check their beginnings too. Tap the word that says snow.",
      },
    },

    // ── APPLY — sort by team sound ──
    {
      id: "apply-sort-oo",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read each word. Which oo sound does it use?",
      narration: {
        audio: A("apply-sort-oo"),
        script:
          "Sort time. The bucket words are moon and book. Read each new word and try both o o sounds. Say it with the long moon sound, then with the quick book sound. Only one way makes a real word you know. Drag the word to the bucket that matches its sound.",
      },
      interaction: {
        type: "sort",
        buckets: ["Moon", "Book"],
        items: [
          { label: "spoon", bucket: "Moon" },
          { label: "hook", bucket: "Book" },
          { label: "food", bucket: "Moon" },
          { label: "wood", bucket: "Book" },
          { label: "boot", bucket: "Moon" },
          { label: "look", bucket: "Book" },
        ],
        coachWrong:
          "Read the word again and try both sounds, the long moon sound and the quick book sound. Which way makes a real word? Drag it to that bucket.",
      },
    },

    // ── APPLY — speak ──
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it out loud: The boy saw a cow at dawn.",
      narration: {
        audio: A("apply-speak-sentence"),
        script:
          "Now read a whole sentence. Three of your new teams are hiding in it. Read it with your eyes first and get each team's sound ready. Then tap the mic and read the whole sentence out loud.",
      },
      interaction: { type: "speak", text: "The boy saw a cow at dawn" },
    },

    // ── CHALLENGE ──
    {
      id: "challenge-sort-ow",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the ow words. Cow sound or snow sound?",
      narration: {
        audio: A("challenge-sort-ow"),
        script:
          "Challenge sort. The bucket words are cow and snow. Every word here has the o w team, but the team picks a different sound in different words. Read each word, try both sounds, and listen for the real word. Then drag it to cow or to snow.",
      },
      interaction: {
        type: "sort",
        buckets: ["Cow", "Snow"],
        items: [
          { label: "town", bucket: "Cow" },
          { label: "grow", bucket: "Snow" },
          { label: "brown", bucket: "Cow" },
          { label: "show", bucket: "Snow" },
          { label: "down", bucket: "Cow" },
          { label: "low", bucket: "Snow" },
        ],
        coachWrong:
          "Try the word both ways. Say it with the ow sound like cow, then with the oh sound like snow. Which way makes a word you have heard before? Drag it to that bucket.",
      },
    },
    {
      id: "challenge-read-dawn",
      purpose: "challenge",
      gate: "interaction",
      prompt: "The sun comes up at ___. Tap the word the sentence needs.",
      narration: {
        audio: A("challenge-read-dawn"),
        script:
          "Challenge round. This sentence has a blank. The sun comes up at blank. Read all four words carefully. Two of them look almost the same, so check every letter and each vowel team. Try each word in the blank, then tap the word the sentence needs.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "dawn", label: "dawn" },
          { id: "down", label: "down" },
          { id: "den", label: "den" },
          { id: "dot", label: "dot" },
        ],
        correctId: "dawn",
        coachWrong:
          "Try each word in the blank. The sun comes up at blank. Read each word to its last letter and try both sounds for its vowel team. Then tap the word that fits.",
      },
    },
    {
      id: "challenge-speak-mixed",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read it out loud: Look at the moon grow big over the town.",
      narration: {
        audio: A("challenge-speak-mixed"),
        script:
          "Last one, and it is tricky. The o w team shows up twice in this sentence, and it makes a different sound each time. The o o team is here twice too. Read the sentence with your eyes first and get every sound ready. Then tap the mic and read it out loud in your best reading voice.",
      },
      interaction: { type: "speak", text: "Look at the moon grow big over the town" },
    },

    // ── WRAP ──
    {
      id: "celebrate-team-players",
      purpose: "celebrate",
      gate: "none",
      prompt: "You know the new teams!",
      fx: { text: "New teams, new **sounds**. You read them **all**!", effect: "fireworks" },
      narration: {
        audio: A("celebrate-team-players"),
        script:
          "You did it. You read the o o team in moon and book, the o w team in cow and snow, the o i and o y teams in coin and toy, and the a w team in saw and dawn. Best of all, when a team had two sounds, you tried both and picked the real word. Keep flipping sounds like that in every book you read.",
      },
    },
  ],
};
