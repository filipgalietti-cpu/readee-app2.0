import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for paragraph-power (RI.2.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=paragraph-power --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "paragraph-power-warmup",
  "lessonId": "paragraph-power",
  "lessonTitle": "Paragraph Power",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Recycling Truck Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a recycling truck!",
  "intro": {
    "audio": "/audio/warmups-v2/paragraph-power-warmup/intro.mp3",
    "script": "Today we are reading all about a recycling truck! Look at each word. If it belongs with a recycling truck, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Recycling Truck"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bottles",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-bottles.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "bin",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-bin.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "paper",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-paper.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "arm",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-arm.mp3"
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
          "word": "cans",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-cans.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "load",
          "isMatch": true,
          "audio": "/audio/warmups-v2/paragraph-power-warmup/w-load.mp3"
        },
        {
          "word": "zebra",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/paragraph-power-warmup/celebrate.mp3",
    "script": "You caught them! Bottles, paper, cans, and bin. All of them belong with a recycling truck, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/paragraph-power-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bottles, paper, and cans belong with a recycling truck. Watch for them in today's lesson. You will spot them, I know it."
  }
};
