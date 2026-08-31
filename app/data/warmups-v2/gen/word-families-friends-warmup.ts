import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-families-friends (K.L.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/category. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-families-friends --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-families-friends-warmup",
  "lessonId": "word-families-friends",
  "lessonTitle": "Word Families & Friends",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Foods Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with foods!",
  "intro": {
    "audio": "/audio/warmups-v2/word-families-friends-warmup/intro.mp3",
    "script": "Today we are hunting for words that go together, like foods! Look at each word. If it belongs with foods, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Foods"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "apple",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-apple.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bread",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-bread.mp3"
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
          "word": "milk",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-milk.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "grape",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-grape.mp3"
        },
        {
          "word": "door",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "pear",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-pear.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "pizza",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-families-friends-warmup/w-pizza.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-families-friends-warmup/celebrate.mp3",
    "script": "You caught them! Apple, milk, pear, and bread. All of them belong with foods, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-families-friends-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like apple, milk, and pear belong with foods. Watch for them in today's lesson. You will spot them, I know it."
  }
};
