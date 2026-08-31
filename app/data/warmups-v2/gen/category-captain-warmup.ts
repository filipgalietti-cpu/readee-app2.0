import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for category-captain (L.1.5a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/category. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=category-captain --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "category-captain-warmup",
  "lessonId": "category-captain",
  "lessonTitle": "Category Captain",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Animals Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with animals!",
  "intro": {
    "audio": "/audio/warmups-v2/category-captain-warmup/intro.mp3",
    "script": "Today we are hunting for words that go together, like animals! Look at each word. If it belongs with animals, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Animals"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/category-captain-warmup/w-bird.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "cow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/category-captain-warmup/w-cow.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/category-captain-warmup/w-fish.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bee",
          "isMatch": true
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/category-captain-warmup/w-dog.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "shark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/category-captain-warmup/w-shark.mp3"
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/category-captain-warmup/celebrate.mp3",
    "script": "You caught them! Bird, fish, dog, and cow. All of them belong with animals, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/category-captain-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bird, fish, and dog belong with animals. Watch for them in today's lesson. You will spot them, I know it."
  }
};
