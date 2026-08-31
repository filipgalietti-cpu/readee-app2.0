import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for snap-words (RF.K.3c) by scripts/warmup-generate.ts.
// Recipe: snap-dash. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=snap-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "snap-words-warmup",
  "lessonId": "snap-words",
  "lessonTitle": "Snap Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Snap Word Dash",
  "recipe": "word-catch",
  "mode": "rule",
  "skin": "carrot",
  "speedRamp": true,
  "playPrompt": "Catch the snap words!",
  "intro": {
    "audio": "/audio/warmups-v2/snap-words-warmup/intro.mp3",
    "script": "Snap words are words you know by heart, like the, of, and to. Today they are hiding in the garden. Catch every snap word you see. Careful, they speed up! Ready? Go!",
    "cardText": "Snap Words"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "the",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-the.mp3"
        },
        {
          "word": "cat",
          "isMatch": false
        },
        {
          "word": "you",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-you.mp3"
        },
        {
          "word": "stop",
          "isMatch": false
        },
        {
          "word": "is",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-is.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "of",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-of.mp3"
        },
        {
          "word": "dog",
          "isMatch": false
        },
        {
          "word": "she",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-she.mp3"
        },
        {
          "word": "hand",
          "isMatch": false
        },
        {
          "word": "are",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-are.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "to",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-to.mp3"
        },
        {
          "word": "jump",
          "isMatch": false
        },
        {
          "word": "my",
          "isMatch": true,
          "audio": "/audio/warmups-v2/snap-words-warmup/w-my.mp3"
        },
        {
          "word": "best",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/snap-words-warmup/celebrate.mp3",
    "script": "Snap! You caught those snap words at top speed. The, of, to, and more. You know them by heart, and that is exactly how readers read them. Now let's meet them in today's lesson."
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/snap-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Snap words move fast. You will meet the, of, and to in today's lesson, nice and slow this time."
  }
};
