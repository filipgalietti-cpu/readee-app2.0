import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-pictures (RL.1.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-pictures --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-pictures-warmup",
  "lessonId": "word-pictures",
  "lessonTitle": "Word Pictures",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Rainy Day Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on a rainy day!",
  "intro": {
    "audio": "/audio/warmups-v2/word-pictures-warmup/intro.mp3",
    "script": "Today's story has a rainy day in it! Look at each word. If it belongs on a rainy day, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Rainy Day"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "rain",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-rain.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "pool",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-pool.mp3"
        },
        {
          "word": "banana",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "clouds",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-clouds.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "wet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-wet.mp3"
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
          "word": "splash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-splash.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "drops",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-pictures-warmup/w-drops.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-pictures-warmup/celebrate.mp3",
    "script": "You caught it! Rain, clouds, splash, and pool. All of them belong on a rainy day, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-pictures-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like rain, clouds, and splash belong on a rainy day. Watch for them in today's lesson. You will spot them, I know it."
  }
};
