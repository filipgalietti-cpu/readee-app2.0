import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for describe-it-better (L.2.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=describe-it-better --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "describe-it-better-warmup",
  "lessonId": "describe-it-better",
  "lessonTitle": "Describe It Better",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Turtle Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a turtle!",
  "intro": {
    "audio": "/audio/warmups-v2/describe-it-better-warmup/intro.mp3",
    "script": "Today we are reading all about a turtle! Look at each word. If it belongs with a turtle, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Turtle"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "shell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-shell.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "rock",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-rock.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-pond.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "sand",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-sand.mp3"
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
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-swim.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "crawl",
          "isMatch": true,
          "audio": "/audio/warmups-v2/describe-it-better-warmup/w-crawl.mp3"
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/describe-it-better-warmup/celebrate.mp3",
    "script": "You caught them! Shell, pond, swim, and rock. All of them belong with a turtle, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/describe-it-better-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like shell, pond, and swim belong with a turtle. Watch for them in today's lesson. You will spot them, I know it."
  }
};
