import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for look-it-up (L.2.4e) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=look-it-up --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "look-it-up-warmup",
  "lessonId": "look-it-up",
  "lessonTitle": "Look It Up",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Horses Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with horses!",
  "intro": {
    "audio": "/audio/warmups-v2/look-it-up-warmup/intro.mp3",
    "script": "Today we are reading all about horses! Look at each word. If it belongs with horses, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Horses"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "pony",
          "isMatch": true,
          "audio": "/audio/warmups-v2/look-it-up-warmup/w-pony.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        },
        {
          "word": "saddle",
          "isMatch": true,
          "audio": "/audio/warmups-v2/look-it-up-warmup/w-saddle.mp3"
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
          "word": "mane",
          "isMatch": true
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "stable",
          "isMatch": true,
          "audio": "/audio/warmups-v2/look-it-up-warmup/w-stable.mp3"
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
          "word": "tail",
          "isMatch": true,
          "audio": "/audio/warmups-v2/look-it-up-warmup/w-tail.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "hoof",
          "isMatch": true
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/look-it-up-warmup/celebrate.mp3",
    "script": "You caught them! Pony, mane, tail, and saddle. All of them belong with horses, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/look-it-up-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like pony, mane, and tail belong with horses. Watch for them in today's lesson. You will spot them, I know it."
  }
};
