import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-solvers (L.2.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-solvers --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-solvers-warmup",
  "lessonId": "word-solvers",
  "lessonTitle": "Word Solvers",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Sky Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in the sky!",
  "intro": {
    "audio": "/audio/warmups-v2/word-solvers-warmup/intro.mp3",
    "script": "Today we are reading all about the sky! Look at each word. If it belongs in the sky, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Sky"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-wind.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "sun",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-sun.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "cloud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-cloud.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "moon",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-moon.mp3"
        },
        {
          "word": "sock",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-bird.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "star",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-solvers-warmup/w-star.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-solvers-warmup/celebrate.mp3",
    "script": "You caught them! Wind, cloud, bird, and sun. All of them belong in the sky, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-solvers-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like wind, cloud, and bird belong in the sky. Watch for them in today's lesson. You will spot them, I know it."
  }
};
