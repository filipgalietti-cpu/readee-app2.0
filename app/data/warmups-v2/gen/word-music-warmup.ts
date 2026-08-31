import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-music (RL.2.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-music --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-music-warmup",
  "lessonId": "word-music",
  "lessonTitle": "Word Music",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Storm Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a storm!",
  "intro": {
    "audio": "/audio/warmups-v2/word-music-warmup/intro.mp3",
    "script": "Today's story has a big storm in it! Look at each word. If it belongs in a storm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Storm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "rain",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-rain.mp3"
        },
        {
          "word": "cookie",
          "isMatch": false
        },
        {
          "word": "wet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-wet.mp3"
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
          "word": "drip",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-drip.mp3"
        },
        {
          "word": "happy",
          "isMatch": false
        },
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-wind.mp3"
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
          "word": "drop",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-drop.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "cloud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-music-warmup/w-cloud.mp3"
        },
        {
          "word": "jump",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-music-warmup/celebrate.mp3",
    "script": "You caught it! Rain, drip, drop, and wet. All of them belong in a storm, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-music-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like rain, drip, and drop belong in a storm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
