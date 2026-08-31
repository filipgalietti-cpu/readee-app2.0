import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-word-finder (RI.1.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-word-finder --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-word-finder-warmup",
  "lessonId": "fact-word-finder",
  "lessonTitle": "Fact Word Finder",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Desert Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in the desert!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-word-finder-warmup/intro.mp3",
    "script": "Today we are reading all about the desert! Look at each word. If it belongs in the desert, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Desert"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "sand",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-sand.mp3"
        },
        {
          "word": "snow",
          "isMatch": false
        },
        {
          "word": "cactus",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-cactus.mp3"
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
          "word": "hot",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-hot.mp3"
        },
        {
          "word": "boat",
          "isMatch": false
        },
        {
          "word": "camel",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-camel.mp3"
        },
        {
          "word": "fish",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "dry",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-dry.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "sun",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-word-finder-warmup/w-sun.mp3"
        },
        {
          "word": "airplane",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-word-finder-warmup/celebrate.mp3",
    "script": "You caught them! Sand, hot, dry, and cactus. All of them belong in the desert, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-word-finder-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like sand, hot, and dry belong in the desert. Watch for them in today's lesson. You will spot them, I know it."
  }
};
