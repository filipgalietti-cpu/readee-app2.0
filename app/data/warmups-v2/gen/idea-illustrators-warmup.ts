import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for idea-illustrators (RI.1.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=idea-illustrators --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "idea-illustrators-warmup",
  "lessonId": "idea-illustrators",
  "lessonTitle": "Idea Illustrators",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Giraffes Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with giraffes, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/idea-illustrators-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about giraffes! Look at each word. If it belongs if it belongs with giraffes, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Giraffes"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "neck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/idea-illustrators-warmup/w-neck.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "leaves",
          "isMatch": true,
          "audio": "/audio/warmups-v2/idea-illustrators-warmup/w-leaves.mp3"
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
          "word": "spots",
          "isMatch": true,
          "audio": "/audio/warmups-v2/idea-illustrators-warmup/w-spots.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "baby",
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
          "word": "tall",
          "isMatch": true,
          "audio": "/audio/warmups-v2/idea-illustrators-warmup/w-tall.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "fast",
          "isMatch": true,
          "audio": "/audio/warmups-v2/idea-illustrators-warmup/w-fast.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/idea-illustrators-warmup/celebrate.mp3",
    "script": "You caught them! Neck, spots, tall, and leaves. All of them belong if it belongs with giraffes, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/idea-illustrators-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like neck, spots, and tall belong if it belongs with giraffes, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
