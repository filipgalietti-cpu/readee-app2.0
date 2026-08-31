import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for grammar-builders (L.1.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=grammar-builders --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "grammar-builders-warmup",
  "lessonId": "grammar-builders",
  "lessonTitle": "Grammar Builders",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Animals Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with the animals, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/grammar-builders-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about animals! Look at each word. If it belongs if it belongs with the animals, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Animals"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-dog.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-bird.mp3"
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
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-fish.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "frog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-frog.mp3"
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
          "word": "cat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-cat.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/grammar-builders-warmup/w-duck.mp3"
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/grammar-builders-warmup/celebrate.mp3",
    "script": "You caught them! Dog, fish, cat, and bird. All of them belong if it belongs with the animals, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/grammar-builders-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like dog, fish, and cat belong if it belongs with the animals, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
