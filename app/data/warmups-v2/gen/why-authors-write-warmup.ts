import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for why-authors-write (RI.2.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=why-authors-write --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "why-authors-write-warmup",
  "lessonId": "why-authors-write",
  "lessonTitle": "Why Authors Write",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Worker Bees Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with worker bees!",
  "intro": {
    "audio": "/audio/warmups-v2/why-authors-write-warmup/intro.mp3",
    "script": "Today we are reading all about worker bees making honey! Look at each word. If it belongs with worker bees, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Worker Bees"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bee",
          "isMatch": true
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "hive",
          "isMatch": true,
          "audio": "/audio/warmups-v2/why-authors-write-warmup/w-hive.mp3"
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
          "word": "flower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/why-authors-write-warmup/w-flower.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "honey",
          "isMatch": true,
          "audio": "/audio/warmups-v2/why-authors-write-warmup/w-honey.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "nectar",
          "isMatch": true,
          "audio": "/audio/warmups-v2/why-authors-write-warmup/w-nectar.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "wax",
          "isMatch": true,
          "audio": "/audio/warmups-v2/why-authors-write-warmup/w-wax.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/why-authors-write-warmup/celebrate.mp3",
    "script": "You caught them! Bee, flower, nectar, and hive. All of them belong with worker bees, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/why-authors-write-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bee, flower, and nectar belong with worker bees. Watch for them in today's lesson. You will spot them, I know it."
  }
};
