import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for big-kid-words (K.L.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=big-kid-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "big-kid-words-warmup",
  "lessonId": "big-kid-words",
  "lessonTitle": "Big Kid Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Nut Hunt Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on a nut hunt!",
  "intro": {
    "audio": "/audio/warmups-v2/big-kid-words-warmup/intro.mp3",
    "script": "Today we are reading all about a nut hunt! Look at each word. If it belongs on a nut hunt, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Nut Hunt"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "squirrel",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-squirrel.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        },
        {
          "word": "leaf",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-leaf.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "nuts",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-nuts.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "rock",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-rock.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "log",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-log.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/big-kid-words-warmup/w-tree.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/big-kid-words-warmup/celebrate.mp3",
    "script": "You caught them! Squirrel, nuts, log, and leaf. All of them belong on a nut hunt, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/big-kid-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like squirrel, nuts, and log belong on a nut hunt. Watch for them in today's lesson. You will spot them, I know it."
  }
};
