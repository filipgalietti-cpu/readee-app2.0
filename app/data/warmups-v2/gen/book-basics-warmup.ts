import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for book-basics (RF.K.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=book-basics --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "book-basics-warmup",
  "lessonId": "book-basics",
  "lessonTitle": "How Books Work",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Garden Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a garden!",
  "intro": {
    "audio": "/audio/warmups-v2/book-basics-warmup/intro.mp3",
    "script": "Today we are reading all about a garden! Look at each word. If it belongs in a garden, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Garden"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "apple",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-apple.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        },
        {
          "word": "bug",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-bug.mp3"
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
          "word": "plant",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-plant.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        },
        {
          "word": "grass",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-grass.mp3"
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
          "word": "flower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-flower.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-basics-warmup/w-tree.mp3"
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/book-basics-warmup/celebrate.mp3",
    "script": "You caught them! Apple, plant, flower, and bug. All of them belong in a garden, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/book-basics-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like apple, plant, and flower belong in a garden. Watch for them in today's lesson. You will spot them, I know it."
  }
};
