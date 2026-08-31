import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for find-it-fast (RI.2.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=find-it-fast --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "find-it-fast-warmup",
  "lessonId": "find-it-fast",
  "lessonTitle": "Find It Fast",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Owl Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with an owl!",
  "intro": {
    "audio": "/audio/warmups-v2/find-it-fast-warmup/intro.mp3",
    "script": "Today we are reading all about an owl! Look at each word. If it belongs with an owl, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "An Owl"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "eyes",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-eyes.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "babies",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-babies.mp3"
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
          "word": "claws",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-claws.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "hunt",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-hunt.mp3"
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
          "word": "feathers",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-feathers.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "wings",
          "isMatch": true,
          "audio": "/audio/warmups-v2/find-it-fast-warmup/w-wings.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/find-it-fast-warmup/celebrate.mp3",
    "script": "You caught them! Eyes, claws, feathers, and babies. All of them belong with an owl, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/find-it-fast-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like eyes, claws, and feathers belong with an owl. Watch for them in today's lesson. You will spot them, I know it."
  }
};
