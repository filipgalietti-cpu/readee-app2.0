import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for prove-it (RI.1.8) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=prove-it --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "prove-it-warmup",
  "lessonId": "prove-it",
  "lessonTitle": "Prove It!",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Helper Dogs Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with helper dogs!",
  "intro": {
    "audio": "/audio/warmups-v2/prove-it-warmup/intro.mp3",
    "script": "Today we are reading all about helper dogs! Look at each word. If it belongs with helper dogs, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Helper Dogs"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "smell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-smell.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "bark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-bark.mp3"
        },
        {
          "word": "clock",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "calm",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-calm.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "furry",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-furry.mp3"
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
          "word": "leash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-leash.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "treat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/prove-it-warmup/w-treat.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/prove-it-warmup/celebrate.mp3",
    "script": "You caught them! Smell, calm, leash, and bark. All of them belong with helper dogs, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/prove-it-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like smell, calm, and leash belong with helper dogs. Watch for them in today's lesson. You will spot them, I know it."
  }
};
