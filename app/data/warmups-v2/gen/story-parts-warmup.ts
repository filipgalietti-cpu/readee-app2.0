import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for story-parts (RL.1.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=story-parts --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "story-parts-warmup",
  "lessonId": "story-parts",
  "lessonTitle": "Story Parts",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Kite Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a kite!",
  "intro": {
    "audio": "/audio/warmups-v2/story-parts-warmup/intro.mp3",
    "script": "Today's story has a kite in it! Look at each word. If it belongs with a kite, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Kite"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "fly",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-fly.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "tail",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-tail.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "string",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-string.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "park",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-park.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-wind.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "hill",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-parts-warmup/w-hill.mp3"
        },
        {
          "word": "socks",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/story-parts-warmup/celebrate.mp3",
    "script": "You caught it! Fly, string, wind, and tail. All of them belong with a kite, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/story-parts-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like fly, string, and wind belong with a kite. Watch for them in today's lesson. You will spot them, I know it."
  }
};
