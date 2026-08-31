import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for book-team-up (RI.2.9) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=book-team-up --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "book-team-up-warmup",
  "lessonId": "book-team-up",
  "lessonTitle": "Book Team-Up",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Dolphins Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with dolphins, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/book-team-up-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about dolphins! Look at each word. If it belongs if it belongs with dolphins, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Dolphins"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-swim.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "blowhole",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-blowhole.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "ocean",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-ocean.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "whistle",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-whistle.mp3"
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
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-water.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        },
        {
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-team-up-warmup/w-fish.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/book-team-up-warmup/celebrate.mp3",
    "script": "You caught them! Swim, ocean, water, and blowhole. All of them belong if it belongs with dolphins, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/book-team-up-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like swim, ocean, and water belong if it belongs with dolphins, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
