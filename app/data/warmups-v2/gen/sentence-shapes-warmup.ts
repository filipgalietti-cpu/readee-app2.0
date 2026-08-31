import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for sentence-shapes (RF.1.1a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=sentence-shapes --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "sentence-shapes-warmup",
  "lessonId": "sentence-shapes",
  "lessonTitle": "Sentence Shapes",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Outer Space Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in outer space!",
  "intro": {
    "audio": "/audio/warmups-v2/sentence-shapes-warmup/intro.mp3",
    "script": "Today we are reading all about outer space! Look at each word. If it belongs in outer space, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Outer Space"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "star",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-star.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "rocket",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-rocket.mp3"
        },
        {
          "word": "grass",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "moon",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-moon.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "planet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-planet.mp3"
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
          "word": "alien",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-alien.mp3"
        },
        {
          "word": "river",
          "isMatch": false
        },
        {
          "word": "earth",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-shapes-warmup/w-earth.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/sentence-shapes-warmup/celebrate.mp3",
    "script": "You caught them! Star, moon, alien, and rocket. All of them belong in outer space, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/sentence-shapes-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like star, moon, and alien belong in outer space. Watch for them in today's lesson. You will spot them, I know it."
  }
};
