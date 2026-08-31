import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for hold-it-up (RI.2.8) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=hold-it-up --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "hold-it-up-warmup",
  "lessonId": "hold-it-up",
  "lessonTitle": "Hold It Up!",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Water Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs about water!",
  "intro": {
    "audio": "/audio/warmups-v2/hold-it-up-warmup/intro.mp3",
    "script": "Today we are reading all about all about water! Look at each word. If it belongs about water, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Water"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "drink",
          "isMatch": true,
          "audio": "/audio/warmups-v2/hold-it-up-warmup/w-drink.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "pour",
          "isMatch": true
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
          "word": "cool",
          "isMatch": true,
          "audio": "/audio/warmups-v2/hold-it-up-warmup/w-cool.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "wash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/hold-it-up-warmup/w-wash.mp3"
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
          "word": "wet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/hold-it-up-warmup/w-wet.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "drop",
          "isMatch": true,
          "audio": "/audio/warmups-v2/hold-it-up-warmup/w-drop.mp3"
        },
        {
          "word": "sleep",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/hold-it-up-warmup/celebrate.mp3",
    "script": "You caught them! Drink, cool, wet, and pour. All of them belong about water, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/hold-it-up-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like drink, cool, and wet belong about water. Watch for them in today's lesson. You will spot them, I know it."
  }
};
