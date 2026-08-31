import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-wonder (RL.K.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-wonder --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-wonder-warmup",
  "lessonId": "word-wonder",
  "lessonTitle": "Word Wonder",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Foxs Day Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a fox's day!",
  "intro": {
    "audio": "/audio/warmups-v2/word-wonder-warmup/intro.mp3",
    "script": "Today's story has a fox's day in it! Look at each word. If it belongs in a fox's day, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Fox's Day"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bed",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-bed.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-dog.mp3"
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
          "word": "apple",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-apple.mp3"
        },
        {
          "word": "crayon",
          "isMatch": false
        },
        {
          "word": "garden",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-garden.mp3"
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
          "word": "park",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-park.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        },
        {
          "word": "dirt",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-wonder-warmup/w-dirt.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-wonder-warmup/celebrate.mp3",
    "script": "You caught it! Bed, apple, park, and dog. All of them belong in a fox's day, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-wonder-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bed, apple, and park belong in a fox's day. Watch for them in today's lesson. You will spot them, I know it."
  }
};
