import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for ask-it-find-it (RL.1.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=ask-it-find-it --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "ask-it-find-it-warmup",
  "lessonId": "ask-it-find-it",
  "lessonTitle": "Ask It, Find It",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Hen And Her Eggs Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a hen and her eggs!",
  "intro": {
    "audio": "/audio/warmups-v2/ask-it-find-it-warmup/intro.mp3",
    "script": "Today's story has a hen and her eggs in it! Look at each word. If it belongs with a hen and her eggs, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Hen And Her Eggs"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "chick",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-it-find-it-warmup/w-chick.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "coop",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-it-find-it-warmup/w-coop.mp3"
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
          "word": "nest",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-it-find-it-warmup/w-nest.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "peck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-it-find-it-warmup/w-peck.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "shed",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-it-find-it-warmup/w-shed.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "banana",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/ask-it-find-it-warmup/celebrate.mp3",
    "script": "You caught it! Chick, nest, shed, and coop. All of them belong with a hen and her eggs, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/ask-it-find-it-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like chick, nest, and shed belong with a hen and her eggs. Watch for them in today's lesson. You will spot them, I know it."
  }
};
