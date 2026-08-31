import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for words-in-real-life (L.1.5c) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=words-in-real-life --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "words-in-real-life-warmup",
  "lessonId": "words-in-real-life",
  "lessonTitle": "Words in Real Life",
  "playSeconds": 45,
  "carrots": 2,
  "title": "My Neighborhood Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in my neighborhood!",
  "intro": {
    "audio": "/audio/warmups-v2/words-in-real-life-warmup/intro.mp3",
    "script": "Today we are reading all about my neighborhood! Look at each word. If it belongs in my neighborhood, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "My Neighborhood"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "house",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-house.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-tree.mp3"
        },
        {
          "word": "dragon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "street",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-street.mp3"
        },
        {
          "word": "planet",
          "isMatch": false
        },
        {
          "word": "car",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-car.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "park",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-park.mp3"
        },
        {
          "word": "castle",
          "isMatch": false
        },
        {
          "word": "store",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-real-life-warmup/w-store.mp3"
        },
        {
          "word": "volcano",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/words-in-real-life-warmup/celebrate.mp3",
    "script": "You caught them! House, street, park, and tree. All of them belong in my neighborhood, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/words-in-real-life-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like house, street, and park belong in my neighborhood. Watch for them in today's lesson. You will spot them, I know it."
  }
};
