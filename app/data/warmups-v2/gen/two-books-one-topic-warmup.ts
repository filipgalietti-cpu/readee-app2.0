import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for two-books-one-topic (RI.K.9) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=two-books-one-topic --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "two-books-one-topic-warmup",
  "lessonId": "two-books-one-topic",
  "lessonTitle": "Two Books, One Topic",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Penguins Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with penguins!",
  "intro": {
    "audio": "/audio/warmups-v2/two-books-one-topic-warmup/intro.mp3",
    "script": "Today we are reading all about penguins! Look at each word. If it belongs with penguins, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Penguins"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-bird.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "slide",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-slide.mp3"
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
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-swim.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "ice",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-ice.mp3"
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
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-fish.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "cold",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-books-one-topic-warmup/w-cold.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/two-books-one-topic-warmup/celebrate.mp3",
    "script": "You caught them! Bird, swim, fish, and slide. All of them belong with penguins, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/two-books-one-topic-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bird, swim, and fish belong with penguins. Watch for them in today's lesson. You will spot them, I know it."
  }
};
