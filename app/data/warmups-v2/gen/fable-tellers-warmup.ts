import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fable-tellers (RL.2.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fable-tellers --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fable-tellers-warmup",
  "lessonId": "fable-tellers",
  "lessonTitle": "Fable Tellers",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Storm Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a storm!",
  "intro": {
    "audio": "/audio/warmups-v2/fable-tellers-warmup/intro.mp3",
    "script": "Today's story has a big storm in it! Look at each word. If it belongs in a storm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Storm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-wind.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "flash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-flash.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "rain",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-rain.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "thunder",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-thunder.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "cloud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-cloud.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        },
        {
          "word": "wet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fable-tellers-warmup/w-wet.mp3"
        },
        {
          "word": "happy",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fable-tellers-warmup/celebrate.mp3",
    "script": "You caught it! Wind, rain, cloud, and flash. All of them belong in a storm, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fable-tellers-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like wind, rain, and cloud belong in a storm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
