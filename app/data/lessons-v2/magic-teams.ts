import type { LessonDef } from "@/lib/lesson-engine/types";
import { longVowel, shortVowel } from "@/lib/lesson-engine/phonics";
import timings from "./magic-teams-timings.json";

// Magic Teams (RF.1.3c) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged.
// G1 step-up of the silent-e canon (RF.K.3b) + NEW vowel teams (ai / ee / oa).
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=magic-teams

const A = (id: string) => `/audio/lessons-v2/magic-teams/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/magic-teams/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/magic-teams/${w.toLowerCase()}.png`;

/** Phonics teach-config for a VCe transform: ă→ā marks + silent/says-its-name labels. */
const teach = (vowel: string) => ({
  labels: { added: "silent", changed: "says its name!" },
  marks: { before: shortVowel(vowel), after: longVowel(vowel) },
});

/** Image manifest, consumed by scripts/lesson-images.ts (word → subject). */
export const magicTeamsImages: Record<string, string> = {
  cap: "a blue baseball cap",
  cape: "a red superhero cape",
  kit: "a small red first aid kit box",
  kite: "a colorful diamond kite with a tail flying in a blue sky",
};

export const magicTeams: LessonDef = {
  id: "magic-teams",
  title: "Magic Teams",
  grade: "1st Grade",
  standard: "RF.1.3c",
  archetype: "phonics",
  objective: "Silent e and vowel teams make a vowel say its name.",
  concepts: ["silent e", "vowel teams"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "Great reading today! You used the silent e to build cape and kite. You read vowel teams in rain, feet, boat, mail, and seed. Remember, when two vowels go walking, the first one does the talking. Keep listening for those long vowel sounds in every book you read!",
    title: "You know the Magic Teams!",
    body: "Silent e makes the vowel say its name, and vowel teams work together. You read cape, kite, rain, feet, and boat all by yourself.",
  },
  scenes: [
    // ── HOOK ──
    {
      id: "hook-long-vowels",
      purpose: "hook",
      gate: "none",
      prompt: "Vowels can say their names!",
      fx: { text: "Vowels can say their **names**!", effect: "glow" },
      narration: {
        audio: A("hook-long-vowels"),
        script:
          "Listen to these two words. Cap. Cape. In cap, the a makes its short sound. In cape, the a says its name, ay. When a vowel says its name, we call it a long vowel. Today you will learn two magic tricks that make a vowel say its name. The silent e, and vowel teams.",
      },
    },

    // ── MODEL — silent-e review via transform (the Add-E canon, one grade up) ──
    {
      id: "model-add-e-cape",
      purpose: "model",
      gate: "interaction",
      auto: true,
      prompt: "Watch the silent e work its magic.",
      narration: {
        audio: A("model-add-e-cape"),
        script:
          "You know this trick. Watch closely. Here is cap. Now a quiet little e slides onto the end. We do not say the e. It is silent. But it has a power. It makes the a say its name, ay. Cap becomes... cape!",
      },
      cues: [{ at: "cape", do: { effect: "fire" } }],
      interaction: {
        type: "transform", base: "cap", add: "e", result: "cape", changeIndex: 1,
        ...teach("a"), imageBefore: IMG("cap"), imageAfter: IMG("cape"),
      },
    },
    {
      id: "guided-add-e-kite",
      purpose: "guided",
      gate: "interaction",
      prompt: "Your turn. Add the magic letter to make a new word.",
      narration: {
        audio: A("guided-add-e-kite"),
        script:
          "Your turn. Here is kit. Add the quiet letter with the magic power, and kit will turn into kite, something you fly in the sky. Tap the letter that makes the i say its name.",
      },
      interaction: {
        type: "transform", base: "kit", add: "e", result: "kite", changeIndex: 1,
        options: ["e", "o", "t"], ...teach("i"), imageBefore: IMG("kit"), imageAfter: IMG("kite"),
        successAudio: W("kite"),
        coachWrong: "Not that one. The magic letter is quiet. It sits at the end and makes the i say its name.",
      },
    },

    // ── PRODUCTION SPEAK — say the new word after a transform ──
    {
      id: "speak-make-tape",
      purpose: "guided",
      gate: "interaction",
      prompt: "Make the new word in your head, then say it out loud!",
      fx: { text: "tap + **e** = ?", effect: "glow" },
      narration: {
        audio: A("speak-make-tape"),
        script:
          "Now the magic is in your head. Here is the word tap. Add the silent e to the end and think about the new word. The a will say its name, ay. Tap the mic and say the new word out loud.",
      },
      interaction: { type: "speak", text: "tape tapes taped" },
    },

    // ── MODEL — NEW: vowel teams ──
    {
      id: "teach-team-rain",
      purpose: "model",
      gate: "none",
      prompt: "Two vowels can team up!",
      fx: { text: "r **ai** n", effect: "underline" },
      narration: {
        audio: A("teach-team-rain"),
        script:
          "Here is the second magic trick. Look at the word rain. Two vowels sit side by side, the a and the i. They are a vowel team. When two vowels go walking, the first one does the talking. The a does the talking and says its name, ay. The i stays quiet. Rain.",
      },
    },
    {
      id: "teach-team-feet",
      purpose: "model",
      gate: "none",
      prompt: "The team in feet says its name.",
      fx: { text: "f **ee** t", effect: "underline" },
      narration: {
        audio: A("teach-team-feet"),
        script:
          "Look at the word feet. Two e's stand side by side. They are a team too. The first e does the talking and says its name, ee. Do you hear the long e? Feet.",
      },
    },
    {
      id: "teach-team-boat",
      purpose: "model",
      gate: "none",
      prompt: "One more team!",
      fx: { text: "b **oa** t", effect: "glow" },
      narration: {
        audio: A("teach-team-boat"),
        script:
          "One more team. Look at the word boat. The o and the a walk together. The first one does the talking. The o says its name, oh. The a stays quiet. Boat.",
      },
    },

    // ── GUIDED / APPLY — read and match (child READS; text tiles, no audio) ──
    {
      id: "read-match-rain",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says rain.",
      narration: {
        audio: A("read-match-rain"),
        script:
          "Time to read. One of these words is rain, the rain that falls from clouds. The others are different words. Read each word with your eyes. Look for a vowel team. Then tap the word that says rain.",
      },
      interaction: {
        type: "choose",
        options: [{ id: "rain", label: "rain" }, { id: "ran", label: "ran" }, { id: "run", label: "run" }],
        correctId: "rain",
        coachWrong: "Read each word again. Look for two vowels walking side by side. The first one says its name, ay. Tap the word that says rain.",
      },
    },
    {
      id: "read-match-meet",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that says meet.",
      narration: {
        audio: A("read-match-meet"),
        script:
          "Listen first. Meet. I will meet you at the park. Now read each word with your own eyes. Only one has a vowel team. Tap the word that says meet.",
      },
      interaction: {
        type: "choose",
        options: [{ id: "meet", label: "meet" }, { id: "met", label: "met" }, { id: "mat", label: "mat" }],
        correctId: "meet",
        coachWrong: "Read each word out loud. Listen for the long ee sound. Look for two vowels walking together, then tap the word that says meet.",
      },
    },
    {
      id: "read-match-coat",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that says coat.",
      narration: {
        audio: A("read-match-coat"),
        script:
          "One more. Listen. Coat. You wear a coat when it is cold. Read all three words, left to right, all the way to the end. Then tap the word that says coat.",
      },
      interaction: {
        type: "choose",
        options: [{ id: "coat", label: "coat" }, { id: "cot", label: "cot" }, { id: "cut", label: "cut" }],
        correctId: "coat",
        coachWrong: "Read each word slowly. Look for two vowels walking together. That word says coat.",
      },
    },

    // ── APPLY — sort by vowel team (example-word buckets) ──
    {
      id: "sort-by-team",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read each word. Sort it by its vowel team.",
      narration: {
        audio: A("sort-by-team"),
        script:
          "Sort time. The bucket words are rain, feet, and boat. Each one has a different vowel team. Read each new word and find its two vowels. If it has the same team as rain, drag it to rain. Same team as feet, drag it to feet. Same team as boat, drag it to boat.",
      },
      interaction: {
        type: "sort",
        buckets: ["Rain", "Feet", "Boat"],
        items: [
          { label: "mail", bucket: "Rain" },
          { label: "seed", bucket: "Feet" },
          { label: "coat", bucket: "Boat" },
          { label: "tail", bucket: "Rain" },
          { label: "deep", bucket: "Feet" },
          { label: "soap", bucket: "Boat" },
        ],
        coachWrong: "Look right at the middle of the word. Which two vowels are walking together? Find the bucket word with those same two vowels and drag it there.",
      },
    },

    // ── CHALLENGE ──
    {
      id: "challenge-choose-seed",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that names something you plant in the dirt.",
      narration: {
        audio: A("challenge-choose-seed"),
        script:
          "Challenge time. These words look alike, so read carefully. Sound out each word. If you see a vowel team, the first vowel does the talking. One of these words names the tiny thing you plant in the dirt so a plant can grow. Read all four, then tap that word.",
      },
      interaction: {
        type: "choose",
        options: [{ id: "seed", label: "seed" }, { id: "send", label: "send" }, { id: "sand", label: "sand" }, { id: "sled", label: "sled" }],
        correctId: "seed",
        coachWrong: "Read each word again, left to right. Look for a vowel team. Think about what each word means, then tap the one you can plant in the dirt.",
      },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read it aloud: My feet got wet in the rain.",
      narration: {
        audio: A("challenge-speak-sentence"),
        script:
          "Last one. Read this whole sentence out loud. Two of the words have vowel teams. Remember, the first vowel does the talking. Tap the mic and read the sentence in your best reading voice.",
      },
      interaction: { type: "speak", text: "My feet got wet in the rain" },
    },

    // ── WRAP ──
    {
      id: "celebrate-magic-teams",
      purpose: "celebrate",
      gate: "none",
      prompt: "You know the magic teams!",
      fx: { text: "When two vowels go **walking**, the first does the **talking**!", effect: "fireworks" },
      narration: {
        audio: A("celebrate-magic-teams"),
        script:
          "You did it! You used two magic tricks today. The silent e made cap become cape and kit become kite. And vowel teams worked together in rain, feet, and boat, where the first vowel does the talking. Keep looking for magic teams in every book you read!",
      },
    },
  ],
};
