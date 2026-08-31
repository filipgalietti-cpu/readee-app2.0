import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for parts-of-a-book (RI.K.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=parts-of-a-book --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "parts-of-a-book-warmup",
  "lessonId": "parts-of-a-book",
  "lessonTitle": "Parts of a Book",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Fish Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with the fish!",
  "intro": {
    "audio": "/audio/warmups-v2/parts-of-a-book-warmup/intro.mp3",
    "script": "Today we are reading all about some fish! Look at each word. If it belongs with the fish, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Fish"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-water.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        },
        {
          "word": "fins",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-fins.mp3"
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
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-swim.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        },
        {
          "word": "scale",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-scale.mp3"
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
          "word": "ocean",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-ocean.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/parts-of-a-book-warmup/w-pond.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/parts-of-a-book-warmup/celebrate.mp3",
    "script": "You caught them! Water, swim, ocean, and fins. All of them belong with the fish, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/parts-of-a-book-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like water, swim, and ocean belong with the fish. Watch for them in today's lesson. You will spot them, I know it."
  }
};
