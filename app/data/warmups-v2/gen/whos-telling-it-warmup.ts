import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for whos-telling-it (RL.1.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=whos-telling-it --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "whos-telling-it-warmup",
  "lessonId": "whos-telling-it",
  "lessonTitle": "Who's Telling It",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pond Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs at a pond!",
  "intro": {
    "audio": "/audio/warmups-v2/whos-telling-it-warmup/intro.mp3",
    "script": "Today's story has a pond in it! Look at each word. If it belongs at a pond, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Pond"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-duck.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-swim.mp3"
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
          "word": "bread",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-bread.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "frog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-frog.mp3"
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
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-water.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whos-telling-it-warmup/w-fish.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/whos-telling-it-warmup/celebrate.mp3",
    "script": "You caught it! Duck, bread, water, and swim. All of them belong at a pond, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/whos-telling-it-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like duck, bread, and water belong at a pond. Watch for them in today's lesson. You will spot them, I know it."
  }
};
