import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for check-and-fix (RF.1.4c) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=check-and-fix --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "check-and-fix-warmup",
  "lessonId": "check-and-fix",
  "lessonTitle": "Check and Fix",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Farm Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on a farm!",
  "intro": {
    "audio": "/audio/warmups-v2/check-and-fix-warmup/intro.mp3",
    "script": "Today we are reading all about a farm! Look at each word. If it belongs on a farm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Farm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "cow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-cow.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "tractor",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-tractor.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "pig",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-pig.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "chicken",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-chicken.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "barn",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-barn.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "field",
          "isMatch": true,
          "audio": "/audio/warmups-v2/check-and-fix-warmup/w-field.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/check-and-fix-warmup/celebrate.mp3",
    "script": "You caught them! Cow, pig, barn, and tractor. All of them belong on a farm, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/check-and-fix-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like cow, pig, and barn belong on a farm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
