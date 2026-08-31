import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-reading-party (RI.K.10) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-reading-party --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-reading-party-warmup",
  "lessonId": "fact-reading-party",
  "lessonTitle": "Fact Reading Party",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Frog Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a frog!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-reading-party-warmup/intro.mp3",
    "script": "Today we are reading all about a frog! Look at each word. If it belongs with a frog, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Frog"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "wet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-reading-party-warmup/w-wet.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "egg",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-reading-party-warmup/w-egg.mp3"
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
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-reading-party-warmup/w-pond.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bug",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-reading-party-warmup/w-bug.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-reading-party-warmup/w-swim.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "hop",
          "isMatch": true
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-reading-party-warmup/celebrate.mp3",
    "script": "You caught them! Wet, pond, swim, and egg. All of them belong with a frog, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-reading-party-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like wet, pond, and swim belong with a frog. Watch for them in today's lesson. You will spot them, I know it."
  }
};
