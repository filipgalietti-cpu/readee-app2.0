import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for rule-breaker-words (L.2.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/category. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=rule-breaker-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "rule-breaker-words-warmup",
  "lessonId": "rule-breaker-words",
  "lessonTitle": "Rule Breaker Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pond Animals Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with pond animals!",
  "intro": {
    "audio": "/audio/warmups-v2/rule-breaker-words-warmup/intro.mp3",
    "script": "Today we are hunting for words that go together, like pond animals! Look at each word. If it belongs with pond animals, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Pond Animals"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "mice",
          "isMatch": true,
          "audio": "/audio/warmups-v2/rule-breaker-words-warmup/w-mice.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        },
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/rule-breaker-words-warmup/w-water.mp3"
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
          "word": "goose",
          "isMatch": true,
          "audio": "/audio/warmups-v2/rule-breaker-words-warmup/w-goose.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        },
        {
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/rule-breaker-words-warmup/w-swim.mp3"
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
          "word": "bank",
          "isMatch": true,
          "audio": "/audio/warmups-v2/rule-breaker-words-warmup/w-bank.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "rocket",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/rule-breaker-words-warmup/celebrate.mp3",
    "script": "You caught them! Mice, goose, bank, and water. All of them belong with pond animals, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/rule-breaker-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like mice, goose, and bank belong with pond animals. Watch for them in today's lesson. You will spot them, I know it."
  }
};
