import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-toolbox (L.1.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-toolbox --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-toolbox-warmup",
  "lessonId": "word-toolbox",
  "lessonTitle": "Word Toolbox",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Park Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs at the park!",
  "intro": {
    "audio": "/audio/warmups-v2/word-toolbox-warmup/intro.mp3",
    "script": "Today we are reading all about max and rex at the park! Look at each word. If it belongs at the park, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Park"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-dog.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        },
        {
          "word": "mud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-mud.mp3"
        },
        {
          "word": "mom",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-tree.mp3"
        },
        {
          "word": "ring",
          "isMatch": false
        },
        {
          "word": "play",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-play.mp3"
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
          "word": "ball",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-ball.mp3"
        },
        {
          "word": "home",
          "isMatch": false
        },
        {
          "word": "runs",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-toolbox-warmup/w-runs.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-toolbox-warmup/celebrate.mp3",
    "script": "You caught them! Dog, tree, ball, and mud. All of them belong at the park, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-toolbox-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like dog, tree, and ball belong at the park. Watch for them in today's lesson. You will spot them, I know it."
  }
};
