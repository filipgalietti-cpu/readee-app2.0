import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for clue-hunters (L.2.4a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=clue-hunters --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "clue-hunters-warmup",
  "lessonId": "clue-hunters",
  "lessonTitle": "Clue Hunters",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Clue Hunting Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in clue hunting!",
  "intro": {
    "audio": "/audio/warmups-v2/clue-hunters-warmup/intro.mp3",
    "script": "Today we are reading all about clue hunting! Look at each word. If it belongs in clue hunting, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Clue Hunting"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "search",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-search.mp3"
        },
        {
          "word": "cookie",
          "isMatch": false
        },
        {
          "word": "solve",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-solve.mp3"
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
          "word": "find",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-find.mp3"
        },
        {
          "word": "purple",
          "isMatch": false
        },
        {
          "word": "hidden",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-hidden.mp3"
        },
        {
          "word": "sleep",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "mystery",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-mystery.mp3"
        },
        {
          "word": "sing",
          "isMatch": false
        },
        {
          "word": "follow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/clue-hunters-warmup/w-follow.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/clue-hunters-warmup/celebrate.mp3",
    "script": "You caught them! Search, find, mystery, and solve. All of them belong in clue hunting, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/clue-hunters-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like search, find, and mystery belong in clue hunting. Watch for them in today's lesson. You will spot them, I know it."
  }
};
