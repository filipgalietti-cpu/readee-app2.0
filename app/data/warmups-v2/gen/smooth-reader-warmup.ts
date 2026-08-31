import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for smooth-reader (RF.1.4b) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=smooth-reader --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "smooth-reader-warmup",
  "lessonId": "smooth-reader",
  "lessonTitle": "Smooth Reader",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Kite Flying Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with kite flying!",
  "intro": {
    "audio": "/audio/warmups-v2/smooth-reader-warmup/intro.mp3",
    "script": "Today's story has kite flying in it! Look at each word. If it belongs with kite flying, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Kite Flying"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/smooth-reader-warmup/w-wind.mp3"
        },
        {
          "word": "sock",
          "isMatch": false
        },
        {
          "word": "hill",
          "isMatch": true,
          "audio": "/audio/warmups-v2/smooth-reader-warmup/w-hill.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "sky",
          "isMatch": true,
          "audio": "/audio/warmups-v2/smooth-reader-warmup/w-sky.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "sunny",
          "isMatch": true,
          "audio": "/audio/warmups-v2/smooth-reader-warmup/w-sunny.mp3"
        },
        {
          "word": "crayon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "string",
          "isMatch": true,
          "audio": "/audio/warmups-v2/smooth-reader-warmup/w-string.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/smooth-reader-warmup/celebrate.mp3",
    "script": "You caught it! Wind, sky, string, and hill. All of them belong with kite flying, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/smooth-reader-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like wind, sky, and string belong with kite flying. Watch for them in today's lesson. You will spot them, I know it."
  }
};
