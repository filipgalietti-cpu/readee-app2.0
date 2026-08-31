import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for pictures-that-teach (RI.2.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=pictures-that-teach --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "pictures-that-teach-warmup",
  "lessonId": "pictures-that-teach",
  "lessonTitle": "Pictures That Teach",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pulley Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a pulley!",
  "intro": {
    "audio": "/audio/warmups-v2/pictures-that-teach-warmup/intro.mp3",
    "script": "Today we are reading all about a pulley! Look at each word. If it belongs with a pulley, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Pulley"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "rope",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-rope.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "lift",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-lift.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "wheel",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-wheel.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "basket",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-basket.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "pull",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-pull.mp3"
        },
        {
          "word": "happy",
          "isMatch": false
        },
        {
          "word": "groove",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-that-teach-warmup/w-groove.mp3"
        },
        {
          "word": "flower",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/pictures-that-teach-warmup/celebrate.mp3",
    "script": "You caught them! Rope, wheel, pull, and lift. All of them belong with a pulley, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/pictures-that-teach-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like rope, wheel, and pull belong with a pulley. Watch for them in today's lesson. You will spot them, I know it."
  }
};
