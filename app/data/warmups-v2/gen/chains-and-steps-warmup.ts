import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for chains-and-steps (RI.2.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=chains-and-steps --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "chains-and-steps-warmup",
  "lessonId": "chains-and-steps",
  "lessonTitle": "Chains & Steps",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Maple Syrup Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in syrup making!",
  "intro": {
    "audio": "/audio/warmups-v2/chains-and-steps-warmup/intro.mp3",
    "script": "Today we are reading all about making maple syrup! Look at each word. If it belongs in syrup making, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Maple Syrup"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-tree.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        },
        {
          "word": "bucket",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-bucket.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "sap",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-sap.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        },
        {
          "word": "pan",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-pan.mp3"
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
          "word": "spout",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-spout.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "boil",
          "isMatch": true,
          "audio": "/audio/warmups-v2/chains-and-steps-warmup/w-boil.mp3"
        },
        {
          "word": "banana",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/chains-and-steps-warmup/celebrate.mp3",
    "script": "You caught them! Tree, sap, spout, and bucket. All of them belong in syrup making, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/chains-and-steps-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like tree, sap, and spout belong in syrup making. Watch for them in today's lesson. You will spot them, I know it."
  }
};
