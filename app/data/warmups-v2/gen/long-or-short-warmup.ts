import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for long-or-short (RF.2.3a) by scripts/warmup-generate.ts.
// Recipe: sound-hunt. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=long-or-short --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "long-or-short-warmup",
  "lessonId": "long-or-short",
  "lessonTitle": "Long or Short?",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Long Vowel Hunt",
  "recipe": "sound-hunt",
  "mode": "rule",
  "skin": "carrot",
  "playPrompt": "Catch the long vowel words!",
  "intro": {
    "audio": "/audio/warmups-v2/long-or-short-warmup/intro.mp3",
    "script": "Listen up, word catcher! Some words here are long vowel words, like cube and tape. Your job: catch every long vowel word. If a word does not fit, let it go. Ready? Go!",
    "cardText": "Long Vowel"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "cube",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-cube.mp3"
        },
        {
          "word": "cub",
          "isMatch": false
        },
        {
          "word": "tube",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-tube.mp3"
        },
        {
          "word": "cob",
          "isMatch": false
        },
        {
          "word": "bite",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-bite.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tape",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-tape.mp3"
        },
        {
          "word": "tap",
          "isMatch": false
        },
        {
          "word": "cape",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-cape.mp3"
        },
        {
          "word": "tip",
          "isMatch": false
        },
        {
          "word": "robe",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-robe.mp3"
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "hope",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-hope.mp3"
        },
        {
          "word": "hop",
          "isMatch": false
        },
        {
          "word": "kite",
          "isMatch": true,
          "audio": "/audio/warmups-v2/long-or-short-warmup/w-kite.mp3"
        },
        {
          "word": "top",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/long-or-short-warmup/celebrate.mp3",
    "script": "Wow, your ears are warmed up! You caught long vowel words like cube and tape. Now let's take those sharp ears into today's lesson."
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/long-or-short-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Those long vowel words are sneaky. Keep your ears open in today's lesson, and you will catch them next time."
  }
};
