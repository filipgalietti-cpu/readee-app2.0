import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for ask-and-answer-g2 (RL.2.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=ask-and-answer-g2 --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "ask-and-answer-g2-warmup",
  "lessonId": "ask-and-answer-g2",
  "lessonTitle": "Ask & Answer",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Kite Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a kite!",
  "intro": {
    "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/intro.mp3",
    "script": "Today's story has a kite in it! Look at each word. If it belongs with a kite, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Kite"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "fly",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/w-fly.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "high",
          "isMatch": true
        },
        {
          "word": "banana",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/w-wind.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "sky",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/w-sky.mp3"
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
          "word": "string",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/w-string.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "tail",
          "isMatch": true,
          "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/w-tail.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/celebrate.mp3",
    "script": "You caught it! Fly, wind, string, and high. All of them belong with a kite, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/ask-and-answer-g2-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like fly, wind, and string belong with a kite. Watch for them in today's lesson. You will spot them, I know it."
  }
};
