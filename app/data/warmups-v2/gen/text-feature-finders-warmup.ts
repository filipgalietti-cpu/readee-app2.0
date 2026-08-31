import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for text-feature-finders (RI.1.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=text-feature-finders --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "text-feature-finders-warmup",
  "lessonId": "text-feature-finders",
  "lessonTitle": "Text Feature Finders",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bugs Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with bugs!",
  "intro": {
    "audio": "/audio/warmups-v2/text-feature-finders-warmup/intro.mp3",
    "script": "Today we are reading all about bugs! Look at each word. If it belongs with bugs, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Bugs"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "ants",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-ants.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "nectar",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-nectar.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "wasp",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-wasp.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "wings",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-wings.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "nest",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-nest.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "seeds",
          "isMatch": true,
          "audio": "/audio/warmups-v2/text-feature-finders-warmup/w-seeds.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/text-feature-finders-warmup/celebrate.mp3",
    "script": "You caught them! Ants, wasp, nest, and nectar. All of them belong with bugs, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/text-feature-finders-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like ants, wasp, and nest belong with bugs. Watch for them in today's lesson. You will spot them, I know it."
  }
};
