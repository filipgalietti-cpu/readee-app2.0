import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for double-duty-words (K.L.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=double-duty-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "double-duty-words-warmup",
  "lessonId": "double-duty-words",
  "lessonTitle": "Double Duty Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Nature Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs in nature, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/double-duty-words-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about nature! Look at each word. If it belongs if it belongs in nature, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Nature"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-bat.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "rocks",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-rocks.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "duck",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-duck.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-tree.mp3"
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
          "word": "wave",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-wave.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/double-duty-words-warmup/w-bird.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/double-duty-words-warmup/celebrate.mp3",
    "script": "You caught them! Bat, duck, wave, and rocks. All of them belong if it belongs in nature, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/double-duty-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bat, duck, and wave belong if it belongs in nature, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
