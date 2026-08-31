import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for sentence-clues (L.1.4a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=sentence-clues --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "sentence-clues-warmup",
  "lessonId": "sentence-clues",
  "lessonTitle": "Sentence Clues",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Train Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on the train!",
  "intro": {
    "audio": "/audio/warmups-v2/sentence-clues-warmup/intro.mp3",
    "script": "Today we are reading all about a fast train! Look at each word. If it belongs on the train, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Train"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "rapid",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-rapid.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "track",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-track.mp3"
        },
        {
          "word": "puppy",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "zoomed",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-zoomed.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "wheel",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-wheel.mp3"
        },
        {
          "word": "frog",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "window",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-window.mp3"
        },
        {
          "word": "flower",
          "isMatch": false
        },
        {
          "word": "whistle",
          "isMatch": true,
          "audio": "/audio/warmups-v2/sentence-clues-warmup/w-whistle.mp3"
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/sentence-clues-warmup/celebrate.mp3",
    "script": "You caught them! Rapid, zoomed, window, and track. All of them belong on the train, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/sentence-clues-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like rapid, zoomed, and window belong on the train. Watch for them in today's lesson. You will spot them, I know it."
  }
};
