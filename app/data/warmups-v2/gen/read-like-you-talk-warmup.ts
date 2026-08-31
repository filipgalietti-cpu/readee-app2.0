import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for read-like-you-talk (RF.2.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=read-like-you-talk --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "read-like-you-talk-warmup",
  "lessonId": "read-like-you-talk",
  "lessonTitle": "Read Like You Talk",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Field Day Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs at field day!",
  "intro": {
    "audio": "/audio/warmups-v2/read-like-you-talk-warmup/intro.mp3",
    "script": "Today we are reading all about a fun field day! Look at each word. If it belongs at field day, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Field Day"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "race",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-like-you-talk-warmup/w-race.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "slide",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-like-you-talk-warmup/w-slide.mp3"
        },
        {
          "word": "purple",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "school",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-like-you-talk-warmup/w-school.mp3"
        },
        {
          "word": "ocean",
          "isMatch": false
        },
        {
          "word": "shoe",
          "isMatch": true
        },
        {
          "word": "candle",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "swings",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-like-you-talk-warmup/w-swings.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "win",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-like-you-talk-warmup/w-win.mp3"
        },
        {
          "word": "star",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/read-like-you-talk-warmup/celebrate.mp3",
    "script": "You caught them! Race, school, swings, and slide. All of them belong at field day, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/read-like-you-talk-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like race, school, and swings belong at field day. Watch for them in today's lesson. You will spot them, I know it."
  }
};
