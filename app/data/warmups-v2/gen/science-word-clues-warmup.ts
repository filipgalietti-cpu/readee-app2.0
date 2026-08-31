import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for science-word-clues (RI.2.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=science-word-clues --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "science-word-clues-warmup",
  "lessonId": "science-word-clues",
  "lessonTitle": "Science Word Clues",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Beavers Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with beavers, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/science-word-clues-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about busy beavers! Look at each word. If it belongs if it belongs with beavers, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Beavers"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "gnaw",
          "isMatch": true
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-clues-warmup/w-pond.mp3"
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
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-clues-warmup/w-tree.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "sticks",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-clues-warmup/w-sticks.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "lodge",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-clues-warmup/w-lodge.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/science-word-clues-warmup/w-water.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/science-word-clues-warmup/celebrate.mp3",
    "script": "You caught them! Gnaw, tree, lodge, and pond. All of them belong if it belongs with beavers, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/science-word-clues-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like gnaw, tree, and lodge belong if it belongs with beavers, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
