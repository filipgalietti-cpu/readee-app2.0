import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for two-texts-compare (RI.1.9) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=two-texts-compare --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "two-texts-compare-warmup",
  "lessonId": "two-texts-compare",
  "lessonTitle": "Two Texts Compare",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Sea Otters Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with sea otters!",
  "intro": {
    "audio": "/audio/warmups-v2/two-texts-compare-warmup/intro.mp3",
    "script": "Today we are reading all about sea otters! Look at each word. If it belongs with sea otters, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Sea Otters"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "fur",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-fur.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "pup",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-pup.mp3"
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
          "word": "dive",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-dive.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "float",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-float.mp3"
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
          "word": "shell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-shell.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "clams",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-texts-compare-warmup/w-clams.mp3"
        },
        {
          "word": "kite",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/two-texts-compare-warmup/celebrate.mp3",
    "script": "You caught them! Fur, dive, shell, and pup. All of them belong with sea otters, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/two-texts-compare-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like fur, dive, and shell belong with sea otters. Watch for them in today's lesson. You will spot them, I know it."
  }
};
