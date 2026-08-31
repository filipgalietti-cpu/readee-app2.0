import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for silent-e (RF.K.3b) by scripts/warmup-generate.ts.
// Recipe: sound-hunt. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=silent-e --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "silent-e-warmup",
  "lessonId": "silent-e",
  "lessonTitle": "The Silent E",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Long Vowel Hunt",
  "recipe": "sound-hunt",
  "mode": "rule",
  "skin": "carrot",
  "playPrompt": "Catch the long vowel words!",
  "intro": {
    "audio": "/audio/warmups-v2/silent-e-warmup/intro.mp3",
    "script": "Listen up, word catcher! Some words here are long vowel words, like cape and kite. Your job: catch every long vowel word. If a word does not fit, let it go. Ready? Go!",
    "cardText": "Long Vowel"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "cape",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-cape.mp3"
        },
        {
          "word": "cap",
          "isMatch": false
        },
        {
          "word": "pine",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-pine.mp3"
        },
        {
          "word": "pin",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "kite",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-kite.mp3"
        },
        {
          "word": "kit",
          "isMatch": false
        },
        {
          "word": "cube",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-cube.mp3"
        },
        {
          "word": "cub",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tube",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-tube.mp3"
        },
        {
          "word": "tub",
          "isMatch": false
        },
        {
          "word": "made",
          "isMatch": true,
          "audio": "/audio/warmups-v2/silent-e-warmup/w-made.mp3"
        },
        {
          "word": "mad",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/silent-e-warmup/celebrate.mp3",
    "script": "Wow, your ears are warmed up! You caught long vowel words like cape and kite. Now let's take those sharp ears into today's lesson."
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/silent-e-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Those long vowel words are sneaky. Keep your ears open in today's lesson, and you will catch them next time."
  }
};
