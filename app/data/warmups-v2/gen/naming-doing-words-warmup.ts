import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for naming-doing-words (K.L.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=naming-doing-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "naming-doing-words-warmup",
  "lessonId": "naming-doing-words",
  "lessonTitle": "Naming & Doing Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Dog Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a dog!",
  "intro": {
    "audio": "/audio/warmups-v2/naming-doing-words-warmup/intro.mp3",
    "script": "Today we are reading all about a dog! Look at each word. If it belongs with a dog, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Dog"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/naming-doing-words-warmup/w-bark.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "bone",
          "isMatch": true,
          "audio": "/audio/warmups-v2/naming-doing-words-warmup/w-bone.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "paws",
          "isMatch": true
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "walk",
          "isMatch": true,
          "audio": "/audio/warmups-v2/naming-doing-words-warmup/w-walk.mp3"
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
          "word": "leash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/naming-doing-words-warmup/w-leash.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "fetch",
          "isMatch": true,
          "audio": "/audio/warmups-v2/naming-doing-words-warmup/w-fetch.mp3"
        },
        {
          "word": "flower",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/naming-doing-words-warmup/celebrate.mp3",
    "script": "You caught them! Bark, paws, leash, and bone. All of them belong with a dog, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/naming-doing-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bark, paws, and leash belong with a dog. Watch for them in today's lesson. You will spot them, I know it."
  }
};
