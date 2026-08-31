import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for reading-with-purpose (RF.1.4a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=reading-with-purpose --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "reading-with-purpose-warmup",
  "lessonId": "reading-with-purpose",
  "lessonTitle": "Reading with Purpose",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pond Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs at the pond!",
  "intro": {
    "audio": "/audio/warmups-v2/reading-with-purpose-warmup/intro.mp3",
    "script": "Today we are reading all about a frog at the pond! Look at each word. If it belongs at the pond, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Pond"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "frog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-frog.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-duck.mp3"
        },
        {
          "word": "sock",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "net",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-net.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-fish.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-water.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        },
        {
          "word": "mud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-with-purpose-warmup/w-mud.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/reading-with-purpose-warmup/celebrate.mp3",
    "script": "You caught them! Frog, net, water, and duck. All of them belong at the pond, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/reading-with-purpose-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like frog, net, and water belong at the pond. Watch for them in today's lesson. You will spot them, I know it."
  }
};
