import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for how-they-connect (RI.K.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=how-they-connect --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "how-they-connect-warmup",
  "lessonId": "how-they-connect",
  "lessonTitle": "How They Connect",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Garden Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a garden!",
  "intro": {
    "audio": "/audio/warmups-v2/how-they-connect-warmup/intro.mp3",
    "script": "Today we are reading all about a garden! Look at each word. If it belongs in a garden, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Garden"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "plant",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-plant.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "dirt",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-dirt.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "flower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-flower.mp3"
        },
        {
          "word": "cookie",
          "isMatch": false
        },
        {
          "word": "sun",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-sun.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "seed",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-seed.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        },
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/how-they-connect-warmup/w-water.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/how-they-connect-warmup/celebrate.mp3",
    "script": "You caught them! Plant, flower, seed, and dirt. All of them belong in a garden, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/how-they-connect-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like plant, flower, and seed belong in a garden. Watch for them in today's lesson. You will spot them, I know it."
  }
};
