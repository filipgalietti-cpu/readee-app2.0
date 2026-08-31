import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-questions (RI.1.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-questions --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-questions-warmup",
  "lessonId": "fact-questions",
  "lessonTitle": "Fact Questions",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Ants Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with the ants!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-questions-warmup/intro.mp3",
    "script": "Today we are reading all about busy ants! Look at each word. If it belongs with the ants, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Ants"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "nests",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-nests.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "smell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-smell.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "ground",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-ground.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "trail",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-trail.mp3"
        },
        {
          "word": "moon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "legs",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-legs.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "home",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-questions-warmup/w-home.mp3"
        },
        {
          "word": "glove",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-questions-warmup/celebrate.mp3",
    "script": "You caught them! Nests, ground, legs, and smell. All of them belong with the ants, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-questions-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like nests, ground, and legs belong with the ants. Watch for them in today's lesson. You will spot them, I know it."
  }
};
