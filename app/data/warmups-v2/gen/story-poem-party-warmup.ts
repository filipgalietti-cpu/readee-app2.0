import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for story-poem-party (RL.1.10) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=story-poem-party --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "story-poem-party-warmup",
  "lessonId": "story-poem-party",
  "lessonTitle": "Story & Poem Party",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Night Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in the night!",
  "intro": {
    "audio": "/audio/warmups-v2/story-poem-party-warmup/intro.mp3",
    "script": "Today's story has the night in it! Look at each word. If it belongs in the night, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Night"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "moon",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-moon.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-wind.mp3"
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
          "word": "stars",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-stars.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "cricket",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-cricket.mp3"
        },
        {
          "word": "sock",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "firefly",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-firefly.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "dark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-poem-party-warmup/w-dark.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/story-poem-party-warmup/celebrate.mp3",
    "script": "You caught it! Moon, stars, firefly, and wind. All of them belong in the night, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/story-poem-party-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like moon, stars, and firefly belong in the night. Watch for them in today's lesson. You will spot them, I know it."
  }
};
