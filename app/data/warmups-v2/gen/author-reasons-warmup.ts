import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for author-reasons (RI.K.8) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=author-reasons --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "author-reasons-warmup",
  "lessonId": "author-reasons",
  "lessonTitle": "Because...",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bears Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with bears!",
  "intro": {
    "audio": "/audio/warmups-v2/author-reasons-warmup/intro.mp3",
    "script": "Today we are reading all about real bears! Look at each word. If it belongs with bears, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Bears"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "sleep",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-sleep.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "river",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-river.mp3"
        },
        {
          "word": "socks",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "cold",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-cold.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "climb",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-climb.mp3"
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
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-fish.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        },
        {
          "word": "trees",
          "isMatch": true,
          "audio": "/audio/warmups-v2/author-reasons-warmup/w-trees.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/author-reasons-warmup/celebrate.mp3",
    "script": "You caught them! Sleep, cold, fish, and river. All of them belong with bears, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/author-reasons-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like sleep, cold, and fish belong with bears. Watch for them in today's lesson. You will spot them, I know it."
  }
};
