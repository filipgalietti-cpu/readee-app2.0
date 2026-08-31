import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-links (RI.1.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-links --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-links-warmup",
  "lessonId": "fact-links",
  "lessonTitle": "Fact Links",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Beavers Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with busy beavers!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-links-warmup/intro.mp3",
    "script": "Today we are reading all about busy beavers! Look at each word. If it belongs with busy beavers, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Beavers"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "teeth",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-links-warmup/w-teeth.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "stream",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-links-warmup/w-stream.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "trees",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-links-warmup/w-trees.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "dam",
          "isMatch": true
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
          "word": "sticks",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-links-warmup/w-sticks.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-links-warmup/w-pond.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-links-warmup/celebrate.mp3",
    "script": "You caught them! Teeth, trees, sticks, and stream. All of them belong with busy beavers, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-links-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like teeth, trees, and sticks belong with busy beavers. Watch for them in today's lesson. You will spot them, I know it."
  }
};
