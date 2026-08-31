import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for topic-spotter (RI.1.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=topic-spotter --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "topic-spotter-warmup",
  "lessonId": "topic-spotter",
  "lessonTitle": "Topic Spotter",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Moon Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on the moon!",
  "intro": {
    "audio": "/audio/warmups-v2/topic-spotter-warmup/intro.mp3",
    "script": "Today we are reading all about the moon! Look at each word. If it belongs on the moon, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Moon"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "earth",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-earth.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "craters",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-craters.mp3"
        },
        {
          "word": "flower",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "light",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-light.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "rocks",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-rocks.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "holes",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-holes.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "space",
          "isMatch": true,
          "audio": "/audio/warmups-v2/topic-spotter-warmup/w-space.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/topic-spotter-warmup/celebrate.mp3",
    "script": "You caught them! Earth, light, holes, and craters. All of them belong on the moon, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/topic-spotter-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like earth, light, and holes belong on the moon. Watch for them in today's lesson. You will spot them, I know it."
  }
};
