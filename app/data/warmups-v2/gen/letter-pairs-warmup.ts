import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for letter-pairs (RF.K.1d) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=letter-pairs --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "letter-pairs-warmup",
  "lessonId": "letter-pairs",
  "lessonTitle": "Letter Pairs",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Socks Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with socks, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/letter-pairs-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about matching socks! Look at each word. If it belongs if it belongs with socks, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Socks"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "foot",
          "isMatch": true,
          "audio": "/audio/warmups-v2/letter-pairs-warmup/w-foot.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "wash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/letter-pairs-warmup/w-wash.mp3"
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
          "word": "shoe",
          "isMatch": true
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "warm",
          "isMatch": true,
          "audio": "/audio/warmups-v2/letter-pairs-warmup/w-warm.mp3"
        },
        {
          "word": "moon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "pair",
          "isMatch": true,
          "audio": "/audio/warmups-v2/letter-pairs-warmup/w-pair.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "drawer",
          "isMatch": true,
          "audio": "/audio/warmups-v2/letter-pairs-warmup/w-drawer.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/letter-pairs-warmup/celebrate.mp3",
    "script": "You caught them! Foot, shoe, pair, and wash. All of them belong if it belongs with socks, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/letter-pairs-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like foot, shoe, and pair belong if it belongs with socks, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
