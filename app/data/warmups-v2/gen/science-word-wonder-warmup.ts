import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for science-word-wonder (RI.K.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=science-word-wonder --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "science-word-wonder-warmup",
  "lessonId": "science-word-wonder",
  "lessonTitle": "Science Word Wonder",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Butterflies Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with butterflies!",
  "intro": {
    "audio": "/audio/warmups-v2/science-word-wonder-warmup/intro.mp3",
    "script": "Today we are reading all about butterflies! Look at each word. If it belongs with butterflies, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Butterflies"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "nectar",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-nectar.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "sip",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-sip.mp3"
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
          "word": "flower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-flower.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "hatch",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-hatch.mp3"
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
          "word": "egg",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-egg.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "wing",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-wonder-warmup/w-wing.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/science-word-wonder-warmup/celebrate.mp3",
    "script": "You caught them! Nectar, flower, egg, and sip. All of them belong with butterflies, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/science-word-wonder-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like nectar, flower, and egg belong with butterflies. Watch for them in today's lesson. You will spot them, I know it."
  }
};
