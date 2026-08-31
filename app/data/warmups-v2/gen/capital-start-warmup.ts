import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for capital-start (K.L.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=capital-start --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "capital-start-warmup",
  "lessonId": "capital-start",
  "lessonTitle": "Capital Start, Power Stop",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Park Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs at the park!",
  "intro": {
    "audio": "/audio/warmups-v2/capital-start-warmup/intro.mp3",
    "script": "Today we are reading all about a fun day at the park! Look at each word. If it belongs at the park, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Park"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "swing",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-swing.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-tree.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "slide",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-slide.mp3"
        },
        {
          "word": "zipper",
          "isMatch": false
        },
        {
          "word": "bench",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-bench.mp3"
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
          "word": "grass",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-grass.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/capital-start-warmup/w-duck.mp3"
        },
        {
          "word": "sock",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/capital-start-warmup/celebrate.mp3",
    "script": "You caught them! Swing, slide, grass, and tree. All of them belong at the park, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/capital-start-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like swing, slide, and grass belong at the park. Watch for them in today's lesson. You will spot them, I know it."
  }
};
