import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for whats-it-about (RI.K.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=whats-it-about --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "whats-it-about-warmup",
  "lessonId": "whats-it-about",
  "lessonTitle": "What's It All About?",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bees Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with busy bees!",
  "intro": {
    "audio": "/audio/warmups-v2/whats-it-about-warmup/intro.mp3",
    "script": "Today we are reading all about busy bees! Look at each word. If it belongs with busy bees, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Bees"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "hive",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-hive.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "nectar",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-nectar.mp3"
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
          "word": "buzz",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-buzz.mp3"
        },
        {
          "word": "happy",
          "isMatch": false
        },
        {
          "word": "flower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-flower.mp3"
        },
        {
          "word": "crayon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "honey",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-honey.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "sting",
          "isMatch": true,
          "audio": "/audio/warmups-v2/whats-it-about-warmup/w-sting.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/whats-it-about-warmup/celebrate.mp3",
    "script": "You caught them! Hive, buzz, honey, and nectar. All of them belong with busy bees, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/whats-it-about-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like hive, buzz, and honey belong with busy bees. Watch for them in today's lesson. You will spot them, I know it."
  }
};
