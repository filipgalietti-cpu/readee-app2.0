import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for tricky-words (RF.1.3g) by scripts/warmup-generate.ts.
// Recipe: snap-dash. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=tricky-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "tricky-words-warmup",
  "lessonId": "tricky-words",
  "lessonTitle": "Tricky Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Tricky Word Dash",
  "recipe": "word-catch",
  "mode": "rule",
  "skin": "carrot",
  "speedRamp": true,
  "playPrompt": "Catch the tricky words!",
  "intro": {
    "audio": "/audio/warmups-v2/tricky-words-warmup/intro.mp3",
    "script": "Tricky words are words you know by heart, like said, was, and one. Today they are hiding in the garden. Catch every tricky word you see. Careful, they speed up! Ready? Go!",
    "cardText": "Tricky Words"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "said",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-said.mp3"
        },
        {
          "word": "jump",
          "isMatch": false
        },
        {
          "word": "two",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-two.mp3"
        },
        {
          "word": "red",
          "isMatch": false
        },
        {
          "word": "would",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-would.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "was",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-was.mp3"
        },
        {
          "word": "cup",
          "isMatch": false
        },
        {
          "word": "they",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-they.mp3"
        },
        {
          "word": "hen",
          "isMatch": false
        },
        {
          "word": "could",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-could.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "one",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-one.mp3"
        },
        {
          "word": "hand",
          "isMatch": false
        },
        {
          "word": "there",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tricky-words-warmup/w-there.mp3"
        },
        {
          "word": "sat",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/tricky-words-warmup/celebrate.mp3",
    "script": "Snap! You caught those tricky words at top speed. Said, was, one, and more. You know them by heart, and that is exactly how readers read them. Now let's meet them in today's lesson."
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/tricky-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Tricky words move fast. You will meet said, was, and one in today's lesson, nice and slow this time."
  }
};
