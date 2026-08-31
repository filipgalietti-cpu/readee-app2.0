import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-book-makers (RI.K.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-book-makers --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-book-makers-warmup",
  "lessonId": "fact-book-makers",
  "lessonTitle": "Fact Book Makers",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Turtles Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with the turtles!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-book-makers-warmup/intro.mp3",
    "script": "Today we are reading all about turtles! Look at each word. If it belongs with the turtles, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Turtles"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "shell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-shell.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-pond.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "egg",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-egg.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "slow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-slow.mp3"
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
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-swim.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-book-makers-warmup/w-water.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-book-makers-warmup/celebrate.mp3",
    "script": "You caught them! Shell, egg, swim, and pond. All of them belong with the turtles, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-book-makers-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like shell, egg, and swim belong with the turtles. Watch for them in today's lesson. You will spot them, I know it."
  }
};
