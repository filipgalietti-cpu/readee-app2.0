import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for what-is-it (L.1.5b) by scripts/warmup-generate.ts.
// Recipe: topic-scout/category. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=what-is-it --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "what-is-it-warmup",
  "lessonId": "what-is-it",
  "lessonTitle": "What Is It?",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Living Things Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with living things, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/what-is-it-warmup/intro.mp3",
    "script": "Today we are hunting for words that go together, like today's story has living things in it! Look at each word. If it belongs if it belongs with living things, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Living Things"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-duck.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-bird.mp3"
        },
        {
          "word": "house",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tiger",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-tiger.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "cow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-cow.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "apple",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-apple.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "plant",
          "isMatch": true,
          "audio": "/audio/warmups-v2/what-is-it-warmup/w-plant.mp3"
        },
        {
          "word": "clock",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/what-is-it-warmup/celebrate.mp3",
    "script": "You caught them! Duck, tiger, apple, and bird. All of them belong if it belongs with living things, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/what-is-it-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like duck, tiger, and apple belong if it belongs with living things, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
