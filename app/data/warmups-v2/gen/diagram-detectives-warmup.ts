import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for diagram-detectives (RI.K.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=diagram-detectives --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "diagram-detectives-warmup",
  "lessonId": "diagram-detectives",
  "lessonTitle": "Diagram Detectives",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Ladybug Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a ladybug!",
  "intro": {
    "audio": "/audio/warmups-v2/diagram-detectives-warmup/intro.mp3",
    "script": "Today we are reading all about a ladybug! Look at each word. If it belongs with a ladybug, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Ladybug"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "spots",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-spots.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "wings",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-wings.mp3"
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
          "word": "red",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-red.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bug",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-bug.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "fly",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-fly.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "garden",
          "isMatch": true,
          "audio": "/audio/warmups-v2/diagram-detectives-warmup/w-garden.mp3"
        },
        {
          "word": "candy",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/diagram-detectives-warmup/celebrate.mp3",
    "script": "You caught them! Spots, red, fly, and wings. All of them belong with a ladybug, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/diagram-detectives-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like spots, red, and fly belong with a ladybug. Watch for them in today's lesson. You will spot them, I know it."
  }
};
