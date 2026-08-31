import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for reading-detective (RL.K.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=reading-detective --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "reading-detective-warmup",
  "lessonId": "reading-detective",
  "lessonTitle": "Reading Detective: Find Milo!",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Farm Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on a farm!",
  "intro": {
    "audio": "/audio/warmups-v2/reading-detective-warmup/intro.mp3",
    "script": "Today's story has a farm in it! Look at each word. If it belongs on a farm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Farm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "barn",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-detective-warmup/w-barn.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "cow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-detective-warmup/w-cow.mp3"
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
          "word": "muddy",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-detective-warmup/w-muddy.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "hen",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-detective-warmup/w-hen.mp3"
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
          "word": "paw",
          "isMatch": true
        },
        {
          "word": "phone",
          "isMatch": false
        },
        {
          "word": "tractor",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-detective-warmup/w-tractor.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/reading-detective-warmup/celebrate.mp3",
    "script": "You caught it! Barn, muddy, paw, and cow. All of them belong on a farm, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/reading-detective-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like barn, muddy, and paw belong on a farm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
