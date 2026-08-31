import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for words-in-your-world (L.2.5a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=words-in-your-world --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "words-in-your-world-warmup",
  "lessonId": "words-in-your-world",
  "lessonTitle": "Words in Your World",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Town Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in town!",
  "intro": {
    "audio": "/audio/warmups-v2/words-in-your-world-warmup/intro.mp3",
    "script": "Today we are reading all about a trip to town! Look at each word. If it belongs in town, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Town"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "peach",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-peach.mp3"
        },
        {
          "word": "ocean",
          "isMatch": false
        },
        {
          "word": "ballgame",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-ballgame.mp3"
        },
        {
          "word": "castle",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "market",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-market.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "cheer",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-cheer.mp3"
        },
        {
          "word": "forest",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "library",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-library.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "grandpa",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-in-your-world-warmup/w-grandpa.mp3"
        },
        {
          "word": "rainbow",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/words-in-your-world-warmup/celebrate.mp3",
    "script": "You caught them! Peach, market, library, and ballgame. All of them belong in town, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/words-in-your-world-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like peach, market, and library belong in town. Watch for them in today's lesson. You will spot them, I know it."
  }
};
